/**
 * Akzeptanztests REQ-063 – Reiter „Details“: Verlag und ISBN über ein Blatt eingeben.
 * Schnittstellen laut Entwickler: Zeilen [data-ausgabe-zeile=verlag|isbn|fotos], Blattfeld [data-blatt-feld=verlag|isbn],
 * Sichern [data-blatt-sichern=…], Fehler data-fehler="true"/aria-invalid, X [aria-label="Schließen"], Außen [data-blatt-hintergrund].
 * „Neustart“: Module neu laden, neue Repository-Instanz auf derselben IndexedDB.
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
const buch = (f: Partial<Buch> = {}): Buch => ({ id: crypto.randomUUID(), titel: 'Der Testroman', status: 'ungelesen', ...f });
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
      <BD buchId={id} bildspeicher={bilder} bildquelle={{ scannen: async () => null, galerie: async () => null }} onZurueck={() => {}} />
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
async function neustartAnzeige(id: string) {
  cleanup();
  return zeige(await starte(), id);
}
const norm = (t: string | null | undefined) => (t ?? '').replace(/[\s  ]+/g, ' ').trim();
const bereich = (d: HTMLElement) => d.querySelector<HTMLElement>('[data-reiter-bereich="details"]')!;
const zeile = (d: HTMLElement, id: string) => bereich(d).querySelector<HTMLElement>(`[data-ausgabe-zeile="${id}"]`)!;
const wert = (d: HTMLElement, id: string) => norm(zeile(d, id).querySelector('[data-zeile-wert]')?.textContent);
const feld = (id: string) => document.querySelector<HTMLInputElement>(`[data-blatt-feld="${id}"]`);
const dialog = (id: string) => feld(id)?.closest<HTMLElement>('[role="dialog"]') ?? null;
async function oeffne(d: HTMLElement, id: string) {
  await tippe(zeile(d, id));
  await vi.waitFor(() => expect(feld(id)).not.toBeNull(), W);
}
const gib = (id: string, t: string) => fireEvent.change(feld(id)!, { target: { value: t } });
async function sichern(id: string) {
  await tippe(document.querySelector(`[data-blatt-sichern="${id}"]`)!);
  await warte(60);
}
const markiert = (id: string) => feld(id)!.getAttribute('data-fehler') === 'true' && feld(id)!.getAttribute('aria-invalid') === 'true';
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

describe('REQ-063 Verlag und ISBN', () => {
  it('[REQ-063/AK-1] Buch ohne Verlag: „Carlsen“ eintragen und sichern → Zeile zeigt „Carlsen“, auch nach Neustart', async () => {
    const { d, id } = await mitBuch();
    expect(wert(d, 'verlag')).toBe('');
    await oeffne(d, 'verlag');
    expect(feld('verlag')!.value).toBe('');
    expect(norm(dialog('verlag')!.querySelector('[data-blatt-sichern="verlag"]')!.textContent)).toBe('Sichern');
    gib('verlag', 'Carlsen');
    await sichern('verlag');
    await vi.waitFor(() => expect(feld('verlag')).toBeNull(), W);
    await vi.waitFor(() => expect(wert(d, 'verlag')).toBe('Carlsen'), W);
    expect((await gespeichert(id))?.verlag).toBe('Carlsen');
    const d2 = await neustartAnzeige(id);
    expect(wert(d2, 'verlag')).toBe('Carlsen');
  });

  it('[REQ-063/AK-1] vorhandener Verlag steht im Feld und lässt sich ändern', async () => {
    const { d, id } = await mitBuch(buch({ verlag: 'Alt-Verlag' }));
    await oeffne(d, 'verlag');
    expect(feld('verlag')!.value).toBe('Alt-Verlag');
    gib('verlag', 'Neu-Verlag');
    await sichern('verlag');
    await vi.waitFor(() => expect(wert(d, 'verlag')).toBe('Neu-Verlag'), W);
    expect((await gespeichert(id))?.verlag).toBe('Neu-Verlag');
  });

  it.each(['9783551551672', '3551551677'])('[REQ-063/AK-2] gültige ISBN %s sichern → Zeile zeigt sie, auch nach Neustart', async (isbn) => {
    const { d, id } = await mitBuch();
    await oeffne(d, 'isbn');
    gib('isbn', isbn);
    await sichern('isbn');
    await vi.waitFor(() => expect(feld('isbn')).toBeNull(), W);
    await vi.waitFor(() => expect(wert(d, 'isbn')).toBe(isbn), W);
    expect((await gespeichert(id))?.isbn).toBe(isbn);
    const d2 = await neustartAnzeige(id);
    expect(wert(d2, 'isbn')).toBe(isbn);
  });

  it('[REQ-063/AK-2] vorhandene ISBN steht im Feld', async () => {
    const { d } = await mitBuch(buch({ isbn: '9783551551672' }));
    await oeffne(d, 'isbn');
    expect(feld('isbn')!.value).toBe('9783551551672');
  });

  it.each([
    ['978-3a', '9783'],
    ['abc', ''],
    ['978 3551 55167 2', '9783551551672'],
  ])('[REQ-063/AK-3] Eingabe „%s“ → Feld enthält „%s“', async (ein, aus) => {
    const { d } = await mitBuch();
    await oeffne(d, 'isbn');
    gib('isbn', ein);
    expect(feld('isbn')!.value).toBe(aus);
  });

  it.each(['9783551551670', '12345', '978355155167', ''])('[REQ-063/AK-4] ungültige ISBN „%s“: Feld in Primär markiert, kein Hinweistext, Blatt offen, nichts gespeichert', async (ein) => {
    const { d, id } = await mitBuch();
    await oeffne(d, 'isbn');
    gib('isbn', ein);
    const textVorher = norm(dialog('isbn')!.textContent);
    expect(markiert('isbn')).toBe(false);
    await sichern('isbn');
    expect(feld('isbn')).not.toBeNull();
    expect(markiert('isbn')).toBe(true);
    expect(inPrimaer(feld('isbn')!)).toBe(true);
    expect(norm(dialog('isbn')!.textContent)).toBe(textVorher);
    expect(screen.queryByRole('alert')).toBeNull();
    expect(wert(d, 'isbn')).toBe('');
    expect((await gespeichert(id))?.isbn).toBeUndefined();
  });

  it('[REQ-063/AK-4] ungültige ISBN bei vorhandener ISBN: die vorhandene bleibt', async () => {
    const { d, id } = await mitBuch(buch({ isbn: '9783551551672' }));
    await oeffne(d, 'isbn');
    gib('isbn', '9783551551670');
    await sichern('isbn');
    expect(markiert('isbn')).toBe(true);
    expect((await gespeichert(id))?.isbn).toBe('9783551551672');
  });

  it('[REQ-063/AK-5] markiertes Feld: Änderung hebt die Markierung auf; danach gültig sichern klappt', async () => {
    const { d, id } = await mitBuch();
    await oeffne(d, 'isbn');
    gib('isbn', '12345');
    await sichern('isbn');
    expect(markiert('isbn')).toBe(true);
    gib('isbn', '123456');
    expect(feld('isbn')!.getAttribute('data-fehler')).not.toBe('true');
    expect(feld('isbn')!.getAttribute('aria-invalid')).not.toBe('true');
    expect(inPrimaer(feld('isbn')!)).toBe(false);
    gib('isbn', '9783551551672');
    await sichern('isbn');
    await vi.waitFor(() => expect(wert(d, 'isbn')).toBe('9783551551672'), W);
    expect((await gespeichert(id))?.isbn).toBe('9783551551672');
  });

  it.each(['X', 'Außen'])('[REQ-063/AK-6] „Carlsen“ eingetragen, Schließen über %s: vorheriger Verlag bleibt', async (weg) => {
    const { d, id } = await mitBuch(buch({ verlag: 'Alt-Verlag' }));
    await oeffne(d, 'verlag');
    gib('verlag', 'Carlsen');
    if (weg === 'X') await tippe(dialog('verlag')!.querySelector('[aria-label="Schließen"]')!);
    else await tippe(document.querySelector('[data-blatt-hintergrund]')!);
    await vi.waitFor(() => expect(feld('verlag')).toBeNull(), W);
    expect(wert(d, 'verlag')).toBe('Alt-Verlag');
    expect((await gespeichert(id))?.verlag).toBe('Alt-Verlag');
  });

  it('[REQ-063/AK-6] ISBN eingetragen, X: keine ISBN gespeichert', async () => {
    const { d, id } = await mitBuch();
    await oeffne(d, 'isbn');
    gib('isbn', '9783551551672');
    await tippe(dialog('isbn')!.querySelector('[aria-label="Schließen"]')!);
    await vi.waitFor(() => expect(feld('isbn')).toBeNull(), W);
    expect(wert(d, 'isbn')).toBe('');
    expect((await gespeichert(id))?.isbn).toBeUndefined();
  });

  it('[REQ-063/AK-7] „Fotos“ antippen: kein Blatt, nichts ändert sich', async () => {
    const { w, d, id } = await mitBuch(buch({ verlag: 'V', isbn: '9783551551672' }));
    const vorher = { html: bereich(d).innerHTML, buch: JSON.stringify(await w.repo.get(id)) };
    await tippe(zeile(d, 'fotos'));
    await warte(60);
    expect(document.querySelectorAll('[role="dialog"], [data-blatt-unten], [data-fenster-format]')).toHaveLength(0);
    expect(bereich(d).innerHTML).toBe(vorher.html);
    expect(JSON.stringify(await w.repo.get(id))).toBe(vorher.buch);
  });
});
