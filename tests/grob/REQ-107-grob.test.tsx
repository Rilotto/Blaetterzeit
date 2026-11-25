/**
 * Grober Test REQ-107 – Profil „Name“: hinterlegen zeigt ihn in der Zeile und im Gruß der Startseite; Leeren entfernt ihn.
 * Aufbau aus dem feinen Test tests/acceptance/REQ-107-profil-name.test.tsx.
 */
import '@testing-library/jest-dom/vitest';
import { act, cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import { InMemoryEinstellungRepository, InMemoryListenRepository, InMemoryProfilRepository, InMemoryZitatRepository } from '@/storage';
import { InMemoryBookRepository } from '@/storage/InMemoryBookRepository';
import { InMemoryImageStore } from '@/storage/InMemoryImageStore';
import StartAnsicht from '@/start/StartAnsicht';
import ProfilAnsicht from '@/views/ProfilAnsicht';

vi.mock('@/buecher/demodaten', () => ({ demoBuecher: [] }));
afterEach(cleanup);

const W = { timeout: 4000 };
const norm = (t: string | null | undefined) => (t ?? '').replace(/[\s  ]+/g, ' ').trim();
async function tippe(el: Element | null) {
  expect(el).not.toBeNull();
  await act(async () => {
    fireEvent.click(el!);
    await new Promise((r) => setTimeout(r, 30));
  });
}
async function nameSichern(wert: string) {
  await tippe(await screen.findByRole('button', { name: /^Name/ }, W));
  const d = await screen.findByRole('dialog', {}, W);
  fireEvent.change(within(d).getByRole('textbox'), { target: { value: wert } });
  await tippe(within(d).getByRole('button', { name: 'Sichern' }));
  await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull(), W);
}
async function gruss(profil: InMemoryProfilRepository) {
  cleanup();
  render(
    <StartAnsicht
      repository={new InMemoryBookRepository()}
      bildspeicher={new InMemoryImageStore()}
      listenRepository={new InMemoryListenRepository()}
      zitatRepository={new InMemoryZitatRepository()}
      profilRepository={profil}
      einstellungRepository={new InMemoryEinstellungRepository()}
      jetzt={() => new Date(2026, 10, 24, 12)}
    />,
  );
  return waitFor(() => {
    const k = Array.from(document.body.querySelectorAll<HTMLElement>('*')).filter((e) => /^Hallo(,.*)?$/.test(norm(e.textContent)));
    expect(k.length).toBeGreaterThan(0);
    return norm(k.filter((c) => !k.some((o) => o !== c && c.contains(o)))[0].textContent);
  }, W);
}

it('[REQ-107/GROB] Zeile „Name“ leer; „Christine“ sichern → Zeile und Gruß „Hallo, Christine“; Leeren → kein Name, Gruß „Hallo“', async () => {
  const profil = new InMemoryProfilRepository();
  render(<ProfilAnsicht profilRepository={profil} />);
  expect(norm((await screen.findByRole('button', { name: /^Name/ }, W)).textContent).replace(/\s/g, '')).toBe('Name›');
  await nameSichern('Christine');
  await waitFor(async () => expect(norm((await screen.findByRole('button', { name: /^Name/ })).textContent)).toMatch(/^Name\s*Christine\s*›$/), W);
  expect(await profil.nameLesen()).toBe('Christine');
  expect(await gruss(profil)).toBe('Hallo, Christine');
  cleanup();
  render(<ProfilAnsicht profilRepository={profil} />);
  await nameSichern('');
  expect(await profil.nameLesen()).toBeUndefined();
  expect(await gruss(profil)).toBe('Hallo');
});
