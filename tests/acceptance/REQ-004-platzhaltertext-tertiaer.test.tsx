/**
 * Akzeptanztests REQ-004 – Platzhaltertext im Inhaltsbereich in Farbrubrik Tertiär.
 *
 * Abgeleitet aus dem REQ-Text und der Schnittstellen-Absprache in
 * sprints/sprint-02/plan.md, Abschnitt „REQ-004“ (nicht aus dem Code):
 *  - Der Platzhaltertext „under construction :)“ steht in einem Element innerhalb von <main>.
 *  - Dieses Element setzt seine Textfarbe per Inline-Style über var(--bz-farbe-tertiaer).
 *  - Die Farbe ist nur dort gesetzt und wird nicht über die App-Wurzel vererbt.
 *
 * Bewusst KEINE Hexwerte im Test: Farbwerte kommen aus der zentralen Definition
 * (@/theme), damit Farbänderungen auf Zuruf (CLAUDE.md) keinen Test brechen.
 *
 * Geltungsbereich laut AK-1: nur Ansichten, die den Platzhaltertext zeigen. Wird
 * eine Zielansicht (z. B. „Bücher“, REQ-005) durch eine echte Ansicht ersetzt,
 * fällt sie automatisch aus der Prüfung; mindestens eine Platzhalteransicht muss
 * es aber geben, sonst wäre der Test leer.
 *
 * jsdom wendet per import eingebundene CSS-Dateien nicht an. Damit eine
 * Festlegung in einer CSS-Datei (z. B. `main p { color: … !important }`) nicht
 * übersehen wird, werden alle CSS-Dateien aus src/ vor dem Rendern als <style>
 * eingehängt (gleiches Vorgehen wie bei REQ-003).
 */
import '@testing-library/jest-dom/vitest';
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import App from '@/App';
import { farbrubriken } from '@/theme';

// ---------------------------------------------------------------------------
// Dateisystem-Zugriff (gleiches Muster wie REQ-002/003: dynamisch, minimal typisiert)
// ---------------------------------------------------------------------------
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

const ROOT = pathToFileURL(`${cwd()}/`);
const SRC = new URL('src/', ROOT);

function walk(dir: URL): URL[] {
  if (!fs.existsSync(dir)) return [];
  const out: URL[] = [];
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (e.isDirectory()) out.push(...walk(new URL(`${e.name}/`, dir)));
    else out.push(new URL(e.name, dir));
  }
  return out;
}

// ---------------------------------------------------------------------------
// Erwartung laut REQ-004 / REQ-002
// ---------------------------------------------------------------------------
const LABELS = ['Start', 'Bücher', 'Bibliothek', 'Statistik', 'Profil'] as const;
const PLACEHOLDER = 'under construction :)';
const VAR_TERTIAER = '--bz-farbe-tertiaer';
const VAR_HINTERGRUND = '--bz-farbe-hintergrund';
const FARB_LITERAL =
  /#[0-9a-f]{3,8}\b|\b(?:rgba?|hsla?|hwb|oklch|oklab|lab|lch|color)\(|\b(?:black|white|red|green|blue|gray|grey|silver|maroon|brown|beige|ivory|navy|purple|orange|yellow|pink|tan|wheat|linen|khaki)\b/i;

// ---------------------------------------------------------------------------
// Hilfsfunktionen
// ---------------------------------------------------------------------------
type Rtl = { render: typeof render; screen: typeof screen; within: typeof within; fireEvent: typeof fireEvent };
const rtl: Rtl = { render, screen, within, fireEvent };

