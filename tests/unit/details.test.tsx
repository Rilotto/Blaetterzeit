import '@testing-library/jest-dom/vitest';
import { act, cleanup, fireEvent, render } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import {
  formatText,
  formatangabenBereinigen,
  hinzugefuegtText,
  preisPruefen,
  preisText,
  seitenanzahlErlaubt,
  sonderausgabeAntippen,
  sonderausgabeText,
} from '@/domain/ausgabe';
import { buchAusDaten, type Buch } from '@/domain/buch';
import { InMemoryBookRepository } from '@/storage/InMemoryBookRepository';
import { InMemoryImageStore } from '@/storage/InMemoryImageStore';
import BuchDetails from '@/views/BuchDetails';

afterEach(cleanup);

const ID = '6f1e2d3c-4b5a-4c6d-8e7f-9a0b1c2d3e4f';
const buch = (extra: Partial<Buch> = {}): Buch => ({ id: ID, titel: 'Momo', status: 'am_lesen', ...extra });

describe('Domäne Ausgabe', () => {
  it('Format-, Exemplar- und Sonderausgabe-Texte', () => {
    expect(formatText({ format: 'print', unterformat: 'taschenbuch' })).toBe('Print · Taschenbuch');
    expect(formatText({ format: 'print' })).toBe('Print');
    expect(formatText({ format: 'ebook', unterformat: 'hardcover' })).toBe('E-Book');
    expect(formatText({})).toBe('');
    expect(sonderausgabeText({})).toBe('Keins');
    expect(sonderausgabeText({ sonderausgabe: 'farbschnitt' })).toBe('Farbschnitt');
  });

  it('Sonderausgabe: eine wählbar, erneutes Antippen hebt auf; Bereinigen nur bei Print', () => {
    expect(sonderausgabeAntippen('farbschnitt', 'erstausgabe')).toBe('erstausgabe');
    expect(sonderausgabeAntippen('erstausgabe', 'erstausgabe')).toBeUndefined();
    expect(formatangabenBereinigen({ format: 'ebook', unterformat: 'hardcover', sonderausgabe: 'farbschnitt', exemplar: 'meins' })).toEqual({
      format: 'ebook',
      exemplar: 'meins',
    });
    expect(formatangabenBereinigen({ unterformat: undefined })).toEqual({});
  });

  it('Preis prüfen und anzeigen', () => {
    expect(preisText(0)).toBe('0,00 €');
    expect(preisText(1299)).toBe('12,99 €');
    expect(preisPruefen('12,99')).toEqual({ ok: true, cent: 1299 });
    expect(preisPruefen('12,99 €')).toEqual({ ok: true, cent: 1299 });
    expect(preisPruefen('12,9')).toEqual({ ok: true, cent: 1290 });
    expect(preisPruefen('20')).toEqual({ ok: true, cent: 2000 });
    expect(preisPruefen('')).toEqual({ ok: false, grund: 'leer' });
    for (const x of ['-1', '1,999', 'abc', '1,2,3']) expect(preisPruefen(x).ok).toBe(false);
  });

  it('Seitenanzahl nicht kleiner als aktuelle Seite; Hinzugefügt als „Okt. 2026“', () => {
    expect(seitenanzahlErlaubt(200, 250)).toBe(false);
    expect(seitenanzahlErlaubt(250, 250)).toBe(true);
    expect(seitenanzahlErlaubt(1, undefined)).toBe(true);
    expect(hinzugefuegtText(new Date(2026, 9, 14, 12).toISOString())).toBe('Okt. 2026');
    expect(hinzugefuegtText(undefined)).toBe('');
  });

  it('buchAusDaten übernimmt nur gültige Werte', () => {
    const b = buchAusDaten({ ...buch(), genres: ['Fantasy', '', 3], format: 'vinyl', exemplar: 'meins', preisCent: -5, tropes: [] });
    expect(b.genres).toEqual(['Fantasy']);
    expect(b).not.toHaveProperty('format');
    expect(b).not.toHaveProperty('preisCent');
    expect(b).not.toHaveProperty('tropes');
    expect(b.exemplar).toBe('meins');
  });
});

