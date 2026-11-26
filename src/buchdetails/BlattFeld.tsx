import { useState, type ReactNode } from 'react';
import {
  beendetDatumText,
  datumFiltern,
  datumText,
  eintragungsdatumText,
  erschienenErgebnis,
  erschienenFiltern,
  hinzugefuegtPruefen,
  isbnFiltern,
  isbnGueltig,
} from '@/domain/ausgabe';
import { bandPruefen } from '@/domain/listen';
import { fortschrittFarbe, abstand } from '@/theme';
import BlattUnten, { blattEingabeStil, sichernStil } from './BlattUnten';

/** Ergebnis der Prüfung beim Sichern: gültiger Wert oder `null` (Feld wird hervorgehoben). */
export type FeldPruefung = (eingabe: string) => string | null;

export interface BlattFeldProps {
  /** Überschrift und Name des Dialogs. */
  titel: string;
  /** Kennung für data-blatt-feld, z. B. „verlag“. */
  kennung: string;
  /** Vorbefüllung des Feldes. */
  startWert: string;
  /** Wird bei jeder Eingabe angewendet (z. B. nur Ziffern). */
  filtern?: (wert: string) => string;
  /** Prüfung beim Sichern; ohne Angabe ist jede Eingabe gültig. */
  pruefen?: FeldPruefung;
  platzhalter?: string;
  inputMode?: 'text' | 'numeric';
  /** Großschreibung der Bildschirmtastatur, z. B. „characters“ für das „X“ der ISBN-10. */
  autoCapitalize?: 'off' | 'characters';
  maxLength?: number;
  /** Gültiger Wert gesichert. */
  onSichern: (wert: string) => void;
  /** X oder Tippen außerhalb: nichts speichern. */
  onSchliessen: () => void;
  /** Weitere Elemente unter „Sichern“ (z. B. „Liste löschen“, REQ-098). */
  unten?: ReactNode;
  /** Weitere Elemente zwischen Feld und „Sichern“ (z. B. Bildfeld „Liste bearbeiten“, REQ-100). */
  mitte?: ReactNode;
  /** Jede Eingabe (z. B. um den Entwurf über einen Zwischenschritt wie den Zuschnitt zu behalten). */
  onEingabe?: (wert: string) => void;
}

/**
 * Blatt mit einem Eingabefeld und der Pille „Sichern“ nach Muster des Menüs „Preis“ (REQ-059).
 * Ungültig: Feld in Primär hervorgehoben ohne Hinweistext, bis es geändert wird (REQ-063).
 * Leerbare Angaben liefern beim Sichern eines leeren Feldes '' – der Aufrufer entfernt dann die Angabe (REQ-093).
 */
export default function BlattFeld({
  titel,
  kennung,
  startWert,
  filtern = (w) => w,
  pruefen = (w) => w,
  platzhalter,
  inputMode = 'text',
  autoCapitalize,
  maxLength,
  onSichern,
  onSchliessen,
  unten,
  mitte,
  onEingabe,
}: BlattFeldProps) {
  const [eingabe, setEingabe] = useState(startWert);
  const [fehler, setFehler] = useState(false);

  const sichern = () => {
    const wert = pruefen(eingabe);
    if (wert === null) {
      setFehler(true);
      return;
    }
    onSichern(wert);
  };

  return (
    <BlattUnten titel={titel} onSchliessen={onSchliessen}>
      <input
        type="text"
        inputMode={inputMode}
        autoCapitalize={autoCapitalize}
        autoComplete="off"
        aria-label={titel}
        data-blatt-feld={kennung}
        data-fehler={fehler ? 'true' : undefined}
        aria-invalid={fehler ? true : undefined}
        maxLength={maxLength}
        placeholder={platzhalter}
        value={eingabe}
        onChange={(e) => {
          const w = filtern(e.target.value);
          setEingabe(w);
          onEingabe?.(w);
          setFehler(false);
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter') sichern();
        }}
        style={{
          ...blattEingabeStil,
          marginTop: abstand('m'),
          ...(fehler ? { border: `2px solid ${fortschrittFarbe('eingabeFehler')}`, color: fortschrittFarbe('eingabeFehler') } : {}),
        }}
      />
      {mitte}
      <button type="button" data-blatt-sichern={kennung} onClick={sichern} style={sichernStil}>
        Sichern
      </button>
      {unten}
    </BlattUnten>
  );
}

interface EinfachProps {
  onSichern: (wert: string) => void;
  onSchliessen: () => void;
}

/** Blatt „Verlag“ (REQ-063). Leer bzw. nur Leerzeichen sichern entfernt den Verlag (REQ-093). */
export function BlattVerlag({ verlag, ...rest }: EinfachProps & { verlag?: string }) {
  return <BlattFeld titel="Verlag" kennung="verlag" startWert={verlag ?? ''} platzhalter="Verlag" maxLength={200} pruefen={(w) => w.trim()} {...rest} />;
}

/**
 * Blatt „Band“ (REQ-112) nach Muster „Verlag“: Zahlenfeld mit der Bandnummer des Buches. Gültig ist eine ganze Zahl
 * ≥ 1; leer entfernt die Bandnummer (REQ-093). Ungültige Eingaben (0, -1, 1,5, Buchstaben) werden nicht gefiltert,
 * sondern beim Sichern hervorgehoben wie im Blatt „ISBN“ (REQ-063); es wird nichts gespeichert.
 */
