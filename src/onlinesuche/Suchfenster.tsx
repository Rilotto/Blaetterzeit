// Suchfenster „Online suchen“ (REQ-116) mit Trefferraster (REQ-117) und gemeinsamer Rahmen für
// „Cover online suchen“ (REQ-118): Ziehgriff, Zurück-Pfeil, Sprachfilter (REQ-119), Suchzeile, Hinweise, Raster.
import { useEffect, useRef, useState, type CSSProperties, type PointerEvent as ReactPointerEvent, type ReactNode } from 'react';
import iconLupe from '@/assets/icons/icon-lupe.png';
import iconZurueck from '@/assets/icons/icon-zurueck.png';
import type { OnlineSuche } from '@/barcode/suche';
import { QUELLEN_NAME, type Treffer } from '@/barcode/treffer';
import { blattHinweisStil } from '@/buchdetails/BlattUnten';
import { SCHREIBFENSTER_ZUG_SCHWELLE } from '@/buchdetails/reiter/rezension';
import type { Vorbelegung } from '@/buchanlegen/eingabe';
import CoverPlatzhalter from '@/components/CoverPlatzhalter';
import Icon from '@/components/Icon';
import { useDesign } from '@/design/designwahl';
import { useZurueckTaste } from '@/plattform/zurueckTaste';
import type { EinstellungRepository } from '@/storage';
import Sprachfilter from './Sprachfilter';
import { fluechtigeEinstellungen, useSprachauswahl, type Sprache } from './sprache';
import { fensterStil, griffBereichStil, griffStil, hintergrundStil } from '@/profil/blattStil';
import { abstand, barcodeFarbe, coverSchatten, stilRolle, textstufe, uebersichtFarbe } from '@/theme';

/** Hinweise (REQ-116, AK-6/AK-7). */
export const KEINE_TREFFER_HINWEIS = 'Keine Bücher gefunden';
export const KEIN_INTERNET_HINWEIS = 'Keine Internetverbindung';
/** So lange bleibt ein Hinweis sichtbar. */
export const ONLINE_SUCHE_HINWEIS_MS = 2500;
/** Beschriftung des Suchfelds. */
export const ONLINE_SUCHFELD_TEXT = 'Titel, Autor oder ISBN';

interface Props {
  suche: OnlineSuche;
  /** Zurück-Pfeil, Android-Zurück-Taste oder Herunterziehen: eine Stufe zurück ins Menü (REQ-116, AK-8). */
  onZurueck: () => void;
  /** Treffer angetippt: weiter wie beim Barcode-Scan (REQ-117, AK-7). */
  onWahl: (vorbelegung: Vorbelegung) => void;
  /** Speicher der gemeinsamen Sprachauswahl (REQ-119); ohne Angabe der des DesignAnbieters bzw. flüchtig. */
  einstellungRepository?: EinstellungRepository;
}

type Stand = { art: 'leer' } | { art: 'laeuft' } | { art: 'ergebnis'; treffer: Treffer[] };

const fenster = (versatz: number): CSSProperties => ({
  ...fensterStil(versatz),
  // Feste Höhe, damit das Raster Platz hat und das Fenster beim Suchen nicht springt.
  height: 'calc(100% - 40px)',
  display: 'flex',
  flexDirection: 'column',
});

const kopfStil: CSSProperties = { display: 'flex', alignItems: 'center', gap: abstand('s') };

const zurueckStil: CSSProperties = {
  flex: '0 0 auto',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '44px',
  height: '44px',
  margin: `0 0 0 calc(-1 * ${abstand('s')})`,
  padding: 0,
  border: 'none',
  background: 'none',
  cursor: 'pointer',
  WebkitTapHighlightColor: 'transparent',
};

const formStil: CSSProperties = { flex: '1 1 auto', minWidth: 0, margin: 0 };

const suchfeldRahmenStil: CSSProperties = {
  boxSizing: 'border-box',
  display: 'flex',
  alignItems: 'center',
  gap: abstand('s'),
  height: '46px',
  padding: `0 ${abstand('l')}`,
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
  ...textstufe('text'),
  color: uebersichtFarbe('suchfeldText'),
  ['--bz-platzhalterfarbe' as string]: uebersichtFarbe('suchfeldPlatzhalter'),
};

const statusStil: CSSProperties = { ...blattHinweisStil, textAlign: 'center', marginTop: abstand('l') };

const inhaltStil: CSSProperties = { flex: '1 1 auto', overflowY: 'auto', marginTop: abstand('l') };

