/**
 * Akzeptanztests REQ-080 – Seite „Statistik“: Zeitraum blättern und Zeitraum-Titel.
 * Abgeleitet aus dem REQ-Text. Schnittstellen laut Entwickler (Sprint 09): siehe REQ-079-Test; zusätzlich
 * [data-kachel=seiten|buecher] [data-kachel-wert], [data-kennzahl-wert], [data-balken][data-wert],
 * [data-lesetage-text], [data-kalender-tag][data-gelesen], [data-mini-tag][data-gelesen], [data-mini-tag][data-gefuellt].
 */
import '@testing-library/jest-dom/vitest';
import { act, cleanup, fireEvent, render, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import type { Buch } from '@/domain/buch';
import { InMemoryEinstellungRepository } from '@/storage';
import { InMemoryImageStore } from '@/storage/InMemoryImageStore';
import StatistikAnsicht from '@/views/StatistikAnsicht';

afterEach(cleanup);

const W = { timeout: 4000 };
const um = (j: number, m: number, t: number, h = 12, mi = 0) => new Date(j, m - 1, t, h, mi);
const sitzung = (j: number, m: number, t: number, seite: number, h = 12) => ({ zeitpunkt: um(j, m, t, h).toISOString(), seite });
let nr = 0;
const buch = (f: Partial<Buch> = {}): Buch => ({ id: `b80-${++nr}`, titel: 'Testbuch', status: 'am_lesen', ...f });
const $ = (s: string) => document.querySelector<HTMLElement>(s);
const $$ = (s: string) => Array.from(document.querySelectorAll<HTMLElement>(s));
const norm = (t: string | null | undefined) => (t ?? '').replace(/[\s  ]+/g, ' ').trim();
async function tippe(el: Element | null) {
  expect(el).not.toBeNull();
  await act(async () => {
    fireEvent.click(el!);
    await new Promise((r) => setTimeout(r, 5));
  });
}
async function zeige(heute: Date, art: 'woche' | 'monat' | 'jahr' = 'woche', buecher: Buch[] = []) {
  const repo = new InMemoryEinstellungRepository();
  await repo.speichern('statistikZeitraum', art);
  render(<StatistikAnsicht buecher={buecher} einstellungRepository={repo} bildspeicher={new InMemoryImageStore()} jetzt={() => heute} />);
  await waitFor(() => expect($(`[data-zeitraum-pille="${art}"]`)).toHaveAttribute('aria-pressed', 'true'), W);
}
const titel = () => [norm($('[data-zeitraum-zeile1]')?.textContent), $('[data-zeitraum-zeile2]') ? norm($('[data-zeitraum-zeile2]')!.textContent) : null];
const vor = async (n = 1) => {
  for (let i = 0; i < n; i++) await tippe($('[data-zeitraum-vor]'));
};
const zurueck = async (n = 1) => {
  for (let i = 0; i < n; i++) await tippe($('[data-zeitraum-zurueck]'));
};

describe('REQ-080 Zeitraum blättern und Titel', () => {
  it('[REQ-080/AK-1] Sonntag 22.11.2026, „Wöchentlich“: Titel „16 – 22 Nov“ mit „2026“ darunter', async () => {
    await zeige(um(2026, 11, 22, 15));
    expect(titel()).toEqual(['16 – 22 Nov', '2026']);
  });

  it('[REQ-080/AK-1] Aufbau: links „‹“, mittig Titel, rechts „›“', async () => {
    await zeige(um(2026, 11, 22));
    const z = $('[data-zeitraum-zurueck]')!;
    const t = $('[data-zeitraum-zeile1]')!;
    const v = $('[data-zeitraum-vor]')!;
    expect(z.compareDocumentPosition(t) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(t.compareDocumentPosition(v) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(z.tagName).toBe('BUTTON');
    expect(v.tagName).toBe('BUTTON');
  });

  it.each([
    [um(2026, 11, 23, 0, 0), '23 – 29 Nov'],
    [um(2026, 11, 23, 9), '23 – 29 Nov'],
    [um(2026, 11, 25), '23 – 29 Nov'],
    [um(2026, 11, 29, 23, 59), '23 – 29 Nov'],
    [um(2026, 11, 22, 23, 59), '16 – 22 Nov'],
  ])('[REQ-080/AK-2] Woche beginnt montags: heute %s → „%s“', async (heute, erwartet) => {
    await zeige(heute);
    expect(titel()).toEqual([erwartet, '2026']);
  });

  it('[REQ-080/AK-3] „Monatlich“ November 2026, „‹“ → „Oktober“ / 2026', async () => {
    await zeige(um(2026, 11, 22), 'monat');
    expect(titel()).toEqual(['November', '2026']);
    await zurueck();
    expect(titel()).toEqual(['Oktober', '2026']);
  });

  it('[REQ-080/AK-3] Varianten: Januar ‹ → Dezember des Vorjahres; Woche ‹; Jahr ‹ ohne zweite Zeile', async () => {
    await zeige(um(2026, 1, 10), 'monat');
    await zurueck();
    expect(titel()).toEqual(['Dezember', '2025']);
    cleanup();
    await zeige(um(2026, 11, 22), 'woche');
    await zurueck();
    expect(titel()).toEqual(['9 – 15 Nov', '2026']);
    await vor(2);
    expect(titel()).toEqual(['23 – 29 Nov', '2026']);
    cleanup();
    await zeige(um(2026, 11, 22), 'jahr');
    await zurueck();
    expect(titel()).toEqual(['2025', null]);
  });

  it('[REQ-080/AK-3] alle Monatsnamen ausgeschrieben beim Zurückblättern über ein Jahr', async () => {
    await zeige(um(2026, 12, 15), 'monat');
    const namen: string[] = [];
    for (let i = 0; i < 12; i++) {
      namen.push(titel()[0]!);
      await zurueck();
    }
    expect(namen).toEqual(['Dezember', 'November', 'Oktober', 'September', 'August', 'Juli', 'Juni', 'Mai', 'April', 'März', 'Februar', 'Januar']);
    expect(titel()).toEqual(['Dezember', '2025']);
  });

  it('[REQ-080/AK-4] „Jährlich“ 2026 mit Sitzungen, „›“ → „2027“, alle Kennzahlen, Balken, Lesetage, Kalendermarkierungen leer bzw. 0', async () => {
    const b = [
      buch({ seitenanzahl: 400, sitzungen: [sitzung(2026, 3, 2, 120), sitzung(2026, 11, 20, 200)] }),
      buch({ status: 'gelesen', seitenanzahl: 300, beendetAm: '2026-10-12' }),
    ];
    await zeige(um(2026, 11, 22), 'jahr', b);
    // Vorbedingung: 2026 hat Werte
    expect(Number(norm($('[data-kachel="seiten"] [data-kachel-wert]')!.textContent))).toBeGreaterThan(0);
    expect($$('[data-mini-tag][data-gefuellt="true"]').length).toBeGreaterThan(0);
    await vor();
    expect(titel()).toEqual(['2027', null]);
    expect(norm($('[data-kachel="seiten"] [data-kachel-wert]')!.textContent)).toBe('0');
    expect(norm($('[data-kachel="buecher"] [data-kachel-wert]')!.textContent)).toBe('0');
    expect(norm($('[data-kennzahl-wert]')!.textContent)).toBe('0');
    expect($$('[data-balken]').map((e) => Number(e.getAttribute('data-wert')))).toEqual(Array(12).fill(0));
    expect($$('[data-balken-teil]')).toHaveLength(0);
    expect(norm($('[data-lesetage-text]')!.textContent)).toBe('0 von 365 Tagen gelesen');
    expect($$('[data-mini-tag][data-gefuellt="true"]')).toHaveLength(0);
    expect($$('[data-mini-tag][data-gelesen="true"]')).toHaveLength(0);
    await tippe($('[data-kachel="buecher"]'));
    expect($$('[data-balken]').map((e) => Number(e.getAttribute('data-wert')))).toEqual(Array(12).fill(0));
  });

  it('[REQ-080/AK-4] Zukunft in Woche und Monat: Kalender ohne Lesetag, 0 Tage gelesen', async () => {
    const b = [buch({ seitenanzahl: 400, sitzungen: [sitzung(2026, 11, 18, 50)] })];
    await zeige(um(2026, 11, 22), 'woche', b);
    expect($$('[data-kalender-tag][data-gelesen="true"]')).toHaveLength(1);
    await vor();
    expect($$('[data-kalender-tag][data-gelesen="true"]')).toHaveLength(0);
    expect(norm($('[data-lesetage-text]')!.textContent)).toBe('0 von 7 Tagen gelesen');
    expect(norm($('[data-kachel="seiten"] [data-kachel-wert]')!.textContent)).toBe('0');
  });

  it('[REQ-080/AK-4] unbegrenzt in beide Richtungen', async () => {
    await zeige(um(2026, 11, 22), 'jahr');
    await vor(12);
    expect(titel()).toEqual(['2038', null]);
    await zurueck(40);
    expect(titel()).toEqual(['1998', null]);
  });

  it('[REQ-080/AK-5] Woche vom 30.11. bis 06.12.2026: „30 Nov – 6 Dez“ / 2026', async () => {
    await zeige(um(2026, 11, 22));
    await vor(2);
    expect(titel()).toEqual(['30 Nov – 6 Dez', '2026']);
    cleanup();
    await zeige(um(2026, 12, 3));
    expect(titel()).toEqual(['30 Nov – 6 Dez', '2026']);
  });

  it('[REQ-080/AK-5] Auslegung: Woche über den Jahreswechsel nennt beide Monate, zweite Zeile Jahr des Sonntags', async () => {
    await zeige(um(2026, 12, 30));
    expect(titel()).toEqual(['28 Dez – 3 Jan', '2027']);
    await zurueck();
    expect(titel()).toEqual(['21 – 27 Dez', '2026']);
  });

  it.each([
    ['2026-01-07', '5 – 11 Jan'],
    ['2026-02-04', '2 – 8 Feb'],
    ['2026-03-04', '2 – 8 Mär'],
    ['2026-04-08', '6 – 12 Apr'],
    ['2026-05-06', '4 – 10 Mai'],
    ['2026-06-03', '1 – 7 Jun'],
    ['2026-07-08', '6 – 12 Jul'],
    ['2026-08-05', '3 – 9 Aug'],
    ['2026-09-09', '7 – 13 Sep'],
    ['2026-10-07', '5 – 11 Okt'],
  ])('[REQ-080/AK-5] Monatskürzel laut Auslegung: Woche mit %s → „%s“', async (iso, erwartet) => {
    const [j, m, t] = iso.split('-').map(Number);
    await zeige(um(j, m, t));
    expect(titel()).toEqual([erwartet, '2026']);
  });
});
