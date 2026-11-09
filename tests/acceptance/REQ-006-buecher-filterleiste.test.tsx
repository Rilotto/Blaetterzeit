/**
 * Akzeptanztests REQ-006 – Seite „Bücher“: horizontal wischbare Filterleiste.
 *
 * Abgeleitet aus dem REQ-Text und der verbindlichen Schnittstellen-Absprache in
 * sprints/sprint-02/plan.md, Abschnitt „REQ-005 bis REQ-012 (Seite „Bücher“), Runde 1“:
 *  - Container role="group" aria-label="Filter", darin je Filter ein <button>, sortiert nach `reihenfolge`
 *  - aktiver Filter aria-pressed="true", alle anderen aria-pressed="false"
 *  - Container mit eigenem horizontalem Scrollbereich (Inline-Style overflowX: 'auto')
 *  - Standardfilter („Für dich“) beim Rendern aktiv; Antippen ruft `logik` auf, ohne sichtbare Wirkung
 *  - Konfiguration: src/buecher/filterKonfiguration.ts → filterKonfiguration: FilterDefinition[]
 *  - BuecherAnsicht nimmt optional { filter, buecher }
 *  - Farben per var(--bz-farbe-<id>): tertiaer, hintergrund, ghost, ghostframe, schrifttertiaer
 *
 * Keine Hexwerte im Test. Echtes Wischen, Breiten und Pill-Optik: manuell (Testbericht).
 */
import '@testing-library/jest-dom/vitest';
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import type { CSSProperties } from 'react';
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import App from '@/App';
import BuecherAnsicht from '@/views/BuecherAnsicht';
import { filterKonfiguration } from '@/buecher/filterKonfiguration';
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
const SRC = new URL('src/', pathToFileURL(`${cwd()}/`));
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
type FilterDef = (typeof filterKonfiguration)[number];
const STANDARD_NAMEN = ['Für dich', 'Gerade am Lesen', 'Noch zu lesen'];
const FARB_LITERAL =
  /#[0-9a-f]{3,8}\b|\b(?:rgba?|hsla?|hwb|oklch|oklab|lab|lch|color)\(|\b(?:black|white|red|green|blue|gray|grey|silver|maroon|brown|beige|ivory|navy|purple|orange|yellow|pink|tan|wheat|linen|khaki)\b/i;
const rubriken = farbrubriken as unknown as Record<string, { wert: string } | undefined>;

/** Neuer Filter auf Basis eines bestehenden Eintrags (übernimmt evtl. weitere Pflichtfelder). */
function filter(name: string, reihenfolge: number, extra: Partial<FilterDef> = {}): FilterDef {
  return { ...filterKonfiguration[0], id: `test-${name}`, name, reihenfolge, standard: false, logik: vi.fn(), ...extra };
}
/** Kopie der zentralen Konfiguration mit Spionen als Filterlogik. */
function konfigMitSpionen() {
  return filterKonfiguration.map((f) => ({ ...f, logik: vi.fn() }));
}

