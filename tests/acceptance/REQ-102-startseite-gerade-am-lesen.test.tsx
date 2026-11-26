/**
 * Akzeptanztests REQ-102 – Startseite: „Gerade am Lesen“ mit Fortschritt, Fortschritt direkt eintragen.
 * Abgeleitet aus dem REQ-Text (Sprint 10, Teil C; Mini-Änderung 2026-11-25: Anordnung der Karte, AK-2). Schwarzkasten über die App (Rollen und Texte):
 *  - Fortschritt wie in den Buchdetails (REQ-023): role="progressbar" „Lesefortschritt“ bzw. Herz-Schaltfläche
 *    „Buchlänge festlegen“; Angabe „Seite / Gesamt“ bzw. „x %“.
 *  - Karte = nächster Vorfahr des Titels, der genau einen Fortschritt enthält.
 *  - Menüs „Aktuelle Seite“ und „Buchlänge“: role="dialog" mit diesem Namen (REQ-024, REQ-025).
 *  - Buchdaten über die Repository-Schnittstelle der App vorbelegt (createBookRepository, fake-indexeddb).
 */
import '@testing-library/jest-dom/vitest';
import { act, cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { IDBFactory, IDBKeyRange } from 'fake-indexeddb';
import type { ComponentType } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { Buch } from '@/domain/buch';
import type { BookRepository } from '@/storage';

vi.mock('@/buecher/demodaten', () => ({ demoBuecher: [] }));
beforeEach(() => {
  vi.stubGlobal('indexedDB', new IDBFactory());
  vi.stubGlobal('IDBKeyRange', IDBKeyRange);
  localStorage.clear();
  vi.useFakeTimers({ toFake: ['Date'] });
  vi.setSystemTime(new Date(2026, 10, 24, 15, 0));
});
afterEach(() => {
  cleanup();
  vi.useRealTimers();
  vi.unstubAllGlobals();
  localStorage.clear();
});

type Komp = ComponentType<Record<string, unknown>>;
const W = { timeout: 4000 };
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
let nr = 0;
const buch = (titel: string, f: Partial<Buch> = {}): Buch => ({ id: `b102-${++nr}-${crypto.randomUUID()}`, titel, status: 'am_lesen', ...f });
type Welt = { repo: BookRepository; App: Komp };
async function starte(buecher: Buch[] = []): Promise<Welt> {
  vi.resetModules();
  const st = (await import('@/storage')) as typeof import('@/storage');
  const repo = st.createBookRepository();
  for (const b of buecher) await repo.save(b);
  const App = (await import('@/App')).default as unknown as Komp;
  render(<App />);
  await screen.findByRole('navigation', { name: 'Hauptnavigation' }, W);
  await vi.waitFor(() => expect(textEls('Gerade am Lesen', main()).length).toBeGreaterThan(0), W);
  await warte(80);
  return { repo, App };
}
const FORTSCHRITT = '[role="progressbar"][aria-label="Lesefortschritt"], button[aria-label="Buchlänge festlegen"]';
const fortschritte = () => Array.from(main().querySelectorAll<HTMLElement>(FORTSCHRITT));
function karte(titel: string): HTMLElement {
  const t = textEls(titel, main());
  expect(t.length, `Titel „${titel}“ auf der Startseite`).toBeGreaterThan(0);
  let el: HTMLElement | null = t[0];
  while (el && el !== main() && el.querySelectorAll(FORTSCHRITT).length === 0) el = el.parentElement;
  expect(el && el !== main(), `Karte „${titel}“ mit Fortschritt`).toBe(true);
  expect(el!.querySelectorAll(FORTSCHRITT)).toHaveLength(1);
  // bis zur ganzen Karte erweitern: solange der Vorfahr nur diesen einen Fortschritt enthält und nicht der Bereich ist
  while (el!.parentElement && el!.parentElement !== main() && el!.parentElement.querySelectorAll(FORTSCHRITT).length === 1 && !el!.parentElement.textContent?.includes('Gerade am Lesen')) el = el!.parentElement;
  return el!;
}
async function karteDa(titel: string) {
  return vi.waitFor(() => karte(titel), W);
}

describe('REQ-102 Bücher „am lesen“', () => {
  it('[REQ-102/AK-1] genau „Fourth Wing“ und „Iron Flame“ untereinander, je mit Cover, Titel, Autor und Fortschritt; „Onyx Storm“ fehlt', async () => {
    await starte([
      buch('Iron Flame', { autor: 'Rebecca Yarros', seitenanzahl: 600, aktuelleSeite: 100 }),
      buch('Onyx Storm', { autor: 'Rebecca Yarros', status: 'ungelesen', seitenanzahl: 500 }),
      buch('Fourth Wing', { autor: 'Rebecca Yarros', seitenanzahl: 400, aktuelleSeite: 42 }),
    ]);
    const fw = await karteDa('Fourth Wing');
    const ifl = karte('Iron Flame');
    expect(fortschritte()).toHaveLength(2);
    expect(main().textContent).not.toContain('Onyx Storm');
    for (const k of [fw, ifl]) {
      expect(k.textContent).toContain('Rebecca Yarros');
      expect(k.querySelector('img, [data-cover-platzhalter]'), 'Cover bzw. Platzhalter').not.toBeNull();
    }
    // untereinander, A–Z: Fourth Wing vor Iron Flame
    expect(fw.compareDocumentPosition(ifl) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(fw.contains(ifl) || ifl.contains(fw)).toBe(false);
    expect(main().textContent).not.toContain('Gerade kein Buch offen');
  });

  it('[REQ-102/AK-1] Karten stehen im Bereich „Gerade am Lesen“ (nach dessen Überschrift, vor „Diese Woche“)', async () => {
    await starte([buch('Fourth Wing', { seitenanzahl: 400 })]);
    const k = await karteDa('Fourth Wing');
    const ueber = textEls('Gerade am Lesen', main())[0];
    const woche = textEls('Diese Woche', main())[0];
    expect(ueber.compareDocumentPosition(k) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(k.compareDocumentPosition(woche) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it('[REQ-102/AK-1] andere Status (gelesen, abgebrochen, Wunschliste, ungelesen) erscheinen nicht; Sortierung A–Z über mehrere Bücher', async () => {
    await starte([
      buch('Zeitreise', { seitenanzahl: 100 }),
      buch('Gelesenes', { status: 'gelesen', seitenanzahl: 100 }),
      buch('Abgebrochenes', { status: 'abgebrochen', seitenanzahl: 100 }),
      buch('Wunsch', { status: 'wunschliste', seitenanzahl: 100 }),
      buch('Mitte', { seitenanzahl: 100 }),
      buch('Anfang', { seitenanzahl: 100 }),
    ]);
    await karteDa('Zeitreise');
    expect(fortschritte()).toHaveLength(3);
    for (const t of ['Gelesenes', 'Abgebrochenes', 'Wunsch']) expect(textEls(t, main()), t).toHaveLength(0);
    const [a, m, z] = ['Anfang', 'Mitte', 'Zeitreise'].map(karte);
    expect(a.compareDocumentPosition(m) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(m.compareDocumentPosition(z) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it('[REQ-102/AK-1] ohne Autor keine Autorzeile, ohne Bild der Cover-Platzhalter', async () => {
    await starte([buch('Namenlos', { seitenanzahl: 200, aktuelleSeite: 10 })]);
    const k = await karteDa('Namenlos');
    expect(k.textContent).not.toMatch(/undefined|null|Unbekannt/);
    expect(norm(k.textContent).replace(/\s/g, '')).toBe('Namenlos10/200');
    expect(k.querySelector('[data-cover-platzhalter]')).not.toBeNull();
  });
});

describe('REQ-102 Fortschritt wie in den Buchdetails', () => {
  it('[REQ-102/AK-2] 400 Seiten, Seite 42: Balken und „42 / 400“', async () => {
    await starte([buch('Fourth Wing', { seitenanzahl: 400, aktuelleSeite: 42 })]);
    const k = await karteDa('Fourth Wing');
    const balken = within(k).getByRole('progressbar', { name: 'Lesefortschritt' });
    expect(Number(balken.getAttribute('aria-valuenow'))).toBeCloseTo(10.5, 0);
    expect(norm(k.textContent)).toContain('42 / 400');
  });

  it('[REQ-102/AK-2] Modus „%“ mit 5 %: Balken und „5 %“, keine Seitenangabe', async () => {
    await starte([buch('Fourth Wing', { seitenanzahl: 400, fortschrittsmodus: 'prozent', fortschrittProzent: 5 })]);
    const k = await karteDa('Fourth Wing');
    expect(Number(within(k).getByRole('progressbar', { name: 'Lesefortschritt' }).getAttribute('aria-valuenow'))).toBeCloseTo(5, 0);
    expect(norm(k.textContent)).toContain('5 %');
    expect(norm(k.textContent)).not.toContain('/ 400');
  });

  it.each([
    ['Seite / Gesamt', { seitenanzahl: 400, aktuelleSeite: 42 }, '42 / 400'],
    ['Modus „%“', { seitenanzahl: 400, fortschrittsmodus: 'prozent', fortschrittProzent: 5 }, '5 %'],
  ] as const)('[REQ-102/AK-2] Anordnung (%s): Balken unter Titel/Autor linksbündig über die Restbreite, „%s“ rechts daneben', async (_n, f, wert) => {
    // Mini-Änderung 2026-11-25. jsdom berechnet kein Layout, geprüft werden Reihenfolge und Stilangaben.
    await starte([buch('Fourth Wing', { autor: 'Rebecca Yarros', ...(f as Partial<Buch>) })]);
    const k = await karteDa('Fourth Wing');
    const balken = within(k).getByRole('progressbar', { name: 'Lesefortschritt' });
    const angabe = textEls(wert, k)[0];
    expect(angabe, `Angabe „${wert}“`).toBeDefined();
    // Gemeinsamer Behälter von Balken und Angabe: eine Zeile, Balken zuerst (links), Angabe danach (rechts).
    let zeile: HTMLElement = balken.parentElement!;
    while (!zeile.contains(angabe)) zeile = zeile.parentElement!;
    const zs = getComputedStyle(zeile);
    expect(zs.display).toBe('flex');
    expect(zs.flexDirection === '' || zs.flexDirection === 'row', 'Balken und Angabe nebeneinander').toBe(true);
    expect(balken.compareDocumentPosition(angabe) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    // Balken nimmt die Restbreite ein (wächst), statt einer festen Breite.
    const bs = getComputedStyle(balken);
    expect(bs.flexGrow).toBe('1');
    expect(bs.width === 'auto' || bs.width === '').toBe(true);
    // Unter Titel und Autor, linksbündig mit ihnen: gleiche Rasterspalte, keine Zentrierung.
    const titel = textEls('Fourth Wing', k)[0];
    const autor = textEls('Rebecca Yarros', k)[0];
    expect(titel.compareDocumentPosition(zeile) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(autor.compareDocumentPosition(zeile) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(zs.alignItems).not.toBe('');
    expect(zs.justifyContent === '' || zs.justifyContent === 'flex-start' || zs.justifyContent === 'normal').toBe(true);
    const spalte = (el: HTMLElement) => {
      let e: HTMLElement | null = el;
      while (e && e.parentElement !== k) e = e.parentElement;
      return e ? getComputedStyle(e).gridColumn : '';
    };
    expect(spalte(zeile)).toBe(spalte(titel));
  });

  it('[REQ-102/AK-2] Grenzen: noch nichts gelesen „0 / 400“, fertig „400 / 400“', async () => {
    await starte([buch('Anfang', { seitenanzahl: 400 }), buch('Ende', { seitenanzahl: 400, aktuelleSeite: 400 })]);
    expect(norm((await karteDa('Anfang')).textContent)).toContain('0 / 400');
    expect(norm(karte('Ende').textContent)).toContain('400 / 400');
    expect(Number(within(karte('Ende')).getByRole('progressbar').getAttribute('aria-valuenow'))).toBe(100);
  });

  it('[REQ-102/AK-2] ohne Seitenanzahl: Herz-Icon statt Balken', async () => {
    await starte([buch('Ohne Länge')]);
    const k = await karteDa('Ohne Länge');
    expect(within(k).getByRole('button', { name: 'Buchlänge festlegen' })).toBeInTheDocument();
    expect(within(k).queryByRole('progressbar')).toBeNull();
  });
});

describe('REQ-102 Karte öffnet Buchdetails', () => {
  it('[REQ-102/AK-3] Titel antippen öffnet die Buchdetails von „Fourth Wing“; Zurück führt zur Startseite', async () => {
    await starte([buch('Fourth Wing', { seitenanzahl: 400 }), buch('Iron Flame', { seitenanzahl: 600 })]);
    await karteDa('Fourth Wing');
    await tippe(textEls('Fourth Wing', main())[0]);
    const d = await screen.findByRole('region', { name: 'Buchdetails' }, W);
    await vi.waitFor(() => expect(d.textContent).toContain('Fourth Wing'), W);
    expect(d.textContent).not.toContain('Iron Flame');
    await tippe(within(d).getByRole('button', { name: 'Zurück' }));
    await warte(80);
    expect(screen.queryByRole('region', { name: 'Buchdetails' })).toBeNull();
    await karteDa('Fourth Wing');
    expect(within(nav()).getByRole('button', { name: 'Start' })).toHaveAttribute('aria-current', 'page');
  });

  it('[REQ-102/AK-3] Cover antippen öffnet ebenfalls die Buchdetails dieses Buches', async () => {
    await starte([buch('Iron Flame', { seitenanzahl: 600 }), buch('Fourth Wing', { seitenanzahl: 400 })]);
    const k = await karteDa('Iron Flame');
    await tippe(k.querySelector('img, [data-cover-platzhalter]'));
    const d = await screen.findByRole('region', { name: 'Buchdetails' }, W);
    await vi.waitFor(() => expect(d.textContent).toContain('Iron Flame'), W);
    expect(d.textContent).not.toContain('Fourth Wing');
  });

  it('[REQ-102/AK-3] Antippen des Fortschritts öffnet nicht die Buchdetails', async () => {
    await starte([buch('Fourth Wing', { seitenanzahl: 400, aktuelleSeite: 42 })]);
    const k = await karteDa('Fourth Wing');
    await tippe(within(k).getByRole('progressbar', { name: 'Lesefortschritt' }));
    expect(screen.queryByRole('region', { name: 'Buchdetails' })).toBeNull();
  });
});

describe('REQ-102 Fortschritt direkt eintragen', () => {
  async function aktuelleSeite(k: HTMLElement, wert: string) {
    await tippe(within(k).getByRole('progressbar', { name: 'Lesefortschritt' }));
    const d = await screen.findByRole('dialog', { name: 'Aktuelle Seite' }, W);
    await eingeben(within(d).getByLabelText('Aktuelle Seite'), wert);
    return d;
  }

  it('[REQ-102/AK-4] Balken antippen, 60 eintragen, „Sichern“: Menü zu, Startseite bleibt, „60 / 400“, eine Sitzung mehr', async () => {
    const fw = buch('Fourth Wing', { seitenanzahl: 400, aktuelleSeite: 42, sitzungen: [{ zeitpunkt: new Date(2026, 10, 20, 10).toISOString(), seite: 42 }] });
    const w = await starte([fw]);
    const d = await aktuelleSeite(await karteDa('Fourth Wing'), '60');
    await tippe(within(d).getByRole('button', { name: 'Sichern' }));
    await warte(100);
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(screen.queryByRole('region', { name: 'Buchdetails' })).toBeNull();
    await vi.waitFor(() => expect(norm(karte('Fourth Wing').textContent)).toContain('60 / 400'), W);
    const gespeichert = await w.repo.get(fw.id);
    expect(gespeichert?.aktuelleSeite).toBe(60);
    expect(gespeichert?.sitzungen).toHaveLength(2);
    expect(new Date(gespeichert!.sitzungen![1].zeitpunkt).getDate()).toBe(24);
  });

  it('[REQ-102/AK-4] auch die Angabe „42 / 400“ öffnet das Menü; nur das betroffene Buch ändert sich', async () => {
    const fw = buch('Fourth Wing', { seitenanzahl: 400, aktuelleSeite: 42 });
    const ifl = buch('Iron Flame', { seitenanzahl: 600, aktuelleSeite: 100 });
    const w = await starte([fw, ifl]);
    const k = await karteDa('Fourth Wing');
    await tippe(textEls('42 / 400', k)[0]);
    const d = await screen.findByRole('dialog', { name: 'Aktuelle Seite' }, W);
    expect((within(d).getByLabelText('Aktuelle Seite') as HTMLInputElement).value).toBe('42');
    await eingeben(within(d).getByLabelText('Aktuelle Seite'), '43');
    await tippe(within(d).getByRole('button', { name: 'Sichern' }));
    await warte(100);
    await vi.waitFor(() => expect(norm(karte('Fourth Wing').textContent)).toContain('43 / 400'), W);
    expect(norm(karte('Iron Flame').textContent)).toContain('100 / 600');
    expect((await w.repo.get(ifl.id))?.aktuelleSeite).toBe(100);
  });

  it('[REQ-102/AK-4] Schließen ohne „Sichern“ verwirft: weiter „42 / 400“, keine Sitzung', async () => {
    const fw = buch('Fourth Wing', { seitenanzahl: 400, aktuelleSeite: 42 });
    const w = await starte([fw]);
    const d = await aktuelleSeite(await karteDa('Fourth Wing'), '99');
    await tippe(within(d).getByRole('button', { name: 'Schließen' }));
    await warte(80);
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(norm(karte('Fourth Wing').textContent)).toContain('42 / 400');
    const g = await w.repo.get(fw.id);
    expect(g?.aktuelleSeite).toBe(42);
    expect(g?.sitzungen ?? []).toHaveLength(0);
  });

  it('[REQ-102/AK-4] Fortschritt bleibt nach Neustart erhalten', async () => {
    const fw = buch('Fourth Wing', { seitenanzahl: 400, aktuelleSeite: 42 });
    await starte([fw]);
    const d = await aktuelleSeite(await karteDa('Fourth Wing'), '120');
    await tippe(within(d).getByRole('button', { name: 'Sichern' }));
    await warte(100);
    cleanup();
    await starte();
    expect(norm((await karteDa('Fourth Wing')).textContent)).toContain('120 / 400');
  });
});

describe('REQ-102 Ohne Seitenanzahl', () => {
  it('[REQ-102/AK-5] Herz-Icon antippen öffnet das Menü „Buchlänge“, nicht die Buchdetails', async () => {
    await starte([buch('Ohne Länge')]);
    const k = await karteDa('Ohne Länge');
    await tippe(within(k).getByRole('button', { name: 'Buchlänge festlegen' }));
    expect(await screen.findByRole('dialog', { name: 'Buchlänge' }, W)).toBeInTheDocument();
    expect(screen.queryByRole('dialog', { name: 'Aktuelle Seite' })).toBeNull();
    expect(screen.queryByRole('region', { name: 'Buchdetails' })).toBeNull();
  });
});

describe('REQ-102 Kein Buch „am lesen“', () => {
  it('[REQ-102/AK-7] nur gelesene/ungelesene Bücher: Hinweis „Gerade kein Buch offen“, keine Karte', async () => {
    await starte([buch('Gelesenes', { status: 'gelesen', seitenanzahl: 100 }), buch('Neues', { status: 'ungelesen', seitenanzahl: 100 })]);
    await vi.waitFor(() => expect(textEls('Gerade kein Buch offen', main())).toHaveLength(1), W);
    expect(fortschritte()).toHaveLength(0);
    expect(main().textContent).not.toContain('Gelesenes');
  });

  it('[REQ-102/AK-7] leere Bibliothek: Hinweis steht im Bereich; Antippen bewirkt nichts', async () => {
    await starte();
    const h = await vi.waitFor(() => {
      const e = textEls('Gerade kein Buch offen', main());
      expect(e).toHaveLength(1);
      return e[0];
    }, W);
    const ueber = textEls('Gerade am Lesen', main())[0];
    expect(ueber.compareDocumentPosition(h) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    await tippe(h);
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(screen.queryByRole('region', { name: 'Buchdetails' })).toBeNull();
    expect(within(nav()).getByRole('button', { name: 'Start' })).toHaveAttribute('aria-current', 'page');
  });

  it('[REQ-102/AK-7] Hinweis entfällt, sobald ein Buch „am lesen“ ist', async () => {
    await starte([buch('Fourth Wing', { seitenanzahl: 400 })]);
    await karteDa('Fourth Wing');
    expect(main().textContent).not.toContain('Gerade kein Buch offen');
  });
});

describe('REQ-102 Statuswechsel', () => {
  it('[REQ-102/AK-6] „Onyx Storm“ in den Buchdetails auf „am lesen“ gesetzt → erscheint auf der Startseite', async () => {
    const os = buch('Onyx Storm', { status: 'ungelesen', seitenanzahl: 500 });
    await starte([buch('Fourth Wing', { seitenanzahl: 400 }), os]);
    await karteDa('Fourth Wing');
    expect(main().textContent).not.toContain('Onyx Storm');
    await menue('Bücher');
    await tippe(await vi.waitFor(() => {
      const e = textEls('Onyx Storm', main());
      expect(e.length).toBeGreaterThan(0);
      return e[0];
    }, W));
    const d = await screen.findByRole('region', { name: 'Buchdetails' }, W);
    const pille = await vi.waitFor(() => {
      const p = d.querySelector<HTMLElement>('[aria-haspopup="menu"]');
      expect(p).not.toBeNull();
      return p!;
    }, W);
    await tippe(pille);
    await tippe(await screen.findByRole('menuitem', { name: 'am lesen' }, W));
    await warte(100);
    await menue('Start');
    const k = await karteDa('Onyx Storm');
    expect(fortschritte()).toHaveLength(2);
    expect(karte('Fourth Wing').compareDocumentPosition(k) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });
});
