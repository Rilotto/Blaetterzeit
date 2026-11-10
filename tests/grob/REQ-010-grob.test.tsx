import '@testing-library/jest-dom/vitest';
import { cleanup, render, screen, within } from '@testing-library/react';
import { afterEach, expect, it } from 'vitest';
import BuecherAnsicht from '@/views/BuecherAnsicht';
import type { Buch } from '@/domain/buch';

afterEach(() => cleanup());

const COVER = `data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="200" height="300"/>')}`;

it('[REQ-010/GROB] Buch ohne Cover zeigt den Herz-Platzhalter, Buch mit Cover sein Bild', () => {
  const buecher: Buch[] = [
    { id: '10000000-0000-4000-8000-000000000001', titel: 'Ohne', status: 'ungelesen' },
    { id: '10000000-0000-4000-8000-000000000002', titel: 'Mit', status: 'ungelesen', cover: COVER },
  ];
  render(<BuecherAnsicht buecher={buecher} />);
  const [ohne, mit] = within(screen.getByRole('list', { name: 'Noch zu lesen' })).getAllByRole('listitem');
  const p = ohne.querySelector('[data-cover-platzhalter]')!;
  expect(p).not.toBeNull();
  expect(ohne.querySelector('img')).toBeNull();
  expect(p.querySelectorAll('[data-icon]')).toHaveLength(1);
  expect(p.querySelector('[data-icon]')).toHaveAttribute('data-icon', 'icon-herz.png');
  expect(mit.querySelector('[data-cover-platzhalter]')).toBeNull();
  expect(mit.querySelector('img')?.getAttribute('src')).toBe(COVER);
});
