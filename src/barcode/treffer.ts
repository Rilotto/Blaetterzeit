// Treffer der ISBN-Suche (REQ-062) und Parser der beiden Quellen. Ohne Netz, damit einzeln testbar.
import type { Vorbelegung } from '@/buchanlegen/eingabe';
import { cmZuMm, type FormatId, type Masse, type UnterformatId } from '@/domain/ausgabe';
import { isbnNormalisieren } from './isbn';

export type QuelleId = 'dnb' | 'openlibrary';

/** Anzeigename je Quelle im Auswahlfenster (REQ-062, AK-2). */
export const QUELLEN_NAME: Record<QuelleId, string> = {
  dnb: 'Deutsche Nationalbibliothek',
  openlibrary: 'Open Library',
};

export interface Treffer {
  quelle: QuelleId;
  /** Angaben für das Blatt „Manueller Eintrag“; `cover` ist nach der Suche eine Data-URL (falls vorhanden). */
  angaben: Vorbelegung;
  /** Cover-Adresse der Quelle (enthält nur die ISBN bzw. eine Cover-ID der Quelle); vor dem Laden gesetzt. */
  coverUrl?: string;
}

// ---------------------------------------------------------------------------
// Hilfen
// ---------------------------------------------------------------------------

/** Entfernt Nichtsortierzeichen (DNB: U+0098/U+009C), Mehrfach-Leerzeichen und ISBD-Satzzeichen am Ende. */
export function textBereinigen(wert: string | undefined | null): string | undefined {
  if (!wert) return undefined;
  const t = wert
    .replace(/[\u0098\u009C]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\s*[/:;,=]+$/, '')
    .trim();
  return t === '' ? undefined : t;
}

const jahrAus = (wert: string | undefined): number | undefined => {
  const m = wert?.match(/\b(1[5-9]\d\d|20\d\d)\b/);
  return m ? Number(m[1]) : undefined;
};

/** Seitenzahl aus einer Umfangsangabe wie „XII, 345 Seiten“, „345 S.“ oder „345 p.“. */
export function seitenAus(umfang: string | undefined): number | undefined {
  const m = umfang?.match(/(\d+)\s*(?:Seiten|S\.|S\b|p\.|pages)/i);
  const n = m ? Number(m[1]) : NaN;
  return Number.isInteger(n) && n > 0 ? n : undefined;
}

/**
 * Preis in Cent aus einer Preisangabe der Quelle, bevorzugt Euro für Deutschland
 * (DNB 020 $c z. B. „kart. : EUR 12.00 (DE), EUR 12.40 (AT)“, „Gb. : 22,00 EUR“). Ohne Euro-Preis: undefined.
 */
export function preisCentAus(angabe: string | undefined): number | undefined {
  if (!angabe) return undefined;
  const preise: { cent: number; de: boolean }[] = [];
  const muster = /(?:EUR|€)\s*(\d{1,4})(?:[.,](\d{1,2}))?\s*(\([A-Z]{1,2}\))?|(\d{1,4})(?:[.,](\d{1,2}))?\s*(?:EUR|€)\s*(\([A-Z]{1,2}\))?/g;
  for (const m of angabe.matchAll(muster)) {
    const euro = m[1] ?? m[4];
    const cent = m[2] ?? m[5] ?? '0';
    const land = m[3] ?? m[6];
    if (euro === undefined) continue;
    preise.push({ cent: Number(euro) * 100 + Number(cent.padEnd(2, '0')), de: !land || land === '(DE)' });
  }
  return (preise.find((p) => p.de) ?? preise[0])?.cent;
}

/** Format und Unterformat aus einer Formatangabe der Quelle (DNB-Einbandart, Open-Library-„physical_format“). */
export function formatAus(angabe: string | undefined): { format?: FormatId; unterformat?: UnterformatId } {
  const t = angabe?.toLowerCase() ?? '';
  if (!t) return {};
  if (/h(ö|oe)rbuch|audio|\bcd\b|mp3|h(ö|oe)rspiel/.test(t)) return { format: 'hoerbuch' };
  if (/e-?book|epub|online-ressource|kindle|\bpdf\b/.test(t)) return { format: 'ebook' };
  if (/mass market|kleinformat/.test(t)) return { format: 'print', unterformat: 'kleinformat' };
  if (/hardcover|hardback|festeinband|\bgeb\.|gebunden|\bgb\.|\bpp\.|pappband|leinen|\bln\./.test(t)) return { format: 'print', unterformat: 'hardcover' };
  if (/paperback|taschenbuch|softcover|broschiert|broschur|kartoniert|flexibler einband|\bkart\.|\bkt\.|\bpb\.|\bbr\./.test(t)) return { format: 'print', unterformat: 'taschenbuch' };
  return {};
}

