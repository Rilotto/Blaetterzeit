import '@testing-library/jest-dom/vitest';
import { act, cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { HttpClient } from '@/barcode/http';
import { onlineSucheMit, type OnlineSuche } from '@/barcode/suche';
import {
  dnbSucheUrl,
  dnbTrefferLesen,
  openLibrarySucheLesen,
  openLibrarySucheUrl,
  trefferMischen,
  type Treffer,
} from '@/barcode/treffer';
import { InMemoryBookRepository } from '@/storage/InMemoryBookRepository';
import { InMemoryImageStore } from '@/storage/InMemoryImageStore';
import BuecherAnsicht from '@/views/BuecherAnsicht';
import Suchfenster, { KEIN_INTERNET_HINWEIS, KEINE_TREFFER_HINWEIS } from '@/onlinesuche/Suchfenster';

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

const t = (quelle: 'dnb' | 'openlibrary', titel: string, extra: Partial<Treffer['angaben']> = {}): Treffer => ({
  quelle,
  angaben: { titel, ...extra },
});
const reihe = (q: 'dnb' | 'openlibrary', p: string, n: number) => Array.from({ length: n }, (_, i) => t(q, `${p}${i + 1}`));
const titel = (l: Treffer[]) => l.map((x) => x.angaben.titel);

describe('trefferMischen', () => {
  it('abwechselnd, höchstens 9', () => {
    expect(titel(trefferMischen(reihe('dnb', 'D', 6), reihe('openlibrary', 'O', 6)))).toEqual(['D1', 'O1', 'D2', 'O2', 'D3', 'O3', 'D4', 'O4', 'D5']);
  });
  it('andere Quelle füllt auf', () => {
    expect(titel(trefferMischen(reihe('dnb', 'D', 2), reihe('openlibrary', 'O', 10)))).toEqual(['D1', 'O1', 'D2', 'O2', 'O3', 'O4', 'O5', 'O6', 'O7']);
    expect(titel(trefferMischen(reihe('dnb', 'D', 10), reihe('openlibrary', 'O', 1)))).toEqual(['D1', 'O1', 'D2', 'D3', 'D4', 'D5', 'D6', 'D7', 'D8']);
  });
  it('nur eine Quelle bzw. keine', () => {
    expect(titel(trefferMischen([], reihe('openlibrary', 'O', 4)))).toEqual(['O1', 'O2', 'O3', 'O4']);
    expect(trefferMischen([], [])).toEqual([]);
  });
});

describe('Adressen der Freitextsuche', () => {
  it('DNB: alle Wörter mit „and“, ISBN über „num“', () => {
    const q = (u: string) => new URL(u).searchParams.get('query');
    expect(q(dnbSucheUrl('Harry  Potter Rowling'))).toBe('woe="Harry" and woe="Potter" and woe="Rowling"');
    expect(q(dnbSucheUrl('978-3-551-55167-2'))).toBe('num=9783551551672');
    expect(q(dnbSucheUrl('a"b\\c'))).toBe('woe="abc"');
    expect(new URL(dnbSucheUrl('x')).searchParams.get('maximumRecords')).toBe('9');
  });
  it('Open Library: nur Suchtext und feste Parameter', () => {
    const u = new URL(openLibrarySucheUrl(' Harry Potter '));
    expect(u.origin + u.pathname).toBe('https://openlibrary.org/search.json');
    expect(u.searchParams.get('q')).toBe('Harry Potter');
    expect(u.searchParams.get('limit')).toBe('9');
  });
});

describe('Parser', () => {
  it('Open Library search.json', () => {
    const json = JSON.stringify({
      docs: [
        { title: 'Harry Potter', author_name: ['J. K. Rowling'], publisher: ['Carlsen'], first_publish_year: 1998, number_of_pages_median: 335, isbn: ['9783551551672'], cover_i: 42 },
        { title: 'Zwei Ausgaben', isbn: ['9783551551672', '3551551677', '9780747532699'] },
        { author_name: ['ohne Titel'] },
      ],
    });
    const l = openLibrarySucheLesen(json);
    expect(l).toHaveLength(2);
    expect(l[0]).toEqual({
      quelle: 'openlibrary',
      angaben: { titel: 'Harry Potter', autor: 'J. K. Rowling', verlag: 'Carlsen', erscheinungsjahr: 1998, seitenanzahl: 335, isbn: '9783551551672' },
      coverUrl: 'https://covers.openlibrary.org/b/id/42-L.jpg',
    });
    expect(l[1].angaben.isbn).toBeUndefined();
    expect(openLibrarySucheLesen(json, '9780747532699')[1].angaben.isbn).toBe('9780747532699');
    expect(openLibrarySucheLesen('kaputt')).toEqual([]);
  });
  it('DNB ohne gesuchte ISBN: Cover über die ISBN des Datensatzes, ohne ISBN kein Cover', () => {
    const rec = (isbn?: string) => `<record xmlns="http://www.loc.gov/MARC21/slim">
      ${isbn ? `<datafield tag="020" ind1=" " ind2=" "><subfield code="a">${isbn}</subfield></datafield>` : ''}
      <datafield tag="245" ind1="1" ind2="0"><subfield code="a">Titel</subfield></datafield></record>`;
    const xml = `<r xmlns:m="http://www.loc.gov/MARC21/slim">${rec('9783551551672')}${rec()}</r>`;
    const l = dnbTrefferLesen(xml);
    expect(l[0].coverUrl).toBe('https://portal.dnb.de/opac/mvb/cover?isbn=9783551551672');
    expect(l[1].coverUrl).toBeUndefined();
    expect(l[1].angaben.isbn).toBeUndefined();
  });
});

describe('onlineSucheMit', () => {
  const http = (text: (url: string) => Promise<{ status: number; text: string }>): HttpClient & { urls: string[] } => {
    const urls: string[] = [];
    return {
      urls,
      text: (u) => {
        urls.push(u);
        return text(u);
      },
      bild: async (u) => {
        urls.push(u);
        return null;
      },
    };
  };
  it('beide Quellen scheitern: Fehler; eine scheitert: Treffer der anderen', async () => {
    await expect(onlineSucheMit(http(() => Promise.reject(new TypeError('offline')))).suchen('x')).rejects.toThrow();
    const h = http(async (u) =>
      u.includes('openlibrary') ? { status: 200, text: JSON.stringify({ docs: [{ title: 'A' }] }) } : Promise.reject(new Error('x')),
    );
    expect(titel(await onlineSucheMit(h).suchen('Harry'))).toEqual(['A']);
  });
  it('nur Leerzeichen/Sonderzeichen: keine Anfrage', async () => {
    const h = http(async () => ({ status: 200, text: '' }));
    expect(await onlineSucheMit(h).suchen('  "" ')).toEqual([]);
    expect(h.urls).toEqual([]);
  });
});

describe('Suchfenster', () => {
  const zeige = (suche: OnlineSuche) => {
    const onZurueck = vi.fn();
    const onWahl = vi.fn();
    render(<Suchfenster suche={suche} onZurueck={onZurueck} onWahl={onWahl} />);
    return { onZurueck, onWahl, feld: screen.getByRole('searchbox') as HTMLInputElement };
  };

  it('Fokus beim Öffnen, Suche erst mit Enter, Raster mit Platzhalter, Antippen übergibt die Angaben', async () => {
    const treffer = [t('dnb', 'D1', { cover: 'data:image/png;base64,AA', autor: 'A' }), t('openlibrary', 'O1')];
    const suche = { suchen: vi.fn(async () => treffer) };
    const { feld, onWahl } = zeige(suche);
    expect(document.activeElement).toBe(feld);
    fireEvent.change(feld, { target: { value: 'Harry' } });
    expect(suche.suchen).not.toHaveBeenCalled();
    await act(async () => {
      fireEvent.keyDown(feld, { key: 'Enter' });
    });
    expect(suche.suchen).toHaveBeenCalledWith('Harry');
    const raster = document.querySelector('[data-online-treffer-raster]') as HTMLElement;
    const items = within(raster).getAllByRole('listitem');
    expect(items).toHaveLength(2);
    expect(items[0].querySelector('img[data-treffer-cover]')).not.toBeNull();
    expect(items[1].querySelector('[data-cover-platzhalter]')).not.toBeNull();
    expect(items[1].querySelector('[data-treffer-autor]')).toBeNull();
    expect(items[1].querySelector('[data-treffer-quelle]')?.textContent).toBe('Open Library');
    fireEvent.click(items[0]);
    expect(onWahl).toHaveBeenCalledWith(treffer[0].angaben);
  });

  it('leeres Feld: keine Suche; keine Treffer und kein Internet: Hinweis, Text bleibt', async () => {
    const suche = { suchen: vi.fn(async () => [] as Treffer[]) };
    const { feld } = zeige(suche);
    fireEvent.change(feld, { target: { value: '   ' } });
    fireEvent.submit(feld.form!);
    expect(suche.suchen).not.toHaveBeenCalled();
    fireEvent.change(feld, { target: { value: 'xyz' } });
    await act(async () => {
      fireEvent.submit(feld.form!);
    });
    expect(screen.getByText(KEINE_TREFFER_HINWEIS)).toBeInTheDocument();
    expect(feld.value).toBe('xyz');
    suche.suchen.mockRejectedValueOnce(new TypeError('offline'));
    await act(async () => {
      fireEvent.submit(feld.form!);
    });
    expect(screen.getByText(KEIN_INTERNET_HINWEIS)).toBeInTheDocument();
  });

  it('Zurück-Pfeil ruft onZurueck', () => {
    const { onZurueck } = zeige({ suchen: vi.fn() });
    fireEvent.click(screen.getByRole('button', { name: 'Zurück' }));
    expect(onZurueck).toHaveBeenCalledTimes(1);
  });
});

describe('Einbindung in die Seite „Bücher“', () => {
  it('Menü → Suchfenster → Zurück ins Menü; Treffer öffnet „Manueller Eintrag“ vorbelegt, ohne Buch anzulegen', async () => {
    const repo = new InMemoryBookRepository();
    const suche = { suchen: vi.fn(async () => [t('dnb', 'Harry Potter', { autor: 'Rowling', verlag: 'Carlsen' })]) };
    render(<BuecherAnsicht repository={repo} bildspeicher={new InMemoryImageStore()} onlineSuche={suche} />);
    fireEvent.click(screen.getByRole('button', { name: 'Buch hinzufügen' }));
    const items = within(screen.getByRole('menu', { name: 'Buch hinzufügen' })).getAllByRole('menuitem');
    expect(items[0]).toHaveAttribute('data-option', 'online');
    expect(items[0].textContent).toContain('Finde fast jedes Buch');
    expect(items[0].querySelector('[data-icon="icon-lupe.png"]')).not.toBeNull();
    fireEvent.click(items[0]);
    expect(screen.queryByRole('menu', { name: 'Buch hinzufügen' })).toBeNull();
    expect(document.activeElement).toBe(screen.getByRole('searchbox'));
    fireEvent.click(screen.getByRole('button', { name: 'Zurück' }));
    expect(screen.queryByRole('dialog', { name: 'Online suchen' })).toBeNull();
    expect(screen.getByRole('menu', { name: 'Buch hinzufügen' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Menü schließen' })).toBeInTheDocument();
    fireEvent.click(screen.getAllByRole('menuitem')[0]);
    fireEvent.change(screen.getByRole('searchbox'), { target: { value: 'Harry' } });
    await act(async () => {
      fireEvent.keyDown(screen.getByRole('searchbox'), { key: 'Enter' });
    });
    fireEvent.click(document.querySelector('[data-online-treffer="0"]')!);
    expect(await screen.findByDisplayValue('Harry Potter')).toBeInTheDocument();
    expect(document.body.textContent + [...document.querySelectorAll('input')].map((i) => i.value).join(' ')).toContain('Carlsen');
    expect(await repo.list()).toEqual([]);
  });
});
