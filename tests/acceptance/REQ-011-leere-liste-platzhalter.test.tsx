/**
 * Akzeptanztests REQ-011 – Platzhalter bei leerer Liste.
 *
 * Abgeleitet aus dem REQ-Text und der verbindlichen Schnittstellen-Absprache in
 * sprints/sprint-02/plan.md, Abschnitt „REQ-005 bis REQ-012 (Seite „Bücher“), Runde 1“:
 *  - Element mit data-leere-liste, darin data-icon="icon-herz.png" und der Text „Wie wäre es mit einem neuen Buch?“
 *  - erscheint nur, wenn der Abschnitt keine Bücher hat; ein Buch ohne Cover zeigt data-cover-platzhalter
 *  - Farben per var(--bz-farbe-<id>): Fläche ghost, gestrichelter Rahmen ghostframe, Herz und Text primaer
 */
import '@testing-library/jest-dom/vitest';
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import type { CSSProperties } from 'react';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import App from '@/App';
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

type Status = Buch['status'];
const ABSCHNITT = 'Noch zu lesen';
const TEXT = 'Wie wäre es mit einem neuen Buch?';
const HERZ = 'icon-herz.png';
const rubriken = farbrubriken as unknown as Record<string, { wert: string } | undefined>;
const COVER = `data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="200" height="300"/>')}`;

