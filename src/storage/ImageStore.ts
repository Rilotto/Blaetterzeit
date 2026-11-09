/**
 * Speicher-Schnittstelle für die Bilder eines Buches (ADR-0002, REQ-019).
 * UI und Fachlogik sprechen NUR mit dieser Schnittstelle.
 *
 * Implementierungen:
 *  - InMemoryImageStore    (Tests, Rückfall)
 *  - IndexedDbImageStore   (Web/Prototyp)
 *  - GeraeteImageStore     (Android-APK: Bilddateien + SQLite-Zuordnung)
 *
 * Jede Implementierung MUSS tests/contract/imageStore.contract.ts bestehen.
 */

/** Die drei Bereiche der Buchdarstellung (REQ-014). */
export const BILDBEREICHE = ['ruecken', 'cover', 'schnitt'] as const;
export type Bildbereich = (typeof BILDBEREICHE)[number];

export function istBildbereich(wert: unknown): wert is Bildbereich {
  return BILDBEREICHE.includes(wert as Bildbereich);
}

export interface ImageStore {
  /** Bild (Data-URL) des Bereichs, `undefined`, wenn keins hinterlegt ist. */
  get(buchId: string, bereich: Bildbereich): Promise<string | undefined>;
  /** Hinterlegt ein Bild; ein vorhandenes Bild des Bereichs wird ersetzt. */
  put(buchId: string, bereich: Bildbereich, dataUrl: string): Promise<void>;
  /** Entfernt das Bild des Bereichs (ohne Fehler, wenn keins hinterlegt ist). */
  remove(buchId: string, bereich: Bildbereich): Promise<void>;
}
