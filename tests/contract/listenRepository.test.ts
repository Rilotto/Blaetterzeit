import { IDBFactory } from 'fake-indexeddb';
import { describe, expect, it } from 'vitest';
import { IndexedDbBookRepository } from '@/storage/IndexedDbBookRepository';
import { IndexedDbListenRepository } from '@/storage/IndexedDbListenRepository';
import { InMemoryListenRepository } from '@/storage/InMemoryListenRepository';
import { RueckfallListenRepository } from '@/storage/RueckfallListenRepository';
import { SqliteBookRepository } from '@/storage/SqliteBookRepository';
import { SqliteListenRepository } from '@/storage/SqliteListenRepository';
import { MIGRATIONEN, migrieren } from '@/storage/sqlite/migrationen';
import { runListenRepositoryContract } from './listenRepository.contract';
import { nodeSqlite } from './nodeSqlite';

runListenRepositoryContract('InMemory', () => ({ repo: new InMemoryListenRepository() }));

runListenRepositoryContract('IndexedDB', () => {
  const fabrik = new IDBFactory();
  return { repo: new IndexedDbListenRepository(fabrik, 't'), neustart: async () => new IndexedDbListenRepository(fabrik, 't') };
});

runListenRepositoryContract('Gerät (SQLite)', async () => {
  const db = await nodeSqlite();
  await migrieren(db);
  return {
    repo: new SqliteListenRepository(db),
    neustart: async () => {
      await migrieren(db);
      return new SqliteListenRepository(db);
    },
  };
});

runListenRepositoryContract('Rückfall', () => ({
  repo: new RueckfallListenRepository(async () => {
    throw new Error('nicht verfügbar');
  }),
}));

describe('Migrationen Listen und Bandnummer (REQ-095, REQ-099)', () => {
  it('SQLite v9 → v10: vorhandene Bücher bleiben lesbar, Bandnummer wird gespeichert', async () => {
    const db = await nodeSqlite();
    await migrieren(db, MIGRATIONEN.filter((m) => m.version <= 9));
    await db.ausfuehren("INSERT INTO buch (id, titel, status, geaendert) VALUES ('x', 'Alt', 'ungelesen', '2026-01-01T00:00:00.000Z')");
    expect(await migrieren(db)).toBe(10);
    const repo = new SqliteBookRepository(db);
    expect(await repo.get('x')).toEqual({ id: 'x', titel: 'Alt', status: 'ungelesen' });
    await repo.save({ id: 'x', titel: 'Alt', status: 'ungelesen', bandnummer: 2 });
    expect(await repo.get('x')).toEqual({ id: 'x', titel: 'Alt', status: 'ungelesen', bandnummer: 2 });
    expect(await new SqliteListenRepository(db).listen()).toEqual([]);
  });

  it('IndexedDB v7 → v8: Bücher bleiben, Listen-Stores sind nutzbar', async () => {
    const fabrik = new IDBFactory();
    await new Promise<void>((resolve, reject) => {
      const req = fabrik.open('v7', 7);
      req.onupgradeneeded = () => {
        req.result.createObjectStore('bilder');
        req.result.createObjectStore('buecher', { keyPath: 'buch.id' });
      };
      req.onsuccess = () => {
        const tx = req.result.transaction('buecher', 'readwrite');
        tx.objectStore('buecher').put({ buch: { id: 'a', titel: 'Alt', status: 'ungelesen', eingetragenAm: '2026-01-01T00:00:00.000Z' }, nr: 1 });
        tx.oncomplete = () => {
          req.result.close();
          resolve();
        };
      };
      req.onerror = () => reject(req.error);
    });
    const buecher = new IndexedDbBookRepository(fabrik, 'v7');
    expect((await buecher.get('a'))?.titel).toBe('Alt');
    const listen = new IndexedDbListenRepository(fabrik, 'v7');
    await listen.listeSpeichern({ id: 'l1', art: 'saga', name: 'S' });
    expect(await listen.listen()).toEqual([{ id: 'l1', art: 'saga', name: 'S' }]);
  });
});
