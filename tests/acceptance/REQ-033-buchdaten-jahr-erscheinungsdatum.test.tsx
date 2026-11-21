/**
 * Akzeptanztests REQ-033 – Buchdaten: Erscheinungsjahr und Erscheinungsdatum.
 *
 * Abgeleitet aus dem REQ-Text und der Schnittstellen-Absprache (sprints/sprint-04/plan.md, Teil A):
 *  - Buch { erscheinungsjahr?: number, erscheinungsdatum?: string (TT.MM.JJJJ) }
 *  - Zugriff nur über die Repository-Schnittstelle (createBookRepository aus @/storage)
 * Geprüft werden die Arbeitsspeicher-Variante (ohne IndexedDB) und die dauerhafte Web-Variante
 * (fake-indexeddb, neue Instanz nach neu geladenen Modulen). SQLite auf dem Gerät: manuelle Prüfliste.
 */
import '@testing-library/jest-dom/vitest';
import { act, cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { IDBFactory, IDBKeyRange } from 'fake-indexeddb';
import type { CSSProperties } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import BuecherAnsicht from '@/views/BuecherAnsicht';
import type { Buch } from '@/domain/buch';
import type { BookRepository, ImageStore } from '@/storage';
import { farbVariablen } from '@/theme';

type FsLike = { readFileSync(p: URL, enc: 'utf8'): string };
const fs = (await import(/* @vite-ignore */ 'node:' + 'fs')) as FsLike;
const { pathToFileURL } = (await import(/* @vite-ignore */ 'node:' + 'url')) as { pathToFileURL(p: string): URL };
const { cwd } = (await import(/* @vite-ignore */ 'node:' + 'process')) as { cwd(): string };
const ROOT = pathToFileURL(`${cwd()}/`);

const MIT: Buch = {
  id: '33000000-0000-4000-8000-000000000001',
  titel: 'Mit Datum',
  status: 'gelesen',
  erscheinungsjahr: 2019,
  erscheinungsdatum: '03.09.2019',
};
const OHNE: Buch = { id: '33000000-0000-4000-8000-000000000002', titel: 'Ohne Datum', status: 'wunschliste' };

type Variante = [string, () => Promise<{ erst: () => BookRepository; neu: () => Promise<BookRepository> }>];
const VARIANTEN: Variante[] = [
  [
    'Arbeitsspeicher',
    async () => {
      const { createBookRepository } = await import('@/storage');
      const r = createBookRepository();
      return { erst: () => r, neu: async () => r };
    },
  ],
  [
    'IndexedDB (Neustart)',
    async () => {
      vi.stubGlobal('indexedDB', new IDBFactory());
      vi.stubGlobal('IDBKeyRange', IDBKeyRange);
      vi.resetModules();
      const a = (await import('@/storage')) as typeof import('@/storage');
      const r = a.createBookRepository();
      return {
        erst: () => r,
        neu: async () => {
          vi.resetModules();
          return ((await import('@/storage')) as typeof import('@/storage')).createBookRepository();
        },
      };
    },
  ],
];

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('REQ-033 Erscheinungsjahr und Erscheinungsdatum', () => {
  describe('AK-1 Mit und ohne Erscheinungsjahr/Erscheinungsdatum', () => {
    it.each(VARIANTEN)('[REQ-033/AK-1] %s: Buch mit 2019/03.09.2019 und Buch ohne beide bleiben unverändert', async (_n, mache) => {
      const { erst, neu } = await mache();
      await erst().save(MIT);
      await erst().save(OHNE);
      const r = await neu();
      expect(await r.get(MIT.id)).toEqual(MIT);
      const o = await r.get(OHNE.id);
      expect(o).toEqual(OHNE);
      expect(o).not.toHaveProperty('erscheinungsjahr');
      expect(o).not.toHaveProperty('erscheinungsdatum');
      expect(typeof (await r.get(MIT.id))!.erscheinungsjahr).toBe('number');
      expect((await r.get(MIT.id))!.erscheinungsdatum).toMatch(/^\d{2}\.\d{2}\.\d{4}$/);
    });

    it.each(VARIANTEN)('[REQ-033/AK-1] %s: nur Jahr bzw. nur Datum sind je für sich zulässig', async (_n, mache) => {
      const { erst, neu } = await mache();
      const nurJahr: Buch = { id: '33000000-0000-4000-8000-000000000003', titel: 'Nur Jahr', status: 'ungelesen', erscheinungsjahr: 1999 };
      const nurDatum: Buch = { id: '33000000-0000-4000-8000-000000000004', titel: 'Nur Datum', status: 'ungelesen', erscheinungsdatum: '31.12.2000' };
      await erst().save(nurJahr);
      await erst().save(nurDatum);
      const r = await neu();
      expect(await r.get(nurJahr.id)).toEqual(nurJahr);
      expect(await r.get(nurDatum.id)).toEqual(nurDatum);
    });

    it.each(VARIANTEN)('[REQ-033/AK-1] %s: Grenzfälle Schalttag 29.02.2024 und führende Nullen bleiben als Text erhalten', async (_n, mache) => {
      const { erst, neu } = await mache();
      const b: Buch = { id: '33000000-0000-4000-8000-000000000005', titel: 'Schaltjahr', status: 'ungelesen', erscheinungsjahr: 2024, erscheinungsdatum: '29.02.2024' };
      const c: Buch = { id: '33000000-0000-4000-8000-000000000006', titel: 'Führende Nullen', status: 'ungelesen', erscheinungsdatum: '01.01.1900' };
      await erst().save(b);
      await erst().save(c);
      const r = await neu();
      expect((await r.get(b.id))!.erscheinungsdatum).toBe('29.02.2024');
      expect((await r.get(c.id))!.erscheinungsdatum).toBe('01.01.1900');
    });
  });

  describe('AK-2 Bestehende Bücher unverändert', () => {
    it.each(VARIANTEN)('[REQ-033/AK-2] %s: Bücher im bisherigen Format (Demodaten, mit Cover) bleiben mit allen Angaben vorhanden', async (_n, mache) => {
      const { erst, neu } = await mache();
      const alt = JSON.parse(fs.readFileSync(new URL('demo/testbuecher.json', ROOT), 'utf8')) as Buch[];
      const mitCover: Buch = { id: '33000000-0000-4000-8000-000000000007', titel: 'Alt mit Cover', status: 'am_lesen', cover: 'data:image/png;base64,AAAA' };
      for (const b of [...alt, mitCover]) await erst().save(b);
      const r = await neu();
      for (const b of [...alt, mitCover]) {
        const g = await r.get(b.id);
        expect(g, b.titel).toEqual(b);
        expect(Object.keys(g!).sort(), `${b.titel}: keine zusätzlichen Angaben`).toEqual(Object.keys(b).sort());
      }
    });
  });

  describe('AK-3 Neues Buch ohne Erscheinungsdatum', () => {
    it('[REQ-033/AK-3] ein im Blatt „Manueller Eintrag“ angelegtes Buch (auch mit Jahr) hat kein Erscheinungsdatum', async () => {
      const daten = new Map<string, Buch>();
      const repo = {
        list: async () => [...daten.values()],
        get: async (id: string) => daten.get(id),
        save: async (b: Buch) => void daten.set(b.id, { ...b }),
        remove: async (id: string) => void daten.delete(id),
      } satisfies BookRepository;
      const bilder = new Map<string, string>();
      const s = {
        get: async (id: string, b: string) => bilder.get(`${id}|${b}`),
        put: async (id: string, b: string, d: string) => void bilder.set(`${id}|${b}`, d),
        remove: async (id: string, b: string) => void bilder.delete(`${id}|${b}`),
      } as ImageStore;
      render(
        <div style={farbVariablen() as CSSProperties}>
          <BuecherAnsicht repository={repo} bildspeicher={s} />
        </div>,
      );
      fireEvent.click(await screen.findByRole('button', { name: 'Buch hinzufügen' }));
      fireEvent.click(within(await screen.findByRole('menu', { name: 'Buch hinzufügen' })).getByRole('menuitem'));
      const d = await screen.findByRole('dialog', { name: 'Manueller Eintrag' });
      fireEvent.change(within(d).getByLabelText(/^\s*titel\s*$/i), { target: { value: 'Neu' } });
      fireEvent.change(within(d).getByLabelText(/^\s*jahr\s*$/i), { target: { value: '2019' } });
      fireEvent.click(within(d).getByRole('button', { name: '+ Erscheinungsdatum hinzufügen' }));
      await act(async () => {
        fireEvent.click(within(d).getByRole('button', { name: 'Hinzufügen' }));
        await new Promise((r) => setTimeout(r, 20));
      });
      const [b] = [...daten.values()];
      expect(b).toBeDefined();
      expect(b.erscheinungsjahr).toBe(2019);
      expect(b).not.toHaveProperty('erscheinungsdatum');
    });
  });
});
