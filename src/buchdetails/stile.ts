import type { CSSProperties } from 'react';
import { KOPF_SCHALTFLAECHE } from './masse';

/** Runde, flächenlose Schaltfläche der Kopfzeile (Zurück-Pfeil, drei Punkte). */
export const kopfSchaltflaecheStil: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: `${KOPF_SCHALTFLAECHE}px`,
  height: `${KOPF_SCHALTFLAECHE}px`,
  margin: 0,
  padding: 0,
  border: 'none',
  background: 'none',
  cursor: 'pointer',
  WebkitTapHighlightColor: 'transparent',
};
