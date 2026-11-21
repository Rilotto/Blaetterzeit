import type { SqlVerbindung } from './SqlVerbindung';

/**
 * Versionierte Schemaänderungen der lokalen SQLite-Datenbank (ADR-0002).
 * Regeln: Einträge werden nur angehängt, nie geändert oder entfernt.
 */
export interface Migration {
  version: number;
  beschreibung: string;
  anweisungen: string[];
}

export const MIGRATIONEN: readonly Migration[] = [
  {
    version: 1,
    beschreibung: 'Zuordnung der Bilder zu Buch und Bereich (REQ-019)',
    anweisungen: [
      `CREATE TABLE IF NOT EXISTS buch_bild (
        buch_id TEXT NOT NULL,
        bereich TEXT NOT NULL CHECK (bereich IN ('ruecken', 'cover', 'schnitt')),
        datei TEXT NOT NULL,
        kopf TEXT NOT NULL,
        base64 INTEGER NOT NULL,
        geaendert TEXT NOT NULL,
        PRIMARY KEY (buch_id, bereich)
      )`,
    ],
  },
  {
    version: 2,
    beschreibung: 'Bücher mit allen Angaben (REQ-034, REQ-008, REQ-033)',
    anweisungen: [
      `CREATE TABLE IF NOT EXISTS buch (
        id TEXT NOT NULL PRIMARY KEY,
        titel TEXT NOT NULL,
        status TEXT NOT NULL,
        autor TEXT,
        erscheinungsjahr INTEGER,
        erscheinungsdatum TEXT,
        seitenanzahl INTEGER,
        cover TEXT,
        geaendert TEXT NOT NULL
      )`,
    ],
  },
  {
    version: 3,
    beschreibung: 'Lesefortschritt, Fortschrittsmodus und Sitzungen (REQ-024, REQ-026, REQ-027)',
    anweisungen: [
      'ALTER TABLE buch ADD COLUMN aktuelle_seite INTEGER',
      'ALTER TABLE buch ADD COLUMN fortschritt_prozent INTEGER',
      'ALTER TABLE buch ADD COLUMN fortschrittsmodus TEXT',
      // Sitzungen als JSON-Liste [{ "zeitpunkt": "<ISO>" }]; NULL = keine.
      'ALTER TABLE buch ADD COLUMN sitzungen TEXT',
    ],
  },
  {
    version: 4,
    beschreibung: 'Eintragungsdatum (REQ-041)',
    anweisungen: [
      // ISO-Zeitpunkt des Anlegens; NULL bei vorhandenen Büchern (gelten als älter, Reihenfolge des Anlegens).
      'ALTER TABLE buch ADD COLUMN eingetragen_am TEXT',
    ],
  },
];

/** Aktuelle Schemaversion der Datenbank (0 = leer). */
export async function schemaVersion(db: SqlVerbindung): Promise<number> {
  await db.ausfuehren('CREATE TABLE IF NOT EXISTS schema_version (version INTEGER NOT NULL)');
  const zeilen = await db.abfragen<{ version: number | null }>('SELECT MAX(version) AS version FROM schema_version');
  return Number(zeilen[0]?.version ?? 0);
}

/** Wendet alle noch fehlenden Migrationen in aufsteigender Reihenfolge an. Liefert die neue Version. */
export async function migrieren(
  db: SqlVerbindung,
  migrationen: readonly Migration[] = MIGRATIONEN,
): Promise<number> {
  let aktuell = await schemaVersion(db);
  const offen = [...migrationen].filter((m) => m.version > aktuell).sort((a, b) => a.version - b.version);
  for (const m of offen) {
    for (const sql of m.anweisungen) await db.ausfuehren(sql);
    await db.ausfuehren('INSERT INTO schema_version (version) VALUES (?)', [m.version]);
    aktuell = m.version;
  }
  return aktuell;
}
