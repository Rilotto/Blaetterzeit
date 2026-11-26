/**
 * Akzeptanztests REQ-115 – Automatischer Zuschnitt von Cover, Rücken und Schnitt auf das Seitenverhältnis des Buches.
 * Abgeleitet aus dem REQ-Text. Schnittstellen laut Entwickler (Sprint 12):
 *  - @/bild/mittigerAusschnitt: mittigerAusschnitt(breite, hoehe, verhaeltnis) → {x,y,breite,hoehe}, ausschnittNoetig, verhaeltnisGleich
 *  - @/buchdetails/automatischerZuschnitt: onlineCoverZuschneiden, geaenderteBereiche, bilderNeuZuschneiden
 *  - Canvas fehlt in jsdom: mittigZuschneiden wird partiell gemockt und markiert das Bild mit „|<verhältnis>“.
 *    So ist im Bildspeicher ablesbar, auf welche Verhältnisse (in welcher Reihenfolge) zugeschnitten wurde.
 */
import '@testing-library/jest-dom/vitest';
import { act, cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { mittigZuschneiden } from '@/bild/bildverarbeitung';
import { ausschnittNoetig, mittigerAusschnitt, verhaeltnisGleich } from '@/bild/mittigerAusschnitt';
import { bilderNeuZuschneiden, geaenderteBereiche, onlineCoverZuschneiden } from '@/buchdetails/automatischerZuschnitt';
import type { Treffer } from '@/barcode/treffer';
import type { Buch } from '@/domain/buch';
import type { BookRepository, ImageStore } from '@/storage';
import { InMemoryBookRepository } from '@/storage/InMemoryBookRepository';
import BuchDetails from '@/views/BuchDetails';
import BuecherAnsicht from '@/views/BuecherAnsicht';

vi.mock('@/buecher/demodaten', () => ({ demoBuecher: [] }));
vi.mock('@/bild/bildverarbeitung', async (o) => ({
  ...(await o<typeof import('@/bild/bildverarbeitung')>()),
  mittigZuschneiden: vi.fn(async (bild: string, v: number) => `${bild}|${v}`),
}));

afterEach(() => {
  cleanup();
  vi.mocked(mittigZuschneiden).mockClear();
});

const W = { timeout: 4000 };
const PNG = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAIAAACQd1PeAAAADElEQVR4nGP4z8AAAAMBAQDJ/pLvAAAAAElFTkSuQmCC';
const TB = 138 / 218;
const HC = 148 / 210;
const KF = 105 / 148;
const ISBN = '9783551551672';

/** Verhältnisse, auf die ein Bild nacheinander zugeschnitten wurde (Markierungen des Mocks). */
const schnitte = (bild: string | undefined) => (bild ?? '').split('|').slice(1).map(Number);
const nah = (a: number, b: number) => Math.abs(a - b) < 1e-6;

function speicherFake(start: Record<string, string> = {}) {
  const daten = new Map(Object.entries(start));
  const s = {
    daten,
    get: vi.fn(async (id: string, b: string) => daten.get(`${id}|${b}`)),
    put: vi.fn(async (id: string, b: string, d: string) => void daten.set(`${id}|${b}`, d)),
    remove: vi.fn(async (id: string, b: string) => void daten.delete(`${id}|${b}`)),
  };
  return s as typeof s & ImageStore;
}
async function tippe(el: Element) {
  await act(async () => {
    fireEvent.click(el);
    await new Promise((r) => setTimeout(r, 15));
  });
}
async function warte(ms = 60) {
  await act(async () => {
    await new Promise((r) => setTimeout(r, ms));
  });
}

// ---------------------------------------------------------------------------
// Reine Funktionen (Kernlogik mittiger Ausschnitt)
// ---------------------------------------------------------------------------
describe('REQ-115 mittiger Ausschnitt', () => {
  it('[REQ-115/AK-1] 600 × 600 auf 13,8 : 21,8 → volle Höhe, mittig, links und rechts gleich viel entfernt', () => {
    const a = mittigerAusschnitt(600, 600, TB);
    expect(a.y).toBe(0);
    expect(a.hoehe).toBe(600);
    expect(a.breite / a.hoehe).toBeCloseTo(TB, 2);
    expect(a.breite).toBe(380);
    expect(a.x).toBe(110);
    expect(600 - (a.x + a.breite)).toBe(a.x);
  });

  it.each([
    [1000, 400, HC],
    [400, 1000, HC],
    [300, 2000, TB],
    [2000, 300, KF],
    [601, 600, TB],
  ])('[REQ-115/AK-1] %i × %i: größtmöglicher mittiger Ausschnitt im Zielverhältnis, innerhalb des Bildes', (b, h, v) => {
    const a = mittigerAusschnitt(b, h, v);
    // eine Seite bleibt voll erhalten (größtmöglich), nichts außerhalb des Bildes (keine Ränder)
    expect(a.breite === b || a.hoehe === h).toBe(true);
    expect(a.x).toBeGreaterThanOrEqual(0);
    expect(a.y).toBeGreaterThanOrEqual(0);
    expect(a.x + a.breite).toBeLessThanOrEqual(b);
    expect(a.y + a.hoehe).toBeLessThanOrEqual(h);
    // unverzerrt: Ausschnitt hat (bis auf Pixelrundung) das Zielverhältnis
    expect(Math.abs(a.breite - a.hoehe * v)).toBeLessThanOrEqual(1);
    // mittig: Rest links/rechts bzw. oben/unten höchstens 1 Pixel verschieden
    expect(Math.abs(a.x - (b - a.x - a.breite))).toBeLessThanOrEqual(1);
    expect(Math.abs(a.y - (h - a.y - a.hoehe))).toBeLessThanOrEqual(1);
  });

  it.each([
    [138, 218, TB],
    [1380, 2180, TB],
    [148, 210, HC],
    [420, 592, KF],
  ])('[REQ-115/AK-2] %i × %i passt bereits → voller Rahmen, kein Zuschnitt nötig', (b, h, v) => {
    const a = mittigerAusschnitt(b, h, v);
    expect(a).toEqual({ x: 0, y: 0, breite: b, hoehe: h });
    expect(ausschnittNoetig(a, b, h)).toBe(false);
  });

  it('[REQ-115/AK-2] nicht passendes Bild → Zuschnitt nötig', () => {
    expect(ausschnittNoetig(mittigerAusschnitt(600, 600, TB), 600, 600)).toBe(true);
    expect(verhaeltnisGleich(TB, 138 / 218)).toBe(true);
    expect(verhaeltnisGleich(TB, HC)).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Fachfunktionen (Online-Cover, geänderte Bereiche, Neuzuschnitt im Speicher)
// ---------------------------------------------------------------------------
describe('REQ-115 Fachfunktionen', () => {
  it('[REQ-115/AK-1] onlineCoverZuschneiden: Treffer ohne Maße, Taschenbuch → 13,8 : 21,8', async () => {
    const neu = await onlineCoverZuschneiden(PNG, { format: 'print', unterformat: 'taschenbuch' });
    expect(schnitte(neu)).toHaveLength(1);
    expect(schnitte(neu)[0]).toBeCloseTo(TB, 6);
  });

  it('[REQ-115/AK-1] onlineCoverZuschneiden: Maße des Treffers haben Vorrang vor dem Format', async () => {
    const neu = await onlineCoverZuschneiden(PNG, { format: 'print', unterformat: 'hardcover', breiteMm: 120, hoeheMm: 180 });
    expect(schnitte(neu)[0]).toBeCloseTo(120 / 180, 6);
  });

  it.each([
    ['Format Taschenbuch → Kleinformat', { format: 'print', unterformat: 'taschenbuch' }, { format: 'print', unterformat: 'kleinformat' }, ['ruecken', 'cover', 'schnitt']],
    ['Dicke 2 → 4', { breiteMm: 120, hoeheMm: 180, dickeMm: 20 }, { breiteMm: 120, hoeheMm: 180, dickeMm: 40 }, ['ruecken', 'schnitt']],
    ['Seitenzahl ohne Dicke 200 → 600', { format: 'print', unterformat: 'taschenbuch', seitenanzahl: 200 }, { format: 'print', unterformat: 'taschenbuch', seitenanzahl: 600 }, ['ruecken', 'schnitt']],
    ['Seitenzahl mit hinterlegter Dicke', { dickeMm: 30, seitenanzahl: 200 }, { dickeMm: 30, seitenanzahl: 600 }, []],
    ['Taschenbuch → E-Book (gleiche Standardmaße)', { format: 'print', unterformat: 'taschenbuch' }, { format: 'ebook' }, []],
  ] as [string, Partial<Buch>, Partial<Buch>, string[]][])('[REQ-115/AK-5] geaenderteBereiche: %s', (_n, alt, neu, erwartet) => {
    expect([...geaenderteBereiche(alt, neu)].sort()).toEqual([...erwartet].sort());
  });

  it('[REQ-115/AK-5] bilderNeuZuschneiden: nur geänderte Bereiche, Ergebnis ersetzt das gespeicherte Bild', async () => {
    const id = 'b1';
    const s = speicherFake({ [`${id}|cover`]: 'C', [`${id}|ruecken`]: 'R', [`${id}|schnitt`]: 'S' });
    await bilderNeuZuschneiden(s, id, { breiteMm: 120, hoeheMm: 180, dickeMm: 20 }, { breiteMm: 120, hoeheMm: 180, dickeMm: 40 });
    expect(s.daten.get(`${id}|cover`)).toBe('C');
    expect(s.daten.get(`${id}|ruecken`)).toBe(`R|${40 / 180}`);
    expect(s.daten.get(`${id}|schnitt`)).toBe(`S|${40 / 180}`);
  });

  it('[REQ-115/AK-4] bilderNeuZuschneiden: Bereich ohne Bild bleibt leer, kein Fehler', async () => {
    const s = speicherFake();
    await bilderNeuZuschneiden(s, 'x', { format: 'print', unterformat: 'taschenbuch' }, { format: 'print', unterformat: 'kleinformat' });
    expect(s.put).not.toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------------------
// Barcode-Übernahme → Manueller Eintrag (AK-1, AK-2, AK-7)
// ---------------------------------------------------------------------------
function repoFake() {
  const daten = new Map<string, Buch>();
  const r = {
    daten,
    list: vi.fn(async () => [...daten.values()].map((b) => ({ ...b }))),
    get: vi.fn(async (id: string) => (daten.has(id) ? { ...daten.get(id)! } : undefined)),
    save: vi.fn(async (b: Buch) => void daten.set(b.id, { ...b })),
    remove: vi.fn(async (id: string) => void daten.delete(id)),
  };
  return r as typeof r & BookRepository;
}
type Optionen = { video: HTMLVideoElement | null; beiIsbn: (isbn: string) => void };
const blatt = () => screen.queryByRole('dialog', { name: 'Manueller Eintrag' });
const fenster = () => document.querySelector<HTMLElement>('[data-fenster-format]');

async function uebernimm(angaben: Treffer['angaben']) {
  const repo = repoFake();
  const bilder = speicherFake();
  const scanner = {
    optionen: null as Optionen | null,
    starten: vi.fn(async (o: Optionen) => void (scanner.optionen = o)),
    lichtSetzen: vi.fn(async () => {}),
    beenden: vi.fn(async () => {}),
  };
  const treffer: Treffer = { quelle: 'dnb', angaben: { titel: 'Online-Buch', autor: 'Autorin', seitenanzahl: 300, isbn: ISBN, cover: PNG, ...angaben } };
  render(<BuecherAnsicht repository={repo} bildspeicher={bilder} barcodeScanner={scanner} isbnSuche={{ suchen: async () => [treffer] }} />);
  await screen.findByRole('heading', { name: 'Deine Bücher' }, W);
  await tippe(screen.getByRole('button', { name: 'Buch hinzufügen' }));
  const m = await screen.findByRole('menu', { name: 'Buch hinzufügen' }, W);
  await tippe(m.querySelector('[data-option="barcode"]')!);
  await vi.waitFor(() => expect(scanner.optionen).not.toBeNull(), W);
  await act(async () => {
    scanner.optionen!.beiIsbn(ISBN);
    await new Promise((r) => setTimeout(r, 30));
  });
  await tippe((await screen.findByRole('dialog', { name: 'Gefundene Bücher' }, W)).querySelector('[data-treffer]')!);
  await vi.waitFor(() => expect(blatt()).not.toBeNull(), W);
  await warte();
  return { repo, bilder };
}
async function hinzufuegen(repo: ReturnType<typeof repoFake>, bilder: ReturnType<typeof speicherFake>) {
  await tippe(within(blatt()!).getByRole('button', { name: 'Hinzufügen' }));
  await vi.waitFor(() => expect(repo.daten.size).toBe(1), W);
  await vi.waitFor(() => expect(bilder.put).toHaveBeenCalled(), W);
  const id = [...repo.daten.keys()][0];
  return bilder.daten.get(`${id}|cover`);
}

describe('REQ-115 Online-Cover beim Übernehmen (Barcode)', () => {
  it('[REQ-115/AK-1] Treffer ohne Maße, Taschenbuch: gespeichertes Cover einmal auf 13,8 : 21,8 zugeschnitten', async () => {
    const { repo, bilder } = await uebernimm({ format: 'print', unterformat: 'taschenbuch' });
    const cover = await hinzufuegen(repo, bilder);
    expect(cover!.startsWith(PNG)).toBe(true);
    expect(schnitte(cover)).toHaveLength(1);
    expect(schnitte(cover)[0]).toBeCloseTo(TB, 6);
  });

  it('[REQ-115/AK-1] Treffer mit Maßen: Cover auf Breite : Höhe des Treffers zugeschnitten', async () => {
    const { repo, bilder } = await uebernimm({ format: 'print', unterformat: 'taschenbuch', breiteMm: 120, hoeheMm: 190 });
    const cover = await hinzufuegen(repo, bilder);
    expect(schnitte(cover)).toHaveLength(1);
    expect(schnitte(cover)[0]).toBeCloseTo(120 / 190, 6);
  });

  it('[REQ-115/AK-1] Treffer ohne Format: Taschenbuch-Standard 13,8 : 21,8', async () => {
    const { repo, bilder } = await uebernimm({});
    const cover = await hinzufuegen(repo, bilder);
    expect(schnitte(cover).map((v) => nah(v, TB))).toEqual([true]);
  });

  it('[REQ-115/AK-2] bereits zugeschnittenes Cover wird beim Hinzufügen nicht erneut zugeschnitten', async () => {
    const { repo, bilder } = await uebernimm({ format: 'print', unterformat: 'hardcover' });
    const cover = await hinzufuegen(repo, bilder);
    expect(schnitte(cover)).toHaveLength(1);
    expect(schnitte(cover)[0]).toBeCloseTo(HC, 6);
  });

  it('[REQ-115/AK-7] im Manuellen Eintrag Format auf Hardcover ändern, „Hinzufügen“ → Cover 14,8 : 21,0', async () => {
    const { repo, bilder } = await uebernimm({ format: 'print', unterformat: 'taschenbuch' });
    await tippe(blatt()!.querySelector('[data-ausgabe-zeile="format"]')!);
    await vi.waitFor(() => expect(fenster()).not.toBeNull(), W);
    await tippe(fenster()!.querySelector('[data-unterformat="hardcover"]')!);
    await tippe(fenster()!.querySelector('[data-format-sichern]')!);
    await vi.waitFor(() => expect(fenster()).toBeNull(), W);
    await warte();
    const cover = await hinzufuegen(repo, bilder);
    const s = schnitte(cover);
    expect(s.length).toBeGreaterThanOrEqual(1);
    expect(s[s.length - 1]).toBeCloseTo(HC, 6);
  });
});

// ---------------------------------------------------------------------------
// Buchdetails (AK-3 bis AK-6)
// ---------------------------------------------------------------------------
async function details(m: Partial<Buch>, bilder: Record<string, string>) {
  const repo = new InMemoryBookRepository();
  const id = crypto.randomUUID();
  await repo.save({ id, titel: 'Zuschnittbuch', status: 'ungelesen', ...m });
  const s = speicherFake(Object.fromEntries(Object.entries(bilder).map(([b, d]) => [`${id}|${b}`, d])));
  render(<BuchDetails buchId={id} repository={repo} bildspeicher={s} bildquelle={{ scannen: async () => null, galerie: async () => null }} onZurueck={() => {}} />);
  const d = await screen.findByRole('region', { name: 'Buchdetails' }, W);
  const tab = await vi.waitFor(() => {
    const t = d.querySelector<HTMLElement>('[data-reiter="details"]');
    expect(t).not.toBeNull();
    return t!;
  }, W);
  await tippe(tab);
  await vi.waitFor(() => expect(d.querySelector('[data-ausgabe-zeile="format"]')).not.toBeNull(), W);
  return { d, s, id, repo };
}
async function formatAendern(d: HTMLElement, unterformat: string) {
  await tippe(d.querySelector('[data-ausgabe-zeile="format"]')!);
  await vi.waitFor(() => expect(fenster()).not.toBeNull(), W);
  await tippe(fenster()!.querySelector(`[data-unterformat="${unterformat}"]`)!);
  await tippe(fenster()!.querySelector('[data-format-sichern]')!);
  await vi.waitFor(() => expect(fenster()).toBeNull(), W);
  await warte(120);
}
const coverEl = () => document.querySelector<HTMLElement>('[data-bereich="cover"]')!;

describe('REQ-115 Buchdetails', () => {
  it('[REQ-115/AK-3] übernommenes Cover (13,8 : 21,8) füllt die Cover-Form mit gleichem Verhältnis: nichts wird beim Einpassen abgeschnitten', async () => {
    const zugeschnitten = await onlineCoverZuschneiden(PNG, { format: 'print', unterformat: 'taschenbuch' });
    await details({ format: 'print', unterformat: 'taschenbuch' }, { cover: zugeschnitten });
    await vi.waitFor(() => expect(coverEl().querySelector('img[data-bereich-bild]')).not.toBeNull(), W);
    const form = parseFloat(coverEl().style.width) / parseFloat(coverEl().style.height);
    expect(form).toBeCloseTo(schnitte(zugeschnitten)[0], 2);
    const img = coverEl().querySelector<HTMLElement>('img[data-bereich-bild]')!;
    expect(img).toHaveAttribute('src', zugeschnitten);
    const cs = getComputedStyle(img);
    expect(cs.width).toBe('100%');
    expect(cs.height).toBe('100%');
  });

  it('[REQ-115/AK-4] Format Taschenbuch → Kleinformat gesichert: gespeichertes Cover mittig auf 10,5 : 14,8 zugeschnitten', async () => {
    const { d, s, id } = await details({ format: 'print', unterformat: 'taschenbuch' }, { cover: `${PNG}|${TB}` });
    await formatAendern(d, 'kleinformat');
    await vi.waitFor(() => expect(schnitte(s.daten.get(`${id}|cover`))).toHaveLength(2), W);
    expect(schnitte(s.daten.get(`${id}|cover`))[1]).toBeCloseTo(KF, 6);
    // Anzeige zeigt das neu zugeschnittene Bild
    await vi.waitFor(() => expect(coverEl().querySelector('img[data-bereich-bild]')).toHaveAttribute('src', s.daten.get(`${id}|cover`)), W);
  });

  it('[REQ-115/AK-4] auch Rücken und Schnitt (vom Nutzer aufgenommen) werden beim Formatwechsel neu zugeschnitten', async () => {
    const { d, s, id } = await details({ format: 'print', unterformat: 'taschenbuch', seitenanzahl: 400 }, { cover: 'C', ruecken: 'R', schnitt: 'S' });
    await formatAendern(d, 'hardcover');
    await vi.waitFor(() => expect(s.daten.get(`${id}|cover`)).toBe(`C|${HC}`), W);
    // Hardcover 400 S.: Dicke 28 mm; Rücken = Dicke : Höhe (210)
    await vi.waitFor(() => expect(schnitte(s.daten.get(`${id}|ruecken`))).toHaveLength(1), W);
    expect(schnitte(s.daten.get(`${id}|ruecken`))[0]).toBeCloseTo(28 / 210, 2);
    expect(schnitte(s.daten.get(`${id}|schnitt`))).toHaveLength(1);
  });

  it('[REQ-115/AK-4] Format ohne Änderung des Verhältnisses (Taschenbuch → Weiß ich nicht) schneidet nichts zu', async () => {
    const { d, s, id } = await details({ format: 'print', unterformat: 'taschenbuch' }, { cover: 'C', ruecken: 'R', schnitt: 'S' });
    await formatAendern(d, 'weissNicht');
    await warte(150);
    expect(s.daten.get(`${id}|cover`)).toBe('C');
    expect(s.daten.get(`${id}|ruecken`)).toBe('R');
    expect(s.put).not.toHaveBeenCalled();
  });

  it('[REQ-115/AK-5] Maße 12 × 18 × 2, Dicke auf 4 gesichert: Rücken und Schnitt auf 4 : 18, Cover unverändert', async () => {
    const { d, s, id, repo } = await details({ breiteMm: 120, hoeheMm: 180, dickeMm: 20 }, { cover: 'C', ruecken: 'R', schnitt: 'S' });
    await tippe(d.querySelector('[data-ausgabe-zeile="masse"]')!);
    const b = await vi.waitFor(() => {
      const x = document.querySelector<HTMLElement>('[role="dialog"][aria-label="Maße"]');
      expect(x).not.toBeNull();
      return x!;
    }, W);
    await act(async () => {
      fireEvent.change(b.querySelector('[data-mass-feld="dicke"]')!, { target: { value: '4' } });
    });
    await tippe(b.querySelector('[data-masse-sichern]')!);
    await warte(150);
    await vi.waitFor(async () => expect((await repo.get(id))?.dickeMm).toBe(40), W);
    await vi.waitFor(() => expect(s.daten.get(`${id}|ruecken`)).toBe(`R|${40 / 180}`), W);
    expect(s.daten.get(`${id}|schnitt`)).toBe(`S|${40 / 180}`);
    expect(s.daten.get(`${id}|cover`)).toBe('C');
    expect(s.put).not.toHaveBeenCalledWith(id, 'cover', expect.anything());
  });

  it('[REQ-115/AK-6] Kleinformat zurück auf Taschenbuch: bereits beschnittenes Cover wird erneut auf 13,8 : 21,8 zugeschnitten', async () => {
    const { d, s, id } = await details({ format: 'print', unterformat: 'taschenbuch' }, { cover: `${PNG}|${TB}` });
    await formatAendern(d, 'kleinformat');
    await vi.waitFor(() => expect(schnitte(s.daten.get(`${id}|cover`))).toHaveLength(2), W);
    await formatAendern(d, 'taschenbuch');
    await vi.waitFor(() => expect(schnitte(s.daten.get(`${id}|cover`))).toHaveLength(3), W);
    const kette = schnitte(s.daten.get(`${id}|cover`));
    // Zuschnitt auf das Kleinformat-Ergebnis, nicht auf das Original
    expect(kette.map((v, i) => nah(v, [TB, KF, TB][i]))).toEqual([true, true, true]);
    const letzterAufruf = vi.mocked(mittigZuschneiden).mock.calls.at(-1)!;
    expect(letzterAufruf[0]).toBe(`${PNG}|${TB}|${KF}`);
  });
});
