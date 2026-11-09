/**
 * Akzeptanztests REQ-012 – Abschnitte „Sagas“ und „Sammlungen“.
 *
 * Abgeleitet aus dem REQ-Text und der verbindlichen Schnittstellen-Absprache in
 * sprints/sprint-02/plan.md, Abschnitt „REQ-005 bis REQ-012 (Seite „Bücher“), Runde 1“:
 *  - <section aria-label="Sagas"> und <section aria-label="Sammlungen">, jeweils mit <h2> und
 *    einem data-cover-platzhalter ohne Titel
 *  - Überschriften per var(--bz-farbe-tertiaer)
 * Runde 2 (Abschnitt „REQ-012, Runde 2“): unter dem data-cover-platzhalter ein Element mit
 * data-platzhaltertext, Farbe per var(--bz-farbe-primaer). AK-3 neu gefasst, AK-6 bis AK-9 neu.
 */
import '@testing-library/jest-dom/vitest';
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import type { CSSProperties } from 'react';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import App from '@/App';
import BuecherAnsicht from '@/views/BuecherAnsicht';
import type { Buch } from '@/domain/buch';
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

const SAGAS = 'Sagas';
const SAMMLUNGEN = 'Sammlungen';
const BEIDE = [SAGAS, SAMMLUNGEN] as const;
const TEXTE: Record<(typeof BEIDE)[number], string> = {
  Sagas: 'Deine nächste Saga wartet auf dich!',
  Sammlungen: 'Wie wäre es mit einer neuen Sammlung?',
};
const rubriken = farbrubriken as unknown as Record<string, { wert: string } | undefined>;
const buch = (titel: string): Buch => ({ id: `00000000-0000-4000-8000-${titel.padStart(12, '0').slice(-12)}`, titel, status: 'ungelesen' });

