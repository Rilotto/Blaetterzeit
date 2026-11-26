import type { Bildbereich } from '@/storage/ImageStore';
import { bildschirmrandPx, pillenhoehePx } from '@/theme/typografie';

import { hatMasse, masseText, type FormatId, type Masse, type UnterformatId } from '@/domain/ausgabe';

// Buchdarstellung (REQ-014, REQ-073): Cover, Rücken und Schnitt im selben Maßstab aus den Maßen des Buches.
// Höhe der Darstellung ≈ 787 px im Referenzbild REF-buchdetails-01.png (≈ 2,81 px je dp). Orientierungswerte,
// kein Akzeptanzkriterium.
export const BUCH_HOEHE = 280;
export const BEREICH_ABSTAND = 12; // = Rasterabstand m (REQ-065)
/** Größte Gesamtbreite aus Rücken, Cover, Schnitt und Abständen; breitere Bücher werden kleiner dargestellt. */
export const BUCH_GESAMTBREITE_MAX = 340;

/** Was die Standardmaße bestimmt (REQ-077): gespeicherte Maße, Format, Unterformat und Seitenzahl. */
export interface MassQuelle extends Masse {
  format?: FormatId;
  unterformat?: UnterformatId;
  seitenanzahl?: number;
}

/** Standardtyp eines Buches für die Standardmaße (REQ-077). */
export type Standardtyp = 'taschenbuch' | 'hardcover' | 'kleinformat';

/**
 * Zentrale Standardmaße je Standardtyp in Millimetern (REQ-077). Auf Zuruf des CEO änderbar, kein
 * Akzeptanzkriterium; eingefroren ist nur die Zuordnung Format → Standardtyp (`standardtyp`).
 * Dicke ohne hinterlegten Wert: Seitenzahl × `dickeJeSeiteMm` + `dickeGrundMm`; ohne Seitenzahl `DICKE_OHNE_SEITEN_MM`.
 * Bei Hardcover sind Breite und Höhe die Außenmaße der Deckel; der Buchblock ist oben, unten und vorne um
 * `deckelUeberstandMm` kleiner.
 */
export const STANDARD_MASSE_MM: Record<
  Standardtyp,
  { breite: number; hoehe: number; dickeJeSeiteMm: number; dickeGrundMm: number; deckelUeberstandMm: number }
> = {
  taschenbuch: { breite: 138, hoehe: 218, dickeJeSeiteMm: 0.0572, dickeGrundMm: 1.5, deckelUeberstandMm: 0 },
  hardcover: { breite: 148, hoehe: 210, dickeJeSeiteMm: 0.0574, dickeGrundMm: 4.75, deckelUeberstandMm: 3 },
  kleinformat: { breite: 105, hoehe: 148, dickeJeSeiteMm: 0.0572, dickeGrundMm: 1.5, deckelUeberstandMm: 0 },
};
export const DICKE_OHNE_SEITEN_MM = 25;

/**
 * Zuordnung Format → Standardtyp (REQ-077): „Print · Hardcover“ → Hardcover, „Print · Kleinformat“ → Kleinformat;
 * alles andere (Taschenbuch, Weiß ich nicht, Print ohne Unterformat, E-Book, Hörbuch, kein Format) → Taschenbuch.
 */
export function standardtyp(q: Pick<MassQuelle, 'format' | 'unterformat'>): Standardtyp {
  if (q.format === 'print' && q.unterformat === 'hardcover') return 'hardcover';
  if (q.format === 'print' && q.unterformat === 'kleinformat') return 'kleinformat';
  return 'taschenbuch';
}

/** Kaufmännisch auf ganze Millimeter (= eine Nachkommastelle in cm) runden; Gleitkommareste werden vorher entfernt. */
const aufMmRunden = (mm: number): number => Math.round(Math.round(mm * 1e6) / 1e6);

/** Geschätzte Dicke in ganzen Millimetern aus Format und Seitenzahl (REQ-077, AK-2/AK-3). */
export function geschaetzteDickeMm(q: Pick<MassQuelle, 'format' | 'unterformat' | 'seitenanzahl'>): number {
  const s = STANDARD_MASSE_MM[standardtyp(q)];
  const seiten = q.seitenanzahl;
  if (seiten === undefined || !Number.isFinite(seiten) || seiten <= 0) return DICKE_OHNE_SEITEN_MM;
  return aufMmRunden(seiten * s.dickeJeSeiteMm + s.dickeGrundMm);
}

