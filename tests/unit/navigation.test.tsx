import { cleanup, fireEvent, render } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import Hauptnavigation from '@/navigation/Hauptnavigation';
import { menuePunkte, startMenuePunkt, type MenuePunktId } from '@/navigation/menu';
import { ansichten } from '@/views';
import UnderConstruction from '@/views/UnderConstruction';

// Inhalte als Data-URL (base64), um Kopie und Original byteweise zu vergleichen.
const glob = (g: Record<string, string>) =>
  Object.fromEntries(Object.entries(g).map(([pfad, inhalt]) => [pfad.split('/').pop(), inhalt]));
const kopien = glob(import.meta.glob<string>('/src/assets/icons/*.png', { eager: true, query: '?inline', import: 'default' }));
const originale = glob(
  import.meta.glob<string>('/docs/requirements/referenzen/icons/*.png', { eager: true, query: '?inline', import: 'default' }),
);

afterEach(cleanup);

describe('Menü-Konfiguration', () => {
  it('führt die fünf Menüpunkte in fester Reihenfolge', () => {
    expect(menuePunkte.map((p) => p.beschriftung)).toEqual([
      'Start',
      'Bücher',
      'Bibliothek',
      'Statistik',
      'Profil',
    ]);
  });

  it('ordnet die Icons gemäß Zuordnungstabelle zu', () => {
    expect(Object.fromEntries(menuePunkte.map((p) => [p.beschriftung, p.iconDatei]))).toEqual({
      Start: 'icon-haus.png',
      Bücher: 'icon-offenes-buch.png',
      Bibliothek: 'icon-buecherregal.png',
      Statistik: 'icon-diagramm.png',
      Profil: 'icon-person.png',
    });
  });

  it('verwendet unveränderte Kopien der CEO-Icons', () => {
    // Nur die fünf Navigations-Icons laut REQ-002 (Zuordnung aus menu.ts), nicht alle Referenzdateien.
    expect(menuePunkte).toHaveLength(5);
    for (const p of menuePunkte) {
      expect(originale[p.iconDatei]).toMatch(/^data:image\/png;base64,/);
      expect(kopien[p.iconDatei]).toBe(originale[p.iconDatei]);
      expect(p.iconUrl).toContain(p.iconDatei.replace('.png', ''));
    }
  });

  it('startet mit "Start"', () => {
    expect(startMenuePunkt).toBe('start');
  });

  it('hat für jeden Menüpunkt eine Ansicht, aktuell den Platzhalter', () => {
    for (const p of menuePunkte) expect(ansichten[p.id]).toBe(UnderConstruction);
  });
});

describe('Hauptnavigation', () => {
  it('markiert genau den aktiven Menüpunkt und meldet Auswahl', () => {
    const gewaehlt: MenuePunktId[] = [];
    const { getAllByRole, rerender } = render(
      <Hauptnavigation aktiv="start" onAuswahl={(id) => gewaehlt.push(id)} />,
    );
    const aktuell = () =>
      getAllByRole('button')
        .filter((b) => b.getAttribute('aria-current') === 'page')
        .map((b) => b.textContent);
    expect(aktuell()).toEqual(['Start']);

    fireEvent.click(getAllByRole('button')[1]);
    expect(gewaehlt).toEqual(['buecher']);

    rerender(<Hauptnavigation aktiv="buecher" onAuswahl={() => {}} />);
    expect(aktuell()).toEqual(['Bücher']);
    expect(getAllByRole('button')[0].hasAttribute('aria-current')).toBe(false);
  });

  it('zeigt die Hervorhebung nur beim aktiven Menüpunkt', () => {
    const { container } = render(<Hauptnavigation aktiv="statistik" onAuswahl={() => {}} />);
    expect(container.querySelectorAll('[data-highlight="inactive"]')).toHaveLength(4);
    const hervorhebungen = container.querySelectorAll('[data-highlight="active"]');
    expect(hervorhebungen).toHaveLength(1);
    expect(hervorhebungen[0].querySelector('[data-icon]')?.getAttribute('data-icon')).toBe(
      'icon-diagramm.png',
    );
  });
});
