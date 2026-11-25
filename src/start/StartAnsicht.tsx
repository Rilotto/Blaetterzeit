import { useCallback, useEffect, useMemo, useState, type CSSProperties } from 'react';
import type { Bildquelle } from '@/bild/bildquelle';
import BlattAktuelleSeite from '@/buchdetails/BlattAktuelleSeite';
import BlattBuchlaenge from '@/buchdetails/BlattBuchlaenge';
import BlattFeld from '@/buchdetails/BlattFeld';
import Flamme from '@/buchdetails/Flamme';
import Fortschritt from '@/buchdetails/Fortschritt';
import { ZitatQuelle } from '@/buchdetails/reiter/Notizbuch';
import type { ReiterId } from '@/buchdetails/reiter/rezension';
import { geradeAmLesenTitel } from '@/buecher/filterKonfiguration';
import { standardBildspeicher, standardProfilRepository, standardRepository, standardZitatRepository } from '@/buecher/buchQuelle';
import CoverPlatzhalter from '@/components/CoverPlatzhalter';
import { coverFlaecheStil } from '@/components/coverFlaeche';
import { useDesign } from '@/design/designwahl';
import type { Buch, Fortschrittsmodus } from '@/domain/buch';
import { fortschrittEntfernen, fortschrittSichern, gespeicherteEingabe, hatSeitenanzahl, modusVon } from '@/domain/fortschritt';
import {
  beendeteImJahr,
  datumKopfText,
  geradeAmLesen,
  grussText,
  jahreszielPruefen,
  jahreszielText,
  tageszeit,
  uhrzeitText,
} from '@/domain/startseite';
import { kalender, serie, serieZustand, zeitraumartSpeichern, zeitraumFuer } from '@/domain/statistik';
import { tagesnummer, wahlAlsText, wahlAusText, zitatAnzeige, zitatDesTagesWaehlen, type Zitat } from '@/domain/zitat';
import type { MenuePunktId } from '@/navigation/menu';
import { useMinutentakt, useUhr } from '@/plattform/uhr';
import { KalenderKarte } from '@/statistik/Kalender';
import type { BookRepository, EinstellungRepository, ImageStore, ListenRepository, ProfilRepository, ZitatRepository } from '@/storage';
import { abstand, bildschirmrand, kartenSchatten, startFarbe, stilRolle, textstufe } from '@/theme';
import BuchDetails from '@/views/BuchDetails';
import TageszeitIcon from './TageszeitIcon';

export interface StartAnsichtProps {
  /** Wechsel des Menüpunkts (z. B. „Diese Woche“ → „Statistik“, REQ-103 AK-2); kommt von der App. */
  navigieren?: (id: MenuePunktId) => void;
  /** Buchspeicher; ohne Angabe der der App. In Tests ersetzbar. */
  repository?: BookRepository;
  /** Bildspeicher (Cover); ohne Angabe der der App. In Tests ersetzbar. */
  bildspeicher?: ImageStore;
  /** Bildquelle der Buchdetails; in Tests ersetzbar. */
  bildquelle?: Bildquelle;
  /** Listenspeicher der Buchdetails; in Tests ersetzbar. */
  listenRepository?: ListenRepository;
  /** Zitatspeicher (REQ-105, REQ-106); in Tests ersetzbar. */
  zitatRepository?: ZitatRepository;
  /** Name und Jahresziel (REQ-107, REQ-104); in Tests ersetzbar. */
  profilRepository?: ProfilRepository;
  /** Gemerkte Zeitraum-Pille der Statistik (REQ-103 AK-2); ohne Angabe die der App (DesignAnbieter). */
  einstellungRepository?: EinstellungRepository;
  /** Uhr; ohne Angabe die des UhrAnbieters bzw. die Systemzeit. In Tests ersetzbar. */
  jetzt?: () => Date;
}

type Blatt = null | { art: 'aktuelleSeite' | 'buchlaenge'; buchId: string } | { art: 'jahresziel' };
type Ansicht = { art: 'start' } | { art: 'details'; buch: Buch; reiter?: ReiterId };

const seiteStil: CSSProperties = { padding: `${abstand('xl')} ${bildschirmrand} ${abstand('xl')}` };

const kopfStil: CSSProperties = { display: 'flex', flexDirection: 'column', gap: abstand('xs') };
const datumStil: CSSProperties = { margin: 0, ...textstufe('meta'), color: startFarbe('datum') };
const grussZeileStil: CSSProperties = { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: abstand('m') };
const grussStil: CSSProperties = {
  margin: 0,
  minWidth: 0,
  ...textstufe('seite'),
  fontWeight: 700,
  lineHeight: 1.2,
  overflowWrap: 'break-word',
  color: startFarbe('gruss'),
};