/** Wirksame Maße eines Buches (REQ-077): hinterlegte Werte haben Vorrang, fehlende sind geschätzt. */
export interface WirksameMasse {
  /** Breite in ganzen mm; bei Hardcover Außenmaß der Deckel. */
  breiteMm: number;
  /** Höhe in ganzen mm; bei Hardcover Außenmaß der Deckel. */
  hoeheMm: number;
  dickeMm: number;
  /** true = Standard- bzw. Schätzwert, false = hinterlegt. */
  geschaetzt: { breite: boolean; hoehe: boolean; dicke: boolean };
  standardtyp: Standardtyp;
  /** Deckelüberstand oben, unten und vorne in mm (Hardcover 3, sonst 0). */
  deckelUeberstandMm: number;
  /** Buchblock: Breite − Überstand, Höhe − 2 × Überstand (REQ-077, AK-7). */
  buchblock: { breiteMm: number; hoeheMm: number };
}

/** Wirksame Maße für Vorschlag (REQ-072), Buchdarstellung (REQ-073) und 3D-Modell (REQ-076). */
export function wirksameMasse(q: MassQuelle = {}): WirksameMasse {
  const typ = standardtyp(q);
  const s = STANDARD_MASSE_MM[typ];
  const breiteMm = q.breiteMm ?? s.breite;
  const hoeheMm = q.hoeheMm ?? s.hoehe;
  const dickeMm = q.dickeMm ?? geschaetzteDickeMm(q);
  const u = s.deckelUeberstandMm;
  return {
    breiteMm,
    hoeheMm,
    dickeMm,
    geschaetzt: { breite: q.breiteMm === undefined, hoehe: q.hoeheMm === undefined, dicke: q.dickeMm === undefined },
    standardtyp: typ,
    deckelUeberstandMm: u,
    buchblock: { breiteMm: Math.max(breiteMm - u, 1), hoeheMm: Math.max(hoeheMm - 2 * u, 1) },
  };
}

/** Vollständige Maße (REQ-073, AK-3/AK-4) in Millimetern. */
export function vollstaendigeMasse(q: MassQuelle = {}): { breite: number; hoehe: number; dicke: number } {
  const w = wirksameMasse(q);
  return { breite: w.breiteMm, hoehe: w.hoeheMm, dicke: w.dickeMm };
}

/** Alle drei Maße hinterlegt? Dann zeigt die Zeile sie ohne „ca.“ (REQ-072, AK-2). */
export const masseVollstaendig = (q: MassQuelle): boolean => q.breiteMm !== undefined && q.hoeheMm !== undefined && q.dickeMm !== undefined;

/**
 * Vorschlag der Zeile „Maße“, solange nicht alle Werte hinterlegt sind (REQ-072 AK-2/AK-4, REQ-077 AK-10):
 * hinterlegte Einzelwerte, fehlende aus den Standardmaßen, z. B. „ca. 14,8 × 24,0 × 2,8 cm“. Nie gespeichert.
 */
export function masseVorschlagText(q: MassQuelle): string {
  const w = wirksameMasse({ format: q.format, unterformat: q.unterformat, seitenanzahl: q.seitenanzahl, breiteMm: q.breiteMm, hoeheMm: q.hoeheMm, dickeMm: q.dickeMm });
  return `ca. ${masseText({ breiteMm: w.breiteMm, hoeheMm: w.hoeheMm, dickeMm: w.dickeMm })}`;
}

/** Vorbefüllung des Blatts „Maße“ (REQ-072, AK-3): hinterlegte Werte, ohne jeden Wert die Schätzwerte. */
export function masseVorbefuellung(q: MassQuelle): Masse {
  if (hatMasse(q)) return { breiteMm: q.breiteMm, hoeheMm: q.hoeheMm, dickeMm: q.dickeMm };
  const w = wirksameMasse({ format: q.format, unterformat: q.unterformat, seitenanzahl: q.seitenanzahl });
  return { breiteMm: w.breiteMm, hoeheMm: w.hoeheMm, dickeMm: w.dickeMm };
}

/** Pixelmaße der Buchdarstellung: gemeinsame Höhe, Coverbreite, Breite von Rücken und Schnitt (REQ-073, AK-1). */
export function darstellungsMasse(m: MassQuelle = {}): { hoehe: number; cover: number; schmal: number } {
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
export const bereichBreite = (bereich: Bildbereich, m: MassQuelle = {}): number => {
  const d = darstellungsMasse(m);
  return bereich === 'cover' ? d.cover : d.schmal;
};

/**
 * Seitenverhältnis (Breite/Höhe) eines Bereichs aus den Maßen (REQ-073) – auch Startrahmen und Ziel der
 * Entzerrung im Zuschnitt (REQ-017, REQ-073 AK-6).
 */
export const seitenverhaeltnis = (bereich: Bildbereich, m: MassQuelle = {}): number => {
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