function zeige(buecher: Buch[] = [buch('Ohne Cover')]) {
  const { container } = render(
    <div data-testwurzel="" style={farbVariablen() as CSSProperties}>
      <BuecherAnsicht buecher={buecher} />
    </div>,
  );
  return container.firstElementChild as HTMLElement;
}
const abschnitt = (name: string) => screen.getByRole('region', { name });
function platzhalterIn(s: HTMLElement) {
  const p = s.querySelectorAll<HTMLElement>('[data-cover-platzhalter]');
  expect(p, `"${s.getAttribute('aria-label')}": genau ein Cover-Platzhalter`).toHaveLength(1);
  return p[0];
}
function textIn(s: HTMLElement) {
  const t = s.querySelectorAll<HTMLElement>('[data-platzhaltertext]');
  expect(t, `"${s.getAttribute('aria-label')}": genau ein Platzhaltertext`).toHaveLength(1);
  return t[0];
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
function berechneteFarbe(ctx: HTMLElement, ausdruck: string) {
  const probe = document.createElement('span');
  probe.style.setProperty('color', ausdruck);
  ctx.appendChild(probe);
  const wert = getComputedStyle(probe).color;
  probe.remove();
  return wert;
}
function inlineFarbe(el: HTMLElement, w: HTMLElement) {
  for (let e: HTMLElement | null = el; e && e !== w; e = e.parentElement) {
    const d = (e.getAttribute('style') ?? '').split(';').map((x) => x.trim()).find((x) => /^color\s*:/.test(x));
    if (d) return d.slice(d.indexOf(':') + 1).replace(/\s+/g, '');
  }
  return null;
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
describe('REQ-012 Abschnitte „Sagas“ und „Sammlungen“', () => {
  // ---------------------------------------------------------------- AK-1
  describe('AK-1 Beide Abschnitte unter „Noch zu lesen“', () => {
    it('[REQ-012/AK-1] Reihenfolge: „Noch zu lesen“, dann „Sagas“, dann „Sammlungen“', () => {
      zeige();
      const [n, sa, sm] = ['Noch zu lesen', SAGAS, SAMMLUNGEN].map(abschnitt);
      expect(n.compareDocumentPosition(sa) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
      expect(sa.compareDocumentPosition(sm) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
      expect(n.contains(sa) || sa.contains(sm) || sa.contains(n)).toBe(false);
    });

    it('[REQ-012/AK-1] die Überschriften lauten genau „Sagas“ und „Sammlungen“ (h2, wie „Noch zu lesen“)', () => {
      zeige();
      for (const name of BEIDE) {
        const h = within(abschnitt(name)).getAllByRole('heading');
        expect(h).toHaveLength(1);
        expect(h[0].tagName).toBe('H2');
        expect(h[0].textContent?.trim()).toBe(name);
      }
    });

    it('[REQ-012/AK-1] beide Abschnitte stehen auch bei leerer Liste und in der App', () => {
      zeige([]);
      for (const name of BEIDE) expect(abschnitt(name)).toBeInTheDocument();
      cleanup();
      render(<App />);
      fireEvent.click(within(screen.getByRole('navigation', { name: 'Hauptnavigation' })).getByRole('button', { name: 'Bücher' }));
      for (const name of BEIDE) expect(within(screen.getByRole('main')).getByRole('region', { name })).toBeInTheDocument();
    });
  });

  // ---------------------------------------------------------------- AK-2
  describe('AK-2 Überschriften in der Farbrubrik Tertiär', () => {
    it.each(BEIDE)('[REQ-012/AK-2] „%s“ ist in „Tertiär“ dargestellt', (name) => {
      const w = zeige();
      const h = within(abschnitt(name)).getByRole('heading');
      expect(inlineFarbe(h, w)).toBe('var(--bz-farbe-tertiaer)');
      expect(getComputedStyle(h).color).toBe(berechneteFarbe(w, rubriken.tertiaer!.wert));
    });

    it('[REQ-012/AK-2] Änderung von „Tertiär“ an zentraler Stelle wirkt auf beide Überschriften', () => {
      const r = rubriken.tertiaer!;
      const alt = r.wert;
      r.wert = rubriken.primaer!.wert;
      try {
        const w = zeige();
        for (const name of BEIDE) {
          expect(getComputedStyle(within(abschnitt(name)).getByRole('heading')).color).toBe(berechneteFarbe(w, r.wert));
        }
      } finally {
        r.wert = alt;
      }
    });
  });

  // ---------------------------------------------------------------- AK-3
  describe('AK-3 Je ein Cover-Platzhalter ohne Titel', () => {
    it.each(BEIDE)('[REQ-012/AK-3] „%s“: genau ein Cover-Platzhalter mit Herz-Icon, nach der Überschrift', (name) => {
      zeige();
      const s = abschnitt(name);
      const p = platzhalterIn(s);
      expect(p.querySelector('[data-icon="icon-herz.png"]')).not.toBeNull();
      expect(within(s).getByRole('heading').compareDocumentPosition(p) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    });

    it.each(BEIDE)('[REQ-012/AK-3] „%s“: der Cover-Platzhalter selbst zeigt keinen Buchtitel und keinen Text', (name) => {
      zeige([buch('Ein Titel')]);
      const p = platzhalterIn(abschnitt(name));
      expect(p.textContent?.trim()).toBe('');
      expect(p.querySelectorAll('[data-buchtitel], [data-platzhaltertext]')).toHaveLength(0);
      expect(p.contains(textIn(abschnitt(name)))).toBe(false);
    });

    it.each(BEIDE)('[REQ-012/AK-3] „%s“: außer Überschrift und Platzhaltertext kein Text, kein Buchtitel, keine weiteren Elemente', (name) => {
      zeige([buch('Ein Titel')]);
      const s = abschnitt(name);
      const h = within(s).getByRole('heading');
      const rest = (s.textContent ?? '').replace(h.textContent ?? '', '').replace(textIn(s).textContent ?? '', '').trim();
      expect(rest).toBe('');
      expect(within(s).queryByText('Ein Titel')).toBeNull();
      expect(s.querySelectorAll('[data-buchtitel], [data-leere-liste], img, ul, li, button, a')).toHaveLength(0);
      expect(within(s).queryByText(/Alle ansehen/)).toBeNull();
    });

    it('[REQ-012/AK-3] es ist derselbe Cover-Platzhalter wie im Bucheintrag (REQ-010, wiederverwendet)', () => {
      zeige();
      const imEintrag = within(abschnitt('Noch zu lesen')).getAllByRole('listitem')[0].querySelector('[data-cover-platzhalter]')!;
      for (const name of BEIDE) expect(platzhalterIn(abschnitt(name)).outerHTML).toBe(imEintrag.outerHTML);
    });

    it('[REQ-012/AK-3] die Platzhalter bleiben unabhängig von den Büchern gleich (auch bei vielen Büchern)', () => {
      zeige(Array.from({ length: 12 }, (_, i) => buch(`B${i}`)));
      for (const name of BEIDE) platzhalterIn(abschnitt(name));
    });
  });

  // ---------------------------------------------------------------- AK-4
  describe('AK-4 Gleiche Größe wie die Buch-Platzhalter', () => {
    it('[REQ-012/AK-4] Platzhalter in „Sagas“ und „Sammlungen“ haben Breite und Höhe des Buch-Platzhalters', () => {
      zeige();
      const ul = within(abschnitt('Noch zu lesen')).getByRole('list');
      const ref = masse(coverFlaeche(ul.querySelector<HTMLElement>('[data-cover-platzhalter]')!, ul));
      expect(ref.breite).toBeGreaterThan(0);
      for (const name of BEIDE) {
        const s = abschnitt(name);
        expect(masse(coverFlaeche(platzhalterIn(s), s)), name).toEqual(ref);
      }
    });

    it('[REQ-012/AK-4] die Platzhalter werden nicht gestreckt oder gestaucht (kein Flex-Wachsen/Schrumpfen)', () => {
      zeige();
      for (const name of BEIDE) {
        const p = platzhalterIn(abschnitt(name));
        const cs = getComputedStyle(p);
        expect(cs.flexShrink === '' || cs.flexShrink === '0', `${name}: flex-shrink`).toBe(true);
        expect(cs.flexGrow === '' || cs.flexGrow === '0', `${name}: flex-grow`).toBe(true);
        const eltern = getComputedStyle(p.parentElement!);
        if (/flex/.test(eltern.display) && eltern.flexDirection === 'column') {
          expect(eltern.alignItems, `${name}: Spalte streckt den Platzhalter`).not.toBe('stretch');
        }
      }
    });
  });

  // ---------------------------------------------------------------- AK-5
  describe('AK-5 Keine Funktion', () => {
    it('[REQ-012/AK-5] Antippen von Überschriften und Platzhaltern ändert in der App nichts', async () => {
      render(<App />);
      fireEvent.click(within(screen.getByRole('navigation', { name: 'Hauptnavigation' })).getByRole('button', { name: 'Bücher' }));
      await within(abschnitt('Noch zu lesen')).findByRole('list');
      const vorher = document.body.innerHTML;
      for (const name of BEIDE) {
        const s = abschnitt(name);
        for (const el of [s, within(s).getByRole('heading'), platzhalterIn(s), ...Array.from(platzhalterIn(s).querySelectorAll<HTMLElement>('*'))]) {
          fireEvent.pointerDown(el);
          fireEvent.click(el);
          fireEvent.doubleClick(el);
          fireEvent.contextMenu(el);
        }
      }
      expect(document.body.innerHTML).toBe(vorher);
    });

    it('[REQ-012/AK-5] die Abschnitte enthalten keine bedienbaren Elemente', () => {
      zeige();
      for (const name of BEIDE) {
        const s = abschnitt(name);
        expect(s.querySelectorAll('a[href], button, input, [role="button"], [role="link"], [tabindex]')).toHaveLength(0);
      }
    });
  });

  // ---------------------------------------------------------------- AK-6 / AK-7
  describe.each([
    ['AK-6', SAGAS],
    ['AK-7', SAMMLUNGEN],
  ] as const)('%s Text unter dem Platzhalter „%s“', (ak, name) => {
    const text = TEXTE[name];
    const anderer = TEXTE[name === SAGAS ? SAMMLUNGEN : SAGAS];

    it(`[REQ-012/${ak}] „${name}“ zeigt genau den Text „${text}“`, () => {
      zeige();
      const t = textIn(abschnitt(name));
      expect(t.textContent).toBe(text);
      expect(within(abschnitt(name)).getAllByText(text)).toHaveLength(1);
    });

    it(`[REQ-012/${ak}] „${name}“: der Text steht unter dem Cover-Platzhalter, nicht in ihm`, () => {
      zeige();
      const s = abschnitt(name);
      const p = platzhalterIn(s);
      const t = textIn(s);
      expect(p.contains(t) || t.contains(p)).toBe(false);
      expect(p.compareDocumentPosition(t) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
      expect(within(s).getByRole('heading').compareDocumentPosition(t) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    });

    it(`[REQ-012/${ak}] „${name}“: der Text steht an der Titelstelle (nicht breiter als der Platzhalter)`, () => {
      zeige();
      const s = abschnitt(name);
      const breite = masse(coverFlaeche(platzhalterIn(s), s)).breite;
      let begrenzt = NaN;
      for (let e: HTMLElement | null = textIn(s); e && e !== s.parentElement; e = e.parentElement) {
        const w = px(getComputedStyle(e).width) || px(getComputedStyle(e).maxWidth);
        if (Number.isFinite(w)) {
          begrenzt = w;
          break;
        }
      }
      expect(begrenzt).toBeLessThanOrEqual(breite);
    });

    it(`[REQ-012/${ak}] Negativfall: der Text von „${name}“ erscheint nicht im jeweils anderen Abschnitt`, () => {
      zeige();
      expect(within(abschnitt(name)).queryByText(anderer)).toBeNull();
      expect(screen.getAllByText(text)).toHaveLength(1);
    });

    it(`[REQ-012/${ak}] „${name}“: Text steht auch bei leerer Liste, bei vielen Büchern und in der App`, async () => {
      zeige([]);
      expect(textIn(abschnitt(name)).textContent).toBe(text);
      cleanup();
      zeige(Array.from({ length: 12 }, (_, i) => buch(`B${i}`)));
      expect(textIn(abschnitt(name)).textContent).toBe(text);
      cleanup();
      render(<App />);
      fireEvent.click(within(screen.getByRole('navigation', { name: 'Hauptnavigation' })).getByRole('button', { name: 'Bücher' }));
      await within(abschnitt('Noch zu lesen')).findByRole('list');
      expect(textIn(within(screen.getByRole('main')).getByRole('region', { name })).textContent).toBe(text);
    });
  });

  // ---------------------------------------------------------------- AK-8
  describe('AK-8 Platzhaltertexte in der Farbrubrik Primär', () => {
    it.each(BEIDE)('[REQ-012/AK-8] Text in „%s“ ist per var(--bz-farbe-primaer) in „Primär“ dargestellt', (name) => {
      const w = zeige();
      const t = textIn(abschnitt(name));
      expect(inlineFarbe(t, w)).toBe('var(--bz-farbe-primaer)');
      expect(getComputedStyle(t).color).toBe(berechneteFarbe(w, rubriken.primaer!.wert));
    });

    it('[REQ-012/AK-8] Änderung von „Primär“ an zentraler Stelle wirkt auf beide Texte', () => {
      const r = rubriken.primaer!;
      const alt = r.wert;
      const neu = Object.values(rubriken)
        .map((x) => x!.wert)
        .find((v) => berechneteFarbe(document.body, v) !== berechneteFarbe(document.body, alt))!;
      r.wert = neu;
      try {
        const w = zeige();
        for (const name of BEIDE) {
          const farbe = getComputedStyle(textIn(abschnitt(name))).color;
          expect(farbe, `${name}: neuer Wert`).toBe(berechneteFarbe(w, neu));
          expect(farbe, `${name}: alter Wert`).not.toBe(berechneteFarbe(w, alt));
        }
      } finally {
        r.wert = alt;
      }
    });

    it('[REQ-012/AK-8] Gegenprobe: Änderung von „Tertiär“ lässt die Texte unverändert', () => {
      const r = rubriken.tertiaer!;
      const alt = r.wert;
      r.wert = Object.values(rubriken)
        .map((x) => x!.wert)
        .find((v) => berechneteFarbe(document.body, v) !== berechneteFarbe(document.body, alt) && v !== rubriken.primaer!.wert)!;
      try {
        const w = zeige();
        for (const name of BEIDE) {
          expect(getComputedStyle(textIn(abschnitt(name))).color).toBe(berechneteFarbe(w, rubriken.primaer!.wert));
        }
      } finally {
        r.wert = alt;
      }
    });
  });

  // ---------------------------------------------------------------- AK-9
  describe('AK-9 Antippen der Platzhaltertexte bewirkt nichts', () => {
    it('[REQ-012/AK-9] Antippen beider Texte ändert in der App nichts', async () => {
      render(<App />);
      fireEvent.click(within(screen.getByRole('navigation', { name: 'Hauptnavigation' })).getByRole('button', { name: 'Bücher' }));
      await within(abschnitt('Noch zu lesen')).findByRole('list');
      const vorher = document.body.innerHTML;
      for (const name of BEIDE) {
        const t = textIn(abschnitt(name));
        for (const el of [t, ...Array.from(t.querySelectorAll<HTMLElement>('*'))]) {
          fireEvent.pointerDown(el);
          fireEvent.click(el);
          fireEvent.doubleClick(el);
          fireEvent.contextMenu(el);
        }
      }
      expect(document.body.innerHTML).toBe(vorher);
    });

    it.each(BEIDE)('[REQ-012/AK-9] Text in „%s“ ist kein Link und keine Schaltfläche und liegt in keiner', (name) => {
      zeige();
      const t = textIn(abschnitt(name));
      expect(t.matches('a, button, [role="button"], [role="link"], [tabindex]')).toBe(false);
      expect(t.querySelectorAll('a[href], button, input, [role="button"], [role="link"], [tabindex]')).toHaveLength(0);
      expect(t.closest('a[href], button, [role="button"], [role="link"]')).toBeNull();
    });
  });
});
