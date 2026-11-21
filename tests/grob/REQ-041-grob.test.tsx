/**
 * Grober Test REQ-041 – Eintragungsdatum.
 *
 * Abgeleitet aus dem REQ-Text. Schnittstellen laut Absprache (Sprint 04, Teil C):
 *  - Buch.eingetragenAm?: string (ISO), gesetzt beim Anlegen; `jetzt` der BuecherAnsicht liefert den Zeitpunkt
 * „Neustart“ in jsdom wie bei REQ-034: neu geladene Module/Speicher auf derselben IndexedDB (fake-indexeddb).
 */
import '@testing-library/jest-dom/vitest';
import { act, cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { IDBFactory, IDBKeyRange } from 'fake-indexeddb';
import type { ComponentType } from 'react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import type { BookRepository, ImageStore } from '@/storage';

type Speicher = { repo: BookRepository; bilder: ImageStore; Ansicht: ComponentType<Record<string, unknown>> };
async function starte(): Promise<Speicher> {
  vi.resetModules();
  const st = (await import('@/storage')) as typeof import('@/storage');
  const Ansicht = (await import('@/views/BuecherAnsicht')).default as unknown as ComponentType<Record<string, unknown>>;
  return { repo: st.createBookRepository(), bilder: st.createImageStore(), Ansicht };
}
async function zeige(sp: Speicher, jetzt: () => Date) {
  const A = sp.Ansicht;
  render(<A repository={sp.repo} bildspeicher={sp.bilder} jetzt={jetzt} />);
  await screen.findByRole('heading', { name: 'Deine Bücher' });
}
async function legeAn(titel: string) {
  fireEvent.click(screen.getByRole('button', { name: 'Buch hinzufügen' }));
  fireEvent.click(within(await screen.findByRole('menu', { name: 'Buch hinzufügen' })).getByRole('menuitem'));
  const d = await screen.findByRole('dialog', { name: 'Manueller Eintrag' });
  fireEvent.change(within(d).getByLabelText(/^\s*Titel\s*$/i), { target: { value: titel } });
  await act(async () => {
    fireEvent.click(within(d).getByRole('button', { name: 'Hinzufügen' }));
    await new Promise((r) => setTimeout(r, 30));
  });
  return screen.findByRole('region', { name: 'Buchdetails' });
}
const finde = async (repo: BookRepository, titel: string) => (await repo.list()).filter((b) => b.titel === titel);

beforeEach(() => {
  vi.stubGlobal('indexedDB', new IDBFactory());
  vi.stubGlobal('IDBKeyRange', IDBKeyRange);
});
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

it('[REQ-041/GROB] „Hinzufügen“ speichert den Zeitpunkt des Anlegens', async () => {
  const zeitpunkt = new Date('2026-11-12T14:37:21.123Z');
  const s = await starte();
  await zeige(s, () => zeitpunkt);
  await legeAn('Datiert');
  const [b] = await finde(s.repo, 'Datiert');
  expect(b.eingetragenAm).toBeDefined();
  expect(Date.parse(b.eingetragenAm!)).toBe(zeitpunkt.getTime());
});
