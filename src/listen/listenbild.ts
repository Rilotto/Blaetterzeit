import { useEffect, useState } from 'react';
import { coverBreite, coverHoehe } from '@/components/coverFlaeche';
import type { MassQuelle } from '@/buchdetails/masse';
import type { Liste } from '@/domain/listen';
import type { Bildbereich, ImageStore } from '@/storage';

/**
 * Listenbild (REQ-100): je Liste optional genau ein Bild im Cover-Format.
 *
 * Ablage: über die Bildablage (ImageStore, ADR-0002) unter der UUID der Liste im Bereich „cover“. Listen- und
 * Buch-IDs sind UUIDs und kollidieren nicht; damit gilt dieselbe dauerhafte Ablage wie für Buchcover
 * (IndexedDB bzw. Bilddateien + SQLite-Tabelle `buch_bild`) ohne Schemaänderung.
 */
export const LISTENBILD_BEREICH: Bildbereich = 'cover';

/** Seitenverhältnis des Listenbilds = Coverfläche der Buchlisten (REQ-009, 2:3) – Startrahmen und Ziel des Zuschnitts. */
export const LISTENBILD_MASSE: MassQuelle = { breiteMm: coverBreite, hoeheMm: coverHoehe };
export const LISTENBILD_VERHAELTNIS = coverBreite / coverHoehe;

/** Entwurf im Blatt „Liste bearbeiten“: `undefined` = unverändert, `null` = entfernt, Text = neues Bild (Data-URL). */
export type ListenbildEntwurf = string | null | undefined;

/** Wirksames Bild im Blatt: Entwurf, sonst das gespeicherte. */
export const listenbildImBlatt = (gespeichert: string | undefined, entwurf: ListenbildEntwurf): string | undefined =>
  entwurf === undefined ? gespeichert : (entwurf ?? undefined);

export const listenbildLaden = (speicher: ImageStore, listeId: string): Promise<string | undefined> =>
  speicher.get(listeId, LISTENBILD_BEREICH).catch(() => undefined);

/** Übernimmt den Entwurf beim „Sichern“ (REQ-100): neues Bild speichern, `null` entfernen, `undefined` nichts tun. */
export async function listenbildUebernehmen(speicher: ImageStore, listeId: string, entwurf: ListenbildEntwurf): Promise<void> {
  if (entwurf === undefined) return;
  if (entwurf === null) await speicher.remove(listeId, LISTENBILD_BEREICH);
  else await speicher.put(listeId, LISTENBILD_BEREICH, entwurf);
}

/** Beim Löschen der Liste wird ihr Bild mit gelöscht (REQ-100). */
export const listenbildLoeschen = (speicher: ImageStore, listeId: string): Promise<void> => speicher.remove(listeId, LISTENBILD_BEREICH);

/** Listenbilder aller Listen je Listen-ID; liest neu, sobald sich die Listen ändern (z. B. nach „Sichern“). */
export function useListenbilder(speicher: ImageStore, listen: readonly Liste[] | undefined): Record<string, string> {
  const [bilder, setBilder] = useState<Record<string, string>>({});
  useEffect(() => {
    if (!listen) return;
    let aktiv = true;
    void Promise.all(listen.map(async (l) => [l.id, await listenbildLaden(speicher, l.id)] as const)).then((paare) => {
      if (!aktiv) return;
      const neu: Record<string, string> = {};
      for (const [id, bild] of paare) if (bild) neu[id] = bild;
      setBilder(neu);
    });
    return () => {
      aktiv = false;
    };
  }, [speicher, listen]);
  return bilder;
}
