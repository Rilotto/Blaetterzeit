/**
 * Akzeptanztests REQ-037 – Übersichten: Raster oder Liste, zuletzt gewählte Ansicht je Liste gemerkt.
 *
 * Abgeleitet aus dem REQ-Text. Schnittstellen laut Absprache (Sprint 04, Teil C):
 *  - role=group "Ansicht" mit [data-ansicht-wahl=raster|liste] (aria-pressed); Übersicht data-ansicht
 *  - li[data-rastereintrag=id] / li[data-listenkarte=id] mit [data-buchtitel], [data-autorzeile] ([data-icon], [data-autor])
 *  - Listenkarte: role=progressbar + [data-fortschrittstext] oder [data-statuschip=status-id]
 *  - AnsichtRepository (src/storage/AnsichtRepository.ts); „Neustart“ = neu rendern mit demselben Speicher
 * Die Standardansicht (vor der ersten Wahl) ist nicht Teil des REQ und wird nicht geprüft.
 */
import '@testing-library/jest-dom/vitest';
import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { Buch, LesestatusId } from '@/domain/buch';
import { LESESTATUS } from '@/domain/buch';
import { InMemoryAnsichtRepository, type AnsichtRepository } from '@/storage';
import { InMemoryBookRepository } from '@/storage/InMemoryBookRepository';
import { InMemoryImageStore } from '@/storage/InMemoryImageStore';
import BuecherAnsicht from '@/views/BuecherAnsicht';

const T = vi.hoisted(() => ({
  buecher: [{ id: '37000000-0000-4000-8000-000000000001', titel: 'Demo', status: 'ungelesen' as const, eingetragenAm: '2026-01-01T00:00:00.000Z' }],
}));
vi.mock('@/buecher/demodaten', () => ({ demoBuecher: T.buecher }));

const PNG = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAIAAACQd1PeAAAADElEQVR4nGP4z8AAAAMBAQDJ/pLvAAAAAElFTkSuQmCC';
let nr = 0;
function buch(titel: string, status: LesestatusId = 'ungelesen', extra: Partial<Buch> = {}): Buch {
  nr += 1;
  return { id: `37370000-0000-4000-8000-${String(nr).padStart(12, '0')}`, titel, status, eingetragenAm: new Date(Date.UTC(2026, 0, 1) + nr * 60_000).toISOString(), ...extra };
}

afterEach(() => cleanup());

const uebersicht = () => document.querySelector<HTMLElement>('[data-uebersicht]');
const pille = (name: string) => within(screen.getByRole('group', { name: 'Filter' })).getByRole('button', { name });
const geladen = () => waitFor(() => expect(uebersicht()?.getAttribute('data-ansicht')).toMatch(/^(raster|liste)$/));
const eintraege = () => Array.from(uebersicht()!.querySelectorAll<HTMLElement>('ul[data-buecher] > li'));
const titel = () => eintraege().map((li) => li.querySelector('[data-buchtitel]')?.textContent?.trim());
const eintrag = (t: string) => eintraege().find((li) => li.querySelector('[data-buchtitel]')?.textContent?.trim() === t)!;
async function ansicht(a: 'raster' | 'liste') {
  fireEvent.click(uebersicht()!.querySelector(`[data-ansicht-wahl="${a}"]`)!);
  await waitFor(() => expect(uebersicht()!.getAttribute('data-ansicht')).toBe(a));
}

