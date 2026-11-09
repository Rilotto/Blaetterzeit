// Verbindung der reinen Bildfunktionen (entzerren.ts) mit Canvas/Browser.
import { begrenzungsfaktor, entzerren, zielgroesse, type Ecken } from './entzerren';

/** Längste Bildseite in Pixeln, auf die Bilder vor der Verarbeitung begrenzt werden. */
export const MAX_KANTE = 2000;
const JPEG_QUALITAET = 0.9;

let verfuegbar: boolean | undefined;

/** Gibt es ein 2D-Canvas? (In der Testumgebung jsdom nicht.) */
export function canvasVerfuegbar(): boolean {
  if (verfuegbar === undefined) {
    try {
      verfuegbar =
        typeof document !== 'undefined' &&
        !/jsdom/i.test(typeof navigator === 'undefined' ? '' : navigator.userAgent) &&
        document.createElement('canvas').getContext('2d') !== null;
    } catch {
      verfuegbar = false;
    }
  }
  return verfuegbar;
}

export function bildLaden(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Bild lässt sich nicht laden'));
    img.src = src;
  });
}

function leinwand(breite: number, hoehe: number) {
  const c = document.createElement('canvas');
  c.width = breite;
  c.height = hoehe;
  const ctx = c.getContext('2d');
  if (!ctx) throw new Error('Canvas nicht verfügbar');
  return { c, ctx };
}

/** Begrenzt ein Bild auf höchstens MAX_KANTE Pixel (längste Seite) und liefert eine JPEG-Data-URL. */
export async function bildBegrenzen(dataUrl: string, maxKante = MAX_KANTE): Promise<string> {
  if (!canvasVerfuegbar()) return dataUrl;
  const img = await bildLaden(dataUrl);
  const f = begrenzungsfaktor(img.naturalWidth, img.naturalHeight, maxKante);
  const { c, ctx } = leinwand(Math.round(img.naturalWidth * f), Math.round(img.naturalHeight * f));
  ctx.drawImage(img, 0, 0, c.width, c.height);
  return c.toDataURL('image/jpeg', JPEG_QUALITAET);
}

/**
 * Zuschnitt bestätigen (REQ-017): Inhalt zwischen den vier Ecken (normiert 0…1) geradeziehen,
 * im Seitenverhältnis des Zielbereichs (Breite/Höhe). Ohne Canvas (Testumgebung) bleibt das Bild unverändert.
 */
export async function zuschneiden(dataUrl: string, eckenNormiert: Ecken, seitenverhaeltnis: number): Promise<string> {
  if (!canvasVerfuegbar()) return dataUrl;
  const img = await bildLaden(dataUrl);
  const f = begrenzungsfaktor(img.naturalWidth, img.naturalHeight, MAX_KANTE);
  const breite = Math.max(1, Math.round(img.naturalWidth * f));
  const hoehe = Math.max(1, Math.round(img.naturalHeight * f));
  const quelle = leinwand(breite, hoehe);
  quelle.ctx.drawImage(img, 0, 0, breite, hoehe);
  const pixel = quelle.ctx.getImageData(0, 0, breite, hoehe);
  const ecken = eckenNormiert.map((p) => ({ x: p.x * breite, y: p.y * hoehe })) as unknown as Ecken;
  const ziel = zielgroesse(ecken, seitenverhaeltnis, MAX_KANTE);
  const ergebnis = entzerren({ breite, hoehe, daten: pixel.data }, ecken, ziel);
  const aus = leinwand(ergebnis.breite, ergebnis.hoehe);
  const bild = aus.ctx.createImageData(ergebnis.breite, ergebnis.hoehe);
  bild.data.set(ergebnis.daten);
  aus.ctx.putImageData(bild, 0, 0);
  return aus.c.toDataURL('image/jpeg', JPEG_QUALITAET);
}
