/**
 * Grober Test REQ-097 – Listenübersicht: aus den Buchdetails mit Häkchen und Anzahl, Häkchen schaltet die Zugehörigkeit um.
 * Aufbau aus dem feinen Test tests/acceptance/REQ-097-listenuebersicht-erreichbarkeit.test.tsx.
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
const haken = (name: string) => screen.getByRole('checkbox', { name: new RegExp(name) });
const an = (cb: HTMLElement) => (cb as HTMLInputElement).checked === true || cb.getAttribute('aria-checked') === 'true';
/** Kleinstes Element mit Name und Anzahl („n Bücher“/„1 Buch“). */
function eintrag(name: string) {
  const k = Array.from(document.body.querySelectorAll<HTMLElement>('*')).filter((e) => norm(e.textContent).includes(name) && /(\d+ Bücher|1 Buch)/.test(norm(e.textContent)));
  return norm(k.find((c) => !k.some((o) => o !== c && c.contains(o)))?.textContent);
}

it('[REQ-097/GROB] „In Sammlung“ öffnet die Übersicht „Sammlungen“ mit Häkchen und Anzahl; Umhaken ändert Zugehörigkeit und Anzahl', async () => {
  const b: Buch = { id: crypto.randomUUID(), titel: 'Mein Buch', status: 'ungelesen', seitenanzahl: 300 };
  const repo = new InMemoryBookRepository();
  const listen = new InMemoryListenRepository();
  await repo.save(b);
  await listen.listeSpeichern({ id: 'l', art: 'sammlung', name: 'Lieblingsbücher' });
  await listen.listeSpeichern({ id: 's', art: 'sammlung', name: 'Sommer 2026' });
  await listen.listeSpeichern({ id: 'saga', art: 'saga', name: 'The Empyrean' });
  await listen.zuordnen({ listeId: 'l', buchId: b.id });
  render(<BuchDetails buchId={b.id} repository={repo} listenRepository={listen} bildspeicher={leer} bildquelle={{ scannen: async () => null, galerie: async () => null }} onZurueck={() => {}} />);
  const d = await screen.findByRole('region', { name: 'Buchdetails' }, W);
  await tippe(await waitFor(() => within(d).queryByRole('tab', { name: 'Details' }) ?? within(d).getAllByRole('button', { name: 'Details' })[0], W));
  const zeile = await waitFor(() => {
    const k = Array.from(d.querySelectorAll<HTMLElement>('*')).filter((e) => norm(e.textContent).startsWith('In Sammlung') && norm(e.textContent).includes('›'));
    expect(k.length).toBeGreaterThan(0);
    return k.find((c) => !k.some((o) => o !== c && c.contains(o)))!;
  }, W);
  await tippe(zeile);
  await waitFor(() => expect(screen.getAllByRole('heading', { name: 'Sammlungen' }).length).toBeGreaterThan(0), W);
  expect(an(haken('Lieblingsbücher'))).toBe(true);
  expect(an(haken('Sommer 2026'))).toBe(false);
  expect(screen.queryByRole('checkbox', { name: /The Empyrean/ })).toBeNull();
  expect(eintrag('Lieblingsbücher')).toMatch(/1 Buch$/);
  await tippe(haken('Sommer 2026'));
  await tippe(haken('Lieblingsbücher'));
  await waitFor(async () => expect((await listen.zugehoerigkeiten()).filter((z) => z.buchId === b.id).map((z) => z.listeId)).toEqual(['s']), W);
  await waitFor(() => expect(eintrag('Lieblingsbücher')).toMatch(/0 Bücher$/), W);
  expect(eintrag('Sommer 2026')).toMatch(/1 Buch$/);
});
