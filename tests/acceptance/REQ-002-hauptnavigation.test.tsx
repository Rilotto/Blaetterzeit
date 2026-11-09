/**
 * Akzeptanztests REQ-002 – Untere Hauptnavigation mit fünf Menüpunkten.
 *
 * Abgeleitet aus dem REQ-Text und der Schnittstellen-Absprache in
 * sprints/sprint-01/plan.md (nicht aus dem Code):
 *  - <nav aria-label="Hauptnavigation"> mit genau fünf <button>
 *  - zugänglicher Name = Beschriftung
 *  - aktiver Menüpunkt: aria-current="page", alle anderen ohne aria-current
 *  - je Menüpunkt ein Icon-Element mit data-icon="<Dateiname>" und ein Beschriftungs-Element
 *  - Inhaltsbereich ist <main>
 *  - Farben aus src/theme/ (zentrale Farbrubriken)
 *  Ergänzung Runde 2:
 *  - Hervorhebung = eigenes Element mit data-highlight="active" | "inactive"
 *  - Farbrollen als CSS-Variablen --bz-nav-navigationshintergrund,
 *    --bz-nav-hervorhebungsfarbe, --bz-nav-aktivfarbe, --bz-nav-inaktivfarbe
 *  - Icon, Beschriftung, Hervorhebung und <nav> referenzieren ihre Farbe nur
 *    über diese Variablen (Inline-Style var(--bz-nav-…))
 *
 * Grenzen von jsdom: kein Layout, keine aus CSS-Dateien berechneten Farben.
 * Was hier nicht prüfbar ist, steht als manuelle Prüfliste in
 * sprints/sprint-01/testbericht.md.
 */
import '@testing-library/jest-dom/vitest';
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import App from '@/App';
// Zentrale Farbdefinition (Design-Tokens). Bewusst importiert statt Hexwerte im
// Test, damit Farbänderungen auf Zuruf (CLAUDE.md) keinen Test brechen.
import { farbrubriken } from '@/theme';

// ---------------------------------------------------------------------------
// Dateisystem-Zugriff (nur für AK-5, Farben, AK-10)
// tsconfig.app.json bindet nur die Typen von 'vite/client' ein, deshalb wird
// node:fs dynamisch und mit minimaler eigener Typisierung geladen.
// ---------------------------------------------------------------------------
type Bytes = Uint8Array & { equals(other: Uint8Array): boolean };
type DirEntry = { name: string; isDirectory(): boolean };
type FsLike = {
  existsSync(p: URL): boolean;
  readFileSync(p: URL): Bytes;
  readFileSync(p: URL, enc: 'utf8'): string;
  readdirSync(p: URL, o: { withFileTypes: true }): DirEntry[];
};
const NODE_FS = 'node:fs';
const NODE_URL = 'node:url';
const NODE_PROCESS = 'node:process';
const fs = (await import(/* @vite-ignore */ NODE_FS)) as FsLike;
const { pathToFileURL } = (await import(/* @vite-ignore */ NODE_URL)) as { pathToFileURL(p: string): URL };
const { cwd } = (await import(/* @vite-ignore */ NODE_PROCESS)) as { cwd(): string };

// Projektwurzel = Arbeitsverzeichnis von npm/vitest. Unabhängig vom Ort der
// Testdatei (tests/acceptance/ oder später tests/regression/).
// (import.meta.url ist unter jsdom keine file:-URL.)
const ROOT = pathToFileURL(`${cwd()}/`);
const SRC = new URL('src/', ROOT);
const REF_ICONS = new URL('docs/requirements/referenzen/icons/', ROOT);

function walk(dir: URL): URL[] {
  if (!fs.existsSync(dir)) return [];
  const out: URL[] = [];
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (e.isDirectory()) out.push(...walk(new URL(`${e.name}/`, dir)));
    else out.push(new URL(e.name, dir));
  }
  return out;
}
const baseName = (u: URL) => decodeURIComponent(u.pathname.split('/').pop() ?? '');
const relToSrc = (u: URL) => decodeURIComponent(u.pathname.slice(SRC.pathname.length));

// ---------------------------------------------------------------------------
// Erwartung laut REQ-002 (Reihenfolge und Zuordnungstabelle)
// ---------------------------------------------------------------------------
const NAV_ITEMS = [
  { label: 'Start', icon: 'icon-haus.png' },
  { label: 'Bücher', icon: 'icon-offenes-buch.png' },
  { label: 'Bibliothek', icon: 'icon-buecherregal.png' },
  { label: 'Statistik', icon: 'icon-diagramm.png' },
  { label: 'Profil', icon: 'icon-person.png' },
] as const;
const LABELS = NAV_ITEMS.map((i) => i.label);
const PLACEHOLDER = 'under construction :)';

