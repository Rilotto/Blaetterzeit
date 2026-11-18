/**
 * Grober Test REQ-058 – Fenster „Format“.
 * Aufbau aus dem feinen Test tests/acceptance/REQ-058-fenster-format.test.tsx.
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
const fenster = () => document.querySelector<HTMLElement>('[data-fenster-format]');
const waehle = (art: string, id: string) => tippe(fenster()!.querySelector(`[data-${art}="${id}"]`)!);

it('[REQ-058/GROB] Print/Hardcover/Geliehen sichern: Fenster zu, Zeilen aktualisiert, gespeichert', async () => {
  const { d, repo, id } = await details();
  await tippe(zeile(d, 'format'));
  await vi.waitFor(() => expect(fenster()).not.toBeNull(), W);
  await waehle('format-kachel', 'print');
  await waehle('unterformat', 'hardcover');
  await waehle('exemplar', 'geliehen');
  await tippe(fenster()!.querySelector('[data-format-sichern]')!);
  await vi.waitFor(() => expect(fenster()).toBeNull(), W);
  await vi.waitFor(() => expect(wert(d, 'format')).toBe('Print · Hardcover'), W);
  expect(wert(d, 'exemplar')).toBe('Geliehen');
  expect(await repo.get(id)).toMatchObject({ format: 'print', unterformat: 'hardcover', exemplar: 'geliehen' });
});
