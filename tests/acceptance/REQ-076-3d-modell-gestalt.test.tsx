/**
 * Akzeptanztests REQ-076 – 3D-Ansicht: Gestalt des Modells aus Maßen, Format und Bildern.
 * Abgeleitet aus dem REQ-Text. Schnittstellen laut Entwickler (Sprint 08):
 *  - [data-modell3d][data-gestalt=taschenbuch|hardcover][data-modell-breite|hoehe|dicke|ueberstand] (px)
 *  - Flächen [data-flaeche=vorne|hinten|ruecken|schnitt|oben|unten|kante][data-inhalt=bild|primaer|muster],
 *    img[data-flaeche-bild], Titel [data-modell-titel]
 *  - Standardmaße zentral: STANDARD_MASSE_MM (src/buchdetails/masse.ts)
 * Nicht festgeschrieben (Entwickler-Annahmen): Deckeldicke, Mindestdicke der Darstellung.
 */
import '@testing-library/jest-dom/vitest';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import BuchDetails from '@/views/BuchDetails';
import { STANDARD_MASSE_MM } from '@/buchdetails/masse';
import type { Buch } from '@/domain/buch';
import type { ImageStore } from '@/storage/ImageStore';
import { InMemoryBookRepository } from '@/storage/InMemoryBookRepository';
import { farbdesigns, farbVariablenAnwenden, type FarbdesignId } from '@/theme';

vi.mock('@/buecher/demodaten', () => ({ demoBuecher: [] }));
afterEach(() => cleanup());

const W = { timeout: 3000 };
const PNG = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAIAAACQd1PeAAAADElEQVR4nGP4z8AAAAMBAQDJ/pLvAAAAAElFTkSuQmCC';
type Bereich = 'cover' | 'ruecken' | 'schnitt';

function speicher(id: string, bereiche: Bereich[]) {
  const daten = new Map<string, string>(bereiche.map((b) => [`${id}|${b}`, `${PNG}#${b}`]));
  return {
    get: async (buchId: string, b: string) => daten.get(`${buchId}|${b}`),
    put: async () => {},
    remove: async () => {},
  } as unknown as ImageStore;
}

