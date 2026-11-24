/**
 * Startseite (REQ-101 bis REQ-104) und Name im Profil (REQ-107): reine Fachlogik ohne UI und Speicher.
 * Alle Zeiten sind lokale Gerätezeit; `jetzt` kommt immer von außen (injizierbare Uhr, src/plattform/uhr.tsx).
 */
import type { Buch } from './buch';
import { kennzahlen, zeitraumFuer } from './statistik';
import { alphabetisch } from './uebersicht';

export type Tageszeit = 'morgen' | 'tag' | 'abend' | 'nacht';

/** Gruß und Icon je Tageszeit (REQ-101). */
export const TAGESZEITEN: Record<Tageszeit, { gruss: string; icon: 'sonnenaufgang' | 'sonne' | 'sonnenuntergang' | 'mond'; name: string }> = {
  morgen: { gruss: 'Guten Morgen', icon: 'sonnenaufgang', name: 'Sonnenaufgang' },
  tag: { gruss: 'Hallo', icon: 'sonne', name: 'Sonne' },
  abend: { gruss: 'Guten Abend', icon: 'sonnenuntergang', name: 'Sonnenuntergang' },
  nacht: { gruss: 'Gute Nacht', icon: 'mond', name: 'Mond' },
};

/**
 * Tageszeit ab der vollen Stunde (REQ-101, AK-3/AK-4): 05:00–09:59 Morgen, 10:00–16:59 Tag,
 * 17:00–20:59 Abend, 21:00–04:59 Nacht.
 */
export function tageszeit(jetzt: Date): Tageszeit {
  const h = jetzt.getHours();
  if (h >= 5 && h < 10) return 'morgen';
  if (h >= 10 && h < 17) return 'tag';
  if (h >= 17 && h < 21) return 'abend';
  return 'nacht';
}

/** „Guten Morgen, Christine“ bzw. ohne Namen nur „Guten Morgen“ (REQ-101, AK-6). */
export function grussText(jetzt: Date, name?: string): string {
  const gruss = TAGESZEITEN[tageszeit(jetzt)].gruss;
  const n = name?.trim();
  return n ? `${gruss}, ${n}` : gruss;
}

const WOCHENTAGE = ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'] as const;
const MONATE = ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'] as const;

/** „Montag, 24. November“ (REQ-101, AK-2). */
export const datumKopfText = (jetzt: Date): string => `${WOCHENTAGE[jetzt.getDay()]}, ${jetzt.getDate()}. ${MONATE[jetzt.getMonth()]}`;

/** „14:05“, 24-Stunden-Format (REQ-101, AK-2). */
export const uhrzeitText = (jetzt: Date): string =>
  `${String(jetzt.getHours()).padStart(2, '0')}:${String(jetzt.getMinutes()).padStart(2, '0')}`;

/** Bücher im Status *am lesen*, A–Z nach Titel (REQ-102). */
export function geradeAmLesen(buecher: readonly Buch[]): Buch[] {
  return alphabetisch(buecher.filter((b) => b.status === 'am_lesen'));
}

/** Im Jahr `jahr` beendete Bücher, gezählt wie „Bücher“ der Statistik für das Jahr (REQ-104, AK-3; REQ-081). */
export function beendeteImJahr(buecher: readonly Buch[], jahr: number): number {
  return kennzahlen(buecher, zeitraumFuer('jahr', new Date(jahr, 6, 1, 12))).buecher;
}

/** Kacheltext Jahresziel (REQ-104): „7 von 20 Büchern 2026“ bzw. ohne Ziel „Jahresziel festlegen“. */
export function jahreszielText(gelesen: number, ziel: number | undefined, jahr: number): string {
  return ziel === undefined ? 'Jahresziel festlegen' : `${gelesen} von ${ziel} Büchern ${jahr}`;
}

export const istJahresziel = (w: unknown): w is number => typeof w === 'number' && Number.isInteger(w) && w >= 1;

/**
 * Eingabe im Blatt „Jahresziel“ (REQ-104): leer bzw. nur Leerzeichen → '' (Ziel entfernen), ganze Zahl ≥ 1 → Zahl
 * als Text, sonst `null` (Feld hervorheben, nichts speichern).
 */
export function jahreszielPruefen(eingabe: string): string | null {
  const t = eingabe.trim();
  if (t === '') return '';
  if (!/^\d+$/.test(t)) return null;
  const n = Number(t);
  return istJahresziel(n) ? String(n) : null;
}

/** Name im Profil (REQ-107): Ränder bereinigt; leer bzw. nur Leerzeichen → `undefined` (kein Name). */
export function nameBereinigt(eingabe: string | undefined): string | undefined {
  const t = eingabe?.trim();
  return t ? t : undefined;
}
