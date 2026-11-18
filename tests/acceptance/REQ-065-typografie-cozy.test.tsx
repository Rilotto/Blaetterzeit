/**
 * Akzeptanztests REQ-065 – Typografie und Proportionen (Fraunces, Schriftgrößenstufen, Abstandsraster, Cozy-Details).
 * Abgeleitet aus dem REQ-Text. Zahlenwerte sind Standardwerte auf Zuruf (kein AK): geprüft wird, dass Elemente ihre
 * Werte aus den zentralen Variablen beziehen, nicht welche Pixelzahl dahintersteht.
 * Schnittstellen laut Entwickler (Sprint 06 Teil C): Tokens in src/theme/typografie.ts (`typografieVariablen`,
 * `schriftstufen`): --bz-schriftgroesse-<stufe>, --bz-abstand-xs…xl, --bz-rand, --bz-pillenhoehe, --bz-tippflaeche,
 * --bz-zeilenabstand, --bz-nav-icon; Schriften in src/theme/schrift.ts (`schriften`), App-Schrift --bz-schrift.
 * jsdom löst var() in Größenangaben nicht auf; daher Prüfung auf die Variable (Rolle) statt auf den Wert.
 */
import '@testing-library/jest-dom/vitest';
import { act, cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import type { CSSProperties } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import App from '@/App';
import type { Buch } from '@/domain/buch';
import { InMemoryEinstellungRepository, type ImageStore } from '@/storage';
import { InMemoryBookRepository } from '@/storage/InMemoryBookRepository';
import { farbVariablen, schriften, schriftstufen, typografieVariablen } from '@/theme';
import BuchDetails from '@/views/BuchDetails';
import BuecherAnsicht from '@/views/BuecherAnsicht';

vi.mock('@/buecher/demodaten', () => ({ demoBuecher: [] }));
beforeEach(() => localStorage.clear());
afterEach(async () => {
  cleanup();
  localStorage.clear();
  await new Promise((r) => setTimeout(r, 30));
});

// ----------------------------------------------------------------------------- Dateisystem
type DirEntry = { name: string; isDirectory(): boolean };
type FsLike = { existsSync(p: URL): boolean; readFileSync(p: URL, enc: 'utf8'): string; readdirSync(p: URL, o: { withFileTypes: true }): DirEntry[] };
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
const rel = (u: URL) => decodeURIComponent(u.pathname.slice(ROOT.pathname.length));
const ohneKommentare = (t: string) => t.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:])\/\/.*$/gm, '$1');

// ----------------------------------------------------------------------------- Ansichten
const W = { timeout: 3000 };
const STUFEN = ['label', 'meta', 'text', 'titel', 'abschnitt', 'seite'] as const;
const STUFE_RE = /^var\(--bz-schriftgroesse-(label|meta|text|titel|abschnitt|seite)\)$/;
const bilder = { get: async () => undefined, put: async () => {}, remove: async () => {} } as unknown as ImageStore;
const quelle = { scannen: async () => null, galerie: async () => null };
const buch = (f: Partial<Buch> = {}): Buch => ({ id: crypto.randomUUID(), titel: 'Die unendliche Geschichte', autor: 'Michael Ende', status: 'ungelesen', ...f });
async function tippe(el: Element) {
  await act(async () => {
    fireEvent.click(el);
    await new Promise((r) => setTimeout(r, 10));
  });
}
const nav = () => screen.getByRole('navigation', { name: 'Hauptnavigation' });
const wurzel = () => document.querySelector<HTMLElement>('[data-app-wurzel]')!;
const alle = () => Array.from(document.body.querySelectorAll<HTMLElement>('*'));

