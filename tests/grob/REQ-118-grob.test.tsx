/**
 * Grober Test REQ-118 – Cover-Menü „Cover online suchen“ öffnet das Fenster; Antippen eines Treffers setzt das Frontcover.
 * Aufbau aus dem feinen Test tests/acceptance/REQ-118-cover-online-suchen.test.tsx.
 */
import '@testing-library/jest-dom/vitest';
import { act, cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import type { Treffer } from '@/barcode/treffer';
import type { Buch } from '@/domain/buch';
import { InMemoryEinstellungRepository, type BookRepository, type ImageStore } from '@/storage';
import BuchDetails from '@/views/BuchDetails';

vi.mock('@/buecher/demodaten', () => ({ demoBuecher: [] }));
vi.mock('@/bild/bildverarbeitung', async (o) => ({
  ...(await o<typeof import('@/bild/bildverarbeitung')>()),
  mittigZuschneiden: vi.fn(async (b: string) => b),
}));
afterEach(cleanup);

const W = { timeout: 4000 };
const B = 'data:image/png;base64,COVER_B';
const FW: Buch = { id: '11800000-0000-4000-8000-0000000000a1', titel: 'Fourth Wing', autor: 'Rebecca Yarros', status: 'ungelesen' };

it('[REQ-118/GROB] „Cover online suchen“ öffnet das Fenster; Treffer antippen speichert ihn als Frontcover', async () => {
  const repo = { list: async () => [FW], get: async () => ({ ...FW }), save: async () => {}, remove: async () => {} } as unknown as BookRepository;
  const daten = new Map<string, string>();
  const bilder = {
    get: async (id: string, b: string) => daten.get(`${id}|${b}`),
    put: async (id: string, b: string, d: string) => void daten.set(`${id}|${b}`, d),
    remove: async (id: string, b: string) => void daten.delete(`${id}|${b}`),
  } as unknown as ImageStore;
  const t: Treffer = { quelle: 'dnb', angaben: { titel: 'B', cover: B }, sprachen: ['ger'] };
  render(
    <BuchDetails buchId={FW.id} repository={repo} bildspeicher={bilder} coverSuche={{ suchen: vi.fn(async () => [t]) }} einstellungRepository={new InMemoryEinstellungRepository()} onZurueck={() => {}} />,
  );
  await vi.waitFor(() => expect(document.querySelector('[data-bereich="cover"]')).not.toBeNull(), W);
  fireEvent.click(document.querySelector('[data-bereich="cover"]')!);
  const m = await screen.findByRole('menu', { name: 'Bild hinzufügen' }, W);
  await act(async () => {
    fireEvent.click(within(m).getByRole('menuitem', { name: 'Cover online suchen' }));
    await new Promise((r) => setTimeout(r, 30));
  });
  await screen.findByRole('dialog', { name: 'Cover online suchen' }, W);
  await vi.waitFor(() => expect(document.querySelectorAll('[data-cover-treffer]')).toHaveLength(1), W);
  await act(async () => {
    fireEvent.click(document.querySelector('[data-cover-treffer]')!);
    await new Promise((r) => setTimeout(r, 30));
  });
  await vi.waitFor(() => expect(daten.get(`${FW.id}|cover`)).toContain(B), W);
});
