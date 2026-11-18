import { InMemoryEinstellungRepository } from '@/storage/InMemoryEinstellungRepository';
import type { Schluesselspeicher } from '@/storage/WebAnsichtRepository';
import { RueckfallEinstellungRepository, WebEinstellungRepository } from '@/storage/WebEinstellungRepository';
import { runEinstellungRepositoryContract } from './einstellungRepository.contract';

const speicher = (): Schluesselspeicher => {
  const daten = new Map<string, string>();
  return { getItem: (k) => daten.get(k) ?? null, setItem: (k, v) => void daten.set(k, v) };
};

runEinstellungRepositoryContract('Arbeitsspeicher', () => ({ repo: new InMemoryEinstellungRepository() }));

runEinstellungRepositoryContract('Web (Schlüssel-Wert-Speicher)', () => {
  const s = speicher();
  return { repo: new WebEinstellungRepository(s), neustart: () => new WebEinstellungRepository(s) };
});

runEinstellungRepositoryContract('Rückfall mit dauerhaftem Speicher', () => {
  const s = speicher();
  const neu = () => new RueckfallEinstellungRepository(new WebEinstellungRepository(s), new InMemoryEinstellungRepository());
  return { repo: neu(), neustart: neu };
});

runEinstellungRepositoryContract('Rückfall (Speicher gesperrt)', () => {
  const gesperrt: Schluesselspeicher = {
    getItem: () => {
      throw new Error('gesperrt');
    },
    setItem: () => {
      throw new Error('gesperrt');
    },
  };
  return { repo: new RueckfallEinstellungRepository(new WebEinstellungRepository(gesperrt), new InMemoryEinstellungRepository()) };
});
