import { beforeEach, describe, expect, it } from 'vitest';
import { neueListe } from '@/domain/listen';
import type { Zugehoerigkeit } from '@/domain/listen';
import type { ListenRepository } from '@/storage/ListenRepository';

export interface ListenUmgebung {
  repo: ListenRepository;
  /** Neue Instanz auf demselben dauerhaften Speicher (falls vorhanden). */
  neustart?: () => Promise<ListenRepository>;
}

type Fabrik = () => Promise<ListenUmgebung> | ListenUmgebung;

/** Vertragstest für JEDE ListenRepository-Implementierung (ADR-0002, REQ-095 bis REQ-098). */
export function runListenRepositoryContract(name: string, fabrik: Fabrik) {
  describe(`ListenRepository-Vertrag: ${name}`, () => {
    let u: ListenUmgebung;
    beforeEach(async () => {
      u = await fabrik();
    });

    it('ist anfangs leer', async () => {
      expect(await u.repo.listen()).toEqual([]);
      expect(await u.repo.zugehoerigkeiten()).toEqual([]);
    });

    it('speichert Listen aller Arten und benennt per Upsert um', async () => {
      const saga = neueListe('saga', 'The Empyrean');
      const samm = neueListe('sammlung', 'Lieblingsbücher');
      const bib = neueListe('bibliothek', 'Zuhause');
      for (const l of [saga, samm, bib]) await u.repo.listeSpeichern(l);
      await u.repo.listeSpeichern({ ...samm, name: 'Herzensbücher' });
      const alle = await u.repo.listen();
      expect(alle).toHaveLength(3);
      expect(alle).toContainEqual({ ...samm, name: 'Herzensbücher' });
      expect(alle).toContainEqual(saga);
    });

    it('ordnet zu (Upsert ohne Doppelung) und nimmt heraus; Zugehörigkeiten tragen keinen Band (REQ-112)', async () => {
      const saga = neueListe('saga', 'Crescent City');
      await u.repo.listeSpeichern(saga);
      await u.repo.zuordnen({ listeId: saga.id, buchId: 'b1' });
      await u.repo.zuordnen({ listeId: saga.id, buchId: 'b2' });
      await u.repo.zuordnen({ listeId: saga.id, buchId: 'b1' });
      expect(await u.repo.zugehoerigkeiten()).toHaveLength(2);
      expect(await u.repo.zugehoerigkeiten()).toContainEqual({ listeId: saga.id, buchId: 'b1' });
      expect(await u.repo.zugehoerigkeiten()).toContainEqual({ listeId: saga.id, buchId: 'b2' });
      // Ein altes Feld „band“ (vor REQ-112) wird weder gespeichert noch geliefert.
      await u.repo.zuordnen({ listeId: saga.id, buchId: 'b1', band: 3 } as Zugehoerigkeit);
      expect(await u.repo.zugehoerigkeiten()).toContainEqual({ listeId: saga.id, buchId: 'b1' });
      await u.repo.herausnehmen(saga.id, 'b1');
      expect(await u.repo.zugehoerigkeiten()).toEqual([{ listeId: saga.id, buchId: 'b2' }]);
    });

    it('Löschen entfernt die Liste samt Zugehörigkeiten, andere Listen bleiben', async () => {
      const a = neueListe('sammlung', 'A');
      const b = neueListe('sammlung', 'B');
      await u.repo.listeSpeichern(a);
      await u.repo.listeSpeichern(b);
      await u.repo.zuordnen({ listeId: a.id, buchId: 'b1' });
      await u.repo.zuordnen({ listeId: b.id, buchId: 'b1' });
      await u.repo.listeEntfernen(a.id);
      expect(await u.repo.listen()).toEqual([b]);
      expect(await u.repo.zugehoerigkeiten()).toEqual([{ listeId: b.id, buchId: 'b1' }]);
    });

    it('weist ungültige Listen ab (leerer Name)', async () => {
      await expect(u.repo.listeSpeichern({ id: 'x', art: 'saga', name: '  ' })).rejects.toThrow();
    });

    it('bleibt nach einem Neustart erhalten (falls dauerhaft)', async () => {
      if (!u.neustart) return;
      const l = neueListe('bibliothek', 'Zuhause');
      await u.repo.listeSpeichern(l);
      await u.repo.zuordnen({ listeId: l.id, buchId: 'b9' });
      const neu = await u.neustart();
      expect(await neu.listen()).toEqual([l]);
      expect(await neu.zugehoerigkeiten()).toEqual([{ listeId: l.id, buchId: 'b9' }]);
    });
  });
}
