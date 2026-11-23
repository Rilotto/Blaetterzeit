/**
 * Fachliches Kernmodell „Buch“ (REQ-008). Keine Abhängigkeit zu UI oder Speicher.
 * Begriffe siehe docs/glossary.md.
 */
import {
  istExemplarId,
  istFormatId,
  istMassMm,
  istSonderausgabeId,
  istUnterformatId,
  namenListeAusDaten,
  type ExemplarId,
  type FormatId,
  type SonderausgabeId,
  type UnterformatId,
} from './ausgabe';
import { bewertungenAusDaten, type Bewertungen } from './bewertung';

/**
 * Zentrale, geordnete Definition der Lesestatus (REQ-008).
 * Einzige Stelle, an der Lesestatus und ihre Bezeichnungen festgelegt werden.
 * Bezeichnungen in der Schreibweise des CEO.
 */
export const LESESTATUS = [
  { id: 'ungelesen', bezeichnung: 'ungelesen' },
  { id: 'am_lesen', bezeichnung: 'am lesen' },
  { id: 'gelesen', bezeichnung: 'gelesen' },
  { id: 'abgebrochen', bezeichnung: 'abgebrochen' },
  { id: 'wunschliste', bezeichnung: 'Wunschliste' },
] as const;

export type LesestatusId = (typeof LESESTATUS)[number]['id'];

/** Lesestatus eines neu angelegten Buches (REQ-031, AK-6; REQ-021). */
export const STANDARD_LESESTATUS: LesestatusId = 'ungelesen';

/** Prüft, ob ein Wert eine gültige Lesestatus-ID ist. */
export function istLesestatusId(wert: unknown): wert is LesestatusId {
  return LESESTATUS.some((s) => s.id === wert);
}

/**
 * Ein Buch. Weitere Angaben (z. B. Saga, Bewertung) werden als
 * zusätzliche, optionale Felder ergänzt.
 */
export interface Buch {
  /** UUID – nie fortlaufende Nummern, damit späterer Sync/Merge kollisionsfrei bleibt. */
  id: string;
  titel: string;
  /** Optionales Buchcover (Bild-URL bzw. Data-URL). */
  cover?: string;
  status: LesestatusId;
  /** Optional genau ein Autor (REQ-008). */
  autor?: string;
  /** Optionales Erscheinungsjahr, vierstellig (REQ-033). */
  erscheinungsjahr?: number;
  /** Optionales Erscheinungsdatum im Format TT.MM.JJJJ (REQ-033). */
  erscheinungsdatum?: string;
  /** Optionale Seitenanzahl (REQ-025, REQ-031). */
  seitenanzahl?: number;
  /** Aktuelle Seite im Fortschrittsmodus „Seite“ (REQ-024). */
  aktuelleSeite?: number;
  /** Fortschritt in ganzen Prozent im Fortschrittsmodus „%“ (REQ-024). */
  fortschrittProzent?: number;
  /** Zuletzt gesicherter Fortschrittsmodus; ohne Angabe gilt „seite“ (REQ-024). */
  fortschrittsmodus?: Fortschrittsmodus;
  /** Lesesitzungen: je Erhöhung des Fortschritts eine, Zeitpunkt als ISO-Zeichenkette (REQ-024, REQ-026, REQ-027). */
  sitzungen?: Sitzung[];
  /**
   * Eintragungsdatum: Zeitpunkt des Anlegens als ISO-Zeichenkette (REQ-041), änderbar (REQ-064) und leerbar (REQ-093).
   * Bücher ohne Datum stehen im Abschnitt „Alle Bücher“ oben, A–Z (REQ-093, AK-11/AK-12).
   */
  eingetragenAm?: string;
  /** Bewertungen je Kriterium, ganzzahlig 1–5; fehlender Eintrag = keine Bewertung (REQ-045). */
  bewertungen?: Bewertungen;
  /** Eigene Rezension, ungekürzt und ohne Längenbegrenzung (REQ-047, REQ-049). */
  rezension?: string;
  /** Festgelegte Genres, Tropes, markierte Inhaltswarnungen (REQ-052, REQ-053); fehlend = keine. */
  genres?: string[];
  tropes?: string[];
  inhaltswarnungen?: string[];
  /** Ausgabe (REQ-058): Format, Unterformat (nur Print), Sonderausgabe (nur Print), Exemplar; fehlend = nicht gewählt. */
  format?: FormatId;
  unterformat?: UnterformatId;
  sonderausgabe?: SonderausgabeId;
  exemplar?: ExemplarId;
  /** Bezahlter Preis in Euro-Cent, ganzzahlig ≥ 0 (REQ-059); fehlend = kein Preis gespeichert. */
  preisCent?: number;
  /** Verlag, nicht leer (REQ-063); fehlend = kein Verlag. */
  verlag?: string;
  /** ISBN-10 oder ISBN-13 ohne Trennzeichen, Prüfziffer gültig (REQ-063); fehlend = keine ISBN. */
  isbn?: string;
  /**
   * Maße in Millimetern, ganzzahlig > 0 (= Zentimeter mit einer Nachkommastelle, REQ-072); jeder Wert einzeln
   * optional, fehlend = kein Wert.
   */
  breiteMm?: number;
  hoeheMm?: number;
  dickeMm?: number;
  /**
   * „Beendet am“ (REQ-085): lokaler Kalendertag als „JJJJ-MM-TT“ (ohne Uhrzeit, damit der Tag in jeder
   * Zeitzone gleich bleibt); fehlend = kein Datum.
   */
  beendetAm?: string;
  /**
   * Bandnummer aus dem Barcode-Scan (REQ-099), ganze Zahl ≥ 1. Füllt bei der späteren Zuordnung zu einer Saga das Feld
   * „Band“ vor; die Bandnummer je Saga selbst liegt bei der Zugehörigkeit (ListenRepository, REQ-096).
   */
  bandnummer?: number;
}

