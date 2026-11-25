import { useCallback, useEffect, useState, type CSSProperties } from 'react';
import iconPlus from '@/assets/icons/icon-plus.png';
import Icon from '@/components/Icon';
import { anlegeZeitpunkt, seitenText, zitatAnzeige, zitatMitWerten, zitatPruefen, zitateSortiert, type Zitat, type ZitatEingabe } from '@/domain/zitat';
import type { ZitatRepository } from '@/storage';
import { abstand, fortschrittFarbe, notizbuchFarbe, pillenhoehePx, stilRolle, textstufe } from '@/theme';
import BlattUnten, { blattEingabeStil, sichernStil } from '../BlattUnten';
import { RAND } from '../masse';
import { gestricheltStil, karteDetails, ueberschriftStil } from './DetailsBereich';
import { abschnittKopfStil } from './rezension';

interface Props {
  buchId: string;
  repository: ZitatRepository;
  /** Aktuelle Zeit (Reihenfolge des Anlegens); in Tests ersetzbar. */
  jetzt: () => Date;
  /** Nach jeder Änderung (z. B. damit die Startseite das Zitat des Tages neu wählt). */
  onGeaendert?: () => void;
  /** Bereits geladene Zitate dieses Buches (Anzeige sofort, danach wird neu gelesen). */
  vorab?: Zitat[];
}

type Blatt = null | { art: 'neu' } | { art: 'aendern'; zitat: Zitat } | { art: 'rueckfrage'; zitat: Zitat };

/** Platzhalter der Felder im Blatt „Zitat“ (REQ-105, CEO 2026-11-24). */
export const ZITAT_PLATZHALTER = { text: 'Was soll bleiben?', sprecher: 'Xaden', seite: '214' } as const;

const plusStil: CSSProperties = {
  flex: '0 0 auto',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: `${pillenhoehePx}px`,
  height: `${pillenhoehePx}px`,
  margin: 0,
  padding: 0,
  border: 'none',
  borderRadius: '50%',
  backgroundColor: notizbuchFarbe('plusFlaeche'),
  cursor: 'pointer',
  WebkitTapHighlightColor: 'transparent',
};

const listeStil: CSSProperties = { ...karteDetails, margin: `0 ${RAND}px`, padding: `0 ${abstand('l')}`, listStyle: 'none' };

const eintragStil = (letzter: boolean): CSSProperties => ({
  display: 'block',
  boxSizing: 'border-box',
  width: '100%',
  margin: 0,
  padding: `${abstand('m')} 0`,
  border: 'none',
  borderBottom: letzter ? 'none' : `1.5px solid ${notizbuchFarbe('trennlinie')}`,
  background: 'none',
  fontFamily: 'inherit',
  textAlign: 'left',
  cursor: 'pointer',
  WebkitTapHighlightColor: 'transparent',
});

const zitatTextStil: CSSProperties = {
  margin: 0,
  ...textstufe('text'),
  fontStyle: 'italic',
  whiteSpace: 'pre-wrap',
  overflowWrap: 'break-word',
  color: notizbuchFarbe('zitatText'),
};

const quelleStil: CSSProperties = { display: 'flex', gap: abstand('s'), marginTop: abstand('xs'), ...textstufe('meta') };

const feldBeschriftungStil: CSSProperties = {
  display: 'block',
  marginTop: abstand('m'),
  ...textstufe('meta'),
  fontWeight: 600,
  color: fortschrittFarbe('blattUntertitel'),
};

const fehlerRahmen = (fehler: boolean): CSSProperties =>
  fehler ? { border: `2px solid ${notizbuchFarbe('feldFehler')}`, color: notizbuchFarbe('feldFehler') } : {};

const loeschenStil: CSSProperties = {
  display: 'block',
  width: '100%',
  margin: `${abstand('s')} 0 ${abstand('xs')}`,
  padding: abstand('m'),
  border: 'none',
  background: 'none',
  fontFamily: 'inherit',
  ...textstufe('text'),
  fontWeight: 600,
  color: notizbuchFarbe('loeschenSchrift'),
  cursor: 'pointer',
};

const abbrechenStil: CSSProperties = {
  ...sichernStil,
  marginTop: abstand('s'),
  backgroundColor: fortschrittFarbe('schliessenFlaeche'),
  color: fortschrittFarbe('blattUeberschrift'),
  boxShadow: 'none',
};

