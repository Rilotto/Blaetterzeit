import type { Buch } from '../domain/buch';

/**
 * Speicher-Schnittstelle für Bücher. UI und Fachlogik sprechen NUR mit dieser Schnittstelle.
 *
 * Implementierungen:
 *  - InMemoryBookRepository  (Tests, Entwicklung im Browser)
 *  - SqliteBookRepository    (Android-APK, folgt mit erstem Persistenz-REQ)
 *  - HttpBookRepository      (spätere Web-App, siehe ADR-0002)
 *
 * Jede Implementierung MUSS tests/contract/bookRepository.contract.ts bestehen.
 */
export interface BookRepository {
  list(): Promise<Buch[]>;
  get(id: string): Promise<Buch | undefined>;
  /** Legt an oder überschreibt (Upsert anhand der id). */
  save(buch: Buch): Promise<void>;
  remove(id: string): Promise<void>;
}
