/**
 * Akzeptanztests REQ-005 – Seite „Bücher“: Kopfbereich mit Überschrift und zwei runden Schaltflächen.
 *
 * Abgeleitet aus dem REQ-Text und der verbindlichen Schnittstellen-Absprache in
 * sprints/sprint-02/plan.md, Abschnitt „REQ-005 bis REQ-012 (Seite „Bücher“), Runde 1“:
 *  - src/views/BuecherAnsicht.tsx (Default-Export), optionale Props { filter?, buecher? }
 *  - <h1> „Deine Bücher“
 *  - <button aria-label="Filter und Einstellungen"> und <button aria-label="Buch hinzufügen">
 *  - je Button ein Icon-Element mit data-icon="icon-regler.png" bzw. "icon-plus.png",
 *    Dateien in src/assets/icons/, eingefärbt wie die Navigations-Icons
 *  - Farben per Inline-Style var(--bz-farbe-<id>), Werte nur in src/theme/farben.ts
 *
 * Keine Hexwerte im Test: Sollfarben kommen aus der zentralen Definition (@/theme).
 * jsdom hat kein Layout: Position „links/rechts“, Größe und Optik prüft der CEO
 * im Prototyp (manuelle Prüfliste im Testbericht sprints/sprint-02/testbericht.md).
 */
import '@testing-library/jest-dom/vitest';
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import type { CSSProperties } from 'react';
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import App from '@/App';
import BuecherAnsicht from '@/views/BuecherAnsicht';
import { farbrubriken, farbVariablen } from '@/theme';

// ---------------------------------------------------------------------------
// Dateisystem (dynamisch und minimal typisiert, wie in REQ-002/003/004)
// ---------------------------------------------------------------------------
type Bytes = Uint8Array & {
  equals(o: Uint8Array): boolean;
  readUInt32BE(o: number): number;
  subarray(a: number, b?: number): Bytes;
  toString(enc: string, a?: number, b?: number): string;
};
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
const NODE_ZLIB = 'node:zlib';
const fs = (await import(/* @vite-ignore */ NODE_FS)) as FsLike;
const { pathToFileURL } = (await import(/* @vite-ignore */ NODE_URL)) as { pathToFileURL(p: string): URL };
const { cwd } = (await import(/* @vite-ignore */ NODE_PROCESS)) as { cwd(): string };
const zlib = (await import(/* @vite-ignore */ NODE_ZLIB)) as { inflateSync(b: Uint8Array): Uint8Array };

const ROOT = pathToFileURL(`${cwd()}/`);
const SRC = new URL('src/', ROOT);
const ICONS = new URL('src/assets/icons/', ROOT);
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

// ---------------------------------------------------------------------------
// Erwartung laut REQ-005 / Absprache
// ---------------------------------------------------------------------------
const UEBERSCHRIFT = 'Deine Bücher';
const FILTER_BTN = 'Filter und Einstellungen';
const PLUS_BTN = 'Buch hinzufügen';
const ICON_REGLER = 'icon-regler.png';
const ICON_PLUS = 'icon-plus.png';
const PLACEHOLDER = 'under construction :)';
const FARB_LITERAL =
  /#[0-9a-f]{3,8}\b|\b(?:rgba?|hsla?|hwb|oklch|oklab|lab|lch|color)\(|\b(?:black|white|red|green|blue|gray|grey|silver|maroon|brown|beige|ivory|navy|purple|orange|yellow|pink|tan|wheat|linen|khaki)\b/i;

const rubriken = farbrubriken as unknown as Record<string, { wert: string } | undefined>;

