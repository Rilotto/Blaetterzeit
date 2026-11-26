/**
 * Grober Test REQ-105 – Reiter „Notizbuch“: Zitat anlegen (Pflichtfeld), Anzeige mit Sprecher und Seite, Sortierung nach Seite.
 * Aufbau aus dem feinen Test tests/acceptance/REQ-105-notizbuch-zitate.test.tsx.
 */
import '@testing-library/jest-dom/vitest';
import { act, cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import type { Buch } from '@/domain/buch';
import { InMemoryListenRepository, InMemoryZitatRepository } from '@/storage';
import type { ImageStore } from '@/storage/ImageStore';
import { InMemoryBookRepository } from '@/storage/InMemoryBookRepository';
import BuchDetails from '@/views/BuchDetails';

vi.mock('@/buecher/demodaten', () => ({ demoBuecher: [] }));
afterEach(cleanup);

const W = { timeout: 4000 };
const leer = { get: async () => undefined, put: async () => {}, remove: async () => {} } as unknown as ImageStore;
const norm = (t: string | null | undefined) => (t ?? '').replace(/[\s  ]+/g, ' ').trim();
const ohneLeer = (t: string | null | undefined) => (t ?? '').replace(/[\s  ]+/g, '');
const bereich = () => document.querySelector<HTMLElement>('[data-reiter-bereich="notizbuch"]')!;
const feld = (name: string) => within(screen.getByRole('dialog')).getByLabelText(name);
async function tippe(el: Element | null | undefined) {
  expect(el).toBeTruthy();
  await act(async () => {
    fireEvent.click(el!);
    await new Promise((r) => setTimeout(r, 30));
  });
}
async function anlegen(text: string, wer: string, seite: string) {
  await tippe(within(bereich()).getAllByRole('button', { name: /^\+$|Zitat hinzufügen/ })[0]);
  await screen.findByRole('dialog', {}, W);
  fireEvent.change(feld('Zitat'), { target: { value: text } });
  fireEvent.change(feld('Wer sagt es?'), { target: { value: wer } });
  fireEvent.change(feld('Seite'), { target: { value: seite } });
  await tippe(within(screen.getByRole('dialog')).getByRole('button', { name: 'Sichern' }));
}

it('[REQ-105/GROB] leeres Zitat wird nicht gesichert; Zitate mit Sprecher/Seite werden gespeichert und nach Seite sortiert angezeigt', async () => {
  const b: Buch = { id: 'fw', titel: 'Fourth Wing', status: 'am_lesen' };
  const repo = new InMemoryBookRepository();
  const zitate = new InMemoryZitatRepository();
  await repo.save(b);
  render(<BuchDetails buchId={b.id} repository={repo} zitatRepository={zitate} listenRepository={new InMemoryListenRepository()} bildspeicher={leer} bildquelle={{ scannen: async () => null, galerie: async () => null }} onZurueck={() => {}} />);
  const d = await screen.findByRole('region', { name: 'Buchdetails' }, W);
  await tippe(await within(d).findByRole('tab', { name: 'Notizbuch' }, W));
  await waitFor(() => expect(within(bereich()).getByText('Zitate')).toBeInTheDocument(), W);
  expect(within(bereich()).queryAllByRole('button').some((k) => /^\+?\s*Zitat hinzufügen$/.test(norm(k.textContent)))).toBe(true);
  await anlegen('   ', 'Violet', '312');
  expect(screen.queryByRole('dialog')).not.toBeNull();
  expect(await zitate.alle()).toHaveLength(0);
  fireEvent.change(feld('Zitat'), { target: { value: 'Ich bin nicht das Feuer.' } });
  await tippe(within(screen.getByRole('dialog')).getByRole('button', { name: 'Sichern' }));
  await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull(), W);
  await anlegen('Frühes Zitat', 'Xaden', '15');
  await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull(), W);
  await waitFor(() => expect(ohneLeer(bereich().textContent)).toContain(ohneLeer('„Ich bin nicht das Feuer.“VioletS. 312')), W);
  const t = ohneLeer(bereich().textContent);
  expect(t.indexOf('FrühesZitat')).toBeLessThan(t.indexOf('IchbinnichtdasFeuer.'));
  const gespeichert = await zitate.vonBuch('fw');
  expect(gespeichert.map((z) => [z.text, z.sprecher, z.seite]).sort()).toEqual([
    ['Frühes Zitat', 'Xaden', 15],
    ['Ich bin nicht das Feuer.', 'Violet', 312],
  ]);
});
