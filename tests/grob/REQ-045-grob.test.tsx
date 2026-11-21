/**
 * Grober Test REQ-045 – Bewertung setzen und dauerhaft speichern.
 * Aufbau aus dem feinen Test tests/acceptance/REQ-045-bewertung-setzen.test.tsx
 * („Neustart“ = Module neu laden auf derselben fake-indexeddb).
 */
import '@testing-library/jest-dom/vitest';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { IDBFactory, IDBKeyRange } from 'fake-indexeddb';
import type { ComponentType, CSSProperties } from 'react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import type { Buch } from '@/domain/buch';
import type { BookRepository, ImageStore } from '@/storage';
import { farbVariablen } from '@/theme';

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
  render(
    <div style={farbVariablen() as CSSProperties}>
      <BD buchId={id} bildspeicher={bilder} bildquelle={{ scannen: async () => null, galerie: async () => null }} onZurueck={() => {}} />
    </div>,
  );
  const d = await screen.findByRole('region', { name: 'Buchdetails' });
  await vi.waitFor(() => expect(d.querySelector('[data-bereich-bewertung]')).not.toBeNull());
  return d;
}
const zeile = (d: HTMLElement, k: string) => d.querySelector<HTMLElement>(`[data-kriterium="${k}"]`)!;
const voll = (d: HTMLElement, k: string) => [1, 2, 3, 4, 5].map((n) => zeile(d, k).querySelector(`[data-symbol-nr="${n}"]`)!.getAttribute('data-voll') === 'true');

it('[REQ-045/GROB] drittes Tempo-Symbol antippen → Tempo = 3, bleibt nach Neustart erhalten', async () => {
  const b: Buch = { id: crypto.randomUUID(), titel: 'Testbuch', status: 'ungelesen' };
  const w = await starte();
  await w.repo.save(b);
  const d = await zeige(w, b.id);
  await act(async () => {
    fireEvent.click(zeile(d, 'tempo').querySelector('[data-symbol-nr="3"]')!);
    await new Promise((r) => setTimeout(r, 50));
  });
  expect(zeile(d, 'tempo').getAttribute('data-wert')).toBe('3');
  cleanup();
  const w2 = await starte();
  expect((await w2.repo.get(b.id))?.bewertungen).toEqual({ tempo: 3 });
  const d2 = await zeige(w2, b.id);
  expect(voll(d2, 'tempo')).toEqual([true, true, true, false, false]);
});
