/**
 * Akzeptanztests REQ-118 – „Cover online suchen“: Fenster mit Sprachfilter und Suchzeile, Vorbelegung und Autostart,
 * Raster mit bis zu 15 Covern aus beiden Quellen, Übernahme als Frontcover (Buchdetails) bzw. Vormerken (Manueller Eintrag).
 * Abgeleitet aus dem REQ-Text. Schnittstellen laut Entwickler (Sprint 13):
 *  - coverSucheMit(http).suchen(text, sprachen?) aus @/barcode/suche; Fake-HttpClient { text(url), bild(url) }.
 *  - BuchDetails / BuecherAnsicht Props `coverSuche`, `einstellungRepository`; Mock { suchen(text, sprachen) }, reject = kein Internet.
 *  - dialog „Cover online suchen“ [data-cover-suche], [data-ziehgriff], [data-cover-suche-zurueck], searchbox
 *    „Titel, Autor oder ISBN“, [data-cover-suche-laeuft], [data-cover-suche-hinweis], [data-cover-treffer-raster],
 *    [data-cover-treffer][data-quelle] mit img[data-treffer-cover] und [data-treffer-quelle].
 *  - Zuschnitt REQ-115 über mittigZuschneiden (hier gemockt: Ergebnis „<bild>|<verhältnis>“).
 */
