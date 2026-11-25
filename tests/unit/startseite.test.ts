import { describe, expect, it } from 'vitest';
import type { Buch } from '@/domain/buch';
import {
  beendeteImJahr,
  datumKopfText,
  geradeAmLesen,
  grussText,
  jahreszielPruefen,
  jahreszielText,
  nameBereinigt,
  tageszeit,
  uhrzeitText,
} from '@/domain/startseite';
import { kennzahlen, zeitraumFuer } from '@/domain/statistik';

const um = (h: number, m = 0) => new Date(2026, 10, 24, h, m);

describe('Kopf der Startseite (REQ-101)', () => {
  it('Tageszeit-Grenzen ab der vollen Stunde', () => {
    const erwartet: [number, number, string][] = [
      [5, 0, 'morgen'],
      [7, 30, 'morgen'],
      [9, 59, 'morgen'],
      [10, 0, 'tag'],
      [12, 0, 'tag'],
      [16, 59, 'tag'],
      [17, 0, 'abend'],
      [20, 59, 'abend'],
      [21, 0, 'nacht'],
      [23, 0, 'nacht'],
      [0, 0, 'nacht'],
      [4, 59, 'nacht'],
    ];
    for (const [h, m, t] of erwartet) expect(tageszeit(um(h, m)), `${h}:${m}`).toBe(t);
  });

  it('Gruß mit und ohne Namen', () => {
    expect(grussText(um(7, 30), 'Christine')).toBe('Guten Morgen, Christine');
    expect(grussText(um(12), 'Christine')).toBe('Hallo, Christine');
    expect(grussText(um(18), 'Christine')).toBe('Guten Abend, Christine');
    expect(grussText(um(23), 'Christine')).toBe('Gute Nacht, Christine');
    expect(grussText(um(12))).toBe('Hallo');
    expect(grussText(um(12), '  ')).toBe('Hallo');
  });

  it('Datum mit Wochentag und Uhrzeit im 24-Stunden-Format', () => {
    expect(datumKopfText(um(14, 5))).toBe('Dienstag, 24. November');
    expect(datumKopfText(new Date(2026, 10, 23, 14, 5))).toBe('Montag, 23. November');
    expect(uhrzeitText(um(14, 5))).toBe('14:05');
    expect(uhrzeitText(um(0, 0))).toBe('00:00');
  });
});

const buch = (f: Partial<Buch>): Buch => ({ id: crypto.randomUUID(), titel: 'T', status: 'ungelesen', ...f });

describe('Gerade am Lesen (REQ-102)', () => {
  it('nur Bücher am lesen, A–Z', () => {
    const l = geradeAmLesen([buch({ titel: 'Iron Flame', status: 'am_lesen' }), buch({ titel: 'Onyx Storm' }), buch({ titel: 'Fourth Wing', status: 'am_lesen' })]);
    expect(l.map((b) => b.titel)).toEqual(['Fourth Wing', 'Iron Flame']);
  });
});

describe('Jahresziel (REQ-104)', () => {
  it('zählt wie „Bücher“ der Statistik für das Jahr', () => {
    const buecher = [
      buch({ status: 'gelesen', beendetAm: '2026-01-05' }),
      buch({ status: 'gelesen', beendetAm: '2026-11-20' }),
      buch({ status: 'gelesen', beendetAm: '2026-12-31' }),
      buch({ status: 'gelesen', beendetAm: '2025-12-31' }),
      buch({ status: 'am_lesen', beendetAm: '2026-03-01' }),
    ];
    expect(beendeteImJahr(buecher, 2026)).toBe(3);
    expect(beendeteImJahr(buecher, 2026)).toBe(kennzahlen(buecher, zeitraumFuer('jahr', new Date(2026, 4, 1))).buecher);
    expect(beendeteImJahr(buecher, 2025)).toBe(1);
  });

  it('Kacheltext', () => {
    expect(jahreszielText(7, 20, 2026)).toBe('7 von 20 Büchern 2026');
    expect(jahreszielText(25, 20, 2026)).toBe('25 von 20 Büchern 2026');
    expect(jahreszielText(3, undefined, 2026)).toBe('Jahresziel festlegen');
  });

  it('Eingabe prüfen', () => {
    expect(jahreszielPruefen('20')).toBe('20');
    expect(jahreszielPruefen(' 007 ')).toBe('7');
    expect(jahreszielPruefen('')).toBe('');
    expect(jahreszielPruefen('  ')).toBe('');
    for (const f of ['0', '-1', '1,5', '1.5', 'abc']) expect(jahreszielPruefen(f), f).toBeNull();
  });
});

describe('Name (REQ-107)', () => {
  it('bereinigt Ränder, leer = kein Name', () => {
    expect(nameBereinigt('  Christine ')).toBe('Christine');
    expect(nameBereinigt('   ')).toBeUndefined();
    expect(nameBereinigt('')).toBeUndefined();
  });
});