let n = 0;
function buch(titel: string, status: Status = 'ungelesen', cover?: string): Buch {
  n++;
  const b: Buch = { id: `00000000-0000-4000-8000-${String(n).padStart(12, '0')}`, titel, status };
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
function leer() {
  const l = abschnitt().querySelectorAll<HTMLElement>('[data-leere-liste]');
  expect(l, 'genau ein Leere-Liste-Platzhalter im Abschnitt').toHaveLength(1);
  return l[0];
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
/** Die Fläche: Element mit gestricheltem Rahmen. */
function flaeche(l: HTMLElement) {
  const k = [l, ...Array.from(l.querySelectorAll<HTMLElement>('*'))].filter(
    (e) => getComputedStyle(e).borderTopStyle === 'dashed',
  );
  expect(k, 'genau eine Fläche mit gestricheltem Rahmen').toHaveLength(1);
  return k[0];
}
function textEl(l: HTMLElement) {
  const k = Array.from(l.querySelectorAll<HTMLElement>('*')).filter((e) => e.textContent?.trim() === TEXT);
  expect(k.length, `kein Element mit "${TEXT}"`).toBeGreaterThan(0);
  return k.find((c) => !k.some((o) => o !== c && c.contains(o)))!;
}
function coverFlaeche(start: HTMLElement, grenze: HTMLElement) {
  for (let e: HTMLElement | null = start; e && e !== grenze; e = e.parentElement) {
    const cs = getComputedStyle(e);
    if (Number.isFinite(px(cs.width)) && Number.isFinite(px(cs.height))) return e;
  }
  throw new Error('keine Fläche mit fester Breite und Höhe gefunden');
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
type Art = 'text' | 'hintergrund' | 'rahmen' | 'icon';
const EIG: Record<Art, RegExp> = {
  text: /^color$/,
  hintergrund: /^background(-color)?$/,
  rahmen: /^border(-(top|right|bottom|left))?(-color)?$/,
  icon: /^(background(-color)?|color)$/,
};
function ist(el: HTMLElement, art: Art) {
  const cs = getComputedStyle(el);
  return art === 'text' ? [cs.color] : art === 'hintergrund' ? [cs.backgroundColor] : art === 'rahmen' ? [cs.borderTopColor] : [cs.backgroundColor, cs.color];
}
function pruefeFarbe(el: HTMLElement, art: Art, id: string, w: HTMLElement, wo: string) {
  let q: [string, string] | undefined;
  for (let e: HTMLElement | null = el; e && e !== w && !q; e = e.parentElement) {
    q = inlineDecls(e).find(([p, v]) => EIG[art].test(p) && /var\(/.test(v));
    if (art !== 'text') break;
  }
  expect(q, `${wo}: keine Farbe per var() gesetzt`).toBeDefined();
  expect(q![1], wo).toMatch(new RegExp(`var\\(\\s*--bz-farbe-${id}\\s*\\)`));
  expect(q![1], `${wo}: Ausweichwert`).not.toMatch(/var\([^)]*,/);
  expect(ist(el, art), wo).toContain(sollFarbe(w, id));
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
describe('REQ-011 Platzhalter bei leerer Liste', () => {
  // ---------------------------------------------------------------- AK-1
  describe('AK-1 Platzhalter bei leerem Abschnitt', () => {
    it('[REQ-011/AK-1] keine Bücher: unter der Überschrift steht der Platzhalter statt einer Buchliste', () => {
      zeige([]);
      const l = leer();
      const h2 = within(abschnitt()).getByRole('heading', { level: 2, name: ABSCHNITT });
      expect(h2.compareDocumentPosition(l) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
      expect(within(abschnitt()).queryAllByRole('listitem')).toHaveLength(0);
      expect(abschnitt().querySelector('[data-cover-platzhalter]'), 'kein Cover-Platzhalter (REQ-010)').toBeNull();
    });

    it('[REQ-011/AK-1] er besteht aus einer Fläche mit gestricheltem Rahmen und dem Herz-Icon darin', () => {
      zeige([]);
      const f = flaeche(leer());
      expect(px(getComputedStyle(f).borderTopWidth)).toBeGreaterThan(0);
      expect(herz(f)).toHaveAttribute('data-icon', HERZ);
    });

    it('[REQ-011/AK-1] darunter steht genau der Text „Wie wäre es mit einem neuen Buch?“', () => {
      zeige([]);
      const l = leer();
      const f = flaeche(l);
      const t = textEl(l);
      expect(t.textContent).toBe(TEXT);
      expect(f.contains(t)).toBe(false);
      expect(f.compareDocumentPosition(t) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
      expect(l.textContent?.trim()).toBe(TEXT); // kein weiterer Text
    });

    it('[REQ-011/AK-1] auch wenn Bücher vorhanden sind, aber keines zugeordnet ist', () => {
      zeige([buch('A', 'gelesen'), buch('B', 'am_lesen', COVER), buch('C', 'wunschliste'), buch('D', 'abgebrochen')]);
      expect(leer()).toBeInTheDocument();
      expect(within(abschnitt()).queryAllByRole('listitem')).toHaveLength(0);
    });

    it('[REQ-011/AK-1] der Platzhalter steht nur im Abschnitt „Noch zu lesen“, nicht in „Sagas“/„Sammlungen“', () => {
      // Seit 2026-11-12 hat auch „Alle Bücher“ (REQ-035, AK-9) einen eigenen Leere-Liste-Platzhalter; hier nur REQ-011.
      zeige([]);
      expect(abschnitt().querySelectorAll('[data-leere-liste]')).toHaveLength(1);
      for (const name of ['Sagas', 'Sammlungen']) {
        expect(screen.getByRole('region', { name }).querySelectorAll('[data-leere-liste]'), name).toHaveLength(0);
      }
    });
  });

  // ---------------------------------------------------------------- AK-2
  describe('AK-2 Kein Platzhalter, sobald ein Buch da ist', () => {
    it('[REQ-011/AK-2] genau ein Buch ohne Cover: kein Leere-Liste-Platzhalter, sondern Eintrag mit Cover-Platzhalter und Titel', () => {
      zeige([buch('When The Moon Hatched')]);
      expect(document.querySelector('[data-leere-liste]')).toBeNull();
      expect(screen.queryByText(TEXT)).toBeNull();
      const li = within(abschnitt()).getAllByRole('listitem');
      expect(li).toHaveLength(1);
      expect(li[0].querySelector('[data-cover-platzhalter]')).not.toBeNull();
      expect(li[0].querySelector('[data-buchtitel]')?.textContent?.trim()).toBe('When The Moon Hatched');
    });

    it('[REQ-011/AK-2] genau ein Buch mit Cover: kein Leere-Liste-Platzhalter', () => {
      zeige([buch('Mit', 'ungelesen', COVER)]);
      expect(document.querySelector('[data-leere-liste]')).toBeNull();
    });

    it('[REQ-011/AK-2] Wechsel der Daten: leer → ein Buch → leer schaltet den Platzhalter korrekt um', () => {
      const { rerender } = render(<BuecherAnsicht buecher={[]} />);
      expect(document.querySelector('[data-leere-liste]')).not.toBeNull();
      rerender(<BuecherAnsicht buecher={[buch('Neu')]} />);
      expect(document.querySelector('[data-leere-liste]')).toBeNull();
      rerender(<BuecherAnsicht buecher={[]} />);
      expect(document.querySelector('[data-leere-liste]')).not.toBeNull();
    });
  });

  // ---------------------------------------------------------------- AK-3
  describe('AK-3 Antippen bewirkt vorerst nichts', () => {
    it('[REQ-011/AK-3] Antippen von Platzhalter, Fläche, Herz und Text ändert die Seite nicht', () => {
      zeige([]);
      const vorher = document.body.innerHTML;
      const l = leer();
      for (const el of [l, flaeche(l), herz(flaeche(l)), textEl(l)]) {
        fireEvent.pointerDown(el);
        fireEvent.click(el);
        fireEvent.doubleClick(el);
      }
      expect(document.body.innerHTML).toBe(vorher);
    });

    it('[REQ-011/AK-3] der Platzhalter ist kein Link, keine Schaltfläche und liegt in keiner (kann nichts auslösen)', () => {
      zeige([]);
      const l = leer();
      expect(l.querySelectorAll('a[href], form, button, [role="button"], [role="link"]')).toHaveLength(0);
      expect(l.closest('a[href], button')).toBeNull();
    });

    it('[REQ-011/AK-3] Gegenprobe App: Antippen im Abschnitt ändert den aktiven Menüpunkt nicht', async () => {
      render(<App />);
      fireEvent.click(within(screen.getByRole('navigation', { name: 'Hauptnavigation' })).getByRole('button', { name: 'Bücher' }));
      await within(abschnitt()).findByRole('list');
      const vorher = document.body.innerHTML;
      fireEvent.click(abschnitt());
      expect(document.body.innerHTML).toBe(vorher);
    });
  });

  // ---------------------------------------------------------------- AK-4
  describe('AK-4 Farben aus zentralen Farbrubriken', () => {
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
      ['ghost', 'Fläche', () => flaeche(leer()), 'hintergrund'],
      ['ghostframe', 'gestrichelter Rahmen', () => flaeche(leer()), 'rahmen'],
      ['primaer', 'Herz-Icon', () => herz(flaeche(leer())), 'icon'],
      ['primaer', 'Text', () => textEl(leer()), 'text'],
    ];
    it.each(FAELLE)('[REQ-011/AK-4] Änderung von „%s“ an zentraler Stelle wirkt auf: %s', (id, wo, finde, art) => {
      mitGeaenderterRubrik(id, (neu, alt) => {
        const w = zeige([]);
        expect(ist(finde(), art), `${wo}: neuer Wert`).toContain(berechneteFarbe(w, neu));
        expect(ist(finde(), art), `${wo}: alter Wert`).not.toContain(berechneteFarbe(w, alt));
      });
    });
  });

  // ---------------------------------------------------------------- AK-5
  describe('AK-5 Größe wie ein Cover', () => {
    it('[REQ-011/AK-5] die Fläche hat dieselbe Breite und Höhe wie die Coverfläche eines Bucheintrags', () => {
      zeige([buch('Mit', 'ungelesen', COVER), buch('Ohne')]);
      const ul = within(abschnitt()).getByRole('list');
      const cover = masse(coverFlaeche(ul.querySelector<HTMLElement>('img')!, ul));
      const platz = masse(coverFlaeche(ul.querySelector<HTMLElement>('[data-cover-platzhalter]')!, ul));
      cleanup();
      zeige([]);
      const l = leer();
      const m = masse(coverFlaeche(flaeche(l), l.parentElement!));
      expect(cover.breite).toBeGreaterThan(0);
      expect(m).toEqual(cover);
      expect(m).toEqual(platz);
    });

    it('[REQ-011/AK-5] der Text steht an der Titelstelle: nicht breiter als die Fläche', () => {
      zeige([]);
      const l = leer();
      const breite = masse(coverFlaeche(flaeche(l), l.parentElement!)).breite;
      let begrenzt = NaN;
      for (let e: HTMLElement | null = textEl(l); e && e !== l.parentElement; e = e.parentElement) {
        const w = px(getComputedStyle(e).width) || px(getComputedStyle(e).maxWidth);
        if (Number.isFinite(w)) {
          begrenzt = w;
          break;
        }
      }
      expect(begrenzt).toBeLessThanOrEqual(breite);
    });
  });

  // ---------------------------------------------------------------- AK-6
  describe('AK-6 Farbzuordnung', () => {
    it('[REQ-011/AK-6] Fläche „Ghost“, gestrichelter Rahmen „GhostFrame“, Herz und Text „Primär“', () => {
      const w = zeige([]);
      const l = leer();
      const f = flaeche(l);
      pruefeFarbe(f, 'hintergrund', 'ghost', w, 'Fläche');
      pruefeFarbe(f, 'rahmen', 'ghostframe', w, 'Rahmen');
      pruefeFarbe(herz(f), 'icon', 'primaer', w, 'Herz-Icon');
      pruefeFarbe(textEl(l), 'text', 'primaer', w, 'Text');
    });
  });

  // ---------------------------------------------------------------- AK-7
  describe('AK-7 Nur das Herz-Icon des CEO', () => {
    it('[REQ-011/AK-7] das Icon ist icon-herz.png und wird per Maske eingefärbt', () => {
      zeige([]);
      const i = herz(leer());
      expect(i).toHaveAttribute('data-icon', HERZ);
      const stil = i.getAttribute('style') ?? '';
      expect(stil).toMatch(/mask/);
      const urls = [...stil.matchAll(/url\(\s*['"]?([^'")]+)['"]?\s*\)/g)].map((m) => decodeURIComponent(m[1]));
      expect(urls.length).toBeGreaterThan(0);
      for (const u of urls) if (!u.startsWith('data:')) expect(u).toContain('icon-herz');
      expect(leer().querySelectorAll('svg, img')).toHaveLength(0);
    });

    it('[REQ-011/AK-7] die verwendete Datei ist byte-identisch mit der Datei des CEO', () => {
      const ref = fs.readFileSync(HERZ_REF);
      const kopien = walk(SRC).filter((f) => f.pathname.endsWith(`/${HERZ}`));
      expect(kopien.length).toBeGreaterThan(0);
      for (const k of kopien) expect(fs.readFileSync(k).equals(ref)).toBe(true);
    });
  });
});
