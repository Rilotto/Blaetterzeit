import '@testing-library/jest-dom/vitest';
import { act, cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { menueLage } from '@/buchdetails/Statuspille';
import type { Buch } from '@/domain/buch';
import { InMemoryBookRepository } from '@/storage/InMemoryBookRepository';
import { InMemoryImageStore } from '@/storage/InMemoryImageStore';
import BuchDetails from '@/views/BuchDetails';
import BuecherAnsicht from '@/views/BuecherAnsicht';

afterEach(cleanup);

const ID = '7d3e2a10-5b4c-4d6e-8f70-9a8b7c6d5e4f';
const jetzt = () => new Date(2026, 10, 12, 20, 0);
const buch = (extra: Partial<Buch> = {}): Buch => ({ id: ID, titel: 'Momo', status: 'ungelesen', ...extra });

async function zeige(b: Buch) {
  const repo = new InMemoryBookRepository();
  await repo.save(b);
  render(
    <BuchDetails buchId={b.id} buch={b} repository={repo} bildspeicher={new InMemoryImageStore()} jetzt={jetzt} onZurueck={() => {}} />,
  );
  await act(async () => {});
  return repo;
}

const tippe = async (el: Element) => {
  fireEvent.click(el);
  await act(async () => {});
};

describe('Statuspille und Statusmenü', () => {
  it('zeigt den Status, öffnet das Menü in fester Reihenfolge und speichert die Auswahl', async () => {
    const repo = await zeige(buch());
    const pille = document.querySelector('[data-statuspille]')!;
    expect(pille).toHaveTextContent('ungelesen');
    await tippe(pille);
    const menue = screen.getByRole('menu', { name: 'Status wählen' });
    expect(within(menue).getAllByRole('menuitem').map((e) => e.textContent)).toEqual([
      'ungelesen',
      'am lesen',
      'gelesen',
      'abgebrochen',
      'Wunschliste',
    ]);
    await tippe(within(menue).getByRole('menuitem', { name: 'gelesen' }));
    expect(screen.queryByRole('menu')).toBeNull();
    expect(pille).toHaveTextContent('gelesen');
    expect((await repo.get(ID))?.status).toBe('gelesen');
  });

  it('Tippen außerhalb schließt ohne Änderung', async () => {
    const repo = await zeige(buch());
    await tippe(document.querySelector('[data-statuspille]')!);
    await tippe(document.querySelector('[data-menue-hintergrund]')!);
    expect(screen.queryByRole('menu')).toBeNull();
    expect((await repo.get(ID))?.status).toBe('ungelesen');
  });

  it('Lage je nach Platz', () => {
    expect(menueLage({ top: 300, bottom: 336 }, 800)).toBe('unter');
    expect(menueLage({ top: 600, bottom: 636 }, 800)).toBe('ueber');
  });

  it('wirkt nach der Rückkehr auf „Noch zu lesen“', async () => {
    const repo = new InMemoryBookRepository();
    await repo.save(buch());
    render(<BuecherAnsicht repository={repo} bildspeicher={new InMemoryImageStore()} />);
    const liste = await screen.findByRole('list', { name: 'Noch zu lesen' });
    await tippe(liste.querySelector('[data-cover-platzhalter]')!);
    await tippe(document.querySelector('[data-statuspille]')!);
    await tippe(screen.getByRole('menuitem', { name: 'am lesen' }));
    await tippe(screen.getByRole('button', { name: 'Zurück' }));
    await act(async () => {});
    expect(screen.queryByText('Momo')).toBeNull();
  });
});

describe('Autor', () => {
  it('steht unter dem Titel, ohne Autor keine Zeile', async () => {
    await zeige(buch({ autor: 'Michael Ende' }));
    expect(document.querySelector('[data-buchdetails-autor]')).toHaveTextContent('Michael Ende');
    cleanup();
    await zeige(buch());
    expect(document.querySelector('[data-buchdetails-autor]')).toBeNull();
  });
});

describe('Fortschritt, Buchlänge und Aktuelle Seite', () => {
  it('ohne Seitenanzahl: Herz → Buchlänge → Sichern → Aktuelle Seite → Sichern', async () => {
    const repo = await zeige(buch());
    expect(screen.queryByRole('progressbar')).toBeNull();
    await tippe(document.querySelector('[data-fortschritt-herz]')!);
    const laenge = screen.getByRole('dialog', { name: 'Buchlänge' });
    await tippe(within(laenge).getByRole('button', { name: 'Sichern' }));
    expect(within(laenge).getByRole('alert')).toBeInTheDocument();
    fireEvent.change(within(laenge).getByRole('textbox', { name: 'Seitenanzahl' }), { target: { value: '400' } });
    await tippe(within(laenge).getByRole('button', { name: 'Sichern' }));
    expect(screen.queryByRole('dialog', { name: 'Buchlänge' })).toBeNull();
    const seite = screen.getByRole('dialog', { name: 'Aktuelle Seite' });
    expect((await repo.get(ID))?.seitenanzahl).toBe(400);
    expect(within(seite).getByRole('button', { name: 'Seite' })).toHaveAttribute('aria-pressed', 'true');
    fireEvent.change(within(seite).getByRole('textbox', { name: 'Aktuelle Seite' }), { target: { value: '42' } });
    await tippe(within(seite).getByRole('button', { name: 'Sichern' }));
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '10.5');
    expect(document.querySelector('[data-fortschritt-text]')).toHaveTextContent('42 / 400');
    expect(document.querySelector('[data-prozent]')).toHaveTextContent('11 %');
    expect(document.querySelector('[data-sitzungen]')).toHaveTextContent('1');
    expect(document.querySelector('[data-flamme]')).toHaveAttribute('data-flamme', 'aktiv');
    expect((await repo.get(ID))?.sitzungen).toEqual([{ zeitpunkt: jetzt().toISOString() }]);
  });

  it('Buchlänge per X schließen speichert nichts', async () => {
    const repo = await zeige(buch());
    await tippe(document.querySelector('[data-fortschritt-herz]')!);
    fireEvent.change(screen.getByRole('textbox', { name: 'Seitenanzahl' }), { target: { value: '400' } });
    await tippe(screen.getByRole('button', { name: 'Schließen' }));
    expect(screen.queryByRole('dialog')).toBeNull();
    expect((await repo.get(ID))?.seitenanzahl).toBeUndefined();
    expect(document.querySelector('[data-fortschritt-herz]')).not.toBeNull();
  });

  it('Modus „%“, Umrechnung, Obergrenze und Schließen ohne Speichern', async () => {
    const repo = await zeige(buch({ seitenanzahl: 400, aktuelleSeite: 42 }));
    await tippe(screen.getByRole('progressbar'));
    const dialog = screen.getByRole('dialog', { name: 'Aktuelle Seite' });
    await tippe(within(dialog).getByRole('button', { name: '%' }));
    expect(within(dialog).getByRole('textbox', { name: 'Prozent' })).toHaveValue('11');
    fireEvent.change(within(dialog).getByRole('textbox', { name: 'Prozent' }), { target: { value: '101' } });
    await tippe(within(dialog).getByRole('button', { name: 'Sichern' }));
    expect(screen.getByRole('dialog', { name: 'Aktuelle Seite' })).toBeInTheDocument();
    expect((await repo.get(ID))?.aktuelleSeite).toBe(42);
    await tippe(document.querySelector('[data-blatt-hintergrund]')!);
    expect(screen.queryByRole('dialog')).toBeNull();
    expect((await repo.get(ID))?.fortschrittsmodus).toBeUndefined();
  });

  it('Streak 0: Flamme inaktiv, 0 % ohne Fortschritt', async () => {
    await zeige(buch({ seitenanzahl: 400, sitzungen: [{ zeitpunkt: new Date(2026, 10, 10, 9).toISOString() }] }));
    expect(document.querySelector('[data-flamme]')).toHaveAttribute('data-flamme', 'inaktiv');
    expect(document.querySelector('[data-streak]')).toHaveTextContent('0');
    expect(document.querySelector('[data-prozent]')).toHaveTextContent('0 %');
  });
});
