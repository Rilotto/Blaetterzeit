import { Fragment, useEffect, useMemo, useState, type CSSProperties } from 'react';
import BarcodeAblauf from '@/barcode/BarcodeAblauf';
import { standardBarcodeScanner, type BarcodeScanner } from '@/barcode/scanner';
import { standardIsbnSuche, standardOnlineSuche, type IsbnSuche, type OnlineSuche } from '@/barcode/suche';
import type { Bildquelle } from '@/bild/bildquelle';
import type { Vorbelegung } from '@/buchanlegen/eingabe';
import ManuellerEintrag from '@/buchanlegen/ManuellerEintrag';
import Suchfenster from '@/onlinesuche/Suchfenster';
import {
  ausgeblendeteLesen,
  ausgeblendeteSpeichern,
  buecherAbschnitte,
  sichtbareAbschnitte,
  type AbschnittDefinition,
  type AbschnittKontext,
} from '@/buecher/abschnitte';
import BlattFuerDich from '@/buecher/BlattFuerDich';
import { ladeBuecher, standardAnsichtRepository, standardBildspeicher, standardListenRepository } from '@/buecher/buchQuelle';
import Filterleiste from '@/buecher/Filterleiste';
import {
  filterKonfiguration,
  PERSONALISIERBARER_FILTER_ID,
  uebersichtKonfiguration,
  type FilterDefinition,
} from '@/buecher/filterKonfiguration';
import Kopfbereich from '@/buecher/Kopfbereich';
import Uebersicht from '@/buecher/Uebersicht';
import type { Buch } from '@/domain/buch';
import { useListen } from '@/listen/gemeinsam';
import ListenNavigation, { type ListenZiel } from '@/listen/ListenNavigation';
import { useListenbilder } from '@/listen/listenbild';
import { useDesign } from '@/design/designwahl';
import type { AnsichtRepository, BookRepository, EinstellungRepository, ImageStore, ListenRepository } from '@/storage';
import BuchDetails from './BuchDetails';
import { abstand } from '@/theme';

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
  /** Barcode-Scanner (REQ-061); ohne Angabe der der Plattform. In Tests ersetzbar. */
  barcodeScanner?: BarcodeScanner;
  /** ISBN-Suche (REQ-062); ohne Angabe DNB + Open Library. In Tests ersetzbar. */
  isbnSuche?: IsbnSuche;
  /** Freitextsuche „Online suchen“ (REQ-116, REQ-117); ohne Angabe DNB + Open Library. In Tests ersetzbar. */
  onlineSuche?: OnlineSuche;
  /** Listenspeicher (Sagas, Sammlungen, Bibliotheken, REQ-095); ohne Angabe der der App. In Tests ersetzbar. */
  listenRepository?: ListenRepository;
  /** Einstellungsspeicher (Auswahl „Für dich“, REQ-114); ohne Angabe der des DesignAnbieters bzw. flüchtig. In Tests ersetzbar. */
  einstellungRepository?: EinstellungRepository;
  /** Abschnitte der Seite „Bücher“; ohne Angabe die zentrale Liste (REQ-114). In Tests ersetzbar. */
  abschnitte?: readonly AbschnittDefinition[];
}

/** Fallback ohne DesignAnbieter: Auswahl nur für die Sitzung. */
const fluechtig = (): EinstellungRepository => {
  const m = new Map<string, string>();
  return { lesen: (s) => Promise.resolve(m.get(s)), speichern: (s, w) => Promise.resolve(void m.set(s, w)) };
};

/** In „Für dich“ ausgeblendete Abschnitte (REQ-114), geladen über das EinstellungRepository. */
function useAusgeblendet(repo: EinstellungRepository): [string[], boolean, (neu: string[]) => void] {
  // Geladen ist die Auswahl erst, wenn sie aus genau diesem Repository stammt.
  const [stand, setStand] = useState<{ repo: EinstellungRepository; ausgeblendet: string[] } | undefined>(undefined);
  useEffect(() => {
    let aktiv = true;
    void ausgeblendeteLesen(repo).then((a) => {
      if (aktiv) setStand({ repo, ausgeblendet: a });
    });
    return () => {
      aktiv = false;
    };
  }, [repo]);
  const geladen = stand?.repo === repo;
  const speichern = (neu: string[]) => {
    setStand({ repo, ausgeblendet: neu });
    void ausgeblendeteSpeichern(repo, neu).catch((fehler: unknown) => console.warn('Abschnittsauswahl nicht gespeichert:', fehler));
  };
  return [geladen ? stand.ausgeblendet : [], geladen, speichern];
}

