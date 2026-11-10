import '@testing-library/jest-dom/vitest';
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, expect, it } from 'vitest';
import BuecherAnsicht from '@/views/BuecherAnsicht';
import type { Bildquelle } from '@/bild/bildquelle';
import type { Buch } from '@/domain/buch';
import type { ImageStore } from '@/storage/ImageStore';

afterEach(() => cleanup());

const PNG = {
  rot: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAIAAACQd1PeAAAADElEQVR4nGP4z8AAAAMBAQDJ/pLvAAAAAElFTkSuQmCC',
  gruen: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAIAAACQd1PeAAAADElEQVR4nGNgaGAAAAEEAIFw9selAAAAAElFTkSuQmCC',
};
const BUECHER: Buch[] = [
  { id: '20000000-0000-4000-8000-000000000001', titel: 'Momo', status: 'ungelesen' },
  { id: '20000000-0000-4000-8000-000000000002', titel: 'Krabat', status: 'ungelesen' },
];
const [MOMO, KRABAT] = BUECHER;

function speicher(start: Record<string, string>) {
  const daten = new Map(Object.entries(start));
  return {
    get: async (id: string, b: string) => daten.get(`${id}|${b}`),
    put: async (id: string, b: string, url: string) => void daten.set(`${id}|${b}`, url),
    remove: async (id: string, b: string) => void daten.delete(`${id}|${b}`),
  } as ImageStore;
}
const eintrag = (titel: string) =>
  within(screen.getByRole('list', { name: 'Noch zu lesen' }))
    .getAllByRole('listitem')
    .find((l) => l.querySelector('[data-buchtitel]')?.textContent?.trim() === titel)!;
const coverIn = (titel: string) => eintrag(titel).querySelector('img')?.getAttribute('src') ?? null;

it('[REQ-020/GROB] Frontcover erscheint nur beim eigenen Buch in der Liste; Rücken/Schnitt nicht; nach Entfernen wieder Platzhalter', async () => {
  const s = speicher({ [`${MOMO.id}|cover`]: PNG.rot, [`${KRABAT.id}|ruecken`]: PNG.gruen, [`${KRABAT.id}|schnitt`]: PNG.gruen });
  const q: Bildquelle = { scannen: async () => null, galerie: async () => null };
  render(<BuecherAnsicht buecher={BUECHER} bildquelle={q} bildspeicher={s} />);
  await screen.findByRole('list', { name: 'Noch zu lesen' });
  await new Promise((r) => setTimeout(r, 10));
  expect(coverIn('Momo')).toBe(PNG.rot);
  expect(eintrag('Momo').querySelector('[data-cover-platzhalter]')).toBeNull();
  expect(coverIn('Krabat')).toBeNull();
  expect(eintrag('Krabat').querySelector('[data-cover-platzhalter]')).not.toBeNull();

  fireEvent.click(eintrag('Momo').querySelector('[data-buchtitel]')!);
  await screen.findByRole('region', { name: 'Buchdetails' });
  fireEvent.click(document.querySelector('[data-bereich="cover"]')!);
  const m = await screen.findByRole('menu', { name: 'Bild hinzufügen' });
  fireEvent.click(within(m).getByRole('menuitem', { name: 'Foto entfernen' }));
  await new Promise((r) => setTimeout(r, 10));
  fireEvent.click(within(screen.getByRole('region', { name: 'Buchdetails' })).getByRole('button', { name: 'Zurück' }));
  await screen.findByRole('heading', { name: 'Deine Bücher' });
  await new Promise((r) => setTimeout(r, 10));
  expect(coverIn('Momo')).toBeNull();
  expect(eintrag('Momo').querySelector('[data-cover-platzhalter]')).not.toBeNull();
});
