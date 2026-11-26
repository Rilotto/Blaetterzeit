/**
 * Akzeptanztests REQ-117 – „Online suchen“: bis zu 15 Treffer im 3-Spalten-Raster (3 × 5) abwechselnd aus beiden Quellen, Übernahme wie beim Barcode-Scan.
 * Mini-Änderung 2026-11-26 (Entwickler): 15 statt 9 Treffer; Quell-Fakes mit Sprachangabe „ger“, da die UI nach Sprache filtert (REQ-119).
 * Abgeleitet aus dem REQ-Text. Schnittstellen laut Entwickler (Sprint 12):
 *  - onlineSucheMit(http) aus @/barcode/suche (DNB SRU MARC21-xml, Open Library search.json), trefferMischen/ONLINE_SUCHE_MAX aus @/barcode/treffer.
 *  - BuecherAnsicht { onlineSuche } liefert bereits gemischte Liste.
 *  - Raster [data-online-treffer-raster] (role list), Treffer [data-online-treffer="i"][data-quelle], img[data-treffer-cover] / [data-cover-platzhalter],
 *    [data-treffer-titel], [data-treffer-autor], [data-treffer-quelle].
 *  - Canvas fehlt in jsdom: mittigZuschneiden wird partiell gemockt und markiert das Bild mit „|<verhältnis>“ (wie REQ-115-Tests).
 */
