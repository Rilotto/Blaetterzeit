// Zentrale Festlegung der App-Schrift (REQ-003, REQ-065) und der wählbaren Schriften (REQ-069).
// Dies ist die EINZIGE Stelle im Code, an der Schriften festgelegt werden. Neue Schriften nur auf Zuruf des CEO.
//
// Fraunces wird lokal ausgeliefert (npm-Paket @fontsource-variable/fraunces, eingebunden in src/main.tsx,
// Lizenz SIL OFL 1.1 unter public/lizenzen/Fraunces-OFL.txt). Kein Laden aus dem Internet.

export type SchriftId = 'system' | 'fraunces';

export interface Schrift {
  /** Anzeigename in der Schriftliste. */
  name: string;
  /** Schriftfolge, endet mit einer generischen Ersatzschrift. */
  folge: string;
}

/** Wählbare Schriften (REQ-069). */
export const schriften: Record<SchriftId, Schrift> = {
  system: { name: 'Systemschrift', folge: "system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif" },
  fraunces: { name: 'Fraunces', folge: "'Fraunces Variable', Fraunces, Georgia, serif" },
};

/** Reihenfolge in der Schriftliste (REQ-069 AK-1). */
export const schriftReihenfolge: readonly SchriftId[] = ['system', 'fraunces'];

/** Schrift ohne Nutzerwahl (REQ-065 AK-1, REQ-069 AK-2). */
export const standardSchrift: SchriftId = 'fraunces';

export const istSchriftId = (wert: unknown): wert is SchriftId =>
  typeof wert === 'string' && (schriftReihenfolge as readonly string[]).includes(wert);

/** Beispielsatz der Schriftliste (REQ-069). */
export const schriftBeispiel = 'Deine Bücher warten auf dich …';

/** Name der CSS-Variable mit der App-Schrift. */
export const schriftVariable = '--bz-schrift';

/** App-Schrift ohne Nutzerwahl (Fraunces) mit generischer Ersatzschrift am Ende. */
export const appSchrift = schriften[standardSchrift].folge;

/** CSS-Ausdruck, der die App-Schrift liefert. */
export const schrift = `var(${schriftVariable})`;

/** CSS-Variablen der Schrift für die App-Wurzel. */
export function schriftVariablen(id: SchriftId = standardSchrift): Record<string, string> {
  return { [schriftVariable]: schriften[id].folge };
}
