/**
 * Akzeptanztests REQ-088 – Seite „Statistik“: Kalenderkarte für Woche und Monat.
 * Abgeleitet aus dem REQ-Text. Schnittstellen laut Entwickler (Sprint 09): [data-kalender=woche|monat],
 * [data-kalender-wochentag], [data-kalender-tag=JJJJ-MM-TT][data-spalte][data-heute][data-gelesen][data-buch-id]
 * mit [data-kalender-cover] (img) bzw. [data-kalender-cover-platzhalter].
 */
import '@testing-library/jest-dom/vitest';
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import type { Buch } from '@/domain/buch';
import { InMemoryEinstellungRepository } from '@/storage';
import { InMemoryImageStore } from '@/storage/InMemoryImageStore';
import StatistikAnsicht from '@/views/StatistikAnsicht';

afterEach(cleanup);

const W = { timeout: 4000 };
const um = (j: number, m: number, t: number, h = 12, mi = 0) => new Date(j, m - 1, t, h, mi);
const s = (j: number, m: number, t: number, h = 12, seite = 10) => ({ zeitpunkt: um(j, m, t, h).toISOString(), seite });
let nr = 0;
const buch = (f: Partial<Buch> = {}): Buch => ({ id: `b88-${++nr}`, titel: 'Testbuch', status: 'am_lesen', seitenanzahl: 500, ...f });
const HEUTE = um(2026, 11, 22, 15);
const COVER_A = 'data:image/png;base64,QUFB';
const COVER_B = 'data:image/png;base64,QkJC';
const $ = (q: string) => document.querySelector<HTMLElement>(q);
const $$ = (q: string) => Array.from(document.querySelectorAll<HTMLElement>(q));
const norm = (t: string | null | undefined) => (t ?? '').replace(/[\s  ]+/g, ' ').trim();
async function tippe(el: Element | null) {
  expect(el).not.toBeNull();
  await act(async () => {
    fireEvent.click(el!);
    await new Promise((r) => setTimeout(r, 10));
  });
}
async function zeige(buecher: Buch[], art: 'woche' | 'monat' | 'jahr' = 'woche', heute = HEUTE, cover: Record<string, string> = {}) {
  const repo = new InMemoryEinstellungRepository();
  await repo.speichern('statistikZeitraum', art);
  const bilder = new InMemoryImageStore();
  for (const [id, url] of Object.entries(cover)) await bilder.put(id, 'cover', url);
  render(<StatistikAnsicht buecher={buecher} einstellungRepository={repo} bildspeicher={bilder} jetzt={() => heute} />);
  await waitFor(() => expect($(`[data-zeitraum-pille="${art}"]`)).toHaveAttribute('aria-pressed', 'true'), W);
}
const tage = () => $$('[data-kalender-tag]');
const tagEl = (iso: string) => $(`[data-kalender-tag="${iso}"]`)!;
const coverIn = (e: HTMLElement) => e.querySelector<HTMLImageElement>('img[data-kalender-cover]');

