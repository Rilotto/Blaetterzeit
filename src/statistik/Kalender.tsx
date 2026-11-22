import type { CSSProperties } from 'react';
import CoverPlatzhalter from '@/components/CoverPlatzhalter';
import { KALENDER_WOCHENTAGE, type Kalender, type MiniMonat } from '@/domain/statistik';
import { abstand, statistikFarbe, stilRolle, textstufe } from '@/theme';

// Kalenderkarte Woche/Monat (REQ-088) und Jahreskalender (REQ-089). Maße nach REF-statistik-05/-07, kein AK.

const rasterStil: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(7, minmax(0, 1fr))',
  gap: '6px',
};

const wochentagStil: CSSProperties = {
  textAlign: 'center',
  ...textstufe('label'),
  fontWeight: 700,
  color: statistikFarbe('wochentag'),
};

const tagStil = (spalte: number, erster: boolean, heute: boolean): CSSProperties => ({
  position: 'relative',
  boxSizing: 'border-box',
  ...(erster ? { gridColumnStart: spalte + 1 } : {}),
  aspectRatio: '2 / 3',
  borderRadius: '6px',
  overflow: 'hidden',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: statistikFarbe('tagFlaeche'),
  // Umrandung als outline (nicht border), damit sie auch im Stil „Feuilleton“ sichtbar bleibt.
  ...(heute ? { outline: `2px solid ${statistikFarbe('heuteRahmen')}`, outlineOffset: '-2px' } : {}),
});

const tagZahlStil: CSSProperties = { ...textstufe('text'), color: statistikFarbe('tagZahl') };

const coverStil: CSSProperties = { position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' };

const platzhalterStil: CSSProperties = {
  position: 'absolute',
  inset: 0,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};

interface KalenderProps {
  kalender: Kalender;
  art: 'woche' | 'monat';
  /** Frontcover je Buch-ID (REQ-020). */
  frontcover: Record<string, string>;
}

/**
 * Kalenderkarte für Woche und Monat (REQ-088): Wochentagszeile MO–SO, je Tag eine Kachel mit Tageszahl, an
 * Lesetagen das Cover des Buches mit der letzten Sitzung des Tages (ohne Cover: Platzhalter), heute umrandet.
 * Antippen bewirkt nichts.
 */
export function KalenderKarte({ kalender, art, frontcover }: KalenderProps) {
  return (
    <div data-kalender={art}>
      <div data-kalender-wochentage="" style={{ ...rasterStil, marginBottom: abstand('s') }}>
        {KALENDER_WOCHENTAGE.map((w) => (
          <span key={w} data-kalender-wochentag={w} style={wochentagStil}>
            {w}
          </span>
        ))}
      </div>
      <div data-kalender-raster="" style={rasterStil}>
        {kalender.tage.map((t, i) => {
          const spalte = (kalender.versatz + i) % 7;
          const cover = t.buch ? frontcover[t.buch.id] : undefined;
          return (
            <div
              key={t.schluessel}
              data-kalender-tag={t.schluessel}
              data-tag={t.tag}
              data-spalte={spalte}
              data-heute={t.heute ? 'true' : 'false'}
              data-gelesen={t.gelesen ? 'true' : 'false'}
              {...(t.buch ? { 'data-buch-id': t.buch.id } : {})}
              {...stilRolle('karte')}
              style={tagStil(spalte, i === 0, t.heute)}
            >
              {t.buch ? (
                cover ? (
                  <img data-kalender-cover={t.buch.id} src={cover} alt={t.buch.titel} style={coverStil} />
                ) : (
                  <div data-kalender-cover-platzhalter={t.buch.id} style={platzhalterStil}>
                    <CoverPlatzhalter breite={44} hoehe={66} />
                  </div>
                )
              ) : (
                <span data-kalender-tagzahl="" style={tagZahlStil}>
                  {t.tag}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

const jahrRasterStil: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
  gap: `${abstand('l')} ${abstand('m')}`,
};

const kuerzelStil: CSSProperties = {
  textAlign: 'center',
  margin: `0 0 ${abstand('xs')}`,
  ...textstufe('meta'),
  color: statistikFarbe('monatKuerzel'),
};

const miniRasterStil: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(7, minmax(0, 1fr))',
  gap: '2px',
};

const miniFeldStil = (spalte: number, erster: boolean, heute: boolean): CSSProperties => ({
  position: 'relative',
  boxSizing: 'border-box',
  ...(erster ? { gridColumnStart: spalte + 1 } : {}),
  aspectRatio: '1 / 1',
  borderRadius: '2px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: statistikFarbe('miniFeld'),
  ...(heute ? { outline: `1.5px solid ${statistikFarbe('heuteRahmen')}`, outlineOffset: '-1.5px' } : {}),
});

const lesepunktStil: CSSProperties = {
  width: '55%',
  height: '55%',
  borderRadius: '50%',
  backgroundColor: statistikFarbe('lesepunkt'),
};

/**
 * Zwölf Mini-Kalender eines Jahres (REQ-089): Monatskürzel, 7 Spalten Mo–So ohne Wochentagszeile, der 1. in der
 * Spalte seines Wochentags; Lesetage mit Punkt in „Primär“, heute umrandet.
 */
export function Jahreskalender({ monate }: { monate: MiniMonat[] }) {
  return (
    <div data-jahreskalender="" style={jahrRasterStil}>
      {monate.map((m, mi) => (
        <div key={m.kuerzel} data-mini-monat={mi}>
          <p data-mini-monat-kuerzel="" style={kuerzelStil}>
            {m.kuerzel}
          </p>
          <div data-mini-raster="" style={miniRasterStil}>
            {m.tage.map((t, i) => {
              const spalte = (m.versatz + i) % 7;
              return (
                <div
                  key={t.schluessel}
                  data-mini-tag={t.schluessel}
                  data-spalte={spalte}
                  data-heute={t.heute ? 'true' : 'false'}
                  data-gelesen={t.gelesen ? 'true' : 'false'}
                  style={miniFeldStil(spalte, i === 0, t.heute)}
                >
                  {t.gelesen ? <span data-lesepunkt="" style={lesepunktStil} /> : null}
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
