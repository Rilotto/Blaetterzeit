/**
 * Grober Test REQ-087 – Statistik: „Serie X Tage“ buchübergreifend.
 * Aufbau aus dem feinen Test tests/acceptance/REQ-087-statistik-serie.test.tsx.
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

const serie = () => norm($('[data-serie-text]')!.textContent);

it('[REQ-087/GROB] Serie buchübergreifend bis heute, unabhängig vom gezeigten Zeitraum; Lücke ergibt 0', async () => {
  await zeige([buch({ seitenanzahl: 500, sitzungen: [s(2026, 11, 20), s(2026, 11, 21, 20)] }), buch({ seitenanzahl: 500, sitzungen: [s(2026, 11, 22, 30, 9)] })], 'woche');
  expect(serie()).toBe('Serie 3 Tage');
  await tippe($('[data-zeitraum-zurueck]'));
  expect(serie()).toBe('Serie 3 Tage');
  cleanup();
  await zeige([buch({ seitenanzahl: 500, sitzungen: [s(2026, 11, 20)] }), buch({ status: 'gelesen', beendetAm: '2026-11-22' })], 'woche');
  expect(serie()).toBe('Serie 0 Tage');
});
