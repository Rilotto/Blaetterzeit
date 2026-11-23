/**
 * Akzeptanztests REQ-099 – Band und Saga unter dem Autor; Band aus dem Barcode-Scan.
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
async function zuordnen(w: Welt, l: Liste, b: Buch, band?: number) {
  await w.listen.zuordnen(band === undefined ? { listeId: l.id, buchId: b.id } : { listeId: l.id, buchId: b.id, band });
}
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
    .filter((b) => norm(b.textContent) === '+' || /^(\+|Neue (Saga|Sammlung|Bibliothek)|Liste anlegen|Neue Liste)$/i.test(b.getAttribute('aria-label') ?? ''));
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
void [ohneLeer, textEls, zuordnen, blatt, zeilenWert, pillenTexte, neustartDetails, haken, angehakt, neuerName, sichern, schliessen, markiert, bandFeld, ARTEN, checkboxen];
// ----------------------------------------------------------------------------- Ende Kopf

const SAGA_ZEILE = /^(Band \d+ · )?.+$/;
/** Elemente mit eigenem Text direkt nach der Autorzeile (Autor bzw. Platzhalter „unbekannter Autor“). */
function nachAutor(d: HTMLElement, autor: string) {
  const a = textEls(autor, d)[0];
  expect(a, `Autorzeile „${autor}“`).toBeDefined();
  return Array.from(d.querySelectorAll<HTMLElement>('*')).filter(
    (e) => vor(a, e) && !a.contains(e) && e.children.length === 0 && norm(e.textContent) !== '' && sichtbar(e),
  );
}
const sagaZeilen = (d: HTMLElement) => textEls(/^Band \d+ · .+$/, d).map((e) => norm(e.textContent));
const zurueck = () => screen.getAllByRole('button', { name: 'Zurück' }).filter((b) => sichtbar(b)).at(-1)!;
const ueberschrift = (name: string) => screen.queryAllByRole('heading', { name }).filter((h) => sichtbar(h)).at(-1);
void SAGA_ZEILE;

