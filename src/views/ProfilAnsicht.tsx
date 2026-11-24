import { useEffect, useMemo, useState, type CSSProperties } from 'react';
import BlattFeld from '@/buchdetails/BlattFeld';
import { KartenZeile, karteDetails } from '@/buchdetails/reiter/DetailsBereich';
import { useDesign } from '@/design/designwahl';
import { standardProfilRepository } from '@/buecher/buchQuelle';
import { nameBereinigt } from '@/domain/startseite';
import FensterDesign from '@/profil/FensterDesign';
import type { ProfilRepository } from '@/storage';
import { abstand, bildschirmrand, farbdesigns, rezensionFarbe, schriften, stile, stilRolle, textstufe } from '@/theme';

const seiteStil: CSSProperties = { padding: `${abstand('xl')} ${bildschirmrand}` };

/** Abschnittsüberschrift „App“ in der Stufe „Label“ (REQ-066 AK-1). */
const ueberschriftStil: CSSProperties = {
  margin: `0 0 ${abstand('s')}`,
  ...textstufe('label'),
  fontWeight: 700,
  color: rezensionFarbe('abschnittsueberschrift'),
};

const abschnittAbstand: CSSProperties = { marginTop: abstand('xl') };

interface Props {
  /** Speicher des Namens (REQ-107); ohne Angabe der der App. In Tests ersetzbar. */
  profilRepository?: ProfilRepository;
}

/**
 * Zielansicht des Menüpunkts „Profil“: Abschnitt „Du“ mit Zeile „Name“ (REQ-107) über dem Abschnitt „App“ mit
 * Zeile „Design“ (REQ-066).
 */
export default function ProfilAnsicht({ profilRepository }: Props = {}) {
  const { farbdesign, schrift, stil } = useDesign();
  const profil = useMemo(() => profilRepository ?? standardProfilRepository(), [profilRepository]);
  const [offen, setOffen] = useState(false);
  const [name, setName] = useState<string | undefined>(undefined);
  const [nameOffen, setNameOffen] = useState(false);
  useEffect(() => {
    let aktiv = true;
    profil.nameLesen().then(
      (n) => aktiv && setName(n),
      (f: unknown) => console.warn('Name nicht lesbar:', f),
    );
    return () => {
      aktiv = false;
    };
  }, [profil]);
  const nameSichern = (eingabe: string) => {
    const neu = nameBereinigt(eingabe);
    setName(neu);
    setNameOffen(false);
    void profil.nameSpeichern(neu).catch((f: unknown) => console.warn('Name nicht gespeichert:', f));
  };
  return (
    <div data-profil-seite="" style={seiteStil}>
      <section aria-label="Du" data-profil-abschnitt="du">
        <h2 data-profil-ueberschrift="" style={ueberschriftStil}>
          Du
        </h2>
        {/* Eigene Kennung der Zeile: Karte „App“ bleibt die einzige [data-profil-karte] mit genau einer [data-profil-zeile] (REQ-066, AK-1). */}
        <div data-profil-karte-du="" {...stilRolle('karte')} style={karteDetails}>
          <KartenZeile
            zeilenAttribute={{ 'data-profil-name-zeile': '' }}
            anzeigeAttribute={{ 'data-name-anzeige': '' }}
            beschriftung="Name"
            wert={name ?? ''}
            pfeil
            letzte
            onAntippen={() => setNameOffen(true)}
          />
        </div>
      </section>
      <section aria-label="App" data-profil-abschnitt="app" style={abschnittAbstand}>
        <h2 data-profil-ueberschrift="" style={ueberschriftStil}>
          App
        </h2>
        {/* Karte und Zeile exakt wie die Karte „Ausgabe“ der Buchdetails (gleiche Komponente und Stile). */}
        <div data-profil-karte="" {...stilRolle('karte')} style={karteDetails}>
          <KartenZeile
            zeilenAttribute={{ 'data-profil-zeile': 'design' }}
            anzeigeAttribute={{ 'data-design-anzeige': '' }}
            beschriftung="Design"
            wert={`${farbdesigns[farbdesign].name} · ${schriften[schrift].name} · ${stile[stil].name} `}
            pfeil
            letzte
            onAntippen={() => setOffen(true)}
          />
        </div>
      </section>
      {offen ? <FensterDesign onSchliessen={() => setOffen(false)} /> : null}
      {nameOffen ? (
        <BlattFeld
          titel="Name"
          kennung="name"
          startWert={name ?? ''}
          platzhalter="Name"
          maxLength={100}
          pruefen={(w) => w.trim()}
          onSichern={nameSichern}
          onSchliessen={() => setNameOffen(false)}
        />
      ) : null}
    </div>
  );
}
