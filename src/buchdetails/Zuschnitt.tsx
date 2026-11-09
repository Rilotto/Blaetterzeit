import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type PointerEvent as ReactPointerEvent } from 'react';
import { startEcken, type Ecken, type Punkt } from '@/bild/entzerren';
import type { Bildbereich } from '@/storage/ImageStore';
import { buchdetailsFarbe } from '@/theme';
import Kopfzeile from './Kopfzeile';
import { RAND, seitenverhaeltnis } from './masse';

interface Props {
  bild: string;
  bereich: Bildbereich;
  /** Bestätigte Ecken (normiert 0…1, oben links, oben rechts, unten rechts, unten links). */
  onBestaetigen: (ecken: Ecken) => void | Promise<void>;
  onZurueck: () => void;
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
  margin: `16px ${RAND}px 0`,
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
  padding: `16px ${RAND}px 24px`,
};

const bestaetigenStil: CSSProperties = {
  minWidth: '180px',
  height: '44px',
  margin: 0,
  padding: '0 24px',
  border: 'none',
  borderRadius: '9999px',
  fontFamily: 'inherit',
  fontSize: '16px',
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

/** Zuschnitt mit vier frei verschiebbaren Eckpunkten (REQ-017). */
export default function Zuschnitt({ bild, bereich, onBestaetigen, onZurueck }: Props) {
  const verhaeltnis = seitenverhaeltnis(bereich);
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

  const ziehen = (index: number) => (e: ReactPointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    const rahmen = rahmenRef.current;
    if (!rahmen) return;
    const bewegen = (ev: PointerEvent) => {
      const r = rahmen.getBoundingClientRect();
      const p = { x: begrenzen((ev.clientX - r.left) / (r.width || 1)), y: begrenzen((ev.clientY - r.top) / (r.height || 1)) };
      verschoben.current = true;
      setEcken((alt) => alt.map((q, i) => (i === index ? p : q)) as unknown as Ecken);
    };
    const ende = () => {
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

  const linie = ecken.map((p) => `${p.x * 100},${p.y * 100}`).join(' ');
  return (
    <section aria-label="Zuschnitt" data-startformat={bereich === 'cover' ? 'cover' : 'schmal'} style={ansichtStil}>
      <Kopfzeile onZurueck={onZurueck} />
      <div ref={flaecheRef} style={flaecheStil}>
        <div ref={rahmenRef} data-zuschnitt-bild="" style={rahmenStil}>
          <img
            src={bild}
            alt=""
            draggable={false}
            onLoad={(e) => setBildGroesse({ b: e.currentTarget.naturalWidth, h: e.currentTarget.naturalHeight })}
            style={bildStil}
          />
          <svg
            aria-hidden="true"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', overflow: 'visible', pointerEvents: 'none' }}
          >
            <polygon
              points={linie}
              vectorEffect="non-scaling-stroke"
              style={{ fill: 'none', stroke: buchdetailsFarbe('zuschnittRahmen'), strokeWidth: 2 }}
            />
          </svg>
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
