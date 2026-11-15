import type { CSSProperties } from 'react';
import Symbolbild from '@/components/Symbolbild';
import { rezensionFarbe } from '@/theme';
import { RAND } from '../masse';
import { REZENSION_PLATZHALTER, abschnittKopfStil, abschnittSchaltflaecheStil, abschnittUeberschriftStil, karteStil } from './rezension';

const schreibfeldStil: CSSProperties = {
  ...karteStil,
  display: 'block',
  width: `calc(100% - ${2 * RAND}px)`,
  minHeight: '72px',
  padding: '18px 20px',
  textAlign: 'left',
  fontFamily: 'inherit',
  cursor: 'pointer',
  WebkitTapHighlightColor: 'transparent',
};

const platzhalterStil: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  fontSize: '22px',
  lineHeight: 1.3,
  color: rezensionFarbe('schreibfeldPlatzhalter'),
};

const textStil: CSSProperties = {
  display: 'block',
  fontSize: '17px',
  lineHeight: 1.45,
  whiteSpace: 'pre-wrap',
  overflowWrap: 'anywhere',
  color: rezensionFarbe('schreibfeldText'),
};

interface Props {
  rezension: string | undefined;
  /** Schreibfeld angetippt: Schreibfenster öffnen (REQ-047, AK-4). */
  onSchreiben: () => void;
}

/** Bereich „Deine Rezension“ mit Teilen-Symbol (ohne Funktion) und Schreibfeld (REQ-047). */
export default function DeineRezension({ rezension, onSchreiben }: Props) {
  return (
    <section aria-label="Deine Rezension" data-bereich-rezension="">
      <div style={abschnittKopfStil}>
        <h2 data-abschnitt-ueberschrift="" style={abschnittUeberschriftStil}>
          Deine Rezension
        </h2>
        {/* Teilen: vorerst ohne Funktion (REQ-047, AK-2; REQ-050). */}
        <button type="button" aria-label="Teilen" data-rezension-teilen="" style={abschnittSchaltflaecheStil}>
          <Symbolbild name="teilen" farbe={rezensionFarbe('abschnittsIcon')} groesse={26} />
        </button>
      </div>
      <button type="button" aria-label="Rezension schreiben" data-schreibfeld="" onClick={onSchreiben} style={schreibfeldStil}>
        {rezension ? (
          <span data-rezension-text="" style={textStil}>
            {rezension}
          </span>
        ) : (
          <span data-schreibfeld-platzhalter="" style={platzhalterStil}>
            {REZENSION_PLATZHALTER}
            <Symbolbild name="stift" farbe={rezensionFarbe('stiftIcon')} groesse={24} />
          </span>
        )}
      </button>
    </section>
  );
}
