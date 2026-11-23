/**
 * Grober Test REQ-089 – Statistik: Jahreskalender.
 * Aufbau aus dem feinen Test tests/acceptance/REQ-089-statistik-jahreskalender.test.tsx.
 */
import '@testing-library/jest-dom/vitest';
import { cleanup, render, waitFor } from '@testing-library/react';
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
async function zeige(buecher: Buch[], art: 'woche' | 'monat' | 'jahr', heute = HEUTE, bilder = new InMemoryImageStore()) {
  const repo = new InMemoryEinstellungRepository();
  await repo.speichern('statistikZeitraum', art);
  render(<StatistikAnsicht buecher={buecher} einstellungRepository={repo} bildspeicher={bilder} jetzt={() => heute} />);
  await waitFor(() => expect($(`[data-zeitraum-pille="${art}"]`)).toHaveAttribute('aria-pressed', 'true'), W);
}

it('[REQ-089/GROB] zwölf Mini-Kalender, 1. Januar 2026 in Spalte 4, nur Lesetage gefüllt, heute umrandet', async () => {
  await zeige([buch({ seitenanzahl: 500, sitzungen: [s(2026, 2, 3), s(2026, 10, 10)] }), buch({ status: 'gelesen', seitenanzahl: 300, beendetAm: '2026-03-05' })], 'jahr');
  expect($$('[data-mini-monat]')).toHaveLength(12);
  expect($('[data-mini-tag="2026-01-01"]')!.getAttribute('data-spalte')).toBe('3');
  expect($$('[data-mini-tag]').filter((e) => e.getAttribute('data-gelesen') === 'true').map((e) => e.getAttribute('data-mini-tag'))).toEqual(['2026-02-03', '2026-10-10']);
  expect($$('[data-mini-tag]').filter((e) => e.getAttribute('data-heute') === 'true').map((e) => e.getAttribute('data-mini-tag'))).toEqual(['2026-11-22']);
});
