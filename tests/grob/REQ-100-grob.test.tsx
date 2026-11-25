/**
 * Grober Test REQ-100 – Listenbild über „Liste bearbeiten“ hinzufügen; geöffnete Saga zeigt es links neben dem Namen.
 * Aufbau aus dem feinen Test tests/acceptance/REQ-100-listenbild.test.tsx.
 */
import '@testing-library/jest-dom/vitest';
import { act, cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import { InMemoryListenRepository } from '@/storage';
import type { ImageStore } from '@/storage/ImageStore';
import { InMemoryBookRepository } from '@/storage/InMemoryBookRepository';
import BuecherAnsicht from '@/views/BuecherAnsicht';

vi.mock('@/buecher/demodaten', () => ({ demoBuecher: [] }));
afterEach(cleanup);

const W = { timeout: 4000 };
const PNG = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAIAAACQd1PeAAAADElEQVR4nGNgaGAAAAEEAIFw9selAAAAAElFTkSuQmCC';
const norm = (t: string | null | undefined) => (t ?? '').replace(/[\s  ]+/g, ' ').trim();
const daten = new Map<string, string>();
const bilder = {
  get: async (id: string, b: string) => daten.get(`${id}|${b}`),
  put: async (id: string, b: string, url: string) => void daten.set(`${id}|${b}`, url),
  remove: async (id: string, b: string) => void daten.delete(`${id}|${b}`),
} as unknown as ImageStore;
async function tippe(el: Element | undefined | null) {
  expect(el).toBeTruthy();
  await act(async () => {
    fireEvent.click(el!);
    await new Promise((r) => setTimeout(r, 30));
  });
}
function textEls(text: string, root: ParentNode = document.body) {
  const k = Array.from(root.querySelectorAll<HTMLElement>('*')).filter((e) => norm(e.textContent) === text);
  return k.filter((c) => !k.some((o) => o !== c && c.contains(o)));
}
const vor = (a: Node, b: Node) => Boolean(a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING);
const kopf = () => screen.getAllByRole('heading', { name: 'The Empyrean' }).at(-1)!;
function kopfBilder() {
  const h = kopf();
  const s = new Set<HTMLElement>();
  for (let n = h.parentElement, i = 0; n && i < 2; n = n.parentElement, i++) n.querySelectorAll<HTMLElement>('img').forEach((e) => vor(e, h) && s.add(e));
  return [...s];
}
const blatt = () => screen.getAllByRole('dialog').at(-1)!;

it('[REQ-100/GROB] Stift → „Bild hinzufügen“ → Galerie, Zuschnitt, Sichern: Saga hat ein Listenbild links neben dem Namen', async () => {
  const listen = new InMemoryListenRepository();
  await listen.listeSpeichern({ id: 'e', art: 'saga', name: 'The Empyrean' });
  render(<BuecherAnsicht repository={new InMemoryBookRepository()} listenRepository={listen} bildspeicher={bilder} bildquelle={{ scannen: async () => PNG, galerie: async () => PNG }} />);
  const r = await screen.findByRole('region', { name: 'Sagas' }, W);
  await tippe(await waitFor(() => textEls('The Empyrean', r)[0], W));
  await waitFor(() => expect(kopf()).toBeDefined(), W);
  expect(kopfBilder()).toHaveLength(0);
  const h = kopf();
  let stift: HTMLElement | undefined;
  for (let n = h.parentElement; n && !stift; n = n.parentElement) {
    const k = within(n).queryAllByRole('button').filter((b) => !h.contains(b));
    stift = k.find((b) => /bearbeit|umbenenn|ändern|stift/i.test(b.getAttribute('aria-label') ?? norm(b.textContent))) ?? k[0];
  }
  await tippe(stift);
  await waitFor(() => expect(screen.queryAllByRole('dialog').length).toBeGreaterThan(0), W);
  const feld = within(blatt()).getAllByRole('button').find((b) => /Bild hinzufügen/.test(b.getAttribute('aria-label') ?? norm(b.textContent)));
  await tippe(feld);
  const menue = await waitFor(() => screen.getAllByRole('menu').at(-1)!, W);
  await tippe([...within(menue).queryAllByRole('menuitem'), ...within(menue).queryAllByRole('button')].find((e) => norm(e.getAttribute('aria-label') ?? e.textContent) === 'Aus Galerie auswählen'));
  const z = await screen.findByRole('region', { name: 'Zuschnitt' }, W);
  await tippe(within(z).getByRole('button', { name: 'Bestätigen' }));
  await waitFor(() => expect(screen.queryByRole('region', { name: 'Zuschnitt' })).toBeNull(), W);
  await tippe(within(blatt()).getByRole('button', { name: 'Sichern' }));
  await waitFor(() => expect(screen.queryAllByRole('dialog')).toHaveLength(0), W);
  await waitFor(() => expect(kopfBilder()).toHaveLength(1), W);
  expect(kopfBilder()[0].getAttribute('src')).toMatch(/^(data:|blob:)/);
  expect(daten.size).toBeGreaterThan(0);
});
