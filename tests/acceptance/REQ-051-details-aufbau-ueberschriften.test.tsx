/**
 * Akzeptanztests REQ-051 – Reiter „Details“: Aufbau und Überschriften.
 * Schnittstellen laut Entwickler (Sprint 05 Teil B): [data-reiter-bereich="details"], [data-details-abschnitt=id],
 * [data-abschnitt-ueberschrift], [data-details-bearbeiten=id]. Optik/Farben prüft der CEO im Prototyp.
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
const norm = (t: string | null | undefined) => (t ?? '').replace(/[\s  ]+/g, ' ').trim();
const bereich = (d: HTMLElement) => d.querySelector<HTMLElement>('[data-reiter-bereich="details"]')!;
const abschnitt = (d: HTMLElement, id: string) => bereich(d).querySelector<HTMLElement>(`[data-details-abschnitt="${id}"]`)!;
const dialoge = () => document.querySelectorAll('[role="dialog"], [data-fenster-format], [data-blatt-unten]').length;
/** Zustand für „nichts ändert sich“: DOM des Details-Bereichs, offene Fenster, gespeichertes Buch. */
async function zustand(w: Welt, d: HTMLElement, id: string) {
  return { html: bereich(d).innerHTML, dialoge: dialoge(), buch: JSON.stringify(await w.repo.get(id)) };
}

const UEBERSCHRIFTEN = ['Genres', 'Tropes', 'Inhaltswarnungen', 'Sammlungen und Bibliotheken', 'Ausgabe'];

describe('REQ-051 Details: Aufbau', () => {
  it('[REQ-051/AK-1] fünf Überschriften in fester Reihenfolge', async () => {
    const { d } = await mitBuch();
    const h = Array.from(bereich(d).querySelectorAll('[data-abschnitt-ueberschrift]')).map((e) => norm(e.textContent));
    expect(h).toEqual(UEBERSCHRIFTEN);
  });

  it('[REQ-051/AK-1] Grenzfall: auch mit gefüllten Daten genau diese fünf Überschriften', async () => {
    const { d } = await mitBuch(buch({ genres: ['Fantasy'], tropes: ['Enemies to Lovers'], inhaltswarnungen: ['Gewalt'], seitenanzahl: 300 }));
    const h = Array.from(bereich(d).querySelectorAll('[data-abschnitt-ueberschrift]')).map((e) => norm(e.textContent));
    expect(h).toEqual(UEBERSCHRIFTEN);
  });

  it('[REQ-051/AK-2] kein „under construction :)“ im Reiter „Details“', async () => {
    const { d } = await mitBuch();
    expect(bereich(d).textContent).not.toMatch(/under construction/i);
    expect(d.textContent).not.toMatch(/under construction/i);
  });

  it.each(['genres', 'tropes', 'inhaltswarnungen'])('[REQ-051/AK-3] „Bearbeiten“ rechts neben „%s“ ohne Funktion', async (id) => {
    const { w, d } = await mitBuch(buch({ genres: ['Fantasy'] }));
    const a = abschnitt(d, id);
    const h = a.querySelector<HTMLElement>('[data-abschnitt-ueberschrift]')!;
    const b = a.querySelector<HTMLElement>(`[data-details-bearbeiten="${id}"]`)!;
    expect(b).not.toBeNull();
    expect(norm(b.textContent)).toBe('Bearbeiten');
    // gleiche Kopfzeile, nach der Überschrift
    expect(b.parentElement).toBe(h.parentElement);
    expect(h.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    const id0 = (await w.repo.list())[0]!.id;
    const vorher = await zustand(w, d, id0);
    await tippe(b);
    await warte(60);
    expect(await zustand(w, d, id0)).toEqual(vorher);
  });

  it('[REQ-051/AK-3] Negativfall: „Bearbeiten“ nur bei Genres, Tropes, Inhaltswarnungen', async () => {
    const { d } = await mitBuch();
    const ids = Array.from(bereich(d).querySelectorAll('[data-details-bearbeiten]')).map((e) => e.getAttribute('data-details-bearbeiten'));
    expect(ids).toEqual(['genres', 'tropes', 'inhaltswarnungen']);
    expect(abschnitt(d, 'sammlungen').textContent).not.toContain('Bearbeiten');
    expect(abschnitt(d, 'ausgabe').textContent).not.toContain('Bearbeiten');
  });
});
