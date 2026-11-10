import '@testing-library/jest-dom/vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, expect, it } from 'vitest';
import BuecherAnsicht from '@/views/BuecherAnsicht';
import type { Buch } from '@/domain/buch';

afterEach(() => cleanup());

const b = (nr: number, status: Buch['status']): Buch => ({ id: `11000000-0000-4000-8000-00000000000${nr}`, titel: `Buch ${nr}`, status });

it('[REQ-011/GROB] leerer Abschnitt zeigt Herz-Platzhalter mit Text, der nichts bewirkt; mit Buch verschwindet er', () => {
  const { rerender } = render(<BuecherAnsicht buecher={[b(1, 'gelesen')]} />);
  const region = screen.getByRole('region', { name: 'Noch zu lesen' });
  const leer = region.querySelector<HTMLElement>('[data-leere-liste]')!;
  expect(leer).not.toBeNull();
  expect(leer).toHaveTextContent('Wie wäre es mit einem neuen Buch?');
  expect(leer.querySelector('[data-icon]')).toHaveAttribute('data-icon', 'icon-herz.png');
  const vorher = document.body.innerHTML;
  fireEvent.click(leer);
  expect(document.body.innerHTML).toBe(vorher);
  rerender(<BuecherAnsicht buecher={[b(1, 'gelesen'), b(2, 'ungelesen')]} />);
  expect(screen.getByRole('region', { name: 'Noch zu lesen' }).querySelector('[data-leere-liste]')).toBeNull();
});
