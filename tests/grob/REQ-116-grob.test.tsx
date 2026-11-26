/**
 * Grober Test REQ-116 – Menü „Buch hinzufügen“ → „Online suchen“ öffnet das Suchfenster; Such-Taste sucht mit dem Suchtext.
 * Aufbau aus dem feinen Test tests/acceptance/REQ-116-online-suchen-option-suchfenster.test.tsx.
 */
import '@testing-library/jest-dom/vitest';
import { act, cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import type { BookRepository, ImageStore } from '@/storage';
import BuecherAnsicht from '@/views/BuecherAnsicht';

vi.mock('@/buecher/demodaten', () => ({ demoBuecher: [] }));
afterEach(cleanup);

const W = { timeout: 4000 };
const leer = { list: async () => [], get: async () => undefined, save: async () => {}, remove: async () => {} } as unknown as BookRepository;
const bilder = { get: async () => undefined, put: async () => {}, remove: async () => {} } as unknown as ImageStore;
async function tippe(el: Element) {
  await act(async () => {
    fireEvent.click(el);
    await new Promise((r) => setTimeout(r, 20));
  });
}

it('[REQ-116/GROB] „Online suchen“ öffnet das Suchfenster; Such-Taste ruft die Suche mit dem Suchtext auf', async () => {
  const suche = { suchen: vi.fn(async () => []) };
  render(<BuecherAnsicht repository={leer} bildspeicher={bilder} onlineSuche={suche} />);
  await screen.findByRole('heading', { name: 'Deine Bücher' }, W);
  await tippe(screen.getByRole('button', { name: 'Buch hinzufügen' }));
  const m = await screen.findByRole('menu', { name: 'Buch hinzufügen' }, W);
  await tippe(m.querySelector('[data-option="online"]')!);
  const f = await screen.findByRole('dialog', { name: 'Online suchen' }, W);
  const sf = within(f).getByRole('searchbox', { name: 'Titel, Autor oder ISBN' });
  fireEvent.change(sf, { target: { value: 'Fourth Wing' } });
  await act(async () => {
    fireEvent.keyDown(sf, { key: 'Enter', code: 'Enter', keyCode: 13 });
    await new Promise((r) => setTimeout(r, 30));
  });
  await vi.waitFor(() => expect(suche.suchen).toHaveBeenCalledWith('Fourth Wing', expect.anything()), W);
});
