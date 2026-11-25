import '@testing-library/jest-dom/vitest';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { InMemoryListenRepository, InMemoryZitatRepository, type ImageStore } from '@/storage';
import { InMemoryBookRepository } from '@/storage/InMemoryBookRepository';
import BuchDetails from '@/views/BuchDetails';

vi.mock('@/buecher/demodaten', () => ({ demoBuecher: [] }));
afterEach(() => cleanup());

const bilder = { get: async () => undefined, put: async () => {}, remove: async () => {} } as unknown as ImageStore;
async function tippe(el: Element) {
  await act(async () => {
    fireEvent.click(el);
    await new Promise((r) => setTimeout(r, 20));
  });
}
const q = <T extends Element = HTMLElement>(s: string) => document.querySelector<T>(s);
const setze = (feld: string, wert: string) => act(async () => void fireEvent.change(q(`[data-zitat-feld="${feld}"]`)!, { target: { value: wert } }));

async function zeige(zitate = new InMemoryZitatRepository()) {
  const repo = new InMemoryBookRepository();
  const id = crypto.randomUUID();
  await repo.save({ id, titel: 'Fourth Wing', status: 'am_lesen' });
  render(
    <BuchDetails
      buchId={id}
      repository={repo}
      bildspeicher={bilder}
      listenRepository={new InMemoryListenRepository()}
      zitatRepository={zitate}
      jetzt={() => new Date(2026, 10, 24, 12)}
      bildquelle={{ scannen: async () => null, galerie: async () => null }}
      onZurueck={() => {}}
    />,
  );
  await vi.waitFor(() => expect(q('[data-reiter="notizbuch"]')).not.toBeNull());
  await tippe(q('[data-reiter="notizbuch"]')!);
  return { zitate, id };
}
async function anlegen(text: string, sprecher = '', seite = '') {
  await tippe(q('[data-zitat-hinzufuegen]') ?? q('[data-zitat-plus]')!);
  await setze('text', text);
  await setze('sprecher', sprecher);
  await setze('seite', seite);
  await tippe(q('[data-blatt-sichern="zitat"]')!);
}
const texte = () => [...document.querySelectorAll('[data-zitat] [data-zitat-text]')].map((e) => e.textContent);

describe('Reiter „Notizbuch“ (REQ-105)', () => {
  it('ohne Zitate: „Zitate“ und „+ Zitat hinzufügen“, kein Platzhalter; Platzhalter der Felder', async () => {
    await zeige();
    const bereich = q('[data-reiter-bereich="notizbuch"]')!;
    expect(bereich.textContent).toContain('Zitate');
    expect(bereich.textContent).not.toContain('under construction');
    expect(q('[data-zitat-hinzufuegen]')!.textContent).toBe('+ Zitat hinzufügen');
    await tippe(q('[data-zitat-hinzufuegen]')!);
    expect(q('[data-zitat-feld="text"]')!.getAttribute('placeholder')).toBe('Was soll bleiben?');
    expect(q('[data-zitat-feld="sprecher"]')!.getAttribute('placeholder')).toBe('Xaden');
    expect(q('[data-zitat-feld="seite"]')!.getAttribute('placeholder')).toBe('214');
  });

  it('anlegen, Pflichtfeld, ungültige Seite, sortieren', async () => {
    const { zitate } = await zeige();
    await tippe(q('[data-zitat-hinzufuegen]')!);
    await setze('text', '   ');
    await tippe(q('[data-blatt-sichern="zitat"]')!);
    expect(q('[data-zitat-feld="text"]')!.getAttribute('data-fehler')).toBe('true');
    expect(q<HTMLElement>('[data-zitat-feld="text"]')!.style.border).toContain('var(--bz-farbe-primaer)');
    await setze('text', 'X');
    await setze('seite', '0');
    await tippe(q('[data-blatt-sichern="zitat"]')!);
    expect(q('[data-zitat-feld="seite"]')!.getAttribute('data-fehler')).toBe('true');
    expect(await zitate.alle()).toEqual([]);
    await tippe(screen.getByRole('button', { name: 'Schließen' }));
    expect(await zitate.alle()).toEqual([]);

    await anlegen('Zweihundert', '', '200');
    await anlegen('Ohne Seite', 'Xaden');
    await anlegen('Fünfzehn', 'Violet', '15');
    expect(texte()).toEqual(['„Fünfzehn“', '„Zweihundert“', '„Ohne Seite“']);
    expect((await zitate.alle()).map((z) => z.text).sort()).toEqual(['Fünfzehn', 'Ohne Seite', 'Zweihundert']);
    const ohne = [...document.querySelectorAll('[data-zitat]')][2];
    expect(ohne.querySelector('[data-zitat-sprecher]')!.textContent).toBe('Xaden');
    expect(ohne.querySelector('[data-zitat-seite]')).toBeNull();
    const zweihundert = [...document.querySelectorAll('[data-zitat]')][1];
    expect(zweihundert.querySelector('[data-zitat-sprecher]')).toBeNull();
    expect(zweihundert.querySelector('[data-zitat-seite]')!.textContent).toBe('S. 200');
    expect(await zitate.alle()).toHaveLength(3);
  });

  it('ändern mit Leeren, löschen mit Rückfrage (Abbrechen / Löschen)', async () => {
    const { zitate } = await zeige();
    await anlegen('Ich bin nicht das Feuer.', 'Violet', '312');
    await tippe(q('[data-zitat] button')!);
    expect(q<HTMLTextAreaElement>('[data-zitat-feld="text"]')!.value).toBe('Ich bin nicht das Feuer.');
    await setze('sprecher', '');
    await setze('seite', '313');
    await tippe(q('[data-blatt-sichern="zitat"]')!);
    expect(q('[data-zitat] [data-zitat-sprecher]')).toBeNull();
    expect(q('[data-zitat] [data-zitat-seite]')!.textContent).toBe('S. 313');
    expect((await zitate.alle())[0].sprecher).toBeUndefined();

    await tippe(q('[data-zitat] button')!);
    await tippe(q('[data-zitat-loeschen]')!);
    expect(q('[data-loeschen-abbrechen]')!.textContent).toBe('Abbrechen');
    await tippe(q('[data-loeschen-abbrechen]')!);
    expect(await zitate.alle()).toHaveLength(1);
    await tippe(q('[data-zitat] button')!);
    await tippe(q('[data-zitat-loeschen]')!);
    expect(q('[data-loeschen-bestaetigen]')!.textContent).toBe('Löschen');
    await tippe(q('[data-loeschen-bestaetigen]')!);
    expect(await zitate.alle()).toEqual([]);
    expect(q('[data-zitat-hinzufuegen]')).not.toBeNull();
  });
});
