import { describe, expect, it } from 'vitest';
import {
  anlegeZeitpunkt,
  tagesnummer,
  wahlAlsText,
  wahlAusText,
  zitatAusDaten,
  zitatDesTages,
  zitatDesTagesWaehlen,
  zitatMitWerten,
  zitatPruefen,
  zitateSortiert,
  type Zitat,
} from '@/domain/zitat';

const z = (id: string, f: Partial<Zitat> = {}): Zitat => ({ id, buchId: 'b', text: `Text ${id}`, angelegtAm: `2026-11-24T10:00:0${id.length}.000Z`, ...f });

describe('Zitate (REQ-105)', () => {
  it('sortiert nach Seite, ohne Seite am Ende, sonst Reihenfolge des Anlegens', () => {
    const a = z('a', { seite: 200, angelegtAm: '2026-01-01T00:00:00.000Z' });
    const b = z('b', { angelegtAm: '2026-01-02T00:00:00.000Z' });
    const c = z('c', { seite: 15, angelegtAm: '2026-01-03T00:00:00.000Z' });
    const d = z('d', { angelegtAm: '2026-01-01T12:00:00.000Z' });
    const e = z('e', { seite: 15, angelegtAm: '2026-01-04T00:00:00.000Z' });
    expect(zitateSortiert([a, b, c, d, e]).map((x) => x.id)).toEqual(['c', 'e', 'a', 'd', 'b']);
  });

  it('prüft das Blatt: Zitat Pflicht, Seite leer oder ≥ 1, Sprecher bereinigt', () => {
    expect(zitatPruefen({ text: '', sprecher: '', seite: '' })).toEqual({ ok: false, fehler: { text: true, seite: false } });
    expect(zitatPruefen({ text: '   ', sprecher: '', seite: '0' })).toEqual({ ok: false, fehler: { text: true, seite: true } });
    expect(zitatPruefen({ text: 'x', sprecher: '', seite: '1,5' })).toEqual({ ok: false, fehler: { text: false, seite: true } });
    expect(zitatPruefen({ text: 'x', sprecher: '', seite: 'abc' }).ok).toBe(false);
    expect(zitatPruefen({ text: 'Ich bin nicht das Feuer.', sprecher: ' Violet ', seite: '312' })).toEqual({
      ok: true,
      werte: { text: 'Ich bin nicht das Feuer.', sprecher: 'Violet', seite: 312 },
    });
    expect(zitatPruefen({ text: 'Nur', sprecher: '  ', seite: ' ' })).toEqual({ ok: true, werte: { text: 'Nur' } });
  });

  it('übernimmt Werte und entfernt geleerte Angaben', () => {
    const alt = z('a', { sprecher: 'Violet', seite: 312 });
    expect(zitatMitWerten(alt, { text: 'T', seite: 313 })).toEqual({ id: 'a', buchId: 'b', angelegtAm: alt.angelegtAm, text: 'T', seite: 313 });
  });

  it('prüft gespeicherte Datensätze', () => {
    expect(zitatAusDaten({ id: 'a', buchId: 'b', text: ' ', angelegtAm: '2026-01-01T00:00:00.000Z' })).toBeUndefined();
    expect(zitatAusDaten({ id: 'a', buchId: 'b', text: 'T', angelegtAm: 'kein Datum' })).toBeUndefined();
    expect(zitatAusDaten({ id: 'a', buchId: 'b', text: 'T', angelegtAm: '2026-01-01T00:00:00.000Z', sprecher: '', seite: 0 })).toEqual({
      id: 'a',
      buchId: 'b',
      text: 'T',
      angelegtAm: '2026-01-01T00:00:00.000Z',
    });
  });

  it('vergibt eindeutige Anlegezeitpunkte auch bei gleicher Uhrzeit', () => {
    const jetzt = new Date('2026-11-24T10:00:00.000Z');
    const erst = anlegeZeitpunkt([], jetzt);
    expect(erst).toBe(jetzt.toISOString());
    const zweit = anlegeZeitpunkt([z('a', { angelegtAm: erst })], jetzt);
    expect(zweit > erst).toBe(true);
  });
});

