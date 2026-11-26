/**
 * Akzeptanztests REQ-095 – Abschnitt „Sagas, Sammlungen und Bibliotheken“ in den Buchdetails (Reiter „Details“).
 * Abgeleitet aus dem REQ-Text. Ermittlung über Rollen und Texte (Überschrift, Schaltflächen, role=dialog, role=checkbox).
 * Vorbelegung der Listen über die öffentliche Schnittstelle ListenRepository (ADR-0002).
 * „Neustart“ = Module neu laden, neue Repository-Instanzen auf derselben (Fake-)IndexedDB.
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

describe('REQ-095 Abschnitt „Sagas, Sammlungen und Bibliotheken“', () => {
  describe('AK-1 Abschnitt umbenannt, drei Pillen ohne Zugehörigkeit', () => {
    it('[REQ-095/AK-1] Buch in keiner Liste: Überschrift „Sagas, Sammlungen und Bibliotheken“, die alte gibt es nicht mehr', async () => {
      const w = await starte();
      const b = buch();
      await w.repo.save(b);
      const d = await details(w, b.id);
      const hs = within(d).getAllByRole('heading').map((h) => norm(h.textContent));
      expect(hs.filter((t) => t === ABSCHNITT)).toHaveLength(1);
      expect(hs).not.toContain('Sammlungen und Bibliotheken');
    });

    it('[REQ-095/AK-1] darunter genau die drei Pillen in der Reihenfolge Saga, Sammlung, Bibliothek; keine Zeile „In …“', async () => {
      const w = await starte();
      const b = buch();
      await w.repo.save(b);
      const d = await details(w, b.id);
      expect(pillenTexte(d)).toEqual(['+ Zu einer Saga hinzufügen', '+ Zu einer Sammlung hinzufügen', '+ Zu einer Bibliothek hinzufügen']);
      for (const [, , , , bez] of ARTEN) expect(zeile(d, bez), bez).toBeUndefined();
    });

    it('[REQ-095/AK-1] die Pillen sind gestrichelt umrandet (Gestaltung wie Genres/Tropes)', async () => {
      const w = await starte();
      const b = buch();
      await w.repo.save(b);
      const d = await details(w, b.id);
      for (const p of pillen(d)) {
        const cs = getComputedStyle(p);
        expect(cs.borderTopStyle || cs.borderStyle, norm(p.textContent)).toMatch(/dashed/);
      }
    });

    it('[REQ-095/AK-1] Grenzfall: Listen gibt es, aber nur mit anderen Büchern – dieses Buch zeigt weiter alle drei Pillen', async () => {
      const w = await starte();
      const b = buch('Mein Buch');
      const anderes = buch('Anderes');
      await w.repo.save(b);
      await w.repo.save(anderes);
      for (const [art, name] of [['saga', 'The Empyrean'], ['sammlung', 'Lieblingsbücher'], ['bibliothek', 'Zuhause']] as const) await zuordnen(w, await liste(w, art, name), anderes);
      const d = await details(w, b.id);
      expect(pillen(d)).toHaveLength(3);
      expect(norm(abschnitt(d).map((e) => e.textContent).join(' '))).not.toMatch(/The Empyrean|Lieblingsbücher|Zuhause/);
    });
  });

  describe('AK-2 Mischzustand', () => {
    it('[REQ-095/AK-2] in Saga „The Empyrean“: Zeile „In Saga“ mit Namen und Pfeil, dazu die Pillen für Sammlung und Bibliothek', async () => {
      const w = await starte();
      const b = buch('Fourth Wing');
      await w.repo.save(b);
      await zuordnen(w, await liste(w, 'saga', 'The Empyrean'), b, 1);
      const d = await details(w, b.id);
      expect(zeile(d, 'In Saga')).toBeDefined();
      expect(zeilenWert(d, 'In Saga')).toBe('The Empyrean');
      expect(pillenTexte(d)).toEqual(['+ Zu einer Sammlung hinzufügen', '+ Zu einer Bibliothek hinzufügen']);
      // Reihenfolge Saga, Sammlung, Bibliothek bleibt: die Zeile steht vor den Pillen.
      expect(vor(zeile(d, 'In Saga')!, pillen(d)[0])).toBe(true);
    });

    it('[REQ-095/AK-2] Variante: nur in Bibliothek „Zuhause“ → Pillen Saga und Sammlung, danach Zeile „In Bibliotheken“ „Zuhause“', async () => {
      const w = await starte();
      const b = buch();
      await w.repo.save(b);
      await zuordnen(w, await liste(w, 'bibliothek', 'Zuhause'), b);
      const d = await details(w, b.id);
      expect(pillenTexte(d)).toEqual(['+ Zu einer Saga hinzufügen', '+ Zu einer Sammlung hinzufügen']);
      expect(zeilenWert(d, 'In Bibliotheken')).toBe('Zuhause');
      expect(vor(pillen(d)[1], zeile(d, 'In Bibliotheken')!)).toBe(true);
    });

    it('[REQ-095/AK-2] Variante: Sammlung, aber keine Saga → Reihenfolge Saga-Pille, Zeile „In Sammlung“, Bibliothek-Pille', async () => {
      const w = await starte();
      const b = buch();
      await w.repo.save(b);
      await zuordnen(w, await liste(w, 'sammlung', 'Lieblingsbücher'), b);
      const d = await details(w, b.id);
      const [p1, p2] = pillen(d);
      const z = zeile(d, 'In Sammlung')!;
      expect(norm(p1.textContent)).toBe('+ Zu einer Saga hinzufügen');
      expect(norm(p2.textContent)).toBe('+ Zu einer Bibliothek hinzufügen');
      expect(vor(p1, z) && vor(z, p2)).toBe(true);
    });
  });

  describe('AK-3 Mehrere Listen einer Art', () => {
    it('[REQ-095/AK-3] in „Lieblingsbücher“ und „Sommer 2026“: „In Sammlung“ zeigt beide, durch „, “ getrennt; keine Sammlungs-Pille', async () => {
      const w = await starte();
      const b = buch();
      await w.repo.save(b);
      await zuordnen(w, await liste(w, 'sammlung', 'Sommer 2026'), b);
      await zuordnen(w, await liste(w, 'sammlung', 'Lieblingsbücher'), b);
      const d = await details(w, b.id);
      const wert = zeilenWert(d, 'In Sammlung');
      expect(wert.split(', ').sort()).toEqual(['Lieblingsbücher', 'Sommer 2026']);
      expect(pillenTexte(d)).not.toContain('+ Zu einer Sammlung hinzufügen');
      expect(pillenTexte(d)).toEqual(['+ Zu einer Saga hinzufügen', '+ Zu einer Bibliothek hinzufügen']);
    });

    it('[REQ-095/AK-3] Grenzfall: in Listen aller drei Arten → keine Pille, drei Zeilen', async () => {
      const w = await starte();
      const b = buch();
      await w.repo.save(b);
      await zuordnen(w, await liste(w, 'saga', 'The Empyrean'), b);
      await zuordnen(w, await liste(w, 'sammlung', 'Lieblingsbücher'), b);
      await zuordnen(w, await liste(w, 'bibliothek', 'Zuhause'), b);
      const d = await details(w, b.id);
      expect(pillen(d)).toHaveLength(0);
      expect([zeilenWert(d, 'In Saga'), zeilenWert(d, 'In Sammlung'), zeilenWert(d, 'In Bibliotheken')]).toEqual(['The Empyrean', 'Lieblingsbücher', 'Zuhause']);
    });

    it('[REQ-095/AK-3] Negativfall: eine Liste anderer Art mit gleichem Namen erscheint nicht in der falschen Zeile', async () => {
      const w = await starte();
      const b = buch();
      await w.repo.save(b);
      await zuordnen(w, await liste(w, 'sammlung', 'Fantasy'), b);
      await liste(w, 'saga', 'Fantasy');
      const d = await details(w, b.id);
      expect(zeilenWert(d, 'In Sammlung')).toBe('Fantasy');
      expect(zeile(d, 'In Saga')).toBeUndefined();
      expect(pillenTexte(d)).toContain('+ Zu einer Saga hinzufügen');
    });
  });

  describe('AK-4 Antippen', () => {
    it.each(ARTEN)('[REQ-095/AK-4] Pille der Art „%s“ öffnet das Blatt dieser Art (mit „Sichern“, nur Listen dieser Art)', async (art, _e, _m, pillenText) => {
      const w = await starte();
      const b = buch();
      await w.repo.save(b);
      for (const a of ['saga', 'sammlung', 'bibliothek'] as const) await liste(w, a, `Liste-${a}`);
      const d = await details(w, b.id);
      expect(screen.queryAllByRole('dialog')).toHaveLength(0);
      await tippe(pillen(d).find((p) => norm(p.textContent) === pillenText)!);
      await vi.waitFor(() => expect(screen.queryAllByRole('dialog').length).toBeGreaterThan(0), W);
      const bl = blatt();
      expect(within(bl).getByRole('button', { name: 'Sichern' })).toBeInTheDocument();
      expect(checkboxen(bl).map((c) => c.getAttribute('aria-label') ?? norm(c.closest('label')?.textContent))).toEqual([expect.stringContaining(`Liste-${art}`)]);
    });

    it.each(ARTEN)('[REQ-095/AK-4] Zeile der Art „%s“ öffnet die Listenübersicht dieser Art', async (art, _e, mehrzahl, _p, bez) => {
      const w = await starte();
      const b = buch();
      await w.repo.save(b);
      await zuordnen(w, await liste(w, art, 'Meine Liste'), b);
      await liste(w, art === 'saga' ? 'sammlung' : 'saga', 'Fremde Liste');
      const d = await details(w, b.id);
      await tippe(zeile(d, bez)!);
      await vi.waitFor(() => expect(screen.getAllByRole('heading', { name: mehrzahl }).length).toBeGreaterThan(0), W);
      // Mit Buchbezug: Häkchen je Liste, „Meine Liste“ angehakt; die Liste der anderen Art fehlt.
      const cb = haken(document.body, 'Meine Liste');
      expect(angehakt(cb)).toBe(true);
      expect(screen.queryByRole('checkbox', { name: /Fremde Liste/ })).toBeNull();
    });
  });

  describe('AK-5 Dauerhaft gespeichert', () => {
    it('[REQ-095/AK-5] Saga „The Empyrean“ und Bibliothek „Zuhause“ über die Blätter zugeordnet: nach Neustart unverändert', async () => {
      const w = await starte();
      const b = buch('Fourth Wing');
      await w.repo.save(b);
      await liste(w, 'saga', 'The Empyrean');
      const d = await details(w, b.id);
      // Saga über vorhandene Liste
      await tippe(pillen(d).find((p) => norm(p.textContent) === '+ Zu einer Saga hinzufügen')!);
      await vi.waitFor(() => expect(screen.queryAllByRole('dialog').length).toBeGreaterThan(0), W);
      await tippe(haken(blatt(), 'The Empyrean'));
      await sichern(blatt());
      await vi.waitFor(() => expect(zeilenWert(d, 'In Saga')).toBe('The Empyrean'), W);
      // Bibliothek neu über „+“
      await tippe(pillen(d).find((p) => norm(p.textContent) === '+ Zu einer Bibliothek hinzufügen')!);
      await vi.waitFor(() => expect(screen.queryAllByRole('dialog').length).toBeGreaterThan(0), W);
      await neuerName(blatt(), 'Zuhause');
      await sichern(blatt());
      await vi.waitFor(() => expect(zeilenWert(d, 'In Bibliotheken')).toBe('Zuhause'), W);
      await warte(80);

      const { w: w2, d: d2 } = await neustartDetails(b.id);
      expect(zeilenWert(d2, 'In Saga')).toBe('The Empyrean');
      expect(zeilenWert(d2, 'In Bibliotheken')).toBe('Zuhause');
      expect(pillenTexte(d2)).toEqual(['+ Zu einer Sammlung hinzufügen']);
      const ls = await w2.listen.listen();
      expect(ls.map((l) => [l.art, l.name]).sort()).toEqual([['bibliothek', 'Zuhause'], ['saga', 'The Empyrean']]);
      const zug = (await w2.listen.zugehoerigkeiten()).filter((z) => z.buchId === b.id);
      expect(zug).toHaveLength(2);
    });

    it('[REQ-095/AK-5] Repository: Listen, Zugehörigkeit und Bandnummer überstehen den Neustart', async () => {
      const w = await starte();
      const b = buch();
      await w.repo.save(b);
      const s = await liste(w, 'saga', 'The Empyrean');
      await zuordnen(w, s, b, 3);
      cleanup();
      const w2 = await starte();
      expect(await w2.listen.listen()).toEqual([s]);
      // Seit REQ-112 gehört die Bandnummer zum Buch.
      expect(await zugOhneBand(w2)).toEqual([{ listeId: s.id, buchId: b.id }]);
      expect(await bandVon(w2, b)).toBe(3);
    });
  });
});
