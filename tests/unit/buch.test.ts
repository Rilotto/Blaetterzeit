import { describe, expect, it } from 'vitest';
import { istLesestatusId, LESESTATUS, neuesBuch } from '@/domain/buch';

describe('Buch', () => {
  it('vergibt eine UUID und übernimmt Titel und Status, ohne Cover', () => {
    const b = neuesBuch({ titel: 'Momo', status: 'ungelesen' });
    expect(b.id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/);
    expect(b).toEqual({ id: b.id, titel: 'Momo', status: 'ungelesen' });
    expect('cover' in b).toBe(false);
  });

  it('übernimmt ein Cover', () => {
    expect(neuesBuch({ titel: 'Momo', status: 'gelesen', cover: 'x.png' }).cover).toBe('x.png');
  });

  it('lehnt leeren Titel ab', () => {
    expect(() => neuesBuch({ titel: '  ', status: 'ungelesen' })).toThrow();
  });

  it('vergibt bei gleichem Titel verschiedene IDs', () => {
    expect(neuesBuch({ titel: 'A', status: 'ungelesen' }).id).not.toBe(neuesBuch({ titel: 'A', status: 'ungelesen' }).id);
  });
});

describe('Lesestatus', () => {
  it('führt genau die fünf Status in fester Reihenfolge', () => {
    expect(LESESTATUS.map((s) => s.id)).toEqual(['ungelesen', 'am_lesen', 'gelesen', 'abgebrochen', 'wunschliste']);
    expect(LESESTATUS.map((s) => s.bezeichnung)).toEqual(['ungelesen', 'am lesen', 'gelesen', 'abgebrochen', 'Wunschliste']);
  });

  it('erkennt gültige IDs', () => {
    expect(istLesestatusId('am_lesen')).toBe(true);
    expect(istLesestatusId('am lesen')).toBe(false);
    expect(istLesestatusId(undefined)).toBe(false);
  });
});
