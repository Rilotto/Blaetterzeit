/**
 * Grober Test REQ-106 – Startseite „Zitat des Tages“: ohne Zitate Standard-Zitat; Kachel mit Text, Buchtitel und Seite; Antippen öffnet den Reiter „Notizbuch“.
 * Aufbau aus dem feinen Test tests/acceptance/REQ-106-startseite-zitat-des-tages.test.tsx.
 */
import '@testing-library/jest-dom/vitest';
import { act, cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import { InMemoryEinstellungRepository, InMemoryListenRepository, InMemoryProfilRepository, InMemoryZitatRepository } from '@/storage';
import { InMemoryBookRepository } from '@/storage/InMemoryBookRepository';
import { InMemoryImageStore } from '@/storage/InMemoryImageStore';
import StartAnsicht from '@/start/StartAnsicht';

vi.mock('@/buecher/demodaten', () => ({ demoBuecher: [] }));
afterEach(cleanup);

const W = { timeout: 4000 };
const norm = (t: string | null | undefined) => (t ?? '').replace(/[\s  ]+/g, ' ').trim();
function textEls(text: string | RegExp) {
  const passt = (t: string) => (typeof text === 'string' ? t === text : text.test(t));
  const k = Array.from(document.body.querySelectorAll<HTMLElement>('*')).filter((e) => passt(norm(e.textContent)));
  return k.filter((c) => !k.some((o) => o !== c && c.contains(o)));
}
async function zeige(zitate: InMemoryZitatRepository, repo: InMemoryBookRepository) {
  render(
    <StartAnsicht
      repository={repo}
      bildspeicher={new InMemoryImageStore()}
      listenRepository={new InMemoryListenRepository()}
      zitatRepository={zitate}
      profilRepository={new InMemoryProfilRepository()}
      einstellungRepository={new InMemoryEinstellungRepository()}
      jetzt={() => new Date(2026, 10, 24, 12)}
    />,
  );
  await waitFor(() => expect(textEls('Diese Woche').length).toBeGreaterThan(0), W);
  await act(async () => {
    await new Promise((r) => setTimeout(r, 60));
  });
}

it('[REQ-106/GROB] ohne Zitate Standard-Zitat (Fassung 2026-11-25); mit Zitat Kachel mit Text, „Fourth Wing“, „S. 312“; Antippen öffnet Reiter „Notizbuch“', async () => {
  const repo = new InMemoryBookRepository();
  await repo.save({ id: 'fw', titel: 'Fourth Wing', status: 'gelesen', seitenanzahl: 500 });
  const zitate = new InMemoryZitatRepository();
  await zeige(zitate, repo);
  await waitFor(() => expect(norm(document.body.textContent)).toContain('„Ein Drache ohne seinen Reiter ist tragisch. Ein Reiter ohne seinen Drachen ist tot.“'), W);
  cleanup();
  await zitate.speichern({ id: 'z1', buchId: 'fw', text: 'Ich bin nicht das Feuer.', seite: 312, angelegtAm: new Date(2026, 10, 1).toISOString() });
  await zeige(zitate, repo);
  await waitFor(() => expect(textEls('Zitat des Tages').length).toBeGreaterThan(0), W);
  const t = norm(document.body.textContent);
  expect(t).toContain('„Ich bin nicht das Feuer.“');
  expect(t).not.toContain('Ein Drache ohne seinen Reiter');
  expect(t).toContain('Fourth Wing');
  expect(t).toContain('S. 312');
  await act(async () => {
    fireEvent.click(textEls(/Ich bin nicht das Feuer\./)[0]);
    await new Promise((r) => setTimeout(r, 30));
  });
  const d = await screen.findByRole('region', { name: 'Buchdetails' }, W);
  await waitFor(() => expect(within(d).getByRole('tab', { name: 'Notizbuch' })).toHaveAttribute('aria-selected', 'true'), W);
  expect(d.textContent).toContain('Fourth Wing');
});