async function zeige(b: Buch, repo = new InMemoryBookRepository()) {
  await repo.save(b);
  render(<BuchDetails buchId={b.id} buch={b} repository={repo} bildspeicher={new InMemoryImageStore()} onZurueck={() => {}} />);
  await act(async () => {});
  await tippe(document.querySelector('[data-reiter="details"]')!);
  return repo;
}

const tippe = async (el: Element) => {
  fireEvent.click(el);
  await act(async () => {});
};
const q = (sel: string) => document.querySelector(sel);
const wert = (id: string) => q(`[data-ausgabe-zeile="${id}"] [data-zeile-wert]`)!.textContent;

describe('Reiter „Details“', () => {
  it('Überschriften, Pillen, Zeilen und Pfeile', async () => {
    await zeige(buch({ genres: ['Fantasy', 'Romance'], seitenanzahl: 608, erscheinungsjahr: 2025 }));
    expect(q('[data-reiter-bereich="details"]')).not.toHaveTextContent('under construction');
    expect([...document.querySelectorAll('[data-abschnitt-ueberschrift]')].map((h) => h.textContent)).toEqual([
      'Genres',
      'Tropes',
      'Inhaltswarnungen',
      'Sagas, Sammlungen und Bibliotheken',
      'Ausgabe',
    ]);
    expect(document.querySelectorAll('[data-details-bearbeiten]')).toHaveLength(3);
    expect([...document.querySelectorAll('[data-pillen="genres"] [data-pille-gefuellt]')].map((p) => p.textContent)).toEqual(['Fantasy', 'Romance']);
    expect(q('[data-pillen="genres"] [data-pille-gestrichelt]')).toBeNull();
    expect(q('[data-pillen="tropes"] [data-pille-gestrichelt]')).toHaveTextContent('+ Tropes hinzufügen');
    expect(q('[data-pillen="inhaltswarnungen"] [data-pille-gestrichelt]')).toHaveTextContent('+ Warnungen markieren');
    const zeilen = [...document.querySelectorAll('[data-ausgabe-zeile]')];
    expect(zeilen.map((z) => z.querySelector('[data-zeile-bezeichnung]')!.textContent)).toEqual([
      'Seiten', 'Format', 'Maße', 'Exemplar', 'Band', 'Sonderausgabe', 'Fotos', 'Preis', 'Verlag', 'Erschienen', 'ISBN', 'Hinzugefügt', 'Beendet am',
    ]);
    // Alle dreizehn (mit „Band“, REQ-112) Zeilen mit Pfeil (REQ-091).
    expect(zeilen.filter((z) => z.querySelector('[data-zeile-pfeil]'))).toHaveLength(13);
    expect(wert('seiten')).toBe('608');
    expect(wert('erschienen')).toBe('2025');
    expect(wert('sonderausgabe')).toBe('Keins');
    expect(wert('preis')).toBe('Trag ein, was du bezahlt hast');
    await tippe(q('[data-ausgabe-zeile="fotos"]')!);
    await tippe(q('[data-details-bearbeiten="genres"]')!);
    expect(q('[role="dialog"]')).toBeNull();
    // Drei gestrichelte Listen-Pillen untereinander (REQ-095).
    expect([...document.querySelectorAll('[data-listen-pille]')].map((p) => p.textContent)).toEqual([
      '+ Zu einer Saga hinzufügen',
      '+ Zu einer Sammlung hinzufügen',
      '+ Zu einer Bibliothek hinzufügen',
    ]);
  });

  it('Seiten ändern: vorbefüllt, kleiner als aktuelle Seite nicht sicherbar, kein Menü „Aktuelle Seite“', async () => {
    const repo = await zeige(buch({ seitenanzahl: 400, aktuelleSeite: 250 }));
    await tippe(q('[data-ausgabe-zeile="seiten"]')!);
    const feld = q('[aria-label="Seitenanzahl"]') as HTMLInputElement;
    expect(feld.value).toBe('400');
    fireEvent.change(feld, { target: { value: '200' } });
    await tippe([...document.querySelectorAll('[data-blatt-unten] button')].find((b) => b.textContent === 'Sichern')!);
    expect(q('[aria-label="Buchlänge"]')).not.toBeNull();
    expect((await repo.get(ID))?.seitenanzahl).toBe(400);
    fireEvent.change(feld, { target: { value: '250' } });
    await tippe([...document.querySelectorAll('[data-blatt-unten] button')].find((b) => b.textContent === 'Sichern')!);
    expect(q('[role="dialog"]')).toBeNull();
    expect(wert('seiten')).toBe('250');
    expect((await repo.get(ID))?.seitenanzahl).toBe(250);
  });

  it('Fenster „Format“: ohne Vorauswahl, Auswahl, Sichern; Schließen ohne Sichern verwirft', async () => {
    const repo = await zeige(buch());
    await tippe(q('[data-ausgabe-zeile="exemplar"]')!);
    expect(document.querySelectorAll('[data-fenster-format] [data-gewaehlt="true"]')).toHaveLength(0);
    expect(q('[data-print-karte]')).toBeNull();
    await tippe(q('[data-format-kachel="print"]')!);
    await tippe(q('[data-unterformat="hardcover"]')!);
    await tippe(q('[data-sonderausgabe="farbschnitt"]')!);
    expect(q('[data-sonderausgabe-anzeige]')).toHaveTextContent('Farbschnitt');
    await tippe(q('[data-exemplar="geliehen"]')!);
    await tippe(q('[data-format-hintergrund]')!);
    expect(q('[data-fenster-format]')).toBeNull();
    expect(wert('format')).toBe('');

    await tippe(q('[data-ausgabe-zeile="format"]')!);
    await tippe(q('[data-format-kachel="print"]')!);
    await tippe(q('[data-unterformat="hardcover"]')!);
    await tippe(q('[data-exemplar="geliehen"]')!);
    await tippe(q('[data-format-sichern]')!);
    expect(q('[data-fenster-format]')).toBeNull();
    expect(wert('format')).toBe('Print · Hardcover');
    expect(wert('exemplar')).toBe('Geliehen');
    expect(await repo.get(ID)).toMatchObject({ format: 'print', unterformat: 'hardcover', exemplar: 'geliehen' });

    await tippe(q('[data-ausgabe-zeile="sonderausgabe"]')!);
    expect(q('[data-format-kachel="print"]')).toHaveAttribute('data-gewaehlt', 'true');
    await tippe(q('[data-format-kachel="ebook"]')!);
    expect(q('[data-format-kachel="print"]')).toHaveAttribute('data-gewaehlt', 'false');
    expect(q('[data-print-karte]')).toBeNull();
    await tippe(q('[data-format-schliessen]')!);
    expect(wert('format')).toBe('Print · Hardcover');
  });

  it('Preis: vorbefüllt mit 0,00 €, Sichern, Schließen verwirft', async () => {
    const repo = await zeige(buch());
    await tippe(q('[data-ausgabe-zeile="preis"]')!);
    const feld = q('[data-preis-eingabe]') as HTMLInputElement;
    expect(feld.value).toBe('0,00 €');
    fireEvent.change(feld, { target: { value: '12,99' } });
    await tippe(q('[data-preis-sichern]')!);
    expect(wert('preis')).toBe('12,99 €');
    expect((await repo.get(ID))?.preisCent).toBe(1299);
    await tippe(q('[data-ausgabe-zeile="preis"]')!);
    expect((q('[data-preis-eingabe]') as HTMLInputElement).value).toBe('12,99 €');
    fireEvent.change(q('[data-preis-eingabe]')!, { target: { value: '20,00' } });
    await tippe(q('[data-blatt-hintergrund]')!);
    expect(wert('preis')).toBe('12,99 €');
  });
});
