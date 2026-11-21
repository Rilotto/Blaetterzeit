/**
 * Akzeptanztests REQ-048 – Stufentexte unter den Kriterien.
 * Schnittstellen laut Entwickler (Sprint 05): [data-kriterium=id], [data-stufentext], [data-symbol-nr].
 * Erwartete Texte: wörtlich aus der Tabelle im REQ.
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

const buch = (f: Partial<Buch> = {}): Buch => ({ id: crypto.randomUUID(), titel: 'Testbuch', status: 'ungelesen', ...f });
const bilder = { get: async () => undefined, put: async () => {}, remove: async () => {} } as unknown as ImageStore;
async function zeige(b: Buch = buch()) {
  const repo = new InMemoryBookRepository();
  await repo.save(b);
  render(<BuchDetails buchId={b.id} repository={repo} bildspeicher={bilder} bildquelle={{ scannen: async () => null, galerie: async () => null }} onZurueck={() => {}} />);
  const d = await screen.findByRole('region', { name: 'Buchdetails' });
  await vi.waitFor(() => expect(d.querySelector('[data-bereich-bewertung]')).not.toBeNull());
  return d;
}
async function tippe(el: Element) {
  await act(async () => {
    fireEvent.click(el);
    await new Promise((r) => setTimeout(r, 5));
  });
}
const TEXTE: Record<string, string[]> = {
  sterne: ['Nichts für mich', 'War okay', 'Hat mir gefallen', 'Absolut spitze', 'Ich habe es geliebt'],
  tempo: ['Zäh wie Kaugummi', 'Eher gemächlich', 'Angenehmes Tempo', 'Flott unterwegs', 'Rasant, kaum Luft geholt'],
  weltenbau: ['Kaum vorhanden', 'Eher blass', 'Solide Welt', 'Lebendig und durchdacht', 'Sehr detailreich wie im Film'],
  spice: ['Ganz zahm', 'Ein Hauch Würze', 'Wird warm', 'Ziemlich heiß', 'Feuerscharf'],
  spannung: ['Kein Nervenkitzel', 'Leicht spannend', 'Hat mich gepackt', 'Stand unter Strom', 'Konnte nicht aufhören'],
  action: ['Ganz ruhig', 'Wenig los', 'Ordentlich Action', 'Viel Krawall', 'Explosiv'],
  hauptfiguren: ['Nichts für mich', 'Ganz okay', 'Mochte ich', 'Ans Herz gewachsen', 'Neue Lieblinge'],
  nebenfiguren: ['Blass geblieben', 'Ganz okay', 'Gut besetzt', 'Echte Bereicherung', 'Vollständige Charaktere mit Hintergrund'],
  plotTwist: ['Sah ich kommen', 'Kleine Überraschung', 'Gut versteckt', 'Hat mich erwischt', 'Komplett umgehauen'],
  traenen: ['Trockene Augen', 'Kurz geschluckt', 'Feuchte Augen', 'Taschentuch gebraucht', 'Hemmungslos geweint'],
  romantik: ['Kaum Romantik', 'Ein zartes Knistern', 'Schön romantisch', 'Herzklopfen pur', 'Hoffnungslos verliebt'],
  humor: ['Kaum gelacht', 'Mal geschmunzelt', 'Oft gelacht', 'Sehr witzig', 'Bauchweh vor Lachen'],
  grusel: ['Gar nicht gruselig', 'Leichtes Kribbeln', 'Gänsehaut', 'Licht angelassen', 'Albtraumstoff'],
  dialoge: ['Hölzern', 'Etwas steif', 'Natürlich', 'Schlagfertig', 'Hätte ich gern selbst gesagt'],
};
const zeile = (d: HTMLElement, k: string) => d.querySelector<HTMLElement>(`[data-kriterium="${k}"]`)!;
const text = (d: HTMLElement, k: string) => zeile(d, k).querySelector('[data-stufentext]')?.textContent?.trim() ?? null;
const symbol = (d: HTMLElement, k: string, n: number) => zeile(d, k).querySelector(`[data-symbol-nr="${n}"]`)!;
/** Sichtbarer Text der Zeile ohne Kriteriennamen (Symbole tragen keinen Text). */
const restText = (d: HTMLElement, k: string) => {
  const z = zeile(d, k).cloneNode(true) as HTMLElement;
  z.querySelector('[data-kriterium-name]')?.remove();
  return z.textContent?.trim();
};

describe('REQ-048 Stufentexte', () => {
  it('[REQ-048/AK-1] „Sterne“ nacheinander auf 1–5 → jeweils der Stufentext; er steht unter dem Namen', async () => {
    const d = await zeige();
    for (let n = 1; n <= 5; n++) {
      await tippe(symbol(d, 'sterne', n));
      expect(text(d, 'sterne')).toBe(TEXTE.sterne[n - 1]);
      const name = zeile(d, 'sterne').querySelector('[data-kriterium-name]')!;
      expect(name.compareDocumentPosition(zeile(d, 'sterne').querySelector('[data-stufentext]')!) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    }
  });

  it('[REQ-048/AK-2] Sterne 3 → 5: „Ich habe es geliebt“, „Hat mir gefallen“ verschwindet', async () => {
    const d = await zeige(buch({ bewertungen: { sterne: 3 } } as Partial<Buch>));
    expect(text(d, 'sterne')).toBe('Hat mir gefallen');
    await tippe(symbol(d, 'sterne', 5));
    expect(text(d, 'sterne')).toBe('Ich habe es geliebt');
    expect(zeile(d, 'sterne').textContent).not.toContain('Hat mir gefallen');
    expect(zeile(d, 'sterne').querySelectorAll('[data-stufentext]')).toHaveLength(1);
  });

  it('[REQ-048/AK-3] alle übrigen 13 Kriterien × Stufen 1–5 zeigen genau den Tabellentext', async () => {
    const d = await zeige();
    for (const [k, texte] of Object.entries(TEXTE)) {
      if (k === 'sterne') continue;
      for (let n = 1; n <= 5; n++) {
        await tippe(symbol(d, k, n));
        expect(text(d, k), `${k}=${n}`).toBe(texte[n - 1]);
      }
    }
  });

  it('[REQ-048/AK-3] Stufentext erscheint nur beim bewerteten Kriterium, nicht bei den anderen', async () => {
    const d = await zeige(buch({ bewertungen: { humor: 4 } } as Partial<Buch>));
    expect(text(d, 'humor')).toBe('Sehr witzig');
    expect(d.querySelectorAll('[data-stufentext]')).toHaveLength(1);
  });

  it('[REQ-048/AK-4] ohne Bewertung steht unter keinem Kriteriennamen ein Text', async () => {
    const d = await zeige();
    expect(d.querySelectorAll('[data-stufentext]')).toHaveLength(0);
    for (const k of Object.keys(TEXTE)) expect(restText(d, k), k).toBe('');
  });

  it('[REQ-048/AK-4] nach dem Zurücksetzen (gleiches Symbol erneut) steht kein Text mehr darunter', async () => {
    const d = await zeige(buch({ bewertungen: { grusel: 2 } } as Partial<Buch>));
    expect(text(d, 'grusel')).toBe('Leichtes Kribbeln');
    await tippe(symbol(d, 'grusel', 2));
    expect(text(d, 'grusel')).toBeNull();
    expect(restText(d, 'grusel')).toBe('');
  });
});