/** Seite „Bücher“ mit einem Buch, Plus-Menü und Blatt „Manueller Eintrag“. */
async function ansichtBuecher() {
  const repo = new InMemoryBookRepository();
  await repo.save(buch());
  render(
    <div style={farbVariablen() as CSSProperties}>
      <BuecherAnsicht repository={repo} bildquelle={quelle} bildspeicher={bilder} />
    </div>,
  );
  await screen.findByRole('heading', { name: 'Deine Bücher' }, W);
}
async function blattManuell() {
  await tippe(screen.getByRole('button', { name: 'Buch hinzufügen' }));
  const m = await screen.findByRole('menu', { name: 'Buch hinzufügen' }, W);
  await tippe(within(m).getByRole('menuitem', { name: /Von Hand eintragen/ }));
  return screen.findByRole('dialog', { name: 'Manueller Eintrag' }, W);
}
/** Buchdetails eines Buchs mit Autor und Bewertung (Reiter „Rezension“ mit Stufentext). */
async function ansichtDetails() {
  const b = buch({ bewertungen: { sterne: 3 } } as Partial<Buch>);
  const repo = new InMemoryBookRepository();
  await repo.save(b);
  render(<BuchDetails buchId={b.id} repository={repo} bildspeicher={bilder} bildquelle={quelle} onZurueck={() => {}} />);
  const d = await screen.findByRole('region', { name: 'Buchdetails' }, W);
  await vi.waitFor(() => expect(d.querySelector('[data-stufentext]')).not.toBeNull(), W);
  return d;
}
async function reiterDetails(d: HTMLElement) {
  await tippe(d.querySelector('[data-reiter="details"]')!);
  await vi.waitFor(() => expect(d.querySelector('[data-ausgabe-karte]')).not.toBeNull(), W);
}
/** App mit Profil und geöffnetem Fenster „Design“. */
async function ansichtProfil() {
  render(<App einstellungRepository={new InMemoryEinstellungRepository()} />);
  await tippe(within(nav()).getByRole('button', { name: 'Profil' }));
  const z = await vi.waitFor(() => {
    const e = document.querySelector<HTMLElement>('[data-profil-zeile="design"]');
    expect(e).not.toBeNull();
    return e!;
  }, W);
  await tippe(z);
  return screen.findByRole('dialog', { name: 'Design' }, W);
}
/** Geht alle Ansichten durch und ruft je Ansicht `pruefe(name)` auf. */
async function fuerJedeAnsicht(pruefe: (name: string) => void) {
  await ansichtBuecher();
  pruefe('Bücher');
  await blattManuell();
  pruefe('Bücher + Manueller Eintrag');
  cleanup();
  const d = await ansichtDetails();
  pruefe('Buchdetails/Rezension');
  await reiterDetails(d);
  pruefe('Buchdetails/Details');
  cleanup();
  const f = await ansichtProfil();
  pruefe('Profil + Design/Farben');
  await tippe(f.querySelector('[data-design-reiter="schriftart"]')!);
  pruefe('Profil + Design/Schriftart');
}

/** Wirksame Schriftgrößen-Angabe: nächste Inline-Angabe am Element oder Vorfahren. */
function groessenAngabe(el: HTMLElement): string {
  for (let n: HTMLElement | null = el; n; n = n.parentElement) if (n.style.fontSize && n.style.fontSize !== 'inherit') return n.style.fontSize;
  return '';
}
const px = (v: string) => parseFloat(v);
const vars = () => typografieVariablen();

