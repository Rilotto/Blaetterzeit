import type { CSSProperties } from 'react';
import type { KriteriumId } from '@/domain/bewertung';
import type { Buch } from '@/domain/buch';
import UnderConstruction from '@/views/UnderConstruction';
import Bewertung from './Bewertung';
import DeineRezension from './DeineRezension';
import DetailsBereich from './DetailsBereich';
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
  /** Zeilen „Verlag“, „ISBN“ (REQ-063), „Hinzugefügt“ (REQ-064). */
  onVerlag?: () => void;
  onIsbn?: () => void;
  onHinzugefuegt?: () => void;
}

/** Inhalt des aktiven Reiters (REQ-043). Notizbuch und Figuren & Orte: „under construction :)“. */
export default function ReiterBereich({ reiter, buch, onBewertungAntippen, onSchreiben, onSeiten, onFormat, onPreis, onVerlag, onIsbn, onHinzugefuegt }: Props) {
  if (reiter === 'details') {
    return (
      <div role="tabpanel" aria-label="Details" data-reiter-bereich="details">
        <DetailsBereich
          buch={buch}
          onSeiten={onSeiten}
          onFormat={onFormat}
          onPreis={onPreis}
          onVerlag={onVerlag}
          onIsbn={onIsbn}
          onHinzugefuegt={onHinzugefuegt}
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
  return (
    <div role="tabpanel" data-reiter-bereich={reiter} style={platzhalterStil}>
      <UnderConstruction />
    </div>
  );
}
