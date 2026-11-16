import '@testing-library/jest-dom/vitest';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { KRITERIEN, bewertungAntippen, bewertungenAusDaten, rezensionSichern, stufentext } from '@/domain/bewertung';
import { buchAusDaten, type Buch } from '@/domain/buch';
import { KRITERIUM_SYMBOL } from '@/buchdetails/reiter/rezension';
import { InMemoryBookRepository } from '@/storage/InMemoryBookRepository';
import { InMemoryImageStore } from '@/storage/InMemoryImageStore';
import { farbrubriken, kriteriumBlass, kriteriumFarbrubriken, kriteriumVoll } from '@/theme';
import BuchDetails from '@/views/BuchDetails';
import Symbolbild from '@/components/Symbolbild';

afterEach(cleanup);

const ID = '0b9a7c1e-2d3f-4a5b-8c6d-7e8f9a0b1c2d';
const buch = (extra: Partial<Buch> = {}): Buch => ({ id: ID, titel: 'Momo', autor: 'Michael Ende', status: 'gelesen', ...extra });

describe('Domäne Bewertung', () => {
  it('14 Kriterien in fester Reihenfolge, je 5 Stufentexte, eigenes Symbol und eigene Farbrubrik', () => {
    expect(KRITERIEN.map((k) => k.name)).toEqual([
      'Sterne', 'Tempo', 'Weltenbau', 'Spice', 'Spannung', 'Action', 'Hauptfiguren',
      'Nebenfiguren', 'Plot Twist', 'Tränen', 'Romantik', 'Humor', 'Grusel', 'Dialoge',
    ]);
    for (const k of KRITERIEN) expect(k.stufen).toHaveLength(5);
    expect(new Set(Object.values(KRITERIUM_SYMBOL)).size).toBe(14);
    for (const k of KRITERIEN) expect(farbrubriken[kriteriumFarbrubriken[k.id]]).toBeDefined();
    expect(kriteriumBlass('tempo')).toContain(kriteriumVoll('tempo'));
    expect(kriteriumBlass('tempo')).toContain('--bz-farbe-hintergrund');
  });

  it('jedes der 14 Kriterien hat ein sichtbares Icon: nicht-leerer Pfad im Raster 0 -960 960 960', () => {
    expect(Object.keys(KRITERIUM_SYMBOL)).toHaveLength(14);
    for (const k of KRITERIEN) {
      const { container, unmount } = render(<Symbolbild name={KRITERIUM_SYMBOL[k.id]} farbe="red" groesse={24} />);
      const pfade = Array.from(container.querySelectorAll('path'));
      expect(pfade.length, k.id).toBeGreaterThan(0);
      for (const p of pfade) {
        const d = p.getAttribute('d') ?? '';
        expect(d.trim().length, k.id).toBeGreaterThan(20);
        if (p.hasAttribute('transform')) continue;
        // Startpunkt muss im sichtbaren Bereich liegen (verhindert z. B. Pfade im 24er-Raster)
        const [x, y] = (d.match(/^[Mm]\s*(-?[\d.]+)[\s,]*(-?[\d.]+)/) ?? []).slice(1).map(Number);
        expect(x, k.id).toBeGreaterThanOrEqual(0);
        expect(x, k.id).toBeLessThanOrEqual(960);
        expect(y, k.id).toBeGreaterThanOrEqual(-960);
        expect(y, k.id).toBeLessThanOrEqual(0);
      }
      unmount();
    }
  });

  it('setzt, ändert und setzt zurück; andere Kriterien bleiben', () => {
    let b = bewertungAntippen(buch(), 'tempo', 3);
    b = bewertungAntippen(b, 'sterne', 4);
    expect(b.bewertungen).toEqual({ tempo: 3, sterne: 4 });
    b = bewertungAntippen(b, 'tempo', 5);
    expect(b.bewertungen?.tempo).toBe(5);
    b = bewertungAntippen(b, 'tempo', 5);
    expect(b.bewertungen).toEqual({ sterne: 4 });
    b = bewertungAntippen(b, 'sterne', 4);
    expect('bewertungen' in b).toBe(false);
    expect(() => bewertungAntippen(buch(), 'tempo', 2.5)).toThrow();
    expect(() => bewertungAntippen(buch(), 'tempo', 0)).toThrow();
  });

  it('Stufentext nur mit Wert; Daten werden bereinigt', () => {
    expect(stufentext('sterne', 3)).toBe('Hat mir gefallen');
    expect(stufentext('dialoge', 5)).toBe('Hätte ich gern selbst gesagt');
    expect(stufentext('sterne', undefined)).toBeUndefined();
    expect(bewertungenAusDaten({ sterne: 4, tempo: 6, x: 2, spice: 1.5 })).toEqual({ sterne: 4 });
    expect(bewertungenAusDaten({})).toBeUndefined();
    expect(buchAusDaten({ ...buch(), rezension: '   ' }).rezension).toBeUndefined();
  });

  it('Rezension: ungekürzt, leerer Text wird nicht gesichert', () => {
    const lang = 'x'.repeat(10_000) + '\n\nEnde';
    expect(rezensionSichern(buch(), lang)?.rezension).toBe(lang);
    expect(rezensionSichern(buch(), '')).toBeNull();
    expect(rezensionSichern(buch(), ' \n ')).toBeNull();
  });
});