export type Fortschrittsmodus = 'seite' | 'prozent';

export interface Sitzung {
  /** Zeitpunkt des Sicherns (ISO 8601). */
  zeitpunkt: string;
  /**
   * Gesicherter Fortschritt als Seitenzahl (REQ-084); im Modus „%“ Prozent × Seitenanzahl / 100, kaufmännisch
   * gerundet. Fehlt bei Sitzungen, die vor REQ-084 entstanden sind.
   */
  seite?: number;
}

/** Kalendertag „JJJJ-MM-TT“ (REQ-085, „Beendet am“). */
export function istKalendertag(wert: unknown): wert is string {
  if (typeof wert !== 'string') return false;
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(wert);
  if (!m) return false;
  const [j, mo, t] = [Number(m[1]), Number(m[2]), Number(m[3])];
  const d = new Date(Date.UTC(j, mo - 1, t));
  return d.getUTCFullYear() === j && d.getUTCMonth() === mo - 1 && d.getUTCDate() === t;
}

/** Lokaler Kalendertag eines Zeitpunkts als „JJJJ-MM-TT“. */
export function kalendertag(zeitpunkt: Date): string {
  const zwei = (n: number) => String(n).padStart(2, '0');
  return `${zeitpunkt.getFullYear()}-${zwei(zeitpunkt.getMonth() + 1)}-${zwei(zeitpunkt.getDate())}`;
}

/**
 * Lesestatus setzen (REQ-022). Wechselt der Status auf *gelesen*, wird „Beendet am“ auf heute gesetzt (REQ-085);
 * gleicher Status ändert nichts, andere Wechsel lassen „Beendet am“ unverändert.
 */
export function statusSetzen(buch: Buch, status: LesestatusId, jetzt: Date): Buch {
  if (buch.status === status) return buch;
  const neu: Buch = { ...buch, status };
  if (status === 'gelesen') neu.beendetAm = kalendertag(jetzt);
  return neu;
}

export const istFortschrittsmodus = (wert: unknown): wert is Fortschrittsmodus => wert === 'seite' || wert === 'prozent';

