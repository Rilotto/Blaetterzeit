import { useState, type CSSProperties } from 'react';
import type { Fortschrittsmodus } from '@/domain/buch';
import { fortschrittPruefen, umrechnen } from '@/domain/fortschritt';
import { fortschrittFarbe } from '@/theme';
import BlattUnten, { blattEingabeStil, blattHinweisStil, sichernStil } from './BlattUnten';

interface Props {
  /** Seitenanzahl des Buches (Voraussetzung, REQ-025). */
  seitenanzahl: number;
  /** Gespeicherter Modus bzw. „seite“ (REQ-024, AK-3). */
  startModus: Fortschrittsmodus;
  /** Gespeicherter Wert im Startmodus bzw. leer. */
  startWert: string;
  /** Gültiger Fortschritt gesichert (REQ-024, AK-4/AK-5). */
  onSichern: (modus: Fortschrittsmodus, wert: number) => void;
  /** X oder Tippen außerhalb: nichts speichern (REQ-024, AK-11). */
  onSchliessen: () => void;
}

const MODI: { modus: Fortschrittsmodus; text: string }[] = [
  { modus: 'seite', text: 'Seite' },
  { modus: 'prozent', text: '%' },
];

const umschalterStil: CSSProperties = {
  display: 'flex',
  gap: '4px',
  margin: '10px 0 14px',
  padding: '4px',
  borderRadius: '18px',
  backgroundColor: fortschrittFarbe('umschalterInaktiv'),
};

const optionStil = (aktiv: boolean): CSSProperties => ({
  flex: '1 1 0',
  height: '36px',
  margin: 0,
  padding: 0,
  border: 'none',
  borderRadius: '14px',
  backgroundColor: aktiv ? fortschrittFarbe('umschalterAktiv') : fortschrittFarbe('umschalterInaktiv'),
  color: fortschrittFarbe('umschalterSchrift'),
  fontFamily: 'inherit',
  fontSize: '16px',
  fontWeight: aktiv ? 600 : 500,
  cursor: 'pointer',
  WebkitTapHighlightColor: 'transparent',
});

/** Blatt „Aktuelle Seite“: Fortschritt als Seite oder Prozent eingeben und sichern (REQ-024). */
export default function BlattAktuelleSeite({ seitenanzahl, startModus, startWert, onSichern, onSchliessen }: Props) {
  const [modus, setModus] = useState<Fortschrittsmodus>(startModus);
  const [eingabe, setEingabe] = useState(startWert);
  const [hinweis, setHinweis] = useState<string | null>(null);

  const wechseln = (neu: Fortschrittsmodus) => {
    if (neu === modus) return;
    setEingabe((alt) => umrechnen(alt.trim(), modus, neu, seitenanzahl));
    setModus(neu);
    setHinweis(null);
  };

  const sichern = () => {
    const p = fortschrittPruefen(eingabe, modus, seitenanzahl);
    if (p.ok) {
      onSichern(modus, p.wert);
      return;
    }
    if (p.grund === 'leer') setHinweis(modus === 'prozent' ? 'Bitte gib einen Prozentwert ein.' : 'Bitte gib eine Seite ein.');
    else if (p.grund === 'zuGross') setHinweis(modus === 'prozent' ? 'Höchstens 100 %.' : `Höchstens Seite ${seitenanzahl}.`);
    else setHinweis('Bitte gib eine ganze Zahl ab 0 ein.');
  };

  return (
    <BlattUnten titel="Aktuelle Seite" onSchliessen={onSchliessen}>
      <div role="group" aria-label="Fortschrittsmodus" style={umschalterStil}>
        {MODI.map((m) => (
          <button
            key={m.modus}
            type="button"
            aria-pressed={modus === m.modus}
            data-modus={m.modus}
            onClick={() => wechseln(m.modus)}
            style={optionStil(modus === m.modus)}
          >
            {m.text}
          </button>
        ))}
      </div>
      <input
        type="text"
        inputMode="numeric"
        autoComplete="off"
        aria-label={modus === 'prozent' ? 'Prozent' : 'Aktuelle Seite'}
        // Eingabe unverändert übernehmen; ungültige Werte (z. B. -1, 4,2) lehnt „Sichern“ ab (REQ-024, AK-6).
        maxLength={7}
        aria-invalid={hinweis !== null}
        value={eingabe}
        onChange={(e) => {
          setEingabe(e.target.value);
          setHinweis(null);
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter') sichern();
        }}
        style={blattEingabeStil}
      />
      {hinweis !== null ? (
        <p role="alert" data-hinweis="" style={blattHinweisStil}>
          {hinweis}
        </p>
      ) : null}
      <button type="button" onClick={sichern} style={sichernStil}>
        Sichern
      </button>
    </BlattUnten>
  );
}
