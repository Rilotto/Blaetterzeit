/**
 * Grober Test REQ-040 – Übersicht „Noch zu lesen“ über „Alle ansehen ›“.
 * Abgeleitet aus dem REQ-Text; Schnittstellen laut Absprache (Sprint 04, Teil C).
 * Offene Frage (Pille „Noch zu lesen“ auf der Seite „Bücher“) wird hier bewusst nicht geprüft.
 */
import '@testing-library/jest-dom/vitest';
import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import App from '@/App';
import { } from '@/buecher/abschnittKonfiguration';
import type { Buch, LesestatusId } from '@/domain/buch';
import { InMemoryAnsichtRepository } from '@/storage';
import { InMemoryBookRepository } from '@/storage/InMemoryBookRepository';
import { InMemoryImageStore } from '@/storage/InMemoryImageStore';
import BuecherAnsicht from '@/views/BuecherAnsicht';

const T = vi.hoisted(() => ({
  buecher: [{ id: '40000000-0000-4000-8000-000000000001', titel: 'Demo U', status: 'ungelesen' as const, eingetragenAm: '2026-01-01T00:00:00.000Z' }],
}));
vi.mock('@/buecher/demodaten', () => ({ demoBuecher: T.buecher }));

let nr = 0;
function buch(titel: string, status: LesestatusId = 'ungelesen'): Buch {
  nr += 1;
  return { id: `40400000-0000-4000-8000-${String(nr).padStart(12, '0')}`, titel, status, eingetragenAm: new Date(Date.UTC(2026, 0, 1) + nr * 60_000).toISOString() };
}

afterEach(() => cleanup());

const uebersicht = () => document.querySelector<HTMLElement>('[data-uebersicht]');
const aktive = () =>
  within(screen.getByRole('group', { name: 'Filter' }))
    .getAllByRole('button')
    .filter((b) => b.getAttribute('aria-pressed') === 'true')
    .map((b) => b.textContent?.trim());
const titel = () => Array.from(uebersicht()!.querySelectorAll('ul[data-buecher] > li [data-buchtitel]')).map((t) => t.textContent?.trim());
const geladen = () => waitFor(() => expect(uebersicht()?.getAttribute('data-ansicht')).toMatch(/^(raster|liste)$/));
const alleAnsehen = () => fireEvent.click(document.querySelector('[data-abschnitt="noch-zu-lesen"] [data-alle-ansehen]')!);

async function zeige(buecher: Buch[]) {
  const repository = new InMemoryBookRepository();
  for (const b of buecher) await repository.save(b);
  render(<BuecherAnsicht repository={repository} bildspeicher={new InMemoryImageStore()} ansichtRepository={new InMemoryAnsichtRepository()} jetzt={() => new Date('2026-11-12T10:00:00Z')} />);
  await waitFor(() => expect(document.querySelector('[data-abschnitt="alle-buecher"] ul, [data-abschnitt="alle-buecher"] [data-leere-liste]')).not.toBeNull());
  alleAnsehen();
  await geladen();
}

void [buch, titel, zeige]; // gemeinsamer Kopf aus dem feinen Test, hier nicht genutzt

it('[REQ-040/GROB] App: „Alle ansehen ›“ in „Noch zu lesen“ → Übersicht, Pille „Noch zu lesen“ aktiv, Menüpunkt „Bücher“ bleibt', async () => {
  render(<App />);
  const nav = screen.getByRole('navigation', { name: 'Hauptnavigation' });
  fireEvent.click(within(nav).getByRole('button', { name: 'Bücher' }));
  await waitFor(() => expect(document.querySelector('[data-abschnitt="noch-zu-lesen"] ul')).not.toBeNull());
  alleAnsehen();
  await geladen();
  expect(uebersicht()!.getAttribute('data-uebersicht')).toBe('noch_zu_lesen');
  expect(document.querySelector('[data-seite="buecher"]')).toBeNull();
  expect(aktive()).toEqual(['Noch zu lesen']);
  expect(within(nav).getByRole('button', { name: 'Bücher' })).toHaveAttribute('aria-current', 'page');
});
