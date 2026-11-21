import type { CSSProperties } from 'react';
import iconGalerie from '@/assets/icons/icon-galerie.png';
import iconKamera from '@/assets/icons/icon-kamera.png';
import iconLupe from '@/assets/icons/icon-lupe.png';
import iconX from '@/assets/icons/icon-x.png';
import Icon from '@/components/Icon';
import { auswahlmenueFlaeche, auswahlmenueSchatten, buchdetailsFarbe } from '@/theme';

export type MenueAktion = 'scannen' | 'galerie' | 'online' | 'entfernen';

interface Props {
  /** Oberkante des Menüs in px, relativ zum Fenster „Buchdetails“ (unter der Buchdarstellung). */
  oben: number;
  mitEntfernen: boolean;
  onAktion: (aktion: MenueAktion) => void;
  onSchliessen: () => void;
}

interface Eintrag {
  aktion: MenueAktion;
  text: string;
  datei: string;
  url: string;
}

const EINTRAEGE: Eintrag[] = [
  { aktion: 'scannen', text: 'Scannen', datei: 'icon-kamera.png', url: iconKamera },
  { aktion: 'galerie', text: 'Aus Galerie auswählen', datei: 'icon-galerie.png', url: iconGalerie },
  { aktion: 'online', text: 'Cover online suchen', datei: 'icon-lupe.png', url: iconLupe },
];
const ENTFERNEN: Eintrag = { aktion: 'entfernen', text: 'Foto entfernen', datei: 'icon-x.png', url: iconX };

// Maße aus REF-buchdetails-02-auswahlmenue.png: Breite ≈ 250 dp, Zeilen ≈ 48 dp,
// Schrift ≈ 17 dp normal, Icons ≈ 20 dp rechtsbündig, Ecken ≈ 16 dp.
/** Unsichtbare Fläche hinter dem Menü: Tippen außerhalb schließt (auch Statusmenü, REQ-022). */
export const hintergrundStil: CSSProperties = {
  position: 'fixed',
  inset: 0,
  zIndex: 10,
  background: 'transparent',
};

/** Fläche, Ecken und Schatten des Menüs (auch Statusmenü, REQ-022). */
export const menueFlaecheStil: CSSProperties = {
  boxSizing: 'border-box',
  width: '250px',
  maxWidth: 'calc(100% - 32px)',
  padding: '10px 0',
  borderRadius: '16px',
  backgroundColor: auswahlmenueFlaeche,
  boxShadow: auswahlmenueSchatten,
};

const menueStil = (oben: number): CSSProperties => ({
  position: 'absolute',
  zIndex: 11,
  top: `${oben}px`,
  left: '50%',
  transform: 'translateX(-50%)',
  ...menueFlaecheStil,
  // Breiter als das Statusmenü und unabhängig vom (schmalen) Elternelement, z. B. dem
  // Cover-Feld im manuellen Eintrag (176 px): sonst überlappen die Texte. Begrenzt auf die
  // Bildschirmbreite abzüglich Rand, damit es auch bei 360 px vollständig sichtbar bleibt.
  width: '300px',
  maxWidth: 'calc(100vw - 32px)',
});

/** Eine Zeile des Menüs (auch Statusmenü, REQ-022). */
export const eintragStil: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: '12px',
  boxSizing: 'border-box',
  width: '100%',
  height: '48px',
  margin: 0,
  padding: '0 20px',
  border: 'none',
  background: 'none',
  fontFamily: 'inherit',
  fontSize: '17px',
  fontWeight: 400,
  textAlign: 'left',
  color: buchdetailsFarbe('auswahlmenueSchrift'),
  cursor: 'pointer',
  WebkitTapHighlightColor: 'transparent',
};

/** Zeile des Bildquellen-Menüs: langer Text bricht um, statt Icon oder Nachbarzeile zu überlappen. */
const auswahlEintragStil: CSSProperties = {
  ...eintragStil,
  height: 'auto',
  minHeight: '48px',
  lineHeight: 1.3,
};

const textStil: CSSProperties = {
  flex: '1 1 auto',
  minWidth: 0,
  overflowWrap: 'break-word',
};

/** Auswahlmenü eines Bereichs (REQ-015). Schließt sich beim Tippen außerhalb. */
export default function Auswahlmenue({ oben, mitEntfernen, onAktion, onSchliessen }: Props) {
  const eintraege = mitEntfernen ? [...EINTRAEGE, ENTFERNEN] : EINTRAEGE;
  return (
    <>
      <div data-menue-hintergrund="" onClick={onSchliessen} style={hintergrundStil} />
      <div role="menu" aria-label="Bild hinzufügen" style={menueStil(oben)}>
        {eintraege.map((e) => (
          <button key={e.aktion} type="button" role="menuitem" onClick={() => onAktion(e.aktion)} style={auswahlEintragStil}>
            <span style={textStil}>{e.text}</span>
            <Icon datei={e.datei} url={e.url} farbe={buchdetailsFarbe('auswahlmenueIcon')} groesse={20} />
          </button>
        ))}
      </div>
    </>
  );
}
