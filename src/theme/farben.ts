// Zentrale Farbdefinition der App (Design-Tokens), siehe REQ-002 "Farben"
// und CLAUDE.md "Farben auf Zuruf".
//
// Dies ist die EINZIGE Stelle im Code, an der Farbwerte stehen.
// Farbänderungen des CEO ("Primärfarbe auf #… ändern") werden nur hier
// in `farbrubriken` eingetragen. Rubriknamen sind hier ebenfalls änderbar.

export type FarbrubrikId =
  | "hintergrund"
  // Fläche aller Karten, heller als „Hintergrund“ (nach Wegfall der Papier-Körnung).
  | "kartenflaeche"
  | "primaer"
  | "sekundaer"
  | "tertiaer"
  | "ghost"
  | "ghostframe"
  | "dunkelbraun"
  | "flammerot"
  | "flammeorange"
  // REQ-046: je Bewertungskriterium eine eigene Farbrubrik (volle Farbe).
  | "sterne"
  | "tempo"
  | "weltenbau"
  | "spice"
  | "spannung"
  | "action"
  | "hauptfiguren"
  | "nebenfiguren"
  | "plottwist"
  | "traenen"
  | "romantik"
  | "humor"
  | "grusel"
  | "dialoge"
  // REQ-084: Seiten „aus beendeten Büchern“ im Statistik-Diagramm.
  | "gold";

export interface Farbrubrik {
  /** Anzeigename der Rubrik (vom CEO vergeben bzw. Arbeitsname). */
  name: string;
  /** Aktueller Standardwert. */
  wert: string;
}

/** Allgemeine Farbrubriken der App mit ihren aktuellen Standardwerten. */
export const farbrubriken: Record<FarbrubrikId, Farbrubrik> = {
  hintergrund: { name: "Hintergrund", wert: "#FAF6EB" },
  // Fläche aller Karten (Ausgabe, Profil › App, Bewertung, Rezension, Statistik, Listenkarten, Format).
  kartenflaeche: { name: "Kartenfläche", wert: "#FFFDF8" },
  primaer: { name: "Primär", wert: "#76312C" },
  sekundaer: { name: "Sekundär", wert: "#D9C8AE" },
  tertiaer: { name: "Tertiär", wert: "#6B5849" },
  // REQ-006: neue Rubriken, Standardwerte aus dem Referenzbild.
  ghost: { name: "Ghost", wert: "#ECE8DC" },
  ghostframe: { name: "GhostFrame", wert: "#DFD9CB" },
  // REQ-009: Buchtitel.
  dunkelbraun: { name: "Dunkelbraun", wert: "#392F25" },
  // REQ-027: Verlauf der Streak-Flamme (unten Rot, oben Orange).
  flammerot: { name: "Flamme Rot", wert: "#B5452F" },
  flammeorange: { name: "Flamme Orange", wert: "#E0904A" },
  // REQ-046: Bewertungskriterien (volle Farbe); die blasse Farbe wird berechnet (kriteriumBlass).
  sterne: { name: "Sterne", wert: "#D9A21B" },
  tempo: { name: "Tempo", wert: "#5B6FB0" },
  weltenbau: { name: "Weltenbau", wert: "#4E7D63" },
  spice: { name: "Spice", wert: "#B83A2E" },
  spannung: { name: "Spannung", wert: "#6D4C8D" },
  action: { name: "Action", wert: "#D9822B" },
  hauptfiguren: { name: "Hauptfiguren", wert: "#A0622D" },
  nebenfiguren: { name: "Nebenfiguren", wert: "#6B5849" },
  plottwist: { name: "Plot Twist", wert: "#8E3B67" },
  traenen: { name: "Tränen", wert: "#3F7CB8" },
  romantik: { name: "Romantik", wert: "#C2577A" },
  humor: { name: "Humor", wert: "#8EA33B" },
  grusel: { name: "Grusel", wert: "#45505A" },
  dialoge: { name: "Dialoge", wert: "#2F8F8A" },
  // REQ-084: Stapelteil „aus beendeten Büchern“ (Standardwert auf Zuruf, kein Akzeptanzkriterium).
  gold: { name: "Gold", wert: "#C9A23F" },
};

/** Farbdesigns (REQ-068): Jedes Design legt einen Wert für jede Farbrubrik fest. */
export type FarbdesignId =
  | "klassisch"
  | "salbei"
  | "nachtlektuere"
  | "raureif"
  | "polarnacht"
  | "minztraube"
  | "traubennacht";

export interface Farbdesign {
  /** Anzeigename im Fenster „Design“. */
  name: string;
  /** Wert je Farbrubrik. */
  werte: Record<FarbrubrikId, string>;
  /**
   * Einordnung hell/dunkel (REQ-068, Pillen „Hell“ / „Dunkel“ REQ-110). Dunkles Design: Schatten und
   * Abdunklung werden aus „Hintergrund“ statt „Dunkelbraun“ abgeleitet.
   */
  dunkel: boolean;
}

/**
 * Werte von „Klassisch“ = die Standardwerte aus `farbrubriken`, LIVE über Getter: Eine Änderung der
 * Rubriken („Farben auf Zuruf“, auch zur Laufzeit) wirkt sofort im Design „Klassisch“.
 */
const klassischWerte = Object.defineProperties(
  {} as Record<FarbrubrikId, string>,
  Object.fromEntries(
    (Object.keys(farbrubriken) as FarbrubrikId[]).map((id) => [
      id,
      { enumerable: true, get: () => farbrubriken[id].wert },
    ]),
  ),
);

/**
 * Zentrale Definition der Farbdesigns in fester Reihenfolge (REQ-068). Neue Designs nur auf Zuruf des CEO.
 * „Klassisch“ = die Standardwerte aus `farbrubriken`. Bei allen übrigen Designs sind Hintergrund, Primär,
 * Sekundär, Tertiär und Dunkelbraun (bei Raureif, Polarnacht, Minztraube und Traubennacht auch Ghost/GhostFrame)
 * vom CEO vorgegeben, die übrigen Rubriken abgeleitet (dunkle Designs: Kriterienfarben aufgehellt, damit sie
 * auf dunklem Hintergrund lesbar bleiben).
 */
