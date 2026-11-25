/**
 * Seite „Statistik“ (REQ-079 bis REQ-089): reine Fachlogik ohne UI und Speicher.
 * Alle Tage sind Kalendertage nach lokaler Gerätezeit, Schlüssel „JJJJ-MM-TT“ (siehe `kalendertag`).
 * Tage werden intern als Date um 12:00 Uhr lokaler Zeit geführt (sommerzeitfest).
 */
import type { EinstellungRepository } from '../storage';
import { kalendertag, type Buch } from './buch';
import { hatSeitenanzahl, streak } from './fortschritt';

// ---------------------------------------------------------------------------------------------------------------
// Zeiträume (REQ-079, REQ-080)
// ---------------------------------------------------------------------------------------------------------------

export type Zeitraumart = 'woche' | 'monat' | 'jahr';

/** Pillen in fester Reihenfolge (REQ-079, AK-2). */
export const ZEITRAUM_PILLEN: readonly { art: Zeitraumart; text: string }[] = [
  { art: 'woche', text: 'Wöchentlich' },
  { art: 'monat', text: 'Monatlich' },
  { art: 'jahr', text: 'Jährlich' },
];

/** Ohne gespeicherte Wahl ist „Wöchentlich“ aktiv (REQ-079, AK-4). */
export const STANDARD_ZEITRAUMART: Zeitraumart = 'woche';

export const istZeitraumart = (wert: unknown): wert is Zeitraumart => wert === 'woche' || wert === 'monat' || wert === 'jahr';

/** Gemerkte Zeitraum-Pille lesen (REQ-079); fehlend oder ungültig → „Wöchentlich“. */
export async function zeitraumartLesen(repo: EinstellungRepository): Promise<Zeitraumart> {
  const wert = await repo.lesen('statistikZeitraum');
  return istZeitraumart(wert) ? wert : STANDARD_ZEITRAUMART;
}

/** Gewählte Zeitraum-Pille dauerhaft merken (REQ-079, AK-3). */
export function zeitraumartSpeichern(repo: EinstellungRepository, art: Zeitraumart): Promise<void> {
  return repo.speichern('statistikZeitraum', art);
}

/** Gezeigter Zeitraum: erster und letzter Tag (je 12:00 Uhr lokal), beide eingeschlossen. */
export interface Zeitraum {
  art: Zeitraumart;
  start: Date;
  ende: Date;
}

export const MONATE_LANG = [
  'Januar',
  'Februar',
  'März',
  'April',
  'Mai',
  'Juni',
  'Juli',
  'August',
  'September',
  'Oktober',
  'November',
  'Dezember',
] as const;

/** Monatskürzel für Wochentitel (REQ-080) und Jahreskalender (REQ-089). */
export const MONATE_KUERZEL = ['Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez'] as const;

const tag = (j: number, m: number, t: number): Date => new Date(j, m, t, 12);
const plusTage = (d: Date, n: number): Date => tag(d.getFullYear(), d.getMonth(), d.getDate() + n);
/** Wochentag 0 = Montag … 6 = Sonntag. */
export const wochentagMo = (d: Date): number => (d.getDay() + 6) % 7;

/** Zeitraum der Art `art`, der den Tag `datum` enthält; die Woche beginnt am Montag (REQ-080). */
export function zeitraumFuer(art: Zeitraumart, datum: Date): Zeitraum {
  const [j, m, t] = [datum.getFullYear(), datum.getMonth(), datum.getDate()];
  if (art === 'woche') {
    const start = tag(j, m, t - wochentagMo(datum));
    return { art, start, ende: plusTage(start, 6) };
  }
  if (art === 'monat') return { art, start: tag(j, m, 1), ende: tag(j, m + 1, 0) };
  return { art, start: tag(j, 0, 1), ende: tag(j, 11, 31) };
}

