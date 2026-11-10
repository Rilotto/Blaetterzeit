import '@testing-library/jest-dom/vitest';
import { cleanup, render, screen, within } from '@testing-library/react';
import { afterEach, expect, it } from 'vitest';
import BuecherAnsicht from '@/views/BuecherAnsicht';
import type { Buch } from '@/domain/buch';

afterEach(() => cleanup());

let n = 0;
const buch = (titel: string, status: Buch['status'] = 'ungelesen'): Buch => ({
  id: `00000000-0000-4000-8000-${String(++n).padStart(12, '0')}`,
  titel,
  status,
});

it('[REQ-009/GROB] „Noch zu lesen“ zeigt alle ungelesenen Bücher (ohne Begrenzung) in Reihenfolge, je mit Titel unter Cover', () => {
  const ungelesen = Array.from({ length: 12 }, (_, i) => buch(`Buch ${i + 1}`));
  render(<BuecherAnsicht buecher={[buch('Fertig', 'gelesen'), ...ungelesen, buch('Läuft', 'am_lesen')]} />);
  const region = screen.getByRole('region', { name: 'Noch zu lesen' });
  expect(within(region).getByRole('heading', { name: 'Noch zu lesen' })).toBeInTheDocument();
  const eintraege = within(within(region).getByRole('list', { name: 'Noch zu lesen' })).getAllByRole('listitem');
  expect(eintraege.map((li) => li.querySelector('[data-buchtitel]')?.textContent?.trim())).toEqual(ungelesen.map((b) => b.titel));
  for (const li of eintraege) {
    const cover = li.querySelector('img, [data-cover-platzhalter]')!;
    const titel = li.querySelector('[data-buchtitel]')!;
    expect(cover.compareDocumentPosition(titel) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  }
});
