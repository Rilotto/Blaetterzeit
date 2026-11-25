import { listeAusDaten, zugehoerigkeitAusDaten, type Liste, type Zugehoerigkeit } from '../domain/listen';
import type { ListenRepository } from './ListenRepository';

const schluessel = (listeId: string, buchId: string) => `${listeId}|${buchId}`;

/** Listen im Arbeitsspeicher (Tests, Rückfall). */
export class InMemoryListenRepository implements ListenRepository {
  private alle = new Map<string, Liste>();
  private zug = new Map<string, Zugehoerigkeit>();

  async listen(): Promise<Liste[]> {
    return [...this.alle.values()].map((l) => ({ ...l }));
  }

  async listeSpeichern(liste: Liste): Promise<void> {
    const sauber = listeAusDaten(liste);
    if (!sauber) throw new Error('Keine gültige Liste');
    this.alle.set(sauber.id, sauber);
  }

  async listeEntfernen(listeId: string): Promise<void> {
    this.alle.delete(listeId);
    for (const [k, z] of this.zug) if (z.listeId === listeId) this.zug.delete(k);
  }

  async zugehoerigkeiten(): Promise<Zugehoerigkeit[]> {
    return [...this.zug.values()].map((z) => ({ ...z }));
  }

  async zuordnen(z: Zugehoerigkeit): Promise<void> {
    const sauber = zugehoerigkeitAusDaten(z);
    if (!sauber) throw new Error('Keine gültige Zugehörigkeit');
    this.zug.set(schluessel(sauber.listeId, sauber.buchId), sauber);
  }

  async herausnehmen(listeId: string, buchId: string): Promise<void> {
    this.zug.delete(schluessel(listeId, buchId));
  }
}
