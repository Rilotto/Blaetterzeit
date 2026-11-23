/**
 * Akzeptanztests REQ-068 – Farbdesigns auswählen (Klassisch, Salbei, Nachtlektüre, Raureif, Polarnacht).
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
const zeilen = () => Array.from(fenster()!.querySelectorAll<HTMLElement>('button[data-farbdesign]'));
const zeile = (id: string) => fenster()!.querySelector<HTMLElement>(`button[data-farbdesign="${id}"]`)!;
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
  it('[REQ-068/AK-1] Liste: „Klassisch“, „Salbei“, „Nachtlektüre“, „Raureif“, „Polarnacht“ in dieser Reihenfolge', async () => {
    await starte();
    await oeffneFenster();
    expect(zeilen().map((z) => z.getAttribute('data-farbdesign'))).toEqual(['klassisch', 'salbei', 'nachtlektuere', 'raureif', 'polarnacht']);
    expect(zeilen().map((z) => (z.textContent ?? '').trim())).toEqual([
      expect.stringContaining('Klassisch'),
      expect.stringContaining('Salbei'),
      expect.stringContaining('Nachtlektüre'),
      expect.stringContaining('Raureif'),
      expect.stringContaining('Polarnacht'),
    ]);
  });

  it.each(['klassisch', 'salbei', 'nachtlektuere', 'raureif', 'polarnacht'] as const)('[REQ-068/AK-1] „%s“: fünf Farbkreise Hintergrund, Primär, Sekundär, Tertiär, Dunkelbraun mit den Werten des Designs', async (id) => {
    await starte();
    await oeffneFenster();
    const kreise = Array.from(zeile(id).querySelectorAll<HTMLElement>('[data-farbkreis]'));
    expect(kreise.map((k) => k.getAttribute('data-farbkreis'))).toEqual([...RUBRIKEN]);
    expect(kreise.map((k) => k.getAttribute('data-farbwert')?.toLowerCase())).toEqual(RUBRIKEN.map((r) => farbdesigns[id].werte[r].toLowerCase()));
    // tatsächlich in dieser Farbe dargestellt
    for (const k of kreise) expect(getComputedStyle(k).backgroundColor).toBe(farbeVon(wurzel(), k.getAttribute('data-farbwert')!));
  });

  it('[REQ-068/AK-1] Klassisch zeigt die heutigen Standardfarben, Salbei/Nachtlektüre/Raureif/Polarnacht die vom CEO vorgegebenen Werte', () => {
    for (const r of RUBRIKEN) expect(farbdesigns.klassisch.werte[r]).toBe(farbrubriken[r].wert);
    expect(RUBRIKEN.map((r) => farbdesigns.salbei.werte[r].toUpperCase())).toEqual(['#F3F5EE', '#4E7D63', '#C9D6C3', '#5E6B5A', '#2C3A2F']);
    expect(RUBRIKEN.map((r) => farbdesigns.nachtlektuere.werte[r].toUpperCase())).toEqual(['#2B2420', '#D9A21B', '#5A4A3E', '#B8A58C', '#F1E9DA']);
    expect(RUBRIKEN.map((r) => farbdesigns.raureif.werte[r].toUpperCase())).toEqual(['#F6F8FA', '#2E5A7A', '#C9D8E3', '#5C6B78', '#1E2A35']);
    expect(RUBRIKEN.map((r) => farbdesigns.polarnacht.werte[r].toUpperCase())).toEqual(['#0F1620', '#8EC5E8', '#24364A', '#9BABBB', '#E8F0F6']);
    // Ghost / GhostFrame vom CEO vorgegeben
    expect([farbdesigns.raureif.werte.ghost, farbdesigns.raureif.werte.ghostframe].map((w) => w.toUpperCase())).toEqual(['#EBF0F4', '#D8E0E7']);
    expect([farbdesigns.polarnacht.werte.ghost, farbdesigns.polarnacht.werte.ghostframe].map((w) => w.toUpperCase())).toEqual(['#172030', '#253244']);
    expect([farbdesigns.raureif.dunkel, farbdesigns.polarnacht.dunkel]).toEqual([false, true]);
  });

  it('[REQ-068/AK-2] nie gewählt: App in den Farben von „Klassisch“, „Klassisch“ mit Häkchen, die anderen mit leerem Kreis', async () => {
    await starte();
    await vi.waitFor(() => expect(wurzel()).toHaveAttribute('data-farbdesign', 'klassisch'), W);
    for (const [name, wert] of Object.entries(farbVariablen('klassisch'))) expect(wurzel().style.getPropertyValue(name), name).toBe(wert);
    await oeffneFenster();
    expect(hatHaken('klassisch')).toBe(true);
    expect(hatKreis('salbei')).toBe(true);
    expect(hatKreis('nachtlektuere')).toBe(true);
    expect(hatKreis('raureif')).toBe(true);
    expect(hatKreis('polarnacht')).toBe(true);
    expect(zeile('klassisch')).toHaveAttribute('aria-checked', 'true');
  });

  it('[REQ-068/AK-2] Negativfall: ungültiger gespeicherter Wert gilt als „nicht gewählt“ → Klassisch', async () => {
    const repo = new InMemoryEinstellungRepository();
    await repo.speichern('farbdesign', 'gibtEsNicht');
    await starte(repo);
    await new Promise((r) => setTimeout(r, 50));
    expect(wurzel()).toHaveAttribute('data-farbdesign', 'klassisch');
  });

  it('[REQ-068/AK-3] „Nachtlektüre“ antippen: ganze App sofort in deren Farben (Wurzel, <html>, Navigation, Seite „Bücher“), Häkchen wechselt', async () => {
    await starte();
    await oeffneFenster();
    await tippe(zeile('nachtlektuere'));
    expect(hatHaken('nachtlektuere')).toBe(true);
    expect(hatKreis('klassisch')).toBe(true);
    const n = farbdesigns.nachtlektuere.werte;
    expect(wurzel()).toHaveAttribute('data-farbdesign', 'nachtlektuere');
    expect(wurzel().style.getPropertyValue('--bz-farbe-hintergrund')).toBe(n.hintergrund);
    expect(document.documentElement.style.getPropertyValue('--bz-farbe-hintergrund')).toBe(n.hintergrund);
    expect(document.documentElement).toHaveAttribute('data-farbdesign', 'nachtlektuere');
    // Hauptnavigation: Hintergrund und Aktivfarbe aus dem neuen Design
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

  it('[REQ-068/AK-4] „Salbei“ gewählt: nach Neustart (neue App-Instanz, selber Speicher) weiterhin aktiv', async () => {
    const repo = await starte();
    await oeffneFenster();
    await tippe(zeile('salbei'));
    expect(await repo.lesen('farbdesign')).toBe('salbei');
    cleanup();
    await starte(repo);
    await vi.waitFor(() => expect(wurzel()).toHaveAttribute('data-farbdesign', 'salbei'), W);
    expect(wurzel().style.getPropertyValue('--bz-farbe-primaer')).toBe(farbdesigns.salbei.werte.primaer);
  });

  it('[REQ-068/AK-4] dauerhaft im Standardspeicher: neu geladene App (Module neu) ohne Test-Speicher zeigt „Salbei“', async () => {
    vi.resetModules();
    const A1 = (await import('@/App')).default as ComponentType<{ einstellungRepository?: EinstellungRepository }>;
    render(<A1 />);
    await oeffneFenster();
    await tippe(zeile('salbei'));
    await tippe(fenster()!.querySelector('[data-design-schliessen]')!);
    cleanup();
    await new Promise((r) => setTimeout(r, 50));
    vi.resetModules();
    const A2 = (await import('@/App')).default as ComponentType<{ einstellungRepository?: EinstellungRepository }>;
    render(<A2 />);
    await vi.waitFor(() => expect(wurzel()).toHaveAttribute('data-farbdesign', 'salbei'), W);
  });

  it('[REQ-068/AK-5] jedes Design legt einen gültigen Wert für jede Farbrubrik fest', () => {
    const alle = Object.keys(farbrubriken).sort();
    for (const [id, d] of Object.entries(farbdesigns)) {
      expect(Object.keys(d.werte).sort(), id).toEqual(alle);
      for (const [r, w] of Object.entries(d.werte)) expect(w, `${id}.${r}`).toMatch(/^#[0-9a-f]{6}$/i);
      const vars = farbVariablen(id as keyof typeof farbdesigns);
      for (const r of alle) expect(vars[`--bz-farbe-${r}`], `${id}: --bz-farbe-${r}`).toBeTruthy();
    }
  });
});
