/**
 * Ausgabe eines Buches: Format, Unterformat, Sonderausgabe, Exemplar und Preis (REQ-056 bis REQ-059)
 * sowie Genres, Tropes und Inhaltswarnungen (REQ-052, REQ-053). Reine Fachlogik ohne UI und Speicher.
 */

/** Formate in fester Reihenfolge (REQ-058). */
export const FORMATE = [
  { id: 'print', name: 'Print' },
  { id: 'ebook', name: 'E-Book' },
  { id: 'hoerbuch', name: 'Hörbuch' },
] as const;
export type FormatId = (typeof FORMATE)[number]['id'];

/** Unterformate von „Print“ (REQ-058). */
export const UNTERFORMATE = [
  { id: 'hardcover', name: 'Hardcover' },
  { id: 'taschenbuch', name: 'Taschenbuch' },
  { id: 'kleinformat', name: 'Kleinformat' },
  { id: 'weissNicht', name: 'Weiß ich nicht' },
] as const;
export type UnterformatId = (typeof UNTERFORMATE)[number]['id'];

/** Genau drei Sonderausgaben (REQ-058, AK-6). */
export const SONDERAUSGABEN = [
  { id: 'farbschnitt', name: 'Farbschnitt' },
  { id: 'erstausgabe', name: 'Erstausgabe' },
  { id: 'sammlerausgabe', name: 'Sammlerausgabe' },
] as const;
export type SonderausgabeId = (typeof SONDERAUSGABEN)[number]['id'];

/** Eigentumsstatus des Exemplars (REQ-058). */
export const EXEMPLARE = [
  { id: 'meins', name: 'Meins' },
  { id: 'ichWillEs', name: 'Ich will es' },
  { id: 'geliehen', name: 'Geliehen' },
  { id: 'verliehen', name: 'Verliehen' },
  { id: 'verkauft', name: 'Verkauft' },
] as const;
export type ExemplarId = (typeof EXEMPLARE)[number]['id'];

const istIn =
  <T extends string>(liste: readonly { id: T }[]) =>
  (w: unknown): w is T =>
    liste.some((e) => e.id === w);

export const istFormatId = istIn(FORMATE);
export const istUnterformatId = istIn(UNTERFORMATE);
export const istSonderausgabeId = istIn(SONDERAUSGABEN);
export const istExemplarId = istIn(EXEMPLARE);

const nameVon = <T extends string>(liste: readonly { id: T; name: string }[], id: T | undefined): string | undefined =>
  liste.find((e) => e.id === id)?.name;

/** Angaben des Fensters „Format“; fehlend = nicht gewählt (REQ-058, AK-2). */
export interface Formatangaben {
  format?: FormatId;
  unterformat?: UnterformatId;
  sonderausgabe?: SonderausgabeId;
  exemplar?: ExemplarId;
}

/**
 * Bereinigt die Auswahl beim Sichern: Unterformat und Sonderausgabe gibt es nur bei „Print“
 * (Annahme: bei E-Book/Hörbuch ist die Karte nicht sichtbar, ihre Auswahl wird verworfen).
 */
export function formatangabenBereinigen(a: Formatangaben): Formatangaben {
  const e: Formatangaben = {};
  if (a.format) e.format = a.format;
  if (a.format === 'print' && a.unterformat) e.unterformat = a.unterformat;
  if (a.format === 'print' && a.sonderausgabe) e.sonderausgabe = a.sonderausgabe;
  if (a.exemplar) e.exemplar = a.exemplar;
  return e;
}

/** Sonderausgabe antippen: wählt sie als einzige; die gewählte erneut antippen hebt die Auswahl auf (REQ-058, AK-5). */
export const sonderausgabeAntippen = (aktuell: SonderausgabeId | undefined, id: SonderausgabeId): SonderausgabeId | undefined =>
  aktuell === id ? undefined : id;

/** Wert der Zeile „Format“, z. B. „Print · Taschenbuch“; ohne Format leer (REQ-056). */
export function formatText(a: Formatangaben): string {
  const f = nameVon(FORMATE, a.format);
  if (!f) return '';
  const u = a.format === 'print' ? nameVon(UNTERFORMATE, a.unterformat) : undefined;
  return u ? `${f} · ${u}` : f;
}

