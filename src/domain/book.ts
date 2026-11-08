/**
 * Fachliches Kernmodell. Enthält keine Abhängigkeit zu UI oder Speicher.
 * Begriffe siehe docs/glossary.md.
 */

export type ReadingStatus = 'want_to_read' | 'reading' | 'read';

export interface Book {
  /** UUID – nie fortlaufende Nummern, damit späterer Sync/Merge kollisionsfrei bleibt. */
  id: string;
  title: string;
  author: string;
  isbn?: string;
  status: ReadingStatus;
  /** ISO-8601 */
  createdAt: string;
  /** ISO-8601 */
  updatedAt: string;
}

export interface NewBook {
  title: string;
  author: string;
  isbn?: string;
  status?: ReadingStatus;
}

export function createBook(input: NewBook, now: Date = new Date()): Book {
  const title = input.title.trim();
  if (!title) throw new Error('Titel darf nicht leer sein');
  const ts = now.toISOString();
  return {
    id: crypto.randomUUID(),
    title,
    author: input.author.trim(),
    isbn: input.isbn?.trim() || undefined,
    status: input.status ?? 'want_to_read',
    createdAt: ts,
    updatedAt: ts,
  };
}