// ----------------------------------------------------------------------------- Tests
describe('REQ-065 Typografie und Proportionen', () => {
  describe('AK-1 App-Schrift Fraunces, lokal ausgeliefert', () => {
    it('[REQ-065/AK-1] ohne Nutzerwahl beginnt die App-Schrift mit Fraunces; Navigation und Seite „Bücher“ in Fraunces', async () => {
      render(<App einstellungRepository={new InMemoryEinstellungRepository()} />);
      expect(wurzel().style.getPropertyValue('--bz-schrift')).toMatch(/^\s*['"]?Fraunces/);
      await tippe(within(nav()).getByRole('button', { name: 'Bücher' }));
      await screen.findByRole('heading', { name: 'Deine Bücher' }, W);
      const texte = [within(nav()).getByText('Bücher'), within(nav()).getByText('Profil'), screen.getByRole('heading', { name: 'Deine Bücher' })];
      for (const t of texte) expect(getComputedStyle(t).fontFamily, t.textContent ?? '').toMatch(/^['"]?Fraunces/);
    });

    it('[REQ-065/AK-1] Buchdetails: kein Element setzt eine eigene Schrift, alle Texte erben die App-Schrift', async () => {
      const d = await ansichtDetails();
      await reiterDetails(d);
      const eigene = alle()
        .map((e) => e.style.getPropertyValue('font-family'))
        .filter((ff) => ff && !/^(var\(--bz-schrift\)|inherit)$/.test(ff.trim()));
      expect(eigene).toEqual([]);
    });

    it('[REQ-065/AK-1] die Schriftdatei ist Teil des Builds: lokal eingebunden, Dateien vorhanden, keine Internet-Adresse', () => {
      const quellen = walk(SRC).filter((f) => /\.(tsx?|css)$/.test(f.pathname));
      const importe = quellen.flatMap((f) => [...ohneKommentare(fs.readFileSync(f, 'utf8')).matchAll(/import\s+['"]([^'"]*fraunces[^'"]*)['"]/gi)].map((m) => m[1]));
      expect(importe.length, 'Schrift wird im Code eingebunden').toBeGreaterThan(0);
      for (const imp of importe) {
        expect(imp).not.toMatch(/^https?:/);
        const css = new URL(`node_modules/${imp}`, ROOT);
        expect(fs.existsSync(css), imp).toBe(true);
        const urls = [...fs.readFileSync(css, 'utf8').matchAll(/url\(([^)]+)\)/g)].map((m) => m[1].replace(/['"]/g, ''));
        expect(urls.length).toBeGreaterThan(0);
        for (const u of urls) {
          expect(u, 'keine Internet-Adresse').not.toMatch(/^(https?:)?\/\//);
          expect(fs.existsSync(new URL(u, css)), u).toBe(true);
        }
      }
      const html = fs.readFileSync(new URL('index.html', ROOT), 'utf8');
      expect(html).not.toMatch(/fonts\.googleapis|fonts\.gstatic|fonts\.bunny/);
    });
  });

  it('[REQ-065/AK-2] die Lizenzdatei der SIL Open Font License für Fraunces wird ausgeliefert (public/)', () => {
    const lizenzen = walk(new URL('public/', ROOT)).filter((f) => {
      const t = fs.readFileSync(f, 'utf8');
      return /SIL Open Font License/i.test(t) && /Fraunces/i.test(t);
    });
    expect(lizenzen.map(rel)).not.toEqual([]);
  });

  describe('AK-3 Schrift an genau einer Stelle', () => {
    it('[REQ-065/AK-3] --bz-schrift beginnt ohne Wahl mit Fraunces und endet mit einer generischen Ersatzschrift', () => {
      render(<App einstellungRepository={new InMemoryEinstellungRepository()} />);
      const folge = wurzel().style.getPropertyValue('--bz-schrift').split(',').map((s) => s.trim());
      expect(folge[0]).toMatch(/^['"]?Fraunces/);
      expect(folge[folge.length - 1]).toMatch(/^(serif|sans-serif|system-ui|ui-serif|ui-sans-serif)$/);
      for (const s of Object.values(schriften)) expect(s.folge.split(',').pop()!.trim()).toMatch(/^(serif|sans-serif|system-ui|ui-serif|ui-sans-serif|monospace)$/);
    });

    it('[REQ-065/AK-3] kein Element legt eine abweichende Schrift fest – einzige Ausnahme: Zeilen der Schriftliste', async () => {
      await fuerJedeAnsicht((ansicht) => {
        const verstoesse = alle()
          .filter((e) => !e.closest('button[data-schrift-zeile]'))
          .filter((e) => {
            const ff = e.style.getPropertyValue('font-family').trim();
            return ff !== '' && !/^(var\(--bz-schrift\)|inherit)$/.test(ff);
          })
          .map((e) => `<${e.tagName.toLowerCase()}> ${e.style.getPropertyValue('font-family')}`);
        expect(verstoesse, ansicht).toEqual([]);
      });
    });
  });

  describe('AK-4 Nur die definierten Schriftgrößenstufen', () => {
    it('[REQ-065/AK-4] zentral genau sechs Stufen Label, Meta, Text, Titel, Abschnitt, Seite', () => {
      const namen = Object.keys(vars()).filter((k) => k.startsWith('--bz-schriftgroesse-'));
      expect(namen.sort()).toEqual(STUFEN.map((s) => `--bz-schriftgroesse-${s}`).sort());
      expect(Object.keys(schriftstufen).sort()).toEqual([...STUFEN].sort());
    });

    it('[REQ-065/AK-4] in allen Ansichten bezieht jedes Element seine Schriftgröße aus einer Stufe', async () => {
      await fuerJedeAnsicht((ansicht) => {
        const verstoesse = alle()
          .filter((e) => e.style.fontSize && e.style.fontSize !== 'inherit' && !STUFE_RE.test(e.style.fontSize.trim()))
          .map((e) => `<${e.tagName.toLowerCase()}> ${e.style.fontSize} "${(e.textContent ?? '').slice(0, 30)}"`);
        expect(verstoesse, ansicht).toEqual([]);
      });
    });

    it('[REQ-065/AK-4] im Quellcode keine eigene Schriftgröße außerhalb der zentralen Stelle', () => {
      const verstoesse: string[] = [];
      for (const f of walk(SRC).filter((x) => /\.(tsx?|css)$/.test(x.pathname) && !rel(x).startsWith('src/theme/'))) {
        const t = ohneKommentare(fs.readFileSync(f, 'utf8'));
        for (const m of t.matchAll(/(?:fontSize|['"]font-size['"])\s*:\s*([^,}\n]+)/g)) if (/\d/.test(m[1]) && !/schriftgroesse|textstufe/.test(m[1])) verstoesse.push(`${rel(f)}: ${m[0].trim()}`);
        for (const m of t.matchAll(/(?:^|[;{\s])font-size\s*:\s*([^;}]+)/g)) if (!/var\(--bz-schriftgroesse-/.test(m[1]) && !/inherit/.test(m[1])) verstoesse.push(`${rel(f)}: ${m[0].trim()}`);
      }
      expect(verstoesse).toEqual([]);
    });
  });

  describe('AK-5 Rollenzuordnung', () => {
    it('[REQ-065/AK-5] „Deine Bücher“ = Seite, „Noch zu lesen“ = Abschnitt', async () => {
      await ansichtBuecher();
      expect(groessenAngabe(screen.getByRole('heading', { name: 'Deine Bücher' }))).toBe('var(--bz-schriftgroesse-seite)');
      const ntl = within(screen.getByRole('region', { name: 'Noch zu lesen' })).getByRole('heading', { name: 'Noch zu lesen' });
      expect(groessenAngabe(ntl)).toBe('var(--bz-schriftgroesse-abschnitt)');
    });

    it('[REQ-065/AK-5] Buchdetails: Buchtitel = Titel, Autor = Meta', async () => {
      const d = await ansichtDetails();
      expect(groessenAngabe(d.querySelector<HTMLElement>('[data-buchdetails-titel]')!)).toBe('var(--bz-schriftgroesse-titel)');
      expect(groessenAngabe(d.querySelector<HTMLElement>('[data-buchdetails-autor]')!)).toBe('var(--bz-schriftgroesse-meta)');
    });

    it('[REQ-065/AK-5] Stufen von klein nach groß: Label < Meta < Text < Titel < Abschnitt < Seite', () => {
      const werte = STUFEN.map((s) => px(vars()[`--bz-schriftgroesse-${s}`]));
      for (let i = 1; i < werte.length; i++) expect(werte[i], `${STUFEN[i - 1]} < ${STUFEN[i]}`).toBeGreaterThan(werte[i - 1]);
    });
  });

  it('[REQ-065/AK-6] Wert einer Stufe an der zentralen Stelle ändern wirkt auf App-Wurzel und <html>, ohne Elemente anzupassen', async () => {
    const alt = schriftstufen.text.px;
    schriftstufen.text.px = alt + 4;
    try {
      render(<App einstellungRepository={new InMemoryEinstellungRepository()} />);
      await vi.waitFor(() => expect(document.documentElement.style.getPropertyValue('--bz-schriftgroesse-text')).toBe(`${alt + 4}px`), W);
      expect(wurzel().style.getPropertyValue('--bz-schriftgroesse-text')).toBe(`${alt + 4}px`);
      // Texte der Stufe verweisen auf die Variable (kein fester Wert am Element)
      await tippe(within(nav()).getByRole('button', { name: 'Profil' }));
      expect(groessenAngabe(within(screen.getByRole('main')).getByText('Design'))).toBe('var(--bz-schriftgroesse-text)');
    } finally {
      schriftstufen.text.px = alt;
    }
  });

  it('[REQ-065/AK-7] jeder Text der Stufe „Label“ erscheint in Großbuchstaben und mit erhöhter Zeichensperrung', async () => {
    let gefunden = 0;
    await fuerJedeAnsicht((ansicht) => {
      for (const e of alle().filter((x) => x.style.fontSize === 'var(--bz-schriftgroesse-label)')) {
        gefunden++;
        const cs = getComputedStyle(e);
        expect(cs.textTransform, ansicht).toBe('uppercase');
        expect(['', 'normal', '0', '0px', '0em']).not.toContain(cs.letterSpacing);
      }
    });
    expect(gefunden).toBeGreaterThan(0);
    cleanup();
    // Schreibweise im zugrunde liegenden Text ist egal: Profil-Überschrift steht als „App“ im Text.
    await ansichtProfil();
    const app = within(screen.getByRole('main')).getByText(/^App$/i);
    expect(getComputedStyle(app).textTransform).toBe('uppercase');
  });

  describe('AK-8 Abstände aus dem Raster', () => {
    const ERLAUBT = /^(0|0px|auto|var\(--bz-(abstand-(xs|s|m|l|xl)|rand)\)|calc\(.*\)|env\(.*\)|var\(--safe-area.*\))$/;
    /** Zerlegt einen Kurzschreibwert in Teile, Klammern bleiben zusammen. */
    function teile(v: string): string[] {
      const out: string[] = [];
      let tiefe = 0;
      let akt = '';
      for (const c of v.trim()) {
        if (c === '(') tiefe++;
        if (c === ')') tiefe--;
        if (c === ' ' && tiefe === 0) {
          if (akt) out.push(akt);
          akt = '';
        } else akt += c;
      }
      if (akt) out.push(akt);
      return out;
    }
    // Werte, die aus der zentralen Definition stammen (Raster und Rand). Elemente dürfen die Variable oder den
    // daraus berechneten px-Wert verwenden (z. B. `${bildschirmrandPx}px`); andere Zahlen sind kein Rasterwert.
    const rasterPx = () => new Set(Object.entries(vars()).filter(([k]) => /^--bz-(abstand-|rand$)/.test(k)).map(([, v]) => v));
    const nurRaster = (v: string) =>
      teile(v).every((t) => {
        if (/^-?\d+(\.\d+)?px$/.test(t)) return t === '0px' || rasterPx().has(t.replace(/^-/, ''));
        if (!ERLAUBT.test(t)) return false;
        // calc(): nur Raster-Variablen, Bildschirmrand, sichere Bereiche und Faktoren – keine eigenen px-Werte
        if (t.startsWith('calc(')) return !/[1-9]\d*(\.\d+)?px/.test(t.replace(/var\([^()]*(\([^()]*\))?[^()]*\)|env\([^()]*\)/g, ''));
        return true;
      });

    it('[REQ-065/AK-8] in allen Ansichten stammen Innen-/Außenabstände und Lücken aus dem Raster bzw. dem Bildschirmrand', async () => {
      const EIGEN = ['margin', 'marginTop', 'marginRight', 'marginBottom', 'marginLeft', 'padding', 'paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft', 'gap', 'rowGap', 'columnGap'] as const;
      const verstoesse: string[] = [];
      await fuerJedeAnsicht((ansicht) => {
        for (const e of alle()) {
          for (const p of EIGEN) {
            const v = e.style[p];
            if (v && !nurRaster(v)) verstoesse.push(`${ansicht}: <${e.tagName.toLowerCase()}${e.getAttributeNames().filter((n) => n.startsWith('data-')).map((n) => ` ${n}`).join('')}> ${p}: ${v}`);
          }
        }
      });
      expect([...new Set(verstoesse)]).toEqual([]);
    });

    it('[REQ-065/AK-8] Seiten „Bücher“ und „Profil“ halten links und rechts den zentralen Bildschirmrand ein', async () => {
      const randVon = (start: HTMLElement) => {
        for (let n: HTMLElement | null = start; n; n = n.parentElement) {
          const l = n.style.paddingLeft || teile(n.style.padding)[3] || teile(n.style.padding)[1];
          const r = n.style.paddingRight || teile(n.style.padding)[1];
          if (l || r) return [l, r];
        }
        return ['', ''];
      };
      const rand = ['var(--bz-rand)', vars()['--bz-rand']];
      await ansichtBuecher();
      for (const r of randVon(screen.getByRole('heading', { name: 'Deine Bücher' }))) expect(rand).toContain(r);
      cleanup();
      await ansichtProfil();
      for (const r of randVon(within(screen.getByRole('main')).getByText(/^App$/i))) expect(rand).toContain(r);
      expect(px(vars()['--bz-rand'])).toBeGreaterThan(0);
    });
  });

  describe('AK-9 Pillen und Schaltflächen', () => {
    it('[REQ-065/AK-9] Filter-Pillen, runde Schaltflächen im Kopfbereich, Statuspille, „Sichern“: sichtbare Höhe aus der zentralen Standardhöhe', async () => {
      await ansichtBuecher();
      // Variable oder der daraus berechnete Wert (`${pillenhoehePx}px`) – beides kommt aus der zentralen Standardhöhe.
      const ZENTRAL = ['var(--bz-pillenhoehe)', vars()['--bz-pillenhoehe']];
      const hoehe = (e: HTMLElement) => {
        const h = e.style.height || e.style.minHeight;
        return ZENTRAL.includes(h) ? 'var(--bz-pillenhoehe)' : h;
      };
      for (const b of within(screen.getByRole('group', { name: 'Filter' })).getAllByRole('button')) expect(hoehe(b), `Filter ${b.textContent}`).toBe('var(--bz-pillenhoehe)');
      for (const name of ['Filter und Einstellungen', 'Buch hinzufügen']) expect(hoehe(screen.getByRole('button', { name })), name).toBe('var(--bz-pillenhoehe)');
      cleanup();
      const d = await ansichtDetails();
      expect(hoehe(d.querySelector<HTMLElement>('[data-statuspille]')!)).toBe('var(--bz-pillenhoehe)');
      await reiterDetails(d);
      await tippe(d.querySelector('[data-ausgabe-zeile="verlag"]')!);
      const sichern = await vi.waitFor(() => {
        const s = document.querySelector<HTMLElement>('[data-blatt-sichern="verlag"]');
        expect(s).not.toBeNull();
        return s!;
      }, W);
      expect(hoehe(sichern)).toBe('var(--bz-pillenhoehe)');
    });

    it('[REQ-065/AK-9] Tippfläche mindestens 44 × 44 px: zentrale Mindestfläche ≥ 44 px, für alle Schaltflächen per CSS erweitert', () => {
      expect(px(vars()['--bz-tippflaeche'])).toBeGreaterThanOrEqual(44);
      expect(px(vars()['--bz-pillenhoehe'])).toBeGreaterThan(0);
      const css = walk(SRC).filter((f) => f.pathname.endsWith('.css')).map((f) => ohneKommentare(fs.readFileSync(f, 'utf8'))).join('\n');
      const regel = [...css.matchAll(/([^{}]+)\{([^}]*)\}/g)].find((m) => /button[^,{]*::?before/.test(m[1]));
      expect(regel, 'Regel für button::before').toBeDefined();
      expect(regel![2]).toMatch(/(min-)?width\s*:[^;]*var\(--bz-tippflaeche/);
      expect(regel![2]).toMatch(/(min-)?height\s*:[^;]*var\(--bz-tippflaeche/);
    });

    it('[REQ-065/AK-9] antippbare Nicht-Schaltflächen (role=button/menuitem/tab/radio ohne <button>) tragen die erweiterte Tippfläche', async () => {
      await fuerJedeAnsicht((ansicht) => {
        const ohne = alle()
          .filter((e) => e.tagName !== 'BUTTON' && e.tagName !== 'INPUT' && e.tagName !== 'LABEL' && /^(button|menuitem|tab|radio|option)$/.test(e.getAttribute('role') ?? ''))
          .filter((e) => !e.hasAttribute('data-tippflaeche'))
          .map((e) => `<${e.tagName.toLowerCase()} role=${e.getAttribute('role')}> "${(e.textContent ?? '').slice(0, 30)}"`);
        expect(ohne, ansicht).toEqual([]);
      });
    });
  });

  it('[REQ-065/AK-10] Autor in den Buchdetails und Stufentext („Hat mir gefallen“) kursiv', async () => {
    const d = await ansichtDetails();
    expect(getComputedStyle(d.querySelector<HTMLElement>('[data-buchdetails-autor]')!).fontStyle).toBe('italic');
    const st = d.querySelector<HTMLElement>('[data-kriterium="sterne"] [data-stufentext]')!;
    expect(st.textContent?.trim()).toBe('Hat mir gefallen');
    expect(getComputedStyle(st).fontStyle).toBe('italic');
  });

  describe('AK-11 Papier-Körnung, weiche Schatten, Zeilenabstand', () => {
    it('[REQ-065/AK-11] Hintergrund der App zeigt eine Körnung über der Farbrubrik „Hintergrund“', () => {
      render(<App einstellungRepository={new InMemoryEinstellungRepository()} />);
      expect(wurzel().style.backgroundImage).toMatch(/url\(/);
      expect(wurzel().style.backgroundColor).toBe('var(--bz-farbe-hintergrund)');
      const main = screen.getByRole('main');
      expect(main.style.backgroundImage || wurzel().style.backgroundImage).toMatch(/url\(/);
    });

    it('[REQ-065/AK-11] Statistik-Pille und Karte „Ausgabe“: weicher Schatten statt hartem Rahmen', async () => {
      const d = await ansichtDetails();
      const karten = [d.querySelector<HTMLElement>('[data-statistik]')!];
      await reiterDetails(d);
      karten.push(d.querySelector<HTMLElement>('[data-ausgabe-karte]')!);
      for (const k of karten) {
        // Fläche der Karte = erstes Element mit Hintergrund (Karte selbst oder Kind)
        const f = [k, ...Array.from(k.querySelectorAll<HTMLElement>('*'))].find((e) => e.style.backgroundColor)!;
        expect(['', 'none', '0px']).toContain(getComputedStyle(f).borderTopStyle === 'none' ? 'none' : getComputedStyle(f).borderTopWidth);
        expect(f.style.boxShadow, k.outerHTML.slice(0, 60)).toMatch(/\d+px\s+\d+px/);
        expect(f.style.boxShadow).toContain('var(--bz-schattenfarbe)');
      }
    });

    it('[REQ-065/AK-11] Fließtext mit Zeilenabstand von etwa dem 1,5-Fachen', async () => {
      render(<App einstellungRepository={new InMemoryEinstellungRepository()} />);
      expect(wurzel().style.lineHeight).toBe('var(--bz-zeilenabstand)');
      const z = Number(vars()['--bz-zeilenabstand']);
      expect(z).toBeGreaterThanOrEqual(1.4);
      expect(z).toBeLessThanOrEqual(1.6);
    });
  });
});

