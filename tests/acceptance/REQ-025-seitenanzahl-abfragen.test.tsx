/**
 * Akzeptanztests REQ-025 – Seitenanzahl abfragen (Menü „Buchlänge“).
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

const hintergrund = () => document.querySelector<HTMLElement>('[data-blatt-hintergrund]');
async function oeffneBL() {
  await tippe(herz()!);
  return (await screen.findByRole('dialog', { name: 'Buchlänge' })) as HTMLElement;
}
const feldBL = (d: HTMLElement) => eingabe(d, 'Seitenanzahl');

describe('REQ-025 Seitenanzahl abfragen (Menü „Buchlänge“)', () => {
  describe('AK-1 Ohne Seitenanzahl öffnet „Buchlänge“', () => {
    it.each([undefined, 'seite', 'prozent'] as const)('[REQ-025/AK-1] Modus %s: Herz → „Buchlänge“ unten, abgedunkelt, „Aktuelle Seite“ nicht sichtbar', async (m) => {
      await details(await starte(), buchB(m ? { fortschrittsmodus: m } : {}));
      const d = await oeffneBL();
      expect(d).toBeVisible();
      expect(blattAS()).toBeNull();
      expect(hintergrund()).not.toBeNull();
      expect(TRANSPARENT.test(getComputedStyle(hintergrund()!).backgroundColor)).toBe(false);
      const kette: HTMLElement[] = [];
      for (let n: HTMLElement | null = d; n && n !== document.body; n = n.parentElement) kette.push(n);
      expect(kette.some((n) => {
        const cs = getComputedStyle(n);
        return cs.bottom === '0px' || cs.bottom === '0' || (cs.justifyContent === 'flex-end' && cs.flexDirection === 'column') || cs.alignItems === 'flex-end';
      }), 'Blatt unten verankert').toBe(true);
    });
  });

  describe('AK-2 Aufbau und Farben', () => {
    it('[REQ-025/AK-2] Ziehgriff, Überschrift, X, Untertitel, Feld, „Sichern“ in dieser Reihenfolge; Feld beim Öffnen leer', async () => {
      await details(await starte(), buchB());
      const d = await oeffneBL();
      const reihe = [
        d.querySelector<HTMLElement>('[data-ziehgriff]')!,
        textElement(d, 'Buchlänge'),
        knopf(d, 'Schließen'),
        textElement(d, 'Leg die Länge dieses Buches fest'),
        feldBL(d),
        knopf(d, 'Sichern'),
      ];
      reihe.forEach((e, i) => expect(e, `Element ${i}`).toBeTruthy());
      for (let i = 1; i < reihe.length; i++) expect(vor(reihe[i - 1], reihe[i]), `${i - 1} → ${i}`).toBe(true);
      expect(feldBL(d).value).toBe('');
    });
    it('[REQ-025/AK-2] Schrift im Eingabefeld zentriert', async () => {
      await details(await starte(), buchB());
      expect(getComputedStyle(feldBL(await oeffneBL())).textAlign).toBe('center');
    });
    const FAELLE: [string, string, Art, (d: HTMLElement) => HTMLElement][] = [
      ['dunkelbraun', 'Überschrift', 'text', (d) => textElement(d, 'Buchlänge')],
      ['ghost', 'X Fläche', 'hintergrund', (d) => knopf(d, 'Schließen')],
      ['ghostframe', 'X Rahmen', 'rahmen', (d) => knopf(d, 'Schließen')],
      ['dunkelbraun', 'X', 'icon', (d) => knopf(d, 'Schließen').querySelector<HTMLElement>('[data-icon]')!],
      ['hintergrund', 'Grundfläche', 'hintergrund', (d) => mitFlaeche(d)],
      ['ghost', 'Eingabefeld Fläche', 'hintergrund', (d) => feldBL(d)],
      ['ghostframe', 'Eingabefeld Rahmen', 'rahmen', (d) => feldBL(d)],
      ['dunkelbraun', 'Eingabefeld Schrift', 'text', (d) => feldBL(d)],
      ['primaer', '„Sichern“ Fläche', 'hintergrund', (d) => mitFlaeche(knopf(d, 'Sichern'))],
      ['hintergrund', '„Sichern“ Schrift', 'text', (d) => textElement(knopf(d, 'Sichern'), 'Sichern')],
    ];
    it.each(FAELLE)('[REQ-025/AK-2] Rubrik „%s“ färbt %s', async (id, wo, art, finde) => {
      const { wurzel } = await details(await starte(), buchB());
      expect(ist(finde(await oeffneBL()), art), wo).toContain(rubrik(wurzel, id));
    });
    it.each(FAELLE)('[REQ-025/AK-2] Änderung der Rubrik „%s“ wirkt auf %s', async (id, wo, art, finde) => {
      await mitRubrik(id, '#0A1B2C', async () => {
        const { wurzel } = await details(await starte(), buchB());
        expect(ist(finde(await oeffneBL()), art), wo).toContain(farbeVon(wurzel, '#0A1B2C'));
      });
    });
  });

  describe('AK-3 Sichern speichert und öffnet „Aktuelle Seite“', () => {
    it('[REQ-025/AK-3] 400 sichern: „Buchlänge“ zu, „Aktuelle Seite“ offen; nach Neustart Seitenanzahl 400, andere Daten erhalten', async () => {
      const b = buchB({ autor: 'Michael Ende', status: 'am_lesen' });
      await details(await starte(), b);
      const d = await oeffneBL();
      gib(feldBL(d), '400');
      await tippe(knopf(d, 'Sichern'));
      await warte();
      expect(blattBL()).toBeNull();
      expect(blattAS()).not.toBeNull();
      expect(eingabe(blattAS()!, 'Aktuelle Seite')).toBeTruthy();
      const g = await gespeichert(b.id);
      expect(g).toEqual({ ...b, seitenanzahl: 400 });
    });
    it('[REQ-025/AK-3] danach „Aktuelle Seite“ mit X schließen: Seitenanzahl bleibt, Balken mit „0 / 400“ statt Herz', async () => {
      const b = buchB();
      await details(await starte(), b);
      const d = await oeffneBL();
      gib(feldBL(d), '400');
      await tippe(knopf(d, 'Sichern'));
      await tippe(knopf(blattAS()!, 'Schließen'));
      expect(blattAS()).toBeNull();
      expect(herz()).toBeNull();
      expect(norm(ftext()?.textContent)).toBe('0 / 400');
      expect((await gespeichert(b.id))?.seitenanzahl).toBe(400);
    });
    it('[REQ-025/AK-3] Grenzwert 1 ist gültig; danach 1 als aktuelle Seite sichern ergibt „1 / 1“', async () => {
      const b = buchB();
      await details(await starte(), b);
      const d = await oeffneBL();
      gib(feldBL(d), '1');
      await tippe(knopf(d, 'Sichern'));
      const as = blattAS()!;
      gib(eingabe(as, 'Aktuelle Seite'), '1');
      await tippe(knopf(as, 'Sichern'));
      await warte();
      expect(norm(ftext()?.textContent)).toBe('1 / 1');
      expect((await gespeichert(b.id))?.seitenanzahl).toBe(1);
    });
  });

  describe('AK-4 Ungültige oder leere Eingabe', () => {
    it('[REQ-025/AK-4] leeres Feld: nichts gespeichert, Blatt bleibt offen, kein „Aktuelle Seite“, Hinweis unter dem Feld', async () => {
      const b = buchB();
      await details(await starte(), b);
      const d = await oeffneBL();
      const vorher = norm(d.textContent);
      await tippe(knopf(d, 'Sichern'));
      expect(blattBL()).not.toBeNull();
      expect(blattAS()).toBeNull();
      const neu = Array.from(d.querySelectorAll<HTMLElement>('*')).filter((e) => e.children.length === 0 && norm(e.textContent) && !vorher.includes(norm(e.textContent)));
      expect(neu.length, 'Hinweis erscheint').toBeGreaterThan(0);
      expect(vor(feldBL(d), neu[0]), 'Hinweis unter dem Feld').toBe(true);
      expect((await gespeichert(b.id))?.seitenanzahl).toBeUndefined();
    });
    it.each([['0'], ['-5'], ['12.5'], ['abc']])('[REQ-025/AK-4] ungültig %s: nichts gespeichert, Blatt bleibt offen, kein „Aktuelle Seite“', async (wert) => {
      const b = buchB();
      await details(await starte(), b);
      const d = await oeffneBL();
      gib(feldBL(d), wert);
      await tippe(knopf(d, 'Sichern'));
      expect(blattBL()).not.toBeNull();
      expect(blattAS()).toBeNull();
      expect((await gespeichert(b.id))?.seitenanzahl).toBeUndefined();
    });
  });

  describe('AK-5 Schließen ohne Sichern', () => {
    it.each([
      ['X', () => knopf(blattBL()!, 'Schließen')],
      ['außerhalb', () => hintergrund()!],
    ] as const)('[REQ-025/AK-5] 400 eingegeben, Schließen über %s: keine Menüs, kein „Aktuelle Seite“, weiterhin Herz, nichts gespeichert', async (_w, ziel) => {
      const b = buchB();
      await details(await starte(), b);
      gib(feldBL(await oeffneBL()), '400');
      await tippe(ziel());
      await warte();
      expect(blattBL()).toBeNull();
      expect(blattAS()).toBeNull();
      expect(hintergrund()).toBeNull();
      expect(herz()).not.toBeNull();
      expect((await gespeichert(b.id))?.seitenanzahl).toBeUndefined();
    });
    it('[REQ-025/AK-5] Negativfall: Tipp in die Blattfläche oder auf den Ziehgriff schließt nicht', async () => {
      await details(await starte(), buchB());
      const d = await oeffneBL();
      await tippe(d);
      const griff = d.querySelector('[data-ziehgriff]');
      if (griff) await tippe(griff);
      expect(blattBL()).not.toBeNull();
    });
  });

  describe('AK-6 Kein Menü „Buchlänge“ bei vorhandener Seitenanzahl', () => {
    it.each(['seite', 'prozent'] as const)('[REQ-025/AK-6] Modus „%s“ mit Seitenanzahl: direkt „Aktuelle Seite“, Seitenanzahl dort nicht änderbar', async (m) => {
      const b = buchB({ seitenanzahl: 400, fortschrittsmodus: m });
      await details(await starte(), b);
      expect(herz()).toBeNull();
      const d = await oeffneAS();
      expect(blattBL()).toBeNull();
      expect(within(d).queryAllByLabelText(/Seitenanzahl/i).filter((e) => e.tagName === 'INPUT')).toEqual([]);
      expect(d.querySelectorAll('input')).toHaveLength(1);
      await tippe(knopf(d, 'Seite'));
      await tippe(knopf(d, '%'));
      expect(d.querySelectorAll('input')).toHaveLength(1);
      expect((await gespeichert(b.id))?.seitenanzahl).toBe(400);
    });
  });
});

describe('REQ-031 Nachtest aus Teil A (Menü „Buchlänge“ nach dem Anlegen)', () => {
  async function legeAn(seiten?: string) {
    const w = await starte();
    const BA = w.BA;
    render(<BA bildspeicher={bilderFake()} bildquelle={{ scannen: async () => null, galerie: async () => null }} />);
    await screen.findByRole('heading', { name: 'Deine Bücher' });
    fireEvent.click(screen.getByRole('button', { name: 'Buch hinzufügen' }));
    fireEvent.click(within(await screen.findByRole('menu', { name: 'Buch hinzufügen' })).getByRole('menuitem'));
    const d = await screen.findByRole('dialog', { name: 'Manueller Eintrag' });
    fireEvent.change(within(d).getByLabelText(/^\s*Titel\s*$/i), { target: { value: 'Neu' } });
    if (seiten) fireEvent.change(within(d).getByLabelText(/^\s*Seiten\s*$/i), { target: { value: seiten } });
    await tippe(within(d).getByRole('button', { name: 'Hinzufügen' }));
    await screen.findByRole('region', { name: 'Buchdetails' });
    await vi.waitFor(() => expect(fortschritt()).not.toBeNull());
  }
  it('[REQ-031/AK-8] mit Seiten 350 angelegt: Lesefortschritt öffnet „Aktuelle Seite“, nicht „Buchlänge“', async () => {
    await legeAn('350');
    expect(norm(ftext()?.textContent)).toBe('0 / 350');
    await tippe(balken()!);
    expect(blattAS()).not.toBeNull();
    expect(blattBL()).toBeNull();
  });
  it('[REQ-031/AK-9] ohne Seiten angelegt: Lesefortschritt öffnet „Buchlänge“', async () => {
    await legeAn();
    await tippe(herz()!);
    expect(blattBL()).not.toBeNull();
    expect(blattAS()).toBeNull();
  });
});
