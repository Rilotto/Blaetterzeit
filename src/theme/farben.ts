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
  | 'dunkelbraun'
  | 'flammerot'
  | 'flammeorange';

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
  // REQ-009: Buchtitel.
  dunkelbraun: { name: 'Dunkelbraun', wert: '#392F25' },
  // REQ-027: Verlauf der Streak-Flamme (unten Rot, oben Orange).
  flammerot: { name: 'Flamme Rot', wert: '#B5452F' },
  flammeorange: { name: 'Flamme Orange', wert: '#E0904A' },
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
  filterInaktivSchrift: 'tertiaer',
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

/** Farbrollen des Fensters „Buchdetails“ mit Auswahlmenü, Kamera und Zuschnitt (REQ-013 bis REQ-018). */
export type BuchdetailsFarbrolle =
  | 'kopfzeilenSymbol'
  | 'coverflaeche'
  | 'covertitel'
  | 'bereichsflaeche'
  | 'bereichsrahmen'
  | 'bereichsbeschriftung'
  | 'titel'
  | 'auswahlmenueFlaeche'
  | 'auswahlmenueSchrift'
  | 'auswahlmenueIcon'
  | 'kameraFlaeche'
  | 'kameraHinweis'
  | 'ausloeserFlaeche'
  | 'ausloeserRahmen'
  | 'zuschnittFlaeche'
  | 'zuschnittEckpunkt'
  | 'zuschnittRahmen'
  | 'bestaetigenFlaeche'
  | 'bestaetigenSchrift';

/**
 * Aus welcher Farbrubrik jede Farbrolle der Buchdetails ihre Farbe bezieht.
 * Auswahlmenü (REQ-015): im Referenzbild gemessen Fläche ≈ #F6F2E7 (leicht durchscheinend),
 * Schrift und Icons ≈ #271E15. Es gibt keine eigene Rubrik dafür; zugeordnet sind die
 * nächstliegenden bestehenden Rubriken „Hintergrund“ bzw. „Dunkelbraun“.
 */
export const buchdetailsFarbrollen: Record<BuchdetailsFarbrolle, FarbrubrikId> = {
  kopfzeilenSymbol: 'tertiaer',
  coverflaeche: 'primaer',
  covertitel: 'hintergrund',
  bereichsflaeche: 'ghost',
  bereichsrahmen: 'ghostframe',
  bereichsbeschriftung: 'primaer',
  titel: 'tertiaer',
  auswahlmenueFlaeche: 'hintergrund',
  auswahlmenueSchrift: 'dunkelbraun',
  auswahlmenueIcon: 'dunkelbraun',
  kameraFlaeche: 'hintergrund',
  kameraHinweis: 'tertiaer',
  ausloeserFlaeche: 'hintergrund',
  ausloeserRahmen: 'primaer',
  zuschnittFlaeche: 'hintergrund',
  zuschnittEckpunkt: 'primaer',
  zuschnittRahmen: 'primaer',
  bestaetigenFlaeche: 'primaer',
  bestaetigenSchrift: 'hintergrund',
};

/** Farbrollen „Lesestatus und Fortschritt“ in den Buchdetails (REQ-021 bis REQ-028). */
export type FortschrittFarbrolle =
  | 'autor'
  | 'statuspilleFlaeche'
  | 'statuspilleSchrift'
  | 'statuspilleIcon'
  | 'statuspillePfeile'
  | 'statusmenueFlaeche'
  | 'statusmenueSchrift'
  | 'statusmenueIcon'
  | 'balkenLeer'
  | 'balkenFuellung'
  | 'fortschrittText'
  | 'fortschrittHerz'
  | 'statistikFlaeche'
  | 'statistikRahmen'
  | 'statistikTrennlinie'
  | 'statistikText'
  | 'flammeUmriss'
  | 'flammeUnten'
  | 'flammeOben'
  | 'flammeZahlAktiv'
  | 'flammeZahlInaktiv'
  | 'blattFlaeche'
  | 'ziehgriff'
  | 'blattUeberschrift'
  | 'blattUntertitel'
  | 'schliessenFlaeche'
  | 'schliessenRahmen'
  | 'schliessenIcon'
  | 'umschalterAktiv'
  | 'umschalterInaktiv'
  | 'umschalterSchrift'
  | 'eingabeFlaeche'
  | 'eingabeRahmen'
  | 'eingabeSchrift'
  | 'sichernFlaeche'
  | 'sichernSchrift'
  | 'hinweis';

