/**
 * Grober Test REQ-082 – Statistik: Vergleichszeile.
 * Aufbau aus dem feinen Test tests/acceptance/REQ-082-statistik-vergleichszeile.test.tsx.
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
const norm = (t: string | null | undefined) => (t ?? '').replace(/[\s  ]+/g, ' ').trim();
async function zeige(buecher: Buch[], art: 'woche' | 'monat' | 'jahr', heute = HEUTE, bilder = new InMemoryImageStore()) {
  const repo = new InMemoryEinstellungRepository();
  await repo.speichern('statistikZeitraum', art);
  render(<StatistikAnsicht buecher={buecher} einstellungRepository={repo} bildspeicher={bilder} jetzt={() => heute} />);
  await waitFor(() => expect($(`[data-zeitraum-pille="${art}"]`)).toHaveAttribute('aria-pressed', 'true'), W);
}

const vergleich = () => norm($('[data-vergleich]')!.textContent);

it('[REQ-082/GROB] Differenz zum Vorzeitraum mit „+“, „−“ und „±0“ und passender Bezeichnung', async () => {
  const nachgetragen = (datum: string) => buch({ status: 'gelesen', seitenanzahl: 608, beendetAm: datum });
  await zeige([nachgetragen('2026-04-01')], 'jahr');
  expect(vergleich()).toBe('+608 vs. 2025');
  cleanup();
  await zeige([nachgetragen('2026-10-15')], 'monat');
  expect(vergleich()).toBe('−608 vs. Oktober');
  cleanup();
  await zeige([buch({ seitenanzahl: 400, sitzungen: [s(2026, 11, 18, 120)] })], 'woche');
  expect(vergleich()).toBe('+120 vs. Vorwoche');
  cleanup();
  await zeige([], 'monat');
  expect(vergleich()).toBe('±0 vs. Oktober');
});
