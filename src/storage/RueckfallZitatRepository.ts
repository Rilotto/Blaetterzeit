import type { Zitat } from '../domain/zitat';
import { InMemoryZitatRepository } from './InMemoryZitatRepository';
import type { ZitatRepository } from './ZitatRepository';

/** Wartet auf den dauerhaften Zitatspeicher; lässt er sich nicht einrichten, im Arbeitsspeicher (wie REQ-034, AK-7). */
export class RueckfallZitatRepository implements ZitatRepository {
  private ziel: Promise<ZitatRepository>;

  constructor(einrichten: () => Promise<ZitatRepository>, beiFehler?: (fehler: unknown) => void) {
    this.ziel = (async () => {
      try {
        return await einrichten();
      } catch (fehler) {
        beiFehler?.(fehler);
        return new InMemoryZitatRepository();
      }
    })();
  }

  async alle(): Promise<Zitat[]> {
    return (await this.ziel).alle();
  }
  async vonBuch(buchId: string): Promise<Zitat[]> {
    return (await this.ziel).vonBuch(buchId);
  }
  async speichern(zitat: Zitat): Promise<void> {
    return (await this.ziel).speichern(zitat);
  }
  async entfernen(id: string): Promise<void> {
    return (await this.ziel).entfernen(id);
  }
}
