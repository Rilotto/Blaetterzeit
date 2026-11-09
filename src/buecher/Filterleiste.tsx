import { useState, type CSSProperties } from 'react';
import type { Buch } from '@/domain/buch';
import { buecherFarbe } from '@/theme';
import type { FilterDefinition } from './filterKonfiguration';
import { horizontalScrollStil } from './layout';

interface Props {
  filter: FilterDefinition[];
  buecher: Buch[];
}

// Höhe eines Filters laut Orientierungswert in REQ-006 (≈ 30 dp).
const HOEHE = 30;

const leisteStil: CSSProperties = {
  ...horizontalScrollStil,
  gap: '8px',
  marginTop: '16px',
};

const kapselStil = (aktiv: boolean): CSSProperties => ({
  boxSizing: 'border-box',
  flex: '0 0 auto',
  height: `${HOEHE}px`,
  margin: 0,
  padding: '0 16px',
  borderRadius: '9999px',
  whiteSpace: 'nowrap',
  fontFamily: 'inherit',
  fontSize: '15px',
  fontWeight: 500,
  lineHeight: 1,
  cursor: 'pointer',
  WebkitTapHighlightColor: 'transparent',
  ...(aktiv
    ? {
        border: 'none',
        backgroundColor: buecherFarbe('filterAktivHintergrund'),
        color: buecherFarbe('filterAktivSchrift'),
      }
    : {
        border: `1px solid ${buecherFarbe('filterInaktivRahmen')}`,
        backgroundColor: buecherFarbe('filterInaktivHintergrund'),
        color: buecherFarbe('filterInaktivSchrift'),
      }),
});

const sortiert = (filter: FilterDefinition[]) => [...filter].sort((a, b) => a.reihenfolge - b.reihenfolge);

/** Horizontal wischbare Filterleiste (REQ-006). Filter kommen ausschließlich aus der Konfiguration (REQ-007). */
export default function Filterleiste({ filter, buecher }: Props) {
  const liste = sortiert(filter);
  // Bei jedem Aufruf der Seite neu: Standardfilter aktiv (sonst der erste).
  const [aktivId, setAktivId] = useState(() => (liste.find((f) => f.standard) ?? liste[0])?.id);

  const antippen = (f: FilterDefinition) => {
    setAktivId(f.id);
    // Anknüpfungspunkt für die spätere Filterlogik; im Grundgerüst ohne sichtbare Wirkung.
    f.logik?.(buecher);
  };

  return (
    <div role="group" aria-label="Filter" style={leisteStil}>
      {liste.map((f) => {
        const aktiv = f.id === aktivId;
        return (
          <button key={f.id} type="button" aria-pressed={aktiv} onClick={() => antippen(f)} style={kapselStil(aktiv)}>
            {f.name}
          </button>
        );
      })}
    </div>
  );
}