const abschnittStil: CSSProperties = { marginTop: abstand('xl') };
const ueberschriftStil: CSSProperties = {
  margin: `0 0 ${abstand('s')}`,
  ...textstufe('label'),
  fontWeight: 700,
  color: startFarbe('abschnittsueberschrift'),
};

const karteStil: CSSProperties = {
  boxSizing: 'border-box',
  padding: abstand('m'),
  borderRadius: '18px',
  border: 'none',
  boxShadow: kartenSchatten,
  backgroundColor: startFarbe('karteFlaeche'),
};

// REQ-102 (Mini-Änderung 2026-11-25): Cover 1,5-fach in Breite und Höhe (vorher 68 × 102), Seitenverhältnis gleich.
const COVER_BREITE = 102;
const COVER_HOEHE = 153;
const lesekartenStil: CSSProperties = { display: 'flex', flexDirection: 'column', gap: abstand('m'), margin: 0, padding: 0, listStyle: 'none' };
// Raster: Cover links über alle Zeilen, rechts Titel, Autor, Fortschritt (alle direkt in der Karte).
const lesekarteStil: CSSProperties = {
  ...karteStil,
  display: 'grid',
  gridTemplateColumns: `${COVER_BREITE}px minmax(0, 1fr)`,
  gridTemplateRows: 'auto auto 1fr',
  columnGap: abstand('m'),
  alignItems: 'start',
  cursor: 'pointer',
  WebkitTapHighlightColor: 'transparent',
};
const rechts: CSSProperties = { gridColumn: 2, minWidth: 0 };

const coverStil: CSSProperties = { ...coverFlaecheStil, width: `${COVER_BREITE}px`, height: `${COVER_HOEHE}px`, display: 'block', objectFit: 'cover' };

const buchtitelStil: CSSProperties = {
  margin: 0,
  ...textstufe('titel'),
  fontWeight: 600,
  lineHeight: 1.3,
  overflowWrap: 'break-word',
  color: startFarbe('buchtitel'),
};
const autorStil: CSSProperties = {
  margin: `${abstand('xs')} 0 0`,
  ...textstufe('meta'),
  fontStyle: 'italic',
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  color: startFarbe('autor'),
};
const leerStil: CSSProperties = { margin: 0, ...textstufe('text'), color: startFarbe('leerText') };

const wocheStil: CSSProperties = { ...karteStil, cursor: 'pointer', WebkitTapHighlightColor: 'transparent' };
const wocheKopfStil: CSSProperties = { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: abstand('s') };
const straehneStil: CSSProperties = { display: 'flex', alignItems: 'center', gap: abstand('s'), ...textstufe('meta'), color: startFarbe('autor') };

const kachelStil: CSSProperties = {
  ...karteStil,
  display: 'block',
  width: '100%',
  margin: 0,
  fontFamily: 'inherit',
  textAlign: 'left',
  cursor: 'pointer',
  WebkitTapHighlightColor: 'transparent',
};
const jahreszielStil = (mitZiel: boolean): CSSProperties => ({
  ...textstufe('titel'),
  fontWeight: 600,
  color: mitZiel ? startFarbe('jahreszielText') : startFarbe('jahreszielFestlegen'),
});
const zitatTextStil: CSSProperties = {
  display: 'block',
  ...textstufe('titel'),
  fontStyle: 'italic',
  lineHeight: 1.4,
  whiteSpace: 'pre-wrap',
  overflowWrap: 'break-word',
  color: startFarbe('zitatText'),
};

/** Fallback ohne DesignAnbieter: Wahl nur für die Sitzung. */
const fluechtig = (): EinstellungRepository => {
  const m = new Map<string, string>();
  return { lesen: (s) => Promise.resolve(m.get(s)), speichern: (s, w) => Promise.resolve(void m.set(s, w)) };
};

/**
 * Startseite (REQ-101 bis REQ-104, REQ-106) im Menüpunkt „Start“: Kopf mit Datum, Uhrzeit, Gruß und Tageszeit-Icon,
 * „Gerade am Lesen“ mit Fortschritt zum direkten Eintragen, „Diese Woche“ mit Lesesträhne, Jahresziel und
 * „Zitat des Tages“. Fachlogik in src/domain/startseite.ts und src/domain/zitat.ts; Speicher nur über Repositories.
 */
