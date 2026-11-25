/**
 * Grober Test REQ-098 – Geöffnete Liste: Bücher nach Bänden, Plus-Blatt übernimmt Hinzufügen und Herausnehmen.
 * Aufbau aus dem feinen Test tests/acceptance/REQ-098-geoeffnete-liste.test.tsx.
 */
import '@testing-library/jest-dom/vitest';
import { act, cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import type { Buch } from '@/domain/buch';
import { InMemoryListenRepository } from '@/storage';
import type { ImageStore } from '@/storage/ImageStore';
import { InMemoryBookRepository } from '@/storage/InMemoryBookRepository';
import BuecherAnsicht from '@/views/BuecherAnsicht';

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
/** Kleinste Elemente mit genau diesem Text. */
function textEls(text: string, root: ParentNode = document.body) {
  const k = Array.from(root.querySelectorAll<HTMLElement>('*')).filter((e) => norm(e.textContent) === text);
  return k.filter((c) => !k.some((o) => o !== c && c.contains(o)));
}
const vor = (a: Node, b: Node) => Boolean(a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING);
const anzahl = () => textEls('1 Buch').length + textEls('2 Bücher').length * 2 + textEls('3 Bücher').length * 3;
function auswahlEintrag(bl: HTMLElement, titel: string) {
  for (const r of ['checkbox', 'option', 'switch', 'menuitemcheckbox', 'button'] as const) {
    const k = within(bl).queryAllByRole(r).filter((e) => (e.getAttribute('aria-label') ?? norm(e.textContent)).includes(titel) || norm(e.closest('label')?.textContent).includes(titel));
    if (k.length) return k[0];
  }
  throw new Error(`kein Eintrag „${titel}“`);
}

it('[REQ-098/GROB] Saga öffnen: Bücher nach Bänden; Plus → „Iron Flame“ dazu, „Fourth Wing“ raus, Sichern → nur „Iron Flame“, Bücher bleiben', async () => {
  const repo = new InMemoryBookRepository();
  const listen = new InMemoryListenRepository();
  const b = (titel: string): Buch => ({ id: crypto.randomUUID(), titel, status: 'ungelesen', seitenanzahl: 300 });
  const [fw, os, ir] = [b('Fourth Wing'), b('Onyx Storm'), b('Iron Flame')];
  for (const x of [fw, os, ir]) await repo.save(x);
  await listen.listeSpeichern({ id: 'e', art: 'saga', name: 'The Empyrean' });
  await listen.zuordnen({ listeId: 'e', buchId: os.id, band: 3 });
  await listen.zuordnen({ listeId: 'e', buchId: fw.id, band: 1 });
  render(<BuecherAnsicht repository={repo} listenRepository={listen} bildspeicher={leer} bildquelle={{ scannen: async () => null, galerie: async () => null }} />);
  const r = await screen.findByRole('region', { name: 'Sagas' }, W);
  await tippe(await waitFor(() => textEls('The Empyrean', r)[0], W));
  await waitFor(() => expect(screen.getAllByRole('heading', { name: 'The Empyrean' }).length).toBeGreaterThan(0), W);
  await waitFor(() => expect(anzahl()).toBe(2), W);
  expect(vor(textEls('Fourth Wing')[0], textEls('Onyx Storm')[0])).toBe(true);
  const vorher = screen.queryAllByRole('dialog').length;
  const plus = screen.getAllByRole('button').filter((k) => norm(k.textContent) === '+' || /^(\+|Bücher (hinzufügen|auswählen))$/i.test(k.getAttribute('aria-label') ?? '')).at(-1);
  await tippe(plus);
  await waitFor(() => expect(screen.queryAllByRole('dialog').length).toBeGreaterThan(vorher), W);
  await tippe(auswahlEintrag(screen.getAllByRole('dialog').at(-1)!, 'Iron Flame'));
  await tippe(auswahlEintrag(screen.getAllByRole('dialog').at(-1)!, 'Fourth Wing'));
  await tippe(within(screen.getAllByRole('dialog').at(-1)!).getByRole('button', { name: 'Sichern' }));
  await waitFor(() => expect(screen.queryAllByRole('dialog')).toHaveLength(0), W);
  await waitFor(async () => expect((await listen.zugehoerigkeiten()).map((z) => z.buchId).sort()).toEqual([os.id, ir.id].sort()), W);
  expect((await repo.list()).length).toBe(3);
  await waitFor(() => expect(textEls('Fourth Wing')).toHaveLength(0), W);
});
