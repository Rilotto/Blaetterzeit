import { istUebersichtsansicht, type AnsichtRepository, type Uebersichtsansicht } from './AnsichtRepository';

/** Benötigter Ausschnitt der Web-Storage-Schnittstelle (localStorage; in Tests ersetzbar). */
export type Schluesselspeicher = Pick<Storage, 'getItem' | 'setItem'>;

const PRAEFIX = 'blaetterzeit.ansicht.';

/**
 * Ansichten dauerhaft im Schlüssel-Wert-Speicher des Browsers bzw. der WebView (Web-Prototyp und APK, REQ-037).
 * Unbekannte oder beschädigte Werte gelten als „nicht gewählt“.
 */
export class WebAnsichtRepository implements AnsichtRepository {
  private readonly speicher: Schluesselspeicher;

  constructor(speicher: Schluesselspeicher) {
    this.speicher = speicher;
  }

  async lesen(liste: string): Promise<Uebersichtsansicht | undefined> {
    const wert = this.speicher.getItem(PRAEFIX + liste);
    return istUebersichtsansicht(wert) ? wert : undefined;
  }

  async speichern(liste: string, ansicht: Uebersichtsansicht): Promise<void> {
    this.speicher.setItem(PRAEFIX + liste, ansicht);
  }
}

/**
 * Nutzt den dauerhaften Speicher, fällt bei jedem Fehler (z. B. gesperrter Speicher im Artefakt)
 * auf den Arbeitsspeicher zurück, damit die App bedienbar bleibt.
 */
export class RueckfallAnsichtRepository implements AnsichtRepository {
  private readonly ziel: AnsichtRepository | undefined;
  private readonly rueckfall: AnsichtRepository;

  constructor(ziel: AnsichtRepository | undefined, rueckfall: AnsichtRepository) {
    this.ziel = ziel;
    this.rueckfall = rueckfall;
  }

  async lesen(liste: string): Promise<Uebersichtsansicht | undefined> {
    const fluechtig = await this.rueckfall.lesen(liste);
    if (fluechtig !== undefined || !this.ziel) return fluechtig;
    try {
      return await this.ziel.lesen(liste);
    } catch {
      return undefined;
    }
  }

  async speichern(liste: string, ansicht: Uebersichtsansicht): Promise<void> {
    await this.rueckfall.speichern(liste, ansicht);
    try {
      await this.ziel?.speichern(liste, ansicht);
    } catch (fehler) {
      console.warn('Ansicht nicht dauerhaft gespeichert:', fehler);
    }
  }
}
