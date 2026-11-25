import type { CSSProperties, ReactNode } from 'react';
import type { Buch } from '@/domain/buch';
import { fortschrittGerundet, streak } from '@/domain/fortschritt';
import { fortschrittFarbe, textstufe, kartenSchatten, abstand, stilRolle } from '@/theme';
import Flamme from './Flamme';
import { RAND } from './masse';

interface Props {
  buch: Buch;
  /** Aktuelle Zeit (Systemzeit des Geräts, REQ-027). */
  jetzt: Date;
}

// Maße nach REF-buchdetails-01.png (≈ 2,26 px je dp): Pille ≈ 84 dp hoch, Ecken ≈ 28 dp, Rahmen ≈ 2 dp,
// Trennlinien ≈ 44 dp hoch. Orientierungswerte, kein Akzeptanzkriterium.
const pilleStil: CSSProperties = {
  display: 'flex',
  alignItems: 'stretch',
  boxSizing: 'border-box',
  margin: `calc(${abstand('xl')} + ${abstand('s')}) ${RAND}px 0`,
  minHeight: '84px',
  padding: `${abstand('m')} ${abstand('xs')}`,
  borderRadius: '28px',
  // Weicher, warmer Schatten statt hartem Rahmen (REQ-065 AK-11).
  border: 'none',
  boxShadow: kartenSchatten,
  backgroundColor: fortschrittFarbe('statistikFlaeche'),
  color: fortschrittFarbe('statistikText'),
};

const teilStil: CSSProperties = {
  flex: '1 1 0',
  minWidth: 0,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: abstand('s'),
};

const trennlinieStil: CSSProperties = {
  flex: '0 0 auto',
  alignSelf: 'center',
  width: '1.5px',
  height: '44px',
  backgroundColor: fortschrittFarbe('statistikTrennlinie'),
};

const zahlStil: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  height: '38px',
  ...textstufe('abschnitt'),
  fontWeight: 600,
  lineHeight: 1,
  color: fortschrittFarbe('statistikText'),
};

const beschriftungStil: CSSProperties = {
  ...textstufe('meta'),
  lineHeight: 1.2,
  whiteSpace: 'nowrap',
  color: fortschrittFarbe('statistikText'),
};

function Teil({ merkmal, oben, text }: { merkmal: string; oben: ReactNode; text: string }) {
  return (
    <div {...{ [merkmal]: '' }} style={teilStil}>
      {oben}
      <span data-statistik-text="" style={beschriftungStil}>
        {text}
      </span>
    </div>
  );
}

/** Statistik-Pille: Streak, Fortschritt in % und Sitzungen (REQ-026, REQ-027). Ohne Zitat darunter. */
export default function Statistik({ buch, jetzt }: Props) {
  const tage = streak(buch.sitzungen, jetzt);
  return (
    <div data-statistik="" {...stilRolle('eintrag')} style={pilleStil}>
      <Teil merkmal="data-streak" oben={<Flamme zahl={tage} />} text="Tage in Folge" />
      <div data-trennlinie="" aria-hidden="true" style={trennlinieStil} />
      <Teil
        merkmal="data-prozent"
        oben={
          <span data-statistik-zahl="" style={zahlStil}>
            {`${fortschrittGerundet(buch)} %`}
          </span>
        }
        text="gelesen"
      />
      <div data-trennlinie="" aria-hidden="true" style={trennlinieStil} />
      <Teil
        merkmal="data-sitzungen"
        oben={
          <span data-statistik-zahl="" style={zahlStil}>
            {buch.sitzungen?.length ?? 0}
          </span>
        }
        text="Sitzungen"
      />
    </div>
  );
}
