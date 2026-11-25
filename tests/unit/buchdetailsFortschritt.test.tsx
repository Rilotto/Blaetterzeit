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

  it('Wechsel auf gelesen setzt „Beendet am“, Blatt „Beendet am“ überschreibt (REQ-085)', async () => {
    const repo = await zeige(buch({ status: 'am_lesen' }));
    await tippe(document.querySelector('[data-statuspille]')!);
    await tippe(within(screen.getByRole('menu', { name: 'Status wählen' })).getByRole('menuitem', { name: 'gelesen' }));
    expect((await repo.get(ID))?.beendetAm).toBe('2026-11-12');
    await tippe(document.querySelector('[data-reiter="details"]')!);
    const zeile = document.querySelector('[data-ausgabe-zeile="beendet"]')!;
    expect(zeile).toHaveTextContent('Nov. 2026');
    await tippe(zeile);
    const feld = document.querySelector<HTMLInputElement>('[data-blatt-feld="beendet"]')!;
    expect(feld.value).toBe('12.11.2026');
    fireEvent.change(feld, { target: { value: '13112026' } });
    await tippe(document.querySelector('[data-blatt-sichern="beendet"]')!);
    expect((await repo.get(ID))?.beendetAm).toBe('2026-11-12');
    fireEvent.change(feld, { target: { value: '14032019' } });
    await tippe(document.querySelector('[data-blatt-sichern="beendet"]')!);
    expect((await repo.get(ID))?.beendetAm).toBe('2019-03-14');
    expect(document.querySelector('[data-ausgabe-zeile="beendet"]')).toHaveTextContent('März 2019');
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
    // Nur „Noch zu lesen“ prüfen: Im Abschnitt „Alle Bücher“ (REQ-035) steht das Buch unabhängig vom Status.
    const abschnitt = screen.getByRole('region', { name: 'Noch zu lesen' });
    expect(within(abschnitt).queryByText('Momo')).toBeNull();
  });
});

describe('Autor', () => {
  it('steht unter dem Titel, ohne Autor der Platzhalter „unbekannter Autor“ (REQ-094)', async () => {
    await zeige(buch({ autor: 'Michael Ende' }));
    expect(document.querySelector('[data-buchdetails-autor]')).toHaveTextContent('Michael Ende');
    cleanup();
    await zeige(buch());
    expect(document.querySelector('[data-buchdetails-autor]')).toHaveTextContent('unbekannter Autor');
    expect(document.querySelector('[data-buchdetails-autor]')).toHaveAttribute('data-autor-platzhalter', 'true');
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
    expect((await repo.get(ID))?.sitzungen).toEqual([{ seite: 42, zeitpunkt: jetzt().toISOString() }]);
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

  it('Leeren im Modus „%“ behält den Modus, auch nach Neustart (REQ-024, REQ-093)', async () => {
    const repo = await zeige(buch({ seitenanzahl: 400, fortschrittsmodus: 'prozent', fortschrittProzent: 30 }));
    await tippe(screen.getByRole('progressbar'));
    const dialog = screen.getByRole('dialog', { name: 'Aktuelle Seite' });
    fireEvent.change(within(dialog).getByRole('textbox', { name: 'Prozent' }), { target: { value: '' } });
    await tippe(within(dialog).getByRole('button', { name: 'Sichern' }));
    const gespeichert = (await repo.get(ID))!;
    expect(gespeichert.fortschrittsmodus).toBe('prozent');
    expect(gespeichert.fortschrittProzent).toBeUndefined();
    expect(gespeichert.sitzungen).toBeUndefined();
    cleanup();
    render(
      <BuchDetails buchId={ID} buch={gespeichert} repository={repo} bildspeicher={new InMemoryImageStore()} jetzt={jetzt} onZurueck={() => {}} />,
    );
    await act(async () => {});
    await tippe(screen.getByRole('progressbar'));
    expect(within(screen.getByRole('dialog', { name: 'Aktuelle Seite' })).getByRole('textbox', { name: 'Prozent' })).toHaveValue('');
  });

  it('Rekord-Streak (REQ-109): ohne Sitzung 0 inaktiv; alte Sitzung bleibt 1 angezündet; 0 % ohne Fortschritt', async () => {
    await zeige(buch({ seitenanzahl: 400 }));
    expect(document.querySelector('[data-flamme]')).toHaveAttribute('data-flamme', 'inaktiv');
    expect(document.querySelector('[data-streak-zahl]')).toHaveTextContent('0');
    cleanup();
    await zeige(buch({ seitenanzahl: 400, sitzungen: [{ zeitpunkt: new Date(2026, 10, 10, 9).toISOString() }] }));
    expect(document.querySelector('[data-flamme]')).toHaveAttribute('data-flamme', 'aktiv');
    expect(document.querySelector('[data-streak-zahl]')).toHaveTextContent('1');
    expect(document.querySelector('[data-prozent]')).toHaveTextContent('0 %');
  });
});
