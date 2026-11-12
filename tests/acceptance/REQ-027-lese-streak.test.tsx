/**
 * Akzeptanztests REQ-027 – Lese-Streak.
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

// Tageswechsel nach lokaler Gerätezeit: Zeitzone mit Abstand zu UTC, damit eine Rechnung in UTC auffällt.
const env = (globalThis as unknown as { process: { env: Record<string, string | undefined> } }).process.env;
const TZ_ALT = env.TZ;
// Sofort setzen (nicht in beforeAll), da die Tabellen der it.each-Fälle schon beim Einlesen Daten bilden.
env.TZ = 'Europe/Berlin';
afterAll(() => {
  if (TZ_ALT === undefined) delete env.TZ;
  else env.TZ = TZ_ALT;
});

/** Lokaler Zeitpunkt relativ zum „Heute“ des Tests (12.11.2026). */
const tag = (versatz: number, h = 12, m = 0) => new Date(2026, 10, 12 + versatz, h, m);
const s = (...d: Date[]) => d.map((x) => ({ zeitpunkt: x.toISOString() }));
const flamme = () => sek().querySelector<HTMLElement>('[data-streak] [data-flamme], [data-streak][data-flamme]')!;
async function zeigeMit(sitzungen: { zeitpunkt: string }[], heute = tag(0, 15)) {
  stelleUhr(heute);
  const b = buchB({ seitenanzahl: 400, aktuelleSeite: 50, sitzungen });
  const r = await details(await starte(), b);
  return { b, ...r };
}