export const farbdesigns: Record<FarbdesignId, Farbdesign> = {
  klassisch: { name: "Klassisch", dunkel: false, werte: klassischWerte },
  salbei: {
    name: "Salbei",
    dunkel: false,
    werte: {
      ...klassischWerte,
      hintergrund: "#F3F5EE",
      kartenflaeche: "#FBFCF8",
      primaer: "#4E7D63",
      sekundaer: "#C9D6C3",
      tertiaer: "#5E6B5A",
      dunkelbraun: "#2C3A2F",
      ghost: "#E6EBDF",
      ghostframe: "#D3DCCB",
      weltenbau: "#3F8A5C",
      nebenfiguren: "#5E6B5A",
    },
  },
  nachtlektuere: {
    name: "Nachtlektüre",
    dunkel: true,
    werte: {
      hintergrund: "#2B2420",
      kartenflaeche: "#362D28",
      primaer: "#D9A21B",
      sekundaer: "#5A4A3E",
      tertiaer: "#B8A58C",
      dunkelbraun: "#F1E9DA",
      ghost: "#3A302A",
      ghostframe: "#4D4037",
      flammerot: "#D2573E",
      flammeorange: "#EBA25A",
      sterne: "#E8B83A",
      tempo: "#8E9FDC",
      weltenbau: "#7DB394",
      spice: "#E26C5C",
      spannung: "#AC8CCB",
      action: "#E9A256",
      hauptfiguren: "#CF9258",
      nebenfiguren: "#B8A58C",
      plottwist: "#CC77A8",
      traenen: "#74AADF",
      romantik: "#E58DA9",
      humor: "#B6C863",
      grusel: "#9AA5B0",
      dialoge: "#5CBFB8",
      // „Primär“ ist hier bereits goldgelb; „Gold“ deshalb heller und kühler, damit beide Stapelteile unterscheidbar sind.
      gold: "#EAD9A6",
    },
  },
  raureif: {
    name: "Raureif",
    dunkel: false,
    werte: {
      ...klassischWerte,
      hintergrund: "#F6F8FA",
      kartenflaeche: "#FCFDFE",
      primaer: "#2E5A7A",
      sekundaer: "#C9D8E3",
      tertiaer: "#5C6B78",
      dunkelbraun: "#1E2A35",
      ghost: "#EBF0F4",
      ghostframe: "#D8E0E7",
      traenen: "#2F6FA8",
      nebenfiguren: "#5C6B78",
      grusel: "#3E4A56",
    },
  },
  polarnacht: {
    name: "Polarnacht",
    dunkel: true,
    werte: {
      hintergrund: "#0F1620",
      kartenflaeche: "#18222F",
      primaer: "#8EC5E8",
      sekundaer: "#24364A",
      tertiaer: "#9BABBB",
      dunkelbraun: "#E8F0F6",
      ghost: "#172030",
      ghostframe: "#253244",
      flammerot: "#E0644B",
      flammeorange: "#F0AD66",
      sterne: "#EBC04A",
      tempo: "#9AABE6",
      weltenbau: "#82C29C",
      spice: "#E8766A",
      spannung: "#B79AD6",
      action: "#EDAA60",
      hauptfiguren: "#D69C66",
      nebenfiguren: "#9BABBB",
      plottwist: "#D584B3",
      traenen: "#7FB6E8",
      romantik: "#EB98B2",
      humor: "#BCD06E",
      grusel: "#A4B0BC",
      dialoge: "#66C8C1",
      gold: "#E3C46B",
    },
  },
  // Palette des CEO (REQ-068, 2026-11-25). „Schrift tertiär“ (#6E5468) ist nur im REQ vermerkt.
  minztraube: {
    name: "Minztraube",
    dunkel: false,
    werte: {
      ...klassischWerte,
      hintergrund: "#F6F8FA",
      kartenflaeche: "#FCFDFE",
      primaer: "#9B287B",
      sekundaer: "#EBCFE3",
      tertiaer: "#5C164E",
      dunkelbraun: "#170F11",
      ghost: "#EBF0F4",
      ghostframe: "#D8E0E7",
      nebenfiguren: "#5C164E",
      // „Plot Twist“ wäre sonst fast gleich „Primär“.
      plottwist: "#6D4C8D",
      spannung: "#4F5FA8",
    },
  },
  // Palette des CEO (REQ-068, 2026-11-25). „Schrift tertiär“ (#A88DA2) ist nur im REQ vermerkt.
  traubennacht: {
    name: "Traubennacht",
    dunkel: true,
    werte: {
      hintergrund: "#170F11",
      kartenflaeche: "#24191D",
      primaer: "#D46BB6",
      sekundaer: "#5C164E",
      tertiaer: "#B79AB0",
      dunkelbraun: "#F6F8FA",
      ghost: "#22171B",
      ghostframe: "#402039",
      flammerot: "#E0644B",
      flammeorange: "#F0AD66",
      sterne: "#EBC04A",
      tempo: "#9AABE6",
      weltenbau: "#82C29C",
      spice: "#E8766A",
      spannung: "#B79AD6",
      action: "#EDAA60",
      hauptfiguren: "#D69C66",
      nebenfiguren: "#B79AB0",
      // „Plot Twist“ wäre sonst fast gleich „Primär“.
      plottwist: "#A98BE0",
      traenen: "#7FB6E8",
      romantik: "#EB98B2",
      humor: "#BCD06E",
      grusel: "#A4ACB4",
      dialoge: "#66C8C1",
      gold: "#E3C46B",
    },
  },
};

/** Reihenfolge der Farbdesigns in der Liste (REQ-068 AK-1). */
export const farbdesignReihenfolge: readonly FarbdesignId[] = [
  "klassisch",
  "salbei",
  "nachtlektuere",
  "raureif",
  "polarnacht",
  "minztraube",
  "traubennacht",
];

/** Gruppen der Pillen „Hell“ / „Dunkel“ im Fenster „Design“ (REQ-110). */
export type FarbdesignGruppe = "hell" | "dunkel";

export const farbdesignGruppen: readonly {
  id: FarbdesignGruppe;
  name: string;
}[] = [
  { id: "hell", name: "Hell" },
  { id: "dunkel", name: "Dunkel" },
];

/** Gruppe eines Farbdesigns laut zentraler Einordnung (REQ-068). */
export const farbdesignGruppe = (id: FarbdesignId): FarbdesignGruppe =>
  farbdesigns[id].dunkel ? "dunkel" : "hell";

/** Farbdesigns einer Gruppe in der festen Reihenfolge (REQ-068, REQ-110). */
export const farbdesignsDerGruppe = (
  gruppe: FarbdesignGruppe,
): FarbdesignId[] =>
  farbdesignReihenfolge.filter((id) => farbdesignGruppe(id) === gruppe);

/** Farbdesign ohne Nutzerwahl (REQ-068 AK-2). */
export const standardFarbdesign: FarbdesignId = "klassisch";

export const istFarbdesignId = (wert: unknown): wert is FarbdesignId =>
  typeof wert === "string" &&
  (farbdesignReihenfolge as readonly string[]).includes(wert);

/** Farbrubriken der fünf Farbkreise je Design (REQ-068). */
export const designVorschauRubriken: readonly FarbrubrikId[] = [
  "hintergrund",
  "primaer",
  "sekundaer",
  "tertiaer",
  "dunkelbraun",
];

/**
 * Warme Schattenfarbe (REQ-065 AK-11), aus den Rubriken des aktiven Designs abgeleitet
 * (CSS-Variable `--bz-schattenfarbe`, gesetzt in farbVariablen).
 */
export const schattenFarbe = "var(--bz-schattenfarbe)";

export type NavigationsFarbrolle =
  | "navigationshintergrund"
  | "hervorhebungsfarbe"
  | "aktivfarbe"
  | "inaktivfarbe";

/** Aus welcher Farbrubrik jede Farbrolle der Hauptnavigation ihre Farbe bezieht. */
export const navigationsFarbrollen: Record<NavigationsFarbrolle, FarbrubrikId> =
  {
    navigationshintergrund: "hintergrund",
    hervorhebungsfarbe: "sekundaer",
    aktivfarbe: "primaer",
    inaktivfarbe: "tertiaer",
  };

