// Zentrale Farbdefinition der App (Design-Tokens), siehe REQ-002 "Farben"
// und CLAUDE.md "Farben auf Zuruf".
//
// Dies ist die EINZIGE Stelle im Code, an der Farbwerte stehen.
// Farbänderungen des CEO ("Primärfarbe auf #… ändern") werden nur hier
// in `farbrubriken` eingetragen. Rubriknamen sind hier ebenfalls änderbar.

export type FarbrubrikId = 'hintergrund' | 'primaer' | 'sekundaer' | 'tertiaer';

export interface Farbrubrik {
  /** Anzeigename der Rubrik (vom CEO vergeben bzw. Arbeitsname). */
  name: string;
  /** Aktueller Standardwert. */
  wert: string;
}

/** Allgemeine Farbrubriken der App mit ihren aktuellen Standardwerten. */
export const farbrubriken: Record<FarbrubrikId, Farbrubrik> = {
  hintergrund: { name: 'Hintergrund', wert: '#FAF6EB' },
  primaer: { name: 'Primär', wert: '#76312C' },
  sekundaer: { name: 'Sekundär', wert: '#D9C8AE' },
  tertiaer: { name: 'Tertiär', wert: '#6B5849' },
};

export type NavigationsFarbrolle =
  | 'navigationshintergrund'
  | 'hervorhebungsfarbe'
  | 'aktivfarbe'
  | 'inaktivfarbe';

/** Aus welcher Farbrubrik jede Farbrolle der Hauptnavigation ihre Farbe bezieht. */
export const navigationsFarbrollen: Record<NavigationsFarbrolle, FarbrubrikId> = {
  navigationshintergrund: 'hintergrund',
  hervorhebungsfarbe: 'sekundaer',
  aktivfarbe: 'primaer',
  inaktivfarbe: 'tertiaer',
};

/** Name der CSS-Variable einer Farbrubrik, z. B. `--bz-farbe-primaer`. */
export const rubrikVariable = (id: FarbrubrikId): string => `--bz-farbe-${id}`;

/** CSS-Ausdruck, der die Farbe einer Farbrubrik liefert, z. B. `var(--bz-farbe-hintergrund)`. */
export const rubrikFarbe = (id: FarbrubrikId): string => `var(${rubrikVariable(id)})`;

/**
 * Setzt alle Farb-CSS-Variablen auf ein Element (z. B. `<html>`), damit auch
 * Bereiche außerhalb der App-Wurzel (html/body) die Farbrubriken nutzen können.
 */
export function farbVariablenAnwenden(ziel: HTMLElement): void {
  for (const [name, wert] of Object.entries(farbVariablen())) {
    ziel.style.setProperty(name, wert);
  }
}

/** Name der CSS-Variable einer Navigations-Farbrolle, z. B. `--bz-nav-aktivfarbe`. */
export const navRolleVariable = (rolle: NavigationsFarbrolle): string => `--bz-nav-${rolle}`;

/** CSS-Ausdruck, der die Farbe einer Navigations-Farbrolle liefert. */
export const navFarbe = (rolle: NavigationsFarbrolle): string => `var(${navRolleVariable(rolle)})`;

/**
 * Alle Farb-CSS-Variablen: die Rubriken mit ihren Werten und die
 * Navigations-Farbrollen als Verweis auf ihre Rubrik.
 */
export function farbVariablen(): Record<string, string> {
  const vars: Record<string, string> = {};
  for (const [id, rubrik] of Object.entries(farbrubriken) as [FarbrubrikId, Farbrubrik][]) {
    vars[rubrikVariable(id)] = rubrik.wert;
  }
  for (const [rolle, rubrik] of Object.entries(navigationsFarbrollen) as [
    NavigationsFarbrolle,
    FarbrubrikId,
  ][]) {
    vars[navRolleVariable(rolle)] = `var(${rubrikVariable(rubrik)})`;
  }
  return vars;
}
