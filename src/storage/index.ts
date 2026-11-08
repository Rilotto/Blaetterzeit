import type { BookRepository } from './BookRepository';
import { InMemoryBookRepository } from './InMemoryBookRepository';

export type { BookRepository };

/**
 * Einzige Stelle, an der entschieden wird, welche Speicher-Implementierung läuft.
 * Aktuell: In-Memory (Daten gehen beim Schließen verloren).
 * Persistenz per SQLite ist bewusst ein eigener REQ.
 */
export function createBookRepository(): BookRepository {
  return new InMemoryBookRepository();
}