/** Die optionalen Angaben eines Buches (ohne Cover). */
export const OPTIONALE_BUCHFELDER = [
  'autor',
  'erscheinungsjahr',
  'erscheinungsdatum',
  'seitenanzahl',
  'aktuelleSeite',
  'fortschrittProzent',
  'fortschrittsmodus',
  'sitzungen',
  'eingetragenAm',
  'bewertungen',
  'rezension',
  'genres',
  'tropes',
  'inhaltswarnungen',
  'format',
  'unterformat',
  'sonderausgabe',
  'exemplar',
  'preisCent',
  'verlag',
  'isbn',
  'breiteMm',
  'hoeheMm',
  'dickeMm',
  'beendetAm',
  'bandnummer',
] as const;

export interface NeuesBuch {
  titel: string;
  status: LesestatusId;
  cover?: string;
  autor?: string;
  erscheinungsjahr?: number;
  erscheinungsdatum?: string;
  seitenanzahl?: number;
  /** Eintragungsdatum (ISO), REQ-041. */
  eingetragenAm?: string;
  /** Bandnummer aus dem Barcode-Scan (REQ-099). */
  bandnummer?: number;
}

/** Bandnummer: ganze Zahl ≥ 1 (REQ-096, REQ-099). */
export const istBandnummer = (w: unknown): w is number => typeof w === 'number' && Number.isInteger(w) && w >= 1;

/** Prüft, ob ein Wert ein gültiger ISO-Zeitpunkt ist (Eintragungsdatum, REQ-041). */
export const istZeitpunkt = (wert: unknown): wert is string => typeof wert === 'string' && !Number.isNaN(Date.parse(wert));

/** Legt ein Buch mit neuer UUID an. Nicht gesetzte optionale Angaben fehlen im Ergebnis. */
export function neuesBuch(eingabe: NeuesBuch): Buch {
  if (!eingabe.titel.trim()) throw new Error('Buchtitel darf nicht leer sein');
  const buch: Buch = { id: crypto.randomUUID(), titel: eingabe.titel, status: eingabe.status };
  if (eingabe.cover !== undefined) buch.cover = eingabe.cover;
  if (eingabe.autor !== undefined) buch.autor = eingabe.autor;
  if (eingabe.erscheinungsjahr !== undefined) buch.erscheinungsjahr = eingabe.erscheinungsjahr;
  if (eingabe.erscheinungsdatum !== undefined) buch.erscheinungsdatum = eingabe.erscheinungsdatum;
  if (eingabe.seitenanzahl !== undefined) buch.seitenanzahl = eingabe.seitenanzahl;
  if (eingabe.eingetragenAm !== undefined) buch.eingetragenAm = eingabe.eingetragenAm;
  if (istBandnummer(eingabe.bandnummer)) buch.bandnummer = eingabe.bandnummer;
  return buch;
}

/** Prüft ein Erscheinungsdatum im Format TT.MM.JJJJ (gültiges Kalenderdatum). */
export function istErscheinungsdatum(wert: unknown): wert is string {
  if (typeof wert !== 'string') return false;
  const m = /^(\d{2})\.(\d{2})\.(\d{4})$/.exec(wert);
  if (!m) return false;
  const [t, mo, j] = [Number(m[1]), Number(m[2]), Number(m[3])];
  const d = new Date(Date.UTC(j, mo - 1, t));
  return d.getUTCFullYear() === j && d.getUTCMonth() === mo - 1 && d.getUTCDate() === t;
}

/**
 * Baut aus einem gespeicherten Datensatz ein Buch (für Speicher-Implementierungen und Demodaten).
 * Fehlende bzw. leere optionale Angaben (undefined/null) fehlen im Ergebnis; ungültige Pflichtangaben werfen.
 */