/** Vorheriger (`schritte` < 0) bzw. nächster Zeitraum derselben Art, unbegrenzt (REQ-080). */
export function zeitraumVerschieben(z: Zeitraum, schritte: number): Zeitraum {
  const s = z.start;
  if (z.art === 'woche') return zeitraumFuer('woche', plusTage(s, 7 * schritte));
  if (z.art === 'monat') return zeitraumFuer('monat', tag(s.getFullYear(), s.getMonth() + schritte, 1));
  return zeitraumFuer('jahr', tag(s.getFullYear() + schritte, 0, 1));
}

/** Alle Tage des Zeitraums in Reihenfolge (Woche 7, Monat 28–31, Jahr 365/366). */
export function tageImZeitraum(z: Zeitraum): Date[] {
  const tage: Date[] = [];
  const ende = kalendertag(z.ende);
  for (let d = z.start; kalendertag(d) <= ende; d = plusTage(d, 1)) tage.push(d);
  return tage;
}

const imZeitraum = (schluessel: string, z: Zeitraum): boolean => schluessel >= kalendertag(z.start) && schluessel <= kalendertag(z.ende);

/**
 * Zeitraum-Titel (REQ-080): Woche „16 – 22 Nov“ / „2026“ (über Monatsgrenzen „30 Nov – 6 Dez“, Jahr des
 * Sonntags); Monat „November“ / „2026“; Jahr nur „2026“.
 */
export function zeitraumTitel(z: Zeitraum): { zeile1: string; zeile2?: string } {
  const { start, ende } = z;
  if (z.art === 'woche') {
    const kurz = (d: Date) => MONATE_KUERZEL[d.getMonth()];
    const zeile1 =
      start.getMonth() === ende.getMonth()
        ? `${start.getDate()} – ${ende.getDate()} ${kurz(ende)}`
        : `${start.getDate()} ${kurz(start)} – ${ende.getDate()} ${kurz(ende)}`;
    return { zeile1, zeile2: String(ende.getFullYear()) };
  }
  if (z.art === 'monat') return { zeile1: MONATE_LANG[start.getMonth()], zeile2: String(start.getFullYear()) };
  return { zeile1: String(start.getFullYear()) };
}

// ---------------------------------------------------------------------------------------------------------------
// Seiten in Sessions und aus beendeten Büchern (REQ-084), beendete Bücher (REQ-081, REQ-085)
// ---------------------------------------------------------------------------------------------------------------

export interface TagesSeiten {
  inSessions: number;
  ausBeendeten: number;
}

/** Ein Buch gilt als beendet, wenn sein Status *gelesen* ist und es ein „Beendet am“ hat (REQ-081). */
export const istBeendet = (buch: Buch): boolean => buch.status === 'gelesen' && buch.beendetAm !== undefined;

/** Gültige Sitzungen eines Buches, zeitlich aufsteigend, mit Zeitpunkt in ms. */
function sitzungenSortiert(buch: Buch): { ms: number; seite?: number }[] {
  return (buch.sitzungen ?? [])
    .map((s) => ({ ms: Date.parse(s.zeitpunkt), seite: s.seite }))
    .filter((s) => !Number.isNaN(s.ms))
    .sort((a, b) => a.ms - b.ms);
}

/**
 * Seiten je Kalendertag über alle Bücher (REQ-084). Je Buch und Tag: Seite der letzten Sitzung des Tages minus
 * Seite der letzten Sitzung davor (ohne: 0), negativ zählt 0; Sitzungen ohne Seite gelten als 0. Ein beendetes
 * Buch mit Seitenanzahl trägt seine Restseiten (Seitenanzahl − Summe in Sessions, ≥ 0) am Tag „Beendet am“ bei.
 * Mit Seitenanzahl überschreitet die Summe beider Anteile eines Buches nie die Seitenanzahl (keine Doppelzählung).
 */
