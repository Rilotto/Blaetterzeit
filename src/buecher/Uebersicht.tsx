import { useEffect, useState, type CSSProperties, type ReactNode } from 'react';
import iconLupe from '@/assets/icons/icon-lupe.png';
import iconBuch from '@/assets/icons/icon-offenes-buch.png';
import CoverPlatzhalter from '@/components/CoverPlatzhalter';
import Icon from '@/components/Icon';
import { coverBreite, coverFlaecheStil, coverHoehe } from '@/components/coverFlaeche';
import type { Buch } from '@/domain/buch';
import { alphabetisch, anzahlText, kartenzusatz, suchen, suchfeldText } from '@/domain/uebersicht';
import type { AnsichtRepository, Uebersichtsansicht } from '@/storage';
import { uebersichtFarbe } from '@/theme';
import Filterleiste from './Filterleiste';
import type { FilterDefinition } from './filterKonfiguration';
import { seitenRand } from './layout';

/** Ansicht, solange für eine Liste noch keine gewählt wurde (Annahme des Entwicklers). */
export const STANDARD_ANSICHT: Uebersichtsansicht = 'raster';

interface Props {
  /** ID der Liste = ID des aktiven Filters (z. B. „alle“, „noch_zu_lesen“, „gerade_am_lesen“). */
  listeId: string;
  /** Name der Liste im Suchfeld „In [Liste] suchen“ (REQ-038). */
  listenname: string;
  /** Filter der Filterleiste (REQ-007). */
  filter: FilterDefinition[];
  /** Alle Bücher; `undefined`, solange sie noch geladen werden. */
  buecher: Buch[] | undefined;
  /** Frontcover je Buch-ID (REQ-020). */
  frontcover?: Record<string, string>;
  /** Speicher der gemerkten Ansicht je Liste (REQ-037). */
  ansichtRepository: AnsichtRepository;
  /** Suchbegriff (bleibt beim Wechsel in die Buchdetails und zurück erhalten). */
  suche: string;
  onSuche: (suche: string) => void;
  /** Filterpille angetippt (REQ-036, AK-11/AK-12). */
  onFilter: (filter: FilterDefinition) => void;
  /** Buch angetippt: Buchdetails (REQ-036, AK-7). */
  onBuchAntippen: (buch: Buch) => void;
  /** Kopfbereich „Deine Bücher“ mit Plus-Schaltfläche (REQ-005), vom Aufrufer gestellt. */
  kopf: ReactNode;
}

const zeileStil: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
  padding: `0 ${seitenRand}px`,
};

const suchfeldRahmenStil: CSSProperties = {
  boxSizing: 'border-box',
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
  height: '46px',
  margin: `16px ${seitenRand}px 0`,
  padding: '0 18px',
  borderRadius: '9999px',
  border: `1.5px solid ${uebersichtFarbe('suchfeldRahmen')}`,
  backgroundColor: uebersichtFarbe('suchfeldFlaeche'),
};

const suchfeldStil: CSSProperties = {
  flex: '1 1 auto',
  minWidth: 0,
  margin: 0,
  padding: 0,
  border: 'none',
  outline: 'none',
  background: 'none',
  fontFamily: 'inherit',
  fontSize: '17px',
  color: uebersichtFarbe('suchfeldText'),
  // Farbe des Platzhaltertexts über die Variable in index.css (::placeholder).
  ['--bz-platzhalterfarbe' as string]: uebersichtFarbe('suchfeldPlatzhalter'),
};

const anzahlStil: CSSProperties = {
  flex: '1 1 auto',
  margin: 0,
  fontSize: '15px',
  fontWeight: 600,
  whiteSpace: 'nowrap',
  color: uebersichtFarbe('anzahl'),
};

const umschalterStil: CSSProperties = {
  display: 'flex',
  gap: '2px',
  padding: '3px',
  borderRadius: '9999px',
  border: `1px solid ${uebersichtFarbe('umschalterRahmen')}`,
  backgroundColor: uebersichtFarbe('umschalterFlaeche'),
};

const umschalterKnopfStil = (aktiv: boolean): CSSProperties => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '44px',
  height: '28px',
  margin: 0,
  padding: 0,
  border: 'none',
  borderRadius: '9999px',
  cursor: 'pointer',
  WebkitTapHighlightColor: 'transparent',
  backgroundColor: aktiv ? uebersichtFarbe('umschalterAktivFlaeche') : 'transparent',
  color: aktiv ? uebersichtFarbe('umschalterAktivIcon') : uebersichtFarbe('umschalterInaktivIcon'),
});

