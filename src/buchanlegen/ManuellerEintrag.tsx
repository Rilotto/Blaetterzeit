import { useEffect, useRef, useState, type CSSProperties, type PointerEvent as ReactPointerEvent, type ReactNode } from 'react';
import iconKamera from '@/assets/icons/icon-kamera.png';
import iconX from '@/assets/icons/icon-x.png';
import { zuschneiden } from '@/bild/bildverarbeitung';
import { standardBildquelle, type Bildquelle } from '@/bild/bildquelle';
import type { Ecken } from '@/bild/entzerren';
import { standardRepository } from '@/buecher/buchQuelle';
import Auswahlmenue, { type MenueAktion } from '@/buchdetails/Auswahlmenue';
import KameraAnsicht from '@/buchdetails/KameraAnsicht';
import { seitenverhaeltnis } from '@/buchdetails/masse';
import Zuschnitt from '@/buchdetails/Zuschnitt';
import Icon from '@/components/Icon';
import type { Buch } from '@/domain/buch';
import { useZurueckTaste } from '@/plattform/zurueckTaste';
import type { BookRepository, ImageStore } from '@/storage';
import { buchAnlegenFarbe } from '@/theme';
import {
  buchAusEingaben,
  jahrFiltern,
  jahrUngueltig,
  LEERE_EINGABEN,
  seitenFiltern,
  titelFehlt,
  type Eingaben,
} from './eingabe';

export interface ManuellerEintragProps {
  /** Buchspeicher; ohne Angabe das Repository der App. */
  repository?: BookRepository;
  /** Bildspeicher für das Frontcover (REQ-019). */
  bildspeicher: ImageStore;
  /** Bildquelle (Kamera/Galerie); in Tests ersetzbar. */
  bildquelle?: Bildquelle;
  /** Schließen ohne Speichern: X, Android-Zurück-Taste, Herunterziehen am Ziehgriff (REQ-030). */
  onZurueck: () => void;
  /** Das Buch wurde angelegt (REQ-031). */
  onAngelegt: (buch: Buch) => void;
  /** Aktuelle Zeit für das Eintragungsdatum (REQ-041); ohne Angabe die Systemzeit. In Tests ersetzbar. */
  jetzt?: () => Date;
}

type Schritt = { art: 'blatt' } | { art: 'kamera' } | { art: 'zuschnitt'; bild: string };

// Maße nach REF-buch-anlegen-02-manueller-eintrag.png (1080 px ≈ 412 dp, Faktor ≈ 2,6).
// Orientierungswerte, kein Akzeptanzkriterium.
const RAND = 22;
const COVER_BREITE = 176;
const COVER_HOEHE = 256;
/** Ab dieser Zugstrecke nach unten schließt das Blatt (REQ-030, AK-11). */
export const ZUG_SCHWELLE = 80;

// Sichere Bereiche (Statusleiste, Gestenleiste) über [data-sicherer-bereich] in index.css.
const blattStil = (versatz: number): CSSProperties => ({
  position: 'fixed',
  inset: 0,
  zIndex: 20,
  boxSizing: 'border-box',
  overflowY: 'auto',
  backgroundColor: buchAnlegenFarbe('blattFlaeche'),
  transform: versatz > 0 ? `translateY(${versatz}px)` : undefined,
  transition: versatz > 0 ? undefined : 'transform 160ms ease-out',
});

const innenStil: CSSProperties = {
  position: 'relative',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'stretch',
  paddingBottom: '24px',
};

const griffBereichStil: CSSProperties = {
  alignSelf: 'center',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  width: '96px',
  height: '28px',
  touchAction: 'none',
  cursor: 'grab',
};

const griffStil: CSSProperties = {
  width: '34px',
  height: '5px',
  borderRadius: '3px',
  backgroundColor: buchAnlegenFarbe('ziehgriff'),
};

const kopfStil: CSSProperties = {
  position: 'relative',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  height: '44px',
  margin: `4px ${RAND}px 0`,
};

const ueberschriftStil: CSSProperties = {
  margin: 0,
  fontSize: '20px',
  fontWeight: 700,
  lineHeight: 1.2,
  color: buchAnlegenFarbe('blattUeberschrift'),
};

