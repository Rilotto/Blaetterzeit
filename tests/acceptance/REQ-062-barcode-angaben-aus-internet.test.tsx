/**
 * Akzeptanztests REQ-062 – Treffer zur ISBN aus DNB und Open Library zur Auswahl, Übernahme ins Blatt „Manueller Eintrag“.
 *
 * Schnittstellen laut Entwickler (Sprint 06):
 *  - BuecherAnsicht { barcodeScanner, isbnSuche }; Suche-Fake suchen(isbn): [] = nichts gefunden, Fehler = kein Internet.
 *  - isbnSucheMit(http) mit http.text(url) / http.bild(url) zum Prüfen der Anfragen.
 *  - Treffer { quelle: 'dnb'|'openlibrary', angaben: Vorbelegung }.
 *  - Auswahl: role=dialog „Gefundene Bücher“ [data-auswahlfenster], [data-auswahl-zurueck], [data-treffer][data-quelle], [data-treffer-quelle]
 */
import '@testing-library/jest-dom/vitest';
import { act, cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import BuecherAnsicht from '@/views/BuecherAnsicht';
import { isbnSucheMit } from '@/barcode/suche';
import type { Treffer } from '@/barcode/treffer';
import type { Buch } from '@/domain/buch';
import type { BookRepository, ImageStore } from '@/storage';

const W = { timeout: 4000 };
const ISBN = '9783551551672';
const PNG = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAIAAACQd1PeAAAADElEQVR4nGP4z8AAAAMBAQDJ/pLvAAAAAElFTkSuQmCC';
const GEHEIM: Buch = { id: '62000000-0000-4000-8000-000000000001', titel: 'Geheimes Tagebuch', autor: 'Privatperson', status: 'gelesen' };

function repoFake(start: Buch[] = [GEHEIM]) {
  const daten = new Map(start.map((b) => [b.id, { ...b }]));
  const r = {
    daten,
    list: vi.fn(async () => [...daten.values()].map((b) => ({ ...b }))),
    get: vi.fn(async (id: string) => (daten.has(id) ? { ...daten.get(id)! } : undefined)),
    save: vi.fn(async (b: Buch) => void daten.set(b.id, { ...b })),
    remove: vi.fn(async (id: string) => void daten.delete(id)),
  };
  return r as typeof r & BookRepository;
}
function speicherFake() {
  const daten = new Map<string, string>();
  const s = {
    daten,
    get: vi.fn(async (id: string, b: string) => daten.get(`${id}|${b}`)),
    put: vi.fn(async (id: string, b: string, d: string) => void daten.set(`${id}|${b}`, d)),
    remove: vi.fn(async (id: string, b: string) => void daten.delete(`${id}|${b}`)),
  };
  return s as typeof s & ImageStore;
}
type Optionen = { video: HTMLVideoElement | null; beiIsbn: (isbn: string) => void };
function scannerFake() {
  const s = {
    optionen: null as Optionen | null,
    starten: vi.fn(async (o: Optionen) => void (s.optionen = o)),
    lichtSetzen: vi.fn(async () => {}),
    beenden: vi.fn(async () => {}),
  };
  return s;
}
type Suche = { suchen: (isbn: string) => Promise<Treffer[]> };

const DNB: Treffer = { quelle: 'dnb', angaben: { titel: 'Harry Potter und der Stein der Weisen', autor: 'Rowling, J. K.', seitenanzahl: 335, verlag: 'Carlsen', isbn: ISBN, cover: PNG } };
const OL: Treffer = { quelle: 'openlibrary', angaben: { titel: 'Harry Potter (OL)', autor: 'J. K. Rowling', isbn: ISBN } };

async function tippe(el: Element) {
  await act(async () => {
    fireEvent.click(el);
    await new Promise((r) => setTimeout(r, 15));
  });
}
async function zeige(suche: Suche, repo = repoFake(), bilder = speicherFake()) {
  const scanner = scannerFake();
  render(<BuecherAnsicht repository={repo} bildspeicher={bilder} barcodeScanner={scanner} isbnSuche={suche} />);
  await screen.findByRole('heading', { name: 'Deine Bücher' }, W);
  return { scanner, repo, bilder };
}
/** Plus → „Barcode scannen“ → Scanner erkennt `isbn`. */
async function scanne(scanner: ReturnType<typeof scannerFake>, isbn = ISBN) {
  await tippe(screen.getByRole('button', { name: 'Buch hinzufügen' }));
  const m = await screen.findByRole('menu', { name: 'Buch hinzufügen' }, W);
  await tippe(m.querySelector('[data-option="barcode"]')!);
  await vi.waitFor(() => expect(scanner.optionen).not.toBeNull(), W);
  await act(async () => {
    scanner.optionen!.beiIsbn(isbn);
    await new Promise((r) => setTimeout(r, 30));
  });
}
const auswahl = () => screen.queryByRole('dialog', { name: 'Gefundene Bücher' });
const blatt = () => screen.queryByRole('dialog', { name: 'Manueller Eintrag' });
const feld = (name: string) => within(blatt()!).getByLabelText(new RegExp(`^\\s*${name}\\s*$`, 'i')) as HTMLInputElement;
const zeile = (id: string) => blatt()!.querySelector<HTMLElement>(`[data-ausgabe-zeile="${id}"]`)!;
const norm = (t: string | null | undefined) => (t ?? '').replace(/\s+/g, ' ').trim();
async function seiteBuecher() {
  await vi.waitFor(() => expect(document.querySelector('[data-seite="buecher"]')).not.toBeNull(), W);
  expect(auswahl()).toBeNull();
  expect(blatt()).toBeNull();
  expect(document.querySelector('[data-scan-bildschirm]')).toBeNull();
}
const neue = (repo: ReturnType<typeof repoFake>) => [...repo.daten.values()].filter((b) => b.id !== GEHEIM.id);

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe('REQ-062 Treffer zur ISBN', () => {
  describe('AK-1 Beide Quellen, nur die ISBN', () => {
    function httpFake(antwort: (url: string) => { status: number; text: string }) {
      const urls: string[] = [];
      return {
        urls,
        text: vi.fn(async (url: string) => {
          urls.push(url);
          return antwort(url);
        }),
        bild: vi.fn(async (url: string) => {
          urls.push(url);
          return null;
        }),
      };
    }

    it('[REQ-062/AK-1] isbnSucheMit: je eine Anfrage an DNB und Open Library, jede enthält die ISBN', async () => {
      const http = httpFake(() => ({ status: 404, text: '' }));
      expect(await isbnSucheMit(http).suchen(ISBN)).toEqual([]);
      const textUrls = http.text.mock.calls.map((c) => c[0]);
      expect(textUrls).toHaveLength(2);
      expect(textUrls.filter((u) => /dnb\.de/i.test(new URL(u).hostname))).toHaveLength(1);
      expect(textUrls.filter((u) => /openlibrary\.org$/i.test(new URL(u).hostname))).toHaveLength(1);
      for (const u of textUrls) expect(u).toContain(ISBN);
    });

    it('[REQ-062/AK-1] die Anfragen hängen nur von der ISBN ab (andere ISBN → nur die ISBN in der Adresse ändert sich)', async () => {
      const a = httpFake(() => ({ status: 404, text: '' }));
      const b = httpFake(() => ({ status: 404, text: '' }));
      await isbnSucheMit(a).suchen(ISBN);
      await isbnSucheMit(b).suchen('3551551677');
      const ua = a.text.mock.calls.map((c) => c[0].split(ISBN).join('§')).sort();
      const ub = b.text.mock.calls.map((c) => c[0].split('3551551677').join('§')).sort();
      expect(ua).toEqual(ub);
    });

    it('[REQ-062/AK-1] über die App: keine Anfrage (auch Cover) enthält Titel oder Autor der eigenen Bücher', async () => {
      const ol = JSON.stringify({ [`ISBN:${ISBN}`]: { title: 'Harry Potter', authors: [{ name: 'J. K. Rowling' }], cover: { medium: `https://covers.openlibrary.org/b/isbn/${ISBN}-M.jpg` } } });
      const http = httpFake((u) => (u.includes('openlibrary') ? { status: 200, text: ol } : { status: 404, text: '' }));
      const { scanner } = await zeige(isbnSucheMit(http));
      await scanne(scanner);
      await vi.waitFor(() => expect(auswahl()).not.toBeNull(), W);
      expect(http.urls.length).toBeGreaterThanOrEqual(2);
      for (const u of http.urls) {
        const dekodiert = decodeURIComponent(u);
        for (const privat of ['Geheimes', 'Tagebuch', 'Privatperson', GEHEIM.id]) expect(dekodiert, u).not.toContain(privat);
      }
    });

    it('[REQ-062/AK-1] eine Quelle nicht erreichbar, die andere liefert: Treffer der anderen wird angezeigt', async () => {
      const ol = JSON.stringify({ [`ISBN:${ISBN}`]: { title: 'Nur OL' } });
      const http = httpFake((u) => {
        if (u.includes('openlibrary')) return { status: 200, text: ol };
        throw new Error('offline');
      });
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const treffer = await isbnSucheMit(http).suchen(ISBN);
      expect(treffer.map((t) => [t.quelle, t.angaben.titel])).toEqual([['openlibrary', 'Nur OL']]);
      warn.mockRestore();
    });
  });

  it('[REQ-062/AK-2] DNB und Open Library je ein Treffer: Auswahlfenster zeigt beide mit Quelle', async () => {
    const suche = { suchen: vi.fn(async () => [DNB, OL]) };
    const { scanner } = await zeige(suche);
    await scanne(scanner);
    const a = await screen.findByRole('dialog', { name: 'Gefundene Bücher' }, W);
    const t = Array.from(a.querySelectorAll<HTMLElement>('[data-treffer]'));
    expect(t).toHaveLength(2);
    expect(t.map((x) => x.getAttribute('data-quelle')).sort()).toEqual(['dnb', 'openlibrary']);
    const quelle = (q: string) => norm(a.querySelector(`[data-treffer][data-quelle="${q}"] [data-treffer-quelle]`)?.textContent);
    expect(quelle('dnb')).toMatch(/Deutsche Nationalbibliothek/);
    expect(quelle('openlibrary')).toMatch(/Open Library/);
    expect(norm(a.textContent)).toContain('Harry Potter und der Stein der Weisen');
    expect(norm(a.textContent)).toContain('Harry Potter (OL)');
    expect(a.querySelector('[data-auswahl-zurueck]')).not.toBeNull();
    expect(blatt()).toBeNull();
  });

  it.each([
    ['DNB', DNB],
    ['Open Library', OL],
  ])('[REQ-062/AK-3] nur %s liefert einen Treffer: Auswahlfenster mit diesem Treffer, Blatt noch nicht offen', async (_q, tr) => {
    const suche = { suchen: vi.fn(async () => [tr]) };
    const { scanner, repo } = await zeige(suche);
    await scanne(scanner);
    const a = await screen.findByRole('dialog', { name: 'Gefundene Bücher' }, W);
    expect(a.querySelectorAll('[data-treffer]')).toHaveLength(1);
    expect(blatt()).toBeNull();
    expect(repo.save).not.toHaveBeenCalled();
  });

  it('[REQ-062/AK-4] Treffer antippen: Blatt mit Titel, Autor, Seiten, Verlag und Cover; noch kein Buch angelegt', async () => {
    const suche = { suchen: vi.fn(async () => [OL, DNB]) };
    const { scanner, repo, bilder } = await zeige(suche);
    await scanne(scanner);
    const a = await screen.findByRole('dialog', { name: 'Gefundene Bücher' }, W);
    await tippe(a.querySelector('[data-treffer][data-quelle="dnb"]')!);
    await vi.waitFor(() => expect(blatt()).not.toBeNull(), W);
    expect(auswahl()).toBeNull();
    expect(feld('Titel').value).toBe('Harry Potter und der Stein der Weisen');
    expect(feld('Autor').value).toBe('Rowling, J. K.');
    expect(feld('Seiten').value).toBe('335');
    expect(norm(zeile('verlag').textContent)).toContain('Carlsen');
    expect(blatt()!.querySelector('[data-cover-hinzufuegen] img')).toHaveAttribute('src', PNG);
    expect(repo.save).not.toHaveBeenCalled();
    expect(bilder.put).not.toHaveBeenCalled();
  });

  it('[REQ-062/AK-4] danach „Hinzufügen“: Buch mit den Angaben und dem Cover als Frontcover', async () => {
    const suche = { suchen: vi.fn(async () => [DNB]) };
    const { scanner, repo, bilder } = await zeige(suche);
    await scanne(scanner);
    await tippe((await screen.findByRole('dialog', { name: 'Gefundene Bücher' }, W)).querySelector('[data-treffer]')!);
    await vi.waitFor(() => expect(blatt()).not.toBeNull(), W);
    await tippe(within(blatt()!).getByRole('button', { name: 'Hinzufügen' }));
    await screen.findByRole('region', { name: 'Buchdetails' }, W);
    const [b] = neue(repo);
    expect(b).toMatchObject({ titel: DNB.angaben.titel, autor: 'Rowling, J. K.', seitenanzahl: 335, verlag: 'Carlsen', isbn: ISBN, status: 'ungelesen' });
    await vi.waitFor(() => expect(bilder.daten.get(`${b.id}|cover`)).toBe(PNG), W);
  });

  it('[REQ-062/AK-5] Treffer ohne Verlag und Seiten: Felder leer; ausgefüllte und leere Felder lassen sich ändern', async () => {
    const suche = { suchen: vi.fn(async () => [OL]) };
    const { scanner, repo } = await zeige(suche);
    await scanne(scanner);
    await tippe((await screen.findByRole('dialog', { name: 'Gefundene Bücher' }, W)).querySelector('[data-treffer]')!);
    await vi.waitFor(() => expect(blatt()).not.toBeNull(), W);
    // Seit REQ-091 trägt die Zeile rechts den Pfeil „›“; geprüft wird: Bezeichnung „Verlag“, kein Wert.
    expect(norm(zeile('verlag').textContent).replace(/›/g, '').trim()).toBe('Verlag');
    expect(feld('Seiten').value).toBe('');
    // Seit REQ-092: kein Feld „JAHR“; ohne Angabe der Quelle bleibt „Erschienen“ leer.
    expect(norm(zeile('erschienen').textContent)).toMatch(/^Erschienen\s*›?$/);
    expect(blatt()!.querySelector('[data-cover-hinzufuegen] img')).toBeNull();
    // ändern: ausgefülltes Feld (Titel) und leere Felder (Seiten, Verlag)
    fireEvent.change(feld('Titel'), { target: { value: 'Eigener Titel' } });
    fireEvent.change(feld('Seiten'), { target: { value: '400' } });
    await tippe(zeile('verlag'));
    const f = await vi.waitFor(() => {
      const e = document.querySelector<HTMLInputElement>('[data-blatt-feld="verlag"]');
      expect(e).not.toBeNull();
      return e!;
    }, W);
    fireEvent.change(f, { target: { value: 'Mein Verlag' } });
    await tippe(document.querySelector('[data-blatt-sichern="verlag"]')!);
    await vi.waitFor(() => expect(document.querySelector('[data-blatt-feld="verlag"]')).toBeNull(), W);
    await tippe(within(blatt()!).getByRole('button', { name: 'Hinzufügen' }));
    await screen.findByRole('region', { name: 'Buchdetails' }, W);
    expect(neue(repo)[0]).toMatchObject({ titel: 'Eigener Titel', seitenanzahl: 400, verlag: 'Mein Verlag' });
  });

  it('[REQ-062/AK-5] übernommener Treffer ohne Seiten: „Hinzufügen“ legt ohne Seitenzahl kein Buch an (REQ-060)', async () => {
    const suche = { suchen: vi.fn(async () => [OL]) };
    const { scanner, repo } = await zeige(suche);
    await scanne(scanner);
    await tippe((await screen.findByRole('dialog', { name: 'Gefundene Bücher' }, W)).querySelector('[data-treffer]')!);
    await vi.waitFor(() => expect(blatt()).not.toBeNull(), W);
    await tippe(within(blatt()!).getByRole('button', { name: 'Hinzufügen' }));
    expect(repo.save).not.toHaveBeenCalled();
    expect(feld('Seiten')).toHaveAttribute('aria-invalid', 'true');
  });

  it('[REQ-062/AK-6] Zurück-Pfeil im Auswahlfenster: Seite „Bücher“, kein Buch angelegt', async () => {
    const suche = { suchen: vi.fn(async () => [DNB, OL]) };
    const { scanner, repo } = await zeige(suche);
    await scanne(scanner);
    const a = await screen.findByRole('dialog', { name: 'Gefundene Bücher' }, W);
    await tippe(a.querySelector('[data-auswahl-zurueck]')!);
    await seiteBuecher();
    expect(repo.save).not.toHaveBeenCalled();
  });

  it('[REQ-062/AK-6] Android-Zurück-Taste im Auswahlfenster: Seite „Bücher“, kein Buch angelegt', async () => {
    const suche = { suchen: vi.fn(async () => [DNB]) };
    const { scanner, repo } = await zeige(suche);
    await scanne(scanner);
    await screen.findByRole('dialog', { name: 'Gefundene Bücher' }, W);
    await act(async () => {
      window.dispatchEvent(new PopStateEvent('popstate', { state: null }));
      await new Promise((r) => setTimeout(r, 20));
    });
    await seiteBuecher();
    expect(repo.save).not.toHaveBeenCalled();
  });

  it('[REQ-062/AK-7] keine Quelle liefert einen Treffer: Seite „Bücher“, kein Buch, kein Auswahlfenster', async () => {
    const suche = { suchen: vi.fn(async () => [] as Treffer[]) };
    const { scanner, repo } = await zeige(suche);
    await scanne(scanner);
    await seiteBuecher();
    expect(suche.suchen).toHaveBeenCalledWith(ISBN);
    expect(repo.save).not.toHaveBeenCalled();
  });

  it('[REQ-062/AK-8] kein Internet (Suche schlägt fehl): Seite „Bücher“, kein Buch', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const suche = { suchen: vi.fn(async () => Promise.reject(new TypeError('Failed to fetch'))) };
    const { scanner, repo } = await zeige(suche);
    await scanne(scanner);
    await seiteBuecher();
    expect(repo.save).not.toHaveBeenCalled();
    warn.mockRestore();
  });

  it('[REQ-062/AK-8] kein Internet über isbnSucheMit (beide Anfragen scheitern): Seite „Bücher“, kein Buch', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const http = { text: vi.fn(async () => Promise.reject(new TypeError('offline'))), bild: vi.fn(async () => null) };
    const { scanner, repo } = await zeige(isbnSucheMit(http));
    await scanne(scanner);
    await seiteBuecher();
    expect(http.text).toHaveBeenCalledTimes(2);
    expect(repo.save).not.toHaveBeenCalled();
    warn.mockRestore();
  });
});

