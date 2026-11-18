import type { CSSProperties } from 'react';

// Zentrale Typografie- und Maßdefinition der App (REQ-065), analog zu den Farbrubriken in farben.ts.
//
// Dies ist die EINZIGE Stelle im Code, an der Schriftgrößen, das Abstandsraster, der Bildschirmrand,
// die Höhe von Pillen/Schaltflächen, die Mindest-Tippfläche, der Zeilenabstand und die Größe der
// Navigations-Icons stehen. Die Werte sind Standardwerte auf Zuruf (kein Akzeptanzkriterium):
// Sagt der CEO z. B. „Stufe Text auf 16 px“, wird nur der Wert hier geändert.
//
// Elemente beziehen die Werte als CSS-Variablen (z. B. `var(--bz-schriftgroesse-text)`), die an der
// App-Wurzel und an <html> gesetzt werden (typografieVariablen).
//
// Rollen der Schriftgrößenstufen (REQ-065):
//  - seite:     Seitenüberschriften („Deine Bücher“)
//  - abschnitt: Abschnittsüberschriften („Noch zu lesen“, „Sagas“), Überschriften von Menüs und Blättern
//  - titel:     Buchtitel und Titel einzelner Einträge
//  - text:      Fließtext, Eingaben, Beschriftungen von Pillen und Schaltflächen
//  - meta:      Nebenangaben (Autor, Anzahlzeilen, Seitenangaben, Navigationsbeschriftungen)
//  - label:     kleine Kennzeichnungen über Feldern oder Gruppen (Großbuchstaben, gesperrt)

export type Schriftstufe = 'label' | 'meta' | 'text' | 'titel' | 'abschnitt' | 'seite';

/** Reihenfolge der Stufen von klein nach groß. */
export const schriftstufenReihenfolge: readonly Schriftstufe[] = ['label', 'meta', 'text', 'titel', 'abschnitt', 'seite'];

/** Schriftgrößenstufen mit Anzeigename und Standardwert in px. */
export const schriftstufen: Record<Schriftstufe, { name: string; px: number }> = {
  label: { name: 'Label', px: 12 },
  meta: { name: 'Meta', px: 14 },
  text: { name: 'Text', px: 15 },
  titel: { name: 'Titel', px: 17 },
  abschnitt: { name: 'Abschnitt', px: 20 },
  seite: { name: 'Seite', px: 24 },
};

/** Name der CSS-Variable einer Schriftgrößenstufe, z. B. `--bz-schriftgroesse-text`. */
export const schriftstufeVariable = (stufe: Schriftstufe): string => `--bz-schriftgroesse-${stufe}`;

/** CSS-Ausdruck der Schriftgröße einer Stufe, z. B. `var(--bz-schriftgroesse-text)`. */
export const schriftgroesse = (stufe: Schriftstufe): string => `var(${schriftstufeVariable(stufe)})`;

/** Zeichensperrung der Stufe „Label“. */
export const labelSperrung = '0.08em';

/**
 * Vollständiges Textformat einer Stufe (Schriftgröße; bei „Label“ zusätzlich Großbuchstaben und
 * erhöhte Zeichensperrung, REQ-065 AK-7). Jedes Element bezieht seine Schriftgröße hierüber.
 */
export const textstufe = (stufe: Schriftstufe): CSSProperties =>
  stufe === 'label'
    ? { fontSize: schriftgroesse('label'), textTransform: 'uppercase', letterSpacing: labelSperrung }
    : { fontSize: schriftgroesse(stufe) };

/** Abstandsraster in px. */
export type Abstand = 'xs' | 's' | 'm' | 'l' | 'xl';
export const abstandsraster: Record<Abstand, number> = { xs: 4, s: 8, m: 12, l: 16, xl: 24 };

/** Name der CSS-Variable eines Rasterabstands, z. B. `--bz-abstand-m`. */
export const abstandVariable = (a: Abstand): string => `--bz-abstand-${a}`;

/** CSS-Ausdruck eines Rasterabstands, z. B. `var(--bz-abstand-m)`. */
export const abstand = (a: Abstand): string => `var(${abstandVariable(a)})`;

/** Bildschirmrand in px (links und rechts jeder Seite). */
export const bildschirmrandPx = 20;
/** CSS-Ausdruck des Bildschirmrands. */
export const bildschirmrand = 'var(--bz-rand)';

/** Sichtbare Standardhöhe von Pillen und Schaltflächen in px. */
export const pillenhoehePx = 36;
/** CSS-Ausdruck der Pillenhöhe. */
export const pillenhoehe = 'var(--bz-pillenhoehe)';

/** Mindestgröße der antippbaren Fläche in px (REQ-065 AK-9). */
export const tippflaechePx = 44;
/** CSS-Ausdruck der Mindest-Tippfläche. */
export const tippflaeche = 'var(--bz-tippflaeche)';

/** Zeilenabstand für Fließtext (Faktor der Schriftgröße). */
export const zeilenabstandWert = 1.5;
/** CSS-Ausdruck des Zeilenabstands für Fließtext. */
export const zeilenabstand = 'var(--bz-zeilenabstand)';

/** Größe der Icons der Hauptnavigation in px (bisher 24). */
export const navIconPx = 20;
/** CSS-Ausdruck der Größe der Navigations-Icons. */
export const navIconGroesse = 'var(--bz-nav-icon)';

/**
 * Mindest-Tippfläche (REQ-065 AK-9): index.css legt über jedes <button> und jedes Element mit
 * `data-tippflaeche` ein unsichtbares ::before, das die antippbare Fläche auf mindestens 44 × 44 px
 * erweitert, auch wenn die sichtbare Fläche kleiner ist (z. B. 36 px). Antippbare Elemente, die kein
 * <button> sind, erhalten das Attribut: `<div {...tippflaecheAttr} …>`.
 */
export const tippflaecheAttr = { 'data-tippflaeche': '' } as const;

/** Alle Typografie- und Maß-Variablen für App-Wurzel und <html>. */
export function typografieVariablen(): Record<string, string> {
  const vars: Record<string, string> = {};
  for (const stufe of schriftstufenReihenfolge) vars[schriftstufeVariable(stufe)] = `${schriftstufen[stufe].px}px`;
  for (const [a, px] of Object.entries(abstandsraster) as [Abstand, number][]) vars[abstandVariable(a)] = `${px}px`;
  vars['--bz-rand'] = `${bildschirmrandPx}px`;
  vars['--bz-pillenhoehe'] = `${pillenhoehePx}px`;
  vars['--bz-tippflaeche'] = `${tippflaechePx}px`;
  vars['--bz-zeilenabstand'] = String(zeilenabstandWert);
  vars['--bz-nav-icon'] = `${navIconPx}px`;
  return vars;
}

/**
 * Leichte Papier-Körnung des App-Hintergrunds (REQ-065 AK-11): feines Rauschen als SVG-Kachel,
 * halbtransparent über der Farbrubrik „Hintergrund“, daher in jedem Farbdesign passend.
 * Stärke (Deckkraft) ist Standardwert auf Zuruf.
 */
export const papierKoernungDeckkraft = 0.06;
const koernungSvg =
  `<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'>` +
  `<filter id='k'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/>` +
  `<feColorMatrix values='0 0 0 0 0.25  0 0 0 0 0.18  0 0 0 0 0.1  0 0 0 ${papierKoernungDeckkraft * 4} 0'/></filter>` +
  `<rect width='100%' height='100%' filter='url(%23k)' opacity='0.5'/></svg>`;
export const papierKoernung = `url("data:image/svg+xml;utf8,${koernungSvg}")`;
