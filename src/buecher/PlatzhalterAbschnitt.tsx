import type { CSSProperties } from 'react';
import CoverPlatzhalter from '@/components/CoverPlatzhalter';
import { abschnittKopfStil, abschnittStil, abschnittsueberschriftStil, seitenRand } from './layout';

interface Props {
  titel: string;
}

const inhaltStil: CSSProperties = {
  display: 'flex',
  padding: `4px ${seitenRand}px 8px`,
};

/** Abschnitt nur mit Überschrift und einem Cover-Platzhalter ohne Titel (REQ-012). Ohne Funktion. */
export default function PlatzhalterAbschnitt({ titel }: Props) {
  return (
    <section aria-label={titel} style={abschnittStil}>
      <div style={abschnittKopfStil}>
        <h2 style={abschnittsueberschriftStil}>{titel}</h2>
      </div>
      <div style={inhaltStil}>
        <CoverPlatzhalter />
      </div>
    </section>
  );
}
