/**
 * Akzeptanztests REQ-119 – Sprachfilter „Sprache“ (Deutsch/Englisch, Mehrfachauswahl) bei „Online suchen“ und
 * „Cover online suchen“. Abgeleitet aus dem REQ-Text. Schnittstellen laut Entwickler (Sprint 13):
 *  - onlineSucheMit(http)/coverSucheMit(http).suchen(text, sprachen?) aus @/barcode/suche; nachSpracheFiltern aus @/barcode/treffer.
 *  - DNB-Sprache aus MARC 041 $a, sonst 008 Pos. 35–37; Open Library Feld `language`.
 *  - Filter: group „Sprache“ [data-sprachfilter], Knöpfe [data-sprache="ger"|"eng"] mit aria-pressed; Hinweis
 *    [data-sprachfilter-hinweis]; Speicher EinstellungRepository Schlüssel „onlineSucheSprachen“ (JSON-Liste).
 *  - „Neustart“: neue Darstellung mit derselben InMemoryEinstellungRepository.
 */
import '@testing-library/jest-dom/vitest';
import { act, cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { coverSucheMit, onlineSucheMit, type CoverSuche, type OnlineSuche } from '@/barcode/suche';
import { nachSpracheFiltern, type Treffer } from '@/barcode/treffer';
import type { Buch } from '@/domain/buch';
import { DesignAnbieter } from '@/design/designwahl';
import { InMemoryEinstellungRepository, type BookRepository, type ImageStore } from '@/storage';
import BuchDetails from '@/views/BuchDetails';
import BuecherAnsicht from '@/views/BuecherAnsicht';

vi.mock('@/buecher/demodaten', () => ({ demoBuecher: [] }));

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  delete document.documentElement.dataset.stil;
});

const W = { timeout: 4000 };
const FW: Buch = { id: '11900000-0000-4000-8000-000000000001', titel: 'Fourth Wing', autor: 'Rebecca Yarros', status: 'ungelesen' };
const bildUrl = (n: string) => `data:image/png;base64,${n}`;

// --------------------------------------------------------------------------- Test-Doubles
function repoFake(start: Buch[] = [FW]) {
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
  return {
    get: vi.fn(async (id: string, b: string) => daten.get(`${id}|${b}`)),
    put: vi.fn(async (id: string, b: string, d: string) => void daten.set(`${id}|${b}`, d)),
    remove: vi.fn(async (id: string, b: string) => void daten.delete(`${id}|${b}`)),
  } as ImageStore;
}
function isbn13(n: number) {
  const k = `978300${String(n).padStart(6, '0')}`;
  const s = [...k].reduce((a, c, i) => a + Number(c) * (i % 2 ? 3 : 1), 0);
  return k + ((10 - (s % 10)) % 10);
}
/** DNB-Datensatz; `sprache` über 041 $a, `f008` als Kontrollfeld 008 (Sprache an Pos. 35–37). */
const dnbRecord = (titel: string, opt: { sprache?: string; f008?: string; isbn?: string } = {}) => `
      <record xmlns="http://www.loc.gov/MARC21/slim" type="Bibliographic">
        <leader>00000nam a2200000 c 4500</leader>
        ${opt.f008 ? `<controlfield tag="008">${opt.f008}</controlfield>` : ''}
        ${opt.isbn ? `<datafield tag="020" ind1=" " ind2=" "><subfield code="a">${opt.isbn}</subfield></datafield>` : ''}
        ${opt.sprache ? `<datafield tag="041" ind1=" " ind2=" "><subfield code="a">${opt.sprache}</subfield></datafield>` : ''}
        <datafield tag="245" ind1="1" ind2="0"><subfield code="a">${titel}</subfield></datafield>
      </record>`;
