import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type PointerEvent as ReactPointerEvent } from 'react';
import { startEcken, type Ecken, type Punkt } from '@/bild/entzerren';
import type { Bildbereich } from '@/storage/ImageStore';
import { buchdetailsFarbe, textstufe, abstand } from '@/theme';
import type { Masse } from '@/domain/ausgabe';
import Kopfzeile from './Kopfzeile';
import { FEINJUSTIERUNG, LUPE, feinjustiert, lupenSeite } from './feinjustierung';
import { RAND, seitenverhaeltnis } from './masse';

interface Props {
  bild: string;
  bereich: Bildbereich;
  /** Bestätigte Ecken (normiert 0…1, oben links, oben rechts, unten rechts, unten links). */
  onBestaetigen: (ecken: Ecken) => void | Promise<void>;
  onZurueck: () => void;
  /** Maße des Buches für das Seitenverhältnis des Startrahmens (REQ-073, AK-6); fehlend = Standardmaße. */
  masse?: Masse;
  /** Uhr in Millisekunden für die Feinjustierung (REQ-070); in Tests ersetzbar. */
  uhr?: () => number;
}

/** Zustand der Lupe während des Ziehens (REQ-070). */
interface LupenZustand {
  index: number;
  /** Größe des angezeigten Bildes in px beim Beginn des Ziehens. */
  b: number;
  h: number;
}

const ECKPUNKT = 26;

const ansichtStil: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
  minHeight: '100%',
  boxSizing: 'border-box',
  backgroundColor: buchdetailsFarbe('zuschnittFlaeche'),
};

const flaecheStil: CSSProperties = {
  position: 'relative',
  flex: '1 1 auto',
  minHeight: 0,
  margin: `${abstand('l')} ${RAND}px 0`,
};

const bildStil: CSSProperties = {
  display: 'block',
  width: '100%',
  height: '100%',
  userSelect: 'none',
  pointerEvents: 'none',
};

const eckpunktStil = (p: Punkt): CSSProperties => ({
  position: 'absolute',
  left: `${p.x * 100}%`,
  top: `${p.y * 100}%`,
  width: `${ECKPUNKT}px`,
  height: `${ECKPUNKT}px`,
  transform: 'translate(-50%, -50%)',
  borderRadius: '50%',
  backgroundColor: buchdetailsFarbe('zuschnittEckpunkt'),
  touchAction: 'none',
  cursor: 'grab',
});

const fussStil: CSSProperties = {
  display: 'flex',
  justifyContent: 'center',
  padding: `${abstand('l')} ${RAND}px ${abstand('xl')}`,
};

const bestaetigenStil: CSSProperties = {
  minWidth: '180px',
  height: '44px',
  margin: 0,
  padding: `0 ${abstand('xl')}`,
  border: 'none',
  borderRadius: '9999px',
  fontFamily: 'inherit',
  ...textstufe('text'),
  fontWeight: 600,
  backgroundColor: buchdetailsFarbe('bestaetigenFlaeche'),
  color: buchdetailsFarbe('bestaetigenSchrift'),
  cursor: 'pointer',
  WebkitTapHighlightColor: 'transparent',
};

const begrenzen = (w: number) => Math.min(1, Math.max(0, w));

/** Eingepasste Anzeigegröße des Bildes in der verfügbaren Fläche. */
function einpassen(bild: { b: number; h: number } | null, flaeche: { b: number; h: number } | null) {
  if (!bild || !flaeche || !flaeche.b || !flaeche.h) return null;
  const f = Math.min(flaeche.b / bild.b, flaeche.h / bild.h);
  return { b: bild.b * f, h: bild.h * f };
}

const lupeStil = (seite: 'links' | 'rechts'): CSSProperties => ({
  position: 'absolute',
  top: `${LUPE.abstand}px`,
  [seite === 'links' ? 'left' : 'right']: `${LUPE.abstand}px`,
  zIndex: 2,
  boxSizing: 'border-box',
  width: `${LUPE.durchmesser}px`,
  height: `${LUPE.durchmesser}px`,
  borderRadius: '50%',
  overflow: 'hidden',
  border: `2px solid ${buchdetailsFarbe('zuschnittRahmen')}`,
  backgroundColor: buchdetailsFarbe('zuschnittFlaeche'),
  boxShadow: '0 4px 14px rgba(0, 0, 0, 0.35)',
  pointerEvents: 'none',
});