export default function StartAnsicht({
  navigieren,
  repository,
  bildspeicher,
  bildquelle,
  listenRepository,
  zitatRepository,
  profilRepository,
  einstellungRepository,
  jetzt,
}: StartAnsichtProps) {
  const kontextUhr = useUhr();
  const uhr = jetzt ?? kontextUhr;
  const heute = useMinutentakt(uhr);
  const jahr = heute.getFullYear();
  const design = useDesign();
  const [ersatz] = useState(fluechtig);
  const einstellungen = einstellungRepository ?? design.einstellungRepository ?? ersatz;
  const speicher = useMemo(() => bildspeicher ?? standardBildspeicher(), [bildspeicher]);
  const zitatRepo = useMemo(() => zitatRepository ?? standardZitatRepository(), [zitatRepository]);
  const profil = useMemo(() => profilRepository ?? standardProfilRepository(), [profilRepository]);
  const buchRepo = useCallback(async () => repository ?? (await standardRepository()), [repository]);

  const [ansicht, setAnsicht] = useState<Ansicht>({ art: 'start' });
  const [blatt, setBlatt] = useState<Blatt>(null);
  const [buecher, setBuecher] = useState<Buch[] | undefined>(undefined);
  const [frontcover, setFrontcover] = useState<Record<string, string>>({});
  const [zitate, setZitate] = useState<Zitat[] | undefined>(undefined);
  const [zitatHeute, setZitatHeute] = useState<Zitat | undefined>(undefined);
  // Name aus dem Profil; `null` = keiner hinterlegt, `undefined` = noch nicht gelesen (kein kurzes „Hallo“ ohne Namen).
  const [name, setName] = useState<string | null | undefined>(undefined);
  const [ziel, setZiel] = useState<number | undefined>(undefined);
  const [stand, setStand] = useState(0);
  const neuLaden = () => setStand((n) => n + 1);

  // Bücher, Cover, Zitate und Name über die Repository-Schnittstellen (ADR-0002); nach jeder Rückkehr neu.
  useEffect(() => {
    if (ansicht.art !== 'start') return;
    let aktiv = true;
    void (async () => {
      try {
        const liste = await (await buchRepo()).list();
        if (!aktiv) return;
        setBuecher(liste);
        const paare = await Promise.all(liste.map(async (b) => [b.id, await speicher.get(b.id, 'cover').catch(() => undefined)] as const));
        if (!aktiv) return;
        const neu: Record<string, string> = {};
        for (const [id, bild] of paare) if (bild) neu[id] = bild;
        setFrontcover(neu);
      } catch (f) {
        console.warn('Bücher konnten nicht geladen werden:', f);
        if (aktiv) setBuecher([]);
      }
    })();
    zitatRepo.alle().then(
      (z) => aktiv && setZitate(z),
      (f: unknown) => console.warn('Zitate konnten nicht geladen werden:', f),
    );
    profil.nameLesen().then(
      (n) => aktiv && setName(n ?? null),
      (f: unknown) => {
        console.warn('Name nicht lesbar:', f);
        if (aktiv) setName(null);
      },
    );
    return () => {
      aktiv = false;
    };
  }, [ansicht.art, buchRepo, speicher, zitatRepo, profil, stand]);

  // Jahresziel des laufenden Jahres (REQ-104, AK-5: im neuen Jahr zunächst keines).
  useEffect(() => {
    let aktiv = true;
    profil.jahreszielLesen(jahr).then(
      (z) => aktiv && setZiel(z),
      (f: unknown) => console.warn('Jahresziel nicht lesbar:', f),
    );
    return () => {
      aktiv = false;
    };
  }, [profil, jahr, stand]);

  // Zitat des Tages (REQ-106): gemerkte Wahl lesen, ggf. neu wählen und merken; bei Tageswechsel neu.
  const tag = tagesnummer(heute);
  useEffect(() => {
    if (!buecher || !zitate) return;
    let aktiv = true;
    const ids = new Set(buecher.map((b) => b.id));
    const vorhanden = zitate.filter((z) => ids.has(z.buchId));
    void (async () => {
      const gemerkt = wahlAusText(await einstellungen.lesen('zitatDesTages').catch(() => undefined));
      const { zitat, merken } = zitatDesTagesWaehlen(vorhanden, uhr(), gemerkt);
      if (!aktiv) return;
      setZitatHeute(zitat);
      if (merken) await einstellungen.speichern('zitatDesTages', wahlAlsText(merken)).catch((f: unknown) => console.warn('Zitat des Tages nicht gemerkt:', f));
    })();
    return () => {
      aktiv = false;
    };
  }, [buecher, zitate, einstellungen, uhr, tag]);

  const alle = buecher ?? [];
  const lesend = geradeAmLesen(alle);

  /** Buch speichern und sofort anzeigen (REQ-102 AK-4). */
  const buchSpeichern = (neu: Buch) => {
    setBuecher((alt) => alt?.map((b) => (b.id === neu.id ? neu : b)));
    void buchRepo()
      .then((r) => r.save(neu))
      .catch((f: unknown) => console.warn('Buch konnte nicht gespeichert werden:', f));
  };
  const blattBuch = blatt && blatt.art !== 'jahresziel' ? alle.find((b) => b.id === blatt.buchId) : undefined;

  const fortschrittOeffnen = (buch: Buch) => setBlatt({ art: hatSeitenanzahl(buch) ? 'aktuelleSeite' : 'buchlaenge', buchId: buch.id });

  const statistikOeffnen = async () => {
    // „Wöchentlich“ mit der laufenden Woche (REQ-103 AK-2): gemerkte Pille vorher auf „Wöchentlich“ setzen.
    await zeitraumartSpeichern(einstellungen, 'woche').catch((f: unknown) => console.warn('Zeitraum nicht gespeichert:', f));
    navigieren?.('statistik');
  };

  const jahreszielSichern = (wert: string) => {
    const neu = wert === '' ? undefined : Number(wert);
    setZiel(neu);
    setBlatt(null);
    void profil.jahreszielSpeichern(jahr, neu).catch((f: unknown) => console.warn('Jahresziel nicht gespeichert:', f));
  };

  if (ansicht.art === 'details') {
    return (
      <BuchDetails
        buchId={ansicht.buch.id}
        buch={ansicht.buch}
        startReiter={ansicht.reiter}
        zitateVorab={zitate?.filter((z) => z.buchId === ansicht.buch.id)}
        repository={repository}
        bildspeicher={speicher}
        bildquelle={bildquelle}
        listenRepository={listenRepository}
        zitatRepository={zitatRepo}
        jetzt={uhr}
        onZurueck={() => {
          setAnsicht({ art: 'start' });
          neuLaden();
        }}
      />
    );
  }

  const zeit = tageszeit(heute);
  return (
    <div data-startseite="" style={seiteStil}>
      <header data-start-kopf="" style={kopfStil}>
        <p data-start-datum="" style={datumStil}>
          <span data-start-tag="">{datumKopfText(heute)}</span>
          {' · '}
          <span data-start-uhrzeit="">{uhrzeitText(heute)}</span>
        </p>
        <div style={grussZeileStil}>
          <h1 data-start-gruss="" data-tageszeit={zeit} {...stilRolle('seitentitel')} style={grussStil}>
            {name === undefined ? '' : grussText(heute, name ?? undefined)}
          </h1>
          <TageszeitIcon tageszeit={zeit} />
        </div>
      </header>

      <section aria-label={geradeAmLesenTitel} data-start-abschnitt="lesen" style={abschnittStil}>
        <h2 style={ueberschriftStil}>{geradeAmLesenTitel}</h2>
        {buecher === undefined ? null : lesend.length === 0 ? (
          <p data-start-leer="" style={leerStil}>
            Gerade kein Buch offen
          </p>
        ) : (
          <ul style={lesekartenStil}>
            {lesend.map((b) => (
              <li key={b.id} data-start-lesekarte={b.id} {...stilRolle('karte')} style={lesekarteStil} onClick={() => setAnsicht({ art: 'details', buch: b })}>
                <div style={{ gridColumn: 1, gridRow: '1 / span 3' }}>
                  {frontcover[b.id] ? (
                    <img src={frontcover[b.id]} alt={b.titel} data-start-cover="" style={coverStil} />
                  ) : (
                    <CoverPlatzhalter breite={COVER_BREITE} hoehe={COVER_HOEHE} />
                  )}
                </div>
                <p data-buchtitel="" {...stilRolle('buchtitel')} style={{ ...buchtitelStil, ...rechts }}>
                  {b.titel}
                </p>
                {b.autor ? (
                  <p data-autor="" style={{ ...autorStil, ...rechts }}>
                    {b.autor}
                  </p>
                ) : null}
                {/* Fortschritt antippen öffnet das Menü hier auf der Startseite, nicht die Buchdetails (REQ-102). */}
                <div onClick={(e) => e.stopPropagation()} style={{ ...rechts, gridRow: 3 }}>
                  <Fortschritt buch={b} anordnung="zeile" onAktuelleSeite={() => fortschrittOeffnen(b)} onBuchlaenge={() => fortschrittOeffnen(b)} />
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section aria-label="Diese Woche" data-start-abschnitt="woche" style={abschnittStil}>
        <div
          role="button"
          tabIndex={0}
          aria-label="Diese Woche"
          data-start-woche=""
          onClick={() => void statistikOeffnen()}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') void statistikOeffnen();
          }}
          {...stilRolle('karte')}
          style={wocheStil}
        >
          <div style={wocheKopfStil}>
            <h2 style={{ ...ueberschriftStil, margin: 0 }}>Diese Woche</h2>
            <span data-start-straehne={serie(alle, heute)} style={straehneStil}>
              <span style={{ display: 'block', width: '20px', height: '27px' }}>
                <span style={{ display: 'block', transform: 'scale(0.7)', transformOrigin: 'top left' }}>
                  <Flamme zahl={serie(alle, heute)} zustand={serieZustand(alle, heute)} />
                </span>
              </span>
            </span>
          </div>
          <KalenderKarte kalender={kalender(alle, zeitraumFuer('woche', heute), heute)} art="woche" frontcover={frontcover} />
        </div>
      </section>

      <section aria-label="Jahresziel" data-start-abschnitt="jahresziel" style={abschnittStil}>
        <button type="button" data-start-jahresziel="" data-ziel={ziel ?? ''} onClick={() => setBlatt({ art: 'jahresziel' })} {...stilRolle('karte')} style={kachelStil}>
          <span data-jahresziel-text="" style={jahreszielStil(ziel !== undefined)}>
            {jahreszielText(beendeteImJahr(alle, jahr), ziel, jahr)}
          </span>
        </button>
      </section>

      {zitatHeute ? (
        <section aria-label="Zitat des Tages" data-start-abschnitt="zitat" style={abschnittStil}>
          <button
            type="button"
            data-start-zitat={zitatHeute.id}
            onClick={() => {
              const b = alle.find((x) => x.id === zitatHeute.buchId);
              if (b) setAnsicht({ art: 'details', buch: b, reiter: 'notizbuch' });
            }}
            {...stilRolle('karte')}
            style={kachelStil}
          >
            <span style={{ ...ueberschriftStil, display: 'block' }}>Zitat des Tages</span>
            <span data-zitat-text="" style={zitatTextStil}>
              {zitatAnzeige(zitatHeute.text)}
            </span>
            <ZitatQuelle zitat={zitatHeute} buchtitel={alle.find((b) => b.id === zitatHeute.buchId)?.titel} />
          </button>
        </section>
      ) : null}

      {blattBuch && blatt?.art === 'buchlaenge' ? (
        <BlattBuchlaenge
          onSichern={(seitenanzahl) => {
            buchSpeichern({ ...blattBuch, seitenanzahl });
            setBlatt({ art: 'aktuelleSeite', buchId: blattBuch.id });
          }}
          onSchliessen={() => setBlatt(null)}
        />
      ) : null}
      {blattBuch && blatt?.art === 'aktuelleSeite' && hatSeitenanzahl(blattBuch) ? (
        <BlattAktuelleSeite
          seitenanzahl={blattBuch.seitenanzahl!}
          startModus={modusVon(blattBuch)}
          startWert={gespeicherteEingabe(blattBuch)}
          onSichern={(modus: Fortschrittsmodus, wert: number) => {
            buchSpeichern(fortschrittSichern(blattBuch, modus, wert, uhr()));
            setBlatt(null);
          }}
          onLeeren={() => {
            buchSpeichern(fortschrittEntfernen(blattBuch));
            setBlatt(null);
          }}
          onSchliessen={() => setBlatt(null)}
        />
      ) : null}
      {blatt?.art === 'jahresziel' ? (
        <BlattFeld
          titel="Jahresziel"
          kennung="jahresziel"
          startWert={ziel !== undefined ? String(ziel) : ''}
          platzhalter="20"
          inputMode="numeric"
          maxLength={5}
          pruefen={jahreszielPruefen}
          onSichern={jahreszielSichern}
          onSchliessen={() => setBlatt(null)}
        />
      ) : null}
    </div>
  );
}
