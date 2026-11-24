/**
 * Akzeptanztests REQ-104 – Startseite: Jahresziel „X von Y Büchern“ mit Blatt zum Festlegen.
 * Abgeleitet aus dem REQ-Text (Sprint 10, Teil C). Schwarzkasten über die App (Rollen und Texte):
 *  - Kachel: Text „X von Y Büchern JJJJ“ bzw. „Jahresziel festlegen“ auf der Startseite.
 *  - Blatt: role="dialog" mit einem Eingabefeld, „Sichern“ und „Schließen“; Fehler als aria-invalid="true" (Muster REQ-063).
 *  - Vergleich mit der Statistik: Pille „Jährlich“, Kachel [data-kachel="buecher"] [data-kachel-wert] (REQ-081).
 *  - „Neustart“: Module neu laden, dieselbe IndexedDB (fake-indexeddb) und derselbe localStorage.
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
const HEUTE = um(2026, 11, 24, 15);
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
const buch = (titel: string, f: Partial<Buch> = {}): Buch => ({ id: `b104-${++nr}`, titel, status: 'gelesen', seitenanzahl: 300, ...f });
const MIT = /^\d+\s*von\s*\d+\s*Büchern(\s*\d{4})?$/;
async function starte(buecher: Buch[] = [], heute = HEUTE) {
  vi.setSystemTime(heute);
  vi.resetModules();
  const st = (await import('@/storage')) as typeof import('@/storage');
  const repo = st.createBookRepository();
  for (const b of buecher) await repo.save(b);
  const App = (await import('@/App')).default as unknown as Komp;
  render(<App />);
  await screen.findByRole('navigation', { name: 'Hauptnavigation' }, W);
  await vi.waitFor(() => expect(kachelText()).not.toBe(''), W);
  await warte(80);
}
async function neustart(heute = HEUTE) {
  cleanup();
  await starte([], heute);
}
/** Text der Kachel: „X von Y Büchern JJJJ“ bzw. „Jahresziel festlegen“; '' wenn keine Kachel gefunden. */
function kachelText(): string {
  const k = textEls(MIT, main());
  if (k.length > 0) {
    const [, x, y] = /^(\d+)\s*von\s*(\d+)/.exec(norm(k[0].textContent))!;
    let el: HTMLElement | null = k[0];
    while (el && el !== main() && !/(?<!\d)(19|20)\d{2}(?!\d)/.test(norm(el.textContent).replace(/^\d+\s*von\s*\d+/, ''))) el = el.parentElement;
    const jahr = el && el !== main() ? /(?<!\d)((19|20)\d{2})(?!\d)/.exec(norm(el.textContent).replace(/^\d+\s*von\s*\d+/, ''))![1] : '?';
    return `${x} von ${y} Büchern ${jahr}`;
  }
  return textEls('Jahresziel festlegen', main()).length > 0 ? 'Jahresziel festlegen' : '';
}
function kachelEl(): HTMLElement {
  const k = [...textEls('Jahresziel festlegen', main()), ...textEls(MIT, main())];
  expect(k.length, 'Kachel Jahresziel').toBeGreaterThan(0);
  return k[0];
}
async function blattOeffnen() {
  await tippe(kachelEl());
  const d = await screen.findByRole('dialog', {}, W);
  const feld = d.querySelector<HTMLInputElement>('input');
  expect(feld, 'Zahlenfeld').not.toBeNull();
  return { d, feld: feld! };
}
async function sichern(d: HTMLElement) {
  await tippe(within(d).getByRole('button', { name: 'Sichern' }));
  await warte(80);
}
async function zielSetzen(wert: string) {
  const { d, feld } = await blattOeffnen();
  await eingeben(feld, wert);
  await sichern(d);
  expect(screen.queryByRole('dialog')).toBeNull();
}

describe('REQ-104 Ohne Ziel', () => {
  it('[REQ-104/AK-1] für 2026 kein Ziel: Kachel „Jahresziel festlegen“, kein „von … Büchern“', async () => {
    await starte([buch('A', { beendetAm: '2026-03-01' })]);
    expect(kachelText()).toBe('Jahresziel festlegen');
    expect(norm(main().textContent)).not.toMatch(/von\s*\d+\s*Büchern/);
  });

  it('[REQ-104/AK-1] ein Ziel nur für 2025 gilt 2026 nicht', async () => {
    await starte([], um(2025, 6, 1));
    await zielSetzen('12');
    expect(kachelText()).toBe('0 von 12 Büchern 2025');
    await neustart();
    expect(kachelText()).toBe('Jahresziel festlegen');
  });
});