/** Farbrollen der Seite „Bücher“ (REQ-005, REQ-006, REQ-009 bis REQ-012). */
export type BuecherFarbrolle =
  | "ueberschrift"
  | "filterschaltflaecheHintergrund"
  | "filterschaltflaecheVordergrund"
  | "plusschaltflaecheHintergrund"
  | "plusschaltflaecheVordergrund"
  | "filterAktivHintergrund"
  | "filterAktivSchrift"
  | "filterInaktivHintergrund"
  | "filterInaktivRahmen"
  | "filterInaktivSchrift"
  | "abschnittsueberschrift"
  | "alleAnsehen"
  | "buchtitel"
  | "coverplatzhalterFlaeche"
  | "coverplatzhalterIcon"
  | "leerplatzhalterFlaeche"
  | "leerplatzhalterRahmen"
  | "leerplatzhalterIcon"
  | "leerplatzhalterText"
  | "abschnittsplatzhalterText";

/** Aus welcher Farbrubrik jede Farbrolle der Seite „Bücher“ ihre Farbe bezieht (Tabellen „Farben“ der REQs). */
export const buecherFarbrollen: Record<BuecherFarbrolle, FarbrubrikId> = {
  ueberschrift: "tertiaer",
  filterschaltflaecheHintergrund: "hintergrund",
  filterschaltflaecheVordergrund: "tertiaer",
  plusschaltflaecheHintergrund: "primaer",
  plusschaltflaecheVordergrund: "hintergrund",
  filterAktivHintergrund: "tertiaer",
  filterAktivSchrift: "hintergrund",
  filterInaktivHintergrund: "ghost",
  filterInaktivRahmen: "ghostframe",
  filterInaktivSchrift: "tertiaer",
  abschnittsueberschrift: "tertiaer",
  alleAnsehen: "primaer",
  buchtitel: "dunkelbraun",
  coverplatzhalterFlaeche: "ghost",
  coverplatzhalterIcon: "primaer",
  leerplatzhalterFlaeche: "ghost",
  leerplatzhalterRahmen: "ghostframe",
  leerplatzhalterIcon: "primaer",
  leerplatzhalterText: "primaer",
  abschnittsplatzhalterText: "primaer",
};

/** Farbrollen des Fensters „Buchdetails“ mit Auswahlmenü, Kamera und Zuschnitt (REQ-013 bis REQ-018). */
export type BuchdetailsFarbrolle =
  | "kopfzeilenSymbol"
  | "coverflaeche"
  | "covertitel"
  | "bereichsflaeche"
  | "bereichsrahmen"
  | "bereichsbeschriftung"
  | "titel"
  | "auswahlmenueFlaeche"
  | "auswahlmenueSchrift"
  | "auswahlmenueIcon"
  | "kameraFlaeche"
  | "kameraHinweis"
  | "ausloeserFlaeche"
  | "ausloeserRahmen"
  | "zuschnittFlaeche"
  | "zuschnittEckpunkt"
  | "zuschnittRahmen"
  | "bestaetigenFlaeche"
  | "bestaetigenSchrift";

/**
 * Aus welcher Farbrubrik jede Farbrolle der Buchdetails ihre Farbe bezieht.
 * Auswahlmenü (REQ-015): im Referenzbild gemessen Fläche ≈ #F6F2E7 (leicht durchscheinend),
 * Schrift und Icons ≈ #271E15. Es gibt keine eigene Rubrik dafür; zugeordnet sind die
 * nächstliegenden bestehenden Rubriken „Hintergrund“ bzw. „Dunkelbraun“.
 */
export const buchdetailsFarbrollen: Record<BuchdetailsFarbrolle, FarbrubrikId> =
  {
    kopfzeilenSymbol: "tertiaer",
    coverflaeche: "primaer",
    covertitel: "hintergrund",
    bereichsflaeche: "ghost",
    bereichsrahmen: "ghostframe",
    bereichsbeschriftung: "primaer",
    titel: "tertiaer",
    auswahlmenueFlaeche: "hintergrund",
    auswahlmenueSchrift: "dunkelbraun",
    auswahlmenueIcon: "dunkelbraun",
    kameraFlaeche: "hintergrund",
    kameraHinweis: "tertiaer",
    ausloeserFlaeche: "hintergrund",
    ausloeserRahmen: "primaer",
    zuschnittFlaeche: "hintergrund",
    zuschnittEckpunkt: "primaer",
    zuschnittRahmen: "primaer",
    bestaetigenFlaeche: "primaer",
    bestaetigenSchrift: "hintergrund",
  };

/** Farbrollen „Lesestatus und Fortschritt“ in den Buchdetails (REQ-021 bis REQ-028). */
export type FortschrittFarbrolle =
  | "autor"
  | "statuspilleFlaeche"
  | "statuspilleSchrift"
  | "statuspilleIcon"
  | "statuspillePfeile"
  | "statusmenueFlaeche"
  | "statusmenueSchrift"
  | "statusmenueIcon"
  | "balkenLeer"
  | "balkenFuellung"
  | "fortschrittText"
  | "fortschrittHerz"
  | "statistikFlaeche"
  | "statistikRahmen"
  | "statistikTrennlinie"
  | "statistikText"
  | "flammeUmriss"
  | "flammeUnten"
  | "flammeOben"
  | "flammeZahlAktiv"
  | "flammeZahlInaktiv"
  | "blattFlaeche"
  | "ziehgriff"
  | "blattUeberschrift"
  | "blattUntertitel"
  | "schliessenFlaeche"
  | "schliessenRahmen"
  | "schliessenIcon"
  | "umschalterAktiv"
  | "umschalterInaktiv"
  | "umschalterSchrift"
  | "eingabeFlaeche"
  | "eingabeRahmen"
  | "eingabeSchrift"
  | "sichernFlaeche"
  | "sichernSchrift"
  | "hinweis"
  | "eingabeFehler"
  | "flammeAusgegraut"
  | "flammeZahlAusgegraut";

/** Aus welcher Farbrubrik jede Farbrolle „Lesestatus und Fortschritt“ ihre Farbe bezieht (Farbangaben der REQs 021–028). */
export const fortschrittFarbrollen: Record<FortschrittFarbrolle, FarbrubrikId> =
  {
    autor: "tertiaer",
    statuspilleFlaeche: "primaer",
    statuspilleSchrift: "hintergrund",
    statuspilleIcon: "hintergrund",
    statuspillePfeile: "hintergrund",
    // Statusmenü wie das Auswahlmenü der Buchdarstellung (REQ-022, AK-8).
    statusmenueFlaeche: buchdetailsFarbrollen.auswahlmenueFlaeche,
    statusmenueSchrift: buchdetailsFarbrollen.auswahlmenueSchrift,
    statusmenueIcon: buchdetailsFarbrollen.auswahlmenueIcon,
    balkenLeer: "ghostframe",
    balkenFuellung: "primaer",
    fortschrittText: "dunkelbraun",
    fortschrittHerz: "primaer",
    statistikFlaeche: "ghost",
    statistikRahmen: "ghostframe",
    statistikTrennlinie: "ghostframe",
    statistikText: "dunkelbraun",
    flammeUmriss: "ghostframe",
    flammeUnten: "flammerot",
    flammeOben: "flammeorange",
    flammeZahlAktiv: "hintergrund",
    // Ausgegraute Gesamt-Streak-Flamme (REQ-108): gestern gelesen, heute noch nicht. Fläche GhostFrame, Zahl Dunkelbraun.
    flammeAusgegraut: "ghostframe",
    flammeZahlAusgegraut: "dunkelbraun",
    // „gedeckt“ (REQ-027): abgeschwächt dargestellt, siehe flammeZahlInaktiv unten.
    flammeZahlInaktiv: "tertiaer",
    blattFlaeche: "hintergrund",
    ziehgriff: "tertiaer",
    blattUeberschrift: "dunkelbraun",
    blattUntertitel: "tertiaer",
    schliessenFlaeche: "ghost",
    schliessenRahmen: "ghostframe",
    schliessenIcon: "dunkelbraun",
    umschalterAktiv: "ghost",
    umschalterInaktiv: "ghostframe",
    umschalterSchrift: "dunkelbraun",
    eingabeFlaeche: "ghost",
    eingabeRahmen: "ghostframe",
    eingabeSchrift: "dunkelbraun",
    sichernFlaeche: "primaer",
    sichernSchrift: "hintergrund",
    hinweis: "primaer",
    // Hervorhebung eines ungültigen Feldes wie „JAHR“ (REQ-031; REQ-063, REQ-064).
    eingabeFehler: "primaer",
  };

