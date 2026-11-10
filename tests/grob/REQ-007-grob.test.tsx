import '@testing-library/jest-dom/vitest';
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import BuecherAnsicht from '@/views/BuecherAnsicht';
import { filterKonfiguration, type FilterDefinition } from '@/buecher/filterKonfiguration';

afterEach(() => cleanup());

it('[REQ-007/GROB] Leiste folgt der Konfiguration (Name, Reihenfolge, Standard), jeder Filter löst seine Logik aus', () => {
  expect([...filterKonfiguration].sort((a, b) => a.reihenfolge - b.reihenfolge).map((f) => [f.name, !!f.standard])).toEqual([
    ['Für dich', true],
    ['Gerade am Lesen', false],
    ['Noch zu lesen', false],
  ]);
  for (const f of filterKonfiguration) expect(typeof f.logik).toBe('function');

  const konfig: FilterDefinition[] = [
    { id: 'z', name: 'Zweiter', reihenfolge: 2, logik: vi.fn((b) => b) },
    { id: 'e', name: 'Erster', reihenfolge: 1, standard: true, logik: vi.fn((b) => b) },
    { id: 'd', name: 'Dritter', reihenfolge: 3, logik: vi.fn((b) => b) },
  ];
  render(<BuecherAnsicht filter={konfig} buecher={[]} />);
  const leiste = screen.getByRole('group', { name: 'Filter' });
  expect(within(leiste).getAllByRole('button').map((b) => b.textContent?.trim())).toEqual(['Erster', 'Zweiter', 'Dritter']);
  fireEvent.click(within(leiste).getByRole('button', { name: 'Dritter' }));
  expect(konfig[2].logik).toHaveBeenCalled();
});
