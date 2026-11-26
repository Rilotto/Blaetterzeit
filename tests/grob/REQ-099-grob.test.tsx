/**
 * Grober Test REQ-099 – „Band 1 · The Empyrean“ direkt unter dem Autor; Antippen öffnet die Saga.
 * Aufbau aus dem feinen Test tests/acceptance/REQ-099-saga-band-buchdetails-barcode.test.tsx.
 */
import '@testing-library/jest-dom/vitest';
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
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
function textEls(text: string, root: ParentNode = document.body) {
  const k = Array.from(root.querySelectorAll<HTMLElement>('*')).filter((e) => norm(e.textContent) === text);
  return k.filter((c) => !k.some((o) => o !== c && c.contains(o)));
}
const vor = (a: Node, b: Node) => Boolean(a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING);

it('[REQ-099/GROB] direkt unter dem Autor steht „Band 1 · The Empyrean“ (Sammlung erzeugt keine Zeile); Antippen öffnet die Saga', async () => {
  const b: Buch = { id: crypto.randomUUID(), titel: 'Fourth Wing', autor: 'Rebecca Yarros', status: 'ungelesen', seitenanzahl: 300, bandnummer: 1 };
  const repo = new InMemoryBookRepository();
  const listen = new InMemoryListenRepository();
  await repo.save(b);
  await listen.listeSpeichern({ id: 'e', art: 'saga', name: 'The Empyrean' });
  await listen.listeSpeichern({ id: 'm', art: 'sammlung', name: 'Lieblingsbücher' });
  await listen.zuordnen({ listeId: 'e', buchId: b.id });
  await listen.zuordnen({ listeId: 'm', buchId: b.id });
  render(<BuchDetails buchId={b.id} repository={repo} listenRepository={listen} bildspeicher={leer} bildquelle={{ scannen: async () => null, galerie: async () => null }} onZurueck={() => {}} />);
  const d = await screen.findByRole('region', { name: 'Buchdetails' }, W);
  await waitFor(() => {
    const a = textEls('Rebecca Yarros', d)[0];
    expect(a).toBeDefined();
    const naechstes = Array.from(d.querySelectorAll<HTMLElement>('*')).find((e) => vor(a, e) && !a.contains(e) && e.children.length === 0 && norm(e.textContent) !== '');
    expect(norm(naechstes?.textContent)).toBe('Band 1 · The Empyrean');
  }, W);
  expect(textEls('Lieblingsbücher', d)).toHaveLength(0);
  await act(async () => {
    fireEvent.click(textEls('Band 1 · The Empyrean', d)[0]);
    await new Promise((r) => setTimeout(r, 30));
  });
  await waitFor(() => expect(screen.getAllByRole('heading', { name: 'The Empyrean' }).length).toBeGreaterThan(0), W);
});
