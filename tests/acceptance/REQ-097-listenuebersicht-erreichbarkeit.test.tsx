/**
 * Akzeptanztests REQ-097 – Listenübersicht, „Alle ansehen ›“, Menüpunkt „Bibliothek“.
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

/** Seite „Bücher“ mit den Repositories der App. */
async function seiteBuecher(w: Welt) {
  const BA = w.BA;
  render(
    <div data-testwurzel="" style={farbVariablen() as CSSProperties}>
      <BA bildspeicher={bilder} bildquelle={quelle} jetzt={jetzt} />
    </div>,
  );
  await screen.findByRole('heading', { name: 'Deine Bücher' }, W);
  await vi.waitFor(() => expect(screen.getByRole('region', { name: 'Sagas' })).toBeInTheDocument(), W);
  await warte(60);
}
const abschnittSeite = (name: 'Sagas' | 'Sammlungen') => screen.getByRole('region', { name });
const alleAnsehen = (name: 'Sagas' | 'Sammlungen') => within(abschnittSeite(name)).getByRole('button', { name: 'Alle ansehen ›' });
/** Listenübersicht der Art ist sichtbar (Überschrift der Art außerhalb der Seite „Bücher“). */
async function uebersichtOffen(mehrzahl: string) {
  await vi.waitFor(() => {
    const h = screen.queryAllByRole('heading', { name: mehrzahl }).filter((x) => !x.closest('[role="region"][aria-label="Sagas"], [role="region"][aria-label="Sammlungen"]'));
    expect(h.length, `Listenübersicht „${mehrzahl}“`).toBeGreaterThan(0);
  }, W);
}
/** Anzahltexte „<n> Bücher“ / „1 Buch“ (sichtbar). */
const anzahlen = () => textEls(/^(\d+ Bücher|1 Buch)$/);
/** Eintrag einer Liste: kleinstes sichtbares Element mit dem Namen und einer Anzahl. */
function eintrag(name: string) {
  const k = Array.from(document.body.querySelectorAll<HTMLElement>('*')).filter((e) => {
    const t = norm(e.textContent);
    return sichtbar(e) && t.includes(name) && /(\d+ Bücher|1 Buch)/.test(t);
  });
  return k.find((c) => !k.some((o) => o !== c && c.contains(o)));
}
const eintragText = (name: string) => norm(eintrag(name)?.textContent);
const zurueck = () => screen.getAllByRole('button', { name: 'Zurück' }).filter((b) => sichtbar(b)).at(-1)!;
const zugVon = async (w: Welt, b: Buch) => (await w.listen.zugehoerigkeiten()).filter((z) => z.buchId === b.id);
/** Wert der Zeile „Band“ der Karte „Ausgabe“ (REQ-112), Reiter „Details“ aktiv. */
function ausgabeBand(d: HTMLElement) {
  const z = Array.from(d.querySelectorAll<HTMLElement>('[data-ausgabe-zeile]')).find((e) => norm(e.querySelector('[data-zeile-bezeichnung]')?.textContent) === 'Band');
  expect(z, 'Zeile „Band“ in der Karte „Ausgabe“').toBeDefined();
  return norm(z!.querySelector('[data-zeile-wert]')?.textContent);
}

