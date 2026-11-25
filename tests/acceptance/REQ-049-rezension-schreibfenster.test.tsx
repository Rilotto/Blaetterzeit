/**
 * Akzeptanztests REQ-049 – Schreibfenster der Rezension.
 * Schnittstellen laut Entwickler (Sprint 05): [data-schreibfenster], [data-schreibfenster-hintergrund], [data-ziehgriff],
 * [data-schreibfenster-titel|-autor|-schliessen], [data-schreibfenster-sterne], [data-rezension-eingabe], [data-rezension-sichern].
 * Android-Zurück im Test per `popstate`; Herunterziehen per Pointer-Ereignissen.
 * Speicher: IndexedDB (fake-indexeddb); „Neustart“ = Module neu laden, neue Repository-Instanz.
 * Hinweis: Ob reiner Leerraum als „leer“ gilt, legt der REQ nicht fest – hier nicht geprüft.
 */
import '@testing-library/jest-dom/vitest';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { IDBFactory, IDBKeyRange } from 'fake-indexeddb';
import type { ComponentType } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { rezensionSichern } from '@/domain/bewertung';
import type { Buch } from '@/domain/buch';
import type { BookRepository, ImageStore } from '@/storage';

vi.mock('@/buecher/demodaten', () => ({ demoBuecher: [] }));
beforeEach(() => {
  vi.stubGlobal('indexedDB', new IDBFactory());
  vi.stubGlobal('IDBKeyRange', IDBKeyRange);
});
afterEach(() => cleanup());

