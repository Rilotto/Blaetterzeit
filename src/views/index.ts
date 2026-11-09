import type { ComponentType } from 'react';
import type { MenuePunktId } from '@/navigation/menu';
import UnderConstruction from './UnderConstruction';

/**
 * Zuordnung Menüpunkt -> Ansicht. Bekommt ein Menüpunkt später eine eigene
 * Ansicht, wird nur hier der Platzhalter ersetzt.
 */
export const ansichten: Record<MenuePunktId, ComponentType> = {
  start: UnderConstruction,
  buecher: UnderConstruction,
  bibliothek: UnderConstruction,
  statistik: UnderConstruction,
  profil: UnderConstruction,
};
