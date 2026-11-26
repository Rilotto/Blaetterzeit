/**
 * Akzeptanztests REQ-087 – Seite „Statistik“: Zeile „Serie X Tage“ (buchübergreifend, immer bezogen auf heute).
 * Abgeleitet aus dem REQ-Text. Schnittstellen laut Entwickler (Sprint 09): [data-serie-text]; Buchdetails-Flamme
 * wie REQ-027 ([data-streak]).
 */
import '@testing-library/jest-dom/vitest';
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { Buch } from '@/domain/buch';
import { InMemoryEinstellungRepository, type ImageStore } from '@/storage';
import { InMemoryBookRepository } from '@/storage/InMemoryBookRepository';
import { InMemoryImageStore } from '@/storage/InMemoryImageStore';
import BuchDetails from '@/views/BuchDetails';
import StatistikAnsicht from '@/views/StatistikAnsicht';

vi.mock('@/buecher/demodaten', () => ({ demoBuecher: [] }));
afterEach(cleanup);

const W = { timeout: 4000 };
const um = (j: number, m: number, t: number, h = 12, mi = 0) => new Date(j, m - 1, t, h, mi);
const s = (j: number, m: number, t: number, h = 12, mi = 0, seite = 10) => ({ zeitpunkt: um(j, m, t, h, mi).toISOString(), seite });
let nr = 0;
const buch = (f: Partial<Buch> = {}): Buch => ({ id: `b87-${++nr}`, titel: 'Testbuch', status: 'am_lesen', seitenanzahl: 500, ...f });
const HEUTE = um(2026, 11, 22, 15);
const $ = (q: string) => document.querySelector<HTMLElement>(q);
const norm = (t: string | null | undefined) => (t ?? '').replace(/[\s  ]+/g, ' ').trim();
async function tippe(el: Element | null) {
  expect(el).not.toBeNull();
  await act(async () => {
    fireEvent.click(el!);
    await new Promise((r) => setTimeout(r, 5));
  });
}
async function zeige(buecher: Buch[], art: 'woche' | 'monat' | 'jahr' = 'woche', heute = HEUTE) {
  const repo = new InMemoryEinstellungRepository();
  await repo.speichern('statistikZeitraum', art);
  render(<StatistikAnsicht buecher={buecher} einstellungRepository={repo} bildspeicher={new InMemoryImageStore()} jetzt={() => heute} />);
  await waitFor(() => expect($(`[data-zeitraum-pille="${art}"]`)).toHaveAttribute('aria-pressed', 'true'), W);
}
const serie = () => norm($('[data-serie-text]')!.textContent);

