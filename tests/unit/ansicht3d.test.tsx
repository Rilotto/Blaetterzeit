import '@testing-library/jest-dom/vitest';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  START_LAGE,
  Trackball,
  cssDrehung,
  lageAusCss,
  quatAchseWinkel,
  quatDrehen,
  sichtbareSeiten,
  type Quat,
} from '@/buchdetails/ansicht3d/drehung';
import { MIN_DARSTELLUNG_DICKE_MM, buchModell, flaechenInhalte } from '@/buchdetails/ansicht3d/modell';
import { DOPPELTIPP_MS, doppeltippErkennen } from '@/buchdetails/doppeltipp';
import { wirksameMasse } from '@/buchdetails/masse';
import type { Buch } from '@/domain/buch';
import { InMemoryBookRepository } from '@/storage/InMemoryBookRepository';
import { InMemoryImageStore } from '@/storage/InMemoryImageStore';
import BuchDetails, { HINWEIS_3D_TEXT } from '@/views/BuchDetails';

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

const nahe = (a: Quat, b: Quat) => {
  // q und −q sind dieselbe Drehung.
  const d = Math.abs(a[0] * b[0] + a[1] * b[1] + a[2] * b[2] + a[3] * b[3]);
  expect(d).toBeCloseTo(1, 5);
};

describe('Drehung (REQ-075)', () => {
  it('Startansicht wie Referenzbild: Cover, Schnitt und Oberkante, kein Rücken', () => {
    expect(sichtbareSeiten(START_LAGE).sort()).toEqual(['oben', 'schnitt', 'vorne']);
  });

  it('CSS-Transform hin und zurück ergibt dieselbe Lage', () => {
    nahe(lageAusCss(cssDrehung(START_LAGE)), START_LAGE);
    const q = quatAchseWinkel([0.3, -1, 0.2], 2.5);
    nahe(lageAusCss(cssDrehung(q)), q);
  });

  it('rotateY(90°) entspricht CSS: Vorderseite zeigt nach rechts', () => {
    const v = quatDrehen(quatAchseWinkel([0, 1, 0], Math.PI / 2), [0, 0, 1]);
    expect(v[0]).toBeCloseTo(1);
  });

  it('waagerecht ziehen dreht um die senkrechte Achse ohne Anschlag, senkrecht zeigt Ober- und Unterkante', () => {
    const k = new Trackball([0, 0, 0, 1]);
    const gesehen = new Set<string>();
    k.greifen(0, 0, 0);
    for (let x = 0; x <= 700; x += 10) {
      k.ziehen(x, 0, x);
      sichtbareSeiten(k.lage, 0.9).forEach((s) => gesehen.add(s));
    }
    k.loslassen(10_000);
    expect([...gesehen].sort()).toEqual(['hinten', 'ruecken', 'schnitt', 'vorne']);
    const s = new Trackball([0, 0, 0, 1]);
    const senkrecht = new Set<string>();
    s.greifen(0, 0, 0);
    for (let y = 0; y <= 700; y += 10) {
      s.ziehen(0, y, y);
      sichtbareSeiten(s.lage, 0.9).forEach((x) => senkrecht.add(x));
    }
    expect(senkrecht.has('oben') && senkrecht.has('unten')).toBe(true);
  });

  it('nach dem Loslassen dreht der Schwung in dieselbe Richtung weiter und klingt ab', () => {
    const k = new Trackball([0, 0, 0, 1]);
    k.greifen(0, 0, 0);
    k.ziehen(20, 0, 10);
    k.ziehen(40, 0, 20);
    k.loslassen(20);
    expect(k.dreht).toBe(true);
    const vorher = quatDrehen(k.lage, [0, 0, 1])[0];
    k.schritt(36);
    expect(quatDrehen(k.lage, [0, 0, 1])[0]).toBeGreaterThan(vorher);
    let t = 36;
    while (k.schritt((t += 16)) && t < 60_000);
    expect(k.dreht).toBe(false);
    expect(t).toBeLessThan(60_000);
  });

  it('kein Schwung nach Pause vor dem Loslassen', () => {
    const k = new Trackball();
    k.greifen(0, 0, 0);
    k.ziehen(50, 0, 10);
    k.loslassen(500);
    expect(k.dreht).toBe(false);
  });
});

