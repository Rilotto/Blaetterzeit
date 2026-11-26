/**
 * Grober Test REQ-121 – Profil „Aktueller Wert“ summiert die Preise aller Bücher außer der Wunschliste.
 * Aufbau aus dem feinen Test tests/acceptance/REQ-121-profil-deine-bibliothek-wert.test.tsx.
 */
import '@testing-library/jest-dom/vitest';
import { cleanup, render } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import type { Buch } from '@/domain/buch';
import { InMemoryProfilRepository } from '@/storage';
import { InMemoryBookRepository } from '@/storage/InMemoryBookRepository';
import ProfilAnsicht from '@/views/ProfilAnsicht';

vi.mock('@/buecher/demodaten', () => ({ demoBuecher: [] }));
afterEach(cleanup);

const norm = (t: string | null | undefined) => (t ?? '').replace(/[\s  ]+/g, ' ').trim();
const wert = () => norm(document.querySelector('[data-profil-bibliothek-zeile="wert"] [data-bibliothekswert] [data-zeile-wert]')?.textContent);

it('[REQ-121/GROB] 12,99 € gelesen + 20,00 € ungelesen + 30,00 € Wunschliste → „32,99 €“', async () => {
  const repo = new InMemoryBookRepository();
  const b = (titel: string, status: Buch['status'], preisCent: number) => ({ id: crypto.randomUUID(), titel, autor: 'X', status, preisCent }) as unknown as Buch;
  for (const x of [b('A', 'gelesen', 1299), b('B', 'ungelesen', 2000), b('C', 'wunschliste', 3000)]) await repo.save(x);
  render(<ProfilAnsicht repository={repo} profilRepository={new InMemoryProfilRepository()} />);
  await vi.waitFor(() => expect(wert()).toBe('32,99 €'), { timeout: 3000 });
});
