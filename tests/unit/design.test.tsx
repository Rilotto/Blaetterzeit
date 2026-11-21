import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import App from '@/App';
import { formatAus, preisCentAus } from '@/barcode/treffer';
import { isbnFiltern, isbnGueltig } from '@/domain/ausgabe';
import { InMemoryEinstellungRepository } from '@/storage';
import {
  farbdesignReihenfolge,
  farbdesigns,
  farbrubriken,
  farbVariablen,
  schriftstufen,
  schriftstufenReihenfolge,
  textstufe,
  typografieVariablen,
} from '@/theme';

afterEach(cleanup);

const profilOeffnen = () => fireEvent.click(screen.getByRole('button', { name: /Profil/ }));
const wurzel = (c: HTMLElement) => c.querySelector('[data-app-wurzel]') as HTMLElement;

describe('Typografie-Tokens (REQ-065)', () => {
  it('Stufen geordnet, Label in Großbuchstaben und gesperrt, Variablen zentral', () => {
    const px = schriftstufenReihenfolge.map((s) => schriftstufen[s].px);
    expect([...px].sort((a, b) => a - b)).toEqual(px);
    expect(textstufe('label')).toMatchObject({ fontSize: 'var(--bz-schriftgroesse-label)', textTransform: 'uppercase' });
    expect(textstufe('titel')).toEqual({ fontSize: 'var(--bz-schriftgroesse-titel)' });
    const v = typografieVariablen();
    expect(v['--bz-schriftgroesse-text']).toBe('15px');
    expect(v['--bz-pillenhoehe']).toBe('36px');
    expect(v['--bz-tippflaeche']).toBe('44px');
    expect(v['--bz-rand']).toBe('20px');
  });

  it('kein Element der Startansichten legt eine eigene Schriftgröße fest', () => {
    const { container } = render(<App einstellungRepository={new InMemoryEinstellungRepository()} />);
    fireEvent.click(screen.getByRole('button', { name: /Bücher/ }));
    for (const el of container.querySelectorAll<HTMLElement>('[style]')) {
      const fs = el.style.fontSize;
      if (fs && fs !== 'inherit') expect(fs).toMatch(/^var\(--bz-schriftgroesse-(label|meta|text|titel|abschnitt|seite)\)$/);
    }
  });
});

