/**
 * Grober Test REQ-055 – Details: Sammlungen und Bibliotheken.
 * Aufbau aus dem feinen Test tests/acceptance/REQ-055-details-sammlungen-bibliotheken.test.tsx.
 */
import '@testing-library/jest-dom/vitest';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import type { Buch } from '@/domain/buch';
import type { ImageStore } from '@/storage';
import { InMemoryBookRepository } from '@/storage/InMemoryBookRepository';
import BuchDetails from '@/views/BuchDetails';

vi.mock('@/buecher/demodaten', () => ({ demoBuecher: [] }));
afterEach(() => cleanup());

const W = { timeout: 3000 };
const buch = (f: Partial<Buch> = {}): Buch => ({ id: crypto.randomUUID(), titel: 'Der Testroman', status: 'ungelesen', ...f });
const bilder = { get: async () => undefined, put: async () => {}, remove: async () => {} } as unknown as ImageStore;
async function tippe(el: Element) {
  await act(async () => {
    fireEvent.click(el);
    await new Promise((r) => setTimeout(r, 10));
  });
}
/** Buchdetails mit Reiter „Details“ öffnen. */
async function details(b: Buch = buch()) {
  const repo = new InMemoryBookRepository();
  await repo.save(b);
  render(<BuchDetails buchId={b.id} repository={repo} bildspeicher={bilder} bildquelle={{ scannen: async () => null, galerie: async () => null }} onZurueck={() => {}} />);
  const d = await screen.findByRole('region', { name: 'Buchdetails' });
  await vi.waitFor(() => expect(d.querySelector('[data-reiter="details"]')).not.toBeNull(), W);
  await tippe(d.querySelector('[data-reiter="details"]')!);
  await vi.waitFor(() => expect(d.querySelector('[data-reiter-bereich="details"]')).not.toBeNull(), W);
  return { d, repo, id: b.id };
}
const norm = (t: string | null | undefined) => (t ?? '').replace(/[\s  ]+/g, ' ').trim();
const bereich = (d: HTMLElement) => d.querySelector<HTMLElement>('[data-reiter-bereich="details"]')!;
const abschnitt = (d: HTMLElement, id: string) => bereich(d).querySelector<HTMLElement>(`[data-details-abschnitt="${id}"]`)!;

// Fassung 2026-11-23: REQ-055 ist durch REQ-095 bis REQ-097 abgelöst (Abschnitt umbenannt, Pille mit Funktion).
void abschnitt;
it('[REQ-055/GROB] Abschnitt „Sagas, Sammlungen und Bibliotheken“; „+ Zu einer Sammlung hinzufügen“ öffnet ein Blatt, keine Karte „In Bibliotheken“ ohne Liste', async () => {
  const { d, repo, id } = await details();
  const hs = Array.from(bereich(d).querySelectorAll('h1, h2, h3, h4, [role="heading"]')).map((h) => norm(h.textContent));
  expect(hs).toContain('Sagas, Sammlungen und Bibliotheken');
  expect(hs).not.toContain('Sammlungen und Bibliotheken');
  expect(bereich(d).textContent).not.toMatch(/In Bibliotheken/);
  const pille = Array.from(bereich(d).querySelectorAll<HTMLElement>('button, [role="button"]')).find((b) => norm(b.textContent) === '+ Zu einer Sammlung hinzufügen');
  expect(pille).toBeDefined();
  const vorher = JSON.stringify(await repo.get(id));
  await tippe(pille!);
  await vi.waitFor(() => expect(document.querySelectorAll('[role="dialog"]').length).toBeGreaterThan(0));
  expect(JSON.stringify(await repo.get(id))).toBe(vorher);
});
