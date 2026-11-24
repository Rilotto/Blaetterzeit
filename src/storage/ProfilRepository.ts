/**
 * Speicher-Schnittstelle für Angaben zur Person (REQ-107: Name) und das Jahresziel je Kalenderjahr (REQ-104),
 * ADR-0002. UI und Fachlogik sprechen NUR mit dieser Schnittstelle.
 *
 * Implementierungen: InMemoryProfilRepository (Tests, Rückfall), IndexedDbProfilRepository (Web, Migration 9),
 * SqliteProfilRepository (Android, Migration 11). Jede muss tests/contract/profilRepository.contract.ts bestehen.
 */
export interface ProfilRepository {
  /** Hinterlegter Name; `undefined`, wenn keiner hinterlegt ist (auch in einer neu installierten App). */
  nameLesen(): Promise<string | undefined>;
  /** Speichert den Namen; `undefined` entfernt ihn. Der Aufrufer bereinigt die Eingabe (src/domain/startseite.ts). */
  nameSpeichern(name: string | undefined): Promise<void>;
  /** Jahresziel (ganze Zahl ≥ 1) für das Kalenderjahr; `undefined` ohne Ziel. */
  jahreszielLesen(jahr: number): Promise<number | undefined>;
  /** Speichert das Jahresziel für genau dieses Jahr; `undefined` entfernt es. Ungültige Ziele werden abgewiesen. */
  jahreszielSpeichern(jahr: number, ziel: number | undefined): Promise<void>;
}
