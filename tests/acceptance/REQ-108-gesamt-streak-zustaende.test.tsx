/**
 * Akzeptanztests REQ-108 – Gesamt-Streak: Flamme angezündet, ausgegraut oder erloschen (Startseite und Statistik).
 * Abgeleitet aus dem REQ-Text (Sprint 10, Teil D). Schwarzkasten über die App:
 *  - Flamme wie REQ-027: [data-flamme] mit [data-streak-zahl]; Startseite genau eine Flamme, Statistik unter [data-seite="statistik"].
 *  - Zustand wird an der Darstellung erkannt, nicht an einem Kennzeichen:
 *      angezündet = Füllung über Verlauf (url(#…)) mit Stopps „Flamme Rot“/„Flamme Orange“,
 *      ausgegraut = gefüllt ohne Verlauf in var(--bz-farbe-ghostframe), Zahl in „Dunkelbraun“,
 *      erloschen  = keine Füllung, Umriss in „GhostFrame“, Zahl 0.
 *  - Uhr: Fake-Timer (vi.setSystemTime). Sitzungen über die Repository-Schnittstelle vorbelegt.
 */
import '@testing-library/jest-dom/vitest';
import { act, cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { IDBFactory, IDBKeyRange } from 'fake-indexeddb';
import type { ComponentType } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { Buch } from '@/domain/buch';
import { farbdesigns } from '@/theme';

vi.mock('@/buecher/demodaten', () => ({ demoBuecher: [] }));
beforeEach(() => {
  vi.stubGlobal('indexedDB', new IDBFactory());
  vi.stubGlobal('IDBKeyRange', IDBKeyRange);
  localStorage.clear();
  vi.useFakeTimers({ toFake: ['Date'] });
});
afterEach(() => {
  cleanup();
  vi.useRealTimers();
  vi.unstubAllGlobals();
  localStorage.clear();
});

type Komp = ComponentType<Record<string, unknown>>;
const W = { timeout: 4000 };
const um = (j: number, m: number, t: number, h = 12, mi = 0) => new Date(j, m - 1, t, h, mi);
const HEUTE = um(2026, 11, 25, 15);
const tag = (versatz: number, h = 12, mi = 0) => um(2026, 11, 25 + versatz, h, mi);
const sitzung = (d: Date, seite = 10) => ({ zeitpunkt: d.toISOString(), seite });
const norm = (t: string | null | undefined) => (t ?? '').replace(/[\s  ]+/g, ' ').trim();
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
  await warte(80);
}
let nr = 0;
const buch = (titel: string, f: Partial<Buch> = {}): Buch => ({ id: `b108-${++nr}`, titel, status: 'am_lesen', seitenanzahl: 400, aktuelleSeite: 100, ...f });
async function starte(buecher: Buch[], heute = HEUTE, design?: string) {
  vi.setSystemTime(heute);
  vi.resetModules();
  const st = (await import('@/storage')) as typeof import('@/storage');
  const repo = st.createBookRepository();
  for (const b of buecher) await repo.save(b);
  if (design) await st.createEinstellungRepository().speichern('farbdesign', design);
  const App = (await import('@/App')).default as unknown as Komp;
  render(<App />);
  await screen.findByRole('navigation', { name: 'Hauptnavigation' }, W);
  await vi.waitFor(() => expect(main().querySelectorAll('[data-flamme]')).toHaveLength(1), W);
  await warte(80);
  return repo;
}

