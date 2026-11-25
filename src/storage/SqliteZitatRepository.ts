import { zitatAusDaten, type Zitat } from '../domain/zitat';
import type { ZitatRepository } from './ZitatRepository';
import type { SqlVerbindung } from './sqlite/SqlVerbindung';

const ausZeile = (z: Record<string, unknown>): Zitat | undefined =>
  zitatAusDaten({ id: z.id, buchId: z.buch_id, text: z.text, sprecher: z.sprecher ?? undefined, seite: z.seite ?? undefined, angelegtAm: z.angelegt_am });

/** Zitate auf dem Gerät (Tabelle `zitat`, Migration 11, REQ-105). */
export class SqliteZitatRepository implements ZitatRepository {
  private readonly db: SqlVerbindung;

  constructor(db: SqlVerbindung) {
    this.db = db;
  }

  async alle(): Promise<Zitat[]> {
    const zeilen = await this.db.abfragen<Record<string, unknown>>('SELECT id, buch_id, text, sprecher, seite, angelegt_am FROM zitat ORDER BY rowid');
    return zeilen.map(ausZeile).filter((z): z is Zitat => z !== undefined);
  }

  async vonBuch(buchId: string): Promise<Zitat[]> {
    const zeilen = await this.db.abfragen<Record<string, unknown>>(
      'SELECT id, buch_id, text, sprecher, seite, angelegt_am FROM zitat WHERE buch_id = ? ORDER BY rowid',
      [buchId],
    );
    return zeilen.map(ausZeile).filter((z): z is Zitat => z !== undefined);
  }

  async speichern(zitat: Zitat): Promise<void> {
    const z = zitatAusDaten(zitat);
    if (!z) throw new Error('Kein gültiges Zitat');
    const jetzt = new Date().toISOString();
    const vorhanden = await this.db.abfragen<{ id: string }>('SELECT id FROM zitat WHERE id = ?', [z.id]);
    if (vorhanden.length > 0) {
      await this.db.ausfuehren('UPDATE zitat SET buch_id = ?, text = ?, sprecher = ?, seite = ?, angelegt_am = ?, geaendert = ? WHERE id = ?', [
        z.buchId,
        z.text,
        z.sprecher ?? null,
        z.seite ?? null,
        z.angelegtAm,
        jetzt,
        z.id,
      ]);
    } else {
      await this.db.ausfuehren('INSERT INTO zitat (id, buch_id, text, sprecher, seite, angelegt_am, geaendert) VALUES (?, ?, ?, ?, ?, ?, ?)', [
        z.id,
        z.buchId,
        z.text,
        z.sprecher ?? null,
        z.seite ?? null,
        z.angelegtAm,
        jetzt,
      ]);
    }
  }

  async entfernen(id: string): Promise<void> {
    await this.db.ausfuehren('DELETE FROM zitat WHERE id = ?', [id]);
  }
}
