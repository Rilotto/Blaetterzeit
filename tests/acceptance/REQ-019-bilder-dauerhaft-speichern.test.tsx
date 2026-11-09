/**
 * Akzeptanztests REQ-019 – Bilder dauerhaft speichern.
 *
 * Abgeleitet aus dem REQ-Text und der Schnittstellen-Absprache (sprints/sprint-03/plan.md, Runde 1):
 *  - ImageStore { get, put, remove } in src/storage/ImageStore.ts; Auswahl der Implementierung
 *    zentral in src/storage/index.ts (createImageStore); im Web IndexedDB, sonst Arbeitsspeicher
 *  - BuchDetails-Props { buchId, bildquelle?, bildspeicher?, onZurueck }
 *
 * „Neustart“ wird in jsdom auf zwei Arten nachgestellt:
 *  1. Buchdetails werden mit demselben ImageStore neu aufgebaut (neue Komponente, kein Zustand übrig).
 *  2. Die zentrale Web-Implementierung wird nach dem Speichern neu erzeugt (neue Instanz, neu geladene
 *     Module) und liest aus derselben IndexedDB (fake-indexeddb).
 * Echte App-Neustarts auf dem Gerät (SQLite + Dateien) stehen in der manuellen Prüfliste.
 */
import '@testing-library/jest-dom/vitest';
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { IDBFactory } from 'fake-indexeddb';
import { afterEach, describe, expect, it, vi } from 'vitest';
import BuchDetails from '@/views/BuchDetails';
import type { Bildquelle } from '@/bild/bildquelle';
import type { ImageStore } from '@/storage/ImageStore';

const T = vi.hoisted(() => ({
  buecher: [
    { id: '19000000-0000-4000-8000-000000000001', titel: 'Momo', status: 'ungelesen' as const },
    { id: '19000000-0000-4000-8000-000000000002', titel: 'Krabat', status: 'ungelesen' as const },
  ],
}));
vi.mock('@/buecher/demodaten', () => ({ demoBuecher: T.buecher }));
const [A, B] = T.buecher;

const PNG = {
  rot: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAIAAACQd1PeAAAADElEQVR4nGP4z8AAAAMBAQDJ/pLvAAAAAElFTkSuQmCC',
  gruen: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAIAAACQd1PeAAAADElEQVR4nGNgaGAAAAEEAIFw9selAAAAAElFTkSuQmCC',
  blau: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAIAAACQd1PeAAAADElEQVR4nGNgYPgPAAEDAQAIicLsAAAAAElFTkSuQmCC',
  gelb: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAIAAACQd1PeAAAADElEQVR4nGP4/58BAAT/Af9dfQKHAAAAAElFTkSuQmCC',
};
type Bereich = 'ruecken' | 'cover' | 'schnitt';
const BEREICHE: Bereich[] = ['ruecken', 'cover', 'schnitt'];

type FsLike = { existsSync(p: URL): boolean; readFileSync(p: URL, enc: 'utf8'): string; readdirSync(p: URL, o: { withFileTypes: true }): { name: string; isDirectory(): boolean }[] };
const NODE_FS = 'node:fs';
const NODE_URL = 'node:url';
const NODE_PROCESS = 'node:process';
const fs = (await import(/* @vite-ignore */ NODE_FS)) as FsLike;
const { pathToFileURL } = (await import(/* @vite-ignore */ NODE_URL)) as { pathToFileURL(p: string): URL };
const { cwd } = (await import(/* @vite-ignore */ NODE_PROCESS)) as { cwd(): string };
const SRC = new URL('src/', pathToFileURL(`${cwd()}/`));
function walk(dir: URL): URL[] {
  if (!fs.existsSync(dir)) return [];
  const out: URL[] = [];
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (e.isDirectory()) out.push(...walk(new URL(`${e.name}/`, dir)));
    else out.push(new URL(e.name, dir));
  }
  return out;
}

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

