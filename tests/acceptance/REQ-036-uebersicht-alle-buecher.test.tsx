/**
 * Akzeptanztests REQ-036 – Übersicht „Alle Bücher“: Fenster, Kopf, Anzahl, Reihenfolge, Rückweg.
 *
 * Abgeleitet aus dem REQ-Text. Schnittstellen laut Absprache (Sprint 04, Teil C):
 *  - Übersicht [data-uebersicht=alle|noch_zu_lesen|gerade_am_lesen] mit data-ansicht="raster|liste" (leer bis geladen)
 *  - input[type=search][data-suchfeld], [data-buecherzahl], role=group "Ansicht" mit [data-ansicht-wahl], [data-sortierknopf]
 *  - ul[data-buecher] (fehlt ohne Treffer), li[data-rastereintrag=id] bzw. li[data-listenkarte=id] mit [data-buchtitel]
 *  - Filterpillen mit data-filter=id
 * Keine Annahme über die Standardansicht: Tests wählen die Ansicht ausdrücklich, wenn sie darauf ankommt.
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
  buecher: [
    { id: '36000000-0000-4000-8000-000000000001', titel: 'Demo Beta', status: 'ungelesen' as const, eingetragenAm: '2026-01-01T00:00:00.000Z' },
    { id: '36000000-0000-4000-8000-000000000002', titel: 'Demo Alpha', status: 'gelesen' as const, eingetragenAm: '2026-01-02T00:00:00.000Z' },
  ],
}));
vi.mock('@/buecher/demodaten', () => ({ demoBuecher: T.buecher }));

let nr = 0;
function buch(titel: string, status: LesestatusId = 'ungelesen', extra: Partial<Buch> = {}): Buch {
  nr += 1;
  const id = `36360000-0000-4000-8000-${String(nr).padStart(12, '0')}`;
  return { id, titel, status, eingetragenAm: new Date(Date.UTC(2026, 0, 1) + nr * 60_000).toISOString(), ...extra };
}

afterEach(() => cleanup());

const uebersicht = () => document.querySelector<HTMLElement>('[data-uebersicht]');
const leiste = () => screen.getByRole('group', { name: 'Filter' });
const pille = (name: string) => within(leiste()).getByRole('button', { name });
const aktivePillen = () =>
  within(leiste())
    .getAllByRole('button')
    .filter((b) => b.getAttribute('aria-pressed') === 'true')
    .map((b) => b.textContent?.trim());
const titel = () => Array.from(uebersicht()!.querySelectorAll('ul[data-buecher] > li [data-buchtitel]')).map((t) => t.textContent?.trim());
const zahl = () => uebersicht()!.querySelector('[data-buecherzahl]')!.textContent?.trim();
const geladen = () => waitFor(() => expect(uebersicht()?.getAttribute('data-ansicht')).toMatch(/^(raster|liste)$/));
async function ansicht(a: 'raster' | 'liste') {
  fireEvent.click(uebersicht()!.querySelector(`[data-ansicht-wahl="${a}"]`)!);
  await waitFor(() => expect(uebersicht()!.getAttribute('data-ansicht')).toBe(a));
}

/** Seite „Bücher“ mit eigenen Büchern; danach Übersicht „Alle Bücher“ über die Pille „Alle“. */
async function zeige(buecher: Buch[], oeffnen = true) {
  const repository = new InMemoryBookRepository();
  for (const b of buecher) await repository.save(b);
  render(
    <BuecherAnsicht
      repository={repository}
      bildspeicher={new InMemoryImageStore()}
      ansichtRepository={new InMemoryAnsichtRepository()}
      jetzt={() => new Date('2026-11-12T10:00:00Z')}
    />,
  );
  await waitFor(() => expect(document.querySelector('[data-abschnitt="alle-buecher"] ul, [data-abschnitt="alle-buecher"] [data-leere-liste]')).not.toBeNull());
  if (oeffnen) {
    fireEvent.click(pille('Alle'));
    await geladen();
  }
}
const sucheEingeben = (text: string) => fireEvent.change(uebersicht()!.querySelector('input[data-suchfeld]')!, { target: { value: text } });

