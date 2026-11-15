import type { CSSProperties, ReactNode } from 'react';
import { MATERIAL_PFADE, type MaterialSymbol } from '@/assets/material-symbols/pfade';

/**
 * Eigene Icons im Stil von Material Symbols (gefüllt, viewBox 0 -960 960 960) – nur wo Material Symbols
 * kein passendes Icon bietet (REQ-046): Chilischote, Geist, Person mit Krone (aus Material „person“ und „crown“).
 */
const EIGENE: Record<'chili' | 'geist' | 'personKrone', ReactNode> = {
  chili: (
    <>
      <path d="M566-628q-62 62-124 160T318-302q-70 78-160 116-22 9-19 32t26 27q190 28 362-92t200-306q8-56-23-94t-80-32q-36 4-58 43Z" />
      <path d="M614-700q34-40 92-40 10-72 70-116 14-10 28 2t4 26q-38 34-44 92 30 18 30 52 0 14-14 18-60 12-112-14-36-18-54-20Z" />
    </>
  ),
  geist: (
    <path
      fillRule="evenodd"
      d="M480-860q-130 0-215 85t-85 215v440q0 22 19 30t35-6l46-38 56 46q22 18 44 0l56-46 44 36q20 16 40 0l44-36 56 46q22 18 44 0l56-46 46 38q16 14 35 6t19-30v-440q0-130-85-215t-215-85ZM400-640q24 0 40 20t16 50q0 30-16 50t-40 20q-24 0-40-20t-16-50q0-30 16-50t40-20Zm160 0q24 0 40 20t16 50q0 30-16 50t-40 20q-24 0-40-20t-16-50q0-30 16-50t40-20Z"
    />
  ),
  personKrone: (
    <>
      <path transform="translate(96 28) scale(0.8)" d={MATERIAL_PFADE.person} />
      <path transform="translate(288 -586) scale(0.4)" d={MATERIAL_PFADE.krone} />
    </>
  ),
};

export type SymbolName = Exclude<MaterialSymbol, 'person' | 'krone'> | keyof typeof EIGENE;

interface Props {
  name: SymbolName;
  /** CSS-Farbausdruck aus einer Farbrolle bzw. Farbrubrik. */
  farbe: string;
  /** Kantenlänge in px. */
  groesse: number;
  stil?: CSSProperties;
}

/** Einfarbiges Icon aus lokal abgelegten Material-Symbols-Pfaden bzw. eigenen Pfaden (ausgegeben als data-symbol). */
export default function Symbolbild({ name, farbe, groesse, stil }: Props) {
  const inhalt = name in EIGENE ? EIGENE[name as keyof typeof EIGENE] : <path d={MATERIAL_PFADE[name as MaterialSymbol]} />;
  return (
    <svg
      aria-hidden="true"
      data-symbol={name}
      viewBox="0 -960 960 960"
      width={groesse}
      height={groesse}
      fill="currentColor"
      style={{ display: 'block', flex: '0 0 auto', color: farbe, ...stil }}
    >
      {inhalt}
    </svg>
  );
}
