import type { CSSProperties } from 'react';
import iconHerz from '@/assets/icons/icon-herz.png';
import Icon from '@/components/Icon';
import type { Buch } from '@/domain/buch';
import { fortschrittExakt, fortschrittText, hatSeitenanzahl } from '@/domain/fortschritt';
import { fortschrittFarbe, textstufe, pillenhoehe, abstand, bildschirmrand, stilRolle, tippflaecheAttr } from '@/theme';

interface Props {
  buch: Buch;
  /** Balken oder Angabe angetippt: Menü „Aktuelle Seite“ (REQ-023, AK-7). */
  onAktuelleSeite: () => void;
  /** Herz angetippt (keine Seitenanzahl): Menü „Buchlänge“ (REQ-023, AK-7; REQ-025). */
  onBuchlaenge: () => void;
  /**
   * Anordnung: „spalte“ (Standard, Buchdetails REQ-023 und übrige Nutzer) zentriert Balken und Angabe untereinander;
   * „zeile“ (nur Startseite, REQ-102 AK-2) setzt den Balken linksbündig über die Restbreite und die Angabe rechts daneben.
   */
  anordnung?: 'spalte' | 'zeile';
}

// Maße nach REF-buchdetails-01.png (≈ 2,26 px je dp): Balken ≈ 236 × 8 dp, Angabe ≈ 17 dp.
// Orientierungswerte, kein Akzeptanzkriterium.
const BALKEN_BREITE = 236;
const BALKEN_HOEHE = 8;

const bereichStil: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  marginTop: bildschirmrand,
};

// REQ-102 AK-2: Balken linksbündig über die Restbreite, Angabe rechts daneben.
const zeileStil: CSSProperties = {
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  gap: abstand('s'),
  marginTop: abstand('s'),
};

const balkenStil: CSSProperties = {
  position: 'relative',
  boxSizing: 'border-box',
  width: `${BALKEN_BREITE}px`,
  maxWidth: '100%',
  height: `${BALKEN_HOEHE}px`,
  // Großzügige Tippfläche um den schmalen Balken.
  margin: `${abstand('s')} 0`,
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
  margin: `${abstand('s')} 0 0`,
  padding: `${abstand('xs')} ${abstand('s')}`,
  border: 'none',
  background: 'none',
  fontFamily: 'inherit',
  ...textstufe('meta'),
  fontWeight: 500,
  color: fortschrittFarbe('fortschrittText'),
  cursor: 'pointer',
  WebkitTapHighlightColor: 'transparent',
};

const herzStil: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: pillenhoehe,
  height: pillenhoehe,
  margin: 0,
  padding: 0,
  border: 'none',
  background: 'none',
  cursor: 'pointer',
  WebkitTapHighlightColor: 'transparent',
};

/** Lesefortschritt unter der Statuspille: Herz ohne Seitenanzahl, sonst Balken mit Angabe (REQ-023). */
export default function Fortschritt({ buch, onAktuelleSeite, onBuchlaenge, anordnung = 'spalte' }: Props) {
  const zeile = anordnung === 'zeile';
  const bereich = zeile ? zeileStil : bereichStil;
  if (!hatSeitenanzahl(buch)) {
    return (
      <div data-fortschritt="" data-fortschritt-anordnung={anordnung} style={bereich}>
        <button type="button" data-fortschritt-herz="" aria-label="Buchlänge festlegen" onClick={onBuchlaenge} style={herzStil}>
          <Icon datei="icon-herz.png" url={iconHerz} farbe={fortschrittFarbe('fortschrittHerz')} groesse={22} />
        </button>
      </div>
    );
  }
  const prozent = fortschrittExakt(buch);
  return (
    <div data-fortschritt="" data-fortschritt-anordnung={anordnung} style={bereich}>
      <div
        role="progressbar"
        aria-label="Lesefortschritt"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={prozent}
        onClick={onAktuelleSeite}
        // Erweiterte Tippfläche (REQ-065 AK-9); wirkt, sobald der Balken nicht mehr abschneidet (Feuilleton, REQ-071).
        {...tippflaecheAttr}
        {...stilRolle('balken')}
        style={zeile ? { ...balkenStil, flex: '1 1 auto', width: 'auto', minWidth: 0 } : balkenStil}
      >
        <span data-fortschritt-fuellung="" {...stilRolle('balkenfuellung')} style={fuellungStil(prozent)} />
      </div>
      <button
        type="button"
        data-fortschritt-text=""
        onClick={onAktuelleSeite}
        style={zeile ? { ...textStil, margin: 0, paddingRight: 0, flex: '0 0 auto', whiteSpace: 'nowrap' } : textStil}
      >
        {fortschrittText(buch)}
      </button>
    </div>
  );
}
