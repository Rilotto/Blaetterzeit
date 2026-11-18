/**
 * Grober Test REQ-053 – Details: Inhaltswarnungen als Pillen.
 * Aufbau aus dem feinen Test tests/acceptance/REQ-053-details-inhaltswarnungen.test.tsx.
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
const pillen = (d: HTMLElement) => abschnitt(d, 'inhaltswarnungen').querySelector<HTMLElement>('[data-pillen="inhaltswarnungen"]')!;
const gefuellt = (d: HTMLElement) => Array.from(pillen(d).querySelectorAll('[data-pille-gefuellt]')).map((e) => norm(e.textContent));
const gestrichelt = (d: HTMLElement) => Array.from(pillen(d).querySelectorAll('[data-pille-gestrichelt]')).map((e) => norm(e.textContent));

it('[REQ-053/GROB] ohne Markierung „+ Warnungen markieren“; zwei markierte Warnungen als gefüllte Pillen', async () => {
  const leer = await details();
  expect(gefuellt(leer.d)).toEqual([]);
  expect(gestrichelt(leer.d)).toEqual(['+ Warnungen markieren']);
  cleanup();
  const { d } = await details(buch({ inhaltswarnungen: ['Gewalt', 'Tod'] }));
  expect(gefuellt(d)).toEqual(['Gewalt', 'Tod']);
  expect(gestrichelt(d)).toEqual([]);
});