// ---------------------------------------------------------------------------
// Hilfsfunktionen (nur öffentliche, zugängliche Struktur)
// ---------------------------------------------------------------------------
function renderApp() {
  render(<App />);
  return getNav();
}
function getNav() {
  return screen.getByRole('navigation', { name: 'Hauptnavigation' });
}
function getItems() {
  return within(getNav()).getAllByRole('button');
}
function getItem(label: string) {
  return within(getNav()).getByRole('button', { name: label });
}
function getIcon(button: HTMLElement) {
  const icons = button.querySelectorAll<HTMLElement>('[data-icon]');
  expect(icons, `Menüpunkt "${button.textContent}" braucht genau ein Icon-Element`).toHaveLength(1);
  return icons[0];
}
/** Innerstes Element mit genau der Beschriftung, das kein Icon ist und keins enthält. */
function getLabelEl(button: HTMLElement, label: string) {
  const candidates = Array.from(button.querySelectorAll<HTMLElement>('*')).filter(
    (el) =>
      el.textContent?.trim() === label &&
      !el.hasAttribute('data-icon') &&
      el.querySelector('[data-icon]') === null,
  );
  expect(candidates.length, `Menüpunkt "${label}" braucht ein eigenes Beschriftungs-Element`).toBeGreaterThan(0);
  // innerstes Element = das, welches kein weiteres Kandidaten-Element enthält
  return candidates.find((c) => !candidates.some((o) => o !== c && c.contains(o)))!;
}
function tap(label: string) {
  fireEvent.click(getItem(label));
}
/** Prüft: genau `label` ist aktiv (aria-current="page"), alle anderen haben KEIN aria-current. */
function expectOnlyActive(label: string) {
  for (const l of LABELS) {
    const attr = getItem(l).getAttribute('aria-current');
    if (l === label) expect(attr, `"${l}" soll aktiv sein`).toBe('page');
    else expect(attr, `"${l}" soll kein aria-current haben`).toBeNull();
  }
  expect(getItems().filter((b) => b.hasAttribute('aria-current'))).toHaveLength(1);
}

beforeEach(() => {
  localStorage.clear();
  sessionStorage.clear();
});
afterEach(() => {
  cleanup();
});

