import type { CSSProperties } from 'react';
import iconHandEintragen from '@/assets/icons/icon-hand-eintragen.png';
import Icon from '@/components/Icon';
import { abdunklung, buchAnlegenFarbe, plusMenueSchatten, textformatAlleAnsehen } from '@/theme';

interface Props {
  /** Oberkante des Menüs in px, relativ zum Kopfbereich. */
  oben: number;
  /** Abstand des Menüs zum rechten Rand des Kopfbereichs in px. */
  rechts: number;
  /** Option „Von Hand eintragen“ gewählt. */
  onVonHand: () => void;
  /** Tippen außerhalb des Menüs. */
  onSchliessen: () => void;
}

// Maße nach REF-buch-anlegen-01-menue.png (1080 px ≈ 412 dp): Breite ≈ 298 dp, Ecken ≈ 20 dp,
// Icon-Kachel ≈ 40 dp, Zeile ≈ 74 dp. Orientierungswerte, kein Akzeptanzkriterium.
const hintergrundStil: CSSProperties = {
  position: 'fixed',
  inset: 0,
  zIndex: 10,
  backgroundColor: abdunklung,
};

const menueStil = (oben: number, rechts: number): CSSProperties => ({
  position: 'absolute',
  zIndex: 11,
  top: `${oben}px`,
  right: `${rechts}px`,
  boxSizing: 'border-box',
  width: '298px',
  maxWidth: `calc(100% - ${2 * rechts}px)`,
  padding: '6px 0',
  borderRadius: '20px',
  border: `1.5px solid ${buchAnlegenFarbe('menueRahmen')}`,
  backgroundColor: buchAnlegenFarbe('menueFlaeche'),
  boxShadow: plusMenueSchatten,
});

const optionStil: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '16px',
  boxSizing: 'border-box',
  width: '100%',
  margin: 0,
  padding: '12px 16px',
  border: 'none',
  background: 'none',
  fontFamily: 'inherit',
  textAlign: 'left',
  cursor: 'pointer',
  WebkitTapHighlightColor: 'transparent',
};

const kachelStil: CSSProperties = {
  flex: '0 0 auto',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '40px',
  height: '40px',
  borderRadius: '12px',
  backgroundColor: buchAnlegenFarbe('menueIconKachel'),
};

const texteStil: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '2px',
  minWidth: 0,
};

const titelStil: CSSProperties = {
  fontSize: '17px',
  fontWeight: 600,
  lineHeight: 1.25,
  color: buchAnlegenFarbe('menueOptionTitel'),
};

// Untertitel im Format von „Alle ansehen ›“ (REQ-009), Farbe Tertiär.
const untertitelStil: CSSProperties = {
  ...textformatAlleAnsehen,
  lineHeight: 1.3,
  color: buchAnlegenFarbe('menueOptionUntertitel'),
};

/** Menü „Buch hinzufügen“ (REQ-029) mit Abdunklung der Seite. Schließt nur über die Option oder Tippen außerhalb. */
export default function PlusMenue({ oben, rechts, onVonHand, onSchliessen }: Props) {
  return (
    <>
      <div data-menue-hintergrund="" onClick={onSchliessen} style={hintergrundStil} />
      <div role="menu" aria-label="Buch hinzufügen" style={menueStil(oben, rechts)}>
        <button type="button" role="menuitem" onClick={onVonHand} style={optionStil}>
          <span style={kachelStil}>
            <Icon
              datei="icon-hand-eintragen.png"
              url={iconHandEintragen}
              farbe={buchAnlegenFarbe('menueIcon')}
              groesse={22}
            />
          </span>
          <span style={texteStil}>
            <span data-option-titel="" style={titelStil}>
              Von Hand eintragen
            </span>
            <span data-option-untertitel="" style={untertitelStil}>
              Wenn deine Ausgabe fehlt
            </span>
          </span>
        </button>
      </div>
    </>
  );
}
