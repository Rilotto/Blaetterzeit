/**
 * Akzeptanztests REQ-008 – Buchdaten und Lesestatus.
 *
 * Abgeleitet aus dem REQ-Text und der verbindlichen Schnittstellen-Absprache in
 * sprints/sprint-02/plan.md, Abschnitt „REQ-005 bis REQ-012 (Seite „Bücher“), Runde 1“:
 *  - src/domain/buch.ts exportiert Typ Buch { id, titel, cover?, status } und LESESTATUS [{ id, bezeichnung }]
 *  - IDs: ungelesen, am_lesen, gelesen, abgebrochen, wunschliste
 *  - Speicherzugriff nur über die Repository-Schnittstelle (ADR-0002: createBookRepository aus @/storage)
 *  - Demodaten: demo/testbuecher.json, Array von { id, titel, status }
 */
import { describe, expect, it } from 'vitest';
import { LESESTATUS, type Buch } from '@/domain/buch';
import { createBookRepository } from '@/storage';

type DirEntry = { name: string; isDirectory(): boolean };
type FsLike = {
  existsSync(p: URL): boolean;
  readFileSync(p: URL, enc: 'utf8'): string;
  readdirSync(p: URL, o: { withFileTypes: true }): DirEntry[];
};
const NODE_FS = 'node:fs';
const NODE_URL = 'node:url';
const NODE_PROCESS = 'node:process';
const fs = (await import(/* @vite-ignore */ NODE_FS)) as FsLike;
const { pathToFileURL } = (await import(/* @vite-ignore */ NODE_URL)) as { pathToFileURL(p: string): URL };
const { cwd } = (await import(/* @vite-ignore */ NODE_PROCESS)) as { cwd(): string };
const ROOT = pathToFileURL(`${cwd()}/`);
const SRC = new URL('src/', ROOT);
const ZENTRAL = new URL('domain/buch.ts', SRC);
function walk(dir: URL): URL[] {
  if (!fs.existsSync(dir)) return [];
  const out: URL[] = [];
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (e.isDirectory()) out.push(...walk(new URL(`${e.name}/`, dir)));
    else out.push(new URL(e.name, dir));
  }
  return out;
}
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const COVER = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';
const uuid = () => crypto.randomUUID();

