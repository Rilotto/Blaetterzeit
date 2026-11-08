import { useEffect, useState } from 'react';
import type { Book } from './domain/book';
import { createBookRepository } from './storage';

const repo = createBookRepository();

export default function App() {
  const [books, setBooks] = useState<Book[]>([]);

  useEffect(() => {
    repo.list().then(setBooks);
  }, []);

  return (
    <main>
      <h1>Blätterzeit</h1>
      {books.length === 0 ? (
        <p>Noch keine Bücher erfasst.</p>
      ) : (
        <ul>
          {books.map((b) => (
            <li key={b.id}>
              {b.title} – {b.author}
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
