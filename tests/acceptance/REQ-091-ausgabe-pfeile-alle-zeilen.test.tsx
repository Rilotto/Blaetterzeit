/**
 * Akzeptanztests REQ-091 – Karte „Ausgabe“: Pfeil „›“ an allen Zeilen, auch im Blatt „Manueller Eintrag“.
 * Abgeleitet aus dem REQ-Text. Bekannte Schnittstellen (REQ-056/REQ-060): [data-ausgabe-karte], [data-ausgabe-zeile=id],
 * [data-zeile-bezeichnung], [data-zeile-wert], [data-zeile-pfeil]. Im Manuellen Eintrag wird der Pfeil über den Text „›“
 * ermittelt (Attribut dort nicht festgelegt).
 */
import '@testing-library/jest-dom/vitest';
import { act, cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { IDBFactory, IDBKeyRange } from 'fake-indexeddb';
import type { ComponentType } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { Buch } from '@/domain/buch';
import type { BookRepository, ImageStore } from '@/storage';

vi.mock('@/buecher/demodaten', () => ({ demoBuecher: [] }));
beforeEach(() => {
  vi.stubGlobal('indexedDB', new IDBFactory());
  vi.stubGlobal('IDBKeyRange', IDBKeyRange);
});
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

type Welt = { repo: BookRepository; BD: ComponentType<Record<string, unknown>>; BA: ComponentType<Record<string, unknown>> };
const W = { timeout: 4000 };
const buch = (f: Partial<Buch> = {}): Buch => ({ id: crypto.randomUUID(), titel: 'Der Testroman', status: 'ungelesen', ...f });
const bilder = { get: async () => undefined, put: async () => {}, remove: async () => {} } as unknown as ImageStore;
const quelle = { scannen: async () => null, galerie: async () => null };
async function starte(): Promise<Welt> {
  vi.resetModules();
  const st = (await import('@/storage')) as typeof import('@/storage');
  const BD = (await import('@/views/BuchDetails')).default as unknown as ComponentType<Record<string, unknown>>;
  const BA = (await import('@/views/BuecherAnsicht')).default as unknown as ComponentType<Record<string, unknown>>;
  return { repo: st.createBookRepository(), BD, BA };
}
async function tippe(el: Element) {
  await act(async () => {
    fireEvent.click(el);
    await new Promise((r) => setTimeout(r, 15));
  });
}
async function details(b: Buch) {
  const w = await starte();
  await w.repo.save(b);
  const BD = w.BD;
  render(<BD buchId={b.id} bildspeicher={bilder} bildquelle={quelle} onZurueck={() => {}} />);
  const d = await screen.findByRole('region', { name: 'Buchdetails' }, W);
  const tab = await vi.waitFor(() => {
    const t = d.querySelector<HTMLElement>('[data-reiter="details"]');
    expect(t).not.toBeNull();
    return t!;
  }, W);
  await tippe(tab);
  await vi.waitFor(() => expect(d.querySelector('[data-reiter-bereich="details"] [data-ausgabe-karte]')).not.toBeNull(), W);
  return d;
}
const norm = (t: string | null | undefined) => (t ?? '').replace(/[\s  ]+/g, ' ').trim();
/** Kennung einer Zeile; die Zeile „Band“ (REQ-112) wird an ihrer Bezeichnung erkannt (Kennung legt der Entwickler fest). */
const zid = (z: Element) => (/^Band\b/.test(norm(z.querySelector('[data-zeile-bezeichnung]')?.textContent ?? z.textContent)) ? 'band' : z.getAttribute('data-ausgabe-zeile'));
// REQ-112: Zeile „Band“ unter „Exemplar“ (Sprint 11)
const ALLE = ['seiten', 'format', 'masse', 'exemplar', 'band', 'sonderausgabe', 'fotos', 'preis', 'verlag', 'erschienen', 'isbn', 'hinzugefuegt', 'beendet'];
const NEU = ['verlag', 'erschienen', 'isbn', 'hinzugefuegt', 'beendet'];
const zeilen = (d: HTMLElement) => Array.from(d.querySelectorAll<HTMLElement>('[data-reiter-bereich="details"] [data-ausgabe-karte] [data-ausgabe-zeile]'));
const zeile = (d: HTMLElement, id: string) => d.querySelector<HTMLElement>(`[data-reiter-bereich="details"] [data-ausgabe-zeile="${id}"]`)!;
/** Blatt-Elemente mit genau dem Text „›“. */
const pfeile = (z: HTMLElement) => [z, ...Array.from(z.querySelectorAll<HTMLElement>('*'))].filter((e) => e.children.length === 0 && norm(e.textContent) === '›');
const amEnde = (z: HTMLElement, p: HTMLElement) =>
  Array.from(z.querySelectorAll<HTMLElement>('*')).every((e) => e === p || e.contains(p) || p.contains(e) || !norm(e.textContent) || Boolean(e.compareDocumentPosition(p) & Node.DOCUMENT_POSITION_FOLLOWING));

describe('REQ-091 Pfeil „›“ an allen Zeilen der Karte „Ausgabe“', () => {
  it('[REQ-091/AK-1] mit Werten: alle dreizehn Zeilen haben genau einen Pfeil „›“, rechts nach dem Wert', async () => {
    const d = await details(
      buch({ seitenanzahl: 608, erscheinungsdatum: '01.02.2025', verlag: 'Carlsen', isbn: '9783551551672', eingetragenAm: '2026-10-14T12:00:00', status: 'gelesen', beendetAm: '2026-11-03', preisCent: 1299 }),
    );
    expect(zeilen(d).map(zid)).toEqual(ALLE);
    for (const z of zeilen(d)) {
      const id = zid(z)!;
      const p = z.querySelectorAll<HTMLElement>('[data-zeile-pfeil]');
      expect(p, `${id}: genau ein Pfeil`).toHaveLength(1);
      expect(norm(p[0].textContent), id).toBe('›');
      expect(pfeile(z), `${id}: kein zweites „›“`).toHaveLength(1);
      const wert = z.querySelector('[data-zeile-wert]');
      if (wert) expect(wert.compareDocumentPosition(p[0]) & Node.DOCUMENT_POSITION_FOLLOWING, `${id}: Pfeil nach dem Wert`).toBeTruthy();
    }
  });

  it('[REQ-091/AK-1] die neuen Pfeile sind gleich gestaltet wie die bisherigen (Vergleich mit „Preis“)', async () => {
    const d = await details(buch({ verlag: 'Carlsen' }));
    const ref = zeile(d, 'preis').querySelector<HTMLElement>('[data-zeile-pfeil]')!;
    for (const id of NEU) {
      const p = zeile(d, id).querySelector<HTMLElement>('[data-zeile-pfeil]');
      expect(p, id).not.toBeNull();
      expect(p!.style.cssText, id).toBe(ref.style.cssText);
      expect(p!.className, id).toBe(ref.className);
    }
  });

  it('[REQ-091/AK-1] die Pfeile der bisherigen Zeilen bleiben (je genau einer)', async () => {
    const d = await details(buch());
    for (const id of ['seiten', 'format', 'masse', 'exemplar', 'sonderausgabe', 'fotos', 'preis']) {
      expect(zeile(d, id).querySelectorAll('[data-zeile-pfeil]'), id).toHaveLength(1);
    }
  });

  it('[REQ-091/AK-2] ohne Verlag, ISBN, Erscheinungsangabe und „Beendet am“: Verlag, Erschienen, ISBN und Beendet am haben trotzdem den Pfeil', async () => {
    const d = await details(buch());
    for (const id of ['verlag', 'erschienen', 'isbn', 'beendet']) {
      expect(norm(zeile(d, id).querySelector('[data-zeile-wert]')?.textContent), `${id}: ohne Wert`).toBe('');
      expect(norm(zeile(d, id).querySelector('[data-zeile-pfeil]')?.textContent), id).toBe('›');
    }
  });

  it('[REQ-091/AK-2] Grenzfall: Buch ohne Eintragungsdatum – auch „Hinzugefügt“ ohne Wert hat den Pfeil', async () => {
    const d = await details(buch({ eingetragenAm: undefined }));
    expect(norm(zeile(d, 'hinzugefuegt').querySelector('[data-zeile-pfeil]')?.textContent)).toBe('›');
  });

  describe('AK-3 Blatt „Manueller Eintrag“', () => {
    async function blatt() {
      const w = await starte();
      const BA = w.BA;
      render(<BA repository={w.repo} bildspeicher={bilder} bildquelle={quelle} />);
      await screen.findByRole('heading', { name: 'Deine Bücher' }, W);
      await tippe(screen.getByRole('button', { name: 'Buch hinzufügen' }));
      await tippe(within(await screen.findByRole('menu', { name: 'Buch hinzufügen' }, W)).getByRole('menuitem', { name: /Von Hand eintragen/ }));
      return screen.findByRole('dialog', { name: 'Manueller Eintrag' }, W);
    }

    it('[REQ-091/AK-3] jede Zeile der Karte „Ausgabe“ hat genau einen Pfeil „›“, auch Verlag, Erschienen, ISBN und Hinzugefügt', async () => {
      const d = await blatt();
      const z = Array.from(d.querySelectorAll<HTMLElement>('[data-ausgabe-zeile]'));
      expect(z.length).toBeGreaterThanOrEqual(10);
      for (const id of ['verlag', 'erschienen', 'isbn', 'hinzugefuegt']) expect(z.map((e) => e.getAttribute('data-ausgabe-zeile'))).toContain(id);
      for (const e of z) {
        const id = e.getAttribute('data-ausgabe-zeile');
        const p = pfeile(e);
        expect(p, `${id}: genau ein „›“`).toHaveLength(1);
        expect(amEnde(e, p[0]), `${id}: Pfeil rechts am Ende`).toBe(true);
      }
    });

    it('[REQ-091/AK-3] Pfeile bleiben, wenn Werte eingetragen sind (Verlag über das Blatt gesichert)', async () => {
      const d = await blatt();
      await tippe(d.querySelector('[data-ausgabe-zeile="verlag"]')!);
      const f = await vi.waitFor(() => {
        const e = document.querySelector<HTMLInputElement>('[data-blatt-feld="verlag"]');
        expect(e).not.toBeNull();
        return e!;
      }, W);
      fireEvent.change(f, { target: { value: 'Carlsen' } });
      await tippe(document.querySelector('[data-blatt-sichern="verlag"]')!);
      await vi.waitFor(() => expect(document.querySelector('[data-blatt-feld="verlag"]')).toBeNull(), W);
      const z = d.querySelector<HTMLElement>('[data-ausgabe-zeile="verlag"]')!;
      expect(norm(z.textContent)).toContain('Carlsen');
      expect(pfeile(z)).toHaveLength(1);
    });
  });
});
