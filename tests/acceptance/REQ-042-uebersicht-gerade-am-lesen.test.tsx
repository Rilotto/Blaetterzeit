/**
 * Akzeptanztests REQ-042 – Übersicht „Gerade am Lesen“ über die Filterpille.
 * Abgeleitet aus dem REQ-Text; Schnittstellen laut Absprache (Sprint 04, Teil C).
 */
import '@testing-library/jest-dom/vitest';
import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import App from '@/App';
import type { Buch, LesestatusId } from '@/domain/buch';
import { InMemoryAnsichtRepository } from '@/storage';
import { InMemoryBookRepository } from '@/storage/InMemoryBookRepository';
import { InMemoryImageStore } from '@/storage/InMemoryImageStore';
import BuecherAnsicht from '@/views/BuecherAnsicht';

const T = vi.hoisted(() => ({
  buecher: [{ id: '42000000-0000-4000-8000-000000000001', titel: 'Demo L', status: 'am_lesen' as const, eingetragenAm: '2026-01-01T00:00:00.000Z' }],
}));
vi.mock('@/buecher/demodaten', () => ({ demoBuecher: T.buecher }));

let nr = 0;
function buch(titel: string, status: LesestatusId = 'am_lesen'): Buch {
  nr += 1;
  return { id: `42420000-0000-4000-8000-${String(nr).padStart(12, '0')}`, titel, status, eingetragenAm: new Date(Date.UTC(2026, 0, 1) + nr * 60_000).toISOString() };
}

afterEach(() => cleanup());

const uebersicht = () => document.querySelector<HTMLElement>('[data-uebersicht]');
const leiste = () => screen.getByRole('group', { name: 'Filter' });
const aktive = () => within(leiste()).getAllByRole('button').filter((b) => b.getAttribute('aria-pressed') === 'true').map((b) => b.textContent?.trim());
const titel = () => Array.from(uebersicht()!.querySelectorAll('ul[data-buecher] > li [data-buchtitel]')).map((t) => t.textContent?.trim());
const geladen = () => waitFor(() => expect(uebersicht()?.getAttribute('data-ansicht')).toMatch(/^(raster|liste)$/));
const tippe = (n: string) => fireEvent.click(within(leiste()).getByRole('button', { name: n }));

async function zeige(buecher: Buch[]) {
  const repository = new InMemoryBookRepository();
  for (const b of buecher) await repository.save(b);
  render(<BuecherAnsicht repository={repository} bildspeicher={new InMemoryImageStore()} ansichtRepository={new InMemoryAnsichtRepository()} jetzt={() => new Date('2026-11-12T10:00:00Z')} />);
  await waitFor(() => expect(document.querySelector('[data-abschnitt="alle-buecher"] ul, [data-abschnitt="alle-buecher"] [data-leere-liste]')).not.toBeNull());
}

describe('REQ-042 Übersicht „Gerade am Lesen“', () => {
  describe('AK-1 Öffnen über die Pille', () => {
    it('[REQ-042/AK-1] App: „Gerade am Lesen“ antippen → Übersicht, Pille aktiv, Menüpunkt „Bücher“ bleibt', async () => {
      render(<App />);
      const nav = screen.getByRole('navigation', { name: 'Hauptnavigation' });
      fireEvent.click(within(nav).getByRole('button', { name: 'Bücher' }));
      tippe('Gerade am Lesen');
      await geladen();
      expect(uebersicht()!.getAttribute('data-uebersicht')).toBe('gerade_am_lesen');
      expect(document.querySelector('[data-seite="buecher"]')).toBeNull();
      expect(aktive()).toEqual(['Gerade am Lesen']);
      expect(within(nav).getByRole('button', { name: 'Bücher' })).toHaveAttribute('aria-current', 'page');
    });

    it('[REQ-042/AK-1] auch aus einer anderen Übersicht („Alle“) heraus', async () => {
      await zeige([buch('L'), buch('U', 'ungelesen')]);
      tippe('Alle');
      await geladen();
      tippe('Gerade am Lesen');
      await geladen();
      expect(uebersicht()!.getAttribute('data-uebersicht')).toBe('gerade_am_lesen');
      expect(aktive()).toEqual(['Gerade am Lesen']);
      expect(titel()).toEqual(['L']);
    });
  });

  describe('AK-2 Nur Bücher „am lesen“, A–Z', () => {
    it('[REQ-042/AK-2] „Zeit“, „Asche“ (am lesen), „Berg“ (ungelesen) → genau „Asche“, „Zeit“', async () => {
      await zeige([buch('Zeit'), buch('Asche'), buch('Berg', 'ungelesen')]);
      tippe('Gerade am Lesen');
      await geladen();
      expect(titel()).toEqual(['Asche', 'Zeit']);
      expect(uebersicht()!.querySelector('[data-buecherzahl]')?.textContent?.trim()).toBe('2 Bücher');
    });

    it('[REQ-042/AK-2] keine anderen Lesestatus; kein Buch „am lesen“ → leere Liste', async () => {
      await zeige([buch('G', 'gelesen'), buch('A', 'abgebrochen'), buch('W', 'wunschliste'), buch('U', 'ungelesen')]);
      tippe('Gerade am Lesen');
      await geladen();
      expect(uebersicht()!.querySelector('ul[data-buecher]')).toBeNull();
      expect(uebersicht()!.querySelector('[data-buecherzahl]')?.textContent?.trim()).toBe('0 Bücher');
    });

    it('[REQ-042/AK-2] Buchdetails aus der Übersicht, Zurück → wieder „Gerade am Lesen“', async () => {
      await zeige([buch('Zeit'), buch('Asche')]);
      tippe('Gerade am Lesen');
      await geladen();
      fireEvent.click(uebersicht()!.querySelector('ul[data-buecher] [data-buchtitel]')!);
      const d = await screen.findByRole('region', { name: 'Buchdetails' });
      fireEvent.click(within(d).getByRole('button', { name: 'Zurück' }));
      await geladen();
      expect(uebersicht()!.getAttribute('data-uebersicht')).toBe('gerade_am_lesen');
    });
  });

  describe('AK-3 Suchfeld-Text', () => {
    it('[REQ-042/AK-3] leeres Suchfeld zeigt genau „In Gerade am Lesen suchen“; Suche nur in „am lesen“', async () => {
      await zeige([buch('Asche'), buch('Aschenbecher', 'gelesen')]);
      tippe('Gerade am Lesen');
      await geladen();
      const f = uebersicht()!.querySelector<HTMLInputElement>('input[type=search][data-suchfeld]')!;
      expect(f.value).toBe('');
      expect(f.placeholder).toBe('In Gerade am Lesen suchen');
      fireEvent.change(f, { target: { value: 'asche' } });
      expect(titel()).toEqual(['Asche']);
    });
  });
});
