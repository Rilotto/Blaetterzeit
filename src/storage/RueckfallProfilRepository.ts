import { InMemoryProfilRepository } from './InMemoryProfilRepository';
import type { ProfilRepository } from './ProfilRepository';

/** Wartet auf den dauerhaften Profilspeicher; lässt er sich nicht einrichten, im Arbeitsspeicher (wie REQ-034, AK-7). */
export class RueckfallProfilRepository implements ProfilRepository {
  private ziel: Promise<ProfilRepository>;

  constructor(einrichten: () => Promise<ProfilRepository>, beiFehler?: (fehler: unknown) => void) {
    this.ziel = (async () => {
      try {
        return await einrichten();
      } catch (fehler) {
        beiFehler?.(fehler);
        return new InMemoryProfilRepository();
      }
    })();
  }

  async nameLesen(): Promise<string | undefined> {
    return (await this.ziel).nameLesen();
  }
  async nameSpeichern(name: string | undefined): Promise<void> {
    return (await this.ziel).nameSpeichern(name);
  }
  async jahreszielLesen(jahr: number): Promise<number | undefined> {
    return (await this.ziel).jahreszielLesen(jahr);
  }
  async jahreszielSpeichern(jahr: number, ziel: number | undefined): Promise<void> {
    return (await this.ziel).jahreszielSpeichern(jahr, ziel);
  }
}
