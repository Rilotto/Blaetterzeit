/**
 * Grober Test REQ-073 – Proportionen von Cover, Rücken und Schnitt aus den Maßen (fehlende Werte nach REQ-077).
 * Aufbau aus dem feinen Test tests/acceptance/REQ-073-proportionen-aus-massen.test.tsx.
 */
import '@testing-library/jest-dom/vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import BuchDetails from '@/views/BuchDetails';
import type { Buch } from '@/domain/buch';
import type { ImageStore } from '@/storage/ImageStore';
import { InMemoryBookRepository } from '@/storage/InMemoryBookRepository';

vi.mock('@/buecher/demodaten', () => ({ demoBuecher: [] }));
afterEach(() => cleanup());

const W = { timeout: 3000 };
const leer = { get: async () => undefined, put: async () => {}, remove: async () => {} } as unknown as ImageStore;
async function zeige(m: Partial<Buch>) {
  const repo = new InMemoryBookRepository();
  const id = crypto.randomUUID();
  await repo.save({ id, titel: 'Maßbuch', status: 'ungelesen', ...m } as Buch);
  render(<BuchDetails buchId={id} repository={repo} bildspeicher={leer} bildquelle={{ scannen: async () => null, galerie: async () => null }} onZurueck={() => {}} />);
  await screen.findByRole('region', { name: 'Buchdetails' }, W);
  await vi.waitFor(() => expect(document.querySelectorAll('[data-bereich]')).toHaveLength(3), W);
}
const groesse = (b: string) => {
  const e = document.querySelector<HTMLElement>(`[data-bereich="${b}"]`)!;
  return { w: parseFloat(e.style.width), h: parseFloat(e.style.height) };
};
function erwarte(breite: number, hoehe: number, dicke: number) {
  const c = groesse('cover');
  expect(c.w / c.h).toBeCloseTo(breite / hoehe, 2);
  for (const b of ['ruecken', 'schnitt']) {
    expect(groesse(b).w / c.w, b).toBeCloseTo(dicke / breite, 2);
    expect(groesse(b).h, b).toBeCloseTo(c.h, 1);
  }
}

it('[REQ-073/GROB] Proportionen aus hinterlegten Maßen; ohne Maße bzw. mit Einzelwert nach Standardmaßen', async () => {
  await zeige({ breiteMm: 120, hoeheMm: 180, dickeMm: 40 });
  erwarte(12, 18, 4);
  cleanup();
  await zeige({ format: 'print', unterformat: 'hardcover', seitenanzahl: 400 });
  erwarte(14.8, 21, 2.8);
  cleanup();
  await zeige({ format: 'print', unterformat: 'taschenbuch', dickeMm: 50 });
  erwarte(12, 19, 5);
});
