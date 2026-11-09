import { describe, expect, it } from 'vitest';
import { GeraeteImageStore, dataUrlZerlegen } from '@/storage/GeraeteImageStore';
import { MIGRATIONEN, migrieren, schemaVersion } from '@/storage/sqlite/migrationen';
import { nodeSqlite } from '../contract/nodeSqlite';
import { speicherDateiablage } from '../contract/speicherDateiablage';

const BUCH = '6a1c2d0e-1b2c-4d3e-8f40-0a1b2c3d4e5f';

describe('SQLite-Migrationen', () => {
  it('bringt eine leere Datenbank auf die neueste Version und ist wiederholbar', async () => {
    const db = await nodeSqlite();
    expect(await schemaVersion(db)).toBe(0);
    const neueste = Math.max(...MIGRATIONEN.map((m) => m.version));
    expect(await migrieren(db)).toBe(neueste);
    expect(await migrieren(db)).toBe(neueste);
    expect(await db.abfragen('SELECT version FROM schema_version')).toHaveLength(MIGRATIONEN.length);
  });

  it('wendet nur fehlende Migrationen an, in aufsteigender Reihenfolge', async () => {
    const db = await nodeSqlite();
    const reihenfolge: number[] = [];
    const m = [
      { version: 2, beschreibung: 'b', anweisungen: ['CREATE TABLE b (x TEXT)'] },
      { version: 1, beschreibung: 'a', anweisungen: ['CREATE TABLE a (x TEXT)'] },
    ];
    await migrieren(db, [m[1]]);
    const protokoll = { ...db, ausfuehren: async (sql: string, p?: (string | number | null)[]) => {
      if (/^CREATE TABLE [ab] /.test(sql)) reihenfolge.push(sql.includes(' b ') ? 2 : 1);
      return db.ausfuehren(sql, p);
    } };
    expect(await migrieren(protokoll, m)).toBe(2);
    expect(reihenfolge).toEqual([2]);
  });

  it('erlaubt in buch_bild nur die drei Bereiche', async () => {
    const db = await nodeSqlite();
    await migrieren(db);
    await expect(
      db.ausfuehren("INSERT INTO buch_bild VALUES ('x', 'klappentext', 'd', 'k', 1, 't')"),
    ).rejects.toThrow();
  });
});

describe('GeraeteImageStore', () => {
  it('legt Bilder als Dateien ab und räumt beim Ersetzen und Entfernen alte Dateien weg', async () => {
    const db = await nodeSqlite();
    await migrieren(db);
    const ablage = speicherDateiablage();
    const store = new GeraeteImageStore(db, ablage);
    await store.put(BUCH, 'cover', 'data:image/jpeg;base64,AAAA');
    expect([...ablage.dateien.keys()]).toHaveLength(1);
    expect([...ablage.dateien.keys()][0]).toMatch(/^bilder\/[0-9a-f-]{36}\.jpg$/);
    expect([...ablage.dateien.values()]).toEqual(['AAAA']);
    await store.put(BUCH, 'cover', 'data:image/png;base64,BBBB');
    expect([...ablage.dateien.values()]).toEqual(['BBBB']);
    await store.remove(BUCH, 'cover');
    expect(ablage.dateien.size).toBe(0);
  });

  it('meldet einen Bereich ohne Bild, wenn die Datei fehlt', async () => {
    const db = await nodeSqlite();
    await migrieren(db);
    const ablage = speicherDateiablage();
    const store = new GeraeteImageStore(db, ablage);
    await store.put(BUCH, 'schnitt', 'data:image/jpeg;base64,AAAA');
    ablage.dateien.clear();
    expect(await store.get(BUCH, 'schnitt')).toBeUndefined();
  });

  it('zerlegt Data-URLs mit und ohne base64', () => {
    expect(dataUrlZerlegen('data:image/png;base64,QQ==')).toEqual({ kopf: 'data:image/png;base64', daten: 'QQ==', base64: true });
    expect(dataUrlZerlegen('data:image/svg+xml,<svg/>')).toEqual({ kopf: 'data:image/svg+xml', daten: '<svg/>', base64: false });
    expect(() => dataUrlZerlegen('keine-url')).toThrow();
  });
});