describe('REQ-027 Lese-Streak', () => {
  it('[REQ-027] Zeitzone des Tests ist aktiv (Voraussetzung für AK-6)', () => {
    expect(new Date(2026, 10, 12, 0, 30).getTimezoneOffset()).toBe(-60);
  });

  describe('AK-1 Ein Lesetag ergibt 1', () => {
    it('[REQ-027/AK-1] ohne Sitzung: 0; heute erhöhen und sichern → 1', async () => {
      await zeigeMit([]);
      expect(streak()).toBe(0);
      await sichereAS('60');
      expect(streak()).toBe(1);
      expect(flamme().getAttribute('data-flamme')).toBe('aktiv');
    });
  });

  describe('AK-2 Aufeinanderfolgende Tage zählen hoch', () => {
    it.each([
      ['gestern und heute', [tag(-1), tag(0, 9)], 2],
      ['fünf Tage am Stück bis heute', [tag(-4), tag(-3), tag(-2), tag(-1), tag(0, 9)], 5],
      ['Lücke vor vorgestern zählt nicht mit', [tag(-5), tag(-4), tag(-2), tag(-1), tag(0, 9)], 3],
      ['unsortiert gespeichert', [tag(0, 9), tag(-2), tag(-1)], 3],
    ] as const)('[REQ-027/AK-2] %s → %i', async (_f, d, n) => {
      await zeigeMit(s(...d));
      expect(streak()).toBe(n);
    });
    it('[REQ-027/AK-2] gestern gelesen, heute erhöht gesichert → 2', async () => {
      await zeigeMit(s(tag(-1)));
      expect(streak()).toBe(1);
      await sichereAS('70');
      expect(streak()).toBe(2);
    });
  });

  describe('AK-3 Mehrere Sitzungen an einem Tag zählen einmal', () => {
    it('[REQ-027/AK-3] heute drei Sitzungen, davor keine → 1', async () => {
      await zeigeMit(s(tag(0, 8), tag(0, 11), tag(0, 14)));
      expect(streak()).toBe(1);
      expect(sitzungenAnz()).toBe(3);
    });
    it('[REQ-027/AK-3] über die Oberfläche dreimal am selben Tag erhöht → 1, Sitzungen 3', async () => {
      await zeigeMit([]);
      await sichereAS('60');
      await sichereAS('70');
      await sichereAS('80');
      expect(streak()).toBe(1);
      expect(sitzungenAnz()).toBe(3);
    });
    it('[REQ-027/AK-3] gestern zwei, heute zwei Sitzungen → 2', async () => {
      await zeigeMit(s(tag(-1, 8), tag(-1, 20), tag(0, 8), tag(0, 9)));
      expect(streak()).toBe(2);
    });
  });

  describe('AK-4 Streak bleibt bis zum Ende des Folgetags', () => {
    it.each([
      ['heute 15:00', tag(0, 15)],
      ['heute 00:00:30', new Date(2026, 10, 12, 0, 0, 30)],
      ['heute 23:59:59', new Date(2026, 10, 12, 23, 59, 59)],
    ])('[REQ-027/AK-4] vorgestern und gestern gelesen, heute nicht, angezeigt %s → 2', async (_f, heute) => {
      await zeigeMit(s(tag(-2), tag(-1)), heute);
      expect(streak()).toBe(2);
    });
  });

  describe('AK-5 Verpasster Tag setzt auf 0', () => {
    it.each([
      ['vorgestern 12:00, angezeigt heute 15:00', [tag(-2)], tag(0, 15)],
      ['vorgestern 23:59, angezeigt heute 00:01', [tag(-2, 23, 59)], new Date(2026, 10, 12, 0, 1)],
      ['lange Serie bis vorgestern', [tag(-6), tag(-5), tag(-4), tag(-3), tag(-2)], tag(0, 15)],
    ] as const)('[REQ-027/AK-5] %s → 0, Flamme inaktiv', async (_f, d, heute) => {
      await zeigeMit(s(...d), heute);
      expect(streak()).toBe(0);
      expect(flamme().getAttribute('data-flamme')).toBe('inaktiv');
    });
    it('[REQ-027/AK-5] Tageswechsel bei geöffneten Details: gestern gelesen, nach Neustart übermorgen → 0', async () => {
      const { b } = await zeigeMit(s(tag(-1)));
      expect(streak()).toBe(1);
      cleanup();
      stelleUhr(tag(1, 10));
      const w = await starte();
      const BD = w.BD;
      render(<BD buchId={b.id} bildspeicher={bilderFake()} onZurueck={() => {}} jetzt={jetzt} />);
      await vi.waitFor(() => expect(sek().querySelector('[data-streak]')).not.toBeNull());
      expect(streak()).toBe(0);
    });
  });

  describe('AK-6 Tageswechsel nach lokaler Gerätezeit', () => {
    it.each([
      ['am zweiten Tag mittags', tag(0, 12)],
      ['am zweiten Tag 00:02', new Date(2026, 10, 12, 0, 2)],
      ['am dritten Tag (Folgetag)', tag(1, 12)],
    ])('[REQ-027/AK-6] Sitzungen 23:59 und 00:01 (lokal) am Folgetag, angezeigt %s → 2', async (_f, heute) => {
      await zeigeMit(s(new Date(2026, 10, 11, 23, 59), new Date(2026, 10, 12, 0, 1)), heute);
      expect(streak()).toBe(2);
    });
    it('[REQ-027/AK-6] Gegenprobe: 00:01 und 23:59 desselben lokalen Tags → 1', async () => {
      await zeigeMit(s(new Date(2026, 10, 12, 0, 1), new Date(2026, 10, 12, 23, 59)), new Date(2026, 10, 12, 23, 59, 30));
      expect(streak()).toBe(1);
    });
    it('[REQ-027/AK-6] über die Oberfläche: 23:59 und 00:01 gesichert → 2', async () => {
      await zeigeMit([], new Date(2026, 10, 11, 23, 59));
      await sichereAS('60');
      stelleUhr(new Date(2026, 10, 12, 0, 1));
      await sichereAS('70');
      expect(streak()).toBe(2);
    });
  });

  describe('AK-7 Sichern ohne Erhöhung zählt nicht', () => {
    it('[REQ-027/AK-7] gestern Sitzung, heute nur ohne Erhöhung gesichert → morgen 0', async () => {
      const { b } = await zeigeMit(s(tag(-1)));
      await sichereAS('50');
      await sichereAS('40');
      expect(streak()).toBe(1);
      cleanup();
      stelleUhr(tag(1, 10));
      const w = await starte();
      const BD = w.BD;
      render(<BD buchId={b.id} bildspeicher={bilderFake()} onZurueck={() => {}} jetzt={jetzt} />);
      await vi.waitFor(() => expect(sek().querySelector('[data-streak]')).not.toBeNull());
      expect(streak()).toBe(0);
    });
  });

  describe('AK-8 Streak gilt je Buch', () => {
    it('[REQ-027/AK-8] Sitzungen gestern und heute nur für Buch A: B zeigt 0, A zeigt 2', async () => {
      stelleUhr(tag(0, 15));
      const w = await starte();
      const a = buchB({ titel: 'A', seitenanzahl: 100, aktuelleSeite: 5, sitzungen: s(tag(-1), tag(0, 9)) });
      await w.repo.save(a as Buch);
      await details(w, buchB({ titel: 'B', seitenanzahl: 100, aktuelleSeite: 5 }));
      expect(streak()).toBe(0);
      cleanup();
      await details(w, a);
      expect(streak()).toBe(2);
    });
  });

  describe('AK-9 Darstellung bei 0 und ab 1', () => {
    it('[REQ-027/AK-9] Streak 0: Umriss in „GhostFrame“ ohne Flammenfarben, Zahl „0“', async () => {
      await zeigeMit([]);
      const f = flamme();
      expect(f.getAttribute('data-flamme')).toBe('inaktiv');
      expect(norm(zahlTextIn())).toBe('0');
      const html = sek().querySelector('[data-streak]')!.outerHTML;
      expect(html).toMatch(/--bz-farbe-ghostframe/);
      expect(html).not.toMatch(/--bz-farbe-flamme(rot|orange)/);
      expect(keinFarbliteral(html)).toBe(true);
    });
    it('[REQ-027/AK-9] Streak 3: Verlauf „Flamme Rot“ unten → „Flamme Orange“ oben, Zahl „3“ in „Hintergrund“', async () => {
      const { wurzel } = await zeigeMit(s(tag(-2), tag(-1), tag(0, 9)));
      const f = flamme();
      expect(f.getAttribute('data-flamme')).toBe('aktiv');
      expect(norm(zahlTextIn())).toBe('3');
      const html = sek().querySelector('[data-streak]')!.outerHTML;
      expect(verlaufRotUntenOrangeOben(sek().querySelector('[data-streak]')!), html.slice(0, 600)).toBe(true);
      expect(keinFarbliteral(html)).toBe(true);
      expect(ist(zahlElement(), 'text')).toContain(rubrik(wurzel, 'hintergrund'));
    });
    it('[REQ-027/AK-9] Rubriken „Flamme Rot“ und „Flamme Orange“ sind zentral definiert und änderbar', async () => {
      expect(rubriken.flammerot?.wert, 'Rubrik flammerot').toBeTruthy();
      expect(rubriken.flammeorange?.wert, 'Rubrik flammeorange').toBeTruthy();
      await mitRubrik('flammerot', '#0A1B2C', async () =>
        mitRubrik('flammeorange', '#1C2B3A', async () => {
          const v = farbVariablen();
          expect(v['--bz-farbe-flammerot']).toBe('#0A1B2C');
          expect(v['--bz-farbe-flammeorange']).toBe('#1C2B3A');
        }),
      );
    });
  });
});

