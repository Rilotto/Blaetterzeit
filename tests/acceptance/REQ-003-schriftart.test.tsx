/**
 * Akzeptanztests REQ-003 – Zentral definierte App-Schrift.
 *
 * Abgeleitet aus dem REQ-Text (Fassung nach CEO-Anweisung „Ersatzschrift“) und
 * der Schnittstellen-Absprache in sprints/sprint-01/plan.md (nicht aus dem Code):
 *  - App-Schrift genau an einer Stelle definiert (src/theme/schrift.ts) als
 *    CSS-Variable --bz-schrift an der App-Wurzel
 *  - Wert endet mit einer generischen Ersatzschrift
 *  - kein @font-face, keine Schriftdatei
 *
 * Bewusst NICHT geprüft: der konkrete Schriftname (laut REQ kein AK, wird
 * später durch den CEO ersetzt).
 *
 * jsdom wendet CSS-Dateien, die per import eingebunden werden, nicht an.
 * Damit eine Festlegung in einer CSS-Datei (z. B. body { font-family: … })
 * nicht übersehen wird, werden alle CSS-Dateien aus src/ vor dem Rendern als
 * <style> in das Dokument gelegt (so wie der Build sie ausliefert).
 */
import '@testing-library/jest-dom/vitest';
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import App from '@/App';

// ---------------------------------------------------------------------------
// Dateisystem-Zugriff (gleiches Muster wie REQ-002: dynamisch, minimal typisiert)
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
const PUBLIC = new URL('public/', ROOT);

function walk(dir: URL): URL[] {
  if (!fs.existsSync(dir)) return [];
  const out: URL[] = [];
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (e.isDirectory()) out.push(...walk(new URL(`${e.name}/`, dir)));
    else out.push(new URL(e.name, dir));
  }
  return out;
}
const relTo = (base: URL, u: URL) => decodeURIComponent(u.pathname.slice(base.pathname.length));
const lies = (u: URL) => fs.readFileSync(u, 'utf8');

// ---------------------------------------------------------------------------
// Erwartung laut REQ-003 / REQ-002 (aktuelle Texte der App)
// ---------------------------------------------------------------------------
const LABELS = ['Start', 'Bücher', 'Bibliothek', 'Statistik', 'Profil'] as const;
const PLACEHOLDER = 'under construction :)';
/** Generische Schriftfamilien laut CSS Fonts Level 4. */
const GENERISCH = new Set([
  'serif',
  'sans-serif',
  'monospace',
  'cursive',
  'fantasy',
  'system-ui',
  'ui-serif',
  'ui-sans-serif',
  'ui-monospace',
  'ui-rounded',
  'math',
  'emoji',
  'fangsong',
]);

// ---------------------------------------------------------------------------
// Hilfsfunktionen
// ---------------------------------------------------------------------------
let cssStyles: HTMLStyleElement[] = [];
beforeAll(() => {
  cssStyles = walk(SRC)
    .filter((f) => f.pathname.endsWith('.css'))
    .map((f) => {
      const st = document.createElement('style');
      st.setAttribute('data-quelle', relTo(SRC, f));
      st.textContent = lies(f);
      document.head.appendChild(st);
      return st;
    });
});
afterAll(() => cssStyles.forEach((s) => s.remove()));
afterEach(() => {
  cleanup();
  document.documentElement.style.removeProperty('--bz-schrift');
});

function renderApp() {
  const { container } = render(<App />);
  const root = container.firstElementChild as HTMLElement | null;
  expect(root, 'App rendert kein Wurzelelement').not.toBeNull();
  return root!;
}
function nav() {
  return screen.getByRole('navigation', { name: 'Hauptnavigation' });
}
/** Roh-Wert von --bz-schrift, wie er an der App-Wurzel ankommt. */
function schriftWert(root: HTMLElement) {
  return getComputedStyle(root).getPropertyValue('--bz-schrift').trim();
}
/** Berechnete font-family, die var(--bz-schrift) im Kontext der App-Wurzel ergibt. */
function appSchrift(root: HTMLElement) {
  const probe = document.createElement('span');
  probe.style.setProperty('font-family', 'var(--bz-schrift)');
  root.appendChild(probe);
  const wert = getComputedStyle(probe).fontFamily;
  probe.remove();
  return wert;
}
/** Schriftfolge in einzelne Einträge zerlegen (Kommas in Anführungszeichen beachten). */
function eintraege(folge: string) {
  const out: string[] = [];
  let akt = '';
  let quote: string | null = null;
  for (const ch of folge) {
    if (quote) {
      akt += ch;
      if (ch === quote) quote = null;
    } else if (ch === '"' || ch === "'") {
      quote = ch;
      akt += ch;
    } else if (ch === ',') {
      out.push(akt.trim());
      akt = '';
    } else akt += ch;
  }
  out.push(akt.trim());
  return out;
}
/** Alle Elemente, die selbst sichtbaren Text (nicht nur Leerraum) tragen. */
function textElemente(root: HTMLElement) {
  return [root, ...Array.from(root.querySelectorAll<HTMLElement>('*'))].filter((el) =>
    Array.from(el.childNodes).some((n) => n.nodeType === Node.TEXT_NODE && (n.textContent ?? '').trim() !== ''),
  );
}
/** Die vom REQ ausdrücklich genannten Texte: 5 Beschriftungen + Platzhalter. */
function benannteTexte() {
  const els: { text: string; el: HTMLElement }[] = LABELS.map((l) => ({
    text: l,
    el: within(nav()).getByText(l, { exact: true }),
  }));
  els.push({ text: PLACEHOLDER, el: within(screen.getByRole('main')).getByText(PLACEHOLDER) });
  return els;
}

