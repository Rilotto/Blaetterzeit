/**
 * Grober Test REQ-049 – Schreibfenster für die Rezension.
 * Aufbau aus dem feinen Test tests/acceptance/REQ-049-rezension-schreibfenster.test.tsx
 * („Neustart“ = Module neu laden auf derselben fake-indexeddb).
 */
import '@testing-library/jest-dom/vitest';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { IDBFactory, IDBKeyRange } from 'fake-indexeddb';
import type { ComponentType } from 'react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import type { Buch } from '@/domain/buch';
import type { BookRepository, ImageStore } from '@/storage';

vi.mock('@/buecher/demodaten', () => ({ demoBuecher: [] }));
beforeEach(() => {
  vi.stubGlobal('indexedDB', new IDBFactory());
  vi.stubGlobal('IDBKeyRange', IDBKeyRange);
});
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

type Welt = { repo: BookRepository; BD: ComponentType<Record<string, unknown>> };
const bilder = { get: async () => undefined, put: async () => {}, remove: async () => {} } as unknown as ImageStore;
async function starte(): Promise<Welt> {
  vi.resetModules();
  const st = (await import('@/storage')) as typeof import('@/storage');
  const BD = (await import('@/views/BuchDetails')).default as unknown as ComponentType<Record<string, unknown>>;
  return { repo: st.createBookRepository(), BD };
}
async function zeige(w: Welt, id: string) {
  const BD = w.BD;
  render(<BD buchId={id} bildspeicher={bilder} bildquelle={{ scannen: async () => null, galerie: async () => null }} onZurueck={() => {}} />);
  const d = await screen.findByRole('region', { name: 'Buchdetails' });
  await vi.waitFor(() => expect(d.querySelector('[data-schreibfeld]')).not.toBeNull());
  return d;
}
async function tippe(el: Element) {
  await act(async () => {
    fireEvent.click(el);
    await new Promise((r) => setTimeout(r, 10));
  });
}
const fenster = () => document.querySelector<HTMLElement>('[data-schreibfenster]');

it('[REQ-049/GROB] Schreibfenster zeigt Titel und Autor; gesicherte Rezension bleibt nach Neustart erhalten', async () => {
  const b: Buch = { id: crypto.randomUUID(), titel: 'Der Testroman', autor: 'Erika Muster', status: 'ungelesen' };
  const w = await starte();
  await w.repo.save(b);
  const d = await zeige(w, b.id);
  await tippe(d.querySelector('[data-schreibfeld]')!);
  await vi.waitFor(() => expect(fenster()).not.toBeNull(), { timeout: 3000 });
  expect(fenster()!.querySelector('[data-schreibfenster-titel]')!.textContent?.trim()).toBe('Der Testroman');
  expect(fenster()!.querySelector('[data-schreibfenster-autor]')!.textContent?.trim()).toBe('Erika Muster');
  fireEvent.change(fenster()!.querySelector('[data-rezension-eingabe]')!, { target: { value: 'Dauerhaft\nüber Neustart' } });
  await tippe(fenster()!.querySelector('[data-rezension-sichern]')!);
  expect(fenster()).toBeNull();
  await act(async () => {
    await new Promise((r) => setTimeout(r, 100));
  });
  cleanup();
  const d2 = await zeige(await starte(), b.id);
  expect(d2.querySelector('[data-schreibfeld] [data-rezension-text]')?.textContent).toBe('Dauerhaft\nüber Neustart');
});
