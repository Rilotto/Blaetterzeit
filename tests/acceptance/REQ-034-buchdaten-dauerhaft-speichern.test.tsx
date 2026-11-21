/**
 * Akzeptanztests REQ-034 – Buchdaten dauerhaft speichern.
 *
 * Abgeleitet aus dem REQ-Text und der Absprache (sprints/sprint-04/plan.md, „Ergänzung CEO 2026-11-10 (Teil A)“):
 *  - createBookRepository()/createImageStore() aus @/storage wählen zentral die Implementierung
 *    (Web: IndexedDB mit Rückfall auf den Arbeitsspeicher)
 *  - BuecherAnsicht { repository?, bildquelle?, bildspeicher? }
 * „Neuladen/Neustart“ in jsdom: neue Speicher-Instanzen aus neu geladenen Modulen auf derselben
 * IndexedDB (fake-indexeddb); zusätzlich die ganze App (Standard-Speicher, keine Props) neu geladen.
 * Echte Neustarts im Browser und auf dem Gerät (APK, SQLite) stehen in der manuellen Prüfliste.
 */
import '@testing-library/jest-dom/vitest';
import { act, cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { IDBFactory, IDBKeyRange } from 'fake-indexeddb';
import type { ComponentType, CSSProperties } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { Bildquelle } from '@/bild/bildquelle';
import type { Buch } from '@/domain/buch';
import type { BookRepository, ImageStore } from '@/storage';
import { farbVariablen } from '@/theme';

type DirEntry = { name: string; isDirectory(): boolean };
type FsLike = { existsSync(p: URL): boolean; readFileSync(p: URL, enc: 'utf8'): string; readdirSync(p: URL, o: { withFileTypes: true }): DirEntry[] };
const fs = (await import(/* @vite-ignore */ 'node:' + 'fs')) as FsLike;
const { pathToFileURL } = (await import(/* @vite-ignore */ 'node:' + 'url')) as { pathToFileURL(p: string): URL };
const { cwd } = (await import(/* @vite-ignore */ 'node:' + 'process')) as { cwd(): string };
const ROOT = pathToFileURL(`${cwd()}/`);
const SRC = new URL('src/', ROOT);
function walk(dir: URL): URL[] {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
    e.isDirectory() ? walk(new URL(`${e.name}/`, dir)) : [new URL(e.name, dir)],
  );
}

const PNG = {
  rot: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAIAAACQd1PeAAAADElEQVR4nGP4z8AAAAMBAQDJ/pLvAAAAAElFTkSuQmCC',
  gruen: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAIAAACQd1PeAAAADElEQVR4nGNgaGAAAAEEAIFw9selAAAAAElFTkSuQmCC',
  blau: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAIAAACQd1PeAAAADElEQVR4nGNgYPgPAAEDAQAIicLsAAAAAElFTkSuQmCC',
};
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

