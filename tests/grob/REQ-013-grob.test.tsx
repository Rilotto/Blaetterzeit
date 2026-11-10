import '@testing-library/jest-dom/vitest';
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import App from '@/App';

const T = vi.hoisted(() => ({
  buecher: [
    { id: '13000000-0000-4000-8000-000000000001', titel: 'Momo', status: 'ungelesen' as const },
    { id: '13000000-0000-4000-8000-000000000002', titel: 'Krabat', status: 'ungelesen' as const },
  ],
}));
vi.mock('@/buecher/demodaten', () => ({ demoBuecher: T.buecher }));

afterEach(() => cleanup());

const nav = () => screen.getByRole('navigation', { name: 'Hauptnavigation' });
const titelIn = (name: string) =>
  within(screen.getByRole('region', { name: 'Noch zu lesen' }))
    .getAllByRole('listitem')
    .find((li) => li.querySelector('[data-buchtitel]')?.textContent?.trim() === name)!;

it('[REQ-013/GROB] Antippen öffnet die Buchdetails dieses Buches; Kopfzeile; Zurück und Reiter „Bücher“ führen zurück', async () => {
  render(<App />);
  fireEvent.click(within(nav()).getByRole('button', { name: 'Bücher' }));
  await within(screen.getByRole('region', { name: 'Noch zu lesen' })).findByRole('list');

  fireEvent.click(titelIn('Krabat').querySelector('[data-buchtitel]')!);
  const d = await screen.findByRole('region', { name: 'Buchdetails' });
  await vi.waitFor(() => expect(d.querySelector('[data-buchdetails-titel]')).toHaveTextContent('Krabat'));
  expect(within(nav()).getByRole('button', { name: 'Bücher' })).toHaveAttribute('aria-current', 'page');
  expect(within(d).getByRole('button', { name: 'Zurück' })).toBeInTheDocument();
  expect(within(d).getByRole('button', { name: 'Weitere Optionen' })).toBeInTheDocument();
  expect(within(d).queryByText(/Kaufen/i)).toBeNull();

  fireEvent.click(within(d).getByRole('button', { name: 'Zurück' }));
  await screen.findByRole('heading', { name: 'Deine Bücher' });

  fireEvent.click(titelIn('Momo').querySelector('[data-cover-platzhalter], img')!);
  await screen.findByRole('region', { name: 'Buchdetails' });
  fireEvent.click(within(nav()).getByRole('button', { name: 'Bücher' }));
  await screen.findByRole('heading', { name: 'Deine Bücher' });
  expect(screen.queryByRole('region', { name: 'Buchdetails' })).toBeNull();
});
