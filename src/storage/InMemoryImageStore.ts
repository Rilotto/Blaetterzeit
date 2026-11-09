import type { Bildbereich, ImageStore } from './ImageStore';

const schluessel = (buchId: string, bereich: Bildbereich) => `${buchId}|${bereich}`;

/** Bilder im Arbeitsspeicher (Tests und Rückfall, wenn kein dauerhafter Speicher verfügbar ist). */
export class InMemoryImageStore implements ImageStore {
  private bilder = new Map<string, string>();

  async get(buchId: string, bereich: Bildbereich): Promise<string | undefined> {
    return this.bilder.get(schluessel(buchId, bereich));
  }

  async put(buchId: string, bereich: Bildbereich, dataUrl: string): Promise<void> {
    this.bilder.set(schluessel(buchId, bereich), dataUrl);
  }

  async remove(buchId: string, bereich: Bildbereich): Promise<void> {
    this.bilder.delete(schluessel(buchId, bereich));
  }
}
