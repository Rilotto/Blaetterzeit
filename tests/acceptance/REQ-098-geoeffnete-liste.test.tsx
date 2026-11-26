/**
 * Akzeptanztests REQ-098 – Geöffnete Liste: Suche, Sortierung, Umbenennen, Löschen.
 * Abgeleitet aus dem REQ-Text; Kopf wie REQ-095 (Rollen/Texte, Vorbelegung über ListenRepository, Neustart = Module neu laden).
 */
import '@testing-library/jest-dom/vitest';
import { act, cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { IDBFactory, IDBKeyRange } from 'fake-indexeddb';
import type { ComponentType, CSSProperties } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { Buch } from '@/domain/buch';
import type { Liste, ListenArt } from '@/domain/listen';
import type { BookRepository, ImageStore, ListenRepository } from '@/storage';
import { farbVariablen } from '@/theme';

// ----------------------------------------------------------------------------- gemeinsamer Kopf Listen (REQ-095–099)
vi.mock('@/buecher/demodaten', () => ({ demoBuecher: [] }));
beforeEach(() => {
  vi.stubGlobal('indexedDB', new IDBFactory());
  vi.stubGlobal('IDBKeyRange', IDBKeyRange);
});
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});
type Komp = ComponentType<Record<string, unknown>>;
type Welt = { repo: BookRepository; listen: ListenRepository; BD: Komp; BA: Komp; BIB: Komp };
const HEUTE = new Date(2026, 10, 23, 15, 0, 0);
const jetzt = () => HEUTE;
const W = { timeout: 4000 };
const bilder = { get: async () => undefined, put: async () => {}, remove: async () => {} } as unknown as ImageStore;
const quelle = { scannen: async () => null, galerie: async () => null };
const buch = (titel = 'Der Testroman', f: Partial<Buch> = {}): Buch => ({ id: crypto.randomUUID(), titel, status: 'ungelesen', seitenanzahl: 300, ...f });
async function starte(): Promise<Welt> {
  vi.resetModules();
  const st = (await import('@/storage')) as typeof import('@/storage');
  const BD = (await import('@/views/BuchDetails')).default as unknown as Komp;
  const BA = (await import('@/views/BuecherAnsicht')).default as unknown as Komp;
  const BIB = (await import('@/views/BibliothekAnsicht')).default as unknown as Komp;
  return { repo: st.createBookRepository(), listen: st.createListenRepository(), BD, BA, BIB };
}
async function warte(ms = 40) {
  await act(async () => {
    await new Promise((r) => setTimeout(r, ms));
  });
}
async function tippe(el: Element) {
  await act(async () => {
    fireEvent.click(el);
    await new Promise((r) => setTimeout(r, 20));
  });
}
const norm = (t: string | null | undefined) => (t ?? '').replace(/[\s  ]+/g, ' ').trim();
const ohneLeer = (t: string | null | undefined) => (t ?? '').replace(/[\s  ]+/g, '');
async function liste(w: Welt, art: ListenArt, name: string): Promise<Liste> {
  const l: Liste = { id: crypto.randomUUID(), art, name };
  await w.listen.listeSpeichern(l);
  return l;
}
/** Buch in eine Liste aufnehmen; ein Band gehört seit REQ-112 zum Buch (Buch.bandnummer), nicht zur Zugehörigkeit. */
async function zuordnen(w: Welt, l: Liste, b: Buch, band?: number) {
  if (band !== undefined) await w.repo.save({ ...((await w.repo.get(b.id)) ?? b), bandnummer: band });
  await w.listen.zuordnen({ listeId: l.id, buchId: b.id });
}
/** Bandnummer des Buches (REQ-112). */
const bandVon = async (w: Welt, b: Buch) => (await w.repo.get(b.id))?.bandnummer;
/** Zugehörigkeiten ohne Bandangabe (nur listeId/buchId). */
const zugOhneBand = async (w: Welt) => (await w.listen.zugehoerigkeiten()).map((z) => ({ listeId: z.listeId, buchId: z.buchId }));
/** Element sichtbar (kein hidden, aria-hidden, display:none, inert in der Kette). */
function sichtbar(el: Element | null): boolean {
  for (let n = el as HTMLElement | null; n; n = n.parentElement) {
    if (n.hidden || n.getAttribute('aria-hidden') === 'true' || n.hasAttribute('inert') || n.style?.display === 'none') return false;
  }
  return true;
}
/** Kleinste sichtbare Elemente mit genau diesem Text. */
function textEls(text: string | RegExp, root: ParentNode = document.body): HTMLElement[] {
  const passt = (t: string) => (typeof text === 'string' ? t === text : text.test(t));
  const k = Array.from(root.querySelectorAll<HTMLElement>('*')).filter((e) => passt(norm(e.textContent)) && sichtbar(e));
  return k.filter((c) => !k.some((o) => o !== c && c.contains(o)));
}
const istKnopf = (e: Element) => e.tagName === 'BUTTON' || e.getAttribute('role') === 'button' || e.tagName === 'A';
const vor = (a: Node, b: Node) => Boolean(a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING);
/** Buchdetails anzeigen (Repositories der App), optional Reiter „Details“ öffnen. */
async function details(w: Welt, id: string, reiterDetails = true) {
  const BD = w.BD;
  render(
    <div data-testwurzel="" style={farbVariablen() as CSSProperties}>
      <BD buchId={id} jetzt={jetzt} bildspeicher={bilder} bildquelle={quelle} onZurueck={() => {}} />
    </div>,
  );
  const d = await screen.findByRole('region', { name: 'Buchdetails' }, W);
  await vi.waitFor(() => expect(within(d).queryAllByRole('button').length).toBeGreaterThan(0), W);
  await warte(30);
  if (reiterDetails) {
    const r = within(d).queryByRole('tab', { name: 'Details' }) ?? within(d).getAllByRole('button', { name: 'Details' })[0];
    await tippe(r);
    await vi.waitFor(() => expect(within(d).getByRole('heading', { name: ABSCHNITT })).toBeInTheDocument(), W);
  }
  return d;
}
async function neustartDetails(id: string, reiterDetails = true) {
  cleanup();
  const w = await starte();
  return { w, d: await details(w, id, reiterDetails) };
}
/** Oberstes geöffnetes Blatt/Fenster. */
const blatt = () => screen.getAllByRole('dialog').at(-1)!;
const checkboxen = (root: HTMLElement) => within(root).queryAllByRole('checkbox');
const haken = (root: HTMLElement, name: string) => within(root).getByRole('checkbox', { name: new RegExp(name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')) });
const angehakt = (cb: HTMLElement) => (cb as HTMLInputElement).checked === true || cb.getAttribute('aria-checked') === 'true';
/** Die Schaltfläche „+“ (Text „+“ oder Beschriftung „+“/„Neue …“). */
function plus(root: HTMLElement = document.body) {
  const k = within(root)
    .queryAllByRole('button')
    .filter((b) => norm(b.textContent) === '+' || /^(\+|Neue (Saga|Sammlung|Bibliothek)|Liste anlegen|Neue Liste|Bücher (hinzufügen|auswählen))$/i.test(b.getAttribute('aria-label') ?? ''));
  expect(k.length, '„+“').toBeGreaterThan(0);
  return k.at(-1)!;
}
/** „+“ antippen, Namen eintragen und bestätigen (Art der Bestätigung legt der Entwickler fest). */
async function neuerName(root: HTMLElement, name: string) {
  const felderVorher = new Set(screen.queryAllByRole('textbox'));
  await tippe(plus(root));
  const f = await vi.waitFor(() => {
    const x = screen.queryAllByRole('textbox').find((e) => !felderVorher.has(e) && !/band/i.test(e.getAttribute('aria-label') ?? ''));
    expect(x, 'Eingabefeld für den Namen').toBeDefined();
    return x as HTMLInputElement;
  }, W);
  const knoepfeVorher = new Set(screen.queryAllByRole('button'));
  fireEvent.change(f, { target: { value: name } });
  const bestaetigen = screen
    .queryAllByRole('button')
    .filter((b) => b !== f && !/^(Schließen|Abbrechen|Zurück|Sichern)$/.test(b.getAttribute('aria-label') ?? norm(b.textContent)))
    .filter((b) => /^(Anlegen|OK|Hinzufügen|Übernehmen|Bestätigen|Fertig|✓)$/i.test(b.getAttribute('aria-label') ?? norm(b.textContent)) && (!knoepfeVorher.has(b) || b.closest('form') === f.closest('form')));
  if (bestaetigen.length) await tippe(bestaetigen.at(-1)!);
  else if (f.form) {
    await act(async () => {
      fireEvent.submit(f.form!);
      await new Promise((r) => setTimeout(r, 20));
    });
  } else {
    await act(async () => {
      fireEvent.keyDown(f, { key: 'Enter', code: 'Enter' });
      await new Promise((r) => setTimeout(r, 20));
    });
  }
  await warte(30);
}
const sichern = async (root: HTMLElement) => tippe(within(root).getByRole('button', { name: 'Sichern' }));
async function schliessen(root: HTMLElement) {
  await tippe(within(root).getByRole('button', { name: 'Schließen' }));
  await warte(30);
}
const markiert = (el: Element | null) => !!el && (el.getAttribute('aria-invalid') === 'true' || el.getAttribute('data-fehler') === 'true');
/** Feld „Band“ (optional zu einer Saga). */
const bandFelder = (root: HTMLElement) => within(root).queryAllByLabelText(/Band/).filter((e) => e.tagName === 'INPUT') as HTMLInputElement[];
function bandFeld(root: HTMLElement, saga: string) {
  const alle = bandFelder(root);
  if (alle.length === 1) return alle[0];
  return alle.find((f) => {
    for (let n = f.parentElement; n && n !== root; n = n.parentElement) {
      const c = within(n).queryAllByRole('checkbox');
      if (c.length) return c.length === 1 && (c[0].getAttribute('aria-label') ?? norm(c[0].closest('label')?.textContent ?? n.textContent)).includes(saga);
    }
    return false;
  });
}
const ARTEN = [
  ['saga', 'Saga', 'Sagas', '+ Zu einer Saga hinzufügen', 'In Saga'],
  ['sammlung', 'Sammlung', 'Sammlungen', '+ Zu einer Sammlung hinzufügen', 'In Sammlung'],
  ['bibliothek', 'Bibliothek', 'Bibliotheken', '+ Zu einer Bibliothek hinzufügen', 'In Bibliotheken'],
] as const;
// ----------------------------------------------------------------------------- Abschnitt in den Buchdetails
const ABSCHNITT = 'Sagas, Sammlungen und Bibliotheken';
/** Elemente des Abschnitts: ab seiner Überschrift bis zur nächsten Überschrift. */
function abschnitt(d: HTMLElement) {
  const hs = within(d).getAllByRole('heading');
  const i = hs.findIndex((h) => norm(h.textContent) === ABSCHNITT);
  expect(i, `Überschrift „${ABSCHNITT}“`).toBeGreaterThanOrEqual(0);
  const von = hs[i];
  const bis = hs[i + 1];
  return Array.from(d.querySelectorAll<HTMLElement>('*')).filter((e) => vor(von, e) && !von.contains(e) && (!bis || vor(e, bis)) && sichtbar(e));
}
const pillen = (d: HTMLElement) => abschnitt(d).filter((e) => istKnopf(e) && /^\+ ?Zu einer /.test(norm(e.textContent)));
const pillenTexte = (d: HTMLElement) => pillen(d).map((e) => norm(e.textContent));
/** Zeile „In Saga/In Sammlung/In Bibliotheken“: kleinstes Element, das mit der Bezeichnung beginnt und den Pfeil enthält. */
function zeile(d: HTMLElement, bez: string) {
  const k = abschnitt(d).filter((e) => norm(e.textContent).startsWith(bez) && norm(e.textContent).includes('›'));
  return k.find((c) => !k.some((o) => o !== c && c.contains(o)));
}
/** Wert der Zeile ohne Bezeichnung und Pfeil. */
const zeilenWert = (d: HTMLElement, bez: string) => norm(norm(zeile(d, bez)?.textContent).slice(bez.length).replace('›', ''));
void [bandVon, zugOhneBand, ohneLeer, textEls, zuordnen, blatt, zeilenWert, pillenTexte, neustartDetails, haken, angehakt, neuerName, sichern, schliessen, markiert, bandFeld, ARTEN, checkboxen];
/** Wert der Zeile „Band“ der Karte „Ausgabe“ (REQ-112), Reiter „Details“ aktiv. */
function ausgabeBand(d: HTMLElement) {
  const z = Array.from(d.querySelectorAll<HTMLElement>('[data-ausgabe-zeile]')).find((e) => norm(e.querySelector('[data-zeile-bezeichnung]')?.textContent) === 'Band');
  expect(z, 'Zeile „Band“ in der Karte „Ausgabe“').toBeDefined();
  return norm(z!.querySelector('[data-zeile-wert]')?.textContent);
}
// ----------------------------------------------------------------------------- Ende Kopf

async function seiteBuecher(w: Welt) {
  const BA = w.BA;
  render(
    <div data-testwurzel="" style={farbVariablen() as CSSProperties}>
      <BA bildspeicher={bilder} bildquelle={quelle} jetzt={jetzt} />
    </div>,
  );
  await screen.findByRole('heading', { name: 'Deine Bücher' }, W);
  await warte(80);
}
/** Liste öffnen: Sagas/Sammlungen über die Seite „Bücher“, Bibliotheken über die Zielansicht des Menüpunkts „Bibliothek“. */
async function oeffne(w: Welt, l: Liste) {
  if (l.art === 'bibliothek') {
    const BIB = w.BIB;
    render(<BIB bildspeicher={bilder} bildquelle={quelle} jetzt={jetzt} />);
    await vi.waitFor(() => expect(textEls(l.name).length).toBeGreaterThan(0), W);
    await tippe(textEls(l.name)[0]);
  } else {
    await seiteBuecher(w);
    const r = screen.getByRole('region', { name: l.art === 'saga' ? 'Sagas' : 'Sammlungen' });
    await vi.waitFor(() => expect(textEls(l.name, r).length).toBeGreaterThan(0), W);
    await tippe(textEls(l.name, r)[0]);
  }
  await vi.waitFor(() => expect(ueberschrift(l.name)).toBeDefined(), W);
  await warte(40);
}
const ueberschrift = (name: string) => screen.queryAllByRole('heading', { name }).filter((h) => sichtbar(h)).at(-1);
/** Stift neben dem Listennamen. */
function stift(name: string) {
  const h = ueberschrift(name)!;
  for (let n = h.parentElement; n; n = n.parentElement) {
    const k = within(n).queryAllByRole('button').filter((b) => !h.contains(b));
    const s = k.find((b) => /bearbeit|umbenenn|ändern|stift/i.test(b.getAttribute('aria-label') ?? norm(b.textContent))) ?? k[0];
    if (s) return s;
  }
  throw new Error('kein Stift');
}
/** Reihenfolge der genannten Titel (nur sichtbare, nach Dokumentposition). */
function reihenfolge(titel: string[]) {
  const pos = titel.map((t) => ({ t, el: textEls(t)[0] })).filter((x) => x.el);
  return pos.sort((a, b) => (vor(a.el, b.el) ? -1 : 1)).map((x) => x.t);
}
const sortierKnopf = () => screen.getAllByRole('button').find((b) => /^(A–Z|A-Z|Nach Bänden|nach Bänden)$/i.test(norm(b.textContent)) && sichtbar(b))!;
async function sortiereAuf(ziel: 'A–Z' | 'Nach Bänden') {
  const k = sortierKnopf();
  if (norm(k.textContent).toLowerCase().replace('-', '–') === ziel.toLowerCase()) return;
  await tippe(k);
  const m = screen.queryByRole('menuitem', { name: new RegExp(ziel, 'i') }) ?? screen.queryByRole('menuitemradio', { name: new RegExp(ziel, 'i') });
  if (m) await tippe(m);
  await warte(30);
}
const zurueck = () => screen.getAllByRole('button', { name: 'Zurück' }).filter((b) => sichtbar(b)).at(-1)!;
const anzahlText = () => textEls(/^(\d+ Bücher|1 Buch)$/).map((e) => norm(e.textContent));
/** Rückfrage „Liste löschen“ (alertdialog oder dialog mit Bestätigung). */
function rueckfrage() {
  const d = [...screen.queryAllByRole('alertdialog'), ...screen.queryAllByRole('dialog')].at(-1);
  expect(d, 'Rückfrage').toBeDefined();
  return d!;
}
const JA = /^(Löschen|Ja|Bestätigen|Liste löschen|Ja, löschen)$/;
const NEIN = /^(Abbrechen|Nein|Behalten)$/;

describe('REQ-098 Geöffnete Liste', () => {
  async function fuenfBuecher(w: Welt) {
    const bs = ['Zorn', 'Asche', 'Mond', 'Birke', 'Kiesel'].map((t) => buch(t));
    for (const b of bs) await w.repo.save(b);
    return bs;
  }

  describe('AK-1 Bücher der Liste', () => {
    it('[REQ-098/AK-1] „Lieblingsbücher“ mit zwei von fünf Büchern: genau diese zwei A–Z, „2 Bücher“, Name mit Stift, Suche, Plus, Sortierknopf, Raster/Liste; keine Filterleiste', async () => {
      const w = await starte();
      const bs = await fuenfBuecher(w);
      const l = await liste(w, 'sammlung', 'Lieblingsbücher');
      await zuordnen(w, l, bs[0]); // Zorn
      await zuordnen(w, l, bs[3]); // Birke
      await oeffne(w, l);
      expect(reihenfolge(['Zorn', 'Birke'])).toEqual(['Birke', 'Zorn']);
      for (const t of ['Asche', 'Mond', 'Kiesel']) expect(textEls(t), t).toHaveLength(0);
      expect(anzahlText()).toEqual(['2 Bücher']);
      expect(stift('Lieblingsbücher')).toBeInTheDocument();
      expect(screen.getAllByRole('searchbox').filter(sichtbar).length).toBeGreaterThan(0);
      expect(plus()).toBeInTheDocument();
      expect(sortierKnopf()).toBeDefined();
      expect(screen.getAllByRole('group', { name: 'Ansicht' }).filter(sichtbar).length).toBeGreaterThan(0);
      expect(screen.queryAllByRole('group', { name: 'Filter' }).filter(sichtbar)).toHaveLength(0);
      expect(screen.queryByRole('heading', { name: 'Deine Bücher' })).toBeNull();
    });

    it('[REQ-098/AK-1] Grenzfall: ein Buch → „1 Buch“; Bibliothek wird ebenso A–Z gezeigt', async () => {
      const w = await starte();
      const bs = await fuenfBuecher(w);
      const l = await liste(w, 'bibliothek', 'Zuhause');
      await zuordnen(w, l, bs[2]);
      await oeffne(w, l);
      expect(anzahlText()).toEqual(['1 Buch']);
      expect(textEls('Mond').length).toBeGreaterThan(0);
    });

    it('[REQ-098/AK-1] Suche nach Titel grenzt die Bücher der Liste ein, Anzahl zählt die Treffer', async () => {
      const w = await starte();
      const bs = await fuenfBuecher(w);
      const l = await liste(w, 'sammlung', 'Lieblingsbücher');
      for (const b of bs.slice(0, 3)) await zuordnen(w, l, b);
      await oeffne(w, l);
      fireEvent.change(screen.getAllByRole('searchbox').filter(sichtbar)[0], { target: { value: 'Asch' } });
      await warte(40);
      expect(anzahlText()).toEqual(['1 Buch']);
      expect(textEls('Zorn')).toHaveLength(0);
      expect(textEls('Asche').length).toBeGreaterThan(0);
    });

    it('[REQ-098/AK-1] Buchtitel stehen ohne Bandnummer (auch in einer Saga mit Bänden)', async () => {
      const w = await starte();
      const bs = await fuenfBuecher(w);
      const s = await liste(w, 'saga', 'Steine');
      await zuordnen(w, s, bs[4], 1);
      await oeffne(w, s);
      expect(textEls('Kiesel').length).toBeGreaterThan(0);
      expect(textEls(/^Band \d+/)).toHaveLength(0);
    });
  });

  // --------------------------------------------------------------------------- Plus: Bücherauswahl (AK-6 bis AK-9)
  /** Saga „The Empyrean“ mit „Fourth Wing“ (Band 1), außerdem „Onyx Storm“ und „Iron Flame“ gespeichert. */
  async function empyrean(art: ListenArt = 'saga', name = 'The Empyrean') {
    const w = await starte();
    const fw = buch('Fourth Wing');
    const os = buch('Onyx Storm');
    const ir = buch('Iron Flame');
    for (const b of [fw, os, ir]) await w.repo.save(b);
    const l = await liste(w, art, name);
    await zuordnen(w, l, fw, art === 'saga' ? 1 : undefined);
    await oeffne(w, l);
    return { w, l, fw, os, ir };
  }
  /** Plus der geöffneten Liste antippen und das Auswahlblatt liefern. */
  async function auswahl() {
    const dialogeVorher = screen.queryAllByRole('dialog').length;
    await tippe(plus());
    await vi.waitFor(() => expect(screen.queryAllByRole('dialog').length, 'Blatt „Bücher auswählen“').toBeGreaterThan(dialogeVorher), W);
    await warte(40);
    return blatt();
  }
  const MARKIERBAR = ['checkbox', 'option', 'switch', 'menuitemcheckbox', 'button'] as const;
  /** Eintrag eines Buches im Auswahlblatt (Rolle mit Namen, der den Titel enthält). */
  function eintrag(bl: HTMLElement, titel: string): HTMLElement {
    for (const r of MARKIERBAR) {
      const k = within(bl)
        .queryAllByRole(r)
        .filter((e) => (e.getAttribute('aria-label') ?? norm(e.textContent)).includes(titel) || norm(e.closest('label')?.textContent).includes(titel));
      if (k.length) return k[0];
    }
    throw new Error(`kein Eintrag „${titel}“ im Auswahlblatt`);
  }
  const istMarkiert = (e: HTMLElement) =>
    (e as HTMLInputElement).checked === true || ['aria-checked', 'aria-pressed', 'aria-selected'].some((a) => e.getAttribute(a) === 'true');
  /** Titel im Blatt in Dokumentreihenfolge (nur die drei bzw. übergebenen Titel). */
  function blattReihenfolge(bl: HTMLElement, titel: string[]) {
    const pos = titel.map((t) => ({ t, el: textEls(t, bl)[0] ?? eintrag(bl, t) }));
    return pos.sort((a, b) => (vor(a.el, b.el) ? -1 : 1)).map((x) => x.t);
  }
  const zugVon = async (w: Welt, l: Liste) => (await w.listen.zugehoerigkeiten()).filter((z) => z.listeId === l.id);
  const DREI_TITEL = ['Fourth Wing', 'Iron Flame', 'Onyx Storm'];

  describe('AK-6 Plus zeigt alle Bücher zur Auswahl, enthaltene vormarkiert', () => {
    it('[REQ-098/AK-6] Saga „The Empyrean“: Blatt mit allen Büchern A–Z, „Fourth Wing“ markiert, die anderen nicht; ohne Suche, scrollbar', async () => {
      await empyrean();
      const bl = await auswahl();
      expect(blattReihenfolge(bl, ['Onyx Storm', 'Fourth Wing', 'Iron Flame'])).toEqual(DREI_TITEL);
      expect(istMarkiert(eintrag(bl, 'Fourth Wing'))).toBe(true);
      expect(istMarkiert(eintrag(bl, 'Iron Flame'))).toBe(false);
      expect(istMarkiert(eintrag(bl, 'Onyx Storm'))).toBe(false);
      expect(within(bl).queryAllByRole('searchbox')).toHaveLength(0);
      expect(within(bl).getByRole('button', { name: 'Sichern' })).toBeInTheDocument();
      const scroll = Array.from(bl.querySelectorAll<HTMLElement>('*')).concat(bl).some((e) => /auto|scroll/.test(getComputedStyle(e).overflowY || getComputedStyle(e).overflow) && e.contains(textEls('Onyx Storm', bl)[0] ?? eintrag(bl, 'Onyx Storm')));
      expect(scroll, 'scrollbare Liste').toBe(true);
    });

    it('[REQ-098/AK-6] je Buch Cover bzw. Cover-Platzhalter: drei Einträge, keine Bandnummer, keine Liste und kein Buch angelegt, kein Menü „Buch hinzufügen“', async () => {
      const { w } = await empyrean();
      const listenVorher = (await w.listen.listen()).length;
      const bl = await auswahl();
      for (const t of DREI_TITEL) expect(eintrag(bl, t), t).toBeDefined();
      expect(textEls(/^Band \d+/, bl)).toHaveLength(0);
      expect(within(bl).queryAllByRole('textbox')).toHaveLength(0);
      expect(screen.queryByRole('menu', { name: 'Buch hinzufügen' })).toBeNull();
      expect(screen.queryByRole('dialog', { name: 'Manueller Eintrag' })).toBeNull();
      await warte(60);
      expect((await w.listen.listen()).length).toBe(listenVorher);
      expect((await w.repo.list()).length).toBe(3);
    });

    it.each(['sammlung', 'bibliothek'] as const)('[REQ-098/AK-6] Variante %s: Plus zeigt dieselbe Auswahl (A–Z, enthaltenes Buch vormarkiert), legt keine Liste an', async (art) => {
      const { w } = await empyrean(art, art === 'sammlung' ? 'Lieblingsbücher' : 'Zuhause');
      const bl = await auswahl();
      expect(blattReihenfolge(bl, ['Iron Flame', 'Onyx Storm', 'Fourth Wing'])).toEqual(DREI_TITEL);
      expect(istMarkiert(eintrag(bl, 'Fourth Wing'))).toBe(true);
      expect(istMarkiert(eintrag(bl, 'Onyx Storm'))).toBe(false);
      expect(within(bl).queryAllByRole('textbox')).toHaveLength(0);
      await warte(60);
      expect((await w.listen.listen()).length).toBe(1);
    });

    it('[REQ-098/AK-6] Grenzfall: Liste ohne Bücher → alle Bücher unmarkiert; Buch in einer anderen Liste ist hier nicht vormarkiert', async () => {
      const w = await starte();
      const [a, b] = [buch('Alpha'), buch('Beta')];
      for (const x of [a, b]) await w.repo.save(x);
      const andere = await liste(w, 'saga', 'Andere');
      await zuordnen(w, andere, a, 1);
      const leer = await liste(w, 'saga', 'Leer');
      await oeffne(w, leer);
      const bl = await auswahl();
      expect(istMarkiert(eintrag(bl, 'Alpha'))).toBe(false);
      expect(istMarkiert(eintrag(bl, 'Beta'))).toBe(false);
    });
  });

  describe('AK-7 Markieren und Entmarkieren', () => {
    it('[REQ-098/AK-7] „Iron Flame“, „Onyx Storm“, nochmals „Onyx Storm“ → „Fourth Wing“ und „Iron Flame“ markiert, „Onyx Storm“ nicht', async () => {
      await empyrean();
      const bl = await auswahl();
      await tippe(eintrag(bl, 'Iron Flame'));
      await tippe(eintrag(bl, 'Onyx Storm'));
      expect(istMarkiert(eintrag(blatt(), 'Onyx Storm'))).toBe(true);
      await tippe(eintrag(blatt(), 'Onyx Storm'));
      expect(istMarkiert(eintrag(blatt(), 'Fourth Wing'))).toBe(true);
      expect(istMarkiert(eintrag(blatt(), 'Iron Flame'))).toBe(true);
      expect(istMarkiert(eintrag(blatt(), 'Onyx Storm'))).toBe(false);
    });

    it('[REQ-098/AK-7] vormarkiertes Buch entmarkieren und wieder markieren; Markieren allein speichert nichts', async () => {
      const { w, l, fw } = await empyrean();
      const bl = await auswahl();
      await tippe(eintrag(bl, 'Fourth Wing'));
      expect(istMarkiert(eintrag(blatt(), 'Fourth Wing'))).toBe(false);
      await tippe(eintrag(blatt(), 'Iron Flame'));
      await warte(60);
      expect((await zugVon(w, l)).map((z) => z.buchId)).toEqual([fw.id]);
      await tippe(eintrag(blatt(), 'Fourth Wing'));
      expect(istMarkiert(eintrag(blatt(), 'Fourth Wing'))).toBe(true);
    });
  });

  describe('AK-8 Sichern übernimmt Hinzufügen und Herausnehmen', () => {
    it('[REQ-098/AK-8] „Iron Flame“ markiert, „Fourth Wing“ entmarkiert, Sichern → nur „Iron Flame“, „1 Buch“, Blatt zu; auch nach Neustart; „Fourth Wing“ bleibt als Buch', async () => {
      const { l, fw, ir } = await empyrean();
      const bl = await auswahl();
      await tippe(eintrag(bl, 'Iron Flame'));
      await tippe(eintrag(blatt(), 'Fourth Wing'));
      await sichern(blatt());
      await vi.waitFor(() => expect(screen.queryAllByRole('dialog')).toHaveLength(0), W);
      await vi.waitFor(() => expect(anzahlText()).toEqual(['1 Buch']), W);
      expect(textEls('Iron Flame').length).toBeGreaterThan(0);
      expect(textEls('Fourth Wing')).toHaveLength(0);
      await warte(60);
      cleanup();
      const w2 = await starte();
      expect((await zugVon(w2, l)).map((z) => z.buchId)).toEqual([ir.id]);
      expect(await w2.repo.get(fw.id)).toBeDefined();
      expect((await w2.repo.list()).length).toBe(3);
      await oeffne(w2, l);
      expect(anzahlText()).toEqual(['1 Buch']);
      expect(textEls('Iron Flame').length).toBeGreaterThan(0);
    });

    it('[REQ-098/AK-8] Mehrfachauswahl: zwei Bücher hinzufügen → „3 Bücher“; enthaltenes Buch behält Band 1, neues ohne Scan-Band bekommt keinen Band', async () => {
      const { w, l, fw, os, ir } = await empyrean();
      const bl = await auswahl();
      await tippe(eintrag(bl, 'Iron Flame'));
      await tippe(eintrag(blatt(), 'Onyx Storm'));
      await sichern(blatt());
      await vi.waitFor(() => expect(anzahlText()).toEqual(['3 Bücher']), W);
      await warte(60);
      const zug = await zugVon(w, l);
      expect(zug.map((z) => z.buchId).sort()).toEqual([fw.id, os.id, ir.id].sort());
      // Fassung 2026-11-25 (REQ-112): Hinzufügen ändert die Bandnummer des Buches nicht.
      expect(await bandVon(w, fw)).toBe(1);
      expect(await bandVon(w, ir)).toBeUndefined();
      expect(await bandVon(w, os)).toBeUndefined();
    });

    it('[REQ-098/AK-8] Bandnummer aus dem Scan: neu hinzugefügtes Buch mit Scan-Band 3 erhält in der Saga Band 3', async () => {
      const w = await starte();
      const gescannt = buch('Onyx Storm', { bandnummer: 3 });
      await w.repo.save(gescannt);
      const s = await liste(w, 'saga', 'The Empyrean');
      await oeffne(w, s);
      await tippe(eintrag(await auswahl(), 'Onyx Storm'));
      await sichern(blatt());
      await vi.waitFor(() => expect(anzahlText()).toEqual(['1 Buch']), W);
      await warte(60);
      expect((await zugVon(w, s)).map((z) => z.buchId)).toEqual([gescannt.id]);
      expect(await bandVon(w, gescannt)).toBe(3);
    });

    it('[REQ-098/AK-8] Grenzfall: alle entmarkieren und sichern → Liste bleibt bestehen, leer, Bücher bleiben', async () => {
      const { w, l } = await empyrean('sammlung', 'Lieblingsbücher');
      await tippe(eintrag(await auswahl(), 'Fourth Wing'));
      await sichern(blatt());
      await vi.waitFor(() => expect(screen.queryAllByRole('dialog')).toHaveLength(0), W);
      await warte(60);
      expect(await zugVon(w, l)).toEqual([]);
      expect((await w.listen.listen()).map((x) => x.id)).toEqual([l.id]);
      expect((await w.repo.list()).length).toBe(3);
      expect(ueberschrift('Lieblingsbücher')).toBeDefined();
    });

    it('[REQ-098/AK-8] Sichern ohne Änderung lässt Zugehörigkeit und Band unverändert; andere Listen bleiben unberührt', async () => {
      const { w, l, fw, ir } = await empyrean();
      const andere = await liste(w, 'sammlung', 'Andere');
      await zuordnen(w, andere, ir);
      await sichern(await auswahl());
      await vi.waitFor(() => expect(screen.queryAllByRole('dialog')).toHaveLength(0), W);
      await warte(60);
      expect((await zugVon(w, l)).map((z) => z.buchId)).toEqual([fw.id]);
      expect(await bandVon(w, fw)).toBe(1);
      expect((await zugVon(w, andere)).map((z) => z.buchId)).toEqual([ir.id]);
    });
  });

  describe('AK-9 Schließen ohne Sichern verwirft', () => {
    it('[REQ-098/AK-9] Markierungen geändert, Blatt geschlossen → Saga enthält unverändert nur „Fourth Wing“ (Band 1), auch nach Neustart', async () => {
      const { l, fw } = await empyrean();
      const bl = await auswahl();
      await tippe(eintrag(bl, 'Iron Flame'));
      await tippe(eintrag(blatt(), 'Fourth Wing'));
      await schliessen(blatt());
      await vi.waitFor(() => expect(screen.queryAllByRole('dialog')).toHaveLength(0), W);
      expect(anzahlText()).toEqual(['1 Buch']);
      expect(textEls('Fourth Wing').length).toBeGreaterThan(0);
      expect(textEls('Iron Flame')).toHaveLength(0);
      await warte(60);
      cleanup();
      const w2 = await starte();
      expect((await zugVon(w2, l)).map((z) => z.buchId)).toEqual([fw.id]);
      expect(await bandVon(w2, fw)).toBe(1);
    });

    it('[REQ-098/AK-9] nach Verwerfen öffnet das Plus erneut mit dem gespeicherten Stand (nur „Fourth Wing“ markiert)', async () => {
      await empyrean('bibliothek', 'Zuhause');
      await tippe(eintrag(await auswahl(), 'Onyx Storm'));
      await schliessen(blatt());
      await vi.waitFor(() => expect(screen.queryAllByRole('dialog')).toHaveLength(0), W);
      const bl = await auswahl();
      expect(istMarkiert(eintrag(bl, 'Fourth Wing'))).toBe(true);
      expect(istMarkiert(eintrag(bl, 'Onyx Storm'))).toBe(false);
    });
  });

  describe('AK-2 Saga nach Bänden', () => {
    async function crescent() {
      const w = await starte();
      const s = await liste(w, 'saga', 'Crescent City');
      for (const [t, band] of [['House of Sky and Breath', 2], ['House of Earth and Blood', 1], ['House of Flame and Shadow', 3]] as const) {
        const b = buch(t);
        await w.repo.save(b);
        await zuordnen(w, s, b, band);
      }
      return { w, s };
    }
    const DREI = ['House of Earth and Blood', 'House of Sky and Breath', 'House of Flame and Shadow'];

    it('[REQ-098/AK-2] „nach Bänden“ (Voreinstellung): Band 1, 2, 3; kein „Band X“ vor dem Titel', async () => {
      const { w, s } = await crescent();
      await oeffne(w, s);
      expect(norm(sortierKnopf().textContent)).toMatch(/nach Bänden/i);
      expect(reihenfolge(DREI)).toEqual(DREI);
      expect(textEls(/^Band \d+/)).toHaveLength(0);
      for (const t of DREI) expect(textEls(t).length, t).toBeGreaterThan(0);
    });

    it('[REQ-098/AK-2] nach Umschalten auf „A–Z“: Earth, Flame, Sky; zurück auf „nach Bänden“ wieder 1, 2, 3', async () => {
      const { w, s } = await crescent();
      await oeffne(w, s);
      await sortiereAuf('A–Z');
      expect(reihenfolge(DREI)).toEqual(['House of Earth and Blood', 'House of Flame and Shadow', 'House of Sky and Breath']);
      await sortiereAuf('Nach Bänden');
      expect(reihenfolge(DREI)).toEqual(DREI);
    });

    it('[REQ-098/AK-2] Grenzfall: Bücher ohne Band stehen nach den Bänden, untereinander A–Z', async () => {
      const { w, s } = await crescent();
      for (const t of ['Zusatz', 'Anhang']) {
        const b = buch(t);
        await w.repo.save(b);
        await zuordnen(w, s, b);
      }
      await oeffne(w, s);
      expect(reihenfolge([...DREI, 'Zusatz', 'Anhang'])).toEqual([...DREI, 'Anhang', 'Zusatz']);
    });

    it('[REQ-098/AK-2] Grenzfall: Band 10 steht nach Band 9 (numerisch, nicht als Text)', async () => {
      const w = await starte();
      const s = await liste(w, 'saga', 'Lang');
      for (const [t, band] of [['Zehn', 10], ['Neun', 9]] as const) {
        const b = buch(t);
        await w.repo.save(b);
        await zuordnen(w, s, b, band);
      }
      await oeffne(w, s);
      expect(reihenfolge(['Zehn', 'Neun'])).toEqual(['Neun', 'Zehn']);
    });

    it('[REQ-098/AK-2] Sammlung: Bücher A–Z, kein Umschalten auf „nach Bänden“ nötig', async () => {
      const w = await starte();
      const bs = await fuenfBuecher(w);
      const l = await liste(w, 'sammlung', 'Alle');
      for (const b of bs) await zuordnen(w, l, b);
      await oeffne(w, l);
      expect(reihenfolge(['Zorn', 'Asche', 'Mond', 'Birke', 'Kiesel'])).toEqual(['Asche', 'Birke', 'Kiesel', 'Mond', 'Zorn']);
    });
  });

  describe('AK-3 Umbenennen', () => {
    it('[REQ-098/AK-3] Stift, „Herzensbücher“, Sichern: Liste heißt überall „Herzensbücher“, auch nach Neustart', async () => {
      const w = await starte();
      const b = buch('Momo');
      await w.repo.save(b);
      const l = await liste(w, 'sammlung', 'Lieblingsbücher');
      await zuordnen(w, l, b);
      await oeffne(w, l);
      await tippe(stift('Lieblingsbücher'));
      const bl = blatt();
      const f = within(bl).getByRole('textbox') as HTMLInputElement;
      expect(f.value).toBe('Lieblingsbücher');
      expect(within(bl).getByRole('button', { name: 'Sichern' })).toBeInTheDocument();
      expect(within(bl).getByRole('button', { name: /Liste löschen/ })).toBeInTheDocument();
      fireEvent.change(f, { target: { value: 'Herzensbücher' } });
      await sichern(bl);
      await vi.waitFor(() => expect(ueberschrift('Herzensbücher')).toBeDefined(), W);
      expect(ueberschrift('Lieblingsbücher')).toBeUndefined();
      await warte(60);
      cleanup();
      const w2 = await starte();
      expect((await w2.listen.listen()).map((x) => [x.id, x.name])).toEqual([[l.id, 'Herzensbücher']]);
      // überall: auch in den Buchdetails (REQ-095)
      const d = await details(w2, b.id);
      expect(zeilenWert(d, 'In Sammlung')).toBe('Herzensbücher');
    });

    it.each(['', '   '])('[REQ-098/AK-3] Negativfall: Name „%s“ wird nicht gesichert, Feld hervorgehoben, Blatt offen', async (ein) => {
      const w = await starte();
      const l = await liste(w, 'sammlung', 'Lieblingsbücher');
      await oeffne(w, l);
      await tippe(stift('Lieblingsbücher'));
      const f = within(blatt()).getByRole('textbox');
      fireEvent.change(f, { target: { value: ein } });
      await sichern(blatt());
      await warte(60);
      expect(screen.queryAllByRole('dialog').length).toBeGreaterThan(0);
      expect(markiert(within(blatt()).getByRole('textbox'))).toBe(true);
      expect((await w.listen.listen())[0].name).toBe('Lieblingsbücher');
    });

    it('[REQ-098/AK-3] Schließen ohne Sichern verwirft den neuen Namen', async () => {
      const w = await starte();
      const l = await liste(w, 'saga', 'The Empyrean');
      await oeffne(w, l);
      await tippe(stift('The Empyrean'));
      fireEvent.change(within(blatt()).getByRole('textbox'), { target: { value: 'Anders' } });
      await schliessen(blatt());
      await warte(60);
      expect((await w.listen.listen())[0].name).toBe('The Empyrean');
      expect(ueberschrift('The Empyrean')).toBeDefined();
    });
  });

  describe('AK-4 Löschen mit Rückfrage', () => {
    async function herzensbuecher() {
      const w = await starte();
      const bs = [buch('Momo'), buch('Krabat')];
      for (const b of bs) await w.repo.save(b);
      const l = await liste(w, 'sammlung', 'Herzensbücher');
      const andere = await liste(w, 'sammlung', 'Andere');
      for (const b of bs) await zuordnen(w, l, b);
      await zuordnen(w, andere, bs[0]);
      await oeffne(w, l);
      await tippe(stift('Herzensbücher'));
      await tippe(within(blatt()).getByRole('button', { name: /Liste löschen/ }));
      return { w, bs, l, andere };
    }

    it('[REQ-098/AK-4] „Liste löschen“ und bestätigen: Liste weg, beide Bücher bleiben, Listenübersicht „Sammlungen“ wird angezeigt', async () => {
      const { w, bs, l, andere } = await herzensbuecher();
      const rf = rueckfrage();
      await tippe(within(rf).getAllByRole('button').find((b) => JA.test(norm(b.textContent)))!);
      await vi.waitFor(() => expect(screen.getAllByRole('heading', { name: 'Sammlungen' }).filter(sichtbar).length).toBeGreaterThan(0), W);
      expect(textEls('Herzensbücher')).toHaveLength(0);
      expect(textEls('Andere').length).toBeGreaterThan(0);
      await warte(60);
      cleanup();
      const w2 = await starte();
      expect((await w2.listen.listen()).map((x) => x.id)).toEqual([andere.id]);
      const zug = await w2.listen.zugehoerigkeiten();
      expect(zug.filter((z) => z.listeId === l.id)).toEqual([]);
      expect(zug.map((z) => ({ listeId: z.listeId, buchId: z.buchId }))).toEqual([{ listeId: andere.id, buchId: bs[0].id }]);
      expect((await w2.repo.list()).map((b) => b.titel).sort()).toEqual(['Krabat', 'Momo']);
      void w;
    });

    it('[REQ-098/AK-4] Rückfrage verneint: Liste unverändert, Bücher weiter darin', async () => {
      const { w, bs, l } = await herzensbuecher();
      const rf = rueckfrage();
      await tippe(within(rf).getAllByRole('button').find((b) => NEIN.test(norm(b.textContent)))!);
      await warte(60);
      expect((await w.listen.listen()).find((x) => x.id === l.id)?.name).toBe('Herzensbücher');
      expect((await w.listen.zugehoerigkeiten()).filter((z) => z.listeId === l.id)).toHaveLength(bs.length);
    });

    it('[REQ-098/AK-4] Saga löschen entfernt die Zugehörigkeit, das Buch bleibt', async () => {
      const w = await starte();
      const b = buch('Fourth Wing');
      await w.repo.save(b);
      const s = await liste(w, 'saga', 'The Empyrean');
      await zuordnen(w, s, b, 1);
      await oeffne(w, s);
      await tippe(stift('The Empyrean'));
      await tippe(within(blatt()).getByRole('button', { name: /Liste löschen/ }));
      await tippe(within(rueckfrage()).getAllByRole('button').find((x) => JA.test(norm(x.textContent)))!);
      await warte(60);
      expect(await w.listen.zugehoerigkeiten()).toEqual([]);
      expect(await w.repo.get(b.id)).toBeDefined();
    });
  });

  // Neu 2026-11-25 (REQ-112): Die Bandnummer gehört zum Buch und überlebt das Löschen der Saga.
  describe('AK-11 Saga löschen, Bandnummer bleibt', () => {
    async function loeschen(w: Welt, s: Liste) {
      await oeffne(w, s);
      await tippe(stift(s.name));
      await tippe(within(blatt()).getByRole('button', { name: /Liste löschen/ }));
      await tippe(within(rueckfrage()).getAllByRole('button').find((x) => JA.test(norm(x.textContent)))!);
      await warte(60);
    }

    it('[REQ-098/AK-11] „House of Earth and Blood“ (Band 1) nur in „Crescent City“: Saga löschen → Buch vorhanden, Zeile „Band“ zeigt 1, auch nach Neustart', async () => {
      const w = await starte();
      const b = buch('House of Earth and Blood');
      await w.repo.save(b);
      const s = await liste(w, 'saga', 'Crescent City');
      await zuordnen(w, s, b, 1);
      await loeschen(w, s);
      expect(await w.listen.listen()).toEqual([]);
      expect(await bandVon(w, b)).toBe(1);
      const { d } = await neustartDetails(b.id);
      expect(ausgabeBand(d)).toBe('1');
    });

    it('[REQ-098/AK-11] Variante: Buch auch in einer zweiten Saga → dort weiter „Band 1 · The Empyrean“', async () => {
      const w = await starte();
      const b = buch('Crossover', { autor: 'Rebecca Yarros' });
      await w.repo.save(b);
      const s = await liste(w, 'saga', 'Crescent City');
      const e = await liste(w, 'saga', 'The Empyrean');
      await zuordnen(w, s, b, 1);
      await zuordnen(w, e, b);
      await loeschen(w, s);
      const { d } = await neustartDetails(b.id);
      await vi.waitFor(() => expect(textEls(/^Band \d+ · .+$/, d).map((x) => norm(x.textContent))).toEqual(['Band 1 · The Empyrean']), W);
    });
  });

  describe('AK-5 Buch öffnen und zurück', () => {
    it.each(['sammlung', 'bibliothek', 'saga'] as const)('[REQ-098/AK-5] (%s) Buch antippen → Buchdetails; Zurück-Pfeil → wieder die Liste', async (art) => {
      const w = await starte();
      const b = buch('Momo');
      await w.repo.save(b);
      const l = await liste(w, art, 'Meine Liste');
      await zuordnen(w, l, b);
      await oeffne(w, l);
      await tippe(textEls('Momo')[0]);
      await screen.findByRole('region', { name: 'Buchdetails' }, W);
      await tippe(zurueck());
      await vi.waitFor(() => expect(ueberschrift('Meine Liste')).toBeDefined(), W);
      expect(screen.queryByRole('region', { name: 'Buchdetails' })).toBeNull();
      expect(textEls('Momo').length).toBeGreaterThan(0);
    });
  });
});

// Sprint 11 (Fassung 2026-11-25): AK-10 – Raster mit drei Spalten, nach derselben Regel wie REQ-037 (jsdom ohne Layout:
// geprüft werden Rasterregel, gleiche Spalten ohne feste Breiten, kein waagerechtes Scrollen, Cover 2:3).
describe('REQ-098 AK-10 Raster mit drei Spalten', () => {
  const RASTER_REGEL = /^repeat\(\s*3\s*,\s*(minmax\(\s*0(px)?\s*,\s*1fr\s*\)|1fr)\s*\)$/;
  function breite(px: number) {
    Object.defineProperty(window, 'innerWidth', { configurable: true, value: px });
    window.dispatchEvent(new Event('resize'));
  }
  afterEach(() => breite(1024));
  async function rasterListe(art: ListenArt, name: string, n: number, px: number) {
    breite(px);
    const w = await starte();
    const l = await liste(w, art, name);
    for (let i = 1; i <= n; i++) {
      const b = buch(`Buch ${i}`);
      await w.repo.save(b);
      await zuordnen(w, l, b, art === 'saga' ? i : undefined);
    }
    await oeffne(w, l);
    const r = screen.getAllByRole('button').find((b) => b.getAttribute('data-ansicht-wahl') === 'raster' && sichtbar(b));
    expect(r, 'Umschalter „Raster“').toBeDefined();
    await tippe(r!);
    return vi.waitFor(() => {
      const ul = Array.from(document.querySelectorAll<HTMLElement>('ul[data-buecher]')).filter(sichtbar).at(-1);
      expect(ul?.children.length).toBe(n);
      return ul!;
    }, W);
  }
  function pruefe(ul: HTMLElement, n: number) {
    expect(ul.getAttribute('data-raster-spalten')).toBe('3');
    expect(ul.style.display === 'grid' || getComputedStyle(ul).display === 'grid').toBe(true);
    expect((ul.style.gridTemplateColumns || getComputedStyle(ul).gridTemplateColumns).replace(/\s+/g, ' ').trim()).toMatch(RASTER_REGEL);
    const lis = Array.from(ul.children) as HTMLElement[];
    expect(lis).toHaveLength(n);
    for (const li of lis) {
      expect(li.style.gridColumn || '').not.toMatch(/span/);
      expect(li.style.width || '').not.toMatch(/\d+px/);
      expect([li, ...Array.from(li.querySelectorAll<HTMLElement>('*'))].some((e) => /^2\s*\/\s*3$/.test(e.style.aspectRatio)), 'Cover 2:3').toBe(true);
    }
    for (let x: HTMLElement | null = ul; x; x = x.parentElement) expect(['scroll', 'auto']).not.toContain(x.style.overflowX);
  }

  it.each([320, 412])('[REQ-098/AK-10] Saga „Crescent City“ mit vier Büchern bei %i px: drei gleich breite Spalten (Reihen 3, 1), Cover 2:3', async (px) => {
    pruefe(await rasterListe('saga', 'Crescent City', 4, px), 4);
  });

  it.each(['sammlung', 'bibliothek'] as const)('[REQ-098/AK-10] in einer %s gilt dasselbe (320 px)', async (art) => {
    pruefe(await rasterListe(art, 'Meine Liste', 4, 320), 4);
  });
});