// --------------------------------------------------------------------------- „Gerät“ und „Neustart“
type Speicher = { repo: BookRepository; bilder: ImageStore; Ansicht: ComponentType<Record<string, unknown>> };
/** Lädt Speicher und Ansicht neu (wie ein Neustart der App) – auf derselben IndexedDB. */
async function starte(): Promise<Speicher> {
  vi.resetModules();
  const st = (await import('@/storage')) as typeof import('@/storage');
  const Ansicht = (await import('@/views/BuecherAnsicht')).default as unknown as ComponentType<Record<string, unknown>>;
  return { repo: st.createBookRepository(), bilder: st.createImageStore(), Ansicht };
}
async function zeige(sp: Speicher, bild: string | null = PNG.rot) {
  const q: Bildquelle = { scannen: async () => bild, galerie: async () => bild };
  const A = sp.Ansicht;
  render(
    <div style={farbVariablen() as CSSProperties}>
      <A repository={sp.repo} bildspeicher={sp.bilder} bildquelle={q} />
    </div>,
  );
  await screen.findByRole('heading', { name: 'Deine Bücher' });
}
async function warte(ms = 30) {
  await act(async () => {
    await new Promise((r) => setTimeout(r, ms));
  });
}
async function legeAn(felder: Record<string, string>, mitCover = false) {
  fireEvent.click(screen.getByRole('button', { name: 'Buch hinzufügen' }));
  fireEvent.click(within(await screen.findByRole('menu', { name: 'Buch hinzufügen' })).getByRole('menuitem'));
  const d = await screen.findByRole('dialog', { name: 'Manueller Eintrag' });
  for (const [k, v] of Object.entries(felder)) {
    fireEvent.change(within(d).getByLabelText(new RegExp(`^\\s*${k}\\s*$`, 'i')), { target: { value: v } });
  }
  if (mitCover) {
    fireEvent.click(d.querySelector('[data-cover-hinzufuegen]')!);
    fireEvent.click(within(await screen.findByRole('menu', { name: 'Bild hinzufügen' })).getByRole('menuitem', { name: 'Aus Galerie auswählen' }));
    const z = await screen.findByRole('region', { name: 'Zuschnitt' });
    fireEvent.click(within(z).getByRole('button', { name: 'Bestätigen' }));
    await vi.waitFor(() => expect(document.querySelector('[data-cover-hinzufuegen] img')).not.toBeNull());
  }
  const bild = document.querySelector('[data-cover-hinzufuegen] img')?.getAttribute('src') ?? null;
  await act(async () => {
    fireEvent.click(within(screen.getByRole('dialog', { name: 'Manueller Eintrag' })).getByRole('button', { name: 'Hinzufügen' }));
    await new Promise((r) => setTimeout(r, 30));
  });
  await screen.findByRole('region', { name: 'Buchdetails' });
  return bild;
}
async function zurueckZurListe() {
  fireEvent.click(within(screen.getByRole('region', { name: 'Buchdetails' })).getByRole('button', { name: 'Zurück' }));
  await screen.findByRole('heading', { name: 'Deine Bücher' });
  await warte();
}
function eintrag(titel: string) {
  const region = screen.getByRole('region', { name: 'Noch zu lesen' });
  return within(region)
    .queryAllByRole('listitem')
    .find((l) => l.querySelector('[data-buchtitel]')?.textContent?.trim() === titel);
}
const finde = async (repo: BookRepository, titel: string) => (await repo.list()).filter((b) => b.titel === titel);

beforeEach(() => {
  vi.stubGlobal('indexedDB', new IDBFactory());
  vi.stubGlobal('IDBKeyRange', IDBKeyRange);
});
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

