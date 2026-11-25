/**
 * Akzeptanztests REQ-060 – Manueller Eintrag: Angaben der Karte „Ausgabe“ beim Anlegen, Seitenzahl Pflicht.
 *
 * Abgeleitet aus dem REQ-Text. Schnittstellen laut Entwickler (Sprint 06):
 *  - Zeilen [data-ausgabe-zeile=seiten|format|exemplar|sonderausgabe|preis|verlag|erschienen|isbn|hinzugefuegt]
 *  - Seitenfeld aria-label="Seiten" / [data-seiten-eingabe], Fehler: data-fehler="true" + aria-invalid
 *  - Blattfelder [data-blatt-feld=…], Sichern [data-blatt-sichern=…]; Preis [data-preis-eingabe]/[data-preis-sichern];
 *    Fenster „Format“ [data-fenster-format] mit [data-format-kachel], [data-unterformat], [data-exemplar], [data-format-sichern]
 * „Neustart“: neu geladene Module, neue Repository-Instanz auf derselben IndexedDB (fake-indexeddb).
 */
import '@testing-library/jest-dom/vitest';
import { act, cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { IDBFactory, IDBKeyRange } from 'fake-indexeddb';
import type { ComponentType, CSSProperties } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { Buch } from '@/domain/buch';
import type { BookRepository, ImageStore } from '@/storage';
import { farbrubriken, farbVariablen } from '@/theme';

vi.mock('@/buecher/demodaten', () => ({ demoBuecher: [] }));

type Welt = { repo: BookRepository; bilder: ImageStore; BA: ComponentType<Record<string, unknown>> };
const W = { timeout: 4000 };
// REQ-072: Zeile „Maße“ auch im Manuellen Eintrag direkt unter „Format“ (Anpassung Sprint 07); REQ-112: „Band“ unter „Exemplar“ (Sprint 11)
const ZEILEN = ['seiten', 'format', 'masse', 'exemplar', 'band', 'sonderausgabe', 'preis', 'verlag', 'erschienen', 'isbn', 'hinzugefuegt'];
const NAMEN = ['Seiten', 'Format', 'Maße', 'Exemplar', 'Band', 'Sonderausgabe', 'Preis', 'Verlag', 'Erschienen', 'ISBN', 'Hinzugefügt'];

async function starte(): Promise<Welt> {
  vi.resetModules();
  const st = (await import('@/storage')) as typeof import('@/storage');
  const BA = (await import('@/views/BuecherAnsicht')).default as unknown as ComponentType<Record<string, unknown>>;
  return { repo: st.createBookRepository(), bilder: st.createImageStore(), BA };
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
async function zeige(w: Welt, jetzt?: () => Date) {
  const BA = w.BA;
  render(
    <div data-testwurzel="" style={farbVariablen() as CSSProperties}>
      <BA repository={w.repo} bildspeicher={w.bilder} bildquelle={{ scannen: async () => null, galerie: async () => null }} {...(jetzt ? { jetzt } : {})} />
    </div>,
  );
  await screen.findByRole('heading', { name: 'Deine Bücher' }, W);
}
async function oeffneBlatt() {
  await tippe(screen.getByRole('button', { name: 'Buch hinzufügen' }));
  await tippe(within(await screen.findByRole('menu', { name: 'Buch hinzufügen' }, W)).getByRole('menuitem', { name: /Von Hand eintragen/ }));
  return screen.findByRole('dialog', { name: 'Manueller Eintrag' }, W);
}
const blatt = () => screen.queryByRole('dialog', { name: 'Manueller Eintrag' });
const d = () => screen.getByRole('dialog', { name: 'Manueller Eintrag' });
const feld = (name: string) => within(d()).getByLabelText(new RegExp(`^\\s*${name}\\s*$`, 'i')) as HTMLInputElement;
const gib = (name: string, wert: string) => fireEvent.change(feld(name), { target: { value: wert } });
const zeile = (id: string) => d().querySelector<HTMLElement>(`[data-ausgabe-zeile="${id}"]`);
const norm = (t: string | null | undefined) => (t ?? '').replace(/[\s  ]+/g, ' ').trim();
async function hinzufuegen() {
  await tippe(within(d()).getByRole('button', { name: 'Hinzufügen' }));
  await warte(60);
}
async function blattFeldSichern(id: string, wert: string) {
  await tippe(zeile(id)!);
  const f = await vi.waitFor(() => {
    const e = document.querySelector<HTMLInputElement>(`[data-blatt-feld="${id}"]`);
    expect(e).not.toBeNull();
    return e!;
  }, W);
  fireEvent.change(f, { target: { value: wert } });
  await tippe(document.querySelector(`[data-blatt-sichern="${id}"]`)!);
  await vi.waitFor(() => expect(document.querySelector(`[data-blatt-feld="${id}"]`)).toBeNull(), W);
}
async function preisSichern(wert: string) {
  await tippe(zeile('preis')!);
  const f = await vi.waitFor(() => {
    const e = document.querySelector<HTMLInputElement>('[data-preis-eingabe]');
    expect(e).not.toBeNull();
    return e!;
  }, W);
  fireEvent.change(f, { target: { value: wert } });
  await tippe(document.querySelector('[data-preis-sichern]')!);
  await vi.waitFor(() => expect(document.querySelector('[data-preis-eingabe]')).toBeNull(), W);
}
async function formatSichern(format: string, unterformat: string, exemplar: string) {
  await tippe(zeile('format')!);
  const fe = await vi.waitFor(() => {
    const e = document.querySelector<HTMLElement>('[data-fenster-format]');
    expect(e).not.toBeNull();
    return e!;
  }, W);
  await tippe(fe.querySelector(`[data-format-kachel="${format}"]`)!);
  await tippe(fe.querySelector(`[data-unterformat="${unterformat}"]`)!);
  await tippe(fe.querySelector(`[data-exemplar="${exemplar}"]`)!);
  await tippe(fe.querySelector('[data-format-sichern]')!);
  await vi.waitFor(() => expect(document.querySelector('[data-fenster-format]')).toBeNull(), W);
}
const finde = async (repo: BookRepository, titel: string) => (await repo.list()).filter((b) => b.titel === titel);
const lokalesDatum = (iso: string | undefined) => {
  const x = new Date(iso!);
  return `${String(x.getDate()).padStart(2, '0')}.${String(x.getMonth() + 1).padStart(2, '0')}.${x.getFullYear()}`;
};

function farbeVon(ausdruck: string) {
  const ctx = document.querySelector<HTMLElement>('[data-testwurzel]') ?? document.body;
  const p = document.createElement('span');
  p.style.setProperty('color', ausdruck);
  ctx.appendChild(p);
  const w = getComputedStyle(p).color;
  p.remove();
  return w;
}
/** Ist das Seitenfeld (oder seine Zeile) in Primär hervorgehoben? */
function seitenInPrimaer() {
  const primaer = farbeVon(farbrubriken.primaer.wert);
  const z = zeile('seiten')!;
  const els = [z, ...Array.from(z.querySelectorAll<HTMLElement>('*'))];
  return els.some((e) => {
    const cs = getComputedStyle(e);
    return [cs.color, cs.borderTopColor, cs.borderBottomColor, cs.outlineColor, cs.boxShadow].some((w) => w.includes(primaer));
  });
}
const seitenMarkiert = () => feld('Seiten').getAttribute('data-fehler') === 'true' || zeile('seiten')!.getAttribute('data-fehler') === 'true';

beforeEach(() => {
  vi.stubGlobal('indexedDB', new IDBFactory());
  vi.stubGlobal('IDBKeyRange', IDBKeyRange);
});
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe('REQ-060 Manueller Eintrag mit Angaben der Karte „Ausgabe“', () => {
  it('[REQ-060/AK-1] das Blatt enthält zusätzlich die Zeilen Seiten bis Hinzugefügt in dieser Reihenfolge, ohne „Fotos“', async () => {
    await zeige(await starte());
    await oeffneBlatt();
    const els = Array.from(d().querySelectorAll('[data-ausgabe-zeile]'));
    // Zeile „Band“ (REQ-112) wird an ihrer Bezeichnung erkannt (Kennung legt der Entwickler fest).
    const ids = els.map((e) => (/^Band\b/.test(norm(e.textContent)) ? 'band' : e.getAttribute('data-ausgabe-zeile')));
    expect(ids).toEqual(ZEILEN);
    els.forEach((e, i) => expect(norm(e.textContent), ZEILEN[i]).toContain(NAMEN[i]));
    expect(d().querySelector('[data-ausgabe-zeile="fotos"]')).toBeNull();
    expect(d().textContent).not.toMatch(/Fotos/);
    // bisheriger Inhalt bleibt
    for (const n of ['Titel', 'Autor']) expect(feld(n)).toBeInTheDocument();
    expect(d().querySelector('[data-cover-hinzufuegen]')).not.toBeNull();
    expect(within(d()).getByRole('button', { name: 'Hinzufügen' })).toBeInTheDocument();
  });

  it('[REQ-060/AK-2] genau eine Eingabe für die Seitenanzahl und genau eine Zeile „Erschienen“; „Erscheinungsdatum“ kommt nicht vor', async () => {
    await zeige(await starte());
    await oeffneBlatt();
    expect(within(d()).getAllByLabelText(/^\s*Seiten\s*$/i)).toHaveLength(1);
    expect(d().querySelectorAll('[data-seiten-eingabe]')).toHaveLength(1);
    expect(Array.from(d().querySelectorAll('*')).filter((e) => /^\s*SEITEN\s*$/i.test(e.textContent ?? '') && e.children.length === 0)).toHaveLength(1);
    expect(d().querySelectorAll('[data-ausgabe-zeile="erschienen"]')).toHaveLength(1);
    expect(d().textContent).not.toMatch(/Erscheinungsdatum/i);
    // Seit REQ-092 (2026-11-23): das Feld „JAHR“ entfällt (Anforderungstext REQ-060 angepasst).
    expect(within(d()).queryAllByLabelText(/^\s*Jahr\s*$/i)).toHaveLength(0);
  });

  it.each([
    ['15032021', '15.03.2021'],
    ['15.03.2021', '15.03.2021'],
    ['29022024', '29.02.2024'],
  ])('[REQ-060/AK-3] „Erschienen“ %s eingegeben → Buch hat Erscheinungsdatum %s', async (eingabe, datum) => {
    const w = await starte();
    await zeige(w);
    await oeffneBlatt();
    gib('Titel', 'Mit Datum');
    gib('Seiten', '200');
    await blattFeldSichern('erschienen', eingabe);
    expect(norm(zeile('erschienen')!.textContent)).toContain(datum);
    await hinzufuegen();
    await screen.findByRole('region', { name: 'Buchdetails' }, W);
    const [b] = await finde(w.repo, 'Mit Datum');
    expect(b.erscheinungsdatum).toBe(datum);
  });

  it('[REQ-060/AK-3] Negativfall: nicht existierendes Datum 31.02.2021 wird nicht als Erscheinungsdatum gespeichert', async () => {
    const w = await starte();
    await zeige(w);
    await oeffneBlatt();
    gib('Titel', 'Falsches Datum');
    gib('Seiten', '200');
    await tippe(zeile('erschienen')!);
    const f = await vi.waitFor(() => {
      const e = document.querySelector<HTMLInputElement>('[data-blatt-feld="erschienen"]');
      expect(e).not.toBeNull();
      return e!;
    }, W);
    fireEvent.change(f, { target: { value: '31.02.2021' } });
    await tippe(document.querySelector('[data-blatt-sichern="erschienen"]')!);
    expect(document.querySelector('[data-blatt-feld="erschienen"]'), 'Blatt bleibt offen').not.toBeNull();
    const dlg = document.querySelector('[data-blatt-feld="erschienen"]')!.closest('[role="dialog"]')!;
    await tippe(dlg.querySelector('[aria-label="Schließen"]')!);
    await hinzufuegen();
    const [b] = await finde(w.repo, 'Falsches Datum');
    expect(b?.erscheinungsdatum).toBeUndefined();
  });

  it('[REQ-060/AK-4] Titel, Seiten 320, Format, Exemplar, Preis 12,99 €, Verlag, ISBN: Karte „Ausgabe“ im Reiter „Details“ zeigt sie, auch nach Neustart', async () => {
    const w = await starte();
    await zeige(w);
    await oeffneBlatt();
    gib('Titel', 'Voll');
    gib('Seiten', '320');
    await formatSichern('print', 'taschenbuch', 'meins');
    await preisSichern('12,99');
    await blattFeldSichern('verlag', 'Carlsen');
    await blattFeldSichern('isbn', '9783551551672');
    await hinzufuegen();
    await screen.findByRole('region', { name: 'Buchdetails' }, W);
    const [b] = await finde(w.repo, 'Voll');
    expect(b).toMatchObject({ seitenanzahl: 320, format: 'print', unterformat: 'taschenbuch', exemplar: 'meins', preisCent: 1299, verlag: 'Carlsen', isbn: '9783551551672' });

    const pruefeDetails = async () => {
      const det = await screen.findByRole('region', { name: 'Buchdetails' }, W);
      const tab = await vi.waitFor(() => {
        const t = det.querySelector<HTMLElement>('[data-reiter="details"]');
        expect(t).not.toBeNull();
        return t!;
      }, W);
      await tippe(tab);
      const ber = await vi.waitFor(() => {
        const x = det.querySelector<HTMLElement>('[data-reiter-bereich="details"]');
        expect(x).not.toBeNull();
        return x!;
      }, W);
      const wert = (id: string) => norm(ber.querySelector(`[data-ausgabe-zeile="${id}"] [data-zeile-wert]`)?.textContent);
      expect(wert('seiten')).toBe('320');
      expect(wert('format')).toMatch(/Print/);
      expect(wert('format')).toMatch(/Taschenbuch/);
      expect(wert('exemplar')).toBe('Meins');
      expect(wert('preis')).toBe('12,99 €');
      expect(wert('verlag')).toBe('Carlsen');
      expect(wert('isbn')).toBe('9783551551672');
    };
    await pruefeDetails();

    // Neustart: Buch aus der Liste öffnen
    cleanup();
    const w2 = await starte();
    const [b2] = await finde(w2.repo, 'Voll');
    expect(b2).toEqual(b);
    await zeige(w2);
    const titel = await screen.findAllByText('Voll', {}, W);
    await tippe(titel[0]);
    await pruefeDetails();
  });

  it('[REQ-060/AK-4] leer gelassene optionale Angaben werden nicht gespeichert', async () => {
    const w = await starte();
    await zeige(w);
    await oeffneBlatt();
    gib('Titel', 'Schlank');
    gib('Seiten', '50');
    await hinzufuegen();
    const [b] = await finde(w.repo, 'Schlank');
    for (const k of ['format', 'unterformat', 'exemplar', 'sonderausgabe', 'preisCent', 'verlag', 'isbn', 'erscheinungsdatum']) {
      expect(b, k).not.toHaveProperty(k);
    }
  });

  it.each([
    ['leer', ''],
    ['nur Buchstaben', 'abc'],
  ])('[REQ-060/AK-5] Seiten %s: kein Buch, Feld in Primär markiert, kein Hinweistext, Blatt offen, Eingaben unverändert', async (_f, seiten) => {
    const w = await starte();
    await zeige(w);
    await oeffneBlatt();
    gib('Titel', 'Ohne Seiten');
    gib('Autor', 'Jemand');
    gib('Seiten', seiten);
    await blattFeldSichern('verlag', 'Carlsen');
    expect(seitenMarkiert(), 'vor „Hinzufügen“ nicht markiert').toBe(false);
    expect(seitenInPrimaer(), 'vor „Hinzufügen“ nicht in Primär').toBe(false);
    const textVorher = d().textContent;
    await hinzufuegen();
    expect(await w.repo.list()).toEqual([]);
    expect(blatt()).toBeVisible();
    expect(screen.queryByRole('region', { name: 'Buchdetails' })).toBeNull();
    expect(seitenMarkiert()).toBe(true);
    expect(feld('Seiten')).toHaveAttribute('aria-invalid', 'true');
    expect(seitenInPrimaer()).toBe(true);
    expect(screen.queryByRole('alert')).toBeNull();
    expect(d().textContent, 'kein Hinweistext').toBe(textVorher);
    expect([feld('Titel').value, feld('Autor').value, feld('Seiten').value]).toEqual(['Ohne Seiten', 'Jemand', '']);
    expect(norm(zeile('verlag')!.textContent)).toContain('Carlsen');
  });

  it('[REQ-060/AK-5] ohne Titel und ohne Seiten: Titel-Hinweis und Seiten markiert, kein Buch', async () => {
    const w = await starte();
    await zeige(w);
    await oeffneBlatt();
    await hinzufuegen();
    expect(screen.getByRole('alert')).toHaveTextContent('Bitte gib einen Titel ein');
    expect(seitenMarkiert()).toBe(true);
    expect(await w.repo.list()).toEqual([]);
  });

  it.each(['1', '12'])('[REQ-060/AK-6] markiertes Seitenfeld: Eingabe „%s“ hebt die Markierung auf', async (eingabe) => {
    await zeige(await starte());
    await oeffneBlatt();
    gib('Titel', 'X');
    await hinzufuegen();
    expect(seitenMarkiert()).toBe(true);
    gib('Seiten', eingabe);
    expect(seitenMarkiert()).toBe(false);
    expect(feld('Seiten')).not.toHaveAttribute('aria-invalid', 'true');
    expect(seitenInPrimaer()).toBe(false);
  });

  it('[REQ-060/AK-6] nach Aufheben markiert ein erneutes „Hinzufügen“ ohne Seiten wieder', async () => {
    await zeige(await starte());
    await oeffneBlatt();
    gib('Titel', 'X');
    await hinzufuegen();
    gib('Seiten', '5');
    gib('Seiten', '');
    expect(seitenMarkiert()).toBe(false);
    await hinzufuegen();
    expect(seitenMarkiert()).toBe(true);
  });

  it.each([
    ['1', 1],
    ['320', 320],
  ])('[REQ-060/AK-7] nur Titel und Seiten %s: Buch mit Titel, Seitenanzahl %i, „ungelesen“, Buchdetails', async (eingabe, zahl) => {
    const w = await starte();
    await zeige(w);
    await oeffneBlatt();
    gib('Titel', 'Knapp');
    gib('Seiten', eingabe);
    await hinzufuegen();
    await screen.findByRole('region', { name: 'Buchdetails' }, W);
    const b = await finde(w.repo, 'Knapp');
    expect(b).toHaveLength(1);
    expect(b[0]).toMatchObject({ titel: 'Knapp', seitenanzahl: zahl, status: 'ungelesen' });
    expect(blatt()).toBeNull();
  });

  it('[REQ-060/AK-8] „Hinzugefügt“ nicht geändert: Eintragungsdatum = Zeitpunkt des Anlegens; Zeile zeigt den heutigen Tag', async () => {
    const zeitpunkt = new Date(2026, 10, 17, 9, 30, 0);
    const w = await starte();
    await zeige(w, () => zeitpunkt);
    await oeffneBlatt();
    expect(norm(zeile('hinzugefuegt')!.textContent)).toContain('17.11.2026');
    gib('Titel', 'Heute');
    gib('Seiten', '10');
    await hinzufuegen();
    const [b] = await finde(w.repo, 'Heute');
    expect(Date.parse(b.eingetragenAm!)).toBe(zeitpunkt.getTime());
  });

  it('[REQ-060/AK-9] „Hinzugefügt“ auf 01.02.2025 überschrieben: gespeichertes Eintragungsdatum ist der 01.02.2025', async () => {
    const zeitpunkt = new Date(2026, 10, 17, 9, 30, 0);
    const w = await starte();
    await zeige(w, () => zeitpunkt);
    await oeffneBlatt();
    gib('Titel', 'Früher');
    gib('Seiten', '10');
    await blattFeldSichern('hinzugefuegt', '01022025');
    expect(norm(zeile('hinzugefuegt')!.textContent)).toContain('01.02.2025');
    await hinzufuegen();
    await screen.findByRole('region', { name: 'Buchdetails' }, W);
    const [b] = await finde(w.repo, 'Früher');
    expect(lokalesDatum(b.eingetragenAm)).toBe('01.02.2025');
    cleanup();
    const w2 = await starte();
    const [b2] = await finde(w2.repo, 'Früher');
    expect(lokalesDatum(b2.eingetragenAm)).toBe('01.02.2025');
  });

  it('[REQ-060/AK-10] Titel, Seiten und Verlag eingetragen, X: kein Buch, nichts gespeichert; neu geöffnet ist alles leer', async () => {
    const w = await starte();
    await zeige(w);
    await oeffneBlatt();
    gib('Titel', 'Verworfen');
    gib('Seiten', '99');
    await blattFeldSichern('verlag', 'Carlsen');
    await tippe(within(d()).getAllByRole('button', { name: 'Schließen' })[0]);
    await vi.waitFor(() => expect(blatt()).toBeNull(), W);
    expect(screen.getByRole('heading', { name: 'Deine Bücher' })).toBeVisible();
    expect(await w.repo.list()).toEqual([]);
    await oeffneBlatt();
    expect(feld('Titel').value).toBe('');
    expect(feld('Seiten').value).toBe('');
    expect(norm(zeile('verlag')!.textContent)).not.toContain('Carlsen');
  });
});

void ({} as Buch);