/** Farbrollen „Buch anlegen“: Menü „Buch hinzufügen“ (REQ-029) und Blatt „Manueller Eintrag“ (REQ-030 bis REQ-032). */
export type BuchAnlegenFarbrolle =
  | "menueFlaeche"
  | "menueRahmen"
  | "menueIconKachel"
  | "menueIcon"
  | "menueOptionTitel"
  | "menueOptionUntertitel"
  | "blattFlaeche"
  | "ziehgriff"
  | "blattUeberschrift"
  | "schliessenFlaeche"
  | "schliessenRahmen"
  | "schliessenIcon"
  | "coverFeldFlaeche"
  | "coverFeldRahmen"
  | "coverFeldInhalt"
  | "formularFlaeche"
  | "formularRahmen"
  | "feldBeschriftung"
  | "platzhalter"
  | "eingabe"
  | "trennlinie"
  | "erscheinungsdatum"
  | "hinzufuegenFlaeche"
  | "hinzufuegenSchrift"
  | "fehler";

/** Aus welcher Farbrubrik jede Farbrolle „Buch anlegen“ ihre Farbe bezieht (Tabellen „Farben“ in REQ-029/REQ-030/REQ-031). */
export const buchAnlegenFarbrollen: Record<BuchAnlegenFarbrolle, FarbrubrikId> =
  {
    menueFlaeche: "hintergrund",
    menueRahmen: "ghostframe",
    menueIconKachel: "ghost",
    menueIcon: "primaer",
    menueOptionTitel: "dunkelbraun",
    menueOptionUntertitel: "tertiaer",
    blattFlaeche: "hintergrund",
    ziehgriff: "tertiaer",
    blattUeberschrift: "dunkelbraun",
    schliessenFlaeche: "ghost",
    schliessenRahmen: "ghostframe",
    schliessenIcon: "dunkelbraun",
    coverFeldFlaeche: "ghost",
    coverFeldRahmen: "ghostframe",
    coverFeldInhalt: "tertiaer",
    formularFlaeche: "ghost",
    formularRahmen: "ghostframe",
    feldBeschriftung: "dunkelbraun",
    platzhalter: "tertiaer",
    eingabe: "dunkelbraun",
    trennlinie: "ghostframe",
    erscheinungsdatum: "primaer",
    hinzufuegenFlaeche: "primaer",
    hinzufuegenSchrift: "hintergrund",
    // Hinweis „Bitte gib einen Titel ein“ und Hervorhebung eines ungültigen Jahres (REQ-031).
    fehler: "primaer",
  };

/** Farbrollen der Übersichten (REQ-036 bis REQ-038, REQ-040, REQ-042), Zuordnung nach den Referenzbildern. */
export type UebersichtFarbrolle =
  | "suchfeldFlaeche"
  | "suchfeldRahmen"
  | "suchfeldIcon"
  | "suchfeldText"
  | "suchfeldPlatzhalter"
  | "anzahl"
  | "umschalterFlaeche"
  | "umschalterRahmen"
  | "umschalterAktivFlaeche"
  | "umschalterAktivIcon"
  | "umschalterInaktivIcon"
  | "sortierFlaeche"
  | "sortierRahmen"
  | "sortierSchrift"
  | "kartenFlaeche"
  | "kartenRahmen"
  | "buchtitel"
  | "autor"
  | "autorIcon"
  | "balkenLeer"
  | "balkenFuellung"
  | "fortschrittText"
  | "statuschipFlaeche"
  | "statuschipSchrift";

/** Aus welcher Farbrubrik jede Farbrolle der Übersichten ihre Farbe bezieht (nur bestehende Rubriken). */
export const uebersichtFarbrollen: Record<UebersichtFarbrolle, FarbrubrikId> = {
  suchfeldFlaeche: "hintergrund",
  suchfeldRahmen: "ghostframe",
  suchfeldIcon: "dunkelbraun",
  suchfeldText: "dunkelbraun",
  suchfeldPlatzhalter: "tertiaer",
  anzahl: "tertiaer",
  umschalterFlaeche: "hintergrund",
  umschalterRahmen: "ghostframe",
  umschalterAktivFlaeche: "dunkelbraun",
  umschalterAktivIcon: "hintergrund",
  umschalterInaktivIcon: "tertiaer",
  sortierFlaeche: "hintergrund",
  sortierRahmen: "ghostframe",
  sortierSchrift: "dunkelbraun",
  kartenFlaeche: "kartenflaeche",
  kartenRahmen: "ghostframe",
  buchtitel: "dunkelbraun",
  autor: "tertiaer",
  autorIcon: "primaer",
  balkenLeer: "ghostframe",
  balkenFuellung: "primaer",
  fortschrittText: "tertiaer",
  statuschipFlaeche: "ghost",
  statuschipSchrift: "primaer",
};

/** CSS-Ausdruck einer Farbrolle der Übersichten, z. B. `var(--bz-farbe-ghostframe)`. */
export const uebersichtFarbe = (rolle: UebersichtFarbrolle): string =>
  rubrikFarbe(uebersichtFarbrollen[rolle]);

/** Name der CSS-Variable einer Farbrubrik, z. B. `--bz-farbe-primaer`. */
export const rubrikVariable = (id: FarbrubrikId): string => `--bz-farbe-${id}`;

/** CSS-Ausdruck, der die Farbe einer Farbrubrik liefert, z. B. `var(--bz-farbe-hintergrund)`. */
export const rubrikFarbe = (id: FarbrubrikId): string =>
  `var(${rubrikVariable(id)})`;

/** CSS-Ausdruck einer Farbrolle der Seite „Bücher“, z. B. `var(--bz-farbe-tertiaer)`. */
export const buecherFarbe = (rolle: BuecherFarbrolle): string =>
  rubrikFarbe(buecherFarbrollen[rolle]);

/** CSS-Ausdruck einer Farbrolle der Buchdetails, z. B. `var(--bz-farbe-tertiaer)`. */
export const buchdetailsFarbe = (rolle: BuchdetailsFarbrolle): string =>
  rubrikFarbe(buchdetailsFarbrollen[rolle]);

/** CSS-Ausdruck einer Farbrolle „Lesestatus und Fortschritt“, z. B. `var(--bz-farbe-primaer)`. */
export const fortschrittFarbe = (rolle: FortschrittFarbrolle): string =>
  rubrikFarbe(fortschrittFarbrollen[rolle]);

