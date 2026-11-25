/**
 * Grober Test REQ-092 – „Erschienen“ im Reiter „Details“ über ein Datumsblatt ändern.
 * Aufbau aus dem feinen Test tests/acceptance/REQ-092-details-erschienen-aendern.test.tsx.
 */
import '@testing-library/jest-dom/vitest';
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import type { Buch } from '@/domain/buch';
import type { ImageStore } from '@/storage/ImageStore';
import { InMemoryBookRepository } from '@/storage/InMemoryBookRepository';
import BuchDetails from '@/views/BuchDetails';

vi.mock('@/buecher/demodaten', () => ({ demoBuecher: [] }));
afterEach(cleanup);

const W = { timeout: 4000 };
const HEUTE = new Date(2026, 10, 23, 15);
const leer = { get: async () => undefined, put: async () => {}, remove: async () => {} } as unknown as ImageStore;
const feld = () => document.querySelector<HTMLInputElement>('[data-blatt-feld="erschienen"]');
async function tippe(el: Element | null) {
  expect(el).not.toBeNull();
  await act(async () => {
    fireEvent.click(el!);
    await new Promise((r) => setTimeout(r, 30));
  });
}

it('[REQ-092/GROB] Blatt „Erschienen“ vorbefüllt; Zukunft wird abgelehnt; 01.02.2025 wird gesichert und als „Feb. 2025“ angezeigt', async () => {
  const b: Buch = { id: crypto.randomUUID(), titel: 'Der Testroman', status: 'ungelesen', erscheinungsdatum: '15.03.2021' };
  const repo = new InMemoryBookRepository();
  await repo.save(b);
  render(<BuchDetails buchId={b.id} repository={repo} jetzt={() => HEUTE} bildspeicher={leer} bildquelle={{ scannen: async () => null, galerie: async () => null }} onZurueck={() => {}} />);
  const d = await screen.findByRole('region', { name: 'Buchdetails' }, W);
  await tippe(await waitFor(() => d.querySelector('[data-reiter="details"]')!, W));
  const zeile = await waitFor(() => d.querySelector('[data-reiter-bereich="details"] [data-ausgabe-zeile="erschienen"]')!, W);
  await tippe(zeile);
  await waitFor(() => expect(feld()).not.toBeNull(), W);
  expect(feld()!.value).toBe('15.03.2021');
  fireEvent.change(feld()!, { target: { value: '24.11.2026' } });
  await tippe(document.querySelector('[data-blatt-sichern="erschienen"]'));
  expect(feld()).not.toBeNull();
  expect(feld()!.getAttribute('data-fehler')).toBe('true');
  expect((await repo.get(b.id))?.erscheinungsdatum).toBe('15.03.2021');
  fireEvent.change(feld()!, { target: { value: '01.02.2025' } });
  await tippe(document.querySelector('[data-blatt-sichern="erschienen"]'));
  await waitFor(() => expect(feld()).toBeNull(), W);
  await waitFor(async () => expect((await repo.get(b.id))?.erscheinungsdatum).toBe('01.02.2025'), W);
  await waitFor(() => expect(zeile.querySelector('[data-zeile-wert]')?.textContent?.trim()).toBe('Feb. 2025'), W);
});
