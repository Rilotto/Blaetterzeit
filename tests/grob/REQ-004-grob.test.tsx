import '@testing-library/jest-dom/vitest';
import { cleanup, render, screen, within } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import App from '@/App';
import { farbrubriken } from '@/theme';

// Sprint 10 Teil C: Seit REQ-101 hat „Start“ eine Zielansicht; kein Menüpunkt ist mehr ohne Zielansicht.
// Die Bedingung „Zielansicht noch nicht definiert“ (REQ-002 AK-12, REQ-004) wird deshalb simuliert: „Start“ bekommt
// für diese Datei die Platzhalteransicht der App. Die Startseite selbst prüfen die Tests zu REQ-101.
vi.mock('@/views', async (importOriginal) => {
  const orig = await importOriginal<typeof import('@/views')>();
  const { default: UnderConstruction } = await import('@/views/UnderConstruction');
  return { ...orig, ansichten: { ...orig.ansichten, start: UnderConstruction } };
});

afterEach(() => cleanup());

function farbe(ctx: HTMLElement, ausdruck: string) {
  const p = document.createElement('span');
  p.style.setProperty('color', ausdruck);
  ctx.appendChild(p);
  const w = getComputedStyle(p).color;
  p.remove();
  return w;
}

it('[REQ-004/GROB] Platzhaltertext steht in der Farbrubrik Tertiär und hebt sich vom Hintergrund ab', () => {
  const { container } = render(<App />);
  const wurzel = container.querySelector<HTMLElement>('[data-app-wurzel]')!;
  const text = within(screen.getByRole('main')).getByText('under construction :)');
  expect(getComputedStyle(text).color).toBe(farbe(wurzel, farbrubriken.tertiaer.wert));
  expect(getComputedStyle(text).color).not.toBe(farbe(wurzel, farbrubriken.hintergrund.wert));
});