// --------------------------------------------------------------------------- Hilfen
/** Ein „Gerätespeicher“, der Neustarts überdauert: Daten liegen außerhalb der Komponente. */
function speicher() {
  const daten = new Map<string, string>();
  const s = {
    daten,
    get: async (buchId: string, bereich: string) => daten.get(`${buchId}|${bereich}`),
    put: async (buchId: string, bereich: string, dataUrl: string) => void daten.set(`${buchId}|${bereich}`, dataUrl),
    remove: async (buchId: string, bereich: string) => void daten.delete(`${buchId}|${bereich}`),
  };
  return s as typeof s & ImageStore;
}
async function starte(buchId: string, s: ImageStore, neu: string | null = null) {
  const q: Bildquelle = { scannen: async () => neu, galerie: async () => neu };
  render(<BuchDetails buchId={buchId} bildquelle={q} bildspeicher={s} onZurueck={() => {}} />);
  const d = await screen.findByRole('region', { name: 'Buchdetails' });
  await vi.waitFor(() => expect(d.querySelector('[data-buchdetails-titel]')).not.toBeNull());
  // Ladevorgang aus dem Speicher abwarten
  await new Promise((r) => setTimeout(r, 10));
  return d;
}
/** App beenden: Komponente vollständig abbauen. */
const beenden = () => cleanup();
function bereich(b: Bereich) {
  const el = document.querySelector<HTMLElement>(`[data-bereich="${b}"]`);
  expect(el, `Bereich ${b}`).not.toBeNull();
  return el!;
}
const bildIn = (b: Bereich) => bereich(b).querySelector('img[data-bereich-bild]')?.getAttribute('src') ?? null;
async function hinterlege(b: Bereich) {
  fireEvent.click(bereich(b));
  const m = await screen.findByRole('menu', { name: 'Bild hinzufügen' });
  fireEvent.click(within(m).getByRole('menuitem', { name: 'Aus Galerie auswählen' }));
  const z = await screen.findByRole('region', { name: 'Zuschnitt' });
  const ok = within(z)
    .getAllByRole('button')
    .filter((x) => (x.getAttribute('aria-label') ?? x.textContent?.trim()) !== 'Zurück' && !x.hasAttribute('data-eckpunkt'));
  expect(ok).toHaveLength(1);
  fireEvent.click(ok[0]);
  await vi.waitFor(() => expect(bildIn(b)).not.toBeNull());
}
async function entferne(b: Bereich) {
  fireEvent.click(bereich(b));
  const m = await screen.findByRole('menu', { name: 'Bild hinzufügen' });
  fireEvent.click(within(m).getByRole('menuitem', { name: 'Foto entfernen' }));
  await vi.waitFor(() => expect(bildIn(b)).toBeNull());
}
/** Zentrale Bild-Speicherimplementierung nach einem „Neustart“ (frisch geladene Module). */
async function zentralerSpeicher(): Promise<ImageStore> {
  vi.resetModules();
  const { createImageStore } = await import('@/storage');
  return createImageStore();
}

