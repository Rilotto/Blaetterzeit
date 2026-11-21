import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import iconMehr from '@/assets/icons/icon-mehr.png';
import { zuschneiden } from '@/bild/bildverarbeitung';
import { standardBildquelle, type Bildquelle } from '@/bild/bildquelle';
import type { Ecken } from '@/bild/entzerren';
import { standardBildspeicher, standardRepository } from '@/buecher/buchQuelle';
import Auswahlmenue, { type MenueAktion } from '@/buchdetails/Auswahlmenue';
import BlattAktuelleSeite from '@/buchdetails/BlattAktuelleSeite';
import BlattBuchlaenge from '@/buchdetails/BlattBuchlaenge';
import { BlattHinzugefuegt, BlattIsbn, BlattVerlag } from '@/buchdetails/BlattFeld';
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
import { eintragungsdatumAusText, type Formatangaben, type Masse } from '@/domain/ausgabe';
import { bewertungAntippen, rezensionSichern, type KriteriumId } from '@/domain/bewertung';
import type { Buch, Fortschrittsmodus, LesestatusId } from '@/domain/buch';
import { fortschrittSichern, gespeicherteEingabe, hatSeitenanzahl, modusVon } from '@/domain/fortschritt';
import { BILDBEREICHE, type BookRepository, type Bildbereich, type ImageStore } from '@/storage';
import { buchdetailsFarbe, fortschrittFarbe, textstufe, abstand, bildschirmrand, stilRolle } from '@/theme';

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
  /** Zurück zur Seite „Bücher“. */
  onZurueck: () => void;
}

type Blatt = 'buchlaenge' | 'aktuelleSeite' | 'rezension' | 'seiten' | 'format' | 'preis' | 'masse' | 'verlag' | 'isbn' | 'hinzugefuegt' | null;

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
  onZurueck,
}: BuchDetailsProps) {
  const speicher = useMemo(() => bildspeicher ?? standardBildspeicher(), [bildspeicher]);
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

  useEffect(() => {
    aktiv.current = true;
    return () => {
      aktiv.current = false;
      kameraErgebnis.current?.(null);
    };
  }, []);

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
    speichern({ ...buch, status });
  };

  // Herz bzw. Fortschritt antippen: ohne Seitenanzahl zuerst „Buchlänge“ (REQ-025), sonst „Aktuelle Seite“ (REQ-024).
  const fortschrittOeffnen = () => {
    if (!buch) return;
    setBlatt(hatSeitenanzahl(buch) ? 'aktuelleSeite' : 'buchlaenge');
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

  // Rezension sichern (REQ-049); leerer Text wird bereits im Schreibfenster abgewiesen.
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

  // Preis sichern (REQ-059).
  const preisSpeichern = (preisCent: number) => {
    if (!buch) return;
    speichern({ ...buch, preisCent });
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

  // ISBN sichern (REQ-063); das Blatt lässt nur gültige ISBN durch.
  const isbnSpeichern = (isbn: string) => {
    if (!buch) return;
    speichern({ ...buch, isbn });
    setBlatt(null);
  };

  // Eintragungsdatum ändern (REQ-064); gleicher Tag behält den bisherigen Zeitpunkt.
  const hinzugefuegtSpeichern = (datum: string) => {
    if (!buch) return;
    speichern({ ...buch, eingetragenAm: eintragungsdatumAusText(datum, buch.eingetragenAm) });
    setBlatt(null);
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

  return (
    <section aria-label="Buchdetails" style={ansichtStil}>
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
          <Buchdarstellung titel={buch.titel} bilder={bilder} masse={buch} onAntippen={setMenue} />
          <h1 data-buchdetails-titel="" {...stilRolle('seitentitel', 'buchtitel')} style={titelStil}>
            {buch.titel}
          </h1>
          {buch.autor ? (
            <p data-buchdetails-autor="" style={autorStil}>
              {buch.autor}
            </p>
          ) : null}
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
        <BlattHinzugefuegt eingetragenAm={buch.eingetragenAm} jetzt={jetzt} onSichern={hinzugefuegtSpeichern} onSchliessen={() => setBlatt(null)} />
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
  );
}
