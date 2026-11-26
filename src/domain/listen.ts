/**
 * Listen: Sagas, Sammlungen und Bibliotheken (REQ-095 bis REQ-099). Reine Fachlogik ohne UI und Speicher.
 * Begriffe siehe docs/glossary.md („Liste“, „Saga“, „Sammlung“, „Bibliothek“, „Bandnummer“).
 */
import { istBandnummer, type Buch } from './buch';
import { alphabetisch } from './uebersicht';

/** Die drei Arten von Listen in fester Reihenfolge (REQ-095: Saga, Sammlung, Bibliothek) mit ihren Texten. */
export const LISTENARTEN = [
  {
    id: 'saga',
    einzahl: 'Saga',
    mehrzahl: 'Sagas',
    pille: '+ Zu einer Saga hinzufügen',
    blatt: 'Zu einer Saga hinzufügen',
    zeile: 'In Saga',
    neu: 'Neue Saga',
  },
  {
    id: 'sammlung',
    einzahl: 'Sammlung',
    mehrzahl: 'Sammlungen',
    pille: '+ Zu einer Sammlung hinzufügen',
    blatt: 'Zu einer Sammlung hinzufügen',
    zeile: 'In Sammlung',
    neu: 'Neue Sammlung',
  },
  {
    id: 'bibliothek',
    einzahl: 'Bibliothek',
    mehrzahl: 'Bibliotheken',
    pille: '+ Zu einer Bibliothek hinzufügen',
    blatt: 'Zu einer Bibliothek hinzufügen',
    zeile: 'In Bibliotheken',
    neu: 'Neue Bibliothek',
  },
] as const;

export type ListenArt = (typeof LISTENARTEN)[number]['id'];
export type ListenArtTexte = (typeof LISTENARTEN)[number];

export const istListenArt = (w: unknown): w is ListenArt => LISTENARTEN.some((a) => a.id === w);
export const listenArt = (id: ListenArt): ListenArtTexte => LISTENARTEN.find((a) => a.id === id)!;

/** Eine Liste: UUID, Art und Name (REQ-095). */
export interface Liste {
  id: string;
  art: ListenArt;
  name: string;
}

/**
 * Ein Buch in einer Liste (REQ-095). Seit REQ-112 gehört die Bandnummer zum Buch (`Buch.bandnummer`), nicht mehr
 * zur Zugehörigkeit; ein Buch hat in allen Sagas denselben Band.
 */
export interface Zugehoerigkeit {
  listeId: string;
  buchId: string;
}

/** Name gültig: nicht leer und nicht nur Leerzeichen (REQ-096, REQ-098). Liefert den bereinigten Namen oder null. */
export function listenNamePruefen(eingabe: string): string | null {
  const name = eingabe.trim();
  return name === '' ? null : name;
}

/** Neue Liste mit UUID; leerer Name wirft. */
export function neueListe(art: ListenArt, name: string): Liste {
  const n = listenNamePruefen(name);
  if (n === null) throw new Error('Listenname darf nicht leer sein');
  return { id: crypto.randomUUID(), art, name: n };
}

/** Liste aus gespeicherten Daten; ungültig → undefined. */
export function listeAusDaten(daten: unknown): Liste | undefined {
  const e = (daten ?? {}) as Record<string, unknown>;
  if (typeof e.id !== 'string' || !istListenArt(e.art) || typeof e.name !== 'string' || e.name.trim() === '') return undefined;
  return { id: e.id, art: e.art, name: e.name };
}

/** Zugehörigkeit aus gespeicherten Daten; ungültig → undefined. Eine alte Bandnummer je Zugehörigkeit wird ignoriert (REQ-112). */
export function zugehoerigkeitAusDaten(daten: unknown): Zugehoerigkeit | undefined {
  const e = (daten ?? {}) as Record<string, unknown>;
  if (typeof e.listeId !== 'string' || typeof e.buchId !== 'string') return undefined;
  return { listeId: e.listeId, buchId: e.buchId };
}

/** Bandangabe aus gespeicherten Daten (Zahl oder Text) → ganze Zahl ≥ 1, sonst undefined. */
const bandAusDaten = (w: unknown): number | undefined => {
  const n = typeof w === 'number' ? w : typeof w === 'string' && w.trim() !== '' ? Number(w) : undefined;
  return istBandnummer(n) ? n : undefined;
};

