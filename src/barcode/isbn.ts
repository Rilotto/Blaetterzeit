// ISBN aus einem gescannten Barcode bzw. einer Texteingabe (REQ-061, REQ-062).
import { isbnGueltig } from '@/domain/ausgabe';

/**
 * Normalisiert eine ISBN: Bindestriche und Leerzeichen sind erlaubt und werden entfernt,
 * „x“ an letzter Stelle einer ISBN-10 wird zu „X“. Liefert `null`, wenn keine gültige ISBN-10/-13
 * (inkl. Prüfziffer) vorliegt. ISBN-13 muss mit 978 oder 979 beginnen (Bookland-EAN).
 */
export function isbnNormalisieren(roh: string): string | null {
  const ohneTrenner = roh.trim().replace(/[\s-]/g, '').toUpperCase();
  if (!/^(\d{13}|\d{9}[\dX])$/.test(ohneTrenner)) return null;
  if (ohneTrenner.length === 13 && !/^97[89]/.test(ohneTrenner)) return null;
  return isbnGueltig(ohneTrenner) ? ohneTrenner : null;
}

/** Erste gültige ISBN aus den Rohwerten erkannter Barcodes, sonst `null` (z. B. Preis-Barcode, QR-Code). */
export function isbnAusBarcodes(rohwerte: readonly string[]): string | null {
  for (const r of rohwerte) {
    const isbn = isbnNormalisieren(r);
    if (isbn) return isbn;
  }
  return null;
}
