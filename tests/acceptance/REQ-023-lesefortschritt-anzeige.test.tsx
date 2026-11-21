/**
 * Akzeptanztests REQ-023 – Lesefortschrittsbalken bzw. Herz.
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

const fuellung = () => {
  const b = balken()!;
  const k = [b, ...Array.from(b.querySelectorAll<HTMLElement>('*'))].filter((e) => /%$/.test(e.style.width));
  if (!k.length) throw new Error('keine Füllung mit Prozentbreite im Balken');
  return k[k.length - 1];
};
const fuellProzent = () => parseFloat(fuellung().style.width);
const jetztText = () => norm(ftext()?.textContent);

describe('REQ-023 Lesefortschritt', () => {
  describe('AK-1 Ohne Seitenanzahl: Herz statt Balken', () => {
    it.each([undefined, 'seite', 'prozent'] as const)('[REQ-023/AK-1] Modus %s ohne Seitenanzahl: Herz, kein Balken, keine Angabe', async (modus) => {
      const w = await starte();
      await details(w, buchB(modus ? { fortschrittsmodus: modus } : {}));
      expect(herz()).not.toBeNull();
      expect(herz()!.tagName).toBe('BUTTON');
      expect(herz()!.querySelector('[data-icon="icon-herz.png"]') ?? (herz()!.getAttribute('data-icon') === 'icon-herz.png' ? herz() : null)).not.toBeNull();
      expect(balken()).toBeNull();
      expect(ftext()).toBeNull();
      expect(vor(pille(), herz()!)).toBe(true);
    });
    it('[REQ-023/AK-1] Negativfall: gespeicherter Prozentwert bzw. aktuelle Seite ohne Seitenanzahl → trotzdem Herz', async () => {
      const w = await starte();
      await details(w, buchB({ fortschrittsmodus: 'prozent', fortschrittProzent: 5, aktuelleSeite: 42 }));
      expect(herz()).not.toBeNull();
      expect(balken()).toBeNull();
    });
    it('[REQ-023/AK-1] Herz-Icon in Rubrik „Primär“, Änderung wirkt', async () => {
      const w = await starte();
      const { wurzel } = await details(w, buchB());
      const icon = herz()!.querySelector<HTMLElement>('[data-icon]') ?? herz()!;
      expect(ist(icon, 'icon')).toContain(rubrik(wurzel, 'primaer'));
      cleanup();
      await mitRubrik('primaer', '#0A1B2C', async () => {
        const { wurzel: w2 } = await details(await starte(), buchB());
        expect(ist(herz()!.querySelector<HTMLElement>('[data-icon]') ?? herz()!, 'icon')).toContain(farbeVon(w2, '#0A1B2C'));
      });
    });
  });

  describe('AK-2 Modus „Seite“: Balken und Seitenangabe', () => {
    it.each([undefined, true])('[REQ-023/AK-2] 42 von 400: Balken unter der Pille, darunter „42 / 400“, kein Herz (Buch-Prop: %s)', async (mitBuch) => {
      const w = await starte();
      await details(w, buchB({ seitenanzahl: 400, aktuelleSeite: 42, fortschrittsmodus: 'seite' }), Boolean(mitBuch));
      expect(balken()).not.toBeNull();
      expect(jetztText()).toBe('42 / 400');
      expect(herz()).toBeNull();
      expect(vor(pille(), balken()!)).toBe(true);
      expect(vor(balken()!, ftext()!)).toBe(true);
    });
    it('[REQ-023/AK-2] Modus „Seite“ nutzt die Seite, nicht einen zusätzlich gespeicherten Prozentwert', async () => {
      const w = await starte();
      await details(w, buchB({ seitenanzahl: 400, aktuelleSeite: 42, fortschrittProzent: 90, fortschrittsmodus: 'seite' }));
      expect(jetztText()).toBe('42 / 400');
      expect(Number(balken()!.getAttribute('aria-valuenow'))).toBeCloseTo(10.5, 5);
    });
  });

  describe('AK-3 Füllung im Modus „Seite“', () => {
    it.each([
      [50, 200, 25],
      [0, 200, 0],
      [200, 200, 100],
      [42, 400, 10.5],
      [1, 3, 100 / 3],
    ])('[REQ-023/AK-3] Seite %i von %i → Füllung %f %', async (seite, gesamt, prozent) => {
      const w = await starte();
      await details(w, buchB({ seitenanzahl: gesamt, aktuelleSeite: seite, fortschrittsmodus: 'seite' }));
      const b = balken()!;
      expect(b.getAttribute('aria-valuemin')).toBe('0');
      expect(b.getAttribute('aria-valuemax')).toBe('100');
      expect(Number(b.getAttribute('aria-valuenow'))).toBeCloseTo(prozent, 2);
      expect(fuellProzent()).toBeCloseTo(prozent, 1);
    });
  });

  describe('AK-4 Modus „%“: Balken und Prozentangabe', () => {
    it('[REQ-023/AK-4] 400 Seiten, Modus „%“, 5: Balken zu 5 % gefüllt, darunter „5 %“, kein Herz', async () => {
      const w = await starte();
      await details(w, buchB({ seitenanzahl: 400, fortschrittsmodus: 'prozent', fortschrittProzent: 5 }));
      expect(Number(balken()!.getAttribute('aria-valuenow'))).toBe(5);
      expect(fuellProzent()).toBeCloseTo(5, 5);
      expect(jetztText()).toMatch(/^5 %$/);
      expect(herz()).toBeNull();
    });
    it.each([0, 100, 37])('[REQ-023/AK-4] Prozentwert %i: Füllung und Angabe passen; gespeicherte Seite wird ignoriert', async (p) => {
      const w = await starte();
      await details(w, buchB({ seitenanzahl: 400, fortschrittsmodus: 'prozent', fortschrittProzent: p, aktuelleSeite: 200 }));
      expect(Number(balken()!.getAttribute('aria-valuenow'))).toBe(p);
      expect(fuellProzent()).toBeCloseTo(p, 5);
      expect(jetztText()).toBe(`${p} %`);
    });
  });

  describe('AK-5 Keine Prozentzahl im Modus „Seite“, kein Punkt', () => {
    it.each([[42], [0], [400]])('[REQ-023/AK-5] Seite %i/400: keine Prozentangabe im Fortschrittsbereich, nur eine Füllfläche', async (seite) => {
      const w = await starte();
      const { wurzel } = await details(w, buchB({ seitenanzahl: 400, aktuelleSeite: seite, fortschrittsmodus: 'seite' }));
      expect(fortschritt()!.textContent).not.toMatch(/%/);
      const primaer = rubrik(wurzel, 'primaer');
      const flaechen = Array.from(fortschritt()!.querySelectorAll<HTMLElement>('*')).filter(
        (e) => getComputedStyle(e).backgroundColor === primaer || getComputedStyle(e).borderTopColor === primaer,
      );
      expect(flaechen.length, 'nur die Füllung in Primär, kein Punkt').toBeLessThanOrEqual(1);
    });
  });

  describe('AK-6 Farben', () => {
    const FAELLE: [string, string, Art, () => HTMLElement][] = [
      ['ghostframe', 'ungefüllter Teil', 'hintergrund', () => mitFlaeche(balken()!)],
      ['primaer', 'Füllung', 'hintergrund', () => fuellung()],
      ['dunkelbraun', 'Angabe „42 / 400“', 'text', () => textElement(ftext()!, '42 / 400')],
    ];
    it.each(FAELLE)('[REQ-023/AK-6] Rubrik „%s“ färbt %s', async (id, wo, art, finde) => {
      const { wurzel } = await details(await starte(), buchB({ seitenanzahl: 400, aktuelleSeite: 42 }));
      expect(ist(finde(), art), wo).toContain(rubrik(wurzel, id));
    });
    it.each(FAELLE)('[REQ-023/AK-6] Änderung der Rubrik „%s“ wirkt auf %s', async (id, wo, art, finde) => {
      await mitRubrik(id, '#0A1B2C', async () => {
        const { wurzel } = await details(await starte(), buchB({ seitenanzahl: 400, aktuelleSeite: 42 }));
        expect(ist(finde(), art), wo).toContain(farbeVon(wurzel, '#0A1B2C'));
      });
    });
  });

  describe('AK-7 Antippen öffnet „Aktuelle Seite“ bzw. „Buchlänge“', () => {
    it('[REQ-023/AK-7] Antippen des Balkens öffnet „Aktuelle Seite“', async () => {
      await details(await starte(), buchB({ seitenanzahl: 400, aktuelleSeite: 42 }));
      expect(blattAS()).toBeNull();
      await tippe(balken()!);
      expect(blattAS()).not.toBeNull();
      expect(blattBL()).toBeNull();
    });
    it('[REQ-023/AK-7] Antippen der Angabe darunter öffnet „Aktuelle Seite“', async () => {
      await details(await starte(), buchB({ seitenanzahl: 400, aktuelleSeite: 42 }));
      await tippe(ftext()!);
      expect(blattAS()).not.toBeNull();
    });
    it('[REQ-023/AK-7] ohne Seitenanzahl öffnet das Herz „Buchlänge“, nicht „Aktuelle Seite“', async () => {
      await details(await starte(), buchB());
      await tippe(herz()!);
      expect(blattBL()).not.toBeNull();
      expect(blattAS()).toBeNull();
    });
  });

  describe('AK-8 Seitenanzahl ohne Fortschritt (Annahme)', () => {
    it.each([false, true])('[REQ-023/AK-8] 400 Seiten, kein Fortschritt, kein Modus: leerer Balken mit „0 / 400“, kein Herz (Buch-Prop: %s)', async (mitBuch) => {
      await details(await starte(), buchB({ seitenanzahl: 400 }), mitBuch);
      expect(Number(balken()!.getAttribute('aria-valuenow'))).toBe(0);
      expect(fuellProzent()).toBe(0);
      expect(jetztText()).toBe('0 / 400');
      expect(herz()).toBeNull();
    });
  });
});
