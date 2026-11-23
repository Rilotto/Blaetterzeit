import type { CSSProperties } from 'react';
import { BILDBEREICHE, type Bildbereich } from '@/storage/ImageStore';
import { buchdetailsCoverSchatten, buchdetailsFarbe, textformatAlleAnsehen, textstufe, abstand } from '@/theme';
import { BEREICH_ABSTAND, bereichName, darstellungsMasse, type MassQuelle } from './masse';

export type Bilder = Partial<Record<Bildbereich, string>>;

interface Props {
  titel: string;
  bilder: Bilder;
  /** Maße des Buches (REQ-073); fehlende Werte = Standardmaße. */
  masse?: MassQuelle;
  onAntippen: (bereich: Bildbereich) => void;
}

const reiheStil: CSSProperties = {
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'stretch',
  gap: `${BEREICH_ABSTAND}px`,
  marginTop: abstand('s'),
};

const grundStil = (bereich: Bildbereich, masse: { hoehe: number; cover: number; schmal: number }): CSSProperties => ({
  boxSizing: 'border-box',
  position: 'relative',
  flex: '0 0 auto',
  width: `${Number((bereich === 'cover' ? masse.cover : masse.schmal).toFixed(2))}px`,
  height: `${Number(masse.hoehe.toFixed(2))}px`,
  margin: 0,
  padding: 0,
  overflow: 'hidden',
  borderRadius: bereich === 'cover' ? '10px' : '6px',
  font: 'inherit',
  // Schaltflächen zentrieren Text standardmäßig; der Covertitel steht oben links (REQ-014).
  textAlign: 'left',
  cursor: 'pointer',
  WebkitTapHighlightColor: 'transparent',
  // Doppeltipp aufs Cover öffnet die 3D-Ansicht (REQ-074); kein Doppeltipp-Zoom des Browsers.
  touchAction: 'manipulation',
});

const ohneBildStil = (bereich: Bildbereich): CSSProperties =>
  bereich === 'cover'
    ? {
        border: 'none',
        backgroundColor: buchdetailsFarbe('coverflaeche'),
        boxShadow: buchdetailsCoverSchatten,
      }
    : {
        border: `2px dashed ${buchdetailsFarbe('bereichsrahmen')}`,
        backgroundColor: buchdetailsFarbe('bereichsflaeche'),
      };

const mitBildStil = (bereich: Bildbereich): CSSProperties => ({
  border: 'none',
  background: 'none',
  ...(bereich === 'cover' ? { boxShadow: buchdetailsCoverSchatten } : {}),
});

const bildStil: CSSProperties = {
  display: 'block',
  width: '100%',
  height: '100%',
  objectFit: 'cover',
};

// Buchtitel auf der Coverfläche: oben links, vollständig, bei Bedarf umgebrochen (REQ-014, AK-5).
const coverTitelStil: CSSProperties = {
  position: 'absolute',
  top: '14px',
  left: '12px',
  right: '12px',
  ...textstufe('titel'),
  fontWeight: 700,
  lineHeight: 1.25,
  textAlign: 'left',
  overflowWrap: 'anywhere',
  color: buchdetailsFarbe('covertitel'),
};

// „Buchrücken +“ / „Schnitt +“: Format wie „Alle ansehen ›“, um 90° gedreht, von unten nach oben lesbar.
const beschriftungStil: CSSProperties = {
  ...textformatAlleAnsehen,
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%) rotate(-90deg)',
  whiteSpace: 'nowrap',
  lineHeight: 1,
  color: buchdetailsFarbe('bereichsbeschriftung'),
};

function Inhalt({ bereich, titel, bild }: { bereich: Bildbereich; titel: string; bild?: string }) {
  if (bild) return <img data-bereich-bild="" src={bild} alt="" style={bildStil} />;
  if (bereich === 'cover')
    return (
      <span data-cover-titel="" style={coverTitelStil}>
        {titel}
      </span>
    );
  return (
    <span data-bereich-beschriftung="" style={beschriftungStil}>
      {bereichName[bereich]} +
    </span>
  );
}

/** Buchdarstellung aus Buchrücken, Cover und Schnitt (REQ-014), Proportionen aus den Maßen (REQ-073). */
export default function Buchdarstellung({ titel, bilder, masse, onAntippen }: Props) {
  const d = darstellungsMasse(masse);
  return (
    <div data-buchdarstellung="" style={reiheStil}>
      {BILDBEREICHE.map((bereich) => {
        const bild = bilder[bereich];
        return (
          <button
            key={bereich}
            type="button"
            data-bereich={bereich}
            aria-label={bereichName[bereich]}
            onClick={() => onAntippen(bereich)}
            style={{ ...grundStil(bereich, d), ...(bild ? mitBildStil(bereich) : ohneBildStil(bereich)) }}
          >
            <Inhalt bereich={bereich} titel={titel} bild={bild} />
          </button>
        );
      })}
    </div>
  );
}
