import { useState, type CSSProperties } from 'react';
import BlattUnten, { blattEingabeStil, sichernStil } from '@/buchdetails/BlattUnten';
import type { Buch } from '@/domain/buch';
import {
  bandPruefen,
  listenArt,
  listenDerArt,
  listenNamePruefen,
  neueListe,
  type Liste,
  type ListenArt,
  type Zugehoerigkeit,
} from '@/domain/listen';
import type { ListenRepository } from '@/storage';
import { listenFarbe, textstufe, abstand, stilRolle } from '@/theme';
import { BandFeld, Haekchen, PlusSchaltflaeche } from './gemeinsam';

interface Props {
  art: ListenArt;
  buch: Buch;
  listen: Liste[];
  zug: Zugehoerigkeit[];
  repository: ListenRepository;
  /** Nach „Sichern“: gespeichert, Blatt schließen und neu laden. */
  onGesichert: () => void;
  /** Schließen ohne „Sichern“: alles verwerfen (REQ-096, AK-5). */
  onSchliessen: () => void;
}

const zeileStil: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: abstand('m'),
  minHeight: '52px',
  padding: `${abstand('xs')} 0`,
  borderBottom: `1.5px solid ${listenFarbe('trennlinie')}`,
};

const nameStil: CSSProperties = {
  flex: '1 1 auto',
  minWidth: 0,
  ...textstufe('text'),
  color: listenFarbe('name'),
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
};

/** Feld für den Namen einer neuen Liste mit Bestätigung „Anlegen“ (REQ-096, REQ-097, REQ-098). */
export function NeueListeEingabe({ platzhalter, onAnlegen }: { platzhalter: string; onAnlegen: (name: string) => void }) {
  const [name, setName] = useState('');
  const [fehler, setFehler] = useState(false);
  const anlegen = () => {
    const n = listenNamePruefen(name);
    if (n === null) {
      setFehler(true);
      return;
    }
    onAnlegen(n);
    setName('');
  };
  return (
    <div data-neue-liste="" style={{ display: 'flex', flexDirection: 'column', gap: abstand('s'), marginTop: abstand('m') }}>
      <input
        type="text"
        autoComplete="off"
        autoFocus
        aria-label={platzhalter}
        placeholder={platzhalter}
        data-blatt-feld="liste-name"
        data-fehler={fehler ? 'true' : undefined}
        aria-invalid={fehler ? true : undefined}
        maxLength={200}
        value={name}
        onChange={(e) => {
          setName(e.target.value);
          setFehler(false);
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter') anlegen();
        }}
        style={{
          ...blattEingabeStil,
          ...(fehler ? { border: `2px solid ${listenFarbe('fehler')}`, color: listenFarbe('fehler') } : {}),
        }}
      />
      <button type="button" data-liste-anlegen="" onClick={anlegen} style={{ ...sichernStil, margin: 0 }}>
        Anlegen
      </button>
    </div>
  );
}

/**
 * Blatt „Zu einer Saga / Sammlung / Bibliothek hinzufügen“ (REQ-096): alle Listen der Art mit Häkchen
 * (Mehrfachauswahl), bei Sagas je angehakter Saga das Feld „Band“, „+“ für eine neue Liste und „Sichern“.
 */
export default function BlattZuListe({ art, buch, listen, zug, repository, onGesichert, onSchliessen }: Props) {
  const texte = listenArt(art);
  const eigene = zug.filter((z) => z.buchId === buch.id);
  const [neue, setNeue] = useState<Liste[]>([]);
  const [haken, setHaken] = useState<Set<string>>(() => new Set(eigene.map((z) => z.listeId)));
  const [baende, setBaende] = useState<Record<string, string>>(() =>
    Object.fromEntries(eigene.filter((z) => z.band !== undefined).map((z) => [z.listeId, String(z.band)])),
  );
  const [fehler, setFehler] = useState<Set<string>>(new Set());
  const [eingabe, setEingabe] = useState(false);
  const speichert = useState({ laeuft: false })[0];
  const alle = listenDerArt([...listen, ...neue], art);

  const umschalten = (id: string, an = !haken.has(id)) => {
    setHaken((alt) => {
      const n = new Set(alt);
      if (an) n.add(id);
      else n.delete(id);
      return n;
    });
    // Bandnummer aus dem Barcode-Scan vorausfüllen (REQ-099, AK-6).
    if (an && art === 'saga' && baende[id] === undefined && buch.bandnummer !== undefined) {
      setBaende((b) => ({ ...b, [id]: String(buch.bandnummer) }));
    }
  };

  const anlegen = (name: string) => {
    const l = neueListe(art, name);
    setNeue((alt) => [...alt, l]);
    setEingabe(false);
    umschalten(l.id, true);
  };

  const sichern = async () => {
    if (speichert.laeuft) return;
    const ungueltig = new Set<string>();
    const band = new Map<string, number | undefined>();
    for (const id of haken) {
      const p = art === 'saga' ? bandPruefen(baende[id] ?? '') : { ok: true as const };
      if (!p.ok) ungueltig.add(id);
      else band.set(id, p.band);
    }
    if (ungueltig.size > 0) {
      setFehler(ungueltig);
      return;
    }
    speichert.laeuft = true;
    try {
      for (const l of neue) await repository.listeSpeichern(l);
      for (const l of alle) {
        if (haken.has(l.id)) {
          const b = band.get(l.id);
          await repository.zuordnen(b === undefined ? { listeId: l.id, buchId: buch.id } : { listeId: l.id, buchId: buch.id, band: b });
        } else if (eigene.some((z) => z.listeId === l.id)) {
          await repository.herausnehmen(l.id, buch.id);
        }
      }
    } catch (e) {
      console.warn('Listen konnten nicht gespeichert werden:', e);
    } finally {
      speichert.laeuft = false;
    }
    onGesichert();
  };

  return (
    <BlattUnten titel={texte.blatt} onSchliessen={onSchliessen}>
      <div data-blatt-liste={art}>
        <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
          {alle.map((l) => {
            const an = haken.has(l.id);
            return (
              <li key={l.id} data-liste-eintrag={l.id} {...stilRolle('eintrag')} style={zeileStil}>
                <Haekchen listeId={l.id} name={l.name} an={an} onUmschalten={() => umschalten(l.id)} />
                <span data-liste-name="" style={nameStil}>
                  {l.name}
                </span>
                {art === 'saga' && an ? (
                  <BandFeld
                    listeId={l.id}
                    wert={baende[l.id] ?? ''}
                    fehler={fehler.has(l.id)}
                    onWert={(w) => {
                      setBaende((b) => ({ ...b, [l.id]: w }));
                      setFehler((f) => {
                        const n = new Set(f);
                        n.delete(l.id);
                        return n;
                      });
                    }}
                  />
                ) : null}
              </li>
            );
          })}
        </ul>
        {eingabe ? (
          <NeueListeEingabe platzhalter={texte.neu} onAnlegen={anlegen} />
        ) : (
          <div style={{ display: 'flex', justifyContent: 'flex-start', marginTop: abstand('m') }}>
            <PlusSchaltflaeche beschriftung={texte.neu} onClick={() => setEingabe(true)} />
          </div>
        )}
        <button type="button" data-blatt-sichern="liste" onClick={() => void sichern()} style={sichernStil}>
          Sichern
        </button>
      </div>
    </BlattUnten>
  );
}
