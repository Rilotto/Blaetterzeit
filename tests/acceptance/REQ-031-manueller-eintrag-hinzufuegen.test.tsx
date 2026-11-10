/**
 * Akzeptanztests REQ-031 – Manueller Eintrag: neues Buch mit „Hinzufügen“ anlegen.
 *
 * Abgeleitet aus dem REQ-Text und der Schnittstellen-Absprache (sprints/sprint-04/plan.md, Teil A):
 *  - Blatt role="dialog" aria-label="Manueller Eintrag", Felder per <label> Titel/Autor/Jahr/Seiten, Pille „Hinzufügen“
 *  - fehlender Titel: role="alert" „Bitte gib einen Titel ein“; ungültiges Jahr: data-fehler="true", Farbe primaer
 *  - Speichern über BookRepository.save, status „ungelesen“; danach section aria-label="Buchdetails"
 *  - BuecherAnsicht { repository?, bildquelle?, bildspeicher? }
 * „Neustart“: neue Repository-Instanz (neu geladene Module) auf derselben IndexedDB (fake-indexeddb).
 * AK-8/AK-9: Das Menü „Buchlänge“ (REQ-025) gehört zu Teil B. Geprüft wird hier der Datenteil
 * (Seitenanzahl gespeichert bzw. fehlend); der UI-Teil wird mit REQ-025 nachgeprüft.
 */
import '@testing-library/jest-dom/vitest';
import { act, cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { IDBFactory, IDBKeyRange } from 'fake-indexeddb';
import type { CSSProperties } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import BuecherAnsicht from '@/views/BuecherAnsicht';
import type { Bildquelle } from '@/bild/bildquelle';
import type { Buch } from '@/domain/buch';
import type { BookRepository, ImageStore } from '@/storage';
import { farbrubriken, farbVariablen } from '@/theme';

const PNG = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAIAAACQd1PeAAAADElEQVR4nGP4z8AAAAMBAQDJ/pLvAAAAAElFTkSuQmCC';
const MOMO: Buch = { id: '31000000-0000-4000-8000-000000000001', titel: 'Momo', status: 'gelesen' };
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const HINWEIS = 'Bitte gib einen Titel ein';

function repoFake(start: Buch[] = [MOMO]) {
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
    get: async (id: string, b: string) => daten.get(`${id}|${b}`),
    put: async (id: string, b: string, d: string) => void daten.set(`${id}|${b}`, d),
    remove: async (id: string, b: string) => void daten.delete(`${id}|${b}`),
  };
  return s as typeof s & ImageStore;
}
async function zeige(repo: BookRepository = repoFake(), bildspeicher: ImageStore = speicherFake()) {
  const q: Bildquelle = { scannen: async () => PNG, galerie: async () => PNG };
  const { container } = render(
    <div data-testwurzel="" style={farbVariablen() as CSSProperties}>
      <BuecherAnsicht repository={repo} bildquelle={q} bildspeicher={bildspeicher} />
    </div>,
  );
  await screen.findByRole('heading', { name: 'Deine Bücher' });
  return container.firstElementChild as HTMLElement;
}
async function oeffneBlatt() {
  fireEvent.click(screen.getByRole('button', { name: 'Buch hinzufügen' }));
  const m = await screen.findByRole('menu', { name: 'Buch hinzufügen' });
  fireEvent.click(within(m).getByRole('menuitem'));
  return screen.findByRole('dialog', { name: 'Manueller Eintrag' });
}
const blatt = () => screen.queryByRole('dialog', { name: 'Manueller Eintrag' });
const feld = (name: string) =>
  within(screen.getByRole('dialog', { name: 'Manueller Eintrag' })).getByLabelText(new RegExp(`^\\s*${name}\\s*$`, 'i')) as HTMLInputElement;