const sortierStil: CSSProperties = {
  height: '36px',
  margin: 0,
  padding: '0 16px',
  borderRadius: '9999px',
  border: `1px solid ${uebersichtFarbe('sortierRahmen')}`,
  backgroundColor: uebersichtFarbe('sortierFlaeche'),
  fontFamily: 'inherit',
  fontSize: '15px',
  fontWeight: 600,
  color: uebersichtFarbe('sortierSchrift'),
  cursor: 'pointer',
  WebkitTapHighlightColor: 'transparent',
};

const listeBasis: CSSProperties = { margin: '16px 0 0', padding: `0 ${seitenRand}px`, listStyle: 'none' };

// Raster: drei Cover nebeneinander (Referenzbild), Covergröße wie in den Abschnitten (REQ-009/REQ-010).
const rasterStil: CSSProperties = {
  ...listeBasis,
  display: 'grid',
  gridTemplateColumns: `repeat(auto-fill, ${coverBreite}px)`,
  justifyContent: 'space-between',
  rowGap: '18px',
  columnGap: '12px',
};

const kartenListeStil: CSSProperties = { ...listeBasis, display: 'flex', flexDirection: 'column', gap: '12px' };

const titelStil: CSSProperties = {
  margin: 0,
  fontSize: '15px',
  fontWeight: 600,
  lineHeight: 1.3,
  overflowWrap: 'break-word',
  color: uebersichtFarbe('buchtitel'),
  display: '-webkit-box',
  WebkitBoxOrient: 'vertical',
  WebkitLineClamp: 2,
  overflow: 'hidden',
};

const autorZeileStil: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '5px',
  minHeight: '18px',
  marginTop: '3px',
};

const autorStil: CSSProperties = {
  minWidth: 0,
  fontSize: '14px',
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  color: uebersichtFarbe('autor'),
};

const coverBildStil: CSSProperties = { ...coverFlaecheStil, display: 'block', objectFit: 'cover' };

// Listenansicht: kleineres Cover (Referenzbild ≈ 68 × 102 dp), Seitenverhältnis 2:3.
const KARTE_COVER_BREITE = 68;
const KARTE_COVER_HOEHE = Math.round((KARTE_COVER_BREITE * coverHoehe) / coverBreite);

const karteStil: CSSProperties = {
  display: 'flex',
  gap: '14px',
  padding: '12px',
  borderRadius: '18px',
  border: `1.5px solid ${uebersichtFarbe('kartenRahmen')}`,
  backgroundColor: uebersichtFarbe('kartenFlaeche'),
  cursor: 'pointer',
  WebkitTapHighlightColor: 'transparent',
};

const karteCoverStil: CSSProperties = {
  ...coverBildStil,
  width: `${KARTE_COVER_BREITE}px`,
  height: `${KARTE_COVER_HOEHE}px`,
};

const balkenStil: CSSProperties = {
  position: 'relative',
  height: '6px',
  marginTop: '10px',
  overflow: 'hidden',
  borderRadius: '3px',
  backgroundColor: uebersichtFarbe('balkenLeer'),
};

const fortschrittTextStil: CSSProperties = {
  margin: '8px 0 0',
  fontSize: '15px',
  color: uebersichtFarbe('fortschrittText'),
};

const statuschipStil: CSSProperties = {
  display: 'inline-block',
  marginTop: '10px',
  padding: '4px 12px',
  borderRadius: '9999px',
  fontSize: '14px',
  fontWeight: 600,
  backgroundColor: uebersichtFarbe('statuschipFlaeche'),
  color: uebersichtFarbe('statuschipSchrift'),
};

/** Raster-Symbol (vier Quadrate), Farbe über `currentColor` aus der Farbrolle des Knopfs. */
function RasterSymbol() {
  return (
    <svg aria-hidden="true" width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="1.5" y="1.5" width="6" height="6" rx="1" />
      <rect x="10.5" y="1.5" width="6" height="6" rx="1" />
      <rect x="1.5" y="10.5" width="6" height="6" rx="1" />
      <rect x="10.5" y="10.5" width="6" height="6" rx="1" />
    </svg>
  );
}

