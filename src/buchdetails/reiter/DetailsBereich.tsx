import type { CSSProperties, ReactNode } from 'react';
import { masseVorschlagText } from '@/buchdetails/masse';
import {
  PREIS_LEER,
  beendetText,
  erschienenText,
  exemplarText,
  formatText,
  hatMasse,
  hinzugefuegtText,
  masseText,
  preisText,
  sonderausgabeText,
} from '@/domain/ausgabe';
import type { Buch } from '@/domain/buch';
import { LISTENARTEN, listenDesBuches, listenNamenText, type Liste, type ListenArt, type Zugehoerigkeit } from '@/domain/listen';
import { detailsFarbe, textstufe, kartenSchatten, abstand, bildschirmrand, stilRolle } from '@/theme';
import { RAND } from '../masse';
import { abschnittKopfStil, abschnittUeberschriftStil, karteStil } from './rezension';

/** Zeilen der Karte „Ausgabe“ (REQ-056); Schlüssel als data-ausgabe-zeile. */
export type AusgabeZeile =
  | 'seiten'
  | 'format'
  | 'masse'
  | 'exemplar'
  | 'sonderausgabe'
  | 'fotos'
  | 'preis'
  | 'verlag'
  | 'erschienen'
  | 'isbn'
  | 'hinzugefuegt'
  | 'beendet';

/** Alle Zeilen der Karte „Ausgabe“ haben einen Pfeil „›“ (REQ-091, REQ-056), auch im Manuellen Eintrag. */

interface Props {
  buch: Buch;
  /** Zeile „Seiten“ angetippt (REQ-057). */
  onSeiten: () => void;
  /** Zeile „Format“, „Exemplar“ oder „Sonderausgabe“ angetippt (REQ-058). */
  onFormat: () => void;
  /** Zeile „Preis“ angetippt (REQ-059). */
  onPreis: () => void;
  /** Zeile „Maße“ angetippt (REQ-072). */
  onMasse?: () => void;
  /** Zeile „Verlag“ bzw. „ISBN“ angetippt (REQ-063). */
  onVerlag?: () => void;
  onIsbn?: () => void;
  /** Zeile „Hinzugefügt“ angetippt (REQ-064). */
  onHinzugefuegt?: () => void;
  /** Zeile „Beendet am“ angetippt (REQ-085). */
  onBeendet?: () => void;
  /** Zeile „Erschienen“ angetippt (REQ-092). */
  onErschienen?: () => void;
  /** Abschnitt „Sagas, Sammlungen und Bibliotheken“ (REQ-095). */
  listen?: ListenAbschnittProps;
}

/** Daten und Aktionen des Abschnitts „Sagas, Sammlungen und Bibliotheken“ (REQ-095). */
export interface ListenAbschnittProps {
  listen: Liste[];
  zug: Zugehoerigkeit[];
  /** Pille „+ Zu einer … hinzufügen“ angetippt: Blatt (REQ-096). */
  onPille: (art: ListenArt) => void;
  /** Zeile „In Saga/Sammlung/Bibliotheken“ angetippt: Listenübersicht (REQ-097). */
  onZeile: (art: ListenArt) => void;
}

// Überschriften wie REF-details-01/-02: normale Schreibweise, größer, Dunkelbraun (nicht Großbuchstaben wie „BEWERTUNG“).
export const ueberschriftStil: CSSProperties = {
  ...abschnittUeberschriftStil,
  ...textstufe('abschnitt'),
  fontWeight: 600,
  letterSpacing: 'normal',
  textTransform: 'none',
  color: detailsFarbe('ueberschrift'),
};

const bearbeitenStil: CSSProperties = {
  margin: `calc(-1 * ${abstand('s')}) calc(-1 * ${abstand('xs')}) calc(-1 * ${abstand('s')}) 0`,
  padding: `${abstand('s')} ${abstand('xs')}`,
  border: 'none',
  background: 'none',
  fontFamily: 'inherit',
  ...textstufe('text'),
  color: detailsFarbe('bearbeiten'),
  cursor: 'pointer',
  WebkitTapHighlightColor: 'transparent',
};

