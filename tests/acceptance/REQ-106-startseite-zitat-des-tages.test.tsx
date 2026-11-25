/**
 * Akzeptanztests REQ-106 – Startseite: „Zitat des Tages“ aus allen gespeicherten Zitaten.
 * Abgeleitet aus dem REQ-Text (Sprint 10, Teil C). Schwarzkasten:
 *  - Zitate werden über die Oberfläche angelegt (Buchdetails, Reiter „Notizbuch“, REQ-105: Felder „Zitat“,
 *    „Wer sagt es?“, „Seite“, „Sichern“), danach läuft die App mit denselben Standard-Repositories.
 *  - Uhr: Fake-Timer (vi.setSystemTime). „Neustart“: Module neu laden, dieselbe IndexedDB und derselbe localStorage.
 *  - Welches Zitat gezeigt wird, erkennt der Test am Zitattext auf der Startseite (Zitattexte sind eindeutig).
 */
import '@testing-library/jest-dom/vitest';
import { act, cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { IDBFactory, IDBKeyRange } from 'fake-indexeddb';
import type { ComponentType } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { Buch } from '@/domain/buch';
import type { ImageStore } from '@/storage';

vi.mock('@/buecher/demodaten', () => ({ demoBuecher: [] }));
beforeEach(() => {
  vi.stubGlobal('indexedDB', new IDBFactory());
  vi.stubGlobal('IDBKeyRange', IDBKeyRange);
  localStorage.clear();
  vi.useFakeTimers({ toFake: ['Date'] });
  vi.setSystemTime(HEUTE);
});
afterEach(() => {
  cleanup();
  vi.useRealTimers();
  vi.unstubAllGlobals();
  localStorage.clear();
});

type Komp = ComponentType<Record<string, unknown>>;
const W = { timeout: 4000 };
const um = (j: number, m: number, t: number, h = 12, mi = 0, s = 0) => new Date(j, m - 1, t, h, mi, s);
const HEUTE = um(2026, 11, 24, 12);
const bilder = { get: async () => undefined, put: async () => {}, remove: async () => {} } as unknown as ImageStore;
const quelle = { scannen: async () => null, galerie: async () => null };
const norm = (t: string | null | undefined) => (t ?? '').replace(/[\s  ]+/g, ' ').trim();
function sichtbar(el: Element | null): boolean {
  for (let n = el as HTMLElement | null; n; n = n.parentElement) {
    if (n.hidden || n.getAttribute('aria-hidden') === 'true' || n.style?.display === 'none') return false;
  }
  return true;
}
function textEls(text: string | RegExp, root: ParentNode = document.body): HTMLElement[] {
  const passt = (t: string) => (typeof text === 'string' ? t === text : text.test(t));
  const k = Array.from(root.querySelectorAll<HTMLElement>('*')).filter((e) => passt(norm(e.textContent)) && sichtbar(e));
  return k.filter((c) => !k.some((o) => o !== c && c.contains(o)));
}
async function warte(ms = 40) {
  await act(async () => {
    await new Promise((r) => setTimeout(r, ms));
  });
}
async function tippe(el: Element | null) {
  expect(el).not.toBeNull();
  await act(async () => {
    fireEvent.click(el!);
    await new Promise((r) => setTimeout(r, 20));
  });
}
async function eingeben(el: Element, wert: string) {
  await act(async () => {
    fireEvent.change(el, { target: { value: wert } });
  });
}
const nav = () => screen.getByRole('navigation', { name: 'Hauptnavigation' });
const main = () => screen.getByRole('main');
async function menue(name: string) {
  await tippe(within(nav()).getByRole('button', { name }));
  await warte(60);
}
const buch = (titel: string): Buch => ({ id: crypto.randomUUID(), titel, status: 'gelesen', seitenanzahl: 500 });
const FW = buch('Fourth Wing');
const IF = buch('Iron Flame');
type Z = { b: Buch; text: string; wer?: string; seite?: string };

// --------------------------------------------------------------------------- Zitate über das Notizbuch (REQ-105)
const notizbuch = () => document.querySelector<HTMLElement>('[data-reiter-bereich="notizbuch"]')!;
async function zitatAnlegenImNotizbuch(text: string, wer?: string, seite?: string) {
  await tippe(within(notizbuch()).getAllByRole('button', { name: /^\+$|Zitat hinzufügen/ })[0]);
  const d = await screen.findByRole('dialog', {}, W);
  await eingeben(within(d).getByLabelText('Zitat'), text);
  if (wer) await eingeben(within(d).getByLabelText('Wer sagt es?'), wer);
  if (seite) await eingeben(within(d).getByLabelText('Seite'), seite);
  await tippe(within(d).getByRole('button', { name: 'Sichern' }));
  await warte(80);
  expect(screen.queryByRole('dialog')).toBeNull();
}
async function zitatLoeschenImNotizbuch(text: string) {
  await tippe(within(notizbuch()).getByText(text, { exact: false }));
  const d = await screen.findByRole('dialog', {}, W);
  await tippe(within(d).getByRole('button', { name: 'Zitat löschen' }));
  await tippe(await screen.findByRole('button', { name: 'Löschen' }, W));
  await warte(80);
}
async function notizbuchOeffnen(BD: Komp, b: Buch) {
  render(<BD buchId={b.id} bildspeicher={bilder} bildquelle={quelle} onZurueck={() => {}} />);
  const d = await screen.findByRole('region', { name: 'Buchdetails' }, W);
  await tippe(await within(d).findByRole('tab', { name: 'Notizbuch' }, W));
  await vi.waitFor(() => expect(notizbuch()).not.toBeNull(), W);
}

/** Legt Bücher und Zitate an und liefert die App derselben Module. */
async function welt(zitate: Z[], buecher: Buch[] = [FW, IF]): Promise<Komp> {
  vi.resetModules();
  const st = (await import('@/storage')) as typeof import('@/storage');
  const repo = st.createBookRepository();
  for (const b of buecher) await repo.save(b);
  const BD = (await import('@/views/BuchDetails')).default as unknown as Komp;
  for (const b of buecher) {
    const eigene = zitate.filter((z) => z.b.id === b.id);
    if (eigene.length === 0) continue;
    await notizbuchOeffnen(BD, b);
    for (const z of eigene) await zitatAnlegenImNotizbuch(z.text, z.wer, z.seite);
    cleanup();
  }
  return (await import('@/App')).default as unknown as Komp;
}
async function startseite(App: Komp, d: Date = HEUTE) {
  cleanup();
  vi.setSystemTime(d);
  render(<App />);
  await screen.findByRole('navigation', { name: 'Hauptnavigation' }, W);
  await vi.waitFor(() => expect(textEls('Diese Woche', main()).length).toBeGreaterThan(0), W);
  await warte(120);
}
async function neustart(d: Date = HEUTE) {
  vi.resetModules();
  const App = (await import('@/App')).default as unknown as Komp;
  await startseite(App, d);
  return App;
}
const kachelDa = () => textEls('Zitat des Tages', main()).length > 0;
/** Standard-Zitat (CEO 2026-11-25), Anzeige in deutschen Anführungszeichen. */
const STANDARD = 'Ein Drache ohne seinen Reiter ist tragisch. Ein Reiter ohne seinen Drachen ist tot.';
const STANDARD_ANZEIGE = `„${STANDARD}“`;
const standardDa = () => norm(main().textContent).includes(STANDARD);
function gezeigt(z: Z[]): string {
  const t = norm(main().textContent);
  // AK-7: Sobald eigene Zitate existieren, nimmt das Standard-Zitat nicht an der Auswahl teil.
  expect(t, 'Standard-Zitat neben eigenen Zitaten').not.toContain(STANDARD);
  const da = z.filter((q) => t.includes(norm(q.text)));
  expect(da.map((q) => q.text), 'genau ein Zitat auf der Startseite').toHaveLength(1);
  expect(kachelDa()).toBe(true);
  return da[0].text;
}
const DREI: Z[] = [
  { b: FW, text: 'Ich bin nicht das Feuer.', wer: 'Violet', seite: '312' },
  { b: FW, text: 'Drachen wählen ihre Reiter.', seite: '40' },
  { b: IF, text: 'Mut ist eine Entscheidung.', wer: 'Xaden' },
];

// Fassung 2026-11-25: Ohne eigene Zitate zeigt die Kachel das Standard-Zitat (bisher entfiel sie).
/** Kachel „Zitat des Tages“: kleinster Vorfahr der Überschrift, der auch den Zitattext enthält. */
function kachel(text: string): HTMLElement {
  const ueber = textEls('Zitat des Tages', main())[0];
  expect(ueber, 'Überschrift „Zitat des Tages“').toBeDefined();
  let k: HTMLElement | null = ueber;
  while (k && !norm(k.textContent).includes(text)) k = k.parentElement;
  expect(k, 'Kachel mit Zitattext').not.toBeNull();
  return k!;
}
describe('REQ-106 Ohne eigene Zitate das Standard-Zitat', () => {
  it('[REQ-106/AK-1] kein Buch hat Zitate: Kachel zeigt genau „„Ein Drache …““, „Kodex des Drachenreiters“ und „Fourth Wing“, ohne Seitenangabe', async () => {
    const App = await welt([]);
    await startseite(App);
    expect(kachelDa()).toBe(true);
    expect(textEls(STANDARD_ANZEIGE, main())).toHaveLength(1);
    const k = kachel(STANDARD);
    const t = norm(k.textContent);
    expect(t).toContain('Kodex des Drachenreiters');
    expect(t).toContain('Fourth Wing');
    expect(t).not.toMatch(/S\.\s?\d/);
    // Text genau einmal, in „…“ (nicht doppelt gequotet, nicht in "…")
    expect(t.split(STANDARD)).toHaveLength(2);
    expect(t).not.toContain(`"${STANDARD}"`);
    expect(t).not.toContain(`„„${STANDARD}`);
  });

  it('[REQ-106/AK-1] keine Bücher überhaupt: Kachel mit dem Standard-Zitat', async () => {
    const App = await welt([], []);
    await startseite(App);
    expect(textEls(STANDARD_ANZEIGE, main())).toHaveLength(1);
    expect(norm(kachel(STANDARD).textContent)).toContain('Kodex des Drachenreiters');
  });

  it('[REQ-106/AK-1] Kachel bleibt über Tage und nach Neustart beim Standard-Zitat, solange keine Zitate existieren', async () => {
    const App = await welt([]);
    for (let i = 0; i < 3; i++) {
      await startseite(App, um(2026, 11, 24 + i, 9));
      expect(textEls(STANDARD_ANZEIGE, main())).toHaveLength(1);
    }
    await neustart(um(2026, 11, 30, 9));
    expect(textEls(STANDARD_ANZEIGE, main())).toHaveLength(1);
  });

  it('[REQ-106/AK-1] das Standard-Zitat erscheint in keinem Notizbuch (auch nicht bei „Fourth Wing“) und ist nicht gespeichert', async () => {
    const App = await welt([]);
    await startseite(App);
    expect(standardDa()).toBe(true);
    cleanup();
    for (const b of [FW, IF]) {
      vi.resetModules();
      const BD = (await import('@/views/BuchDetails')).default as unknown as Komp;
      await notizbuchOeffnen(BD, b);
      await warte(60);
      expect(notizbuch().textContent).not.toContain('Ein Drache ohne seinen Reiter');
      expect(notizbuch().textContent).not.toContain('Kodex des Drachenreiters');
      cleanup();
    }
    const st = (await import('@/storage')) as typeof import('@/storage');
    expect(await st.createZitatRepository().alle()).toEqual([]);
  });
});

describe('REQ-106 Standard-Zitat antippen', () => {
  it('[REQ-106/AK-6] Kachel mit Standard-Zitat antippen, „Fourth Wing“ gespeichert: nichts öffnet sich, Startseite bleibt', async () => {
    const App = await welt([], [FW, IF]);
    await startseite(App);
    const vorher = main().innerHTML;
    await tippe(textEls(STANDARD_ANZEIGE, main())[0]);
    await tippe(textEls('Zitat des Tages', main())[0]);
    await tippe(kachel(STANDARD));
    await warte(80);
    expect(screen.queryByRole('region', { name: 'Buchdetails' })).toBeNull();
    expect(screen.queryAllByRole('dialog')).toHaveLength(0);
    expect(textEls('Diese Woche', main()).length).toBeGreaterThan(0);
    expect(main().innerHTML).toBe(vorher);
  });

  it('[REQ-106/AK-6] die Kachel mit Standard-Zitat ist kein Bedienelement (kein Button/Link)', async () => {
    const App = await welt([]);
    await startseite(App);
    const k = kachel(STANDARD);
    for (let n: HTMLElement | null = textEls(STANDARD_ANZEIGE, main())[0]; n && n !== k.parentElement; n = n.parentElement) {
      expect(n.tagName).not.toMatch(/^(BUTTON|A)$/);
      expect(n.getAttribute('role')).not.toBe('button');
    }
  });
});

describe('REQ-106 Eigene Zitate verdrängen das Standard-Zitat', () => {
  it('[REQ-106/AK-7] Standard-Zitat → Zitat „Ich bin nicht das Feuer.“ im Notizbuch speichern → Kachel zeigt `„Ich bin nicht das Feuer.“`, nicht das Standard-Zitat', async () => {
    const App = await welt([]);
    await startseite(App);
    expect(standardDa()).toBe(true);
    cleanup();
    const BD = (await import('@/views/BuchDetails')).default as unknown as Komp;
    await notizbuchOeffnen(BD, FW);
    await zitatAnlegenImNotizbuch('Ich bin nicht das Feuer.');
    await startseite(App);
    expect(textEls('„Ich bin nicht das Feuer.“', main())).toHaveLength(1);
    expect(standardDa()).toBe(false);
  });

  it('[REQ-106/AK-7] dieses einzige Zitat wieder löschen → Kachel zeigt wieder das Standard-Zitat', async () => {
    const eins: Z[] = [{ b: FW, text: 'Ich bin nicht das Feuer.' }];
    const App = await welt(eins);
    await startseite(App);
    gezeigt(eins);
    await tippe(textEls('Zitat des Tages', main())[0]);
    await screen.findByRole('region', { name: 'Buchdetails' }, W);
    await vi.waitFor(() => expect(notizbuch()).not.toBeNull(), W);
    await zitatLoeschenImNotizbuch('Ich bin nicht das Feuer.');
    await menue('Start');
    await warte(120);
    expect(textEls(STANDARD_ANZEIGE, main())).toHaveLength(1);
    expect(main().textContent).not.toContain('Ich bin nicht das Feuer.');
  });

  it('[REQ-106/AK-7] mit eigenen Zitaten erscheint das Standard-Zitat an keinem von 10 Tagen', async () => {
    const zwei = DREI.slice(0, 2);
    const App = await welt(zwei);
    for (let i = 0; i < 10; i++) {
      await startseite(App, um(2026, 11, 24 + i, 10));
      gezeigt(zwei);
      expect(standardDa()).toBe(false);
    }
  });
});

describe('REQ-106 Kachel mit Titel und Seite', () => {
  it('[REQ-106/AK-2] genau ein Zitat aus „Fourth Wing“, S. 312: Zitattext in „…“, „Fourth Wing“, „S. 312“', async () => {
    const z: Z[] = [{ b: FW, text: 'Ich bin nicht das Feuer.', seite: '312' }];
    const App = await welt(z);
    await startseite(App);
    expect(gezeigt(z)).toBe('Ich bin nicht das Feuer.');
    const t = norm(main().textContent);
    expect(t).toContain('Fourth Wing');
    expect(t).toContain('S. 312');
    // Mini-Änderung 2026-11-25: Zitattext genau in deutschen Anführungszeichen (nur Anzeige).
    expect(textEls('„Ich bin nicht das Feuer.“', main())).toHaveLength(1);
    const ueber = textEls('Zitat des Tages', main())[0];
    expect(ueber.compareDocumentPosition(textEls(/Ich bin nicht das Feuer\./, main())[0]) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it('[REQ-106/AK-2] ohne Seite keine Seitenangabe; mit „Wer sagt es?“ zusätzlich der Sprecher', async () => {
    const z: Z[] = [{ b: IF, text: 'Mut ist eine Entscheidung.', wer: 'Xaden' }];
    const App = await welt(z);
    await startseite(App);
    gezeigt(z);
    const t = norm(main().textContent);
    expect(t).toContain('Iron Flame');
    expect(t).toContain('Xaden');
    expect(t).not.toMatch(/S\.\s?\d/);
  });

  it('[REQ-106/AK-2] Zitat-des-Tages-Kachel steht unter dem Jahresziel (letzter Bereich)', async () => {
    const z: Z[] = [{ b: FW, text: 'Ich bin nicht das Feuer.' }];
    const App = await welt(z);
    await startseite(App);
    const ziel = textEls('Jahresziel festlegen', main())[0];
    const kachel = textEls('Zitat des Tages', main())[0];
    expect(ziel).toBeDefined();
    expect(ziel.compareDocumentPosition(kachel) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });
});

describe('REQ-106 Gleich über den Tag, anders am Folgetag', () => {
  it('[REQ-106/AK-3] drei Zitate aus zwei Büchern: am selben Tag mehrfach und nach Neustart dasselbe, am Folgetag ein anderes', async () => {
    const App = await welt(DREI);
    await startseite(App, um(2026, 11, 24, 0, 0, 0));
    const heute = gezeigt(DREI);
    await startseite(App, um(2026, 11, 24, 12, 0));
    expect(gezeigt(DREI)).toBe(heute);
    await menue('Bücher');
    await menue('Start');
    await warte(80);
    expect(gezeigt(DREI)).toBe(heute);
    await neustart(um(2026, 11, 24, 23, 59, 59));
    expect(gezeigt(DREI)).toBe(heute);
    await neustart(um(2026, 11, 25, 0, 0, 0));
    expect(gezeigt(DREI)).not.toBe(heute);
  });

  it('[REQ-106/AK-3] über 10 Folgetage (inkl. Monats- und Jahreswechsel) jeweils ein anderes Zitat als am Vortag', async () => {
    const App = await welt(DREI);
    const tage = Array.from({ length: 10 }, (_, i) => um(2026, 12, 27 + i, 9));
    let vortag = '';
    for (const [i, d] of tage.entries()) {
      await startseite(App, d);
      const z = gezeigt(DREI);
      if (i > 0) expect(z, d.toDateString()).not.toBe(vortag);
      vortag = z;
    }
  });

  it('[REQ-106/AK-3] genau zwei Zitate: Tag für Tag abwechselnd', async () => {
    const zwei = DREI.slice(0, 2);
    const App = await welt(zwei);
    const folge: string[] = [];
    for (let i = 0; i < 5; i++) {
      await startseite(App, um(2026, 11, 24 + i, 18));
      folge.push(gezeigt(zwei));
    }
    for (let i = 1; i < folge.length; i++) expect(folge[i]).not.toBe(folge[i - 1]);
  });

  it('[REQ-106/AK-3] genau ein Zitat: erscheint jeden Tag', async () => {
    const eins = DREI.slice(2);
    const App = await welt(eins);
    for (let i = 0; i < 3; i++) {
      await startseite(App, um(2026, 11, 24 + i, 8));
      expect(gezeigt(eins)).toBe(eins[0].text);
    }
  });

  it('[REQ-106/AK-3] ein am selben Tag neu angelegtes Zitat ändert das Zitat des Tages nicht', async () => {
    const App = await welt(DREI);
    await startseite(App);
    const heute = gezeigt(DREI);
    // weiteres Zitat in „Fourth Wing“ anlegen, dann zurück zur Startseite
    cleanup();
    vi.resetModules();
    const BD = (await import('@/views/BuchDetails')).default as unknown as Komp;
    await notizbuchOeffnen(BD, FW);
    await zitatAnlegenImNotizbuch('Ein neues Zitat am selben Tag.');
    cleanup();
    await neustart(um(2026, 11, 24, 20));
    const alle = [...DREI, { b: FW, text: 'Ein neues Zitat am selben Tag.' }];
    expect(gezeigt(alle)).toBe(heute);
  });
});

describe('REQ-106 Antippen öffnet „Notizbuch“', () => {
  it('[REQ-106/AK-4] Kachel mit Zitat aus „Fourth Wing“ antippen: Buchdetails „Fourth Wing“, Reiter „Notizbuch“ aktiv', async () => {
    const z: Z[] = [{ b: FW, text: 'Ich bin nicht das Feuer.', seite: '312' }];
    const App = await welt(z);
    await startseite(App);
    await tippe(textEls(/Ich bin nicht das Feuer\./, main())[0]);
    const d = await screen.findByRole('region', { name: 'Buchdetails' }, W);
    await vi.waitFor(() => expect(within(d).getByRole('tab', { name: 'Notizbuch' })).toHaveAttribute('aria-selected', 'true'), W);
    expect(within(d).getByRole('tab', { name: 'Rezension' })).toHaveAttribute('aria-selected', 'false');
    expect(d.textContent).toContain('Fourth Wing');
    expect(notizbuch().textContent).toContain('Ich bin nicht das Feuer.');
  });

  it('[REQ-106/AK-4] Zitat aus „Iron Flame“: öffnet „Iron Flame“ (nicht „Fourth Wing“) im Reiter „Notizbuch“', async () => {
    const z: Z[] = [{ b: IF, text: 'Mut ist eine Entscheidung.' }];
    const App = await welt(z);
    await startseite(App);
    await tippe(textEls('Zitat des Tages', main())[0]);
    const d = await screen.findByRole('region', { name: 'Buchdetails' }, W);
    await vi.waitFor(() => expect(within(d).getByRole('tab', { name: 'Notizbuch' })).toHaveAttribute('aria-selected', 'true'), W);
    expect(d.textContent).toContain('Iron Flame');
    expect(d.textContent).not.toContain('Fourth Wing');
  });
});

describe('REQ-106 Gelöschtes Zitat des Tages', () => {
  it('[REQ-106/AK-5] heutiges Zitat im Notizbuch löschen: Startseite zeigt danach ein anderes, vorhandenes Zitat', async () => {
    const App = await welt(DREI);
    await startseite(App);
    const heute = gezeigt(DREI);
    await tippe(textEls(new RegExp(heute.replace('.', '\\.')), main())[0]);
    await screen.findByRole('region', { name: 'Buchdetails' }, W);
    await vi.waitFor(() => expect(notizbuch()).not.toBeNull(), W);
    await zitatLoeschenImNotizbuch(heute);
    expect(notizbuch().textContent).not.toContain(heute);
    await menue('Start');
    await warte(120);
    const rest = DREI.filter((q) => q.text !== heute);
    const neu = gezeigt(rest);
    expect(main().textContent).not.toContain(heute);
    // bleibt für den Rest des Tages, auch nach Neustart
    await neustart(um(2026, 11, 24, 22));
    expect(gezeigt(rest)).toBe(neu);
  });

  it('[REQ-106/AK-5] Löschen eines anderen Zitats ändert das Zitat des Tages nicht', async () => {
    const App = await welt(DREI);
    await startseite(App);
    const heute = gezeigt(DREI);
    const anderes = DREI.find((q) => q.text !== heute)!;
    cleanup();
    vi.resetModules();
    const BD = (await import('@/views/BuchDetails')).default as unknown as Komp;
    await notizbuchOeffnen(BD, anderes.b);
    await zitatLoeschenImNotizbuch(anderes.text);
    cleanup();
    await neustart();
    expect(gezeigt(DREI.filter((q) => q !== anderes))).toBe(heute);
  });

  // Fassung 2026-11-25: ohne Zitate zeigt die Kachel das Standard-Zitat.
  it('[REQ-106/AK-5] letztes Zitat gelöscht: Kachel zeigt das Standard-Zitat', async () => {
    const eins: Z[] = [{ b: FW, text: 'Ich bin nicht das Feuer.' }];
    const App = await welt(eins);
    await startseite(App);
    gezeigt(eins);
    await tippe(textEls('Zitat des Tages', main())[0]);
    await screen.findByRole('region', { name: 'Buchdetails' }, W);
    await vi.waitFor(() => expect(notizbuch()).not.toBeNull(), W);
    await zitatLoeschenImNotizbuch('Ich bin nicht das Feuer.');
    await menue('Start');
    await warte(120);
    expect(kachelDa()).toBe(true);
    expect(textEls(STANDARD_ANZEIGE, main())).toHaveLength(1);
    expect(main().textContent).not.toContain('Ich bin nicht das Feuer.');
  });
});
