/**
 * Grober Test REQ-096 – Blatt „Zu einer Saga hinzufügen“: nur Listen dieser Art, Häkchen mit Band, Sichern ordnet zu.
 * Aufbau aus dem feinen Test tests/acceptance/REQ-096-blatt-zu-liste-hinzufuegen.test.tsx.
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
async function tippe(el: Element | undefined | null) {
  expect(el).toBeTruthy();
  await act(async () => {
    fireEvent.click(el!);
    await new Promise((r) => setTimeout(r, 30));
  });
}
const blatt = () => screen.queryAllByRole('dialog').at(-1) ?? null;

it('[REQ-096/GROB] Saga-Blatt zeigt nur Sagas; „The Empyrean“ anhaken, Band 2, Sichern → Zuordnung mit Band 2', async () => {
  const b: Buch = { id: crypto.randomUUID(), titel: 'Iron Flame', status: 'ungelesen', seitenanzahl: 300 };
  const repo = new InMemoryBookRepository();
  const listen = new InMemoryListenRepository();
  await repo.save(b);
  await listen.listeSpeichern({ id: 's1', art: 'saga', name: 'The Empyrean' });
  await listen.listeSpeichern({ id: 's2', art: 'saga', name: 'Crescent City' });
  await listen.listeSpeichern({ id: 'm1', art: 'sammlung', name: 'Lieblingsbücher' });
  render(<BuchDetails buchId={b.id} repository={repo} listenRepository={listen} bildspeicher={leer} bildquelle={{ scannen: async () => null, galerie: async () => null }} onZurueck={() => {}} />);
  const d = await screen.findByRole('region', { name: 'Buchdetails' }, W);
  await tippe(await waitFor(() => within(d).queryByRole('tab', { name: 'Details' }) ?? within(d).getAllByRole('button', { name: 'Details' })[0], W));
  await tippe(await waitFor(() => within(d).getAllByRole('button').find((k) => norm(k.textContent) === '+ Zu einer Saga hinzufügen')!, W));
  await waitFor(() => expect(blatt()).not.toBeNull(), W);
  const namen = within(blatt()!).getAllByRole('checkbox').map((c) => norm(c.getAttribute('aria-label') ?? c.closest('label')?.textContent ?? ''));
  expect(namen.sort()).toEqual(['Crescent City', 'The Empyrean']);
  await tippe(within(blatt()!).getByRole('checkbox', { name: /The Empyrean/ }));
  const band = await waitFor(() => {
    const f = within(blatt()!).queryAllByLabelText(/Band/).filter((e) => e.tagName === 'INPUT');
    expect(f).toHaveLength(1);
    return f[0];
  }, W);
  fireEvent.change(band, { target: { value: '2' } });
  await tippe(within(blatt()!).getByRole('button', { name: 'Sichern' }));
  await waitFor(() => expect(blatt()).toBeNull(), W);
  await waitFor(async () => expect((await listen.zugehoerigkeiten()).filter((z) => z.buchId === b.id)).toEqual([{ listeId: 's1', buchId: b.id, band: 2 }]), W);
});
