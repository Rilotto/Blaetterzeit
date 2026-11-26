/**
 * Akzeptanztests REQ-096 – Blatt „Zu einer … hinzufügen“.
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
void [bandVon, zugOhneBand, ohneLeer, textEls, zuordnen, blatt, zeilenWert, pillenTexte, neustartDetails, haken, angehakt, neuerName, sichern, schliessen, markiert, bandFeld, ARTEN, checkboxen];
// ----------------------------------------------------------------------------- Ende Kopf

const PILLE = { saga: '+ Zu einer Saga hinzufügen', sammlung: '+ Zu einer Sammlung hinzufügen', bibliothek: '+ Zu einer Bibliothek hinzufügen' } as const;
/** Buch anlegen, Details zeigen und das Blatt der Art öffnen. */
async function oeffneBlatt(w: Welt, art: ListenArt, b: Buch = buch()) {
  if (!(await w.repo.get(b.id))) await w.repo.save(b);
  const d = await details(w, b.id);
  await tippe(pillen(d).find((p) => norm(p.textContent) === PILLE[art])!);
  await vi.waitFor(() => expect(screen.queryAllByRole('dialog').length).toBeGreaterThan(0), W);
  return { d, bl: blatt(), b };
}
const namen = (root: HTMLElement) => checkboxen(root).map((c) => norm(c.getAttribute('aria-label') ?? c.closest('label')?.textContent ?? ''));
const blattOffen = () => screen.queryAllByRole('dialog').length > 0;
const zugVon = async (w: Welt, b: Buch) => (await w.listen.zugehoerigkeiten()).filter((z) => z.buchId === b.id);
/** Wert der Zeile „Band“ der Karte „Ausgabe“ (REQ-112), Reiter „Details“ aktiv. */
function ausgabeBand(d: HTMLElement) {
  const z = Array.from(d.querySelectorAll<HTMLElement>('[data-ausgabe-zeile]')).find((e) => norm(e.querySelector('[data-zeile-bezeichnung]')?.textContent) === 'Band');
  expect(z, 'Zeile „Band“ in der Karte „Ausgabe“').toBeDefined();
  return norm(z!.querySelector('[data-zeile-wert]')?.textContent);
}

