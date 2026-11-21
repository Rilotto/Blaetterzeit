// Zentrale Zuordnung „Lesestatus → Icon“ (REQ-021, AK-5; REQ-022, AK-3).
// Bis eigene Icons vorliegen, ist es für jeden Status das Herz. Ein neues Icon wird nur hier eingetragen;
// Statuspille und Statusmenü lesen die Zuordnung bei jeder Darstellung.
import iconHerz from '@/assets/icons/icon-herz.png';
import type { LesestatusId } from '@/domain/buch';

export interface StatusIcon {
  /** Dateiname (wird als data-icon ausgegeben). */
  datei: string;
  /** Vom Build aufgelöste URL der Icon-Datei. */
  url: string;
}

const HERZ: StatusIcon = { datei: 'icon-herz.png', url: iconHerz };

export const statusIcons: Record<LesestatusId, StatusIcon> = {
  ungelesen: HERZ,
  am_lesen: HERZ,
  gelesen: HERZ,
  abgebrochen: HERZ,
  wunschliste: HERZ,
};

/** Icon eines Lesestatus aus der zentralen Zuordnung. */
export const statusIcon = (status: LesestatusId): StatusIcon => statusIcons[status];
