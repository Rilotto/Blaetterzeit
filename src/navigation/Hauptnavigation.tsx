import type { CSSProperties } from 'react';
import { navFarbe } from '@/theme';
import { menuePunkte, type MenuePunktId } from './menu';

interface Props {
  aktiv: MenuePunktId;
  onAuswahl: (id: MenuePunktId) => void;
}

const navStil: CSSProperties = {
  flex: '0 0 auto',
  display: 'grid',
  gridTemplateColumns: `repeat(${menuePunkte.length}, minmax(0, 1fr))`,
  backgroundColor: navFarbe('navigationshintergrund'),
  // Unterer sicherer Bildschirmbereich (Gestenleiste/Systemnavigation).
  // --safe-area-inset-bottom setzt Capacitor auf Android (SystemBars, insetsHandling "css"),
  // im Browser greift env().
  paddingBottom: 'var(--safe-area-inset-bottom, env(safe-area-inset-bottom, 0px))',
};

const punktStil: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '4px',
  minWidth: 0,
  margin: 0,
  padding: '12px 0 16px',
  border: 'none',
  background: 'none',
  font: 'inherit',
  cursor: 'pointer',
};

const hervorhebungStil = (aktiv: boolean): CSSProperties => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '64px',
  height: '32px',
  borderRadius: '16px',
  // Inaktiv: keine Hintergrundfarbe, also keine sichtbare Hervorhebung.
  ...(aktiv ? { backgroundColor: navFarbe('hervorhebungsfarbe') } : {}),
});

const iconStil = (url: string, farbe: string): CSSProperties => ({
  display: 'block',
  width: '24px',
  height: '24px',
  // Das PNG dient als Maske, die Farbe kommt aus der Farbrolle.
  backgroundColor: farbe,
  maskImage: `url("${url}")`,
  maskSize: 'contain',
  maskRepeat: 'no-repeat',
  maskPosition: 'center',
  WebkitMaskImage: `url("${url}")`,
  WebkitMaskSize: 'contain',
  WebkitMaskRepeat: 'no-repeat',
  WebkitMaskPosition: 'center',
});

const beschriftungStil = (farbe: string): CSSProperties => ({
  color: farbe,
  fontSize: '0.75rem',
});

export default function Hauptnavigation({ aktiv, onAuswahl }: Props) {
  return (
    <nav aria-label="Hauptnavigation" style={navStil}>
      {menuePunkte.map((punkt) => {
        const istAktiv = punkt.id === aktiv;
        const farbe = navFarbe(istAktiv ? 'aktivfarbe' : 'inaktivfarbe');
        return (
          <button
            key={punkt.id}
            type="button"
            aria-current={istAktiv ? 'page' : undefined}
            onClick={() => onAuswahl(punkt.id)}
            style={punktStil}
          >
            <span data-highlight={istAktiv ? 'active' : 'inactive'} style={hervorhebungStil(istAktiv)}>
              <span aria-hidden="true" data-icon={punkt.iconDatei} style={iconStil(punkt.iconUrl, farbe)} />
            </span>
            <span style={beschriftungStil(farbe)}>{punkt.beschriftung}</span>
          </button>
        );
      })}
    </nav>
  );
}
