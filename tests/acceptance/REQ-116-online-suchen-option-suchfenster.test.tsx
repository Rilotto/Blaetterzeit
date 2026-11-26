/**
 * Akzeptanztests REQ-116 – Menü „Buch hinzufügen“: Option „Online suchen“ und Suchfenster.
 * Abgeleitet aus dem REQ-Text. Schnittstellen laut Entwickler (Sprint 12):
 *  - BuecherAnsicht { onlineSuche: { suchen(text): Promise<Treffer[]> } }; [] = keine Treffer, reject = kein Internet.
 *  - onlineSucheMit(http) aus @/barcode/suche mit Fake-HttpClient (text/bild) zum Prüfen der Anfragen.
 *  - Selektoren: [data-option="online"], dialog „Online suchen“ [data-online-suche], [data-ziehgriff],
 *    searchbox „Titel, Autor oder ISBN“ in form[role=search], [data-online-suche-zurueck], [data-online-suche-laeuft],
 *    [data-online-suche-hinweis] (role status), [data-online-treffer-raster], [data-online-treffer].
 * Anpassung 2026-11-26 (Entwickler, REQ-116 AK-4/REQ-119): Suche erhält zusätzlich die Sprachauswahl (Standard ["ger"]);
 * Open-Library-Fakes mit Sprachangabe, da Treffer ohne Sprachangabe entfallen.
 */