function inlineDecls(el: HTMLElement): [string, string][] {
  return (el.getAttribute('style') ?? '')
    .split(';')
    .map((d) => d.trim())
    .filter(Boolean)
    .map((d) => {
      const i = d.indexOf(':');
      return [d.slice(0, i).trim().toLowerCase(), d.slice(i + 1).trim()] as [string, string];
    });
}
/** Normalisiert einen Farbausdruck so, wie jsdom ihn im Kontext `ctx` berechnet. */
function berechneteFarbe(ctx: HTMLElement, ausdruck: string) {
  const probe = document.createElement('span');
  probe.style.setProperty('color', ausdruck);
  ctx.appendChild(probe);
  const wert = getComputedStyle(probe).color;
  probe.remove();
  return wert;
}
function appRoot(container: HTMLElement) {
  const root = container.firstElementChild as HTMLElement | null;
  expect(root, 'App rendert kein Wurzelelement').not.toBeNull();
  return root!;
}
/** Innerstes Element in <main>, dessen Text genau der Platzhaltertext ist. */
function platzhalterElement(main: HTMLElement) {
  const kandidaten = Array.from(main.querySelectorAll<HTMLElement>('*')).filter(
    (el) => el.textContent?.trim() === PLACEHOLDER,
  );
  expect(kandidaten.length, 'kein Element mit dem Platzhaltertext in <main>').toBeGreaterThan(0);
  return kandidaten.find((c) => !kandidaten.some((o) => o !== c && c.contains(o)))!;
}
/** Nächstes Element (selbst oder Vorfahr), das per Inline-Style `color` setzt. */
function farbQuelle(el: HTMLElement) {
  for (let n: HTMLElement | null = el; n; n = n.parentElement) {
    const decl = inlineDecls(n).find(([p]) => p === 'color');
    if (decl) return { el: n, wert: decl[1] };
  }
  return null;
}
/** Zeigt die aktuell aktive Ansicht den Platzhaltertext? */
function zeigtPlatzhalter(r: Rtl) {
  return r.screen.getByRole('main').textContent?.includes(PLACEHOLDER) ?? false;
}
function tap(r: Rtl, label: string) {
  const nav = r.screen.getByRole('navigation', { name: 'Hauptnavigation' });
  r.fireEvent.click(r.within(nav).getByRole('button', { name: label }));
}
/**
 * Läuft über alle Menüpunkte, ruft `pruefe` für jede Platzhalteransicht auf und
 * stellt sicher, dass es mindestens eine gab (sonst wäre die Prüfung leer).
 */
function fuerJedePlatzhalteransicht(r: Rtl, pruefe: (label: string, main: HTMLElement, el: HTMLElement) => void) {
  const geprueft: string[] = [];
  for (const label of LABELS) {
    tap(r, label);
    if (!zeigtPlatzhalter(r)) continue;
    const main = r.screen.getByRole('main');
    pruefe(label, main, platzhalterElement(main));
    geprueft.push(label);
  }
  expect(geprueft.length, 'keine Ansicht zeigt den Platzhaltertext').toBeGreaterThan(0);
  return geprueft;
}

// CSS-Dateien aus src/ einhängen (siehe Kopfkommentar).
const styleEls: HTMLStyleElement[] = [];
beforeAll(() => {
  for (const f of walk(SRC).filter((u) => /\.css$/.test(u.pathname))) {
    const s = document.createElement('style');
    s.textContent = fs.readFileSync(f, 'utf8');
    document.head.appendChild(s);
    styleEls.push(s);
  }
});
afterAll(() => {
  styleEls.forEach((s) => s.remove());
});
beforeEach(() => {
  localStorage.clear();
  sessionStorage.clear();
});
afterEach(() => {
  cleanup();
});

