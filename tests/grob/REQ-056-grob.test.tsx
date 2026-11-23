/**
 * Grober Test REQ-056 – Details: Liste „Ausgabe“.
 * Aufbau aus dem feinen Test tests/acceptance/REQ-056-details-ausgabe-liste.test.tsx.
 */
import '@testing-library/jest-dom/vitest';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import type { Buch } from '@/domain/buch';
import type { ImageStore } from '@/storage';
import { InMemoryBookRepository } from '@/storage/InMemoryBookRepository';
import BuchDetails from '@/views/BuchDetails';

vi.mock('@/buecher/demodaten', () => ({ demoBuecher: [] }));
afterEach(() => cleanup());

const W = { timeout: 3000 };
const buch = (f: Partial<Buch> = {}): Buch => ({ id: crypto.randomUUID(), titel: 'Der Testroman', status: 'ungelesen', ...f });
const bilder = { get: async () => undefined, put: async () => {}, remove: async () => {} } as unknown as ImageStore;
async function tippe(el: Element) {
  await act(async () => {
    fireEvent.click(el);
    await new Promise((r) => setTimeout(r, 10));
  });
}
/** Buchdetails mit Reiter „Details“ öffnen. */
async function details(b: Buch = buch()) {
  const repo = new InMemoryBookRepository();
  await repo.save(b);
  render(<BuchDetails buchId={b.id} repository={repo} bildspeicher={bilder} bildquelle={{ scannen: async () => null, galerie: async () => null }} onZurueck={() => {}} />);
  const d = await screen.findByRole('region', { name: 'Buchdetails' });
  await vi.waitFor(() => expect(d.querySelector('[data-reiter="details"]')).not.toBeNull(), W);
  await tippe(d.querySelector('[data-reiter="details"]')!);
  await vi.waitFor(() => expect(d.querySelector('[data-reiter-bereich="details"]')).not.toBeNull(), W);
  return { d, repo, id: b.id };
}
const norm = (t: string | null | undefined) => (t ?? '').replace(/[\s  ]+/g, ' ').trim();
const bereich = (d: HTMLElement) => d.querySelector<HTMLElement>('[data-reiter-bereich="details"]')!;
const abschnitt = (d: HTMLElement, id: string) => bereich(d).querySelector<HTMLElement>(`[data-details-abschnitt="${id}"]`)!;
const zeile = (d: HTMLElement, id: string) => bereich(d).querySelector<HTMLElement>(`[data-ausgabe-zeile="${id}"]`)!;
const wert = (d: HTMLElement, id: string) => norm(zeile(d, id).querySelector('[data-zeile-wert]')?.textContent);

it('[REQ-056/GROB] zwölf Zeilen (mit „Maße“ laut REQ-072 und „Beendet am“ laut REQ-085) in fester Reihenfolge mit Werten aus dem Buch', async () => {
  const { d } = await details(buch({ seitenanzahl: 608, erscheinungsjahr: 2025, format: 'print', unterformat: 'taschenbuch', exemplar: 'meins' }));
  const zeilen = Array.from(abschnitt(d, 'ausgabe').querySelectorAll<HTMLElement>('[data-ausgabe-karte] [data-ausgabe-zeile]'));
  expect(zeilen.map((z) => norm(z.querySelector('[data-zeile-bezeichnung]')?.textContent))).toEqual(
    ['Seiten', 'Format', 'Maße', 'Exemplar', 'Sonderausgabe', 'Fotos', 'Preis', 'Verlag', 'Erschienen', 'ISBN', 'Hinzugefügt', 'Beendet am'],
  );
  expect(wert(d, 'seiten')).toBe('608');
  expect(wert(d, 'format')).toBe('Print · Taschenbuch');
  expect(wert(d, 'exemplar')).toBe('Meins');
  expect(wert(d, 'sonderausgabe')).toBe('Keins');
  expect(wert(d, 'erschienen')).toBe('2025');
});
