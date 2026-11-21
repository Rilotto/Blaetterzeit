/**
 * Akzeptanztests REQ-045 – Bewertung setzen, ändern, zurücksetzen, dauerhaft speichern.
 * Speicher: Standard-Speicher der App (IndexedDB, hier fake-indexeddb). „Neustart“ = Module neu laden,
 * neue Repository-Instanz auf derselben IndexedDB (wie REQ-024/REQ-034).
 */
import '@testing-library/jest-dom/vitest';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { IDBFactory, IDBKeyRange } from 'fake-indexeddb';
import type { ComponentType, CSSProperties } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { bewertungAntippen } from '@/domain/bewertung';
import type { Buch } from '@/domain/buch';
import type { BookRepository, ImageStore } from '@/storage';
import { farbVariablen } from '@/theme';

vi.mock('@/buecher/demodaten', () => ({ demoBuecher: [] }));
beforeEach(() => {
  vi.stubGlobal('indexedDB', new IDBFactory());
  vi.stubGlobal('IDBKeyRange', IDBKeyRange);
});
afterEach(() => cleanup());

type Welt = { repo: BookRepository; BD: ComponentType<Record<string, unknown>> };
const buch = (f: Partial<Buch> = {}): Buch => ({ id: crypto.randomUUID(), titel: 'Testbuch', status: 'ungelesen', ...f });
const bilder = { get: async () => undefined, put: async () => {}, remove: async () => {} } as unknown as ImageStore;
async function starte(): Promise<Welt> {
  vi.resetModules();
  const st = (await import('@/storage')) as typeof import('@/storage');
  const BD = (await import('@/views/BuchDetails')).default as unknown as ComponentType<Record<string, unknown>>;
  return { repo: st.createBookRepository(), BD };
}
async function zeige(w: Welt, id: string) {
  const BD = w.BD;
  render(
    <div style={farbVariablen() as CSSProperties}>
      <BD buchId={id} bildspeicher={bilder} bildquelle={{ scannen: async () => null, galerie: async () => null }} onZurueck={() => {}} />
    </div>,
  );
  const d = await screen.findByRole('region', { name: 'Buchdetails' });
  await vi.waitFor(() => expect(d.querySelector('[data-bereich-bewertung]')).not.toBeNull());
  return d;
}
async function warte(ms = 40) {
  await act(async () => {
    await new Promise((r) => setTimeout(r, ms));
  });
}
async function tippe(el: Element) {
  await act(async () => {
    fireEvent.click(el);
    await new Promise((r) => setTimeout(r, 10));
  });
}
const zeile = (d: HTMLElement, k: string) => d.querySelector<HTMLElement>(`[data-kriterium="${k}"]`)!;
const symbol = (d: HTMLElement, k: string, n: number) => zeile(d, k).querySelector<HTMLElement>(`[data-symbol-nr="${n}"]`)!;
const wert = (d: HTMLElement, k: string) => zeile(d, k).getAttribute('data-wert');
const voll = (d: HTMLElement, k: string) => [1, 2, 3, 4, 5].map((n) => symbol(d, k, n).getAttribute('data-voll') === 'true');
const muster = (n: number) => [1, 2, 3, 4, 5].map((i) => i <= n);
const IDS = ['sterne', 'tempo', 'weltenbau', 'spice', 'spannung', 'action', 'hauptfiguren', 'nebenfiguren', 'plotTwist', 'traenen', 'romantik', 'humor', 'grusel', 'dialoge'];

/** Neustart und Buch frisch aus dem Speicher lesen. */
async function gespeichert(id: string) {
  cleanup();
  const w = await starte();
  return w.repo.get(id);
}
async function mitBuch(b: Buch = buch()) {
  const w = await starte();
  await w.repo.save(b);
  return { w, d: await zeige(w, b.id), id: b.id };
}

