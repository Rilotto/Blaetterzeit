import { describe, expect, it } from 'vitest';
import { buchAusDaten, type Buch } from '@/domain/buch';
import {
  fortschrittExakt,
  fortschrittGerundet,
  fortschrittPruefen,
  fortschrittSichern,
  fortschrittText,
  seitenanzahlPruefen,
  streak,
  umrechnen,
} from '@/domain/fortschritt';
import { SqliteBookRepository } from '@/storage/SqliteBookRepository';
import { MIGRATIONEN, migrieren } from '@/storage/sqlite/migrationen';
import { nodeSqlite } from '../contract/nodeSqlite';

const ID = '0b6c1f7e-3a2d-4c5e-9f10-1a2b3c4d5e6f';
const buch = (extra: Partial<Buch> = {}): Buch => ({ id: ID, titel: 'T', status: 'ungelesen', ...extra });
const lokal = (j: number, m: number, t: number, h = 12, min = 0) => new Date(j, m - 1, t, h, min);
const sitzung = (d: Date) => ({ zeitpunkt: d.toISOString() });

describe('Fortschritt berechnen', () => {
  it('ohne Seitenanzahl 0 %, auch im Modus „%“', () => {
    expect(fortschrittExakt(buch({ aktuelleSeite: 3 }))).toBe(0);
    expect(fortschrittGerundet(buch({ fortschrittsmodus: 'prozent', fortschrittProzent: 40 }))).toBe(0);
  });
  it('Modus „Seite“: exakter Anteil und kaufmännisch gerundet', () => {
    expect(fortschrittExakt(buch({ seitenanzahl: 200, aktuelleSeite: 50 }))).toBe(25);
    expect(fortschrittExakt(buch({ seitenanzahl: 400, aktuelleSeite: 42 }))).toBe(10.5);
    expect(fortschrittGerundet(buch({ seitenanzahl: 400, aktuelleSeite: 42 }))).toBe(11);
    expect(fortschrittGerundet(buch({ seitenanzahl: 400, aktuelleSeite: 41 }))).toBe(10);
    expect(fortschrittGerundet(buch({ seitenanzahl: 400 }))).toBe(0);
  });
  it('Modus „%“ nutzt den Prozentwert', () => {
    const b = buch({ seitenanzahl: 400, fortschrittsmodus: 'prozent', fortschrittProzent: 5 });
    expect(fortschrittExakt(b)).toBe(5);
    expect(fortschrittText(b)).toBe('5 %');
  });
  it('Angabe „Seite / Seitenanzahl“, ohne Fortschritt „0 / 400“', () => {
    expect(fortschrittText(buch({ seitenanzahl: 400, aktuelleSeite: 42 }))).toBe('42 / 400');
    expect(fortschrittText(buch({ seitenanzahl: 400 }))).toBe('0 / 400');
  });
});

describe('Eingaben prüfen und umrechnen', () => {
  it('Grenzen im Modus „Seite“ und „%“', () => {
    expect(fortschrittPruefen('400', 'seite', 400)).toEqual({ ok: true, wert: 400 });
    expect(fortschrittPruefen('0', 'seite', 400)).toEqual({ ok: true, wert: 0 });
    expect(fortschrittPruefen('401', 'seite', 400)).toEqual({ ok: false, grund: 'zuGross' });
    expect(fortschrittPruefen('101', 'prozent', 400)).toEqual({ ok: false, grund: 'zuGross' });
    expect(fortschrittPruefen('100', 'prozent', 400)).toEqual({ ok: true, wert: 100 });
    expect(fortschrittPruefen('', 'seite', 400)).toEqual({ ok: false, grund: 'leer' });
    expect(fortschrittPruefen('4.5', 'seite', 400)).toEqual({ ok: false, grund: 'ungueltig' });
  });
  it('Seitenanzahl ab 1', () => {
    expect(seitenanzahlPruefen('')).toEqual({ ok: false, grund: 'leer' });
    expect(seitenanzahlPruefen('0')).toEqual({ ok: false, grund: 'ungueltig' });
    expect(seitenanzahlPruefen('1')).toEqual({ ok: true, wert: 1 });
  });
  it('Moduswechsel rechnet kaufmännisch um, leer bleibt leer', () => {
    expect(umrechnen('42', 'seite', 'prozent', 400)).toBe('11');
    expect(umrechnen('25', 'prozent', 'seite', 400)).toBe('100');
    expect(umrechnen('', 'seite', 'prozent', 400)).toBe('');
    expect(umrechnen('1', 'seite', 'prozent', 3)).toBe('33');
    expect(umrechnen('-1', 'seite', 'prozent', 400)).toBe('-1');
  });
});

