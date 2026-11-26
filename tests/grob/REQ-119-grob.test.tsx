/**
 * Grober Test REQ-119 – Sprachfilter in „Online suchen“: Standard nur Deutsch; geänderte Auswahl wird gemerkt.
 * Aufbau aus dem feinen Test tests/acceptance/REQ-119-sprachfilter-online-suche.test.tsx.
 */
import '@testing-library/jest-dom/vitest';
import { act, cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import { InMemoryEinstellungRepository, type BookRepository, type ImageStore } from '@/storage';
import BuecherAnsicht from '@/views/BuecherAnsicht';

vi.mock('@/buecher/demodaten', () => ({ demoBuecher: [] }));
afterEach(cleanup);

const W = { timeout: 4000 };
const leer = { list: async () => [], get: async () => undefined, save: async () => {}, remove: async () => {} } as unknown as BookRepository;
const bilder = { get: async () => undefined, put: async () => {}, remove: async () => {} } as unknown as ImageStore;
async function tippe(el: Element) {
  await act(async () => {
    fireEvent.click(el);
    await new Promise((r) => setTimeout(r, 25));
  });
}
async function oeffne(einst: InMemoryEinstellungRepository) {
  render(<BuecherAnsicht repository={leer} bildspeicher={bilder} onlineSuche={{ suchen: vi.fn(async () => []) }} einstellungRepository={einst} />);
  await screen.findByRole('heading', { name: 'Deine Bücher' }, W);
  await tippe(screen.getByRole('button', { name: 'Buch hinzufügen' }));
  await tippe((await screen.findByRole('menu', { name: 'Buch hinzufügen' }, W)).querySelector('[data-option="online"]')!);
  const f = await screen.findByRole('dialog', { name: 'Online suchen' }, W);
  return within(f).getByRole('group', { name: 'Sprache' });
}
const gewaehlt = (g: HTMLElement) => ['ger', 'eng'].filter((s) => g.querySelector(`[data-sprache="${s}"]`)!.getAttribute('aria-pressed') === 'true');

it('[REQ-119/GROB] Standard nur Deutsch; „Englisch“ dazu wählen → nach Neustart Deutsch und Englisch gewählt', async () => {
  const einst = new InMemoryEinstellungRepository();
  let g = await oeffne(einst);
  await vi.waitFor(() => expect(gewaehlt(g)).toEqual(['ger']), W);
  await tippe(g.querySelector('[data-sprache="eng"]')!);
  await vi.waitFor(async () => expect(JSON.parse((await einst.lesen('onlineSucheSprachen')) ?? 'null')).toEqual(['ger', 'eng']), W);
  cleanup();
  g = await oeffne(einst);
  await vi.waitFor(() => expect(gewaehlt(g)).toEqual(['ger', 'eng']), W);
});
