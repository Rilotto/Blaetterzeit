import '@testing-library/jest-dom/vitest';
import { act, cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import ManuellerEintrag from '@/buchanlegen/ManuellerEintrag';
import { buchAusEingaben, eingabenAusVorbelegung, LEERE_EINGABEN } from '@/buchanlegen/eingabe';
import {
  datumFiltern,
  eintragungsdatumAusText,
  eintragungsdatumText,
  hinzugefuegtPruefen,
  isbnFiltern,
  isbnGueltig,
} from '@/domain/ausgabe';
import { neuesBuch, type Buch } from '@/domain/buch';
import { InMemoryBookRepository } from '@/storage/InMemoryBookRepository';
import { InMemoryImageStore } from '@/storage/InMemoryImageStore';
import BuchDetails from '@/views/BuchDetails';

afterEach(() => cleanup());

const JETZT = new Date(2026, 10, 17, 9, 30);
const jetzt = () => JETZT;

describe('ISBN und Datum (REQ-063, REQ-064)', () => {
  it('ISBN: nur Ziffern, X nur als zehnte Stelle, Prüfziffer', () => {
    expect(isbnFiltern('978-3a')).toBe('9783');
    expect(isbnFiltern('080442957x1')).toBe('080442957X');
    expect(isbnFiltern('X12')).toBe('12');
    expect(isbnFiltern('97835515516721')).toBe('9783551551672');
    expect(isbnGueltig('9783551551672')).toBe(true);
    expect(isbnGueltig('9783551551670')).toBe(false);
    expect(isbnGueltig('080442957X')).toBe(true);
    expect(isbnGueltig('0804429570')).toBe(false);
    expect(isbnGueltig('12345')).toBe(false);
  });

  it('Datum: Punkte automatisch, kein Datum in der Zukunft, kein 31.02.', () => {
    expect(datumFiltern('01022025')).toBe('01.02.2025');
    expect(datumFiltern('01.02.2025')).toBe('01.02.2025');
    expect(hinzugefuegtPruefen('17.11.2026', JETZT).ok).toBe(true);
    expect(hinzugefuegtPruefen('18.11.2026', JETZT).ok).toBe(false);
    expect(hinzugefuegtPruefen('31.02.2025', JETZT).ok).toBe(false);
    const iso = eintragungsdatumAusText('01.02.2025');
    expect(eintragungsdatumText(iso)).toBe('01.02.2025');
    const bisher = new Date(2026, 10, 10, 8, 1).toISOString();
    expect(eintragungsdatumAusText('10.11.2026', bisher)).toBe(bisher);
  });

  it('Eingaben → Buch mit allen Ausgabe-Angaben; Vorbelegung filtert Ungültiges', () => {
    const b = buchAusEingaben(
      { ...LEERE_EINGABEN, titel: 'T', seiten: '320', format: 'print', unterformat: 'hardcover', exemplar: 'meins', preisCent: 1299, verlag: 'Carlsen', isbn: '9783551551672', erschienen: '15.03.2021', hinzugefuegt: '01.02.2025' },
      JETZT,
    );
    expect(b).toMatchObject({ seitenanzahl: 320, format: 'print', unterformat: 'hardcover', exemplar: 'meins', preisCent: 1299, verlag: 'Carlsen', isbn: '9783551551672', erscheinungsdatum: '15.03.2021' });
    expect(eintragungsdatumText(b.eingetragenAm)).toBe('01.02.2025');
    const e = eingabenAusVorbelegung({ titel: 'V', seitenanzahl: 0, isbn: '978-3-551-55167-2', erscheinungsdatum: '31.02.2020', format: 'ebook', unterformat: 'hardcover' });
    expect(e).toEqual({ ...LEERE_EINGABEN, titel: 'V', isbn: '9783551551672', format: 'ebook' });
  });
});

describe('Manueller Eintrag mit Karte „Ausgabe“ (REQ-060)', () => {
  function starte(vorbelegung?: Parameters<typeof ManuellerEintrag>[0]['vorbelegung']) {
    const repo = new InMemoryBookRepository();
    const angelegt: Buch[] = [];
    render(
      <ManuellerEintrag repository={repo} bildspeicher={new InMemoryImageStore()} jetzt={jetzt} vorbelegung={vorbelegung} onZurueck={() => {}} onAngelegt={(b) => angelegt.push(b)} />,
    );
    return { repo, angelegt, blatt: screen.getByRole('dialog', { name: 'Manueller Eintrag' }) };
  }
  const zeile = (d: HTMLElement, id: string) => d.querySelector(`[data-ausgabe-zeile="${id}"]`) as HTMLElement;

  it('zeigt die Zeilen ohne „Fotos“, kein „Erscheinungsdatum“, Seiten genau einmal', () => {
    const { blatt } = starte();
    for (const id of ['seiten', 'format', 'exemplar', 'sonderausgabe', 'preis', 'verlag', 'erschienen', 'isbn', 'hinzugefuegt']) expect(zeile(blatt, id)).not.toBeNull();
    expect(zeile(blatt, 'fotos')).toBeNull();
    expect(blatt.textContent).not.toMatch(/Erscheinungsdatum/i);
    expect(within(blatt).getAllByLabelText('Seiten')).toHaveLength(1);
    expect(zeile(blatt, 'hinzugefuegt')).toHaveTextContent('17.11.2026');
  });

  it('ohne Seitenzahl: hervorgehoben, nichts angelegt; Eingabe hebt Hervorhebung auf', async () => {
    const { repo, blatt } = starte();
    fireEvent.change(within(blatt).getByLabelText('Titel'), { target: { value: 'T' } });
    fireEvent.click(within(blatt).getByRole('button', { name: 'Hinzufügen' }));
    await act(async () => {});
    const seiten = within(blatt).getByLabelText('Seiten');
    expect(seiten).toHaveAttribute('data-fehler', 'true');
    expect(within(blatt).queryByRole('alert')).toBeNull();
    expect(await repo.list()).toEqual([]);
    fireEvent.change(seiten, { target: { value: '3' } });
    expect(seiten).not.toHaveAttribute('data-fehler');
  });

  it('Verlag, ISBN, Erschienen und Hinzugefügt über Blätter; gespeichert beim Anlegen', async () => {
    const { repo, blatt, angelegt } = starte();
    fireEvent.change(within(blatt).getByLabelText('Titel'), { target: { value: 'T' } });
    fireEvent.change(within(blatt).getByLabelText('Seiten'), { target: { value: '320' } });
    const eingeben = (zeilenId: string, wert: string) => {
      fireEvent.click(zeile(blatt, zeilenId));
      const feld = document.querySelector(`[data-blatt-feld="${zeilenId}"]`)!;
      fireEvent.change(feld, { target: { value: wert } });
      fireEvent.click(document.querySelector(`[data-blatt-sichern="${zeilenId}"]`)!);
      return feld;
    };
    eingeben('verlag', 'Carlsen');
    const isbn = eingeben('isbn', '9783551551670');
    expect(isbn).toHaveAttribute('data-fehler', 'true');
    fireEvent.change(isbn, { target: { value: '9783551551672' } });
    fireEvent.click(document.querySelector('[data-blatt-sichern="isbn"]')!);
    eingeben('erschienen', '15032021');
    const h = eingeben('hinzugefuegt', '18.11.2026');
    expect(h).toHaveAttribute('data-fehler', 'true');
    fireEvent.change(h, { target: { value: '01.02.2025' } });
    fireEvent.click(document.querySelector('[data-blatt-sichern="hinzugefuegt"]')!);
    expect(zeile(blatt, 'verlag')).toHaveTextContent('Carlsen');
    expect(zeile(blatt, 'isbn')).toHaveTextContent('9783551551672');
    fireEvent.click(within(blatt).getByRole('button', { name: 'Hinzufügen' }));
    await act(async () => {});
    const [buch] = await repo.list();
    expect(buch).toMatchObject({ titel: 'T', seitenanzahl: 320, verlag: 'Carlsen', isbn: '9783551551672', erscheinungsdatum: '15.03.2021' });
    expect(eintragungsdatumText(buch.eingetragenAm)).toBe('01.02.2025');
    expect(angelegt).toHaveLength(1);
  });

  it('Zurück-Taste schließt nur das offene Blatt einer Zeile, Eingaben bleiben', async () => {
    const { blatt } = starte();
    fireEvent.change(within(blatt).getByLabelText('Titel'), { target: { value: 'T' } });
    for (const id of ['verlag', 'format']) {
      fireEvent.click(zeile(blatt, id));
      await act(async () => {});
      act(() => {
        window.dispatchEvent(new PopStateEvent('popstate'));
      });
      expect(document.querySelector('[data-blatt-feld="verlag"]')).toBeNull();
      expect(screen.getByRole('dialog', { name: 'Manueller Eintrag' })).toBeInTheDocument();
      expect(within(blatt).getByLabelText('Titel')).toHaveValue('T');
    }
  });

  it('Vorbelegung füllt die Felder', () => {
    const { blatt } = starte({ titel: 'Vorab', seitenanzahl: 412, verlag: 'Carlsen', isbn: '9783551551672', cover: 'data:image/png;base64,AA' });
    expect(within(blatt).getByLabelText('Titel')).toHaveValue('Vorab');
    expect(within(blatt).getByLabelText('Seiten')).toHaveValue('412');
    expect(zeile(blatt, 'verlag')).toHaveTextContent('Carlsen');
    expect(blatt.querySelector('[data-cover-vorschau]')).not.toBeNull();
  });
});

describe('Details: Verlag, ISBN, Hinzugefügt (REQ-063, REQ-064)', () => {
  it('sichert gültige Werte, verwirft beim Schließen', async () => {
    const repo = new InMemoryBookRepository();
    const buch = neuesBuch({ titel: 'B', status: 'ungelesen', eingetragenAm: new Date(2026, 10, 10, 8).toISOString() });
    await repo.save(buch);
    render(<BuchDetails buchId={buch.id} buch={buch} repository={repo} bildspeicher={new InMemoryImageStore()} jetzt={jetzt} onZurueck={() => {}} />);
    fireEvent.click(screen.getByRole('tab', { name: /Details/ }));
    const zeile = (id: string) => document.querySelector(`[data-ausgabe-zeile="${id}"]`) as HTMLElement;
    fireEvent.click(zeile('verlag'));
    fireEvent.change(document.querySelector('[data-blatt-feld="verlag"]')!, { target: { value: 'Carlsen' } });
    fireEvent.click(screen.getByRole('button', { name: 'Schließen' }));
    expect(zeile('verlag').querySelector('[data-zeile-wert]')).toHaveTextContent('');
    fireEvent.click(zeile('verlag'));
    fireEvent.change(document.querySelector('[data-blatt-feld="verlag"]')!, { target: { value: 'Carlsen' } });
    fireEvent.click(document.querySelector('[data-blatt-sichern="verlag"]')!);
    fireEvent.click(zeile('hinzugefuegt'));
    expect(document.querySelector('[data-blatt-feld="hinzugefuegt"]')).toHaveValue('10.11.2026');
    fireEvent.change(document.querySelector('[data-blatt-feld="hinzugefuegt"]')!, { target: { value: '01.02.2025' } });
    fireEvent.click(document.querySelector('[data-blatt-sichern="hinzugefuegt"]')!);
    await act(async () => {});
    const gespeichert = await repo.get(buch.id);
    expect(gespeichert?.verlag).toBe('Carlsen');
    expect(eintragungsdatumText(gespeichert?.eingetragenAm)).toBe('01.02.2025');
  });
});
