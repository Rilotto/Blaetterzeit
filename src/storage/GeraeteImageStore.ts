import type { Bildbereich, ImageStore } from './ImageStore';
import type { SqlVerbindung } from './sqlite/SqlVerbindung';

/** Ablage der Bilddateien (auf dem Gerät: @capacitor/filesystem, Verzeichnis „Data“). */
export interface Dateiablage {
  schreiben(pfad: string, daten: string, base64: boolean): Promise<void>;
  lesen(pfad: string, base64: boolean): Promise<string>;
  loeschen(pfad: string): Promise<void>;
}

interface Zeile extends Record<string, unknown> {
  datei: string;
  kopf: string;
  base64: number;
}

const ORDNER = 'bilder';

/** Zerlegt eine Data-URL in Kopf („data:image/jpeg;base64“) und Nutzdaten. */
export function dataUrlZerlegen(dataUrl: string): { kopf: string; daten: string; base64: boolean } {
  const komma = dataUrl.indexOf(',');
  if (!dataUrl.startsWith('data:') || komma < 0) throw new Error('Keine gültige Data-URL');
  const kopf = dataUrl.slice(0, komma);
  return { kopf, daten: dataUrl.slice(komma + 1), base64: /;base64$/i.test(kopf) };
}

function endung(kopf: string): string {
  const m = /^data:image\/([a-z0-9+.-]+)/i.exec(kopf);
  const typ = m?.[1]?.toLowerCase();
  if (typ === 'jpeg' || typ === 'jpg') return 'jpg';
  if (typ === 'png' || typ === 'webp' || typ === 'gif') return typ;
  return 'bin';
}

/**
 * Bilder auf dem Gerät (REQ-019): jedes Bild als eigene Datei, die Zuordnung
 * Buch + Bereich → Datei in der SQLite-Tabelle `buch_bild` (Migration 1).
 * Dateinamen sind UUIDs, damit ein Ersetzen nie eine noch gelesene Datei überschreibt.
 */
export class GeraeteImageStore implements ImageStore {
  private readonly db: SqlVerbindung;
  private readonly dateien: Dateiablage;

  constructor(db: SqlVerbindung, dateien: Dateiablage) {
    this.db = db;
    this.dateien = dateien;
  }

  private async zeile(buchId: string, bereich: Bildbereich): Promise<Zeile | undefined> {
    const z = await this.db.abfragen<Zeile>(
      'SELECT datei, kopf, base64 FROM buch_bild WHERE buch_id = ? AND bereich = ?',
      [buchId, bereich],
    );
    return z[0];
  }

  async get(buchId: string, bereich: Bildbereich): Promise<string | undefined> {
    const z = await this.zeile(buchId, bereich);
    if (!z) return undefined;
    try {
      return `${z.kopf},${await this.dateien.lesen(z.datei, Number(z.base64) === 1)}`;
    } catch {
      // Datei fehlt (z. B. extern gelöscht): Bereich gilt als ohne Bild.
      return undefined;
    }
  }

  async put(buchId: string, bereich: Bildbereich, dataUrl: string): Promise<void> {
    const { kopf, daten, base64 } = dataUrlZerlegen(dataUrl);
    const alt = await this.zeile(buchId, bereich);
    const datei = `${ORDNER}/${crypto.randomUUID()}.${endung(kopf)}`;
    await this.dateien.schreiben(datei, daten, base64);
    await this.db.ausfuehren(
      'INSERT OR REPLACE INTO buch_bild (buch_id, bereich, datei, kopf, base64, geaendert) VALUES (?, ?, ?, ?, ?, ?)',
      [buchId, bereich, datei, kopf, base64 ? 1 : 0, new Date().toISOString()],
    );
    if (alt) await this.dateien.loeschen(alt.datei).catch(() => undefined);
  }

  async remove(buchId: string, bereich: Bildbereich): Promise<void> {
    const alt = await this.zeile(buchId, bereich);
    if (!alt) return;
    await this.db.ausfuehren('DELETE FROM buch_bild WHERE buch_id = ? AND bereich = ?', [buchId, bereich]);
    await this.dateien.loeschen(alt.datei).catch(() => undefined);
  }
}
