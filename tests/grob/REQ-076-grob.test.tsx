/**
 * Grober Test REQ-076 – 3D-Modell: Proportionen aus Maßen, Flächen ohne Bilder, Hardcover-Überstand.
 * Aufbau aus dem feinen Test tests/acceptance/REQ-076-3d-modell-gestalt.test.tsx.
 */
import '@testing-library/jest-dom/vitest';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import BuchDetails from '@/views/BuchDetails';
import type { Buch } from '@/domain/buch';
import type { ImageStore } from '@/storage/ImageStore';
import { InMemoryBookRepository } from '@/storage/InMemoryBookRepository';

vi.mock('@/buecher/demodaten', () => ({ demoBuecher: [] }));
afterEach(() => cleanup());

const W = { timeout: 3000 };
const leer = { get: async () => undefined, put: async () => {}, remove: async () => {} } as unknown as ImageStore;

async function oeffne3d(m: Partial<Buch>) {
  const repo = new InMemoryBookRepository();
  const id = crypto.randomUUID();
  await repo.save({ id, titel: 'Der Hobbit', status: 'ungelesen', ...m } as Buch);
  render(<BuchDetails buchId={id} repository={repo} bildspeicher={leer} bildquelle={{ scannen: async () => null, galerie: async () => null }} onZurueck={() => {}} />);
  await screen.findByRole('region', { name: 'Buchdetails' }, W);
  await vi.waitFor(() => expect(document.querySelectorAll('[data-bereich]')).toHaveLength(3), W);
  const cover = document.querySelector<HTMLElement>('[data-bereich="cover"]')!;
  await act(async () => {
    fireEvent.click(cover);
    fireEvent.click(cover);
  });
  await screen.findByRole('dialog', { name: '3D-Ansicht' }, W);
}
const modell = () => document.querySelector<HTMLElement>('[data-modell3d]')!;
const zahl = (n: string) => Number(modell().getAttribute(`data-modell-${n}`));
const inhalt = (s: string) => document.querySelector(`[data-modell3d] [data-flaeche="${s}"]`)?.getAttribute('data-inhalt');

it('[REQ-076/GROB] Taschenbuch 12 × 18 × 4: Proportionen stimmen, Flächen ohne Bilder Primär/Muster, kein Überstand', async () => {
  await oeffne3d({ format: 'print', unterformat: 'taschenbuch', breiteMm: 120, hoeheMm: 180, dickeMm: 40 });
  expect(zahl('breite') / zahl('hoehe')).toBeCloseTo(12 / 18, 2);
  expect(zahl('dicke') / zahl('hoehe')).toBeCloseTo(4 / 18, 2);
  for (const s of ['vorne', 'ruecken', 'hinten']) expect(inhalt(s), s).toBe('primaer');
  for (const s of ['schnitt', 'oben', 'unten']) expect(inhalt(s), s).toBe('muster');
  expect(modell().querySelector('[data-modell-titel]')?.textContent?.trim()).toBe('Der Hobbit');
  expect(modell().getAttribute('data-gestalt')).toBe('taschenbuch');
  expect(zahl('ueberstand')).toBe(0);
});

it('[REQ-076/GROB] Hardcover: Deckel überragen den Buchblock', async () => {
  await oeffne3d({ format: 'print', unterformat: 'hardcover', seitenanzahl: 400 });
  expect(modell().getAttribute('data-gestalt')).toBe('hardcover');
  expect(zahl('ueberstand')).toBeGreaterThan(0);
});
