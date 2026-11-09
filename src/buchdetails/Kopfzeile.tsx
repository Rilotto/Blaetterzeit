import type { CSSProperties, ReactNode } from 'react';
import iconZurueck from '@/assets/icons/icon-zurueck.png';
import Icon from '@/components/Icon';
import { buchdetailsFarbe } from '@/theme';
import { KOPF_ICON, RAND } from './masse';
import { kopfSchaltflaecheStil } from './stile';

const kopfStil: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: `8px ${RAND - 8}px 0`,
};


/** Dezenter Zurück-Pfeil (REQ-013), auch in Kameraansicht (REQ-016) und Zuschnitt (REQ-017). */
export function ZurueckSchaltflaeche({ onClick }: { onClick: () => void }) {
  return (
    <button type="button" aria-label="Zurück" onClick={onClick} style={kopfSchaltflaecheStil}>
      <Icon datei="icon-zurueck.png" url={iconZurueck} farbe={buchdetailsFarbe('kopfzeilenSymbol')} groesse={KOPF_ICON} />
    </button>
  );
}

/** Kopfzeile: links der Zurück-Pfeil, rechts optional weitere Schaltflächen. */
export default function Kopfzeile({ onZurueck, rechts, stil }: { onZurueck: () => void; rechts?: ReactNode; stil?: CSSProperties }) {
  return (
    <div style={{ ...kopfStil, ...stil }}>
      <ZurueckSchaltflaeche onClick={onZurueck} />
      {rechts}
    </div>
  );
}