const pillenStil: CSSProperties = { display: 'flex', flexWrap: 'wrap', gap: abstand('s'), margin: `0 ${RAND}px` };

const pilleBasis: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: abstand('s'),
  boxSizing: 'border-box',
  minHeight: '34px',
  padding: `${abstand('xs')} ${abstand('m')}`,
  borderRadius: '17px',
  fontFamily: 'inherit',
  ...textstufe('text'),
  fontWeight: 600,
  lineHeight: 1.2,
};

const gefuelltStil: CSSProperties = {
  ...pilleBasis,
  backgroundColor: detailsFarbe('pilleGefuelltFlaeche'),
  color: detailsFarbe('pilleGefuelltSchrift'),
};

export const gestricheltStil: CSSProperties = {
  ...pilleBasis,
  margin: 0,
  border: `1.5px dashed ${detailsFarbe('pilleGestricheltRahmen')}`,
  background: 'none',
  color: detailsFarbe('pilleGestricheltSchrift'),
  cursor: 'pointer',
  WebkitTapHighlightColor: 'transparent',
};

// Pillen des Abschnitts „Sagas, Sammlungen und Bibliotheken“: untereinander, linksbündig (REQ-095).
const listenPillenStil: CSSProperties = { display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: abstand('s'), margin: `0 ${RAND}px` };

export const karteDetails: CSSProperties = {
  ...karteStil,
  padding: `0 ${abstand('l')} 0 ${bildschirmrand}`,
  // Weicher, warmer Schatten statt hartem Rahmen (REQ-065 AK-11).
  border: 'none',
  boxShadow: kartenSchatten,
  backgroundColor: detailsFarbe('karteFlaeche'),
};

export const zeileStil = (letzte: boolean, antippbar: boolean, trennlinieOben = false): CSSProperties => ({
  display: 'flex',
  alignItems: 'center',
  gap: abstand('m'),
  boxSizing: 'border-box',
  width: '100%',
  minHeight: '54px',
  margin: 0,
  padding: `${abstand('s')} 0`,
  border: 'none',
  ...(trennlinieOben ? { borderTop: `1.5px solid ${detailsFarbe('trennlinie')}` } : {}),
  borderBottom: letzte ? 'none' : `1.5px solid ${detailsFarbe('trennlinie')}`,
  background: 'none',
  fontFamily: 'inherit',
  textAlign: 'left',
  cursor: antippbar ? 'pointer' : 'default',
  WebkitTapHighlightColor: 'transparent',
});

export const bezeichnungStil: CSSProperties = {
  flex: '0 0 auto',
  ...textstufe('text'),
  color: detailsFarbe('zeileBezeichnung'),
};

export const wertStil = (hervorgehoben: boolean): CSSProperties => ({
  flex: '1 1 auto',
  minWidth: 0,
  textAlign: 'right',
  ...textstufe('meta'),
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
  color: hervorgehoben ? detailsFarbe('preisLeer') : detailsFarbe('zeileWert'),
});

export const pfeilStil: CSSProperties = { flex: '0 0 auto', ...textstufe('titel'), lineHeight: 1, color: detailsFarbe('zeilePfeil') };

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

/**
 * Inhalt des Abschnitts „Sagas, Sammlungen und Bibliotheken“ (REQ-095): je Art ohne Zugehörigkeit eine gestrichelte
 * Pille (wie Genres/Tropes, REQ-052), je Art mit Zugehörigkeit die Zeile „In …“ mit den Namen und Pfeil.
 */
