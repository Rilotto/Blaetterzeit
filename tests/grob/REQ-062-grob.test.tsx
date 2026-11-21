/**
 * Grober Test REQ-062 – Treffer zur ISBN aus DNB und Open Library, Übernahme ins Blatt „Manueller Eintrag“.
 * Aufbau aus dem feinen Test tests/acceptance/REQ-062-barcode-angaben-aus-internet.test.tsx.
 */
import '@testing-library/jest-dom/vitest';
import { act, cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import type { Treffer } from '@/barcode/treffer';
import { InMemoryBookRepository } from '@/storage/InMemoryBookRepository';
import { InMemoryImageStore } from '@/storage/InMemoryImageStore';
import BuecherAnsicht from '@/views/BuecherAnsicht';

vi.mock('@/buecher/demodaten', () => ({ demoBuecher: [] }));
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

const W = { timeout: 4000 };
const ISBN = '9783551551672';
const DNB: Treffer = { quelle: 'dnb', angaben: { titel: 'Harry Potter und der Stein der Weisen', autor: 'Rowling, J. K.', seitenanzahl: 335, verlag: 'Carlsen', isbn: ISBN } };
const OL: Treffer = { quelle: 'openlibrary', angaben: { titel: 'Harry Potter (OL)', autor: 'J. K. Rowling', isbn: ISBN } };
type Optionen = { video: HTMLVideoElement | null; beiIsbn: (isbn: string) => void };
async function tippe(el: Element) {
  await act(async () => {
    fireEvent.click(el);
    await new Promise((r) => setTimeout(r, 15));
  });
}

it('[REQ-062/GROB] beide Treffer zur Auswahl; DNB-Treffer übernehmen und hinzufügen legt das Buch mit den Angaben an', async () => {
  const scanner = {
    optionen: null as Optionen | null,
    starten: vi.fn(async (o: Optionen) => void (scanner.optionen = o)),
    lichtSetzen: vi.fn(async () => {}),
    beenden: vi.fn(async () => {}),
  };
  const suche = { suchen: vi.fn(async () => [DNB, OL]) };
  const repo = new InMemoryBookRepository();
  render(<BuecherAnsicht repository={repo} bildspeicher={new InMemoryImageStore()} barcodeScanner={scanner} isbnSuche={suche} />);
  await screen.findByRole('heading', { name: 'Deine Bücher' }, W);
  await tippe(screen.getByRole('button', { name: 'Buch hinzufügen' }));
  await tippe((await screen.findByRole('menu', { name: 'Buch hinzufügen' }, W)).querySelector('[data-option="barcode"]')!);
  await vi.waitFor(() => expect(scanner.optionen).not.toBeNull(), W);
  await act(async () => {
    scanner.optionen!.beiIsbn(ISBN);
    await new Promise((r) => setTimeout(r, 30));
  });
  const a = await screen.findByRole('dialog', { name: 'Gefundene Bücher' }, W);
  expect(Array.from(a.querySelectorAll('[data-treffer]')).map((x) => x.getAttribute('data-quelle')).sort()).toEqual(['dnb', 'openlibrary']);
  await tippe(a.querySelector('[data-treffer][data-quelle="dnb"]')!);
  const blatt = await screen.findByRole('dialog', { name: 'Manueller Eintrag' }, W);
  expect((within(blatt).getByLabelText(/^\s*Titel\s*$/i) as HTMLInputElement).value).toBe(DNB.angaben.titel);
  expect(await repo.list()).toEqual([]);
  await tippe(within(blatt).getByRole('button', { name: 'Hinzufügen' }));
  await screen.findByRole('region', { name: 'Buchdetails' }, W);
  const [b] = await repo.list();
  expect(b).toMatchObject({ titel: DNB.angaben.titel, autor: 'Rowling, J. K.', seitenanzahl: 335, verlag: 'Carlsen', isbn: ISBN });
});
