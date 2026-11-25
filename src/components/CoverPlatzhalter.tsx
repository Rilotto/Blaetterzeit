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
export default function CoverPlatzhalter({ breite, hoehe, fuellen = false }: { breite?: number; hoehe?: number; fuellen?: boolean } = {}) {
  // Abweichende Größe nur für kleinere Coverflächen (Listenansicht der Übersicht, REQ-037);
  // `fuellen`: füllt die umgebende Coverfläche (Raster der Online-Suche, REQ-111).
  const groesse = fuellen
    ? { width: '100%', height: '100%' }
    : breite !== undefined && hoehe !== undefined
      ? { width: `${breite}px`, height: `${hoehe}px` }
      : {};
  const icon = fuellen ? 28 : breite !== undefined ? Math.max(20, Math.round(breite * 0.36)) : 40;
  return (
    <div data-cover-platzhalter="" {...stilRolle('cover')} style={{ ...stil, ...groesse }}>
      <Icon datei="icon-herz.png" url={iconHerz} farbe={buecherFarbe('coverplatzhalterIcon')} groesse={icon} />
    </div>
  );
}
