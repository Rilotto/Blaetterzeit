import type { CSSProperties } from 'react';
import { TAGESZEITEN, type Tageszeit } from '@/domain/startseite';
import { startFarbe } from '@/theme';

// Tageszeit-Icons der Startseite (REQ-101): im Linienstil der übrigen Icons (REQ-005) nachgebildet,
// Strich in der Akzentfarbe (Farbrolle „tageszeitIcon“ → Rubrik „Primär“, REQ-101 AK-5). Keine Füllung.

const GROESSE = 30;

const svgStil: CSSProperties = {
  display: 'block',
  flex: '0 0 auto',
  fill: 'none',
  stroke: startFarbe('tageszeitIcon'),
  strokeWidth: 1.8,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
};

/** Strahlen rund um (cx, cy) zwischen Radius r1 und r2 für die angegebenen Winkel (Grad, 0 = rechts). */
const strahlen = (cx: number, cy: number, r1: number, r2: number, winkel: number[]) =>
  winkel.map((w) => {
    const rad = (w * Math.PI) / 180;
    const x1 = cx + r1 * Math.cos(rad);
    const y1 = cy - r1 * Math.sin(rad);
    const x2 = cx + r2 * Math.cos(rad);
    const y2 = cy - r2 * Math.sin(rad);
    return `M${x1.toFixed(2)} ${y1.toFixed(2)}L${x2.toFixed(2)} ${y2.toFixed(2)}`;
  });

const PFADE: Record<Tageszeit, string[]> = {
  // Sonnenaufgang: halbe Sonne über dem Horizont, Strahlen nach oben, Pfeil nach oben.
  morgen: [
    'M3 18.5h18',
    'M7.5 18.5a4.5 4.5 0 0 1 9 0',
    ...strahlen(12, 18.5, 6.5, 8.5, [20, 60, 120, 160]),
    'M12 3.5v4.5',
    'M9.8 5.7L12 3.5l2.2 2.2',
    'M6 21.5h12',
  ],
  // Sonne: Kreis mit acht Strahlen.
  tag: ['M12 8a4 4 0 1 0 0 8a4 4 0 1 0 0-8z', ...strahlen(12, 12, 6.5, 9, [0, 45, 90, 135, 180, 225, 270, 315])],
  // Sonnenuntergang: halbe Sonne am Horizont, Strahlen, Pfeil nach unten.
  abend: [
    'M3 18.5h18',
    'M7.5 18.5a4.5 4.5 0 0 1 9 0',
    ...strahlen(12, 18.5, 6.5, 8.5, [20, 60, 120, 160]),
    'M12 3.5v4.5',
    'M9.8 5.8L12 8l2.2-2.2',
    'M6 21.5h12',
  ],
  // Mond: Sichel mit kleinem Stern.
  nacht: ['M19.5 14.5A8 8 0 0 1 9.5 4.5a8 8 0 1 0 10 10z', 'M17 4v3', 'M15.5 5.5h3'],
};

/** Tageszeit-Icon (role="img", Name z. B. „Sonnenaufgang“): data-tageszeit-icon = sonnenaufgang | sonne | sonnenuntergang | mond. */
export default function TageszeitIcon({ tageszeit, groesse = GROESSE }: { tageszeit: Tageszeit; groesse?: number }) {
  return (
    <svg
      data-tageszeit-icon={TAGESZEITEN[tageszeit].icon}
      role="img"
      aria-label={TAGESZEITEN[tageszeit].name}
      viewBox="0 0 24 24"
      width={groesse}
      height={groesse}
      style={svgStil}
    >
      {PFADE[tageszeit].map((d) => (
        <path key={d} d={d} />
      ))}
    </svg>
  );
}
