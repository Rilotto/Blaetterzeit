// Demodaten für den Prototyp (REQ-008/REQ-009, Randbedingung, kein App-Feature).
// Die Datei demo/testbuecher.json pflegt der Tester. Fehlt sie, gibt es keine Demodaten.
import { istLesestatusId, type Buch } from '@/domain/buch';

const dateien = import.meta.glob<unknown>('/demo/testbuecher.json', { eager: true, import: 'default' });

function pruefe(eintrag: unknown, index: number): Buch {
  const e = eintrag as Partial<Record<keyof Buch, unknown>>;
  if (typeof e?.id !== 'string' || typeof e.titel !== 'string' || !istLesestatusId(e.status)) {
    throw new Error(`demo/testbuecher.json: Eintrag ${index} ist kein gültiges Buch { id, titel, status }`);
  }
  const buch: Buch = { id: e.id, titel: e.titel, status: e.status };
  if (typeof e.cover === 'string') buch.cover = e.cover;
  return buch;
}

function lade(): Buch[] {
  const inhalt = Object.values(dateien)[0];
  if (inhalt === undefined) return [];
  if (!Array.isArray(inhalt)) throw new Error('demo/testbuecher.json: erwartet wird ein Array');
  return inhalt.map(pruefe);
}

export const demoBuecher: readonly Buch[] = lade();
