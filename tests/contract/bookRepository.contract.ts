import { beforeEach, describe, expect, it } from 'vitest';
import { createBook } from '@/domain/book';
import type { BookRepository } from '@/storage/BookRepository';

/**
 * Vertragstest für JEDE BookRepository-Implementierung.
 * Wird später für SQLite und HTTP wiederverwendet – so ist sichergestellt,
 * dass ein Wechsel des Speichers (lokal -> Web) kein Verhalten verändert.
 */
export function runBookRepositoryContract(name: string, factory: () => Promise<BookRepository> | BookRepository) {
  describe(`BookRepository-Vertrag: ${name}`, () => {
    let repo: BookRepository;
    beforeEach(async () => {
      repo = await factory();
    });

    it('ist anfangs leer', async () => {
      expect(await repo.list()).toEqual([]);
    });

    it('speichert und liest ein Buch', async () => {
      const book = createBook({ title: 'Momo', author: 'Michael Ende' });
      await repo.save(book);
      expect(await repo.get(book.id)).toEqual(book);
      expect(await repo.list()).toHaveLength(1);
    });

    it('überschreibt bei gleicher id (Upsert)', async () => {
      const book = createBook({ title: 'Momo', author: 'Michael Ende' });
      await repo.save(book);
      await repo.save({ ...book, status: 'read' });
      expect((await repo.get(book.id))?.status).toBe('read');
      expect(await repo.list()).toHaveLength(1);
    });

    it('löscht ein Buch', async () => {
      const book = createBook({ title: 'Momo', author: 'Michael Ende' });
      await repo.save(book);
      await repo.remove(book.id);
      expect(await repo.get(book.id)).toBeUndefined();
    });

    it('gibt Kopien zurück (keine geteilten Referenzen)', async () => {
      const book = createBook({ title: 'Momo', author: 'Michael Ende' });
      await repo.save(book);
      const loaded = (await repo.get(book.id))!;
      loaded.title = 'verändert';
      expect((await repo.get(book.id))?.title).toBe('Momo');
    });
  });
}
