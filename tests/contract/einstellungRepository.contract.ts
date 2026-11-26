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

    it('merkt die Zeitraum-Pille der Statistik getrennt (REQ-079)', async () => {
      const { repo } = umgebung;
      expect(await repo.lesen('statistikZeitraum')).toBeUndefined();
      await repo.speichern('statistikZeitraum', 'jahr');
      await repo.speichern('farbdesign', 'salbei');
      expect(await repo.lesen('statistikZeitraum')).toBe('jahr');
      if (umgebung.neustart) expect(await umgebung.neustart().lesen('statistikZeitraum')).toBe('jahr');
    });

    it('merkt die in „Für dich“ ausgeblendeten Abschnitte getrennt (REQ-114)', async () => {
      const { repo } = umgebung;
      expect(await repo.lesen('fuerDichAusgeblendet')).toBeUndefined();
      await repo.speichern('fuerDichAusgeblendet', '["sagas"]');
      await repo.speichern('stil', 'klassisch');
      expect(await repo.lesen('fuerDichAusgeblendet')).toBe('["sagas"]');
      if (umgebung.neustart) expect(await umgebung.neustart().lesen('fuerDichAusgeblendet')).toBe('["sagas"]');
    });

    it('merkt die Sprachauswahl der Online-Suchen getrennt (REQ-119)', async () => {
      const { repo } = umgebung;
      expect(await repo.lesen('onlineSucheSprachen')).toBeUndefined();
      await repo.speichern('onlineSucheSprachen', '["eng"]');
      await repo.speichern('fuerDichAusgeblendet', '[]');
      expect(await repo.lesen('onlineSucheSprachen')).toBe('["eng"]');
      if (umgebung.neustart) expect(await umgebung.neustart().lesen('onlineSucheSprachen')).toBe('["eng"]');
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
