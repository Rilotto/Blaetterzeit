// Zentrale Filterkonfiguration der Seite „Bücher“ (REQ-007).
// Einzige Stelle, an der Filter festgelegt werden: hinzufügen, umbenennen,
// entfernen und neu sortieren geschieht ausschließlich hier.
// Enthält bewusst keine Darstellungsangaben (Farben, Maße, Formen).
import type { Buch } from '@/domain/buch';

export interface FilterDefinition {
  /** Stabile technische ID. */
  id: string;
  /** Beschriftung in der Filterleiste. */
  name: string;
  /** Position von links nach rechts (aufsteigend). */
  reihenfolge: number;
  /** Beim Aufruf der Seite aktiv (genau ein Filter). */
  standard?: boolean;
  /**
   * Filterlogik, wird beim Antippen des Filters ausgelöst.
   * Im Grundgerüst noch nicht ausgearbeitet: Das Ergebnis wird nicht angezeigt.
   */
  logik?: (buecher: Buch[]) => Buch[];
}

/** Platzhalter-Filterlogik: noch nicht ausgearbeitet (REQ-007), lässt die Bücher unverändert. */
const nochNichtAusgearbeitet = (buecher: Buch[]): Buch[] => buecher;

export const filterKonfiguration: FilterDefinition[] = [
  { id: 'fuer_dich', name: 'Für dich', reihenfolge: 1, standard: true, logik: nochNichtAusgearbeitet },
  { id: 'gerade_am_lesen', name: 'Gerade am Lesen', reihenfolge: 2, logik: nochNichtAusgearbeitet },
  { id: 'noch_zu_lesen', name: 'Noch zu lesen', reihenfolge: 3, logik: nochNichtAusgearbeitet },
];
