/**
 * Akzeptanztests REQ-082 – Seite „Statistik“: Vergleichszeile gegenüber dem vorherigen Zeitraum.
 * Abgeleitet aus dem REQ-Text. Schnittstelle laut Entwickler (Sprint 09): [data-vergleich].
 * Minuszeichen laut REQ-Text „−“ (U+2212).
 */
import '@testing-library/jest-dom/vitest';
import { act, cleanup, fireEvent, render, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import type { Buch } from '@/domain/buch';
import { InMemoryEinstellungRepository } from '@/storage';
import { InMemoryImageStore } from '@/storage/InMemoryImageStore';
import StatistikAnsicht from '@/views/StatistikAnsicht';

afterEach(cleanup);

const W = { timeout: 4000 };
const um = (j: number, m: number, t: number, h = 12) => new Date(j, m - 1, t, h);
const sitzung = (j: number, m: number, t: number, seite: number, h = 12) => ({ zeitpunkt: um(j, m, t, h).toISOString(), seite });
let nr = 0;
const buch = (f: Partial<Buch> = {}): Buch => ({ id: `b82-${++nr}`, titel: 'Testbuch', status: 'am_lesen', ...f });
const HEUTE = um(2026, 11, 22, 15);
const $ = (s: string) => document.querySelector<HTMLElement>(s);
const norm = (t: string | null | undefined) => (t ?? '').replace(/[\s  ]+/g, ' ').trim();
async function tippe(el: Element | null) {
  expect(el).not.toBeNull();
  await act(async () => {
    fireEvent.click(el!);
    await new Promise((r) => setTimeout(r, 5));
  });
}
async function zeige(buecher: Buch[], art: 'woche' | 'monat' | 'jahr', heute = HEUTE) {
  const repo = new InMemoryEinstellungRepository();
  await repo.speichern('statistikZeitraum', art);
  render(<StatistikAnsicht buecher={buecher} einstellungRepository={repo} bildspeicher={new InMemoryImageStore()} jetzt={() => heute} />);
  await waitFor(() => expect($(`[data-zeitraum-pille="${art}"]`)).toHaveAttribute('aria-pressed', 'true'), W);
}
const vergleich = () => norm($('[data-vergleich]')!.textContent);
/** 608 Seiten, nachgetragen am angegebenen Tag. */
const nachgetragen = (datum: string, seiten = 608) => buch({ status: 'gelesen', seitenanzahl: seiten, beendetAm: datum });

describe('REQ-082 Vergleichszeile', () => {
  it('[REQ-082/AK-1] „Jährlich“ 2026 mit 608 Seiten, 2025 mit 0, „Seiten“: „+608 vs. 2025“', async () => {
    await zeige([nachgetragen('2026-04-01')], 'jahr');
    expect(vergleich()).toBe('+608 vs. 2025');
  });

  it('[REQ-082/AK-1] Lage: Vergleichszeile steht unter der großen Kennzahl', async () => {
    await zeige([nachgetragen('2026-04-01')], 'jahr');
    expect($('[data-kennzahl-wert]')!.compareDocumentPosition($('[data-vergleich]')!) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it('[REQ-082/AK-2] „Monatlich“ November 0 Seiten, Oktober 608: „−608 vs. Oktober“ (Minus erlaubt)', async () => {
    await zeige([nachgetragen('2026-10-15')], 'monat');
    expect(vergleich()).toBe('−608 vs. Oktober');
  });

  it('[REQ-082/AK-2] Rückgang mit Werten auf beiden Seiten: Oktober 100, November 30 → „−70 vs. Oktober“', async () => {
    await zeige([buch({ seitenanzahl: 400, sitzungen: [sitzung(2026, 10, 5, 100), sitzung(2026, 11, 3, 130)] })], 'monat');
    expect(vergleich()).toBe('−70 vs. Oktober');
  });

  it('[REQ-082/AK-2] Bezeichnung folgt dem gezeigten Zeitraum: Januar 2026 → „vs. Dezember“; Jahr 2025 → „vs. 2024“', async () => {
    await zeige([nachgetragen('2025-12-10', 50)], 'monat', um(2026, 1, 20));
    expect(vergleich()).toBe('−50 vs. Dezember');
    await tippe($('[data-zeitraum-zurueck]'));
    expect(vergleich()).toBe('+50 vs. November');
    cleanup();
    await zeige([nachgetragen('2025-12-10', 50)], 'jahr');
    await tippe($('[data-zeitraum-zurueck]'));
    expect(vergleich()).toBe('+50 vs. 2024');
    await tippe($('[data-zeitraum-vor]'));
    expect(vergleich()).toBe('−50 vs. 2025');
  });

  it('[REQ-082/AK-3] „Jährlich“, 2026 ein beendetes Buch, 2025 keins, „Bücher“: „+1 vs. 2025“', async () => {
    await zeige([nachgetragen('2026-04-01')], 'jahr');
    await tippe($('[data-kachel="buecher"]'));
    expect(vergleich()).toBe('+1 vs. 2025');
  });

  it('[REQ-082/AK-3] „Bücher“ mit Rückgang: 2025 drei, 2026 eins → „−2 vs. 2025“; Seiten zählen dabei nicht', async () => {
    await zeige([nachgetragen('2025-01-01'), nachgetragen('2025-06-01'), nachgetragen('2025-12-31'), nachgetragen('2026-01-01', 5000)], 'jahr');
    await tippe($('[data-kachel="buecher"]'));
    expect(vergleich()).toBe('−2 vs. 2025');
  });

  it('[REQ-082/AK-4] „Wöchentlich“, Woche 120 Seiten, Vorwoche 0: „+120 vs. Vorwoche“', async () => {
    await zeige([buch({ seitenanzahl: 400, sitzungen: [sitzung(2026, 11, 18, 120)] })], 'woche');
    expect(vergleich()).toBe('+120 vs. Vorwoche');
  });

  it('[REQ-082/AK-4] Woche: Sitzung Sonntag 15.11. gehört zur Vorwoche (Woche ab Montag)', async () => {
    await zeige([buch({ seitenanzahl: 400, sitzungen: [sitzung(2026, 11, 15, 100), sitzung(2026, 11, 16, 120)] })], 'woche');
    expect(vergleich()).toBe('−80 vs. Vorwoche');
  });

  it('[REQ-082/AK-5] „Monatlich“, November und Oktober je 0 Seiten: „±0 vs. Oktober“', async () => {
    await zeige([], 'monat');
    expect(vergleich()).toBe('±0 vs. Oktober');
  });

  it('[REQ-082/AK-5] gleiche Werte ungleich 0 ergeben ebenfalls „±0“ (Woche und Bücher)', async () => {
    await zeige([buch({ seitenanzahl: 400, sitzungen: [sitzung(2026, 11, 10, 60), sitzung(2026, 11, 17, 120)] })], 'woche');
    expect(vergleich()).toBe('±0 vs. Vorwoche');
    cleanup();
    await zeige([nachgetragen('2026-10-01'), nachgetragen('2026-11-01')], 'monat');
    await tippe($('[data-kachel="buecher"]'));
    expect(vergleich()).toBe('±0 vs. Oktober');
  });
});
