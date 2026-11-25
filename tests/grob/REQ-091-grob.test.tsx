/**
 * Grober Test REQ-091 – Karte „Ausgabe“: Pfeil „›“ an allen zwölf Zeilen, auch ohne Wert.
 * Aufbau aus dem feinen Test tests/acceptance/REQ-091-ausgabe-pfeile-alle-zeilen.test.tsx.
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
const leer = { get: async () => undefined, put: async () => {}, remove: async () => {} } as unknown as ImageStore;
const ALLE = ['seiten', 'format', 'masse', 'exemplar', 'sonderausgabe', 'fotos', 'preis', 'verlag', 'erschienen', 'isbn', 'hinzugefuegt', 'beendet'];

it('[REQ-091/GROB] alle zwölf Zeilen der Karte „Ausgabe“ haben einen Pfeil „›“, auch ohne Verlag/ISBN/Erschienen/Beendet', async () => {
  const b: Buch = { id: crypto.randomUUID(), titel: 'Der Testroman', status: 'ungelesen' };
  const repo = new InMemoryBookRepository();
  await repo.save(b);
  render(<BuchDetails buchId={b.id} repository={repo} bildspeicher={leer} bildquelle={{ scannen: async () => null, galerie: async () => null }} onZurueck={() => {}} />);
  const d = await screen.findByRole('region', { name: 'Buchdetails' }, W);
  const tab = await waitFor(() => d.querySelector('[data-reiter="details"]')!, W);
  await act(async () => {
    fireEvent.click(tab);
    await new Promise((r) => setTimeout(r, 15));
  });
  await waitFor(() => expect(d.querySelector('[data-reiter-bereich="details"] [data-ausgabe-karte]')).not.toBeNull(), W);
  const zeilen = Array.from(d.querySelectorAll<HTMLElement>('[data-reiter-bereich="details"] [data-ausgabe-karte] [data-ausgabe-zeile]'));
  expect(zeilen.map((z) => z.getAttribute('data-ausgabe-zeile'))).toEqual(ALLE);
  for (const z of zeilen) expect(z.querySelector('[data-zeile-pfeil]')?.textContent?.trim(), z.getAttribute('data-ausgabe-zeile')!).toBe('›');
});
