import { InMemoryBookRepository } from '@/storage/InMemoryBookRepository';
import { runBookRepositoryContract } from './bookRepository.contract';

runBookRepositoryContract('InMemory', () => new InMemoryBookRepository());
