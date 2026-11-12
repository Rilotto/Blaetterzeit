import { IDBFactory } from 'fake-indexeddb';
import { IndexedDbBookRepository } from '@/storage/IndexedDbBookRepository';
import { IndexedDbImageStore } from '@/storage/IndexedDbImageStore';
import { RueckfallBookRepository } from '@/storage/RueckfallBookRepository';
import { SqliteBookRepository } from '@/storage/SqliteBookRepository';
import { migrieren } from '@/storage/sqlite/migrationen';
import { describe, expect, it } from 'vitest';
import { runBookRepositoryContract } from './bookRepository.contract';
import { nodeSqlite } from './nodeSqlite';

runBookRepositoryContract('IndexedDB', () => {
  const fabrik = new IDBFactory();
  return { repo: new IndexedDbBookRepository(fabrik, 'test'), neustart: async () => new IndexedDbBookRepository(fabrik, 'test') };
});

runBookRepositoryContract('Gerät (SQLite)', async () => {
  const db = await nodeSqlite();
  await migrieren(db);
  return {
    repo: new SqliteBookRepository(db),
    neustart: async () => {
      await migrieren(db); // beim Neustart läuft die Migration erneut, ohne Daten zu verändern
      return new SqliteBookRepository(db);
    },
  };
});

runBookRepositoryContract('Rückfall (dauerhafter Speicher nicht verfügbar)', () =>
  new RueckfallBookRepository(async () => {
    throw new Error('nicht verfügbar');
  }),
);

describe('IndexedDB: Migration von Version 1 (nur Bilder) auf Version 2 (Bücher)', () => {
  it('vorhandene Bilder bleiben erhalten, Bücher und Bilder teilen sich die Datenbank', async () => {
    const fabrik = new IDBFactory();
    // Datenbank im Stand von Version 1 anlegen (wie vor REQ-034).
    await new Promise<void>((resolve, reject) => {
      const req = fabrik.open('alt', 1);
      req.onupgradeneeded = () => req.result.createObjectStore('bilder');
      req.onsuccess = () => {
        const tx = req.result.transaction('bilder', 'readwrite');
        tx.objectStore('bilder').put('data:image/png;base64,AAAA', 'b1|cover');
        tx.oncomplete = () => {
          req.result.close();
          resolve();
        };
      };
      req.onerror = () => reject(req.error);
    });
    const bilder = new IndexedDbImageStore(fabrik, 'alt');
    const buecher = new IndexedDbBookRepository(fabrik, 'alt');
    expect(await bilder.get('b1', 'cover')).toBe('data:image/png;base64,AAAA');
    await buecher.save({ id: 'b1', titel: 'Momo', status: 'ungelesen' });
    expect(await new IndexedDbBookRepository(fabrik, 'alt').list()).toEqual([{ id: 'b1', titel: 'Momo', status: 'ungelesen' }]);
  });
});

describe('Migrationen Eintragungsdatum (REQ-041)', () => {
  it('IndexedDB v2 → v3: Bücher ohne Datum erhalten den Zeitpunkt der ersten Speicherung, datierte bleiben', async () => {
    const fabrik = new IDBFactory();
    const ms = Date.UTC(2026, 10, 1, 8, 0, 0);
    await new Promise<void>((resolve, reject) => {
      const req = fabrik.open('v2', 2);
      req.onupgradeneeded = () => {
        req.result.createObjectStore('bilder');
        req.result.createObjectStore('buecher', { keyPath: 'buch.id' });
      };
      req.onsuccess = () => {
        const tx = req.result.transaction('buecher', 'readwrite');
        tx.objectStore('buecher').put({ buch: { id: 'a', titel: 'Alt', status: 'ungelesen' }, nr: ms * 1000 + 3 });
        tx.objectStore('buecher').put({
          buch: { id: 'b', titel: 'Datiert', status: 'ungelesen', eingetragenAm: '2026-11-12T00:00:00.000Z' },
          nr: ms * 1000 + 4,
        });
        tx.oncomplete = () => {
          req.result.close();
          resolve();
        };
      };
      req.onerror = () => reject(req.error);
    });
    const repo = new IndexedDbBookRepository(fabrik, 'v2');
    expect((await repo.get('a'))?.eingetragenAm).toBe(new Date(ms).toISOString());
    expect((await repo.get('b'))?.eingetragenAm).toBe('2026-11-12T00:00:00.000Z');
  });

  it('SQLite v3 → v4: vorhandene Bücher bleiben lesbar (ohne Datum), neue speichern es', async () => {
    const { MIGRATIONEN } = await import('@/storage/sqlite/migrationen');
    const db = await nodeSqlite();
    await migrieren(db, MIGRATIONEN.filter((m) => m.version <= 3));
    await db.ausfuehren("INSERT INTO buch (id, titel, status, geaendert) VALUES ('x', 'Alt', 'ungelesen', '2026-01-01T00:00:00.000Z')");
    expect(await migrieren(db)).toBe(4);
    const repo = new SqliteBookRepository(db);
    expect(await repo.get('x')).toEqual({ id: 'x', titel: 'Alt', status: 'ungelesen' });
    await repo.save({ id: 'y', titel: 'Neu', status: 'ungelesen', eingetragenAm: '2026-11-12T10:00:00.000Z' });
    expect((await repo.get('y'))?.eingetragenAm).toBe('2026-11-12T10:00:00.000Z');
  });
});
