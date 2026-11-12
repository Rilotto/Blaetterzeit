/**
 * Gemeinsame IndexedDB des Web-Prototyps (ADR-0002). Bilder (REQ-019) und Bücher (REQ-034)
 * liegen in derselben Datenbank; Schemaänderungen nur als versionierte Migration.
 * Regeln: Einträge werden nur angehängt, nie geändert oder entfernt.
 */
export const DB_NAME = 'blaetterzeit';
export const STORE_BILDER = 'bilder';
export const STORE_BUECHER = 'buecher';

/** Versionierte Schemaänderungen (Index = Zielversion - 1). */
const MIGRATIONEN: ((db: IDBDatabase, tx: IDBTransaction) => void)[] = [
  // Version 1: Bilder je Buch und Bereich (REQ-019).
  (db) => {
    db.createObjectStore(STORE_BILDER);
  },
  // Version 2: Bücher mit allen Angaben, Schlüssel = Buch-ID (REQ-034).
  (db) => {
    db.createObjectStore(STORE_BUECHER, { keyPath: 'buch.id' });
  },
  // Version 3: Eintragungsdatum (REQ-041). Vorhandene Bücher ohne Datum erhalten den Zeitpunkt ihrer
  // ersten Speicherung (Feld `nr` = Millisekunden * 1000 + Zähler); Bücher mit Datum bleiben unverändert.
  (_db, tx) => {
    const req = tx.objectStore(STORE_BUECHER).openCursor();
    req.onsuccess = () => {
      const cursor = req.result;
      if (!cursor) return;
      const satz = cursor.value as { buch: Record<string, unknown>; nr?: unknown };
      if (satz.buch.eingetragenAm === undefined && typeof satz.nr === 'number') {
        const ms = Math.floor(satz.nr / 1000);
        if (Number.isFinite(ms) && ms > 0) cursor.update({ ...satz, buch: { ...satz.buch, eingetragenAm: new Date(ms).toISOString() } });
      }
      cursor.continue();
    };
  },
];

export const SCHEMA_VERSION = MIGRATIONEN.length;

export function anfrage<T>(req: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error ?? new Error('IndexedDB-Fehler'));
  });
}

/** Wartet, bis eine Schreib-Transaktion vollständig abgeschlossen ist. */
export function abgeschlossen(tx: IDBTransaction): Promise<void> {
  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error ?? new Error('IndexedDB-Fehler'));
    tx.onabort = () => reject(tx.error ?? new Error('IndexedDB-Transaktion abgebrochen'));
  });
}

/** Öffnet die Datenbank und bringt sie per Migration auf den aktuellen Stand. */
export function oeffnen(fabrik: IDBFactory, name: string = DB_NAME): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = fabrik.open(name, SCHEMA_VERSION);
    req.onupgradeneeded = (e) => {
      const tx = req.transaction!;
      for (let v = e.oldVersion; v < MIGRATIONEN.length; v++) MIGRATIONEN[v](req.result, tx);
    };
    req.onsuccess = () => {
      const db = req.result;
      // Will eine neuere Version (z. B. anderer Tab) migrieren, gibt diese Verbindung den Weg frei.
      db.onversionchange = () => db.close();
      resolve(db);
    };
    req.onerror = () => reject(req.error ?? new Error('IndexedDB lässt sich nicht öffnen'));
    req.onblocked = () => reject(new Error('IndexedDB ist blockiert'));
  });
}
