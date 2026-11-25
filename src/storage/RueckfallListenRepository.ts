import type { Liste, Zugehoerigkeit } from '../domain/listen';
import { InMemoryListenRepository } from './InMemoryListenRepository';
import type { ListenRepository } from './ListenRepository';

/** Wartet auf den dauerhaften Listenspeicher; lässt er sich nicht einrichten, im Arbeitsspeicher (wie REQ-034, AK-7). */
export class RueckfallListenRepository implements ListenRepository {
  private ziel: Promise<ListenRepository>;

  constructor(einrichten: () => Promise<ListenRepository>, beiFehler?: (fehler: unknown) => void) {
    this.ziel = (async () => {
      try {
        return await einrichten();
      } catch (fehler) {
        beiFehler?.(fehler);
        return new InMemoryListenRepository();
      }
    })();
  }

  async listen(): Promise<Liste[]> {
    return (await this.ziel).listen();
  }
  async listeSpeichern(liste: Liste): Promise<void> {
    return (await this.ziel).listeSpeichern(liste);
  }
  async listeEntfernen(listeId: string): Promise<void> {
    return (await this.ziel).listeEntfernen(listeId);
  }
  async zugehoerigkeiten(): Promise<Zugehoerigkeit[]> {
    return (await this.ziel).zugehoerigkeiten();
  }
  async zuordnen(z: Zugehoerigkeit): Promise<void> {
    return (await this.ziel).zuordnen(z);
  }
  async herausnehmen(listeId: string, buchId: string): Promise<void> {
    return (await this.ziel).herausnehmen(listeId, buchId);
  }
}
