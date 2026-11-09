import { InMemoryImageStore } from './InMemoryImageStore';
import type { Bildbereich, ImageStore } from './ImageStore';

/**
 * Wartet auf einen dauerhaften Speicher. Lässt er sich nicht einrichten (z. B. IndexedDB im
 * Artefakt gesperrt, SQLite nicht verfügbar), arbeitet er mit einem Speicher im Arbeitsspeicher
 * weiter, damit die App bedienbar bleibt.
 */
export class RueckfallImageStore implements ImageStore {
  private ziel: Promise<ImageStore>;

  constructor(einrichten: () => Promise<ImageStore>, beiFehler?: (fehler: unknown) => void) {
    this.ziel = (async () => {
      try {
        return await einrichten();
      } catch (fehler) {
        beiFehler?.(fehler);
        return new InMemoryImageStore();
      }
    })();
  }

  async get(buchId: string, bereich: Bildbereich) {
    return (await this.ziel).get(buchId, bereich);
  }

  async put(buchId: string, bereich: Bildbereich, dataUrl: string) {
    return (await this.ziel).put(buchId, bereich, dataUrl);
  }

  async remove(buchId: string, bereich: Bildbereich) {
    return (await this.ziel).remove(buchId, bereich);
  }
}
