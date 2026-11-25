/**
 * Grober Test REQ-094 – Titel und Autor in den Buchdetails über ein Blatt ändern; leerer Titel wird abgelehnt.
 * Aufbau aus dem feinen Test tests/acceptance/REQ-094-titel-autor-aendern.test.tsx.
 */
import '@testing-library/jest-dom/vitest';
import { act, cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import type { Buch } from '@/domain/buch';
import type { ImageStore } from '@/storage/ImageStore';
import { InMemoryBookRepository } from '@/storage/InMemoryBookRepository';
import BuchDetails from '@/views/BuchDetails';

vi.mock('@/buecher/demodaten', () => ({ demoBuecher: [] }));
afterEach(cleanup);

const W = { timeout: 4000 };
const leer = { get: async () => undefined, put: async () => {}, remove: async () => {} } as unknown as ImageStore;
const blatt = () => screen.queryAllByRole('dialog').at(-1) ?? null;
const feld = () => blatt()!.querySelector<HTMLInputElement>('input:not([type="hidden"]), textarea')!;
async function tippe(el: Element | null) {
  expect(el).not.toBeNull();
  await act(async () => {
    fireEvent.click(el!);
    await new Promise((r) => setTimeout(r, 30));
  });
}
async function aendere(el: Element | null, wert: string) {
  await tippe(el);
  await waitFor(() => expect(blatt()).not.toBeNull(), W);
  fireEvent.change(feld(), { target: { value: wert } });
  await tippe(within(blatt()!).getByRole('button', { name: 'Sichern' }));
}

it('[REQ-094/GROB] Autor und Titel ändern speichert; leerer Titel bleibt offen und unverändert', async () => {
  const b: Buch = { id: crypto.randomUUID(), titel: 'Der Testroman', autor: 'Ann Leckie', status: 'ungelesen' };
  const repo = new InMemoryBookRepository();
  await repo.save(b);
  render(<BuchDetails buchId={b.id} repository={repo} bildspeicher={leer} bildquelle={{ scannen: async () => null, galerie: async () => null }} onZurueck={() => {}} />);
  const d = await screen.findByRole('region', { name: 'Buchdetails' }, W);
  await waitFor(() => expect(d.querySelector('[data-buchdetails-titel]')).not.toBeNull(), W);
  await aendere(d.querySelector('[data-buchdetails-autor]'), 'Anne Leckie');
  await waitFor(() => expect(blatt()).toBeNull(), W);
  await waitFor(() => expect(d.querySelector('[data-buchdetails-autor]')?.textContent).toContain('Anne Leckie'), W);
  await aendere(d.querySelector('[data-buchdetails-titel]'), '   ');
  expect(blatt()).not.toBeNull();
  expect(feld().getAttribute('data-fehler')).toBe('true');
  expect((await repo.get(b.id))?.titel).toBe('Der Testroman');
  fireEvent.change(feld(), { target: { value: 'Der Testroman, Band 2' } });
  await tippe(within(blatt()!).getByRole('button', { name: 'Sichern' }));
  await waitFor(() => expect(blatt()).toBeNull(), W);
  await waitFor(async () => {
    const g = await repo.get(b.id);
    expect(g?.titel).toBe('Der Testroman, Band 2');
    expect(g?.autor).toBe('Anne Leckie');
  }, W);
  expect(d.querySelector('[data-buchdetails-titel]')?.textContent).toContain('Der Testroman, Band 2');
});