function zeige(props: { filter?: FilterDef[] } = {}) {
  const { container } = render(
    <div data-testwurzel="" style={farbVariablen() as CSSProperties}>
      <BuecherAnsicht {...props} />
    </div>,
  );
  return container.firstElementChild as HTMLElement;
}
const leiste = () => screen.getByRole('group', { name: 'Filter' });
const filterButtons = () => within(leiste()).getAllByRole('button');
const namen = () => filterButtons().map((b) => b.textContent?.trim());
const aktive = () => filterButtons().filter((b) => b.getAttribute('aria-pressed') === 'true');
function expectNurAktiv(name: string) {
  for (const b of filterButtons()) {
    expect(b.getAttribute('aria-pressed'), `"${b.textContent}"`).toBe(b.textContent?.trim() === name ? 'true' : 'false');
  }
}
function tapMenue(label: string) {
  const nav = screen.getByRole('navigation', { name: 'Hauptnavigation' });
  fireEvent.click(within(nav).getByRole('button', { name: label }));
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
type Art = 'text' | 'hintergrund' | 'rahmen';
const EIG: Record<Art, RegExp> = {
  text: /^color$/,
  hintergrund: /^background(-color)?$/,
  rahmen: /^border(-(top|right|bottom|left))?(-color)?$/,
};
function istFarbe(el: HTMLElement, art: Art) {
  const cs = getComputedStyle(el);
  return art === 'text' ? cs.color : art === 'hintergrund' ? cs.backgroundColor : cs.borderTopColor;
}
function pruefeFarbe(el: HTMLElement, art: Art, id: string, wurzel: HTMLElement, wo: string) {
  let quelle: [string, string] | undefined;
  for (let n: HTMLElement | null = el; n && n !== wurzel; n = n.parentElement) {
    quelle = inlineDecls(n).find(([p, v]) => EIG[art].test(p) && /var\(/.test(v));
    if (quelle || art !== 'text') break;
  }
  expect(quelle, `${wo}: keine Farbe per var(--bz-farbe-…) gesetzt (${art})`).toBeDefined();
  expect(quelle![1], `${wo}: ${quelle![0]}`).toMatch(new RegExp(`var\\(\\s*--bz-farbe-${id}\\s*\\)`));
  expect(quelle![1], `${wo}: Ausweichwert`).not.toMatch(/var\([^)]*,/);
  expect(quelle![1].replace(/var\([^)]*\)/g, ''), `${wo}: zusätzlicher Farbwert`).not.toMatch(FARB_LITERAL);
  expect(istFarbe(el, art), `${wo}: dargestellte Farbe`).toBe(sollFarbe(wurzel, id));
}
function textElement(root: HTMLElement, text: string) {
  const k = [root, ...Array.from(root.querySelectorAll<HTMLElement>('*'))].filter((e) => e.textContent?.trim() === text);
  return k.find((c) => !k.some((o) => o !== c && c.contains(o)))!;
}
function px(v: string) {
  const m = /^(-?[\d.]+)(px|rem)$/.exec(v.trim());
  if (!m) return NaN;
  return m[2] === 'rem' ? Number(m[1]) * 16 : Number(m[1]);
}
function hatKeinenRahmen(el: HTMLElement) {
  const cs = getComputedStyle(el);
  return (
    /^(none|hidden|)$/.test(cs.borderTopStyle) ||
    px(cs.borderTopWidth) === 0 ||
    cs.borderTopColor === 'transparent' ||
    /rgba\([^)]*,\s*0\)$/.test(cs.borderTopColor)
  );
}
/** Alles außerhalb der Filterleiste als HTML (für „nichts anderes ändert sich“). */
function seiteOhneLeiste(w: HTMLElement) {
  const kopie = w.cloneNode(true) as HTMLElement;
  kopie.querySelector('[role="group"][aria-label="Filter"]')?.remove();
  return kopie.innerHTML;
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
});

