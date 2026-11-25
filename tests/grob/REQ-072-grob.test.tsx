/**
 * Grober Test REQ-072 – Karte „Ausgabe“: Zeile „Maße“ mit Vorschlag und Blatt „Maße“.
 * Aufbau aus dem feinen Test tests/acceptance/REQ-072-ausgabe-masse.test.tsx.
 */
import '@testing-library/jest-dom/vitest';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import BuchDetails from '@/views/BuchDetails';
import type { Buch } from '@/domain/buch';
import type { ImageStore } from '@/storage/ImageStore';
import { InMemoryBookRepository } from '@/storage/InMemoryBookRepository';

vi.mock('@/buecher/demodaten', () => ({ demoBuecher: [] }));
afterEach(() => cleanup());

const W = { timeout: 4000 };
const leer = { get: async () => undefined, put: async () => {}, remove: async () => {} } as unknown as ImageStore;
const norm = (t: string | null | undefined) => (t ?? '').replace(/[\s  ]+/g, ' ').trim();
const blatt = () => document.querySelector<HTMLElement>('[role="dialog"][aria-label="Maße"]');
const feld = (id: string) => blatt()!.querySelector<HTMLInputElement>(`[data-mass-feld="${id}"]`)!;
async function tippe(el: Element | null) {
  expect(el).not.toBeNull();
  await act(async () => {
    fireEvent.click(el!);
    await new Promise((r) => setTimeout(r, 20));
  });
}
const gib = (id: string, t: string) => act(async () => void fireEvent.change(feld(id), { target: { value: t } }));

it('[REQ-072/GROB] Zeile „Maße“ unter „Format“ mit Vorschlag „ca.“; ungültig wird abgelehnt, gültig gespeichert', async () => {
  const repo = new InMemoryBookRepository();
  const id = crypto.randomUUID();
  await repo.save({ id, titel: 'Der Testroman', status: 'ungelesen', format: 'print', unterformat: 'taschenbuch', seitenanzahl: 400 } as Buch);
  render(<BuchDetails buchId={id} repository={repo} bildspeicher={leer} bildquelle={{ scannen: async () => null, galerie: async () => null }} onZurueck={() => {}} />);
  const d = await screen.findByRole('region', { name: 'Buchdetails' }, W);
  await tippe(await vi.waitFor(() => d.querySelector('[data-reiter="details"]')!, W));
  const zeile = await vi.waitFor(() => {
    const z = d.querySelector<HTMLElement>('[data-ausgabe-zeile="masse"]');
    expect(z).not.toBeNull();
    return z!;
  }, W);
  const reihenfolge = Array.from(d.querySelectorAll('[data-ausgabe-zeile]')).map((z) => z.getAttribute('data-ausgabe-zeile'));
  expect(reihenfolge[reihenfolge.indexOf('format') + 1]).toBe('masse');
  expect(zeile.textContent).toContain('›');
  const wert = () => zeile.querySelector('[data-zeile-wert]')!;
  expect(norm(wert().textContent)).toBe('ca. 12,0 × 19,0 × 2,4 cm');
  expect(wert()).toHaveAttribute('data-zeile-vorschlag', 'true');
  await tippe(zeile);
  await vi.waitFor(() => expect(blatt()).not.toBeNull(), W);
  expect([feld('breite').value, feld('hoehe').value, feld('dicke').value]).toEqual(['12,0', '19,0', '2,4']);
  await gib('breite', '13,55');
  await tippe(blatt()!.querySelector('[data-masse-sichern]'));
  expect(blatt()).not.toBeNull();
  expect(feld('breite').getAttribute('data-fehler')).toBe('true');
  expect((await repo.get(id))?.breiteMm).toBeUndefined();
  await gib('breite', '13.5');
  await gib('hoehe', '');
  await gib('dicke', '');
  await tippe(blatt()!.querySelector('[data-masse-sichern]'));
  await vi.waitFor(() => expect(blatt()).toBeNull(), W);
  // Fassung 2026-11-25: fehlende Werte aus den Standardwerten mit „ca.“ (REQ-072 AK-4)
  await vi.waitFor(() => expect(norm(wert().textContent)).toBe('ca. 13,5 × 19,0 × 2,4 cm'), W);
  const g = await repo.get(id);
  expect([g?.breiteMm, g?.hoeheMm, g?.dickeMm]).toEqual([135, undefined, undefined]);
});
