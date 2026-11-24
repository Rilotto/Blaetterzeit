/**
 * Akzeptanztests REQ-100 – Listenbild im Cover-Format für Sagas, Sammlungen und Bibliotheken.
 * Abgeleitet aus dem REQ-Text. Arbeitet über Rollen und Texte; Listen werden über das ListenRepository vorbelegt,
 * Listenbilder ausschließlich über die Oberfläche (Stift → Bildfeld → Galerie → Zuschnitt → Sichern), weil der REQ
 * die Ablage nicht festlegt. Neustart = Module neu laden (gleiche IndexedDB, gleicher Bildspeicher).
 * Nicht in jsdom prüfbar (Sichtprüfung im Prototyp): echte Pixelmaße, bündige Namen, Farbdesigns.
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

vi.mock('@/buecher/demodaten', () => ({ demoBuecher: [] }));

const PNG = {
  rot: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAIAAACQd1PeAAAADElEQVR4nGP4z8AAAAMBAQDJ/pLvAAAAAElFTkSuQmCC',
  gruen: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAIAAACQd1PeAAAADElEQVR4nGNgaGAAAAEEAIFw9selAAAAAElFTkSuQmCC',
};
/** Bildspeicher, der über einen „Neustart“ innerhalb eines Tests erhalten bleibt. */
function speicher() {
  const daten = new Map<string, string>();
  const s = {
    daten,
    get: async (id: string, b: string) => daten.get(`${id}|${b}`),
    put: async (id: string, b: string, url: string) => void daten.set(`${id}|${b}`, url),
    remove: async (id: string, b: string) => void daten.delete(`${id}|${b}`),
  };
  return s as typeof s & ImageStore;
}
let bilder = speicher();
let galerieErgebnis: () => Promise<string | null> = async () => PNG.gruen;
const quelle = {
  scannen: vi.fn(async () => galerieErgebnis()),
  galerie: vi.fn(async () => galerieErgebnis()),
};
beforeEach(() => {
  vi.stubGlobal('indexedDB', new IDBFactory());
  vi.stubGlobal('IDBKeyRange', IDBKeyRange);
  bilder = speicher();
  galerieErgebnis = async () => PNG.gruen;
  quelle.scannen.mockClear();
  quelle.galerie.mockClear();
});
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

