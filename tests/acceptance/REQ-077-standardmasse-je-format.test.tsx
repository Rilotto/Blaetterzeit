/**
 * Akzeptanztests REQ-077 – Standardmaße je Format und geschätzte Dicke aus der Seitenzahl.
 * Abgeleitet aus dem REQ-Text. Schnittstellen laut Entwickler (Sprint 08):
 *  - wirksameMasse(buch) → { breiteMm, hoeheMm, dickeMm, geschaetzt, deckelUeberstandMm, buchblock } und
 *    STANDARD_MASSE_MM (src/buchdetails/masse.ts); Werte in ganzen mm (= cm mit einer Nachkommastelle)
 *  - Zeile „Maße“ [data-ausgabe-zeile="masse"] [data-zeile-wert], Vorschlag [data-zeile-vorschlag="true"]
 *  - Fenster „Format“ (REQ-058): [data-fenster-format], [data-unterformat=id], [data-format-sichern]
 * Konkrete Zahlen sind auf Zuruf änderbar; eingefroren ist die Zuordnung Format → Standardwert.
 */
import '@testing-library/jest-dom/vitest';
import { act, cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import BuchDetails from '@/views/BuchDetails';
import BuecherAnsicht from '@/views/BuecherAnsicht';
import { isbnSucheMit } from '@/barcode/suche';
import type { Treffer } from '@/barcode/treffer';
import { STANDARD_MASSE_MM, wirksameMasse } from '@/buchdetails/masse';
import type { Buch } from '@/domain/buch';
import type { ImageStore } from '@/storage/ImageStore';
import { InMemoryBookRepository } from '@/storage/InMemoryBookRepository';

vi.mock('@/buecher/demodaten', () => ({ demoBuecher: [] }));
afterEach(() => cleanup());

const W = { timeout: 3000 };
const leer = { get: async () => undefined, put: async () => {}, remove: async () => {} } as unknown as ImageStore;
const norm = (t: string | null | undefined) => (t ?? '').replace(/[\s  ]+/g, ' ').trim();
const TB = { format: 'print', unterformat: 'taschenbuch' } as const;
const HC = { format: 'print', unterformat: 'hardcover' } as const;
const bh = (m: Partial<Buch>) => {
  const w = wirksameMasse(m);
  return [w.breiteMm, w.hoeheMm];
};

async function tippe(el: Element) {
  await act(async () => {
    fireEvent.click(el);
    await new Promise((r) => setTimeout(r, 15));
  });
}
async function zeige(m: Partial<Buch>) {
  const repo = new InMemoryBookRepository();
  const id = crypto.randomUUID();
  await repo.save({ id, titel: 'Standardbuch', status: 'ungelesen', ...m } as Buch);
  render(<BuchDetails buchId={id} repository={repo} bildspeicher={leer} bildquelle={{ scannen: async () => null, galerie: async () => null }} onZurueck={() => {}} />);
  const d = await screen.findByRole('region', { name: 'Buchdetails' }, W);
  await vi.waitFor(() => expect(document.querySelectorAll('[data-bereich]')).toHaveLength(3), W);
  const tab = await vi.waitFor(() => d.querySelector<HTMLElement>('[data-reiter="details"]')!, W);
  await tippe(tab);
  await vi.waitFor(() => expect(d.querySelector('[data-ausgabe-zeile="masse"]')).not.toBeNull(), W);
  return { d, repo, id };
}
const masseWert = (d: HTMLElement) => norm(d.querySelector('[data-ausgabe-zeile="masse"] [data-zeile-wert]')?.textContent);
const el = (b: string) => document.querySelector<HTMLElement>(`[data-bereich="${b}"]`)!;
function darstellung() {
  const c = { w: parseFloat(el('cover').style.width), h: parseFloat(el('cover').style.height) };
  const r = parseFloat(el('ruecken').style.width);
  return { cover: c.w / c.h, ruecken: r / c.w };
}

describe('REQ-077 Standardmaße je Format', () => {
  describe('AK-1 Breite und Höhe je Format', () => {
    it.each([
      ['Print · Taschenbuch', TB, [120, 190]],
      ['E-Book', { format: 'ebook' }, [120, 190]],
      ['Print · Weiß ich nicht', { format: 'print', unterformat: 'weissNicht' }, [120, 190]],
      ['Print · Hardcover', HC, [148, 210]],
      ['Print · Kleinformat', { format: 'print', unterformat: 'kleinformat' }, [105, 148]],
    ] as [string, Partial<Buch>, number[]][])('[REQ-077/AK-1] %s ohne Maße → Breite × Höhe %j mm (aktuelle Standardwerte)', (_n, m, soll) => {
      expect(bh(m)).toEqual(soll);
    });

    it('[REQ-077/AK-1] Zuordnung über die zentrale Stelle: Werte folgen STANDARD_MASSE_MM', () => {
      expect(bh(TB)).toEqual([STANDARD_MASSE_MM.taschenbuch.breite, STANDARD_MASSE_MM.taschenbuch.hoehe]);
      expect(bh({ format: 'ebook' })).toEqual([STANDARD_MASSE_MM.taschenbuch.breite, STANDARD_MASSE_MM.taschenbuch.hoehe]);
      expect(bh(HC)).toEqual([STANDARD_MASSE_MM.hardcover.breite, STANDARD_MASSE_MM.hardcover.hoehe]);
      expect(bh({ format: 'print', unterformat: 'kleinformat' })).toEqual([STANDARD_MASSE_MM.kleinformat.breite, STANDARD_MASSE_MM.kleinformat.hoehe]);
    });

    it('[REQ-077/AK-1] Werte sind als geschätzt gekennzeichnet (nicht hinterlegt)', () => {
      const w = wirksameMasse({ ...HC, seitenanzahl: 100 });
      expect(w.geschaetzt).toEqual({ breite: true, hoehe: true, dicke: true });
    });
  });

  describe('AK-6 Ohne Format, Print ohne Unterformat, Hörbuch', () => {
    it.each([
      ['ohne Format', {}],
      ['Print ohne Unterformat', { format: 'print' }],
      ['Hörbuch', { format: 'hoerbuch' }],
    ] as [string, Partial<Buch>][])('[REQ-077/AK-6] %s, 400 Seiten → 12,0 × 19,0 × 2,4 cm', (_n, m) => {
      const w = wirksameMasse({ ...m, seitenanzahl: 400 });
      expect([w.breiteMm, w.hoeheMm, w.dickeMm]).toEqual([120, 190, 24]);
      expect(w.deckelUeberstandMm).toBe(0);
    });

    it('[REQ-077/AK-6] Hörbuch: Zeile „Maße“ zeigt den Taschenbuch-Vorschlag', async () => {
      const { d } = await zeige({ format: 'hoerbuch', seitenanzahl: 400 });
      expect(masseWert(d)).toBe('ca. 12,0 × 19,0 × 2,4 cm');
    });
  });

  describe('AK-7 Hardcover-Maße sind Außenmaße', () => {
    it('[REQ-077/AK-7] Hardcover ohne Maße: Deckel 14,8 × 21,0; Buchblock 6 mm niedriger, 3 mm schmaler', () => {
      const w = wirksameMasse({ ...HC, seitenanzahl: 400 });
      expect([w.breiteMm, w.hoeheMm]).toEqual([148, 210]);
      expect(w.deckelUeberstandMm).toBe(3);
      expect(w.buchblock).toEqual({ breiteMm: 145, hoeheMm: 204 });
    });

    it('[REQ-077/AK-7] auch mit hinterlegten Außenmaßen: Buchblock = Außenmaß − Überstand', () => {
      const w = wirksameMasse({ ...HC, breiteMm: 160, hoeheMm: 240 });
      expect(w.buchblock).toEqual({ breiteMm: 157, hoeheMm: 234 });
    });

    it('[REQ-077/AK-7] Taschenbuch: Buchblock = Außenmaße (kein Überstand)', () => {
      const w = wirksameMasse({ ...TB });
      expect(w.buchblock).toEqual({ breiteMm: 120, hoeheMm: 190 });
    });
  });

  describe('AK-2 Dicke aus der Seitenzahl', () => {
    it('[REQ-077/AK-2] Taschenbuch 400 Seiten → 2,4 cm (24,38 mm)', () => {
      expect(wirksameMasse({ ...TB, seitenanzahl: 400 }).dickeMm).toBe(24);
    });
    it('[REQ-077/AK-2] Hardcover 400 Seiten → 2,8 cm (27,71 mm)', () => {
      expect(wirksameMasse({ ...HC, seitenanzahl: 400 }).dickeMm).toBe(28);
    });
    it.each([
      ['E-Book', { format: 'ebook' }, 300, 19],
      ['Kleinformat', { format: 'print', unterformat: 'kleinformat' }, 300, 19],
      ['Taschenbuch', TB, 1, 2],
      ['Hardcover', HC, 1, 5],
    ] as [string, Partial<Buch>, number, number][])('[REQ-077/AK-2] %s %i Seiten → %i mm', (_n, m, s, mm) => {
      expect(wirksameMasse({ ...m, seitenanzahl: s }).dickeMm).toBe(mm);
    });
    it.each([
      ['Taschenbuch', TB, 2500, 145],
      ['Taschenbuch', TB, 2499, 144],
      ['Hardcover', HC, 1250, 77],
    ] as [string, Partial<Buch>, number, number][])('[REQ-077/AK-2] kaufmännisch runden: %s %i Seiten → %i mm (Grenze ,5)', (_n, m, s, mm) => {
      expect(wirksameMasse({ ...m, seitenanzahl: s }).dickeMm).toBe(mm);
    });
    it('[REQ-077/AK-2] Anzeige: Taschenbuch 400 Seiten → „ca. 12,0 × 19,0 × 2,4 cm“, Hardcover → „ca. 14,8 × 21,0 × 2,8 cm“', async () => {
      const { d } = await zeige({ ...TB, seitenanzahl: 400 });
      expect(masseWert(d)).toBe('ca. 12,0 × 19,0 × 2,4 cm');
      cleanup();
      const { d: d2 } = await zeige({ ...HC, seitenanzahl: 400 });
      expect(masseWert(d2)).toBe('ca. 14,8 × 21,0 × 2,8 cm');
    });
  });

  describe('AK-3 Ohne Seitenzahl', () => {
    it.each([
      ['Taschenbuch', TB],
      ['Hardcover', HC],
      ['ohne Format', {}],
    ] as [string, Partial<Buch>][])('[REQ-077/AK-3] %s ohne Seitenzahl und ohne Dicke → 2,5 cm', (_n, m) => {
      expect(wirksameMasse(m).dickeMm).toBe(25);
    });
  });

  describe('AK-4 Hinterlegte Werte haben Vorrang', () => {
    it('[REQ-077/AK-4] Hardcover mit Höhe 24,0, sonst ohne Maße → 14,8 / 24,0 / geschätzte Dicke', () => {
      const w = wirksameMasse({ ...HC, hoeheMm: 240, seitenanzahl: 400 });
      expect([w.breiteMm, w.hoeheMm, w.dickeMm]).toEqual([148, 240, 28]);
      expect(w.geschaetzt).toEqual({ breite: true, hoehe: false, dicke: true });
    });
    it('[REQ-077/AK-4] hinterlegte Dicke schlägt die Schätzung aus der Seitenzahl', () => {
      expect(wirksameMasse({ ...TB, dickeMm: 50, seitenanzahl: 400 }).dickeMm).toBe(50);
    });
    it('[REQ-077/AK-4] Buchdarstellung des Hardcovers mit Höhe 24,0 zeigt 14,8 : 24,0 : 2,8', async () => {
      const { d } = await zeige({ ...HC, hoeheMm: 240, seitenanzahl: 400 });
      const p = darstellung();
      expect(p.cover).toBeCloseTo(148 / 240, 2);
      expect(p.ruecken).toBeCloseTo(28 / 148, 2);
      // Fassung 2026-11-25 (REQ-072 AK-2 / REQ-077 AK-10): Zeile ergänzt die fehlenden Werte mit „ca.“
      expect(masseWert(d)).toBe('ca. 14,8 × 24,0 × 2,8 cm');
    });
  });

  describe('AK-5 Formatwechsel', () => {
    it('[REQ-077/AK-5] Taschenbuch ohne Maße → Format auf Hardcover ändern und sichern → ab sofort Hardcover-Standardmaße', async () => {
      const { d, repo, id } = await zeige({ ...TB, seitenanzahl: 400 });
      expect(masseWert(d)).toBe('ca. 12,0 × 19,0 × 2,4 cm');
      expect(darstellung().cover).toBeCloseTo(120 / 190, 2);
      await tippe(d.querySelector('[data-ausgabe-zeile="format"]')!);
      const f = await vi.waitFor(() => {
        const e = document.querySelector<HTMLElement>('[data-fenster-format]');
        expect(e).not.toBeNull();
        return e!;
      }, W);
      await tippe(f.querySelector('[data-unterformat="hardcover"]')!);
      await tippe(f.querySelector('[data-format-sichern]')!);
      await vi.waitFor(() => expect(document.querySelector('[data-fenster-format]')).toBeNull(), W);
      await vi.waitFor(() => expect(masseWert(d)).toBe('ca. 14,8 × 21,0 × 2,8 cm'), W);
      await vi.waitFor(() => expect(darstellung().cover).toBeCloseTo(148 / 210, 2), W);
      expect(darstellung().ruecken).toBeCloseTo(28 / 148, 2);
      const g = (await repo.get(id))!;
      expect(g.unterformat).toBe('hardcover');
      expect([g.breiteMm, g.hoeheMm, g.dickeMm]).toEqual([undefined, undefined, undefined]);
    });
  });
});

// ============================================================================= Sprint 11: nach dem Barcode-Scan (AK-8 bis AK-10)
describe('REQ-077 Standardmaße nach dem Barcode-Scan', () => {
  const ISBN = '9783551551672';
  function olAntwort(f: Record<string, unknown>) {
    const satz = { title: 'Scanbuch', number_of_pages: 400, isbn_13: [ISBN], ...f };
    return JSON.stringify({ [`ISBN:${ISBN}`]: { ...satz, details: satz } });
  }
  /** Suche über die echte Auswertung; Open Library liefert die Angaben `f`, die DNB nichts. */
  const olSuche = (f: Record<string, unknown>) =>
    isbnSucheMit({
      text: async (url: string) => (/openlibrary\.org/.test(url) ? { status: 200, text: olAntwort(f) } : { status: 404, text: '' }),
      bild: async () => null,
    });
  const trefferSuche = (angaben: Treffer['angaben']) => ({ suchen: async () => [{ quelle: 'dnb', angaben } as Treffer] });
  /** Barcode scannen, einzigen Treffer antippen; Manueller Eintrag ist offen. */
  async function scanne(suche: { suchen: (isbn: string) => Promise<Treffer[]> }) {
    const repo = new InMemoryBookRepository();
    const scanner = {
      optionen: null as { beiIsbn: (isbn: string) => void } | null,
      starten: vi.fn(async (o: { beiIsbn: (isbn: string) => void }) => void (scanner.optionen = o)),
      lichtSetzen: vi.fn(async () => {}),
      beenden: vi.fn(async () => {}),
    };
    render(<BuecherAnsicht repository={repo} bildspeicher={leer} bildquelle={{ scannen: async () => null, galerie: async () => null }} barcodeScanner={scanner} isbnSuche={suche} />);
    await screen.findByRole('heading', { name: 'Deine Bücher' }, W);
    await tippe(screen.getByRole('button', { name: 'Buch hinzufügen' }));
    const m = await screen.findByRole('menu', { name: 'Buch hinzufügen' }, W);
    await tippe(m.querySelector('[data-option="barcode"]')!);
    await vi.waitFor(() => expect(scanner.optionen).not.toBeNull(), W);
    await act(async () => {
      scanner.optionen!.beiIsbn(ISBN);
      await new Promise((r) => setTimeout(r, 30));
    });
    const a = await screen.findByRole('dialog', { name: 'Gefundene Bücher' }, W);
    await tippe(a.querySelector('[data-treffer]')!);
    const blatt = await screen.findByRole('dialog', { name: 'Manueller Eintrag' }, W);
    return { repo, blatt };
  }
  const wertIm = (root: HTMLElement, id: string) => norm(root.querySelector(`[data-ausgabe-zeile="${id}"] [data-zeile-wert]`)?.textContent);
  async function anlegen(blatt: HTMLElement, repo: InMemoryBookRepository) {
    await tippe(within(blatt).getByRole('button', { name: 'Hinzufügen' }));
    const d = await screen.findByRole('region', { name: 'Buchdetails' }, W);
    const [b] = await repo.list();
    expect(b, 'angelegtes Buch').toBeDefined();
    await vi.waitFor(() => expect(document.querySelectorAll('[data-bereich]')).toHaveLength(3), W);
    await tippe(await vi.waitFor(() => d.querySelector<HTMLElement>('[data-reiter="details"]')!, W));
    await vi.waitFor(() => expect(d.querySelector('[data-ausgabe-zeile="masse"]')).not.toBeNull(), W);
    return { d, b };
  }
  const HC_TEXT = 'ca. 14,8 × 21,0 × 2,8 cm';
  const TB_TEXT = 'ca. 12,0 × 19,0 × 2,4 cm';

  describe('AK-8 Scan ohne Maße, mit Format Hardcover', () => {
    it('[REQ-077/AK-8] Open Library „Hardcover“, 400 Seiten, ohne Maße: Manueller Eintrag zeigt „Print · Hardcover“ und den Vorschlag „ca. 14,8 × 21,0 × 2,8 cm“', async () => {
      const { blatt } = await scanne(olSuche({ physical_format: 'Hardcover' }));
      await vi.waitFor(() => expect(wertIm(blatt, 'format')).toBe('Print · Hardcover'), W);
      expect(wertIm(blatt, 'masse')).toBe(HC_TEXT);
    });

    it('[REQ-077/AK-8] nach „Hinzufügen“: Zeile „Maße“ der Buchdetails zeigt denselben Vorschlag, Buchdarstellung nutzt ihn, keine Maße gespeichert', async () => {
      const { blatt, repo } = await scanne(olSuche({ physical_format: 'Hardcover' }));
      const { d, b } = await anlegen(blatt, repo);
      expect(masseWert(d)).toBe(HC_TEXT);
      expect(d.querySelector('[data-ausgabe-zeile="masse"] [data-zeile-wert]')).toHaveAttribute('data-zeile-vorschlag', 'true');
      const x = darstellung();
      expect(x.cover).toBeCloseTo(148 / 210, 2);
      expect(x.ruecken).toBeCloseTo(28 / 148, 2);
      const gespeichert = (await repo.get(b.id))!;
      expect(gespeichert).toMatchObject({ format: 'print', unterformat: 'hardcover' });
      expect(gespeichert.breiteMm).toBeUndefined();
      expect(gespeichert.hoeheMm).toBeUndefined();
      expect(gespeichert.dickeMm).toBeUndefined();
    });

    it('[REQ-077/AK-8] Variante: Treffer mit Format Hardcover (fertig zugeordnet), ohne Maße → Vorschlag „ca. 14,8 × 21,0 × 2,8 cm“', async () => {
      const { blatt } = await scanne(trefferSuche({ titel: 'Scanbuch', seitenanzahl: 400, isbn: ISBN, format: 'print', unterformat: 'hardcover' }));
      await vi.waitFor(() => expect(wertIm(blatt, 'masse')).toBe(HC_TEXT), W);
    });
  });

  describe('AK-9 Scan ohne Maße, mit Format Taschenbuch bzw. ohne Format', () => {
    it.each([
      ['„Paperback“', { physical_format: 'Paperback' }],
      ['ohne Formatangabe', {}],
    ])('[REQ-077/AK-9] Open Library %s, 400 Seiten, ohne Maße: Vorschlag „ca. 12,0 × 19,0 × 2,4 cm“', async (_n, f) => {
      const { blatt } = await scanne(olSuche(f));
      await vi.waitFor(() => expect(wertIm(blatt, 'masse')).toBe(TB_TEXT), W);
    });

    it('[REQ-077/AK-9] ohne Formatangabe angelegt: Buchdetails zeigen den Taschenbuch-Vorschlag, keine Maße gespeichert', async () => {
      const { blatt, repo } = await scanne(olSuche({}));
      const { d, b } = await anlegen(blatt, repo);
      expect(masseWert(d)).toBe(TB_TEXT);
      const g = (await repo.get(b.id))!;
      expect([g.breiteMm, g.hoeheMm, g.dickeMm]).toEqual([undefined, undefined, undefined]);
    });

    it('[REQ-077/AK-9] Grenzfall: nicht zuordenbare Formatangabe („Audio CD“) → Taschenbuch-Standardmaße', async () => {
      const { blatt } = await scanne(olSuche({ physical_format: 'Audio CD' }));
      await vi.waitFor(() => expect(wertIm(blatt, 'masse')).toBe(TB_TEXT), W);
    });
  });

  describe('AK-10 Online gefundene Maße haben Vorrang', () => {
    it('[REQ-077/AK-10] Hardcover, 400 Seiten, gelieferte Höhe 24,0 cm: Höhe 24,0 gespeichert, Breite 14,8 und Dicke 2,8 als Standard', async () => {
      const { blatt, repo } = await scanne(trefferSuche({ titel: 'Scanbuch', seitenanzahl: 400, isbn: ISBN, format: 'print', unterformat: 'hardcover', hoeheMm: 240 }));
      await vi.waitFor(() => expect(wertIm(blatt, 'masse')).toMatch(/14,8 × 24,0 × 2,8 cm/), W);
      const { d, b } = await anlegen(blatt, repo);
      const g = (await repo.get(b.id))!;
      expect(g.hoeheMm).toBe(240);
      expect(g.breiteMm).toBeUndefined();
      expect(g.dickeMm).toBeUndefined();
      const w = wirksameMasse(g);
      expect([w.breiteMm, w.hoeheMm, w.dickeMm]).toEqual([148, 240, 28]);
      expect(masseWert(d)).toBe('ca. 14,8 × 24,0 × 2,8 cm');
      expect(getComputedStyle(d.querySelector<HTMLElement>('[data-ausgabe-zeile="masse"] [data-zeile-wert]')!).fontStyle).toBe('italic');
    });

    it('[REQ-077/AK-10] alle drei Maße online (Open Library 20 x 13 x 2 cm) haben Vorrang vor dem Hardcover-Standard', async () => {
      const { blatt, repo } = await scanne(olSuche({ physical_format: 'Hardcover', physical_dimensions: '20 x 13 x 2 centimeters' }));
      await vi.waitFor(() => expect(wertIm(blatt, 'format')).toBe('Print · Hardcover'), W);
      const { b } = await anlegen(blatt, repo);
      const g = (await repo.get(b.id))!;
      expect([g.breiteMm, g.hoeheMm, g.dickeMm]).toEqual([130, 200, 20]);
    });
  });
});
