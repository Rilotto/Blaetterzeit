import type { AnsichtRepository, Uebersichtsansicht } from './AnsichtRepository';

/** Ansichten im Arbeitsspeicher (Tests, Rückfall). */
export class InMemoryAnsichtRepository implements AnsichtRepository {
  private ansichten = new Map<string, Uebersichtsansicht>();

  async lesen(liste: string): Promise<Uebersichtsansicht | undefined> {
    return this.ansichten.get(liste);
  }

  async speichern(liste: string, ansicht: Uebersichtsansicht): Promise<void> {
    this.ansichten.set(liste, ansicht);
  }
}
