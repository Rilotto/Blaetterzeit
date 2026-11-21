/**
 * Grober Test REQ-070 – Zuschnitt: Lupe beim Ziehen eines Eckpunkts.
 * Aufbau aus dem feinen Test tests/acceptance/REQ-070-zuschnitt-lupe-feinjustierung.test.tsx.
 */
import '@testing-library/jest-dom/vitest';
import { act, cleanup, fireEvent, render } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import Zuschnitt from '@/buchdetails/Zuschnitt';

vi.mock('@/buecher/demodaten', () => ({ demoBuecher: [] }));
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

const PNG = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAIAAACQd1PeAAAADElEQVR4nGNgYPgPAAEDAQAIicLsAAAAAElFTkSuQmCC';
const P = { pointerId: 1, isPrimary: true, button: 0, buttons: 1 };
const lupe = () => document.querySelector<HTMLElement>('[data-lupe]');
const eck = (i: number) => document.querySelector<HTMLElement>(`[data-eckpunkt="${i}"]`)!;

it('[REQ-070/GROB] Lupe erscheint beim Ziehen eines Eckpunkts, folgt ihm und verschwindet beim Loslassen', async () => {
  vi.spyOn(Element.prototype, 'getBoundingClientRect').mockReturnValue({
    x: 0, y: 0, left: 0, top: 0, right: 400, bottom: 600, width: 400, height: 600, toJSON: () => ({}),
  } as DOMRect);
  render(<Zuschnitt bild={PNG} bereich="cover" onBestaetigen={() => {}} onZurueck={() => {}} />);
  expect(lupe()).toBeNull();
  await act(async () => {
    fireEvent.pointerDown(eck(0), { ...P, clientX: 100, clientY: 100 });
  });
  expect(lupe()).not.toBeNull();
  expect(lupe()).toHaveAttribute('data-lupe-seite', 'rechts');
  expect(lupe()!.querySelector('[data-fadenkreuz]')).not.toBeNull();
  await act(async () => {
    fireEvent.pointerMove(window, { ...P, clientX: 160, clientY: 150 });
  });
  expect(Number(lupe()!.getAttribute('data-lupe-x'))).toBeCloseTo(Number(eck(0).getAttribute('data-x')), 3);
  await act(async () => {
    fireEvent.pointerUp(window, { ...P, clientX: 160, clientY: 150, buttons: 0 });
  });
  expect(lupe()).toBeNull();
});
