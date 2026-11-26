// Sprachfilter „Sprache“ der Online-Suchen (REQ-119): Werte, Standard und gemeinsames Merken über das
// EinstellungRepository (ADR-0002).
import { useEffect, useState } from 'react';
import type { EinstellungRepository } from '@/storage';

/** Wählbare Sprachen als Sprachcodes der Quellen (MARC/ISO 639-2/B), in Anzeigereihenfolge (REQ-119). */
export const SPRACHEN = ['ger', 'eng'] as const;
export type Sprache = (typeof SPRACHEN)[number];

/** Beschriftungen (REQ-119). */
export const SPRACHE_NAME: Record<Sprache, string> = { ger: 'Deutsch', eng: 'Englisch' };
export const SPRACHFILTER_TITEL = 'Sprache';

/** Ohne gespeicherte Auswahl: nur Deutsch (REQ-119, AK-1). */
export const STANDARD_SPRACHEN: readonly Sprache[] = ['ger'];

/** Hinweis, wenn die letzte gewählte Sprache abgewählt werden soll (REQ-119, AK-5). */
export const MINDESTENS_EINE_SPRACHE_HINWEIS = 'Mindestens eine Sprache muss ausgewählt sein';

/** Schlüssel im EinstellungRepository; Wert: JSON-Liste der Sprachcodes, z. B. ["ger","eng"]. */
export const SPRACHEN_SCHLUESSEL = 'onlineSucheSprachen';

const istSprache = (w: unknown): w is Sprache => typeof w === 'string' && (SPRACHEN as readonly string[]).includes(w);

/** Bringt eine Auswahl in die feste Reihenfolge (Deutsch vor Englisch), ohne Dubletten. */
export const sprachenOrdnen = (auswahl: readonly string[]): Sprache[] => SPRACHEN.filter((s) => auswahl.includes(s));

/** Gespeicherte Auswahl; ohne, leer oder beschädigt: Standard (nur Deutsch). */
export async function sprachenLesen(repo: EinstellungRepository): Promise<Sprache[]> {
  try {
    const wert = await repo.lesen(SPRACHEN_SCHLUESSEL);
    if (wert === undefined) return [...STANDARD_SPRACHEN];
    const daten: unknown = JSON.parse(wert);
    const auswahl = Array.isArray(daten) ? sprachenOrdnen(daten.filter(istSprache)) : [];
    return auswahl.length > 0 ? auswahl : [...STANDARD_SPRACHEN];
  } catch {
    return [...STANDARD_SPRACHEN];
  }
}

/** Speichert die Auswahl dauerhaft (REQ-119, AK-7). */
export function sprachenSpeichern(repo: EinstellungRepository, auswahl: readonly Sprache[]): Promise<void> {
  return repo.speichern(SPRACHEN_SCHLUESSEL, JSON.stringify(sprachenOrdnen(auswahl)));
}

/**
 * Antippen einer Sprache (REQ-119, AK-3 bis AK-5): schaltet sie um. Die letzte gewählte Sprache bleibt gewählt;
 * dann `null` (Hinweis anzeigen).
 */
export function spracheUmschalten(auswahl: readonly Sprache[], sprache: Sprache): Sprache[] | null {
  if (auswahl.includes(sprache)) {
    if (auswahl.length <= 1) return null;
    return sprachenOrdnen(auswahl.filter((s) => s !== sprache));
  }
  return sprachenOrdnen([...auswahl, sprache]);
}

/**
 * Sprachauswahl eines Suchfensters: lädt beim Öffnen die gemeinsame gemerkte Auswahl und speichert jede Änderung
 * sofort. `undefined`, solange noch nicht geladen.
 */
export function useSprachauswahl(repo: EinstellungRepository): [Sprache[] | undefined, (neu: Sprache[]) => void] {
  const [stand, setStand] = useState<{ repo: EinstellungRepository; auswahl: Sprache[] } | undefined>(undefined);
  useEffect(() => {
    let aktiv = true;
    void sprachenLesen(repo).then((auswahl) => {
      if (aktiv) setStand((alt) => (alt?.repo === repo ? alt : { repo, auswahl }));
    });
    return () => {
      aktiv = false;
    };
  }, [repo]);
  const setzen = (neu: Sprache[]) => {
    setStand({ repo, auswahl: neu });
    void sprachenSpeichern(repo, neu).catch((fehler: unknown) => console.warn('Sprachauswahl nicht gespeichert:', fehler));
  };
  return [stand?.repo === repo ? stand.auswahl : undefined, setzen];
}

/** Fallback ohne DesignAnbieter: Einstellungen nur für die Sitzung. */
export const fluechtigeEinstellungen = (): EinstellungRepository => {
  const m = new Map<string, string>();
  return { lesen: (s) => Promise.resolve(m.get(s)), speichern: (s, w) => Promise.resolve(void m.set(s, w)) };
};
