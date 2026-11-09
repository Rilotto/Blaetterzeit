import { CapacitorSQLite, SQLiteConnection, type SQLiteDBConnection } from '@capacitor-community/sqlite';
import { migrieren } from './migrationen';
import type { SqlVerbindung, SqlWert } from './SqlVerbindung';

const DATENBANK = 'blaetterzeit';

/** SqlVerbindung über @capacitor-community/sqlite (nur Android-APK). */
class CapacitorSqlVerbindung implements SqlVerbindung {
  private readonly db: SQLiteDBConnection;

  constructor(db: SQLiteDBConnection) {
    this.db = db;
  }

  async ausfuehren(sql: string, parameter: SqlWert[] = []): Promise<void> {
    await this.db.run(sql, parameter, false);
  }

  async abfragen<T extends Record<string, unknown>>(sql: string, parameter: SqlWert[] = []): Promise<T[]> {
    const ergebnis = await this.db.query(sql, parameter);
    return (ergebnis.values ?? []) as T[];
  }
}

let verbindung: Promise<SqlVerbindung> | undefined;

/** Öffnet die lokale Datenbank einmalig und bringt das Schema per Migration auf den aktuellen Stand. */
export function sqliteOeffnen(): Promise<SqlVerbindung> {
  verbindung ??= (async () => {
    const sqlite = new SQLiteConnection(CapacitorSQLite);
    const konsistent = (await sqlite.checkConnectionsConsistency()).result;
    const vorhanden = (await sqlite.isConnection(DATENBANK, false)).result;
    const db =
      konsistent && vorhanden
        ? await sqlite.retrieveConnection(DATENBANK, false)
        : await sqlite.createConnection(DATENBANK, false, 'no-encryption', 1, false);
    await db.open();
    const v = new CapacitorSqlVerbindung(db);
    await migrieren(v);
    return v;
  })();
  verbindung.catch(() => {
    verbindung = undefined;
  });
  return verbindung;
}
