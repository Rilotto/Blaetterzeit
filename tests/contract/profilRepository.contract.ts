import { beforeEach, describe, expect, it } from 'vitest';
import type { ProfilRepository } from '@/storage/ProfilRepository';

export interface ProfilUmgebung {
  repo: ProfilRepository;
  /** Neue Instanz auf demselben dauerhaften Speicher (falls vorhanden). */
  neustart?: () => Promise<ProfilRepository>;
}

type Fabrik = () => Promise<ProfilUmgebung> | ProfilUmgebung;

/** Vertragstest für JEDE ProfilRepository-Implementierung (ADR-0002, REQ-104, REQ-107). */
export function runProfilRepositoryContract(name: string, fabrik: Fabrik) {
  describe(`ProfilRepository-Vertrag: ${name}`, () => {
    let u: ProfilUmgebung;
    beforeEach(async () => {
      u = await fabrik();
    });

    it('hat anfangs keinen Namen und kein Jahresziel', async () => {
      expect(await u.repo.nameLesen()).toBeUndefined();
      expect(await u.repo.jahreszielLesen(2026)).toBeUndefined();
    });

    it('speichert, überschreibt und entfernt den Namen', async () => {
      await u.repo.nameSpeichern('Christine');
      expect(await u.repo.nameLesen()).toBe('Christine');
      await u.repo.nameSpeichern('Chris');
      expect(await u.repo.nameLesen()).toBe('Chris');
      await u.repo.nameSpeichern(undefined);
      expect(await u.repo.nameLesen()).toBeUndefined();
    });

    it('Jahresziel gilt nur für sein Jahr, lässt sich ändern und entfernen', async () => {
      await u.repo.jahreszielSpeichern(2026, 20);
      expect(await u.repo.jahreszielLesen(2026)).toBe(20);
      expect(await u.repo.jahreszielLesen(2027)).toBeUndefined();
      await u.repo.jahreszielSpeichern(2026, 25);
      await u.repo.jahreszielSpeichern(2027, 3);
      expect(await u.repo.jahreszielLesen(2026)).toBe(25);
      await u.repo.jahreszielSpeichern(2026, undefined);
      expect(await u.repo.jahreszielLesen(2026)).toBeUndefined();
      expect(await u.repo.jahreszielLesen(2027)).toBe(3);
    });

    it('weist ungültige Jahresziele ab', async () => {
      await expect(u.repo.jahreszielSpeichern(2026, 0)).rejects.toThrow();
      await expect(u.repo.jahreszielSpeichern(2026, 1.5)).rejects.toThrow();
      expect(await u.repo.jahreszielLesen(2026)).toBeUndefined();
    });

    it('bleibt über einen Neustart erhalten', async () => {
      if (!u.neustart) return;
      await u.repo.nameSpeichern('Christine');
      await u.repo.jahreszielSpeichern(2026, 20);
      const neu = await u.neustart();
      expect(await neu.nameLesen()).toBe('Christine');
      expect(await neu.jahreszielLesen(2026)).toBe(20);
    });
  });
}
