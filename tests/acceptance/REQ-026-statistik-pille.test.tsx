/**
 * Akzeptanztests REQ-026 – Statistik-Pille.
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

const teil = (n: 'streak' | 'prozent' | 'sitzungen') => statistik()!.querySelector<HTMLElement>(`[data-${n}]`)!;

describe('REQ-026 Statistik-Pille', () => {
  describe('AK-1 Drei Teile in der Pille', () => {
    it.each([{}, { seitenanzahl: 400, aktuelleSeite: 42 }])('[REQ-026/AK-1] unter dem Lesefortschritt: links Flamme/„Tage in Folge“, Mitte %/„gelesen“, rechts Zahl/„Sitzungen“ (%o)', async (f) => {
      await details(await starte(), buchB(f));
      expect(statistik()).not.toBeNull();
      expect(vor(fortschritt()!, statistik()!)).toBe(true);
      expect(vor(teil('streak'), teil('prozent'))).toBe(true);
      expect(vor(teil('prozent'), teil('sitzungen'))).toBe(true);
      expect(teil('streak').querySelector('[data-flamme]')).not.toBeNull();
      expect(norm(teil('streak').textContent)).toMatch(/^\d+ ?Tage in Folge$/);
      expect(norm(teil('prozent').textContent)).toMatch(/^\d+ ?% ?gelesen$/);
      expect(norm(teil('sitzungen').textContent)).toMatch(/^\d+ ?Sitzungen$/);
      expect(vor(textElement(teil('prozent'), /^\d+ ?%$/), textElement(teil('prozent'), 'gelesen'))).toBe(true);
      expect(vor(textElement(teil('sitzungen'), /^\d+$/), textElement(teil('sitzungen'), 'Sitzungen'))).toBe(true);
    });
  });

  describe('AK-2 Farben und Rahmen', () => {
    const FAELLE: [string, string, Art, () => HTMLElement][] = [
      ['ghost', 'Hintergrund', 'hintergrund', () => mitFlaeche(statistik()!)],
      ['ghostframe', 'Rahmen', 'rahmen', () => mitFlaeche(statistik()!)],
      ['dunkelbraun', 'Prozentzahl', 'text', () => textElement(teil('prozent'), /^\d+ ?%$/)],
      ['dunkelbraun', 'Sitzungszahl', 'text', () => textElement(teil('sitzungen'), /^\d+$/)],
      ['dunkelbraun', '„Tage in Folge“', 'text', () => textElement(teil('streak'), 'Tage in Folge')],
      ['dunkelbraun', '„gelesen“', 'text', () => textElement(teil('prozent'), 'gelesen')],
      ['dunkelbraun', '„Sitzungen“', 'text', () => textElement(teil('sitzungen'), 'Sitzungen')],
    ];
    it.each(FAELLE)('[REQ-026/AK-2] Rubrik „%s“ färbt %s', async (id, wo, art, finde) => {
      const { wurzel } = await details(await starte(), buchB({ seitenanzahl: 400, aktuelleSeite: 42 }));
      expect(ist(finde(), art), wo).toContain(rubrik(wurzel, id));
    });
    it.each(FAELLE)('[REQ-026/AK-2] Änderung der Rubrik „%s“ wirkt auf %s', async (id, wo, art, finde) => {
      await mitRubrik(id, '#0A1B2C', async () => {
        const { wurzel } = await details(await starte(), buchB({ seitenanzahl: 400, aktuelleSeite: 42 }));
        expect(ist(finde(), art), wo).toContain(farbeVon(wurzel, '#0A1B2C'));
      });
    });
    it('[REQ-026/AK-2] Rahmen durchgehend (solid), zwei Trennlinien in „GhostFrame“ zwischen den Teilen', async () => {
      const { wurzel } = await details(await starte(), buchB());
      const p = mitFlaeche(statistik()!);
      expect(getComputedStyle(p).borderTopStyle).toBe('solid');
      const gf = rubrik(wurzel, 'ghostframe');
      const trenner = (a: HTMLElement, b: HTMLElement) => {
        const ca = getComputedStyle(a);
        const cb = getComputedStyle(b);
        if (ca.borderRightStyle === 'solid' && ca.borderRightColor === gf) return true;
        if (cb.borderLeftStyle === 'solid' && cb.borderLeftColor === gf) return true;
        return Array.from(statistik()!.querySelectorAll<HTMLElement>('*')).some(
          (e) => vor(a, e) && vor(e, b) && !a.contains(e) && !b.contains(e) && getComputedStyle(e).backgroundColor === gf,
        );
      };
      expect(trenner(teil('streak'), teil('prozent')), 'Trennlinie links|Mitte').toBe(true);
      expect(trenner(teil('prozent'), teil('sitzungen')), 'Trennlinie Mitte|rechts').toBe(true);
    });
  });

  describe('AK-3 Fortschritt kaufmännisch gerundet', () => {
    it.each([
      [42, 400, '11%'],
      [41, 400, '10%'],
      [2, 400, '1%'],
      [1, 400, '0%'],
      [399, 400, '100%'],
      [400, 400, '100%'],
      [1, 8, '13%'],
    ])('[REQ-026/AK-3] Seite %i von %i → „%s“', async (s, g, erwartet) => {
      await details(await starte(), buchB({ seitenanzahl: g, aktuelleSeite: s, fortschrittsmodus: 'seite' }));
      expect(prozentAnz()).toBe(erwartet);
    });
    it('[REQ-026/AK-3] Fortschritt wird nach dem Sichern sofort aktualisiert (10 → 42 von 400: „11 %“)', async () => {
      await details(await starte(), buchB({ seitenanzahl: 400, aktuelleSeite: 10 }));
      expect(prozentAnz()).toBe('3%');
      await sichereAS('42');
      expect(prozentAnz()).toBe('11%');
    });
  });

  describe('AK-4 Fortschritt im Modus „%“', () => {
    it.each([[5], [0], [100]])('[REQ-026/AK-4] 400 Seiten, Modus „%“ mit %i → „%i %“ (gespeicherte Seite zählt nicht)', async (p) => {
      await details(await starte(), buchB({ seitenanzahl: 400, fortschrittsmodus: 'prozent', fortschrittProzent: p, aktuelleSeite: 200 }));
      expect(prozentAnz()).toBe(`${p}%`);
    });
  });

  describe('AK-5 Ohne Fortschrittsangaben 0 %', () => {
    it.each([
      ['ohne Seitenanzahl', {}],
      ['400 Seiten ohne Fortschritt', { seitenanzahl: 400 }],
      ['ohne Seitenanzahl, aber mit Seite', { aktuelleSeite: 42 }],
      ['Modus „%“ ohne Seitenanzahl mit Prozentwert', { fortschrittsmodus: 'prozent' as const, fortschrittProzent: 30 }],
    ])('[REQ-026/AK-5] %s → „0 %“ und „gelesen“', async (_f, felder) => {
      await details(await starte(), buchB(felder));
      expect(prozentAnz()).toBe('0%');
      expect(textElement(teil('prozent'), 'gelesen')).toBeTruthy();
    });
  });

  describe('AK-6 Sitzungen zählen', () => {
    it('[REQ-026/AK-6] dreimal erhöht, einmal ohne Erhöhung gesichert → 3', async () => {
      const b = buchB({ seitenanzahl: 400, aktuelleSeite: 10 });
      await details(await starte(), b);
      expect(sitzungenAnz()).toBe(0);
      await sichereAS('20');
      await sichereAS('30');
      await sichereAS('30');
      await sichereAS('40');
      expect(sitzungenAnz()).toBe(3);
      cleanup();
      const w = await starte();
      const BD = w.BD;
      render(<BD buchId={b.id} bildspeicher={bilderFake()} onZurueck={() => {}} jetzt={jetzt} />);
      await vi.waitFor(() => expect(sitzungenAnz()).toBe(3));
    });
    it.each([[0], [1], [7]])('[REQ-026/AK-6] gespeicherte %i Sitzungen werden angezeigt', async (n) => {
      const sitzungen = Array.from({ length: n }, (_, i) => ({ zeitpunkt: new Date(2026, 9, 1 + i, 12).toISOString() }));
      await details(await starte(), buchB({ seitenanzahl: 400, aktuelleSeite: 100, sitzungen }));
      expect(sitzungenAnz()).toBe(n);
    });
  });

  describe('AK-7 Kein Zitat', () => {
    it('[REQ-026/AK-7] unter der Statistik-Pille steht kein Text (kein Zitat)', async () => {
      await details(await starte(), buchB({ autor: 'Michael Ende', seitenanzahl: 400, aktuelleSeite: 42 }));
      const s = statistik()!;
      const danach = Array.from(sek().querySelectorAll<HTMLElement>('*')).filter(
        (e) => vor(s, e) && !s.contains(e) && e.children.length === 0 && norm(e.textContent),
      );
      expect(danach.map((e) => norm(e.textContent))).toEqual([]);
      expect(sek().querySelector('blockquote, q, [data-zitat]')).toBeNull();
    });
  });
});
