import '@testing-library/jest-dom/vitest';
import { act, cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { Bildquelle } from '@/bild/bildquelle';
import { buchAusEingaben, jahrFiltern, jahrUngueltig, LEERE_EINGABEN, seitenFiltern, titelFehlt } from '@/buchanlegen/eingabe';
import { demodatenAktiv, demodatenEinspielen } from '@/buecher/buchQuelle';
import { demoBuecher } from '@/buecher/demodaten';
import { buchAusDaten, istErscheinungsdatum } from '@/domain/buch';
import { InMemoryBookRepository } from '@/storage/InMemoryBookRepository';
import { InMemoryImageStore } from '@/storage/InMemoryImageStore';
import BuecherAnsicht from '@/views/BuecherAnsicht';

vi.mock('@/bild/bildverarbeitung', () => ({
  zuschneiden: async (bild: string) => bild,
  bildBegrenzen: async (bild: string) => bild,
}));

const PNG = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAIAAACQd1PeAAAADElEQVR4nGP4z8AAAAMBAQDJ/pLvAAAAAElFTkSuQmCC';

afterEach(() => cleanup());

describe('Eingaberegeln Manueller Eintrag', () => {
  it('Jahr: nur Ziffern, höchstens vier', () => {
    expect(jahrFiltern('20a245')).toBe('2024');
    expect(jahrFiltern('abc')).toBe('');
    expect(seitenFiltern('3x50')).toBe('350');
  });

  it('Titel aus Leerzeichen fehlt, Jahr mit 1–3 Ziffern ist ungültig, leer ist gültig', () => {
    expect(titelFehlt({ ...LEERE_EINGABEN, titel: '   ' })).toBe(true);
    expect(jahrUngueltig({ ...LEERE_EINGABEN, jahr: '199' })).toBe(true);
    expect(jahrUngueltig({ ...LEERE_EINGABEN, jahr: '' })).toBe(false);
    expect(jahrUngueltig({ ...LEERE_EINGABEN, jahr: '1999' })).toBe(false);
  });

  it('baut ein Buch ohne Platzhalterwerte und mit Status „ungelesen“', () => {
    const b = buchAusEingaben({ titel: ' Testbuch ', autor: '', jahr: '', seiten: '' }, new Date('2026-11-12T10:00:00.000Z'));
    expect(Object.keys(b).sort()).toEqual(['eingetragenAm', 'id', 'status', 'titel']);
    expect(b.eingetragenAm).toBe('2026-11-12T10:00:00.000Z');
    expect(b).toMatchObject({ titel: 'Testbuch', status: 'ungelesen' });
    const v = buchAusEingaben({ titel: 'T', autor: 'A B', jahr: '2019', seiten: '350' });
    expect(v).toMatchObject({ autor: 'A B', erscheinungsjahr: 2019, seitenanzahl: 350 });
    expect(v.erscheinungsdatum).toBeUndefined();
    expect(() => buchAusEingaben({ ...LEERE_EINGABEN, titel: 'T', jahr: '19' })).toThrow();
  });

  it('Erscheinungsdatum TT.MM.JJJJ und Datensätze ohne Ersatzwerte', () => {
    expect(istErscheinungsdatum('03.09.2019')).toBe(true);
    expect(istErscheinungsdatum('31.02.2019')).toBe(false);
    expect(istErscheinungsdatum('2019-09-03')).toBe(false);
    expect(buchAusDaten({ id: 'x', titel: 'T', status: 'ungelesen', autor: null, seitenanzahl: null })).toEqual({
      id: 'x',
      titel: 'T',
      status: 'ungelesen',
    });
    expect(() => buchAusDaten({ id: 'x', titel: 'T', status: 'unbekannt' })).toThrow();
  });
});

describe('Demodaten-Schalter', () => {
  it('VITE_DEMODATEN=aus schaltet die Demodaten ab, sonst sind sie aktiv', () => {
    expect(demodatenAktiv('aus')).toBe(false);
    expect(demodatenAktiv(' AUS ')).toBe(false);
    expect(demodatenAktiv(undefined)).toBe(true);
    expect(demodatenAktiv('an')).toBe(true);
  });

  it('spielt Demodaten nur in einen leeren Speicher und nur, wenn aktiv', async () => {
    const leer = new InMemoryBookRepository();
    await demodatenEinspielen(leer, false);
    expect(await leer.list()).toEqual([]);
    await demodatenEinspielen(leer, true);
    expect(await leer.list()).toEqual(demoBuecher);

    const belegt = new InMemoryBookRepository();
    await belegt.save({ id: 'eigen', titel: 'Eigenes Buch', status: 'ungelesen' });
    await demodatenEinspielen(belegt, true);
    expect((await belegt.list()).map((b) => b.id)).toEqual(['eigen']);
  });
});

describe('Buch anlegen über das Plus-Menü', () => {
  const plus = () => screen.getByRole('button', { name: 'Buch hinzufügen' });
  const blatt = () => screen.queryByRole('dialog', { name: 'Manueller Eintrag' });

  function starte(repo = new InMemoryBookRepository(), bildquelle?: Bildquelle) {
    const speicher = new InMemoryImageStore();
    render(<BuecherAnsicht repository={repo} bildspeicher={speicher} bildquelle={bildquelle} />);
    return { repo, speicher };
  }
  function oeffneBlatt() {
    fireEvent.click(plus());
    fireEvent.click(within(screen.getByRole('menu', { name: 'Buch hinzufügen' })).getByRole('menuitem'));
    return blatt()!;
  }

  it('Plus öffnet das Menü mit „ד, Tippen außerhalb schließt es wieder', () => {
    starte();
    fireEvent.click(plus());
    const menue = screen.getByRole('menu', { name: 'Buch hinzufügen' });
    expect(within(menue).getAllByRole('menuitem')).toHaveLength(1);
    expect(menue.querySelector('[data-icon="icon-hand-eintragen.png"]')).not.toBeNull();
    const x = screen.getByRole('button', { name: 'Menü schließen' });
    expect(x.querySelector('[data-icon="icon-x.png"]')).not.toBeNull();
    fireEvent.click(menue);
    expect(screen.queryByRole('menu')).not.toBeNull();
    fireEvent.click(document.querySelector('[data-menue-hintergrund]')!);
    expect(screen.queryByRole('menu')).toBeNull();
    expect(plus().querySelector('[data-icon="icon-plus.png"]')).not.toBeNull();
    fireEvent.click(plus());
    fireEvent.click(screen.getByRole('button', { name: 'Menü schließen' }));
    expect(screen.queryByRole('menu')).toBeNull();
    expect(blatt()).toBeNull();
  });

  it('ohne Titel: Hinweis, nichts gespeichert; ungültiges Jahr markiert', async () => {
    const { repo } = starte();
    const b = oeffneBlatt();
    fireEvent.change(within(b).getByLabelText('Autor'), { target: { value: 'A' } });
    fireEvent.click(within(b).getByRole('button', { name: 'Hinzufügen' }));
    expect(within(b).getByRole('alert')).toHaveTextContent('Bitte gib einen Titel ein');
    fireEvent.change(within(b).getByLabelText('Titel'), { target: { value: 'T' } });
    expect(within(b).queryByRole('alert')).toBeNull();
    fireEvent.change(within(b).getByLabelText('Jahr'), { target: { value: '199' } });
    fireEvent.click(within(b).getByRole('button', { name: 'Hinzufügen' }));
    expect(within(b).getByLabelText('Jahr')).toHaveAttribute('data-fehler', 'true');
    expect(within(b).queryByRole('alert')).toBeNull();
    fireEvent.change(within(b).getByLabelText('Jahr'), { target: { value: '1999' } });
    expect(within(b).getByLabelText('Jahr')).not.toHaveAttribute('data-fehler');
    await act(async () => {});
    expect(await repo.list()).toEqual([]);
    expect(blatt()).not.toBeNull();
  });

  it('Hinzufügen speichert alle Angaben samt Cover und zeigt die Buchdetails', async () => {
    const quelle: Bildquelle = { scannen: async () => null, galerie: async () => PNG };
    const { repo, speicher } = starte(undefined, quelle);
    const b = oeffneBlatt();
    fireEvent.change(within(b).getByLabelText('Titel'), { target: { value: 'Testbuch' } });
    fireEvent.change(within(b).getByLabelText('Autor'), { target: { value: 'Vorname Nachname' } });
    fireEvent.change(within(b).getByLabelText('Jahr'), { target: { value: '2019' } });
    fireEvent.change(within(b).getByLabelText('Seiten'), { target: { value: '350' } });
    fireEvent.click(within(b).getByRole('button', { name: 'Cover hinzufügen' }));
    fireEvent.click(screen.getByRole('menuitem', { name: /Aus Galerie auswählen/ }));
    const zuschnitt = await screen.findByRole('region', { name: 'Zuschnitt' });
    expect(zuschnitt).toHaveAttribute('data-startformat', 'cover');
    fireEvent.click(within(zuschnitt).getByRole('button', { name: /Bestätigen|Übernehmen|Fertig/ }));
    const b2 = await screen.findByRole('dialog', { name: 'Manueller Eintrag' });
    await waitFor(() => expect(b2.querySelector('[data-cover-vorschau]')).not.toBeNull());
    expect(within(b2).getByLabelText('Titel')).toHaveValue('Testbuch');
    fireEvent.click(within(b2).getByRole('button', { name: 'Hinzufügen' }));
    const details = await screen.findByRole('region', { name: 'Buchdetails' });
    expect(details.querySelector('[data-buchdetails-titel]')).toHaveTextContent('Testbuch');
    const [buch] = await repo.list();
    expect(buch).toMatchObject({ titel: 'Testbuch', autor: 'Vorname Nachname', erscheinungsjahr: 2019, seitenanzahl: 350, status: 'ungelesen' });
    expect(await speicher.get(buch.id, 'cover')).toBe(PNG);
  });

  it('X, Zurück-Taste und Herunterziehen schließen ohne Speichern; Antippen des Griffs nicht', async () => {
    const { repo } = starte();
    let b = oeffneBlatt();
    fireEvent.change(within(b).getByLabelText('Titel'), { target: { value: 'T' } });
    fireEvent.click(within(b).getByRole('button', { name: 'Schließen' }));
    expect(blatt()).toBeNull();

    b = oeffneBlatt();
    fireEvent.change(within(b).getByLabelText('Titel'), { target: { value: 'T' } });
    act(() => {
      window.dispatchEvent(new PopStateEvent('popstate'));
    });
    expect(blatt()).toBeNull();

    b = oeffneBlatt();
    fireEvent.change(within(b).getByLabelText('Titel'), { target: { value: 'T' } });
    const griff = b.querySelector('[data-ziehgriff]')!;
    fireEvent.pointerDown(griff, { clientY: 20, pointerId: 1 });
    fireEvent.pointerUp(griff, { clientY: 22, pointerId: 1 });
    expect(blatt()).not.toBeNull();
    expect(within(b).getByLabelText('Titel')).toHaveValue('T');
    fireEvent.pointerDown(griff, { clientY: 20, pointerId: 1 });
    fireEvent.pointerMove(griff, { clientY: 300, pointerId: 1 });
    fireEvent.pointerUp(griff, { clientY: 300, pointerId: 1 });
    expect(blatt()).toBeNull();
    expect(await repo.list()).toEqual([]);
  });
});