// Sprint 06 Teil C: REQ-062 AK-9 (Fassung 2026-11-18) – Preis und Format aus dem Treffer werden übernommen.
describe('REQ-062 AK-9 Preis und Format', () => {
  const MIT: Treffer = { quelle: 'dnb', angaben: { titel: 'Mit Preis', autor: 'Rowling, J. K.', isbn: ISBN, seitenanzahl: 335, preisCent: 1299, format: 'print', unterformat: 'taschenbuch' } };
  const OHNE: Treffer = { quelle: 'openlibrary', angaben: { titel: 'Ohne Preis', autor: 'J. K. Rowling', isbn: ISBN, seitenanzahl: 335 } };
  const wertIn = (id: string) => norm(zeile(id)?.querySelector('[data-zeile-wert]')?.textContent ?? zeile(id)?.textContent);

  async function waehle(quelle: 'dnb' | 'openlibrary') {
    const suche = { suchen: vi.fn(async () => [MIT, OHNE]) };
    const w = await zeige(suche);
    await scanne(w.scanner);
    const a = await screen.findByRole('dialog', { name: 'Gefundene Bücher' }, W);
    await tippe(a.querySelector(`[data-treffer][data-quelle="${quelle}"]`)!);
    await vi.waitFor(() => expect(blatt()).not.toBeNull(), W);
    return w;
  }

  it('[REQ-062/AK-9] Treffer mit Preis und Format: beides im Blatt „Manueller Eintrag“ ausgefüllt', async () => {
    await waehle('dnb');
    await vi.waitFor(() => expect(wertIn('preis')).toContain('12,99 €'), W);
    expect(wertIn('format')).toMatch(/Print/);
    expect(wertIn('format')).toMatch(/Taschenbuch/);
  });

  it('[REQ-062/AK-9] danach „Hinzufügen“: Buch mit Preis und Format gespeichert', async () => {
    const { repo } = await waehle('dnb');
    await tippe(within(blatt()!).getByRole('button', { name: 'Hinzufügen' }));
    await screen.findByRole('region', { name: 'Buchdetails' }, W);
    expect(neue(repo)).toHaveLength(1);
    expect(neue(repo)[0]).toMatchObject({ preisCent: 1299, format: 'print', unterformat: 'taschenbuch' });
  });

  it('[REQ-062/AK-9] stattdessen zweiter Treffer ohne Preis und Format: beides bleibt leer', async () => {
    const { repo } = await waehle('openlibrary');
    expect(feld('Titel').value).toBe('Ohne Preis');
    expect(wertIn('preis')).not.toMatch(/\d/);
    expect(wertIn('format')).not.toMatch(/Print|Taschenbuch|E-Book|Hörbuch/);
    await tippe(within(blatt()!).getByRole('button', { name: 'Hinzufügen' }));
    await screen.findByRole('region', { name: 'Buchdetails' }, W);
    expect(neue(repo)).toHaveLength(1);
    expect(neue(repo)[0].preisCent).toBeUndefined();
    expect(neue(repo)[0].format).toBeUndefined();
  });
});

