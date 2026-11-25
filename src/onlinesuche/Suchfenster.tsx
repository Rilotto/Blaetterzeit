// Suchfenster „Online suchen“ (REQ-110) mit Trefferraster (REQ-111).
import { useEffect, useRef, useState, type CSSProperties, type PointerEvent as ReactPointerEvent } from 'react';
import iconLupe from '@/assets/icons/icon-lupe.png';
import iconZurueck from '@/assets/icons/icon-zurueck.png';
import type { OnlineSuche } from '@/barcode/suche';
import { QUELLEN_NAME, type Treffer } from '@/barcode/treffer';
import { blattHinweisStil } from '@/buchdetails/BlattUnten';
import { SCHREIBFENSTER_ZUG_SCHWELLE } from '@/buchdetails/reiter/rezension';
import type { Vorbelegung } from '@/buchanlegen/eingabe';
import CoverPlatzhalter from '@/components/CoverPlatzhalter';
import Icon from '@/components/Icon';
import { useZurueckTaste } from '@/plattform/zurueckTaste';
import { fensterStil, griffBereichStil, griffStil, hintergrundStil } from '@/profil/blattStil';
import { abstand, barcodeFarbe, coverSchatten, stilRolle, textstufe, uebersichtFarbe } from '@/theme';

/** Hinweise (REQ-110, AK-6/AK-7). */
export const KEINE_TREFFER_HINWEIS = 'Keine Bücher gefunden';
export const KEIN_INTERNET_HINWEIS = 'Keine Internetverbindung';
/** So lange bleibt ein Hinweis sichtbar. */
export const ONLINE_SUCHE_HINWEIS_MS = 2500;
/** Beschriftung des Suchfelds. */
export const ONLINE_SUCHFELD_TEXT = 'Titel, Autor oder ISBN';

interface Props {
  suche: OnlineSuche;
  /** Zurück-Pfeil, Android-Zurück-Taste oder Herunterziehen: eine Stufe zurück ins Menü (REQ-110, AK-8). */
  onZurueck: () => void;
  /** Treffer angetippt: weiter wie beim Barcode-Scan (REQ-111, AK-7). */
  onWahl: (vorbelegung: Vorbelegung) => void;
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

const trefferStil: CSSProperties = {
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
const coverRahmenStil: CSSProperties = {
  position: 'relative',
  width: '100%',
  aspectRatio: '2 / 3',
  borderRadius: '6px',
  overflow: 'hidden',
  boxShadow: coverSchatten,
};

const coverBildStil: CSSProperties = { display: 'block', width: '100%', height: '100%', objectFit: 'cover' };

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

const quelleStil: CSSProperties = {
  ...einzeilig,
  marginTop: '2px',
  ...textstufe('meta'),
  fontStyle: 'italic',
  lineHeight: 1.3,
  color: barcodeFarbe('quelle'),
};

/**
 * Suchfenster „Online suchen“ (REQ-110): Blatt von unten mit Zurück-Pfeil und Suchfeld (Fokus beim Öffnen).
 * Gesucht wird erst mit der Such-Taste; Treffer erscheinen im 3-Spalten-Raster (REQ-111).
 */
export default function Suchfenster({ suche, onZurueck, onWahl }: Props) {
  const [text, setText] = useState('');
  const [stand, setStand] = useState<Stand>({ art: 'leer' });
  const [hinweis, setHinweis] = useState<{ text: string; n: number } | null>(null);
  const [versatz, setVersatz] = useState(0);
  const zug = useRef<{ start: number; strecke: number } | null>(null);
  const feld = useRef<HTMLInputElement>(null);
  const aktiv = useRef(true);
  const lauf = useRef(0);

  useEffect(() => {
    aktiv.current = true;
    // Fokus beim Öffnen: Tastatur sofort offen (REQ-110, AK-2).
    feld.current?.focus();
    return () => {
      aktiv.current = false;
    };
  }, []);

  useEffect(() => {
    if (!hinweis) return;
    const t = setTimeout(() => setHinweis(null), ONLINE_SUCHE_HINWEIS_MS);
    return () => clearTimeout(t);
  }, [hinweis]);

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
    onWahl(t.angaben);
  };

  const hinweisZeigen = (h: string) => setHinweis((alt) => ({ text: h, n: (alt?.n ?? 0) + 1 }));

  const starten = () => {
    // Leeres Suchfeld bzw. nur Leerzeichen: nichts (REQ-110, AK-5).
    if (text.trim() === '' || !aktiv.current) return;
    const nr = ++lauf.current;
    setHinweis(null);
    setStand({ art: 'laeuft' });
    // Tastatur schließen, damit die Treffer sichtbar sind.
    feld.current?.blur();
    void suche.suchen(text).then(
      (treffer) => {
        if (!aktiv.current || nr !== lauf.current) return;
        setStand({ art: 'ergebnis', treffer });
        if (treffer.length === 0) hinweisZeigen(KEINE_TREFFER_HINWEIS);
      },
      (fehler: unknown) => {
        if (!aktiv.current || nr !== lauf.current) return;
        console.warn('Online-Suche fehlgeschlagen:', fehler);
        setStand({ art: 'ergebnis', treffer: [] });
        hinweisZeigen(KEIN_INTERNET_HINWEIS);
      },
    );
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

  return (
    <>
      <div data-online-suche-hintergrund="" onClick={zurueck} style={hintergrundStil} />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Online suchen"
        data-online-suche=""
        {...stilRolle('blatt')}
        style={fenster(versatz)}
      >
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
        <div style={kopfStil}>
          <button type="button" aria-label="Zurück" data-online-suche-zurueck="" onClick={zurueck} style={zurueckStil}>
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
                autoFocus
                data-online-suchfeld=""
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
          <p role="status" data-online-suche-laeuft="" style={statusStil}>
            Ich suche …
          </p>
        ) : null}
        {hinweis ? (
          <p role="status" key={hinweis.n} data-online-suche-hinweis="" style={statusStil}>
            {hinweis.text}
          </p>
        ) : null}

        <div style={inhaltStil}>
          {treffer.length > 0 ? (
            <div role="list" aria-label="Gefundene Bücher" data-online-treffer-raster="" style={rasterStil}>
              {treffer.map((t, i) => (
                <button
                  key={`${t.quelle}-${i}`}
                  type="button"
                  role="listitem"
                  data-online-treffer={i}
                  data-quelle={t.quelle}
                  onClick={() => waehlen(t)}
                  style={trefferStil}
                >
                  <span style={coverRahmenStil}>
                    {t.angaben.cover ? (
                      <img src={t.angaben.cover} alt="" data-treffer-cover="" style={coverBildStil} />
                    ) : (
                      <CoverPlatzhalter fuellen />
                    )}
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
                </button>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </>
  );
}
