/**
 * Akzeptanztests REQ-028 – Autor unter dem Buchtitel.
 *
 * Abgeleitet aus dem REQ-Text und der Schnittstellen-Absprache Teil B (sprints/sprint-04/plan.md).
 * Zeit über die Prop `jetzt` von BuchDetails, Speicher = Standard-Speicher der App auf fake-indexeddb,
 * „Neustart“ = Module neu laden (wie REQ-034). Optik, Animation und echtes Layout: manuelle Prüfliste.
 */
import '@testing-library/jest-dom/vitest';
import { act, cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { IDBFactory, IDBKeyRange } from 'fake-indexeddb';
import type { ComponentType, CSSProperties } from 'react';
import { afterAll, afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { Buch } from '@/domain/buch';
import type { BookRepository, ImageStore } from '@/storage';
import { farbrubriken, farbVariablen } from '@/theme';

// ----------------------------------------------------------------------------- gemeinsamer Aufbau Teil B
// Speicher: Standard-Speicher der App (IndexedDB, hier fake-indexeddb). „Neustart“ = Module neu laden,
// neue Speicher-Instanzen auf derselben IndexedDB (wie REQ-034). Keine Demodaten.
vi.mock('@/buecher/demodaten', () => ({ demoBuecher: [] }));

type Modus = 'seite' | 'prozent';
type BuchB = Buch & { aktuelleSeite?: number; fortschrittProzent?: number; fortschrittsmodus?: Modus; sitzungen?: { zeitpunkt: string }[] };
type Welt = { repo: BookRepository; BD: ComponentType<Record<string, unknown>>; BA: ComponentType<Record<string, unknown>> };
type Art = 'text' | 'hintergrund' | 'rahmen' | 'icon';

const rubriken = farbrubriken as unknown as Record<string, { wert: string }>;
const uuid = () => crypto.randomUUID();
const buchB = (felder: Partial<BuchB> = {}): BuchB => ({ id: uuid(), titel: 'Testbuch', status: 'ungelesen', ...felder });

let uhr = new Date(2026, 10, 12, 10, 0, 0);
const jetzt = () => new Date(uhr.getTime());
const stelleUhr = (d: Date) => {
  uhr = new Date(d.getTime());
};

function bilderFake() {
  const daten = new Map<string, string>();
  const s = {
    get: async (id: string, b: string) => daten.get(`${id}|${b}`),
    put: async (id: string, b: string, d: string) => void daten.set(`${id}|${b}`, d),
    remove: async (id: string, b: string) => void daten.delete(`${id}|${b}`),
  };
  return s as typeof s & ImageStore;
}

/** Lädt Speicher und Ansichten neu (wie ein Neustart der App) – auf derselben IndexedDB. */
async function starte(): Promise<Welt> {
  vi.resetModules();
  const st = (await import('@/storage')) as typeof import('@/storage');
  const BD = (await import('@/views/BuchDetails')).default as unknown as ComponentType<Record<string, unknown>>;
  const BA = (await import('@/views/BuecherAnsicht')).default as unknown as ComponentType<Record<string, unknown>>;
  return { repo: st.createBookRepository(), BD, BA };
}
async function warte(ms = 30) {
  await act(async () => {
    await new Promise((r) => setTimeout(r, ms));
  });
}
/** Legt das Buch im Speicher an und zeigt seine Buchdetails (geladen über die ID; optional mit Buch-Prop). */
async function details(w: Welt, buch: BuchB, mitBuch = false) {
  await w.repo.save(buch as Buch);
  const BD = w.BD;
  const extra = mitBuch ? { buch } : {};
  const { container } = render(
    <div data-testwurzel="" style={farbVariablen() as CSSProperties}>
      <BD buchId={buch.id} {...extra} bildquelle={{ scannen: async () => null, galerie: async () => null }} bildspeicher={bilderFake()} onZurueck={() => {}} jetzt={jetzt} />
    </div>,
  );
  const d = await screen.findByRole('region', { name: 'Buchdetails' });
  await vi.waitFor(() => expect(d.querySelector('[data-statuspille]')).not.toBeNull());
  await warte(10);
  return { d, wurzel: container.firstElementChild as HTMLElement };
}
/** Neustart und Buch frisch aus dem Speicher lesen. */
async function gespeichert(id: string): Promise<BuchB | undefined> {
  cleanup();
  const w = await starte();
  return (await w.repo.get(id)) as BuchB | undefined;
}
async function tippe(el: Element) {
  await act(async () => {
    fireEvent.click(el);
    await new Promise((r) => setTimeout(r, 20));
  });
}
const norm = (t: string | null | undefined) => (t ?? '').replace(/[\s  ]+/g, ' ').trim();
const sek = () => screen.getByRole('region', { name: 'Buchdetails' });
const pille = () => sek().querySelector<HTMLElement>('[data-statuspille]')!;
const statusmenue = () => screen.queryByRole('menu', { name: 'Status wählen' });
const blattAS = () => screen.queryByRole('dialog', { name: 'Aktuelle Seite' });
const blattBL = () => screen.queryByRole('dialog', { name: 'Buchlänge' });
const fortschritt = () => sek().querySelector<HTMLElement>('[data-fortschritt]');
const balken = () => sek().querySelector<HTMLElement>('[role="progressbar"]');
const ftext = () => sek().querySelector<HTMLElement>('[data-fortschritt-text]');
const herz = () => sek().querySelector<HTMLElement>('[data-fortschritt-herz]');
const statistik = () => sek().querySelector<HTMLElement>('[data-statistik]');
/** Eingabefeld eines Blatts über seine Beschriftung (das Blatt selbst trägt ggf. denselben Namen). */
function eingabe(dlg: HTMLElement, name: string) {
  const e = within(dlg).queryAllByLabelText(name).find((x) => x.tagName === 'INPUT');
  if (!e) throw new Error(`kein Eingabefeld „${name}“`);
  return e as HTMLInputElement;
}
const gib = (el: HTMLInputElement, wert: string) => fireEvent.change(el, { target: { value: wert } });
const knopf = (dlg: HTMLElement, name: string) => within(dlg).getByRole('button', { name });
/** Öffnet das Menü „Aktuelle Seite“ über den Balken. */
async function oeffneAS() {
  await tippe(balken()!);
  return (await screen.findByRole('dialog', { name: 'Aktuelle Seite' })) as HTMLElement;
}
/** Sichert im Menü „Aktuelle Seite“ einen Wert (im aktuell gewählten Modus). */
async function sichereAS(wert: string, modusWahl?: 'Seite' | '%') {
  const dlg = await oeffneAS();
  if (modusWahl) await tippe(knopf(dlg, modusWahl));
  gib(eingabe(dlg, modusWahl === '%' ? 'Prozent' : istProzent(dlg) ? 'Prozent' : 'Aktuelle Seite'), wert);
  await tippe(knopf(dlg, 'Sichern'));
  await warte();
}
const istProzent = (dlg: HTMLElement) => knopf(dlg, '%').getAttribute('aria-pressed') === 'true';
/** Ganze Zahl, die als eigenes Blatt-Element in einem Bereich steht. */
function zahlIn(el: HTMLElement | null, muster = /^\d+$/) {
  if (!el) throw new Error('Bereich fehlt');
  const k = [el, ...Array.from(el.querySelectorAll<HTMLElement>('*'))].filter((e) => muster.test(norm(e.textContent)));
  if (!k.length) throw new Error(`keine Zahl in ${el.outerHTML.slice(0, 200)}`);
  return norm(k[k.length - 1].textContent);
}
const streak = () => Number(zahlIn(sek().querySelector('[data-streak]')));
const sitzungenAnz = () => Number(zahlIn(sek().querySelector('[data-sitzungen]')));
const prozentAnz = () => zahlIn(sek().querySelector('[data-prozent]'), /^\d+ ?%$/).replace(' ', '');
function textElement(root: HTMLElement, text: string | RegExp) {
  const passt = (t: string) => (typeof text === 'string' ? t === text : text.test(t));
  const k = [root, ...Array.from(root.querySelectorAll<HTMLElement>('*'))].filter((e) => passt(norm(e.textContent)));
  expect(k.length, `kein Element mit Text ${String(text)}`).toBeGreaterThan(0);
  return k.find((c) => !k.some((o) => o !== c && c.contains(o)))!;
}
const vor = (a: Node, b: Node) => Boolean(a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING);
const TRANSPARENT = /^(|transparent|rgba\(0, 0, 0, 0\))$/;
function mitFlaeche(start: HTMLElement, abwaerts = true): HTMLElement {
  const kand = abwaerts ? [start, ...Array.from(start.querySelectorAll<HTMLElement>('*'))] : [];
  if (!abwaerts) for (let n: HTMLElement | null = start; n; n = n.parentElement) kand.push(n);
  const t = kand.find((n) => !TRANSPARENT.test(getComputedStyle(n).backgroundColor));
  if (!t) throw new Error('kein Element mit Fläche gefunden');
  return t;
}
function farbeVon(ctx: HTMLElement, ausdruck: string) {
  const p = document.createElement('span');
  p.style.setProperty('color', ausdruck);
  ctx.appendChild(p);
  const w = getComputedStyle(p).color;
  p.remove();
  return w;
}
function ist(el: HTMLElement, art: Art) {
  const cs = getComputedStyle(el);
  if (art === 'text') return [cs.color];
  if (art === 'hintergrund') return [cs.backgroundColor];
  if (art === 'rahmen') return [cs.borderTopColor];
  return [cs.backgroundColor, cs.color];
}
const rubrik = (wurzel: HTMLElement, id: string) => farbeVon(wurzel, rubriken[id].wert);
/** Führt fn mit geändertem Standardwert einer Rubrik aus und stellt ihn danach wieder her. */
async function mitRubrik(id: string, wert: string, fn: () => Promise<void>) {
  const alt = rubriken[id].wert;
  rubriken[id].wert = wert;
  try {
    await fn();
  } finally {
    rubriken[id].wert = alt;
  }
}

beforeEach(() => {
  vi.stubGlobal('indexedDB', new IDBFactory());
  vi.stubGlobal('IDBKeyRange', IDBKeyRange);
  stelleUhr(new Date(2026, 10, 12, 10, 0, 0));
});
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});
// ----------------------------------------------------------------------------- Ende gemeinsamer Aufbau
// Nicht jede Datei nutzt jede Hilfsfunktion (noUnusedLocals).
void [afterAll, act, fireEvent, render, screen, within, describe, it, buchB, stelleUhr, details, gespeichert, tippe, norm, pille, statusmenue, blattAS, blattBL, fortschritt, balken, ftext, herz, statistik, eingabe, gib, knopf, oeffneAS, sichereAS, streak, sitzungenAnz, prozentAnz, textElement, vor, mitFlaeche, ist, rubrik, mitRubrik];

