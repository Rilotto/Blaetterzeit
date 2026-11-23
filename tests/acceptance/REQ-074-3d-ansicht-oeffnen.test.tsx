/**
 * Akzeptanztests REQ-074 – 3D-Ansicht: Öffnen per Doppeltipp aufs Cover, Aufbau und Schließen.
 * Abgeleitet aus dem REQ-Text. Schnittstellen laut Entwickler (Sprint 08):
 *  - Cover [data-bereich="cover"] in <BuchDetails>; Wartezeit DOPPELTIPP_MS (src/buchdetails/doppeltipp.ts)
 *  - Ansicht role=dialog „3D-Ansicht“ [data-ansicht3d], data-verschwommen=backdrop|filter,
 *    [data-ansicht3d-schliessen|titel|autor|bearbeiten], Modell [data-modell3d]; Zurück-Taste im Web = popstate
 *  - Auswahlmenü role=menu „Bild hinzufügen“ (REQ-015); Reiter [data-reiter=id][data-aktiv] (REQ-043)
 * Der konkrete Wert der Wartezeit ist kein AK; Tests nutzen die zentrale Konstante.
 */
import '@testing-library/jest-dom/vitest';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import BuchDetails from '@/views/BuchDetails';
import { DOPPELTIPP_MS } from '@/buchdetails/doppeltipp';
import type { Buch } from '@/domain/buch';
import type { ImageStore } from '@/storage/ImageStore';
import { InMemoryBookRepository } from '@/storage/InMemoryBookRepository';

vi.mock('@/buecher/demodaten', () => ({ demoBuecher: [] }));
afterEach(() => {
  vi.useRealTimers();
  cleanup();
});

const W = { timeout: 3000 };
const PNG = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAIAAACQd1PeAAAADElEQVR4nGP4z8AAAAMBAQDJ/pLvAAAAAElFTkSuQmCC';
const leer = { get: async () => undefined, put: async () => {}, remove: async () => {} } as unknown as ImageStore;
const norm = (t: string | null | undefined) => (t ?? '').replace(/[\s  ]+/g, ' ').trim();

async function zeige(m: Partial<Buch> = {}) {
  const repo = new InMemoryBookRepository();
  const id = crypto.randomUUID();
  await repo.save({ id, titel: 'Der Hobbit', autor: 'J. R. R. Tolkien', status: 'ungelesen', format: 'print', unterformat: 'taschenbuch', ...m } as Buch);
  const onZurueck = vi.fn();
  render(<BuchDetails buchId={id} repository={repo} bildspeicher={leer} bildquelle={{ scannen: async () => PNG, galerie: async () => PNG }} onZurueck={onZurueck} />);
  const d = await screen.findByRole('region', { name: 'Buchdetails' }, W);
  await vi.waitFor(() => expect(document.querySelectorAll('[data-bereich]')).toHaveLength(3), W);
  await vi.waitFor(() => expect(d.querySelector('[data-reiterleiste]')).not.toBeNull(), W);
  return { d, onZurueck, repo, id };
}
const bereich = (b: string) => document.querySelector<HTMLElement>(`[data-bereich="${b}"]`)!;
const ansicht = () => screen.queryByRole('dialog', { name: '3D-Ansicht' });
const menue = () => screen.queryByRole('menu', { name: 'Bild hinzufügen' });
const aktiverReiter = (d: HTMLElement) =>
  Array.from(d.querySelectorAll<HTMLElement>('[data-reiter]'))
    .filter((r) => r.getAttribute('data-aktiv') === 'true')
    .map((r) => r.getAttribute('data-reiter'));

/** Doppeltipp mit echter Zeit (zwei Klicks unmittelbar nacheinander). */
async function doppeltipp(el: HTMLElement) {
  await act(async () => {
    fireEvent.click(el);
    fireEvent.click(el);
  });
}
async function warte(ms: number) {
  await act(async () => {
    await new Promise((r) => setTimeout(r, ms));
  });
}
async function oeffne3d(m: Partial<Buch> = {}) {
  const z = await zeige(m);
  await doppeltipp(bereich('cover'));
  const a = await screen.findByRole('dialog', { name: '3D-Ansicht' }, W);
  return { ...z, a };
}
const fake = () => vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout', 'setInterval', 'clearInterval', 'Date'] });
const vor = (ms: number) =>
  act(() => {
    vi.advanceTimersByTime(ms);
  });

