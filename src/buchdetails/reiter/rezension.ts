import type { CSSProperties } from 'react';
import type { SymbolName } from '@/components/Symbolbild';
import type { KriteriumId } from '@/domain/bewertung';
import { rezensionFarbe } from '@/theme';
import { RAND } from '../masse';

/** Die vier Reiter der Buchdetails in fester Reihenfolge (REQ-043, AK-2). */
export const REITER = [
  { id: 'rezension', bezeichnung: 'Rezension', symbol: 'stern' },
  { id: 'notizbuch', bezeichnung: 'Notizbuch', symbol: 'notizbuch' },
  { id: 'figuren', bezeichnung: 'Figuren & Orte', symbol: 'gruppe' },
  { id: 'details', bezeichnung: 'Details', symbol: 'info' },
] as const satisfies readonly { id: string; bezeichnung: string; symbol: SymbolName }[];

export type ReiterId = (typeof REITER)[number]['id'];

/** Reiter beim Öffnen der Buchdetails (REQ-043, AK-3). */
export const START_REITER: ReiterId = 'rezension';

/** Platzhaltertext des Schreibfelds und des Eingabefelds (REQ-047, REQ-049). */
export const REZENSION_PLATZHALTER = 'Wie fandest du es?';

/** Mindeststrecke in px, ab der Herunterziehen am Griff das Schreibfenster schließt (wie REQ-030). */
export const SCHREIBFENSTER_ZUG_SCHWELLE = 80;

/** Icon je Bewertungskriterium (REQ-046); Chili, Geist und Person mit Krone sind eigene Icons. */
export const KRITERIUM_SYMBOL: Record<KriteriumId, SymbolName> = {
  sterne: 'stern',
  tempo: 'funkeln',
  weltenbau: 'globus',
  spice: 'chili',
  spannung: 'ekg',
  action: 'blitz',
  hauptfiguren: 'personKrone',
  nebenfiguren: 'gruppe',
  plotTwist: 'tornado',
  traenen: 'tropfen',
  romantik: 'herz',
  humor: 'lachen',
  grusel: 'geist',
  dialoge: 'sprechblasen',
};

export const STUFEN = [1, 2, 3, 4, 5] as const;

export const abschnittKopfStil: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  margin: `32px ${RAND}px 14px`,
};

export const abschnittUeberschriftStil: CSSProperties = {
  margin: 0,
  fontSize: '15px',
  fontWeight: 700,
  letterSpacing: '0.04em',
  textTransform: 'uppercase',
  color: rezensionFarbe('abschnittsueberschrift'),
};

export const abschnittSchaltflaecheStil: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '40px',
  height: '40px',
  margin: '-8px -8px -8px 0',
  padding: 0,
  border: 'none',
  background: 'none',
  cursor: 'pointer',
  WebkitTapHighlightColor: 'transparent',
};

export const karteStil: CSSProperties = {
  boxSizing: 'border-box',
  margin: `0 ${RAND}px`,
  padding: '4px 14px 4px 18px',
  borderRadius: '24px',
  border: `2px solid ${rezensionFarbe('karteRahmen')}`,
  backgroundColor: rezensionFarbe('karteFlaeche'),
};

