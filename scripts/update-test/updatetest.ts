/**
 * Update-Test (Sprint 11, technische Aufgabe): Daten anlegen bzw. nach dem Update prüfen.
 *
 * Läuft NICHT in der normalen Testsuite, sondern nur über scripts/update-test/vitest.config.mts, gesteuert über
 * Umgebungsvariablen:
 *  - UPDATE_TEST_MODUS = "anlegen" | "pruefen"
 *  - UPDATE_TEST_DB    = Pfad der vom Gerät geholten SQLite-Datei (blaetterzeitSQLite.db)
 *  - UPDATE_TEST_SRC   = src-Ordner, aus dem '@/…' aufgelöst wird
 *      anlegen: src der BASISVERSION (Daten so schreiben, wie die alte Version sie schreibt)
 *      pruefen: src der AKTUELLEN Version (Daten so lesen, wie die neue Version sie liest)
 *
 * Datenzugriff ausschließlich über die Repository-Schnittstellen (ADR-0002) auf einer SqlVerbindung über node:sqlite.
 * Beim Prüfen wird bewusst NICHT migriert: Die Schemaversion muss die neue App selbst hochgezogen haben.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { expect, it } from 'vitest';
import type { SqlVerbindung, SqlWert } from '@/storage/sqlite/SqlVerbindung';
import { MIGRATIONEN, migrieren, schemaVersion } from '@/storage/sqlite/migrationen';
import { SqliteBookRepository } from '@/storage/SqliteBookRepository';
import { SqliteListenRepository } from '@/storage/SqliteListenRepository';
import { SqliteZitatRepository } from '@/storage/SqliteZitatRepository';

const BUCH_ID = '7d3c2a1e-5b4f-4c6d-8e9f-0a1b2c3d4e5f';
const LISTE_ID = '1f2e3d4c-5b6a-4978-8877-665544332211';
const ZITAT_ID = 'a0b1c2d3-e4f5-4a6b-9c8d-7e6f5a4b3c2d';
const SITZUNG = '2026-11-20T18:00:00.000Z';

interface Anweisung {
  run(...p: SqlWert[]): unknown;
  all(...p: SqlWert[]): Record<string, unknown>[];
}
interface DatabaseSync {
  prepare(sql: string): Anweisung;
  exec(sql: string): void;
  close(): void;
}

async function oeffnen(pfad: string): Promise<{ db: DatabaseSync; v: SqlVerbindung }> {
  const modul = 'node:sqlite';
  const { DatabaseSync } = (await import(/* @vite-ignore */ modul)) as { DatabaseSync: new (pfad: string) => DatabaseSync };
  const db = new DatabaseSync(pfad);
  const v: SqlVerbindung = {
    async ausfuehren(sql, parameter = []) {
      db.prepare(sql).run(...parameter);
    },
    async abfragen<T extends Record<string, unknown>>(sql: string, parameter: SqlWert[] = []) {
      return db.prepare(sql).all(...parameter).map((z) => ({ ...z }) as T);
    },
  };
  return { db, v };
}

const modus = process.env.UPDATE_TEST_MODUS;
const pfad = process.env.UPDATE_TEST_DB ?? '';
// Schemaversion der Basis nach dem Anlegen; liegt neben der DB, aber nicht als bz.db* (holen() löscht diese).
const basisVersionDatei = () => join(dirname(pfad), 'basis-schemaversion.txt');

/** Version der Migration „Bandnummer aus liste_buch.band übernehmen“ (REQ-112, AK-10), undefined wenn nicht vorhanden. */
function ak10Version(): number | undefined {
  return MIGRATIONEN.find((m) => m.beschreibung.includes('REQ-112, AK-10'))?.version;
}

