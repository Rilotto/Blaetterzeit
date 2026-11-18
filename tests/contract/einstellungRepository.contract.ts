import { beforeEach, describe, expect, it } from 'vitest';
import type { EinstellungRepository } from '@/storage/EinstellungRepository';

export interface EinstellungUmgebung {
  repo: EinstellungRepository;
  /** Simuliert einen Neustart: neue Instanz auf demselben dauerhaften Speicher (falls vorhanden). */
  neustart?: () => EinstellungRepository;
}

/** Vertragstest für JEDE EinstellungRepository-Implementierung (REQ-068, REQ-069). */
export function runEinstellungRepositoryContract(name: string, factory: () => EinstellungUmgebung) {
  describe(`EinstellungRepository-Vertrag: ${name}`, () => {
    let umgebung: EinstellungUmgebung;
    beforeEach(() => {
      umgebung = factory();
    });

    it('liefert ohne Wahl undefined', async () => {
      expect(await umgebung.repo.lesen('farbdesign')).toBeUndefined();
      expect(await umgebung.repo.lesen('schrift')).toBeUndefined();
    });

    it('speichert je Schlüssel getrennt und überschreibt', async () => {
      const { repo } = umgebung;
      await repo.speichern('farbdesign', 'salbei');
      await repo.speichern('schrift', 'system');
      expect(await repo.lesen('farbdesign')).toBe('salbei');
      expect(await repo.lesen('schrift')).toBe('system');
      await repo.speichern('farbdesign', 'nachtlektuere');
      expect(await repo.lesen('farbdesign')).toBe('nachtlektuere');
      expect(await repo.lesen('schrift')).toBe('system');
    });

    it('nach einem Neustart bleiben die Werte erhalten (falls dauerhaft)', async () => {
      if (!umgebung.neustart) return;
      await umgebung.repo.speichern('farbdesign', 'salbei');
      await umgebung.repo.speichern('schrift', 'system');
      const neu = umgebung.neustart();
      expect(await neu.lesen('farbdesign')).toBe('salbei');
      expect(await neu.lesen('schrift')).toBe('system');
    });
  });
}
