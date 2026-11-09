import { beforeEach, describe, expect, it } from 'vitest';
import type { ImageStore } from '@/storage/ImageStore';

export interface ImageStoreUmgebung {
  store: ImageStore;
  /** Simuliert einen Neustart: neue Instanz auf demselben dauerhaften Speicher (falls vorhanden). */
  neustart?: () => Promise<ImageStore>;
}

const BUCH_A = '6a1c2d0e-1b2c-4d3e-8f40-0a1b2c3d4e5f';
const BUCH_B = '7b2d3e1f-2c3d-4e4f-9a51-1b2c3d4e5f60';
const JPEG = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAP8=';
const PNG = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
const PNG2 = 'data:image/png;base64,AAAA';

/**
 * Vertragstest für JEDE ImageStore-Implementierung (ADR-0002, REQ-019).
 */
export function runImageStoreContract(name: string, erzeugen: () => Promise<ImageStoreUmgebung> | ImageStoreUmgebung) {
  describe(`ImageStore-Vertrag: ${name}`, () => {
    let u: ImageStoreUmgebung;
    let store: ImageStore;
    beforeEach(async () => {
      u = await erzeugen();
      store = u.store;
    });

    it('liefert undefined, wenn kein Bild hinterlegt ist', async () => {
      expect(await store.get(BUCH_A, 'cover')).toBeUndefined();
    });

    it('speichert und liest ein Bild unverändert', async () => {
      await store.put(BUCH_A, 'cover', JPEG);
      expect(await store.get(BUCH_A, 'cover')).toBe(JPEG);
    });

    it('trennt Bereiche und Bücher', async () => {
      await store.put(BUCH_A, 'ruecken', JPEG);
      await store.put(BUCH_B, 'schnitt', PNG);
      expect(await store.get(BUCH_A, 'ruecken')).toBe(JPEG);
      expect(await store.get(BUCH_A, 'schnitt')).toBeUndefined();
      expect(await store.get(BUCH_A, 'cover')).toBeUndefined();
      expect(await store.get(BUCH_B, 'schnitt')).toBe(PNG);
      expect(await store.get(BUCH_B, 'ruecken')).toBeUndefined();
    });

    it('ersetzt ein vorhandenes Bild', async () => {
      await store.put(BUCH_A, 'cover', JPEG);
      await store.put(BUCH_A, 'cover', PNG2);
      expect(await store.get(BUCH_A, 'cover')).toBe(PNG2);
    });

    it('entfernt nur das Bild des Bereichs', async () => {
      await store.put(BUCH_A, 'cover', JPEG);
      await store.put(BUCH_A, 'schnitt', PNG);
      await store.remove(BUCH_A, 'cover');
      expect(await store.get(BUCH_A, 'cover')).toBeUndefined();
      expect(await store.get(BUCH_A, 'schnitt')).toBe(PNG);
    });

    it('Entfernen ohne Bild ist kein Fehler', async () => {
      await expect(store.remove(BUCH_A, 'ruecken')).resolves.toBeUndefined();
    });

    it('nach einem Neustart: Bilder, Ersetzungen und Entfernungen bleiben erhalten (falls dauerhaft)', async () => {
      if (!u.neustart) return;
      await store.put(BUCH_A, 'cover', JPEG);
      await store.put(BUCH_A, 'cover', PNG2);
      await store.put(BUCH_B, 'ruecken', PNG);
      await store.put(BUCH_B, 'schnitt', JPEG);
      await store.remove(BUCH_B, 'schnitt');
      const neu = await u.neustart();
      expect(await neu.get(BUCH_A, 'cover')).toBe(PNG2);
      expect(await neu.get(BUCH_B, 'ruecken')).toBe(PNG);
      expect(await neu.get(BUCH_B, 'schnitt')).toBeUndefined();
      expect(await neu.get(BUCH_A, 'ruecken')).toBeUndefined();
    });
  });
}
