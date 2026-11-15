import type { CSSProperties, ReactNode } from 'react';
import { MATERIAL_PFADE, type MaterialSymbol } from '@/assets/material-symbols/pfade';

/**
 * Eigene Icons im Stil von Material Symbols (gefüllt, viewBox 0 -960 960 960) – nur wo Material Symbols
 * kein passendes Icon bietet (REQ-046): Chilischote, Geist, Person mit Krone (aus Material „person“ und „crown“).
 */
const strich = { fill: 'none', stroke: 'currentColor', strokeLinecap: 'round', strokeLinejoin: 'round' } as const;

const EIGENE: Record<'chili' | 'geist' | 'personKrone' | 'buchPrint' | 'tablet' | 'kopfhoerer' | 'haken', ReactNode> = {
  // Fenster „Format“ (REQ-058), selbst nachgebildet: Buch mit Lesezeichen, Tablet, Kopfhörer, Häkchen.
  buchPrint: (
    <path
      fillRule="evenodd"
      d="M260-100q-25 0-42.5-17.5T200-160v-640q0-25 17.5-42.5T260-860h440q25 0 42.5 17.5T760-800v640q0 25-17.5 42.5T700-100H260Zm20-80h400v-600h-90v250l-70-42-70 42v-250H280v600Z"
    />
  ),
  tablet: (
    <path
      fillRule="evenodd"
      d="M290-60q-38 0-64-26t-26-64v-660q0-38 26-64t64-26h380q38 0 64 26t26 64v660q0 38-26 64t-64 26H290Zm-10-220h400v-540H280v540Zm160 120h80q8 0 14-6t6-14q0-8-6-14t-14-6h-80q-8 0-14 6t-6 14q0 8 6 14t14 6Z"
    />
  ),
  kopfhoerer: (
    <>
      <path {...strich} strokeWidth={70} d="M200-360v-110q0-117 81.5-198.5T480-750q117 0 198.5 81.5T760-470v110" />
      <rect x="150" y="-450" width="170" height="270" rx="60" />
      <rect x="640" y="-450" width="170" height="270" rx="60" />
    </>
  ),
  haken: <path {...strich} strokeWidth={100} d="M230-470l160 160 340-340" />,
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
