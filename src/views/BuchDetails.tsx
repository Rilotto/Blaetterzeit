import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import Ansicht3d, { UNSCHAERFE, backdropUnterstuetzt } from '@/buchdetails/ansicht3d/Ansicht3d';
import { doppeltippErkennen, type Doppeltipp } from '@/buchdetails/doppeltipp';
import iconMehr from '@/assets/icons/icon-mehr.png';
import { zuschneiden } from '@/bild/bildverarbeitung';
import { standardBildquelle, type Bildquelle } from '@/bild/bildquelle';
import type { Ecken } from '@/bild/entzerren';
import { standardBildspeicher, standardListenRepository, standardRepository } from '@/buecher/buchQuelle';
import Auswahlmenue, { type MenueAktion } from '@/buchdetails/Auswahlmenue';
import BlattAktuelleSeite from '@/buchdetails/BlattAktuelleSeite';
import BlattBuchlaenge from '@/buchdetails/BlattBuchlaenge';
import { BlattAutor, BlattBeendet, BlattErschienen, BlattHinzugefuegt, BlattIsbn, BlattTitel, BlattVerlag } from '@/buchdetails/BlattFeld';
import BlattPreis from '@/buchdetails/BlattPreis';
import Buchdarstellung, { type Bilder } from '@/buchdetails/Buchdarstellung';
import Fortschritt from '@/buchdetails/Fortschritt';
import KameraAnsicht from '@/buchdetails/KameraAnsicht';
import Kopfzeile from '@/buchdetails/Kopfzeile';
import Statistik from '@/buchdetails/Statistik';
import Statuspille from '@/buchdetails/Statuspille';
import { kopfSchaltflaecheStil } from '@/buchdetails/stile';
import { KOPF_ICON, KOPF_SCHALTFLAECHE, RAND, darstellungsMasse, seitenverhaeltnis } from '@/buchdetails/masse';
import BlattMasse from '@/buchdetails/BlattMasse';
import ReiterBereich from '@/buchdetails/reiter/ReiterBereich';
import Reiterleiste from '@/buchdetails/reiter/Reiterleiste';
import { START_REITER, type ReiterId } from '@/buchdetails/reiter/rezension';
import FensterFormat from '@/buchdetails/reiter/FensterFormat';
import Schreibfenster from '@/buchdetails/reiter/Schreibfenster';
import Zuschnitt from '@/buchdetails/Zuschnitt';
import Icon from '@/components/Icon';
import { beendetAusText, eintragungsdatumAusText, erscheinungAusText, erschienenEingabeText, type Formatangaben, type Masse } from '@/domain/ausgabe';
import { sagaZeileText, sagenDesBuches, type ListenArt } from '@/domain/listen';
import BlattZuListe from '@/listen/BlattZuListe';
import { useListen } from '@/listen/gemeinsam';
import ListenNavigation, { type ListenZiel } from '@/listen/ListenNavigation';
import { bewertungAntippen, rezensionSichern, type KriteriumId } from '@/domain/bewertung';
import { statusSetzen, type Buch, type Fortschrittsmodus, type LesestatusId } from '@/domain/buch';
import { fortschrittEntfernen, fortschrittSichern, gespeicherteEingabe, hatSeitenanzahl, modusVon } from '@/domain/fortschritt';
import { BILDBEREICHE, type BookRepository, type Bildbereich, type ImageStore, type ListenRepository } from '@/storage';
import { ansicht3dFarbe, ansicht3dSchatten, buchdetailsFarbe, fortschrittFarbe, listenFarbe, textstufe, abstand, bildschirmrand, stilRolle } from '@/theme';

