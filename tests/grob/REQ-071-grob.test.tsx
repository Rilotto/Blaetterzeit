/**
 * Grober Test REQ-071 – Design-Stil „Feuilleton“.
 * Aufbau aus dem feinen Test tests/acceptance/REQ-071-design-stil-feuilleton.test.tsx.
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
const zeile = (id: string) => fenster()!.querySelector<HTMLElement>(`button[data-stil-zeile="${id}"]`)!;
/** Berechnete Linie oben der Hauptnavigation (Rahmen oder Innenschatten) – Feuilleton ändert sie. */
const navLinie = () => {
  const s = getComputedStyle(nav());
  return [s.borderTopStyle, s.borderTopWidth, s.borderTopColor, s.boxShadow].join('|');
};
async function tippe(el: Element) {
  await act(async () => {
    fireEvent.click(el);
    await new Promise((r) => setTimeout(r, 15));
  });
}
function starte(repo: EinstellungRepository = new InMemoryEinstellungRepository()) {
  render(<App einstellungRepository={repo} />);
  return repo;
}
async function oeffneStil() {
  await tippe(within(nav()).getByRole('button', { name: 'Profil' }));
  const z = await vi.waitFor(() => {
    const e = document.querySelector<HTMLElement>('[data-profil-zeile="design"]');
    expect(e).not.toBeNull();
    return e!;
  }, W);
  await tippe(z);
  const f = await screen.findByRole('dialog', { name: 'Design' }, W);
  await tippe(f.querySelector('[data-design-reiter="stil"]')!);
  await vi.waitFor(() => expect(f.querySelector('[data-design-liste="stil"]')).not.toBeNull(), W);
  return f;
}

it('[REQ-071/GROB] „Feuilleton“ wählen wirkt sofort und bleibt nach Neustart aktiv', async () => {
  const repo = starte();
  await oeffneStil();
  expect(wurzel()).toHaveAttribute('data-stil', 'klassisch');
  expect(zeile('klassisch').querySelector('[data-haken]')).not.toBeNull();
  const vorher = navLinie();
  await tippe(zeile('feuilleton'));
  expect(wurzel()).toHaveAttribute('data-stil', 'feuilleton');
  expect(zeile('feuilleton').querySelector('[data-haken]')).not.toBeNull();
  expect(navLinie()).not.toBe(vorher);
  await vi.waitFor(async () => expect(await repo.lesen('stil')).toBe('feuilleton'), W);
  cleanup();
  starte(repo);
  await vi.waitFor(() => expect(wurzel()).toHaveAttribute('data-stil', 'feuilleton'), W);
});
