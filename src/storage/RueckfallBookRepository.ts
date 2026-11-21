import type { Buch } from '../domain/buch';
import type { BookRepository } from './BookRepository';
import { InMemoryBookRepository } from './InMemoryBookRepository';

/**
 * Wartet auf einen dauerhaften Buchspeicher. Lässt er sich nicht einrichten (z. B. IndexedDB im
 * Artefakt gesperrt, SQLite nicht verfügbar), arbeitet er im Arbeitsspeicher weiter, damit die App
 * ohne Fehlermeldung bedienbar bleibt (REQ-034, AK-7).
 */
export class RueckfallBookRepository implements BookRepository {
  private ziel: Promise<BookRepository>;

  constructor(einrichten: () => Promise<BookRepository>, beiFehler?: (fehler: unknown) => void) {
    this.ziel = (async () => {
      try {
        return await einrichten();
      } catch (fehler) {
        beiFehler?.(fehler);
        return new InMemoryBookRepository();
      }
    })();
  }

  async list(): Promise<Buch[]> {
    return (await this.ziel).list();
  }

  async get(id: string): Promise<Buch | undefined> {
    return (await this.ziel).get(id);
  }

  async save(buch: Buch): Promise<void> {
    return (await this.ziel).save(buch);
  }

  async remove(id: string): Promise<void> {
    return (await this.ziel).remove(id);
  }
}
