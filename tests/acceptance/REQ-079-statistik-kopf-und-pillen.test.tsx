/**
 * Akzeptanztests REQ-079 – Seite „Statistik“: Kopf „Dein Lesen“ und Zeitraum-Pillen (gemerkt).
 * Abgeleitet aus dem REQ-Text. Schnittstellen laut Entwickler (Sprint 09): StatistikAnsicht { buecher, repository,
 * bildspeicher, einstellungRepository, jetzt }; [data-seite="statistik"][data-zeitraumart],
 * [data-zeitraum-pille=woche|monat|jahr][aria-pressed], [data-zeitraum-zurueck|vor], [data-zeitraum-zeile1|2].
 */
import '@testing-library/jest-dom/vitest';
import { act, cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import App from '@/App';
import type { Buch } from '@/domain/buch';
import { createEinstellungRepository, InMemoryEinstellungRepository, type EinstellungRepository } from '@/storage';
import { InMemoryImageStore } from '@/storage/InMemoryImageStore';
import StatistikAnsicht from '@/views/StatistikAnsicht';

vi.mock('@/buecher/demodaten', () => ({ demoBuecher: [] }));
beforeEach(() => localStorage.clear());
afterEach(() => {
  cleanup();
  localStorage.clear();
});

const W = { timeout: 4000 };
const um = (j: number, m: number, t: number, h = 12) => new Date(j, m - 1, t, h);
const HEUTE = um(2026, 11, 22, 15);
const $ = (s: string) => document.querySelector<HTMLElement>(s);
const $$ = (s: string) => Array.from(document.querySelectorAll<HTMLElement>(s));
const norm = (t: string | null | undefined) => (t ?? '').replace(/[\s  ]+/g, ' ').trim();
async function ruhe(ms = 30) {
  await act(async () => {
    await new Promise((r) => setTimeout(r, ms));
  });
}
async function tippe(el: Element | null) {
  expect(el).not.toBeNull();
  await act(async () => {
    fireEvent.click(el!);
    await new Promise((r) => setTimeout(r, 10));
  });
}
async function zeige(repo: EinstellungRepository = new InMemoryEinstellungRepository(), buecher: Buch[] = [], heute = HEUTE) {
  render(<StatistikAnsicht buecher={buecher} einstellungRepository={repo} bildspeicher={new InMemoryImageStore()} jetzt={() => heute} />);
  await waitFor(() => expect($('[data-seite="statistik"]')).not.toBeNull(), W);
  await ruhe();
  return repo;
}
const aktive = () => $$('[data-zeitraum-pille]').filter((p) => p.getAttribute('aria-pressed') === 'true').map((p) => norm(p.textContent));
const titel = () => [norm($('[data-zeitraum-zeile1]')?.textContent), $('[data-zeitraum-zeile2]') ? norm($('[data-zeitraum-zeile2]')!.textContent) : null];
const nav = () => screen.getByRole('navigation', { name: 'Hauptnavigation' });

describe('REQ-079 Kopf und Zeitraum-Pillen', () => {
  it('[REQ-079/AK-1] Menüpunkt „Statistik“: oben „Dein Lesen“, keine Teilen-Schaltfläche, kein „under construction :)“', async () => {
    render(<App einstellungRepository={new InMemoryEinstellungRepository()} />);
    await tippe(within(nav()).getByRole('button', { name: 'Statistik' }));
    const seite = await waitFor(() => {
      const s = $('[data-seite="statistik"]');
      expect(s).not.toBeNull();
      return s!;
    }, W);
    const main = screen.getByRole('main');
    expect(main.textContent).not.toContain('under construction :)');
    const h = within(seite).getByRole('heading', { name: 'Dein Lesen' });
    // „oben“: die Überschrift steht vor allen Pillen und Kacheln
    const ersteP = $('[data-zeitraum-pille]')!;
    expect(h.compareDocumentPosition(ersteP) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(within(seite).queryByRole('button', { name: /teilen|share/i })).toBeNull();
    expect(seite.textContent).not.toMatch(/teilen|share/i);
    expect(seite.querySelector('[aria-label*="eilen"], [title*="eilen"]')).toBeNull();
  });

  it('[REQ-079/AK-1] Gegenstück: andere Menüpunkte ohne Zielansicht zeigen weiterhin den Platzhalter, nicht „Dein Lesen“', async () => {
    render(<App einstellungRepository={new InMemoryEinstellungRepository()} />);
    await tippe(within(nav()).getByRole('button', { name: 'Bibliothek' }));
    expect(norm(screen.getByRole('main').textContent)).toBe('under construction :)');
    expect(screen.queryByText('Dein Lesen')).toBeNull();
  });

  it('[REQ-079/AK-2] genau drei Pillen „Wöchentlich“, „Monatlich“, „Jährlich“ in dieser Reihenfolge, keine „Täglich“', async () => {
    await zeige();
    expect($$('[data-zeitraum-pille]').map((p) => norm(p.textContent))).toEqual(['Wöchentlich', 'Monatlich', 'Jährlich']);
    expect($$('[data-zeitraum-pille]').map((p) => p.getAttribute('data-zeitraum-pille'))).toEqual(['woche', 'monat', 'jahr']);
    expect(screen.queryByText(/Täglich/)).toBeNull();
    expect(aktive()).toHaveLength(1);
  });

  it.each([
    ['Monatlich', 'monat'],
    ['Jährlich', 'jahr'],
    ['Wöchentlich', 'woche'],
  ])('[REQ-079/AK-2] nach Antippen von „%s“ ist genau diese eine Pille aktiv und die Seite auf die Zeitraumart umgestellt', async (name, art) => {
    await zeige(new InMemoryEinstellungRepository());
    await tippe($('[data-zeitraum-pille="monat"]'));
    await tippe(screen.getByRole('button', { name }));
    expect(aktive()).toEqual([name]);
    expect($('[data-seite="statistik"]')).toHaveAttribute('data-zeitraumart', art);
  });

  it('[REQ-079/AK-3] „Jährlich“ angetippt: gespeichert über die Repository-Schnittstelle; Seite verlassen und wieder öffnen → „Jährlich“ aktiv, laufendes Jahr', async () => {
    const repo = await zeige();
    await tippe($('[data-zeitraum-pille="jahr"]'));
    expect(aktive()).toEqual(['Jährlich']);
    expect(titel()).toEqual(['2026', null]);
    await waitFor(async () => expect(await repo.lesen('statistikZeitraum')).toBeDefined(), W);
    cleanup();
    await zeige(repo);
    await waitFor(() => expect(aktive()).toEqual(['Jährlich']), W);
    expect(titel()).toEqual(['2026', null]);
  });

  it('[REQ-079/AK-3] zweiter Durchlauf: nach Neustart (neue Speicherinstanz auf demselben Gerätespeicher) ist „Jährlich“ aktiv', async () => {
    await zeige(createEinstellungRepository());
    await tippe($('[data-zeitraum-pille="jahr"]'));
    await ruhe(50);
    cleanup();
    await zeige(createEinstellungRepository());
    await waitFor(() => expect(aktive()).toEqual(['Jährlich']), W);
    expect(titel()).toEqual(['2026', null]);
  });

  it('[REQ-079/AK-3] Neustart der ganzen App: Menüpunkt „Statistik“ zeigt die zuletzt gewählte Pille „Monatlich“ und den laufenden Monat', async () => {
    const repo = new InMemoryEinstellungRepository();
    render(<App einstellungRepository={repo} />);
    await tippe(within(nav()).getByRole('button', { name: 'Statistik' }));
    await waitFor(() => expect($('[data-zeitraum-pille="monat"]')).not.toBeNull(), W);
    await ruhe();
    await tippe($('[data-zeitraum-pille="monat"]'));
    await ruhe(50);
    cleanup();
    render(<App einstellungRepository={repo} />);
    await tippe(within(nav()).getByRole('button', { name: 'Statistik' }));
    await waitFor(() => expect(aktive()).toEqual(['Monatlich']), W);
    const MONATE = ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'];
    const jetzt = new Date();
    expect(titel()).toEqual([MONATE[jetzt.getMonth()], String(jetzt.getFullYear())]);
  });

  it('[REQ-079/AK-3] Antippen einer Pille nach dem Blättern zeigt wieder den Zeitraum mit dem heutigen Tag', async () => {
    await zeige();
    await tippe($('[data-zeitraum-pille="jahr"]'));
    await tippe($('[data-zeitraum-vor]'));
    await tippe($('[data-zeitraum-vor]'));
    expect(titel()).toEqual(['2028', null]);
    await tippe($('[data-zeitraum-pille="monat"]'));
    expect(titel()).toEqual(['November', '2026']);
    await tippe($('[data-zeitraum-zurueck]'));
    await tippe($('[data-zeitraum-pille="monat"]'));
    expect(titel()).toEqual(['November', '2026']);
  });

  it('[REQ-079/AK-3] gemerkte Wahl „Monatlich“ wird beim Öffnen übernommen (ohne erneutes Antippen)', async () => {
    const repo = new InMemoryEinstellungRepository();
    await zeige(repo);
    await tippe($('[data-zeitraum-pille="monat"]'));
    await ruhe(30);
    cleanup();
    await zeige(repo);
    await waitFor(() => expect(aktive()).toEqual(['Monatlich']), W);
    expect(titel()).toEqual(['November', '2026']);
  });

  it('[REQ-079/AK-4] Erststart ohne gespeicherte Wahl: „Wöchentlich“ aktiv, laufende Woche', async () => {
    await zeige(new InMemoryEinstellungRepository());
    expect(aktive()).toEqual(['Wöchentlich']);
    expect($('[data-seite="statistik"]')).toHaveAttribute('data-zeitraumart', 'woche');
    expect(titel()).toEqual(['16 – 22 Nov', '2026']);
  });

  it('[REQ-079/AK-4] Erststart über die App mit leerem Gerätespeicher: „Wöchentlich“ aktiv', async () => {
    render(<App einstellungRepository={createEinstellungRepository()} />);
    await tippe(within(nav()).getByRole('button', { name: 'Statistik' }));
    await waitFor(() => expect($('[data-zeitraum-pille]')).not.toBeNull(), W);
    await ruhe(50);
    expect(aktive()).toEqual(['Wöchentlich']);
  });
});
