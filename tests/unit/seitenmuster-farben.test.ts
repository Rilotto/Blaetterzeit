import { describe, expect, it } from 'vitest';
import { farbdesigns, seitenmusterFarbe, seitenmusterFarben } from '@/theme';

describe('Seitenmuster-Farben (feste, designunabhängige Farbrolle)', () => {
  it('liefert direkte Farbwerte (keine Design-Variable)', () => {
    expect(seitenmusterFarbe('flaeche')).toBe(seitenmusterFarben.flaeche.wert);
    expect(seitenmusterFarbe('linie')).toBe(seitenmusterFarben.linie.wert);
    expect(seitenmusterFarbe('flaeche')).toMatch(/^#[0-9A-F]{6}$/i);
    expect(seitenmusterFarbe('flaeche')).not.toContain('var(');
  });

  it('ist nicht Teil der Farbdesigns', () => {
    for (const d of Object.values(farbdesigns)) {
      expect(Object.values(d.werte)).not.toContain(seitenmusterFarben.flaeche.wert);
    }
  });

  it('Standardwert auf Zuruf wirkt sofort', () => {
    const alt = seitenmusterFarben.flaeche.wert;
    seitenmusterFarben.flaeche.wert = '#FFFFFF';
    expect(seitenmusterFarbe('flaeche')).toBe('#FFFFFF');
    seitenmusterFarben.flaeche.wert = alt;
  });
});
