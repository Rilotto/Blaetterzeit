import type { CSSProperties } from 'react';
import { buecherFarbe } from '@/theme';

// Gemeinsame Maße der Seite „Bücher“, orientiert am Referenzbild (kein Akzeptanzkriterium).

/** Seitlicher Seitenrand in px (Referenzbild ≈ 24 dp). */
export const seitenRand = 24;

/** Abschnittsüberschrift („Noch zu lesen“, „Sagas“, „Sammlungen“): gleiche Größe und Stärke. */
export const abschnittsueberschriftStil: CSSProperties = {
  margin: 0,
  fontSize: '20px',
  fontWeight: 700,
  lineHeight: 1.25,
  color: buecherFarbe('abschnittsueberschrift'),
};

/** Abstand vor einem Abschnitt. */
export const abschnittStil: CSSProperties = {
  marginTop: '28px',
};

/** Kopfzeile eines Abschnitts mit Seitenrand. */
export const abschnittKopfStil: CSSProperties = {
  display: 'flex',
  alignItems: 'baseline',
  justifyContent: 'space-between',
  gap: '12px',
  padding: `0 ${seitenRand}px`,
  marginBottom: '14px',
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
  margin: '8px 0 0',
  fontSize: '15px',
  fontWeight: 600,
  lineHeight: 1.3,
  textAlign: 'left',
  overflowWrap: 'break-word',
};
