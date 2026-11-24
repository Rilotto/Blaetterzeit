import { zitatAusDaten, type Zitat } from '../domain/zitat';
import type { ZitatRepository } from './ZitatRepository';

/** Zitate im Arbeitsspeicher (Tests, Rückfall). */
export class InMemoryZitatRepository implements ZitatRepository {
  private zitate = new Map<string, Zitat>();

  async alle(): Promise<Zitat[]> {
    return [...this.zitate.values()].map((z) => ({ ...z }));
  }

  async vonBuch(buchId: string): Promise<Zitat[]> {
    return (await this.alle()).filter((z) => z.buchId === buchId);
  }

  async speichern(zitat: Zitat): Promise<void> {
    const sauber = zitatAusDaten(zitat);
    if (!sauber) throw new Error('Kein gültiges Zitat');
    this.zitate.set(sauber.id, sauber);
  }

  async entfernen(id: string): Promise<void> {
    this.zitate.delete(id);
  }
}