const zahlAus = (w: string): number => Number(w.replace(',', '.'));

/**
 * Höhe aus der Maßangabe der DNB (MARC 300 $c), z. B. „21 cm“, „21,5 cm“ oder „210 mm“ (REQ-072, AK-8).
 * Nur eine eindeutige Angabe mit genau einem Wert gilt; „24 x 17 cm“, Formatangaben wie „8°“ oder mehrere Werte
 * ergeben nichts.
 */
export function dnbMasseAus(angabe: string | undefined): Masse {
  if (!angabe) return {};
  if (/\d\s*(?:cm|mm)?\s*[x×]\s*\d/i.test(angabe)) return {};
  const werte = [...angabe.matchAll(/(\d+(?:[.,]\d+)?)\s*(cm|mm)\b/gi)];
  if (werte.length !== 1) return {};
  const [, zahl, einheit] = werte[0];
  const cm = einheit.toLowerCase() === 'mm' ? zahlAus(zahl) / 10 : zahlAus(zahl);
  const hoeheMm = cmZuMm(cm);
  return hoeheMm ? { hoeheMm } : {};
}

const EINHEIT_IN_CM: Record<string, number> = { cm: 1, centimeter: 1, centimeters: 1, centimetre: 1, centimetres: 1, mm: 0.1, millimeter: 0.1, millimeters: 0.1, in: 2.54, inch: 2.54, inches: 2.54 };

/**
 * Maße aus „physical_dimensions“ von Open Library, z. B. „20 x 13 x 2 centimeters“ oder „7.8 x 5.1 x 1.2 inches“
 * (REQ-072, AK-8). Eindeutig nur mit genau drei Werten und bekannter Einheit: Bei einem Buch ist der größte Wert die
 * Höhe, der mittlere die Breite und der kleinste die Dicke (die Reihenfolge der Quelle ist nicht verlässlich).
 * Andere Angaben ergeben nichts.
 */
export function openLibraryMasseAus(angabe: string | undefined): Masse {
  const m = angabe?.trim().match(/^(\d+(?:[.,]\d+)?)\s*[x×]\s*(\d+(?:[.,]\d+)?)\s*[x×]\s*(\d+(?:[.,]\d+)?)\s*([a-zA-Z]+)\.?$/);
  if (!m) return {};
  const faktor = EINHEIT_IN_CM[m[4].toLowerCase()];
  if (!faktor) return {};
  const [dicke, breite, hoehe] = [m[1], m[2], m[3]].map((w) => cmZuMm(zahlAus(w) * faktor)).sort((a, b) => (a ?? 0) - (b ?? 0));
  if (!dicke || !breite || !hoehe) return {};
  return { breiteMm: breite, hoeheMm: hoehe, dickeMm: dicke };
}

const ohneLeere = (v: Vorbelegung): Vorbelegung =>
  Object.fromEntries(Object.entries(v).filter(([, w]) => w !== undefined && w !== '')) as Vorbelegung;

/** Ein Treffer ist nur brauchbar, wenn er mindestens einen Titel hat. */
const brauchbar = (t: Treffer): boolean => !!t.angaben.titel;

// ---------------------------------------------------------------------------
// Deutsche Nationalbibliothek: SRU-Antwort mit MARC21-xml
// ---------------------------------------------------------------------------

const MARC_NS = 'http://www.loc.gov/MARC21/slim';

/** SRU-Abfrage der DNB. Übertragen wird nur die ISBN. */
export const dnbUrl = (isbn: string): string =>
  `https://services.dnb.de/sru/dnb?version=1.1&operation=searchRetrieve&query=${encodeURIComponent(`num=${isbn}`)}&recordSchema=MARC21-xml&maximumRecords=10`;