export function buchAusDaten(daten: unknown): Buch {
  const e = (daten ?? {}) as Record<string, unknown>;
  if (typeof e.id !== 'string' || typeof e.titel !== 'string' || !istLesestatusId(e.status)) {
    throw new Error('Kein gültiges Buch { id, titel, status }');
  }
  const buch: Buch = { id: e.id, titel: e.titel, status: e.status };
  if (typeof e.cover === 'string') buch.cover = e.cover;
  if (typeof e.autor === 'string') buch.autor = e.autor;
  if (typeof e.erscheinungsjahr === 'number' && Number.isInteger(e.erscheinungsjahr)) buch.erscheinungsjahr = e.erscheinungsjahr;
  if (typeof e.erscheinungsdatum === 'string') buch.erscheinungsdatum = e.erscheinungsdatum;
  if (typeof e.seitenanzahl === 'number' && Number.isInteger(e.seitenanzahl)) buch.seitenanzahl = e.seitenanzahl;
  if (typeof e.aktuelleSeite === 'number' && Number.isInteger(e.aktuelleSeite)) buch.aktuelleSeite = e.aktuelleSeite;
  if (typeof e.fortschrittProzent === 'number' && Number.isInteger(e.fortschrittProzent)) {
    buch.fortschrittProzent = e.fortschrittProzent;
  }
  if (istFortschrittsmodus(e.fortschrittsmodus)) buch.fortschrittsmodus = e.fortschrittsmodus;
  if (Array.isArray(e.sitzungen)) {
    buch.sitzungen = e.sitzungen
      .filter((s): s is { zeitpunkt: string; seite?: unknown } => typeof (s as { zeitpunkt?: unknown })?.zeitpunkt === 'string')
      .map((s) => {
        const sitzung: Sitzung = { zeitpunkt: s.zeitpunkt };
        // Seitenzahl nur als ganze Zahl ab 0 (REQ-084); ältere Sitzungen haben keine.
        if (typeof s.seite === 'number' && Number.isInteger(s.seite) && s.seite >= 0) sitzung.seite = s.seite;
        return sitzung;
      });
  }
  // Fehlt das Eintragungsdatum oder ist es ungültig, fehlt es im Ergebnis (robust für ältere Datensätze, REQ-041).
  if (istZeitpunkt(e.eingetragenAm)) buch.eingetragenAm = e.eingetragenAm;
  const bewertungen = bewertungenAusDaten(e.bewertungen);
  if (bewertungen) buch.bewertungen = bewertungen;
  // Rezension: nur nicht leerer Text (REQ-049, AK-8).
  if (typeof e.rezension === 'string' && e.rezension.trim() !== '') buch.rezension = e.rezension;
  const genres = namenListeAusDaten(e.genres);
  if (genres) buch.genres = genres;
  const tropes = namenListeAusDaten(e.tropes);
  if (tropes) buch.tropes = tropes;
  const warnungen = namenListeAusDaten(e.inhaltswarnungen);
  if (warnungen) buch.inhaltswarnungen = warnungen;
  if (istFormatId(e.format)) buch.format = e.format;
  if (istUnterformatId(e.unterformat)) buch.unterformat = e.unterformat;
  if (istSonderausgabeId(e.sonderausgabe)) buch.sonderausgabe = e.sonderausgabe;
  if (istExemplarId(e.exemplar)) buch.exemplar = e.exemplar;
  if (typeof e.preisCent === 'number' && Number.isInteger(e.preisCent) && e.preisCent >= 0) buch.preisCent = e.preisCent;
  if (typeof e.verlag === 'string' && e.verlag.trim() !== '') buch.verlag = e.verlag;
  if (typeof e.isbn === 'string' && e.isbn !== '') buch.isbn = e.isbn;
  if (istMassMm(e.breiteMm)) buch.breiteMm = e.breiteMm;
  if (istMassMm(e.hoeheMm)) buch.hoeheMm = e.hoeheMm;
  if (istMassMm(e.dickeMm)) buch.dickeMm = e.dickeMm;
  if (istKalendertag(e.beendetAm)) buch.beendetAm = e.beendetAm;
  if (istBandnummer(e.bandnummer)) buch.bandnummer = e.bandnummer;
  return buch;
}
