import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import Flamme from '@/buchdetails/Flamme';
import { ladeBuecher, standardBildspeicher } from '@/buecher/buchQuelle';
import { useDesign } from '@/design/designwahl';
import type { Buch } from '@/domain/buch';
import {
  balken,
  jahreskalender,
  kachelWert,
  kalender,
  kennzahlen,
  lesetage,
  serie,
  serieZustand,
  vergleichText,
  ZEITRAUM_PILLEN,
  zeitraumartLesen,
  zeitraumartSpeichern,
  zeitraumFuer,
  zeitraumTitel,
  zeitraumVerschieben,
  type Kachel,
  type Zeitraumart,
} from '@/domain/statistik';
import Diagramm from '@/statistik/Diagramm';
import { Jahreskalender, KalenderKarte } from '@/statistik/Kalender';
import type { BookRepository, EinstellungRepository, ImageStore } from '@/storage';
import {
  abstand,
  bildschirmrand,
  kartenSchatten,
  pillenhoehePx,
  statistikFarbe,
  statistikKachelGewaehltFlaeche,
  stilRolle,
  textstufe,
} from '@/theme';

interface Props {
  /** Bücher; ohne Angabe werden sie über das Repository geladen. */
  buecher?: Buch[];
  /** Buchspeicher; ohne Angabe das dauerhafte Repository der App. In Tests ersetzbar. */
  repository?: BookRepository;
  /** Bildspeicher (Frontcover im Kalender); in Tests ersetzbar. */
  bildspeicher?: ImageStore;
  /** Speicher der gemerkten Zeitraum-Pille (REQ-079); ohne Angabe der der App (DesignAnbieter). */
  einstellungRepository?: EinstellungRepository;
  /** Aktuelle Zeit (heutiger Tag, Serie); in Tests ersetzbar. */
  jetzt?: () => Date;
}

const seiteStil: CSSProperties = { padding: `${abstand('xl')} ${bildschirmrand} ${abstand('xl')}` };

const titelStil: CSSProperties = {
  margin: 0,
  ...textstufe('seite'),
  fontWeight: 700,
  lineHeight: 1.2,
  color: statistikFarbe('ueberschrift'),
};

const leisteStil: CSSProperties = {
  boxSizing: 'border-box',
  display: 'flex',
  marginTop: abstand('l'),
  padding: '3px',
  borderRadius: '9999px',
  border: `1.5px solid ${statistikFarbe('pillenleisteRahmen')}`,
  backgroundColor: statistikFarbe('pillenleisteFlaeche'),
};

const pilleStil = (aktiv: boolean): CSSProperties => ({
  flex: '1 1 0',
  minWidth: 0,
  height: `${pillenhoehePx}px`,
  margin: 0,
  padding: `0 ${abstand('s')}`,
  border: 'none',
  borderRadius: '9999px',
  fontFamily: 'inherit',
  ...textstufe('text'),
  fontWeight: 600,
  lineHeight: 1,
  whiteSpace: 'nowrap',
  cursor: 'pointer',
  WebkitTapHighlightColor: 'transparent',
  backgroundColor: aktiv ? statistikFarbe('pilleAktivFlaeche') : 'transparent',
  color: aktiv ? statistikFarbe('pilleAktivSchrift') : statistikFarbe('pilleInaktivSchrift'),
});

const navStil: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: abstand('m'),
  marginTop: abstand('xl'),
};

const pfeilStil: CSSProperties = {
  boxSizing: 'border-box',
  flex: '0 0 auto',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: `${pillenhoehePx + 4}px`,
  height: `${pillenhoehePx + 4}px`,
  margin: 0,
  padding: 0,
  borderRadius: '50%',
  border: `1.5px solid ${statistikFarbe('pfeilRahmen')}`,
  backgroundColor: 'transparent',
  color: statistikFarbe('pfeilIcon'),
  cursor: 'pointer',
  WebkitTapHighlightColor: 'transparent',
};

