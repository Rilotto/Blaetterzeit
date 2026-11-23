// Datenmodell des 3D-Buches (REQ-076): Maße, Gestalt (Taschenbuch/Hardcover) und Inhalt jeder Fläche.
// Reine Funktionen ohne DOM; die Darstellung (Ansicht3d.tsx) setzt jede Fläche als CSS-3D-Ebene.

import type { Bildbereich } from '@/storage/ImageStore';
import { wirksameMasse, type MassQuelle } from '../masse';
import type { Seite } from './drehung';

/** Dicke der Deckel bei Hardcover (mm). Orientierungswert, kein Akzeptanzkriterium. */
export const DECKEL_DICKE_MM = 2.5;
/** Mindestdicke der Darstellung (mm) gegen Flackern bei sehr dünnen Büchern (Z-Fighting). */
export const MIN_DARSTELLUNG_DICKE_MM = 3;
/** Rahmen, in den das Modell passt (px): Höhe, Breite und Raumdiagonale. */
export const MODELL_MAX_HOEHE_PX = 300;
export const MODELL_MAX_BREITE_PX = 230;
export const MODELL_MAX_DIAGONALE_PX = 420;
/** Längste Bildseite der Texturen (px). */
export const TEXTUR_MAX_KANTE = 1024;

export type Bilder = Partial<Record<Bildbereich, string>>;

/** Inhalt einer Fläche: Bild, „Primär“ (optional mit Titel) oder Seitenmuster (Linien quer zur Fläche). */
export type Inhalt =
  | { art: 'bild'; bild: string }
  | { art: 'primaer'; titel?: string }
  | { art: 'muster'; linien: 'senkrecht' | 'waagerecht' };

/** Eine Ebene des Modells in px. `seite` = logische Buchfläche, `kante` = Deckelkante oder Innenseite. */
export interface Flaeche {
  id: string;
  seite: Seite | 'kante';
  breite: number;
  hoehe: number;
  /** CSS-Transform relativ zur Modellmitte. */
  transform: string;
  inhalt: Inhalt;
}

export interface Modell {
  gestalt: 'taschenbuch' | 'hardcover';
  /** Außenmaße in px (Breite, Höhe, Dicke). */
  breite: number;
  hoehe: number;
  dicke: number;
  /** Deckelüberstand in px (Taschenbuch 0). */
  ueberstand: number;
  /** Maßstab px je mm. */
  pxJeMm: number;
  flaechen: Flaeche[];
}

type Richtung = 'vorne' | 'hinten' | 'links' | 'rechts' | 'oben' | 'unten';
type Belegung = Partial<Record<Richtung, { seite: Seite | 'kante'; inhalt: Inhalt }>>;

const r = (x: number) => Number(x.toFixed(3));

/** Flächen eines Quaders mit Mitte (x, y, z) und Größe (b, h, t); nur die belegten Richtungen. */
export function quader(
  name: string,
  mitte: readonly [number, number, number],
  groesse: readonly [number, number, number],
  belegung: Belegung,
): Flaeche[] {
  const [x, y, z] = mitte;
  const [b, h, t] = groesse;
  const verschieben = `translate3d(${r(x)}px, ${r(y)}px, ${r(z)}px)`;
  const lage: Record<Richtung, { breite: number; hoehe: number; drehung: string; abstand: number }> = {
    vorne: { breite: b, hoehe: h, drehung: '', abstand: t / 2 },
    hinten: { breite: b, hoehe: h, drehung: 'rotateY(180deg) ', abstand: t / 2 },
    links: { breite: t, hoehe: h, drehung: 'rotateY(-90deg) ', abstand: b / 2 },
    rechts: { breite: t, hoehe: h, drehung: 'rotateY(90deg) ', abstand: b / 2 },
    oben: { breite: b, hoehe: t, drehung: 'rotateX(90deg) ', abstand: h / 2 },
    unten: { breite: b, hoehe: t, drehung: 'rotateX(-90deg) ', abstand: h / 2 },
  };
  return (Object.keys(lage) as Richtung[]).flatMap((richtung) => {
    const beleg = belegung[richtung];
    if (!beleg) return [];
    const l = lage[richtung];
    return [
      {
        id: `${name}-${richtung}`,
        seite: beleg.seite,
        breite: r(l.breite),
        hoehe: r(l.hoehe),
        transform: `${verschieben} ${l.drehung}translateZ(${r(l.abstand)}px)`,
        inhalt: beleg.inhalt,
      },
    ];
  });
}

