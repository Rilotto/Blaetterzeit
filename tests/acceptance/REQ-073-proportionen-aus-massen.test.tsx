/**
 * Akzeptanztests REQ-073 – Buchdarstellung: Proportionen von Cover, Rücken und Schnitt aus den Maßen.
 * Abgeleitet aus dem REQ-Text. Schnittstellen laut Entwickler (Sprint 07): px-Breite und px-Höhe an [data-bereich]
 * (style width/height), Bild img[data-bereich-bild]; Zuschnitt-Eckpunkte [data-eckpunkt] mit data-x/data-y (normiert).
 * Maße im Buch: breiteMm, hoeheMm, dickeMm.
 */
import '@testing-library/jest-dom/vitest';
import { act, cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import BuchDetails from '@/views/BuchDetails';
import type { Buch } from '@/domain/buch';
import type { ImageStore } from '@/storage/ImageStore';
import { InMemoryBookRepository } from '@/storage/InMemoryBookRepository';

vi.mock('@/buecher/demodaten', () => ({ demoBuecher: [] }));
afterEach(() => cleanup());

const W = { timeout: 3000 };
const PNG = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAIAAACQd1PeAAAADElEQVR4nGP4z8AAAAMBAQDJ/pLvAAAAAElFTkSuQmCC';
type Bereich = 'ruecken' | 'cover' | 'schnitt';

function speicher(id: string, mitBildern = false) {
  const daten = new Map<string, string>();
  if (mitBildern) for (const b of ['ruecken', 'cover', 'schnitt']) daten.set(`${id}|${b}`, PNG);
  return {
    get: async (buchId: string, b: string) => daten.get(`${buchId}|${b}`),
    put: async (buchId: string, b: string, d: string) => void daten.set(`${buchId}|${b}`, d),
    remove: async (buchId: string, b: string) => void daten.delete(`${buchId}|${b}`),
  } as unknown as ImageStore;
}
async function zeige(m: Partial<Buch>, repo = new InMemoryBookRepository(), id: string = crypto.randomUUID(), bilder?: ImageStore) {
  await repo.save({ id, titel: 'Maßbuch', status: 'ungelesen', ...m });
  const s = bilder ?? speicher(id);
  render(<BuchDetails buchId={id} repository={repo} bildspeicher={s} bildquelle={{ scannen: async () => PNG, galerie: async () => PNG }} onZurueck={() => {}} />);
  await screen.findByRole('region', { name: 'Buchdetails' }, W);
  await vi.waitFor(() => expect(document.querySelectorAll('[data-bereich]')).toHaveLength(3), W);
  return { repo, id, s };
}
const el = (b: Bereich) => document.querySelector<HTMLElement>(`[data-bereich="${b}"]`)!;
const masse = (b: Bereich) => ({ w: parseFloat(el(b).style.width), h: parseFloat(el(b).style.height) });
function proportionen() {
  const c = masse('cover');
  const r = masse('ruecken');
  const s = masse('schnitt');
  return { c, r, s, cover: c.w / c.h, ruecken: r.w / c.w, schnitt: s.w / c.w };
}
function erwarte(breite: number, hoehe: number, dicke: number) {
  const p = proportionen();
  expect(p.cover).toBeCloseTo(breite / hoehe, 2);
  expect(p.ruecken).toBeCloseTo(dicke / breite, 2);
  expect(p.schnitt).toBeCloseTo(dicke / breite, 2);
  expect(p.r.h).toBeCloseTo(p.c.h, 1);
  expect(p.s.h).toBeCloseTo(p.c.h, 1);
}

describe('REQ-073 Proportionen aus den Maßen', () => {
  it('[REQ-073/AK-1] Breite 12, Höhe 18, Dicke 4: Cover 12 : 18; Rücken und Schnitt so hoch wie das Cover, Breite 4 : 12', async () => {
    await zeige({ breiteMm: 120, hoeheMm: 180, dickeMm: 40 });
    erwarte(12, 18, 4);
  });

  it('[REQ-073/AK-1] breites, dünnes Buch (Querformat 24 × 17 × 1,2) – Cover breiter als hoch', async () => {
    await zeige({ breiteMm: 240, hoeheMm: 170, dickeMm: 12 });
    erwarte(24, 17, 1.2);
    expect(proportionen().cover).toBeGreaterThan(1);
  });

  it('[REQ-073/AK-1] Werte mit Nachkommastelle (13,5 × 20,5 × 3,3)', async () => {
    await zeige({ breiteMm: 135, hoeheMm: 205, dickeMm: 33 });
    erwarte(13.5, 20.5, 3.3);
  });

  it('[REQ-073/AK-2] gleiche Breite und Höhe, Dicke 2 bzw. 5: Rücken und Schnitt beim dicken Buch breiter', async () => {
    await zeige({ breiteMm: 135, hoeheMm: 210, dickeMm: 20 });
    const duenn = proportionen();
    cleanup();
    await zeige({ breiteMm: 135, hoeheMm: 210, dickeMm: 50 });
    const dick = proportionen();
    expect(dick.ruecken).toBeGreaterThan(duenn.ruecken);
    expect(dick.schnitt).toBeGreaterThan(duenn.schnitt);
    expect(dick.ruecken / duenn.ruecken).toBeCloseTo(5 / 2, 2);
    expect(dick.cover).toBeCloseTo(duenn.cover, 3);
  });

  // Sprint 08: Standardmaße je Format nach REQ-077 (derzeit Taschenbuch 12,0 × 19,0, Hardcover 14,8 × 21,0; Dicke aus Seitenzahl)
  const TB = { format: 'print', unterformat: 'taschenbuch' } as Partial<Buch>;
  const HC = { format: 'print', unterformat: 'hardcover' } as Partial<Buch>;

  it('[REQ-073/AK-3] Taschenbuch, 400 Seiten, ohne Maße: Proportionen 12,0 × 19,0 × 2,4', async () => {
    await zeige({ ...TB, seitenanzahl: 400 });
    erwarte(12, 19, 2.4);
  });

  it('[REQ-073/AK-3] dasselbe Buch als Hardcover: Proportionen 14,8 × 21,0 × 2,8', async () => {
    await zeige({ ...HC, seitenanzahl: 400 });
    erwarte(14.8, 21, 2.8);
  });

  it.each([
    ['ohne Format, ohne Seitenzahl', {}, [12, 19, 2.5]],
    ['Kleinformat, 300 Seiten', { format: 'print', unterformat: 'kleinformat', seitenanzahl: 300 }, [10.5, 14.8, 1.9]],
    ['E-Book, 400 Seiten', { format: 'ebook', seitenanzahl: 400 }, [12, 19, 2.4]],
  ] as [string, Partial<Buch>, [number, number, number]][])('[REQ-073/AK-3] %s: Standardproportionen %j', async (_n, m, [b, h, d]) => {
    await zeige(m);
    erwarte(b, h, d);
  });

  it.each([
    [{ ...TB, dickeMm: 50 }, [12, 19, 5]],
    [{ ...TB, seitenanzahl: 400, dickeMm: 50 }, [12, 19, 5]],
    [{ ...TB, breiteMm: 100 }, [10, 19, 2.5]],
    [{ ...TB, hoeheMm: 300, seitenanzahl: 400 }, [12, 30, 2.4]],
    [{ ...TB, breiteMm: 150, hoeheMm: 230 }, [15, 23, 2.5]],
    [{ ...HC, dickeMm: 50 }, [14.8, 21, 5]],
  ] as [Partial<Buch>, [number, number, number]][])('[REQ-073/AK-4] nur %j: fehlende Einzelwerte durch Standard nach REQ-077 ersetzt → %j', async (m, [b, h, d]) => {
    await zeige(m);
    erwarte(b, h, d);
  });

  it('[REQ-073/AK-5] Bilder füllen nach Änderung der Maße die neuen Formen aus', async () => {
    const id = crypto.randomUUID();
    const bilder = speicher(id, true);
    const { repo } = await zeige({ breiteMm: 135, hoeheMm: 210, dickeMm: 20 }, undefined, id, bilder);
    await vi.waitFor(() => expect(document.querySelectorAll('img[data-bereich-bild]')).toHaveLength(3), W);
    const vorher = proportionen();
    cleanup();
    const b = (await repo.get(id))!;
    await repo.save({ ...b, breiteMm: 120, hoeheMm: 180, dickeMm: 60 });
    render(<BuchDetails buchId={id} repository={repo} bildspeicher={bilder} bildquelle={{ scannen: async () => PNG, galerie: async () => PNG }} onZurueck={() => {}} />);
    await vi.waitFor(() => expect(document.querySelectorAll('img[data-bereich-bild]')).toHaveLength(3), W);
    await vi.waitFor(() => erwarte(12, 18, 6), W);
    expect(proportionen().ruecken).not.toBeCloseTo(vorher.ruecken, 2);
    for (const bereich of ['ruecken', 'cover', 'schnitt'] as const) {
      const img = el(bereich).querySelector<HTMLElement>('img[data-bereich-bild]')!;
      const cs = getComputedStyle(img);
      expect(cs.width).toBe('100%');
      expect(cs.height).toBe('100%');
      expect(['cover', 'fill']).toContain(cs.objectFit);
    }
  });

  // ---------------------------------------------------------------- AK-6 Startrahmen
  async function startrahmen(b: Bereich, bildB = 300, bildH = 600) {
    fireEvent.click(el(b));
    const m = await screen.findByRole('menu', { name: 'Bild hinzufügen' }, W);
    fireEvent.click(within(m).getByRole('menuitem', { name: 'Aus Galerie auswählen' }));
    const z = await screen.findByRole('region', { name: 'Zuschnitt' }, W);
    const img = z.querySelector<HTMLImageElement>('[data-zuschnitt-bild] img, img')!;
    Object.defineProperty(img, 'naturalWidth', { value: bildB, configurable: true });
    Object.defineProperty(img, 'naturalHeight', { value: bildH, configurable: true });
    await act(async () => {
      fireEvent.load(img);
    });
    const p = [0, 1, 2, 3].map((i) => {
      const e = z.querySelector<HTMLElement>(`[data-eckpunkt="${i}"]`)!;
      return { x: Number(e.getAttribute('data-x')), y: Number(e.getAttribute('data-y')) };
    });
    const xs = p.map((q) => q.x);
    const ys = p.map((q) => q.y);
    const w = (Math.max(...xs) - Math.min(...xs)) * bildB;
    const h = (Math.max(...ys) - Math.min(...ys)) * bildH;
    fireEvent.click(within(z).getByRole('button', { name: 'Zurück' }));
    await vi.waitFor(() => expect(screen.queryByRole('region', { name: 'Zuschnitt' })).toBeNull(), W);
    return w / h;
  }

  it.each([
    ['cover', 12 / 18],
    ['ruecken', 4 / 18],
    ['schnitt', 4 / 18],
  ] as [Bereich, number][])('[REQ-073/AK-6] Buch 12 × 18 × 4: Startrahmen %s hat das Seitenverhältnis des Bereichs', async (b, soll) => {
    await zeige({ breiteMm: 120, hoeheMm: 180, dickeMm: 40 });
    const darstellung = b === 'cover' ? proportionen().cover : masse(b).w / masse(b).h;
    expect(await startrahmen(b)).toBeCloseTo(soll, 2);
    expect(darstellung).toBeCloseTo(soll, 2);
  });

  it('[REQ-073/AK-6] dickeres Buch → breiterer Startrahmen für den Rücken; Querformat-Bild', async () => {
    await zeige({ breiteMm: 120, hoeheMm: 180, dickeMm: 60 });
    expect(await startrahmen('ruecken', 800, 400)).toBeCloseTo(6 / 18, 2);
    expect(await startrahmen('cover', 800, 400)).toBeCloseTo(12 / 18, 2);
  });
});
