import { listeAusDaten, zugehoerigkeitAusDaten, type Liste, type Zugehoerigkeit } from '../domain/listen';
import type { ListenRepository } from './ListenRepository';
import { DB_NAME, STORE_LISTEN, STORE_LISTEN_BUECHER, abgeschlossen, anfrage, oeffnen } from './indexedDb';

/** Listen und Zugehörigkeiten dauerhaft im Browser (Web-Prototyp, REQ-095, Migration 8). */
export class IndexedDbListenRepository implements ListenRepository {
  private db: Promise<IDBDatabase>;

  constructor(fabrik: IDBFactory = indexedDB, name: string = DB_NAME) {
    this.db = oeffnen(fabrik, name);
  }

  bereit(): Promise<void> {
    return this.db.then(() => undefined);
  }

  async listen(): Promise<Liste[]> {
    const store = (await this.db).transaction(STORE_LISTEN, 'readonly').objectStore(STORE_LISTEN);
    const saetze = (await anfrage(store.getAll())) as unknown[];
    return saetze.map(listeAusDaten).filter((l): l is Liste => l !== undefined);
  }

  async listeSpeichern(liste: Liste): Promise<void> {
    const sauber = listeAusDaten(liste);
    if (!sauber) throw new Error('Keine gültige Liste');
    const tx = (await this.db).transaction(STORE_LISTEN, 'readwrite');
    const fertig = abgeschlossen(tx);
    tx.objectStore(STORE_LISTEN).put(sauber);
    await fertig;
  }

  async listeEntfernen(listeId: string): Promise<void> {
    const tx = (await this.db).transaction([STORE_LISTEN, STORE_LISTEN_BUECHER], 'readwrite');
    const fertig = abgeschlossen(tx);
    tx.objectStore(STORE_LISTEN).delete(listeId);
    const zug = tx.objectStore(STORE_LISTEN_BUECHER);
    const req = zug.openCursor();
    req.onsuccess = () => {
      const cursor = req.result;
      if (!cursor) return;
      if ((cursor.value as Zugehoerigkeit).listeId === listeId) cursor.delete();
      cursor.continue();
    };
    await fertig;
  }

  async zugehoerigkeiten(): Promise<Zugehoerigkeit[]> {
    const store = (await this.db).transaction(STORE_LISTEN_BUECHER, 'readonly').objectStore(STORE_LISTEN_BUECHER);
    const saetze = (await anfrage(store.getAll())) as unknown[];
    return saetze.map(zugehoerigkeitAusDaten).filter((z): z is Zugehoerigkeit => z !== undefined);
  }

  async zuordnen(z: Zugehoerigkeit): Promise<void> {
    const sauber = zugehoerigkeitAusDaten(z);
    if (!sauber) throw new Error('Keine gültige Zugehörigkeit');
    const tx = (await this.db).transaction(STORE_LISTEN_BUECHER, 'readwrite');
    const fertig = abgeschlossen(tx);
    tx.objectStore(STORE_LISTEN_BUECHER).put(sauber);
    await fertig;
  }

  async herausnehmen(listeId: string, buchId: string): Promise<void> {
    const tx = (await this.db).transaction(STORE_LISTEN_BUECHER, 'readwrite');
    const fertig = abgeschlossen(tx);
    tx.objectStore(STORE_LISTEN_BUECHER).delete([listeId, buchId]);
    await fertig;
  }
}