const fadenStil = (senkrecht: boolean): CSSProperties => ({
  position: 'absolute',
  left: senkrecht ? '50%' : '22%',
  top: senkrecht ? '22%' : '50%',
  width: senkrecht ? '1.5px' : '56%',
  height: senkrecht ? '56%' : '1.5px',
  transform: senkrecht ? 'translateX(-50%)' : 'translateY(-50%)',
  backgroundColor: buchdetailsFarbe('zuschnittEckpunkt'),
});

/** Rahmenlinien des Zuschnitts als SVG über dem Bild (Fläche 0…100). */
function Rahmenlinie({ ecken }: { ecken: Ecken }) {
  const punkte = ecken.map((p) => `${p.x * 100},${p.y * 100}`).join(' ');
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', overflow: 'visible', pointerEvents: 'none' }}
    >
      <polygon
        data-rahmenlinie=""
        points={punkte}
        vectorEffect="non-scaling-stroke"
        style={{ fill: 'none', stroke: buchdetailsFarbe('zuschnittRahmen'), strokeWidth: 2 }}
      />
    </svg>
  );
}

/**
 * Lupe (REQ-070): runder, um den Zoomfaktor vergrößerter Ausschnitt um den gezogenen Eckpunkt mit Rahmenlinien
 * und Fadenkreuz, oben auf der dem Eckpunkt gegenüberliegenden Seite.
 */
function Lupe({ bild, ecken, zustand }: { bild: string; ecken: Ecken; zustand: LupenZustand }) {
  const p = ecken[zustand.index];
  const seite = lupenSeite(p.x);
  const z = LUPE.zoom;
  // Innenmaß (border-box, Rahmen 2 px): der Eckpunkt liegt genau in der Mitte.
  const mitte = LUPE.durchmesser / 2 - 2;
  const innen: CSSProperties = {
    position: 'absolute',
    left: `${mitte - p.x * zustand.b * z}px`,
    top: `${mitte - p.y * zustand.h * z}px`,
    width: `${zustand.b * z}px`,
    height: `${zustand.h * z}px`,
  };
  return (
    <div
      data-lupe=""
      data-lupe-seite={seite}
      data-lupe-zoom={String(z)}
      data-lupe-eckpunkt={String(zustand.index)}
      data-lupe-x={p.x.toFixed(4)}
      data-lupe-y={p.y.toFixed(4)}
      aria-hidden="true"
      style={lupeStil(seite)}
    >
      <div data-lupe-inhalt="" style={innen}>
        <img src={bild} alt="" draggable={false} style={bildStil} />
        <Rahmenlinie ecken={ecken} />
      </div>
      <div data-fadenkreuz="" style={{ position: 'absolute', inset: 0 }}>
        <span style={fadenStil(true)} />
        <span style={fadenStil(false)} />
      </div>
    </div>
  );
}

const standardUhr = () => Date.now();

/**
 * Zuschnitt mit vier frei verschiebbaren Eckpunkten (REQ-017), Lupe und Feinjustierung beim Ziehen (REQ-070),
 * Startrahmen im Seitenverhältnis des Bereichs aus den Maßen (REQ-073).
 */