const dnbXml = (records: string[]) => `<?xml version="1.0" encoding="UTF-8"?>
<searchRetrieveResponse xmlns="http://www.loc.gov/zing/srw/">
  <version>1.1</version><numberOfRecords>${records.length}</numberOfRecords>
  <records>${records.map((r, i) => `<record><recordSchema>MARC21-xml</recordSchema><recordPacking>xml</recordPacking><recordData>${r}</recordData><recordPosition>${i + 1}</recordPosition></record>`).join('')}</records>
</searchRetrieveResponse>`;
/** 008 mit Sprachcode an Position 35–37 (40 Zeichen). */
const f008 = (code: string) => `${'2401011999    gw            000 0 '.padEnd(35, ' ')}${code} d`;
/** Gemischte Quellen: DNB D-ger, D-eng (041), D-ger008 (nur 008), D-ohne; OL O-ger, O-eng, O-ohne. */
const DNB_MIX = dnbXml([
  dnbRecord('D-ger', { sprache: 'ger', isbn: isbn13(1) }),
  dnbRecord('D-eng', { sprache: 'eng', isbn: isbn13(2) }),
  dnbRecord('D-ger008', { f008: f008('ger'), isbn: isbn13(3) }),
  dnbRecord('D-ohne', { isbn: isbn13(4) }),
]);
const OL_MIX = JSON.stringify({
  docs: [
    { title: 'O-ger', language: ['ger'], cover_i: 1 },
    { title: 'O-eng', language: ['eng'], cover_i: 2 },
    { title: 'O-ohne', cover_i: 3 },
    { title: 'O-leer', language: [], cover_i: 4 },
  ],
});
function httpFake(dnb = DNB_MIX, ol = OL_MIX) {
  return {
    text: vi.fn(async (url: string) => {
      if (url.includes('dnb.de')) return { status: 200, text: dnb };
      if (url.includes('openlibrary')) return { status: 200, text: ol };
      return { status: 404, text: '' };
    }),
    bild: vi.fn(async (url: string) => bildUrl(encodeURIComponent(url))),
  };
}
const titel = (t: Treffer[]) => t.map((x) => x.angaben.titel).sort();
const dnbUrl = (h: ReturnType<typeof httpFake>) => decodeURIComponent(h.text.mock.calls.map((c) => c[0] as string).filter((u) => u.includes('dnb.de')).at(-1)!);
const olUrl = (h: ReturnType<typeof httpFake>) =>
  decodeURIComponent(h.text.mock.calls.map((c) => c[0] as string).filter((u) => u.includes('openlibrary')).at(-1)!).replace(/\+/g, ' ');

// --------------------------------------------------------------------------- UI-Hilfen
async function warte(ms = 30) {
  await act(async () => {
    await new Promise((r) => setTimeout(r, ms));
  });
}
async function tippe(el: Element) {
  await act(async () => {
    fireEvent.click(el);
    await new Promise((r) => setTimeout(r, 25));
  });
}
type Art = 'online' | 'cover';
const NAME: Record<Art, string> = { online: 'Online suchen', cover: 'Cover online suchen' };
const fenster = (a: Art) => screen.queryByRole('dialog', { name: NAME[a] });
const filter = (a: Art) => within(fenster(a)!).getByRole('group', { name: 'Sprache' });
const knopf = (a: Art, s: 'ger' | 'eng') => filter(a).querySelector<HTMLElement>(`[data-sprache="${s}"]`)!;
const gewaehlt = (a: Art) => (['ger', 'eng'] as const).filter((s) => knopf(a, s).getAttribute('aria-pressed') === 'true');
const suchzeile = (a: Art) => within(fenster(a)!).getByRole('searchbox', { name: 'Titel, Autor oder ISBN' }) as HTMLInputElement;
const kacheln = (a: Art) => Array.from(document.querySelectorAll<HTMLElement>(`[data-${a}-treffer]`));
async function suchTaste(a: Art) {
  await act(async () => {
    fireEvent.keyDown(suchzeile(a), { key: 'Enter', code: 'Enter', keyCode: 13 });
    await new Promise((r) => setTimeout(r, 40));
  });
}

