import { describe, expect, it } from 'vitest';
import { buchAusDaten, neuesBuch, statusSetzen, type Buch } from '@/domain/buch';
import { beendetAusText, beendetDatumText, beendetText } from '@/domain/ausgabe';
import { fortschrittSichern } from '@/domain/fortschritt';
import {
  balken,
  hilfslinien,
  jahreskalender,
  kalender,
  kennzahlen,
  lesetage,
  serie,
  seitenJeTag,
  vergleichText,
  zeitraumartLesen,
  zeitraumartSpeichern,
  zeitraumFuer,
  zeitraumTitel,
  zeitraumVerschieben,
} from '@/domain/statistik';
import { InMemoryEinstellungRepository } from '@/storage/InMemoryEinstellungRepository';

const um = (j: number, m: number, t: number, h = 12, min = 0) => new Date(j, m - 1, t, h, min);
const iso = (j: number, m: number, t: number, h = 12) => um(j, m, t, h).toISOString();
const buch = (extra: Partial<Buch> = {}): Buch => ({ ...neuesBuch({ titel: 'B', status: 'am_lesen' }), ...extra });
const HEUTE = um(2026, 11, 22); // Sonntag

describe('Zeiträume (REQ-080)', () => {
  it('Woche beginnt montags, Titel', () => {
    const w = zeitraumFuer('woche', HEUTE);
    expect(zeitraumTitel(w)).toEqual({ zeile1: '16 – 22 Nov', zeile2: '2026' });
    expect(zeitraumTitel(zeitraumFuer('woche', um(2026, 11, 23))).zeile1).toBe('23 – 29 Nov');
    expect(zeitraumTitel(zeitraumFuer('woche', um(2026, 12, 2))).zeile1).toBe('30 Nov – 6 Dez');
    expect(zeitraumTitel(zeitraumFuer('woche', um(2026, 12, 30)))).toEqual({ zeile1: '28 Dez – 3 Jan', zeile2: '2027' });
  });
  it('Monat und Jahr blättern', () => {
    const m = zeitraumFuer('monat', HEUTE);
    expect(zeitraumTitel(zeitraumVerschieben(m, -1))).toEqual({ zeile1: 'Oktober', zeile2: '2026' });
    expect(zeitraumTitel(zeitraumVerschieben(zeitraumFuer('jahr', HEUTE), 1))).toEqual({ zeile1: '2027' });
    expect(zeitraumTitel(zeitraumVerschieben(m, 2))).toEqual({ zeile1: 'Januar', zeile2: '2027' });
  });
});

