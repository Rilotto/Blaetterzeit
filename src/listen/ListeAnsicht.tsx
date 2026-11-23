import { useState, type CSSProperties } from 'react';
import BlattFeld from '@/buchdetails/BlattFeld';
import BlattUnten, { sichernStil } from '@/buchdetails/BlattUnten';
import Kopfzeile from '@/buchdetails/Kopfzeile';
import Uebersicht from '@/buecher/Uebersicht';
import type { Buch } from '@/domain/buch';
import {
  buecherDerListeSortiert,
  listenArt,
  listenNamePruefen,
  neueListe,
  sortierText,
  standardSortierung,
  type Liste,
  type ListenSortierung,
  type Zugehoerigkeit,
} from '@/domain/listen';
import type { AnsichtRepository, ListenRepository } from '@/storage';
import { listenFarbe, textstufe, bildschirmrandPx, abstand, stilRolle } from '@/theme';
import { NeueListeEingabe } from './BlattZuListe';
import { PlusSchaltflaeche, StiftSymbol } from './gemeinsam';

interface Props {
  liste: Liste;
  zug: Zugehoerigkeit[];
  buecher: Buch[] | undefined;
  frontcover?: Record<string, string>;
  repository: ListenRepository;
  ansichtRepository: AnsichtRepository;
  /** Nach Umbenennen bzw. neuer Liste: neu laden. */
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

type Blatt = null | 'bearbeiten' | 'rueckfrage' | 'neu';

/**
 * Geöffnete Liste (REQ-098): Übersicht wie „Gerade am Lesen“ ohne Filterleiste, Listenname mit Stift
 * (Umbenennen, „Liste löschen“ mit Rückfrage), Plus legt eine Liste derselben Art an, Sortierung bei Sagas
 * „Nach Bänden“ bzw. „A–Z“.
 */
export default function ListeAnsicht({
  liste,
  zug,
  buecher,
  frontcover,
  repository,
  ansichtRepository,
  onGeaendert,
  onGeloescht,
  onBuchAntippen,
  onZurueck,
}: Props) {
  const texte = listenArt(liste.art);
  const [sortierung, setSortierung] = useState<ListenSortierung>(standardSortierung(liste.art));
  const [suche, setSuche] = useState('');
  const [blatt, setBlatt] = useState<Blatt>(null);

  const umbenennen = async (name: string) => {
    try {
      await repository.listeSpeichern({ ...liste, name });
    } catch (e) {
      console.warn('Liste konnte nicht umbenannt werden:', e);
    }
    setBlatt(null);
    await onGeaendert();
  };

  const loeschen = async () => {
    try {
      await repository.listeEntfernen(liste.id);
    } catch (e) {
      console.warn('Liste konnte nicht gelöscht werden:', e);
    }
    setBlatt(null);
    await onGeaendert();
    onGeloescht();
  };

  const anlegen = async (name: string) => {
    try {
      await repository.listeSpeichern(neueListe(liste.art, name));
    } catch (e) {
      console.warn('Liste konnte nicht angelegt werden:', e);
    }
    setBlatt(null);
    await onGeaendert();
  };

  const kopf = (
    <>
      {onZurueck ? <Kopfzeile onZurueck={onZurueck} /> : null}
      <header style={kopfStil}>
        <h1 data-liste-titel="" {...stilRolle('seitentitel')} style={ueberschriftStil}>
          {liste.name}
        </h1>
        <button type="button" aria-label="Liste bearbeiten" data-liste-stift="" onClick={() => setBlatt('bearbeiten')} style={stiftStil}>
          <StiftSymbol />
        </button>
        <span style={{ flex: '1 1 auto' }} />
        <PlusSchaltflaeche beschriftung={texte.neu} onClick={() => setBlatt('neu')} />
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
          startWert={liste.name}
          platzhalter={texte.einzahl}
          maxLength={200}
          pruefen={listenNamePruefen}
          onSichern={(name) => void umbenennen(name)}
          onSchliessen={() => setBlatt(null)}
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
      {blatt === 'neu' ? (
        <BlattUnten titel={texte.neu} onSchliessen={() => setBlatt(null)}>
          <NeueListeEingabe platzhalter={texte.neu} onAnlegen={(n) => void anlegen(n)} />
        </BlattUnten>
      ) : null}
    </div>
  );
}
