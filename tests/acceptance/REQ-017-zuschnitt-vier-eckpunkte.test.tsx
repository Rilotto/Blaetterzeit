/**
 * Akzeptanztests REQ-017 – Bild mit vier Eckpunkten zuschneiden und geradeziehen.
 *
 * Abgeleitet aus dem REQ-Text und der Schnittstellen-Absprache (sprints/sprint-03/plan.md, Runde 1):
 *  - <section aria-label="Zuschnitt"> mit <button aria-label="Zurück"> und vier Eckpunkten
 *    data-eckpunkt="0".."3" (rund, Farbe primaer); data-startformat="schmal" (Rücken, Schnitt) bzw. "cover"
 *  - Bestätigung laut REQ-Text (eine Bestätigen-Schaltfläche im Zuschnitt)
 *  - Entzerrung als reine Funktion in src/bild/entzerren.ts:
 *    entzerren(quelle: Pixelbild, ecken: Ecken [ol, or, ur, ul], ziel: { breite, hoehe }): Pixelbild,
 *    homographie(von, nach), abbilden(h, p)
 * Fachliche Prüfung der Entzerrung über Pixelbilder (bekanntes Trapez → Rechteck).
 * Die Bildverarbeitung im Browser (Canvas) gibt es in jsdom nicht; dort wird nur der Ablauf geprüft.
 */
import '@testing-library/jest-dom/vitest';
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import type { CSSProperties } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import BuchDetails from '@/views/BuchDetails';
import { abbilden, entzerren, homographie, type Ecken, type Pixelbild, type Punkt } from '@/bild/entzerren';
import type { Bildquelle } from '@/bild/bildquelle';
import type { ImageStore } from '@/storage/ImageStore';
import { farbrubriken, farbVariablen } from '@/theme';

const T = vi.hoisted(() => ({
  buecher: [{ id: '17000000-0000-4000-8000-000000000001', titel: 'Momo', status: 'ungelesen' as const }],
}));
vi.mock('@/buecher/demodaten', () => ({ demoBuecher: T.buecher }));
const BUCH = T.buecher[0];

const PNG = {
  rot: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAIAAACQd1PeAAAADElEQVR4nGP4z8AAAAMBAQDJ/pLvAAAAAElFTkSuQmCC',
  gruen: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAIAAACQd1PeAAAADElEQVR4nGNgaGAAAAEEAIFw9selAAAAAElFTkSuQmCC',
  blau: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAIAAACQd1PeAAAADElEQVR4nGNgYPgPAAEDAQAIicLsAAAAAElFTkSuQmCC',
};
type Bereich = 'ruecken' | 'cover' | 'schnitt';
const BEREICHE: Bereich[] = ['ruecken', 'cover', 'schnitt'];
const rubriken = farbrubriken as unknown as Record<string, { wert: string }>;

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

