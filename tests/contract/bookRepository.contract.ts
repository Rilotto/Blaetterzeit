import { beforeEach, describe, expect, it } from 'vitest';
import { neuesBuch } from '@/domain/buch';
import type { BookRepository } from '@/storage/BookRepository';

export interface BookRepositoryUmgebung {
  repo: BookRepository;
  /** Simuliert einen Neustart: neue Instanz auf demselben dauerhaften Speicher (falls vorhanden). */
  neustart?: () => Promise<BookRepository>;
}

type Fabrik = () => Promise<BookRepository | BookRepositoryUmgebung> | BookRepository | BookRepositoryUmgebung;

const istUmgebung = (x: BookRepository | BookRepositoryUmgebung): x is BookRepositoryUmgebung => 'repo' in x;

/**
 * Vertragstest für JEDE BookRepository-Implementierung.
 * Wird später für SQLite und HTTP wiederverwendet – so ist sichergestellt,
 * dass ein Wechsel des Speichers (lokal -> Web) kein Verhalten verändert.
 */
export function runBookRepositoryContract(name: string, factory: Fabrik) {
  describe(`BookRepository-Vertrag: ${name}`, () => {
    let repo: BookRepository;
    let neustart: (() => Promise<BookRepository>) | undefined;
    beforeEach(async () => {
      const ergebnis = await factory();
      repo = istUmgebung(ergebnis) ? ergebnis.repo : ergebnis;
      neustart = istUmgebung(ergebnis) ? ergebnis.neustart : undefined;
    });

    it('ist anfangs leer', async () => {
      expect(await repo.list()).toEqual([]);
    });

    it('speichert und liest ein Buch ohne Cover', async () => {
      const buch = neuesBuch({ titel: 'Momo', status: 'ungelesen' });
      await repo.save(buch);
      const geladen = await repo.get(buch.id);
      expect(geladen).toEqual(buch);
      expect(geladen?.cover).toBeUndefined();
      expect(await repo.list()).toHaveLength(1);
    });

    it('speichert und liest ein Buch mit Cover', async () => {
      const buch = neuesBuch({ titel: 'Momo', status: 'gelesen', cover: 'data:image/png;base64,AAAA' });
      await repo.save(buch);
      expect((await repo.get(buch.id))?.cover).toBe('data:image/png;base64,AAAA');
    });

    it('überschreibt bei gleicher id (Upsert)', async () => {
      const buch = neuesBuch({ titel: 'Momo', status: 'ungelesen' });
      await repo.save(buch);
      await repo.save({ ...buch, status: 'gelesen' });
      expect((await repo.get(buch.id))?.status).toBe('gelesen');
      expect(await repo.list()).toHaveLength(1);
    });

    it('hält Bücher mit gleichem Titel getrennt', async () => {
      const a = neuesBuch({ titel: 'Momo', status: 'ungelesen' });
      const b = neuesBuch({ titel: 'Momo', status: 'ungelesen' });
      await repo.save(a);
      await repo.save(b);
      expect(a.id).not.toBe(b.id);
      expect(await repo.list()).toHaveLength(2);
    });

    it('löscht ein Buch', async () => {
      const buch = neuesBuch({ titel: 'Momo', status: 'ungelesen' });
      await repo.save(buch);
      await repo.remove(buch.id);
      expect(await repo.get(buch.id)).toBeUndefined();
    });

    it('gibt Kopien zurück (keine geteilten Referenzen)', async () => {
      const buch = neuesBuch({ titel: 'Momo', status: 'ungelesen' });
      await repo.save(buch);
      const geladen = (await repo.get(buch.id))!;
      geladen.titel = 'verändert';
      expect((await repo.get(buch.id))?.titel).toBe('Momo');
    });

    it('speichert alle Angaben (Autor, Erscheinungsjahr, Erscheinungsdatum, Seitenanzahl) unverändert', async () => {
      const voll = neuesBuch({
        titel: 'Testbuch',
        status: 'ungelesen',
        autor: 'Vorname Nachname',
        erscheinungsjahr: 2019,
        erscheinungsdatum: '03.09.2019',
        seitenanzahl: 350,
      });
      const knapp = neuesBuch({ titel: 'Nur Titel', status: 'wunschliste' });
      await repo.save(voll);
      await repo.save(knapp);
      expect(await repo.get(voll.id)).toEqual(voll);
      const k = await repo.get(knapp.id);
      expect(k).toEqual(knapp);
      expect(Object.keys(k!).sort()).toEqual(['id', 'status', 'titel']);
    });

    it('speichert Lesefortschritt, Fortschrittsmodus und Sitzungen (REQ-024), auch nach einem Neustart', async () => {
      const buch = {
        ...neuesBuch({ titel: 'Fortschritt', status: 'am_lesen', seitenanzahl: 400 }),
        aktuelleSeite: 42,
        fortschrittsmodus: 'seite' as const,
        sitzungen: [{ zeitpunkt: '2026-11-11T21:59:00.000Z' }, { zeitpunkt: '2026-11-12T06:01:00.000Z' }],
      };
      const prozent = { ...neuesBuch({ titel: 'Kindle', status: 'ungelesen', seitenanzahl: 300 }), fortschrittProzent: 5, fortschrittsmodus: 'prozent' as const };
      await repo.save(buch);
      await repo.save(prozent);
      expect(await repo.get(buch.id)).toEqual(buch);
      expect(await repo.get(prozent.id)).toEqual(prozent);
      await repo.save({ ...buch, aktuelleSeite: 50, sitzungen: [...buch.sitzungen, { zeitpunkt: '2026-11-12T07:00:00.000Z' }] });
      const nachher = neustart ? await neustart() : repo;
      expect((await nachher.get(buch.id))?.aktuelleSeite).toBe(50);
      expect((await nachher.get(buch.id))?.sitzungen).toHaveLength(3);
      expect(await nachher.get(prozent.id)).toEqual(prozent);
    });

    it('liefert die Bücher in der Reihenfolge des Anlegens, auch nach dem Überschreiben', async () => {
      const a = neuesBuch({ titel: 'A', status: 'ungelesen' });
      const b = neuesBuch({ titel: 'B', status: 'ungelesen' });
      const c = neuesBuch({ titel: 'C', status: 'ungelesen' });
      for (const x of [a, b, c]) await repo.save(x);
      await repo.save({ ...a, titel: 'A2' });
      expect((await repo.list()).map((x) => x.titel)).toEqual(['A2', 'B', 'C']);
    });

    it('entfernt beim Überschreiben weggefallene optionale Angaben', async () => {
      const buch = neuesBuch({ titel: 'X', status: 'ungelesen', autor: 'Y', seitenanzahl: 10 });
      await repo.save(buch);
      await repo.save({ id: buch.id, titel: 'X', status: 'gelesen' });
      expect(await repo.get(buch.id)).toEqual({ id: buch.id, titel: 'X', status: 'gelesen' });
    });

    it('nach einem Neustart: Bücher mit allen Angaben, Änderungen und Löschungen bleiben erhalten (falls dauerhaft)', async () => {
      if (!neustart) return;
      const a = neuesBuch({ titel: 'A', status: 'ungelesen', autor: 'Autorin', erscheinungsjahr: 2024, seitenanzahl: 496 });
      const b = neuesBuch({ titel: 'B', status: 'ungelesen', erscheinungsdatum: '01.02.2003' });
      const c = neuesBuch({ titel: 'C', status: 'ungelesen' });
      for (const x of [a, b, c]) await repo.save(x);
      await repo.save({ ...b, status: 'gelesen' });
      await repo.remove(c.id);
      const neu = await neustart();
      expect(await neu.list()).toEqual([a, { ...b, status: 'gelesen' }]);
      expect(await neu.get(c.id)).toBeUndefined();
    });
  });
}
