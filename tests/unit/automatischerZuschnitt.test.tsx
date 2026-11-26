import '@testing-library/jest-dom/vitest';
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { mittigerAusschnitt, ausschnittNoetig } from '@/bild/mittigerAusschnitt';
import { bilderNeuZuschneiden, geaenderteBereiche, onlineCoverZuschneiden } from '@/buchdetails/automatischerZuschnitt';
import ManuellerEintrag from '@/buchanlegen/ManuellerEintrag';
import BuchDetails from '@/views/BuchDetails';
import { InMemoryBookRepository } from '@/storage/InMemoryBookRepository';
import { InMemoryImageStore } from '@/storage/InMemoryImageStore';

// Canvas fehlt in jsdom: Zuschnitt als Markierung „bild|verhältnis“ nachbilden.
const zuschnitte = vi.hoisted(() => [] as number[]);
vi.mock('@/bild/bildverarbeitung', async (original) => ({
  ...(await original<typeof import('@/bild/bildverarbeitung')>()),
  mittigZuschneiden: async (bild: string, v: number) => {
    zuschnitte.push(v);
    return `${bild.split('|')[0]}|${v.toFixed(4)}`;
  },
}));

const TB = 138 / 218;
const HC = 148 / 210;

beforeEach(() => {
  zuschnitte.length = 0;
});
afterEach(() => cleanup());

describe('REQ-115 mittiger Ausschnitt (rein)', () => {
  it('600 × 600 auf Taschenbuch: volle Höhe, links und rechts gleich viel weg', () => {
    const a = mittigerAusschnitt(600, 600, TB);
    expect(a).toEqual({ x: 110, y: 0, breite: 380, hoehe: 600 });
    expect(a.x).toBe(600 - a.x - a.breite);
  });
  it('zu hohes Bild: volle Breite, oben und unten gleich viel weg', () => {
    expect(mittigerAusschnitt(400, 1000, 0.5)).toEqual({ x: 0, y: 100, breite: 400, hoehe: 800 });
  });
  it('passendes Bild bleibt unverändert', () => {
    const a = mittigerAusschnitt(276, 436, TB);
    expect(ausschnittNoetig(a, 276, 436)).toBe(false);
  });
  it('ungültiges Verhältnis: voller Rahmen', () => {
    expect(mittigerAusschnitt(10, 20, Number.NaN)).toEqual({ x: 0, y: 0, breite: 10, hoehe: 20 });
  });
});

describe('REQ-115 Zuschnitt nach Änderung', () => {
  it('Formatwechsel betrifft Cover, Rücken und Schnitt', () => {
    expect(geaenderteBereiche({ format: 'print', unterformat: 'taschenbuch' }, { format: 'print', unterformat: 'kleinformat' })).toEqual([
      'ruecken',
      'cover',
      'schnitt',
    ]);
  });
  it('Dicke ändern: Cover bleibt, Rücken und Schnitt neu', async () => {
    const alt = { breiteMm: 120, hoeheMm: 180, dickeMm: 20 };
    const neu = { ...alt, dickeMm: 40 };
    const s = new InMemoryImageStore();
    await s.put('b', 'cover', 'C');
    await s.put('b', 'ruecken', 'R');
    await s.put('b', 'schnitt', 'S');
    const erg = await bilderNeuZuschneiden(s, 'b', alt, neu);
    expect(Object.keys(erg).sort()).toEqual(['ruecken', 'schnitt']);
    expect(await s.get('b', 'cover')).toBe('C');
    expect(await s.get('b', 'ruecken')).toBe(`R|${(40 / 180).toFixed(4)}`);
  });
  it('Seitenzahl ohne Dicke zählt, mit Dicke nicht', () => {
    expect(geaenderteBereiche({ seitenanzahl: 100 }, { seitenanzahl: 500 })).toEqual(['ruecken', 'schnitt']);
    expect(geaenderteBereiche({ dickeMm: 20, seitenanzahl: 100 }, { dickeMm: 20, seitenanzahl: 500 })).toEqual([]);
  });
  it('Online-Cover übernehmen: Standardmaße des Formats', async () => {
    expect(await onlineCoverZuschneiden('X', { format: 'print', unterformat: 'taschenbuch' })).toBe(`X|${TB.toFixed(4)}`);
  });
});

