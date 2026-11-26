/**
 * Akzeptanztests REQ-056 – Details: Karte „Ausgabe“.
 * Schnittstellen laut Entwickler: [data-ausgabe-karte], [data-ausgabe-zeile=id] mit [data-zeile-bezeichnung],
 * [data-zeile-wert], [data-zeile-pfeil]. Testdaten: format, unterformat, sonderausgabe, exemplar, preisCent.
 * Nicht festgeschrieben (nicht im REQ): Abkürzungen anderer Monate als „Okt.“.
 */
import '@testing-library/jest-dom/vitest';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { IDBFactory, IDBKeyRange } from 'fake-indexeddb';
import type { ComponentType } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { Buch } from '@/domain/buch';
import type { BookRepository, ImageStore } from '@/storage';

vi.mock('@/buecher/demodaten', () => ({ demoBuecher: [] }));
beforeEach(() => {
  vi.stubGlobal('indexedDB', new IDBFactory());
  vi.stubGlobal('IDBKeyRange', IDBKeyRange);
});
afterEach(() => cleanup());

type Welt = { repo: BookRepository; BD: ComponentType<Record<string, unknown>> };
const buch = (f: Partial<Buch> = {}): Buch => ({ id: crypto.randomUUID(), titel: 'Der Testroman', status: 'ungelesen', ...f });
const bilder = { get: async () => undefined, put: async () => {}, remove: async () => {} } as unknown as ImageStore;
const W = { timeout: 3000 };
async function starte(): Promise<Welt> {
  vi.resetModules();
  const st = (await import('@/storage')) as typeof import('@/storage');
  const BD = (await import('@/views/BuchDetails')).default as unknown as ComponentType<Record<string, unknown>>;
  return { repo: st.createBookRepository(), BD };
}
async function warte(ms = 40) {
  await act(async () => {
    await new Promise((r) => setTimeout(r, ms));
  });
}
async function tippe(el: Element) {
  await act(async () => {
    fireEvent.click(el);
    await new Promise((r) => setTimeout(r, 10));
  });
}
/** Buchdetails anzeigen und Reiter „Details“ antippen. */
async function zeige(w: Welt, id: string, jetzt?: () => Date) {
  const BD = w.BD;
  const extra = jetzt ? { jetzt } : {};
  render(<BD buchId={id} {...extra} bildspeicher={bilder} bildquelle={{ scannen: async () => null, galerie: async () => null }} onZurueck={() => {}} />);
  const d = await screen.findByRole('region', { name: 'Buchdetails' });
  const tab = await vi.waitFor(() => {
    const t = d.querySelector<HTMLElement>('[data-reiter="details"]');
    expect(t).not.toBeNull();
    return t!;
  }, W);
  await tippe(tab);
  await vi.waitFor(() => expect(d.querySelector('[data-reiter-bereich="details"]')).not.toBeNull(), W);
  return d;
}
async function mitBuch(b: Buch = buch()) {
  const w = await starte();
  await w.repo.save(b);
  return { w, d: await zeige(w, b.id), id: b.id };
}
const norm = (t: string | null | undefined) => (t ?? '').replace(/[\s  ]+/g, ' ').trim();
const bereich = (d: HTMLElement) => d.querySelector<HTMLElement>('[data-reiter-bereich="details"]')!;
const abschnitt = (d: HTMLElement, id: string) => bereich(d).querySelector<HTMLElement>(`[data-details-abschnitt="${id}"]`)!;
const zeile = (d: HTMLElement, id: string) => bereich(d).querySelector<HTMLElement>(`[data-ausgabe-zeile="${id}"]`)!;
const wert = (d: HTMLElement, id: string) => norm(zeile(d, id).querySelector('[data-zeile-wert]')?.textContent);
const dialoge = () => document.querySelectorAll('[role="dialog"], [data-fenster-format], [data-blatt-unten]').length;
/** Zustand für „nichts ändert sich“: DOM des Details-Bereichs, offene Fenster, gespeichertes Buch. */
async function zustand(w: Welt, d: HTMLElement, id: string) {
  return { html: bereich(d).innerHTML, dialoge: dialoge(), buch: JSON.stringify(await w.repo.get(id)) };
}
import { neuesBuch } from '@/domain/buch';

