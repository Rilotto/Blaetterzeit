/**
 * Grober Test REQ-069 – Schriftauswahl.
 * Aufbau aus dem feinen Test tests/acceptance/REQ-069-schriftauswahl.test.tsx.
 */
import '@testing-library/jest-dom/vitest';
import { act, cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import App from '@/App';
import { InMemoryEinstellungRepository, type EinstellungRepository } from '@/storage';
import { schriften } from '@/theme';

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
const ohneQuotes = (s: string) => s.replace(/["']/g, '').replace(/\s*,\s*/g, ',').trim();
const navSchrift = () => ohneQuotes(getComputedStyle(within(nav()).getByText('Bücher')).fontFamily);

it('[REQ-069/GROB] „Systemschrift“ wählen wirkt sofort und bleibt nach Neustart aktiv', async () => {
  const repo = starte();
  const f = await oeffneDesign();
  await tippe(f.querySelector('[data-design-reiter="schriftart"]')!);
  expect(fenster()!.querySelector('button[data-schrift-zeile="fraunces"] [data-haken]')).not.toBeNull();
  await tippe(fenster()!.querySelector('button[data-schrift-zeile="system"]')!);
  expect(wurzel()).toHaveAttribute('data-schrift', 'system');
  expect(navSchrift()).toBe(ohneQuotes(schriften.system.folge));
  expect(await repo.lesen('schrift')).toBe('system');
  cleanup();
  starte(repo);
  await vi.waitFor(() => expect(wurzel()).toHaveAttribute('data-schrift', 'system'), W);
});
