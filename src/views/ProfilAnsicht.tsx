import { useEffect, useMemo, useState, type CSSProperties } from 'react';
import BlattFeld from '@/buchdetails/BlattFeld';
import { KartenZeile, karteDetails } from '@/buchdetails/reiter/DetailsBereich';
import { useDesign } from '@/design/designwahl';
import { ladeBuecher, standardProfilRepository } from '@/buecher/buchQuelle';
import { betragText, bibliothekswertCent } from '@/domain/bibliothekswert';
import type { Buch } from '@/domain/buch';
import { nameBereinigt } from '@/domain/startseite';
import { APP_VERSION, versionAnzeige } from '@/plattform/version';
import FensterDesign from '@/profil/FensterDesign';
import type { BookRepository, ProfilRepository } from '@/storage';
import { abstand, bildschirmrand, farbdesigns, rezensionFarbe, schriften, stile, stilRolle, textstufe } from '@/theme';

/**
 * Volle Breite (REQ-066 AK-4): Die Seite selbst hat keinen seitlichen Innenabstand. Die Karten bringen wie in den
 * Buchdetails ihren Außenabstand `bildschirmrand` mit, die Überschriften denselben Wert als Innenabstand. So liegen
 * Karten und Zeilen genau einen Bildschirmrand vom Rand entfernt wie die Inhalte der Seite „Bücher“.
 */
const seiteStil: CSSProperties = { padding: `${abstand('xl')} 0` };

/** Abschnittsüberschriften „Du“, „Deine Bibliothek“, „App“ in der Stufe „Label“ (REQ-066 AK-1, REQ-121 AK-1). */
const ueberschriftStil: CSSProperties = {
  margin: `0 0 ${abstand('s')}`,
  padding: `0 ${bildschirmrand}`,
  ...textstufe('label'),
  fontWeight: 700,
  color: rezensionFarbe('abschnittsueberschrift'),
};

const abschnittAbstand: CSSProperties = { marginTop: abstand('xl') };

interface Props {
  /** Speicher des Namens (REQ-107); ohne Angabe der der App. In Tests ersetzbar. */
  profilRepository?: ProfilRepository;
  /** Version der App (REQ-113); ohne Angabe die aus package.json (Build). Nur für Tests ersetzbar. */
  appVersion?: string;
  /** Buchspeicher für „Aktueller Wert“ (REQ-121); ohne Angabe das Repository der App. In Tests ersetzbar. */
  repository?: BookRepository;
}

/**
 * Zielansicht des Menüpunkts „Profil“: Abschnitt „Du“ mit Zeile „Name“ (REQ-107), Abschnitt „Deine Bibliothek“ mit
 * Zeile „Aktueller Wert“ (REQ-121) und Abschnitt „App“ mit Zeilen „Design“ (REQ-066) und „Versionsinfo“ (REQ-113).
 */
export default function ProfilAnsicht({ profilRepository, appVersion = APP_VERSION, repository }: Props = {}) {
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
  // Bücher über die Repository-Schnittstelle (ADR-0002), bei jedem Öffnen der Seite neu gelesen (REQ-121 AK-5).
  const [buecher, setBuecher] = useState<Buch[]>([]);
  useEffect(() => {
    let aktiv = true;
    (repository ? repository.list() : ladeBuecher()).then(
      (b) => aktiv && setBuecher(b),
      (f: unknown) => console.warn('Bücher nicht lesbar:', f),
    );
    return () => {
      aktiv = false;
    };
  }, [repository]);
  const wert = betragText(bibliothekswertCent(buecher));
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
      <section aria-label="Deine Bibliothek" data-profil-abschnitt="bibliothek" style={abschnittAbstand}>
        <h2 data-profil-ueberschrift="" style={ueberschriftStil}>
          Deine Bibliothek
        </h2>
        {/* Nur Anzeige (REQ-121 AK-6), gestaltet wie „Versionsinfo“; eigene Kennung, damit [data-profil-karte] die Karte „App“ bleibt. */}
        <div data-profil-karte-bibliothek="" {...stilRolle('karte')} style={karteDetails}>
          <KartenZeile
            zeilenAttribute={{ 'data-profil-bibliothek-zeile': 'wert' }}
            anzeigeAttribute={{ 'data-bibliothekswert': '' }}
            beschriftung="Aktueller Wert"
            wert={wert}
            letzte
            nurAnzeige
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
            onAntippen={() => setOffen(true)}
          />
          {/* Versionsinfo (REQ-113): nur Anzeige, ohne Pfeil und ohne Funktion beim Antippen. */}
          <KartenZeile
            zeilenAttribute={{ 'data-profil-zeile': 'versionsinfo' }}
            anzeigeAttribute={{ 'data-versionsinfo': '' }}
            beschriftung="Versionsinfo"
            wert={versionAnzeige(appVersion)}
            letzte
            nurAnzeige
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