describe('REQ-115 Manueller Eintrag', () => {
  it('übernommenes Cover wird zugeschnitten und nach Formatwechsel vor „Hinzufügen“ neu', async () => {
    const repo = new InMemoryBookRepository();
    const bilder = new InMemoryImageStore();
    const angelegt = vi.fn();
    render(
      <ManuellerEintrag
        repository={repo}
        bildspeicher={bilder}
        onZurueck={() => {}}
        onAngelegt={angelegt}
        vorbelegung={{ titel: 'T', seitenanzahl: 300, format: 'print', unterformat: 'taschenbuch', cover: 'data:image/png;base64,AA' }}
      />,
    );
    await waitFor(() => expect(zuschnitte).toContain(TB));
    fireEvent.click(document.querySelector<HTMLElement>('[data-ausgabe-zeile="format"]')!);
    const fenster = await waitFor(() => document.querySelector<HTMLElement>('[data-fenster-format]')!);
    fireEvent.click(fenster.querySelector('[data-unterformat="hardcover"]')!);
    fireEvent.click(fenster.querySelector('[data-format-sichern]')!);
    await waitFor(() => expect(zuschnitte).toContain(HC));
    fireEvent.click(screen.getByRole('button', { name: 'Hinzufügen' }));
    await waitFor(() => expect(angelegt).toHaveBeenCalled());
    const buch = angelegt.mock.calls[0][0] as { id: string };
    expect(await bilder.get(buch.id, 'cover')).toBe(`data:image/png;base64,AA|${HC.toFixed(4)}`);
  });
});

describe('REQ-115 Buchdetails: Zuschnitt nur nach erfolgreichem Speichern', () => {
  const klick = async (el: Element) =>
    act(async () => {
      fireEvent.click(el);
      await new Promise((r) => setTimeout(r, 15));
    });

  async function formatWechsel(saveSchlaegtFehl: boolean) {
    const repo = new InMemoryBookRepository();
    const id = crypto.randomUUID();
    await repo.save({ id, titel: 'Z', status: 'ungelesen', format: 'print', unterformat: 'taschenbuch' });
    const bilder = new InMemoryImageStore();
    await bilder.put(id, 'cover', 'C');
    const put = vi.spyOn(bilder, 'put');
    if (saveSchlaegtFehl) vi.spyOn(repo, 'save').mockRejectedValue(new Error('voll'));
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    render(<BuchDetails buchId={id} repository={repo} bildspeicher={bilder} onZurueck={() => {}} />);
    const d = await screen.findByRole('region', { name: 'Buchdetails' });
    await klick(await waitFor(() => d.querySelector<HTMLElement>('[data-reiter="details"]')!));
    await klick(await waitFor(() => d.querySelector<HTMLElement>('[data-ausgabe-zeile="format"]')!));
    const f = await waitFor(() => document.querySelector<HTMLElement>('[data-fenster-format]')!);
    await klick(f.querySelector('[data-unterformat="kleinformat"]')!);
    await klick(f.querySelector('[data-format-sichern]')!);
    await act(async () => {
      await new Promise((r) => setTimeout(r, 100));
    });
    warn.mockRestore();
    return { put, cover: await bilder.get(id, 'cover') };
  }

  it('save schlägt fehl → kein put, Cover unverändert', async () => {
    const { put, cover } = await formatWechsel(true);
    expect(put).not.toHaveBeenCalled();
    expect(cover).toBe('C');
  });

  it('Gegenstück: save gelingt → Cover neu zugeschnitten', async () => {
    const { put, cover } = await formatWechsel(false);
    expect(put).toHaveBeenCalledTimes(1);
    expect(cover).toBe(`C|${(105 / 148).toFixed(4)}`);
  });
});
