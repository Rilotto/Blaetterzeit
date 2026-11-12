// Zentrale Filterkonfiguration der Seite „Bücher“ (REQ-007).
// Einzige Stelle, an der Filter festgelegt werden: hinzufügen, umbenennen,
// entfernen und neu sortieren geschieht ausschließlich hier.
// Enthält bewusst keine Darstellungsangaben (Farben, Maße, Formen).
import type { Buch } from '@/domain/buch';
import { buecherNochZuLesen } from './abschnittKonfiguration';

export interface FilterDefinition {
  /** Stabile technische ID (zugleich Schlüssel der Übersicht und der gemerkten Ansicht, REQ-037). */
  id: string;
  /** Beschriftung in der Filterleiste. */
  name: string;
  /** Position von links nach rechts (aufsteigend). */
  reihenfolge: number;
  /** Beim Aufruf der Seite aktiv (genau ein Filter). */
  standard?: boolean;
  /**
   * Filterlogik, wird beim Antippen des Filters ausgelöst. Auf der Seite „Bücher“ ohne sichtbare Wirkung;
   * in den Übersichten bestimmt sie die angezeigten Bücher (REQ-036, REQ-039, REQ-040, REQ-042).
   */
  logik?: (buecher: Buch[]) => Buch[];
}

/** Platzhalter-Filterlogik: noch nicht ausgearbeitet (REQ-007), lässt die Bücher unverändert. */
const nochNichtAusgearbeitet = (buecher: Buch[]): Buch[] => buecher;

export const filterKonfiguration: FilterDefinition[] = [
  // REQ-039: alle Bücher, unabhängig vom Lesestatus.
  { id: 'alle', name: 'Alle', reihenfolge: 1, logik: (buecher) => [...buecher] },
  // Vorerst: Seite „Bücher“ mit ihren Abschnitten; Personalisierung später (To-do).
  { id: 'fuer_dich', name: 'Für dich', reihenfolge: 2, standard: true, logik: nochNichtAusgearbeitet },
  // REQ-042: Lesestatus *am lesen*.
  { id: 'gerade_am_lesen', name: 'Gerade am Lesen', reihenfolge: 3, logik: (buecher) => buecher.filter((b) => b.status === 'am_lesen') },
  // REQ-040: zentrale Abschnittszuordnung „Noch zu lesen“ (REQ-009).
  { id: 'noch_zu_lesen', name: 'Noch zu lesen', reihenfolge: 4, logik: buecherNochZuLesen },
];

/** Verhalten eines Filters in Bezug auf die Übersichten (REQ-036, REQ-039, REQ-040, REQ-042). */
export interface UebersichtDefinition {
  /** Name der Liste im Suchfeld „In [Liste] suchen“ (REQ-038). */
  listenname: string;
  /** Ob das Antippen der Pille auf der Seite „Bücher“ die Übersicht öffnet. */
  vonSeiteOeffnen: boolean;
}

/**
 * Filter mit eigener Übersicht, Schlüssel = Filter-ID. Filter ohne Eintrag (z. B. „Für dich“) führen aus einer
 * Übersicht zurück zur Seite „Bücher“ (REQ-036, AK-12).
 * „Noch zu lesen“ öffnet die Übersicht nur über „Alle ansehen ›“ (REQ-040); ob auch die Pille auf der Seite
 * „Bücher“ sie öffnet, ist beim CEO offen (bis dahin gilt REQ-007).
 */
export const uebersichtKonfiguration: Record<string, UebersichtDefinition> = {
  alle: { listenname: 'Alle Bücher', vonSeiteOeffnen: true },
  gerade_am_lesen: { listenname: 'Gerade am Lesen', vonSeiteOeffnen: true },
  noch_zu_lesen: { listenname: 'Noch zu lesen', vonSeiteOeffnen: false },
};
