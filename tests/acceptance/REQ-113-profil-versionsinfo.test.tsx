/**
 * Akzeptanztests REQ-113 – Profil › App: Zeile „Versionsinfo“, nur Anzeige, aus einer einzigen Versionsquelle.
 * Abgeleitet aus dem REQ-Text. Die Zeile wird über ihren Text in der Karte [data-profil-karte] (REQ-066) gefunden.
 * Versionsquelle: Feld „version“ der package.json (gelesen über das Dateisystem, wie REQ-002/003/004).
 */
import '@testing-library/jest-dom/vitest';
import { act, cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import App from '@/App';
import { InMemoryEinstellungRepository, InMemoryProfilRepository } from '@/storage';
import { APP_VERSION, versionAnzeige } from '@/plattform/version';
import ProfilAnsicht from '@/views/ProfilAnsicht';

vi.mock('@/buecher/demodaten', () => ({ demoBuecher: [] }));
beforeEach(() => localStorage.clear());
afterEach(() => {
  cleanup();
  localStorage.clear();
});

type FsLike = { existsSync(p: URL): boolean; readFileSync(p: URL, enc: 'utf8'): string; readdirSync(p: URL, o: { withFileTypes: true }): { name: string; isDirectory(): boolean }[] };
const NODE_FS = 'node:fs';
const NODE_URL = 'node:url';
const NODE_PROCESS = 'node:process';
const fs = (await import(/* @vite-ignore */ NODE_FS)) as FsLike;
const { pathToFileURL } = (await import(/* @vite-ignore */ NODE_URL)) as { pathToFileURL(p: string): URL };
const { cwd } = (await import(/* @vite-ignore */ NODE_PROCESS)) as { cwd(): string };
const ROOT = pathToFileURL(`${cwd()}/`);
const lies = (p: string) => fs.readFileSync(new URL(p, ROOT), 'utf8');
function walk(dir: URL): URL[] {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(new URL(`${e.name}/`, dir)) : [new URL(e.name, dir)]));
}
const PAKET_VERSION = (JSON.parse(lies('package.json')) as { version: string }).version;

const W = { timeout: 3000 };
const norm = (t: string | null | undefined) => (t ?? '').replace(/[\s  ]+/g, ' ').trim();
const nav = () => screen.getByRole('navigation', { name: 'Hauptnavigation' });
async function tippe(el: Element) {
  await act(async () => {
    fireEvent.click(el);
    await new Promise((r) => setTimeout(r, 20));
  });
}
async function profil() {
  render(<App einstellungRepository={new InMemoryEinstellungRepository()} />);
  await tippe(within(nav()).getByRole('button', { name: 'Profil' }));
  return vi.waitFor(() => {
    const k = document.querySelector<HTMLElement>('[data-profil-karte]');
    expect(k, 'Karte „App“').not.toBeNull();
    expect(norm(k!.textContent)).toContain('Versionsinfo');
    return k!;
  }, W);
}
/** Zeile „Versionsinfo“: kleinstes Element der Karte, das mit „Versionsinfo“ beginnt und einen Wert enthält. */
function versionsZeile(karte: HTMLElement): HTMLElement {
  const k = Array.from(karte.querySelectorAll<HTMLElement>('*')).filter((e) => /^Versionsinfo ?\S/.test(norm(e.textContent)));
  const z = k.find((c) => !k.some((o) => o !== c && c.contains(o)));
  expect(z, 'Zeile „Versionsinfo“').toBeDefined();
  return z!;
}
const versionsWert = (karte: HTMLElement) => norm(norm(versionsZeile(karte).textContent).replace(/^Versionsinfo/, ''));
/** Erwartete Anzeige laut REQ: „<Haupt>.<Neben>“, Patch nur wenn > 0. */
const anzeigeLautReq = (v: string) => {
  const [a, b, c] = v.split('.').map(Number);
  return c > 0 ? `${a}.${b}.${c}` : `${a}.${b}`;
};