// ===========================================================================
describe('REQ-019 Bilder dauerhaft speichern', () => {
  describe('AK-1 Bild übersteht Neustart', () => {
    it('[REQ-019/AK-1] Cover hinterlegen, App beenden, neu starten → Cover zeigt dasselbe Bild', async () => {
      const s = speicher();
      await starte(A.id, s, PNG.gruen);
      await hinterlege('cover');
      const gezeigt = bildIn('cover');
      beenden();
      await starte(A.id, s);
      await vi.waitFor(() => expect(bildIn('cover')).toBe(gezeigt));
      expect(bereich('cover').querySelector('[data-cover-titel]')).toBeNull();
    });

    it('[REQ-019/AK-1] das Bild wird beim Bestätigen sofort im Speicher abgelegt (nicht erst beim Beenden)', async () => {
      const s = speicher();
      await starte(A.id, s, PNG.gruen);
      await hinterlege('cover');
      expect(s.daten.get(`${A.id}|cover`)).toBe(bildIn('cover'));
    });

    it('[REQ-019/AK-1] Web: die zentrale Implementierung behält ein Bild über eine neue Instanz hinweg (IndexedDB)', async () => {
      vi.stubGlobal('indexedDB', new IDBFactory());
      const vorher = await zentralerSpeicher();
      await vorher.put(A.id, 'cover', PNG.rot);
      const nachher = await zentralerSpeicher();
      expect(nachher).not.toBe(vorher);
      expect(await nachher.get(A.id, 'cover')).toBe(PNG.rot);
    });
  });

  describe('AK-2 Alle drei Bereiche, richtige Zuordnung', () => {
    it('[REQ-019/AK-2] zwei Bücher, verschiedene Bereiche: nach Neustart genau die eigenen Bilder an genau ihrer Stelle', async () => {
      const s = speicher();
      await starte(A.id, s, PNG.rot);
      await hinterlege('ruecken');
      await hinterlege('cover');
      beenden();
      await starte(B.id, s, PNG.blau);
      await hinterlege('schnitt');
      beenden();

      await starte(A.id, s);
      await vi.waitFor(() => expect(bildIn('ruecken')).not.toBeNull());
      expect(bildIn('ruecken')).toBe(s.daten.get(`${A.id}|ruecken`));
      expect(bildIn('cover')).toBe(s.daten.get(`${A.id}|cover`));
      expect(bildIn('schnitt')).toBeNull();
      beenden();

      await starte(B.id, s);
      await vi.waitFor(() => expect(bildIn('schnitt')).not.toBeNull());
      expect(bildIn('schnitt')).toBe(s.daten.get(`${B.id}|schnitt`));
      expect(bildIn('ruecken')).toBeNull();
      expect(bildIn('cover')).toBeNull();
    });

    it('[REQ-019/AK-2] Web: zentrale Implementierung ordnet Buch und Bereich nach Neustart richtig zu', async () => {
      vi.stubGlobal('indexedDB', new IDBFactory());
      const s1 = await zentralerSpeicher();
      await s1.put(A.id, 'ruecken', PNG.rot);
      await s1.put(A.id, 'cover', PNG.gruen);
      await s1.put(B.id, 'schnitt', PNG.blau);
      const s2 = await zentralerSpeicher();
      const ist = await Promise.all([A.id, B.id].flatMap((id) => BEREICHE.map((b) => s2.get(id, b))));
      expect(ist).toEqual([PNG.rot, PNG.gruen, undefined, undefined, undefined, PNG.blau]);
    });
  });

  describe('AK-3 Ersetztes Bild bleibt ersetzt', () => {
    it('[REQ-019/AK-3] Bild ersetzen, Neustart → der Bereich zeigt das neue Bild', async () => {
      const s = speicher();
      await starte(A.id, s, PNG.rot);
      await hinterlege('cover');
      const alt = bildIn('cover');
      beenden();
      await starte(A.id, s, PNG.gelb);
      await hinterlege('cover');
      await vi.waitFor(() => expect(bildIn('cover')).not.toBe(alt));
      const neu = bildIn('cover');
      beenden();
      await starte(A.id, s);
      await vi.waitFor(() => expect(bildIn('cover')).toBe(neu));
      expect([...s.daten.keys()]).toEqual([`${A.id}|cover`]);
    });

    it('[REQ-019/AK-3] Web: nach put über ein vorhandenes Bild liefert die neue Instanz nur das neue Bild', async () => {
      vi.stubGlobal('indexedDB', new IDBFactory());
      const s1 = await zentralerSpeicher();
      await s1.put(A.id, 'cover', PNG.rot);
      await s1.put(A.id, 'cover', PNG.gelb);
      expect(await (await zentralerSpeicher()).get(A.id, 'cover')).toBe(PNG.gelb);
    });
  });

  describe('AK-4 Entferntes Bild bleibt entfernt', () => {
    it('[REQ-019/AK-4] „Foto entfernen“, Neustart → Bereich ohne Bild, auch nicht mehr im Speicher', async () => {
      const s = speicher();
      await starte(A.id, s, PNG.rot);
      await hinterlege('cover');
      await hinterlege('schnitt');
      await entferne('cover');
      beenden();
      await starte(A.id, s);
      await vi.waitFor(() => expect(bildIn('schnitt')).not.toBeNull());
      expect(bildIn('cover')).toBeNull();
      expect(bereich('cover').querySelector('[data-cover-titel]')!.textContent?.trim()).toBe(A.titel);
      expect(s.daten.has(`${A.id}|cover`)).toBe(false);
    });

    it('[REQ-019/AK-4] Web: nach remove liefert die neue Instanz kein Bild mehr, andere bleiben', async () => {
      vi.stubGlobal('indexedDB', new IDBFactory());
      const s1 = await zentralerSpeicher();
      await s1.put(A.id, 'cover', PNG.rot);
      await s1.put(A.id, 'ruecken', PNG.blau);
      await s1.remove(A.id, 'cover');
      const s2 = await zentralerSpeicher();
      expect(await s2.get(A.id, 'cover')).toBeUndefined();
      expect(await s2.get(A.id, 'ruecken')).toBe(PNG.blau);
    });
  });

  describe('AK-5 Speicherzugriff nur über das Repository', () => {
    const quellen = () =>
      walk(SRC)
        .filter((u) => /\.(ts|tsx)$/.test(u.pathname) && !/\/src\/storage\//.test(u.pathname))
        .map((u) => ({ datei: u.pathname.replace(/^.*\/src\//, 'src/'), text: fs.readFileSync(u, 'utf8') }));

    it('[REQ-019/AK-5] außerhalb von src/storage/ kein direkter Zugriff auf IndexedDB, SQLite, Dateisystem oder Web Storage', () => {
      const verboten = /\bindexedDB\b|@capacitor\/filesystem|@capacitor-community\/sqlite|\blocalStorage\b|\bsessionStorage\b|\bcaches\.open\b|\bFilesystem\./;
      const treffer = quellen().filter((q) => verboten.test(q.text)).map((q) => q.datei);
      expect(treffer).toEqual([]);
    });

    it('[REQ-019/AK-5] außerhalb von src/storage/ werden keine Speicher-Implementierungen direkt importiert', () => {
      const impl = /from\s+['"](@\/storage\/(?!ImageStore['"]|BookRepository['"]|index['"])[^'"]+|\.{1,2}\/(?:\.\.\/)*storage\/(?!ImageStore['"]|BookRepository['"])[^'"]+)['"]/;
      const treffer = quellen().filter((q) => impl.test(q.text)).map((q) => q.datei);
      expect(treffer).toEqual([]);
    });

    it('[REQ-019/AK-5] die Buchdetails speichern und laden Bilder über die übergebene ImageStore-Schnittstelle', async () => {
      const s = speicher();
      const get = vi.spyOn(s, 'get');
      const put = vi.spyOn(s, 'put');
      const remove = vi.spyOn(s, 'remove');
      await starte(A.id, s, PNG.gruen);
      expect(get).toHaveBeenCalledWith(A.id, 'cover');
      await hinterlege('cover');
      expect(put).toHaveBeenCalledWith(A.id, 'cover', expect.stringMatching(/^data:image\//));
      await entferne('cover');
      expect(remove).toHaveBeenCalledWith(A.id, 'cover');
    });
  });
});
