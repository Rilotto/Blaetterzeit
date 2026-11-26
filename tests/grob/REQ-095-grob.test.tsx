/**
 * Grober Test REQ-095 – Abschnitt „Sagas, Sammlungen und Bibliotheken“ in den Buchdetails (Mischzustand).
 * Aufbau aus dem feinen Test tests/acceptance/REQ-095-listen-abschnitt-buchdetails.test.tsx.
 */
import '@testing-library/jest-dom/vitest';
import { act, cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import type { Buch } from '@/domain/buch';
import { InMemoryListenRepository } from '@/storage';
import type { ImageStore } from '@/storage/ImageStore';
import { InMemoryBookRepository } from '@/storage/InMemoryBookRepository';
import BuchDetails from '@/views/BuchDetails';

vi.mock('@/buecher/demodaten', () => ({ demoBuecher: [] }));
afterEach(cleanup);

const W = { timeout: 4000 };
const leer = { get: async () => undefined, put: async () => {}, remove: async () => {} } as unknown as ImageStore;
const norm = (t: string | null | undefined) => (t ?? '').replace(/[\s  ]+/g, ' ').trim();

it('[REQ-095/GROB] Buch in einer Saga: Abschnitt zeigt „In Saga“ mit Namen, dazu die Pillen für Sammlung und Bibliothek', async () => {
  const b: Buch = { id: crypto.randomUUID(), titel: 'Fourth Wing', status: 'ungelesen', seitenanzahl: 300 };
  const repo = new InMemoryBookRepository();
  const listen = new InMemoryListenRepository();
  await repo.save(b);
  await listen.listeSpeichern({ id: 's1', art: 'saga', name: 'The Empyrean' });
  await listen.zuordnen({ listeId: 's1', buchId: b.id });
  render(<BuchDetails buchId={b.id} repository={repo} listenRepository={listen} bildspeicher={leer} bildquelle={{ scannen: async () => null, galerie: async () => null }} onZurueck={() => {}} />);
  const d = await screen.findByRole('region', { name: 'Buchdetails' }, W);
  const reiter = await waitFor(() => within(d).queryByRole('tab', { name: 'Details' }) ?? within(d).getAllByRole('button', { name: 'Details' })[0], W);
  await act(async () => {
    fireEvent.click(reiter);
    await new Promise((r) => setTimeout(r, 30));
  });
  await waitFor(() => expect(within(d).getByRole('heading', { name: 'Sagas, Sammlungen und Bibliotheken' })).toBeInTheDocument(), W);
  await waitFor(() => expect(norm(d.textContent)).toMatch(/In Saga ?The Empyrean ?›/), W);
  const pillen = within(d).getAllByRole('button').map((k) => norm(k.textContent)).filter((t) => /^\+ ?Zu einer /.test(t));
  expect(pillen).toEqual(['+ Zu einer Sammlung hinzufügen', '+ Zu einer Bibliothek hinzufügen']);
});
