/**
 * Akzeptanztests REQ-047 – Bereich „Deine Rezension“ mit Teilen-Symbol und Schreibfeld.
 * Schnittstellen laut Entwickler (Sprint 05): [data-bereich-rezension], [data-rezension-teilen], [data-schreibfeld],
 * [data-schreibfeld-platzhalter], [data-rezension-text], [data-schreibfenster], [data-rezension-eingabe], [data-rezension-sichern].
 */
import '@testing-library/jest-dom/vitest';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { Buch } from '@/domain/buch';
import type { ImageStore } from '@/storage';
import { InMemoryBookRepository } from '@/storage/InMemoryBookRepository';
import BuchDetails from '@/views/BuchDetails';

vi.mock('@/buecher/demodaten', () => ({ demoBuecher: [] }));
afterEach(() => cleanup());

const buch = (f: Partial<Buch> = {}): Buch => ({ id: crypto.randomUUID(), titel: 'Testbuch', autor: 'Autorin X', status: 'ungelesen', ...f });
const bilder = { get: async () => undefined, put: async () => {}, remove: async () => {} } as unknown as ImageStore;
async function zeige(b: Buch = buch(), repo = new InMemoryBookRepository()) {
  await repo.save(b);
  render(<BuchDetails buchId={b.id} repository={repo} bildspeicher={bilder} bildquelle={{ scannen: async () => null, galerie: async () => null }} onZurueck={() => {}} />);
  const d = await screen.findByRole('region', { name: 'Buchdetails' });
  await vi.waitFor(() => expect(d.querySelector('[data-bereich-rezension]')).not.toBeNull());
  return { d, repo };
}
async function tippe(el: Element) {
  await act(async () => {
    fireEvent.click(el);
    await new Promise((r) => setTimeout(r, 10));
  });
}
const bereich = (d: HTMLElement) => d.querySelector<HTMLElement>('[data-bereich-rezension]')!;
const feld = (d: HTMLElement) => bereich(d).querySelector<HTMLElement>('[data-schreibfeld]')!;
const fenster = () => document.querySelector<HTMLElement>('[data-schreibfenster]');
const PLATZHALTER = 'Wie fandest du es?';
const langerText = () => {
  const absatz = 'Ein Absatz über das Buch mit Umlauten äöü ß und Zeichen <>&". ';
  const teile: string[] = [];
  while (teile.join('\n\n').length < 3000) teile.push(absatz.repeat(3).trim());
  return teile.join('\n\n').slice(0, 2999) + 'Z';
};

