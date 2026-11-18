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
const zeilen = () => Array.from(fenster()!.querySelectorAll<HTMLElement>('button[data-farbdesign]')).map((z) => z.getAttribute('data-farbdesign'));

it('[REQ-068/GROB] drei Designs; „Nachtlektüre“ wirkt sofort und bleibt nach Neustart aktiv', async () => {
  const repo = starte();
  await oeffneDesign();
  expect(zeilen()).toEqual(['klassisch', 'salbei', 'nachtlektuere']);
  expect(wurzel()).toHaveAttribute('data-farbdesign', 'klassisch');
  await tippe(fenster()!.querySelector('button[data-farbdesign="nachtlektuere"]')!);
  expect(wurzel()).toHaveAttribute('data-farbdesign', 'nachtlektuere');
  expect(wurzel().style.getPropertyValue('--bz-farbe-hintergrund')).toBe(farbdesigns.nachtlektuere.werte.hintergrund);
  expect(await repo.lesen('farbdesign')).toBe('nachtlektuere');
  cleanup();
  starte(repo);
  await vi.waitFor(() => expect(wurzel()).toHaveAttribute('data-farbdesign', 'nachtlektuere'), W);
});
