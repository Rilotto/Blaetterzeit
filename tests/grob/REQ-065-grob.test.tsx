/**
 * Grober Test REQ-065 – Typografie und Proportionen (Fraunces, Schriftgrößenstufen).
 * Aufbau aus dem feinen Test tests/acceptance/REQ-065-typografie-cozy.test.tsx.
 */
import '@testing-library/jest-dom/vitest';
import { act, cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import App from '@/App';
import { InMemoryEinstellungRepository, type EinstellungRepository } from '@/storage';
import { schriftstufen, typografieVariablen } from '@/theme';

vi.mock('@/buecher/demodaten', () => ({ demoBuecher: [] }));
beforeEach(() => localStorage.clear());
afterEach(async () => {
  cleanup();
  localStorage.clear();
  await new Promise((r) => setTimeout(r, 50));
});

const W = { timeout: 3000 };
const nav = () => screen.getByRole('navigation', { name: 'Hauptnavigation' });
const wurzel = () => document.querySelector<HTMLElement>('[data-app-wurzel]')!;
async function tippe(el: Element) {
  await act(async () => {
    fireEvent.click(el);
    await new Promise((r) => setTimeout(r, 10));
  });
}
function starte(repo: EinstellungRepository = new InMemoryEinstellungRepository()) {
  render(<App einstellungRepository={repo} />);
  return repo;
}

it('[REQ-065/GROB] App-Schrift beginnt mit Fraunces; genau sechs Schriftgrößenstufen; „Deine Bücher“ in Stufe „Seite“', async () => {
  starte();
  expect(wurzel().style.getPropertyValue('--bz-schrift')).toMatch(/^\s*['"]?Fraunces/);
  const STUFEN = ['abschnitt', 'label', 'meta', 'seite', 'text', 'titel'];
  expect(Object.keys(schriftstufen).sort()).toEqual(STUFEN);
  expect(Object.keys(typografieVariablen()).filter((k) => k.startsWith('--bz-schriftgroesse-')).sort()).toEqual(STUFEN.map((s) => `--bz-schriftgroesse-${s}`));
  await tippe(within(nav()).getByRole('button', { name: 'Bücher' }));
  let n: HTMLElement | null = await screen.findByRole('heading', { name: 'Deine Bücher' }, W);
  expect(getComputedStyle(n).fontFamily).toMatch(/^['"]?Fraunces/);
  while (n && !n.style.fontSize) n = n.parentElement;
  expect(n?.style.fontSize).toBe('var(--bz-schriftgroesse-seite)');
});
