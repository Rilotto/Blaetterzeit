// Zentrale Liste der Abschnitte der Seite „Bücher“ (REQ-009, REQ-012, REQ-035, REQ-108).
// Einzige Stelle, an der Abschnitte festgelegt werden: Reihenfolge der Liste = Reihenfolge auf der Seite.
// Das Blatt „„Für dich“ anpassen“ erzeugt seine Zeilen aus dieser Liste; ein hier ergänzter Abschnitt
// erscheint dort automatisch und ist sichtbar, solange er nicht ausdrücklich ausgeblendet wurde.
import type { ReactNode } from 'react';
import type { Buch } from '@/domain/buch';
import type { Liste, ListenArt } from '@/domain/listen';
import type { EinstellungRepository } from '@/storage';
import AbschnittAlleBuecher from './AbschnittAlleBuecher';
import AbschnittListen from './AbschnittListen';
import AbschnittNochZuLesen from './AbschnittNochZuLesen';
import { abschnittKonfiguration } from './abschnittKonfiguration';

/** Was ein Abschnitt zum Darstellen braucht; die Seite „Bücher“ stellt es bereit. */
export interface AbschnittKontext {
  buecher: Buch[] | undefined;
  frontcover: Record<string, string>;
  listen: Liste[] | undefined;
  listenbilder: Record<string, string>;
  onBuchAntippen: (buch: Buch) => void;
  /** „Alle ansehen ›“ einer Übersicht der Seite „Bücher“ (Filter-ID, z. B. „alle“). */
  onUebersicht: (liste: string) => void;
  /** Platzhalter der leeren Liste: öffnet das Menü „Buch hinzufügen“ (REQ-011). */
  onLeereListe: () => void;
  /** „Alle ansehen ›“ der Sagas bzw. Sammlungen (REQ-097). */
  onListenUebersicht: (art: Extract<ListenArt, 'saga' | 'sammlung'>) => void;
  onListeAntippen: (liste: Liste) => void;
}

export interface AbschnittDefinition {
  /** Stabile technische ID (Schlüssel der gespeicherten Auswahl, REQ-108; = data-abschnitt des Abschnitts). */
  id: string;
  /** Name im Blatt „„Für dich“ anpassen“ (= Abschnittsüberschrift). */
  titel: string;
  darstellen: (k: AbschnittKontext) => ReactNode;
}

const listenAbschnitt = (art: Extract<ListenArt, 'saga' | 'sammlung'>) => (k: AbschnittKontext) => (
  <AbschnittListen
    art={art}
    listen={k.listen}
    listenbilder={k.listenbilder}
    onAlleAnsehen={() => k.onListenUebersicht(art)}
    onListeAntippen={k.onListeAntippen}
  />
);

export const buecherAbschnitte: readonly AbschnittDefinition[] = [
  {
    id: 'noch-zu-lesen',
    titel: abschnittKonfiguration.nochZuLesen.titel,
    darstellen: (k) => (
      <AbschnittNochZuLesen
        buecher={k.buecher}
        frontcover={k.frontcover}
        onBuchAntippen={k.onBuchAntippen}
        onAlleAnsehen={() => k.onUebersicht('noch_zu_lesen')}
        onLeereListeAntippen={k.onLeereListe}
      />
    ),
  },
  { id: 'sagas', titel: abschnittKonfiguration.sagas.titel, darstellen: listenAbschnitt('saga') },
  { id: 'sammlungen', titel: abschnittKonfiguration.sammlungen.titel, darstellen: listenAbschnitt('sammlung') },
  {
    id: 'alle-buecher',
    titel: abschnittKonfiguration.alleBuecher.titel,
    darstellen: (k) => (
      <AbschnittAlleBuecher
        buecher={k.buecher}
        frontcover={k.frontcover}
        onBuchAntippen={k.onBuchAntippen}
        onAlleAnsehen={() => k.onUebersicht('alle')}
      />
    ),
  },
];


/**
 * Sichtbare Abschnitte in unveränderter Reihenfolge. Abschnitte ohne gespeicherte Auswahl sind sichtbar.
 * Wären alle ausgeblendet (z. B. veraltete Auswahl), gelten alle als sichtbar (mindestens einer, REQ-108 AK-5).
 */
export function sichtbareAbschnitte(abschnitte: readonly AbschnittDefinition[], ausgeblendet: readonly string[]): AbschnittDefinition[] {
  const sichtbar = abschnitte.filter((a) => !ausgeblendet.includes(a.id));
  return sichtbar.length > 0 ? sichtbar : [...abschnitte];
}

const SCHLUESSEL = 'fuerDichAusgeblendet';

/** Gespeicherte ausgeblendete Abschnitts-IDs; ohne oder mit beschädigter Auswahl: keine (alle sichtbar). */
export async function ausgeblendeteLesen(repo: EinstellungRepository): Promise<string[]> {
  try {
    const wert = await repo.lesen(SCHLUESSEL);
    if (wert === undefined) return [];
    const daten: unknown = JSON.parse(wert);
    return Array.isArray(daten) ? daten.filter((x): x is string => typeof x === 'string') : [];
  } catch {
    return [];
  }
}

/** Speichert die ausgeblendeten Abschnitts-IDs dauerhaft (JSON-Liste, ADR-0002). */
export function ausgeblendeteSpeichern(repo: EinstellungRepository, ausgeblendet: readonly string[]): Promise<void> {
  return repo.speichern(SCHLUESSEL, JSON.stringify([...ausgeblendet]));
}