describe('REQ-088 Kalenderkarte Woche und Monat', () => {
  it('[REQ-088/AK-1] Woche 16 – 22 Nov 2026: „MO DI MI DO FR SA SO“ und 7 Kacheln 16 bis 22 in den Spalten Mo bis So', async () => {
    await zeige([]);
    expect($('[data-kalender="woche"]')).not.toBeNull();
    expect($$('[data-kalender-wochentag]').map((e) => norm(e.textContent))).toEqual(['MO', 'DI', 'MI', 'DO', 'FR', 'SA', 'SO']);
    expect(tage().map((e) => norm(e.textContent))).toEqual(['16', '17', '18', '19', '20', '21', '22']);
    expect(tage().map((e) => e.getAttribute('data-spalte'))).toEqual(['0', '1', '2', '3', '4', '5', '6']);
  });

  it('[REQ-088/AK-1] Lage: Kalenderkarte unter der Zeile „Serie / Tage gelesen“', async () => {
    await zeige([]);
    expect($('[data-lesetage-text]')!.compareDocumentPosition($('[data-kalender]')!) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it('[REQ-088/AK-2] November 2026 (1. ist Sonntag): 30 Kacheln, „1“ in Spalte „SO“, fortlaufend', async () => {
    await zeige([], 'monat');
    expect($('[data-kalender="monat"]')).not.toBeNull();
    expect(tage()).toHaveLength(30);
    expect(norm(tage()[0].textContent)).toBe('1');
    expect(tage()[0].getAttribute('data-spalte')).toBe('6');
    expect(tage().map((e) => Number(e.getAttribute('data-spalte')))).toEqual(Array.from({ length: 30 }, (_, i) => (6 + i) % 7));
    expect(norm(tage()[29].textContent)).toBe('30');
  });

  it.each([
    [um(2026, 12, 10), 31, '1'], // 1.12.2026 Dienstag
    [um(2026, 6, 10), 30, '0'], // 1.6.2026 Montag
    [um(2026, 2, 10), 28, '6'], // 1.2.2026 Sonntag
    [um(2028, 2, 10), 29, '1'], // 1.2.2028 Dienstag
  ])('[REQ-088/AK-2] Monat von %s: %i Kacheln, 1. in Spalte %s', async (heute, n, spalte) => {
    await zeige([], 'monat', heute);
    expect(tage()).toHaveLength(n);
    expect(tage()[0].getAttribute('data-spalte')).toBe(spalte);
  });

  it('[REQ-088/AK-3] Sitzung am 18.11.2026 für Buch mit Frontcover: Kachel 18 zeigt das Cover, übrige kein Cover', async () => {
    const a = buch({ sitzungen: [s(2026, 11, 18)] });
    await zeige([a], 'woche', HEUTE, { [a.id]: COVER_A });
    await waitFor(() => expect(coverIn(tagEl('2026-11-18'))).not.toBeNull(), W);
    expect(coverIn(tagEl('2026-11-18'))!.getAttribute('src')).toBe(COVER_A);
    for (const e of tage().filter((x) => x.getAttribute('data-kalender-tag') !== '2026-11-18')) {
      expect(e.querySelector('img, [data-kalender-cover-platzhalter]')).toBeNull();
      expect(norm(e.textContent)).toMatch(/^\d+$/);
    }
  });

  it('[REQ-088/AK-3] Lesetag ohne Buchcover: Cover-Platzhalter', async () => {
    const a = buch({ sitzungen: [s(2026, 11, 18)] });
    await zeige([a]);
    await new Promise((r) => setTimeout(r, 30));
    expect(tagEl('2026-11-18').querySelector('[data-kalender-cover-platzhalter]')).not.toBeNull();
    expect(coverIn(tagEl('2026-11-18'))).toBeNull();
  });

  it('[REQ-088/AK-3] „Beendet am“ ohne Sitzung zeigt kein Cover (auch im Monat)', async () => {
    const a = buch({ status: 'gelesen', beendetAm: '2026-11-18' });
    await zeige([a], 'monat', HEUTE, { [a.id]: COVER_A });
    await new Promise((r) => setTimeout(r, 30));
    expect(tagEl('2026-11-18').querySelector('img, [data-kalender-cover-platzhalter]')).toBeNull();
    expect(norm(tagEl('2026-11-18').textContent)).toBe('18');
  });

  it('[REQ-088/AK-4] am 18.11.2026 Sitzung Buch A 09:00 und Buch B 21:00: Kachel 18 zeigt Cover von B', async () => {
    const a = buch({ sitzungen: [s(2026, 11, 18, 9)] });
    const b = buch({ sitzungen: [s(2026, 11, 18, 21)] });
    await zeige([a, b], 'woche', HEUTE, { [a.id]: COVER_A, [b.id]: COVER_B });
    await waitFor(() => expect(coverIn(tagEl('2026-11-18'))?.getAttribute('src')).toBe(COVER_B), W);
  });

  it('[REQ-088/AK-4] Reihenfolge der Bücher egal; umgekehrte Uhrzeiten → Cover von A', async () => {
    const a = buch({ sitzungen: [s(2026, 11, 18, 21)] });
    const b = buch({ sitzungen: [s(2026, 11, 18, 9)] });
    await zeige([b, a], 'woche', HEUTE, { [a.id]: COVER_A, [b.id]: COVER_B });
    await waitFor(() => expect(coverIn(tagEl('2026-11-18'))?.getAttribute('src')).toBe(COVER_A), W);
  });

  it('[REQ-088/AK-4] maßgeblich ist die letzte Sitzung des Tages, nicht die erste: A 08:00 und 22:00, B 12:00 → A', async () => {
    const a = buch({ sitzungen: [s(2026, 11, 18, 8), s(2026, 11, 18, 22, 20)] });
    const b = buch({ sitzungen: [s(2026, 11, 18, 12)] });
    await zeige([a, b], 'woche', HEUTE, { [a.id]: COVER_A, [b.id]: COVER_B });
    await waitFor(() => expect(coverIn(tagEl('2026-11-18'))?.getAttribute('src')).toBe(COVER_A), W);
  });

  it('[REQ-088/AK-5] heute 22.11.2026: nur Kachel 22 umrandet; Antippen einer Kachel bewirkt nichts', async () => {
    const a = buch({ sitzungen: [s(2026, 11, 18)] });
    await zeige([a]);
    await new Promise((r) => setTimeout(r, 30));
    expect(tage().filter((e) => e.getAttribute('data-heute') === 'true').map((e) => e.getAttribute('data-kalender-tag'))).toEqual(['2026-11-22']);
    const heute = tagEl('2026-11-22');
    const andere = tagEl('2026-11-21');
    const umrandet = (e: HTMLElement) => {
      // jsdom berechnet Kurzschreibweisen mit var() nicht; deshalb Prüfung des gesetzten Stils (Rahmen oder Kontur, durchgezogen)
      return /(outline|border)(-[a-z]+)?:[^;]*solid/.test(e.getAttribute('style') ?? '');
    };
    expect(umrandet(heute)).toBe(true);
    expect(umrandet(andere)).toBe(false);
    const vorher = document.body.innerHTML;
    for (const e of [heute, tagEl('2026-11-18'), andere]) await tippe(e);
    expect(document.body.innerHTML).toBe(vorher);
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(screen.queryByRole('menu')).toBeNull();
  });

  it('[REQ-088/AK-5] Monat: heute umrandet; in der Vorwoche ist keine Kachel umrandet', async () => {
    await zeige([], 'monat');
    expect(tage().filter((e) => e.getAttribute('data-heute') === 'true').map((e) => norm(e.textContent))).toEqual(['22']);
    await tippe($('[data-zeitraum-pille="woche"]'));
    await tippe($('[data-zeitraum-zurueck]'));
    expect(tage().filter((e) => e.getAttribute('data-heute') === 'true')).toHaveLength(0);
  });

  it('[REQ-088/AK-6] kein Element „Mehrere Bücher: Ein Cover“; bei „Jährlich“ keine Kalenderkarte Woche/Monat', async () => {
    await zeige([buch({ sitzungen: [s(2026, 11, 18, 9)] }), buch({ sitzungen: [s(2026, 11, 18, 21)] })]);
    expect(document.body.textContent).not.toMatch(/Mehrere Bücher|Ein Cover/);
    expect(screen.queryByRole('combobox')).toBeNull();
    await tippe($('[data-zeitraum-pille="monat"]'));
    expect(document.body.textContent).not.toMatch(/Mehrere Bücher|Ein Cover/);
    await tippe($('[data-zeitraum-pille="jahr"]'));
    expect($('[data-kalender]')).toBeNull();
  });
});
