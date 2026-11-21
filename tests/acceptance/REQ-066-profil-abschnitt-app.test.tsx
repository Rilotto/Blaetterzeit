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
import { InMemoryEinstellungRepository, type ImageStore } from '@/storage';
import { InMemoryBookRepository } from '@/storage/InMemoryBookRepository';
import BuchDetails from '@/views/BuchDetails';

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

  it('[REQ-066/AK-1] Karte „App“ sieht aus wie die Karte „Ausgabe“: gleiche Fläche, Zeile, Bezeichnung, Wert, Pfeil; Fläche hell (Kartenfläche)', async () => {
    // Referenz: Karte „Ausgabe“ in den Buchdetails (REQ-056)
    const repo = new InMemoryBookRepository();
    const b = { id: crypto.randomUUID(), titel: 'Momo', autor: 'Michael Ende', status: 'ungelesen' } as const;
    await repo.save({ ...b });
    const bilder = { get: async () => undefined, put: async () => {}, remove: async () => {} } as unknown as ImageStore;
    render(<BuchDetails buchId={b.id} repository={repo} bildspeicher={bilder} bildquelle={{ scannen: async () => null, galerie: async () => null }} onZurueck={() => {}} />);
    const d = await screen.findByRole('region', { name: 'Buchdetails' }, W);
    await tippe(d.querySelector('[data-reiter="details"]')!);
    const ausgabe = await vi.waitFor(() => {
      const e = d.querySelector<HTMLElement>('[data-ausgabe-karte]');
      expect(e).not.toBeNull();
      return e!;
    }, W);
    const letzteZeile = ausgabe.querySelector<HTMLElement>('[data-ausgabe-zeile="hinzugefuegt"]')!;
    const mitPfeil = ausgabe.querySelector<HTMLElement>('[data-zeile-pfeil]')!;
    const normaleZeile = Array.from(ausgabe.querySelectorAll<HTMLElement>('[data-ausgabe-zeile]')).find((z) => z.querySelector('[data-zeile-pfeil]'))!;
    const ref = {
      karte: ausgabe.style.cssText,
      zeile: (() => { const c = letzteZeile.cloneNode() as HTMLElement; c.style.cursor = ''; return c.style.cssText; })(),
      bezeichnung: letzteZeile.querySelector<HTMLElement>('[data-zeile-bezeichnung]')!.style.cssText,
      wert: normaleZeile.querySelector<HTMLElement>('[data-zeile-wert]')!.style.cssText,
      pfeil: mitPfeil.style.cssText,
      pfeilText: norm(mitPfeil.textContent),
    };
    cleanup();

    await starteMit();
    const zeile = await profil();
    const karte = document.querySelector<HTMLElement>('[data-profil-karte]')!;
    expect(karte.contains(zeile)).toBe(true);
    expect(karte.style.backgroundColor).toBe('var(--bz-farbe-kartenflaeche)');
    expect(karte.style.cssText).toBe(ref.karte);
    const z = zeile.cloneNode() as HTMLElement;
    z.style.cursor = '';
    expect(z.style.cssText).toBe(ref.zeile);
    expect(zeile.querySelector<HTMLElement>('[data-zeile-bezeichnung]')?.style.cssText).toBe(ref.bezeichnung);
    expect(zeile.querySelector<HTMLElement>('[data-zeile-wert]')?.style.cssText).toBe(ref.wert);
    const pfeil = zeile.querySelector<HTMLElement>('[data-zeile-pfeil]');
    expect(pfeil?.style.cssText).toBe(ref.pfeil);
    expect(norm(pfeil?.textContent)).toBe(ref.pfeilText);
    // Fläche hebt sich hell vom Hintergrund ab (nicht die Rubrik „Hintergrund“)
    expect(karte.style.backgroundColor).not.toBe('var(--bz-farbe-hintergrund)');
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
