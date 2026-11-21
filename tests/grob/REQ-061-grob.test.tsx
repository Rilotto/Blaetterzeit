/**
 * Grober Test REQ-061 – Menü „Buch hinzufügen“: Option „Barcode scannen“ und Scan-Bildschirm.
 * Aufbau aus dem feinen Test tests/acceptance/REQ-061-barcode-scannen-option.test.tsx.
 */
import '@testing-library/jest-dom/vitest';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import type { ImageStore } from '@/storage';
import { InMemoryBookRepository } from '@/storage/InMemoryBookRepository';
import BuecherAnsicht from '@/views/BuecherAnsicht';

vi.mock('@/buecher/demodaten', () => ({ demoBuecher: [] }));
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

const W = { timeout: 4000 };
const bilder = { get: async () => undefined, put: async () => {}, remove: async () => {} } as unknown as ImageStore;
type Optionen = { video: HTMLVideoElement | null; beiIsbn: (isbn: string) => void };
async function tippe(el: Element) {
  await act(async () => {
    fireEvent.click(el);
    await new Promise((r) => setTimeout(r, 15));
  });
}

it('[REQ-061/GROB] „Barcode scannen“ öffnet den Scan-Bildschirm; erkannte ISBN startet genau eine Suche', async () => {
  const scanner = {
    optionen: null as Optionen | null,
    starten: vi.fn(async (o: Optionen) => {
      scanner.optionen = o;
    }),
    lichtSetzen: vi.fn(async () => {}),
    beenden: vi.fn(async () => {}),
  };
  const suche = { suchen: vi.fn(() => new Promise<never>(() => {})) };
  render(<BuecherAnsicht repository={new InMemoryBookRepository()} bildspeicher={bilder} barcodeScanner={scanner} isbnSuche={suche} />);
  await screen.findByRole('heading', { name: 'Deine Bücher' }, W);
  await tippe(screen.getByRole('button', { name: 'Buch hinzufügen' }));
  const m = await screen.findByRole('menu', { name: 'Buch hinzufügen' }, W);
  expect(m.querySelector('[data-option="von-hand"]')).not.toBeNull();
  await tippe(m.querySelector('[data-option="barcode"]')!);
  await vi.waitFor(() => expect(document.querySelector('[data-scan-bildschirm]')).not.toBeNull(), W);
  await vi.waitFor(() => expect(scanner.optionen).not.toBeNull(), W);
  await act(async () => {
    scanner.optionen!.beiIsbn('9783551551672');
    await new Promise((r) => setTimeout(r, 20));
  });
  expect(suche.suchen).toHaveBeenCalledTimes(1);
  expect(suche.suchen).toHaveBeenCalledWith('9783551551672');
});
