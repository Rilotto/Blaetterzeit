import { useEffect, useRef, useState, type CSSProperties } from 'react';
import iconTaschenlampeAus from '@/assets/icons/icon-taschenlampe-aus.png';
import iconTaschenlampe from '@/assets/icons/icon-taschenlampe.png';
import iconX from '@/assets/icons/icon-x.png';
import Icon from '@/components/Icon';
import { barcodeFarbe } from '@/theme';
import { fehlerText, type BarcodeScanner } from './scanner';

interface Props {
  scanner: BarcodeScanner;
  /** Ein ISBN-Barcode wurde erkannt (genau einmal je Anzeige). */
  onIsbn: (isbn: string) => void;
  /** X angetippt, Kamera verweigert oder nicht verfügbar. */
  onAbbruch: () => void;
  /** So lange steht der Fehlerhinweis, bevor es zur Seite „Bücher“ zurückgeht (ms). */
  fehlerDauer?: number;
}

/** Standarddauer des Fehlerhinweises: lang genug zum Lesen bzw. für ein Bildschirmfoto. */
const FEHLER_DAUER_MS = 2500;

// Maße nach REF-barcode-01-scan.png (1080 px ≈ 412 dp, Faktor ≈ 2,6). Orientierungswerte, kein Akzeptanzkriterium.
const bildschirmStil: CSSProperties = {
  position: 'fixed',
  inset: 0,
  zIndex: 30,
  boxSizing: 'border-box',
  overflow: 'hidden',
  backgroundColor: barcodeFarbe('scanFlaeche'),
};

const videoStil: CSSProperties = {
  position: 'absolute',
  inset: 0,
  width: '100%',
  height: '100%',
  objectFit: 'cover',
};

const kopfStil: CSSProperties = {
  position: 'relative',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '14px 18px 0',
};

const rundStil = (flaeche: string, groesse: number): CSSProperties => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  boxSizing: 'border-box',
  width: `${groesse}px`,
  height: `${groesse}px`,
  margin: 0,
  padding: 0,
  border: 'none',
  borderRadius: '50%',
  backgroundColor: flaeche,
  cursor: 'pointer',
  WebkitTapHighlightColor: 'transparent',
});

const mitteStil: CSSProperties = {
  position: 'absolute',
  left: 0,
  right: 0,
  top: '34%',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  padding: '0 34px',
  textAlign: 'center',
};

const rahmenStil: CSSProperties = {
  boxSizing: 'border-box',
  width: '100%',
  maxWidth: '300px',
  aspectRatio: '2 / 1',
  border: `3px solid ${barcodeFarbe('scanRahmen')}`,
  borderRadius: '20px',
};

const titelStil: CSSProperties = {
  margin: '22px 0 0',
  fontSize: '22px',
  fontWeight: 700,
  lineHeight: 1.25,
  color: barcodeFarbe('scanText'),
};

const hinweisStil: CSSProperties = {
  margin: '8px 0 0',
  fontSize: '15px',
  lineHeight: 1.35,
  color: barcodeFarbe('scanText'),
};

// Unauffälliger Debug-Hinweis, wenn die Kamera nicht startet (Fehlermeldung für die Fehlersuche).
const fehlerStil: CSSProperties = {
  position: 'absolute',
  left: '18px',
  right: '18px',
  bottom: '28px',
  margin: 0,
  padding: '8px 12px',
  borderRadius: '10px',
  fontSize: '12px',
  lineHeight: 1.35,
  wordBreak: 'break-word',
  color: barcodeFarbe('scanText'),
  backgroundColor: barcodeFarbe('scanFlaeche'),
  border: `1px solid ${barcodeFarbe('scanText')}`,
};