const autor = () => sek().querySelector<HTMLElement>('[data-buchdetails-autor]');
const titel = () => sek().querySelector<HTMLElement>('[data-buchdetails-titel]')!;
/** Elemente mit eigenem Text zwischen a und b (in Dokumentreihenfolge). */
const textZwischen = (a: Element, b: Element) =>
  Array.from(sek().querySelectorAll<HTMLElement>('*')).filter(
    (e) => vor(a, e) && vor(e, b) && !a.contains(e) && !e.contains(b) && e.children.length === 0 && norm(e.textContent),
  );
const LANG = 'Maximiliane Konstantina Friederike von Hohenlohe-Schillingsfürst-Waldenburg-Bartenstein';

describe('REQ-028 Autor unter dem Buchtitel', () => {
  describe('AK-1 Autor unter dem Titel', () => {
    it.each([false, true])('[REQ-028/AK-1] „Michael Ende“ steht direkt unter dem Titel, darunter die Statuspille (Buch-Prop: %s)', async (mitBuch) => {
      await details(await starte(), buchB({ titel: 'Momo', autor: 'Michael Ende' }), mitBuch);
      expect(norm(autor()?.textContent)).toBe('Michael Ende');
      expect(vor(titel(), autor()!)).toBe(true);
      expect(vor(autor()!, pille())).toBe(true);
      expect(textZwischen(titel(), autor()!)).toEqual([]);
      expect(textZwischen(autor()!, pille())).toEqual([]);
    });
    it('[REQ-028/AK-1] Reihenfolge wird nicht umgestellt („Vorname Nachname“ bleibt so)', async () => {
      await details(await starte(), buchB({ autor: 'Cornelia Funke' }));
      expect(norm(autor()?.textContent)).toBe('Cornelia Funke');
      expect(autor()!.textContent).not.toMatch(/,/);
    });
  });

  describe('AK-2 Einzelner Name', () => {
    it.each(['Moebius', 'Banksy'])('[REQ-028/AK-2] „%s“ steht genau so unter dem Titel', async (name) => {
      await details(await starte(), buchB({ autor: name }));
      expect(norm(autor()?.textContent)).toBe(name);
    });
  });

  describe('AK-3 Eine Zeile', () => {
    it('[REQ-028/AK-3] langer Autor: eine Zeile, abgeschnitten mit „…“; Titel weiter höchstens zwei Zeilen', async () => {
      await details(await starte(), buchB({ titel: 'Ein sehr langer Titel '.repeat(6), autor: LANG }));
      const cs = getComputedStyle(autor()!);
      expect(cs.whiteSpace).toBe('nowrap');
      expect(cs.overflow === 'hidden' || cs.overflowX === 'hidden').toBe(true);
      expect(cs.textOverflow).toBe('ellipsis');
      expect(norm(autor()!.textContent)).toBe(LANG);
      const ct = getComputedStyle(titel());
      expect(ct.getPropertyValue('-webkit-line-clamp') || ct.getPropertyValue('line-clamp')).toMatch(/^2\b/);
    });
  });

  describe('AK-4 Kleinere Schrift als der Titel', () => {
    it('[REQ-028/AK-4] Schriftgröße Autor < Schriftgröße Titel', async () => {
      await details(await starte(), buchB({ autor: 'Michael Ende' }));
      const a = parseFloat(getComputedStyle(autor()!).fontSize);
      const t = parseFloat(getComputedStyle(titel()).fontSize);
      expect(a).toBeGreaterThan(0);
      expect(a).toBeLessThan(t);
    });
  });

  describe('AK-5 Farbe Tertiär aus zentraler Farbrubrik', () => {
    it('[REQ-028/AK-5] Autor in „Tertiär“; nach Änderung von „Tertiär“ im neuen Wert', async () => {
      const { wurzel } = await details(await starte(), buchB({ autor: 'Michael Ende' }));
      expect(ist(autor()!, 'text')).toContain(rubrik(wurzel, 'tertiaer'));
      cleanup();
      await mitRubrik('tertiaer', '#0A1B2C', async () => {
        const { wurzel: w2 } = await details(await starte(), buchB({ autor: 'Michael Ende' }));
        expect(ist(autor()!, 'text')).toContain(farbeVon(w2, '#0A1B2C'));
      });
    });
  });

  describe('AK-6 Buch ohne Autor', () => {
    it('[REQ-028/AK-6] keine Autorzeile, kein Platzhaltertext, Statuspille folgt direkt auf den Titel', async () => {
      await details(await starte(), buchB({ titel: 'Momo' }));
      expect(autor()).toBeNull();
      expect(textZwischen(titel(), pille())).toEqual([]);
    });
    it('[REQ-028/AK-6] über „Von Hand eintragen“ ohne Autor angelegt: keine Autorzeile', async () => {
      const w = await starte();
      const BA = w.BA;
      render(<BA bildspeicher={bilderFake()} bildquelle={{ scannen: async () => null, galerie: async () => null }} />);
      await screen.findByRole('heading', { name: 'Deine Bücher' });
      fireEvent.click(screen.getByRole('button', { name: 'Buch hinzufügen' }));
      fireEvent.click(within(await screen.findByRole('menu', { name: 'Buch hinzufügen' })).getByRole('menuitem'));
      const d = await screen.findByRole('dialog', { name: 'Manueller Eintrag' });
      fireEvent.change(within(d).getByLabelText(/^\s*Titel\s*$/i), { target: { value: 'Ohne Autor' } });
      await tippe(within(d).getByRole('button', { name: 'Hinzufügen' }));
      await screen.findByRole('region', { name: 'Buchdetails' });
      await vi.waitFor(() => expect(pille()).not.toBeNull());
      expect(autor()).toBeNull();
      expect(textZwischen(titel(), pille())).toEqual([]);
    });
  });
});