describe('REQ-099 Band und Saga unter dem Autor; Band aus dem Barcode-Scan', () => {
  describe('AK-1 Band und Saga unter dem Autor', () => {
    it('[REQ-099/AK-1] Rebecca Yarros, „The Empyrean“ Band 1: direkt unter der Autorzeile „Band 1 · The Empyrean“', async () => {
      const w = await starte();
      const b = buch('Fourth Wing', { autor: 'Rebecca Yarros' });
      await w.repo.save(b);
      await zuordnen(w, await liste(w, 'saga', 'The Empyrean'), b, 1);
      const d = await details(w, b.id, false);
      await vi.waitFor(() => expect(norm(nachAutor(d, 'Rebecca Yarros')[0]?.textContent)).toBe('Band 1 · The Empyrean'), W);
    });

    it('[REQ-099/AK-1] Auslegung: ohne Bandnummer zeigt die Zeile nur den Saga-Namen', async () => {
      const w = await starte();
      const b = buch('Fourth Wing', { autor: 'Rebecca Yarros' });
      await w.repo.save(b);
      await zuordnen(w, await liste(w, 'saga', 'The Empyrean'), b);
      const d = await details(w, b.id, false);
      await vi.waitFor(() => expect(norm(nachAutor(d, 'Rebecca Yarros')[0]?.textContent)).toBe('The Empyrean'), W);
      expect(sagaZeilen(d)).toEqual([]);
    });

    it('[REQ-099/AK-1] Grenzfall: Buch ohne Autor → Zeile direkt unter „unbekannter Autor“', async () => {
      const w = await starte();
      const b = buch('Fourth Wing');
      await w.repo.save(b);
      await zuordnen(w, await liste(w, 'saga', 'The Empyrean'), b, 1);
      const d = await details(w, b.id, false);
      await vi.waitFor(() => expect(norm(nachAutor(d, 'unbekannter Autor')[0]?.textContent)).toBe('Band 1 · The Empyrean'), W);
    });
  });

  describe('AK-2 Mehrere Sagas', () => {
    it('[REQ-099/AK-2] „The Empyrean“ (Band 1) und „Crescent City“ (ohne Band): zwei Zeilen „Crescent City“, „Band 1 · The Empyrean“', async () => {
      const w = await starte();
      const b = buch('Crossover', { autor: 'Rebecca Yarros' });
      await w.repo.save(b);
      await zuordnen(w, await liste(w, 'saga', 'The Empyrean'), b, 1);
      await zuordnen(w, await liste(w, 'saga', 'Crescent City'), b);
      const d = await details(w, b.id, false);
      await vi.waitFor(() => expect(nachAutor(d, 'Rebecca Yarros').slice(0, 2).map((e) => norm(e.textContent))).toEqual(['Crescent City', 'Band 1 · The Empyrean']), W);
    });

    it('[REQ-099/AK-2] Negativfall: Sammlungen und Bibliotheken erzeugen keine Zeile unter dem Autor', async () => {
      const w = await starte();
      const b = buch('Momo', { autor: 'Michael Ende' });
      await w.repo.save(b);
      await zuordnen(w, await liste(w, 'saga', 'The Empyrean'), b, 2);
      await zuordnen(w, await liste(w, 'sammlung', 'Lieblingsbücher'), b);
      await zuordnen(w, await liste(w, 'bibliothek', 'Zuhause'), b);
      const d = await details(w, b.id, false);
      await vi.waitFor(() => expect(norm(nachAutor(d, 'Michael Ende')[0]?.textContent)).toBe('Band 2 · The Empyrean'), W);
      expect(norm(nachAutor(d, 'Michael Ende')[1]?.textContent)).not.toMatch(/Lieblingsbücher|Zuhause/);
      expect(textEls('Lieblingsbücher', d)).toHaveLength(0);
    });
  });

  describe('AK-3 Ohne Saga keine Zeile', () => {
    it('[REQ-099/AK-3] Buch in keiner Saga: unter dem Autor keine Saga-Zeile', async () => {
      const w = await starte();
      const b = buch('Momo', { autor: 'Michael Ende' });
      await w.repo.save(b);
      await liste(w, 'saga', 'The Empyrean');
      const d = await details(w, b.id, false);
      await warte(80);
      expect(sagaZeilen(d)).toEqual([]);
      expect(textEls('The Empyrean', d)).toHaveLength(0);
    });

    it('[REQ-099/AK-3] Gegenprobe zur Zeile: ohne Saga folgt auf den Autor dasselbe wie bei einem Buch ohne Listen', async () => {
      const w = await starte();
      const a = buch('Momo', { autor: 'Michael Ende' });
      const c = buch('Momo', { autor: 'Michael Ende' });
      await w.repo.save(a);
      await w.repo.save(c);
      await zuordnen(w, await liste(w, 'sammlung', 'Lieblingsbücher'), c);
      const d1 = await details(w, a.id, false);
      await warte(60);
      const t1 = norm(nachAutor(d1, 'Michael Ende')[0]?.textContent);
      cleanup();
      const d2 = await details(w, c.id, false);
      await warte(60);
      expect(norm(nachAutor(d2, 'Michael Ende')[0]?.textContent)).toBe(t1);
    });
  });

  describe('AK-4 Antippen öffnet die Saga', () => {
    it('[REQ-099/AK-4] „Band 1 · The Empyrean“ antippen öffnet die Liste „The Empyrean“; Zurück führt zu den Buchdetails', async () => {
      const w = await starte();
      const b = buch('Fourth Wing', { autor: 'Rebecca Yarros' });
      await w.repo.save(b);
      await zuordnen(w, await liste(w, 'saga', 'The Empyrean'), b, 1);
      const d = await details(w, b.id, false);
      await vi.waitFor(() => expect(textEls('Band 1 · The Empyrean', d)).toHaveLength(1), W);
      await tippe(textEls('Band 1 · The Empyrean', d)[0]);
      await vi.waitFor(() => expect(ueberschrift('The Empyrean')).toBeDefined(), W);
      expect(screen.getAllByRole('searchbox').filter(sichtbar).length).toBeGreaterThan(0);
      await tippe(zurueck());
      await vi.waitFor(() => expect(textEls('Band 1 · The Empyrean').length).toBeGreaterThan(0), W);
    });

    it('[REQ-099/AK-4] bei zwei Sagas öffnet jede Zeile ihre eigene Saga', async () => {
      const w = await starte();
      const b = buch('Crossover', { autor: 'X' });
      await w.repo.save(b);
      await zuordnen(w, await liste(w, 'saga', 'The Empyrean'), b, 1);
      await zuordnen(w, await liste(w, 'saga', 'Crescent City'), b);
      const d = await details(w, b.id, false);
      await vi.waitFor(() => expect(textEls('Crescent City', d)).toHaveLength(1), W);
      await tippe(textEls('Crescent City', d)[0]);
      await vi.waitFor(() => expect(ueberschrift('Crescent City')).toBeDefined(), W);
      expect(ueberschrift('The Empyrean')).toBeUndefined();
    });
  });

  describe('AK-6 Bandnummer aus dem Scan vorausgefüllt', () => {
    async function gescannt(band: number | undefined) {
      const w = await starte();
      const b = buch('Onyx Storm', { autor: 'Rebecca Yarros', ...(band === undefined ? {} : { bandnummer: band }) } as Partial<Buch>);
      await w.repo.save(b);
      const s = await liste(w, 'saga', 'The Empyrean');
      const d = await details(w, b.id);
      await tippe(pillen(d).find((p) => norm(p.textContent) === '+ Zu einer Saga hinzufügen')!);
      await vi.waitFor(() => expect(screen.queryAllByRole('dialog').length).toBeGreaterThan(0), W);
      await tippe(haken(blatt(), 'The Empyrean'));
      return { w, b, s, d };
    }

    it('[REQ-099/AK-6] Treffer lieferte Band 2: nach Anhaken steht im Feld „Band“ 2; nach Sichern „Band 2 · The Empyrean“', async () => {
      const { w, b, s } = await gescannt(2);
      expect(bandFeld(blatt(), 'The Empyrean')!.value).toBe('2');
      await sichern(blatt());
      await vi.waitFor(() => expect(screen.queryAllByRole('dialog')).toHaveLength(0), W);
      await vi.waitFor(() => expect(textEls('Band 2 · The Empyrean').length).toBeGreaterThan(0), W);
      await warte(60);
      expect(await w.listen.zugehoerigkeiten()).toEqual([{ listeId: s.id, buchId: b.id, band: 2 }]);
    });

    it('[REQ-099/AK-6] vorausgefüllten Band vor dem Sichern ändern (3) bzw. leeren', async () => {
      const a = await gescannt(2);
      fireEvent.change(bandFeld(blatt(), 'The Empyrean')!, { target: { value: '3' } });
      await sichern(blatt());
      await warte(60);
      expect((await a.w.listen.zugehoerigkeiten())[0].band).toBe(3);
      cleanup();
      vi.stubGlobal('indexedDB', new IDBFactory());
      const c = await gescannt(2);
      fireEvent.change(bandFeld(blatt(), 'The Empyrean')!, { target: { value: '' } });
      await sichern(blatt());
      await warte(60);
      const z = (await c.w.listen.zugehoerigkeiten()).find((x) => x.buchId === c.b.id)!;
      expect(z.band).toBeUndefined();
    });

    it('[REQ-099/AK-6] Gegenprobe: ohne Bandnummer aus dem Scan ist das Feld „Band“ leer', async () => {
      await gescannt(undefined);
      expect(bandFeld(blatt(), 'The Empyrean')!.value).toBe('');
    });

    it('[REQ-099/AK-6] Ablauf über den Barcode-Scan: Treffer mit Band 2 anlegen, danach der Saga zuordnen → Feld „Band“ zeigt 2', async () => {
      const w = await starte();
      await liste(w, 'saga', 'The Empyrean');
      await scanneUndLege(w, { bandnummer: 2 });
      const d = screen.getByRole('region', { name: 'Buchdetails' });
      const r = within(d).queryByRole('tab', { name: 'Details' }) ?? within(d).getAllByRole('button', { name: 'Details' })[0];
      await tippe(r);
      await vi.waitFor(() => expect(pillen(d).length).toBeGreaterThan(0), W);
      await tippe(pillen(d).find((p) => norm(p.textContent) === '+ Zu einer Saga hinzufügen')!);
      await vi.waitFor(() => expect(screen.queryAllByRole('dialog').length).toBeGreaterThan(0), W);
      await tippe(haken(blatt(), 'The Empyrean'));
      expect(bandFeld(blatt(), 'The Empyrean')!.value).toBe('2');
    });

    it.each([0, -1, 1.5])('[REQ-099/AK-6] Auslegung: Bandangabe %s aus dem Scan ist keine ganze Zahl ≥ 1 und wird nicht übernommen', async (band) => {
      const w = await starte();
      await scanneUndLege(w, { bandnummer: band });
      await warte(60);
      const [b] = (await w.repo.list()).filter((x) => x.titel === 'Gescannt');
      expect((b as Buch & { bandnummer?: number }).bandnummer).toBeUndefined();
    });
  });

  describe('AK-7 Keine automatische Saga-Zuordnung', () => {
    it('[REQ-099/AK-7] Treffer liefert Reihe „The Empyrean“: nach dem Anlegen ist das Buch in keiner Saga, keine Saga angelegt', async () => {
      const w = await starte();
      await scanneUndLege(w, { reihe: 'The Empyrean', bandnummer: 1 });
      await warte(80);
      expect(await w.listen.listen()).toEqual([]);
      expect(await w.listen.zugehoerigkeiten()).toEqual([]);
      const d = screen.getByRole('region', { name: 'Buchdetails' });
      expect(sagaZeilen(d)).toEqual([]);
      expect(textEls('The Empyrean', d)).toHaveLength(0);
    });

    it('[REQ-099/AK-7] auch wenn eine Saga gleichen Namens schon existiert, wird nicht automatisch zugeordnet', async () => {
      const w = await starte();
      const s = await liste(w, 'saga', 'The Empyrean');
      await scanneUndLege(w, { reihe: 'The Empyrean', bandnummer: 1 });
      await warte(80);
      expect(await w.listen.listen()).toEqual([s]);
      expect(await w.listen.zugehoerigkeiten()).toEqual([]);
    });
  });

  describe('AK-5 Änderungen wirken sofort', () => {
    it('[REQ-099/AK-5] Saga in „Empyrean“ umbenannt (Stift in der Liste) → zurück in den Buchdetails steht „Band 1 · Empyrean“', async () => {
      const w = await starte();
      const b = buch('Fourth Wing', { autor: 'Rebecca Yarros' });
      await w.repo.save(b);
      await zuordnen(w, await liste(w, 'saga', 'The Empyrean'), b, 1);
      const d = await details(w, b.id, false);
      await vi.waitFor(() => expect(textEls('Band 1 · The Empyrean', d)).toHaveLength(1), W);
      await tippe(textEls('Band 1 · The Empyrean', d)[0]);
      await vi.waitFor(() => expect(ueberschrift('The Empyrean')).toBeDefined(), W);
      const h = ueberschrift('The Empyrean')!;
      let st: HTMLElement | undefined;
      for (let n = h.parentElement; n && !st; n = n.parentElement) st = within(n).queryAllByRole('button').filter((x) => !h.contains(x))[0];
      await tippe(st!);
      fireEvent.change(within(blatt()).getByRole('textbox'), { target: { value: 'Empyrean' } });
      await sichern(blatt());
      await warte(60);
      await tippe(zurueck());
      await vi.waitFor(() => expect(textEls('Band 1 · Empyrean').length).toBeGreaterThan(0), W);
    });

    it('[REQ-099/AK-5] Band über die Listenübersicht (aus „In Saga“) auf 2 geändert → „Band 2 · The Empyrean“', async () => {
      const w = await starte();
      const b = buch('Fourth Wing', { autor: 'Rebecca Yarros' });
      await w.repo.save(b);
      const s = await liste(w, 'saga', 'The Empyrean');
      await zuordnen(w, s, b, 1);
      const d = await details(w, b.id);
      await tippe(zeile(d, 'In Saga')!);
      await vi.waitFor(() => expect(bandFelder(document.body).length).toBe(1), W);
      const f = bandFelder(document.body)[0];
      expect(f.value).toBe('1');
      fireEvent.change(f, { target: { value: '2' } });
      fireEvent.blur(f);
      await warte(60);
      await tippe(zurueck());
      await vi.waitFor(() => expect(textEls('Band 2 · The Empyrean').length).toBeGreaterThan(0), W);
      await warte(60);
      expect((await w.listen.zugehoerigkeiten())[0]).toEqual({ listeId: s.id, buchId: b.id, band: 2 });
    });

    it('[REQ-099/AK-5] Umbenennen und neuer Band zusammen (über das Repository), Buchdetails neu angezeigt: „Band 2 · Empyrean“', async () => {
      const w = await starte();
      const b = buch('Fourth Wing', { autor: 'Rebecca Yarros' });
      await w.repo.save(b);
      const s = await liste(w, 'saga', 'The Empyrean');
      await zuordnen(w, s, b, 1);
      await w.listen.listeSpeichern({ ...s, name: 'Empyrean' });
      await zuordnen(w, s, b, 2);
      const d = await details(w, b.id, false);
      await vi.waitFor(() => expect(norm(nachAutor(d, 'Rebecca Yarros')[0]?.textContent)).toBe('Band 2 · Empyrean'), W);
    });
  });
});