/** Scan-Bildschirm (REQ-061): Kamerabild, Rahmen, X oben links, Taschenlampe oben rechts, zwei Texte. */
export default function ScanBildschirm({ scanner, onIsbn, onAbbruch, fehlerDauer = FEHLER_DAUER_MS }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [licht, setLicht] = useState(false);
  const [fehler, setFehler] = useState<string | null>(null);
  const erledigt = useRef(false);
  const rueckrufe = useRef({ onIsbn, onAbbruch });
  useEffect(() => {
    rueckrufe.current = { onIsbn, onAbbruch };
  });

  useEffect(() => {
    erledigt.current = false;
    let aktiv = true;
    let zurueck: ReturnType<typeof setTimeout> | undefined;
    void scanner
      .starten({
        video: videoRef.current,
        beiIsbn: (isbn) => {
          if (!aktiv || erledigt.current) return;
          erledigt.current = true;
          void scanner.beenden().catch(() => undefined);
          rueckrufe.current.onIsbn(isbn);
        },
      })
      .catch((grund: unknown) => {
        // Kamerazugriff verweigert oder keine Kamera: kurzer Hinweis mit der Meldung, dann zurück zur Seite
        // „Bücher“ (REQ-061, AK-7). Nie stumm – die Meldung hilft bei der Fehlersuche auf dem Gerät.
        console.warn('Barcode-Scanner nicht verfügbar:', grund);
        if (!aktiv || erledigt.current) return;
        setFehler(fehlerText(grund));
        zurueck = setTimeout(() => {
          if (!aktiv || erledigt.current) return;
          erledigt.current = true;
          rueckrufe.current.onAbbruch();
        }, fehlerDauer);
      });
    return () => {
      aktiv = false;
      if (zurueck !== undefined) clearTimeout(zurueck);
      void scanner.beenden().catch(() => undefined);
    };
  }, [scanner, fehlerDauer]);

  const lichtUmschalten = () => {
    const neu = !licht;
    setLicht(neu);
    void scanner.lichtSetzen(neu).catch((fehler: unknown) => {
      console.warn('Licht nicht schaltbar:', fehler);
      setLicht(!neu);
    });
  };

  const abbrechen = () => {
    if (erledigt.current) return;
    erledigt.current = true;
    onAbbruch();
  };

  return (
    <div data-scan-bildschirm="" data-sicherer-bereich="" style={bildschirmStil}>
      {/* Nativ (Android) liegt das Kamerabild HINTER der WebView. Ein <video> ohne Quelle würde die WebView mit
          ihrem undurchsichtigen Standard-Vorschaubild füllen und die Kamera verdecken – deshalb nur im Web. */}
      {scanner.vorschauNativ ? null : (
        <video ref={videoRef} data-scan-kamerabild="" muted playsInline style={videoStil} />
      )}
      <div style={kopfStil}>
        <button
          type="button"
          aria-label="Schließen"
          data-scan-schliessen=""
          onClick={abbrechen}
          style={rundStil(barcodeFarbe('schliessenFlaeche'), 40)}
        >
          <Icon datei="icon-x.png" url={iconX} farbe={barcodeFarbe('schliessenIcon')} groesse={18} />
        </button>
        <button
          type="button"
          aria-label="Taschenlampe"
          aria-pressed={licht}
          data-scan-licht=""
          data-licht={licht ? 'an' : 'aus'}
          onClick={lichtUmschalten}
          style={rundStil(barcodeFarbe('lampeFlaeche'), 48)}
        >
          {licht ? (
            <Icon datei="icon-taschenlampe.png" url={iconTaschenlampe} farbe={barcodeFarbe('lampeIcon')} groesse={24} />
          ) : (
            <Icon datei="icon-taschenlampe-aus.png" url={iconTaschenlampeAus} farbe={barcodeFarbe('lampeIcon')} groesse={24} />
          )}
        </button>
      </div>
      <div style={mitteStil}>
        <div data-scan-rahmen="" style={rahmenStil} />
        <p data-scan-titel="" style={titelStil}>
          Richte den Barcode im Rahmen aus
        </p>
        <p data-scan-hinweis="" style={hinweisStil}>
          Wir schlagen es automatisch nach, sobald es erkannt wurde.
        </p>
      </div>
      {fehler === null ? null : (
        <p role="alert" data-scan-fehler="" style={fehlerStil}>
          Kamera nicht verfügbar: {fehler}
        </p>
      )}
    </div>
  );
}
