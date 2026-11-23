/**
 * Akzeptanztests REQ-085 – Buchfeld „Beendet am“: automatisch beim Status *gelesen*, überschreibbar im Reiter „Details“.
 * Abgeleitet aus dem REQ-Text. Schnittstellen laut Entwickler (Sprint 09): Buch.beendetAm („JJJJ-MM-TT“),
 * statusSetzen(buch, status, jetzt); Zeile [data-ausgabe-zeile="beendet"], Blattfeld [data-blatt-feld="beendet"],
 * Sichern [data-blatt-sichern="beendet"]; Statusmenü wie REQ-022 (Rolle „menu“, Name „Status wählen“).
 * Neustart = neue Modulinstanz auf derselben (Fake-)IndexedDB.
 */
import '@testing-library/jest-dom/vitest';
import { act, cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { IDBFactory, IDBKeyRange } from 'fake-indexeddb';
import type { ComponentType } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { statusSetzen, type Buch } from '@/domain/buch';
import type { BookRepository, ImageStore } from '@/storage';
import { InMemoryEinstellungRepository } from '@/storage';

vi.mock('@/buecher/demodaten', () => ({ demoBuecher: [] }));
beforeEach(() => {
  vi.stubGlobal('indexedDB', new IDBFactory());
  vi.stubGlobal('IDBKeyRange', IDBKeyRange);
});
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

type Welt = { repo: BookRepository; BD: ComponentType<Record<string, unknown>>; ST: ComponentType<Record<string, unknown>> };
const um = (j: number, m: number, t: number, h = 12, mi = 0) => new Date(j, m - 1, t, h, mi);
const HEUTE = um(2026, 11, 22, 15);
const jetzt = () => HEUTE;
const buch = (f: Partial<Buch> = {}): Buch => ({ id: crypto.randomUUID(), titel: 'Der Testroman', status: 'am_lesen', ...f });
const bilder = { get: async () => undefined, put: async () => {}, remove: async () => {} } as unknown as ImageStore;
const W = { timeout: 4000 };
const norm = (t: string | null | undefined) => (t ?? '').replace(/[\s  ]+/g, ' ').trim();
async function starte(): Promise<Welt> {
  vi.resetModules();
  const st = (await import('@/storage')) as typeof import('@/storage');
  const BD = (await import('@/views/BuchDetails')).default as unknown as ComponentType<Record<string, unknown>>;
  const ST = (await import('@/views/StatistikAnsicht')).default as unknown as ComponentType<Record<string, unknown>>;
  return { repo: st.createBookRepository(), BD, ST };
}
async function warte(ms = 40) {
  await act(async () => {
    await new Promise((r) => setTimeout(r, ms));
  });
}
async function tippe(el: Element | null) {
  expect(el).not.toBeNull();
  await act(async () => {
    fireEvent.click(el!);
    await new Promise((r) => setTimeout(r, 15));
  });
}
async function zeige(w: Welt, id: string, zeit: () => Date = jetzt) {
  const BD = w.BD;
  render(<BD buchId={id} jetzt={zeit} bildspeicher={bilder} bildquelle={{ scannen: async () => null, galerie: async () => null }} onZurueck={() => {}} />);
  return screen.findByRole('region', { name: 'Buchdetails' }, W);
}
async function zuDetails(d: HTMLElement) {
  const tab = await waitFor(() => {
    const t = d.querySelector<HTMLElement>('[data-reiter="details"]');
    expect(t).not.toBeNull();
    return t!;
  }, W);
  await tippe(tab);
  await waitFor(() => expect(d.querySelector('[data-reiter-bereich="details"]')).not.toBeNull(), W);
}
async function mitBuch(b: Buch, details = true, zeit: () => Date = jetzt) {
  const w = await starte();
  await w.repo.save(b);
  const d = await zeige(w, b.id, zeit);
  if (details) await zuDetails(d);
  return { w, d, id: b.id };
}
async function gespeichert(id: string) {
  cleanup();
  return (await starte()).repo.get(id);
}
const zeile = (d: HTMLElement, id = 'beendet') => d.querySelector<HTMLElement>(`[data-reiter-bereich="details"] [data-ausgabe-zeile="${id}"]`);
const wert = (d: HTMLElement, id = 'beendet') => norm(zeile(d, id)?.querySelector('[data-zeile-wert]')?.textContent);
const feld = () => document.querySelector<HTMLInputElement>('[data-blatt-feld="beendet"]');
const dialog = () => feld()?.closest<HTMLElement>('[role="dialog"]') ?? null;
async function oeffne(d: HTMLElement) {
  await tippe(zeile(d));
  await waitFor(() => expect(feld()).not.toBeNull(), W);
}
const gib = (t: string) => fireEvent.change(feld()!, { target: { value: t } });
async function sichern() {
  await tippe(document.querySelector('[data-blatt-sichern="beendet"]'));
  await warte(60);
}
async function statusWaehlen(d: HTMLElement, name: string) {
  await tippe(await waitFor(() => {
    const p = d.querySelector('[data-statuspille]');
    expect(p).not.toBeNull();
    return p;
  }, W));
  const m = await screen.findByRole('menu', { name: 'Status wählen' }, W);
  await tippe(within(m).getAllByRole('menuitem').find((e) => norm(e.textContent) === name)!);
  await warte(60);
}

describe('REQ-085 „Beendet am“', () => {
  it('[REQ-085/AK-1] *am lesen* ohne „Beendet am“, heute 22.11.2026, Status auf *gelesen* → „Beendet am“ 22.11.2026, auch nach Neustart', async () => {
    const { d, id } = await mitBuch(buch(), false);
    await statusWaehlen(d, 'gelesen');
    const b = await gespeichert(id);
    expect(b?.status).toBe('gelesen');
    expect(b?.beendetAm).toBe('2026-11-22');
    // nach Neustart in der Zeile sichtbar
    const w = await starte();
    const d2 = await zeige(w, id);
    await zuDetails(d2);
    await oeffne(d2);
    expect(feld()!.value).toBe('22.11.2026');
  });

  it.each([
    [um(2026, 11, 22, 0, 5), '2026-11-22'],
    [um(2026, 11, 22, 23, 55), '2026-11-22'],
    [um(2026, 12, 31, 23, 59), '2026-12-31'],
  ])('[REQ-085/AK-1] Tag nach lokaler Gerätezeit (%s → %s)', (zeit, erwartet) => {
    expect(statusSetzen(buch(), 'gelesen', zeit).beendetAm).toBe(erwartet);
  });

  it.each(['ungelesen', 'abgebrochen', 'wunschliste'] as const)('[REQ-085/AK-1] Wechsel von *%s* auf *gelesen* setzt ebenfalls heute', (von) => {
    expect(statusSetzen(buch({ status: von }), 'gelesen', HEUTE).beendetAm).toBe('2026-11-22');
  });

  it('[REQ-085/AK-1] erneuter Wechsel auf *gelesen* überschreibt ein früheres Datum; andere Wechsel lassen es stehen', () => {
    const b = buch({ status: 'gelesen', beendetAm: '2019-03-14' });
    const weg = statusSetzen(b, 'am_lesen', HEUTE);
    expect(weg.beendetAm).toBe('2019-03-14');
    expect(statusSetzen(weg, 'gelesen', HEUTE).beendetAm).toBe('2026-11-22');
    expect(statusSetzen(buch(), 'abgebrochen', HEUTE).beendetAm).toBeUndefined();
  });

  it('[REQ-085/AK-1] Zeile „Beendet am“ direkt unter „Hinzugefügt“; ohne Datum ohne Wert, Blatt leer', async () => {
    const { d } = await mitBuch(buch({ eingetragenAm: um(2026, 10, 14).toISOString() }));
    const zeilen = Array.from(d.querySelectorAll<HTMLElement>('[data-reiter-bereich="details"] [data-ausgabe-zeile]')).map((z) => z.getAttribute('data-ausgabe-zeile'));
    expect(zeilen.indexOf('beendet')).toBe(zeilen.indexOf('hinzugefuegt') + 1);
    expect(norm(zeile(d)!.querySelector('[data-zeile-bezeichnung]')?.textContent)).toBe('Beendet am');
    expect(wert(d)).toBe('');
    await oeffne(d);
    expect(feld()!.value).toBe('');
    expect(norm(document.querySelector('[data-blatt-sichern="beendet"]')!.textContent)).toBe('Sichern');
  });

  it('[REQ-085/AK-2] „Beendet am“ 22.11.2026, 14.03.2019 eintragen und sichern → gespeichert, Zeile im Format von „Hinzugefügt“, nach Neustart unverändert', async () => {
    const { d, id } = await mitBuch(buch({ status: 'gelesen', beendetAm: '2026-11-22', eingetragenAm: um(2019, 3, 14).toISOString() }));
    await oeffne(d);
    expect(feld()!.value).toBe('22.11.2026');
    gib('14.03.2019');
    await sichern();
    await waitFor(() => expect(feld()).toBeNull(), W);
    // gleiches Datum in „Hinzugefügt“ → gleicher Anzeigetext
    await waitFor(() => expect(wert(d)).toBe(wert(d, 'hinzugefuegt')), W);
    expect(wert(d)).not.toBe('');
    const b = await gespeichert(id);
    expect(b?.beendetAm).toBe('2019-03-14');
    const d2 = await zeige(await starte(), id);
    await zuDetails(d2);
    expect(wert(d2)).toBe(wert(d2, 'hinzugefuegt'));
    await oeffne(d2);
    expect(feld()!.value).toBe('14.03.2019');
  });

  it('[REQ-085/AK-2] Eingabe ohne Punkte (14032019) wird wie bei „Hinzugefügt“ zu 14.03.2019; heute ist gültig', async () => {
    const { d, id } = await mitBuch(buch({ status: 'gelesen', beendetAm: '2026-11-22' }));
    await oeffne(d);
    gib('14032019');
    expect(feld()!.value).toBe('14.03.2019');
    await sichern();
    expect((await gespeichert(id))?.beendetAm).toBe('2019-03-14');
    const x = await mitBuch(buch({ status: 'gelesen', beendetAm: '2020-01-01' }));
    await oeffne(x.d);
    gib('22.11.2026');
    await sichern();
    expect(feld()).toBeNull();
    expect((await gespeichert(x.id))?.beendetAm).toBe('2026-11-22');
  });

  it('[REQ-085/AK-2] Nachtragen bei Buch ohne Datum', async () => {
    const { d, id } = await mitBuch(buch({ status: 'gelesen' }));
    await oeffne(d);
    gib('01.02.2025');
    await sichern();
    expect((await gespeichert(id))?.beendetAm).toBe('2025-02-01');
  });

  it.each(['23.11.2026', '01.01.2027'])('[REQ-085/AK-3] Datum in der Zukunft (%s): Feld hervorgehoben, Blatt offen, nichts gespeichert', async (ein) => {
    const { d, id } = await mitBuch(buch({ status: 'gelesen', beendetAm: '2026-11-22' }));
    await oeffne(d);
    gib(ein);
    await sichern();
    expect(feld()).not.toBeNull();
    expect(feld()!.getAttribute('aria-invalid')).toBe('true');
    expect((await gespeichert(id))?.beendetAm).toBe('2026-11-22');
  });

  it.each(['31.02.2025', '29.02.2025', '15.13.2025', '1.2.2025'])('[REQ-085/AK-3] ungültige Eingabe „%s“: hervorgehoben, nichts gespeichert', async (ein) => {
    const { d, id } = await mitBuch(buch({ status: 'gelesen', beendetAm: '2026-11-22' }));
    await oeffne(d);
    gib(ein);
    await sichern();
    expect(feld()).not.toBeNull();
    expect(feld()!.getAttribute('aria-invalid')).toBe('true');
    expect((await gespeichert(id))?.beendetAm).toBe('2026-11-22');
  });

  it.each(['X', 'Außen'])('[REQ-085/AK-4] anderes Datum eingetragen, Schließen über %s ohne „Sichern“: unverändert', async (weg) => {
    const { d, id } = await mitBuch(buch({ status: 'gelesen', beendetAm: '2026-11-22' }));
    await oeffne(d);
    gib('14.03.2019');
    if (weg === 'X') await tippe(dialog()!.querySelector('[aria-label="Schließen"]'));
    else await tippe(document.querySelector('[data-blatt-hintergrund]'));
    await waitFor(() => expect(feld()).toBeNull(), W);
    await oeffne(d);
    expect(feld()!.value).toBe('22.11.2026');
    expect((await gespeichert(id))?.beendetAm).toBe('2026-11-22');
  });

  it('[REQ-085/AK-5] 300 Seiten, *gelesen*, „Beendet am“ in den Details auf 14.03.2019 überschrieben: Statistik 2019 zeigt „Bücher“ 1 und „Seiten“ 300', async () => {
    const { d, id } = await mitBuch(buch({ status: 'gelesen', seitenanzahl: 300, beendetAm: '2026-11-22' }));
    await oeffne(d);
    gib('14.03.2019');
    await sichern();
    cleanup();
    const w = await starte();
    expect((await w.repo.get(id))?.beendetAm).toBe('2019-03-14');
    const repoE = new InMemoryEinstellungRepository();
    await repoE.speichern('statistikZeitraum', 'jahr');
    const ST = w.ST;
    render(<ST repository={w.repo} einstellungRepository={repoE} bildspeicher={bilder} jetzt={jetzt} />);
    await waitFor(() => expect(document.querySelector('[data-zeitraum-pille="jahr"]')).toHaveAttribute('aria-pressed', 'true'), W);
    const wertVon = (k: string) => norm(document.querySelector(`[data-kachel="${k}"] [data-kachel-wert]`)!.textContent);
    // 2026 enthält das Buch nicht mehr
    await waitFor(() => expect(wertVon('buecher')).toBe('0'), W);
    for (let i = 0; i < 7; i++) await tippe(document.querySelector('[data-zeitraum-zurueck]'));
    expect(norm(document.querySelector('[data-zeitraum-zeile1]')!.textContent)).toBe('2019');
    await waitFor(() => expect(wertVon('buecher')).toBe('1'), W);
    expect(wertVon('seiten')).toBe('300');
  });
});