describe('REQ-087 Serie', () => {
  it('[REQ-087/AK-1] Sitzungen vorgestern, gestern und heute: „Serie 3 Tage“, auch bei vergangenem Zeitraum', async () => {
    await zeige([buch({ sitzungen: [s(2026, 11, 20), s(2026, 11, 21, 12, 0, 20), s(2026, 11, 22, 9, 0, 30)] })]);
    expect(serie()).toBe('Serie 3 Tage');
    for (let i = 0; i < 3; i++) await tippe($('[data-zeitraum-zurueck]'));
    expect(serie()).toBe('Serie 3 Tage');
    await tippe($('[data-zeitraum-pille="jahr"]'));
    await tippe($('[data-zeitraum-zurueck]'));
    expect(serie()).toBe('Serie 3 Tage');
    await tippe($('[data-zeitraum-pille="monat"]'));
    await tippe($('[data-zeitraum-vor]'));
    expect(serie()).toBe('Serie 3 Tage');
  });

  it('[REQ-087/AK-1] Serie über Wochen- und Monatsgrenze; Lage: Flamme und Zeile unter der Karte', async () => {
    const tage = Array.from({ length: 10 }, (_, i) => s(2026, 11, 22 - i, 10, 0, 100 - i));
    await zeige([buch({ sitzungen: tage })]);
    expect(serie()).toBe('Serie 10 Tage');
    expect($('[data-balken]')!.compareDocumentPosition($('[data-serie-text]')!) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect($('[data-seite="statistik"] [data-flamme]')).not.toBeNull();
  });

  it('[REQ-087/AK-1] Serie endet gestern: heute noch keine Sitzung → zählt bis gestern', async () => {
    await zeige([buch({ sitzungen: [s(2026, 11, 20), s(2026, 11, 21)] })]);
    expect(serie()).toBe('Serie 2 Tage');
  });

  it('[REQ-087/AK-2] letzte Sitzung vorgestern: „Serie 0 Tage“', async () => {
    await zeige([buch({ sitzungen: [s(2026, 11, 18), s(2026, 11, 19), s(2026, 11, 20, 23, 59)] })]);
    expect(serie()).toBe('Serie 0 Tage');
  });

  it('[REQ-087/AK-2] Tagesgrenze lokale Gerätezeit: Sitzung gestern 23:59 und heute 00:01 sind zwei Tage', async () => {
    await zeige([buch({ sitzungen: [s(2026, 11, 21, 23, 59), s(2026, 11, 22, 0, 1, 20)] })]);
    expect(serie()).toBe('Serie 2 Tage');
  });

  it('[REQ-087/AK-3] keine Sitzungen, ein Buch mit „Beendet am“ heute: „Serie 0 Tage“', async () => {
    await zeige([buch({ status: 'gelesen', seitenanzahl: 300, beendetAm: '2026-11-22' })]);
    expect(serie()).toBe('Serie 0 Tage');
  });

  it('[REQ-087/AK-3] nachgetragenes Buch füllt keine Lücke: Sitzung heute, „Beendet am“ gestern, Sitzung vorgestern → 1', async () => {
    await zeige([buch({ sitzungen: [s(2026, 11, 20), s(2026, 11, 22, 12, 0, 20)] }), buch({ status: 'gelesen', beendetAm: '2026-11-21' })]);
    expect(serie()).toBe('Serie 1 Tage');
  });

  it('[REQ-087/AK-4] Sitzung gestern nur Buch A, heute nur Buch B: „Serie 2 Tage“, Flamme angezündet; Buchdetails je Buch Rekord 1', async () => {
    const a = buch({ titel: 'A', sitzungen: [s(2026, 11, 21)] });
    const b = buch({ titel: 'B', sitzungen: [s(2026, 11, 22)] });
    await zeige([a, b]);
    expect(serie()).toBe('Serie 2 Tage');
    // heute gelesen → Flamme der Statistik angezündet (REQ-108): gefüllt über den Rot-Orange-Verlauf
    const f = $('[data-seite="statistik"] [data-flamme]')!;
    expect(f.querySelector<SVGPathElement>('path')!.style.fill).toMatch(/url\(/);
    expect(f.querySelectorAll('[data-verlauf]')).toHaveLength(2);
    cleanup();
    const repo = new InMemoryBookRepository();
    await repo.save(a);
    await repo.save(b);
    const bilder = new InMemoryImageStore() as ImageStore;
    for (const x of [a, b]) {
      render(<BuchDetails buchId={x.id} repository={repo} bildspeicher={bilder} jetzt={() => HEUTE} bildquelle={{ scannen: async () => null, galerie: async () => null }} onZurueck={() => {}} />);
      const d = await screen.findByRole('region', { name: 'Buchdetails' }, W);
      const streak = await waitFor(() => {
        const e = d.querySelector<HTMLElement>('[data-streak]');
        expect(e).not.toBeNull();
        return e!;
      }, W);
      // je Buch nur ein Lesetag (A: gestern, B: heute) → Rekord „Längste Serie“ 1, nicht 2 (REQ-109)
      expect(norm(streak.querySelector('[data-streak-zahl]')?.textContent)).toBe('1');
      expect(norm(streak.textContent)).toContain('Längste Serie');
      cleanup();
    }
  });
});
