import { useState } from 'react';
import {
  datumFiltern,
  datumText,
  eintragungsdatumText,
  erschienenPruefen,
  hinzugefuegtPruefen,
  isbnFiltern,
  isbnGueltig,
} from '@/domain/ausgabe';
import { fortschrittFarbe } from '@/theme';
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
  maxLength?: number;
  /** Gültiger Wert gesichert. */
  onSichern: (wert: string) => void;
  /** X oder Tippen außerhalb: nichts speichern. */
  onSchliessen: () => void;
}

/**
 * Blatt mit einem Eingabefeld und der Pille „Sichern“ nach Muster des Menüs „Preis“ (REQ-059).
 * Ungültig: Feld in Primär hervorgehoben ohne Hinweistext, bis es geändert wird – wie „JAHR“ (REQ-031).
 */
export default function BlattFeld({
  titel,
  kennung,
  startWert,
  filtern = (w) => w,
  pruefen = (w) => w,
  platzhalter,
  inputMode = 'text',
  maxLength,
  onSichern,
  onSchliessen,
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
        autoComplete="off"
        aria-label={titel}
        data-blatt-feld={kennung}
        data-fehler={fehler ? 'true' : undefined}
        aria-invalid={fehler ? true : undefined}
        maxLength={maxLength}
        placeholder={platzhalter}
        value={eingabe}
        onChange={(e) => {
          setEingabe(filtern(e.target.value));
          setFehler(false);
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter') sichern();
        }}
        style={{
          ...blattEingabeStil,
          marginTop: '14px',
          ...(fehler ? { border: `2px solid ${fortschrittFarbe('eingabeFehler')}`, color: fortschrittFarbe('eingabeFehler') } : {}),
        }}
      />
      <button type="button" data-blatt-sichern={kennung} onClick={sichern} style={sichernStil}>
        Sichern
      </button>
    </BlattUnten>
  );
}

interface EinfachProps {
  onSichern: (wert: string) => void;
  onSchliessen: () => void;
}

/** Blatt „Verlag“ (REQ-063). Leer bzw. nur Leerzeichen sichern entfernt den Verlag (Annahme des Entwicklers). */
export function BlattVerlag({ verlag, ...rest }: EinfachProps & { verlag?: string }) {
  return <BlattFeld titel="Verlag" kennung="verlag" startWert={verlag ?? ''} platzhalter="Verlag" maxLength={200} pruefen={(w) => w.trim()} {...rest} />;
}

/** Blatt „ISBN“ (REQ-063): nur Ziffern (und „X“ als zehnte Stelle), Prüfziffer wird beim Sichern geprüft. */
export function BlattIsbn({ isbn, ...rest }: EinfachProps & { isbn?: string }) {
  return (
    <BlattFeld
      titel="ISBN"
      kennung="isbn"
      startWert={isbn ?? ''}
      platzhalter="9783551551672"
      inputMode="numeric"
      filtern={isbnFiltern}
      pruefen={(w) => (isbnGueltig(w) ? w : null)}
      {...rest}
    />
  );
}

/** Blatt „Hinzugefügt“ (REQ-064): Datum TT.MM.JJJJ, vorbefüllt, nicht in der Zukunft. Liefert TT.MM.JJJJ. */
export function BlattHinzugefuegt({
  eingetragenAm,
  startDatum,
  jetzt,
  ...rest
}: EinfachProps & { eingetragenAm?: string; /** Vorbefüllung TT.MM.JJJJ (hat Vorrang). */ startDatum?: string; jetzt: () => Date }) {
  return (
    <BlattFeld
      titel="Hinzugefügt"
      kennung="hinzugefuegt"
      startWert={startDatum || eintragungsdatumText(eingetragenAm) || datumText(jetzt())}
      platzhalter="TT.MM.JJJJ"
      inputMode="numeric"
      filtern={datumFiltern}
      pruefen={(w) => {
        const p = hinzugefuegtPruefen(w, jetzt());
        return p.ok ? p.datum : null;
      }}
      {...rest}
    />
  );
}

/** Blatt „Erschienen“ im Manuellen Eintrag (REQ-060, AK-3): Datum TT.MM.JJJJ. */
export function BlattErschienen({ erschienen, ...rest }: EinfachProps & { erschienen?: string }) {
  return (
    <BlattFeld
      titel="Erschienen"
      kennung="erschienen"
      startWert={erschienen ?? ''}
      platzhalter="TT.MM.JJJJ"
      inputMode="numeric"
      filtern={datumFiltern}
      pruefen={(w) => {
        const p = erschienenPruefen(w);
        return p.ok ? p.datum : null;
      }}
      {...rest}
    />
  );
}
