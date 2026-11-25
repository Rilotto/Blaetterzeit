/**
 * Grober Test REQ-103 – Startseite „Diese Woche“: MO–SO der laufenden Woche mit Covern, heute umrandet, Lesesträhne.
 * Aufbau aus dem feinen Test tests/acceptance/REQ-103-startseite-woche-straehne.test.tsx.
 */
import '@testing-library/jest-dom/vitest';
import { cleanup, render, waitFor } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import type { Buch } from '@/domain/buch';
import { InMemoryEinstellungRepository, InMemoryListenRepository, InMemoryProfilRepository, InMemoryZitatRepository } from '@/storage';
import { InMemoryBookRepository } from '@/storage/InMemoryBookRepository';
import { InMemoryImageStore } from '@/storage/InMemoryImageStore';
import StartAnsicht from '@/start/StartAnsicht';

vi.mock('@/buecher/demodaten', () => ({ demoBuecher: [] }));
afterEach(cleanup);

const W = { timeout: 4000 };
const s = (t: number, h = 12) => ({ zeitpunkt: new Date(2026, 10, t, h).toISOString(), seite: 10 * t });
const norm = (t: string | null | undefined) => (t ?? '').replace(/[\s  ]+/g, ' ').trim();
const tage = () => Array.from(document.querySelectorAll<HTMLElement>('[data-kalender-tag]'));

it('[REQ-103/GROB] Mi 25.11.2026: Woche 23–29, Cover am Lesetag, der 25. umrandet; Lesen Mo–Mi ergibt angezündete Flamme 3', async () => {
  const repo = new InMemoryBookRepository();
  const fw: Buch = { id: 'fw', titel: 'Fourth Wing', status: 'gelesen', seitenanzahl: 500, sitzungen: [s(23, 20), s(24)] };
  const ifl: Buch = { id: 'ifl', titel: 'Iron Flame', status: 'gelesen', seitenanzahl: 500, sitzungen: [s(25, 8)] };
  await repo.save(fw);
  await repo.save(ifl);
  render(
    <StartAnsicht
      repository={repo}
      bildspeicher={new InMemoryImageStore()}
      listenRepository={new InMemoryListenRepository()}
      zitatRepository={new InMemoryZitatRepository()}
      profilRepository={new InMemoryProfilRepository()}
      einstellungRepository={new InMemoryEinstellungRepository()}
      jetzt={() => new Date(2026, 10, 25, 15)}
    />,
  );
  await waitFor(() => expect(tage().map((t) => Number(t.getAttribute('data-tag')))).toEqual([23, 24, 25, 26, 27, 28, 29]), W);
  await waitFor(() => expect(tage()[0].getAttribute('data-buch-id')).toBe('fw'), W);
  expect(tage()[2].getAttribute('data-buch-id')).toBe('ifl');
  for (const i of [3, 4, 5, 6]) expect(tage()[i].hasAttribute('data-buch-id')).toBe(false);
  expect(tage().filter((t) => t.getAttribute('data-heute') === 'true').map((t) => t.getAttribute('data-tag'))).toEqual(['25']);
  const flammen = document.querySelectorAll<HTMLElement>('[data-flamme]');
  expect(flammen).toHaveLength(1);
  expect(norm(flammen[0].querySelector('[data-streak-zahl]')?.textContent)).toBe('3');
  const p = flammen[0].querySelector<SVGPathElement>('path')!;
  expect(p.style.fill || p.getAttribute('fill')).toMatch(/url\(/);
});
