/**
 * Akzeptanztests REQ-038 – Übersichten: Suche nach Titel oder Autor.
 *
 * Abgeleitet aus dem REQ-Text. Schnittstellen laut Absprache (Sprint 04, Teil C):
 *  input[type=search][data-suchfeld] (Placeholder „In … suchen“), ul[data-buecher] fehlt ohne Treffer.
 * Ob die Suche beim Wechsel der Pille geleert wird, steht nicht im REQ und wird nicht geprüft.
 */
import '@testing-library/jest-dom/vitest';
import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import type { Buch, LesestatusId } from '@/domain/buch';
import { InMemoryAnsichtRepository } from '@/storage';
import { InMemoryBookRepository } from '@/storage/InMemoryBookRepository';
import { InMemoryImageStore } from '@/storage/InMemoryImageStore';
import BuecherAnsicht from '@/views/BuecherAnsicht';

let nr = 0;
function buch(titel: string, status: LesestatusId = 'ungelesen', autor?: string): Buch {
  nr += 1;
  return { id: `38380000-0000-4000-8000-${String(nr).padStart(12, '0')}`, titel, status, ...(autor ? { autor } : {}), eingetragenAm: new Date(Date.UTC(2026, 0, 1) + nr * 60_000).toISOString() };
}

afterEach(() => cleanup());

const uebersicht = () => document.querySelector<HTMLElement>('[data-uebersicht]')!;
const feld = () => uebersicht().querySelector<HTMLInputElement>('input[type=search][data-suchfeld]')!;
const titel = () => Array.from(uebersicht().querySelectorAll('ul[data-buecher] > li [data-buchtitel]')).map((t) => t.textContent?.trim());
const tippe = (text: string) => fireEvent.change(feld(), { target: { value: text } });
const geladen = () => waitFor(() => expect(document.querySelector('[data-uebersicht]')?.getAttribute('data-ansicht')).toMatch(/^(raster|liste)$/));

async function zeige(buecher: Buch[], liste: 'Alle' | 'Noch zu lesen' | 'Gerade am Lesen' = 'Alle') {
  const repository = new InMemoryBookRepository();
  for (const b of buecher) await repository.save(b);
  render(<BuecherAnsicht repository={repository} bildspeicher={new InMemoryImageStore()} ansichtRepository={new InMemoryAnsichtRepository()} jetzt={() => new Date('2026-11-12T10:00:00Z')} />);
  await waitFor(() => expect(document.querySelector('[data-abschnitt="alle-buecher"] ul, [data-abschnitt="alle-buecher"] [data-leere-liste]')).not.toBeNull());
  if (liste === 'Noch zu lesen') fireEvent.click(document.querySelector('[data-abschnitt="noch-zu-lesen"] [data-alle-ansehen]')!);
  else fireEvent.click(within(screen.getByRole('group', { name: 'Filter' })).getByRole('button', { name: liste }));
  await geladen();
}

