import '@testing-library/jest-dom/vitest';
import { act, cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { HttpClient } from '@/barcode/http';
import { isbnAusBarcodes, isbnNormalisieren } from '@/barcode/isbn';
import type { BarcodeScanner, ScanOptionen } from '@/barcode/scanner';
import { isbnSucheMit, type IsbnSuche } from '@/barcode/suche';
import { dnbTrefferLesen, dnbUrl, openLibraryTrefferLesen, openLibraryUrl, seitenAus, type Treffer } from '@/barcode/treffer';
import { InMemoryBookRepository } from '@/storage/InMemoryBookRepository';
import { InMemoryImageStore } from '@/storage/InMemoryImageStore';
import BuecherAnsicht from '@/views/BuecherAnsicht';

afterEach(() => cleanup());

const PNG = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAIAAACQd1PeAAAADElEQVR4nGP4z8AAAAMBAQDJ/pLvAAAAAElFTkSuQmCC';

// Gekürzte DNB-SRU-Antwort (MARC21-xml) mit Nichtsortierzeichen und ISBD-Satzzeichen.
const DNB_XML = `<?xml version="1.0" encoding="UTF-8"?>
<searchRetrieveResponse xmlns="http://www.loc.gov/zing/srw/">
  <version>1.1</version><numberOfRecords>1</numberOfRecords>
  <records><record><recordSchema>MARC21-xml</recordSchema><recordPacking>xml</recordPacking>
    <recordData>
      <record xmlns="http://www.loc.gov/MARC21/slim" type="Bibliographic">
        <leader>00000nam a2200000 c 4500</leader>
        <controlfield tag="008">200101s2019    gw ||||| |||| 00||||ger  </controlfield>
        <datafield tag="020" ind1=" " ind2=" ">
          <subfield code="a">9783551551672</subfield>
          <subfield code="9">978-3-551-55167-2</subfield>
          <subfield code="c">Festeinband : EUR 22.00 (DE)</subfield>
        </datafield>
        <datafield tag="100" ind1="1" ind2=" ">
          <subfield code="a">Rowling, J. K.</subfield>
          <subfield code="4">aut</subfield>
        </datafield>
        <datafield tag="245" ind1="1" ind2="0">
          <subfield code="a">\u0098Harry\u009C Potter und der Stein der Weisen /</subfield>
          <subfield code="c">J. K. Rowling</subfield>
        </datafield>
        <datafield tag="264" ind1=" " ind2="1">
          <subfield code="a">Hamburg</subfield>
          <subfield code="b">Carlsen</subfield>
          <subfield code="c">[2019]</subfield>
        </datafield>
        <datafield tag="300" ind1=" " ind2=" ">
          <subfield code="a">335 Seiten</subfield>
          <subfield code="c">22 cm</subfield>
        </datafield>
      </record>
    </recordData></record></records>
</searchRetrieveResponse>`;

const DNB_LEER = `<?xml version="1.0"?><searchRetrieveResponse xmlns="http://www.loc.gov/zing/srw/"><numberOfRecords>0</numberOfRecords></searchRetrieveResponse>`;

const OL_JSON = JSON.stringify({
  'ISBN:9783551551672': {
    title: 'Harry Potter und der Stein der Weisen',
    authors: [{ name: 'J. K. Rowling', url: 'x' }],
    number_of_pages: 336,
    publish_date: 'March 1, 2005',
    identifiers: { isbn_13: ['9783551551672'] },
    cover: { large: 'https://covers.openlibrary.org/b/id/123-L.jpg' },
  },
});

describe('ISBN aus Barcode', () => {
  it('akzeptiert Bindestriche, ISBN-10 mit X und prüft die Prüfziffer', () => {
    expect(isbnNormalisieren('978-3-551-55167-2')).toBe('9783551551672');
    expect(isbnNormalisieren('0-8044-2957-x')).toBe('080442957X');
    expect(isbnNormalisieren('9783551551673')).toBeNull();
    expect(isbnNormalisieren('4006381333931')).toBeNull(); // EAN, kein Buch
    expect(isbnAusBarcodes(['https://x', '9783551551672'])).toBe('9783551551672');
    expect(isbnAusBarcodes(['123'])).toBeNull();
  });
});

describe('Parser', () => {
  it('DNB: Titel, Autor, Verlag, Jahr, Seiten, ISBN, Cover-Adresse', () => {
    const [t, ...rest] = dnbTrefferLesen(DNB_XML, '9783551551672');
    expect(rest).toHaveLength(0);
    expect(t!.quelle).toBe('dnb');
    expect(t!.angaben).toEqual({
      titel: 'Harry Potter und der Stein der Weisen',
      autor: 'Rowling, J. K.',
      verlag: 'Carlsen',
      erscheinungsjahr: 2019,
      seitenanzahl: 335,
      isbn: '9783551551672',
    });
    expect(t!.coverUrl).toContain('isbn=9783551551672');
    expect(dnbTrefferLesen(DNB_LEER, '9783551551672')).toEqual([]);
    expect(dnbTrefferLesen('<kaputt', '9783551551672')).toEqual([]);
  });

  it('Open Library: Felder, fehlender Verlag bleibt leer, unbrauchbares JSON ergibt nichts', () => {
    const [t] = openLibraryTrefferLesen(OL_JSON, '9783551551672');
    expect(t!.angaben).toEqual({
      titel: 'Harry Potter und der Stein der Weisen',
      autor: 'J. K. Rowling',
      erscheinungsjahr: 2005,
      seitenanzahl: 336,
      isbn: '9783551551672',
    });
    expect(t!.coverUrl).toBe('https://covers.openlibrary.org/b/id/123-L.jpg');
    expect(openLibraryTrefferLesen('{}', '9783551551672')).toEqual([]);
    expect(openLibraryTrefferLesen('kein json', '9783551551672')).toEqual([]);
    expect(seitenAus('XII, 345 S.')).toBe(345);
    expect(seitenAus('1 Online-Ressource')).toBeUndefined();
  });
});

const fakeHttp = (antworten: Record<string, { status: number; text: string } | Error>, bilder: Record<string, string> = {}) => {
  const urls: string[] = [];
  const http: HttpClient = {
    async text(url) {
      urls.push(url);
      const a = Object.entries(antworten).find(([k]) => url.includes(k))?.[1];
      if (!a || a instanceof Error) throw a ?? new Error('offline');
      return a;
    },
    async bild(url) {
      urls.push(url);
      return bilder[url] ?? null;
    },
  };
  return { http, urls };
};

describe('ISBN-Suche', () => {
  it('fragt beide Quellen nur mit der ISBN ab und lädt Cover als Data-URL', async () => {
    const { http, urls } = fakeHttp(
      { 'services.dnb.de': { status: 200, text: DNB_XML }, 'openlibrary.org/api': { status: 200, text: OL_JSON } },
      { 'https://covers.openlibrary.org/b/id/123-L.jpg': PNG },
    );
    const treffer = await isbnSucheMit(http).suchen('9783551551672');
    expect(treffer.map((t) => t.quelle)).toEqual(['dnb', 'openlibrary']);
    expect(treffer[1]!.angaben.cover).toBe(PNG);
    expect(treffer[0]!.angaben.cover).toBeUndefined();
    expect(treffer.every((t) => t.coverUrl === undefined)).toBe(true);
    expect(urls).toContain(dnbUrl('9783551551672'));
    expect(urls).toContain(openLibraryUrl('9783551551672'));
    for (const u of urls) {
      const q = decodeURIComponent(new URL(u).search);
      expect(q.replace(/9783551551672|123-L/g, '')).not.toMatch(/\d{5,}/);
    }
  });

  it('nichts gefunden = leere Liste; keine Quelle erreichbar = Fehler; eine Quelle reicht', async () => {
    const leer = fakeHttp({ 'services.dnb.de': { status: 200, text: DNB_LEER }, 'openlibrary.org/api': { status: 200, text: '{}' } });
    await expect(isbnSucheMit(leer.http).suchen('9783551551672')).resolves.toEqual([]);
    const offline = fakeHttp({});
    await expect(isbnSucheMit(offline.http).suchen('9783551551672')).rejects.toThrow();
    const halb = fakeHttp({ 'openlibrary.org/api': { status: 200, text: OL_JSON } });
    await expect(isbnSucheMit(halb.http).suchen('9783551551672')).resolves.toHaveLength(1);
  });
});

// ---------------------------------------------------------------------------
// Ablauf über die Seite „Bücher“ mit Fakes
// ---------------------------------------------------------------------------

function fakeScanner(verweigert = false) {
  let optionen: ScanOptionen | null = null;
  const licht: boolean[] = [];
  const scanner: BarcodeScanner & { erkennen(isbn: string): void; licht: boolean[]; beendet: number } = {
    licht,
    beendet: 0,
    async starten(o) {
      if (verweigert) throw new Error('verweigert');
      optionen = o;
    },
    async lichtSetzen(an) {
      licht.push(an);
    },
    async beenden() {
      scanner.beendet++;
    },
    erkennen(isbn) {
      optionen?.beiIsbn(isbn);
    },
  };
  return scanner;
}

const treffer = (quelle: Treffer['quelle'], angaben: Treffer['angaben']): Treffer => ({ quelle, angaben });

function aufbauen(suche: IsbnSuche, scanner = fakeScanner()) {
  const repository = new InMemoryBookRepository();
  render(<BuecherAnsicht buecher={[]} repository={repository} bildspeicher={new InMemoryImageStore()} barcodeScanner={scanner} isbnSuche={suche} />);
  fireEvent.click(screen.getByRole('button', { name: 'Buch hinzufügen' }));
  fireEvent.click(screen.getByRole('menuitem', { name: /Barcode scannen/ }));
  return { repository, scanner };
}

describe('Ablauf Barcode scannen', () => {
  it('Menü → Scan-Bildschirm, Licht, Erkennung → Auswahl → Manueller Eintrag', async () => {
    const suchen = vi.fn(async () => [
      treffer('dnb', { titel: 'Titel A', autor: 'Autor A', verlag: 'Verlag A', seitenanzahl: 120, cover: PNG }),
      treffer('openlibrary', { titel: 'Titel B' }),
    ]);
    const { scanner, repository } = aufbauen({ suchen });
    const bildschirm = document.querySelector('[data-scan-bildschirm]') as HTMLElement;
    expect(bildschirm).toBeInTheDocument();
    expect(screen.queryByRole('menu')).toBeNull();
    const lampe = within(bildschirm).getByRole('button', { name: 'Taschenlampe' });
    fireEvent.click(lampe);
    expect(lampe).toHaveAttribute('data-licht', 'an');
    fireEvent.click(lampe);
    expect(lampe).toHaveAttribute('data-licht', 'aus');
    expect(scanner.licht).toEqual([true, false]);

    await act(async () => scanner.erkennen('9783551551672'));
    expect(suchen).toHaveBeenCalledWith('9783551551672');
    const fenster = await screen.findByRole('dialog', { name: 'Gefundene Bücher' });
    const karten = fenster.querySelectorAll('[data-treffer]');
    expect(karten).toHaveLength(2);
    expect(karten[0]).toHaveAttribute('data-quelle', 'dnb');
    expect(within(karten[1] as HTMLElement).getByText(/Open Library/)).toBeInTheDocument();

    fireEvent.click(karten[0]!);
    const blatt = await screen.findByRole('dialog', { name: 'Manueller Eintrag' });
    expect(within(blatt).getByDisplayValue('Titel A')).toBeInTheDocument();
    expect(within(blatt).getByDisplayValue('120')).toBeInTheDocument();
    expect(blatt.querySelector(`img[src="${PNG}"]`)).not.toBeNull();
    expect(await repository.list()).toHaveLength(0);
  });

  it('X, nichts gefunden, kein Internet, verweigerte Kamera und Zurück-Pfeil führen zur Seite „Bücher“', async () => {
    vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    aufbauen({ suchen: async () => [] });
    fireEvent.click(screen.getByRole('button', { name: 'Schließen' }));
    expect(document.querySelector('[data-seite="buecher"]')).toBeInTheDocument();
    cleanup();

    const leer = aufbauen({ suchen: async () => [] });
    await act(async () => leer.scanner.erkennen('9783551551672'));
    await waitFor(() => expect(document.querySelector('[data-seite="buecher"]')).toBeInTheDocument());
    cleanup();

    const offline = aufbauen({ suchen: async () => Promise.reject(new Error('offline')) });
    await act(async () => offline.scanner.erkennen('9783551551672'));
    await waitFor(() => expect(document.querySelector('[data-seite="buecher"]')).toBeInTheDocument());
    cleanup();

    aufbauen({ suchen: async () => [] }, fakeScanner(true));
    // Erst ein kurzer Hinweis mit der Fehlermeldung, dann zurück zur Seite „Bücher“.
    expect(await screen.findByRole('alert')).toHaveTextContent('verweigert');
    await waitFor(() => expect(document.querySelector('[data-seite="buecher"]')).toBeInTheDocument(), { timeout: 4000 });
    cleanup();

    const eins = aufbauen({ suchen: async () => [treffer('openlibrary', { titel: 'Nur einer' })] });
    await act(async () => eins.scanner.erkennen('9783551551672'));
    const fenster = await screen.findByRole('dialog', { name: 'Gefundene Bücher' });
    expect(screen.queryByRole('dialog', { name: 'Manueller Eintrag' })).toBeNull();
    fireEvent.click(within(fenster).getByRole('button', { name: 'Zurück' }));
    expect(document.querySelector('[data-seite="buecher"]')).toBeInTheDocument();
    expect(await eins.repository.list()).toHaveLength(0);
  });
});
