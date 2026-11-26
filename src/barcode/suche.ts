// ISBN-Suche (REQ-062): DNB und Open Library gleichzeitig, Cover als Data-URL. Hinter einer Schnittstelle,
// damit Tests sie durch einen Fake ersetzen können. An die Dienste geht ausschließlich die ISBN (ADR-0003).
import { standardHttpClient, type HttpClient } from './http';
import { isbnNormalisieren } from './isbn';
import {
  dnbSucheUrl,
  dnbTrefferLesen,
  dnbUrl,
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
// „Online suchen“ (REQ-116, REQ-117): Freitext (Titel, Autor, ISBN) bei DNB und Open Library gleichzeitig
// ---------------------------------------------------------------------------

export interface OnlineSuche {
  /**
   * Höchstens 9 Treffer, abwechselnd DNB/Open Library (REQ-117), Cover als Data-URL. Leere Liste = nichts gefunden.
   * Schlägt fehl, wenn keine Quelle erreichbar war (z. B. keine Internetverbindung).
   */
  suchen(text: string): Promise<Treffer[]>;
}

/** Freitextsuche über DNB (SRU) und Open Library (search.json). An die Dienste geht nur der Suchtext. */
export function onlineSucheMit(http: HttpClient, frist = SUCHE_FRIST_MS): OnlineSuche {
  return {
    async suchen(text) {
      if (suchwoerter(text).length === 0) return [];
      const isbn = isbnNormalisieren(text);
      const [dnb, ol] = await Promise.allSettled([
        mitFrist(abfragen(http, dnbSucheUrl(text), (t) => dnbTrefferLesen(t, isbn ?? undefined)), frist),
        mitFrist(abfragen(http, openLibrarySucheUrl(text), (t) => openLibrarySucheLesen(t, isbn)), frist),
      ]);
      if (dnb.status === 'rejected' && ol.status === 'rejected') throw new Error('Keine Quelle erreichbar');
      const gemischt = trefferMischen(dnb.status === 'fulfilled' ? dnb.value : [], ol.status === 'fulfilled' ? ol.value : []);
      return coverLaden(http, gemischt, frist);
    },
  };
}

export const standardOnlineSuche = (): OnlineSuche => onlineSucheMit(standardHttpClient());