// Sprint 11 (Fassung 2026-11-25): REQ-062 AK-10 – Formatangabe der Quelle wird Taschenbuch bzw. Hardcover zugeordnet.
describe('REQ-062 AK-10 Formatangabe der Quelle wird zugeordnet', () => {
  /** Antwort von Open Library mit Formatangabe (Felder flach und unter „details“, je nach Abfrageart). */
  function olAntwort(physicalFormat?: string) {
    const satz: Record<string, unknown> = { title: 'Formatbuch', number_of_pages: 400, isbn_13: [ISBN], ...(physicalFormat === undefined ? {} : { physical_format: physicalFormat }) };
    return JSON.stringify({ [`ISBN:${ISBN}`]: { ...satz, details: satz } });
  }
  const httpOl = (physicalFormat?: string) => ({
    text: vi.fn(async (url: string) => (/openlibrary\.org/.test(url) ? { status: 200, text: olAntwort(physicalFormat) } : { status: 404, text: '' })),
    bild: vi.fn(async () => null),
  });
  const formatWert = () => norm(zeile('format')?.querySelector('[data-zeile-wert]')?.textContent ?? '');
  /** Scan über die echte Suche (Open Library liefert „physical_format“), Treffer antippen; liefert Repo. */
  async function scanMitFormat(physicalFormat?: string) {
    const { scanner, repo } = await zeige(isbnSucheMit(httpOl(physicalFormat)));
    await scanne(scanner);
    const a = await screen.findByRole('dialog', { name: 'Gefundene Bücher' }, W);
    await tippe(a.querySelector('[data-treffer]')!);
    await vi.waitFor(() => expect(blatt()).not.toBeNull(), W);
    return repo;
  }

  it.each([
    ['Paperback', 'Print · Taschenbuch'],
    ['Hardcover', 'Print · Hardcover'],
    ['hardcover', 'Print · Hardcover'],
  ])('[REQ-062/AK-10] Formatangabe „%s“ → Zeile „Format“ im Manuellen Eintrag „%s“', async (angabe, erwartet) => {
    await scanMitFormat(angabe);
    await vi.waitFor(() => expect(formatWert()).toBe(erwartet), W);
  });

  it('[REQ-062/AK-10] Formatangabe „Audio CD“ ist nicht zuordenbar → Zeile „Format“ bleibt leer', async () => {
    await scanMitFormat('Audio CD');
    await vi.waitFor(() => expect(feld('Titel').value).toBe('Formatbuch'), W);
    expect(formatWert()).toBe('');
  });

  it.each([
    ['Mass Market Paperback', 'Print · Taschenbuch'],
    ['Taschenbuch', 'Print · Taschenbuch'],
    ['kartoniert', 'Print · Taschenbuch'],
    ['Broschur', 'Print · Taschenbuch'],
    ['PAPERBACK', 'Print · Taschenbuch'],
    ['Hardback', 'Print · Hardcover'],
    ['gebunden', 'Print · Hardcover'],
    ['HARDCOVER', 'Print · Hardcover'],
  ])('[REQ-062/AK-10] Variante aus der Anforderung: „%s“ → „%s“ (Groß-/Kleinschreibung egal)', async (angabe, erwartet) => {
    await scanMitFormat(angabe);
    await vi.waitFor(() => expect(formatWert()).toBe(erwartet), W);
  });

  it.each([['Spiralbindung'], ['Unbekannt'], ['']])('[REQ-062/AK-10] Negativfall: nicht zuordenbare Angabe „%s“ → Format leer', async (angabe) => {
    await scanMitFormat(angabe);
    await vi.waitFor(() => expect(feld('Titel').value).toBe('Formatbuch'), W);
    expect(formatWert()).toBe('');
  });

  it('[REQ-062/AK-10] zugeordnetes Format wird mit „Hinzufügen“ gespeichert (Hardcover)', async () => {
    const repo = await scanMitFormat('Hardcover');
    await vi.waitFor(() => expect(formatWert()).toBe('Print · Hardcover'), W);
    await tippe(within(blatt()!).getByRole('button', { name: 'Hinzufügen' }));
    await screen.findByRole('region', { name: 'Buchdetails' }, W);
    expect(neue(repo)).toHaveLength(1);
    expect(neue(repo)[0]).toMatchObject({ format: 'print', unterformat: 'hardcover' });
  });

  it('[REQ-062/AK-10] „Audio CD“ angelegt: Buch ohne Format gespeichert', async () => {
    const repo = await scanMitFormat('Audio CD');
    await vi.waitFor(() => expect(feld('Titel').value).toBe('Formatbuch'), W);
    await tippe(within(blatt()!).getByRole('button', { name: 'Hinzufügen' }));
    await screen.findByRole('region', { name: 'Buchdetails' }, W);
    expect(neue(repo)[0].format).toBeUndefined();
    expect(neue(repo)[0].unterformat).toBeUndefined();
  });
});
