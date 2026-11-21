/**
 * Akzeptanztests REQ-024 – Menü „Aktuelle Seite“.
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

const MIT = (f: Partial<BuchB> = {}) => buchB({ seitenanzahl: 400, aktuelleSeite: 10, fortschrittsmodus: 'seite', sitzungen: [], ...f });
const feldAS = (dlg: HTMLElement) => eingabe(dlg, istProzent(dlg) ? 'Prozent' : 'Aktuelle Seite');
const anzahl = (b?: BuchB) => (b?.sitzungen ?? []).length;
const hintergrund = () => document.querySelector<HTMLElement>('[data-blatt-hintergrund]');

describe('REQ-024 Menü „Aktuelle Seite“', () => {
  describe('AK-1 Menü erscheint von unten, Buchdetails abgedunkelt', () => {
    it('[REQ-024/AK-1] Antippen des Fortschritts: Blatt sichtbar, unten verankert, Abdunklung über den Buchdetails', async () => {
      await details(await starte(), MIT());
      const dlg = await oeffneAS();
      expect(dlg).toBeVisible();
      const kette: HTMLElement[] = [];
      for (let n: HTMLElement | null = dlg; n && n !== document.body; n = n.parentElement) kette.push(n);
      const unten = kette.some((n) => {
        const cs = getComputedStyle(n);
        return cs.bottom === '0px' || cs.bottom === '0' || (cs.display.includes('flex') && cs.justifyContent === 'flex-end' && cs.flexDirection === 'column') || cs.alignItems === 'flex-end';
      });
      expect(unten, 'Blatt am unteren Rand verankert').toBe(true);
      expect(hintergrund()).not.toBeNull();
      expect(TRANSPARENT.test(getComputedStyle(hintergrund()!).backgroundColor), 'Abdunklung hat eine Farbe').toBe(false);
      expect(hintergrund()!.contains(sek().querySelector('[data-buchdetails-titel]')), 'Abdunklung liegt über, nicht um die Details').toBe(false);
    });
  });

  describe('AK-2 Überschrift, X und Farben', () => {
    const FAELLE: [string, string, Art, (d: HTMLElement) => HTMLElement][] = [
      ['dunkelbraun', 'Überschrift', 'text', (d) => textElement(d, 'Aktuelle Seite')],
      ['ghost', 'X Fläche', 'hintergrund', (d) => knopf(d, 'Schließen')],
      ['ghostframe', 'X Rahmen', 'rahmen', (d) => knopf(d, 'Schließen')],
      ['dunkelbraun', 'X', 'icon', (d) => knopf(d, 'Schließen').querySelector<HTMLElement>('[data-icon]')!],
      ['hintergrund', 'Grundfläche', 'hintergrund', (d) => mitFlaeche(d)],
      ['ghost', 'Eingabefeld Fläche', 'hintergrund', (d) => feldAS(d)],
      ['ghostframe', 'Eingabefeld Rahmen', 'rahmen', (d) => feldAS(d)],
      ['dunkelbraun', 'Eingabefeld Schrift', 'text', (d) => feldAS(d)],
      ['ghost', 'aktive Option „Seite“', 'hintergrund', (d) => knopf(d, 'Seite')],
      ['ghostframe', 'inaktive Option „%“', 'hintergrund', (d) => knopf(d, '%')],
    ];
    it.each(FAELLE)('[REQ-024/AK-2] Rubrik „%s“ färbt %s', async (id, wo, art, finde) => {
      const { wurzel } = await details(await starte(), MIT());
      const d = await oeffneAS();
      expect(ist(finde(d), art), wo).toContain(rubrik(wurzel, id));
    });
    it.each(FAELLE)('[REQ-024/AK-2] Änderung der Rubrik „%s“ wirkt auf %s', async (id, wo, art, finde) => {
      await mitRubrik(id, '#0A1B2C', async () => {
        const { wurzel } = await details(await starte(), MIT());
        const d = await oeffneAS();
        expect(ist(finde(d), art), wo).toContain(farbeVon(wurzel, '#0A1B2C'));
      });
    });
    it('[REQ-024/AK-2] nach Umschalten tauschen die Farben: „%“ aktiv (Ghost), „Seite“ inaktiv (GhostFrame); X oben rechts nach der Überschrift', async () => {
      const { wurzel } = await details(await starte(), MIT());
      const d = await oeffneAS();
      await tippe(knopf(d, '%'));
      expect(ist(knopf(d, '%'), 'hintergrund')).toContain(rubrik(wurzel, 'ghost'));
      expect(ist(knopf(d, 'Seite'), 'hintergrund')).toContain(rubrik(wurzel, 'ghostframe'));
      expect(vor(textElement(d, 'Aktuelle Seite'), knopf(d, 'Schließen'))).toBe(true);
    });
  });

  describe('AK-3 Startmodus', () => {
    it('[REQ-024/AK-3] ohne gespeicherten Modus: Optionen „Seite“ und „%“, „Seite“ gewählt, Feld „Aktuelle Seite“', async () => {
      await details(await starte(), buchB({ seitenanzahl: 400, aktuelleSeite: 10 }));
      const d = await oeffneAS();
      expect(knopf(d, 'Seite')).toHaveAttribute('aria-pressed', 'true');
      expect(knopf(d, '%')).toHaveAttribute('aria-pressed', 'false');
      expect(eingabe(d, 'Aktuelle Seite').value).toBe('10');
    });
    it('[REQ-024/AK-3] gespeicherter Modus „%“: „%“ gewählt, Feld „Prozent“ mit gespeichertem Wert', async () => {
      await details(await starte(), buchB({ seitenanzahl: 400, fortschrittsmodus: 'prozent', fortschrittProzent: 7 }));
      const d = await oeffneAS();
      expect(knopf(d, '%')).toHaveAttribute('aria-pressed', 'true');
      expect(knopf(d, 'Seite')).toHaveAttribute('aria-pressed', 'false');
      expect(eingabe(d, 'Prozent').value).toBe('7');
    });
    it('[REQ-024/AK-3] ohne gespeicherten Fortschritt ist das Feld leer', async () => {
      await details(await starte(), buchB({ seitenanzahl: 400 }));
      expect(eingabe(await oeffneAS(), 'Aktuelle Seite').value).toBe('');
    });
  });

  describe('AK-4 Sichern im Modus „Seite“', () => {
    it('[REQ-024/AK-4] 10 → 42 sichern: Blatt zu, „42 / 400“; nach Neustart Seite 42 und Modus „Seite“', async () => {
      const b = MIT();
      await details(await starte(), b);
      await sichereAS('42');
      expect(blattAS()).toBeNull();
      expect(hintergrund()).toBeNull();
      expect(norm(ftext()!.textContent)).toBe('42 / 400');
      const g = await gespeichert(b.id);
      expect(g?.aktuelleSeite).toBe(42);
      expect(g?.fortschrittsmodus ?? 'seite').toBe('seite');
      expect(g?.seitenanzahl).toBe(400);
    });
    it('[REQ-024/AK-4] nach Neustart zeigen die Buchdetails „42 / 400“ und das Menü ist mit 42 vorbelegt', async () => {
      const b = MIT();
      await details(await starte(), b);
      await sichereAS('42');
      cleanup();
      const w2 = await starte();
      const BD = w2.BD;
      render(<BD buchId={b.id} bildspeicher={bilderFake()} onZurueck={() => {}} jetzt={jetzt} />);
      await vi.waitFor(() => expect(norm(ftext()?.textContent)).toBe('42 / 400'));
      expect(eingabe(await oeffneAS(), 'Aktuelle Seite').value).toBe('42');
    });
    it.each([['0'], ['400'], ['1']])('[REQ-024/AK-4] Grenzwert %s ist erlaubt und wird gespeichert', async (wert) => {
      const b = MIT();
      await details(await starte(), b);
      await sichereAS(wert);
      expect(blattAS()).toBeNull();
      expect((await gespeichert(b.id))?.aktuelleSeite).toBe(Number(wert));
    });
  });

  describe('AK-5 Sichern im Modus „%“', () => {
    it('[REQ-024/AK-5] „%“ wählen, 5 sichern: Balken und „5 %“; nach Neustart „%“ gewählt und 5 eingetragen', async () => {
      const b = buchB({ seitenanzahl: 400 });
      await details(await starte(), b);
      await sichereAS('5', '%');
      expect(blattAS()).toBeNull();
      expect(norm(ftext()!.textContent)).toBe('5 %');
      expect(Number(balken()!.getAttribute('aria-valuenow'))).toBe(5);
      const g = await gespeichert(b.id);
      expect(g?.fortschrittsmodus).toBe('prozent');
      expect(g?.fortschrittProzent).toBe(5);
      const w2 = await starte();
      const BD = w2.BD;
      render(<BD buchId={b.id} bildspeicher={bilderFake()} onZurueck={() => {}} jetzt={jetzt} />);
      await vi.waitFor(() => expect(balken()).not.toBeNull());
      const d = await oeffneAS();
      expect(knopf(d, '%')).toHaveAttribute('aria-pressed', 'true');
      expect(eingabe(d, 'Prozent').value).toBe('5');
    });
    it.each([['0'], ['100']])('[REQ-024/AK-5] Grenzwert %s %% ist erlaubt', async (wert) => {
      const b = buchB({ seitenanzahl: 400 });
      await details(await starte(), b);
      await sichereAS(wert, '%');
      expect(blattAS()).toBeNull();
      expect((await gespeichert(b.id))?.fortschrittProzent).toBe(Number(wert));
    });
  });

  describe('AK-6 Obergrenzen', () => {
    it.each([
      ['Seite', '401'],
      ['Seite', '1000'],
      ['%', '101'],
      ['%', '150'],
    ] as const)('[REQ-024/AK-6] Modus „%s“, %s: wird nicht gespeichert, gespeicherter Fortschritt unverändert', async (m, wert) => {
      const b = MIT();
      await details(await starte(), b);
      await sichereAS(wert, m);
      expect(norm(ftext()!.textContent)).toBe('10 / 400');
      const g = await gespeichert(b.id);
      expect(g?.aktuelleSeite).toBe(10);
      expect(g?.fortschrittProzent).toBeUndefined();
      expect(g?.fortschrittsmodus).toBe('seite');
      expect(anzahl(g)).toBe(0);
    });
    it.each([['-1'], ['42.5'], ['4,2'], ['abc']])('[REQ-024/AK-6] Fehlerfall: keine ganze Zahl ab 0 (%s) wird nicht gespeichert', async (wert) => {
      const b = MIT();
      await details(await starte(), b);
      await sichereAS(wert);
      const g = await gespeichert(b.id);
      expect(g?.aktuelleSeite).toBe(10);
      expect(anzahl(g)).toBe(0);
    });
  });

  describe('AK-7 Kein −/+ und keine Hinweiszeile', () => {
    it.each(['Seite', '%'] as const)('[REQ-024/AK-7] Modus „%s“: keine −/+-Schaltflächen, kein „Du bist dann auf Seite …“', async (m) => {
      await details(await starte(), MIT());
      const d = await oeffneAS();
      await tippe(knopf(d, m));
      gib(feldAS(d), '20');
      const namen = within(d).getAllByRole('button').map((x) => norm(x.textContent) || x.getAttribute('aria-label') || '');
      expect(namen.filter((n) => /^[-−–+]$|^(plus|minus|weniger|mehr)$/i.test(n))).toEqual([]);
      expect(d.textContent).not.toMatch(/Du bist dann auf Seite/i);
    });
  });

  describe('AK-8 Leeres Eingabefeld', () => {
    it.each(['Seite', '%'] as const)('[REQ-024/AK-8] Modus „%s“, Feld geleert: nichts gespeichert, Blatt bleibt offen, Hinweis unter dem Feld', async (m) => {
      const b = MIT();
      await details(await starte(), b);
      const d = await oeffneAS();
      await tippe(knopf(d, m));
      const f = feldAS(d);
      gib(f, '');
      const vorher = norm(d.textContent);
      await tippe(knopf(d, 'Sichern'));
      expect(blattAS()).not.toBeNull();
      const nachher = norm(d.textContent);
      expect(nachher.length, 'ein Hinweis erscheint').toBeGreaterThan(vorher.length);
      const neu = Array.from(d.querySelectorAll<HTMLElement>('*')).filter((e) => e.children.length === 0 && norm(e.textContent) && !vorher.includes(norm(e.textContent)));
      expect(neu.length, 'neuer Hinweistext').toBeGreaterThan(0);
      expect(vor(f, neu[0]), 'Hinweis steht unter dem Feld').toBe(true);
      const g = await gespeichert(b.id);
      expect(g?.aktuelleSeite).toBe(10);
      expect(anzahl(g)).toBe(0);
    });
  });

  describe('AK-9 Moduswechsel rechnet um', () => {
    it('[REQ-024/AK-9] 42 von 400 → „%“: 11; 25 % → „Seite“: 100', async () => {
      await details(await starte(), MIT());
      const d = await oeffneAS();
      gib(eingabe(d, 'Aktuelle Seite'), '42');
      await tippe(knopf(d, '%'));
      expect(eingabe(d, 'Prozent').value).toBe('11');
      gib(eingabe(d, 'Prozent'), '25');
      await tippe(knopf(d, 'Seite'));
      expect(eingabe(d, 'Aktuelle Seite').value).toBe('100');
    });
    it.each([
      [400, '41', '10'],
      [400, '2', '1'],
      [400, '1', '0'],
      [8, '1', '13'],
      [400, '400', '100'],
      [400, '0', '0'],
    ])('[REQ-024/AK-9] Seite → %%: bei %i Seiten wird %s zu %s (kaufmännisch)', async (gesamt, seite, prozent) => {
      await details(await starte(), buchB({ seitenanzahl: gesamt }));
      const d = await oeffneAS();
      gib(eingabe(d, 'Aktuelle Seite'), seite);
      await tippe(knopf(d, '%'));
      expect(eingabe(d, 'Prozent').value).toBe(prozent);
    });
    it.each([
      [3, '50', '2'],
      [400, '33', '132'],
      [7, '10', '1'],
      [400, '100', '400'],
    ])('[REQ-024/AK-9] %% → Seite: bei %i Seiten wird %s zu %s (kaufmännisch)', async (gesamt, prozent, seite) => {
      await details(await starte(), buchB({ seitenanzahl: gesamt, fortschrittsmodus: 'prozent' }));
      const d = await oeffneAS();
      gib(eingabe(d, 'Prozent'), prozent);
      await tippe(knopf(d, 'Seite'));
      expect(eingabe(d, 'Aktuelle Seite').value).toBe(seite);
    });
    it('[REQ-024/AK-9] leeres Feld bleibt beim Wechsel in beide Richtungen leer', async () => {
      await details(await starte(), buchB({ seitenanzahl: 400 }));
      const d = await oeffneAS();
      await tippe(knopf(d, '%'));
      expect(eingabe(d, 'Prozent').value).toBe('');
      await tippe(knopf(d, 'Seite'));
      expect(eingabe(d, 'Aktuelle Seite').value).toBe('');
    });
    it('[REQ-024/AK-9] bloßer Moduswechsel speichert nichts', async () => {
      const b = MIT();
      await details(await starte(), b);
      const d = await oeffneAS();
      await tippe(knopf(d, '%'));
      const g = await gespeichert(b.id);
      expect(g?.fortschrittsmodus).toBe('seite');
      expect(g?.fortschrittProzent).toBeUndefined();
    });
  });

  describe('AK-10 Kein Menü „Aktuelle Seite“ ohne Seitenanzahl', () => {
    it.each(['seite', 'prozent'] as const)('[REQ-024/AK-10] Modus „%s“ ohne Seitenanzahl: Herz öffnet „Buchlänge“, nicht „Aktuelle Seite“', async (m) => {
      await details(await starte(), buchB({ fortschrittsmodus: m, fortschrittProzent: 5 }));
      await tippe(herz()!);
      expect(blattBL()).not.toBeNull();
      expect(blattAS()).toBeNull();
    });
  });

  describe('AK-11 Schließen ohne Speichern', () => {
    it.each([
      ['außerhalb', () => hintergrund()!],
      ['X', () => knopf(blattAS()!, 'Schließen')],
    ] as const)('[REQ-024/AK-11] 50 eingegeben, Schließen über %s: Blatt zu, Seite 10, keine Sitzung', async (_w, ziel) => {
      const b = MIT();
      await details(await starte(), b);
      const d = await oeffneAS();
      gib(eingabe(d, 'Aktuelle Seite'), '50');
      await tippe(ziel());
      await warte();
      expect(blattAS()).toBeNull();
      expect(norm(ftext()!.textContent)).toBe('10 / 400');
      expect(sitzungenAnz()).toBe(0);
      const g = await gespeichert(b.id);
      expect(g?.aktuelleSeite).toBe(10);
      expect(anzahl(g)).toBe(0);
    });
    it('[REQ-024/AK-11] nach „%“ und X bleibt der Modus „Seite“; erneutes Öffnen zeigt wieder „Seite“ und 10', async () => {
      const b = MIT();
      await details(await starte(), b);
      let d = await oeffneAS();
      await tippe(knopf(d, '%'));
      gib(eingabe(d, 'Prozent'), '50');
      await tippe(knopf(d, 'Schließen'));
      d = await oeffneAS();
      expect(knopf(d, 'Seite')).toHaveAttribute('aria-pressed', 'true');
      expect(eingabe(d, 'Aktuelle Seite').value).toBe('10');
      expect((await gespeichert(b.id))?.fortschrittsmodus).toBe('seite');
    });
    it('[REQ-024/AK-11] Negativfall: Tipp in die Blattfläche schließt nicht', async () => {
      await details(await starte(), MIT());
      const d = await oeffneAS();
      await tippe(d);
      await tippe(textElement(d, 'Aktuelle Seite'));
      expect(blattAS()).not.toBeNull();
    });
  });

  describe('AK-12 Sitzung nur bei Erhöhung', () => {
    it('[REQ-024/AK-12] 42 → 50: n+1 Sitzungen mit Zeitpunkt des Sicherns; danach 50 und 30: weiter n+1, 30 gespeichert', async () => {
      const alt = [{ zeitpunkt: new Date(2026, 10, 1, 8).toISOString() }, { zeitpunkt: new Date(2026, 10, 2, 8).toISOString() }];
      const b = MIT({ aktuelleSeite: 42, sitzungen: alt });
      const w = await starte();
      await details(w, b);
      const t = new Date(2026, 10, 12, 21, 37, 5);
      stelleUhr(t);
      await sichereAS('50');
      expect(sitzungenAnz()).toBe(3);
      let g = (await w.repo.get(b.id)) as BuchB;
      expect(anzahl(g)).toBe(3);
      const neu = g.sitzungen!.find((s) => !alt.some((a) => a.zeitpunkt === s.zeitpunkt))!;
      expect(new Date(neu.zeitpunkt).getTime()).toBe(t.getTime());
      stelleUhr(new Date(2026, 10, 12, 22));
      await sichereAS('50');
      await sichereAS('30');
      expect(sitzungenAnz()).toBe(3);
      expect(norm(ftext()!.textContent)).toBe('30 / 400');
      g = (await gespeichert(b.id))!;
      expect(anzahl(g)).toBe(3);
      expect(g.aktuelleSeite).toBe(30);
    });
    it('[REQ-024/AK-12] ohne bisherigen Fortschritt: 0 sichern ergibt keine Sitzung, 1 sichern eine', async () => {
      const b = buchB({ seitenanzahl: 400 });
      await details(await starte(), b);
      await sichereAS('0');
      expect(sitzungenAnz()).toBe(0);
      await sichereAS('1');
      expect(sitzungenAnz()).toBe(1);
      expect(anzahl(await gespeichert(b.id))).toBe(1);
    });
    it('[REQ-024/AK-12] Vergleich über den Anteil: 42/400 (10,5 %) → 11 % ist eine Erhöhung, danach 10 % nicht', async () => {
      const b = MIT({ aktuelleSeite: 42 });
      await details(await starte(), b);
      await sichereAS('11', '%');
      expect(sitzungenAnz()).toBe(1);
      await sichereAS('10', '%');
      expect(sitzungenAnz()).toBe(1);
      const g = await gespeichert(b.id);
      expect(g?.fortschrittProzent).toBe(10);
      expect(anzahl(g)).toBe(1);
    });
    it('[REQ-024/AK-12] Vergleich über den Anteil: 10 % → Seite 40 von 400 (10 %) ist keine Erhöhung, Seite 41 schon', async () => {
      const b = buchB({ seitenanzahl: 400, fortschrittsmodus: 'prozent', fortschrittProzent: 10 });
      await details(await starte(), b);
      await sichereAS('40', 'Seite');
      expect(sitzungenAnz()).toBe(0);
      await sichereAS('41', 'Seite');
      expect(sitzungenAnz()).toBe(1);
    });
    it('[REQ-024/AK-12] ungültiger Wert über der Grenze legt keine Sitzung an', async () => {
      const b = MIT();
      await details(await starte(), b);
      await sichereAS('401');
      expect(anzahl(await gespeichert(b.id))).toBe(0);
    });
  });

  describe('AK-13 Mehrere Sitzungen am selben Tag', () => {
    it('[REQ-024/AK-13] am selben Tag 20 und 30 gesichert → zwei neue Sitzungen', async () => {
      const b = MIT();
      await details(await starte(), b);
      stelleUhr(new Date(2026, 10, 12, 8, 0));
      await sichereAS('20');
      stelleUhr(new Date(2026, 10, 12, 8, 1));
      await sichereAS('30');
      expect(sitzungenAnz()).toBe(2);
      const g = await gespeichert(b.id);
      expect(anzahl(g)).toBe(2);
      expect(g?.aktuelleSeite).toBe(30);
    });
  });

  describe('AK-14 Farben der Pille „Sichern“', () => {
    const FAELLE: [string, string, Art, (d: HTMLElement) => HTMLElement][] = [
      ['primaer', 'Fläche', 'hintergrund', (d) => mitFlaeche(knopf(d, 'Sichern'))],
      ['hintergrund', 'Schrift', 'text', (d) => textElement(knopf(d, 'Sichern'), 'Sichern')],
    ];
    it.each(FAELLE)('[REQ-024/AK-14] Rubrik „%s“ färbt „Sichern“ %s', async (id, wo, art, finde) => {
      const { wurzel } = await details(await starte(), MIT());
      expect(ist(finde(await oeffneAS()), art), wo).toContain(rubrik(wurzel, id));
    });
    it.each(FAELLE)('[REQ-024/AK-14] Änderung der Rubrik „%s“ wirkt auf „Sichern“ %s', async (id, wo, art, finde) => {
      await mitRubrik(id, '#0A1B2C', async () => {
        const { wurzel } = await details(await starte(), MIT());
        expect(ist(finde(await oeffneAS()), art), wo).toContain(farbeVon(wurzel, '#0A1B2C'));
      });
    });
  });
});
