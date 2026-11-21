/**
 * Akzeptanztests REQ-021 – Statuspille.
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

const STATUS = [
  ['ungelesen', 'ungelesen'],
  ['am_lesen', 'am lesen'],
  ['gelesen', 'gelesen'],
  ['abgebrochen', 'abgebrochen'],
  ['wunschliste', 'Wunschliste'],
] as const;
const pillenText = () => norm(pille().textContent);
const herzIcon = () => pille().querySelector<HTMLElement>('[data-icon="icon-herz.png"]');
const pfeile = () => pille().querySelector<HTMLElement>('[data-icon="icon-auf-ab.png"]');

describe('REQ-021 Statuspille', () => {
  describe('AK-1 Statuspille unter dem Titel mit Statusname', () => {
    it('[REQ-021/AK-1] Buch „am lesen“: Pille ist ein Button unter dem Titel mit dem Text „am lesen“', async () => {
      const w = await starte();
      await details(w, buchB({ status: 'am_lesen' }));
      expect(pille().tagName).toBe('BUTTON');
      expect(pillenText()).toBe('am lesen');
      expect(vor(sek().querySelector('[data-buchdetails-titel]')!, pille())).toBe(true);
    });

    it.each(STATUS)('[REQ-021/AK-1] Status %s zeigt den Namen „%s“ aus der zentralen Definition', async (id, name) => {
      const w = await starte();
      await details(w, buchB({ status: id }), true);
      expect(pillenText()).toBe(name);
    });

    it('[REQ-021/AK-1] Pille steht vor (über) Lesefortschritt und Statistik', async () => {
      const w = await starte();
      await details(w, buchB({ status: 'am_lesen', seitenanzahl: 100, aktuelleSeite: 1 }));
      expect(vor(pille(), fortschritt()!)).toBe(true);
      expect(vor(pille(), statistik()!)).toBe(true);
    });
  });

  describe('AK-2 Farben der Statuspille', () => {
    const FAELLE: [string, string, Art, () => HTMLElement][] = [
      ['primaer', 'Pillenfläche', 'hintergrund', () => mitFlaeche(pille())],
      ['hintergrund', 'Schrift', 'text', () => textElement(pille(), 'gelesen')],
      ['hintergrund', 'Auf-/Ab-Pfeile', 'icon', () => pfeile()!],
    ];
    it.each(FAELLE)('[REQ-021/AK-2] Rubrik „%s“ färbt %s', async (id, wo, art, finde) => {
      const w = await starte();
      const { wurzel } = await details(w, buchB({ status: 'gelesen' }));
      expect(ist(finde(), art), wo).toContain(rubrik(wurzel, id));
    });
    it.each(FAELLE)('[REQ-021/AK-2] Änderung der Rubrik „%s“ an zentraler Stelle wirkt auf %s', async (id, wo, art, finde) => {
      await mitRubrik(id, '#0A1B2C', async () => {
        const w = await starte();
        const { wurzel } = await details(w, buchB({ status: 'gelesen' }));
        expect(ist(finde(), art), wo).toContain(farbeVon(wurzel, '#0A1B2C'));
      });
    });
  });

  describe('AK-3 Schrift zentriert', () => {
    it('[REQ-021/AK-3] der Statusname ist in der Pille zentriert', async () => {
      const w = await starte();
      await details(w, buchB());
      const t = textElement(pille(), 'ungelesen');
      const kette: HTMLElement[] = [];
      for (let n: HTMLElement | null = t; n && n !== pille().parentElement; n = n.parentElement) kette.push(n);
      const zentriert = kette.some((n) => getComputedStyle(n).textAlign === 'center') ||
        getComputedStyle(pille()).justifyContent === 'center';
      expect(zentriert, 'text-align:center bzw. justify-content:center').toBe(true);
    });
  });

  describe('AK-4 Herz-Icon links als Platzhalter', () => {
    it.each(STATUS)('[REQ-021/AK-4] Status %s: Herz-Icon steht links vor dem Statusnamen', async (id, name) => {
      const w = await starte();
      await details(w, buchB({ status: id }));
      expect(herzIcon()).not.toBeNull();
      expect(vor(herzIcon()!, textElement(pille(), name))).toBe(true);
    });
  });

  describe('AK-8 Farbe des Icons in der Statuspille', () => {
    it('[REQ-021/AK-8] Herz-Icon in Rubrik „Hintergrund“, Änderung an zentraler Stelle wirkt', async () => {
      const w = await starte();
      const { wurzel } = await details(w, buchB());
      expect(ist(herzIcon()!, 'icon')).toContain(rubrik(wurzel, 'hintergrund'));
      cleanup();
      await mitRubrik('hintergrund', '#0A1B2C', async () => {
        const w2 = await starte();
        const { wurzel: w2w } = await details(w2, buchB());
        expect(ist(herzIcon()!, 'icon')).toContain(farbeVon(w2w, '#0A1B2C'));
      });
    });
    it('[REQ-021/AK-8] Gegenprobe: Herz-Icon ist nicht in „Primär“ (wäre auf der Pille unsichtbar)', async () => {
      const w = await starte();
      const { wurzel } = await details(w, buchB());
      expect(ist(herzIcon()!, 'icon')).not.toContain(rubrik(wurzel, 'primaer'));
    });
  });

  describe('AK-5 Icon je Status zentral austauschbar', () => {
    it('[REQ-021/AK-5] ein in der zentralen Zuordnung hinterlegtes anderes Icon erscheint links in der Pille', async () => {
      const w = await starte();
      const zuordnung = await zentraleIconZuordnung();
      const alt = zuordnung.lesen('gelesen');
      zuordnung.setzen('gelesen', 'icon-x.png');
      try {
        await details(w, buchB({ status: 'gelesen' }));
        expect(pille().querySelector('[data-icon="icon-x.png"]')).not.toBeNull();
        expect(herzIcon()).toBeNull();
        expect(vor(pille().querySelector('[data-icon="icon-x.png"]')!, textElement(pille(), 'gelesen'))).toBe(true);
      } finally {
        zuordnung.setzen('gelesen', alt);
      }
    });
    it('[REQ-021/AK-5] die Änderung betrifft nur den einen Status (andere bleiben beim Herz)', async () => {
      const w = await starte();
      const zuordnung = await zentraleIconZuordnung();
      const alt = zuordnung.lesen('gelesen');
      zuordnung.setzen('gelesen', 'icon-x.png');
      try {
        await details(w, buchB({ status: 'abgebrochen' }));
        expect(herzIcon()).not.toBeNull();
      } finally {
        zuordnung.setzen('gelesen', alt);
      }
    });
  });

  describe('AK-6 Auf- und Ab-Pfeile', () => {
    it.each(STATUS)('[REQ-021/AK-6] Status %s: Pille enthält die Auf-/Ab-Pfeile rechts vom Namen', async (id, name) => {
      const w = await starte();
      await details(w, buchB({ status: id }));
      expect(pfeile()).not.toBeNull();
      expect(vor(textElement(pille(), name), pfeile()!)).toBe(true);
    });
  });

  describe('AK-7 Standardstatus „ungelesen“', () => {
    it('[REQ-021/AK-7] unverändertes Buch zeigt „ungelesen“', async () => {
      const w = await starte();
      await details(w, buchB());
      expect(pillenText()).toBe('ungelesen');
    });
    it('[REQ-021/AK-7] über „Von Hand eintragen“ neu angelegtes Buch zeigt „ungelesen“', async () => {
      const w = await starte();
      const BA = w.BA;
      render(<BA bildspeicher={bilderFake()} bildquelle={{ scannen: async () => null, galerie: async () => null }} />);
      await screen.findByRole('heading', { name: 'Deine Bücher' });
      fireEvent.click(screen.getByRole('button', { name: 'Buch hinzufügen' }));
      fireEvent.click(within(await screen.findByRole('menu', { name: 'Buch hinzufügen' })).getByRole('menuitem'));
      const d = await screen.findByRole('dialog', { name: 'Manueller Eintrag' });
      fireEvent.change(within(d).getByLabelText(/^\s*Titel\s*$/i), { target: { value: 'Neu' } });
      await tippe(within(d).getByRole('button', { name: 'Hinzufügen' }));
      await screen.findByRole('region', { name: 'Buchdetails' });
      await vi.waitFor(() => expect(pille()).not.toBeNull());
      expect(pillenText()).toBe('ungelesen');
    });
  });
});

/** Zentrale Zuordnung „Status → Icon“ (@/buchdetails/statusIcons, vom Entwickler festgelegt). */
async function zentraleIconZuordnung() {
  const m = (await import('@/buchdetails/statusIcons')) as unknown as { statusIcons: Record<string, { datei: string; url: string }> };
  const z = m.statusIcons;
  return {
    lesen: (s: string) => z[s],
    setzen: (s: string, wert: unknown) => {
      z[s] = typeof wert === 'string' ? { datei: wert, url: 'data:image/png;base64,AA==' } : (wert as { datei: string; url: string });
    },
  };
}
