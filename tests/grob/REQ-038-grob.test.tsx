/**
 * Grober Test REQ-038 – Übersichten: Suche nach Titel oder Autor.
 *
 * Abgeleitet aus dem REQ-Text. Schnittstellen laut Absprache (Sprint 04, Teil C):
 *  input[type=search][data-suchfeld] (Placeholder „In … suchen“), ul[data-buecher] fehlt ohne Treffer.
 * Ob die Suche beim Wechsel der Pille geleert wird, steht nicht im REQ und wird nicht geprüft.
 */
import '@testing-library/jest-dom/vitest';
import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { afterEach, expect, it } from 'vitest';
import type { Buch, LesestatusId } from '@/domain/buch';
import { InMemoryAnsichtRepository } from '@/storage';
import { InMemoryBookRepository } from '@/storage/InMemoryBookRepository';
import { InMemoryImageStore } from '@/storage/InMemoryImageStore';
import BuecherAnsicht from '@/views/BuecherAnsicht';

let nr = 0;
function buch(titel: string, status: LesestatusId = 'ungelesen', autor?: string): Buch {
  nr += 1;
  return { id: `38380000-0000-4000-8000-${String(nr).padStart(12, '0')}`, titel, status, ...(autor ? { autor } : {}), eingetragenAm: new Date(Date.UTC(2026, 0, 1) + nr * 60_000).toISOString() };
}

afterEach(() => cleanup());

const uebersicht = () => document.querySelector<HTMLElement>('[data-uebersicht]')!;
const feld = () => uebersicht().querySelector<HTMLInputElement>('input[type=search][data-suchfeld]')!;
const titel = () => Array.from(uebersicht().querySelectorAll('ul[data-buecher] > li [data-buchtitel]')).map((t) => t.textContent?.trim());
const tippe = (text: string) => fireEvent.change(feld(), { target: { value: text } });
const geladen = () => waitFor(() => expect(document.querySelector('[data-uebersicht]')?.getAttribute('data-ansicht')).toMatch(/^(raster|liste)$/));

async function zeige(buecher: Buch[], liste: 'Alle' | 'Noch zu lesen' | 'Gerade am Lesen' = 'Alle') {
  const repository = new InMemoryBookRepository();
  for (const b of buecher) await repository.save(b);
  render(<BuecherAnsicht repository={repository} bildspeicher={new InMemoryImageStore()} ansichtRepository={new InMemoryAnsichtRepository()} jetzt={() => new Date('2026-11-12T10:00:00Z')} />);
  await waitFor(() => expect(document.querySelector('[data-abschnitt="alle-buecher"] ul, [data-abschnitt="alle-buecher"] [data-leere-liste]')).not.toBeNull());
  if (liste === 'Noch zu lesen') fireEvent.click(document.querySelector('[data-abschnitt="noch-zu-lesen"] [data-alle-ansehen]')!);
  else fireEvent.click(within(screen.getByRole('group', { name: 'Filter' })).getByRole('button', { name: liste }));
  await geladen();
}

it('[REQ-038/GROB] „BOU“ → nur „Dire bound“, Ergebnis nach jedem Zeichen ohne Bestätigung', async () => {
  await zeige([buch('Dire bound'), buch('Threshing day', 'gelesen')]);
  expect(titel()).toEqual(['Dire bound', 'Threshing day']);
  tippe('B');
  expect(titel()).toEqual(['Dire bound']); // „b“ nur in „Dire bound“
  tippe('BO');
  expect(titel()).toEqual(['Dire bound']);
  tippe('BOU');
  expect(titel()).toEqual(['Dire bound']);
});
