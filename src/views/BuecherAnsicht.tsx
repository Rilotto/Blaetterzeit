import { useEffect, useMemo, useState, type CSSProperties } from 'react';
import type { Bildquelle } from '@/bild/bildquelle';
import AbschnittNochZuLesen from '@/buecher/AbschnittNochZuLesen';
import { abschnittKonfiguration } from '@/buecher/abschnittKonfiguration';
import { ladeBuecher, standardBildspeicher } from '@/buecher/buchQuelle';
import Filterleiste from '@/buecher/Filterleiste';
import { filterKonfiguration, type FilterDefinition } from '@/buecher/filterKonfiguration';
import Kopfbereich from '@/buecher/Kopfbereich';
import PlatzhalterAbschnitt from '@/buecher/PlatzhalterAbschnitt';
import type { Buch } from '@/domain/buch';
import type { ImageStore } from '@/storage';
import BuchDetails from './BuchDetails';

interface Props {
  /** Filter der Filterleiste; ohne Angabe die zentrale Filterkonfiguration (REQ-007). */
  filter?: FilterDefinition[];
  /** Bücher; ohne Angabe werden sie über das Repository geladen (Demodaten). */
  buecher?: Buch[];
  /** Bildquelle der Buchdetails; in Tests ersetzbar. */
  bildquelle?: Bildquelle;
  /** Bildspeicher (Frontcover in der Liste, Bilder der Buchdetails); in Tests ersetzbar. */
  bildspeicher?: ImageStore;
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

/** Frontcover (Bereich „Cover“) je Buch aus dem Bildspeicher (REQ-020). */
function useFrontcover(
  buecher: Buch[] | undefined,
  speicher: ImageStore,
  aktiv: boolean,
): [Record<string, string>, () => void] {
  const [cover, setCover] = useState<Record<string, string>>({});
  useEffect(() => {
    if (!buecher || !aktiv) return;
    let laeuft = true;
    void Promise.all(buecher.map(async (b) => [b.id, await speicher.get(b.id, 'cover')] as const)).then((paare) => {
      if (!laeuft) return;
      const neu: Record<string, string> = {};
      for (const [id, bild] of paare) if (bild) neu[id] = bild;
      // Nur bei Änderung neu setzen (vermeidet unnötige Renderdurchläufe).
      setCover((alt) => {
        const a = Object.entries(alt);
        const n = Object.entries(neu);
        return a.length === n.length && n.every(([id, bild]) => alt[id] === bild) ? alt : neu;
      });
    });
    return () => {
      laeuft = false;
    };
  }, [buecher, speicher, aktiv]);
  // Beim Öffnen der Buchdetails verwerfen: Dort kann sich jedes Bild ändern (kein veraltetes Cover nach der Rückkehr).
  const verwerfen = () => setCover({});
  return [cover, verwerfen];
}

/** Seite „Bücher“ (REQ-005, REQ-006, REQ-009 bis REQ-012) mit Zugang zu den Buchdetails (REQ-013). */
export default function BuecherAnsicht({ filter, buecher, bildquelle, bildspeicher }: Props) {
  const alle = useBuecher(buecher);
  const speicher = useMemo(() => bildspeicher ?? standardBildspeicher(), [bildspeicher]);
  const [offen, setOffen] = useState<Buch | null>(null);
  // Beim Zurückkehren aus den Buchdetails werden die Frontcover neu gelesen (REQ-020).
  const [frontcover, coverVerwerfen] = useFrontcover(alle, speicher, offen === null);
  const oeffnen = (buch: Buch) => {
    coverVerwerfen();
    setOffen(buch);
  };

  if (offen) {
    return (
      <BuchDetails
        buchId={offen.id}
        buch={offen}
        bildquelle={bildquelle}
        bildspeicher={speicher}
        onZurueck={() => setOffen(null)}
      />
    );
  }

  return (
    <div style={seiteStil}>
      <Kopfbereich />
      <Filterleiste filter={filter ?? filterKonfiguration} buecher={alle ?? []} />
      <AbschnittNochZuLesen buecher={alle} frontcover={frontcover} onBuchAntippen={oeffnen} />
      <PlatzhalterAbschnitt {...abschnittKonfiguration.sagas} />
      <PlatzhalterAbschnitt {...abschnittKonfiguration.sammlungen} />
    </div>
  );
}
