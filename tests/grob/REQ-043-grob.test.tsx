/**
 * Grober Test REQ-043 – Buchdetails: Reiterleiste mit wandernder Pille.
 * Aufbau aus dem feinen Test tests/acceptance/REQ-043-buchdetails-reiterleiste.test.tsx.
 */
import '@testing-library/jest-dom/vitest';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import type { CSSProperties } from 'react';
import { afterEach, expect, it, vi } from 'vitest';
import type { Buch } from '@/domain/buch';
import type { ImageStore } from '@/storage';
import { InMemoryBookRepository } from '@/storage/InMemoryBookRepository';
import { farbVariablen } from '@/theme';
import BuchDetails from '@/views/BuchDetails';

vi.mock('@/buecher/demodaten', () => ({ demoBuecher: [] }));
afterEach(() => cleanup());

const bilder = { get: async () => undefined, put: async () => {}, remove: async () => {} } as unknown as ImageStore;
async function zeige() {
  const b: Buch = { id: crypto.randomUUID(), titel: 'Testbuch', status: 'ungelesen' };
  const repo = new InMemoryBookRepository();
  await repo.save(b);
  render(
    <div style={farbVariablen() as CSSProperties}>
      <BuchDetails buchId={b.id} repository={repo} bildspeicher={bilder} bildquelle={{ scannen: async () => null, galerie: async () => null }} onZurueck={() => {}} />
    </div>,
  );
  const d = await screen.findByRole('region', { name: 'Buchdetails' });
  await vi.waitFor(() => expect(d.querySelector('[data-reiterleiste]')).not.toBeNull());
  return d;
}
const leiste = (d: HTMLElement) => d.querySelector<HTMLElement>('[data-reiterleiste]')!;
const reiter = (d: HTMLElement) => [...leiste(d).querySelectorAll<HTMLElement>('[data-reiter]')];
const aktive = (d: HTMLElement) => reiter(d).filter((r) => r.getAttribute('data-aktiv') === 'true').map((r) => r.getAttribute('data-reiter'));

it('[REQ-043/GROB] vier Reiter, „Rezension“ aktiv; Antippen von „Notizbuch“ wechselt Reiter und Bereich', async () => {
  const d = await zeige();
  expect(reiter(d).map((x) => x.getAttribute('data-reiter'))).toEqual(['rezension', 'notizbuch', 'figuren', 'details']);
  expect(aktive(d)).toEqual(['rezension']);
  await act(async () => {
    fireEvent.click(leiste(d).querySelector('[data-reiter="notizbuch"] [data-symbol]')!);
    await new Promise((r) => setTimeout(r, 10));
  });
  expect(aktive(d)).toEqual(['notizbuch']);
  expect(d.querySelector('[data-reiter-bereich="rezension"]')).toBeNull();
  expect(d.querySelector('[data-reiter-bereich="notizbuch"]')).not.toBeNull();
});
