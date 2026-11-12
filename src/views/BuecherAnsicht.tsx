import { useEffect, useMemo, useState, type CSSProperties } from 'react';
import type { Bildquelle } from '@/bild/bildquelle';
import ManuellerEintrag from '@/buchanlegen/ManuellerEintrag';
import AbschnittAlleBuecher from '@/buecher/AbschnittAlleBuecher';
import AbschnittNochZuLesen from '@/buecher/AbschnittNochZuLesen';
import { abschnittKonfiguration } from '@/buecher/abschnittKonfiguration';
import { ladeBuecher, standardAnsichtRepository, standardBildspeicher } from '@/buecher/buchQuelle';
import Filterleiste from '@/buecher/Filterleiste';
import { filterKonfiguration, uebersichtKonfiguration, type FilterDefinition } from '@/buecher/filterKonfiguration';
import Kopfbereich from '@/buecher/Kopfbereich';
import PlatzhalterAbschnitt from '@/buecher/PlatzhalterAbschnitt';
import Uebersicht from '@/buecher/Uebersicht';
import type { Buch } from '@/domain/buch';
import type { AnsichtRepository, BookRepository, ImageStore } from '@/storage';
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
  /** Aktuelle Zeit für Sitzungen und Streak (REQ-024, REQ-027) und das Eintragungsdatum (REQ-041); in Tests ersetzbar. */
  jetzt?: () => Date;
  /** Speicher der gemerkten Ansicht je Liste (REQ-037); ohne Angabe der dauerhafte Speicher der App. In Tests ersetzbar. */
  ansichtRepository?: AnsichtRepository;
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

/** Wo der Nutzer im Reiter „Bücher“ steht: Seite „Bücher“ oder eine Übersicht (REQ-036, REQ-040, REQ-042). */
type Ort = { art: 'seite' } | { art: 'uebersicht'; liste: string };

const standardFilterId = (filter: FilterDefinition[]) =>
  ([...filter].sort((a, b) => a.reihenfolge - b.reihenfolge).find((f) => f.standard) ??
    [...filter].sort((a, b) => a.reihenfolge - b.reihenfolge)[0])?.id;

/**
 * Seite „Bücher“ (REQ-005, REQ-006, REQ-009 bis REQ-012, REQ-035) mit den Übersichten (REQ-036 bis REQ-040, REQ-042),
 * Zugang zu den Buchdetails (REQ-013) und zum Anlegen eines Buches über das Plus-Menü (REQ-029 bis REQ-032).
 */
