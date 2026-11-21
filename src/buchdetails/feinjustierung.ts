// Lupe und Feinjustierung beim Ziehen eines Eckpunkts im Zuschnitt (REQ-070). Reine Logik ohne UI.

/**
 * Zentrale Standardwerte der Lupe (REQ-070, AK-8). Auf Zuruf des CEO änderbar, kein Akzeptanzkriterium.
 * - durchmesser: Durchmesser der runden Lupe in px
 * - zoom: Vergrößerungsfaktor des Bildausschnitts
 * - abstand: Abstand der Lupe vom oberen und seitlichen Rand der Zuschnittfläche in px
 */
export const LUPE = { durchmesser: 116, zoom: 3, abstand: 12 } as const;

/**
 * Zentrale Standardwerte der Feinjustierung, Variante b (REQ-070, AK-6 bis AK-8). Auf Zuruf des CEO änderbar.
 * - schwelle: Fingergeschwindigkeit in px je Millisekunde; darunter gilt die Bewegung als langsam
 * - faktor: Anteil der Fingerbewegung, um den sich der Eckpunkt bei langsamer Bewegung verschiebt (< 1)
 */
export const FEINJUSTIERUNG = { schwelle: 0.25, faktor: 0.35 } as const;

/**
 * Verschiebung des Eckpunkts aus der Fingerbewegung (dx, dy in px) seit dem letzten Ereignis und der dafür
 * benötigten Zeit (ms). Schnell (≥ Schwelle oder Zeit 0): 1:1; langsam: um den Faktor verkleinert.
 */
export function feinjustiert(
  dx: number,
  dy: number,
  ms: number,
  werte: { schwelle: number; faktor: number } = FEINJUSTIERUNG,
): { dx: number; dy: number; langsam: boolean } {
  const strecke = Math.hypot(dx, dy);
  const langsam = strecke > 0 && ms > 0 && strecke / ms < werte.schwelle;
  return langsam ? { dx: dx * werte.faktor, dy: dy * werte.faktor, langsam } : { dx, dy, langsam };
}

/** Seite der Lupe: gegenüber dem gezogenen Eckpunkt (x normiert 0…1 in der Zuschnittfläche), REQ-070 AK-2. */
export const lupenSeite = (xNormiert: number): 'links' | 'rechts' => (xNormiert < 0.5 ? 'rechts' : 'links');