import '@testing-library/jest-dom/vitest';
import { act, cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { coverSucheMit, type CoverSuche } from '@/barcode/suche';
import type { Treffer } from '@/barcode/treffer';
import type { Bildquelle } from '@/bild/bildquelle';
import type { Buch } from '@/domain/buch';
import { ZURUECK_FRIST_MS } from '@/plattform/zurueckTaste';
import { InMemoryEinstellungRepository, type BookRepository, type ImageStore } from '@/storage';
import BuchDetails from '@/views/BuchDetails';
import BuecherAnsicht from '@/views/BuecherAnsicht';

vi.mock('@/buecher/demodaten', () => ({ demoBuecher: [] }));
vi.mock('@/bild/bildverarbeitung', async (o) => ({
  ...(await o<typeof import('@/bild/bildverarbeitung')>()),
  mittigZuschneiden: vi.fn(async (b: string, v: number) => `${b}|${v}`),
}));

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

const W = { timeout: 4000 };
const ISBN = '9783551551672';
const TB = 13.8 / 21.8;
const bildUrl = (n: string) => `data:image/png;base64,${n}`;
const A = bildUrl('ALT_A');
const B = bildUrl('COVER_B');
const RUECKEN = bildUrl('RUECKEN');
const SCHNITT = bildUrl('SCHNITT');

const HP: Buch = { id: '11800000-0000-4000-8000-000000000001', titel: 'Harry Potter und der Stein der Weisen', autor: 'J. K. Rowling', isbn: ISBN, status: 'ungelesen' };
const FW: Buch = { id: '11800000-0000-4000-8000-000000000002', titel: 'Fourth Wing', autor: 'Rebecca Yarros', status: 'ungelesen' };
const FW_OHNE: Buch = { id: '11800000-0000-4000-8000-000000000003', titel: 'Fourth Wing', status: 'ungelesen' };
const VOLL: Buch = {
  id: '11800000-0000-4000-8000-000000000004',
  titel: 'Onyx Storm',
  autor: 'Rebecca Yarros',
  isbn: ISBN,
  seitenanzahl: 544,
  status: 'am_lesen',
  format: 'print',
  unterformat: 'taschenbuch',
};

// --------------------------------------------------------------------------- Test-Doubles
function repoFake(start: Buch[]) {
  const daten = new Map(start.map((b) => [b.id, structuredClone(b)]));
  const r = {
    daten,
    list: vi.fn(async () => [...daten.values()].map((b) => structuredClone(b))),
    get: vi.fn(async (id: string) => (daten.has(id) ? structuredClone(daten.get(id)!) : undefined)),
    save: vi.fn(async (b: Buch) => void daten.set(b.id, structuredClone(b))),
    remove: vi.fn(async (id: string) => void daten.delete(id)),
  };
  return r as typeof r & BookRepository;
}
function speicherFake(start: Record<string, string> = {}) {
  const daten = new Map<string, string>(Object.entries(start));
  const s = {
    daten,
    get: vi.fn(async (id: string, b: string) => daten.get(`${id}|${b}`)),
    put: vi.fn(async (id: string, b: string, d: string) => void daten.set(`${id}|${b}`, d)),
    remove: vi.fn(async (id: string, b: string) => void daten.delete(`${id}|${b}`)),
  };
  return s as typeof s & ImageStore;
}
const tr = (quelle: Treffer['quelle'], titel: string, cover?: string, extra: Treffer['angaben'] = {}): Treffer => ({
  quelle,
  angaben: { titel, ...(cover ? { cover } : {}), ...extra },
  sprachen: ['ger'],
});
type SucheMock = CoverSuche & { suchen: ReturnType<typeof vi.fn> };
const sucheMit = (f: (text: string, sprachen?: readonly string[]) => Promise<Treffer[]>): SucheMock => ({ suchen: vi.fn(f) }) as SucheMock;
const ruhig = () => sucheMit(() => new Promise<never>(() => {}));

/** Prüfziffer-gültige ISBN-13 aus laufender Nummer. */
function isbn13(n: number) {
  const k = `978300${String(n).padStart(6, '0')}`;
  const s = [...k].reduce((a, c, i) => a + Number(c) * (i % 2 ? 3 : 1), 0);
  return k + ((10 - (s % 10)) % 10);
}
const dnbRecord = (titel: string, isbn?: string, sprache = 'ger') => `
      <record xmlns="http://www.loc.gov/MARC21/slim" type="Bibliographic">
        <leader>00000nam a2200000 c 4500</leader>
        ${isbn ? `<datafield tag="020" ind1=" " ind2=" "><subfield code="a">${isbn}</subfield></datafield>` : ''}
        <datafield tag="041" ind1=" " ind2=" "><subfield code="a">${sprache}</subfield></datafield>
        <datafield tag="100" ind1="1" ind2=" "><subfield code="a">Autor DNB</subfield></datafield>
        <datafield tag="245" ind1="1" ind2="0"><subfield code="a">${titel}</subfield></datafield>
      </record>`;
const dnbXml = (records: string[]) => `<?xml version="1.0" encoding="UTF-8"?>
<searchRetrieveResponse xmlns="http://www.loc.gov/zing/srw/">
  <version>1.1</version><numberOfRecords>${records.length}</numberOfRecords>
  <records>${records.map((r, i) => `<record><recordSchema>MARC21-xml</recordSchema><recordPacking>xml</recordPacking><recordData>${r}</recordData><recordPosition>${i + 1}</recordPosition></record>`).join('')}</records>
</searchRetrieveResponse>`;
/** DNB D1..Dn; `ohneCover` = Nummern ohne ISBN (also ohne Cover). */
const dnbN = (n: number, ohneCover: number[] = []) =>
  dnbXml(Array.from({ length: n }, (_, i) => dnbRecord(`D${i + 1}`, ohneCover.includes(i + 1) ? undefined : isbn13(i + 1))));
const olN = (n: number, ohneCover: number[] = []) =>
  JSON.stringify({
    docs: Array.from({ length: n }, (_, i) => ({
      title: `O${i + 1}`,
      author_name: ['Autor OL'],
      language: ['ger'],
      ...(ohneCover.includes(i + 1) ? {} : { cover_i: 1000 + i + 1 }),
    })),
  });
function httpFake(dnb: string | null, ol: string | null, bild: (url: string) => string | null = (u) => bildUrl(encodeURIComponent(u))) {
  return {
    text: vi.fn(async (url: string) => {
      if (url.includes('dnb.de')) return dnb === null ? Promise.reject(new TypeError('offline')) : { status: 200, text: dnb };
      if (url.includes('openlibrary')) return ol === null ? Promise.reject(new TypeError('offline')) : { status: 200, text: ol };
      return { status: 404, text: '' };
    }),
    bild: vi.fn(async (url: string) => bild(url)),
  };
}
const titel = (t: Treffer[]) => t.map((x) => x.angaben.titel);

// --------------------------------------------------------------------------- UI-Hilfen
async function warte(ms = 30) {
  await act(async () => {
    await new Promise((r) => setTimeout(r, ms));
  });
}
async function tippe(el: Element) {
  await act(async () => {
    fireEvent.click(el);
    await new Promise((r) => setTimeout(r, 20));
  });
}
const fenster = () => screen.queryByRole('dialog', { name: 'Cover online suchen' });
const suchzeile = () => within(fenster()!).getByRole('searchbox', { name: 'Titel, Autor oder ISBN' }) as HTMLInputElement;
const hinweis = () => document.querySelector<HTMLElement>('[data-cover-suche-hinweis]');
const kacheln = () => Array.from(document.querySelectorAll<HTMLElement>('[data-cover-treffer]'));
const menue = () => screen.queryByRole('menu', { name: 'Bild hinzufügen' });
const bereich = (b: string) => document.querySelector<HTMLElement>(`[data-bereich="${b}"]`)!;
const coverImDetail = () => bereich('cover')?.querySelector('img[data-bereich-bild]')?.getAttribute('src') ?? null;
const details = () => screen.queryByRole('region', { name: 'Buchdetails' });

async function zeigeDetails(buch: Buch, opt: { suche?: SucheMock; s?: ReturnType<typeof speicherFake>; repo?: ReturnType<typeof repoFake>; q?: Bildquelle } = {}) {
  const suche = opt.suche ?? ruhig();
  const s = opt.s ?? speicherFake();
  const repo = opt.repo ?? repoFake([buch]);
  const q = opt.q ?? { scannen: vi.fn(async () => null), galerie: vi.fn(async () => null) };
  render(
    <BuchDetails
      buchId={buch.id}
      repository={repo}
      bildquelle={q}
      bildspeicher={s}
      coverSuche={suche}
      einstellungRepository={new InMemoryEinstellungRepository()}
      onZurueck={() => {}}
    />,
  );
  await screen.findByRole('region', { name: 'Buchdetails' }, W);
  await vi.waitFor(() => expect(document.querySelectorAll('[data-bereich]')).toHaveLength(3), W);
  await warte(20);
  return { suche, s, repo };
}
async function oeffneCoverSuche(b = 'cover') {
  fireEvent.click(bereich(b));
  const m = await screen.findByRole('menu', { name: 'Bild hinzufügen' }, W);
  await tippe(within(m).getByRole('menuitem', { name: 'Cover online suchen' }));
  await vi.waitFor(() => expect(fenster()).not.toBeNull(), W);
  await warte(30);
  return fenster()!;
}
function eintippen(text: string) {
  fireEvent.change(suchzeile(), { target: { value: text } });
}
async function suchTaste() {
  await act(async () => {
    fireEvent.keyDown(suchzeile(), { key: 'Enter', code: 'Enter', keyCode: 13 });
    await new Promise((r) => setTimeout(r, 40));
  });
}
async function androidZurueck() {
  await act(async () => {
    await new Promise((r) => setTimeout(r, ZURUECK_FRIST_MS + 100));
  });
  await act(async () => {
    window.dispatchEvent(new PopStateEvent('popstate', { state: null }));
    await new Promise((r) => setTimeout(r, 30));
  });
}
async function zieheRunter() {
  const g = fenster()!.querySelector<HTMLElement>('[data-ziehgriff]')!;
  const o = { pointerId: 1, isPrimary: true, pointerType: 'touch', button: 0, buttons: 1, clientX: 200, clientY: 100 };
  fireEvent.pointerDown(g, o);
  for (const y of [200, 300, 500]) fireEvent.pointerMove(g, { ...o, clientY: y });
  fireEvent.pointerUp(g, { ...o, clientY: 500, buttons: 0 });
  await warte(40);
}

// ===========================================================================
describe('REQ-118 Aufruf und Aufbau', () => {
  it('[REQ-118/AK-1] „Cover online suchen“ im Bereich „Cover“: Menü zu, Fenster offen, oben Sprachfilter, darunter Suchzeile, Ziehgriff und Zurück-Pfeil', async () => {
    await zeigeDetails(HP);
    const f = await oeffneCoverSuche();
    expect(menue()).toBeNull();
    expect(f).toHaveAttribute('data-cover-suche');
    const filter = within(f).getByRole('group', { name: 'Sprache' });
    const zeile = suchzeile();
    expect(filter.compareDocumentPosition(zeile) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(f.querySelector('[data-ziehgriff]')).not.toBeNull();
    expect(within(f).getByRole('button', { name: 'Zurück' })).toHaveAttribute('data-cover-suche-zurueck');
  });

  it.each(['ruecken', 'schnitt'])('[REQ-118/AK-1] Negativfall: im Bereich „%s“ wird „Cover online suchen“ nicht angeboten', async (b) => {
    await zeigeDetails(HP);
    fireEvent.click(bereich(b));
    const m = await screen.findByRole('menu', { name: 'Bild hinzufügen' }, W);
    expect(within(m).queryByRole('menuitem', { name: 'Cover online suchen' })).toBeNull();
  });
});

describe('REQ-118 Vorbelegung und automatischer Start', () => {
  it('[REQ-118/AK-2] Buch mit ISBN: Suchzeile „9783551551672“, Suche startet ohne Eingabe (mit Sprachauswahl)', async () => {
    const { suche } = await zeigeDetails(HP);
    await oeffneCoverSuche();
    expect(suchzeile().value).toBe(ISBN);
    await vi.waitFor(() => expect(suche.suchen).toHaveBeenCalledTimes(1), W);
    expect(suche.suchen).toHaveBeenCalledWith(ISBN, ['ger']);
    // Mit Vorbelegung öffnet sich die Tastatur nicht (Auslegung).
    expect(document.activeElement).not.toBe(suchzeile());
  });

  it('[REQ-118/AK-2] Datenebene: ohne weitere Eingabe gehen Anfragen an DNB und Open Library', async () => {
    const http = httpFake(dnbN(0), olN(0));
    const s = sucheMit((t, spr) => coverSucheMit(http).suchen(t, spr));
    await zeigeDetails(HP, { suche: s });
    await oeffneCoverSuche();
    await vi.waitFor(() => expect(http.text).toHaveBeenCalledTimes(2), W);
    const urls = http.text.mock.calls.map((c) => c[0] as string);
    expect(urls.some((u) => u.includes('dnb.de'))).toBe(true);
    expect(urls.some((u) => u.includes('openlibrary.org'))).toBe(true);
  });

  it.each([
    [FW, 'Fourth Wing Rebecca Yarros'],
    [FW_OHNE, 'Fourth Wing'],
  ])('[REQ-118/AK-3] Buch ohne ISBN: Suchzeile „%#“ aus Titel (+ Autor), Suche startet automatisch', async (buch, soll) => {
    const { suche } = await zeigeDetails(buch);
    await oeffneCoverSuche();
    expect(suchzeile().value).toBe(soll);
    await vi.waitFor(() => expect(suche.suchen).toHaveBeenCalledWith(soll, ['ger']), W);
    expect(suche.suchen).toHaveBeenCalledTimes(1);
  });
});

describe('REQ-118 Erneut suchen', () => {
  it('[REQ-118/AK-4] Text ändern sucht nicht; Such-Taste sucht mit „Onyx Storm“ neu, Raster zeigt nur neue Ergebnisse', async () => {
    const suche = sucheMit(async (t) =>
      t === 'Onyx Storm' ? [tr('dnb', 'N1', bildUrl('N1')), tr('openlibrary', 'N2', bildUrl('N2'))] : [tr('dnb', 'A1', bildUrl('A1')), tr('openlibrary', 'A2', bildUrl('A2')), tr('dnb', 'A3', bildUrl('A3'))],
    );
    await zeigeDetails(HP, { suche });
    await oeffneCoverSuche();
    await vi.waitFor(() => expect(kacheln()).toHaveLength(3), W);
    eintippen('Onyx');
    eintippen('Onyx Storm');
    await warte(40);
    expect(suche.suchen).toHaveBeenCalledTimes(1);
    await suchTaste();
    await vi.waitFor(() => expect(suche.suchen).toHaveBeenCalledTimes(2), W);
    expect(suche.suchen).toHaveBeenLastCalledWith('Onyx Storm', ['ger']);
    await vi.waitFor(() => expect(kacheln().map((k) => k.querySelector('img')!.getAttribute('src'))).toEqual([bildUrl('N1'), bildUrl('N2')]), W);
  });

  it('[REQ-118/AK-4] Datenebene: neue Anfragen mit „Onyx Storm“ an beide Quellen', async () => {
    const http = httpFake(dnbN(0), olN(0));
    await coverSucheMit(http).suchen('Onyx Storm', ['ger']);
    const urls = http.text.mock.calls.map((c) => decodeURIComponent(c[0] as string).replace(/\+/g, ' '));
    expect(urls.filter((u) => u.includes('dnb.de') && u.includes('Onyx') && u.includes('Storm'))).toHaveLength(1);
    expect(urls.filter((u) => u.includes('openlibrary') && u.includes('Onyx Storm'))).toHaveLength(1);
  });

  it('[REQ-118/AK-4] Negativfall: Such-Taste bei leerer bzw. nur Leerzeichen enthaltender Suchzeile tut nichts', async () => {
    const suche = sucheMit(async () => [tr('dnb', 'A1', bildUrl('A1'))]);
    await zeigeDetails(HP, { suche });
    await oeffneCoverSuche();
    await vi.waitFor(() => expect(kacheln()).toHaveLength(1), W);
    eintippen('   ');
    await suchTaste();
    expect(suche.suchen).toHaveBeenCalledTimes(1);
    expect(kacheln()).toHaveLength(1);
  });
});

describe('REQ-118 Ergebnis (Datenebene coverSucheMit)', () => {
  it('[REQ-118/AK-5] DNB D1–D10 (D2 ohne Cover), Open Library O1–O10 → genau 15: D1,O1,D3,O2,…,D9; D2 fehlt', async () => {
    const t = await coverSucheMit(httpFake(dnbN(10, [2]), olN(10))).suchen('Harry Potter', ['ger']);
    expect(titel(t)).toEqual(['D1', 'O1', 'D3', 'O2', 'D4', 'O3', 'D5', 'O4', 'D6', 'O5', 'D7', 'O6', 'D8', 'O7', 'D9']);
    expect(titel(t)).not.toContain('D2');
    t.forEach((x) => expect(x.angaben.cover).toMatch(/^data:image\//));
  });

  it('[REQ-118/AK-5] Cover-Adresse vorhanden, Bild aber nicht ladbar: Treffer entfällt ebenfalls', async () => {
    const http = httpFake(dnbN(3), olN(3), (u) => (u.includes(isbn13(1)) || u.includes('/1002-') ? null : bildUrl('ok')));
    const t = await coverSucheMit(http).suchen('Harry Potter', ['ger']);
    expect(titel(t)).toEqual(['D2', 'O1', 'D3', 'O3']);
  });

  it('[REQ-118/AK-5] Grenzfall: mehr als 15 Cover verfügbar → höchstens 15', async () => {
    const t = await coverSucheMit(httpFake(dnbN(20), olN(20))).suchen('Harry Potter', ['ger']);
    expect(t).toHaveLength(15);
  });

  it('[REQ-118/AK-6] DNB D1–D2, Open Library O1–O4 → D1,O1,D2,O2,O3,O4', async () => {
    const t = await coverSucheMit(httpFake(dnbN(2), olN(4))).suchen('Fourth Wing', ['ger']);
    expect(titel(t)).toEqual(['D1', 'O1', 'D2', 'O2', 'O3', 'O4']);
  });

  it('[REQ-118/AK-6] umgekehrt: Open Library ohne Cover, DNB füllt auf', async () => {
    const t = await coverSucheMit(httpFake(dnbN(4), olN(3, [1, 2, 3]))).suchen('Fourth Wing', ['ger']);
    expect(titel(t)).toEqual(['D1', 'D2', 'D3', 'D4']);
  });

  it('[REQ-118/AK-6] gleiche ISBN in beiden Quellen: Treffer werden nicht zusammengeführt', async () => {
    const dnb = dnbXml([dnbRecord('Gleich', ISBN)]);
    const ol = JSON.stringify({ docs: [{ title: 'Gleich', isbn: [ISBN], cover_i: 7, language: ['ger'] }] });
    const t = await coverSucheMit(httpFake(dnb, ol)).suchen(ISBN, ['ger']);
    expect(t.map((x) => x.quelle)).toEqual(['dnb', 'openlibrary']);
  });
});

describe('REQ-118 Raster', () => {
  it('[REQ-118/AK-7] 15 Cover: 3 Spalten (5 Zeilen), zeilenweise in Lieferreihenfolge, scrollbar; unter jedem Cover nur die Quelle', async () => {
    const liste = Array.from({ length: 15 }, (_, i) =>
      tr(i % 2 ? 'openlibrary' : 'dnb', `Titel ${i + 1}`, bildUrl(`K${i + 1}`), { autor: `Autor ${i + 1}` }),
    );
    await zeigeDetails(HP, { suche: sucheMit(async () => liste) });
    const f = await oeffneCoverSuche();
    await vi.waitFor(() => expect(kacheln()).toHaveLength(15), W);
    const raster = f.querySelector<HTMLElement>('[data-cover-treffer-raster]')!;
    expect(raster).toHaveAttribute('role', 'list');
    expect(raster).toHaveAttribute('aria-label', 'Gefundene Cover');
    expect(raster.style.display).toBe('grid');
    expect(raster.style.gridTemplateColumns.replace(/\s+/g, '')).toMatch(/^repeat\(3,/);
    expect(Math.ceil(kacheln().length / 3)).toBe(5);
    expect(raster.parentElement!.style.overflowY).toBe('auto');
    expect(suchzeile().compareDocumentPosition(raster) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    kacheln().forEach((k, i) => {
      expect(k.parentElement).toBe(raster);
      expect(k.querySelector('img[data-treffer-cover]')!.getAttribute('src')).toBe(bildUrl(`K${i + 1}`));
      const q = k.querySelector<HTMLElement>('[data-treffer-quelle]')!;
      expect(q.textContent).toBe(i % 2 ? 'Open Library' : 'Deutsche Nationalbibliothek');
      expect(k.querySelector('img')!.compareDocumentPosition(q) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
      expect(k.getAttribute('data-quelle')).toBe(i % 2 ? 'openlibrary' : 'dnb');
      expect(k.textContent).not.toContain(`Titel ${i + 1}`);
      expect(k.textContent).not.toContain(`Autor ${i + 1}`);
      expect(k.textContent!.trim()).toBe(q.textContent);
    });
  });
});

describe('REQ-118 Übernahme in den Buchdetails', () => {
  it('[REQ-118/AK-8] Cover B ersetzt A, auf 13,8 : 21,8 zugeschnitten, gespeichert; Fenster zu; nach Neustart weiterhin B', async () => {
    const buch: Buch = { id: '11800000-0000-4000-8000-000000000008', titel: 'Momo', status: 'ungelesen', format: 'print', unterformat: 'taschenbuch' };
    const s = speicherFake({ [`${buch.id}|cover`]: A });
    const repo = repoFake([buch]);
    const suche = sucheMit(async () => [tr('dnb', 'B', B)]);
    await zeigeDetails(buch, { s, repo, suche });
    await vi.waitFor(() => expect(coverImDetail()).toBe(A), W);
    await oeffneCoverSuche();
    await vi.waitFor(() => expect(kacheln()).toHaveLength(1), W);
    await tippe(kacheln()[0]);
    await vi.waitFor(() => expect(fenster()).toBeNull(), W);
    const soll = `${B}|${TB}`;
    await vi.waitFor(() => expect(s.daten.get(`${buch.id}|cover`)).toBe(soll), W);
    const [, v] = s.daten.get(`${buch.id}|cover`)!.split('|');
    expect(Number(v)).toBeCloseTo(13.8 / 21.8, 6);
    await vi.waitFor(() => expect(coverImDetail()).toBe(soll), W);
    expect(details()).not.toBeNull();
    // Neustart: neue Instanz der Buchdetails auf demselben Speicher.
    cleanup();
    await zeigeDetails(buch, { s, repo });
    await vi.waitFor(() => expect(coverImDetail()).toBe(soll), W);
  });

  it('[REQ-118/AK-8] ohne vorhandenes Cover: B wird als Frontcover übernommen', async () => {
    const s = speicherFake();
    await zeigeDetails(FW, { s, suche: sucheMit(async () => [tr('openlibrary', 'B', B)]) });
    await oeffneCoverSuche();
    await vi.waitFor(() => expect(kacheln()).toHaveLength(1), W);
    await tippe(kacheln()[0]);
    await vi.waitFor(() => expect(s.daten.get(`${FW.id}|cover`)).toMatch(new RegExp(`^${B}\\|`)), W);
  });

  it('[REQ-118/AK-9] nur das Frontcover ändert sich: Titel, Autor, ISBN, Seiten, Status, Rücken und Schnitt unverändert', async () => {
    const s = speicherFake({ [`${VOLL.id}|ruecken`]: RUECKEN, [`${VOLL.id}|schnitt`]: SCHNITT });
    const repo = repoFake([VOLL]);
    const treffer = tr('dnb', 'Ganz anderer Titel', B, { autor: 'Jemand Anderes', isbn: '9780000000002', seitenanzahl: 12, verlag: 'X' });
    await zeigeDetails(VOLL, { s, repo, suche: sucheMit(async () => [treffer]) });
    const vorher = structuredClone(repo.daten.get(VOLL.id));
    await oeffneCoverSuche();
    await vi.waitFor(() => expect(kacheln()).toHaveLength(1), W);
    await tippe(kacheln()[0]);
    await vi.waitFor(() => expect(s.daten.get(`${VOLL.id}|cover`)).toMatch(new RegExp(`^${B}\\|`)), W);
    await warte(50);
    expect(repo.daten.get(VOLL.id)).toEqual(vorher);
    expect(s.daten.get(`${VOLL.id}|ruecken`)).toBe(RUECKEN);
    expect(s.daten.get(`${VOLL.id}|schnitt`)).toBe(SCHNITT);
    expect(s.put.mock.calls.every((c) => c[1] === 'cover')).toBe(true);
  });
});

describe('REQ-118 Kein Ergebnis', () => {
  it('[REQ-118/AK-10] keine Treffer: Fenster offen, Suchtext bleibt, Hinweis „Kein Cover gefunden“', async () => {
    await zeigeDetails(HP, { suche: sucheMit(async () => []) });
    await oeffneCoverSuche();
    await vi.waitFor(() => expect(hinweis()?.textContent).toBe('Kein Cover gefunden'), W);
    expect(hinweis()).toHaveAttribute('role', 'status');
    expect(fenster()).not.toBeNull();
    expect(suchzeile().value).toBe(ISBN);
    expect(kacheln()).toHaveLength(0);
  });

  it('[REQ-118/AK-10] nur Treffer ohne Cover (UI): Hinweis „Kein Cover gefunden“, keine Kachel', async () => {
    await zeigeDetails(HP, { suche: sucheMit(async () => [tr('dnb', 'D1'), tr('openlibrary', 'O1')]) });
    await oeffneCoverSuche();
    await vi.waitFor(() => expect(hinweis()?.textContent).toBe('Kein Cover gefunden'), W);
    expect(kacheln()).toHaveLength(0);
    expect(suchzeile().value).toBe(ISBN);
  });

  it('[REQ-118/AK-10] nur Treffer ohne Cover (Datenebene): leere Liste', async () => {
    const t = await coverSucheMit(httpFake(dnbN(3, [1, 2, 3]), olN(3, [1, 2, 3]))).suchen('Harry Potter', ['ger']);
    expect(t).toEqual([]);
  });

  it('[REQ-118/AK-10] Hinweis bleibt stehen (nicht nur kurz) und das Fenster schließt nicht von selbst', async () => {
    await zeigeDetails(HP, { suche: sucheMit(async () => []) });
    await oeffneCoverSuche();
    await vi.waitFor(() => expect(hinweis()).not.toBeNull(), W);
    await warte(3200);
    expect(fenster()).not.toBeNull();
    expect(hinweis()?.textContent).toBe('Kein Cover gefunden');
  });

  it('[REQ-118/AK-11] keine Internetverbindung: Fenster offen, Hinweis „Keine Internetverbindung“, Frontcover unverändert', async () => {
    const buch = { ...HP, id: '11800000-0000-4000-8000-000000000011' };
    const s = speicherFake({ [`${buch.id}|cover`]: A });
    await zeigeDetails(buch, { s, suche: sucheMit(() => Promise.reject(new TypeError('Failed to fetch'))) });
    await oeffneCoverSuche();
    await vi.waitFor(() => expect(hinweis()?.textContent).toBe('Keine Internetverbindung'), W);
    expect(fenster()).not.toBeNull();
    expect(suchzeile().value).toBe(ISBN);
    expect(s.daten.get(`${buch.id}|cover`)).toBe(A);
    expect(s.put).not.toHaveBeenCalled();
  });

  it('[REQ-118/AK-11] Datenebene: beide Quellen nicht erreichbar → Fehler; nur eine → Cover der anderen', async () => {
    await expect(coverSucheMit(httpFake(null, null)).suchen('Harry Potter', ['ger'])).rejects.toBeTruthy();
    const t = await coverSucheMit(httpFake(null, olN(2))).suchen('Harry Potter', ['ger']);
    expect(titel(t)).toEqual(['O1', 'O2']);
  });
});

describe('REQ-118 Manueller Eintrag', () => {
  async function zeigeAnsicht(suche: SucheMock, s = speicherFake(), repo = repoFake([])) {
    render(<BuecherAnsicht repository={repo} bildspeicher={s} coverSuche={suche} einstellungRepository={new InMemoryEinstellungRepository()} />);
    await screen.findByRole('heading', { name: 'Deine Bücher' }, W);
    fireEvent.click(screen.getByRole('button', { name: 'Buch hinzufügen' }));
    const m = await screen.findByRole('menu', { name: 'Buch hinzufügen' }, W);
    fireEvent.click(within(m).getByRole('menuitem', { name: /Von Hand eintragen/ }));
    await screen.findByRole('dialog', { name: 'Manueller Eintrag' }, W);
    return { s, repo };
  }
  const blatt = () => screen.getByRole('dialog', { name: 'Manueller Eintrag' });
  const feld = (name: string) => within(blatt()).getByLabelText(new RegExp(`^\\s*${name}\\s*$`, 'i')) as HTMLInputElement;
  const gib = (name: string, w: string) => fireEvent.change(feld(name), { target: { value: w } });
  const coverFeld = () => document.querySelector<HTMLElement>('[data-cover-hinzufuegen]')!;
  async function oeffneAusBlatt() {
    fireEvent.click(coverFeld());
    const m = await screen.findByRole('menu', { name: 'Bild hinzufügen' }, W);
    await tippe(within(m).getByRole('menuitem', { name: 'Cover online suchen' }));
    await vi.waitFor(() => expect(fenster()).not.toBeNull(), W);
    await warte(30);
  }

  it('[REQ-118/AK-12] Titel „Iron Flame“ + Autor „Rebecca Yarros“: Suchzeile „Iron Flame Rebecca Yarros“, Autostart', async () => {
    const suche = sucheMit(async () => []);
    await zeigeAnsicht(suche);
    gib('Titel', 'Iron Flame');
    gib('Autor', 'Rebecca Yarros');
    await oeffneAusBlatt();
    expect(suchzeile().value).toBe('Iron Flame Rebecca Yarros');
    await vi.waitFor(() => expect(suche.suchen).toHaveBeenCalledWith('Iron Flame Rebecca Yarros', ['ger']), W);
    expect(suche.suchen).toHaveBeenCalledTimes(1);
  });

  it('[REQ-118/AK-13] nichts eingetragen: Suchzeile leer, keine Anfrage, Tastatur offen', async () => {
    const suche = sucheMit(async () => []);
    await zeigeAnsicht(suche);
    await oeffneAusBlatt();
    expect(suchzeile().value).toBe('');
    await warte(100);
    expect(suche.suchen).not.toHaveBeenCalled();
    expect(document.activeElement).toBe(suchzeile());
  });

  it('[REQ-118/AK-13] nur Leerzeichen im Titel gelten als nicht eingetragen: keine Anfrage', async () => {
    const suche = sucheMit(async () => []);
    await zeigeAnsicht(suche);
    gib('Titel', '   ');
    await oeffneAusBlatt();
    expect(suchzeile().value.trim()).toBe('');
    await warte(100);
    expect(suche.suchen).not.toHaveBeenCalled();
  });

  it('[REQ-118/AK-14] Cover antippen: Fenster zu, zugeschnittenes Cover im Feld, Titel bleibt, kein Buch angelegt; nach „Hinzufügen“ Frontcover', async () => {
    const suche = sucheMit(async () => [tr('openlibrary', 'Fremder Titel', B, { autor: 'Fremd' })]);
    const { s, repo } = await zeigeAnsicht(suche);
    gib('Titel', 'Iron Flame');
    await oeffneAusBlatt();
    await vi.waitFor(() => expect(kacheln()).toHaveLength(1), W);
    await tippe(kacheln()[0]);
    await vi.waitFor(() => expect(fenster()).toBeNull(), W);
    const soll = `${B}|${TB}`;
    await vi.waitFor(() => expect(coverFeld().querySelector('img')?.getAttribute('src')).toBe(soll), W);
    expect(feld('Titel').value).toBe('Iron Flame');
    expect(feld('Autor').value).toBe('');
    expect(repo.save).not.toHaveBeenCalled();
    expect(s.put).not.toHaveBeenCalled();
    if (feld('Seiten').value === '') gib('Seiten', '100');
    await act(async () => {
      fireEvent.click(within(blatt()).getByRole('button', { name: 'Hinzufügen' }));
      await new Promise((r) => setTimeout(r, 40));
    });
    await vi.waitFor(() => expect(repo.daten.size).toBe(1), W);
    const neu = [...repo.daten.values()][0];
    expect(neu.titel).toBe('Iron Flame');
    await vi.waitFor(() => expect(s.daten.get(`${neu.id}|cover`)).toBe(soll), W);
  });

  it('[REQ-118/AK-14] ein bereits vorgemerktes Bild wird ersetzt', async () => {
    const B2 = bildUrl('COVER_B2');
    let n = 0;
    const suche = sucheMit(async () => [tr('dnb', 'X', n++ === 0 ? B : B2)]);
    await zeigeAnsicht(suche);
    gib('Titel', 'Iron Flame');
    await oeffneAusBlatt();
    await vi.waitFor(() => expect(kacheln()).toHaveLength(1), W);
    await tippe(kacheln()[0]);
    await vi.waitFor(() => expect(coverFeld().querySelector('img')?.getAttribute('src')).toBe(`${B}|${TB}`), W);
    await oeffneAusBlatt();
    await vi.waitFor(() => expect(kacheln()).toHaveLength(1), W);
    await tippe(kacheln()[0]);
    await vi.waitFor(() => expect(coverFeld().querySelector('img')?.getAttribute('src')).toBe(`${B2}|${TB}`), W);
  });
});

describe('REQ-118 Schließen ohne Auswahl', () => {
  const wege: [string, () => Promise<void>][] = [
    ['Zurück-Pfeil', async () => tippe(within(fenster()!).getByRole('button', { name: 'Zurück' }))],
    ['Android-Zurück-Taste', androidZurueck],
    ['Herunterziehen am Ziehgriff', zieheRunter],
  ];
  it.each(wege)('[REQ-118/AK-15] %s: Buchdetails wieder sichtbar, Frontcover unverändert', async (_n, schliessen) => {
    const buch = { ...HP, id: '11800000-0000-4000-8000-000000000015' };
    const s = speicherFake({ [`${buch.id}|cover`]: A });
    const repo = repoFake([buch]);
    await zeigeDetails(buch, { s, repo, suche: sucheMit(async () => [tr('dnb', 'B', B)]) });
    await oeffneCoverSuche();
    await vi.waitFor(() => expect(kacheln()).toHaveLength(1), W);
    await schliessen();
    await vi.waitFor(() => expect(fenster()).toBeNull(), W);
    expect(details()).not.toBeNull();
    expect(s.daten.get(`${buch.id}|cover`)).toBe(A);
    expect(s.put).not.toHaveBeenCalled();
    expect(repo.save).not.toHaveBeenCalled();
    expect(coverImDetail()).toBe(A);
  });

  it('[REQ-118/AK-15] Manueller Eintrag: Zurück-Pfeil schließt nur das Fenster, eingetragene Angaben bleiben', async () => {
    render(<BuecherAnsicht repository={repoFake([])} bildspeicher={speicherFake()} coverSuche={sucheMit(async () => [tr('dnb', 'B', B)])} einstellungRepository={new InMemoryEinstellungRepository()} />);
    await screen.findByRole('heading', { name: 'Deine Bücher' }, W);
    fireEvent.click(screen.getByRole('button', { name: 'Buch hinzufügen' }));
    fireEvent.click(within(await screen.findByRole('menu', { name: 'Buch hinzufügen' }, W)).getByRole('menuitem', { name: /Von Hand eintragen/ }));
    const blatt = await screen.findByRole('dialog', { name: 'Manueller Eintrag' }, W);
    fireEvent.change(within(blatt).getByLabelText(/^\s*Titel\s*$/i), { target: { value: 'Iron Flame' } });
    fireEvent.click(document.querySelector('[data-cover-hinzufuegen]')!);
    await tippe(within(await screen.findByRole('menu', { name: 'Bild hinzufügen' }, W)).getByRole('menuitem', { name: 'Cover online suchen' }));
    await vi.waitFor(() => expect(kacheln()).toHaveLength(1), W);
    await tippe(within(fenster()!).getByRole('button', { name: 'Zurück' }));
    await vi.waitFor(() => expect(fenster()).toBeNull(), W);
    const b = screen.getByRole('dialog', { name: 'Manueller Eintrag' });
    expect((within(b).getByLabelText(/^\s*Titel\s*$/i) as HTMLInputElement).value).toBe('Iron Flame');
    expect(document.querySelector('[data-cover-hinzufuegen] img')).toBeNull();
  });
});

describe('REQ-118 Datenschutz', () => {
  it('[REQ-118/AK-16] jede Anfrage (Text und Cover) enthält außer Suchtext und Sprache keine Angaben des Nutzers/seiner Bücher', async () => {
    const http = httpFake(dnbXml([dnbRecord('Treffer', ISBN)]), JSON.stringify({ docs: [{ title: 'Treffer', isbn: [ISBN], cover_i: 42, language: ['ger'] }] }));
    const s = sucheMit((t, spr) => coverSucheMit(http).suchen(t, spr));
    const geheim: Buch = { ...HP, id: '11800000-0000-4000-8000-000000000016', titel: 'Geheimes Tagebuch', autor: 'Privatperson Xaver', verlag: 'Hausverlag Zett' };
    await zeigeDetails(geheim, { suche: s });
    await oeffneCoverSuche();
    await vi.waitFor(() => expect(kacheln().length).toBeGreaterThan(0), W);
    const urls = [...http.text.mock.calls, ...http.bild.mock.calls].map((c) => decodeURIComponent(c[0] as string));
    expect(urls.length).toBeGreaterThanOrEqual(3);
    for (const u of urls) {
      for (const verboten of ['Geheimes', 'Tagebuch', 'Xaver', 'Privatperson', 'Hausverlag', 'Zett', geheim.id]) expect(u).not.toContain(verboten);
    }
    const textUrls = http.text.mock.calls.map((c) => decodeURIComponent(c[0] as string));
    textUrls.forEach((u) => expect(u).toContain(ISBN));
    textUrls.forEach((u) => expect(u).toMatch(/ger/));
  });
});

describe('REQ-118 Verweigerter Kamera-/Galeriezugriff', () => {
  it('[REQ-118/AK-17] Kamera und Galerie werfen (verweigert): „Cover online suchen“ übernimmt trotzdem das Cover', async () => {
    const q: Bildquelle = { scannen: vi.fn(() => Promise.reject(new Error('Permission denied'))), galerie: vi.fn(() => Promise.reject(new Error('Permission denied'))) };
    const s = speicherFake();
    await zeigeDetails(FW, { s, q, suche: sucheMit(async () => [tr('dnb', 'B', B)]) });
    await oeffneCoverSuche();
    await vi.waitFor(() => expect(kacheln()).toHaveLength(1), W);
    await tippe(kacheln()[0]);
    await vi.waitFor(() => expect(s.daten.get(`${FW.id}|cover`)).toMatch(new RegExp(`^${B}\\|`)), W);
    expect(q.scannen).not.toHaveBeenCalled();
    expect(q.galerie).not.toHaveBeenCalled();
  });
});
