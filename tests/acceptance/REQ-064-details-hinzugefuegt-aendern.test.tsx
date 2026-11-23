/**
 * Akzeptanztests REQ-064 – Reiter „Details“: Datum „Hinzugefügt“ über ein Blatt ändern.
 * Schnittstellen laut Entwickler: Zeile [data-ausgabe-zeile="hinzugefuegt"], Blattfeld [data-blatt-feld="hinzugefuegt"],
 * Sichern [data-blatt-sichern="hinzugefuegt"], Fehler data-fehler/aria-invalid; Datumsfelder setzen die Punkte selbst.
 * BuchDetails { jetzt } liefert „heute“.
 */
import '@testing-library/jest-dom/vitest';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { IDBFactory, IDBKeyRange } from 'fake-indexeddb';
import type { ComponentType, CSSProperties } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { Buch } from '@/domain/buch';
import type { BookRepository, ImageStore } from '@/storage';
import { farbrubriken, farbVariablen } from '@/theme';

vi.mock('@/buecher/demodaten', () => ({ demoBuecher: [] }));
beforeEach(() => {
  vi.stubGlobal('indexedDB', new IDBFactory());
  vi.stubGlobal('IDBKeyRange', IDBKeyRange);
});
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

type Welt = { repo: BookRepository; BD: ComponentType<Record<string, unknown>> };
const HEUTE = new Date(2026, 10, 17, 15, 0, 0); // 17.11.2026, lokale Zeit
const jetzt = () => HEUTE;
const EINGETRAGEN = new Date(2026, 10, 10, 9, 15, 0).toISOString(); // 10.11.2026
const buch = (f: Partial<Buch> = {}): Buch => ({ id: crypto.randomUUID(), titel: 'Der Testroman', status: 'ungelesen', eingetragenAm: EINGETRAGEN, ...f });
const bilder = { get: async () => undefined, put: async () => {}, remove: async () => {} } as unknown as ImageStore;
const W = { timeout: 4000 };
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
    await new Promise((r) => setTimeout(r, 15));
  });
}
async function zeige(w: Welt, id: string) {
  const BD = w.BD;
  render(
    <div data-testwurzel="" style={farbVariablen() as CSSProperties}>
      <BD buchId={id} jetzt={jetzt} bildspeicher={bilder} bildquelle={{ scannen: async () => null, galerie: async () => null }} onZurueck={() => {}} />
    </div>,
  );
  const d = await screen.findByRole('region', { name: 'Buchdetails' }, W);
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
async function gespeichert(id: string) {
  cleanup();
  return (await starte()).repo.get(id);
}
const norm = (t: string | null | undefined) => (t ?? '').replace(/[\s  ]+/g, ' ').trim();
const zeile = (d: HTMLElement) => d.querySelector<HTMLElement>('[data-reiter-bereich="details"] [data-ausgabe-zeile="hinzugefuegt"]')!;
const wert = (d: HTMLElement) => norm(zeile(d).querySelector('[data-zeile-wert]')?.textContent);
const feld = () => document.querySelector<HTMLInputElement>('[data-blatt-feld="hinzugefuegt"]');
const dialog = () => feld()?.closest<HTMLElement>('[role="dialog"]') ?? null;
async function oeffne(d: HTMLElement) {
  await tippe(zeile(d));
  await vi.waitFor(() => expect(feld()).not.toBeNull(), W);
}
const gib = (t: string) => fireEvent.change(feld()!, { target: { value: t } });
async function sichern() {
  await tippe(document.querySelector('[data-blatt-sichern="hinzugefuegt"]')!);
  await warte(60);
}
const tag = (iso: string | undefined) => {
  const x = new Date(iso!);
  return `${String(x.getDate()).padStart(2, '0')}.${String(x.getMonth() + 1).padStart(2, '0')}.${x.getFullYear()}`;
};
const markiert = () => feld()!.getAttribute('data-fehler') === 'true' && feld()!.getAttribute('aria-invalid') === 'true';
function inPrimaer(el: HTMLElement) {
  const ctx = document.querySelector<HTMLElement>('[data-testwurzel]')!;
  const p = document.createElement('span');
  p.style.setProperty('color', farbrubriken.primaer.wert);
  ctx.appendChild(p);
  const primaer = getComputedStyle(p).color;
  p.remove();
  const cs = getComputedStyle(el);
  return [cs.color, cs.borderTopColor, cs.outlineColor, cs.boxShadow].some((w) => w.includes(primaer));
}

describe('REQ-064 „Hinzugefügt“ ändern', () => {
  it('[REQ-064/AK-1] Buch mit Eintragungsdatum 10.11.2026: Blatt offen, Feld zeigt 10.11.2026, Pille „Sichern“', async () => {
    const { d } = await mitBuch();
    await oeffne(d);
    expect(feld()!.value).toBe('10.11.2026');
    expect(norm(document.querySelector('[data-blatt-sichern="hinzugefuegt"]')!.textContent)).toBe('Sichern');
    expect(dialog()).not.toBeNull();
  });

  it.each([
    ['01.02.2025', '01.02.2025'],
    ['01022025', '01.02.2025'],
  ])('[REQ-064/AK-2] Eingabe „%s“ sichern → Eintragungsdatum %s, Zeile zeigt das Datum, auch nach Neustart', async (ein, datum) => {
    const { d, id } = await mitBuch();
    await oeffne(d);
    gib(ein);
    expect(feld()!.value).toBe(datum);
    await sichern();
    await vi.waitFor(() => expect(feld()).toBeNull(), W);
    // Fassung 2026-11-18 (Sprint 06 Teil C): Zeile zeigt Monat und Jahr nach REQ-056 („Feb. 2025“), das Blatt TT.MM.JJJJ.
    await vi.waitFor(() => expect(wert(d)).toBe('Feb. 2025'), W);
    const b = await gespeichert(id);
    expect(tag(b?.eingetragenAm)).toBe(datum);
    const d2 = await zeige(await starte(), id);
    expect(wert(d2)).toBe('Feb. 2025');
    await oeffne(d2);
    expect(feld()!.value).toBe('01.02.2025');
  });

  it('[REQ-064/AK-2] Grenzfall: der heutige Tag ist gültig', async () => {
    const { id } = await mitBuch().then(async (x) => {
      await oeffne(x.d);
      gib('17.11.2026');
      await sichern();
      expect(feld()).toBeNull();
      return x;
    });
    expect(tag((await gespeichert(id))?.eingetragenAm)).toBe('17.11.2026');
  });

  it.each(['18.11.2026', '01.01.2027'])('[REQ-064/AK-3] Datum in der Zukunft (%s): Feld in Primär markiert, kein Hinweistext, Blatt offen, unverändert', async (ein) => {
    const { d, id } = await mitBuch();
    await oeffne(d);
    gib(ein);
    const textVorher = norm(dialog()!.textContent);
    await sichern();
    expect(feld()).not.toBeNull();
    expect(markiert()).toBe(true);
    expect(inPrimaer(feld()!)).toBe(true);
    expect(norm(dialog()!.textContent)).toBe(textVorher);
    expect(screen.queryByRole('alert')).toBeNull();
    expect((await gespeichert(id))?.eingetragenAm).toBe(EINGETRAGEN);
  });

  // '' entfernt (2026-11-23): ein leeres Feld entfernt laut Anforderungstext das Eintragungsdatum (REQ-093).
  it.each(['31.02.2025', '29.02.2025', '00.01.2025', '15.13.2025', '1.2.2025'])('[REQ-064/AK-4] ungültiges Datum „%s“: markiert, nichts gespeichert', async (ein) => {
    const { d, id } = await mitBuch();
    await oeffne(d);
    gib(ein);
    await sichern();
    expect(feld()).not.toBeNull();
    expect(markiert()).toBe(true);
    expect((await gespeichert(id))?.eingetragenAm).toBe(EINGETRAGEN);
  });

  it('[REQ-064/AK-4] Markierung endet bei Änderung im Feld (wie „JAHR“)', async () => {
    const { d } = await mitBuch();
    await oeffne(d);
    gib('31.02.2025');
    await sichern();
    expect(markiert()).toBe(true);
    gib('31.01.2025');
    expect(feld()!.getAttribute('data-fehler')).not.toBe('true');
  });

  it.each(['X', 'Außen'])('[REQ-064/AK-5] anderes Datum eingetragen, Schließen über %s: Eintragungsdatum unverändert', async (weg) => {
    const { d, id } = await mitBuch();
    await oeffne(d);
    gib('01.02.2025');
    if (weg === 'X') await tippe(dialog()!.querySelector('[aria-label="Schließen"]')!);
    else await tippe(document.querySelector('[data-blatt-hintergrund]')!);
    await vi.waitFor(() => expect(feld()).toBeNull(), W);
    expect(wert(d)).toBe('Nov. 2026');
    expect((await gespeichert(id))?.eingetragenAm).toBe(EINGETRAGEN);
  });
});
