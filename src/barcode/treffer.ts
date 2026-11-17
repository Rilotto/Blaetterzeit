// Treffer der ISBN-Suche (REQ-062) und Parser der beiden Quellen. Ohne Netz, damit einzeln testbar.
import type { Vorbelegung } from '@/buchanlegen/eingabe';
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
    const t: Treffer = {
      quelle: 'dnb',
      angaben: ohneLeere({ titel, autor, verlag, erscheinungsjahr: jahr, seitenanzahl: seiten, isbn }),
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
      }),
      ...(cover && /^https:\/\/covers\.openlibrary\.org\//.test(cover) ? { coverUrl: cover } : {}),
    };
    if (brauchbar(t)) ergebnis.push(t);
  }
  return ergebnis;
}
