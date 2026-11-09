import type { CSSProperties } from 'react';
import iconPlus from '@/assets/icons/icon-plus.png';
import iconRegler from '@/assets/icons/icon-regler.png';
import Icon from '@/components/Icon';
import { buecherFarbe } from '@/theme';
import { seitenRand } from './layout';

// Kopfbereich der Seite „Bücher“ (REQ-005). Maße nach Referenzbild:
// Überschrift ≈ 28–32 dp, Schaltflächen ≈ 40 dp, Abstand ≈ 11 dp.
const SCHALTFLAECHE = 40;
// Icon-Größe wie in der Hauptnavigation (24 px), damit die Strichstärke gleich wirkt.
const ICON = 24;

const kopfStil: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '16px',
  padding: `16px ${seitenRand}px 0`,
};

const ueberschriftStil: CSSProperties = {
  flex: '1 1 auto',
  minWidth: 0,
  margin: 0,
  fontSize: '30px',
  fontWeight: 700,
  lineHeight: 1.2,
  color: buecherFarbe('ueberschrift'),
};

const schaltflaechenStil: CSSProperties = {
  flex: '0 0 auto',
  display: 'flex',
  gap: '11px',
};

const rundStil: CSSProperties = {
  boxSizing: 'border-box',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: `${SCHALTFLAECHE}px`,
  height: `${SCHALTFLAECHE}px`,
  margin: 0,
  padding: 0,
  borderRadius: '50%',
  cursor: 'pointer',
  // Kein sichtbarer Antipp-Effekt (REQ-005: kein aktiver Zustand).
  WebkitTapHighlightColor: 'transparent',
};

const filterStil: CSSProperties = {
  ...rundStil,
  border: `2px solid ${buecherFarbe('filterschaltflaecheVordergrund')}`,
  backgroundColor: buecherFarbe('filterschaltflaecheHintergrund'),
};

const plusStil: CSSProperties = {
  ...rundStil,
  border: 'none',
  backgroundColor: buecherFarbe('plusschaltflaecheHintergrund'),
};

/** Überschrift „Deine Bücher“ mit Filter-/Einstellungen- und Plus-Schaltfläche. Antippen bewirkt noch nichts. */
export default function Kopfbereich() {
  return (
    <header style={kopfStil}>
      <h1 style={ueberschriftStil}>Deine Bücher</h1>
      <div style={schaltflaechenStil}>
        <button type="button" aria-label="Filter und Einstellungen" style={filterStil}>
          <Icon
            datei="icon-regler.png"
            url={iconRegler}
            farbe={buecherFarbe('filterschaltflaecheVordergrund')}
            groesse={ICON}
          />
        </button>
        <button type="button" aria-label="Buch hinzufügen" style={plusStil}>
          <Icon datei="icon-plus.png" url={iconPlus} farbe={buecherFarbe('plusschaltflaecheVordergrund')} groesse={ICON} />
        </button>
      </div>
    </header>
  );
}
