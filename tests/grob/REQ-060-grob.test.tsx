/**
 * Grober Test REQ-060 – Manueller Eintrag: Angaben der Karte „Ausgabe“, Seitenzahl Pflicht.
 * Aufbau aus dem feinen Test tests/acceptance/REQ-060-buch-anlegen-ausgabe-angaben.test.tsx.
 */
import '@testing-library/jest-dom/vitest';
import { act, cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import { InMemoryBookRepository } from '@/storage/InMemoryBookRepository';
import { InMemoryImageStore } from '@/storage/InMemoryImageStore';
import BuecherAnsicht from '@/views/BuecherAnsicht';

vi.mock('@/buecher/demodaten', () => ({ demoBuecher: [] }));
afterEach(() => cleanup());

const W = { timeout: 4000 };
async function tippe(el: Element) {
  await act(async () => {
    fireEvent.click(el);
    await new Promise((r) => setTimeout(r, 15));
  });
}
const d = () => screen.getByRole('dialog', { name: 'Manueller Eintrag' });
const gib = (name: string, wert: string) => fireEvent.change(within(d()).getByLabelText(new RegExp(`^\\s*${name}\\s*$`, 'i')), { target: { value: wert } });
const hinzufuegen = async () => {
  await tippe(within(d()).getByRole('button', { name: 'Hinzufügen' }));
  await act(async () => {
    await new Promise((r) => setTimeout(r, 60));
  });
};

it('[REQ-060/GROB] ohne Seiten wird nichts angelegt; mit Seiten 320 und Verlag wird beides gespeichert', async () => {
  const repo = new InMemoryBookRepository();
  render(<BuecherAnsicht repository={repo} bildspeicher={new InMemoryImageStore()} bildquelle={{ scannen: async () => null, galerie: async () => null }} />);
  await screen.findByRole('heading', { name: 'Deine Bücher' }, W);
  await tippe(screen.getByRole('button', { name: 'Buch hinzufügen' }));
  await tippe(within(await screen.findByRole('menu', { name: 'Buch hinzufügen' }, W)).getByRole('menuitem', { name: /Von Hand eintragen/ }));
  await screen.findByRole('dialog', { name: 'Manueller Eintrag' }, W);
  expect(d().querySelector('[data-ausgabe-zeile="fotos"]')).toBeNull();
  gib('Titel', 'Voll');
  await hinzufuegen();
  expect(await repo.list()).toEqual([]);
  gib('Seiten', '320');
  await tippe(d().querySelector('[data-ausgabe-zeile="verlag"]')!);
  const feld = await vi.waitFor(() => {
    const e = document.querySelector<HTMLInputElement>('[data-blatt-feld="verlag"]');
    expect(e).not.toBeNull();
    return e!;
  }, W);
  fireEvent.change(feld, { target: { value: 'Carlsen' } });
  await tippe(document.querySelector('[data-blatt-sichern="verlag"]')!);
  await vi.waitFor(() => expect(document.querySelector('[data-blatt-feld="verlag"]')).toBeNull(), W);
  await hinzufuegen();
  await screen.findByRole('region', { name: 'Buchdetails' }, W);
  const [b] = (await repo.list()).filter((x) => x.titel === 'Voll');
  expect(b).toMatchObject({ seitenanzahl: 320, verlag: 'Carlsen' });
});
