import '@testing-library/jest-dom/vitest';
import { cleanup, render, screen, within } from '@testing-library/react';
import { afterEach, expect, it } from 'vitest';
import App from '@/App';
import { farbrubriken } from '@/theme';

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
