import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { standardBildquelle, type Bildquelle } from '@/bild/bildquelle';
import { zuschneiden } from '@/bild/bildverarbeitung';
import type { Ecken } from '@/bild/entzerren';
import BlattFeld from '@/buchdetails/BlattFeld';
import BlattUnten, { sichernStil } from '@/buchdetails/BlattUnten';
import KameraAnsicht from '@/buchdetails/KameraAnsicht';
import Kopfzeile from '@/buchdetails/Kopfzeile';
import Zuschnitt from '@/buchdetails/Zuschnitt';
import Uebersicht from '@/buecher/Uebersicht';
import type { Buch } from '@/domain/buch';
import {
  buecherDerListeSortiert,
  listenArt,
  listenNamePruefen,
  sortierText,
  standardSortierung,
  type Liste,
  type ListenSortierung,
  type Zugehoerigkeit,
} from '@/domain/listen';
import type { AnsichtRepository, ImageStore, ListenRepository } from '@/storage';
import { listenFarbe, textstufe, bildschirmrandPx, abstand, stilRolle } from '@/theme';
import BlattBuecherWaehlen from './BlattBuecherWaehlen';
import { PlusSchaltflaeche, StiftSymbol } from './gemeinsam';
import { ListenbildFeld, ListenbildKlein, type ListenbildAktion } from './Listenbild';
import {
  LISTENBILD_MASSE,
  LISTENBILD_VERHAELTNIS,
  listenbildImBlatt,
  listenbildLoeschen,
  listenbildUebernehmen,
  type ListenbildEntwurf,
} from './listenbild';

interface Props {
  liste: Liste;
  zug: Zugehoerigkeit[];
  buecher: Buch[] | undefined;
  frontcover?: Record<string, string>;
  repository: ListenRepository;
  ansichtRepository: AnsichtRepository;
  /** Bildablage für das Listenbild (REQ-100). */
  bildspeicher: ImageStore;
  /** Gespeichertes Listenbild (REQ-100); fehlend = keins. */
  listenbild?: string;
  /** Bildquelle (Kamera/Galerie); in Tests ersetzbar. */
  bildquelle?: Bildquelle;
  /** Nach Umbenennen bzw. geänderter Auswahl: neu laden. */
  onGeaendert: () => Promise<void> | void;
  /** Nach dem Löschen: Listenübersicht der Art (REQ-098, AK-4). */
  onGeloescht: () => void;
  onBuchAntippen: (buch: Buch) => void;
  onZurueck?: () => void;
}

const kopfStil: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: abstand('m'),
  padding: `${abstand('l')} ${bildschirmrandPx}px 0`,
};

const ueberschriftStil: CSSProperties = {
  flex: '0 1 auto',
  minWidth: 0,
  margin: 0,
  ...textstufe('seite'),
  fontWeight: 700,
  lineHeight: 1.2,
  overflowWrap: 'break-word',
  color: listenFarbe('ueberschrift'),
};

const stiftStil: CSSProperties = {
  flex: '0 0 auto',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '36px',
  height: '36px',
  margin: 0,
  padding: 0,
  border: 'none',
  background: 'none',
  color: listenFarbe('stift'),
  cursor: 'pointer',
  WebkitTapHighlightColor: 'transparent',
};

const loeschenStil: CSSProperties = {
  display: 'block',
  width: '100%',
  margin: `${abstand('s')} 0 ${abstand('xs')}`,
  padding: abstand('m'),
  border: 'none',
  background: 'none',
  fontFamily: 'inherit',
  ...textstufe('text'),
  fontWeight: 600,
  color: listenFarbe('loeschenSchrift'),
  cursor: 'pointer',
};

const neinStil: CSSProperties = {
  ...sichernStil,
  marginTop: abstand('s'),
  backgroundColor: listenFarbe('neinFlaeche'),
  color: listenFarbe('neinSchrift'),
  boxShadow: 'none',
};

type Blatt = null | 'bearbeiten' | 'rueckfrage' | 'auswahl';

/** Zwischenschritt beim Listenbild (REQ-100): Kameraansicht bzw. Zuschnitt über der Liste, Blatt-Entwurf bleibt. */
type Schritt = { art: 'liste' } | { art: 'kamera' } | { art: 'zuschnitt'; bild: string };

/** Entwurf des Blatts „Liste bearbeiten“: Name und Listenbild, übernommen erst mit „Sichern“ (REQ-100). */
interface Entwurf {
  name: string;
  bild: ListenbildEntwurf;
}

