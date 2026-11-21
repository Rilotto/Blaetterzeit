// Zentrale Festlegung der Stile (REQ-071). Dies ist die EINZIGE Stelle im Code, an der Stile festgelegt werden.
// Neue Stile nur auf Zuruf des CEO.
//
// Funktionsweise: „Klassisch“ ist der bisherige Stil und steckt in den Inline-Stilen der Komponenten.
// Elemente, die ein Stil umformt, tragen eine Stil-Rolle (`data-stil-rolle`, mehrere durch Leerzeichen getrennt).
// Für jeden anderen Stil erzeugt `stilRegeln()` ein Stylesheet, das an `[data-stil="<id>"]` (gesetzt an <html>
// und an der App-Wurzel) hängt und die Inline-Werte per !important überschreibt. Komponenten fragen den Stil
// deshalb nie selbst ab. Die Mini-Skizzen im Fenster „Design“ nutzen dieselben Regeln über eigene Attribute
// (`data-stil-skizze`, `data-skizze-rolle`), damit die Skizze „Klassisch“ unabhängig vom App-Stil bleibt.

import { rubrikFarbe } from './farben';

export type StilId = 'klassisch' | 'feuilleton';

export interface Stil {
  /** Anzeigename in der Stil-Liste. */
  name: string;
  /** Kurzer kursiver Satz unter dem Namen. */
  satz: string;
}

/** Wählbare Stile (REQ-071). */
export const stile: Record<StilId, Stil> = {
  klassisch: { name: 'Klassisch', satz: 'Karten, Pillen, weiche Schatten' },
  feuilleton: { name: 'Feuilleton', satz: 'Linien statt Karten, wie gedruckt' },
};

/** Reihenfolge in der Stil-Liste (REQ-071). */
export const stilReihenfolge: readonly StilId[] = ['klassisch', 'feuilleton'];

/** Stil ohne Nutzerwahl (REQ-071 AK-3). */
export const standardStil: StilId = 'klassisch';

export const istStilId = (wert: unknown): wert is StilId => typeof wert === 'string' && (stilReihenfolge as readonly string[]).includes(wert);

/**
 * Stil-Rollen: welche Art Element ein Stil umformen darf.
 * - karte: Karten-/Ghost-Fläche (ohne eigene Trennlinie)
 * - eintrag: Eintrag/Zeile einer Liste (Fläche weg, Trennlinie unten)
 * - seitentitel, buchtitel: große Titel
 * - leiste: Hintergrund einer Umschaltpille/Reiterleiste; leistenpille: die wandernde aktive Pille darin
 * - reiter: Filter bzw. Eintrag einer Umschaltpille (aktiv über aria-pressed/aria-selected/data-aktiv)
 * - chip: Status-Chip bzw. Statuspille (zeigt den aktuellen Status, gilt als aktiv)
 * - cover: Cover-Platzhalter
 * - balken, balkenfuellung: Fortschrittsbalken
 * - navigation, navmarke: untere Hauptnavigation und Hervorhebung hinter dem Icon (aktiv über data-highlight)
 * - blatt: Blätter, Fenster und Menüs, die über dem Inhalt liegen
 */
export type StilRolle =
  | 'karte'
  | 'eintrag'
  | 'seitentitel'
  | 'buchtitel'
  | 'leiste'
  | 'leistenpille'
  | 'reiter'
  | 'chip'
  | 'cover'
  | 'balken'
  | 'balkenfuellung'
  | 'navigation'
  | 'navmarke'
  | 'blatt';

/** Attribut für ein Element mit einer oder mehreren Stil-Rollen, z. B. `{...stilRolle('karte', 'eintrag')}`. */
export const stilRolle = (...rollen: StilRolle[]): { 'data-stil-rolle': string } => ({ 'data-stil-rolle': rollen.join(' ') });

