/**
 * Akzeptanztests REQ-083 – Seite „Statistik“: Balkendiagramm je Woche, Monat und Jahr.
 * Abgeleitet aus dem REQ-Text. Schnittstellen laut Entwickler (Sprint 09): [data-balken][data-wert][data-beschriftung],
 * [data-balken-teil=sessions|beendet|buecher], [data-hilfslinie], [data-skala]. Farbvergleich über die Farbvariablen
 * der zentralen Farbdefinition (keine festen Farbwerte im Test).
 */
import '@testing-library/jest-dom/vitest';
import { act, cleanup, fireEvent, render, waitFor } from '@testing-library/react';
import type { CSSProperties } from 'react';
import { afterEach, describe, expect, it } from 'vitest';
import type { Buch } from '@/domain/buch';
import { InMemoryEinstellungRepository } from '@/storage';
import { InMemoryImageStore } from '@/storage/InMemoryImageStore';
import { farbVariablen } from '@/theme';
import StatistikAnsicht from '@/views/StatistikAnsicht';

afterEach(cleanup);

const W = { timeout: 4000 };
const um = (j: number, m: number, t: number, h = 12) => new Date(j, m - 1, t, h);
const sitzung = (j: number, m: number, t: number, seite: number, h = 12) => ({ zeitpunkt: um(j, m, t, h).toISOString(), seite });
let nr = 0;
const buch = (f: Partial<Buch> = {}): Buch => ({ id: `b83-${++nr}`, titel: 'Testbuch', status: 'am_lesen', ...f });
const HEUTE = um(2026, 11, 22, 15);
const $ = (s: string) => document.querySelector<HTMLElement>(s);
const $$ = (s: string) => Array.from(document.querySelectorAll<HTMLElement>(s));
async function tippe(el: Element | null) {
  expect(el).not.toBeNull();
  await act(async () => {
    fireEvent.click(el!);
    await new Promise((r) => setTimeout(r, 5));
  });
}
async function zeige(buecher: Buch[], art: 'woche' | 'monat' | 'jahr', heute = HEUTE) {
  const repo = new InMemoryEinstellungRepository();
  await repo.speichern('statistikZeitraum', art);
  render(
    <div data-testwurzel="" style={farbVariablen() as CSSProperties}>
      <StatistikAnsicht buecher={buecher} einstellungRepository={repo} bildspeicher={new InMemoryImageStore()} jetzt={() => heute} />
    </div>,
  );
  await waitFor(() => expect($(`[data-zeitraum-pille="${art}"]`)).toHaveAttribute('aria-pressed', 'true'), W);
}
function farbe(ausdruck: string) {
  const p = document.createElement('span');
  p.style.setProperty('color', ausdruck);
  $('[data-testwurzel]')!.appendChild(p);
  const w = getComputedStyle(p).color;
  p.remove();
  return w;
}
const balken = () => $$('[data-balken]');
const werte = () => balken().map((b) => Number(b.getAttribute('data-wert')));
const beschriftungen = () => balken().map((b) => b.getAttribute('data-beschriftung') ?? '');
const hilfslinien = () => $$('[data-hilfslinie]').map((e) => Number(e.getAttribute('data-hilfslinie')));

