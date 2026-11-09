import type { Bildbereich } from '@/storage/ImageStore';

// Maße der Buchdarstellung (REQ-014), aus dem Referenzbild REF-buchdetails-01.png
// (1080 px breit, ≈ 2,81 px je dp): Cover ≈ 525 × 787 px, Rücken/Schnitt ≈ 98 × 787 px,
// Abstand ≈ 35 px. Orientierungswerte, kein Akzeptanzkriterium.
export const BUCH_HOEHE = 280;
export const COVER_BREITE = 186;
export const SCHMAL_BREITE = 35;
export const BEREICH_ABSTAND = 12;

/** Breite eines Bereichs in px. */
export const bereichBreite = (bereich: Bildbereich): number => (bereich === 'cover' ? COVER_BREITE : SCHMAL_BREITE);

/** Seitenverhältnis (Breite/Höhe) eines Bereichs – auch Startrahmen und Ziel der Entzerrung (REQ-017). */
export const seitenverhaeltnis = (bereich: Bildbereich): number => bereichBreite(bereich) / BUCH_HOEHE;

/** Anzeigenamen der Bereiche (aria-label). */
export const bereichName: Record<Bildbereich, string> = {
  ruecken: 'Buchrücken',
  cover: 'Cover',
  schnitt: 'Schnitt',
};

/** Seitenrand der Buchdetails (Referenzbild ≈ 24 dp, wie Seite „Bücher“). */
export const RAND = 24;
/** Kantenlänge der Kopfzeilen-Schaltflächen und ihrer Icons. */
export const KOPF_SCHALTFLAECHE = 40;
export const KOPF_ICON = 24;
