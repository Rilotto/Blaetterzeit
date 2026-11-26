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
    expect(await migrieren(db)).toBe(Math.max(...MIGRATIONEN.map((m) => m.version)));
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

/**
 * REQ-112 AK-10: Übernahme der alten Bandnummer je Saga-Zugehörigkeit in die Bandnummer des Buches.
 * A ohne eigene Bandnummer in Saga mit Band 3 → 3; B mit eigener 2 (Scan) in Saga mit Band 5 → 2;
 * C in zwei Sagas mit 4 und 2 → 2; D nur in einer Sammlung mit Band 7 → keine; alle Zugehörigkeiten bleiben.
 */
describe('Migration Bandnummer je Buch (REQ-112, AK-10)', () => {
  it('SQLite v11 → v12', async () => {
    const db = await nodeSqlite();
    await migrieren(db, MIGRATIONEN.filter((m) => m.version <= 11));
    const t = '2026-01-01T00:00:00.000Z';
    for (const [id, band] of [['A', null], ['B', 2], ['C', null], ['D', null], ['E', null]] as const) {
      await db.ausfuehren('INSERT INTO buch (id, titel, status, geaendert, bandnummer) VALUES (?, ?, ?, ?, ?)', [id, `Buch ${id}`, 'ungelesen', t, band]);
    }
    for (const [id, art] of [['cc', 'saga'], ['s5', 'saga'], ['s4', 'saga'], ['s2', 'saga'], ['samm', 'sammlung']] as const) {
      await db.ausfuehren('INSERT INTO liste (id, art, name, geaendert) VALUES (?, ?, ?, ?)', [id, art, id, t]);
    }
    for (const [liste, buch, band] of [['cc', 'A', 3], ['s5', 'B', 5], ['s4', 'C', 4], ['s2', 'C', 2], ['samm', 'D', 7], ['cc', 'E', null]] as const) {
      await db.ausfuehren('INSERT INTO liste_buch (liste_id, buch_id, band, geaendert) VALUES (?, ?, ?, ?)', [liste, buch, band, t]);
    }
    expect(await migrieren(db)).toBe(12);
    const buecher = new SqliteBookRepository(db);
    expect((await buecher.get('A'))?.bandnummer).toBe(3);
    expect((await buecher.get('B'))?.bandnummer).toBe(2);
    expect((await buecher.get('C'))?.bandnummer).toBe(2);
    expect((await buecher.get('D'))?.bandnummer).toBeUndefined();
    expect((await buecher.get('E'))?.bandnummer).toBeUndefined();
    const zug = await new SqliteListenRepository(db).zugehoerigkeiten();
    expect(zug).toHaveLength(6);
    expect(zug).toContainEqual({ listeId: 's2', buchId: 'C' });
    // Erneuter Start: nichts ändert sich.
    expect(await migrieren(db)).toBe(12);
    expect((await buecher.get('C'))?.bandnummer).toBe(2);
  });

  it('IndexedDB v9 → v10', async () => {
    const fabrik = new IDBFactory();
    await new Promise<void>((resolve, reject) => {
      const req = fabrik.open('v9', 9);
      req.onupgradeneeded = () => {
        const db = req.result;
        db.createObjectStore('bilder');
        db.createObjectStore('buecher', { keyPath: 'buch.id' });
        db.createObjectStore('listen', { keyPath: 'id' });
        db.createObjectStore('listenBuecher', { keyPath: ['listeId', 'buchId'] });
        db.createObjectStore('zitate', { keyPath: 'id' });
        db.createObjectStore('profil');
        db.createObjectStore('jahresziele', { keyPath: 'jahr' });
      };
      req.onsuccess = () => {
        const tx = req.result.transaction(['buecher', 'listen', 'listenBuecher'], 'readwrite');
        const b = tx.objectStore('buecher');
        b.put({ buch: { id: 'A', titel: 'A', status: 'ungelesen' }, nr: 1 });
        b.put({ buch: { id: 'B', titel: 'B', status: 'ungelesen', bandnummer: 2 }, nr: 2 });
        b.put({ buch: { id: 'C', titel: 'C', status: 'ungelesen' }, nr: 3 });
        b.put({ buch: { id: 'D', titel: 'D', status: 'ungelesen' }, nr: 4 });
        const l = tx.objectStore('listen');
        for (const [id, art] of [['cc', 'saga'], ['s5', 'saga'], ['s4', 'saga'], ['s2', 'saga'], ['samm', 'sammlung']]) l.put({ id, art, name: id });
        const z = tx.objectStore('listenBuecher');
        for (const [listeId, buchId, band] of [['cc', 'A', 3], ['s5', 'B', 5], ['s4', 'C', 4], ['s2', 'C', 2], ['samm', 'D', 7]] as const) z.put({ listeId, buchId, band });
        tx.oncomplete = () => {
          req.result.close();
          resolve();
        };
      };
      req.onerror = () => reject(req.error);
    });
    const buecher = new IndexedDbBookRepository(fabrik, 'v9');
    expect((await buecher.get('A'))?.bandnummer).toBe(3);
    expect((await buecher.get('B'))?.bandnummer).toBe(2);
    expect((await buecher.get('C'))?.bandnummer).toBe(2);
    expect((await buecher.get('D'))?.bandnummer).toBeUndefined();
    const zug = await new IndexedDbListenRepository(fabrik, 'v9').zugehoerigkeiten();
    expect(zug).toHaveLength(5);
    expect(zug).toContainEqual({ listeId: 's4', buchId: 'C' });
  });
});
