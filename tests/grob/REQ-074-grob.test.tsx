/**
 * Grober Test REQ-074 – 3D-Ansicht: Öffnen per Doppeltipp aufs Cover, Aufbau, Schließen per X.
 * Aufbau aus dem feinen Test tests/acceptance/REQ-074-3d-ansicht-oeffnen.test.tsx.
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
const norm = (t: string | null | undefined) => (t ?? '').replace(/[\s  ]+/g, ' ').trim();

it('[REQ-074/GROB] Doppeltipp aufs Cover öffnet die 3D-Ansicht mit Titel, Autor und „Bearbeiten“ (kein Menü); X schließt sie', async () => {
  const repo = new InMemoryBookRepository();
  const id = crypto.randomUUID();
  await repo.save({ id, titel: 'Der Hobbit', autor: 'J. R. R. Tolkien', status: 'ungelesen', format: 'print', unterformat: 'taschenbuch' } as Buch);
  render(<BuchDetails buchId={id} repository={repo} bildspeicher={leer} bildquelle={{ scannen: async () => null, galerie: async () => null }} onZurueck={() => {}} />);
  await screen.findByRole('region', { name: 'Buchdetails' }, W);
  await vi.waitFor(() => expect(document.querySelectorAll('[data-bereich]')).toHaveLength(3), W);
  const cover = document.querySelector<HTMLElement>('[data-bereich="cover"]')!;
  await act(async () => {
    fireEvent.click(cover);
    fireEvent.click(cover);
  });
  const a = await screen.findByRole('dialog', { name: '3D-Ansicht' }, W);
  await act(async () => {
    await new Promise((r) => setTimeout(r, DOPPELTIPP_MS + 100));
  });
  expect(screen.queryByRole('menu', { name: 'Bild hinzufügen' })).toBeNull();
  expect(a.querySelector('[data-modell3d]')).not.toBeNull();
  expect(norm(a.querySelector('[data-ansicht3d-titel]')?.textContent)).toBe('Der Hobbit');
  expect(norm(a.querySelector('[data-ansicht3d-autor]')?.textContent)).toBe('J. R. R. Tolkien');
  expect(norm(a.querySelector('[data-ansicht3d-bearbeiten]')?.textContent)).toContain('Bearbeiten');
  await act(async () => void fireEvent.click(a.querySelector('[data-ansicht3d-schliessen]')!));
  await vi.waitFor(() => expect(screen.queryByRole('dialog', { name: '3D-Ansicht' })).toBeNull(), W);
  expect(screen.getByRole('region', { name: 'Buchdetails' })).toBeInTheDocument();
});
