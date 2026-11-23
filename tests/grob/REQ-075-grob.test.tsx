/**
 * Grober Test REQ-075 – 3D-Ansicht: gerade Startansicht und Drehen durch Ziehen.
 * Aufbau aus dem feinen Test tests/acceptance/REQ-075-3d-ansicht-drehen.test.tsx.
 */
import '@testing-library/jest-dom/vitest';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import BuchDetails from '@/views/BuchDetails';
import { lageAusCss } from '@/buchdetails/ansicht3d/drehung';
import type { Buch } from '@/domain/buch';
import type { ImageStore } from '@/storage/ImageStore';
import { InMemoryBookRepository } from '@/storage/InMemoryBookRepository';

vi.mock('@/buecher/demodaten', () => ({ demoBuecher: [] }));
afterEach(() => cleanup());

const W = { timeout: 3000 };
const leer = { get: async () => undefined, put: async () => {}, remove: async () => {} } as unknown as ImageStore;
const winkel = () => {
  const q = lageAusCss(document.querySelector<HTMLElement>('[data-modell3d]')!.style.transform);
  return 2 * Math.acos(Math.min(1, Math.abs(q[3])));
};

it('[REQ-075/GROB] Startansicht ist gerade (keine Drehung); Ziehen dreht das Modell', async () => {
  const repo = new InMemoryBookRepository();
  const id = crypto.randomUUID();
  await repo.save({ id, titel: 'Der Hobbit', status: 'ungelesen', format: 'print', unterformat: 'taschenbuch', breiteMm: 120, hoeheMm: 190, dickeMm: 30 } as Buch);
  render(<BuchDetails buchId={id} repository={repo} bildspeicher={leer} bildquelle={{ scannen: async () => null, galerie: async () => null }} onZurueck={() => {}} />);
  await screen.findByRole('region', { name: 'Buchdetails' }, W);
  await vi.waitFor(() => expect(document.querySelectorAll('[data-bereich]')).toHaveLength(3), W);
  const cover = document.querySelector<HTMLElement>('[data-bereich="cover"]')!;
  await act(async () => {
    fireEvent.click(cover);
    fireEvent.click(cover);
  });
  await screen.findByRole('dialog', { name: '3D-Ansicht' }, W);
  expect(winkel()).toBeCloseTo(0, 4);
  const b = document.querySelector<HTMLElement>('[data-ansicht3d-buehne]')!;
  const P = { pointerId: 1, isPrimary: true };
  await act(async () => {
    fireEvent.pointerDown(b, { ...P, clientX: 200, clientY: 200 });
    for (let i = 1; i <= 5; i++) fireEvent.pointerMove(b, { ...P, clientX: 200 + 20 * i, clientY: 200 });
  });
  expect(winkel()).toBeGreaterThan(0.1);
});