/** Cover-Dienst der DNB (MVB-Cover); nur die ISBN wird übertragen. */
export const dnbCoverUrl = (isbn: string): string => `https://portal.dnb.de/opac/mvb/cover?isbn=${isbn}`;

type Feld = { tag: string; ind2: string; unterfelder: [string, string][] };

function felder(record: Element): Feld[] {
  return Array.from(record.getElementsByTagNameNS(MARC_NS, 'datafield')).map((df) => ({
    tag: df.getAttribute('tag') ?? '',
    ind2: df.getAttribute('ind2') ?? ' ',
    unterfelder: Array.from(df.getElementsByTagNameNS(MARC_NS, 'subfield')).map(
      (sf) => [sf.getAttribute('code') ?? '', sf.textContent ?? ''] as [string, string],
    ),
  }));
}

const unterfeld = (f: Feld | undefined, code: string): string | undefined => f?.unterfelder.find(([c]) => c === code)?.[1];

/**
 * Liest alle Titeldatensätze einer DNB-SRU-Antwort (MARC21-xml). Gesuchte ISBN als Rückfall für das Feld ISBN.
 * Unlesbare Antworten ergeben keine Treffer.
 */
export function dnbTrefferLesen(xml: string, gesuchteIsbn: string): Treffer[] {
  let doc: Document;
  try {
    doc = new DOMParser().parseFromString(xml, 'application/xml');
  } catch {
    return [];
  }
  if (doc.getElementsByTagName('parsererror').length > 0) return [];
  const records = Array.from(doc.getElementsByTagNameNS(MARC_NS, 'record'));
  const ergebnis: Treffer[] = [];
  for (const rec of records) {
    const f = felder(rec);
    const erstes = (tag: string, bed: (x: Feld) => boolean = () => true) => f.find((x) => x.tag === tag && bed(x));
    const titel = textBereinigen(unterfeld(erstes('245'), 'a'));
    const autorFeld =
      erstes('100') ?? erstes('700', (x) => x.unterfelder.some(([c, w]) => (c === '4' && w.includes('aut')) || (c === 'e' && /verfasser/i.test(w))));
    const autor = textBereinigen(unterfeld(autorFeld, 'a'));
    const veroeff = erstes('264', (x) => x.ind2 === '1') ?? erstes('264') ?? erstes('260');
    const verlag = textBereinigen(unterfeld(veroeff, 'b'))?.replace(/^\[|\]$/g, '');
    const kontroll = Array.from(rec.getElementsByTagNameNS(MARC_NS, 'controlfield')).find((c) => c.getAttribute('tag') === '008');
    const jahr = jahrAus(unterfeld(veroeff, 'c')) ?? jahrAus(kontroll?.textContent?.slice(7, 11));
    const seiten = seitenAus(unterfeld(erstes('300'), 'a'));
    const isbns = f.filter((x) => x.tag === '020').flatMap((x) => x.unterfelder.filter(([c]) => c === 'a' || c === '9').map(([, w]) => w));
    const isbn = isbns.map((w) => isbnNormalisieren(w.split(/\s/)[0] ?? '')).find((w) => w !== null) ?? gesuchteIsbn;
    // Preis und Einbandart (REQ-062 AK-9): 020 $c (Bezugsbedingungen) bzw. 020 $q; Medientyp aus 337/338.
    const bezug = f.filter((x) => x.tag === '020').flatMap((x) => x.unterfelder.filter(([c]) => c === 'c' || c === 'q').map(([, w]) => w)).join(' ');
    const medium = f.filter((x) => x.tag === '337' || x.tag === '338' || x.tag === '250').map((x) => unterfeld(x, 'a') ?? '').join(' ');
    const preisCent = preisCentAus(bezug);
    const fmt = formatAus(bezug).format ? formatAus(bezug) : formatAus(medium);
    const t: Treffer = {
      quelle: 'dnb',
      // Maße (REQ-072, AK-8): Höhe aus 300 $c.
      angaben: ohneLeere({ titel, autor, verlag, erscheinungsjahr: jahr, seitenanzahl: seiten, isbn, ...fmt, preisCent, ...dnbMasseAus(unterfeld(erstes('300'), 'c')) }),
      coverUrl: dnbCoverUrl(gesuchteIsbn),
    };
    if (brauchbar(t)) ergebnis.push(t);
  }
  return ergebnis;
}

