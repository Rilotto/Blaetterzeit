/**
 * Grober Test REQ-068 – Farbdesigns.
 * Aufbau aus dem feinen Test tests/acceptance/REQ-068-farbdesigns.test.tsx.
 */
import '@testing-library/jest-dom/vitest';
import { act, cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import App from '@/App';
import { InMemoryEinstellungRepository, type EinstellungRepository } from '@/storage';
import { farbdesigns } from '@/theme';

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
const fenster = () => screen.queryByRole('dialog', { name: 'Design' });
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
/** Profil öffnen und Zeile „Design“ liefern. */
async function profil() {
  await tippe(within(nav()).getByRole('button', { name: 'Profil' }));
  return vi.waitFor(() => {
    const z = document.querySelector<HTMLElement>('[data-profil-zeile="design"]');
    expect(z).not.toBeNull();
    return z!;
  }, W);
}
async function oeffneDesign() {
  await tippe(await profil());
  return screen.findByRole('dialog', { name: 'Design' }, W);
}
function sichtbar(e: Element | null): boolean {
  for (let n: Element | null = e; n; n = n.parentElement) {
    if (n.hasAttribute('hidden') || n.getAttribute('aria-hidden') === 'true') return false;
    const st = getComputedStyle(n);
    if (st.display === 'none' || st.visibility === 'hidden') return false;
  }
  return true;
}
const zeilen = () =>
  Array.from(fenster()!.querySelectorAll<HTMLElement>('button[data-farbdesign]'))
    .filter(sichtbar)
    .map((z) => z.getAttribute('data-farbdesign'));
function pille(name: 'Hell' | 'Dunkel') {
  for (const rolle of ['tab', 'radio', 'button'] as const) {
    const t = within(fenster()!).queryAllByRole(rolle, { name }).filter(sichtbar);
    if (t.length === 1) return t[0];
  }
  throw new Error(`Pille „${name}“ nicht gefunden`);
}

it('[REQ-068/GROB] sieben Designs nach Hell/Dunkel; „Nachtlektüre“ wirkt sofort und bleibt nach Neustart aktiv', async () => {
  const repo = starte();
  await oeffneDesign();
  await tippe(pille('Hell'));
  expect(zeilen()).toEqual(['klassisch', 'salbei', 'raureif', 'minztraube']);
  await tippe(pille('Dunkel'));
  expect(zeilen()).toEqual(['nachtlektuere', 'polarnacht', 'traubennacht']);
  expect(wurzel()).toHaveAttribute('data-farbdesign', 'klassisch');
  await tippe(fenster()!.querySelector('button[data-farbdesign="nachtlektuere"]')!);
  expect(wurzel()).toHaveAttribute('data-farbdesign', 'nachtlektuere');
  expect(wurzel().style.getPropertyValue('--bz-farbe-hintergrund')).toBe(farbdesigns.nachtlektuere.werte.hintergrund);
  expect(await repo.lesen('farbdesign')).toBe('nachtlektuere');
  cleanup();
  starte(repo);
  await vi.waitFor(() => expect(wurzel()).toHaveAttribute('data-farbdesign', 'nachtlektuere'), W);
});
