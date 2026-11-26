import { describe, expect, it } from 'vitest';
// Kein Alias möglich: '@' zeigt auf src/. Relativer Pfad bleibt auch nach Verschieben
// nach tests/regression/ gültig (gleiche Verzeichnistiefe).
import { lesePng, type PngBild } from '../unit/helpers/png';

// REQ-120: App-Logo als Android-Launcher-Icon. Abgeleitet aus dem REQ-Text (AK-1 bis AK-7).
// AK-8 ist eine manuelle Geräteprüfung (S23 Ultra) und wird im Testbericht geführt.

interface Fs {
  readFileSync(p: string, enc: 'utf8'): string;
  existsSync(p: string): boolean;
  readdirSync(p: string): string[];
}
const FS = 'node:fs';
const fs = (await import(/* @vite-ignore */ FS)) as Fs;

const RES = 'android/app/src/main/res';
const MANIFEST = 'android/app/src/main/AndroidManifest.xml';
const VORLAGE = 'assets/logo/app-logo.png';

const DICHTEN = ['mdpi', 'hdpi', 'xhdpi', 'xxhdpi', 'xxxhdpi'] as const;
const VG_GROESSE: Record<string, number> = { mdpi: 108, hdpi: 162, xhdpi: 216, xxhdpi: 324, xxxhdpi: 432 };
const LEGACY_GROESSE: Record<string, number> = { mdpi: 48, hdpi: 72, xhdpi: 96, xxhdpi: 144, xxxhdpi: 192 };

type Rgb = [number, number, number];

/** Liest die Farbe, auf die der Hintergrund des Adaptive Icons verweist (Farbressource). */
function hintergrundFarbe(): Rgb {
  const xml = fs.readFileSync(`${RES}/mipmap-anydpi-v26/ic_launcher.xml`, 'utf8');
  const bg = /<background[^>]*android:drawable="@color\/([A-Za-z0-9_]+)"/.exec(xml);
  if (!bg) throw new Error('Hintergrund-Ebene verweist nicht auf eine Farbressource');
  const name = bg[1];
  const werteDateien = fs.readdirSync(`${RES}/values`).filter((d) => d.endsWith('.xml'));
  for (const datei of werteDateien) {
    const inhalt = fs.readFileSync(`${RES}/values/${datei}`, 'utf8');
    const m = new RegExp(`<color\\s+name="${name}"\\s*>\\s*#([0-9A-Fa-f]{6}|[0-9A-Fa-f]{8})\\s*<`).exec(inhalt);
    if (m) {
      const hex = m[1].length === 8 ? m[1].slice(2) : m[1];
      return [0, 2, 4].map((i) => parseInt(hex.slice(i, i + 2), 16)) as Rgb;
    }
  }
  throw new Error(`Farbressource ${name} nicht gefunden`);
}

function istPergament(p: [number, number, number, number], bg: Rgb): boolean {
  return Math.abs(p[0] - bg[0]) <= 16 && Math.abs(p[1] - bg[1]) <= 16 && Math.abs(p[2] - bg[2]) <= 16;
}
function istDunkel(p: [number, number, number, number]): boolean {
  return p[3] > 0 && p[0] <= 60 && p[1] <= 60 && p[2] <= 60;
}
function ausserhalbSafeZone(x: number, y: number, s: number): boolean {
  return Math.hypot(x + 0.5 - s / 2, y + 0.5 - s / 2) > (s * 66) / 108 / 2;
}

function vordergrund(d: string): PngBild {
  return lesePng(`${RES}/mipmap-${d}/ic_launcher_foreground.png`);
}

