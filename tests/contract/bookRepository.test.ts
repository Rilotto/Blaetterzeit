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
