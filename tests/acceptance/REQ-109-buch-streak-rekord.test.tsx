/**
 * Akzeptanztests REQ-109 – Buch-Streak in den Buchdetails als Rekord „Längste Serie“.
 * Abgeleitet aus dem REQ-Text (Sprint 10, Teil D). Buchdetails mit InMemoryBookRepository, Uhr über Fake-Timer.
 * Statistik-Pille wie REQ-026: linker Teil [data-streak] mit Flamme [data-flamme] und Zahl [data-streak-zahl].
 * Zustand der Flamme an der Darstellung erkannt: Verlauf (url(#…)) = angezündet, ohne Füllung = Umriss.
 */
import '@testing-library/jest-dom/vitest';
import { act, cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import type { CSSProperties } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { Buch } from '@/domain/buch';
import type { ImageStore } from '@/storage';
import { InMemoryBookRepository } from '@/storage/InMemoryBookRepository';
import { farbVariablen } from '@/theme';
import BuchDetails from '@/views/BuchDetails';

vi.mock('@/buecher/demodaten', () => ({ demoBuecher: [] }));
beforeEach(() => {
  vi.useFakeTimers({ toFake: ['Date'] });
  vi.setSystemTime(HEUTE);
});
afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

const W = { timeout: 4000 };
const um = (m: number, t: number, h = 12, mi = 0, j = 2026) => new Date(j, m - 1, t, h, mi);
const HEUTE = um(11, 25, 15);
const s = (...d: Date[]) => d.map((x, i) => ({ zeitpunkt: x.toISOString(), seite: 10 + i }));
const norm = (t: string | null | undefined) => (t ?? '').replace(/[\s  ]+/g, ' ').trim();
const bilder = { get: async () => undefined, put: async () => {}, remove: async () => {} } as unknown as ImageStore;
let nr = 0;
const buch = (f: Partial<Buch> = {}): Buch => ({ id: `b109-${++nr}`, titel: 'Fourth Wing', status: 'am_lesen', seitenanzahl: 400, aktuelleSeite: 50, ...f });
async function tippe(el: Element | null) {
  expect(el).not.toBeNull();
  await act(async () => {
    fireEvent.click(el!);
    await new Promise((r) => setTimeout(r, 20));
  });
}

async function zeige(b: Buch, repo = new InMemoryBookRepository(), weitere: Buch[] = []) {
  await repo.save(b);
  for (const x of weitere) await repo.save(x);
  render(
    <div style={farbVariablen() as CSSProperties}>
      <BuchDetails buchId={b.id} repository={repo} bildspeicher={bilder} bildquelle={{ scannen: async () => null, galerie: async () => null }} onZurueck={() => {}} />
    </div>,
  );
  const d = await screen.findByRole('region', { name: 'Buchdetails' }, W);
  await vi.waitFor(() => expect(d.querySelector('[data-streak] [data-flamme]')).not.toBeNull(), W);
  return { d, repo };
}
const teil = () => document.querySelector<HTMLElement>('[data-streak]')!;
const flamme = () => teil().querySelector<HTMLElement>('[data-flamme]')!;
const zahl = () => norm(flamme().querySelector('[data-streak-zahl]')?.textContent);
function zustand(): 'angezuendet' | 'ausgegraut' | 'erloschen' {
  const p = flamme().querySelector<SVGPathElement>('path')!;
  const fill = (p.style.fill || p.getAttribute('fill') || '').trim();
  if (/url\(/.test(fill)) return 'angezuendet';
  if (fill === '' || fill === 'none' || fill === 'transparent') return 'erloschen';
  return 'ausgegraut';
}
/** Fünf Tage am Stück (1.–5. November), je eine Sitzung. */
const FUENF = [um(11, 1), um(11, 2), um(11, 3), um(11, 4), um(11, 5)];

describe('REQ-109 Beschriftung', () => {
  // Fassung 2026-11-25 (Mini-Änderung): Beschriftung „Längste Serie“.
  it('[REQ-109/AK-1] unter der Flamme genau „Längste Serie“, weder „Längste Serie“ noch „Tage in Folge“', async () => {
    await zeige(buch({ sitzungen: s(um(11, 24)) }));
    const text = norm(teil().textContent);
    expect(text).toContain('Längste Serie');
    expect(text).not.toContain('Längster Streak');
    expect(text).not.toContain('Tage in Folge');
    const label = within(teil()).getByText('Längste Serie');
    expect(flamme().compareDocumentPosition(label) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it('[REQ-109/AK-1] Beschriftung auch ohne Sitzungen (Zahl 0)', async () => {
    await zeige(buch());
    expect(norm(teil().textContent)).toMatch(/^0 ?Längste Serie$/);
  });
});

describe('REQ-109 Längste Folge über die Historie', () => {
  it('[REQ-109/AK-2] Sitzungen 1., 2., 3. und 10., 11. November, heute 25.: Flamme 3, angezündet', async () => {
    await zeige(buch({ sitzungen: s(um(11, 1), um(11, 2), um(11, 3), um(11, 10), um(11, 11)) }));
    expect(zahl()).toBe('3');
    expect(zustand()).toBe('angezuendet');
    expect(flamme().querySelectorAll('[data-verlauf]')).toHaveLength(2);
  });

  it('[REQ-109/AK-2] alter Rekord schlägt die laufende Folge: 1.–5. November und gestern/heute → 5', async () => {
    await zeige(buch({ sitzungen: s(...FUENF, um(11, 24), um(11, 25, 9)) }));
    expect(zahl()).toBe('5');
  });

  it('[REQ-109/AK-2] laufende Folge ist der Rekord: 3 Tage bis heute nach früher 2 Tagen → 3', async () => {
    await zeige(buch({ sitzungen: s(um(11, 10), um(11, 11), um(11, 23), um(11, 24), um(11, 25, 8)) }));
    expect(zahl()).toBe('3');
  });

  it('[REQ-109/AK-2] Folge über Monats- und Jahresgrenze zählt lückenlos (30.12.–2.1.) → 4', async () => {
    vi.setSystemTime(um(1, 20, 12, 0, 2027));
    await zeige(buch({ sitzungen: s(um(12, 30), um(12, 31), um(1, 1, 12, 0, 2027), um(1, 2, 12, 0, 2027)) }));
    expect(zahl()).toBe('4');
  });

  it('[REQ-109/AK-2] Tageswechsel nach lokaler Zeit: 23:59 und 00:01 des Folgetags → 2', async () => {
    await zeige(buch({ sitzungen: s(um(11, 10, 23, 59), um(11, 11, 0, 1)) }));
    expect(zahl()).toBe('2');
  });

  it('[REQ-109/AK-2] Rekord endet gestern, heute nicht gelesen: nicht ausgegraut', async () => {
    await zeige(buch({ sitzungen: s(um(11, 23), um(11, 24)) }));
    expect(zahl()).toBe('2');
    expect(zustand()).toBe('angezuendet');
  });

  it('[REQ-109/AK-2] unsortiert gespeicherte Sitzungen → richtige längste Folge', async () => {
    await zeige(buch({ sitzungen: s(um(11, 12), um(11, 3), um(11, 11), um(11, 1), um(11, 2), um(11, 10)) }));
    expect(zahl()).toBe('3');
  });
});

describe('REQ-109 Mehrere Sitzungen am Tag', () => {
  it('[REQ-109/AK-3] fünf Sitzungen an fünf Tagen → 5; drei weitere am 3. November → weiter 5', async () => {
    await zeige(buch({ sitzungen: s(...FUENF) }));
    expect(zahl()).toBe('5');
    cleanup();
    await zeige(buch({ sitzungen: s(...FUENF, um(11, 3, 8), um(11, 3, 14), um(11, 3, 22)) }));
    expect(zahl()).toBe('5');
  });

  it('[REQ-109/AK-3] Wert höchstens so groß wie die Lesetage: eine Sitzung → 1, drei am selben Tag → 1', async () => {
    await zeige(buch({ sitzungen: s(um(11, 7)) }));
    expect(zahl()).toBe('1');
    cleanup();
    await zeige(buch({ sitzungen: s(um(11, 7, 8), um(11, 7, 12), um(11, 7, 20)) }));
    expect(zahl()).toBe('1');
  });

  it('[REQ-109/AK-3] heute über die Oberfläche erhöht, gestern gelesen, kein älterer Rekord: 1 → 2', async () => {
    await zeige(buch({ aktuelleSeite: 50, sitzungen: s(um(11, 24)) }));
    expect(zahl()).toBe('1');
    await tippe(within(document.querySelector<HTMLElement>('[data-fortschritt]')!).getByRole('progressbar'));
    const d = await screen.findByRole('dialog', { name: 'Aktuelle Seite' }, W);
    await act(async () => {
      fireEvent.change(within(d).getByLabelText('Aktuelle Seite'), { target: { value: '60' } });
    });
    await tippe(within(d).getByRole('button', { name: 'Sichern' }));
    await vi.waitFor(() => expect(zahl()).toBe('2'), W);
  });
});

describe('REQ-109 Rekord sinkt nicht', () => {
  it('[REQ-109/AK-4] 5 Tage gelesen, dann 10 Tage Pause, Status „gelesen“: weiterhin 5', async () => {
    vi.setSystemTime(um(11, 15, 15));
    await zeige(buch({ status: 'gelesen', beendetAm: '2026-11-05', aktuelleSeite: 400, sitzungen: s(...FUENF) }));
    expect(zahl()).toBe('5');
    expect(zustand()).toBe('angezuendet');
  });

  it('[REQ-109/AK-4] auch bei „abgebrochen“ und nach langer Pause (Monate) bleibt der Rekord', async () => {
    vi.setSystemTime(um(3, 1, 12, 0, 2027));
    await zeige(buch({ status: 'abgebrochen', sitzungen: s(...FUENF) }));
    expect(zahl()).toBe('5');
  });

  it('[REQ-109/AK-4] Statuswechsel in den Buchdetails ändert den Rekord nicht', async () => {
    vi.setSystemTime(um(11, 15, 15));
    const { d } = await zeige(buch({ sitzungen: s(...FUENF) }));
    expect(zahl()).toBe('5');
    await tippe(d.querySelector('[aria-haspopup="menu"]'));
    await tippe(await screen.findByRole('menuitem', { name: 'abgebrochen' }, W));
    await act(async () => {
      await new Promise((r) => setTimeout(r, 60));
    });
    expect(zahl()).toBe('5');
  });
});

describe('REQ-109 Nur dieses Buch', () => {
  it('[REQ-109/AK-5] gestern und heute nur Buch A, Buch B ohne Sitzung: B zeigt 0 als Umriss, A zeigt 2', async () => {
    const repo = new InMemoryBookRepository();
    const a = buch({ titel: 'A', sitzungen: s(um(11, 24), um(11, 25, 9)) });
    const b = buch({ titel: 'B' });
    await zeige(b, repo, [a]);
    expect(zahl()).toBe('0');
    expect(zustand()).toBe('erloschen');
    expect(flamme().querySelector<SVGPathElement>('path')!.style.stroke).toBe('var(--bz-farbe-ghostframe)');
    cleanup();
    await zeige(a, repo);
    expect(zahl()).toBe('2');
    expect(zustand()).toBe('angezuendet');
  });

  it('[REQ-109/AK-5] fremde Sitzungen füllen keine Lücke: A 1. und 3., B 2. November → A zeigt 1', async () => {
    const repo = new InMemoryBookRepository();
    const a = buch({ titel: 'A', sitzungen: s(um(11, 1), um(11, 3)) });
    const b = buch({ titel: 'B', sitzungen: s(um(11, 2)) });
    await zeige(a, repo, [b]);
    expect(zahl()).toBe('1');
  });
});
