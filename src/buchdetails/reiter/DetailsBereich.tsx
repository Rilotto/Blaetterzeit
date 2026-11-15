import type { CSSProperties, ReactNode } from 'react';
import {
  PREIS_LEER,
  exemplarText,
  formatText,
  hinzugefuegtText,
  preisText,
  sonderausgabeText,
} from '@/domain/ausgabe';
import type { Buch } from '@/domain/buch';
import { detailsFarbe } from '@/theme';
import { RAND } from '../masse';
import { abschnittKopfStil, abschnittUeberschriftStil, karteStil } from './rezension';

/** Zeilen der Karte „Ausgabe“ (REQ-056); Schlüssel als data-ausgabe-zeile. */
export type AusgabeZeile =
  | 'seiten'
  | 'format'
  | 'exemplar'
  | 'sonderausgabe'
  | 'fotos'
  | 'preis'
  | 'verlag'
  | 'erschienen'
  | 'isbn'
  | 'hinzugefuegt';

/** Zeilen mit Pfeil „›“ (REQ-056, AK-2). */
const MIT_PFEIL: readonly AusgabeZeile[] = ['seiten', 'format', 'exemplar', 'sonderausgabe', 'fotos', 'preis'];

interface Props {
  buch: Buch;
  /** Zeile „Seiten“ angetippt (REQ-057). */
  onSeiten: () => void;
  /** Zeile „Format“, „Exemplar“ oder „Sonderausgabe“ angetippt (REQ-058). */
  onFormat: () => void;
  /** Zeile „Preis“ angetippt (REQ-059). */
  onPreis: () => void;
}

// Überschriften wie REF-details-01/-02: normale Schreibweise, größer, Dunkelbraun (nicht Großbuchstaben wie „BEWERTUNG“).
const ueberschriftStil: CSSProperties = {
  ...abschnittUeberschriftStil,
  fontSize: '22px',
  fontWeight: 600,
  letterSpacing: 'normal',
  textTransform: 'none',
  color: detailsFarbe('ueberschrift'),
};

const bearbeitenStil: CSSProperties = {
  margin: '-8px -4px -8px 0',
  padding: '8px 4px',
  border: 'none',
  background: 'none',
  fontFamily: 'inherit',
  fontSize: '17px',
  color: detailsFarbe('bearbeiten'),
  cursor: 'pointer',
  WebkitTapHighlightColor: 'transparent',
};

const pillenStil: CSSProperties = { display: 'flex', flexWrap: 'wrap', gap: '8px', margin: `0 ${RAND}px` };

const pilleBasis: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '6px',
  boxSizing: 'border-box',
  minHeight: '34px',
  padding: '4px 14px',
  borderRadius: '17px',
  fontFamily: 'inherit',
  fontSize: '15px',
  fontWeight: 600,
  lineHeight: 1.2,
};

const gefuelltStil: CSSProperties = {
  ...pilleBasis,
  backgroundColor: detailsFarbe('pilleGefuelltFlaeche'),
  color: detailsFarbe('pilleGefuelltSchrift'),
};

const gestricheltStil: CSSProperties = {
  ...pilleBasis,
  margin: 0,
  border: `1.5px dashed ${detailsFarbe('pilleGestricheltRahmen')}`,
  background: 'none',
  color: detailsFarbe('pilleGestricheltSchrift'),
  cursor: 'pointer',
  WebkitTapHighlightColor: 'transparent',
};

const sammlungStil: CSSProperties = {
  ...pilleBasis,
  margin: `0 ${RAND}px`,
  border: `1.5px solid ${detailsFarbe('sammlungRahmen')}`,
  background: 'none',
  fontWeight: 500,
  color: detailsFarbe('sammlungSchrift'),
  cursor: 'pointer',
  WebkitTapHighlightColor: 'transparent',
};

const karteDetails: CSSProperties = {
  ...karteStil,
  padding: '0 16px 0 20px',
  border: `2px solid ${detailsFarbe('karteRahmen')}`,
  backgroundColor: detailsFarbe('karteFlaeche'),
};

const zeileStil = (letzte: boolean, antippbar: boolean): CSSProperties => ({
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  boxSizing: 'border-box',
  width: '100%',
  minHeight: '54px',
  margin: 0,
  padding: '10px 0',
  border: 'none',
  borderBottom: letzte ? 'none' : `1.5px solid ${detailsFarbe('trennlinie')}`,
  background: 'none',
  fontFamily: 'inherit',
  textAlign: 'left',
  cursor: antippbar ? 'pointer' : 'default',
  WebkitTapHighlightColor: 'transparent',
});

const bezeichnungStil: CSSProperties = {
  flex: '0 0 auto',
  fontSize: '18px',
  color: detailsFarbe('zeileBezeichnung'),
};

const wertStil = (hervorgehoben: boolean): CSSProperties => ({
  flex: '1 1 auto',
  minWidth: 0,
  textAlign: 'right',
  fontSize: '16px',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
  color: hervorgehoben ? detailsFarbe('preisLeer') : detailsFarbe('zeileWert'),
});

const pfeilStil: CSSProperties = { flex: '0 0 auto', fontSize: '22px', lineHeight: 1, color: detailsFarbe('zeilePfeil') };