describe('REQ-113 Profil › App › Versionsinfo', () => {
  describe('AK-1 Zeile „Versionsinfo“ unter „Design“', () => {
    it('[REQ-113/AK-1] Profil: Karte „App“ enthält „Design“ und darunter „Versionsinfo“', async () => {
      const karte = await profil();
      const design = karte.querySelector<HTMLElement>('[data-profil-zeile="design"]')!;
      const zeile = versionsZeile(karte);
      expect(design).not.toBeNull();
      expect(design.compareDocumentPosition(zeile) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
      expect(design.contains(zeile) || zeile.contains(design)).toBe(false);
      // genau diese zwei Zeilen: „Design“ und als letzte „Versionsinfo“
      expect(karte.children).toHaveLength(2);
      expect(karte.lastElementChild!.contains(zeile)).toBe(true);
    });

    it('[REQ-113/AK-1] die Zeile „Versionsinfo“ hat keinen Pfeil „›“', async () => {
      const karte = await profil();
      const zeile = versionsZeile(karte);
      expect(zeile.textContent).not.toContain('›');
      expect(zeile.querySelector('[data-zeile-pfeil]')).toBeNull();
    });

    // Trennlinien stehen nur zwischen Zeilen (Muster der Karte „Ausgabe“); verglichen wird daher ohne Rahmenangaben.
    it('[REQ-113/AK-1] gestaltet wie die übrigen Zeilen: gleicher Zeilenstil wie „Design“ (ohne Zeiger und Trennlinie)', async () => {
      const karte = await profil();
      const design = karte.querySelector<HTMLElement>('[data-profil-zeile="design"]')!;
      let zeile: HTMLElement = versionsZeile(karte);
      // Zeilen-Element auf derselben Ebene wie „Design“ suchen.
      while (zeile.parentElement && zeile.parentElement !== design.parentElement) zeile = zeile.parentElement;
      expect(zeile.parentElement).toBe(design.parentElement);
      const ohneZeiger = (e: HTMLElement) => {
        const c = e.cloneNode() as HTMLElement;
        c.style.cursor = '';
        c.style.border = '';
        return c.style.cssText;
      };
      expect(ohneZeiger(zeile)).toBe(ohneZeiger(design));
      expect(zeile.querySelector('[data-zeile-bezeichnung]')?.getAttribute('style')).toBe(design.querySelector('[data-zeile-bezeichnung]')?.getAttribute('style'));
    });
  });

  describe('AK-2 Aktuelle Version 0.13.1', () => {
    it('[REQ-113/AK-2] die Versionsquelle enthält 0.13.1', () => {
      expect(PAKET_VERSION).toBe('0.13.1');
    });

    it('[REQ-113/AK-2] die Zeile „Versionsinfo“ zeigt rechts genau „0.13.1“', async () => {
      const karte = await profil();
      expect(versionsWert(karte)).toBe('0.13.1');
    });
  });

  describe('AK-3 Anzeigeformat', () => {
    // Schnittstelle laut Entwickler: ProfilAnsicht nimmt zum Testen die Prop `appVersion` (sonst APP_VERSION aus package.json).
    async function profilMit(version: string) {
      render(<ProfilAnsicht profilRepository={new InMemoryProfilRepository()} appVersion={version} />);
      return vi.waitFor(() => {
        const k = document.querySelector<HTMLElement>('[data-profil-karte]');
        expect(k).not.toBeNull();
        return k!;
      }, W);
    }
    it.each([
      ['0.12.0', '0.12'],
      ['0.11.2', '0.11.2'],
      ['1.0.0', '1.0'],
      ['0.11.0', '0.11'],
      ['2.10.0', '2.10'],
      ['10.0.12', '10.0.12'],
    ])('[REQ-113/AK-3] Versionsquelle %s → Zeile zeigt „%s“', async (version, anzeige) => {
      const karte = await profilMit(version);
      expect(versionsWert(karte)).toBe(anzeige);
      expect(versionAnzeige(version)).toBe(anzeige);
    });

    it('[REQ-113/AK-3] APP_VERSION ist genau das Feld „version“ der package.json', () => {
      expect(APP_VERSION).toBe(PAKET_VERSION);
    });

    it('[REQ-113/AK-3] Anzeige folgt der Regel aus der aktuellen Versionsquelle (Patch 0 entfällt)', async () => {
      const karte = await profil();
      expect(versionsWert(karte)).toBe(anzeigeLautReq(PAKET_VERSION));
    });
  });

  describe('AK-4 Nur Anzeige', () => {
    it('[REQ-113/AK-4] Antippen öffnet kein Blatt, kein Fenster, kein Eingabefeld; nichts ändert sich', async () => {
      const karte = await profil();
      const main = screen.getByRole('main');
      const vorher = { html: main.innerHTML, dialoge: screen.queryAllByRole('dialog').length, felder: document.querySelectorAll('input, textarea, select').length, ls: JSON.stringify({ ...localStorage }) };
      await tippe(versionsZeile(karte));
      await tippe(versionsZeile(karte).parentElement!);
      expect(screen.queryAllByRole('dialog')).toHaveLength(vorher.dialoge);
      expect(document.querySelectorAll('input, textarea, select')).toHaveLength(vorher.felder);
      expect(main.innerHTML).toBe(vorher.html);
      expect(JSON.stringify({ ...localStorage })).toBe(vorher.ls);
    });

    it('[REQ-113/AK-4] die Zeile ist kein Bedienelement (kein Button/Link, nicht fokussierbar)', async () => {
      const karte = await profil();
      const zeile = versionsZeile(karte);
      for (let n: HTMLElement | null = zeile; n && n !== karte; n = n.parentElement) {
        expect(n.tagName).not.toMatch(/^(BUTTON|A|INPUT)$/);
        expect(n.getAttribute('role')).not.toBe('button');
        expect(n.getAttribute('contenteditable')).not.toBe('true');
      }
      expect(within(zeile).queryAllByRole('button')).toHaveLength(0);
      expect(within(zeile).queryAllByRole('textbox')).toHaveLength(0);
    });
  });

  describe('AK-5 Eine einzige Quelle', () => {
    it('[REQ-113/AK-5] versionName der Android-Konfiguration wird aus package.json abgeleitet, nicht fest eingetragen', () => {
      const gradle = lies('android/app/build.gradle').replace(/\/\/.*$/gm, '');
      const zeile = gradle.split('\n').find((z) => /\bversionName\b/.test(z));
      expect(zeile, 'versionName in android/app/build.gradle').toBeDefined();
      expect(gradle).toMatch(/package\.json/);
      expect(zeile).not.toMatch(/["']\d+\.\d+(\.\d+)?([-\w]*)?["']/);
    });

    it('[REQ-113/AK-5] der Build (vite.config.ts) leitet die Version aus package.json ab, nicht aus einem festen Wert', () => {
      const cfg = lies('vite.config.ts').replace(/\/\/.*$/gm, '');
      expect(cfg).toMatch(/__APP_VERSION__/);
      expect(cfg).toMatch(/package\.json/);
      expect(cfg).not.toMatch(/__APP_VERSION__\s*:\s*JSON\.stringify\(\s*['"]\d/);
    });

    it('[REQ-113/AK-5] die angezeigte Version ist im App-Quellcode nicht fest eingetragen', () => {
      const v = PAKET_VERSION.replace(/\./g, '\\.');
      const kurz = anzeigeLautReq(PAKET_VERSION).replace(/\./g, '\\.');
      const re = new RegExp(`['"\`](${v}|${kurz})['"\`]`);
      const funde = walk(new URL('src/', ROOT))
        .filter((u) => /\.(ts|tsx|js|jsx)$/.test(u.pathname))
        .filter((u) => re.test(fs.readFileSync(u, 'utf8')))
        .map((u) => u.pathname);
      expect(funde).toEqual([]);
    });
  });
});
