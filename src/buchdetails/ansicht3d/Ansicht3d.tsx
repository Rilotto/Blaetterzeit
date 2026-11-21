import { useEffect, useMemo, useRef, useState, type CSSProperties, type PointerEvent as ReactPointerEvent } from 'react';
import { bildBegrenzen } from '@/bild/bildverarbeitung';
import Symbolbild from '@/components/Symbolbild';
import { useZurueckTaste } from '@/plattform/zurueckTaste';
import { ansicht3dFarbe, ansicht3dSchatten, abstand, bildschirmrand, pillenhoehe, textstufe } from '@/theme';
import type { MassQuelle } from '../masse';
import { Trackball, cssDrehung } from './drehung';
import { TEXTUR_MAX_KANTE, buchModell, type Bilder, type Flaeche, type Inhalt } from './modell';

interface Props {
  buch: MassQuelle & { titel: string; autor?: string };
  bilder: Bilder;
  /** X oder Zurück-Taste: zurück in die Buchdetails im vorherigen Zustand (REQ-074, AK-7). */
  onSchliessen: () => void;
  /** Pille „Bearbeiten“: Buchdetails mit Reiter „Details“ (REQ-074, AK-6). */
  onBearbeiten: () => void;
}

/** Kann der Browser den Hintergrund per `backdrop-filter` verwischen? Sonst verwischen die Buchdetails selbst (`filter`). */
export function backdropUnterstuetzt(): boolean {
  try {
    return (
      typeof CSS !== 'undefined' &&
      typeof CSS.supports === 'function' &&
      (CSS.supports('backdrop-filter', 'blur(2px)') || CSS.supports('-webkit-backdrop-filter', 'blur(2px)'))
    );
  } catch {
    return false;
  }
}

/** Unschärfe des Hintergrunds (REQ-074, AK-4). */
export const UNSCHAERFE = 'blur(14px)';

const jetzt = (): number => (typeof performance !== 'undefined' ? performance.now() : Date.now());

const ansichtStil = (backdrop: boolean): CSSProperties => ({
  position: 'fixed',
  inset: 0,
  zIndex: 60,
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden',
  backgroundColor: `color-mix(in srgb, ${ansicht3dFarbe('schleier')} 45%, transparent)`,
  ...(backdrop ? { backdropFilter: UNSCHAERFE, WebkitBackdropFilter: UNSCHAERFE } : {}),
});

const schliessenStil: CSSProperties = {
  position: 'absolute',
  top: abstand('l'),
  left: bildschirmrand,
  zIndex: 1,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '44px',
  height: '44px',
  margin: 0,
  padding: 0,
  border: 'none',
  borderRadius: '50%',
  backgroundColor: ansicht3dFarbe('schliessenFlaeche'),
  boxShadow: ansicht3dSchatten,
  cursor: 'pointer',
  WebkitTapHighlightColor: 'transparent',
};

const buehneStil: CSSProperties = {
  flex: '1 1 auto',
  position: 'relative',
  minHeight: 0,
  perspective: '1400px',
  touchAction: 'none',
  userSelect: 'none',
  cursor: 'grab',
};

const modellStil: CSSProperties = {
  position: 'absolute',
  left: '50%',
  top: '50%',
  width: 0,
  height: 0,
  transformStyle: 'preserve-3d',
  willChange: 'transform',
};

const fussStil: CSSProperties = {
  flex: '0 0 auto',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  padding: `0 ${bildschirmrand} calc(${abstand('xl')} + env(safe-area-inset-bottom, 0px))`,
};

const titelStil: CSSProperties = {
  margin: 0,
  ...textstufe('abschnitt'),
  fontWeight: 700,
  lineHeight: 1.25,
  textAlign: 'center',
  overflowWrap: 'break-word',
  color: ansicht3dFarbe('titel'),
};

const autorStil: CSSProperties = {
  margin: `${abstand('xs')} 0 0`,
  ...textstufe('text'),
  fontStyle: 'italic',
  textAlign: 'center',
  color: ansicht3dFarbe('autor'),
};

const pilleStil: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  gap: abstand('xs'),
  boxSizing: 'border-box',
  width: '100%',
  minHeight: `calc(${pillenhoehe} * 2)`,
  marginTop: abstand('l'),
  padding: `${abstand('s')} ${abstand('l')}`,
  border: 'none',
  borderRadius: '999px',
  backgroundColor: ansicht3dFarbe('pilleFlaeche'),
  color: ansicht3dFarbe('pilleSchrift'),
  fontFamily: 'inherit',
  ...textstufe('text'),
  fontWeight: 600,
  cursor: 'pointer',
  WebkitTapHighlightColor: 'transparent',
};