const zahlElement = () => textElement(sek().querySelector<HTMLElement>('[data-streak]')!, /^\d+$/);
const zahlTextIn = () => zahlElement().textContent;
const keinFarbliteral = (html: string) => !/#[0-9a-f]{3,8}\b|\b(?:rgba?|hsla?)\(/i.test(html.replace(/url\(#[^)]*\)|href="#[^"]*"/g, ''));
/** Verlauf von unten Rot nach oben Orange: CSS linear-gradient oder SVG-linearGradient. */
function verlaufRotUntenOrangeOben(root: Element): boolean {
  const html = root.outerHTML;
  const rot = /--bz-farbe-flammerot/;
  const orange = /--bz-farbe-flammeorange/;
  if (!rot.test(html) || !orange.test(html)) return false;
  for (const e of [root, ...Array.from(root.querySelectorAll('*'))] as HTMLElement[]) {
    const bg = (e.getAttribute('style') ?? '').match(/linear-gradient\(([^;]*)\)/)?.[1];
    if (bg) {
      const iR = bg.search(rot);
      const iO = bg.search(orange);
      if (/^\s*to top/.test(bg)) return iR < iO;
      if (/^\s*(to bottom|180deg)/.test(bg)) return iO < iR;
      if (/^\s*0deg/.test(bg)) return iR < iO;
    }
  }
  const lg = root.querySelector('linearGradient');
  if (lg) {
    const y1 = parseFloat(lg.getAttribute('y1') ?? '0');
    const y2 = parseFloat(lg.getAttribute('y2') ?? '0');
    const stops = Array.from(lg.querySelectorAll('stop')).map((st) => `${st.getAttribute('stop-color') ?? ''} ${st.getAttribute('style') ?? ''}`);
    const iR = stops.findIndex((t) => rot.test(t));
    const iO = stops.findIndex((t) => orange.test(t));
    if (iR < 0 || iO < 0) return false;
    // y wächst nach unten: y1 > y2 heißt der Verlauf läuft von unten nach oben.
    return y1 > y2 ? iR < iO : y1 < y2 ? iO < iR : false;
  }
  return false;
}
