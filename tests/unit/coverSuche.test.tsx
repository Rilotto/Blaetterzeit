import '@testing-library/jest-dom/vitest';
import { act, cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { mittigZuschneiden } from '@/bild/bildverarbeitung';
import type { Treffer } from '@/barcode/treffer';
import type { Buch } from '@/domain/buch';
import { InMemoryBookRepository } from '@/storage/InMemoryBookRepository';
import { InMemoryEinstellungRepository } from '@/storage/InMemoryEinstellungRepository';
import { InMemoryImageStore } from '@/storage/InMemoryImageStore';
import BuchDetails from '@/views/BuchDetails';
import BuecherAnsicht from '@/views/BuecherAnsicht';

vi.mock('@/buecher/demodaten', () => ({ demoBuecher: [] }));
vi.mock('@/bild/bildverarbeitung', async (o) => ({
  ...(await o<typeof import('@/bild/bildverarbeitung')>()),
  mittigZuschneiden: vi.fn(async (bild: string, v: number) => `${bild}|${v}`),
}));

afterEach(() => {
  cleanup();
  vi.mocked(mittigZuschneiden).mockClear();
});

const B = 'data:image/png;base64,BB';
const buch: Buch = {
  id: '11800000-0000-4000-8000-000000000001',
  titel: 'Harry Potter und der Stein der Weisen',
  autor: 'J. K. Rowling',
  isbn: '9783551551672',
  status: 'ungelesen',
  format: 'print',
  unterformat: 'taschenbuch',
};
const treffer: Treffer[] = [{ quelle: 'openlibrary', angaben: { titel: 'Anders', autor: 'X', cover: B } }];
const fenster = () => screen.queryByRole('dialog', { name: 'Cover online suchen' });

describe('Cover online suchen in den Buchdetails (REQ-118)', () => {
  it('Vorbelegung ISBN, Autostart, Antippen speichert zugeschnittenes Frontcover, sonst nichts', async () => {
    const bilder = new InMemoryImageStore();
    await bilder.put(buch.id, 'cover', 'data:image/png;base64,AA');
    const repo = new InMemoryBookRepository();
    await repo.save(buch);
    const coverSuche = { suchen: vi.fn(async () => treffer) };
    render(<BuchDetails buchId={buch.id} buch={buch} repository={repo} bildspeicher={bilder} coverSuche={coverSuche} onZurueck={() => {}} />);
    await vi.waitFor(() => expect(document.querySelectorAll('[data-bereich]')).toHaveLength(3));
    fireEvent.click(document.querySelector('[data-bereich="ruecken"]')!);
    const m1 = await screen.findByRole('menu', { name: 'Bild hinzufügen' });
    expect(within(m1).queryByRole('menuitem', { name: 'Cover online suchen' })).toBeNull();
    fireEvent.click(document.querySelector('[data-menue-hintergrund]')!);
    fireEvent.click(document.querySelector('[data-bereich="cover"]')!);
    const m2 = await screen.findByRole('menu', { name: 'Bild hinzufügen' });
    fireEvent.click(within(m2).getByRole('menuitem', { name: 'Cover online suchen' }));
    expect(screen.queryByRole('menu')).toBeNull();
    expect((within(fenster()!).getByRole('searchbox') as HTMLInputElement).value).toBe('9783551551672');
    await vi.waitFor(() => expect(fenster()!.querySelector('[data-cover-treffer="0"]')).not.toBeNull());
    expect(coverSuche.suchen).toHaveBeenCalledWith('9783551551672', ['ger']);
    await act(async () => {
      fireEvent.click(fenster()!.querySelector('[data-cover-treffer="0"]')!);
    });
    expect(fenster()).toBeNull();
    await vi.waitFor(async () => expect(await bilder.get(buch.id, 'cover')).toBe(`${B}|${138 / 218}`));
    expect(await repo.get(buch.id)).toEqual(buch);
  });
});

describe('Cover online suchen im Manuellen Eintrag (REQ-118)', () => {
  it('leer: keine Suche; mit Titel/Autor vorbelegt; Cover vorgemerkt und erst mit „Hinzufügen“ gespeichert; Sprache gemeinsam', async () => {
    const repo = new InMemoryBookRepository();
    const bilder = new InMemoryImageStore();
    const einstellungen = new InMemoryEinstellungRepository();
    await einstellungen.speichern('onlineSucheSprachen', '["eng"]');
    const coverSuche = { suchen: vi.fn(async () => treffer) };
    render(<BuecherAnsicht repository={repo} bildspeicher={bilder} coverSuche={coverSuche} einstellungRepository={einstellungen} />);
    await screen.findByRole('heading', { name: 'Deine Bücher' });
    fireEvent.click(screen.getByRole('button', { name: 'Buch hinzufügen' }));
    fireEvent.click(document.querySelector('[data-option="von-hand"]')!);
    const blatt = await screen.findByRole('dialog', { name: 'Manueller Eintrag' });
    const menuePunkt = async () => {
      fireEvent.click(blatt.querySelector('[data-cover-hinzufuegen]')!);
      const m = await screen.findByRole('menu', { name: 'Bild hinzufügen' });
      fireEvent.click(within(m).getByRole('menuitem', { name: 'Cover online suchen' }));
    };
    await menuePunkt();
    expect((within(fenster()!).getByRole('searchbox') as HTMLInputElement).value).toBe('');
    await act(async () => new Promise((r) => setTimeout(r, 20)));
    expect(coverSuche.suchen).not.toHaveBeenCalled();
    expect(within(fenster()!).getByRole('button', { name: 'Englisch' })).toHaveAttribute('aria-pressed', 'true');
    fireEvent.click(within(fenster()!).getByRole('button', { name: 'Zurück' }));
    fireEvent.change(within(blatt).getByLabelText(/^\s*Titel\s*$/i), { target: { value: 'Iron Flame' } });
    fireEvent.change(within(blatt).getByLabelText(/^\s*Autor\s*$/i), { target: { value: 'Rebecca Yarros' } });
    await menuePunkt();
    expect((within(fenster()!).getByRole('searchbox') as HTMLInputElement).value).toBe('Iron Flame Rebecca Yarros');
    await vi.waitFor(() => expect(coverSuche.suchen).toHaveBeenCalledWith('Iron Flame Rebecca Yarros', ['eng']));
    await vi.waitFor(() => expect(fenster()!.querySelector('[data-cover-treffer="0"]')).not.toBeNull());
    await act(async () => {
      fireEvent.click(fenster()!.querySelector('[data-cover-treffer="0"]')!);
    });
    expect(fenster()).toBeNull();
    await vi.waitFor(() => expect(blatt.querySelector('[data-cover-vorschau]')).not.toBeNull());
    expect((within(blatt).getByLabelText(/^\s*Titel\s*$/i) as HTMLInputElement).value).toBe('Iron Flame');
    expect(await repo.list()).toEqual([]);
  });
});
