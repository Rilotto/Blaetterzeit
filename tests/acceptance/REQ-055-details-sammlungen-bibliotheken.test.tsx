/**
 * Akzeptanztests REQ-055 – Details: Abschnitt umbenannt; abgelöst durch REQ-095 bis REQ-097 (Fassung 2026-11-23).
 * Ermittelt über Rollen und Texte (Überschrift „Sagas, Sammlungen und Bibliotheken“, Pillen als Schaltflächen, Blatt role=dialog).
 */
import '@testing-library/jest-dom/vitest';
import { act, cleanup, fireEvent, render, screen, within } from '@testing-library/react';
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
const norm = (t: string | null | undefined) => (t ?? '').replace(/[\s  ]+/g, ' ').trim();
const bereich = (d: HTMLElement) => d.querySelector<HTMLElement>('[data-reiter-bereich="details"]')!;
const abschnitt = (d: HTMLElement, id: string) => bereich(d).querySelector<HTMLElement>(`[data-details-abschnitt="${id}"]`)!;
const dialoge = () => document.querySelectorAll('[role="dialog"], [data-fenster-format], [data-blatt-unten]').length;
/** Zustand für „nichts ändert sich“: DOM des Details-Bereichs, offene Fenster, gespeichertes Buch. */
async function zustand(w: Welt, d: HTMLElement, id: string) {
  return { html: bereich(d).innerHTML, dialoge: dialoge(), buch: JSON.stringify(await w.repo.get(id)) };
}

// Aus dem gemeinsamen Kopf, hier nicht alles genutzt (noUnusedLocals).
void [abschnitt, warte, zustand];
const ABSCHNITT = 'Sagas, Sammlungen und Bibliotheken';
const ueberschriften = (d: HTMLElement) => Array.from(bereich(d).querySelectorAll('h1, h2, h3, h4, [role="heading"]')).map((h) => norm(h.textContent));
/** Abschnitt ab seiner Überschrift bis zur nächsten Überschrift (Elemente dazwischen). */
function abschnittElemente(d: HTMLElement) {
  const hs = Array.from(bereich(d).querySelectorAll<HTMLElement>('h1, h2, h3, h4, [role="heading"]'));
  const i = hs.findIndex((h) => norm(h.textContent) === ABSCHNITT);
  expect(i, `Überschrift „${ABSCHNITT}“`).toBeGreaterThanOrEqual(0);
  const von = hs[i];
  const bis = hs[i + 1];
  return Array.from(bereich(d).querySelectorAll<HTMLElement>('*')).filter(
    (e) => von.compareDocumentPosition(e) & Node.DOCUMENT_POSITION_FOLLOWING && !von.contains(e) && (!bis || e.compareDocumentPosition(bis) & Node.DOCUMENT_POSITION_FOLLOWING),
  );
}
const pilleSammlung = (d: HTMLElement) =>
  abschnittElemente(d).find((e) => (e.tagName === 'BUTTON' || e.getAttribute('role') === 'button') && norm(e.textContent) === '+ Zu einer Sammlung hinzufügen');

describe('REQ-055 (abgelöst durch REQ-095) Abschnitt „Sagas, Sammlungen und Bibliotheken“', () => {
  it('[REQ-055/AK-1] der Abschnitt heißt „Sagas, Sammlungen und Bibliotheken“; „Sammlungen und Bibliotheken“ gibt es nicht mehr', async () => {
    const { d } = await mitBuch();
    const h = ueberschriften(d);
    expect(h).toContain(ABSCHNITT);
    expect(h).not.toContain('Sammlungen und Bibliotheken');
    expect(h.filter((t) => t === ABSCHNITT)).toHaveLength(1);
  });

  it('[REQ-055/AK-2] Buch in keiner Liste: „+ Zu einer Sammlung hinzufügen“ öffnet das Blatt zum Hinzufügen', async () => {
    const { d } = await mitBuch();
    expect(dialoge()).toBe(0);
    const p = pilleSammlung(d);
    expect(p, 'Pille „+ Zu einer Sammlung hinzufügen“').toBeDefined();
    await tippe(p!);
    await vi.waitFor(() => expect(screen.getAllByRole('dialog').length).toBeGreaterThan(0), W);
    const blatt = screen.getAllByRole('dialog').at(-1)!;
    expect(within(blatt).getByRole('button', { name: 'Sichern' })).toBeInTheDocument();
  });

  it('[REQ-055/AK-2] es gibt keine Karte „In Bibliotheken“ ohne Funktion (ohne Zugehörigkeit steht nur die Pille)', async () => {
    const { d } = await mitBuch();
    const texte = abschnittElemente(d).map((e) => norm(e.textContent));
    expect(texte.some((t) => /^In Bibliotheken/.test(t))).toBe(false);
    expect(abschnittElemente(d).some((e) => norm(e.textContent) === '+ Zu einer Bibliothek hinzufügen')).toBe(true);
  });
});
