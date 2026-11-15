import { useRef, useState, type CSSProperties, type PointerEvent as ReactPointerEvent, type ReactNode } from 'react';
import Symbolbild, { type SymbolName } from '@/components/Symbolbild';
import {
  EXEMPLARE,
  FORMATE,
  SONDERAUSGABEN,
  UNTERFORMATE,
  formatangabenBereinigen,
  sonderausgabeAntippen,
  sonderausgabeName,
  type Formatangaben,
  type FormatId,
  type UnterformatId,
} from '@/domain/ausgabe';
import { useZurueckTaste } from '@/plattform/zurueckTaste';
import { abdunklung, buchHellFlaeche, detailsFarbe, rezensionFarbe, sichernKante, sonderPilleGewaehltFlaeche } from '@/theme';
import { SCHREIBFENSTER_ZUG_SCHWELLE } from './rezension';

const RAND_FENSTER = 20;

const hintergrundStil: CSSProperties = {
  position: 'fixed',
  inset: 0,
  zIndex: 30,
  backgroundColor: abdunklung,
  animation: 'bz-abdunklung-ein 200ms ease-out',
};

const fensterStil = (versatz: number): CSSProperties => ({
  position: 'fixed',
  left: 0,
  right: 0,
  bottom: 0,
  zIndex: 31,
  boxSizing: 'border-box',
  maxHeight: 'calc(100% - 40px)',
  overflowY: 'auto',
  padding: `0 ${RAND_FENSTER}px calc(16px + var(--safe-area-inset-bottom, env(safe-area-inset-bottom, 0px)))`,
  borderTopLeftRadius: '28px',
  borderTopRightRadius: '28px',
  backgroundColor: rezensionFarbe('fensterFlaeche'),
  animation: 'bz-blatt-ein 220ms ease-out',
  transform: versatz > 0 ? `translateY(${versatz}px)` : undefined,
  transition: versatz > 0 ? undefined : 'transform 160ms ease-out',
});

const griffBereichStil: CSSProperties = {
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  height: '32px',
  touchAction: 'none',
  cursor: 'grab',
};

const griffStil: CSSProperties = { width: '40px', height: '5px', borderRadius: '3px', backgroundColor: rezensionFarbe('ziehgriff') };

const kopfStil: CSSProperties = { position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', height: '52px' };

const titelStil: CSSProperties = { margin: 0, fontSize: '20px', fontWeight: 700, color: rezensionFarbe('fensterTitel') };

const schliessenStil: CSSProperties = {
  position: 'absolute',
  right: 0,
  top: '50%',
  transform: 'translateY(-50%)',
  boxSizing: 'border-box',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '38px',
  height: '38px',
  margin: 0,
  padding: 0,
  borderRadius: '50%',
  border: `2px solid ${rezensionFarbe('schliessenRahmen')}`,
  backgroundColor: rezensionFarbe('schliessenFlaeche'),
  cursor: 'pointer',
  WebkitTapHighlightColor: 'transparent',
};

const knopf: CSSProperties = { margin: 0, fontFamily: 'inherit', cursor: 'pointer', WebkitTapHighlightColor: 'transparent' };

const kachelnStil: CSSProperties = { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginTop: '8px' };

const kachelStil = (gewaehlt: boolean): CSSProperties => ({
  ...knopf,
  position: 'relative',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '8px',
  padding: '18px 4px 14px',
  borderRadius: '18px',
  border: `2px solid ${detailsFarbe(gewaehlt ? 'kachelGewaehltRahmen' : 'kachelRahmen')}`,
  backgroundColor: detailsFarbe(gewaehlt ? 'kachelGewaehltFlaeche' : 'kachelFlaeche'),
  color: detailsFarbe(gewaehlt ? 'kachelGewaehltSchrift' : 'kachelSchrift'),
  fontSize: '15px',
  fontWeight: 600,
});

const markeStil: CSSProperties = {
  position: 'absolute',
  top: '6px',
  right: '6px',
  boxSizing: 'border-box',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '22px',
  height: '22px',
  borderRadius: '50%',
};

const karteStil: CSSProperties = {
  marginTop: '14px',
  padding: '14px 12px 14px',
  borderRadius: '22px',
  border: `2px solid ${detailsFarbe('kachelRahmen')}`,
  backgroundColor: detailsFarbe('kachelFlaeche'),
};

const karteKopfStil: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
  margin: '0 4px 12px',
  fontSize: '19px',
  fontWeight: 700,
  color: detailsFarbe('zeileBezeichnung'),
};

const unterKachelnStil: CSSProperties = { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' };

const unterKachelStil = (gewaehlt: boolean): CSSProperties => ({
  ...knopf,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'flex-end',
  gap: '6px',
  minHeight: '96px',
  padding: '10px 2px 8px',
  borderRadius: '16px',
  border: `2px solid ${gewaehlt ? detailsFarbe('kachelGewaehltRahmen') : 'transparent'}`,
  backgroundColor: detailsFarbe('unterKachelFlaeche'),
  color: detailsFarbe('zeileBezeichnung'),
  fontSize: '12.5px',
  fontWeight: 700,
  lineHeight: 1.15,
  overflowWrap: 'anywhere',
});

const sonderKopfStil: CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'baseline',
  margin: '14px 4px 10px',
  paddingTop: '12px',
  borderTop: `1.5px solid ${detailsFarbe('trennlinie')}`,
  fontSize: '18px',
  color: detailsFarbe('zeileBezeichnung'),
};

