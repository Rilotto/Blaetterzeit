/**
 * Grober Test REQ-085 – Buchfeld „Beendet am“: automatisch bei *gelesen*, überschreibbar im Reiter „Details“.
 * Aufbau aus dem feinen Test tests/acceptance/REQ-085-buchfeld-beendet-am.test.tsx.
 */
import '@testing-library/jest-dom/vitest';
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import BuchDetails from '@/views/BuchDetails';
import { statusSetzen, type Buch } from '@/domain/buch';
import type { ImageStore } from '@/storage/ImageStore';
import { InMemoryBookRepository } from '@/storage/InMemoryBookRepository';

vi.mock('@/buecher/demodaten', () => ({ demoBuecher: [] }));
afterEach(cleanup);

const W = { timeout: 4000 };
const HEUTE = new Date(2026, 10, 22, 15);
const leer = { get: async () => undefined, put: async () => {}, remove: async () => {} } as unknown as ImageStore;
const feld = () => document.querySelector<HTMLInputElement>('[data-blatt-feld="beendet"]');
async function tippe(el: Element | null) {
  expect(el).not.toBeNull();
  await act(async () => {
    fireEvent.click(el!);
    await new Promise((r) => setTimeout(r, 20));
  });
}

it('[REQ-085/GROB] Wechsel auf *gelesen* setzt heute; Überschreiben im Blatt speichert, Zukunft wird abgelehnt', async () => {
  const b = statusSetzen({ id: crypto.randomUUID(), titel: 'Der Testroman', status: 'am_lesen' } as Buch, 'gelesen', HEUTE);
  expect(b.beendetAm).toBe('2026-11-22');
  const repo = new InMemoryBookRepository();
  await repo.save(b);
  render(<BuchDetails buchId={b.id} repository={repo} jetzt={() => HEUTE} bildspeicher={leer} bildquelle={{ scannen: async () => null, galerie: async () => null }} onZurueck={() => {}} />);
  const d = await screen.findByRole('region', { name: 'Buchdetails' }, W);
  await tippe(await waitFor(() => d.querySelector('[data-reiter="details"]')!, W));
  const zeile = await waitFor(() => {
    const z = d.querySelector('[data-reiter-bereich="details"] [data-ausgabe-zeile="beendet"]');
    expect(z).not.toBeNull();
    return z!;
  }, W);
  await tippe(zeile);
  await waitFor(() => expect(feld()).not.toBeNull(), W);
  expect(feld()!.value).toBe('22.11.2026');
  fireEvent.change(feld()!, { target: { value: '23.11.2026' } });
  await tippe(document.querySelector('[data-blatt-sichern="beendet"]'));
  expect(feld()).not.toBeNull();
  expect((await repo.get(b.id))?.beendetAm).toBe('2026-11-22');
  fireEvent.change(feld()!, { target: { value: '14.03.2019' } });
  await tippe(document.querySelector('[data-blatt-sichern="beendet"]'));
  await waitFor(() => expect(feld()).toBeNull(), W);
  await waitFor(async () => expect((await repo.get(b.id))?.beendetAm).toBe('2019-03-14'), W);
});
