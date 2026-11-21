import { beforeEach, describe, expect, it } from 'vitest';
import type { AnsichtRepository } from '@/storage/AnsichtRepository';

export interface AnsichtUmgebung {
  repo: AnsichtRepository;
  /** Simuliert einen Neustart: neue Instanz auf demselben dauerhaften Speicher (falls vorhanden). */
  neustart?: () => AnsichtRepository;
}

/** Vertragstest für JEDE AnsichtRepository-Implementierung (REQ-037). */
export function runAnsichtRepositoryContract(name: string, factory: () => AnsichtUmgebung) {
  describe(`AnsichtRepository-Vertrag: ${name}`, () => {
    let umgebung: AnsichtUmgebung;
    beforeEach(() => {
      umgebung = factory();
    });

    it('liefert ohne Wahl undefined', async () => {
      expect(await umgebung.repo.lesen('alle')).toBeUndefined();
    });

    it('merkt die Ansicht je Liste getrennt und überschreibt', async () => {
      const { repo } = umgebung;
      await repo.speichern('alle', 'liste');
      await repo.speichern('noch_zu_lesen', 'raster');
      expect(await repo.lesen('alle')).toBe('liste');
      expect(await repo.lesen('noch_zu_lesen')).toBe('raster');
      await repo.speichern('alle', 'raster');
      expect(await repo.lesen('alle')).toBe('raster');
      expect(await repo.lesen('gerade_am_lesen')).toBeUndefined();
    });

    it('nach einem Neustart bleibt die Ansicht je Liste erhalten (falls dauerhaft)', async () => {
      if (!umgebung.neustart) return;
      await umgebung.repo.speichern('alle', 'liste');
      await umgebung.repo.speichern('noch_zu_lesen', 'raster');
      const neu = umgebung.neustart();
      expect(await neu.lesen('alle')).toBe('liste');
      expect(await neu.lesen('noch_zu_lesen')).toBe('raster');
    });
  });
}
