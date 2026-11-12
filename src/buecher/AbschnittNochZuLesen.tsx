import type { CSSProperties } from 'react';
import iconHerz from '@/assets/icons/icon-herz.png';
import CoverPlatzhalter from '@/components/CoverPlatzhalter';
import Icon from '@/components/Icon';
import { coverBreite, coverFlaecheStil } from '@/components/coverFlaeche';
import type { Buch } from '@/domain/buch';
import { buecherFarbe, textformatAlleAnsehen } from '@/theme';
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
  /** Frontcover aus den Buchdetails je Buch-ID (REQ-020); haben Vorrang vor `buch.cover`. */
  frontcover?: Record<string, string>;
  /** Antippen von Cover oder Titel öffnet die Buchdetails (REQ-013). */
  onBuchAntippen?: (buch: Buch) => void;
  /** „Alle ansehen ›“ angetippt: Übersicht „Noch zu lesen“ (REQ-009 AK-14, REQ-040). */
  onAlleAnsehen?: () => void;
}

export const alleAnsehenStil: CSSProperties = {
  flex: '0 0 auto',
  margin: 0,
  padding: 0,
  border: 'none',
  background: 'none',
  // Zentrales Textformat, geteilt mit REQ-012 (AK-11) und REQ-014 (AK-3).
  ...textformatAlleAnsehen,
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
  cursor: 'pointer',
  WebkitTapHighlightColor: 'transparent',
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

/** Horizontale Buchliste der Abschnitte (REQ-009, REQ-035). */
export const buchreiheStil = listeStil;

/** Bucheintrag aus Cover (bzw. Cover-Platzhalter) und Buchtitel; gemeinsam für „Noch zu lesen“ und „Alle Bücher“. */
export function Bucheintrag({ buch, cover, onAntippen }: { buch: Buch; cover?: string; onAntippen?: (buch: Buch) => void }) {
  // Cover und Titel öffnen die Buchdetails (REQ-013, AK-1 bis AK-3; REQ-035, AK-10).
  return (
    <li data-bucheintrag={buch.id} style={eintragStil} onClick={onAntippen ? () => onAntippen(buch) : undefined}>
      {cover ? <img src={cover} alt={buch.titel} style={coverStil} /> : <CoverPlatzhalter />}
      <p data-buchtitel="" style={titelStil}>
        {buch.titel}
      </p>
    </li>
  );
}

/** Leere-Liste-Platzhalter (REQ-011) mit Text an der Titelstelle (REQ-035: eigener Text). Antippen bewirkt nichts. */
export function LeereListePlatzhalter({ text = 'Wie wäre es mit einem neuen Buch?' }: { text?: string }) {
  return (
    <div style={leerBereichStil}>
      <div data-leere-liste="" style={{ width: `${coverBreite}px` }}>
        <div style={leerFlaecheStil}>
          <Icon datei="icon-herz.png" url={iconHerz} farbe={buecherFarbe('leerplatzhalterIcon')} groesse={40} />
        </div>
        <PlatzhalterText farbe={buecherFarbe('leerplatzhalterText')}>{text}</PlatzhalterText>
      </div>
    </div>
  );
}

/** Abschnitt „Noch zu lesen“ mit horizontal wischbarer Buchliste (REQ-009). */
export default function AbschnittNochZuLesen({ buecher, frontcover, onBuchAntippen, onAlleAnsehen }: Props) {
  const { titel } = abschnittKonfiguration.nochZuLesen;
  const auswahl = buecher === undefined ? undefined : buecherNochZuLesen(buecher);

  return (
    <section aria-label={titel} data-abschnitt="noch-zu-lesen" style={abschnittStil}>
      <div style={abschnittKopfStil}>
        <h2 style={abschnittsueberschriftStil}>{titel}</h2>
        <button type="button" data-alle-ansehen="" onClick={onAlleAnsehen} style={alleAnsehenStil}>
          Alle ansehen ›
        </button>
      </div>
      {auswahl === undefined ? null : auswahl.length === 0 ? (
        <LeereListePlatzhalter />
      ) : (
        <ul aria-label={titel} style={listeStil}>
          {auswahl.map((b) => (
            <Bucheintrag key={b.id} buch={b} cover={frontcover?.[b.id] ?? b.cover} onAntippen={onBuchAntippen} />
          ))}
        </ul>
      )}
    </section>
  );
}
