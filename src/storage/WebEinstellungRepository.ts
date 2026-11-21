import type { EinstellungRepository, EinstellungSchluessel } from './EinstellungRepository';
import type { Schluesselspeicher } from './WebAnsichtRepository';

const PRAEFIX = 'blaetterzeit.einstellung.';

/**
 * Einstellungen dauerhaft im Schlüssel-Wert-Speicher des Browsers bzw. der WebView
 * (Web-Prototyp und APK, wie die gemerkte Ansicht in REQ-037).
 */
export class WebEinstellungRepository implements EinstellungRepository {
  private readonly speicher: Schluesselspeicher;

  constructor(speicher: Schluesselspeicher) {
    this.speicher = speicher;
  }

  async lesen(schluessel: EinstellungSchluessel): Promise<string | undefined> {
    return this.speicher.getItem(PRAEFIX + schluessel) ?? undefined;
  }

  async speichern(schluessel: EinstellungSchluessel, wert: string): Promise<void> {
    this.speicher.setItem(PRAEFIX + schluessel, wert);
  }
}

/**
 * Nutzt den dauerhaften Speicher und fällt bei jedem Fehler (z. B. gesperrter Speicher im Artefakt)
 * auf den Arbeitsspeicher zurück, damit die App bedienbar bleibt.
 */
export class RueckfallEinstellungRepository implements EinstellungRepository {
  private readonly ziel: EinstellungRepository | undefined;
  private readonly rueckfall: EinstellungRepository;

  constructor(ziel: EinstellungRepository | undefined, rueckfall: EinstellungRepository) {
    this.ziel = ziel;
    this.rueckfall = rueckfall;
  }

  async lesen(schluessel: EinstellungSchluessel): Promise<string | undefined> {
    const fluechtig = await this.rueckfall.lesen(schluessel);
    if (fluechtig !== undefined || !this.ziel) return fluechtig;
    try {
      return await this.ziel.lesen(schluessel);
    } catch {
      return undefined;
    }
  }

  async speichern(schluessel: EinstellungSchluessel, wert: string): Promise<void> {
    await this.rueckfall.speichern(schluessel, wert);
    try {
      await this.ziel?.speichern(schluessel, wert);
    } catch (fehler) {
      console.warn('Einstellung nicht dauerhaft gespeichert:', fehler);
    }
  }
}
