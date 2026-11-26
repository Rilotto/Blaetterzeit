import { describe, expect, it } from 'vitest';
import { dekodierePng, lesePng } from './helpers/png';

// REQ-120: Prüft das Pixel-Werkzeug selbst; die AK-Prüfungen schreibt der Tester in tests/acceptance/.
const RES = 'android/app/src/main/res';

describe('PNG-Decoder für Icon-Prüfungen', () => {
  it('liest die Vorlage (RGB, 1254 × 1254, schwarze Ecke)', () => {
    const bild = lesePng('assets/logo/app-logo.png');
    expect([bild.breite, bild.hoehe, bild.hatAlpha]).toEqual([1254, 1254, false]);
    expect(bild.pixel(0, 0)).toEqual([0, 0, 0, 255]);
    const [r, g, b] = bild.pixel(627, 100);
    expect(Math.min(r, g, b)).toBeGreaterThan(150);
  });

  it('liest RGBA-Vordergrund: Ecke transparent, Mitte deckend', () => {
    const bild = lesePng(`${RES}/mipmap-xxxhdpi/ic_launcher_foreground.png`);
    expect([bild.breite, bild.hoehe, bild.hatAlpha]).toEqual([432, 432, true]);
    expect(bild.pixel(0, 0)[3]).toBe(0);
    expect(bild.pixel(216, 216)[3]).toBe(255);
  });

  it('weist Nicht-PNG-Daten ab', () => {
    expect(() => dekodierePng(new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8]))).toThrow('Keine PNG-Datei');
  });
});