const sonderPillenStil: CSSProperties = { display: 'flex', flexWrap: 'wrap', gap: '8px' };

const sonderPilleStil = (gewaehlt: boolean): CSSProperties => ({
  ...knopf,
  padding: '8px 14px',
  border: 'none',
  borderRadius: '20px',
  backgroundColor: gewaehlt ? sonderPilleGewaehltFlaeche : detailsFarbe('sonderPilleFlaeche'),
  color: detailsFarbe(gewaehlt ? 'sonderPilleGewaehltSchrift' : 'sonderPilleSchrift'),
  fontSize: '15px',
  fontWeight: 600,
});

const frageStil: CSSProperties = {
  margin: '24px 6px 10px',
  fontSize: '14px',
  fontWeight: 700,
  letterSpacing: '0.06em',
  textTransform: 'uppercase',
  color: detailsFarbe('exemplarFrage'),
};

const exemplarFeldStil: CSSProperties = {
  display: 'flex',
  flexWrap: 'wrap',
  justifyContent: 'space-around',
  gap: '4px',
  padding: '5px',
  borderRadius: '18px',
  backgroundColor: detailsFarbe('exemplarFlaeche'),
};

const exemplarStil = (gewaehlt: boolean): CSSProperties => ({
  ...knopf,
  flex: '1 0 30%',
  padding: '9px 6px',
  border: 'none',
  borderRadius: '13px',
  backgroundColor: gewaehlt ? detailsFarbe('exemplarGewaehltFlaeche') : 'transparent',
  color: detailsFarbe(gewaehlt ? 'exemplarGewaehltSchrift' : 'exemplarSchrift'),
  fontSize: '17px',
  fontWeight: 600,
});

const sichernStil: CSSProperties = {
  ...knopf,
  display: 'block',
  boxSizing: 'border-box',
  width: '100%',
  height: '56px',
  marginTop: '22px',
  padding: 0,
  border: 'none',
  borderRadius: '28px',
  backgroundColor: rezensionFarbe('sichernFlaeche'),
  color: rezensionFarbe('sichernSchrift'),
  boxShadow: sichernKante,
  fontSize: '20px',
  fontWeight: 600,
};

const FORMAT_SYMBOL: Record<FormatId, SymbolName> = { print: 'buchPrint', ebook: 'tablet', hoerbuch: 'kopfhoerer' };

/** Selbst nachgebildete Buch-Icons der Unterformate (Referenzbild REF-details-03). */
function UnterformatBild({ id }: { id: UnterformatId }): ReactNode {
  const gemeinsam = { width: 44, height: 52, viewBox: '0 0 44 52', 'aria-hidden': true, style: { display: 'block' } } as const;
  switch (id) {
    case 'hardcover':
      return (
        <svg {...gemeinsam}>
          <rect x="6" y="2" width="32" height="48" rx="3" fill={detailsFarbe('buchDunkel')} />
          <rect x="12" y="8" width="20" height="2.5" rx="1" fill={detailsFarbe('buchAkzent')} />
        </svg>
      );
    case 'taschenbuch':
      return (
        <svg {...gemeinsam}>
          <rect x="9" y="6" width="27" height="40" rx="2" fill={buchHellFlaeche} />
          <rect x="9" y="6" width="3" height="40" fill={detailsFarbe('buchDunkel')} opacity="0.35" />
        </svg>
      );
    case 'kleinformat':
      return (
        <svg {...gemeinsam}>
          <rect x="13" y="22" width="19" height="28" rx="2" fill={buchHellFlaeche} />
          <rect x="13" y="22" width="2.5" height="28" fill={detailsFarbe('buchDunkel')} opacity="0.35" />
        </svg>
      );
    case 'weissNicht':
      return (
        <svg {...gemeinsam}>
          <rect x="9" y="6" width="26" height="40" rx="3" fill="none" stroke={detailsFarbe('zeileBezeichnung')} strokeWidth="2" />
          <text x="22" y="32" textAnchor="middle" fontSize="16" fontWeight="700" fill={detailsFarbe('zeileBezeichnung')}>
            ?
          </text>
        </svg>
      );
  }
}

interface Props {
  /** Gespeicherter Stand als Startauswahl; ohne Angaben ist nichts gewählt (REQ-058, AK-2/AK-3). */
  start: Formatangaben;
  /** „Sichern“: bereinigte Auswahl (REQ-058, AK-8). */
  onSichern: (angaben: Formatangaben) => void;
  /** Schließen ohne Sichern (X, Herunterziehen, Tippen außerhalb, Zurück-Taste): nichts speichern (AK-9). */
  onSchliessen: () => void;
}

