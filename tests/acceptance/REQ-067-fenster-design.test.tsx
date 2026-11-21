/**
 * Akzeptanztests REQ-067 – Fenster „Design“: Blatt mit Umschaltpille „Farben / Schriftart“ und Live-Vorschau.
 * Abgeleitet aus dem REQ-Text. Schnittstellen laut Entwickler (Sprint 06 Teil C):
 *  - Fenster [data-fenster-design] (role=dialog „Design“), [data-ziehgriff], [data-design-schliessen],
 *    [data-design-vorschau], [data-design-reiter=farben|schriftart][aria-selected]
 *  - button[data-farbdesign], button[data-schrift-zeile]; Wurzel [data-app-wurzel] mit data-farbdesign/data-schrift.
 */
import '@testing-library/jest-dom/vitest';
import { act, cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import App from '@/App';
import { InMemoryEinstellungRepository } from '@/storage';
import { farbdesigns, schriften } from '@/theme';

vi.mock('@/buecher/demodaten', () => ({ demoBuecher: [] }));
beforeEach(() => localStorage.clear());
afterEach(async () => {
  cleanup();
  localStorage.clear();
  // verspätetes popstate eines über X/Ziehen geschlossenen Fensters abwarten
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
const reiter = (id: 'farben' | 'schriftart') => fenster()!.querySelector<HTMLElement>(`[data-design-reiter="${id}"]`)!;
const farbZeilen = () => Array.from(fenster()!.querySelectorAll<HTMLElement>('button[data-farbdesign]'));
const schriftZeilen = () => Array.from(fenster()!.querySelectorAll<HTMLElement>('button[data-schrift-zeile]'));
const vorschau = () => fenster()!.querySelector<HTMLElement>('[data-design-vorschau]')!;

async function oeffne() {
  const repo = new InMemoryEinstellungRepository();
  render(<App einstellungRepository={repo} />);
  await tippe(within(nav()).getByRole('button', { name: 'Profil' }));
  const zeile = await vi.waitFor(() => {
    const z = document.querySelector<HTMLElement>('[data-profil-zeile="design"]');
    expect(z).not.toBeNull();
    return z!;
  }, W);
  await tippe(zeile);
  await screen.findByRole('dialog', { name: 'Design' }, W);
  return repo;
}
async function ziehe(strecke: number) {
  const g = fenster()!.querySelector<HTMLElement>('[data-ziehgriff]')!;
  await act(async () => {
    fireEvent.pointerDown(g, { clientY: 100, pointerId: 1 });
    fireEvent.pointerMove(g, { clientY: 100 + strecke / 2, pointerId: 1 });
    fireEvent.pointerMove(g, { clientY: 100 + strecke, pointerId: 1 });
    fireEvent.pointerUp(g, { clientY: 100 + strecke, pointerId: 1 });
    await new Promise((r) => setTimeout(r, 20));
  });
}

describe('REQ-067 Fenster „Design“', () => {
  it('[REQ-067/AK-1] Blatt mit Ziehgriff, Titel „Design“, X, Live-Vorschau und Umschaltpille „Farben | Schriftart“ in dieser Reihenfolge', async () => {
    await oeffne();
    const f = fenster()!;
    const griff = f.querySelector('[data-ziehgriff]')!;
    const titel = within(f).getByRole('heading', { name: 'Design' });
    const x = f.querySelector('[data-design-schliessen]')!;
    expect(griff).not.toBeNull();
    expect(x).not.toBeNull();
    expect(x).toHaveAccessibleName('Schließen');
    const vor = (a: Node, b: Node) => (a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING) !== 0;
    expect(vor(griff, titel)).toBe(true);
    expect(vor(titel, vorschau())).toBe(true);
    expect(vor(vorschau(), reiter('farben'))).toBe(true);
    expect(vor(reiter('farben'), reiter('schriftart'))).toBe(true);
    expect(reiter('farben')).toHaveTextContent('Farben');
    expect(reiter('schriftart')).toHaveTextContent('Schriftart');
  });

  it('[REQ-067/AK-1] beim Öffnen ist „Farben“ aktiv, darunter steht die Liste der Farbdesigns', async () => {
    await oeffne();
    expect(reiter('farben')).toHaveAttribute('aria-selected', 'true');
    expect(reiter('schriftart')).toHaveAttribute('aria-selected', 'false');
    expect(farbZeilen().length).toBeGreaterThan(0);
    expect(schriftZeilen()).toHaveLength(0);
    expect(reiter('farben').compareDocumentPosition(farbZeilen()[0]) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it('[REQ-067/AK-2] „Schriftart“ antippen: aktiv, Schriftliste statt Farbdesigns; erneut „Farben“: wieder Farbdesigns', async () => {
    await oeffne();
    await tippe(reiter('schriftart'));
    expect(reiter('schriftart')).toHaveAttribute('aria-selected', 'true');
    expect(reiter('farben')).toHaveAttribute('aria-selected', 'false');
    expect(schriftZeilen().length).toBeGreaterThan(0);
    expect(farbZeilen()).toHaveLength(0);
    await tippe(reiter('farben'));
    expect(reiter('farben')).toHaveAttribute('aria-selected', 'true');
    expect(farbZeilen().length).toBeGreaterThan(0);
    expect(schriftZeilen()).toHaveLength(0);
  });

  it('[REQ-067/AK-3] anderes Farbdesign antippen: Mini-Buchkarte zeigt sofort dessen Farben', async () => {
    await oeffne();
    const vorher = vorschau().style.getPropertyValue('--bz-farbe-hintergrund');
    await tippe(fenster()!.querySelector('button[data-farbdesign="nachtlektuere"]')!);
    const nachher = vorschau().style.getPropertyValue('--bz-farbe-hintergrund') || wurzel().style.getPropertyValue('--bz-farbe-hintergrund');
    expect(nachher.toLowerCase()).toBe(farbdesigns.nachtlektuere.werte.hintergrund.toLowerCase());
    expect(nachher).not.toBe(vorher);
    expect(vorschau().getAttribute('data-farbdesign')).toBe('nachtlektuere');
  });

  it('[REQ-067/AK-3] andere Schrift antippen: Mini-Buchkarte zeigt sofort die neue Schrift', async () => {
    await oeffne();
    await tippe(reiter('schriftart'));
    await tippe(fenster()!.querySelector('button[data-schrift-zeile="system"]')!);
    expect(vorschau().getAttribute('data-schrift')).toBe('system');
    const ff = getComputedStyle(vorschau()).fontFamily;
    expect(ff.replace(/["']/g, '')).toBe(schriften.system.folge.replace(/["']/g, ''));
  });

  it.each(['X', 'Herunterziehen'])('[REQ-067/AK-4] Wahl treffen, über %s schließen: Fenster zu, Profil sichtbar, Wahl bleibt aktiv', async (weg) => {
    const repo = await oeffne();
    await tippe(fenster()!.querySelector('button[data-farbdesign="salbei"]')!);
    await tippe(reiter('schriftart'));
    await tippe(fenster()!.querySelector('button[data-schrift-zeile="system"]')!);
    if (weg === 'X') await tippe(fenster()!.querySelector('[data-design-schliessen]')!);
    else await ziehe(400);
    await vi.waitFor(() => expect(fenster()).toBeNull(), W);
    expect(document.querySelector('[data-profil-zeile="design"]')).toBeInTheDocument();
    expect(wurzel()).toHaveAttribute('data-farbdesign', 'salbei');
    expect(wurzel()).toHaveAttribute('data-schrift', 'system');
    expect(await repo.lesen('farbdesign')).toBe('salbei');
    expect(await repo.lesen('schrift')).toBe('system');
  });

  it('[REQ-067/AK-4] Grenzfall: kurzes Ziehen (10 px) schließt das Fenster nicht', async () => {
    await oeffne();
    await ziehe(10);
    await new Promise((r) => setTimeout(r, 50));
    expect(fenster()).not.toBeNull();
  });
});