async function zeige(b: Buch, repo = new InMemoryBookRepository()) {
  await repo.save(b);
  render(<BuchDetails buchId={b.id} buch={b} repository={repo} bildspeicher={new InMemoryImageStore()} onZurueck={() => {}} />);
  await act(async () => {});
  return repo;
}

const tippe = async (el: Element) => {
  fireEvent.click(el);
  await act(async () => {});
};

const zeile = (id: string) => document.querySelector(`[data-kriterium="${id}"]`)!;
const symbol = (id: string, n: number) => zeile(id).querySelector(`[data-symbol-nr="${n}"]`)!;

describe('Reiterleiste und Reiter „Rezension“ in den Buchdetails', () => {
  it('Rezension aktiv, Bezeichnung nur im aktiven Reiter, Wechsel zeigt „under construction :)“', async () => {
    await zeige(buch());
    const reiter = [...document.querySelectorAll('[data-reiter]')];
    expect(reiter.map((r) => r.getAttribute('aria-label'))).toEqual(['Rezension', 'Notizbuch', 'Figuren & Orte', 'Details']);
    expect(document.querySelectorAll('[data-reiter-bezeichnung]')).toHaveLength(1);
    expect(document.querySelector('[data-reiter="rezension"]')).toHaveAttribute('data-aktiv', 'true');
    expect(document.querySelector('[data-reiter-bereich="rezension"]')).not.toBeNull();
    await tippe(document.querySelector('[data-reiter="notizbuch"]')!);
    expect(document.querySelector('[data-reiter="notizbuch"] [data-reiter-bezeichnung]')).toHaveTextContent('Notizbuch');
    expect(document.querySelector('[data-reiter-bereich="rezension"]')).toBeNull();
    expect(document.querySelector('[data-reiter-bereich="notizbuch"]')).toHaveTextContent('under construction :)');
    expect((document.querySelector('[data-reiterpille]') as HTMLElement).style.transition).toContain('left');
  });

  it('Bewertung setzen, Stufentext, zurücksetzen und speichern', async () => {
    const repo = await zeige(buch());
    expect(document.querySelectorAll('[data-kriterium]')).toHaveLength(14);
    expect(document.querySelectorAll('[data-voll="true"]')).toHaveLength(0);
    await tippe(symbol('sterne', 3));
    expect(zeile('sterne')).toHaveAttribute('data-wert', '3');
    expect(zeile('sterne').querySelector('[data-stufentext]')).toHaveTextContent('Hat mir gefallen');
    expect(zeile('sterne').querySelectorAll('[data-voll="true"]')).toHaveLength(3);
    await act(async () => {});
    expect((await repo.get(ID))?.bewertungen).toEqual({ sterne: 3 });
    await tippe(symbol('sterne', 3));
    expect(zeile('sterne').querySelector('[data-stufentext]')).toBeNull();
    await act(async () => {});
    expect((await repo.get(ID))?.bewertungen).toBeUndefined();
    await tippe(document.querySelector('[data-bewertung-filter]')!);
    await tippe(document.querySelector('[data-rezension-teilen]')!);
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('Schreibfenster: leer sichern bewirkt nichts, Sichern speichert, X verwirft', async () => {
    const repo = await zeige(buch({ bewertungen: { sterne: 4 } }));
    expect(document.querySelector('[data-schreibfeld-platzhalter]')).toHaveTextContent('Wie fandest du es?');
    await tippe(document.querySelector('[data-schreibfeld]')!);
    expect(document.querySelector('[data-schreibfenster-autor]')).toHaveTextContent('Michael Ende');
    expect(document.querySelectorAll('[data-schreibfenster-sterne] [data-voll="true"]')).toHaveLength(4);
    await tippe(document.querySelector('[data-rezension-sichern]')!);
    expect(document.querySelector('[data-schreibfenster]')).not.toBeNull();
    fireEvent.change(document.querySelector('[data-rezension-eingabe]')!, { target: { value: 'Toll.\n\nWirklich.' } });
    await tippe(document.querySelector('[data-rezension-sichern]')!);
    expect(document.querySelector('[data-schreibfenster]')).toBeNull();
    expect(document.querySelector('[data-rezension-text]')!.textContent).toBe('Toll.\n\nWirklich.');
    await act(async () => {});
    expect((await repo.get(ID))?.rezension).toBe('Toll.\n\nWirklich.');
    await tippe(document.querySelector('[data-schreibfeld]')!);
    expect(document.querySelector<HTMLTextAreaElement>('[data-rezension-eingabe]')!.value).toBe('Toll.\n\nWirklich.');
    fireEvent.change(document.querySelector('[data-rezension-eingabe]')!, { target: { value: 'Verworfen' } });
    await tippe(document.querySelector('[data-schreibfenster-schliessen]')!);
    expect(document.querySelector('[data-rezension-text]')!.textContent).toBe('Toll.\n\nWirklich.');
    expect((await repo.get(ID))?.rezension).toBe('Toll.\n\nWirklich.');
  });

  it('Ohne Sterne keine Sterne im Schreibfenster; Tippen außerhalb schließt', async () => {
    await zeige(buch());
    await tippe(document.querySelector('[data-schreibfeld]')!);
    expect(document.querySelector('[data-schreibfenster-sterne]')).toBeNull();
    await tippe(document.querySelector('[data-schreibfenster-hintergrund]')!);
    expect(document.querySelector('[data-schreibfenster]')).toBeNull();
  });
});
