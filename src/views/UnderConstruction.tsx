import type { CSSProperties } from 'react';

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
      <p style={{ margin: 0 }}>under construction :)</p>
    </div>
  );
}
