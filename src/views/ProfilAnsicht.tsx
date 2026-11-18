import { useState, type CSSProperties } from 'react';
import { KartenZeile, karteDetails } from '@/buchdetails/reiter/DetailsBereich';
import { useDesign } from '@/design/designwahl';
import FensterDesign from '@/profil/FensterDesign';
import { abstand, bildschirmrand, farbdesigns, rezensionFarbe, schriften, textstufe } from '@/theme';

const seiteStil: CSSProperties = { padding: `${abstand('xl')} ${bildschirmrand}` };

/** Abschnittsüberschrift „App“ in der Stufe „Label“ (REQ-066 AK-1). */
const ueberschriftStil: CSSProperties = {
  margin: `0 0 ${abstand('s')}`,
  ...textstufe('label'),
  fontWeight: 700,
  color: rezensionFarbe('abschnittsueberschrift'),
};

/** Zielansicht des Menüpunkts „Profil“ mit Abschnitt „App“ und Zeile „Design“ (REQ-066). */
export default function ProfilAnsicht() {
  const { farbdesign, schrift } = useDesign();
  const [offen, setOffen] = useState(false);
  return (
    <div data-profil-seite="" style={seiteStil}>
      <section aria-label="App" data-profil-abschnitt="app">
        <h2 data-profil-ueberschrift="" style={ueberschriftStil}>
          App
        </h2>
        {/* Karte und Zeile exakt wie die Karte „Ausgabe“ der Buchdetails (gleiche Komponente und Stile). */}
        <div data-profil-karte="" style={karteDetails}>
          <KartenZeile
            zeilenAttribute={{ 'data-profil-zeile': 'design' }}
            anzeigeAttribute={{ 'data-design-anzeige': '' }}
            beschriftung="Design"
            wert={`${farbdesigns[farbdesign].name} · ${schriften[schrift].name} `}
            pfeil
            letzte
            onAntippen={() => setOffen(true)}
          />
        </div>
      </section>
      {offen ? <FensterDesign onSchliessen={() => setOffen(false)} /> : null}
    </div>
  );
}