export function BlattBand({ band, onSichern, onSchliessen }: { band?: number; onSichern: (band: number | undefined) => void; onSchliessen: () => void }) {
  return (
    <BlattFeld
      titel="Band"
      kennung="band"
      startWert={band !== undefined ? String(band) : ''}
      platzhalter="1"
      inputMode="numeric"
      maxLength={10}
      pruefen={(w) => {
        const p = bandPruefen(w);
        return p.ok ? (p.band === undefined ? '' : String(p.band)) : null;
      }}
      onSichern={(w) => onSichern(w === '' ? undefined : Number(w))}
      onSchliessen={onSchliessen}
    />
  );
}

/** Blatt „ISBN“ (REQ-063): nur Ziffern (und „X“ als zehnte Stelle), Prüfziffer wird beim Sichern geprüft; leer entfernt (REQ-093). */
export function BlattIsbn({ isbn, ...rest }: EinfachProps & { isbn?: string }) {
  return (
    <BlattFeld
      titel="ISBN"
      kennung="isbn"
      startWert={isbn ?? ''}
      platzhalter="9783551551672"
      // Textfeld statt Zahlentastatur, damit „X“ (ISBN-10) eingebbar ist; gefiltert wird weiterhin (REQ-063 AK-3).
      inputMode="text"
      autoCapitalize="characters"
      filtern={isbnFiltern}
      pruefen={(w) => (w === '' ? '' : isbnGueltig(w) ? w : null)}
      {...rest}
    />
  );
}

/** Blatt „Hinzugefügt“ (REQ-064): Datum TT.MM.JJJJ, vorbefüllt, nicht in der Zukunft. Liefert TT.MM.JJJJ. */
export function BlattHinzugefuegt({
  eingetragenAm,
  startDatum,
  jetzt,
  leerOhneDatum = false,
  leerbar = false,
  ...rest
}: EinfachProps & {
  eingetragenAm?: string;
  /** Vorbefüllung TT.MM.JJJJ (hat Vorrang). */
  startDatum?: string;
  jetzt: () => Date;
  /** Ohne Eintragungsdatum leer statt heute vorbefüllen (Buchdetails nach dem Leeren, REQ-093). */
  leerOhneDatum?: boolean;
  /** Leeres Feld ist gültig und liefert '' (Buchdetails, REQ-093 AK-5). */
  leerbar?: boolean;
}) {
  return (
    <BlattFeld
      titel="Hinzugefügt"
      kennung="hinzugefuegt"
      startWert={startDatum || eintragungsdatumText(eingetragenAm) || (leerOhneDatum ? '' : datumText(jetzt()))}
      platzhalter="TT.MM.JJJJ"
      inputMode="numeric"
      filtern={datumFiltern}
      pruefen={(w) => {
        if (leerbar && w.trim() === '') return '';
        const p = hinzugefuegtPruefen(w, jetzt());
        return p.ok ? p.datum : null;
      }}
      {...rest}
    />
  );
}

/**
 * Blatt „Beendet am“ (REQ-085): Verhalten wie „Hinzugefügt“ (TT.MM.JJJJ, nicht in der Zukunft); vorbefüllt mit dem
 * gespeicherten Datum, ohne Datum leer. Liefert TT.MM.JJJJ bzw. '' (leer entfernt, REQ-093).
 */
export function BlattBeendet({ beendetAm, jetzt, ...rest }: EinfachProps & { beendetAm?: string; jetzt: () => Date }) {
  return (
    <BlattFeld
      titel="Beendet am"
      kennung="beendet"
      startWert={beendetDatumText(beendetAm)}
      platzhalter="TT.MM.JJJJ"
      inputMode="numeric"
      filtern={datumFiltern}
      pruefen={(w) => {
        // Leer entfernt „Beendet am“ (REQ-093, AK-6).
        if (w.trim() === '') return '';
        const p = hinzugefuegtPruefen(w, jetzt());
        return p.ok ? p.datum : null;
      }}
      {...rest}
    />
  );
}

/**
 * Blatt „Erschienen“ (REQ-060, REQ-092): Datum TT.MM.JJJJ bis heute oder Jahr JJJJ bis zum laufenden Jahr, je nachdem
 * was vorliegt. Leer ist gültig und liefert '' (Angabe entfernen). Liefert TT.MM.JJJJ, JJJJ oder ''.
 */
export function BlattErschienen({ erschienen, jetzt = () => new Date(), ...rest }: EinfachProps & { erschienen?: string; jetzt?: () => Date }) {
  return (
    <BlattFeld
      titel="Erschienen"
      kennung="erschienen"
      startWert={erschienen ?? ''}
      platzhalter="TT.MM.JJJJ oder JJJJ"
      inputMode="numeric"
      filtern={erschienenFiltern}
      pruefen={(w) => erschienenErgebnis(w, jetzt())}
      {...rest}
    />
  );
}

/** Blatt „Titel“ in den Buchdetails (REQ-094): Muster „Verlag“; Pflichtangabe, leer bzw. nur Leerzeichen ist ungültig. */
export function BlattTitel({ titel, ...rest }: EinfachProps & { titel: string }) {
  return (
    <BlattFeld
      titel="Titel"
      kennung="titel"
      startWert={titel}
      platzhalter="Buchtitel"
      maxLength={500}
      pruefen={(w) => (w.trim() === '' ? null : w.trim())}
      {...rest}
    />
  );
}

/** Blatt „Autor“ in den Buchdetails (REQ-094): Muster „Verlag“; leer entfernt den Autor (REQ-093). */
export function BlattAutor({ autor, ...rest }: EinfachProps & { autor?: string }) {
  return <BlattFeld titel="Autor" kennung="autor" startWert={autor ?? ''} platzhalter="Autor" maxLength={300} pruefen={(w) => w.trim()} {...rest} />;
}