describe('REQ-104 Ziel festlegen', () => {
  it('[REQ-104/AK-2] Kachel antippen, 20 eintragen, „Sichern“: „0 von 20 Büchern 2026“, auch nach Neustart', async () => {
    await starte();
    const { feld } = await blattOeffnen();
    expect(feld.value).toBe('');
    await eingeben(feld, '20');
    await sichern(screen.getByRole('dialog'));
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(kachelText()).toBe('0 von 20 Büchern 2026');
    await neustart();
    expect(kachelText()).toBe('0 von 20 Büchern 2026');
  });

  it('[REQ-104/AK-2] Blatt ist mit dem Ziel vorbefüllt; Ändern auf 1 (kleinster gültiger Wert) wird gespeichert', async () => {
    await starte([buch('A', { beendetAm: '2026-02-02' })]);
    await zielSetzen('20');
    const { d, feld } = await blattOeffnen();
    expect(feld.value).toBe('20');
    await eingeben(feld, '1');
    await sichern(d);
    expect(kachelText()).toBe('1 von 1 Büchern 2026');
    await neustart();
    expect(kachelText()).toBe('1 von 1 Büchern 2026');
  });

  it('[REQ-104/AK-2] großes Ziel 365 und Übertreffen des Ziels: weiter „X von Y Büchern“', async () => {
    await starte([buch('A', { beendetAm: '2026-01-05' }), buch('B', { beendetAm: '2026-04-05' }), buch('C', { beendetAm: '2026-11-24' })]);
    await zielSetzen('365');
    expect(kachelText()).toBe('3 von 365 Büchern 2026');
    await zielSetzen('2');
    expect(kachelText()).toBe('3 von 2 Büchern 2026');
  });
});

describe('REQ-104 Zählung wie in der Statistik', () => {
  async function statistikJahrBuecher(): Promise<string> {
    await menue('Statistik');
    await tippe(await screen.findByRole('button', { name: 'Jährlich' }, W));
    return vi.waitFor(() => {
      const w = main().querySelector('[data-kachel="buecher"] [data-kachel-wert]');
      expect(w).not.toBeNull();
      return norm(w!.textContent);
    }, W);
  }

  it('[REQ-104/AK-3] drei 2026 beendete Bücher (eins nachgetragen), eins 2025: „3 von 20 Büchern 2026“ = Statistik „Bücher“', async () => {
    const s = (d: Date) => ({ zeitpunkt: d.toISOString(), seite: 300 });
    await starte([
      buch('Eins', { beendetAm: '2026-03-01', sitzungen: [s(um(2026, 3, 1))] }),
      buch('Zwei', { beendetAm: '2026-11-20', sitzungen: [s(um(2026, 11, 20))] }),
      buch('Nachgetragen', { beendetAm: '2026-06-15' }),
      buch('Vorjahr', { beendetAm: '2025-12-31', sitzungen: [s(um(2025, 12, 31))] }),
    ]);
    await zielSetzen('20');
    expect(kachelText()).toBe('3 von 20 Büchern 2026');
    expect(await statistikJahrBuecher()).toBe('3');
  });

  it('[REQ-104/AK-3] Grenzen: 01.01.2026 und 31.12.2026 zählen, 31.12.2025 und 01.01.2027 nicht', async () => {
    await starte([
      buch('Neujahr', { beendetAm: '2026-01-01' }),
      buch('Silvester', { beendetAm: '2026-12-31' }),
      buch('Vorjahr', { beendetAm: '2025-12-31' }),
      buch('Folgejahr', { beendetAm: '2027-01-01' }),
    ]);
    await zielSetzen('20');
    expect(kachelText()).toBe('2 von 20 Büchern 2026');
    expect(await statistikJahrBuecher()).toBe('2');
  });

  it('[REQ-104/AK-3] nur Status „gelesen“ zählt: „am lesen“, „abgebrochen“ mit „Beendet am“ 2026 zählen nicht; ohne „Beendet am“ zählt nicht', async () => {
    await starte([
      buch('Gelesen', { beendetAm: '2026-05-05' }),
      buch('AmLesen', { status: 'am_lesen', beendetAm: '2026-05-05' }),
      buch('Abgebrochen', { status: 'abgebrochen', beendetAm: '2026-05-05' }),
      buch('OhneDatum'),
    ]);
    await zielSetzen('10');
    expect(kachelText()).toBe('1 von 10 Büchern 2026');
    expect(await statistikJahrBuecher()).toBe('1');
  });
});

