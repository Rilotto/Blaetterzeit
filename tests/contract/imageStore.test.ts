import { IDBFactory } from 'fake-indexeddb';
import { GeraeteImageStore } from '@/storage/GeraeteImageStore';
import { InMemoryImageStore } from '@/storage/InMemoryImageStore';
import { IndexedDbImageStore } from '@/storage/IndexedDbImageStore';
import { RueckfallImageStore } from '@/storage/RueckfallImageStore';
import { migrieren } from '@/storage/sqlite/migrationen';
import type { SqlVerbindung } from '@/storage/sqlite/SqlVerbindung';
import { runImageStoreContract } from './imageStore.contract';
import { nodeSqlite } from './nodeSqlite';
import { speicherDateiablage } from './speicherDateiablage';

runImageStoreContract('InMemory', () => ({ store: new InMemoryImageStore() }));

runImageStoreContract('IndexedDB', () => {
  const fabrik = new IDBFactory();
  return { store: new IndexedDbImageStore(fabrik, 'test'), neustart: async () => new IndexedDbImageStore(fabrik, 'test') };
});

runImageStoreContract('Gerät (SQLite + Dateien)', async () => {
  const db: SqlVerbindung = await nodeSqlite();
  await migrieren(db);
  const ablage = speicherDateiablage();
  return {
    store: new GeraeteImageStore(db, ablage),
    neustart: async () => {
      await migrieren(db); // beim Neustart läuft die Migration erneut, ohne Daten zu verändern
      return new GeraeteImageStore(db, ablage);
    },
  };
});

runImageStoreContract('Rückfall (dauerhafter Speicher nicht verfügbar)', () => ({
  store: new RueckfallImageStore(async () => {
    throw new Error('nicht verfügbar');
  }),
}));
