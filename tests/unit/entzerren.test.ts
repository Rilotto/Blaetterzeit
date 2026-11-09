import { describe, expect, it } from 'vitest';
import {
  abbilden,
  begrenzungsfaktor,
  entzerren,
  homographie,
  startEcken,
  zielgroesse,
  type Ecken,
  type Pixelbild,
} from '@/bild/entzerren';

const nah = (a: number, b: number, eps = 1e-6) => expect(Math.abs(a - b)).toBeLessThan(eps);

/** Bild mit einfarbigem Hintergrund (Wert 0) und einem Viereck (Wert 255), per Punkt-in-Polygon gefüllt. */
function bildMitViereck(breite: number, hoehe: number, ecken: Ecken): Pixelbild {
  const daten = new Uint8ClampedArray(breite * hoehe * 4);
  const innen = (x: number, y: number) => {
    let drin = false;
    for (let i = 0, j = 3; i < 4; j = i++) {
      const a = ecken[i];
      const b = ecken[j];
      if (a.y > y !== b.y > y && x < ((b.x - a.x) * (y - a.y)) / (b.y - a.y) + a.x) drin = !drin;
    }
    return drin;
  };
  for (let y = 0; y < hoehe; y++)
    for (let x = 0; x < breite; x++) {
      const o = (y * breite + x) * 4;
      const v = innen(x + 0.5, y + 0.5) ? 255 : 0;
      daten[o] = v;
      daten[o + 1] = v;
      daten[o + 2] = v;
      daten[o + 3] = 255;
    }
  return { breite, hoehe, daten };
}

describe('homographie', () => {
  it('bildet die vier Punkte exakt aufeinander ab', () => {
    const von: Ecken = [
      { x: 0, y: 0 },
      { x: 10, y: 0 },
      { x: 10, y: 20 },
      { x: 0, y: 20 },
    ];
    const nach: Ecken = [
      { x: 13, y: 7 },
      { x: 91, y: 22 },
      { x: 80, y: 140 },
      { x: 5, y: 120 },
    ];
    const h = homographie(von, nach);
    von.forEach((p, i) => {
      const q = abbilden(h, p);
      nah(q.x, nach[i].x);
      nah(q.y, nach[i].y);
    });
  });

  it('ist die Identität für gleiche Punkte', () => {
    const e: Ecken = [
      { x: 1, y: 2 },
      { x: 30, y: 2 },
      { x: 30, y: 40 },
      { x: 1, y: 40 },
    ];
    const q = abbilden(homographie(e, e), { x: 17, y: 9 });
    nah(q.x, 17);
    nah(q.y, 9);
  });

  it('wirft bei entarteten Eckpunkten (alle auf einer Linie)', () => {
    const linie: Ecken = [
      { x: 0, y: 0 },
      { x: 1, y: 1 },
      { x: 2, y: 2 },
      { x: 3, y: 3 },
    ];
    expect(() => homographie(linie, linie)).toThrow();
  });
});

describe('entzerren', () => {
  it('zieht ein schräg abgebildetes Viereck gerade: das Ergebnis ist vollständig ausgefüllt', () => {
    const ecken: Ecken = [
      { x: 30, y: 20 },
      { x: 150, y: 40 },
      { x: 140, y: 180 },
      { x: 20, y: 160 },
    ];
    const quelle = bildMitViereck(200, 200, ecken);
    const ergebnis = entzerren(quelle, ecken, { breite: 40, hoehe: 60 });
    expect(ergebnis.breite).toBe(40);
    expect(ergebnis.hoehe).toBe(60);
    // Innenbereich (ohne 1-px-Rand wegen Interpolation an der Kante) ist komplett „Buch“, kein Hintergrund.
    for (let y = 1; y < 59; y++)
      for (let x = 1; x < 39; x++) expect(ergebnis.daten[(y * 40 + x) * 4]).toBeGreaterThan(200);
  });

  it('übernimmt keine Bildteile außerhalb der Ecken', () => {
    // Links Wert 0, rechts Wert 255; die Ecken umschließen nur die linke Hälfte.
    const breite = 100;
    const hoehe = 50;
    const daten = new Uint8ClampedArray(breite * hoehe * 4);
    for (let y = 0; y < hoehe; y++)
      for (let x = 0; x < breite; x++) daten[(y * breite + x) * 4] = x < 50 ? 0 : 255;
    const ecken: Ecken = [
      { x: 0, y: 0 },
      { x: 45, y: 0 },
      { x: 45, y: 50 },
      { x: 0, y: 50 },
    ];
    const e = entzerren({ breite, hoehe, daten }, ecken, { breite: 20, hoehe: 20 });
    for (let i = 0; i < 20 * 20; i++) expect(e.daten[i * 4]).toBe(0);
  });

  it('kopiert bei identischen Ecken und Zielgröße das Bild unverändert', () => {
    const breite = 8;
    const hoehe = 6;
    const daten = new Uint8ClampedArray(breite * hoehe * 4).map((_, i) => (i * 7) % 256);
    const ecken: Ecken = [
      { x: 0, y: 0 },
      { x: breite, y: 0 },
      { x: breite, y: hoehe },
      { x: 0, y: hoehe },
    ];
    const e = entzerren({ breite, hoehe, daten }, ecken, { breite, hoehe });
    expect(Array.from(e.daten)).toEqual(Array.from(daten));
  });
});

describe('zielgroesse und begrenzung', () => {
  const ecken: Ecken = [
    { x: 0, y: 0 },
    { x: 100, y: 0 },
    { x: 100, y: 300 },
    { x: 0, y: 300 },
  ];
  it('nutzt das Seitenverhältnis des Zielbereichs', () => {
    expect(zielgroesse(ecken, 2 / 3)).toEqual({ breite: 200, hoehe: 300 });
    expect(zielgroesse(ecken, 0.125)).toEqual({ breite: 38, hoehe: 300 });
  });
  it('begrenzt die längste Seite auf 2000 px', () => {
    const gross: Ecken = [
      { x: 0, y: 0 },
      { x: 3000, y: 0 },
      { x: 3000, y: 4500 },
      { x: 0, y: 4500 },
    ];
    expect(zielgroesse(gross, 2 / 3)).toEqual({ breite: 1333, hoehe: 2000 });
    expect(begrenzungsfaktor(4000, 3000)).toBe(0.5);
    expect(begrenzungsfaktor(1200, 800)).toBe(1);
  });
});

describe('startEcken', () => {
  const verhaeltnis = (e: Ecken, b: number, h: number) => ((e[1].x - e[0].x) * b) / ((e[3].y - e[0].y) * h);
  it('bildet ein zentriertes Rechteck im Seitenverhältnis des Zielbereichs (in Bildpixeln)', () => {
    for (const [b, h, r] of [
      [4000, 3000, 2 / 3],
      [3000, 4000, 2 / 3],
      [1000, 1000, 35 / 280],
    ] as const) {
      const e = startEcken(b, h, r);
      nah(e[0].y, e[1].y);
      nah(e[2].y, e[3].y);
      nah(e[0].x, e[3].x);
      nah(e[1].x, e[2].x);
      nah(verhaeltnis(e, b, h), r);
      nah((e[0].x + e[1].x) / 2, 0.5);
      nah((e[0].y + e[3].y) / 2, 0.5);
      for (const p of e) {
        expect(p.x).toBeGreaterThanOrEqual(0);
        expect(p.x).toBeLessThanOrEqual(1);
        expect(p.y).toBeGreaterThanOrEqual(0);
        expect(p.y).toBeLessThanOrEqual(1);
      }
    }
  });
});