// --------------------------------------------------------------------------- Hilfen UI
function speicher(bilder: Partial<Record<Bereich, string>> = {}) {
  const daten = new Map<string, string>(Object.entries(bilder).map(([b, u]) => [`${BUCH.id}|${b}`, u!]));
  const s = {
    daten,
    get: async (buchId: string, bereich: string) => daten.get(`${buchId}|${bereich}`),
    put: async (buchId: string, bereich: string, dataUrl: string) => void daten.set(`${buchId}|${bereich}`, dataUrl),
    remove: async (buchId: string, bereich: string) => void daten.delete(`${buchId}|${bereich}`),
  };
  return s as typeof s & ImageStore;
}
async function zeige(bilder: Partial<Record<Bereich, string>> = {}, neu = PNG.blau, onZurueck = vi.fn()) {
  const s = speicher(bilder);
  const q: Bildquelle = { scannen: vi.fn(async () => neu), galerie: vi.fn(async () => neu) };
  const { container } = render(
    <div style={farbVariablen() as CSSProperties}>
      <BuchDetails buchId={BUCH.id} bildquelle={q} bildspeicher={s} onZurueck={onZurueck} />
    </div>,
  );
  await screen.findByRole('region', { name: 'Buchdetails' });
  await vi.waitFor(() => expect(document.querySelectorAll('[data-bereich]')).toHaveLength(3));
  for (const b of Object.keys(bilder) as Bereich[]) {
    await vi.waitFor(() => expect(bereich(b).querySelector('img[data-bereich-bild]')).not.toBeNull());
  }
  return { s, onZurueck, wurzel: container.firstElementChild as HTMLElement };
}
const details = () => screen.queryByRole('region', { name: 'Buchdetails' });
const zuschnitt = () => screen.queryByRole('region', { name: 'Zuschnitt' });
function bereich(b: Bereich) {
  const el = document.querySelector<HTMLElement>(`[data-bereich="${b}"]`);
  expect(el, `Bereich ${b}`).not.toBeNull();
  return el!;
}
/** Öffnet den Zuschnitt für einen Bereich über „Aus Galerie auswählen“. */
async function oeffneZuschnitt(b: Bereich) {
  fireEvent.click(bereich(b));
  const m = await screen.findByRole('menu', { name: 'Bild hinzufügen' });
  fireEvent.click(within(m).getByRole('menuitem', { name: 'Aus Galerie auswählen' }));
  return screen.findByRole('region', { name: 'Zuschnitt' });
}
const eckpunkte = (z: HTMLElement) => Array.from(z.querySelectorAll<HTMLElement>('[data-eckpunkt]'));
function bestaetigen(z: HTMLElement) {
  const ok = within(z)
    .getAllByRole('button')
    .filter((b) => (b.getAttribute('aria-label') ?? b.textContent?.trim()) !== 'Zurück' && !b.hasAttribute('data-eckpunkt'));
  expect(ok, 'genau eine Bestätigen-Schaltfläche').toHaveLength(1);
  return ok[0];
}
/** Position eines Eckpunkts aus left/top (px oder %), cx/cy (SVG) oder translate(). */
function pos(el: HTMLElement): Punkt {
  const cs = getComputedStyle(el);
  const zahl = (v: string | null) => (v == null ? NaN : parseFloat(v));
  let x = zahl(cs.left);
  let y = zahl(cs.top);
  if (Number.isNaN(x) || Number.isNaN(y)) {
    x = zahl(el.getAttribute('cx'));
    y = zahl(el.getAttribute('cy'));
  }
  if (Number.isNaN(x) || Number.isNaN(y)) {
    const m = /translate\(\s*([-\d.]+)[a-z%]*\s*,\s*([-\d.]+)/.exec(cs.transform);
    if (m) {
      x = Number(m[1]);
      y = Number(m[2]);
    }
  }
  expect(Number.isFinite(x) && Number.isFinite(y), `Position von Eckpunkt ${el.getAttribute('data-eckpunkt')}`).toBe(true);
  return { x, y };
}
const positionen = (z: HTMLElement) => eckpunkte(z).map(pos);
/** Bilden die Punkte ein achsenparalleles Rechteck (genau zwei x- und zwei y-Werte, alle Kombinationen)? */
function istRechteck(p: Punkt[]) {
  const xs = [...new Set(p.map((q) => q.x.toFixed(3)))];
  const ys = [...new Set(p.map((q) => q.y.toFixed(3)))];
  if (xs.length !== 2 || ys.length !== 2) return false;
  return xs.every((x) => ys.every((y) => p.some((q) => q.x.toFixed(3) === x && q.y.toFixed(3) === y)));
}
const rechteckMasse = (p: Punkt[]) => ({
  w: Math.max(...p.map((q) => q.x)) - Math.min(...p.map((q) => q.x)),
  h: Math.max(...p.map((q) => q.y)) - Math.min(...p.map((q) => q.y)),
});
function berechneteFarbe(ctx: HTMLElement, ausdruck: string) {
  const probe = document.createElement('span');
  probe.style.setProperty('color', ausdruck);
  ctx.appendChild(probe);
  const wert = getComputedStyle(probe).color;
  probe.remove();
  return wert;
}
function ziehe(el: HTMLElement, dx: number, dy: number) {
  const opts = { pointerId: 1, isPrimary: true, button: 0, buttons: 1, clientX: 100, clientY: 100 };
  fireEvent.pointerDown(el, opts);
  fireEvent.pointerMove(el, { ...opts, clientX: 100 + dx / 2, clientY: 100 + dy / 2 });
  fireEvent.pointerMove(el, { ...opts, clientX: 100 + dx, clientY: 100 + dy });
  fireEvent.pointerUp(el, { ...opts, clientX: 100 + dx, clientY: 100 + dy, buttons: 0 });
}
/** jsdom hat kein Layout: für das Ziehen eine feste Größe der Zuschnittfläche vorgeben. */
function layoutVorgeben(breite = 400, hoehe = 600) {
  vi.spyOn(Element.prototype, 'getBoundingClientRect').mockReturnValue({
    x: 0, y: 0, left: 0, top: 0, right: breite, bottom: hoehe, width: breite, height: hoehe, toJSON: () => ({}),
  } as DOMRect);
}

// --------------------------------------------------------------------------- Hilfen Pixel
type RGBA = [number, number, number, number];
const SCHWARZ: RGBA = [0, 0, 0, 255];
const WEISS: RGBA = [255, 255, 255, 255];
const ROT: RGBA = [255, 0, 0, 255];
const GRUEN: RGBA = [0, 255, 0, 255];
const BLAU: RGBA = [0, 0, 255, 255];
const GELB: RGBA = [255, 255, 0, 255];
function bildAus(breite: number, hoehe: number, farbe: (x: number, y: number) => RGBA): Pixelbild {
  const daten = new Uint8ClampedArray(breite * hoehe * 4);
  for (let y = 0; y < hoehe; y++) for (let x = 0; x < breite; x++) daten.set(farbe(x + 0.5, y + 0.5), (y * breite + x) * 4);
  return { breite, hoehe, daten };
}
const pixel = (b: Pixelbild, x: number, y: number) => Array.from(b.daten.slice((y * b.breite + x) * 4, (y * b.breite + x) * 4 + 4));
/** Punkt im konvexen Viereck (Ecken im Uhrzeigersinn, Bildkoordinaten)? */
function imViereck(e: Ecken, p: Punkt) {
  for (let i = 0; i < 4; i++) {
    const a = e[i];
    const b = e[(i + 1) % 4];
    if ((b.x - a.x) * (p.y - a.y) - (b.y - a.y) * (p.x - a.x) < 0) return false;
  }
  return true;
}
const nahe = (a: number[], b: number[], tol = 2) => a.every((v, i) => Math.abs(v - b[i]) <= tol);
// Schräg fotografiertes Buch: oben schmaler als unten (Trapez), Quelle 120 × 100 px.
const TRAPEZ: Ecken = [
  { x: 40, y: 15 },
  { x: 80, y: 15 },
  { x: 105, y: 90 },
  { x: 15, y: 90 },
];
const MARKER = 9;
/** Innen weiß, außen schwarz; nahe jeder Ecke eine Markerfarbe (ol rot, or grün, ur blau, ul gelb). */
const trapezBild = () =>
  bildAus(120, 100, (x, y) => {
    const p = { x, y };
    if (!imViereck(TRAPEZ, p)) return SCHWARZ;
    const farben = [ROT, GRUEN, BLAU, GELB];
    for (let i = 0; i < 4; i++) if (Math.hypot(x - TRAPEZ[i].x, y - TRAPEZ[i].y) < MARKER) return farben[i];
    return WEISS;
  });

// ===========================================================================
describe('REQ-017 Zuschnitt mit vier Eckpunkten', () => {
  describe('AK-1 Vier runde Eckpunkte in Primär', () => {
    it.each(BEREICHE)('[REQ-017/AK-1] %s: genau vier Eckpunkte 0–3 auf dem Bild', async (b) => {
      await zeige();
      const z = await oeffneZuschnitt(b);
      expect(eckpunkte(z).map((e) => e.getAttribute('data-eckpunkt')).sort()).toEqual(['0', '1', '2', '3']);
    });

    it('[REQ-017/AK-1] die Eckpunkte sind rund und in „Primär“', async () => {
      const { wurzel } = await zeige();
      const z = await oeffneZuschnitt('cover');
      for (const e of eckpunkte(z)) {
        const cs = getComputedStyle(e);
        const rund = e.tagName.toLowerCase() === 'circle' || /^50%$|^9{2,}px$|^\d{3,}px$/.test(cs.borderRadius) || cs.borderRadius === '50%';
        expect(rund, `Eckpunkt ${e.getAttribute('data-eckpunkt')} rund (border-radius ${cs.borderRadius})`).toBe(true);
        expect(`${e.getAttribute('style')} ${e.getAttribute('fill')}`).toContain('var(--bz-farbe-primaer)');
        expect([cs.backgroundColor, cs.fill, cs.color]).toContain(berechneteFarbe(wurzel, rubriken.primaer.wert));
      }
    });

    it('[REQ-017/AK-1] Änderung von „Primär“ an zentraler Stelle wirkt auf die Eckpunkte', async () => {
      const r = rubriken.primaer;
      const alt = r.wert;
      r.wert = rubriken.tertiaer.wert;
      try {
        const { wurzel } = await zeige();
        const z = await oeffneZuschnitt('ruecken');
        for (const e of eckpunkte(z)) {
          const cs = getComputedStyle(e);
          expect([cs.backgroundColor, cs.fill, cs.color]).toContain(berechneteFarbe(wurzel, r.wert));
        }
      } finally {
        r.wert = alt;
      }
    });
  });

  describe('AK-2 Startposition als Rechteck', () => {
    it.each(BEREICHE)('[REQ-017/AK-2] %s: die vier Eckpunkte bilden zu Beginn ein Rechteck mit Fläche', async (b) => {
      await zeige();
      const z = await oeffneZuschnitt(b);
      const p = positionen(z);
      expect(istRechteck(p), JSON.stringify(p)).toBe(true);
      const m = rechteckMasse(p);
      expect(m.w).toBeGreaterThan(0);
      expect(m.h).toBeGreaterThan(0);
    });
  });

  describe('AK-7 Schmaler Startrahmen für Buchrücken und Schnitt', () => {
    it.each(['ruecken', 'schnitt'] as const)('[REQ-017/AK-7] %s: Startformat „schmal“, hochformatig', async (b) => {
      await zeige();
      const z = await oeffneZuschnitt(b);
      expect(z.querySelector('[data-startformat]')?.getAttribute('data-startformat') ?? z.getAttribute('data-startformat')).toBe('schmal');
      const m = rechteckMasse(positionen(z));
      expect(m.h).toBeGreaterThan(m.w);
    });

    it('[REQ-017/AK-7] Rücken und Schnitt haben denselben Startrahmen', async () => {
      await zeige();
      const r = positionen(await oeffneZuschnitt('ruecken'));
      fireEvent.click(within(zuschnitt()!).getByRole('button', { name: 'Zurück' }));
      await vi.waitFor(() => expect(zuschnitt()).toBeNull());
      const s = positionen(await oeffneZuschnitt('schnitt'));
      expect(s).toEqual(r);
    });
  });

  describe('AK-8 Breiter Startrahmen für das Cover', () => {
    it('[REQ-017/AK-8] Cover: Startformat „cover“, im Verhältnis breiter als der schmale Startrahmen', async () => {
      await zeige();
      const zc = await oeffneZuschnitt('cover');
      expect(zc.querySelector('[data-startformat]')?.getAttribute('data-startformat') ?? zc.getAttribute('data-startformat')).toBe('cover');
      const c = rechteckMasse(positionen(zc));
      fireEvent.click(within(zc).getByRole('button', { name: 'Zurück' }));
      await vi.waitFor(() => expect(zuschnitt()).toBeNull());
      const r = rechteckMasse(positionen(await oeffneZuschnitt('ruecken')));
      expect(c.w / c.h).toBeGreaterThan(r.w / r.h);
    });

    it('[REQ-017/AK-7] [REQ-017/AK-8] Verhältnis der Startrahmen entspricht dem Verhältnis der Bereiche aus REQ-014', async () => {
      await zeige();
      const breite = (el: HTMLElement) => parseFloat(getComputedStyle(el).width);
      const hoehe = (el: HTMLElement) => parseFloat(getComputedStyle(el).height);
      const bereichVerhaeltnis = (b: Bereich) => breite(bereich(b)) / hoehe(bereich(b));
      const soll = bereichVerhaeltnis('cover') / bereichVerhaeltnis('ruecken');
      const zc = await oeffneZuschnitt('cover');
      const c = rechteckMasse(positionen(zc));
      fireEvent.click(within(zc).getByRole('button', { name: 'Zurück' }));
      await vi.waitFor(() => expect(zuschnitt()).toBeNull());
      const r = rechteckMasse(positionen(await oeffneZuschnitt('ruecken')));
      // Gleiches Bild, gleiche Einheit: das Verhältnis der Seitenverhältnisse ist unabhängig von der Bildgröße.
      expect((c.w / c.h) / (r.w / r.h)).toBeCloseTo(soll, 2);
    });
  });

  describe('AK-3 Eckpunkte einzeln frei verschiebbar', () => {
    it.each([0, 1, 2, 3])('[REQ-017/AK-3] Eckpunkt %i verschieben: nur er bewegt sich, danach kein Rechteck mehr', async (i) => {
      layoutVorgeben();
      await zeige();
      const z = await oeffneZuschnitt('cover');
      const vorher = positionen(z);
      const el = eckpunkte(z).find((e) => e.getAttribute('data-eckpunkt') === String(i))!;
      ziehe(el, 23, -17);
      const nachher = positionen(zuschnitt()!);
      const idx = eckpunkte(zuschnitt()!).map((e) => Number(e.getAttribute('data-eckpunkt')));
      for (let k = 0; k < 4; k++) {
        if (idx[k] === i) expect(nachher[k], `Eckpunkt ${i} bewegt`).not.toEqual(vorher[k]);
        else expect(nachher[k], `Eckpunkt ${idx[k]} unverändert`).toEqual(vorher[k]);
      }
      expect(istRechteck(nachher)).toBe(false);
    });

    it('[REQ-017/AK-3] zwei Eckpunkte nacheinander zu einem Trapez ziehen', async () => {
      layoutVorgeben();
      await zeige();
      const z = await oeffneZuschnitt('cover');
      const vorher = positionen(z);
      ziehe(eckpunkte(z).find((e) => e.getAttribute('data-eckpunkt') === '0')!, 20, 0);
      ziehe(eckpunkte(zuschnitt()!).find((e) => e.getAttribute('data-eckpunkt') === '1')!, -20, 0);
      const nachher = positionen(zuschnitt()!);
      expect(nachher.filter((p, k) => p.x !== vorher[k].x || p.y !== vorher[k].y)).toHaveLength(2);
      expect(istRechteck(nachher)).toBe(false);
    });
  });

  describe('AK-4 Schräges Buch wird geradegezogen', () => {
    it('[REQ-017/AK-4] Homographie: die vier Trapezecken landen genau auf den Ecken des Zielrechtecks', () => {
      const ziel: Ecken = [
        { x: 0, y: 0 },
        { x: 40, y: 0 },
        { x: 40, y: 60 },
        { x: 0, y: 60 },
      ];
      const h = homographie(TRAPEZ, ziel);
      for (let i = 0; i < 4; i++) {
        const p = abbilden(h, TRAPEZ[i]);
        expect(p.x).toBeCloseTo(ziel[i].x, 6);
        expect(p.y).toBeCloseTo(ziel[i].y, 6);
      }
    });

    it('[REQ-017/AK-4] echte Perspektive: der Diagonalenschnitt des Trapezes landet in der Rechteckmitte', () => {
      const ziel: Ecken = [
        { x: 0, y: 0 },
        { x: 40, y: 0 },
        { x: 40, y: 60 },
        { x: 0, y: 60 },
      ];
      // Schnitt der Diagonalen ol–ur und or–ul
      const [a, b, c, d] = TRAPEZ;
      const t = ((d.x - a.x) * (d.y - b.y) - (d.y - a.y) * (d.x - b.x)) / ((c.x - a.x) * (d.y - b.y) - (c.y - a.y) * (d.x - b.x));
      const s = { x: a.x + t * (c.x - a.x), y: a.y + t * (c.y - a.y) };
      const p = abbilden(homographie(TRAPEZ, ziel), s);
      expect(p.x).toBeCloseTo(20, 6);
      expect(p.y).toBeCloseTo(30, 6);
    });

    it('[REQ-017/AK-4] entzerren: das Ergebnis hat die Zielgröße und ist vollständig mit dem Buchinhalt gefüllt', () => {
      const erg = entzerren(trapezBild(), TRAPEZ, { breite: 40, hoehe: 60 });
      expect(erg.breite).toBe(40);
      expect(erg.hoehe).toBe(60);
      expect(erg.daten).toHaveLength(40 * 60 * 4);
      let schwarz = 0;
      for (let y = 0; y < 60; y++) {
        for (let x = 0; x < 40; x++) {
          const p = pixel(erg, x, y);
          const amRand = x === 0 || y === 0 || x === 39 || y === 59;
          // Bildteile außerhalb der Eckpunkte (schwarz) sind nicht zu sehen
          if (!amRand) expect(p[0] + p[1] + p[2], `Pixel ${x},${y} schwarz`).toBeGreaterThan(200);
          if (nahe(p, SCHWARZ, 40)) schwarz++;
        }
      }
      expect(schwarz).toBe(0);
    });

    it('[REQ-017/AK-4] entzerren: jede Buchecke landet in der passenden Ecke des Rechtecks (keine Spiegelung/Drehung)', () => {
      const erg = entzerren(trapezBild(), TRAPEZ, { breite: 40, hoehe: 60 });
      expect(nahe(pixel(erg, 1, 1), ROT, 10), 'oben links rot').toBe(true);
      expect(nahe(pixel(erg, 38, 1), GRUEN, 10), 'oben rechts grün').toBe(true);
      expect(nahe(pixel(erg, 38, 58), BLAU, 10), 'unten rechts blau').toBe(true);
      expect(nahe(pixel(erg, 1, 58), GELB, 10), 'unten links gelb').toBe(true);
      expect(nahe(pixel(erg, 20, 30), WEISS, 10), 'Mitte weiß').toBe(true);
    });

    it('[REQ-017/AK-4] entzerren: gerade Linien bleiben gerade (Mittellinie des Buches wird senkrecht)', () => {
      // Senkrechte Mittellinie des Buches: Verbindung der Kantenmitten oben und unten, rot eingefärbt
      const om = { x: (TRAPEZ[0].x + TRAPEZ[1].x) / 2, y: TRAPEZ[0].y };
      const um = { x: (TRAPEZ[2].x + TRAPEZ[3].x) / 2, y: TRAPEZ[2].y };
      const quelle = bildAus(120, 100, (x, y) => {
        if (!imViereck(TRAPEZ, { x, y })) return SCHWARZ;
        const t = (y - om.y) / (um.y - om.y);
        return Math.abs(x - (om.x + t * (um.x - om.x))) < 1.5 ? ROT : WEISS;
      });
      const erg = entzerren(quelle, TRAPEZ, { breite: 41, hoehe: 60 });
      // In jeder Zeile liegt die rote Linie in derselben Spalte (Mitte)
      for (let y = 2; y < 58; y++) {
        const roteSpalten: number[] = [];
        for (let x = 0; x < 41; x++) {
          const p = pixel(erg, x, y);
          if (p[0] > 200 && p[1] < 150) roteSpalten.push(x);
        }
        expect(roteSpalten.length, `Zeile ${y}`).toBeGreaterThan(0);
        const mitte = roteSpalten.reduce((a, b) => a + b, 0) / roteSpalten.length;
        expect(Math.abs(mitte - 20), `Zeile ${y}`).toBeLessThanOrEqual(1);
      }
    });

    it('[REQ-017/AK-4] Grenzfall: Eckpunkte auf den Bildecken ergeben dasselbe Bild', () => {
      const quelle = bildAus(30, 20, (x, y) => [Math.floor(x) * 8, Math.floor(y) * 12, 77, 255]);
      const ecken: Ecken = [
        { x: 0, y: 0 },
        { x: 30, y: 0 },
        { x: 30, y: 20 },
        { x: 0, y: 20 },
      ];
      const erg = entzerren(quelle, ecken, { breite: 30, hoehe: 20 });
      for (let i = 0; i < erg.daten.length; i++) expect(Math.abs(erg.daten[i] - quelle.daten[i])).toBeLessThanOrEqual(1);
    });

    it('[REQ-017/AK-4] Ablauf: nach dem Bestätigen zeigt der Bereich das Ergebnis, füllend, und der Zuschnitt ist zu', async () => {
      const { s } = await zeige();
      const z = await oeffneZuschnitt('cover');
      fireEvent.click(bestaetigen(z));
      await vi.waitFor(() => expect(zuschnitt()).toBeNull());
      await vi.waitFor(() => expect(bereich('cover').querySelector('img[data-bereich-bild]')).not.toBeNull());
      const img = bereich('cover').querySelector<HTMLImageElement>('img[data-bereich-bild]')!;
      expect(img.getAttribute('src')).toBe(s.daten.get(`${BUCH.id}|cover`));
      const cs = getComputedStyle(img);
      expect(cs.width).toBe('100%');
      expect(cs.height).toBe('100%');
      expect(details()).not.toBeNull();
    });
  });

  describe('AK-5 Neues Bild ersetzt das alte', () => {
    it.each(BEREICHE)('[REQ-017/AK-5] %s: altes Bild → neues Bild nach Bestätigung, übrige Bereiche unverändert', async (b) => {
      const alt = { ruecken: PNG.rot, cover: PNG.rot, schnitt: PNG.rot };
      const { s } = await zeige(alt, PNG.gruen);
      const andere = BEREICHE.filter((x) => x !== b);
      const vorher = andere.map((x) => bereich(x).innerHTML);
      const z = await oeffneZuschnitt(b);
      fireEvent.click(bestaetigen(z));
      await vi.waitFor(() => expect(s.daten.get(`${BUCH.id}|${b}`)).not.toBe(PNG.rot));
      await vi.waitFor(() => expect(bereich(b).querySelector('img')!.getAttribute('src')).toBe(s.daten.get(`${BUCH.id}|${b}`)));
      expect(bereich(b).querySelectorAll('img')).toHaveLength(1);
      expect(s.daten.size).toBe(3);
      expect(andere.map((x) => bereich(x).innerHTML)).toEqual(vorher);
      for (const x of andere) expect(s.daten.get(`${BUCH.id}|${x}`)).toBe(PNG.rot);
    });
  });

  describe('AK-6 Zurück-Pfeil im Zuschnitt ändert nichts', () => {
    it.each([{}, { cover: PNG.rot }])('[REQ-017/AK-6] Zurück → Buchdetails desselben Buches, Bild nicht übernommen (%o)', async (bilder) => {
      const { s, onZurueck } = await zeige(bilder, PNG.gruen);
      const vorher = BEREICHE.map((b) => bereich(b).innerHTML);
      const daten = new Map(s.daten);
      const z = await oeffneZuschnitt('cover');
      fireEvent.click(within(z).getByRole('button', { name: 'Zurück' }));
      await vi.waitFor(() => expect(zuschnitt()).toBeNull());
      expect(details()).not.toBeNull();
      expect(details()!.querySelector('[data-buchdetails-titel]')!.textContent?.trim()).toBe(BUCH.titel);
      expect(onZurueck).not.toHaveBeenCalled();
      expect(screen.queryByRole('menu')).toBeNull();
      expect(BEREICHE.map((b) => bereich(b).innerHTML)).toEqual(vorher);
      expect(s.daten).toEqual(daten);
      expect(document.querySelector(`img[src="${PNG.gruen}"]`)).toBeNull();
    });

    it('[REQ-017/AK-6] auch nach dem Verschieben von Eckpunkten wird nichts übernommen', async () => {
      layoutVorgeben();
      const { s } = await zeige({}, PNG.gruen);
      const z = await oeffneZuschnitt('schnitt');
      ziehe(eckpunkte(z)[0], 15, 15);
      fireEvent.click(within(zuschnitt()!).getByRole('button', { name: 'Zurück' }));
      await vi.waitFor(() => expect(zuschnitt()).toBeNull());
      expect(s.daten.size).toBe(0);
      expect(bereich('schnitt').querySelector('[data-bereich-beschriftung]')).not.toBeNull();
    });
  });

  describe('AK-9 Zurück-Pfeil in Tertiär', () => {
    it('[REQ-017/AK-9] Zurück-Pfeil des Zuschnitts: icon-zurueck.png in „Tertiär“, links vor der Bestätigung', async () => {
      const { wurzel } = await zeige();
      const z = await oeffneZuschnitt('cover');
      const zurueck = within(z).getByRole('button', { name: 'Zurück' });
      const icon = zurueck.querySelector<HTMLElement>('[data-icon="icon-zurueck.png"]')!;
      expect(icon).not.toBeNull();
      expect(icon.getAttribute('style') ?? '').toContain('var(--bz-farbe-tertiaer)');
      const cs = getComputedStyle(icon);
      expect([cs.backgroundColor, cs.color]).toContain(berechneteFarbe(wurzel, rubriken.tertiaer.wert));
      expect(within(z).getAllByRole('button')[0]).toBe(zurueck);
    });

    it('[REQ-017/AK-9] Änderung von „Tertiär“ wirkt auf den Zurück-Pfeil des Zuschnitts', async () => {
      const r = rubriken.tertiaer;
      const alt = r.wert;
      r.wert = rubriken.primaer.wert;
      try {
        const { wurzel } = await zeige();
        const z = await oeffneZuschnitt('cover');
        const cs = getComputedStyle(within(z).getByRole('button', { name: 'Zurück' }).querySelector<HTMLElement>('[data-icon]')!);
        expect([cs.backgroundColor, cs.color]).toContain(berechneteFarbe(wurzel, r.wert));
      } finally {
        r.wert = alt;
      }
    });
  });
});
