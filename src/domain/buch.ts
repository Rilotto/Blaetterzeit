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

/** Prüft, ob ein Wert eine gültige Lesestatus-ID ist. */
export function istLesestatusId(wert: unknown): wert is LesestatusId {
  return LESESTATUS.some((s) => s.id === wert);
}

/**
 * Ein Buch. Weitere Angaben (z. B. Autor, Saga, Bewertung) werden als
 * zusätzliche, optionale Felder ergänzt.
 */
export interface Buch {
  /** UUID – nie fortlaufende Nummern, damit späterer Sync/Merge kollisionsfrei bleibt. */
  id: string;
  titel: string;
  /** Optionales Buchcover (Bild-URL bzw. Data-URL). */
  cover?: string;
  status: LesestatusId;
}

export interface NeuesBuch {
  titel: string;
  status: LesestatusId;
  cover?: string;
}

/** Legt ein Buch mit neuer UUID an. */
export function neuesBuch(eingabe: NeuesBuch): Buch {
  if (!eingabe.titel.trim()) throw new Error('Buchtitel darf nicht leer sein');
  const buch: Buch = { id: crypto.randomUUID(), titel: eingabe.titel, status: eingabe.status };
  if (eingabe.cover !== undefined) buch.cover = eingabe.cover;
  return buch;
}
