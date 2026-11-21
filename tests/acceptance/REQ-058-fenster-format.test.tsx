/**
 * Akzeptanztests REQ-058 – Fenster „Format“.
 * Schnittstellen laut Entwickler: [data-fenster-format], [data-format-hintergrund], [data-ziehgriff], [data-format-schliessen],
 * [data-format-sichern], [data-format-kachel=id], [data-print-karte], [data-unterformat=id], [data-sonderausgabe=id],
 * [data-sonderausgabe-anzeige], [data-exemplar=id]; Auswahl über data-gewaehlt / aria-pressed.
 * Android-Zurück per `popstate`, Herunterziehen per Pointer-Ereignissen (wie REQ-049).
 * Nicht festgeschrieben (nicht im REQ): Verwerfen von Unterformat/Sonderausgabe bei E-Book/Hörbuch;
 * ob erneutes Antippen Unterformat/Exemplar aufhebt.
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

const fenster = () => document.querySelector<HTMLElement>('[data-fenster-format]');
const f = (sel: string) => fenster()!.querySelector<HTMLElement>(sel);
const knopf = (art: string, id: string) => f(`[data-${art}="${id}"]`)!;
const gewaehlt = (el: HTMLElement | null) => el !== null && el.hasAttribute('data-gewaehlt') && el.getAttribute('data-gewaehlt') !== 'false' && el.getAttribute('aria-pressed') === 'true';
const auswahl = (art: string) =>
  Array.from(fenster()!.querySelectorAll<HTMLElement>(`[data-${art}]`))
    .filter(gewaehlt)
    .map((e) => e.getAttribute(`data-${art}`));
async function oeffne(d: HTMLElement, aus: 'format' | 'exemplar' | 'sonderausgabe' = 'format') {
  await tippe(zeile(d, aus));
  await vi.waitFor(() => expect(fenster()).not.toBeNull(), W);
}
async function waehle(art: string, id: string) {
  await tippe(knopf(art, id));
}
async function sichern() {
  await tippe(f('[data-format-sichern]')!);
  await vi.waitFor(() => expect(fenster()).toBeNull(), W);
  await warte(100);
}
type Weg = 'X' | 'Ziehen' | 'Außen' | 'Zurück';
async function schliesse(weg: Weg) {
  if (weg === 'X') await tippe(f('[data-format-schliessen]')!);
  else if (weg === 'Außen') await tippe(document.querySelector('[data-format-hintergrund]')!);
  else if (weg === 'Zurück')
    await act(async () => {
      window.dispatchEvent(new PopStateEvent('popstate', { state: null }));
      await new Promise((r) => setTimeout(r, 10));
    });
  else {
    const g = f('[data-ziehgriff]')!;
    await act(async () => {
      fireEvent.pointerDown(g, { clientY: 100, pointerId: 1 });
      fireEvent.pointerMove(g, { clientY: 200, pointerId: 1 });
      fireEvent.pointerMove(g, { clientY: 400, pointerId: 1 });
      fireEvent.pointerUp(g, { clientY: 400, pointerId: 1 });
      await new Promise((r) => setTimeout(r, 10));
    });
  }
  await vi.waitFor(() => expect(fenster()).toBeNull(), W);
  await warte(100);
}
/** Sichtbarer Text ohne Inhalte nachgebildeter SVG-Icons (z. B. „?“ im Icon „Weiß ich nicht“). */
const ohneIcon = (el: Element) => {
  const k = el.cloneNode(true) as Element;
  k.querySelectorAll('svg').forEach((s) => s.remove());
  return norm(k.textContent);
};
const voll = () => buch({ format: 'print', unterformat: 'taschenbuch', sonderausgabe: 'farbschnitt', exemplar: 'meins' });

