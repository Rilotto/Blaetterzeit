/**
 * Akzeptanztests REQ-015 – Auswahlmenü beim Antippen eines Bereichs der Buchdarstellung.
 *
 * Abgeleitet aus dem REQ-Text und der Schnittstellen-Absprache (sprints/sprint-03/plan.md, Runde 1):
 *  - role="menu" aria-label="Bild hinzufügen", Einträge role="menuitem": „Scannen“,
 *    „Aus Galerie auswählen“, „Cover online suchen“; mit Bild zusätzlich „Foto entfernen“
 *  - Klick auf data-menue-hintergrund schließt das Menü
 *  - Icons selbst nachgebildet in src/assets/icons/
 *  - Kamera: <section aria-label="Kamera"> mit „Zurück“ und „Foto aufnehmen“
 *  - Zuschnitt: <section aria-label="Zuschnitt"> mit „Zurück“ und Bestätigung laut REQ-017
 *  - Bildquelle { scannen(), galerie() } → Data-URL | null; ImageStore { get, put, remove }
 * Bildquelle und ImageStore sind Test-Doubles (Props von BuchDetails).
 */
import '@testing-library/jest-dom/vitest';
import { act, cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import type { CSSProperties } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import BuchDetails from '@/views/BuchDetails';
import type { Bildquelle } from '@/bild/bildquelle';
import type { ImageStore } from '@/storage/ImageStore';
import { farbVariablen } from '@/theme';

const T = vi.hoisted(() => ({
  buecher: [{ id: '15000000-0000-4000-8000-000000000001', titel: 'Momo', status: 'ungelesen' as const }],
}));
vi.mock('@/buecher/demodaten', () => ({ demoBuecher: T.buecher }));
const BUCH = T.buecher[0];

const PNG = {
  rot: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAIAAACQd1PeAAAADElEQVR4nGP4z8AAAAMBAQDJ/pLvAAAAAElFTkSuQmCC',
  gruen: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAIAAACQd1PeAAAADElEQVR4nGNgaGAAAAEEAIFw9selAAAAAElFTkSuQmCC',
  blau: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAIAAACQd1PeAAAADElEQVR4nGNgYPgPAAEDAQAIicLsAAAAAElFTkSuQmCC',
  gelb: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAIAAACQd1PeAAAADElEQVR4nGP4/58BAAT/Af9dfQKHAAAAAElFTkSuQmCC',
};
type Bereich = 'ruecken' | 'cover' | 'schnitt';
const BEREICHE: Bereich[] = ['ruecken', 'cover', 'schnitt'];
const OPTIONEN = ['Scannen', 'Aus Galerie auswählen', 'Cover online suchen'];

type FsLike = { existsSync(p: URL): boolean; readFileSync(p: URL, enc: 'utf8'): string };
const NODE_FS = 'node:fs';
const NODE_URL = 'node:url';
const NODE_PROCESS = 'node:process';
const fs = (await import(/* @vite-ignore */ NODE_FS)) as FsLike;
const { pathToFileURL } = (await import(/* @vite-ignore */ NODE_URL)) as { pathToFileURL(p: string): URL };
const { cwd } = (await import(/* @vite-ignore */ NODE_PROCESS)) as { cwd(): string };
const ROOT = pathToFileURL(`${cwd()}/`);

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

// --------------------------------------------------------------------------- Hilfen
function speicher(bilder: Partial<Record<Bereich, string>> = {}) {
  const daten = new Map<string, string>(Object.entries(bilder).map(([b, u]) => [`${BUCH.id}|${b}`, u!]));
  const s = {
    daten,
    get: async (buchId: string, bereich: string) => daten.get(`${buchId}|${bereich}`),
    put: async (buchId: string, bereich: string, dataUrl: string) => void daten.set(`${buchId}|${bereich}`, dataUrl),
    remove: async (buchId: string, bereich: string) => void daten.delete(`${buchId}|${bereich}`),
  };
  return s as typeof s & ImageStore;
}
const bild = (s: ReturnType<typeof speicher>, b: Bereich) => s.daten.get(`${BUCH.id}|${b}`);
function quelle(scan: string | null = PNG.gelb, gal: string | null = PNG.gelb) {
  return { scannen: vi.fn(async () => scan), galerie: vi.fn(async () => gal) } satisfies Bildquelle;
}
/** `q` null: Standard-Bildquelle der App (kein Test-Double). */
async function zeige(bilder: Partial<Record<Bereich, string>> = {}, q: ReturnType<typeof quelle> | Bildquelle | null = quelle()) {
  const s = speicher(bilder);
  render(
    <div style={farbVariablen() as CSSProperties}>
      <BuchDetails buchId={BUCH.id} bildquelle={q ?? undefined} bildspeicher={s} onZurueck={() => {}} />
    </div>,
  );
  await screen.findByRole('region', { name: 'Buchdetails' });
  await vi.waitFor(() => expect(document.querySelectorAll('[data-bereich]')).toHaveLength(3));
  for (const b of Object.keys(bilder) as Bereich[]) {
    await vi.waitFor(() => expect(bereich(b).querySelector('img[data-bereich-bild]')).not.toBeNull());
  }
  return { s, q: q as ReturnType<typeof quelle> };
}
const details = () => screen.queryByRole('region', { name: 'Buchdetails' });
function bereich(b: Bereich) {
  const el = document.querySelector<HTMLElement>(`[data-bereich="${b}"]`);
  expect(el, `Bereich ${b}`).not.toBeNull();
  return el!;
}
const menue = () => screen.queryByRole('menu', { name: 'Bild hinzufügen' });
async function oeffne(b: Bereich) {
  fireEvent.click(bereich(b));
  return screen.findByRole('menu', { name: 'Bild hinzufügen' });
}
const eintraege = () => within(menue()!).getAllByRole('menuitem');
const namen = () => eintraege().map((e) => e.textContent?.replace(/\s+/g, ' ').trim());
const waehle = (name: string) => fireEvent.click(within(menue()!).getByRole('menuitem', { name }));
async function bestaetige() {
  const z = await screen.findByRole('region', { name: 'Zuschnitt' });
  const ok = within(z)
    .getAllByRole('button')
    .filter((b) => !/^Zurück$/.test(b.getAttribute('aria-label') ?? b.textContent ?? ''))
    .filter((b) => !b.hasAttribute('data-eckpunkt'));
  expect(ok, 'genau eine Bestätigen-Schaltfläche im Zuschnitt').toHaveLength(1);
  fireEvent.click(ok[0]);
  await vi.waitFor(() => expect(screen.queryByRole('region', { name: 'Zuschnitt' })).toBeNull());
}
/** Zustand der Bereiche (Darstellung) für Unverändert-Vergleiche. */
const darstellung = () => BEREICHE.map((b) => bereich(b).innerHTML);

// ===========================================================================
describe('REQ-015 Auswahlmenü beim Antippen eines Bereichs', () => {
  describe('AK-1 Menü öffnet sich für jeden der drei Bereiche', () => {
    it('[REQ-015/AK-1] nacheinander Buchrücken, Cover, Schnitt: jeweils genau die drei Optionen, ohne „Foto entfernen“', async () => {
      await zeige();
      for (const b of BEREICHE) {
        expect(menue()).toBeNull();
        await oeffne(b);
        expect(namen()).toEqual(OPTIONEN);
        expect(within(menue()!).queryByRole('menuitem', { name: /Foto entfernen/ })).toBeNull();
        fireEvent.click(document.querySelector('[data-menue-hintergrund]')!);
        await vi.waitFor(() => expect(menue()).toBeNull());
      }
    });

    it('[REQ-015/AK-1] jede Option hat ein Icon', async () => {
      await zeige();
      await oeffne('cover');
      for (const e of eintraege()) expect(e.querySelector('[data-icon]'), e.textContent!).not.toBeNull();
    });

    it('[REQ-015/AK-1] bloßes Öffnen ruft weder Kamera noch Galerie auf und ändert nichts', async () => {
      const { s, q } = await zeige();
      await oeffne('ruecken');
      expect(q.scannen).not.toHaveBeenCalled();
      expect(q.galerie).not.toHaveBeenCalled();
      expect(s.daten.size).toBe(0);
    });
  });

  describe('AK-2 Bei vorhandenem Bild zusätzlich „Foto entfernen“', () => {
    it.each(BEREICHE)('[REQ-015/AK-2] Bild in %s: Menü mit den drei Optionen und „Foto entfernen“ mit X-Icon', async (b) => {
      await zeige({ [b]: PNG.rot });
      await oeffne(b);
      expect(namen()).toEqual(expect.arrayContaining([...OPTIONEN, 'Foto entfernen']));
      expect(namen()).toHaveLength(4);
      const icon = within(menue()!).getByRole('menuitem', { name: 'Foto entfernen' }).querySelector('[data-icon]');
      expect(icon).not.toBeNull();
      expect(icon!.getAttribute('data-icon')).toMatch(/(^|[-_])(x|kreuz|schliessen|schließen|close|entfernen)([-_.]|$)/i);
    });

    it('[REQ-015/AK-2] Negativfall: Bild nur im Cover → Menü von Buchrücken ohne „Foto entfernen“', async () => {
      await zeige({ cover: PNG.rot });
      await oeffne('ruecken');
      expect(namen()).toEqual(OPTIONEN);
    });
  });

  describe('AK-3 „Scannen“ startet die Kameraansicht', () => {
    it.each(BEREICHE)('[REQ-015/AK-3] %s: „Scannen“ → Kameraansicht der App (Standard-Bildquelle), Menü geschlossen', async (b) => {
      await zeige({}, null);
      await oeffne(b);
      waehle('Scannen');
      expect(await screen.findByRole('region', { name: 'Kamera' })).toBeInTheDocument();
      expect(menue()).toBeNull();
    });

    it('[REQ-015/AK-3] „Scannen“ nutzt die Kamera-Bildquelle, nicht die Galerie', async () => {
      const q = { scannen: vi.fn(() => new Promise<string | null>(() => {})), galerie: vi.fn(async () => null) };
      await zeige({}, q);
      await oeffne('cover');
      waehle('Scannen');
      const k = screen.queryByRole('region', { name: 'Kamera' });
      if (k) {
        const b = within(k).getByRole('button', { name: 'Foto aufnehmen' });
        await vi.waitFor(() => expect(b).toBeEnabled());
        fireEvent.click(b);
      }
      await vi.waitFor(() => expect(q.scannen).toHaveBeenCalledTimes(1));
      expect(menue()).toBeNull();
      expect(q.galerie).not.toHaveBeenCalled();
    });
  });

  describe('AK-4 „Aus Galerie auswählen“ startet die Galerie', () => {
    it.each(BEREICHE)('[REQ-015/AK-4] %s: Galerie wird genau einmal aufgerufen, Menü geschlossen', async (b) => {
      const q = { scannen: vi.fn(async () => null), galerie: vi.fn(() => new Promise<string | null>(() => {})) };
      await zeige({}, q);
      await oeffne(b);
      waehle('Aus Galerie auswählen');
      await vi.waitFor(() => expect(q.galerie).toHaveBeenCalledTimes(1));
      expect(menue()).toBeNull();
      expect(q.scannen).not.toHaveBeenCalled();
      expect(screen.queryByRole('region', { name: 'Kamera' })).toBeNull();
    });
  });

  describe('AK-5 „Cover online suchen“ sichtbar, aber ohne Funktion', () => {
    it.each([{}, { cover: PNG.rot }])('[REQ-015/AK-5] Antippen: keine Online-Suche, keine Bildquelle, Bild unverändert (%o)', async (bilder) => {
      const fetchSpy = vi.fn();
      vi.stubGlobal('fetch', fetchSpy);
      const openSpy = vi.spyOn(window, 'open').mockImplementation(() => null);
      try {
        const { s, q } = await zeige(bilder);
        const vorher = darstellung();
        const vorherDaten = new Map(s.daten);
        await oeffne('cover');
        waehle('Cover online suchen');
        await act(async () => {
          await new Promise((r) => setTimeout(r, 20));
        });
        expect(fetchSpy).not.toHaveBeenCalled();
        expect(openSpy).not.toHaveBeenCalled();
        expect(q.scannen).not.toHaveBeenCalled();
        expect(q.galerie).not.toHaveBeenCalled();
        expect(s.daten).toEqual(vorherDaten);
        expect(screen.queryByRole('region', { name: 'Kamera' })).toBeNull();
        expect(screen.queryByRole('region', { name: 'Zuschnitt' })).toBeNull();
        if (menue()) fireEvent.click(document.querySelector('[data-menue-hintergrund]')!);
        await vi.waitFor(() => expect(menue()).toBeNull());
        expect(darstellung()).toEqual(vorher);
      } finally {
        vi.unstubAllGlobals();
      }
    });
  });

  describe('AK-6 „Foto entfernen“ löscht das Bild', () => {
    it('[REQ-015/AK-6] Cover entfernen: Menü zu, Cover wieder mit Titel, Rücken und Schnitt unverändert', async () => {
      const { s } = await zeige({ ruecken: PNG.rot, cover: PNG.gruen, schnitt: PNG.blau });
      const rs = [bereich('ruecken').innerHTML, bereich('schnitt').innerHTML];
      await oeffne('cover');
      waehle('Foto entfernen');
      await vi.waitFor(() => expect(bereich('cover').querySelector('[data-cover-titel]')).not.toBeNull());
      expect(menue()).toBeNull();
      expect(bereich('cover').querySelector('img')).toBeNull();
      expect(bereich('cover').querySelector('[data-cover-titel]')!.textContent?.trim()).toBe(BUCH.titel);
      expect(bild(s, 'cover')).toBeUndefined();
      expect(bild(s, 'ruecken')).toBe(PNG.rot);
      expect(bild(s, 'schnitt')).toBe(PNG.blau);
      expect([bereich('ruecken').innerHTML, bereich('schnitt').innerHTML]).toEqual(rs);
    });

    it.each([
      ['ruecken', 'Buchrücken +'],
      ['schnitt', 'Schnitt +'],
    ] as const)('[REQ-015/AK-6] auch %s: nach dem Entfernen wieder Beschriftung „%s“', async (b, text) => {
      const { s } = await zeige({ [b]: PNG.rot, cover: PNG.gruen });
      await oeffne(b);
      waehle('Foto entfernen');
      await vi.waitFor(() => expect(bereich(b).querySelector('[data-bereich-beschriftung]')).not.toBeNull());
      expect(bereich(b).querySelector('[data-bereich-beschriftung]')!.textContent?.replace(/\s+/g, ' ').trim()).toBe(text);
      expect(bild(s, b)).toBeUndefined();
      expect(bild(s, 'cover')).toBe(PNG.gruen);
    });

    it('[REQ-015/AK-6] nach dem Entfernen bietet das Menü kein „Foto entfernen“ mehr an', async () => {
      await zeige({ cover: PNG.gruen });
      await oeffne('cover');
      waehle('Foto entfernen');
      await vi.waitFor(() => expect(menue()).toBeNull());
      await vi.waitFor(() => expect(bereich('cover').querySelector('img')).toBeNull());
      await oeffne('cover');
      expect(namen()).toEqual(OPTIONEN);
    });
  });

  describe('AK-7 Schließen durch Tippen außerhalb', () => {
    it.each([{}, { cover: PNG.rot }])('[REQ-015/AK-7] Tippen auf den Hintergrund schließt das Menü, nichts ändert sich (%o)', async (bilder) => {
      const { s, q } = await zeige(bilder);
      const vorher = darstellung();
      const vorherDaten = new Map(s.daten);
      await oeffne('cover');
      const h = document.querySelector<HTMLElement>('[data-menue-hintergrund]');
      expect(h).not.toBeNull();
      expect(menue()!.contains(h)).toBe(false);
      fireEvent.pointerDown(h!);
      fireEvent.click(h!);
      await vi.waitFor(() => expect(menue()).toBeNull());
      expect(document.querySelector('[data-menue-hintergrund]')).toBeNull();
      expect(darstellung()).toEqual(vorher);
      expect(s.daten).toEqual(vorherDaten);
      expect(q.scannen).not.toHaveBeenCalled();
      expect(q.galerie).not.toHaveBeenCalled();
      expect(details()).not.toBeNull();
    });

    it('[REQ-015/AK-7] Negativfall: Tippen in das Menüfeld selbst (nicht auf eine Option) schließt es nicht', async () => {
      await zeige();
      await oeffne('cover');
      fireEvent.click(menue()!);
      expect(menue()).not.toBeNull();
    });
  });

  describe('AK-8 Bild landet im richtigen Bereich', () => {
    it.each([
      ['Aus Galerie auswählen', 'galerie'],
      ['Scannen', 'kamera'],
    ] as const)('[REQ-015/AK-8] Menü über „Schnitt“, Bild per „%s“, Zuschnitt bestätigt → nur Schnitt hat das Bild', async (option, weg) => {
      const { s } = await zeige({ cover: PNG.gruen });
      const vorher = [bereich('ruecken').innerHTML, bereich('cover').innerHTML];
      await oeffne('schnitt');
      waehle(option);
      const k = weg === 'kamera' ? screen.queryByRole('region', { name: 'Kamera' }) : null;
      if (k) {
        const b = within(k).getByRole('button', { name: 'Foto aufnehmen' });
        await vi.waitFor(() => expect(b).toBeEnabled());
        fireEvent.click(b);
      }
      await bestaetige();
      await vi.waitFor(() => expect(bereich('schnitt').querySelector('img[data-bereich-bild]')).not.toBeNull());
      expect(bild(s, 'schnitt')).toEqual(expect.stringMatching(/^data:image\//));
      expect(bereich('schnitt').querySelector('img')!.getAttribute('src')).toBe(bild(s, 'schnitt'));
      expect(bild(s, 'ruecken')).toBeUndefined();
      expect(bild(s, 'cover')).toBe(PNG.gruen);
      expect([bereich('ruecken').innerHTML, bereich('cover').innerHTML]).toEqual(vorher);
    });

    it('[REQ-015/AK-8] zweimal hintereinander: erst Buchrücken, dann Cover – jeder Bereich bekommt sein Bild', async () => {
      const { s } = await zeige();
      await oeffne('ruecken');
      waehle('Aus Galerie auswählen');
      await bestaetige();
      await vi.waitFor(() => expect(bild(s, 'ruecken')).toBeDefined());
      await oeffne('cover');
      waehle('Aus Galerie auswählen');
      await bestaetige();
      await vi.waitFor(() => expect(bild(s, 'cover')).toBeDefined());
      expect(bild(s, 'schnitt')).toBeUndefined();
      expect([...s.daten.keys()].sort()).toEqual([`${BUCH.id}|cover`, `${BUCH.id}|ruecken`]);
    });
  });

  describe('AK-9 Icons nachgebildet, nicht aus einer Bibliothek', () => {
    it('[REQ-015/AK-9] jedes Menü-Icon ist eine im Projekt abgelegte Datei in src/assets/icons/', async () => {
      await zeige({ cover: PNG.rot });
      await oeffne('cover');
      const dateien = eintraege().map((e) => e.querySelector('[data-icon]')!.getAttribute('data-icon')!);
      expect(new Set(dateien).size, 'vier verschiedene Icons').toBe(4);
      for (const d of dateien) {
        expect(fs.existsSync(new URL(`src/assets/icons/${d}`, ROOT)), d).toBe(true);
      }
    });

    it('[REQ-015/AK-9] keine externe Icon-Bibliothek in den Abhängigkeiten', () => {
      const pkg = JSON.parse(fs.readFileSync(new URL('package.json', ROOT), 'utf8')) as Record<string, Record<string, string> | undefined>;
      const alle = Object.keys({ ...pkg.dependencies, ...pkg.devDependencies });
      expect(alle.filter((n) => /icon|lucide|fontawesome|heroicons|material-symbols|phosphor|tabler|feather|ionicons/i.test(n))).toEqual([]);
    });
  });
});