// ===========================================================================
describe('REQ-003 Zentral definierte App-Schrift', () => {
  // ---------------------------------------------------------------- AK-1
  describe('AK-1 Alle Texte in der App-Schrift', () => {
    it('[REQ-003/AK-1] die App-Schrift --bz-schrift steht an der App-Wurzel zur Verfügung', () => {
      const root = renderApp();
      expect(schriftWert(root), '--bz-schrift an der App-Wurzel').not.toBe('');
    });

    it('[REQ-003/AK-1] die fünf Menü-Beschriftungen und der Platzhaltertext sind in der App-Schrift dargestellt', () => {
      const root = renderApp();
      const soll = appSchrift(root);
      expect(soll).not.toBe('');
      for (const { text, el } of benannteTexte()) {
        expect(getComputedStyle(el).fontFamily, `Text "${text}"`).toBe(soll);
      }
    });

    it.each(LABELS)('[REQ-003/AK-1] bei aktivem "%s" sind alle Texte der App in der App-Schrift dargestellt', (label) => {
      const root = renderApp();
      fireEvent.click(within(nav()).getByRole('button', { name: label }));
      const soll = appSchrift(root);
      const texte = textElemente(root);
      // mindestens: 5 Beschriftungen + Platzhalter
      expect(texte.length).toBeGreaterThanOrEqual(LABELS.length + 1);
      const abweichend = texte
        .filter((el) => getComputedStyle(el).fontFamily !== soll)
        .map((el) => `<${el.tagName.toLowerCase()}> "${el.textContent?.trim()}": ${getComputedStyle(el).fontFamily}`);
      expect(abweichend).toEqual([]);
    });

    it('[REQ-003/AK-1] Austauschbarkeit: eine geänderte zentrale Schrift wirkt auf alle Texte, ohne Elemente anzupassen', () => {
      const root = renderApp();
      const test = "'Blaetterzeit Testschrift', serif";
      // Setzt die zentrale Variable neu – egal ob sie an <html> oder an der App-Wurzel definiert ist.
      document.documentElement.style.setProperty('--bz-schrift', test);
      root.style.setProperty('--bz-schrift', test);
      const soll = appSchrift(root);
      expect(soll).toMatch(/Blaetterzeit Testschrift/);
      for (const el of textElemente(root)) {
        expect(getComputedStyle(el).fontFamily, `"${el.textContent?.trim()}"`).toBe(soll);
      }
    });
  });

  // ---------------------------------------------------------------- AK-2
  describe('AK-2 App-Schrift an genau einer Stelle definiert', () => {
    // font-family-Festlegungen in CSS (font-family, font-Kurzform) und in TS/TSX (fontFamily, 'font-family', font:)
    const CSS_DECL = /(?:^|[;{\s])(font-family|font)\s*:\s*([^;}]+)/g;
    const TS_DECL = /(?:\bfontFamily|['"]font-family['"]|\bfont)\s*:\s*([^,}\n]+)/g;
    const nurVerweis = (v: string) =>
      /^['"`]?\s*(var\(\s*--bz-schrift\s*\)|inherit)\s*(!important)?\s*['"`]?$/i.test(v.trim());

    // Eine Schriftfolge erkennt man an einer generischen Familie (sans-serif, serif, …)
    // in einem String-Literal (TS) bzw. in einem font-/font-family-Wert (CSS).
    const GEN_RE = /(?<![\w-])(sans-serif|serif|monospace|cursive|fantasy|system-ui|ui-(?:serif|sans-serif|monospace|rounded))(?![\w-])/i;
    const ohneKommentare = (t: string) => t.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:])\/\/.*$/gm, '$1');
    function enthaeltSchriftfolge(f: URL) {
      const text = ohneKommentare(lies(f));
      if (/\.s?css$/.test(f.pathname)) {
        return Array.from(text.matchAll(CSS_DECL)).some((m) => GEN_RE.test(m[2]));
      }
      const strings = text.match(/"[^"\n]*"|'[^'\n]*'|`[^`]*`/g) ?? [];
      return strings.some((s) => GEN_RE.test(s));
    }
    const quellDateien = () => walk(SRC).filter((f) => /\.(tsx?|css|scss)$/.test(f.pathname));

    it('[REQ-003/AK-2] eine Schriftfolge steht in genau einer Datei unter src/, und zwar zentral in src/theme/', () => {
      const dateien = quellDateien()
        .filter(enthaeltSchriftfolge)
        .map((f) => relTo(SRC, f));
      expect(dateien, 'Dateien, die eine Schriftfolge festlegen').toHaveLength(1);
      expect(dateien[0]).toMatch(/^theme\//);
    });

    it('[REQ-003/AK-2] außerhalb der zentralen Stelle legt kein Code eine eigene Schrift als Literal fest', () => {
      // Bezeichner (z. B. eine aus @/theme importierte Konstante) werden hier nicht
      // aufgelöst; ihren tatsächlichen Wert prüft der Laufzeittest unten.
      const verstoesse: string[] = [];
      for (const f of quellDateien().filter((x) => !relTo(SRC, x).startsWith('theme/'))) {
        const text = ohneKommentare(lies(f));
        const css = /\.s?css$/.test(f.pathname);
        for (const m of text.matchAll(css ? CSS_DECL : TS_DECL)) {
          const wert = m[m.length - 1].trim();
          const istLiteral = css || /^['"`]/.test(wert);
          if (istLiteral && !nurVerweis(wert)) verstoesse.push(`${relTo(SRC, f)}: ${m[0].trim()}`);
        }
      }
      expect(verstoesse).toEqual([]);
    });

    it('[REQ-003/AK-2] kein gerendertes Element setzt per Inline-Style eine eigene Schrift', () => {
      const root = renderApp();
      for (const l of [...LABELS, 'Start']) {
        fireEvent.click(within(nav()).getByRole('button', { name: l }));
        const verstoesse = Array.from(root.querySelectorAll<HTMLElement>('*'))
          .filter((el) => {
            const ff = el.style.getPropertyValue('font-family');
            return ff !== '' && !nurVerweis(ff);
          })
          .map((el) => `<${el.tagName.toLowerCase()}> ${el.style.getPropertyValue('font-family')}`);
        expect(verstoesse, `bei aktivem "${l}"`).toEqual([]);
      }
    });

    it('[REQ-003/AK-2] keine weitere Schriftquelle: kein @font-face, kein Schrift-CDN, keine Schriftdatei unter src/ oder public/', () => {
      // Randbedingung REQ-003 + Absprache: keine Schriftdatei, kein @font-face.
      // Prüft nur versionierte Quellorte; der Test hängt NICHT von lokalen,
      // ignorierten Dateien ab (public/fonts/ wird nur auf Fehlen geprüft).
      const quellen = [...walk(SRC), new URL('index.html', ROOT)].filter((f) => /\.(tsx?|css|scss|html)$/.test(f.pathname));
      const fontFace = quellen.filter((f) => /@font-face/i.test(lies(f))).map((f) => relTo(ROOT, f));
      expect(fontFace, '@font-face gefunden').toEqual([]);
      const cdn = quellen
        .filter((f) => /fonts\.googleapis|fonts\.gstatic|use\.typekit|fonts\.bunny|cdnfonts/i.test(lies(f)))
        .map((f) => relTo(ROOT, f));
      expect(cdn, 'Schrift-CDN gefunden').toEqual([]);
      const dateien = [...walk(SRC), ...walk(PUBLIC)]
        .filter((f) => /\.(ttf|otf|woff2?|eot)$/i.test(f.pathname))
        .map((f) => relTo(ROOT, f));
      expect(dateien, 'Schriftdateien gefunden').toEqual([]);
    });
  });

  // ---------------------------------------------------------------- AK-3
  describe('AK-3 Generische Ersatzschrift am Ende der Definition', () => {
    it('[REQ-003/AK-3] die Schriftfolge in --bz-schrift endet mit einer generischen Ersatzschrift (nicht in Anführungszeichen)', () => {
      const root = renderApp();
      const liste = eintraege(schriftWert(root));
      expect(liste.length).toBeGreaterThanOrEqual(1);
      expect(liste.every((e) => e !== ''), `leere Einträge in "${schriftWert(root)}"`).toBe(true);
      const letzter = liste[liste.length - 1];
      // In Anführungszeichen wäre 'sans-serif' ein Schriftname, keine generische Familie.
      expect(letzter, 'letzter Eintrag darf nicht in Anführungszeichen stehen').not.toMatch(/^['"]/);
      expect(GENERISCH.has(letzter.toLowerCase()), `letzter Eintrag "${letzter}" ist keine generische Familie`).toBe(true);
    });

    it('[REQ-003/AK-3] die tatsächlich berechnete Schrift der Texte endet ebenfalls mit der generischen Ersatzschrift', () => {
      const root = renderApp();
      for (const { text, el } of benannteTexte()) {
        const liste = eintraege(getComputedStyle(el).fontFamily);
        const letzter = liste[liste.length - 1];
        expect(GENERISCH.has(letzter.toLowerCase()), `Text "${text}": letzter Eintrag "${letzter}"`).toBe(true);
      }
      expect(root).toBeInTheDocument();
    });
  });
});
