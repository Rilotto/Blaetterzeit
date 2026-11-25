import { istJahresziel } from '../domain/startseite';
import type { ProfilRepository } from './ProfilRepository';
import type { SqlVerbindung } from './sqlite/SqlVerbindung';

const NAME = 'name';

/** Name (REQ-107) und Jahresziele (REQ-104) auf dem Gerät (Tabellen `profil`, `jahresziel`, Migration 11). */
export class SqliteProfilRepository implements ProfilRepository {
  private readonly db: SqlVerbindung;

  constructor(db: SqlVerbindung) {
    this.db = db;
  }

  async nameLesen(): Promise<string | undefined> {
    const z = await this.db.abfragen<{ wert: unknown }>('SELECT wert FROM profil WHERE schluessel = ?', [NAME]);
    const wert = z[0]?.wert;
    return typeof wert === 'string' && wert !== '' ? wert : undefined;
  }

  async nameSpeichern(name: string | undefined): Promise<void> {
    await this.db.ausfuehren('DELETE FROM profil WHERE schluessel = ?', [NAME]);
    if (name !== undefined && name !== '') {
      await this.db.ausfuehren('INSERT INTO profil (schluessel, wert, geaendert) VALUES (?, ?, ?)', [NAME, name, new Date().toISOString()]);
    }
  }

  async jahreszielLesen(jahr: number): Promise<number | undefined> {
    const z = await this.db.abfragen<{ ziel: unknown }>('SELECT ziel FROM jahresziel WHERE jahr = ?', [jahr]);
    const ziel = Number(z[0]?.ziel);
    return istJahresziel(ziel) ? ziel : undefined;
  }

  async jahreszielSpeichern(jahr: number, ziel: number | undefined): Promise<void> {
    if (ziel !== undefined && !istJahresziel(ziel)) throw new Error('Kein gültiges Jahresziel');
    await this.db.ausfuehren('DELETE FROM jahresziel WHERE jahr = ?', [jahr]);
    if (ziel !== undefined) {
      await this.db.ausfuehren('INSERT INTO jahresziel (jahr, ziel, geaendert) VALUES (?, ?, ?)', [jahr, ziel, new Date().toISOString()]);
    }
  }
}