/** Listen-Symbol (drei Zeilen mit Punkt), Farbe über `currentColor`. */
function ListenSymbol() {
  return (
    <svg aria-hidden="true" width="18" height="18" viewBox="0 0 18 18" fill="currentColor">
      <circle cx="2.5" cy="4" r="1.5" />
      <circle cx="2.5" cy="9" r="1.5" />
      <circle cx="2.5" cy="14" r="1.5" />
      <rect x="6" y="3" width="11" height="2" rx="1" />
      <rect x="6" y="8" width="11" height="2" rx="1" />
      <rect x="6" y="13" width="11" height="2" rx="1" />
    </svg>
  );
}

/** Autorzeile: Icon und Autor als gespeicherter Text; ohne Autor nur das Icon (REQ-037). */
function Autorzeile({ autor }: { autor?: string }) {
  return (
    <div data-autorzeile="" style={autorZeileStil}>
      <Icon datei="icon-offenes-buch.png" url={iconBuch} farbe={uebersichtFarbe('autorIcon')} groesse={14} />
      {autor ? (
        <span data-autor="" style={autorStil}>
          {autor}
        </span>
      ) : null}
    </div>
  );
}

function Rastereintrag({ buch, cover, onAntippen }: { buch: Buch; cover?: string; onAntippen: (b: Buch) => void }) {
  return (
    <li data-rastereintrag={buch.id} style={{ width: `${coverBreite}px`, minWidth: 0, cursor: 'pointer' }} onClick={() => onAntippen(buch)}>
      {cover ? <img src={cover} alt={buch.titel} style={coverBildStil} /> : <CoverPlatzhalter />}
      <p data-buchtitel="" style={{ ...titelStil, marginTop: '8px' }}>
        {buch.titel}
      </p>
      <Autorzeile autor={buch.autor} />
    </li>
  );
}

function Listenkarte({ buch, cover, onAntippen }: { buch: Buch; cover?: string; onAntippen: (b: Buch) => void }) {
  const zusatz = kartenzusatz(buch);
  return (
    <li data-listenkarte={buch.id} style={karteStil} onClick={() => onAntippen(buch)}>
      {cover ? (
        <img src={cover} alt={buch.titel} style={karteCoverStil} />
      ) : (
        <CoverPlatzhalter breite={KARTE_COVER_BREITE} hoehe={KARTE_COVER_HOEHE} />
      )}
      <div style={{ flex: '1 1 auto', minWidth: 0, paddingTop: '4px' }}>
        <p data-buchtitel="" style={{ ...titelStil, fontSize: '18px' }}>
          {buch.titel}
        </p>
        <Autorzeile autor={buch.autor} />
        {zusatz.art === 'fortschritt' ? (
          <>
            <div
              role="progressbar"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={zusatz.exakt}
              data-fortschrittsbalken=""
              style={balkenStil}
            >
              <span
                style={{
                  display: 'block',
                  width: `${zusatz.exakt}%`,
                  height: '100%',
                  borderRadius: '3px',
                  backgroundColor: uebersichtFarbe('balkenFuellung'),
                }}
              />
            </div>
            <p data-fortschrittstext="" style={fortschrittTextStil}>
              {zusatz.text}
            </p>
          </>
        ) : zusatz.art === 'status' ? (
          <span data-statuschip={buch.status} style={statuschipStil}>
            {zusatz.text}
          </span>
        ) : null}
      </div>
    </li>
  );
}

/** Gemerkte Ansicht der Liste laden (REQ-037, AK-3); `undefined`, solange sie geladen wird. */
function useAnsicht(repo: AnsichtRepository, listeId: string): [Uebersichtsansicht | undefined, (a: Uebersichtsansicht) => void] {
  const [stand, setStand] = useState<{ liste: string; ansicht: Uebersichtsansicht } | undefined>(undefined);
  useEffect(() => {
    let aktiv = true;
    void repo.lesen(listeId).then(
      (a) => {
        if (aktiv) setStand({ liste: listeId, ansicht: a ?? STANDARD_ANSICHT });
      },
      () => {
        if (aktiv) setStand({ liste: listeId, ansicht: STANDARD_ANSICHT });
      },
    );
    return () => {
      aktiv = false;
    };
  }, [repo, listeId]);
  const waehlen = (ansicht: Uebersichtsansicht) => {
    setStand({ liste: listeId, ansicht });
    void repo.speichern(listeId, ansicht).catch((fehler: unknown) => console.warn('Ansicht nicht gespeichert:', fehler));
  };
  return [stand?.liste === listeId ? stand.ansicht : undefined, waehlen];
}

