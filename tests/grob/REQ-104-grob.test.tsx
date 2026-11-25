/**
 * Grober Test REQ-104 – Startseite Jahresziel: ohne Ziel „Jahresziel festlegen“, Ziel 20 sichern, Zählung gelesener Bücher des Jahres.
 * Aufbau aus dem feinen Test tests/acceptance/REQ-104-startseite-jahresziel.test.tsx.
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
const MIT = /^\d+\s*von\s*\d+\s*Büchern(\s*\d{4})?$/;
function textEls(text: string | RegExp) {
  const passt = (t: string) => (typeof text === 'string' ? t === text : text.test(t));
  const k = Array.from(document.body.querySelectorAll<HTMLElement>('*')).filter((e) => passt(norm(e.textContent)));
  return k.filter((c) => !k.some((o) => o !== c && c.contains(o)));
}
async function tippe(el: Element | null | undefined) {
  expect(el).toBeTruthy();
  await act(async () => {
    fireEvent.click(el!);
    await new Promise((r) => setTimeout(r, 30));
  });
}

it('[REQ-104/GROB] ohne Ziel „Jahresziel festlegen“; 20 sichern → „3 von 20 Büchern“ (nur 2026 gelesen), Ziel gespeichert; 0 wird abgelehnt', async () => {
  const repo = new InMemoryBookRepository();
  const profil = new InMemoryProfilRepository();
  const b = (titel: string, f: Partial<Buch>): Buch => ({ id: crypto.randomUUID(), titel, status: 'gelesen', seitenanzahl: 300, ...f });
  for (const x of [b('Eins', { beendetAm: '2026-03-01' }), b('Zwei', { beendetAm: '2026-11-20' }), b('Nachgetragen', { beendetAm: '2026-06-15' }), b('Vorjahr', { beendetAm: '2025-12-31' }), b('AmLesen', { status: 'am_lesen', beendetAm: '2026-05-05' })]) await repo.save(x);
  render(
    <StartAnsicht
      repository={repo}
      bildspeicher={new InMemoryImageStore()}
      listenRepository={new InMemoryListenRepository()}
      zitatRepository={new InMemoryZitatRepository()}
      profilRepository={profil}
      einstellungRepository={new InMemoryEinstellungRepository()}
      jetzt={() => new Date(2026, 10, 24, 12)}
    />,
  );
  await tippe(await waitFor(() => textEls('Jahresziel festlegen')[0], W));
  const d = await screen.findByRole('dialog', {}, W);
  const feld = d.querySelector<HTMLInputElement>('input')!;
  fireEvent.change(feld, { target: { value: '0' } });
  await tippe(within(d).getByRole('button', { name: 'Sichern' }));
  expect(screen.queryByRole('dialog')).not.toBeNull();
  expect(await profil.jahreszielLesen(2026)).toBeUndefined();
  fireEvent.change(feld, { target: { value: '20' } });
  await tippe(within(d).getByRole('button', { name: 'Sichern' }));
  await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull(), W);
  await waitFor(() => expect(textEls(MIT).map((e) => norm(e.textContent).replace(/\s*\d{4}$/, ''))).toEqual(['3 von 20 Büchern']), W);
  expect(norm(document.body.textContent)).toMatch(/2026/);
  expect(await profil.jahreszielLesen(2026)).toBe(20);
});