import '@testing-library/jest-dom/vitest';
import { act, cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { mittigZuschneiden } from '@/bild/bildverarbeitung';
import { onlineSucheMit, type OnlineSuche } from '@/barcode/suche';
import { ONLINE_SUCHE_MAX, trefferMischen, type Treffer } from '@/barcode/treffer';
import type { Buch } from '@/domain/buch';
import type { BookRepository, ImageStore } from '@/storage';
import BuecherAnsicht from '@/views/BuecherAnsicht';

vi.mock('@/buecher/demodaten', () => ({ demoBuecher: [] }));
vi.mock('@/bild/bildverarbeitung', async (o) => ({
  ...(await o<typeof import('@/bild/bildverarbeitung')>()),
  mittigZuschneiden: vi.fn(async (bild: string, v: number) => `${bild}|${v}`),
}));

afterEach(() => {
  cleanup();
  vi.mocked(mittigZuschneiden).mockClear();
});

const W = { timeout: 4000 };
const PNG = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAIAAACQd1PeAAAADElEQVR4nGP4z8AAAAMBAQDJ/pLvAAAAAElFTkSuQmCC';
const ISBN = '9783551551672';
const TB = 138 / 218;
const schnitte = (bild: string | null | undefined) => (bild ?? '').split('|').slice(1).map(Number);

// ---------------------------------------------------------------------------
// Fakes für Quellen
// ---------------------------------------------------------------------------
const dnbRecord = (titel: string, autor = 'Autor DNB', isbn?: string) => `
      <record xmlns="http://www.loc.gov/MARC21/slim" type="Bibliographic">
        <leader>00000nam a2200000 c 4500</leader>
        ${isbn ? `<datafield tag="020" ind1=" " ind2=" "><subfield code="a">${isbn}</subfield></datafield>` : ''}
        <datafield tag="041" ind1=" " ind2=" "><subfield code="a">ger</subfield></datafield>
        <datafield tag="100" ind1="1" ind2=" "><subfield code="a">${autor}</subfield></datafield>
        <datafield tag="245" ind1="1" ind2="0"><subfield code="a">${titel}</subfield></datafield>
      </record>`;
const dnbXml = (records: string[]) => `<?xml version="1.0" encoding="UTF-8"?>
<searchRetrieveResponse xmlns="http://www.loc.gov/zing/srw/">
  <version>1.1</version><numberOfRecords>${records.length}</numberOfRecords>
  <records>${records.map((r, i) => `<record><recordSchema>MARC21-xml</recordSchema><recordPacking>xml</recordPacking><recordData>${r}</recordData><recordPosition>${i + 1}</recordPosition></record>`).join('')}</records>
</searchRetrieveResponse>`;
const dnbN = (n: number) => dnbXml(Array.from({ length: n }, (_, i) => dnbRecord(`D${i + 1}`)));
const olN = (n: number) => JSON.stringify({ docs: Array.from({ length: n }, (_, i) => ({ title: `O${i + 1}`, author_name: ['Autor OL'], language: ['ger'] })) });

function httpFake(dnb: string | null, ol: string | null, bild: (url: string) => string | null = () => null) {
  const urls: string[] = [];
  return {
    urls,
    text: vi.fn(async (url: string) => {
      urls.push(url);
      if (url.includes('openlibrary')) {
        if (ol === null) throw new TypeError('offline');
        return { status: 200, text: ol };
      }
      if (dnb === null) throw new TypeError('offline');
      return { status: 200, text: dnb };
    }),
    bild: vi.fn(async (url: string) => {
      urls.push(url);
      return bild(url);
    }),
  };
}
const titel = (t: Treffer[]) => t.map((x) => x.angaben.titel);

// ---------------------------------------------------------------------------
// UI-Hilfen
// ---------------------------------------------------------------------------
function repoFake() {
  const daten = new Map<string, Buch>();
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
async function tippe(el: Element) {
  await act(async () => {
    fireEvent.click(el);
    await new Promise((r) => setTimeout(r, 15));
  });
}
async function warte(ms = 60) {
  await act(async () => {
    await new Promise((r) => setTimeout(r, ms));
  });
}
const fenster = () => screen.queryByRole('dialog', { name: 'Online suchen' });
const blatt = () => screen.queryByRole('dialog', { name: 'Manueller Eintrag' });
const feld = (name: string) => within(blatt()!).getByLabelText(new RegExp(`^\\s*${name}\\s*$`, 'i')) as HTMLInputElement;
const zeile = (id: string) => blatt()!.querySelector<HTMLElement>(`[data-ausgabe-zeile="${id}"]`)!;
const norm = (t: string | null | undefined) => (t ?? '').replace(/\s+/g, ' ').trim();
const wertIn = (id: string) => norm(zeile(id)?.querySelector('[data-zeile-wert]')?.textContent ?? zeile(id)?.textContent);
const kacheln = () => [...fenster()!.querySelectorAll<HTMLElement>('[data-online-treffer]')];

/** App starten, Plus → „Online suchen“, Suchtext eingeben, Such-Taste; wartet auf das Ende der Suche. */
async function sucheIn(suche: OnlineSuche, text = 'Harry Potter') {
  const repo = repoFake();
  const bilder = speicherFake();
  render(<BuecherAnsicht repository={repo} bildspeicher={bilder} onlineSuche={suche} />);
  await screen.findByRole('heading', { name: 'Deine Bücher' }, W);
  await tippe(screen.getByRole('button', { name: 'Buch hinzufügen' }));
  const m = await screen.findByRole('menu', { name: 'Buch hinzufügen' }, W);
  await tippe(m.querySelector('[data-option="online"]')!);
  await vi.waitFor(() => expect(fenster()).not.toBeNull(), W);
  const sf = within(fenster()!).getByRole('searchbox', { name: 'Titel, Autor oder ISBN' });
  fireEvent.change(sf, { target: { value: text } });
  await act(async () => {
    fireEvent.keyDown(sf, { key: 'Enter', code: 'Enter', keyCode: 13 });
    await new Promise((r) => setTimeout(r, 30));
  });
  await vi.waitFor(() => expect(fenster()!.querySelector('[data-online-suche-laeuft]')).toBeNull(), W);
  return { repo, bilder };
}
const tr = (quelle: Treffer['quelle'], t: string, extra: Treffer['angaben'] = {}): Treffer => ({ quelle, angaben: { titel: t, autor: `Autor ${t}`, ...extra } });

// ---------------------------------------------------------------------------
describe('REQ-117 Auswahl und Reihenfolge', () => {
  it('[REQ-117/AK-1] DNB D1–D10, Open Library O1–O10 → genau 15: D1,O1,…,O7,D8', async () => {
    const t = await onlineSucheMit(httpFake(dnbN(10), olN(10))).suchen('Harry Potter');
    expect(titel(t)).toEqual(['D1', 'O1', 'D2', 'O2', 'D3', 'O3', 'D4', 'O4', 'D5', 'O5', 'D6', 'O6', 'D7', 'O7', 'D8']);
    expect(t.map((x) => x.quelle)).toEqual(Array.from({ length: 15 }, (_, i) => (i % 2 ? 'openlibrary' : 'dnb')));
  });

  it('[REQ-117/AK-1] auch wenn eine Quelle mehr als angefragt liefert: höchstens 15', async () => {
    const t = await onlineSucheMit(httpFake(dnbN(20), olN(20))).suchen('Harry Potter');
    expect(t).toHaveLength(ONLINE_SUCHE_MAX);
    expect(ONLINE_SUCHE_MAX).toBe(15);
  });

  it('[REQ-117/AK-1] jede Quelle wird um höchstens 15 Treffer gebeten (keine unnötig großen Abfragen)', async () => {
    const http = httpFake(dnbN(0), olN(0));
    await onlineSucheMit(http).suchen('Harry Potter');
    const dnb = http.text.mock.calls.map((c) => c[0]).find((u) => u.includes('dnb.de'))!;
    const ol = http.text.mock.calls.map((c) => c[0]).find((u) => u.includes('openlibrary'))!;
    expect(new URL(dnb).searchParams.get('maximumRecords')).toBe('15');
    expect(new URL(ol).searchParams.get('limit')).toBe('15');
  });

  const FUENFZEHN = ['D1', 'O1', 'D2', 'O2', 'D3', 'O3', 'D4', 'O4', 'D5', 'O5', 'D6', 'O6', 'D7', 'O7', 'D8'];

  it('[REQ-117/AK-1] UI: Raster zeigt die 15 Treffer in genau der gelieferten Reihenfolge', async () => {
    const liste = FUENFZEHN.map((t) => tr(t[0] === 'D' ? 'dnb' : 'openlibrary', t));
    await sucheIn({ suchen: vi.fn(async () => liste) });
    expect(kacheln().map((k) => norm(k.querySelector('[data-treffer-titel]')!.textContent))).toEqual(FUENFZEHN);
  });

  it('[REQ-117/AK-2] DNB D1–D2, Open Library O1–O20 → D1,O1,D2,O2,O3,…,O13', async () => {
    const t = await onlineSucheMit(httpFake(dnbN(2), olN(20))).suchen('Harry Potter');
    expect(titel(t)).toEqual(['D1', 'O1', 'D2', 'O2', 'O3', 'O4', 'O5', 'O6', 'O7', 'O8', 'O9', 'O10', 'O11', 'O12', 'O13']);
  });

  it('[REQ-117/AK-2] umgekehrt: Open Library O1–O2, DNB D1–D20 → DNB füllt auf', () => {
    const d = Array.from({ length: 20 }, (_, i) => tr('dnb', `D${i + 1}`));
    const o = [tr('openlibrary', 'O1'), tr('openlibrary', 'O2')];
    expect(titel(trefferMischen(d, o))).toEqual(['D1', 'O1', 'D2', 'O2', 'D3', 'D4', 'D5', 'D6', 'D7', 'D8', 'D9', 'D10', 'D11', 'D12', 'D13']);
  });

  it('[REQ-117/AK-3] DNB liefert nichts, Open Library O1–O4 → O1,O2,O3,O4', async () => {
    const t = await onlineSucheMit(httpFake(dnbN(0), olN(4))).suchen('Harry Potter');
    expect(titel(t)).toEqual(['O1', 'O2', 'O3', 'O4']);
  });

  it('[REQ-117/AK-3] DNB nicht erreichbar, Open Library O1–O4 → O1,O2,O3,O4', async () => {
    const t = await onlineSucheMit(httpFake(null, olN(4))).suchen('Harry Potter');
    expect(titel(t)).toEqual(['O1', 'O2', 'O3', 'O4']);
  });

  it('[REQ-117/AK-3] UI: nur Open Library liefert → 4 Kacheln, alle mit Quelle „Open Library“', async () => {
    await sucheIn(onlineSucheMit(httpFake(dnbN(0), olN(4))));
    expect(kacheln().map((k) => norm(k.querySelector('[data-treffer-titel]')!.textContent))).toEqual(['O1', 'O2', 'O3', 'O4']);
    for (const k of kacheln()) expect(norm(k.querySelector('[data-treffer-quelle]')!.textContent)).toBe('Open Library');
  });
});

describe('REQ-117 Darstellung', () => {
  it('[REQ-117/AK-4] 15 Treffer: Raster mit 3 Spalten (5 Zeilen à 3), scrollbar, unter dem Suchfeld; je Treffer Cover, Titel, Autor, Quelle', async () => {
    const liste = Array.from({ length: 15 }, (_, i) => tr(i % 2 ? 'openlibrary' : 'dnb', `Buch ${i + 1}`, { cover: PNG }));
    await sucheIn({ suchen: vi.fn(async () => liste) });
    const raster = fenster()!.querySelector<HTMLElement>('[data-online-treffer-raster]')!;
    expect(raster).toHaveAttribute('role', 'list');
    expect(raster.style.display).toBe('grid');
    expect(raster.style.gridTemplateColumns.replace(/\s+/g, '')).toMatch(/^repeat\(3,/);
    const sf = within(fenster()!).getByRole('searchbox');
    expect(sf.compareDocumentPosition(raster) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(kacheln()).toHaveLength(15);
    expect(raster.parentElement!.style.overflowY).toBe('auto');
    kacheln().forEach((k, i) => {
      expect(k.parentElement).toBe(raster);
      const img = k.querySelector('img[data-treffer-cover]');
      expect(img).toHaveAttribute('src', PNG);
      const t = k.querySelector('[data-treffer-titel]')!;
      const a = k.querySelector('[data-treffer-autor]')!;
      const q = k.querySelector('[data-treffer-quelle]')!;
      expect(norm(t.textContent)).toBe(`Buch ${i + 1}`);
      expect(norm(a.textContent)).toBe(`Autor Buch ${i + 1}`);
      expect(norm(q.textContent)).toBe(i % 2 ? 'Open Library' : 'Deutsche Nationalbibliothek');
      // Titel, Autor, Quelle stehen unter dem Cover
      expect(img!.compareDocumentPosition(t) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
      expect(t.compareDocumentPosition(a) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
      expect(a.compareDocumentPosition(q) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    });
  });

  it('[REQ-117/AK-4] Treffer ohne Autor: Autorzeile entfällt, Titel und Quelle bleiben', async () => {
    await sucheIn({ suchen: vi.fn(async () => [{ quelle: 'dnb', angaben: { titel: 'Ohne Autor' } } as Treffer]) });
    const k = kacheln()[0];
    expect(k.querySelector('[data-treffer-autor]')).toBeNull();
    expect(norm(k.querySelector('[data-treffer-titel]')!.textContent)).toBe('Ohne Autor');
    expect(norm(k.querySelector('[data-treffer-quelle]')!.textContent)).toBe('Deutsche Nationalbibliothek');
  });

  it('[REQ-117/AK-4] Cover werden aus den Quellen geladen (DNB per ISBN, Open Library per Cover-ID) und angezeigt', async () => {
    const dnb = dnbXml([dnbRecord('Mit DNB-Cover', 'A', ISBN)]);
    const ol = JSON.stringify({ docs: [{ title: 'Mit OL-Cover', author_name: ['B'], cover_i: 4711, language: ['ger'] }] });
    const http = httpFake(dnb, ol, (u) => (u.includes('portal.dnb.de') || u.includes('covers.openlibrary.org/b/id/4711') ? PNG : null));
    await sucheIn(onlineSucheMit(http));
    expect(http.bild.mock.calls.some((c) => c[0].includes('portal.dnb.de') && c[0].includes(ISBN))).toBe(true);
    expect(http.bild.mock.calls.some((c) => c[0].includes('covers.openlibrary.org/b/id/4711'))).toBe(true);
    expect(kacheln()).toHaveLength(2);
    for (const k of kacheln()) expect(k.querySelector('img[data-treffer-cover]')).toHaveAttribute('src', PNG);
  });

  it('[REQ-117/AK-5] Treffer ohne Coverfoto: Cover-Platzhalter (REQ-010) statt Bild', async () => {
    await sucheIn({ suchen: vi.fn(async () => [tr('dnb', 'Mit Cover', { cover: PNG }), tr('openlibrary', 'Ohne Cover')]) });
    const [a, b] = kacheln();
    expect(a.querySelector('img[data-treffer-cover]')).not.toBeNull();
    expect(a.querySelector('[data-cover-platzhalter]')).toBeNull();
    expect(b.querySelector('img[data-treffer-cover]')).toBeNull();
    const p = b.querySelector('[data-cover-platzhalter]');
    expect(p).not.toBeNull();
    expect(p!.querySelector('[data-icon="icon-herz.png"]')).not.toBeNull();
  });

  it('[REQ-117/AK-5] Cover-Abruf liefert nichts (Fehlerstatus): Platzhalter', async () => {
    const ol = JSON.stringify({ docs: [{ title: 'Cover kaputt', cover_i: 99, language: ['ger'] }] });
    await sucheIn(onlineSucheMit(httpFake(dnbN(0), ol, () => null)));
    expect(kacheln()[0].querySelector('[data-cover-platzhalter]')).not.toBeNull();
  });

  it('[REQ-117/AK-6] dasselbe Buch aus DNB und Open Library: zwei Einträge mit je eigener Quellenangabe', async () => {
    const dnb = dnbXml([dnbRecord('Harry Potter und der Stein der Weisen', 'Rowling, J. K.', ISBN)]);
    const ol = JSON.stringify({ docs: [{ title: 'Harry Potter und der Stein der Weisen', author_name: ['J. K. Rowling'], isbn: [ISBN], language: ['ger'] }] });
    const t = await onlineSucheMit(httpFake(dnb, ol)).suchen(ISBN);
    expect(t.map((x) => x.quelle)).toEqual(['dnb', 'openlibrary']);
    cleanup();
    await sucheIn(onlineSucheMit(httpFake(dnb, ol)), ISBN);
    const k = kacheln();
    expect(k).toHaveLength(2);
    expect(k.map((x) => x.getAttribute('data-quelle'))).toEqual(['dnb', 'openlibrary']);
    expect(k.map((x) => norm(x.querySelector('[data-treffer-quelle]')!.textContent))).toEqual(['Deutsche Nationalbibliothek', 'Open Library']);
  });
});

describe('REQ-117 Übernahme', () => {
  const VOLL = tr('dnb', 'Harry Potter und der Stein der Weisen', {
    autor: 'Rowling, J. K.',
    seitenanzahl: 335,
    verlag: 'Carlsen',
    preisCent: 1299,
    format: 'print',
    unterformat: 'taschenbuch',
    isbn: ISBN,
    cover: PNG,
  });
  const OHNE_VERLAG = tr('openlibrary', 'Ohne Verlag', { autor: 'J. K. Rowling', seitenanzahl: 200 });

  async function waehle(liste: Treffer[], i = 0) {
    const w = await sucheIn({ suchen: vi.fn(async () => liste) });
    await tippe(kacheln()[i]);
    await vi.waitFor(() => expect(blatt()).not.toBeNull(), W);
    await warte();
    return w;
  }

  it('[REQ-117/AK-7] Antippen: Suchfenster zu, „Manueller Eintrag“ offen mit Titel, Autor, Seiten, Verlag, Preis, Format; noch kein Buch', async () => {
    const { repo, bilder } = await waehle([OHNE_VERLAG, VOLL], 1);
    expect(fenster()).toBeNull();
    expect(feld('Titel').value).toBe('Harry Potter und der Stein der Weisen');
    expect(feld('Autor').value).toBe('Rowling, J. K.');
    expect(feld('Seiten').value).toBe('335');
    expect(norm(zeile('verlag').textContent)).toContain('Carlsen');
    await vi.waitFor(() => expect(wertIn('preis')).toContain('12,99 €'), W);
    expect(wertIn('format')).toMatch(/Print/);
    expect(wertIn('format')).toMatch(/Taschenbuch/);
    expect(repo.save).not.toHaveBeenCalled();
    expect(bilder.put).not.toHaveBeenCalled();
  });

  it('[REQ-117/AK-7] Coverfoto nach REQ-115 zugeschnitten eingetragen (Taschenbuch 13,8 : 21,8) – schon im Blatt sichtbar', async () => {
    await waehle([VOLL]);
    expect(vi.mocked(mittigZuschneiden)).toHaveBeenCalled();
    const img = blatt()!.querySelector('[data-cover-hinzufuegen] img');
    expect(img).not.toBeNull();
    const src = img!.getAttribute('src');
    expect(src!.startsWith(PNG)).toBe(true);
    expect(schnitte(src)).toHaveLength(1);
    expect(schnitte(src)[0]).toBeCloseTo(TB, 6);
  });

  it('[REQ-117/AK-7] erst „Hinzufügen“ legt das Buch an: Angaben samt Preis/Format, Cover genau einmal zugeschnitten', async () => {
    const { repo, bilder } = await waehle([VOLL]);
    expect(repo.save).not.toHaveBeenCalled();
    await tippe(within(blatt()!).getByRole('button', { name: 'Hinzufügen' }));
    await vi.waitFor(() => expect(repo.daten.size).toBe(1), W);
    await vi.waitFor(() => expect(bilder.put).toHaveBeenCalled(), W);
    const buch = [...repo.daten.values()][0];
    expect(buch).toMatchObject({ titel: 'Harry Potter und der Stein der Weisen', autor: 'Rowling, J. K.', seitenanzahl: 335, verlag: 'Carlsen', preisCent: 1299, format: 'print', unterformat: 'taschenbuch' });
    const cover = bilder.daten.get(`${buch.id}|cover`);
    expect(cover!.startsWith(PNG)).toBe(true);
    expect(schnitte(cover)).toHaveLength(1);
    expect(schnitte(cover)[0]).toBeCloseTo(TB, 6);
  });

  it('[REQ-117/AK-7] Schließen des Blatts (X) nach REQ-030: Seite „Bücher“, kein Buch', async () => {
    const { repo } = await waehle([VOLL]);
    await tippe(within(blatt()!).getByRole('button', { name: 'Schließen' }));
    await vi.waitFor(() => expect(blatt()).toBeNull(), W);
    expect(fenster()).toBeNull();
    expect(document.querySelector('[data-seite="buecher"]')).not.toBeNull();
    expect(repo.save).not.toHaveBeenCalled();
  });

  it('[REQ-117/AK-8] Treffer ohne Verlag: Verlag leer, Felder bearbeitbar (auch Verlag), danach mit Eingaben anlegbar', async () => {
    const { repo } = await waehle([VOLL, OHNE_VERLAG], 1);
    expect(norm(zeile('verlag').textContent).replace(/›/g, '').trim()).toBe('Verlag');
    for (const n of ['Titel', 'Autor', 'Seiten']) {
      expect(feld(n)).not.toHaveAttribute('readonly');
      expect(feld(n)).not.toBeDisabled();
    }
    fireEvent.change(feld('Titel'), { target: { value: 'Eigener Titel' } });
    fireEvent.change(feld('Autor'), { target: { value: 'Eigene Autorin' } });
    fireEvent.change(feld('Seiten'), { target: { value: '321' } });
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
    await vi.waitFor(() => expect(repo.daten.size).toBe(1), W);
    expect([...repo.daten.values()][0]).toMatchObject({ titel: 'Eigener Titel', autor: 'Eigene Autorin', seitenanzahl: 321, verlag: 'Mein Verlag' });
  });

  it('[REQ-117/AK-8] Treffer ohne Preis, Format und Cover: diese bleiben leer, kein Zuschnitt', async () => {
    const { repo, bilder } = await waehle([OHNE_VERLAG]);
    expect(wertIn('preis')).not.toMatch(/\d/);
    expect(wertIn('format')).not.toMatch(/Print|Taschenbuch|E-Book|Hörbuch/);
    expect(blatt()!.querySelector('[data-cover-hinzufuegen] img')).toBeNull();
    expect(vi.mocked(mittigZuschneiden)).not.toHaveBeenCalled();
    await tippe(within(blatt()!).getByRole('button', { name: 'Hinzufügen' }));
    await vi.waitFor(() => expect(repo.daten.size).toBe(1), W);
    const buch = [...repo.daten.values()][0];
    expect(buch.verlag).toBeUndefined();
    expect(buch.preisCent).toBeUndefined();
    expect(bilder.daten.get(`${buch.id}|cover`)).toBeUndefined();
  });
});
