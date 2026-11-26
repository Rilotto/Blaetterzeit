// PNG-Decoder für Pixelprüfungen in Tests (REQ-120, Launcher-Icons). Ohne Abhängigkeiten:
// nur node:fs und node:zlib (Modulnamen als Variable wie in tests/unit/silbentrennung.test.ts).
// Unterstützt 8 bit, Farbtyp 0/2/4/6 (Grau, RGB, Grau+Alpha, RGBA), nicht interlaced.

interface Fs {
  readFileSync(p: string): Uint8Array;
}
interface Zlib {
  inflateSync(b: Uint8Array): Uint8Array;
}
const [FS, ZLIB] = ['node:fs', 'node:zlib'];
const fs = (await import(/* @vite-ignore */ FS)) as Fs;
const zlib = (await import(/* @vite-ignore */ ZLIB)) as Zlib;

export interface PngBild {
  breite: number;
  hoehe: number;
  /** true, wenn die Datei einen Alphakanal hat (Farbtyp 4 oder 6). */
  hatAlpha: boolean;
  /** Pixel als RGBA, Zeile für Zeile (ohne Alpha: A = 255). */
  rgba: Uint8Array;
  /** [r, g, b, a] an Position (x, y). */
  pixel(x: number, y: number): [number, number, number, number];
}

const KANAELE: Record<number, number> = { 0: 1, 2: 3, 4: 2, 6: 4 };

function u32(b: Uint8Array, o: number): number {
  return ((b[o] << 24) | (b[o + 1] << 16) | (b[o + 2] << 8) | b[o + 3]) >>> 0;
}

function paeth(a: number, b: number, c: number): number {
  const p = a + b - c;
  const pa = Math.abs(p - a);
  const pb = Math.abs(p - b);
  const pc = Math.abs(p - c);
  return pa <= pb && pa <= pc ? a : pb <= pc ? b : c;
}

export function dekodierePng(daten: Uint8Array): PngBild {
  const signatur = [137, 80, 78, 71, 13, 10, 26, 10];
  if (!signatur.every((v, i) => daten[i] === v)) throw new Error('Keine PNG-Datei');
  let o = 8;
  let breite = 0;
  let hoehe = 0;
  let farbtyp = -1;
  const idat: Uint8Array[] = [];
  while (o < daten.length) {
    const laenge = u32(daten, o);
    const typ = String.fromCharCode(daten[o + 4], daten[o + 5], daten[o + 6], daten[o + 7]);
    const inhalt = daten.subarray(o + 8, o + 8 + laenge);
    if (typ === 'IHDR') {
      breite = u32(inhalt, 0);
      hoehe = u32(inhalt, 4);
      const tiefe = inhalt[8];
      farbtyp = inhalt[9];
      if (tiefe !== 8 || !(farbtyp in KANAELE) || inhalt[12] !== 0) {
        throw new Error(`Nicht unterstütztes PNG (Tiefe ${tiefe}, Farbtyp ${farbtyp}, Interlace ${inhalt[12]})`);
      }
    } else if (typ === 'IDAT') {
      idat.push(inhalt);
    } else if (typ === 'IEND') {
      break;
    }
    o += 12 + laenge;
  }
  const gesamt = new Uint8Array(idat.reduce((s, c) => s + c.length, 0));
  idat.reduce((pos, c) => (gesamt.set(c, pos), pos + c.length), 0);
  const roh = zlib.inflateSync(gesamt);
  const k = KANAELE[farbtyp];
  const zeile = breite * k;
  const aus = new Uint8Array(zeile * hoehe);
  for (let y = 0; y < hoehe; y++) {
    const filter = roh[y * (zeile + 1)];
    const quelle = y * (zeile + 1) + 1;
    const ziel = y * zeile;
    for (let i = 0; i < zeile; i++) {
      const x = roh[quelle + i];
      const a = i >= k ? aus[ziel + i - k] : 0;
      const b = y > 0 ? aus[ziel - zeile + i] : 0;
      const c = i >= k && y > 0 ? aus[ziel - zeile + i - k] : 0;
      let v: number;
      switch (filter) {
        case 0: v = x; break;
        case 1: v = x + a; break;
        case 2: v = x + b; break;
        case 3: v = x + ((a + b) >> 1); break;
        case 4: v = x + paeth(a, b, c); break;
        default: throw new Error(`Unbekannter PNG-Filter ${filter}`);
      }
      aus[ziel + i] = v & 0xff;
    }
  }
  const rgba = new Uint8Array(breite * hoehe * 4);
  for (let p = 0; p < breite * hoehe; p++) {
    const s = p * k;
    const [r, g, b2, al] =
      k === 1 ? [aus[s], aus[s], aus[s], 255]
      : k === 2 ? [aus[s], aus[s], aus[s], aus[s + 1]]
      : k === 3 ? [aus[s], aus[s + 1], aus[s + 2], 255]
      : [aus[s], aus[s + 1], aus[s + 2], aus[s + 3]];
    rgba.set([r, g, b2, al], p * 4);
  }
  return {
    breite,
    hoehe,
    hatAlpha: farbtyp === 4 || farbtyp === 6,
    rgba,
    pixel(x, y) {
      const i = (y * breite + x) * 4;
      return [rgba[i], rgba[i + 1], rgba[i + 2], rgba[i + 3]];
    },
  };
}

/** Liest eine PNG-Datei (Pfad relativ zum Projektwurzelverzeichnis oder absolut). */
export function lesePng(pfad: string): PngBild {
  return dekodierePng(fs.readFileSync(pfad));
}
