/**
 * Schlüssel der App-Einstellungen (REQ-068: Farbdesign, REQ-069: Schrift, REQ-071: Stil,
 * REQ-079: gemerkte Zeitraum-Pille der Statistik, REQ-106: gemerkte Wahl des Zitats des Tages als JSON,
 * REQ-114: in „Für dich“ ausgeblendete Abschnitte der Seite „Bücher“ als JSON-Liste der Abschnitts-IDs,
 * REQ-119: Sprachauswahl der Online-Suchen als JSON-Liste der Sprachcodes, z. B. ["ger","eng"]).
 */
export type EinstellungSchluessel =
  | 'farbdesign'
  | 'schrift'
  | 'stil'
  | 'statistikZeitraum'
  | 'zitatDesTages'
  | 'fuerDichAusgeblendet'
  | 'onlineSucheSprachen';

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