// ---------------------------------------------------------------------------
// Hilfsfunktionen
// ---------------------------------------------------------------------------
function zeige() {
  const { container } = render(
    <div data-testwurzel="" style={farbVariablen() as CSSProperties}>
      <BuecherAnsicht />
    </div>,
  );
  return container.firstElementChild as HTMLElement;
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
const varRef = (id: string) => new RegExp(`var\\(\\s*--bz-farbe-${id}\\s*\\)`);
type Art = 'text' | 'hintergrund' | 'rahmen' | 'icon';
const EIGENSCHAFTEN: Record<Art, RegExp> = {
  text: /^color$/,
  hintergrund: /^background(-color)?$/,
  rahmen: /^border(-(top|right|bottom|left))?(-color)?$/,
  icon: /^(background(-color)?|color)$/,
};
/** Prüft: Element bezieht die Farbe der Rolle `art` per var(--bz-farbe-<id>) und zeigt den Rubrikwert. */
function pruefeFarbe(el: HTMLElement, art: Art, id: string, wurzel: HTMLElement, wo: string) {
  // Quelle: bei Text darf die Farbe vom nächsten Vorfahren innerhalb der Ansicht geerbt sein.
  let quelle: [string, string] | undefined;
  for (let n: HTMLElement | null = el; n && n !== wurzel; n = n.parentElement) {
    quelle = inlineDecls(n).find(([p, v]) => EIGENSCHAFTEN[art].test(p) && /var\(/.test(v));
    if (quelle || art !== 'text') break;
  }
  expect(quelle, `${wo}: keine Farbe per var(--bz-farbe-…) gesetzt (${art})`).toBeDefined();
  expect(quelle![1], `${wo}: ${quelle![0]}`).toMatch(varRef(id));
  expect(quelle![1], `${wo}: Ausweichwert in var()`).not.toMatch(/var\([^)]*,/);
  expect(quelle![1].replace(/var\([^)]*\)/g, ''), `${wo}: zusätzlicher Farbwert`).not.toMatch(FARB_LITERAL);
  const cs = getComputedStyle(el);
  const ist =
    art === 'text'
      ? [cs.color]
      : art === 'hintergrund'
        ? [cs.backgroundColor]
        : art === 'rahmen'
          ? [cs.borderTopColor]
          : [cs.backgroundColor, cs.color];
  expect(ist, `${wo}: dargestellte Farbe (${art})`).toContain(sollFarbe(wurzel, id));
}
function textElement(root: HTMLElement, text: string) {
  const k = [root, ...Array.from(root.querySelectorAll<HTMLElement>('*'))].filter(
    (e) => e.textContent?.trim() === text,
  );
  expect(k.length, `kein Element mit Text "${text}"`).toBeGreaterThan(0);
  return k.find((c) => !k.some((o) => o !== c && c.contains(o)))!;
}
function px(v: string) {
  const m = /^(-?[\d.]+)(px|rem)$/.exec(v.trim());
  if (!m) return NaN;
  return m[2] === 'rem' ? Number(m[1]) * 16 : Number(m[1]);
}
function icon(btn: HTMLElement) {
  const icons = btn.querySelectorAll<HTMLElement>('[data-icon]');
  expect(icons, `"${btn.getAttribute('aria-label')}" braucht genau ein Icon-Element`).toHaveLength(1);
  return icons[0];
}
const filterBtn = () => screen.getByRole('button', { name: FILTER_BTN });
const plusBtn = () => screen.getByRole('button', { name: PLUS_BTN });
const ueberschrift = () => screen.getByRole('heading', { level: 1, name: UEBERSCHRIFT });

function tapMenue(label: string) {
  const nav = screen.getByRole('navigation', { name: 'Hauptnavigation' });
  fireEvent.click(within(nav).getByRole('button', { name: label }));
}

/** Minimaler PNG-Dekoder (8 bit, ohne Interlacing) für AK-9. */
function dekodierePng(b: Bytes) {
  expect(b.toString('latin1', 1, 4), 'keine PNG-Datei').toBe('PNG');
  const w = b.readUInt32BE(16);
  const h = b.readUInt32BE(20);
  const tiefe = b[24];
  const farbtyp = b[25];
  const interlace = b[28];
  const teile: Uint8Array[] = [];
  for (let off = 8; off < b.length; ) {
    const len = b.readUInt32BE(off);
    if (b.toString('latin1', off + 4, off + 8) === 'IDAT') teile.push(b.subarray(off + 8, off + 8 + len));
    off += 12 + len;
  }
  const gesamt = new Uint8Array(teile.reduce((s, t) => s + t.length, 0));
  let o = 0;
  for (const t of teile) {
    gesamt.set(t, o);
    o += t.length;
  }
  const kanaele = ({ 0: 1, 2: 3, 4: 2, 6: 4 } as Record<number, number>)[farbtyp] ?? 0;
  const px = new Uint8Array(w * h * kanaele);
  if (tiefe === 8 && interlace === 0 && kanaele > 0) {
    const raw = zlib.inflateSync(gesamt);
    const zeile = w * kanaele;
    let p = 0;
    for (let y = 0; y < h; y++) {
      const f = raw[p++];
      for (let x = 0; x < zeile; x++) {
        const i = y * zeile + x;
        const a = x >= kanaele ? px[i - kanaele] : 0;
        const u = y ? px[i - zeile] : 0;
        const c = y && x >= kanaele ? px[i - zeile - kanaele] : 0;
        let v = raw[p++];
        if (f === 1) v += a;
        else if (f === 2) v += u;
        else if (f === 3) v += (a + u) >> 1;
        else if (f === 4) {
          const q = a + u - c;
          const pa = Math.abs(q - a);
          const pb = Math.abs(q - u);
          const pc = Math.abs(q - c);
          v += pa <= pb && pa <= pc ? a : pb <= pc ? u : c;
        }
        px[i] = v & 255;
      }
    }
  }
  return { w, h, tiefe, farbtyp, interlace, px };
}

// CSS-Dateien aus src/ einhängen, damit Festlegungen dort nicht übersehen werden.
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
});

