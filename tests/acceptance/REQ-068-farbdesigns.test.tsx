/**
 * Akzeptanztests REQ-068 – Farbdesigns auswählen (Klassisch, Salbei, Nachtlektüre, Raureif, Polarnacht, Minztraube, Traubennacht),
 * Liste getrennt nach den Pillen „Hell“ / „Dunkel“ (REQ-110, Stand 2026-11-25).
 * Abgeleitet aus dem REQ-Text. Konkrete Farbwerte sind Standardwerte auf Zuruf (kein AK); erwartete Werte
 * kommen deshalb aus der zentralen Definition `farbdesigns` (src/theme/farben.ts).
 * Schnittstellen laut Entwickler (Sprint 06 Teil C): App-Prop `einstellungRepository`; button[data-farbdesign]
 * mit [data-farbkreis][data-farbwert], [data-haken] bzw. [data-kreis]; Wurzel und <html> mit data-farbdesign.
 */
import '@testing-library/jest-dom/vitest';
import { act, cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import type { ComponentType } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import App from '@/App';
import { InMemoryEinstellungRepository, type EinstellungRepository } from '@/storage';
import { farbdesigns, farbrubriken, farbVariablen } from '@/theme';

vi.mock('@/buecher/demodaten', () => ({ demoBuecher: [] }));
beforeEach(() => localStorage.clear());
afterEach(async () => {
  cleanup();
  localStorage.clear();
  await new Promise((r) => setTimeout(r, 50));
});

const W = { timeout: 3000 };
const nav = () => screen.getByRole('navigation', { name: 'Hauptnavigation' });
async function tippe(el: Element) {
  await act(async () => {
    fireEvent.click(el);
    await new Promise((r) => setTimeout(r, 10));
  });
}
const wurzel = () => document.querySelector<HTMLElement>('[data-app-wurzel]')!;
const fenster = () => screen.queryByRole('dialog', { name: 'Design' });
/** Sichtbar = weder per hidden/aria-hidden noch per display:none/visibility:hidden ausgeblendet (auch nicht über Vorfahren). */
function sichtbar(e: Element | null): boolean {
  for (let n: Element | null = e; n; n = n.parentElement) {
    if (n.hasAttribute('hidden') || n.getAttribute('aria-hidden') === 'true') return false;
    const st = getComputedStyle(n);
    if (st.display === 'none' || st.visibility === 'hidden') return false;
  }
  return true;
}
/** Angezeigte Farbdesign-Zeilen (nur die der aktiven Pille). */
const zeilen = () => Array.from(fenster()!.querySelectorAll<HTMLElement>('button[data-farbdesign]')).filter(sichtbar);
const ids = () => zeilen().map((z) => z.getAttribute('data-farbdesign'));
/** Pille „Hell“ / „Dunkel“ über Rolle und Text. */
function pille(name: 'Hell' | 'Dunkel') {
  for (const rolle of ['tab', 'radio', 'button'] as const) {
    const t = within(fenster()!).queryAllByRole(rolle, { name }).filter(sichtbar);
    if (t.length === 1) return t[0];
  }
  throw new Error(`Pille „${name}“ nicht gefunden`);
}
async function zuPille(name: 'Hell' | 'Dunkel') {
  await tippe(pille(name));
  await vi.waitFor(() => expect(ids().length).toBeGreaterThan(0), W);
}
const HELL = ['klassisch', 'salbei', 'raureif', 'minztraube'] as const;
const DUNKEL = ['nachtlektuere', 'polarnacht', 'traubennacht'] as const;
const ALLE = [...HELL, ...DUNKEL] as const;
/** Einordnung hell/dunkel an der zentralen Stelle – akzeptiert `dunkel: boolean`, `hell: boolean` oder ein Feld mit Wert „hell“/„dunkel“. */
function einordnung(id: string): 'hell' | 'dunkel' | undefined {
  const d = (farbdesigns as unknown as Record<string, Record<string, unknown>>)[id];
  if (typeof d.dunkel === 'boolean') return d.dunkel ? 'dunkel' : 'hell';
  if (typeof d.hell === 'boolean') return d.hell ? 'hell' : 'dunkel';
  for (const v of Object.values(d)) if (v === 'hell' || v === 'dunkel') return v;
  return undefined;
}
const zeile = (id: string) => zeilen().find((z) => z.getAttribute('data-farbdesign') === id)!;
const hatHaken = (id: string) => zeile(id).querySelector('[data-haken]') !== null && zeile(id).querySelector('[data-kreis]') === null;
const hatKreis = (id: string) => zeile(id).querySelector('[data-kreis]') !== null && zeile(id).querySelector('[data-haken]') === null;
const RUBRIKEN = ['hintergrund', 'primaer', 'sekundaer', 'tertiaer', 'dunkelbraun'] as const;

function farbeVon(ctx: HTMLElement, ausdruck: string) {
  const p = document.createElement('span');
  p.style.setProperty('color', ausdruck);
  ctx.appendChild(p);
  const w = getComputedStyle(p).color;
  p.remove();
  return w;
}

async function starte(repo: EinstellungRepository = new InMemoryEinstellungRepository(), A: ComponentType<{ einstellungRepository?: EinstellungRepository }> = App) {
  render(<A einstellungRepository={repo} />);
  return repo;
}
async function oeffneFenster() {
  await tippe(within(nav()).getByRole('button', { name: 'Profil' }));
  const z = await vi.waitFor(() => {
    const e = document.querySelector<HTMLElement>('[data-profil-zeile="design"]');
    expect(e).not.toBeNull();
    return e!;
  }, W);
  await tippe(z);
  return screen.findByRole('dialog', { name: 'Design' }, W);
}

describe('REQ-068 Farbdesigns', () => {
  it('[REQ-068/AK-1] unter „Hell“: Klassisch, Salbei, Raureif, Minztraube; unter „Dunkel“: Nachtlektüre, Polarnacht, Traubennacht – je in dieser Reihenfolge', async () => {
    await starte();
    await oeffneFenster();
    await zuPille('Hell');
    expect(ids()).toEqual([...HELL]);
    expect(zeilen().map((z) => (z.textContent ?? '').trim())).toEqual([
      expect.stringContaining('Klassisch'),
      expect.stringContaining('Salbei'),
      expect.stringContaining('Raureif'),
      expect.stringContaining('Minztraube'),
    ]);
    await zuPille('Dunkel');
    expect(ids()).toEqual([...DUNKEL]);
    expect(zeilen().map((z) => (z.textContent ?? '').trim())).toEqual([
      expect.stringContaining('Nachtlektüre'),
      expect.stringContaining('Polarnacht'),
      expect.stringContaining('Traubennacht'),
    ]);
  });

  it('[REQ-068/AK-1] Reihenfolge bleibt auch nach Hin- und Zurückwechseln Dunkel → Hell erhalten', async () => {
    await starte();
    await oeffneFenster();
    await zuPille('Dunkel');
    await zuPille('Hell');
    expect(ids()).toEqual([...HELL]);
    await zuPille('Dunkel');
    expect(ids()).toEqual([...DUNKEL]);
  });

  it('[REQ-068/AK-1] zentrale Stelle: genau sieben Designs, jedes genau als hell oder dunkel eingeordnet', () => {
    expect(Object.keys(farbdesigns).sort()).toEqual([...ALLE].sort());
    for (const id of HELL) expect(einordnung(id), id).toBe('hell');
    for (const id of DUNKEL) expect(einordnung(id), id).toBe('dunkel');
    expect(ALLE.map((id) => farbdesigns[id].name)).toEqual(['Klassisch', 'Salbei', 'Raureif', 'Minztraube', 'Nachtlektüre', 'Polarnacht', 'Traubennacht']);
  });

  it.each(ALLE)('[REQ-068/AK-1] „%s“: fünf Farbkreise Hintergrund, Primär, Sekundär, Tertiär, Dunkelbraun mit den Werten des Designs', async (id) => {
    await starte();
    await oeffneFenster();
    await zuPille((HELL as readonly string[]).includes(id) ? 'Hell' : 'Dunkel');
    const kreise = Array.from(zeile(id).querySelectorAll<HTMLElement>('[data-farbkreis]'));
    expect(kreise.map((k) => k.getAttribute('data-farbkreis'))).toEqual([...RUBRIKEN]);
    expect(kreise.map((k) => k.getAttribute('data-farbwert')?.toLowerCase())).toEqual(RUBRIKEN.map((r) => farbdesigns[id].werte[r].toLowerCase()));
    // tatsächlich in dieser Farbe dargestellt
    for (const k of kreise) expect(getComputedStyle(k).backgroundColor).toBe(farbeVon(wurzel(), k.getAttribute('data-farbwert')!));
  });

  it('[REQ-068/AK-1] Klassisch zeigt die heutigen Standardfarben, die übrigen Designs die vom CEO vorgegebenen Werte', () => {
    for (const r of RUBRIKEN) expect(farbdesigns.klassisch.werte[r]).toBe(farbrubriken[r].wert);
    expect(RUBRIKEN.map((r) => farbdesigns.salbei.werte[r].toUpperCase())).toEqual(['#F3F5EE', '#4E7D63', '#C9D6C3', '#5E6B5A', '#2C3A2F']);
    expect(RUBRIKEN.map((r) => farbdesigns.nachtlektuere.werte[r].toUpperCase())).toEqual(['#2B2420', '#D9A21B', '#5A4A3E', '#B8A58C', '#F1E9DA']);
    expect(RUBRIKEN.map((r) => farbdesigns.raureif.werte[r].toUpperCase())).toEqual(['#F6F8FA', '#2E5A7A', '#C9D8E3', '#5C6B78', '#1E2A35']);
    expect(RUBRIKEN.map((r) => farbdesigns.polarnacht.werte[r].toUpperCase())).toEqual(['#0F1620', '#8EC5E8', '#24364A', '#9BABBB', '#E8F0F6']);
    expect(RUBRIKEN.map((r) => farbdesigns.minztraube.werte[r].toUpperCase())).toEqual(['#F6F8FA', '#9B287B', '#EBCFE3', '#5C164E', '#170F11']);
    expect(RUBRIKEN.map((r) => farbdesigns.traubennacht.werte[r].toUpperCase())).toEqual(['#170F11', '#D46BB6', '#5C164E', '#B79AB0', '#F6F8FA']);
    // Ghost / GhostFrame vom CEO vorgegeben
    const gg = (id: keyof typeof farbdesigns) => [farbdesigns[id].werte.ghost, farbdesigns[id].werte.ghostframe].map((w) => w.toUpperCase());
    expect(gg('raureif')).toEqual(['#EBF0F4', '#D8E0E7']);
    expect(gg('polarnacht')).toEqual(['#172030', '#253244']);
    expect(gg('minztraube')).toEqual(['#EBF0F4', '#D8E0E7']);
    expect(gg('traubennacht')).toEqual(['#22171B', '#402039']);
  });

  it('[REQ-068/AK-2] nie gewählt: App in den Farben von „Klassisch“, „Klassisch“ mit Häkchen, alle anderen unter „Hell“ und „Dunkel“ mit leerem Kreis', async () => {
    await starte();
    await vi.waitFor(() => expect(wurzel()).toHaveAttribute('data-farbdesign', 'klassisch'), W);
    for (const [name, wert] of Object.entries(farbVariablen('klassisch'))) expect(wurzel().style.getPropertyValue(name), name).toBe(wert);
    await oeffneFenster();
    // ohne Wahl ist „Hell“ angezeigt (Klassisch sichtbar, ohne Pillenwechsel)
    expect(ids()).toEqual([...HELL]);
    expect(hatHaken('klassisch')).toBe(true);
    expect(zeile('klassisch')).toHaveAttribute('aria-checked', 'true');
    for (const id of HELL.slice(1)) expect(hatKreis(id), id).toBe(true);
    await zuPille('Dunkel');
    for (const id of DUNKEL) {
      expect(hatKreis(id), id).toBe(true);
      expect(zeile(id)).not.toHaveAttribute('aria-checked', 'true');
    }
    expect(wurzel()).toHaveAttribute('data-farbdesign', 'klassisch');
  });

  it('[REQ-068/AK-2] Negativfall: ungültiger gespeicherter Wert gilt als „nicht gewählt“ → Klassisch', async () => {
    const repo = new InMemoryEinstellungRepository();
    await repo.speichern('farbdesign', 'gibtEsNicht');
    await starte(repo);
    await new Promise((r) => setTimeout(r, 50));
    expect(wurzel()).toHaveAttribute('data-farbdesign', 'klassisch');
  });

  it('[REQ-068/AK-3] auf „Dunkel“ wechseln, „Nachtlektüre“ antippen: ganze App sofort in deren Farben (Wurzel, <html>, Navigation, Seite „Bücher“), Häkchen wechselt', async () => {
    await starte();
    await oeffneFenster();
    await zuPille('Dunkel');
    await tippe(zeile('nachtlektuere'));
    expect(hatHaken('nachtlektuere')).toBe(true);
    expect(hatKreis('polarnacht')).toBe(true);
    expect(hatKreis('traubennacht')).toBe(true);
    await zuPille('Hell');
    expect(hatKreis('klassisch')).toBe(true);
    const n = farbdesigns.nachtlektuere.werte;
    expect(wurzel()).toHaveAttribute('data-farbdesign', 'nachtlektuere');
    expect(wurzel().style.getPropertyValue('--bz-farbe-hintergrund')).toBe(n.hintergrund);
    expect(document.documentElement.style.getPropertyValue('--bz-farbe-hintergrund')).toBe(n.hintergrund);
    expect(document.documentElement).toHaveAttribute('data-farbdesign', 'nachtlektuere');
    // Hauptnavigation: Hintergrund aus dem neuen Design
    let el: HTMLElement | null = nav();
    while (el && /rgba\(0, 0, 0, 0\)|transparent/.test(getComputedStyle(el).backgroundColor)) el = el.parentElement;
    expect(getComputedStyle(el!).backgroundColor).toBe(farbeVon(wurzel(), n.hintergrund));
    // Seite „Bücher“ ohne Neustart
    await tippe(fenster()!.querySelector('[data-design-schliessen]')!);
    await vi.waitFor(() => expect(fenster()).toBeNull(), W);
    await tippe(within(nav()).getByRole('button', { name: 'Bücher' }));
    const h = await screen.findByRole('heading', { name: 'Deine Bücher' }, W);
    expect(getComputedStyle(h).color).toBe(farbeVon(wurzel(), n.tertiaer));
  });

  it.each([
    ['Hell', 'minztraube'],
    ['Dunkel', 'traubennacht'],
    ['Dunkel', 'polarnacht'],
  ] as const)('[REQ-068/AK-3] Variante: unter „%s“ „%s“ antippen wirkt sofort app-weit, Häkchen wechselt', async (p, id) => {
    await starte();
    await oeffneFenster();
    await zuPille(p);
    await tippe(zeile(id));
    expect(hatHaken(id)).toBe(true);
    expect(wurzel()).toHaveAttribute('data-farbdesign', id);
    for (const [name, wert] of Object.entries(farbVariablen(id))) expect(wurzel().style.getPropertyValue(name), name).toBe(wert);
  });

  it('[REQ-068/AK-4] „Salbei“ gewählt: nach Neustart (neue App-Instanz, selber Speicher) weiterhin aktiv', async () => {
    const repo = await starte();
    await oeffneFenster();
    await zuPille('Dunkel');
    await tippe(zeile('polarnacht'));
    await zuPille('Hell');
    await tippe(zeile('salbei'));
    expect(await repo.lesen('farbdesign')).toBe('salbei');
    cleanup();
    await starte(repo);
    await vi.waitFor(() => expect(wurzel()).toHaveAttribute('data-farbdesign', 'salbei'), W);
    expect(wurzel().style.getPropertyValue('--bz-farbe-primaer')).toBe(farbdesigns.salbei.werte.primaer);
  });

  it.each(['minztraube', 'traubennacht'] as const)('[REQ-068/AK-4] Variante: neues Design „%s“ bleibt nach Neustart aktiv und trägt das Häkchen', async (id) => {
    const repo = await starte();
    await oeffneFenster();
    await zuPille(id === 'minztraube' ? 'Hell' : 'Dunkel');
    await tippe(zeile(id));
    expect(await repo.lesen('farbdesign')).toBe(id);
    cleanup();
    await starte(repo);
    await vi.waitFor(() => expect(wurzel()).toHaveAttribute('data-farbdesign', id), W);
    expect(wurzel().style.getPropertyValue('--bz-farbe-primaer')).toBe(farbdesigns[id].werte.primaer);
    await oeffneFenster();
    expect(hatHaken(id)).toBe(true);
  });

  it('[REQ-068/AK-4] dauerhaft im Standardspeicher: neu geladene App (Module neu) ohne Test-Speicher zeigt „Salbei“', async () => {
    vi.resetModules();
    const A1 = (await import('@/App')).default as ComponentType<{ einstellungRepository?: EinstellungRepository }>;
    render(<A1 />);
    await oeffneFenster();
    await zuPille('Hell');
    await tippe(zeile('salbei'));
    await tippe(fenster()!.querySelector('[data-design-schliessen]')!);
    cleanup();
    await new Promise((r) => setTimeout(r, 50));
    vi.resetModules();
    const A2 = (await import('@/App')).default as ComponentType<{ einstellungRepository?: EinstellungRepository }>;
    render(<A2 />);
    await vi.waitFor(() => expect(wurzel()).toHaveAttribute('data-farbdesign', 'salbei'), W);
  });

  it('[REQ-068/AK-5] jedes Design (auch Minztraube, Traubennacht) legt einen gültigen Wert für jede Farbrubrik fest', () => {
    const alle = Object.keys(farbrubriken).sort();
    expect(Object.keys(farbdesigns)).toEqual(expect.arrayContaining(['minztraube', 'traubennacht']));
    for (const [id, d] of Object.entries(farbdesigns)) {
      expect(Object.keys(d.werte).sort(), id).toEqual(alle);
      for (const [r, w] of Object.entries(d.werte)) expect(w, `${id}.${r}`).toMatch(/^#[0-9a-f]{6}$/i);
      const vars = farbVariablen(id as keyof typeof farbdesigns);
      for (const r of alle) expect(vars[`--bz-farbe-${r}`], `${id}: --bz-farbe-${r}`).toBeTruthy();
    }
  });
});
