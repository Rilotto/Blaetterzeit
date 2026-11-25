/**
 * Grober Test REQ-093 – Optionale Felder leeren (Verlag, Hinzugefügt) und Sortierung ohne Eintragungsdatum.
 * Aufbau aus dem feinen Test tests/acceptance/REQ-093-felder-leeren.test.tsx.
 */
import '@testing-library/jest-dom/vitest';
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import type { Buch } from '@/domain/buch';
import type { ImageStore } from '@/storage/ImageStore';
import { InMemoryBookRepository } from '@/storage/InMemoryBookRepository';
import BuchDetails from '@/views/BuchDetails';
import BuecherAnsicht from '@/views/BuecherAnsicht';

vi.mock('@/buecher/demodaten', () => ({ demoBuecher: [] }));
afterEach(cleanup);

const W = { timeout: 4000 };
const HEUTE = new Date(2026, 10, 23, 15);
const leer = { get: async () => undefined, put: async () => {}, remove: async () => {} } as unknown as ImageStore;
const quelle = { scannen: async () => null, galerie: async () => null };
const am = (tag: number) => new Date(Date.UTC(2026, 9, tag, 10)).toISOString();
const feld = (id: string) => document.querySelector<HTMLInputElement>(`[data-blatt-feld="${id}"]`);
async function tippe(el: Element | null) {
  expect(el).not.toBeNull();
  await act(async () => {
    fireEvent.click(el!);
    await new Promise((r) => setTimeout(r, 30));
  });
}

it('[REQ-093/GROB] Verlag und Hinzugefügt leeren entfernt die Angabe; Buch ohne Eintragungsdatum steht in „Alle Bücher“ oben', async () => {
  const b: Buch = { id: crypto.randomUUID(), titel: 'Ohne', status: 'ungelesen', verlag: 'Carlsen', eingetragenAm: am(1) };
  const repo = new InMemoryBookRepository();
  await repo.save(b);
  render(<BuchDetails buchId={b.id} repository={repo} jetzt={() => HEUTE} bildspeicher={leer} bildquelle={quelle} onZurueck={() => {}} />);
  const d = await screen.findByRole('region', { name: 'Buchdetails' }, W);
  await tippe(await waitFor(() => d.querySelector('[data-reiter="details"]')!, W));
  for (const id of ['verlag', 'hinzugefuegt']) {
    await tippe(await waitFor(() => d.querySelector(`[data-reiter-bereich="details"] [data-ausgabe-zeile="${id}"]`)!, W));
    await waitFor(() => expect(feld(id)).not.toBeNull(), W);
    fireEvent.change(feld(id)!, { target: { value: '' } });
    await tippe(document.querySelector(`[data-blatt-sichern="${id}"]`));
    await waitFor(() => expect(feld(id)).toBeNull(), W);
  }
  await waitFor(async () => {
    const g = await repo.get(b.id);
    expect(g?.verlag).toBeUndefined();
    expect(g?.eingetragenAm).toBeUndefined();
  }, W);
  cleanup();
  for (const x of [{ titel: 'Alt', eingetragenAm: am(3) }, { titel: 'Neu', eingetragenAm: am(9) }]) await repo.save({ id: crypto.randomUUID(), status: 'ungelesen', ...x });
  render(<BuecherAnsicht repository={repo} bildspeicher={leer} bildquelle={quelle} jetzt={() => HEUTE} />);
  await waitFor(() => expect(document.querySelector('[data-abschnitt="alle-buecher"] ul')).not.toBeNull(), W);
  const titel = Array.from(document.querySelectorAll('[data-abschnitt="alle-buecher"] li[data-bucheintrag] [data-buchtitel]')).map((t) => t.textContent?.trim());
  expect(titel).toEqual(['Ohne', 'Neu', 'Alt']);
});
