import type { CSSProperties } from 'react';
import { hilfslinien, kachelWert, type Balken, type Kachel } from '@/domain/statistik';
import { abstand, statistikFarbe, textstufe } from '@/theme';

// Balkendiagramm (REQ-083) mit gestapelten Seiten (REQ-084). Maße nach REF-statistik-01/-07, kein Akzeptanzkriterium.
const HOEHE = 150;
const GRUNDLINIE = 3;
const SKALA_BREITE = 28;

const rahmenStil: CSSProperties = { marginTop: abstand('l') };

const flaecheStil: CSSProperties = {
  position: 'relative',
  height: `${HOEHE}px`,
  marginRight: `${SKALA_BREITE}px`,
};

const linieStil = (anteil: number): CSSProperties => ({
  position: 'absolute',
  left: 0,
  right: 0,
  bottom: `${anteil * 100}%`,
  height: '1px',
  backgroundColor: statistikFarbe('hilfslinie'),
});

const skalaStil: CSSProperties = {
  position: 'absolute',
  left: '100%',
  width: `${SKALA_BREITE}px`,
  top: 0,
  transform: 'translateY(-50%)',
  textAlign: 'right',
  ...textstufe('label'),
  lineHeight: 1,
  color: statistikFarbe('skala'),
};

const balkenReiheStil: CSSProperties = {
  position: 'absolute',
  inset: 0,
  display: 'flex',
  alignItems: 'flex-end',
  gap: '3px',
};

const spalteStil: CSSProperties = {
  position: 'relative',
  flex: '1 1 0',
  minWidth: 0,
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'flex-end',
  alignItems: 'center',
};

const saeuleStil = (anteil: number, schmal: boolean): CSSProperties => ({
  width: schmal ? '70%' : '62%',
  height: `${anteil * 100}%`,
  display: 'flex',
  flexDirection: 'column-reverse',
  borderRadius: '4px 4px 0 0',
  overflow: 'hidden',
});

const grundlinieStil: CSSProperties = {
  width: '70%',
  height: `${GRUNDLINIE}px`,
  borderRadius: '2px',
  backgroundColor: statistikFarbe('balkenLeer'),
};

const achseStil: CSSProperties = {
  display: 'flex',
  gap: '3px',
  marginTop: abstand('s'),
  marginRight: `${SKALA_BREITE}px`,
};

const achsenTextStil: CSSProperties = {
  flex: '1 1 0',
  minWidth: 0,
  textAlign: 'center',
  whiteSpace: 'nowrap',
  overflow: 'visible',
  ...textstufe('label'),
  textTransform: 'none',
  letterSpacing: 0,
  lineHeight: 1,
  color: statistikFarbe('achse'),
};

const legendeStil: CSSProperties = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: `${abstand('xs')} ${abstand('l')}`,
  marginTop: abstand('m'),
  ...textstufe('meta'),
  color: statistikFarbe('legende'),
};

const legendeEintragStil: CSSProperties = { display: 'inline-flex', alignItems: 'center', gap: abstand('xs') };

const punktStil = (farbe: string): CSSProperties => ({
  display: 'inline-block',
  width: '10px',
  height: '10px',
  borderRadius: '3px',
  backgroundColor: farbe,
});

interface Props {
  balken: Balken[];
  kachel: Kachel;
}

/**
 * Balkendiagramm des Zeitraums: Wert der gewählten Kachel je Abschnitt, Hilfslinien mit Skala rechts (REQ-083).
 * „Seiten“: gestapelt „in Sessions“ (Primär) unten und „aus beendeten Büchern“ (Gold) darüber, Legende darunter
 * (REQ-084). „Bücher“: einfarbig Primär. Wert 0 = leere Grundlinie.
 */
export default function Diagramm({ balken, kachel }: Props) {
  const werte = balken.map((b) => kachelWert(b, kachel));
  const linien = hilfslinien(Math.max(0, ...werte));
  const oben = linien[linien.length - 1];
  const schmal = balken.length > 12;
  return (
    <div data-diagramm={kachel} style={rahmenStil}>
      <div data-diagramm-flaeche="" style={flaecheStil}>
        {linien
          .filter((w) => w > 0)
          .map((w) => (
            <div key={w} data-hilfslinie={w} style={linieStil(w / oben)}>
              <span data-skala={w} style={skalaStil}>
                {w}
              </span>
            </div>
          ))}
        <div style={balkenReiheStil}>
          {balken.map((b, i) => {
            const wert = werte[i];
            const teile =
              kachel === 'seiten'
                ? [
                    { art: 'sessions', wert: b.inSessions, farbe: statistikFarbe('balkenSessions') },
                    { art: 'beendet', wert: b.ausBeendeten, farbe: statistikFarbe('balkenBeendet') },
                  ]
                : [{ art: 'buecher', wert: b.buecher, farbe: statistikFarbe('balkenBuecher') }];
            return (
              <div key={i} data-balken={i} data-wert={wert} data-beschriftung={b.beschriftung} style={spalteStil}>
                {wert > 0 ? (
                  <div data-saeule="" style={saeuleStil(wert / oben, schmal)}>
                    {teile
                      .filter((t) => t.wert > 0)
                      .map((t) => (
                        <div
                          key={t.art}
                          data-balken-teil={t.art}
                          data-wert={t.wert}
                          style={{ flex: `0 0 ${(t.wert / wert) * 100}%`, backgroundColor: t.farbe }}
                        />
                      ))}
                  </div>
                ) : (
                  <div data-grundlinie="" style={grundlinieStil} />
                )}
              </div>
            );
          })}
        </div>
      </div>
      <div data-achse="" style={achseStil}>
        {balken.map((b, i) => (
          <span key={i} data-achse-text={i} style={achsenTextStil}>
            {b.beschriftung}
          </span>
        ))}
      </div>
      {kachel === 'seiten' ? (
        <div data-legende="" style={legendeStil}>
          <span data-legende-eintrag="sessions" style={legendeEintragStil}>
            <span data-legende-farbe="sessions" style={punktStil(statistikFarbe('balkenSessions'))} />
            in Sessions
          </span>
          <span data-legende-eintrag="beendet" style={legendeEintragStil}>
            <span data-legende-farbe="beendet" style={punktStil(statistikFarbe('balkenBeendet'))} />
            aus beendeten Büchern
          </span>
        </div>
      ) : null}
    </div>
  );
}