const gib = (name: string, wert: string) => fireEvent.change(feld(name), { target: { value: wert } });
function tippeZeichen(name: string, text: string) {
  for (const z of text) fireEvent.change(feld(name), { target: { value: feld(name).value + z } });
}
async function hinzufuegen() {
  await act(async () => {
    fireEvent.click(within(screen.getByRole('dialog', { name: 'Manueller Eintrag' })).getByRole('button', { name: 'Hinzufügen' }));
    await new Promise((r) => setTimeout(r, 20));
  });
}
const neue = (repo: ReturnType<typeof repoFake>) => [...repo.daten.values()].filter((b) => b.id !== MOMO.id);
async function legeAn(felder: Record<string, string>) {
  await oeffneBlatt();
  for (const [k, v] of Object.entries(felder)) gib(k, v);
  await hinzufuegen();
}
function farbeVon(ausdruck: string) {
  const ctx = document.querySelector<HTMLElement>('[data-testwurzel]') ?? document.body;
  const p = document.createElement('span');
  p.style.setProperty('color', ausdruck);
  ctx.appendChild(p);
  const w = getComputedStyle(p).color;
  p.remove();
  return w;
}
const primaer = () => farbeVon(farbrubriken.primaer.wert);
/** Alle Farbwerte eines Elements, an denen eine Hervorhebung sichtbar wird. */
function farbwerte(el: HTMLElement) {
  const cs = getComputedStyle(el);
  return [cs.color, cs.borderTopColor, cs.borderBottomColor, cs.backgroundColor, cs.outlineColor, cs.boxShadow];
}
function jahrMarkierung() {
  const jahr = feld('Jahr');
  const d = screen.getByRole('dialog', { name: 'Manueller Eintrag' });
  return Array.from(d.querySelectorAll<HTMLElement>('[data-fehler="true"]')).filter((e) => e === jahr || e.contains(jahr));
}
function jahrInPrimaer() {
  const jahr = feld('Jahr');
  const els = [jahr, ...jahrMarkierung()];
  return els.some((e) => farbwerte(e).some((w) => w.includes(primaer())));
}
async function mitIndexedDb<T>(fn: () => Promise<T>) {
  vi.stubGlobal('indexedDB', new IDBFactory());
  vi.stubGlobal('IDBKeyRange', IDBKeyRange);
  try {
    return await fn();
  } finally {
    vi.unstubAllGlobals();
  }
}
async function zentral() {
  vi.resetModules();
  return (await import('@/storage')) as typeof import('@/storage');
}

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

