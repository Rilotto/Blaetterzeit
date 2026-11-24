/**
 * Akzeptanztests REQ-101 – Startseite: Aufbau, Kopf mit Datum, Uhrzeit, Gruß nach Tageszeit und Icon.
 * Abgeleitet aus dem REQ-Text (Sprint 10, Teil C). Schwarzkasten über die App (Rollen und Texte):
 *  - Uhr: Fake-Timer (vi.setSystemTime), lokale Gerätezeit.
 *  - Gruß: kleinstes Element mit genau dem Grußtext, z. B. „Guten Morgen, Christine“.
 *  - Tageszeit-Icon: role="img" mit Namen „Sonnenaufgang“, „Sonne“, „Sonnenuntergang“ bzw. „Mond“ (Erwartung an den Entwickler).
 *  - Name: über die Seite „Profil“, Zeile „Name“, Blatt mit Textfeld und „Sichern“ (REQ-107).
 *  - „Neustart“: Module neu laden, dieselbe IndexedDB (fake-indexeddb) und derselbe localStorage.
 */
import '@testing-library/jest-dom/vitest';
import { act, cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { IDBFactory, IDBKeyRange } from 'fake-indexeddb';
import type { ComponentType } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
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
const um = (j: number, m: number, t: number, h = 12, mi = 0, s = 0) => new Date(j, m - 1, t, h, mi, s);
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
async function starte(): Promise<Komp> {
  vi.resetModules();
  return (await import('@/App')).default as unknown as Komp;
}
async function zeige(App: Komp) {
  render(<App />);
  await screen.findByRole('navigation', { name: 'Hauptnavigation' }, W);
  await vi.waitFor(() => expect(textEls(GRUSS, main())).toHaveLength(1), W);
}
async function nameSetzen(name: string) {
  await menue('Profil');
  await tippe(await screen.findByRole('button', { name: /^Name/ }, W));
  const d = await screen.findByRole('dialog', {}, W);
  await eingeben(within(d).getByRole('textbox'), name);
  await tippe(within(d).getByRole('button', { name: 'Sichern' }));
  await warte(80);
  await menue('Start');
}

const GRUSS = /^(Guten Morgen|Hallo|Guten Abend|Gute Nacht)(,.*)?$/;
const ICONS = ['Sonnenaufgang', 'Sonne', 'Sonnenuntergang', 'Mond'] as const;
function gruss(): string {
  const k = textEls(GRUSS, main());
  expect(k).toHaveLength(1);
  return norm(k[0].textContent);
}
function iconEl(): HTMLElement {
  const treffer = ICONS.flatMap((name) => within(main()).queryAllByRole('img', { name }));
  expect(treffer, 'genau ein Tageszeit-Icon').toHaveLength(1);
  return treffer[0];
}
const icon = () => iconEl().getAttribute('aria-label') ?? norm(iconEl().textContent);
const ERWARTET = {
  morgen: ['Guten Morgen', 'Sonnenaufgang'],
  tag: ['Hallo', 'Sonne'],
  abend: ['Guten Abend', 'Sonnenuntergang'],
  nacht: ['Gute Nacht', 'Mond'],
} as const;
async function mitName(name = 'Christine') {
  vi.setSystemTime(um(2026, 11, 24, 12));
  const App = await starte();
  await zeige(App);
  await nameSetzen(name);
  return App;
}
async function anzeigeUm(App: Komp, d: Date) {
  cleanup();
  vi.setSystemTime(d);
  await zeige(App);
}

describe('REQ-101 Startseite: Aufbau', () => {
  it('[REQ-101/AK-1] beim Öffnen ist „Start“ aktiv und zeigt die Startseite mit Kopf, kein „under construction :)“', async () => {
    vi.setSystemTime(um(2026, 11, 24, 14, 5));
    await zeige(await starte());
    expect(within(nav()).getByRole('button', { name: 'Start' })).toHaveAttribute('aria-current', 'page');
    expect(main().textContent).not.toContain('under construction');
    expect(gruss()).toBe('Hallo');
    expect(main().textContent).toContain('14:05');
  });

  it('[REQ-101/AK-1] nach Wechsel zu „Bücher“ und zurück zu „Start“ steht wieder die Startseite da', async () => {
    vi.setSystemTime(um(2026, 11, 24, 8));
    await zeige(await starte());
    await menue('Bücher');
    expect(textEls(GRUSS, main())).toHaveLength(0);
    await menue('Start');
    await vi.waitFor(() => expect(gruss()).toBe('Guten Morgen'), W);
    expect(main().textContent).not.toContain('under construction');
  });

  it('[REQ-101/AK-1] Reihenfolge von oben: Kopf, „Gerade am Lesen“, „Diese Woche“, Jahresziel', async () => {
    vi.setSystemTime(um(2026, 11, 24, 12));
    await zeige(await starte());
    const g = textEls(GRUSS, main())[0];
    const lesen = await vi.waitFor(() => {
      const e = textEls('Gerade am Lesen', main())[0];
      expect(e).toBeDefined();
      return e;
    }, W);
    const woche = textEls('Diese Woche', main())[0];
    const ziel = textEls('Jahresziel festlegen', main())[0];
    expect(woche).toBeDefined();
    expect(ziel).toBeDefined();
    const folgt = (a: Node, b: Node) => Boolean(a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING);
    expect(folgt(g, lesen)).toBe(true);
    expect(folgt(lesen, woche)).toBe(true);
    expect(folgt(woche, ziel)).toBe(true);
  });
});

describe('REQ-101 Kopf: Datum und Uhrzeit', () => {
  // Hinweis: Der 24.11.2026 ist ein Dienstag (REQ-AK-2 nennt „Montag, 24.11.2026“). Getestet werden beide Wochentage mit echtem Datum.
  it.each([
    [um(2026, 11, 23, 14, 5), 'Montag', 23, '14:05'],
    [um(2026, 11, 24, 14, 5), 'Dienstag', 24, '14:05'],
    [um(2026, 11, 29, 23, 9), 'Sonntag', 29, '23:09'],
    [um(2026, 12, 1, 0, 0), 'Dienstag', 1, '00:00'],
  ])('[REQ-101/AK-2] %s: Kopf zeigt Wochentag, Datum und Uhrzeit im 24-Stunden-Format', async (d, wochentag, tag, zeit) => {
    vi.setSystemTime(d);
    await zeige(await starte());
    const t = norm(main().textContent);
    expect(t).toContain(wochentag);
    const monat = d.getMonth() === 10 ? 'November' : 'Dezember';
    expect(t).toMatch(new RegExp(`\\b0?${tag}\\.\\s?(${monat}|${d.getMonth() + 1}\\.)`));
    const [h, m] = zeit.split(':');
    expect(t).toMatch(new RegExp(`(^|\\D)(${h}|${Number(h)}):${m}(\\D|$)`));
    expect(t).not.toMatch(/\d\s?(AM|PM|am|pm)\b/);
  });

  it('[REQ-101/AK-2] Vormittag ohne AM/PM: 07:05 erscheint als 07:05 bzw. 7:05; 19:05 erscheint als 19:05, nicht 7:05', async () => {
    vi.setSystemTime(um(2026, 11, 24, 7, 5));
    const App = await starte();
    await zeige(App);
    expect(norm(main().textContent)).toMatch(/(^|\D)0?7:05(\D|$)/);
    await anzeigeUm(App, um(2026, 11, 24, 19, 5));
    expect(norm(main().textContent)).toContain('19:05');
    expect(norm(main().textContent)).not.toMatch(/(^|\d)\s?0?7:05/);
  });

  it('[REQ-101/AK-2] Uhrzeit wird während der Anzeige mindestens minütlich aktualisiert (14:05 → 14:06)', async () => {
    vi.useRealTimers();
    vi.useFakeTimers({ toFake: ['Date', 'setTimeout', 'clearTimeout', 'setInterval', 'clearInterval'], shouldAdvanceTime: true });
    vi.setSystemTime(um(2026, 11, 24, 14, 5, 0));
    await zeige(await starte());
    expect(norm(main().textContent)).toContain('14:05');
    await act(async () => {
      await vi.advanceTimersByTimeAsync(61_000);
    });
    await warte();
    expect(norm(main().textContent)).toContain('14:06');
    expect(norm(main().textContent)).not.toContain('14:05');
  });
});

describe('REQ-101 Gruß und Icon je Tageszeit', () => {
  it('[REQ-101/AK-3] mit Namen „Christine“: 07:30, 12:00, 18:00, 23:00, 04:59 → passender Gruß mit Namen und Icon', async () => {
    const App = await mitName();
    const faelle: [Date, keyof typeof ERWARTET][] = [
      [um(2026, 11, 24, 7, 30), 'morgen'],
      [um(2026, 11, 24, 12, 0), 'tag'],
      [um(2026, 11, 24, 18, 0), 'abend'],
      [um(2026, 11, 24, 23, 0), 'nacht'],
      [um(2026, 11, 25, 4, 59), 'nacht'],
    ];
    for (const [d, tz] of faelle) {
      await anzeigeUm(App, d);
      expect(gruss(), d.toTimeString()).toBe(`${ERWARTET[tz][0]}, Christine`);
      expect(icon(), d.toTimeString()).toBe(ERWARTET[tz][1]);
    }
  });

  it('[REQ-101/AK-3] Gruß und Icon stehen gemeinsam im Kopf (Icon nahe beim Gruß, oberhalb „Gerade am Lesen“)', async () => {
    const App = await mitName();
    await anzeigeUm(App, um(2026, 11, 24, 7, 30));
    const g = textEls(GRUSS, main())[0];
    const i = iconEl();
    let gemeinsam: HTMLElement | null = g.parentElement;
    for (let n = 0; n < 3 && gemeinsam && !gemeinsam.contains(i); n++) gemeinsam = gemeinsam.parentElement;
    expect(gemeinsam?.contains(i), 'Icon neben dem Gruß').toBe(true);
    const lesen = textEls('Gerade am Lesen', main())[0];
    expect(lesen).toBeDefined();
    expect(i.compareDocumentPosition(lesen) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it('[REQ-101/AK-6] ohne Namen um 12:00: nur „Hallo“, ohne Komma und Namen', async () => {
    vi.setSystemTime(um(2026, 11, 24, 12));
    await zeige(await starte());
    expect(gruss()).toBe('Hallo');
    expect(icon()).toBe('Sonne');
    expect(main().textContent).not.toMatch(/Hallo\s*,/);
  });

  it('[REQ-101/AK-6] ohne Namen auch nachts und morgens nur der Gruß', async () => {
    vi.setSystemTime(um(2026, 11, 24, 23, 30));
    const App = await starte();
    await zeige(App);
    expect(gruss()).toBe('Gute Nacht');
    await anzeigeUm(App, um(2026, 11, 25, 6, 0));
    expect(gruss()).toBe('Guten Morgen');
  });
});

describe('REQ-101 Grenzen der Tageszeiten', () => {
  it('[REQ-101/AK-4] 09:59, 10:00, 16:59, 17:00, 20:59, 21:00, 05:00 → Morgen, Tag, Tag, Abend, Abend, Nacht, Morgen', async () => {
    const App = await mitName();
    const faelle: [Date, keyof typeof ERWARTET][] = [
      [um(2026, 11, 24, 9, 59), 'morgen'],
      [um(2026, 11, 24, 10, 0), 'tag'],
      [um(2026, 11, 24, 16, 59), 'tag'],
      [um(2026, 11, 24, 17, 0), 'abend'],
      [um(2026, 11, 24, 20, 59), 'abend'],
      [um(2026, 11, 24, 21, 0), 'nacht'],
      [um(2026, 11, 25, 5, 0), 'morgen'],
    ];
    for (const [d, tz] of faelle) {
      await anzeigeUm(App, d);
      expect(gruss(), d.toTimeString()).toBe(`${ERWARTET[tz][0]}, Christine`);
      expect(icon(), d.toTimeString()).toBe(ERWARTET[tz][1]);
    }
  });

  it('[REQ-101/AK-4] Sekundengenau: 04:59:59 Nacht, 09:59:59 Morgen, 16:59:59 Tag, 20:59:59 Abend, 00:00 Nacht', async () => {
    const App = await mitName();
    const faelle: [Date, keyof typeof ERWARTET][] = [
      [um(2026, 11, 25, 4, 59, 59), 'nacht'],
      [um(2026, 11, 25, 9, 59, 59), 'morgen'],
      [um(2026, 11, 25, 16, 59, 59), 'tag'],
      [um(2026, 11, 25, 20, 59, 59), 'abend'],
      [um(2026, 11, 26, 0, 0, 0), 'nacht'],
      [um(2026, 11, 26, 23, 59, 59), 'nacht'],
    ];
    for (const [d, tz] of faelle) {
      await anzeigeUm(App, d);
      expect(gruss(), d.toTimeString()).toBe(`${ERWARTET[tz][0]}, Christine`);
      expect(icon(), d.toTimeString()).toBe(ERWARTET[tz][1]);
    }
  });

  it.each([
    [um(2026, 11, 24, 16, 59, 30), 'Hallo', 'Guten Abend', 'Sonnenuntergang'],
    [um(2026, 11, 24, 20, 59, 30), 'Guten Abend', 'Gute Nacht', 'Mond'],
    [um(2026, 11, 24, 4, 59, 30), 'Gute Nacht', 'Guten Morgen', 'Sonnenaufgang'],
    [um(2026, 11, 24, 9, 59, 30), 'Guten Morgen', 'Hallo', 'Sonne'],
  ])('[REQ-101/AK-4] Tageszeit wechselt während der Anzeige (%s): Gruß und Icon passen sich an', async (d, vorher, nachher, nachherIcon) => {
    vi.useRealTimers();
    vi.useFakeTimers({ toFake: ['Date', 'setTimeout', 'clearTimeout', 'setInterval', 'clearInterval'], shouldAdvanceTime: true });
    vi.setSystemTime(d);
    await zeige(await starte());
    expect(gruss()).toBe(vorher);
    await act(async () => {
      await vi.advanceTimersByTimeAsync(61_000);
    });
    await warte();
    expect(gruss()).toBe(nachher);
    expect(icon()).toBe(nachherIcon);
  });
});

describe('REQ-101 Icon in der Akzentfarbe', () => {
  function farbenVon(el: HTMLElement): string[] {
    const alle = [el, ...Array.from(el.querySelectorAll<HTMLElement>('*'))];
    return alle.flatMap((e) => {
      const cs = getComputedStyle(e);
      return [e.getAttribute('style') ?? '', e.getAttribute('fill') ?? '', e.getAttribute('stroke') ?? '', cs.color, cs.backgroundColor, cs.borderTopColor];
    });
  }
  function rgb(hex: string) {
    const p = document.createElement('span');
    p.style.setProperty('color', hex);
    document.body.appendChild(p);
    const c = getComputedStyle(p).color;
    p.remove();
    return c;
  }
  const wurzel = () => document.querySelector<HTMLElement>('[data-app-wurzel]')!;

  it.each(['klassisch', 'salbei', 'polarnacht'] as const)('[REQ-101/AK-5] Design „%s“: Tageszeit-Icon in der Farbrubrik „Primär“ dieses Designs', async (id) => {
    vi.setSystemTime(um(2026, 11, 24, 7, 30));
    const App = await starte();
    const st = (await import('@/storage')) as typeof import('@/storage');
    await st.createEinstellungRepository().speichern('farbdesign', id);
    await zeige(App);
    await vi.waitFor(() => expect(wurzel()).toHaveAttribute('data-farbdesign', id), W);
    const f = farbenVon(iconEl());
    const wert = farbdesigns[id].werte.primaer;
    const ueberVariable = f.some((x) => x.includes('var(--bz-farbe-primaer)'));
    const direkt = f.some((x) => x.includes(rgb(wert)) || x.toLowerCase().includes(wert.toLowerCase()));
    expect(ueberVariable || direkt, 'Icon in Primär').toBe(true);
    if (ueberVariable) expect(wurzel().style.getPropertyValue('--bz-farbe-primaer').toLowerCase()).toBe(wert.toLowerCase());
    // keine andere feste Rubrik: das Icon nutzt nicht Sekundär/Tertiär
    expect(f.some((x) => /--bz-farbe-(sekundaer|tertiaer)\)/.test(x))).toBe(false);
  });
});
