// Demodaten für den Prototyp (REQ-008/REQ-009, Randbedingung, kein App-Feature).
// Die Datei demo/testbuecher.json pflegt der Tester. Fehlt sie, gibt es keine Demodaten.
import { buchAusDaten, type Buch } from '@/domain/buch';

const dateien = import.meta.glob<unknown>('/demo/testbuecher.json', { eager: true, import: 'default' });

function pruefe(eintrag: unknown, index: number): Buch {
  try {
    return buchAusDaten(eintrag);
  } catch {
    throw new Error(`demo/testbuecher.json: Eintrag ${index} ist kein gültiges Buch { id, titel, status }`);
  }
}

function lade(): Buch[] {
  const inhalt = Object.values(dateien)[0];
  if (inhalt === undefined) return [];
  if (!Array.isArray(inhalt)) throw new Error('demo/testbuecher.json: erwartet wird ein Array');
  return inhalt.map(pruefe);
}

export const demoBuecher: readonly Buch[] = lade();
