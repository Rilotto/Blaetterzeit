/**
 * Akzeptanztests REQ-086 – Seite „Statistik“: Zeile „X von N Tagen gelesen“.
 * Abgeleitet aus dem REQ-Text. Schnittstelle laut Entwickler (Sprint 09): [data-lesetage-text].
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
const s = (j: number, m: number, t: number, h = 12, mi = 0, seite = 10) => ({ zeitpunkt: um(j, m, t, h, mi).toISOString(), seite });
let nr = 0;
const buch = (f: Partial<Buch> = {}): Buch => ({ id: `b86-${++nr}`, titel: 'Testbuch', status: 'am_lesen', seitenanzahl: 500, ...f });
const HEUTE = um(2026, 11, 22, 15);
const $ = (q: string) => document.querySelector<HTMLElement>(q);
const norm = (t: string | null | undefined) => (t ?? '').replace(/[\s  ]+/g, ' ').trim();
async function tippe(el: Element | null) {
  expect(el).not.toBeNull();
  await act(async () => {
    fireEvent.click(el!);
    await new Promise((r) => setTimeout(r, 5));
  });
}
async function zeige(buecher: Buch[], art: 'woche' | 'monat' | 'jahr' = 'woche', heute = HEUTE) {
  const repo = new InMemoryEinstellungRepository();
  await repo.speichern('statistikZeitraum', art);
  render(<StatistikAnsicht buecher={buecher} einstellungRepository={repo} bildspeicher={new InMemoryImageStore()} jetzt={() => heute} />);
  await waitFor(() => expect($(`[data-zeitraum-pille="${art}"]`)).toHaveAttribute('aria-pressed', 'true'), W);
}
const zeile = () => norm($('[data-lesetage-text]')!.textContent);

describe('REQ-086 Lesetage im Zeitraum', () => {
  it('[REQ-086/AK-1] Sitzungen am Montag (zwei Bücher) und Mittwoch: „2 von 7 Tagen gelesen“', async () => {
    await zeige([buch({ sitzungen: [s(2026, 11, 16, 9), s(2026, 11, 18, 20, 0, 30)] }), buch({ sitzungen: [s(2026, 11, 16, 21)] })]);
    expect(zeile()).toBe('2 von 7 Tagen gelesen');
  });

  it('[REQ-086/AK-1] mehrere Sitzungen desselben Buches an einem Tag zählen einmal; Sitzungen außerhalb der Woche zählen nicht', async () => {
    await zeige([buch({ sitzungen: [s(2026, 11, 15, 23, 59), s(2026, 11, 16, 0, 1, 20), s(2026, 11, 16, 8, 0, 30), s(2026, 11, 23, 0, 1, 40)] })]);
    expect(zeile()).toBe('1 von 7 Tagen gelesen');
  });

  it('[REQ-086/AK-1] Lage: Zeile unter der Karte mit Kacheln und Diagramm', async () => {
    await zeige([]);
    expect($('[data-balken]')!.compareDocumentPosition($('[data-lesetage-text]')!) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it('[REQ-086/AK-1] Sitzung ohne Seitenzahl (Alt-Sitzung) zählt als Lesetag', async () => {
    await zeige([buch({ sitzungen: [{ zeitpunkt: um(2026, 11, 17).toISOString() }] })]);
    expect(zeile()).toBe('1 von 7 Tagen gelesen');
  });

  it('[REQ-086/AK-2] keine Sitzungen: Woche „0 von 7“, Februar 2028 „0 von 29“, Jahr 2026 „0 von 365 Tagen gelesen“', async () => {
    await zeige([], 'woche');
    expect(zeile()).toBe('0 von 7 Tagen gelesen');
    await tippe($('[data-zeitraum-pille="monat"]'));
    for (let i = 0; i < 15; i++) await tippe($('[data-zeitraum-vor]'));
    expect(norm($('[data-zeitraum-zeile1]')!.textContent)).toBe('Februar');
    expect(norm($('[data-zeitraum-zeile2]')!.textContent)).toBe('2028');
    expect(zeile()).toBe('0 von 29 Tagen gelesen');
    await tippe($('[data-zeitraum-pille="jahr"]'));
    expect(zeile()).toBe('0 von 365 Tagen gelesen');
  });

  it.each([
    ['monat', um(2026, 2, 10), '0 von 28 Tagen gelesen'],
    ['monat', um(2026, 11, 10), '0 von 30 Tagen gelesen'],
    ['monat', um(2026, 12, 10), '0 von 31 Tagen gelesen'],
    ['jahr', um(2028, 6, 1), '0 von 366 Tagen gelesen'],
    ['jahr', um(2100, 6, 1), '0 von 365 Tagen gelesen'],
  ] as const)('[REQ-086/AK-2] N je Zeitraum: %s um %s → „%s“', async (art, heute, erwartet) => {
    await zeige([], art, heute);
    expect(zeile()).toBe(erwartet);
  });

  it('[REQ-086/AK-2] Jahr mit Lesetagen in verschiedenen Monaten', async () => {
    await zeige([buch({ sitzungen: [s(2026, 1, 1), s(2026, 2, 3, 12, 0, 20), s(2026, 12, 31, 23, 0, 30), s(2025, 12, 31, 12, 0, 5)] })], 'jahr');
    expect(zeile()).toBe('3 von 365 Tagen gelesen');
  });

  it('[REQ-086/AK-3] Buch *gelesen* mit „Beendet am“ heute ohne Sitzung: „0 von 7 Tagen gelesen“', async () => {
    await zeige([buch({ status: 'gelesen', seitenanzahl: 300, beendetAm: '2026-11-22' })]);
    expect(zeile()).toBe('0 von 7 Tagen gelesen');
  });

  it('[REQ-086/AK-3] nachgetragene Bücher zählen auch im Jahr nicht', async () => {
    await zeige(
      [buch({ status: 'gelesen', beendetAm: '2026-03-05' }), buch({ status: 'gelesen', beendetAm: '2026-04-05', sitzungen: [s(2026, 4, 1)] })],
      'jahr',
    );
    expect(zeile()).toBe('1 von 365 Tagen gelesen');
  });
});
