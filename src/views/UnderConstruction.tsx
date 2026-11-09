import type { CSSProperties } from 'react';
import { rubrikFarbe } from '../theme/farben';

const stil: CSSProperties = {
  minHeight: '100%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  textAlign: 'center',
};

/** Platzhalter, solange die Zielansicht eines Menüpunkts nicht definiert ist (REQ-002). */
export default function UnderConstruction() {
  return (
    <div style={stil}>
      {/* Textfarbe aus der Farbrubrik Tertiär (REQ-004). */}
      <p style={{ margin: 0, color: rubrikFarbe('tertiaer') }}>under construction :)</p>
    </div>
  );
}
