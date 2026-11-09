import type { SqlVerbindung, SqlWert } from '@/storage/sqlite/SqlVerbindung';

interface Anweisung {
  run(...p: SqlWert[]): unknown;
  all(...p: SqlWert[]): Record<string, unknown>[];
}
interface DatabaseSync {
  prepare(sql: string): Anweisung;
}

/** SqlVerbindung auf node:sqlite (In-Memory-Datenbank), um das echte SQL im Test auszuführen. */
export async function nodeSqlite(): Promise<SqlVerbindung> {
  const modul = 'node:sqlite';
  const { DatabaseSync } = (await import(/* @vite-ignore */ modul)) as { DatabaseSync: new (pfad: string) => DatabaseSync };
  const db = new DatabaseSync(':memory:');
  return {
    async ausfuehren(sql, parameter = []) {
      db.prepare(sql).run(...parameter);
    },
    async abfragen<T extends Record<string, unknown>>(sql: string, parameter: SqlWert[] = []) {
      return db.prepare(sql).all(...parameter).map((z) => ({ ...z }) as T);
    },
  };
}
