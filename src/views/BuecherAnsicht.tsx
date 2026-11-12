import { useEffect, useMemo, useState, type CSSProperties } from 'react';
import type { Bildquelle } from '@/bild/bildquelle';
import ManuellerEintrag from '@/buchanlegen/ManuellerEintrag';
import AbschnittNochZuLesen from '@/buecher/AbschnittNochZuLesen';
import { abschnittKonfiguration } from '@/buecher/abschnittKonfiguration';
import { ladeBuecher, standardBildspeicher } from '@/buecher/buchQuelle';
import Filterleiste from '@/buecher/Filterleiste';
import { filterKonfiguration, type FilterDefinition } from '@/buecher/filterKonfiguration';
import Kopfbereich from '@/buecher/Kopfbereich';
import PlatzhalterAbschnitt from '@/buecher/PlatzhalterAbschnitt';
import type { Buch } from '@/domain/buch';
import type { BookRepository, ImageStore } from '@/storage';
import BuchDetails from './BuchDetails';

interface Props {
  /** Filter der Filterleiste; ohne Angabe die zentrale Filterkonfiguration (REQ-007). */
  filter?: FilterDefinition[];
  /** Bücher; ohne Angabe werden sie über das Repository geladen. */
  buecher?: Buch[];
  /** Buchspeicher (Laden und Anlegen); ohne Angabe das dauerhafte Repository der App (REQ-034). In Tests ersetzbar. */
  repository?: BookRepository;
  /** Bildquelle der Buchdetails; in Tests ersetzbar. */
  bildquelle?: Bildquelle;
  /** Bildspeicher (Frontcover in der Liste, Bilder der Buchdetails); in Tests ersetzbar. */
  bildspeicher?: ImageStore;
  /** Aktuelle Zeit für Sitzungen und Streak in den Buchdetails (REQ-024, REQ-027); in Tests ersetzbar. */
  jetzt?: () => Date;
}

const seiteStil: CSSProperties = {
  paddingBottom: '24px',
};

/** Lädt die Bücher über die Repository-Schnittstelle, sofern keine übergeben wurden; `stand` erzwingt ein Neuladen. */
function useBuecher(vorgegeben: Buch[] | undefined, repository: BookRepository | undefined, stand: number): Buch[] | undefined {
  const [geladen, setGeladen] = useState<Buch[] | undefined>(undefined);
  const laden = vorgegeben === undefined;
  useEffect(() => {
    if (!laden) return;
    let aktiv = true;
    void (repository ? repository.list() : ladeBuecher()).then(
      (b) => {
        if (aktiv) setGeladen(b);
      },
      (fehler: unknown) => {
        console.warn('Bücher konnten nicht geladen werden:', fehler);
        if (aktiv) setGeladen([]);
      },
    );
    return () => {
      aktiv = false;
    };
  }, [laden, repository, stand]);
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

type Ansicht = { art: 'liste' } | { art: 'eintrag' } | { art: 'details'; buch: Buch };

/**
 * Seite „Bücher“ (REQ-005, REQ-006, REQ-009 bis REQ-012) mit Zugang zu den Buchdetails (REQ-013)
 * und zum Anlegen eines Buches über das Plus-Menü (REQ-029 bis REQ-032).
 */
export default function BuecherAnsicht({ filter, buecher, repository, bildquelle, bildspeicher, jetzt }: Props) {
  const [stand, setStand] = useState(0);
  const alle = useBuecher(buecher, repository, stand);
  const speicher = useMemo(() => bildspeicher ?? standardBildspeicher(), [bildspeicher]);
  const [ansicht, setAnsicht] = useState<Ansicht>({ art: 'liste' });
  const [menueOffen, setMenueOffen] = useState(false);
  // Beim Zurückkehren aus den Buchdetails werden die Frontcover neu gelesen (REQ-020).
  const [frontcover, coverVerwerfen] = useFrontcover(alle, speicher, ansicht.art === 'liste');
  const oeffnen = (buch: Buch) => {
    coverVerwerfen();
    setAnsicht({ art: 'details', buch });
  };
  const zurListe = () => {
    setAnsicht({ art: 'liste' });
    setStand((n) => n + 1);
  };

  if (ansicht.art === 'details') {
    return (
      <BuchDetails
        buchId={ansicht.buch.id}
        buch={ansicht.buch}
        bildquelle={bildquelle}
        bildspeicher={speicher}
        repository={repository}
        jetzt={jetzt}
        onZurueck={zurListe}
      />
    );
  }

  if (ansicht.art === 'eintrag') {
    return (
      <ManuellerEintrag
        repository={repository}
        bildspeicher={speicher}
        bildquelle={bildquelle}
        onZurueck={() => setAnsicht({ art: 'liste' })}
        onAngelegt={(buch) => {
          // Danach die Buchdetails des neuen Buches (REQ-031, AK-7); die Liste lädt neu.
          setStand((n) => n + 1);
          oeffnen(buch);
        }}
      />
    );
  }

  return (
    <div style={seiteStil}>
      <Kopfbereich
        menueOffen={menueOffen}
        onPlus={() => setMenueOffen((offen) => !offen)}
        onVonHand={() => {
          setMenueOffen(false);
          setAnsicht({ art: 'eintrag' });
        }}
        onMenueSchliessen={() => setMenueOffen(false)}
      />
      <Filterleiste filter={filter ?? filterKonfiguration} buecher={alle ?? []} />
      <AbschnittNochZuLesen buecher={alle} frontcover={frontcover} onBuchAntippen={oeffnen} />
      <PlatzhalterAbschnitt {...abschnittKonfiguration.sagas} />
      <PlatzhalterAbschnitt {...abschnittKonfiguration.sammlungen} />
    </div>
  );
}
