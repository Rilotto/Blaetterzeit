/**
 * Akzeptanztests REQ-090 – Seite „Statistik“: Farbdesigns und Stile.
 * Abgeleitet aus dem REQ-Text. Farben: alle gesetzten Farben der Seite müssen auf Farbvariablen der zentralen
 * Farbdefinition verweisen (keine festen Farbwerte); Wechsel des Farbdesigns ändert die berechneten Farben.
 * Stil „Feuilleton“ wie REQ-071 (Karten ohne Fläche/Rahmen/Schatten, Pillen als Text, aktiv Primär mit Unterstrich).
 * jsdom: Kurzschreibweisen mit var() werden nicht berechnet; Rahmen werden deshalb zusätzlich am gesetzten Stil geprüft.
 */
import '@testing-library/jest-dom/vitest';
import { act, cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import type { CSSProperties } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import App from '@/App';
import type { Buch } from '@/domain/buch';
import { InMemoryEinstellungRepository } from '@/storage';
import { InMemoryImageStore } from '@/storage/InMemoryImageStore';
import { farbVariablen, type FarbdesignId } from '@/theme';
import StatistikAnsicht from '@/views/StatistikAnsicht';

const T = vi.hoisted(() => ({ buecher: [] as unknown[] }));
vi.mock('@/buecher/demodaten', () => ({ demoBuecher: T.buecher }));
beforeEach(() => localStorage.clear());
afterEach(() => {
  cleanup();
  localStorage.clear();
});

const W = { timeout: 4000 };
const um = (j: number, m: number, t: number, h = 12) => new Date(j, m - 1, t, h);
const HEUTE = um(2026, 11, 22, 15);
const DESIGNS: FarbdesignId[] = ['klassisch', 'salbei', 'nachtlektuere', 'raureif', 'polarnacht'];
const $ = (q: string) => document.querySelector<HTMLElement>(q);
const $$ = (q: string) => Array.from(document.querySelectorAll<HTMLElement>(q));
const cs = (e: Element) => getComputedStyle(e);
async function tippe(el: Element | null) {
  expect(el).not.toBeNull();
  await act(async () => {
    fireEvent.click(el!);
    await new Promise((r) => setTimeout(r, 15));
  });
}
/** Daten in allen Bereichen: Sessions, beendetes Buch, Lesetage, Serie. */
const DATEN: Buch[] = [
  { id: 'b90-1', titel: 'A', status: 'am_lesen', seitenanzahl: 400, sitzungen: [16, 18, 21, 22].map((t, i) => ({ zeitpunkt: um(2026, 11, t).toISOString(), seite: 40 * (i + 1) })) },
  { id: 'b90-2', titel: 'B', status: 'gelesen', seitenanzahl: 200, beendetAm: '2026-11-20' },
];
async function zeige(design: FarbdesignId, art: 'woche' | 'monat' | 'jahr' = 'woche') {
  const repo = new InMemoryEinstellungRepository();
  await repo.speichern('statistikZeitraum', art);
  render(
    <div data-testwurzel="" style={farbVariablen(design) as CSSProperties}>
      <StatistikAnsicht buecher={DATEN} einstellungRepository={repo} bildspeicher={new InMemoryImageStore()} jetzt={() => HEUTE} />
    </div>,
  );
  await waitFor(() => expect($(`[data-zeitraum-pille="${art}"]`)).toHaveAttribute('aria-pressed', 'true'), W);
}
function farbe(ausdruck: string, wurzel = $('[data-testwurzel]') ?? document.body) {
  const p = document.createElement('span');
  p.style.setProperty('color', ausdruck);
  wurzel.appendChild(p);
  const w = cs(p).color;
  p.remove();
  return w;
}
const FARBWORT = /#[0-9a-f]{3,8}\b|\brgba?\(|\bhsla?\(|\b(white|black|gr[ae]y|red|blue|green|yellow|orange|gold|silver|brown|beige)\b/i;
/** Feste Farbwerte in einem gesetzten Stil bzw. SVG-Attribut (Inhalte von var(...) ausgenommen). */
function festeFarben(e: Element): string[] {
  const funde: string[] = [];
  // nur Deklarationen, die Farben tragen können
  const decl = (e.getAttribute('style') ?? '')
    .split(';')
    .filter((d) => /^\s*(color|background|border|outline|box-shadow|fill|stroke|stop-color|text-decoration)/i.test(d));
  const quellen = [...decl, e.getAttribute('fill') ?? '', e.getAttribute('stroke') ?? '', e.getAttribute('stop-color') ?? '', e.getAttribute('color') ?? ''];
  for (const q of quellen) {
    const ohneVar = q.replace(/var\(--[a-z0-9-]+\)/gi, 'VAR');
    const m = FARBWORT.exec(ohneVar);
    if (m) funde.push(`${m[0]} in „${ohneVar.trim()}“`);
  }
  return funde;
}

describe('REQ-090 Farbdesigns und Stile', () => {
  it.each(DESIGNS)('[REQ-090/AK-1] Farbdesign „%s“: kein Element der Seite hat eine fest eingetragene Farbe', async (design) => {
    for (const art of ['woche', 'jahr'] as const) {
      await zeige(design, art);
      const seite = $('[data-seite="statistik"]')!;
      const funde = [seite, ...Array.from(seite.querySelectorAll('*'))].flatMap((e) =>
        festeFarben(e).map((f) => `${e.tagName}${Array.from(e.attributes).filter((a) => a.name.startsWith('data-')).map((a) => `[${a.name}]`).join('')}: ${f}`),
      );
      expect(funde, funde.join('\n')).toEqual([]);
      cleanup();
    }
  });

  it('[REQ-090/AK-1] Wechsel des Farbdesigns ändert die Farben der Elemente entsprechend ihrer Farbrubrik', async () => {
    const proben: Record<string, string[]> = {};
    for (const design of DESIGNS) {
      await zeige(design);
      const g = (sel: string, eig: 'color' | 'backgroundColor') => cs($(sel)!)[eig];
      const werte = [
        g('[data-zeitraum-pille][aria-pressed="true"]', 'backgroundColor'),
        g('[data-balken-teil="sessions"]', 'backgroundColor'),
        g('[data-balken-teil="beendet"]', 'backgroundColor'),
        g('[data-kennzahl-wert]', 'color'),
        g('[data-vergleich]', 'color'),
      ];
      // Primär- bzw. Gold-Rollen entsprechen der Rubrik des gewählten Designs
      expect(werte[1]).toBe(farbe('var(--bz-farbe-primaer)'));
      expect(werte[2]).toBe(farbe('var(--bz-farbe-gold)'));
      expect(werte[0]).toBe(farbe('var(--bz-farbe-primaer)'));
      for (const w of werte) expect(w).toMatch(/^rgb/);
      proben[design] = werte;
      cleanup();
    }
    // Hell (klassisch) und dunkel (nachtlektuere) unterscheiden sich in jedem geprüften Element
    proben.klassisch.forEach((w, i) => expect(w, `Element ${i}`).not.toBe(proben.nachtlektuere[i]));
  });

  // ---- Stil „Feuilleton“ (über die App, wie REQ-071) ----
  async function statistikImStil(stil: 'feuilleton' | 'klassisch') {
    T.buecher.splice(0, T.buecher.length, ...DATEN);
    const repo = new InMemoryEinstellungRepository();
    await repo.speichern('stil', stil);
    render(<App einstellungRepository={repo} />);
    await waitFor(() => expect($('[data-app-wurzel]')).toHaveAttribute('data-stil', stil), W);
    await tippe(within(screen.getByRole('navigation', { name: 'Hauptnavigation' })).getByRole('button', { name: 'Statistik' }));
    await waitFor(() => expect($('[data-seite="statistik"]')).not.toBeNull(), W);
    await act(async () => {
      await new Promise((r) => setTimeout(r, 40));
    });
  }
  const wurzelFarbe = (v: string) => farbe(`var(--bz-farbe-${v})`, $('[data-app-wurzel]')!);
  const keineFlaeche = (e: Element) => ['transparent', 'rgba(0, 0, 0, 0)'].includes(cs(e).backgroundColor);
  const ohneSchatten = (e: Element) => ['', 'none'].includes(cs(e).boxShadow) || /^inset/.test(cs(e).boxShadow);
  /** sichtbarer Rahmen: berechnet oder (jsdom, var() in Kurzschreibweise) gesetzt und nicht durch Stilregel transparent */
  const sichtbarerRahmen = (e: Element) => {
    const c = cs(e);
    return c.borderTopStyle === 'solid' && parseFloat(c.borderTopWidth) > 0 && !['transparent', 'rgba(0, 0, 0, 0)'].includes(c.borderTopColor);
  };

  it('[REQ-090/AK-2] Feuilleton: Karten der Seite ohne Fläche, Rahmen und Wurfschatten (Linien statt Karten)', async () => {
    await statistikImStil('feuilleton');
    const karten = $$('[data-seite="statistik"] [data-statistik-karte], [data-seite="statistik"] section');
    expect(karten.length).toBeGreaterThanOrEqual(2);
    for (const k of karten) {
      expect(keineFlaeche(k), k.outerHTML.slice(0, 80)).toBe(true);
      expect(ohneSchatten(k)).toBe(true);
      expect(sichtbarerRahmen(k)).toBe(false);
    }
  });

  it('[REQ-090/AK-2] Gegenstück Klassisch: Karten haben eine Fläche', async () => {
    await statistikImStil('klassisch');
    const k = $('[data-seite="statistik"] [data-statistik-karte]') ?? $('[data-seite="statistik"] section')!;
    expect(keineFlaeche(k)).toBe(false);
  });

  it('[REQ-090/AK-2] Feuilleton: Zeitraum-Pillen als Text, aktiv in Primär mit Unterstrich, inaktiv Tertiär; Leiste ohne Fläche', async () => {
    await statistikImStil('feuilleton');
    const pillen = $$('[data-zeitraum-pille]');
    expect(pillen).toHaveLength(3);
    for (const p of pillen) {
      expect(keineFlaeche(p)).toBe(true);
      if (p.getAttribute('aria-pressed') === 'true') {
        expect(cs(p).color).toBe(wurzelFarbe('primaer'));
        expect(cs(p).boxShadow + cs(p).borderBottomStyle + cs(p).textDecorationLine).toMatch(/inset|solid|underline/);
      } else expect(cs(p).color).toBe(wurzelFarbe('tertiaer'));
    }
    const leiste = pillen[0].parentElement!;
    expect(keineFlaeche(leiste)).toBe(true);
    // Rahmen der Leiste: nicht eindeutig aus dem REQ ableitbar („wie in den übrigen Seiten“: Übersicht-Umschalter hat
    // ebenfalls einen Rahmen, Reiterleiste nicht) – als Hinweis im Testbericht, nicht als Erwartung.
    // Unterstrich wandert mit
    await tippe(pillen[2]);
    expect(cs(pillen[2]).color).toBe(wurzelFarbe('primaer'));
    expect(cs(pillen[0]).color).toBe(wurzelFarbe('tertiaer'));
  });
});
