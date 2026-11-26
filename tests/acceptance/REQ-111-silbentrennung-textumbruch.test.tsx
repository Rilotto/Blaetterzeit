/**
 * Akzeptanztests REQ-111 – App-weit deutsche Silbentrennung und Textumbruch, kein Text über seine Box hinaus,
 * mit automatischer Prüfung.
 *
 * Abgeleitet aus dem REQ-Text. Statische Prüfung des Quellcodes (index.html, src/**) plus Darstellungsregeln der
 * gerenderten Kennzahlen-Boxen. jsdom berechnet kein Layout: Das Überlaufen selbst (AK-4 bei 320 px, AK-5 „Haupt-“ /
 * „figuren“) bleibt laut REQ Sichtprüfung des CEO; hier wird geprüft, dass keine Regel Umbruch/Trennung verhindert.
 */
import '@testing-library/jest-dom/vitest';
import { act, cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import type { CSSProperties } from 'react';
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import type { Buch } from '@/domain/buch';
import type { ImageStore } from '@/storage';
import { InMemoryEinstellungRepository } from '@/storage';
import { InMemoryBookRepository } from '@/storage/InMemoryBookRepository';
import { InMemoryImageStore } from '@/storage/InMemoryImageStore';
import { farbVariablen } from '@/theme';
import BuchDetails from '@/views/BuchDetails';
import StatistikAnsicht from '@/views/StatistikAnsicht';

vi.mock('@/buecher/demodaten', () => ({ demoBuecher: [] }));
afterEach(() => cleanup());

// ---------------------------------------------------------------------------
// Dateisystem-Zugriff (gleiches Muster wie REQ-002/003/004: dynamisch, minimal typisiert)
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
    const u = new URL(e.isDirectory() ? `${e.name}/` : e.name, dir);
    if (e.isDirectory()) out.push(...walk(u));
    else out.push(u);
  }
  return out;
}
const quellDateien = () => walk(SRC).filter((u) => /\.(css|ts|tsx|js|jsx|html)$/.test(u.pathname));
const rel = (u: URL) => u.pathname.slice(ROOT.pathname.length);
/** Kommentare entfernen, damit erklärende Texte („verboten: word-break: break-all“) nicht zählen. */
const ohneKommentare = (t: string) => t.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:'"`])\/\/.*$/gm, '$1');

