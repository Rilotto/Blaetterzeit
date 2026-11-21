/**
 * Grober Test REQ-039 – Filterleiste: Filterpille „Alle“ öffnet die Übersicht „Alle Bücher“.
 * Abgeleitet aus dem REQ-Text; Schnittstellen laut Absprache (Sprint 04, Teil C).
 */
import '@testing-library/jest-dom/vitest';
import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';

import { } from '@/buecher/filterKonfiguration';
import type { Buch, LesestatusId } from '@/domain/buch';
import { InMemoryAnsichtRepository } from '@/storage';
import { InMemoryBookRepository } from '@/storage/InMemoryBookRepository';
import { InMemoryImageStore } from '@/storage/InMemoryImageStore';
import BuecherAnsicht from '@/views/BuecherAnsicht';

const T = vi.hoisted(() => ({
  buecher: [
    { id: '39000000-0000-4000-8000-000000000001', titel: 'Demo U', status: 'ungelesen' as const, eingetragenAm: '2026-01-01T00:00:00.000Z' },
    { id: '39000000-0000-4000-8000-000000000002', titel: 'Demo G', status: 'gelesen' as const, eingetragenAm: '2026-01-02T00:00:00.000Z' },
  ],
}));
vi.mock('@/buecher/demodaten', () => ({ demoBuecher: T.buecher }));

const ALLE_STATUS: LesestatusId[] = ['ungelesen', 'am_lesen', 'gelesen', 'abgebrochen', 'wunschliste'];
let nr = 0;
function buch(titel: string, status: LesestatusId = 'ungelesen'): Buch {
  nr += 1;
  return { id: `39390000-0000-4000-8000-${String(nr).padStart(12, '0')}`, titel, status, eingetragenAm: new Date(Date.UTC(2026, 0, 1) + nr * 60_000).toISOString() };
}

afterEach(() => cleanup());

const leiste = () => screen.getByRole('group', { name: 'Filter' });
const pillen = () => within(leiste()).getAllByRole('button');
const aktive = () => pillen().filter((b) => b.getAttribute('aria-pressed') === 'true').map((b) => b.textContent?.trim());
const uebersicht = () => document.querySelector<HTMLElement>('[data-uebersicht]');
const geladen = () => waitFor(() => expect(uebersicht()?.getAttribute('data-ansicht')).toMatch(/^(raster|liste)$/));

async function zeige(buecher: Buch[]) {
  const repository = new InMemoryBookRepository();
  for (const b of buecher) await repository.save(b);
  render(<BuecherAnsicht repository={repository} bildspeicher={new InMemoryImageStore()} ansichtRepository={new InMemoryAnsichtRepository()} jetzt={() => new Date('2026-11-12T10:00:00Z')} />);
  await waitFor(() => expect(document.querySelector('[data-abschnitt="alle-buecher"] ul, [data-abschnitt="alle-buecher"] [data-leere-liste]')).not.toBeNull());
}

void [ALLE_STATUS]; // gemeinsamer Kopf aus dem feinen Test, hier nicht genutzt

it('[REQ-039/GROB] „Alle“ antippen → Übersicht „Alle Bücher“, „Alle“ ist dort einziger aktiver Filter', async () => {
  await zeige([buch('A'), buch('B', 'gelesen')]);
  fireEvent.click(within(leiste()).getByRole('button', { name: 'Alle' }));
  await geladen();
  expect(uebersicht()!.getAttribute('data-uebersicht')).toBe('alle');
  expect(document.querySelector('[data-seite="buecher"]')).toBeNull();
  expect(aktive()).toEqual(['Alle']);
  expect(within(leiste()).getByRole('button', { name: 'Alle' })).toHaveAttribute('data-filter', 'alle');
});
