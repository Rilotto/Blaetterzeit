import { useId, type CSSProperties } from 'react';
import { flammeZahlGedeckt, fortschrittFarbe } from '@/theme';

interface Props {
  /** Streak-Zahl (REQ-027). */
  zahl: number;
}

// Form nach REF-buchdetails-01.png: tropfenförmige Flamme mit nach rechts geneigter Spitze und kleiner
// Zunge links oben, im Linienstil der übrigen Icons nachgebildet. Größe ≈ 26 × 36 dp.
const BREITE = 28;
const HOEHE = 38;
const FLAMME =
  'M15 2.5 C16.2 7.6 23.5 12 23.5 22.2 C23.5 29.6 18.6 34.5 13 34.5 C7.4 34.5 3 30 3 23.6 C3 18.6 5.6 15.4 7.6 12.6 ' +
  'C8 15.4 9.2 17.2 10.8 18.2 C10.6 12.2 12.6 7.2 15 2.5 Z';
const ZUNGE = 'M7.2 3.2 C8.6 5.2 9.6 6.8 8.6 9 C7.9 10.4 6.2 10.3 5.8 8.8 C5.4 7.1 6.4 5.4 7.2 3.2 Z';

const rahmenStil: CSSProperties = {
  position: 'relative',
  width: `${BREITE}px`,
  height: `${HOEHE}px`,
  margin: '0 auto',
};

const svgStil: CSSProperties = { display: 'block', width: '100%', height: '100%', overflow: 'visible' };

const zahlStil = (aktiv: boolean): CSSProperties => ({
  position: 'absolute',
  left: 0,
  right: 0,
  // Zahl im bauchigen unteren Teil der Flamme.
  top: '50%',
  textAlign: 'center',
  fontSize: '15px',
  fontWeight: 700,
  lineHeight: 1,
  color: aktiv ? fortschrittFarbe('flammeZahlAktiv') : flammeZahlGedeckt,
});

/**
 * Streak-Flamme (REQ-027): bei 0 nur Umriss in GhostFrame mit gedeckter Zahl,
 * ab 1 gefüllt mit Verlauf von unten „Flamme Rot“ nach oben „Flamme Orange“ und Zahl in „Hintergrund“.
 */
export default function Flamme({ zahl }: Props) {
  const verlauf = `bz-flamme-${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`;
  const aktiv = zahl > 0;
  const fuellung = aktiv ? `url(#${verlauf})` : 'none';
  const umriss = aktiv ? 'none' : fortschrittFarbe('flammeUmriss');
  return (
    <div data-flamme={aktiv ? 'aktiv' : 'inaktiv'} style={rahmenStil}>
      <svg viewBox="0 0 27 37" aria-hidden="true" style={svgStil}>
        {aktiv ? (
          <defs>
            <linearGradient id={verlauf} x1="0" y1="1" x2="0" y2="0">
              <stop offset="0" data-verlauf="unten" style={{ stopColor: fortschrittFarbe('flammeUnten') }} />
              <stop offset="1" data-verlauf="oben" style={{ stopColor: fortschrittFarbe('flammeOben') }} />
            </linearGradient>
          </defs>
        ) : null}
        <path d={FLAMME} style={{ fill: fuellung, stroke: umriss, strokeWidth: 2, strokeLinejoin: 'round' }} />
        <path d={ZUNGE} style={{ fill: fuellung, stroke: umriss, strokeWidth: 1.6, strokeLinejoin: 'round' }} />
      </svg>
      <span data-streak-zahl="" style={zahlStil(aktiv)}>
        {zahl}
      </span>
    </div>
  );
}
