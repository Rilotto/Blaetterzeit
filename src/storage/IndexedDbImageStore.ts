import type { Bildbereich, ImageStore } from './ImageStore';

const DB_NAME = 'blaetterzeit';
/** Versionierte Schemaänderungen der IndexedDB (Index = Zielversion - 1). */
const MIGRATIONEN: ((db: IDBDatabase) => void)[] = [
  // Version 1: Bilder je Buch und Bereich.
  (db) => {
    db.createObjectStore('bilder');
  },
];
const STORE = 'bilder';

const schluessel = (buchId: string, bereich: Bildbereich) => `${buchId}|${bereich}`;

function anfrage<T>(req: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error ?? new Error('IndexedDB-Fehler'));
  });
}

function oeffnen(fabrik: IDBFactory, name: string): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = fabrik.open(name, MIGRATIONEN.length);
    req.onupgradeneeded = (e) => {
      for (let v = e.oldVersion; v < MIGRATIONEN.length; v++) MIGRATIONEN[v](req.result);
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error ?? new Error('IndexedDB lässt sich nicht öffnen'));
    req.onblocked = () => reject(new Error('IndexedDB ist blockiert'));
  });
}

/** Bilder dauerhaft im Browser (Web-Prototyp). */
export class IndexedDbImageStore implements ImageStore {
  private db: Promise<IDBDatabase>;

  constructor(fabrik: IDBFactory = indexedDB, name: string = DB_NAME) {
    this.db = oeffnen(fabrik, name);
  }

  /** Erfüllt sich, sobald die Datenbank geöffnet ist; schlägt fehl, wenn IndexedDB nicht nutzbar ist. */
  bereit(): Promise<void> {
    return this.db.then(() => undefined);
  }

  private async speicher(modus: IDBTransactionMode): Promise<IDBObjectStore> {
    return (await this.db).transaction(STORE, modus).objectStore(STORE);
  }

  async get(buchId: string, bereich: Bildbereich): Promise<string | undefined> {
    const wert = await anfrage((await this.speicher('readonly')).get(schluessel(buchId, bereich)));
    return typeof wert === 'string' ? wert : undefined;
  }

  async put(buchId: string, bereich: Bildbereich, dataUrl: string): Promise<void> {
    await anfrage((await this.speicher('readwrite')).put(dataUrl, schluessel(buchId, bereich)));
  }

  async remove(buchId: string, bereich: Bildbereich): Promise<void> {
    await anfrage((await this.speicher('readwrite')).delete(schluessel(buchId, bereich)));
  }
}