const seiteStil: CSSProperties = {
  paddingBottom: abstand('xl'),
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

type Ansicht =
  | { art: 'liste' }
  | { art: 'scan' }
  | { art: 'eintrag'; vorbelegung?: Vorbelegung }
  | { art: 'details'; buch: Buch }
  | { art: 'listen'; ziel: ListenZiel };

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
  barcodeScanner,
  isbnSuche,
  onlineSuche,
  listenRepository,
  einstellungRepository,
  abschnitte = buecherAbschnitte,
}: Props) {
  const design = useDesign();
  const [ersatz] = useState(fluechtig);
  const einstellungen = einstellungRepository ?? design.einstellungRepository ?? ersatz;
  const [ausgeblendet, auswahlGeladen, ausgeblendetSpeichern] = useAusgeblendet(einstellungen);
  const [blattOffen, setBlattOffen] = useState(false);
  const listenRepo = useMemo(() => listenRepository ?? standardListenRepository(), [listenRepository]);
  const { listen, neuLaden: listenNeuLaden } = useListen(listenRepo);
  const filterliste = filter ?? filterKonfiguration;
  const [stand, setStand] = useState(0);
  const alle = useBuecher(buecher, repository, stand);
  const speicher = useMemo(() => bildspeicher ?? standardBildspeicher(), [bildspeicher]);
  const listenbilder = useListenbilder(speicher, listen);
  const scanner = useMemo(() => barcodeScanner ?? standardBarcodeScanner(), [barcodeScanner]);
  const isbnSucheAktiv = useMemo(() => isbnSuche ?? standardIsbnSuche(), [isbnSuche]);
  const onlineSucheAktiv = useMemo(() => onlineSuche ?? standardOnlineSuche(), [onlineSuche]);
  // Suchfenster „Online suchen“ (REQ-116) als Blatt über der Seite.
  const [sucheOffen, setSucheOffen] = useState(false);
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

  if (ansicht.art === 'listen') {
    return (
      <ListenNavigation
        start={ansicht.ziel}
        onZurueck={() => {
          void listenNeuLaden();
          zurueck(true);
        }}
        repository={repository}
        listenRepository={listenRepo}
        bildspeicher={speicher}
        bildquelle={bildquelle}
        ansichtRepository={ansichtSpeicher}
        jetzt={jetzt}
      />
    );
  }

  if (ansicht.art === 'details') {
    return (
      <BuchDetails
        listenRepository={listenRepo}
        buchId={ansicht.buch.id}
        buch={ansicht.buch}
        bildquelle={bildquelle}
        bildspeicher={speicher}
        repository={repository}
        jetzt={jetzt}
        onZurueck={() => {
          void listenNeuLaden();
          zurueck(true);
        }}
      />
    );
  }

  if (ansicht.art === 'scan') {
    return (
      <BarcodeAblauf
        scanner={scanner}
        suche={isbnSucheAktiv}
        // Abbruch, Kamera verweigert, kein Internet, nichts gefunden: Seite „Bücher“ (REQ-061, REQ-062).
        onAbbruch={() => {
          setOrt({ art: 'seite' });
          setSeitenFilterId(standardFilterId(filterliste));
          setAnsicht({ art: 'liste' });
        }}
        onUebernehmen={(vorbelegung) => setAnsicht({ art: 'eintrag', vorbelegung })}
      />
    );
  }

  if (ansicht.art === 'eintrag') {
    return (
      <ManuellerEintrag
        vorbelegung={ansicht.vorbelegung}
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

  const kopfbereich = (
    <Kopfbereich
      menueOffen={menueOffen}
      onPlus={() => setMenueOffen((offen) => !offen)}
      onOnlineSuche={() => {
        setMenueOffen(false);
        setSucheOffen(true);
      }}
      onBarcode={() => {
        setMenueOffen(false);
        setAnsicht({ art: 'scan' });
      }}
      onVonHand={() => {
        setMenueOffen(false);
        setAnsicht({ art: 'eintrag' });
      }}
      onMenueSchliessen={() => setMenueOffen(false)}
      onFilter={() => {
        setMenueOffen(false);
        setBlattOffen(true);
      }}
    />
  );
  const kopf = (
    <>
      {kopfbereich}
      {sucheOffen ? (
        <Suchfenster
          suche={onlineSucheAktiv}
          // Zurück: eine Stufe zurück ins Menü „Buch hinzufügen“ (REQ-116, AK-8).
          onZurueck={() => {
            setSucheOffen(false);
            setMenueOffen(true);
          }}
          // Treffer: weiter wie nach Auswahl eines Barcode-Treffers (REQ-117, AK-7; REQ-062).
          onWahl={(vorbelegung) => {
            setSucheOffen(false);
            setAnsicht({ art: 'eintrag', vorbelegung });
          }}
        />
      ) : null}
      {blattOffen ? (
        <BlattFuerDich
          abschnitte={abschnitte}
          ausgeblendet={ausgeblendet}
          geladen={auswahlGeladen}
          onSchliessen={() => setBlattOffen(false)}
          onSpeichern={(neu) => {
            ausgeblendetSpeichern(neu);
            setBlattOffen(false);
          }}
        />
      ) : null}
    </>
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

  const abschnittKontext: AbschnittKontext = {
    buecher: alle,
    frontcover,
    listen,
    listenbilder,
    onBuchAntippen: oeffnen,
    onUebersicht: uebersichtOeffnen,
    // Platzhalter öffnet dasselbe Menü wie die Plus-Schaltfläche (REQ-011 AK-3, REQ-029).
    onLeereListe: () => setMenueOffen(true),
    // Sagas und Sammlungen (REQ-012, REQ-097): „Alle ansehen ›“ öffnet die Listenübersicht, eine Liste direkt die Liste.
    onListenUebersicht: (art) => {
      setMenueOffen(false);
      setAnsicht({ art: 'listen', ziel: { art: 'uebersicht', listenArt: art } });
    },
    onListeAntippen: (l) => {
      setMenueOffen(false);
      setAnsicht({ art: 'listen', ziel: { art: 'liste', listeId: l.id } });
    },
  };

  return (
    <div data-seite="buecher" style={seiteStil}>
      {kopf}
      <Filterleiste filter={filterliste} buecher={alle ?? []} aktivId={seitenFilterId} onAntippen={seitenFilterAntippen} />
      {/* Abschnitte aus der zentralen Liste; bei „Für dich“ nur die angehakten (REQ-114), Reihenfolge unverändert. */}
      {(seitenFilterId === PERSONALISIERBARER_FILTER_ID ? sichtbareAbschnitte(abschnitte, ausgeblendet) : abschnitte).map((a) => (
        <Fragment key={a.id}>{a.darstellen(abschnittKontext)}</Fragment>
      ))}
    </div>
  );
}
