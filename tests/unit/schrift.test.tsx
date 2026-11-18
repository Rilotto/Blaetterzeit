import { cleanup, render } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import App from '@/App';
import { InMemoryEinstellungRepository } from '@/storage';
import { appSchrift, schrift, schriften, schriftReihenfolge, schriftVariable, schriftVariablen, standardSchrift } from '@/theme';

afterEach(cleanup);

describe('App-Schrift (REQ-003, REQ-065, REQ-069)', () => {
  it('Standard ist Fraunces; jede Schriftfolge endet mit einer generischen Ersatzschrift', () => {
    expect(standardSchrift).toBe('fraunces');
    expect(appSchrift).toBe(schriften.fraunces.folge);
    expect(appSchrift.startsWith("'Fraunces Variable'")).toBe(true);
    expect(schriftReihenfolge.map((id) => schriften[id].name)).toEqual(['Systemschrift', 'Fraunces']);
    for (const id of schriftReihenfolge) expect(schriften[id].folge.trim()).toMatch(/(serif|sans-serif)$/);
    expect(schriftVariablen()).toEqual({ [schriftVariable]: appSchrift });
    expect(schriftVariablen('system')).toEqual({ [schriftVariable]: schriften.system.folge });
    expect(schrift).toBe('var(--bz-schrift)');
  });

  it('bindet Fraunces lokal ein und liefert die Lizenz mit', async () => {
    const main = Object.values(import.meta.glob('/src/main.tsx', { query: '?raw', import: 'default', eager: true }))[0] as string;
    expect(main).toContain("@fontsource-variable/fraunces/opsz.css");
    expect(main).not.toMatch(/https?:\/\//);
    const lizenz = Object.keys(import.meta.glob('/public/lizenzen/Fraunces-OFL.txt', { query: '?raw' }));
    expect(lizenz).toEqual(['/public/lizenzen/Fraunces-OFL.txt']);
  });

  it('setzt --bz-schrift an der App-Wurzel und verwendet sie als Schrift', () => {
    const { container } = render(<App einstellungRepository={new InMemoryEinstellungRepository()} />);
    const wurzel = container.firstElementChild as HTMLElement;
    expect(wurzel.style.getPropertyValue('--bz-schrift')).toBe(appSchrift);
    expect(wurzel.style.fontFamily).toBe('var(--bz-schrift)');
  });
});

describe('Farbreferenzen der Hauptnavigation (REQ-002)', () => {
  it('referenziert Farben nur über --bz-nav-Variablen', () => {
    const { container } = render(<App einstellungRepository={new InMemoryEinstellungRepository()} />);
    const nav = container.querySelector('nav') as HTMLElement;
    expect(nav.style.backgroundColor).toBe('var(--bz-nav-navigationshintergrund)');
    for (const button of nav.querySelectorAll('button')) {
      const aktiv = button.getAttribute('aria-current') === 'page';
      const rolle = aktiv ? 'aktivfarbe' : 'inaktivfarbe';
      const icon = button.querySelector('[data-icon]') as HTMLElement;
      const label = button.lastElementChild as HTMLElement;
      expect(icon.style.backgroundColor).toBe(`var(--bz-nav-${rolle})`);
      expect(label.style.color).toBe(`var(--bz-nav-${rolle})`);
    }
  });
});
