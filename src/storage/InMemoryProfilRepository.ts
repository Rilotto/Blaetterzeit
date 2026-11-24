import { istJahresziel } from '../domain/startseite';
import type { ProfilRepository } from './ProfilRepository';

/** Name und Jahresziele im Arbeitsspeicher (Tests, Rückfall). */
export class InMemoryProfilRepository implements ProfilRepository {
  private name: string | undefined;
  private ziele = new Map<number, number>();

  async nameLesen(): Promise<string | undefined> {
    return this.name;
  }

  async nameSpeichern(name: string | undefined): Promise<void> {
    this.name = name === undefined || name === '' ? undefined : name;
  }

  async jahreszielLesen(jahr: number): Promise<number | undefined> {
    return this.ziele.get(jahr);
  }

  async jahreszielSpeichern(jahr: number, ziel: number | undefined): Promise<void> {
    if (ziel === undefined) {
      this.ziele.delete(jahr);
      return;
    }
    if (!istJahresziel(ziel)) throw new Error('Kein gültiges Jahresziel');
    this.ziele.set(jahr, ziel);
  }
}