describe('Zitat des Tages (REQ-106)', () => {
  const tag = (t: number, h = 12) => new Date(2026, 10, t, h, 0);
  const drei = [z('a', { angelegtAm: '2026-01-01T00:00:00.000Z' }), z('b', { angelegtAm: '2026-01-02T00:00:00.000Z' }), z('c', { buchId: 'x', angelegtAm: '2026-01-03T00:00:00.000Z' })];

  it('ohne Zitate keines', () => {
    expect(zitatDesTages([], tag(24))).toBeUndefined();
  });

  it('ist den ganzen Tag gleich, unabhängig von der Reihenfolge der Liste', () => {
    const morgens = zitatDesTages(drei, tag(24, 0));
    expect(zitatDesTages([...drei].reverse(), tag(24, 23))).toEqual(morgens);
    expect(zitatDesTages(drei, tag(24, 12))).toEqual(morgens);
  });

  it('wechselt an jedem Folgetag bei mehr als einem Zitat', () => {
    for (let t = 1; t < 30; t++) expect(zitatDesTages(drei, tag(t + 1))!.id).not.toBe(zitatDesTages(drei, tag(t))!.id);
    const zwei = drei.slice(0, 2);
    for (let t = 1; t < 30; t++) expect(zitatDesTages(zwei, tag(t + 1))!.id).not.toBe(zitatDesTages(zwei, tag(t))!.id);
  });

  it('bei genau einem Zitat jeden Tag dieses', () => {
    for (let t = 1; t < 10; t++) expect(zitatDesTages([drei[0]], tag(t))!.id).toBe('a');
  });

  it('nach dem Löschen des heutigen ein anderes vorhandenes', () => {
    const heute = zitatDesTages(drei, tag(24))!;
    const rest = drei.filter((x) => x.id !== heute.id);
    const neu = zitatDesTages(rest, tag(24))!;
    expect(neu.id).not.toBe(heute.id);
    expect(rest.map((x) => x.id)).toContain(neu.id);
  });

  it('Tagesnummer zählt lokale Kalendertage, auch über die Zeitumstellung', () => {
    expect(tagesnummer(new Date(2026, 2, 30, 0, 30)) - tagesnummer(new Date(2026, 2, 28, 23, 30))).toBe(2);
    expect(tagesnummer(new Date(2026, 9, 26, 0, 0)) - tagesnummer(new Date(2026, 9, 25, 23, 59))).toBe(1);
  });
});

describe('Zitat des Tages mit gemerkter Wahl (REQ-106)', () => {
  const tag = (t: number) => new Date(2026, 10, t, 12);
  const liste = ['a', 'b', 'c', 'd'].map((id, i) => z(id, { angelegtAm: `2026-01-0${i + 1}T00:00:00.000Z` }));

  it('bleibt am selben Tag trotz neuer oder gelöschter anderer Zitate', () => {
    const erst = zitatDesTagesWaehlen(liste, tag(24));
    expect(erst.merken).toEqual({ tag: tagesnummer(tag(24)), id: erst.zitat!.id });
    const mehr = [...liste, z('neu', { angelegtAm: '2026-11-24T08:00:00.000Z' })];
    expect(zitatDesTagesWaehlen(mehr, tag(24), erst.merken).zitat!.id).toBe(erst.zitat!.id);
    const weniger = liste.filter((x) => x.id !== erst.zitat!.id).concat(erst.zitat!).slice(1);
    expect(zitatDesTagesWaehlen(weniger, tag(24), erst.merken)).toEqual({ zitat: erst.zitat, merken: undefined });
  });

  it('am Folgetag nie das Zitat des Vortags, auch nicht nach Löschen des heutigen', () => {
    let gemerkt = zitatDesTagesWaehlen(liste, tag(1)).merken!;
    for (let t = 2; t < 40; t++) {
      const r = zitatDesTagesWaehlen(liste, new Date(2026, 10, t, 9), gemerkt);
      expect(r.zitat!.id).not.toBe(gemerkt.id);
      const ohne = liste.filter((x) => x.id !== r.zitat!.id);
      const neu = zitatDesTagesWaehlen(ohne, new Date(2026, 10, t, 10), r.merken);
      expect(neu.zitat!.id).not.toBe(r.zitat!.id);
      expect(neu.zitat!.id).not.toBe(gemerkt.id);
      gemerkt = r.merken!;
    }
  });

  it('bei genau einem Zitat auch am Folgetag dieses; ohne Zitate nichts', () => {
    const eins = [liste[0]];
    const r = zitatDesTagesWaehlen(eins, tag(2), { tag: tagesnummer(tag(1)), id: 'a' });
    expect(r.zitat!.id).toBe('a');
    expect(zitatDesTagesWaehlen([], tag(2), r.merken)).toEqual({ zitat: undefined, merken: undefined });
  });

  it('liest und schreibt die Wahl als Text', () => {
    expect(wahlAusText(wahlAlsText({ tag: 5, id: 'a', vorher: 'b' }))).toEqual({ tag: 5, id: 'a', vorher: 'b' });
    expect(wahlAusText('kaputt')).toBeUndefined();
    expect(wahlAusText(undefined)).toBeUndefined();
    expect(wahlAusText('{"tag":"x","id":"a"}')).toBeUndefined();
  });
});
