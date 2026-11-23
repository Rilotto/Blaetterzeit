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

/** Ein Buch in einer Liste, bei Sagas optional mit Bandnummer (REQ-095, REQ-096). */
export interface Zugehoerigkeit {
  listeId: string;
  buchId: string;
  /** Bandnummer, ganze Zahl ≥ 1; nur bei Sagas sinnvoll. Fehlend = kein Band. */
  band?: number;
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

/** Zugehörigkeit aus gespeicherten Daten; ungültig → undefined. Ungültige Bandnummern fehlen. */
export function zugehoerigkeitAusDaten(daten: unknown): Zugehoerigkeit | undefined {
  const e = (daten ?? {}) as Record<string, unknown>;
  if (typeof e.listeId !== 'string' || typeof e.buchId !== 'string') return undefined;
  const z: Zugehoerigkeit = { listeId: e.listeId, buchId: e.buchId };
  const band = typeof e.band === 'number' ? e.band : e.band === null || e.band === undefined ? undefined : Number(e.band);
  if (istBandnummer(band)) z.band = band;
  return z;
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

/** Feld „Band“: nur Ziffern, höchstens sechs. */
export const bandFiltern = (wert: string): string => wert.replace(/\D/g, '').slice(0, 6);

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

/** Sagas eines Buches mit Band, A–Z nach Saga-Name (REQ-099). */
export function sagenDesBuches(listen: readonly Liste[], zug: readonly Zugehoerigkeit[], buchId: string): { liste: Liste; band?: number }[] {
  const eigene = zugehoerigkeitenVon(zug, buchId);
  return listenDerArt(listen, 'saga')
    .map((liste) => ({ liste, z: eigene.find((z) => z.listeId === liste.id) }))
    .filter((x) => x.z !== undefined)
    .map(({ liste, z }) => (z!.band === undefined ? { liste } : { liste, band: z!.band }));
}

/** Sortierung einer geöffneten Liste (REQ-098). */
export type ListenSortierung = 'az' | 'baende';

/** Voreinstellung: Sagas „nach Bänden“, sonst A–Z (REQ-098, Auslegung). */
export const standardSortierung = (art: ListenArt): ListenSortierung => (art === 'saga' ? 'baende' : 'az');

/** Beschriftung des Sortierknopfs (REQ-098). */
export const sortierText = (s: ListenSortierung): string => (s === 'baende' ? 'Nach Bänden' : 'A–Z');

/**
 * Bücher einer Liste (REQ-098): „nach Bänden“ aufsteigend nach Bandnummer, Bücher ohne Band danach A–Z;
 * „A–Z“ nach Titel.
 */
export function buecherDerListeSortiert(
  buecher: readonly Buch[],
  zug: readonly Zugehoerigkeit[],
  listeId: string,
  sortierung: ListenSortierung,
): Buch[] {
  const band = new Map(zug.filter((z) => z.listeId === listeId).map((z) => [z.buchId, z.band] as const));
  const drin = buecher.filter((b) => band.has(b.id));
  if (sortierung === 'az') return alphabetisch(drin);
  const mitBand = drin.filter((b) => band.get(b.id) !== undefined);
  const ohneBand = drin.filter((b) => band.get(b.id) === undefined);
  const nachBand = alphabetisch(mitBand).sort((a, b) => band.get(a.id)! - band.get(b.id)!);
  return [...nachBand, ...alphabetisch(ohneBand)];
}