const zeitraumTitelStil: CSSProperties = { flex: '1 1 auto', minWidth: 0, textAlign: 'center' };
const zeile1Stil: CSSProperties = {
  margin: 0,
  ...textstufe('abschnitt'),
  fontWeight: 700,
  lineHeight: 1.2,
  color: statistikFarbe('zeitraumTitel'),
};
const zeile2Stil: CSSProperties = { margin: 0, ...textstufe('meta'), color: statistikFarbe('zeitraumJahr') };

const karteStil: CSSProperties = {
  boxSizing: 'border-box',
  marginTop: abstand('xl'),
  padding: abstand('l'),
  borderRadius: '20px',
  border: `1.5px solid ${statistikFarbe('karteRahmen')}`,
  backgroundColor: statistikFarbe('karteFlaeche'),
  boxShadow: kartenSchatten,
};

const kachelnStil: CSSProperties = { display: 'flex', gap: abstand('m') };

const kachelStil = (gewaehlt: boolean): CSSProperties => ({
  boxSizing: 'border-box',
  flex: '1 1 0',
  minWidth: 0,
  margin: 0,
  padding: `${abstand('s')} ${abstand('m')}`,
  textAlign: 'left',
  fontFamily: 'inherit',
  borderRadius: '14px',
  border: `1.5px solid ${gewaehlt ? statistikFarbe('kachelGewaehltRahmen') : statistikFarbe('kachelRahmen')}`,
  backgroundColor: gewaehlt ? statistikKachelGewaehltFlaeche : statistikFarbe('kachelFlaeche'),
  cursor: 'pointer',
  WebkitTapHighlightColor: 'transparent',
});

const kachelZahlStil: CSSProperties = {
  display: 'block',
  ...textstufe('abschnitt'),
  fontWeight: 700,
  lineHeight: 1.2,
  color: statistikFarbe('kachelZahl'),
};
const kachelBezeichnungStil: CSSProperties = { display: 'block', ...textstufe('meta'), color: statistikFarbe('kachelBezeichnung') };

const kennzahlZeileStil: CSSProperties = { display: 'flex', alignItems: 'baseline', gap: abstand('s'), marginTop: abstand('l') };
// Größte zentrale Stufe „Seite“ (REQ-065 erlaubt nur sechs Stufen; REF zeigt die Zahl noch größer).
const kennzahlStil: CSSProperties = { ...textstufe('seite'), fontWeight: 700, lineHeight: 1, color: statistikFarbe('kennzahl') };
const einheitStil: CSSProperties = { ...textstufe('titel'), color: statistikFarbe('kennzahlEinheit') };
const vergleichStil: CSSProperties = { margin: `${abstand('s')} 0 0`, ...textstufe('meta'), color: statistikFarbe('vergleich') };

const zeileStil: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: abstand('m'),
  marginTop: abstand('l'),
  padding: `0 ${abstand('xs')}`,
  ...textstufe('titel'),
};
const serieStil: CSSProperties = { display: 'flex', alignItems: 'center', gap: abstand('s'), color: statistikFarbe('serieText') };
const flammeStil: CSSProperties = { width: '20px', height: '27px', overflow: 'visible' };
const flammeInnenStil: CSSProperties = { transform: 'scale(0.7)', transformOrigin: 'top left' };
const fettStil: CSSProperties = { fontWeight: 700, color: statistikFarbe('serieZahl') };