/**
 * Geöffnete Liste (REQ-098): Übersicht wie „Gerade am Lesen“ ohne Filterleiste, Listenname mit Stift
 * (Umbenennen, Listenbild REQ-100, „Liste löschen“ mit Rückfrage), Plus öffnet die Auswahl aller Bücher
 * (AK-6 bis AK-9), Sortierung bei Sagas „Nach Bänden“ bzw. „A–Z“.
 */
export default function ListeAnsicht({
  liste,
  zug,
  buecher,
  frontcover,
  repository,
  ansichtRepository,
  bildspeicher,
  listenbild,
  bildquelle,
  onGeaendert,
  onGeloescht,
  onBuchAntippen,
  onZurueck,
}: Props) {
  const texte = listenArt(liste.art);
  const [sortierung, setSortierung] = useState<ListenSortierung>(standardSortierung(liste.art));
  const [suche, setSuche] = useState('');
  const [blatt, setBlatt] = useState<Blatt>(null);
  const [entwurf, setEntwurf] = useState<Entwurf>({ name: liste.name, bild: undefined });
  const [bildMenue, setBildMenue] = useState<'quellen' | 'bild' | null>(null);
  const [schritt, setSchritt] = useState<Schritt>({ art: 'liste' });
  const aktiv = useRef(true);
  const kameraErgebnis = useRef<((bild: string | null) => void) | null>(null);

  useEffect(() => {
    aktiv.current = true;
    return () => {
      aktiv.current = false;
      kameraErgebnis.current?.(null);
    };
  }, []);

  const bearbeitenOeffnen = () => {
    setEntwurf({ name: liste.name, bild: undefined });
    setBildMenue(null);
    setBlatt('bearbeiten');
  };
  const bearbeitenSchliessen = () => {
    // Schließen ohne „Sichern“ verwirft Name und Bildänderung (REQ-100, AK-3).
    setEntwurf({ name: liste.name, bild: undefined });
    setBildMenue(null);
    setBlatt(null);
  };

  const sichern = async (name: string) => {
    try {
      await repository.listeSpeichern({ ...liste, name });
      await listenbildUebernehmen(bildspeicher, liste.id, entwurf.bild);
    } catch (e) {
      console.warn('Liste konnte nicht gespeichert werden:', e);
    }
    setBlatt(null);
    setBildMenue(null);
    await onGeaendert();
  };

  const loeschen = async () => {
    try {
      await repository.listeEntfernen(liste.id);
      // Das Listenbild wird mit gelöscht (REQ-100).
      await listenbildLoeschen(bildspeicher, liste.id);
    } catch (e) {
      console.warn('Liste konnte nicht gelöscht werden:', e);
    }
    setBlatt(null);
    await onGeaendert();
    onGeloescht();
  };

  // Bildquellen wie beim Buchcover (REQ-015, REQ-016): „Scannen“ zeigt die Kameraansicht der App.
  const kameraAnzeigen = () =>
    new Promise<string | null>((resolve) => {
      kameraErgebnis.current = resolve;
      setSchritt({ art: 'kamera' });
    });
  const kameraBeenden = (bild: string | null) => {
    const r = kameraErgebnis.current;
    kameraErgebnis.current = null;
    if (bild === null) setSchritt({ art: 'liste' });
    r?.(bild);
  };
  const quelle = (): Bildquelle => bildquelle ?? standardBildquelle(kameraAnzeigen);

  const bildHolen = async (holen: () => Promise<string | null>) => {
    let bild: string | null = null;
    try {
      bild = await holen();
    } catch {
      bild = null;
    }
    if (!aktiv.current) return;
    // Abbruch oder kein Zugriff: Bildfeld bleibt unverändert (wie REQ-016).
    setSchritt(bild ? { art: 'zuschnitt', bild } : { art: 'liste' });
  };

  const bildAktion = async (a: ListenbildAktion) => {
    switch (a) {
      case 'ersetzen':
        setBildMenue('quellen');
        return;
      case 'entfernen':
        setEntwurf((e) => ({ ...e, bild: null }));
        setBildMenue(null);
        return;
      case 'scannen':
        setBildMenue(null);
        await bildHolen(() => quelle().scannen());
        return;
      case 'galerie':
        setBildMenue(null);
        await bildHolen(() => quelle().galerie());
        return;
    }
  };

  const zuschnittBestaetigen = async (bild: string, ecken: Ecken) => {
    const ergebnis = await zuschneiden(bild, ecken, LISTENBILD_VERHAELTNIS).catch(() => bild);
    if (!aktiv.current) return;
    setEntwurf((e) => ({ ...e, bild: ergebnis }));
    setSchritt({ art: 'liste' });
  };

  if (schritt.art === 'kamera') {
    return <KameraAnsicht onFoto={(bild) => kameraBeenden(bild)} onZurueck={() => kameraBeenden(null)} />;
  }
  if (schritt.art === 'zuschnitt') {
    const { bild } = schritt;
    return (
      <Zuschnitt
        bild={bild}
        bereich="cover"
        masse={LISTENBILD_MASSE}
        onBestaetigen={(ecken) => zuschnittBestaetigen(bild, ecken)}
        onZurueck={() => setSchritt({ art: 'liste' })}
      />
    );
  }

  const kopf = (
    <>
      {onZurueck ? <Kopfzeile onZurueck={onZurueck} /> : null}
      <header style={kopfStil}>
        {/* Listenbild klein links neben dem Namen; ohne Bild kein Platzhalter (REQ-100, AK-2/AK-7). */}
        {listenbild ? <ListenbildKlein listeId={liste.id} bild={listenbild} /> : null}
        <h1 data-liste-titel="" {...stilRolle('seitentitel')} style={ueberschriftStil}>
          {liste.name}
        </h1>
        <button type="button" aria-label="Liste bearbeiten" data-liste-stift="" onClick={bearbeitenOeffnen} style={stiftStil}>
          <StiftSymbol />
        </button>
        <span style={{ flex: '1 1 auto' }} />
        {/* Plus: Bücher auswählen, legt weder Buch noch Liste an (REQ-098, AK-6). */}
        <PlusSchaltflaeche beschriftung="Bücher auswählen" onClick={() => setBlatt('auswahl')} />
      </header>
    </>
  );

  return (
    <div data-geoeffnete-liste={liste.id} data-liste-art={liste.art} data-sortierung={sortierung}>
      <Uebersicht
        listeId={`liste:${liste.id}`}
        listenname={liste.name}
        filter={[]}
        buecher={buecher}
        frontcover={frontcover}
        ansichtRepository={ansichtRepository}
        suche={suche}
        onSuche={setSuche}
        onFilter={() => {}}
        onBuchAntippen={onBuchAntippen}
        kopf={kopf}
        ohneFilterleiste
        auswahl={(alle) => buecherDerListeSortiert(alle, zug, liste.id, sortierung)}
        sortierung={{
          text: sortierText(sortierung),
          // Nur Sagas haben die Wahl „A–Z“ / „Nach Bänden“ (REQ-098).
          onAntippen: liste.art === 'saga' ? () => setSortierung((s) => (s === 'baende' ? 'az' : 'baende')) : undefined,
        }}
      />
      {blatt === 'bearbeiten' ? (
        <BlattFeld
          titel="Liste bearbeiten"
          kennung="liste-umbenennen"
          startWert={entwurf.name}
          platzhalter={texte.einzahl}
          maxLength={200}
          pruefen={listenNamePruefen}
          onEingabe={(name) => setEntwurf((e) => ({ ...e, name }))}
          onSichern={(name) => void sichern(name)}
          onSchliessen={bearbeitenSchliessen}
          mitte={
            <ListenbildFeld
              bild={listenbildImBlatt(listenbild, entwurf.bild)}
              menue={bildMenue}
              onMenue={setBildMenue}
              onAktion={(a) => void bildAktion(a)}
            />
          }
          unten={
            <button type="button" data-liste-loeschen="" onClick={() => setBlatt('rueckfrage')} style={loeschenStil}>
              Liste löschen
            </button>
          }
        />
      ) : null}
      {blatt === 'rueckfrage' ? (
        <BlattUnten titel="Liste löschen?" onSchliessen={() => setBlatt(null)}>
          <p data-rueckfrage="" style={{ margin: `${abstand('s')} 0 0`, ...textstufe('text'), textAlign: 'center', color: listenFarbe('rueckfrageText') }}>
            „{liste.name}“ wirklich löschen? Die Bücher bleiben erhalten.
          </p>
          <button type="button" data-loeschen-bestaetigen="" onClick={() => void loeschen()} style={sichernStil}>
            Löschen
          </button>
          <button type="button" data-loeschen-abbrechen="" onClick={() => setBlatt(null)} style={neinStil}>
            Abbrechen
          </button>
        </BlattUnten>
      ) : null}
      {blatt === 'auswahl' ? (
        <BlattBuecherWaehlen
          liste={liste}
          zug={zug}
          buecher={buecher ?? []}
          frontcover={frontcover}
          repository={repository}
          onGesichert={() => {
            setBlatt(null);
            void onGeaendert();
          }}
          onSchliessen={() => setBlatt(null)}
        />
      ) : null}
    </div>
  );
}