/** Gedeckte Zahl „0“ in der Flamme bei Streak 0 (REQ-027), aus der Rolle `flammeZahlInaktiv` abgeschwächt. */
export const flammeZahlGedeckt = `color-mix(in srgb, ${rubrikFarbe(fortschrittFarbrollen.flammeZahlInaktiv)} 55%, transparent)`;

/** Untere Kante der Pille „Sichern“ (Referenzbild REQ-024/REQ-025), aus „Primär“ und „Dunkelbraun“ abgeleitet. */
export const sichernKante = `0 4px 0 color-mix(in srgb, ${rubrikFarbe("primaer")} 70%, ${rubrikFarbe("dunkelbraun")})`;

/** CSS-Ausdruck einer Farbrolle „Buch anlegen“, z. B. `var(--bz-farbe-ghost)`. */
export const buchAnlegenFarbe = (rolle: BuchAnlegenFarbrolle): string =>
  rubrikFarbe(buchAnlegenFarbrollen[rolle]);

/**
 * Abdunklung hinter Menüs (Menü „Buch hinzufügen“, REQ-029; Vorbild Menü „Aktuelle Seite“, REQ-024).
 * Aus „Dunkelbraun“ abgeleitet, damit kein eigener Farbwert entsteht. Stärke prüft der CEO im Prototyp.
 */
export const abdunklung = `color-mix(in srgb, ${schattenFarbe} 28%, transparent)`;

/** Schatten des Menüs „Buch hinzufügen“ (Referenzbild), aus „Dunkelbraun“ abgeleitet. */
export const plusMenueSchatten = `0 10px 30px color-mix(in srgb, ${schattenFarbe} 18%, transparent)`;

/** Weicher Schatten der Coverfläche in den Buchdetails (Referenzbild), aus „Dunkelbraun“ abgeleitet. */
export const buchdetailsCoverSchatten = `0 10px 24px color-mix(in srgb, ${schattenFarbe} 22%, transparent)`;

/** Schatten der Lupe im Zuschnitt (REQ-070), aus „Dunkelbraun“ abgeleitet. */
export const zuschnittLupeSchatten = `0 4px 14px color-mix(in srgb, ${schattenFarbe} 35%, transparent)`;

/** Schatten des Auswahlmenüs (REQ-015, Referenzbild), aus „Dunkelbraun“ abgeleitet. */
export const auswahlmenueSchatten = `0 8px 28px color-mix(in srgb, ${schattenFarbe} 20%, transparent)`;

/** Leicht durchscheinende Fläche des Auswahlmenüs (Referenzbild: Inhalt darunter schimmert durch). */
export const auswahlmenueFlaeche = `color-mix(in srgb, ${rubrikFarbe(buchdetailsFarbrollen.auswahlmenueFlaeche)} 92%, transparent)`;

/**
 * Dezenter Schatten der Coverflächen (REQ-009). Die Schattenfarbe ist aus der
 * Rubrik „Dunkelbraun“ abgeleitet (abgeschwächt), damit kein eigener Farbwert entsteht.
 */
export const coverSchatten = `0 2px 6px color-mix(in srgb, ${schattenFarbe} 25%, transparent)`;

/**
 * Setzt alle Farb-CSS-Variablen auf ein Element (z. B. `<html>`), damit auch
 * Bereiche außerhalb der App-Wurzel (html/body) die Farbrubriken nutzen können.
 */
export function farbVariablenAnwenden(
  ziel: HTMLElement,
  design: FarbdesignId = standardFarbdesign,
): void {
  for (const [name, wert] of Object.entries(farbVariablen(design))) {
    ziel.style.setProperty(name, wert);
  }
}

/** Name der CSS-Variable einer Navigations-Farbrolle, z. B. `--bz-nav-aktivfarbe`. */
export const navRolleVariable = (rolle: NavigationsFarbrolle): string =>
  `--bz-nav-${rolle}`;

/** CSS-Ausdruck, der die Farbe einer Navigations-Farbrolle liefert. */
export const navFarbe = (rolle: NavigationsFarbrolle): string =>
  `var(${navRolleVariable(rolle)})`;

/**
 * Alle Farb-CSS-Variablen: die Rubriken mit ihren Werten und die
 * Navigations-Farbrollen als Verweis auf ihre Rubrik.
 */
export function farbVariablen(
  design: FarbdesignId = standardFarbdesign,
): Record<string, string> {
  const vars: Record<string, string> = {};
  const { werte, dunkel } = farbdesigns[design];
  for (const id of Object.keys(farbrubriken) as FarbrubrikId[]) {
    vars[rubrikVariable(id)] = werte[id];
  }
  for (const [rolle, rubrik] of Object.entries(navigationsFarbrollen) as [
    NavigationsFarbrolle,
    FarbrubrikId,
  ][]) {
    vars[navRolleVariable(rolle)] = `var(${rubrikVariable(rubrik)})`;
  }
  // Warme Schatten: hell aus „Dunkelbraun“, dunkel aus abgedunkeltem „Hintergrund“ (sonst leuchtende Schatten).
  vars["--bz-schattenfarbe"] = dunkel
    ? `color-mix(in srgb, var(${rubrikVariable("hintergrund")}) 35%, black)`
    : `var(${rubrikVariable("dunkelbraun")})`;
  return vars;
}

/** Farbrollen der Buchdetails: Reiterleiste (REQ-043), Reiter „Rezension“ (REQ-044, REQ-047) und Schreibfenster (REQ-049). */
export type RezensionFarbrolle =
  | "reiterleisteFlaeche"
  | "reiterAktivFlaeche"
  | "reiterAktivSchrift"
  | "reiterInaktivIcon"
  | "abschnittsueberschrift"
  | "abschnittsIcon"
  | "karteFlaeche"
  | "karteRahmen"
  | "trennlinie"
  | "kriteriumName"
  | "stufentext"
  | "schreibfeldPlatzhalter"
  | "schreibfeldText"
  | "stiftIcon"
  | "fensterFlaeche"
  | "ziehgriff"
  | "fensterTitel"
  | "fensterAutor"
  | "schliessenFlaeche"
  | "schliessenRahmen"
  | "schliessenIcon"
  | "eingabePlatzhalter"
  | "eingabeText"
  | "sichernFlaeche"
  | "sichernSchrift";

/** Aus welcher Farbrubrik jede Farbrolle ihre Farbe bezieht (nach REF-rezension-01/-04, nur bestehende Rubriken). */
export const rezensionFarbrollen: Record<RezensionFarbrolle, FarbrubrikId> = {
  reiterleisteFlaeche: "ghostframe",
  reiterAktivFlaeche: "primaer",
  reiterAktivSchrift: "hintergrund",
  reiterInaktivIcon: "tertiaer",
  abschnittsueberschrift: "tertiaer",
  abschnittsIcon: "primaer",
  karteFlaeche: "kartenflaeche",
  karteRahmen: "sekundaer",
  trennlinie: "sekundaer",
  kriteriumName: "dunkelbraun",
  stufentext: "tertiaer",
  schreibfeldPlatzhalter: "tertiaer",
  schreibfeldText: "dunkelbraun",
  stiftIcon: "primaer",
  fensterFlaeche: "hintergrund",
  ziehgriff: "tertiaer",
  fensterTitel: "dunkelbraun",
  fensterAutor: "tertiaer",
  schliessenFlaeche: "hintergrund",
  schliessenRahmen: "sekundaer",
  schliessenIcon: "dunkelbraun",
  eingabePlatzhalter: "tertiaer",
  eingabeText: "dunkelbraun",
  sichernFlaeche: "primaer",
  sichernSchrift: "hintergrund",
};