/** Inhalte der sechs logischen Buchflächen (REQ-076, AK-3/AK-4). */
export function flaechenInhalte(titel: string, bilder: Bilder): Record<Seite, Inhalt> {
  return {
    vorne: bilder.cover ? { art: 'bild', bild: bilder.cover } : { art: 'primaer', titel },
    hinten: { art: 'primaer' },
    ruecken: bilder.ruecken ? { art: 'bild', bild: bilder.ruecken } : { art: 'primaer' },
    schnitt: bilder.schnitt ? { art: 'bild', bild: bilder.schnitt } : { art: 'muster', linien: 'senkrecht' },
    oben: { art: 'muster', linien: 'waagerecht' },
    unten: { art: 'muster', linien: 'waagerecht' },
  };
}

/** Maßstab px je mm, sodass das Modell in den Rahmen passt. */
export function massstab(breiteMm: number, hoeheMm: number, dickeMm: number): number {
  return Math.min(
    MODELL_MAX_HOEHE_PX / hoeheMm,
    MODELL_MAX_BREITE_PX / breiteMm,
    MODELL_MAX_DIAGONALE_PX / Math.hypot(breiteMm, hoeheMm, dickeMm),
  );
}

/**
 * 3D-Modell eines Buches (REQ-076): Maße aus `wirksameMasse` (REQ-077), Hardcover mit Deckeln und Überstand,
 * alle anderen Formate (auch E-Book) als Taschenbuch. Rücken links, Schnitt rechts, Cover zum Betrachter.
 */
export function buchModell(buch: MassQuelle & { titel: string }, bilder: Bilder): Modell {
  const w = wirksameMasse(buch);
  const dickeMm = Math.max(w.dickeMm, MIN_DARSTELLUNG_DICKE_MM);
  const f = massstab(w.breiteMm, w.hoeheMm, dickeMm);
  const B = w.breiteMm * f;
  const H = w.hoeheMm * f;
  const D = dickeMm * f;
  const inhalt = flaechenInhalte(buch.titel, bilder);
  const belegt = (s: Seite) => ({ seite: s, inhalt: inhalt[s] });
  const kante = { seite: 'kante' as const, inhalt: { art: 'primaer' as const } };

  if (w.standardtyp !== 'hardcover') {
    return {
      gestalt: 'taschenbuch',
      breite: B,
      hoehe: H,
      dicke: D,
      ueberstand: 0,
      pxJeMm: f,
      flaechen: quader('buch', [0, 0, 0], [B, H, D], {
        vorne: belegt('vorne'),
        hinten: belegt('hinten'),
        links: belegt('ruecken'),
        rechts: belegt('schnitt'),
        oben: belegt('oben'),
        unten: belegt('unten'),
      }),
    };
  }

  // Hardcover: Rückendeckel (volle Dicke), Vorder- und Rückdeckel, Buchblock oben/unten/vorne um u kleiner.
  const u = w.deckelUeberstandMm * f;
  // Deckel höchstens ein Viertel der Dicke, damit der Buchblock sichtbar bleibt.
  const b = Math.min(DECKEL_DICKE_MM * f, D / 4);
  const deckelBreite = B - b;
  const deckelX = b / 2;
  const blockBreite = Math.max(B - b - u, 1);
  const blockX = (b - u) / 2;
  const blockHoehe = Math.max(H - 2 * u, 1);
  const blockDicke = Math.max(D - 2 * b, 0.5);
  const flaechen = [
    ...quader('rueckendeckel', [-B / 2 + b / 2, 0, 0], [b, H, D], {
      links: belegt('ruecken'),
      vorne: kante,
      hinten: kante,
      oben: kante,
      unten: kante,
    }),
    ...quader('vorderdeckel', [deckelX, 0, D / 2 - b / 2], [deckelBreite, H, b], {
      vorne: belegt('vorne'),
      hinten: kante,
      rechts: kante,
      oben: kante,
      unten: kante,
    }),
    ...quader('rueckdeckel', [deckelX, 0, -D / 2 + b / 2], [deckelBreite, H, b], {
      hinten: belegt('hinten'),
      vorne: kante,
      rechts: kante,
      oben: kante,
      unten: kante,
    }),
    ...quader('buchblock', [blockX, 0, 0], [blockBreite, blockHoehe, blockDicke], {
      rechts: belegt('schnitt'),
      oben: belegt('oben'),
      unten: belegt('unten'),
    }),
  ];
  return { gestalt: 'hardcover', breite: B, hoehe: H, dicke: D, ueberstand: u, pxJeMm: f, flaechen };
}