describe('REQ-104 Ungültig, leeren, verwerfen', () => {
  it('[REQ-104/AK-4] 0 eintragen und sichern: Feld hervorgehoben, Blatt offen, Ziel bleibt 20 (auch nach Neustart)', async () => {
    await starte();
    await zielSetzen('20');
    const { d, feld } = await blattOeffnen();
    await eingeben(feld, '0');
    await sichern(d);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(feld).toHaveAttribute('aria-invalid', 'true');
    await tippe(within(screen.getByRole('dialog')).getByRole('button', { name: 'Schließen' }));
    expect(kachelText()).toBe('0 von 20 Büchern 2026');
    await neustart();
    expect(kachelText()).toBe('0 von 20 Büchern 2026');
  });

  it.each(['00', '1,5', '2.5', '-3', 'zehn'])('[REQ-104/AK-4] keine gültige ganze Zahl ≥ 1 („%s“): nicht gespeichert', async (wert) => {
    await starte();
    await zielSetzen('20');
    const { d, feld } = await blattOeffnen();
    await eingeben(feld, wert);
    if (feld.value === wert) {
      // Eingabe steht so im Feld: muss hervorgehoben und abgelehnt werden
      await sichern(d);
      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(feld).toHaveAttribute('aria-invalid', 'true');
      await tippe(within(d).getByRole('button', { name: 'Schließen' }));
      expect(kachelText()).toBe('0 von 20 Büchern 2026');
    } else {
      // Feld filtert Zeichen: übrig bleiben nur Ziffern (Muster REQ-063, ISBN)
      expect(feld.value).toMatch(/^\d*$/);
    }
  });

  it('[REQ-104/AK-4] Feld leeren und sichern: „Jahresziel festlegen“, auch nach Neustart; Blatt danach leer', async () => {
    await starte();
    await zielSetzen('20');
    await zielSetzen('');
    expect(kachelText()).toBe('Jahresziel festlegen');
    await neustart();
    expect(kachelText()).toBe('Jahresziel festlegen');
    const { feld } = await blattOeffnen();
    expect(feld.value).toBe('');
  });

  it('[REQ-104/AK-4] nach Änderung ohne „Sichern“ schließen: Ziel unverändert 20', async () => {
    await starte();
    await zielSetzen('20');
    const { d, feld } = await blattOeffnen();
    await eingeben(feld, '35');
    await tippe(within(d).getByRole('button', { name: 'Schließen' }));
    await warte(60);
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(kachelText()).toBe('0 von 20 Büchern 2026');
    await neustart();
    expect(kachelText()).toBe('0 von 20 Büchern 2026');
  });

  it('[REQ-104/AK-4] ohne Ziel: Eintrag ohne „Sichern“ verworfen, weiter „Jahresziel festlegen“; 0 legt kein Ziel an', async () => {
    await starte();
    let b = await blattOeffnen();
    await eingeben(b.feld, '20');
    await tippe(within(b.d).getByRole('button', { name: 'Schließen' }));
    expect(kachelText()).toBe('Jahresziel festlegen');
    b = await blattOeffnen();
    await eingeben(b.feld, '0');
    await sichern(b.d);
    expect(b.feld).toHaveAttribute('aria-invalid', 'true');
    await tippe(within(b.d).getByRole('button', { name: 'Schließen' }));
    expect(kachelText()).toBe('Jahresziel festlegen');
  });
});

describe('REQ-104 Neues Jahr', () => {
  it('[REQ-104/AK-5] Ziel 20 für 2026, heute 01.01.2027: „Jahresziel festlegen“', async () => {
    await starte([], um(2026, 12, 31, 23, 59));
    await zielSetzen('20');
    expect(kachelText()).toBe('0 von 20 Büchern 2026');
    await neustart(um(2027, 1, 1, 0, 0));
    expect(kachelText()).toBe('Jahresziel festlegen');
  });

  it('[REQ-104/AK-5] Ziel 2027 ist unabhängig; das Ziel 2026 bleibt für sein Jahr gespeichert', async () => {
    await starte([buch('A', { beendetAm: '2026-12-30' }), buch('B', { beendetAm: '2027-01-01' })], um(2026, 12, 31, 12));
    await zielSetzen('20');
    expect(kachelText()).toBe('1 von 20 Büchern 2026');
    await neustart(um(2027, 1, 1, 9));
    expect(kachelText()).toBe('Jahresziel festlegen');
    await zielSetzen('5');
    expect(kachelText()).toBe('1 von 5 Büchern 2027');
    await neustart(um(2026, 12, 31, 12));
    expect(kachelText()).toBe('1 von 20 Büchern 2026');
  });
});