async function oeffne3d(m: Partial<Buch> = {}, bilder: Bereich[] = [], design?: FarbdesignId) {
  const repo = new InMemoryBookRepository();
  const id = crypto.randomUUID();
  await repo.save({ id, titel: 'Der Hobbit', status: 'ungelesen', ...m } as Buch);
  const huelle = document.createElement('div');
  document.body.appendChild(huelle);
  if (design) farbVariablenAnwenden(huelle, design);
  render(<BuchDetails buchId={id} repository={repo} bildspeicher={speicher(id, bilder)} bildquelle={{ scannen: async () => null, galerie: async () => null }} onZurueck={() => {}} />, {
    container: huelle,
  });
  await screen.findByRole('region', { name: 'Buchdetails' }, W);
  await vi.waitFor(() => expect(document.querySelectorAll('[data-bereich]')).toHaveLength(3), W);
  if (bilder.length) await vi.waitFor(() => expect(document.querySelectorAll('img[data-bereich-bild]')).toHaveLength(bilder.length), W);
  const cover = document.querySelector<HTMLElement>('[data-bereich="cover"]')!;
  await act(async () => {
    fireEvent.click(cover);
    fireEvent.click(cover);
  });
  const a = await screen.findByRole('dialog', { name: '3D-Ansicht' }, W);
  if (bilder.length) await vi.waitFor(() => expect(a.querySelectorAll('img[data-flaeche-bild]').length).toBeGreaterThanOrEqual(bilder.length), W);
  return { a, huelle };
}
const modell = () => document.querySelector<HTMLElement>('[data-modell3d]')!;
const zahl = (n: string) => Number(modell().getAttribute(`data-modell-${n}`));
const flaechen = (seite: string) => [...document.querySelectorAll<HTMLElement>(`[data-modell3d] [data-flaeche="${seite}"]`)];
const flaeche = (seite: string) => {
  const f = flaechen(seite);
  expect(f, `genau eine Fläche „${seite}“`).toHaveLength(1);
  return f[0];
};
const px = (v: string) => parseFloat(v);
function erwarteVerhaeltnis(b: number, h: number, d: number) {
  expect(zahl('breite') / zahl('hoehe')).toBeCloseTo(b / h, 2);
  expect(zahl('dicke') / zahl('hoehe')).toBeCloseTo(d / h, 2);
}
/** x-Position einer Seitenfläche „rechts“: translate3d-x + translateZ (rotateY(±90deg) dreht z auf x). */
function xRechts(f: HTMLElement) {
  const t = f.style.transform;
  const tx = Number(/translate3d\(\s*(-?[\d.]+)px/.exec(t)?.[1] ?? 0);
  const tz = Number(/translateZ\(\s*(-?[\d.]+)px/.exec(t)?.[1] ?? 0);
  return tx + tz;
}
function farbeVon(ctx: HTMLElement, ausdruck: string) {
  const p = document.createElement('span');
  p.style.setProperty('background-color', ausdruck);
  ctx.appendChild(p);
  const w = getComputedStyle(p).backgroundColor;
  p.remove();
  return w;
}
const dickeStandard = (typ: keyof typeof STANDARD_MASSE_MM, seiten: number) =>
  Math.round(seiten * STANDARD_MASSE_MM[typ].dickeJeSeiteMm + STANDARD_MASSE_MM[typ].dickeGrundMm);

describe('REQ-076 Gestalt des Modells', () => {
  describe('AK-1 Proportionen aus hinterlegten Maßen', () => {
    it.each([
      [120, 180, 40],
      [240, 170, 12],
      [135, 205, 33],
    ])('[REQ-076/AK-1] Taschenbuch %i × %i × %i mm: Modell im Verhältnis Breite : Höhe : Dicke', async (b, h, d) => {
      await oeffne3d({ format: 'print', unterformat: 'taschenbuch', breiteMm: b, hoeheMm: h, dickeMm: d });
      erwarteVerhaeltnis(b, h, d);
      const v = flaeche('vorne');
      expect(px(v.style.width) / px(v.style.height)).toBeCloseTo(b / h, 2);
      const s = flaeche('schnitt');
      expect(px(s.style.width) / px(s.style.height)).toBeCloseTo(d / h, 2);
    });

    it('[REQ-076/AK-1] dickeres Buch → dickeres Modell bei gleicher Breite und Höhe', async () => {
      await oeffne3d({ format: 'print', unterformat: 'taschenbuch', breiteMm: 120, hoeheMm: 190, dickeMm: 20 });
      const duenn = zahl('dicke') / zahl('hoehe');
      cleanup();
      await oeffne3d({ format: 'print', unterformat: 'taschenbuch', breiteMm: 120, hoeheMm: 190, dickeMm: 50 });
      expect(zahl('dicke') / zahl('hoehe')).toBeCloseTo(duenn * 2.5, 2);
    });
  });

  describe('AK-2 Standardmaße ohne hinterlegte Maße', () => {
    it('[REQ-076/AK-2] Kleinformat, 300 Seiten, ohne Maße: Proportionen der Kleinformat-Standardmaße', async () => {
      await oeffne3d({ format: 'print', unterformat: 'kleinformat', seitenanzahl: 300 });
      const s = STANDARD_MASSE_MM.kleinformat;
      erwarteVerhaeltnis(s.breite, s.hoehe, dickeStandard('kleinformat', 300));
      expect(modell().getAttribute('data-gestalt')).toBe('taschenbuch');
    });

    it('[REQ-076/AK-2] nur Höhe hinterlegt: Höhe hinterlegt, Breite und Dicke Standard', async () => {
      await oeffne3d({ format: 'print', unterformat: 'kleinformat', seitenanzahl: 300, hoeheMm: 200 });
      erwarteVerhaeltnis(STANDARD_MASSE_MM.kleinformat.breite, 200, dickeStandard('kleinformat', 300));
    });
  });

  describe('AK-3 Bilder auf den Flächen', () => {
    it('[REQ-076/AK-3] Bilder für Cover, Rücken, Schnitt → Vorderseite, Rücken, Schnitt zeigen das jeweilige Bild; Rückseite Primär; Ober-/Unterkante Muster', async () => {
      await oeffne3d({ format: 'print', unterformat: 'taschenbuch' }, ['cover', 'ruecken', 'schnitt']);
      for (const [seite, b] of [
        ['vorne', 'cover'],
        ['ruecken', 'ruecken'],
        ['schnitt', 'schnitt'],
      ]) {
        const f = flaeche(seite);
        expect(f.getAttribute('data-inhalt')).toBe('bild');
        const img = f.querySelector<HTMLImageElement>('img[data-flaeche-bild]')!;
        expect(img).not.toBeNull();
        // Bild darf verkleinert sein; ohne Canvas (jsdom) ist es das Original
        expect(img.getAttribute('src')).toMatch(new RegExp(`^data:image/|#${b}$`));
        if (img.getAttribute('src')!.includes('#')) expect(img.getAttribute('src')).toBe(`${PNG}#${b}`);
      }
      expect(flaeche('hinten').getAttribute('data-inhalt')).toBe('primaer');
      expect(flaeche('oben').getAttribute('data-inhalt')).toBe('muster');
      expect(flaeche('unten').getAttribute('data-inhalt')).toBe('muster');
      expect(flaeche('hinten').querySelector('img')).toBeNull();
    });

    it('[REQ-076/AK-3] nur Coverbild: Rücken Primär, Schnitt Muster; Titeltext nicht über dem Bild', async () => {
      await oeffne3d({ format: 'print', unterformat: 'taschenbuch' }, ['cover']);
      expect(flaeche('vorne').getAttribute('data-inhalt')).toBe('bild');
      expect(flaeche('vorne').querySelector('[data-modell-titel]')).toBeNull();
      expect(flaeche('ruecken').getAttribute('data-inhalt')).toBe('primaer');
      expect(flaeche('schnitt').getAttribute('data-inhalt')).toBe('muster');
    });

    it('[REQ-076/AK-3] Hardcover mit Bildern: Bilder auf Vorderdeckel, Rücken und Schnitt', async () => {
      await oeffne3d({ format: 'print', unterformat: 'hardcover' }, ['cover', 'ruecken', 'schnitt']);
      for (const seite of ['vorne', 'ruecken', 'schnitt']) expect(flaeche(seite).getAttribute('data-inhalt'), seite).toBe('bild');
      expect(flaeche('hinten').getAttribute('data-inhalt')).toBe('primaer');
      expect(flaeche('oben').getAttribute('data-inhalt')).toBe('muster');
    });
  });

  describe('AK-4 Flächen ohne Bilder', () => {
    it('[REQ-076/AK-4] ohne Bilder: Vorderseite Primär mit „Der Hobbit“, Rücken und Rückseite Primär; Schnitt, Ober-/Unterkante Muster', async () => {
      const { huelle } = await oeffne3d({ format: 'print', unterformat: 'taschenbuch' }, [], 'klassisch');
      const v = flaeche('vorne');
      expect(v.getAttribute('data-inhalt')).toBe('primaer');
      expect(v.querySelector('[data-modell-titel]')?.textContent?.trim()).toBe('Der Hobbit');
      for (const s of ['ruecken', 'hinten']) expect(flaeche(s).getAttribute('data-inhalt'), s).toBe('primaer');
      for (const s of ['schnitt', 'oben', 'unten']) {
        const f = flaeche(s);
        expect(f.getAttribute('data-inhalt'), s).toBe('muster');
        expect(f.style.backgroundImage, s).toMatch(/gradient/);
      }
      const primaer = farbeVon(huelle, farbdesigns.klassisch.werte.primaer);
      for (const s of ['vorne', 'ruecken', 'hinten']) expect(getComputedStyle(flaeche(s)).backgroundColor, s).toBe(primaer);
      expect(document.querySelectorAll('[data-modell3d] img')).toHaveLength(0);
    });
  });

  describe('AK-5 Hardcover', () => {
    it('[REQ-076/AK-5] Hardcover: Deckel überragen den Buchblock oben, unten und vorne', async () => {
      await oeffne3d({ format: 'print', unterformat: 'hardcover', seitenanzahl: 400 });
      expect(modell().getAttribute('data-gestalt')).toBe('hardcover');
      const u = zahl('ueberstand');
      expect(u).toBeGreaterThan(0);
      const vorne = flaeche('vorne');
      const schnitt = flaeche('schnitt');
      // oben und unten: Buchblock (Schnitt) ist um 2 × Überstand niedriger als der Deckel
      expect(px(vorne.style.height) - px(schnitt.style.height)).toBeCloseTo(2 * u, 1);
      expect(px(vorne.style.height)).toBeCloseTo(zahl('hoehe'), 1);
      // vorne: Schnitt liegt um den Überstand hinter der Deckelkante
      expect(xRechts(schnitt)).toBeCloseTo(zahl('breite') / 2 - u, 1);
      // Ober-/Unterkante des Buchblocks schmaler als die Deckel
      expect(px(flaeche('oben').style.width)).toBeLessThan(px(vorne.style.width));
      expect(flaechen('kante').length).toBeGreaterThan(0);
    });

    it('[REQ-076/AK-5] Überstand im richtigen Verhältnis zu den Außenmaßen (Standard je Format)', async () => {
      await oeffne3d({ format: 'print', unterformat: 'hardcover' });
      const s = STANDARD_MASSE_MM.hardcover;
      expect(zahl('ueberstand') / zahl('hoehe')).toBeCloseTo(s.deckelUeberstandMm / s.hoehe, 3);
      expect(zahl('breite') / zahl('hoehe')).toBeCloseTo(s.breite / s.hoehe, 2);
    });

    it('[REQ-076/AK-5] dasselbe Buch als Taschenbuch: kein Überstand', async () => {
      await oeffne3d({ format: 'print', unterformat: 'taschenbuch', seitenanzahl: 400 });
      expect(modell().getAttribute('data-gestalt')).toBe('taschenbuch');
      expect(zahl('ueberstand')).toBe(0);
      const vorne = flaeche('vorne');
      const schnitt = flaeche('schnitt');
      expect(px(schnitt.style.height)).toBeCloseTo(px(vorne.style.height), 1);
      expect(xRechts(schnitt)).toBeCloseTo(zahl('breite') / 2, 1);
      expect(px(flaeche('oben').style.width)).toBeCloseTo(px(vorne.style.width), 1);
      expect(flaechen('kante')).toHaveLength(0);
    });

    it.each([
      ['Print · Kleinformat', { format: 'print', unterformat: 'kleinformat' }],
      ['Print · Weiß ich nicht', { format: 'print', unterformat: 'weissNicht' }],
      ['Print ohne Unterformat', { format: 'print' }],
      ['kein Format', {}],
    ] as [string, Partial<Buch>][])('[REQ-076/AK-5] %s → Taschenbuch-Gestalt ohne Überstand', async (_n, m) => {
      await oeffne3d(m);
      expect(modell().getAttribute('data-gestalt')).toBe('taschenbuch');
      expect(zahl('ueberstand')).toBe(0);
    });
  });

  describe('AK-6 E-Book wie Taschenbuch', () => {
    it.each([[undefined], [250]])('[REQ-076/AK-6] E-Book ohne Maße (Seiten %s) sieht aus wie dasselbe Buch als Taschenbuch', async (seiten) => {
      const basis = { seitenanzahl: seiten } as Partial<Buch>;
      await oeffne3d({ ...basis, format: 'print', unterformat: 'taschenbuch' });
      const tb = { g: modell().getAttribute('data-gestalt'), b: zahl('breite'), h: zahl('hoehe'), d: zahl('dicke'), u: zahl('ueberstand'), f: flaechen('vorne').length };
      cleanup();
      await oeffne3d({ ...basis, format: 'ebook' });
      const eb = { g: modell().getAttribute('data-gestalt'), b: zahl('breite'), h: zahl('hoehe'), d: zahl('dicke'), u: zahl('ueberstand'), f: flaechen('vorne').length };
      expect(eb).toEqual(tb);
      expect(eb.g).toBe('taschenbuch');
    });
  });

  describe('AK-7 Farbdesign', () => {
    it.each(['nachtlektuere', 'salbei'] as FarbdesignId[])('[REQ-076/AK-7] Design „%s“: Vorderseite, Rücken und Rückseite in dessen Primärfarbe', async (design) => {
      const { huelle } = await oeffne3d({ format: 'print', unterformat: 'taschenbuch' }, [], design);
      const soll = farbeVon(huelle, farbdesigns[design].werte.primaer);
      expect(soll).not.toBe(farbeVon(huelle, farbdesigns.klassisch.werte.primaer));
      for (const s of ['vorne', 'ruecken', 'hinten']) expect(getComputedStyle(flaeche(s)).backgroundColor, s).toBe(soll);
    });

    it('[REQ-076/AK-7] Hardcover im Design „Nachtlektüre“: Deckel ohne Bild in Primär', async () => {
      const { huelle } = await oeffne3d({ format: 'print', unterformat: 'hardcover' }, [], 'nachtlektuere');
      const soll = farbeVon(huelle, farbdesigns.nachtlektuere.werte.primaer);
      for (const s of ['vorne', 'ruecken', 'hinten']) expect(getComputedStyle(flaeche(s)).backgroundColor, s).toBe(soll);
    });
  });
});