describe('Modell (REQ-076)', () => {
  const flaeche = (m: ReturnType<typeof buchModell>, seite: string) => m.flaechen.filter((f) => f.seite === seite);

  it('Taschenbuch 12 × 18 × 4: Proportionen und sechs Flächen ohne Überstand', () => {
    const m = buchModell({ titel: 'X', breiteMm: 120, hoeheMm: 180, dickeMm: 40, format: 'print', unterformat: 'taschenbuch' }, {});
    expect(m.gestalt).toBe('taschenbuch');
    expect(m.breite / m.hoehe).toBeCloseTo(12 / 18);
    expect(m.dicke / m.hoehe).toBeCloseTo(4 / 18);
    expect(m.ueberstand).toBe(0);
    expect(m.flaechen).toHaveLength(6);
  });

  it('ohne Maße: Standardmaße des Formats (REQ-077)', () => {
    const q = { titel: 'X', format: 'print' as const, unterformat: 'kleinformat' as const, seitenanzahl: 300 };
    const w = wirksameMasse(q);
    const m = buchModell(q, {});
    expect(m.breite / m.hoehe).toBeCloseTo(w.breiteMm / w.hoeheMm);
    expect(m.dicke / m.hoehe).toBeCloseTo(w.dickeMm / w.hoeheMm);
  });

  it('Inhalte mit und ohne Bilder', () => {
    expect(flaechenInhalte('Der Hobbit', {})).toEqual({
      vorne: { art: 'primaer', titel: 'Der Hobbit' },
      hinten: { art: 'primaer' },
      ruecken: { art: 'primaer' },
      schnitt: { art: 'muster', linien: 'senkrecht' },
      oben: { art: 'muster', linien: 'waagerecht' },
      unten: { art: 'muster', linien: 'waagerecht' },
    });
    const i = flaechenInhalte('X', { cover: 'c', ruecken: 'r', schnitt: 's' });
    expect([i.vorne, i.ruecken, i.schnitt]).toEqual([
      { art: 'bild', bild: 'c' },
      { art: 'bild', bild: 'r' },
      { art: 'bild', bild: 's' },
    ]);
    expect(i.hinten.art).toBe('primaer');
  });

  it('Hardcover: Deckel überragen den Buchblock oben, unten und vorne; E-Book wie Taschenbuch', () => {
    const m = buchModell({ titel: 'X', format: 'print', unterformat: 'hardcover', seitenanzahl: 400 }, {});
    expect(m.gestalt).toBe('hardcover');
    expect(m.ueberstand).toBeCloseTo(3 * m.pxJeMm);
    const block = m.flaechen.find((f) => f.id === 'buchblock-oben')!;
    const deckel = m.flaechen.find((f) => f.id === 'vorderdeckel-vorne')!;
    expect(deckel.hoehe - flaeche(m, 'schnitt')[0].hoehe).toBeCloseTo(2 * m.ueberstand);
    expect(block.breite).toBeLessThan(deckel.breite);
    expect(['vorne', 'hinten', 'ruecken', 'schnitt', 'oben', 'unten'].every((s) => flaeche(m, s).length === 1)).toBe(true);
    const e = buchModell({ titel: 'X', format: 'ebook', seitenanzahl: 300 }, {});
    const t = buchModell({ titel: 'X', format: 'print', unterformat: 'taschenbuch', seitenanzahl: 300 }, {});
    expect(e).toEqual(t);
  });

  it('sehr dünne Bücher bekommen eine Mindestdicke in der Darstellung', () => {
    const m = buchModell({ titel: 'X', breiteMm: 120, hoeheMm: 180, dickeMm: 1 }, {});
    expect(m.dicke / m.pxJeMm).toBeCloseTo(MIN_DARSTELLUNG_DICKE_MM);
  });
});

