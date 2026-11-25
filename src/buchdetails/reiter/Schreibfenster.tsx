import { useRef, useState, type CSSProperties, type PointerEvent as ReactPointerEvent } from 'react';
import Symbolbild from '@/components/Symbolbild';
import type { BewertungsWert } from '@/domain/bewertung';
import { rezensionLeer } from '@/domain/bewertung';
import { useZurueckTaste } from '@/plattform/zurueckTaste';
import { abdunklung, kriteriumBlass, kriteriumVoll, rezensionFarbe, sichernKante, textstufe, zeilenabstand, bildschirmrandPx, pillenhoehe, abstand, stilRolle } from '@/theme';
import { REZENSION_PLATZHALTER, SCHREIBFENSTER_ZUG_SCHWELLE, STUFEN } from './rezension';


const RAND_FENSTER = bildschirmrandPx;

const hintergrundStil: CSSProperties = {
  position: 'fixed',
  inset: 0,
  zIndex: 30,
  backgroundColor: abdunklung,
  animation: 'bz-abdunklung-ein 200ms ease-out',
};

// Fast bildschirmhoch (Referenzbild REF-rezension-04): oben bleibt ein Streifen zum Tippen außerhalb.
const fensterStil = (versatz: number): CSSProperties => ({
  position: 'fixed',
  left: 0,
  right: 0,
  bottom: 0,
  top: '40px',
  zIndex: 31,
  boxSizing: 'border-box',
  display: 'flex',
  flexDirection: 'column',
  padding: `0 ${RAND_FENSTER}px`,
  borderTopLeftRadius: '28px',
  borderTopRightRadius: '28px',
  backgroundColor: rezensionFarbe('fensterFlaeche'),
  animation: 'bz-blatt-ein 220ms ease-out',
  transform: versatz > 0 ? `translateY(${versatz}px)` : undefined,
  transition: versatz > 0 ? undefined : 'transform 160ms ease-out',
});

const griffBereichStil: CSSProperties = {
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  flex: '0 0 auto',
  height: '32px',
  touchAction: 'none',
  cursor: 'grab',
};

const griffStil: CSSProperties = {
  width: '40px',
  height: '5px',
  borderRadius: '3px',
  backgroundColor: rezensionFarbe('ziehgriff'),
};

const kopfStil: CSSProperties = {
  position: 'relative',
  flex: '0 0 auto',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: '52px',
  padding: `0 calc(${abstand('xl')} * 2)`,
  textAlign: 'center',
};

const titelStil: CSSProperties = {
  margin: 0,
  ...textstufe('titel'),
  fontWeight: 700,
  lineHeight: 1.25,
  overflowWrap: 'anywhere',
  color: rezensionFarbe('fensterTitel'),
};

const autorStil: CSSProperties = {
  margin: `${abstand('xs')} 0 0`,
  ...textstufe('meta'),
  fontStyle: 'italic',
  lineHeight: 1.25,
  color: rezensionFarbe('fensterAutor'),
};

const schliessenStil: CSSProperties = {
  position: 'absolute',
  right: 0,
  top: '50%',
  transform: 'translateY(-50%)',
  boxSizing: 'border-box',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: pillenhoehe,
  height: pillenhoehe,
  margin: 0,
  padding: 0,
  borderRadius: '50%',
  border: `2px solid ${rezensionFarbe('schliessenRahmen')}`,
  backgroundColor: rezensionFarbe('schliessenFlaeche'),
  cursor: 'pointer',
  WebkitTapHighlightColor: 'transparent',
};

const sterneStil: CSSProperties = {
  display: 'flex',
  justifyContent: 'flex-end',
  gap: abstand('xs'),
  marginTop: abstand('s'),
};

const eingabeStil: CSSProperties = {
  flex: '1 1 auto',
  minHeight: '120px',
  boxSizing: 'border-box',
  width: '100%',
  margin: `${abstand('m')} 0 0`,
  padding: 0,
  border: 'none',
  outline: 'none',
  resize: 'none',
  background: 'none',
  fontFamily: 'inherit',
  ...textstufe('text'),
  lineHeight: zeilenabstand,
  color: rezensionFarbe('eingabeText'),
  // Farbe des Platzhaltertexts über die Variable in index.css (::placeholder).
  ['--bz-platzhalterfarbe' as string]: rezensionFarbe('eingabePlatzhalter'),
};