function ListenAbschnitt({ buch, daten }: { buch: Buch; daten?: ListenAbschnittProps }) {
  const arten = LISTENARTEN.map((a) => ({ a, drin: daten ? listenDesBuches(daten.listen, daten.zug, buch.id, a.id) : [] }));
  // Reihenfolge Saga, Sammlung, Bibliothek; aufeinanderfolgende Zeilen teilen sich eine Karte.
  const gruppen: { zeilen: boolean; arten: typeof arten }[] = [];
  for (const x of arten) {
    const zeile = x.drin.length > 0;
    const letzte = gruppen[gruppen.length - 1];
    if (letzte && letzte.zeilen === zeile) letzte.arten.push(x);
    else gruppen.push({ zeilen: zeile, arten: [x] });
  }
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: abstand('m') }}>
      {gruppen.map((g) =>
        g.zeilen ? (
          <div key={g.arten[0].a.id} data-listen-karte="" {...stilRolle('karte')} style={karteDetails}>
            {g.arten.map(({ a, drin }, i) => (
              <KartenZeile
                key={a.id}
                zeilenAttribute={{ 'data-listen-zeile': a.id }}
                beschriftung={a.zeile}
                wert={listenNamenText(drin)}
                pfeil
                letzte={i === g.arten.length - 1}
                onAntippen={() => daten?.onZeile(a.id)}
              />
            ))}
          </div>
        ) : (
          <div key={g.arten[0].a.id} style={listenPillenStil} data-pillen="listen">
            {g.arten.map(({ a }) => (
              <button key={a.id} type="button" data-pille-gestrichelt="" data-listen-pille={a.id} onClick={() => daten?.onPille(a.id)} style={gestricheltStil}>
                {a.pille}
              </button>
            ))}
          </div>
        ),
      )}
    </div>
  );
}

function Zeile({
  id,
  beschriftung,
  wert,
  letzte = false,
  trennlinieOben = false,
  hervorgehoben = false,
  vorschlag = false,
  onAntippen,
  eingabe,
  fehler = false,
}: {
  id: AusgabeZeile;
  beschriftung: string;
  wert: string;
  letzte?: boolean;
  trennlinieOben?: boolean;
  hervorgehoben?: boolean;
  /** Schätzwert „ca. …“: abgeschwächt und kursiv (REQ-072, AK-2). */
  vorschlag?: boolean;
  onAntippen?: () => void;
  /** Eingabefeld statt Wert (Seiten im Manuellen Eintrag, REQ-060). */
  eingabe?: ReactNode;
  /** Feld hervorgehoben wie ungültiges „JAHR“ (REQ-060, AK-5). */
  fehler?: boolean;
}) {
  const pfeil = true;
  if (eingabe !== undefined) {
    return (
      <label
        data-ausgabe-zeile={id}
        data-fehler={fehler ? 'true' : undefined}
        {...stilRolle('eintrag')}
        style={{
          ...zeileStil(letzte, true, trennlinieOben),
          cursor: 'text',
          ...(fehler ? { outline: `2px solid ${detailsFarbe('zeileFehler')}`, outlineOffset: '-2px', borderRadius: '10px' } : {}),
        }}
      >
        <span data-zeile-bezeichnung="" style={{ ...bezeichnungStil, ...(fehler ? { color: detailsFarbe('zeileFehler') } : {}) }}>
          {beschriftung}
        </span>
        {eingabe}
        {/* Pfeil an jeder Zeile, auch an der Eingabezeile „Seiten“ im Manuellen Eintrag (REQ-091, AK-3). */}
        <span data-zeile-pfeil="" aria-hidden="true" style={pfeilStil}>
          ›
        </span>
      </label>
    );
  }
  return (
    <KartenZeile
      zeilenAttribute={{ 'data-ausgabe-zeile': id }}
      beschriftung={beschriftung}
      wert={wert}
      hervorgehoben={hervorgehoben}
      vorschlag={vorschlag}
      pfeil={pfeil}
      letzte={letzte}
      trennlinieOben={trennlinieOben}
      onAntippen={onAntippen}
    />
  );
}

/**
 * Zeile einer Karte im Stil der Karte „Ausgabe“ (REQ-056): Bezeichnung links, Wert rechts, optional Pfeil,
 * Trennlinie außer bei der letzten Zeile. Auch im Profil › App verwendet (REQ-066).
 */
