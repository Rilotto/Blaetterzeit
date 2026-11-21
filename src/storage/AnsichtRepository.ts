/** Darstellung einer Übersicht (REQ-037): Rasteransicht oder Listenansicht. */
export type Uebersichtsansicht = 'raster' | 'liste';

export const istUebersichtsansicht = (wert: unknown): wert is Uebersichtsansicht => wert === 'raster' || wert === 'liste';

/**
 * Speicher-Schnittstelle für die zuletzt gewählte Ansicht je Liste (REQ-037, ADR-0002).
 * Schlüssel ist die ID der Liste (= ID des Filters, z. B. „alle“, „noch_zu_lesen“).
 * Komponenten sprechen nur mit dieser Schnittstelle, nie direkt mit localStorage o. Ä.
 *
 * Jede Implementierung MUSS tests/contract/ansichtRepository.contract.ts bestehen.
 */
export interface AnsichtRepository {
  /** Gemerkte Ansicht der Liste; `undefined`, wenn noch keine gewählt wurde. */
  lesen(liste: string): Promise<Uebersichtsansicht | undefined>;
  /** Merkt die Ansicht der Liste dauerhaft (überschreibt). */
  speichern(liste: string, ansicht: Uebersichtsansicht): Promise<void>;
}