async function oeffneOnline(suche: OnlineSuche, einst = new InMemoryEinstellungRepository()) {
  render(<BuecherAnsicht repository={repoFake([])} bildspeicher={speicherFake()} onlineSuche={suche} einstellungRepository={einst} />);
  await screen.findByRole('heading', { name: 'Deine Bücher' }, W);
  await tippe(screen.getByRole('button', { name: 'Buch hinzufügen' }));
  const m = await screen.findByRole('menu', { name: 'Buch hinzufügen' }, W);
  await tippe(m.querySelector('[data-option="online"]')!);
  await vi.waitFor(() => expect(fenster('online')).not.toBeNull(), W);
  await vi.waitFor(() => expect(gewaehlt('online').length).toBeGreaterThan(0), W);
}
async function oeffneCover(suche: CoverSuche, einst = new InMemoryEinstellungRepository(), buch = FW) {
  render(
    <BuchDetails buchId={buch.id} repository={repoFake([buch])} bildspeicher={speicherFake()} coverSuche={suche} einstellungRepository={einst} onZurueck={() => {}} />,
  );
  await screen.findByRole('region', { name: 'Buchdetails' }, W);
  await vi.waitFor(() => expect(document.querySelectorAll('[data-bereich]')).toHaveLength(3), W);
  await warte(20);
  fireEvent.click(document.querySelector('[data-bereich="cover"]')!);
  const m = await screen.findByRole('menu', { name: 'Bild hinzufügen' }, W);
  await tippe(within(m).getByRole('menuitem', { name: 'Cover online suchen' }));
  await vi.waitFor(() => expect(fenster('cover')).not.toBeNull(), W);
  await vi.waitFor(() => expect(gewaehlt('cover').length).toBeGreaterThan(0), W);
}
const mock = (f: (t: string, s?: readonly string[]) => Promise<Treffer[]> = async () => []) => ({ suchen: vi.fn(f) });

