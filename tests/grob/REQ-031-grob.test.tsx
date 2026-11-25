import '@testing-library/jest-dom/vitest';
import { act, cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import type { Buch } from '@/domain/buch';
import type { BookRepository, ImageStore } from '@/storage';
import BuecherAnsicht from '@/views/BuecherAnsicht';

const PNG = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAIAAACQd1PeAAAADElEQVR4nGP4z8AAAAMBAQDJ/pLvAAAAAElFTkSuQmCC';
function repoFake(start: Buch[] = []) {
  const daten = new Map(start.map((b) => [b.id, { ...b }]));
  const r = {
    daten,
    list: vi.fn(async () => [...daten.values()].map((b) => ({ ...b }))),
    get: vi.fn(async (id: string) => (daten.has(id) ? { ...daten.get(id)! } : undefined)),
    save: vi.fn(async (b: Buch) => void daten.set(b.id, { ...b })),
    remove: vi.fn(async (id: string) => void daten.delete(id)),
  };
  return r as typeof r & BookRepository;
}
function speicherFake() {
  const daten = new Map<string, string>();
  const s = {
    daten,
    get: async (id: string, b: string) => daten.get(`${id}|${b}`),
    put: vi.fn(async (id: string, b: string, d: string) => void daten.set(`${id}|${b}`, d)),
    remove: async (id: string, b: string) => void daten.delete(`${id}|${b}`),
  };
  return s as typeof s & ImageStore;
}
async function zeige(repo = repoFake(), s = speicherFake()) {
  render(<BuecherAnsicht repository={repo} bildspeicher={s} bildquelle={{ scannen: async () => PNG, galerie: async () => PNG }} />);
  await screen.findByRole('heading', { name: 'Deine Bücher' });
  return { repo, s };
}
async function tippe(el: Element) {
  await act(async () => {
    fireEvent.click(el);
    await new Promise((r) => setTimeout(r, 20));
  });
}
async function oeffneBlatt() {
  await tippe(screen.getByRole('button', { name: 'Buch hinzufügen' }));
  await tippe(within(screen.getByRole('menu', { name: 'Buch hinzufügen' })).getByRole('menuitem', { name: /Von Hand eintragen/ }));
  return screen.getByRole('dialog', { name: 'Manueller Eintrag' });
}
const feld = (d: HTMLElement, n: string) => within(d).getByLabelText(new RegExp(`^\\s*${n}\\s*$`, 'i')) as HTMLInputElement;

afterEach(() => cleanup());

it('[REQ-031/GROB] ohne Titel Hinweis und nichts gespeichert, ungültiges „Erschienen“ markiert; gültig → Buch „ungelesen“ gespeichert, Buchdetails erscheinen', async () => {
  const { repo } = await zeige();
  const d = await oeffneBlatt();
  await tippe(within(d).getByRole('button', { name: 'Hinzufügen' }));
  expect(screen.getByRole('alert').textContent).toContain('Bitte gib einen Titel ein');
  fireEvent.change(feld(d, 'Titel'), { target: { value: 'Momo' } });
  // Seit REQ-092 (2026-11-23): Prüfung über „Erschienen“ (eigenes Blatt) statt Feld „JAHR“.
  await tippe(d.querySelector('[data-ausgabe-zeile="erschienen"]')!);
  const ef = () => document.querySelector<HTMLInputElement>('[data-blatt-feld="erschienen"]')!;
  fireEvent.change(ef(), { target: { value: '99' } });
  await tippe(document.querySelector('[data-blatt-sichern="erschienen"]')!);
  if (!document.querySelector('[data-blatt-feld="erschienen"]')) await tippe(within(d).getByRole('button', { name: 'Hinzufügen' }));
  expect(d.querySelector('[data-ausgabe-zeile="erschienen"] [data-fehler="true"], [data-ausgabe-zeile="erschienen"][data-fehler="true"]') ?? (document.querySelector('[data-blatt-feld="erschienen"][data-fehler="true"]'))).not.toBeNull();
  expect(repo.save).not.toHaveBeenCalled();
  if (!document.querySelector('[data-blatt-feld="erschienen"]')) await tippe(d.querySelector('[data-ausgabe-zeile="erschienen"]')!);
  fireEvent.change(ef(), { target: { value: '1973' } });
  await tippe(document.querySelector('[data-blatt-sichern="erschienen"]')!);
  fireEvent.change(feld(d, 'Autor'), { target: { value: 'Michael Ende' } });
  fireEvent.change(feld(d, 'Seiten'), { target: { value: '300' } });
  await tippe(within(d).getByRole('button', { name: 'Hinzufügen' }));
  await screen.findByRole('region', { name: 'Buchdetails' });
  expect(repo.save).toHaveBeenCalledTimes(1);
  expect(repo.save.mock.calls[0][0]).toMatchObject({ titel: 'Momo', autor: 'Michael Ende', erscheinungsjahr: 1973, seitenanzahl: 300, status: 'ungelesen' });
});
