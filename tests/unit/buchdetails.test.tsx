import '@testing-library/jest-dom/vitest';
import { act, cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import App from '@/App';
import Zuschnitt from '@/buchdetails/Zuschnitt';
import { seitenverhaeltnis } from '@/buchdetails/masse';
import { InMemoryImageStore } from '@/storage/InMemoryImageStore';
import BuecherAnsicht from '@/views/BuecherAnsicht';

afterEach(cleanup);

const BILD = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAIAAACQd1PeAAAADElEQVR4nGNgYPgPAAEDAQAIicLsAAAAAElFTkSuQmCC';
const buch = { id: '11111111-2222-4333-8444-555555555555', titel: 'Momo', status: 'ungelesen' as const };
const ecke = (i: number) => document.querySelector<HTMLElement>(`[data-eckpunkt="${i}"]`)!;
const lage = (i: number) => [Number(ecke(i).dataset.x), Number(ecke(i).dataset.y)];

describe('Buchdetails: Aufruf und Rückweg', () => {
  it('Cover antippen öffnet die Buchdetails, Reiter „Bücher“ führt zurück zu „Deine Bücher“', async () => {
    render(<App />);
    fireEvent.click(within(screen.getByRole('navigation')).getByRole('button', { name: 'Bücher' }));
    const liste = await screen.findByRole('list', { name: 'Noch zu lesen' });
    const ersterTitel = within(liste).getAllByText(/./)[0].textContent;
    fireEvent.click(liste.querySelector('[data-cover-platzhalter]')!);
    const details = await screen.findByRole('region', { name: 'Buchdetails' });
    expect(await within(details).findByText(ersterTitel!, { selector: '[data-buchdetails-titel]' })).toBeTruthy();
    expect(within(screen.getByRole('navigation')).getByRole('button', { name: 'Bücher' })).toHaveAttribute('aria-current', 'page');
    fireEvent.click(within(screen.getByRole('navigation')).getByRole('button', { name: 'Bücher' }));
    expect(screen.queryByRole('region', { name: 'Buchdetails' })).toBeNull();
    expect(screen.getByRole('heading', { name: 'Deine Bücher' })).toBeTruthy();
  });
});

describe('Frontcover in der Liste', () => {
  it('zeigt das im Bildspeicher hinterlegte Cover statt des Platzhalters, Rücken/Schnitt nicht', async () => {
    const speicher = new InMemoryImageStore();
    await speicher.put(buch.id, 'ruecken', BILD);
    const { unmount } = render(<BuecherAnsicht buecher={[buch]} bildspeicher={speicher} />);
    await act(async () => {});
    // Auf „Noch zu lesen“ eingeschränkt: Das Buch steht zusätzlich im Abschnitt „Alle Bücher“ (REQ-035).
    const nochZuLesen = () => screen.getByRole('region', { name: 'Noch zu lesen' });
    expect(nochZuLesen().querySelector('[data-cover-platzhalter]')).not.toBeNull();
    unmount();
    await speicher.put(buch.id, 'cover', BILD);
    render(<BuecherAnsicht buecher={[buch]} bildspeicher={speicher} />);
    expect(await within(nochZuLesen()).findByRole('img', { name: 'Momo' })).toHaveAttribute('src', BILD);
  });
});

describe('Zuschnitt', () => {
  it('Startformat je Zielbereich, Eckpunkte einzeln verschiebbar, Bestätigen liefert die Ecken', async () => {
    const bestaetigt = vi.fn();
    render(<Zuschnitt bild={BILD} bereich="schnitt" onBestaetigen={bestaetigt} onZurueck={() => {}} />);
    expect(screen.getByRole('region', { name: 'Zuschnitt' })).toHaveAttribute('data-startformat', 'schmal');
    const vorher = [0, 1, 2, 3].map(lage);
    // Startrechteck im Seitenverhältnis des Bereichs (ohne bekannte Bildgröße: quadratisch angenommen).
    expect((vorher[1][0] - vorher[0][0]) / (vorher[3][1] - vorher[0][1])).toBeCloseTo(seitenverhaeltnis('schnitt'), 3);
    fireEvent.pointerDown(ecke(2), { clientX: 0, clientY: 0 });
    fireEvent.pointerMove(window, { clientX: 0.9, clientY: 0.95 });
    fireEvent.pointerUp(window);
    const nachher = [0, 1, 2, 3].map(lage);
    expect(nachher[0]).toEqual(vorher[0]);
    expect(nachher[1]).toEqual(vorher[1]);
    expect(nachher[3]).toEqual(vorher[3]);
    expect(nachher[2]).not.toEqual(vorher[2]);
    fireEvent.click(screen.getByRole('button', { name: 'Bestätigen' }));
    await act(async () => {});
    expect(bestaetigt).toHaveBeenCalledTimes(1);
    expect(bestaetigt.mock.calls[0][0][2]).toEqual({ x: nachher[2][0], y: nachher[2][1] });
  });

  it('Cover startet im breiten Format', () => {
    render(<Zuschnitt bild={BILD} bereich="cover" onBestaetigen={() => {}} onZurueck={() => {}} />);
    expect(screen.getByRole('region', { name: 'Zuschnitt' })).toHaveAttribute('data-startformat', 'cover');
    const e = [0, 1, 3].map(lage);
    expect((e[1][0] - e[0][0]) / (e[2][1] - e[0][1])).toBeCloseTo(seitenverhaeltnis('cover'), 3);
  });
});
