import { beforeEach, describe, expect, it } from 'vitest';
import { neuesBuch } from '@/domain/buch';
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

    it('speichert und liest ein Buch ohne Cover', async () => {
      const buch = neuesBuch({ titel: 'Momo', status: 'ungelesen' });
      await repo.save(buch);
      const geladen = await repo.get(buch.id);
      expect(geladen).toEqual(buch);
      expect(geladen?.cover).toBeUndefined();
      expect(await repo.list()).toHaveLength(1);
    });

    it('speichert und liest ein Buch mit Cover', async () => {
      const buch = neuesBuch({ titel: 'Momo', status: 'gelesen', cover: 'data:image/png;base64,AAAA' });
      await repo.save(buch);
      expect((await repo.get(buch.id))?.cover).toBe('data:image/png;base64,AAAA');
    });

    it('überschreibt bei gleicher id (Upsert)', async () => {
      const buch = neuesBuch({ titel: 'Momo', status: 'ungelesen' });
      await repo.save(buch);
      await repo.save({ ...buch, status: 'gelesen' });
      expect((await repo.get(buch.id))?.status).toBe('gelesen');
      expect(await repo.list()).toHaveLength(1);
    });

    it('hält Bücher mit gleichem Titel getrennt', async () => {
      const a = neuesBuch({ titel: 'Momo', status: 'ungelesen' });
      const b = neuesBuch({ titel: 'Momo', status: 'ungelesen' });
      await repo.save(a);
      await repo.save(b);
      expect(a.id).not.toBe(b.id);
      expect(await repo.list()).toHaveLength(2);
    });

    it('löscht ein Buch', async () => {
      const buch = neuesBuch({ titel: 'Momo', status: 'ungelesen' });
      await repo.save(buch);
      await repo.remove(buch.id);
      expect(await repo.get(buch.id)).toBeUndefined();
    });

    it('gibt Kopien zurück (keine geteilten Referenzen)', async () => {
      const buch = neuesBuch({ titel: 'Momo', status: 'ungelesen' });
      await repo.save(buch);
      const geladen = (await repo.get(buch.id))!;
      geladen.titel = 'verändert';
      expect((await repo.get(buch.id))?.titel).toBe('Momo');
    });
  });
}
