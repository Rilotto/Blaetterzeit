import { listeAusDaten, zugehoerigkeitAusDaten, type Liste, type Zugehoerigkeit } from '../domain/listen';
import type { ListenRepository } from './ListenRepository';
import type { SqlVerbindung } from './sqlite/SqlVerbindung';

/** Listen und Zugehörigkeiten auf dem Gerät (Tabellen `liste` und `liste_buch`, Migration 10, REQ-095). */
export class SqliteListenRepository implements ListenRepository {
  private readonly db: SqlVerbindung;

  constructor(db: SqlVerbindung) {
    this.db = db;
  }

  async listen(): Promise<Liste[]> {
    const zeilen = await this.db.abfragen<Record<string, unknown>>('SELECT id, art, name FROM liste ORDER BY rowid');
    return zeilen.map(listeAusDaten).filter((l): l is Liste => l !== undefined);
  }

  async listeSpeichern(liste: Liste): Promise<void> {
    const l = listeAusDaten(liste);
    if (!l) throw new Error('Keine gültige Liste');
    const jetzt = new Date().toISOString();
    const vorhanden = await this.db.abfragen<{ id: string }>('SELECT id FROM liste WHERE id = ?', [l.id]);
    if (vorhanden.length > 0) await this.db.ausfuehren('UPDATE liste SET art = ?, name = ?, geaendert = ? WHERE id = ?', [l.art, l.name, jetzt, l.id]);
    else await this.db.ausfuehren('INSERT INTO liste (id, art, name, geaendert) VALUES (?, ?, ?, ?)', [l.id, l.art, l.name, jetzt]);
  }

  async listeEntfernen(listeId: string): Promise<void> {
    await this.db.ausfuehren('DELETE FROM liste_buch WHERE liste_id = ?', [listeId]);
    await this.db.ausfuehren('DELETE FROM liste WHERE id = ?', [listeId]);
  }

  async zugehoerigkeiten(): Promise<Zugehoerigkeit[]> {
    const zeilen = await this.db.abfragen<Record<string, unknown>>('SELECT liste_id, buch_id, band FROM liste_buch ORDER BY rowid');
    return zeilen
      .map((z) => zugehoerigkeitAusDaten({ listeId: z.liste_id, buchId: z.buch_id, band: z.band }))
      .filter((z): z is Zugehoerigkeit => z !== undefined);
  }

  async zuordnen(z: Zugehoerigkeit): Promise<void> {
    const s = zugehoerigkeitAusDaten(z);
    if (!s) throw new Error('Keine gültige Zugehörigkeit');
    const jetzt = new Date().toISOString();
    const vorhanden = await this.db.abfragen('SELECT liste_id FROM liste_buch WHERE liste_id = ? AND buch_id = ?', [s.listeId, s.buchId]);
    if (vorhanden.length > 0) {
      await this.db.ausfuehren('UPDATE liste_buch SET band = ?, geaendert = ? WHERE liste_id = ? AND buch_id = ?', [s.band ?? null, jetzt, s.listeId, s.buchId]);
    } else {
      await this.db.ausfuehren('INSERT INTO liste_buch (liste_id, buch_id, band, geaendert) VALUES (?, ?, ?, ?)', [s.listeId, s.buchId, s.band ?? null, jetzt]);
    }
  }

  async herausnehmen(listeId: string, buchId: string): Promise<void> {
    await this.db.ausfuehren('DELETE FROM liste_buch WHERE liste_id = ? AND buch_id = ?', [listeId, buchId]);
  }
}