/** CSS-Ausdruck einer Farbrolle der Reiterleiste bzw. des Reiters „Rezension“. */
export const rezensionFarbe = (rolle: RezensionFarbrolle): string =>
  rubrikFarbe(rezensionFarbrollen[rolle]);

/** Farbrubrik je Bewertungskriterium (REQ-046); Schlüssel = Kriterium-ID aus src/domain/bewertung.ts. */
export const kriteriumFarbrubriken = {
  sterne: "sterne",
  tempo: "tempo",
  weltenbau: "weltenbau",
  spice: "spice",
  spannung: "spannung",
  action: "action",
  hauptfiguren: "hauptfiguren",
  nebenfiguren: "nebenfiguren",
  plotTwist: "plottwist",
  traenen: "traenen",
  romantik: "romantik",
  humor: "humor",
  grusel: "grusel",
  dialoge: "dialoge",
} as const satisfies Record<string, FarbrubrikId>;

export type KriteriumFarbe = keyof typeof kriteriumFarbrubriken;

/** Anteil der vollen Farbe in der blassen Farbe (Rest: „Hintergrund“). Kein Akzeptanzkriterium. */
export const BLASS_ANTEIL = 25;

/** Volle Farbe eines Kriteriums (angewähltes Symbol, REQ-046 AK-3). */
export const kriteriumVoll = (id: KriteriumFarbe): string =>
  rubrikFarbe(kriteriumFarbrubriken[id]);

/**
 * Blasse Farbe eines Kriteriums (REQ-046 AK-4): automatisch aus der vollen Farbe und „Hintergrund“ gemischt.
 * Da beide als CSS-Variable eingehen, folgt sie jeder Änderung der vollen Farbe ohne eigenen Wert.
 */
export const kriteriumBlass = (id: KriteriumFarbe): string =>
  `color-mix(in srgb, ${kriteriumVoll(id)} ${BLASS_ANTEIL}%, ${rubrikFarbe("hintergrund")})`;

/** Leichter Schatten der aktiven Reiterpille (REQ-043, Referenzbild), aus „Dunkelbraun“ abgeleitet. */
export const reiterPilleSchatten = `0 2px 6px color-mix(in srgb, ${schattenFarbe} 18%, transparent)`;

/** Farbrollen des Reiters „Details“ (REQ-051 bis REQ-056) und des Fensters „Format“ (REQ-058), nach REF-details-01 bis -03. */
export type DetailsFarbrolle =
  | "ueberschrift"
  | "bearbeiten"
  | "pilleGefuelltFlaeche"
  | "pilleGefuelltSchrift"
  | "pilleGestricheltRahmen"
  | "pilleGestricheltSchrift"
  | "sammlungRahmen"
  | "sammlungSchrift"
  | "karteFlaeche"
  | "karteRahmen"
  | "trennlinie"
  | "zeileBezeichnung"
  | "zeileWert"
  | "zeilePfeil"
  | "preisLeer"
  | "zeileFehler"
  | "kachelFlaeche"
  | "kachelRahmen"
  | "kachelGewaehltFlaeche"
  | "kachelGewaehltRahmen"
  | "kachelSchrift"
  | "kachelGewaehltSchrift"
  | "kachelIcon"
  | "hakenFlaeche"
  | "hakenIcon"
  | "kreisRahmen"
  | "unterKachelFlaeche"
  | "buchDunkel"
  | "buchAkzent"
  | "sonderPilleFlaeche"
  | "sonderPilleSchrift"
  | "sonderPilleGewaehltSchrift"
  | "sonderGewaehlt"
  | "exemplarFrage"
  | "exemplarFlaeche"
  | "exemplarGewaehltFlaeche"
  | "exemplarSchrift"
  | "exemplarGewaehltSchrift";

/** Aus welcher Farbrubrik jede Farbrolle des Reiters „Details“ ihre Farbe bezieht (nur bestehende Rubriken). */
export const detailsFarbrollen: Record<DetailsFarbrolle, FarbrubrikId> = {
  ueberschrift: "dunkelbraun",
  bearbeiten: "primaer",
  pilleGefuelltFlaeche: "primaer",
  pilleGefuelltSchrift: "hintergrund",
  pilleGestricheltRahmen: "sekundaer",
  pilleGestricheltSchrift: "primaer",
  sammlungRahmen: "sekundaer",
  sammlungSchrift: "primaer",
  karteFlaeche: "kartenflaeche",
  karteRahmen: "sekundaer",
  trennlinie: "sekundaer",
  zeileBezeichnung: "dunkelbraun",
  zeileWert: "tertiaer",
  zeilePfeil: "tertiaer",
  preisLeer: "primaer",
  // Ungültiges Feld in der Karte „Ausgabe“ (Seiten im Manuellen Eintrag, REQ-060, AK-5) wie „JAHR“.
  zeileFehler: "primaer",
  kachelFlaeche: "kartenflaeche",
  kachelRahmen: "sekundaer",
  kachelGewaehltFlaeche: "ghost",
  kachelGewaehltRahmen: "primaer",
  kachelSchrift: "tertiaer",
  kachelGewaehltSchrift: "primaer",
  kachelIcon: "tertiaer",
  hakenFlaeche: "primaer",
  hakenIcon: "hintergrund",
  kreisRahmen: "sekundaer",
  unterKachelFlaeche: "ghost",
  buchDunkel: "primaer",
  buchAkzent: "action",
  sonderPilleFlaeche: "ghost",
  sonderPilleSchrift: "tertiaer",
  sonderPilleGewaehltSchrift: "primaer",
  sonderGewaehlt: "dunkelbraun",
  exemplarFrage: "tertiaer",
  exemplarFlaeche: "ghost",
  exemplarGewaehltFlaeche: "hintergrund",
  exemplarSchrift: "tertiaer",
  exemplarGewaehltSchrift: "dunkelbraun",
};

/** CSS-Ausdruck einer Farbrolle des Reiters „Details“ bzw. des Fensters „Format“. */
export const detailsFarbe = (rolle: DetailsFarbrolle): string =>
  rubrikFarbe(detailsFarbrollen[rolle]);

/** Blasse Fläche einer gewählten Sonderausgabe (Referenzbild), aus „Primär“ und „Hintergrund“ gemischt. */
export const sonderPilleGewaehltFlaeche = `color-mix(in srgb, ${rubrikFarbe("primaer")} 14%, ${rubrikFarbe("hintergrund")})`;

/** Helles Buch (Taschenbuch, Kleinformat) im Fenster „Format“, aus „Primär“ und „Hintergrund“ gemischt. */
export const buchHellFlaeche = `color-mix(in srgb, ${rubrikFarbe("primaer")} 45%, ${rubrikFarbe("hintergrund")})`;

