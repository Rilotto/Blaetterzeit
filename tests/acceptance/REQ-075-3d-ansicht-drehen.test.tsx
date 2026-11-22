/**
 * Akzeptanztests REQ-075 – 3D-Ansicht: Modell frei drehen mit Schwung, ohne Zoom.
 * Abgeleitet aus dem REQ-Text. Schnittstellen laut Entwickler (Sprint 08):
 *  - Modell [data-modell3d] mit style.transform rotate3d(...), Flächen [data-flaeche=vorne|hinten|ruecken|schnitt|oben|unten]
 *    mit eigenem CSS-Transform (rotateX/rotateY/translateZ); Bühne [data-ansicht3d-buehne] für Pointer-Ereignisse
 *  - lageAusCss, quatDrehen (src/buchdetails/ansicht3d/drehung.ts); Schwung über requestAnimationFrame und performance.now()
 * Sichtbarkeit wird aus dem DOM berechnet: Normale jeder Fläche aus ihrem Transform, gedreht mit der Lage des Modells;
 * sichtbar = Normale zeigt zum Betrachter (CSS: +z).
 */
import '@testing-library/jest-dom/vitest';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import BuchDetails from '@/views/BuchDetails';
import { lageAusCss, quatDrehen, quatMal, type Quat, type Vek3 } from '@/buchdetails/ansicht3d/drehung';
import type { Buch } from '@/domain/buch';
import type { ImageStore } from '@/storage/ImageStore';
import { InMemoryBookRepository } from '@/storage/InMemoryBookRepository';

vi.mock('@/buecher/demodaten', () => ({ demoBuecher: [] }));
afterEach(() => {
  vi.useRealTimers();
  cleanup();
});

const W = { timeout: 3000 };
const leer = { get: async () => undefined, put: async () => {}, remove: async () => {} } as unknown as ImageStore;

async function oeffne3d(m: Partial<Buch> = {}) {
  const repo = new InMemoryBookRepository();
  const id = crypto.randomUUID();
  await repo.save({ id, titel: 'Der Hobbit', status: 'ungelesen', format: 'print', unterformat: 'taschenbuch', breiteMm: 120, hoeheMm: 190, dickeMm: 30, ...m } as Buch);
  render(<BuchDetails buchId={id} repository={repo} bildspeicher={leer} bildquelle={{ scannen: async () => null, galerie: async () => null }} onZurueck={() => {}} />);
  await screen.findByRole('region', { name: 'Buchdetails' }, W);
  await vi.waitFor(() => expect(document.querySelectorAll('[data-bereich]')).toHaveLength(3), W);
  const cover = document.querySelector<HTMLElement>('[data-bereich="cover"]')!;
  await act(async () => {
    fireEvent.click(cover);
    fireEvent.click(cover);
  });
  return screen.findByRole('dialog', { name: '3D-Ansicht' }, W);
}
const modell = () => document.querySelector<HTMLElement>('[data-modell3d]')!;
const buehne = () => document.querySelector<HTMLElement>('[data-ansicht3d-buehne]')!;
const lage = (): Quat => lageAusCss(modell().style.transform);

/** Normale einer Fläche aus ihrem CSS-Transform (nur rotateX/rotateY/rotateZ wirken auf die Richtung). */
function normale(transform: string): Vek3 {
  const drehungen = [...transform.matchAll(/rotate([XYZ])\(\s*(-?[\d.]+)deg\s*\)/g)].map((m) => [m[1], (Number(m[2]) * Math.PI) / 180] as const);
  let v: Vek3 = [0, 0, 1];
  // CSS: Transformliste „A B C“ wirkt auf einen Punkt als A(B(C(p))) → von hinten anwenden.
  for (const [achse, a] of drehungen.reverse()) {
    const [x, y, z] = v;
    const c = Math.cos(a);
    const s = Math.sin(a);
    if (achse === 'X') v = [x, y * c - z * s, y * s + z * c];
    else if (achse === 'Y') v = [x * c + z * s, y, -x * s + z * c];
    else v = [x * c - y * s, x * s + y * c, z];
  }
  return v;
}
/** Sichtbare logische Flächen in der aktuellen Lage, aus dem DOM. */
function sichtbar(schwelle = 0.05): Set<string> {
  const q = lage();
  const s = new Set<string>();
  for (const f of document.querySelectorAll<HTMLElement>('[data-modell3d] [data-flaeche]')) {
    const seite = f.getAttribute('data-flaeche')!;
    if (seite === 'kante') continue;
    if (quatDrehen(q, normale(f.style.transform))[2] > schwelle) s.add(seite);
  }
  return s;
}
const vorneRichtung = (): Vek3 => quatDrehen(lage(), [0, 0, 1]);
/** Drehwinkel einer Lage in rad (0 … π). */
const winkel = (q: Quat) => 2 * Math.acos(Math.min(1, Math.abs(q[3])));
const punkt = (a: Vek3, b: Vek3) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const konj = (q: Quat): Quat => [-q[0], -q[1], -q[2], q[3]];
/** Drehachse der Änderung zwischen zwei Lagen (Weltsystem), normiert. */
function deltaAchse(vorher: Quat, nachher: Quat): Vek3 {
  const d = quatMal(nachher, konj(vorher));
  const l = Math.hypot(d[0], d[1], d[2]);
  const sg = d[3] < 0 ? -1 : 1;
  return [(sg * d[0]) / l, (sg * d[1]) / l, (sg * d[2]) / l];
}

