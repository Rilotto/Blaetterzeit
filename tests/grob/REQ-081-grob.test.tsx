/**
 * Grober Test REQ-081 – Statistik: Kacheln „Seiten“ und „Bücher“ mit großer Kennzahl.
 * Aufbau aus dem feinen Test tests/acceptance/REQ-081-statistik-kacheln-kennzahl.test.tsx.
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

const wert = (id: string) => norm($(`[data-kachel="${id}"] [data-kachel-wert]`)!.textContent);
const kennzahl = () => [norm($('[data-kennzahl-wert]')!.textContent), norm($('[data-kennzahl-einheit]')!.textContent)];

it('[REQ-081/GROB] genau „Seiten“ und „Bücher“; Seiten = Sessions + beendete Bücher, Bücher zählt nur *gelesen* im Zeitraum', async () => {
  await zeige(
    [
      buch({ status: 'gelesen', seitenanzahl: 608, beendetAm: '2026-06-01', sitzungen: [s(2026, 5, 10, 200)] }),
      buch({ seitenanzahl: 300, sitzungen: [s(2026, 11, 20, 50)] }),
      buch({ status: 'am_lesen', beendetAm: '2026-03-01' }),
      buch({ status: 'gelesen', beendetAm: '2025-03-01' }),
    ],
    'jahr',
  );
  expect($$('[data-kachel]').map((e) => e.getAttribute('data-kachel'))).toEqual(['seiten', 'buecher']);
  expect(wert('seiten')).toBe('658');
  expect(kennzahl()).toEqual(['658', 'Seiten']);
  expect(wert('buecher')).toBe('1');
  await tippe($('[data-kachel="buecher"]'));
  expect($('[data-kachel="buecher"]')).toHaveAttribute('aria-pressed', 'true');
  expect(kennzahl()).toEqual(['1', 'beendet']);
});
