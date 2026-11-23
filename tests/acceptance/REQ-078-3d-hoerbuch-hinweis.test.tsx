/**
 * Akzeptanztests REQ-078 – 3D-Ansicht: Hinweis bei Hörbüchern.
 * Abgeleitet aus dem REQ-Text. Schnittstellen laut Entwickler (Sprint 08): Hinweis [data-hinweis-3d] role=status;
 * Cover [data-bereich="cover"]; Wartezeit DOPPELTIPP_MS. Dauer und Form des Hinweises sind kein AK.
 */
import '@testing-library/jest-dom/vitest';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import BuchDetails from '@/views/BuchDetails';
import { DOPPELTIPP_MS } from '@/buchdetails/doppeltipp';
import type { Buch } from '@/domain/buch';
import type { ImageStore } from '@/storage/ImageStore';
import { InMemoryBookRepository } from '@/storage/InMemoryBookRepository';

vi.mock('@/buecher/demodaten', () => ({ demoBuecher: [] }));
afterEach(() => {
  vi.useRealTimers();
  cleanup();
});

const W = { timeout: 3000 };
const TEXT = 'Diese Funktion ist noch nicht umgesetzt';
const leer = { get: async () => undefined, put: async () => {}, remove: async () => {} } as unknown as ImageStore;

async function zeige(m: Partial<Buch>) {
  const repo = new InMemoryBookRepository();
  const id = crypto.randomUUID();
  await repo.save({ id, titel: 'Hörbuch', status: 'ungelesen', ...m } as Buch);
  render(<BuchDetails buchId={id} repository={repo} bildspeicher={leer} bildquelle={{ scannen: async () => null, galerie: async () => null }} onZurueck={() => {}} />);
  await screen.findByRole('region', { name: 'Buchdetails' }, W);
  await vi.waitFor(() => expect(document.querySelectorAll('[data-bereich]')).toHaveLength(3), W);
}
const cover = () => document.querySelector<HTMLElement>('[data-bereich="cover"]')!;
const ansicht = () => screen.queryByRole('dialog', { name: '3D-Ansicht' });
const menue = () => screen.queryByRole('menu', { name: 'Bild hinzufügen' });
async function doppeltipp() {
  await act(async () => {
    fireEvent.click(cover());
    fireEvent.click(cover());
  });
}

describe('REQ-078 Hinweis bei Hörbüchern', () => {
  it.each([
    ['ohne Maße', {}],
    ['mit Maßen und Seitenzahl', { breiteMm: 120, hoeheMm: 190, dickeMm: 30, seitenanzahl: 400 }],
  ] as [string, Partial<Buch>][])('[REQ-078/AK-1] Hörbuch %s: Doppeltipp aufs Cover → Hinweis, keine 3D-Ansicht, kein Auswahlmenü', async (_n, m) => {
    await zeige({ format: 'hoerbuch', ...m });
    await doppeltipp();
    const h = await screen.findByRole('status', {}, W);
    expect(h.textContent?.trim()).toBe(TEXT);
    expect(h.hasAttribute('data-hinweis-3d')).toBe(true);
    await act(async () => {
      await new Promise((r) => setTimeout(r, DOPPELTIPP_MS + 150));
    });
    expect(ansicht()).toBeNull();
    expect(document.querySelector('[data-ansicht3d]')).toBeNull();
    expect(menue()).toBeNull();
  });

  it('[REQ-078/AK-1] Fake-Timer: auch lange nach dem Doppeltipp öffnet sich weder Ansicht noch Menü', async () => {
    await zeige({ format: 'hoerbuch' });
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout', 'Date'] });
    await act(async () => void fireEvent.click(cover()));
    act(() => void vi.advanceTimersByTime(DOPPELTIPP_MS / 2));
    await act(async () => void fireEvent.click(cover()));
    expect(screen.getByRole('status').textContent?.trim()).toBe(TEXT);
    act(() => void vi.advanceTimersByTime(10_000));
    expect(ansicht()).toBeNull();
    expect(menue()).toBeNull();
  });

  it.each([
    ['Print · Taschenbuch', { format: 'print', unterformat: 'taschenbuch' }],
    ['E-Book', { format: 'ebook' }],
  ] as [string, Partial<Buch>][])('[REQ-078/AK-1] Gegenfall %s: Doppeltipp öffnet die 3D-Ansicht, kein Hinweis', async (_n, m) => {
    await zeige(m);
    await doppeltipp();
    await screen.findByRole('dialog', { name: '3D-Ansicht' }, W);
    expect(screen.queryByText(TEXT)).toBeNull();
  });
});