export interface BuchDetailsProps {
  buchId: string;
  /** Das Buch selbst, falls bereits geladen; sonst wird es über das Repository geladen. */
  buch?: Buch;
  /** Bildquelle (Kamera/Galerie); in Tests ersetzbar. */
  bildquelle?: Bildquelle;
  /** Bildspeicher (REQ-019); in Tests ersetzbar. */
  bildspeicher?: ImageStore;
  /** Buchspeicher für Status, Seitenanzahl und Fortschritt (REQ-022, REQ-024, REQ-025); ohne Angabe das Repository der App. */
  repository?: BookRepository;
  /** Aktuelle Zeit für Sitzungen und Streak (REQ-024, REQ-027); ohne Angabe die Systemzeit. In Tests ersetzbar. */
  jetzt?: () => Date;
  /** Listenspeicher (Sagas, Sammlungen, Bibliotheken, REQ-095); ohne Angabe der der App. In Tests ersetzbar. */
  listenRepository?: ListenRepository;
  /** Zurück zur Seite „Bücher“. */
  onZurueck: () => void;
}

/** Platzhalter an der Stelle der Autorzeile, wenn kein Autor gespeichert ist (REQ-094). */
export const AUTOR_PLATZHALTER = 'unbekannter Autor';

type Blatt =
  | 'buchlaenge'
  | 'aktuelleSeite'
  | 'rezension'
  | 'seiten'
  | 'format'
  | 'preis'
  | 'masse'
  | 'verlag'
  | 'isbn'
  | 'hinzugefuegt'
  | 'beendet'
  | 'erschienen'
  | 'titel'
  | 'autor'
  | null;

const systemzeit = () => new Date();

type Schritt =
  | { art: 'details' }
  | { art: 'kamera'; bereich: Bildbereich }
  | { art: 'zuschnitt'; bild: string; bereich: Bildbereich };

const ansichtStil: CSSProperties = {
  position: 'relative',
  paddingBottom: abstand('xl'),
};

// Kopfzeile (8 + 40) + Abstand (10) + Buch + 8 px: Oberkante des Auswahlmenüs (Referenzbild: direkt unter dem Buch).
const menueOben = (buchHoehe: number) => 8 + KOPF_SCHALTFLAECHE + 10 + buchHoehe + 8;

// Buchtitel unter der Buchdarstellung (REQ-018): mittig, höchstens zwei Zeilen mit „…“.
const titelStil: CSSProperties = {
  margin: `${abstand('xl')} ${RAND}px 0`,
  ...textstufe('titel'),
  fontWeight: 700,
  lineHeight: 1.25,
  textAlign: 'center',
  overflowWrap: 'break-word',
  display: '-webkit-box',
  WebkitBoxOrient: 'vertical',
  WebkitLineClamp: 2,
  overflow: 'hidden',
  color: buchdetailsFarbe('titel'),
};

// Autor unter dem Titel (REQ-028): eine Zeile mit „…“, kleiner als der Titel, Tertiär.
const autorStil: CSSProperties = {
  margin: `${abstand('xs')} ${RAND}px 0`,
  ...textstufe('meta'),
  fontStyle: 'italic',
  fontWeight: 400,
  lineHeight: 1.3,
  textAlign: 'center',
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  color: fortschrittFarbe('autor'),
};

// Titel und Autor sind antippbar (REQ-094); die Darstellung bleibt unverändert (REQ-018, REQ-028).
const antippbar: CSSProperties = { cursor: 'pointer', WebkitTapHighlightColor: 'transparent' };

// „Band 1 · The Empyrean“ direkt unter der Autorzeile (REQ-099): wie die Autorzeile, aufrecht.
const sagaZeileStil: CSSProperties = {
  display: 'block',
  boxSizing: 'border-box',
  width: `calc(100% - ${2 * RAND}px)`,
  margin: `${abstand('xs')} ${RAND}px 0`,
  padding: 0,
  border: 'none',
  background: 'none',
  fontFamily: 'inherit',
  ...textstufe('meta'),
  lineHeight: 1.3,
  textAlign: 'center',
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  color: listenFarbe('sagaZeile'),
  ...antippbar,
};

/** So lange steht der Hinweis bei Hörbüchern (REQ-078), ms. Dauer prüft der CEO im Prototyp. */
export const HINWEIS_3D_MS = 2500;
export const HINWEIS_3D_TEXT = 'Diese Funktion ist noch nicht umgesetzt';