// X-Schaltfläche wie im Menü „Aktuelle Seite“ (REQ-024): Fläche Ghost, Rahmen GhostFrame, X Dunkelbraun.
const schliessenStil: CSSProperties = {
  position: 'absolute',
  right: 0,
  top: '50%',
  transform: 'translateY(-50%)',
  boxSizing: 'border-box',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '34px',
  height: '34px',
  margin: 0,
  padding: 0,
  borderRadius: '50%',
  border: `1.5px solid ${buchAnlegenFarbe('schliessenRahmen')}`,
  backgroundColor: buchAnlegenFarbe('schliessenFlaeche'),
  cursor: 'pointer',
  WebkitTapHighlightColor: 'transparent',
};

const coverBereichStil: CSSProperties = {
  position: 'relative',
  alignSelf: 'center',
  marginTop: '12px',
};

const coverFeldStil = (mitBild: boolean): CSSProperties => ({
  boxSizing: 'border-box',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '12px',
  width: `${COVER_BREITE}px`,
  height: `${COVER_HOEHE}px`,
  margin: 0,
  padding: 0,
  overflow: 'hidden',
  borderRadius: '14px',
  border: mitBild ? 'none' : `2px dashed ${buchAnlegenFarbe('coverFeldRahmen')}`,
  backgroundColor: buchAnlegenFarbe('coverFeldFlaeche'),
  fontFamily: 'inherit',
  fontSize: '17px',
  fontWeight: 600,
  color: buchAnlegenFarbe('coverFeldInhalt'),
  cursor: 'pointer',
  WebkitTapHighlightColor: 'transparent',
});

const coverBildStil: CSSProperties = {
  display: 'block',
  width: '100%',
  height: '100%',
  objectFit: 'cover',
};

const karteStil: CSSProperties = {
  boxSizing: 'border-box',
  margin: `24px ${RAND}px 0`,
  padding: '0 18px',
  borderRadius: '20px',
  border: `1.5px solid ${buchAnlegenFarbe('formularRahmen')}`,
  backgroundColor: buchAnlegenFarbe('formularFlaeche'),
};

const zeileStil = (letzte: boolean): CSSProperties => ({
  padding: '14px 0',
  borderBottom: letzte ? 'none' : `1px solid ${buchAnlegenFarbe('trennlinie')}`,
});

const geteilteZeileStil: CSSProperties = {
  display: 'flex',
  borderBottom: `1px solid ${buchAnlegenFarbe('trennlinie')}`,
};

const feldStil = (fehler: boolean): CSSProperties => ({
  display: 'block',
  minWidth: 0,
  margin: '0 -8px',
  padding: '0 8px',
  borderRadius: '10px',
  outline: fehler ? `2px solid ${buchAnlegenFarbe('fehler')}` : 'none',
});

const beschriftungStil = (fehler: boolean): CSSProperties => ({
  display: 'block',
  fontSize: '12.5px',
  fontWeight: 500,
  letterSpacing: '0.06em',
  textTransform: 'uppercase',
  lineHeight: 1.3,
  color: fehler ? buchAnlegenFarbe('fehler') : buchAnlegenFarbe('feldBeschriftung'),
});

const eingabeStil = (fehler: boolean): CSSProperties =>
  ({
    // Platzhaltertext in Tertiär (::placeholder in index.css liest diese Variable).
    '--bz-platzhalterfarbe': buchAnlegenFarbe('platzhalter'),
    display: 'block',
    boxSizing: 'border-box',
    width: '100%',
    margin: '6px 0 0',
    padding: 0,
    border: '2px solid transparent',
    borderWidth: '0 0 2px',
    borderColor: fehler ? buchAnlegenFarbe('fehler') : 'transparent',
    outline: 'none',
    background: 'none',
    fontFamily: 'inherit',
    fontSize: '18px',
    lineHeight: 1.35,
    color: fehler ? buchAnlegenFarbe('fehler') : buchAnlegenFarbe('eingabe'),
  }) as CSSProperties;

const hinweisStil: CSSProperties = {
  margin: '6px 0 0',
  fontSize: '13px',
  lineHeight: 1.3,
  color: buchAnlegenFarbe('fehler'),
};