export function seitenJeTag(buecher: readonly Buch[]): Map<string, TagesSeiten> {
  const ergebnis = new Map<string, TagesSeiten>();
  const eintrag = (schluessel: string): TagesSeiten => {
    let e = ergebnis.get(schluessel);
    if (!e) ergebnis.set(schluessel, (e = { inSessions: 0, ausBeendeten: 0 }));
    return e;
  };
  for (const buch of buecher) {
    const grenze = hatSeitenanzahl(buch) ? buch.seitenanzahl! : Infinity;
    // Letzte Seite je Tag in zeitlicher Reihenfolge.
    const letzteJeTag = new Map<string, number>();
    for (const s of sitzungenSortiert(buch)) letzteJeTag.set(kalendertag(new Date(s.ms)), s.seite ?? 0);
    let vorher = 0;
    let summe = 0;
    for (const [schluessel, seite] of letzteJeTag) {
      const wert = Math.min(Math.max(0, seite - vorher), Math.max(0, grenze - summe));
      if (wert > 0) eintrag(schluessel).inSessions += wert;
      summe += wert;
      vorher = seite;
    }
    if (istBeendet(buch) && hatSeitenanzahl(buch)) {
      const rest = Math.max(0, buch.seitenanzahl! - summe);
      if (rest > 0) eintrag(buch.beendetAm!).ausBeendeten += rest;
    }
  }
  return ergebnis;
}

/** Anzahl der beendeten Bücher je Tag „Beendet am“ (REQ-081, REQ-083). */
function beendeteJeTag(buecher: readonly Buch[]): Map<string, number> {
  const m = new Map<string, number>();
  for (const b of buecher) if (istBeendet(b)) m.set(b.beendetAm!, (m.get(b.beendetAm!) ?? 0) + 1);
  return m;
}

export type Kachel = 'seiten' | 'buecher';

export interface Kennzahlen {
  /** Kachel „Seiten“ = inSessions + ausBeendeten (REQ-081). */
  seiten: number;
  inSessions: number;
  ausBeendeten: number;
  /** Kachel „Bücher“: beendete Bücher mit „Beendet am“ im Zeitraum (REQ-081). */
  buecher: number;
}

/** Kennzahlen der Kacheln „Seiten“ und „Bücher“ für einen Zeitraum (REQ-081). */
export function kennzahlen(buecher: readonly Buch[], z: Zeitraum): Kennzahlen {
  const k: Kennzahlen = { seiten: 0, inSessions: 0, ausBeendeten: 0, buecher: 0 };
  for (const [schluessel, s] of seitenJeTag(buecher)) {
    if (!imZeitraum(schluessel, z)) continue;
    k.inSessions += s.inSessions;
    k.ausBeendeten += s.ausBeendeten;
  }
  k.seiten = k.inSessions + k.ausBeendeten;
  for (const [schluessel, n] of beendeteJeTag(buecher)) if (imZeitraum(schluessel, z)) k.buecher += n;
  return k;
}

/** Wert der gewählten Kachel (REQ-081). */
export const kachelWert = (k: { seiten: number; buecher: number }, kachel: Kachel): number => (kachel === 'seiten' ? k.seiten : k.buecher);

// ---------------------------------------------------------------------------------------------------------------
// Vergleichszeile (REQ-082)
// ---------------------------------------------------------------------------------------------------------------

/** Bezeichnung des vorherigen Zeitraums: „Vorwoche“, Monatsname bzw. Jahr (REQ-082). */
export function vorherBezeichnung(z: Zeitraum): string {
  if (z.art === 'woche') return 'Vorwoche';
  const vorher = zeitraumVerschieben(z, -1).start;
  return z.art === 'monat' ? MONATE_LANG[vorher.getMonth()] : String(vorher.getFullYear());
}

/** Differenz mit Vorzeichen „+“, „−“ (U+2212) bzw. „±0“. */
export const differenzText = (differenz: number): string =>
  differenz > 0 ? `+${differenz}` : differenz < 0 ? `−${-differenz}` : '±0';

/** Vergleichszeile, z. B. „+120 vs. Vorwoche“, „−608 vs. Oktober“, „±0 vs. Oktober“, „+1 vs. 2025“ (REQ-082). */
export function vergleichText(buecher: readonly Buch[], z: Zeitraum, kachel: Kachel): string {
  const jetzt = kachelWert(kennzahlen(buecher, z), kachel);
  const vorher = kachelWert(kennzahlen(buecher, zeitraumVerschieben(z, -1)), kachel);
  return `${differenzText(jetzt - vorher)} vs. ${vorherBezeichnung(z)}`;
}

