import type { EinstellungRepository, EinstellungSchluessel } from './EinstellungRepository';

/** Einstellungen im Arbeitsspeicher (Tests, Rückfall). */
export class InMemoryEinstellungRepository implements EinstellungRepository {
  private werte = new Map<EinstellungSchluessel, string>();

  async lesen(schluessel: EinstellungSchluessel): Promise<string | undefined> {
    return this.werte.get(schluessel);
  }

  async speichern(schluessel: EinstellungSchluessel, wert: string): Promise<void> {
    this.werte.set(schluessel, wert);
  }
}
