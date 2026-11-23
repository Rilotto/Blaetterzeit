// Eingaberegeln des Blatts „Manueller Eintrag“ (REQ-030, REQ-031, REQ-060). Ohne UI, damit sie einzeln testbar sind.
import {
  eintragungsdatumAusText,
  erscheinungAusText,
  erschienenErgebnis,
  formatangabenBereinigen,
  isbnFiltern,
  istMassMm,
  isbnGueltig,
  type ExemplarId,
  type FormatId,
  type SonderausgabeId,
  type UnterformatId,
} from '@/domain/ausgabe';
import { istBandnummer, neuesBuch, STANDARD_LESESTATUS, type Buch } from '@/domain/buch';

export interface Eingaben {
  titel: string;
  autor: string;
  seiten: string;
  /** Angaben der Karte „Ausgabe“ (REQ-060); fehlend = nicht eingegeben. */
  format?: FormatId;
  unterformat?: UnterformatId;
  sonderausgabe?: SonderausgabeId;
  exemplar?: ExemplarId;
  preisCent?: number;
  verlag?: string;
  isbn?: string;
  /** Maße in Millimetern (REQ-072); fehlend = kein Wert. */
  breiteMm?: number;
  hoeheMm?: number;
  dickeMm?: number;
  /** „Erschienen“ als TT.MM.JJJJ oder JJJJ (REQ-060, REQ-092); das Feld „JAHR“ entfällt. */
  erschienen?: string;
  /** Bandnummer aus dem Barcode-Scan (REQ-099); wird mit dem Buch gespeichert. */
  bandnummer?: number;
  /** Überschriebenes „Hinzugefügt“ als TT.MM.JJJJ (REQ-060, AK-9); fehlend = Zeitpunkt des Anlegens. */
  hinzugefuegt?: string;
}

export const LEERE_EINGABEN: Eingaben = { titel: '', autor: '', seiten: '' };

/**
 * Vorbelegung des Blatts „Manueller Eintrag“, z. B. aus einem Barcode-Treffer (REQ-062, Teil B).
 * Alle Angaben optional; ungültige Werte werden beim Öffnen verworfen bzw. gefiltert.
 */
export interface Vorbelegung {
  titel?: string;
  autor?: string;
  erscheinungsjahr?: number;
  seitenanzahl?: number;
  /** TT.MM.JJJJ */
  erscheinungsdatum?: string;
  verlag?: string;
  /** ISBN-10/-13; Trennzeichen werden entfernt, ungültige Prüfziffer wird verworfen. */
  isbn?: string;
  format?: FormatId;
  unterformat?: UnterformatId;
  sonderausgabe?: SonderausgabeId;
  exemplar?: ExemplarId;
  preisCent?: number;
  /** Maße in Millimetern, nur eindeutig zuordenbare Werte der Quelle (REQ-072, AK-8). */
  breiteMm?: number;
  hoeheMm?: number;
  dickeMm?: number;
  /** Bandnummer der Reihe (REQ-099); keine ganze Zahl ≥ 1 → nicht übernommen. */
  bandnummer?: number;
  /** Name der Reihe laut Quelle; wird nicht automatisch einer Saga zugeordnet (REQ-099, AK-7). */
  reihe?: string;
  /** Frontcover als Data-URL (wird beim Anlegen im Bildspeicher abgelegt, REQ-019). */
  cover?: string;
}

/** Feld „SEITEN“: nur Ziffern, höchstens fünf (Annahme des Entwicklers). */
export const seitenFiltern = (wert: string): string => wert.replace(/\D/g, '').slice(0, 5);

/** Titel fehlt, wenn leer oder nur aus Leerzeichen (REQ-031, AK-4/AK-11). */
export const titelFehlt = (e: Eingaben): boolean => e.titel.trim() === '';

/** Seitenzahl ist Pflicht (REQ-060, AK-5); 0 gilt als keine Angabe. */
export const seitenFehlen = (e: Eingaben): boolean => e.seiten === '' || Number(e.seiten) <= 0;