// ===========================================================================
describe('REQ-002 Untere Hauptnavigation', () => {
  // ---------------------------------------------------------------- AK-1
  describe('AK-1 Fünf Menüpunkte in fester Reihenfolge', () => {
    it('[REQ-002/AK-1] es gibt genau eine Hauptnavigation', () => {
      render(<App />);
      expect(screen.getAllByRole('navigation', { name: 'Hauptnavigation' })).toHaveLength(1);
    });

    it('[REQ-002/AK-1] die Hauptnavigation enthält genau fünf Menüpunkte', () => {
      renderApp();
      expect(getItems()).toHaveLength(5);
    });

    it('[REQ-002/AK-1] Beschriftungen von links nach rechts: Start, Bücher, Bibliothek, Statistik, Profil', () => {
      renderApp();
      const names = getItems().map((b) => b.textContent?.trim());
      expect(names).toEqual(LABELS);
      // zugänglicher Name ist exakt die Beschriftung (kein Zusatz wie Icon-Alt-Text)
      LABELS.forEach((l, idx) => expect(getItem(l)).toBe(getItems()[idx]));
    });

    it('[REQ-002/AK-1] die Reihenfolge bleibt nach Wechsel des aktiven Menüpunkts unverändert', () => {
      renderApp();
      tap('Statistik');
      tap('Profil');
      expect(getItems().map((b) => b.textContent?.trim())).toEqual(LABELS);
    });
  });

  // ---------------------------------------------------------------- AK-2
  describe('AK-2 Position am unteren Bildschirmrand und Hintergrund', () => {
    it('[REQ-002/AK-2] die Hauptnavigation ist nicht Teil des Inhaltsbereichs (<main>)', () => {
      const nav = renderApp();
      const main = screen.getByRole('main');
      expect(main.contains(nav)).toBe(false);
      expect(nav.contains(main)).toBe(false);
    });
    // Position (unten) und Hintergrundfarbe: siehe Farb-Test unten + manuelle Prüfliste M-2.
  });

  // ---------------------------------------------------------------- AK-3
  describe('AK-3 Gleichmäßige Verteilung', () => {
    it('[REQ-002/AK-3] alle fünf Menüpunkte sind strukturell gleichrangig (gleicher DOM-Pfad, gleiche Inline-Styles)', () => {
      // Teilprüfung: Breiten sind in jsdom nicht messbar (manuell M-3).
      // Geprüft wird, dass kein Menüpunkt strukturell anders eingebettet oder
      // per Inline-Style anders dimensioniert ist.
      const nav = renderApp();
      const pathOf = (el: HTMLElement) => {
        const tags: string[] = [];
        for (let n: HTMLElement | null = el; n && n !== nav; n = n.parentElement) tags.push(n.tagName);
        return tags.join('<');
      };
      const items = getItems();
      expect(new Set(items.map(pathOf)).size).toBe(1);
      expect(new Set(items.map((b) => b.getAttribute('style') ?? '')).size).toBe(1);
    });
  });

  // ---------------------------------------------------------------- AK-4
  describe('AK-4 Icon mittig über der Beschriftung', () => {
    it('[REQ-002/AK-4] jeder Menüpunkt besteht aus genau einem Icon und einer Beschriftung', () => {
      renderApp();
      for (const { label } of NAV_ITEMS) {
        const btn = getItem(label);
        getIcon(btn);
        getLabelEl(btn, label);
        expect(btn.textContent?.trim()).toBe(label);
      }
    });

    it('[REQ-002/AK-4] das Icon steht in der Dokumentreihenfolge vor (über) der Beschriftung', () => {
      // Teilprüfung: visuelle Anordnung „über“ und „mittig“ manuell (M-4).
      renderApp();
      for (const { label } of NAV_ITEMS) {
        const btn = getItem(label);
        const icon = getIcon(btn);
        const labelEl = getLabelEl(btn, label);
        expect(icon.contains(labelEl)).toBe(false);
        expect(icon.compareDocumentPosition(labelEl) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
      }
    });
  });

  // ---------------------------------------------------------------- AK-5
  describe('AK-5 Nur die Icons des CEO gemäß Zuordnungstabelle', () => {
    it.each(NAV_ITEMS)('[REQ-002/AK-5] Menüpunkt "$label" zeigt $icon', ({ label, icon }) => {
      renderApp();
      expect(getIcon(getItem(label))).toHaveAttribute('data-icon', icon);
    });

    it('[REQ-002/AK-5] jedes Icon-Element verweist (falls es eine Bildquelle hat) auf genau seine Datei', () => {
      // Schutz davor, dass data-icon etwas anderes behauptet als tatsächlich angezeigt wird.
      renderApp();
      for (const { label, icon } of NAV_ITEMS) {
        const el = getIcon(getItem(label));
        const refs: string[] = [];
        const src = el.getAttribute('src');
        if (src) refs.push(src);
        for (const m of (el.getAttribute('style') ?? '').matchAll(/url\(\s*['"]?([^'")]+)['"]?\s*\)/g)) refs.push(m[1]);
        for (const r of refs) {
          if (r.startsWith('data:')) continue; // inline eingebettet: per Dateivergleich unten abgedeckt
          expect(decodeURIComponent(r), `Icon von "${label}"`).toContain(icon.replace(/\.png$/, ''));
          for (const other of NAV_ITEMS.filter((o) => o.icon !== icon)) {
            expect(decodeURIComponent(r)).not.toContain(other.icon.replace(/\.png$/, ''));
          }
        }
      }
    });

    it('[REQ-002/AK-5] die Hauptnavigation enthält keine Inline-SVG-Icons (Icon-Bibliothek / selbst gezeichnet)', () => {
      const nav = renderApp();
      expect(nav.querySelectorAll('svg')).toHaveLength(0);
    });

    it('[REQ-002/AK-5] es ist keine Icon-Bibliothek als Abhängigkeit eingebunden', () => {
      const pkg = JSON.parse(fs.readFileSync(new URL('package.json', ROOT), 'utf8')) as {
        dependencies?: Record<string, string>;
        devDependencies?: Record<string, string>;
      };
      const deps = Object.keys({ ...pkg.dependencies, ...pkg.devDependencies });
      const iconLibs = deps.filter((d) =>
        /icon|lucide|fortawesome|heroicons|phosphor|feather|iconify|material-symbols|remixicon/i.test(d),
      );
      expect(iconLibs).toEqual([]);
    });

    it('[REQ-002/AK-5] die fünf Icon-Dateien des CEO sind byte-identisch im Quellcode vorhanden', () => {
      const srcFiles = walk(SRC);
      for (const { icon } of NAV_ITEMS) {
        const ref = fs.readFileSync(new URL(icon, REF_ICONS));
        const copies = srcFiles.filter((f) => baseName(f) === icon);
        if (copies.length === 0) {
          // Zulässige Alternative: direkter Verweis auf die Referenzdatei des CEO.
          const referenced = srcFiles
            .filter((f) => /\.(tsx?|css)$/.test(f.pathname))
            .some((f) => fs.readFileSync(f, 'utf8').includes(`referenzen/icons/${icon}`));
          expect(referenced, `${icon}: weder Kopie unter src/ noch Verweis auf docs/requirements/referenzen/icons/`).toBe(true);
        }
        for (const c of copies) {
          expect(fs.readFileSync(c).equals(ref), `${relToSrc(c)} weicht von der CEO-Datei ab`).toBe(true);
        }
      }
    });

    it('[REQ-002/AK-5] unter src/ gibt es keine weiteren oder abweichenden Icon-Dateien', () => {
      const refs = NAV_ITEMS.map(({ icon }) => fs.readFileSync(new URL(icon, REF_ICONS)));
      const iconFiles = walk(SRC).filter(
        (f) =>
          /\.(png|svg|webp|jpe?g|gif|avif|ico)$/i.test(f.pathname) &&
          (/\/icons?\//i.test(f.pathname) || /^icon/i.test(baseName(f))),
      );
      const foreign = iconFiles.filter((f) => {
        const bytes = fs.readFileSync(f);
        return !refs.some((r) => bytes.equals(r));
      });
      expect(foreign.map(relToSrc)).toEqual([]);
    });
  });

  // ---------------------------------------------------------------- AK-6
  describe('AK-6 Darstellung des aktiven Menüpunkts', () => {
    it.each(LABELS)('[REQ-002/AK-6] "%s" als aktiver Menüpunkt ist eindeutig markiert und behält Icon und Beschriftung', (label) => {
      renderApp();
      tap(label);
      expectOnlyActive(label);
      const btn = getItem(label);
      expect(getIcon(btn)).toHaveAttribute('data-icon', NAV_ITEMS.find((i) => i.label === label)!.icon);
      getLabelEl(btn, label);
    });
    // Hervorhebung (data-highlight) und Farbrollen: automatisch im Block
    // „Hervorhebung und Farbrollen“. Form (länglich, abgerundet) und Höhe: manuell M-6.
  });

  // ---------------------------------------------------------------- AK-7
  describe('AK-7 Darstellung der inaktiven Menüpunkte', () => {
    it('[REQ-002/AK-7] bei aktivem "Bücher" haben alle anderen vier Menüpunkte kein aria-current', () => {
      renderApp();
      tap('Bücher');
      for (const l of LABELS.filter((x) => x !== 'Bücher')) {
        expect(getItem(l)).not.toHaveAttribute('aria-current');
      }
    });
    // Inaktivfarbe und fehlende Hervorhebung: automatisch im Block
    // „Hervorhebung und Farbrollen“, Sichtprüfung M-7.
  });

  // ------------------------------------------------- Farben (AK-2, AK-6, AK-7)
  describe('Farbrollen aus zentralen Farbrubriken', () => {
    it('[REQ-002/AK-2] [REQ-002/AK-6] [REQ-002/AK-7] Farben sind zentral in src/theme/ definiert, nirgends sonst als Farbwert im Code', () => {
      // Teilprüfung: Welche Rolle welches Element sichtbar färbt, ist in jsdom
      // nicht berechenbar (manuell M-2, M-6, M-7). Geprüft wird die vom REQ
      // verlangte zentrale Führung der Farben: Farbwerte existieren in src/theme/
      // und sonst nirgends in src/ als Literal.
      const colorLiteral = /#[0-9a-fA-F]{3,8}\b|\brgba?\(|\bhsla?\(|\boklch\(|\blab\(/;
      const themeDir = new URL('theme/', SRC);
      const themeFiles = walk(themeDir);
      expect(themeFiles.length, 'src/theme/ fehlt oder ist leer').toBeGreaterThan(0);
      const themeText = themeFiles.map((f) => fs.readFileSync(f, 'utf8')).join('\n');
      const themeColors = new Set(
        themeText.match(/#[0-9a-fA-F]{6}\b|#[0-9a-fA-F]{3}\b|\b(?:rgba?|hsla?|oklch)\([^)]*\)/g) ?? [],
      );
      expect(themeColors.size, 'mindestens vier Farbrubriken mit Farbwert').toBeGreaterThanOrEqual(4);

      const offenders = walk(SRC)
        .filter((f) => /\.(tsx?|css|scss)$/.test(f.pathname) && !f.pathname.startsWith(themeDir.pathname))
        .filter((f) => colorLiteral.test(fs.readFileSync(f, 'utf8')))
        .map(relToSrc);
      expect(offenders, 'Farbwerte außerhalb von src/theme/').toEqual([]);
    });
  });

  // ------------------------------- Runde 2: Hervorhebung und Farbrollen (AK-2, AK-6, AK-7, AK-8, AK-11)
  describe('Hervorhebung und Farbrollen über --bz-nav-*-Variablen', () => {
    // Zuordnung Farbrolle -> Farbrubrik laut REQ-002, Tabelle „Farben“.
    // Die WERTE kommen aus der zentralen Definition, nie aus dem Test.
    const ROLLEN = {
      navigationshintergrund: 'hintergrund',
      hervorhebungsfarbe: 'sekundaer',
      aktivfarbe: 'primaer',
      inaktivfarbe: 'tertiaer',
    } as const;
    type Rolle = keyof typeof ROLLEN;
    const ALLE_ROLLEN = Object.keys(ROLLEN) as Rolle[];
    const navVar = (r: Rolle) => `--bz-nav-${r}`;

    function appRoot(container: HTMLElement) {
      const root = container.firstElementChild as HTMLElement | null;
      expect(root, 'App rendert kein Wurzelelement').not.toBeNull();
      return root!;
    }
    /** Normalisiert einen Farbausdruck so, wie jsdom ihn berechnet (Probe-Element im Kontext `ctx`). */
    function berechneteFarbe(ctx: HTMLElement, ausdruck: string) {
      const probe = document.createElement('span');
      probe.style.setProperty('color', ausdruck);
      ctx.appendChild(probe);
      const wert = getComputedStyle(probe).color;
      probe.remove();
      return wert;
    }
    function rubrikFarbe(ctx: HTMLElement, r: Rolle) {
      const wert = farbrubriken[ROLLEN[r]]?.wert;
      expect(wert, `Farbrubrik "${ROLLEN[r]}" fehlt in der zentralen Definition`).toBeTruthy();
      return berechneteFarbe(ctx, wert);
    }
    /** Inline-Style als Liste [Eigenschaft, Wert]. */
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
    /** Welche --bz-nav-*-Rollen referenziert der Inline-Style des Elements? */
    function referenzierteRollen(el: HTMLElement) {
      const style = el.getAttribute('style') ?? '';
      return ALLE_ROLLEN.filter((r) => new RegExp(`var\\(\\s*${navVar(r)}\\s*[,)]`).test(style));
    }
    function getHighlight(button: HTMLElement) {
      const hs = button.querySelectorAll<HTMLElement>('[data-highlight]');
      expect(hs, `Menüpunkt "${button.textContent}" braucht genau ein Hervorhebungs-Element`).toHaveLength(1);
      return hs[0];
    }
    function istVerborgen(el: HTMLElement) {
      for (let n: HTMLElement | null = el; n; n = n.parentElement) {
        const cs = getComputedStyle(n);
        if (cs.display === 'none' || cs.visibility === 'hidden' || cs.opacity === '0') return true;
      }
      return false;
    }
    /** Nächstes Element (selbst oder Vorfahr bis einschließlich `bis`), das per Inline-Style `color` setzt. */
    function farbQuelle(el: HTMLElement, bis: HTMLElement) {
      for (let n: HTMLElement | null = el; n; n = n.parentElement) {
        const decl = inlineDecls(n).find(([p]) => p === 'color');
        if (decl) return { el: n, wert: decl[1] };
        if (n === bis) break;
      }
      return null;
    }

    /** Prüft die vollständige Darstellung „aktiv“ (AK-6) bzw. „inaktiv“ (AK-7) eines Menüpunkts. */
    function expectDarstellung(label: string, aktiv: boolean, root: HTMLElement) {
      const btn = getItem(label);
      const icon = getIcon(btn);
      const labelEl = getLabelEl(btn, label);
      const hl = getHighlight(btn);
      const eigene: Rolle = aktiv ? 'aktivfarbe' : 'inaktivfarbe';
      const fremde: Rolle = aktiv ? 'inaktivfarbe' : 'aktivfarbe';

      // Hervorhebung: Zustand
      expect(hl, `"${label}" data-highlight`).toHaveAttribute('data-highlight', aktiv ? 'active' : 'inactive');
      // Hervorhebung liegt hinter dem Icon, nicht über der Beschriftung (nicht volle Höhe)
      const hinterIcon = hl.contains(icon) || (hl.parentElement !== null && hl.parentElement === icon.parentElement);
      expect(hinterIcon, `"${label}": Hervorhebung muss das Icon umschließen oder neben ihm liegen`).toBe(true);
      expect(hl.contains(labelEl), `"${label}": Hervorhebung darf die Beschriftung nicht umfassen`).toBe(false);
      expect(hl.contains(btn)).toBe(false);

      if (aktiv) {
        expect(referenzierteRollen(hl), `"${label}": Hervorhebung färbt über --bz-nav-hervorhebungsfarbe`).toEqual([
          'hervorhebungsfarbe',
        ]);
        expect(istVerborgen(hl), `"${label}": aktive Hervorhebung ist verborgen`).toBe(false);
        expect(getComputedStyle(hl).backgroundColor).toBe(rubrikFarbe(root, 'hervorhebungsfarbe'));
      } else {
        const sichtbarGefaerbt =
          referenzierteRollen(hl).includes('hervorhebungsfarbe') && !istVerborgen(hl);
        expect(sichtbarGefaerbt, `"${label}": inaktiver Punkt darf keine sichtbare Hervorhebung haben`).toBe(false);
      }

      // Icon: färbt sich ausschließlich über die eigene Zustandsvariable
      expect(referenzierteRollen(icon), `"${label}": Icon-Farbrolle`).toEqual([eigene]);
      const iconCs = getComputedStyle(icon);
      expect([iconCs.backgroundColor, iconCs.color], `"${label}": Icon in ${eigene}`).toContain(
        rubrikFarbe(root, eigene),
      );

      // Beschriftung: nächste Farbquelle im Menüpunkt ist genau die eigene Variable
      const quelle = farbQuelle(labelEl, btn);
      expect(quelle, `"${label}": Beschriftung bzw. Menüpunkt setzt keine Farbe`).not.toBeNull();
      expect(quelle!.wert.replace(/\s+/g, '')).toBe(`var(${navVar(eigene)})`);
      expect(referenzierteRollen(labelEl)).not.toContain(fremde);
      expect(getComputedStyle(labelEl).color, `"${label}": Beschriftung in ${eigene}`).toBe(rubrikFarbe(root, eigene));
    }
    function expectNurAktiv(label: string, root: HTMLElement) {
      for (const l of LABELS) expectDarstellung(l, l === label, root);
      expect(getNav().querySelectorAll('[data-highlight="active"]')).toHaveLength(1);
    }

    it('[REQ-002/AK-2] [REQ-002/AK-6] [REQ-002/AK-7] die vier --bz-nav-*-Variablen stehen an der App-Wurzel und zeigen auf ihre Farbrubriken', () => {
      const { container } = render(<App />);
      const root = appRoot(container);
      for (const r of ALLE_ROLLEN) {
        const roh = getComputedStyle(root).getPropertyValue(navVar(r)).trim();
        expect(roh, `${navVar(r)} ist an der App-Wurzel nicht gesetzt`).not.toBe('');
        expect(berechneteFarbe(root, `var(${navVar(r)})`), `${navVar(r)} -> Rubrik ${ROLLEN[r]}`).toBe(
          rubrikFarbe(root, r),
        );
      }
    });

    it('[REQ-002/AK-2] die Hauptnavigation hat den Hintergrund aus --bz-nav-navigationshintergrund', () => {
      const { container } = render(<App />);
      const root = appRoot(container);
      const nav = getNav();
      expect(referenzierteRollen(nav)).toEqual(['navigationshintergrund']);
      expect(getComputedStyle(nav).backgroundColor).toBe(rubrikFarbe(root, 'navigationshintergrund'));
    });

    it.each(LABELS)('[REQ-002/AK-6] [REQ-002/AK-7] bei aktivem "%s": Hervorhebung und Farben aktiv/inaktiv korrekt', (label) => {
      const { container } = render(<App />);
      const root = appRoot(container);
      tap(label);
      expectNurAktiv(label, root);
    });

    it('[REQ-002/AK-6] [REQ-002/AK-7] in der Navigation stehen keine Farbliterale im Inline-Style, nur --bz-nav-*-Verweise', () => {
      render(<App />);
      const nav = getNav();
      // Reine Farbeigenschaften: Wert muss eine --bz-nav-*-Variable oder ein neutrales Schlüsselwort sein.
      const reineFarbEig = /(^|-)color$|^fill$|^stroke$/;
      const neutral = /^(transparent|inherit|currentcolor|none|initial|unset)$/i;
      // Kurzschreibweisen (border, background, outline, box-shadow …): verboten ist nur ein Farbbestandteil.
      const kurzEig = /^background$|^border(-(top|right|bottom|left))?$|^outline$|^box-shadow$|^text-shadow$/;
      const farbLiteral =
        /#[0-9a-f]{3,8}\b|\b(?:rgba?|hsla?|hwb|oklch|oklab|lab|lch|color)\(|\b(?:black|white|red|green|blue|gray|grey|silver|maroon|brown|beige|ivory|cream|navy|purple|orange|yellow|pink|tan|wheat|linen|khaki)\b/i;
      const verstoss = (p: string, v: string) => {
        const ohneVar = v.replace(/var\(\s*--bz-nav-[a-z-]+\s*\)/gi, '');
        if (reineFarbEig.test(p)) return !/var\(\s*--bz-nav-/.test(v) && !neutral.test(v.trim());
        if (kurzEig.test(p)) return farbLiteral.test(ohneVar);
        return false;
      };
      for (const l of [...LABELS, 'Start']) {
        tap(l);
        const verstoesse = [nav, ...Array.from(nav.querySelectorAll<HTMLElement>('*'))].flatMap((el) =>
          inlineDecls(el)
            .filter(([p, v]) => verstoss(p, v))
            .map(([p, v]) => `<${el.tagName.toLowerCase()}> ${p}: ${v}`),
        );
        expect(verstoesse, `bei aktivem "${l}"`).toEqual([]);
      }
    });

    it('[REQ-002/AK-8] beim Wechsel tauschen Hervorhebung und Farben vollständig (Hin- und Rückweg)', () => {
      const { container } = render(<App />);
      const root = appRoot(container);
      for (const l of ['Bücher', 'Profil', 'Start', 'Statistik', 'Bibliothek', 'Bücher'] as const) {
        tap(l);
        expectNurAktiv(l, root);
      }
    });

    // ------------------------------------------------------------ AK-13 (Runde 3)
    // Absprache: <main> setzt background per Inline-Style var(--bz-farbe-hintergrund);
    // --bz-nav-navigationshintergrund zeigt auf dieselbe Rubrik.
    const RUBRIK_VAR_HINTERGRUND = '--bz-farbe-hintergrund';

    it('[REQ-002/AK-13] --bz-farbe-hintergrund steht an der App-Wurzel und ergibt die Rubrik „Hintergrund“', () => {
      const { container } = render(<App />);
      const root = appRoot(container);
      expect(getComputedStyle(root).getPropertyValue(RUBRIK_VAR_HINTERGRUND).trim()).not.toBe('');
      expect(berechneteFarbe(root, `var(${RUBRIK_VAR_HINTERGRUND})`)).toBe(rubrikFarbe(root, 'navigationshintergrund'));
    });

    it.each(LABELS)(
      '[REQ-002/AK-13] bei aktivem "%s" hat der Inhaltsbereich denselben Hintergrund wie die Hauptnavigation (Rubrik „Hintergrund“)',
      (label) => {
        const { container } = render(<App />);
        const root = appRoot(container);
        tap(label);
        const main = screen.getByRole('main');
        const mainBg = getComputedStyle(main).backgroundColor;
        const soll = rubrikFarbe(root, 'navigationshintergrund');
        expect(mainBg, 'Hintergrund <main>').toBe(soll);
        expect(mainBg, 'gleich wie Hintergrund <nav>').toBe(getComputedStyle(getNav()).backgroundColor);
      },
    );

    it('[REQ-002/AK-13] <main> bezieht den Hintergrund per var(--bz-farbe-hintergrund), ohne eigenen Farbwert', () => {
      render(<App />);
      const main = screen.getByRole('main');
      const decls = inlineDecls(main).filter(([p]) => p === 'background' || p === 'background-color');
      expect(decls.length, '<main> setzt keinen Hintergrund per Inline-Style').toBeGreaterThan(0);
      for (const [p, v] of decls) {
        expect(v, `<main> ${p}`).toMatch(new RegExp(`var\\(\\s*${RUBRIK_VAR_HINTERGRUND}\\s*\\)`));
        expect(v.replace(/var\([^)]*\)/g, ''), `<main> ${p}: kein zusätzlicher Farbwert`).not.toMatch(
          /#[0-9a-f]{3,8}\b|\b(?:rgba?|hsla?|hwb|oklch|oklab|lab|lch)\(/i,
        );
      }
    });

    it('[REQ-002/AK-13] kein Element im Inhaltsbereich überdeckt den Hintergrund mit einer eigenen Farbe (alle Ansichten)', () => {
      render(<App />);
      const neutral = /^(transparent|none|inherit|initial|unset)$/i;
      for (const l of [...LABELS, 'Start']) {
        tap(l);
        const main = screen.getByRole('main');
        const verstoesse = Array.from(main.querySelectorAll<HTMLElement>('*')).flatMap((el) =>
          inlineDecls(el)
            .filter(([p]) => p === 'background' || p === 'background-color')
            .filter(([, v]) => !neutral.test(v) && !new RegExp(`^var\\(\\s*${RUBRIK_VAR_HINTERGRUND}\\s*\\)$`).test(v))
            .map(([p, v]) => `<${el.tagName.toLowerCase()}> ${p}: ${v}`),
        );
        expect(verstoesse, `bei aktivem "${l}"`).toEqual([]);
      }
    });

    it('[REQ-002/AK-11] beim Öffnen hat genau "Start" die Hervorhebung und die Aktivfarbe', () => {
      const { container } = render(<App />);
      expectNurAktiv('Start', appRoot(container));
    });
  });

  // ---------------------------------------------------------------- AK-8
  describe('AK-8 Wechsel des aktiven Menüpunkts', () => {
    const transitions = LABELS.flatMap((from) => LABELS.filter((to) => to !== from).map((to) => [from, to] as const));
    it.each(transitions)('[REQ-002/AK-8] Wechsel von "%s" nach "%s"', (from, to) => {
      renderApp();
      tap(from);
      expectOnlyActive(from);
      tap(to);
      expectOnlyActive(to);
    });

    it('[REQ-002/AK-8] erneutes Antippen des aktiven Menüpunkts lässt ihn aktiv (kein Umschalten/Abwählen)', () => {
      renderApp();
      tap('Bibliothek');
      tap('Bibliothek');
      expectOnlyActive('Bibliothek');
      tap('Start');
      tap('Start');
      expectOnlyActive('Start');
    });

    it('[REQ-002/AK-8] eine längere Folge von Wechseln endet beim zuletzt angetippten Menüpunkt', () => {
      renderApp();
      for (const l of ['Profil', 'Start', 'Statistik', 'Bücher', 'Profil', 'Bibliothek'] as const) tap(l);
      expectOnlyActive('Bibliothek');
    });
  });

  // ---------------------------------------------------------------- AK-9
  describe('AK-9 Sichtbar beim vertikalen Scrollen', () => {
    it('[REQ-002/AK-9] die Hauptnavigation bleibt bei allen Wechseln dasselbe, dauerhaft vorhandene Element außerhalb des Inhalts', () => {
      // Teilprüfung: Scrollverhalten selbst ist in jsdom nicht prüfbar (manuell M-9).
      const nav = renderApp();
      for (const l of [...LABELS, 'Start']) {
        tap(l);
        expect(getNav()).toBe(nav); // nicht neu erzeugt / nicht Teil der Zielansicht
        expect(nav).toBeInTheDocument();
        expect(screen.getByRole('main').contains(nav)).toBe(false);
      }
    });
  });

  // ---------------------------------------------------------------- AK-10
  describe('AK-10 Unterer sicherer Bildschirmbereich', () => {
    it('[REQ-002/AK-10] Voraussetzung: der untere sichere Bereich wird im Code berücksichtigt', () => {
      // Notwendige, NICHT hinreichende Bedingung (siehe Testbericht, M-10):
      // Viewport bis in den Systembereich (viewport-fit=cover) UND Auswertung
      // von safe-area-inset-bottom (env() oder Capacitor-CSS-Variable) in src/.
      const html = fs.readFileSync(new URL('index.html', ROOT), 'utf8');
      expect(html).toMatch(/viewport-fit\s*=\s*cover/);
      const usesInset = walk(SRC)
        .filter((f) => /\.(tsx?|css|scss)$/.test(f.pathname))
        .some((f) => /safe-area-inset-bottom/.test(fs.readFileSync(f, 'utf8')));
      expect(usesInset).toBe(true);
    });
  });

  // ---------------------------------------------------------------- AK-11
  describe('AK-11 „Start“ ist beim Öffnen der App aktiv', () => {
    it('[REQ-002/AK-11] nach dem Öffnen ist genau "Start" aktiv, alle anderen nicht', () => {
      renderApp();
      expectOnlyActive('Start');
    });

    it('[REQ-002/AK-11] auch nach vorherigem Wechsel auf "Profil" ist beim erneuten Öffnen "Start" aktiv', () => {
      renderApp();
      tap('Profil');
      expectOnlyActive('Profil');
      cleanup(); // App schließen – Speicher (localStorage/sessionStorage) bleibt bewusst erhalten
      renderApp();
      expectOnlyActive('Start');
    });
  });

  // ---------------------------------------------------------------- AK-12
  describe('AK-12 Platzhaltertext im Inhaltsbereich', () => {
    it('[REQ-002/AK-12] beim Öffnen zeigt der Inhaltsbereich genau "under construction :)"', () => {
      renderApp();
      expect(screen.getAllByRole('main')).toHaveLength(1);
      expect(screen.getByRole('main').textContent?.trim()).toBe(PLACEHOLDER);
    });

    it.each(LABELS)('[REQ-002/AK-12] bei aktivem "%s" zeigt der Inhaltsbereich genau "under construction :)"', (label) => {
      renderApp();
      tap(label);
      const main = screen.getByRole('main');
      expect(main.textContent?.trim()).toBe(PLACEHOLDER);
      expect(within(main).getByText(PLACEHOLDER)).toBeVisible();
    });
    // Horizontale und vertikale Zentrierung: manuell M-12.
  });
});
