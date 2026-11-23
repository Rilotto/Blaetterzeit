/**
 * Akzeptanztests REQ-072 – Karte „Ausgabe“: Zeile „Maße“ (Breite × Höhe × Dicke) mit Blatt „Maße“.
 * Abgeleitet aus dem REQ-Text. Schnittstellen laut Entwickler (Sprint 07):
 *  - Buchfelder breiteMm, hoeheMm, dickeMm (Millimeter = cm mit einer Nachkommastelle)
 *  - Zeile [data-ausgabe-zeile="masse"]; Blatt role=dialog „Maße“ mit [data-ziehgriff], X [aria-label="Schließen"],
 *    [data-mass-feld=breite|hoehe|dicke] (Fehler data-fehler), [data-mass-label], [data-masse-hinweis], [data-masse-sichern]
 *  - Herunterziehen am [data-ziehgriff] ab 80 px; Zurück-Taste im Web als popstate
 *  - Sprint 08: ohne Maße Vorschlag „ca. …“ nach REQ-077 an [data-zeile-wert][data-zeile-vorschlag="true"], Blatt vorbefüllt
 * „Neustart“: neu geladene Module, neue Repository-Instanz auf derselben IndexedDB (fake-indexeddb).
 */
import '@testing-library/jest-dom/vitest';
import { act, cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { IDBFactory, IDBKeyRange } from 'fake-indexeddb';
import type { ComponentType } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { dnbTrefferLesen, openLibraryTrefferLesen, type Treffer } from '@/barcode/treffer';
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

type Welt = { repo: BookRepository; bilder: ImageStore; BD: ComponentType<Record<string, unknown>>; BA: ComponentType<Record<string, unknown>> };
const W = { timeout: 4000 };
const ISBN = '9783551551672';
const buch = (f: Partial<Buch> = {}): Buch => ({ id: crypto.randomUUID(), titel: 'Der Testroman', status: 'ungelesen', ...f });
const leereBilder = { get: async () => undefined, put: async () => {}, remove: async () => {} } as unknown as ImageStore;
const quelle = { scannen: async () => null, galerie: async () => null };

async function starte(): Promise<Welt> {
  vi.resetModules();
  const st = (await import('@/storage')) as typeof import('@/storage');
  const BD = (await import('@/views/BuchDetails')).default as unknown as ComponentType<Record<string, unknown>>;
  const BA = (await import('@/views/BuecherAnsicht')).default as unknown as ComponentType<Record<string, unknown>>;
  return { repo: st.createBookRepository(), bilder: st.createImageStore(), BD, BA };
}
async function warte(ms = 40) {
  await act(async () => {
    await new Promise((r) => setTimeout(r, ms));
  });
}
async function tippe(el: Element) {
  await act(async () => {
    fireEvent.click(el);
    await new Promise((r) => setTimeout(r, 15));
  });
}
async function zeige(w: Welt, id: string) {
  const BD = w.BD;
  render(<BD buchId={id} bildspeicher={leereBilder} bildquelle={quelle} onZurueck={() => {}} />);
  const d = await screen.findByRole('region', { name: 'Buchdetails' }, W);
  const tab = await vi.waitFor(() => {
    const t = d.querySelector<HTMLElement>('[data-reiter="details"]');
    expect(t).not.toBeNull();
    return t!;
  }, W);
  await tippe(tab);
  await vi.waitFor(() => expect(d.querySelector('[data-ausgabe-zeile="masse"]')).not.toBeNull(), W);
  return d;
}
async function mitBuch(b: Buch = buch()) {
  const w = await starte();
  await w.repo.save(b);
  return { w, d: await zeige(w, b.id), id: b.id };
}
async function gespeichert(id: string) {
  cleanup();
  const w = await starte();
  return w.repo.get(id);
}
const norm = (t: string | null | undefined) => (t ?? '').replace(/[\s  ]+/g, ' ').trim();
const zeile = (wurzel: ParentNode, id: string) => wurzel.querySelector<HTMLElement>(`[data-ausgabe-zeile="${id}"]`)!;
const wert = (wurzel: ParentNode) => norm(zeile(wurzel, 'masse').querySelector('[data-zeile-wert]')?.textContent ?? zeile(wurzel, 'masse').textContent);
const blatt = () => document.querySelector<HTMLElement>('[role="dialog"][aria-label="Maße"]');
const feld = (id: 'breite' | 'hoehe' | 'dicke') => blatt()!.querySelector<HTMLInputElement>(`[data-mass-feld="${id}"]`)!;
const fehler = (id: 'breite' | 'hoehe' | 'dicke') => feld(id).getAttribute('data-fehler') === 'true';
async function oeffne(wurzel: ParentNode) {
  await tippe(zeile(wurzel, 'masse'));
  await vi.waitFor(() => expect(blatt()).not.toBeNull(), W);
}
async function gib(id: 'breite' | 'hoehe' | 'dicke', t: string) {
  await act(async () => {
    fireEvent.change(feld(id), { target: { value: t } });
  });
}
async function sichern() {
  await tippe(blatt()!.querySelector('[data-masse-sichern]')!);
  await warte(60);
}
async function zurueckTaste() {
  await warte(20);
  await act(async () => {
    window.dispatchEvent(new PopStateEvent('popstate', { state: null }));
    await new Promise((r) => setTimeout(r, 20));
  });
}
async function herunterziehen(strecke = 120) {
  const g = blatt()!.querySelector<HTMLElement>('[data-ziehgriff]')!;
  await act(async () => {
    fireEvent.pointerDown(g, { clientY: 100, pointerId: 1 });
    fireEvent.pointerMove(g, { clientY: 100 + strecke / 2, pointerId: 1 });
    fireEvent.pointerMove(g, { clientY: 100 + strecke, pointerId: 1 });
    fireEvent.pointerUp(g, { clientY: 100 + strecke, pointerId: 1 });
    await new Promise((r) => setTimeout(r, 30));
  });
}

describe('REQ-072 Maße', () => {
  describe('AK-1 Zeile unter „Format“', () => {
    it('[REQ-072/AK-1] Zeile „Maße“ steht in der Karte „Ausgabe“ direkt unter „Format“', async () => {
      const { d } = await mitBuch();
      const ids = Array.from(d.querySelectorAll('[data-ausgabe-karte] [data-ausgabe-zeile]')).map((z) => z.getAttribute('data-ausgabe-zeile'));
      expect(ids[ids.indexOf('format') + 1]).toBe('masse');
      expect(norm(zeile(d, 'masse').querySelector('[data-zeile-bezeichnung]')?.textContent)).toBe('Maße');
    });

    it('[REQ-072/AK-1] Zeile „Maße“ zeigt rechts den Pfeil „›“ wie „Preis“ (mit und ohne Werte)', async () => {
      const { d } = await mitBuch(buch({ hoeheMm: 210 }));
      const pfeil = zeile(d, 'masse').querySelector<HTMLElement>('[data-zeile-pfeil]');
      expect(pfeil).not.toBeNull();
      expect(norm(pfeil!.textContent)).toBe('›');
      const wertEl = zeile(d, 'masse').querySelector('[data-zeile-wert]')!;
      expect(wertEl.compareDocumentPosition(pfeil!) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
      const preisPfeil = zeile(d, 'preis').querySelector<HTMLElement>('[data-zeile-pfeil]')!;
      expect(pfeil!.style.cssText).toBe(preisPfeil.style.cssText);
      cleanup();
      const { d: d2 } = await mitBuch();
      expect(norm(zeile(d2, 'masse').querySelector('[data-zeile-pfeil]')?.textContent)).toBe('›');
    });
  });

  describe('AK-2 Anzeige', () => {
    const wertEl = (d: ParentNode) => zeile(d, 'masse').querySelector<HTMLElement>('[data-zeile-wert]')!;
    it.each([
      [{ format: 'print', unterformat: 'taschenbuch', seitenanzahl: 400 }, 'ca. 12,0 × 19,0 × 2,4 cm'],
      [{ format: 'print', unterformat: 'hardcover', seitenanzahl: 400 }, 'ca. 14,8 × 21,0 × 2,8 cm'],
      [{}, 'ca. 12,0 × 19,0 × 2,5 cm'],
    ] as [Partial<Buch>, string][])('[REQ-072/AK-2] ohne Maße %j → Vorschlag „%s“, kursiv/abgeschwächt, nichts gespeichert', async (m, soll) => {
      const { d, id } = await mitBuch(buch(m));
      expect(wert(d)).toBe(soll);
      expect(wertEl(d).getAttribute('data-zeile-vorschlag')).toBe('true');
      expect(getComputedStyle(wertEl(d)).fontStyle).toBe('italic');
      await warte(100);
      const g = await gespeichert(id);
      expect([g?.breiteMm, g?.hoeheMm, g?.dickeMm]).toEqual([undefined, undefined, undefined]);
    });

    it('[REQ-072/AK-2] mit Werten: kein Vorschlag, nicht kursiv', async () => {
      const { d } = await mitBuch(buch({ breiteMm: 135, hoeheMm: 210, dickeMm: 32, format: 'print', unterformat: 'taschenbuch', seitenanzahl: 400 }));
      expect(wert(d)).toBe('13,5 × 21,0 × 3,2 cm');
      expect(wertEl(d).getAttribute('data-zeile-vorschlag')).not.toBe('true');
      expect(getComputedStyle(wertEl(d)).fontStyle).not.toBe('italic');
    });

    it.each([
      [{ breiteMm: 135, hoeheMm: 210, dickeMm: 32 }, '13,5 × 21,0 × 3,2 cm'],
      [{ hoeheMm: 210 }, '– × 21,0 × – cm'],
      [{ breiteMm: 100, dickeMm: 5 }, '10,0 × – × 0,5 cm'],
    ] as [Partial<Buch>, string][])('[REQ-072/AK-2] Maße %j → „%s“', async (m, soll) => {
      const { d } = await mitBuch(buch(m));
      expect(wert(d)).toBe(soll);
    });
  });

  describe('AK-3 Aufbau des Blatts', () => {
    it('[REQ-072/AK-3] Ziehgriff, Titel, X, Felder Breite × Höhe × Dicke mit Großbuchstaben-Labels, Hinweis, „Sichern“', async () => {
      const { d } = await mitBuch(buch({ format: 'print', unterformat: 'taschenbuch', seitenanzahl: 400 }));
      await oeffne(d);
      const b = blatt()!;
      expect(b.querySelector('[data-ziehgriff]')).not.toBeNull();
      expect(within(b).getByRole('heading', { name: 'Maße' }) ?? b.textContent).toBeTruthy();
      expect(b.querySelector('[aria-label="Schließen"]')).not.toBeNull();
      const felder = Array.from(b.querySelectorAll('[data-mass-feld]')).map((f) => f.getAttribute('data-mass-feld'));
      expect(felder).toEqual(['breite', 'hoehe', 'dicke']);
      const labels = Array.from(b.querySelectorAll<HTMLElement>('[data-mass-label]')).map((l) =>
        getComputedStyle(l).textTransform === 'uppercase' ? norm(l.textContent).toUpperCase() : norm(l.textContent),
      );
      expect(labels).toEqual(['BREITE', 'HÖHE', 'DICKE']);
      for (const f of ['breite', 'hoehe', 'dicke'] as const) expect(feld(f).getAttribute('inputmode')).toBe('decimal');
      expect([feld('breite').value, feld('hoehe').value, feld('dicke').value]).toEqual(['12,0', '19,0', '2,4']);
      expect(norm(b.querySelector('[data-masse-hinweis]')?.textContent)).toBe('in Zentimetern');
      expect(norm(b.querySelector('[data-masse-sichern]')?.textContent)).toBe('Sichern');
    });

    it('[REQ-072/AK-3] vorhandene Werte sind vorbefüllt', async () => {
      const { d } = await mitBuch(buch({ breiteMm: 135, hoeheMm: 210, dickeMm: 32 }));
      await oeffne(d);
      expect([feld('breite').value, feld('hoehe').value, feld('dicke').value]).toEqual(['13,5', '21,0', '3,2']);
    });

    it.each([
      [{ format: 'print', unterformat: 'hardcover', seitenanzahl: 400 }, ['14,8', '21,0', '2,8']],
      [{ format: 'print', unterformat: 'kleinformat' }, ['10,5', '14,8', '2,5']],
    ] as [Partial<Buch>, string[]][])('[REQ-072/AK-3] ohne Maße %j: Felder mit Schätzwerten %j vorbefüllt, nichts gespeichert', async (m, soll) => {
      const { d, id } = await mitBuch(buch(m));
      await oeffne(d);
      expect([feld('breite').value, feld('hoehe').value, feld('dicke').value]).toEqual(soll);
      const g = await gespeichert(id);
      expect([g?.breiteMm, g?.hoeheMm, g?.dickeMm]).toEqual([undefined, undefined, undefined]);
    });

    it('[REQ-072/AK-3] teilweise Werte: fehlende Felder bleiben leer', async () => {
      const { d } = await mitBuch(buch({ hoeheMm: 210 }));
      await oeffne(d);
      expect([feld('breite').value, feld('hoehe').value, feld('dicke').value]).toEqual(['', '21,0', '']);
    });
  });

  describe('AK-4 Gültig sichern', () => {
    it('[REQ-072/AK-4] „13.5“ bei Breite, Rest leer → Blatt zu, „13,5 × – × – cm“, auch nach Neuladen', async () => {
      const { d, id } = await mitBuch();
      await oeffne(d);
      await gib('breite', '13.5');
      await gib('hoehe', '');
      await gib('dicke', '');
      await sichern();
      await vi.waitFor(() => expect(blatt()).toBeNull(), W);
      await vi.waitFor(() => expect(wert(d)).toBe('13,5 × – × – cm'), W);
      const g = await gespeichert(id);
      expect(g?.breiteMm).toBe(135);
      expect(g?.hoeheMm).toBeUndefined();
      expect(g?.dickeMm).toBeUndefined();
      cleanup();
      const w = await starte();
      expect(wert(await zeige(w, id))).toBe('13,5 × – × – cm');
    });

    it.each([
      ['13,5', '21', '3,2', '13,5 × 21,0 × 3,2 cm', [135, 210, 32]],
      ['0,1', '21.0', ' 4 ', '0,1 × 21,0 × 4,0 cm', [1, 210, 40]],
    ])('[REQ-072/AK-4] Komma und Punkt erlaubt: %s / %s / %s → „%s“', async (b, h, t, soll, mm) => {
      const { d, id } = await mitBuch();
      await oeffne(d);
      await gib('breite', b);
      await gib('hoehe', h);
      await gib('dicke', t);
      await sichern();
      await vi.waitFor(() => expect(blatt()).toBeNull(), W);
      expect(wert(d)).toBe(soll);
      const g = await gespeichert(id);
      expect([g?.breiteMm, g?.hoeheMm, g?.dickeMm]).toEqual(mm);
    });

    it('[REQ-072/AK-4] Feld leeren = kein Wert: gespeicherte Dicke wird entfernt', async () => {
      const { d, id } = await mitBuch(buch({ breiteMm: 135, hoeheMm: 210, dickeMm: 32 }));
      await oeffne(d);
      await gib('dicke', '');
      await sichern();
      await vi.waitFor(() => expect(blatt()).toBeNull(), W);
      expect(wert(d)).toBe('13,5 × 21,0 × – cm');
      const g = await gespeichert(id);
      expect(g?.dickeMm).toBeUndefined();
      expect(g?.breiteMm).toBe(135);
    });

    it('[REQ-072/AK-4] alle Felder leeren → keine Maße gespeichert, Zeile zeigt wieder den Vorschlag „ca. …“', async () => {
      const { d, id } = await mitBuch(buch({ hoeheMm: 210, format: 'print', unterformat: 'taschenbuch', seitenanzahl: 400 }));
      await oeffne(d);
      await gib('hoehe', '');
      await sichern();
      await vi.waitFor(() => expect(blatt()).toBeNull(), W);
      expect(wert(d)).toBe('ca. 12,0 × 19,0 × 2,4 cm');
      const g = await gespeichert(id);
      expect([g?.breiteMm, g?.hoeheMm, g?.dickeMm]).toEqual([undefined, undefined, undefined]);
    });
  });

  describe('AK-5 Ungültige Werte', () => {
    it.each(['0', '-2', 'abc', '13,55', '0,0', '13,'])('[REQ-072/AK-5] „%s“ bei Höhe: Feld rot, Blatt offen, nichts gespeichert', async (ein) => {
      const { d, id } = await mitBuch(buch({ breiteMm: 120, hoeheMm: 190 }));
      await oeffne(d);
      await gib('breite', '15');
      await gib('hoehe', ein);
      await sichern();
      expect(blatt()).not.toBeNull();
      expect(fehler('hoehe')).toBe(true);
      expect(fehler('breite')).toBe(false);
      expect(fehler('dicke')).toBe(false);
      expect(feld('hoehe').style.border).not.toBe(feld('breite').style.border);
      expect(wert(d)).toBe('12,0 × 19,0 × – cm');
      const g = await gespeichert(id);
      expect([g?.breiteMm, g?.hoeheMm, g?.dickeMm]).toEqual([120, 190, undefined]);
    });

    it('[REQ-072/AK-5] mehrere ungültige Felder: jedes wird rot umrandet', async () => {
      const { d } = await mitBuch();
      await oeffne(d);
      await gib('breite', '0');
      await gib('hoehe', '21');
      await gib('dicke', 'x');
      await sichern();
      expect([fehler('breite'), fehler('hoehe'), fehler('dicke')]).toEqual([true, false, true]);
      expect(blatt()).not.toBeNull();
    });

    it('[REQ-072/AK-5] nach Korrektur lässt sich gültig sichern', async () => {
      const { d } = await mitBuch();
      await oeffne(d);
      await gib('breite', '13,55');
      await sichern();
      expect(fehler('breite')).toBe(true);
      await gib('breite', '13,5');
      await gib('hoehe', '');
      await gib('dicke', '');
      await sichern();
      await vi.waitFor(() => expect(blatt()).toBeNull(), W);
      expect(wert(d)).toBe('13,5 × – × – cm');
    });
  });

  describe('AK-6 Schließen verwirft', () => {
    it.each(['X', 'Außen', 'Zurück-Taste', 'Herunterziehen'])('[REQ-072/AK-6] Werte ändern, schließen über %s → unverändert', async (weg) => {
      const { d, id } = await mitBuch(buch({ breiteMm: 135, hoeheMm: 210, dickeMm: 32 }));
      await oeffne(d);
      await gib('breite', '99');
      await gib('dicke', '');
      if (weg === 'X') await tippe(blatt()!.querySelector('[aria-label="Schließen"]')!);
      else if (weg === 'Außen') await tippe(document.querySelector('[data-blatt-hintergrund]')!);
      else if (weg === 'Zurück-Taste') await zurueckTaste();
      else await herunterziehen();
      await vi.waitFor(() => expect(blatt()).toBeNull(), W);
      expect(wert(d)).toBe('13,5 × 21,0 × 3,2 cm');
      expect(screen.getByRole('region', { name: 'Buchdetails' })).toBeInTheDocument();
      await oeffne(d);
      expect([feld('breite').value, feld('dicke').value]).toEqual(['13,5', '3,2']);
      const g = await gespeichert(id);
      expect([g?.breiteMm, g?.hoeheMm, g?.dickeMm]).toEqual([135, 210, 32]);
    });
  });

  // ------------------------------------------------------------------ Manueller Eintrag
  async function zeigeBA(w: Welt, extra: Record<string, unknown> = {}) {
    const BA = w.BA;
    render(<BA repository={w.repo} bildspeicher={w.bilder} bildquelle={quelle} {...extra} />);
    await screen.findByRole('heading', { name: 'Deine Bücher' }, W);
  }
  const me = () => screen.queryByRole('dialog', { name: 'Manueller Eintrag' });
  const meFeld = (n: string) => within(me()!).getByLabelText(new RegExp(`^\\s*${n}\\s*$`, 'i')) as HTMLInputElement;
  async function oeffneManuell() {
    await tippe(screen.getByRole('button', { name: 'Buch hinzufügen' }));
    await tippe(within(await screen.findByRole('menu', { name: 'Buch hinzufügen' }, W)).getByRole('menuitem', { name: /Von Hand eintragen/ }));
    return screen.findByRole('dialog', { name: 'Manueller Eintrag' }, W);
  }

  describe('AK-7 Im Manuellen Eintrag', () => {
    it('[REQ-072/AK-7] Zeile „Maße“ unter „Format“; Maße eintragen, hinzufügen → Karte „Ausgabe“ zeigt sie', async () => {
      const w = await starte();
      await zeigeBA(w);
      const m = await oeffneManuell();
      const ids = Array.from(m.querySelectorAll('[data-ausgabe-zeile]')).map((z) => z.getAttribute('data-ausgabe-zeile'));
      expect(ids[ids.indexOf('format') + 1]).toBe('masse');
      expect(wert(m)).toBe('ca. 12,0 × 19,0 × 2,5 cm');
      fireEvent.change(meFeld('Titel'), { target: { value: 'Maßbuch' } });
      fireEvent.change(meFeld('Seiten'), { target: { value: '300' } });
      await vi.waitFor(() => expect(wert(m)).toBe('ca. 12,0 × 19,0 × 1,9 cm'), W);
      await oeffne(m);
      expect([feld('breite').value, feld('hoehe').value, feld('dicke').value]).toEqual(['12,0', '19,0', '1,9']);
      await gib('breite', '12');
      await gib('hoehe', '18,5');
      await gib('dicke', '4.2');
      await sichern();
      await vi.waitFor(() => expect(blatt()).toBeNull(), W);
      expect(me()).not.toBeNull();
      expect(wert(me()!)).toBe('12,0 × 18,5 × 4,2 cm');
      await tippe(within(me()!).getByRole('button', { name: 'Hinzufügen' }));
      await vi.waitFor(() => expect(me()).toBeNull(), W);
      const neu = (await w.repo.list()).find((b) => b.titel === 'Maßbuch')!;
      expect([neu.breiteMm, neu.hoeheMm, neu.dickeMm]).toEqual([120, 185, 42]);
      cleanup();
      const w2 = await starte();
      expect(wert(await zeige(w2, neu.id))).toBe('12,0 × 18,5 × 4,2 cm');
    });

    it('[REQ-072/AK-7] Manueller Eintrag ohne Maße: Vorschlag wird nicht mit dem Buch gespeichert', async () => {
      const w = await starte();
      await zeigeBA(w);
      const m = await oeffneManuell();
      fireEvent.change(meFeld('Titel'), { target: { value: 'Ohne Maß' } });
      fireEvent.change(meFeld('Seiten'), { target: { value: '400' } });
      await vi.waitFor(() => expect(wert(m)).toBe('ca. 12,0 × 19,0 × 2,4 cm'), W);
      await tippe(within(me()!).getByRole('button', { name: 'Hinzufügen' }));
      await vi.waitFor(() => expect(me()).toBeNull(), W);
      const neu = (await w.repo.list()).find((b) => b.titel === 'Ohne Maß')!;
      expect([neu.breiteMm, neu.hoeheMm, neu.dickeMm]).toEqual([undefined, undefined, undefined]);
    });

    it('[REQ-072/AK-7] gleiche Regeln: ungültiger Wert im Manuellen Eintrag wird rot markiert, Blatt bleibt offen', async () => {
      const w = await starte();
      await zeigeBA(w);
      const m = await oeffneManuell();
      await oeffne(m);
      await gib('dicke', '-2');
      await sichern();
      expect(blatt()).not.toBeNull();
      expect(fehler('dicke')).toBe(true);
      await tippe(blatt()!.querySelector('[aria-label="Schließen"]')!);
      await vi.waitFor(() => expect(blatt()).toBeNull(), W);
      expect(wert(me()!)).toBe('ca. 12,0 × 19,0 × 2,5 cm');
      // Blatt sauber schließen (hält den Verlauf der Zurück-Taste für die Folgetests sauber)
      await tippe(within(me()!).getByRole('button', { name: 'Schließen' }));
      await vi.waitFor(() => expect(me()).toBeNull(), W);
    });
  });

  describe('AK-8 Übernahme beim Barcode-Scan', () => {
    function scannerFake() {
      const s = {
        optionen: null as { beiIsbn: (isbn: string) => void } | null,
        starten: vi.fn(async (o: { beiIsbn: (isbn: string) => void }) => void (s.optionen = o)),
        lichtSetzen: vi.fn(async () => {}),
        beenden: vi.fn(async () => {}),
      };
      return s;
    }
    async function scanneUndTippe(treffer: Treffer[]) {
      const w = await starte();
      const scanner = scannerFake();
      await zeigeBA(w, { barcodeScanner: scanner, isbnSuche: { suchen: vi.fn(async () => treffer) } });
      await tippe(screen.getByRole('button', { name: 'Buch hinzufügen' }));
      const menue = await screen.findByRole('menu', { name: 'Buch hinzufügen' }, W);
      await tippe(menue.querySelector('[data-option="barcode"]')!);
      await vi.waitFor(() => expect(scanner.optionen).not.toBeNull(), W);
      await act(async () => {
        scanner.optionen!.beiIsbn(ISBN);
        await new Promise((r) => setTimeout(r, 30));
      });
      const a = await screen.findByRole('dialog', { name: 'Gefundene Bücher' }, W);
      await tippe(a.querySelector('[data-treffer]')!);
      await vi.waitFor(() => expect(me()).not.toBeNull(), W);
      return w;
    }

    it('[REQ-072/AK-8] Quelle liefert nur die Höhe 21 cm → vorbefüllt „– × 21,0 × – cm“, andere Felder leer, angelegt mit Höhe', async () => {
      const w = await scanneUndTippe([{ quelle: 'dnb', angaben: { titel: 'Hoch', seitenanzahl: 200, isbn: ISBN, hoeheMm: 210 } }]);
      expect(wert(me()!)).toBe('– × 21,0 × – cm');
      await oeffne(me()!);
      expect([feld('breite').value, feld('hoehe').value, feld('dicke').value]).toEqual(['', '21,0', '']);
      await tippe(blatt()!.querySelector('[aria-label="Schließen"]')!);
      await vi.waitFor(() => expect(blatt()).toBeNull(), W);
      await tippe(within(me()!).getByRole('button', { name: 'Hinzufügen' }));
      await vi.waitFor(() => expect(me()).toBeNull(), W);
      const neu = (await w.repo.list()).find((b) => b.titel === 'Hoch')!;
      expect([neu.breiteMm, neu.hoeheMm, neu.dickeMm]).toEqual([undefined, 210, undefined]);
    });

    it('[REQ-072/AK-8] keine Quelle liefert Maße → nichts übernommen/gespeichert; Zeile und Blatt zeigen den Schätz-Vorschlag', async () => {
      const w = await scanneUndTippe([{ quelle: 'openlibrary', angaben: { titel: 'Ohne', isbn: ISBN, seitenanzahl: 400 } }]);
      expect(wert(me()!)).toBe('ca. 12,0 × 19,0 × 2,4 cm');
      await oeffne(me()!);
      expect([feld('breite').value, feld('hoehe').value, feld('dicke').value]).toEqual(['12,0', '19,0', '2,4']);
      await tippe(blatt()!.querySelector('[aria-label="Schließen"]')!);
      await vi.waitFor(() => expect(blatt()).toBeNull(), W);
      await tippe(within(me()!).getByRole('button', { name: 'Hinzufügen' }));
      await vi.waitFor(() => expect(me()).toBeNull(), W);
      const neu = (await w.repo.list()).find((b) => b.titel === 'Ohne')!;
      expect([neu.breiteMm, neu.hoeheMm, neu.dickeMm]).toEqual([undefined, undefined, undefined]);
    });

    const dnbXml = (c: string) => `<?xml version="1.0" encoding="UTF-8"?>
<searchRetrieveResponse xmlns="http://www.loc.gov/zing/srw/"><numberOfRecords>1</numberOfRecords>
<records><record><recordData><record xmlns="http://www.loc.gov/MARC21/slim" type="Bibliographic">
<datafield tag="020" ind1=" " ind2=" "><subfield code="a">${ISBN}</subfield></datafield>
<datafield tag="245" ind1="1" ind2="0"><subfield code="a">Testbuch</subfield></datafield>
<datafield tag="300" ind1=" " ind2=" "><subfield code="a">335 Seiten</subfield>${c ? `<subfield code="c">${c}</subfield>` : ''}</datafield>
</record></recordData></record></records></searchRetrieveResponse>`;

    it.each([
      ['21 cm', 210],
      ['21,5 cm', 215],
    ])('[REQ-072/AK-8] DNB „%s“ → Höhe %i mm, Breite und Dicke leer', (c, mm) => {
      const [t] = dnbTrefferLesen(dnbXml(c), ISBN);
      expect(t.angaben.hoeheMm).toBe(mm);
      expect(t.angaben.breiteMm).toBeUndefined();
      expect(t.angaben.dickeMm).toBeUndefined();
    });

    it('[REQ-072/AK-8] DNB ohne Maßangabe → keine Maße', () => {
      const [t] = dnbTrefferLesen(dnbXml(''), ISBN);
      expect([t.angaben.breiteMm, t.angaben.hoeheMm, t.angaben.dickeMm]).toEqual([undefined, undefined, undefined]);
    });

    const ol = (dim?: string) => JSON.stringify({ [`ISBN:${ISBN}`]: { title: 'OL-Buch', identifiers: { isbn_13: [ISBN] }, ...(dim ? { physical_dimensions: dim } : {}) } });

    it('[REQ-072/AK-8] Open Library „20 x 13 x 2 centimeters“ → Breite 13,0, Höhe 20,0, Dicke 2,0', () => {
      const [t] = openLibraryTrefferLesen(ol('20 x 13 x 2 centimeters'), ISBN);
      expect([t.angaben.breiteMm, t.angaben.hoeheMm, t.angaben.dickeMm]).toEqual([130, 200, 20]);
    });

    it('[REQ-072/AK-8] Open Library in Zoll → auf eine Nachkommastelle in cm umgerechnet', () => {
      const [t] = openLibraryTrefferLesen(ol('8.5 x 5.5 x 1 inches'), ISBN);
      expect([t.angaben.breiteMm, t.angaben.hoeheMm, t.angaben.dickeMm]).toEqual([140, 216, 25]);
    });

    it('[REQ-072/AK-8] Open Library ohne physical_dimensions → keine Maße', () => {
      const [t] = openLibraryTrefferLesen(ol(), ISBN);
      expect([t.angaben.breiteMm, t.angaben.hoeheMm, t.angaben.dickeMm]).toEqual([undefined, undefined, undefined]);
    });
  });
  describe('AK-9 Schätzwerte folgen dem Format, werden nicht gespeichert', () => {
    async function formatAufHardcover(d: HTMLElement) {
      await tippe(zeile(d, 'format'));
      const f = await vi.waitFor(() => {
        const e = document.querySelector<HTMLElement>('[data-fenster-format]');
        expect(e).not.toBeNull();
        return e!;
      }, W);
      await tippe(f.querySelector('[data-unterformat="hardcover"]')!);
      await tippe(f.querySelector('[data-format-sichern]')!);
      await vi.waitFor(() => expect(document.querySelector('[data-fenster-format]')).toBeNull(), W);
      await warte(60);
    }
    const tb400 = () => buch({ format: 'print', unterformat: 'taschenbuch', seitenanzahl: 400 });

    it('[REQ-072/AK-9] Taschenbuch ohne Maße → Format auf Hardcover ändern und sichern → Zeile zeigt Hardcover-Schätzwerte, nichts gespeichert', async () => {
      const { d, id } = await mitBuch(tb400());
      expect(wert(d)).toBe('ca. 12,0 × 19,0 × 2,4 cm');
      await formatAufHardcover(d);
      await vi.waitFor(() => expect(wert(d)).toBe('ca. 14,8 × 21,0 × 2,8 cm'), W);
      await oeffne(d);
      expect([feld('breite').value, feld('hoehe').value, feld('dicke').value]).toEqual(['14,8', '21,0', '2,8']);
      const g = await gespeichert(id);
      expect([g?.breiteMm, g?.hoeheMm, g?.dickeMm]).toEqual([undefined, undefined, undefined]);
    });

    it.each(['X', 'Außen', 'Zurück-Taste', 'Herunterziehen'])('[REQ-072/AK-9] vorbefülltes Blatt ohne „Sichern“ schließen (%s) → weiterhin keine Maße gespeichert', async (weg) => {
      const { d, id } = await mitBuch(tb400());
      await oeffne(d);
      if (weg === 'X') await tippe(blatt()!.querySelector('[aria-label="Schließen"]')!);
      else if (weg === 'Außen') await tippe(document.querySelector('[data-blatt-hintergrund]')!);
      else if (weg === 'Zurück-Taste') await zurueckTaste();
      else await herunterziehen();
      await vi.waitFor(() => expect(blatt()).toBeNull(), W);
      expect(wert(d)).toBe('ca. 12,0 × 19,0 × 2,4 cm');
      const g = await gespeichert(id);
      expect([g?.breiteMm, g?.hoeheMm, g?.dickeMm]).toEqual([undefined, undefined, undefined]);
    });

    it('[REQ-072/AK-9] vorbefülltes Blatt mit „Sichern“ → Werte gespeichert, Zeile ohne „ca.“ und nicht abgeschwächt', async () => {
      const { d, id } = await mitBuch(tb400());
      await oeffne(d);
      await sichern();
      await vi.waitFor(() => expect(blatt()).toBeNull(), W);
      await vi.waitFor(() => expect(wert(d)).toBe('12,0 × 19,0 × 2,4 cm'), W);
      const w = zeile(d, 'masse').querySelector<HTMLElement>('[data-zeile-wert]')!;
      expect(w.getAttribute('data-zeile-vorschlag')).not.toBe('true');
      expect(getComputedStyle(w).fontStyle).not.toBe('italic');
      const g = await gespeichert(id);
      expect([g?.breiteMm, g?.hoeheMm, g?.dickeMm]).toEqual([120, 190, 24]);
    });

    it('[REQ-072/AK-9] nach dem Sichern folgen die Werte nicht mehr dem Format', async () => {
      const { d } = await mitBuch(tb400());
      await oeffne(d);
      await sichern();
      await vi.waitFor(() => expect(wert(d)).toBe('12,0 × 19,0 × 2,4 cm'), W);
      await formatAufHardcover(d);
      expect(wert(d)).toBe('12,0 × 19,0 × 2,4 cm');
    });
  });
});
