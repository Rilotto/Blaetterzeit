import { useEffect, useState, type CSSProperties } from 'react';
import AbschnittNochZuLesen from '@/buecher/AbschnittNochZuLesen';
import { abschnittKonfiguration } from '@/buecher/abschnittKonfiguration';
import { ladeBuecher } from '@/buecher/buchQuelle';
import Filterleiste from '@/buecher/Filterleiste';
import { filterKonfiguration, type FilterDefinition } from '@/buecher/filterKonfiguration';
import Kopfbereich from '@/buecher/Kopfbereich';
import PlatzhalterAbschnitt from '@/buecher/PlatzhalterAbschnitt';
import type { Buch } from '@/domain/buch';

interface Props {
  /** Filter der Filterleiste; ohne Angabe die zentrale Filterkonfiguration (REQ-007). */
  filter?: FilterDefinition[];
  /** Bücher; ohne Angabe werden sie über das Repository geladen (Demodaten). */
  buecher?: Buch[];
}

const seiteStil: CSSProperties = {
  paddingBottom: '24px',
};

/** Lädt die Bücher über die Repository-Schnittstelle, sofern keine übergeben wurden. */
function useBuecher(vorgegeben: Buch[] | undefined): Buch[] | undefined {
  const [geladen, setGeladen] = useState<Buch[] | undefined>(undefined);
  const laden = vorgegeben === undefined;
  useEffect(() => {
    if (!laden) return;
    let aktiv = true;
    void ladeBuecher().then((b) => {
      if (aktiv) setGeladen(b);
    });
    return () => {
      aktiv = false;
    };
  }, [laden]);
  return vorgegeben ?? geladen;
}

/** Seite „Bücher“ (REQ-005, REQ-006, REQ-009 bis REQ-012). */
export default function BuecherAnsicht({ filter, buecher }: Props) {
  const alle = useBuecher(buecher);
  return (
    <div style={seiteStil}>
      <Kopfbereich />
      <Filterleiste filter={filter ?? filterKonfiguration} buecher={alle ?? []} />
      <AbschnittNochZuLesen buecher={alle} />
      <PlatzhalterAbschnitt titel={abschnittKonfiguration.sagas.titel} />
      <PlatzhalterAbschnitt titel={abschnittKonfiguration.sammlungen.titel} />
    </div>
  );
}
