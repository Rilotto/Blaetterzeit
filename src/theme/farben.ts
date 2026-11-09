// Zentrale Farbdefinition der App (Design-Tokens), siehe REQ-002 "Farben"
// und CLAUDE.md "Farben auf Zuruf".
//
// Dies ist die EINZIGE Stelle im Code, an der Farbwerte stehen.
// Farbänderungen des CEO ("Primärfarbe auf #… ändern") werden nur hier
// in `farbrubriken` eingetragen. Rubriknamen sind hier ebenfalls änderbar.

export type FarbrubrikId =
  | 'hintergrund'
  | 'primaer'
  | 'sekundaer'
  | 'tertiaer'
  | 'ghost'
  | 'ghostframe'
  | 'schrifttertiaer'
  | 'dunkelbraun';

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
  // REQ-006: neue Rubriken, Standardwerte aus dem Referenzbild.
  ghost: { name: 'Ghost', wert: '#ECE8DC' },
  ghostframe: { name: 'GhostFrame', wert: '#DFD9CB' },
  schrifttertiaer: { name: 'Schrift tertiär', wert: '#685849' },
  // REQ-009: Buchtitel.
  dunkelbraun: { name: 'Dunkelbraun', wert: '#392F25' },
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

/** Farbrollen der Seite „Bücher“ (REQ-005, REQ-006, REQ-009 bis REQ-012). */
export type BuecherFarbrolle =
  | 'ueberschrift'
  | 'filterschaltflaecheHintergrund'
  | 'filterschaltflaecheVordergrund'
  | 'plusschaltflaecheHintergrund'
  | 'plusschaltflaecheVordergrund'
  | 'filterAktivHintergrund'
  | 'filterAktivSchrift'
  | 'filterInaktivHintergrund'
  | 'filterInaktivRahmen'
  | 'filterInaktivSchrift'
  | 'abschnittsueberschrift'
  | 'alleAnsehen'
  | 'buchtitel'
  | 'coverplatzhalterFlaeche'
  | 'coverplatzhalterIcon'
  | 'leerplatzhalterFlaeche'
  | 'leerplatzhalterRahmen'
  | 'leerplatzhalterIcon'
  | 'leerplatzhalterText'
  | 'abschnittsplatzhalterText';

/** Aus welcher Farbrubrik jede Farbrolle der Seite „Bücher“ ihre Farbe bezieht (Tabellen „Farben“ der REQs). */
export const buecherFarbrollen: Record<BuecherFarbrolle, FarbrubrikId> = {
  ueberschrift: 'tertiaer',
  filterschaltflaecheHintergrund: 'hintergrund',
  filterschaltflaecheVordergrund: 'tertiaer',
  plusschaltflaecheHintergrund: 'primaer',
  plusschaltflaecheVordergrund: 'hintergrund',
  filterAktivHintergrund: 'tertiaer',
  filterAktivSchrift: 'hintergrund',
  filterInaktivHintergrund: 'ghost',
  filterInaktivRahmen: 'ghostframe',
  filterInaktivSchrift: 'schrifttertiaer',
  abschnittsueberschrift: 'tertiaer',
  alleAnsehen: 'primaer',
  buchtitel: 'dunkelbraun',
  coverplatzhalterFlaeche: 'ghost',
  coverplatzhalterIcon: 'primaer',
  leerplatzhalterFlaeche: 'ghost',
  leerplatzhalterRahmen: 'ghostframe',
  leerplatzhalterIcon: 'primaer',
  leerplatzhalterText: 'primaer',
  abschnittsplatzhalterText: 'primaer',
};

/** Name der CSS-Variable einer Farbrubrik, z. B. `--bz-farbe-primaer`. */
export const rubrikVariable = (id: FarbrubrikId): string => `--bz-farbe-${id}`;

/** CSS-Ausdruck, der die Farbe einer Farbrubrik liefert, z. B. `var(--bz-farbe-hintergrund)`. */
export const rubrikFarbe = (id: FarbrubrikId): string => `var(${rubrikVariable(id)})`;

/** CSS-Ausdruck einer Farbrolle der Seite „Bücher“, z. B. `var(--bz-farbe-tertiaer)`. */
export const buecherFarbe = (rolle: BuecherFarbrolle): string => rubrikFarbe(buecherFarbrollen[rolle]);

/**
 * Dezenter Schatten der Coverflächen (REQ-009). Die Schattenfarbe ist aus der
 * Rubrik „Dunkelbraun“ abgeleitet (abgeschwächt), damit kein eigener Farbwert entsteht.
 */
export const coverSchatten = `0 2px 6px color-mix(in srgb, ${rubrikFarbe('dunkelbraun')} 25%, transparent)`;

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