export default function BuecherAnsicht({
  filter,
  buecher,
  repository,
  bildquelle,
  bildspeicher,
  jetzt,
  ansichtRepository,
}: Props) {
  const filterliste = filter ?? filterKonfiguration;
  const [stand, setStand] = useState(0);
  const alle = useBuecher(buecher, repository, stand);
  const speicher = useMemo(() => bildspeicher ?? standardBildspeicher(), [bildspeicher]);
  const ansichtSpeicher = useMemo(() => ansichtRepository ?? standardAnsichtRepository(), [ansichtRepository]);
  const [ansicht, setAnsicht] = useState<Ansicht>({ art: 'liste' });
  const [ort, setOrt] = useState<Ort>({ art: 'seite' });
  const [suche, setSuche] = useState('');
  // Aktiver Filter auf der Seite „Bücher“; bei jedem Aufruf der Seite der Standardfilter (REQ-006).
  const [seitenFilterId, setSeitenFilterId] = useState(() => standardFilterId(filterliste));
  const [menueOffen, setMenueOffen] = useState(false);
  // Beim Zurückkehren aus den Buchdetails werden die Frontcover neu gelesen (REQ-020).
  const [frontcover, coverVerwerfen] = useFrontcover(alle, speicher, ansicht.art === 'liste');
  const oeffnen = (buch: Buch) => {
    coverVerwerfen();
    setMenueOffen(false);
    setAnsicht({ art: 'details', buch });
  };
  // Zurück aus Buchdetails bzw. Blatt: dorthin, woher der Nutzer kam (Seite „Bücher“ oder Übersicht, REQ-013, REQ-036 AK-7).
  const zurueck = (neuLaden: boolean) => {
    if (ort.art === 'seite') setSeitenFilterId(standardFilterId(filterliste));
    setAnsicht({ art: 'liste' });
    if (neuLaden) setStand((n) => n + 1);
  };
  const uebersichtOeffnen = (liste: string) => {
    setMenueOffen(false);
    setSuche('');
    setOrt({ art: 'uebersicht', liste });
  };
  // Seite „Bücher“: „Alle“ und „Gerade am Lesen“ öffnen ihre Übersicht (REQ-039, REQ-042), sonst nur aktiv (REQ-006).
  const seitenFilterAntippen = (f: FilterDefinition) => {
    if (uebersichtKonfiguration[f.id]?.vonSeiteOeffnen) uebersichtOeffnen(f.id);
    else setSeitenFilterId(f.id);
  };
  // Übersicht: Filter mit Übersicht wechseln die Liste (REQ-036 AK-11), andere führen zur Seite „Bücher“ (AK-12).
  const uebersichtFilterAntippen = (f: FilterDefinition) => {
    if (uebersichtKonfiguration[f.id]) {
      uebersichtOeffnen(f.id);
      return;
    }
    setMenueOffen(false);
    setSeitenFilterId(f.id);
    setOrt({ art: 'seite' });
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
        onZurueck={() => zurueck(true)}
      />
    );
  }

  if (ansicht.art === 'eintrag') {
    return (
      <ManuellerEintrag
        repository={repository}
        bildspeicher={speicher}
        bildquelle={bildquelle}
        jetzt={jetzt}
        onZurueck={() => zurueck(false)}
        onAngelegt={(buch) => {
          // Danach die Buchdetails des neuen Buches (REQ-031, AK-7); die Liste lädt neu.
          setStand((n) => n + 1);
          oeffnen(buch);
        }}
      />
    );
  }

  const kopf = (
    <Kopfbereich
      menueOffen={menueOffen}
      onPlus={() => setMenueOffen((offen) => !offen)}
      onVonHand={() => {
        setMenueOffen(false);
        setAnsicht({ art: 'eintrag' });
      }}
      onMenueSchliessen={() => setMenueOffen(false)}
    />
  );

  if (ort.art === 'uebersicht') {
    const name = uebersichtKonfiguration[ort.liste]?.listenname ?? filterliste.find((f) => f.id === ort.liste)?.name ?? '';
    return (
      <Uebersicht
        listeId={ort.liste}
        listenname={name}
        filter={filterliste}
        buecher={alle}
        frontcover={frontcover}
        ansichtRepository={ansichtSpeicher}
        suche={suche}
        onSuche={setSuche}
        onFilter={uebersichtFilterAntippen}
        onBuchAntippen={oeffnen}
        kopf={kopf}
      />
    );
  }

  return (
    <div data-seite="buecher" style={seiteStil}>
      {kopf}
      <Filterleiste filter={filterliste} buecher={alle ?? []} aktivId={seitenFilterId} onAntippen={seitenFilterAntippen} />
      <AbschnittNochZuLesen
        buecher={alle}
        frontcover={frontcover}
        onBuchAntippen={oeffnen}
        onAlleAnsehen={() => uebersichtOeffnen('noch_zu_lesen')}
      />
      <PlatzhalterAbschnitt {...abschnittKonfiguration.sagas} />
      <PlatzhalterAbschnitt {...abschnittKonfiguration.sammlungen} />
      <AbschnittAlleBuecher
        buecher={alle}
        frontcover={frontcover}
        onBuchAntippen={oeffnen}
        onAlleAnsehen={() => uebersichtOeffnen('alle')}
      />
    </div>
  );
}
