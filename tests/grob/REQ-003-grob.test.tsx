import '@testing-library/jest-dom/vitest';
import { cleanup, render } from '@testing-library/react';
import { afterEach, expect, it } from 'vitest';
import App from '@/App';
import { appSchrift } from '@/theme';

afterEach(() => cleanup());

const GENERISCH = ['serif', 'sans-serif', 'monospace', 'cursive', 'fantasy', 'system-ui', 'ui-serif', 'ui-sans-serif', 'ui-monospace', 'ui-rounded'];

it('[REQ-003/GROB] App-Wurzel nutzt die zentrale App-Schrift, die mit einer generischen Ersatzschrift endet', () => {
  const { container } = render(<App />);
  const wurzel = container.querySelector<HTMLElement>('[data-app-wurzel]')!;
  expect(wurzel.style.fontFamily.replace(/\s+/g, '')).toBe('var(--bz-schrift)');
  expect(getComputedStyle(wurzel).getPropertyValue('--bz-schrift').trim()).toBe(appSchrift);
  const letzte = appSchrift.split(',').pop()!.trim().replace(/['"]/g, '');
  expect(GENERISCH).toContain(letzte);
});