describe('REQ-074 3D-Ansicht öffnen', () => {
  describe('AK-1 Öffnen per Doppeltipp', () => {
    it('[REQ-074/AK-1] Taschenbuch: Doppeltipp aufs Cover öffnet die 3D-Ansicht, kein Auswahlmenü (auch nach Ablauf der Wartezeit)', async () => {
      await zeige();
      await doppeltipp(bereich('cover'));
      await screen.findByRole('dialog', { name: '3D-Ansicht' }, W);
      await warte(DOPPELTIPP_MS + 150);
      expect(menue()).toBeNull();
      expect(ansicht()).not.toBeNull();
      expect(ansicht()!.querySelector('[data-modell3d]')).not.toBeNull();
    });

    it('[REQ-074/AK-1] Fake-Timer: zweiter Tipp kurz vor Ende der Wartezeit zählt noch als Doppeltipp', async () => {
      await zeige();
      fake();
      fireEvent.click(bereich('cover'));
      await vor(DOPPELTIPP_MS - 50);
      expect(menue()).toBeNull();
      await act(async () => void fireEvent.click(bereich('cover')));
      await vor(DOPPELTIPP_MS * 3);
      expect(ansicht()).not.toBeNull();
      expect(menue()).toBeNull();
    });

    it('[REQ-074/AK-1] zeigt das Modell dieses Buches (Titel in der Ansicht = Titel des Buches)', async () => {
      const { a } = await oeffne3d({ titel: 'Momo', autor: 'Michael Ende' });
      expect(norm(a.querySelector('[data-ansicht3d-titel]')?.textContent)).toBe('Momo');
    });
  });

  describe('AK-2 Einfacher Tipp', () => {
    it.each([
      ['Taschenbuch', { format: 'print', unterformat: 'taschenbuch' }],
      ['Hörbuch', { format: 'hoerbuch', unterformat: undefined }],
    ] as [string, Partial<Buch>][])('[REQ-074/AK-2] %s: einfacher Tipp öffnet nach der Wartezeit das Auswahlmenü, keine 3D-Ansicht', async (_n, m) => {
      await zeige(m);
      fake();
      await act(async () => void fireEvent.click(bereich('cover')));
      await vor(DOPPELTIPP_MS + 20);
      expect(menue()).not.toBeNull();
      expect(ansicht()).toBeNull();
      expect(document.querySelector('[data-hinweis-3d]')).toBeNull();
    });

    it('[REQ-074/AK-2] zwei Tipps mit Abstand größer als die Wartezeit sind zwei Einfachtipps → Menü, keine 3D-Ansicht', async () => {
      await zeige();
      fake();
      await act(async () => void fireEvent.click(bereich('cover')));
      await vor(DOPPELTIPP_MS + 50);
      expect(menue()).not.toBeNull();
      expect(ansicht()).toBeNull();
    });

    it('[REQ-074/AK-2] echte Zeit: einfacher Tipp → Menü erscheint (findBy), 3D-Ansicht nicht', async () => {
      await zeige();
      fireEvent.click(bereich('cover'));
      await screen.findByRole('menu', { name: 'Bild hinzufügen' }, W);
      expect(ansicht()).toBeNull();
    });
  });

  describe('AK-3 Nur das Cover', () => {
    it.each(['ruecken', 'schnitt'])('[REQ-074/AK-3] Doppeltipp auf „%s“ öffnet keine 3D-Ansicht', async (b) => {
      await zeige();
      await doppeltipp(bereich(b));
      await warte(DOPPELTIPP_MS + 150);
      expect(ansicht()).toBeNull();
      expect(document.querySelector('[data-ansicht3d]')).toBeNull();
    });
  });

  describe('AK-4 Aufbau', () => {
    it('[REQ-074/AK-4] Modell, darunter „Der Hobbit“, darunter „J. R. R. Tolkien“, darunter „Bearbeiten“ mit Icon; X vorhanden', async () => {
      const { a } = await oeffne3d();
      const modell = a.querySelector('[data-modell3d]')!;
      const titel = a.querySelector('[data-ansicht3d-titel]')!;
      const autor = a.querySelector('[data-ansicht3d-autor]')!;
      const pille = a.querySelector<HTMLElement>('[data-ansicht3d-bearbeiten]')!;
      expect(modell).not.toBeNull();
      expect(norm(titel.textContent)).toBe('Der Hobbit');
      expect(norm(autor.textContent)).toBe('J. R. R. Tolkien');
      expect(norm(pille.textContent)).toBe('Bearbeiten');
      expect(pille.tagName).toBe('BUTTON');
      expect(pille.querySelector('svg, img, [data-symbol], [data-icon]')).not.toBeNull();
      const folgt = (x: Node, y: Node) => (x.compareDocumentPosition(y) & Node.DOCUMENT_POSITION_FOLLOWING) !== 0;
      expect(folgt(modell, titel)).toBe(true);
      expect(folgt(titel, autor)).toBe(true);
      expect(folgt(autor, pille)).toBe(true);
      const x = a.querySelector<HTMLElement>('[data-ansicht3d-schliessen]')!;
      expect(x.tagName).toBe('BUTTON');
      expect(x.getAttribute('aria-label')).toBe('Schließen');
    });

    it('[REQ-074/AK-4] die Seitenzahl wird nicht angezeigt', async () => {
      const { a } = await oeffne3d({ seitenanzahl: 317 });
      expect(a.textContent).not.toMatch(/317/);
      expect(a.textContent).not.toMatch(/Seiten/);
    });

    it('[REQ-074/AK-4] Hintergrund: Buchdetails bleiben darunter sichtbar und sind verschwommen', async () => {
      const { a, d } = await oeffne3d();
      expect(d).toBeInTheDocument();
      expect(screen.getByRole('region', { name: 'Buchdetails' })).toBe(d);
      const art = a.getAttribute('data-verschwommen');
      expect(['backdrop', 'filter']).toContain(art);
      if (art === 'backdrop') {
        expect(`${a.style.backdropFilter} ${a.style.getPropertyValue('-webkit-backdrop-filter')}`).toMatch(/blur\(\s*[1-9]/);
      } else {
        expect(d.style.filter).toMatch(/blur\(\s*[1-9]/);
      }
      // Die Ansicht deckt den Hintergrund nicht vollständig ab (kein deckendes Weiß).
      expect(a.style.backgroundColor).not.toMatch(/^(#fff|white|rgb\(255, 255, 255\))$/i);
    });

    it('[REQ-074/AK-4] nach dem Schließen ist der Hintergrund nicht mehr verschwommen', async () => {
      const { a, d } = await oeffne3d();
      await act(async () => void fireEvent.click(a.querySelector('[data-ansicht3d-schliessen]')!));
      await vi.waitFor(() => expect(ansicht()).toBeNull(), W);
      expect(d.style.filter ?? '').not.toMatch(/blur/);
    });
  });

  describe('AK-5 Ohne Autor', () => {
    it.each([
      ['ohne Feld', { autor: undefined }],
      ['leerer Text', { autor: '' }],
    ] as [string, Partial<Buch>][])('[REQ-074/AK-5] %s: unter dem Titel direkt „Bearbeiten“, keine leere Autorzeile', async (_n, m) => {
      const { a } = await oeffne3d(m);
      expect(a.querySelector('[data-ansicht3d-autor]')).toBeNull();
      const titel = a.querySelector('[data-ansicht3d-titel]')!;
      expect(titel.nextElementSibling?.hasAttribute('data-ansicht3d-bearbeiten')).toBe(true);
    });
  });

  describe('AK-6 „Bearbeiten“', () => {
    it('[REQ-074/AK-6] zuvor Reiter „Rezension“ aktiv → „Bearbeiten“ schließt die Ansicht, Buchdetails dieses Buches mit Reiter „Details“', async () => {
      const { a, d, onZurueck } = await oeffne3d();
      expect(aktiverReiter(d)).toEqual(['rezension']);
      await act(async () => void fireEvent.click(a.querySelector('[data-ansicht3d-bearbeiten]')!));
      await vi.waitFor(() => expect(ansicht()).toBeNull(), W);
      await vi.waitFor(() => expect(aktiverReiter(d)).toEqual(['details']), W);
      expect(d.querySelector('[data-reiter-bereich="details"]')).not.toBeNull();
      expect(norm(d.querySelector('[data-buchdetails-titel]')?.textContent)).toBe('Der Hobbit');
      expect(onZurueck).not.toHaveBeenCalled();
    });
  });

  describe('AK-7 Schließen', () => {
    it('[REQ-074/AK-7] X schließt; Buchdetails desselben Buches im vorherigen Zustand (Reiter „Rezension“)', async () => {
      const { a, d, onZurueck } = await oeffne3d();
      await act(async () => void fireEvent.click(a.querySelector('[data-ansicht3d-schliessen]')!));
      await vi.waitFor(() => expect(ansicht()).toBeNull(), W);
      expect(screen.getByRole('region', { name: 'Buchdetails' })).toBe(d);
      expect(norm(d.querySelector('[data-buchdetails-titel]')?.textContent)).toBe('Der Hobbit');
      expect(aktiverReiter(d)).toEqual(['rezension']);
      expect(onZurueck).not.toHaveBeenCalled();
    });

    it('[REQ-074/AK-7] Zurück-Taste schließt nur die 3D-Ansicht, nicht die Buchdetails', async () => {
      const { d, onZurueck } = await oeffne3d();
      await warte(30);
      await act(async () => {
        window.dispatchEvent(new PopStateEvent('popstate', { state: null }));
        await new Promise((r) => setTimeout(r, 30));
      });
      await vi.waitFor(() => expect(ansicht()).toBeNull(), W);
      expect(screen.getByRole('region', { name: 'Buchdetails' })).toBe(d);
      expect(aktiverReiter(d)).toEqual(['rezension']);
      expect(onZurueck).not.toHaveBeenCalled();
    });

    it('[REQ-074/AK-7] nach dem Schließen lässt sich die Ansicht erneut öffnen, und ein Einfachtipp öffnet weiter das Menü', async () => {
      const { a } = await oeffne3d();
      await act(async () => void fireEvent.click(a.querySelector('[data-ansicht3d-schliessen]')!));
      await vi.waitFor(() => expect(ansicht()).toBeNull(), W);
      await doppeltipp(bereich('cover'));
      await screen.findByRole('dialog', { name: '3D-Ansicht' }, W);
      await act(async () => void fireEvent.click(ansicht()!.querySelector('[data-ansicht3d-schliessen]')!));
      await vi.waitFor(() => expect(ansicht()).toBeNull(), W);
      fireEvent.click(bereich('cover'));
      await screen.findByRole('menu', { name: 'Bild hinzufügen' }, W);
    });
  });
});
