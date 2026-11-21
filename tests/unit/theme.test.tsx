import { cleanup, render } from '@testing-library/react';
import type { CSSProperties } from 'react';
import { afterEach, describe, expect, it } from 'vitest';
import { farbrubriken, farbVariablen, navFarbe, navigationsFarbrollen } from '@/theme';

afterEach(cleanup);

/** Hex -> "rgb(r, g, b)", wie getComputedStyle es liefert. */
const rgb = (hex: string) => {
  const n = parseInt(hex.slice(1), 16);
  return `rgb(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255})`;
};

describe('Farbrubriken', () => {
  it('führt die Rubriken mit Namen und Wert', () => {
    expect(Object.keys(farbrubriken).sort()).toEqual([
      'dunkelbraun',
      'flammeorange',
      'flammerot',
      'ghost',
      'ghostframe',
      'hintergrund',
      'primaer',
      'sekundaer',
      'tertiaer',
    ]);
    for (const r of Object.values(farbrubriken)) {
      expect(r.name).not.toBe('');
      expect(r.wert).toMatch(/^#[0-9A-Fa-f]{6}$/);
    }
  });

  it('leitet die Navigations-Farbrollen aus den Rubriken ab', () => {
    expect(navigationsFarbrollen).toEqual({
      navigationshintergrund: 'hintergrund',
      hervorhebungsfarbe: 'sekundaer',
      aktivfarbe: 'primaer',
      inaktivfarbe: 'tertiaer',
    });
  });

  it('löst die Farbrollen über CSS-Variablen auf den Rubrikwert auf', () => {
    const { getByTestId } = render(
      <div style={farbVariablen() as CSSProperties}>
        {(Object.keys(navigationsFarbrollen) as (keyof typeof navigationsFarbrollen)[]).map((rolle) => (
          <span key={rolle} data-testid={rolle} style={{ color: navFarbe(rolle) }} />
        ))}
      </div>,
    );
    for (const [rolle, rubrik] of Object.entries(navigationsFarbrollen)) {
      expect(getComputedStyle(getByTestId(rolle)).color).toBe(rgb(farbrubriken[rubrik].wert));
    }
  });
});

describe('Seitenhintergrund (REQ-002/AK-13)', () => {
  it('rubrikFarbe verweist auf die CSS-Variable der Rubrik', async () => {
    const { rubrikFarbe } = await import('@/theme');
    expect(rubrikFarbe('hintergrund')).toBe('var(--bz-farbe-hintergrund)');
  });

  it('farbVariablenAnwenden setzt die Farbvariablen auf ein Element', async () => {
    const { farbVariablenAnwenden } = await import('@/theme');
    const el = document.createElement('div');
    farbVariablenAnwenden(el);
    expect(el.style.getPropertyValue('--bz-farbe-hintergrund')).toBe(farbrubriken.hintergrund.wert);
    expect(el.style.getPropertyValue('--bz-nav-navigationshintergrund')).toBe('var(--bz-farbe-hintergrund)');
  });

  it('Inhaltsbereich und App-Wurzel nutzen die Rubrik „Hintergrund“', async () => {
    const { default: App } = await import('@/App');
    const { getByRole } = render(<App />);
    const main = getByRole('main');
    expect(main.style.backgroundColor).toBe('var(--bz-farbe-hintergrund)');
    expect((main.parentElement as HTMLElement).style.backgroundColor).toBe('var(--bz-farbe-hintergrund)');
    expect(getComputedStyle(main).backgroundColor).toBe(rgb(farbrubriken.hintergrund.wert));
  });
});
