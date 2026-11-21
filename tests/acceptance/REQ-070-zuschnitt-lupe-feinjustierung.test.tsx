/**
 * Akzeptanztests REQ-070 – Zuschnitt: Lupe und Feinjustierung beim Ziehen eines Eckpunkts.
 * Abgeleitet aus dem REQ-Text. Schnittstellen laut Entwickler (Sprint 07):
 *  - Lupe [data-lupe][data-lupe-seite=links|rechts][data-lupe-zoom][data-lupe-x/-y][data-lupe-eckpunkt]
 *    mit [data-lupe-inhalt] (darin Bild und [data-rahmenlinie]) und [data-fadenkreuz]
 *  - zentrale Standardwerte LUPE und FEINJUSTIERUNG in src/buchdetails/feinjustierung.ts
 *  - Zeit über Date.now() oder Prop `uhr` an Zuschnitt; Ereignisse ohne Zeitabstand gelten als schnell (1:1)
 * Konkrete Standardwerte sind kein Akzeptanzkriterium: Geschwindigkeiten werden relativ zum Schwellwert gewählt.
 */
import '@testing-library/jest-dom/vitest';
import { act, cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import Zuschnitt from '@/buchdetails/Zuschnitt';
import { FEINJUSTIERUNG, LUPE } from '@/buchdetails/feinjustierung';
import BuchDetails from '@/views/BuchDetails';
import type { Buch } from '@/domain/buch';
import type { ImageStore } from '@/storage/ImageStore';
import { InMemoryBookRepository } from '@/storage/InMemoryBookRepository';

vi.mock('@/buecher/demodaten', () => ({ demoBuecher: [] }));

const PNG = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAIAAACQd1PeAAAADElEQVR4nGNgYPgPAAEDAQAIicLsAAAAAElFTkSuQmCC';
const B = 400; // Breite der Zuschnittfläche (jsdom ohne Layout)
const H = 600;
const W = { timeout: 3000 };
type Bereich = 'cover' | 'ruecken' | 'schnitt';

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

function layoutVorgeben() {
  vi.spyOn(Element.prototype, 'getBoundingClientRect').mockReturnValue({
    x: 0, y: 0, left: 0, top: 0, right: B, bottom: H, width: B, height: H, toJSON: () => ({}),
  } as DOMRect);
}
/** Steuerbare Uhr (ms). */
function uhrFake() {
  const u = { t: 1000, jetzt: () => u.t };
  return u;
}
function zeigeZuschnitt(bereich: Bereich = 'cover', uhr = uhrFake()) {
  layoutVorgeben();
  render(<Zuschnitt bild={PNG} bereich={bereich} uhr={uhr.jetzt} onBestaetigen={() => {}} onZurueck={() => {}} />);
  return { z: screen.getByRole('region', { name: 'Zuschnitt' }), uhr };
}
const lupe = () => document.querySelector<HTMLElement>('[data-lupe]');
const eck = (i: number) => document.querySelector<HTMLElement>(`[data-eckpunkt="${i}"]`)!;
const ex = (i: number) => Number(eck(i).getAttribute('data-x'));
const ey = (i: number) => Number(eck(i).getAttribute('data-y'));
const px = (v: string) => parseFloat(v);

const P = { pointerId: 1, isPrimary: true, button: 0, buttons: 1 };
async function runter(i: number, x = 100, y = 100) {
  await act(async () => {
    fireEvent.pointerDown(eck(i), { ...P, clientX: x, clientY: y });
  });
}
/** Finger auf (x, y) bewegen; vorher ms auf der Uhr vergehen lassen. */
async function bewege(x: number, y: number, uhr?: { t: number }, ms = 0) {
  if (uhr) uhr.t += ms;
  await act(async () => {
    fireEvent.pointerMove(window, { ...P, clientX: x, clientY: y });
  });
}
async function hoch(x = 100, y = 100) {
  await act(async () => {
    fireEvent.pointerUp(window, { ...P, clientX: x, clientY: y, buttons: 0 });
  });
}
/** Geschwindigkeit in px/ms → Zeit für die Strecke. */
const zeitFuer = (strecke: number, tempo: number) => strecke / tempo;

describe('REQ-070 Lupe und Feinjustierung', () => {
  describe('AK-1 Lupe nur während des Ziehens', () => {
    it('[REQ-070/AK-1] ohne Ziehen keine Lupe; beim Ziehen sichtbar; nach Loslassen wieder weg', async () => {
      zeigeZuschnitt();
      expect(lupe()).toBeNull();
      await runter(0);
      expect(lupe()).not.toBeNull();
      await bewege(110, 110);
      expect(lupe()).not.toBeNull();
      await hoch(110, 110);
      expect(lupe()).toBeNull();
    });

    it('[REQ-070/AK-1] Abbruch der Berührung (pointercancel) blendet die Lupe ebenfalls aus', async () => {
      zeigeZuschnitt();
      await runter(2);
      expect(lupe()).not.toBeNull();
      await act(async () => {
        fireEvent.pointerCancel(window, { ...P });
      });
      expect(lupe()).toBeNull();
    });

    it('[REQ-070/AK-1] nach Loslassen bewegt weiteres Fingerbewegen weder Eckpunkt noch Lupe', async () => {
      zeigeZuschnitt();
      await runter(1);
      await hoch();
      const x = ex(1);
      await bewege(200, 200);
      expect(ex(1)).toBe(x);
      expect(lupe()).toBeNull();
    });
  });

  describe('AK-2 Lupe oben auf der gegenüberliegenden Seite', () => {
    it.each([0, 3])('[REQ-070/AK-2] Eckpunkt %i (linke Hälfte) → Lupe oben rechts', async (i) => {
      zeigeZuschnitt();
      expect(ex(i)).toBeLessThan(0.5);
      await runter(i);
      const l = lupe()!;
      expect(l).toHaveAttribute('data-lupe-seite', 'rechts');
      expect(l.style.right).not.toBe('');
      expect(l.style.left).toBe('');
      expect(px(l.style.top)).toBeLessThan(H / 4);
    });

    it.each([1, 2])('[REQ-070/AK-2] Eckpunkt %i (rechte Hälfte) → Lupe oben links', async (i) => {
      zeigeZuschnitt();
      expect(ex(i)).toBeGreaterThan(0.5);
      await runter(i);
      const l = lupe()!;
      expect(l).toHaveAttribute('data-lupe-seite', 'links');
      expect(l.style.left).not.toBe('');
      expect(l.style.right).toBe('');
      expect(px(l.style.top)).toBeLessThan(H / 4);
    });
  });

  describe('AK-3 Rund, vergrößert, Rahmenlinien, Fadenkreuz', () => {
    it('[REQ-070/AK-3] Lupe ist rund und hat die zentrale Standardgröße', async () => {
      zeigeZuschnitt();
      await runter(0);
      const l = lupe()!;
      expect(l.style.borderRadius).toBe('50%');
      expect(px(l.style.width)).toBe(LUPE.durchmesser);
      expect(px(l.style.height)).toBe(LUPE.durchmesser);
      expect(l.style.overflow).toBe('hidden');
    });

    it('[REQ-070/AK-3] Inhalt: dasselbe Bild um den Zoomfaktor vergrößert, mit Rahmenlinien, Eckpunkt in der Mitte, Fadenkreuz', async () => {
      zeigeZuschnitt();
      await runter(0);
      const l = lupe()!;
      expect(l).toHaveAttribute('data-lupe-zoom', String(LUPE.zoom));
      expect(l).toHaveAttribute('data-lupe-eckpunkt', '0');
      const inhalt = l.querySelector<HTMLElement>('[data-lupe-inhalt]')!;
      expect(inhalt.querySelector('img')).toHaveAttribute('src', PNG);
      expect(px(inhalt.style.width)).toBeCloseTo(B * LUPE.zoom, 3);
      expect(px(inhalt.style.height)).toBeCloseTo(H * LUPE.zoom, 3);
      expect(inhalt.querySelector('[data-rahmenlinie]')).not.toBeNull();
      // Eckpunkt liegt in der Mitte der Lupe (Toleranz Rahmenbreite)
      const mitteX = px(inhalt.style.left) + ex(0) * B * LUPE.zoom;
      const mitteY = px(inhalt.style.top) + ey(0) * H * LUPE.zoom;
      expect(Math.abs(mitteX - LUPE.durchmesser / 2)).toBeLessThanOrEqual(3);
      expect(Math.abs(mitteY - LUPE.durchmesser / 2)).toBeLessThanOrEqual(3);
      const kreuz = l.querySelector<HTMLElement>('[data-fadenkreuz]')!;
      expect(kreuz).not.toBeNull();
      expect(kreuz.children.length).toBeGreaterThanOrEqual(2);
    });

    it('[REQ-070/AK-3] Rahmenlinien in der Lupe entsprechen den aktuellen Ecken des Zuschnitts', async () => {
      zeigeZuschnitt();
      await runter(0);
      const innen = lupe()!.querySelector('[data-lupe-inhalt] [data-rahmenlinie]')!.getAttribute('points');
      const aussen = Array.from(document.querySelectorAll('[data-rahmenlinie]')).find((e) => !e.closest('[data-lupe]'))!.getAttribute('points');
      expect(innen).toBe(aussen);
    });
  });

  describe('AK-4 Lupe folgt dem Eckpunkt', () => {
    it('[REQ-070/AK-4] nach Bewegung zeigt die Lupe die neue Position, Fadenkreuz bleibt auf dem Eckpunkt', async () => {
      zeigeZuschnitt();
      await runter(0);
      const vorherLeft = px(lupe()!.querySelector<HTMLElement>('[data-lupe-inhalt]')!.style.left);
      await bewege(140, 130);
      await bewege(160, 150);
      const l = lupe()!;
      expect(Number(l.getAttribute('data-lupe-x'))).toBeCloseTo(ex(0), 3);
      expect(Number(l.getAttribute('data-lupe-y'))).toBeCloseTo(ey(0), 3);
      const inhalt = l.querySelector<HTMLElement>('[data-lupe-inhalt]')!;
      expect(px(inhalt.style.left)).not.toBeCloseTo(vorherLeft, 1);
      expect(Math.abs(px(inhalt.style.left) + ex(0) * B * LUPE.zoom - LUPE.durchmesser / 2)).toBeLessThanOrEqual(3);
      expect(Math.abs(px(inhalt.style.top) + ey(0) * H * LUPE.zoom - LUPE.durchmesser / 2)).toBeLessThanOrEqual(3);
      // Rahmenlinie in der Lupe folgt ebenfalls
      const innen = l.querySelector('[data-rahmenlinie]')!.getAttribute('points')!;
      const aussen = Array.from(document.querySelectorAll('[data-rahmenlinie]')).find((e) => !e.closest('[data-lupe]'))!.getAttribute('points');
      expect(innen).toBe(aussen);
      expect(Number(innen.split(/[ ,]/)[0]) / 100).toBeCloseTo(ex(0), 3);
    });
  });

  describe('AK-5 Gilt für Cover, Buchrücken und Schnitt', () => {
    const bilder = { get: async () => undefined, put: async () => {}, remove: async () => {} } as unknown as ImageStore;
    it.each(['cover', 'ruecken', 'schnitt'] as const)('[REQ-070/AK-5] über Bereich %s geöffnet: Lupe erscheint und langsame Bewegung wird feiner', async (b) => {
      let t = 5000;
      vi.spyOn(Date, 'now').mockImplementation(() => t);
      const repo = new InMemoryBookRepository();
      const buch: Buch = { id: crypto.randomUUID(), titel: 'Momo', status: 'ungelesen' };
      await repo.save(buch);
      render(<BuchDetails buchId={buch.id} repository={repo} bildspeicher={bilder} bildquelle={{ scannen: async () => PNG, galerie: async () => PNG }} onZurueck={() => {}} />);
      await screen.findByRole('region', { name: 'Buchdetails' });
      const el = await vi.waitFor(() => {
        const e = document.querySelector<HTMLElement>(`[data-bereich="${b}"]`);
        expect(e).not.toBeNull();
        return e!;
      }, W);
      fireEvent.click(el);
      const m = await screen.findByRole('menu', { name: 'Bild hinzufügen' }, W);
      fireEvent.click(within(m).getByRole('menuitem', { name: 'Aus Galerie auswählen' }));
      await screen.findByRole('region', { name: 'Zuschnitt' }, W);
      layoutVorgeben();
      expect(lupe()).toBeNull();
      await runter(0);
      expect(lupe()).not.toBeNull();
      const x0 = ex(0);
      const strecke = 20;
      t += zeitFuer(strecke, FEINJUSTIERUNG.schwelle / 4);
      await bewege(100 + strecke, 100);
      const verschoben = (ex(0) - x0) * B;
      expect(verschoben).toBeGreaterThan(0);
      expect(verschoben).toBeLessThan(strecke);
      await hoch(100 + strecke, 100);
      expect(lupe()).toBeNull();
    });
  });

  describe('AK-6 Schnelle Bewegung 1:1', () => {
    it.each([
      [40, 0],
      [0, -30],
      [-25, 35],
    ])('[REQ-070/AK-6] schnell um (%i, %i) px: Eckpunkt verschiebt sich um dieselbe Strecke', async (dx, dy) => {
      const { uhr } = zeigeZuschnitt();
      await runter(2, 200, 300);
      const [x0, y0] = [ex(2), ey(2)];
      const ms = zeitFuer(Math.hypot(dx, dy), FEINJUSTIERUNG.schwelle * 4);
      await bewege(200 + dx, 300 + dy, uhr, ms);
      expect((ex(2) - x0) * B).toBeCloseTo(dx, 1);
      expect((ey(2) - y0) * H).toBeCloseTo(dy, 1);
    });

    it('[REQ-070/AK-6] Ereignisse ohne Zeitabstand gelten als schnell (1:1), auch über mehrere Schritte', async () => {
      zeigeZuschnitt();
      await runter(1, 100, 100);
      const x0 = ex(1);
      for (const x of [90, 80, 70, 60]) await bewege(x, 100);
      expect((ex(1) - x0) * B).toBeCloseTo(-40, 1);
    });

    it('[REQ-070/AK-6] nur der gezogene Eckpunkt bewegt sich', async () => {
      const { uhr } = zeigeZuschnitt();
      const vorher = [0, 1, 2, 3].map((i) => [ex(i), ey(i)]);
      await runter(3);
      await bewege(140, 60, uhr, 10);
      for (const i of [0, 1, 2]) expect([ex(i), ey(i)]).toEqual(vorher[i]);
      expect([ex(3), ey(3)]).not.toEqual(vorher[3]);
    });
  });

  describe('AK-7 Langsame Bewegung feiner', () => {
    it.each([
      [10, 0],
      [0, 12],
      [-8, -6],
    ])('[REQ-070/AK-7] langsam um (%i, %i) px: gleiche Richtung, kürzere Strecke (gemäß Faktor)', async (dx, dy) => {
      const { uhr } = zeigeZuschnitt();
      await runter(0, 200, 300);
      const [x0, y0] = [ex(0), ey(0)];
      const ms = zeitFuer(Math.hypot(dx, dy), FEINJUSTIERUNG.schwelle / 4);
      await bewege(200 + dx, 300 + dy, uhr, ms);
      const vx = (ex(0) - x0) * B;
      const vy = (ey(0) - y0) * H;
      expect(Math.hypot(vx, vy)).toBeGreaterThan(0);
      expect(Math.hypot(vx, vy)).toBeLessThan(Math.hypot(dx, dy));
      expect(Math.sign(vx)).toBe(Math.sign(dx));
      expect(Math.sign(vy)).toBe(Math.sign(dy));
      expect(vx).toBeCloseTo(dx * FEINJUSTIERUNG.faktor, 1);
      expect(vy).toBeCloseTo(dy * FEINJUSTIERUNG.faktor, 1);
    });

    it('[REQ-070/AK-7] Faktor ist kleiner als 1', () => {
      expect(FEINJUSTIERUNG.faktor).toBeGreaterThan(0);
      expect(FEINJUSTIERUNG.faktor).toBeLessThan(1);
    });

    it('[REQ-070/AK-6] [REQ-070/AK-7] gemischt: erst langsam (fein), dann schnell (1:1) – Summe stimmt', async () => {
      const { uhr } = zeigeZuschnitt();
      await runter(0, 200, 300);
      const x0 = ex(0);
      await bewege(210, 300, uhr, zeitFuer(10, FEINJUSTIERUNG.schwelle / 4));
      await bewege(250, 300, uhr, zeitFuer(40, FEINJUSTIERUNG.schwelle * 4));
      expect((ex(0) - x0) * B).toBeCloseTo(10 * FEINJUSTIERUNG.faktor + 40, 1);
    });
  });

  describe('AK-8 Zentrale Standardwerte', () => {
    const lupeW = LUPE as unknown as { durchmesser: number; zoom: number };
    const feinW = FEINJUSTIERUNG as unknown as { schwelle: number; faktor: number };

    it('[REQ-070/AK-8] geänderte Lupengröße und Zoomfaktor wirken ohne weitere Änderungen', async () => {
      const alt = { ...lupeW };
      lupeW.durchmesser = 150;
      lupeW.zoom = 5;
      try {
        zeigeZuschnitt();
        await runter(0);
        const l = lupe()!;
        expect(px(l.style.width)).toBe(150);
        expect(l).toHaveAttribute('data-lupe-zoom', '5');
        expect(px(l.querySelector<HTMLElement>('[data-lupe-inhalt]')!.style.width)).toBeCloseTo(B * 5, 3);
      } finally {
        Object.assign(lupeW, alt);
      }
    });

    it('[REQ-070/AK-8] geänderter Faktor und Schwellwert wirken ohne weitere Änderungen', async () => {
      const alt = { ...feinW };
      try {
        feinW.faktor = 0.5;
        feinW.schwelle = 1;
        const { uhr } = zeigeZuschnitt();
        await runter(0, 200, 300);
        const x0 = ex(0);
        // 0,5 px/ms: unter neuer Schwelle 1 → langsam → Faktor 0,5
        await bewege(220, 300, uhr, 40);
        expect((ex(0) - x0) * B).toBeCloseTo(10, 1);
        // gleiche Bewegung mit Schwelle 0,1 → schnell → 1:1
        feinW.schwelle = 0.1;
        const x1 = ex(0);
        await bewege(240, 300, uhr, 40);
        expect((ex(0) - x1) * B).toBeCloseTo(20, 1);
      } finally {
        Object.assign(feinW, alt);
      }
    });
  });
});
