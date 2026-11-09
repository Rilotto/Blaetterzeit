// Bücher für die Ansichten – ausschließlich über die Repository-Schnittstelle (ADR-0002, REQ-008).
// Solange es keine Persistenz gibt, wird das Repository beim ersten Zugriff mit den Demodaten befüllt.
import type { Buch } from '@/domain/buch';
import { createBookRepository, type BookRepository } from '@/storage';
import { demoBuecher } from './demodaten';

let repository: BookRepository | undefined;
let befuellt: Promise<void> | undefined;

export function ladeBuecher(): Promise<Buch[]> {
  if (!repository || !befuellt) {
    const repo = createBookRepository();
    repository = repo;
    befuellt = (async () => {
      for (const buch of demoBuecher) await repo.save(buch);
    })();
  }
  const repo = repository;
  return befuellt.then(() => repo.list());
}
