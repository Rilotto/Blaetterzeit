import { useMemo, useState, type CSSProperties } from 'react';
import BlattUnten from '@/buchdetails/BlattUnten';
import Kopfzeile from '@/buchdetails/Kopfzeile';
import type { Buch } from '@/domain/buch';
import { anzahlJeListe, bandPruefen, listenArt, listenDerArt, neueListe, type Liste, type ListenArt, type Zugehoerigkeit } from '@/domain/listen';
import { anzahlText } from '@/domain/uebersicht';
import type { ListenRepository } from '@/storage';
import { listenFarbe, textstufe, kartenSchatten, bildschirmrandPx, abstand, stilRolle } from '@/theme';
import { NeueListeEingabe } from './BlattZuListe';
import { BandFeld, Haekchen, PlusSchaltflaeche } from './gemeinsam';
import { ListenbildOderPlatzhalter } from './Listenbild';

interface Props {
  art: ListenArt;
  /** Buch im Kontext (aus den Buchdetails geöffnet): Häkchen und Feld „Band“ (REQ-097). Ohne Buch keine Häkchen. */
  buch?: Buch;
  listen: Liste[] | undefined;
  zug: Zugehoerigkeit[];
  /** Vorhandene Bücher (für die Anzahl); ohne Angabe zählen alle Zugehörigkeiten. */
  buecher?: Buch[];
  /** Listenbilder je Listen-ID (REQ-100); ohne Bild ein Platzhalter gleicher Größe. */
  listenbilder?: Record<string, string>;
  repository: ListenRepository;
  /** Nach jeder Änderung: Listen neu laden. */
  onGeaendert: () => Promise<void> | void;
  /** Name angetippt: geöffnete Liste (REQ-098). */
  onListeOeffnen: (liste: Liste) => void;
  /** Zurück-Pfeil; ohne Angabe keiner (z. B. als Ziel des Menüpunkts „Bibliothek“). */
  onZurueck?: () => void;
}

const kopfStil: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: abstand('m'),
  padding: `${abstand('l')} ${bildschirmrandPx}px 0`,
};

const ueberschriftStil: CSSProperties = {
  margin: 0,
  ...textstufe('seite'),
  fontWeight: 700,
  lineHeight: 1.2,
  color: listenFarbe('ueberschrift'),
};

const karteStil: CSSProperties = {
  boxSizing: 'border-box',
  margin: `${abstand('l')} ${bildschirmrandPx}px 0`,
  padding: `0 ${abstand('l')}`,
  borderRadius: '20px',
  boxShadow: kartenSchatten,
  backgroundColor: listenFarbe('karteFlaeche'),
  listStyle: 'none',
};

const zeileStil = (letzte: boolean): CSSProperties => ({
  display: 'flex',
  alignItems: 'center',
  gap: abstand('m'),
  minHeight: '56px',
  padding: `${abstand('xs')} 0`,
  borderBottom: letzte ? 'none' : `1.5px solid ${listenFarbe('trennlinie')}`,
});

const nameKnopfStil: CSSProperties = {
  flex: '1 1 auto',
  minWidth: 0,
  margin: 0,
  padding: `${abstand('s')} 0`,
  border: 'none',
  background: 'none',
  fontFamily: 'inherit',
  textAlign: 'left',
  cursor: 'pointer',
  WebkitTapHighlightColor: 'transparent',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
};

/**
 * Listenübersicht einer Art (REQ-097): alle Listen A–Z mit Name und Anzahl der Bücher, „+“ für eine neue Liste;
 * mit Buch im Kontext zusätzlich Häkchen (sofort wirksam) und bei Sagas das Feld „Band“.
 */