describe('REQ-047 Deine Rezension', () => {
  it('[REQ-047/AK-1] unter „Bewertung“ steht „Deine Rezension“ mit Teilen-Symbol rechts daneben', async () => {
    const { d } = await zeige();
    const bew = d.querySelector('[data-bereich-bewertung]')!;
    expect(bew.compareDocumentPosition(bereich(d)) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    const h = [...bereich(d).querySelectorAll('h1,h2,h3,h4')].find((x) => x.textContent?.trim() === 'Deine Rezension');
    expect(h).toBeTruthy();
    const teilen = bereich(d).querySelector('[data-rezension-teilen]')!;
    expect(teilen.querySelector('[data-symbol]')).not.toBeNull();
    expect(h!.compareDocumentPosition(teilen) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it('[REQ-047/AK-2] Teilen antippen: kein Menü, kein Fenster, nichts gespeichert, Anzeige unverändert', async () => {
    const { d, repo } = await zeige(buch({ rezension: 'Bisher' } as Partial<Buch>));
    const vorher = bereich(d).innerHTML;
    const spy = vi.spyOn(repo, 'save');
    await tippe(bereich(d).querySelector('[data-rezension-teilen]')!);
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(screen.queryByRole('menu')).toBeNull();
    expect(fenster()).toBeNull();
    expect(spy).not.toHaveBeenCalled();
    expect(bereich(d).innerHTML).toBe(vorher);
  });

  it('[REQ-047/AK-3] ohne gesicherte Rezension: Schreibfeld zeigt „Wie fandest du es?“ mit Stift-Symbol', async () => {
    const { d } = await zeige();
    const p = feld(d).querySelector('[data-schreibfeld-platzhalter]')!;
    expect(p.textContent?.trim()).toBe(PLATZHALTER);
    expect(feld(d).querySelector('[data-symbol="stift"]')).not.toBeNull();
    expect(feld(d).querySelector('[data-rezension-text]')).toBeNull();
  });

  it('[REQ-047/AK-4] Schreibfeld antippen öffnet das Schreibfenster zu diesem Buch', async () => {
    const { d } = await zeige(buch({ titel: 'Mein Titel 47' }));
    expect(fenster()).toBeNull();
    await tippe(feld(d));
    expect(fenster()).not.toBeNull();
    expect(fenster()!.querySelector('[data-schreibfenster-titel]')?.textContent?.trim()).toBe('Mein Titel 47');
  });

  it('[REQ-047/AK-4] auch bei vorhandener Rezension öffnet Antippen des Textes das Schreibfenster', async () => {
    const { d } = await zeige(buch({ rezension: 'Schon da' } as Partial<Buch>));
    await tippe(feld(d).querySelector('[data-rezension-text]')!);
    expect(fenster()).not.toBeNull();
  });

  it('[REQ-047/AK-5] 3000 Zeichen mit Absätzen sichern → Schreibfeld zeigt den Text vollständig, ohne Platzhalter', async () => {
    const { d, repo } = await zeige();
    const t = langerText();
    expect(t.length).toBe(3000);
    expect(t).toContain('\n\n');
    await tippe(feld(d));
    fireEvent.change(fenster()!.querySelector('[data-rezension-eingabe]')!, { target: { value: t } });
    await tippe(fenster()!.querySelector('[data-rezension-sichern]')!);
    expect(fenster()).toBeNull();
    const anzeige = feld(d).querySelector<HTMLElement>('[data-rezension-text]')!;
    expect(anzeige.textContent).toBe(t);
    expect(anzeige.style.whiteSpace).toMatch(/pre/); // Absätze bleiben sichtbar
    expect(anzeige.style.overflow).not.toBe('hidden');
    expect(anzeige.style.webkitLineClamp ?? '').toBe('');
    expect(anzeige.style.textOverflow).not.toBe('ellipsis');
    expect(anzeige.style.maxHeight).toBe('');
    expect(feld(d).textContent).not.toContain(PLATZHALTER);
    expect(feld(d).querySelector('[data-schreibfeld-platzhalter]')).toBeNull();
    await vi.waitFor(async () => expect((await repo.list()).find((b) => b.rezension)?.rezension).toBe(t));
  });

  it('[REQ-047/AK-6] weder Kreis noch „Noch nicht geschrieben“, „Enthält Spoiler“, „Öffentlich“ (leer und mit Text)', async () => {
    for (const b of [buch(), buch({ rezension: 'Text' } as Partial<Buch>)]) {
      const { d } = await zeige(b);
      const t = bereich(d).textContent ?? '';
      for (const verboten of ['Noch nicht geschrieben', 'Enthält Spoiler', 'Öffentlich']) expect(t.toLowerCase()).not.toContain(verboten.toLowerCase());
      expect(bereich(d).querySelector('circle, input[type="checkbox"], [role="switch"], [role="checkbox"]')).toBeNull();
      cleanup();
    }
  });

  it('[REQ-047/AK-7] Rezension bei Buch A gesichert → Buch B zeigt „Wie fandest du es?“', async () => {
    const repo = new InMemoryBookRepository();
    const a = buch({ titel: 'A', rezension: 'Rezension von A' } as Partial<Buch>);
    const b = buch({ titel: 'B' });
    await repo.save(a);
    const { d } = await zeige(b, repo);
    expect(feld(d).querySelector('[data-schreibfeld-platzhalter]')?.textContent?.trim()).toBe(PLATZHALTER);
    expect(feld(d).textContent).not.toContain('Rezension von A');
  });
});
