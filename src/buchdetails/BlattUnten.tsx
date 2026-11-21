import { useEffect, useRef, useState, type CSSProperties, type PointerEvent as ReactPointerEvent, type ReactNode } from 'react';
import iconX from '@/assets/icons/icon-x.png';
import Icon from '@/components/Icon';
import { useZurueckTaste } from '@/plattform/zurueckTaste';
import { abdunklung, fortschrittFarbe, sichernKante, textstufe, bildschirmrandPx, pillenhoehe, abstand, bildschirmrand, stilRolle } from '@/theme';

interface Props {
  /** Überschrift und Name des Dialogs, z. B. „Aktuelle Seite“. */
  titel: string;
  /** X-Schaltfläche oder Tippen auf die Abdunklung: schließen ohne Speichern. */
  onSchliessen: () => void;
  children: ReactNode;
  /** Herunterziehen am Ziehgriff schließt ohne Speichern (z. B. Blatt „Maße“, REQ-072 AK-6); sonst nur optisch. */
  ziehbar?: boolean;
}

/** Ab dieser Zugstrecke nach unten schließt ein ziehbares Blatt (wie der Manuelle Eintrag, REQ-030 AK-11). */
export const BLATT_ZUG_SCHWELLE = 80;

// Maße nach REF-buchdetails-03-aktuelle-seite.png und REF-buchdetails-04-buchlaenge.png (≈ 2,26 px je dp):
// Ecken oben ≈ 28 dp, Seitenrand ≈ 26 dp, X ≈ 34 dp. Orientierungswerte, kein Akzeptanzkriterium.
export const BLATT_RAND = bildschirmrandPx;

const hintergrundStil: CSSProperties = {
  position: 'fixed',
  inset: 0,
  zIndex: 30,
  backgroundColor: abdunklung,
  animation: 'bz-abdunklung-ein 200ms ease-out',
};

const blattStil: CSSProperties = {
  position: 'fixed',
  left: 0,
  right: 0,
  bottom: 0,
  zIndex: 31,
  boxSizing: 'border-box',
  maxHeight: '90vh',
  overflowY: 'auto',
  paddingTop: 0,
  paddingLeft: `${BLATT_RAND}px`,
  paddingRight: `${BLATT_RAND}px`,
  // paddingBottom inkl. Gestenleiste: index.css ([data-blatt-unten]).
  borderTopLeftRadius: '28px',
  borderTopRightRadius: '28px',
  backgroundColor: fortschrittFarbe('blattFlaeche'),
  animation: 'bz-blatt-ein 220ms ease-out',
};

const griffBereichStil: CSSProperties = {
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  height: '28px',
};

const griffStil: CSSProperties = {
  width: '34px',
  height: '5px',
  borderRadius: '3px',
  backgroundColor: fortschrittFarbe('ziehgriff'),
};

const kopfStil: CSSProperties = {
  position: 'relative',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  height: '44px',
};

const ueberschriftStil: CSSProperties = {
  margin: 0,
  ...textstufe('abschnitt'),
  fontWeight: 700,
  lineHeight: 1.2,
  color: fortschrittFarbe('blattUeberschrift'),
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
  border: `1.5px solid ${fortschrittFarbe('schliessenRahmen')}`,
  backgroundColor: fortschrittFarbe('schliessenFlaeche'),
  cursor: 'pointer',
  WebkitTapHighlightColor: 'transparent',
};

/** Eingabefeld in den Blättern: Ghost, Rahmen GhostFrame, Schrift Dunkelbraun, zentriert (REQ-024, REQ-025). */
export const blattEingabeStil: CSSProperties = {
  display: 'block',
  boxSizing: 'border-box',
  width: '100%',
  height: '56px',
  margin: 0,
  padding: `0 ${abstand('l')}`,
  borderRadius: '20px',
  border: `1.5px solid ${fortschrittFarbe('eingabeRahmen')}`,
  backgroundColor: fortschrittFarbe('eingabeFlaeche'),
  color: fortschrittFarbe('eingabeSchrift'),
  fontFamily: 'inherit',
  ...textstufe('text'),
  fontWeight: 500,
  textAlign: 'center',
  outline: 'none',
};

/** Kurzer Hinweis unter dem Eingabefeld (leeres oder ungültiges Feld). */
export const blattHinweisStil: CSSProperties = {
  margin: `${abstand('s')} ${abstand('xs')} 0`,
  ...textstufe('meta'),
  lineHeight: 1.3,
  color: fortschrittFarbe('hinweis'),
};

/** Pille „Sichern“: Primär, Schrift Hintergrund (REQ-024, AK-14; REQ-025, AK-2). */
export const sichernStil: CSSProperties = {
  display: 'block',
  boxSizing: 'border-box',
  width: '100%',
  height: pillenhoehe,
  margin: `${bildschirmrand} 0 ${abstand('xs')}`,
  padding: 0,
  border: 'none',
  borderRadius: '999px',
  backgroundColor: fortschrittFarbe('sichernFlaeche'),
  color: fortschrittFarbe('sichernSchrift'),
  boxShadow: sichernKante,
  fontFamily: 'inherit',
  ...textstufe('text'),
  fontWeight: 600,
  cursor: 'pointer',
  WebkitTapHighlightColor: 'transparent',
};

/** Blatt von unten mit Abdunklung der Buchdetails, Ziehgriff (nur optisch), Überschrift und X (REQ-024, REQ-025). */
export default function BlattUnten({ titel, onSchliessen, children, ziehbar = false }: Props) {
  const [versatz, setVersatz] = useState(0);
  const zug = useRef<{ start: number; strecke: number } | null>(null);
  // Android-Zurück-Taste schließt das Blatt ohne Speichern (REQ-059 AK-4, REQ-063 AK-6).
  const verlassen = useZurueckTaste(() => {
    onSchliessen();
    return false;
  });
  // Schließt das Blatt auf anderem Weg (z. B. „Sichern“ im Inhalt), wird der eigene Verlaufseintrag entfernt.
  const verlassenRef = useRef(verlassen);
  verlassenRef.current = verlassen;
  useEffect(() => () => verlassenRef.current(), []);
  const schliessen = () => {
    verlassen();
    onSchliessen();
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
    setVersatz(0);
    if (Number.isFinite(strecke) && strecke >= BLATT_ZUG_SCHWELLE) schliessen();
  };
  const zugAbbrechen = () => {
    zug.current = null;
    setVersatz(0);
  };
  const ziehen = ziehbar
    ? { onPointerDown: zugStart, onPointerMove: zugBewegen, onPointerUp: zugEnde, onPointerCancel: zugAbbrechen }
    : {};
  return (
    <>
      <div data-blatt-hintergrund="" onClick={schliessen} style={hintergrundStil} />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={titel}
        data-blatt-unten=""
        {...stilRolle('blatt')}
        style={{ ...blattStil, ...(versatz > 0 ? { transform: `translateY(${versatz}px)` } : {}) }}
      >
        <div {...ziehen} style={{ ...griffBereichStil, ...(ziehbar ? { touchAction: 'none', cursor: 'grab' } : {}) }}>
          <div data-ziehgriff="" style={griffStil} />
        </div>
        <div style={kopfStil}>
          <h2 style={ueberschriftStil}>{titel}</h2>
          <button type="button" aria-label="Schließen" onClick={schliessen} style={schliessenStil}>
            <Icon datei="icon-x.png" url={iconX} farbe={fortschrittFarbe('schliessenIcon')} groesse={16} />
          </button>
        </div>
        {children}
      </div>
    </>
  );
}