/** Farbrollen „Barcode scannen“: Scan-Bildschirm (REQ-061) und Auswahlfenster (REQ-062), nur bestehende Rubriken. */
export type BarcodeFarbrolle =
  | "scanFlaeche"
  | "scanText"
  | "scanRahmen"
  | "schliessenFlaeche"
  | "schliessenIcon"
  | "lampeFlaeche"
  | "lampeIcon"
  | "auswahlFlaeche"
  | "auswahlUeberschrift"
  | "auswahlText"
  | "trefferFlaeche"
  | "trefferRahmen"
  | "trefferTitel"
  | "trefferText"
  | "quelle"
  | "zurueckIcon";

/** Aus welcher Farbrubrik jede Farbrolle „Barcode scannen“ ihre Farbe bezieht (nach REF-barcode-01-scan). */
export const barcodeFarbrollen: Record<BarcodeFarbrolle, FarbrubrikId> = {
  // Fläche nur sichtbar, wenn kein natives Kamerabild dahinter liegt (Web, Start der Kamera).
  scanFlaeche: "dunkelbraun",
  scanText: "hintergrund",
  scanRahmen: "hintergrund",
  schliessenFlaeche: "hintergrund",
  schliessenIcon: "dunkelbraun",
  lampeFlaeche: "dunkelbraun",
  lampeIcon: "hintergrund",
  auswahlFlaeche: "hintergrund",
  auswahlUeberschrift: "dunkelbraun",
  auswahlText: "tertiaer",
  trefferFlaeche: "ghost",
  trefferRahmen: "ghostframe",
  trefferTitel: "dunkelbraun",
  trefferText: "tertiaer",
  quelle: "primaer",
  zurueckIcon: "dunkelbraun",
};

/** CSS-Ausdruck einer Farbrolle „Barcode scannen“. */
export const barcodeFarbe = (rolle: BarcodeFarbrolle): string =>
  rubrikFarbe(barcodeFarbrollen[rolle]);

/** Weicher, warmer Schatten von Karten statt eines harten Rahmens (REQ-065 AK-11). */
export const kartenSchatten = `0 1px 2px color-mix(in srgb, ${schattenFarbe} 10%, transparent), 0 6px 18px color-mix(in srgb, ${schattenFarbe} 12%, transparent)`;

/** Farbrollen der 3D-Ansicht (REQ-074, REQ-076, REQ-078). */
export type Ansicht3dFarbrolle =
  | "modellFlaeche"
  | "modellTitel"
  | "schleier"
  | "titel"
  | "autor"
  | "schliessenFlaeche"
  | "schliessenIcon"
  | "pilleFlaeche"
  | "pilleSchrift"
  | "hinweisFlaeche"
  | "hinweisSchrift";

/**
 * Aus welcher Farbrubrik jede Farbrolle der 3D-Ansicht ihre Farbe bezieht. Cover, Rücken und Rückseite ohne
 * Bild sind „Primär“ (REQ-076); alle übrigen Zuordnungen prüft der CEO im Prototyp.
 */
export const ansicht3dFarbrollen: Record<Ansicht3dFarbrolle, FarbrubrikId> = {
  modellFlaeche: "primaer",
  modellTitel: "hintergrund",
  schleier: "hintergrund",
  titel: "dunkelbraun",
  autor: "tertiaer",
  schliessenFlaeche: "hintergrund",
  schliessenIcon: "dunkelbraun",
  pilleFlaeche: "tertiaer",
  pilleSchrift: "hintergrund",
  hinweisFlaeche: "dunkelbraun",
  hinweisSchrift: "hintergrund",
};

/** CSS-Ausdruck einer Farbrolle der 3D-Ansicht, z. B. `var(--bz-farbe-primaer)`. */
export const ansicht3dFarbe = (rolle: Ansicht3dFarbrolle): string =>
  rubrikFarbe(ansicht3dFarbrollen[rolle]);

/** Farbrollen des Seitenmusters (Buchseiten: Schnitt, Ober- und Unterkante ohne Bild). */
export type SeitenmusterFarbrolle = "flaeche" | "linie";

/**
 * Feste, designunabhängige Farben des Seitenmusters (CEO-Vorgabe 2026-11-22: Buchseiten immer warmweiß,
 * egal welches Design). Standardwerte auf Zuruf – werden von den Farbdesigns NICHT überschrieben,
 * deshalb direkte Farbwerte statt CSS-Variable einer Farbrubrik.
 */
export const seitenmusterFarben: Record<SeitenmusterFarbrolle, Farbrubrik> = {
  flaeche: { name: "Seiten Fläche", wert: "#F4EDE0" },
  linie: { name: "Seiten Linie", wert: "#E2D6C2" },
};

/** Farbwert einer Farbrolle des Seitenmusters (unabhängig vom aktiven Farbdesign). */
export const seitenmusterFarbe = (rolle: SeitenmusterFarbrolle): string =>
  seitenmusterFarben[rolle].wert;

/** Schatten unter dem 3D-Modell bzw. der X-Schaltfläche, aus „Dunkelbraun“ abgeleitet. */
export const ansicht3dSchatten = `0 6px 18px color-mix(in srgb, ${schattenFarbe} 22%, transparent)`;

/** Farbrollen der Seite „Statistik“ (REQ-079 bis REQ-090), Zuordnung nach REF-statistik-01 bis -07. */
export type StatistikFarbrolle =
  | "ueberschrift"
  | "pillenleisteFlaeche"
  | "pillenleisteRahmen"
  | "pilleAktivFlaeche"
  | "pilleAktivSchrift"
  | "pilleInaktivSchrift"
  | "pfeilRahmen"
  | "pfeilIcon"
  | "zeitraumTitel"
  | "zeitraumJahr"
  | "karteFlaeche"
  | "karteRahmen"
  | "kachelFlaeche"
  | "kachelRahmen"
  | "kachelGewaehltRahmen"
  | "kachelZahl"
  | "kachelBezeichnung"
  | "kennzahl"
  | "kennzahlEinheit"
  | "vergleich"
  | "hilfslinie"
  | "skala"
  | "balkenLeer"
  | "balkenSessions"
  | "balkenBeendet"
  | "balkenBuecher"
  | "achse"
  | "legende"
  | "serieText"
  | "serieZahl"
  | "wochentag"
  | "tagFlaeche"
  | "tagZahl"
  | "heuteRahmen"
  | "monatKuerzel"
  | "miniFeld"
  | "lesetagFeld";

/** Aus welcher Farbrubrik jede Farbrolle der Seite „Statistik“ ihre Farbe bezieht (neu nur „Gold“, REQ-084/REQ-090). */
export const statistikFarbrollen: Record<StatistikFarbrolle, FarbrubrikId> = {
  ueberschrift: "dunkelbraun",
  pillenleisteFlaeche: "kartenflaeche",
  pillenleisteRahmen: "sekundaer",
  pilleAktivFlaeche: "primaer",
  pilleAktivSchrift: "hintergrund",
  pilleInaktivSchrift: "tertiaer",
  pfeilRahmen: "sekundaer",
  pfeilIcon: "tertiaer",
  zeitraumTitel: "dunkelbraun",
  zeitraumJahr: "tertiaer",
  karteFlaeche: "kartenflaeche",
  karteRahmen: "sekundaer",
  kachelFlaeche: "kartenflaeche",
  kachelRahmen: "sekundaer",
  kachelGewaehltRahmen: "primaer",
  kachelZahl: "dunkelbraun",
  kachelBezeichnung: "tertiaer",
  kennzahl: "dunkelbraun",
  kennzahlEinheit: "tertiaer",
  vergleich: "tertiaer",
  hilfslinie: "ghostframe",
  skala: "tertiaer",
  balkenLeer: "ghostframe",
  balkenSessions: "primaer",
  balkenBeendet: "gold",
  balkenBuecher: "primaer",
  achse: "tertiaer",
  legende: "tertiaer",
  serieText: "tertiaer",
  serieZahl: "dunkelbraun",
  wochentag: "tertiaer",
  tagFlaeche: "ghost",
  tagZahl: "tertiaer",
  heuteRahmen: "primaer",
  monatKuerzel: "tertiaer",
  miniFeld: "ghost",
  lesetagFeld: "primaer",
};

