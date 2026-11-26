// Wert der Bibliothek im Profil (REQ-121): reine Funktionen ohne Speicherzugriff.
import type { Buch } from './buch';

/**
 * Summe der gespeicherten Preise in Cent (REQ-121, AK-2/AK-3): alle Bücher außer Lesestatus *Wunschliste*;
 * Bücher ohne Preis zählen nicht, die Angabe „Exemplar“ spielt keine Rolle. Ganzzahlig, ohne Rundungsfehler.
 */
export function bibliothekswertCent(buecher: readonly Pick<Buch, 'status' | 'preisCent'>[]): number {
  let summe = 0;
  for (const b of buecher) {
    if (b.status === 'wunschliste' || b.preisCent === undefined) continue;
    summe += b.preisCent;
  }
  return summe;
}

/** Betrag in Cent als „1.234,56 €“ (Punkt als Tausendertrennzeichen, Komma vor den Cent; REQ-121, AK-4). */
export function betragText(cent: number): string {
  const vorzeichen = cent < 0 ? '-' : '';
  const betrag = Math.abs(Math.round(cent));
  const euro = String(Math.floor(betrag / 100)).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  const rest = String(betrag % 100).padStart(2, '0');
  return `${vorzeichen}${euro},${rest} €`;
}
