import { useState, type CSSProperties } from 'react';
import Hauptnavigation from '@/navigation/Hauptnavigation';
import { startMenuePunkt, type MenuePunktId } from '@/navigation/menu';
import { farbVariablen, rubrikFarbe, schrift, schriftVariablen } from '@/theme';
import { ansichten } from '@/views';

// Die App füllt den Bildschirm: oben der scrollbare Inhaltsbereich,
// unten die Hauptnavigation, die beim Scrollen an ihrer Position bleibt.
const appStil: CSSProperties = {
  ...(farbVariablen() as CSSProperties),
  ...(schriftVariablen() as CSSProperties),
  // Alle Texte der App erben die zentral festgelegte App-Schrift (REQ-003).
  fontFamily: schrift,
  // Die App-Wurzel deckt den ganzen Bildschirm in der Farbrubrik „Hintergrund“ ab (REQ-002/AK-13).
  backgroundColor: rubrikFarbe('hintergrund'),
  position: 'fixed',
  inset: 0,
  display: 'flex',
  flexDirection: 'column',
};

const inhaltStil: CSSProperties = {
  flex: '1 1 auto',
  minHeight: 0,
  overflowY: 'auto',
  // Inhaltsbereich aller Ansichten in derselben Rubrik wie die Hauptnavigation (REQ-002/AK-13).
  backgroundColor: rubrikFarbe('hintergrund'),
  // Oberer sicherer Bereich (Statusleiste), da die App randlos läuft (viewport-fit=cover).
  paddingTop: 'var(--safe-area-inset-top, env(safe-area-inset-top, 0px))',
};

export default function App() {
  const [aktiv, setAktiv] = useState<MenuePunktId>(startMenuePunkt);
  const Ansicht = ansichten[aktiv];

  return (
    <div style={appStil}>
      <main style={inhaltStil}>
        <Ansicht />
      </main>
      <Hauptnavigation aktiv={aktiv} onAuswahl={setAktiv} />
    </div>
  );
}
