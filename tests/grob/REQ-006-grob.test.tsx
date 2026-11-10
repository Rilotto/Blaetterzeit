import '@testing-library/jest-dom/vitest';
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, expect, it } from 'vitest';
import App from '@/App';

afterEach(() => cleanup());

const tap = (name: string) =>
  fireEvent.click(within(screen.getByRole('navigation', { name: 'Hauptnavigation' })).getByRole('button', { name }));
const filter = () => within(screen.getByRole('group', { name: 'Filter' })).getAllByRole('button');
const aktiv = () => filter().filter((b) => b.getAttribute('aria-pressed') === 'true').map((b) => b.textContent?.trim());

it('[REQ-006/GROB] Filterleiste: „Für dich“ aktiv, genau ein aktiver Filter, Wechsel per Klick, nach Seitenwechsel zurückgesetzt', () => {
  render(<App />);
  tap('Bücher');
  expect(filter().map((b) => b.textContent?.trim())).toEqual(['Für dich', 'Gerade am Lesen', 'Noch zu lesen']);
  expect(aktiv()).toEqual(['Für dich']);
  fireEvent.click(within(screen.getByRole('group', { name: 'Filter' })).getByRole('button', { name: 'Noch zu lesen' }));
  expect(aktiv()).toEqual(['Noch zu lesen']);
  tap('Start');
  tap('Bücher');
  expect(aktiv()).toEqual(['Für dich']);
});
