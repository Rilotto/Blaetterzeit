/**
 * Fachliches Kernmodell „Buch“ (REQ-008). Keine Abhängigkeit zu UI oder Speicher.
 * Begriffe siehe docs/glossary.md.
 */

/**
 * Zentrale, geordnete Definition der Lesestatus (REQ-008).
 * Einzige Stelle, an der Lesestatus und ihre Bezeichnungen festgelegt werden.
 * Bezeichnungen in der Schreibweise des CEO.
 */
export const LESESTATUS = [
  { id: 'ungelesen', bezeichnung: 'ungelesen' },
  { id: 'am_lesen', bezeichnung: 'am lesen' },
  { id: 'gelesen', bezeichnung: 'gelesen' },
  { id: 'abgebrochen', bezeichnung: 'abgebrochen' },
  { id: 'wunschliste', bezeichnung: 'Wunschliste' },
] as const;

export type LesestatusId = (typeof LESESTATUS)[number]['id'];

/** Lesestatus eines neu angelegten Buches (REQ-031, AK-6; REQ-021). */
export const STANDARD_LESESTATUS: LesestatusId = 'ungelesen';

/** Prüft, ob ein Wert eine gültige Lesestatus-ID ist. */
export function istLesestatusId(wert: unknown): wert is LesestatusId {
  return LESESTATUS.some((s) => s.id === wert);
}

/**
 * Ein Buch. Weitere Angaben (z. B. Saga, Bewertung) werden als
 * zusätzliche, optionale Felder ergänzt.
 */
export interface Buch {
  /** UUID – nie fortlaufende Nummern, damit späterer Sync/Merge kollisionsfrei bleibt. */
  id: string;
  titel: string;
  /** Optionales Buchcover (Bild-URL bzw. Data-URL). */
  cover?: string;
  status: LesestatusId;
  /** Optional genau ein Autor (REQ-008). */
  autor?: string;
  /** Optionales Erscheinungsjahr, vierstellig (REQ-033). */
  erscheinungsjahr?: number;
  /** Optionales Erscheinungsdatum im Format TT.MM.JJJJ (REQ-033). */
  erscheinungsdatum?: string;
  /** Optionale Seitenanzahl (REQ-025, REQ-031). */
  seitenanzahl?: number;
}

/** Die optionalen Angaben eines Buches (ohne Cover). */
export const OPTIONALE_BUCHFELDER = ['autor', 'erscheinungsjahr', 'erscheinungsdatum', 'seitenanzahl'] as const;

export interface NeuesBuch {
  titel: string;
  status: LesestatusId;
  cover?: string;
  autor?: string;
  erscheinungsjahr?: number;
  erscheinungsdatum?: string;
  seitenanzahl?: number;
}

/** Legt ein Buch mit neuer UUID an. Nicht gesetzte optionale Angaben fehlen im Ergebnis. */
export function neuesBuch(eingabe: NeuesBuch): Buch {
  if (!eingabe.titel.trim()) throw new Error('Buchtitel darf nicht leer sein');
  const buch: Buch = { id: crypto.randomUUID(), titel: eingabe.titel, status: eingabe.status };
  if (eingabe.cover !== undefined) buch.cover = eingabe.cover;
  if (eingabe.autor !== undefined) buch.autor = eingabe.autor;
  if (eingabe.erscheinungsjahr !== undefined) buch.erscheinungsjahr = eingabe.erscheinungsjahr;
  if (eingabe.erscheinungsdatum !== undefined) buch.erscheinungsdatum = eingabe.erscheinungsdatum;
  if (eingabe.seitenanzahl !== undefined) buch.seitenanzahl = eingabe.seitenanzahl;
  return buch;
}

/** Prüft ein Erscheinungsdatum im Format TT.MM.JJJJ (gültiges Kalenderdatum). */
export function istErscheinungsdatum(wert: unknown): wert is string {
  if (typeof wert !== 'string') return false;
  const m = /^(\d{2})\.(\d{2})\.(\d{4})$/.exec(wert);
  if (!m) return false;
  const [t, mo, j] = [Number(m[1]), Number(m[2]), Number(m[3])];
  const d = new Date(Date.UTC(j, mo - 1, t));
  return d.getUTCFullYear() === j && d.getUTCMonth() === mo - 1 && d.getUTCDate() === t;
}

/**
 * Baut aus einem gespeicherten Datensatz ein Buch (für Speicher-Implementierungen und Demodaten).
 * Fehlende bzw. leere optionale Angaben (undefined/null) fehlen im Ergebnis; ungültige Pflichtangaben werfen.
 */
export function buchAusDaten(daten: unknown): Buch {
  const e = (daten ?? {}) as Record<string, unknown>;
  if (typeof e.id !== 'string' || typeof e.titel !== 'string' || !istLesestatusId(e.status)) {
    throw new Error('Kein gültiges Buch { id, titel, status }');
  }
  const buch: Buch = { id: e.id, titel: e.titel, status: e.status };
  if (typeof e.cover === 'string') buch.cover = e.cover;
  if (typeof e.autor === 'string') buch.autor = e.autor;
  if (typeof e.erscheinungsjahr === 'number' && Number.isInteger(e.erscheinungsjahr)) buch.erscheinungsjahr = e.erscheinungsjahr;
  if (typeof e.erscheinungsdatum === 'string') buch.erscheinungsdatum = e.erscheinungsdatum;
  if (typeof e.seitenanzahl === 'number' && Number.isInteger(e.seitenanzahl)) buch.seitenanzahl = e.seitenanzahl;
  return buch;
}
