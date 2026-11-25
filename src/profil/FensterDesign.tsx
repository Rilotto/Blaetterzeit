import { useRef, useState, type CSSProperties, type PointerEvent as ReactPointerEvent } from 'react';
import Symbolbild from '@/components/Symbolbild';
import { LESESTATUS } from '@/domain/buch';
import { SCHREIBFENSTER_ZUG_SCHWELLE } from '@/buchdetails/reiter/rezension';
import { useDesign } from '@/design/designwahl';
import { useZurueckTaste } from '@/plattform/zurueckTaste';
import { fensterStil, griffBereichStil, griffStil, hintergrundStil, knopf, kopfStil, listeStil, schliessenStil, titelStil, zeileNameStil, zeileStil } from './blattStil';
import {
  abstand,
  designVorschauRubriken,
  detailsFarbe,
  farbdesignReihenfolge,
  farbdesigns,
  farbVariablen,
  kartenSchatten,
  reiterPilleSchatten,
  rezensionFarbe,
  rubrikFarbe,
  schrift,
  schriftBeispiel,
  schriften,
  schriftReihenfolge,
  schriftVariablen,
  skizzeRolle,
  stile,
  stilReihenfolge,
  stilRolle,
  textstufe,
  type FarbdesignId,
  type SchriftId,
  type StilId,
} from '@/theme';

export type DesignReiter = 'farben' | 'schriftart' | 'stil';

const REITER: readonly { id: DesignReiter; name: string }[] = [
  { id: 'farben', name: 'Farben' },
  { id: 'schriftart', name: 'Schriftart' },
  { id: 'stil', name: 'Stil' },
];

const UEBERGANG = '320ms cubic-bezier(0.4, 0, 0.2, 1)';


// Live-Vorschau: Mini-Buchkarte mit eigenen Variablen des gewählten Designs bzw. der gewählten Schrift.
const vorschauStil = (farbdesign: FarbdesignId, schriftId: SchriftId): CSSProperties => ({
  ...(farbVariablen(farbdesign) as CSSProperties),
  ...(schriftVariablen(schriftId) as CSSProperties),
  display: 'flex',
  alignItems: 'center',
  gap: abstand('m'),
  marginTop: abstand('s'),
  padding: abstand('m'),
  borderRadius: '18px',
  backgroundColor: rubrikFarbe('kartenflaeche'),
  boxShadow: kartenSchatten,
  fontFamily: schrift,
});

const vorschauCoverStil: CSSProperties = {
  flex: '0 0 auto',
  display: 'flex',
  alignItems: 'flex-end',
  boxSizing: 'border-box',
  width: '44px',
  height: '64px',
  padding: abstand('xs'),
  borderRadius: '6px',
  backgroundColor: rubrikFarbe('primaer'),
  color: rubrikFarbe('hintergrund'),
  ...textstufe('label'),
  fontWeight: 700,
  lineHeight: 1.1,
};

const vorschauTextStil: CSSProperties = { flex: '1 1 auto', minWidth: 0, display: 'flex', flexDirection: 'column', gap: abstand('xs') };
const vorschauTitelStil: CSSProperties = { ...textstufe('titel'), fontWeight: 700, lineHeight: 1.2, color: rubrikFarbe('dunkelbraun') };
const vorschauAutorStil: CSSProperties = { ...textstufe('meta'), fontStyle: 'italic', color: rubrikFarbe('tertiaer') };
const vorschauBalkenStil: CSSProperties = { height: '6px', borderRadius: '3px', backgroundColor: rubrikFarbe('ghostframe'), overflow: 'hidden' };
const vorschauFuellungStil: CSSProperties = { width: '62%', height: '100%', backgroundColor: rubrikFarbe('primaer') };
const vorschauPilleStil: CSSProperties = {
  alignSelf: 'flex-start',
  padding: `0 ${abstand('s')}`,
  borderRadius: '999px',
  backgroundColor: rubrikFarbe('sekundaer'),
  color: rubrikFarbe('dunkelbraun'),
  ...textstufe('meta'),
};

