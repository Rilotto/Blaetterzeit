import type { HTMLAttributes } from 'react';
import { textUnterCoverStil } from './layout';

interface Props extends HTMLAttributes<HTMLParagraphElement> {
  /** CSS-Farbausdruck aus einer Farbrolle, z. B. `buecherFarbe('leerplatzhalterText')`. */
  farbe: string;
}

/**
 * Text an der Titelstelle unter einem Platzhalter. Gemeinsame Darstellung für den
 * Leere-Liste-Platzhalter (REQ-011) und die Abschnitte „Sagas“/„Sammlungen“ (REQ-012).
 * Ohne Funktion.
 */
export default function PlatzhalterText({ farbe, style, ...rest }: Props) {
  return <p {...rest} style={{ ...textUnterCoverStil, ...style, color: farbe }} />;
}
