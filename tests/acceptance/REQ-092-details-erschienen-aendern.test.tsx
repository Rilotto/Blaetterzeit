/**
 * Akzeptanztests REQ-092 – „Erschienen“ im Reiter „Details“ über ein Datumsblatt ändern und leeren, Feld „Jahr“ entfällt.
 * Abgeleitet aus dem REQ-Text. Bekannte Schnittstellen (Muster REQ-063/REQ-064/REQ-060): Zeile [data-ausgabe-zeile="erschienen"]
 * mit [data-zeile-wert]; Blattfeld [data-blatt-feld="erschienen"], Sichern [data-blatt-sichern="erschienen"],
 * Fehler data-fehler="true" + aria-invalid="true", X [aria-label="Schließen"], Außen [data-blatt-hintergrund].
 * „Heute“ über die Prop `jetzt` (23.11.2026). „Neustart“ = Module neu laden, neue Repository-Instanz auf derselben IndexedDB.
 */
import '@testing-library/jest-dom/vitest';
import { act, cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { IDBFactory, IDBKeyRange } from 'fake-indexeddb';
import type { ComponentType, CSSProperties } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { Treffer } from '@/barcode/treffer';
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

type Welt = { repo: BookRepository; BD: ComponentType<Record<string, unknown>>; BA: ComponentType<Record<string, unknown>> };
const HEUTE = new Date(2026, 10, 23, 15, 0, 0); // 23.11.2026, lokale Zeit
const jetzt = () => HEUTE;
const W = { timeout: 4000 };
const buch = (f: Partial<Buch> = {}): Buch => ({ id: crypto.randomUUID(), titel: 'Der Testroman', status: 'ungelesen', ...f });
const bilder = { get: async () => undefined, put: async () => {}, remove: async () => {} } as unknown as ImageStore;
const quelle = { scannen: async () => null, galerie: async () => null };
async function starte(): Promise<Welt> {
  vi.resetModules();
  const st = (await import('@/storage')) as typeof import('@/storage');
  const BD = (await import('@/views/BuchDetails')).default as unknown as ComponentType<Record<string, unknown>>;
  const BA = (await import('@/views/BuecherAnsicht')).default as unknown as ComponentType<Record<string, unknown>>;
  return { repo: st.createBookRepository(), BD, BA };
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
async function zuDetails(d: HTMLElement) {
  const tab = await vi.waitFor(() => {
    const t = d.querySelector<HTMLElement>('[data-reiter="details"]');
    expect(t).not.toBeNull();
    return t!;
  }, W);
  await tippe(tab);
  await vi.waitFor(() => expect(d.querySelector('[data-reiter-bereich="details"]')).not.toBeNull(), W);
  return d;
}
async function zeige(w: Welt, id: string) {
  const BD = w.BD;
  render(
    <div data-testwurzel="" style={farbVariablen() as CSSProperties}>
      <BD buchId={id} jetzt={jetzt} bildspeicher={bilder} bildquelle={quelle} onZurueck={() => {}} />
    </div>,
  );
  return zuDetails(await screen.findByRole('region', { name: 'Buchdetails' }, W));
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
const norm = (t: string | null | undefined) => (t ?? '').replace(/[\s  ]+/g, ' ').trim();
const zeile = (d: HTMLElement) => d.querySelector<HTMLElement>('[data-reiter-bereich="details"] [data-ausgabe-zeile="erschienen"]')!;
const wert = (d: HTMLElement) => norm(zeile(d).querySelector('[data-zeile-wert]')?.textContent);
const feld = () => document.querySelector<HTMLInputElement>('[data-blatt-feld="erschienen"]');
const dialog = () => feld()?.closest<HTMLElement>('[role="dialog"]') ?? null;
async function oeffne(d: HTMLElement) {
  await tippe(zeile(d));
  await vi.waitFor(() => expect(feld()).not.toBeNull(), W);
}
const gib = (t: string) => fireEvent.change(feld()!, { target: { value: t } });
async function sichern() {
  await tippe(document.querySelector('[data-blatt-sichern="erschienen"]')!);
  await warte(60);
}
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
const angabe = (b?: Buch) => ({ datum: b?.erscheinungsdatum, jahr: b?.erscheinungsjahr });

describe('REQ-092 „Erschienen“ ändern und leeren', () => {
  it('[REQ-092/AK-1] Buch mit Erscheinungsdatum 15.03.2021: Antippen öffnet Datumsblatt mit „Sichern“, Feld zeigt 15.03.2021', async () => {
    const { d } = await mitBuch(buch({ erscheinungsdatum: '15.03.2021' }));
    expect(wert(d)).toMatch(/^\S+ 2021$/);
    await oeffne(d);
    expect(feld()!.value).toBe('15.03.2021');
    expect(dialog()).not.toBeNull();
    expect(norm(dialog()!.querySelector('[data-blatt-sichern="erschienen"]')!.textContent)).toBe('Sichern');
  });

  it.each([
    ['nur Jahr 2019', { erscheinungsjahr: 2019 }, '2019'],
    ['Datum und Jahr', { erscheinungsjahr: 2019, erscheinungsdatum: '03.02.2019' }, '03.02.2019'],
    ['ohne Angabe', {}, ''],
  ] as const)('[REQ-092/AK-1] Vorbefüllung %s → Feld „%s“', async (_n, felder, erwartet) => {
    const { d } = await mitBuch(buch(felder as Partial<Buch>));
    await oeffne(d);
    expect(feld()!.value).toBe(erwartet);
  });

  it('[REQ-092/AK-2] 01.02.2025 sichern: Blatt zu, Datum gespeichert, Zeile „Feb. 2025“; erneut geöffnet 01.02.2025; nach Neustart unverändert', async () => {
    const { d, id } = await mitBuch();
    await oeffne(d);
    gib('01.02.2025');
    await sichern();
    await vi.waitFor(() => expect(feld()).toBeNull(), W);
    await vi.waitFor(() => expect(wert(d)).toBe('Feb. 2025'), W);
    await oeffne(d);
    expect(feld()!.value).toBe('01.02.2025');
    await tippe(dialog()!.querySelector('[aria-label="Schließen"]')!);
    expect((await gespeichert(id))?.erscheinungsdatum).toBe('01.02.2025');
    const d2 = await neustartAnzeige(id);
    expect(wert(d2)).toBe('Feb. 2025');
  });

  it('[REQ-092/AK-2] neues Datum ersetzt Datum und Jahr vollständig (vorher Jahr 2019)', async () => {
    const { d, id } = await mitBuch(buch({ erscheinungsjahr: 2019 }));
    await oeffne(d);
    gib('01.02.2025');
    await sichern();
    await vi.waitFor(() => expect(wert(d)).toBe('Feb. 2025'), W);
    const b = await gespeichert(id);
    expect(b?.erscheinungsdatum).toBe('01.02.2025');
    expect(b?.erscheinungsjahr === undefined || b?.erscheinungsjahr === 2025).toBe(true);
  });

  it.each(['29.02.2024', '23.11.2026'])('[REQ-092/AK-2] Grenzfälle gültig: %s (Schalttag, heute)', async (ein) => {
    const { d, id } = await mitBuch();
    await oeffne(d);
    gib(ein);
    await sichern();
    await vi.waitFor(() => expect(feld()).toBeNull(), W);
    expect((await gespeichert(id))?.erscheinungsdatum).toBe(ein);
  });

  it.each(['24.11.2026', '01.01.2027'])('[REQ-092/AK-3] Datum in der Zukunft (%s): Feld in Primär, kein Hinweistext, Blatt offen, Angabe unverändert', async (ein) => {
    const { d, id } = await mitBuch(buch({ erscheinungsdatum: '15.03.2021' }));
    await oeffne(d);
    gib(ein);
    const textVorher = norm(dialog()!.textContent);
    expect(markiert()).toBe(false);
    await sichern();
    expect(feld()).not.toBeNull();
    expect(markiert()).toBe(true);
    expect(inPrimaer(feld()!)).toBe(true);
    expect(norm(dialog()!.textContent)).toBe(textVorher);
    expect(screen.queryByRole('alert')).toBeNull();
    expect(angabe(await gespeichert(id))).toEqual({ datum: '15.03.2021', jahr: undefined });
  });

  it.each(['31.02.2025', '29.02.2025', '00.01.2025', '15.13.2025'])('[REQ-092/AK-4] nicht existierendes Datum %s: hervorgehoben, nichts gespeichert', async (ein) => {
    const { d, id } = await mitBuch();
    await oeffne(d);
    gib(ein);
    await sichern();
    expect(feld()).not.toBeNull();
    expect(markiert()).toBe(true);
    expect(wert(d)).toBe('');
    expect(angabe(await gespeichert(id))).toEqual({ datum: undefined, jahr: undefined });
  });

  it('[REQ-092/AK-4] Hervorhebung endet, sobald im Feld etwas geändert wird', async () => {
    const { d } = await mitBuch();
    await oeffne(d);
    gib('31.02.2025');
    await sichern();
    expect(markiert()).toBe(true);
    gib('31.01.2025');
    expect(feld()!.getAttribute('data-fehler')).not.toBe('true');
    expect(feld()!.getAttribute('aria-invalid')).not.toBe('true');
  });

  it.each([
    ['Datum', { erscheinungsdatum: '15.03.2021' }],
    ['nur Jahr', { erscheinungsjahr: 2019 }],
    ['Datum und Jahr', { erscheinungsdatum: '03.02.2019', erscheinungsjahr: 2019 }],
  ] as const)('[REQ-092/AK-5] %s: Feld leeren und sichern → keine Erscheinungsangabe, Zeile leer, nicht hervorgehoben, auch nach Neustart', async (_n, felder) => {
    const { d, id } = await mitBuch(buch(felder as Partial<Buch>));
    expect(wert(d)).not.toBe('');
    await oeffne(d);
    gib('');
    await sichern();
    if (feld()) expect(markiert(), 'leeres Feld gilt nicht als ungültig').toBe(false);
    await vi.waitFor(() => expect(feld()).toBeNull(), W);
    await vi.waitFor(() => expect(wert(d)).toBe(''), W);
    expect(angabe(await gespeichert(id))).toEqual({ datum: undefined, jahr: undefined });
    const d2 = await neustartAnzeige(id);
    expect(wert(d2)).toBe('');
  });

  it.each(['X', 'Außen'])('[REQ-092/AK-6] anderes Datum eingetragen, Schließen über %s: Angabe unverändert', async (weg) => {
    const { d, id } = await mitBuch(buch({ erscheinungsdatum: '15.03.2021' }));
    const vorher = wert(d);
    await oeffne(d);
    gib('01.02.2025');
    if (weg === 'X') await tippe(dialog()!.querySelector('[aria-label="Schließen"]')!);
    else await tippe(document.querySelector('[data-blatt-hintergrund]')!);
    await vi.waitFor(() => expect(feld()).toBeNull(), W);
    expect(wert(d)).toBe(vorher);
    expect(angabe(await gespeichert(id))).toEqual({ datum: '15.03.2021', jahr: undefined });
  });

  it('[REQ-092/AK-6] Feld geleert, Schließen über X: Angabe bleibt, erneut geöffnet steht sie wieder im Feld', async () => {
    const { d, id } = await mitBuch(buch({ erscheinungsjahr: 2019 }));
    await oeffne(d);
    gib('');
    await tippe(dialog()!.querySelector('[aria-label="Schließen"]')!);
    await vi.waitFor(() => expect(feld()).toBeNull(), W);
    expect(wert(d)).toBe('2019');
    await oeffne(d);
    expect(feld()!.value).toBe('2019');
    await tippe(dialog()!.querySelector('[aria-label="Schließen"]')!);
    expect(angabe(await gespeichert(id))).toEqual({ datum: undefined, jahr: 2019 });
  });

  it('[REQ-092/AK-7] vorher angelegtes Buch mit Jahr 2019, ohne Datum: Zeile zeigt „2019“', async () => {
    const { d } = await mitBuch(buch({ erscheinungsjahr: 2019 }));
    expect(wert(d)).toBe('2019');
  });

  it('[REQ-092/AK-8] Jahr 2019 und Datum 03.02.2019: Datum hat Vorrang → „Feb. 2019“', async () => {
    const { d } = await mitBuch(buch({ erscheinungsjahr: 2019, erscheinungsdatum: '03.02.2019' }));
    expect(wert(d)).toBe('Feb. 2019');
  });

  it('[REQ-092/AK-8] Datum und abweichendes Jahr: das Datum gilt (03.02.2019 und Jahr 2000 → „Feb. 2019“)', async () => {
    const { d } = await mitBuch(buch({ erscheinungsjahr: 2000, erscheinungsdatum: '03.02.2019' }));
    expect(wert(d)).toBe('Feb. 2019');
  });

  it.each([
    ['2019', 2019],
    ['2026', 2026],
    ['1850', 1850],
  ] as const)('[REQ-092/AK-10] Datum 15.03.2021, „%s“ eintragen: nur Jahr, kein Datum mehr, Zeile zeigt das Jahr, auch nach Neustart', async (ein, jahr) => {
    const { d, id } = await mitBuch(buch({ erscheinungsdatum: '15.03.2021' }));
    await oeffne(d);
    gib(ein);
    expect(feld()!.value).toBe(ein);
    await sichern();
    await vi.waitFor(() => expect(feld()).toBeNull(), W);
    await vi.waitFor(() => expect(wert(d)).toBe(ein), W);
    await oeffne(d);
    expect(feld()!.value).toBe(ein);
    await tippe(dialog()!.querySelector('[aria-label="Schließen"]')!);
    expect(angabe(await gespeichert(id))).toEqual({ datum: undefined, jahr });
    const d2 = await neustartAnzeige(id);
    expect(wert(d2)).toBe(ein);
    await oeffne(d2);
    expect(feld()!.value).toBe(ein);
  });

  it.each(['2027', '219', '19', '20190'])('[REQ-092/AK-11] ungültiges Jahr „%s“: hervorgehoben, Blatt offen, nichts gespeichert', async (ein) => {
    const { d, id } = await mitBuch(buch({ erscheinungsjahr: 2019 }));
    await oeffne(d);
    gib(ein);
    await sichern();
    expect(feld()).not.toBeNull();
    expect(markiert()).toBe(true);
    expect(inPrimaer(feld()!)).toBe(true);
    expect(screen.queryByRole('alert')).toBeNull();
    expect(wert(d)).toBe('2019');
    expect(angabe(await gespeichert(id))).toEqual({ datum: undefined, jahr: 2019 });
  });

  describe('Blatt „Manueller Eintrag“', () => {
    async function blatt(w: Welt, extra: Record<string, unknown> = {}) {
      const BA = w.BA;
      render(
        <div data-testwurzel="" style={farbVariablen() as CSSProperties}>
          <BA repository={w.repo} bildspeicher={bilder} bildquelle={quelle} jetzt={jetzt} {...extra} />
        </div>,
      );
      await screen.findByRole('heading', { name: 'Deine Bücher' }, W);
    }
    async function manuell() {
      await tippe(screen.getByRole('button', { name: 'Buch hinzufügen' }));
      await tippe(within(await screen.findByRole('menu', { name: 'Buch hinzufügen' }, W)).getByRole('menuitem', { name: /Von Hand eintragen/ }));
      return screen.findByRole('dialog', { name: 'Manueller Eintrag' }, W);
    }
    const mfeld = (d: HTMLElement, n: string) => within(d).getByLabelText(new RegExp(`^\\s*${n}\\s*$`, 'i')) as HTMLInputElement;

    it('[REQ-092/AK-9] kein Feld „JAHR“; die Erscheinungsangabe ist nur über „Erschienen“ eingebbar', async () => {
      await blatt(await starte());
      const d = await manuell();
      expect(within(d).queryAllByLabelText(/^\s*Jahr\s*$/i)).toHaveLength(0);
      expect(within(d).queryAllByPlaceholderText('2024')).toHaveLength(0);
      expect(Array.from(d.querySelectorAll<HTMLElement>('*')).filter((e) => e.children.length === 0 && /^\s*JAHR\s*$/i.test(e.textContent ?? ''))).toHaveLength(0);
      expect(d.querySelectorAll('[data-ausgabe-zeile="erschienen"]')).toHaveLength(1);
    });

    it.each([
      ['2019', { jahr: 2019, datum: undefined }],
      ['15.03.2021', { jahr: undefined, datum: '15.03.2021' }],
    ] as const)('[REQ-092/AK-12] Titel und Seiten eingetragen, „Erschienen“ %s, „Hinzufügen“ → Buch mit dieser Angabe, Details zeigen sie', async (ein, erwartet) => {
      const w = await starte();
      await blatt(w);
      const d = await manuell();
      fireEvent.change(mfeld(d, 'Titel'), { target: { value: 'Mit Erschienen' } });
      fireEvent.change(mfeld(d, 'Seiten'), { target: { value: '200' } });
      await tippe(d.querySelector('[data-ausgabe-zeile="erschienen"]')!);
      await vi.waitFor(() => expect(feld()).not.toBeNull(), W);
      gib(ein);
      await sichern();
      await vi.waitFor(() => expect(feld()).toBeNull(), W);
      expect(norm(d.querySelector('[data-ausgabe-zeile="erschienen"]')!.textContent)).toContain(ein);
      await tippe(within(d).getByRole('button', { name: 'Hinzufügen' }));
      const det = await zuDetails(await screen.findByRole('region', { name: 'Buchdetails' }, W));
      const [b] = (await w.repo.list()).filter((x) => x.titel === 'Mit Erschienen');
      expect(angabe(b)).toEqual(erwartet);
      if (ein === '2019') expect(wert(det)).toBe('2019');
      else expect(wert(det)).toMatch(/^\S+ 2021$/);
    });

    it.each(['2027', '219'])('[REQ-092/AK-12] Negativfall im Manuellen Eintrag: Jahr „%s“ wird wie im Datumsblatt abgewiesen', async (ein) => {
      await blatt(await starte());
      const d = await manuell();
      await tippe(d.querySelector('[data-ausgabe-zeile="erschienen"]')!);
      await vi.waitFor(() => expect(feld()).not.toBeNull(), W);
      gib(ein);
      await sichern();
      expect(feld(), 'Blatt bleibt offen').not.toBeNull();
      expect(markiert()).toBe(true);
    });

    function scannerFake() {
      const s = {
        optionen: null as { beiIsbn: (isbn: string) => void } | null,
        starten: vi.fn(async (o: { beiIsbn: (isbn: string) => void }) => void (s.optionen = o)),
        lichtSetzen: vi.fn(async () => {}),
        beenden: vi.fn(async () => {}),
      };
      return s;
    }
    it.each([
      ['nur Jahr 2019', { erscheinungsjahr: 2019 }, '2019'],
      ['vollständiges Datum', { erscheinungsdatum: '15.03.2021' }, '15.03.2021'],
    ] as const)('[REQ-092/AK-13] Barcode-Treffer mit %s: im Manuellen Eintrag steht bei „Erschienen“ %s', async (_n, angaben, text) => {
      const scanner = scannerFake();
      const treffer: Treffer = { quelle: 'dnb', angaben: { titel: 'Gescannt', isbn: '9783551551672', ...angaben } };
      await blatt(await starte(), { barcodeScanner: scanner, isbnSuche: { suchen: async () => [treffer] } });
      await tippe(screen.getByRole('button', { name: 'Buch hinzufügen' }));
      await tippe((await screen.findByRole('menu', { name: 'Buch hinzufügen' }, W)).querySelector('[data-option="barcode"]')!);
      await vi.waitFor(() => expect(scanner.optionen).not.toBeNull(), W);
      await act(async () => {
        scanner.optionen!.beiIsbn('9783551551672');
        await new Promise((r) => setTimeout(r, 30));
      });
      await tippe((await screen.findByRole('dialog', { name: 'Gefundene Bücher' }, W)).querySelector('[data-treffer]')!);
      const d = await screen.findByRole('dialog', { name: 'Manueller Eintrag' }, W);
      expect(within(d).queryAllByLabelText(/^\s*Jahr\s*$/i)).toHaveLength(0);
      expect(norm(d.querySelector('[data-ausgabe-zeile="erschienen"]')!.textContent)).toContain(text);
      await tippe(d.querySelector('[data-ausgabe-zeile="erschienen"]')!);
      await vi.waitFor(() => expect(feld()).not.toBeNull(), W);
      expect(feld()!.value).toBe(text);
    });
  });
});