const erscheinungsdatumStil: CSSProperties = {
  display: 'block',
  margin: '8px 0 0',
  padding: 0,
  border: 'none',
  background: 'none',
  fontFamily: 'inherit',
  fontSize: '17px',
  fontWeight: 600,
  textAlign: 'left',
  color: buchAnlegenFarbe('erscheinungsdatum'),
  cursor: 'pointer',
  WebkitTapHighlightColor: 'transparent',
};

// Pille „Hinzufügen“: immer aktiv, volles Primär (REQ-030, AK-9), wie die Pille „Sichern“.
const hinzufuegenStil: CSSProperties = {
  boxSizing: 'border-box',
  height: '56px',
  margin: `28px ${RAND + 4}px 0`,
  padding: '0 24px',
  border: 'none',
  borderRadius: '9999px',
  fontFamily: 'inherit',
  fontSize: '18px',
  fontWeight: 600,
  backgroundColor: buchAnlegenFarbe('hinzufuegenFlaeche'),
  color: buchAnlegenFarbe('hinzufuegenSchrift'),
  cursor: 'pointer',
  WebkitTapHighlightColor: 'transparent',
};

interface FeldProps {
  name: string;
  platzhalter: string;
  wert: string;
  onWert: (wert: string) => void;
  ziffern?: boolean;
  fehler?: boolean;
  stil?: CSSProperties;
  children?: ReactNode;
}

/** Ein Eingabefeld mit Beschriftung in Großbuchstaben (REQ-030). */
function Feld({ name, platzhalter, wert, onWert, ziffern = false, fehler = false, stil, children }: FeldProps) {
  return (
    <div style={stil}>
      <label style={feldStil(fehler)}>
        <span style={beschriftungStil(fehler)}>{name.toUpperCase()}</span>
        <input
          type="text"
          aria-label={name}
          data-bz-eingabe=""
          data-fehler={fehler ? 'true' : undefined}
          aria-invalid={fehler ? true : undefined}
          inputMode={ziffern ? 'numeric' : undefined}
          autoComplete="off"
          placeholder={platzhalter}
          value={wert}
          onChange={(e) => onWert(e.target.value)}
          style={eingabeStil(fehler)}
        />
      </label>
      {children}
    </div>
  );
}

