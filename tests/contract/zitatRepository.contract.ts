import { beforeEach, describe, expect, it } from 'vitest';
import type { Zitat } from '@/domain/zitat';
import type { ZitatRepository } from '@/storage/ZitatRepository';

export interface ZitatUmgebung {
  repo: ZitatRepository;
  /** Neue Instanz auf demselben dauerhaften Speicher (falls vorhanden). */
  neustart?: () => Promise<ZitatRepository>;
}

type Fabrik = () => Promise<ZitatUmgebung> | ZitatUmgebung;

const zitat = (f: Partial<Zitat> = {}): Zitat => ({
  id: crypto.randomUUID(),
  buchId: 'buch-1',
  text: 'Ich bin nicht das Feuer.',
  angelegtAm: '2026-11-24T10:00:00.000Z',
  ...f,
});

/** Vertragstest für JEDE ZitatRepository-Implementierung (ADR-0002, REQ-105). */
export function runZitatRepositoryContract(name: string, fabrik: Fabrik) {
  describe(`ZitatRepository-Vertrag: ${name}`, () => {
    let u: ZitatUmgebung;
    beforeEach(async () => {
      u = await fabrik();
    });

    it('ist anfangs leer', async () => {
      expect(await u.repo.alle()).toEqual([]);
      expect(await u.repo.vonBuch('buch-1')).toEqual([]);
    });

    it('speichert vollständige und minimale Zitate, auch mehrzeilig', async () => {
      const voll = zitat({ sprecher: 'Violet', seite: 312, text: 'Zeile 1\nZeile 2' });
      const minimal = zitat({ buchId: 'buch-2', text: 'Nur Text' });
      await u.repo.speichern(voll);
      await u.repo.speichern(minimal);
      expect(await u.repo.alle()).toHaveLength(2);
      expect(await u.repo.vonBuch('buch-1')).toEqual([voll]);
      expect(await u.repo.vonBuch('buch-2')).toEqual([minimal]);
    });

    it('überschreibt per Upsert und entfernt geleerte Angaben', async () => {
      const z = zitat({ sprecher: 'Violet', seite: 312 });
      await u.repo.speichern(z);
      const geaendert: Zitat = { id: z.id, buchId: z.buchId, text: z.text, angelegtAm: z.angelegtAm, seite: 313 };
      await u.repo.speichern(geaendert);
      expect(await u.repo.alle()).toEqual([geaendert]);
    });

    it('entfernt ein Zitat, die übrigen bleiben; unbekannte id ist kein Fehler', async () => {
      const a = zitat();
      const b = zitat({ text: 'B' });
      await u.repo.speichern(a);
      await u.repo.speichern(b);
      await u.repo.entfernen(a.id);
      await u.repo.entfernen('gibt-es-nicht');
      expect(await u.repo.alle()).toEqual([b]);
    });

    it('weist leere Zitate und ungültige Seiten ab', async () => {
      await expect(u.repo.speichern(zitat({ text: '   ' }))).rejects.toThrow();
      const mitNull = zitat({ seite: 0 });
      await u.repo.speichern(mitNull);
      expect((await u.repo.alle())[0].seite).toBeUndefined();
    });

    it('bleibt über einen Neustart erhalten', async () => {
      if (!u.neustart) return;
      const z = zitat({ sprecher: 'Xaden', seite: 214 });
      await u.repo.speichern(z);
      expect(await (await u.neustart()).alle()).toEqual([z]);
    });
  });
}
