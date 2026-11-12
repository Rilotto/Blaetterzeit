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
void zeige; // gemeinsamer Kopf, hier nicht genutzt

it('[REQ-034/GROB] angelegtes Buch mit allen Angaben und Cover übersteht einen Neustart (IndexedDB)', async () => {
  const { IDBFactory, IDBKeyRange } = await import('fake-indexeddb');
  vi.stubGlobal('indexedDB', new IDBFactory());
  vi.stubGlobal('IDBKeyRange', IDBKeyRange);
  try {
    vi.resetModules();
    const st1 = await import('@/storage');
    const A1 = (await import('@/views/BuecherAnsicht')).default;
    const repo1 = st1.createBookRepository();
    const bilder1 = st1.createImageStore();
    render(<A1 repository={repo1} bildspeicher={bilder1} bildquelle={{ scannen: async () => PNG, galerie: async () => PNG }} />);
    await screen.findByRole('heading', { name: 'Deine Bücher' });
    const d = await oeffneBlatt();
    for (const [n, v] of [['Titel', 'Dauerbuch'], ['Autor', 'Vorname Nachname'], ['Jahr', '2019'], ['Seiten', '350']]) fireEvent.change(feld(d, n), { target: { value: v } });
    await tippe(d.querySelector('[data-cover-hinzufuegen]')!);
    await tippe(within(screen.getByRole('menu', { name: 'Bild hinzufügen' })).getByRole('menuitem', { name: 'Aus Galerie auswählen' }));
    await tippe(within(await screen.findByRole('region', { name: 'Zuschnitt' })).getByRole('button', { name: 'Bestätigen' }));
    await vi.waitFor(() => expect(document.querySelector('[data-cover-hinzufuegen] img')).not.toBeNull());
    await tippe(within(screen.getByRole('dialog', { name: 'Manueller Eintrag' })).getByRole('button', { name: 'Hinzufügen' }));
    await screen.findByRole('region', { name: 'Buchdetails' });
    await act(async () => {
      await new Promise((r) => setTimeout(r, 50));
    });
    cleanup();
    vi.resetModules();
    const st2 = await import('@/storage');
    const repo2 = st2.createBookRepository();
    const b = (await repo2.list()).filter((x) => x.titel === 'Dauerbuch');
    expect(b).toHaveLength(1);
    expect(b[0]).toMatchObject({ titel: 'Dauerbuch', autor: 'Vorname Nachname', erscheinungsjahr: 2019, seitenanzahl: 350, status: 'ungelesen' });
    expect(await st2.createImageStore().get(b[0].id, 'cover')).toBeTruthy();
  } finally {
    vi.unstubAllGlobals();
  }
});