/**
 * Übernahme der alten Bandnummern je Saga-Zugehörigkeit in die Bandnummer des Buches (REQ-112, AK-10):
 * Hat das Buch bereits eine eigene Bandnummer, bleibt sie. Sonst gilt die kleinste gültige Bandnummer seiner
 * Saga-Zugehörigkeiten. Liefert je Buch-ID die neue Bandnummer (nur Bücher, die eine erhalten).
 * Gemeinsame Regel für die Migrationen (IndexedDB 10, SQLite 12) und die Unit-Tests.
 */
export function bandnummernAusAltenZugehoerigkeiten(
  buecher: readonly { id: string; bandnummer?: unknown }[],
  sagaIds: ReadonlySet<string>,
  alteZugehoerigkeiten: readonly { listeId?: unknown; buchId?: unknown; band?: unknown }[],
): Map<string, number> {
  const kleinste = new Map<string, number>();
  for (const z of alteZugehoerigkeiten) {
    if (typeof z.listeId !== 'string' || typeof z.buchId !== 'string' || !sagaIds.has(z.listeId)) continue;
    const band = bandAusDaten(z.band);
    if (band === undefined) continue;
    const bisher = kleinste.get(z.buchId);
    if (bisher === undefined || band < bisher) kleinste.set(z.buchId, band);
  }
  const ergebnis = new Map<string, number>();
  for (const b of buecher) {
    if (bandAusDaten(b.bandnummer) !== undefined) continue;
    const band = kleinste.get(b.id);
    if (band !== undefined) ergebnis.set(b.id, band);
  }
  return ergebnis;
}

export type BandPruefung = { ok: true; band?: number } | { ok: false };

/** Feld „Band“ (REQ-096): leer oder ganze Zahl ≥ 1 (Leerzeichen am Rand werden ignoriert). */
export function bandPruefen(eingabe: string): BandPruefung {
  const text = eingabe.trim();
  if (text === '') return { ok: true };
  if (!/^\d{1,6}$/.test(text)) return { ok: false };
  const band = Number(text);
  return band >= 1 ? { ok: true, band } : { ok: false };
}

const namenVergleich = new Intl.Collator('de', { sensitivity: 'base', numeric: true });

/** Listen A–Z nach Name (REQ-097, REQ-099; Auslegung). */
export const listenAZ = (listen: readonly Liste[]): Liste[] => [...listen].sort((a, b) => namenVergleich.compare(a.name, b.name));

/** Listen einer Art, A–Z. */
export const listenDerArt = (listen: readonly Liste[], art: ListenArt): Liste[] => listenAZ(listen.filter((l) => l.art === art));

/** Zugehörigkeiten eines Buches. */
export const zugehoerigkeitenVon = (zug: readonly Zugehoerigkeit[], buchId: string): Zugehoerigkeit[] => zug.filter((z) => z.buchId === buchId);

/** Listen der Art, in denen das Buch ist, A–Z (REQ-095). */
export function listenDesBuches(listen: readonly Liste[], zug: readonly Zugehoerigkeit[], buchId: string, art: ListenArt): Liste[] {
  const ids = new Set(zugehoerigkeitenVon(zug, buchId).map((z) => z.listeId));
  return listenDerArt(listen, art).filter((l) => ids.has(l.id));
}

/** Wert der Zeile „In Saga/Sammlung/Bibliotheken“: Namen durch „, “ getrennt (REQ-095, Auslegung). */
export const listenNamenText = (listen: readonly Liste[]): string => listen.map((l) => l.name).join(', ');

/** Anzahl der Bücher je Liste (nur Bücher, die es gibt, falls `buchIds` angegeben). */
export function anzahlJeListe(zug: readonly Zugehoerigkeit[], buchIds?: ReadonlySet<string>): Map<string, number> {
  const m = new Map<string, number>();
  for (const z of zug) {
    if (buchIds && !buchIds.has(z.buchId)) continue;
    m.set(z.listeId, (m.get(z.listeId) ?? 0) + 1);
  }
  return m;
}

