import { buchAusDaten, type Buch } from '../domain/buch';
import type { BookRepository } from './BookRepository';
import { DB_NAME, STORE_BUECHER, abgeschlossen, anfrage, oeffnen } from './indexedDb';

/** Datensatz in IndexedDB: das Buch und seine Reihenfolge (Zeitpunkt der ersten Speicherung). */
interface Datensatz {
  buch: Buch;
  nr: number;
}

let zaehler = 0;
/** Streng steigende Nummer, auch bei mehreren Speicherungen in derselben Millisekunde. */
const naechsteNr = (vorher: number) => Math.max(Date.now() * 1000 + (zaehler++ % 1000), vorher + 1);

/** Bücher dauerhaft im Browser (Web-Prototyp, REQ-034). Liefert sie in der Reihenfolge des Anlegens. */
export class IndexedDbBookRepository implements BookRepository {
  private db: Promise<IDBDatabase>;
  private letzteNr = 0;

  constructor(fabrik: IDBFactory = indexedDB, name: string = DB_NAME) {
    this.db = oeffnen(fabrik, name);
  }

  /** Erfüllt sich, sobald die Datenbank geöffnet ist; schlägt fehl, wenn IndexedDB nicht nutzbar ist. */
  bereit(): Promise<void> {
    return this.db.then(() => undefined);
  }

  async list(): Promise<Buch[]> {
    const store = (await this.db).transaction(STORE_BUECHER, 'readonly').objectStore(STORE_BUECHER);
    const saetze = (await anfrage(store.getAll())) as Datensatz[];
    return saetze.sort((a, b) => a.nr - b.nr).map((s) => buchAusDaten(s.buch));
  }

  async get(id: string): Promise<Buch | undefined> {
    const store = (await this.db).transaction(STORE_BUECHER, 'readonly').objectStore(STORE_BUECHER);
    const satz = (await anfrage(store.get(id))) as Datensatz | undefined;
    return satz ? buchAusDaten(satz.buch) : undefined;
  }

  async save(buch: Buch): Promise<void> {
    const sauber = buchAusDaten(buch);
    const tx = (await this.db).transaction(STORE_BUECHER, 'readwrite');
    const fertig = abgeschlossen(tx);
    const store = tx.objectStore(STORE_BUECHER);
    const alt = (await anfrage(store.get(sauber.id))) as Datensatz | undefined;
    const nr = alt?.nr ?? (this.letzteNr = naechsteNr(this.letzteNr));
    store.put({ buch: sauber, nr } satisfies Datensatz);
    await fertig;
  }

  async remove(id: string): Promise<void> {
    const tx = (await this.db).transaction(STORE_BUECHER, 'readwrite');
    const fertig = abgeschlossen(tx);
    tx.objectStore(STORE_BUECHER).delete(id);
    await fertig;
  }
}
