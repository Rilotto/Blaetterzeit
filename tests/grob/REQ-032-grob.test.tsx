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

it('[REQ-032/GROB] Cover über Galerie, Zuschnitt im Cover-Format, beim Anlegen als Frontcover des neuen Buchs gespeichert', async () => {
  const { repo, s } = await zeige();
  const d = await oeffneBlatt();
  fireEvent.change(feld(d, 'Titel'), { target: { value: 'Mit Cover' } });
  await tippe(d.querySelector('[data-cover-hinzufuegen]')!);
  await tippe(within(screen.getByRole('menu', { name: 'Bild hinzufügen' })).getByRole('menuitem', { name: 'Aus Galerie auswählen' }));
  const z = await screen.findByRole('region', { name: 'Zuschnitt' });
  expect(z.closest('[data-startformat]') ?? z.querySelector('[data-startformat]')).toHaveAttribute('data-startformat', 'cover');
  await tippe(within(z).getByRole('button', { name: 'Bestätigen' }));
  await vi.waitFor(() => expect(document.querySelector('[data-cover-hinzufuegen] img')).not.toBeNull());
  expect(s.put).not.toHaveBeenCalled();
  const dlg = screen.getByRole('dialog', { name: 'Manueller Eintrag' });
  expect(feld(dlg, 'Titel').value).toBe('Mit Cover');
  await tippe(within(dlg).getByRole('button', { name: 'Hinzufügen' }));
  await screen.findByRole('region', { name: 'Buchdetails' });
  const id = repo.save.mock.calls[0][0].id;
  await vi.waitFor(() => expect(s.daten.get(`${id}|cover`)).toBeTruthy());
});