describe('REQ-008 Buchdaten und Lesestatus', () => {
  // ---------------------------------------------------------------- AK-1
  describe('AK-1 Buch mit Pflichtangaben ohne Cover', () => {
    it('[REQ-008/AK-1] ID, Titel und Lesestatus bleiben beim Speichern und Lesen über das Repository unverändert', async () => {
      const repo = createBookRepository();
      const buch: Buch = { id: uuid(), titel: 'Dungeon Crawler Carl', status: 'ungelesen' };
      await repo.save(buch);
      const gelesen = await repo.get(buch.id);
      expect(gelesen).toBeDefined();
      expect(gelesen!.id).toBe(buch.id);
      expect(gelesen!.titel).toBe(buch.titel);
      expect(gelesen!.status).toBe(buch.status);
      expect(gelesen!.cover, 'kein Buchcover').toBeUndefined();
      expect(await repo.list()).toEqual([gelesen]);
    });

    it.each(LESESTATUS.map((s) => s.id))('[REQ-008/AK-1] jeder Lesestatus wird gespeichert und gelesen: %s', async (status) => {
      const repo = createBookRepository();
      const buch: Buch = { id: uuid(), titel: `Titel ${status}`, status };
      await repo.save(buch);
      expect((await repo.get(buch.id))?.status).toBe(status);
    });

    it('[REQ-008/AK-1] Sonderzeichen und lange Titel bleiben unverändert', async () => {
      const repo = createBookRepository();
      const titel = `„Ä Ö Ü ß“ – ${'sehr lang '.repeat(30)}🙂`;
      const buch: Buch = { id: uuid(), titel, status: 'wunschliste' };
      await repo.save(buch);
      expect((await repo.get(buch.id))?.titel).toBe(titel);
    });

    it('[REQ-008/AK-1] gelesene Daten sind eine Kopie: Änderungen am Objekt ändern den Speicher nicht', async () => {
      const repo = createBookRepository();
      const buch: Buch = { id: uuid(), titel: 'Original', status: 'ungelesen' };
      await repo.save(buch);
      buch.titel = 'verändert';
      const a = await repo.get(buch.id);
      expect(a!.titel).toBe('Original');
      a!.titel = 'auch verändert';
      expect((await repo.get(buch.id))!.titel).toBe('Original');
    });
  });

  // ---------------------------------------------------------------- AK-2
  describe('AK-2 Buch mit Cover', () => {
    it('[REQ-008/AK-2] das Buchcover bleibt beim Speichern und Lesen unverändert', async () => {
      const repo = createBookRepository();
      const buch: Buch = { id: uuid(), titel: 'Alchemised', status: 'ungelesen', cover: COVER };
      await repo.save(buch);
      expect((await repo.get(buch.id))?.cover).toBe(COVER);
      expect((await repo.list()).find((b) => b.id === buch.id)?.cover).toBe(COVER);
    });

    it('[REQ-008/AK-2] Cover entfernen (Überschreiben ohne Cover) liefert danach ein Buch ohne Cover', async () => {
      const repo = createBookRepository();
      const id = uuid();
      await repo.save({ id, titel: 'X', status: 'gelesen', cover: COVER });
      await repo.save({ id, titel: 'X', status: 'gelesen' });
      expect((await repo.get(id))?.cover).toBeUndefined();
    });
  });

  // ---------------------------------------------------------------- AK-3
  describe('AK-3 IDs sind eindeutig', () => {
    it('[REQ-008/AK-3] zwei Bücher mit gleichem Titel bleiben als zwei Bücher mit verschiedenen IDs erhalten', async () => {
      const repo = createBookRepository();
      const a: Buch = { id: uuid(), titel: 'Gleicher Titel', status: 'ungelesen' };
      const b: Buch = { id: uuid(), titel: 'Gleicher Titel', status: 'gelesen' };
      await repo.save(a);
      await repo.save(b);
      const alle = await repo.list();
      expect(alle).toHaveLength(2);
      expect(new Set(alle.map((x) => x.id)).size).toBe(2);
    });

    it('[REQ-008/AK-3] die ID ist der Schlüssel: Speichern mit gleicher ID überschreibt statt zu verdoppeln', async () => {
      const repo = createBookRepository();
      const id = uuid();
      await repo.save({ id, titel: 'Alt', status: 'ungelesen' });
      await repo.save({ id, titel: 'Neu', status: 'am_lesen' });
      const alle = await repo.list();
      expect(alle).toHaveLength(1);
      expect(alle[0]).toMatchObject({ id, titel: 'Neu', status: 'am_lesen' });
    });

    it('[REQ-008/AK-3] die Demodaten haben eindeutige UUIDs, auch bei gleichem Titel wäre die ID verschieden', () => {
      const demo = JSON.parse(fs.readFileSync(new URL('demo/testbuecher.json', ROOT), 'utf8')) as Buch[];
      expect(demo.length).toBe(3);
      for (const b of demo) expect(b.id, b.titel).toMatch(UUID);
      expect(new Set(demo.map((b) => b.id)).size).toBe(demo.length);
    });
  });

  // ---------------------------------------------------------------- AK-4
  describe('AK-4 Nur die festgelegten Lesestatus', () => {
    it('[REQ-008/AK-4] genau fünf Lesestatus mit den Bezeichnungen des CEO in dieser Schreibweise und Reihenfolge', () => {
      expect(LESESTATUS.map((s) => s.bezeichnung)).toEqual(['ungelesen', 'am lesen', 'gelesen', 'abgebrochen', 'Wunschliste']);
    });

    it('[REQ-008/AK-4] die IDs entsprechen der Absprache und sind eindeutig', () => {
      expect(LESESTATUS.map((s) => s.id)).toEqual(['ungelesen', 'am_lesen', 'gelesen', 'abgebrochen', 'wunschliste']);
    });

    it('[REQ-008/AK-4] die Demodaten verwenden nur festgelegte Lesestatus, mindestens eines „ungelesen“', () => {
      const demo = JSON.parse(fs.readFileSync(new URL('demo/testbuecher.json', ROOT), 'utf8')) as Buch[];
      const ids = LESESTATUS.map((s) => s.id as string);
      for (const b of demo) expect(ids, b.titel).toContain(b.status);
      expect(demo.some((b) => b.status === 'ungelesen')).toBe(true);
      for (const b of demo) expect(Object.keys(b).sort()).toEqual(['id', 'status', 'titel']);
    });
  });

  // ---------------------------------------------------------------- AK-5
  describe('AK-5 Lesestatus nur zentral definiert', () => {
    const quellen = () =>
      walk(SRC)
        .filter((f) => /\.(tsx?|jsx?)$/.test(f.pathname) && f.href !== ZENTRAL.href)
        .map((f) => ({ datei: f.pathname.slice(SRC.pathname.length), text: fs.readFileSync(f, 'utf8') }));

    it('[REQ-008/AK-5] die Bezeichnungstexte „am lesen“ und „Wunschliste“ stehen nur in der zentralen Definition', () => {
      // „ungelesen“, „gelesen“, „abgebrochen“ sind zugleich IDs und hier nicht unterscheidbar (siehe Testbericht).
      const treffer = quellen()
        .filter(({ text }) => /['"`]am lesen['"`]|['"`]Wunschliste['"`]/.test(text))
        .map((q) => q.datei);
      expect(treffer).toEqual([]);
    });

    it('[REQ-008/AK-5] außerhalb der zentralen Definition wird nicht über `bezeichnung` verglichen', () => {
      const treffer = quellen()
        .filter(({ text }) => /\.bezeichnung\s*[!=]==?|[!=]==?\s*[\w.]+\.bezeichnung/.test(text))
        .map((q) => q.datei);
      expect(treffer).toEqual([]);
    });

    it('[REQ-008/AK-5] die alten, nicht vom CEO stammenden Lesestatus gibt es nirgends mehr', () => {
      const treffer = quellen()
        .filter(({ text }) => /want_to_read|['"]reading['"]|Möchte ich lesen|Lese ich gerade|ReadingStatus/.test(text))
        .map((q) => q.datei);
      expect(treffer).toEqual([]);
      expect(fs.existsSync(new URL('domain/book.ts', SRC)), 'alte Definition src/domain/book.ts').toBe(false);
    });

    it('[REQ-008/AK-5] es gibt genau eine Stelle, die eine Liste von Lesestatus mit Bezeichnungen festlegt', () => {
      const treffer = quellen()
        .filter(({ text }) => /bezeichnung\s*:/.test(text))
        .map((q) => q.datei);
      expect(treffer).toEqual([]);
    });
  });
});
