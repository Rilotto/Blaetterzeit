import type { CSSProperties } from 'react';
import iconHerz from '@/assets/icons/icon-herz.png';
import { buecherFarbe } from '@/theme';
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
export default function CoverPlatzhalter({ breite, hoehe }: { breite?: number; hoehe?: number } = {}) {
  // Abweichende Größe nur für kleinere Coverflächen (Listenansicht der Übersicht, REQ-037).
  const groesse = breite !== undefined && hoehe !== undefined ? { width: `${breite}px`, height: `${hoehe}px` } : {};
  const icon = breite !== undefined ? Math.max(20, Math.round(breite * 0.36)) : 40;
  return (
    <div data-cover-platzhalter="" style={{ ...stil, ...groesse }}>
      <Icon datei="icon-herz.png" url={iconHerz} farbe={buecherFarbe('coverplatzhalterIcon')} groesse={icon} />
    </div>
  );
}
