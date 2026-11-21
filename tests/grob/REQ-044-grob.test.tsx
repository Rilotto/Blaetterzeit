/**
 * Grober Test REQ-044 – Reiter „Rezension“: Bereich „Bewertung“ mit 14 Kriterien.
 * Aufbau aus dem feinen Test tests/acceptance/REQ-044-rezension-bereich-bewertung.test.tsx.
 */
import '@testing-library/jest-dom/vitest';
import { cleanup, render, screen } from '@testing-library/react';
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
  await vi.waitFor(() => expect(d.querySelector('[data-bereich-bewertung]')).not.toBeNull());
  return d;
}
const NAMEN = ['Sterne', 'Tempo', 'Weltenbau', 'Spice', 'Spannung', 'Action', 'Hauptfiguren', 'Nebenfiguren', 'Plot Twist', 'Tränen', 'Romantik', 'Humor', 'Grusel', 'Dialoge'];

it('[REQ-044/GROB] Bereich „Bewertung“ zeigt 14 Kriterien in fester Reihenfolge mit je fünf Symbolen', async () => {
  const d = await zeige();
  const zeilen = [...d.querySelector('[data-bereich-bewertung]')!.querySelectorAll<HTMLElement>('[data-kriterium]')];
  expect(zeilen.map((z) => z.querySelector('[data-kriterium-name]')?.textContent?.trim())).toEqual(NAMEN);
  for (const z of zeilen) expect(z.querySelectorAll('[data-symbol-nr]')).toHaveLength(5);
});