/** Attribut für ein Element der Mini-Skizze im Fenster „Design“. */
export const skizzeRolle = (...rollen: StilRolle[]): { 'data-skizze-rolle': string } => ({ 'data-skizze-rolle': rollen.join(' ') });

/** Maße des Stils „Feuilleton“ in px. Standardwerte auf Zuruf, kein Akzeptanzkriterium. */
export const feuilletonMasse = {
  /** Trennlinien und Cover-Rahmen. */
  linie: 1,
  /** Unterstrich aktiver Filter, Reiter und Chips. */
  unterstrich: 2,
  /** Höhe des Fortschrittsbalkens. */
  balken: 2,
  /** Strich über dem aktiven Icon der Hauptnavigation. */
  navStrich: 2,
  /** Sichtbare Breite des Strichs über dem aktiven Icon (die Markierung selbst behält die Klassisch-Breite). */
  navStrichBreite: 24,
} as const;

type Deklarationen = Record<string, string>;

interface Regel {
  rolle: StilRolle;
  /** Zusätzliche Selektoren am selben Element (z. B. Aktiv-Zustand); mehrere = ODER. */
  zustand?: readonly string[];
  deklarationen: Deklarationen;
}

const AKTIV = ['[aria-pressed="true"]', '[aria-selected="true"]', '[data-aktiv="true"]'] as const;

/** Linie ohne Platzbedarf: innenliegender Schatten statt Rahmen, damit Feuilleton die Maße von Klassisch behält (F8). */
const innenlinie = (seite: 'oben' | 'unten', dicke: number, farbe: string): string =>
  `inset 0 ${seite === 'oben' ? dicke : -dicke}px 0 0 ${farbe}`;

/**
 * F8 (CEO 2026-11-21): Feuilleton ändert nur die Optik, nie die Maße. Deshalb setzen die Regeln weder margin,
 * padding, gap, width, height (außer Balkendicke), min-height noch line-height. Rahmenbreiten bleiben wie bei
 * Klassisch (nur die Farbe wird transparent); Trennlinien und Unterstriche sind innenliegende Schatten im
 * vorhandenen Raum. Rahmen nur dort, wo die Größe fest ist und box-sizing: border-box gilt (Cover, Navmarke).
 */
