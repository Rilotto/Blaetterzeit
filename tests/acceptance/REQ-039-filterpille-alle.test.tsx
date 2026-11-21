/**
 * Akzeptanztests REQ-039 – Filterleiste: Filterpille „Alle“ öffnet die Übersicht „Alle Bücher“.
 * Abgeleitet aus dem REQ-Text; Schnittstellen laut Absprache (Sprint 04, Teil C).
 */
import '@testing-library/jest-dom/vitest';
import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import App from '@/App';
import { filterKonfiguration } from '@/buecher/filterKonfiguration';
import type { Buch, LesestatusId } from '@/domain/buch';
import { InMemoryAnsichtRepository } from '@/storage';
import { InMemoryBookRepository } from '@/storage/InMemoryBookRepository';
import { InMemoryImageStore } from '@/storage/InMemoryImageStore';
import BuecherAnsicht from '@/views/BuecherAnsicht';

const T = vi.hoisted(() => ({
  buecher: [
    { id: '39000000-0000-4000-8000-000000000001', titel: 'Demo U', status: 'ungelesen' as const, eingetragenAm: '2026-01-01T00:00:00.000Z' },
    { id: '39000000-0000-4000-8000-000000000002', titel: 'Demo G', status: 'gelesen' as const, eingetragenAm: '2026-01-02T00:00:00.000Z' },
  ],
}));
vi.mock('@/buecher/demodaten', () => ({ demoBuecher: T.buecher }));

const ALLE_STATUS: LesestatusId[] = ['ungelesen', 'am_lesen', 'gelesen', 'abgebrochen', 'wunschliste'];
let nr = 0;
function buch(titel: string, status: LesestatusId = 'ungelesen'): Buch {
  nr += 1;
  return { id: `39390000-0000-4000-8000-${String(nr).padStart(12, '0')}`, titel, status, eingetragenAm: new Date(Date.UTC(2026, 0, 1) + nr * 60_000).toISOString() };
}

afterEach(() => cleanup());

const leiste = () => screen.getByRole('group', { name: 'Filter' });
const pillen = () => within(leiste()).getAllByRole('button');
const aktive = () => pillen().filter((b) => b.getAttribute('aria-pressed') === 'true').map((b) => b.textContent?.trim());
const uebersicht = () => document.querySelector<HTMLElement>('[data-uebersicht]');
const geladen = () => waitFor(() => expect(uebersicht()?.getAttribute('data-ansicht')).toMatch(/^(raster|liste)$/));

async function zeige(buecher: Buch[]) {
  const repository = new InMemoryBookRepository();
  for (const b of buecher) await repository.save(b);
  render(<BuecherAnsicht repository={repository} bildspeicher={new InMemoryImageStore()} ansichtRepository={new InMemoryAnsichtRepository()} jetzt={() => new Date('2026-11-12T10:00:00Z')} />);
  await waitFor(() => expect(document.querySelector('[data-abschnitt="alle-buecher"] ul, [data-abschnitt="alle-buecher"] [data-leere-liste]')).not.toBeNull());
}

describe('REQ-039 Filterpille „Alle“', () => {
  describe('AK-1 Pille „Alle“ vorhanden', () => {
    it('[REQ-039/AK-1] ganz links, vor „Für dich“, Beschriftung genau „Alle“, ohne Zahl', async () => {
      await zeige(ALLE_STATUS.map((s) => buch(`B ${s}`, s)));
      const p = pillen();
      expect(p[0].textContent).toBe('Alle');
      expect(p[1].textContent?.trim()).toBe('Für dich');
      expect(p[0].textContent).not.toMatch(/\d/);
    });

    it('[REQ-039/AK-1] in der Konfiguration an erster Stelle; „Für dich“ bleibt Standard auf der Seite „Bücher“', async () => {
      const s = [...filterKonfiguration].sort((a, b) => a.reihenfolge - b.reihenfolge);
      expect(s[0].name).toBe('Alle');
      expect(s[0].standard).toBeFalsy();
      await zeige([buch('X')]);
      expect(aktive()).toEqual(['Für dich']);
    });
  });

  describe('AK-2 Antippen öffnet die Übersicht', () => {
    it('[REQ-039/AK-2] „Alle“ antippen → Übersicht „Alle Bücher“, „Alle“ ist dort einziger aktiver Filter', async () => {
      await zeige([buch('A'), buch('B', 'gelesen')]);
      fireEvent.click(within(leiste()).getByRole('button', { name: 'Alle' }));
      await geladen();
      expect(uebersicht()!.getAttribute('data-uebersicht')).toBe('alle');
      expect(document.querySelector('[data-seite="buecher"]')).toBeNull();
      expect(aktive()).toEqual(['Alle']);
      expect(within(leiste()).getByRole('button', { name: 'Alle' })).toHaveAttribute('data-filter', 'alle');
    });

    it('[REQ-039/AK-2] in der App bleibt der Menüpunkt „Bücher“ aktiv; auch ohne Bücher öffnet sich die Übersicht', async () => {
      render(<App />);
      const nav = screen.getByRole('navigation', { name: 'Hauptnavigation' });
      fireEvent.click(within(nav).getByRole('button', { name: 'Bücher' }));
      fireEvent.click(within(leiste()).getByRole('button', { name: 'Alle' }));
      await geladen();
      expect(uebersicht()!.getAttribute('data-uebersicht')).toBe('alle');
      expect(within(nav).getByRole('button', { name: 'Bücher' })).toHaveAttribute('aria-current', 'page');
      cleanup();
      await zeige([]);
      fireEvent.click(within(leiste()).getByRole('button', { name: 'Alle' }));
      await geladen();
      expect(aktive()).toEqual(['Alle']);
    });
  });

  describe('AK-3 Filterlogik wählt alle Bücher', () => {
    const logik = () => filterKonfiguration.find((f) => f.name === 'Alle')!.logik!;

    it('[REQ-039/AK-3] je ein Buch jedes Lesestatus → alle', () => {
      const b = ALLE_STATUS.map((s) => buch(`L ${s}`, s));
      const e = logik()(b);
      expect(e.map((x) => x.id).sort()).toEqual(b.map((x) => x.id).sort());
    });

    it('[REQ-039/AK-3] Grenzfälle: leere Liste → leer; 25 Bücher → 25; Eingabe bleibt unverändert', () => {
      expect(logik()([])).toEqual([]);
      const b = Array.from({ length: 25 }, (_, i) => buch(`V${i}`, ALLE_STATUS[i % 5]));
      const kopie = JSON.stringify(b);
      expect(logik()(b)).toHaveLength(25);
      expect(JSON.stringify(b)).toBe(kopie);
    });
  });

  describe('AK-4 „Alle ansehen ›“ aktiviert ebenfalls „Alle“', () => {
    it('[REQ-039/AK-4] „Alle ansehen ›“ im Abschnitt „Alle Bücher“ → Pille „Alle“ aktiv', async () => {
      await zeige([buch('A')]);
      fireEvent.click(document.querySelector('[data-abschnitt="alle-buecher"] [data-alle-ansehen]')!);
      await geladen();
      expect(uebersicht()!.getAttribute('data-uebersicht')).toBe('alle');
      expect(aktive()).toEqual(['Alle']);
    });
  });
});