// ---------------------------------------------------------------------------------------------------------------
// Balkendiagramm (REQ-083, REQ-084)
// ---------------------------------------------------------------------------------------------------------------

export interface Balken {
  /** Achsenbeschriftung; leer = unbeschriftet (Monat: nur 1, 8, 15, 22, 29). */
  beschriftung: string;
  /** Stapelteil „in Sessions“ (Primär) und „aus beendeten Büchern“ (Gold). */
  inSessions: number;
  ausBeendeten: number;
  /** inSessions + ausBeendeten. */
  seiten: number;
  /** Beendete Bücher im Abschnitt. */
  buecher: number;
}

const WOCHE_ACHSE = ['M', 'D', 'M', 'D', 'F', 'S', 'S'];
const JAHR_ACHSE = ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'];
const MONAT_BESCHRIFTET = new Set([1, 8, 15, 22, 29]);

/** Balken des Zeitraums: Woche 7 (Mo–So), Monat je Tag, Jahr 12 (Jan–Dez) (REQ-083). */
export function balken(buecher: readonly Buch[], z: Zeitraum): Balken[] {
  const seiten = seitenJeTag(buecher);
  const beendet = beendeteJeTag(buecher);
  const leer = (beschriftung: string): Balken => ({ beschriftung, inSessions: 0, ausBeendeten: 0, seiten: 0, buecher: 0 });
  const tage = tageImZeitraum(z);
  const abschnitte: Balken[] =
    z.art === 'woche'
      ? WOCHE_ACHSE.map(leer)
      : z.art === 'monat'
        ? tage.map((d) => leer(MONAT_BESCHRIFTET.has(d.getDate()) ? String(d.getDate()) : ''))
        : JAHR_ACHSE.map(leer);
  tage.forEach((d, i) => {
    const b = abschnitte[z.art === 'jahr' ? d.getMonth() : i];
    const schluessel = kalendertag(d);
    const s = seiten.get(schluessel);
    if (s) {
      b.inSessions += s.inSessions;
      b.ausBeendeten += s.ausBeendeten;
    }
    b.buecher += beendet.get(schluessel) ?? 0;
  });
  for (const b of abschnitte) b.seiten = b.inSessions + b.ausBeendeten;
  return abschnitte;
}

/**
 * Hilfslinien-Werte aufsteigend ab 0 (REQ-083, AK-5): Schrittweite 1, 2 oder 5 × 10ⁿ (mindestens 1), etwa drei
 * Abschnitte; der oberste Wert ist ≥ `maximum`. Ohne Werte: [0, 1].
 */
export function hilfslinien(maximum: number): number[] {
  const ziel = Math.max(1, maximum);
  const roh = ziel / 3;
  const groesse = 10 ** Math.floor(Math.log10(roh));
  const schritt = Math.max(1, [1, 2, 5, 10].map((f) => f * groesse).find((s) => s >= roh) ?? 10 * groesse);
  const oben = Math.ceil(ziel / schritt) * schritt;
  const werte: number[] = [];
  for (let w = 0; w <= oben; w += schritt) werte.push(w);
  return werte;
}

// ---------------------------------------------------------------------------------------------------------------
// Lesetage und Serie (REQ-086, REQ-087)
// ---------------------------------------------------------------------------------------------------------------

/** Lesetage aller Bücher: Kalendertage mit mindestens einer Sitzung (nicht „Beendet am“). */
function lesetagSchluessel(buecher: readonly Buch[]): Set<string> {
  const tage = new Set<string>();
  for (const b of buecher) for (const s of sitzungenSortiert(b)) tage.add(kalendertag(new Date(s.ms)));
  return tage;
}

