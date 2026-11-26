/**
 * Grober Test REQ-117 – „Online suchen“: Antippen eines Treffers öffnet „Manueller Eintrag“ mit den Angaben des Treffers.
 * Aufbau aus dem feinen Test tests/acceptance/REQ-117-online-suchen-treffer-uebernahme.test.tsx.
 */
import '@testing-library/jest-dom/vitest';
import { act, cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import type { Treffer } from '@/barcode/treffer';
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

it('[REQ-117/GROB] Treffer antippen → „Manueller Eintrag“ mit Titel und Autor des Treffers', async () => {
  const t: Treffer = { quelle: 'dnb', angaben: { titel: 'Harry Potter und der Stein der Weisen', autor: 'Rowling, J. K.' } };
  render(<BuecherAnsicht repository={leer} bildspeicher={bilder} onlineSuche={{ suchen: vi.fn(async () => [t]) }} />);
  await screen.findByRole('heading', { name: 'Deine Bücher' }, W);
  await tippe(screen.getByRole('button', { name: 'Buch hinzufügen' }));
  await tippe((await screen.findByRole('menu', { name: 'Buch hinzufügen' }, W)).querySelector('[data-option="online"]')!);
  const f = await screen.findByRole('dialog', { name: 'Online suchen' }, W);
  const sf = within(f).getByRole('searchbox', { name: 'Titel, Autor oder ISBN' });
  fireEvent.change(sf, { target: { value: 'Harry Potter' } });
  await act(async () => {
    fireEvent.keyDown(sf, { key: 'Enter', code: 'Enter', keyCode: 13 });
    await new Promise((r) => setTimeout(r, 30));
  });
  await vi.waitFor(() => expect(f.querySelectorAll('[data-online-treffer]')).toHaveLength(1), W);
  await tippe(f.querySelector('[data-online-treffer]')!);
  const b = await screen.findByRole('dialog', { name: 'Manueller Eintrag' }, W);
  expect((within(b).getByLabelText(/^\s*Titel\s*$/i) as HTMLInputElement).value).toBe('Harry Potter und der Stein der Weisen');
  expect((within(b).getByLabelText(/^\s*Autor\s*$/i) as HTMLInputElement).value).toBe('Rowling, J. K.');
});
