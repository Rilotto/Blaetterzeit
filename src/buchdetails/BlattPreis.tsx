import { useState } from 'react';
import { preisPruefen, preisText } from '@/domain/ausgabe';
import BlattUnten, { blattEingabeStil, blattHinweisStil, sichernStil } from './BlattUnten';
import { abstand } from '@/theme';

interface Props {
  /** Gespeicherter Preis in Cent; ohne Wert ist das Feld mit „0,00 €“ vorbefüllt (REQ-059, AK-1/AK-3). */
  preisCent?: number;
  /** Gültiger Betrag gesichert (REQ-059, AK-2). */
  onSichern: (cent: number) => void;
  /** X oder Tippen außerhalb: nichts speichern (REQ-059, AK-4). */
  onSchliessen: () => void;
}

/** Blatt „Preis“ nach Muster des Blatts „Buchlänge“ (REQ-059). */
export default function BlattPreis({ preisCent, onSichern, onSchliessen }: Props) {
  const [eingabe, setEingabe] = useState(preisText(preisCent ?? 0));
  const [hinweis, setHinweis] = useState<string | null>(null);

  const sichern = () => {
    const p = preisPruefen(eingabe);
    if (!p.ok) {
      setHinweis(p.grund === 'leer' ? 'Bitte gib den Preis ein.' : 'Bitte gib einen Betrag wie 12,99 ein.');
      return;
    }
    onSichern(p.cent);
  };

  return (
    <BlattUnten titel="Preis" onSchliessen={onSchliessen}>
      <input
        type="text"
        inputMode="decimal"
        autoComplete="off"
        aria-label="Preis"
        data-preis-eingabe=""
        maxLength={14}
        aria-invalid={hinweis !== null}
        value={eingabe}
        onChange={(e) => {
          setEingabe(e.target.value);
          setHinweis(null);
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter') sichern();
        }}
        style={{ ...blattEingabeStil, marginTop: abstand('m') }}
      />
      {hinweis !== null ? (
        <p role="alert" data-hinweis="" style={blattHinweisStil}>
          {hinweis}
        </p>
      ) : null}
      <button type="button" data-preis-sichern="" onClick={sichern} style={sichernStil}>
        Sichern
      </button>
    </BlattUnten>
  );
}