const LINIE_PX = 0.6;
const PAPIER_PX = 1.4;
const seitenmuster = (linien: 'senkrecht' | 'waagerecht') =>
  `repeating-linear-gradient(${linien === 'senkrecht' ? '90deg' : '0deg'}, ${ansicht3dFarbe('seitenPapier')} 0 ${PAPIER_PX}px, ${ansicht3dFarbe('seitenLinie')} ${PAPIER_PX}px ${PAPIER_PX + LINIE_PX}px)`;

/** Leichte Schattierung je Fläche für Tiefe (keine Farbe, nur Helligkeit). */
const HELLIGKEIT: Record<Flaeche['seite'], number> = {
  vorne: 1,
  hinten: 0.92,
  ruecken: 0.88,
  schnitt: 0.95,
  oben: 1,
  unten: 0.85,
  kante: 0.82,
};

const flaecheStil = (f: Flaeche): CSSProperties => ({
  position: 'absolute',
  left: `${-f.breite / 2}px`,
  top: `${-f.hoehe / 2}px`,
  width: `${f.breite}px`,
  height: `${f.hoehe}px`,
  boxSizing: 'border-box',
  overflow: 'hidden',
  transform: f.transform,
  backfaceVisibility: 'hidden',
  WebkitBackfaceVisibility: 'hidden',
  ...(HELLIGKEIT[f.seite] !== 1 ? { filter: `brightness(${HELLIGKEIT[f.seite]})` } : {}),
  ...(f.inhalt.art === 'primaer' ? { backgroundColor: ansicht3dFarbe('modellFlaeche') } : {}),
  ...(f.inhalt.art === 'muster' ? { backgroundImage: seitenmuster(f.inhalt.linien) } : {}),
});

const bildStil: CSSProperties = { display: 'block', width: '100%', height: '100%', objectFit: 'cover', pointerEvents: 'none' };

const modellTitelStil: CSSProperties = {
  position: 'absolute',
  top: '14px',
  left: '12px',
  right: '12px',
  ...textstufe('titel'),
  fontWeight: 700,
  lineHeight: 1.25,
  overflowWrap: 'anywhere',
  color: ansicht3dFarbe('modellTitel'),
};

function FlaechenInhalt({ inhalt }: { inhalt: Inhalt }) {
  if (inhalt.art === 'bild') return <img data-flaeche-bild="" src={inhalt.bild} alt="" draggable={false} style={bildStil} />;
  if (inhalt.art === 'primaer' && inhalt.titel !== undefined)
    return (
      <span data-modell-titel="" style={modellTitelStil}>
        {inhalt.titel}
      </span>
    );
  return null;
}

/** Bilder für die Texturen auf höchstens TEXTUR_MAX_KANTE px verkleinern (ohne Canvas unverändert). */
function useTexturen(bilder: Bilder): Bilder {
  const [klein, setKlein] = useState<Bilder>(bilder);
  useEffect(() => {
    let laeuft = true;
    setKlein(bilder);
    const eintraege = Object.entries(bilder) as [keyof Bilder, string][];
    void Promise.all(eintraege.map(([b, url]) => bildBegrenzen(url, TEXTUR_MAX_KANTE).then((k) => [b, k] as const, () => [b, url] as const))).then(
      (fertig) => {
        if (laeuft) setKlein(Object.fromEntries(fertig) as Bilder);
      },
    );
    return () => {
      laeuft = false;
    };
  }, [bilder]);
  return klein;
}

/**
 * 3D-Ansicht eines Buches (REQ-074 bis REQ-076): frei drehbares Modell aus CSS-3D-Ebenen, darunter Titel,
 * Autor und Pille „Bearbeiten“, oben links X. Pro Frame wird nur `transform` des Modells gesetzt (kein React-State).
 */