// ===========================================================================
describe('REQ-004 Platzhaltertext in Farbrubrik Tertiär', () => {
  // ---------------------------------------------------------------- AK-1
  describe('AK-1 Platzhaltertext in der Farbrubrik Tertiär', () => {
    it('[REQ-004/AK-1] beim Öffnen (Start) steht der Platzhaltertext in einem Element innerhalb von <main>', () => {
      render(<App />);
      const main = screen.getByRole('main');
      const el = platzhalterElement(main);
      expect(main.contains(el)).toBe(true);
      expect(el).not.toBe(main);
      expect(within(main).getByText(PLACEHOLDER)).toBeVisible();
    });

    it('[REQ-004/AK-1] in jeder Platzhalteransicht ist der Text in der Farbe der Rubrik „Tertiär“ dargestellt', () => {
      const { container } = render(<App />);
      const root = appRoot(container);
      const soll = berechneteFarbe(root, farbrubriken.tertiaer.wert);
      fuerJedePlatzhalteransicht(rtl, (label, _main, el) => {
        expect(getComputedStyle(el).color, `bei aktivem "${label}"`).toBe(soll);
      });
    });

    it('[REQ-004/AK-1] die Textfarbe wird im Inhaltsbereich per Inline-Style genau als var(--bz-farbe-tertiaer) gesetzt', () => {
      render(<App />);
      fuerJedePlatzhalteransicht(rtl, (label, main, el) => {
        const quelle = farbQuelle(el);
        expect(quelle, `bei aktivem "${label}": keine Inline-Textfarbe gesetzt`).not.toBeNull();
        expect(main.contains(quelle!.el), `bei aktivem "${label}": Farbe kommt nicht aus dem Inhaltsbereich`).toBe(
          true,
        );
        expect(quelle!.el, `bei aktivem "${label}": Farbe nicht an <main> selbst`).not.toBe(main);
        expect(quelle!.wert.replace(/\s+/g, ''), `bei aktivem "${label}"`).toBe(`var(${VAR_TERTIAER})`);
      });
    });

    it('[REQ-004/AK-1] kein eigener, abweichender Farbwert: kein Farbliteral und kein Ausweichwert in der Textfarbe', () => {
      // Negativfall: var(--bz-farbe-tertiaer, #…) oder ein Literal wäre ein eigener Farbwert.
      render(<App />);
      fuerJedePlatzhalteransicht(rtl, (label, main, el) => {
        for (let n: HTMLElement | null = el; n && n !== main.parentElement; n = n.parentElement) {
          for (const [p, v] of inlineDecls(n).filter(([p]) => p === 'color')) {
            expect(v, `bei aktivem "${label}": <${n.tagName.toLowerCase()}> ${p}`).not.toMatch(FARB_LITERAL);
            expect(v, `bei aktivem "${label}": Ausweichwert in var()`).not.toMatch(/var\([^)]*,/);
          }
        }
      });
    });

    it('[REQ-004/AK-1] die Farbe wird nicht über die App-Wurzel vererbt (Absprache)', () => {
      const { container } = render(<App />);
      const root = appRoot(container);
      const main = screen.getByRole('main');
      const farbDecls = (el: HTMLElement) => inlineDecls(el).filter(([p]) => p === 'color');
      expect(farbDecls(root), 'App-Wurzel setzt eine Textfarbe').toEqual([]);
      expect(farbDecls(main), '<main> setzt eine Textfarbe').toEqual([]);
    });

    it('[REQ-004/AK-1] der Platzhaltertext folgt der Rubrik zur Laufzeit (Farbe ist kein fest eingesetzter Wert)', () => {
      // Wird --bz-farbe-tertiaer an der App-Wurzel umgesetzt, muss der Text mitgehen.
      // Ein fest eingesetzter Farbwert (auch derselbe Hexwert wie die Rubrik) fiele hier auf.
      const { container } = render(<App />);
      const root = appRoot(container);
      const neu = farbrubriken.primaer.wert; // beliebige andere zentrale Farbe, kein Hexwert im Test
      expect(berechneteFarbe(root, neu)).not.toBe(berechneteFarbe(root, farbrubriken.tertiaer.wert));
      root.style.setProperty(VAR_TERTIAER, neu);
      fuerJedePlatzhalteransicht(rtl, (label, _main, el) => {
        expect(getComputedStyle(el).color, `bei aktivem "${label}"`).toBe(berechneteFarbe(root, neu));
      });
    });

    it('[REQ-004/AK-1] es ist dieselbe Rubrik wie die Inaktivfarbe der Hauptnavigation (REQ-002)', () => {
      const { container } = render(<App />);
      const root = appRoot(container);
      const el = platzhalterElement(screen.getByRole('main'));
      expect(getComputedStyle(el).color).toBe(berechneteFarbe(root, 'var(--bz-nav-inaktivfarbe)'));
    });
  });

  // ---------------------------------------------------------------- AK-2
  describe('AK-2 Platzhaltertext hebt sich vom Hintergrund ab', () => {
    it('[REQ-004/AK-2] die Standardwerte der Rubriken „Tertiär“ und „Hintergrund“ sind verschieden', () => {
      const { container } = render(<App />);
      const root = appRoot(container);
      expect(berechneteFarbe(root, farbrubriken.tertiaer.wert)).not.toBe(
        berechneteFarbe(root, farbrubriken.hintergrund.wert),
      );
    });

    it('[REQ-004/AK-2] in jeder Platzhalteransicht unterscheidet sich die Textfarbe vom Hintergrund des Inhaltsbereichs', () => {
      const { container } = render(<App />);
      const root = appRoot(container);
      const hintergrund = berechneteFarbe(root, farbrubriken.hintergrund.wert);
      fuerJedePlatzhalteransicht(rtl, (label, main, el) => {
        const text = getComputedStyle(el).color;
        expect(getComputedStyle(main).backgroundColor, `bei aktivem "${label}": Hintergrund <main>`).toBe(hintergrund);
        expect(text, `bei aktivem "${label}": Text = Hintergrund (unsichtbar)`).not.toBe(hintergrund);
        expect(text, `bei aktivem "${label}": Text = Hintergrund <main>`).not.toBe(
          getComputedStyle(main).backgroundColor,
        );
      });
    });

    it('[REQ-004/AK-2] der Text ist nicht unsichtbar gemacht (keine Transparenz, keine Deckkraft 0)', () => {
      render(<App />);
      fuerJedePlatzhalteransicht(rtl, (label, main, el) => {
        expect(getComputedStyle(el).color, `bei aktivem "${label}"`).not.toMatch(/^transparent$|rgba\([^)]*,\s*0\)$/);
        for (let n: HTMLElement | null = el; n && n !== main.parentElement; n = n.parentElement) {
          const cs = getComputedStyle(n);
          expect(cs.opacity, `bei aktivem "${label}": opacity an <${n.tagName.toLowerCase()}>`).not.toBe('0');
          expect(cs.visibility).not.toBe('hidden');
          expect(cs.display).not.toBe('none');
        }
      });
    });

    it('[REQ-004/AK-2] der Text liegt nicht auf einem eigenen Hintergrund in Textfarbe', () => {
      // Negativfall: Ein Element zwischen Text und <main> mit Hintergrund in der
      // Rubrik „Tertiär“ würde den Text wieder unsichtbar machen.
      render(<App />);
      fuerJedePlatzhalteransicht(rtl, (label, main, el) => {
        for (let n: HTMLElement | null = el; n && n !== main; n = n.parentElement) {
          const bg = inlineDecls(n).filter(([p]) => p === 'background' || p === 'background-color');
          for (const [p, v] of bg) {
            expect(v, `bei aktivem "${label}": <${n.tagName.toLowerCase()}> ${p}`).not.toContain(VAR_TERTIAER);
          }
        }
      });
    });
  });

  // ---------------------------------------------------------------- AK-3
  describe('AK-3 Farbänderung der Rubrik wirkt auf den Platzhaltertext', () => {
    // „An der zentralen Stelle geändert“: Der Wert in der zentralen Farbdefinition
    // (@/theme, farbrubriken.tertiaer.wert) wird vor dem Laden der App geändert,
    // so wie es eine Farbänderung auf Zuruf im Code tut. Dafür werden Module neu
    // geladen, damit die App die geänderte Definition einliest.
    async function ladeMitGeaenderterTertiaerfarbe(neuerWert: string) {
      vi.resetModules();
      const theme = await import('@/theme');
      theme.farbrubriken.tertiaer.wert = neuerWert;
      const frischRtl = (await import('@testing-library/react')) as unknown as Rtl & {
        cleanup: typeof cleanup;
      };
      const { default: FrischeApp } = (await import('@/App')) as { default: typeof App };
      return { theme, frischRtl, FrischeApp };
    }

    afterEach(() => {
      vi.resetModules();
    });

    it.each([
      ['Primär', 'primaer'],
      ['Sekundär', 'sekundaer'],
    ] as const)(
      '[REQ-004/AK-3] nach Änderung von „Tertiär“ auf den Wert der Rubrik „%s“ zeigt der Platzhaltertext den neuen Wert',
      async (_name, quelle) => {
        const neuerWert = farbrubriken[quelle].wert;
        const { frischRtl, FrischeApp } = await ladeMitGeaenderterTertiaerfarbe(neuerWert);
        const { container } = frischRtl.render(<FrischeApp />);
        try {
          const root = appRoot(container);
          const soll = berechneteFarbe(root, neuerWert);
          const alt = berechneteFarbe(root, farbrubriken.tertiaer.wert);
          expect(soll, 'Testvoraussetzung: neuer Wert unterscheidet sich vom alten').not.toBe(alt);
          fuerJedePlatzhalteransicht(frischRtl, (label, _main, el) => {
            expect(getComputedStyle(el).color, `bei aktivem "${label}"`).toBe(soll);
            expect(getComputedStyle(el).color, `bei aktivem "${label}": alter Wert`).not.toBe(alt);
          });
        } finally {
          frischRtl.cleanup();
        }
      },
    );

    it('[REQ-004/AK-3] die Änderung der Rubrik „Tertiär“ wirkt gleichzeitig auf Platzhaltertext und Inaktivfarbe der Navigation', async () => {
      const neuerWert = farbrubriken.primaer.wert;
      const { frischRtl, FrischeApp } = await ladeMitGeaenderterTertiaerfarbe(neuerWert);
      const { container } = frischRtl.render(<FrischeApp />);
      try {
        const root = appRoot(container);
        const el = platzhalterElement(frischRtl.screen.getByRole('main'));
        expect(getComputedStyle(el).color).toBe(berechneteFarbe(root, neuerWert));
        expect(getComputedStyle(el).color).toBe(berechneteFarbe(root, 'var(--bz-nav-inaktivfarbe)'));
      } finally {
        frischRtl.cleanup();
      }
    });

    it('[REQ-004/AK-3] Gegenprobe: eine Änderung der Rubrik „Hintergrund“ verändert die Textfarbe nicht', () => {
      const { container } = render(<App />);
      const root = appRoot(container);
      const vorher = getComputedStyle(platzhalterElement(screen.getByRole('main'))).color;
      root.style.setProperty(VAR_HINTERGRUND, farbrubriken.sekundaer.wert);
      expect(getComputedStyle(platzhalterElement(screen.getByRole('main'))).color).toBe(vorher);
    });
  });
});
