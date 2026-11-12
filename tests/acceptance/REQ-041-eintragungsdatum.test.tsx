/**
 * Akzeptanztests REQ-041 – Eintragungsdatum.
 *
 * Abgeleitet aus dem REQ-Text. Schnittstellen laut Absprache (Sprint 04, Teil C):
 *  - Buch.eingetragenAm?: string (ISO), gesetzt beim Anlegen; `jetzt` der BuecherAnsicht liefert den Zeitpunkt
 * „Neustart“ in jsdom wie bei REQ-034: neu geladene Module/Speicher auf derselben IndexedDB (fake-indexeddb).
 */
import '@testing-library/jest-dom/vitest';
import { act, cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { IDBFactory, IDBKeyRange } from 'fake-indexeddb';
import type { ComponentType } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
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

describe('REQ-041 Eintragungsdatum', () => {
  describe('AK-1 Gesetzt beim Anlegen', () => {
    it('[REQ-041/AK-1] „Hinzufügen“ speichert den Zeitpunkt des Anlegens', async () => {
      const zeitpunkt = new Date('2026-11-12T14:37:21.123Z');
      const s = await starte();
      await zeige(s, () => zeitpunkt);
      await legeAn('Datiert');
      const [b] = await finde(s.repo, 'Datiert');
      expect(b.eingetragenAm).toBeDefined();
      expect(Date.parse(b.eingetragenAm!)).toBe(zeitpunkt.getTime());
    });

    it('[REQ-041/AK-1] zwei nacheinander angelegte Bücher erhalten jeweils ihren eigenen Zeitpunkt', async () => {
      let t = new Date('2026-03-01T08:00:00.000Z');
      const s = await starte();
      await zeige(s, () => t);
      let d = await legeAn('Früh');
      fireEvent.click(within(d).getByRole('button', { name: 'Zurück' }));
      await screen.findByRole('heading', { name: 'Deine Bücher' });
      t = new Date('2026-03-02T09:30:00.000Z');
      d = await legeAn('Spät');
      expect(Date.parse((await finde(s.repo, 'Früh'))[0].eingetragenAm!)).toBe(Date.parse('2026-03-01T08:00:00.000Z'));
      expect(Date.parse((await finde(s.repo, 'Spät'))[0].eingetragenAm!)).toBe(Date.parse('2026-03-02T09:30:00.000Z'));
    });

    it('[REQ-041/AK-1] ohne Test-Uhr wird die aktuelle Zeit verwendet', async () => {
      const s = await starte();
      const A = s.Ansicht;
      render(<A repository={s.repo} bildspeicher={s.bilder} />);
      await screen.findByRole('heading', { name: 'Deine Bücher' });
      const vorher = Date.now();
      await legeAn('Echtzeit');
      const nachher = Date.now();
      const t = Date.parse((await finde(s.repo, 'Echtzeit'))[0].eingetragenAm!);
      expect(t).toBeGreaterThanOrEqual(vorher - 1000);
      expect(t).toBeLessThanOrEqual(nachher + 1000);
    });
  });

  describe('AK-2 Dauerhaft', () => {
    it('[REQ-041/AK-2] nach Neustart (zweimal) dasselbe Eintragungsdatum', async () => {
      const s1 = await starte();
      await zeige(s1, () => new Date('2025-12-31T23:59:59.000Z'));
      await legeAn('Dauer');
      const [vorher] = await finde(s1.repo, 'Dauer');
      cleanup();
      for (let i = 0; i < 2; i++) {
        const s = await starte();
        const n = await finde(s.repo, 'Dauer');
        expect(n).toHaveLength(1);
        expect(n[0].eingetragenAm, `Neustart ${i + 1}`).toBe(vorher.eingetragenAm);
      }
    });

    it('[REQ-041/AK-2] Öffnen der Buchdetails und Zurück ändert das Eintragungsdatum nicht', async () => {
      let t = new Date('2026-05-05T05:05:05.000Z');
      const s = await starte();
      await zeige(s, () => t);
      const d = await legeAn('Unverändert');
      const [vorher] = await finde(s.repo, 'Unverändert');
      t = new Date('2027-01-01T00:00:00.000Z');
      fireEvent.click(within(d).getByRole('button', { name: 'Zurück' }));
      await screen.findByRole('heading', { name: 'Deine Bücher' });
      const titelEl = document.querySelector('[data-abschnitt="alle-buecher"] [data-buchtitel]') as HTMLElement;
      fireEvent.click(titelEl);
      await screen.findByRole('region', { name: 'Buchdetails' });
      cleanup();
      const s2 = await starte();
      expect((await finde(s2.repo, 'Unverändert'))[0].eingetragenAm).toBe(vorher.eingetragenAm);
    });
  });

  describe('Anforderung: keine Änderungsmöglichkeit für den Nutzer', () => {
    it('[REQ-041/AK-1] weder Blatt „Manueller Eintrag“ noch Buchdetails bieten ein Feld für das Eintragungsdatum', async () => {
      const s = await starte();
      await zeige(s, () => new Date('2026-11-12T10:00:00Z'));
      fireEvent.click(screen.getByRole('button', { name: 'Buch hinzufügen' }));
      fireEvent.click(within(await screen.findByRole('menu', { name: 'Buch hinzufügen' })).getByRole('menuitem'));
      const dlg = await screen.findByRole('dialog', { name: 'Manueller Eintrag' });
      const verboten = /eingetragen|eintragung|eintragsdatum/i;
      const felder = (el: HTMLElement) =>
        Array.from(el.querySelectorAll('input, textarea, select')).map((f) => `${f.getAttribute('aria-label') ?? ''} ${f.getAttribute('name') ?? ''} ${f.getAttribute('type') ?? ''}`);
      expect(felder(dlg).filter((f) => verboten.test(f) || /date|time/i.test(f))).toEqual([]);
      expect(dlg.textContent ?? '').not.toMatch(verboten);
      cleanup();
      await zeige(s, () => new Date('2026-11-12T10:00:00Z'));
      const det = await legeAn('Ohne Feld');
      expect(felder(det).filter((f) => verboten.test(f) || /date|time/i.test(f))).toEqual([]);
      expect(det.textContent ?? '').not.toMatch(verboten);
    });
  });
});
