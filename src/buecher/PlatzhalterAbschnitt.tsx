import type { CSSProperties } from 'react';
import CoverPlatzhalter from '@/components/CoverPlatzhalter';
import { coverBreite } from '@/components/coverFlaeche';
import { buecherFarbe, textformatAlleAnsehen } from '@/theme';
import { abschnittKopfStil, abschnittStil, abschnittsueberschriftStil, seitenRand } from './layout';
import PlatzhalterText from './PlatzhalterText';

interface Props {
  titel: string;
  /** Text an der Titelstelle unter dem Cover-Platzhalter (REQ-012, AK-6/AK-7). */
  platzhaltertext: string;
}

// REQ-012 AK-10/AK-11: Schrift wie „Alle ansehen ›“ (gemeinsame zentrale Definition),
// höchstens zwei Zeilen, bei Überlänge mit Auslassungspunkten. Position unverändert an der Titelstelle.
const platzhaltertextStil: CSSProperties = {
  ...textformatAlleAnsehen,
  display: '-webkit-box',
  WebkitBoxOrient: 'vertical',
  WebkitLineClamp: 2,
  overflow: 'hidden',
};

const inhaltStil: CSSProperties = {
  display: 'flex',
  padding: `4px ${seitenRand}px 8px`,
};

/**
 * Abschnitt mit Überschrift, einem Cover-Platzhalter ohne Buchtitel und einem
 * Platzhaltertext darunter (REQ-012). Ohne Funktion.
 */
export default function PlatzhalterAbschnitt({ titel, platzhaltertext }: Props) {
  return (
    <section aria-label={titel} style={abschnittStil}>
      <div style={abschnittKopfStil}>
        <h2 style={abschnittsueberschriftStil}>{titel}</h2>
      </div>
      <div style={inhaltStil}>
        <div style={{ width: `${coverBreite}px` }}>
          <CoverPlatzhalter />
          <PlatzhalterText
            data-platzhaltertext=""
            farbe={buecherFarbe('abschnittsplatzhalterText')}
            style={platzhaltertextStil}
          >
            {platzhaltertext}
          </PlatzhalterText>
        </div>
      </div>
    </section>
  );
}
