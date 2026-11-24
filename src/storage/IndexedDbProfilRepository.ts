import { istJahresziel } from '../domain/startseite';
import type { ProfilRepository } from './ProfilRepository';
import { DB_NAME, STORE_JAHRESZIELE, STORE_PROFIL, abgeschlossen, anfrage, oeffnen } from './indexedDb';

const NAME = 'name';

/** Name (REQ-107) und Jahresziele (REQ-104) dauerhaft im Browser (Web-Prototyp, Migration 9). */
export class IndexedDbProfilRepository implements ProfilRepository {
  private db: Promise<IDBDatabase>;

  constructor(fabrik: IDBFactory = indexedDB, name: string = DB_NAME) {
    this.db = oeffnen(fabrik, name);
  }

  bereit(): Promise<void> {
    return this.db.then(() => undefined);
  }

  async nameLesen(): Promise<string | undefined> {
    const store = (await this.db).transaction(STORE_PROFIL, 'readonly').objectStore(STORE_PROFIL);
    const wert = (await anfrage(store.get(NAME))) as unknown;
    return typeof wert === 'string' && wert !== '' ? wert : undefined;
  }

  async nameSpeichern(name: string | undefined): Promise<void> {
    const tx = (await this.db).transaction(STORE_PROFIL, 'readwrite');
    const fertig = abgeschlossen(tx);
    if (name === undefined || name === '') tx.objectStore(STORE_PROFIL).delete(NAME);
    else tx.objectStore(STORE_PROFIL).put(name, NAME);
    await fertig;
  }

  async jahreszielLesen(jahr: number): Promise<number | undefined> {
    const store = (await this.db).transaction(STORE_JAHRESZIELE, 'readonly').objectStore(STORE_JAHRESZIELE);
    const satz = (await anfrage(store.get(jahr))) as { ziel?: unknown } | undefined;
    return istJahresziel(satz?.ziel) ? satz.ziel : undefined;
  }

  async jahreszielSpeichern(jahr: number, ziel: number | undefined): Promise<void> {
    if (ziel !== undefined && !istJahresziel(ziel)) throw new Error('Kein gültiges Jahresziel');
    const tx = (await this.db).transaction(STORE_JAHRESZIELE, 'readwrite');
    const fertig = abgeschlossen(tx);
    if (ziel === undefined) tx.objectStore(STORE_JAHRESZIELE).delete(jahr);
    else tx.objectStore(STORE_JAHRESZIELE).put({ jahr, ziel });
    await fertig;
  }
}