describe('Doppeltipp (REQ-074)', () => {
  it('Einfachtipp erst nach der Wartezeit, Doppeltipp sofort und ohne Einfachtipp', () => {
    vi.useFakeTimers();
    const einfach = vi.fn();
    const doppelt = vi.fn();
    const d = doppeltippErkennen(einfach, doppelt);
    d.tipp();
    vi.advanceTimersByTime(DOPPELTIPP_MS - 1);
    expect(einfach).not.toHaveBeenCalled();
    vi.advanceTimersByTime(1);
    expect(einfach).toHaveBeenCalledTimes(1);
    d.tipp();
    vi.advanceTimersByTime(100);
    d.tipp();
    vi.advanceTimersByTime(1000);
    expect(doppelt).toHaveBeenCalledTimes(1);
    expect(einfach).toHaveBeenCalledTimes(1);
  });
});

describe('Buchdetails mit 3D-Ansicht (REQ-074, REQ-078)', () => {
  const basis: Buch = {
    id: '0b0b0b0b-1111-4222-8333-444444444444',
    titel: 'Der Hobbit',
    autor: 'J. R. R. Tolkien',
    status: 'ungelesen',
  } as Buch;

  const oeffnen = async (buch: Buch) => {
    vi.useFakeTimers();
    render(
      <BuchDetails
        buchId={buch.id}
        buch={buch}
        bildspeicher={new InMemoryImageStore()}
        repository={new InMemoryBookRepository()}
        onZurueck={() => {}}
      />,
    );
    await act(async () => {});
    const cover = document.querySelector<HTMLElement>('[data-bereich="cover"]')!;
    fireEvent.click(cover);
    fireEvent.click(cover);
    await act(async () => {
      vi.advanceTimersByTime(DOPPELTIPP_MS + 10);
    });
  };

  it('Doppeltipp öffnet die Ansicht, kein Auswahlmenü; Bearbeiten führt zum Reiter „Details“', async () => {
    await oeffnen(basis);
    const ansicht = screen.getByRole('dialog', { name: '3D-Ansicht' });
    expect(ansicht.querySelector('[data-ansicht3d-titel]')).toHaveTextContent('Der Hobbit');
    expect(ansicht.querySelector('[data-ansicht3d-autor]')).toHaveTextContent('J. R. R. Tolkien');
    expect(document.querySelector('[data-flaeche="vorne"] [data-modell-titel]')).toHaveTextContent('Der Hobbit');
    expect(screen.queryByRole('menu')).toBeNull();
    fireEvent.click(ansicht.querySelector('[data-ansicht3d-bearbeiten]')!);
    expect(screen.queryByRole('dialog', { name: '3D-Ansicht' })).toBeNull();
    expect(screen.getByRole('tab', { name: /Details/ })).toHaveAttribute('aria-selected', 'true');
  });

  it('Ziehen setzt das Transform des Modells, Schwung läuft per requestAnimationFrame weiter', async () => {
    await oeffnen(basis);
    const buehne = document.querySelector<HTMLElement>('[data-ansicht3d-buehne]')!;
    const modell = document.querySelector<HTMLElement>('[data-modell3d]')!;
    const start = modell.style.transform;
    fireEvent.pointerDown(buehne, { pointerId: 1, clientX: 0, clientY: 0 });
    vi.advanceTimersByTime(10);
    fireEvent.pointerMove(buehne, { pointerId: 1, clientX: 30, clientY: 0 });
    vi.advanceTimersByTime(10);
    fireEvent.pointerMove(buehne, { pointerId: 1, clientX: 60, clientY: 0 });
    fireEvent.pointerUp(buehne, { pointerId: 1, clientX: 60, clientY: 0 });
    const losgelassen = modell.style.transform;
    expect(losgelassen).not.toBe(start);
    vi.advanceTimersByTime(100);
    expect(modell.style.transform).not.toBe(losgelassen);
  });

  it('Hörbuch: Hinweis statt Ansicht und ohne Auswahlmenü', async () => {
    await oeffnen({ ...basis, format: 'hoerbuch' } as Buch);
    expect(screen.queryByRole('dialog', { name: '3D-Ansicht' })).toBeNull();
    expect(screen.getByRole('status')).toHaveTextContent(HINWEIS_3D_TEXT);
    expect(screen.queryByRole('menu')).toBeNull();
  });
});