// ===========================================================================
describe('REQ-031 Neues Buch mit „Hinzufügen“ anlegen', () => {
  describe('AK-1 Buch wird angelegt', () => {
    it('[REQ-031/AK-1] Titel „Testbuch“ und Autor „Vorname Nachname“ ergeben genau ein neues Buch mit eigener UUID', async () => {
      const repo = repoFake();
      await zeige(repo);
      await legeAn({ Titel: 'Testbuch', Autor: 'Vorname Nachname' });
      expect(repo.save).toHaveBeenCalledTimes(1);
      const n = neue(repo);
      expect(n).toHaveLength(1);
      expect(n[0].titel).toBe('Testbuch');
      expect(n[0].autor).toBe('Vorname Nachname');
      expect(n[0].id).toMatch(UUID);
      expect(n[0].id).not.toBe(MOMO.id);
      expect(repo.daten.get(MOMO.id), 'bestehendes Buch unverändert').toEqual(MOMO);
    });

    it('[REQ-031/AK-1] zwei nacheinander angelegte Bücher mit gleichem Titel haben verschiedene IDs', async () => {
      const repo = repoFake();
      await zeige(repo);
      await legeAn({ Titel: 'Testbuch' });
      fireEvent.click(within(screen.getByRole('region', { name: 'Buchdetails' })).getByRole('button', { name: 'Zurück' }));
      await screen.findByRole('heading', { name: 'Deine Bücher' });
      await legeAn({ Titel: 'Testbuch' });
      const ids = neue(repo).map((b) => b.id);
      expect(ids).toHaveLength(2);
      expect(new Set(ids).size).toBe(2);
    });

    it('[REQ-031/AK-1] alle Angaben werden gespeichert: Jahr als Erscheinungsjahr, Seiten als Seitenanzahl (Zahlen)', async () => {
      const repo = repoFake();
      await zeige(repo);
      await legeAn({ Titel: 'Testbuch', Autor: 'Vorname Nachname', Jahr: '2019', Seiten: '350' });
      const [b] = neue(repo);
      expect(b).toMatchObject({ titel: 'Testbuch', autor: 'Vorname Nachname', erscheinungsjahr: 2019, seitenanzahl: 350, status: 'ungelesen' });
    });

    it('[REQ-031/AK-1] Doppeltippen auf „Hinzufügen“ legt genau ein Buch an', async () => {
      const repo = repoFake();
      await zeige(repo);
      const d = await oeffneBlatt();
      gib('Titel', 'Testbuch');
      const btn = within(d).getByRole('button', { name: 'Hinzufügen' });
      await act(async () => {
        fireEvent.click(btn);
        fireEvent.click(btn);
        await new Promise((r) => setTimeout(r, 20));
      });
      expect(neue(repo)).toHaveLength(1);
    });
  });

  describe('AK-2 Platzhaltertexte werden nicht gespeichert', () => {
    it('[REQ-031/AK-2] leere Felder Jahr/Seiten/Autor: weder 2024 noch 496 noch Platzhaltertexte, die Angaben fehlen', async () => {
      const repo = repoFake();
      await zeige(repo);
      await legeAn({ Titel: 'Testbuch' });
      const [b] = neue(repo);
      expect(b.erscheinungsjahr).toBeUndefined();
      expect(b.seitenanzahl).toBeUndefined();
      expect(b.autor).toBeUndefined();
      expect(b.erscheinungsdatum).toBeUndefined();
      const werte = Object.values(b).map(String);
      for (const p of ['2024', '496', 'Autor', 'Buchtitel']) expect(werte, p).not.toContain(p);
    });
  });

  describe('AK-3 Dauerhaft gespeichert', () => {
    it('[REQ-031/AK-3] nach „Neustart“ (neue Repository-Instanz auf derselben IndexedDB) ist das Buch mit allen Angaben da', async () => {
      await mitIndexedDb(async () => {
        const s1 = await zentral();
        await zeige(s1.createBookRepository(), s1.createImageStore());
        await legeAn({ Titel: 'Dauerbuch', Autor: 'Vorname Nachname', Jahr: '2019', Seiten: '350' });
        await screen.findByRole('region', { name: 'Buchdetails' });
        cleanup();
        const s2 = await zentral();
        const b = (await s2.createBookRepository().list()).filter((x) => x.titel === 'Dauerbuch');
        expect(b).toHaveLength(1);
        expect(b[0]).toMatchObject({ autor: 'Vorname Nachname', erscheinungsjahr: 2019, seitenanzahl: 350, status: 'ungelesen' });
        expect(b[0].id).toMatch(UUID);
      });
    });
  });

  describe('AK-4 Ohne Titel wird nichts gespeichert', () => {
    it('[REQ-031/AK-4] leerer Titel, Autor eingetragen: kein Buch, Blatt bleibt offen, Autor bleibt, Hinweis erscheint', async () => {
      const repo = repoFake();
      await zeige(repo);
      await legeAn({ Autor: 'Vorname Nachname' });
      expect(repo.save).not.toHaveBeenCalled();
      expect(neue(repo)).toHaveLength(0);
      expect(blatt()).toBeVisible();
      expect(feld('Autor').value).toBe('Vorname Nachname');
      expect(feld('Titel').value).toBe('');
      expect(screen.getByRole('alert')).toHaveTextContent(HINWEIS);
      expect(screen.queryByRole('region', { name: 'Buchdetails' })).toBeNull();
    });

    it('[REQ-031/AK-4] der Hinweis steht unter dem Feld „TITEL“ (vor dem Feld „AUTOR“) und ist in der Rubrik „Primär“', async () => {
      await zeige();
      await legeAn({});
      const a = screen.getByRole('alert');
      expect(a.textContent?.trim()).toBe(HINWEIS);
      expect(feld('Titel').compareDocumentPosition(a) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
      expect(a.compareDocumentPosition(feld('Autor')) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
      expect(getComputedStyle(a).color).toBe(primaer());
    });

    it('[REQ-031/AK-4] vor dem Antippen von „Hinzufügen“ gibt es keinen Hinweis', async () => {
      await zeige();
      await oeffneBlatt();
      expect(screen.queryByRole('alert')).toBeNull();
      expect(screen.queryByText(HINWEIS)).toBeNull();
    });
  });

  describe('AK-10 Hinweis verschwindet bei Eingabe', () => {
    it('[REQ-031/AK-10] nach Eingabe im Titel ist der Hinweis weg, danach kann angelegt werden', async () => {
      const repo = repoFake();
      await zeige(repo);
      await legeAn({});
      expect(screen.getByRole('alert')).toBeInTheDocument();
      tippeZeichen('Titel', 'T');
      expect(screen.queryByRole('alert')).toBeNull();
      expect(screen.queryByText(HINWEIS)).toBeNull();
      gib('Titel', 'Testbuch');
      await hinzufuegen();
      expect(neue(repo).map((b) => b.titel)).toEqual(['Testbuch']);
    });
  });

  describe('AK-11 Titel nur aus Leerzeichen gilt als leer', () => {
    it.each([' ', '     '])('[REQ-031/AK-11] Titel „%s“: kein Buch, Blatt offen, Hinweis', async (titel) => {
      const repo = repoFake();
      await zeige(repo);
      await legeAn({ Titel: titel, Autor: 'Vorname Nachname' });
      expect(repo.save).not.toHaveBeenCalled();
      expect(blatt()).toBeVisible();
      expect(screen.getByRole('alert')).toHaveTextContent(HINWEIS);
      expect(feld('Autor').value).toBe('Vorname Nachname');
    });

    it('[REQ-031/AK-11] Gegenprobe: ein Titel mit Leerzeichen und Text wird angelegt', async () => {
      const repo = repoFake();
      await zeige(repo);
      await legeAn({ Titel: ' A ' });
      expect(neue(repo)).toHaveLength(1);
      expect(neue(repo)[0].titel.trim()).toBe('A');
    });
  });

  describe('AK-5 Nur Titel genügt', () => {
    it('[REQ-031/AK-5] nur der Titel ist ausgefüllt: das Buch wird angelegt', async () => {
      const repo = repoFake();
      await zeige(repo);
      await legeAn({ Titel: 'Nur Titel' });
      expect(neue(repo).map((b) => b.titel)).toEqual(['Nur Titel']);
      expect(screen.queryByRole('alert')).toBeNull();
    });
  });

  describe('AK-6 Standardstatus „ungelesen“', () => {
    it('[REQ-031/AK-6] das neue Buch ist „ungelesen“ und erscheint nach Zurück im Abschnitt „Noch zu lesen“', async () => {
      const repo = repoFake();
      await zeige(repo);
      await legeAn({ Titel: 'Neu im Regal' });
      expect(neue(repo)[0].status).toBe('ungelesen');
      fireEvent.click(within(await screen.findByRole('region', { name: 'Buchdetails' })).getByRole('button', { name: 'Zurück' }));
      const region = await screen.findByRole('region', { name: 'Noch zu lesen' });
      await vi.waitFor(() =>
        expect(Array.from(region.querySelectorAll('[data-buchtitel]')).map((e) => e.textContent?.trim())).toContain('Neu im Regal'),
      );
      // Gegenprobe: das „gelesen“-Buch erscheint dort nicht
      expect(Array.from(region.querySelectorAll('[data-buchtitel]')).map((e) => e.textContent?.trim())).not.toContain(MOMO.titel);
    });
  });

  describe('AK-7 Buchdetails des neuen Buches', () => {
    it('[REQ-031/AK-7] nach „Hinzufügen“ ist das Blatt zu und die Buchdetails zeigen den Titel des neuen Buches', async () => {
      await zeige();
      await legeAn({ Titel: 'Testbuch' });
      const details = await screen.findByRole('region', { name: 'Buchdetails' });
      expect(blatt()).toBeNull();
      await vi.waitFor(() => expect(details.querySelector('[data-buchdetails-titel]')?.textContent?.trim()).toBe('Testbuch'));
      expect(details.textContent).not.toContain(MOMO.titel);
    });
  });

  describe('AK-8 Seiten als Seitenanzahl', () => {
    it.each([
      ['350', 350],
      ['1', 1],
      ['12000', 12000],
    ])('[REQ-031/AK-8] „SEITEN“ %s → Seitenanzahl %i (Datenteil; Menü „Buchlänge“ folgt mit REQ-025)', async (eingabe, zahl) => {
      const repo = repoFake();
      await zeige(repo);
      await legeAn({ Titel: 'Testbuch', Seiten: eingabe });
      expect(neue(repo)[0].seitenanzahl).toBe(zahl);
    });
  });

  describe('AK-9 Ohne Seiten wird „Buchlänge“ abgefragt', () => {
    it('[REQ-031/AK-9] ohne Eintrag in „SEITEN“ hat das Buch keine Seitenanzahl (Voraussetzung für „Buchlänge“, REQ-025)', async () => {
      const repo = repoFake();
      await zeige(repo);
      await legeAn({ Titel: 'Testbuch', Seiten: '' });
      expect(neue(repo)[0]).not.toHaveProperty('seitenanzahl');
    });
  });

  describe('AK-12 Ungültiges Jahr wird hervorgehoben', () => {
    it.each(['1', '19', '199'])('[REQ-031/AK-12] Jahr „%s“: Feld „JAHR“ markiert und in „Primär“, kein Hinweistext', async (jahr) => {
      await zeige();
      await oeffneBlatt();
      gib('Titel', 'Testbuch');
      gib('Jahr', jahr);
      const textVorher = blatt()!.textContent;
      expect(jahrMarkierung(), 'vor „Hinzufügen“ nicht markiert').toHaveLength(0);
      expect(jahrInPrimaer(), 'vor „Hinzufügen“ nicht in Primär').toBe(false);
      await hinzufuegen();
      expect(jahrMarkierung().length).toBeGreaterThan(0);
      expect(jahrInPrimaer()).toBe(true);
      expect(screen.queryByRole('alert')).toBeNull();
      expect(blatt()!.textContent, 'kein zusätzlicher Text').toBe(textVorher);
    });

    it('[REQ-031/AK-12] Gegenprobe: ein vierstelliges Jahr wird nicht markiert und als Erscheinungsjahr gespeichert', async () => {
      const repo = repoFake();
      await zeige(repo);
      await legeAn({ Titel: 'Testbuch', Jahr: '1999' });
      expect(neue(repo)[0].erscheinungsjahr).toBe(1999);
    });

    it('[REQ-031/AK-12] fehlender Titel und ungültiges Jahr zugleich: Hinweis und Markierung', async () => {
      const repo = repoFake();
      await zeige(repo);
      await legeAn({ Jahr: '19' });
      expect(screen.getByRole('alert')).toHaveTextContent(HINWEIS);
      expect(jahrMarkierung().length).toBeGreaterThan(0);
      expect(repo.save).not.toHaveBeenCalled();
    });
  });

  describe('AK-13 Bei ungültigem Jahr wird kein Buch angelegt', () => {
    it.each(['1', '19', '199'])('[REQ-031/AK-13] Jahr „%s“: kein Buch, Blatt offen, Titel und Jahr unverändert', async (jahr) => {
      const repo = repoFake();
      await zeige(repo);
      await legeAn({ Titel: 'Testbuch', Jahr: jahr, Autor: 'A. B.' });
      expect(repo.save).not.toHaveBeenCalled();
      expect(blatt()).toBeVisible();
      expect(feld('Titel').value).toBe('Testbuch');
      expect(feld('Jahr').value).toBe(jahr);
      expect(feld('Autor').value).toBe('A. B.');
      expect(screen.queryByRole('region', { name: 'Buchdetails' })).toBeNull();
    });

    it('[REQ-031/AK-13] nach Korrektur auf vier Ziffern wird das Buch angelegt', async () => {
      const repo = repoFake();
      await zeige(repo);
      await legeAn({ Titel: 'Testbuch', Jahr: '19' });
      gib('Jahr', '1984');
      await hinzufuegen();
      expect(neue(repo).map((b) => b.erscheinungsjahr)).toEqual([1984]);
    });
  });

  describe('AK-14 Hervorhebung verschwindet bei Änderung im Feld „JAHR“', () => {
    it.each([
      ['Ziffer ergänzt', '1990'],
      ['Ziffer gelöscht', '19'],
      ['Feld geleert', ''],
    ])('[REQ-031/AK-14] „199“ markiert, %s → nicht mehr markiert', async (_w, neu) => {
      await zeige();
      await legeAn({ Titel: 'Testbuch', Jahr: '199' });
      expect(jahrMarkierung().length).toBeGreaterThan(0);
      gib('Jahr', neu);
      expect(jahrMarkierung()).toHaveLength(0);
      expect(jahrInPrimaer()).toBe(false);
    });

    it('[REQ-031/AK-14] nach Entfernen der Markierung markiert erneutes „Hinzufügen“ mit ungültigem Jahr wieder', async () => {
      await zeige();
      await legeAn({ Titel: 'Testbuch', Jahr: '199' });
      gib('Jahr', '19');
      expect(jahrMarkierung()).toHaveLength(0);
      await hinzufuegen();
      expect(jahrMarkierung().length).toBeGreaterThan(0);
    });
  });
});
