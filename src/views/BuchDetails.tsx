import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import iconMehr from '@/assets/icons/icon-mehr.png';
import { zuschneiden } from '@/bild/bildverarbeitung';
import { standardBildquelle, type Bildquelle } from '@/bild/bildquelle';
import type { Ecken } from '@/bild/entzerren';
import { standardBildspeicher, standardRepository } from '@/buecher/buchQuelle';
import Auswahlmenue, { type MenueAktion } from '@/buchdetails/Auswahlmenue';
import BlattAktuelleSeite from '@/buchdetails/BlattAktuelleSeite';
import BlattBuchlaenge from '@/buchdetails/BlattBuchlaenge';
import Buchdarstellung, { type Bilder } from '@/buchdetails/Buchdarstellung';
import Fortschritt from '@/buchdetails/Fortschritt';
import KameraAnsicht from '@/buchdetails/KameraAnsicht';
import Kopfzeile from '@/buchdetails/Kopfzeile';
import Statistik from '@/buchdetails/Statistik';
import Statuspille from '@/buchdetails/Statuspille';
import { kopfSchaltflaecheStil } from '@/buchdetails/stile';
import { BUCH_HOEHE, KOPF_ICON, KOPF_SCHALTFLAECHE, RAND, seitenverhaeltnis } from '@/buchdetails/masse';
import Zuschnitt from '@/buchdetails/Zuschnitt';
import Icon from '@/components/Icon';
import type { Buch, Fortschrittsmodus, LesestatusId } from '@/domain/buch';
import { fortschrittSichern, gespeicherteEingabe, hatSeitenanzahl, modusVon } from '@/domain/fortschritt';
import { BILDBEREICHE, type BookRepository, type Bildbereich, type ImageStore } from '@/storage';
import { buchdetailsFarbe, fortschrittFarbe } from '@/theme';

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

type Blatt = 'buchlaenge' | 'aktuelleSeite' | null;

const systemzeit = () => new Date();

type Schritt =
  | { art: 'details' }
  | { art: 'kamera'; bereich: Bildbereich }
  | { art: 'zuschnitt'; bild: string; bereich: Bildbereich };

const ansichtStil: CSSProperties = {
  position: 'relative',
  paddingBottom: '24px',
};

// Kopfzeile (8 + 40) + Abstand (10) + Buch + 8 px: Oberkante des Auswahlmenüs (Referenzbild: direkt unter dem Buch).
const MENUE_OBEN = 8 + KOPF_SCHALTFLAECHE + 10 + BUCH_HOEHE + 8;

// Buchtitel unter der Buchdarstellung (REQ-018): mittig, höchstens zwei Zeilen mit „…“.
const titelStil: CSSProperties = {
  margin: `24px ${RAND}px 0`,
  fontSize: '22px',
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
  margin: `4px ${RAND}px 0`,
  fontSize: '17px',
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
  margin: `20px ${RAND}px 0`,
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

/** Fenster „Buchdetails“ (REQ-013 bis REQ-019). */
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
    const ergebnis = await zuschneiden(bild, ecken, seitenverhaeltnis(bereich)).catch(() => bild);
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
          <Buchdarstellung titel={buch.titel} bilder={bilder} onAntippen={setMenue} />
          <h1 data-buchdetails-titel="" style={titelStil}>
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
      {menue !== null ? (
        <Auswahlmenue
          oben={MENUE_OBEN}
          mitEntfernen={Boolean(bilder[menue])}
          onAktion={(a) => void aktion(a)}
          onSchliessen={() => setMenue(null)}
        />
      ) : null}
    </section>
  );
}
