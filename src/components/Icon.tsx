import type { CSSProperties } from 'react';

interface Props {
  /** Dateiname der Icon-Datei (wird als data-icon ausgegeben). */
  datei: string;
  /** Vom Build aufgelöste URL der Icon-Datei. */
  url: string;
  /** CSS-Farbausdruck aus einer Farbrolle. */
  farbe: string;
  /** Kantenlänge in px. */
  groesse: number;
}

/**
 * Einfarbiges Linien-Icon: Die PNG-Datei dient als Maske, die Farbe kommt aus
 * der Farbrolle (gleiches Verfahren wie bei der Hauptnavigation, REQ-002).
 */
export default function Icon({ datei, url, farbe, groesse }: Props) {
  const stil: CSSProperties = {
    display: 'block',
    flex: '0 0 auto',
    width: `${groesse}px`,
    height: `${groesse}px`,
    backgroundColor: farbe,
    maskImage: `url("${url}")`,
    maskSize: 'contain',
    maskRepeat: 'no-repeat',
    maskPosition: 'center',
    WebkitMaskImage: `url("${url}")`,
    WebkitMaskSize: 'contain',
    WebkitMaskRepeat: 'no-repeat',
    WebkitMaskPosition: 'center',
  };
  return <span aria-hidden="true" data-icon={datei} style={stil} />;
}
