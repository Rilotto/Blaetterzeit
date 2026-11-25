import type { Zitat } from '../domain/zitat';

/**
 * Speicher-Schnittstelle für Zitate (REQ-105, REQ-106, ADR-0002). UI und Fachlogik sprechen NUR mit dieser Schnittstelle.
 *
 * Implementierungen: InMemoryZitatRepository (Tests, Rückfall), IndexedDbZitatRepository (Web, Migration 9),
 * SqliteZitatRepository (Android, Migration 11). Jede muss tests/contract/zitatRepository.contract.ts bestehen.
 */
export interface ZitatRepository {
  /** Alle Zitate aller Bücher (Reihenfolge ohne Bedeutung; sortiert wird in src/domain/zitat.ts). */
  alle(): Promise<Zitat[]>;
  /** Zitate eines Buches (Reihenfolge ohne Bedeutung). */
  vonBuch(buchId: string): Promise<Zitat[]>;
  /** Legt ein Zitat an oder überschreibt es (Upsert anhand der id). Fehlende optionale Angaben werden entfernt. */
  speichern(zitat: Zitat): Promise<void>;
  /** Entfernt ein Zitat; unbekannte id ist kein Fehler. */
  entfernen(id: string): Promise<void>;
}
