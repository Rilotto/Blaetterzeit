/**
 * Grober Test REQ-102 – Startseite „Gerade am Lesen“: nur Bücher *am lesen*, Fortschritt direkt eintragen.
 * Aufbau aus dem feinen Test tests/acceptance/REQ-102-startseite-gerade-am-lesen.test.tsx.
 */
import '@testing-library/jest-dom/vitest';
import { act, cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import type { Buch } from '@/domain/buch';
import { InMemoryEinstellungRepository, InMemoryListenRepository, InMemoryProfilRepository, InMemoryZitatRepository } from '@/storage';
import { InMemoryBookRepository } from '@/storage/InMemoryBookRepository';
import { InMemoryImageStore } from '@/storage/InMemoryImageStore';
import StartAnsicht from '@/start/StartAnsicht';

vi.mock('@/buecher/demodaten', () => ({ demoBuecher: [] }));
afterEach(cleanup);

const W = { timeout: 4000 };
const norm = (t: string | null | undefined) => (t ?? '').replace(/[\s  ]+/g, ' ').trim();
const FORTSCHRITT = '[role="progressbar"][aria-label="Lesefortschritt"], button[aria-label="Buchlänge festlegen"]';
function karte(titel: string) {
  const k = Array.from(document.body.querySelectorAll<HTMLElement>('*')).filter((e) => norm(e.textContent) === titel);
  let el: HTMLElement | null = k.filter((c) => !k.some((o) => o !== c && c.contains(o)))[0] ?? null;
  expect(el, titel).not.toBeNull();
  while (el && el.querySelectorAll(FORTSCHRITT).length === 0) el = el.parentElement;
  expect(el?.querySelectorAll(FORTSCHRITT)).toHaveLength(1);
  return el!;
}
async function tippe(el: Element | null) {
  expect(el).not.toBeNull();
  await act(async () => {
    fireEvent.click(el!);
    await new Promise((r) => setTimeout(r, 30));
  });
}

it('[REQ-102/GROB] „Gerade am Lesen“ zeigt nur *am lesen* mit „42 / 400“; Balken → 60 sichern: „60 / 400“ und eine Sitzung mehr', async () => {
  const repo = new InMemoryBookRepository();
  const fw: Buch = { id: 'fw', titel: 'Fourth Wing', autor: 'Rebecca Yarros', status: 'am_lesen', seitenanzahl: 400, aktuelleSeite: 42 };
  await repo.save(fw);
  await repo.save({ id: 'os', titel: 'Onyx Storm', status: 'ungelesen', seitenanzahl: 500 });
  render(
    <StartAnsicht
      repository={repo}
      bildspeicher={new InMemoryImageStore()}
      listenRepository={new InMemoryListenRepository()}
      zitatRepository={new InMemoryZitatRepository()}
      profilRepository={new InMemoryProfilRepository()}
      einstellungRepository={new InMemoryEinstellungRepository()}
      jetzt={() => new Date(2026, 10, 24, 12)}
    />,
  );
  const k = await waitFor(() => karte('Fourth Wing'), W);
  expect(norm(k.textContent)).toContain('42 / 400');
  expect(k.textContent).toContain('Rebecca Yarros');
  expect(document.body.querySelectorAll(FORTSCHRITT)).toHaveLength(1);
  expect(document.body.textContent).not.toContain('Onyx Storm');
  await tippe(within(k).getByRole('progressbar', { name: 'Lesefortschritt' }));
  const d = await screen.findByRole('dialog', { name: 'Aktuelle Seite' }, W);
  fireEvent.change(within(d).getByLabelText('Aktuelle Seite'), { target: { value: '60' } });
  await tippe(within(d).getByRole('button', { name: 'Sichern' }));
  await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull(), W);
  await waitFor(() => expect(norm(karte('Fourth Wing').textContent)).toContain('60 / 400'), W);
  const g = await repo.get('fw');
  expect(g?.aktuelleSeite).toBe(60);
  expect(g?.sitzungen ?? []).toHaveLength(1);
});
