/**
 * Zitate im Reiter „Notizbuch“ (REQ-105) und „Zitat des Tages“ (REQ-106). Reine Fachlogik ohne UI und Speicher.
 */

/** Ein Zitat zu einem Buch (REQ-105). IDs sind UUIDs. */
export interface Zitat {
  id: string;
  buchId: string;
  /** Zitattext, mehrzeilig, ohne Längenbegrenzung; nie leer bzw. nur Leerzeichen. */
  text: string;
  /** „Wer sagt es?“, freier Text; fehlt ohne Angabe. */
  sprecher?: string;
  /** Seite, ganze Zahl ≥ 1; fehlt ohne Angabe. */
  seite?: number;
  /** ISO-Zeitpunkt des Anlegens (Reihenfolge des Anlegens bei gleicher bzw. ohne Seite). */
  angelegtAm: string;
}

/**
 * Anzeigetext eines Zitats in deutschen Anführungszeichen „…“ (REQ-105 AK-2, REQ-106 AK-2). Nur für die Anzeige:
 * Gespeichert und im Feld „Zitat“ bleibt der Text ohne diese Zeichen. Eigene Anführungszeichen bleiben unverändert.
 */
export const zitatAnzeige = (text: string): string => `\u201E${text}\u201C`;

const istText = (w: unknown): w is string => typeof w === 'string';
export const istSeite = (w: unknown): w is number => typeof w === 'number' && Number.isInteger(w) && w >= 1;

/** Prüft und bereinigt einen gespeicherten bzw. übergebenen Datensatz; ungültig → `undefined`. */
export function zitatAusDaten(daten: unknown): Zitat | undefined {
  if (typeof daten !== 'object' || daten === null) return undefined;
  const d = daten as Record<string, unknown>;
  if (!istText(d.id) || d.id === '' || !istText(d.buchId) || d.buchId === '') return undefined;
  if (!istText(d.text) || d.text.trim() === '') return undefined;
  if (!istText(d.angelegtAm) || Number.isNaN(Date.parse(d.angelegtAm))) return undefined;
  const z: Zitat = { id: d.id, buchId: d.buchId, text: d.text, angelegtAm: d.angelegtAm };
  if (istText(d.sprecher) && d.sprecher.trim() !== '') z.sprecher = d.sprecher;
  const seite = typeof d.seite === 'string' ? Number(d.seite) : d.seite;
  if (istSeite(seite)) z.seite = seite;
  return z;
}

/** Reihenfolge des Anlegens: Zeitpunkt, bei Gleichstand die ID (stabil über Neustarts). */
const nachAnlegen = (a: Zitat, b: Zitat): number =>
  a.angelegtAm < b.angelegtAm ? -1 : a.angelegtAm > b.angelegtAm ? 1 : a.id < b.id ? -1 : a.id > b.id ? 1 : 0;

/**
 * Sortierung im Abschnitt „Zitate“ (REQ-105, AK-5): aufsteigend nach Seite, ohne Seite am Ende;
 * bei gleicher bzw. ohne Seite in der Reihenfolge des Anlegens.
 */
export function zitateSortiert(zitate: readonly Zitat[]): Zitat[] {
  return [...zitate].sort((a, b) => {
    const sa = a.seite ?? Number.POSITIVE_INFINITY;
    const sb = b.seite ?? Number.POSITIVE_INFINITY;
    return sa !== sb ? sa - sb : nachAnlegen(a, b);
  });
}

/**
 * Zeitpunkt für ein neues Zitat: `jetzt`, mindestens aber 1 ms nach dem jüngsten vorhandenen Zitat. So bleibt die
 * Reihenfolge des Anlegens eindeutig, auch wenn mehrere Zitate in derselben Millisekunde entstehen.
 */
export function anlegeZeitpunkt(vorhandene: readonly Zitat[], jetzt: Date): string {
  let ms = jetzt.getTime();
  for (const z of vorhandene) {
    const t = Date.parse(z.angelegtAm);
    if (Number.isFinite(t) && t >= ms) ms = t + 1;
  }
  return new Date(ms).toISOString();
}

/** Anzeige der Seite: „S. 312“. */
export const seitenText = (seite: number): string => `S. ${seite}`;

/** Eingaben des Blatts „Zitat“ (REQ-105). */
export interface ZitatEingabe {
  text: string;
  sprecher: string;
  seite: string;
}

export type ZitatPruefung =
  | { ok: true; werte: { text: string; sprecher?: string; seite?: number } }
  | { ok: false; fehler: { text: boolean; seite: boolean } };

/**
 * Prüft das Blatt „Zitat“ (REQ-105): Zitat Pflicht (nicht leer, nicht nur Leerzeichen), Seite leer oder ganze Zahl
 * ≥ 1. „Wer sagt es?“ wird an den Rändern bereinigt; leer = kein Sprecher.
 */
export function zitatPruefen(e: ZitatEingabe): ZitatPruefung {
  const textFehler = e.text.trim() === '';
  const seiteRoh = e.seite.trim();
  const seiteFehler = seiteRoh !== '' && (!/^\d+$/.test(seiteRoh) || Number(seiteRoh) < 1);
  if (textFehler || seiteFehler) return { ok: false, fehler: { text: textFehler, seite: seiteFehler } };
  const werte: { text: string; sprecher?: string; seite?: number } = { text: e.text };
  const sprecher = e.sprecher.trim();
  if (sprecher !== '') werte.sprecher = sprecher;
  if (seiteRoh !== '') werte.seite = Number(seiteRoh);
  return { ok: true, werte };
}

