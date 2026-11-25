/**
 * Akzeptanztests REQ-069 – Schrift auswählen (Systemschrift, Fraunces).
 * Abgeleitet aus dem REQ-Text. Schnittstellen laut Entwickler (Sprint 06 Teil C): `schriften` (src/theme/schrift.ts),
 * App-Prop `einstellungRepository`, button[data-schrift-zeile] mit [data-schrift-beispiel], [data-haken]/[data-kreis],
 * Wurzel und <html> mit data-schrift; App-Schrift als Variable --bz-schrift.
 */
import '@testing-library/jest-dom/vitest';
import { act, cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import type { ComponentType } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import App from '@/App';
import { InMemoryEinstellungRepository, type EinstellungRepository } from '@/storage';
import { schriften } from '@/theme';

vi.mock('@/buecher/demodaten', () => ({ demoBuecher: [] }));
beforeEach(() => localStorage.clear());
afterEach(async () => {
  cleanup();
  localStorage.clear();
  await new Promise((r) => setTimeout(r, 50));
});

const W = { timeout: 3000 };
const BEISPIEL = 'Deine Bücher warten auf dich …';
const nav = () => screen.getByRole('navigation', { name: 'Hauptnavigation' });
async function tippe(el: Element) {
  await act(async () => {
    fireEvent.click(el);
    await new Promise((r) => setTimeout(r, 10));
  });
}
const ohneQuotes = (s: string) => s.replace(/["']/g, '').replace(/\s*,\s*/g, ',').trim();
const wurzel = () => document.querySelector<HTMLElement>('[data-app-wurzel]')!;
const fenster = () => screen.queryByRole('dialog', { name: 'Design' });
const zeile = (id: string) => fenster()!.querySelector<HTMLElement>(`button[data-schrift-zeile="${id}"]`)!;
const hatHaken = (id: string) => zeile(id).querySelector('[data-haken]') !== null && zeile(id).querySelector('[data-kreis]') === null;
const hatKreis = (id: string) => zeile(id).querySelector('[data-kreis]') !== null && zeile(id).querySelector('[data-haken]') === null;
/** Berechnete Schrift eines Navigationstexts (außerhalb der Schriftliste). */
const navSchrift = () => ohneQuotes(getComputedStyle(within(nav()).getByText('Bücher')).fontFamily);

async function starte(repo: EinstellungRepository = new InMemoryEinstellungRepository(), A: ComponentType<{ einstellungRepository?: EinstellungRepository }> = App) {
  render(<A einstellungRepository={repo} />);
  return repo;
}
async function oeffneSchriftart() {
  await tippe(within(nav()).getByRole('button', { name: 'Profil' }));
  const z = await vi.waitFor(() => {
    const e = document.querySelector<HTMLElement>('[data-profil-zeile="design"]');
    expect(e).not.toBeNull();
    return e!;
  }, W);
  await tippe(z);
  const f = await screen.findByRole('dialog', { name: 'Design' }, W);
  await tippe(f.querySelector('[data-design-reiter="schriftart"]')!);
  return f;
}

describe('REQ-069 Schriftauswahl', () => {
  it('[REQ-069/AK-1] Liste: „Systemschrift“ und „Fraunces“, je mit dem Beispielsatz', async () => {
    await starte();
    const f = await oeffneSchriftart();
    const ids = Array.from(f.querySelectorAll('button[data-schrift-zeile]')).map((z) => z.getAttribute('data-schrift-zeile'));
    expect(ids).toEqual(['system', 'fraunces']);
    expect(zeile('system')).toHaveTextContent('Systemschrift');
    expect(zeile('fraunces')).toHaveTextContent('Fraunces');
    for (const id of ids) expect(zeile(id!).querySelector('[data-schrift-beispiel]')).toHaveTextContent(BEISPIEL);
  });

  it.each(['system', 'fraunces'] as const)('[REQ-069/AK-1] Zeile „%s“: Name und Beispielsatz in genau dieser Schrift', async (id) => {
    await starte();
    await oeffneSchriftart();
    const soll = ohneQuotes(schriften[id].folge);
    const beispiel = zeile(id).querySelector<HTMLElement>('[data-schrift-beispiel]')!;
    const name = within(zeile(id)).getByText(schriften[id].name);
    expect(ohneQuotes(getComputedStyle(beispiel).fontFamily)).toBe(soll);
    expect(ohneQuotes(getComputedStyle(name).fontFamily)).toBe(soll);
  });

  it('[REQ-069/AK-1] auch bei aktiver Systemschrift erscheint die Zeile „Fraunces“ in Fraunces (Ausnahme Schriftliste)', async () => {
    await starte();
    await oeffneSchriftart();
    await tippe(zeile('system'));
    expect(ohneQuotes(getComputedStyle(zeile('fraunces').querySelector('[data-schrift-beispiel]')!).fontFamily)).toBe(ohneQuotes(schriften.fraunces.folge));
  });

  it('[REQ-069/AK-2] nie gewählt: Texte in Fraunces, „Fraunces“ mit Häkchen, „Systemschrift“ mit leerem Kreis', async () => {
    await starte();
    expect(wurzel()).toHaveAttribute('data-schrift', 'fraunces');
    expect(ohneQuotes(wurzel().style.getPropertyValue('--bz-schrift'))).toBe(ohneQuotes(schriften.fraunces.folge));
    expect(navSchrift()).toMatch(/^Fraunces/);
    await oeffneSchriftart();
    expect(hatHaken('fraunces')).toBe(true);
    expect(hatKreis('system')).toBe(true);
    expect(zeile('fraunces')).toHaveAttribute('aria-checked', 'true');
  });

  it('[REQ-069/AK-3] „Systemschrift“ antippen: Texte außerhalb der Liste sofort in Systemschrift, Häkchen wechselt', async () => {
    const repo = await starte();
    await oeffneSchriftart();
    await tippe(zeile('system'));
    expect(hatHaken('system')).toBe(true);
    expect(hatKreis('fraunces')).toBe(true);
    expect(wurzel()).toHaveAttribute('data-schrift', 'system');
    expect(document.documentElement).toHaveAttribute('data-schrift', 'system');
    expect(navSchrift()).toBe(ohneQuotes(schriften.system.folge));
    const titel = within(fenster()!).getByRole('heading', { name: 'Design' });
    expect(ohneQuotes(getComputedStyle(titel).fontFamily)).toBe(ohneQuotes(schriften.system.folge));
    expect(await repo.lesen('schrift')).toBe('system');
  });

  it('[REQ-069/AK-4] „Systemschrift“ gewählt: nach Neustart (neue App-Instanz, selber Speicher) weiterhin aktiv', async () => {
    const repo = await starte();
    await oeffneSchriftart();
    await tippe(zeile('system'));
    cleanup();
    await starte(repo);
    await vi.waitFor(() => expect(wurzel()).toHaveAttribute('data-schrift', 'system'), W);
    expect(navSchrift()).toBe(ohneQuotes(schriften.system.folge));
  });

  it('[REQ-069/AK-4] dauerhaft im Standardspeicher: neu geladene App (Module neu) zeigt „Systemschrift“', async () => {
    vi.resetModules();
    const A1 = (await import('@/App')).default as ComponentType<{ einstellungRepository?: EinstellungRepository }>;
    render(<A1 />);
    await oeffneSchriftart();
    await tippe(zeile('system'));
    await tippe(fenster()!.querySelector('[data-design-schliessen]')!);
    cleanup();
    await new Promise((r) => setTimeout(r, 50));
    vi.resetModules();
    const A2 = (await import('@/App')).default as ComponentType<{ einstellungRepository?: EinstellungRepository }>;
    render(<A2 />);
    await vi.waitFor(() => expect(wurzel()).toHaveAttribute('data-schrift', 'system'), W);
  });

  it('[REQ-069/AK-5] Nachtlektüre + Fraunces → Systemschrift wählen: Nachtlektüre bleibt; danach Salbei wählen: Systemschrift bleibt', async () => {
    const repo = new InMemoryEinstellungRepository();
    await repo.speichern('farbdesign', 'nachtlektuere');
    await repo.speichern('schrift', 'fraunces');
    await starte(repo);
    await vi.waitFor(() => expect(wurzel()).toHaveAttribute('data-farbdesign', 'nachtlektuere'), W);
    const f = await oeffneSchriftart();
    await tippe(zeile('system'));
    expect(wurzel()).toHaveAttribute('data-farbdesign', 'nachtlektuere');
    expect(wurzel()).toHaveAttribute('data-schrift', 'system');
    await tippe(f.querySelector('[data-design-reiter="farben"]')!);
    // Nachtlektüre aktiv → Pille „Dunkel“ (REQ-110); Salbei steht unter „Hell“
    await tippe(within(f).getByRole('tab', { name: 'Hell' }));
    await tippe(f.querySelector('button[data-farbdesign="salbei"]')!);
    expect(wurzel()).toHaveAttribute('data-farbdesign', 'salbei');
    expect(wurzel()).toHaveAttribute('data-schrift', 'system');
    expect(await repo.lesen('farbdesign')).toBe('salbei');
    expect(await repo.lesen('schrift')).toBe('system');
  });
});