describe('REQ-097 Listenübersicht und Erreichbarkeit', () => {
  describe('AK-1 Alle Listen der Art mit Anzahl', () => {
    async function aufbau() {
      const w = await starte();
      const bs = ['A', 'B', 'C', 'D'].map((t) => buch(t));
      for (const b of bs) await w.repo.save(b);
      const l = await liste(w, 'sammlung', 'Lieblingsbücher');
      const s = await liste(w, 'sammlung', 'Sommer 2026');
      const saga = await liste(w, 'saga', 'The Empyrean');
      for (const b of bs.slice(0, 3)) await zuordnen(w, l, b);
      await zuordnen(w, s, bs[3]);
      await zuordnen(w, saga, bs[0]);
      return w;
    }

    it('[REQ-097/AK-1] Übersicht „Sammlungen“: genau „Lieblingsbücher · 3 Bücher“ und „Sommer 2026 · 1 Buch“, keine Saga', async () => {
      const w = await aufbau();
      await seiteBuecher(w);
      await tippe(alleAnsehen('Sammlungen'));
      await uebersichtOffen('Sammlungen');
      expect(anzahlen()).toHaveLength(2);
      expect(eintragText('Lieblingsbücher')).toMatch(/Lieblingsbücher.*3 Bücher/);
      expect(eintragText('Sommer 2026')).toMatch(/Sommer 2026.*1 Buch$/);
      expect(textEls('The Empyrean')).toHaveLength(0);
    });

    it('[REQ-097/AK-1] Grenzfall: leere Liste zeigt „0 Bücher“', async () => {
      const w = await starte();
      await liste(w, 'sammlung', 'Leer');
      await seiteBuecher(w);
      await tippe(alleAnsehen('Sammlungen'));
      await uebersichtOffen('Sammlungen');
      expect(eintragText('Leer')).toMatch(/Leer.*0 Bücher/);
    });

    it('[REQ-097/AK-1] Auslegung: Listen A–Z nach Name', async () => {
      const w = await starte();
      for (const n of ['Zeit', 'alpha', 'Mitte']) await liste(w, 'sammlung', n);
      await seiteBuecher(w);
      await tippe(alleAnsehen('Sammlungen'));
      await uebersichtOffen('Sammlungen');
      const els = ['alpha', 'Mitte', 'Zeit'].map((n) => eintrag(n)!);
      expect(vor(els[0], els[1]) && vor(els[1], els[2])).toBe(true);
    });
  });

  describe('AK-2 Aus den Buchdetails mit Häkchen', () => {
    it('[REQ-097/AK-2] „In Sammlung“ antippen: Übersicht „Sammlungen“, „Lieblingsbücher“ angehakt, „Sommer 2026“ nicht', async () => {
      const w = await starte();
      const b = buch();
      await w.repo.save(b);
      await zuordnen(w, await liste(w, 'sammlung', 'Lieblingsbücher'), b);
      await liste(w, 'sammlung', 'Sommer 2026');
      const d = await details(w, b.id);
      await tippe(zeile(d, 'In Sammlung')!);
      await uebersichtOffen('Sammlungen');
      expect(angehakt(haken(document.body, 'Lieblingsbücher'))).toBe(true);
      expect(angehakt(haken(document.body, 'Sommer 2026'))).toBe(false);
    });

    it('[REQ-097/AK-2] Negativfall: aus Sammlungen geöffnet, keine Sagas oder Bibliotheken in der Übersicht', async () => {
      const w = await starte();
      const b = buch();
      await w.repo.save(b);
      await zuordnen(w, await liste(w, 'sammlung', 'Lieblingsbücher'), b);
      await liste(w, 'saga', 'The Empyrean');
      await liste(w, 'bibliothek', 'Zuhause');
      const d = await details(w, b.id);
      await tippe(zeile(d, 'In Sammlung')!);
      await uebersichtOffen('Sammlungen');
      expect(screen.queryAllByRole('checkbox').map((c) => c.getAttribute('aria-label') ?? norm(c.closest('label')?.textContent))).toEqual([expect.stringContaining('Lieblingsbücher')]);
    });
  });

  describe('AK-3 Häkchen schaltet um', () => {
    it('[REQ-097/AK-3] „Sommer 2026“ setzen, „Lieblingsbücher“ entfernen: Buch nur in „Sommer 2026“, Anzahlen angepasst, auch nach Neustart', async () => {
      const w = await starte();
      const b = buch('Mein Buch');
      const x = buch('Anderes');
      await w.repo.save(b);
      await w.repo.save(x);
      const l = await liste(w, 'sammlung', 'Lieblingsbücher');
      const s = await liste(w, 'sammlung', 'Sommer 2026');
      await zuordnen(w, l, b);
      await zuordnen(w, l, x);
      const d = await details(w, b.id);
      await tippe(zeile(d, 'In Sammlung')!);
      await uebersichtOffen('Sammlungen');
      expect(eintragText('Lieblingsbücher')).toMatch(/2 Bücher/);
      expect(eintragText('Sommer 2026')).toMatch(/0 Bücher/);
      await tippe(haken(document.body, 'Sommer 2026'));
      await tippe(haken(document.body, 'Lieblingsbücher'));
      await warte(60);
      expect(angehakt(haken(document.body, 'Sommer 2026'))).toBe(true);
      expect(angehakt(haken(document.body, 'Lieblingsbücher'))).toBe(false);
      await vi.waitFor(() => expect(eintragText('Lieblingsbücher')).toMatch(/1 Buch$/), W);
      expect(eintragText('Sommer 2026')).toMatch(/1 Buch$/);
      // sofort wirksam, ohne „Sichern“ (Auslegung)
      expect((await zugVon(w, b)).map((z) => z.listeId)).toEqual([s.id]);
      cleanup();
      const w2 = await starte();
      expect((await zugVon(w2, b)).map((z) => z.listeId)).toEqual([s.id]);
      expect((await zugVon(w2, x)).map((z) => z.listeId)).toEqual([l.id]);
    });
  });

  describe('AK-4 Letztes Häkchen entfernt', () => {
    it('[REQ-097/AK-4] nur in „The Empyrean“: Häkchen entfernen, zurück → „+ Zu einer Saga hinzufügen“ steht wieder da', async () => {
      const w = await starte();
      const b = buch();
      await w.repo.save(b);
      await zuordnen(w, await liste(w, 'saga', 'The Empyrean'), b, 1);
      const d = await details(w, b.id);
      await tippe(zeile(d, 'In Saga')!);
      await uebersichtOffen('Sagas');
      await tippe(haken(document.body, 'The Empyrean'));
      await warte(60);
      await tippe(zurueck());
      await vi.waitFor(() => expect(pillenTexte(screen.getByRole('region', { name: 'Buchdetails' }))).toContain('+ Zu einer Saga hinzufügen'), W);
      expect(zeile(screen.getByRole('region', { name: 'Buchdetails' }), 'In Saga')).toBeUndefined();
      expect(await zugVon(w, b)).toEqual([]);
    });

    it('[REQ-097/AK-4] die Liste selbst bleibt bestehen, wenn das letzte Buch herausgenommen wird', async () => {
      const w = await starte();
      const b = buch();
      await w.repo.save(b);
      const s = await liste(w, 'saga', 'The Empyrean');
      await zuordnen(w, s, b);
      const d = await details(w, b.id);
      await tippe(zeile(d, 'In Saga')!);
      await uebersichtOffen('Sagas');
      await tippe(haken(document.body, 'The Empyrean'));
      await warte(60);
      expect(await w.listen.listen()).toEqual([s]);
      expect(eintragText('The Empyrean')).toMatch(/0 Bücher/);
    });
  });

  describe('AK-5 Neue Liste über „+“', () => {
    it('[REQ-097/AK-5] aus den Buchdetails: „+“, „Crescent City“ → erscheint in der Übersicht und ist angehakt (gespeichert)', async () => {
      const w = await starte();
      const b = buch();
      await w.repo.save(b);
      await zuordnen(w, await liste(w, 'saga', 'The Empyrean'), b);
      const d = await details(w, b.id);
      await tippe(zeile(d, 'In Saga')!);
      await uebersichtOffen('Sagas');
      await neuerName(document.body, 'Crescent City');
      await vi.waitFor(() => expect(angehakt(haken(document.body, 'Crescent City'))).toBe(true), W);
      await warte(60);
      const neu = (await w.listen.listen()).find((l) => l.name === 'Crescent City');
      expect(neu?.art).toBe('saga');
      expect((await zugVon(w, b)).map((z) => z.listeId)).toContain(neu!.id);
    });

    it.each(['', '  '])('[REQ-097/AK-5] Negativfall: leerer Name „%s“ legt keine Liste an', async (name) => {
      const w = await starte();
      const b = buch();
      await w.repo.save(b);
      await zuordnen(w, await liste(w, 'saga', 'The Empyrean'), b);
      const d = await details(w, b.id);
      await tippe(zeile(d, 'In Saga')!);
      await uebersichtOffen('Sagas');
      await neuerName(document.body, name);
      await warte(60);
      expect((await w.listen.listen()).map((l) => l.name)).toEqual(['The Empyrean']);
    });

    it('[REQ-097/AK-5] ohne Buchbezug (über „Alle ansehen ›“) ist eine neue Liste leer: „0 Bücher“', async () => {
      const w = await starte();
      await w.repo.save(buch());
      await seiteBuecher(w);
      await tippe(alleAnsehen('Sagas'));
      await uebersichtOffen('Sagas');
      await neuerName(document.body, 'Crescent City');
      await vi.waitFor(() => expect(eintragText('Crescent City')).toMatch(/0 Bücher/), W);
      await warte(60);
      expect(await w.listen.zugehoerigkeiten()).toEqual([]);
      expect((await w.listen.listen()).map((l) => [l.art, l.name])).toEqual([['saga', 'Crescent City']]);
    });
  });

  // Neu 2026-11-25 (REQ-112, CEO-Entscheidung „a“): genau ein Feld „Band“ mit der Bandnummer des Buches.
  describe('AK-11 Ein Feld „Band“ mit der Bandnummer des Buches', () => {
    async function aufbau(band?: number) {
      const w = await starte();
      const b = buch('Crossover', { autor: 'Rebecca Yarros', ...(band === undefined ? {} : { bandnummer: band }) });
      await w.repo.save(b);
      const e = await liste(w, 'saga', 'The Empyrean');
      const c = await liste(w, 'saga', 'Crescent City');
      await zuordnen(w, e, b);
      await zuordnen(w, c, b);
      const d = await details(w, b.id);
      await tippe(zeile(d, 'In Saga')!);
      await uebersichtOffen('Sagas');
      return { w, b, e, c };
    }
    const bandFeldUebersicht = () => bandFelder(document.body).filter((f) => sichtbar(f));
    async function bandAendern(wert: string) {
      const f = bandFeldUebersicht()[0];
      fireEvent.change(f, { target: { value: wert } });
      fireEvent.blur(f);
      await warte(60);
    }
    const sagaZeilenTexte = () => textEls(/^Band \d+ · .+$/, screen.getByRole('region', { name: 'Buchdetails' })).map((x) => norm(x.textContent));

    it('[REQ-097/AK-11] Buch mit Band 2 in zwei Sagas: „In Saga“ → genau ein Feld „Band“ mit 2', async () => {
      await aufbau(2);
      expect(bandFeldUebersicht()).toHaveLength(1);
      expect(bandFeldUebersicht()[0].value).toBe('2');
    });

    it('[REQ-097/AK-11] auf 4 ändern → Buchdetails „Band 4 · Crescent City“, „Band 4 · The Empyrean“, Zeile „Band“ „4“; gespeichert', async () => {
      const { w, b } = await aufbau(2);
      await bandAendern('4');
      await tippe(zurueck());
      await vi.waitFor(() => expect(sagaZeilenTexte()).toEqual(['Band 4 · Crescent City', 'Band 4 · The Empyrean']), W);
      expect(ausgabeBand(screen.getByRole('region', { name: 'Buchdetails' }))).toBe('4');
      expect(await bandVon(w, b)).toBe(4);
    });

    it('[REQ-097/AK-11] nach Ändern auf 4 Häkchen bei „Crescent City“ entfernen → Bandnummer bleibt 4, nur noch „Band 4 · The Empyrean“', async () => {
      const { w, b, e } = await aufbau(2);
      await bandAendern('4');
      await tippe(haken(document.body, 'Crescent City'));
      await warte(60);
      expect((await zugVon(w, b)).map((z) => z.listeId)).toEqual([e.id]);
      expect(await bandVon(w, b)).toBe(4);
      await tippe(zurueck());
      await vi.waitFor(() => expect(sagaZeilenTexte()).toEqual(['Band 4 · The Empyrean']), W);
    });

    it('[REQ-097/AK-11] Grenzfall: letztes Häkchen entfernen → Bandnummer bleibt am Buch', async () => {
      const { w, b } = await aufbau(2);
      await tippe(haken(document.body, 'Crescent City'));
      await tippe(haken(document.body, 'The Empyrean'));
      await warte(60);
      expect(await zugVon(w, b)).toEqual([]);
      expect(await bandVon(w, b)).toBe(2);
    });

    it('[REQ-097/AK-11] Negativfall: ungültige Eingabe 0 ändert die Bandnummer nicht', async () => {
      const { w, b } = await aufbau(2);
      await bandAendern('0');
      expect(await bandVon(w, b)).toBe(2);
    });

    it('[REQ-097/AK-11] Buch ohne Band: Feld leer; 1 eintragen → Bandnummer 1', async () => {
      const { w, b } = await aufbau();
      expect(bandFeldUebersicht()).toHaveLength(1);
      expect(bandFeldUebersicht()[0].value).toBe('');
      await bandAendern('1');
      expect(await bandVon(w, b)).toBe(1);
    });
  });

  describe('AK-6 Name öffnet die Liste', () => {
    it('[REQ-097/AK-6] Übersicht „Sagas“: „The Empyrean“ antippen öffnet die Liste „The Empyrean“', async () => {
      const w = await starte();
      const b = buch('Fourth Wing');
      await w.repo.save(b);
      await zuordnen(w, await liste(w, 'saga', 'The Empyrean'), b, 1);
      await liste(w, 'saga', 'Crescent City');
      await seiteBuecher(w);
      await tippe(alleAnsehen('Sagas'));
      await uebersichtOffen('Sagas');
      await tippe(textEls('The Empyrean')[0]);
      await vi.waitFor(() => expect(screen.getAllByRole('heading', { name: 'The Empyrean' }).length).toBeGreaterThan(0), W);
      expect(screen.getAllByRole('searchbox').length).toBeGreaterThan(0);
      expect(textEls('Fourth Wing').length).toBeGreaterThan(0);
    });

    it('[REQ-097/AK-6] Variante mit Buchbezug: Antippen des Namens öffnet die Liste und ändert das Häkchen nicht', async () => {
      const w = await starte();
      const b = buch();
      await w.repo.save(b);
      const s = await liste(w, 'saga', 'The Empyrean');
      await zuordnen(w, s, b);
      const d = await details(w, b.id);
      await tippe(zeile(d, 'In Saga')!);
      await uebersichtOffen('Sagas');
      const name = textEls('The Empyrean').find((e) => e.getAttribute('role') !== 'checkbox' && e.tagName !== 'INPUT')!;
      await tippe(name);
      await vi.waitFor(() => expect(screen.getAllByRole('heading', { name: 'The Empyrean' }).length).toBeGreaterThan(0), W);
      expect((await zugVon(w, b)).map((z) => z.listeId)).toEqual([s.id]);
    });
  });

  describe('AK-7 Menüpunkt „Bibliothek“', () => {
    it('[REQ-097/AK-7] Bibliothek „Zuhause“ existiert: Menüpunkt „Bibliothek“ zeigt die Übersicht „Bibliotheken“ mit „Zuhause“, ohne Häkchen, ohne „under construction :)“', async () => {
      const w = await starte();
      await liste(w, 'bibliothek', 'Zuhause');
      await liste(w, 'sammlung', 'Lieblingsbücher');
      const App = (await import('@/App')).default;
      render(<App />);
      const nav = await screen.findByRole('navigation', { name: 'Hauptnavigation' }, W);
      await tippe(within(nav).getByRole('button', { name: 'Bibliothek' }));
      await uebersichtOffen('Bibliotheken');
      await vi.waitFor(() => expect(eintragText('Zuhause')).toMatch(/Zuhause.*0 Bücher/), W);
      expect(screen.queryAllByRole('checkbox')).toHaveLength(0);
      expect(screen.queryByText(/under construction/)).toBeNull();
      expect(textEls('Lieblingsbücher')).toHaveLength(0);
    });

    it('[REQ-097/AK-7] Zielansicht ohne Bibliotheken: nur „+“, kein Platzhalter „under construction :)“', async () => {
      const w = await starte();
      const BIB = w.BIB;
      render(<BIB bildspeicher={bilder} bildquelle={quelle} jetzt={jetzt} />);
      await uebersichtOffen('Bibliotheken');
      await warte(60);
      expect(plus()).toBeInTheDocument();
      expect(anzahlen()).toHaveLength(0);
      expect(screen.queryByText(/under construction/)).toBeNull();
    });
  });

  describe('AK-8 Seite „Bücher“ mit Listen', () => {
    it('[REQ-097/AK-8] zwei Sagas: zwei Cover-Platzhalter, darunter „Crescent City“ und „The Empyrean“ (A–Z), kein Platzhaltertext', async () => {
      const w = await starte();
      await liste(w, 'saga', 'The Empyrean');
      await liste(w, 'saga', 'Crescent City');
      await seiteBuecher(w);
      const r = abschnittSeite('Sagas');
      await vi.waitFor(() => expect(textEls('The Empyrean', r)).toHaveLength(1), W);
      expect(r.querySelectorAll('[data-cover-platzhalter]')).toHaveLength(2);
      const c = textEls('Crescent City', r)[0];
      const e = textEls('The Empyrean', r)[0];
      expect(vor(c, e)).toBe(true);
      expect(within(r).queryByText('Deine nächste Saga wartet auf dich!')).toBeNull();
      // Name an der Titelstelle: nach dem jeweiligen Platzhalter
      const ph = Array.from(r.querySelectorAll('[data-cover-platzhalter]'));
      expect(vor(ph[0], c) && vor(ph[1], e)).toBe(true);
    });

    it('[REQ-097/AK-8] „The Empyrean“ antippen öffnet direkt die Liste „The Empyrean“', async () => {
      const w = await starte();
      const b = buch('Fourth Wing');
      await w.repo.save(b);
      await zuordnen(w, await liste(w, 'saga', 'The Empyrean'), b, 1);
      await liste(w, 'saga', 'Crescent City');
      await seiteBuecher(w);
      await vi.waitFor(() => expect(textEls('The Empyrean', abschnittSeite('Sagas'))).toHaveLength(1), W);
      await tippe(textEls('The Empyrean', abschnittSeite('Sagas'))[0]);
      await vi.waitFor(() => expect(screen.getAllByRole('heading', { name: 'The Empyrean' }).length).toBeGreaterThan(0), W);
      expect(textEls('Fourth Wing').length).toBeGreaterThan(0);
      expect(screen.queryAllByRole('checkbox')).toHaveLength(0);
    });

    it('[REQ-097/AK-8] Variante Sammlungen: eine Sammlung → ein Platzhalter mit Namen, Antippen öffnet sie', async () => {
      const w = await starte();
      await liste(w, 'sammlung', 'Lieblingsbücher');
      await seiteBuecher(w);
      const r = abschnittSeite('Sammlungen');
      await vi.waitFor(() => expect(textEls('Lieblingsbücher', r)).toHaveLength(1), W);
      expect(r.querySelectorAll('[data-cover-platzhalter]')).toHaveLength(1);
      expect(within(r).queryByText('Wie wäre es mit einer neuen Sammlung?')).toBeNull();
      await tippe(textEls('Lieblingsbücher', r)[0]);
      await vi.waitFor(() => expect(screen.getAllByRole('heading', { name: 'Lieblingsbücher' }).length).toBeGreaterThan(0), W);
    });

    it('[REQ-097/AK-8] Negativfall: Bibliotheken erscheinen nicht in den Abschnitten „Sagas“/„Sammlungen“', async () => {
      const w = await starte();
      await liste(w, 'bibliothek', 'Zuhause');
      await seiteBuecher(w);
      expect(textEls('Zuhause')).toHaveLength(0);
      expect(within(abschnittSeite('Sagas')).getByText('Deine nächste Saga wartet auf dich!')).toBeInTheDocument();
    });
  });

  describe('AK-9 Seite „Bücher“ ohne Listen', () => {
    it('[REQ-097/AK-9] keine Sammlung: Platzhalter mit „Wie wäre es mit einer neuen Sammlung?“ und „Alle ansehen ›“ neben der Überschrift', async () => {
      const w = await starte();
      await liste(w, 'saga', 'The Empyrean');
      await seiteBuecher(w);
      const r = abschnittSeite('Sammlungen');
      expect(within(r).getByText('Wie wäre es mit einer neuen Sammlung?')).toBeInTheDocument();
      expect(r.querySelectorAll('[data-cover-platzhalter]')).toHaveLength(1);
      const h = within(r).getByRole('heading', { name: 'Sammlungen' });
      const a = alleAnsehen('Sammlungen');
      expect(vor(h, a)).toBe(true);
      expect(vor(a, within(r).getByText('Wie wäre es mit einer neuen Sammlung?'))).toBe(true);
    });

    it('[REQ-097/AK-9] „Alle ansehen ›“ steht neben beiden Überschriften, auch ganz ohne Listen; die leere Übersicht zeigt nur „+“', async () => {
      const w = await starte();
      await seiteBuecher(w);
      expect(alleAnsehen('Sagas')).toBeInTheDocument();
      expect(alleAnsehen('Sammlungen')).toBeInTheDocument();
      await tippe(alleAnsehen('Sammlungen'));
      await uebersichtOffen('Sammlungen');
      expect(plus()).toBeInTheDocument();
      expect(anzahlen()).toHaveLength(0);
    });
  });

  describe('AK-10 „Alle ansehen ›“ öffnet die Listenübersicht ohne Häkchen', () => {
    it('[REQ-097/AK-10] neben „Sagas“: Übersicht „Sagas“ mit beiden Sagas, Anzahl und „+“, ohne Häkchen und ohne Feld „Band“', async () => {
      const w = await starte();
      const b = buch();
      await w.repo.save(b);
      await zuordnen(w, await liste(w, 'saga', 'The Empyrean'), b, 1);
      await liste(w, 'saga', 'Crescent City');
      await seiteBuecher(w);
      await tippe(alleAnsehen('Sagas'));
      await uebersichtOffen('Sagas');
      expect(eintragText('The Empyrean')).toMatch(/1 Buch$/);
      expect(eintragText('Crescent City')).toMatch(/0 Bücher/);
      expect(plus()).toBeInTheDocument();
      expect(screen.queryAllByRole('checkbox')).toHaveLength(0);
      expect(screen.queryAllByLabelText(/Band/).filter((e) => e.tagName === 'INPUT')).toHaveLength(0);
    });

    it('[REQ-097/AK-10] Auslegung Rückweg: Zurück-Pfeil führt zur Seite „Bücher“', async () => {
      const w = await starte();
      await liste(w, 'saga', 'The Empyrean');
      await seiteBuecher(w);
      await tippe(alleAnsehen('Sagas'));
      await uebersichtOffen('Sagas');
      await tippe(zurueck());
      await vi.waitFor(() => expect(alleAnsehen('Sagas')).toBeInTheDocument(), W);
      expect(screen.getByRole('region', { name: 'Noch zu lesen' })).toBeInTheDocument();
    });
  });
});