/** CSS-Ausdruck einer Farbrolle der Seite „Statistik“, z. B. `var(--bz-farbe-gold)`. */
export const statistikFarbe = (rolle: StatistikFarbrolle): string =>
  rubrikFarbe(statistikFarbrollen[rolle]);

/** Blasse Fläche der gewählten Kachel (REF-statistik-01), aus „Primär“ und „Kartenfläche“ gemischt. */
export const statistikKachelGewaehltFlaeche = `color-mix(in srgb, ${rubrikFarbe("primaer")} 14%, ${rubrikFarbe("kartenflaeche")})`;

/**
 * Farbrollen der Listen (Sagas, Sammlungen, Bibliotheken): Abschnitt in den Buchdetails, Blatt „Zu einer …
 * hinzufügen“, Listenübersicht, geöffnete Liste und Saga-Zeile unter dem Autor (REQ-095 bis REQ-099).
 */
export type ListenFarbrolle =
  | "ueberschrift"
  | "zurueckIcon"
  | "plusFlaeche"
  | "plusIcon"
  | "stift"
  | "karteFlaeche"
  | "trennlinie"
  | "name"
  | "anzahl"
  | "leerText"
  | "haekchenRahmen"
  | "haekchenFlaeche"
  | "haekchenIcon"
  | "bandBeschriftung"
  | "bandFeldFlaeche"
  | "bandFeldRahmen"
  | "bandFeldSchrift"
  | "fehler"
  | "loeschenSchrift"
  | "rueckfrageText"
  | "neinFlaeche"
  | "neinSchrift"
  | "sagaZeile"
  | "auswahlFlaeche"
  | "auswahlRahmen"
  | "bildFeldFlaeche"
  | "bildFeldRahmen"
  | "bildFeldInhalt";

/** Aus welcher Farbrubrik jede Farbrolle der Listen ihre Farbe bezieht (nur bestehende Rubriken). */
export const listenFarbrollen: Record<ListenFarbrolle, FarbrubrikId> = {
  ueberschrift: "dunkelbraun",
  zurueckIcon: "dunkelbraun",
  plusFlaeche: "primaer",
  plusIcon: "hintergrund",
  stift: "primaer",
  karteFlaeche: "kartenflaeche",
  trennlinie: "sekundaer",
  name: "dunkelbraun",
  anzahl: "tertiaer",
  leerText: "tertiaer",
  haekchenRahmen: "sekundaer",
  haekchenFlaeche: "primaer",
  haekchenIcon: "hintergrund",
  bandBeschriftung: "tertiaer",
  bandFeldFlaeche: "ghost",
  bandFeldRahmen: "ghostframe",
  bandFeldSchrift: "dunkelbraun",
  // Ungültiges Feld (Band, Name) wie das ungültige Feld im Blatt „ISBN“ (REQ-063): Primär.
  fehler: "primaer",
  loeschenSchrift: "primaer",
  rueckfrageText: "dunkelbraun",
  neinFlaeche: "ghost",
  neinSchrift: "dunkelbraun",
  // „Band 1 · The Empyrean“ unter dem Autor (REQ-099) wie die Autorzeile in Tertiär.
  sagaZeile: "tertiaer",
  // Markiertes Buch im Blatt „Bücher auswählen“ (REQ-098, AK-7): Fläche Ghost, Rahmen Primär.
  auswahlFlaeche: "ghost",
  auswahlRahmen: "primaer",
  // Bildfeld im Blatt „Liste bearbeiten“ (REQ-100) wie das Feld „Cover hinzufügen“ (REQ-032).
  bildFeldFlaeche: "ghost",
  bildFeldRahmen: "ghostframe",
  bildFeldInhalt: "tertiaer",
};

/** CSS-Ausdruck einer Farbrolle der Listen. */
export const listenFarbe = (rolle: ListenFarbrolle): string =>
  rubrikFarbe(listenFarbrollen[rolle]);

/** Farbrollen der Startseite (REQ-101 bis REQ-104, REQ-106). */
export type StartFarbrolle =
  | "datum"
  | "gruss"
  | "tageszeitIcon"
  | "abschnittsueberschrift"
  | "karteFlaeche"
  | "buchtitel"
  | "autor"
  | "leerText"
  | "jahreszielText"
  | "jahreszielFestlegen"
  | "zitatText"
  | "zitatQuelle"
  | "zitatZeichen";

export const startFarbrollen: Record<StartFarbrolle, FarbrubrikId> = {
  datum: "tertiaer",
  gruss: "dunkelbraun",
  // Tageszeit-Icon in der Akzentfarbe (REQ-101, AK-5: Farbrubrik „Primär“).
  tageszeitIcon: "primaer",
  abschnittsueberschrift: "tertiaer",
  karteFlaeche: "kartenflaeche",
  buchtitel: "dunkelbraun",
  autor: "tertiaer",
  // Hinweis „Gerade kein Buch offen“ wie Platzhaltertexte (REQ-004) in Tertiär.
  leerText: "tertiaer",
  jahreszielText: "dunkelbraun",
  jahreszielFestlegen: "primaer",
  zitatText: "dunkelbraun",
  zitatQuelle: "tertiaer",
  zitatZeichen: "primaer",
};

/** CSS-Ausdruck einer Farbrolle der Startseite. */
export const startFarbe = (rolle: StartFarbrolle): string =>
  rubrikFarbe(startFarbrollen[rolle]);

/** Farbrollen des Reiters „Notizbuch“ und des Blatts „Zitat“ (REQ-105). */
export type NotizbuchFarbrolle =
  | "zitatText"
  | "sprecher"
  | "seite"
  | "trennlinie"
  | "plusFlaeche"
  | "plusIcon"
  | "feldFehler"
  | "loeschenSchrift";

export const notizbuchFarbrollen: Record<NotizbuchFarbrolle, FarbrubrikId> = {
  zitatText: "dunkelbraun",
  sprecher: "tertiaer",
  seite: "tertiaer",
  trennlinie: "ghostframe",
  plusFlaeche: "primaer",
  plusIcon: "hintergrund",
  // Leeres Zitat bzw. ungültige Seite wie das ungültige Feld im Blatt „ISBN“ (REQ-063): Primär.
  feldFehler: "primaer",
  loeschenSchrift: "primaer",
};

/** CSS-Ausdruck einer Farbrolle des Reiters „Notizbuch“. */
export const notizbuchFarbe = (rolle: NotizbuchFarbrolle): string =>
  rubrikFarbe(notizbuchFarbrollen[rolle]);
