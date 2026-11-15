/**
 * Akzeptanztests REQ-044 – Reiter „Rezension“: Bereich „Bewertung“ mit 14 Kriterien und Filtersymbol.
 * Schnittstellen laut Entwickler (Sprint 05): [data-bereich-bewertung], [data-bewertung-filter],
 * [data-kriterium=id][data-wert], [data-kriterium-name], [data-symbol-nr][data-voll], data-symbol.
 */
import '@testing-library/jest-dom/vitest';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import type { CSSProperties } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { Buch } from '@/domain/buch';
import type { ImageStore } from '@/storage';
import { InMemoryBookRepository } from '@/storage/InMemoryBookRepository';
import { farbVariablen } from '@/theme';
import BuchDetails from '@/views/BuchDetails';

vi.mock('@/buecher/demodaten', () => ({ demoBuecher: [] }));
afterEach(() => cleanup());

const buch = (f: Partial<Buch> = {}): Buch => ({ id: crypto.randomUUID(), titel: 'Testbuch', status: 'ungelesen', ...f });
const bilder = { get: async () => undefined, put: async () => {}, remove: async () => {} } as unknown as ImageStore;
async function zeige(b: Buch = buch()) {
  const repo = new InMemoryBookRepository();
  await repo.save(b);
  render(
    <div style={farbVariablen() as CSSProperties}>
      <BuchDetails buchId={b.id} repository={repo} bildspeicher={bilder} bildquelle={{ scannen: async () => null, galerie: async () => null }} onZurueck={() => {}} />
    </div>,
  );
  const d = await screen.findByRole('region', { name: 'Buchdetails' });
  await vi.waitFor(() => expect(d.querySelector('[data-bereich-bewertung]')).not.toBeNull());
  return { d, repo, id: b.id };
}
async function tippe(el: Element) {
  await act(async () => {
    fireEvent.click(el);
    await new Promise((r) => setTimeout(r, 10));
  });
}
const NAMEN = ['Sterne', 'Tempo', 'Weltenbau', 'Spice', 'Spannung', 'Action', 'Hauptfiguren', 'Nebenfiguren', 'Plot Twist', 'Tränen', 'Romantik', 'Humor', 'Grusel', 'Dialoge'];
const bereich = (d: HTMLElement) => d.querySelector<HTMLElement>('[data-bereich-bewertung]')!;
const zeilen = (d: HTMLElement) => [...bereich(d).querySelectorAll<HTMLElement>('[data-kriterium]')];
const namen = (d: HTMLElement) => zeilen(d).map((z) => z.querySelector('[data-kriterium-name]')?.textContent?.trim());
const zustand = (d: HTMLElement) => zeilen(d).map((z) => `${z.getAttribute('data-kriterium')}=${z.getAttribute('data-wert')}:${[...z.querySelectorAll('[data-symbol-nr]')].map((s) => s.getAttribute('data-voll')).join(',')}`);

describe('REQ-044 Bereich „Bewertung“', () => {
  it('[REQ-044/AK-1] Reiter „Rezension“ aktiv → Überschrift „Bewertung“ mit Filtersymbol rechts daneben', async () => {
    const { d } = await zeige();
    expect(d.querySelector('[data-reiter="rezension"]')!.getAttribute('data-aktiv')).toBe('true');
    const ueberschrift = [...bereich(d).querySelectorAll('h1,h2,h3,h4')].find((h) => h.textContent?.trim() === 'Bewertung');
    expect(ueberschrift).toBeTruthy();
    const filter = bereich(d).querySelector('[data-bewertung-filter]')!;
    expect(filter).not.toBeNull();
    expect(filter.querySelector('[data-symbol]')).not.toBeNull();
    expect(ueberschrift!.compareDocumentPosition(filter) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it('[REQ-044/AK-1] Negativfall: in einem anderen Reiter ist der Bereich „Bewertung“ nicht sichtbar', async () => {
    const { d } = await zeige();
    await tippe(d.querySelector('[data-reiter="notizbuch"]')!);
    expect(d.querySelector('[data-bereich-bewertung]')).toBeNull();
  });

  it('[REQ-044/AK-2] genau 14 Kriterien in fester Reihenfolge, „Sterne“ zuerst', async () => {
    const { d } = await zeige();
    expect(namen(d)).toEqual(NAMEN);
  });

  it('[REQ-044/AK-2] Reihenfolge bleibt gleich, auch wenn einzelne Kriterien bewertet sind', async () => {
    const { d } = await zeige(buch({ bewertungen: { dialoge: 5, tempo: 2 } } as Partial<Buch>));
    expect(namen(d)).toEqual(NAMEN);
    expect(namen(d)[0]).toBe('Sterne');
  });

  it('[REQ-044/AK-3] jede Kriterienzeile hat Namen und genau fünf Symbole desselben Kriteriums', async () => {
    const { d } = await zeige();
    for (const z of zeilen(d)) {
      expect(z.querySelector('[data-kriterium-name]')?.textContent?.trim()).toBeTruthy();
      const symbole = [...z.querySelectorAll('[data-symbol-nr]')];
      expect(symbole.map((s) => s.getAttribute('data-symbol-nr'))).toEqual(['1', '2', '3', '4', '5']);
      const icons = new Set(symbole.map((s) => s.querySelector('[data-symbol]')?.getAttribute('data-symbol')));
      expect(icons.size).toBe(1);
    }
  });

  it('[REQ-044/AK-4] Filtersymbol antippen: Kriterien, Reihenfolge, Bewertungen unverändert, kein Menü/Fenster, nichts gespeichert', async () => {
    const b = buch({ bewertungen: { sterne: 3, spice: 1 } } as Partial<Buch>);
    const { d, repo } = await zeige(b);
    const vorher = zustand(d);
    const spy = vi.spyOn(repo, 'save');
    await tippe(bereich(d).querySelector('[data-bewertung-filter]')!);
    await tippe(bereich(d).querySelector('[data-bewertung-filter]')!);
    expect(zustand(d)).toEqual(vorher);
    expect(namen(d)).toEqual(NAMEN);
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(screen.queryByRole('menu')).toBeNull();
    expect(spy).not.toHaveBeenCalled();
  });
});