const rasterStil: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
  gap: `${abstand('l')} ${abstand('m')}`,
  paddingBottom: abstand('l'),
};

export const trefferStil: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  minWidth: 0,
  margin: 0,
  padding: 0,
  border: 'none',
  background: 'none',
  fontFamily: 'inherit',
  textAlign: 'left',
  cursor: 'pointer',
  WebkitTapHighlightColor: 'transparent',
};

// Cover im Seitenverhältnis 2:3 wie die Coverflächen der Seite „Bücher“.
export const coverRahmenStil: CSSProperties = {
  position: 'relative',
  width: '100%',
  aspectRatio: '2 / 3',
  borderRadius: '6px',
  overflow: 'hidden',
  boxShadow: coverSchatten,
};

export const coverBildStil: CSSProperties = { display: 'block', width: '100%', height: '100%', objectFit: 'cover' };

const titelStil: CSSProperties = {
  display: '-webkit-box',
  WebkitLineClamp: 2,
  WebkitBoxOrient: 'vertical',
  overflow: 'hidden',
  marginTop: abstand('s'),
  ...textstufe('meta'),
  fontWeight: 600,
  lineHeight: 1.25,
  color: barcodeFarbe('trefferTitel'),
};

const einzeilig: CSSProperties = { display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' };

const autorStil: CSSProperties = { ...einzeilig, marginTop: '2px', ...textstufe('meta'), lineHeight: 1.3, color: barcodeFarbe('trefferText') };

export const quelleStil: CSSProperties = {
  ...einzeilig,
  marginTop: '2px',
  ...textstufe('meta'),
  fontStyle: 'italic',
  lineHeight: 1.3,
  color: barcodeFarbe('quelle'),
};

/** Art des Fensters; bestimmt die Kennzeichen `data-<art>-…` (z. B. `data-online-suche`, `data-cover-suche`). */
export type SuchfensterArt = 'online' | 'cover';

export interface SuchblattProps {
  art: SuchfensterArt;
  /** Name des Fensters (Dialog-Beschriftung). */
  titel: string;
  /** Suche mit Suchtext und gewählten Sprachen; leere Liste = nichts gefunden, Fehler = keine Verbindung. */
  suchen: (text: string, sprachen: readonly Sprache[]) => Promise<Treffer[]>;
  /** Hinweis ohne Ergebnis. */
  keineTrefferHinweis: string;
  /** Anzeigedauer der Hinweise; ohne Angabe bleiben sie bis zur nächsten Suche. */
  hinweisMs?: number;
  /** Vorbelegung der Suchzeile; nicht leer: Suche startet beim Öffnen automatisch (REQ-118). */
  vorbelegung?: string;
  einstellungRepository?: EinstellungRepository;
  /** Beschriftung des Rasters (Bedienhilfen). */
  rasterName: string;
  /** Inhalt einer Kachel. */
  kachel: (t: Treffer) => ReactNode;
  /** Bedienhilfen-Name einer Kachel; ohne Angabe ihr Text. */
  kachelName?: (t: Treffer) => string;
  onZurueck: () => void;
  onWahl: (t: Treffer) => void;
}

/**
 * Gemeinsames Suchfenster (REQ-116, REQ-118): Blatt von unten mit Ziehgriff, Zurück-Pfeil, Sprachfilter (REQ-119) und
 * Suchzeile. Gesucht wird mit der Such-Taste, bei Vorbelegung sofort beim Öffnen, und nach einer Änderung der
 * Sprachauswahl erneut, sofern im Fenster schon gesucht wurde. Treffer erscheinen im 3-Spalten-Raster.
 */
export function Suchblatt({
  art,
  titel,
  suchen,
  keineTrefferHinweis,
  hinweisMs,
  vorbelegung = '',
  einstellungRepository,
  rasterName,
  kachel,
  kachelName,
  onZurueck,
  onWahl,
}: SuchblattProps) {
  const design = useDesign();
  const [ersatz] = useState(fluechtigeEinstellungen);
  const [sprachen, sprachenSetzen] = useSprachauswahl(einstellungRepository ?? design.einstellungRepository ?? ersatz);
  const [text, setText] = useState(vorbelegung);
  const [stand, setStand] = useState<Stand>({ art: 'leer' });
  const [hinweis, setHinweis] = useState<{ text: string; n: number } | null>(null);
  const [versatz, setVersatz] = useState(0);
  const zug = useRef<{ start: number; strecke: number } | null>(null);
  const feld = useRef<HTMLInputElement>(null);
  const aktiv = useRef(true);
  const lauf = useRef(0);
  // Suchtext, der auf das Laden der Sprachauswahl wartet (Autostart bzw. sehr schnelle Such-Taste).
  const wartet = useRef<string | null>(null);
  const gesucht = useRef(false);

  useEffect(() => {
    aktiv.current = true;
    // Tastatur nur bei leerer Suchzeile (REQ-116, AK-2; REQ-118: bei Vorbelegung nicht).
    if (vorbelegung.trim() === '') feld.current?.focus();
    // Automatischer Start mit der Vorbelegung (REQ-118, AK-2/AK-3/AK-12).
    else wartet.current = vorbelegung;
    return () => {
      aktiv.current = false;
    };
    // Nur beim Öffnen.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!hinweis || hinweisMs === undefined) return;
    const t = setTimeout(() => setHinweis(null), hinweisMs);
    return () => clearTimeout(t);
  }, [hinweis, hinweisMs]);

  const verlassen = useZurueckTaste(() => {
    aktiv.current = false;
    onZurueck();
    return false;
  });

  const zurueck = () => {
    if (!aktiv.current) return;
    aktiv.current = false;
    verlassen();
    onZurueck();
  };

  const waehlen = (t: Treffer) => {
    if (!aktiv.current) return;
    aktiv.current = false;
    verlassen();
    onWahl(t);
  };

  const hinweisZeigen = (h: string) => setHinweis((alt) => ({ text: h, n: (alt?.n ?? 0) + 1 }));

  const ausfuehren = (suchtext: string, spr: readonly Sprache[]) => {
    if (!aktiv.current) return;
    gesucht.current = true;
    const nr = ++lauf.current;
    setHinweis(null);
    setStand({ art: 'laeuft' });
    void suchen(suchtext, spr).then(
      (treffer) => {
        if (!aktiv.current || nr !== lauf.current) return;
        setStand({ art: 'ergebnis', treffer });
        if (treffer.length === 0) hinweisZeigen(keineTrefferHinweis);
      },
      (fehler: unknown) => {
        if (!aktiv.current || nr !== lauf.current) return;
        console.warn('Online-Suche fehlgeschlagen:', fehler);
        setStand({ art: 'ergebnis', treffer: [] });
        hinweisZeigen(KEIN_INTERNET_HINWEIS);
      },
    );
  };

  // Sprachauswahl geladen: wartende Suche ausführen.
  useEffect(() => {
    if (!sprachen || wartet.current === null) return;
    const t = wartet.current;
    wartet.current = null;
    ausfuehren(t, sprachen);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sprachen]);

  const starten = () => {
    // Leere Suchzeile bzw. nur Leerzeichen: nichts (REQ-116, AK-5).
    if (text.trim() === '' || !aktiv.current) return;
    // Tastatur schließen, damit die Treffer sichtbar sind.
    feld.current?.blur();
    if (!sprachen) {
      wartet.current = text;
      setHinweis(null);
      setStand({ art: 'laeuft' });
      return;
    }
    ausfuehren(text, sprachen);
  };

  // Änderung der Sprachauswahl: nach einer Suche sofort neu suchen (REQ-119, AK-6).
  const sprachenAendern = (neu: Sprache[]) => {
    sprachenSetzen(neu);
    if (gesucht.current && text.trim() !== '') ausfuehren(text, neu);
  };

  const zugStart = (e: ReactPointerEvent<HTMLDivElement>) => {
    zug.current = { start: e.clientY, strecke: 0 };
    e.currentTarget.setPointerCapture?.(e.pointerId);
  };
  const zugBewegen = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!zug.current) return;
    zug.current.strecke = Math.max(0, e.clientY - zug.current.start);
    setVersatz(zug.current.strecke);
  };
  const zugEnde = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!zug.current) return;
    const strecke = Math.max(zug.current.strecke, e.clientY - zug.current.start);
    zug.current = null;
    if (Number.isFinite(strecke) && strecke >= SCHREIBFENSTER_ZUG_SCHWELLE) {
      zurueck();
      return;
    }
    setVersatz(0);
  };
  const zugAbbrechen = () => {
    zug.current = null;
    setVersatz(0);
  };

  const treffer = stand.art === 'ergebnis' ? stand.treffer : [];
  const kennung = (name: string) => ({ [`data-${art}-${name}`]: '' });

  return (
    <>
      <div {...kennung('suche-hintergrund')} onClick={zurueck} style={hintergrundStil} />
      <div role="dialog" aria-modal="true" aria-label={titel} {...kennung('suche')} {...stilRolle('blatt')} style={fenster(versatz)}>
        <div
          data-ziehgriff=""
          onPointerDown={zugStart}
          onPointerMove={zugBewegen}
          onPointerUp={zugEnde}
          onPointerCancel={zugAbbrechen}
          style={griffBereichStil}
        >
          <span style={griffStil} />
        </div>
        <Sprachfilter auswahl={sprachen ?? []} onAendern={sprachenAendern} />
        <div style={kopfStil}>
          <button type="button" aria-label="Zurück" {...kennung('suche-zurueck')} onClick={zurueck} style={zurueckStil}>
            <Icon datei="icon-zurueck.png" url={iconZurueck} farbe={barcodeFarbe('zurueckIcon')} groesse={24} />
          </button>
          <form
            role="search"
            action=""
            onSubmit={(e) => {
              e.preventDefault();
              starten();
            }}
            style={formStil}
          >
            <label style={suchfeldRahmenStil}>
              <Icon datei="icon-lupe.png" url={iconLupe} farbe={uebersichtFarbe('suchfeldIcon')} groesse={20} />
              <input
                ref={feld}
                type="search"
                enterKeyHint="search"
                inputMode="search"
                autoComplete="off"
                {...kennung('suchfeld')}
                data-bz-eingabe=""
                aria-label={ONLINE_SUCHFELD_TEXT}
                placeholder={ONLINE_SUCHFELD_TEXT}
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={(e) => {
                  // Such-Taste der Tastatur (Enter); verhindert zugleich das doppelte Absenden des Formulars.
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    starten();
                  }
                }}
                style={suchfeldStil}
              />
            </label>
          </form>
        </div>

        {stand.art === 'laeuft' ? (
          <p role="status" {...kennung('suche-laeuft')} style={statusStil}>
            Ich suche …
          </p>
        ) : null}
        {hinweis ? (
          <p role="status" key={hinweis.n} {...kennung('suche-hinweis')} style={statusStil}>
            {hinweis.text}
          </p>
        ) : null}

        <div style={inhaltStil}>
          {treffer.length > 0 ? (
            <div role="list" aria-label={rasterName} {...kennung('treffer-raster')} style={rasterStil}>
              {treffer.map((t, i) => (
                <button
                  key={`${t.quelle}-${i}`}
                  type="button"
                  role="listitem"
                  {...{ [`data-${art}-treffer`]: i }}
                  data-quelle={t.quelle}
                  aria-label={kachelName?.(t)}
                  onClick={() => waehlen(t)}
                  style={trefferStil}
                >
                  {kachel(t)}
                </button>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </>
  );
}

/** Kachel eines Buch-Treffers: Cover (sonst Platzhalter), Titel, Autor, Quelle (REQ-117, AK-4/AK-5). */
function buchKachel(t: Treffer) {
  return (
    <>
      <span style={coverRahmenStil}>
        {t.angaben.cover ? <img src={t.angaben.cover} alt="" data-treffer-cover="" style={coverBildStil} /> : <CoverPlatzhalter fuellen />}
      </span>
      <span data-treffer-titel="" style={titelStil}>
        {t.angaben.titel}
      </span>
      {t.angaben.autor ? (
        <span data-treffer-autor="" style={autorStil}>
          {t.angaben.autor}
        </span>
      ) : null}
      <span data-treffer-quelle="" style={quelleStil}>
        {QUELLEN_NAME[t.quelle]}
      </span>
    </>
  );
}

/**
 * Suchfenster „Online suchen“ (REQ-116): Blatt von unten mit Sprachfilter (REQ-119), Zurück-Pfeil und Suchfeld
 * (Fokus beim Öffnen). Gesucht wird erst mit der Such-Taste; Treffer erscheinen im 3-Spalten-Raster (REQ-117).
 */
export default function Suchfenster({ suche, onZurueck, onWahl, einstellungRepository }: Props) {
  return (
    <Suchblatt
      art="online"
      titel="Online suchen"
      suchen={(text, sprachen) => suche.suchen(text, sprachen)}
      keineTrefferHinweis={KEINE_TREFFER_HINWEIS}
      hinweisMs={ONLINE_SUCHE_HINWEIS_MS}
      einstellungRepository={einstellungRepository}
      rasterName="Gefundene Bücher"
      kachel={buchKachel}
      onZurueck={onZurueck}
      onWahl={(t) => onWahl(t.angaben)}
    />
  );
}