/** Aus welcher Farbrubrik jede Farbrolle „Lesestatus und Fortschritt“ ihre Farbe bezieht (Farbangaben der REQs 021–028). */
export const fortschrittFarbrollen: Record<FortschrittFarbrolle, FarbrubrikId> = {
  autor: 'tertiaer',
  statuspilleFlaeche: 'primaer',
  statuspilleSchrift: 'hintergrund',
  statuspilleIcon: 'hintergrund',
  statuspillePfeile: 'hintergrund',
  // Statusmenü wie das Auswahlmenü der Buchdarstellung (REQ-022, AK-8).
  statusmenueFlaeche: buchdetailsFarbrollen.auswahlmenueFlaeche,
  statusmenueSchrift: buchdetailsFarbrollen.auswahlmenueSchrift,
  statusmenueIcon: buchdetailsFarbrollen.auswahlmenueIcon,
  balkenLeer: 'ghostframe',
  balkenFuellung: 'primaer',
  fortschrittText: 'dunkelbraun',
  fortschrittHerz: 'primaer',
  statistikFlaeche: 'ghost',
  statistikRahmen: 'ghostframe',
  statistikTrennlinie: 'ghostframe',
  statistikText: 'dunkelbraun',
  flammeUmriss: 'ghostframe',
  flammeUnten: 'flammerot',
  flammeOben: 'flammeorange',
  flammeZahlAktiv: 'hintergrund',
  // „gedeckt“ (REQ-027): abgeschwächt dargestellt, siehe flammeZahlInaktiv unten.
  flammeZahlInaktiv: 'tertiaer',
  blattFlaeche: 'hintergrund',
  ziehgriff: 'tertiaer',
  blattUeberschrift: 'dunkelbraun',
  blattUntertitel: 'tertiaer',
  schliessenFlaeche: 'ghost',
  schliessenRahmen: 'ghostframe',
  schliessenIcon: 'dunkelbraun',
  umschalterAktiv: 'ghost',
  umschalterInaktiv: 'ghostframe',
  umschalterSchrift: 'dunkelbraun',
  eingabeFlaeche: 'ghost',
  eingabeRahmen: 'ghostframe',
  eingabeSchrift: 'dunkelbraun',
  sichernFlaeche: 'primaer',
  sichernSchrift: 'hintergrund',
  hinweis: 'primaer',
};

/** Farbrollen „Buch anlegen“: Menü „Buch hinzufügen“ (REQ-029) und Blatt „Manueller Eintrag“ (REQ-030 bis REQ-032). */
export type BuchAnlegenFarbrolle =
  | 'menueFlaeche'
  | 'menueRahmen'
  | 'menueIconKachel'
  | 'menueIcon'
  | 'menueOptionTitel'
  | 'menueOptionUntertitel'
  | 'blattFlaeche'
  | 'ziehgriff'
  | 'blattUeberschrift'
  | 'schliessenFlaeche'
  | 'schliessenRahmen'
  | 'schliessenIcon'
  | 'coverFeldFlaeche'
  | 'coverFeldRahmen'
  | 'coverFeldInhalt'
  | 'formularFlaeche'
  | 'formularRahmen'
  | 'feldBeschriftung'
  | 'platzhalter'
  | 'eingabe'
  | 'trennlinie'
  | 'erscheinungsdatum'
  | 'hinzufuegenFlaeche'
  | 'hinzufuegenSchrift'
  | 'fehler';

/** Aus welcher Farbrubrik jede Farbrolle „Buch anlegen“ ihre Farbe bezieht (Tabellen „Farben“ in REQ-029/REQ-030/REQ-031). */
export const buchAnlegenFarbrollen: Record<BuchAnlegenFarbrolle, FarbrubrikId> = {
  menueFlaeche: 'hintergrund',
  menueRahmen: 'ghostframe',
  menueIconKachel: 'ghost',
  menueIcon: 'primaer',
  menueOptionTitel: 'dunkelbraun',
  menueOptionUntertitel: 'tertiaer',
  blattFlaeche: 'hintergrund',
  ziehgriff: 'tertiaer',
  blattUeberschrift: 'dunkelbraun',
  schliessenFlaeche: 'ghost',
  schliessenRahmen: 'ghostframe',
  schliessenIcon: 'dunkelbraun',
  coverFeldFlaeche: 'ghost',
  coverFeldRahmen: 'ghostframe',
  coverFeldInhalt: 'tertiaer',
  formularFlaeche: 'ghost',
  formularRahmen: 'ghostframe',
  feldBeschriftung: 'dunkelbraun',
  platzhalter: 'tertiaer',
  eingabe: 'dunkelbraun',
  trennlinie: 'ghostframe',
  erscheinungsdatum: 'primaer',
  hinzufuegenFlaeche: 'primaer',
  hinzufuegenSchrift: 'hintergrund',
  // Hinweis „Bitte gib einen Titel ein“ und Hervorhebung eines ungültigen Jahres (REQ-031).
  fehler: 'primaer',
};