export const exemplarText = (a: Formatangaben): string => nameVon(EXEMPLARE, a.exemplar) ?? '';
export const sonderausgabeName = (id: SonderausgabeId | undefined): string | undefined => nameVon(SONDERAUSGABEN, id);
/** Wert der Zeile „Sonderausgabe“; ohne Auswahl „Keins“ (REQ-056, AK-4/AK-5). */
export const sonderausgabeText = (a: Formatangaben): string => sonderausgabeName(a.sonderausgabe) ?? 'Keins';

/** Text der Zeile „Preis“ ohne gespeicherten Preis (REQ-056, AK-5). */
export const PREIS_LEER = 'Trag ein, was du bezahlt hast';

/** Preis in Cent → „12,99 €“ (REQ-059). */
export function preisText(cent: number): string {
  const euro = Math.floor(cent / 100);
  const rest = String(cent % 100).padStart(2, '0');
  return `${euro},${rest} €`;
}

export type PreisPruefung = { ok: true; cent: number } | { ok: false; grund: 'leer' | 'ungueltig' };

/**
 * Eingabe im Menü „Preis“ prüfen (REQ-059): Euro mit höchstens zwei Nachkommastellen, Komma als Trennzeichen
 * (ein Punkt wird ebenfalls angenommen); ein „€“ und Leerzeichen werden ignoriert. Liefert den Betrag in Cent.
 */
export function preisPruefen(eingabe: string): PreisPruefung {
  const text = eingabe.replace(/€/g, '').replace(/\s/g, '');
  if (text === '') return { ok: false, grund: 'leer' };
  const m = /^(\d{1,7})(?:[,.](\d{1,2}))?$/.exec(text);
  if (!m) return { ok: false, grund: 'ungueltig' };
  const cent = Number(m[1]) * 100 + Number((m[2] ?? '0').padEnd(2, '0'));
  return { ok: true, cent };
}

/** Maße eines Buches in Millimetern (REQ-072); fehlend = kein Wert. */
export interface Masse {
  breiteMm?: number;
  hoeheMm?: number;
  dickeMm?: number;
}

/** Gespeicherter Maßwert: ganzzahlige Millimeter > 0. */
export const istMassMm = (w: unknown): w is number => typeof w === 'number' && Number.isInteger(w) && w > 0;

/** Text der Zeile „Maße“ ohne hinterlegte Werte (REQ-072, AK-2). */
export const MASSE_LEER = 'Trag die Maße ein';

/** Millimeter → Zentimeter mit genau einer Nachkommastelle und Komma, z. B. 210 → „21,0“. */
export const mmText = (mm: number): string => `${Math.floor(mm / 10)},${mm % 10}`;

/** Millimeter → Eingabetext im Blatt „Maße“ (wie die Anzeige); fehlend → leer. */
export const massEingabeText = (mm: number | undefined): string => (mm === undefined ? '' : mmText(mm));

/** Hat das Buch mindestens einen Maßwert? */
export const hatMasse = (m: Masse): boolean => m.breiteMm !== undefined || m.hoeheMm !== undefined || m.dickeMm !== undefined;

/** Wert der Zeile „Maße“: „13,5 × 21,0 × 3,2 cm“, fehlender Einzelwert „–“; ohne Werte leer (REQ-072, AK-2). */
export function masseText(m: Masse): string {
  if (!hatMasse(m)) return '';
  const t = (mm: number | undefined) => (mm === undefined ? '–' : mmText(mm));
  return `${t(m.breiteMm)} × ${t(m.hoeheMm)} × ${t(m.dickeMm)} cm`;
}

export type MassPruefung = { ok: true; mm?: number } | { ok: false };

/**
 * Ein Feld im Blatt „Maße“ prüfen (REQ-072): leer = kein Wert; sonst Zahl > 0 in Zentimetern mit höchstens einer
 * Nachkommastelle, Komma oder Punkt als Trennzeichen. Leerzeichen am Rand werden ignoriert. Liefert Millimeter.
 * Annahme des Entwicklers: höchstens vier Stellen vor dem Komma.
 */
export function massPruefen(eingabe: string): MassPruefung {
  const text = eingabe.trim();
  if (text === '') return { ok: true };
  const m = /^(\d{1,4})(?:[,.](\d))?$/.exec(text);
  if (!m) return { ok: false };
  const mm = Number(m[1]) * 10 + Number(m[2] ?? '0');
  return mm > 0 ? { ok: true, mm } : { ok: false };
}

