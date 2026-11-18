import { useMemo, useState, type CSSProperties } from 'react';
import { DesignAnbieter, useDesign } from '@/design/designwahl';
import Hauptnavigation from '@/navigation/Hauptnavigation';
import { startMenuePunkt, type MenuePunktId } from '@/navigation/menu';
import { createEinstellungRepository, type EinstellungRepository } from '@/storage';
import {
  farbVariablen,
  papierKoernung,
  rubrikFarbe,
  schrift,
  schriftgroesse,
  schriftVariablen,
  typografieVariablen,
  zeilenabstand,
  type FarbdesignId,
  type SchriftId,
} from '@/theme';
import { ansichten } from '@/views';

// Die App füllt den Bildschirm: oben der scrollbare Inhaltsbereich,
// unten die Hauptnavigation, die beim Scrollen an ihrer Position bleibt.
const appStil = (farbdesign: FarbdesignId, schriftId: SchriftId): CSSProperties => ({
  // Farben des aktiven Designs (REQ-068), Schrift der aktuellen Wahl (REQ-069), Stufen und Maße (REQ-065).
  ...(farbVariablen(farbdesign) as CSSProperties),
  ...(schriftVariablen(schriftId) as CSSProperties),
  ...(typografieVariablen() as CSSProperties),
  // Alle Texte der App erben die zentral festgelegte App-Schrift (REQ-003),
  // ohne eigene Angabe die Stufe „Text“ und den Zeilenabstand für Fließtext (REQ-065).
  fontFamily: schrift,
  fontSize: schriftgroesse('text'),
  lineHeight: zeilenabstand,
  // Die App-Wurzel deckt den ganzen Bildschirm in der Farbrubrik „Hintergrund“ ab (REQ-002/AK-13).
  backgroundColor: rubrikFarbe('hintergrund'),
  // Leichte Papier-Körnung über dem Hintergrund (REQ-065 AK-11).
  backgroundImage: papierKoernung,
  position: 'fixed',
  inset: 0,
  display: 'flex',
  flexDirection: 'column',
});

const inhaltStil: CSSProperties = {
  flex: '1 1 auto',
  minHeight: 0,
  overflowY: 'auto',
  // Inhaltsbereich aller Ansichten in derselben Rubrik wie die Hauptnavigation (REQ-002/AK-13).
  backgroundColor: rubrikFarbe('hintergrund'),
  backgroundImage: papierKoernung,
  // Oberer sicherer Bereich (Statusleiste), da die App randlos läuft (viewport-fit=cover).
  paddingTop: 'var(--safe-area-inset-top, env(safe-area-inset-top, 0px))',
};

let einstellungSpeicher: EinstellungRepository | undefined;
const standardEinstellungRepository = () => (einstellungSpeicher ??= createEinstellungRepository());

interface Props {
  /** Speicher der App-Einstellungen (Designwahl); in Tests ersetzbar. */
  einstellungRepository?: EinstellungRepository;
}

export default function App({ einstellungRepository }: Props) {
  const repo = useMemo(() => einstellungRepository ?? standardEinstellungRepository(), [einstellungRepository]);
  return (
    <DesignAnbieter repository={repo}>
      <AppInhalt />
    </DesignAnbieter>
  );
}

function AppInhalt() {
  const { farbdesign, schrift: schriftId } = useDesign();
  const [aktiv, setAktiv] = useState<MenuePunktId>(startMenuePunkt);
  // Jedes Antippen eines Menüpunkts ruft dessen Seite neu auf – auch den bereits aktiven
  // (z. B. „Bücher“ aus den Buchdetails zurück zu „Deine Bücher“, REQ-013 AK-7).
  const [aufruf, setAufruf] = useState(0);
  const Ansicht = ansichten[aktiv];
  const auswaehlen = (id: MenuePunktId) => {
    setAktiv(id);
    setAufruf((n) => n + 1);
  };

  return (
    <div data-app-wurzel="" data-farbdesign={farbdesign} data-schrift={schriftId} style={appStil(farbdesign, schriftId)}>
      <main style={inhaltStil}>
        <Ansicht key={aufruf} />
      </main>
      <Hauptnavigation aktiv={aktiv} onAuswahl={auswaehlen} />
    </div>
  );
}
