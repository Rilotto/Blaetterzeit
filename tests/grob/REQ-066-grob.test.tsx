/**
 * Grober Test REQ-066 – Profil: Abschnitt „App“ mit Zeile „Design“.
 * Aufbau aus dem feinen Test tests/acceptance/REQ-066-profil-abschnitt-app.test.tsx.
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
const anzeige = () => (document.querySelector('[data-profil-zeile="design"] [data-design-anzeige]')?.textContent ?? '').replace(/\s+/g, ' ').trim();

it('[REQ-066/GROB] Profil zeigt Zeile „Design“ mit „Klassisch · Fraunces · Klassisch ›“; Antippen öffnet das Fenster „Design“', async () => {
  starte();
  const zeile = await profil();
  expect(within(screen.getByRole('main')).getByText(/^App$/i)).toBeInTheDocument();
  await vi.waitFor(() => expect(anzeige()).toBe('Klassisch · Fraunces · Klassisch ›'), W);
  await tippe(zeile);
  expect(await screen.findByRole('dialog', { name: 'Design' }, W)).toBeInTheDocument();
});
