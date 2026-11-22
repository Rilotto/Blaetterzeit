/**
 * Schlüssel der App-Einstellungen (REQ-068: Farbdesign, REQ-069: Schrift, REQ-071: Stil,
 * REQ-079: gemerkte Zeitraum-Pille der Statistik).
 */
export type EinstellungSchluessel = 'farbdesign' | 'schrift' | 'stil' | 'statistikZeitraum';

/**
 * Speicher-Schnittstelle für App-Einstellungen (ADR-0002). Werte sind Zeichenketten (z. B. die ID des
 * gewählten Farbdesigns); ob ein Wert gültig ist, prüft der Aufrufer.
 * Komponenten sprechen nur mit dieser Schnittstelle, nie direkt mit localStorage o. Ä.
 *
 * Jede Implementierung MUSS tests/contract/einstellungRepository.contract.ts bestehen.
 */
export interface EinstellungRepository {
  /** Gespeicherter Wert; `undefined`, wenn noch nichts gewählt wurde. */
  lesen(schluessel: EinstellungSchluessel): Promise<string | undefined>;
  /** Speichert den Wert dauerhaft (überschreibt). */
  speichern(schluessel: EinstellungSchluessel, wert: string): Promise<void>;
}
