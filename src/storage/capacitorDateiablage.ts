import { Directory, Encoding, Filesystem } from '@capacitor/filesystem';
import type { Dateiablage } from './GeraeteImageStore';

/** Bilddateien im privaten App-Verzeichnis (Directory.Data), keine Berechtigung nötig. */
export const capacitorDateiablage: Dateiablage = {
  async schreiben(pfad, daten, base64) {
    await Filesystem.writeFile({
      path: pfad,
      data: daten,
      directory: Directory.Data,
      recursive: true,
      ...(base64 ? {} : { encoding: Encoding.UTF8 }),
    });
  },
  async lesen(pfad, base64) {
    const { data } = await Filesystem.readFile({
      path: pfad,
      directory: Directory.Data,
      ...(base64 ? {} : { encoding: Encoding.UTF8 }),
    });
    if (typeof data !== 'string') throw new Error('Unerwartetes Dateiformat');
    return data;
  },
  async loeschen(pfad) {
    await Filesystem.deleteFile({ path: pfad, directory: Directory.Data });
  },
};
