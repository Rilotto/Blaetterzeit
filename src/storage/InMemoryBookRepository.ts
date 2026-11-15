import type { Buch } from '../domain/buch';
import type { BookRepository } from './BookRepository';

/** Kopie ohne geteilte Referenzen auf veränderliche Unterobjekte. */
const kopie = (b: Buch): Buch => (b.bewertungen ? { ...b, bewertungen: { ...b.bewertungen } } : { ...b });

export class InMemoryBookRepository implements BookRepository {
  private buecher = new Map<string, Buch>();

  async list(): Promise<Buch[]> {
    return [...this.buecher.values()].map(kopie);
  }

  async get(id: string): Promise<Buch | undefined> {
    const b = this.buecher.get(id);
    return b ? kopie(b) : undefined;
  }

  async save(buch: Buch): Promise<void> {
    this.buecher.set(buch.id, kopie(buch));
  }

  async remove(id: string): Promise<void> {
    this.buecher.delete(id);
  }
}
