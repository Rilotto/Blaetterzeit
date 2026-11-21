/**
 * Akzeptanztests REQ-032 – Manueller Eintrag: Cover über Kamera oder Galerie hinzufügen.
 *
 * Abgeleitet aus dem REQ-Text und der Schnittstellen-Absprache (sprints/sprint-04/plan.md, Teil A):
 *  - <button data-cover-hinzufuegen> öffnet dasselbe Auswahlmenü wie in den Buchdetails
 *    (role="menu" „Bild hinzufügen“, REQ-015); Bildquelle und ImageStore per Props der BuecherAnsicht
 *  - Zuschnitt (role="region" „Zuschnitt“) startet mit data-startformat="cover"
 *  - Bild wird vorgemerkt und erst beim Anlegen als Frontcover (Bereich „cover“) im ImageStore gespeichert
 *  - Android-Zurück im Test per `popstate`, Herunterziehen per Pointer-Ereignissen
 * „Neustart“ (AK-7): neue Instanzen der zentralen Speicher (neu geladene Module) auf derselben fake-indexeddb.
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
import { farbVariablen } from '@/theme';

const PNG = {
  rot: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAIAAACQd1PeAAAADElEQVR4nGP4z8AAAAMBAQDJ/pLvAAAAAElFTkSuQmCC',
  gruen: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAIAAACQd1PeAAAADElEQVR4nGNgaGAAAAEEAIFw9selAAAAAElFTkSuQmCC',
};
const MOMO: Buch = { id: '32000000-0000-4000-8000-000000000001', titel: 'Momo', status: 'ungelesen' };

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
    get: vi.fn(async (id: string, b: string) => daten.get(`${id}|${b}`)),
    put: vi.fn(async (id: string, b: string, d: string) => void daten.set(`${id}|${b}`, d)),
    remove: vi.fn(async (id: string, b: string) => void daten.delete(`${id}|${b}`)),
  };
  return s as typeof s & ImageStore;
}
function quelle(bild: string | null = PNG.rot) {
  const q = { aktuell: bild, scannen: vi.fn(async () => q.aktuell), galerie: vi.fn(async () => q.aktuell) };
  return q as typeof q & Bildquelle;
}
async function zeige(opt: { repo?: BookRepository; s?: ImageStore; q?: Bildquelle } = {}) {
  const repo = opt.repo ?? repoFake();
  const s = opt.s ?? speicherFake();
  const q = opt.q ?? quelle();
  render(
    <div data-testwurzel="" style={farbVariablen() as CSSProperties}>
      <BuecherAnsicht repository={repo} bildquelle={q} bildspeicher={s} />
    </div>,
  );
  await screen.findByRole('heading', { name: 'Deine Bücher' });
  return { repo, s, q };
}
async function warte() {
  await act(async () => {
    await new Promise((r) => setTimeout(r, 20));
  });
}
async function oeffneBlatt() {
  fireEvent.click(screen.getByRole('button', { name: 'Buch hinzufügen' }));
  const m = await screen.findByRole('menu', { name: 'Buch hinzufügen' });
  fireEvent.click(within(m).getByRole('menuitem'));
  return screen.findByRole('dialog', { name: 'Manueller Eintrag' });
}
const blatt = () => screen.queryByRole('dialog', { name: 'Manueller Eintrag' });
const d = () => screen.getByRole('dialog', { name: 'Manueller Eintrag' });
const feld = (name: string) => within(d()).getByLabelText(new RegExp(`^\\s*${name}\\s*$`, 'i')) as HTMLInputElement;
const gib = (name: string, wert: string) => fireEvent.change(feld(name), { target: { value: wert } });
const coverFeld = () => document.querySelector<HTMLElement>('[data-cover-hinzufuegen]')!;
const vorgemerkt = () => coverFeld()?.querySelector('img')?.getAttribute('src') ?? null;
const auswahl = () => screen.queryByRole('menu', { name: 'Bild hinzufügen' });
async function oeffneAuswahl() {
  fireEvent.click(coverFeld());
  return screen.findByRole('menu', { name: 'Bild hinzufügen' });
}
async function waehle(punkt: string) {
  const m = await oeffneAuswahl();
  fireEvent.click(within(m).getByRole('menuitem', { name: punkt }));
  await warte();
}
const zuschnitt = () => screen.queryByRole('region', { name: 'Zuschnitt' });
async function bestaetige() {
  const z = await screen.findByRole('region', { name: 'Zuschnitt' });
  fireEvent.click(within(z).getByRole('button', { name: 'Bestätigen' }));
  await screen.findByRole('dialog', { name: 'Manueller Eintrag' });
  await vi.waitFor(() => expect(vorgemerkt()).not.toBeNull());
}
async function merkeVor(punkt = 'Aus Galerie auswählen') {
  await waehle(punkt);
  await bestaetige();
}
async function hinzufuegen() {
  await act(async () => {
    fireEvent.click(within(d()).getByRole('button', { name: 'Hinzufügen' }));
    await new Promise((r) => setTimeout(r, 30));
  });
}
const neue = (repo: ReturnType<typeof repoFake>) => [...repo.daten.values()].filter((b) => b.id !== MOMO.id);
async function androidZurueck() {
  await act(async () => {
    window.dispatchEvent(new PopStateEvent('popstate', { state: null }));
    await new Promise((r) => setTimeout(r, 20));
  });
}
async function zieheRunter() {
  const g = d().querySelector<HTMLElement>('[data-ziehgriff]')!;
  const o = { pointerId: 1, isPrimary: true, pointerType: 'touch', button: 0, buttons: 1, clientX: 200, clientY: 100 };
  fireEvent.pointerDown(g, o);
  for (const y of [200, 300, 500]) fireEvent.pointerMove(g, { ...o, clientY: y });
  fireEvent.pointerUp(g, { ...o, clientY: 500, buttons: 0 });
  await warte();
}

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

// ===========================================================================
describe('REQ-032 Cover beim manuellen Eintrag', () => {
  describe('AK-1 Antippen öffnet das Auswahlmenü', () => {
    it('[REQ-032/AK-1] ohne vorgemerktes Bild: „Scannen“, „Aus Galerie auswählen“, „Cover online suchen“, kein „Foto entfernen“', async () => {
      await zeige();
      await oeffneBlatt();
      expect(coverFeld().querySelector('img')).toBeNull();
      const m = await oeffneAuswahl();
      expect(within(m).getAllByRole('menuitem').map((e) => e.textContent?.trim())).toEqual([
        'Scannen',
        'Aus Galerie auswählen',
        'Cover online suchen',
      ]);
      expect(within(m).queryByRole('menuitem', { name: 'Foto entfernen' })).toBeNull();
    });

    it('[REQ-032/AK-1] das Menü schließt beim Tippen außerhalb wie in den Buchdetails, das Blatt bleibt', async () => {
      await zeige();
      await oeffneBlatt();
      gib('Titel', 'Testbuch');
      await oeffneAuswahl();
      fireEvent.click(document.querySelector('[data-menue-hintergrund]')!);
      await vi.waitFor(() => expect(auswahl()).toBeNull());
      expect(blatt()).toBeVisible();
      expect(feld('Titel').value).toBe('Testbuch');
    });
  });

  describe('AK-2 Bild erscheint im Feld', () => {
    it.each(['Aus Galerie auswählen', 'Scannen'])('[REQ-032/AK-2] „%s“ → Zuschnitt bestätigen → Blatt wieder sichtbar, Bild im Feld', async (punkt) => {
      const { q } = await zeige();
      await oeffneBlatt();
      await waehle(punkt);
      expect(punkt === 'Scannen' ? q.scannen : q.galerie).toHaveBeenCalledTimes(1);
      expect(zuschnitt()).not.toBeNull();
      await bestaetige();
      expect(blatt()).toBeVisible();
      expect(zuschnitt()).toBeNull();
      expect(vorgemerkt()).toMatch(/^data:image\//);
      expect(coverFeld().textContent).not.toContain('Cover hinzufügen');
    });

    it('[REQ-032/AK-2] ein zweites Bild ersetzt das vorgemerkte', async () => {
      const q = quelle(PNG.rot);
      await zeige({ q });
      await oeffneBlatt();
      await merkeVor();
      const erstes = vorgemerkt();
      q.aktuell = PNG.gruen;
      await merkeVor();
      await vi.waitFor(() => expect(vorgemerkt()).not.toBe(erstes));
      expect(coverFeld().querySelectorAll('img')).toHaveLength(1);
    });
  });

  describe('AK-3 Eingaben bleiben erhalten', () => {
    it('[REQ-032/AK-3] Cover hinzufügen: Titel und Autor bleiben eingetragen, nichts wird schon gespeichert', async () => {
      const { repo, s } = await zeige();
      await oeffneBlatt();
      gib('Titel', 'Testbuch');
      gib('Autor', 'Vorname Nachname');
      gib('Jahr', '2001');
      gib('Seiten', '320');
      await merkeVor();
      expect([feld('Titel').value, feld('Autor').value, feld('Jahr').value, feld('Seiten').value]).toEqual(['Testbuch', 'Vorname Nachname', '2001', '320']);
      expect(repo.save).not.toHaveBeenCalled();
      expect(s.put).not.toHaveBeenCalled();
    });

    it.each([
      ['Galerie abgebrochen', 'Aus Galerie auswählen', 'quelle'],
      ['Kamera abgebrochen', 'Scannen', 'quelle'],
      ['Zuschnitt mit Zurück verlassen', 'Aus Galerie auswählen', 'zuschnitt'],
    ])('[REQ-032/AK-3] %s: zurück im Blatt, Titel/Autor und vorgemerktes Bild unverändert', async (_w, punkt, abbruch) => {
      const q = quelle(PNG.rot);
      const { s } = await zeige({ q });
      await oeffneBlatt();
      gib('Titel', 'Testbuch');
      gib('Autor', 'Vorname Nachname');
      await merkeVor();
      const bild = vorgemerkt();
      q.aktuell = abbruch === 'quelle' ? null : PNG.gruen;
      await waehle(punkt);
      if (abbruch === 'zuschnitt') {
        const z = await screen.findByRole('region', { name: 'Zuschnitt' });
        fireEvent.click(within(z).getByRole('button', { name: 'Zurück' }));
        await warte();
      }
      expect(await screen.findByRole('dialog', { name: 'Manueller Eintrag' })).toBeVisible();
      expect(zuschnitt()).toBeNull();
      expect(feld('Titel').value).toBe('Testbuch');
      expect(feld('Autor').value).toBe('Vorname Nachname');
      expect(vorgemerkt()).toBe(bild);
      expect(s.put).not.toHaveBeenCalled();
    });

    it('[REQ-032/AK-3] Abbruch ohne vorgemerktes Bild: Feld zeigt weiter „Cover hinzufügen“', async () => {
      await zeige({ q: quelle(null) });
      await oeffneBlatt();
      gib('Titel', 'Testbuch');
      await waehle('Aus Galerie auswählen');
      expect(blatt()).toBeVisible();
      expect(vorgemerkt()).toBeNull();
      expect(coverFeld().textContent).toContain('Cover hinzufügen');
      expect(feld('Titel').value).toBe('Testbuch');
    });

    it('[REQ-032/AK-3] Android-Zurück im Zuschnitt führt ins Blatt zurück (nicht zur Seite „Bücher“), Eingaben bleiben', async () => {
      await zeige();
      await oeffneBlatt();
      gib('Titel', 'Testbuch');
      await waehle('Aus Galerie auswählen');
      expect(zuschnitt()).not.toBeNull();
      await androidZurueck();
      expect(zuschnitt()).toBeNull();
      expect(blatt()).toBeVisible();
      expect(feld('Titel').value).toBe('Testbuch');
      expect(vorgemerkt()).toBeNull();
    });
  });

  describe('AK-4 Zuschnitt beginnt im Cover-Format', () => {
    it.each(['Aus Galerie auswählen', 'Scannen'])('[REQ-032/AK-4] nach „%s“ startet der Zuschnitt mit Startformat „cover“', async (punkt) => {
      await zeige();
      await oeffneBlatt();
      await waehle(punkt);
      const z = await screen.findByRole('region', { name: 'Zuschnitt' });
      const fmt = z.getAttribute('data-startformat') ?? z.querySelector('[data-startformat]')?.getAttribute('data-startformat');
      expect(fmt).toBe('cover');
    });
  });

  describe('AK-5 „Foto entfernen“ bei vorgemerktem Bild', () => {
    it('[REQ-032/AK-5] mit vorgemerktem Bild bietet das Menü zusätzlich „Foto entfernen“', async () => {
      await zeige();
      await oeffneBlatt();
      await merkeVor();
      const m = await oeffneAuswahl();
      expect(within(m).getAllByRole('menuitem').map((e) => e.textContent?.trim())).toEqual([
        'Scannen',
        'Aus Galerie auswählen',
        'Cover online suchen',
        'Foto entfernen',
      ]);
    });

    it('[REQ-032/AK-5] „Foto entfernen“: Feld zeigt wieder Kamera-Icon und „Cover hinzufügen“; angelegtes Buch hat kein Frontcover', async () => {
      const repo = repoFake();
      const s = speicherFake();
      await zeige({ repo, s });
      await oeffneBlatt();
      const leer = coverFeld().innerHTML;
      gib('Titel', 'Testbuch');
      await merkeVor();
      await waehle('Foto entfernen');
      await vi.waitFor(() => expect(vorgemerkt()).toBeNull());
      expect(auswahl()).toBeNull();
      expect(coverFeld().textContent).toContain('Cover hinzufügen');
      expect(coverFeld().querySelector('[data-icon]')?.getAttribute('data-icon')).toMatch(/kamera/);
      expect(coverFeld().innerHTML).toBe(leer);
      expect(feld('Titel').value).toBe('Testbuch');
      await hinzufuegen();
      const [b] = neue(repo);
      expect(b).toBeDefined();
      expect(s.put).not.toHaveBeenCalled();
      expect(s.daten.get(`${b.id}|cover`)).toBeUndefined();
      expect(b.cover).toBeUndefined();
      const details = await screen.findByRole('region', { name: 'Buchdetails' });
      expect(details.querySelector('[data-bereich="cover"] img')).toBeNull();
    });
  });

  describe('AK-6 „Cover online suchen“ ohne Funktion', () => {
    it.each([false, true])('[REQ-032/AK-6] Antippen: keine Online-Suche, keine Bildquelle, Feld unverändert (Bild vorgemerkt: %s)', async (mitBild) => {
      const fetchSpy = vi.fn();
      vi.stubGlobal('fetch', fetchSpy);
      const openSpy = vi.spyOn(window, 'open').mockImplementation(() => null);
      const q = quelle();
      const { s } = await zeige({ q });
      await oeffneBlatt();
      gib('Titel', 'Testbuch');
      if (mitBild) await merkeVor();
      q.scannen.mockClear();
      q.galerie.mockClear();
      const vorher = coverFeld().innerHTML;
      await waehle('Cover online suchen');
      expect(fetchSpy).not.toHaveBeenCalled();
      expect(openSpy).not.toHaveBeenCalled();
      expect(q.scannen).not.toHaveBeenCalled();
      expect(q.galerie).not.toHaveBeenCalled();
      expect(zuschnitt()).toBeNull();
      expect(screen.queryByRole('region', { name: 'Kamera' })).toBeNull();
      expect(s.put).not.toHaveBeenCalled();
      if (auswahl()) fireEvent.click(document.querySelector('[data-menue-hintergrund]')!);
      await vi.waitFor(() => expect(auswahl()).toBeNull());
      expect(blatt()).toBeVisible();
      expect(coverFeld().innerHTML).toBe(vorher);
      expect(feld('Titel').value).toBe('Testbuch');
    });
  });

  describe('AK-7 Bild wird Frontcover', () => {
    it('[REQ-032/AK-7] Hinzufügen: Buchdetails zeigen das Bild im Bereich „Cover“, Speicher hat es unter der neuen ID', async () => {
      const repo = repoFake();
      const s = speicherFake();
      await zeige({ repo, s });
      await oeffneBlatt();
      gib('Titel', 'Testbuch');
      await merkeVor();
      const bild = vorgemerkt();
      await hinzufuegen();
      const [b] = neue(repo);
      expect(b).toBeDefined();
      expect(s.put).toHaveBeenCalledTimes(1);
      expect(s.put).toHaveBeenCalledWith(b.id, 'cover', bild);
      const details = await screen.findByRole('region', { name: 'Buchdetails' });
      await vi.waitFor(() => expect(details.querySelector('[data-bereich="cover"] img')?.getAttribute('src')).toBe(bild));
      expect(details.querySelector('[data-bereich="ruecken"] img')).toBeNull();
      expect(details.querySelector('[data-bereich="schnitt"] img')).toBeNull();
    });

    it('[REQ-032/AK-7] im Abschnitt „Noch zu lesen“ erscheint das Bild statt des Cover-Platzhalters', async () => {
      const repo = repoFake();
      await zeige({ repo });
      await oeffneBlatt();
      gib('Titel', 'Testbuch');
      await merkeVor();
      const bild = vorgemerkt();
      await hinzufuegen();
      fireEvent.click(within(await screen.findByRole('region', { name: 'Buchdetails' })).getByRole('button', { name: 'Zurück' }));
      const region = await screen.findByRole('region', { name: 'Noch zu lesen' });
      const eintrag = () =>
        within(region)
          .queryAllByRole('listitem')
          .find((l) => l.querySelector('[data-buchtitel]')?.textContent?.trim() === 'Testbuch');
      await vi.waitFor(() => expect(eintrag()?.querySelector('img')?.getAttribute('src')).toBe(bild));
      expect(eintrag()!.querySelector('[data-cover-platzhalter]')).toBeNull();
      // Gegenprobe: das andere Buch behält den Platzhalter
      const momo = within(region).getAllByRole('listitem').find((l) => l.textContent?.includes(MOMO.titel))!;
      expect(momo.querySelector('img')).toBeNull();
    });

    it('[REQ-032/AK-7] nach einem Neustart (neue Speicher-Instanzen auf derselben IndexedDB) ist das Bild weiterhin vorhanden', async () => {
      vi.stubGlobal('indexedDB', new IDBFactory());
      vi.stubGlobal('IDBKeyRange', IDBKeyRange);
      vi.resetModules();
      const st1 = (await import('@/storage')) as typeof import('@/storage');
      await zeige({ repo: st1.createBookRepository(), s: st1.createImageStore() });
      await oeffneBlatt();
      gib('Titel', 'Coverbuch');
      await merkeVor();
      const bild = vorgemerkt();
      await hinzufuegen();
      await screen.findByRole('region', { name: 'Buchdetails' });
      cleanup();
      vi.resetModules();
      const st2 = (await import('@/storage')) as typeof import('@/storage');
      const repo2 = st2.createBookRepository();
      const s2 = st2.createImageStore();
      const b = (await repo2.list()).find((x) => x.titel === 'Coverbuch');
      expect(b).toBeDefined();
      expect(await s2.get(b!.id, 'cover')).toBe(bild);
      await zeige({ repo: repo2, s: s2 });
      const region = screen.getByRole('region', { name: 'Noch zu lesen' });
      await vi.waitFor(() => {
        const li = within(region)
          .queryAllByRole('listitem')
          .find((l) => l.querySelector('[data-buchtitel]')?.textContent?.trim() === 'Coverbuch');
        expect(li?.querySelector('img')?.getAttribute('src')).toBe(bild);
      });
    });
  });

  describe('AK-8 Schließen ohne „Hinzufügen“ verwirft das Bild', () => {
    it.each([
      ['X', async () => fireEvent.click(within(d()).getByRole('button', { name: 'Schließen' }))],
      ['Android-Zurück-Taste', androidZurueck],
      ['Herunterziehen am Ziehgriff', zieheRunter],
    ])('[REQ-032/AK-8] Bild vorgemerkt, Schließen per %s: weder Buch noch Bild gespeichert', async (_w, schliessen) => {
      const repo = repoFake();
      const s = speicherFake();
      await zeige({ repo, s });
      await oeffneBlatt();
      gib('Titel', 'Testbuch');
      await merkeVor();
      await schliessen();
      await warte();
      expect(blatt()).toBeNull();
      expect(screen.getByRole('heading', { name: 'Deine Bücher' })).toBeVisible();
      expect(repo.save).not.toHaveBeenCalled();
      expect(s.put).not.toHaveBeenCalled();
      expect([...s.daten.keys()]).toEqual([]);
      // Erneut geöffnet: kein Bild mehr vorgemerkt
      await oeffneBlatt();
      expect(vorgemerkt()).toBeNull();
      expect(coverFeld().textContent).toContain('Cover hinzufügen');
    });
  });
});