describe('REQ-038 Übersichten: Suche', () => {
  describe('AK-1 Suchfeld-Text', () => {
    it('[REQ-038/AK-1] Alle: leeres Suchfeld zeigt genau „In Alle Bücher suchen“', async () => {
      await zeige([buch('A')]);
      expect(feld().value).toBe('');
      expect(feld().placeholder).toBe('In Alle Bücher suchen');
    });

    it('[REQ-038/AK-1] Noch zu lesen: leeres Suchfeld zeigt genau „In Noch zu lesen suchen“', async () => {
      await zeige([buch('A')], 'Noch zu lesen');
      expect(feld().value).toBe('');
      expect(feld().placeholder).toBe('In Noch zu lesen suchen');
    });

    it('[REQ-038/AK-1] das Suchfeld steht im oberen Bereich, vor der Bücherliste', async () => {
      await zeige([buch('A')]);
      const ul = uebersicht().querySelector('ul[data-buecher]')!;
      expect(feld().compareDocumentPosition(ul) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    });
  });

  describe('AK-2 Titel, Wortteil, Groß/Klein', () => {
    it('[REQ-038/AK-2] „BOU“ → nur „Dire bound“, Ergebnis nach jedem Zeichen ohne Bestätigung', async () => {
      await zeige([buch('Dire bound'), buch('Threshing day', 'gelesen')]);
      expect(titel()).toEqual(['Dire bound', 'Threshing day']);
      tippe('B');
      expect(titel()).toEqual(['Dire bound']); // „b“ nur in „Dire bound“
      tippe('BO');
      expect(titel()).toEqual(['Dire bound']);
      tippe('BOU');
      expect(titel()).toEqual(['Dire bound']);
    });

    it.each([
      ['h', ['Threshing day']],
      ['D', ['Dire bound', 'Threshing day']],
      ['ING D', ['Threshing day']],
      ['dire BOUND', ['Dire bound']],
      ['ound', ['Dire bound']],
    ])('[REQ-038/AK-2] Variante „%s“ → %j', async (begriff, soll) => {
      await zeige([buch('Dire bound'), buch('Threshing day', 'gelesen')]);
      tippe(begriff);
      expect(titel()).toEqual(soll);
    });
  });

  describe('AK-3 Vorname und Nachname', () => {
    it.each(['sable', 'soren', 'SORENSEN', 'Sable Sor', 'ble'])('[REQ-038/AK-3] „%s“ → nur das Buch von Sable Sorensen', async (begriff) => {
      await zeige([buch('Erstes Buch', 'ungelesen', 'Sable Sorensen'), buch('Zweites Buch', 'gelesen', 'Anna Berg'), buch('Ohne Autor')]);
      tippe(begriff);
      expect(titel()).toEqual(['Erstes Buch']);
    });

    it('[REQ-038/AK-3] Treffer in Titel ODER Autor werden gemeinsam angezeigt', async () => {
      await zeige([buch('Berg der Seelen', 'ungelesen', 'X'), buch('Tal', 'gelesen', 'Anna Berg'), buch('See', 'am_lesen', 'Y')]);
      tippe('berg');
      expect(titel()).toEqual(['Berg der Seelen', 'Tal']);
    });
  });

  describe('AK-4 Kein Treffer', () => {
    it.each(['raster', 'liste'] as const)('[REQ-038/AK-4] (%s) „xyz“ → kein Buch und kein Hinweistext', async (a) => {
      await zeige([buch('Alpha', 'ungelesen', 'Bert'), buch('Beta', 'gelesen')]);
      fireEvent.click(uebersicht().querySelector(`[data-ansicht-wahl="${a}"]`)!);
      const vorText = uebersicht().textContent?.replace(uebersicht().querySelector('ul[data-buecher]')!.textContent ?? '', '');
      tippe('xyz');
      expect(uebersicht().querySelector('ul[data-buecher]')).toBeNull();
      expect(uebersicht().querySelectorAll('li, [data-leere-liste], [data-cover-platzhalter]')).toHaveLength(0);
      // Einzige Textänderung: die Anzahl (REQ-036, AK-10)
      expect(uebersicht().textContent?.replace('0 Bücher', '')).toBe(vorText?.replace('2 Bücher', ''));
    });
  });

  describe('AK-5 Nur innerhalb der Übersicht', () => {
    it('[REQ-038/AK-5] Noch zu lesen: „alpha“ → nur „Alpha“, nicht das gelesene „Alphabet“', async () => {
      await zeige([buch('Alpha'), buch('Alphabet', 'gelesen')], 'Noch zu lesen');
      tippe('alpha');
      expect(titel()).toEqual(['Alpha']);
    });

    it('[REQ-038/AK-5] Gerade am Lesen: Suche nur unter den Büchern „am lesen“', async () => {
      await zeige([buch('Alpha'), buch('Alphabet', 'am_lesen'), buch('Alphorn', 'gelesen')], 'Gerade am Lesen');
      tippe('alph');
      expect(titel()).toEqual(['Alphabet']);
    });

    it('[REQ-038/AK-5] Gegenprobe Alle: „alpha“ findet beide', async () => {
      await zeige([buch('Alpha'), buch('Alphabet', 'gelesen')]);
      tippe('alpha');
      expect(titel()).toEqual(['Alpha', 'Alphabet']);
    });
  });

  describe('AK-6 Suchfeld leeren', () => {
    it('[REQ-038/AK-6] nach dem Leeren wieder alle Bücher in A–Z-Reihenfolge; Platzhaltertext wieder sichtbar', async () => {
      await zeige([buch('Zeder'), buch('Ahorn', 'gelesen'), buch('Birke', 'am_lesen')]);
      tippe('ahorn');
      expect(titel()).toEqual(['Ahorn']);
      tippe('');
      expect(titel()).toEqual(['Ahorn', 'Birke', 'Zeder']);
      expect(feld().value).toBe('');
      expect(feld().placeholder).toBe('In Alle Bücher suchen');
    });

    it('[REQ-038/AK-6] auch nach „kein Treffer“ kommt die Liste beim Leeren zurück', async () => {
      await zeige([buch('Eins'), buch('Zwei')]);
      tippe('xyz');
      expect(uebersicht().querySelector('ul[data-buecher]')).toBeNull();
      tippe('');
      expect(titel()).toEqual(['Eins', 'Zwei']);
    });
  });
});