// ----------------------------------------------------------------------------- Barcode-Ablauf (REQ-061/062)
function scannerFake() {
  const s = {
    optionen: null as { beiIsbn: (isbn: string) => void } | null,
    starten: vi.fn(async (o: { beiIsbn: (isbn: string) => void }) => void (s.optionen = o)),
    lichtSetzen: vi.fn(async () => {}),
    beenden: vi.fn(async () => {}),
  };
  return s;
}
/** Scannt eine ISBN, übernimmt den Treffer und legt das Buch an; danach sind die Buchdetails offen. */
async function scanneUndLege(w: Welt, angaben: Record<string, unknown>) {
  const scanner = scannerFake();
  const treffer = { quelle: 'dnb', angaben: { titel: 'Gescannt', autor: 'Rebecca Yarros', isbn: '9783551551672', seitenanzahl: 500, ...angaben } };
  const BA = w.BA;
  render(<BA bildspeicher={bilder} bildquelle={quelle} jetzt={jetzt} barcodeScanner={scanner} isbnSuche={{ suchen: async () => [treffer] }} />);
  await screen.findByRole('heading', { name: 'Deine Bücher' }, W);
  await tippe(screen.getByRole('button', { name: 'Buch hinzufügen' }));
  const menue = await screen.findByRole('menu', { name: 'Buch hinzufügen' }, W);
  await tippe(within(menue).getByRole('menuitem', { name: /Barcode/i }));
  await vi.waitFor(() => expect(scanner.optionen).not.toBeNull(), W);
  await act(async () => {
    scanner.optionen!.beiIsbn('9783551551672');
    await new Promise((r) => setTimeout(r, 30));
  });
  const wahl = await screen.findByRole('dialog', { name: 'Gefundene Bücher' }, W);
  await tippe(within(wahl).getAllByRole('button').find((b) => norm(b.textContent).includes('Gescannt'))!);
  const m = await screen.findByRole('dialog', { name: 'Manueller Eintrag' }, W);
  await tippe(within(m).getByRole('button', { name: 'Hinzufügen' }));
  await screen.findByRole('region', { name: 'Buchdetails' }, W);
  await warte(60);
}
