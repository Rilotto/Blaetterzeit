import type { Bildbereich } from '@/storage/ImageStore';
import { bildschirmrandPx, pillenhoehePx } from '@/theme/typografie';

import type { Masse } from '@/domain/ausgabe';

// Buchdarstellung (REQ-014, REQ-073): Cover, Rücken und Schnitt im selben Maßstab aus den Maßen des Buches.
// Höhe der Darstellung ≈ 787 px im Referenzbild REF-buchdetails-01.png (≈ 2,81 px je dp). Orientierungswerte,
// kein Akzeptanzkriterium.
export const BUCH_HOEHE = 280;
export const BEREICH_ABSTAND = 12; // = Rasterabstand m (REQ-065)
/** Größte Gesamtbreite aus Rücken, Cover, Schnitt und Abständen; breitere Bücher werden kleiner dargestellt. */
export const BUCH_GESAMTBREITE_MAX = 340;

/**
 * Zentrale Standardmaße in Millimetern für fehlende Werte (REQ-073): 13,5 × 21 × 2,5 cm.
 * Auf Zuruf des CEO änderbar, kein Akzeptanzkriterium.
 */
export const STANDARD_MASSE_MM = { breite: 135, hoehe: 210, dicke: 25 } as const;

/** Maße mit Standardwerten für jeden fehlenden Einzelwert (REQ-073, AK-3/AK-4), in Millimetern. */
export function vollstaendigeMasse(m: Masse = {}): { breite: number; hoehe: number; dicke: number } {
  return {
    breite: m.breiteMm ?? STANDARD_MASSE_MM.breite,
    hoehe: m.hoeheMm ?? STANDARD_MASSE_MM.hoehe,
    dicke: m.dickeMm ?? STANDARD_MASSE_MM.dicke,
  };
}

/** Pixelmaße der Buchdarstellung: gemeinsame Höhe, Coverbreite, Breite von Rücken und Schnitt (REQ-073, AK-1). */
export function darstellungsMasse(m: Masse = {}): { hoehe: number; cover: number; schmal: number } {
  const v = vollstaendigeMasse(m);
  let hoehe = BUCH_HOEHE;
  const breiten = (h: number) => ({ cover: (h * v.breite) / v.hoehe, schmal: (h * v.dicke) / v.hoehe });
  let b = breiten(hoehe);
  const gesamt = b.cover + 2 * b.schmal + 2 * BEREICH_ABSTAND;
  if (gesamt > BUCH_GESAMTBREITE_MAX) {
    hoehe = (hoehe * (BUCH_GESAMTBREITE_MAX - 2 * BEREICH_ABSTAND)) / (gesamt - 2 * BEREICH_ABSTAND);
    b = breiten(hoehe);
  }
  return { hoehe, ...b };
}

/** Breite eines Bereichs in px. */
export const bereichBreite = (bereich: Bildbereich, m: Masse = {}): number => {
  const d = darstellungsMasse(m);
  return bereich === 'cover' ? d.cover : d.schmal;
};

/**
 * Seitenverhältnis (Breite/Höhe) eines Bereichs aus den Maßen (REQ-073) – auch Startrahmen und Ziel der
 * Entzerrung im Zuschnitt (REQ-017, REQ-073 AK-6).
 */
export const seitenverhaeltnis = (bereich: Bildbereich, m: Masse = {}): number => {
  const v = vollstaendigeMasse(m);
  return (bereich === 'cover' ? v.breite : v.dicke) / v.hoehe;
};

/** Anzeigenamen der Bereiche (aria-label). */
export const bereichName: Record<Bildbereich, string> = {
  ruecken: 'Buchrücken',
  cover: 'Cover',
  schnitt: 'Schnitt',
};

/** Seitenrand der Buchdetails: zentraler Bildschirmrand (REQ-065). */
export const RAND = bildschirmrandPx;
/** Kantenlänge der Kopfzeilen-Schaltflächen und ihrer Icons. */
export const KOPF_SCHALTFLAECHE = pillenhoehePx;
export const KOPF_ICON = 20;
