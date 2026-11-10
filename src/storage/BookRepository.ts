import type { Buch } from '../domain/buch';

/**
 * Speicher-Schnittstelle für Bücher. UI und Fachlogik sprechen NUR mit dieser Schnittstelle.
 *
 * Implementierungen:
 *  - InMemoryBookRepository  (Tests, Rückfall)
 *  - IndexedDbBookRepository (Web/Prototyp, REQ-034)
 *  - SqliteBookRepository    (Android-APK, REQ-034)
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