type Welt = { repo: BookRepository; BD: ComponentType<Record<string, unknown>> };
const buch = (f: Partial<Buch> = {}): Buch => ({ id: crypto.randomUUID(), titel: 'Der Testroman', autor: 'Erika Muster', status: 'ungelesen', ...f });
const bilder = { get: async () => undefined, put: async () => {}, remove: async () => {} } as unknown as ImageStore;
async function starte(): Promise<Welt> {
  vi.resetModules();
  const st = (await import('@/storage')) as typeof import('@/storage');
  const BD = (await import('@/views/BuchDetails')).default as unknown as ComponentType<Record<string, unknown>>;
  return { repo: st.createBookRepository(), BD };
}
async function zeige(w: Welt, id: string) {
  const BD = w.BD;
  render(<BD buchId={id} bildspeicher={bilder} bildquelle={{ scannen: async () => null, galerie: async () => null }} onZurueck={() => {}} />);
  const d = await screen.findByRole('region', { name: 'Buchdetails' });
  await vi.waitFor(() => expect(d.querySelector('[data-schreibfeld]')).not.toBeNull());
  return d;
}
async function mitBuch(b: Buch = buch()) {
  const w = await starte();
  await w.repo.save(b);
  return { w, d: await zeige(w, b.id), id: b.id };
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
async function gespeichert(id: string) {
  cleanup();
  const w = await starte();
  return w.repo.get(id);
}
const fenster = () => document.querySelector<HTMLElement>('[data-schreibfenster]');
const f = (sel: string) => fenster()!.querySelector<HTMLElement>(sel);
const eingabe = () => f('[data-rezension-eingabe]') as HTMLTextAreaElement;
const feld = (d: HTMLElement) => d.querySelector<HTMLElement>('[data-schreibfeld]')!;
const anzeige = (d: HTMLElement) => feld(d).querySelector('[data-rezension-text]')?.textContent ?? null;
const platzhalter = (d: HTMLElement) => feld(d).querySelector('[data-schreibfeld-platzhalter]')?.textContent?.trim() ?? null;
const schreibe = (t: string) => fireEvent.change(eingabe(), { target: { value: t } });
const sichern = () => tippe(f('[data-rezension-sichern]')!);
/** Schreibfeld antippen und warten, bis das Schreibfenster sichtbar ist (robust gegen langsame Umgebungen). */
async function oeffne(d: HTMLElement) {
  await tippe(feld(d));
  await vi.waitFor(() => expect(fenster()).not.toBeNull(), { timeout: 3000 });
}

type Weg = 'X' | 'Ziehen' | 'Außen' | 'Zurück';
async function schliesse(weg: Weg) {
  await vi.waitFor(() => expect(fenster()).not.toBeNull(), { timeout: 3000 });
  if (weg === 'X') await tippe(f('[data-schreibfenster-schliessen]')!);
  else if (weg === 'Außen') await tippe(document.querySelector('[data-schreibfenster-hintergrund]')!);
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
  await vi.waitFor(() => expect(fenster()).toBeNull(), { timeout: 3000 });
  // Schließen über X/Ziehen/Außen ruft history.back() auf; das popstate kommt asynchron. Erst abwarten,
  // sonst schließt es ein sofort wieder geöffnetes Fenster (siehe Testbericht H4).
  await warte(100);
}

describe('REQ-049 Schreibfenster', () => {
  it('[REQ-049/AK-1] Öffnen: Ziehgriff, Titel, Autor, X, Eingabefeld mit Platzhalter, „Sichern“', async () => {
    const { d } = await mitBuch();
    await oeffne(d);
    expect(fenster()).not.toBeNull();
    expect(f('[data-ziehgriff]')).not.toBeNull();
    expect(f('[data-schreibfenster-titel]')!.textContent?.trim()).toBe('Der Testroman');
    expect(f('[data-schreibfenster-autor]')!.textContent?.trim()).toBe('Erika Muster');
    expect(f('[data-schreibfenster-schliessen]')!.tagName).toBe('BUTTON');
    expect(eingabe().tagName).toBe('TEXTAREA'); // mehrzeilig
    expect(eingabe().getAttribute('placeholder')).toBe('Wie fandest du es?');
    expect(eingabe().value).toBe('');
    expect(eingabe().maxLength === -1 || !eingabe().hasAttribute('maxlength')).toBe(true);
    expect(f('[data-rezension-sichern]')!.textContent?.trim()).toBe('Sichern');
  });

  it('[REQ-049/AK-1] Grenzfall: ohne Autor entfällt die Autorzeile', async () => {
    const { d } = await mitBuch(buch({ autor: undefined }));
    await oeffne(d);
    expect(f('[data-schreibfenster-titel]')!.textContent?.trim()).toBe('Der Testroman');
    expect(f('[data-schreibfenster-autor]')).toBeNull();
  });

  it('[REQ-049/AK-2] Sterne = 4: vier volle, ein blasser Stern; Antippen ändert nichts', async () => {
    const { d, id } = await mitBuch(buch({ bewertungen: { sterne: 4 } } as Partial<Buch>));
    await oeffne(d);
    const sterne = f('[data-schreibfenster-sterne]')!;
    const voll = () => [...sterne.querySelectorAll('[data-symbol-nr]')].map((s) => s.getAttribute('data-voll'));
    expect(voll()).toEqual(['true', 'true', 'true', 'true', 'false']);
    for (const s of sterne.querySelectorAll('[data-symbol-nr]')) await tippe(s);
    await tippe(sterne);
    expect(voll()).toEqual(['true', 'true', 'true', 'true', 'false']);
    expect(fenster()).not.toBeNull();
    expect(d.querySelector('[data-kriterium="sterne"]')!.getAttribute('data-wert')).toBe('4');
    await warte();
    expect((await gespeichert(id))?.bewertungen?.sterne).toBe(4);
  });

  it('[REQ-049/AK-3] ohne Sterne-Bewertung keine Sterne (auch wenn andere Kriterien bewertet sind)', async () => {
    const { d } = await mitBuch(buch({ bewertungen: { tempo: 5 } } as Partial<Buch>));
    await oeffne(d);
    expect(f('[data-schreibfenster-sterne]')).toBeNull();
    expect(fenster()!.querySelector('[data-symbol="stern"]')).toBeNull();
  });

  it('[REQ-049/AK-4] 10 000 Zeichen mit Zeilenumbrüchen werden ungekürzt gespeichert (auch nach Neustart)', async () => {
    const { d, id } = await mitBuch();
    const zeile = 'Zeile mit Inhalt äöü 0123456789 ';
    let t = '';
    while (t.length < 10000) t += zeile + '\n';
    t = t.slice(0, 9999) + '!';
    expect(t.length).toBe(10000);
    await oeffne(d);
    schreibe(t);
    await sichern();
    expect(anzeige(d)).toBe(t);
    await warte();
    const b = await gespeichert(id);
    expect(b?.rezension).toBe(t);
    expect(b?.rezension?.length).toBe(10000);
  });

  it('[REQ-049/AK-5] Sichern schließt das Fenster; Schreibfeld zeigt den vollständigen Text', async () => {
    const { d } = await mitBuch();
    await oeffne(d);
    schreibe('Erste Zeile\n\nZweiter Absatz');
    await sichern();
    await vi.waitFor(() => expect(fenster()).toBeNull(), { timeout: 3000 });
    expect(anzeige(d)).toBe('Erste Zeile\n\nZweiter Absatz');
    expect(platzhalter(d)).toBeNull();
  });

  it('[REQ-049/AK-5] Grenzfall: ein einzelnes Zeichen wird gesichert', async () => {
    const { d, id } = await mitBuch();
    await oeffne(d);
    schreibe('x');
    await sichern();
    await vi.waitFor(() => expect(fenster()).toBeNull(), { timeout: 3000 });
    await warte();
    expect((await gespeichert(id))?.rezension).toBe('x');
  });

  it('[REQ-049/AK-6] gesicherte Rezension erscheint nach Neustart vollständig im Schreibfeld', async () => {
    const { d, id } = await mitBuch();
    await oeffne(d);
    schreibe('Dauerhaft\nüber Neustart');
    await sichern();
    await warte();
    cleanup();
    const w = await starte();
    const d2 = await zeige(w, id);
    expect(anzeige(d2)).toBe('Dauerhaft\nüber Neustart');
    expect(platzhalter(d2)).toBeNull();
  });

  it('[REQ-049/AK-7] Bearbeiten: bisheriger Text steht im Eingabefeld; danach geänderter Text angezeigt und gespeichert', async () => {
    const { d, id } = await mitBuch(buch({ rezension: 'Alter Text' } as Partial<Buch>));
    await oeffne(d);
    expect(eingabe().value).toBe('Alter Text');
    schreibe('Alter Text, ergänzt');
    await sichern();
    expect(anzeige(d)).toBe('Alter Text, ergänzt');
    await warte();
    expect((await gespeichert(id))?.rezension).toBe('Alter Text, ergänzt');
  });

  it('[REQ-049/AK-8] keine Rezension gespeichert, leeres Eingabefeld: Sichern lässt das Fenster offen und speichert nichts', async () => {
    const { w, d, id } = await mitBuch();
    const spy = vi.spyOn(w.repo, 'save');
    await oeffne(d);
    await sichern();
    expect(fenster()).not.toBeNull();
    await warte();
    expect(spy).not.toHaveBeenCalled();
    expect((await gespeichert(id))?.rezension).toBeUndefined();
  });

  // Fassung 2026-11-23 (REQ-093): bei gespeicherter Rezension entfernt „Sichern“ mit leerem Feld die Rezension.
  it('[REQ-049/AK-8] gesicherte Rezension vollständig gelöscht: Sichern entfernt sie, Fenster zu, Schreibfeld ohne Rezension, auch nach Neustart', async () => {
    const { d, id } = await mitBuch(buch({ rezension: 'Wird entfernt' } as Partial<Buch>));
    await oeffne(d);
    expect(eingabe().value).toBe('Wird entfernt');
    schreibe('');
    await sichern();
    await vi.waitFor(() => expect(fenster()).toBeNull());
    expect(anzeige(d)).toBeNull();
    expect(platzhalter(d)).toBe('Wie fandest du es?');
    await warte();
    expect((await gespeichert(id))?.rezension).toBeUndefined();
    const d2 = await zeige(await starte(), id);
    expect(platzhalter(d2)).toBe('Wie fandest du es?');
  });

  it('[REQ-049/AK-8] nach dem Entfernen lässt sich wieder eine Rezension schreiben', async () => {
    const { d, id } = await mitBuch(buch({ rezension: 'Alt' } as Partial<Buch>));
    await oeffne(d);
    schreibe('');
    await sichern();
    await vi.waitFor(() => expect(fenster()).toBeNull());
    await oeffne(d);
    expect(eingabe().value).toBe('');
    schreibe('Neu');
    await sichern();
    await warte();
    expect((await gespeichert(id))?.rezension).toBe('Neu');
  });

  it('[REQ-049/AK-8] Fachfunktion: leerer Text ohne gespeicherte Rezension ergibt keine Rezension', () => {
    const r = rezensionSichern(buch(), '');
    expect(r === null || r === undefined || r.rezension === undefined).toBe(true);
    expect(rezensionSichern(buch(), 'Neu')?.rezension).toBe('Neu');
  });

  for (const weg of ['X', 'Ziehen', 'Außen', 'Zurück'] as const) {
    it(`[REQ-049/AK-9] Schließen über ${weg} ohne Sichern: ohne Rezension bleibt „Wie fandest du es?“, nichts gespeichert`, async () => {
      const { d, id } = await mitBuch();
      await oeffne(d);
      schreibe('Verworfener Entwurf');
      await schliesse(weg);
      expect(fenster()).toBeNull();
      expect(platzhalter(d)).toBe('Wie fandest du es?');
      // Wiederöffnen: der Text ist verloren.
      await oeffne(d);
      expect(eingabe().value).toBe('');
      await schliesse('X');
      await warte();
      expect((await gespeichert(id))?.rezension).toBeUndefined();
    });

    it(`[REQ-049/AK-9] Schließen über ${weg} ohne Sichern: zuvor gesicherte Rezension bleibt unverändert`, async () => {
      const { d, id } = await mitBuch(buch({ rezension: 'Gesichert' } as Partial<Buch>));
      await oeffne(d);
      schreibe('Gesichert plus Änderung');
      await schliesse(weg);
      expect(fenster()).toBeNull();
      expect(anzeige(d)).toBe('Gesichert');
      await oeffne(d);
      expect(eingabe().value).toBe('Gesichert');
      await schliesse('X');
      await warte();
      expect((await gespeichert(id))?.rezension).toBe('Gesichert');
    });
  }

  it('[REQ-049/AK-9] Grenzfall: kurzes Ziehen am Griff (unter Schwelle) schließt nicht', async () => {
    const { d } = await mitBuch();
    await oeffne(d);
    const g = f('[data-ziehgriff]')!;
    await act(async () => {
      fireEvent.pointerDown(g, { clientY: 100, pointerId: 1 });
      fireEvent.pointerMove(g, { clientY: 110, pointerId: 1 });
      fireEvent.pointerUp(g, { clientY: 110, pointerId: 1 });
    });
    expect(fenster()).not.toBeNull();
  });

  it('[REQ-049/AK-10] im Schreibfenster weder Kreis noch „Noch nicht geschrieben“, „Enthält Spoiler“, „Öffentlich“', async () => {
    const { d } = await mitBuch(buch({ bewertungen: { sterne: 2 }, rezension: 'R' } as Partial<Buch>));
    await oeffne(d);
    const t = (fenster()!.textContent ?? '').toLowerCase();
    for (const v of ['noch nicht geschrieben', 'enthält spoiler', 'öffentlich']) expect(t).not.toContain(v);
    expect(fenster()!.querySelector('circle, input[type="checkbox"], [role="switch"], [role="checkbox"]')).toBeNull();
  });
});