export default function Listenuebersicht({ art, buch, listen, zug, buecher, listenbilder, repository, onGeaendert, onListeOeffnen, onZurueck }: Props) {
  const texte = listenArt(art);
  const [neuOffen, setNeuOffen] = useState(false);
  const [baende, setBaende] = useState<Record<string, string>>({});
  const [fehler, setFehler] = useState<Set<string>>(new Set());
  const alle = listen === undefined ? undefined : listenDerArt(listen, art);
  const anzahl = useMemo(() => anzahlJeListe(zug, buecher ? new Set(buecher.map((b) => b.id)) : undefined), [zug, buecher]);
  const eigene = buch ? zug.filter((z) => z.buchId === buch.id) : [];

  const bandText = (id: string) => baende[id] ?? (eigene.find((z) => z.listeId === id)?.band?.toString() ?? '');

  const speichern = async (aktion: () => Promise<void>) => {
    try {
      await aktion();
    } catch (e) {
      console.warn('Liste konnte nicht gespeichert werden:', e);
    }
    await onGeaendert();
  };

  const zuordnen = (listeId: string) =>
    buch && art === 'saga' && buch.bandnummer !== undefined
      ? repository.zuordnen({ listeId, buchId: buch.id, band: buch.bandnummer })
      : repository.zuordnen({ listeId, buchId: buch!.id });

  const umschalten = (l: Liste) => {
    if (!buch) return;
    const drin = eigene.some((z) => z.listeId === l.id);
    setBaende((b) => {
      const n = { ...b };
      delete n[l.id];
      return n;
    });
    void speichern(() => (drin ? repository.herausnehmen(l.id, buch.id) : zuordnen(l.id)));
  };

  const bandAendern = (l: Liste, wert: string) => {
    if (!buch) return;
    setBaende((b) => ({ ...b, [l.id]: wert }));
    const p = bandPruefen(wert);
    setFehler((f) => {
      const n = new Set(f);
      if (p.ok) n.delete(l.id);
      else n.add(l.id);
      return n;
    });
    if (!p.ok) return;
    void speichern(() => repository.zuordnen(p.band === undefined ? { listeId: l.id, buchId: buch.id } : { listeId: l.id, buchId: buch.id, band: p.band }));
  };

  const anlegen = (name: string) => {
    const l = neueListe(art, name);
    setNeuOffen(false);
    void speichern(async () => {
      await repository.listeSpeichern(l);
      // Aus den Buchdetails angelegt: sofort angehakt (REQ-097, AK-5).
      if (buch) await zuordnen(l.id);
    });
  };

  return (
    <section aria-label={texte.mehrzahl} data-listenuebersicht={art} data-mit-buch={buch ? 'true' : 'false'} style={{ paddingBottom: abstand('xl') }}>
      {onZurueck ? <Kopfzeile onZurueck={onZurueck} /> : null}
      <header style={kopfStil}>
        <h1 {...stilRolle('seitentitel')} style={ueberschriftStil}>
          {texte.mehrzahl}
        </h1>
        <PlusSchaltflaeche beschriftung={texte.neu} onClick={() => setNeuOffen(true)} />
      </header>
      {alle && alle.length > 0 ? (
        <ul {...stilRolle('karte')} style={karteStil}>
          {alle.map((l, i) => {
            const an = eigene.some((z) => z.listeId === l.id);
            return (
              <li key={l.id} data-liste-zeile={l.id} {...stilRolle('eintrag')} style={zeileStil(i === alle.length - 1)}>
                {buch ? <Haekchen listeId={l.id} name={l.name} an={an} onUmschalten={() => umschalten(l)} /> : null}
                <ListenbildOderPlatzhalter listeId={l.id} bild={listenbilder?.[l.id]} />
                <button type="button" data-liste-oeffnen={l.id} onClick={() => onListeOeffnen(l)} style={nameKnopfStil}>
                  <span data-liste-name="" style={{ ...textstufe('text'), fontWeight: 600, color: listenFarbe('name') }}>
                    {l.name}
                  </span>
                  <span style={{ ...textstufe('meta'), color: listenFarbe('anzahl') }}>{' · '}</span>
                  <span data-liste-anzahl="" style={{ ...textstufe('meta'), color: listenFarbe('anzahl') }}>
                    {anzahlText(anzahl.get(l.id) ?? 0)}
                  </span>
                </button>
                {buch && art === 'saga' && an ? (
                  <BandFeld listeId={l.id} wert={bandText(l.id)} fehler={fehler.has(l.id)} onWert={(w) => bandAendern(l, w)} />
                ) : null}
              </li>
            );
          })}
        </ul>
      ) : null}
      {neuOffen ? (
        <BlattUnten titel={texte.neu} onSchliessen={() => setNeuOffen(false)}>
          <NeueListeEingabe platzhalter={texte.neu} onAnlegen={anlegen} />
        </BlattUnten>
      ) : null}
    </section>
  );
}
