/**
 * Grober Test REQ-048 – Stufentexte unter den Kriterien.
 * Aufbau aus dem feinen Test tests/acceptance/REQ-048-bewertung-stufentexte.test.tsx.
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

const bilder = { get: async () => undefined, put: async () => {}, remove: async () => {} } as unknown as ImageStore;
const text = (d: HTMLElement, k: string) => d.querySelector(`[data-kriterium="${k}"] [data-stufentext]`)?.textContent?.trim() ?? null;

it('[REQ-048/GROB] ohne Bewertung kein Text; Sterne 3 → „Hat mir gefallen“, Tempo 5 → „Rasant, kaum Luft geholt“', async () => {
  const b: Buch = { id: crypto.randomUUID(), titel: 'Testbuch', status: 'ungelesen' };
  const repo = new InMemoryBookRepository();
  await repo.save(b);
  render(<BuchDetails buchId={b.id} repository={repo} bildspeicher={bilder} bildquelle={{ scannen: async () => null, galerie: async () => null }} onZurueck={() => {}} />);
  const d = await screen.findByRole('region', { name: 'Buchdetails' });
  await vi.waitFor(() => expect(d.querySelector('[data-bereich-bewertung]')).not.toBeNull());
  expect(text(d, 'sterne')).toBeNull();
  for (const [k, n] of [['sterne', 3], ['tempo', 5]] as const)
    await act(async () => {
      fireEvent.click(d.querySelector(`[data-kriterium="${k}"] [data-symbol-nr="${n}"]`)!);
      await new Promise((r) => setTimeout(r, 5));
    });
  expect(text(d, 'sterne')).toBe('Hat mir gefallen');
  expect(text(d, 'tempo')).toBe('Rasant, kaum Luft geholt');
  expect(text(d, 'spice')).toBeNull();
});
