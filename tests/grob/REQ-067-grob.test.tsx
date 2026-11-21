/**
 * Grober Test REQ-067 – Fenster „Design“.
 * Aufbau aus dem feinen Test tests/acceptance/REQ-067-fenster-design.test.tsx.
 */
import '@testing-library/jest-dom/vitest';
import { act, cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import App from '@/App';
import { InMemoryEinstellungRepository, type EinstellungRepository } from '@/storage';

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
const reiter = (id: string) => fenster()!.querySelector<HTMLElement>(`[data-design-reiter="${id}"]`)!;
const anzahl = (sel: string) => fenster()!.querySelectorAll(sel).length;

it('[REQ-067/GROB] Fenster öffnet mit „Farben“; „Schriftart“ zeigt die Schriftliste; X schließt, Wahl bleibt', async () => {
  starte();
  await oeffneDesign();
  expect(fenster()!.querySelector('[data-design-vorschau]')).not.toBeNull();
  expect(reiter('farben')).toHaveAttribute('aria-selected', 'true');
  expect(anzahl('button[data-farbdesign]')).toBeGreaterThan(0);
  await tippe(fenster()!.querySelector('button[data-farbdesign="salbei"]')!);
  await tippe(reiter('schriftart'));
  expect(reiter('schriftart')).toHaveAttribute('aria-selected', 'true');
  expect(anzahl('button[data-schrift-zeile]')).toBeGreaterThan(0);
  expect(anzahl('button[data-farbdesign]')).toBe(0);
  await tippe(fenster()!.querySelector('[data-design-schliessen]')!);
  await vi.waitFor(() => expect(fenster()).toBeNull(), W);
  expect(wurzel()).toHaveAttribute('data-farbdesign', 'salbei');
});