function feuilletonRegeln(): Regel[] {
  const m = feuilletonMasse;
  const ghostframe = rubrikFarbe('ghostframe');
  const primaer = rubrikFarbe('primaer');
  const flaecheWeg: Deklarationen = {
    'background-color': 'transparent',
    'background-image': 'none',
    'box-shadow': 'none',
    // Breite und Art des Klassisch-Rahmens bleiben, damit sich nichts verschiebt; nur unsichtbar.
    'border-color': 'transparent',
    'border-radius': '0',
  };
  const halbStrich = m.navStrichBreite / 2;
  return [
    // F1: keine Karten, Rahmen oder Ghost-Flächen; Einträge durch dünne Linien in GhostFrame getrennt.
    { rolle: 'karte', deklarationen: flaecheWeg },
    { rolle: 'eintrag', deklarationen: { ...flaecheWeg, 'box-shadow': innenlinie('unten', m.linie, ghostframe) } },
    // F2: Seiten- und Buchtitel in normaler Strichstärke; Schriftgrößen wie Klassisch (CEO-Fix 2026-11-21).
    { rolle: 'seitentitel', deklarationen: { 'font-weight': '400' } },
    { rolle: 'buchtitel', deklarationen: { 'font-weight': '400' } },
    // F3/F4: Filter, Umschaltpillen und Status-Chips als Text, aktiv in Primär mit Unterstrich.
    { rolle: 'leiste', deklarationen: { 'background-color': 'transparent', 'box-shadow': 'none', 'border-radius': '0' } },
    { rolle: 'leistenpille', deklarationen: { display: 'none' } },
    { rolle: 'reiter', deklarationen: { ...flaecheWeg, color: rubrikFarbe('tertiaer') } },
    { rolle: 'reiter', zustand: AKTIV, deklarationen: { color: primaer, 'box-shadow': innenlinie('unten', m.unterstrich, primaer) } },
    { rolle: 'chip', deklarationen: { ...flaecheWeg, 'box-shadow': innenlinie('unten', m.unterstrich, primaer), color: primaer } },
    // F5: Cover-Platzhalter nur als dünner Rahmen, eckig (feste Größe mit border-box: Rahmen liegt innen);
    // Fortschrittsbalken dünn (Balkendicke ist die einzige erlaubte Maßänderung).
    {
      rolle: 'cover',
      deklarationen: {
        'background-color': 'transparent',
        'box-shadow': 'none',
        border: `${m.linie}px solid ${ghostframe}`,
        'border-radius': '0',
        'box-sizing': 'border-box',
      },
    },
    { rolle: 'balken', deklarationen: { height: `${m.balken}px`, 'border-radius': '0', overflow: 'visible' } },
    { rolle: 'balkenfuellung', deklarationen: { 'border-radius': '0' } },
    // F6: Hauptnavigation auf „Hintergrund“ mit Trennlinie oben, aktives Icon in Primär mit kurzem Strich darüber.
    {
      rolle: 'navigation',
      deklarationen: {
        'background-color': rubrikFarbe('hintergrund'),
        'box-shadow': innenlinie('oben', m.linie, ghostframe),
        '--bz-nav-aktivfarbe': primaer,
      },
    },
    // Navmarke behält Breite und Höhe von Klassisch (feste Größe, border-box: der Strich liegt innen).
    // Der Strich ist nur in der Mitte sichtbar (Breite navStrichBreite) über ein Rahmenbild.
    {
      rolle: 'navmarke',
      deklarationen: {
        'background-color': 'transparent',
        'border-radius': '0',
        'box-sizing': 'border-box',
        'border-top': `${m.navStrich}px solid transparent`,
      },
    },
    {
      rolle: 'navmarke',
      zustand: ['[data-highlight="active"]'],
      deklarationen: {
        'border-top-color': primaer,
        'border-image': `linear-gradient(to right, transparent calc(50% - ${halbStrich}px), ${primaer} calc(50% - ${halbStrich}px), ${primaer} calc(50% + ${halbStrich}px), transparent calc(50% + ${halbStrich}px)) 1`,
      },
    },
    // F7: Blätter, Fenster und Menüs: eckig, ohne Schatten, mit Trennlinie oben (Fläche bleibt, damit lesbar).
    { rolle: 'blatt', deklarationen: { 'border-radius': '0', 'box-shadow': innenlinie('oben', m.linie, ghostframe) } },
  ];
}

/** Regeln je Stil; „Klassisch“ hat keine (bisheriges Aussehen aus den Inline-Stilen, REQ-071 AK-3). */
const regelnJeStil: Record<StilId, () => Regel[]> = {
  klassisch: () => [],
  feuilleton: feuilletonRegeln,
};

const block = (selektoren: string[], d: Deklarationen): string =>
  `${selektoren.join(',\n')} {\n${Object.entries(d)
    .map(([k, v]) => `  ${k}: ${v} !important;`)
    .join('\n')}\n}`;

function selektoren(stil: StilId, r: Regel): string[] {
  const zustaende = r.zustand ?? [''];
  return zustaende.flatMap((z) => [
    `[data-stil="${stil}"] [data-stil-rolle~="${r.rolle}"]${z}`,
    `[data-stil-skizze="${stil}"] [data-skizze-rolle~="${r.rolle}"]${z}`,
  ]);
}

/** Stylesheet aller Stile (CSS-Text), wird einmal vom DesignAnbieter eingebunden. */
export function stilRegeln(): string {
  return stilReihenfolge
    .flatMap((stil) => regelnJeStil[stil]().map((r) => block(selektoren(stil, r), r.deklarationen)))
    .join('\n');
}