it(`Update-Test: ${modus ?? '(kein Modus)'}`, async () => {
  expect(['anlegen', 'pruefen']).toContain(modus);
  expect(pfad, 'UPDATE_TEST_DB fehlt').not.toBe('');
  const { db, v } = await oeffnen(pfad);
  try {
    const buecher = new SqliteBookRepository(v);
    const listen = new SqliteListenRepository(v);
    const zitate = new SqliteZitatRepository(v);

    if (modus === 'anlegen') {
      // Die Basis-App hat die Datei beim ersten Start angelegt; Migrieren ist hier nur eine Absicherung (idempotent).
      await migrieren(v);
      const basisHatAk10 = ak10Version() !== undefined;
      await buecher.save({
        id: BUCH_ID,
        titel: 'Updatetest Fourth Wing',
        autor: 'Rebecca Yarros',
        status: 'am_lesen',
        seitenanzahl: 400,
        aktuelleSeite: 42,
        sitzungen: [{ zeitpunkt: SITZUNG, seite: 42 }],
        // Enthält schon die Basis die AK-10-Migration, kennt sie die Bandnummer am Buch: dann direkt setzen,
        // damit das Update sie erhalten muss. Sonst bleibt sie leer und muss aus der Zugehörigkeit entstehen.
        ...(basisHatAk10 ? { bandnummer: 1 } : {}),
      } as Parameters<typeof buecher.save>[0]);
      await listen.listeSpeichern({ id: LISTE_ID, art: 'saga', name: 'Updatetest Empyrean' });
      // Basisversion: Band 1 an der Zugehörigkeit (vor REQ-112). Das Buch selbst hat keine Bandnummer.
      // Cast, weil die aktuelle Zugehoerigkeit kein „band“ mehr kennt; die Basisversion speichert es.
      await listen.zuordnen({ listeId: LISTE_ID, buchId: BUCH_ID, band: 1 } as Parameters<typeof listen.zuordnen>[0]);
      await zitate.speichern({ id: ZITAT_ID, buchId: BUCH_ID, text: 'Ich bin nicht das Feuer.', sprecher: 'Violet', seite: 312, angelegtAm: SITZUNG });
      const basisVersion = await schemaVersion(v);
      writeFileSync(basisVersionDatei(), String(basisVersion));
      console.log(`Basis: Schemaversion ${basisVersion}, Bandnummer am Buch ${basisHatAk10 ? 'gesetzt' : 'leer'}, Testdaten angelegt`);
    } else {
      // Beweis, dass die neue App die Datei tatsächlich geöffnet und migriert hat (sonst liefe sie ggf. im
      // Arbeitsspeicher-Rückfall und die Datei bliebe unberührt).
      const ziel = Math.max(...MIGRATIONEN.map((m) => m.version));
      const zeilen = await v.abfragen<{ version: number | null }>('SELECT MAX(version) AS version FROM schema_version');
      expect(zeilen[0]?.version, 'Schemaversion nach dem Update (von der neuen App migriert)').toBe(ziel);

      const buch = await buecher.get(BUCH_ID);
      expect(buch, 'Buch nach dem Update vorhanden').toBeDefined();
      expect(buch).toMatchObject({ titel: 'Updatetest Fourth Wing', autor: 'Rebecca Yarros', status: 'am_lesen', seitenanzahl: 400, aktuelleSeite: 42 });
      expect(buch!.sitzungen?.map((s) => s.zeitpunkt), 'Sitzung nach dem Update vorhanden').toEqual([SITZUNG]);

      expect(await listen.listen()).toContainEqual(expect.objectContaining({ id: LISTE_ID, art: 'saga', name: 'Updatetest Empyrean' }));
      // REQ-112 AK-10: Lag die Basis vor der Migration, ist Band 1 der Zugehörigkeit zur Bandnummer des Buches
      // geworden. Enthielt die Basis sie schon, wurde die Bandnummer direkt am Buch gesetzt und muss erhalten sein.
      // In beiden Fällen 1 – fehlt sie, ist das ein Datenverlust. Die Zugehörigkeit besteht weiter.
      const basisVersion = Number(readFileSync(basisVersionDatei(), 'utf8'));
      const ak10 = ak10Version();
      expect(Number.isInteger(basisVersion), 'Basis-Schemaversion aus dem Anlegen-Schritt').toBe(true);
      const meldung =
        ak10 !== undefined && basisVersion < ak10
          ? `Bandnummer aus der Saga-Zugehörigkeit übernommen (REQ-112, AK-10; Basis v${basisVersion} < v${ak10})`
          : `In der Basis gesetzte Bandnummer erhalten (Basis v${basisVersion}, schon mit AK-10-Migration)`;
      expect(buch!.bandnummer, meldung).toBe(1);
      expect(await listen.zugehoerigkeiten()).toContainEqual(expect.objectContaining({ listeId: LISTE_ID, buchId: BUCH_ID }));

      expect(await zitate.alle()).toContainEqual(
        expect.objectContaining({ id: ZITAT_ID, buchId: BUCH_ID, text: 'Ich bin nicht das Feuer.', sprecher: 'Violet', seite: 312 }),
      );
      console.log(`Neu: Schemaversion ${ziel}, Buch, Sitzung, Liste, Bandnummer und Zitat erhalten`);
    }
  } finally {
    // WAL in die Hauptdatei schreiben, damit nur diese eine Datei zurück aufs Gerät muss.
    db.exec('PRAGMA wal_checkpoint(TRUNCATE)');
    db.close();
  }
});
