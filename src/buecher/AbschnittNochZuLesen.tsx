import type { CSSProperties } from 'react';
import iconHerz from '@/assets/icons/icon-herz.png';
import CoverPlatzhalter from '@/components/CoverPlatzhalter';
import Icon from '@/components/Icon';
import { coverBreite, coverFlaecheStil } from '@/components/coverFlaeche';
import type { Buch } from '@/domain/buch';
import { buecherFarbe } from '@/theme';
import { abschnittKonfiguration, buecherNochZuLesen } from './abschnittKonfiguration';
import PlatzhalterText from './PlatzhalterText';
import {
  abschnittKopfStil,
  abschnittStil,
  abschnittsueberschriftStil,
  horizontalScrollStil,
  seitenRand,
  textUnterCoverStil,
} from './layout';

interface Props {
  /** Alle Bücher; `undefined`, solange sie noch geladen werden. */
  buecher: Buch[] | undefined;
}

const alleAnsehenStil: CSSProperties = {
  flex: '0 0 auto',
  margin: 0,
  padding: 0,
  border: 'none',
  background: 'none',
  fontFamily: 'inherit',
  fontSize: '14px',
  fontStyle: 'italic',
  color: buecherFarbe('alleAnsehen'),
  cursor: 'pointer',
  WebkitTapHighlightColor: 'transparent',
};

// Oben/unten etwas Luft, damit der Coverschatten nicht abgeschnitten wird.
const listeStil: CSSProperties = {
  ...horizontalScrollStil,
  gap: '16px',
  margin: 0,
  paddingTop: '4px',
  paddingBottom: '8px',
  listStyle: 'none',
};

const eintragStil: CSSProperties = {
  flex: '0 0 auto',
  width: `${coverBreite}px`,
  minWidth: 0,
};

const coverStil: CSSProperties = {
  ...coverFlaecheStil,
  display: 'block',
  objectFit: 'cover',
};

const titelStil: CSSProperties = {
  ...textUnterCoverStil,
  color: buecherFarbe('buchtitel'),
  // Höchstens zwei Zeilen, danach Auslassungspunkte.
  display: '-webkit-box',
  WebkitBoxOrient: 'vertical',
  WebkitLineClamp: 2,
  overflow: 'hidden',
};

const leerBereichStil: CSSProperties = {
  padding: `4px ${seitenRand}px 8px`,
};

const leerFlaecheStil: CSSProperties = {
  ...coverFlaecheStil,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  border: `2px dashed ${buecherFarbe('leerplatzhalterRahmen')}`,
  backgroundColor: buecherFarbe('leerplatzhalterFlaeche'),
};

function Bucheintrag({ buch }: { buch: Buch }) {
  return (
    <li style={eintragStil}>
      {buch.cover ? <img src={buch.cover} alt={buch.titel} style={coverStil} /> : <CoverPlatzhalter />}
      <p data-buchtitel="" style={titelStil}>
        {buch.titel}
      </p>
    </li>
  );
}

/** Leere-Liste-Platzhalter (REQ-011). Antippen bewirkt noch nichts. */
function LeereListePlatzhalter() {
  return (
    <div style={leerBereichStil}>
      <div data-leere-liste="" style={{ width: `${coverBreite}px` }}>
        <div style={leerFlaecheStil}>
          <Icon datei="icon-herz.png" url={iconHerz} farbe={buecherFarbe('leerplatzhalterIcon')} groesse={40} />
        </div>
        <PlatzhalterText farbe={buecherFarbe('leerplatzhalterText')}>Wie wäre es mit einem neuen Buch?</PlatzhalterText>
      </div>
    </div>
  );
}

/** Abschnitt „Noch zu lesen“ mit horizontal wischbarer Buchliste (REQ-009). */
export default function AbschnittNochZuLesen({ buecher }: Props) {
  const { titel } = abschnittKonfiguration.nochZuLesen;
  const auswahl = buecher === undefined ? undefined : buecherNochZuLesen(buecher);

  return (
    <section aria-label={titel} style={abschnittStil}>
      <div style={abschnittKopfStil}>
        <h2 style={abschnittsueberschriftStil}>{titel}</h2>
        <button type="button" style={alleAnsehenStil}>
          Alle ansehen ›
        </button>
      </div>
      {auswahl === undefined ? null : auswahl.length === 0 ? (
        <LeereListePlatzhalter />
      ) : (
        <ul aria-label={titel} style={listeStil}>
          {auswahl.map((b) => (
            <Bucheintrag key={b.id} buch={b} />
          ))}
        </ul>
      )}
    </section>
  );
}
