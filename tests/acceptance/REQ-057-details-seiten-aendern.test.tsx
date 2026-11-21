/**
 * Akzeptanztests REQ-057 – Seitenanzahl über die Zeile „Seiten“ ändern.
 * Schnittstellen laut Entwickler: Blatt [aria-label="Buchlänge"] mit Feld [aria-label="Seitenanzahl"], X [aria-label="Schließen"],
 * Hintergrund [data-blatt-hintergrund], Hinweis [data-hinweis]. Fortschritt [data-fortschritt-text], Statistik [data-statistik] [data-prozent].
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
async function neustartAnzeige(id: string) {
  cleanup();
  const w = await starte();
  return zeige(w, id);
}
const norm = (t: string | null | undefined) => (t ?? '').replace(/[\s  ]+/g, ' ').trim();
const bereich = (d: HTMLElement) => d.querySelector<HTMLElement>('[data-reiter-bereich="details"]')!;
const zeile = (d: HTMLElement, id: string) => bereich(d).querySelector<HTMLElement>(`[data-ausgabe-zeile="${id}"]`)!;
const wert = (d: HTMLElement, id: string) => norm(zeile(d, id).querySelector('[data-zeile-wert]')?.textContent);

const blatt = () => document.querySelector<HTMLElement>('[role="dialog"][aria-label="Buchlänge"]');
const feld = () => blatt()!.querySelector<HTMLInputElement>('[aria-label="Seitenanzahl"]')!;
const sichernKnopf = () => Array.from(blatt()!.querySelectorAll('button')).find((b) => norm(b.textContent) === 'Sichern')!;
async function oeffne(d: HTMLElement) {
  await tippe(zeile(d, 'seiten'));
  await vi.waitFor(() => expect(blatt()).not.toBeNull(), W);
}
async function gibEin(t: string) {
  await act(async () => {
    fireEvent.change(feld(), { target: { value: t } });
  });
}
async function sichern() {
  await tippe(sichernKnopf());
  await warte(60);
}
const aktuelleSeiteOffen = () => document.querySelector('[role="dialog"][aria-label="Aktuelle Seite"]') !== null;

describe('REQ-057 Seiten ändern', () => {
  it('[REQ-057/AK-1] Zeile „Seiten“ öffnet „Buchlänge“ mit 608 im Feld', async () => {
    const { d } = await mitBuch(buch({ seitenanzahl: 608 }));
    await oeffne(d);
    expect(feld().value).toBe('608');
    expect(document.querySelector('[data-blatt-hintergrund]')).not.toBeNull();
  });

  it('[REQ-057/AK-1] Grenzfall: ohne Seitenanzahl ist das Feld leer', async () => {
    const { d } = await mitBuch();
    await oeffne(d);
    expect(feld().value).toBe('');
  });

  it('[REQ-057/AK-2] 400 sichern: Menü zu, kein „Aktuelle Seite“, Zeile 400, auch nach Neustart', async () => {
    const { d, id } = await mitBuch(buch({ seitenanzahl: 608 }));
    await oeffne(d);
    await gibEin('400');
    await sichern();
    await vi.waitFor(() => expect(blatt()).toBeNull(), W);
    expect(aktuelleSeiteOffen()).toBe(false);
    await vi.waitFor(() => expect(wert(d, 'seiten')).toBe('400'), W);
    expect((await gespeichert(id))?.seitenanzahl).toBe(400);
    const d2 = await neustartAnzeige(id);
    expect(wert(d2, 'seiten')).toBe('400');
  });

  it.each(['0', '-5', '12.5', ''])('[REQ-057/AK-2] Negativfall: ungültige Eingabe „%s“ wird nicht gesichert', async (t) => {
    const { d, id } = await mitBuch(buch({ seitenanzahl: 608 }));
    await oeffne(d);
    await gibEin(t);
    await sichern();
    expect(blatt()).not.toBeNull();
    expect((await gespeichert(id))?.seitenanzahl).toBe(608);
  });

  it.each(['X', 'Außen'])('[REQ-057/AK-3] 400 eingeben, schließen über %s: bleibt 608', async (weg) => {
    const { d, id } = await mitBuch(buch({ seitenanzahl: 608 }));
    await oeffne(d);
    await gibEin('400');
    if (weg === 'X') await tippe(blatt()!.querySelector('[aria-label="Schließen"]')!);
    else await tippe(document.querySelector('[data-blatt-hintergrund]')!);
    await vi.waitFor(() => expect(blatt()).toBeNull(), W);
    expect(wert(d, 'seiten')).toBe('608');
    expect((await gespeichert(id))?.seitenanzahl).toBe(608);
  });

  it('[REQ-057/AK-4] Seite 100 von 400 → 200: Fortschritt „100 / 200“, Statistik 50 %', async () => {
    const { d } = await mitBuch(buch({ status: 'am_lesen', fortschrittsmodus: 'seite', aktuelleSeite: 100, seitenanzahl: 400 }));
    await oeffne(d);
    await gibEin('200');
    await sichern();
    await vi.waitFor(() => expect(blatt()).toBeNull(), W);
    await vi.waitFor(() => expect(norm(d.querySelector('[data-fortschritt-text]')?.textContent)).toBe('100 / 200'), W);
    expect(norm(d.querySelector('[data-statistik] [data-prozent]')?.textContent)).toMatch(/^50 ?%/);
    expect(wert(d, 'seiten')).toBe('200');
  });

  it('[REQ-057/AK-5] 200 < aktuelle Seite 250: Menü bleibt offen, bleibt 400; 250 ist sicherbar', async () => {
    const { d, id, w } = await mitBuch(buch({ status: 'am_lesen', fortschrittsmodus: 'seite', aktuelleSeite: 250, seitenanzahl: 400 }));
    await oeffne(d);
    await gibEin('200');
    await sichern();
    expect(blatt()).not.toBeNull();
    expect(blatt()!.querySelector('[data-hinweis]')).not.toBeNull();
    expect((await w.repo.get(id))?.seitenanzahl).toBe(400);
    expect(wert(d, 'seiten')).toBe('400');
    await gibEin('249');
    await sichern();
    expect(blatt()).not.toBeNull();
    expect((await w.repo.get(id))?.seitenanzahl).toBe(400);
    await gibEin('250');
    await sichern();
    await vi.waitFor(() => expect(blatt()).toBeNull(), W);
    expect((await gespeichert(id))?.seitenanzahl).toBe(250);
  });
});
