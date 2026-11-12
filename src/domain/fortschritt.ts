/**
 * Lesefortschritt, Sitzungen und Streak eines Buches (REQ-023 bis REQ-027). Reine Fachlogik ohne UI und Speicher.
 */
import type { Buch, Fortschrittsmodus, Sitzung } from './buch';

/** Gespeicherter Fortschrittsmodus; ohne Angabe „seite“ (REQ-024, AK-3). */
export const modusVon = (buch: Buch): Fortschrittsmodus => buch.fortschrittsmodus ?? 'seite';

/** Ob ein Fortschrittsbalken angezeigt wird: nur mit Seitenanzahl (REQ-023). */
export const hatSeitenanzahl = (buch: Buch): boolean => buch.seitenanzahl !== undefined && buch.seitenanzahl > 0;

/**
 * Exakter Fortschritt in Prozent (0–100, nicht gerundet): Modus „Seite“ aktuelle Seite / Seitenanzahl,
 * Modus „%“ der Prozentwert. Ohne Seitenanzahl bzw. ohne Fortschritt 0 (REQ-023, REQ-026).
 */
export function fortschrittExakt(buch: Buch): number {
  if (!hatSeitenanzahl(buch)) return 0;
  const wert = modusVon(buch) === 'prozent' ? (buch.fortschrittProzent ?? 0) : ((buch.aktuelleSeite ?? 0) * 100) / buch.seitenanzahl!;
  return Math.min(100, Math.max(0, wert));
}

/** Kaufmännisch auf eine ganze Zahl gerundet (nur nichtnegative Werte). */
export const kaufmaennisch = (wert: number): number => Math.floor(wert + 0.5);

/** Fortschritt als ganze Prozentzahl für die Statistik-Pille (REQ-026). */
export const fortschrittGerundet = (buch: Buch): number => kaufmaennisch(fortschrittExakt(buch));

/** Angabe unter dem Balken: „42 / 400“ bzw. „5 %“ (REQ-023). */
export function fortschrittText(buch: Buch): string {
  if (modusVon(buch) === 'prozent') return `${buch.fortschrittProzent ?? 0} %`;
  return `${buch.aktuelleSeite ?? 0} / ${buch.seitenanzahl ?? 0}`;
}

/** Gespeicherter Eingabewert für das Menü „Aktuelle Seite“ im gespeicherten Modus; sonst leer (REQ-024). */
export function gespeicherteEingabe(buch: Buch): string {
  const wert = modusVon(buch) === 'prozent' ? buch.fortschrittProzent : buch.aktuelleSeite;
  return wert === undefined ? '' : String(wert);
}

/** Rechnet eine Eingabe beim Moduswechsel um (kaufmännisch gerundet); leer bleibt leer (REQ-024, AK-9). */
export function umrechnen(eingabe: string, von: Fortschrittsmodus, nach: Fortschrittsmodus, seitenanzahl: number): string {
  // Leer bleibt leer; ungültige Eingaben (keine ganze Zahl ab 0) bleiben stehen und werden beim Sichern abgelehnt.
  if (!/^\d+$/.test(eingabe) || von === nach || !(seitenanzahl > 0)) return eingabe;
  const wert = Number(eingabe);
  const ergebnis = nach === 'prozent' ? (wert * 100) / seitenanzahl : (wert * seitenanzahl) / 100;
  return String(kaufmaennisch(ergebnis));
}

/** Obergrenze der Eingabe im jeweiligen Modus (REQ-024: Seitenanzahl bzw. 100). */
export const obergrenze = (modus: Fortschrittsmodus, seitenanzahl: number): number => (modus === 'prozent' ? 100 : seitenanzahl);

export type FortschrittPruefung = { ok: true; wert: number } | { ok: false; grund: 'leer' | 'zuGross' | 'ungueltig' };

/** Prüft eine Eingabe im Menü „Aktuelle Seite“: ganze Zahl von 0 bis zur Obergrenze (REQ-024). */
export function fortschrittPruefen(eingabe: string, modus: Fortschrittsmodus, seitenanzahl: number): FortschrittPruefung {
  const text = eingabe.trim();
  if (text === '') return { ok: false, grund: 'leer' };
  if (!/^\d+$/.test(text)) return { ok: false, grund: 'ungueltig' };
  const wert = Number(text);
  if (wert > obergrenze(modus, seitenanzahl)) return { ok: false, grund: 'zuGross' };
  return { ok: true, wert };
}

/**
 * Ergebnis des Sicherns im Menü „Aktuelle Seite“: neuer Fortschritt und Modus; bei einer Erhöhung
 * des Fortschrittsanteils kommt eine Sitzung mit dem Zeitpunkt `jetzt` hinzu (REQ-024, AK-12/AK-13).
 */
export function fortschrittSichern(buch: Buch, modus: Fortschrittsmodus, wert: number, jetzt: Date): Buch {
  const vorher = fortschrittExakt(buch);
  const neu: Buch = { ...buch, fortschrittsmodus: modus };
  if (modus === 'prozent') {
    neu.fortschrittProzent = wert;
    delete neu.aktuelleSeite;
  } else {
    neu.aktuelleSeite = wert;
    delete neu.fortschrittProzent;
  }
  const nachher = fortschrittExakt(neu);
  const sitzungen: Sitzung[] = [...(buch.sitzungen ?? [])];
  if (nachher > vorher) sitzungen.push({ zeitpunkt: jetzt.toISOString() });
  if (sitzungen.length > 0) neu.sitzungen = sitzungen;
  return neu;
}

/** Prüft die Seitenanzahl im Menü „Buchlänge“: ganze Zahl ab 1 (REQ-025). */
export function seitenanzahlPruefen(eingabe: string): { ok: true; wert: number } | { ok: false; grund: 'leer' | 'ungueltig' } {
  const text = eingabe.trim();
  if (text === '') return { ok: false, grund: 'leer' };
  if (!/^\d+$/.test(text) || Number(text) < 1) return { ok: false, grund: 'ungueltig' };
  return { ok: true, wert: Number(text) };
}

/** Kalendertag nach lokaler Gerätezeit als Schlüssel „JJJJ-M-T“ (REQ-027, AK-6). */
const tagSchluessel = (d: Date): string => `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;

/** Derselbe lokale Kalendertag um `tage` verschoben (sommerzeitfest über das Kalenderdatum). */
const tagVerschieben = (d: Date, tage: number): Date => new Date(d.getFullYear(), d.getMonth(), d.getDate() + tage, 12);

/**
 * Streak eines Buches: Anzahl lückenlos aufeinanderfolgender Lesetage (lokale Kalendertage mit mindestens
 * einer Sitzung), die heute oder gestern enden; sonst 0 (REQ-027).
 */
export function streak(sitzungen: readonly Sitzung[] | undefined, jetzt: Date): number {
  const tage = new Set<string>();
  for (const s of sitzungen ?? []) {
    const d = new Date(s.zeitpunkt);
    if (!Number.isNaN(d.getTime())) tage.add(tagSchluessel(d));
  }
  let tag = tagVerschieben(jetzt, 0);
  if (!tage.has(tagSchluessel(tag))) {
    tag = tagVerschieben(tag, -1);
    if (!tage.has(tagSchluessel(tag))) return 0;
  }
  let anzahl = 0;
  while (tage.has(tagSchluessel(tag))) {
    anzahl += 1;
    tag = tagVerschieben(tag, -1);
  }
  return anzahl;
}