const pd = (x: number, y: number, id = 1) => fireEvent.pointerDown(buehne(), { pointerId: id, clientX: x, clientY: y, isPrimary: id === 1 });
const pm = (x: number, y: number, id = 1) => fireEvent.pointerMove(buehne(), { pointerId: id, clientX: x, clientY: y, isPrimary: id === 1 });
const pu = (x: number, y: number, id = 1) => fireEvent.pointerUp(buehne(), { pointerId: id, clientX: x, clientY: y, isPrimary: id === 1 });

const fake = () =>
  vi.useFakeTimers({
    toFake: ['setTimeout', 'clearTimeout', 'setInterval', 'clearInterval', 'Date', 'performance', 'requestAnimationFrame', 'cancelAnimationFrame'],
  });
const vor = (ms: number) =>
  act(() => {
    vi.advanceTimersByTime(ms);
  });

/** Langsames Ziehen in Schritten; ruft `jeSchritt` nach jedem Schritt (vor dem Loslassen). */
async function ziehe(dx: number, dy: number, schritte: number, jeSchritt?: () => void) {
  await act(async () => {
    pd(200, 200);
    for (let i = 1; i <= schritte; i++) {
      pm(200 + dx * i, 200 + dy * i);
      jeSchritt?.();
    }
  });
}