export function KartenZeile({
  zeilenAttribute,
  anzeigeAttribute,
  beschriftung,
  wert,
  hervorgehoben = false,
  vorschlag = false,
  pfeil = false,
  letzte = false,
  trennlinieOben = false,
  onAntippen,
}: {
  /** data-Attribute der Zeile (z. B. data-ausgabe-zeile). */
  zeilenAttribute: Record<`data-${string}`, string>;
  /** Optional: data-Attribute einer layoutneutralen Hülle um Wert und Pfeil. */
  anzeigeAttribute?: Record<`data-${string}`, string>;
  beschriftung: string;
  wert: string;
  hervorgehoben?: boolean;
  /** Schätzwert: Wert kursiv, data-zeile-vorschlag="true" (REQ-072, AK-2). */
  vorschlag?: boolean;
  pfeil?: boolean;
  letzte?: boolean;
  /** Trennlinie über statt unter der Zeile (Zeile „Beendet am“, REQ-085). */
  trennlinieOben?: boolean;
  onAntippen?: () => void;
}) {
  const wertUndPfeil = (
    <>
      <span
        data-zeile-wert=""
        data-zeile-vorschlag={vorschlag ? 'true' : undefined}
        style={vorschlag ? { ...wertStil(hervorgehoben), fontStyle: 'italic' } : wertStil(hervorgehoben)}
      >
        {wert}
      </span>
      {pfeil ? (
        <span data-zeile-pfeil="" aria-hidden="true" style={pfeilStil}>
          ›
        </span>
      ) : null}
    </>
  );
  return (
    <button type="button" {...zeilenAttribute} onClick={onAntippen} {...stilRolle('eintrag')} style={zeileStil(letzte, Boolean(onAntippen), trennlinieOben)}>
      <span data-zeile-bezeichnung="" style={bezeichnungStil}>
        {beschriftung}
      </span>
      {anzeigeAttribute ? (
        <span {...anzeigeAttribute} style={{ display: 'contents' }}>
          {wertUndPfeil}
        </span>
      ) : (
        wertUndPfeil
      )}
    </button>
  );
}

/** Angaben der Karte „Ausgabe“, die direkt aus dem Buch bzw. den Eingaben kommen. */
export type AusgabeAngaben = Pick<
  Buch,
  'format' | 'unterformat' | 'sonderausgabe' | 'exemplar' | 'preisCent' | 'verlag' | 'isbn' | 'breiteMm' | 'hoeheMm' | 'dickeMm' | 'seitenanzahl'
>;

export interface AusgabeKarteProps {
  angaben: AusgabeAngaben;
  /** Anzeigetexte der Zeilen Seiten, Erschienen und Hinzugefügt. */
  werte: { seiten?: string; erschienen?: string; hinzugefuegt?: string; /** Zeile „Beendet am“ nur mit Wert (REQ-085). */ beendet?: string };
  /** Antippen je Zeile; ohne Eintrag ist die Zeile ohne Funktion. */
  onZeile?: Partial<Record<AusgabeZeile, (() => void) | undefined>>;
  /** Ohne Zeile „Fotos“ (Manueller Eintrag, REQ-060, AK-1). */
  ohneFotos?: boolean;
  /** Eingabefeld in der Zeile „Seiten“ statt Wert (Manueller Eintrag, REQ-060). */
  seitenEingabe?: ReactNode;
  seitenFehler?: boolean;
}