// ===========================================================================
describe('REQ-034 Buchdaten dauerhaft speichern', () => {
  describe('AK-1 Angelegtes Buch übersteht Neuladen/Neustart mit allen Angaben', () => {
    it('[REQ-034/AK-1] Titel, Autor, Jahr, Seiten: nach Neustart gleiche ID und unveränderte Angaben, Status „ungelesen“', async () => {
      const s1 = await starte();
      await zeige(s1);
      await legeAn({ Titel: 'Dauerbuch', Autor: 'Vorname Nachname', Jahr: '2019', Seiten: '350' });
      const [vorher] = await finde(s1.repo, 'Dauerbuch');
      expect(vorher.id).toMatch(UUID);
      cleanup();
      const s2 = await starte();
      expect(s2.repo).not.toBe(s1.repo);
      const nachher = await finde(s2.repo, 'Dauerbuch');
      expect(nachher).toHaveLength(1);
      expect(nachher[0]).toEqual({
        id: vorher.id,
        titel: 'Dauerbuch',
        autor: 'Vorname Nachname',
        erscheinungsjahr: 2019,
        seitenanzahl: 350,
        status: 'ungelesen',
        // Seit 2026-11-12 automatisch gesetzt (REQ-041), bleibt unverändert.
        eingetragenAm: vorher.eingetragenAm,
      });
      expect(typeof vorher.eingetragenAm).toBe('string');
    });

    it('[REQ-034/AK-1] nach Neustart zeigen Buchliste und Buchdetails das Buch', async () => {
      const s1 = await starte();
      await zeige(s1);
      await legeAn({ Titel: 'Dauerbuch', Autor: 'Vorname Nachname' });
      cleanup();
      const s2 = await starte();
      await zeige(s2);
      await vi.waitFor(() => expect(eintrag('Dauerbuch')).toBeDefined());
      fireEvent.click(eintrag('Dauerbuch')!.querySelector('[data-buchtitel]')!);
      const details = await screen.findByRole('region', { name: 'Buchdetails' });
      await vi.waitFor(() => expect(details.querySelector('[data-buchdetails-titel]')?.textContent?.trim()).toBe('Dauerbuch'));
    });

    it('[REQ-034/AK-1] ganze App mit Standard-Speicher (ohne Test-Props): Buch anlegen, App neu laden → Buch ist da, genau einmal', async () => {
      vi.resetModules();
      const App1 = (await import('@/App')).default;
      render(<App1 />);
      fireEvent.click(within(screen.getByRole('navigation', { name: 'Hauptnavigation' })).getByRole('button', { name: 'Bücher' }));
      await screen.findByRole('heading', { name: 'Deine Bücher' });
      await warte();
      await legeAn({ Titel: 'App-Dauerbuch', Seiten: '99' });
      cleanup();
      for (let i = 0; i < 2; i++) {
        vi.resetModules();
        const App2 = (await import('@/App')).default;
        render(<App2 />);
        fireEvent.click(within(screen.getByRole('navigation', { name: 'Hauptnavigation' })).getByRole('button', { name: 'Bücher' }));
        await screen.findByRole('heading', { name: 'Deine Bücher' });
        await vi.waitFor(() => expect(eintrag('App-Dauerbuch')).toBeDefined());
        // Nur im Abschnitt „Noch zu lesen“ zählen; „Alle Bücher“ (REQ-035) zeigt dasselbe Buch zusätzlich.
        const titel = Array.from(
          screen.getByRole('region', { name: 'Noch zu lesen' }).querySelectorAll('[data-buchtitel]'),
        ).map((e) => e.textContent?.trim());
        expect(titel.filter((t) => t === 'App-Dauerbuch'), `Neustart ${i + 1}`).toHaveLength(1);
        cleanup();
      }
    });
  });

  describe('AK-2 Buch nur mit Pflichtangabe', () => {
    it('[REQ-034/AK-2] nur Titel: nach Neustart vorhanden, optionale Angaben fehlen, keine Ersatzwerte', async () => {
      const s1 = await starte();
      await zeige(s1);
      await legeAn({ Titel: 'Nur Titel' });
      cleanup();
      const s2 = await starte();
      const [b] = await finde(s2.repo, 'Nur Titel');
      expect(b).toBeDefined();
      // Eintragungsdatum wird seit 2026-11-12 automatisch gesetzt (REQ-041), ist keine Ersatzangabe des Nutzers.
      expect(Object.keys(b).sort()).toEqual(['eingetragenAm', 'id', 'status', 'titel']);
      expect(b.status).toBe('ungelesen');
      expect(await s2.bilder.get(b.id, 'cover')).toBeUndefined();
    });
  });

  describe('AK-3 Erscheinungsdatum bleibt erhalten', () => {
    it.each(['03.09.2019', '29.02.2024', '01.01.1900'])('[REQ-034/AK-3] Erscheinungsdatum %s bleibt nach Neustart gleich', async (datum) => {
      const s1 = await starte();
      const b: Buch = { id: crypto.randomUUID(), titel: 'Mit Datum', status: 'ungelesen', erscheinungsdatum: datum };
      await s1.repo.save(b);
      const s2 = await starte();
      expect((await s2.repo.get(b.id))?.erscheinungsdatum).toBe(datum);
    });
  });

  describe('AK-4 Cover bleibt erhalten', () => {
    it('[REQ-034/AK-4] beim Anlegen hinterlegtes Cover: nach Neustart in Buchliste und Buchdetails dasselbe Bild', async () => {
      const s1 = await starte();
      await zeige(s1, PNG.gruen);
      const bild = await legeAn({ Titel: 'Coverbuch' }, true);
      expect(bild).toMatch(/^data:image\//);
      cleanup();
      const s2 = await starte();
      await zeige(s2);
      await vi.waitFor(() => expect(eintrag('Coverbuch')?.querySelector('img')?.getAttribute('src')).toBe(bild));
      fireEvent.click(eintrag('Coverbuch')!.querySelector('[data-buchtitel]')!);
      const details = await screen.findByRole('region', { name: 'Buchdetails' });
      await vi.waitFor(() => expect(details.querySelector('[data-bereich="cover"] img')?.getAttribute('src')).toBe(bild));
    });
  });

  describe('AK-5 Mehrere Bücher, richtige Zuordnung', () => {
    it('[REQ-034/AK-5] drei Bücher mit verschiedenen Angaben und Covern: nach Neustart jedes mit genau seinen Angaben und seinem Cover', async () => {
      const soll: [Record<string, string>, string | null][] = [
        [{ Titel: 'Erstes', Autor: 'A', Jahr: '2001', Seiten: '100' }, PNG.rot],
        [{ Titel: 'Zweites', Autor: 'B' }, null],
        [{ Titel: 'Drittes', Seiten: '300' }, PNG.blau],
      ];
      const covers: Record<string, string | null> = {};
      const s1 = await starte();
      for (const [felder, bild] of soll) {
        cleanup();
        await zeige(s1, bild);
        covers[felder.Titel] = await legeAn(felder, bild !== null);
        await zurueckZurListe();
      }
      cleanup();
      const s2 = await starte();
      const alle = await s2.repo.list();
      const erwartet = {
        Erstes: { autor: 'A', erscheinungsjahr: 2001, seitenanzahl: 100 },
        Zweites: { autor: 'B' },
        Drittes: { seitenanzahl: 300 },
      } as Record<string, Partial<Buch>>;
      for (const [titel, felder] of Object.entries(erwartet)) {
        const b = alle.filter((x) => x.titel === titel);
        expect(b, titel).toHaveLength(1);
        const { id, titel: _t, status, eingetragenAm: _e, ...rest } = b[0];
        expect(rest, titel).toEqual(felder);
        expect(status).toBe('ungelesen');
        expect(await s2.bilder.get(id, 'cover'), `Cover ${titel}`).toBe(covers[titel] ?? undefined);
      }
      expect(new Set(alle.map((b) => b.id)).size).toBe(alle.length);
      await zeige(s2);
      await vi.waitFor(() => expect(eintrag('Drittes')?.querySelector('img')?.getAttribute('src')).toBe(covers.Drittes));
      expect(eintrag('Erstes')?.querySelector('img')?.getAttribute('src')).toBe(covers.Erstes);
      expect(eintrag('Zweites')?.querySelector('img')).toBeNull();
    });
  });

  describe('AK-6 Geänderte Angabe bleibt geändert', () => {
    it('[REQ-034/AK-6] geänderter Lesestatus (und Autor) eines angelegten Buches: nach Neustart der geänderte Wert, kein Duplikat', async () => {
      const s1 = await starte();
      await zeige(s1);
      await legeAn({ Titel: 'Ändern', Autor: 'Alt' });
      const [b] = await finde(s1.repo, 'Ändern');
      await s1.repo.save({ ...b, status: 'gelesen', autor: 'Neu' });
      cleanup();
      const s2 = await starte();
      const n = await finde(s2.repo, 'Ändern');
      expect(n).toHaveLength(1);
      expect(n[0]).toMatchObject({ id: b.id, status: 'gelesen', autor: 'Neu' });
      // Gegenprobe: zurückändern bleibt ebenfalls
      await s2.repo.save({ ...n[0], status: 'ungelesen' });
      const s3 = await starte();
      expect((await s3.repo.get(b.id))?.status).toBe('ungelesen');
    });

    it('[REQ-034/AK-6] eine entfernte optionale Angabe bleibt nach Neustart entfernt', async () => {
      const s1 = await starte();
      const b: Buch = { id: crypto.randomUUID(), titel: 'X', status: 'ungelesen', autor: 'Weg', seitenanzahl: 10 };
      await s1.repo.save(b);
      await s1.repo.save({ id: b.id, titel: 'X', status: 'ungelesen' });
      const s2 = await starte();
      expect(await s2.repo.get(b.id)).toEqual({ id: b.id, titel: 'X', status: 'ungelesen' });
    });
  });

  describe('AK-7 Gesperrter Browser-Speicher', () => {
    class GesperrteDb {
      open(): IDBOpenDBRequest {
        throw new DOMException('The operation is insecure.', 'SecurityError');
      }
      deleteDatabase(): IDBOpenDBRequest {
        throw new DOMException('The operation is insecure.', 'SecurityError');
      }
      databases() {
        return Promise.reject(new DOMException('The operation is insecure.', 'SecurityError'));
      }
      cmp() {
        return 0;
      }
    }
    class FehlerDb extends IDBFactory {
      override open(name: string, version?: number): IDBOpenDBRequest {
        const req = super.open(`${name}-gesperrt`, version);
        req.addEventListener('upgradeneeded', () => req.transaction?.abort());
        return req;
      }
    }

    it.each([
      ['open() wirft SecurityError', () => new GesperrteDb()],
      ['Öffnen schlägt asynchron fehl', () => new FehlerDb()],
    ])('[REQ-034/AK-7] %s: Buch wird angelegt und angezeigt, App bleibt ohne Fehlermeldung bedienbar', async (_w, fabrik) => {
      vi.stubGlobal('indexedDB', fabrik());
      vi.spyOn(console, 'warn').mockImplementation(() => {});
      const s = await starte();
      await zeige(s);
      const bild = await legeAn({ Titel: 'Ohne Speicher', Autor: 'A' }, true);
      const details = screen.getByRole('region', { name: 'Buchdetails' });
      await vi.waitFor(() => expect(details.querySelector('[data-buchdetails-titel]')?.textContent?.trim()).toBe('Ohne Speicher'));
      await vi.waitFor(() => expect(details.querySelector('[data-bereich="cover"] img')?.getAttribute('src')).toBe(bild));
      await zurueckZurListe();
      await vi.waitFor(() => expect(eintrag('Ohne Speicher')).toBeDefined());
      expect(screen.queryByRole('alert')).toBeNull();
      expect(document.body.textContent).not.toMatch(/Fehler|error|SecurityError/i);
      // weiter bedienbar: zweites Buch
      await legeAn({ Titel: 'Zweites ohne Speicher' });
      await zurueckZurListe();
      await vi.waitFor(() => expect(eintrag('Zweites ohne Speicher')).toBeDefined());
      expect(eintrag('Ohne Speicher')).toBeDefined();
    });
  });

  describe('AK-8 Speicherzugriff nur über das Repository', () => {
    const quellen = () =>
      walk(SRC)
        .filter((u) => /\.(ts|tsx)$/.test(u.pathname) && !/\/src\/storage\//.test(u.pathname))
        .map((u) => ({ datei: u.pathname.replace(/^.*\/src\//, 'src/'), text: fs.readFileSync(u, 'utf8') }));

    it('[REQ-034/AK-8] außerhalb von src/storage/ kein direkter Zugriff auf IndexedDB, SQLite, Dateisystem oder Web Storage', () => {
      const verboten = /\bindexedDB\b|\bIDB[A-Z]\w*|@capacitor\/filesystem|@capacitor-community\/sqlite|\blocalStorage\b|\bsessionStorage\b|\bcaches\.open\b|\bFilesystem\.|document\.cookie/;
      expect(quellen().filter((q) => verboten.test(q.text)).map((q) => q.datei)).toEqual([]);
    });

    it('[REQ-034/AK-8] außerhalb von src/storage/ werden keine Speicher-Implementierungen direkt importiert', () => {
      const impl = /from\s+['"](@\/storage\/(?!ImageStore['"]|BookRepository['"]|index['"])[^'"]+|\.{1,2}\/(?:\.\.\/)*storage\/(?!ImageStore['"]|BookRepository['"])[^'"]+)['"]/;
      expect(quellen().filter((q) => impl.test(q.text)).map((q) => q.datei)).toEqual([]);
    });

    it('[REQ-034/AK-8] die Seite „Bücher“ liest und speichert über die übergebene Repository-Schnittstelle', async () => {
      const s = await starte();
      const list = vi.spyOn(s.repo, 'list');
      const save = vi.spyOn(s.repo, 'save');
      await zeige(s);
      await vi.waitFor(() => expect(list).toHaveBeenCalled());
      await legeAn({ Titel: 'Über Repo' });
      expect(save).toHaveBeenCalledTimes(1);
      expect(save.mock.calls[0][0]).toMatchObject({ titel: 'Über Repo', status: 'ungelesen' });
    });
  });
});
