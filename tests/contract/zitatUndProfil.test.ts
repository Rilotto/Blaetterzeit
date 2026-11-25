import { IDBFactory } from 'fake-indexeddb';
import { describe, expect, it } from 'vitest';
import { IndexedDbBookRepository } from '@/storage/IndexedDbBookRepository';
import { IndexedDbListenRepository } from '@/storage/IndexedDbListenRepository';
import { IndexedDbProfilRepository } from '@/storage/IndexedDbProfilRepository';
import { IndexedDbZitatRepository } from '@/storage/IndexedDbZitatRepository';
import { InMemoryProfilRepository } from '@/storage/InMemoryProfilRepository';
import { InMemoryZitatRepository } from '@/storage/InMemoryZitatRepository';
import { RueckfallProfilRepository } from '@/storage/RueckfallProfilRepository';
import { RueckfallZitatRepository } from '@/storage/RueckfallZitatRepository';
import { SqliteBookRepository } from '@/storage/SqliteBookRepository';
import { SqliteListenRepository } from '@/storage/SqliteListenRepository';
import { SqliteProfilRepository } from '@/storage/SqliteProfilRepository';
import { SqliteZitatRepository } from '@/storage/SqliteZitatRepository';
import { MIGRATIONEN, migrieren } from '@/storage/sqlite/migrationen';
import { nodeSqlite } from './nodeSqlite';
import { runProfilRepositoryContract } from './profilRepository.contract';
import { runZitatRepositoryContract } from './zitatRepository.contract';

runZitatRepositoryContract('InMemory', () => ({ repo: new InMemoryZitatRepository() }));
runZitatRepositoryContract('IndexedDB', () => {
  const fabrik = new IDBFactory();
  return { repo: new IndexedDbZitatRepository(fabrik, 't'), neustart: async () => new IndexedDbZitatRepository(fabrik, 't') };
});
runZitatRepositoryContract('Gerät (SQLite)', async () => {
  const db = await nodeSqlite();
  await migrieren(db);
  return { repo: new SqliteZitatRepository(db), neustart: async () => (await migrieren(db), new SqliteZitatRepository(db)) };
});
runZitatRepositoryContract('Rückfall', () => ({
  repo: new RueckfallZitatRepository(async () => {
    throw new Error('nicht verfügbar');
  }),
}));

runProfilRepositoryContract('InMemory', () => ({ repo: new InMemoryProfilRepository() }));
runProfilRepositoryContract('IndexedDB', () => {
  const fabrik = new IDBFactory();
  return { repo: new IndexedDbProfilRepository(fabrik, 't'), neustart: async () => new IndexedDbProfilRepository(fabrik, 't') };
});
runProfilRepositoryContract('Gerät (SQLite)', async () => {
  const db = await nodeSqlite();
  await migrieren(db);
  return { repo: new SqliteProfilRepository(db), neustart: async () => (await migrieren(db), new SqliteProfilRepository(db)) };
});
runProfilRepositoryContract('Rückfall', () => ({
  repo: new RueckfallProfilRepository(async () => {
    throw new Error('nicht verfügbar');
  }),
}));

describe('Migrationen Zitate, Name, Jahresziel (REQ-104, REQ-105, REQ-107)', () => {
  it('SQLite v10 → v11: Bücher und Listen bleiben, neue Tabellen sind nutzbar', async () => {
    const db = await nodeSqlite();
    await migrieren(db, MIGRATIONEN.filter((m) => m.version <= 10));
    await db.ausfuehren("INSERT INTO buch (id, titel, status, geaendert) VALUES ('x', 'Alt', 'ungelesen', '2026-01-01T00:00:00.000Z')");
    await db.ausfuehren("INSERT INTO liste (id, art, name, geaendert) VALUES ('l', 'saga', 'S', '2026-01-01T00:00:00.000Z')");
    expect(await migrieren(db)).toBe(11);
    expect(await new SqliteBookRepository(db).get('x')).toEqual({ id: 'x', titel: 'Alt', status: 'ungelesen' });
    expect(await new SqliteListenRepository(db).listen()).toEqual([{ id: 'l', art: 'saga', name: 'S' }]);
    await new SqliteZitatRepository(db).speichern({ id: 'z', buchId: 'x', text: 'T', angelegtAm: '2026-01-01T00:00:00.000Z' });
    expect(await new SqliteZitatRepository(db).vonBuch('x')).toHaveLength(1);
    await new SqliteProfilRepository(db).jahreszielSpeichern(2026, 5);
    expect(await new SqliteProfilRepository(db).jahreszielLesen(2026)).toBe(5);
  });

  it('IndexedDB v8 → v9: Bücher und Listen bleiben, neue Stores sind nutzbar', async () => {
    const fabrik = new IDBFactory();
    await new Promise<void>((resolve, reject) => {
      const req = fabrik.open('v8', 8);
      req.onupgradeneeded = () => {
        req.result.createObjectStore('bilder');
        req.result.createObjectStore('buecher', { keyPath: 'buch.id' });
        req.result.createObjectStore('listen', { keyPath: 'id' });
        req.result.createObjectStore('listenBuecher', { keyPath: ['listeId', 'buchId'] });
      };
      req.onsuccess = () => {
        const tx = req.result.transaction(['buecher', 'listen'], 'readwrite');
        tx.objectStore('buecher').put({ buch: { id: 'a', titel: 'Alt', status: 'ungelesen' }, nr: 1 });
        tx.objectStore('listen').put({ id: 'l1', art: 'saga', name: 'S' });
        tx.oncomplete = () => {
          req.result.close();
          resolve();
        };
      };
      req.onerror = () => reject(req.error);
    });
    const zitate = new IndexedDbZitatRepository(fabrik, 'v8');
    await zitate.speichern({ id: 'z', buchId: 'a', text: 'T', angelegtAm: '2026-01-01T00:00:00.000Z' });
    expect(await zitate.alle()).toHaveLength(1);
    const profil = new IndexedDbProfilRepository(fabrik, 'v8');
    await profil.nameSpeichern('Christine');
    expect(await profil.nameLesen()).toBe('Christine');
    expect((await new IndexedDbBookRepository(fabrik, 'v8').get('a'))?.titel).toBe('Alt');
    expect(await new IndexedDbListenRepository(fabrik, 'v8').listen()).toEqual([{ id: 'l1', art: 'saga', name: 'S' }]);
  });
});
