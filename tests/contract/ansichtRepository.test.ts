import { describe, expect, it } from 'vitest';
import { InMemoryAnsichtRepository } from '@/storage/InMemoryAnsichtRepository';
import { RueckfallAnsichtRepository, WebAnsichtRepository, type Schluesselspeicher } from '@/storage/WebAnsichtRepository';
import { runAnsichtRepositoryContract } from './ansichtRepository.contract';

const speicher = (): Schluesselspeicher & { daten: Map<string, string> } => {
  const daten = new Map<string, string>();
  return { daten, getItem: (k) => daten.get(k) ?? null, setItem: (k, v) => void daten.set(k, v) };
};

runAnsichtRepositoryContract('Arbeitsspeicher', () => ({ repo: new InMemoryAnsichtRepository() }));

runAnsichtRepositoryContract('Web (Schlüssel-Wert-Speicher)', () => {
  const s = speicher();
  return { repo: new WebAnsichtRepository(s), neustart: () => new WebAnsichtRepository(s) };
});

runAnsichtRepositoryContract('Rückfall mit dauerhaftem Speicher', () => {
  const s = speicher();
  const neu = () => new RueckfallAnsichtRepository(new WebAnsichtRepository(s), new InMemoryAnsichtRepository());
  return { repo: neu(), neustart: neu };
});

runAnsichtRepositoryContract('Rückfall (Speicher gesperrt)', () => {
  const gesperrt: Schluesselspeicher = {
    getItem: () => {
      throw new Error('gesperrt');
    },
    setItem: () => {
      throw new Error('gesperrt');
    },
  };
  return { repo: new RueckfallAnsichtRepository(new WebAnsichtRepository(gesperrt), new InMemoryAnsichtRepository()) };
});

describe('WebAnsichtRepository: beschädigte Werte', () => {
  it('unbekannter Wert gilt als nicht gewählt', async () => {
    const s = speicher();
    s.daten.set('blaetterzeit.ansicht.alle', 'kacheln');
    expect(await new WebAnsichtRepository(s).lesen('alle')).toBeUndefined();
  });
});