function Abschnitt({ id, titel, bearbeiten, children }: { id: string; titel: string; bearbeiten?: boolean; children: ReactNode }) {
  return (
    <section aria-label={titel} data-details-abschnitt={id}>
      <div style={abschnittKopfStil}>
        <h2 data-abschnitt-ueberschrift="" style={ueberschriftStil}>
          {titel}
        </h2>
        {bearbeiten ? (
          // „Bearbeiten“: sichtbar, ohne Funktion (REQ-051, AK-3).
          <button type="button" data-details-bearbeiten={id} style={bearbeitenStil}>
            Bearbeiten
          </button>
        ) : null}
      </div>
      {children}
    </section>
  );
}

/** Gefüllte Pillen bzw. gestrichelte Pille ohne Funktion (REQ-052, REQ-053). */
function Pillen({ id, namen, leerText }: { id: string; namen: string[] | undefined; leerText: string }) {
  return (
    <div style={pillenStil} data-pillen={id}>
      {namen && namen.length > 0 ? (
        namen.map((n) => (
          <span key={n} data-pille-gefuellt="" style={gefuelltStil}>
            {n}
          </span>
        ))
      ) : (
        <button type="button" data-pille-gestrichelt="" style={gestricheltStil}>
          {`+ ${leerText}`}
        </button>
      )}
    </div>
  );
}

function Zeile({
  id,
  bezeichnung,
  wert,
  letzte = false,
  hervorgehoben = false,
  onAntippen,
}: {
  id: AusgabeZeile;
  bezeichnung: string;
  wert: string;
  letzte?: boolean;
  hervorgehoben?: boolean;
  onAntippen?: () => void;
}) {
  const pfeil = MIT_PFEIL.includes(id);
  return (
    <button type="button" data-ausgabe-zeile={id} onClick={onAntippen} style={zeileStil(letzte, Boolean(onAntippen))}>
      <span data-zeile-bezeichnung="" style={bezeichnungStil}>
        {bezeichnung}
      </span>
      <span data-zeile-wert="" style={wertStil(hervorgehoben)}>
        {wert}
      </span>
      {pfeil ? (
        <span data-zeile-pfeil="" aria-hidden="true" style={pfeilStil}>
          ›
        </span>
      ) : null}
    </button>
  );
}

/** Reiter „Details“ (REQ-051 bis REQ-056). */
export default function DetailsBereich({ buch, onSeiten, onFormat, onPreis }: Props) {
  const erschienen = buch.erscheinungsjahr ?? (buch.erscheinungsdatum ? Number(buch.erscheinungsdatum.slice(6)) : undefined);
  return (
    <div style={{ paddingBottom: '8px' }}>
      <Abschnitt id="genres" titel="Genres" bearbeiten>
        <Pillen id="genres" namen={buch.genres} leerText="Genres hinzufügen" />
      </Abschnitt>
      <Abschnitt id="tropes" titel="Tropes" bearbeiten>
        <Pillen id="tropes" namen={buch.tropes} leerText="Tropes hinzufügen" />
      </Abschnitt>
      <Abschnitt id="inhaltswarnungen" titel="Inhaltswarnungen" bearbeiten>
        <Pillen id="inhaltswarnungen" namen={buch.inhaltswarnungen} leerText="Warnungen markieren" />
      </Abschnitt>
      <Abschnitt id="sammlungen" titel="Sammlungen und Bibliotheken">
        {/* Beides sichtbar, ohne Funktion; kein Bibliotheksname (REQ-055). */}
        <button type="button" data-sammlung-hinzufuegen="" style={sammlungStil}>
          Zu einer Sammlung hinzufügen
        </button>
        <div style={{ ...karteDetails, marginTop: '12px' }}>
          <button type="button" data-in-bibliotheken="" style={zeileStil(true, false)}>
            <span style={bezeichnungStil}>In Bibliotheken</span>
            <span style={wertStil(false)} />
            <span aria-hidden="true" style={pfeilStil}>
              ›
            </span>
          </button>
        </div>
      </Abschnitt>
      <Abschnitt id="ausgabe" titel="Ausgabe">
        <div data-ausgabe-karte="" style={karteDetails}>
          <Zeile id="seiten" bezeichnung="Seiten" wert={buch.seitenanzahl !== undefined ? String(buch.seitenanzahl) : ''} onAntippen={onSeiten} />
          <Zeile id="format" bezeichnung="Format" wert={formatText(buch)} onAntippen={onFormat} />
          <Zeile id="exemplar" bezeichnung="Exemplar" wert={exemplarText(buch)} onAntippen={onFormat} />
          <Zeile id="sonderausgabe" bezeichnung="Sonderausgabe" wert={sonderausgabeText(buch)} onAntippen={onFormat} />
          <Zeile id="fotos" bezeichnung="Fotos" wert="Cover" />
          <Zeile
            id="preis"
            bezeichnung="Preis"
            wert={buch.preisCent !== undefined ? preisText(buch.preisCent) : PREIS_LEER}
            hervorgehoben={buch.preisCent === undefined}
            onAntippen={onPreis}
          />
          <Zeile id="verlag" bezeichnung="Verlag" wert="" />
          <Zeile id="erschienen" bezeichnung="Erschienen" wert={erschienen !== undefined && !Number.isNaN(erschienen) ? String(erschienen) : ''} />
          <Zeile id="isbn" bezeichnung="ISBN" wert="" />
          <Zeile id="hinzugefuegt" bezeichnung="Hinzugefügt" wert={hinzugefuegtText(buch.eingetragenAm)} letzte />
        </div>
      </Abschnitt>
    </div>
  );
}