/** Sprecher und Seite unter dem Zitat, soweit vorhanden (REQ-105). */
export function ZitatQuelle({ zitat, buchtitel }: { zitat: Zitat; buchtitel?: string }) {
  if (!buchtitel && zitat.sprecher === undefined && zitat.seite === undefined) return null;
  return (
    <span data-zitat-quelle="" style={quelleStil}>
      {buchtitel ? (
        <span data-zitat-buch="" style={{ color: notizbuchFarbe('sprecher'), fontWeight: 600 }}>
          {buchtitel}
        </span>
      ) : null}
      {zitat.sprecher !== undefined ? (
        <span data-zitat-sprecher="" style={{ color: notizbuchFarbe('sprecher') }}>
          {zitat.sprecher}
        </span>
      ) : null}
      {zitat.seite !== undefined ? (
        <span data-zitat-seite="" style={{ color: notizbuchFarbe('seite') }}>
          {seitenText(zitat.seite)}
        </span>
      ) : null}
    </span>
  );
}

/** Blatt „Zitat“ (REQ-105): Zitat (mehrzeilig, Pflicht), „Wer sagt es?“, Seite, „Sichern“, beim Ändern „Zitat löschen“. */
function BlattZitat({
  start,
  onSichern,
  onLoeschen,
  onSchliessen,
}: {
  start?: Zitat;
  onSichern: (werte: { text: string; sprecher?: string; seite?: number }) => void;
  onLoeschen?: () => void;
  onSchliessen: () => void;
}) {
  const [eingabe, setEingabe] = useState<ZitatEingabe>({
    text: start?.text ?? '',
    sprecher: start?.sprecher ?? '',
    seite: start?.seite !== undefined ? String(start.seite) : '',
  });
  const [fehler, setFehler] = useState({ text: false, seite: false });
  const aendern = (feld: keyof ZitatEingabe, wert: string) => {
    setEingabe((e) => ({ ...e, [feld]: wert }));
    if (feld !== 'sprecher') setFehler((f) => ({ ...f, [feld]: false }));
  };
  const sichern = () => {
    const p = zitatPruefen(eingabe);
    if (!p.ok) {
      setFehler(p.fehler);
      return;
    }
    onSichern(p.werte);
  };
  return (
    <BlattUnten titel="Zitat" onSchliessen={onSchliessen}>
      <label style={feldBeschriftungStil}>
        Zitat
        <textarea
          aria-label="Zitat"
          data-zitat-feld="text"
          data-fehler={fehler.text ? 'true' : undefined}
          aria-invalid={fehler.text ? true : undefined}
          placeholder={ZITAT_PLATZHALTER.text}
          value={eingabe.text}
          rows={4}
          onChange={(e) => aendern('text', e.target.value)}
          style={{
            ...blattEingabeStil,
            height: 'auto',
            minHeight: '112px',
            marginTop: abstand('xs'),
            padding: abstand('m'),
            textAlign: 'left',
            resize: 'vertical',
            ...fehlerRahmen(fehler.text),
          }}
        />
      </label>
      <label style={feldBeschriftungStil}>
        Wer sagt es?
        <input
          type="text"
          aria-label="Wer sagt es?"
          data-zitat-feld="sprecher"
          autoComplete="off"
          placeholder={ZITAT_PLATZHALTER.sprecher}
          value={eingabe.sprecher}
          onChange={(e) => aendern('sprecher', e.target.value)}
          style={{ ...blattEingabeStil, marginTop: abstand('xs') }}
        />
      </label>
      <label style={feldBeschriftungStil}>
        Seite
        <input
          type="text"
          inputMode="numeric"
          aria-label="Seite"
          data-zitat-feld="seite"
          autoComplete="off"
          data-fehler={fehler.seite ? 'true' : undefined}
          aria-invalid={fehler.seite ? true : undefined}
          placeholder={ZITAT_PLATZHALTER.seite}
          value={eingabe.seite}
          onChange={(e) => aendern('seite', e.target.value)}
          style={{ ...blattEingabeStil, marginTop: abstand('xs'), ...fehlerRahmen(fehler.seite) }}
        />
      </label>
      <button type="button" data-blatt-sichern="zitat" onClick={sichern} style={sichernStil}>
        Sichern
      </button>
      {onLoeschen ? (
        <button type="button" data-zitat-loeschen="" onClick={onLoeschen} style={loeschenStil}>
          Zitat löschen
        </button>
      ) : null}
    </BlattUnten>
  );
}

/**
 * Reiter „Notizbuch“ (REQ-105): Abschnitt „Zitate“. Ohne Zitate die gestrichelte Pille „+ Zitat hinzufügen“, sonst
 * die Zitate nach Seite (ohne Seite am Ende) und ein „+“. Antippen eines Zitats öffnet das Blatt zum Ändern bzw. Löschen.
 * Speicherzugriff nur über das ZitatRepository (ADR-0002).
 */