/** Zentimeter (z. B. aus einer Quelle) → ganze Millimeter, gerundet auf eine Nachkommastelle; ungültig → undefined. */
export function cmZuMm(cm: number): number | undefined {
  if (!Number.isFinite(cm)) return undefined;
  const mm = Math.round(cm * 10);
  return mm > 0 ? mm : undefined;
}

/** Seitenanzahl ändern (REQ-057, AK-5): kleiner als die gespeicherte aktuelle Seite ist nicht möglich. */
export const seitenanzahlErlaubt = (seitenanzahl: number, aktuelleSeite: number | undefined): boolean =>
  aktuelleSeite === undefined || seitenanzahl >= aktuelleSeite;

/** Abgekürzte Monatsnamen für „Hinzugefügt“ (REQ-056, AK-6). */
export const MONATE_KURZ = ['Jan.', 'Feb.', 'März', 'Apr.', 'Mai', 'Juni', 'Juli', 'Aug.', 'Sept.', 'Okt.', 'Nov.', 'Dez.'] as const;

/** Eintragungsdatum (ISO) → „Okt. 2026“ (lokale Zeit); ungültig oder fehlend → leer. */
export function hinzugefuegtText(eingetragenAm: string | undefined): string {
  if (!eingetragenAm) return '';
  const d = new Date(eingetragenAm);
  if (Number.isNaN(d.getTime())) return '';
  return `${MONATE_KURZ[d.getMonth()]} ${d.getFullYear()}`;
}

/** Liste nicht leerer Namen (Genres, Tropes, Inhaltswarnungen) aus gespeicherten Daten; leer → undefined. */
export function namenListeAusDaten(daten: unknown): string[] | undefined {
  if (!Array.isArray(daten)) return undefined;
  const liste = daten.filter((n): n is string => typeof n === 'string' && n.trim() !== '');
  return liste.length > 0 ? liste : undefined;
}

/**
 * Feld „ISBN“ (REQ-063, AK-3): nur Ziffern; ein „X“ ist nur als zehnte Stelle erlaubt (Prüfziffer der ISBN-10,
 * Sprint-06-Plan). Mit „X“ höchstens 10, sonst höchstens 13 Stellen. Kleines „x“ wird zu „X“.
 */
export function isbnFiltern(wert: string): string {
  let ergebnis = '';
  for (const z of wert.toUpperCase()) {
    if (ergebnis.endsWith('X')) break;
    if (/\d/.test(z) && ergebnis.length < 13) ergebnis += z;
    else if (z === 'X' && ergebnis.length === 9) ergebnis += z;
  }
  return ergebnis;
}

/** ISBN gültig: 10 oder 13 Stellen und Prüfziffer stimmt (REQ-063). „X“ steht bei ISBN-10 für 10. */
export function isbnGueltig(isbn: string): boolean {
  if (/^\d{9}[\dX]$/.test(isbn)) {
    let summe = 0;
    for (let i = 0; i < 10; i++) summe += (10 - i) * (isbn[i] === 'X' ? 10 : Number(isbn[i]));
    return summe % 11 === 0;
  }
  if (/^\d{13}$/.test(isbn)) {
    let summe = 0;
    for (let i = 0; i < 13; i++) summe += (i % 2 === 0 ? 1 : 3) * Number(isbn[i]);
    return summe % 10 === 0;
  }
  return false;
}

/** Datumsfeld TT.MM.JJJJ: nur Ziffern (höchstens acht), Punkte werden selbst gesetzt (REQ-060, REQ-064). */
export function datumFiltern(wert: string): string {
  const z = wert.replace(/\D/g, '').slice(0, 8);
  if (z.length <= 2) return z;
  if (z.length <= 4) return `${z.slice(0, 2)}.${z.slice(2)}`;
  return `${z.slice(0, 2)}.${z.slice(2, 4)}.${z.slice(4)}`;
}

/** Existierendes Kalenderdatum im Format TT.MM.JJJJ → [Jahr, Monat 1–12, Tag]; sonst undefined. */
function datumTeile(wert: string): [number, number, number] | undefined {
  const m = /^(\d{2})\.(\d{2})\.(\d{4})$/.exec(wert);
  if (!m) return undefined;
  const [t, mo, j] = [Number(m[1]), Number(m[2]), Number(m[3])];
  const d = new Date(j, mo - 1, t);
  if (d.getFullYear() !== j || d.getMonth() !== mo - 1 || d.getDate() !== t) return undefined;
  return [j, mo, t];
}

