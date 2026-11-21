import { useState, type CSSProperties } from 'react';
import { seitenanzahlPruefen } from '@/domain/fortschritt';
import { fortschrittFarbe } from '@/theme';
import BlattUnten, { blattEingabeStil, blattHinweisStil, sichernStil } from './BlattUnten';

interface Props {
  /** Gültige Seitenanzahl gesichert (REQ-025, AK-3). */
  onSichern: (seitenanzahl: number) => void;
  /** X oder Tippen außerhalb: nichts speichern (REQ-025, AK-5). */
  onSchliessen: () => void;
}

const untertitelStil: CSSProperties = {
  margin: '6px 0 14px',
  fontSize: '17px',
  lineHeight: 1.3,
  color: fortschrittFarbe('blattUntertitel'),
};

/** Blatt „Buchlänge“: einmalige Eingabe der Seitenanzahl (REQ-025). Feld beim Öffnen leer (Annahme). */
export default function BlattBuchlaenge({ onSichern, onSchliessen }: Props) {
  const [eingabe, setEingabe] = useState('');
  const [hinweis, setHinweis] = useState<string | null>(null);

  const sichern = () => {
    const p = seitenanzahlPruefen(eingabe);
    if (!p.ok) {
      setHinweis(p.grund === 'leer' ? 'Bitte gib die Seitenanzahl ein.' : 'Bitte gib eine ganze Zahl ab 1 ein.');
      return;
    }
    onSichern(p.wert);
  };

  return (
    <BlattUnten titel="Buchlänge" onSchliessen={onSchliessen}>
      <p style={untertitelStil}>Leg die Länge dieses Buches fest</p>
      <input
        type="text"
        inputMode="numeric"
        autoComplete="off"
        aria-label="Seitenanzahl"
        // Eingabe unverändert übernehmen; ungültige Werte (z. B. -5, 12.5) lehnt „Sichern“ ab (REQ-025, AK-4).
        maxLength={6}
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
