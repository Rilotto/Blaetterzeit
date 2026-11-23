/**
 * Grober Test REQ-088 – Statistik: Kalenderkarte Woche und Monat.
 * Aufbau aus dem feinen Test tests/acceptance/REQ-088-statistik-kalender-woche-monat.test.tsx.
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
const norm = (t: string | null | undefined) => (t ?? '').replace(/[\s  ]+/g, ' ').trim();
async function zeige(buecher: Buch[], art: 'woche' | 'monat' | 'jahr', heute = HEUTE, bilder = new InMemoryImageStore()) {
  const repo = new InMemoryEinstellungRepository();
  await repo.speichern('statistikZeitraum', art);
  render(<StatistikAnsicht buecher={buecher} einstellungRepository={repo} bildspeicher={bilder} jetzt={() => heute} />);
  await waitFor(() => expect($(`[data-zeitraum-pille="${art}"]`)).toHaveAttribute('aria-pressed', 'true'), W);
}

const tage = () => $$('[data-kalender-tag]');
const COVER_A = 'data:image/png;base64,QUFB';
const COVER_B = 'data:image/png;base64,QkJC';

it('[REQ-088/GROB] Wochentage MO–SO, Cover des zuletzt gelesenen Buches am Lesetag, heute umrandet; Monat mit 1. in richtiger Spalte', async () => {
  const a = buch({ seitenanzahl: 500, sitzungen: [s(2026, 11, 18, 10, 9)] });
  const b = buch({ seitenanzahl: 500, sitzungen: [s(2026, 11, 18, 10, 21)] });
  const bilder = new InMemoryImageStore();
  await bilder.put(a.id, 'cover', COVER_A);
  await bilder.put(b.id, 'cover', COVER_B);
  await zeige([a, b], 'woche', HEUTE, bilder);
  expect($$('[data-kalender-wochentag]').map((e) => norm(e.textContent))).toEqual(['MO', 'DI', 'MI', 'DO', 'FR', 'SA', 'SO']);
  expect(tage().map((e) => e.getAttribute('data-kalender-tag'))).toEqual(['16', '17', '18', '19', '20', '21', '22'].map((t) => `2026-11-${t}`));
  expect(norm(tage()[0].textContent)).toBe('16');
  await waitFor(() => expect($('[data-kalender-tag="2026-11-18"] img[data-kalender-cover]')?.getAttribute('src')).toBe(COVER_B), W);
  expect($$('[data-kalender-tag] img[data-kalender-cover]')).toHaveLength(1);
  expect(tage().filter((e) => e.getAttribute('data-heute') === 'true').map((e) => e.getAttribute('data-kalender-tag'))).toEqual(['2026-11-22']);
  cleanup();
  await zeige([], 'monat');
  expect(tage()).toHaveLength(30);
  expect(tage()[0].getAttribute('data-spalte')).toBe('6');
});