/** „X von N Tagen gelesen“ (REQ-086): X Lesetage im Zeitraum, N Tage des Zeitraums. */
export function lesetage(buecher: readonly Buch[], z: Zeitraum): { gelesen: number; tage: number } {
  const lese = lesetagSchluessel(buecher);
  const tage = tageImZeitraum(z);
  return { gelesen: tage.filter((d) => lese.has(kalendertag(d))).length, tage: tage.length };
}

/** „Serie X Tage“ (REQ-087): Streak-Regel aus REQ-027, buchübergreifend, immer bezogen auf heute. */
export function serie(buecher: readonly Buch[], jetzt: Date): number {
  return streak(
    buecher.flatMap((b) => b.sitzungen ?? []),
    jetzt,
  );
}

// ---------------------------------------------------------------------------------------------------------------
// Kalender Woche/Monat (REQ-088) und Jahreskalender (REQ-089)
// ---------------------------------------------------------------------------------------------------------------

export interface KalenderTag {
  /** Tageszahl 1–31. */
  tag: number;
  /** Kalendertag „JJJJ-MM-TT“. */
  schluessel: string;
  heute: boolean;
  /** Lesetag (mindestens eine Sitzung, REQ-086). */
  gelesen: boolean;
}

export interface KalenderTagMitBuch extends KalenderTag {
  /** Buch mit der zeitlich letzten Sitzung des Tages (Auslegung REQ-088, AK-4); fehlt ohne Sitzung. */
  buch?: Buch;
}

export interface Kalender {
  /** Leere Felder vor dem ersten Tag (= Spalte des ersten Tages, 0 = MO … 6 = SO). */
  versatz: number;
  tage: KalenderTagMitBuch[];
}

/** Wochentagszeile der Kalenderkarte (REQ-088). */
export const KALENDER_WOCHENTAGE = ['MO', 'DI', 'MI', 'DO', 'FR', 'SA', 'SO'] as const;

/** Buch mit der letzten Sitzung je Kalendertag. */
function letztesBuchJeTag(buecher: readonly Buch[]): Map<string, { ms: number; buch: Buch }> {
  const m = new Map<string, { ms: number; buch: Buch }>();
  for (const buch of buecher) {
    for (const s of sitzungenSortiert(buch)) {
      const schluessel = kalendertag(new Date(s.ms));
      const bisher = m.get(schluessel);
      if (!bisher || s.ms >= bisher.ms) m.set(schluessel, { ms: s.ms, buch });
    }
  }
  return m;
}

/** Kalenderkarte für Woche oder Monat mit Buch je Lesetag (REQ-088). Für ein Jahr siehe `jahreskalender`. */
export function kalender(buecher: readonly Buch[], z: Zeitraum, jetzt: Date): Kalender {
  const letzte = letztesBuchJeTag(buecher);
  const heute = kalendertag(jetzt);
  return {
    versatz: wochentagMo(z.start),
    tage: tageImZeitraum(z).map((d) => {
      const schluessel = kalendertag(d);
      const eintrag = letzte.get(schluessel);
      const t: KalenderTagMitBuch = { tag: d.getDate(), schluessel, heute: schluessel === heute, gelesen: eintrag !== undefined };
      if (eintrag) t.buch = eintrag.buch;
      return t;
    }),
  };
}

export interface MiniMonat {
  /** „Jan“, „Feb“, „Mär“ … (REQ-089). */
  kuerzel: string;
  versatz: number;
  tage: KalenderTag[];
}

/** Zwölf Mini-Kalender eines Jahres mit Lesetagen und heutigem Tag (REQ-089). */
export function jahreskalender(buecher: readonly Buch[], jahr: number, jetzt: Date): MiniMonat[] {
  const lese = lesetagSchluessel(buecher);
  const heute = kalendertag(jetzt);
  return MONATE_KUERZEL.map((kuerzel, m) => {
    const z = zeitraumFuer('monat', tag(jahr, m, 1));
    return {
      kuerzel,
      versatz: wochentagMo(z.start),
      tage: tageImZeitraum(z).map((d) => {
        const schluessel = kalendertag(d);
        return { tag: d.getDate(), schluessel, heute: schluessel === heute, gelesen: lese.has(schluessel) };
      }),
    };
  });
}
