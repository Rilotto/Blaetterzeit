/**
 * Akzeptanztests REQ-089 – Seite „Statistik“: Jahreskalender mit zwölf Mini-Kalendern.
 * Abgeleitet aus dem REQ-Text. Schnittstellen laut Entwickler (Sprint 09): [data-jahreskalender], [data-mini-monat],
 * [data-mini-tag=JJJJ-MM-TT][data-spalte][data-heute][data-gelesen], [data-lesepunkt].
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
const s = (j: number, m: number, t: number, h = 12, seite = 10) => ({ zeitpunkt: um(j, m, t, h).toISOString(), seite });
let nr = 0;
const buch = (f: Partial<Buch> = {}): Buch => ({ id: `b89-${++nr}`, titel: 'Testbuch', status: 'am_lesen', seitenanzahl: 500, ...f });
const HEUTE = um(2026, 11, 22, 15);
const $ = (q: string) => document.querySelector<HTMLElement>(q);
const $$ = (q: string) => Array.from(document.querySelectorAll<HTMLElement>(q));
const norm = (t: string | null | undefined) => (t ?? '').replace(/[\s  ]+/g, ' ').trim();
async function tippe(el: Element | null) {
  expect(el).not.toBeNull();
  await act(async () => {
    fireEvent.click(el!);
    await new Promise((r) => setTimeout(r, 5));
  });
}
async function zeige(buecher: Buch[], heute = HEUTE) {
  const repo = new InMemoryEinstellungRepository();
  await repo.speichern('statistikZeitraum', 'jahr');
  render(
    <div data-testwurzel="" style={farbVariablen() as CSSProperties}>
      <StatistikAnsicht buecher={buecher} einstellungRepository={repo} bildspeicher={new InMemoryImageStore()} jetzt={() => heute} />
    </div>,
  );
  await waitFor(() => expect($('[data-zeitraum-pille="jahr"]')).toHaveAttribute('aria-pressed', 'true'), W);
}
function farbe(ausdruck: string) {
  const p = document.createElement('span');
  p.style.setProperty('color', ausdruck);
  $('[data-testwurzel]')!.appendChild(p);
  const w = getComputedStyle(p).color;
  p.remove();
  return w;
}
const monate = () => $$('[data-mini-monat]');
const mitPunkt = () => $$('[data-mini-tag]').filter((e) => e.querySelector('[data-lesepunkt]')).map((e) => e.getAttribute('data-mini-tag'));
const KUERZEL = ['Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez'];

describe('REQ-089 Jahreskalender', () => {
  it('[REQ-089/AK-1] 2026: zwölf Mini-Kalender Jan bis Dez ohne Wochentagsbeschriftung; 1. Januar in der vierten Spalte', async () => {
    await zeige([]);
    expect($('[data-jahreskalender]')).not.toBeNull();
    expect(monate()).toHaveLength(12);
    monate().forEach((m, i) => expect(norm(m.textContent).startsWith(KUERZEL[i]), `${i}: ${norm(m.textContent).slice(0, 10)}`).toBe(true));
    const text = norm($('[data-jahreskalender]')!.textContent);
    expect(text).not.toMatch(/\b(MO|DI|MI|DO|FR|SA|SO|Mo|Di|Mi|Do|Fr|Sa|So)\b/);
    expect($('[data-jahreskalender] [data-kalender-wochentag]')).toBeNull();
    const jan = monate()[0].querySelectorAll<HTMLElement>('[data-mini-tag]');
    expect(jan).toHaveLength(31);
    expect(jan[0].getAttribute('data-mini-tag')).toBe('2026-01-01');
    expect(jan[0].getAttribute('data-spalte')).toBe('3');
    // keine Kalenderkarte Woche/Monat bei „Jährlich“
    expect($('[data-kalender]')).toBeNull();
  });

  it('[REQ-089/AK-1] je Monat ein Feld je Tag, der 1. in der Spalte seines Wochentags (2026)', async () => {
    await zeige([]);
    const laengen = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    const ersteSpalte = [3, 6, 6, 2, 4, 0, 2, 5, 1, 3, 6, 1];
    monate().forEach((m, i) => {
      const f = Array.from(m.querySelectorAll<HTMLElement>('[data-mini-tag]'));
      expect(f).toHaveLength(laengen[i]);
      expect(f[0].getAttribute('data-spalte')).toBe(String(ersteSpalte[i]));
      expect(f.map((x) => Number(x.getAttribute('data-spalte')))).toEqual(f.map((_, k) => (ersteSpalte[i] + k) % 7));
    });
  });

  it('[REQ-089/AK-1] Schaltjahr 2028: Februar mit 29 Feldern, 1. Januar 2028 (Samstag) in der sechsten Spalte', async () => {
    await zeige([], um(2028, 5, 1));
    expect(monate()[1].querySelectorAll('[data-mini-tag]')).toHaveLength(29);
    expect(monate()[0].querySelector('[data-mini-tag]')!.getAttribute('data-spalte')).toBe('5');
  });

  it('[REQ-089/AK-2] zwei Sitzungen am 03.02.2026, eine am 10.10.2026: genau diese Felder mit Punkt in „Primär“', async () => {
    await zeige([buch({ sitzungen: [s(2026, 2, 3, 9), s(2026, 2, 3, 20, 30)] }), buch({ sitzungen: [s(2026, 10, 10)] })]);
    expect(mitPunkt()).toEqual(['2026-02-03', '2026-10-10']);
    for (const p of $$('[data-lesepunkt]')) expect(getComputedStyle(p).backgroundColor).toBe(farbe('var(--bz-farbe-primaer)'));
  });

  it('[REQ-089/AK-2] Sitzungen anderer Jahre erscheinen nicht; Tagesgrenze nach lokaler Zeit', async () => {
    await zeige([buch({ sitzungen: [s(2025, 2, 3), s(2027, 10, 10), { zeitpunkt: new Date(2026, 0, 1, 0, 5).toISOString(), seite: 3 }, { zeitpunkt: new Date(2026, 11, 31, 23, 55).toISOString(), seite: 4 }] })]);
    expect(mitPunkt()).toEqual(['2026-01-01', '2026-12-31']);
  });

  it('[REQ-089/AK-3] Buch *gelesen* mit „Beendet am“ 05.03.2026 ohne Sitzung: 5. März ohne Punkt', async () => {
    await zeige([buch({ status: 'gelesen', seitenanzahl: 300, beendetAm: '2026-03-05' })]);
    expect(mitPunkt()).toEqual([]);
    expect($('[data-mini-tag="2026-03-05"]')!.querySelector('[data-lesepunkt]')).toBeNull();
  });

  it('[REQ-089/AK-4] heute 22.11.2026: genau das Feld 22. November umrandet; in 2025 keins', async () => {
    await zeige([]);
    const heute = $$('[data-mini-tag]').filter((e) => e.getAttribute('data-heute') === 'true');
    expect(heute.map((e) => e.getAttribute('data-mini-tag'))).toEqual(['2026-11-22']);
    const umrandet = (e: HTMLElement) => {
      // jsdom berechnet Kurzschreibweisen mit var() nicht; deshalb Prüfung des gesetzten Stils (Rahmen oder Kontur, durchgezogen)
      return /(outline|border)(-[a-z]+)?:[^;]*solid/.test(e.getAttribute('style') ?? '');
    };
    expect(umrandet(heute[0])).toBe(true);
    expect($$('[data-mini-tag]').filter(umrandet)).toHaveLength(1);
    await tippe($('[data-zeitraum-zurueck]'));
    expect(norm($('[data-zeitraum-zeile1]')!.textContent)).toBe('2025');
    expect($$('[data-mini-tag]').filter((e) => e.getAttribute('data-heute') === 'true')).toHaveLength(0);
    expect($$('[data-mini-tag]').filter(umrandet)).toHaveLength(0);
  });
});