export default function Zuschnitt({ bild, bereich, onBestaetigen, onZurueck, masse, uhr = standardUhr }: Props) {
  const verhaeltnis = seitenverhaeltnis(bereich, masse);
  const [lupe, setLupe] = useState<LupenZustand | null>(null);
  const [ecken, setEcken] = useState<Ecken>(() => startEcken(1, 1, verhaeltnis));
  const [bildGroesse, setBildGroesse] = useState<{ b: number; h: number } | null>(null);
  const [flaeche, setFlaeche] = useState<{ b: number; h: number } | null>(null);
  const [verarbeitet, setVerarbeitet] = useState(false);
  const verschoben = useRef(false);
  const flaecheRef = useRef<HTMLDivElement>(null);
  const rahmenRef = useRef<HTMLDivElement>(null);

  // Verfügbare Fläche messen (für das Einpassen des Bildes).
  useLayoutEffect(() => {
    const el = flaecheRef.current;
    if (!el) return;
    const messen = () => setFlaeche({ b: el.clientWidth, h: el.clientHeight });
    messen();
    if (typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver(messen);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Sobald die Bildgröße bekannt ist: Startrechteck im Seitenverhältnis des Zielbereichs (in Bildpixeln).
  useEffect(() => {
    if (bildGroesse && !verschoben.current) setEcken(startEcken(bildGroesse.b, bildGroesse.h, verhaeltnis));
  }, [bildGroesse, verhaeltnis]);

  const anzeige = einpassen(bildGroesse, flaeche);
  const rahmenStil: CSSProperties = anzeige
    ? {
        position: 'absolute',
        left: '50%',
        top: '50%',
        width: `${anzeige.b}px`,
        height: `${anzeige.h}px`,
        transform: 'translate(-50%, -50%)',
      }
    : { position: 'absolute', inset: 0 };

  // Ziehen relativ zur Fingerbewegung: schnell 1:1, langsam um den Faktor feiner (REQ-070, Variante b).
  const ziehen = (index: number) => (e: ReactPointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    const rahmen = rahmenRef.current;
    if (!rahmen) return;
    const start = rahmen.getBoundingClientRect();
    let letzter = { x: e.clientX, y: e.clientY, t: uhr() };
    setLupe({ index, b: start.width || anzeige?.b || 0, h: start.height || anzeige?.h || 0 });
    const bewegen = (ev: PointerEvent) => {
      const r = rahmen.getBoundingClientRect();
      const jetzt = uhr();
      const v = feinjustiert(ev.clientX - letzter.x, ev.clientY - letzter.y, jetzt - letzter.t, FEINJUSTIERUNG);
      letzter = { x: ev.clientX, y: ev.clientY, t: jetzt };
      if (v.dx === 0 && v.dy === 0) return;
      verschoben.current = true;
      setEcken(
        (alt) =>
          alt.map((q, i) =>
            i === index ? { x: begrenzen(q.x + v.dx / (r.width || 1)), y: begrenzen(q.y + v.dy / (r.height || 1)) } : q,
          ) as unknown as Ecken,
      );
    };
    const ende = () => {
      setLupe(null);
      window.removeEventListener('pointermove', bewegen);
      window.removeEventListener('pointerup', ende);
      window.removeEventListener('pointercancel', ende);
    };
    window.addEventListener('pointermove', bewegen);
    window.addEventListener('pointerup', ende);
    window.addEventListener('pointercancel', ende);
  };

  const bestaetigen = async () => {
    if (verarbeitet) return;
    setVerarbeitet(true);
    try {
      await onBestaetigen(ecken);
    } finally {
      setVerarbeitet(false);
    }
  };

  return (
    <section aria-label="Zuschnitt" data-startformat={bereich === 'cover' ? 'cover' : 'schmal'} data-bereich-zuschnitt={bereich} style={ansichtStil}>
      <Kopfzeile onZurueck={onZurueck} />
      <div ref={flaecheRef} data-zuschnitt-flaeche="" style={flaecheStil}>
        {lupe ? <Lupe bild={bild} ecken={ecken} zustand={lupe} /> : null}
        <div ref={rahmenRef} data-zuschnitt-bild="" style={rahmenStil}>
          <img
            src={bild}
            alt=""
            draggable={false}
            onLoad={(e) => setBildGroesse({ b: e.currentTarget.naturalWidth, h: e.currentTarget.naturalHeight })}
            style={bildStil}
          />
          <Rahmenlinie ecken={ecken} />
          {ecken.map((p, i) => (
            <div
              key={i}
              data-eckpunkt={String(i)}
              data-x={p.x.toFixed(4)}
              data-y={p.y.toFixed(4)}
              aria-label={`Eckpunkt ${i + 1}`}
              onPointerDown={ziehen(i)}
              style={eckpunktStil(p)}
            />
          ))}
        </div>
      </div>
      <div style={fussStil}>
        <button type="button" disabled={verarbeitet} onClick={() => void bestaetigen()} style={bestaetigenStil}>
          Bestätigen
        </button>
      </div>
    </section>
  );
}