/** Karte „Ausgabe“ (REQ-056), auch im Blatt „Manueller Eintrag“ verwendet (REQ-060). */
export function AusgabeKarte({ angaben, werte, onZeile = {}, ohneFotos = false, seitenEingabe, seitenFehler }: AusgabeKarteProps) {
  return (
    <div data-ausgabe-karte="" {...stilRolle('karte')} style={karteDetails}>
      <Zeile id="seiten" beschriftung="Seiten" wert={werte.seiten ?? ''} onAntippen={onZeile.seiten} eingabe={seitenEingabe} fehler={seitenFehler} />
      <Zeile id="format" beschriftung="Format" wert={formatText(angaben)} onAntippen={onZeile.format} />
      <Zeile
        id="masse"
        beschriftung="Maße"
        wert={hatMasse(angaben) ? masseText(angaben) : masseVorschlagText(angaben)}
        hervorgehoben={!hatMasse(angaben)}
        vorschlag={!hatMasse(angaben)}
        onAntippen={onZeile.masse}
      />
      <Zeile id="exemplar" beschriftung="Exemplar" wert={exemplarText(angaben)} onAntippen={onZeile.exemplar} />
      <Zeile id="sonderausgabe" beschriftung="Sonderausgabe" wert={sonderausgabeText(angaben)} onAntippen={onZeile.sonderausgabe} />
      {ohneFotos ? null : <Zeile id="fotos" beschriftung="Fotos" wert="Cover" />}
      <Zeile
        id="preis"
        beschriftung="Preis"
        wert={angaben.preisCent !== undefined ? preisText(angaben.preisCent) : PREIS_LEER}
        hervorgehoben={angaben.preisCent === undefined}
        onAntippen={onZeile.preis}
      />
      <Zeile id="verlag" beschriftung="Verlag" wert={angaben.verlag ?? ''} onAntippen={onZeile.verlag} />
      <Zeile id="erschienen" beschriftung="Erschienen" wert={werte.erschienen ?? ''} onAntippen={onZeile.erschienen} />
      <Zeile id="isbn" beschriftung="ISBN" wert={angaben.isbn ?? ''} onAntippen={onZeile.isbn} />
      {/* „Hinzugefügt“ bleibt ohne untere Trennlinie (gleicher Zeilenstil wie Profil › App, REQ-066); die Linie zu
          „Beendet am“ (REQ-085) trägt dessen Oberkante – optisch unverändert. */}
      <Zeile id="hinzugefuegt" beschriftung="Hinzugefügt" wert={werte.hinzugefuegt ?? ''} onAntippen={onZeile.hinzugefuegt} letzte />
      {werte.beendet === undefined ? null : (
        <Zeile id="beendet" beschriftung="Beendet am" wert={werte.beendet} onAntippen={onZeile.beendet} letzte trennlinieOben />
      )}
    </div>
  );
}

/** Reiter „Details“ (REQ-051 bis REQ-056, REQ-063, REQ-064). */
export default function DetailsBereich({ buch, onSeiten, onFormat, onPreis, onMasse, onVerlag, onIsbn, onHinzugefuegt, onBeendet, onErschienen, listen }: Props) {
  return (
    <div style={{ paddingBottom: abstand('s') }}>
      <Abschnitt id="genres" titel="Genres" bearbeiten>
        <Pillen id="genres" namen={buch.genres} leerText="Genres hinzufügen" />
      </Abschnitt>
      <Abschnitt id="tropes" titel="Tropes" bearbeiten>
        <Pillen id="tropes" namen={buch.tropes} leerText="Tropes hinzufügen" />
      </Abschnitt>
      <Abschnitt id="inhaltswarnungen" titel="Inhaltswarnungen" bearbeiten>
        <Pillen id="inhaltswarnungen" namen={buch.inhaltswarnungen} leerText="Warnungen markieren" />
      </Abschnitt>
      <Abschnitt id="sammlungen" titel="Sagas, Sammlungen und Bibliotheken">
        <ListenAbschnitt buch={buch} daten={listen} />
      </Abschnitt>
      <Abschnitt id="ausgabe" titel="Ausgabe">
        <AusgabeKarte
          werte={{
            seiten: buch.seitenanzahl !== undefined ? String(buch.seitenanzahl) : '',
            erschienen: erschienenText(buch),
            hinzugefuegt: hinzugefuegtText(buch.eingetragenAm),
            beendet: beendetText(buch.beendetAm),
          }}
          angaben={buch}
          onZeile={{
            seiten: onSeiten,
            format: onFormat,
            masse: onMasse,
            exemplar: onFormat,
            sonderausgabe: onFormat,
            preis: onPreis,
            verlag: onVerlag,
            isbn: onIsbn,
            hinzugefuegt: onHinzugefuegt,
            beendet: onBeendet,
            erschienen: onErschienen,
          }}
        />
      </Abschnitt>
    </div>
  );
}
