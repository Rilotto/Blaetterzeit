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