/** Zeile unter dem Autor (REQ-099): „Band 1 · The Empyrean“, ohne Band nur der Name. */
export const sagaZeileText = (name: string, band?: number): string => (band === undefined ? name : `Band ${band} · ${name}`);

/** Sagas eines Buches mit der Bandnummer des Buches (in allen Sagas dieselbe, REQ-112), A–Z nach Saga-Name (REQ-099). */
export function sagenDesBuches(
  listen: readonly Liste[],
  zug: readonly Zugehoerigkeit[],
  buch: Pick<Buch, 'id' | 'bandnummer'>,
): { liste: Liste; band?: number }[] {
  const ids = new Set(zugehoerigkeitenVon(zug, buch.id).map((z) => z.listeId));
  const band = istBandnummer(buch.bandnummer) ? buch.bandnummer : undefined;
  return listenDerArt(listen, 'saga')
    .filter((liste) => ids.has(liste.id))
    .map((liste) => (band === undefined ? { liste } : { liste, band }));
}

/** Sortierung einer geöffneten Liste (REQ-098). */
export type ListenSortierung = 'az' | 'baende';

/** Voreinstellung: Sagas „nach Bänden“, sonst A–Z (REQ-098, Auslegung). */
export const standardSortierung = (art: ListenArt): ListenSortierung => (art === 'saga' ? 'baende' : 'az');

/** Beschriftung des Sortierknopfs (REQ-098). */
export const sortierText = (s: ListenSortierung): string => (s === 'baende' ? 'Nach Bänden' : 'A–Z');

/**
 * Bücher einer Liste (REQ-098): „nach Bänden“ aufsteigend nach der Bandnummer des Buches (REQ-112), Bücher ohne
 * Band danach A–Z; „A–Z“ nach Titel.
 */
export function buecherDerListeSortiert(
  buecher: readonly Buch[],
  zug: readonly Zugehoerigkeit[],
  listeId: string,
  sortierung: ListenSortierung,
): Buch[] {
  const ids = buecherInListe(zug, listeId);
  const drin = buecher.filter((b) => ids.has(b.id));
  if (sortierung === 'az') return alphabetisch(drin);
  const band = (b: Buch) => (istBandnummer(b.bandnummer) ? b.bandnummer : undefined);
  const mitBand = drin.filter((b) => band(b) !== undefined);
  const ohneBand = drin.filter((b) => band(b) === undefined);
  const nachBand = alphabetisch(mitBand).sort((a, b) => band(a)! - band(b)!);
  return [...nachBand, ...alphabetisch(ohneBand)];
}

/** Bücher A–Z nach Titel für das Blatt „Bücher auswählen“ (REQ-098, AK-6). */
export const buecherAZ = (buecher: readonly Buch[]): Buch[] => alphabetisch([...buecher]);

/** Vormarkierung im Blatt „Bücher auswählen“: die Bücher, die schon in der Liste sind (REQ-098, AK-6). */
export const buecherInListe = (zug: readonly Zugehoerigkeit[], listeId: string): Set<string> =>
  new Set(zug.filter((z) => z.listeId === listeId).map((z) => z.buchId));

/**
 * Änderungen beim „Sichern“ im Blatt „Bücher auswählen“ (REQ-098, AK-8): neu markierte Bücher werden aufgenommen,
 * entmarkierte vorher enthaltene herausgenommen. Die Bandnummer gehört zum Buch und bleibt unverändert (REQ-112).
 */
export function auswahlAenderungen(
  liste: Pick<Liste, 'id' | 'art'>,
  zug: readonly Zugehoerigkeit[],
  markiert: ReadonlySet<string>,
  buecher: readonly Buch[],
): { aufnehmen: Zugehoerigkeit[]; herausnehmen: string[] } {
  const vorher = buecherInListe(zug, liste.id);
  const aufnehmen: Zugehoerigkeit[] = [];
  for (const b of buecher) {
    if (!markiert.has(b.id) || vorher.has(b.id)) continue;
    aufnehmen.push({ listeId: liste.id, buchId: b.id });
  }
  const herausnehmen = [...vorher].filter((id) => !markiert.has(id));
  return { aufnehmen, herausnehmen };
}
