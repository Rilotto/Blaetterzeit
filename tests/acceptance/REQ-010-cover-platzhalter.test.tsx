/**
 * Akzeptanztests REQ-010 – Cover-Platzhalter (Herz).
 *
 * Abgeleitet aus dem REQ-Text und der verbindlichen Schnittstellen-Absprache in
 * sprints/sprint-02/plan.md, Abschnitt „REQ-005 bis REQ-012 (Seite „Bücher“), Runde 1“:
 *  - Element mit data-cover-platzhalter, darin ein Icon-Element mit data-icon="icon-herz.png"
 *  - genau eine wiederverwendbare Komponente src/components/CoverPlatzhalter.tsx
 *  - Bucheintrag: <li> mit <img alt> oder Platzhalter und Titel-Element data-buchtitel
 *  - Farben per var(--bz-farbe-<id>): Fläche ghost, Herz primaer
 */
import '@testing-library/jest-dom/vitest';
import { cleanup, render, screen, within } from '@testing-library/react';
import type { CSSProperties } from 'react';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import BuecherAnsicht from '@/views/BuecherAnsicht';
import type { Buch } from '@/domain/buch';
import { farbrubriken, farbVariablen } from '@/theme';

type Bytes = Uint8Array & { equals(o: Uint8Array): boolean };
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
const ROOT = pathToFileURL(`${cwd()}/`);
const SRC = new URL('src/', ROOT);
const HERZ_REF = new URL('docs/requirements/referenzen/icons/icon-herz.png', ROOT);
function walk(dir: URL): URL[] {
  if (!fs.existsSync(dir)) return [];
  const out: URL[] = [];
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (e.isDirectory()) out.push(...walk(new URL(`${e.name}/`, dir)));
    else out.push(new URL(e.name, dir));
  }
  return out;
}

const ABSCHNITT = 'Noch zu lesen';
const HERZ = 'icon-herz.png';
const rubriken = farbrubriken as unknown as Record<string, { wert: string } | undefined>;
const COVER_A = `data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="200" height="300"><rect width="200" height="300"/></svg>')}`;
const COVER_B = `data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="300" height="200"><circle r="50"/></svg>')}`;

