import { describe, expect, it } from 'vitest';
import { createBook } from '@/domain/book';

describe('createBook', () => {
  it('vergibt eine UUID und Standardstatus', () => {
    const b = createBook({ title: ' Momo ', author: 'Michael Ende' });
    expect(b.id).toMatch(/^[0-9a-f-]{36}$/);
    expect(b.title).toBe('Momo');
    expect(b.status).toBe('want_to_read');
  });

  it('lehnt leeren Titel ab', () => {
    expect(() => createBook({ title: '  ', author: 'x' })).toThrow();
  });
});
