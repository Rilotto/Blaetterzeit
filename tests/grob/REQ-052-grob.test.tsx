/**
 * Grober Test REQ-052 – Details: Genres und Tropes als Pillen.
 * Aufbau aus dem feinen Test tests/acceptance/REQ-052-details-genres-tropes.test.tsx.
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
const pillen = (d: HTMLElement, id: string) => bereich(d).querySelector<HTMLElement>(`[data-pillen="${id}"]`)!;
const gefuellt = (d: HTMLElement, id: string) => Array.from(pillen(d, id).querySelectorAll('[data-pille-gefuellt]')).map((e) => norm(e.textContent));
const gestrichelt = (d: HTMLElement, id: string) => Array.from(pillen(d, id).querySelectorAll('[data-pille-gestrichelt]')).map((e) => norm(e.textContent));

it('[REQ-052/GROB] Genres „Fantasy“, „Romance“ gefüllt; ohne Tropes gestrichelte Pille „+ Tropes hinzufügen“', async () => {
  const { d } = await details(buch({ genres: ['Fantasy', 'Romance'] }));
  expect(gefuellt(d, 'genres')).toEqual(['Fantasy', 'Romance']);
  expect(gestrichelt(d, 'genres')).toEqual([]);
  expect(gefuellt(d, 'tropes')).toEqual([]);
  expect(gestrichelt(d, 'tropes')).toEqual(['+ Tropes hinzufügen']);
});
