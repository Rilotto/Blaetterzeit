/**
 * Akzeptanztests REQ-007 – Filterkonfiguration.
 *
 * Abgeleitet aus dem REQ-Text und der verbindlichen Schnittstellen-Absprache in
 * sprints/sprint-02/plan.md, Abschnitt „REQ-005 bis REQ-012 (Seite „Bücher“), Runde 1“:
 *  - src/buecher/filterKonfiguration.ts exportiert filterKonfiguration: FilterDefinition[]
 *    mit mindestens { id, name, reihenfolge, standard?, logik? }
 *  - Filterleiste: role="group" aria-label="Filter", ein <button> je Filter, sortiert nach reihenfolge
 *  - BuecherAnsicht: ohne filter-Prop gilt die zentrale Konfiguration
 *
 * „Nur die Konfiguration wird geändert“ wird auf zwei Wegen nachgebildet:
 *  1. Die zentrale Konfiguration selbst wird geändert (Modul frisch geladen, Array verändert),
 *     danach wird die Ansicht ohne Props gerendert.
 *  2. Eine geänderte Konfiguration wird über die Prop `filter` übergeben.
 */
import '@testing-library/jest-dom/vitest';
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import App from '@/App';
import BuecherAnsicht from '@/views/BuecherAnsicht';
import { filterKonfiguration } from '@/buecher/filterKonfiguration';

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
const SRC = new URL('src/', pathToFileURL(`${cwd()}/`));
const KONFIG_DATEI = new URL('buecher/filterKonfiguration.ts', SRC);
function walk(dir: URL): URL[] {
  if (!fs.existsSync(dir)) return [];
  const out: URL[] = [];
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (e.isDirectory()) out.push(...walk(new URL(`${e.name}/`, dir)));
    else out.push(new URL(e.name, dir));
  }
  return out;
}

type FilterDef = (typeof filterKonfiguration)[number];
const ohneKommentare = (t: string) => t.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:])\/\/.*$/gm, '$1').replace(/\{\/\*[\s\S]*?\*\/\}/g, '');
// Fassung 2026-11-12: „Alle“ an Position 1 (REQ-039).
const STANDARD_NAMEN = ['Alle', 'Für dich', 'Gerade am Lesen', 'Noch zu lesen'];

function filter(name: string, reihenfolge: number, extra: Partial<FilterDef> = {}): FilterDef {
  return { ...filterKonfiguration[0], id: `test-${name}`, name, reihenfolge, standard: false, logik: vi.fn(), ...extra };
}
const kopie = () => filterKonfiguration.map((f) => ({ ...f }));
const leiste = () => screen.getByRole('group', { name: 'Filter' });
const namen = () => within(leiste()).getAllByRole('button').map((b) => b.textContent?.trim());

type Rtl = { render: typeof render; screen: typeof screen; within: typeof within; cleanup: typeof cleanup };
/** Lädt die Module frisch, ändert die zentrale Konfiguration und rendert die Ansicht ohne filter-Prop. */
async function mitGeaenderterZentralkonfiguration(aendere: (k: FilterDef[]) => void) {
  vi.resetModules();
  const modul = (await import('@/buecher/filterKonfiguration')) as { filterKonfiguration: FilterDef[] };
  aendere(modul.filterKonfiguration);
  const rtl = (await import('@testing-library/react')) as unknown as Rtl;
  const { default: Ansicht } = (await import('@/views/BuecherAnsicht')) as { default: typeof BuecherAnsicht };
  rtl.render(<Ansicht buecher={[]} />);
  const n = rtl.within(rtl.screen.getByRole('group', { name: 'Filter' }))
    .getAllByRole('button')
    .map((b) => b.textContent?.trim());
  rtl.cleanup();
  return n;
}

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.resetModules();
});

