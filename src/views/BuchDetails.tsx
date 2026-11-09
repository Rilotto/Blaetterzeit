import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import iconMehr from '@/assets/icons/icon-mehr.png';
import { zuschneiden } from '@/bild/bildverarbeitung';
import { standardBildquelle, type Bildquelle } from '@/bild/bildquelle';
import type { Ecken } from '@/bild/entzerren';
import { ladeBuch, standardBildspeicher } from '@/buecher/buchQuelle';
import Auswahlmenue, { type MenueAktion } from '@/buchdetails/Auswahlmenue';
import Buchdarstellung, { type Bilder } from '@/buchdetails/Buchdarstellung';
import KameraAnsicht from '@/buchdetails/KameraAnsicht';
import Kopfzeile from '@/buchdetails/Kopfzeile';
import { kopfSchaltflaecheStil } from '@/buchdetails/stile';
import { BUCH_HOEHE, KOPF_ICON, KOPF_SCHALTFLAECHE, RAND, seitenverhaeltnis } from '@/buchdetails/masse';
import Zuschnitt from '@/buchdetails/Zuschnitt';
import Icon from '@/components/Icon';
import type { Buch } from '@/domain/buch';
import { BILDBEREICHE, type Bildbereich, type ImageStore } from '@/storage';
import { buchdetailsFarbe } from '@/theme';

export interface BuchDetailsProps {
  buchId: string;
  /** Das Buch selbst, falls bereits geladen; sonst wird es über das Repository geladen. */
  buch?: Buch;
  /** Bildquelle (Kamera/Galerie); in Tests ersetzbar. */
  bildquelle?: Bildquelle;
  /** Bildspeicher (REQ-019); in Tests ersetzbar. */
  bildspeicher?: ImageStore;
  /** Zurück zur Seite „Bücher“. */
  onZurueck: () => void;
}

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
export default function BuchDetails({ buchId, buch: vorgegeben, bildquelle, bildspeicher, onZurueck }: BuchDetailsProps) {
  const speicher = useMemo(() => bildspeicher ?? standardBildspeicher(), [bildspeicher]);
  const [geladen, setGeladen] = useState<Buch | undefined>(undefined);
  const buch = vorgegeben && vorgegeben.id === buchId ? vorgegeben : geladen;
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
    void ladeBuch(buchId).then((b) => {
      if (laeuft) setGeladen(b);
    });
    return () => {
      laeuft = false;
    };
  }, [buchId, vorgegeben]);

  useEffect(() => {
    let laeuft = true;
    void ladeBilder(speicher, buchId).then((b) => {
      if (laeuft) setBilder(b);
    });
    return () => {
      laeuft = false;
    };
  }, [speicher, buchId]);

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
        onZurueck={onZurueck}
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
        </>
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
