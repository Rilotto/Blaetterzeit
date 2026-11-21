import type { CSSProperties } from 'react';
import iconHerz from '@/assets/icons/icon-herz.png';
import Icon from '@/components/Icon';
import type { Buch } from '@/domain/buch';
import { fortschrittExakt, fortschrittText, hatSeitenanzahl } from '@/domain/fortschritt';
import { fortschrittFarbe } from '@/theme';

interface Props {
  buch: Buch;
  /** Balken oder Angabe angetippt: Menü „Aktuelle Seite“ (REQ-023, AK-7). */
  onAktuelleSeite: () => void;
  /** Herz angetippt (keine Seitenanzahl): Menü „Buchlänge“ (REQ-023, AK-7; REQ-025). */
  onBuchlaenge: () => void;
}

// Maße nach REF-buchdetails-01.png (≈ 2,26 px je dp): Balken ≈ 236 × 8 dp, Angabe ≈ 17 dp.
// Orientierungswerte, kein Akzeptanzkriterium.
const BALKEN_BREITE = 236;
const BALKEN_HOEHE = 8;

const bereichStil: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  marginTop: '20px',
};

const balkenStil: CSSProperties = {
  position: 'relative',
  boxSizing: 'border-box',
  width: `${BALKEN_BREITE}px`,
  maxWidth: '100%',
  height: `${BALKEN_HOEHE}px`,
  // Großzügige Tippfläche um den schmalen Balken.
  margin: '6px 0',
  overflow: 'hidden',
  borderRadius: `${BALKEN_HOEHE / 2}px`,
  backgroundColor: fortschrittFarbe('balkenLeer'),
  cursor: 'pointer',
};

const fuellungStil = (prozent: number): CSSProperties => ({
  display: 'block',
  width: `${prozent}%`,
  height: '100%',
  borderRadius: `${BALKEN_HOEHE / 2}px`,
  backgroundColor: fortschrittFarbe('balkenFuellung'),
});

const textStil: CSSProperties = {
  margin: '10px 0 0',
  padding: '2px 8px',
  border: 'none',
  background: 'none',
  fontFamily: 'inherit',
  fontSize: '17px',
  fontWeight: 500,
  color: fortschrittFarbe('fortschrittText'),
  cursor: 'pointer',
  WebkitTapHighlightColor: 'transparent',
};

const herzStil: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '40px',
  height: '40px',
  margin: 0,
  padding: 0,
  border: 'none',
  background: 'none',
  cursor: 'pointer',
  WebkitTapHighlightColor: 'transparent',
};

/** Lesefortschritt unter der Statuspille: Herz ohne Seitenanzahl, sonst Balken mit Angabe (REQ-023). */
export default function Fortschritt({ buch, onAktuelleSeite, onBuchlaenge }: Props) {
  if (!hatSeitenanzahl(buch)) {
    return (
      <div data-fortschritt="" style={bereichStil}>
        <button type="button" data-fortschritt-herz="" aria-label="Buchlänge festlegen" onClick={onBuchlaenge} style={herzStil}>
          <Icon datei="icon-herz.png" url={iconHerz} farbe={fortschrittFarbe('fortschrittHerz')} groesse={22} />
        </button>
      </div>
    );
  }
  const prozent = fortschrittExakt(buch);
  return (
    <div data-fortschritt="" style={bereichStil}>
      <div
        role="progressbar"
        aria-label="Lesefortschritt"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={prozent}
        onClick={onAktuelleSeite}
        style={balkenStil}
      >
        <span data-fortschritt-fuellung="" style={fuellungStil(prozent)} />
      </div>
      <button type="button" data-fortschritt-text="" onClick={onAktuelleSeite} style={textStil}>
        {fortschrittText(buch)}
      </button>
    </div>
  );
}