const sichernStil: CSSProperties = {
  display: 'block',
  flex: '0 0 auto',
  boxSizing: 'border-box',
  width: '100%',
  height: pillenhoehe,
  margin: `${abstand('l')} 0 calc(${abstand('l')} + var(--safe-area-inset-bottom, env(safe-area-inset-bottom, 0)))`,
  padding: 0,
  border: 'none',
  borderRadius: '999px',
  backgroundColor: rezensionFarbe('sichernFlaeche'),
  color: rezensionFarbe('sichernSchrift'),
  boxShadow: sichernKante,
  fontFamily: 'inherit',
  ...textstufe('text'),
  fontWeight: 600,
  cursor: 'pointer',
  WebkitTapHighlightColor: 'transparent',
};

interface Props {
  titel: string;
  autor?: string;
  /** Sterne-Bewertung des Buches; ohne Wert werden keine Sterne gezeigt (REQ-049, AK-3). */
  sterne?: BewertungsWert;
  /** Bisher gesicherte Rezension: steht bearbeitbar im Eingabefeld (REQ-049, AK-7). */
  rezension?: string;
  /** „Sichern“ bei nicht leerem Eingabefeld (REQ-049, AK-5) bzw. leerem Feld mit gespeicherter Rezension (REQ-093). */
  onSichern: (text: string) => void;
  /** Schließen ohne Sichern (X, Herunterziehen, Tippen außerhalb, Zurück-Taste): nichts wird gespeichert. */
  onSchliessen: () => void;
}

/** Schreibfenster der eigenen Rezension (REQ-049). */
export default function Schreibfenster({ titel, autor, sterne, rezension, onSichern, onSchliessen }: Props) {
  const [text, setText] = useState(rezension ?? '');
  const [versatz, setVersatz] = useState(0);
  const zug = useRef<{ start: number; strecke: number } | null>(null);

  // Android-Zurück-Taste: schließen ohne Speichern (REQ-049, AK-9).
  const verlassen = useZurueckTaste(() => {
    onSchliessen();
    return false;
  });

  const schliessen = () => {
    verlassen();
    onSchliessen();
  };

  const sichern = () => {
    // Leeres Eingabefeld ohne gespeicherte Rezension: nichts tun, Fenster bleibt offen (REQ-049, AK-8).
    // Mit gespeicherter Rezension entfernt „Sichern“ sie (REQ-093, AK-8).
    if (rezensionLeer(text) && !rezension) return;
    verlassen();
    onSichern(text);
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
      schliessen();
      return;
    }
    setVersatz(0);
  };
  const zugAbbrechen = () => {
    zug.current = null;
    setVersatz(0);
  };

  return (
    <>
      <div data-schreibfenster-hintergrund="" onClick={schliessen} style={hintergrundStil} />
      <div role="dialog" aria-modal="true" aria-label="Rezension schreiben" data-schreibfenster="" {...stilRolle('blatt')} style={fensterStil(versatz)}>
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
          <h2 data-schreibfenster-titel="" style={titelStil}>
            {titel}
          </h2>
          {autor ? (
            <p data-schreibfenster-autor="" style={autorStil}>
              {autor}
            </p>
          ) : null}
          <button type="button" aria-label="Schließen" data-schreibfenster-schliessen="" onClick={schliessen} style={schliessenStil}>
            <Symbolbild name="schliessen" farbe={rezensionFarbe('schliessenIcon')} groesse={20} />
          </button>
        </div>
        {sterne !== undefined ? (
          // Nur Anzeige, nicht antippbar (REQ-049, AK-2).
          <div role="img" aria-label={`Sterne: ${sterne} von 5`} data-schreibfenster-sterne={sterne} style={sterneStil}>
            {STUFEN.map((n) => (
              <span key={n} data-symbol-nr={n} data-voll={n <= sterne ? 'true' : 'false'}>
                <Symbolbild name="stern" farbe={n <= sterne ? kriteriumVoll('sterne') : kriteriumBlass('sterne')} groesse={18} />
              </span>
            ))}
          </div>
        ) : null}
        <textarea
          aria-label="Rezension"
          data-rezension-eingabe=""
          placeholder={REZENSION_PLATZHALTER}
          value={text}
          onChange={(e) => setText(e.target.value)}
          style={eingabeStil}
        />
        <button type="button" data-rezension-sichern="" onClick={sichern} style={sichernStil}>
          Sichern
        </button>
      </div>
    </>
  );
}