const hinweisStil: CSSProperties = {
  position: 'fixed',
  left: '50%',
  bottom: `calc(${abstand('xl')} * 3)`,
  zIndex: 70,
  transform: 'translateX(-50%)',
  maxWidth: `calc(100% - 2 * ${bildschirmrand})`,
  boxSizing: 'border-box',
  padding: `${abstand('s')} ${abstand('l')}`,
  borderRadius: '999px',
  backgroundColor: ansicht3dFarbe('hinweisFlaeche'),
  color: ansicht3dFarbe('hinweisSchrift'),
  boxShadow: ansicht3dSchatten,
  ...textstufe('text'),
  textAlign: 'center',
};

const pillenBereichStil: CSSProperties = {
  display: 'flex',
  justifyContent: 'center',
  margin: `${bildschirmrand} ${RAND}px 0`,
};

/** Bilder aller Bereiche eines Buches aus dem Bildspeicher. */
async function ladeBilder(speicher: ImageStore, buchId: string): Promise<Bilder> {
  const werte = await Promise.all(BILDBEREICHE.map((b) => speicher.get(buchId, b)));
  const bilder: Bilder = {};
  BILDBEREICHE.forEach((b, i) => {
    const w = werte[i];
    if (w) bilder[b] = w;
  });
  return bilder;
}

