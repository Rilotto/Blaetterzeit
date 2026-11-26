// ISBN-Suche (REQ-062): DNB und Open Library gleichzeitig, Cover als Data-URL. Hinter einer Schnittstelle,
// damit Tests sie durch einen Fake ersetzen können. An die Dienste geht ausschließlich die ISBN (ADR-0003).
import { standardHttpClient, type HttpClient } from './http';
import { isbnNormalisieren } from './isbn';
import {
  dnbSucheUrl,
  dnbTrefferLesen,
  dnbUrl,
  nachSpracheFiltern,
  ONLINE_SUCHE_MAX,
  openLibrarySucheLesen,
  openLibrarySucheUrl,
  openLibraryTrefferLesen,
  openLibraryUrl,
  suchwoerter,
  trefferMischen,
  type Treffer,
} from './treffer';

export interface IsbnSuche {
  /**
   * Alle Treffer beider Quellen (DNB zuerst). Leere Liste = nichts gefunden.
   * Schlägt fehl, wenn keine Quelle erreichbar war (z. B. keine Internetverbindung).
   */
  suchen(isbn: string): Promise<Treffer[]>;
}

/** Ohne Antwort einer Quelle nach dieser Zeit gilt sie als nicht erreichbar. */
export const SUCHE_FRIST_MS = 15000;

const mitFrist = <T,>(p: Promise<T>, ms: number): Promise<T> =>
  new Promise<T>((ok, fehler) => {
    const t = setTimeout(() => fehler(new Error('Zeitüberschreitung')), ms);
    p.then(
      (w) => {
        clearTimeout(t);
        ok(w);
      },
      (e: unknown) => {
        clearTimeout(t);
        fehler(e);
      },
    );
  });

async function abfragen(http: HttpClient, url: string, lesen: (text: string) => Treffer[]): Promise<Treffer[]> {
  const antwort = await http.text(url);
  // 404 = nichts gefunden; andere Fehlerstatus gelten als nicht erreichbar.
  if (antwort.status === 404) return [];
  if (antwort.status < 200 || antwort.status >= 300) throw new Error(`HTTP ${antwort.status}`);
  return lesen(antwort.text);
}

/** Lädt die Cover der Treffer (je Adresse einmal); ein fehlendes Cover lässt das Feld leer. */
async function coverLaden(http: HttpClient, treffer: Treffer[], frist: number): Promise<Treffer[]> {
  const cache = new Map<string, Promise<string | null>>();
  const laden = (url: string) => {
    let p = cache.get(url);
    if (!p) {
      p = mitFrist(http.bild(url), frist).catch(() => null);
      cache.set(url, p);
    }
    return p;
  };
  return Promise.all(
    treffer.map(async (t) => {
      const { coverUrl, ...rest } = t;
      const cover = coverUrl ? await laden(coverUrl) : null;
      return cover ? { ...rest, angaben: { ...rest.angaben, cover } } : { ...rest };
    }),
  );
}

/** Suche über DNB (SRU) und Open Library mit dem übergebenen HTTP-Client. */
export function isbnSucheMit(http: HttpClient, frist = SUCHE_FRIST_MS): IsbnSuche {
  return {
    async suchen(isbn) {
      const [dnb, ol] = await Promise.allSettled([
        mitFrist(abfragen(http, dnbUrl(isbn), (t) => dnbTrefferLesen(t, isbn)), frist),
        mitFrist(abfragen(http, openLibraryUrl(isbn), (t) => openLibraryTrefferLesen(t, isbn)), frist),
      ]);
      if (dnb.status === 'rejected' && ol.status === 'rejected') throw new Error('Keine Quelle erreichbar');
      const alle = [...(dnb.status === 'fulfilled' ? dnb.value : []), ...(ol.status === 'fulfilled' ? ol.value : [])];
      return coverLaden(http, alle, frist);
    },
  };
}

export const standardIsbnSuche = (): IsbnSuche => isbnSucheMit(standardHttpClient());

// ---------------------------------------------------------------------------
// „Online suchen“ (REQ-116, REQ-117) und „Cover online suchen“ (REQ-118): Freitext (Titel, Autor, ISBN) bei DNB und
// Open Library gleichzeitig, beschränkt auf die gewählten Sprachen (REQ-119)
// ---------------------------------------------------------------------------

