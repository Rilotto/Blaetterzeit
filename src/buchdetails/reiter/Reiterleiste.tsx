import type { CSSProperties } from 'react';
import Symbolbild from '@/components/Symbolbild';
import { rezensionFarbe, reiterPilleSchatten, textstufe, abstand, stilRolle } from '@/theme';
import { abstandsraster } from '@/theme/typografie';
import { RAND } from '../masse';
import { REITER, type ReiterId } from './rezension';

// Anteile an der Leistenbreite: der aktive Reiter ist breiter, da er Icon und Bezeichnung zeigt.
const ANTEIL_AKTIV = 2.6;
const ANTEIL_INAKTIV = 1;
const SUMME = ANTEIL_AKTIV + 3 * ANTEIL_INAKTIV;
// Innenabstand = Rasterabstand „s“ (REQ-065 AK-8).
const INNEN = abstandsraster.s;
const UEBERGANG = '320ms cubic-bezier(0.4, 0, 0.2, 1)';

const leisteStil: CSSProperties = {
  position: 'relative',
  boxSizing: 'border-box',
  display: 'flex',
  margin: `${abstand('xl')} ${RAND}px 0`,
  height: '60px',
  padding: `${INNEN}px`,
  borderRadius: '30px',
  backgroundColor: rezensionFarbe('reiterleisteFlaeche'),
};

/** Lage der innenliegenden Pille: wandert per Übergang von left/width (REQ-043, AK-7). */
const pilleStil = (index: number): CSSProperties => ({
  position: 'absolute',
  top: `${INNEN}px`,
  bottom: `${INNEN}px`,
  left: `calc(${INNEN}px + (100% - ${2 * INNEN}px) * ${(index * ANTEIL_INAKTIV) / SUMME})`,
  width: `calc((100% - ${2 * INNEN}px) * ${ANTEIL_AKTIV / SUMME})`,
  borderRadius: '24px',
  backgroundColor: rezensionFarbe('reiterAktivFlaeche'),
  boxShadow: reiterPilleSchatten,
  transition: `left ${UEBERGANG}, width ${UEBERGANG}`,
});

const reiterStil = (aktiv: boolean): CSSProperties => ({
  position: 'relative',
  zIndex: 1,
  flex: `${aktiv ? ANTEIL_AKTIV : ANTEIL_INAKTIV} 1 0`,
  minWidth: 0,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: abstand('s'),
  margin: 0,
  padding: 0,
  border: 'none',
  background: 'none',
  fontFamily: 'inherit',
  ...textstufe('text'),
  fontWeight: 700,
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  color: rezensionFarbe('reiterAktivSchrift'),
  cursor: 'pointer',
  transition: `flex-grow ${UEBERGANG}`,
  WebkitTapHighlightColor: 'transparent',
});

interface Props {
  aktiv: ReiterId;
  onWaehlen: (reiter: ReiterId) => void;
}

/** Reiterleiste („graue Pille“) mit wandernder innenliegender Pille (REQ-043). */
export default function Reiterleiste({ aktiv, onWaehlen }: Props) {
  const index = REITER.findIndex((r) => r.id === aktiv);
  return (
    <div role="tablist" aria-label="Bereiche" data-reiterleiste="" {...stilRolle('leiste')} style={leisteStil}>
      <div aria-hidden="true" data-reiterpille="" data-reiter-index={index} {...stilRolle('leistenpille')} style={pilleStil(index)} />
      {REITER.map((r) => {
        const istAktiv = r.id === aktiv;
        return (
          <button
            key={r.id}
            type="button"
            role="tab"
            aria-selected={istAktiv}
            aria-label={r.name}
            data-reiter={r.id}
            data-aktiv={istAktiv ? 'true' : 'false'}
            onClick={() => {
              if (!istAktiv) onWaehlen(r.id);
            }}
            {...stilRolle('reiter')} style={reiterStil(istAktiv)}
          >
            <Symbolbild
              name={r.symbol}
              farbe={istAktiv ? rezensionFarbe('reiterAktivSchrift') : rezensionFarbe('reiterInaktivIcon')}
              groesse={22}
            />
            {istAktiv ? <span data-reiter-bezeichnung="">{r.name}</span> : null}
          </button>
        );
      })}
    </div>
  );
}
