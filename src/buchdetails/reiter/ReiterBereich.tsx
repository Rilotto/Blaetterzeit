import type { CSSProperties, ReactNode } from 'react';
import type { KriteriumId } from '@/domain/bewertung';
import type { Buch } from '@/domain/buch';
import UnderConstruction from '@/views/UnderConstruction';
import Bewertung from './Bewertung';
import DeineRezension from './DeineRezension';
import DetailsBereich, { type ListenAbschnittProps } from './DetailsBereich';
import type { ReiterId } from './rezension';
import { abstand } from '@/theme';

const platzhalterStil: CSSProperties = { padding: `calc(${abstand('xl')} * 2) ${abstand('xl')}` };

interface Props {
  reiter: ReiterId;
  buch: Buch;
  onBewertungAntippen: (kriterium: KriteriumId, n: number) => void;
  onSchreiben: () => void;
  /** Reiter „Details“: Zeilen „Seiten“, „Format/Exemplar/Sonderausgabe“, „Preis“ (REQ-057 bis REQ-059). */
  onSeiten: () => void;
  onFormat: () => void;
  onPreis: () => void;
  /** Zeile „Maße“ angetippt (REQ-072). */
  onMasse?: () => void;
  /** Zeilen „Verlag“, „ISBN“ (REQ-063), „Hinzugefügt“ (REQ-064). */
  onVerlag?: () => void;
  onIsbn?: () => void;
  onHinzugefuegt?: () => void;
  /** Zeile „Beendet am“ (REQ-085). */
  onBeendet?: () => void;
  /** Zeile „Erschienen“ (REQ-092). */
  onErschienen?: () => void;
  /** Zeile „Band“ (REQ-112). */
  onBand?: () => void;
  /** Abschnitt „Sagas, Sammlungen und Bibliotheken“ (REQ-095). */
  listen?: ListenAbschnittProps;
  /** Inhalt des Reiters „Notizbuch“: Abschnitt „Zitate“ (REQ-105). */
  notizbuch?: ReactNode;
}

/** Inhalt des aktiven Reiters (REQ-043). Notizbuch: Zitate (REQ-105). Figuren & Orte: „under construction :)“. */
export default function ReiterBereich({ reiter, buch, onBewertungAntippen, onSchreiben, onSeiten, onFormat, onPreis, onMasse, onVerlag, onIsbn, onHinzugefuegt, onBeendet, onErschienen, onBand, listen, notizbuch }: Props) {
  if (reiter === 'details') {
    return (
      <div role="tabpanel" aria-label="Details" data-reiter-bereich="details">
        <DetailsBereich
          buch={buch}
          onSeiten={onSeiten}
          onFormat={onFormat}
          onPreis={onPreis}
          onMasse={onMasse}
          onVerlag={onVerlag}
          onIsbn={onIsbn}
          onHinzugefuegt={onHinzugefuegt}
          onBeendet={onBeendet}
          onErschienen={onErschienen}
          onBand={onBand}
          listen={listen}
        />
      </div>
    );
  }
  if (reiter === 'rezension') {
    return (
      <div role="tabpanel" aria-label="Rezension" data-reiter-bereich="rezension">
        <Bewertung bewertungen={buch.bewertungen} onAntippen={onBewertungAntippen} />
        <DeineRezension rezension={buch.rezension} onSchreiben={onSchreiben} />
      </div>
    );
  }
  if (reiter === 'notizbuch') {
    return (
      <div role="tabpanel" aria-label="Notizbuch" data-reiter-bereich="notizbuch">
        {notizbuch}
      </div>
    );
  }
  return (
    <div role="tabpanel" data-reiter-bereich={reiter} style={platzhalterStil}>
      <UnderConstruction />
    </div>
  );
}
