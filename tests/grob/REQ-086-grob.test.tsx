/**
 * Grober Test REQ-086 – Statistik: „X von N Tagen gelesen“.
 * Aufbau aus dem feinen Test tests/acceptance/REQ-086-statistik-lesetage-im-zeitraum.test.tsx.
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

const zeile = () => norm($('[data-lesetage-text]')!.textContent);

it('[REQ-086/GROB] Lesetage = Tage mit Sitzung (buchübergreifend, ohne „Beendet am“); N je Zeitraum', async () => {
  await zeige(
    [
      buch({ seitenanzahl: 500, sitzungen: [s(2026, 11, 16, 10, 9), s(2026, 11, 18, 30, 20)] }),
      buch({ seitenanzahl: 500, sitzungen: [s(2026, 11, 16, 10, 21)] }),
      buch({ status: 'gelesen', seitenanzahl: 300, beendetAm: '2026-11-20' }),
    ],
    'woche',
  );
  expect(zeile()).toBe('2 von 7 Tagen gelesen');
  cleanup();
  await zeige([], 'monat', um(2028, 2, 10));
  expect(zeile()).toBe('0 von 29 Tagen gelesen');
  cleanup();
  await zeige([], 'jahr');
  expect(zeile()).toBe('0 von 365 Tagen gelesen');
});
