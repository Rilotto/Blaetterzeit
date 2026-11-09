/**
 * Akzeptanztests REQ-009 – Abschnitt „Noch zu lesen“.
 *
 * Abgeleitet aus dem REQ-Text und der verbindlichen Schnittstellen-Absprache in
 * sprints/sprint-02/plan.md, Abschnitt „REQ-005 bis REQ-012 (Seite „Bücher“), Runde 1“:
 *  - <section aria-label="Noch zu lesen"> mit <h2> „Noch zu lesen“ und <button> „Alle ansehen ›“
 *  - Zuordnung in src/buecher/abschnittKonfiguration.ts (Export `abschnittKonfiguration`,
 *    `abschnittKonfiguration.nochZuLesen.lesestatus`, Vorbelegung ['ungelesen'])
 *  - <ul aria-label="Noch zu lesen"> mit einem <li> je Buch; im <li> ein <img alt="<Titel>"> oder
 *    der Cover-Platzhalter, dazu ein Titel-Element mit data-buchtitel; Liste mit overflowX: 'auto'
 *  - Farben per var(--bz-farbe-<id>): tertiaer, primaer, dunkelbraun
 *
 * Zustände werden über die Props `buecher`/`filter` von BuecherAnsicht hergestellt; Cover als Data-URI.
 * jsdom hat kein Layout: Titel-Regeln, Covergröße und Abstände werden strukturell über die
 * Styles geprüft (Zeilenbegrenzung, Auslassungspunkte, Breiten). Optik: manuelle Prüfliste.
 */
import '@testing-library/jest-dom/vitest';
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import type { CSSProperties } from 'react';
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import App from '@/App';
import BuecherAnsicht from '@/views/BuecherAnsicht';
import type { Buch } from '@/domain/buch';
import { LESESTATUS } from '@/domain/buch';
import { abschnittKonfiguration } from '@/buecher/abschnittKonfiguration';
import { farbrubriken, farbVariablen } from '@/theme';

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
type Status = Buch['status'];
const ABSCHNITT = 'Noch zu lesen';
const ALLE = 'Alle ansehen ›';
const LANG = 'Ein außerordentlich langer Buchtitel, der in Coverbreite ganz sicher mehr als zwei Zeilen benötigt und deshalb gekürzt werden muss';
const FARB_LITERAL =
  /#[0-9a-f]{3,8}\b|\b(?:rgba?|hsla?|hwb|oklch|oklab|lab|lch|color)\(|\b(?:black|white|red|green|blue|gray|grey|silver|maroon|brown|beige|ivory|navy|purple|orange|yellow|pink|tan|wheat|linen|khaki)\b/i;
