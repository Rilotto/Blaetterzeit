/**
 * Grober Test REQ-046 – Icons und Farbrubriken der Bewertungskriterien.
 * Aufbau aus dem feinen Test tests/acceptance/REQ-046-bewertungskriterien-icons-farben.test.tsx.
 */
import '@testing-library/jest-dom/vitest';
import { cleanup, render, screen } from '@testing-library/react';
import type { CSSProperties } from 'react';
import { afterEach, expect, it, vi } from 'vitest';
import type { Buch } from '@/domain/buch';
import type { ImageStore } from '@/storage';
import { InMemoryBookRepository } from '@/storage/InMemoryBookRepository';
import { farbVariablen, kriteriumVoll, rubrikVariable } from '@/theme';
import BuchDetails from '@/views/BuchDetails';

vi.mock('@/buecher/demodaten', () => ({ demoBuecher: [] }));
afterEach(() => cleanup());

const bilder = { get: async () => undefined, put: async () => {}, remove: async () => {} } as unknown as ImageStore;
async function zeige(b: Buch) {
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
const ICON: Record<string, string> = {
  sterne: 'stern', tempo: 'funkeln', weltenbau: 'globus', spice: 'chili', spannung: 'ekg', action: 'blitz', hauptfiguren: 'personKrone',
  nebenfiguren: 'gruppe', plotTwist: 'tornado', traenen: 'tropfen', romantik: 'herz', humor: 'lachen', grusel: 'geist', dialoge: 'sprechblasen',
};
const svg = (d: HTMLElement, k: string, n: number) => d.querySelector(`[data-kriterium="${k}"] [data-symbol-nr="${n}"]`)!.querySelector<SVGElement>('[data-symbol]')!;
const farbe = (el: Element) => (el.getAttribute('style') ?? '').match(/(?:^|;)\s*color:\s*([^;]+)/)?.[1]?.trim() ?? '';

it('[REQ-046/GROB] jedes Kriterium hat sein Icon; angewähltes Symbol nutzt die Farbrubrik des Kriteriums', async () => {
  const d = await zeige({ id: crypto.randomUUID(), titel: 'Testbuch', status: 'ungelesen', bewertungen: { tempo: 2 } } as Buch);
  for (const [k, icon] of Object.entries(ICON)) expect(svg(d, k, 1).getAttribute('data-symbol'), k).toBe(icon);
  expect(farbe(svg(d, 'tempo', 1))).toBe(kriteriumVoll('tempo'));
  expect(kriteriumVoll('tempo')).toContain(rubrikVariable('tempo' as never));
});
