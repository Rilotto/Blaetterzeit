// Gemeinsame Stile der Blätter von unten (Fenster „Design“, REQ-067; Blatt „„Für dich“ anpassen“, REQ-108).
import type { CSSProperties } from 'react';
import { abdunklung, abstand, bildschirmrand, detailsFarbe, pillenhoehe, rezensionFarbe, textstufe } from '@/theme';

export const knopf: CSSProperties = { margin: 0, fontFamily: 'inherit', cursor: 'pointer', WebkitTapHighlightColor: 'transparent' };

export const hintergrundStil: CSSProperties = {
  position: 'fixed',
  inset: 0,
  zIndex: 30,
  backgroundColor: abdunklung,
  animation: 'bz-abdunklung-ein 200ms ease-out',
};

export const fensterStil = (versatz: number): CSSProperties => ({
  position: 'fixed',
  left: 0,
  right: 0,
  bottom: 0,
  zIndex: 31,
  boxSizing: 'border-box',
  maxHeight: 'calc(100% - 40px)',
  overflowY: 'auto',
  padding: `0 ${bildschirmrand} calc(${abstand('l')} + var(--safe-area-inset-bottom, env(safe-area-inset-bottom, 0px)))`,
  borderTopLeftRadius: '28px',
  borderTopRightRadius: '28px',
  backgroundColor: rezensionFarbe('fensterFlaeche'),
  animation: 'bz-blatt-ein 220ms ease-out',
  transform: versatz > 0 ? `translateY(${versatz}px)` : undefined,
  transition: versatz > 0 ? undefined : 'transform 160ms ease-out',
});

export const griffBereichStil: CSSProperties = {
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  height: '28px',
  touchAction: 'none',
  cursor: 'grab',
};

export const griffStil: CSSProperties = { width: '40px', height: '5px', borderRadius: '3px', backgroundColor: rezensionFarbe('ziehgriff') };

export const kopfStil: CSSProperties = { position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', height: '44px' };

export const titelStil: CSSProperties = { margin: 0, ...textstufe('abschnitt'), fontWeight: 700, color: rezensionFarbe('fensterTitel') };

export const schliessenStil: CSSProperties = {
  ...knopf,
  position: 'absolute',
  right: 0,
  top: '50%',
  transform: 'translateY(-50%)',
  boxSizing: 'border-box',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: pillenhoehe,
  height: pillenhoehe,
  padding: 0,
  borderRadius: '50%',
  border: `2px solid ${rezensionFarbe('schliessenRahmen')}`,
  backgroundColor: rezensionFarbe('schliessenFlaeche'),
};

export const listeStil: CSSProperties = { display: 'flex', flexDirection: 'column', gap: abstand('s'), marginTop: abstand('m') };

export const zeileStil = (aktiv: boolean): CSSProperties => ({
  ...knopf,
  display: 'flex',
  alignItems: 'center',
  gap: abstand('m'),
  boxSizing: 'border-box',
  width: '100%',
  minHeight: '44px',
  padding: `${abstand('s')} ${abstand('m')}`,
  borderRadius: '16px',
  border: `2px solid ${detailsFarbe(aktiv ? 'kachelGewaehltRahmen' : 'kachelRahmen')}`,
  backgroundColor: detailsFarbe(aktiv ? 'kachelGewaehltFlaeche' : 'kachelFlaeche'),
  textAlign: 'left',
});

export const zeileNameStil: CSSProperties = { flex: '1 1 auto', minWidth: 0, ...textstufe('text'), fontWeight: 600, color: detailsFarbe('zeileBezeichnung') };