describe('REQ-058 Fenster „Format“', () => {
  it.each(['format', 'exemplar', 'sonderausgabe'] as const)('[REQ-058/AK-1] Zeile „%s“ öffnet das Fenster mit Ziehgriff, „Format“, X, „Sichern“', async (aus) => {
    const { d } = await mitBuch();
    await oeffne(d, aus);
    expect(f('[data-ziehgriff]')).not.toBeNull();
    expect(norm(f('[data-format-titel]')?.textContent)).toBe('Format');
    expect(f('[data-format-schliessen]')!.tagName).toBe('BUTTON');
    expect(norm(f('[data-format-sichern]')!.textContent)).toBe('Sichern');
    expect(document.querySelector('[data-format-hintergrund]')).not.toBeNull();
    const kacheln = Array.from(fenster()!.querySelectorAll('[data-format-kachel]'));
    expect(kacheln.map((k) => k.getAttribute('data-format-kachel'))).toEqual(['print', 'ebook', 'hoerbuch']);
    expect(kacheln.map(ohneIcon)).toEqual(['Print', 'E-Book', 'Hörbuch']);
  });

  it('[REQ-058/AK-1] Exemplar-Auswahl: genau die fünf Optionen unter „Wem gehört dieses Exemplar?“', async () => {
    const { d } = await mitBuch();
    await oeffne(d);
    expect(fenster()!.textContent).toContain('Wem gehört dieses Exemplar?');
    const ex = Array.from(fenster()!.querySelectorAll('[data-exemplar]'));
    expect(ex.map((e) => norm(e.textContent))).toEqual(['Meins', 'Ich will es', 'Geliehen', 'Verliehen', 'Verkauft']);
  });

  it('[REQ-058/AK-2] neues Buch: nichts vorausgewählt', async () => {
    const { d } = await mitBuch();
    await oeffne(d);
    expect(auswahl('format-kachel')).toEqual([]);
    expect(auswahl('exemplar')).toEqual([]);
    expect(fenster()!.querySelector('[data-print-karte]')).toBeNull();
    expect(fenster()!.querySelectorAll('[data-sonderausgabe][data-gewaehlt]:not([data-gewaehlt="false"])').length).toBe(0);
  });

  it('[REQ-058/AK-3] gespeicherter Stand Print/Taschenbuch/Farbschnitt/Meins ist gewählt', async () => {
    const { d } = await mitBuch(voll());
    await oeffne(d, 'sonderausgabe');
    expect(auswahl('format-kachel')).toEqual(['print']);
    expect(auswahl('unterformat')).toEqual(['taschenbuch']);
    expect(auswahl('sonderausgabe')).toEqual(['farbschnitt']);
    expect(auswahl('exemplar')).toEqual(['meins']);
    expect(norm(f('[data-sonderausgabe-anzeige]')?.textContent)).toBe('Farbschnitt');
    expect(f('[data-format-kachel="print"] [data-haken]')).not.toBeNull();
  });

  it.each(['ebook', 'hoerbuch'])('[REQ-058/AK-4] Print → %s: nur dieses gewählt, keine Print-Karte', async (id) => {
    const { d } = await mitBuch(voll());
    await oeffne(d);
    expect(fenster()!.querySelector('[data-print-karte]')).not.toBeNull();
    await waehle('format-kachel', id);
    expect(auswahl('format-kachel')).toEqual([id]);
    expect(f(`[data-format-kachel="${id}"] [data-haken]`)).not.toBeNull();
    expect(f('[data-format-kachel="print"] [data-haken]')).toBeNull();
    expect(fenster()!.querySelector('[data-print-karte]')).toBeNull();
    expect(fenster()!.querySelectorAll('[data-unterformat], [data-sonderausgabe]').length).toBe(0);
  });

  it('[REQ-058/AK-4] Print wählen zeigt Karte mit vier Unterformaten', async () => {
    const { d } = await mitBuch();
    await oeffne(d);
    await waehle('format-kachel', 'print');
    const k = fenster()!.querySelector<HTMLElement>('[data-print-karte]')!;
    expect(k).not.toBeNull();
    expect(Array.from(k.querySelectorAll('[data-unterformat]')).map(ohneIcon)).toEqual(['Hardcover', 'Taschenbuch', 'Kleinformat', 'Weiß ich nicht']);
  });

  it('[REQ-058/AK-5] eine Sonderausgabe; erneutes Antippen hebt auf', async () => {
    const { d } = await mitBuch(voll());
    await oeffne(d);
    await waehle('sonderausgabe', 'erstausgabe');
    expect(auswahl('sonderausgabe')).toEqual(['erstausgabe']);
    expect(norm(f('[data-sonderausgabe-anzeige]')?.textContent)).toBe('Erstausgabe');
    await waehle('sonderausgabe', 'erstausgabe');
    expect(auswahl('sonderausgabe')).toEqual([]);
  });

  it('[REQ-058/AK-5] Abwahl wird gespeichert: Zeile „Sonderausgabe“ zeigt danach „Keins“', async () => {
    const { d, id } = await mitBuch(voll());
    await oeffne(d);
    await waehle('sonderausgabe', 'farbschnitt');
    expect(auswahl('sonderausgabe')).toEqual([]);
    await sichern();
    await vi.waitFor(() => expect(wert(d, 'sonderausgabe')).toBe('Keins'), W);
    expect((await gespeichert(id))?.sonderausgabe).toBeUndefined();
  });

  it('[REQ-058/AK-6] genau drei Sonderausgaben', async () => {
    const { d } = await mitBuch(buch({ format: 'print' }));
    await oeffne(d);
    const k = fenster()!.querySelector<HTMLElement>('[data-print-karte]')!;
    expect(k.textContent).toContain('Sonderausgabe');
    expect(Array.from(k.querySelectorAll('[data-sonderausgabe]')).map((e) => norm(e.textContent))).toEqual(['Farbschnitt', 'Erstausgabe', 'Sammlerausgabe']);
  });

  it('[REQ-058/AK-7] Hardcover und Geliehen ersetzen Taschenbuch und Meins', async () => {
    const { d } = await mitBuch(buch({ format: 'print', unterformat: 'taschenbuch', exemplar: 'meins' }));
    await oeffne(d);
    await waehle('unterformat', 'hardcover');
    await waehle('exemplar', 'geliehen');
    expect(auswahl('unterformat')).toEqual(['hardcover']);
    expect(auswahl('exemplar')).toEqual(['geliehen']);
  });

  it('[REQ-058/AK-8] Print/Hardcover/Geliehen sichern: Fenster zu, Zeilen aktualisiert, auch nach Neustart', async () => {
    const { d, id } = await mitBuch();
    await oeffne(d, 'exemplar');
    await waehle('format-kachel', 'print');
    await waehle('unterformat', 'hardcover');
    await waehle('exemplar', 'geliehen');
    await sichern();
    await vi.waitFor(() => expect(wert(d, 'format')).toBe('Print · Hardcover'), W);
    expect(wert(d, 'exemplar')).toBe('Geliehen');
    const b = await gespeichert(id);
    expect(b).toMatchObject({ format: 'print', unterformat: 'hardcover', exemplar: 'geliehen' });
    const d2 = await neustartAnzeige(id);
    expect(wert(d2, 'format')).toBe('Print · Hardcover');
    expect(wert(d2, 'exemplar')).toBe('Geliehen');
  });

  it('[REQ-058/AK-8] Sonderausgabe wird gespeichert und angezeigt', async () => {
    const { d, id } = await mitBuch(buch({ format: 'print' }));
    await oeffne(d);
    await waehle('sonderausgabe', 'sammlerausgabe');
    await sichern();
    await vi.waitFor(() => expect(wert(d, 'sonderausgabe')).toBe('Sammlerausgabe'), W);
    expect((await gespeichert(id))?.sonderausgabe).toBe('sammlerausgabe');
  });

  it.each(['X', 'Ziehen', 'Außen', 'Zurück'] as const)('[REQ-058/AK-9] Änderung, schließen über %s: gespeicherte Werte unverändert', async (weg) => {
    const b = voll();
    const { d, id } = await mitBuch(b);
    await oeffne(d);
    await waehle('format-kachel', 'ebook');
    await waehle('exemplar', 'verkauft');
    await schliesse(weg);
    expect(wert(d, 'format')).toBe('Print · Taschenbuch');
    expect(wert(d, 'exemplar')).toBe('Meins');
    expect(wert(d, 'sonderausgabe')).toBe('Farbschnitt');
    expect(await gespeichert(id)).toMatchObject({ format: 'print', unterformat: 'taschenbuch', sonderausgabe: 'farbschnitt', exemplar: 'meins' });
  });

  it('[REQ-058/AK-9] nach Schließen ohne Sichern zeigt erneutes Öffnen wieder den gespeicherten Stand', async () => {
    const { d } = await mitBuch(voll());
    await oeffne(d);
    await waehle('exemplar', 'verkauft');
    await schliesse('X');
    await oeffne(d);
    expect(auswahl('exemplar')).toEqual(['meins']);
  });
});
