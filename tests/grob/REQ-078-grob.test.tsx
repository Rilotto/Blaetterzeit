/**
 * Grober Test REQ-078 – Hörbuch: Doppeltipp aufs Cover zeigt Hinweis statt 3D-Ansicht.
 * Aufbau aus dem feinen Test tests/acceptance/REQ-078-3d-hoerbuch-hinweis.test.tsx.
 */
import '@testing-library/jest-dom/vitest';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import BuchDetails from '@/views/BuchDetails';
import { DOPPELTIPP_MS } from '@/buchdetails/doppeltipp';
import type { Buch } from '@/domain/buch';
import type { ImageStore } from '@/storage/ImageStore';
import { InMemoryBookRepository } from '@/storage/InMemoryBookRepository';

vi.mock('@/buecher/demodaten', () => ({ demoBuecher: [] }));
afterEach(() => cleanup());

const W = { timeout: 3000 };
const leer = { get: async () => undefined, put: async () => {}, remove: async () => {} } as unknown as ImageStore;

it('[REQ-078/GROB] Hörbuch: Doppeltipp aufs Cover zeigt den Hinweis, weder 3D-Ansicht noch Auswahlmenü', async () => {
  const repo = new InMemoryBookRepository();
  const id = crypto.randomUUID();
  await repo.save({ id, titel: 'Hörbuch', status: 'ungelesen', format: 'hoerbuch' } as Buch);
  render(<BuchDetails buchId={id} repository={repo} bildspeicher={leer} bildquelle={{ scannen: async () => null, galerie: async () => null }} onZurueck={() => {}} />);
  await screen.findByRole('region', { name: 'Buchdetails' }, W);
  await vi.waitFor(() => expect(document.querySelectorAll('[data-bereich]')).toHaveLength(3), W);
  const cover = document.querySelector<HTMLElement>('[data-bereich="cover"]')!;
  await act(async () => {
    fireEvent.click(cover);
    fireEvent.click(cover);
  });
  const h = await screen.findByRole('status', {}, W);
  expect(h.textContent?.trim()).toBe('Diese Funktion ist noch nicht umgesetzt');
  await act(async () => {
    await new Promise((r) => setTimeout(r, DOPPELTIPP_MS + 100));
  });
  expect(screen.queryByRole('dialog', { name: '3D-Ansicht' })).toBeNull();
  expect(screen.queryByRole('menu', { name: 'Bild hinzufügen' })).toBeNull();
});