describe('Seitenberechnung (REQ-084)', () => {
  it('Differenz je Tag und Prozentmodus', () => {
    const b = buch({ seitenanzahl: 400, sitzungen: [{ zeitpunkt: iso(2026, 11, 16, 9), seite: 20 }, { zeitpunkt: iso(2026, 11, 16, 20), seite: 50 }, { zeitpunkt: iso(2026, 11, 17), seite: 80 }] });
    const t = seitenJeTag([b]);
    expect(t.get('2026-11-16')?.inSessions).toBe(50);
    expect(t.get('2026-11-17')?.inSessions).toBe(30);
    let p = buch({ seitenanzahl: 400 });
    p = fortschrittSichern(p, 'prozent', 10, HEUTE);
    expect(p.sitzungen?.[0].seite).toBe(40);
    expect(seitenJeTag([p]).get('2026-11-22')?.inSessions).toBe(40);
  });
  it('nachgetragenes Buch und keine Doppelzählung', () => {
    const nach = buch({ status: 'gelesen', seitenanzahl: 300, beendetAm: '2026-03-05' });
    const b = balken([nach], zeitraumFuer('jahr', HEUTE));
    expect(b[2]).toMatchObject({ beschriftung: 'M', inSessions: 0, ausBeendeten: 300 });
    expect(kennzahlen([nach], zeitraumFuer('jahr', HEUTE)).seiten).toBe(300);
    const teil = buch({ status: 'gelesen', seitenanzahl: 400, beendetAm: '2026-11-10', sitzungen: [{ zeitpunkt: iso(2026, 10, 5), seite: 250 }] });
    const j = balken([teil], zeitraumFuer('jahr', HEUTE));
    expect([j[9].inSessions, j[10].ausBeendeten]).toEqual([250, 150]);
    expect(kennzahlen([teil], zeitraumFuer('jahr', HEUTE)).seiten).toBe(400);
  });
  it('negativer Tag zählt 0, alte Sitzung ohne Seite zählt 0, Obergrenze Seitenanzahl', () => {
    const b = buch({ seitenanzahl: 400, sitzungen: [{ zeitpunkt: iso(2026, 11, 21), seite: 100 }, { zeitpunkt: iso(2026, 11, 22), seite: 60 }] });
    expect(seitenJeTag([b]).get('2026-11-22')).toBeUndefined();
    const alt = buch({ seitenanzahl: 400, sitzungen: [{ zeitpunkt: iso(2026, 11, 20) }] });
    expect(seitenJeTag([alt]).size).toBe(0);
    expect(lesetage([alt], zeitraumFuer('woche', HEUTE)).gelesen).toBe(1);
    const auf = buch({ status: 'gelesen', beendetAm: '2026-11-22', seitenanzahl: 100, sitzungen: [{ zeitpunkt: iso(2026, 11, 18), seite: 100 }, { zeitpunkt: iso(2026, 11, 19), seite: 50 }, { zeitpunkt: iso(2026, 11, 20), seite: 100 }] });
    expect(kennzahlen([auf], zeitraumFuer('woche', HEUTE)).seiten).toBe(100);
  });
  it('Bücher nur mit Status gelesen und im Zeitraum (REQ-081)', () => {
    const okt = buch({ status: 'gelesen', beendetAm: '2026-10-31' });
    const abgebr = buch({ status: 'abgebrochen', beendetAm: '2026-11-03' });
    expect(kennzahlen([okt, abgebr], zeitraumFuer('monat', HEUTE)).buecher).toBe(0);
    expect(balken([buch({ status: 'gelesen', beendetAm: '2026-10-12' })], zeitraumFuer('jahr', HEUTE)).map((b) => b.buecher)).toEqual([0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0]);
  });
});

