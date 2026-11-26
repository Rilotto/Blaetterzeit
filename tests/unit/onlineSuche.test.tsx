import '@testing-library/jest-dom/vitest';
import { act, cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { HttpClient } from '@/barcode/http';
import { coverSucheMit, onlineSucheMit, type OnlineSuche } from '@/barcode/suche';
import {
  dnbSucheUrl,
  dnbTrefferLesen,
  nachSpracheFiltern,
  openLibrarySucheLesen,
  openLibrarySucheUrl,
  trefferMischen,
  type Treffer,
} from '@/barcode/treffer';
import { InMemoryBookRepository } from '@/storage/InMemoryBookRepository';
import { InMemoryImageStore } from '@/storage/InMemoryImageStore';
import BuecherAnsicht from '@/views/BuecherAnsicht';
import Suchfenster, { KEIN_INTERNET_HINWEIS, KEINE_TREFFER_HINWEIS } from '@/onlinesuche/Suchfenster';
import CoverSuchfenster, { coverSuchtext, KEIN_COVER_HINWEIS } from '@/onlinesuche/CoverSuchfenster';
import { MINDESTENS_EINE_SPRACHE_HINWEIS, SPRACHEN_SCHLUESSEL, spracheUmschalten, sprachenLesen, sprachenSpeichern } from '@/onlinesuche/sprache';
import { InMemoryEinstellungRepository } from '@/storage/InMemoryEinstellungRepository';

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
  it('abwechselnd, höchstens 15', () => {
    expect(titel(trefferMischen(reihe('dnb', 'D', 10), reihe('openlibrary', 'O', 10)))).toEqual(
      ['D1', 'O1', 'D2', 'O2', 'D3', 'O3', 'D4', 'O4', 'D5', 'O5', 'D6', 'O6', 'D7', 'O7', 'D8'],
    );
  });
  it('andere Quelle füllt auf', () => {
    expect(titel(trefferMischen(reihe('dnb', 'D', 2), reihe('openlibrary', 'O', 20)))).toEqual(
      ['D1', 'O1', 'D2', 'O2', 'O3', 'O4', 'O5', 'O6', 'O7', 'O8', 'O9', 'O10', 'O11', 'O12', 'O13'],
    );
    expect(titel(trefferMischen(reihe('dnb', 'D', 20), reihe('openlibrary', 'O', 1)))).toEqual(
      ['D1', 'O1', 'D2', 'D3', 'D4', 'D5', 'D6', 'D7', 'D8', 'D9', 'D10', 'D11', 'D12', 'D13', 'D14'],
    );
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
    expect(new URL(dnbSucheUrl('x')).searchParams.get('maximumRecords')).toBe('15');
  });
  it('DNB: Sprachfilter über den Index „spr“ (REQ-119)', () => {
    const q = (u: string) => new URL(u).searchParams.get('query');
    expect(q(dnbSucheUrl('Harry', 15, ['ger']))).toBe('woe="Harry" and spr=ger');
    expect(q(dnbSucheUrl('9783551551672', 15, ['ger', 'eng']))).toBe('num=9783551551672 and (spr=ger or spr=eng)');
    expect(q(dnbSucheUrl('Harry', 15, []))).toBe('woe="Harry"');
  });
  it('Open Library: Sprachfilter als Feldsuche „language:“ in q, Feld „language“ angefordert (REQ-119)', () => {
    const u = (s: string[]) => new URL(openLibrarySucheUrl('Harry Potter', 15, s));
    expect(u(['eng']).searchParams.get('q')).toBe('Harry Potter language:eng');
    expect(u(['ger', 'eng']).searchParams.get('q')).toBe('Harry Potter language:(ger OR eng)');
    expect(u([]).searchParams.get('fields')).toContain('language');
  });
  it('Open Library: nur Suchtext und feste Parameter', () => {
    const u = new URL(openLibrarySucheUrl(' Harry Potter '));
    expect(u.origin + u.pathname).toBe('https://openlibrary.org/search.json');
    expect(u.searchParams.get('q')).toBe('Harry Potter');
    expect(u.searchParams.get('limit')).toBe('15');
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
    expect(suche.suchen).toHaveBeenCalledWith('Harry', ['ger']);
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

// ---------------------------------------------------------------------------
// Sprachfilter (REQ-119) und Cover-Suche (REQ-118)
// ---------------------------------------------------------------------------
describe('Sprachangaben der Quellen', () => {
  it('DNB: 041 $a, sonst 008/35–37; Open Library: „language“', () => {
    const k008 = (code: string) => `<controlfield tag="008">${'x'.repeat(35)}${code}xx</controlfield>`;
    const rec = (inhalt: string) =>
      `<record xmlns="http://www.loc.gov/MARC21/slim">${inhalt}<datafield tag="245" ind1="1" ind2="0"><subfield code="a">T</subfield></datafield></record>`;
    const xml = `<r>${rec('<datafield tag="041" ind1=" " ind2=" "><subfield code="a">ger</subfield><subfield code="a">eng</subfield></datafield>')}${rec(k008('eng'))}${rec(k008('|||'))}</r>`;
    expect(dnbTrefferLesen(xml).map((x) => x.sprachen)).toEqual([['ger', 'eng'], ['eng'], undefined]);
    const ol = JSON.stringify({ docs: [{ title: 'A', language: ['ger', 'eng'] }, { title: 'B' }, { title: 'C', language: ['und'] }] });
    expect(openLibrarySucheLesen(ol).map((x) => x.sprachen)).toEqual([['ger', 'eng'], undefined, undefined]);
  });
  it('nachSpracheFiltern: passende bleiben, ohne Angabe entfällt', () => {
    const l: Treffer[] = [
      { ...t('dnb', 'de'), sprachen: ['ger'] },
      { ...t('dnb', 'en'), sprachen: ['eng'] },
      { ...t('dnb', 'beide'), sprachen: ['ger', 'eng'] },
      t('dnb', 'ohne'),
    ];
    expect(titel(nachSpracheFiltern(l, ['ger']))).toEqual(['de', 'beide']);
    expect(titel(nachSpracheFiltern(l, ['eng']))).toEqual(['en', 'beide']);
    expect(titel(nachSpracheFiltern(l, ['ger', 'eng']))).toEqual(['de', 'en', 'beide']);
  });
  it('Auswahl: umschalten, mindestens eine, Lesen/Speichern mit Standard Deutsch', async () => {
    expect(spracheUmschalten(['ger'], 'eng')).toEqual(['ger', 'eng']);
    expect(spracheUmschalten(['ger', 'eng'], 'ger')).toEqual(['eng']);
    expect(spracheUmschalten(['ger'], 'ger')).toBeNull();
    const repo = new InMemoryEinstellungRepository();
    expect(await sprachenLesen(repo)).toEqual(['ger']);
    await sprachenSpeichern(repo, ['eng', 'ger']);
    expect(await repo.lesen(SPRACHEN_SCHLUESSEL)).toBe('["ger","eng"]');
    expect(await sprachenLesen(repo)).toEqual(['ger', 'eng']);
    await repo.speichern(SPRACHEN_SCHLUESSEL, 'kaputt');
    expect(await sprachenLesen(repo)).toEqual(['ger']);
    await repo.speichern(SPRACHEN_SCHLUESSEL, '[]');
    expect(await sprachenLesen(repo)).toEqual(['ger']);
  });
});

const olDocs = (docs: object[]) => JSON.stringify({ docs });
const dnbXmlMit = (recs: { titel: string; isbn?: string; spr?: string }[]) =>
  `<r>${recs
    .map(
      (r) => `<record xmlns="http://www.loc.gov/MARC21/slim">
      ${r.isbn ? `<datafield tag="020" ind1=" " ind2=" "><subfield code="a">${r.isbn}</subfield></datafield>` : ''}
      ${r.spr ? `<datafield tag="041" ind1=" " ind2=" "><subfield code="a">${r.spr}</subfield></datafield>` : ''}
      <datafield tag="245" ind1="1" ind2="0"><subfield code="a">${r.titel}</subfield></datafield></record>`,
    )
    .join('')}</r>`;
function httpMit(dnb: string | null, ol: string | null, bild: (u: string) => string | null) {
  const urls: string[] = [];
  return {
    urls,
    text: vi.fn(async (u: string) => {
      urls.push(u);
      const a = u.includes('openlibrary') ? ol : dnb;
      if (a === null) throw new TypeError('offline');
      return { status: 200, text: a };
    }),
    bild: vi.fn(async (u: string) => {
      urls.push(u);
      return bild(u);
    }),
  };
}
/** Gültige ISBN-13 mit Prüfziffer. */
const ISBN13 = (i: number) => {
  const basis = `97830000${String(i).padStart(4, '0')}`;
  const summe = [...basis].reduce((a, z, k) => a + Number(z) * (k % 2 ? 3 : 1), 0);
  return `${basis}${(10 - (summe % 10)) % 10}`;
};

describe('onlineSucheMit mit Sprachen', () => {
  it('Anfragen mit Sprache, Treffer ohne Sprache entfallen', async () => {
    const h = httpMit(
      dnbXmlMit([{ titel: 'D-de', spr: 'ger' }, { titel: 'D-ohne' }, { titel: 'D-en', spr: 'eng' }]),
      olDocs([{ title: 'O-de', language: ['ger'] }, { title: 'O-ohne' }]),
      () => null,
    );
    expect(titel(await onlineSucheMit(h).suchen('Harry', ['ger']))).toEqual(['D-de', 'O-de']);
    expect(h.text.mock.calls.every(([u]) => decodeURIComponent(u).includes('ger'))).toBe(true);
  });
});

describe('coverSucheMit', () => {
  it('nur Treffer mit Cover, abwechselnd, höchstens 15', async () => {
    const dnb = dnbXmlMit(Array.from({ length: 10 }, (_, i) => ({ titel: `D${i + 1}`, isbn: ISBN13(i + 1), spr: 'ger' })));
    const ol = olDocs(Array.from({ length: 10 }, (_, i) => ({ title: `O${i + 1}`, cover_i: i + 1, language: ['ger'] })));
    // D2 ohne Cover
    const h = httpMit(dnb, ol, (u) => (u.includes(ISBN13(2)) ? null : `data:image/png;base64,${encodeURIComponent(u)}`));
    const l = await coverSucheMit(h).suchen('Harry', ['ger']);
    expect(titel(l)).toEqual(['D1', 'O1', 'D3', 'O2', 'D4', 'O3', 'D5', 'O4', 'D6', 'O5', 'D7', 'O6', 'D8', 'O7', 'D9']);
    expect(l.every((x) => x.angaben.cover?.startsWith('data:image/'))).toBe(true);
  });
  it('ohne Cover: leer; beide Quellen offline: Fehler', async () => {
    const h = httpMit(dnbXmlMit([{ titel: 'D', spr: 'ger' }]), olDocs([{ title: 'O', language: ['ger'] }]), () => null);
    expect(await coverSucheMit(h).suchen('x', ['ger'])).toEqual([]);
    await expect(coverSucheMit(httpMit(null, null, () => null)).suchen('x', ['ger'])).rejects.toThrow();
  });
});

describe('Sprachfilter im Suchfenster', () => {
  it('Standard Deutsch, Mehrfachauswahl, Hinweis bei letzter, Neustart der Suche, gemerkt', async () => {
    const repo = new InMemoryEinstellungRepository();
    const suche = { suchen: vi.fn(async () => [] as Treffer[]) };
    render(<Suchfenster suche={suche} onZurueck={vi.fn()} onWahl={vi.fn()} einstellungRepository={repo} />);
    const knopf = (s: string) => screen.getByRole('button', { name: s });
    await vi.waitFor(() => expect(knopf('Deutsch')).toHaveAttribute('aria-pressed', 'true'));
    expect(knopf('Englisch')).toHaveAttribute('aria-pressed', 'false');
    // Noch nicht gesucht: Änderung startet keine Suche.
    await act(async () => fireEvent.click(knopf('Englisch')));
    expect(suche.suchen).not.toHaveBeenCalled();
    expect(await repo.lesen('onlineSucheSprachen')).toBe('["ger","eng"]');
    fireEvent.change(screen.getByRole('searchbox'), { target: { value: 'Fourth Wing' } });
    await act(async () => fireEvent.submit(screen.getByRole('searchbox').closest('form')!));
    expect(suche.suchen).toHaveBeenLastCalledWith('Fourth Wing', ['ger', 'eng']);
    await act(async () => fireEvent.click(knopf('Deutsch')));
    expect(suche.suchen).toHaveBeenLastCalledWith('Fourth Wing', ['eng']);
    await act(async () => fireEvent.click(knopf('Englisch')));
    expect(knopf('Englisch')).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByText(MINDESTENS_EINE_SPRACHE_HINWEIS)).toBeInTheDocument();
    expect(suche.suchen).toHaveBeenCalledTimes(2);
  });
});

describe('CoverSuchfenster', () => {
  const PNG = 'data:image/png;base64,AA';
  it('Vorbelegung startet sofort, Raster nur mit Quelle, Antippen liefert das Cover', async () => {
    const suche = { suchen: vi.fn(async () => [{ ...t('dnb', 'X', { cover: PNG }) }, t('openlibrary', 'ohne Cover')]) };
    const onWahl = vi.fn();
    render(<CoverSuchfenster suche={suche} vorbelegung="9783551551672" onZurueck={vi.fn()} onWahl={onWahl} />);
    const f = screen.getByRole('dialog', { name: 'Cover online suchen' });
    expect((within(f).getByRole('searchbox') as HTMLInputElement).value).toBe('9783551551672');
    await vi.waitFor(() => expect(f.querySelectorAll('[data-cover-treffer]')).toHaveLength(1));
    expect(suche.suchen).toHaveBeenCalledWith('9783551551672', ['ger']);
    const k = f.querySelector('[data-cover-treffer="0"]')!;
    expect(k.textContent).toBe('Deutsche Nationalbibliothek');
    fireEvent.click(k);
    expect(onWahl).toHaveBeenCalledWith(PNG);
  });
  it('leere Vorbelegung: keine Suche; kein Cover / kein Internet: Hinweis', async () => {
    const suche = { suchen: vi.fn(async () => [] as Treffer[]) };
    render(<CoverSuchfenster suche={suche} vorbelegung="" onZurueck={vi.fn()} onWahl={vi.fn()} />);
    await act(async () => new Promise((r) => setTimeout(r, 20)));
    expect(suche.suchen).not.toHaveBeenCalled();
    expect(document.activeElement).toBe(screen.getByRole('searchbox'));
    fireEvent.change(screen.getByRole('searchbox'), { target: { value: 'Onyx Storm' } });
    await act(async () => fireEvent.submit(screen.getByRole('searchbox').closest('form')!));
    expect(screen.getByText(KEIN_COVER_HINWEIS)).toBeInTheDocument();
    suche.suchen.mockRejectedValueOnce(new TypeError('offline'));
    await act(async () => fireEvent.submit(screen.getByRole('searchbox').closest('form')!));
    expect(screen.getByText(KEIN_INTERNET_HINWEIS)).toBeInTheDocument();
  });
  it('coverSuchtext: ISBN, sonst Titel + Autor, sonst Titel bzw. leer', () => {
    expect(coverSuchtext({ isbn: '9783551551672', titel: 'HP', autor: 'R' })).toBe('9783551551672');
    expect(coverSuchtext({ titel: 'Fourth Wing', autor: 'Rebecca Yarros' })).toBe('Fourth Wing Rebecca Yarros');
    expect(coverSuchtext({ titel: 'Fourth Wing' })).toBe('Fourth Wing');
    expect(coverSuchtext({ titel: ' ', autor: '' })).toBe('');
  });
});
