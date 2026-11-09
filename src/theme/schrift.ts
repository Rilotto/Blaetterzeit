// Zentrale Festlegung der App-Schrift (REQ-003).
// Dies ist die EINZIGE Stelle im Code, an der die App-Schrift gewählt wird.
// Aktuell: Systemschrift-Stack (Android -> Roboto), keine Schriftdatei.
// Die eigene Schrift des CEO ist noch nicht definiert und wird später hier eingetragen.

/** Name der CSS-Variable mit der App-Schrift. */
export const schriftVariable = '--bz-schrift';

/** App-Schrift mit generischer Ersatzschrift am Ende. */
export const appSchrift = "system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif";

/** CSS-Ausdruck, der die App-Schrift liefert. */
export const schrift = `var(${schriftVariable})`;

/** CSS-Variablen der Schrift für die App-Wurzel. */
export function schriftVariablen(): Record<string, string> {
  return { [schriftVariable]: appSchrift };
}
