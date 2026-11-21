import '@testing-library/jest-dom/vitest';
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, expect, it } from 'vitest';
import App from '@/App';

afterEach(() => cleanup());

it('[REQ-005/GROB] Seite „Bücher“ zeigt Überschrift und zwei Schaltflächen in fester Reihenfolge, Filter ohne Wirkung, Plus öffnet ein Menü', () => {
  render(<App />);
  fireEvent.click(within(screen.getByRole('navigation', { name: 'Hauptnavigation' })).getByRole('button', { name: 'Bücher' }));
  const main = screen.getByRole('main');
  const h = within(main).getByRole('heading', { level: 1, name: 'Deine Bücher' });
  const filter = within(main).getByRole('button', { name: 'Filter und Einstellungen' });
  const plus = within(main).getByRole('button', { name: 'Buch hinzufügen' });
  expect(h.compareDocumentPosition(filter) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  expect(filter.compareDocumentPosition(plus) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  expect(within(main).queryByText('under construction :)')).toBeNull();
  const vorher = main.innerHTML;
  fireEvent.click(filter);
  expect(main.innerHTML).toBe(vorher);
  // Plus: Wirkung laut REQ-029 (Menü „Buch hinzufügen“), nicht mehr „ohne Wirkung“
  fireEvent.click(plus);
  expect(screen.getByRole('menu', { name: 'Buch hinzufügen' })).toBeInTheDocument();
});
