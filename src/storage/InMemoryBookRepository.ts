import type { Buch } from '../domain/buch';
import type { BookRepository } from './BookRepository';

/** Kopie ohne geteilte Referenzen auf veränderliche Unterobjekte. */
const kopie = (b: Buch): Buch => {
  const k: Buch = { ...b };
  if (b.bewertungen) k.bewertungen = { ...b.bewertungen };
  if (b.sitzungen) k.sitzungen = b.sitzungen.map((s) => ({ ...s }));
  if (b.genres) k.genres = [...b.genres];
  if (b.tropes) k.tropes = [...b.tropes];
  if (b.inhaltswarnungen) k.inhaltswarnungen = [...b.inhaltswarnungen];
  return k;
};

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
