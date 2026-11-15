/**
 * Akzeptanztests REQ-043 – Buchdetails: Reiterleiste.
 * Schnittstellen laut Entwickler (Sprint 05): [data-reiterleiste], [data-reiter=id][data-aktiv],
 * [data-reiter-bezeichnung], [data-reiterpille], [data-reiter-bereich=id]. Optik/„smooth“ prüft der CEO.
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
  await vi.waitFor(() => expect(d.querySelector('[data-reiterleiste]')).not.toBeNull());
  return d;
}
async function tippe(el: Element) {
  await act(async () => {
    fireEvent.click(el);
    await new Promise((r) => setTimeout(r, 10));
  });
}
const ORDNUNG = ['rezension', 'notizbuch', 'figuren', 'details'] as const;
const NAMEN = ['Rezension', 'Notizbuch', 'Figuren & Orte', 'Details'];
const leiste = (d: HTMLElement) => d.querySelector<HTMLElement>('[data-reiterleiste]')!;
const reiter = (d: HTMLElement) => [...leiste(d).querySelectorAll<HTMLElement>('[data-reiter]')];
const reiterVon = (d: HTMLElement, id: string) => leiste(d).querySelector<HTMLElement>(`[data-reiter="${id}"]`)!;
const aktive = (d: HTMLElement) => reiter(d).filter((r) => r.getAttribute('data-aktiv') === 'true');
const pille = (d: HTMLElement) => leiste(d).querySelector<HTMLElement>('[data-reiterpille]')!;

describe('REQ-043 Reiterleiste', () => {
  it('[REQ-043/AK-1] Reiterleiste steht unterhalb der Statistik-Pille, mit Abstand, ohne feste px-Breite', async () => {
    const d = await zeige();
    const statistik = d.querySelector('[data-statistik]')!;
    expect(statistik).not.toBeNull();
    expect(statistik.compareDocumentPosition(leiste(d)) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    const st = leiste(d).style;
    expect(parseFloat(st.marginTop || st.margin.split(' ')[0])).toBeGreaterThan(0);
    // Bildschirmbreite: keine feste/maximale Breite in px, keine Inline-Leiste.
    expect(st.width === '' || st.width.includes('100%')).toBe(true);
    expect(st.maxWidth).toBe('');
    expect(st.display).not.toBe('inline-flex');
  });

  it('[REQ-043/AK-2] genau vier Reiter in der Reihenfolge Rezension, Notizbuch, Figuren & Orte, Details mit passenden Icons', async () => {
    const d = await zeige();
    const r = reiter(d);
    expect(r.map((x) => x.getAttribute('data-reiter'))).toEqual([...ORDNUNG]);
    expect(r.map((x) => x.getAttribute('aria-label'))).toEqual(NAMEN);
    for (const x of r) expect(x.querySelector('[data-symbol]')).not.toBeNull();
    expect(r[0].querySelector('[data-symbol]')!.getAttribute('data-symbol')).toBe('stern');
  });

  it('[REQ-043/AK-3] beim Öffnen ist „Rezension“ aktiv und sein Bereich sichtbar (auch bei Buch mit Bewertung/Rezension)', async () => {
    for (const b of [buch(), buch({ titel: 'Anderes', rezension: 'Text', bewertungen: { sterne: 2 } } as Partial<Buch>)]) {
      const d = await zeige(b);
      expect(aktive(d).map((x) => x.getAttribute('data-reiter'))).toEqual(['rezension']);
      expect(d.querySelector('[data-reiter-bereich="rezension"]')).not.toBeNull();
      cleanup();
    }
  });

  it('[REQ-043/AK-4] nur der aktive Reiter zeigt seine Bezeichnung, die übrigen nur ihr Icon', async () => {
    const d = await zeige();
    for (const id of ORDNUNG) {
      await tippe(reiterVon(d, id));
      for (const [i, x] of reiter(d).entries()) {
        const bez = x.querySelector('[data-reiter-bezeichnung]');
        if (ORDNUNG[i] === id) expect(bez?.textContent).toBe(NAMEN[i]);
        else {
          expect(bez).toBeNull();
          expect(x.textContent?.trim()).toBe('');
          expect(x.querySelector('[data-symbol]')).not.toBeNull();
        }
      }
    }
  });

  it('[REQ-043/AK-5] Antippen von „Notizbuch“ kennzeichnet ihn mit Bezeichnung; Bereich „Rezension“ verschwindet', async () => {
    const d = await zeige();
    await tippe(reiterVon(d, 'notizbuch').querySelector('[data-symbol]')!);
    expect(aktive(d).map((x) => x.getAttribute('data-reiter'))).toEqual(['notizbuch']);
    expect(reiterVon(d, 'notizbuch').querySelector('[data-reiter-bezeichnung]')?.textContent).toBe('Notizbuch');
    expect(pille(d).getAttribute('data-reiter-index')).toBe('1');
    expect(d.querySelector('[data-reiter-bereich="rezension"]')).toBeNull();
    expect(d.querySelector('[data-bereich-bewertung]')).toBeNull();
    expect(d.querySelector('[data-reiter-bereich="notizbuch"]')).not.toBeNull();
  });

  it('[REQ-043/AK-5] Wechsel zu „Details“ und zurück zu „Rezension“ zeigt wieder den Bereich „Rezension“', async () => {
    const d = await zeige();
    await tippe(reiterVon(d, 'details'));
    expect(aktive(d).map((x) => x.getAttribute('data-reiter'))).toEqual(['details']);
    expect(d.querySelector('[data-reiter-bereich="rezension"]')).toBeNull();
    await tippe(reiterVon(d, 'rezension'));
    expect(d.querySelector('[data-reiter-bereich="rezension"]')).not.toBeNull();
  });

  it('[REQ-043/AK-6] Breite der Leiste (Stil) bleibt beim Antippen jedes Reiters unverändert', async () => {
    const d = await zeige();
    const vorher = { w: leiste(d).style.width, m: leiste(d).style.margin, p: leiste(d).style.padding, f: leiste(d).style.flex };
    for (const id of [...ORDNUNG, 'rezension']) {
      await tippe(reiterVon(d, id));
      const s = leiste(d).style;
      expect({ w: s.width, m: s.margin, p: s.padding, f: s.flex }).toEqual(vorher);
    }
  });

  it('[REQ-043/AK-7] die innenliegende Pille wandert über einen Übergang (transition) an eine neue Stelle', async () => {
    const d = await zeige();
    const p0 = pille(d);
    const lage0 = p0.style.left + p0.style.transform;
    expect(p0.style.transition).toMatch(/left|transform|translate/);
    await tippe(reiterVon(d, 'figuren'));
    const p1 = pille(d);
    expect(p1).toBe(p0); // dasselbe Element wandert, es wird nicht neu erzeugt (kein Sprung)
    expect(p1.style.left + p1.style.transform).not.toBe(lage0);
    expect(p1.style.transition).toMatch(/left|transform|translate/);
  });

  it('[REQ-043/AK-8] „Notizbuch“ und „Figuren & Orte“ zeigen „under construction :)“ in Tertiär', async () => {
    const d = await zeige();
    for (const id of ['notizbuch', 'figuren']) {
      await tippe(reiterVon(d, id));
      const bereich = d.querySelector<HTMLElement>(`[data-reiter-bereich="${id}"]`)!;
      const text = [...bereich.querySelectorAll<HTMLElement>('*')].find((e) => e.textContent?.trim() === 'under construction :)' && e.children.length === 0);
      expect(text, id).toBeTruthy();
      let el: HTMLElement | null = text!;
      while (el && !el.style.color) el = el.parentElement;
      expect(el?.style.color).toBe('var(--bz-farbe-tertiaer)');
    }
  });
});
