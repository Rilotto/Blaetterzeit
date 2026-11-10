import '@testing-library/jest-dom/vitest';
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, expect, it } from 'vitest';
import BuecherAnsicht from '@/views/BuecherAnsicht';

afterEach(() => cleanup());

it('[REQ-012/GROB] „Sagas“ und „Sammlungen“ unter „Noch zu lesen“, je ein Platzhalter mit Text, ohne Funktion', () => {
  render(<BuecherAnsicht buecher={[{ id: '12000000-0000-4000-8000-000000000001', titel: 'X', status: 'ungelesen' }]} />);
  const ntl = screen.getByRole('region', { name: 'Noch zu lesen' });
  const sagas = screen.getByRole('region', { name: 'Sagas' });
  const samml = screen.getByRole('region', { name: 'Sammlungen' });
  expect(ntl.compareDocumentPosition(sagas) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  expect(sagas.compareDocumentPosition(samml) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  for (const [r, text] of [
    [sagas, 'Deine nächste Saga wartet auf dich!'],
    [samml, 'Wie wäre es mit einer neuen Sammlung?'],
  ] as const) {
    expect(within(r).getByRole('heading')).toBeInTheDocument();
    expect(r.querySelectorAll('[data-cover-platzhalter]')).toHaveLength(1);
    expect(r.querySelector('[data-platzhaltertext]')).toHaveTextContent(text);
    const vorher = document.body.innerHTML;
    fireEvent.click(r.querySelector('[data-cover-platzhalter]')!);
    expect(document.body.innerHTML).toBe(vorher);
  }
});
