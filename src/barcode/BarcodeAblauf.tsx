import { useEffect, useRef, useState, type CSSProperties } from 'react';
import type { Vorbelegung } from '@/buchanlegen/eingabe';
import { useZurueckTaste } from '@/plattform/zurueckTaste';
import { barcodeFarbe } from '@/theme';
import Auswahlfenster from './Auswahlfenster';
import ScanBildschirm from './ScanBildschirm';
import type { BarcodeScanner } from './scanner';
import type { IsbnSuche } from './suche';
import type { Treffer } from './treffer';

interface Props {
  scanner: BarcodeScanner;
  suche: IsbnSuche;
  /** Abbruch, Kamera verweigert, kein Internet, nichts gefunden, Zurück: Seite „Bücher“ ohne neues Buch. */
  onAbbruch: () => void;
  /** Ein Treffer wurde gewählt: Blatt „Manueller Eintrag“ mit diesen Angaben öffnen (REQ-062, AK-4). */
  onUebernehmen: (vorbelegung: Vorbelegung) => void;
}

type Phase = { art: 'scan' } | { art: 'suche'; isbn: string } | { art: 'auswahl'; isbn: string; treffer: Treffer[] };

const sucheStil: CSSProperties = {
  position: 'fixed',
  inset: 0,
  zIndex: 20,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '0 32px',
  textAlign: 'center',
  backgroundColor: barcodeFarbe('auswahlFlaeche'),
  color: barcodeFarbe('auswahlText'),
};

/**
 * Ablauf „Barcode scannen“ (REQ-061, REQ-062): Scan-Bildschirm → Suche → Auswahlfenster → Übernahme.
 * Die Android-Zurück-Taste bricht in jeder Phase ab und führt zur Seite „Bücher“.
 */
export default function BarcodeAblauf({ scanner, suche, onAbbruch, onUebernehmen }: Props) {
  const [phase, setPhase] = useState<Phase>({ art: 'scan' });
  const aktiv = useRef(true);
  useEffect(() => {
    aktiv.current = true;
    return () => {
      aktiv.current = false;
    };
  }, []);

  const verlassen = useZurueckTaste(() => {
    aktiv.current = false;
    onAbbruch();
    return false;
  });

  const abbrechen = () => {
    if (!aktiv.current) return;
    aktiv.current = false;
    verlassen();
    onAbbruch();
  };

  const isbnErkannt = (isbn: string) => {
    if (!aktiv.current) return;
    setPhase({ art: 'suche', isbn });
    void suche.suchen(isbn).then(
      (treffer) => {
        if (!aktiv.current) return;
        // Nichts gefunden: zurück zur Seite „Bücher“ (REQ-062, AK-7).
        if (treffer.length === 0) abbrechen();
        else setPhase({ art: 'auswahl', isbn, treffer });
      },
      (fehler: unknown) => {
        // Kein Internet bzw. keine Quelle erreichbar (REQ-062, AK-8).
        console.warn('ISBN-Suche fehlgeschlagen:', fehler);
        abbrechen();
      },
    );
  };

  if (phase.art === 'scan') {
    return <ScanBildschirm scanner={scanner} onIsbn={isbnErkannt} onAbbruch={abbrechen} />;
  }
  if (phase.art === 'suche') {
    return (
      <div role="status" data-isbn-suche="" data-isbn={phase.isbn} data-sicherer-bereich="" style={sucheStil}>
        Ich schlage die ISBN {phase.isbn} nach …
      </div>
    );
  }
  return (
    <Auswahlfenster
      isbn={phase.isbn}
      treffer={phase.treffer}
      onZurueck={abbrechen}
      onWahl={(t) => {
        if (!aktiv.current) return;
        aktiv.current = false;
        verlassen();
        onUebernehmen(t.angaben);
      }}
    />
  );
}
