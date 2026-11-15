/**
 * Akzeptanztests REQ-053 – Details: Inhaltswarnungen als Pillen.
 * Schnittstellen laut Entwickler: [data-pillen=inhaltswarnungen], [data-pille-gefuellt], [data-pille-gestrichelt].
 * „Weiße Karte“ wird über Text („Deine“) und das Fehlen weiterer Inhalte außer Kopf und Pillen geprüft.
 */
import '@testing-library/jest-dom/vitest';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { IDBFactory, IDBKeyRange } from 'fake-indexeddb';
import type { ComponentType } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { Buch } from '@/domain/buch';
import type { BookRepository, ImageStore } from '@/storage';

vi.mock('@/buecher/demodaten', () => ({ demoBuecher: [] }));
beforeEach(() => {
  vi.stubGlobal('indexedDB', new IDBFactory());
  vi.stubGlobal('IDBKeyRange', IDBKeyRange);
});
afterEach(() => cleanup());

type Welt = { repo: BookRepository; BD: ComponentType<Record<string, unknown>> };
const buch = (f: Partial<Buch> = {}): Buch => ({ id: crypto.randomUUID(), titel: 'Der Testroman', status: 'ungelesen', ...f });
const bilder = { get: async () => undefined, put: async () => {}, remove: async () => {} } as unknown as ImageStore;
const W = { timeout: 3000 };
async function starte(): Promise<Welt> {
  vi.resetModules();
  const st = (await import('@/storage')) as typeof import('@/storage');
  const BD = (await import('@/views/BuchDetails')).default as unknown as ComponentType<Record<string, unknown>>;
  return { repo: st.createBookRepository(), BD };
}
async function warte(ms = 40) {
  await act(async () => {
    await new Promise((r) => setTimeout(r, ms));
  });
}
async function tippe(el: Element) {
  await act(async () => {
    fireEvent.click(el);
    await new Promise((r) => setTimeout(r, 10));
  });
}
/** Buchdetails anzeigen und Reiter „Details“ antippen. */
async function zeige(w: Welt, id: string, jetzt?: () => Date) {
  const BD = w.BD;
  const extra = jetzt ? { jetzt } : {};
  render(<BD buchId={id} {...extra} bildspeicher={bilder} bildquelle={{ scannen: async () => null, galerie: async () => null }} onZurueck={() => {}} />);
  const d = await screen.findByRole('region', { name: 'Buchdetails' });
  const tab = await vi.waitFor(() => {
    const t = d.querySelector<HTMLElement>('[data-reiter="details"]');
    expect(t).not.toBeNull();
    return t!;
  }, W);
  await tippe(tab);
  await vi.waitFor(() => expect(d.querySelector('[data-reiter-bereich="details"]')).not.toBeNull(), W);
  return d;
}
async function mitBuch(b: Buch = buch()) {
  const w = await starte();
  await w.repo.save(b);
  return { w, d: await zeige(w, b.id), id: b.id };
}
/** „Neustart“: Module neu laden, neue Repository-Instanz. */
async function gespeichert(id: string) {
  cleanup();
  const w = await starte();
  return w.repo.get(id);
}
const norm = (t: string | null | undefined) => (t ?? '').replace(/[\s  ]+/g, ' ').trim();
const bereich = (d: HTMLElement) => d.querySelector<HTMLElement>('[data-reiter-bereich="details"]')!;
const abschnitt = (d: HTMLElement, id: string) => bereich(d).querySelector<HTMLElement>(`[data-details-abschnitt="${id}"]`)!;
const dialoge = () => document.querySelectorAll('[role="dialog"], [data-fenster-format], [data-blatt-unten]').length;
/** Zustand für „nichts ändert sich“: DOM des Details-Bereichs, offene Fenster, gespeichertes Buch. */
async function zustand(w: Welt, d: HTMLElement, id: string) {
  return { html: bereich(d).innerHTML, dialoge: dialoge(), buch: JSON.stringify(await w.repo.get(id)) };
}

const pillen = (d: HTMLElement) => bereich(d).querySelector<HTMLElement>('[data-pillen="inhaltswarnungen"]')!;
const gefuellt = (d: HTMLElement) => Array.from(pillen(d).querySelectorAll('[data-pille-gefuellt]')).map((e) => norm(e.textContent));
const gestrichelt = (d: HTMLElement) => Array.from(pillen(d).querySelectorAll<HTMLElement>('[data-pille-gestrichelt]'));

describe('REQ-053 Inhaltswarnungen', () => {
  it('[REQ-053/AK-1] ohne Markierung gestrichelte Pille „+ Warnungen markieren“, keine weiße Karte, kein „Deine“', async () => {
    const { d } = await mitBuch();
    const a = abschnitt(d, 'inhaltswarnungen');
    expect(a.contains(pillen(d))).toBe(true);
    expect(gefuellt(d)).toEqual([]);
    expect(gestrichelt(d).map((e) => norm(e.textContent))).toEqual(['+ Warnungen markieren']);
    expect(a.textContent).not.toMatch(/Deine/);
    // Abschnitt enthält nur Kopfzeile (Überschrift + Bearbeiten) und die Pillen, keine weitere Karte
    const text = norm(a.textContent);
    expect(text.replace(/ /g, '')).toBe('InhaltswarnungenBearbeiten+Warnungenmarkieren');
  });

  it('[REQ-053/AK-2] zwei markierte Warnungen als gefüllte Pillen, keine gestrichelte', async () => {
    const { d } = await mitBuch(buch({ inhaltswarnungen: ['Gewalt', 'Tod'] }));
    expect(gefuellt(d)).toEqual(['Gewalt', 'Tod']);
    expect(gestrichelt(d)).toHaveLength(0);
    expect(abschnitt(d, 'inhaltswarnungen').textContent).not.toMatch(/Deine/);
  });

  it('[REQ-053/AK-2] Warnungen bleiben nach Neustart erhalten (Repository)', async () => {
    const { id } = await mitBuch(buch({ inhaltswarnungen: ['Gewalt', 'Tod'] }));
    expect((await gespeichert(id))?.inhaltswarnungen).toEqual(['Gewalt', 'Tod']);
  });

  it('[REQ-053/AK-3] gestrichelte Pille antippen: kein Fenster, nichts ändert sich', async () => {
    const b = buch();
    const { w, d } = await mitBuch(b);
    const vorher = await zustand(w, d, b.id);
    await tippe(gestrichelt(d)[0]!);
    await warte(60);
    expect(await zustand(w, d, b.id)).toEqual(vorher);
  });
});
