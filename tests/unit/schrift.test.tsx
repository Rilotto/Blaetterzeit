import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import App from '@/App';
import { appSchrift, schrift, schriftVariable, schriftVariablen } from '@/theme';

afterEach(cleanup);

describe('App-Schrift (REQ-003)', () => {
  it('legt den Systemschrift-Stack mit generischer Ersatzschrift zentral fest', () => {
    expect(appSchrift).toBe("system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif");
    expect(appSchrift.trim().endsWith('sans-serif')).toBe(true);
    expect(schriftVariablen()).toEqual({ [schriftVariable]: appSchrift });
    expect(schrift).toBe('var(--bz-schrift)');
  });

  it('lädt keine Schriftdatei', () => {
    const css = Object.keys(import.meta.glob('/src/**/*.css'));
    expect(css).toEqual(['/src/index.css']);
  });

  it('setzt --bz-schrift an der App-Wurzel und verwendet sie als Schrift', () => {
    const { container } = render(<App />);
    const wurzel = container.firstElementChild as HTMLElement;
    expect(wurzel.style.getPropertyValue('--bz-schrift')).toBe(appSchrift);
    expect(wurzel.style.fontFamily).toBe('var(--bz-schrift)');
    expect(screen.getByText('under construction :)')).toBeTruthy();
  });
});

describe('Farbreferenzen der Hauptnavigation (REQ-002)', () => {
  it('referenziert Farben nur über --bz-nav-Variablen', () => {
    const { container } = render(<App />);
    const nav = container.querySelector('nav') as HTMLElement;
    expect(nav.style.backgroundColor).toBe('var(--bz-nav-navigationshintergrund)');
    for (const button of nav.querySelectorAll('button')) {
      const aktiv = button.getAttribute('aria-current') === 'page';
      const rolle = aktiv ? 'aktivfarbe' : 'inaktivfarbe';
      const icon = button.querySelector('[data-icon]') as HTMLElement;
      const hl = button.querySelector('[data-highlight]') as HTMLElement;
      const label = button.lastElementChild as HTMLElement;
      expect(icon.style.backgroundColor).toBe(`var(--bz-nav-${rolle})`);
      expect(label.style.color).toBe(`var(--bz-nav-${rolle})`);
      expect(hl.getAttribute('data-highlight')).toBe(aktiv ? 'active' : 'inactive');
      expect(hl.style.backgroundColor).toBe(aktiv ? 'var(--bz-nav-hervorhebungsfarbe)' : '');
    }
  });
});