// ===========================================================================
describe('REQ-119 Ort, Aufbau, Standard', () => {
  it.each(['online', 'cover'] as Art[])('[REQ-119/AK-1] Fenster „%s“: über der Suchzeile Filter „Sprache“ mit „Deutsch“, „Englisch“; Standard nur Deutsch', async (a) => {
    if (a === 'online') await oeffneOnline(mock());
    else await oeffneCover(mock());
    const f = filter(a);
    expect(f).toHaveAttribute('data-sprachfilter');
    expect(f.textContent).toContain('Sprache');
    const knoepfe = Array.from(f.querySelectorAll<HTMLElement>('[data-sprache]'));
    expect(knoepfe.map((k) => k.textContent?.trim())).toEqual(['Deutsch', 'Englisch']);
    expect(knoepfe.map((k) => k.getAttribute('data-sprache'))).toEqual(['ger', 'eng']);
    expect(f.compareDocumentPosition(suchzeile(a)) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(knopf(a, 'ger')).toHaveAttribute('aria-pressed', 'true');
    expect(knopf(a, 'eng')).toHaveAttribute('aria-pressed', 'false');
  });

  it('[REQ-119/AK-1] beschädigter gespeicherter Wert: Standard nur Deutsch', async () => {
    const einst = new InMemoryEinstellungRepository();
    await einst.speichern('onlineSucheSprachen', '{kaputt');
    await oeffneOnline(mock(), einst);
    expect(gewaehlt('online')).toEqual(['ger']);
  });
});

describe('REQ-119 Wirkung auf die Suche (Datenebene)', () => {
  it.each([
    ['onlineSucheMit', onlineSucheMit],
    ['coverSucheMit', coverSucheMit],
  ] as const)('[REQ-119/AK-2] %s nur Deutsch: Anfragen mit Sprachfilter, Ergebnis nur deutsche Ausgaben (041 und 008)', async (_n, mit) => {
    const h = httpFake();
    const t = await mit(h).suchen('Fourth Wing', ['ger']);
    expect(titel(t)).toEqual(['D-ger', 'D-ger008', 'O-ger']);
    expect(dnbUrl(h)).toMatch(/spr=ger/);
    expect(dnbUrl(h)).not.toMatch(/eng/);
    expect(olUrl(h)).toMatch(/language:ger/);
    expect(olUrl(h)).not.toMatch(/eng/);
  });

  it.each([
    ['onlineSucheMit', onlineSucheMit],
    ['coverSucheMit', coverSucheMit],
  ] as const)('[REQ-119/AK-3] %s beide Sprachen: deutsche und englische Ausgaben, Anfragen mit beiden', async (_n, mit) => {
    const h = httpFake();
    const t = await mit(h).suchen('Fourth Wing', ['ger', 'eng']);
    expect(titel(t)).toEqual(['D-eng', 'D-ger', 'D-ger008', 'O-eng', 'O-ger']);
    expect(dnbUrl(h)).toMatch(/spr=ger or spr=eng/);
    expect(olUrl(h)).toMatch(/language:\(ger OR eng\)/);
  });

  it.each([
    ['onlineSucheMit', onlineSucheMit],
    ['coverSucheMit', coverSucheMit],
  ] as const)('[REQ-119/AK-4] %s nur Englisch: nur englische Ausgaben', async (_n, mit) => {
    const h = httpFake();
    const t = await mit(h).suchen('Fourth Wing', ['eng']);
    expect(titel(t)).toEqual(['D-eng', 'O-eng']);
    expect(dnbUrl(h)).toMatch(/spr=eng/);
    expect(dnbUrl(h)).not.toMatch(/ger/);
    expect(olUrl(h)).toMatch(/language:eng/);
  });

  it('[REQ-119/AK-8] Treffer ohne Sprachangabe (DNB ohne 041/008, OL ohne bzw. leere language) entfallen – auch bei beiden Sprachen', async () => {
    for (const mit of [onlineSucheMit, coverSucheMit]) {
      const t = await mit(httpFake()).suchen('Fourth Wing', ['ger', 'eng']);
      expect(titel(t)).not.toContain('D-ohne');
      expect(titel(t)).not.toContain('O-ohne');
      expect(titel(t)).not.toContain('O-leer');
    }
  });

  it('[REQ-119/AK-8] nachSpracheFiltern: ohne Sprachangabe oder mit nicht gewählter Sprache entfällt, Mehrsprachiges mit gewählter bleibt', () => {
    const t = (titel: string, sprachen?: string[]): Treffer => ({ quelle: 'dnb', angaben: { titel }, ...(sprachen ? { sprachen } : {}) });
    const liste = [t('a', ['ger']), t('b'), t('c', []), t('d', ['fre']), t('e', ['eng', 'ger'])];
    expect(nachSpracheFiltern(liste, ['ger']).map((x) => x.angaben.titel)).toEqual(['a', 'e']);
    expect(nachSpracheFiltern(liste, ['eng']).map((x) => x.angaben.titel)).toEqual(['e']);
  });

  it('[REQ-119/AK-8] Open Library liefert ausschließlich Treffer ohne Sprache: leeres Ergebnis', async () => {
    const ol = JSON.stringify({ docs: [{ title: 'X', cover_i: 9 }] });
    const t = await onlineSucheMit(httpFake(dnbXml([]), ol)).suchen('X', ['ger']);
    expect(t).toEqual([]);
  });
});

describe('REQ-119 Auswahl in der Oberfläche', () => {
  it('[REQ-119/AK-2] UI „Online suchen“ mit nur Deutsch zeigt nur deutsche Ausgaben', async () => {
    await oeffneOnline(onlineSucheMit(httpFake()));
    fireEvent.change(suchzeile('online'), { target: { value: 'Fourth Wing' } });
    await suchTaste('online');
    await vi.waitFor(() => expect(kacheln('online').length).toBe(3), W);
    const namen = kacheln('online').map((k) => k.querySelector('[data-treffer-titel]')!.textContent).sort();
    expect(namen).toEqual(['D-ger', 'D-ger008', 'O-ger']);
  });

  it('[REQ-119/AK-3] nur Deutsch → „Englisch“ antippen: beide gewählt, Ergebnis enthält deutsche und englische Ausgaben', async () => {
    const h = httpFake();
    await oeffneOnline(onlineSucheMit(h));
    await tippe(knopf('online', 'eng'));
    expect(gewaehlt('online')).toEqual(['ger', 'eng']);
    fireEvent.change(suchzeile('online'), { target: { value: 'Fourth Wing' } });
    await suchTaste('online');
    await vi.waitFor(() => expect(kacheln('online').length).toBe(5), W);
    const namen = kacheln('online').map((k) => k.querySelector('[data-treffer-titel]')!.textContent).sort();
    expect(namen).toEqual(['D-eng', 'D-ger', 'D-ger008', 'O-eng', 'O-ger']);
  });

  it('[REQ-119/AK-4] beide gewählt → „Deutsch“ antippen: nur Englisch, Suche nur englisch (Cover-Fenster)', async () => {
    const einst = new InMemoryEinstellungRepository();
    await einst.speichern('onlineSucheSprachen', JSON.stringify(['ger', 'eng']));
    const suche = mock(async (_t, s) => (s?.includes('ger') ? [] : [{ quelle: 'dnb', angaben: { titel: 'E', cover: bildUrl('E') }, sprachen: ['eng'] } as Treffer]));
    await oeffneCover(suche, einst);
    expect(gewaehlt('cover')).toEqual(['ger', 'eng']);
    await tippe(knopf('cover', 'ger'));
    expect(gewaehlt('cover')).toEqual(['eng']);
    await vi.waitFor(() => expect(suche.suchen).toHaveBeenLastCalledWith('Fourth Wing Rebecca Yarros', ['eng']), W);
    await vi.waitFor(() => expect(kacheln('cover')).toHaveLength(1), W);
  });

  it('[REQ-119/AK-5] nur Deutsch → „Deutsch“ antippen: bleibt gewählt, kurzer Hinweis, keine neue Suche, nichts gespeichert', async () => {
    const einst = new InMemoryEinstellungRepository();
    const speichern = vi.spyOn(einst, 'speichern');
    const suche = mock();
    await oeffneCover(suche, einst);
    await vi.waitFor(() => expect(suche.suchen).toHaveBeenCalledTimes(1), W);
    await tippe(knopf('cover', 'ger'));
    expect(gewaehlt('cover')).toEqual(['ger']);
    const h = document.querySelector<HTMLElement>('[data-sprachfilter-hinweis]');
    expect(h?.textContent).toBe('Mindestens eine Sprache muss ausgewählt sein');
    expect(suche.suchen).toHaveBeenCalledTimes(1);
    expect(speichern).not.toHaveBeenCalled();
    // „kurz“: verschwindet wieder von selbst.
    await warte(2800);
    expect(document.querySelector('[data-sprachfilter-hinweis]')).toBeNull();
  });

  it('[REQ-119/AK-5] nur Englisch → „Englisch“ antippen: bleibt gewählt, Hinweis', async () => {
    const einst = new InMemoryEinstellungRepository();
    await einst.speichern('onlineSucheSprachen', JSON.stringify(['eng']));
    await oeffneOnline(mock(), einst);
    await tippe(knopf('online', 'eng'));
    expect(gewaehlt('online')).toEqual(['eng']);
    expect(document.querySelector('[data-sprachfilter-hinweis]')?.textContent).toBe('Mindestens eine Sprache muss ausgewählt sein');
  });

  it('[REQ-119/AK-6] nach Suche „Fourth Wing“ (Deutsch) „Englisch“ antippen: neue Anfragen mit beiden Sprachen an beide Quellen, Ergebnisse ersetzt', async () => {
    const h = httpFake();
    await oeffneOnline(onlineSucheMit(h));
    fireEvent.change(suchzeile('online'), { target: { value: 'Fourth Wing' } });
    await suchTaste('online');
    await vi.waitFor(() => expect(kacheln('online')).toHaveLength(3), W);
    const vorher = h.text.mock.calls.length;
    await tippe(knopf('online', 'eng'));
    await vi.waitFor(() => expect(kacheln('online')).toHaveLength(5), W);
    const neu = h.text.mock.calls.slice(vorher).map((c) => decodeURIComponent(c[0] as string).replace(/\+/g, ' '));
    expect(neu).toHaveLength(2);
    const dnb = neu.find((u) => u.includes('dnb.de'))!;
    const ol = neu.find((u) => u.includes('openlibrary'))!;
    expect(dnb).toMatch(/Fourth/);
    expect(dnb).toMatch(/spr=ger or spr=eng/);
    expect(ol).toMatch(/Fourth Wing/);
    expect(ol).toMatch(/language:\(ger OR eng\)/);
  });

  it('[REQ-119/AK-6] Cover-Fenster: Änderung nach Autostart sucht mit aktuellem Text neu', async () => {
    const suche = mock(async (_t, s) => (s?.includes('eng') ? [{ quelle: 'openlibrary', angaben: { titel: 'N', cover: bildUrl('NEU') }, sprachen: ['eng'] } as Treffer] : [{ quelle: 'dnb', angaben: { titel: 'A', cover: bildUrl('ALT') }, sprachen: ['ger'] } as Treffer]));
    await oeffneCover(suche);
    await vi.waitFor(() => expect(kacheln('cover')).toHaveLength(1), W);
    fireEvent.change(suchzeile('cover'), { target: { value: 'Onyx Storm' } });
    await tippe(knopf('cover', 'eng'));
    await vi.waitFor(() => expect(suche.suchen).toHaveBeenLastCalledWith('Onyx Storm', ['ger', 'eng']), W);
    await vi.waitFor(() => expect(kacheln('cover')[0]?.querySelector('img')?.getAttribute('src')).toBe(bildUrl('NEU')), W);
    expect(kacheln('cover')).toHaveLength(1);
  });

  it('[REQ-119/AK-6] Negativfall: noch nicht gesucht → Änderung startet keine Suche, wirkt erst bei der nächsten', async () => {
    const suche = mock();
    await oeffneOnline(suche);
    await tippe(knopf('online', 'eng'));
    await warte(60);
    expect(suche.suchen).not.toHaveBeenCalled();
    fireEvent.change(suchzeile('online'), { target: { value: 'Fourth Wing' } });
    await suchTaste('online');
    expect(suche.suchen).toHaveBeenCalledWith('Fourth Wing', ['ger', 'eng']);
  });
});

describe('REQ-119 Merken', () => {
  it('[REQ-119/AK-7] in „Online suchen“ nur Englisch, Neustart, „Cover online suchen“: nur Englisch, Autostart fordert nur englische Ausgaben an', async () => {
    const einst = new InMemoryEinstellungRepository();
    await oeffneOnline(mock(), einst);
    await tippe(knopf('online', 'eng'));
    await tippe(knopf('online', 'ger'));
    expect(gewaehlt('online')).toEqual(['eng']);
    await vi.waitFor(async () => expect(JSON.parse((await einst.lesen('onlineSucheSprachen')) ?? 'null')).toEqual(['eng']), W);
    cleanup();
    // Neustart: neue Darstellung, gleicher Speicher; echte Cover-Suche, um die Anfragen zu prüfen.
    const h = httpFake();
    await oeffneCover(coverSucheMit(h), einst);
    expect(gewaehlt('cover')).toEqual(['eng']);
    await vi.waitFor(() => expect(h.text).toHaveBeenCalledTimes(2), W);
    expect(dnbUrl(h)).toMatch(/spr=eng/);
    expect(dnbUrl(h)).not.toMatch(/spr=ger/);
    expect(olUrl(h)).toMatch(/language:eng/);
    expect(olUrl(h)).not.toMatch(/ger/);
  });

  it('[REQ-119/AK-7] umgekehrt: Auswahl im Cover-Fenster gilt danach in „Online suchen“', async () => {
    const einst = new InMemoryEinstellungRepository();
    await oeffneCover(mock(), einst);
    await tippe(knopf('cover', 'eng'));
    await vi.waitFor(async () => expect(JSON.parse((await einst.lesen('onlineSucheSprachen')) ?? 'null')).toEqual(['ger', 'eng']), W);
    cleanup();
    await oeffneOnline(mock(), einst);
    expect(gewaehlt('online')).toEqual(['ger', 'eng']);
  });
});

describe('REQ-119 Darstellung', () => {
  async function imStil(stil: 'feuilleton' | 'klassisch') {
    const einst = new InMemoryEinstellungRepository();
    await einst.speichern('stil', stil);
    render(
      <DesignAnbieter repository={einst}>
        <BuecherAnsicht repository={repoFake([])} bildspeicher={speicherFake()} onlineSuche={mock()} einstellungRepository={einst} />
      </DesignAnbieter>,
    );
    await waitFor(() => expect(document.documentElement).toHaveAttribute('data-stil', stil), W);
    await screen.findByRole('heading', { name: 'Deine Bücher' }, W);
    await tippe(screen.getByRole('button', { name: 'Buch hinzufügen' }));
    await tippe((await screen.findByRole('menu', { name: 'Buch hinzufügen' }, W)).querySelector('[data-option="online"]')!);
    await vi.waitFor(() => expect(gewaehlt('online')).toEqual(['ger']), W);
  }
  const keineFlaeche = (e: Element) => ['transparent', 'rgba(0, 0, 0, 0)'].includes(getComputedStyle(e).backgroundColor);
  const unterstrich = (e: Element) => {
    const c = getComputedStyle(e);
    // Rahmen zählt nur, wenn er sichtbar ist (Feuilleton lässt Klassisch-Rahmen in transparent stehen, F8).
    const sichtbarerRahmen = c.borderBottomStyle === 'solid' && !['transparent', 'rgba(0, 0, 0, 0)'].includes(c.borderBottomColor);
    return /inset/.test(c.boxShadow) || sichtbarerRahmen || /underline/.test(c.textDecorationLine);
  };

  it('[REQ-119/AK-9] Feuilleton, nur Deutsch: beide als Text ohne Pillenfläche, „Deutsch“ unterstrichen, „Englisch“ nicht', async () => {
    await imStil('feuilleton');
    const de = knopf('online', 'ger');
    const en = knopf('online', 'eng');
    expect(keineFlaeche(de)).toBe(true);
    expect(keineFlaeche(en)).toBe(true);
    expect(unterstrich(de)).toBe(true);
    expect(unterstrich(en)).toBe(false);
    expect(de).toHaveAttribute('aria-pressed', 'true');
    expect(en).toHaveAttribute('aria-pressed', 'false');
    // Unterstrich folgt der Auswahl.
    await tippe(en);
    expect(unterstrich(en)).toBe(true);
  });

  it('[REQ-119/AK-9] Gegenstück Klassisch: Pillen, gewählte anders dargestellt als nicht gewählte', async () => {
    await imStil('klassisch');
    const de = knopf('online', 'ger');
    const en = knopf('online', 'eng');
    expect(de.style.background + de.style.backgroundColor).not.toBe(en.style.background + en.style.backgroundColor);
  });
});
