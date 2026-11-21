import type { Bildbereich, ImageStore } from './ImageStore';
import { DB_NAME, STORE_BILDER, anfrage, oeffnen } from './indexedDb';

const STORE = STORE_BILDER;

const schluessel = (buchId: string, bereich: Bildbereich) => `${buchId}|${bereich}`;

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