const rubriken = farbrubriken as unknown as Record<string, { wert: string } | undefined>;
const svgCover = (w: number, h: number) =>
  `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}"><rect width="${w}" height="${h}" fill="currentColor"/></svg>`)}`;
const HOCH = svgCover(200, 300);
const QUER = svgCover(400, 200);
const QUADRAT = svgCover(300, 300);

let zaehler = 0;
function buch(titel: string, status: Status = 'ungelesen', cover?: string): Buch {
  zaehler++;
  const b: Buch = { id: `00000000-0000-4000-8000-${String(zaehler).padStart(12, '0')}`, titel, status };
  if (cover) b.cover = cover;
  return b;
}
function zeige(buecher: Buch[]) {
  const { container } = render(
    <div data-testwurzel="" style={farbVariablen() as CSSProperties}>
      <BuecherAnsicht buecher={buecher} />
    </div>,
  );
  return container.firstElementChild as HTMLElement;
}
const abschnitt = () => screen.getByRole('region', { name: ABSCHNITT });
const liste = () => within(abschnitt()).getByRole('list', { name: ABSCHNITT });
const eintraege = () => within(liste()).getAllByRole('listitem');
const titelVon = (li: HTMLElement) => {
  const t = li.querySelectorAll<HTMLElement>('[data-buchtitel]');
  expect(t, 'genau ein Titel-Element je Eintrag').toHaveLength(1);
  return t[0];
};
const titelListe = () => eintraege().map((li) => titelVon(li).textContent?.trim());
/** Coverbild bzw. Cover-Platzhalter eines Eintrags. */
function coverElement(li: HTMLElement) {
  const k = li.querySelectorAll<HTMLElement>('img, [data-cover-platzhalter]');
  expect(k, 'genau ein Cover oder Cover-Platzhalter je Eintrag').toHaveLength(1);
  return k[0];
}
function px(v: string) {
  const m = /^(-?[\d.]+)(px|rem)$/.exec((v ?? '').trim());
  if (!m) return NaN;
  return m[2] === 'rem' ? Number(m[1]) * 16 : Number(m[1]);
}
/** Erstes Element vom Cover aufwärts (bis ausschließlich `grenze`) mit fester Breite und Höhe. */
function coverFlaeche(start: HTMLElement, grenze: HTMLElement) {
  for (let n: HTMLElement | null = start; n && n !== grenze; n = n.parentElement) {
    const cs = getComputedStyle(n);
    if (Number.isFinite(px(cs.width)) && Number.isFinite(px(cs.height))) return n;
  }
  throw new Error('keine Coverfläche mit fester Breite und Höhe gefunden');
}
function masse(el: HTMLElement) {
  const cs = getComputedStyle(el);
  const rand = cs.boxSizing === 'border-box' ? 0 : (px(cs.borderLeftWidth) || 0) + (px(cs.borderRightWidth) || 0);
  const randH = cs.boxSizing === 'border-box' ? 0 : (px(cs.borderTopWidth) || 0) + (px(cs.borderBottomWidth) || 0);
  return { breite: px(cs.width) + rand, hoehe: px(cs.height) + randH };
}
function inlineDecls(el: Element): [string, string][] {
  return (el.getAttribute('style') ?? '')
    .split(';')
    .map((d) => d.trim())
    .filter(Boolean)
    .map((d) => {
      const i = d.indexOf(':');
      return [d.slice(0, i).trim().toLowerCase(), d.slice(i + 1).trim()] as [string, string];
    });
}
function berechneteFarbe(ctx: HTMLElement, ausdruck: string) {
  const probe = document.createElement('span');
  probe.style.setProperty('color', ausdruck);
  ctx.appendChild(probe);
  const wert = getComputedStyle(probe).color;
  probe.remove();
  return wert;
}
function sollFarbe(ctx: HTMLElement, id: string) {
  const r = rubriken[id];
  expect(r, `Farbrubrik "${id}" fehlt in der zentralen Definition (farbrubriken)`).toBeTruthy();
  return berechneteFarbe(ctx, r!.wert);
}
function pruefeTextfarbe(el: HTMLElement, id: string, wurzel: HTMLElement, wo: string) {
  let quelle: [string, string] | undefined;
  for (let n: HTMLElement | null = el; n && n !== wurzel && !quelle; n = n.parentElement) {
    quelle = inlineDecls(n).find(([p]) => p === 'color');
  }
  expect(quelle, `${wo}: keine Textfarbe gesetzt`).toBeDefined();
  expect(quelle![1].replace(/\s+/g, ''), wo).toBe(`var(--bz-farbe-${id})`);
  expect(getComputedStyle(el).color, `${wo}: dargestellte Farbe`).toBe(sollFarbe(wurzel, id));
}
function tapMenue(label: string) {
  fireEvent.click(within(screen.getByRole('navigation', { name: 'Hauptnavigation' })).getByRole('button', { name: label }));
}

const styleEls: HTMLStyleElement[] = [];
beforeAll(() => {
  for (const f of walk(SRC).filter((u) => /\.css$/.test(u.pathname))) {
    const s = document.createElement('style');
    s.textContent = fs.readFileSync(f, 'utf8');
    document.head.appendChild(s);
    styleEls.push(s);
  }
});
afterAll(() => styleEls.forEach((s) => s.remove()));
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.resetModules();
});

// ===========================================================================
describe('REQ-009 Abschnitt „Noch zu lesen“', () => {
  // ---------------------------------------------------------------- AK-1
  describe('AK-1 Abschnitt unter der Filterleiste', () => {
    it('[REQ-009/AK-1] Überschrift „Noch zu lesen“ und daneben „Alle ansehen ›“ stehen unter der Filterleiste', () => {
      zeige([buch('A')]);
      const s = abschnitt();
      const leiste = screen.getByRole('group', { name: 'Filter' });
      expect(leiste.compareDocumentPosition(s) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
      expect(leiste.contains(s)).toBe(false);
      const h2 = within(s).getByRole('heading', { level: 2, name: ABSCHNITT });
      const alle = within(s).getByRole('button', { name: ALLE });
      expect(h2.textContent?.trim()).toBe(ABSCHNITT);
      expect(alle.textContent?.trim()).toBe(ALLE);
      // links Überschrift, rechts daneben „Alle ansehen ›“: gleiche Zeile, Überschrift zuerst
      expect(h2.compareDocumentPosition(alle) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
      expect(h2.parentElement).toBe(alle.parentElement);
      const zeile = getComputedStyle(h2.parentElement!);
      expect(/flex/.test(zeile.display) && (zeile.flexDirection === '' || zeile.flexDirection === 'row')).toBe(true);
    });

    it('[REQ-009/AK-1] Überschrift und „Alle ansehen ›“ stehen vor der Buchliste', () => {
      zeige([buch('A')]);
      const h2 = within(abschnitt()).getByRole('heading', { level: 2 });
      expect(h2.compareDocumentPosition(liste()) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    });

    it('[REQ-009/AK-1] der Abschnitt steht auch bei leerer Buchliste und in der App', () => {
      zeige([]);
      expect(within(abschnitt()).getByRole('heading', { level: 2, name: ABSCHNITT })).toBeInTheDocument();
      expect(within(abschnitt()).getByRole('button', { name: ALLE })).toBeInTheDocument();
      cleanup();
      render(<App />);
      tapMenue('Bücher');
      expect(within(screen.getByRole('main')).getByRole('region', { name: ABSCHNITT })).toBeInTheDocument();
    });
  });

  // ---------------------------------------------------------------- AK-2
  describe('AK-2 Abschnittsüberschrift in der Farbrubrik Tertiär', () => {
    it('[REQ-009/AK-2] „Noch zu lesen“ ist in „Tertiär“ dargestellt, wie „Deine Bücher“', () => {
      const w = zeige([buch('A')]);
      const h2 = within(abschnitt()).getByRole('heading', { level: 2 });
      pruefeTextfarbe(h2, 'tertiaer', w, 'Abschnittsüberschrift');
      expect(getComputedStyle(h2).color).toBe(getComputedStyle(screen.getByRole('heading', { level: 1 })).color);
    });
  });

  // ---------------------------------------------------------------- AK-3
  describe('AK-3 Nur zugeordnete Bücher', () => {
    it('[REQ-009/AK-3] aus gemischten Lesestatus erscheinen genau die zugeordneten Bücher', () => {
      const b = [buch('U1'), buch('L1', 'am_lesen'), buch('U2'), buch('G1', 'gelesen'), buch('W1', 'wunschliste'), buch('U3')];
      zeige(b);
      expect(titelListe()).toEqual(['U1', 'U2', 'U3']);
    });

    it('[REQ-009/AK-3] Bücher mit gleichem Titel, aber verschiedenem Status: nur das zugeordnete erscheint', () => {
      zeige([buch('Gleich', 'gelesen'), buch('Gleich', 'ungelesen'), buch('Gleich', 'abgebrochen')]);
      expect(titelListe()).toEqual(['Gleich']);
    });

    it('[REQ-009/AK-3] ohne Props: die Demodaten werden über das Repository geladen, nur „ungelesen“ erscheint', async () => {
      const demo = JSON.parse(fs.readFileSync(new URL('demo/testbuecher.json', ROOT), 'utf8')) as Buch[];
      render(<BuecherAnsicht />);
      const ul = await within(abschnitt()).findByRole('list', { name: ABSCHNITT });
      const ist = within(ul)
        .getAllByRole('listitem')
        .map((li) => titelVon(li).textContent?.trim());
      expect(ist).toEqual(demo.filter((d) => d.status === 'ungelesen').map((d) => d.titel));
      expect(ist).not.toContain('When The Moon Hatched');
    });
  });

  // ---------------------------------------------------------------- AK-4
  describe('AK-4 Zuordnung zentral änderbar', () => {
    type Rtl = { render: typeof render; screen: typeof screen; within: typeof within; cleanup: typeof cleanup };
    async function mitZuordnung(status: Status[], buecher: Buch[]) {
      vi.resetModules();
      const modul = (await import('@/buecher/abschnittKonfiguration')) as {
        abschnittKonfiguration: { nochZuLesen: { lesestatus: Status[] } };
      };
      modul.abschnittKonfiguration.nochZuLesen.lesestatus = status;
      const rtl = (await import('@testing-library/react')) as unknown as Rtl;
      const { default: Ansicht } = (await import('@/views/BuecherAnsicht')) as { default: typeof BuecherAnsicht };
      rtl.render(<Ansicht buecher={buecher} />);
      const s = rtl.screen.getByRole('region', { name: ABSCHNITT });
      const ul = rtl.within(s).queryByRole('list', { name: ABSCHNITT });
      const titel = ul
        ? rtl.within(ul).getAllByRole('listitem').map((li) => li.querySelector('[data-buchtitel]')?.textContent?.trim())
        : [];
      rtl.cleanup();
      return titel;
    }
    const alle = () => LESESTATUS.map((s) => buch(`Buch ${s.id}`, s.id));

    it('[REQ-009/AK-4] die Zuordnung ist zentral festgelegt und mit genau „ungelesen“ vorbelegt', () => {
      expect(abschnittKonfiguration.nochZuLesen.lesestatus).toEqual(['ungelesen']);
    });

    it('[REQ-009/AK-4] erweitert um „am lesen“: der Abschnitt zeigt zusätzlich diese Bücher', async () => {
      expect(await mitZuordnung(['ungelesen', 'am_lesen'], alle())).toEqual(['Buch ungelesen', 'Buch am_lesen']);
    });

    it('[REQ-009/AK-4] ersetzt durch „Wunschliste“: „ungelesen“ erscheint nicht mehr', async () => {
      expect(await mitZuordnung(['wunschliste'], alle())).toEqual(['Buch wunschliste']);
    });

    it('[REQ-009/AK-4] verringert auf keinen Status: keine Bücher (Leere-Liste-Platzhalter statt Liste)', async () => {
      expect(await mitZuordnung([], alle())).toEqual([]);
    });

    it('[REQ-009/AK-4] außerhalb der zentralen Zuordnung wird kein Lesestatus für den Abschnitt festgelegt', () => {
      const zentral = new URL('buecher/abschnittKonfiguration.ts', SRC).href;
      const treffer = walk(SRC)
        .filter((f) => /\.tsx?$/.test(f.pathname) && f.href !== zentral && !f.pathname.endsWith('/domain/buch.ts'))
        .filter((f) => /['"`]ungelesen['"`]/.test(fs.readFileSync(f, 'utf8')))
        .map((f) => f.pathname.slice(SRC.pathname.length));
      expect(treffer).toEqual([]);
    });
  });

  // ---------------------------------------------------------------- AK-5
  describe('AK-5 Keine Begrenzung der Anzahl', () => {
    it.each([25, 60])('[REQ-009/AK-5] %i zugeordnete Bücher sind alle in der Liste', (n) => {
      const b = Array.from({ length: n }, (_, i) => buch(`Band ${i + 1}`));
      zeige(b);
      expect(titelListe()).toEqual(b.map((x) => x.titel));
      expect(within(abschnitt()).queryByText(/weitere|mehr anzeigen|\+\d+/i)).toBeNull();
    });
  });

  // ---------------------------------------------------------------- AK-6
  describe('AK-6 Horizontal wischbar, unabhängig von der Filterleiste', () => {
    it('[REQ-009/AK-6] die Buchliste ist ein eigener horizontaler Scrollbereich in einer Zeile', () => {
      zeige(Array.from({ length: 10 }, (_, i) => buch(`B${i}`)));
      const cs = getComputedStyle(liste());
      expect(cs.overflowX).toMatch(/^(auto|scroll)$/);
      expect(/flex/.test(cs.display)).toBe(true);
      expect(cs.flexDirection === '' || cs.flexDirection === 'row').toBe(true);
      expect(cs.flexWrap === '' || cs.flexWrap === 'nowrap').toBe(true);
      for (const li of eintraege()) expect(getComputedStyle(li).flexShrink, 'Eintrag schrumpft nicht').toBe('0');
    });

    it('[REQ-009/AK-6] Buchliste und Filterleiste sind getrennte Scrollbereiche', () => {
      zeige([buch('A'), buch('B')]);
      const l = screen.getByRole('group', { name: 'Filter' });
      expect(l.contains(liste())).toBe(false);
      expect(liste().contains(l)).toBe(false);
    });

    it('[REQ-009/AK-6] Scrollen der Buchliste ändert nichts außerhalb der Liste (Filterleiste, Überschriften)', () => {
      const w = zeige(Array.from({ length: 10 }, (_, i) => buch(`B${i}`)));
      const ohneListe = () => {
        const c = w.cloneNode(true) as HTMLElement;
        c.querySelector('ul[aria-label="Noch zu lesen"]')?.remove();
        return c.innerHTML;
      };
      const vorher = ohneListe();
      const filterVorher = screen.getByRole('group', { name: 'Filter' }).scrollLeft;
      liste().scrollLeft = 500;
      fireEvent.scroll(liste());
      expect(ohneListe()).toBe(vorher);
      expect(screen.getByRole('group', { name: 'Filter' }).scrollLeft).toBe(filterVorher);
    });
  });

  // ---------------------------------------------------------------- AK-7
  describe('AK-7 Einheitliche Covergröße ohne Verzerrung', () => {
    const MIX = () => [buch('Hoch', 'ungelesen', HOCH), buch('Quer', 'ungelesen', QUER), buch('Quadrat', 'ungelesen', QUADRAT), buch('Ohne')];

    it('[REQ-009/AK-7] Coverbilder werden als <img> mit dem Titel als Alternativtext gezeigt', () => {
      zeige(MIX());
      for (const li of eintraege().slice(0, 3)) {
        const img = coverElement(li);
        expect(img.tagName).toBe('IMG');
        expect(img).toHaveAttribute('alt', titelVon(li).textContent?.trim());
      }
      expect(eintraege()[0].querySelector('img')!.getAttribute('src')).toBe(HOCH);
    });

    it('[REQ-009/AK-7] alle Coverflächen (auch der Platzhalter) haben dieselbe feste Breite und Höhe', () => {
      zeige(MIX());
      const m = eintraege().map((li) => masse(coverFlaeche(coverElement(li), li.parentElement!)));
      expect(m[0].breite).toBeGreaterThan(0);
      for (const x of m) expect(x).toEqual(m[0]);
    });

    it('[REQ-009/AK-7] die Coverfläche ist hochformatig (Höhe > Breite)', () => {
      zeige(MIX());
      for (const li of eintraege()) {
        const m = masse(coverFlaeche(coverElement(li), li.parentElement!));
        expect(m.hoehe).toBeGreaterThan(m.breite);
      }
    });

    it('[REQ-009/AK-7] Coverbilder werden proportional eingepasst (object-fit cover/contain, nicht gestreckt)', () => {
      zeige(MIX());
      for (const img of liste().querySelectorAll<HTMLImageElement>('img')) {
        const cs = getComputedStyle(img);
        const gestreckt = Number.isFinite(px(cs.width)) || cs.width === '100%';
        const hoehe = Number.isFinite(px(cs.height)) || cs.height === '100%';
        if (gestreckt && hoehe) {
          expect(cs.objectFit, `${img.alt}: object-fit`).toMatch(/^(cover|contain|scale-down)$/);
        }
      }
    });

    it('[REQ-009/AK-7] Coverfläche mit leicht abgerundeten Ecken (Radius > 0, aber kein Kreis/Oval)', () => {
      zeige(MIX());
      for (const li of eintraege()) {
        const f = coverFlaeche(coverElement(li), li.parentElement!);
        const r = px(getComputedStyle(f).borderTopLeftRadius || getComputedStyle(f).borderRadius);
        expect(r, `${titelVon(li).textContent}`).toBeGreaterThan(0);
        expect(r).toBeLessThan(masse(f).breite / 4);
      }
    });
  });

  // ---------------------------------------------------------------- AK-8
  describe('AK-8 Buchtitel unter dem Cover', () => {
    it('[REQ-009/AK-8] der Titel steht direkt nach dem Cover im selben Eintrag, untereinander angeordnet', () => {
      zeige([buch('Kurz', 'ungelesen', HOCH), buch('Auch kurz')]);
      for (const li of eintraege()) {
        const c = coverElement(li);
        const t = titelVon(li);
        expect(c.compareDocumentPosition(t) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
        expect(c.contains(t)).toBe(false);
        const cs = getComputedStyle(li);
        if (/flex/.test(cs.display)) expect(cs.flexDirection).toMatch(/^column$/);
        // kein Element mit Inhalt zwischen Cover und Titel
        const zwischen = Array.from(li.querySelectorAll<HTMLElement>('*')).filter(
          (e) =>
            !e.contains(c) && !e.contains(t) && !c.contains(e) && !t.contains(e) &&
            c.compareDocumentPosition(e) & Node.DOCUMENT_POSITION_FOLLOWING &&
            e.compareDocumentPosition(t) & Node.DOCUMENT_POSITION_FOLLOWING,
        );
        expect(zwischen.filter((e) => e.textContent?.trim()).map((e) => e.outerHTML)).toEqual([]);
      }
    });

    it('[REQ-009/AK-8] der Titel ist linksbündig und zeigt genau den Buchtitel', () => {
      zeige([buch('Kurz')]);
      const t = titelVon(eintraege()[0]);
      expect(t.textContent?.trim()).toBe('Kurz');
      expect(getComputedStyle(t).textAlign).toMatch(/^(|left|start)$/);
      for (let n = t.parentElement; n && n !== liste(); n = n.parentElement) {
        expect(getComputedStyle(n).textAlign, 'Vorfahr zentriert').not.toMatch(/center|right|end/);
      }
    });
  });

  // ---------------------------------------------------------------- AK-9
  describe('AK-9 Langer Titel: zwei Zeilen, Auslassungspunkte, Coverbreite', () => {
    it('[REQ-009/AK-9] der Titel ist auf zwei Zeilen begrenzt und endet mit Auslassungspunkten (Line-Clamp)', () => {
      zeige([buch(LANG)]);
      const cs = getComputedStyle(titelVon(eintraege()[0]));
      const clamp = cs.getPropertyValue('-webkit-line-clamp') || cs.getPropertyValue('line-clamp');
      expect(clamp, 'Zeilenbegrenzung').toMatch(/^2\b/);
      expect(cs.display, 'display für -webkit-line-clamp').toMatch(/-webkit-(inline-)?box/);
      expect(cs.getPropertyValue('-webkit-box-orient')).toBe('vertical');
      expect(cs.overflow === 'hidden' || cs.overflowY === 'hidden').toBe(true);
    });

    it('[REQ-009/AK-9] der vollständige Titel bleibt im Text erhalten (gekürzt wird nur die Darstellung)', () => {
      zeige([buch(LANG)]);
      expect(titelVon(eintraege()[0]).textContent?.trim()).toBe(LANG);
    });

    it('[REQ-009/AK-9] der Titel bricht um (kein nowrap) und ist nicht breiter als das Cover', () => {
      zeige([buch(LANG, 'ungelesen', HOCH)]);
      const li = eintraege()[0];
      const t = titelVon(li);
      expect(getComputedStyle(t).whiteSpace).not.toMatch(/nowrap|pre$/);
      const coverBreite = masse(coverFlaeche(coverElement(li), li.parentElement!)).breite;
      // Breitenbegrenzung: erstes Element vom Titel bis einschließlich <li> mit fester Breite
      let begrenzt = NaN;
      for (let n: HTMLElement | null = t; n && n !== liste(); n = n.parentElement) {
        const cs = getComputedStyle(n);
        const w = px(cs.width) || px(cs.maxWidth);
        if (Number.isFinite(w)) {
          begrenzt = w;
          break;
        }
      }
      expect(begrenzt, 'Titelbreite ist an keiner Stelle begrenzt').toBeLessThanOrEqual(coverBreite);
      expect(getComputedStyle(t).overflowWrap + getComputedStyle(t).wordBreak, 'lange Wörter umbrechen').toMatch(/break-word|anywhere|break-all/);
    });
  });

  // ---------------------------------------------------------------- AK-10
  describe('AK-10 Langer Titel beeinflusst Nachbarn nicht', () => {
    it('[REQ-009/AK-10] Eintrag und Nachbarcover haben neben einem langen Titel dieselben Maße wie neben einem kurzen', () => {
      zeige([buch(LANG), buch('Kurz', 'ungelesen', HOCH)]);
      const mitLang = eintraege().map((li) => [li.getAttribute('style'), coverElement(li).getAttribute('style')]);
      cleanup();
      zeige([buch('K'), buch('Kurz', 'ungelesen', HOCH)]);
      const mitKurz = eintraege().map((li) => [li.getAttribute('style'), coverElement(li).getAttribute('style')]);
      expect(mitLang[1]).toEqual(mitKurz[1]);
      expect(mitLang[0][0], 'Eintrag mit langem Titel gleich groß wie mit kurzem').toBe(mitKurz[0][0]);
    });

    it('[REQ-009/AK-10] jeder Eintrag hat eine feste Breite = Coverbreite und schrumpft/wächst nicht', () => {
      zeige([buch(LANG), buch('Kurz')]);
      for (const li of eintraege()) {
        const cs = getComputedStyle(li);
        const coverBreite = masse(coverFlaeche(coverElement(li), li.parentElement!)).breite;
        expect(px(cs.width), 'feste Breite des Eintrags').toBe(coverBreite);
        expect(cs.flexShrink).toBe('0');
        expect(cs.flexGrow === '' || cs.flexGrow === '0').toBe(true);
        expect(cs.position).not.toMatch(/absolute|fixed/);
      }
    });

    it('[REQ-009/AK-10] Einträge sind oben ausgerichtet (ein zweizeiliger Titel verschiebt kein Nachbarcover nach unten)', () => {
      zeige([buch(LANG), buch('Kurz')]);
      expect(getComputedStyle(liste()).alignItems).not.toMatch(/center|end|baseline/);
    });
  });

  // ---------------------------------------------------------------- AK-11
  describe('AK-11 Gleiche Abstände', () => {
    it('[REQ-009/AK-11] bei fünf Büchern sind alle Einträge gleich gestylt und der Abstand kommt aus einer Stelle', () => {
      zeige([buch('A', 'ungelesen', HOCH), buch(LANG), buch('C'), buch('D', 'ungelesen', QUER), buch('E')]);
      const stile = eintraege().map((li) => li.getAttribute('style'));
      expect(new Set(stile).size, 'alle Einträge gleich').toBe(1);
      const cs = getComputedStyle(liste());
      const gap = px(cs.columnGap) || px(cs.gap);
      const marginRechts = px(getComputedStyle(eintraege()[0]).marginRight);
      expect((gap > 0) !== (marginRechts > 0), 'genau ein Mechanismus für den Abstand (gap oder margin)').toBe(true);
    });
  });

  // ---------------------------------------------------------------- AK-12
  describe('AK-12 Buch ohne Cover vs. keine Bücher', () => {
    it('[REQ-009/AK-12] genau ein Buch ohne Cover: ein Eintrag mit Cover-Platzhalter und echtem Titel, kein Leere-Liste-Platzhalter', () => {
      zeige([buch('Dungeon Crawler Carl')]);
      expect(eintraege()).toHaveLength(1);
      const li = eintraege()[0];
      expect(coverElement(li)).toHaveAttribute('data-cover-platzhalter');
      expect(titelVon(li).textContent?.trim()).toBe('Dungeon Crawler Carl');
      expect(document.querySelector('[data-leere-liste]')).toBeNull();
      expect(screen.queryByText('Wie wäre es mit einem neuen Buch?')).toBeNull();
    });

    it('[REQ-009/AK-12] Gegenprobe: keine Bücher → Leere-Liste-Platzhalter, keine Buchliste', () => {
      zeige([]);
      expect(abschnitt().querySelector('[data-leere-liste]')).not.toBeNull();
      expect(within(abschnitt()).queryAllByRole('listitem')).toHaveLength(0);
    });
  });

  // ---------------------------------------------------------------- AK-13
  describe('AK-13 Farben aus den zentralen Farbrubriken', () => {
    function mitGeaenderterRubrik(id: string, fn: (neu: string, alt: string) => void) {
      const r = rubriken[id];
      expect(r, `Farbrubrik "${id}" fehlt`).toBeTruthy();
      const alt = r!.wert;
      const neu = Object.values(rubriken)
        .map((x) => x!.wert)
        .find((v) => berechneteFarbe(document.body, v) !== berechneteFarbe(document.body, alt))!;
      r!.wert = neu;
      try {
        fn(neu, alt);
      } finally {
        r!.wert = alt;
      }
    }
    const FAELLE: [string, string, () => HTMLElement[]][] = [
      ['tertiaer', 'Abschnittsüberschrift', () => [within(abschnitt()).getByRole('heading', { level: 2 })]],
      ['primaer', '„Alle ansehen ›“', () => [within(abschnitt()).getByRole('button', { name: ALLE })]],
      ['dunkelbraun', 'alle Buchtitel', () => eintraege().map(titelVon)],
    ];
    it.each(FAELLE)('[REQ-009/AK-13] Änderung der Rubrik „%s“ wirkt auf: %s', (id, wo, finde) => {
      mitGeaenderterRubrik(id, (neu, alt) => {
        const w = zeige([buch('A'), buch('B', 'ungelesen', HOCH), buch(LANG)]);
        for (const el of finde()) {
          expect(getComputedStyle(el).color, `${wo}: neuer Wert`).toBe(berechneteFarbe(w, neu));
          expect(getComputedStyle(el).color, `${wo}: alter Wert`).not.toBe(berechneteFarbe(w, alt));
        }
      });
    });

    it('[REQ-009/AK-13] kein Element des Abschnitts hat einen eigenen Farbwert', () => {
      zeige([buch('A'), buch('B', 'ungelesen', HOCH)]);
      const s = abschnitt();
      const verstoesse = [s, ...Array.from(s.querySelectorAll<HTMLElement>('*'))].flatMap((el) =>
        inlineDecls(el)
          .filter(([p]) => /color|background|border|outline|shadow/.test(p))
          .filter(([, v]) => FARB_LITERAL.test(v.replace(/url\([^)]*\)/g, '').replace(/color-mix\(/g, '')) || /var\(--[^,)]+,/.test(v))
          .map(([p, v]) => `<${el.tagName.toLowerCase()}> ${p}: ${v}`),
      );
      expect(verstoesse).toEqual([]);
    });
  });

  // ---------------------------------------------------------------- AK-14
  describe('AK-14 „Alle ansehen ›“ bewirkt vorerst nichts', () => {
    it('[REQ-009/AK-14] Antippen ändert in der App nichts (Ansicht, Menüpunkt, Filterleiste, Buchliste)', async () => {
      render(<App />);
      tapMenue('Bücher');
      await within(abschnitt()).findByRole('list', { name: ABSCHNITT });
      fireEvent.click(within(screen.getByRole('group', { name: 'Filter' })).getByRole('button', { name: 'Noch zu lesen' }));
      const vorher = document.body.innerHTML;
      const alle = within(abschnitt()).getByRole('button', { name: ALLE });
      fireEvent.click(alle);
      fireEvent.click(alle);
      expect(document.body.innerHTML).toBe(vorher);
    });

    it('[REQ-009/AK-14] „Alle ansehen ›“ hat keinen Umschalt- oder Linkzustand', () => {
      zeige([buch('A')]);
      const alle = within(abschnitt()).getByRole('button', { name: ALLE });
      expect(alle).not.toHaveAttribute('aria-pressed');
      expect(alle).not.toHaveAttribute('aria-expanded');
      expect(alle.closest('a[href]')).toBeNull();
    });
  });

  // ---------------------------------------------------------------- AK-15
  describe('AK-15 Buchtitel in Dunkelbraun, „Alle ansehen ›“ in Primär', () => {
    it('[REQ-009/AK-15] jeder Buchtitel ist in „Dunkelbraun“ dargestellt (mit und ohne Cover)', () => {
      const w = zeige([buch('A'), buch('B', 'ungelesen', HOCH), buch(LANG)]);
      for (const li of eintraege()) pruefeTextfarbe(titelVon(li), 'dunkelbraun', w, `Titel "${titelVon(li).textContent}"`);
    });

    it('[REQ-009/AK-15] „Alle ansehen ›“ ist in „Primär“ dargestellt', () => {
      const w = zeige([buch('A')]);
      pruefeTextfarbe(within(abschnitt()).getByRole('button', { name: ALLE }), 'primaer', w, '„Alle ansehen ›“');
    });

    it('[REQ-009/AK-15] „Alle ansehen ›“ hat keinen eigenen Hintergrund oder Rahmen (dezenter Text)', () => {
      zeige([buch('A')]);
      const cs = getComputedStyle(within(abschnitt()).getByRole('button', { name: ALLE }));
      expect(cs.backgroundColor).toMatch(/^(|transparent|rgba\(0, 0, 0, 0\))$/);
      expect(/^(none|hidden|)$/.test(cs.borderTopStyle) || px(cs.borderTopWidth) === 0).toBe(true);
    });
  });

  // ---------------------------------------------------------------- AK-16
  describe('AK-16 Vorbelegung: nur „ungelesen“', () => {
    it('[REQ-009/AK-16] je ein Buch pro Lesestatus: der Abschnitt zeigt genau das Buch mit „ungelesen“', () => {
      zeige(LESESTATUS.map((s) => buch(`Buch ${s.bezeichnung}`, s.id)));
      expect(titelListe()).toEqual(['Buch ungelesen']);
    });

    it('[REQ-009/AK-16] Negativfall: nur Bücher ohne „ungelesen“ → keine Buchliste, Leere-Liste-Platzhalter', () => {
      zeige(LESESTATUS.filter((s) => s.id !== 'ungelesen').map((s) => buch(`Buch ${s.bezeichnung}`, s.id)));
      expect(within(abschnitt()).queryAllByRole('listitem')).toHaveLength(0);
      expect(abschnitt().querySelector('[data-leere-liste]')).not.toBeNull();
    });
  });
});