// ---------------------------------------------------------------------------
// Open Library: Books API (jscmd=data)
// ---------------------------------------------------------------------------

/** Books API von Open Library. Übertragen wird nur die ISBN. */
export const openLibraryUrl = (isbn: string): string =>
  `https://openlibrary.org/api/books?bibkeys=ISBN:${isbn}&format=json&jscmd=data`;

interface OlEintrag {
  title?: unknown;
  authors?: unknown;
  number_of_pages?: unknown;
  publishers?: unknown;
  publish_date?: unknown;
  physical_format?: unknown;
  price?: unknown;
  physical_dimensions?: unknown;
  /** Bei jscmd=details liegt der Ausgabe-Datensatz unter „details“. */
  details?: { physical_dimensions?: unknown };
  identifiers?: { isbn_13?: unknown; isbn_10?: unknown };
  cover?: { large?: unknown; medium?: unknown; small?: unknown };
}

const namen = (liste: unknown): string[] =>
  Array.isArray(liste)
    ? liste
        .map((x) => (typeof x === 'string' ? x : typeof (x as { name?: unknown })?.name === 'string' ? (x as { name: string }).name : ''))
        .map((n) => textBereinigen(n))
        .filter((n): n is string => !!n)
    : [];

const zeichen = (w: unknown): string | undefined => (typeof w === 'string' ? w : undefined);

/** Liest die Antwort der Open-Library-Books-API. Unlesbare Antworten ergeben keine Treffer. */
export function openLibraryTrefferLesen(json: string, gesuchteIsbn: string): Treffer[] {
  let daten: unknown;
  try {
    daten = JSON.parse(json);
  } catch {
    return [];
  }
  if (!daten || typeof daten !== 'object') return [];
  const ergebnis: Treffer[] = [];
  for (const eintrag of Object.values(daten as Record<string, OlEintrag>)) {
    if (!eintrag || typeof eintrag !== 'object') continue;
    const autoren = namen(eintrag.authors);
    const verlage = namen(eintrag.publishers);
    const seiten = typeof eintrag.number_of_pages === 'number' && Number.isInteger(eintrag.number_of_pages) && eintrag.number_of_pages > 0
      ? eintrag.number_of_pages
      : undefined;
    const kandidaten = [
      ...(Array.isArray(eintrag.identifiers?.isbn_13) ? eintrag.identifiers.isbn_13 : []),
      ...(Array.isArray(eintrag.identifiers?.isbn_10) ? eintrag.identifiers.isbn_10 : []),
    ].filter((x): x is string => typeof x === 'string');
    const isbn = kandidaten.includes(gesuchteIsbn)
      ? gesuchteIsbn
      : (kandidaten.map(isbnNormalisieren).find((x) => x !== null) ?? gesuchteIsbn);
    const cover = zeichen(eintrag.cover?.large) ?? zeichen(eintrag.cover?.medium) ?? zeichen(eintrag.cover?.small);
    const t: Treffer = {
      quelle: 'openlibrary',
      angaben: ohneLeere({
        titel: textBereinigen(zeichen(eintrag.title)),
        autor: autoren.length ? autoren.join('; ') : undefined,
        verlag: verlage[0],
        erscheinungsjahr: jahrAus(zeichen(eintrag.publish_date)),
        seitenanzahl: seiten,
        isbn,
        // Preis und Format (REQ-062 AK-9), nur falls die Quelle sie liefert.
        ...formatAus(zeichen(eintrag.physical_format)),
        preisCent: preisCentAus(zeichen(eintrag.price)),
        // Maße (REQ-072, AK-8), nur falls eindeutig.
        ...openLibraryMasseAus(zeichen(eintrag.physical_dimensions) ?? zeichen(eintrag.details?.physical_dimensions)),
      }),
      ...(cover && /^https:\/\/covers\.openlibrary\.org\//.test(cover) ? { coverUrl: cover } : {}),
    };
    if (brauchbar(t)) ergebnis.push(t);
  }
  return ergebnis;
}
