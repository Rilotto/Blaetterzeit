import type { ComponentType } from 'react';
import type { MenuePunktId } from '@/navigation/menu';
import BuecherAnsicht from './BuecherAnsicht';
import ProfilAnsicht from './ProfilAnsicht';
import StatistikAnsicht from './StatistikAnsicht';
import UnderConstruction from './UnderConstruction';

/**
 * Zuordnung Menüpunkt -> Ansicht. Bekommt ein Menüpunkt später eine eigene
 * Ansicht, wird nur hier der Platzhalter ersetzt.
 */
export const ansichten: Record<MenuePunktId, ComponentType> = {
  start: UnderConstruction,
  buecher: BuecherAnsicht,
  bibliothek: UnderConstruction,
  statistik: StatistikAnsicht,
  profil: ProfilAnsicht,
};