// ---------------------------------------------------------------------------
// Prüfregeln (AK-3): verbotene Umbruchregeln in CSS und in Komponenten-Stilen (gleichwertige Schreibweisen)
// ---------------------------------------------------------------------------
const VERBOTEN: [string, RegExp][] = [
  ['word-break: break-all', /word-break\s*:\s*break-all/i],
  ['word-break: break-word', /word-break\s*:\s*break-word/i],
  ['overflow-wrap: anywhere', /overflow-wrap\s*:\s*anywhere/i],
  ['word-wrap: anywhere', /word-wrap\s*:\s*anywhere/i],
  ['wordBreak: break-all', /\bwordBreak\s*:\s*['"`]break-all['"`]/],
  ['wordBreak: break-word', /\bwordBreak\s*:\s*['"`]break-word['"`]/],
  ['overflowWrap: anywhere', /\b(overflowWrap|wordWrap)\s*:\s*['"`]anywhere['"`]/],
  ["'word-break': 'break-all'", /['"]word-break['"]\s*:\s*['"`]break-(all|word)['"`]/],
  ["'overflow-wrap': 'anywhere'", /['"](overflow-wrap|word-wrap)['"]\s*:\s*['"`]anywhere['"`]/],
  ["setProperty('word-break', …)", /setProperty\(\s*['"]word-break['"]\s*,\s*['"`]break-(all|word)['"`]/],
  ["setProperty('overflow-wrap', 'anywhere')", /setProperty\(\s*['"](overflow-wrap|word-wrap)['"]\s*,\s*['"`]anywhere['"`]/],
];
/** Regeln, die die Silbentrennung ausschalten (AK-2). */
const TRENNUNG_AUS: [string, RegExp][] = [
  ['hyphens: none/manual', /(^|[^-\w])(-webkit-)?hyphens\s*:\s*(none|manual)/i],
  ['hyphens: none/manual (Komponente)', /\b(hyphens|WebkitHyphens|MozHyphens|msHyphens)\s*:\s*['"`](none|manual)['"`]/],
  ["setProperty('hyphens', …)", /setProperty\(\s*['"](-webkit-)?hyphens['"]\s*,\s*['"`](none|manual)['"`]/],
];
function funde(text: string, regeln: [string, RegExp][]): string[] {
  const t = ohneKommentare(text);
  return regeln.filter(([, r]) => r.test(t)).map(([n]) => n);
}
function fundeImQuellcode(regeln: [string, RegExp][]): string[] {
  const out: string[] = [];
  for (const f of quellDateien()) for (const n of funde(fs.readFileSync(f, 'utf8'), regeln)) out.push(`${rel(f)}: ${n}`);
  return out;
}

/** CSS-Regelblöcke (einfacher Parser, genügt für flache Stylesheets und @media-Blöcke). */
function cssBloecke(css: string): { selektoren: string[]; deklarationen: string }[] {
  const t = ohneKommentare(css);
  const out: { selektoren: string[]; deklarationen: string }[] = [];
  const re = /([^{}]+)\{([^{}]*)\}/g;
  for (let m = re.exec(t); m; m = re.exec(t)) out.push({ selektoren: m[1].split(',').map((s) => s.trim()).filter(Boolean), deklarationen: m[2] });
  return out;
}
const cssDateien = () => quellDateien().filter((u) => /\.css$/.test(u.pathname));

// CSS-Dateien aus src/ einhängen, damit berechnete Stile die globalen Regeln enthalten.
const styleEls: HTMLStyleElement[] = [];
beforeAll(() => {
  for (const f of cssDateien()) {
    const s = document.createElement('style');
    s.textContent = fs.readFileSync(f, 'utf8');
    document.head.appendChild(s);
    styleEls.push(s);
  }
});
afterAll(() => styleEls.forEach((s) => s.remove()));

// ---------------------------------------------------------------------------
// Darstellungsregeln gerenderter Elemente (AK-4, AK-5)
// ---------------------------------------------------------------------------
const norm = (t: string | null | undefined) => (t ?? '').replace(/[\s  ]+/g, ' ').trim();
const W = { timeout: 4000 };
const bilder = { get: async () => undefined, put: async () => {}, remove: async () => {} } as unknown as ImageStore;
async function tippe(el: Element | null) {
  expect(el).not.toBeNull();
  await act(async () => {
    fireEvent.click(el!);
    await new Promise((r) => setTimeout(r, 20));
  });
}
function wert(el: HTMLElement, css: string, js: string): string {
  const inline = (el.style.getPropertyValue(css) || ((el.style as unknown as Record<string, string>)[js] ?? '')).trim();
  const berechnet = (getComputedStyle(el).getPropertyValue(css) || '').trim();
  return `${inline}|${berechnet}`;
}
/** Verstöße einer Beschriftung und ihrer Vorfahren bis einschließlich `box`. */
function verstoesse(el: HTMLElement, box: HTMLElement): string[] {
  const out: string[] = [];
  for (let n: HTMLElement | null = el; n; n = n.parentElement) {
    const name = `${n.tagName.toLowerCase()}${n === el ? ' (Beschriftung)' : ''}`;
    const ws = wert(n, 'white-space', 'whiteSpace');
    if (/(^|\|)(nowrap|pre)(\||$)/.test(ws)) out.push(`${name}: white-space ${ws}`);
    const to = wert(n, 'text-overflow', 'textOverflow');
    if (/ellipsis/.test(to)) out.push(`${name}: text-overflow ${to}`);
    const lc = wert(n, '-webkit-line-clamp', 'WebkitLineClamp');
    if (/\d/.test(lc)) out.push(`${name}: line-clamp ${lc}`);
    const hy = wert(n, 'hyphens', 'hyphens');
    if (/none|manual/.test(hy)) out.push(`${name}: hyphens ${hy}`);
    const wb = wert(n, 'word-break', 'wordBreak');
    if (/break-all|break-word/.test(wb)) out.push(`${name}: word-break ${wb}`);
    const ow = wert(n, 'overflow-wrap', 'overflowWrap');
    if (/anywhere/.test(ow)) out.push(`${name}: overflow-wrap ${ow}`);
    const lang = n.getAttribute('lang');
    if (lang !== null && !/^de(-|$)/i.test(lang)) out.push(`${name}: lang="${lang}"`);
    if (n === box) break;
  }
  return out;
}
/** Sichtbare Blatt-Textelemente mit Buchstaben (Beschriftungen, keine reinen Zahlen). */
function beschriftungen(box: HTMLElement): HTMLElement[] {
  return [box, ...Array.from(box.querySelectorAll<HTMLElement>('*'))].filter(
    (e) => Array.from(e.childNodes).some((c) => c.nodeType === Node.TEXT_NODE && /\p{L}{2,}/u.test(c.textContent ?? '')) && e.getAttribute('aria-hidden') !== 'true',
  );
}

let nr = 0;
const um = (j: number, m: number, t: number, h = 12) => new Date(j, m - 1, t, h);
const HEUTE = um(2026, 11, 25, 15);
const sitzung = (d: Date, seite = 10) => ({ zeitpunkt: d.toISOString(), seite });
const buch = (f: Partial<Buch> = {}): Buch => ({ id: `b111-${++nr}`, titel: 'Testbuch', status: 'am_lesen', seitenanzahl: 400, aktuelleSeite: 100, ...f });

async function buchdetails(b: Buch) {
  const repo = new InMemoryBookRepository();
  await repo.save(b);
  render(
    <div style={farbVariablen() as CSSProperties}>
      <BuchDetails buchId={b.id} repository={repo} bildspeicher={bilder} bildquelle={{ scannen: async () => null, galerie: async () => null }} onZurueck={() => {}} jetzt={() => HEUTE} />
    </div>,
  );
  return screen.findByRole('region', { name: 'Buchdetails' }, W);
}

// ===========================================================================
describe('REQ-111 Silbentrennung und Textumbruch', () => {
  describe('AK-1 Dokumentsprache Deutsch', () => {
    it('[REQ-111/AK-1] index.html (Startseite für Web-Build und APK) zeichnet das Dokument mit lang="de" aus', () => {
      const html = fs.readFileSync(new URL('index.html', ROOT), 'utf8');
      const m = /<html\b[^>]*>/i.exec(html);
      expect(m, '<html>-Element').not.toBeNull();
      expect(/\blang\s*=\s*["']?de["'\s>]/i.test(m![0]), m![0]).toBe(true);
    });

    it('[REQ-111/AK-1] Negativfall: kein Element im Quellcode setzt eine andere Sprache (lang="en" o. ä.)', () => {
      const fremd: string[] = [];
      for (const f of [...quellDateien(), new URL('index.html', ROOT)]) {
        const t = ohneKommentare(fs.readFileSync(f, 'utf8'));
        for (const m of t.matchAll(/\blang\s*=\s*\{?\s*["'`]([a-zA-Z-]+)["'`]/g)) if (!/^de(-|$)/i.test(m[1])) fremd.push(`${rel(f)}: lang="${m[1]}"`);
      }
      expect(fremd).toEqual([]);
    });
  });

  describe('AK-2 Globale Trennregel', () => {
    it('[REQ-111/AK-2] eine zentrale Stildefinition schaltet für das gesamte Dokument (html/:root/body) hyphens: auto ein', () => {
      const global = cssDateien().flatMap((f) =>
        cssBloecke(fs.readFileSync(f, 'utf8'))
          .filter((b) => b.selektoren.some((s) => /^(html|:root|body|\*)$/.test(s)) && /(^|[;\s])hyphens\s*:\s*auto\b/i.test(b.deklarationen))
          .map((b) => `${rel(f)}: ${b.selektoren.join(', ')}`),
      );
      expect(global.length, 'globale Regel „hyphens: auto“').toBeGreaterThan(0);
    });

    it('[REQ-111/AK-2] berechneter Stil: body und ein beliebiges Textelement erben hyphens: auto', () => {
      const p = document.createElement('p');
      p.textContent = 'Hauptfiguren';
      document.body.appendChild(p);
      const b = getComputedStyle(document.body).getPropertyValue('hyphens');
      const t = getComputedStyle(p).getPropertyValue('hyphens');
      p.remove();
      // jsdom kennt „hyphens“ evtl. nicht; dann muss die Regel zumindest im Stylesheet stehen (vorheriger Test).
      if (b !== '') expect(b).toBe('auto');
      if (t !== '') expect(t).toBe('auto');
    });

    it('[REQ-111/AK-2] keine Stilregel der App schaltet die Silbentrennung wieder aus (hyphens: none/manual, auch in Komponenten-Stilen)', () => {
      expect(fundeImQuellcode(TRENNUNG_AUS)).toEqual([]);
    });

    it.each([
      ['p { hyphens: none; }'],
      ['.x{-webkit-hyphens:manual}'],
      ["const s = { hyphens: 'none' };"],
      ["const s = { WebkitHyphens: 'manual' };"],
    ])('[REQ-111/AK-2] Selbsttest der Prüfung: „%s“ wird als Ausschalten erkannt', (code) => {
      expect(funde(code, TRENNUNG_AUS).length).toBeGreaterThan(0);
    });

    it('[REQ-111/AK-2] Selbsttest: hyphens: auto wird nicht als Ausschalten gewertet', () => {
      expect(funde("html { hyphens: auto; } const s = { hyphens: 'auto' };", TRENNUNG_AUS)).toEqual([]);
    });
  });

  describe('AK-3 Keine verbotenen Umbruchregeln', () => {
    it('[REQ-111/AK-3] im gesamten Quellcode (Stylesheets und Komponenten-Stile) kommt keine verbotene Umbruchregel vor', () => {
      expect(quellDateien().length).toBeGreaterThan(10);
      expect(fundeImQuellcode(VERBOTEN)).toEqual([]);
    });

    it.each([
      ['.a { word-break: break-all; }'],
      ['.a{word-break:break-word}'],
      ['.a { overflow-wrap: anywhere }'],
      ["const s: CSSProperties = { wordBreak: 'break-all' };"],
      ['const s = { wordBreak: "break-word" };'],
      ["const s = { overflowWrap: 'anywhere' };"],
      ["el.style.setProperty('word-break', 'break-all');"],
      ["const s = { 'overflow-wrap': 'anywhere' };"],
    ])('[REQ-111/AK-3] Selbsttest: baut ein Entwickler „%s“ ein, schlägt die Prüfung fehl', (code) => {
      expect(funde(code, VERBOTEN).length).toBeGreaterThan(0);
    });

    it.each([["const s = { overflowWrap: 'break-word' };"], ['.a { word-break: normal; overflow-wrap: break-word; }'], ['/* word-break: break-all ist verboten */']])(
      '[REQ-111/AK-3] Selbsttest Gegenfall: erlaubte Regel bzw. Kommentar „%s“ ist kein Fund',
      (code) => {
        expect(funde(code, VERBOTEN)).toEqual([]);
      },
    );
  });

  describe('AK-4 Kennzahlen-Boxen brechen um statt überzulaufen', () => {
    it('[REQ-111/AK-4] Buchdetails, Statistik-Pille: Beschriftungen (u. a. „Längste Serie“) dürfen umbrechen, kein Abschneiden, globale Trennregel', async () => {
      const gestern = new Date(HEUTE.getTime() - 86_400_000);
      const d = await buchdetails(buch({ sitzungen: [sitzung(gestern, 50), sitzung(HEUTE, 100)] }));
      const box = await vi.waitFor(() => {
        const e = d.querySelector<HTMLElement>('[data-statistik]');
        expect(e, 'Statistik-Pille').not.toBeNull();
        return e!;
      }, W);
      const texte = beschriftungen(box);
      expect(texte.length).toBeGreaterThan(0);
      expect(texte.some((e) => norm(e.textContent) === 'Längste Serie'), 'Beschriftung „Längste Serie“ (REQ-109)').toBe(true);
      for (const t of texte) expect(verstoesse(t, box), norm(t.textContent)).toEqual([]);
    });

    it('[REQ-111/AK-4] Seite „Statistik“, Kacheln: Beschriftungen dürfen umbrechen, kein Abschneiden, globale Trennregel', async () => {
      const repo = new InMemoryEinstellungRepository();
      await repo.speichern('statistikZeitraum', 'woche');
      render(
        <StatistikAnsicht
          buecher={[buch({ status: 'gelesen', beendetAm: '2026-11-24', sitzungen: [sitzung(um(2026, 11, 24), 120)] })]}
          einstellungRepository={repo}
          bildspeicher={new InMemoryImageStore()}
          jetzt={() => HEUTE}
        />,
      );
      const karte = await vi.waitFor(() => {
        const e = document.querySelector<HTMLElement>('[data-statistik-karte]');
        expect(e, 'Kennzahlen-Karte').not.toBeNull();
        return e!;
      }, W);
      const kacheln = Array.from(karte.querySelectorAll<HTMLElement>('[data-kachel]'));
      expect(kacheln.length).toBeGreaterThan(0);
      for (const k of kacheln) {
        const texte = beschriftungen(k);
        expect(texte.length, `Kachel ${k.getAttribute('data-kachel')}`).toBeGreaterThan(0);
        for (const t of texte) expect(verstoesse(t, k), norm(t.textContent)).toEqual([]);
      }
    });

    it('[REQ-111/AK-4] Startseite, Kacheln (Woche/Strähne mit Flamme, Jahresziel): Beschriftungen dürfen umbrechen, kein Abschneiden', async () => {
      vi.resetModules();
      const App = (await import('@/App')).default;
      render(<App />);
      await screen.findByRole('navigation', { name: 'Hauptnavigation' }, W);
      const start = within(screen.getByRole('navigation', { name: 'Hauptnavigation' })).queryByRole('button', { name: /^Start/ });
      if (start) await tippe(start);
      const boxen = await vi.waitFor(() => {
        const b = Array.from(document.querySelectorAll<HTMLElement>('[data-start-woche], [data-start-straehne], [data-start-jahresziel]'));
        expect(b.length, 'Kacheln der Startseite').toBeGreaterThan(0);
        return b;
      }, W);
      let gesamt = 0;
      for (const b of boxen) {
        const texte = beschriftungen(b);
        gesamt += texte.length;
        for (const t of texte) expect(verstoesse(t, b), norm(t.textContent)).toEqual([]);
      }
      expect(gesamt).toBeGreaterThan(0);
    });

    it('[REQ-111/AK-4] Selbsttest: eine Beschriftung mit white-space: nowrap bzw. text-overflow: ellipsis wird als Verstoß erkannt', () => {
      const box = document.createElement('div');
      const a = document.createElement('span');
      a.textContent = 'Längste Serie';
      a.style.whiteSpace = 'nowrap';
      const b = document.createElement('span');
      b.textContent = 'gelesen';
      b.style.textOverflow = 'ellipsis';
      box.append(a, b);
      document.body.appendChild(box);
      expect(verstoesse(a, box).length).toBeGreaterThan(0);
      expect(verstoesse(b, box).length).toBeGreaterThan(0);
      box.remove();
    });
  });

  describe('AK-5 Beispiel „Hauptfiguren“', () => {
    it('[REQ-111/AK-5] Reiter „Rezension“: der Name „Hauptfiguren“ unterliegt der globalen Trennregel und keiner verbotenen Umbruchregel', async () => {
      const d = await buchdetails(buch({ status: 'ungelesen' }));
      const name = await vi.waitFor(() => {
        const e = Array.from(d.querySelectorAll<HTMLElement>('[data-kriterium-name]')).find((x) => norm(x.textContent) === 'Hauptfiguren');
        expect(e, 'Kriterium „Hauptfiguren“').toBeDefined();
        return e!;
      }, W);
      expect(verstoesse(name, d)).toEqual([]);
      // Text bleibt ein Wort: keine weichen Umbruchstellen (<wbr>, ­) an falscher Stelle wie „Hauptfigur|en“.
      expect(name.querySelectorAll('wbr')).toHaveLength(0);
      expect(name.textContent).not.toMatch(/Hauptfigur[­​]en/);
    });
  });
});
