import { useState, type CSSProperties } from 'react';
import { bezeichnungStil, karteDetails, pfeilStil, wertStil, zeileStil } from '@/buchdetails/reiter/DetailsBereich';
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

const karteStil: CSSProperties = { ...karteDetails, padding: `0 ${abstand('l')}` };

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
        <div data-profil-karte="" style={karteStil}>
          <button type="button" data-profil-zeile="design" onClick={() => setOffen(true)} style={zeileStil(true, true)}>
            <span data-zeile-bezeichnung="" style={bezeichnungStil}>
              Design
            </span>
            <span data-design-anzeige="" style={wertStil(false)}>
              {`${farbdesigns[farbdesign].name} · ${schriften[schrift].name} `}
              <span data-zeile-pfeil="" aria-hidden="true" style={pfeilStil}>
                ›
              </span>
            </span>
          </button>
        </div>
      </section>
      {offen ? <FensterDesign onSchliessen={() => setOffen(false)} /> : null}
    </div>
  );
}
