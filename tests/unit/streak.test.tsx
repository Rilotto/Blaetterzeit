import '@testing-library/jest-dom/vitest';
import { cleanup, render } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import Flamme from '@/buchdetails/Flamme';
import Statistik from '@/buchdetails/Statistik';
import { flammenZustand, laengsterStreak } from '@/domain/fortschritt';
import { serie, serieZustand } from '@/domain/statistik';
import { fortschrittFarbrollen } from '@/theme';

afterEach(() => cleanup());
const s = (t: number, h = 12, m = 10) => ({ zeitpunkt: new Date(2026, m, t, h).toISOString() });
const heute = new Date(2026, 10, 25, 15);

describe('Längste Serie je Buch (REQ-109)', () => {
  it('längste Folge über die Historie, unabhängig von heute', () => {
    expect(laengsterStreak([s(1), s(2), s(3), s(10), s(11)])).toBe(3);
    expect(laengsterStreak(undefined)).toBe(0);
    expect(laengsterStreak([])).toBe(0);
    expect(laengsterStreak([s(7)])).toBe(1);
  });

  it('mehrere Sitzungen am selben Tag zählen als ein Tag', () => {
    const fuenf = [s(1), s(2), s(3), s(4), s(5)];
    expect(laengsterStreak(fuenf)).toBe(5);
    expect(laengsterStreak([...fuenf, s(3, 8), s(3, 20), s(3, 23)])).toBe(5);
    expect(laengsterStreak([s(9, 0), s(9, 23), s(10, 1)])).toBe(2);
  });

  it('über Monatsgrenze und Zeitumstellung, Reihenfolge egal, ungültige Zeitpunkte ignoriert', () => {
    expect(laengsterStreak([s(1, 12, 10), s(31, 12, 9), s(30, 12, 9), { zeitpunkt: 'kaputt' }])).toBe(3);
    expect(laengsterStreak([s(24, 12, 9), s(25, 12, 9), s(26, 12, 9)])).toBe(3);
  });

  it('nie mehr als die Zahl der Lesetage, sinkt nicht durch Pausen', () => {
    const sitz = [s(1), s(2), s(3), s(4), s(5)];
    expect(laengsterStreak([...sitz, s(20)])).toBe(5);
  });
});

describe('Zustand der Gesamt-Flamme (REQ-108)', () => {
  it('angezündet, ausgegraut, erloschen', () => {
    expect(flammenZustand([s(24), s(25, 8)], heute)).toBe('aktiv');
    expect(flammenZustand([s(24)], heute)).toBe('ausgegraut');
    expect(flammenZustand([s(23)], heute)).toBe('inaktiv');
    expect(flammenZustand([], heute)).toBe('inaktiv');
    const buecher = [
      { id: 'a', titel: 'A', status: 'am_lesen' as const, sitzungen: [s(24)] },
      { id: 'b', titel: 'B', status: 'am_lesen' as const, sitzungen: [s(23)] },
    ];
    expect(serie(buecher, heute)).toBe(2);
    expect(serieZustand(buecher, heute)).toBe('ausgegraut');
  });

  it('Flamme: ausgegraut gefüllt in „Flamme ausgegraut“ (GhostFrame), ohne Verlauf, Zahl sichtbar', () => {
    expect(fortschrittFarbrollen.flammeAusgegraut).toBe('ghostframe');
    const { container } = render(<Flamme zahl={1} zustand="ausgegraut" />);
    const f = container.querySelector('[data-flamme]')!;
    expect(f.getAttribute('data-flamme')).toBe('ausgegraut');
    expect(f.querySelector('linearGradient')).toBeNull();
    expect((f.querySelector('path') as SVGPathElement).style.fill).toBe('var(--bz-farbe-ghostframe)');
    expect(f.querySelector('[data-streak-zahl]')!.textContent).toBe('1');
    cleanup();
    const a = render(<Flamme zahl={2} zustand="aktiv" />).container;
    expect(a.querySelector('[data-flamme="aktiv"] linearGradient')).not.toBeNull();
    cleanup();
    expect(render(<Flamme zahl={0} zustand="ausgegraut" />).container.querySelector('[data-flamme]')!.getAttribute('data-flamme')).toBe('inaktiv');
  });

  it('Buchdetails-Pille: Rekord mit Beschriftung, angezündet auch ohne Lesen heute', () => {
    const { container } = render(<Statistik buch={{ id: 'x', titel: 'X', status: 'gelesen', sitzungen: [s(1), s(2), s(3), s(10), s(11)] }} jetzt={heute} />);
    expect(container.querySelector('[data-streak] [data-streak-zahl]')!.textContent).toBe('3');
    expect(container.querySelector('[data-streak] [data-flamme]')!.getAttribute('data-flamme')).toBe('aktiv');
    expect(container.querySelector('[data-streak]')!.textContent).toContain('Längste Serie');
  });
});
