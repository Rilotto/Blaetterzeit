/**
 * Grober Test REQ-059 – Details: Preis eingeben.
 * Aufbau aus dem feinen Test tests/acceptance/REQ-059-details-preis.test.tsx.
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
const zeile = (d: HTMLElement, id: string) => bereich(d).querySelector<HTMLElement>(`[data-ausgabe-zeile="${id}"]`)!;
const wert = (d: HTMLElement, id: string) => norm(zeile(d, id).querySelector('[data-zeile-wert]')?.textContent);
const blatt = () => document.querySelector<HTMLElement>('[role="dialog"][aria-label="Preis"]');

it('[REQ-059/GROB] Menü „Preis“ startet mit „0,00 €“; „12,99“ sichern → Zeile „12,99 €“, 1299 Cent gespeichert', async () => {
  const { d, repo, id } = await details();
  await tippe(zeile(d, 'preis'));
  await vi.waitFor(() => expect(blatt()).not.toBeNull(), W);
  const feld = blatt()!.querySelector<HTMLInputElement>('[data-preis-eingabe]')!;
  expect(norm(feld.value)).toBe('0,00 €');
  await act(async () => {
    fireEvent.change(feld, { target: { value: '12,99' } });
  });
  await tippe(blatt()!.querySelector('[data-preis-sichern]')!);
  await vi.waitFor(() => expect(blatt()).toBeNull(), W);
  await vi.waitFor(() => expect(wert(d, 'preis')).toBe('12,99 €'), W);
  expect((await repo.get(id))?.preisCent).toBe(1299);
});