// REQ-072/AK-1: Zeile „Maße“ direkt unter „Format“ (Anpassung Sprint 07); REQ-085: „Beendet am“ unter „Hinzugefügt“ (Sprint 09);
// REQ-112: Zeile „Band“ direkt unter „Exemplar“ (Sprint 11)
/** Kennung einer Zeile; die Zeile „Band“ (REQ-112) wird an ihrer Bezeichnung erkannt (Kennung legt der Entwickler fest). */
const zid = (z: Element) => (/^Band\b/.test(norm(z.querySelector('[data-zeile-bezeichnung]')?.textContent ?? z.textContent)) ? 'band' : z.getAttribute('data-ausgabe-zeile'));
const ZEILEN = ['seiten', 'format', 'masse', 'exemplar', 'band', 'sonderausgabe', 'fotos', 'preis', 'verlag', 'erschienen', 'isbn', 'hinzugefuegt', 'beendet'];
const NAMEN = ['Seiten', 'Format', 'Maße', 'Exemplar', 'Band', 'Sonderausgabe', 'Fotos', 'Preis', 'Verlag', 'Erschienen', 'ISBN', 'Hinzugefügt', 'Beendet am'];
const karte = (d: HTMLElement) => abschnitt(d, 'ausgabe').querySelector<HTMLElement>('[data-ausgabe-karte]')!;
const zeilen = (d: HTMLElement) => Array.from(karte(d).querySelectorAll<HTMLElement>('[data-ausgabe-zeile]'));