// ===========================================================================
describe('REQ-007 Filterkonfiguration', () => {
  // ---------------------------------------------------------------- AK-1
  describe('AK-1 Filterleiste entspricht der Filterkonfiguration', () => {
    it('[REQ-007/AK-1] die zentrale Konfiguration entspricht der Tabelle des CEO (Name, Position, Standard)', () => {
      const s = [...filterKonfiguration].sort((a, b) => a.reihenfolge - b.reihenfolge);
      expect(s.map((f) => [f.name, !!f.standard])).toEqual([
        ['Alle', false],
        ['Für dich', true],
        ['Gerade am Lesen', false],
        ['Noch zu lesen', false],
      ]);
      expect(new Set(filterKonfiguration.map((f) => f.id)).size, 'IDs eindeutig').toBe(filterKonfiguration.length);
      expect(new Set(filterKonfiguration.map((f) => f.reihenfolge)).size, 'Positionen eindeutig').toBe(
        filterKonfiguration.length,
      );
    });

    it('[REQ-007/AK-1] die Leiste zeigt genau die Filter der Konfiguration mit Namen in deren Reihenfolge', () => {
      render(<BuecherAnsicht buecher={[]} />);
      const erwartet = [...filterKonfiguration].sort((a, b) => a.reihenfolge - b.reihenfolge).map((f) => f.name);
      expect(namen()).toEqual(erwartet);
    });

    it('[REQ-007/AK-1] die Reihenfolge kommt aus `reihenfolge`, nicht aus der Position im Array', () => {
      render(<BuecherAnsicht buecher={[]} filter={[filter('C', 3), filter('A', 1, { standard: true }), filter('B', 2)]} />);
      expect(namen()).toEqual(['A', 'B', 'C']);
    });
  });

  // ---------------------------------------------------------------- AK-2
  describe('AK-2 Filter hinzufügen nur über die Konfiguration', () => {
    it('[REQ-007/AK-2] ein in der zentralen Konfiguration ergänzter Filter erscheint an seiner Position', async () => {
      const n = await mitGeaenderterZentralkonfiguration((k) => {
        k.push({ ...k[0], id: 'neu', name: 'Abgebrochen', reihenfolge: 3.5, standard: false });
      });
      expect(n).toEqual(['Alle', 'Für dich', 'Gerade am Lesen', 'Abgebrochen', 'Noch zu lesen']);
    });

    it('[REQ-007/AK-2] ein über die Prop übergebener zusätzlicher Filter erscheint am Anfang bzw. Ende', () => {
      render(<BuecherAnsicht buecher={[]} filter={[...kopie(), filter('Ganz vorne', 0), filter('Ganz hinten', 99)]} />);
      expect(namen()).toEqual(['Ganz vorne', ...STANDARD_NAMEN, 'Ganz hinten']);
    });
  });

  // ---------------------------------------------------------------- AK-3
  describe('AK-3 Filter umbenennen nur über die Konfiguration', () => {
    it('[REQ-007/AK-3] ein in der zentralen Konfiguration umbenannter Filter trägt den neuen Namen', async () => {
      const n = await mitGeaenderterZentralkonfiguration((k) => {
        k.find((f) => f.name === 'Gerade am Lesen')!.name = 'Am Lesen';
      });
      expect(n).toEqual(['Alle', 'Für dich', 'Am Lesen', 'Noch zu lesen']);
    });

    it('[REQ-007/AK-3] Umbenennen des Standardfilters: er bleibt aktiv und heißt neu', () => {
      const k = kopie();
      k.find((f) => f.standard)!.name = 'Empfohlen';
      render(<BuecherAnsicht buecher={[]} filter={k} />);
      expect(namen()).toEqual(['Alle', 'Empfohlen', 'Gerade am Lesen', 'Noch zu lesen']);
      expect(within(leiste()).getByRole('button', { name: 'Empfohlen' })).toHaveAttribute('aria-pressed', 'true');
      expect(screen.queryByRole('button', { name: 'Für dich' })).toBeNull();
    });
  });

  // ---------------------------------------------------------------- AK-4
  describe('AK-4 Filter entfernen nur über die Konfiguration', () => {
    it('[REQ-007/AK-4] ein aus der zentralen Konfiguration entfernter Filter fehlt, die übrigen behalten ihre Reihenfolge', async () => {
      const n = await mitGeaenderterZentralkonfiguration((k) => {
        k.splice(
          k.findIndex((f) => f.name === 'Gerade am Lesen'),
          1,
        );
      });
      expect(n).toEqual(['Alle', 'Für dich', 'Noch zu lesen']);
    });

    it('[REQ-007/AK-4] Grenzfall: nur noch ein Filter', () => {
      render(<BuecherAnsicht buecher={[]} filter={kopie().filter((f) => f.standard)} />);
      expect(namen()).toEqual(['Für dich']);
    });
  });

  // ---------------------------------------------------------------- AK-5
  describe('AK-5 Filter neu sortieren nur über die Konfiguration', () => {
    it('[REQ-007/AK-5] geänderte Positionen in der zentralen Konfiguration ergeben die neue Reihenfolge', async () => {
      const n = await mitGeaenderterZentralkonfiguration((k) => {
        const pos: Record<string, number> = { Alle: 4, 'Für dich': 3, 'Gerade am Lesen': 1, 'Noch zu lesen': 2 };
        for (const f of k) f.reihenfolge = pos[f.name];
      });
      expect(n).toEqual(['Gerade am Lesen', 'Noch zu lesen', 'Für dich', 'Alle']);
    });

    it('[REQ-007/AK-5] umgekehrte Reihenfolge über die Prop', () => {
      const k = kopie().map((f) => ({ ...f, reihenfolge: -f.reihenfolge }));
      render(<BuecherAnsicht buecher={[]} filter={k} />);
      expect(namen()).toEqual([...STANDARD_NAMEN].reverse());
    });
  });

  // ---------------------------------------------------------------- AK-6
  describe('AK-6 Beliebige Anzahl', () => {
    it.each([10, 25])('[REQ-007/AK-6] %i Filter werden alle in der festgelegten Reihenfolge angezeigt', (anzahl) => {
      const viele = Array.from({ length: anzahl }, (_, i) => filter(`F${anzahl - i}`, anzahl - i, { standard: i === 0 }));
      render(<BuecherAnsicht buecher={[]} filter={viele} />);
      expect(namen()).toEqual(Array.from({ length: anzahl }, (_, i) => `F${i + 1}`));
    });

    it('[REQ-007/AK-6] Grenzfall: leere Konfiguration führt zu keinem Absturz und keinen Filtern', () => {
      render(<BuecherAnsicht buecher={[]} filter={[]} />);
      expect(screen.getByRole('heading', { level: 1, name: 'Deine Bücher' })).toBeInTheDocument();
      expect(within(leiste()).queryAllByRole('button')).toHaveLength(0);
    });
  });

  // ---------------------------------------------------------------- AK-7
  describe('AK-7 Konfiguration unabhängig von der Darstellung', () => {
    it('[REQ-007/AK-7] die Konfigurationseinträge enthalten keine Darstellungsangaben', () => {
      const verboten = /farbe|color|colour|style|stil|width|breite|height|hoehe|höhe|radius|form|shape|icon|font|schrift|padding|margin|css|klasse|class/i;
      for (const f of filterKonfiguration) {
        const schluessel = Object.keys(f).filter((s) => verboten.test(s));
        expect(schluessel, `Filter "${f.name}"`).toEqual([]);
        for (const [s, v] of Object.entries(f)) {
          if (typeof v === 'string') {
            expect(v, `Filter "${f.name}".${s}`).not.toMatch(/#[0-9a-f]{3,8}\b|\brgba?\(|var\(--|\d+(px|rem|em|dp)\b/i);
          }
        }
      }
    });

    it('[REQ-007/AK-7] die Konfigurationsdatei enthält keine Farben, Maße oder Stil-Importe', () => {
      const text = fs.readFileSync(KONFIG_DATEI, 'utf8');
      expect(text).not.toMatch(/#[0-9a-fA-F]{3,8}\b|\brgba?\(|var\(--|\d+(px|rem|dp)\b|CSSProperties|@\/theme/);
    });

    it('[REQ-007/AK-7] die Darstellung enthält keine fest eingebauten Filternamen', () => {
      // „Noch zu lesen“ ist zugleich Abschnittsüberschrift (REQ-009) und wird deshalb nur
      // über die Darstellung der Leiste geprüft (nächster Test).
      const treffer = walk(SRC)
        .filter((f) => /\.(tsx?|css)$/.test(f.pathname) && f.href !== KONFIG_DATEI.href)
        // Kommentare zählen nicht als eingebaute Filter (Fassung 2026-11-12: Verweise in Code-Kommentaren).
        .filter((f) => /Für dich|Gerade am Lesen|fuer_dich|gerade_am_lesen/.test(ohneKommentare(fs.readFileSync(f, 'utf8'))))
        .map((f) => f.pathname.slice(SRC.pathname.length));
      expect(treffer).toEqual([]);
    });

    it('[REQ-007/AK-7] mit einer fremden Konfiguration erscheint keiner der aktuellen Filternamen in der Leiste', () => {
      render(<BuecherAnsicht buecher={[]} filter={[filter('X', 1, { standard: true }), filter('Y', 2)]} />);
      expect(namen()).toEqual(['X', 'Y']);
      for (const n of STANDARD_NAMEN) expect(within(leiste()).queryByText(n)).toBeNull();
    });
  });

  // ---------------------------------------------------------------- AK-8
  describe('AK-8 Jeder Filter hat eine zugeordnete Filterlogik', () => {
    it('[REQ-007/AK-8] jedem Filter der zentralen Konfiguration ist eine Filterlogik (Funktion) zugeordnet', () => {
      for (const f of filterKonfiguration) expect(typeof f.logik, `Filter "${f.name}"`).toBe('function');
    });

    it('[REQ-007/AK-8] die Filterlogik ist aufrufbar und wirft nicht', () => {
      for (const f of filterKonfiguration) expect(() => f.logik!([])).not.toThrow();
    });

    it('[REQ-007/AK-8] beim Antippen wird die Filterlogik des angetippten Filters ausgelöst, keine andere', () => {
      // Fassung 2026-11-12: Filter mit Übersicht werten ihre Logik beim Anzeigen ggf. erneut aus (≥ 1).
      for (const zielName of STANDARD_NAMEN) {
        const k = filterKonfiguration.map((f) => ({ ...f, logik: vi.fn((b: unknown[]) => b) }));
        render(<BuecherAnsicht buecher={[]} filter={k as FilterDef[]} />);
        const vorher = k.map((f) => f.logik.mock.calls.length);
        fireEvent.click(within(leiste()).getByRole('button', { name: zielName }));
        k.forEach((f, i) => {
          const n = f.logik.mock.calls.length - vorher[i];
          if (f.name === zielName) expect(n, `Logik von "${f.name}"`).toBeGreaterThanOrEqual(1);
          else expect(n, `Logik von "${f.name}" beim Antippen von "${zielName}"`).toBe(0);
        });
        cleanup();
      }
    });

    it('[REQ-007/AK-8] die echte Filterlogik bewirkt auf der Seite „Bücher“ keine sichtbare Änderung außer aktiv/inaktiv (Ausnahmen mit Übersicht)', () => {
      const { container } = render(<App />);
      fireEvent.click(within(screen.getByRole('navigation', { name: 'Hauptnavigation' })).getByRole('button', { name: 'Bücher' }));
      const ohneLeiste = () => {
        const c = container.cloneNode(true) as HTMLElement;
        c.querySelector('[role="group"][aria-label="Filter"]')?.remove();
        return c.innerHTML;
      };
      const vorher = ohneLeiste();
      // „Noch zu lesen“: bis zur CEO-Antwort (REQ-040, offene Frage) ohne Übersicht.
      for (const n of ['Noch zu lesen', 'Für dich']) {
        fireEvent.click(within(leiste()).getByRole('button', { name: n }));
        expect(ohneLeiste(), `nach Antippen von "${n}"`).toBe(vorher);
      }
      // Ausnahme „Alle“ (REQ-039): öffnet die Übersicht.
      fireEvent.click(within(leiste()).getByRole('button', { name: 'Alle' }));
      expect(container.querySelector('[data-uebersicht]')?.getAttribute('data-uebersicht')).toBe('alle');
    });
  });

  // ---------------------------------------------------------------- AK-9
  describe('AK-9 Keine Bearbeitung der Filterkonfiguration in der App', () => {
    it('[REQ-007/AK-9] in keiner Ansicht der App gibt es Eingabefelder, Ziehen oder bearbeitbare Inhalte', () => {
      render(<App />);
      const nav = screen.getByRole('navigation', { name: 'Hauptnavigation' });
      for (const l of ['Start', 'Bücher', 'Bibliothek', 'Statistik', 'Profil']) {
        fireEvent.click(within(nav).getByRole('button', { name: l }));
        expect(
          document.querySelectorAll('input, textarea, select, [contenteditable="true"], [contenteditable=""], [draggable="true"]'),
          `bei aktivem "${l}"`,
        ).toHaveLength(0);
      }
    });

    it('[REQ-007/AK-9] lange Drücken/Kontextmenü/Doppeltippen auf einen Filter öffnet keine Bearbeitung', () => {
      render(<App />);
      fireEvent.click(within(screen.getByRole('navigation', { name: 'Hauptnavigation' })).getByRole('button', { name: 'Bücher' }));
      const b = within(leiste()).getByRole('button', { name: 'Für dich' });
      const vorher = document.body.innerHTML;
      fireEvent.contextMenu(b);
      fireEvent.doubleClick(b);
      fireEvent.keyDown(b, { key: 'F2' });
      fireEvent.keyDown(b, { key: 'Delete' });
      expect(document.body.innerHTML).toBe(vorher);
      expect(namen()).toEqual(STANDARD_NAMEN);
    });

    it('[REQ-007/AK-9] es gibt keine Schaltfläche, die Filter hinzufügt, umbenennt, entfernt oder sortiert', () => {
      render(<App />);
      fireEvent.click(within(screen.getByRole('navigation', { name: 'Hauptnavigation' })).getByRole('button', { name: 'Bücher' }));
      const namenAllerButtons = screen.getAllByRole('button').map((b) => b.getAttribute('aria-label') ?? b.textContent ?? '');
      expect(namenAllerButtons.filter((n) => /filter.*(hinzu|bearbeit|umbenenn|entfern|lösch|sortier)|(hinzu|bearbeit|umbenenn|entfern|lösch|sortier).*filter/i.test(n))).toEqual([]);
    });

    it('[REQ-007/AK-9] die Filterkonfiguration wird nicht aus dem Gerätespeicher gelesen (nicht in der App änderbar)', () => {
      localStorage.setItem('filterKonfiguration', JSON.stringify([{ id: 'x', name: 'Manipuliert', reihenfolge: 1 }]));
      localStorage.setItem('filter', JSON.stringify([{ id: 'x', name: 'Manipuliert', reihenfolge: 1 }]));
      try {
        render(<BuecherAnsicht buecher={[]} />);
        expect(namen()).toEqual(STANDARD_NAMEN);
      } finally {
        localStorage.clear();
      }
    });
  });
});