/** Bücher der Liste: Filterlogik des Filters, dann Suche, dann A–Z (REQ-036, REQ-038, REQ-040, REQ-042). */
export function buecherDerListe(filter: FilterDefinition | undefined, buecher: Buch[], suche: string): Buch[] {
  const ergebnis = filter?.logik?.(buecher);
  const auswahl = Array.isArray(ergebnis) ? ergebnis : [];
  return alphabetisch(suchen(auswahl, suche));
}

/**
 * Übersicht einer Liste im Reiter „Bücher“ (REQ-036 bis REQ-038, REQ-040, REQ-042): Kopf, Filterleiste mit
 * aktivem Filter, Suchfeld, Anzahl, Umschalter Raster/Liste, Sortierknopf „Zuletzt“ (ohne Funktion) und die Bücher.
 */
export default function Uebersicht({
  listeId,
  listenname,
  filter,
  buecher,
  frontcover,
  ansichtRepository,
  suche,
  onSuche,
  onFilter,
  onBuchAntippen,
  kopf,
}: Props) {
  const [ansicht, ansichtWaehlen] = useAnsicht(ansichtRepository, listeId);
  const definition = filter.find((f) => f.id === listeId);
  const liste = buecher === undefined ? undefined : buecherDerListe(definition, buecher, suche);
  const beschriftung = suchfeldText(listenname);

  return (
    <div data-uebersicht={listeId} data-ansicht={ansicht ?? ''} style={{ paddingBottom: '24px' }}>
      {kopf}
      <Filterleiste filter={filter} buecher={buecher ?? []} aktivId={listeId} onAntippen={onFilter} />
      <label style={suchfeldRahmenStil}>
        <Icon datei="icon-lupe.png" url={iconLupe} farbe={uebersichtFarbe('suchfeldIcon')} groesse={20} />
        <input
          type="search"
          data-suchfeld=""
          data-bz-eingabe=""
          aria-label={beschriftung}
          placeholder={beschriftung}
          value={suche}
          onChange={(e) => onSuche(e.target.value)}
          style={suchfeldStil}
        />
      </label>
      <div style={{ ...zeileStil, marginTop: '16px' }}>
        <p data-buecherzahl="" style={anzahlStil}>
          {liste === undefined ? '' : anzahlText(liste.length)}
        </p>
        <div role="group" aria-label="Ansicht" data-umschalter="" style={umschalterStil}>
          <button
            type="button"
            aria-label="Rasteransicht"
            aria-pressed={ansicht === 'raster'}
            data-ansicht-wahl="raster"
            onClick={() => ansichtWaehlen('raster')}
            style={umschalterKnopfStil(ansicht === 'raster')}
          >
            <RasterSymbol />
          </button>
          <button
            type="button"
            aria-label="Listenansicht"
            aria-pressed={ansicht === 'liste'}
            data-ansicht-wahl="liste"
            onClick={() => ansichtWaehlen('liste')}
            style={umschalterKnopfStil(ansicht === 'liste')}
          >
            <ListenSymbol />
          </button>
        </div>
        {/* REQ-036, AK-5: ohne Funktion (To-do: nach Eintragungsdatum sortieren/filtern). */}
        <button type="button" data-sortierknopf="" style={sortierStil}>
          Zuletzt
        </button>
      </div>
      {liste === undefined || ansicht === undefined || liste.length === 0 ? null : ansicht === 'raster' ? (
        <ul data-buecher="" aria-label={listenname} style={rasterStil}>
          {liste.map((b) => (
            <Rastereintrag key={b.id} buch={b} cover={frontcover?.[b.id] ?? b.cover} onAntippen={onBuchAntippen} />
          ))}
        </ul>
      ) : (
        <ul data-buecher="" aria-label={listenname} style={kartenListeStil}>
          {liste.map((b) => (
            <Listenkarte key={b.id} buch={b} cover={frontcover?.[b.id] ?? b.cover} onAntippen={onBuchAntippen} />
          ))}
        </ul>
      )}
    </div>
  );
}
