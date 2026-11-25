import type { ComponentType } from 'react';
import type { MenuePunktId } from '@/navigation/menu';
import BibliothekAnsicht from './BibliothekAnsicht';
import BuecherAnsicht from './BuecherAnsicht';
import ProfilAnsicht from './ProfilAnsicht';
import StatistikAnsicht from './StatistikAnsicht';
import StartAnsicht from '@/start/StartAnsicht';

/** Gemeinsame Props aller Zielansichten der Hauptnavigation. */
export interface AnsichtProps {
  /** Wechselt den Menüpunkt (z. B. Startseite „Diese Woche“ → „Statistik“, REQ-103). */
  navigieren?: (id: MenuePunktId) => void;
}

/** Ansichten ohne Navigationswunsch ignorieren `navigieren` (alle ihre Props sind optional). */
const ohneNavigation = (ansicht: ComponentType): ComponentType<AnsichtProps> => ansicht as ComponentType<AnsichtProps>;

/**
 * Zuordnung Menüpunkt -> Ansicht. Bekommt ein Menüpunkt später eine eigene
 * Ansicht, wird nur hier der Platzhalter ersetzt.
 */
export const ansichten: Record<MenuePunktId, ComponentType<AnsichtProps>> = {
  // Startseite statt „under construction :)“ (REQ-101).
  start: StartAnsicht,
  buecher: ohneNavigation(BuecherAnsicht),
  bibliothek: ohneNavigation(BibliothekAnsicht),
  statistik: ohneNavigation(StatistikAnsicht),
  profil: ohneNavigation(ProfilAnsicht),
};
