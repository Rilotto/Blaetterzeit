import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import App from '@/App';
import { InMemoryEinstellungRepository } from '@/storage';

// REQ-071 F8: Feuilleton ändert nur die Optik, nie die Maße von „Klassisch“.

const T = vi.hoisted(() => ({
  buecher: [
    { id: '71f80000-0000-4000-8000-000000000001', titel: 'Momo', autor: 'Michael Ende', status: 'am_lesen' as const, seitenanzahl: 300, aktuelleSeite: 120 },
    { id: '71f80000-0000-4000-8000-000000000002', titel: 'Krabat', autor: 'Otfried Preußler', status: 'ungelesen' as const },
  ],
}));
vi.mock('@/buecher/demodaten', () => ({ demoBuecher: T.buecher }));
const W = { timeout: 4000 };
beforeEach(() => localStorage.clear());

afterEach(() => {
  cleanup();
  localStorage.clear();
  delete document.documentElement.dataset.stil;
});

const MASSE = [
  'marginTop',
  'marginRight',
  'marginBottom',
  'marginLeft',
  'paddingTop',
  'paddingRight',
  'paddingBottom',
  'paddingLeft',
  'gap',
  'rowGap',
  'columnGap',
  'width',
  'height',
  'minHeight',
  'minWidth',
  'lineHeight',
] as const;
const RAHMEN = ['borderTopWidth', 'borderRightWidth', 'borderBottomWidth', 'borderLeftWidth'] as const;

/** Rollen mit fester Größe und border-box: Rahmen liegt innen, Breite darf sich ändern. */
const RAHMEN_INNEN = ['cover', 'navmarke'];

const rollen = (e: Element) => (e.getAttribute('data-stil-rolle') ?? '').split(' ');

function aufnahme(): string[] {
  return Array.from(document.querySelectorAll<HTMLElement>('[data-stil-rolle]')).map((e) => {
    const s = getComputedStyle(e);
    const r = rollen(e);
    // Balkendicke ist die einzige erlaubte Maßänderung.
    const masse = MASSE.filter((p) => !(p === 'height' && r.includes('balken'))).map((p) => `${p}=${s[p]}`);
    const rahmen = r.some((x) => RAHMEN_INNEN.includes(x)) ? [] : RAHMEN.map((p) => `${p}=${s[p]}`);
    return `${r.join('+')}: ${[...masse, ...rahmen].join(' ')}`;
  });
}

/** Vergleicht die Maße aller Stil-Elemente im Feuilleton mit denselben Elementen ohne Feuilleton-Regeln (= Klassisch). */
function vergleiche(ort: string) {
  const regeln = document.querySelector('style[data-stil-regeln]')!;
  expect(regeln, ort).not.toBeNull();
  const feuilleton = aufnahme();
  expect(feuilleton.length, ort).toBeGreaterThan(0);
  const text = regeln.textContent;
  regeln.textContent = '';
  try {
    expect(feuilleton, ort).toEqual(aufnahme());
  } finally {
    regeln.textContent = text;
  }
}

describe('Feuilleton behält die Maße von Klassisch (REQ-071 F8)', () => {
  it('Bücher, Übersicht, Buchdetails, Profil und Fenster Design: margin, padding, gap, Höhe, Breite gleich', async () => {
    const repo = new InMemoryEinstellungRepository();
    await repo.speichern('stil', 'feuilleton');
    const { container } = render(<App einstellungRepository={repo} />);
    await waitFor(() => expect((container.querySelector('[data-app-wurzel]') as HTMLElement).dataset.stil).toBe('feuilleton'));
    const nav = await screen.findByRole('navigation', { name: 'Hauptnavigation' });

    // Seite „Bücher“ mit Bücherreihen, Filterleiste und Navigation
    fireEvent.click(within(nav).getByRole('button', { name: /Bücher/ }));
    await waitFor(() => expect(container.querySelector('[data-bucheintrag]')).not.toBeNull(), W);
    vergleiche('Bücher');

    // Übersicht in Raster und Liste
    fireEvent.click(container.querySelector('[data-alle-ansehen]') as HTMLElement);
    await waitFor(() => expect(container.querySelector('[data-umschalter]')).not.toBeNull(), W);
    vergleiche('Übersicht');
    const umschalter = container.querySelector('[data-umschalter]') as HTMLElement;
    for (const knopf of Array.from(umschalter.querySelectorAll('button'))) {
      fireEvent.click(knopf);
      vergleiche(`Übersicht ${knopf.getAttribute('aria-label') ?? ''}`);
    }

    // Buchdetails mit Reiterleiste und den Karten der Reiter
    const eintrag = container.querySelector('[data-listenkarte], [data-rastereintrag]') as HTMLElement;
    fireEvent.click(eintrag);
    const details = await screen.findByRole('region', { name: 'Buchdetails' }, W);
    vergleiche('Buchdetails');
    for (const reiter of Array.from(details.querySelectorAll<HTMLElement>('[data-reiter]'))) {
      fireEvent.click(reiter);
      vergleiche(`Buchdetails ${reiter.getAttribute('data-reiter')}`);
    }

    // Profil-Karte und Fenster „Design“
    fireEvent.click(within(nav).getByRole('button', { name: /Profil/ }));
    await waitFor(() => expect(container.querySelector('[data-profil-karte]')).not.toBeNull(), W);
    vergleiche('Profil');
    fireEvent.click(container.querySelector('[data-profil-zeile="design"]') as HTMLElement);
    for (const reiter of Array.from(container.querySelectorAll<HTMLElement>('[data-design-reiter]'))) {
      fireEvent.click(reiter);
      vergleiche(`Design ${reiter.getAttribute('data-design-reiter')}`);
    }
  }, 20000);
});
