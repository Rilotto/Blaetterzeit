// Mittiger Zuschnitt auf ein Seitenverhältnis (REQ-109), reine Funktionen ohne Canvas oder DOM.

/** Rechteck in Pixeln des Quellbildes. */
export interface Ausschnitt {
  x: number;
  y: number;
  breite: number;
  hoehe: number;
}

/** Gleiche Seitenverhältnisse (Breite/Höhe) bis auf Gleitkommareste. */
export function verhaeltnisGleich(a: number, b: number): boolean {
  return Math.abs(a - b) <= 1e-9 * Math.max(1, Math.abs(a), Math.abs(b));
}

/**
 * Größtmöglicher mittiger Ausschnitt eines Bildes von `breite` × `hoehe` Pixeln im Seitenverhältnis
 * `verhaeltnis` (Breite/Höhe, REQ-109 AK-1): Überstehendes wird auf beiden Seiten gleichmäßig entfernt,
 * nichts verzerrt, nichts hinzugefügt. Ganze Pixel; passt das Bild bereits, ist es der volle Rahmen (AK-2).
 */
export function mittigerAusschnitt(breite: number, hoehe: number, verhaeltnis: number): Ausschnitt {
  const voll: Ausschnitt = { x: 0, y: 0, breite, hoehe };
  if (!(breite > 0) || !(hoehe > 0) || !(verhaeltnis > 0) || !Number.isFinite(verhaeltnis)) return voll;
  if (breite / hoehe > verhaeltnis) {
    // Zu breit: volle Höhe, links und rechts gleich viel entfernen.
    const b = Math.min(breite, Math.max(1, Math.round(hoehe * verhaeltnis)));
    return { x: Math.floor((breite - b) / 2), y: 0, breite: b, hoehe };
  }
  // Zu hoch (oder passend): volle Breite, oben und unten gleich viel entfernen.
  const h = Math.min(hoehe, Math.max(1, Math.round(breite / verhaeltnis)));
  return { x: 0, y: Math.floor((hoehe - h) / 2), breite, hoehe: h };
}

/** Ändert der Ausschnitt das Bild? (false = Bild passt bereits, AK-2). */
export const ausschnittNoetig = (a: Ausschnitt, breite: number, hoehe: number): boolean =>
  a.breite !== breite || a.hoehe !== hoehe;