async function zeige(buecher: Buch[], liste: 'Alle' | 'Noch zu lesen' | 'Gerade am Lesen' = 'Alle', ansichtRepository: AnsichtRepository = new InMemoryAnsichtRepository()) {
  const repository = new InMemoryBookRepository();
  for (const b of buecher) await repository.save(b);
  render(<BuecherAnsicht repository={repository} bildspeicher={new InMemoryImageStore()} ansichtRepository={ansichtRepository} jetzt={() => new Date('2026-11-12T10:00:00Z')} />);
  await waitFor(() => expect(document.querySelector('[data-abschnitt="alle-buecher"] ul, [data-abschnitt="alle-buecher"] [data-leere-liste]')).not.toBeNull());
  await oeffne(liste);
}
async function oeffne(liste: 'Alle' | 'Noch zu lesen' | 'Gerade am Lesen') {
  // Von der Seite „Bücher“ über „Alle ansehen ›“ (REQ-040), aus einer Übersicht über die Pille (REQ-036, AK-11).
  if (liste === 'Noch zu lesen' && !uebersicht()) fireEvent.click(document.querySelector('[data-abschnitt="noch-zu-lesen"] [data-alle-ansehen]')!);
  else fireEvent.click(pille(liste));
  await geladen();
}

describe('REQ-037 Übersichten: Raster oder Liste', () => {
  describe('AK-1 Genau zwei Ansichten', () => {
    it.each(['Alle', 'Noch zu lesen', 'Gerade am Lesen'] as const)('[REQ-037/AK-1] Übersicht „%s“: Umschalter mit genau Raster und Liste', async (l) => {
      await zeige([buch('A'), buch('B', 'am_lesen')], l);
      const g = within(uebersicht()!).getByRole('group', { name: 'Ansicht' });
      const k = within(g).getAllByRole('button');
      expect(k).toHaveLength(2);
      expect(k.map((b) => b.getAttribute('data-ansicht-wahl')).sort()).toEqual(['liste', 'raster']);
      expect(k.filter((b) => b.getAttribute('aria-pressed') === 'true')).toHaveLength(1);
    });
  });

  describe('AK-2 Wechsel', () => {
    it('[REQ-037/AK-2] Wechsel in beide Richtungen: dieselben Bücher in derselben Reihenfolge', async () => {
      await zeige([buch('Zeta', 'gelesen'), buch('Alpha'), buch('Mu', 'am_lesen', { seitenanzahl: 100, aktuelleSeite: 10 })]);
      await ansicht('raster');
      const r = titel();
      expect(eintraege().every((li) => li.hasAttribute('data-rastereintrag'))).toBe(true);
      await ansicht('liste');
      expect(titel()).toEqual(r);
      expect(eintraege().every((li) => li.hasAttribute('data-listenkarte'))).toBe(true);
      expect(eintraege().map((li) => li.getAttribute('data-listenkarte'))).toEqual(eintraege().map((li) => li.getAttribute('data-listenkarte')));
      await ansicht('raster');
      expect(titel()).toEqual(['Alpha', 'Mu', 'Zeta']);
      const g = within(uebersicht()!).getByRole('group', { name: 'Ansicht' });
      expect(within(g).getByRole('button', { pressed: true })).toHaveAttribute('data-ansicht-wahl', 'raster');
    });

    it('[REQ-037/AK-2] Wechsel bei aktiver Suche behält die Treffer', async () => {
      await zeige([buch('Rot'), buch('Rotkehlchen'), buch('Blau')]);
      fireEvent.change(uebersicht()!.querySelector('input[data-suchfeld]')!, { target: { value: 'rot' } });
      await ansicht('liste');
      expect(titel()).toEqual(['Rot', 'Rotkehlchen']);
      await ansicht('raster');
      expect(titel()).toEqual(['Rot', 'Rotkehlchen']);
    });
  });

  describe('AK-3 Ansicht wird je Liste gemerkt', () => {
    it.each([
      ['liste', 'raster'],
      ['raster', 'liste'],
    ] as const)('[REQ-037/AK-3] „Alle“ = %s, „Noch zu lesen“ = %s bleibt nach Neustart je Liste erhalten', async (alle, nzl) => {
      const speicher = new InMemoryAnsichtRepository();
      const b = [buch('A'), buch('B', 'gelesen')];
      await zeige(b, 'Alle', speicher);
      await ansicht(alle);
      await oeffne('Noch zu lesen');
      await ansicht(nzl);
      cleanup();
      // Neustart: neu rendern mit demselben Ansichtsspeicher
      await zeige(b, 'Alle', speicher);
      expect(uebersicht()!.getAttribute('data-ansicht')).toBe(alle);
      expect(eintraege().every((li) => li.hasAttribute(alle === 'liste' ? 'data-listenkarte' : 'data-rastereintrag'))).toBe(true);
      cleanup();
      await zeige(b, 'Noch zu lesen', speicher);
      expect(uebersicht()!.getAttribute('data-ansicht')).toBe(nzl);
    });

    it('[REQ-037/AK-3] Wechsel innerhalb der Sitzung: jede Liste zeigt ihre eigene Ansicht', async () => {
      await zeige([buch('A'), buch('B', 'am_lesen')], 'Alle');
      await ansicht('liste');
      fireEvent.click(pille('Gerade am Lesen'));
      await geladen();
      await ansicht('raster');
      fireEvent.click(pille('Alle'));
      await geladen();
      expect(uebersicht()!.getAttribute('data-ansicht')).toBe('liste');
      fireEvent.click(pille('Gerade am Lesen'));
      await geladen();
      expect(uebersicht()!.getAttribute('data-ansicht')).toBe('raster');
    });

    it('[REQ-037/AK-3] die Wahl geht über die Repository-Schnittstelle (speichern je Liste)', async () => {
      const speicher = new InMemoryAnsichtRepository();
      const spion = vi.spyOn(speicher, 'speichern');
      await zeige([buch('A')], 'Alle', speicher);
      await ansicht('liste');
      await oeffne('Noch zu lesen');
      await ansicht('raster');
      expect(spion).toHaveBeenCalledWith('alle', 'liste');
      expect(spion).toHaveBeenCalledWith('noch_zu_lesen', 'raster');
      expect(await speicher.lesen('alle')).toBe('liste');
    });

    it('[REQ-037/AK-3] ganze App mit Standardspeicher: gewählte Ansicht übersteht einen Neustart', async () => {
      async function appAlle() {
        vi.resetModules();
        const App = (await import('@/App')).default;
        const rtl = await import('@testing-library/react');
        rtl.render(<App />);
        const nav = rtl.screen.getByRole('navigation', { name: 'Hauptnavigation' });
        rtl.fireEvent.click(rtl.within(nav).getByRole('button', { name: 'Bücher' }));
        rtl.fireEvent.click(rtl.within(rtl.screen.getByRole('group', { name: 'Filter' })).getByRole('button', { name: 'Alle' }));
        await geladen();
        return rtl;
      }
      localStorage.clear();
      let rtl = await appAlle();
      const andere = uebersicht()!.getAttribute('data-ansicht') === 'raster' ? 'liste' : 'raster';
      rtl.fireEvent.click(uebersicht()!.querySelector(`[data-ansicht-wahl="${andere}"]`)!);
      await waitFor(() => expect(uebersicht()!.getAttribute('data-ansicht')).toBe(andere));
      rtl.cleanup();
      rtl = await appAlle();
      expect(uebersicht()!.getAttribute('data-ansicht')).toBe(andere);
      rtl.cleanup();
      localStorage.clear();
    });
  });

  describe('AK-4 Rastereintrag', () => {
    it('[REQ-037/AK-4] Frontcover, Buchtitel, Icon und Autor; Reihenfolge Cover → Titel → Autorzeile', async () => {
      await zeige([buch('Mit allem', 'gelesen', { cover: PNG, autor: 'Sable Sorensen' })]);
      await ansicht('raster');
      const li = eintrag('Mit allem');
      expect(li.hasAttribute('data-rastereintrag')).toBe(true);
      const img = li.querySelector('img')!;
      expect(img.getAttribute('src')).toBe(PNG);
      const t = li.querySelector('[data-buchtitel]')!;
      const z = li.querySelector('[data-autorzeile]')!;
      expect(z.querySelector('[data-icon]')).not.toBeNull();
      expect(z.querySelector('[data-autor]')?.textContent).toBe('Sable Sorensen');
      expect(img.compareDocumentPosition(t) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
      expect(t.compareDocumentPosition(z) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
      // Icon vor dem Namen
      expect(z.querySelector('[data-icon]')!.compareDocumentPosition(z.querySelector('[data-autor]')!) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    });

    it('[REQ-037/AK-4] Autor wird als gespeicherter Text unverändert dargestellt (Sonderzeichen, mehrere Namen)', async () => {
      const autor = 'J. R. R. Tolkien & Christopher  Tolkien';
      await zeige([buch('T', 'ungelesen', { autor })]);
      for (const a of ['raster', 'liste'] as const) {
        await ansicht(a);
        expect(eintrag('T').querySelector('[data-autor]')?.textContent).toBe(autor);
      }
    });

    it('[REQ-037/AK-4] Rasteransicht zeigt weder Fortschrittsbalken noch Statuschip', async () => {
      await zeige([buch('L', 'am_lesen', { seitenanzahl: 608, aktuelleSeite: 200 }), buch('U')]);
      await ansicht('raster');
      expect(uebersicht()!.querySelector('[role=progressbar], [data-statuschip], [data-fortschrittstext]')).toBeNull();
    });
  });

  describe('AK-5 Ohne Cover, ohne Autor', () => {
    it.each(['raster', 'liste'] as const)('[REQ-037/AK-5] (%s) Cover-Platzhalter und nur das Icon, kein Name', async (a) => {
      await zeige([buch('Nackt', 'gelesen')]);
      await ansicht(a);
      const li = eintrag('Nackt');
      expect(li.querySelector('[data-cover-platzhalter]')).not.toBeNull();
      expect(li.querySelector('img')).toBeNull();
      const z = li.querySelector('[data-autorzeile]')!;
      expect(z.querySelector('[data-icon]')).not.toBeNull();
      expect(z.querySelector('[data-autor]')).toBeNull();
      expect(z.textContent?.trim()).toBe('');
    });

    it('[REQ-037/AK-5] Liste: Buch mit Cover zeigt das Bild statt des Platzhalters', async () => {
      await zeige([buch('Bild', 'ungelesen', { cover: PNG, autor: 'X' })]);
      await ansicht('liste');
      expect(eintrag('Bild').querySelector('img')?.getAttribute('src')).toBe(PNG);
      expect(eintrag('Bild').querySelector('[data-cover-platzhalter]')).toBeNull();
    });
  });

  const karte = async (b: Buch) => {
    await zeige([b]);
    await ansicht('liste');
    return eintrag(b.titel);
  };

  describe('AK-6 Liste: Buch „am lesen“', () => {
    it('[REQ-037/AK-6] 200 / 608 → Balken und genau „200 / 608 · 33 %“', async () => {
      const li = await karte(buch('Lesend', 'am_lesen', { seitenanzahl: 608, aktuelleSeite: 200, fortschrittsmodus: 'seite' }));
      expect(within(li).getByRole('progressbar')).toBeInTheDocument();
      expect(li.querySelector('[data-fortschrittstext]')?.textContent).toBe('200 / 608 · 33 %');
      expect(li.querySelector('[data-statuschip]')).toBeNull();
      // Text unter dem Balken
      expect(within(li).getByRole('progressbar').compareDocumentPosition(li.querySelector('[data-fortschrittstext]')!) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    });

    it.each([
      [1, 8, '1 / 8 · 13 %'], // 12,5 → 13 (kaufmännisch)
      [3, 8, '3 / 8 · 38 %'], // 37,5 → 38
      [1, 3, '1 / 3 · 33 %'], // 33,3 → 33
      [2, 3, '2 / 3 · 67 %'], // 66,7 → 67
      [0, 300, '0 / 300 · 0 %'],
      [300, 300, '300 / 300 · 100 %'],
    ])('[REQ-037/AK-6] Rundung: Seite %i von %i → „%s“', async (s, n, text) => {
      const li = await karte(buch('R', 'am_lesen', { seitenanzahl: n, aktuelleSeite: s }));
      expect(li.querySelector('[data-fortschrittstext]')?.textContent).toBe(text);
    });

    it('[REQ-037/AK-6] ohne gespeicherten Modus gilt „Seite“', async () => {
      const li = await karte(buch('Ohne Modus', 'am_lesen', { seitenanzahl: 608, aktuelleSeite: 200 }));
      expect(li.querySelector('[data-fortschrittstext]')?.textContent).toBe('200 / 608 · 33 %');
    });
  });

  describe('AK-7 Liste: anderer Lesestatus', () => {
    it('[REQ-037/AK-7] ungelesen → genau „ungelesen“, kein Balken', async () => {
      const li = await karte(buch('Neu', 'ungelesen', { seitenanzahl: 300, aktuelleSeite: 0 }));
      expect(li.querySelector('[data-statuschip]')?.textContent).toBe('ungelesen');
      expect(within(li).queryByRole('progressbar')).toBeNull();
      expect(li.querySelector('[data-fortschrittstext]')).toBeNull();
    });

    it.each(['gelesen', 'abgebrochen', 'wunschliste'] as const)('[REQ-037/AK-7] %s → genau die Bezeichnung aus der zentralen Definition, kein Balken', async (s) => {
      const li = await karte(buch('S', s, { seitenanzahl: 300, aktuelleSeite: 120 }));
      const soll = LESESTATUS.find((x) => x.id === s)!.bezeichnung;
      expect(li.querySelector('[data-statuschip]')?.textContent).toBe(soll);
      expect(within(li).queryByRole('progressbar')).toBeNull();
    });
  });

  describe('AK-8 Liste: „am lesen“ ohne Seitenanzahl', () => {
    it.each([
      ['ohne Angabe', {}],
      ['Seitenanzahl 0', { seitenanzahl: 0 }],
      ['Modus %', { fortschrittsmodus: 'prozent' as const, fortschrittProzent: 40 }],
    ])('[REQ-037/AK-8] %s: weder Balken noch Fortschrittstext', async (_n, extra) => {
      const li = await karte(buch('Ohne Seiten', 'am_lesen', extra));
      expect(within(li).queryByRole('progressbar')).toBeNull();
      expect(li.querySelector('[data-fortschrittstext]')).toBeNull();
      expect(li.textContent ?? '').not.toMatch(/%|\d+\s*\/\s*\d+/);
    });
  });

  describe('AK-9 Liste: Fortschritt im Modus „%“', () => {
    it('[REQ-037/AK-9] Modus „%“, 33 → Balken und genau „33 %“, ohne Seitenzahlen', async () => {
      const li = await karte(buch('Prozent', 'am_lesen', { seitenanzahl: 608, aktuelleSeite: 400, fortschrittsmodus: 'prozent', fortschrittProzent: 33 }));
      expect(within(li).getByRole('progressbar')).toBeInTheDocument();
      expect(li.querySelector('[data-fortschrittstext]')?.textContent).toBe('33 %');
      expect(li.textContent ?? '').not.toMatch(/608|400/);
    });

    it.each([0, 100, 7])('[REQ-037/AK-9] Grenzwerte: %i im Modus „%“ → „%i %“', async (p) => {
      const li = await karte(buch('P', 'am_lesen', { seitenanzahl: 250, fortschrittsmodus: 'prozent', fortschrittProzent: p }));
      expect(li.querySelector('[data-fortschrittstext]')?.textContent).toBe(`${p} %`);
    });
  });
});
