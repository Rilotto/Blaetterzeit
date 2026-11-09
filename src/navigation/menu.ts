// Zentrale Konfiguration der Hauptnavigation (REQ-002):
// Reihenfolge, Beschriftungen und die Zuordnung Menüpunkt -> Icon.
// Die Icon-Dateien stammen unverändert vom CEO
// (docs/requirements/referenzen/icons/, Kopie in src/assets/icons/).
import iconBuecherregal from '@/assets/icons/icon-buecherregal.png';
import iconDiagramm from '@/assets/icons/icon-diagramm.png';
import iconHaus from '@/assets/icons/icon-haus.png';
import iconOffenesBuch from '@/assets/icons/icon-offenes-buch.png';
import iconPerson from '@/assets/icons/icon-person.png';

export type MenuePunktId = 'start' | 'buecher' | 'bibliothek' | 'statistik' | 'profil';

export interface MenuePunkt {
  id: MenuePunktId;
  /** Beschriftung unter dem Icon. */
  beschriftung: string;
  /** Dateiname der Icon-Datei des CEO. */
  iconDatei: string;
  /** Vom Build aufgelöste URL der Icon-Datei. */
  iconUrl: string;
}

/** Menüpunkte von links nach rechts. */
export const menuePunkte: readonly MenuePunkt[] = [
  { id: 'start', beschriftung: 'Start', iconDatei: 'icon-haus.png', iconUrl: iconHaus },
  { id: 'buecher', beschriftung: 'Bücher', iconDatei: 'icon-offenes-buch.png', iconUrl: iconOffenesBuch },
  { id: 'bibliothek', beschriftung: 'Bibliothek', iconDatei: 'icon-buecherregal.png', iconUrl: iconBuecherregal },
  { id: 'statistik', beschriftung: 'Statistik', iconDatei: 'icon-diagramm.png', iconUrl: iconDiagramm },
  { id: 'profil', beschriftung: 'Profil', iconDatei: 'icon-person.png', iconUrl: iconPerson },
];

/** Menüpunkt, der beim Öffnen der App aktiv ist. */
export const startMenuePunkt: MenuePunktId = 'start';
