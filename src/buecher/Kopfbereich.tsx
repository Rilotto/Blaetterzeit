import type { CSSProperties } from 'react';
import iconPlus from '@/assets/icons/icon-plus.png';
import iconRegler from '@/assets/icons/icon-regler.png';
import iconX from '@/assets/icons/icon-x.png';
import Icon from '@/components/Icon';
import { buecherFarbe } from '@/theme';
import { seitenRand } from './layout';
import PlusMenue from './PlusMenue';

// Kopfbereich der Seite „Bücher“ (REQ-005). Maße nach Referenzbild:
// Überschrift ≈ 28–32 dp, Schaltflächen ≈ 40 dp, Abstand ≈ 11 dp.
const SCHALTFLAECHE = 40;
// Icon-Größe wie in der Hauptnavigation (24 px), damit die Strichstärke gleich wirkt.
const ICON = 24;

const kopfStil: CSSProperties = {
  position: 'relative',
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

const plusStil = (menueOffen: boolean): CSSProperties => ({
  ...rundStil,
  border: 'none',
  backgroundColor: buecherFarbe('plusschaltflaecheHintergrund'),
  // Bei geöffnetem Menü liegt das „ד über der Abdunklung (REQ-029, AK-8).
  ...(menueOffen ? { position: 'relative', zIndex: 12 } : {}),
});

// Menü direkt unter den Schaltflächen, rechtsbündig (Referenzbild): 16 px Kopfabstand + 40 px + 8 px.
const MENUE_OBEN = 16 + SCHALTFLAECHE + 8;

interface Props {
  /** Ob das Menü „Buch hinzufügen“ geöffnet ist (REQ-029). */
  menueOffen?: boolean;
  /** Plus-Schaltfläche bzw. „ד angetippt. */
  onPlus?: () => void;
  /** Option „Von Hand eintragen“ gewählt. */
  onVonHand?: () => void;
  /** Tippen außerhalb des Menüs. */
  onMenueSchliessen?: () => void;
}

/**
 * Überschrift „Deine Bücher“ mit Filter-/Einstellungen- und Plus-Schaltfläche (REQ-005).
 * Die Filter-/Einstellungen-Schaltfläche bewirkt noch nichts; die Plus-Schaltfläche öffnet das
 * Menü „Buch hinzufügen“ und zeigt „ד, solange es offen ist (REQ-029).
 */
export default function Kopfbereich({ menueOffen = false, onPlus, onVonHand, onMenueSchliessen }: Props) {
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
        <button
          type="button"
          aria-label={menueOffen ? 'Menü schließen' : 'Buch hinzufügen'}
          onClick={onPlus}
          style={plusStil(menueOffen)}
        >
          {menueOffen ? (
            <Icon datei="icon-x.png" url={iconX} farbe={buecherFarbe('plusschaltflaecheVordergrund')} groesse={ICON} />
          ) : (
            <Icon datei="icon-plus.png" url={iconPlus} farbe={buecherFarbe('plusschaltflaecheVordergrund')} groesse={ICON} />
          )}
        </button>
      </div>
      {menueOffen ? (
        <PlusMenue
          oben={MENUE_OBEN}
          rechts={seitenRand}
          onVonHand={() => onVonHand?.()}
          onSchliessen={() => onMenueSchliessen?.()}
        />
      ) : null}
    </header>
  );
}
