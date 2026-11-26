import { describe, expect, it } from 'vitest';

// Automatische Prüfung REQ-111: Dokumentsprache „de“, globale Trennregel, keine verbotenen Umbruchregeln.
// Dateien über node:fs lesen (Vitest liefert CSS mit „?raw“ leer); Modulname als Variable wie in tests/contract/nodeSqlite.ts.
interface Fs {
  readFileSync(p: URL, enc: 'utf8'): string;
}
const [FS, URL_MODUL, PROZESS] = ['node:fs', 'node:url', 'node:process'];
const fs = (await import(/* @vite-ignore */ FS)) as Fs;
const { pathToFileURL } = (await import(/* @vite-ignore */ URL_MODUL)) as { pathToFileURL(p: string): URL };
const { cwd } = (await import(/* @vite-ignore */ PROZESS)) as { cwd(): string };
const wurzel = pathToFileURL(`${cwd()}/`);
const pfade = Object.keys(import.meta.glob(['/src/**/*.{ts,tsx,css}', '/index.html']));
/** Kommentare entfernen, damit erklärende Texte nicht zählen. */
const ohneKommentare = (t: string) => t.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:'"`])\/\/.*$/gm, '$1');
const quellen: Record<string, string> = Object.fromEntries(pfade.map((p) => [p, ohneKommentare(fs.readFileSync(new URL(`.${p}`, wurzel), 'utf8'))]));
const lies = (pfad: string) => quellen[`/${pfad}`];

/** Verbotene Umbruchregeln in CSS- und Komponenten-Schreibweise. */
const VERBOTEN: RegExp[] = [
  /word-break\s*:\s*break-(all|word)/i,
  /overflow-wrap\s*:\s*anywhere/i,
  /wordBreak\s*:\s*['"`]break-(all|word)['"`]/,
  /overflowWrap\s*:\s*['"`]anywhere['"`]/,
  /hyphens\s*:\s*['"`]?(none|manual)/i,
  /(Webkit)?Hyphens\s*:\s*['"`](none|manual)['"`]/,
];

describe('Silbentrennung und Textumbruch app-weit (REQ-111)', () => {
  it('Dokumentsprache Deutsch', () => {
    expect(lies('index.html')).toMatch(/<html[^>]*\blang="de"/);
  });

  it('globale Trennregel hyphens: auto für html und body', () => {
    const css = lies('src/index.css');
    const regel = /html,\s*body\s*\{[^}]*\bhyphens\s*:\s*auto/;
    expect(css).toMatch(regel);
  });

  it('keine verbotenen Umbruchregeln und kein Ausschalten der Trennung in src/', () => {
    const dateien = Object.keys(quellen).filter((d) => d.startsWith('/src/'));
    expect(dateien.length).toBeGreaterThan(50);
    const funde = dateien.flatMap((d) => VERBOTEN.filter((r) => r.test(quellen[d])).map((r) => `${d}: ${r}`));
    expect(funde).toEqual([]);
  });

  it('die Prüfung erkennt eingebaute Verstöße', () => {
    for (const falsch of ["overflowWrap: 'anywhere'", 'word-break: break-all;', "wordBreak: 'break-word'", "hyphens: 'none'"]) {
      expect(VERBOTEN.some((r) => r.test(falsch)), falsch).toBe(true);
    }
    expect(VERBOTEN.some((r) => r.test("overflowWrap: 'break-word'"))).toBe(false);
  });
});