// Umschaltpille „Farben | Schriftart | Stil“ wie die Reiterleiste (REQ-043): Die aktive Pille wandert fließend.
const INNEN = 4;
const umschalterStil: CSSProperties = {
  position: 'relative',
  boxSizing: 'border-box',
  display: 'flex',
  marginTop: abstand('l'),
  height: '44px',
  padding: `${INNEN}px`,
  borderRadius: '22px',
  backgroundColor: rezensionFarbe('reiterleisteFlaeche'),
};

const umschalterPilleStil = (index: number): CSSProperties => ({
  position: 'absolute',
  top: `${INNEN}px`,
  bottom: `${INNEN}px`,
  left: `calc(${INNEN}px + (100% - ${2 * INNEN}px) * ${index / REITER.length})`,
  width: `calc((100% - ${2 * INNEN}px) / ${REITER.length})`,
  borderRadius: '18px',
  backgroundColor: rezensionFarbe('reiterAktivFlaeche'),
  boxShadow: reiterPilleSchatten,
  transition: `left ${UEBERGANG}`,
});

const umschalterKnopfStil = (aktiv: boolean): CSSProperties => ({
  ...knopf,
  position: 'relative',
  zIndex: 1,
  flex: '1 1 0',
  padding: 0,
  border: 'none',
  background: 'none',
  ...textstufe('text'),
  fontWeight: 700,
  color: rezensionFarbe(aktiv ? 'reiterAktivSchrift' : 'reiterInaktivIcon'),
  transition: `color ${UEBERGANG}`,
});

const kreiseStil: CSSProperties = { display: 'flex', gap: abstand('xs'), flex: '0 0 auto' };
const farbkreisStil = (farbe: string): CSSProperties => ({
  display: 'block',
  width: '18px',
  height: '18px',
  borderRadius: '50%',
  backgroundColor: farbe,
  boxShadow: `inset 0 0 0 1px color-mix(in srgb, ${rubrikFarbe('dunkelbraun')} 18%, transparent)`,
});

// Mini-Skizze je Stil (REQ-071): Filterreihe und Bucheintrag mit Cover und Balken in den aktuellen Farben.
// Die Inline-Werte zeigen „Klassisch“; andere Stile formen die Skizze über dieselben zentralen Regeln um
// (Attribute data-stil-skizze/data-skizze-rolle, src/theme/stil.ts).
const skizzeStil: CSSProperties = {
  flex: '0 0 auto',
  boxSizing: 'border-box',
  display: 'flex',
  flexDirection: 'column',
  gap: '5px',
  width: '84px',
  padding: '6px',
  borderRadius: '10px',
  backgroundColor: rubrikFarbe('hintergrund'),
  boxShadow: `inset 0 0 0 1px color-mix(in srgb, ${rubrikFarbe('dunkelbraun')} 12%, transparent)`,
};
const skizzeFilterReiheStil: CSSProperties = { display: 'flex', gap: '3px' };
// Filter als Pille; der Strich darin steht für den Filtertext und folgt der Schriftfarbe (currentColor).
const skizzeFilterStil = (aktiv: boolean): CSSProperties => ({
  boxSizing: 'border-box',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '22px',
  height: '9px',
  borderRadius: '5px',
  backgroundColor: rubrikFarbe(aktiv ? 'primaer' : 'ghost'),
  color: rubrikFarbe(aktiv ? 'hintergrund' : 'tertiaer'),
});
const skizzeFilterTextStil: CSSProperties = { display: 'block', width: '12px', height: '2px', backgroundColor: 'currentColor' };
const skizzeEintragStil: CSSProperties = {
  display: 'flex',
  gap: '5px',
  padding: '4px',
  borderRadius: '6px',
  backgroundColor: rubrikFarbe('kartenflaeche'),
  boxShadow: kartenSchatten,
};
const skizzeCoverStil: CSSProperties = {
  flex: '0 0 auto',
  boxSizing: 'border-box',
  width: '14px',
  height: '21px',
  borderRadius: '2px',
  backgroundColor: rubrikFarbe('ghost'),
};
const skizzeTextStil: CSSProperties = { flex: '1 1 auto', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '4px' };
const skizzeTitelStil: CSSProperties = { height: '4px', width: '80%', borderRadius: '2px', backgroundColor: rubrikFarbe('dunkelbraun') };
const skizzeBalkenStil: CSSProperties = {
  position: 'relative',
  height: '4px',
  borderRadius: '2px',
  overflow: 'hidden',
  backgroundColor: rubrikFarbe('ghostframe'),
};
const skizzeFuellungStil: CSSProperties = { display: 'block', width: '60%', height: '100%', borderRadius: '2px', backgroundColor: rubrikFarbe('primaer') };

