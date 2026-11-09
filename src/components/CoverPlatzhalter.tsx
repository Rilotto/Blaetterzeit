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
export default function CoverPlatzhalter() {
  return (
    <div data-cover-platzhalter="" style={stil}>
      <Icon datei="icon-herz.png" url={iconHerz} farbe={buecherFarbe('coverplatzhalterIcon')} groesse={40} />
    </div>
  );
}