type Zustand = 'angezuendet' | 'ausgegraut' | 'erloschen';
function fuellung(f: HTMLElement): string {
  const p = f.querySelector<SVGPathElement>('path');
  expect(p, 'Flammen-Icon (path)').not.toBeNull();
  return (p!.style.fill || p!.getAttribute('fill') || '').trim();
}
function zustand(f: HTMLElement): Zustand {
  const fill = fuellung(f);
  if (/url\(/.test(fill)) return 'angezuendet';
  if (fill === '' || fill === 'none' || fill === 'transparent') return 'erloschen';
  return 'ausgegraut';
}
function flammeVon(bereich: ParentNode): { el: HTMLElement; zahl: string; zustand: Zustand } {
  const f = Array.from(bereich.querySelectorAll<HTMLElement>('[data-flamme]'));
  expect(f, 'genau eine Flamme').toHaveLength(1);
  return { el: f[0], zahl: norm(f[0].querySelector('[data-streak-zahl]')?.textContent), zustand: zustand(f[0]) };
}
const startFlamme = () => flammeVon(main());
async function statistik() {
  await menue('Statistik');
  const seite = await vi.waitFor(() => {
    const s = main().querySelector<HTMLElement>('[data-seite="statistik"]');
    expect(s?.querySelector('[data-serie-text]')).toBeTruthy();
    return s!;
  }, W);
  return { serie: norm(seite.querySelector('[data-serie-text]')!.textContent), ...flammeVon(seite) };
}
function pruefeAusgegraut(f: { el: HTMLElement }) {
  expect(fuellung(f.el)).toBe('var(--bz-farbe-ghostframe)');
  expect(f.el.querySelector('[data-verlauf]'), 'kein Rot-Orange-Verlauf').toBeNull();
  const z = f.el.querySelector<HTMLElement>('[data-streak-zahl]')!;
  expect(z.style.color).toContain('--bz-farbe-dunkelbraun');
  expect(z).toBeVisible();
}
function pruefeAngezuendet(f: { el: HTMLElement }) {
  const stopps = Array.from(f.el.querySelectorAll<HTMLElement>('[data-verlauf]')).map((s) => s.getAttribute('style') ?? '');
  expect(stopps.length, 'Verlauf mit zwei Stopps').toBe(2);
  expect(stopps.join(' ')).toMatch(/flamme|--bz-farbe-/i);
}

describe('REQ-108 Ausgegraut', () => {
  it('[REQ-108/AK-1] Sitzung nur gestern: Startseite Flamme 1 ausgegraut; Statistik „Serie 1 Tage“, Flamme 1 ausgegraut', async () => {
    await starte([buch('A', { sitzungen: [sitzung(tag(-1, 20))] })]);
    const s = startFlamme();
    expect(s.zahl).toBe('1');
    expect(s.zustand).toBe('ausgegraut');
    pruefeAusgegraut(s);
    const st = await statistik();
    expect(st.serie).toBe('Serie 1 Tage');
    expect(st.zahl).toBe('1');
    expect(st.zustand).toBe('ausgegraut');
    pruefeAusgegraut(st);
  });

  it('[REQ-108/AK-1] längere Serie bis gestern (4 Tage, verschiedene Bücher): 4, ausgegraut, Zahl bleibt sichtbar', async () => {
    await starte([buch('A', { sitzungen: [sitzung(tag(-4)), sitzung(tag(-3))] }), buch('B', { sitzungen: [sitzung(tag(-2)), sitzung(tag(-1, 23, 59))] })]);
    expect(startFlamme()).toMatchObject({ zahl: '4', zustand: 'ausgegraut' });
    const st = await statistik();
    expect(st).toMatchObject({ serie: 'Serie 4 Tage', zahl: '4', zustand: 'ausgegraut' });
  });

  it('[REQ-108/AK-1] Grenze 00:00:30: Sitzung gestern 23:59 → ausgegraut (heute zählt erst ab Sitzung)', async () => {
    await starte([buch('A', { sitzungen: [sitzung(tag(-1, 23, 59))] })], tag(0, 0, 0));
    expect(startFlamme()).toMatchObject({ zahl: '1', zustand: 'ausgegraut' });
  });
});

describe('REQ-108 Angezündet', () => {
  it('[REQ-108/AK-2] Sitzungen gestern und heute: Startseite und Statistik Flamme 2 mit Rot-Orange-Verlauf', async () => {
    await starte([buch('A', { sitzungen: [sitzung(tag(-1)), sitzung(tag(0, 8))] })]);
    const s = startFlamme();
    expect(s).toMatchObject({ zahl: '2', zustand: 'angezuendet' });
    pruefeAngezuendet(s);
    const st = await statistik();
    expect(st).toMatchObject({ serie: 'Serie 2 Tage', zahl: '2', zustand: 'angezuendet' });
    pruefeAngezuendet(st);
  });

  it('[REQ-108/AK-2] nur heute gelesen (00:01): 1, angezündet', async () => {
    await starte([buch('A', { sitzungen: [sitzung(tag(0, 0, 1))] })], tag(0, 0, 5));
    expect(startFlamme()).toMatchObject({ zahl: '1', zustand: 'angezuendet' });
  });
});

describe('REQ-108 Anzünden durch Lesen', () => {
  async function fortschrittSichern(wert: string) {
    const balken = within(main()).getByRole('progressbar', { name: 'Lesefortschritt' });
    await tippe(balken);
    const d = await screen.findByRole('dialog', { name: 'Aktuelle Seite' }, W);
    await eingeben(within(d).getByLabelText('Aktuelle Seite'), wert);
    await tippe(within(d).getByRole('button', { name: 'Sichern' }));
    await warte(120);
  }

  it('[REQ-108/AK-3] Zustand AK-1, heute Fortschritt erhöht und gesichert: Flamme 2, angezündet (Startseite und Statistik)', async () => {
    await starte([buch('A', { sitzungen: [sitzung(tag(-1, 20), 100)] })]);
    expect(startFlamme()).toMatchObject({ zahl: '1', zustand: 'ausgegraut' });
    await fortschrittSichern('120');
    await vi.waitFor(() => expect(startFlamme()).toMatchObject({ zahl: '2', zustand: 'angezuendet' }), W);
    const st = await statistik();
    expect(st).toMatchObject({ serie: 'Serie 2 Tage', zahl: '2', zustand: 'angezuendet' });
  });

  it.each([
    ['gleicher Wert', '100'],
    ['niedrigerer Wert', '80'],
  ])('[REQ-108/AK-4] Zustand AK-1, heute nur ohne Erhöhung gesichert (%s): bleibt 1, ausgegraut', async (_f, wert) => {
    await starte([buch('A', { sitzungen: [sitzung(tag(-1, 20), 100)] })]);
    await fortschrittSichern(wert);
    await warte(80);
    expect(startFlamme()).toMatchObject({ zahl: '1', zustand: 'ausgegraut' });
    const st = await statistik();
    expect(st).toMatchObject({ serie: 'Serie 1 Tage', zahl: '1', zustand: 'ausgegraut' });
  });
});

describe('REQ-108 Erloschen', () => {
  it('[REQ-108/AK-5] letzte Sitzung vorgestern: Startseite und Statistik 0 als Umriss', async () => {
    await starte([buch('A', { sitzungen: [sitzung(tag(-3)), sitzung(tag(-2, 23, 59))] })]);
    const s = startFlamme();
    expect(s).toMatchObject({ zahl: '0', zustand: 'erloschen' });
    const p = s.el.querySelector<SVGPathElement>('path')!;
    expect(p.style.stroke).toBe('var(--bz-farbe-ghostframe)');
    const st = await statistik();
    expect(st).toMatchObject({ serie: 'Serie 0 Tage', zahl: '0', zustand: 'erloschen' });
  });

  it('[REQ-108/AK-5] ohne jede Sitzung: 0, erloschen', async () => {
    await starte([]);
    expect(startFlamme()).toMatchObject({ zahl: '0', zustand: 'erloschen' });
  });
});

describe('REQ-108 Farbrolle zentral', () => {
  it.each(['klassisch', 'salbei', 'polarnacht'])('[REQ-108/AK-6] Design „%s“: ausgegraute Flamme im GhostFrame-Wert dieses Designs gefüllt', async (id) => {
    await starte([buch('A', { sitzungen: [sitzung(tag(-1))] })], HEUTE, id);
    const wurzel = document.querySelector<HTMLElement>('[data-app-wurzel]')!;
    await vi.waitFor(() => expect(wurzel).toHaveAttribute('data-farbdesign', id), W);
    const s = startFlamme();
    expect(s.zustand).toBe('ausgegraut');
    expect(fuellung(s.el)).toBe('var(--bz-farbe-ghostframe)');
    const wert = farbdesigns[id as keyof typeof farbdesigns].werte.ghostframe;
    expect(wurzel.style.getPropertyValue('--bz-farbe-ghostframe').toLowerCase()).toBe(wert.toLowerCase());
  });
});
