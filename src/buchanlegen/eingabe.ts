// Eingaberegeln des Blatts „Manueller Eintrag“ (REQ-030, REQ-031). Ohne UI, damit sie einzeln testbar sind.
import { neuesBuch, STANDARD_LESESTATUS, type Buch } from '@/domain/buch';

export interface Eingaben {
  titel: string;
  autor: string;
  jahr: string;
  seiten: string;
}

export const LEERE_EINGABEN: Eingaben = { titel: '', autor: '', jahr: '', seiten: '' };

/** Feld „JAHR“: nur Ziffern, höchstens vier (REQ-030, AK-12). */
export const jahrFiltern = (wert: string): string => wert.replace(/\D/g, '').slice(0, 4);

/** Feld „SEITEN“: nur Ziffern, höchstens fünf (Annahme des Entwicklers). */
export const seitenFiltern = (wert: string): string => wert.replace(/\D/g, '').slice(0, 5);

/** Titel fehlt, wenn leer oder nur aus Leerzeichen (REQ-031, AK-4/AK-11). */
export const titelFehlt = (e: Eingaben): boolean => e.titel.trim() === '';

/** Jahr ist ungültig bei einer bis drei Ziffern; leer ist gültig (REQ-031, AK-12/AK-13). */
export const jahrUngueltig = (e: Eingaben): boolean => e.jahr !== '' && !/^\d{4}$/.test(e.jahr);

/**
 * Baut aus gültigen Eingaben ein neues Buch mit neuer UUID und Lesestatus „ungelesen“ (REQ-031).
 * Leere optionale Felder fehlen im Buch – Platzhaltertexte werden nie gespeichert (AK-2).
 * Ein Erscheinungsdatum gibt es noch nicht (REQ-033, AK-3).
 */
export function buchAusEingaben(e: Eingaben): Buch {
  if (titelFehlt(e)) throw new Error('Titel fehlt');
  if (jahrUngueltig(e)) throw new Error('Jahr ungültig');
  const autor = e.autor.trim();
  const seiten = e.seiten === '' ? undefined : Number(e.seiten);
  return neuesBuch({
    titel: e.titel.trim(),
    status: STANDARD_LESESTATUS,
    ...(autor ? { autor } : {}),
    ...(e.jahr ? { erscheinungsjahr: Number(e.jahr) } : {}),
    // Eine Seitenanzahl von 0 ist keine Angabe (Annahme des Entwicklers).
    ...(seiten !== undefined && seiten > 0 ? { seitenanzahl: seiten } : {}),
  });
}
