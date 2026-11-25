import { zitatAusDaten, type Zitat } from '../domain/zitat';
import type { ZitatRepository } from './ZitatRepository';
import { DB_NAME, STORE_ZITATE, abgeschlossen, anfrage, oeffnen } from './indexedDb';

/** Zitate dauerhaft im Browser (Web-Prototyp, REQ-105, Migration 9). */
export class IndexedDbZitatRepository implements ZitatRepository {
  private db: Promise<IDBDatabase>;

  constructor(fabrik: IDBFactory = indexedDB, name: string = DB_NAME) {
    this.db = oeffnen(fabrik, name);
  }

  bereit(): Promise<void> {
    return this.db.then(() => undefined);
  }

  async alle(): Promise<Zitat[]> {
    const store = (await this.db).transaction(STORE_ZITATE, 'readonly').objectStore(STORE_ZITATE);
    const saetze = (await anfrage(store.getAll())) as unknown[];
    return saetze.map(zitatAusDaten).filter((z): z is Zitat => z !== undefined);
  }

  async vonBuch(buchId: string): Promise<Zitat[]> {
    return (await this.alle()).filter((z) => z.buchId === buchId);
  }

  async speichern(zitat: Zitat): Promise<void> {
    const sauber = zitatAusDaten(zitat);
    if (!sauber) throw new Error('Kein gültiges Zitat');
    const tx = (await this.db).transaction(STORE_ZITATE, 'readwrite');
    const fertig = abgeschlossen(tx);
    tx.objectStore(STORE_ZITATE).put(sauber);
    await fertig;
  }

  async entfernen(id: string): Promise<void> {
    const tx = (await this.db).transaction(STORE_ZITATE, 'readwrite');
    const fertig = abgeschlossen(tx);
    tx.objectStore(STORE_ZITATE).delete(id);
    await fertig;
  }
}