/** Fenster „Format“ für Format, Unterformat, Sonderausgabe und Exemplar (REQ-058). */
export default function FensterFormat({ start, onSichern, onSchliessen }: Props) {
  const [wahl, setWahl] = useState<Formatangaben>(start);
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

  const sichern = () => {
    verlassen();
    onSichern(formatangabenBereinigen(wahl));
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

  const sonderName = sonderausgabeName(wahl.sonderausgabe);

  return (
    <>
      <div data-format-hintergrund="" onClick={schliessen} style={hintergrundStil} />
      <div role="dialog" aria-modal="true" aria-label="Format" data-fenster-format="" style={fensterStil(versatz)}>
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
          <h2 data-format-titel="" style={titelStil}>
            Format
          </h2>
          <button type="button" aria-label="Schließen" data-format-schliessen="" onClick={schliessen} style={schliessenStil}>
            <Symbolbild name="schliessen" farbe={rezensionFarbe('schliessenIcon')} groesse={20} />
          </button>
        </div>

        <div role="group" aria-label="Format wählen" style={kachelnStil}>
          {FORMATE.map((f) => {
            const gewaehlt = wahl.format === f.id;
            return (
              <button
                key={f.id}
                type="button"
                aria-pressed={gewaehlt}
                data-format-kachel={f.id}
                data-gewaehlt={gewaehlt ? 'true' : 'false'}
                onClick={() => setWahl((w) => ({ ...w, format: f.id }))}
                style={kachelStil(gewaehlt)}
              >
                {gewaehlt ? (
                  <span data-haken="" style={{ ...markeStil, backgroundColor: detailsFarbe('hakenFlaeche') }}>
                    <Symbolbild name="haken" farbe={detailsFarbe('hakenIcon')} groesse={14} />
                  </span>
                ) : (
                  <span data-kreis="" style={{ ...markeStil, border: `2px solid ${detailsFarbe('kreisRahmen')}` }} />
                )}
                <Symbolbild name={FORMAT_SYMBOL[f.id]} farbe={detailsFarbe(gewaehlt ? 'kachelGewaehltSchrift' : 'kachelIcon')} groesse={34} />
                <span>{f.name}</span>
              </button>
            );
          })}
        </div>

        {wahl.format === 'print' ? (
          <div data-print-karte="" style={karteStil}>
            <div style={karteKopfStil}>
              <Symbolbild name="buchPrint" farbe={detailsFarbe('buchDunkel')} groesse={24} />
              <span>Print</span>
            </div>
            <div role="group" aria-label="Unterformat" style={unterKachelnStil}>
              {UNTERFORMATE.map((u) => {
                const gewaehlt = wahl.unterformat === u.id;
                return (
                  <button
                    key={u.id}
                    type="button"
                    aria-pressed={gewaehlt}
                    data-unterformat={u.id}
                    data-gewaehlt={gewaehlt ? 'true' : 'false'}
                    onClick={() => setWahl((w) => ({ ...w, unterformat: u.id }))}
                    style={unterKachelStil(gewaehlt)}
                  >
                    <UnterformatBild id={u.id} />
                    <span>{u.name}</span>
                  </button>
                );
              })}
            </div>
            <div style={sonderKopfStil}>
              <span>Sonderausgabe</span>
              <strong data-sonderausgabe-anzeige="" style={{ color: detailsFarbe('sonderGewaehlt') }}>
                {sonderName ?? ''}
              </strong>
            </div>
            <div role="group" aria-label="Sonderausgabe" style={sonderPillenStil}>
              {SONDERAUSGABEN.map((s) => {
                const gewaehlt = wahl.sonderausgabe === s.id;
                return (
                  <button
                    key={s.id}
                    type="button"
                    aria-pressed={gewaehlt}
                    data-sonderausgabe={s.id}
                    data-gewaehlt={gewaehlt ? 'true' : 'false'}
                    onClick={() => setWahl((w) => ({ ...w, sonderausgabe: sonderausgabeAntippen(w.sonderausgabe, s.id) }))}
                    style={sonderPilleStil(gewaehlt)}
                  >
                    {s.name}
                  </button>
                );
              })}
            </div>
          </div>
        ) : null}

        <p data-exemplar-frage="" style={frageStil}>
          Wem gehört dieses Exemplar?
        </p>
        <div role="group" aria-label="Exemplar" style={exemplarFeldStil}>
          {EXEMPLARE.map((x) => {
            const gewaehlt = wahl.exemplar === x.id;
            return (
              <button
                key={x.id}
                type="button"
                aria-pressed={gewaehlt}
                data-exemplar={x.id}
                data-gewaehlt={gewaehlt ? 'true' : 'false'}
                onClick={() => setWahl((w) => ({ ...w, exemplar: x.id }))}
                style={exemplarStil(gewaehlt)}
              >
                {x.name}
              </button>
            );
          })}
        </div>

        <button type="button" data-format-sichern="" onClick={sichern} style={sichernStil}>
          Sichern
        </button>
      </div>
    </>
  );
}