/** „Erschienen“ ungültig (REQ-031 AK-12/AK-13, REQ-092): weder leer noch TT.MM.JJJJ bis heute noch JJJJ bis zum laufenden Jahr. */
export const erschienenUngueltig = (e: Eingaben, jetzt: Date = new Date()): boolean =>
  e.erschienen !== undefined && erschienenErgebnis(e.erschienen, jetzt) === null;

/** Eingaben aus einer Vorbelegung; ungültige Angaben fehlen. */
export function eingabenAusVorbelegung(v: Vorbelegung | undefined): Eingaben {
  const e: Eingaben = { ...LEERE_EINGABEN };
  if (!v) return e;
  if (v.titel) e.titel = v.titel;
  if (v.autor) e.autor = v.autor;
  if (v.seitenanzahl !== undefined && Number.isInteger(v.seitenanzahl) && v.seitenanzahl > 0) e.seiten = seitenFiltern(String(v.seitenanzahl));
  // „Erschienen“ (REQ-092): vollständiges Datum als TT.MM.JJJJ, sonst nur das Jahr als JJJJ.
  if (v.erscheinungsdatum && erschienenErgebnis(v.erscheinungsdatum)) e.erschienen = v.erscheinungsdatum;
  else if (v.erscheinungsjahr !== undefined && erschienenErgebnis(String(v.erscheinungsjahr))) e.erschienen = String(v.erscheinungsjahr);
  if (istBandnummer(v.bandnummer)) e.bandnummer = v.bandnummer;
  if (v.verlag?.trim()) e.verlag = v.verlag.trim();
  if (v.isbn) {
    const isbn = isbnFiltern(v.isbn.replace(/[^0-9Xx]/g, ''));
    if (isbnGueltig(isbn)) e.isbn = isbn;
  }
  Object.assign(e, formatangabenBereinigen(v));
  if (v.preisCent !== undefined && Number.isInteger(v.preisCent) && v.preisCent >= 0) e.preisCent = v.preisCent;
  if (istMassMm(v.breiteMm)) e.breiteMm = v.breiteMm;
  if (istMassMm(v.hoeheMm)) e.hoeheMm = v.hoeheMm;
  if (istMassMm(v.dickeMm)) e.dickeMm = v.dickeMm;
  return e;
}

/**
 * Baut aus gültigen Eingaben ein neues Buch mit neuer UUID und Lesestatus „ungelesen“ (REQ-031, REQ-060).
 * Leere optionale Felder fehlen im Buch – Platzhaltertexte werden nie gespeichert.
 * Das Eintragungsdatum ist `jetzt` (REQ-041) oder das überschriebene Datum (REQ-060, AK-9).
 */
export function buchAusEingaben(e: Eingaben, jetzt: Date = new Date()): Buch {
  if (titelFehlt(e)) throw new Error('Titel fehlt');
  if (seitenFehlen(e)) throw new Error('Seitenzahl fehlt');
  if (erschienenUngueltig(e, jetzt)) throw new Error('Erschienen ungültig');
  const autor = e.autor.trim();
  const buch = neuesBuch({
    titel: e.titel.trim(),
    status: STANDARD_LESESTATUS,
    ...(autor ? { autor } : {}),
    ...erscheinungAusText(e.erschienen ? erschienenErgebnis(e.erschienen, jetzt) ?? '' : ''),
    ...(istBandnummer(e.bandnummer) ? { bandnummer: e.bandnummer } : {}),
    seitenanzahl: Number(e.seiten),
    eingetragenAm: e.hinzugefuegt ? eintragungsdatumAusText(e.hinzugefuegt) : jetzt.toISOString(),
  });
  Object.assign(buch, formatangabenBereinigen(e));
  if (e.preisCent !== undefined) buch.preisCent = e.preisCent;
  if (e.verlag) buch.verlag = e.verlag;
  if (e.isbn) buch.isbn = e.isbn;
  if (istMassMm(e.breiteMm)) buch.breiteMm = e.breiteMm;
  if (istMassMm(e.hoeheMm)) buch.hoeheMm = e.hoeheMm;
  if (istMassMm(e.dickeMm)) buch.dickeMm = e.dickeMm;
  return buch;
}