describe('REQ-045 Bewertung setzen', () => {
  it('[REQ-045/AK-1] Buch ohne Bewertung: alle Symbole aller 14 Kriterien blass', async () => {
    const { d } = await mitBuch();
    expect([...d.querySelectorAll('[data-kriterium]')].map((z) => z.getAttribute('data-kriterium'))).toEqual(IDS);
    for (const k of IDS) {
      expect(voll(d, k), k).toEqual(muster(0));
      expect(wert(d, k)).toBe('');
    }
  });

  it('[REQ-045/AK-2] drittes Tempo-Symbol antippen → Tempo = 3, Symbole 1–3 voll, 4–5 blass, gespeichert', async () => {
    const { d, id } = await mitBuch();
    await tippe(symbol(d, 'tempo', 3));
    expect(wert(d, 'tempo')).toBe('3');
    expect(voll(d, 'tempo')).toEqual(muster(3));
    await warte();
    expect((await gespeichert(id))?.bewertungen).toEqual({ tempo: 3 });
  });

  it('[REQ-045/AK-2] Grenzwerte: erstes und fünftes Symbol setzen 1 bzw. 5 (je anderes Kriterium)', async () => {
    const { d } = await mitBuch();
    await tippe(symbol(d, 'humor', 1));
    await tippe(symbol(d, 'grusel', 5));
    expect(wert(d, 'humor')).toBe('1');
    expect(voll(d, 'humor')).toEqual(muster(1));
    expect(wert(d, 'grusel')).toBe('5');
    expect(voll(d, 'grusel')).toEqual(muster(5));
  });

  it('[REQ-045/AK-3] Tempo 3 → 5 und (zweiter Durchlauf) Tempo 3 → 1', async () => {
    for (const ziel of [5, 1]) {
      const { d, id } = await mitBuch(buch({ bewertungen: { tempo: 3 } } as Partial<Buch>));
      expect(wert(d, 'tempo')).toBe('3');
      await tippe(symbol(d, 'tempo', ziel));
      expect(wert(d, 'tempo')).toBe(String(ziel));
      expect(voll(d, 'tempo')).toEqual(muster(ziel));
      await warte();
      expect((await gespeichert(id))?.bewertungen?.tempo).toBe(ziel);
      cleanup();
    }
  });

  it('[REQ-045/AK-4] Tempo 3, drittes Symbol erneut antippen → keine Bewertung, alles blass; übrige unverändert, gespeichert', async () => {
    const { d, id } = await mitBuch(buch({ bewertungen: { tempo: 3, sterne: 4, dialoge: 2 } } as Partial<Buch>));
    await tippe(symbol(d, 'tempo', 3));
    expect(wert(d, 'tempo')).toBe('');
    expect(voll(d, 'tempo')).toEqual(muster(0));
    expect(wert(d, 'sterne')).toBe('4');
    expect(wert(d, 'dialoge')).toBe('2');
    await warte();
    const b = await gespeichert(id);
    expect(b?.bewertungen?.tempo).toBeUndefined();
    expect(b?.bewertungen).toEqual({ sterne: 4, dialoge: 2 });
  });

  it('[REQ-045/AK-4] Setzen und sofortiges erneutes Antippen in derselben Sitzung setzt zurück (auch das einzige Kriterium)', async () => {
    const { d, id } = await mitBuch();
    await tippe(symbol(d, 'spice', 2));
    await tippe(symbol(d, 'spice', 2));
    expect(wert(d, 'spice')).toBe('');
    await warte();
    const b = await gespeichert(id);
    expect(b?.bewertungen?.spice).toBeUndefined();
  });

  it('[REQ-045/AK-5] beliebige Tipps ergeben nur ganze Werte 1–5; Fachfunktion weist 0, 6 und 2.5 ab', async () => {
    const { d, id } = await mitBuch();
    for (const [k, n] of [['tempo', 4], ['tempo', 2], ['action', 5], ['action', 1], ['romantik', 3], ['romantik', 4]] as const) await tippe(symbol(d, k, n));
    await warte();
    const b = await gespeichert(id);
    for (const w of Object.values(b?.bewertungen ?? {})) {
      expect(Number.isInteger(w)).toBe(true);
      expect(w).toBeGreaterThanOrEqual(1);
      expect(w).toBeLessThanOrEqual(5);
    }
    expect(b?.bewertungen).toEqual({ tempo: 2, action: 1, romantik: 4 });
    const roh = buch();
    for (const falsch of [0, 6, 2.5, -1, Number.NaN]) {
      let ergebnis: Buch | undefined;
      try {
        ergebnis = bewertungAntippen(roh, 'tempo', falsch);
      } catch {
        ergebnis = undefined;
      }
      expect(ergebnis?.bewertungen?.tempo, String(falsch)).toBeUndefined();
    }
  });

  it('[REQ-045/AK-6] Sterne = 4 und Spice = 2 bleiben nach Neustart erhalten und werden angezeigt', async () => {
    const { d, id } = await mitBuch();
    await tippe(symbol(d, 'sterne', 4));
    await tippe(symbol(d, 'spice', 2));
    await warte();
    cleanup();
    const w = await starte();
    const d2 = await zeige(w, id);
    expect(wert(d2, 'sterne')).toBe('4');
    expect(voll(d2, 'sterne')).toEqual(muster(4));
    expect(wert(d2, 'spice')).toBe('2');
    expect(voll(d2, 'spice')).toEqual(muster(2));
    for (const k of IDS.filter((x) => x !== 'sterne' && x !== 'spice')) expect(wert(d2, k)).toBe('');
  });

  it('[REQ-045/AK-6] Bewertung bleibt auch beim Verlassen per „Zurück“ direkt nach dem Antippen erhalten', async () => {
    const w = await starte();
    const b = buch();
    await w.repo.save(b);
    const BD = w.BD;
    const onZurueck = vi.fn();
    render(<BD buchId={b.id} bildspeicher={bilder} bildquelle={{ scannen: async () => null, galerie: async () => null }} onZurueck={onZurueck} />);
    const d = await screen.findByRole('region', { name: 'Buchdetails' });
    await vi.waitFor(() => expect(d.querySelector('[data-bereich-bewertung]')).not.toBeNull());
    fireEvent.click(symbol(d, 'weltenbau', 5));
    fireEvent.click(screen.getByRole('button', { name: 'Zurück' }));
    await vi.waitFor(() => expect(onZurueck).toHaveBeenCalled());
    expect((await gespeichert(b.id))?.bewertungen).toEqual({ weltenbau: 5 });
  });

  it('[REQ-045/AK-7] Tempo bei Buch A bewertet, Buch B zeigt bei Tempo alles blass', async () => {
    const w = await starte();
    const a = buch({ titel: 'A', bewertungen: { tempo: 4 } } as Partial<Buch>);
    const b = buch({ titel: 'B' });
    await w.repo.save(a);
    await w.repo.save(b);
    const dB = await zeige(w, b.id);
    expect(voll(dB, 'tempo')).toEqual(muster(0));
    cleanup();
    const dA = await zeige(w, a.id);
    await tippe(symbol(dA, 'tempo', 2));
    await warte();
    expect((await w.repo.get(b.id))?.bewertungen).toBeUndefined();
    expect((await w.repo.get(a.id))?.bewertungen).toEqual({ tempo: 2 });
  });
});