export default function Notizbuch({ buchId, repository, jetzt, onGeaendert, vorab }: Props) {
  const [zitate, setZitate] = useState<Zitat[] | undefined>(vorab);
  const [blatt, setBlatt] = useState<Blatt>(null);

  const laden = useCallback(async () => {
    try {
      return await repository.vonBuch(buchId);
    } catch (fehler) {
      console.warn('Zitate konnten nicht geladen werden:', fehler);
      return [];
    }
  }, [repository, buchId]);

  useEffect(() => {
    let aktiv = true;
    void laden().then((z) => {
      if (aktiv) setZitate(z);
    });
    return () => {
      aktiv = false;
    };
  }, [laden]);

  const nachAenderung = async () => {
    setZitate(await laden());
    onGeaendert?.();
  };

  const sichern = async (werte: { text: string; sprecher?: string; seite?: number }) => {
    const aktuell = blatt;
    if (aktuell === null || aktuell.art === 'rueckfrage') return;
    const basis =
      aktuell.art === 'aendern'
        ? aktuell.zitat
        : { id: crypto.randomUUID(), buchId, angelegtAm: anlegeZeitpunkt(zitate ?? [], jetzt()) };
    setBlatt(null);
    try {
      await repository.speichern(zitatMitWerten(basis, werte));
    } catch (fehler) {
      console.warn('Zitat konnte nicht gespeichert werden:', fehler);
    }
    await nachAenderung();
  };

  const loeschen = async (zitat: Zitat) => {
    setBlatt(null);
    try {
      await repository.entfernen(zitat.id);
    } catch (fehler) {
      console.warn('Zitat konnte nicht gelöscht werden:', fehler);
    }
    await nachAenderung();
  };

  const liste = zitateSortiert(zitate ?? []);
  return (
    <section aria-label="Zitate" data-notizbuch-abschnitt="zitate">
      <div style={abschnittKopfStil}>
        <h2 data-abschnitt-ueberschrift="" style={ueberschriftStil}>
          Zitate
        </h2>
        {liste.length > 0 ? (
          <button type="button" aria-label="Weiteres Zitat hinzufügen" data-zitat-plus="" onClick={() => setBlatt({ art: 'neu' })} style={plusStil}>
            <Icon datei="icon-plus.png" url={iconPlus} farbe={notizbuchFarbe('plusIcon')} groesse={20} />
          </button>
        ) : null}
      </div>
      {zitate === undefined ? null : liste.length === 0 ? (
        <div style={{ margin: `0 ${RAND}px` }}>
          <button type="button" data-pille-gestrichelt="" data-zitat-hinzufuegen="" onClick={() => setBlatt({ art: 'neu' })} style={gestricheltStil}>
            + Zitat hinzufügen
          </button>
        </div>
      ) : (
        <ul data-zitate="" {...stilRolle('karte')} style={listeStil}>
          {liste.map((z, i) => (
            <li key={z.id} data-zitat={z.id}>
              <button type="button" onClick={() => setBlatt({ art: 'aendern', zitat: z })} {...stilRolle('eintrag')} style={eintragStil(i === liste.length - 1)}>
                <span data-zitat-text="" style={{ ...zitatTextStil, display: 'block' }}>
                  {zitatAnzeige(z.text)}
                </span>
                <ZitatQuelle zitat={z} />
              </button>
            </li>
          ))}
        </ul>
      )}
      {blatt?.art === 'neu' ? <BlattZitat onSichern={(w) => void sichern(w)} onSchliessen={() => setBlatt(null)} /> : null}
      {blatt?.art === 'aendern' ? (
        <BlattZitat
          start={blatt.zitat}
          onSichern={(w) => void sichern(w)}
          onLoeschen={() => setBlatt({ art: 'rueckfrage', zitat: blatt.zitat })}
          onSchliessen={() => setBlatt(null)}
        />
      ) : null}
      {blatt?.art === 'rueckfrage' ? (
        <BlattUnten titel="Zitat löschen?" onSchliessen={() => setBlatt(null)}>
          <p data-rueckfrage="" style={{ margin: `${abstand('s')} 0 0`, ...textstufe('text'), textAlign: 'center', color: fortschrittFarbe('blattUeberschrift') }}>
            Dieses Zitat wirklich löschen?
          </p>
          <button type="button" data-loeschen-bestaetigen="" onClick={() => void loeschen(blatt.zitat)} style={sichernStil}>
            Löschen
          </button>
          <button type="button" data-loeschen-abbrechen="" onClick={() => setBlatt(null)} style={abbrechenStil}>
            Abbrechen
          </button>
        </BlattUnten>
      ) : null}
    </section>
  );
}