export default function Ansicht3d({ buch, bilder, onSchliessen, onBearbeiten }: Props) {
  const texturen = useTexturen(bilder);
  const modell = useMemo(
    () => buchModell(buch, texturen),
    // Nur was das Modell bestimmt; ein neues Buch-Objekt mit gleichen Werten baut es nicht neu.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [buch.titel, buch.breiteMm, buch.hoeheMm, buch.dickeMm, buch.format, buch.unterformat, buch.seitenanzahl, texturen],
  );
  const [backdrop] = useState(backdropUnterstuetzt);
  const modellRef = useRef<HTMLDivElement>(null);
  const kugelRef = useRef<Trackball | null>(null);
  if (kugelRef.current === null) kugelRef.current = new Trackball();
  const kugel = kugelRef.current;
  const zeiger = useRef<number | null>(null);
  const frame = useRef<number | null>(null);

  const anwenden = () => {
    const el = modellRef.current;
    if (el) el.style.transform = cssDrehung(kugel.lage);
  };

  const frameStoppen = () => {
    if (frame.current !== null && typeof cancelAnimationFrame === 'function') cancelAnimationFrame(frame.current);
    frame.current = null;
  };

  const schwungStarten = () => {
    frameStoppen();
    if (!kugel.dreht || typeof requestAnimationFrame !== 'function') return;
    const lauf = () => {
      const weiter = kugel.schritt(jetzt());
      anwenden();
      frame.current = weiter ? requestAnimationFrame(lauf) : null;
    };
    frame.current = requestAnimationFrame(lauf);
  };

  useEffect(() => frameStoppen, []);

  // Android-Zurück-Taste schließt die Ansicht (REQ-074, AK-7), Muster wie BlattUnten.
  const verlassen = useZurueckTaste(() => {
    onSchliessen();
    return false;
  });
  const verlassenRef = useRef(verlassen);
  verlassenRef.current = verlassen;
  useEffect(() => () => verlassenRef.current(), []);

  const schliessen = () => {
    verlassen();
    onSchliessen();
  };
  const bearbeiten = () => {
    verlassen();
    onBearbeiten();
  };

  // Nur der erste Finger dreht; weitere Finger (Spreizen) werden ignoriert – kein Zoom (REQ-075, AK-4).
  const greifen = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (zeiger.current !== null) return;
    zeiger.current = e.pointerId;
    e.currentTarget.setPointerCapture?.(e.pointerId);
    frameStoppen();
    kugel.greifen(e.clientX, e.clientY, jetzt());
  };
  const ziehen = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (zeiger.current !== e.pointerId) return;
    kugel.ziehen(e.clientX, e.clientY, jetzt());
    anwenden();
  };
  const loslassen = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (zeiger.current !== e.pointerId) return;
    zeiger.current = null;
    kugel.loslassen(jetzt());
    schwungStarten();
  };

  const r2 = (x: number) => String(Number(x.toFixed(2)));

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="3D-Ansicht"
      data-ansicht3d=""
      data-verschwommen={backdrop ? 'backdrop' : 'filter'}
      style={ansichtStil(backdrop)}
    >
      <button type="button" aria-label="Schließen" data-ansicht3d-schliessen="" onClick={schliessen} style={schliessenStil}>
        <Symbolbild name="schliessen" farbe={ansicht3dFarbe('schliessenIcon')} groesse={22} />
      </button>
      <div
        data-ansicht3d-buehne=""
        onPointerDown={greifen}
        onPointerMove={ziehen}
        onPointerUp={loslassen}
        onPointerCancel={loslassen}
        style={buehneStil}
      >
        <div
          ref={modellRef}
          data-modell3d=""
          data-gestalt={modell.gestalt}
          data-modell-breite={r2(modell.breite)}
          data-modell-hoehe={r2(modell.hoehe)}
          data-modell-dicke={r2(modell.dicke)}
          data-modell-ueberstand={r2(modell.ueberstand)}
          style={{ ...modellStil, transform: cssDrehung(kugel.lage) }}
        >
          {modell.flaechen.map((f) => (
            <div key={f.id} data-flaeche={f.seite} data-flaeche-id={f.id} data-inhalt={f.inhalt.art} style={flaecheStil(f)}>
              <FlaechenInhalt inhalt={f.inhalt} />
            </div>
          ))}
        </div>
      </div>
      <div style={fussStil}>
        <h2 data-ansicht3d-titel="" style={titelStil}>
          {buch.titel}
        </h2>
        {buch.autor ? (
          <p data-ansicht3d-autor="" style={autorStil}>
            {buch.autor}
          </p>
        ) : null}
        <button type="button" data-ansicht3d-bearbeiten="" onClick={bearbeiten} style={pilleStil}>
          <Symbolbild name="stift" farbe={ansicht3dFarbe('pilleSchrift')} groesse={22} />
          Bearbeiten
        </button>
      </div>
    </div>
  );
}
