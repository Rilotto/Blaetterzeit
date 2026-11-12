import type { CSSProperties, ReactNode } from 'react';
import iconX from '@/assets/icons/icon-x.png';
import Icon from '@/components/Icon';
import { abdunklung, fortschrittFarbe, sichernKante } from '@/theme';

interface Props {
  /** Überschrift und Name des Dialogs, z. B. „Aktuelle Seite“. */
  titel: string;
  /** X-Schaltfläche oder Tippen auf die Abdunklung: schließen ohne Speichern. */
  onSchliessen: () => void;
  children: ReactNode;
}

// Maße nach REF-buchdetails-03-aktuelle-seite.png und REF-buchdetails-04-buchlaenge.png (≈ 2,26 px je dp):
// Ecken oben ≈ 28 dp, Seitenrand ≈ 26 dp, X ≈ 34 dp. Orientierungswerte, kein Akzeptanzkriterium.
export const BLATT_RAND = 24;

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
  fontSize: '20px',
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
  width: '34px',
  height: '34px',
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
  padding: '0 16px',
  borderRadius: '20px',
  border: `1.5px solid ${fortschrittFarbe('eingabeRahmen')}`,
  backgroundColor: fortschrittFarbe('eingabeFlaeche'),
  color: fortschrittFarbe('eingabeSchrift'),
  fontFamily: 'inherit',
  fontSize: '22px',
  fontWeight: 500,
  textAlign: 'center',
  outline: 'none',
};

/** Kurzer Hinweis unter dem Eingabefeld (leeres oder ungültiges Feld). */
export const blattHinweisStil: CSSProperties = {
  margin: '8px 4px 0',
  fontSize: '14px',
  lineHeight: 1.3,
  color: fortschrittFarbe('hinweis'),
};

/** Pille „Sichern“: Primär, Schrift Hintergrund (REQ-024, AK-14; REQ-025, AK-2). */
export const sichernStil: CSSProperties = {
  display: 'block',
  boxSizing: 'border-box',
  width: '100%',
  height: '54px',
  margin: '20px 0 4px',
  padding: 0,
  border: 'none',
  borderRadius: '27px',
  backgroundColor: fortschrittFarbe('sichernFlaeche'),
  color: fortschrittFarbe('sichernSchrift'),
  boxShadow: sichernKante,
  fontFamily: 'inherit',
  fontSize: '19px',
  fontWeight: 600,
  cursor: 'pointer',
  WebkitTapHighlightColor: 'transparent',
};

/** Blatt von unten mit Abdunklung der Buchdetails, Ziehgriff (nur optisch), Überschrift und X (REQ-024, REQ-025). */
export default function BlattUnten({ titel, onSchliessen, children }: Props) {
  return (
    <>
      <div data-blatt-hintergrund="" onClick={onSchliessen} style={hintergrundStil} />
      <div role="dialog" aria-modal="true" aria-label={titel} data-blatt-unten="" style={blattStil}>
        <div style={griffBereichStil}>
          <div data-ziehgriff="" style={griffStil} />
        </div>
        <div style={kopfStil}>
          <h2 style={ueberschriftStil}>{titel}</h2>
          <button type="button" aria-label="Schließen" onClick={onSchliessen} style={schliessenStil}>
            <Icon datei="icon-x.png" url={iconX} farbe={fortschrittFarbe('schliessenIcon')} groesse={16} />
          </button>
        </div>
        {children}
      </div>
    </>
  );
}
