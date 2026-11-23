/**
 * Grober Test REQ-084 – Statistik: Seiten in Sessions und aus beendeten Büchern, gestapelt.
 * Aufbau aus dem feinen Test tests/acceptance/REQ-084-statistik-seitenberechnung-stapel.test.tsx.
 */
import '@testing-library/jest-dom/vitest';
import { cleanup, render, waitFor } from '@testing-library/react';
import { afterEach, expect, it } from 'vitest';
import type { Buch, Fortschrittsmodus } from '@/domain/buch';
import { fortschrittSichern } from '@/domain/fortschritt';
import { InMemoryEinstellungRepository } from '@/storage';
import { InMemoryImageStore } from '@/storage/InMemoryImageStore';
import StatistikAnsicht from '@/views/StatistikAnsicht';

afterEach(cleanup);

const W = { timeout: 4000 };
const um = (j: number, m: number, t: number, h = 12) => new Date(j, m - 1, t, h);
let nr = 0;
const buch = (f: Partial<Buch> = {}): Buch => ({ id: `g84-${++nr}`, titel: 'Testbuch', status: 'am_lesen', ...f });
const $ = (s: string) => document.querySelector<HTMLElement>(s);
const $$ = (s: string) => Array.from(document.querySelectorAll<HTMLElement>(s));
const norm = (t: string | null | undefined) => (t ?? '').replace(/[\s  ]+/g, ' ').trim();
const lies = (b: Buch, schritte: [number, Date][], modus: Fortschrittsmodus = 'seite') => schritte.reduce((x, [w, z]) => fortschrittSichern(x, modus, w, z), b);
const teil = (i: number, art: 'sessions' | 'beendet') => {
  const t = $$('[data-balken]')[i].querySelector(`[data-balken-teil="${art}"]`);
  return t ? Number(t.getAttribute('data-wert')) : 0;
};
async function zeige(buecher: Buch[], art: 'woche' | 'jahr') {
  const repo = new InMemoryEinstellungRepository();
  await repo.speichern('statistikZeitraum', art);
  render(<StatistikAnsicht buecher={buecher} einstellungRepository={repo} bildspeicher={new InMemoryImageStore()} jetzt={() => um(2026, 11, 22, 20)} />);
  await waitFor(() => expect($(`[data-zeitraum-pille="${art}"]`)).toHaveAttribute('aria-pressed', 'true'), W);
}

it('[REQ-084/GROB] Tagesdifferenz der Sitzungen, Prozentmodus, Rest des beendeten Buches ohne Doppelzählung, Legende', async () => {
  const p = lies(buch({ seitenanzahl: 400 }), [[10, um(2026, 11, 20, 10)]], 'prozent');
  expect(p.sitzungen?.[0].seite).toBe(40);
  const b = lies(buch({ seitenanzahl: 400 }), [
    [20, um(2026, 11, 16, 9)],
    [50, um(2026, 11, 16, 18)],
    [80, um(2026, 11, 17, 8)],
  ]);
  await zeige([b], 'woche');
  expect(teil(0, 'sessions')).toBe(50);
  expect(teil(1, 'sessions')).toBe(30);
  const leg = norm($('[data-legende]')?.textContent);
  expect(leg).toContain('in Sessions');
  expect(leg).toContain('aus beendeten Büchern');
  expect(leg).not.toContain('›');
  cleanup();
  const fertig = { ...lies(buch({ seitenanzahl: 400 }), [[250, um(2026, 10, 5)]]), status: 'gelesen', beendetAm: '2026-11-10' } as Buch;
  await zeige([fertig], 'jahr');
  expect(teil(9, 'sessions')).toBe(250);
  expect(teil(10, 'beendet')).toBe(150);
  expect(teil(10, 'sessions')).toBe(0);
  expect(norm($('[data-kachel="seiten"] [data-kachel-wert]')!.textContent)).toBe('400');
});