// ===========================================================================
describe('REQ-006 Seite „Bücher“ – Filterleiste', () => {
  // ---------------------------------------------------------------- AK-1
  describe('AK-1 Filterleiste direkt unter der Überschrift', () => {
    it('[REQ-006/AK-1] die Filterleiste folgt auf Überschrift und Kopf-Schaltflächen, ohne Inhalt dazwischen', () => {
      const w = zeige();
      const h1 = screen.getByRole('heading', { level: 1, name: 'Deine Bücher' });
      const plus = screen.getByRole('button', { name: 'Buch hinzufügen' });
      const l = leiste();
      expect(h1.compareDocumentPosition(l) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
      expect(plus.compareDocumentPosition(l) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
      // Zwischen Plus-Schaltfläche und Filterleiste: kein Text, kein Bild, keine weitere Schaltfläche
      const dazwischen = Array.from(w.querySelectorAll<HTMLElement>('*')).filter(
        (e) =>
          !e.contains(l) &&
          !e.contains(plus) &&
          !plus.contains(e) &&
          plus.compareDocumentPosition(e) & Node.DOCUMENT_POSITION_FOLLOWING &&
          e.compareDocumentPosition(l) & Node.DOCUMENT_POSITION_FOLLOWING,
      );
      const inhalt = dazwischen.filter(
        (e) => e.textContent?.trim() || e.matches('img,svg,button,[data-icon],h1,h2,h3,ul,section'),
      );
      expect(inhalt.map((e) => e.outerHTML)).toEqual([]);
    });

    it('[REQ-006/AK-1] die Filterleiste gibt es genau einmal und sie enthält weder Überschrift noch Kopf-Schaltflächen', () => {
      zeige();
      expect(screen.getAllByRole('group', { name: 'Filter' })).toHaveLength(1);
      const l = leiste();
      expect(l.contains(screen.getByRole('heading', { level: 1 }))).toBe(false);
      expect(l.contains(screen.getByRole('button', { name: 'Filter und Einstellungen' }))).toBe(false);
    });
  });

  // ---------------------------------------------------------------- AK-2
  describe('AK-2 Filter gemäß Filterkonfiguration', () => {
    it('[REQ-006/AK-2] die aktuelle Konfiguration enthält „Für dich“, „Gerade am Lesen“, „Noch zu lesen“ in dieser Reihenfolge', () => {
      const sortiert = [...filterKonfiguration].sort((a, b) => a.reihenfolge - b.reihenfolge);
      expect(sortiert.map((f) => f.name)).toEqual(STANDARD_NAMEN);
    });

    it('[REQ-006/AK-2] die Leiste zeigt genau diese drei Filter von links nach rechts mit genau diesen Beschriftungen', () => {
      zeige();
      expect(namen()).toEqual(STANDARD_NAMEN);
      STANDARD_NAMEN.forEach((n, i) => expect(within(leiste()).getByRole('button', { name: n })).toBe(filterButtons()[i]));
    });

    it('[REQ-006/AK-2] ohne Props verwendet auch die App (Menüpunkt „Bücher“) genau diese Filter', () => {
      render(<App />);
      tapMenue('Bücher');
      expect(namen()).toEqual(STANDARD_NAMEN);
    });

    it('[REQ-006/AK-2] keine Zahl hinter dem Filter (Abgrenzung: Zahl im Referenzbild wird ignoriert)', () => {
      zeige();
      for (const b of filterButtons()) expect(b.textContent ?? '').not.toMatch(/\d/);
    });
  });

  // ---------------------------------------------------------------- AK-3
  describe('AK-3 „Für dich“ ist beim ersten Aufruf aktiv', () => {
    it('[REQ-006/AK-3] App geöffnet → „Bücher“ → „Für dich“ aktiv, alle anderen inaktiv', () => {
      render(<App />);
      tapMenue('Bücher');
      expectNurAktiv('Für dich');
    });

    it('[REQ-006/AK-3] „Für dich“ ist in der Konfiguration als Standardfilter markiert, sonst keiner', () => {
      expect(filterKonfiguration.filter((f) => f.standard).map((f) => f.name)).toEqual(['Für dich']);
    });

    it('[REQ-006/AK-3] der Standardfilter ist auch dann aktiv, wenn er nicht an erster Stelle steht', () => {
      // Grenzfall: aktiv wird der in der Konfiguration markierte Filter, nicht einfach der erste.
      zeige({ filter: [filter('A', 1), filter('B', 2, { standard: true }), filter('C', 3)] });
      expectNurAktiv('B');
    });
  });

  // ---------------------------------------------------------------- AK-4
  describe('AK-4 Genau ein aktiver Filter', () => {
    it('[REQ-006/AK-4] beim Start und nach jedem Antippen ist genau ein Filter aktiv', () => {
      zeige();
      expect(aktive()).toHaveLength(1);
      for (const n of ['Noch zu lesen', 'Gerade am Lesen', 'Gerade am Lesen', 'Für dich', 'Noch zu lesen']) {
        fireEvent.click(within(leiste()).getByRole('button', { name: n }));
        expect(aktive(), `nach Antippen von "${n}"`).toHaveLength(1);
        expect(aktive()[0].textContent?.trim()).toBe(n);
      }
    });

    it('[REQ-006/AK-4] jeder Filter hat einen eindeutigen Zustand (aria-pressed "true" oder "false")', () => {
      zeige();
      for (const b of filterButtons()) expect(['true', 'false']).toContain(b.getAttribute('aria-pressed'));
    });

    it('[REQ-006/AK-4] erneutes Antippen des aktiven Filters wählt ihn nicht ab', () => {
      zeige();
      const fd = within(leiste()).getByRole('button', { name: 'Für dich' });
      fireEvent.click(fd);
      fireEvent.click(fd);
      expectNurAktiv('Für dich');
    });

    it('[REQ-006/AK-4] Grenzfall: auch bei einer Konfiguration ohne bzw. mit zwei Standardfiltern ist genau einer aktiv', () => {
      zeige({ filter: [filter('A', 1), filter('B', 2)] });
      expect(aktive()).toHaveLength(1);
      cleanup();
      zeige({ filter: [filter('A', 1, { standard: true }), filter('B', 2, { standard: true })] });
      expect(aktive()).toHaveLength(1);
    });
  });

  // ---------------------------------------------------------------- AK-5
  describe('AK-5 Kapselform', () => {
    it('[REQ-006/AK-5] jeder Filter ist voll abgerundet (Eckenradius ≥ halbe Höhe, kein 50 %-Oval)', () => {
      zeige();
      for (const b of filterButtons()) {
        const cs = getComputedStyle(b);
        const radien = [cs.borderTopLeftRadius, cs.borderTopRightRadius, cs.borderBottomLeftRadius, cs.borderBottomRightRadius].map(
          (r) => r || cs.borderRadius,
        );
        expect(new Set(radien).size, `"${b.textContent}": alle Ecken gleich`).toBe(1);
        const r = px(radien[0]);
        expect(Number.isFinite(r), `"${b.textContent}": Radius in px/rem statt ${radien[0]}`).toBe(true);
        const h = px(cs.height);
        if (Number.isFinite(h)) expect(r, `"${b.textContent}"`).toBeGreaterThanOrEqual(h / 2);
        // ohne feste Höhe: Radius muss jede realistische Pill-Höhe abdecken (Orientierung ≈ 30 dp)
        else expect(r, `"${b.textContent}"`).toBeGreaterThanOrEqual(50);
      }
    });
  });

  // ---------------------------------------------------------------- AK-6
  describe('AK-6 Breite nach Inhalt', () => {
    it('[REQ-006/AK-6] kein Filter hat eine feste Breite; Innenabstand links/rechts ist definiert', () => {
      zeige();
      for (const b of filterButtons()) {
        const cs = getComputedStyle(b);
        expect(cs.width, `"${b.textContent}": feste Breite`).toMatch(/^(|auto|max-content|fit-content)$/);
        expect(cs.maxWidth, `"${b.textContent}": max-width`).toMatch(/^(|none|max-content|fit-content)$/);
        expect(px(cs.paddingLeft), `"${b.textContent}": padding-left`).toBeGreaterThan(0);
        expect(px(cs.paddingRight), `"${b.textContent}": padding-right`).toBeGreaterThan(0);
      }
    });

    it('[REQ-006/AK-6] Beschriftungen werden nicht abgeschnitten oder umgebrochen', () => {
      // Ohne nowrap bzw. flex-shrink: 0 würde der Flex-Container „Gerade am Lesen“ zusammendrücken.
      zeige();
      for (const b of filterButtons()) {
        const cs = getComputedStyle(b);
        const label = textElement(b, b.textContent!.trim());
        const lcs = getComputedStyle(label);
        expect(cs.whiteSpace === 'nowrap' || lcs.whiteSpace === 'nowrap', `"${b.textContent}": white-space`).toBe(true);
        expect(cs.flexShrink, `"${b.textContent}": flex-shrink`).toBe('0');
        for (const s of [cs, lcs]) {
          expect(s.textOverflow).not.toBe('ellipsis');
          expect(s.overflow === 'hidden' && s.width !== '' && s.width !== 'auto').toBe(false);
        }
      }
    });
  });

  // ---------------------------------------------------------------- AK-7
  describe('AK-7 Darstellung aktiver und inaktiver Filter', () => {
    it('[REQ-006/AK-7] aktiver Filter: Hintergrund „Tertiär“, Schrift „Hintergrund“, kein Rahmen', () => {
      const w = zeige();
      const a = aktive()[0];
      pruefeFarbe(a, 'hintergrund', 'tertiaer', w, 'aktiver Filter Hintergrund');
      pruefeFarbe(textElement(a, a.textContent!.trim()), 'text', 'hintergrund', w, 'aktiver Filter Schrift');
      expect(hatKeinenRahmen(a), 'aktiver Filter hat einen Rahmen').toBe(true);
    });

    it('[REQ-006/AK-7] inaktive Filter: Hintergrund „Ghost“, Rahmen „GhostFrame“, Schrift „Schrift tertiär“', () => {
      const w = zeige();
      const inaktiv = filterButtons().filter((b) => b.getAttribute('aria-pressed') === 'false');
      expect(inaktiv.length).toBeGreaterThan(0);
      for (const b of inaktiv) {
        const n = b.textContent!.trim();
        pruefeFarbe(b, 'hintergrund', 'ghost', w, `"${n}" Hintergrund`);
        expect(hatKeinenRahmen(b), `"${n}" braucht einen Rahmen`).toBe(false);
        pruefeFarbe(b, 'rahmen', 'ghostframe', w, `"${n}" Rahmen`);
        pruefeFarbe(textElement(b, n), 'text', 'schrifttertiaer', w, `"${n}" Schrift`);
      }
    });

    it('[REQ-006/AK-7] nach dem Wechsel tauschen Farben und Rahmen vollständig', () => {
      const w = zeige();
      fireEvent.click(within(leiste()).getByRole('button', { name: 'Noch zu lesen' }));
      const a = within(leiste()).getByRole('button', { name: 'Noch zu lesen' });
      pruefeFarbe(a, 'hintergrund', 'tertiaer', w, '„Noch zu lesen“ aktiv');
      pruefeFarbe(textElement(a, 'Noch zu lesen'), 'text', 'hintergrund', w, '„Noch zu lesen“ aktiv Schrift');
      expect(hatKeinenRahmen(a)).toBe(true);
      const fd = within(leiste()).getByRole('button', { name: 'Für dich' });
      pruefeFarbe(fd, 'hintergrund', 'ghost', w, '„Für dich“ inaktiv');
      pruefeFarbe(fd, 'rahmen', 'ghostframe', w, '„Für dich“ inaktiv Rahmen');
      pruefeFarbe(textElement(fd, 'Für dich'), 'text', 'schrifttertiaer', w, '„Für dich“ inaktiv Schrift');
    });

    it('[REQ-006/AK-7] die neuen Farbrubriken sind getrennte Rubriken (Schrift tertiär ≠ Tertiär als Rubrik)', () => {
      for (const id of ['ghost', 'ghostframe', 'schrifttertiaer']) expect(rubriken[id], id).toBeTruthy();
      expect(rubriken.schrifttertiaer).not.toBe(rubriken.tertiaer);
    });
  });

  // ---------------------------------------------------------------- AK-8
  describe('AK-8 Horizontal wischen', () => {
    it('[REQ-006/AK-8] die Leiste ist ein eigener horizontaler Scrollbereich in einer einzigen Zeile', () => {
      zeige();
      const cs = getComputedStyle(leiste());
      expect(cs.overflowX).toMatch(/^(auto|scroll)$/);
      expect(/flex/.test(cs.display), `display=${cs.display}`).toBe(true);
      expect(cs.flexDirection === '' || cs.flexDirection === 'row').toBe(true);
      expect(cs.flexWrap === '' || cs.flexWrap === 'nowrap', `flex-wrap=${cs.flexWrap}`).toBe(true);
    });

    it('[REQ-006/AK-8] bei zehn Filtern (breiter als der Bildschirm) bleiben alle in der Leiste erreichbar', () => {
      const zehn = Array.from({ length: 10 }, (_, i) => filter(`Filter Nummer ${i + 1}`, i + 1, { standard: i === 0 }));
      zeige({ filter: zehn });
      expect(namen()).toEqual(zehn.map((f) => f.name));
      for (const b of filterButtons()) expect(getComputedStyle(b).flexShrink).toBe('0');
    });

    it('[REQ-006/AK-8] Scrollposition lässt sich nach links und zurück nach rechts verschieben, Inhalt bleibt gleich', () => {
      zeige();
      const l = leiste();
      const vorher = l.innerHTML;
      l.scrollLeft = 200;
      fireEvent.scroll(l);
      l.scrollLeft = 0;
      fireEvent.scroll(l);
      expect(l.innerHTML).toBe(vorher);
      expect(namen()).toEqual(STANDARD_NAMEN);
    });
  });

  // ---------------------------------------------------------------- AK-9
  describe('AK-9 Unabhängiges Scrollen', () => {
    it('[REQ-006/AK-9] Scrollen der Leiste ändert nichts außerhalb der Leiste', () => {
      const w = zeige();
      const vorher = seiteOhneLeiste(w);
      const l = leiste();
      l.scrollLeft = 300;
      fireEvent.scroll(l);
      fireEvent.wheel(l, { deltaX: 300 });
      expect(seiteOhneLeiste(w)).toBe(vorher);
    });

    it('[REQ-006/AK-9] Überschrift, Kopf-Schaltflächen und Buchliste liegen außerhalb des Scrollbereichs der Leiste', () => {
      zeige();
      const l = leiste();
      expect(l.contains(screen.getByRole('heading', { level: 1 }))).toBe(false);
      expect(l.contains(screen.getByRole('button', { name: 'Buch hinzufügen' }))).toBe(false);
      const abschnitt = screen.getByRole('region', { name: 'Noch zu lesen' });
      expect(l.contains(abschnitt)).toBe(false);
      expect(abschnitt.contains(l)).toBe(false);
      // Die Leiste ist selbst der Scrollbereich, nicht ein gemeinsamer Vorfahr mit der Buchliste.
      for (let n = l.parentElement; n && !n.hasAttribute('data-testwurzel'); n = n.parentElement) {
        expect(getComputedStyle(n).overflowX, `Vorfahr <${n.tagName.toLowerCase()}>`).not.toMatch(/^(auto|scroll)$/);
      }
    });
  });

  // ---------------------------------------------------------------- AK-10
  describe('AK-10 Antippen eines Filters', () => {
    it('[REQ-006/AK-10] „Gerade am Lesen“ antippen: wird aktiv, „Für dich“ inaktiv', () => {
      zeige();
      expectNurAktiv('Für dich');
      fireEvent.click(within(leiste()).getByRole('button', { name: 'Gerade am Lesen' }));
      expectNurAktiv('Gerade am Lesen');
    });

    it('[REQ-006/AK-10] die „Gerade am Lesen“ zugeordnete Filterlogik wird ausgelöst, keine andere', () => {
      const konfig = konfigMitSpionen();
      zeige({ filter: konfig });
      const spion = (n: string) => konfig.find((f) => f.name === n)!.logik as ReturnType<typeof vi.fn>;
      const vorher = Object.fromEntries(konfig.map((f) => [f.name, spion(f.name).mock.calls.length]));
      fireEvent.click(within(leiste()).getByRole('button', { name: 'Gerade am Lesen' }));
      expect(spion('Gerade am Lesen').mock.calls.length).toBe(vorher['Gerade am Lesen'] + 1);
      expect(spion('Noch zu lesen').mock.calls.length).toBe(vorher['Noch zu lesen']);
    });

    it('[REQ-006/AK-10] außer der Darstellung der Filter ändert sich auf der Seite nichts', () => {
      const w = zeige();
      const vorher = seiteOhneLeiste(w);
      fireEvent.click(within(leiste()).getByRole('button', { name: 'Gerade am Lesen' }));
      expect(seiteOhneLeiste(w)).toBe(vorher);
      expect(namen()).toEqual(STANDARD_NAMEN); // Reihenfolge und Beschriftung unverändert
    });

    it('[REQ-006/AK-10] auch in der App: Menüpunkt bleibt „Bücher“, Rest der Seite unverändert', () => {
      render(<App />);
      tapMenue('Bücher');
      const main = screen.getByRole('main');
      const vorher = seiteOhneLeiste(main);
      fireEvent.click(within(leiste()).getByRole('button', { name: 'Gerade am Lesen' }));
      expect(seiteOhneLeiste(main)).toBe(vorher);
      const nav = screen.getByRole('navigation', { name: 'Hauptnavigation' });
      expect(within(nav).getByRole('button', { name: 'Bücher' })).toHaveAttribute('aria-current', 'page');
    });
  });

  // ---------------------------------------------------------------- AK-11
  describe('AK-11 „Für dich“ ist nach einem Seitenwechsel wieder aktiv', () => {
    it.each(['Start', 'Bibliothek', 'Statistik', 'Profil'])(
      '[REQ-006/AK-11] „Gerade am Lesen“ aktiv → Wechsel zu „%s“ → zurück zu „Bücher“ → „Für dich“ aktiv',
      (anderer) => {
        render(<App />);
        tapMenue('Bücher');
        fireEvent.click(within(leiste()).getByRole('button', { name: 'Gerade am Lesen' }));
        expectNurAktiv('Gerade am Lesen');
        tapMenue(anderer);
        tapMenue('Bücher');
        expectNurAktiv('Für dich');
      },
    );

    it('[REQ-006/AK-11] Negativfall: erneutes Antippen von „Bücher“ ohne Seitenwechsel – genau ein Filter bleibt aktiv', () => {
      render(<App />);
      tapMenue('Bücher');
      fireEvent.click(within(leiste()).getByRole('button', { name: 'Noch zu lesen' }));
      tapMenue('Bücher');
      expect(aktive()).toHaveLength(1);
    });
  });

  // ---------------------------------------------------------------- AK-12
  describe('AK-12 Neue Farbrubriken zentral definiert und wirksam', () => {
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
    const aktiverF = () => aktive()[0];
    const inaktiverF = () => filterButtons().find((b) => b.getAttribute('aria-pressed') === 'false')!;
    const FAELLE: [string, string, () => HTMLElement, Art][] = [
      ['tertiaer', 'Hintergrund aktiver Filter', aktiverF, 'hintergrund'],
      ['hintergrund', 'Schrift aktiver Filter', () => textElement(aktiverF(), aktiverF().textContent!.trim()), 'text'],
      ['ghost', 'Hintergrund inaktiver Filter', inaktiverF, 'hintergrund'],
      ['ghostframe', 'Rahmen inaktiver Filter', inaktiverF, 'rahmen'],
      ['schrifttertiaer', 'Schrift inaktiver Filter', () => textElement(inaktiverF(), inaktiverF().textContent!.trim()), 'text'],
    ];
    it.each(FAELLE)('[REQ-006/AK-12] Änderung der Rubrik „%s“ wirkt auf: %s', (id, wo, finde, art) => {
      mitGeaenderterRubrik(id, (neu, alt) => {
        const w = zeige();
        const el = finde();
        expect(istFarbe(el, art), `${wo}: neuer Wert`).toBe(berechneteFarbe(w, neu));
        expect(istFarbe(el, art), `${wo}: alter Wert`).not.toBe(berechneteFarbe(w, alt));
      });
    });

    it('[REQ-006/AK-12] kein Element der Filterleiste hat einen eigenen Farbwert', () => {
      zeige();
      const l = leiste();
      const verstoesse = [l, ...Array.from(l.querySelectorAll<HTMLElement>('*'))].flatMap((el) =>
        inlineDecls(el)
          .filter(([p]) => /color|background|border|outline|shadow/.test(p))
          .filter(([, v]) => FARB_LITERAL.test(v) || /var\(--[^,)]+,/.test(v))
          .map(([p, v]) => `<${el.tagName.toLowerCase()}> ${p}: ${v}`),
      );
      expect(verstoesse).toEqual([]);
    });
  });
});
