/**
 * Akzeptanztests REQ-055 – Details: Sammlungen und Bibliotheken (sichtbar, ohne Funktion).
 * Schnittstellen laut Entwickler: [data-details-abschnitt=sammlungen], [data-sammlung-hinzufuegen], [data-in-bibliotheken].
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

const sammlung = (d: HTMLElement) => abschnitt(d, 'sammlungen').querySelector<HTMLElement>('[data-sammlung-hinzufuegen]')!;
const bib = (d: HTMLElement) => abschnitt(d, 'sammlungen').querySelector<HTMLElement>('[data-in-bibliotheken]')!;

describe('REQ-055 Sammlungen und Bibliotheken', () => {
  it('[REQ-055/AK-1] Pille „Zu einer Sammlung hinzufügen“ und darunter Karte „In Bibliotheken“ ohne Namen', async () => {
    const { d } = await mitBuch();
    expect(norm(sammlung(d).textContent)).toBe('Zu einer Sammlung hinzufügen');
    expect(sammlung(d).compareDocumentPosition(bib(d)) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    // Nur Bezeichnung und Pfeil, kein Bibliotheksname
    expect(norm(bib(d).textContent).replace(/ /g, '')).toBe('InBibliotheken›');
  });

  it.each(['sammlung', 'bibliotheken'])('[REQ-055/AK-2] „%s“ antippen: kein Menü, kein Fenster, nichts ändert sich', async (was) => {
    const b = buch();
    const { w, d } = await mitBuch(b);
    const vorher = await zustand(w, d, b.id);
    await tippe(was === 'sammlung' ? sammlung(d) : bib(d));
    await warte(60);
    expect(await zustand(w, d, b.id)).toEqual(vorher);
    expect(document.querySelectorAll('[role="menu"]').length).toBe(0);
  });
});
