/**
 * Akzeptanztests REQ-022 – Statusmenü.
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

const NAMEN = ['ungelesen', 'am lesen', 'gelesen', 'abgebrochen', 'Wunschliste'];
const IDS = ['ungelesen', 'am_lesen', 'gelesen', 'abgebrochen', 'wunschliste'] as const;
async function oeffneMenue() {
  await tippe(pille());
  return (await screen.findByRole('menu', { name: 'Status wählen' })) as HTMLElement;
}
const eintraege = (m: HTMLElement) => within(m).getAllByRole('menuitem') as HTMLElement[];
async function waehle(name: string) {
  const m = await oeffneMenue();
  await tippe(eintraege(m).find((e) => norm(e.textContent) === name)!);
  await warte();
}
async function zeigeListe(w: Welt) {
  const BA = w.BA;
  render(
    <div style={farbVariablen() as CSSProperties}>
      <BA bildspeicher={bilderFake()} bildquelle={{ scannen: async () => null, galerie: async () => null }} />
    </div>,
  );
  await screen.findByRole('heading', { name: 'Deine Bücher' });
  await warte();
}
const inNochZuLesen = (titel: string) =>
  within(screen.getByRole('region', { name: 'Noch zu lesen' }))
    .queryAllByRole('listitem')
    .some((l) => norm(l.querySelector('[data-buchtitel]')?.textContent) === titel);
async function oeffneAusListe(titel: string) {
  await vi.waitFor(() => expect(inNochZuLesen(titel)).toBe(true));
  const li = within(screen.getByRole('region', { name: 'Noch zu lesen' }))
    .getAllByRole('listitem')
    .find((l) => norm(l.querySelector('[data-buchtitel]')?.textContent) === titel)!;
  await tippe(li.querySelector('[data-buchtitel]')!);
  await screen.findByRole('region', { name: 'Buchdetails' });
  await vi.waitFor(() => expect(pille()).not.toBeNull());
}
async function zurueck() {
  await tippe(within(sek()).getByRole('button', { name: 'Zurück' }));
  await screen.findByRole('heading', { name: 'Deine Bücher' });
  await warte();
}

describe('REQ-022 Statusmenü', () => {
  describe('AK-1 Menü mit allen Status in fester Reihenfolge', () => {
    it('[REQ-022/AK-1] Antippen der Pille öffnet das Menü mit genau den fünf Status in Reihenfolge', async () => {
      const w = await starte();
      await details(w, buchB());
      expect(statusmenue()).toBeNull();
      const m = await oeffneMenue();
      expect(eintraege(m).map((e) => norm(e.textContent))).toEqual(NAMEN);
    });
    it.each(IDS)('[REQ-022/AK-1] auch bei Status %s: alle fünf Einträge, Reihenfolge unverändert', async (id) => {
      const w = await starte();
      await details(w, buchB({ status: id }));
      expect(eintraege(await oeffneMenue()).map((e) => norm(e.textContent))).toEqual(NAMEN);
    });
    it('[REQ-022/AK-1] bloßes Öffnen speichert nichts', async () => {
      const w = await starte();
      const b = buchB({ status: 'gelesen' });
      await details(w, b);
      await oeffneMenue();
      expect((await gespeichert(b.id))?.status).toBe('gelesen');
    });
  });

  describe('AK-2 Position je nach Platz', () => {
    it.each([
      ['viel Platz darunter', 120, 'unten'],
      ['kein Platz darunter', 760, 'oben'],
    ] as const)('[REQ-022/AK-2] %s → Menü öffnet %s der Pille', async (_f, pilleOben, erwartet) => {
      const w = await starte();
      await details(w, buchB());
      vi.stubGlobal('innerHeight', 800);
      vi.spyOn(pille(), 'getBoundingClientRect').mockReturnValue(
        { top: pilleOben, bottom: pilleOben + 36, left: 100, right: 260, width: 160, height: 36, x: 100, y: pilleOben, toJSON() {} } as DOMRect,
      );
      const m = await oeffneMenue();
      expect(menueLage(m, pilleOben, pilleOben + 36)).toBe(erwartet);
    });
  });

  describe('AK-3 Icon je Status im Menü', () => {
    it('[REQ-022/AK-3] jeder Eintrag hat links das Herz-Icon', async () => {
      const w = await starte();
      await details(w, buchB());
      for (const e of eintraege(await oeffneMenue())) {
        const icon = e.querySelector('[data-icon="icon-herz.png"]');
        expect(icon, norm(e.textContent)).not.toBeNull();
        expect(vor(icon!, textElement(e, norm(e.textContent))), `${norm(e.textContent)}: Icon links`).toBe(true);
      }
    });
  });

  describe('AK-4 Status wählen übernimmt und schließt', () => {
    it('[REQ-022/AK-4] „ungelesen“ → „gelesen“: Menü zu, Pille zeigt „gelesen“', async () => {
      const w = await starte();
      await details(w, buchB());
      await waehle('gelesen');
      expect(statusmenue()).toBeNull();
      expect(norm(pille().textContent)).toBe('gelesen');
    });
    it.each(NAMEN)('[REQ-022/AK-4] von „abgebrochen“ aus „%s“ wählen (mit Buch-Prop)', async (name) => {
      const w = await starte();
      await details(w, buchB({ status: 'abgebrochen' }), true);
      await waehle(name);
      expect(statusmenue()).toBeNull();
      expect(norm(pille().textContent)).toBe(name);
    });
    it('[REQ-022/AK-4] zweimal hintereinander wählen: der zweite Status gilt', async () => {
      const w = await starte();
      const b = buchB();
      await details(w, b);
      await waehle('am lesen');
      await waehle('Wunschliste');
      expect(norm(pille().textContent)).toBe('Wunschliste');
      expect((await gespeichert(b.id))?.status).toBe('wunschliste');
    });
  });

  describe('AK-5 Tippen außerhalb schließt ohne Änderung', () => {
    it('[REQ-022/AK-5] Tipp auf den Hintergrund: Menü zu, weiterhin „ungelesen“, nichts gespeichert', async () => {
      const w = await starte();
      const b = buchB();
      await details(w, b);
      await oeffneMenue();
      await tippe(document.querySelector('[data-menue-hintergrund]')!);
      expect(statusmenue()).toBeNull();
      expect(norm(pille().textContent)).toBe('ungelesen');
      expect((await gespeichert(b.id))?.status).toBe('ungelesen');
    });
    it('[REQ-022/AK-5] Negativfall: Tipp in die Menüfläche (nicht auf einen Eintrag) ändert den Status nicht', async () => {
      const w = await starte();
      await details(w, buchB());
      const m = await oeffneMenue();
      await tippe(m);
      expect(norm(pille().textContent)).toBe('ungelesen');
    });
  });

  describe('AK-6 Status bleibt gespeichert', () => {
    it('[REQ-022/AK-6] „abgebrochen“ gewählt → nach Neustart zeigt die Pille „abgebrochen“', async () => {
      const w = await starte();
      const b = buchB();
      await details(w, b);
      await waehle('abgebrochen');
      cleanup();
      const w2 = await starte();
      const BD = w2.BD;
      render(<BD buchId={b.id} bildspeicher={bilderFake()} onZurueck={() => {}} jetzt={jetzt} />);
      await vi.waitFor(() => expect(norm(pille()?.textContent)).toBe('abgebrochen'));
    });
    it('[REQ-022/AK-6] Speichern des Status verliert keine anderen Buchdaten', async () => {
      const w = await starte();
      const b = buchB({ autor: 'Michael Ende', erscheinungsjahr: 1973, seitenanzahl: 300, aktuelleSeite: 20, fortschrittsmodus: 'seite', sitzungen: [{ zeitpunkt: new Date(2026, 10, 11, 9).toISOString() }] });
      await details(w, b);
      await waehle('abgebrochen');
      expect(await gespeichert(b.id)).toEqual({ ...b, status: 'abgebrochen' });
    });
  });

  describe('AK-7 Sofortige Wirkung auf die Buchlisten', () => {
    it('[REQ-022/AK-7] „am lesen“ gewählt → zurück zur Seite „Bücher“: nicht mehr in „Noch zu lesen“', async () => {
      const w = await starte();
      await w.repo.save(buchB({ titel: 'Listenbuch' }) as Buch);
      await zeigeListe(w);
      await oeffneAusListe('Listenbuch');
      await waehle('am lesen');
      await zurueck();
      expect(inNochZuLesen('Listenbuch')).toBe(false);
    });
    it('[REQ-022/AK-7] erst „am lesen“, dann wieder „ungelesen“ → steht wieder in „Noch zu lesen“', async () => {
      const w = await starte();
      await w.repo.save(buchB({ titel: 'Listenbuch' }) as Buch);
      await zeigeListe(w);
      await oeffneAusListe('Listenbuch');
      await waehle('am lesen');
      await waehle('ungelesen');
      await zurueck();
      expect(inNochZuLesen('Listenbuch')).toBe(true);
    });
    it('[REQ-022/AK-7] Wirkung bleibt nach Neustart, andere Bücher bleiben in der Liste', async () => {
      const w = await starte();
      await w.repo.save(buchB({ titel: 'Listenbuch' }) as Buch);
      await w.repo.save(buchB({ titel: 'Nachbar' }) as Buch);
      await zeigeListe(w);
      await oeffneAusListe('Listenbuch');
      await waehle('gelesen');
      await zurueck();
      expect(inNochZuLesen('Listenbuch')).toBe(false);
      expect(inNochZuLesen('Nachbar')).toBe(true);
      cleanup();
      await zeigeListe(await starte());
      await vi.waitFor(() => expect(inNochZuLesen('Nachbar')).toBe(true));
      expect(inNochZuLesen('Listenbuch')).toBe(false);
    });
  });

  describe('AK-8 Gestaltung wie das Auswahlmenü', () => {
    it('[REQ-022/AK-8] Fläche, Schrift, Schriftgröße und Icon-Farbe gleichen dem Auswahlmenü der Buchdarstellung', async () => {
      const w = await starte();
      await details(w, buchB());
      await tippe(sek().querySelector('[data-bereich="cover"]')!);
      const am = (await screen.findByRole('menu', { name: 'Bild hinzufügen' })) as HTMLElement;
      const ae = eintraege(am)[0];
      const soll = {
        flaeche: getComputedStyle(mitFlaeche(am)).backgroundColor,
        schrift: getComputedStyle(textElement(ae, norm(ae.textContent))).color,
        groesse: getComputedStyle(ae).fontSize,
        icon: ist(ae.querySelector<HTMLElement>('[data-icon]')!, 'icon'),
      };
      await tippe(document.querySelector('[data-menue-hintergrund]')!);
      expect(screen.queryByRole('menu', { name: 'Bild hinzufügen' })).toBeNull();
      const m = await oeffneMenue();
      for (const e of eintraege(m)) {
        const n = norm(e.textContent);
        expect(getComputedStyle(mitFlaeche(m)).backgroundColor, 'Fläche').toBe(soll.flaeche);
        expect(getComputedStyle(textElement(e, n)).color, `${n}: Schrift`).toBe(soll.schrift);
        expect(getComputedStyle(e).fontSize, `${n}: Schriftgröße`).toBe(soll.groesse);
        expect(ist(e.querySelector<HTMLElement>('[data-icon]')!, 'icon'), `${n}: Icon`).toEqual(soll.icon);
      }
    });
  });
});

/** Lage des Menüs relativ zur Pille aus der Inline-Positionierung (fixed: top/bottom), sonst aus data-lage. */
function menueLage(m: HTMLElement, pilleOben: number, pilleUnten: number): string {
  const s = m.style;
  const top = parseFloat(s.top);
  const bottom = parseFloat(s.bottom);
  if (!Number.isNaN(top) && Number.isNaN(bottom)) return top >= pilleUnten ? 'unten' : `unklar (top=${top})`;
  if (!Number.isNaN(bottom) && Number.isNaN(top)) return innerHeight - bottom <= pilleOben ? 'oben' : `unklar (bottom=${bottom})`;
  const a = m.getAttribute('data-lage');
  return a === 'unter' ? 'unten' : a === 'ueber' ? 'oben' : `unbekannt (${a})`;
}
