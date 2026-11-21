/**
 * Grober Test REQ-064 – Details: Datum „Hinzugefügt“ über ein Blatt ändern.
 * Aufbau aus dem feinen Test tests/acceptance/REQ-064-details-hinzugefuegt-aendern.test.tsx.
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
const jetzt = () => new Date(2026, 10, 17, 12, 0, 0);
const bilder = { get: async () => undefined, put: async () => {}, remove: async () => {} } as unknown as ImageStore;
async function tippe(el: Element) {
  await act(async () => {
    fireEvent.click(el);
    await new Promise((r) => setTimeout(r, 15));
  });
}
const feld = () => document.querySelector<HTMLInputElement>('[data-blatt-feld="hinzugefuegt"]');
const tag = (iso: string | undefined) => {
  const x = new Date(iso!);
  return `${String(x.getDate()).padStart(2, '0')}.${String(x.getMonth() + 1).padStart(2, '0')}.${x.getFullYear()}`;
};

it('[REQ-064/GROB] Blatt zeigt 10.11.2026; 01.02.2025 sichern speichert das Eintragungsdatum, Zukunft wird abgewiesen', async () => {
  const b: Buch = { id: crypto.randomUUID(), titel: 'Der Testroman', status: 'ungelesen', eingetragenAm: new Date(2026, 10, 10, 9, 15).toISOString() };
  const repo = new InMemoryBookRepository();
  await repo.save(b);
  render(<BuchDetails buchId={b.id} repository={repo} jetzt={jetzt} bildspeicher={bilder} bildquelle={{ scannen: async () => null, galerie: async () => null }} onZurueck={() => {}} />);
  const d = await screen.findByRole('region', { name: 'Buchdetails' }, W);
  await vi.waitFor(() => expect(d.querySelector('[data-reiter="details"]')).not.toBeNull(), W);
  await tippe(d.querySelector('[data-reiter="details"]')!);
  const zeile = await vi.waitFor(() => {
    const z = d.querySelector<HTMLElement>('[data-reiter-bereich="details"] [data-ausgabe-zeile="hinzugefuegt"]');
    expect(z).not.toBeNull();
    return z!;
  }, W);
  await tippe(zeile);
  await vi.waitFor(() => expect(feld()).not.toBeNull(), W);
  expect(feld()!.value).toBe('10.11.2026');
  const sichern = () => tippe(document.querySelector('[data-blatt-sichern="hinzugefuegt"]')!);
  fireEvent.change(feld()!, { target: { value: '18.11.2026' } });
  await sichern();
  expect(feld()).not.toBeNull();
  expect(tag((await repo.get(b.id))?.eingetragenAm)).toBe('10.11.2026');
  fireEvent.change(feld()!, { target: { value: '01.02.2025' } });
  await sichern();
  await vi.waitFor(() => expect(feld()).toBeNull(), W);
  await vi.waitFor(async () => expect(tag((await repo.get(b.id))?.eingetragenAm)).toBe('01.02.2025'), W);
});
