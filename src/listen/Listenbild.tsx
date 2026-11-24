import type { CSSProperties } from 'react';
import iconGalerie from '@/assets/icons/icon-galerie.png';
import iconKamera from '@/assets/icons/icon-kamera.png';
import iconX from '@/assets/icons/icon-x.png';
import { eintragStil, hintergrundStil, menueFlaecheStil } from '@/buchdetails/Auswahlmenue';
import CoverPlatzhalter from '@/components/CoverPlatzhalter';
import Icon from '@/components/Icon';
import { buchdetailsFarbe, listenFarbe, textstufe, abstand, stilRolle } from '@/theme';

/** Kleine Listenbild-Größe (geöffnete Liste, Listenübersicht), Cover-Format 2:3 (REQ-100). */
export const LISTENBILD_KLEIN = { breite: 40, hoehe: 60 } as const;
/** Bildfeld im Blatt „Liste bearbeiten“ (REQ-100). */
const FELD = { breite: 96, hoehe: 144 } as const;

const bildStil = (breite: number, hoehe: number): CSSProperties => ({
  flex: '0 0 auto',
  display: 'block',
  boxSizing: 'border-box',
  width: `${breite}px`,
  height: `${hoehe}px`,
  // Nie verzerrt (REQ-100, AK-8): füllt die Coverfläche, ggf. beschnitten.
  objectFit: 'cover',
  borderRadius: '4px',
});

/** Listenbild klein im Cover-Format: data-listenbild=<listeId>. */
export function ListenbildKlein({ listeId, bild }: { listeId: string; bild: string }) {
  return <img data-listenbild={listeId} src={bild} alt="" {...stilRolle('cover')} style={bildStil(LISTENBILD_KLEIN.breite, LISTENBILD_KLEIN.hoehe)} />;
}

/** Listenübersicht (REQ-100, AK-5): Bild bzw. Platzhalter gleicher Größe, damit die Namen bündig bleiben. */
export function ListenbildOderPlatzhalter({ listeId, bild }: { listeId: string; bild: string | undefined }) {
  if (bild) return <ListenbildKlein listeId={listeId} bild={bild} />;
  return (
    <span data-listenbild-platzhalter={listeId} style={{ flex: '0 0 auto', display: 'block' }}>
      <CoverPlatzhalter breite={LISTENBILD_KLEIN.breite} hoehe={LISTENBILD_KLEIN.hoehe} />
    </span>
  );
}

const feldStil = (mitBild: boolean): CSSProperties => ({
  boxSizing: 'border-box',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  gap: abstand('s'),
  width: `${FELD.breite}px`,
  height: `${FELD.hoehe}px`,
  margin: 0,
  padding: mitBild ? 0 : abstand('s'),
  overflow: 'hidden',
  borderRadius: '8px',
  border: mitBild ? 'none' : `2px dashed ${listenFarbe('bildFeldRahmen')}`,
  backgroundColor: listenFarbe('bildFeldFlaeche'),
  color: listenFarbe('bildFeldInhalt'),
  fontFamily: 'inherit',
  ...textstufe('meta'),
  fontWeight: 600,
  textAlign: 'center',
  cursor: 'pointer',
  WebkitTapHighlightColor: 'transparent',
});

export type ListenbildAktion = 'scannen' | 'galerie' | 'ersetzen' | 'entfernen';

const QUELLEN = [
  { aktion: 'scannen', text: 'Scannen', datei: 'icon-kamera.png', url: iconKamera },
  { aktion: 'galerie', text: 'Aus Galerie auswählen', datei: 'icon-galerie.png', url: iconGalerie },
] as const;
const MIT_BILD = [
  { aktion: 'ersetzen', text: 'Ersetzen', datei: 'icon-galerie.png', url: iconGalerie },
  { aktion: 'entfernen', text: 'Entfernen', datei: 'icon-x.png', url: iconX },
] as const;

const menueStil: CSSProperties = {
  position: 'absolute',
  zIndex: 11,
  top: `${FELD.hoehe + 8}px`,
  left: '50%',
  transform: 'translateX(-50%)',
  ...menueFlaecheStil,
  width: '300px',
  maxWidth: 'calc(100vw - 32px)',
};

interface FeldProps {
  /** Wirksames Bild im Blatt (Entwurf oder gespeichert). */
  bild: string | undefined;
  /** Offenes Menü: „quellen“ (Kamera/Galerie) bzw. „bild“ (Ersetzen/Entfernen); null = zu. */
  menue: 'quellen' | 'bild' | null;
  onMenue: (menue: 'quellen' | 'bild' | null) => void;
  onAktion: (aktion: ListenbildAktion) => void;
}

/**
 * Bildfeld im Blatt „Liste bearbeiten“ (REQ-100): ohne Bild „Bild hinzufügen“ → Kamera oder Galerie
 * (ohne „Cover online suchen“); mit Bild das Bild im Cover-Format → „Ersetzen“ oder „Entfernen“.
 */
export function ListenbildFeld({ bild, menue, onMenue, onAktion }: FeldProps) {
  const eintraege = menue === 'bild' ? MIT_BILD : menue === 'quellen' ? QUELLEN : [];
  return (
    <div data-listenbild-bereich="" style={{ position: 'relative', display: 'flex', justifyContent: 'center', marginTop: abstand('m') }}>
      <button
        type="button"
        data-listenbild-feld=""
        data-mit-bild={bild ? 'true' : 'false'}
        aria-label={bild ? 'Listenbild' : 'Bild hinzufügen'}
        onClick={() => onMenue(bild ? 'bild' : 'quellen')}
        {...stilRolle('cover')}
        style={feldStil(Boolean(bild))}
      >
        {bild ? (
          <img data-listenbild-vorschau="" src={bild} alt="" style={bildStil(FELD.breite, FELD.hoehe)} />
        ) : (
          <>
            <Icon datei="icon-kamera.png" url={iconKamera} farbe={listenFarbe('bildFeldInhalt')} groesse={26} />
            <span>Bild hinzufügen</span>
          </>
        )}
      </button>
      {menue !== null ? (
        <>
          <div data-menue-hintergrund="" onClick={() => onMenue(null)} style={{ ...hintergrundStil, zIndex: 40 }} />
          <div role="menu" aria-label="Listenbild" data-listenbild-menue={menue} {...stilRolle('blatt')} style={{ ...menueStil, zIndex: 41 }}>
            {eintraege.map((e) => (
              <button
                key={e.aktion}
                type="button"
                role="menuitem"
                data-listenbild-aktion={e.aktion}
                onClick={() => onAktion(e.aktion)}
                style={{ ...eintragStil, height: 'auto', minHeight: '48px' }}
              >
                <span style={{ flex: '1 1 auto', minWidth: 0 }}>{e.text}</span>
                <Icon datei={e.datei} url={e.url} farbe={buchdetailsFarbe('auswahlmenueIcon')} groesse={20} />
              </button>
            ))}
          </div>
        </>
      ) : null}
    </div>
  );
}
