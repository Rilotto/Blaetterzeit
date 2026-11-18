/**
 * Akzeptanztests REQ-066 – Seite „Profil“: Abschnitt „App“ mit Zeile „Design“.
 * Abgeleitet aus dem REQ-Text. Schnittstellen laut Entwickler (Sprint 06 Teil C):
 *  - App nimmt den Prop `einstellungRepository` (Speicher der Designwahl).
 *  - [data-profil-zeile="design"] mit [data-design-anzeige]; Fenster [data-fenster-design] (role=dialog „Design“).
 *  - Auswahl: button[data-farbdesign], button[data-schrift-zeile].
 */
import '@testing-library/jest-dom/vitest';
import { act, cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import App from '@/App';
import { InMemoryEinstellungRepository } from '@/storage';

vi.mock('@/buecher/demodaten', () => ({ demoBuecher: [] }));
beforeEach(() => localStorage.clear());
afterEach(() => {
  cleanup();
  localStorage.clear();
});

const W = { timeout: 3000 };
const norm = (t: string | null | undefined) => (t ?? '').replace(/[\s  ]+/g, ' ').trim();
const nav = () => screen.getByRole('navigation', { name: 'Hauptnavigation' });
async function tippe(el: Element) {
  await act(async () => {
    fireEvent.click(el);
    await new Promise((r) => setTimeout(r, 10));
  });
}
async function starteMit(farbdesign?: string, schrift?: string) {
  const repo = new InMemoryEinstellungRepository();
  if (farbdesign) await repo.speichern('farbdesign', farbdesign);
  if (schrift) await repo.speichern('schrift', schrift);
  render(<App einstellungRepository={repo} />);
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
const anzeige = () => norm(document.querySelector('[data-profil-zeile="design"] [data-design-anzeige]')?.textContent);
const fenster = () => screen.queryByRole('dialog', { name: 'Design' });

describe('REQ-066 Profil › App › Design', () => {
  it('[REQ-066/AK-1] Profil antippen: Überschrift „App“ in Stufe „Label“, darunter Karte mit genau einer Zeile „Design“', async () => {
    await starteMit();
    const zeile = await profil();
    const main = screen.getByRole('main');
    const ueberschrift = within(main).getByText(/^App$/i);
    // Stufe „Label“ (REQ-065): Schriftgröße aus der Label-Variable, Großbuchstaben, gesperrt.
    let n: HTMLElement | null = ueberschrift;
    while (n && !n.style.fontSize) n = n.parentElement;
    expect(n?.style.fontSize).toBe('var(--bz-schriftgroesse-label)');
    expect(getComputedStyle(ueberschrift).textTransform).toBe('uppercase');
    // Überschrift steht vor der Karte, die Karte enthält genau eine Zeile.
    expect(ueberschrift.compareDocumentPosition(zeile) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(main.querySelectorAll('[data-profil-zeile]')).toHaveLength(1);
    expect(norm(zeile.textContent).startsWith('Design')).toBe(true);
    expect(within(zeile).getByText('Design')).toBeInTheDocument();
  });

  it('[REQ-066/AK-1] Profil zeigt nicht „under construction :)“', async () => {
    await starteMit();
    await profil();
    expect(screen.getByRole('main').textContent).not.toContain('under construction');
  });

  it('[REQ-066/AK-2] ohne Wahl: Zeile zeigt „Klassisch · Fraunces ›“', async () => {
    await starteMit();
    await profil();
    await vi.waitFor(() => expect(anzeige()).toBe('Klassisch · Fraunces ›'), W);
  });

  it('[REQ-066/AK-2] Salbei und Systemschrift gewählt: Zeile zeigt „Salbei · Systemschrift ›“', async () => {
    await starteMit('salbei', 'system');
    await profil();
    await vi.waitFor(() => expect(anzeige()).toBe('Salbei · Systemschrift ›'), W);
  });

  it('[REQ-066/AK-2] nach anderer Wahl im Fenster „Design“ zeigt die Zeile ohne Neustart die neue Wahl', async () => {
    await starteMit('salbei', 'system');
    const zeile = await profil();
    await vi.waitFor(() => expect(anzeige()).toBe('Salbei · Systemschrift ›'), W);
    await tippe(zeile);
    const f = await screen.findByRole('dialog', { name: 'Design' }, W);
    await tippe(f.querySelector('button[data-farbdesign="nachtlektuere"]')!);
    await tippe(f.querySelector('[data-design-reiter="schriftart"]')!);
    await tippe(f.querySelector('button[data-schrift-zeile="fraunces"]')!);
    await vi.waitFor(() => expect(anzeige()).toBe('Nachtlektüre · Fraunces ›'), W);
  });

  it('[REQ-066/AK-3] Zeile „Design“ antippen öffnet das Fenster „Design“', async () => {
    await starteMit();
    const zeile = await profil();
    expect(fenster()).toBeNull();
    await tippe(zeile);
    expect(await screen.findByRole('dialog', { name: 'Design' }, W)).toHaveAttribute('data-fenster-design');
  });
});
