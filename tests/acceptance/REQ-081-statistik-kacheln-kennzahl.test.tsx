/**
 * Akzeptanztests REQ-081 – Seite „Statistik“: Kacheln „Seiten“ und „Bücher“ mit großer Kennzahl.
 * Abgeleitet aus dem REQ-Text. Schnittstellen laut Entwickler (Sprint 09): [data-kachel=seiten|buecher][aria-pressed]
 * mit [data-kachel-wert], [data-kennzahl-wert], [data-kennzahl-einheit]. „Volle Breite“ ist in jsdom nur über
 * Flex-Eigenschaften prüfbar; die optische Prüfung macht der CEO im Prototyp.
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
const buch = (f: Partial<Buch> = {}): Buch => ({ id: `b81-${++nr}`, titel: 'Testbuch', status: 'am_lesen', ...f });
const HEUTE = um(2026, 11, 22, 15);
const $ = (s: string) => document.querySelector<HTMLElement>(s);
const $$ = (s: string) => Array.from(document.querySelectorAll<HTMLElement>(s));
const norm = (t: string | null | undefined) => (t ?? '').replace(/[\s  ]+/g, ' ').trim();
async function tippe(el: Element | null) {
  expect(el).not.toBeNull();
  await act(async () => {
    fireEvent.click(el!);
    await new Promise((r) => setTimeout(r, 5));
  });
}
async function zeige(buecher: Buch[], art: 'woche' | 'monat' | 'jahr' = 'jahr', heute = HEUTE) {
  const repo = new InMemoryEinstellungRepository();
  await repo.speichern('statistikZeitraum', art);
  render(<StatistikAnsicht buecher={buecher} einstellungRepository={repo} bildspeicher={new InMemoryImageStore()} jetzt={() => heute} />);
  await waitFor(() => expect($(`[data-zeitraum-pille="${art}"]`)).toHaveAttribute('aria-pressed', 'true'), W);
}
const kachel = (id: string) => $(`[data-kachel="${id}"]`)!;
const kachelWert = (id: string) => norm(kachel(id).querySelector('[data-kachel-wert]')!.textContent);
const kennzahl = () => [norm($('[data-kennzahl-wert]')!.textContent), norm($('[data-kennzahl-einheit]')!.textContent)];
const gewaehlt = () => $$('[data-kachel]').filter((k) => k.getAttribute('aria-pressed') === 'true').map((k) => k.getAttribute('data-kachel'));
const zurueck = () => tippe($('[data-zeitraum-zurueck]'));

describe('REQ-081 Kacheln und Kennzahl', () => {
  it('[REQ-081/AK-1] genau „Seiten“ und „Bücher“ nebeneinander, keine „Zeit“; beide teilen sich die Kartenbreite', async () => {
    await zeige([]);
    const k = $$('[data-kachel]');
    expect(k.map((e) => e.getAttribute('data-kachel'))).toEqual(['seiten', 'buecher']);
    // Wert über der Bezeichnung
    for (const [e, name] of [
      [k[0], 'Seiten'],
      [k[1], 'Bücher'],
    ] as const) {
      const w = e.querySelector('[data-kachel-wert]')!;
      const bez = Array.from(e.querySelectorAll('*')).find((x) => norm(x.textContent) === name && x.children.length === 0)!;
      expect(bez).toBeTruthy();
      expect(w.compareDocumentPosition(bez) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    }
    expect(document.body.textContent).not.toMatch(/\bZeit\b/);
    expect(k[0].parentElement).toBe(k[1].parentElement);
    expect(getComputedStyle(k[0].parentElement!).display).toBe('flex');
    for (const e of k) expect(getComputedStyle(e).flexGrow).toBe('1');
    expect(getComputedStyle(k[0]).flexBasis).toBe(getComputedStyle(k[1]).flexBasis);
  });

  it('[REQ-081/AK-1] genau eine Kachel hervorgehoben, beim Öffnen „Seiten“ (Auslegung); Antippen wählt', async () => {
    await zeige([]);
    expect(gewaehlt()).toEqual(['seiten']);
    const stilVorher = kachel('seiten').getAttribute('style');
    expect(stilVorher).not.toBe(kachel('buecher').getAttribute('style'));
    await tippe(kachel('buecher'));
    expect(gewaehlt()).toEqual(['buecher']);
    expect(kachel('buecher').getAttribute('style')).toBe(stilVorher);
    await tippe(kachel('seiten'));
    expect(gewaehlt()).toEqual(['seiten']);
  });

  it('[REQ-081/AK-2] Jahr mit 608 gezählten Seiten, „Seiten“ gewählt: Kachel „608“, groß „608“ mit „Seiten“', async () => {
    await zeige([buch({ status: 'gelesen', seitenanzahl: 608, beendetAm: '2026-03-05' })]);
    expect(kachelWert('seiten')).toBe('608');
    expect(kennzahl()).toEqual(['608', 'Seiten']);
  });

  it('[REQ-081/AK-2] Summe aus Sessions und beendeten Büchern (200 + 408 = 608), dazu ein laufendes Buch mit 50 Seiten', async () => {
    await zeige([
      buch({ status: 'gelesen', seitenanzahl: 608, beendetAm: '2026-06-01', sitzungen: [sitzung(2026, 5, 10, 200)] }),
      buch({ seitenanzahl: 300, sitzungen: [sitzung(2026, 11, 20, 50)] }),
    ]);
    expect(kachelWert('seiten')).toBe('658');
    expect(kennzahl()).toEqual(['658', 'Seiten']);
  });

  it('[REQ-081/AK-3] genau ein Buch *gelesen* mit „Beendet am“ im Jahr: „Bücher“ antippen → hervorgehoben, groß „1“ mit „beendet“', async () => {
    await zeige([buch({ status: 'gelesen', seitenanzahl: 200, beendetAm: '2026-02-14' }), buch({ status: 'am_lesen' })]);
    expect(kachelWert('buecher')).toBe('1');
    await tippe(kachel('buecher'));
    expect(gewaehlt()).toEqual(['buecher']);
    expect(kennzahl()).toEqual(['1', 'beendet']);
  });

  it('[REQ-081/AK-3] Auslegung: Buch mit „Beendet am“, aber nicht mehr *gelesen*, zählt nicht; *gelesen* ohne Datum zählt nicht', async () => {
    await zeige([
      buch({ status: 'gelesen', beendetAm: '2026-02-14' }),
      buch({ status: 'am_lesen', beendetAm: '2026-03-01' }),
      buch({ status: 'abgebrochen', beendetAm: '2026-03-02' }),
      buch({ status: 'gelesen' }),
      buch({ status: 'gelesen', beendetAm: '2026-12-31' }),
    ]);
    await tippe(kachel('buecher'));
    expect(kennzahl()).toEqual(['2', 'beendet']);
  });

  it('[REQ-081/AK-4] *gelesen* mit „Beendet am“ 31.10.2026, „Monatlich“ November 2026: „Bücher“ 0; Oktober 1', async () => {
    await zeige([buch({ status: 'gelesen', beendetAm: '2026-10-31' })], 'monat');
    expect(kachelWert('buecher')).toBe('0');
    await zurueck();
    expect(kachelWert('buecher')).toBe('1');
  });

  it.each([
    ['2026-11-01', '1'],
    ['2026-11-30', '1'],
    ['2026-12-01', '0'],
    ['2025-11-15', '0'],
  ])('[REQ-081/AK-4] Grenzen im Monat November 2026: „Beendet am“ %s → „Bücher“ %s', async (datum, erwartet) => {
    await zeige([buch({ status: 'gelesen', beendetAm: datum })], 'monat');
    expect(kachelWert('buecher')).toBe(erwartet);
  });

  it('[REQ-081/AK-4] Woche: Buch am Sonntag 15.11. gehört nicht zur Woche 16 – 22 Nov, Montag 16.11. schon', async () => {
    await zeige([buch({ status: 'gelesen', beendetAm: '2026-11-15' }), buch({ status: 'gelesen', beendetAm: '2026-11-16' })], 'woche');
    expect(kachelWert('buecher')).toBe('1');
  });
});
