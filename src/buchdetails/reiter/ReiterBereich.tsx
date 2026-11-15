import type { CSSProperties } from 'react';
import type { KriteriumId } from '@/domain/bewertung';
import type { Buch } from '@/domain/buch';
import UnderConstruction from '@/views/UnderConstruction';
import Bewertung from './Bewertung';
import DeineRezension from './DeineRezension';
import type { ReiterId } from './rezension';

const platzhalterStil: CSSProperties = { padding: '48px 24px' };

interface Props {
  reiter: ReiterId;
  buch: Buch;
  onBewertungAntippen: (kriterium: KriteriumId, n: number) => void;
  onSchreiben: () => void;
}

/** Inhalt des aktiven Reiters (REQ-043). Notizbuch, Figuren & Orte und – bis Teil B – Details: „under construction :)“. */
export default function ReiterBereich({ reiter, buch, onBewertungAntippen, onSchreiben }: Props) {
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
