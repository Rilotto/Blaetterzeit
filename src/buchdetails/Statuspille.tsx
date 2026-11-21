import { useRef, useState, type CSSProperties } from 'react';
import iconAufAb from '@/assets/icons/icon-auf-ab.png';
import Icon from '@/components/Icon';
import { LESESTATUS, type LesestatusId } from '@/domain/buch';
import { fortschrittFarbe } from '@/theme';
import { eintragStil, hintergrundStil, menueFlaecheStil } from './Auswahlmenue';
import { statusIcon } from './statusIcons';

interface Props {
  status: LesestatusId;
  /** Ein Status wurde im Statusmenü gewählt (REQ-022, AK-4). */
  onWaehlen: (status: LesestatusId) => void;
}

// Maße nach REF-buchdetails-01.png (≈ 2,26 px je dp): Pille ≈ 202 × 35 dp, Icon ≈ 18 dp, Pfeile ≈ 16 dp.
// Orientierungswerte, kein Akzeptanzkriterium. Höhe bewusst großzügiger (40 px), damit Unterlängen
// (g, j, p …) sicher Platz haben.
const PILLE_BREITE = 202;
const PILLE_HOEHE = 40;
/** Zeilenhöhe des Pillentexts: deutlich über der Schriftgröße, damit Unterlängen nicht abgeschnitten werden. */
const TEXT_ZEILENHOEHE = 24;
const MENUE_ABSTAND = 8;
/** Höhe des Statusmenüs: fünf Zeilen à 48 px + 2 × 10 px Innenabstand (wie Auswahlmenü). */
const MENUE_HOEHE = LESESTATUS.length * 48 + 20;
/** Freiraum zum Bildschirmrand (u. a. für die Hauptnavigation). */
const RAND_UNTEN = 16;

export type MenueLage = 'unter' | 'ueber';

/** Öffnet das Statusmenü unter der Pille, wenn dort genug Platz ist, sonst darüber (REQ-022, AK-2). */
export function menueLage(pille: { top: number; bottom: number }, fensterHoehe: number): MenueLage {
  const unten = fensterHoehe - pille.bottom - MENUE_ABSTAND - RAND_UNTEN;
  if (unten >= MENUE_HOEHE) return 'unter';
  const oben = pille.top - MENUE_ABSTAND - RAND_UNTEN;
  return oben > unten ? 'ueber' : 'unter';
}

const pilleStil: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: '20px 1fr 20px',
  alignItems: 'center',
  justifyItems: 'center',
  columnGap: '8px',
  boxSizing: 'border-box',
  width: `${PILLE_BREITE}px`,
  maxWidth: '100%',
  height: `${PILLE_HOEHE}px`,
  margin: '0 auto',
  padding: '0 14px',
  border: 'none',
  borderRadius: `${PILLE_HOEHE / 2}px`,
  backgroundColor: fortschrittFarbe('statuspilleFlaeche'),
  color: fortschrittFarbe('statuspilleSchrift'),
  fontFamily: 'inherit',
  fontSize: '17px',
  fontWeight: 600,
  lineHeight: `${TEXT_ZEILENHOEHE}px`,
  cursor: 'pointer',
  WebkitTapHighlightColor: 'transparent',
};

// overflow: hidden nur für die Ellipse in der Breite; die Zeilenhöhe lässt Unterlängen genug Raum.
const textStil: CSSProperties = {
  display: 'block',
  justifySelf: 'stretch',
  minWidth: 0,
  lineHeight: `${TEXT_ZEILENHOEHE}px`,
  textAlign: 'center',
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
};

const menueStil = (lage: MenueLage, pille: DOMRect | null): CSSProperties => {
  const mitte = pille ? pille.left + pille.width / 2 : 0;
  return {
    position: 'fixed',
    zIndex: 11,
    left: pille ? `${mitte}px` : '50%',
    transform: 'translateX(-50%)',
    ...(lage === 'unter'
      ? { top: `${(pille?.bottom ?? 0) + MENUE_ABSTAND}px` }
      : { bottom: `${window.innerHeight - (pille?.top ?? 0) + MENUE_ABSTAND}px` }),
    ...menueFlaecheStil,
  };
};

// Icon links, Text danach (REQ-022: Icon links neben jedem Status).
const statusEintragStil: CSSProperties = {
  ...eintragStil,
  justifyContent: 'flex-start',
  lineHeight: 1.3,
  color: fortschrittFarbe('statusmenueSchrift'),
};

/** Statuspille unter Titel bzw. Autor (REQ-021) mit Statusmenü (REQ-022). */
export default function Statuspille({ status, onWaehlen }: Props) {
  const knopf = useRef<HTMLButtonElement>(null);
  const [menue, setMenue] = useState<{ lage: MenueLage; pille: DOMRect | null } | null>(null);
  const name = LESESTATUS.find((s) => s.id === status)?.bezeichnung ?? status;
  const icon = statusIcon(status);

  const oeffnen = () => {
    const pille = knopf.current?.getBoundingClientRect() ?? null;
    setMenue({ lage: pille ? menueLage(pille, window.innerHeight) : 'unter', pille });
  };

  return (
    <>
      <button
        ref={knopf}
        type="button"
        data-statuspille=""
        aria-haspopup="menu"
        aria-expanded={menue !== null}
        onClick={oeffnen}
        style={pilleStil}
      >
        <Icon datei={icon.datei} url={icon.url} farbe={fortschrittFarbe('statuspilleIcon')} groesse={18} />
        <span data-statuspille-text="" style={textStil}>
          {name}
        </span>
        <Icon datei="icon-auf-ab.png" url={iconAufAb} farbe={fortschrittFarbe('statuspillePfeile')} groesse={18} />
      </button>
      {menue !== null ? (
        <>
          <div data-menue-hintergrund="" onClick={() => setMenue(null)} style={hintergrundStil} />
          <div role="menu" aria-label="Status wählen" data-lage={menue.lage} style={menueStil(menue.lage, menue.pille)}>
            {LESESTATUS.map((s) => {
              const i = statusIcon(s.id);
              return (
                <button
                  key={s.id}
                  type="button"
                  role="menuitem"
                  data-status={s.id}
                  onClick={() => {
                    setMenue(null);
                    onWaehlen(s.id);
                  }}
                  style={statusEintragStil}
                >
                  <Icon datei={i.datei} url={i.url} farbe={fortschrittFarbe('statusmenueIcon')} groesse={20} />
                  <span>{s.bezeichnung}</span>
                </button>
              );
            })}
          </div>
        </>
      ) : null}
    </>
  );
}