describe('REQ-120 App-Logo als Launcher-Icon', () => {
  // ---------- AK-1 ----------
  for (const name of ['ic_launcher', 'ic_launcher_round']) {
    it(`[REQ-120/AK-1] ${name}.xml ist ein Adaptive Icon mit genau einer Hintergrund- und einer Vordergrund-Ebene`, () => {
      const pfad = `${RES}/mipmap-anydpi-v26/${name}.xml`;
      expect(fs.existsSync(pfad)).toBe(true);
      const xml = fs.readFileSync(pfad, 'utf8');
      expect(xml).toMatch(/<adaptive-icon[\s>]/);
      expect(xml.match(/<background\b/g)?.length).toBe(1);
      expect(xml.match(/<foreground\b/g)?.length).toBe(1);
      expect(xml).toMatch(/<foreground[^>]*android:drawable="@mipmap\/ic_launcher_foreground"/);
    });
  }

  it('[REQ-120/AK-1] Manifest verweist mit android:icon und android:roundIcon auf die Adaptive Icons', () => {
    const m = fs.readFileSync(MANIFEST, 'utf8');
    const app = /<application\b[^>]*>/s.exec(m)?.[0] ?? '';
    expect(app).toContain('android:icon="@mipmap/ic_launcher"');
    expect(app).toContain('android:roundIcon="@mipmap/ic_launcher_round"');
  });

  // ---------- AK-2 ----------
  it('[REQ-120/AK-2] Hintergrund beider Adaptive Icons ist dieselbe Farbressource, kein Bild', () => {
    for (const name of ['ic_launcher', 'ic_launcher_round']) {
      const xml = fs.readFileSync(`${RES}/mipmap-anydpi-v26/${name}.xml`, 'utf8');
      expect(xml).toMatch(/<background[^>]*android:drawable="@color\/ic_launcher_background"/);
      expect(xml).not.toMatch(/<background[^>]*@(mipmap|drawable)\//);
    }
  });

  it('[REQ-120/AK-2] Hintergrundfarbe ist hell (jeder Kanal ≥ 200) und nicht reines Weiß', () => {
    const [r, g, b] = hintergrundFarbe();
    expect(r).toBeGreaterThanOrEqual(200);
    expect(g).toBeGreaterThanOrEqual(200);
    expect(b).toBeGreaterThanOrEqual(200);
    expect([r, g, b]).not.toEqual([255, 255, 255]);
  });

  // ---------- AK-3 ----------
  for (const d of DICHTEN) {
    it(`[REQ-120/AK-3] Vordergrund ${d}: quadratische PNG mit Alphakanal, ${VG_GROESSE[d]} px`, () => {
      const bild = vordergrund(d);
      expect(bild.breite).toBe(VG_GROESSE[d]);
      expect(bild.hoehe).toBe(VG_GROESSE[d]);
      expect(bild.hatAlpha).toBe(true);
    });
  }

  // ---------- AK-4 ----------
  for (const d of DICHTEN) {
    it(`[REQ-120/AK-4] Vordergrund ${d}: außerhalb der Safe Zone nur transparent/pergament, nichts Dunkles`, () => {
      const bg = hintergrundFarbe();
      const bild = vordergrund(d);
      const s = bild.breite;
      let verstoesse = 0;
      let beispiel = '';
      for (let y = 0; y < s; y++) {
        for (let x = 0; x < s; x++) {
          const p = bild.pixel(x, y);
          if (!ausserhalbSafeZone(x, y, s)) continue;
          if (istDunkel(p) || (p[3] !== 0 && !istPergament(p, bg))) {
            verstoesse++;
            if (!beispiel) beispiel = `(${x},${y})=${p.join(',')}`;
          }
        }
      }
      expect(verstoesse, `erster Verstoß ${beispiel}`).toBe(0);
      // Dunkle Pixel außerhalb der Safe Zone sind oben bereits Verstöße; zusätzlich darf es keine
      // schwarzen Ecken/Rahmen-Reste geben: die vier Eckpixel prüfen.
      for (const [x, y] of [[0, 0], [s - 1, 0], [0, s - 1], [s - 1, s - 1]]) {
        const p = bild.pixel(x, y);
        expect(p[3] === 0 || istPergament(p, bg), `Ecke (${x},${y})=${p.join(',')}`).toBe(true);
        expect(istDunkel(p)).toBe(false);
      }
    });
  }

  it('[REQ-120/AK-4] Grenzfall: Pixel direkt außerhalb des Safe-Zone-Kreises (Ränder oben/unten/links/rechts) sind leer', () => {
    const bg = hintergrundFarbe();
    const bild = vordergrund('xxxhdpi');
    const s = bild.breite;
    const r = (s * 66) / 108 / 2;
    const rand = Math.ceil(s / 2 + r); // erstes Pixel vollständig außerhalb
    for (const [x, y] of [[rand, s / 2], [s - 1 - rand, s / 2], [s / 2, rand], [s / 2, s - 1 - rand]]) {
      const p = bild.pixel(x, y);
      expect(p[3] === 0 || istPergament(p, bg), `(${x},${y})=${p.join(',')}`).toBe(true);
    }
  });

  // ---------- AK-5 ----------
  for (const d of DICHTEN) {
    it(`[REQ-120/AK-5] Vordergrund ${d}: Motiv ≥ 45 % der Kante und zentriert (≤ 5 %)`, () => {
      const bg = hintergrundFarbe();
      const bild = vordergrund(d);
      const s = bild.breite;
      let [x0, y0, x1, y1] = [s, s, -1, -1];
      for (let y = 0; y < s; y++) {
        for (let x = 0; x < s; x++) {
          const p = bild.pixel(x, y);
          if (p[3] === 0 || istPergament(p, bg)) continue;
          x0 = Math.min(x0, x);
          y0 = Math.min(y0, y);
          x1 = Math.max(x1, x);
          y1 = Math.max(y1, y);
        }
      }
      expect(x1, 'kein Motiv gefunden').toBeGreaterThanOrEqual(0);
      const breite = x1 - x0 + 1;
      const hoehe = y1 - y0 + 1;
      expect(Math.max(breite, hoehe)).toBeGreaterThanOrEqual(0.45 * s);
      const mx = (x0 + x1 + 1) / 2;
      const my = (y0 + y1 + 1) / 2;
      expect(Math.hypot(mx - s / 2, my - s / 2)).toBeLessThanOrEqual(0.05 * s);
    });
  }

  // ---------- AK-6 ----------
  for (const name of ['ic_launcher', 'ic_launcher_round']) {
    for (const d of DICHTEN) {
      it(`[REQ-120/AK-6] Legacy ${name}.png ${d}: ${LEGACY_GROESSE[d]} px, Ecke transparent, kein dunkler Rand`, () => {
        const bild = lesePng(`${RES}/mipmap-${d}/${name}.png`);
        const s = LEGACY_GROESSE[d];
        expect([bild.breite, bild.hoehe]).toEqual([s, s]);
        expect(bild.pixel(0, 0)[3]).toBe(0);
        const rand = 0.08 * s;
        let beispiel = '';
        for (let y = 0; y < s; y++) {
          for (let x = 0; x < s; x++) {
            const imRand = x < rand || y < rand || x >= s - rand || y >= s - rand;
            if (imRand && istDunkel(bild.pixel(x, y)) && !beispiel) beispiel = `(${x},${y})`;
          }
        }
        expect(beispiel, `dunkles Randpixel ${beispiel}`).toBe('');
        // Kein leeres Icon: die Mitte ist deckend (Motiv auf Pergament).
        expect(bild.pixel(Math.floor(s / 2), Math.floor(s / 2))[3]).toBe(255);
      });
    }
  }

  it('[REQ-120/AK-6] Legacy rund: Ecken außerhalb des Kreises transparent, eckig: Mitte der Kanten deckend', () => {
    for (const d of DICHTEN) {
      const s = LEGACY_GROESSE[d];
      const rund = lesePng(`${RES}/mipmap-${d}/ic_launcher_round.png`);
      for (const [x, y] of [[s - 1, 0], [0, s - 1], [s - 1, s - 1]]) expect(rund.pixel(x, y)[3]).toBe(0);
      const eckig = lesePng(`${RES}/mipmap-${d}/ic_launcher.png`);
      for (const [x, y] of [[s - 1, 0], [0, s - 1], [s - 1, s - 1]]) expect(eckig.pixel(x, y)[3]).toBe(0);
    }
  });

  // ---------- AK-7 ----------
  it('[REQ-120/AK-7] Vorlage assets/logo/app-logo.png existiert mit 1254 × 1254 px', () => {
    expect(fs.existsSync(VORLAGE)).toBe(true);
    const bild = lesePng(VORLAGE);
    expect([bild.breite, bild.hoehe]).toEqual([1254, 1254]);
    // Unverändert: weiterhin das Original mit schwarzen Ecken (nicht durch ein bearbeitetes Motiv ersetzt).
    expect(bild.pixel(0, 0).slice(0, 3)).toEqual([0, 0, 0]);
  });

  it('[REQ-120/AK-7] Im Projekt ist beschrieben, wie die Icons aus der Vorlage erzeugt werden', () => {
    const readme = fs.readFileSync('scripts/icons/README.md', 'utf8');
    expect(readme).toContain('assets/logo/app-logo.png');
    expect(readme).toContain('ic_launcher_foreground');
    const skript = readme.match(/scripts\/icons\/[\w-]+\.py/)?.[0];
    expect(skript).toBeDefined();
    expect(fs.existsSync(skript!)).toBe(true);
  });
});