/** Mini-Skizze eines Stils in den aktuellen Farben (REQ-071 AK-2, AK-6). */
function StilSkizze({ id }: { id: StilId }) {
  return (
    <span data-stil-skizze={id} aria-hidden="true" style={skizzeStil}>
      <span data-skizze-filterreihe="" style={skizzeFilterReiheStil}>
        {[true, false, false].map((aktiv, i) => (
          <span
            key={i}
            data-skizze-filter={aktiv ? 'aktiv' : 'inaktiv'}
            data-aktiv={aktiv ? 'true' : 'false'}
            {...skizzeRolle('reiter')}
            style={skizzeFilterStil(aktiv)}
          >
            <span style={skizzeFilterTextStil} />
          </span>
        ))}
      </span>
      <span data-skizze-eintrag="" {...skizzeRolle('eintrag')} style={skizzeEintragStil}>
        <span data-skizze-cover="" {...skizzeRolle('cover')} style={skizzeCoverStil} />
        <span style={skizzeTextStil}>
          <span style={skizzeTitelStil} />
          <span data-skizze-balken="" {...skizzeRolle('balken')} style={skizzeBalkenStil}>
            <span {...skizzeRolle('balkenfuellung')} style={skizzeFuellungStil} />
          </span>
        </span>
      </span>
    </span>
  );
}

const markeStil: CSSProperties = {
  flex: '0 0 auto',
  boxSizing: 'border-box',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '22px',
  height: '22px',
  borderRadius: '50%',
};

/** Haken (gewählt) bzw. leerer Kreis am Zeilenende; auch im Blatt „„Für dich“ anpassen“ (REQ-108). */
export function Marke({ aktiv }: { aktiv: boolean }) {
  return aktiv ? (
    <span data-haken="" style={{ ...markeStil, backgroundColor: detailsFarbe('hakenFlaeche') }}>
      <Symbolbild name="haken" farbe={detailsFarbe('hakenIcon')} groesse={14} />
    </span>
  ) : (
    <span data-kreis="" style={{ ...markeStil, border: `2px solid ${detailsFarbe('kreisRahmen')}` }} />
  );
}

/** Beispielstatus der Vorschau aus der zentralen Lesestatus-Definition (keine fest eingebauten Namen, REQ-007 AK-7). */
const vorschauStatus = LESESTATUS.find((s) => s.id === 'am_lesen')?.bezeichnung ?? '';

/** Mini-Buchkarte im gewählten Farbdesign und in der gewählten Schrift (REQ-067 AK-3). */
function Vorschau({ farbdesign, schriftId }: { farbdesign: FarbdesignId; schriftId: SchriftId }) {
  return (
    <div
      data-design-vorschau=""
      data-farbdesign={farbdesign}
      data-schrift={schriftId}
      aria-hidden="true"
      {...stilRolle('eintrag')}
      style={vorschauStil(farbdesign, schriftId)}
    >
      <span {...stilRolle('cover')} style={vorschauCoverStil}>
        Buch
      </span>
      <span style={vorschauTextStil}>
        <span {...stilRolle('buchtitel')} style={vorschauTitelStil}>
          Die Bücherdiebin
        </span>
        <span style={vorschauAutorStil}>Markus Zusak</span>
        <span {...stilRolle('balken')} style={vorschauBalkenStil}>
          <span {...stilRolle('balkenfuellung')} style={{ display: 'block', ...vorschauFuellungStil }} />
        </span>
        {vorschauStatus ? (
          <span {...stilRolle('chip')} style={vorschauPilleStil}>
            {vorschauStatus}
          </span>
        ) : null}
      </span>
    </div>
  );
}

