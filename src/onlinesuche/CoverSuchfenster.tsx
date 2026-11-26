// Fenster „Cover online suchen“ (REQ-118) mit Sprachfilter (REQ-119); Rahmen und Suche wie „Online suchen“.
import type { CSSProperties } from 'react';
import type { CoverSuche } from '@/barcode/suche';
import { QUELLEN_NAME, type Treffer } from '@/barcode/treffer';
import type { EinstellungRepository } from '@/storage';
import { coverBildStil, coverRahmenStil, quelleStil, Suchblatt } from './Suchfenster';

/** Hinweis ohne Cover (REQ-118, AK-10); ohne Internet wie „Online suchen“ („Keine Internetverbindung“, AK-11). */
export const KEIN_COVER_HINWEIS = 'Kein Cover gefunden';

/** Vorbelegung der Suchzeile (REQ-118): ISBN, sonst Titel und Autor durch ein Leerzeichen getrennt, sonst leer. */
export function coverSuchtext(angaben: { isbn?: string; titel?: string; autor?: string }): string {
  const isbn = angaben.isbn?.trim();
  if (isbn) return isbn;
  return [angaben.titel, angaben.autor]
    .map((w) => w?.trim() ?? '')
    .filter((w) => w !== '')
    .join(' ');
}

interface Props {
  suche: CoverSuche;
  /** Vorbelegung der Suchzeile (siehe {@link coverSuchtext}); nicht leer: Suche startet sofort. */
  vorbelegung: string;
  einstellungRepository?: EinstellungRepository;
  /** Zurück-Pfeil, Android-Zurück-Taste, Herunterziehen: Fenster zu, nichts geändert (REQ-118, AK-15). */
  onZurueck: () => void;
  /** Cover angetippt (Data-URL, noch nicht zugeschnitten); das Fenster ist dann bereits geschlossen. */
  onWahl: (cover: string) => void;
}

const quelleUnterCoverStil: CSSProperties = { ...quelleStil, marginTop: '4px', textAlign: 'center' };

function coverKachel(t: Treffer) {
  return (
    <>
      <span style={coverRahmenStil}>
        <img src={t.angaben.cover} alt="" data-treffer-cover="" style={coverBildStil} />
      </span>
      <span data-treffer-quelle="" style={quelleUnterCoverStil}>
        {QUELLEN_NAME[t.quelle]}
      </span>
    </>
  );
}

/**
 * Fenster „Cover online suchen“ (REQ-118): Sprachfilter, Suchzeile mit Vorbelegung und Autostart, Raster mit bis zu
 * 15 Covern (nur Treffer mit Cover), darunter klein die Quelle.
 */
export default function CoverSuchfenster({ suche, vorbelegung, einstellungRepository, onZurueck, onWahl }: Props) {
  return (
    <Suchblatt
      art="cover"
      titel="Cover online suchen"
      suchen={async (text, sprachen) => (await suche.suchen(text, sprachen)).filter((t) => !!t.angaben.cover)}
      keineTrefferHinweis={KEIN_COVER_HINWEIS}
      vorbelegung={vorbelegung}
      einstellungRepository={einstellungRepository}
      rasterName="Gefundene Cover"
      kachel={coverKachel}
      kachelName={(t) => `Cover aus ${QUELLEN_NAME[t.quelle]}`}
      onZurueck={onZurueck}
      onWahl={(t) => {
        if (t.angaben.cover) onWahl(t.angaben.cover);
      }}
    />
  );
}