/** Fenster „Buchdetails“ (REQ-013 bis REQ-028) mit Reiterleiste, Reiter „Rezension“ (REQ-043 bis REQ-049) und „Details“ (REQ-051 bis REQ-059). */
export default function BuchDetails({
  buchId,
  buch: vorgegeben,
  bildquelle,
  bildspeicher,
  repository,
  jetzt = systemzeit,
  listenRepository,
  onZurueck,
}: BuchDetailsProps) {
  const speicher = useMemo(() => bildspeicher ?? standardBildspeicher(), [bildspeicher]);
  const listenRepo = useMemo(() => listenRepository ?? standardListenRepository(), [listenRepository]);
  const { listen, zug, neuLaden: listenNeuLaden } = useListen(listenRepo);
  // Blatt „Zu einer … hinzufügen“ (REQ-096) bzw. flächendeckende Listen-Ansicht (REQ-097, REQ-098, REQ-099).
  const [listenBlatt, setListenBlatt] = useState<ListenArt | null>(null);
  const [listenZiel, setListenZiel] = useState<ListenZiel | null>(null);
  const [geladen, setGeladen] = useState<Buch | undefined>(undefined);
  // In den Buchdetails geänderter Stand (Status, Seitenanzahl, Fortschritt); hat Vorrang vor dem übergebenen Buch.
  const [geaendert, setGeaendert] = useState<Buch | undefined>(undefined);
  const basis = vorgegeben && vorgegeben.id === buchId ? vorgegeben : geladen;
  const buch = geaendert && geaendert.id === buchId ? geaendert : basis;
  const [blatt, setBlatt] = useState<Blatt>(null);
  // Aktiver Reiter; beim Öffnen „Rezension“ (REQ-043, AK-3).
  const [reiter, setReiter] = useState<ReiterId>(START_REITER);
  const ausstehend = useRef<Promise<void> | null>(null);
  const [bilder, setBilder] = useState<Bilder>({});
  const [menue, setMenue] = useState<Bildbereich | null>(null);
  const [schritt, setSchritt] = useState<Schritt>({ art: 'details' });
  const aktiv = useRef(true);
  const kameraErgebnis = useRef<((bild: string | null) => void) | null>(null);
  // 3D-Ansicht (REQ-074) und Hinweis bei Hörbüchern (REQ-078).
  const [ansicht3d, setAnsicht3d] = useState(false);
  const [hinweis3d, setHinweis3d] = useState(false);
  const [backdrop] = useState(backdropUnterstuetzt);
  const doppeltipp = useRef<Doppeltipp | null>(null);
  const buchRef = useRef<Buch | undefined>(undefined);

  useEffect(() => {
    aktiv.current = true;
    return () => {
      aktiv.current = false;
      kameraErgebnis.current?.(null);
      doppeltipp.current?.abbrechen();
    };
  }, []);

  useEffect(() => {
    if (!hinweis3d) return;
    const t = setTimeout(() => setHinweis3d(false), HINWEIS_3D_MS);
    return () => clearTimeout(t);
  }, [hinweis3d]);

  useEffect(() => {
    if (vorgegeben && vorgegeben.id === buchId) return;
    let laeuft = true;
    const repo = repository ? Promise.resolve(repository) : standardRepository();
    void repo.then((r) => r.get(buchId)).then((b) => {
      if (laeuft) setGeladen(b);
    });
    return () => {
      laeuft = false;
    };
  }, [buchId, vorgegeben, repository]);

  useEffect(() => {
    let laeuft = true;
    void ladeBilder(speicher, buchId).then((b) => {
      if (laeuft) setBilder(b);
    });
    return () => {
      laeuft = false;
    };
  }, [speicher, buchId]);

  /** Speichert das geänderte Buch über die Repository-Schnittstelle (ADR-0002); Speichervorgänge laufen nacheinander. */
  const speichern = (neu: Buch) => {
    setGeaendert(neu);
    const vorher = ausstehend.current ?? Promise.resolve();
    const lauf = vorher
      .then(async () => (repository ?? (await standardRepository())).save(neu))
      .catch((fehler: unknown) => console.warn('Buch konnte nicht gespeichert werden:', fehler));
    ausstehend.current = lauf;
    void lauf.then(() => {
      if (ausstehend.current === lauf) ausstehend.current = null;
    });
  };

  // Zurück erst, wenn alle Änderungen gespeichert sind: Die Buchlisten lesen danach neu (REQ-022, AK-7).
  const zurueck = () => {
    const lauf = ausstehend.current;
    if (!lauf) {
      onZurueck();
      return;
    }
    void lauf.then(() => {
      if (aktiv.current) onZurueck();
    });
  };

  const statusWaehlen = (status: LesestatusId) => {
    if (!buch || buch.status === status) return;
    // Wechsel auf *gelesen* setzt „Beendet am“ auf heute (REQ-085).
    speichern(statusSetzen(buch, status, jetzt()));
  };

  // Herz bzw. Fortschritt antippen: ohne Seitenanzahl zuerst „Buchlänge“ (REQ-025), sonst „Aktuelle Seite“ (REQ-024).
  const fortschrittOeffnen = () => {
    if (!buch) return;
    setBlatt(hatSeitenanzahl(buch) ? 'aktuelleSeite' : 'buchlaenge');
  };

  // Cover: Einfachtipp öffnet nach der Wartezeit das Auswahlmenü, Doppeltipp die 3D-Ansicht (REQ-074) bzw. bei
  // Hörbüchern den Hinweis (REQ-078). Rücken und Schnitt öffnen das Auswahlmenü sofort (REQ-015).
  buchRef.current = buch;
  if (doppeltipp.current === null) {
    doppeltipp.current = doppeltippErkennen(
      () => {
        if (aktiv.current) setMenue('cover');
      },
      () => {
        const b = buchRef.current;
        if (!aktiv.current || !b) return;
        if (b.format === 'hoerbuch') setHinweis3d(true);
        else setAnsicht3d(true);
      },
    );
  }
  const bereichAntippen = (bereich: Bildbereich) => {
    if (bereich === 'cover') doppeltipp.current?.tipp();
    else setMenue(bereich);
  };

  const buchlaengeSichern = (seitenanzahl: number) => {
    if (!buch) return;
    speichern({ ...buch, seitenanzahl });
    setBlatt('aktuelleSeite');
  };

  const fortschrittSpeichern = (modus: Fortschrittsmodus, wert: number) => {
    if (!buch) return;
    speichern(fortschrittSichern(buch, modus, wert, jetzt()));
    setBlatt(null);
  };

  // Bewertung setzen bzw. zurücksetzen und sofort speichern (REQ-045).
  const bewerten = (kriterium: KriteriumId, n: number) => {
    if (!buch) return;
    speichern(bewertungAntippen(buch, kriterium, n));
  };

  // Feld im Menü „Aktuelle Seite“ geleert: Fortschritt entfernen, keine Sitzung (REQ-024 AK-8, REQ-093 AK-7).
  const fortschrittLeeren = () => {
    if (!buch) return;
    speichern(fortschrittEntfernen(buch));
    setBlatt(null);
  };

  // Rezension sichern (REQ-049); leerer Text entfernt eine gespeicherte Rezension (REQ-093, AK-8).
  const rezensionSpeichern = (text: string) => {
    if (!buch) return;
    const neu = rezensionSichern(buch, text);
    if (neu) speichern(neu);
    setBlatt(null);
  };

  // Seitenanzahl über die Zeile „Seiten“ ändern: kein Menü „Aktuelle Seite“ danach (REQ-057).
  const seitenSichern = (seitenanzahl: number) => {
    if (!buch) return;
    speichern({ ...buch, seitenanzahl });
    setBlatt(null);
  };

  // Fenster „Format“ sichern (REQ-058): nicht gewählte Angaben fehlen im Buch.
  const formatSpeichern = (a: Formatangaben) => {
    if (!buch) return;
    const neu: Buch = { ...buch };
    delete neu.format;
    delete neu.unterformat;
    delete neu.sonderausgabe;
    delete neu.exemplar;
    speichern({ ...neu, ...a });
    setBlatt(null);
  };

  /** Buch ohne die genannten Angaben (Leeren, REQ-093). */
  const ohne = (b: Buch, ...felder: (keyof Buch)[]): Buch => {
    const neu: Buch = { ...b };
    for (const f of felder) delete neu[f];
    return neu;
  };

  // Preis sichern (REQ-059); leer entfernt den Preis (REQ-093, AK-3).
  const preisSpeichern = (preisCent: number | undefined) => {
    if (!buch) return;
    speichern(preisCent === undefined ? ohne(buch, 'preisCent') : { ...buch, preisCent });
    setBlatt(null);
  };

  // Maße sichern (REQ-072): leeres Feld = kein Wert.
  const masseSpeichern = (m: Masse) => {
    if (!buch) return;
    const neu: Buch = { ...buch };
    delete neu.breiteMm;
    delete neu.hoeheMm;
    delete neu.dickeMm;
    speichern({ ...neu, ...m });
    setBlatt(null);
  };

  // Verlag sichern (REQ-063); leer entfernt den Verlag.
  const verlagSpeichern = (verlag: string) => {
    if (!buch) return;
    const neu: Buch = { ...buch };
    delete neu.verlag;
    speichern(verlag ? { ...neu, verlag } : neu);
    setBlatt(null);
  };

  // ISBN sichern (REQ-063); das Blatt lässt nur gültige ISBN durch, leer entfernt sie (REQ-093, AK-2).
  const isbnSpeichern = (isbn: string) => {
    if (!buch) return;
    speichern(isbn ? { ...buch, isbn } : ohne(buch, 'isbn'));
    setBlatt(null);
  };

  // Eintragungsdatum ändern (REQ-064); gleicher Tag behält den bisherigen Zeitpunkt; leer entfernt es (REQ-093, AK-5).
  const hinzugefuegtSpeichern = (datum: string) => {
    if (!buch) return;
    speichern(datum ? { ...buch, eingetragenAm: eintragungsdatumAusText(datum, buch.eingetragenAm) } : ohne(buch, 'eingetragenAm'));
    setBlatt(null);
  };

  // „Beendet am“ überschreiben (REQ-085); leer entfernt es, der Status bleibt (REQ-093, AK-6).
  const beendetSpeichern = (datum: string) => {
    if (!buch) return;
    speichern(datum ? { ...buch, beendetAm: beendetAusText(datum) } : ohne(buch, 'beendetAm'));
    setBlatt(null);
  };

  // „Erschienen“ (REQ-092): Datum oder Jahr ersetzt die bisherige Angabe vollständig, leer entfernt sie.
  const erschienenSpeichern = (text: string) => {
    if (!buch) return;
    speichern({ ...ohne(buch, 'erscheinungsdatum', 'erscheinungsjahr'), ...erscheinungAusText(text) });
    setBlatt(null);
  };

  // Titel (Pflicht) und Autor (leerbar) unter der Buchdarstellung ändern (REQ-094).
  const titelSpeichern = (titel: string) => {
    if (!buch) return;
    speichern({ ...buch, titel });
    setBlatt(null);
  };
  const autorSpeichern = (autor: string) => {
    if (!buch) return;
    speichern(autor ? { ...buch, autor } : ohne(buch, 'autor'));
    setBlatt(null);
  };

  // Zurück aus der Listen-Ansicht: Listen und Buch neu lesen (dort kann sich beides geändert haben).
  const listenAnsichtSchliessen = () => {
    setListenZiel(null);
    void listenNeuLaden();
    void (async () => {
      const lauf = ausstehend.current;
      if (lauf) await lauf;
      const b = await (repository ?? (await standardRepository())).get(buchId).catch(() => undefined);
      if (b && aktiv.current) setGeaendert(b);
    })();
  };

  // Standard-Bildquelle: „Scannen“ zeigt die Kameraansicht der App und liefert deren Foto bzw. null (Zurück).
  const kameraAnzeigen = (bereich: Bildbereich) => () =>
    new Promise<string | null>((resolve) => {
      kameraErgebnis.current = resolve;
      setSchritt({ art: 'kamera', bereich });
    });
  const kameraBeenden = (bild: string | null) => {
    const r = kameraErgebnis.current;
    kameraErgebnis.current = null;
    if (bild === null) setSchritt({ art: 'details' });
    r?.(bild);
  };
  // Erst beim Antippen bestimmt (nicht beim Rendern), da die Kamera-Anzeige Refs nutzt.
  const quelle = (bereich: Bildbereich): Bildquelle => bildquelle ?? standardBildquelle(kameraAnzeigen(bereich));

  const bildHolen = async (bereich: Bildbereich, holen: () => Promise<string | null>) => {
    let bild: string | null = null;
    try {
      bild = await holen();
    } catch {
      bild = null;
    }
    if (!aktiv.current) return;
    // Abbruch oder kein Zugriff: Bereich bleibt unverändert (REQ-016, AK-2/AK-4/AK-6).
    setSchritt(bild ? { art: 'zuschnitt', bild, bereich } : { art: 'details' });
  };

  const aktion = async (a: MenueAktion) => {
    const bereich = menue;
    if (bereich === null) return;
    switch (a) {
      case 'scannen':
        setMenue(null);
        await bildHolen(bereich, () => quelle(bereich).scannen());
        return;
      case 'galerie':
        setMenue(null);
        await bildHolen(bereich, () => quelle(bereich).galerie());
        return;
      case 'online':
        // „Cover online suchen“: sichtbar, aber ohne Funktion (REQ-015, AK-5).
        return;
      case 'entfernen':
        await speicher.remove(buchId, bereich);
        if (!aktiv.current) return;
        setBilder((alt) => {
          const neu = { ...alt };
          delete neu[bereich];
          return neu;
        });
        setMenue(null);
        return;
    }
  };

  const zuschnittBestaetigen = async (bild: string, bereich: Bildbereich, ecken: Ecken) => {
    const ergebnis = await zuschneiden(bild, ecken, seitenverhaeltnis(bereich, buch)).catch(() => bild);
    await speicher.put(buchId, bereich, ergebnis);
    if (!aktiv.current) return;
    setBilder((alt) => ({ ...alt, [bereich]: ergebnis }));
    setSchritt({ art: 'details' });
  };

  if (schritt.art === 'kamera') {
    return <KameraAnsicht onFoto={(bild) => kameraBeenden(bild)} onZurueck={() => kameraBeenden(null)} />;
  }
  if (schritt.art === 'zuschnitt') {
    const { bild, bereich } = schritt;
    return (
      <Zuschnitt
        bild={bild}
        bereich={bereich}
        masse={buch}
        onBestaetigen={(ecken) => zuschnittBestaetigen(bild, bereich, ecken)}
        onZurueck={() => setSchritt({ art: 'details' })}
      />
    );
  }

  if (listenZiel !== null) {
    return (
      <ListenNavigation
        start={listenZiel}
        onZurueck={listenAnsichtSchliessen}
        repository={repository}
        listenRepository={listenRepo}
        bildspeicher={speicher}
        bildquelle={bildquelle}
        jetzt={jetzt}
      />
    );
  }

  const verwischt = ansicht3d && !backdrop;
  const sagen = buch ? sagenDesBuches(listen ?? [], zug, buch.id) : [];
  return (
    <>
    <section aria-label="Buchdetails" style={verwischt ? { ...ansichtStil, filter: UNSCHAERFE } : ansichtStil}>
      <Kopfzeile
        onZurueck={zurueck}
        rechts={
          // Drei Punkte: vorerst ohne Funktion (REQ-013, AK-8).
          <button type="button" aria-label="Weitere Optionen" style={kopfSchaltflaecheStil}>
            <Icon datei="icon-mehr.png" url={iconMehr} farbe={buchdetailsFarbe('kopfzeilenSymbol')} groesse={KOPF_ICON} />
          </button>
        }
      />
      {buch ? (
        <>
          <Buchdarstellung titel={buch.titel} bilder={bilder} masse={buch} onAntippen={bereichAntippen} />
          <h1 data-buchdetails-titel="" {...stilRolle('seitentitel', 'buchtitel')} onClick={() => setBlatt('titel')} style={{ ...titelStil, ...antippbar }}>
            {buch.titel}
          </h1>
          {/* Ohne Autor der Platzhalter „unbekannter Autor“ (kein gespeicherter Autor), antippbar zum Nachtragen (REQ-094). */}
          <p
            data-buchdetails-autor=""
            data-autor-platzhalter={buch.autor ? undefined : 'true'}
            onClick={() => setBlatt('autor')}
            style={{ ...autorStil, ...antippbar }}
          >
            {buch.autor || AUTOR_PLATZHALTER}
          </p>
          {sagen.map(({ liste, band }) => (
            <button
              key={liste.id}
              type="button"
              data-saga-zeile={liste.id}
              onClick={() => setListenZiel({ art: 'liste', listeId: liste.id })}
              style={sagaZeileStil}
            >
              {sagaZeileText(liste.name, band)}
            </button>
          ))}
          <div style={pillenBereichStil}>
            <Statuspille status={buch.status} onWaehlen={statusWaehlen} />
          </div>
          <Fortschritt buch={buch} onAktuelleSeite={fortschrittOeffnen} onBuchlaenge={fortschrittOeffnen} />
          <Statistik buch={buch} jetzt={jetzt()} />
          <Reiterleiste aktiv={reiter} onWaehlen={setReiter} />
          <ReiterBereich
            reiter={reiter}
            buch={buch}
            onBewertungAntippen={bewerten}
            onSchreiben={() => setBlatt('rezension')}
            onSeiten={() => setBlatt('seiten')}
            onFormat={() => setBlatt('format')}
            onPreis={() => setBlatt('preis')}
            onMasse={() => setBlatt('masse')}
            onVerlag={() => setBlatt('verlag')}
            onIsbn={() => setBlatt('isbn')}
            onHinzugefuegt={() => setBlatt('hinzugefuegt')}
            onBeendet={() => setBlatt('beendet')}
            onErschienen={() => setBlatt('erschienen')}
            listen={{
              listen: listen ?? [],
              zug,
              onPille: (art) => setListenBlatt(art),
              onZeile: (art) => setListenZiel({ art: 'uebersicht', listenArt: art, buchId: buch.id }),
            }}
          />
        </>
      ) : null}
      {buch && blatt === 'buchlaenge' ? (
        <BlattBuchlaenge onSichern={buchlaengeSichern} onSchliessen={() => setBlatt(null)} />
      ) : null}
      {buch && blatt === 'aktuelleSeite' && hatSeitenanzahl(buch) ? (
        <BlattAktuelleSeite
          seitenanzahl={buch.seitenanzahl!}
          startModus={modusVon(buch)}
          startWert={gespeicherteEingabe(buch)}
          onSichern={fortschrittSpeichern}
          onLeeren={fortschrittLeeren}
          onSchliessen={() => setBlatt(null)}
        />
      ) : null}
      {buch && blatt === 'rezension' ? (
        <Schreibfenster
          titel={buch.titel}
          autor={buch.autor}
          sterne={buch.bewertungen?.sterne}
          rezension={buch.rezension}
          onSichern={rezensionSpeichern}
          onSchliessen={() => setBlatt(null)}
        />
      ) : null}
      {buch && blatt === 'seiten' ? (
        <BlattBuchlaenge
          startWert={buch.seitenanzahl}
          aktuelleSeite={buch.aktuelleSeite}
          onSichern={seitenSichern}
          onSchliessen={() => setBlatt(null)}
        />
      ) : null}
      {buch && blatt === 'format' ? (
        <FensterFormat
          start={{ format: buch.format, unterformat: buch.unterformat, sonderausgabe: buch.sonderausgabe, exemplar: buch.exemplar }}
          onSichern={formatSpeichern}
          onSchliessen={() => setBlatt(null)}
        />
      ) : null}
      {buch && blatt === 'preis' ? <BlattPreis preisCent={buch.preisCent} onSichern={preisSpeichern} onSchliessen={() => setBlatt(null)} /> : null}
      {buch && blatt === 'masse' ? <BlattMasse masse={buch} onSichern={masseSpeichern} onSchliessen={() => setBlatt(null)} /> : null}
      {buch && blatt === 'verlag' ? <BlattVerlag verlag={buch.verlag} onSichern={verlagSpeichern} onSchliessen={() => setBlatt(null)} /> : null}
      {buch && blatt === 'isbn' ? <BlattIsbn isbn={buch.isbn} onSichern={isbnSpeichern} onSchliessen={() => setBlatt(null)} /> : null}
      {buch && blatt === 'hinzugefuegt' ? (
        <BlattHinzugefuegt
          eingetragenAm={buch.eingetragenAm}
          jetzt={jetzt}
          leerbar
          leerOhneDatum
          onSichern={hinzugefuegtSpeichern}
          onSchliessen={() => setBlatt(null)}
        />
      ) : null}
      {buch && blatt === 'erschienen' ? (
        <BlattErschienen erschienen={erschienenEingabeText(buch)} jetzt={jetzt} onSichern={erschienenSpeichern} onSchliessen={() => setBlatt(null)} />
      ) : null}
      {buch && blatt === 'titel' ? <BlattTitel titel={buch.titel} onSichern={titelSpeichern} onSchliessen={() => setBlatt(null)} /> : null}
      {buch && blatt === 'autor' ? <BlattAutor autor={buch.autor} onSichern={autorSpeichern} onSchliessen={() => setBlatt(null)} /> : null}
      {buch && listenBlatt !== null ? (
        <BlattZuListe
          art={listenBlatt}
          buch={buch}
          listen={listen ?? []}
          zug={zug}
          repository={listenRepo}
          onGesichert={() => {
            setListenBlatt(null);
            void listenNeuLaden();
          }}
          onSchliessen={() => setListenBlatt(null)}
        />
      ) : null}
      {buch && blatt === 'beendet' ? (
        <BlattBeendet beendetAm={buch.beendetAm} jetzt={jetzt} onSichern={beendetSpeichern} onSchliessen={() => setBlatt(null)} />
      ) : null}
      {menue !== null ? (
        <Auswahlmenue
          oben={menueOben(darstellungsMasse(buch).hoehe)}
          mitEntfernen={Boolean(bilder[menue])}
          onAktion={(a) => void aktion(a)}
          onSchliessen={() => setMenue(null)}
        />
      ) : null}
    </section>
    {buch && ansicht3d ? (
      <Ansicht3d
        buch={buch}
        bilder={bilder}
        onSchliessen={() => setAnsicht3d(false)}
        onBearbeiten={() => {
          setAnsicht3d(false);
          setReiter('details');
        }}
      />
    ) : null}
    {hinweis3d ? (
      <p role="status" data-hinweis-3d="" style={hinweisStil}>
        {HINWEIS_3D_TEXT}
      </p>
    ) : null}
    </>
  );
}