export interface OnlineSuche {
  /**
   * Höchstens 15 Treffer, abwechselnd DNB/Open Library (REQ-117), Cover als Data-URL. Leere Liste = nichts gefunden.
   * `sprachen` (Sprachcodes „ger“/„eng“, REQ-119): Anfrage und Ergebnis auf diese Sprachen beschränkt, Treffer ohne
   * Sprachangabe entfallen; ohne Angabe ungefiltert.
   * Schlägt fehl, wenn keine Quelle erreichbar war (z. B. keine Internetverbindung).
   */
  suchen(text: string, sprachen?: readonly string[]): Promise<Treffer[]>;
}

export interface CoverSuche {
  /**
   * „Cover online suchen“ (REQ-118): nur Treffer mit geladenem Cover (`angaben.cover` als Data-URL), höchstens 15,
   * abwechselnd DNB/Open Library, die andere Quelle füllt auf. Sprachfilter wie bei {@link OnlineSuche}.
   * Leere Liste = kein Cover gefunden. Schlägt fehl, wenn keine Quelle erreichbar war.
   */
  suchen(text: string, sprachen?: readonly string[]): Promise<Treffer[]>;
}

/** So viele Treffer fragt die Cover-Suche je Quelle an, damit trotz Treffern ohne Cover bis zu 15 Cover bleiben. */
export const COVER_SUCHE_ANFRAGE = 20;

/** Beide Quellen gleichzeitig abfragen; nach Sprache gefiltert. Wirft, wenn keine Quelle erreichbar war. */
async function quellenAbfragen(
  http: HttpClient,
  text: string,
  sprachen: readonly string[] | undefined,
  max: number,
  frist: number,
): Promise<[Treffer[], Treffer[]]> {
  const isbn = isbnNormalisieren(text);
  const spr = sprachen ?? [];
  const [dnb, ol] = await Promise.allSettled([
    mitFrist(abfragen(http, dnbSucheUrl(text, max, spr), (t) => dnbTrefferLesen(t, isbn ?? undefined)), frist),
    mitFrist(abfragen(http, openLibrarySucheUrl(text, max, spr), (t) => openLibrarySucheLesen(t, isbn)), frist),
  ]);
  if (dnb.status === 'rejected' && ol.status === 'rejected') throw new Error('Keine Quelle erreichbar');
  const filtern = (t: Treffer[]) => (sprachen ? nachSpracheFiltern(t, sprachen) : t);
  return [filtern(dnb.status === 'fulfilled' ? dnb.value : []), filtern(ol.status === 'fulfilled' ? ol.value : [])];
}

/** Freitextsuche über DNB (SRU) und Open Library (search.json). An die Dienste gehen nur Suchtext und Sprachauswahl. */
export function onlineSucheMit(http: HttpClient, frist = SUCHE_FRIST_MS): OnlineSuche {
  return {
    async suchen(text, sprachen) {
      if (suchwoerter(text).length === 0) return [];
      const [dnb, ol] = await quellenAbfragen(http, text, sprachen, ONLINE_SUCHE_MAX, frist);
      return coverLaden(http, trefferMischen(dnb, ol), frist);
    },
  };
}

export const standardOnlineSuche = (): OnlineSuche => onlineSucheMit(standardHttpClient());

/** Cover-Suche über dieselben Quellen; Treffer ohne Cover entfallen vor dem Mischen (REQ-118, AK-5/AK-6). */
export function coverSucheMit(http: HttpClient, frist = SUCHE_FRIST_MS): CoverSuche {
  return {
    async suchen(text, sprachen) {
      if (suchwoerter(text).length === 0) return [];
      const [dnb, ol] = await quellenAbfragen(http, text, sprachen, COVER_SUCHE_ANFRAGE, frist);
      const mitCover = async (t: Treffer[]) =>
        (await coverLaden(http, t.filter((x) => x.coverUrl), frist)).filter((x) => !!x.angaben.cover);
      const [d, o] = await Promise.all([mitCover(dnb), mitCover(ol)]);
      return trefferMischen(d, o, ONLINE_SUCHE_MAX);
    },
  };
}

export const standardCoverSuche = (): CoverSuche => coverSucheMit(standardHttpClient());