describe('REQ-056 Karte „Ausgabe“', () => {
  it('[REQ-056/AK-1] dreizehn Zeilen (mit „Maße“ laut REQ-072, „Band“ laut REQ-112 und „Beendet am“ laut REQ-085) in fester Reihenfolge, links Bezeichnung, kein „Signiert“', async () => {
    const { d } = await mitBuch();
    expect(zeilen(d).map(zid)).toEqual(ZEILEN);
    expect(zeilen(d).map((z) => norm(z.querySelector('[data-zeile-bezeichnung]')?.textContent))).toEqual(NAMEN);
    for (const z of zeilen(d)) {
      const b = z.querySelector('[data-zeile-bezeichnung]')!;
      const w = z.querySelector('[data-zeile-wert]')!;
      expect(b.compareDocumentPosition(w) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    }
    expect(bereich(d).textContent).not.toMatch(/Signiert/i);
  });

  // Fassung 2026-11-23 (REQ-091): alle Zeilen haben den Pfeil „›“, auch Verlag, Erschienen, ISBN, Hinzugefügt und Beendet am.
  it.each([
    ['mit Werten', { bandnummer: 2, seitenanzahl: 608, erscheinungsjahr: 2025, eingetragenAm: '2026-10-14T12:00:00', status: 'gelesen', beendetAm: '2026-11-03', verlag: 'Carlsen', isbn: '9783551551672' }],
    ['ohne Werte', {}],
  ] as const)('[REQ-056/AK-2] alle dreizehn Zeilen haben genau einen Pfeil „›“ (%s)', async (_n, felder) => {
    const { d } = await mitBuch(buch(felder as Partial<Buch>));
    expect(zeilen(d)).toHaveLength(13);
    for (const z of zeilen(d)) {
      const id = zid(z);
      const p = z.querySelectorAll('[data-zeile-pfeil]');
      expect(p, `${id}: Pfeil`).toHaveLength(1);
      expect(norm(p[0].textContent), id!).toBe('›');
    }
  });

  // Fassung 2026-11-23 (REQ-092): Erschienen zeigt das Datum im Format von „Hinzugefügt“, ohne Datum das Jahr.
  it('[REQ-056/AK-3] Seiten 608 und Erschienen 2025 (Jahr ohne Datum)', async () => {
    const { d } = await mitBuch(buch({ seitenanzahl: 608, erscheinungsjahr: 2025 }));
    expect(wert(d, 'seiten')).toBe('608');
    expect(wert(d, 'erschienen')).toBe('2025');
  });

  it.each([
    [{ erscheinungsdatum: '01.02.2025' }, 'Feb. 2025'],
    [{ erscheinungsdatum: '01.02.2025', erscheinungsjahr: 2019 }, 'Feb. 2025'],
    [{ erscheinungsdatum: '14.10.2026' }, 'Okt. 2026'],
  ] as const)('[REQ-056/AK-3] mit Erscheinungsdatum %j zeigt „Erschienen“ „%s“', async (felder, text) => {
    const { d } = await mitBuch(buch(felder as Partial<Buch>));
    expect(wert(d, 'erschienen')).toBe(text);
  });

  it('[REQ-056/AK-4] Print · Taschenbuch, Meins, Keins', async () => {
    const { d } = await mitBuch(buch({ format: 'print', unterformat: 'taschenbuch', exemplar: 'meins' }));
    expect(wert(d, 'format')).toBe('Print · Taschenbuch');
    expect(wert(d, 'exemplar')).toBe('Meins');
    expect(wert(d, 'sonderausgabe')).toBe('Keins');
  });

  it.each([
    [{ format: 'print', unterformat: 'hardcover', exemplar: 'geliehen', sonderausgabe: 'farbschnitt' }, 'Print · Hardcover', 'Geliehen', 'Farbschnitt'],
    [{ format: 'ebook', exemplar: 'ichWillEs' }, 'E-Book', 'Ich will es', 'Keins'],
    [{ format: 'hoerbuch', exemplar: 'verkauft' }, 'Hörbuch', 'Verkauft', 'Keins'],
    [{ format: 'print', exemplar: 'verliehen', sonderausgabe: 'sammlerausgabe' }, 'Print', 'Verliehen', 'Sammlerausgabe'],
  ] as const)('[REQ-056/AK-4] Varianten %j', async (felder, f, e, s) => {
    const { d } = await mitBuch(buch(felder as Partial<Buch>));
    expect(wert(d, 'format')).toBe(f);
    expect(wert(d, 'exemplar')).toBe(e);
    expect(wert(d, 'sonderausgabe')).toBe(s);
  });

  it('[REQ-056/AK-5] neues Buch nur mit Titel: leere Werte (auch „Band“), „Keins“, Preis-Hinweis, „Cover“', async () => {
    const { d } = await mitBuch(neuesBuch({ titel: 'Nur Titel', status: 'ungelesen' }));
    for (const id of ['seiten', 'format', 'exemplar', 'erschienen', 'verlag', 'isbn']) expect(wert(d, id)).toBe('');
    const band = zeilen(d).find((z) => zid(z) === 'band')!;
    expect(norm(band.querySelector('[data-zeile-wert]')?.textContent)).toBe('');
    expect(wert(d, 'sonderausgabe')).toBe('Keins');
    expect(wert(d, 'preis')).toBe('Trag ein, was du bezahlt hast');
    expect(wert(d, 'fotos')).toBe('Cover');
  });

  it('[REQ-056/AK-5] Grenzfall: gespeicherter Preis wird als „12,99 €“ angezeigt', async () => {
    const { d } = await mitBuch(buch({ preisCent: 1299 }));
    expect(wert(d, 'preis')).toBe('12,99 €');
  });

  // Wertebeschreibung (geändert 2026-11-23, REQ-063 maßgebend): Verlag und ISBN zeigen den gespeicherten Wert
  it('[REQ-056/AK-5] Verlag und ISBN zeigen den gespeicherten Wert', async () => {
    const { d } = await mitBuch(buch({ verlag: 'Carlsen', isbn: '9783551551672' }));
    expect(wert(d, 'verlag')).toBe('Carlsen');
    expect(wert(d, 'isbn')).toBe('9783551551672');
  });

  it('[REQ-056/AK-6] Hinzugefügt 14.10.2026 → „Okt. 2026“', async () => {
    const { d } = await mitBuch(buch({ eingetragenAm: '2026-10-14T12:00:00' }));
    expect(wert(d, 'hinzugefuegt')).toBe('Okt. 2026');
  });

  // Fassung 2026-11-23: AK-7 gilt nur noch für „Fotos“. Verlag, ISBN (REQ-063), Hinzugefügt (REQ-064) und Erschienen (REQ-092)
  // öffnen ein Blatt; Schließen ohne Sichern ändert nichts.
  it.each(['fotos'])('[REQ-056/AK-7] „%s“ antippen: kein Menü/Fenster, nichts ändert sich', async (id) => {
    const b = buch({ seitenanzahl: 608, erscheinungsjahr: 2025, eingetragenAm: '2026-10-14T12:00:00' });
    const { w, d } = await mitBuch(b);
    const vorher = await zustand(w, d, b.id);
    await tippe(zeile(d, id));
    await warte(60);
    expect(await zustand(w, d, b.id)).toEqual(vorher);
  });

  it.each(['verlag', 'isbn', 'hinzugefuegt', 'erschienen'])('[REQ-056/AK-7] (geändert durch REQ-063/064/092) „%s“ öffnet ein Blatt; Schließen über X ändert nichts', async (id) => {
    const b = buch({ seitenanzahl: 608, erscheinungsjahr: 2025, eingetragenAm: '2026-10-14T12:00:00' });
    const { w, d } = await mitBuch(b);
    const vorher = await zustand(w, d, b.id);
    await tippe(zeile(d, id));
    const feld = await vi.waitFor(() => {
      const f = document.querySelector<HTMLElement>(`[data-blatt-feld="${id}"]`);
      expect(f).not.toBeNull();
      return f!;
    });
    await tippe(feld.closest('[role="dialog"]')!.querySelector<HTMLElement>('[aria-label="Schließen"]')!);
    await warte(60);
    expect(await zustand(w, d, b.id)).toEqual(vorher);
  });
});
