import { useState, type CSSProperties } from 'react';
import { massEingabeText, massPruefen, type Masse } from '@/domain/ausgabe';
import { masseVorbefuellung, type MassQuelle } from './masse';
import { fortschrittFarbe, textstufe, abstand } from '@/theme';
import BlattUnten, { blattEingabeStil, blattHinweisStil, sichernStil } from './BlattUnten';

type MassFeld = 'breite' | 'hoehe' | 'dicke';

/** Felder in der Reihenfolge Breite × Höhe × Dicke (REQ-072, AK-3). */
const FELDER: readonly { id: MassFeld; label: string; schluessel: keyof Masse }[] = [
  { id: 'breite', label: 'Breite', schluessel: 'breiteMm' },
  { id: 'hoehe', label: 'Höhe', schluessel: 'hoeheMm' },
  { id: 'dicke', label: 'Dicke', schluessel: 'dickeMm' },
];

interface Props {
  /**
   * Gespeicherte Maße samt Format und Seitenzahl: vorhandene Werte sind vorbefüllt, ohne jeden Wert die
   * Schätzwerte nach REQ-077 (REQ-072, AK-3). Gespeichert wird erst mit „Sichern“.
   */
  masse: MassQuelle;
  /** Alle Felder gültig: Maße in Millimetern, leeres Feld fehlt (REQ-072, AK-4). */
  onSichern: (masse: Masse) => void;
  /** X, Herunterziehen, Tippen außerhalb, Zurück-Taste: nichts speichern (REQ-072, AK-6). */
  onSchliessen: () => void;
}

const reiheStil: CSSProperties = {
  display: 'flex',
  alignItems: 'flex-end',
  gap: abstand('s'),
  marginTop: abstand('m'),
};

const spalteStil: CSSProperties = { flex: '1 1 0', minWidth: 0, display: 'flex', flexDirection: 'column', gap: abstand('xs') };

const labelStil: CSSProperties = {
  ...textstufe('label'),
  fontWeight: 600,
  letterSpacing: '0.04em',
  textAlign: 'center',
  color: fortschrittFarbe('blattUeberschrift'),
};

const malStil: CSSProperties = {
  flex: '0 0 auto',
  height: '56px',
  lineHeight: '56px',
  ...textstufe('text'),
  color: fortschrittFarbe('blattUntertitel'),
};

/** Blatt „Maße“ mit Breite, Höhe und Dicke in Zentimetern (REQ-072), Muster wie „Preis“ (REQ-059). */
export default function BlattMasse({ masse, onSichern, onSchliessen }: Props) {
  const [eingaben, setEingaben] = useState<Record<MassFeld, string>>(() => {
    const v = masseVorbefuellung(masse);
    return { breite: massEingabeText(v.breiteMm), hoehe: massEingabeText(v.hoeheMm), dicke: massEingabeText(v.dickeMm) };
  });
  const [fehler, setFehler] = useState<Record<MassFeld, boolean>>({ breite: false, hoehe: false, dicke: false });

  const sichern = () => {
    const ergebnis: Masse = {};
    const neueFehler = { breite: false, hoehe: false, dicke: false };
    for (const f of FELDER) {
      const p = massPruefen(eingaben[f.id]);
      if (!p.ok) neueFehler[f.id] = true;
      else if (p.mm !== undefined) ergebnis[f.schluessel] = p.mm;
    }
    setFehler(neueFehler);
    if (neueFehler.breite || neueFehler.hoehe || neueFehler.dicke) return;
    onSichern(ergebnis);
  };

  return (
    <BlattUnten titel="Maße" onSchliessen={onSchliessen} ziehbar>
      <div data-masse-felder="" style={reiheStil}>
        {FELDER.map((f, i) => (
          <div key={f.id} style={{ display: 'contents' }}>
            {i > 0 ? (
              <span aria-hidden="true" style={malStil}>
                ×
              </span>
            ) : null}
            <label style={spalteStil}>
              <span data-mass-label={f.id} style={labelStil}>
                {f.label.toUpperCase()}
              </span>
              <input
                type="text"
                inputMode="decimal"
                autoComplete="off"
                aria-label={f.label}
                data-mass-feld={f.id}
                data-fehler={fehler[f.id] ? 'true' : undefined}
                aria-invalid={fehler[f.id] ? true : undefined}
                maxLength={7}
                placeholder="–"
                value={eingaben[f.id]}
                onChange={(e) => {
                  const wert = e.target.value;
                  setEingaben((alt) => ({ ...alt, [f.id]: wert }));
                  setFehler((alt) => ({ ...alt, [f.id]: false }));
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') sichern();
                }}
                style={{
                  ...blattEingabeStil,
                  padding: `0 ${abstand('xs')}`,
                  ...(fehler[f.id] ? { border: `2px solid ${fortschrittFarbe('eingabeFehler')}`, color: fortschrittFarbe('eingabeFehler') } : {}),
                }}
              />
            </label>
          </div>
        ))}
      </div>
      <p data-masse-hinweis="" style={{ ...blattHinweisStil, textAlign: 'center', color: fortschrittFarbe('blattUntertitel') }}>
        in Zentimetern
      </p>
      <button type="button" data-masse-sichern="" onClick={sichern} style={sichernStil}>
        Sichern
      </button>
    </BlattUnten>
  );
}