describe('Vergleich, Balken, Lesetage, Serie, Kalender', () => {
  it('Vergleichszeile (REQ-082)', () => {
    const b = buch({ status: 'gelesen', seitenanzahl: 608, beendetAm: '2026-10-12' });
    expect(vergleichText([b], zeitraumFuer('jahr', HEUTE), 'seiten')).toBe('+608 vs. 2025');
    expect(vergleichText([b], zeitraumFuer('monat', HEUTE), 'seiten')).toBe('−608 vs. Oktober');
    expect(vergleichText([b], zeitraumFuer('jahr', HEUTE), 'buecher')).toBe('+1 vs. 2025');
    expect(vergleichText([], zeitraumFuer('monat', HEUTE), 'seiten')).toBe('±0 vs. Oktober');
    expect(vergleichText([buch({ seitenanzahl: 400, sitzungen: [{ zeitpunkt: iso(2026, 11, 18), seite: 120 }] })], zeitraumFuer('woche', HEUTE), 'seiten')).toBe('+120 vs. Vorwoche');
  });
  it('Balkenanzahl und Achsen (REQ-083), Hilfslinien', () => {
    expect(balken([], zeitraumFuer('woche', HEUTE)).map((b) => b.beschriftung).join(' ')).toBe('M D M D F S S');
    const m = balken([], zeitraumFuer('monat', HEUTE));
    expect(m).toHaveLength(30);
    expect(m.map((b) => b.beschriftung).filter(Boolean)).toEqual(['1', '8', '15', '22', '29']);
    expect(hilfslinien(150)).toEqual([0, 50, 100, 150]);
    expect(hilfslinien(151).at(-1)).toBeGreaterThanOrEqual(151);
    expect(hilfslinien(0)).toEqual([0, 1]);
  });
  it('Lesetage (REQ-086) und Serie (REQ-087)', () => {
    const a = buch({ sitzungen: [{ zeitpunkt: iso(2026, 11, 16) }, { zeitpunkt: iso(2026, 11, 18) }, { zeitpunkt: iso(2026, 11, 21) }] });
    const b = buch({ status: 'gelesen', beendetAm: '2026-11-20', sitzungen: [{ zeitpunkt: iso(2026, 11, 16) }, { zeitpunkt: iso(2026, 11, 22) }] });
    expect(lesetage([a, b], zeitraumFuer('woche', HEUTE))).toEqual({ gelesen: 4, tage: 7 });
    expect(lesetage([], zeitraumFuer('monat', um(2028, 2, 10))).tage).toBe(29);
    expect(lesetage([], zeitraumFuer('jahr', HEUTE)).tage).toBe(365);
    expect(serie([a, b], HEUTE)).toBe(2);
    expect(serie([b], um(2026, 11, 24))).toBe(0);
  });
  it('Kalender Woche/Monat mit letztem Buch (REQ-088) und Jahr (REQ-089)', () => {
    const a = buch({ titel: 'A', sitzungen: [{ zeitpunkt: iso(2026, 11, 18, 9) }] });
    const b = buch({ titel: 'B', sitzungen: [{ zeitpunkt: iso(2026, 11, 18, 21) }] });
    const k = kalender([b, a], zeitraumFuer('woche', HEUTE), HEUTE);
    expect(k.tage.map((t) => t.tag)).toEqual([16, 17, 18, 19, 20, 21, 22]);
    expect(k.tage[2].buch?.titel).toBe('B');
    expect(k.tage.filter((t) => t.heute).map((t) => t.tag)).toEqual([22]);
    const m = kalender([], zeitraumFuer('monat', HEUTE), HEUTE);
    expect([m.tage.length, m.versatz]).toEqual([30, 6]);
    const j = jahreskalender([a, buch({ status: 'gelesen', beendetAm: '2026-03-05' })], 2026, HEUTE);
    expect(j.map((x) => x.kuerzel).slice(0, 3)).toEqual(['Jan', 'Feb', 'Mär']);
    expect(j[0].versatz).toBe(3);
    expect(j.flatMap((x) => x.tage.filter((t) => t.gelesen).map((t) => t.schluessel))).toEqual(['2026-11-18']);
    expect(jahreskalender([], 2025, HEUTE).some((x) => x.tage.some((t) => t.heute))).toBe(false);
  });
});

describe('Beendet am (REQ-085) und gemerkte Pille (REQ-079)', () => {
  it('Statuswechsel auf gelesen setzt heute, Texte und Einlesen', () => {
    const b = statusSetzen(buch({ beendetAm: '2019-03-14' }), 'gelesen', HEUTE);
    expect(b.beendetAm).toBe('2026-11-22');
    expect(statusSetzen(b, 'abgebrochen', HEUTE).beendetAm).toBe('2026-11-22');
    expect(beendetAusText('14.03.2019')).toBe('2019-03-14');
    expect(beendetDatumText('2019-03-14')).toBe('14.03.2019');
    expect(beendetText('2019-03-14')).toBe('März 2019');
    expect(buchAusDaten({ ...b, beendetAm: '2019-02-30' }).beendetAm).toBeUndefined();
    expect(buchAusDaten({ ...b, sitzungen: [{ zeitpunkt: iso(2026, 1, 1), seite: 5 }, { zeitpunkt: iso(2026, 1, 2), seite: -1 }] }).sitzungen).toEqual([
      { zeitpunkt: iso(2026, 1, 1), seite: 5 },
      { zeitpunkt: iso(2026, 1, 2) },
    ]);
  });
  it('Zeitraum-Pille: Standard Woche, gemerkt', async () => {
    const repo = new InMemoryEinstellungRepository();
    expect(await zeitraumartLesen(repo)).toBe('woche');
    await zeitraumartSpeichern(repo, 'jahr');
    expect(await zeitraumartLesen(repo)).toBe('jahr');
  });
});
