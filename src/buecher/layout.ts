import type { CSSProperties } from 'react';
import { buecherFarbe, textstufe, bildschirmrandPx, abstand } from '@/theme';

// Gemeinsame Maße der Seite „Bücher“, orientiert am Referenzbild (kein Akzeptanzkriterium).

/** Seitlicher Seitenrand in px: zentraler Bildschirmrand (REQ-065). */
export const seitenRand = bildschirmrandPx;

/** Abschnittsüberschrift („Noch zu lesen“, „Sagas“, „Sammlungen“): gleiche Größe und Stärke. */
export const abschnittsueberschriftStil: CSSProperties = {
  margin: 0,
  ...textstufe('abschnitt'),
  fontWeight: 700,
  lineHeight: 1.25,
  color: buecherFarbe('abschnittsueberschrift'),
};

/** Abstand vor einem Abschnitt. */
export const abschnittStil: CSSProperties = {
  marginTop: abstand('xl'),
};

/** Kopfzeile eines Abschnitts mit Seitenrand. */
export const abschnittKopfStil: CSSProperties = {
  display: 'flex',
  alignItems: 'baseline',
  justifyContent: 'space-between',
  gap: abstand('m'),
  padding: `0 ${seitenRand}px`,
  marginBottom: abstand('m'),
};

/** Horizontal scrollbarer Streifen, der bis an den Bildschirmrand reicht. */
export const horizontalScrollStil: CSSProperties = {
  display: 'flex',
  overflowX: 'auto',
  overflowY: 'hidden',
  scrollbarWidth: 'none',
  WebkitOverflowScrolling: 'touch',
  paddingLeft: `${seitenRand}px`,
  paddingRight: `${seitenRand}px`,
};

/** Text unter einer Coverfläche (Buchtitel bzw. Text des Leere-Liste-Platzhalters). */
export const textUnterCoverStil: CSSProperties = {
  margin: `${abstand('s')} 0 0`,
  ...textstufe('titel'),
  fontWeight: 600,
  lineHeight: 1.3,
  textAlign: 'left',
  overflowWrap: 'break-word',
};
