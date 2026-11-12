/**
 * Reihenfolge, Suche und Anzeigetexte der Übersichten und des Abschnitts „Alle Bücher“
 * (REQ-035 bis REQ-038, REQ-041). Reine Fachlogik ohne UI und Speicher.
 */
import { LESESTATUS, type Buch } from './buch';
import { fortschrittExakt, fortschrittGerundet, hatSeitenanzahl, modusVon } from './fortschritt';

/** Höchstzahl der Bücher im Abschnitt „Alle Bücher“ (REQ-035). */
export const MAX_NEUESTE = 10;

/**
 * Nach Eintragungsdatum absteigend: das zuletzt eingetragene Buch zuerst (REQ-035, REQ-041).
 * Bücher ohne gültiges Datum gelten als älter als alle datierten; untereinander und bei gleichem Datum
 * entscheidet die Reihenfolge des Anlegens (Reihenfolge der Eingabe, später angelegt = neuer).
 */
export function nachEintragung(buecher: readonly Buch[]): Buch[] {
  const zeit = (b: Buch) => {
    const t = b.eingetragenAm === undefined ? Number.NaN : Date.parse(b.eingetragenAm);
    return Number.isNaN(t) ? Number.NEGATIVE_INFINITY : t;
  };
  return buecher
    .map((buch, nr) => ({ buch, nr, t: zeit(buch) }))
    .sort((a, b) => (a.t === b.t ? b.nr - a.nr : b.t > a.t ? 1 : -1))
    .map((x) => x.buch);
}

/** Die höchstens zehn zuletzt eingetragenen Bücher, neuestes zuerst (REQ-035). */
export const neuesteBuecher = (buecher: readonly Buch[], max: number = MAX_NEUESTE): Buch[] =>
  nachEintragung(buecher).slice(0, max);

const titelVergleich = new Intl.Collator('de', { sensitivity: 'base', numeric: true });

/** Alphabetisch A–Z nach Buchtitel (deutsche Sortierung, ohne Groß-/Kleinschreibung; REQ-036, REQ-040, REQ-042). */
export const alphabetisch = (buecher: readonly Buch[]): Buch[] =>
  [...buecher].sort((a, b) => titelVergleich.compare(a.titel, b.titel));

/**
 * Bücher, deren Titel oder Autor den Suchbegriff als Zeichenfolge enthält, ohne Groß-/Kleinschreibung (REQ-038).
 * Leerer Suchbegriff: alle Bücher. Leerzeichen am Rand werden nicht beachtet.
 */
export function suchen(buecher: readonly Buch[], begriff: string): Buch[] {
  const s = begriff.trim().toLocaleLowerCase('de');
  if (s === '') return [...buecher];
  return buecher.filter((b) => b.titel.toLocaleLowerCase('de').includes(s) || (b.autor ?? '').toLocaleLowerCase('de').includes(s));
}

/** Anzahlzeile „<n> Bücher“ bzw. „1 Buch“ (REQ-036). */
export const anzahlText = (n: number): string => (n === 1 ? '1 Buch' : `${n} Bücher`);

/** Suchfeld-Beschriftung nach dem Muster „In [Liste] suchen“ (REQ-038). */
export const suchfeldText = (liste: string): string => `In ${liste} suchen`;

/** Bezeichnung eines Lesestatus aus der zentralen Definition (REQ-008). */
export const statusBezeichnung = (buch: Buch): string => LESESTATUS.find((s) => s.id === buch.status)?.bezeichnung ?? buch.status;

/** Was die Karte der Listenansicht unter der Autorzeile zeigt (REQ-037). */
export type Kartenzusatz =
  | { art: 'fortschritt'; prozent: number; exakt: number; text: string }
  | { art: 'status'; text: string }
  | { art: 'nichts' };

/**
 * Lesestatus *am lesen* mit Seitenanzahl: Balken und „<Seite> / <Seitenanzahl> · <Prozent> %“ bzw. im Modus „%“ nur „<Prozent> %“;
 * *am lesen* ohne Seitenanzahl: nichts; sonst die Statusbezeichnung (REQ-037, AK-6 bis AK-9).
 */
export function kartenzusatz(buch: Buch): Kartenzusatz {
  if (buch.status !== 'am_lesen') return { art: 'status', text: statusBezeichnung(buch) };
  if (!hatSeitenanzahl(buch)) return { art: 'nichts' };
  const prozent = fortschrittGerundet(buch);
  const text =
    modusVon(buch) === 'prozent' ? `${prozent} %` : `${buch.aktuelleSeite ?? 0} / ${buch.seitenanzahl} · ${prozent} %`;
  return { art: 'fortschritt', prozent, exakt: fortschrittExakt(buch), text };
}
