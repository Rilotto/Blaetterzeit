/**
 * Akzeptanztests REQ-040 – Übersicht „Noch zu lesen“ über „Alle ansehen ›“.
 * Abgeleitet aus dem REQ-Text; Schnittstellen laut Absprache (Sprint 04, Teil C).
 * Offene Frage (Pille „Noch zu lesen“ auf der Seite „Bücher“) wird hier bewusst nicht geprüft.
 */
import '@testing-library/jest-dom/vitest';
import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import App from '@/App';
import { abschnittKonfiguration } from '@/buecher/abschnittKonfiguration';
import type { Buch, LesestatusId } from '@/domain/buch';
import { InMemoryAnsichtRepository } from '@/storage';
import { InMemoryBookRepository } from '@/storage/InMemoryBookRepository';
import { InMemoryImageStore } from '@/storage/InMemoryImageStore';
import BuecherAnsicht from '@/views/BuecherAnsicht';

const T = vi.hoisted(() => ({
  buecher: [{ id: '40000000-0000-4000-8000-000000000001', titel: 'Demo U', status: 'ungelesen' as const, eingetragenAm: '2026-01-01T00:00:00.000Z' }],
}));
vi.mock('@/buecher/demodaten', () => ({ demoBuecher: T.buecher }));

let nr = 0;
function buch(titel: string, status: LesestatusId = 'ungelesen'): Buch {
  nr += 1;
  return { id: `40400000-0000-4000-8000-${String(nr).padStart(12, '0')}`, titel, status, eingetragenAm: new Date(Date.UTC(2026, 0, 1) + nr * 60_000).toISOString() };
}

afterEach(() => cleanup());

const uebersicht = () => document.querySelector<HTMLElement>('[data-uebersicht]');
const aktive = () =>
  within(screen.getByRole('group', { name: 'Filter' }))
    .getAllByRole('button')
    .filter((b) => b.getAttribute('aria-pressed') === 'true')
    .map((b) => b.textContent?.trim());
const titel = () => Array.from(uebersicht()!.querySelectorAll('ul[data-buecher] > li [data-buchtitel]')).map((t) => t.textContent?.trim());
const geladen = () => waitFor(() => expect(uebersicht()?.getAttribute('data-ansicht')).toMatch(/^(raster|liste)$/));
const alleAnsehen = () => fireEvent.click(document.querySelector('[data-abschnitt="noch-zu-lesen"] [data-alle-ansehen]')!);

async function zeige(buecher: Buch[]) {
  const repository = new InMemoryBookRepository();
  for (const b of buecher) await repository.save(b);
  render(<BuecherAnsicht repository={repository} bildspeicher={new InMemoryImageStore()} ansichtRepository={new InMemoryAnsichtRepository()} jetzt={() => new Date('2026-11-12T10:00:00Z')} />);
  await waitFor(() => expect(document.querySelector('[data-abschnitt="alle-buecher"] ul, [data-abschnitt="alle-buecher"] [data-leere-liste]')).not.toBeNull());
  alleAnsehen();
  await geladen();
}

