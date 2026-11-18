/**
 * Grober Test REQ-063 – Details: Verlag und ISBN über ein Blatt eingeben.
 * Aufbau aus dem feinen Test tests/acceptance/REQ-063-details-verlag-isbn-eingeben.test.tsx.
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
const feld = (id: string) => document.querySelector<HTMLInputElement>(`[data-blatt-feld="${id}"]`);
async function trageEin(d: HTMLElement, id: string, t: string) {
  await tippe(zeile(d, id));
  await vi.waitFor(() => expect(feld(id)).not.toBeNull(), W);
  fireEvent.change(feld(id)!, { target: { value: t } });
  await tippe(document.querySelector(`[data-blatt-sichern="${id}"]`)!);
  await act(async () => {
    await new Promise((r) => setTimeout(r, 60));
  });
}

it('[REQ-063/GROB] Verlag und gültige ISBN werden gesichert; ungültige ISBN hält das Blatt offen und speichert nichts', async () => {
  const { d, repo, id } = await details();
  await trageEin(d, 'verlag', 'Carlsen');
  await vi.waitFor(() => expect(wert(d, 'verlag')).toBe('Carlsen'), W);
  await trageEin(d, 'isbn', '9783551551670');
  expect(feld('isbn')).not.toBeNull();
  expect(feld('isbn')!.getAttribute('aria-invalid')).toBe('true');
  expect((await repo.get(id))?.isbn).toBeUndefined();
  fireEvent.change(feld('isbn')!, { target: { value: '9783551551672' } });
  await tippe(document.querySelector('[data-blatt-sichern="isbn"]')!);
  await vi.waitFor(() => expect(feld('isbn')).toBeNull(), W);
  await vi.waitFor(() => expect(wert(d, 'isbn')).toBe('9783551551672'), W);
  expect(await repo.get(id)).toMatchObject({ verlag: 'Carlsen', isbn: '9783551551672' });
});
