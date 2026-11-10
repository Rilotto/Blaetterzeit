import '@testing-library/jest-dom/vitest';
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, expect, it } from 'vitest';
import App from '@/App';

afterEach(() => cleanup());

it('[REQ-002/GROB] fünf Menüpunkte in Reihenfolge, Start aktiv, Wechsel per Klick', () => {
  render(<App />);
  const nav = screen.getByRole('navigation', { name: 'Hauptnavigation' });
  const knoepfe = () => within(nav).getAllByRole('button');
  expect(knoepfe().map((b) => b.textContent?.trim())).toEqual(['Start', 'Bücher', 'Bibliothek', 'Statistik', 'Profil']);
  const aktive = () => knoepfe().filter((b) => b.getAttribute('aria-current') === 'page').map((b) => b.textContent?.trim());
  expect(aktive()).toEqual(['Start']);
  for (const b of knoepfe()) expect(b.querySelectorAll('[data-icon]')).toHaveLength(1);
  fireEvent.click(within(nav).getByRole('button', { name: 'Statistik' }));
  expect(aktive()).toEqual(['Statistik']);
  fireEvent.click(within(nav).getByRole('button', { name: 'Bücher' }));
  expect(aktive()).toEqual(['Bücher']);
});