describe('REQ-040 Übersicht „Noch zu lesen“', () => {
  describe('AK-1 Öffnen', () => {
    it('[REQ-040/AK-1] App: „Alle ansehen ›“ in „Noch zu lesen“ → Übersicht, Pille „Noch zu lesen“ aktiv, Menüpunkt „Bücher“ bleibt', async () => {
      render(<App />);
      const nav = screen.getByRole('navigation', { name: 'Hauptnavigation' });
      fireEvent.click(within(nav).getByRole('button', { name: 'Bücher' }));
      await waitFor(() => expect(document.querySelector('[data-abschnitt="noch-zu-lesen"] ul')).not.toBeNull());
      alleAnsehen();
      await geladen();
      expect(uebersicht()!.getAttribute('data-uebersicht')).toBe('noch_zu_lesen');
      expect(document.querySelector('[data-seite="buecher"]')).toBeNull();
      expect(aktive()).toEqual(['Noch zu lesen']);
      expect(within(nav).getByRole('button', { name: 'Bücher' })).toHaveAttribute('aria-current', 'page');
    });

    it('[REQ-040/AK-1] Grenzfall: auch ohne zugeordnete Bücher öffnet sich die Übersicht (leer, „0 Bücher“)', async () => {
      await zeige([buch('Fertig', 'gelesen')]);
      expect(uebersicht()!.getAttribute('data-uebersicht')).toBe('noch_zu_lesen');
      expect(uebersicht()!.querySelector('ul[data-buecher]')).toBeNull();
      expect(uebersicht()!.querySelector('[data-buecherzahl]')?.textContent?.trim()).toBe('0 Bücher');
    });
  });

  describe('AK-2 Nur zugeordnete Bücher, A–Z', () => {
    it('[REQ-040/AK-2] „Zeit“, „Asche“ (ungelesen), „Berg“ (gelesen) → genau „Asche“, „Zeit“', async () => {
      await zeige([buch('Zeit'), buch('Asche'), buch('Berg', 'gelesen')]);
      expect(titel()).toEqual(['Asche', 'Zeit']);
      expect(uebersicht()!.querySelector('[data-buecherzahl]')?.textContent?.trim()).toBe('2 Bücher');
    });

    it('[REQ-040/AK-2] am lesen, abgebrochen, Wunschliste gehören bei Vorbelegung nicht dazu; keine Begrenzung (12)', async () => {
      const u = Array.from({ length: 12 }, (_, i) => buch(`U${String(i).padStart(2, '0')}`));
      await zeige([...u, buch('L', 'am_lesen'), buch('Ab', 'abgebrochen'), buch('W', 'wunschliste')]);
      expect(titel()).toEqual(u.map((b) => b.titel));
    });

    it('[REQ-040/AK-2] folgt der zentralen Abschnittszuordnung (REQ-009): mit „gelesen“ erweitert erscheint auch „Berg“', async () => {
      const alt = [...abschnittKonfiguration.nochZuLesen.lesestatus];
      abschnittKonfiguration.nochZuLesen.lesestatus.push('gelesen');
      try {
        await zeige([buch('Zeit'), buch('Asche'), buch('Berg', 'gelesen'), buch('Lesend', 'am_lesen')]);
        expect(titel()).toEqual(['Asche', 'Berg', 'Zeit']);
      } finally {
        abschnittKonfiguration.nochZuLesen.lesestatus.splice(0, Infinity, ...alt);
      }
    });
  });

  describe('AK-3 Gleiche Ansichtsoptionen', () => {
    it('[REQ-040/AK-3] Umschalter mit Raster und Liste sowie Suchfeld „In Noch zu lesen suchen“, beide wirksam', async () => {
      await zeige([buch('Zeit'), buch('Asche'), buch('Berg', 'gelesen')]);
      const g = within(uebersicht()!).getByRole('group', { name: 'Ansicht' });
      expect(within(g).getAllByRole('button').map((b) => b.getAttribute('data-ansicht-wahl')).sort()).toEqual(['liste', 'raster']);
      for (const a of ['liste', 'raster'] as const) {
        fireEvent.click(g.querySelector(`[data-ansicht-wahl="${a}"]`)!);
        await waitFor(() => expect(uebersicht()!.getAttribute('data-ansicht')).toBe(a));
        expect(titel()).toEqual(['Asche', 'Zeit']);
      }
      const feld = uebersicht()!.querySelector<HTMLInputElement>('input[type=search][data-suchfeld]')!;
      expect(feld.placeholder).toBe('In Noch zu lesen suchen');
      fireEvent.change(feld, { target: { value: 'ZEI' } });
      expect(titel()).toEqual(['Zeit']);
      expect(uebersicht()!.querySelector('[data-sortierknopf]')?.textContent?.trim()).toBe('Zuletzt');
    });

    it('[REQ-040/AK-3] Buch antippen → Buchdetails → Zurück führt in die Übersicht „Noch zu lesen“', async () => {
      await zeige([buch('Zeit'), buch('Asche')]);
      fireEvent.click(uebersicht()!.querySelector('ul[data-buecher] [data-buchtitel]')!);
      const d = await screen.findByRole('region', { name: 'Buchdetails' });
      await waitFor(() => expect(d.querySelector('[data-buchdetails-titel]')?.textContent?.trim()).toBe('Asche'));
      fireEvent.click(within(d).getByRole('button', { name: 'Zurück' }));
      await geladen();
      expect(uebersicht()!.getAttribute('data-uebersicht')).toBe('noch_zu_lesen');
      expect(aktive()).toEqual(['Noch zu lesen']);
    });
  });
});