// ===========================================================================
describe('REQ-005 Seite „Bücher“ – Kopfbereich', () => {
  // ---------------------------------------------------------------- AK-1
  describe('AK-1 Seite „Bücher“ beim aktiven Menüpunkt „Bücher“', () => {
    it('[REQ-005/AK-1] nach Antippen von „Bücher“ zeigt der Inhaltsbereich die Überschrift „Deine Bücher“', () => {
      render(<App />);
      tapMenue('Bücher');
      const main = screen.getByRole('main');
      expect(within(main).getByRole('heading', { level: 1, name: UEBERSCHRIFT })).toBeVisible();
    });

    it('[REQ-005/AK-1] die Seite „Bücher“ steht im Inhaltsbereich und nicht in der Hauptnavigation', () => {
      render(<App />);
      tapMenue('Bücher');
      const main = screen.getByRole('main');
      const nav = screen.getByRole('navigation', { name: 'Hauptnavigation' });
      expect(main.contains(ueberschrift())).toBe(true);
      expect(nav.contains(ueberschrift())).toBe(false);
      expect(within(main).getByRole('button', { name: FILTER_BTN })).toBeInTheDocument();
      expect(within(main).getByRole('button', { name: PLUS_BTN })).toBeInTheDocument();
    });

    it('[REQ-005/AK-1] Negativfall: bei anderen Menüpunkten erscheint die Seite „Bücher“ nicht', () => {
      render(<App />);
      for (const l of ['Start', 'Bibliothek', 'Statistik', 'Profil']) {
        tapMenue(l);
        expect(screen.queryByRole('heading', { name: UEBERSCHRIFT }), `bei aktivem "${l}"`).toBeNull();
      }
    });

    it('[REQ-005/AK-1] nach Wechsel weg und zurück zu „Bücher“ ist die Seite wieder da', () => {
      render(<App />);
      tapMenue('Bücher');
      tapMenue('Profil');
      tapMenue('Bücher');
      expect(ueberschrift()).toBeVisible();
    });
  });

  // ---------------------------------------------------------------- AK-2
  describe('AK-2 Überschrift links im oberen Bereich', () => {
    it('[REQ-005/AK-2] es gibt genau eine Überschrift erster Ebene mit genau dem Text „Deine Bücher“', () => {
      zeige();
      const h1s = screen.getAllByRole('heading', { level: 1 });
      expect(h1s).toHaveLength(1);
      expect(h1s[0].textContent?.trim()).toBe(UEBERSCHRIFT);
    });

    it('[REQ-005/AK-2] die Überschrift steht vor (links von) den beiden Schaltflächen und ganz oben in der Ansicht', () => {
      const w = zeige();
      const h1 = ueberschrift();
      for (const b of [filterBtn(), plusBtn()]) {
        expect(h1.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
      }
      // Vor der Überschrift steht kein sichtbarer Inhalt der Ansicht.
      const davor = Array.from(w.querySelectorAll<HTMLElement>('*')).filter(
        (e) => !e.contains(h1) && e.compareDocumentPosition(h1) & Node.DOCUMENT_POSITION_FOLLOWING,
      );
      expect(davor.map((e) => e.textContent?.trim()).filter(Boolean)).toEqual([]);
    });
  });

  // ---------------------------------------------------------------- AK-3
  describe('AK-3 Zwei Schaltflächen rechts neben der Überschrift in fester Reihenfolge', () => {
    it('[REQ-005/AK-3] zwischen Überschrift und Filterleiste stehen genau zwei Schaltflächen: erst Filter/Einstellungen, dann Plus', () => {
      const w = zeige();
      const h1 = ueberschrift();
      const leiste = screen.getByRole('group', { name: 'Filter' });
      const kopfButtons = Array.from(w.querySelectorAll<HTMLElement>('button')).filter(
        (b) =>
          !leiste.contains(b) &&
          h1.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING &&
          b.compareDocumentPosition(leiste) & Node.DOCUMENT_POSITION_FOLLOWING,
      );
      expect(kopfButtons.map((b) => b.getAttribute('aria-label'))).toEqual([FILTER_BTN, PLUS_BTN]);
    });

    it('[REQ-005/AK-3] jede der beiden Schaltflächen gibt es genau einmal', () => {
      zeige();
      expect(screen.getAllByRole('button', { name: FILTER_BTN })).toHaveLength(1);
      expect(screen.getAllByRole('button', { name: PLUS_BTN })).toHaveLength(1);
    });
  });

  // ---------------------------------------------------------------- AK-4
  describe('AK-4 Filter-/Einstellungen-Schaltfläche', () => {
    it('[REQ-005/AK-4] ist kreisförmig (Breite = Höhe, Eckenradius mindestens halbe Breite)', () => {
      zeige();
      const cs = getComputedStyle(filterBtn());
      expect(px(cs.width), 'Breite in px/rem').toBeGreaterThan(0);
      expect(px(cs.height)).toBe(px(cs.width));
      const r = cs.borderTopLeftRadius || cs.borderRadius;
      expect(r === '50%' || px(r) >= px(cs.width) / 2, `Eckenradius ${r}`).toBe(true);
      for (const ecke of ['borderTopRightRadius', 'borderBottomLeftRadius', 'borderBottomRightRadius'] as const) {
        expect(cs[ecke] || cs.borderRadius).toBe(r);
      }
    });

    it('[REQ-005/AK-4] hat einen sichtbaren Rahmen in der Farbrubrik „Tertiär“', () => {
      const w = zeige();
      const btn = filterBtn();
      const cs = getComputedStyle(btn);
      expect(cs.borderTopStyle, 'Rahmenstil').not.toMatch(/^(none|hidden|)$/);
      expect(px(cs.borderTopWidth), 'Rahmenbreite').toBeGreaterThan(0);
      pruefeFarbe(btn, 'rahmen', 'tertiaer', w, 'Rahmen Filter-/Einstellungen');
    });

    it('[REQ-005/AK-4] enthält das Regler-Icon in der Farbrubrik „Tertiär“', () => {
      const w = zeige();
      const i = icon(filterBtn());
      expect(i).toHaveAttribute('data-icon', ICON_REGLER);
      pruefeFarbe(i, 'icon', 'tertiaer', w, 'Regler-Icon');
    });

    it('[REQ-005/AK-4] Hintergrund in der Farbrubrik „Hintergrund“', () => {
      const w = zeige();
      pruefeFarbe(filterBtn(), 'hintergrund', 'hintergrund', w, 'Hintergrund Filter-/Einstellungen');
    });
  });

  // ---------------------------------------------------------------- AK-5
  describe('AK-5 Plus-Schaltfläche', () => {
    it('[REQ-005/AK-5] ist kreisförmig (Breite = Höhe, Eckenradius mindestens halbe Breite)', () => {
      zeige();
      const cs = getComputedStyle(plusBtn());
      expect(px(cs.width)).toBeGreaterThan(0);
      expect(px(cs.height)).toBe(px(cs.width));
      const r = cs.borderTopLeftRadius || cs.borderRadius;
      expect(r === '50%' || px(r) >= px(cs.width) / 2, `Eckenradius ${r}`).toBe(true);
    });

    it('[REQ-005/AK-5] enthält mittig das Plus-Icon (Inhalt horizontal und vertikal zentriert)', () => {
      zeige();
      const btn = plusBtn();
      expect(icon(btn)).toHaveAttribute('data-icon', ICON_PLUS);
      const cs = getComputedStyle(btn);
      const zentriert =
        (/flex|grid/.test(cs.display) &&
          (cs.alignItems === 'center' || /center/.test(cs.placeItems)) &&
          (cs.justifyContent === 'center' || /center/.test(cs.placeItems) || /center/.test(cs.justifyItems))) ||
        /center/.test(cs.placeContent);
      expect(zentriert, `display=${cs.display} align=${cs.alignItems} justify=${cs.justifyContent}`).toBe(true);
      expect(btn.textContent?.trim(), 'kein zusätzlicher Text, z. B. "+"').toBe('');
    });

    it('[REQ-005/AK-5] Hintergrund in „Primär“, Plus-Icon in „Hintergrund“', () => {
      const w = zeige();
      const btn = plusBtn();
      pruefeFarbe(btn, 'hintergrund', 'primaer', w, 'Hintergrund Plus');
      pruefeFarbe(icon(btn), 'icon', 'hintergrund', w, 'Plus-Icon');
    });
  });

  // ---------------------------------------------------------------- AK-6
  describe('AK-6 Beide Schaltflächen gleich groß', () => {
    it('[REQ-005/AK-6] beide haben denselben Durchmesser', () => {
      zeige();
      const a = getComputedStyle(filterBtn());
      const b = getComputedStyle(plusBtn());
      expect(px(a.width)).toBeGreaterThan(0);
      expect(px(b.width)).toBe(px(a.width));
      expect(px(b.height)).toBe(px(a.height));
    });

    it('[REQ-005/AK-6] Rahmen und box-sizing verändern die Außenmaße nicht unterschiedlich', () => {
      // Negativfall: Filterknopf mit Rahmen und content-box wäre um 2× Rahmenbreite größer.
      zeige();
      const a = getComputedStyle(filterBtn());
      const b = getComputedStyle(plusBtn());
      const aussen = (cs: CSSStyleDeclaration) => {
        const rand = (px(cs.borderTopWidth) || 0) * 2;
        return cs.boxSizing === 'border-box' ? px(cs.width) : px(cs.width) + rand;
      };
      expect(aussen(b)).toBe(aussen(a));
    });
  });

  // ---------------------------------------------------------------- AK-7
  describe('AK-7 Überschrift in der Farbrubrik Tertiär', () => {
    it('[REQ-005/AK-7] „Deine Bücher“ ist in der Farbrubrik „Tertiär“ dargestellt', () => {
      const w = zeige();
      pruefeFarbe(textElement(ueberschrift(), UEBERSCHRIFT), 'text', 'tertiaer', w, 'Überschrift');
    });

    it('[REQ-005/AK-7] dieselbe Farbe wie die Inaktivfarbe der Hauptnavigation (App-Kontext)', () => {
      const { container } = render(<App />);
      tapMenue('Bücher');
      const root = container.firstElementChild as HTMLElement;
      expect(getComputedStyle(ueberschrift()).color).toBe(berechneteFarbe(root, 'var(--bz-nav-inaktivfarbe)'));
    });
  });

  // ---------------------------------------------------------------- AK-8
  describe('AK-8 Farben stammen aus den zentralen Farbrubriken', () => {
    /** Ändert den Wert einer Rubrik an der zentralen Stelle (farbrubriken) für die Dauer von `fn`. */
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
    const FAELLE: [string, string, () => HTMLElement, Art][] = [
      ['tertiaer', 'Überschrift', () => textElement(ueberschrift(), UEBERSCHRIFT), 'text'],
      ['tertiaer', 'Rahmen Filterknopf', filterBtn, 'rahmen'],
      ['tertiaer', 'Regler-Icon', () => icon(filterBtn()), 'icon'],
      ['hintergrund', 'Hintergrund Filterknopf', filterBtn, 'hintergrund'],
      ['hintergrund', 'Plus-Icon', () => icon(plusBtn()), 'icon'],
      ['primaer', 'Hintergrund Plusknopf', plusBtn, 'hintergrund'],
    ];
    it.each(FAELLE)(
      '[REQ-005/AK-8] Änderung der Rubrik „%s“ an zentraler Stelle wirkt auf: %s',
      (id, wo, finde, art) => {
        mitGeaenderterRubrik(id, (neu, alt) => {
          const w = zeige();
          const el = finde();
          const cs = getComputedStyle(el);
          const ist =
            art === 'text'
              ? [cs.color]
              : art === 'hintergrund'
                ? [cs.backgroundColor]
                : art === 'rahmen'
                  ? [cs.borderTopColor]
                  : [cs.backgroundColor, cs.color];
          expect(ist, `${wo}: neuer Wert`).toContain(berechneteFarbe(w, neu));
          expect(ist, `${wo}: alter Wert`).not.toContain(berechneteFarbe(w, alt));
        });
      },
    );

    it('[REQ-005/AK-8] kein Element des Kopfbereichs hat einen eigenen Farbwert (kein Farbliteral im Inline-Style)', () => {
      zeige();
      const elemente = [ueberschrift(), filterBtn(), plusBtn()].flatMap((e) => [
        e,
        ...Array.from(e.querySelectorAll<HTMLElement>('*')),
      ]);
      const verstoesse = elemente.flatMap((el) =>
        inlineDecls(el)
          .filter(([p]) => /color|background|border|outline|shadow|fill|stroke/.test(p))
          .filter(([, v]) => FARB_LITERAL.test(v.replace(/url\([^)]*\)/g, '')) || /var\(--[^,)]+,/.test(v))
          .map(([p, v]) => `<${el.tagName.toLowerCase()}> ${p}: ${v}`),
      );
      expect(verstoesse).toEqual([]);
    });

    it('[REQ-005/AK-8] Farbwerte stehen nicht in den Quelldateien der Seite „Bücher“ (nur in src/theme/)', () => {
      const dateien = walk(SRC).filter(
        (f) => /\.(tsx?|css)$/.test(f.pathname) && !f.pathname.includes('/src/theme/'),
      );
      const mitLiteral = dateien
        .filter((f) => /#[0-9a-fA-F]{3,8}\b|\brgba?\(|\bhsla?\(/.test(fs.readFileSync(f, 'utf8')))
        .map((f) => f.pathname.slice(SRC.pathname.length));
      expect(mitLiteral).toEqual([]);
    });
  });

  // ---------------------------------------------------------------- AK-9
  describe('AK-9 Icons nachgebildet und einfärbbar', () => {
    it.each([ICON_REGLER, ICON_PLUS])('[REQ-005/AK-9] %s liegt unter src/assets/icons/', (datei) => {
      expect(fs.existsSync(new URL(datei, ICONS))).toBe(true);
    });

    it.each([ICON_REGLER, ICON_PLUS])(
      '[REQ-005/AK-9] %s ist ein einfarbiges Icon auf transparentem Hintergrund im technischen Format der Navigations-Icons',
      (datei) => {
        const ref = dekodierePng(fs.readFileSync(new URL('icon-haus.png', REF_ICONS)));
        const png = dekodierePng(fs.readFileSync(new URL(datei, ICONS)));
        expect(png.farbtyp, 'RGBA wie die Navigations-Icons').toBe(ref.farbtyp);
        expect(png.tiefe).toBe(ref.tiefe);
        expect(png.interlace).toBe(0);
        expect(png.w, 'quadratisch').toBe(png.h);
        const n = png.w * png.h;
        const farben = new Set<number>();
        let sichtbar = 0;
        for (let i = 0; i < n; i++) {
          if (png.px[i * 4 + 3] > 0) {
            sichtbar++;
            farben.add((png.px[i * 4] << 16) | (png.px[i * 4 + 1] << 8) | png.px[i * 4 + 2]);
          }
        }
        expect(farben.size, 'einfarbig (alle sichtbaren Pixel gleiche Farbe)').toBe(1);
        // transparenter Hintergrund: Ecken durchsichtig, Linien-Icon statt Vollfläche
        for (const i of [0, png.w - 1, n - png.w, n - 1]) expect(png.px[i * 4 + 3], 'Ecke transparent').toBe(0);
        expect(sichtbar / n, 'Anteil sichtbarer Pixel (Linien-Icon)').toBeGreaterThan(0.005);
        expect(sichtbar / n).toBeLessThan(0.6);
      },
    );

    it.each([ICON_REGLER, ICON_PLUS])('[REQ-005/AK-9] %s ist nicht identisch mit einem Navigations-Icon', (datei) => {
      const bytes = fs.readFileSync(new URL(datei, ICONS));
      const fremd = walk(REF_ICONS).filter((r) => fs.readFileSync(r).equals(bytes));
      expect(fremd).toEqual([]);
    });

    it('[REQ-005/AK-9] beide Icons werden von der App über eine Maske in ihrer Farbrolle eingefärbt (kein <img>, kein SVG)', () => {
      zeige();
      for (const [btn, datei] of [
        [filterBtn(), ICON_REGLER],
        [plusBtn(), ICON_PLUS],
      ] as const) {
        expect(btn.querySelectorAll('svg, img'), `${datei}: kein <svg>/<img>`).toHaveLength(0);
        const i = icon(btn);
        const stil = i.getAttribute('style') ?? '';
        const urls = [...stil.matchAll(/url\(\s*['"]?([^'")]+)['"]?\s*\)/g)].map((m) => decodeURIComponent(m[1]));
        expect(urls.length, `${datei}: keine Bildquelle im Style (Maske)`).toBeGreaterThan(0);
        expect(/mask/.test(stil), `${datei}: Einfärbung über mask-image`).toBe(true);
        for (const u of urls) {
          if (!u.startsWith('data:')) expect(u).toContain(datei.replace(/\.png$/, ''));
        }
        expect(stil, `${datei}: Farbe aus Farbrubrik`).toMatch(/var\(\s*--bz-farbe-/);
      }
    });

    it('[REQ-005/AK-9] keine Icon-Bibliothek als Abhängigkeit', () => {
      const pkg = JSON.parse(fs.readFileSync(new URL('package.json', ROOT), 'utf8')) as {
        dependencies?: Record<string, string>;
        devDependencies?: Record<string, string>;
      };
      const deps = Object.keys({ ...pkg.dependencies, ...pkg.devDependencies });
      expect(
        deps.filter((d) => /icon|lucide|fortawesome|heroicons|phosphor|feather|iconify|material-symbols|remixicon/i.test(d)),
      ).toEqual([]);
    });
  });

  // ---------------------------------------------------------------- AK-10
  // Anpassung Sprint 04 (REQ-005 vom 2026-11-10): AK-10 gilt nur noch für die Filter-/Einstellungen-
  // Schaltfläche. Die Wirkung der Plus-Schaltfläche legt REQ-029 fest (Menü „Buch hinzufügen“, „+“↔„×“),
  // deshalb prüfen diese Tests die Plus-Schaltfläche nicht mehr auf „bewirkt nichts“.
  describe('AK-10 Antippen der Filter-/Einstellungen-Schaltfläche bewirkt nichts, kein aktiver Zustand', () => {
    it('[REQ-005/AK-10] die Filter-/Einstellungen-Schaltfläche hat keinen Umschaltzustand (kein aria-pressed/aria-expanded/aria-current)', () => {
      zeige();
      const b = filterBtn();
      expect(b).not.toHaveAttribute('aria-pressed');
      expect(b).not.toHaveAttribute('aria-expanded');
      expect(b).not.toHaveAttribute('aria-current');
      expect(b).not.toHaveAttribute('data-aktiv');
      // Plus-Schaltfläche: im Ruhezustand ebenfalls kein aktiver Zustand (einzige Ausnahme „×“ bei offenem Menü, REQ-029)
      expect(plusBtn()).not.toHaveAttribute('aria-pressed');
      expect(plusBtn()).not.toHaveAttribute('data-aktiv');
    });

    it('[REQ-005/AK-10] Antippen von „Filter und Einstellungen“ ändert in der App nichts (DOM vorher = nachher)', () => {
      render(<App />);
      tapMenue('Bücher');
      const vorher = document.body.innerHTML;
      const btn = filterBtn();
      fireEvent.pointerDown(btn);
      fireEvent.mouseDown(btn);
      fireEvent.pointerUp(btn);
      fireEvent.mouseUp(btn);
      fireEvent.click(btn);
      expect(document.body.innerHTML).toBe(vorher);
    });

    it('[REQ-005/AK-10] mehrfaches Antippen ändert nichts: kein Fenster, Menüpunkt bleibt „Bücher“, Filterleiste unverändert', () => {
      render(<App />);
      tapMenue('Bücher');
      const leiste = screen.getByRole('group', { name: 'Filter' }).innerHTML;
      const vorher = document.body.innerHTML;
      for (let i = 0; i < 3; i++) fireEvent.click(filterBtn());
      expect(document.body.innerHTML).toBe(vorher);
      expect(screen.getByRole('group', { name: 'Filter' }).innerHTML).toBe(leiste);
      const nav = screen.getByRole('navigation', { name: 'Hauptnavigation' });
      expect(within(nav).getByRole('button', { name: 'Bücher' })).toHaveAttribute('aria-current', 'page');
      expect(screen.queryAllByRole('dialog', { hidden: true })).toHaveLength(0);
      expect(screen.queryByRole('menu')).toBeNull();
    });
  });

  // ---------------------------------------------------------------- AK-11
  describe('AK-11 Kein Platzhaltertext „under construction :)“', () => {
    it('[REQ-005/AK-11] die Seite „Bücher“ zeigt „under construction :)“ nicht', () => {
      render(<App />);
      tapMenue('Bücher');
      expect(screen.getByRole('main').textContent).not.toContain(PLACEHOLDER);
      expect(screen.queryByText(PLACEHOLDER)).toBeNull();
    });

    it('[REQ-005/AK-11] auch nicht nach Hin- und Rückwechsel und auch nicht in der Ansicht selbst', () => {
      render(<App />);
      tapMenue('Bücher');
      tapMenue('Start');
      expect(screen.getByRole('main').textContent).toContain(PLACEHOLDER); // Gegenprobe: Start bleibt Platzhalter
      tapMenue('Bücher');
      expect(screen.getByRole('main').textContent).not.toContain(PLACEHOLDER);
      cleanup();
      zeige();
      expect(document.body.textContent).not.toContain(PLACEHOLDER);
    });
  });
});
