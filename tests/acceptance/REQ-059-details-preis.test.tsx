/**
 * Akzeptanztests REQ-059 – Preis eintragen.
 * Schnittstellen laut Entwickler: Blatt [role=dialog][aria-label="Preis"] mit [data-preis-eingabe], [data-preis-sichern],
 * X [aria-label="Schließen"], Hintergrund [data-blatt-hintergrund].
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
/** „Neustart“: Module neu laden, neue Repository-Instanz. */
async function gespeichert(id: string) {
  cleanup();
  const w = await starte();
  return w.repo.get(id);
}
async function neustartAnzeige(id: string) {
  cleanup();
  const w = await starte();
  return zeige(w, id);
}
const norm = (t: string | null | undefined) => (t ?? '').replace(/[\s  ]+/g, ' ').trim();
const bereich = (d: HTMLElement) => d.querySelector<HTMLElement>('[data-reiter-bereich="details"]')!;
const zeile = (d: HTMLElement, id: string) => bereich(d).querySelector<HTMLElement>(`[data-ausgabe-zeile="${id}"]`)!;
const wert = (d: HTMLElement, id: string) => norm(zeile(d, id).querySelector('[data-zeile-wert]')?.textContent);

const blatt = () => document.querySelector<HTMLElement>('[role="dialog"][aria-label="Preis"]');
const feld = () => blatt()!.querySelector<HTMLInputElement>('[data-preis-eingabe]')!;
async function oeffne(d: HTMLElement) {
  await tippe(zeile(d, 'preis'));
  await vi.waitFor(() => expect(blatt()).not.toBeNull(), W);
}
async function gibEin(t: string) {
  await act(async () => {
    fireEvent.change(feld(), { target: { value: t } });
  });
}
async function sichern() {
  await tippe(blatt()!.querySelector('[data-preis-sichern]')!);
  await warte(60);
}

/** Android-Zurück-Taste (im Web/Test als popstate, siehe src/plattform/zurueckTaste.ts). */
async function zurueckTaste() {
  await warte(20);
  await act(async () => {
    window.dispatchEvent(new PopStateEvent('popstate', { state: null }));
    await new Promise((r) => setTimeout(r, 20));
  });
}

describe('REQ-059 Preis', () => {
  it('[REQ-059/AK-1] ohne Preis: Menü „Preis“ mit „0,00 €“, Ziehgriff, X, „Sichern“', async () => {
    const { d } = await mitBuch();
    await oeffne(d);
    expect(norm(feld().value)).toBe('0,00 €');
    expect(blatt()!.textContent).toContain('Preis');
    expect(blatt()!.querySelector('[aria-label="Schließen"]')).not.toBeNull();
    expect(norm(blatt()!.querySelector('[data-preis-sichern]')!.textContent)).toBe('Sichern');
    expect(document.querySelector('[data-blatt-hintergrund]')).not.toBeNull();
  });

  it.each([
    ['12,99', '12,99 €', 1299],
    ['5', '5,00 €', 500],
    ['0,5', '0,50 €', 50],
  ])('[REQ-059/AK-2] „%s“ sichern → Zeile „%s“, auch nach Neustart', async (ein, anzeige, cent) => {
    const { d, id } = await mitBuch();
    await oeffne(d);
    await gibEin(ein);
    await sichern();
    await vi.waitFor(() => expect(blatt()).toBeNull(), W);
    await vi.waitFor(() => expect(wert(d, 'preis')).toBe(anzeige), W);
    expect((await gespeichert(id))?.preisCent).toBe(cent);
    const d2 = await neustartAnzeige(id);
    expect(wert(d2, 'preis')).toBe(anzeige);
  });

  it.each(['abc', '12,999', '-3'])('[REQ-059/AK-2] Negativfall: „%s“ wird nicht gesichert', async (ein) => {
    const { d, id } = await mitBuch();
    await oeffne(d);
    await gibEin(ein);
    await sichern();
    expect(blatt()).not.toBeNull();
    expect((await gespeichert(id))?.preisCent).toBeUndefined();
  });

  it('[REQ-059/AK-3] gespeicherter Preis 12,99 € steht im Feld', async () => {
    const { d } = await mitBuch(buch({ preisCent: 1299 }));
    await oeffne(d);
    expect(norm(feld().value)).toBe('12,99 €');
  });

  // Sprint 06 Teil C: dritter Durchlauf Android-Zurück-Taste (REQ-059 AK-4, Fassung 2026-11-18); Web: popstate.
  it.each(['X', 'Außen', 'Zurück-Taste'])('[REQ-059/AK-4] 20,00 eingeben, schließen über %s: Menü zu, bleibt 12,99 €', async (weg) => {
    const { d, id } = await mitBuch(buch({ preisCent: 1299 }));
    await oeffne(d);
    await gibEin('20,00');
    if (weg === 'X') await tippe(blatt()!.querySelector('[aria-label="Schließen"]')!);
    else if (weg === 'Außen') await tippe(document.querySelector('[data-blatt-hintergrund]')!);
    else await zurueckTaste();
    await vi.waitFor(() => expect(blatt()).toBeNull(), W);
    expect(wert(d, 'preis')).toBe('12,99 €');
    expect((await gespeichert(id))?.preisCent).toBe(1299);
  });

  it('[REQ-059/AK-4] Zurück-Taste schließt nur das Menü, die Buchdetails bleiben offen', async () => {
    const { d } = await mitBuch(buch({ preisCent: 1299 }));
    await oeffne(d);
    await zurueckTaste();
    await vi.waitFor(() => expect(blatt()).toBeNull(), W);
    expect(screen.getByRole('region', { name: 'Buchdetails' })).toBeInTheDocument();
    expect(wert(d, 'preis')).toBe('12,99 €');
  });
});
