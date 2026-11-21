/**
 * Grober Test REQ-047 – Bereich „Deine Rezension“ mit Schreibfeld.
 * Aufbau aus dem feinen Test tests/acceptance/REQ-047-eigene-rezension-textfeld.test.tsx.
 */
import '@testing-library/jest-dom/vitest';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import type { Buch } from '@/domain/buch';
import type { ImageStore } from '@/storage';
import { InMemoryBookRepository } from '@/storage/InMemoryBookRepository';
import BuchDetails from '@/views/BuchDetails';

vi.mock('@/buecher/demodaten', () => ({ demoBuecher: [] }));
afterEach(() => cleanup());

const bilder = { get: async () => undefined, put: async () => {}, remove: async () => {} } as unknown as ImageStore;
async function tippe(el: Element) {
  await act(async () => {
    fireEvent.click(el);
    await new Promise((r) => setTimeout(r, 10));
  });
}
const fenster = () => document.querySelector<HTMLElement>('[data-schreibfenster]');

it('[REQ-047/GROB] leeres Schreibfeld zeigt „Wie fandest du es?“; gesicherter Text erscheint und wird gespeichert', async () => {
  const b: Buch = { id: crypto.randomUUID(), titel: 'Testbuch', autor: 'Autorin X', status: 'ungelesen' };
  const repo = new InMemoryBookRepository();
  await repo.save(b);
  render(<BuchDetails buchId={b.id} repository={repo} bildspeicher={bilder} bildquelle={{ scannen: async () => null, galerie: async () => null }} onZurueck={() => {}} />);
  const d = await screen.findByRole('region', { name: 'Buchdetails' });
  await vi.waitFor(() => expect(d.querySelector('[data-bereich-rezension]')).not.toBeNull());
  const feld = () => d.querySelector<HTMLElement>('[data-bereich-rezension] [data-schreibfeld]')!;
  expect(feld().textContent).toContain('Wie fandest du es?');
  await tippe(feld());
  fireEvent.change(fenster()!.querySelector('[data-rezension-eingabe]')!, { target: { value: 'Erster Absatz.\n\nZweiter Absatz.' } });
  await tippe(fenster()!.querySelector('[data-rezension-sichern]')!);
  expect(fenster()).toBeNull();
  expect(feld().querySelector('[data-rezension-text]')?.textContent).toBe('Erster Absatz.\n\nZweiter Absatz.');
  expect(feld().textContent).not.toContain('Wie fandest du es?');
  await vi.waitFor(async () => expect((await repo.get(b.id))?.rezension).toBe('Erster Absatz.\n\nZweiter Absatz.'));
});
