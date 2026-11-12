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
  await tippe(within(screen.getByRole('menu', { name: 'Buch hinzufügen' })).getByRole('menuitem'));
  return screen.getByRole('dialog', { name: 'Manueller Eintrag' });
}
const feld = (d: HTMLElement, n: string) => within(d).getByLabelText(new RegExp(`^\\s*${n}\\s*$`, 'i')) as HTMLInputElement;

afterEach(() => cleanup());

it('[REQ-030/GROB] Blatt mit X, Ziehgriff, „Cover hinzufügen“, vier Feldern mit Platzhaltern und „Hinzufügen“; X schließt ohne Speichern', async () => {
  const { repo } = await zeige();
  const d = await oeffneBlatt();
  expect(d.querySelector('[data-ziehgriff]')).not.toBeNull();
  expect(d.querySelector('[data-cover-hinzufuegen]')?.textContent).toContain('Cover hinzufügen');
  for (const [n, p] of [['Titel', 'Buchtitel'], ['Autor', 'Autor'], ['Jahr', '2024'], ['Seiten', '496']]) expect(feld(d, n)).toHaveAttribute('placeholder', p);
  expect(within(d).getByRole('button', { name: '+ Erscheinungsdatum hinzufügen' })).toBeInTheDocument();
  expect(within(d).getByRole('button', { name: 'Hinzufügen' })).toBeInTheDocument();
  fireEvent.change(feld(d, 'Titel'), { target: { value: 'Verworfen' } });
  await tippe(within(d).getByRole('button', { name: 'Schließen' }));
  expect(screen.queryByRole('dialog', { name: 'Manueller Eintrag' })).toBeNull();
  expect(repo.save).not.toHaveBeenCalled();
});
