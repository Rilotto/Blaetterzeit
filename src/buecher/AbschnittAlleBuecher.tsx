import type { Buch } from '@/domain/buch';
import { neuesteBuecher } from '@/domain/uebersicht';
import { Bucheintrag, LeereListePlatzhalter, alleAnsehenStil, buchreiheStil } from './AbschnittNochZuLesen';
import { abschnittKonfiguration } from './abschnittKonfiguration';
import { abschnittKopfStil, abschnittStil, abschnittsueberschriftStil } from './layout';

interface Props {
  /** Alle Bücher; `undefined`, solange sie noch geladen werden. */
  buecher: Buch[] | undefined;
  /** Frontcover je Buch-ID (REQ-020); haben Vorrang vor `buch.cover`. */
  frontcover?: Record<string, string>;
  /** Cover oder Titel angetippt: Buchdetails (REQ-035, AK-10). */
  onBuchAntippen?: (buch: Buch) => void;
  /** „Alle ansehen ›“ angetippt: Übersicht „Alle Bücher“ (REQ-035, AK-4). */
  onAlleAnsehen?: () => void;
}

/**
 * Abschnitt „Alle Bücher“ (REQ-035): die höchstens zehn zuletzt eingetragenen Bücher jedes Lesestatus,
 * neuestes links; ohne Bücher genau ein Leere-Liste-Platzhalter mit eigenem Text.
 */
export default function AbschnittAlleBuecher({ buecher, frontcover, onBuchAntippen, onAlleAnsehen }: Props) {
  const { titel, platzhaltertext } = abschnittKonfiguration.alleBuecher;
  const auswahl = buecher === undefined ? undefined : neuesteBuecher(buecher);

  return (
    <section aria-label={titel} data-abschnitt="alle-buecher" style={abschnittStil}>
      <div style={abschnittKopfStil}>
        <h2 style={abschnittsueberschriftStil}>{titel}</h2>
        <button type="button" data-alle-ansehen="" onClick={onAlleAnsehen} style={alleAnsehenStil}>
          Alle ansehen ›
        </button>
      </div>
      {auswahl === undefined ? null : auswahl.length === 0 ? (
        <LeereListePlatzhalter text={platzhaltertext} />
      ) : (
        <ul aria-label={titel} style={buchreiheStil}>
          {auswahl.map((b) => (
            <Bucheintrag key={b.id} buch={b} cover={frontcover?.[b.id] ?? b.cover} onAntippen={onBuchAntippen} />
          ))}
        </ul>
      )}
    </section>
  );
}
