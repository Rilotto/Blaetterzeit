/**
 * Grober Test REQ-083 – Statistik: Balkendiagramm.
 * Aufbau aus dem feinen Test tests/acceptance/REQ-083-statistik-balkendiagramm.test.tsx.
 */
import '@testing-library/jest-dom/vitest';
import { act, cleanup, fireEvent, render, waitFor } from '@testing-library/react';
import { afterEach, expect, it } from 'vitest';
import type { Buch } from '@/domain/buch';
import { InMemoryEinstellungRepository } from '@/storage';
import { InMemoryImageStore } from '@/storage/InMemoryImageStore';
import StatistikAnsicht from '@/views/StatistikAnsicht';

afterEach(cleanup);

const W = { timeout: 4000 };
const um = (j: number, m: number, t: number, h = 12) => new Date(j, m - 1, t, h);
const s = (j: number, m: number, t: number, seite = 10, h = 12) => ({ zeitpunkt: um(j, m, t, h).toISOString(), seite });
let nr = 0;
const buch = (f: Partial<Buch> = {}): Buch => ({ id: `grob-${++nr}`, titel: 'Testbuch', status: 'am_lesen', ...f });
const HEUTE = um(2026, 11, 22, 15);
const $ = (q: string) => document.querySelector<HTMLElement>(q);
const $$ = (q: string) => Array.from(document.querySelectorAll<HTMLElement>(q));
async function tippe(el: Element | null) {
  expect(el).not.toBeNull();
  await act(async () => {
    fireEvent.click(el!);
    await new Promise((r) => setTimeout(r, 5));
  });
}
async function zeige(buecher: Buch[], art: 'woche' | 'monat' | 'jahr', heute = HEUTE, bilder = new InMemoryImageStore()) {
  const repo = new InMemoryEinstellungRepository();
  await repo.speichern('statistikZeitraum', art);
  render(<StatistikAnsicht buecher={buecher} einstellungRepository={repo} bildspeicher={bilder} jetzt={() => heute} />);
  await waitFor(() => expect($(`[data-zeitraum-pille="${art}"]`)).toHaveAttribute('aria-pressed', 'true'), W);
}

const werte = () => $$('[data-balken]').map((b) => Number(b.getAttribute('data-wert')));
const beschriftungen = () => $$('[data-balken]').map((b) => (b.getAttribute('data-beschriftung') ?? '').trim());

it('[REQ-083/GROB] Abschnitte je Woche, Monat, Jahr; „Bücher“ je Monat; oberste Hilfslinie über dem höchsten Balken', async () => {
  await zeige([buch({ seitenanzahl: 400, sitzungen: [s(2026, 11, 17, 150), s(2026, 11, 18, 200)] })], 'woche');
  expect(beschriftungen().join(' ')).toBe('M D M D F S S');
  expect(werte()).toEqual([0, 150, 50, 0, 0, 0, 0]);
  expect(Math.max(...$$('[data-hilfslinie]').map((e) => Number(e.getAttribute('data-hilfslinie'))))).toBeGreaterThanOrEqual(150);
  cleanup();
  await zeige([], 'monat');
  expect(werte()).toHaveLength(30);
  expect(beschriftungen().filter((t) => t !== '')).toEqual(['1', '8', '15', '22', '29']);
  cleanup();
  await zeige([buch({ status: 'gelesen', seitenanzahl: 300, beendetAm: '2026-10-12' })], 'jahr');
  expect(beschriftungen().join(' ')).toBe('J F M A M J J A S O N D');
  await tippe($('[data-kachel="buecher"]'));
  expect(werte()).toEqual([0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0]);
});
