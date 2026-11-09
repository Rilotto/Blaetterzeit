// Perspektivische Entzerrung über vier Eckpunkte (REQ-017), ohne Abhängigkeiten.
// Reine Funktionen: arbeiten auf RGBA-Pixelfeldern, nicht auf Canvas oder DOM.

export interface Punkt {
  x: number;
  y: number;
}

/** Vier Ecken in der Reihenfolge oben links, oben rechts, unten rechts, unten links. */
export type Ecken = readonly [Punkt, Punkt, Punkt, Punkt];

export interface Pixelbild {
  breite: number;
  hoehe: number;
  /** RGBA, 4 Byte je Pixel, zeilenweise. */
  daten: Uint8ClampedArray;
}

/** 3×3-Matrix zeilenweise, h[8] = 1. */
export type Homographie = readonly number[];

/** Löst A·x = b mit Gauß-Elimination und Spaltenpivotisierung. */
function loese(a: number[][], b: number[]): number[] {
  const n = b.length;
  const m = a.map((zeile, i) => [...zeile, b[i]]);
  for (let s = 0; s < n; s++) {
    let pivot = s;
    for (let z = s + 1; z < n; z++) if (Math.abs(m[z][s]) > Math.abs(m[pivot][s])) pivot = z;
    if (Math.abs(m[pivot][s]) < 1e-12) throw new Error('Eckpunkte liegen entartet (z. B. drei auf einer Linie)');
    [m[s], m[pivot]] = [m[pivot], m[s]];
    for (let z = s + 1; z < n; z++) {
      const f = m[z][s] / m[s][s];
      for (let k = s; k <= n; k++) m[z][k] -= f * m[s][k];
    }
  }
  const x = new Array<number>(n).fill(0);
  for (let z = n - 1; z >= 0; z--) {
    let summe = m[z][n];
    for (let k = z + 1; k < n; k++) summe -= m[z][k] * x[k];
    x[z] = summe / m[z][z];
  }
  return x;
}

/** Homographie H mit H·von[i] ≅ nach[i] für die vier Punktpaare. */
export function homographie(von: Ecken, nach: Ecken): Homographie {
  const a: number[][] = [];
  const b: number[] = [];
  for (let i = 0; i < 4; i++) {
    const { x, y } = von[i];
    const { x: u, y: v } = nach[i];
    a.push([x, y, 1, 0, 0, 0, -u * x, -u * y]);
    b.push(u);
    a.push([0, 0, 0, x, y, 1, -v * x, -v * y]);
    b.push(v);
  }
  return [...loese(a, b), 1];
}

/** Wendet H auf einen Punkt an. */
export function abbilden(h: Homographie, p: Punkt): Punkt {
  const w = h[6] * p.x + h[7] * p.y + h[8];
  return { x: (h[0] * p.x + h[1] * p.y + h[2]) / w, y: (h[3] * p.x + h[4] * p.y + h[5]) / w };
}

const abstand = (a: Punkt, b: Punkt) => Math.hypot(a.x - b.x, a.y - b.y);

/**
 * Zielgröße für das entzerrte Bild: Seitenverhältnis des Zielbereichs (Breite/Höhe),
 * Höhe aus der mittleren Kantenlänge des Vierecks, begrenzt auf `maxKante` Pixel.
 */
export function zielgroesse(ecken: Ecken, seitenverhaeltnis: number, maxKante = 2000): { breite: number; hoehe: number } {
  const [ol, or, ur, ul] = ecken;
  let hoehe = (abstand(ol, ul) + abstand(or, ur)) / 2;
  let breite = hoehe * seitenverhaeltnis;
  const faktor = Math.min(1, maxKante / Math.max(breite, hoehe));
  breite *= faktor;
  hoehe *= faktor;
  return { breite: Math.max(1, Math.round(breite)), hoehe: Math.max(1, Math.round(hoehe)) };
}

/**
 * Zieht den Bildinhalt innerhalb der vier Ecken (Pixelkoordinaten der Quelle) gerade und
 * füllt damit ein Rechteck der Größe `ziel` vollständig aus. Bilineare Interpolation;
 * Bildteile außerhalb der Ecken gelangen nicht ins Ergebnis.
 */
export function entzerren(quelle: Pixelbild, ecken: Ecken, ziel: { breite: number; hoehe: number }): Pixelbild {
  const { breite, hoehe } = ziel;
  // Pixelmitten: Zielrechteck von (0,0) bis (breite,hoehe) auf die Ecken abbilden.
  const rechteck: Ecken = [
    { x: 0, y: 0 },
    { x: breite, y: 0 },
    { x: breite, y: hoehe },
    { x: 0, y: hoehe },
  ];
  const h = homographie(rechteck, ecken);
  const daten = new Uint8ClampedArray(breite * hoehe * 4);
  const qb = quelle.breite;
  const qh = quelle.hoehe;
  const q = quelle.daten;
  const pixel = (x: number, y: number, k: number) => {
    const xi = Math.min(qb - 1, Math.max(0, x));
    const yi = Math.min(qh - 1, Math.max(0, y));
    return q[(yi * qb + xi) * 4 + k];
  };
  for (let y = 0; y < hoehe; y++) {
    for (let x = 0; x < breite; x++) {
      const p = abbilden(h, { x: x + 0.5, y: y + 0.5 });
      const sx = p.x - 0.5;
      const sy = p.y - 0.5;
      const x0 = Math.floor(sx);
      const y0 = Math.floor(sy);
      const fx = sx - x0;
      const fy = sy - y0;
      const o = (y * breite + x) * 4;
      for (let k = 0; k < 4; k++) {
        const oben = pixel(x0, y0, k) * (1 - fx) + pixel(x0 + 1, y0, k) * fx;
        const unten = pixel(x0, y0 + 1, k) * (1 - fx) + pixel(x0 + 1, y0 + 1, k) * fx;
        daten[o + k] = oben * (1 - fy) + unten * fy;
      }
    }
  }
  return { breite, hoehe, daten };
}

/** Skalierung, mit der ein Bild auf höchstens `maxKante` Pixel (längste Seite) begrenzt wird. */
export function begrenzungsfaktor(breite: number, hoehe: number, maxKante = 2000): number {
  const laengste = Math.max(breite, hoehe);
  return laengste > maxKante ? maxKante / laengste : 1;
}

/**
 * Startrechteck der Eckpunkte (REQ-017, AK-2/7/8) in normierten Koordinaten (0…1) eines
 * Bildes der Größe breite × hoehe: zentriert, im Seitenverhältnis des Zielbereichs,
 * so groß wie möglich bei `fuellung` Anteil der Bildfläche.
 */
export function startEcken(bildBreite: number, bildHoehe: number, seitenverhaeltnis: number, fuellung = 0.8): Ecken {
  const b = bildBreite > 0 ? bildBreite : 1;
  const h = bildHoehe > 0 ? bildHoehe : 1;
  let hoehePx = h * fuellung;
  let breitePx = hoehePx * seitenverhaeltnis;
  if (breitePx > b * fuellung) {
    breitePx = b * fuellung;
    hoehePx = breitePx / seitenverhaeltnis;
  }
  const l = (b - breitePx) / 2 / b;
  const r = 1 - l;
  const o = (h - hoehePx) / 2 / h;
  const u = 1 - o;
  return [
    { x: l, y: o },
    { x: r, y: o },
    { x: r, y: u },
    { x: l, y: u },
  ];
}