describe('REQ-075 Drehen', () => {
  describe('AK-1 Startansicht', () => {
    const frontal = () => {
      const q = lage();
      // Lage = Identität: Drehwinkel 0 (q und −q beschreiben dieselbe Lage)
      expect(Math.abs(q[3])).toBeCloseTo(1, 6);
      expect(winkel(q)).toBeCloseTo(0, 4);
      // Cover zeigt frontal nach vorne, Oberkante nach oben, Schnitt nach rechts (weder geneigt noch gedreht)
      const n = (seite: string) => quatDrehen(q, normale(document.querySelector<HTMLElement>(`[data-modell3d] [data-flaeche="${seite}"]`)!.style.transform));
      const v = n('vorne');
      expect(v[0]).toBeCloseTo(0, 6);
      expect(v[1]).toBeCloseTo(0, 6);
      expect(v[2]).toBeCloseTo(1, 6);
      expect(n('oben')[1]).toBeCloseTo(-1, 6);
      expect(n('schnitt')[0]).toBeCloseTo(1, 6);
      // sichtbar ist nur das Cover; alle anderen Flächen höchstens als Kante (Normale senkrecht zur Blickrichtung oder abgewandt)
      expect([...sichtbar(1e-6)]).toEqual(['vorne']);
      for (const seite of ['oben', 'unten', 'ruecken', 'schnitt']) expect(Math.abs(n(seite)[2]), seite).toBeLessThan(1e-6);
    };

    it('[REQ-075/AK-1] Taschenbuch: Startansicht komplett gerade, Cover frontal nach vorne, weder geneigt noch gedreht', async () => {
      await oeffne3d();
      frontal();
    });

    it('[REQ-075/AK-1] auch beim Hardcover: Startansicht gerade und frontal', async () => {
      await oeffne3d({ unterformat: 'hardcover' });
      frontal();
    });

    it('[REQ-075/AK-1] nach Schließen und erneutem Öffnen wieder gerade (keine gemerkte Drehung)', async () => {
      await oeffne3d();
      await ziehe(20, 10, 5);
      await act(async () => void pu(300, 250));
      expect(winkel(lage())).toBeGreaterThan(0.1);
      await act(async () => void fireEvent.click(document.querySelector('[data-ansicht3d-schliessen]')!));
      await vi.waitFor(() => expect(document.querySelector('[data-ansicht3d]')).toBeNull(), W);
      const cover = document.querySelector<HTMLElement>('[data-bereich="cover"]')!;
      await act(async () => {
        fireEvent.click(cover);
        fireEvent.click(cover);
      });
      await screen.findByRole('dialog', { name: '3D-Ansicht' }, W);
      frontal();
    });
  });

  describe('AK-2 Frei drehen', () => {
    it('[REQ-075/AK-2] waagerecht ziehen: Drehung um die senkrechte Achse; Ziehen nach rechts bewegt die Vorderseite nach rechts', async () => {
      await oeffne3d();
      const q0 = lage();
      const x0 = vorneRichtung()[0];
      await ziehe(10, 0, 3);
      const a = deltaAchse(q0, lage());
      expect(Math.abs(a[1])).toBeGreaterThan(0.99);
      expect(vorneRichtung()[0]).toBeGreaterThan(x0);
    });

    it('[REQ-075/AK-2] senkrecht ziehen: Drehung um die waagerechte Achse; Ziehen nach unten bewegt die Vorderseite nach unten', async () => {
      await oeffne3d();
      const q0 = lage();
      const y0 = vorneRichtung()[1];
      await ziehe(0, 10, 3);
      const a = deltaAchse(q0, lage());
      expect(Math.abs(a[0])).toBeGreaterThan(0.99);
      expect(vorneRichtung()[1]).toBeGreaterThan(y0);
    });

    it('[REQ-075/AK-2] schräg ziehen: Drehachse schräg in der Bildebene (beide Anteile, kein z-Anteil)', async () => {
      await oeffne3d();
      const q0 = lage();
      await ziehe(8, 8, 3);
      const a = deltaAchse(q0, lage());
      expect(Math.abs(a[0])).toBeGreaterThan(0.5);
      expect(Math.abs(a[1])).toBeGreaterThan(0.5);
      expect(Math.abs(a[2])).toBeLessThan(0.1);
    });

    it('[REQ-075/AK-2] fortgesetzt waagerecht ziehen: nacheinander Rückseite, Rücken, Schnitt sichtbar, ohne Anschlag (mehr als eine volle Umdrehung)', async () => {
      await oeffne3d();
      const gesehen = new Set<string>();
      const xs: number[] = [];
      await ziehe(15, 0, 60, () => {
        sichtbar(0.3).forEach((s) => gesehen.add(s));
        xs.push(vorneRichtung()[0]);
      });
      for (const s of ['vorne', 'hinten', 'ruecken', 'schnitt']) expect(gesehen.has(s), s).toBe(true);
      // kein Anschlag: Lage ändert sich bis zum letzten Schritt
      expect(xs[xs.length - 1]).not.toBeCloseTo(xs[xs.length - 2], 3);
    });

    it('[REQ-075/AK-2] fortgesetzt senkrecht ziehen: Ober- und Unterkante sowie Rückseite werden sichtbar, ohne Anschlag', async () => {
      await oeffne3d();
      const gesehen = new Set<string>();
      const ys: number[] = [];
      await ziehe(0, 15, 60, () => {
        sichtbar(0.3).forEach((s) => gesehen.add(s));
        ys.push(vorneRichtung()[1]);
      });
      for (const s of ['vorne', 'hinten', 'oben', 'unten']) expect(gesehen.has(s), s).toBe(true);
      expect(ys[ys.length - 1]).not.toBeCloseTo(ys[ys.length - 2], 3);
    });
  });

  describe('AK-3 Schwung', () => {
    /** Zügig ziehen (4 Schritte à 16 ms) und loslassen; liefert Lage vor dem Ziehen und beim Loslassen. */
    async function schwungZiehen(dx: number, dy: number) {
      fake();
      const q0 = lage();
      await act(async () => {
        pd(200, 200);
        for (let i = 1; i <= 4; i++) {
          vi.advanceTimersByTime(16);
          pm(200 + dx * i, 200 + dy * i);
        }
        vi.advanceTimersByTime(16);
        pu(200 + dx * 4, 200 + dy * 4);
      });
      return { q0, qLos: lage() };
    }

    it.each([
      ['nach rechts', 25, 0, 1],
      ['nach links', -25, 0, 1],
      ['nach oben', 0, -20, 0],
      ['nach unten', 0, 20, 0],
    ] as [string, number, number, 0 | 1][])('[REQ-075/AK-3] zügig %s ziehen und loslassen → Modell dreht danach um dieselbe Achse im selben Drehsinn weiter', async (_n, dx, dy, achse) => {
      await oeffne3d();
      const { q0, qLos } = await schwungZiehen(dx, dy);
      const zieh = deltaAchse(q0, qLos);
      expect(Math.abs(zieh[achse])).toBeGreaterThan(0.99);
      await vor(50);
      const q1 = lage();
      expect(winkel(quatMal(q1, konj(qLos)))).toBeGreaterThan(0.01);
      // gleiche Achse und gleicher Drehsinn wie beim Ziehen
      expect(punkt(deltaAchse(qLos, q1), zieh)).toBeGreaterThan(0.95);
      await vor(100);
      const q2 = lage();
      expect(punkt(deltaAchse(q1, q2), zieh)).toBeGreaterThan(0.95);
      // Gesamtwinkel seit dem Loslassen nimmt weiter zu
      expect(winkel(quatMal(q2, konj(qLos)))).toBeGreaterThan(winkel(quatMal(q1, konj(qLos))));
    });

    it('[REQ-075/AK-3] Gegenfall: ohne Ziehbewegung (nur antippen) dreht sich nichts', async () => {
      await oeffne3d();
      fake();
      const q0 = lage();
      await act(async () => {
        pd(200, 200);
        vi.advanceTimersByTime(16);
        pu(200, 200);
      });
      await vor(300);
      expect(winkel(quatMal(lage(), konj(q0)))).toBeLessThan(1e-6);
    });
  });

  describe('AK-4 Kein Zoom', () => {
    const groesse = () => {
      const m = modell();
      const flaechen = [...m.querySelectorAll<HTMLElement>('[data-flaeche]')].map((f) => `${f.style.width}x${f.style.height}|${f.style.transform}`);
      return { b: m.getAttribute('data-modell-breite'), h: m.getAttribute('data-modell-hoehe'), d: m.getAttribute('data-modell-dicke'), flaechen };
    };

    it('[REQ-075/AK-4] Zwei-Finger-Spreizen und -Zusammenziehen ändert die Größe des Modells nicht', async () => {
      await oeffne3d();
      const vorher = groesse();
      await act(async () => {
        pd(150, 200, 1);
        pd(250, 200, 2);
        for (let i = 1; i <= 5; i++) {
          pm(150 - 20 * i, 200, 1);
          pm(250 + 20 * i, 200, 2);
        }
        for (let i = 1; i <= 5; i++) {
          pm(50 + 15 * i, 200, 1);
          pm(350 - 15 * i, 200, 2);
        }
        pu(125, 200, 2);
        pu(275, 200, 1);
      });
      expect(groesse()).toEqual(vorher);
      expect(modell().style.transform).not.toMatch(/scale|matrix|translateZ|perspective/);
      const buehneStil = buehne().style;
      expect(buehneStil.transform ?? '').not.toMatch(/scale/);
      expect(buehneStil.getPropertyValue('zoom')).toBe('');
    });

    it('[REQ-075/AK-4] Pinch per Mausrad/Trackpad (wheel mit ctrlKey) ändert die Größe nicht', async () => {
      await oeffne3d();
      const vorher = groesse();
      const t0 = modell().style.transform;
      await act(async () => {
        fireEvent.wheel(buehne(), { deltaY: -200, ctrlKey: true });
        fireEvent.wheel(buehne(), { deltaY: 300 });
      });
      expect(groesse()).toEqual(vorher);
      expect(modell().style.transform).toBe(t0);
    });

    it('[REQ-075/AK-4] Drehen ändert die Größe des Modells nicht', async () => {
      await oeffne3d();
      const vorher = groesse();
      await ziehe(20, 15, 10);
      await act(async () => void pu(400, 350));
      const nachher = groesse();
      expect([nachher.b, nachher.h, nachher.d]).toEqual([vorher.b, vorher.h, vorher.d]);
      expect(modell().style.transform).not.toMatch(/scale/);
    });
  });
});