describe('REQ-083 Balkendiagramm', () => {
  it('[REQ-083/AK-1] „Wöchentlich“: 7 Balken „M D M D F S S“', async () => {
    await zeige([], 'woche');
    expect(balken()).toHaveLength(7);
    expect(beschriftungen().join(' ')).toBe('M D M D F S S');
  });

  it('[REQ-083/AK-1] Balken Montag bis Sonntag: Sitzung am Montag 16.11. im ersten, am Sonntag 22.11. im letzten Balken', async () => {
    await zeige([buch({ seitenanzahl: 400, sitzungen: [sitzung(2026, 11, 16, 10), sitzung(2026, 11, 22, 30)] })], 'woche');
    expect(werte()).toEqual([10, 0, 0, 0, 0, 0, 20]);
  });

  it('[REQ-083/AK-2] „Monatlich“ November 2026: 30 Balken, Beschriftungen nur bei 1, 8, 15, 22, 29', async () => {
    await zeige([], 'monat');
    expect(balken()).toHaveLength(30);
    const b = beschriftungen();
    const beschriftet = b.map((t, i) => [t, i + 1] as const).filter(([t]) => t.trim() !== '');
    expect(beschriftet).toEqual([
      ['1', 1],
      ['8', 8],
      ['15', 15],
      ['22', 22],
      ['29', 29],
    ]);
  });

  it.each([
    [um(2026, 2, 10), 28],
    [um(2028, 2, 10), 29],
    [um(2026, 12, 10), 31],
  ])('[REQ-083/AK-2] ein Balken je Kalendertag (%s → %i)', async (heute, n) => {
    await zeige([], 'monat', heute);
    expect(balken()).toHaveLength(n);
    expect(beschriftungen().filter((t) => t.trim() !== '')).toEqual(['1', '8', '15', '22', '29'].filter((t) => Number(t) <= n));
  });

  it('[REQ-083/AK-2] Monat: Sitzung am 30.11. liegt im letzten Balken', async () => {
    await zeige([buch({ seitenanzahl: 400, sitzungen: [sitzung(2026, 11, 30, 77)] })], 'monat', um(2026, 11, 30, 20));
    expect(werte()[29]).toBe(77);
    expect(werte().slice(0, 29).every((w) => w === 0)).toBe(true);
  });

  it('[REQ-083/AK-3] „Jährlich“: 12 Balken „J F M A M J J A S O N D“', async () => {
    await zeige([], 'jahr');
    expect(balken()).toHaveLength(12);
    expect(beschriftungen().join(' ')).toBe('J F M A M J J A S O N D');
  });

  it('[REQ-083/AK-4] „Jährlich“ 2026, Buch *gelesen* mit „Beendet am“ 12.10.2026, „Bücher“: nur „O“ hat 1, in Primär', async () => {
    await zeige([buch({ status: 'gelesen', seitenanzahl: 300, beendetAm: '2026-10-12' })], 'jahr');
    await tippe($('[data-kachel="buecher"]'));
    expect(werte()).toEqual([0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0]);
    expect(beschriftungen()[9]).toBe('O');
    const teile = balken()[9].querySelectorAll<HTMLElement>('[data-balken-teil]');
    expect(teile).toHaveLength(1);
    expect(getComputedStyle(teile[0]).backgroundColor).toBe(farbe('var(--bz-farbe-primaer)'));
    expect($$('[data-balken-teil="sessions"], [data-balken-teil="beendet"]')).toHaveLength(0);
  });

  it('[REQ-083/AK-4] Zählregel wie REQ-081: nicht *gelesene* Bücher fehlen, zwei Bücher im selben Monat ergeben 2', async () => {
    await zeige(
      [
        buch({ status: 'gelesen', beendetAm: '2026-10-12' }),
        buch({ status: 'gelesen', beendetAm: '2026-10-31' }),
        buch({ status: 'am_lesen', beendetAm: '2026-03-01' }),
        buch({ status: 'gelesen', beendetAm: '2025-10-12' }),
      ],
      'jahr',
    );
    await tippe($('[data-kachel="buecher"]'));
    expect(werte()).toEqual([0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0]);
  });

  it('[REQ-083/AK-4] gewählte Kachel steuert das Diagramm: „Seiten“ zeigt Seiten, „Bücher“ die Anzahl', async () => {
    await zeige([buch({ status: 'gelesen', seitenanzahl: 300, beendetAm: '2026-10-12' })], 'jahr');
    expect(werte()[9]).toBe(300);
    await tippe($('[data-kachel="buecher"]'));
    expect(werte()[9]).toBe(1);
    await tippe($('[data-kachel="seiten"]'));
    expect(werte()[9]).toBe(300);
  });

  it('[REQ-083/AK-5] höchster Balken 150: Hilfslinien mit Skalenwerten, oberste ≥ 150', async () => {
    await zeige([buch({ seitenanzahl: 400, sitzungen: [sitzung(2026, 11, 17, 150), sitzung(2026, 11, 18, 200)] })], 'woche');
    expect(Math.max(...werte())).toBe(150);
    const l = hilfslinien();
    expect(l.length).toBeGreaterThanOrEqual(2);
    expect(Math.max(...l)).toBeGreaterThanOrEqual(150);
    const skala = $$('[data-skala]');
    expect(skala.length).toBe(l.length);
    for (const s of skala) expect(s.textContent?.trim()).toMatch(/^\d+$/);
    expect(skala.map((s) => Number(s.textContent))).toEqual(l);
  });

  it.each([1, 7, 151, 999, 1000])('[REQ-083/AK-5] kein Balken ragt über die oberste Hilfslinie (Maximum %i)', async (max) => {
    await zeige([buch({ seitenanzahl: 5000, sitzungen: [sitzung(2026, 11, 18, max)] })], 'woche');
    expect(Math.max(...werte())).toBe(max);
    expect(Math.max(...hilfslinien())).toBeGreaterThanOrEqual(max);
  });

  it('[REQ-083/AK-5] Bücher-Kachel: Skala passt sich an (oberste Linie ≥ 3 bei drei Büchern im Monat)', async () => {
    await zeige(
      [1, 2, 3].map((t) => buch({ status: 'gelesen', beendetAm: `2026-05-0${t}` })),
      'jahr',
    );
    await tippe($('[data-kachel="buecher"]'));
    expect(werte()[4]).toBe(3);
    expect(Math.max(...hilfslinien())).toBeGreaterThanOrEqual(3);
  });

  it('[REQ-083/AK-5] Abschnitte mit Wert 0 sind leere Grundlinien ohne Balkenteil', async () => {
    await zeige([buch({ seitenanzahl: 400, sitzungen: [sitzung(2026, 11, 18, 40)] })], 'woche');
    balken().forEach((b, i) => {
      const teile = b.querySelectorAll('[data-balken-teil]').length;
      if (i === 2) expect(teile).toBeGreaterThan(0);
      else expect(teile).toBe(0);
    });
  });
});
