import type { CSSProperties } from 'react';
import Symbolbild from '@/components/Symbolbild';
import { KRITERIEN, stufentext, type Bewertungen, type KriteriumId } from '@/domain/bewertung';
import { kriteriumBlass, kriteriumVoll, rezensionFarbe, textstufe, pillenhoehe, abstand, tippflaeche, stilRolle } from '@/theme';
import { KRITERIUM_SYMBOL, STUFEN, abschnittKopfStil, abschnittSchaltflaecheStil, abschnittUeberschriftStil, karteStil } from './rezension';

const zeileStil = (letzte: boolean): CSSProperties => ({
  display: 'flex',
  alignItems: 'center',
  gap: abstand('s'),
  minHeight: '60px',
  padding: `${abstand('s')} 0`,
  borderBottom: letzte ? 'none' : `1.5px solid ${rezensionFarbe('trennlinie')}`,
});

const namenBereichStil: CSSProperties = { flex: '1 1 auto', minWidth: 0 };

const nameStil: CSSProperties = {
  display: 'block',
  ...textstufe('text'),
  fontWeight: 700,
  lineHeight: 1.2,
  overflowWrap: 'break-word',
  color: rezensionFarbe('kriteriumName'),
};

const stufentextStil: CSSProperties = {
  display: 'block',
  marginTop: abstand('xs'),
  ...textstufe('meta'),
  fontStyle: 'italic',
  lineHeight: 1.25,
  color: rezensionFarbe('stufentext'),
};

const symboleStil: CSSProperties = { display: 'flex', flex: '0 0 auto' };

const symbolSchaltflaecheStil: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  // Breite = Mindest-Tippfläche (REQ-065 AK-9): Die 44-px-Flächen der Symbole liegen lückenlos nebeneinander,
  // ohne sich zu überlappen (die Vergrößerung per ::before greift hier nicht über die Breite hinaus).
  width: tippflaeche,
  height: pillenhoehe,
  margin: 0,
  padding: 0,
  border: 'none',
  background: 'none',
  cursor: 'pointer',
  WebkitTapHighlightColor: 'transparent',
};

interface Props {
  bewertungen: Bewertungen | undefined;
  /** n-tes Symbol eines Kriteriums angetippt (REQ-045). */
  onAntippen: (kriterium: KriteriumId, n: number) => void;
}

/** Bereich „Bewertung“ mit 14 Kriterien, je fünf Symbole und Stufentext (REQ-044, REQ-045, REQ-046, REQ-048). */
export default function Bewertung({ bewertungen, onAntippen }: Props) {
  return (
    <section aria-label="Bewertung" data-bereich-bewertung="">
      <div style={abschnittKopfStil}>
        <h2 data-abschnitt-ueberschrift="" style={abschnittUeberschriftStil}>
          Bewertung
        </h2>
        {/* Filtersymbol: vorerst ohne Funktion (REQ-044, AK-4; To-do-Liste). */}
        <button type="button" aria-label="Bewertungskriterien filtern" data-bewertung-filter="" style={abschnittSchaltflaecheStil}>
          <Symbolbild name="filter" farbe={rezensionFarbe('abschnittsIcon')} groesse={26} />
        </button>
      </div>
      <div data-bewertung-karte="" {...stilRolle('karte')} style={karteStil}>
        {KRITERIEN.map((k, i) => {
          const wert = bewertungen?.[k.id];
          const text = stufentext(k.id, wert);
          return (
            <div key={k.id} data-kriterium={k.id} data-wert={wert ?? ''} style={zeileStil(i === KRITERIEN.length - 1)}>
              <div style={namenBereichStil}>
                <span data-kriterium-name="" style={nameStil}>
                  {k.name}
                </span>
                {text ? (
                  <span data-stufentext="" style={stufentextStil}>
                    {text}
                  </span>
                ) : null}
              </div>
              <div style={symboleStil}>
                {STUFEN.map((n) => {
                  const voll = wert !== undefined && n <= wert;
                  return (
                    <button
                      key={n}
                      type="button"
                      aria-label={`${k.name} ${n}`}
                      aria-pressed={wert === n}
                      data-symbol-nr={n}
                      data-voll={voll ? 'true' : 'false'}
                      onClick={() => onAntippen(k.id, n)}
                      style={symbolSchaltflaecheStil}
                    >
                      <Symbolbild name={KRITERIUM_SYMBOL[k.id]} farbe={voll ? kriteriumVoll(k.id) : kriteriumBlass(k.id)} groesse={22} />
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