/** Name der CSS-Variable einer Farbrubrik, z. B. `--bz-farbe-primaer`. */
export const rubrikVariable = (id: FarbrubrikId): string => `--bz-farbe-${id}`;

/** CSS-Ausdruck, der die Farbe einer Farbrubrik liefert, z. B. `var(--bz-farbe-hintergrund)`. */
export const rubrikFarbe = (id: FarbrubrikId): string => `var(${rubrikVariable(id)})`;

/** CSS-Ausdruck einer Farbrolle der Seite „Bücher“, z. B. `var(--bz-farbe-tertiaer)`. */
export const buecherFarbe = (rolle: BuecherFarbrolle): string => rubrikFarbe(buecherFarbrollen[rolle]);

/** CSS-Ausdruck einer Farbrolle der Buchdetails, z. B. `var(--bz-farbe-tertiaer)`. */
export const buchdetailsFarbe = (rolle: BuchdetailsFarbrolle): string => rubrikFarbe(buchdetailsFarbrollen[rolle]);

/** CSS-Ausdruck einer Farbrolle „Lesestatus und Fortschritt“, z. B. `var(--bz-farbe-primaer)`. */
export const fortschrittFarbe = (rolle: FortschrittFarbrolle): string => rubrikFarbe(fortschrittFarbrollen[rolle]);

/** Gedeckte Zahl „0“ in der Flamme bei Streak 0 (REQ-027), aus der Rolle `flammeZahlInaktiv` abgeschwächt. */
export const flammeZahlGedeckt = `color-mix(in srgb, ${rubrikFarbe(fortschrittFarbrollen.flammeZahlInaktiv)} 55%, transparent)`;

/** Untere Kante der Pille „Sichern“ (Referenzbild REQ-024/REQ-025), aus „Primär“ und „Dunkelbraun“ abgeleitet. */
export const sichernKante = `0 4px 0 color-mix(in srgb, ${rubrikFarbe('primaer')} 70%, ${rubrikFarbe('dunkelbraun')})`;

/** CSS-Ausdruck einer Farbrolle „Buch anlegen“, z. B. `var(--bz-farbe-ghost)`. */
export const buchAnlegenFarbe = (rolle: BuchAnlegenFarbrolle): string => rubrikFarbe(buchAnlegenFarbrollen[rolle]);

/**
 * Abdunklung hinter Menüs (Menü „Buch hinzufügen“, REQ-029; Vorbild Menü „Aktuelle Seite“, REQ-024).
 * Aus „Dunkelbraun“ abgeleitet, damit kein eigener Farbwert entsteht. Stärke prüft der CEO im Prototyp.
 */
export const abdunklung = `color-mix(in srgb, ${rubrikFarbe('dunkelbraun')} 28%, transparent)`;

/** Schatten des Menüs „Buch hinzufügen“ (Referenzbild), aus „Dunkelbraun“ abgeleitet. */
export const plusMenueSchatten = `0 10px 30px color-mix(in srgb, ${rubrikFarbe('dunkelbraun')} 18%, transparent)`;

/** Weicher Schatten der Coverfläche in den Buchdetails (Referenzbild), aus „Dunkelbraun“ abgeleitet. */
export const buchdetailsCoverSchatten = `0 10px 24px color-mix(in srgb, ${rubrikFarbe('dunkelbraun')} 22%, transparent)`;

/** Schatten des Auswahlmenüs (REQ-015, Referenzbild), aus „Dunkelbraun“ abgeleitet. */
export const auswahlmenueSchatten = `0 8px 28px color-mix(in srgb, ${rubrikFarbe('dunkelbraun')} 20%, transparent)`;

/** Leicht durchscheinende Fläche des Auswahlmenüs (Referenzbild: Inhalt darunter schimmert durch). */
export const auswahlmenueFlaeche = `color-mix(in srgb, ${rubrikFarbe(buchdetailsFarbrollen.auswahlmenueFlaeche)} 92%, transparent)`;

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
