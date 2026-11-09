import type { Buch } from '../domain/buch';
import type { BookRepository } from './BookRepository';

export class InMemoryBookRepository implements BookRepository {
  private buecher = new Map<string, Buch>();

  async list(): Promise<Buch[]> {
    return [...this.buecher.values()].map((b) => ({ ...b }));
  }

  async get(id: string): Promise<Buch | undefined> {
    const b = this.buecher.get(id);
    return b ? { ...b } : undefined;
  }

  async save(buch: Buch): Promise<void> {
    this.buecher.set(buch.id, { ...buch });
  }

  async remove(id: string): Promise<void> {
    this.buecher.delete(id);
  }
}
