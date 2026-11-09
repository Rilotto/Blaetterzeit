/**
 * Minimale SQL-Schnittstelle, über die die SQLite-Implementierungen arbeiten.
 * Auf dem Gerät: @capacitor-community/sqlite (capacitorSqlite.ts).
 * In den Vertragstests: node:sqlite. So wird dasselbe SQL in beiden Fällen geprüft.
 */
export type SqlWert = string | number | null;

export interface SqlVerbindung {
  /** Führt eine Anweisung ohne Ergebnis aus. */
  ausfuehren(sql: string, parameter?: SqlWert[]): Promise<void>;
  /** Führt eine Abfrage aus und liefert die Zeilen. */
  abfragen<T extends Record<string, unknown>>(sql: string, parameter?: SqlWert[]): Promise<T[]>;
}
