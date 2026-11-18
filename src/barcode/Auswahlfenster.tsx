import type { CSSProperties } from 'react';
import iconZurueck from '@/assets/icons/icon-zurueck.png';
import Icon from '@/components/Icon';
import { barcodeFarbe, textstufe, zeilenabstand, abstand, bildschirmrand } from '@/theme';
import { QUELLEN_NAME, type Treffer } from './treffer';

interface Props {
  isbn: string;
  treffer: Treffer[];
  /** Treffer angetippt. */
  onWahl: (t: Treffer) => void;
  /** Zurück-Pfeil angetippt. */
  onZurueck: () => void;
}

const fensterStil: CSSProperties = {
  position: 'fixed',
  inset: 0,
  zIndex: 20,
  boxSizing: 'border-box',
  overflowY: 'auto',
  backgroundColor: barcodeFarbe('auswahlFlaeche'),
};

const innenStil: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: abstand('m'),
  padding: `${abstand('s')} ${bildschirmrand} calc(${abstand('xl')} + ${abstand('s')})`,
};

const zurueckStil: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '44px',
  height: '44px',
  margin: `0 0 0 calc(-1 * ${abstand('s')})`,
  padding: 0,
  border: 'none',
  background: 'none',
  cursor: 'pointer',
  WebkitTapHighlightColor: 'transparent',
};

const ueberschriftStil: CSSProperties = {
  margin: `${abstand('xs')} 0 0`,
  ...textstufe('abschnitt'),
  fontWeight: 700,
  lineHeight: 1.2,
  color: barcodeFarbe('auswahlUeberschrift'),
};

const textStil: CSSProperties = {
  margin: `0 0 ${abstand('s')}`,
  ...textstufe('text'),
  lineHeight: zeilenabstand,
  color: barcodeFarbe('auswahlText'),
};

const trefferStil: CSSProperties = {
  display: 'flex',
  gap: abstand('m'),
  alignItems: 'flex-start',
  boxSizing: 'border-box',
  width: '100%',
  margin: 0,
  padding: abstand('m'),
  border: `1.5px solid ${barcodeFarbe('trefferRahmen')}`,
  borderRadius: '16px',
  backgroundColor: barcodeFarbe('trefferFlaeche'),
  fontFamily: 'inherit',
  textAlign: 'left',
  cursor: 'pointer',
  WebkitTapHighlightColor: 'transparent',
};

const coverStil: CSSProperties = {
  flex: '0 0 auto',
  width: '56px',
  height: '84px',
  borderRadius: '6px',
  objectFit: 'cover',
  backgroundColor: barcodeFarbe('trefferRahmen'),
};

const titelStil: CSSProperties = {
  display: 'block',
  ...textstufe('titel'),
  fontWeight: 600,
  lineHeight: 1.25,
  color: barcodeFarbe('trefferTitel'),
};

const zeileStil: CSSProperties = {
  display: 'block',
  marginTop: abstand('xs'),
  ...textstufe('meta'),
  lineHeight: 1.3,
  color: barcodeFarbe('trefferText'),
};

const quelleStil: CSSProperties = {
  display: 'block',
  marginTop: abstand('s'),
  ...textstufe('meta'),
  fontStyle: 'italic',
  color: barcodeFarbe('quelle'),
};

const details = (t: Treffer): string =>
  [
    t.angaben.verlag,
    t.angaben.erscheinungsjahr !== undefined ? String(t.angaben.erscheinungsjahr) : undefined,
    t.angaben.seitenanzahl !== undefined ? `${t.angaben.seitenanzahl} Seiten` : undefined,
  ]
    .filter(Boolean)
    .join(' · ');

/** Auswahlfenster (REQ-062): alle Treffer beider Quellen, je mit Quelle, und Zurück-Pfeil. */
export default function Auswahlfenster({ isbn, treffer, onWahl, onZurueck }: Props) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Gefundene Bücher"
      data-auswahlfenster=""
      data-isbn={isbn}
      data-sicherer-bereich=""
      style={fensterStil}
    >
      <div style={innenStil}>
        <button type="button" aria-label="Zurück" data-auswahl-zurueck="" onClick={onZurueck} style={zurueckStil}>
          <Icon datei="icon-zurueck.png" url={iconZurueck} farbe={barcodeFarbe('zurueckIcon')} groesse={24} />
        </button>
        <h2 data-auswahl-ueberschrift="" style={ueberschriftStil}>
          Schau mal, was ich gefunden habe
        </h2>
        <p data-auswahl-text="" style={textStil}>
          Zur ISBN {isbn} habe ich {treffer.length === 1 ? 'dieses Buch' : 'diese Bücher'} gefunden. Welches möchtest du
          übernehmen?
        </p>
        {treffer.map((t, i) => {
          const zeile = details(t);
          return (
            <button
              key={`${t.quelle}-${i}`}
              type="button"
              data-treffer={i}
              data-quelle={t.quelle}
              onClick={() => onWahl(t)}
              style={trefferStil}
            >
              {t.angaben.cover ? (
                <img src={t.angaben.cover} alt="" data-treffer-cover="" style={coverStil} />
              ) : (
                <span aria-hidden="true" data-treffer-cover-leer="" style={coverStil} />
              )}
              <span style={{ minWidth: 0 }}>
                <span data-treffer-titel="" style={titelStil}>
                  {t.angaben.titel}
                </span>
                {t.angaben.autor ? (
                  <span data-treffer-autor="" style={{ ...zeileStil, fontStyle: 'italic' }}>
                    {t.angaben.autor}
                  </span>
                ) : null}
                {zeile ? <span style={zeileStil}>{zeile}</span> : null}
                <span data-treffer-quelle="" style={quelleStil}>
                  Quelle: {QUELLEN_NAME[t.quelle]}
                </span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
