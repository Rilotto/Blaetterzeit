import type { Liste, Zugehoerigkeit } from '../domain/listen';

/**
 * Speicher-Schnittstelle für Listen (Sagas, Sammlungen, Bibliotheken) und die Zugehörigkeit von Büchern
 * (REQ-095 bis REQ-099, ADR-0002). Die Bandnummer gehört seit REQ-112 zum Buch (BookRepository). UI und Fachlogik sprechen NUR mit dieser Schnittstelle.
 *
 * Implementierungen: InMemoryListenRepository (Tests, Rückfall), IndexedDbListenRepository (Web, Migration 8),
 * SqliteListenRepository (Android, Migration 10). Jede muss tests/contract/listenRepository.contract.ts bestehen.
 */
export interface ListenRepository {
  /** Alle Listen (Reihenfolge ohne Bedeutung). */
  listen(): Promise<Liste[]>;
  /** Legt eine Liste an oder überschreibt sie (Upsert anhand der id, z. B. Umbenennen). */
  listeSpeichern(liste: Liste): Promise<void>;
  /** Entfernt die Liste samt allen Zugehörigkeiten; die Bücher bleiben samt Bandnummer (REQ-098, REQ-112). */
  listeEntfernen(listeId: string): Promise<void>;
  /** Alle Zugehörigkeiten. */
  zugehoerigkeiten(): Promise<Zugehoerigkeit[]>;
  /** Nimmt ein Buch in eine Liste auf (Upsert anhand listeId + buchId). */
  zuordnen(z: Zugehoerigkeit): Promise<void>;
  /** Nimmt ein Buch aus einer Liste heraus. */
  herausnehmen(listeId: string, buchId: string): Promise<void>;
}
