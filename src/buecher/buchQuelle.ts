// Bücher und Bilder für die Ansichten – ausschließlich über die Repository-Schnittstellen (ADR-0002, REQ-008, REQ-019).
// Solange es keine Persistenz der Bücher gibt, wird das Repository beim ersten Zugriff mit den Demodaten befüllt.
import type { Buch } from '@/domain/buch';
import { createBookRepository, createImageStore, type BookRepository, type ImageStore } from '@/storage';
import { demoBuecher } from './demodaten';

let repository: BookRepository | undefined;
let befuellt: Promise<void> | undefined;
let bildspeicher: ImageStore | undefined;

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

/** Ein Buch anhand seiner ID (UUID). */
export async function ladeBuch(id: string): Promise<Buch | undefined> {
  return (await ladeBuecher()).find((b) => b.id === id);
}

/** Bildspeicher der App (eine Instanz für alle Ansichten). */
export function standardBildspeicher(): ImageStore {
  bildspeicher ??= createImageStore();
  return bildspeicher;
}