describe('REQ-036 Übersicht „Alle Bücher“', () => {
  describe('AK-1 Kopfbereich bleibt erhalten, ohne Zahlen', () => {
    it('[REQ-036/AK-1] „Deine Bücher“, Filterpillen und Plus-Schaltfläche sind sichtbar', async () => {
      await zeige([buch('Eins')]);
      const u = uebersicht()!;
      expect(within(u).getByRole('heading', { level: 1, name: 'Deine Bücher' })).toBeInTheDocument();
      expect(within(u).getByRole('group', { name: 'Filter' })).toBeInTheDocument();
      expect(within(u).getByRole('button', { name: 'Buch hinzufügen' })).toBeInTheDocument();
      expect(within(leiste()).getAllByRole('button').map((b) => b.textContent?.trim())).toEqual(['Alle', 'Für dich', 'Gerade am Lesen', 'Noch zu lesen']);
    });

    it('[REQ-036/AK-1] hinter keiner Filterpille steht eine Zahl (auch bei vielen Büchern)', async () => {
      await zeige(Array.from({ length: 12 }, (_, i) => buch(`B${'x'.repeat(i)}`, i % 2 ? 'gelesen' : 'am_lesen')));
      for (const b of within(leiste()).getAllByRole('button')) expect(b.textContent ?? '').not.toMatch(/\d/);
    });

    it('[REQ-036/AK-1] die Plus-Schaltfläche funktioniert in der Übersicht weiter (Menü öffnet sich)', async () => {
      await zeige([buch('Eins')]);
      fireEvent.click(within(uebersicht()!).getByRole('button', { name: 'Buch hinzufügen' }));
      expect(await screen.findByRole('menu', { name: 'Buch hinzufügen' })).toBeInTheDocument();
    });
  });

  describe('AK-2 Alle Bücher, A–Z', () => {
    it.each(['raster', 'liste'] as const)('[REQ-036/AK-2] Zorn (gelesen), Anfang (ungelesen), Mitte (am lesen) → Anfang, Mitte, Zorn (%s)', async (a) => {
      await zeige([buch('Zorn', 'gelesen'), buch('Anfang', 'ungelesen'), buch('Mitte', 'am_lesen')]);
      await ansicht(a);
      expect(titel()).toEqual(['Anfang', 'Mitte', 'Zorn']);
    });

    it('[REQ-036/AK-2] alle fünf Lesestatus erscheinen; Reihenfolge nach Titel, nicht nach Eintragungsdatum', async () => {
      await zeige([
        buch('Echo', 'wunschliste'),
        buch('Delta', 'abgebrochen'),
        buch('Charlie', 'gelesen'),
        buch('Bravo', 'am_lesen'),
        buch('Alpha', 'ungelesen'),
      ]);
      expect(titel()).toEqual(['Alpha', 'Bravo', 'Charlie', 'Delta', 'Echo']);
    });

    it('[REQ-036/AK-2] Grenzfall: Groß-/Kleinschreibung ändert die alphabetische Stelle nicht', async () => {
      await zeige([buch('Zorn'), buch('berg'), buch('Anfang')]);
      expect(titel()).toEqual(['Anfang', 'berg', 'Zorn']);
    });
  });

  describe('AK-3 Keine Begrenzung', () => {
    it('[REQ-036/AK-3] 25 gespeicherte Bücher sind alle in der Übersicht', async () => {
      const b = Array.from({ length: 25 }, (_, i) => buch(`Titel ${String(i).padStart(2, '0')}`, (['ungelesen', 'gelesen', 'am_lesen'] as const)[i % 3]));
      await zeige(b);
      expect(titel()).toEqual(b.map((x) => x.titel));
      await ansicht('liste');
      expect(titel()).toHaveLength(25);
      await ansicht('raster');
      expect(titel()).toHaveLength(25);
    });
  });

  describe('AK-4 Anzahl: Mehrzahl und Einzahl', () => {
    it.each([
      [2, '2 Bücher'],
      [1, '1 Buch'],
      [0, '0 Bücher'],
      [11, '11 Bücher'],
    ])('[REQ-036/AK-4] %i Bücher → „%s“', async (n, text) => {
      await zeige(Array.from({ length: n }, (_, i) => buch(`N${i}`, i % 2 ? 'gelesen' : 'ungelesen')));
      expect(zahl()).toBe(text);
    });
  });

  describe('AK-10 Anzahl zählt Suchtreffer', () => {
    it('[REQ-036/AK-10] 3 Bücher, 1 passt → „1 Buch“; 2 passen → „2 Bücher“; keiner → „0 Bücher“; leer → „3 Bücher“', async () => {
      await zeige([buch('Sternenstaub'), buch('Sternbild', 'gelesen'), buch('Meer', 'am_lesen')]);
      expect(zahl()).toBe('3 Bücher');
      sucheEingeben('staub');
      expect(zahl()).toBe('1 Buch');
      sucheEingeben('stern');
      expect(zahl()).toBe('2 Bücher');
      sucheEingeben('qqq');
      expect(zahl()).toBe('0 Bücher');
      sucheEingeben('');
      expect(zahl()).toBe('3 Bücher');
    });
  });

  describe('AK-11 Filterpille in der Übersicht antippen', () => {
    it('[REQ-036/AK-11] „Noch zu lesen“ antippen → aktiv, nur Bücher der Abschnittszuordnung', async () => {
      await zeige([buch('Ungelesen B'), buch('Gelesen', 'gelesen'), buch('Ungelesen A'), buch('Am Lesen', 'am_lesen')]);
      fireEvent.click(pille('Noch zu lesen'));
      await geladen();
      expect(uebersicht()!.getAttribute('data-uebersicht')).toBe('noch_zu_lesen');
      expect(aktivePillen()).toEqual(['Noch zu lesen']);
      expect(titel()).toEqual(['Ungelesen A', 'Ungelesen B']);
      expect(zahl()).toBe('2 Bücher');
    });

    it('[REQ-036/AK-11] „Gerade am Lesen“ und zurück zu „Alle“: Liste wechselt jeweils, genau eine Pille aktiv', async () => {
      await zeige([buch('U'), buch('L', 'am_lesen'), buch('G', 'gelesen')]);
      fireEvent.click(pille('Gerade am Lesen'));
      await geladen();
      expect(aktivePillen()).toEqual(['Gerade am Lesen']);
      expect(titel()).toEqual(['L']);
      fireEvent.click(pille('Alle'));
      await geladen();
      expect(aktivePillen()).toEqual(['Alle']);
      expect(titel()).toEqual(['G', 'L', 'U']);
    });
  });

  describe('AK-12 „Für dich“ führt zur Seite „Bücher“', () => {
    it.each(['Alle', 'Gerade am Lesen', 'Noch zu lesen'])('[REQ-036/AK-12] aus der Übersicht „%s“: Seite „Bücher“ mit Abschnitten, „Für dich“ aktiv', async (start) => {
      await zeige([buch('Eins'), buch('Zwei', 'am_lesen')]);
      if (start !== 'Alle') {
        fireEvent.click(pille(start));
        await geladen();
      }
      if (start === 'Noch zu lesen') expect(uebersicht()!.getAttribute('data-uebersicht')).toBe('noch_zu_lesen');
      fireEvent.click(pille('Für dich'));
      expect(uebersicht()).toBeNull();
      expect(document.querySelector('[data-seite="buecher"]')).not.toBeNull();
      for (const r of ['Noch zu lesen', 'Sagas', 'Sammlungen', 'Alle Bücher']) expect(screen.getByRole('region', { name: r })).toBeInTheDocument();
      expect(aktivePillen()).toEqual(['Für dich']);
    });
  });

  describe('AK-5 „Zuletzt“ ohne Funktion', () => {
    it.each(['raster', 'liste'] as const)('[REQ-036/AK-5] „Zuletzt“ ist sichtbar; Antippen ändert nichts (%s)', async (a) => {
      await zeige([buch('B'), buch('A', 'gelesen'), buch('C', 'am_lesen')]);
      await ansicht(a);
      const k = uebersicht()!.querySelector<HTMLElement>('[data-sortierknopf]')!;
      expect(k.textContent?.trim()).toBe('Zuletzt');
      const vorher = document.body.innerHTML;
      // nach jedem einzelnen Antippen prüfen (zweimal Umschalten würde sich sonst aufheben)
      for (let i = 0; i < 3; i++) {
        fireEvent.click(k);
        await new Promise((r) => setTimeout(r, 0));
        expect(document.body.innerHTML, `nach ${i + 1}. Antippen`).toBe(vorher);
      }
    });
  });

  describe('AK-6 Nicht übernommene Elemente', () => {
    it('[REQ-036/AK-6] kein Schloss-/Häkchen-Schalter und keine Pille „Mehr ⌄“', async () => {
      await zeige([buch('Eins')]);
      const u = uebersicht()!;
      expect(within(u).queryAllByRole('switch')).toHaveLength(0);
      expect(within(u).queryAllByRole('checkbox')).toHaveLength(0);
      expect(u.querySelectorAll('input[type=checkbox]')).toHaveLength(0);
      expect(u.textContent ?? '').not.toMatch(/Mehr|⌄|🔒|✓|✔/);
      const knoepfe = within(u).getAllByRole('button').map((b) => (b.getAttribute('aria-label') ?? b.textContent ?? '').trim());
      expect(knoepfe.filter((n) => /mehr|schloss|sperr|häkchen|lock/i.test(n))).toEqual([]);
    });
  });

  describe('AK-7 Buch antippen und zurück', () => {
    it.each(['raster', 'liste'] as const)('[REQ-036/AK-7] (%s) Buch antippen → Buchdetails genau dieses Buches → Zurück → Übersicht', async (a) => {
      await zeige([buch('Erstes'), buch('Zweites', 'gelesen'), buch('Drittes', 'am_lesen')]);
      await ansicht(a);
      const li = Array.from(uebersicht()!.querySelectorAll<HTMLElement>('ul[data-buecher] > li')).find(
        (l) => l.querySelector('[data-buchtitel]')?.textContent?.trim() === 'Zweites',
      )!;
      fireEvent.click(li.querySelector('[data-buchtitel]')!);
      const d = await screen.findByRole('region', { name: 'Buchdetails' });
      await waitFor(() => expect(d.querySelector('[data-buchdetails-titel]')?.textContent?.trim()).toBe('Zweites'));
      expect(uebersicht()).toBeNull();
      fireEvent.click(within(d).getByRole('button', { name: 'Zurück' }));
      await geladen();
      expect(uebersicht()!.getAttribute('data-uebersicht')).toBe('alle');
      expect(uebersicht()!.getAttribute('data-ansicht')).toBe(a);
      expect(aktivePillen()).toEqual(['Alle']);
      expect(titel()).toEqual(['Drittes', 'Erstes', 'Zweites']);
    });

    it('[REQ-036/AK-7] Cover antippen öffnet ebenfalls die Buchdetails', async () => {
      await zeige([buch('Coverlos')]);
      fireEvent.click(uebersicht()!.querySelector('ul[data-buecher] [data-cover-platzhalter], ul[data-buecher] img')!);
      const d = await screen.findByRole('region', { name: 'Buchdetails' });
      await waitFor(() => expect(d.querySelector('[data-buchdetails-titel]')?.textContent?.trim()).toBe('Coverlos'));
    });
  });

  describe('AK-8 Zurück zur Seite „Bücher“', () => {
    async function appUebersicht() {
      render(<App />);
      const nav = screen.getByRole('navigation', { name: 'Hauptnavigation' });
      fireEvent.click(within(nav).getByRole('button', { name: 'Bücher' }));
      await waitFor(() => expect(document.querySelector('[data-abschnitt="alle-buecher"] ul')).not.toBeNull());
      fireEvent.click(pille('Alle'));
      await geladen();
      return nav;
    }

    it('[REQ-036/AK-8] Menüpunkt „Bücher“ in der Übersicht → Seite „Bücher“', async () => {
      const nav = await appUebersicht();
      expect(within(nav).getByRole('button', { name: 'Bücher' })).toHaveAttribute('aria-current', 'page');
      fireEvent.click(within(nav).getByRole('button', { name: 'Bücher' }));
      await waitFor(() => expect(document.querySelector('[data-seite="buecher"]')).not.toBeNull());
      expect(uebersicht()).toBeNull();
      expect(aktivePillen()).toEqual(['Für dich']);
    });

    it('[REQ-036/AK-8] Buchdetails aus der Übersicht, dann Menüpunkt „Bücher“ → Seite „Bücher“ (nicht Übersicht)', async () => {
      const nav = await appUebersicht();
      fireEvent.click(uebersicht()!.querySelector('ul[data-buecher] [data-buchtitel]')!);
      await screen.findByRole('region', { name: 'Buchdetails' });
      fireEvent.click(within(nav).getByRole('button', { name: 'Bücher' }));
      await waitFor(() => expect(document.querySelector('[data-seite="buecher"]')).not.toBeNull());
      expect(uebersicht()).toBeNull();
    });
  });

  describe('AK-9 Kein Buch', () => {
    it.each(['raster', 'liste'] as const)('[REQ-036/AK-9] (%s) ohne Bücher: weder Bücher noch Platzhalter noch Hinweistext', async (a) => {
      await zeige([]);
      await ansicht(a);
      const u = uebersicht()!;
      expect(u.querySelector('ul[data-buecher]')).toBeNull();
      expect(u.querySelectorAll('li')).toHaveLength(0);
      expect(u.querySelector('[data-leere-liste], [data-cover-platzhalter]')).toBeNull();
      // Nach der Zeile mit Anzahl/Umschalter/„Zuletzt“ folgt kein weiterer Inhalt.
      const zeile = u.querySelector('[data-sortierknopf]')!.parentElement!;
      let n: Element | null = zeile.nextElementSibling;
      const rest: string[] = [];
      for (; n; n = n.nextElementSibling) rest.push(n.outerHTML);
      expect(rest).toEqual([]);
    });
  });
});
