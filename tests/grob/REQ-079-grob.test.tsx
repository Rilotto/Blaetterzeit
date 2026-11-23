/**
 * Grober Test REQ-079 – Statistik: Kopf „Dein Lesen“ und gemerkte Zeitraum-Pillen.
 * Aufbau aus dem feinen Test tests/acceptance/REQ-079-statistik-kopf-und-pillen.test.tsx.
 */
import '@testing-library/jest-dom/vitest';
import { act, cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import App from '@/App';
import { InMemoryEinstellungRepository } from '@/storage';

vi.mock('@/buecher/demodaten', () => ({ demoBuecher: [] }));
beforeEach(() => localStorage.clear());
afterEach(() => {
  cleanup();
  localStorage.clear();
});

const W = { timeout: 4000 };
const $ = (s: string) => document.querySelector<HTMLElement>(s);
const $$ = (s: string) => Array.from(document.querySelectorAll<HTMLElement>(s));
const norm = (t: string | null | undefined) => (t ?? '').replace(/[\s  ]+/g, ' ').trim();
const aktive = () => $$('[data-zeitraum-pille]').filter((p) => p.getAttribute('aria-pressed') === 'true').map((p) => norm(p.textContent));
async function tippe(el: Element | null) {
  expect(el).not.toBeNull();
  await act(async () => {
    fireEvent.click(el!);
    await new Promise((r) => setTimeout(r, 30));
  });
}
async function statistik(repo: InMemoryEinstellungRepository) {
  render(<App einstellungRepository={repo} />);
  await tippe(within(screen.getByRole('navigation', { name: 'Hauptnavigation' })).getByRole('button', { name: 'Statistik' }));
  await waitFor(() => expect($('[data-zeitraum-pille]')).not.toBeNull(), W);
}

it('[REQ-079/GROB] „Dein Lesen“ ohne Teilen, drei Pillen (Erststart „Wöchentlich“), Wahl „Jährlich“ bleibt nach Neustart', async () => {
  const repo = new InMemoryEinstellungRepository();
  await statistik(repo);
  const seite = $('[data-seite="statistik"]')!;
  expect(within(seite).getByRole('heading', { name: 'Dein Lesen' })).toBeInTheDocument();
  expect(screen.getByRole('main').textContent).not.toContain('under construction :)');
  expect(seite.textContent).not.toMatch(/teilen|share/i);
  expect($$('[data-zeitraum-pille]').map((p) => norm(p.textContent))).toEqual(['Wöchentlich', 'Monatlich', 'Jährlich']);
  await waitFor(() => expect(aktive()).toEqual(['Wöchentlich']), W);
  await tippe($('[data-zeitraum-pille="jahr"]'));
  expect(aktive()).toEqual(['Jährlich']);
  cleanup();
  await statistik(repo);
  await waitFor(() => expect(aktive()).toEqual(['Jährlich']), W);
  expect(norm($('[data-zeitraum-zeile1]')?.textContent)).toBe(String(new Date().getFullYear()));
});
