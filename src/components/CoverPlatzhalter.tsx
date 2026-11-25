import type { CSSProperties } from 'react';
import iconHerz from '@/assets/icons/icon-herz.png';
import { buecherFarbe, stilRolle } from '@/theme';
import { coverFlaecheStil } from './coverFlaeche';
import Icon from './Icon';

const stil: CSSProperties = {
  ...coverFlaecheStil,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: buecherFarbe('coverplatzhalterFlaeche'),
};

/**
 * Cover-Platzhalter (REQ-010): Fläche in Covergröße mit dem Herz-Icon des CEO.
 * Wiederverwendbar überall, wo ein Buchcover steht – mit oder ohne Titel darunter.
 */
export default function CoverPlatzhalter({ breite, hoehe, fuellend = false }: { breite?: number; hoehe?: number; fuellend?: boolean } = {}) {
  // Abweichende Größe nur für kleinere Coverflächen (Listenansicht der Übersicht, REQ-037); `fuellend` = volle
  // Breite des Elternelements mit Seitenverhältnis 2:3 (Rasteransicht, REQ-037 AK-10).
  const groesse: CSSProperties = fuellend
    ? { width: '100%', height: 'auto', aspectRatio: '2 / 3' }
    : breite !== undefined && hoehe !== undefined
      ? { width: `${breite}px`, height: `${hoehe}px` }
      : {};
  const icon = breite !== undefined ? Math.max(20, Math.round(breite * 0.36)) : 40;
  return (
    <div data-cover-platzhalter="" {...stilRolle('cover')} style={{ ...stil, ...groesse }}>
      <Icon datei="icon-herz.png" url={iconHerz} farbe={buecherFarbe('coverplatzhalterIcon')} groesse={icon} />
    </div>
  );
}
