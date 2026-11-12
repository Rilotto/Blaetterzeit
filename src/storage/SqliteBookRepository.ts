import { buchAusDaten, type Buch } from '../domain/buch';
import type { BookRepository } from './BookRepository';
import type { SqlVerbindung, SqlWert } from './sqlite/SqlVerbindung';

const SPALTEN =
  'id, titel, status, autor, erscheinungsjahr, erscheinungsdatum, seitenanzahl, cover, aktuelle_seite, fortschritt_prozent, fortschrittsmodus, sitzungen';

/** Spaltenwerte eines Buches; fehlende optionale Angaben werden als NULL gespeichert. */
function werte(b: Buch): SqlWert[] {
  return [
    b.titel,
    b.status,
    b.autor ?? null,
    b.erscheinungsjahr ?? null,
    b.erscheinungsdatum ?? null,
    b.seitenanzahl ?? null,
    b.cover ?? null,
    b.aktuelleSeite ?? null,
    b.fortschrittProzent ?? null,
    b.fortschrittsmodus ?? null,
    b.sitzungen ? JSON.stringify(b.sitzungen) : null,
  ];
}

function sitzungenLesen(json: string): unknown {
  try {
    return JSON.parse(json);
  } catch {
    return undefined;
  }
}

/** Zeile → Buch; NULL-Spalten fehlen im Ergebnis (keine Ersatzwerte). */
function ausZeile(z: Record<string, unknown>): Buch {
  const zahl = (w: unknown) => (w === null || w === undefined ? undefined : Number(w));
  return buchAusDaten({
    id: z.id,
    titel: z.titel,
    status: z.status,
    autor: z.autor ?? undefined,
    erscheinungsjahr: zahl(z.erscheinungsjahr),
    erscheinungsdatum: z.erscheinungsdatum ?? undefined,
    seitenanzahl: zahl(z.seitenanzahl),
    cover: z.cover ?? undefined,
    aktuelleSeite: zahl(z.aktuelle_seite),
    fortschrittProzent: zahl(z.fortschritt_prozent),
    fortschrittsmodus: z.fortschrittsmodus ?? undefined,
    sitzungen: typeof z.sitzungen === 'string' ? sitzungenLesen(z.sitzungen) : undefined,
  });
}

/**
 * Bücher auf dem Gerät in der SQLite-Tabelle `buch` (Migrationen 2 und 3, REQ-034, REQ-024).
 * Reihenfolge = Reihenfolge des Anlegens (rowid bleibt beim Überschreiben erhalten).
 */
export class SqliteBookRepository implements BookRepository {
  private readonly db: SqlVerbindung;

  constructor(db: SqlVerbindung) {
    this.db = db;
  }

  async list(): Promise<Buch[]> {
    const zeilen = await this.db.abfragen<Record<string, unknown>>(`SELECT ${SPALTEN} FROM buch ORDER BY rowid`);
    return zeilen.map(ausZeile);
  }

  async get(id: string): Promise<Buch | undefined> {
    const zeilen = await this.db.abfragen<Record<string, unknown>>(`SELECT ${SPALTEN} FROM buch WHERE id = ?`, [id]);
    return zeilen[0] ? ausZeile(zeilen[0]) : undefined;
  }

  async save(buch: Buch): Promise<void> {
    const b = buchAusDaten(buch);
    const vorhanden = await this.db.abfragen<{ id: string }>('SELECT id FROM buch WHERE id = ?', [b.id]);
    if (vorhanden.length > 0) {
      await this.db.ausfuehren(
        `UPDATE buch SET titel = ?, status = ?, autor = ?, erscheinungsjahr = ?, erscheinungsdatum = ?,
         seitenanzahl = ?, cover = ?, aktuelle_seite = ?, fortschritt_prozent = ?, fortschrittsmodus = ?,
         sitzungen = ?, geaendert = ? WHERE id = ?`,
        [...werte(b), new Date().toISOString(), b.id],
      );
    } else {
      await this.db.ausfuehren(`INSERT INTO buch (${SPALTEN}, geaendert) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [
        b.id,
        ...werte(b),
        new Date().toISOString(),
      ]);
    }
  }

  async remove(id: string): Promise<void> {
    await this.db.ausfuehren('DELETE FROM buch WHERE id = ?', [id]);
  }
}
