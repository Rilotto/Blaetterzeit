import { useState, type CSSProperties } from 'react';
import BlattUnten, { sichernStil } from '@/buchdetails/BlattUnten';
import CoverPlatzhalter from '@/components/CoverPlatzhalter';
import type { Buch } from '@/domain/buch';
import { auswahlAenderungen, buecherAZ, buecherInListe, type Liste, type Zugehoerigkeit } from '@/domain/listen';
import type { ListenRepository } from '@/storage';
import { listenFarbe, textstufe, abstand, stilRolle } from '@/theme';

interface Props {
  liste: Liste;
  zug: Zugehoerigkeit[];
  /** Alle gespeicherten Bücher. */
  buecher: Buch[];
  frontcover?: Record<string, string>;
  repository: ListenRepository;
  /** Nach „Sichern“: gespeichert, Blatt schließen und neu laden. */
  onGesichert: () => void;
  /** Schließen ohne „Sichern“: Auswahl verwerfen (REQ-098, AK-9). */
  onSchliessen: () => void;
}

const MINI_BREITE = 40;
const MINI_HOEHE = 60;

const listeStil: CSSProperties = {
  listStyle: 'none',
  margin: `${abstand('s')} 0 0`,
  padding: 0,
};

const zeileStil = (an: boolean): CSSProperties => ({
  boxSizing: 'border-box',
  display: 'flex',
  alignItems: 'center',
  gap: abstand('m'),
  width: '100%',
  minHeight: '72px',
  margin: `0 0 ${abstand('xs')}`,
  padding: `${abstand('xs')} ${abstand('s')}`,
  borderRadius: '14px',
  border: `2px solid ${an ? listenFarbe('auswahlRahmen') : 'transparent'}`,
  backgroundColor: an ? listenFarbe('auswahlFlaeche') : 'transparent',
  fontFamily: 'inherit',
  textAlign: 'left',
  cursor: 'pointer',
  WebkitTapHighlightColor: 'transparent',
});

const coverStil: CSSProperties = {
  flex: '0 0 auto',
  display: 'block',
  width: `${MINI_BREITE}px`,
  height: `${MINI_HOEHE}px`,
  objectFit: 'cover',
  borderRadius: '4px',
};

const titelStil: CSSProperties = {
  flex: '1 1 auto',
  minWidth: 0,
  ...textstufe('text'),
  fontWeight: 600,
  color: listenFarbe('name'),
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
};

/**
 * Blatt „Bücher auswählen“ (REQ-098, AK-6 bis AK-9): alle Bücher A–Z mit Cover und Titel, enthaltene vormarkiert.
 * Antippen markiert bzw. entmarkiert; erst „Sichern“ übernimmt Hinzufügen und Herausnehmen, Schließen verwirft.
 */
export default function BlattBuecherWaehlen({ liste, zug, buecher, frontcover, repository, onGesichert, onSchliessen }: Props) {
  const [markiert, setMarkiert] = useState<Set<string>>(() => buecherInListe(zug, liste.id));
  const speichert = useState({ laeuft: false })[0];
  const sortiert = buecherAZ(buecher);

  const umschalten = (id: string) =>
    setMarkiert((alt) => {
      const n = new Set(alt);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });

  const sichern = async () => {
    if (speichert.laeuft) return;
    speichert.laeuft = true;
    const { aufnehmen, herausnehmen } = auswahlAenderungen(liste, zug, markiert, buecher);
    try {
      for (const z of aufnehmen) await repository.zuordnen(z);
      for (const id of herausnehmen) await repository.herausnehmen(liste.id, id);
    } catch (e) {
      console.warn('Auswahl konnte nicht gespeichert werden:', e);
    } finally {
      speichert.laeuft = false;
    }
    onGesichert();
  };

  return (
    <BlattUnten titel="Bücher auswählen" onSchliessen={onSchliessen}>
      <div data-blatt-buecher-waehlen={liste.id}>
        <ul style={listeStil}>
          {sortiert.map((b) => {
            const an = markiert.has(b.id);
            const bild = frontcover?.[b.id] ?? b.cover;
            return (
              <li key={b.id}>
                <button
                  type="button"
                  role="checkbox"
                  aria-checked={an}
                  aria-label={b.titel}
                  data-buch-auswahl={b.id}
                  data-markiert={an ? 'true' : 'false'}
                  onClick={() => umschalten(b.id)}
                  {...stilRolle('eintrag')}
                  style={zeileStil(an)}
                >
                  {bild ? (
                    <img src={bild} alt="" {...stilRolle('cover')} style={coverStil} />
                  ) : (
                    <CoverPlatzhalter breite={MINI_BREITE} hoehe={MINI_HOEHE} />
                  )}
                  <span data-buch-auswahl-titel="" style={titelStil}>
                    {b.titel}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
        <button type="button" data-blatt-sichern="buecher-waehlen" onClick={() => void sichern()} style={sichernStil}>
          Sichern
        </button>
      </div>
    </BlattUnten>
  );
}