type Komp = ComponentType<Record<string, unknown>>;
type Welt = { repo: BookRepository; listen: ListenRepository; BA: Komp; BIB: Komp };
const HEUTE = new Date(2026, 10, 24, 15, 0, 0);
const jetzt = () => HEUTE;
const W = { timeout: 4000 };
const buch = (titel = 'Der Testroman', f: Partial<Buch> = {}): Buch => ({ id: crypto.randomUUID(), titel, status: 'ungelesen', seitenanzahl: 300, ...f });
async function starte(): Promise<Welt> {
  vi.resetModules();
  const st = (await import('@/storage')) as typeof import('@/storage');
  const BA = (await import('@/views/BuecherAnsicht')).default as unknown as Komp;
  const BIB = (await import('@/views/BibliothekAnsicht')).default as unknown as Komp;
  return { repo: st.createBookRepository(), listen: st.createListenRepository(), BA, BIB };
}
async function neustart() {
  await warte(60);
  cleanup();
  return starte();
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
function sichtbar(el: Element | null): boolean {
  for (let n = el as HTMLElement | null; n; n = n.parentElement) {
    if (n.hidden || n.getAttribute('aria-hidden') === 'true' || n.hasAttribute('inert') || n.style?.display === 'none') return false;
  }
  return true;
}
function textEls(text: string | RegExp, root: ParentNode = document.body): HTMLElement[] {
  const passt = (t: string) => (typeof text === 'string' ? t === text : text.test(t));
  const k = Array.from(root.querySelectorAll<HTMLElement>('*')).filter((e) => passt(norm(e.textContent)) && sichtbar(e));
  return k.filter((c) => !k.some((o) => o !== c && c.contains(o)));
}
const vor = (a: Node, b: Node) => Boolean(a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING);
async function liste(w: Welt, art: ListenArt, name: string): Promise<Liste> {
  const l: Liste = { id: crypto.randomUUID(), art, name };
  await w.listen.listeSpeichern(l);
  return l;
}
const blatt = () => screen.getAllByRole('dialog').at(-1)!;
const PLATZHALTER = '[data-cover-platzhalter], [data-listenbild-platzhalter], [data-platzhalter]';

// ----------------------------------------------------------------------------- Ansichten
async function seiteBuecher(w: Welt) {
  const BA = w.BA;
  render(
    <div data-testwurzel="" style={farbVariablen() as CSSProperties}>
      <BA bildspeicher={bilder} bildquelle={quelle} jetzt={jetzt} />
    </div>,
  );
  await screen.findByRole('heading', { name: 'Deine Bücher' }, W);
  await vi.waitFor(() => expect(screen.getByRole('region', { name: 'Sagas' })).toBeInTheDocument(), W);
  await warte(80);
}
async function bibliotheken(w: Welt) {
  const BIB = w.BIB;
  render(
    <div data-testwurzel="" style={farbVariablen() as CSSProperties}>
      <BIB bildspeicher={bilder} bildquelle={quelle} jetzt={jetzt} />
    </div>,
  );
  await warte(80);
}
const abschnittSeite = (name: 'Sagas' | 'Sammlungen') => screen.getByRole('region', { name });
/** Liste öffnen: Sagas/Sammlungen über die Seite „Bücher“, Bibliotheken über die Zielansicht „Bibliothek“. */
async function oeffne(w: Welt, l: Liste) {
  if (l.art === 'bibliothek') {
    await bibliotheken(w);
    await vi.waitFor(() => expect(textEls(l.name).length).toBeGreaterThan(0), W);
    await tippe(textEls(l.name)[0]);
  } else {
    await seiteBuecher(w);
    const r = abschnittSeite(l.art === 'saga' ? 'Sagas' : 'Sammlungen');
    await vi.waitFor(() => expect(textEls(l.name, r).length).toBeGreaterThan(0), W);
    await tippe(textEls(l.name, r)[0]);
  }
  await vi.waitFor(() => expect(ueberschrift(l.name)).toBeDefined(), W);
  await warte(40);
}
/** Listenübersicht „Sammlungen“ über „Alle ansehen ›“ der Seite „Bücher“. */
async function uebersichtSammlungen(w: Welt) {
  await seiteBuecher(w);
  await tippe(within(abschnittSeite('Sammlungen')).getByRole('button', { name: 'Alle ansehen ›' }));
  await vi.waitFor(() => {
    const h = screen.queryAllByRole('heading', { name: 'Sammlungen' }).filter((x) => !x.closest('[role="region"][aria-label="Sammlungen"]') && sichtbar(x));
    expect(h.length, 'Listenübersicht „Sammlungen“').toBeGreaterThan(0);
  }, W);
  await warte(60);
}
const ueberschrift = (name: string) => screen.queryAllByRole('heading', { name }).filter((h) => sichtbar(h)).at(-1);
function stift(name: string) {
  const h = ueberschrift(name)!;
  for (let n = h.parentElement; n; n = n.parentElement) {
    const k = within(n).queryAllByRole('button').filter((b) => !h.contains(b));
    const s = k.find((b) => /bearbeit|umbenenn|ändern|stift/i.test(b.getAttribute('aria-label') ?? norm(b.textContent))) ?? k[0];
    if (s) return s;
  }
  throw new Error('kein Stift');
}
/** Bilder bzw. Platzhalter links neben dem Listennamen der geöffneten Liste (vor der Überschrift, bis zwei Ebenen höher). */
function kopfGrafik(name: string) {
  const h = ueberschrift(name)!;
  const imgs = new Set<HTMLElement>();
  const ph = new Set<HTMLElement>();
  for (let n = h.parentElement, i = 0; n && i < 2; n = n.parentElement, i++) {
    n.querySelectorAll<HTMLElement>('img').forEach((e) => vor(e, h) && sichtbar(e) && imgs.add(e));
    n.querySelectorAll<HTMLElement>(PLATZHALTER).forEach((e) => vor(e, h) && sichtbar(e) && ph.add(e));
  }
  return { imgs: [...imgs], ph: [...ph] };
}
/** Eintrag einer Liste in der Listenübersicht: kleinstes sichtbares Element mit dem Namen und einer Anzahl. */
function uebersichtEintrag(name: string) {
  const k = Array.from(document.body.querySelectorAll<HTMLElement>('*')).filter((e) => {
    const t = norm(e.textContent);
    return sichtbar(e) && t.includes(name) && /(\d+ Bücher|1 Buch|0 Bücher)/.test(t);
  });
  const text = k.find((c) => !k.some((o) => o !== c && c.contains(o)));
  // Zeile: bis zu drei Ebenen höher, solange kein anderer Listeneintrag (zweite Anzahl) enthalten ist
  let zeile = text;
  for (let n = text?.parentElement, i = 0; n && i < 3; n = n.parentElement, i++) {
    if ((norm(n.textContent).match(/(\d+ Bücher|1 Buch)/g) ?? []).length > 1) break;
    zeile = n;
    if (n.querySelector(`img, ${PLATZHALTER}`)) break;
  }
  return zeile;
}

// ----------------------------------------------------------------------------- Maße
function px(v: string) {
  const m = /^(-?[\d.]+)(px|rem)$/.exec((v ?? '').trim());
  if (!m) return NaN;
  return m[2] === 'rem' ? Number(m[1]) * 16 : Number(m[1]);
}
function masse(el: HTMLElement) {
  const cs = getComputedStyle(el);
  let w = px(cs.width);
  let h = px(cs.height);
  const ar = /^([\d.]+)\s*\/\s*([\d.]+)$/.exec(cs.aspectRatio ?? '') ?? /^([\d.]+)$/.exec(cs.aspectRatio ?? '');
  const ratio = ar ? Number(ar[1]) / (ar[2] ? Number(ar[2]) : 1) : NaN;
  if (Number.isNaN(w) && Number.isFinite(h) && Number.isFinite(ratio)) w = h * ratio;
  if (Number.isNaN(h) && Number.isFinite(w) && Number.isFinite(ratio)) h = w / ratio;
  return { w, h };
}
/** Maße des Bildes selbst oder seines Rahmens (bis drei Ebenen höher). */
function rahmenMasse(el: HTMLElement) {
  for (let n: HTMLElement | null = el, i = 0; n && i < 4; n = n.parentElement, i++) {
    const m = masse(n);
    if (Number.isFinite(m.w) && Number.isFinite(m.h) && m.w > 0 && m.h > 0) return m;
  }
  return { w: NaN, h: NaN };
}
/** Seitenverhältnis Buchcover (REQ-008/009: Coverfläche 2 : 3). */
const COVER = 2 / 3;
function erwarteCoverFormat(img: HTMLElement, wo: string) {
  const m = rahmenMasse(img);
  expect(m.w / m.h, `${wo}: Seitenverhältnis`).toBeCloseTo(COVER, 2);
  const cs = getComputedStyle(img);
  const eigene = masse(img);
  // nicht verzerrt: entweder eigenes 2:3-Maß oder proportional eingepasst
  if (!(Number.isFinite(eigene.w) && Number.isFinite(eigene.h) && Math.abs(eigene.w / eigene.h - COVER) < 0.01)) {
    expect(cs.objectFit, `${wo}: object-fit`).toMatch(/^(cover|contain|scale-down)$/);
  } else {
    expect(cs.objectFit, `${wo}: object-fit`).not.toBe('fill');
  }
}

// ----------------------------------------------------------------------------- Blatt „Liste bearbeiten“
const istFremdKnopf = (b: HTMLElement) => /^(Sichern|Schließen|Zurück|Abbrechen)$|Liste löschen/.test(b.getAttribute('aria-label') ?? norm(b.textContent));
/** Bildfeld im Blatt: Schaltfläche mit „Bild“ im Namen oder mit einem Bild darin. */
function bildfeld(bl: HTMLElement) {
  const k = within(bl)
    .queryAllByRole('button')
    .filter((b) => !istFremdKnopf(b) && (/bild/i.test(b.getAttribute('aria-label') ?? norm(b.textContent)) || !!b.querySelector('img')));
  expect(k.length, 'Bildfeld im Blatt „Liste bearbeiten“').toBeGreaterThan(0);
  return k[0];
}
const bildImFeld = (bl: HTMLElement) => bildfeld(bl).querySelector<HTMLImageElement>('img') ?? bl.querySelector<HTMLImageElement>('img');
async function bearbeiten(name: string) {
  await tippe(stift(name));
  await vi.waitFor(() => expect(screen.queryAllByRole('dialog').length).toBeGreaterThan(0), W);
  return blatt();
}
/** Menü nach Antippen des Bildfelds (Rolle „menu“; sonst das oberste Blatt). */
async function bildMenue(bl: HTMLElement) {
  await tippe(bildfeld(bl));
  await vi.waitFor(() => expect(screen.queryAllByRole('menu').length, 'Menü des Bildfelds').toBeGreaterThan(0), W);
  return screen.getAllByRole('menu').at(-1)!;
}
const punkte = (m: HTMLElement) => [...within(m).queryAllByRole('menuitem'), ...within(m).queryAllByRole('button')].map((e) => norm(e.getAttribute('aria-label') ?? e.textContent));
const punkt = (m: HTMLElement, name: string | RegExp) =>
  [...within(m).queryAllByRole('menuitem'), ...within(m).queryAllByRole('button')].find((e) => {
    const t = norm(e.getAttribute('aria-label') ?? e.textContent);
    return typeof name === 'string' ? t === name : name.test(t);
  })!;
/** Galerie wählen, Zuschnitt bestätigen; liefert den Zuschnitt-Bereich vor dem Bestätigen (Prüfung Eckpunkte). */
async function ausGalerie(m: HTMLElement, pruefe?: (z: HTMLElement) => void | Promise<void>) {
  await tippe(punkt(m, 'Aus Galerie auswählen'));
  const z = await screen.findByRole('region', { name: 'Zuschnitt' }, W);
  if (pruefe) await pruefe(z);
  await tippe(within(z).getByRole('button', { name: 'Bestätigen' }));
  await vi.waitFor(() => expect(screen.queryByRole('region', { name: 'Zuschnitt' })).toBeNull(), W);
  await warte(60);
}
async function sichern(bl: HTMLElement) {
  await tippe(within(bl).getByRole('button', { name: 'Sichern' }));
  await vi.waitFor(() => expect(screen.queryAllByRole('dialog')).toHaveLength(0), W);
  await warte(60);
}
async function schliessen(bl: HTMLElement) {
  await tippe(within(bl).getByRole('button', { name: 'Schließen' }));
  await vi.waitFor(() => expect(screen.queryAllByRole('dialog')).toHaveLength(0), W);
  await warte(60);
}
/** Listenbild über die Oberfläche hinterlegen (Liste ist geöffnet). */
async function bildHinterlegen(name: string) {
  const bl = await bearbeiten(name);
  await ausGalerie(await bildMenue(bl));
  await sichern(blatt());
}
/** Liste mit Listenbild vorbereiten: öffnen, Bild hinterlegen, Ansicht schließen. */
async function mitBild(w: Welt, l: Liste) {
  await oeffne(w, l);
  await bildHinterlegen(l.name);
  await vi.waitFor(() => expect(kopfGrafik(l.name).imgs.length, 'Listenbild nach Sichern').toBe(1), W);
  await warte(60);
  cleanup();
}

describe('REQ-100 Listenbild', () => {
  describe('AK-1 Bildfeld im Blatt „Liste bearbeiten“', () => {
    it('[REQ-100/AK-1] Sammlung „Lieblingsbücher“ ohne Bild: Stift → unter dem Namensfeld das Bildfeld „Bild hinzufügen“', async () => {
      const w = await starte();
      const l = await liste(w, 'sammlung', 'Lieblingsbücher');
      await oeffne(w, l);
      const bl = await bearbeiten('Lieblingsbücher');
      const name = within(bl).getByRole('textbox') as HTMLInputElement;
      expect(name.value).toBe('Lieblingsbücher');
      const f = bildfeld(bl);
      expect(norm(f.getAttribute('aria-label') ?? f.textContent)).toMatch(/Bild hinzufügen/);
      expect(textEls(/Bild hinzufügen/, bl).length).toBeGreaterThan(0);
      expect(vor(name, f), 'Bildfeld unter dem Namensfeld').toBe(true);
      expect(f.querySelector('img')).toBeNull();
      const loeschen = within(bl).getByRole('button', { name: /Liste löschen/ });
      expect(vor(f, loeschen), 'Bildfeld vor „Liste löschen“').toBe(true);
    });

    it.each(['saga', 'bibliothek'] as const)('[REQ-100/AK-1] Variante %s: Bildfeld „Bild hinzufügen“ ebenfalls vorhanden', async (art) => {
      const w = await starte();
      const l = await liste(w, art, 'Meine Liste');
      await oeffne(w, l);
      expect(textEls(/Bild hinzufügen/, await bearbeiten('Meine Liste')).length).toBeGreaterThan(0);
    });

    it('[REQ-100/AK-1] Bildfeld ohne Bild bietet Kamera und Galerie, aber nicht „Cover online suchen“', async () => {
      const w = await starte();
      const l = await liste(w, 'sammlung', 'Lieblingsbücher');
      await oeffne(w, l);
      const m = await bildMenue(await bearbeiten('Lieblingsbücher'));
      const p = punkte(m);
      expect(p).toContain('Aus Galerie auswählen');
      expect(p.some((t) => /^(Scannen|Foto aufnehmen|Kamera)$/.test(t)), `Kamera-Option in ${p.join(', ')}`).toBe(true);
      expect(p.some((t) => /online/i.test(t))).toBe(false);
      expect(p).not.toContain('Ersetzen');
      expect(p).not.toContain('Entfernen');
    });
  });

  describe('AK-2 Bild hinzufügen und sichern', () => {
    it('[REQ-100/AK-2] Saga „The Empyrean“: Galerie, Zuschnitt (4 Eckpunkte), Sichern → Bild klein links neben dem Namen, auch nach Neustart', async () => {
      const w = await starte();
      const l = await liste(w, 'saga', 'The Empyrean');
      await oeffne(w, l);
      const bl = await bearbeiten('The Empyrean');
      await ausGalerie(await bildMenue(bl), (z) => {
        expect(z.querySelectorAll('[data-eckpunkt]')).toHaveLength(4);
      });
      expect(quelle.galerie).toHaveBeenCalledTimes(1);
      expect(bildImFeld(blatt()), 'Bild im Bildfeld vor dem Sichern').not.toBeNull();
      await sichern(blatt());
      await vi.waitFor(() => expect(kopfGrafik('The Empyrean').imgs).toHaveLength(1), W);
      const img = kopfGrafik('The Empyrean').imgs[0];
      expect(img.getAttribute('src')).toMatch(/^(data:|blob:|https?:|file:|capacitor:)/);
      expect(vor(img, ueberschrift('The Empyrean')!), 'links neben dem Namen').toBe(true);
      const m = rahmenMasse(img);
      expect(m.h, 'klein').toBeLessThan(168);
      const w2 = await neustart();
      await oeffne(w2, l);
      await vi.waitFor(() => expect(kopfGrafik('The Empyrean').imgs).toHaveLength(1), W);
      erwarteCoverFormat(kopfGrafik('The Empyrean').imgs[0], 'geöffnete Liste nach Neustart');
    });

    it('[REQ-100/AK-2] Name und Bild werden mit einem „Sichern“ gemeinsam übernommen', async () => {
      const w = await starte();
      const l = await liste(w, 'sammlung', 'Lieblingsbücher');
      await oeffne(w, l);
      const bl = await bearbeiten('Lieblingsbücher');
      fireEvent.change(within(bl).getByRole('textbox'), { target: { value: 'Herzensbücher' } });
      await ausGalerie(await bildMenue(blatt()));
      expect((within(blatt()).getByRole('textbox') as HTMLInputElement).value, 'Name bleibt nach dem Zuschnitt erhalten').toBe('Herzensbücher');
      await sichern(blatt());
      await vi.waitFor(() => expect(ueberschrift('Herzensbücher')).toBeDefined(), W);
      expect(kopfGrafik('Herzensbücher').imgs).toHaveLength(1);
      expect((await w.listen.listen())[0].name).toBe('Herzensbücher');
    });

    it('[REQ-100/AK-2] Zuschnitt: Ausgangsrahmen hat Cover-Format (hochkant, ca. 2 : 3), auch bei einem Quer-Foto', async () => {
      const w = await starte();
      const l = await liste(w, 'saga', 'The Empyrean');
      await oeffne(w, l);
      const m = await bildMenue(await bearbeiten('The Empyrean'));
      await tippe(punkt(m, 'Aus Galerie auswählen'));
      const z = await screen.findByRole('region', { name: 'Zuschnitt' }, W);
      const img = z.querySelector<HTMLImageElement>('[data-zuschnitt-bild] img, img')!;
      Object.defineProperty(img, 'naturalWidth', { value: 800, configurable: true });
      Object.defineProperty(img, 'naturalHeight', { value: 400, configurable: true });
      await act(async () => {
        fireEvent.load(img);
      });
      const p = [0, 1, 2, 3].map((i) => {
        const e = z.querySelector<HTMLElement>(`[data-eckpunkt="${i}"]`)!;
        return { x: Number(e.getAttribute('data-x')), y: Number(e.getAttribute('data-y')) };
      });
      const breite = (Math.max(...p.map((q) => q.x)) - Math.min(...p.map((q) => q.x))) * 800;
      const hoehe = (Math.max(...p.map((q) => q.y)) - Math.min(...p.map((q) => q.y))) * 400;
      // Cover-Format: hochkant, nahe 2 : 3 (Taschenbuch-Standard 120 : 190 ≈ 0,63 wird toleriert)
      expect(breite / hoehe).toBeGreaterThan(0.6);
      expect(breite / hoehe).toBeLessThan(0.7);
    });

    it('[REQ-100/AK-2] Fehlerfall: Galerie abgebrochen (kein Bild) → kein Zuschnitt, Bildfeld bleibt „Bild hinzufügen“, nach Sichern kein Listenbild', async () => {
      galerieErgebnis = async () => null;
      const w = await starte();
      const l = await liste(w, 'saga', 'The Empyrean');
      await oeffne(w, l);
      const bl = await bearbeiten('The Empyrean');
      await tippe(punkt(await bildMenue(bl), 'Aus Galerie auswählen'));
      await warte(80);
      expect(screen.queryByRole('region', { name: 'Zuschnitt' })).toBeNull();
      expect(textEls(/Bild hinzufügen/, blatt()).length).toBeGreaterThan(0);
      await sichern(blatt());
      expect(kopfGrafik('The Empyrean').imgs).toHaveLength(0);
    });

    it('[REQ-100/AK-2] Fehlerfall: Zugriff verweigert (Galerie wirft) → kein Absturz, Blatt bleibt bedienbar, kein Listenbild', async () => {
      galerieErgebnis = async () => {
        throw new Error('Berechtigung verweigert');
      };
      const w = await starte();
      const l = await liste(w, 'sammlung', 'Lieblingsbücher');
      await oeffne(w, l);
      const bl = await bearbeiten('Lieblingsbücher');
      await tippe(punkt(await bildMenue(bl), 'Aus Galerie auswählen'));
      await warte(80);
      expect(screen.queryByRole('region', { name: 'Zuschnitt' })).toBeNull();
      expect(ueberschrift('Lieblingsbücher')).toBeDefined();
      const offen = screen.queryAllByRole('dialog');
      if (offen.length) await sichern(blatt());
      expect(kopfGrafik('Lieblingsbücher').imgs).toHaveLength(0);
    });

    it('[REQ-100/AK-2] Zurück im Zuschnitt verwirft das gewählte Bild', async () => {
      const w = await starte();
      const l = await liste(w, 'saga', 'The Empyrean');
      await oeffne(w, l);
      const bl = await bearbeiten('The Empyrean');
      await tippe(punkt(await bildMenue(bl), 'Aus Galerie auswählen'));
      const z = await screen.findByRole('region', { name: 'Zuschnitt' }, W);
      await tippe(within(z).getByRole('button', { name: 'Zurück' }));
      await vi.waitFor(() => expect(screen.queryByRole('region', { name: 'Zuschnitt' })).toBeNull(), W);
      expect(textEls(/Bild hinzufügen/, blatt()).length).toBeGreaterThan(0);
      await sichern(blatt());
      expect(kopfGrafik('The Empyrean').imgs).toHaveLength(0);
    });

    it('[REQ-100/AK-2] Bild gehört nur zu dieser Liste: andere Saga bleibt ohne Bild', async () => {
      const w = await starte();
      const l = await liste(w, 'saga', 'The Empyrean');
      const andere = await liste(w, 'saga', 'Crescent City');
      await mitBild(w, l);
      const w2 = await starte();
      await oeffne(w2, andere);
      expect(kopfGrafik('Crescent City').imgs).toHaveLength(0);
    });
  });

  describe('AK-3 Schließen ohne Sichern verwirft', () => {
    it('[REQ-100/AK-3] Bild hinzugefügt, Blatt geschlossen → kein Listenbild, auch nach Neustart', async () => {
      const w = await starte();
      const l = await liste(w, 'saga', 'The Empyrean');
      await oeffne(w, l);
      const bl = await bearbeiten('The Empyrean');
      await ausGalerie(await bildMenue(bl));
      expect(bildImFeld(blatt())).not.toBeNull();
      await schliessen(blatt());
      expect(kopfGrafik('The Empyrean').imgs).toHaveLength(0);
      const w2 = await neustart();
      await oeffne(w2, l);
      expect(kopfGrafik('The Empyrean').imgs).toHaveLength(0);
      expect(textEls(/Bild hinzufügen/, await bearbeiten('The Empyrean')).length).toBeGreaterThan(0);
    });

    it('[REQ-100/AK-3] zweiter Durchlauf: vorhandenes Bild entfernt, Blatt geschlossen → Bild unverändert vorhanden, auch nach Neustart', async () => {
      const w = await starte();
      const l = await liste(w, 'sammlung', 'Lieblingsbücher');
      await mitBild(w, l);
      const w2 = await starte();
      await oeffne(w2, l);
      const src = kopfGrafik('Lieblingsbücher').imgs[0]?.getAttribute('src');
      expect(src).toBeTruthy();
      const bl = await bearbeiten('Lieblingsbücher');
      await tippe(punkt(await bildMenue(bl), 'Entfernen'));
      await warte(40);
      await schliessen(blatt());
      expect(kopfGrafik('Lieblingsbücher').imgs.map((i) => i.getAttribute('src'))).toEqual([src]);
      const w3 = await neustart();
      await oeffne(w3, l);
      await vi.waitFor(() => expect(kopfGrafik('Lieblingsbücher').imgs).toHaveLength(1), W);
    });

    it('[REQ-100/AK-3] Ersetzen und schließen → altes Bild bleibt', async () => {
      galerieErgebnis = async () => PNG.rot;
      const w = await starte();
      const l = await liste(w, 'saga', 'The Empyrean');
      await mitBild(w, l);
      const w2 = await starte();
      await oeffne(w2, l);
      const src = kopfGrafik('The Empyrean').imgs[0].getAttribute('src');
      galerieErgebnis = async () => PNG.gruen;
      const bl = await bearbeiten('The Empyrean');
      await tippe(punkt(await bildMenue(bl), 'Ersetzen'));
      const m = screen.queryAllByRole('menu').at(-1);
      if (m && punkt(m, 'Aus Galerie auswählen')) await ausGalerie(m);
      await schliessen(blatt());
      expect(kopfGrafik('The Empyrean').imgs.map((i) => i.getAttribute('src'))).toEqual([src]);
    });
  });

  describe('AK-4 Ersetzen und Entfernen', () => {
    it('[REQ-100/AK-4] Bibliothek „Zuhause“ mit Bild: Bildfeld zeigt das Bild und bietet „Ersetzen“ und „Entfernen“', async () => {
      const w = await starte();
      const l = await liste(w, 'bibliothek', 'Zuhause');
      await mitBild(w, l);
      const w2 = await starte();
      await oeffne(w2, l);
      const bl = await bearbeiten('Zuhause');
      expect(bildImFeld(bl), 'Bild im Bildfeld').not.toBeNull();
      expect(textEls(/^Bild hinzufügen$/, bl)).toHaveLength(0);
      const p = punkte(await bildMenue(bl));
      expect(p).toContain('Ersetzen');
      expect(p).toContain('Entfernen');
    });

    it('[REQ-100/AK-4] „Entfernen“ und „Sichern“ → kein Listenbild, Bildfeld zeigt wieder „Bild hinzufügen“, auch nach Neustart', async () => {
      const w = await starte();
      const l = await liste(w, 'bibliothek', 'Zuhause');
      await mitBild(w, l);
      const w2 = await starte();
      await oeffne(w2, l);
      const bl = await bearbeiten('Zuhause');
      await tippe(punkt(await bildMenue(bl), 'Entfernen'));
      await warte(40);
      expect(textEls(/Bild hinzufügen/, blatt()).length, 'Bildfeld geleert vor dem Sichern').toBeGreaterThan(0);
      await sichern(blatt());
      expect(kopfGrafik('Zuhause').imgs).toHaveLength(0);
      expect(textEls(/Bild hinzufügen/, await bearbeiten('Zuhause')).length).toBeGreaterThan(0);
      const w3 = await neustart();
      await oeffne(w3, l);
      expect(kopfGrafik('Zuhause').imgs).toHaveLength(0);
      expect(textEls(/Bild hinzufügen/, await bearbeiten('Zuhause')).length).toBeGreaterThan(0);
    });

    it('[REQ-100/AK-4] „Ersetzen“ führt durch Galerie und Zuschnitt; nach „Sichern“ ist das neue Bild da, auch nach Neustart', async () => {
      galerieErgebnis = async () => PNG.rot;
      const w = await starte();
      const l = await liste(w, 'bibliothek', 'Zuhause');
      await mitBild(w, l);
      const w2 = await starte();
      await oeffne(w2, l);
      const alt = kopfGrafik('Zuhause').imgs[0].getAttribute('src');
      galerieErgebnis = async () => PNG.gruen;
      const bl = await bearbeiten('Zuhause');
      await tippe(punkt(await bildMenue(bl), 'Ersetzen'));
      await vi.waitFor(() => expect(screen.queryAllByRole('menu').length, 'Bildquellen nach „Ersetzen“').toBeGreaterThan(0), W);
      const q = punkte(screen.getAllByRole('menu').at(-1)!);
      expect(q).toContain('Aus Galerie auswählen');
      expect(q.some((t) => /online/i.test(t))).toBe(false);
      await ausGalerie(screen.getAllByRole('menu').at(-1)!);
      await sichern(blatt());
      await vi.waitFor(() => expect(kopfGrafik('Zuhause').imgs.map((i) => i.getAttribute('src'))).not.toEqual([alt]), W);
      expect(kopfGrafik('Zuhause').imgs).toHaveLength(1);
      const neu = kopfGrafik('Zuhause').imgs[0].getAttribute('src');
      const w3 = await neustart();
      await oeffne(w3, l);
      await vi.waitFor(() => expect(kopfGrafik('Zuhause').imgs.map((i) => i.getAttribute('src'))).toEqual([neu]), W);
    });
  });

  describe('Anforderung: Liste löschen löscht das Listenbild mit (Auslegung)', () => {
    it('[REQ-100/AK-4] „Liste löschen“ bestätigt → kein Bild unter der Listen-UUID in der Bildablage; andere Liste behält ihr Bild', async () => {
      const w = await starte();
      const l = await liste(w, 'sammlung', 'Weg damit');
      const bleibt = await liste(w, 'sammlung', 'Bleibt');
      await mitBild(w, l);
      await mitBild(await starte(), bleibt);
      const mitId = (id: string) => [...bilder.daten.keys()].filter((k) => k.startsWith(`${id}|`));
      expect(mitId(l.id), 'Bild der Liste in der Bildablage').toHaveLength(1);
      const w2 = await starte();
      await oeffne(w2, l);
      await tippe(within(await bearbeiten('Weg damit')).getByRole('button', { name: /Liste löschen/ }));
      const rf = [...screen.queryAllByRole('alertdialog'), ...screen.queryAllByRole('dialog')].at(-1)!;
      await tippe(within(rf).getAllByRole('button').find((b) => /^(Löschen|Ja|Bestätigen|Liste löschen|Ja, löschen)$/.test(norm(b.textContent)))!);
      await warte(80);
      expect((await w2.listen.listen()).map((x) => x.id)).toEqual([bleibt.id]);
      expect(mitId(l.id)).toEqual([]);
      expect(mitId(bleibt.id)).toHaveLength(1);
    });
  });

  describe('AK-5 Listenübersicht mit und ohne Bild', () => {
    it('[REQ-100/AK-5] „Sammlungen“: links neben „Lieblingsbücher“ das Bild (Cover-Format), neben „Sommer 2026“ ein Platzhalter gleicher Größe', async () => {
      const w = await starte();
      const mit = await liste(w, 'sammlung', 'Lieblingsbücher');
      await liste(w, 'sammlung', 'Sommer 2026');
      await mitBild(w, mit);
      const w2 = await starte();
      await uebersichtSammlungen(w2);
      const e1 = uebersichtEintrag('Lieblingsbücher')!;
      const e2 = uebersichtEintrag('Sommer 2026')!;
      expect(e1, 'Eintrag „Lieblingsbücher“').toBeDefined();
      expect(e2, 'Eintrag „Sommer 2026“').toBeDefined();
      const img = e1.querySelector<HTMLElement>('img')!;
      expect(img, 'Bild im Eintrag „Lieblingsbücher“').not.toBeNull();
      expect(e1.querySelector(PLATZHALTER)).toBeNull();
      expect(vor(img, textEls('Lieblingsbücher', e1)[0]), 'Bild links vor dem Namen').toBe(true);
      erwarteCoverFormat(img, 'Listenübersicht');
      expect(e2.querySelector('img')).toBeNull();
      const ph = [...e2.querySelectorAll<HTMLElement>(PLATZHALTER)].at(-1)!;
      expect(ph, 'Platzhalter bei „Sommer 2026“').toBeTruthy();
      expect(vor(ph, textEls('Sommer 2026', e2)[0])).toBe(true);
      const a = rahmenMasse(img);
      const b = rahmenMasse(ph);
      expect(b.w, 'gleiche Breite').toBeCloseTo(a.w, 0);
      expect(b.h, 'gleiche Höhe').toBeCloseTo(a.h, 0);
    });

    it('[REQ-100/AK-5] Variante Zielansicht „Bibliothek“: Bild bzw. Platzhalter gleicher Größe vor dem Namen', async () => {
      const w = await starte();
      const mit = await liste(w, 'bibliothek', 'Zuhause');
      await liste(w, 'bibliothek', 'Büro');
      await mitBild(w, mit);
      const w2 = await starte();
      await bibliotheken(w2);
      await vi.waitFor(() => expect(uebersichtEintrag('Büro')).toBeDefined(), W);
      const e1 = uebersichtEintrag('Zuhause')!;
      const e2 = uebersichtEintrag('Büro')!;
      const img = e1.querySelector<HTMLElement>('img')!;
      const ph = [...e2.querySelectorAll<HTMLElement>(PLATZHALTER)].at(-1)!;
      expect(img).not.toBeNull();
      expect(ph).toBeTruthy();
      expect(e2.querySelector('img')).toBeNull();
      erwarteCoverFormat(img, 'Zielansicht Bibliothek');
      expect(rahmenMasse(ph).w).toBeCloseTo(rahmenMasse(img).w, 0);
      expect(rahmenMasse(ph).h).toBeCloseTo(rahmenMasse(img).h, 0);
    });

    it('[REQ-100/AK-5] Grenzfall: keine Liste mit Bild → alle Einträge mit Platzhalter, kein Bild', async () => {
      const w = await starte();
      await liste(w, 'sammlung', 'Lieblingsbücher');
      await liste(w, 'sammlung', 'Sommer 2026');
      await uebersichtSammlungen(w);
      for (const n of ['Lieblingsbücher', 'Sommer 2026']) {
        const e = uebersichtEintrag(n)!;
        expect(e.querySelector('img'), n).toBeNull();
        expect(e.querySelector(PLATZHALTER), n).not.toBeNull();
      }
    });
  });

  describe('AK-6 Seite „Bücher“', () => {
    it('[REQ-100/AK-6] „Sagas“: „The Empyrean“ mit Listenbild statt Platzhalter, „Crescent City“ mit Cover-Platzhalter, Namen jeweils darunter', async () => {
      const w = await starte();
      const mit = await liste(w, 'saga', 'The Empyrean');
      await liste(w, 'saga', 'Crescent City');
      await mitBild(w, mit);
      const w2 = await starte();
      await seiteBuecher(w2);
      const r = abschnittSeite('Sagas');
      await vi.waitFor(() => expect(textEls('The Empyrean', r)).toHaveLength(1), W);
      const imgs = Array.from(r.querySelectorAll<HTMLElement>('img')).filter(sichtbar);
      expect(imgs, 'genau ein Listenbild im Abschnitt').toHaveLength(1);
      expect(r.querySelectorAll('[data-cover-platzhalter]')).toHaveLength(1);
      const ph = r.querySelector<HTMLElement>('[data-cover-platzhalter]')!;
      const crescent = textEls('Crescent City', r)[0];
      const empyrean = textEls('The Empyrean', r)[0];
      // A–Z: Crescent City (Platzhalter) vor The Empyrean (Bild); Grafik jeweils vor ihrem Namen
      expect(vor(ph, crescent)).toBe(true);
      expect(vor(crescent, imgs[0])).toBe(true);
      expect(vor(imgs[0], empyrean)).toBe(true);
      erwarteCoverFormat(imgs[0], 'Seite „Bücher“');
      const a = rahmenMasse(imgs[0]);
      const b = rahmenMasse(ph);
      expect(a.w, 'wie ein Buchcover: gleiche Breite wie der Platzhalter').toBeCloseTo(b.w, 0);
      expect(a.h).toBeCloseTo(b.h, 0);
    });

    it('[REQ-100/AK-6] Variante „Sammlungen“: Listenbild an Stelle des Platzhalters', async () => {
      const w = await starte();
      const mit = await liste(w, 'sammlung', 'Lieblingsbücher');
      await mitBild(w, mit);
      const w2 = await starte();
      await seiteBuecher(w2);
      const r = abschnittSeite('Sammlungen');
      await vi.waitFor(() => expect(textEls('Lieblingsbücher', r)).toHaveLength(1), W);
      expect(Array.from(r.querySelectorAll('img')).filter(sichtbar)).toHaveLength(1);
      expect(r.querySelectorAll('[data-cover-platzhalter]')).toHaveLength(0);
    });

    it('[REQ-100/AK-6] nach „Entfernen“ zeigt die Seite „Bücher“ wieder den Cover-Platzhalter', async () => {
      const w = await starte();
      const l = await liste(w, 'saga', 'The Empyrean');
      await mitBild(w, l);
      const w2 = await starte();
      await oeffne(w2, l);
      await tippe(punkt(await bildMenue(await bearbeiten('The Empyrean')), 'Entfernen'));
      await sichern(blatt());
      cleanup();
      const w3 = await starte();
      await seiteBuecher(w3);
      const r = abschnittSeite('Sagas');
      await vi.waitFor(() => expect(textEls('The Empyrean', r)).toHaveLength(1), W);
      expect(r.querySelectorAll('img')).toHaveLength(0);
      expect(r.querySelectorAll('[data-cover-platzhalter]')).toHaveLength(1);
    });
  });

  describe('AK-7 Geöffnete Liste ohne Bild', () => {
    it.each(['sammlung', 'saga', 'bibliothek'] as const)('[REQ-100/AK-7] (%s) „Sommer 2026“ ohne Listenbild: neben dem Namen kein Bild und kein Platzhalter', async (art) => {
      const w = await starte();
      const b = buch('Momo');
      await w.repo.save(b);
      const l = await liste(w, art, 'Sommer 2026');
      await w.listen.zuordnen({ listeId: l.id, buchId: b.id });
      await oeffne(w, l);
      const k = kopfGrafik('Sommer 2026');
      expect(k.imgs).toHaveLength(0);
      expect(k.ph).toHaveLength(0);
      expect(stift('Sommer 2026')).toBeInTheDocument();
    });
  });

  describe('AK-8 Immer Cover-Format', () => {
    it('[REQ-100/AK-8] Bild aus Quer-Foto: in geöffneter Liste, Listenübersicht und Seite „Bücher“ jeweils Cover-Format, nicht verzerrt', async () => {
      const w = await starte();
      const l = await liste(w, 'sammlung', 'Lieblingsbücher');
      await oeffne(w, l);
      const bl = await bearbeiten('Lieblingsbücher');
      await ausGalerie(await bildMenue(bl), async (z) => {
        const img = z.querySelector<HTMLImageElement>('[data-zuschnitt-bild] img, img')!;
        Object.defineProperty(img, 'naturalWidth', { value: 1200, configurable: true });
        Object.defineProperty(img, 'naturalHeight', { value: 600, configurable: true });
        await act(async () => {
          fireEvent.load(img);
        });
      });
      await sichern(blatt());
      await vi.waitFor(() => expect(kopfGrafik('Lieblingsbücher').imgs).toHaveLength(1), W);
      erwarteCoverFormat(kopfGrafik('Lieblingsbücher').imgs[0], 'geöffnete Liste');
      cleanup();
      const w2 = await starte();
      await uebersichtSammlungen(w2);
      erwarteCoverFormat(uebersichtEintrag('Lieblingsbücher')!.querySelector<HTMLElement>('img')!, 'Listenübersicht');
      cleanup();
      const w3 = await starte();
      await seiteBuecher(w3);
      const r = abschnittSeite('Sammlungen');
      await vi.waitFor(() => expect(r.querySelectorAll('img').length).toBe(1), W);
      erwarteCoverFormat(r.querySelector<HTMLElement>('img')!, 'Seite „Bücher“');
    });

    it('[REQ-100/AK-8] Bildfeld im Blatt „Liste bearbeiten“ zeigt das Bild im Cover-Format', async () => {
      const w = await starte();
      const l = await liste(w, 'saga', 'The Empyrean');
      await mitBild(w, l);
      const w2 = await starte();
      await oeffne(w2, l);
      const img = bildImFeld(await bearbeiten('The Empyrean'))!;
      expect(img).not.toBeNull();
      erwarteCoverFormat(img, 'Bildfeld');
    });
  });
});
