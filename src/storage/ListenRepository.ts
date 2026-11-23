import type { Liste, Zugehoerigkeit } from '../domain/listen';

/**
 * Speicher-Schnittstelle für Listen (Sagas, Sammlungen, Bibliotheken) und die Zugehörigkeit von Büchern samt
 * Bandnummer (REQ-095 bis REQ-099, ADR-0002). UI und Fachlogik sprechen NUR mit dieser Schnittstelle.
 *
 * Implementierungen: InMemoryListenRepository (Tests, Rückfall), IndexedDbListenRepository (Web, Migration 8),
 * SqliteListenRepository (Android, Migration 10). Jede muss tests/contract/listenRepository.contract.ts bestehen.
 */
export interface ListenRepository {
  /** Alle Listen (Reihenfolge ohne Bedeutung). */
  listen(): Promise<Liste[]>;
  /** Legt eine Liste an oder überschreibt sie (Upsert anhand der id, z. B. Umbenennen). */
  listeSpeichern(liste: Liste): Promise<void>;
  /** Entfernt die Liste samt allen Zugehörigkeiten und Bandnummern; die Bücher bleiben (REQ-098). */
  listeEntfernen(listeId: string): Promise<void>;
  /** Alle Zugehörigkeiten. */
  zugehoerigkeiten(): Promise<Zugehoerigkeit[]>;
  /** Nimmt ein Buch in eine Liste auf bzw. überschreibt die Bandnummer (Upsert anhand listeId + buchId). */
  zuordnen(z: Zugehoerigkeit): Promise<void>;
  /** Nimmt ein Buch aus einer Liste heraus. */
  herausnehmen(listeId: string, buchId: string): Promise<void>;
}