/** Übernimmt geprüfte Werte in ein (neues oder vorhandenes) Zitat; geleerte Angaben entfallen (REQ-093). */
export function zitatMitWerten(basis: Pick<Zitat, 'id' | 'buchId' | 'angelegtAm'>, werte: { text: string; sprecher?: string; seite?: number }): Zitat {
  const z: Zitat = { id: basis.id, buchId: basis.buchId, angelegtAm: basis.angelegtAm, text: werte.text };
  if (werte.sprecher !== undefined) z.sprecher = werte.sprecher;
  if (werte.seite !== undefined) z.seite = werte.seite;
  return z;
}

/** Fortlaufende Nummer des lokalen Kalendertags (Tage seit 1970-01-01, sommerzeitfest). */
export const tagesnummer = (d: Date): number => Math.round(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) / 86_400_000);

/**
 * Standard-Zitat der Kachel „Zitat des Tages“ (REQ-106, AK-1/AK-6/AK-7): erscheint nur, solange kein eigenes Zitat
 * gespeichert ist. Kein gespeichertes Zitat, in keinem Notizbuch, ohne Seite; Antippen öffnet nichts.
 */
export const STANDARD_ZITAT = {
  text: 'Ein Drache ohne seinen Reiter ist tragisch. Ein Reiter ohne seinen Drachen ist tot.',
  sprecher: 'Kodex des Drachenreiters',
  buchtitel: 'Fourth Wing',
} as const;

/** Gemerkte Wahl des Zitats des Tages (über das EinstellungRepository, Schlüssel „zitatDesTages“). */
export interface ZitatDesTagesWahl {
  /** Tagesnummer (siehe `tagesnummer`) des Tages, für den gewählt wurde. */
  tag: number;
  /** ID des gewählten Zitats. */
  id: string;
  /** ID des Zitats des Vortags, falls bekannt (damit eine Neuwahl am selben Tag nicht darauf fällt). */
  vorher?: string;
}

/** Liest eine gemerkte Wahl aus dem gespeicherten Text; ungültig → `undefined`. */
export function wahlAusText(text: string | undefined): ZitatDesTagesWahl | undefined {
  if (!text) return undefined;
  try {
    const d = JSON.parse(text) as Record<string, unknown>;
    if (typeof d.tag !== 'number' || !Number.isInteger(d.tag) || typeof d.id !== 'string') return undefined;
    const w: ZitatDesTagesWahl = { tag: d.tag, id: d.id };
    if (typeof d.vorher === 'string') w.vorher = d.vorher;
    return w;
  } catch {
    return undefined;
  }
}

export const wahlAlsText = (w: ZitatDesTagesWahl): string => JSON.stringify(w);

/**
 * Zitat des Tages (REQ-106): aus allen Zitaten genau eines je lokalem Kalendertag.
 * - Gilt die gemerkte Wahl für heute und gibt es das Zitat noch, bleibt es (ganzer Tag, auch nach Neustart, auch wenn
 *   andere Zitate hinzukommen oder gelöscht werden).
 * - Sonst wird neu gewählt: reihum nach der Reihenfolge des Anlegens (Tagesnummer modulo Anzahl), ohne das Zitat des
 *   Vortags, sofern es mehr als eines gibt. Ist das heutige gelöscht, fällt die Wahl so auf ein anderes vorhandenes.
 * Liefert das Zitat (ohne Zitate `undefined`) und die zu merkende Wahl (`undefined`, wenn sich nichts ändert).
 */
export function zitatDesTagesWaehlen(
  zitate: readonly Zitat[],
  jetzt: Date,
  gemerkt?: ZitatDesTagesWahl,
): { zitat: Zitat | undefined; merken: ZitatDesTagesWahl | undefined } {
  if (zitate.length === 0) return { zitat: undefined, merken: undefined };
  const heute = tagesnummer(jetzt);
  if (gemerkt?.tag === heute) {
    const bleibt = zitate.find((z) => z.id === gemerkt.id);
    if (bleibt) return { zitat: bleibt, merken: undefined };
  }
  // Zitat des Vortags: aus der Wahl von gestern bzw. aus der (gelöschten) Wahl von heute.
  const vortag = gemerkt?.tag === heute - 1 ? gemerkt.id : gemerkt?.tag === heute ? gemerkt.vorher : undefined;
  const geordnet = [...zitate].sort(nachAnlegen);
  const kandidaten = geordnet.length > 1 && vortag !== undefined ? geordnet.filter((z) => z.id !== vortag) : geordnet;
  const n = kandidaten.length;
  const zitat = kandidaten[((heute % n) + n) % n];
  const merken: ZitatDesTagesWahl = { tag: heute, id: zitat.id };
  if (vortag !== undefined) merken.vorher = vortag;
  return { zitat, merken };
}

/** Zitat des Tages ohne gemerkte Wahl (reihum nach Tagesnummer), siehe `zitatDesTagesWaehlen`. */
export const zitatDesTages = (zitate: readonly Zitat[], jetzt: Date): Zitat | undefined => zitatDesTagesWaehlen(zitate, jetzt).zitat;
