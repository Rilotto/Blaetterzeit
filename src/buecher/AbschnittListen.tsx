import type { CSSProperties } from 'react';
import CoverPlatzhalter from '@/components/CoverPlatzhalter';
import { coverBreite, coverFlaecheStil } from '@/components/coverFlaeche';
import { listenDerArt, type Liste, type ListenArt } from '@/domain/listen';
import { buecherFarbe, stilRolle } from '@/theme';
import { alleAnsehenStil, buchreiheStil } from './AbschnittNochZuLesen';
import { abschnittKonfiguration } from './abschnittKonfiguration';
import { abschnittKopfStil, abschnittStil, abschnittsueberschriftStil, textUnterCoverStil } from './layout';
import { PlatzhalterInhalt } from './PlatzhalterAbschnitt';

interface Props {
  art: Extract<ListenArt, 'saga' | 'sammlung'>;
  /** Alle Listen; `undefined`, solange sie geladen werden. */
  listen: Liste[] | undefined;
  /** Listenbilder je Listen-ID (REQ-100): an Stelle des Cover-Platzhalters. */
  listenbilder?: Record<string, string>;
  /** „Alle ansehen ›“: Listenübersicht der Art (REQ-097, AK-10). */
  onAlleAnsehen: () => void;
  /** Liste angetippt: direkt die geöffnete Liste (REQ-097, AK-8). */
  onListeAntippen: (liste: Liste) => void;
}

const eintragStil: CSSProperties = {
  flex: '0 0 auto',
  width: `${coverBreite}px`,
  minWidth: 0,
  cursor: 'pointer',
  WebkitTapHighlightColor: 'transparent',
};

const bildStil: CSSProperties = {
  ...coverFlaecheStil,
  display: 'block',
  // Nie verzerrt (REQ-100, AK-8).
  objectFit: 'cover',
};

const nameStil: CSSProperties = {
  ...textUnterCoverStil,
  color: buecherFarbe('buchtitel'),
  display: '-webkit-box',
  WebkitBoxOrient: 'vertical',
  WebkitLineClamp: 2,
  overflow: 'hidden',
};

/**
 * Abschnitt „Sagas“ bzw. „Sammlungen“ der Seite „Bücher“ (REQ-012, REQ-097): neben der Überschrift immer
 * „Alle ansehen ›“; mit Listen je Liste ein Cover-Platzhalter mit dem Namen an der Titelstelle (A–Z, horizontale
 * Reihe wie „Noch zu lesen“); ohne Listen der bisherige Platzhalter ohne Funktion.
 */
export default function AbschnittListen({ art, listen, listenbilder, onAlleAnsehen, onListeAntippen }: Props) {
  const konf = art === 'saga' ? abschnittKonfiguration.sagas : abschnittKonfiguration.sammlungen;
  // Solange die Listen laden, steht der Platzhalter (wie ohne Listen, REQ-012).
  const eigene = listenDerArt(listen ?? [], art);
  return (
    <section aria-label={konf.titel} data-abschnitt={art === 'saga' ? 'sagas' : 'sammlungen'} style={abschnittStil}>
      <div style={abschnittKopfStil}>
        <h2 style={abschnittsueberschriftStil}>{konf.titel}</h2>
        <button type="button" data-alle-ansehen="" data-alle-ansehen-listen={art} onClick={onAlleAnsehen} style={alleAnsehenStil}>
          Alle ansehen ›
        </button>
      </div>
      {eigene.length === 0 ? (
        <PlatzhalterInhalt platzhaltertext={konf.platzhaltertext} />
      ) : (
        <ul aria-label={konf.titel} style={buchreiheStil}>
          {eigene.map((l) => (
            <li key={l.id} data-listeneintrag={l.id} style={eintragStil} onClick={() => onListeAntippen(l)}>
              {listenbilder?.[l.id] ? (
                <img data-listenbild={l.id} src={listenbilder[l.id]} alt="" {...stilRolle('cover')} style={bildStil} />
              ) : (
                <CoverPlatzhalter />
              )}
              <p data-listentitel="" {...stilRolle('buchtitel')} style={nameStil}>
                {l.name}
              </p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