/** Zeitpunkt → TT.MM.JJJJ in lokaler Zeit (Vorbelegung des Blatts „Hinzugefügt“, REQ-064, AK-1). */
export function datumText(zeitpunkt: Date): string {
  const zwei = (n: number) => String(n).padStart(2, '0');
  return `${zwei(zeitpunkt.getDate())}.${zwei(zeitpunkt.getMonth() + 1)}.${zeitpunkt.getFullYear()}`;
}

/** Eintragungsdatum (ISO) → TT.MM.JJJJ; fehlend oder ungültig → leer. */
export function eintragungsdatumText(eingetragenAm: string | undefined): string {
  if (!eingetragenAm) return '';
  const d = new Date(eingetragenAm);
  return Number.isNaN(d.getTime()) ? '' : datumText(d);
}

export type DatumPruefung = { ok: true; datum: string } | { ok: false };

/** „Erschienen“ (REQ-060, AK-3): existierendes Kalenderdatum TT.MM.JJJJ. */
export function erschienenPruefen(eingabe: string): DatumPruefung {
  return datumTeile(eingabe) ? { ok: true, datum: eingabe } : { ok: false };
}

/** „Hinzugefügt“ (REQ-064): existierendes Kalenderdatum TT.MM.JJJJ, nicht nach dem heutigen Tag (lokale Zeit). */
export function hinzugefuegtPruefen(eingabe: string, jetzt: Date): DatumPruefung {
  const teile = datumTeile(eingabe);
  if (!teile) return { ok: false };
  const [j, mo, t] = teile;
  const heute = [jetzt.getFullYear(), jetzt.getMonth() + 1, jetzt.getDate()];
  const zahl = (a: number[]) => a[0] * 10000 + a[1] * 100 + a[2];
  return zahl([j, mo, t]) > zahl(heute) ? { ok: false } : { ok: true, datum: eingabe };
}

/**
 * Neues Eintragungsdatum (ISO) aus einem geprüften Datum TT.MM.JJJJ (REQ-064). Ist es derselbe Tag wie `bisher`,
 * bleibt der bisherige Zeitpunkt erhalten (Reihenfolge des Anlegens bleibt stabil); sonst 12:00 Uhr lokaler Zeit,
 * damit der Tag in jeder Zeitzone gleich angezeigt wird.
 */
export function eintragungsdatumAusText(datum: string, bisher?: string): string {
  if (bisher && eintragungsdatumText(bisher) === datum) return bisher;
  const teile = datumTeile(datum);
  if (!teile) throw new Error('Datum ungültig');
  const [j, mo, t] = teile;
  return new Date(j, mo - 1, t, 12).toISOString();
}

/** Kalendertag „JJJJ-MM-TT“ → [Jahr, Monat 1–12, Tag]; sonst undefined. */
function kalendertagTeile(tag: string | undefined): [number, number, number] | undefined {
  const m = tag ? /^(\d{4})-(\d{2})-(\d{2})$/.exec(tag) : null;
  return m ? [Number(m[1]), Number(m[2]), Number(m[3])] : undefined;
}

/** „Beendet am“ (REQ-085) im Format der Zeile „Hinzugefügt“, z. B. „März 2019“; ohne Datum leer. */
export function beendetText(beendetAm: string | undefined): string {
  const teile = kalendertagTeile(beendetAm);
  return teile ? `${MONATE_KURZ[teile[1] - 1]} ${teile[0]}` : '';
}

/** „Beendet am“ → TT.MM.JJJJ für das Datumsblatt (REQ-085); ohne Datum leer. */
export function beendetDatumText(beendetAm: string | undefined): string {
  const teile = kalendertagTeile(beendetAm);
  const zwei = (n: number) => String(n).padStart(2, '0');
  return teile ? `${zwei(teile[2])}.${zwei(teile[1])}.${teile[0]}` : '';
}

/** Geprüftes Datum TT.MM.JJJJ → „Beendet am“ als „JJJJ-MM-TT“ (REQ-085). */
export function beendetAusText(datum: string): string {
  const teile = datumTeile(datum);
  if (!teile) throw new Error('Datum ungültig');
  return `${teile[0]}-${datum.slice(3, 5)}-${datum.slice(0, 2)}`;
}
