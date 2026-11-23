import { useEffect, useMemo, useState } from 'react';
import type { Bildquelle } from '@/bild/bildquelle';
import { ladeBuecher, standardAnsichtRepository, standardBildspeicher, standardListenRepository } from '@/buecher/buchQuelle';
import type { Buch } from '@/domain/buch';
import type { ListenArt } from '@/domain/listen';
import type { AnsichtRepository, BookRepository, ImageStore, ListenRepository } from '@/storage';
import BuchDetails from '@/views/BuchDetails';
import { useListen } from './gemeinsam';
import ListeAnsicht from './ListeAnsicht';
import Listenuebersicht from './Listenuebersicht';

/** Ein Schritt der Listen-Navigation (REQ-097, REQ-098). */
export type ListenZiel =
  | { art: 'uebersicht'; listenArt: ListenArt; /** Buch im Kontext (aus den Buchdetails). */ buchId?: string }
  | { art: 'liste'; listeId: string }
  | { art: 'buch'; buchId: string };

export interface ListenNavigationProps {
  start: ListenZiel;
  /** Zurück vom ersten Schritt; ohne Angabe hat der erste Schritt keinen Zurück-Pfeil (Menüpunkt „Bibliothek“). */
  onZurueck?: () => void;
  repository?: BookRepository;
  listenRepository?: ListenRepository;
  bildspeicher?: ImageStore;
  bildquelle?: Bildquelle;
  ansichtRepository?: AnsichtRepository;
  jetzt?: () => Date;
}

/**
 * Flächendeckende Listen-Ansichten mit eigenem Verlauf: Listenübersicht → geöffnete Liste → Buchdetails und zurück
 * (REQ-097, REQ-098 AK-5). Speicherzugriff nur über die Repository-Schnittstellen (ADR-0002).
 */
export default function ListenNavigation({
  start,
  onZurueck,
  repository,
  listenRepository,
  bildspeicher,
  bildquelle,
  ansichtRepository,
  jetzt,
}: ListenNavigationProps) {
  const listenRepo = useMemo(() => listenRepository ?? standardListenRepository(), [listenRepository]);
  const speicher = useMemo(() => bildspeicher ?? standardBildspeicher(), [bildspeicher]);
  const ansichtSpeicher = useMemo(() => ansichtRepository ?? standardAnsichtRepository(), [ansichtRepository]);
  const { listen, zug, neuLaden } = useListen(listenRepo);
  const [verlauf, setVerlauf] = useState<ListenZiel[]>([start]);
  const [stand, setStand] = useState(0);
  const [buecher, setBuecher] = useState<Buch[] | undefined>(undefined);
  const [cover, setCover] = useState<Record<string, string>>({});
  const ziel = verlauf[verlauf.length - 1];

  useEffect(() => {
    let aktiv = true;
    void (repository ? repository.list() : ladeBuecher()).then(
      (b) => {
        if (aktiv) setBuecher(b);
      },
      () => {
        if (aktiv) setBuecher([]);
      },
    );
    return () => {
      aktiv = false;
    };
  }, [repository, stand]);

  useEffect(() => {
    if (!buecher || ziel.art !== 'liste') return;
    let aktiv = true;
    void Promise.all(buecher.map(async (b) => [b.id, await speicher.get(b.id, 'cover').catch(() => undefined)] as const)).then((paare) => {
      if (!aktiv) return;
      const neu: Record<string, string> = {};
      for (const [id, bild] of paare) if (bild) neu[id] = bild;
      setCover(neu);
    });
    return () => {
      aktiv = false;
    };
  }, [buecher, speicher, ziel.art]);

  const oeffnen = (z: ListenZiel) => setVerlauf((v) => [...v, z]);
  const zurueck = () => {
    if (verlauf.length <= 1) {
      onZurueck?.();
      return;
    }
    setVerlauf((v) => v.slice(0, -1));
    setStand((n) => n + 1);
    void neuLaden();
  };
  const zurueckMoeglich = verlauf.length > 1 || onZurueck !== undefined;

  if (ziel.art === 'buch') {
    return (
      <BuchDetails
        key={ziel.buchId}
        buchId={ziel.buchId}
        repository={repository}
        listenRepository={listenRepo}
        bildspeicher={speicher}
        bildquelle={bildquelle}
        jetzt={jetzt}
        onZurueck={zurueck}
      />
    );
  }

  if (ziel.art === 'liste') {
    const liste = listen?.find((l) => l.id === ziel.listeId);
    if (!liste) return null;
    return (
      <ListeAnsicht
        key={liste.id}
        liste={liste}
        zug={zug}
        buecher={buecher}
        frontcover={cover}
        repository={listenRepo}
        ansichtRepository={ansichtSpeicher}
        onGeaendert={neuLaden}
        onGeloescht={() =>
          // Danach die Listenübersicht dieser Art (REQ-098, AK-4).
          setVerlauf((v) => {
            const rest = v.slice(0, -1);
            const vorher = rest[rest.length - 1];
            return vorher?.art === 'uebersicht' && vorher.listenArt === liste.art ? rest : [...rest, { art: 'uebersicht', listenArt: liste.art }];
          })
        }
        onBuchAntippen={(b) => oeffnen({ art: 'buch', buchId: b.id })}
        onZurueck={zurueckMoeglich ? zurueck : undefined}
      />
    );
  }

  const buch = ziel.buchId ? buecher?.find((b) => b.id === ziel.buchId) : undefined;
  if (ziel.buchId && !buch && buecher === undefined) return null;
  return (
    <Listenuebersicht
      art={ziel.listenArt}
      buch={buch}
      listen={listen}
      zug={zug}
      buecher={buecher}
      repository={listenRepo}
      onGeaendert={neuLaden}
      onListeOeffnen={(l) => oeffnen({ art: 'liste', listeId: l.id })}
      onZurueck={zurueckMoeglich ? zurueck : undefined}
    />
  );
}
