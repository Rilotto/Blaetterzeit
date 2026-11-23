/**
 * Grober Test REQ-080 – Statistik: Zeitraum-Titel und Blättern.
 * Aufbau aus dem feinen Test tests/acceptance/REQ-080-statistik-zeitraum-navigation.test.tsx.
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
const norm = (t: string | null | undefined) => (t ?? '').replace(/[\s  ]+/g, ' ').trim();
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

const titel = () => [norm($('[data-zeitraum-zeile1]')?.textContent), $('[data-zeitraum-zeile2]') ? norm($('[data-zeitraum-zeile2]')!.textContent) : null];

it('[REQ-080/GROB] Woche Mo–So mit Titel, Blättern zurück/vor, Zukunft ist leer', async () => {
  await zeige([buch({ seitenanzahl: 400, sitzungen: [s(2026, 11, 18, 50)] })], 'woche');
  expect(titel()).toEqual(['16 – 22 Nov', '2026']);
  await tippe($('[data-zeitraum-zurueck]'));
  expect(titel()).toEqual(['9 – 15 Nov', '2026']);
  await tippe($('[data-zeitraum-vor]'));
  await tippe($('[data-zeitraum-vor]'));
  expect(titel()).toEqual(['23 – 29 Nov', '2026']);
  expect(norm($('[data-kachel="seiten"] [data-kachel-wert]')!.textContent)).toBe('0');
  cleanup();
  await zeige([], 'monat');
  expect(titel()).toEqual(['November', '2026']);
  await tippe($('[data-zeitraum-zurueck]'));
  expect(titel()).toEqual(['Oktober', '2026']);
});