interface Props {
  /** Schließen über X, Herunterziehen, Tippen außerhalb oder Zurück-Taste; die Wahl bleibt erhalten (REQ-067 AK-4). */
  onSchliessen: () => void;
}

/** Fenster „Design“ mit Live-Vorschau, Umschaltpille und den Listen der Farbdesigns, Schriften und Stile (REQ-067 bis REQ-069, REQ-071). */
export default function FensterDesign({ onSchliessen }: Props) {
  const { farbdesign, schrift: schriftId, stil, farbdesignWaehlen, schriftWaehlen, stilWaehlen } = useDesign();
  const [reiter, setReiter] = useState<DesignReiter>('farben');
  const [versatz, setVersatz] = useState(0);
  const zug = useRef<{ start: number; strecke: number } | null>(null);

  const verlassen = useZurueckTaste(() => {
    onSchliessen();
    return false;
  });

  const schliessen = () => {
    verlassen();
    onSchliessen();
  };

  const zugStart = (e: ReactPointerEvent<HTMLDivElement>) => {
    zug.current = { start: e.clientY, strecke: 0 };
    e.currentTarget.setPointerCapture?.(e.pointerId);
  };
  const zugBewegen = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!zug.current) return;
    zug.current.strecke = Math.max(0, e.clientY - zug.current.start);
    setVersatz(zug.current.strecke);
  };
  const zugEnde = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!zug.current) return;
    const strecke = Math.max(zug.current.strecke, e.clientY - zug.current.start);
    zug.current = null;
    if (Number.isFinite(strecke) && strecke >= SCHREIBFENSTER_ZUG_SCHWELLE) {
      schliessen();
      return;
    }
    setVersatz(0);
  };
  const zugAbbrechen = () => {
    zug.current = null;
    setVersatz(0);
  };

  const index = REITER.findIndex((r) => r.id === reiter);

  return (
    <>
      <div data-design-hintergrund="" onClick={schliessen} style={hintergrundStil} />
      <div role="dialog" aria-modal="true" aria-label="Design" data-fenster-design="" {...stilRolle('blatt')} style={fensterStil(versatz)}>
        <div
          data-ziehgriff=""
          onPointerDown={zugStart}
          onPointerMove={zugBewegen}
          onPointerUp={zugEnde}
          onPointerCancel={zugAbbrechen}
          style={griffBereichStil}
        >
          <span style={griffStil} />
        </div>
        <div style={kopfStil}>
          <h2 data-design-titel="" style={titelStil}>
            Design
          </h2>
          <button type="button" aria-label="Schließen" data-design-schliessen="" onClick={schliessen} style={schliessenStil}>
            <Symbolbild name="schliessen" farbe={rezensionFarbe('schliessenIcon')} groesse={18} />
          </button>
        </div>

        <Vorschau farbdesign={farbdesign} schriftId={schriftId} />

        <div role="tablist" aria-label="Design-Bereich" data-design-umschalter="" {...stilRolle('leiste')} style={umschalterStil}>
          <div aria-hidden="true" data-design-umschalter-pille="" data-reiter-index={index} {...stilRolle('leistenpille')} style={umschalterPilleStil(index)} />
          {REITER.map((r) => {
            const aktiv = r.id === reiter;
            return (
              <button
                key={r.id}
                type="button"
                role="tab"
                aria-selected={aktiv}
                data-design-reiter={r.id}
                data-aktiv={aktiv ? 'true' : 'false'}
                onClick={() => setReiter(r.id)}
                {...stilRolle('reiter')}
                style={umschalterKnopfStil(aktiv)}
              >
                {r.name}
              </button>
            );
          })}
        </div>

        {reiter === 'farben' ? (
          <div role="radiogroup" aria-label="Farbdesigns" data-design-liste="farben" style={listeStil}>
            {farbdesignReihenfolge.map((id) => {
              const aktiv = id === farbdesign;
              const design = farbdesigns[id];
              return (
                <button
                  key={id}
                  type="button"
                  role="radio"
                  aria-checked={aktiv}
                  data-farbdesign={id}
                  data-aktiv={aktiv ? 'true' : 'false'}
                  onClick={() => farbdesignWaehlen(id)}
                  {...stilRolle('eintrag')}
                  style={zeileStil(aktiv)}
                >
                  <span data-farbdesign-name="" style={zeileNameStil}>
                    {design.name}
                  </span>
                  <span data-farbkreise="" style={kreiseStil}>
                    {designVorschauRubriken.map((rubrik) => (
                      <span key={rubrik} data-farbkreis={rubrik} data-farbwert={design.werte[rubrik]} style={farbkreisStil(design.werte[rubrik])} />
                    ))}
                  </span>
                  <Marke aktiv={aktiv} />
                </button>
              );
            })}
          </div>
        ) : reiter === 'schriftart' ? (
          <div role="radiogroup" aria-label="Schriften" data-design-liste="schriftart" style={listeStil}>
            {schriftReihenfolge.map((id) => {
              const aktiv = id === schriftId;
              const s = schriften[id];
              // Einzige Ausnahme von der zentralen App-Schrift: Name und Beispiel in der eigenen Schrift (REQ-069).
              const eigeneSchrift: CSSProperties = { fontFamily: s.folge };
              return (
                <button
                  key={id}
                  type="button"
                  role="radio"
                  aria-checked={aktiv}
                  data-schrift-zeile={id}
                  data-aktiv={aktiv ? 'true' : 'false'}
                  onClick={() => schriftWaehlen(id)}
                  {...stilRolle('eintrag')}
                  style={zeileStil(aktiv)}
                >
                  <span style={{ flex: '1 1 auto', minWidth: 0, display: 'flex', flexDirection: 'column' }}>
                    <span data-schrift-name="" style={{ ...zeileNameStil, ...eigeneSchrift }}>
                      {s.name}
                    </span>
                    <span data-schrift-beispiel="" style={{ ...textstufe('meta'), ...eigeneSchrift, color: detailsFarbe('zeileWert') }}>
                      {schriftBeispiel}
                    </span>
                  </span>
                  <Marke aktiv={aktiv} />
                </button>
              );
            })}
          </div>
        ) : (
          <div role="radiogroup" aria-label="Stile" data-design-liste="stil" style={listeStil}>
            {stilReihenfolge.map((id) => {
              const aktiv = id === stil;
              return (
                <button
                  key={id}
                  type="button"
                  role="radio"
                  aria-checked={aktiv}
                  data-stil-zeile={id}
                  data-aktiv={aktiv ? 'true' : 'false'}
                  onClick={() => stilWaehlen(id)}
                  {...stilRolle('eintrag')}
                  style={zeileStil(aktiv)}
                >
                  <StilSkizze id={id} />
                  <span style={{ flex: '1 1 auto', minWidth: 0, display: 'flex', flexDirection: 'column' }}>
                    <span data-stil-name="" style={zeileNameStil}>
                      {stile[id].name}
                    </span>
                    <span data-stil-satz="" style={{ ...textstufe('meta'), fontStyle: 'italic', color: detailsFarbe('zeileWert') }}>
                      {stile[id].satz}
                    </span>
                  </span>
                  <Marke aktiv={aktiv} />
                </button>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