import '@testing-library/jest-dom/vitest';
import { act, cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { onlineSucheMit, type OnlineSuche } from '@/barcode/suche';
import type { Treffer } from '@/barcode/treffer';
import type { Buch } from '@/domain/buch';
import { ONLINE_SUCHE_HINWEIS_MS } from '@/onlinesuche/Suchfenster';
import type { BookRepository, ImageStore } from '@/storage';
import BuecherAnsicht from '@/views/BuecherAnsicht';

vi.mock('@/buecher/demodaten', () => ({ demoBuecher: [] }));

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

const W = { timeout: 4000 };
const ISBN = '9783551551672';
const GEHEIM: Buch = { id: '11000000-0000-4000-8000-000000000110', titel: 'Geheimes Tagebuch', autor: 'Privatperson Xaver', verlag: 'Hausverlag Zett', status: 'gelesen' };
const T1: Treffer = { quelle: 'dnb', angaben: { titel: 'Harry Potter und der Stein der Weisen', autor: 'Rowling, J. K.' } };
const T2: Treffer = { quelle: 'openlibrary', angaben: { titel: 'Der Herr der Ringe', autor: 'J. R. R. Tolkien' } };

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
function httpFake(antwort: (url: string) => { status: number; text: string } | Promise<never> = () => ({ status: 404, text: '' })) {
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

async function tippe(el: Element) {
  await act(async () => {
    fireEvent.click(el);
    await new Promise((r) => setTimeout(r, 15));
  });
}
async function warte(ms = 40) {
  await act(async () => {
    await new Promise((r) => setTimeout(r, ms));
  });
}
async function zeige(suche: OnlineSuche, repo = repoFake()) {
  render(<BuecherAnsicht repository={repo} bildspeicher={speicherFake()} onlineSuche={suche} />);
  await screen.findByRole('heading', { name: 'Deine Bücher' }, W);
  return { repo };
}
const menue = () => screen.queryByRole('menu', { name: 'Buch hinzufügen' });
const fenster = () => screen.queryByRole('dialog', { name: 'Online suchen' });
const suchfeld = () => within(fenster()!).getByRole('searchbox', { name: 'Titel, Autor oder ISBN' }) as HTMLInputElement;
const hinweis = () => document.querySelector<HTMLElement>('[data-online-suche-hinweis]');
const neue = (repo: ReturnType<typeof repoFake>) => [...repo.daten.values()].filter((b) => b.id !== GEHEIM.id);

async function oeffneMenue() {
  await tippe(screen.getByRole('button', { name: 'Buch hinzufügen' }));
  return screen.findByRole('menu', { name: 'Buch hinzufügen' }, W);
}
async function oeffneSuche() {
  const m = await oeffneMenue();
  await tippe(m.querySelector('[data-option="online"]')!);
  return vi.waitFor(() => {
    expect(fenster()).not.toBeNull();
    return fenster()!;
  }, W);
}
function eintippen(text: string) {
  fireEvent.change(suchfeld(), { target: { value: text } });
}
async function suchTaste() {
  await act(async () => {
    fireEvent.keyDown(suchfeld(), { key: 'Enter', code: 'Enter', keyCode: 13 });
    await new Promise((r) => setTimeout(r, 30));
  });
}
/** Menü wieder offen, Plus zeigt „ד, Suchfenster zu. */
async function menueWiederOffen() {
  await vi.waitFor(() => expect(fenster()).toBeNull(), W);
  expect(menue()).not.toBeNull();
  expect(screen.getByRole('button', { name: 'Menü schließen' })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Menü schließen' }).querySelector('[data-icon="icon-x.png"]')).not.toBeNull();
}

describe('REQ-116 Online suchen', () => {
  describe('AK-1 Option im Menü', () => {
    it('[REQ-116/AK-1] Menü enthält „Online suchen“ (an erster Stelle, Untertitel, Lupen-Icon), „Barcode scannen“, „Von Hand eintragen“; kein „Deine Bücher importieren“', async () => {
      await zeige({ suchen: vi.fn(async () => []) });
      const m = await oeffneMenue();
      const items = within(m).getAllByRole('menuitem');
      expect(items).toHaveLength(3);
      expect(items[0]).toHaveAttribute('data-option', 'online');
      expect(items[0].textContent).toContain('Online suchen');
      expect(items[0].textContent).toContain('Finde fast jedes Buch');
      expect(items[0].querySelector('[data-icon="icon-lupe.png"]')).not.toBeNull();
      const texte = items.map((i) => i.textContent ?? '');
      expect(texte.some((t) => t.includes('Barcode scannen'))).toBe(true);
      expect(texte.some((t) => t.includes('Von Hand eintragen'))).toBe(true);
      expect(screen.queryByText(/Deine Bücher importieren/)).toBeNull();
    });

    it('[REQ-116/AK-1] Untertitel steht unter dem Titel', async () => {
      await zeige({ suchen: vi.fn(async () => []) });
      const m = await oeffneMenue();
      const opt = m.querySelector('[data-option="online"]')!;
      const t = within(opt as HTMLElement).getByText('Online suchen');
      const u = within(opt as HTMLElement).getByText('Finde fast jedes Buch');
      expect(t.compareDocumentPosition(u) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    });
  });

  describe('AK-2 Option öffnet das Suchfenster', () => {
    it('[REQ-116/AK-2] Antippen: Menü zu, Suchfenster mit Zurück-Pfeil und Suchfeld offen, Suchfeld hat den Fokus', async () => {
      const suche = { suchen: vi.fn(async () => []) };
      await zeige(suche);
      const f = await oeffneSuche();
      expect(menue()).toBeNull();
      expect(f).toHaveAttribute('data-online-suche');
      expect(within(f).getByRole('button', { name: 'Zurück' })).toBeInTheDocument();
      await vi.waitFor(() => expect(document.activeElement).toBe(suchfeld()), W);
      expect(suchfeld().value).toBe('');
      expect(suche.suchen).not.toHaveBeenCalled();
    });

    it('[REQ-116/AK-2] auch über den Leere-Liste-Platzhalter (REQ-011) geöffnetes Menü öffnet das Suchfenster', async () => {
      render(<BuecherAnsicht repository={repoFake([])} bildspeicher={speicherFake()} onlineSuche={{ suchen: vi.fn(async () => []) }} />);
      const leer = await vi.waitFor(() => {
        const e = document.querySelector('[data-leere-liste]');
        expect(e).not.toBeNull();
        return e!;
      }, W);
      await tippe(leer);
      const m = await screen.findByRole('menu', { name: 'Buch hinzufügen' }, W);
      await tippe(m.querySelector('[data-option="online"]')!);
      await vi.waitFor(() => expect(fenster()).not.toBeNull(), W);
      expect(menue()).toBeNull();
      await vi.waitFor(() => expect(document.activeElement).toBe(suchfeld()), W);
    });
  });

  describe('AK-3 Suche erst mit der Such-Taste', () => {
    it('[REQ-116/AK-3] Eintippen sendet keine Anfrage; Such-Taste fragt DNB und Open Library ab', async () => {
      const http = httpFake();
      await zeige(onlineSucheMit(http));
      await oeffneSuche();
      for (const t of ['H', 'Harry', 'Harry Potter', 'Harry Potter Rowling']) eintippen(t);
      await warte(80);
      expect(http.text).not.toHaveBeenCalled();
      expect(http.bild).not.toHaveBeenCalled();
      await suchTaste();
      await vi.waitFor(() => expect(http.text).toHaveBeenCalledTimes(2), W);
      const hosts = http.text.mock.calls.map((c) => new URL(c[0]).hostname);
      expect(hosts.some((h) => /dnb\.de$/.test(h))).toBe(true);
      expect(hosts.some((h) => /openlibrary\.org$/.test(h))).toBe(true);
    });

    it('[REQ-116/AK-3] beide Anfragen starten gleichzeitig (die zweite wartet nicht auf die Antwort der ersten)', async () => {
      const http = httpFake(() => new Promise<never>(() => {}));
      await zeige(onlineSucheMit(http));
      await oeffneSuche();
      eintippen('Harry Potter Rowling');
      await suchTaste();
      await vi.waitFor(() => expect(http.text).toHaveBeenCalledTimes(2), W);
    });

    it('[REQ-116/AK-3] Absenden des Suchformulars (Such-Taste) startet die Suche mit dem Suchtext', async () => {
      const suche = { suchen: vi.fn(async () => [T1]) };
      await zeige(suche);
      const f = await oeffneSuche();
      eintippen('Harry Potter Rowling');
      expect(suche.suchen).not.toHaveBeenCalled();
      await act(async () => {
        fireEvent.submit(within(f).getByRole('search'));
        await new Promise((r) => setTimeout(r, 30));
      });
      expect(suche.suchen).toHaveBeenCalledTimes(1);
      expect(suche.suchen).toHaveBeenCalledWith('Harry Potter Rowling', ['ger']);
    });

    it('[REQ-116/AK-3] Titel, Autor und ISBN (auch kombiniert) werden angenommen: Wörter landen in beiden Anfragen', async () => {
      const http = httpFake();
      await zeige(onlineSucheMit(http));
      await oeffneSuche();
      eintippen('Stein Weisen Rowling');
      await suchTaste();
      await vi.waitFor(() => expect(http.text).toHaveBeenCalledTimes(2), W);
      for (const u of http.text.mock.calls.map((c) => decodeURIComponent(c[0]).replace(/\+/g, ' '))) {
        for (const w of ['Stein', 'Weisen', 'Rowling']) expect(u).toContain(w);
      }
    });

    it('[REQ-116/AK-3] Laufanzeige während der Suche; neue Suche ersetzt die bisherigen Ergebnisse', async () => {
      let loesen: (t: Treffer[]) => void = () => {};
      const suche = {
        suchen: vi
          .fn<(t: string) => Promise<Treffer[]>>()
          .mockImplementationOnce(async () => [T1])
          .mockImplementationOnce(() => new Promise<Treffer[]>((r) => (loesen = r))),
      };
      await zeige(suche);
      const f = await oeffneSuche();
      eintippen('Harry');
      await suchTaste();
      await vi.waitFor(() => expect(f.querySelectorAll('[data-online-treffer]')).toHaveLength(1), W);
      eintippen('Tolkien');
      await suchTaste();
      expect(f.querySelector('[data-online-suche-laeuft]')).not.toBeNull();
      await act(async () => {
        loesen([T2]);
        await new Promise((r) => setTimeout(r, 30));
      });
      expect(f.querySelector('[data-online-suche-laeuft]')).toBeNull();
      const t = f.querySelectorAll('[data-online-treffer]');
      expect(t).toHaveLength(1);
      expect(t[0].textContent).toContain('Der Herr der Ringe');
      expect(f.textContent).not.toContain('Stein der Weisen');
    });
  });

  describe('AK-4 Nur Suchtext und Sprachauswahl werden übermittelt', () => {
    it('[REQ-116/AK-4] keine Anfrage (auch Cover) enthält Angaben der eigenen Bücher; Textanfragen enthalten die ISBN', async () => {
      const ol = JSON.stringify({ docs: [{ title: 'Harry Potter', author_name: ['J. K. Rowling'], isbn: [ISBN], cover_i: 42, language: ['ger'] }] });
      const http = httpFake((u) => (u.includes('openlibrary') ? { status: 200, text: ol } : { status: 404, text: '' }));
      await zeige(onlineSucheMit(http));
      await oeffneSuche();
      eintippen(ISBN);
      await suchTaste();
      await vi.waitFor(() => expect(fenster()!.querySelector('[data-online-treffer]')).not.toBeNull(), W);
      expect(http.urls.length).toBeGreaterThanOrEqual(2);
      for (const u of http.urls) {
        const d = decodeURIComponent(u);
        for (const privat of ['Geheim', 'Tagebuch', 'Privatperson', 'Xaver', 'Hausverlag', GEHEIM.id]) expect(d).not.toContain(privat);
      }
      for (const c of http.text.mock.calls) expect(c[0]).toContain(ISBN);
    });

    it('[REQ-116/AK-4] die Anfragen hängen nur vom Suchtext ab (anderer Suchtext → nur der Suchtext ändert sich)', async () => {
      const a = httpFake();
      const b = httpFake();
      await onlineSucheMit(a).suchen(ISBN);
      await onlineSucheMit(b).suchen('9783423214124');
      const ua = a.text.mock.calls.map((c) => c[0].split(ISBN).join('§')).sort();
      const ub = b.text.mock.calls.map((c) => c[0].split('9783423214124').join('§')).sort();
      expect(ua).toHaveLength(2);
      expect(ua).toEqual(ub);
    });
  });

  describe('AK-5 Leeres Suchfeld', () => {
    it.each([[''], ['   '], ['\t  ']])('[REQ-116/AK-5] Suchfeld %j: Such-Taste sendet keine Anfrage', async (text) => {
      const http = httpFake();
      await zeige(onlineSucheMit(http));
      const f = await oeffneSuche();
      eintippen(text);
      await suchTaste();
      await act(async () => {
        fireEvent.submit(within(f).getByRole('search'));
        await new Promise((r) => setTimeout(r, 30));
      });
      await warte(60);
      expect(http.text).not.toHaveBeenCalled();
      expect(http.bild).not.toHaveBeenCalled();
      expect(fenster()).not.toBeNull();
      expect(hinweis()).toBeNull();
    });
  });

  describe('AK-6 Keine Treffer', () => {
    it('[REQ-116/AK-6] Fenster bleibt offen, Suchtext im Feld, kurz „Keine Bücher gefunden“', async () => {
      const { repo } = await zeige({ suchen: vi.fn(async () => []) });
      await oeffneSuche();
      eintippen('Gibtsnicht Xyz');
      await suchTaste();
      await vi.waitFor(() => expect(hinweis()).not.toBeNull(), W);
      expect(hinweis()).toHaveTextContent('Keine Bücher gefunden');
      expect(hinweis()).toHaveAttribute('role', 'status');
      expect(fenster()).not.toBeNull();
      expect(suchfeld().value).toBe('Gibtsnicht Xyz');
      expect(fenster()!.querySelector('[data-online-treffer]')).toBeNull();
      // „kurz“: Hinweis verschwindet wieder, Fenster und Suchtext bleiben
      await vi.waitFor(() => expect(hinweis()).toBeNull(), { timeout: ONLINE_SUCHE_HINWEIS_MS + 2000 });
      expect(fenster()).not.toBeNull();
      expect(suchfeld().value).toBe('Gibtsnicht Xyz');
      expect(neue(repo)).toHaveLength(0);
    });

    it('[REQ-116/AK-6] über onlineSucheMit: beide Quellen ohne Treffer → „Keine Bücher gefunden“', async () => {
      const dnbLeer = '<?xml version="1.0"?><searchRetrieveResponse xmlns="http://www.loc.gov/zing/srw/"><numberOfRecords>0</numberOfRecords></searchRetrieveResponse>';
      const http = httpFake((u) => (u.includes('openlibrary') ? { status: 200, text: JSON.stringify({ docs: [] }) } : { status: 200, text: dnbLeer }));
      await zeige(onlineSucheMit(http));
      await oeffneSuche();
      eintippen('Gibtsnicht');
      await suchTaste();
      await vi.waitFor(() => expect(hinweis()).toHaveTextContent('Keine Bücher gefunden'), W);
    });

    it('[REQ-116/AK-6] nur eine Quelle scheitert mit Fehler: Treffer der anderen ohne Hinweis', async () => {
      const ol = JSON.stringify({ docs: [{ title: 'Nur Open Library', author_name: ['Autorin'], language: ['ger'] }] });
      const http = httpFake((u) => (u.includes('openlibrary') ? { status: 200, text: ol } : Promise.reject(new TypeError('DNB down'))));
      await zeige(onlineSucheMit(http));
      const f = await oeffneSuche();
      eintippen('Nur Open Library');
      await suchTaste();
      await vi.waitFor(() => expect(f.querySelectorAll('[data-online-treffer]')).toHaveLength(1), W);
      expect(f.textContent).toContain('Nur Open Library');
      expect(hinweis()).toBeNull();
    });
  });

  describe('AK-7 Kein Internet', () => {
    it('[REQ-116/AK-7] Suche scheitert: Fenster offen, Suchtext bleibt, kurz „Keine Internetverbindung“, kein Buch', async () => {
      vi.spyOn(console, 'warn').mockImplementation(() => {});
      const { repo } = await zeige({ suchen: vi.fn(async () => Promise.reject(new TypeError('offline'))) });
      await oeffneSuche();
      eintippen('Harry Potter');
      await suchTaste();
      await vi.waitFor(() => expect(hinweis()).toHaveTextContent('Keine Internetverbindung'), W);
      expect(fenster()).not.toBeNull();
      expect(suchfeld().value).toBe('Harry Potter');
      expect(repo.save).not.toHaveBeenCalled();
      await vi.waitFor(() => expect(hinweis()).toBeNull(), { timeout: ONLINE_SUCHE_HINWEIS_MS + 2000 });
      expect(fenster()).not.toBeNull();
    });

    it('[REQ-116/AK-7] über onlineSucheMit: beide Quellen nicht erreichbar → „Keine Internetverbindung“', async () => {
      vi.spyOn(console, 'warn').mockImplementation(() => {});
      const http = httpFake(() => Promise.reject(new TypeError('offline')));
      const { repo } = await zeige(onlineSucheMit(http));
      await oeffneSuche();
      eintippen('Harry Potter');
      await suchTaste();
      await vi.waitFor(() => expect(hinweis()).toHaveTextContent('Keine Internetverbindung'), W);
      expect(http.text).toHaveBeenCalledTimes(2);
      expect(fenster()).not.toBeNull();
      expect(repo.save).not.toHaveBeenCalled();
    });
  });

  describe('AK-8 Zurück führt eine Stufe zurück', () => {
    it('[REQ-116/AK-8] Zurück-Pfeil ohne Ergebnisse: Menü offen, Plus zeigt „ד, kein Buch', async () => {
      const { repo } = await zeige({ suchen: vi.fn(async () => []) });
      const f = await oeffneSuche();
      await tippe(f.querySelector('[data-online-suche-zurueck]')!);
      await menueWiederOffen();
      expect(repo.save).not.toHaveBeenCalled();
    });

    it('[REQ-116/AK-8] Zurück-Pfeil mit Ergebnissen: Menü offen, kein Buch; erneutes „Online suchen“ öffnet das Fenster wieder', async () => {
      const { repo } = await zeige({ suchen: vi.fn(async () => [T1, T2]) });
      const f = await oeffneSuche();
      eintippen('Harry');
      await suchTaste();
      await vi.waitFor(() => expect(f.querySelectorAll('[data-online-treffer]')).toHaveLength(2), W);
      await tippe(within(f).getByRole('button', { name: 'Zurück' }));
      await menueWiederOffen();
      expect(repo.save).not.toHaveBeenCalled();
      await tippe(menue()!.querySelector('[data-option="online"]')!);
      await vi.waitFor(() => expect(fenster()).not.toBeNull(), W);
    });

    it('[REQ-116/AK-8] Android-Zurück-Taste (popstate): Menü offen, kein Buch', async () => {
      const { repo } = await zeige({ suchen: vi.fn(async () => [T1]) });
      const f = await oeffneSuche();
      eintippen('Harry');
      await suchTaste();
      await vi.waitFor(() => expect(f.querySelector('[data-online-treffer]')).not.toBeNull(), W);
      await act(async () => {
        window.dispatchEvent(new PopStateEvent('popstate', { state: null }));
        await new Promise((r) => setTimeout(r, 30));
      });
      await menueWiederOffen();
      expect(repo.save).not.toHaveBeenCalled();
    });

    it('[REQ-116/AK-8] Herunterziehen am Ziehgriff: Menü offen, kein Buch', async () => {
      const { repo } = await zeige({ suchen: vi.fn(async () => []) });
      const f = await oeffneSuche();
      const griff = f.querySelector('[data-ziehgriff]')!;
      await act(async () => {
        fireEvent.pointerDown(griff, { clientY: 100, pointerId: 1 });
        fireEvent.pointerMove(griff, { clientY: 400, pointerId: 1 });
        fireEvent.pointerUp(griff, { clientY: 400, pointerId: 1 });
        await new Promise((r) => setTimeout(r, 30));
      });
      await menueWiederOffen();
      expect(repo.save).not.toHaveBeenCalled();
    });

    it('[REQ-116/AK-8] Negativfall: kurzes Ziehen schließt das Fenster nicht', async () => {
      await zeige({ suchen: vi.fn(async () => []) });
      const f = await oeffneSuche();
      const griff = f.querySelector('[data-ziehgriff]')!;
      await act(async () => {
        fireEvent.pointerDown(griff, { clientY: 100, pointerId: 1 });
        fireEvent.pointerMove(griff, { clientY: 105, pointerId: 1 });
        fireEvent.pointerUp(griff, { clientY: 105, pointerId: 1 });
        await new Promise((r) => setTimeout(r, 30));
      });
      expect(fenster()).not.toBeNull();
      expect(menue()).toBeNull();
    });
  });
});
