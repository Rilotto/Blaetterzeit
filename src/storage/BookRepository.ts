import type { Book } from '../domain/book';

/**
 * Speicher-Schnittstelle. UI und Fachlogik sprechen NUR mit dieser Schnittstelle.
 *
 * Implementierungen:
 *  - InMemoryBookRepository  (Tests, Entwicklung im Browser)
 *  - SqliteBookRepository    (Android-APK, folgt mit erstem Persistenz-REQ)
 *  - HttpBookRepository      (spätere Web-App, siehe ADR-0002)
 *
 * Jede Implementierung MUSS tests/contract/bookRepository.contract.ts bestehen.
 */
export interface BookRepository {
  list(): Promise<Book[]>;
  get(id: string): Promise<Book | undefined>;
  /** Legt an oder überschreibt (Upsert anhand der id). */
  save(book: Book): Promise<void>;
  remove(id: string): Promise<void>;
}
