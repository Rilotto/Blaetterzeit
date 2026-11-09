import type { Dateiablage } from '@/storage/GeraeteImageStore';

/** Dateiablage im Arbeitsspeicher (ersetzt @capacitor/filesystem im Test). */
export function speicherDateiablage(): Dateiablage & { dateien: Map<string, string> } {
  const dateien = new Map<string, string>();
  return {
    dateien,
    async schreiben(pfad, daten) {
      dateien.set(pfad, daten);
    },
    async lesen(pfad) {
      const d = dateien.get(pfad);
      if (d === undefined) throw new Error(`Datei fehlt: ${pfad}`);
      return d;
    },
    async loeschen(pfad) {
      dateien.delete(pfad);
    },
  };
}
