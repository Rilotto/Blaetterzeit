/**
 * Grober Test REQ-090 – Statistik: Farben aus Farbrubriken (Designwechsel wirkt).
 * Aufbau aus dem feinen Test tests/acceptance/REQ-090-statistik-farbdesigns-stile.test.tsx.
 */
import '@testing-library/jest-dom/vitest';
import { cleanup, render, waitFor } from '@testing-library/react';
import type { CSSProperties } from 'react';
import { afterEach, expect, it } from 'vitest';
import type { Buch } from '@/domain/buch';
import { InMemoryEinstellungRepository } from '@/storage';
import { InMemoryImageStore } from '@/storage/InMemoryImageStore';
import { farbVariablen, type FarbdesignId } from '@/theme';
import StatistikAnsicht from '@/views/StatistikAnsicht';

afterEach(cleanup);

const W = { timeout: 4000 };
const um = (j: number, m: number, t: number) => new Date(j, m - 1, t, 12);
const DATEN: Buch[] = [
  { id: 'g90-1', titel: 'A', status: 'am_lesen', seitenanzahl: 400, sitzungen: [16, 18].map((t, i) => ({ zeitpunkt: um(2026, 11, t).toISOString(), seite: 40 * (i + 1) })) },
  { id: 'g90-2', titel: 'B', status: 'gelesen', seitenanzahl: 200, beendetAm: '2026-11-20' },
];
const $ = (q: string) => document.querySelector<HTMLElement>(q);
function farbe(ausdruck: string) {
  const p = document.createElement('span');
  p.style.setProperty('color', ausdruck);
  $('[data-testwurzel]')!.appendChild(p);
  const w = getComputedStyle(p).color;
  p.remove();
  return w;
}
async function proben(design: FarbdesignId) {
  const repo = new InMemoryEinstellungRepository();
  await repo.speichern('statistikZeitraum', 'woche');
  render(
    <div data-testwurzel="" style={farbVariablen(design) as CSSProperties}>
      <StatistikAnsicht buecher={DATEN} einstellungRepository={repo} bildspeicher={new InMemoryImageStore()} jetzt={() => um(2026, 11, 22)} />
    </div>,
  );
  await waitFor(() => expect($('[data-zeitraum-pille="woche"]')).toHaveAttribute('aria-pressed', 'true'), W);
  const sessions = getComputedStyle($('[data-balken-teil="sessions"]')!).backgroundColor;
  const beendet = getComputedStyle($('[data-balken-teil="beendet"]')!).backgroundColor;
  expect(sessions).toBe(farbe('var(--bz-farbe-primaer)'));
  expect(beendet).toBe(farbe('var(--bz-farbe-gold)'));
  const kennzahl = getComputedStyle($('[data-kennzahl-wert]')!).color;
  cleanup();
  return [sessions, kennzahl];
}

it('[REQ-090/GROB] Balken in Primär/Gold des Designs; Wechsel hell → dunkel ändert die Farben', async () => {
  const hell = await proben('klassisch');
  const dunkel = await proben('nachtlektuere');
  hell.forEach((w, i) => expect(w, `Probe ${i}`).not.toBe(dunkel[i]));
});
