/**
 * Akzeptanztests REQ-103 – Startseite: „Diese Woche“ mit Covern je Tag und Lesesträhne.
 * Abgeleitet aus dem REQ-Text (Sprint 10, Teil C). Schwarzkasten über die App.
 * Der REQ verlangt den Aufbau „wie die Wochen-Kalenderkarte der Statistik (REQ-088)“ und die Flamme „wie REQ-027“;
 * deshalb werden deren öffentliche Kennzeichen genutzt: [data-kalender-tag][data-tag][data-heute][data-buch-id],
 * [data-flamme=aktiv|inaktiv], [data-streak-zahl]; Statistik: [data-zeitraum-pille][aria-pressed], [data-serie-text].
 * Bücher in „Diese Woche“ sind *gelesen*, damit ihre Cover nicht zugleich in „Gerade am Lesen“ stehen.
 */
import '@testing-library/jest-dom/vitest';
import { act, cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { IDBFactory, IDBKeyRange } from 'fake-indexeddb';
import type { ComponentType } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { Buch } from '@/domain/buch';

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
const sitzung = (d: Date, seite = 10) => ({ zeitpunkt: d.toISOString(), seite });
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
const nav = () => screen.getByRole('navigation', { name: 'Hauptnavigation' });
const main = () => screen.getByRole('main');
async function menue(name: string) {
  await tippe(within(nav()).getByRole('button', { name }));
  await warte(60);
}
let nr = 0;
const buch = (titel: string, f: Partial<Buch> = {}): Buch => ({ id: `b103-${++nr}`, titel, status: 'gelesen', seitenanzahl: 500, ...f });
async function starte(buecher: Buch[], heute: Date, vorher?: (st: typeof import('@/storage')) => Promise<void>) {
  vi.setSystemTime(heute);
  vi.resetModules();
  const st = (await import('@/storage')) as typeof import('@/storage');
  const repo = st.createBookRepository();
  for (const b of buecher) await repo.save(b);
  if (vorher) await vorher(st);
  const App = (await import('@/App')).default as unknown as Komp;
  render(<App />);
  await screen.findByRole('navigation', { name: 'Hauptnavigation' }, W);
  await vi.waitFor(() => expect(textEls('Diese Woche', main()).length).toBeGreaterThan(0), W);
  await vi.waitFor(() => expect(tage()).toHaveLength(7), W);
  await warte(80);
  return st;
}
const tage = () => Array.from(main().querySelectorAll<HTMLElement>('[data-kalender-tag]'));
const tagzahlen = () => tage().map((t) => Number(t.getAttribute('data-tag')));
const flammen = () => Array.from(main().querySelectorAll<HTMLElement>('[data-flamme]'));
function straehne() {
  const f = flammen();
  expect(f, 'genau eine Flamme auf der Startseite').toHaveLength(1);
  return { zahl: norm(f[0].querySelector('[data-streak-zahl]')?.textContent), art: f[0].getAttribute('data-flamme') };
}

describe('REQ-103 Diese Woche', () => {
  it('[REQ-103/AK-1] Mi 25.11.2026: MO–SO mit 23–29, Montag Cover „Fourth Wing“, Mittwoch „Iron Flame“, der 25. umrandet', async () => {
    const fw = buch('Fourth Wing', { sitzungen: [sitzung(um(2026, 11, 23, 20))] });
    const ifl = buch('Iron Flame', { sitzungen: [sitzung(um(2026, 11, 25, 8))] });
    await starte([fw, ifl], um(2026, 11, 25, 15));
    expect(norm(main().textContent).replace(/\s/g, '')).toContain('MODIMIDOFRSASO');
    expect(tagzahlen()).toEqual([23, 24, 25, 26, 27, 28, 29]);
    const t = tage();
    expect(t[0].getAttribute('data-buch-id')).toBe(fw.id);
    expect(t[2].getAttribute('data-buch-id')).toBe(ifl.id);
    for (const i of [1, 3, 4, 5, 6]) expect(t[i].hasAttribute('data-buch-id'), `Tag ${i}`).toBe(false);
    expect(t.filter((x) => x.getAttribute('data-heute') === 'true').map((x) => x.getAttribute('data-tag'))).toEqual(['25']);
    // Tage ohne Lesen zeigen ihre Tageszahl
    expect(norm(t[1].textContent)).toBe('24');
    expect(norm(t[6].textContent)).toBe('29');
  });

  it('[REQ-103/AK-1] Sitzungen der Vorwoche und der Folgewoche erscheinen nicht', async () => {
    const b = buch('Alt', { sitzungen: [sitzung(um(2026, 11, 22, 23, 59)), sitzung(um(2026, 11, 30, 0, 1))] });
    await starte([b], um(2026, 11, 25, 15));
    expect(tage().filter((x) => x.hasAttribute('data-buch-id'))).toHaveLength(0);
  });

  it('[REQ-103/AK-1] Grenze Sonntag: So 29.11. gehört noch zur Woche 23–29 und ist heute', async () => {
    await starte([buch('X', { sitzungen: [sitzung(um(2026, 11, 29, 23, 30))] })], um(2026, 11, 29, 23, 59));
    expect(tagzahlen()).toEqual([23, 24, 25, 26, 27, 28, 29]);
    expect(tage()[6].getAttribute('data-heute')).toBe('true');
    expect(tage()[6].hasAttribute('data-buch-id')).toBe(true);
  });

  it('[REQ-103/AK-1] Grenze Montag 00:00 und Monatswechsel: Di 01.12.2026 zeigt 30, 1, 2, …, 6', async () => {
    await starte([], um(2026, 12, 1, 0, 0));
    expect(tagzahlen()).toEqual([30, 1, 2, 3, 4, 5, 6]);
    expect(tage()[1].getAttribute('data-heute')).toBe('true');
  });

  it('[REQ-103/AK-1] Jahreswechsel: Fr 01.01.2027 zeigt 28, 29, 30, 31, 1, 2, 3', async () => {
    await starte([], um(2027, 1, 1, 9));
    expect(tagzahlen()).toEqual([28, 29, 30, 31, 1, 2, 3]);
    expect(tage()[4].getAttribute('data-heute')).toBe('true');
  });
});

describe('REQ-103 Antippen öffnet die Statistik', () => {
  it('[REQ-103/AK-2] „Diese Woche“ antippen: Menüpunkt „Statistik“, „Wöchentlich“, laufende Woche; gespeicherte Pillenwahl wird „woche“', async () => {
    const st = await starte([buch('Fourth Wing', { sitzungen: [sitzung(um(2026, 11, 23, 20))] })], um(2026, 11, 25, 15), async (s) => {
      await s.createEinstellungRepository().speichern('statistikZeitraum', 'jahr');
    });
    await tippe(textEls('Diese Woche', main())[0]);
    await warte(100);
    expect(within(nav()).getByRole('button', { name: 'Statistik' })).toHaveAttribute('aria-current', 'page');
    await vi.waitFor(() => expect(main().querySelector('[data-zeitraum-pille="woche"]')).toHaveAttribute('aria-pressed', 'true'), W);
    await vi.waitFor(() => {
      const heute = main().querySelector('[data-kalender="woche"] [data-heute="true"]');
      expect(heute?.getAttribute('data-tag')).toBe('25');
    }, W);
    await vi.waitFor(async () => expect(await st.createEinstellungRepository().lesen('statistikZeitraum')).toBe('woche'), W);
  });

  it('[REQ-103/AK-2] Antippen eines Tages im Wochenkalender öffnet ebenfalls die Statistik', async () => {
    await starte([], um(2026, 11, 25, 15));
    await tippe(tage()[3]);
    await warte(100);
    expect(within(nav()).getByRole('button', { name: 'Statistik' })).toHaveAttribute('aria-current', 'page');
    await vi.waitFor(() => expect(main().querySelector('[data-zeitraum-pille="woche"]')).toHaveAttribute('aria-pressed', 'true'), W);
  });
});

describe('REQ-103 Lesesträhne', () => {
  it('[REQ-103/AK-3] Sitzungen vorgestern, gestern, heute an verschiedenen Büchern: Flamme 3 (gefüllt), Statistik „Serie 3 Tage“', async () => {
    await starte(
      [
        buch('A', { sitzungen: [sitzung(um(2026, 11, 23, 9))] }),
        buch('B', { sitzungen: [sitzung(um(2026, 11, 24, 22))] }),
        buch('C', { sitzungen: [sitzung(um(2026, 11, 25, 7))] }),
      ],
      um(2026, 11, 25, 15),
    );
    expect(straehne()).toEqual({ zahl: '3', art: 'aktiv' });
    await menue('Statistik');
    await vi.waitFor(() => expect(norm(main().querySelector('[data-serie-text]')?.textContent)).toBe('Serie 3 Tage'), W);
  });

  it('[REQ-103/AK-3] letzte Sitzung vorgestern: Flamme 0 als Umriss', async () => {
    await starte([buch('A', { sitzungen: [sitzung(um(2026, 11, 21)), sitzung(um(2026, 11, 22)), sitzung(um(2026, 11, 23, 23, 59))] })], um(2026, 11, 25, 15));
    expect(straehne()).toEqual({ zahl: '0', art: 'inaktiv' });
  });

  it('[REQ-103/AK-3] Strähne endet gestern (heute noch nicht gelesen): zählt bis gestern', async () => {
    await starte([buch('A', { sitzungen: [sitzung(um(2026, 11, 23)), sitzung(um(2026, 11, 24, 23, 59))] })], um(2026, 11, 25, 0, 1));
    expect(straehne()).toEqual({ zahl: '2', art: 'aktiv' });
  });

  it('[REQ-103/AK-3] mehrere Sitzungen am selben Tag zählen einmal; Lücke beendet die Strähne; ohne Sitzungen 0', async () => {
    await starte(
      [
        buch('A', { sitzungen: [sitzung(um(2026, 11, 20)), sitzung(um(2026, 11, 24, 8)), sitzung(um(2026, 11, 24, 20))] }),
        buch('B', { sitzungen: [sitzung(um(2026, 11, 25, 9)), sitzung(um(2026, 11, 25, 10))] }),
      ],
      um(2026, 11, 25, 15),
    );
    expect(straehne()).toEqual({ zahl: '2', art: 'aktiv' });
    cleanup();
    vi.stubGlobal('indexedDB', new IDBFactory());
    await starte([], um(2026, 11, 25, 15));
    expect(straehne()).toEqual({ zahl: '0', art: 'inaktiv' });
  });

  it('[REQ-103/AK-3] Strähne über Wochen- und Monatsgrenze (10 Tage) wie in der Statistik', async () => {
    const tageListe = Array.from({ length: 10 }, (_, i) => sitzung(um(2026, 12, 2 - i, 10), 100 - i));
    await starte([buch('Lang', { sitzungen: tageListe })], um(2026, 12, 2, 18));
    expect(straehne()).toEqual({ zahl: '10', art: 'aktiv' });
    await menue('Statistik');
    await vi.waitFor(() => expect(norm(main().querySelector('[data-serie-text]')?.textContent)).toBe('Serie 10 Tage'), W);
  });
});