const Pfeil = ({ richtung }: { richtung: 'zurueck' | 'vor' }) => (
  <svg aria-hidden="true" viewBox="0 0 24 24" width={18} height={18} style={{ display: 'block' }}>
    <path
      d={richtung === 'zurueck' ? 'M14.5 6 L8.5 12 L14.5 18' : 'M9.5 6 L15.5 12 L9.5 18'}
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

/** Fallback ohne DesignAnbieter: Wahl nur für die Sitzung. */
const fluechtig = (): EinstellungRepository => {
  const m = new Map<string, string>();
  return { lesen: (s) => Promise.resolve(m.get(s)), speichern: (s, w) => Promise.resolve(void m.set(s, w)) };
};

/**
 * Seite „Statistik“ (REQ-079 bis REQ-090): Kopf „Dein Lesen“, Zeitraum-Pillen (gemerkt), Zeitraum blättern,
 * Karte mit Kacheln „Seiten“/„Bücher“, Kennzahl, Vergleichszeile und Diagramm, Zeile „Serie“ / „X von N Tagen
 * gelesen“, darunter Kalenderkarte (Woche/Monat) bzw. Jahreskalender. Fachlogik in src/domain/statistik.ts.
 */
export default function StatistikAnsicht({ buecher, repository, bildspeicher, einstellungRepository, jetzt }: Props) {
  const design = useDesign();
  const [ersatz] = useState(fluechtig);
  const einstellungen = einstellungRepository ?? design.einstellungRepository ?? ersatz;
  const speicher = useMemo(() => bildspeicher ?? standardBildspeicher(), [bildspeicher]);
  const heute = (jetzt ?? (() => new Date()))();

  // Bücher über die Repository-Schnittstelle (ADR-0002).
  const [geladen, setGeladen] = useState<Buch[]>([]);
  useEffect(() => {
    if (buecher) return;
    let aktiv = true;
    void (repository ? repository.list() : ladeBuecher()).then(
      (b) => aktiv && setGeladen(b),
      (f: unknown) => console.warn('Bücher konnten nicht geladen werden:', f),
    );
    return () => {
      aktiv = false;
    };
  }, [buecher, repository]);
  const alle = buecher ?? geladen;

  // Frontcover für den Kalender (REQ-088).
  const [frontcover, setFrontcover] = useState<Record<string, string>>({});
  useEffect(() => {
    let aktiv = true;
    void Promise.all(alle.map(async (b) => [b.id, await speicher.get(b.id, 'cover')] as const))
      .then((paare) => {
        if (!aktiv) return;
        const neu: Record<string, string> = {};
        for (const [id, bild] of paare) if (bild) neu[id] = bild;
        setFrontcover(neu);
      })
      .catch((f: unknown) => console.warn('Cover konnten nicht geladen werden:', f));
    return () => {
      aktiv = false;
    };
  }, [alle, speicher]);

  // Zeitraum-Pille: gemerkte Wahl laden (REQ-079, AK-3/AK-4), Nutzerwahl hat Vorrang.
  const [art, setArt] = useState<Zeitraumart>('woche');
  const [schritte, setSchritte] = useState(0);
  const gewaehlt = useRef(false);
  useEffect(() => {
    let aktiv = true;
    zeitraumartLesen(einstellungen)
      .then((a) => {
        if (aktiv && !gewaehlt.current) setArt(a);
      })
      .catch((f: unknown) => console.warn('Zeitraum nicht lesbar:', f));
    return () => {
      aktiv = false;
    };
  }, [einstellungen]);
  const pilleWaehlen = (a: Zeitraumart) => {
    gewaehlt.current = true;
    setArt(a);
    setSchritte(0);
    void zeitraumartSpeichern(einstellungen, a).catch((f: unknown) => console.warn('Zeitraum nicht gespeichert:', f));
  };

  const [kachel, setKachel] = useState<Kachel>('seiten');

  const zeitraum = zeitraumVerschieben(zeitraumFuer(art, heute), schritte);
  const titel = zeitraumTitel(zeitraum);
  const k = kennzahlen(alle, zeitraum);
  const tage = lesetage(alle, zeitraum);
  const serieTage = serie(alle, heute);

  return (
    <div data-seite="statistik" data-zeitraumart={art} style={seiteStil}>
      <header data-statistik-kopf="">
        <h1 data-statistik-titel="" {...stilRolle('seitentitel')} style={titelStil}>
          Dein Lesen
        </h1>
      </header>

      <div role="group" aria-label="Zeitraum" data-zeitraum-pillen="" {...stilRolle('leiste')} style={leisteStil}>
        {ZEITRAUM_PILLEN.map((p) => {
          const aktiv = p.art === art;
          return (
            <button
              key={p.art}
              type="button"
              data-zeitraum-pille={p.art}
              aria-pressed={aktiv}
              onClick={() => pilleWaehlen(p.art)}
              {...stilRolle('reiter')}
              style={pilleStil(aktiv)}
            >
              {p.text}
            </button>
          );
        })}
      </div>

      <div data-zeitraum-navigation="" style={navStil}>
        <button type="button" aria-label="Vorheriger Zeitraum" data-zeitraum-zurueck="" onClick={() => setSchritte((s) => s - 1)} style={pfeilStil}>
          <Pfeil richtung="zurueck" />
        </button>
        <div data-zeitraum-titel="" style={zeitraumTitelStil}>
          <p data-zeitraum-zeile1="" style={zeile1Stil}>
            {titel.zeile1}
          </p>
          {titel.zeile2 ? (
            <p data-zeitraum-zeile2="" style={zeile2Stil}>
              {titel.zeile2}
            </p>
          ) : null}
        </div>
        <button type="button" aria-label="Nächster Zeitraum" data-zeitraum-vor="" onClick={() => setSchritte((s) => s + 1)} style={pfeilStil}>
          <Pfeil richtung="vor" />
        </button>
      </div>

      <section aria-label="Kennzahlen" data-statistik-karte="" {...stilRolle('karte')} style={karteStil}>
        <div data-kacheln="" style={kachelnStil}>
          {(
            [
              ['seiten', 'Seiten'],
              ['buecher', 'Bücher'],
            ] as const
          ).map(([id, name]) => (
            <button
              key={id}
              type="button"
              data-kachel={id}
              aria-pressed={kachel === id}
              onClick={() => setKachel(id)}
              {...stilRolle('reiter')}
              style={kachelStil(kachel === id)}
            >
              <span data-kachel-wert="" style={kachelZahlStil}>
                {kachelWert(k, id)}
              </span>
              <span data-kachel-bezeichnung="" style={kachelBezeichnungStil}>
                {name}
              </span>
            </button>
          ))}
        </div>
        <div data-kennzahl={kachel} style={kennzahlZeileStil}>
          <span data-kennzahl-wert="" style={kennzahlStil}>
            {kachelWert(k, kachel)}
          </span>
          <span data-kennzahl-einheit="" style={einheitStil}>
            {kachel === 'seiten' ? 'Seiten' : 'beendet'}
          </span>
        </div>
        <p data-vergleich="" style={vergleichStil}>
          {vergleichText(alle, zeitraum, kachel)}
        </p>
        <Diagramm balken={balken(alle, zeitraum)} kachel={kachel} />
      </section>

      <div data-statistik-zeile="" style={zeileStil}>
        <span data-serie={serieTage} style={serieStil}>
          <span style={flammeStil}>
            <span style={{ display: 'block', ...flammeInnenStil }}>
              <Flamme zahl={serieTage} zustand={serieZustand(alle, heute)} />
            </span>
          </span>
          <span data-serie-text="">
            Serie <span data-serie-zahl="" style={fettStil}>{serieTage} Tage</span>
          </span>
        </span>
        <span data-lesetage={`${tage.gelesen}/${tage.tage}`} data-lesetage-text="" style={{ color: statistikFarbe('serieText') }}>
          <span style={fettStil}>{tage.gelesen}</span> von {tage.tage} Tagen gelesen
        </span>
      </div>

      <section aria-label="Kalender" data-kalender-karte={art} {...stilRolle('karte')} style={karteStil}>
        {art === 'jahr' ? (
          <Jahreskalender monate={jahreskalender(alle, zeitraum.start.getFullYear(), heute)} />
        ) : (
          <KalenderKarte kalender={kalender(alle, zeitraum, heute)} art={art} frontcover={frontcover} />
        )}
      </section>
    </div>
  );
}
