/**
 * Akzeptanztests REQ-071 – Fenster „Design“: dritte Pille „Stil“ mit „Klassisch“ und „Feuilleton“.
 * Abgeleitet aus dem REQ-Text. Schnittstellen laut Entwickler (Sprint 07):
 *  - [data-design-reiter="stil"], [data-design-liste="stil"], button[data-stil-zeile=klassisch|feuilleton][aria-checked][data-aktiv]
 *    mit [data-stil-name], [data-stil-satz], [data-haken]/[data-kreis]; Skizzen [data-stil-skizze] mit [data-skizze-*]
 *  - Profilzeile [data-design-anzeige]; Wurzel [data-app-wurzel] und <html> tragen data-stil
 *  - Feuilleton-Regeln in <style data-stil-regeln>, greifen über data-stil-rolle; getComputedStyle wertet sie aus
 *  - Speicher: EinstellungRepository, Schlüssel „stil“
 * Konkrete Strichstärken sind kein AK; geprüft wird „dünn“ (≤ 3 px) bzw. das Vorhandensein von Linie/Unterstrich.
 */
import '@testing-library/jest-dom/vitest';
import { act, cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import type { ComponentType } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import App from '@/App';
import { InMemoryEinstellungRepository, type EinstellungRepository, type EinstellungSchluessel } from '@/storage';

const T = vi.hoisted(() => ({
  buecher: [
    { id: '71000000-0000-4000-8000-000000000001', titel: 'Momo', autor: 'Michael Ende', status: 'am_lesen' as const, seitenanzahl: 300, aktuelleSeite: 120 },
    { id: '71000000-0000-4000-8000-000000000002', titel: 'Krabat', autor: 'Otfried Preußler', status: 'ungelesen' as const },
  ],
}));
vi.mock('@/buecher/demodaten', () => ({ demoBuecher: T.buecher }));
beforeEach(() => localStorage.clear());
afterEach(async () => {
  cleanup();
  localStorage.clear();
  await new Promise((r) => setTimeout(r, 50));
});

const W = { timeout: 4000 };
const nav = () => screen.getByRole('navigation', { name: 'Hauptnavigation' });
const wurzel = () => document.querySelector<HTMLElement>('[data-app-wurzel]')!;
const fenster = () => screen.queryByRole('dialog', { name: 'Design' });
const stilZeile = (id: string) => fenster()!.querySelector<HTMLElement>(`button[data-stil-zeile="${id}"]`)!;
const hatHaken = (id: string) => stilZeile(id).querySelector('[data-haken]') !== null && stilZeile(id).querySelector('[data-kreis]') === null;
const hatKreis = (id: string) => stilZeile(id).querySelector('[data-kreis]') !== null && stilZeile(id).querySelector('[data-haken]') === null;
const norm = (t: string | null | undefined) => (t ?? '').replace(/\s+/g, ' ').trim();
const cs = (e: Element) => getComputedStyle(e);
async function tippe(el: Element) {
  await act(async () => {
    fireEvent.click(el);
    await new Promise((r) => setTimeout(r, 15));
  });
}
async function starte(werte: Record<string, string> = {}, repo: EinstellungRepository = new InMemoryEinstellungRepository()) {
  localStorage.clear();
  for (const [k, v] of Object.entries(werte)) await repo.speichern(k as EinstellungSchluessel, v);
  render(<App einstellungRepository={repo} />);
  await screen.findByRole('navigation', { name: 'Hauptnavigation' }, W);
  if (werte.stil) await vi.waitFor(() => expect(wurzel()).toHaveAttribute('data-stil', werte.stil), W);
  await zuBuecher();
  return repo;
}
async function profil() {
  await tippe(within(nav()).getByRole('button', { name: 'Profil' }));
  return vi.waitFor(() => {
    const z = document.querySelector<HTMLElement>('[data-profil-zeile="design"]');
    expect(z).not.toBeNull();
    return z!;
  }, W);
}
async function oeffneDesign() {
  await tippe(await profil());
  return screen.findByRole('dialog', { name: 'Design' }, W);
}
async function oeffneStil() {
  const f = await oeffneDesign();
  await tippe(f.querySelector('[data-design-reiter="stil"]')!);
  await vi.waitFor(() => expect(f.querySelector('[data-design-liste="stil"]')).not.toBeNull(), W);
  return f;
}
async function schliesseDesign() {
  await tippe(fenster()!.querySelector('[data-design-schliessen]')!);
  await vi.waitFor(() => expect(fenster()).toBeNull(), W);
}
async function zuBuecher() {
  await tippe(within(nav()).getByRole('button', { name: 'Bücher' }));
  await screen.findByRole('heading', { name: 'Deine Bücher' }, W);
}
async function zuBuchdetails(titel = 'Momo') {
  await vi.waitFor(() => expect(screen.getAllByText(titel).length).toBeGreaterThan(0), W);
  await tippe(screen.getAllByText(titel)[0]);
  const d = await screen.findByRole('region', { name: 'Buchdetails' }, W);
  await vi.waitFor(() => expect(d.querySelector('[data-reiter="details"]')).not.toBeNull(), W);
  return d;
}
/** Berechnete Farbe eines CSS-Ausdrucks im Kontext der App-Wurzel. */
function farbe(ausdruck: string) {
  const p = document.createElement('span');
  p.style.setProperty('color', ausdruck);
  wurzel().appendChild(p);
  const w = cs(p).color;
  p.remove();
  return w;
}
const PRIMAER = () => farbe('var(--bz-farbe-primaer)');
const TERTIAER = () => farbe('var(--bz-farbe-tertiaer)');
const GHOSTFRAME = () => farbe('var(--bz-farbe-ghostframe)');
const HINTERGRUND = () => farbe('var(--bz-farbe-hintergrund)');
const keineFlaeche = (e: Element) => ['transparent', 'rgba(0, 0, 0, 0)'].includes(cs(e).backgroundColor);
const px = (v: string) => parseFloat(v) || 0;
/** Dünne durchgezogene Linie an einer Seite in der Farbe `f`. */
function linie(e: Element, seite: 'Top' | 'Bottom', f: string) {
  const s = cs(e) as unknown as Record<string, string>;
  expect(s[`border${seite}Style`], `border-${seite} Stil`).toBe('solid');
  expect(px(s[`border${seite}Width`])).toBeGreaterThan(0);
  expect(px(s[`border${seite}Width`])).toBeLessThanOrEqual(3);
  expect(s[`border${seite}Color`]).toBe(f);
}
const ohneRahmen = (e: Element) => {
  const s = cs(e);
  for (const k of ['borderTopStyle', 'borderLeftStyle', 'borderRightStyle'] as const) expect(['none', '', 'hidden'].includes(s[k]) || px(s[k.replace('Style', 'Width') as 'borderTopWidth']) === 0).toBe(true);
  expect(['none', ''].includes(s.boxShadow)).toBe(true);
};

describe('REQ-071 Stil', () => {
  it('[REQ-071/AK-1] Umschaltpille zeigt „Farben“, „Schriftart“, „Stil“; „Stil“ antippen zeigt die Stil-Liste', async () => {
    await starte();
    const f = await oeffneDesign();
    const reiter = Array.from(f.querySelectorAll('[data-design-reiter]'));
    expect(reiter.map((r) => r.getAttribute('data-design-reiter'))).toEqual(['farben', 'schriftart', 'stil']);
    expect(reiter.map((r) => norm(r.textContent))).toEqual(['Farben', 'Schriftart', 'Stil']);
    expect(f.querySelector('[data-design-liste="stil"]')).toBeNull();
    await tippe(f.querySelector('[data-design-reiter="stil"]')!);
    expect(f.querySelector('[data-design-liste="stil"]')).not.toBeNull();
    expect(f.querySelector('[data-design-liste="farben"]')).toBeNull();
    expect(f.querySelector('[data-design-reiter="stil"]')).toHaveAttribute('aria-selected', 'true');
  });

  it('[REQ-071/AK-2] Liste: „Klassisch“ und „Feuilleton“ mit kursivem Satz, Mini-Skizze links; Häkchen/Kreis', async () => {
    await starte();
    const f = await oeffneStil();
    const zeilen = Array.from(f.querySelectorAll<HTMLElement>('button[data-stil-zeile]'));
    expect(zeilen.map((z) => z.getAttribute('data-stil-zeile'))).toEqual(['klassisch', 'feuilleton']);
    const soll = [
      ['Klassisch', 'Karten, Pillen, weiche Schatten'],
      ['Feuilleton', 'Linien statt Karten, wie gedruckt'],
    ];
    zeilen.forEach((z, i) => {
      expect(norm(z.querySelector('[data-stil-name]')?.textContent)).toBe(soll[i][0]);
      const satz = z.querySelector<HTMLElement>('[data-stil-satz]')!;
      expect(norm(satz.textContent)).toBe(soll[i][1]);
      expect(cs(satz).fontStyle).toBe('italic');
      const skizze = z.querySelector<HTMLElement>('[data-stil-skizze]')!;
      expect(skizze).not.toBeNull();
      expect(skizze.compareDocumentPosition(z.querySelector('[data-stil-name]')!) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
      for (const teil of ['filter', 'eintrag', 'cover', 'balken']) expect(skizze.querySelector(`[data-skizze-${teil}]`), teil).not.toBeNull();
    });
    expect(hatHaken('klassisch')).toBe(true);
    expect(hatKreis('feuilleton')).toBe(true);
  });

  it('[REQ-071/AK-2] Skizzen zeigen den jeweiligen Stil: Klassisch mit Coverfläche, Feuilleton mit Rahmen ohne Fläche', async () => {
    await starte();
    await oeffneStil();
    const k = stilZeile('klassisch').querySelector('[data-skizze-cover]')!;
    const fe = stilZeile('feuilleton').querySelector('[data-skizze-cover]')!;
    expect(keineFlaeche(k)).toBe(false);
    expect(keineFlaeche(fe)).toBe(true);
    expect(cs(fe).borderTopStyle).toBe('solid');
  });

  it('[REQ-071/AK-3] nie gewählt: „Klassisch“ aktiv (Wurzel und html), Häkchen bei „Klassisch“', async () => {
    const repo = await starte();
    expect(wurzel()).toHaveAttribute('data-stil', 'klassisch');
    expect(document.documentElement).toHaveAttribute('data-stil', 'klassisch');
    await oeffneStil();
    expect(stilZeile('klassisch')).toHaveAttribute('aria-checked', 'true');
    expect(stilZeile('feuilleton')).toHaveAttribute('aria-checked', 'false');
    expect(await repo.lesen('stil')).toBeUndefined();
  });

  it('[REQ-071/AK-3] „Klassisch“ sieht aus wie bisher: die Stilregeln ändern keinen berechneten Wert', async () => {
    await starte();
    await zuBuchdetails();
    await tippe(document.querySelector('[data-reiter="details"]')!);
    const els = Array.from(document.querySelectorAll<HTMLElement>('[data-stil-rolle]'));
    expect(els.length).toBeGreaterThan(5);
    const props = ['backgroundColor', 'borderTopStyle', 'borderBottomStyle', 'borderBottomWidth', 'borderRadius', 'boxShadow', 'color', 'fontWeight', 'fontSize', 'height', 'display'] as const;
    const aufnahme = () => els.map((e) => props.map((p) => cs(e)[p]).join('|'));
    const mit = aufnahme();
    const regeln = document.querySelector('style[data-stil-regeln]')!;
    expect(regeln).not.toBeNull();
    const text = regeln.textContent;
    regeln.textContent = '';
    try {
      expect(aufnahme()).toEqual(mit);
    } finally {
      regeln.textContent = text;
    }
  });

  it('[REQ-071/AK-4] „Feuilleton“ antippen: sofort aktiv (ohne Neustart), Häkchen wechselt, gespeichert', async () => {
    const repo = await starte();
    await oeffneStil();
    await tippe(stilZeile('feuilleton'));
    expect(hatHaken('feuilleton')).toBe(true);
    expect(hatKreis('klassisch')).toBe(true);
    expect(stilZeile('feuilleton')).toHaveAttribute('aria-checked', 'true');
    expect(wurzel()).toHaveAttribute('data-stil', 'feuilleton');
    expect(document.documentElement).toHaveAttribute('data-stil', 'feuilleton');
    // Umschaltpille im Fenster selbst wirkt sofort im neuen Stil (F4)
    const aktiv = fenster()!.querySelector('[data-design-reiter="stil"]')!;
    expect(keineFlaeche(aktiv)).toBe(true);
    expect(cs(aktiv).color).toBe(PRIMAER());
    await vi.waitFor(async () => expect(await repo.lesen('stil')).toBe('feuilleton'), W);
    await schliesseDesign();
    await zuBuecher();
    // F6 ohne Neustart sichtbar
    linie(nav(), 'Top', GHOSTFRAME());
    expect(cs(screen.getByRole('heading', { name: 'Deine Bücher' })).fontWeight).toMatch(/^(400|normal)$/);
  });

  it('[REQ-071/AK-4] zurück zu „Klassisch“: Feuilleton-Regeln greifen nicht mehr', async () => {
    await starte({ stil: 'feuilleton' });
    await oeffneStil();
    await tippe(stilZeile('klassisch'));
    expect(wurzel()).toHaveAttribute('data-stil', 'klassisch');
    await schliesseDesign();
    await zuBuecher();
    expect(cs(nav()).borderTopStyle).not.toBe('solid');
  });

  it('[REQ-071/AK-5] „Feuilleton“ gewählt: nach Neustart (neue App-Instanz, selber Speicher) weiterhin aktiv', async () => {
    const repo = await starte();
    await oeffneStil();
    await tippe(stilZeile('feuilleton'));
    cleanup();
    render(<App einstellungRepository={repo} />);
    await vi.waitFor(() => expect(wurzel()).toHaveAttribute('data-stil', 'feuilleton'), W);
    await oeffneStil();
    expect(hatHaken('feuilleton')).toBe(true);
  });

  it('[REQ-071/AK-5] dauerhaft im Standardspeicher: neu geladene App (Module neu) zeigt „Feuilleton“', async () => {
    vi.resetModules();
    const A1 = (await import('@/App')).default as ComponentType;
    render(<A1 />);
    await screen.findByRole('navigation', { name: 'Hauptnavigation' }, W);
    await oeffneStil();
    await tippe(stilZeile('feuilleton'));
    await schliesseDesign();
    cleanup();
    await new Promise((r) => setTimeout(r, 50));
    vi.resetModules();
    const A2 = (await import('@/App')).default as ComponentType;
    render(<A2 />);
    await vi.waitFor(() => expect(wurzel()).toHaveAttribute('data-stil', 'feuilleton'), W);
  });

  it('[REQ-071/AK-5] ungültiger gespeicherter Wert gilt als „Klassisch“', async () => {
    const repo = new InMemoryEinstellungRepository();
    await repo.speichern('stil', 'barock');
    render(<App einstellungRepository={repo} />);
    await screen.findByRole('navigation', { name: 'Hauptnavigation' }, W);
    await new Promise((r) => setTimeout(r, 50));
    expect(wurzel()).toHaveAttribute('data-stil', 'klassisch');
  });

  it('[REQ-071/AK-6] Feuilleton + anderes Farbdesign/andere Schrift: Stil bleibt, Farben/Schrift wechseln; Skizzen in aktuellen Farben', async () => {
    const repo = await starte({ stil: 'feuilleton', farbdesign: 'klassisch', schrift: 'fraunces' });
    const f = await oeffneDesign();
    await tippe(f.querySelector('button[data-farbdesign="salbei"]')!);
    expect(wurzel()).toHaveAttribute('data-farbdesign', 'salbei');
    expect(wurzel()).toHaveAttribute('data-stil', 'feuilleton');
    await tippe(f.querySelector('[data-design-reiter="schriftart"]')!);
    await tippe(f.querySelector('button[data-schrift-zeile="system"]')!);
    expect(wurzel()).toHaveAttribute('data-schrift', 'system');
    expect(wurzel()).toHaveAttribute('data-stil', 'feuilleton');
    expect(await repo.lesen('stil')).toBe('feuilleton');
    await tippe(f.querySelector('[data-design-reiter="stil"]')!);
    // Skizzen-Farben folgen den App-Farben (Variablen), nicht festen Werten
    const aktivFilter = stilZeile('feuilleton').querySelector('[data-skizze-filter="aktiv"]')!;
    expect(cs(aktivFilter).color).toBe(PRIMAER());
    const htmlSkizzen = Array.from(f.querySelectorAll('[data-stil-skizze]')).map((s) => s.outerHTML).join('');
    expect(htmlSkizzen).toContain('var(--bz-farbe-');
    expect(htmlSkizzen).not.toMatch(/#[0-9a-f]{3,8}\b|rgb\(/i);
    // Stil in den neuen Farben: Navigation auf „Hintergrund“ des Designs Salbei
    expect(cs(nav()).backgroundColor).toBe(HINTERGRUND());
  });

  it('[REQ-071/AK-7] Feuilleton: Profil-Karte ohne Fläche/Rahmen/Schatten', async () => {
    await starte({ stil: 'feuilleton' });
    await profil();
    const karte = document.querySelector('[data-profil-karte]')!;
    expect(keineFlaeche(karte)).toBe(true);
    ohneRahmen(karte);
  });

  it('[REQ-071/AK-7] Feuilleton: Karte „Ausgabe“ ohne Fläche, Zeilen durch dünne Linien in GhostFrame getrennt; Buch- und Seitentitel normal', async () => {
    await starte({ stil: 'feuilleton' });
    expect(cs(screen.getByRole('heading', { name: 'Deine Bücher' })).fontWeight).toMatch(/^(400|normal)$/);
    for (const t of Array.from(document.querySelectorAll('[data-buchtitel]'))) expect(cs(t).fontWeight).toMatch(/^(400|normal)$/);
    const d = await zuBuchdetails();
    await tippe(d.querySelector('[data-reiter="details"]')!);
    const karte = await vi.waitFor(() => {
      const k = d.querySelector('[data-ausgabe-karte]');
      expect(k).not.toBeNull();
      return k!;
    }, W);
    expect(keineFlaeche(karte)).toBe(true);
    ohneRahmen(karte);
    const zeilen = Array.from(karte.querySelectorAll('[data-ausgabe-zeile]'));
    expect(zeilen.length).toBeGreaterThan(5);
    for (const z of zeilen) {
      expect(keineFlaeche(z)).toBe(true);
      linie(z, 'Bottom', GHOSTFRAME());
    }
  });

  /** Schriftgrößen von Seitentitel, Buchtiteln und allen Texten mit Stil-Rolle (Bücher-Seite und Buchdetails › Details). */
  async function schriftgroessen() {
    const auf = () =>
      [screen.getByRole('heading', { name: 'Deine Bücher' }), ...Array.from(document.querySelectorAll('[data-buchtitel], [data-stil-rolle], [data-stil-rolle] *'))].map(
        (e) => `${(e.getAttribute('data-stil-rolle') ?? e.tagName).slice(0, 20)}:${norm(e.textContent).slice(0, 15)}=${cs(e).fontSize}`,
      );
    const buecher = auf();
    const d = await zuBuchdetails();
    const titel = Array.from(d.querySelectorAll('h1, h2, [data-buchtitel]')).map((e) => `${norm(e.textContent).slice(0, 15)}=${cs(e).fontSize}`);
    await tippe(d.querySelector('[data-reiter="details"]')!);
    await vi.waitFor(() => expect(d.querySelector('[data-ausgabe-karte]')).not.toBeNull(), W);
    const details = Array.from(d.querySelectorAll('[data-stil-rolle], [data-stil-rolle] *')).map((e) => `${norm(e.textContent).slice(0, 15)}=${cs(e).fontSize}`);
    return { buecher, titel, details };
  }

  it('[REQ-071/AK-7] Feuilleton: Seiten-, Buchtitel und alle übrigen Texte haben dieselbe Schriftgröße wie bei „Klassisch“', async () => {
    await starte();
    const k = await schriftgroessen();
    const kTitel = cs(screen.getAllByText('Momo')[0]).fontSize;
    cleanup();
    await starte({ stil: 'feuilleton' });
    const f = await schriftgroessen();
    expect(cs(screen.getAllByText('Momo')[0]).fontSize).toBe(kTitel);
    expect(f.buecher.length).toBeGreaterThan(5);
    expect(f.buecher).toEqual(k.buecher);
    expect(f.titel).toEqual(k.titel);
    expect(f.details).toEqual(k.details);
  });

  it('[REQ-071/AK-7] Feuilleton: Seitentitel „Deine Bücher“ exakt gleich groß wie bei „Klassisch“', async () => {
    await starte();
    const klassisch = cs(screen.getByRole('heading', { name: 'Deine Bücher' })).fontSize;
    expect(klassisch).not.toBe('');
    cleanup();
    await starte({ stil: 'feuilleton' });
    expect(cs(screen.getByRole('heading', { name: 'Deine Bücher' })).fontSize).toBe(klassisch);
    for (const t of Array.from(document.querySelectorAll('[data-buchtitel]'))) expect(cs(t).fontWeight).toMatch(/^(400|normal)$/);
  });

  it('[REQ-071/AK-8] Feuilleton: Filterleiste als Text, inaktiv Tertiär, aktiv Primär mit Unterstrich; Tippfläche unverändert', async () => {
    await starte();
    const hoeheK = Array.from(document.querySelectorAll('[data-filter]')).map((e) => [cs(e).height, cs(e).minHeight].join('|'));
    cleanup();
    await starte({ stil: 'feuilleton' });
    const filter = Array.from(document.querySelectorAll<HTMLElement>('[data-filter]'));
    expect(filter.length).toBeGreaterThan(1);
    // Plausibilität der Farbprobe: Rollen unterscheidbar und nicht leer
    expect(PRIMAER()).not.toBe('');
    expect(PRIMAER()).not.toBe(TERTIAER());
    expect(GHOSTFRAME()).not.toBe(PRIMAER());
    const aktiv = filter.filter((e) => e.getAttribute('aria-pressed') === 'true');
    expect(aktiv).toHaveLength(1);
    for (const e of filter) {
      expect(keineFlaeche(e), e.textContent ?? '').toBe(true);
      if (e.getAttribute('aria-pressed') === 'true') {
        expect(cs(e).color).toBe(PRIMAER());
        linie(e, 'Bottom', PRIMAER());
      } else {
        expect(cs(e).color).toBe(TERTIAER());
        expect(['transparent', 'rgba(0, 0, 0, 0)']).toContain(cs(e).borderBottomColor);
      }
    }
    expect(filter.map((e) => [cs(e).height, cs(e).minHeight].join('|'))).toEqual(hoeheK);
    // anderer Filter angetippt → Unterstrich wandert
    await tippe(filter[1]);
    expect(cs(filter[1]).color).toBe(PRIMAER());
    expect(cs(filter[0]).color).toBe(TERTIAER());
  });

  it('[REQ-071/AK-8] Feuilleton: Reiterleiste der Buchdetails ohne Pille, aktiver Reiter Primär mit Unterstrich; Status-Chip als Text mit Unterstrich', async () => {
    await starte({ stil: 'feuilleton' });
    const d = await zuBuchdetails();
    const leiste = d.querySelector('[data-reiterleiste]')!;
    expect(keineFlaeche(leiste)).toBe(true);
    const pille = leiste.querySelector('[data-reiterpille]');
    if (pille) expect(cs(pille).display).toBe('none');
    const reiter = Array.from(leiste.querySelectorAll<HTMLElement>('[role="tab"]'));
    expect(reiter.length).toBeGreaterThan(1);
    for (const r of reiter) {
      expect(keineFlaeche(r)).toBe(true);
      if (r.getAttribute('aria-selected') === 'true') {
        expect(cs(r).color).toBe(PRIMAER());
        linie(r, 'Bottom', PRIMAER());
      } else expect(cs(r).color).toBe(TERTIAER());
    }
    const chip = d.querySelector('[data-stil-rolle~="chip"]')!;
    expect(chip).not.toBeNull();
    expect(keineFlaeche(chip)).toBe(true);
    expect(cs(chip).color).toBe(PRIMAER());
    linie(chip, 'Bottom', PRIMAER());
  });

  it('[REQ-071/AK-8] Feuilleton: Umschaltpille im Fenster „Design“ als Text, aktiv Primär mit Unterstrich', async () => {
    await starte({ stil: 'feuilleton' });
    const f = await oeffneDesign();
    for (const r of Array.from(f.querySelectorAll<HTMLElement>('[data-design-reiter]'))) {
      expect(keineFlaeche(r)).toBe(true);
      if (r.getAttribute('data-design-reiter') === 'farben') {
        expect(cs(r).color).toBe(PRIMAER());
        linie(r, 'Bottom', PRIMAER());
      } else expect(cs(r).color).toBe(TERTIAER());
    }
  });

  it('[REQ-071/AK-9] Feuilleton: Cover-Platzhalter als dünner, eckiger Rahmen in GhostFrame ohne Fläche', async () => {
    await starte({ stil: 'feuilleton' });
    const cover = await vi.waitFor(() => {
      const c = Array.from(document.querySelectorAll('[data-cover-platzhalter]'));
      expect(c.length).toBeGreaterThan(0);
      return c;
    }, W);
    for (const c of cover) {
      expect(keineFlaeche(c)).toBe(true);
      linie(c, 'Top', GHOSTFRAME());
      linie(c, 'Bottom', GHOSTFRAME());
      expect(['0', '0px']).toContain(cs(c).borderRadius);
    }
  });

  it('[REQ-071/AK-9] Feuilleton: Fortschrittsbalken dünn (≤ 3 px)', async () => {
    await starte({ stil: 'feuilleton' });
    const d = await zuBuchdetails();
    const balken = d.querySelector('[data-stil-rolle~="balken"]')!;
    expect(balken).not.toBeNull();
    expect(px(cs(balken).height)).toBeGreaterThan(0);
    expect(px(cs(balken).height)).toBeLessThanOrEqual(3);
  });

  it('[REQ-071/AK-9] Feuilleton: Hauptnavigation auf „Hintergrund“ mit Linie oben; aktives Icon mit Strich in Primär, ohne Fläche', async () => {
    await starte({ stil: 'feuilleton' });
    expect(cs(nav()).backgroundColor).toBe(HINTERGRUND());
    linie(nav(), 'Top', GHOSTFRAME());
    const marken = Array.from(nav().querySelectorAll<HTMLElement>('[data-highlight]'));
    const aktiv = marken.filter((m) => m.getAttribute('data-highlight') === 'active');
    expect(aktiv).toHaveLength(1);
    for (const m of marken) {
      expect(keineFlaeche(m)).toBe(true);
      if (m.getAttribute('data-highlight') === 'active') linie(m, 'Top', PRIMAER());
      else expect(['transparent', 'rgba(0, 0, 0, 0)']).toContain(cs(m).borderTopColor);
    }
  });

  /** F7: Fläche bleibt, eckig, ohne Schatten, Linie oben in GhostFrame. */
  function blattF7(e: Element) {
    expect(keineFlaeche(e), 'Fläche bleibt').toBe(false);
    expect(['0', '0px']).toContain(cs(e).borderRadius);
    expect(['none', ''].includes(cs(e).boxShadow)).toBe(true);
    linie(e, 'Top', GHOSTFRAME());
  }

  it('[REQ-071/AK-11] Feuilleton: Blatt „Maße“ und Statusmenü behalten ihre Fläche, eckig, ohne Schatten, Linie oben', async () => {
    await starte({ stil: 'feuilleton' });
    const d = await zuBuchdetails();
    // Statusmenü (Menü von unten bzw. über dem Inhalt)
    const chip = d.querySelector('[data-stil-rolle~="chip"]')!;
    await tippe(chip);
    const menue = await screen.findByRole('menu', { name: 'Status wählen' }, W);
    blattF7(menue);
    cleanup();
    // Blatt „Maße“ (frisch geöffnete Buchdetails)
    await starte({ stil: 'feuilleton' });
    const d2 = await zuBuchdetails();
    await tippe(d2.querySelector('[data-reiter="details"]')!);
    const zeileMasse = await vi.waitFor(() => {
      const z = d2.querySelector<HTMLElement>('[data-ausgabe-zeile="masse"]');
      expect(z).not.toBeNull();
      return z!;
    }, W);
    await tippe(zeileMasse);
    const blatt = await screen.findByRole('dialog', { name: 'Maße' }, W);
    blattF7(blatt);
  });

  it('[REQ-071/AK-11] Feuilleton: Fenster „Design“ behält seine Fläche, eckig, ohne Schatten, Linie oben', async () => {
    await starte({ stil: 'feuilleton' });
    const f = await oeffneDesign();
    blattF7(f.closest('[data-stil-rolle~="blatt"]') ?? f);
  });

  it('[REQ-071/AK-11] Gegenstück „Klassisch“: Blatt „Maße“ hat keine Linie oben aus dem Feuilleton-Stil', async () => {
    await starte();
    const d = await zuBuchdetails();
    await tippe(d.querySelector('[data-reiter="details"]')!);
    const z = await vi.waitFor(() => {
      const e = d.querySelector<HTMLElement>('[data-ausgabe-zeile="masse"]');
      expect(e).not.toBeNull();
      return e!;
    }, W);
    await tippe(z);
    const blatt = await screen.findByRole('dialog', { name: 'Maße' }, W);
    expect(keineFlaeche(blatt)).toBe(false);
    expect(['0', '0px']).not.toContain(cs(blatt).borderRadius);
  });

  it.each([
    [{}, 'Klassisch · Fraunces · Klassisch'],
    [{ farbdesign: 'salbei', schrift: 'fraunces', stil: 'feuilleton' }, 'Salbei · Fraunces · Feuilleton'],
    [{ farbdesign: 'nachtlektuere', schrift: 'system', stil: 'klassisch' }, 'Nachtlektüre · Systemschrift · Klassisch'],
  ])('[REQ-071/AK-10] Zeile „Design“ zeigt Farbdesign · Schrift · Stil (%j)', async (w, soll) => {
    await starte(w as Record<string, string>);
    await profil();
    await vi.waitFor(() => expect(norm(document.querySelector('[data-design-anzeige]')?.textContent).replace(/\s*›$/, '')).toBe(soll), W);
  });

  it('[REQ-071/AK-10] nach Stilwahl im Fenster zeigt die Zeile ohne Neustart den neuen Stil', async () => {
    await starte({ farbdesign: 'salbei', schrift: 'fraunces' });
    await oeffneStil();
    await tippe(stilZeile('feuilleton'));
    await schliesseDesign();
    await vi.waitFor(() => expect(norm(document.querySelector('[data-design-anzeige]')?.textContent)).toBe('Salbei · Fraunces · Feuilleton ›'), W);
  });
});
