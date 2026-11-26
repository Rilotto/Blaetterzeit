// Filter „Sprache“ über der Suchzeile der Online-Suchen (REQ-119).
import { useEffect, useState, type CSSProperties } from 'react';
import { blattHinweisStil } from '@/buchdetails/BlattUnten';
import { kapselStil } from '@/buecher/Filterleiste';
import { abstand, stilRolle, textstufe, uebersichtFarbe } from '@/theme';
import {
  MINDESTENS_EINE_SPRACHE_HINWEIS,
  SPRACHE_NAME,
  SPRACHEN,
  SPRACHFILTER_TITEL,
  spracheUmschalten,
  type Sprache,
} from './sprache';

/** So lange bleibt der Hinweis „Mindestens eine Sprache …“ sichtbar. */
export const SPRACHFILTER_HINWEIS_MS = 2500;

interface Props {
  auswahl: readonly Sprache[];
  onAendern: (neu: Sprache[]) => void;
}

const zeileStil: CSSProperties = { display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: abstand('s'), marginBottom: abstand('m') };

const titelStil: CSSProperties = {
  margin: `0 ${abstand('xs')} 0 0`,
  ...textstufe('meta'),
  fontWeight: 600,
  color: uebersichtFarbe('suchfeldText'),
};

const hinweisStil: CSSProperties = { ...blattHinweisStil, width: '100%', margin: 0 };

/**
 * Sprachfilter (REQ-119): Beschriftung „Sprache“, dann „Deutsch“ und „Englisch“ als Mehrfachauswahl.
 * Klassisch: Pillen wie aktive/inaktive Filter (REQ-006); Feuilleton: Text, gewählte unterstrichen (Stil-Rolle „reiter“,
 * aktiv über aria-pressed, REQ-071). Die letzte gewählte Sprache bleibt gewählt, mit kurzem Hinweis.
 */
export default function Sprachfilter({ auswahl, onAendern }: Props) {
  const [hinweis, setHinweis] = useState(0);
  useEffect(() => {
    if (hinweis === 0) return;
    const t = setTimeout(() => setHinweis(0), SPRACHFILTER_HINWEIS_MS);
    return () => clearTimeout(t);
  }, [hinweis]);

  const antippen = (s: Sprache) => {
    const neu = spracheUmschalten(auswahl, s);
    if (neu === null) {
      setHinweis((n) => n + 1);
      return;
    }
    setHinweis(0);
    onAendern(neu);
  };

  return (
    <div role="group" aria-label={SPRACHFILTER_TITEL} data-sprachfilter="" style={zeileStil}>
      <span data-sprachfilter-titel="" style={titelStil}>
        {SPRACHFILTER_TITEL}
      </span>
      {SPRACHEN.map((s) => {
        const gewaehlt = auswahl.includes(s);
        return (
          <button
            key={s}
            type="button"
            data-sprache={s}
            data-aktiv={gewaehlt ? 'true' : undefined}
            aria-pressed={gewaehlt}
            onClick={() => antippen(s)}
            {...stilRolle('reiter')}
            style={kapselStil(gewaehlt)}
          >
            {SPRACHE_NAME[s]}
          </button>
        );
      })}
      {hinweis > 0 ? (
        <p role="status" key={hinweis} data-sprachfilter-hinweis="" style={hinweisStil}>
          {MINDESTENS_EINE_SPRACHE_HINWEIS}
        </p>
      ) : null}
    </div>
  );
}