let n = 0;
function buch(titel: string, cover?: string): Buch {
  n++;
  const b: Buch = { id: `00000000-0000-4000-8000-${String(n).padStart(12, '0')}`, titel, status: 'ungelesen' };
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
const eintraege = () => within(within(abschnitt()).getByRole('list', { name: ABSCHNITT })).getAllByRole('listitem');
const eintragVon = (titel: string) =>
  eintraege().find((li) => li.querySelector('[data-buchtitel]')?.textContent?.trim() === titel)!;
function platzhalter(li: HTMLElement) {
  const p = li.querySelectorAll<HTMLElement>('[data-cover-platzhalter]');
  expect(p, 'genau ein Cover-Platzhalter').toHaveLength(1);
  return p[0];
}
function herz(el: HTMLElement) {
  const i = el.querySelectorAll<HTMLElement>('[data-icon]');
  expect(i, 'genau ein Icon').toHaveLength(1);
  return i[0];
}
function px(v: string) {
  const m = /^(-?[\d.]+)(px|rem)$/.exec((v ?? '').trim());
  if (!m) return NaN;
  return m[2] === 'rem' ? Number(m[1]) * 16 : Number(m[1]);
}
function coverFlaeche(start: HTMLElement, grenze: HTMLElement) {
  for (let e: HTMLElement | null = start; e && e !== grenze; e = e.parentElement) {
    const cs = getComputedStyle(e);
    if (Number.isFinite(px(cs.width)) && Number.isFinite(px(cs.height))) return e;
  }
  throw new Error('keine Coverfläche mit fester Breite und Höhe gefunden');
}
function masse(el: HTMLElement) {
  const cs = getComputedStyle(el);
  const bb = cs.boxSizing === 'border-box';
  return {
    breite: px(cs.width) + (bb ? 0 : (px(cs.borderLeftWidth) || 0) + (px(cs.borderRightWidth) || 0)),
    hoehe: px(cs.height) + (bb ? 0 : (px(cs.borderTopWidth) || 0) + (px(cs.borderBottomWidth) || 0)),
  };
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
  expect(r, `Farbrubrik "${id}" fehlt`).toBeTruthy();
  return berechneteFarbe(ctx, r!.wert);
}
function pruefeFlaeche(el: HTMLElement, id: string, w: HTMLElement, wo: string) {
  const d = inlineDecls(el).find(([p]) => /^background(-color)?$/.test(p));
  expect(d, `${wo}: kein Hintergrund gesetzt`).toBeDefined();
  expect(d![1].replace(/\s+/g, ''), wo).toBe(`var(--bz-farbe-${id})`);
  expect(getComputedStyle(el).backgroundColor, wo).toBe(sollFarbe(w, id));
}
function pruefeIcon(el: HTMLElement, id: string, w: HTMLElement, wo: string) {
  const d = inlineDecls(el).find(([p]) => /^(background(-color)?|color)$/.test(p));
  expect(d, `${wo}: keine Icon-Farbe`).toBeDefined();
  expect(d![1].replace(/\s+/g, ''), wo).toBe(`var(--bz-farbe-${id})`);
  const cs = getComputedStyle(el);
  expect([cs.backgroundColor, cs.color], wo).toContain(sollFarbe(w, id));
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
afterEach(() => cleanup());

// ===========================================================================
describe('REQ-010 Cover-Platzhalter (Herz)', () => {
  // ---------------------------------------------------------------- AK-1
  describe('AK-1 Platzhalter statt Cover', () => {
    it('[REQ-010/AK-1] Buch ohne Cover: Eintrag zeigt Platzhalterfläche mit Herz-Icon und darunter den echten Titel', () => {
      zeige([buch('Alchemised')]);
      const li = eintragVon('Alchemised');
      const p = platzhalter(li);
      expect(herz(p)).toHaveAttribute('data-icon', HERZ);
      const t = li.querySelector<HTMLElement>('[data-buchtitel]')!;
      expect(t.textContent?.trim()).toBe('Alchemised');
      expect(p.compareDocumentPosition(t) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
      expect(p.contains(t)).toBe(false);
    });

    it('[REQ-010/AK-1] der Titel unter dem Platzhalter ist genauso dargestellt wie unter einem Cover', () => {
      zeige([buch('Ohne'), buch('Mit', COVER_A)]);
      const ohne = eintragVon('Ohne').querySelector('[data-buchtitel]')!;
      const mit = eintragVon('Mit').querySelector('[data-buchtitel]')!;
      expect(ohne.tagName).toBe(mit.tagName);
      expect(ohne.getAttribute('style')).toBe(mit.getAttribute('style'));
    });

    it('[REQ-010/AK-1] Gegenprobe: ein Buch mit Cover zeigt keinen Platzhalter', () => {
      zeige([buch('Mit', COVER_A)]);
      expect(eintragVon('Mit').querySelector('[data-cover-platzhalter]')).toBeNull();
    });

    it('[REQ-010/AK-1] Grenzfall: leere Zeichenkette als Cover gilt als „kein Cover“', () => {
      zeige([{ ...buch('Leer'), cover: '' }]);
      const li = eintragVon('Leer');
      expect(li.querySelector('img')).toBeNull();
      platzhalter(li);
    });
  });

  // ---------------------------------------------------------------- AK-2
  describe('AK-2 Gleiche Abmessungen wie ein Cover', () => {
    it('[REQ-010/AK-2] Platzhalterfläche und Coverfläche nebeneinander haben dieselbe Breite und Höhe', () => {
      zeige([buch('Mit', COVER_A), buch('Ohne'), buch('Mit quer', COVER_B)]);
      const ul = within(abschnitt()).getByRole('list');
      const m = ['Mit', 'Ohne', 'Mit quer'].map((t) => {
        const li = eintragVon(t);
        const start = li.querySelector<HTMLElement>('img, [data-cover-platzhalter]')!;
        return masse(coverFlaeche(start, ul));
      });
      expect(m[0].breite).toBeGreaterThan(0);
      expect(m[1]).toEqual(m[0]);
      expect(m[2]).toEqual(m[0]);
    });
  });

  // ---------------------------------------------------------------- AK-3
  describe('AK-3 Kein fremdes oder generiertes Bild', () => {
    it('[REQ-010/AK-3] der Eintrag ohne Cover enthält kein Bild, kein Canvas, kein SVG und keinen Verweis auf fremde Cover', () => {
      zeige([buch('Mit A', COVER_A), buch('Ohne'), buch('Mit B', COVER_B)]);
      const li = eintragVon('Ohne');
      expect(li.querySelectorAll('img, canvas, svg, picture, video, object, iframe')).toHaveLength(0);
      const html = li.outerHTML;
      for (const c of [COVER_A, COVER_B]) {
        expect(html).not.toContain(c);
        expect(html).not.toContain(encodeURIComponent(c).slice(0, 40));
      }
    });

    it('[REQ-010/AK-3] Bildquellen im Eintrag ohne Cover verweisen nur auf das Herz-Icon', () => {
      zeige([buch('Mit A', COVER_A), buch('Ohne')]);
      const li = eintragVon('Ohne');
      const urls = [li, ...Array.from(li.querySelectorAll<HTMLElement>('*'))].flatMap((e) =>
        [...(e.getAttribute('style') ?? '').matchAll(/url\(\s*['"]?([^'")]+)['"]?\s*\)/g)].map((m) => decodeURIComponent(m[1])),
      );
      for (const u of urls) {
        if (u.startsWith('data:')) expect(u, 'eingebettetes Bild im Platzhalter').toMatch(/^data:image\/png/);
        else expect(u).toContain('icon-herz');
      }
      // keine Bildquelle an der Fläche selbst (nur am Icon)
      const p = platzhalter(li);
      expect(p.getAttribute('style') ?? '').not.toMatch(/url\(/);
    });

    it('[REQ-010/AK-3] alle Platzhalter sind identisch, unabhängig vom Buch (nichts aus Titel/ID generiert)', () => {
      zeige([buch('Erstes Buch'), buch('Ein ganz anderes Buch'), buch('X')]);
      const html = eintraege().map((li) => platzhalter(li).outerHTML);
      expect(new Set(html).size).toBe(1);
    });
  });

  // ---------------------------------------------------------------- AK-4
  describe('AK-4 Nur das Herz-Icon des CEO', () => {
    it('[REQ-010/AK-4] das Icon verweist auf icon-herz.png', () => {
      zeige([buch('Ohne')]);
      const i = herz(platzhalter(eintragVon('Ohne')));
      expect(i).toHaveAttribute('data-icon', HERZ);
      const urls = [...(i.getAttribute('style') ?? '').matchAll(/url\(\s*['"]?([^'")]+)['"]?\s*\)/g)].map((m) => decodeURIComponent(m[1]));
      expect(urls.length, 'Icon braucht eine Bildquelle (Maske)').toBeGreaterThan(0);
      for (const u of urls) if (!u.startsWith('data:')) expect(u).toContain('icon-herz');
    });

    it('[REQ-010/AK-4] jede Datei icon-herz.png unter src/ ist byte-identisch mit der Datei des CEO', () => {
      const ref = fs.readFileSync(HERZ_REF);
      const kopien = walk(SRC).filter((f) => f.pathname.endsWith(`/${HERZ}`));
      expect(kopien.length, 'keine Kopie unter src/').toBeGreaterThan(0);
      for (const k of kopien) expect(fs.readFileSync(k).equals(ref), k.pathname).toBe(true);
    });

    it('[REQ-010/AK-4] kein Inline-SVG und keine Icon-Bibliothek im Platzhalter', () => {
      zeige([buch('Ohne')]);
      expect(platzhalter(eintragVon('Ohne')).querySelectorAll('svg, img, i[class]')).toHaveLength(0);
      const pkg = JSON.parse(fs.readFileSync(new URL('package.json', ROOT), 'utf8')) as {
        dependencies?: Record<string, string>;
        devDependencies?: Record<string, string>;
      };
      expect(
        Object.keys({ ...pkg.dependencies, ...pkg.devDependencies }).filter((d) =>
          /icon|lucide|fortawesome|heroicons|phosphor|feather|iconify|material-symbols|remixicon/i.test(d),
        ),
      ).toEqual([]);
    });

    it('[REQ-010/AK-4] der Platzhalter ist genau eine wiederverwendbare Komponente (src/components/CoverPlatzhalter.tsx)', () => {
      expect(fs.existsSync(new URL('components/CoverPlatzhalter.tsx', SRC))).toBe(true);
      const andere = walk(SRC)
        .filter((f) => /\.tsx?$/.test(f.pathname) && !f.pathname.endsWith('/components/CoverPlatzhalter.tsx'))
        .filter((f) => /data-cover-platzhalter/.test(fs.readFileSync(f, 'utf8')))
        .map((f) => f.pathname.slice(SRC.pathname.length));
      expect(andere, 'Platzhalter mehrfach implementiert').toEqual([]);
    });
  });

  // ---------------------------------------------------------------- AK-5
  describe('AK-5 Farben: Fläche Ghost, Herz Primär', () => {
    it('[REQ-010/AK-5] Fläche in „Ghost“, Herz-Icon in „Primär“', () => {
      const w = zeige([buch('Ohne')]);
      const p = platzhalter(eintragVon('Ohne'));
      pruefeFlaeche(p, 'ghost', w, 'Platzhalterfläche');
      pruefeIcon(herz(p), 'primaer', w, 'Herz-Icon');
    });

    it('[REQ-010/AK-5] das Herz wird von der App eingefärbt (Maske), nicht als fertiges Bild gezeigt', () => {
      zeige([buch('Ohne')]);
      const stil = herz(platzhalter(eintragVon('Ohne'))).getAttribute('style') ?? '';
      expect(stil).toMatch(/mask/);
    });
  });

  // ---------------------------------------------------------------- AK-6
  describe('AK-6 Farben aus zentralen Farbrubriken', () => {
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
    it('[REQ-010/AK-6] Änderung von „Ghost“ an zentraler Stelle wirkt auf die Fläche', () => {
      mitGeaenderterRubrik('ghost', (neu, alt) => {
        const w = zeige([buch('Ohne')]);
        const bg = getComputedStyle(platzhalter(eintragVon('Ohne'))).backgroundColor;
        expect(bg).toBe(berechneteFarbe(w, neu));
        expect(bg).not.toBe(berechneteFarbe(w, alt));
      });
    });

    it('[REQ-010/AK-6] Änderung von „Primär“ an zentraler Stelle wirkt auf das Herz-Icon', () => {
      mitGeaenderterRubrik('primaer', (neu, alt) => {
        const w = zeige([buch('Ohne')]);
        const cs = getComputedStyle(herz(platzhalter(eintragVon('Ohne'))));
        expect([cs.backgroundColor, cs.color]).toContain(berechneteFarbe(w, neu));
        expect([cs.backgroundColor, cs.color]).not.toContain(berechneteFarbe(w, alt));
      });
    });

    it('[REQ-010/AK-6] Gegenprobe: Änderung von „Tertiär“ lässt Fläche und Herz unverändert', () => {
      zeige([buch('Ohne')]);
      const p = platzhalter(eintragVon('Ohne'));
      const vorher = [getComputedStyle(p).backgroundColor, getComputedStyle(herz(p)).backgroundColor];
      cleanup();
      mitGeaenderterRubrik('tertiaer', () => {
        zeige([buch('Ohne')]);
        const q = platzhalter(eintragVon('Ohne'));
        expect([getComputedStyle(q).backgroundColor, getComputedStyle(herz(q)).backgroundColor]).toEqual(vorher);
      });
    });
  });
});
