import { Capacitor } from '@capacitor/core';
import type { BookRepository } from './BookRepository';
import { IndexedDbBookRepository } from './IndexedDbBookRepository';
import { InMemoryBookRepository } from './InMemoryBookRepository';
import type { ImageStore } from './ImageStore';
import { InMemoryImageStore } from './InMemoryImageStore';
import { IndexedDbImageStore } from './IndexedDbImageStore';
import { RueckfallBookRepository } from './RueckfallBookRepository';
import { RueckfallImageStore } from './RueckfallImageStore';

export type { BookRepository, ImageStore };
export type { Bildbereich } from './ImageStore';
export { BILDBEREICHE } from './ImageStore';

/**
 * Einzige Stelle, an der entschieden wird, welche Speicher-Implementierung läuft.
 * Bücher (REQ-034):
 *  - Android-APK: SQLite (Tabelle `buch`, Migrationen 2 und 3)
 *  - Web/Prototyp: IndexedDB
 *  - ohne IndexedDB (Testumgebung): Arbeitsspeicher
 * Lässt sich der dauerhafte Speicher nicht einrichten, wird im Arbeitsspeicher weitergearbeitet.
 */
export function createBookRepository(): BookRepository {
  const meldung = (fehler: unknown) => console.warn('Buchspeicher nicht dauerhaft verfügbar:', fehler);
  if (Capacitor.isNativePlatform()) {
    return new RueckfallBookRepository(async () => {
      const [{ sqliteOeffnen }, { SqliteBookRepository }] = await Promise.all([
        import('./sqlite/capacitorSqlite'),
        import('./SqliteBookRepository'),
      ]);
      return new SqliteBookRepository(await sqliteOeffnen());
    }, meldung);
  }
  if (typeof indexedDB === 'undefined') return new InMemoryBookRepository();
  return new RueckfallBookRepository(async () => {
    const repo = new IndexedDbBookRepository(indexedDB);
    await repo.bereit();
    return repo;
  }, meldung);
}

/**
 * Bilder (REQ-019):
 *  - Android-APK: Bilddateien (@capacitor/filesystem) + Zuordnung in SQLite (mit Migrationen)
 *  - Web/Prototyp: IndexedDB
 * Lässt sich der dauerhafte Speicher nicht einrichten, wird im Arbeitsspeicher weitergearbeitet.
 */
export function createImageStore(): ImageStore {
  const meldung = (fehler: unknown) => console.warn('Bildspeicher nicht dauerhaft verfügbar:', fehler);
  if (Capacitor.isNativePlatform()) {
    return new RueckfallImageStore(async () => {
      const [{ sqliteOeffnen }, { capacitorDateiablage }, { GeraeteImageStore }] = await Promise.all([
        import('./sqlite/capacitorSqlite'),
        import('./capacitorDateiablage'),
        import('./GeraeteImageStore'),
      ]);
      return new GeraeteImageStore(await sqliteOeffnen(), capacitorDateiablage);
    }, meldung);
  }
  // Ohne IndexedDB (z. B. Testumgebung): Arbeitsspeicher.
  if (typeof indexedDB === 'undefined') return new InMemoryImageStore();
  return new RueckfallImageStore(async () => {
    const store = new IndexedDbImageStore(indexedDB);
    await store.bereit();
    return store;
  }, meldung);
}
