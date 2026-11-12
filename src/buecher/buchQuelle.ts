// Bücher und Bilder für die Ansichten – ausschließlich über die Repository-Schnittstellen (ADR-0002, REQ-008, REQ-019, REQ-034).
// Die Bücher liegen dauerhaft im Repository. Demodaten werden nur eingespielt, wenn der Speicher leer ist,
// und gar nicht, wenn der Build-Schalter VITE_DEMODATEN=aus gesetzt ist (Sprint 04, Teil A).
import type { Buch } from '@/domain/buch';
import {
  createAnsichtRepository,
  createBookRepository,
  createImageStore,
  type AnsichtRepository,
  type BookRepository,
  type ImageStore,
} from '@/storage';
import { demoBuecher } from './demodaten';

let repository: BookRepository | undefined;
let befuellt: Promise<void> | undefined;
let bildspeicher: ImageStore | undefined;
let ansichtSpeicher: AnsichtRepository | undefined;

/** Ob Demodaten eingespielt werden (Build-Schalter `VITE_DEMODATEN=aus` schaltet sie ab). */
export function demodatenAktiv(wert: string | undefined = import.meta.env.VITE_DEMODATEN): boolean {
  return wert?.trim().toLowerCase() !== 'aus';
}

/** Spielt die Demodaten ein, sofern aktiv und der Speicher leer ist. */
export async function demodatenEinspielen(repo: BookRepository, aktiv: boolean = demodatenAktiv()): Promise<void> {
  if (!aktiv || demoBuecher.length === 0) return;
  if ((await repo.list()).length > 0) return;
  for (const buch of demoBuecher) await repo.save(buch);
}

/** Buch-Repository der App (eine Instanz für alle Ansichten), ggf. mit Demodaten befüllt. */
export async function standardRepository(): Promise<BookRepository> {
  if (!repository || !befuellt) {
    const repo = createBookRepository();
    repository = repo;
    befuellt = demodatenEinspielen(repo).catch((fehler: unknown) => {
      console.warn('Demodaten konnten nicht eingespielt werden:', fehler);
    });
  }
  const repo = repository;
  await befuellt;
  return repo;
}

export async function ladeBuecher(): Promise<Buch[]> {
  return (await standardRepository()).list();
}

/** Ein Buch anhand seiner ID (UUID). */
export async function ladeBuch(id: string): Promise<Buch | undefined> {
  return (await standardRepository()).get(id);
}

/** Bildspeicher der App (eine Instanz für alle Ansichten). */
export function standardBildspeicher(): ImageStore {
  bildspeicher ??= createImageStore();
  return bildspeicher;
}

/** Speicher der gemerkten Ansicht je Liste (REQ-037), eine Instanz für alle Ansichten. */
export function standardAnsichtRepository(): AnsichtRepository {
  ansichtSpeicher ??= createAnsichtRepository();
  return ansichtSpeicher;
}