describe('Farbdesigns (REQ-068)', () => {
  it('drei Designs in fester Reihenfolge, jedes vollständig', () => {
    expect(farbdesignReihenfolge.map((id) => farbdesigns[id].name)).toEqual(['Klassisch', 'Salbei', 'Nachtlektüre']);
    for (const id of farbdesignReihenfolge) {
      expect(Object.keys(farbdesigns[id].werte).sort()).toEqual(Object.keys(farbrubriken).sort());
      for (const w of Object.values(farbdesigns[id].werte)) expect(w).toMatch(/^#[0-9A-F]{6}$/i);
    }
    expect(farbVariablen('salbei')['--bz-farbe-primaer']).toBe('#4E7D63');
    expect(farbVariablen()['--bz-farbe-primaer']).toBe(farbrubriken.primaer.wert);
  });
});

describe('Profil › App › Design (REQ-066 bis REQ-069)', () => {
  it('Zeile zeigt die Wahl, Fenster wechselt Design und Schrift sofort und speichert', async () => {
    const repo = new InMemoryEinstellungRepository();
    const { container } = render(<App einstellungRepository={repo} />);
    profilOeffnen();
    expect(screen.queryByText('under construction :)')).toBeNull();
    expect(container.querySelector('[data-design-anzeige]')?.textContent).toBe('Klassisch · Fraunces · Klassisch ›');

    fireEvent.click(container.querySelector('[data-profil-zeile="design"]') as HTMLElement);
    expect(screen.getByRole('dialog', { name: 'Design' })).toBeTruthy();
    expect(container.querySelector('[data-design-reiter="farben"]')?.getAttribute('aria-selected')).toBe('true');
    expect(container.querySelectorAll('[data-farbdesign] [data-farbkreis]')).toHaveLength(15);

    fireEvent.click(container.querySelector('button[data-farbdesign="nachtlektuere"]') as HTMLElement);
    expect(wurzel(container).style.getPropertyValue('--bz-farbe-hintergrund')).toBe('#2B2420');
    expect(document.documentElement.style.getPropertyValue('--bz-farbe-hintergrund')).toBe('#2B2420');
    expect(container.querySelector('button[data-farbdesign="nachtlektuere"] [data-haken]')).not.toBeNull();

    fireEvent.click(container.querySelector('[data-design-reiter="schriftart"]') as HTMLElement);
    const zeile = container.querySelector('button[data-schrift-zeile="system"]') as HTMLElement;
    expect((zeile.querySelector('[data-schrift-beispiel]') as HTMLElement).style.fontFamily).toContain('system-ui');
    fireEvent.click(zeile);
    expect(wurzel(container).style.getPropertyValue('--bz-schrift')).toContain('system-ui');
    expect(wurzel(container).style.getPropertyValue('--bz-farbe-hintergrund')).toBe('#2B2420');

    fireEvent.click(container.querySelector('[data-design-schliessen]') as HTMLElement);
    expect(screen.queryByRole('dialog', { name: 'Design' })).toBeNull();
    expect(container.querySelector('[data-design-anzeige]')?.textContent).toBe('Nachtlektüre · Systemschrift · Klassisch ›');
    await waitFor(async () => {
      expect(await repo.lesen('farbdesign')).toBe('nachtlektuere');
      expect(await repo.lesen('schrift')).toBe('system');
    });
  });

  it('lädt die gespeicherte Wahl beim Start; ungültige Werte gelten als nicht gewählt', async () => {
    const repo = new InMemoryEinstellungRepository();
    await repo.speichern('farbdesign', 'salbei');
    await repo.speichern('schrift', 'comic');
    const { container } = render(<App einstellungRepository={repo} />);
    await act(async () => {});
    expect(wurzel(container).style.getPropertyValue('--bz-farbe-primaer')).toBe('#4E7D63');
    profilOeffnen();
    expect(container.querySelector('[data-design-anzeige]')?.textContent).toBe('Salbei · Fraunces · Klassisch ›');
  });
});

describe('Kleinkorrekturen', () => {
  it('REQ-062 AK-9: Preis und Format aus den Quellangaben', () => {
    expect(preisCentAus('kart. : EUR 12.00 (DE), EUR 12.40 (AT)')).toBe(1200);
    expect(preisCentAus('Gb. : 22,90 EUR')).toBe(2290);
    expect(preisCentAus('(AT) EUR 5')).toBe(500);
    expect(preisCentAus('Pp.')).toBeUndefined();
    expect(formatAus('kart. : EUR 12.00 (DE)')).toEqual({ format: 'print', unterformat: 'taschenbuch' });
    expect(formatAus('Gb.')).toEqual({ format: 'print', unterformat: 'hardcover' });
    expect(formatAus('Mass Market Paperback')).toEqual({ format: 'print', unterformat: 'kleinformat' });
    expect(formatAus('Audio CD')).toEqual({ format: 'hoerbuch' });
    expect(formatAus('Online-Ressource')).toEqual({ format: 'ebook' });
    expect(formatAus(undefined)).toEqual({});
  });

  it('REQ-063 AK-3: X nur an letzter Stelle einer ISBN-10', () => {
    expect(isbnFiltern('978-3a')).toBe('9783');
    expect(isbnFiltern('080442957X')).toBe('080442957X');
    expect(isbnGueltig('080442957X')).toBe(true);
    expect(isbnFiltern('08X0442957')).toBe('080442957');
  });
});

describe('REQ-059 AK-4 / REQ-063 AK-6: Zurück-Taste schließt Blätter ohne Speichern', async () => {
  const { default: BlattPreis } = await import('@/buchdetails/BlattPreis');
  const { BlattVerlag } = await import('@/buchdetails/BlattFeld');
  const { vi } = await import('vitest');

  it('Preis', () => {
    const schliessen = vi.fn();
    const sichern = vi.fn();
    render(<BlattPreis preisCent={1299} onSichern={sichern} onSchliessen={schliessen} />);
    act(() => void window.dispatchEvent(new PopStateEvent('popstate')));
    expect(schliessen).toHaveBeenCalledTimes(1);
    expect(sichern).not.toHaveBeenCalled();
  });

  it('Verlag', () => {
    const schliessen = vi.fn();
    const sichern = vi.fn();
    render(<BlattVerlag verlag="Carlsen" onSichern={sichern} onSchliessen={schliessen} />);
    act(() => void window.dispatchEvent(new PopStateEvent('popstate')));
    expect(schliessen).toHaveBeenCalledTimes(1);
    expect(sichern).not.toHaveBeenCalled();
  });
});

describe('Nachbesserungen', async () => {
  const { BlattIsbn } = await import('@/buchdetails/BlattFeld');
  const { vi } = await import('vitest');

  it('ISBN-Feld nutzt eine Tastatur mit „X“', () => {
    render(<BlattIsbn onSichern={vi.fn()} onSchliessen={vi.fn()} />);
    const feld = screen.getByRole('textbox', { name: 'ISBN' });
    expect(feld.getAttribute('inputmode')).toBe('text');
    expect(feld.getAttribute('autocapitalize')).toBe('characters');
    fireEvent.change(feld, { target: { value: '080442957x' } });
    expect((feld as HTMLInputElement).value).toBe('080442957X');
  });
});