describe('REQ-096 Blatt „Zu einer … hinzufügen“', () => {
  describe('AK-1 Nur Listen dieser Art', () => {
    it('[REQ-096/AK-1] Sagas „The Empyrean“, „Crescent City“ und Sammlung „Lieblingsbücher“: Saga-Blatt zeigt genau die zwei Sagas mit Häkchen, „+“ und „Sichern“', async () => {
      const w = await starte();
      await liste(w, 'saga', 'The Empyrean');
      await liste(w, 'saga', 'Crescent City');
      await liste(w, 'sammlung', 'Lieblingsbücher');
      const { bl } = await oeffneBlatt(w, 'saga');
      expect(namen(bl).sort()).toEqual(['Crescent City', 'The Empyrean']);
      expect(within(bl).queryByText('Lieblingsbücher')).toBeNull();
      expect(plus(bl)).toBeInTheDocument();
      expect(within(bl).getByRole('button', { name: 'Sichern' })).toBeInTheDocument();
      // Anfangs nichts angehakt (Buch noch in keiner Saga).
      for (const c of checkboxen(bl)) expect(angehakt(c)).toBe(false);
    });

    it('[REQ-096/AK-1] Variante: Sammlungs-Blatt zeigt nur „Lieblingsbücher“, keine Sagas', async () => {
      const w = await starte();
      await liste(w, 'saga', 'The Empyrean');
      await liste(w, 'sammlung', 'Lieblingsbücher');
      const { bl } = await oeffneBlatt(w, 'sammlung');
      expect(namen(bl)).toEqual(['Lieblingsbücher']);
      expect(within(bl).queryByText('The Empyrean')).toBeNull();
    });

    it('[REQ-096/AK-1] Grenzfall: noch keine Liste der Art → nur „+“ und „Sichern“, keine Häkchen', async () => {
      const w = await starte();
      await liste(w, 'sammlung', 'Lieblingsbücher');
      const { bl } = await oeffneBlatt(w, 'bibliothek');
      expect(checkboxen(bl)).toHaveLength(0);
      expect(plus(bl)).toBeInTheDocument();
      expect(within(bl).getByRole('button', { name: 'Sichern' })).toBeInTheDocument();
    });
  });

  describe('AK-2 Mehrfachauswahl und Sichern', () => {
    it('[REQ-096/AK-2] beide Sammlungen anhaken und sichern: Buch in beiden, Zeile „In Sammlung“ statt Pille, auch nach Neustart', async () => {
      const w = await starte();
      const l1 = await liste(w, 'sammlung', 'Lieblingsbücher');
      const l2 = await liste(w, 'sammlung', 'Sommer 2026');
      const { d, bl, b } = await oeffneBlatt(w, 'sammlung');
      await tippe(haken(bl, 'Lieblingsbücher'));
      await tippe(haken(bl, 'Sommer 2026'));
      expect(angehakt(haken(bl, 'Lieblingsbücher')) && angehakt(haken(bl, 'Sommer 2026'))).toBe(true);
      await sichern(bl);
      await vi.waitFor(() => expect(blattOffen()).toBe(false), W);
      await vi.waitFor(() => expect(zeile(d, 'In Sammlung')).toBeDefined(), W);
      expect(pillenTexte(d)).not.toContain(PILLE.sammlung);
      expect(zeilenWert(d, 'In Sammlung').split(', ').sort()).toEqual(['Lieblingsbücher', 'Sommer 2026']);
      await warte(80);
      const { w: w2, d: d2 } = await neustartDetails(b.id);
      expect(zeilenWert(d2, 'In Sammlung').split(', ').sort()).toEqual(['Lieblingsbücher', 'Sommer 2026']);
      expect((await zugVon(w2, b)).map((z) => z.listeId).sort()).toEqual([l1.id, l2.id].sort());
    });

    it('[REQ-096/AK-2] Häkchen lässt sich wieder ausschalten: an, aus, an der anderen → nur die andere', async () => {
      const w = await starte();
      await liste(w, 'sammlung', 'Lieblingsbücher');
      const l2 = await liste(w, 'sammlung', 'Sommer 2026');
      const { d, bl, b } = await oeffneBlatt(w, 'sammlung');
      await tippe(haken(bl, 'Lieblingsbücher'));
      await tippe(haken(bl, 'Lieblingsbücher'));
      expect(angehakt(haken(bl, 'Lieblingsbücher'))).toBe(false);
      await tippe(haken(bl, 'Sommer 2026'));
      await sichern(bl);
      await vi.waitFor(() => expect(zeilenWert(d, 'In Sammlung')).toBe('Sommer 2026'), W);
      await warte(60);
      expect((await zugVon(w, b)).map((z) => z.listeId)).toEqual([l2.id]);
    });

    it('[REQ-096/AK-2] Negativfall: nichts angehakt und „Sichern“ → keine Zuordnung, Pille bleibt', async () => {
      const w = await starte();
      await liste(w, 'sammlung', 'Lieblingsbücher');
      const { d, bl, b } = await oeffneBlatt(w, 'sammlung');
      await sichern(bl);
      await warte(60);
      expect(await zugVon(w, b)).toEqual([]);
      expect(pillenTexte(d)).toContain(PILLE.sammlung);
    });

    it('[REQ-096/AK-2] Negativfall: andere Bücher werden durch das Sichern nicht zugeordnet', async () => {
      const w = await starte();
      const anderes = buch('Anderes');
      await w.repo.save(anderes);
      await liste(w, 'sammlung', 'Lieblingsbücher');
      const { bl } = await oeffneBlatt(w, 'sammlung');
      await tippe(haken(bl, 'Lieblingsbücher'));
      await sichern(bl);
      await warte(60);
      expect(await zugVon(w, anderes)).toEqual([]);
    });
  });

  describe('AK-3 Neue Liste über „+“', () => {
    it('[REQ-096/AK-3] Bibliotheken-Blatt ohne Listen: „+“, „Zuhause“, bestätigen → erscheint angehakt; Sichern → Bibliothek „Zuhause“ mit dem Buch', async () => {
      const w = await starte();
      const { d, bl, b } = await oeffneBlatt(w, 'bibliothek');
      await neuerName(bl, 'Zuhause');
      const cb = haken(blatt(), 'Zuhause');
      expect(angehakt(cb)).toBe(true);
      await sichern(blatt());
      await vi.waitFor(() => expect(blattOffen()).toBe(false), W);
      await warte(60);
      const ls = await w.listen.listen();
      expect(ls.map((l) => [l.art, l.name])).toEqual([['bibliothek', 'Zuhause']]);
      expect((await zugVon(w, b)).map((z) => z.listeId)).toEqual([ls[0].id]);
      expect(zeilenWert(d, 'In Bibliotheken')).toBe('Zuhause');
    });

    it('[REQ-096/AK-3] Variante: neue Saga über „+“ bekommt die Art „saga“, nicht Sammlung oder Bibliothek', async () => {
      const w = await starte();
      const { bl } = await oeffneBlatt(w, 'saga');
      await neuerName(bl, 'Crescent City');
      await sichern(blatt());
      await warte(60);
      expect((await w.listen.listen()).map((l) => [l.art, l.name])).toEqual([['saga', 'Crescent City']]);
    });

    it.each(['', '   '])('[REQ-096/AK-3] Negativfall: Name „%s“ legt keine Liste an', async (name) => {
      const w = await starte();
      const { b } = await oeffneBlatt(w, 'bibliothek');
      await neuerName(blatt(), name);
      expect(checkboxen(blatt()).filter((c) => angehakt(c))).toHaveLength(0);
      if (blattOffen()) await sichern(blatt());
      await warte(60);
      expect(await w.listen.listen()).toEqual([]);
      expect(await zugVon(w, b)).toEqual([]);
    });
  });

  // Fassung 2026-11-25 (REQ-112, CEO-Entscheidung „a“): genau ein Feld „Band“, es zeigt und ändert die Bandnummer des Buches.
  describe('AK-4 Band bei Sagas', () => {
    it('[REQ-096/AK-4] Buch ohne Band: „The Empyrean“ anhaken, Band 2, Sichern → Buch in „The Empyrean“, Bandnummer des Buches 2, Zeile „Band“ zeigt 2', async () => {
      const w = await starte();
      const s = await liste(w, 'saga', 'The Empyrean');
      const { d, bl, b } = await oeffneBlatt(w, 'saga');
      await tippe(haken(bl, 'The Empyrean'));
      const f = await vi.waitFor(() => {
        const x = bandFeld(blatt(), 'The Empyrean');
        expect(x, 'Feld „Band“').toBeDefined();
        return x!;
      }, W);
      expect(f.value).toBe('');
      fireEvent.change(f, { target: { value: '2' } });
      await sichern(blatt());
      await vi.waitFor(() => expect(blattOffen()).toBe(false), W);
      await warte(60);
      expect((await zugVon(w, b)).map((z) => z.listeId)).toEqual([s.id]);
      expect(await bandVon(w, b)).toBe(2);
      await vi.waitFor(() => expect(ausgabeBand(d)).toBe('2'), W);
      const { d: d2 } = await neustartDetails(b.id);
      expect(ausgabeBand(d2)).toBe('2');
    });

    it('[REQ-096/AK-4] Feld „Band“ erscheint erst, sobald eine Saga angehakt ist; bei zwei Sagas bleibt es genau ein Feld', async () => {
      const w = await starte();
      await liste(w, 'saga', 'The Empyrean');
      await liste(w, 'saga', 'Crescent City');
      const { bl } = await oeffneBlatt(w, 'saga');
      expect(bandFelder(bl)).toHaveLength(0);
      await tippe(haken(bl, 'The Empyrean'));
      expect(bandFelder(blatt())).toHaveLength(1);
      await tippe(haken(blatt(), 'Crescent City'));
      expect(bandFelder(blatt())).toHaveLength(1);
    });

    it('[REQ-096/AK-4] Band leer lassen ist gültig: Buch in der Saga ohne Bandnummer', async () => {
      const w = await starte();
      const s = await liste(w, 'saga', 'The Empyrean');
      const { bl, b } = await oeffneBlatt(w, 'saga');
      await tippe(haken(bl, 'The Empyrean'));
      await sichern(blatt());
      await vi.waitFor(() => expect(blattOffen()).toBe(false), W);
      await warte(60);
      expect((await zugVon(w, b)).map((z) => z.listeId)).toEqual([s.id]);
      expect(await bandVon(w, b)).toBeUndefined();
    });

    it('[REQ-096/AK-4] Buch mit Band 3: Feld leeren und sichern → Buch hat keine Bandnummer mehr (leer = keine Bandnummer)', async () => {
      const w = await starte();
      await liste(w, 'saga', 'The Empyrean');
      const { bl, b } = await oeffneBlatt(w, 'saga', buch('Iron Flame', { bandnummer: 3 }));
      await tippe(haken(bl, 'The Empyrean'));
      fireEvent.change(bandFeld(blatt(), 'The Empyrean')!, { target: { value: '' } });
      await sichern(blatt());
      await vi.waitFor(() => expect(blattOffen()).toBe(false), W);
      await warte(60);
      expect(await bandVon(w, b)).toBeUndefined();
    });

    it('[REQ-096/AK-4] Grenzfall: Band 0 ist ungültig → Feld hervorgehoben, nichts gespeichert, Blatt bleibt offen', async () => {
      const w = await starte();
      await liste(w, 'saga', 'The Empyrean');
      const { bl, b } = await oeffneBlatt(w, 'saga');
      await tippe(haken(bl, 'The Empyrean'));
      fireEvent.change(bandFeld(blatt(), 'The Empyrean')!, { target: { value: '0' } });
      await sichern(blatt());
      await warte(60);
      expect(blattOffen()).toBe(true);
      expect(markiert(bandFeld(blatt(), 'The Empyrean')!)).toBe(true);
      expect(await zugVon(w, b)).toEqual([]);
      expect(await bandVon(w, b)).toBeUndefined();
    });

    it.each(['-1', '1,5', 'zwei'])('[REQ-096/AK-4] Negativfall: Eingabe „%s“ wird nie als Bandnummer gespeichert', async (ein) => {
      const w = await starte();
      await liste(w, 'saga', 'The Empyrean');
      const { bl, b } = await oeffneBlatt(w, 'saga', buch('Iron Flame', { bandnummer: 1 }));
      await tippe(haken(bl, 'The Empyrean'));
      fireEvent.change(bandFeld(blatt(), 'The Empyrean')!, { target: { value: ein } });
      await sichern(blatt());
      await warte(60);
      expect(await bandVon(w, b)).toBe(1);
      if (blattOffen()) expect(markiert(bandFeld(blatt(), 'The Empyrean')!)).toBe(true);
    });

    it.each(['sammlung', 'bibliothek'] as const)('[REQ-096/AK-4] bei „%s“ gibt es kein Feld „Band“, auch nach dem Anhaken; die Bandnummer des Buches bleibt', async (art) => {
      const w = await starte();
      await liste(w, art, 'Meine Liste');
      const { bl, b } = await oeffneBlatt(w, art, buch('Iron Flame', { bandnummer: 2 }));
      await tippe(haken(bl, 'Meine Liste'));
      expect(bandFelder(blatt())).toHaveLength(0);
      expect(within(blatt()).queryByText(/^Band$/)).toBeNull();
      await sichern(blatt());
      await warte(60);
      expect(await bandVon(w, b)).toBe(2);
    });
  });

  describe('AK-6 Ein Feld „Band“, vorausgefüllt mit der Bandnummer des Buches', () => {
    it('[REQ-096/AK-6] Buch mit Band 3, beide Sagas anhaken: genau ein Feld „Band“ mit 3; Sichern ohne Änderung → „Band 3 · Crescent City“ und „Band 3 · The Empyrean“', async () => {
      const w = await starte();
      const e = await liste(w, 'saga', 'The Empyrean');
      const c = await liste(w, 'saga', 'Crescent City');
      const { d, bl, b } = await oeffneBlatt(w, 'saga', buch('Crossover', { autor: 'Rebecca Yarros', bandnummer: 3 }));
      await tippe(haken(bl, 'The Empyrean'));
      await tippe(haken(blatt(), 'Crescent City'));
      expect(bandFelder(blatt())).toHaveLength(1);
      expect(bandFelder(blatt())[0].value).toBe('3');
      await sichern(blatt());
      await vi.waitFor(() => expect(blattOffen()).toBe(false), W);
      await vi.waitFor(() => expect(textEls(/^Band \d+ · .+$/, d).map((x) => norm(x.textContent))).toEqual(['Band 3 · Crescent City', 'Band 3 · The Empyrean']), W);
      await warte(60);
      expect((await zugVon(w, b)).map((z) => z.listeId).sort()).toEqual([e.id, c.id].sort());
      expect(await bandVon(w, b)).toBe(3);
    });

    it('[REQ-096/AK-6] Variante: Wert im einen Feld auf 5 geändert → gilt für beide angehakten Sagas', async () => {
      const w = await starte();
      await liste(w, 'saga', 'The Empyrean');
      await liste(w, 'saga', 'Crescent City');
      const { d, bl, b } = await oeffneBlatt(w, 'saga', buch('Crossover', { autor: 'Rebecca Yarros', bandnummer: 3 }));
      await tippe(haken(bl, 'The Empyrean'));
      await tippe(haken(blatt(), 'Crescent City'));
      fireEvent.change(bandFelder(blatt())[0], { target: { value: '5' } });
      await sichern(blatt());
      await vi.waitFor(() => expect(textEls(/^Band \d+ · .+$/, d).map((x) => norm(x.textContent))).toEqual(['Band 5 · Crescent City', 'Band 5 · The Empyrean']), W);
      expect(await bandVon(w, b)).toBe(5);
      expect(ausgabeBand(d)).toBe('5');
    });
  });

  describe('AK-5 Schließen ohne Sichern verwirft', () => {
    it('[REQ-096/AK-5] Häkchen gesetzt und über „+“ neue Liste angelegt, dann „Schließen“: keine Zuordnung, neue Liste existiert nicht', async () => {
      const w = await starte();
      const s = await liste(w, 'saga', 'The Empyrean');
      const { d, bl, b } = await oeffneBlatt(w, 'saga');
      await tippe(haken(bl, 'The Empyrean'));
      await neuerName(blatt(), 'Crescent City');
      await schliessen(blatt());
      await vi.waitFor(() => expect(blattOffen()).toBe(false), W);
      await warte(60);
      expect(await w.listen.listen()).toEqual([s]);
      expect(await zugVon(w, b)).toEqual([]);
      expect(pillenTexte(d)).toContain(PILLE.saga);
    });

    it('[REQ-096/AK-5] nach dem Verwerfen zeigt das erneut geöffnete Blatt den alten Stand (kein Häkchen, keine neue Liste)', async () => {
      const w = await starte();
      await liste(w, 'sammlung', 'Lieblingsbücher');
      const { d, bl } = await oeffneBlatt(w, 'sammlung');
      await tippe(haken(bl, 'Lieblingsbücher'));
      await neuerName(blatt(), 'Sommer 2026');
      await schliessen(blatt());
      await vi.waitFor(() => expect(blattOffen()).toBe(false), W);
      await tippe(pillen(d).find((p) => norm(p.textContent) === PILLE.sammlung)!);
      await vi.waitFor(() => expect(blattOffen()).toBe(true), W);
      expect(namen(blatt())).toEqual(['Lieblingsbücher']);
      expect(angehakt(haken(blatt(), 'Lieblingsbücher'))).toBe(false);
    });

    it('[REQ-096/AK-5] Buch ohne Band, Band eingetragen, dann geschlossen: auch die Bandnummer ist verworfen (Neustart)', async () => {
      const w = await starte();
      await liste(w, 'saga', 'The Empyrean');
      const { bl, b } = await oeffneBlatt(w, 'saga');
      await tippe(haken(bl, 'The Empyrean'));
      fireEvent.change(bandFeld(blatt(), 'The Empyrean')!, { target: { value: '4' } });
      await schliessen(blatt());
      await warte(60);
      cleanup();
      const w2 = await starte();
      expect(await zugVon(w2, b)).toEqual([]);
      expect(await bandVon(w2, b)).toBeUndefined();
    });

    it('[REQ-096/AK-5] Buch mit Band 1: im Blatt 4 eingetragen, geschlossen → Bandnummer bleibt 1', async () => {
      const w = await starte();
      await liste(w, 'saga', 'The Empyrean');
      const { bl, b } = await oeffneBlatt(w, 'saga', buch('Iron Flame', { bandnummer: 1 }));
      await tippe(haken(bl, 'The Empyrean'));
      fireEvent.change(bandFeld(blatt(), 'The Empyrean')!, { target: { value: '4' } });
      await schliessen(blatt());
      await warte(60);
      expect(await bandVon(w, b)).toBe(1);
    });
  });
});
