import type { Book } from '../domain/book';
import type { BookRepository } from './BookRepository';

export class InMemoryBookRepository implements BookRepository {
  private books = new Map<string, Book>();

  async list(): Promise<Book[]> {
    return [...this.books.values()].map((b) => ({ ...b }));
  }

  async get(id: string): Promise<Book | undefined> {
    const b = this.books.get(id);
    return b ? { ...b } : undefined;
  }

  async save(book: Book): Promise<void> {
    this.books.set(book.id, { ...book });
  }

  async remove(id: string): Promise<void> {
    this.books.delete(id);
  }
}