/** Blatt „Manueller Eintrag“ (REQ-030) mit Anlegen (REQ-031) und Cover (REQ-032). */
export default function ManuellerEintrag({
  repository,
  bildspeicher,
  bildquelle,
  onZurueck,
  onAngelegt,
  jetzt,
}: ManuellerEintragProps) {
  const [eingaben, setEingaben] = useState<Eingaben>(LEERE_EINGABEN);
  const [titelHinweis, setTitelHinweis] = useState(false);
  const [jahrFehler, setJahrFehler] = useState(false);
  const [cover, setCover] = useState<string | null>(null);
  const [menue, setMenue] = useState(false);
  const [schritt, setSchritt] = useState<Schritt>({ art: 'blatt' });
  const [versatz, setVersatz] = useState(0);
  const zug = useRef<{ start: number; strecke: number } | null>(null);
  const aktiv = useRef(true);
  const speichert = useRef(false);
  const kameraErgebnis = useRef<((bild: string | null) => void) | null>(null);

  useEffect(() => {
    aktiv.current = true;
    return () => {
      aktiv.current = false;
      kameraErgebnis.current?.(null);
    };
  }, []);

  const kameraBeenden = (bild: string | null) => {
    const r = kameraErgebnis.current;
    kameraErgebnis.current = null;
    if (bild === null) setSchritt({ art: 'blatt' });
    r?.(bild);
  };

  // Zurück-Taste: aus Kamera/Zuschnitt zurück ins Blatt, sonst Blatt ohne Speichern schließen.
  const verlassen = useZurueckTaste(() => {
    if (schritt.art === 'kamera') {
      kameraBeenden(null);
      return true;
    }
    if (schritt.art === 'zuschnitt') {
      setSchritt({ art: 'blatt' });
      return true;
    }
    if (menue) setMenue(false);
    onZurueck();
    return false;
  });

  const schliessen = () => {
    verlassen();
    onZurueck();
  };

  const aendern = (feld: keyof Eingaben, wert: string) => {
    setEingaben((alt) => ({ ...alt, [feld]: wert }));
    // Hinweis bzw. Hervorhebung verschwinden bei der nächsten Eingabe im jeweiligen Feld (REQ-031, AK-10/AK-14).
    if (feld === 'titel') setTitelHinweis(false);
    if (feld === 'jahr') setJahrFehler(false);
  };

  const hinzufuegen = async () => {
    if (speichert.current) return;
    const ohneTitel = titelFehlt(eingaben);
    const falschesJahr = jahrUngueltig(eingaben);
    setTitelHinweis(ohneTitel);
    setJahrFehler(falschesJahr);
    if (ohneTitel || falschesJahr) return;
    speichert.current = true;
    try {
      const buch = buchAusEingaben(eingaben, jetzt ? jetzt() : new Date());
      const repo = repository ?? (await standardRepository());
      await repo.save(buch);
      if (cover) {
        await bildspeicher.put(buch.id, 'cover', cover).catch((fehler: unknown) => {
          console.warn('Cover konnte nicht gespeichert werden:', fehler);
        });
      }
      if (!aktiv.current) return;
      verlassen();
      onAngelegt(buch);
    } finally {
      speichert.current = false;
    }
  };

  // Standard-Bildquelle: „Scannen“ zeigt die Kameraansicht der App (wie in den Buchdetails, REQ-016).
  const kameraAnzeigen = () =>
    new Promise<string | null>((resolve) => {
      kameraErgebnis.current = resolve;
      setSchritt({ art: 'kamera' });
    });
  const quelle = (): Bildquelle => bildquelle ?? standardBildquelle(kameraAnzeigen);

  const bildHolen = async (holen: () => Promise<string | null>) => {
    let bild: string | null = null;
    try {
      bild = await holen();
    } catch {
      bild = null;
    }
    if (!aktiv.current) return;
    // Abbruch: zurück ins Blatt, Eingaben und vorgemerktes Bild bleiben (REQ-032).
    setSchritt(bild ? { art: 'zuschnitt', bild } : { art: 'blatt' });
  };

  const aktion = async (a: MenueAktion) => {
    switch (a) {
      case 'scannen':
        setMenue(false);
        await bildHolen(() => quelle().scannen());
        return;
      case 'galerie':
        setMenue(false);
        await bildHolen(() => quelle().galerie());
        return;
      case 'online':
        // „Cover online suchen“: sichtbar, ohne Funktion – wie in den Buchdetails (REQ-015, REQ-032 AK-6).
        return;
      case 'entfernen':
        setCover(null);
        setMenue(false);
        return;
    }
  };

  const zuschnittBestaetigen = async (bild: string, ecken: Ecken) => {
    const ergebnis = await zuschneiden(bild, ecken, seitenverhaeltnis('cover')).catch(() => bild);
    if (!aktiv.current) return;
    setCover(ergebnis);
    setSchritt({ art: 'blatt' });
  };

  // Herunterziehen am Ziehgriff (REQ-030, AK-11); bloßes Antippen schließt nicht (AK-8).
  const zugStart = (e: ReactPointerEvent<HTMLDivElement>) => {
    zug.current = { start: e.clientY, strecke: 0 };
    e.currentTarget.setPointerCapture?.(e.pointerId);
  };
  const zugBewegen = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!zug.current) return;
    zug.current.strecke = Math.max(0, e.clientY - zug.current.start);
    setVersatz(zug.current.strecke);
  };
  const zugEnde = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!zug.current) return;
    // Maßgeblich ist die größere Strecke aus letzter Bewegung und Loslassen.
    const strecke = Math.max(zug.current.strecke, e.clientY - zug.current.start);
    zug.current = null;
    if (Number.isFinite(strecke) && strecke >= ZUG_SCHWELLE) {
      schliessen();
      return;
    }
    setVersatz(0);
  };
  const zugAbbrechen = () => {
    zug.current = null;
    setVersatz(0);
  };

  if (schritt.art === 'kamera') {
    return <KameraAnsicht onFoto={(bild) => kameraBeenden(bild)} onZurueck={() => kameraBeenden(null)} />;
  }
  if (schritt.art === 'zuschnitt') {
    const { bild } = schritt;
    return (
      <Zuschnitt
        bild={bild}
        bereich="cover"
        onBestaetigen={(ecken) => zuschnittBestaetigen(bild, ecken)}
        onZurueck={() => setSchritt({ art: 'blatt' })}
      />
    );
  }

  return (
    <div role="dialog" aria-modal="true" aria-label="Manueller Eintrag" data-sicherer-bereich="" style={blattStil(versatz)}>
      <div style={innenStil}>
        <div
          data-ziehgriff=""
          onPointerDown={zugStart}
          onPointerMove={zugBewegen}
          onPointerUp={zugEnde}
          onPointerCancel={zugAbbrechen}
          style={griffBereichStil}
        >
          <span style={griffStil} />
        </div>
        <div style={kopfStil}>
          <h2 style={ueberschriftStil}>
            Manueller Eintrag
          </h2>
          <button type="button" aria-label="Schließen" onClick={schliessen} style={schliessenStil}>
            <Icon datei="icon-x.png" url={iconX} farbe={buchAnlegenFarbe('schliessenIcon')} groesse={18} />
          </button>
        </div>

        <div style={coverBereichStil}>
          <button
            type="button"
            data-cover-hinzufuegen=""
            aria-label="Cover hinzufügen"
            onClick={() => setMenue(true)}
            style={coverFeldStil(cover !== null)}
          >
            {cover ? (
              <img data-cover-vorschau="" src={cover} alt="" style={coverBildStil} />
            ) : (
              <>
                <Icon datei="icon-kamera.png" url={iconKamera} farbe={buchAnlegenFarbe('coverFeldInhalt')} groesse={30} />
                <span>Cover hinzufügen</span>
              </>
            )}
          </button>
          {menue ? (
            <Auswahlmenue
              oben={COVER_HOEHE + 8}
              mitEntfernen={cover !== null}
              onAktion={(a) => void aktion(a)}
              onSchliessen={() => setMenue(false)}
            />
          ) : null}
        </div>

        <div data-formular-karte="" style={karteStil}>
          <Feld
            name="Titel"
            platzhalter="Buchtitel"
            wert={eingaben.titel}
            onWert={(w) => aendern('titel', w)}
            stil={zeileStil(false)}
          >
            {titelHinweis ? (
              <p role="alert" style={hinweisStil}>
                Bitte gib einen Titel ein
              </p>
            ) : null}
          </Feld>
          <Feld
            name="Autor"
            platzhalter="Autor"
            wert={eingaben.autor}
            onWert={(w) => aendern('autor', w)}
            stil={zeileStil(false)}
          />
          <div style={geteilteZeileStil}>
            <Feld
              name="Jahr"
              platzhalter="2024"
              wert={eingaben.jahr}
              onWert={(w) => aendern('jahr', jahrFiltern(w))}
              ziffern
              fehler={jahrFehler}
              stil={{
                flex: '1 1 0',
                minWidth: 0,
                padding: '14px 14px 14px 0',
                borderRight: `1px solid ${buchAnlegenFarbe('trennlinie')}`,
              }}
            />
            <Feld
              name="Seiten"
              platzhalter="496"
              wert={eingaben.seiten}
              onWert={(w) => aendern('seiten', seitenFiltern(w))}
              ziffern
              stil={{ flex: '1 1 0', minWidth: 0, padding: '14px 0 14px 14px' }}
            />
          </div>
          <div style={zeileStil(true)}>
            <span style={beschriftungStil(false)}>ERSCHEINUNGSDATUM</span>
            {/* Noch ohne Funktion (REQ-030, AK-6; To-do-Liste). */}
            <button type="button" data-erscheinungsdatum="" style={erscheinungsdatumStil}>
              + Erscheinungsdatum hinzufügen
            </button>
          </div>
        </div>

        <button type="button" data-hinzufuegen="" onClick={() => void hinzufuegen()} style={hinzufuegenStil}>
          Hinzufügen
        </button>
      </div>
    </div>
  );
}
