import { describe, expect, it } from 'vitest';
import { betragText, bibliothekswertCent } from '@/domain/bibliothekswert';

describe('bibliothekswertCent (REQ-121)', () => {
  it('summiert alle Status außer Wunschliste, Bücher ohne Preis zählen nicht', () => {
    expect(
      bibliothekswertCent([
        { status: 'gelesen', preisCent: 1299 },
        { status: 'ungelesen', preisCent: 2000 },
        { status: 'wunschliste', preisCent: 3000 },
        { status: 'abgebrochen', preisCent: 501 },
        { status: 'am_lesen' },
      ]),
    ).toBe(3800);
  });
  it('leer, nur Wunschliste oder nur ohne Preis → 0; Preis 0 zählt als 0', () => {
    expect(bibliothekswertCent([])).toBe(0);
    expect(bibliothekswertCent([{ status: 'wunschliste', preisCent: 999 }])).toBe(0);
    expect(bibliothekswertCent([{ status: 'gelesen' }, { status: 'gelesen', preisCent: 0 }])).toBe(0);
  });
  it('rechnet ohne Rundungsfehler (10 × 0,10 €)', () => {
    expect(bibliothekswertCent(Array.from({ length: 10 }, () => ({ status: 'gelesen' as const, preisCent: 10 })))).toBe(100);
  });
});

describe('betragText (REQ-121)', () => {
  it.each([
    [0, '0,00 €'],
    [5, '0,05 €'],
    [3800, '38,00 €'],
    [99999, '999,99 €'],
    [100000, '1.000,00 €'],
    [123456, '1.234,56 €'],
    [123456789, '1.234.567,89 €'],
  ])('%i Cent → %s', (cent, text) => {
    expect(betragText(cent)).toBe(text);
  });
});
