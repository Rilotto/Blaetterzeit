/**
 * Grober Test REQ-101 – Startseite: Kopf mit Wochentag, Uhrzeit, Gruß mit Namen und Tageszeit-Icon.
 * Aufbau aus dem feinen Test tests/acceptance/REQ-101-startseite-kopf-gruss.test.tsx.
 */
import '@testing-library/jest-dom/vitest';
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import { InMemoryEinstellungRepository, InMemoryListenRepository, InMemoryProfilRepository, InMemoryZitatRepository } from '@/storage';
import { InMemoryBookRepository } from '@/storage/InMemoryBookRepository';
import { InMemoryImageStore } from '@/storage/InMemoryImageStore';
import StartAnsicht from '@/start/StartAnsicht';

vi.mock('@/buecher/demodaten', () => ({ demoBuecher: [] }));
afterEach(cleanup);

const W = { timeout: 4000 };
const norm = (t: string | null | undefined) => (t ?? '').replace(/[\s  ]+/g, ' ').trim();
const GRUSS = /^(Guten Morgen|Hallo|Guten Abend|Gute Nacht)(,.*)?$/;
function gruss() {
  const k = Array.from(document.body.querySelectorAll<HTMLElement>('*')).filter((e) => GRUSS.test(norm(e.textContent)));
  return k.filter((c) => !k.some((o) => o !== c && c.contains(o))).map((e) => norm(e.textContent));
}
async function zeige(jetzt: Date, name?: string) {
  const profil = new InMemoryProfilRepository();
  if (name) await profil.nameSpeichern(name);
  render(
    <StartAnsicht
      repository={new InMemoryBookRepository()}
      bildspeicher={new InMemoryImageStore()}
      listenRepository={new InMemoryListenRepository()}
      zitatRepository={new InMemoryZitatRepository()}
      profilRepository={profil}
      einstellungRepository={new InMemoryEinstellungRepository()}
      jetzt={() => jetzt}
    />,
  );
}

it('[REQ-101/GROB] Dienstag 07:30 mit Namen: „Guten Morgen, Christine“, Sonnenaufgang, Uhrzeit; 21:00 ohne Namen: „Gute Nacht“, Mond', async () => {
  await zeige(new Date(2026, 10, 24, 7, 30), 'Christine');
  await waitFor(() => expect(gruss()).toEqual(['Guten Morgen, Christine']), W);
  expect(screen.getByRole('img', { name: 'Sonnenaufgang' })).toBeInTheDocument();
  expect(norm(document.body.textContent)).toContain('Dienstag');
  expect(norm(document.body.textContent)).toMatch(/(^|\D)0?7:30(\D|$)/);
  expect(document.body.textContent).not.toContain('under construction');
  cleanup();
  await zeige(new Date(2026, 10, 24, 21, 0));
  await waitFor(() => expect(gruss()).toEqual(['Gute Nacht']), W);
  expect(screen.getByRole('img', { name: 'Mond' })).toBeInTheDocument();
});
