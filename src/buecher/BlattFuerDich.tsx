import { useEffect, useRef, useState, type CSSProperties, type PointerEvent as ReactPointerEvent } from 'react';
import { SCHREIBFENSTER_ZUG_SCHWELLE } from '@/buchdetails/reiter/rezension';
import { blattHinweisStil, sichernStil } from '@/buchdetails/BlattUnten';
import Symbolbild from '@/components/Symbolbild';
import { useZurueckTaste } from '@/plattform/zurueckTaste';
import { fensterStil, griffBereichStil, griffStil, hintergrundStil, kopfStil, listeStil, schliessenStil, titelStil, zeileNameStil, zeileStil } from '@/profil/blattStil';
import { Marke } from '@/profil/FensterDesign';
import { rezensionFarbe, stilRolle } from '@/theme';
import { sichtbareAbschnitte, type AbschnittDefinition } from './abschnitte';

/** Titel des Blatts (REQ-108). */
export const FUER_DICH_TITEL = '„Für dich“ anpassen';
/** Hinweis, wenn der letzte Haken entfernt werden soll (REQ-108 AK-5). */
export const MINDESTENS_EINER_HINWEIS = 'Mindestens ein Abschnitt muss sichtbar sein';
/** So lange bleibt der Hinweis sichtbar. */
export const FUER_DICH_HINWEIS_MS = 2500;

interface Props {
  /** Abschnitte der Seite „Bücher“ in Seitenreihenfolge (zentrale Liste). */
  abschnitte: readonly AbschnittDefinition[];
  /** Gespeicherte ausgeblendete Abschnitts-IDs. */
  ausgeblendet: readonly string[];
  /** Ob die gespeicherte Auswahl schon geladen ist; vorher ist „Speichern“ ohne Wirkung. */
  geladen?: boolean;
  /** „Speichern“: neue ausgeblendete IDs (nur bekannte Abschnitte). */
  onSpeichern: (ausgeblendet: string[]) => void;
  /** Schließen ohne Speichern (X, Zurück-Taste, Herunterziehen, Tippen außerhalb): Änderungen verwerfen. */
  onSchliessen: () => void;
}

/** Blatt „„Für dich“ anpassen“ (REQ-108): je Abschnitt ein Haken, „Speichern“ übernimmt dauerhaft. */
export default function BlattFuerDich({ abschnitte, ausgeblendet, geladen = true, onSpeichern, onSchliessen }: Props) {
  // Entwurf: `null`, solange der Nutzer nichts geändert hat – dann gilt immer die (ggf. später geladene)
  // gespeicherte Auswahl. Abschnitte ohne gespeicherte Auswahl gelten als sichtbar.
  const [geaendert, setGeaendert] = useState<Set<string> | null>(null);
  const gespeichert = new Set(sichtbareAbschnitte(abschnitte, ausgeblendet).map((a) => a.id));
  const entwurf = geaendert ?? gespeichert;
  const [hinweis, setHinweis] = useState(0);
  const [versatz, setVersatz] = useState(0);
  const zug = useRef<{ start: number; strecke: number } | null>(null);

  useEffect(() => {
    if (hinweis === 0) return;
    const t = setTimeout(() => setHinweis(0), FUER_DICH_HINWEIS_MS);
    return () => clearTimeout(t);
  }, [hinweis]);

  const verlassen = useZurueckTaste(() => {
    onSchliessen();
    return false;
  });
  const schliessen = () => {
    verlassen();
    onSchliessen();
  };
  const speichern = () => {
    // Vor dem Laden der gespeicherten Auswahl nichts überschreiben.
    if (!geladen) return;
    verlassen();
    onSpeichern(abschnitte.filter((a) => !entwurf.has(a.id)).map((a) => a.id));
  };

  const umschalten = (id: string) => {
    if (entwurf.has(id) && entwurf.size <= 1) {
      setHinweis((n) => n + 1);
      return;
    }
    const neu = new Set(entwurf);
    if (neu.has(id)) neu.delete(id);
    else neu.add(id);
    setGeaendert(neu);
  };

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
    const strecke = Math.max(zug.current.strecke, e.clientY - zug.current.start);
    zug.current = null;
    // Bloßes Antippen (Strecke unter der Schwelle) schließt nicht (AK-8).
    if (Number.isFinite(strecke) && strecke >= SCHREIBFENSTER_ZUG_SCHWELLE) {
      schliessen();
      return;
    }
    setVersatz(0);
  };
  const zugAbbrechen = () => {
    zug.current = null;
    setVersatz(0);
  };

  return (
    <>
      <div data-fuer-dich-hintergrund="" onClick={schliessen} style={hintergrundStil} />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={FUER_DICH_TITEL}
        data-blatt-fuer-dich=""
        {...stilRolle('blatt')}
        style={fensterStil(versatz)}
      >
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
          <h2 data-fuer-dich-titel="" style={titelStil}>
            {FUER_DICH_TITEL}
          </h2>
          <button type="button" aria-label="Schließen" data-fuer-dich-schliessen="" onClick={schliessen} style={schliessenStil}>
            <Symbolbild name="schliessen" farbe={rezensionFarbe('schliessenIcon')} groesse={18} />
          </button>
        </div>

        <div role="group" aria-label="Abschnitte in „Für dich“" data-fuer-dich-liste="" style={listeStil}>
          {abschnitte.map((a) => {
            const an = entwurf.has(a.id);
            return (
              <button
                key={a.id}
                type="button"
                role="checkbox"
                aria-checked={an}
                data-fuer-dich-abschnitt={a.id}
                data-aktiv={an ? 'true' : 'false'}
                onClick={() => umschalten(a.id)}
                {...stilRolle('eintrag')}
                style={zeileStil(an)}
              >
                <span data-fuer-dich-name="" style={zeileNameStil}>
                  {a.titel}
                </span>
                <Marke aktiv={an} />
              </button>
            );
          })}
        </div>

        {hinweis > 0 ? (
          <p role="status" data-fuer-dich-hinweis="" style={hinweisStil}>
            {MINDESTENS_EINER_HINWEIS}
          </p>
        ) : null}

        <button type="button" data-fuer-dich-speichern="" aria-disabled={!geladen} onClick={speichern} style={sichernStil}>
          Speichern
        </button>
      </div>
    </>
  );
}

const hinweisStil: CSSProperties = { ...blattHinweisStil, textAlign: 'center' };