describe('Sichern und Sitzungen', () => {
  const jetzt = lokal(2026, 11, 12, 20);
  it('Erhöhung legt eine Sitzung an, gleich oder weniger nicht; Fortschritt wird trotzdem gespeichert', () => {
    let b = buch({ seitenanzahl: 400, aktuelleSeite: 42 });
    b = fortschrittSichern(b, 'seite', 50, jetzt);
    expect(b.sitzungen).toEqual([sitzung(jetzt)]);
    b = fortschrittSichern(b, 'seite', 50, jetzt);
    b = fortschrittSichern(b, 'seite', 30, jetzt);
    expect(b.sitzungen).toHaveLength(1);
    expect(b.aktuelleSeite).toBe(30);
  });
  it('ohne bisherigen Fortschritt gilt 0; Sichern von 0 ist keine Sitzung', () => {
    expect(fortschrittSichern(buch({ seitenanzahl: 400 }), 'seite', 0, jetzt).sitzungen).toBeUndefined();
    expect(fortschrittSichern(buch({ seitenanzahl: 400 }), 'prozent', 5, jetzt).sitzungen).toHaveLength(1);
  });
  it('vergleicht modusübergreifend den Anteil und speichert nur den Wert des gewählten Modus', () => {
    const b = fortschrittSichern(buch({ seitenanzahl: 400, aktuelleSeite: 100 }), 'prozent', 25, jetzt);
    expect(b).toMatchObject({ fortschrittsmodus: 'prozent', fortschrittProzent: 25 });
    expect(b.aktuelleSeite).toBeUndefined();
    expect(b.sitzungen).toBeUndefined();
  });
});

describe('Streak nach lokalen Kalendertagen', () => {
  const heute = lokal(2026, 11, 12, 15);
  it('zählt lückenlose Tage bis heute oder gestern', () => {
    expect(streak([], heute)).toBe(0);
    expect(streak([sitzung(lokal(2026, 11, 12, 8))], heute)).toBe(1);
    expect(streak([sitzung(lokal(2026, 11, 11)), sitzung(lokal(2026, 11, 12))], heute)).toBe(2);
    expect(streak([sitzung(lokal(2026, 11, 10)), sitzung(lokal(2026, 11, 11))], heute)).toBe(2);
    expect(streak([sitzung(lokal(2026, 11, 10))], heute)).toBe(0);
    expect(streak([1, 2, 3].map((h) => sitzung(lokal(2026, 11, 12, h))), heute)).toBe(1);
  });
  it('Tageswechsel um Mitternacht (23:59 und 00:01)', () => {
    expect(streak([sitzung(lokal(2026, 11, 11, 23, 59)), sitzung(lokal(2026, 11, 12, 0, 1))], lokal(2026, 11, 12, 0, 2))).toBe(2);
  });
  it('über einen Monatswechsel', () => {
    expect(streak([sitzung(lokal(2026, 10, 31)), sitzung(lokal(2026, 11, 1))], lokal(2026, 11, 1, 22))).toBe(2);
  });
});

describe('Buchdaten mit Fortschritt', () => {
  it('buchAusDaten übernimmt gültige Angaben und verwirft ungültige', () => {
    const b = buchAusDaten({
      ...buch(),
      aktuelleSeite: 4,
      fortschrittProzent: 1.5,
      fortschrittsmodus: 'kapitel',
      sitzungen: [{ zeitpunkt: 'x' }, { nein: 1 }],
    });
    expect(b).toEqual({ ...buch(), aktuelleSeite: 4, sitzungen: [{ zeitpunkt: 'x' }] });
  });

  it('SQLite-Migration 3 erhält vorhandene Bücher (Stand Migration 2)', async () => {
    const db = await nodeSqlite();
    await migrieren(db, MIGRATIONEN.filter((m) => m.version <= 2));
    await db.ausfuehren(
      "INSERT INTO buch (id, titel, status, seitenanzahl, geaendert) VALUES (?, 'Alt', 'gelesen', 300, '2026-11-10T00:00:00Z')",
      [ID],
    );
    await migrieren(db);
    const repo = new SqliteBookRepository(db);
    expect(await repo.get(ID)).toEqual({ id: ID, titel: 'Alt', status: 'gelesen', seitenanzahl: 300 });
    await repo.save({ id: ID, titel: 'Alt', status: 'am_lesen', seitenanzahl: 300, aktuelleSeite: 7, sitzungen: [{ zeitpunkt: 'z' }] });
    expect((await repo.get(ID))?.sitzungen).toEqual([{ zeitpunkt: 'z' }]);
  });
});
