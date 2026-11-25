import '@testing-library/jest-dom/vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import BlattMasse from '@/buchdetails/BlattMasse';
import { darstellungsMasse, masseVorbefuellung, masseVorschlagText, seitenverhaeltnis, standardtyp, wirksameMasse } from '@/buchdetails/masse';
import { AusgabeKarte } from '@/buchdetails/reiter/DetailsBereich';

afterEach(cleanup);

const tb = { format: 'print', unterformat: 'taschenbuch' } as const;
const hc = { format: 'print', unterformat: 'hardcover' } as const;

describe('Standardmaße je Format (REQ-077)', () => {
  it.each([
    [tb, 'taschenbuch'],
    [{ format: 'ebook' }, 'taschenbuch'],
    [{ format: 'hoerbuch' }, 'taschenbuch'],
    [{ format: 'print' }, 'taschenbuch'],
    [{ format: 'print', unterformat: 'weissNicht' }, 'taschenbuch'],
    [{}, 'taschenbuch'],
    [hc, 'hardcover'],
    [{ format: 'print', unterformat: 'kleinformat' }, 'kleinformat'],
    [{ format: 'ebook', unterformat: 'hardcover' }, 'taschenbuch'],
  ] as const)('%o → %s', (q, typ) => expect(standardtyp(q)).toBe(typ));

  it('Breite × Höhe und Dicke aus der Seitenzahl', () => {
    expect(wirksameMasse({ ...tb, seitenanzahl: 400 })).toMatchObject({ breiteMm: 138, hoeheMm: 218, dickeMm: 24 });
    expect(wirksameMasse({ ...hc, seitenanzahl: 400 })).toMatchObject({ breiteMm: 148, hoeheMm: 210, dickeMm: 28 });
    expect(wirksameMasse({ format: 'print', unterformat: 'kleinformat' })).toMatchObject({ breiteMm: 105, hoeheMm: 148, dickeMm: 25 });
    expect(wirksameMasse({ format: 'hoerbuch', seitenanzahl: 400 })).toMatchObject({ breiteMm: 138, hoeheMm: 218, dickeMm: 24 });
    expect(wirksameMasse({}).dickeMm).toBe(25);
    // kaufmännisch: 0,5 mm wird aufgerundet (Seitenzahl 175 → 175 × 0,0572 + 1,5 = 11,51 → 12)
    expect(wirksameMasse({ ...tb, seitenanzahl: 175 }).dickeMm).toBe(12);
  });

  it('hinterlegte Werte haben Vorrang, geschätzt je Einzelwert', () => {
    const w = wirksameMasse({ ...hc, hoeheMm: 240, seitenanzahl: 400 });
    expect(w).toMatchObject({ breiteMm: 148, hoeheMm: 240, dickeMm: 28, geschaetzt: { breite: true, hoehe: false, dicke: true } });
  });

  it('Hardcover: Außenmaße der Deckel, Buchblock 3 mm schmaler und 6 mm niedriger', () => {
    const w = wirksameMasse(hc);
    expect(w.deckelUeberstandMm).toBe(3);
    expect(w.buchblock).toEqual({ breiteMm: 145, hoeheMm: 204 });
    expect(wirksameMasse(tb).buchblock).toEqual({ breiteMm: 138, hoeheMm: 218 });
  });
});

describe('Vorschlag „ca. …“ und Vorbefüllung (REQ-072)', () => {
  it('Text und Vorbefüllung', () => {
    expect(masseVorschlagText({ ...tb, seitenanzahl: 400 })).toBe('ca. 13,8 × 21,8 × 2,4 cm');
    expect(masseVorschlagText({ ...hc, seitenanzahl: 400 })).toBe('ca. 14,8 × 21,0 × 2,8 cm');
    expect(masseVorbefuellung({ ...tb, seitenanzahl: 400 })).toEqual({ breiteMm: 138, hoeheMm: 218, dickeMm: 24 });
    expect(masseVorbefuellung({ ...tb, hoeheMm: 210 })).toEqual({ breiteMm: undefined, hoeheMm: 210, dickeMm: undefined });
  });

  it('Zeile zeigt Vorschlag kursiv; nach Formatwechsel Hardcover-Werte; hinterlegt ohne „ca.“', () => {
    const { rerender } = render(<AusgabeKarte angaben={{ ...tb, seitenanzahl: 400 }} werte={{}} />);
    const wert = () => document.querySelector('[data-ausgabe-zeile="masse"] [data-zeile-wert]') as HTMLElement;
    expect(wert()).toHaveTextContent('ca. 13,8 × 21,8 × 2,4 cm');
    expect(wert()).toHaveAttribute('data-zeile-vorschlag', 'true');
    expect(wert().style.fontStyle).toBe('italic');
    rerender(<AusgabeKarte angaben={{ ...hc, seitenanzahl: 400 }} werte={{}} />);
    expect(wert()).toHaveTextContent('ca. 14,8 × 21,0 × 2,8 cm');
    rerender(<AusgabeKarte angaben={{ ...hc, breiteMm: 120, hoeheMm: 190, dickeMm: 24 }} werte={{}} />);
    expect(wert()).toHaveTextContent('12,0 × 19,0 × 2,4 cm');
    expect(wert().textContent).not.toMatch(/ca\./);
    expect(wert()).not.toHaveAttribute('data-zeile-vorschlag');
    expect(wert().style.fontStyle).toBe('');
  });

  it('Blatt vorbefüllt mit Schätzwerten; Sichern speichert sie, Schließen nicht', () => {
    const onSichern = vi.fn();
    const onSchliessen = vi.fn();
    render(<BlattMasse masse={{ ...tb, seitenanzahl: 400 }} onSichern={onSichern} onSchliessen={onSchliessen} />);
    expect(screen.getByLabelText('Breite')).toHaveValue('13,8');
    expect(screen.getByLabelText('Höhe')).toHaveValue('21,8');
    expect(screen.getByLabelText('Dicke')).toHaveValue('2,4');
    expect(onSichern).not.toHaveBeenCalled();
    fireEvent.click(document.querySelector('[data-masse-sichern]') as HTMLElement);
    expect(onSichern).toHaveBeenCalledWith({ breiteMm: 138, hoeheMm: 218, dickeMm: 24 });
  });
});

describe('Proportionen aus formatabhängigen Standards (REQ-073)', () => {
  it('Taschenbuch, Hardcover, fehlender Einzelwert', () => {
    expect(seitenverhaeltnis('cover', { ...tb, seitenanzahl: 400 })).toBeCloseTo(138 / 218);
    expect(seitenverhaeltnis('ruecken', { ...hc, seitenanzahl: 400 })).toBeCloseTo(28 / 210);
    expect(seitenverhaeltnis('schnitt', { ...tb, dickeMm: 50 })).toBeCloseTo(50 / 218);
    const d = darstellungsMasse({ ...tb, seitenanzahl: 400 });
    expect(d.schmal / d.cover).toBeCloseTo(24 / 138);
  });
});
