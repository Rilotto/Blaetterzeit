import type { CSSProperties } from 'react';
import { coverSchatten } from '@/theme';

// Einheitliche Coverfläche (REQ-009, REQ-010, REQ-011, REQ-012).
// Maße aus dem Referenzbild (≈ 113 × 171 dp), Seitenverhältnis 2:3.
export const coverBreite = 112;
export const coverHoehe = 168;

/** Äußere Form jeder Coverfläche: feste Größe, leicht gerundete Ecken, dezenter Schatten. */
export const coverFlaecheStil: CSSProperties = {
  boxSizing: 'border-box',
  flex: '0 0 auto',
  width: `${coverBreite}px`,
  height: `${coverHoehe}px`,
  borderRadius: '6px',
  boxShadow: coverSchatten,
};
