import type { CSSProperties, ReactNode } from 'react';
import type { Buch } from '@/domain/buch';
import { fortschrittGerundet, streak } from '@/domain/fortschritt';
import { fortschrittFarbe } from '@/theme';
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
  margin: `32px ${RAND}px 0`,
  minHeight: '84px',
  padding: '12px 4px',
  borderRadius: '28px',
  border: `2px solid ${fortschrittFarbe('statistikRahmen')}`,
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
  gap: '6px',
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
  fontSize: '30px',
  fontWeight: 600,
  lineHeight: 1,
  color: fortschrittFarbe('statistikText'),
};

const beschriftungStil: CSSProperties = {
  fontSize: '15px',
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
    <div data-statistik="" style={pilleStil}>
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
