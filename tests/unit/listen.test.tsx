import '@testing-library/jest-dom/vitest';
import { act, cleanup, fireEvent, render } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import type { Buch } from '@/domain/buch';
import {
  anzahlJeListe,
  bandPruefen,
  buecherDerListeSortiert,
  listenDesBuches,
  listenNamePruefen,
  listenNamenText,
  neueListe,
  sagaZeileText,
  sagenDesBuches,
  type Liste,
} from '@/domain/listen';
import { bandAus } from '@/barcode/treffer';
import { InMemoryAnsichtRepository } from '@/storage/InMemoryAnsichtRepository';
import { InMemoryBookRepository } from '@/storage/InMemoryBookRepository';
import { InMemoryImageStore } from '@/storage/InMemoryImageStore';
import { InMemoryListenRepository } from '@/storage/InMemoryListenRepository';
import BibliothekAnsicht from '@/views/BibliothekAnsicht';
import BuchDetails from '@/views/BuchDetails';
import BuecherAnsicht from '@/views/BuecherAnsicht';

afterEach(cleanup);

const b = (titel: string, extra: Partial<Buch> = {}): Buch => ({ id: crypto.randomUUID(), titel, status: 'ungelesen', ...extra });
const liste = (art: Liste['art'], name: string): Liste => neueListe(art, name);

const tippe = async (el: Element | null) => {
  expect(el).not.toBeNull();
  fireEvent.click(el!);
  await act(async () => {
    await new Promise((r) => setTimeout(r, 5));
  });
};
const q = <T extends Element = HTMLElement>(sel: string) => document.querySelector<T>(sel);
const alle = (sel: string) => [...document.querySelectorAll<HTMLElement>(sel)];
const gib = (el: Element | null, value: string) => fireEvent.change(el!, { target: { value } });

describe('Fachlogik Listen (REQ-095 bis REQ-099)', () => {
  it('Name und Band prüfen', () => {
    expect(listenNamePruefen('  Lieblinge ')).toBe('Lieblinge');
    expect(listenNamePruefen('   ')).toBeNull();
    expect(() => neueListe('saga', '')).toThrow();
    expect(bandPruefen('')).toEqual({ ok: true });
    expect(bandPruefen(' 2 ')).toEqual({ ok: true, band: 2 });
    for (const x of ['0', '-1', '1,5', 'a']) expect(bandPruefen(x).ok).toBe(false);
  });

  it('Sortierung nach Bänden, ohne Band danach A–Z; A–Z nach Titel', () => {
    const s = liste('saga', 'Crescent City');
    const [b2, b1, b3, ohne1, ohne2] = [b('House of Sky and Breath'), b('House of Earth and Blood'), b('House of Flame and Shadow'), b('Zeta'), b('Alpha')];
    const zug = [
      { listeId: s.id, buchId: b2.id, band: 2 },
      { listeId: s.id, buchId: b1.id, band: 1 },
      { listeId: s.id, buchId: b3.id, band: 3 },
      { listeId: s.id, buchId: ohne1.id },
      { listeId: s.id, buchId: ohne2.id },
    ];
    const fremd = b('Nicht drin');
    const titel = (x: Buch[]) => x.map((y) => y.titel);
    expect(titel(buecherDerListeSortiert([b2, fremd, b1, b3, ohne1, ohne2], zug, s.id, 'baende'))).toEqual([
      'House of Earth and Blood',
      'House of Sky and Breath',
      'House of Flame and Shadow',
      'Alpha',
      'Zeta',
    ]);
    expect(titel(buecherDerListeSortiert([b2, b1, b3], zug, s.id, 'az'))).toEqual([
      'House of Earth and Blood',
      'House of Flame and Shadow',
      'House of Sky and Breath',
    ]);
  });

  it('Listen eines Buches, Namen, Anzahl und Saga-Zeilen A–Z', () => {
    const e = liste('saga', 'The Empyrean');
    const c = liste('saga', 'Crescent City');
    const l = liste('sammlung', 'Lieblingsbücher');
    const buch = b('Fourth Wing');
    const zug = [
      { listeId: e.id, buchId: buch.id, band: 1 },
      { listeId: c.id, buchId: buch.id },
      { listeId: l.id, buchId: 'anderes' },
    ];
    expect(listenNamenText(listenDesBuches([e, c, l], zug, buch.id, 'saga'))).toBe('Crescent City, The Empyrean');
    expect(listenDesBuches([e, c, l], zug, buch.id, 'sammlung')).toEqual([]);
    expect(sagenDesBuches([e, c, l], zug, buch.id).map((x) => sagaZeileText(x.liste.name, x.band))).toEqual(['Crescent City', 'Band 1 · The Empyrean']);
    expect(anzahlJeListe(zug).get(e.id)).toBe(1);
    expect(anzahlJeListe(zug, new Set([buch.id])).get(l.id)).toBeUndefined();
  });

  it('Bandnummer aus der Reihenangabe des Barcode-Treffers', () => {
    expect(bandAus('2')).toBe(2);
    expect(bandAus('Bd. 3')).toBe(3);
    expect(bandAus('The Empyrean ; 2')).toBe(2);
    expect(bandAus('#4')).toBe(4);
    expect(bandAus('0')).toBeUndefined();
    expect(bandAus('ohne')).toBeUndefined();
    expect(bandAus(undefined)).toBeUndefined();
  });
});

async function details(buch: Buch, listen = new InMemoryListenRepository(), repo = new InMemoryBookRepository()) {
  await repo.save(buch);
  render(
    <BuchDetails buchId={buch.id} repository={repo} listenRepository={listen} bildspeicher={new InMemoryImageStore()} onZurueck={() => {}} />,
  );
  await act(async () => {
    await new Promise((r) => setTimeout(r, 5));
  });
  await tippe(q('[data-reiter="details"]'));
  return { repo, listen };
}

describe('Buchdetails: Abschnitt, Blatt und Listenübersicht', () => {
  it('Pille → Blatt → neue Saga über „+“ mit Band → Zeile „In Saga“ und „Band 2 · …“ unter dem Autor (REQ-095, REQ-096, REQ-099)', async () => {
    const buch = b('Iron Flame', { autor: 'Rebecca Yarros', bandnummer: 2 });
    const { listen } = await details(buch);
    expect(q('[data-abschnitt-ueberschrift]') && alle('[data-abschnitt-ueberschrift]').map((h) => h.textContent)).toContain('Sagas, Sammlungen und Bibliotheken');
    await tippe(q('[data-listen-pille="saga"]'));
    const blatt = q('[data-blatt-liste="saga"]')!;
    expect(blatt.closest('[role="dialog"]')).toHaveAttribute('aria-label', 'Zu einer Saga hinzufügen');
    await tippe(blatt.querySelector('[data-liste-neu]'));
    gib(q('[data-blatt-feld="liste-name"]'), '   ');
    await tippe(q('[data-liste-anlegen]'));
    expect(q('[data-blatt-feld="liste-name"]')).toHaveAttribute('data-fehler', 'true');
    gib(q('[data-blatt-feld="liste-name"]'), 'The Empyrean');
    await tippe(q('[data-liste-anlegen]'));
    const haken = q('[data-haekchen]')!;
    expect(haken).toHaveAttribute('aria-checked', 'true');
    // Bandnummer aus dem Scan vorausgefüllt (REQ-099, AK-6).
    expect(q<HTMLInputElement>('[data-band-feld]')!.value).toBe('2');
    gib(q('[data-band-feld]'), '0');
    await tippe(q('[data-blatt-sichern="liste"]'));
    expect(q('[data-band-feld]')).toHaveAttribute('data-fehler', 'true');
    expect(await listen.listen()).toEqual([]);
    gib(q('[data-band-feld]'), '2');
    await tippe(q('[data-blatt-sichern="liste"]'));
    expect(q('[data-blatt-liste]')).toBeNull();
    const [s] = await listen.listen();
    expect(s).toMatchObject({ art: 'saga', name: 'The Empyrean' });
    expect(await listen.zugehoerigkeiten()).toEqual([{ listeId: s.id, buchId: buch.id, band: 2 }]);
    expect(q('[data-listen-zeile="saga"]')).toHaveTextContent('In Saga');
    expect(q('[data-listen-zeile="saga"] [data-zeile-wert]')).toHaveTextContent('The Empyrean');
    expect(q('[data-listen-pille="saga"]')).toBeNull();
    expect(alle('[data-listen-pille]').map((p) => p.getAttribute('data-listen-pille'))).toEqual(['sammlung', 'bibliothek']);
    expect(q(`[data-saga-zeile="${s.id}"]`)).toHaveTextContent('Band 2 · The Empyrean');
  });

  it('Schließen ohne Sichern verwirft Häkchen und neue Listen (REQ-096, AK-5)', async () => {
    const { listen } = await details(b('X'));
    await tippe(q('[data-listen-pille="bibliothek"]'));
    await tippe(q('[data-blatt-liste] [data-liste-neu]'));
    gib(q('[data-blatt-feld="liste-name"]'), 'Zuhause');
    await tippe(q('[data-liste-anlegen]'));
    await tippe(q('[role="dialog"] [aria-label="Schließen"]'));
    expect(await listen.listen()).toEqual([]);
    expect(await listen.zugehoerigkeiten()).toEqual([]);
  });

  it('Zeile öffnet die Listenübersicht mit Häkchen; Umschalten wirkt sofort; letzte entfernt → Pille (REQ-097)', async () => {
    const listen = new InMemoryListenRepository();
    const l1 = liste('sammlung', 'Lieblingsbücher');
    const l2 = liste('sammlung', 'Sommer 2026');
    const buch = b('Momo');
    for (const l of [l1, l2]) await listen.listeSpeichern(l);
    await listen.zuordnen({ listeId: l1.id, buchId: buch.id });
    await details(buch, listen);
    await tippe(q('[data-listen-zeile="sammlung"]'));
    expect(q('[data-listenuebersicht="sammlung"]')).toHaveAttribute('data-mit-buch', 'true');
    expect(q(`[data-haekchen="${l1.id}"]`)).toHaveAttribute('aria-checked', 'true');
    expect(q(`[data-haekchen="${l2.id}"]`)).toHaveAttribute('aria-checked', 'false');
    expect(q(`[data-liste-zeile="${l1.id}"]`)).toHaveTextContent('Lieblingsbücher · 1 Buch');
    await tippe(q(`[data-haekchen="${l2.id}"]`));
    await tippe(q(`[data-haekchen="${l1.id}"]`));
    expect(await listen.zugehoerigkeiten()).toEqual([{ listeId: l2.id, buchId: buch.id }]);
    expect(q(`[data-liste-zeile="${l1.id}"]`)).toHaveTextContent('0 Bücher');
    await tippe(q(`[data-haekchen="${l2.id}"]`));
    await tippe(q('[aria-label="Zurück"]'));
    await act(async () => {
      await new Promise((r) => setTimeout(r, 10));
    });
    expect(q('[data-listen-pille="sammlung"]')).not.toBeNull();
  });

  it('Titel ändern (Pflicht) und Autor leeren bzw. nachtragen (REQ-094)', async () => {
    const { repo } = await details(b('Der Testroman', { autor: 'Ann Leckie' }));
    await tippe(q('[data-buchdetails-titel]'));
    gib(q('[data-blatt-feld="titel"]'), '   ');
    await tippe(q('[data-blatt-sichern="titel"]'));
    expect(q('[data-blatt-feld="titel"]')).toHaveAttribute('data-fehler', 'true');
    gib(q('[data-blatt-feld="titel"]'), 'Der Testroman, Band 2');
    await tippe(q('[data-blatt-sichern="titel"]'));
    expect(q('[data-buchdetails-titel]')).toHaveTextContent('Der Testroman, Band 2');
    await tippe(q('[data-buchdetails-autor]'));
    expect(q<HTMLInputElement>('[data-blatt-feld="autor"]')!.value).toBe('Ann Leckie');
    gib(q('[data-blatt-feld="autor"]'), '');
    await tippe(q('[data-blatt-sichern="autor"]'));
    expect(q('[data-buchdetails-autor]')).toHaveTextContent('unbekannter Autor');
    const [gespeichert] = await repo.list();
    expect(gespeichert.titel).toBe('Der Testroman, Band 2');
    expect(gespeichert).not.toHaveProperty('autor');
    await tippe(q('[data-buchdetails-autor]'));
    expect(q<HTMLInputElement>('[data-blatt-feld="autor"]')!.value).toBe('');
  });
});

describe('Geöffnete Liste, Seite „Bücher“ und Menüpunkt „Bibliothek“ (REQ-097, REQ-098)', () => {
  it('Seite „Bücher“: Saga-Platzhalter mit Namen; Antippen öffnet die Liste nach Bänden; Umschalten A–Z; Umbenennen; Löschen mit Rückfrage', async () => {
    const repo = new InMemoryBookRepository();
    const listen = new InMemoryListenRepository();
    const s = liste('saga', 'Crescent City');
    const andere = liste('saga', 'Alpha');
    await listen.listeSpeichern(s);
    await listen.listeSpeichern(andere);
    const buecher = [b('House of Sky and Breath'), b('House of Earth and Blood'), b('House of Flame and Shadow'), b('Fremd')];
    for (const x of buecher) await repo.save(x);
    await listen.zuordnen({ listeId: s.id, buchId: buecher[0].id, band: 2 });
    await listen.zuordnen({ listeId: s.id, buchId: buecher[1].id, band: 1 });
    await listen.zuordnen({ listeId: s.id, buchId: buecher[2].id, band: 3 });
    render(<BuecherAnsicht repository={repo} listenRepository={listen} bildspeicher={new InMemoryImageStore()} ansichtRepository={new InMemoryAnsichtRepository()} />);
    await act(async () => {
      await new Promise((r) => setTimeout(r, 10));
    });
    expect(alle('[data-abschnitt="sagas"] [data-listentitel]').map((t) => t.textContent)).toEqual(['Alpha', 'Crescent City']);
    await tippe(q(`[data-listeneintrag="${s.id}"]`));
    await act(async () => {
      await new Promise((r) => setTimeout(r, 10));
    });
    expect(q('[data-geoeffnete-liste]')).toHaveAttribute('data-sortierung', 'baende');
    expect(q('[data-geoeffnete-liste] [data-filter]')).toBeNull();
    const titel = () => alle('[data-geoeffnete-liste] [data-buchtitel]').map((t) => t.textContent);
    expect(titel()).toEqual(['House of Earth and Blood', 'House of Sky and Breath', 'House of Flame and Shadow']);
    expect(q('[data-buecherzahl]')).toHaveTextContent('3 Bücher');
    await tippe(q('[data-sortierknopf]'));
    expect(titel()).toEqual(['House of Earth and Blood', 'House of Flame and Shadow', 'House of Sky and Breath']);
    // Plus legt eine Saga an, kein Buch.
    await tippe(q('[data-geoeffnete-liste] [data-liste-neu]'));
    gib(q('[data-blatt-feld="liste-name"]'), 'Neu');
    await tippe(q('[data-liste-anlegen]'));
    expect((await listen.listen()).map((l) => l.name).sort()).toEqual(['Alpha', 'Crescent City', 'Neu']);
    expect(await repo.list()).toHaveLength(4);
    // Umbenennen.
    await tippe(q('[data-liste-stift]'));
    gib(q('[data-blatt-feld="liste-umbenennen"]'), 'CC');
    await tippe(q('[data-blatt-sichern="liste-umbenennen"]'));
    expect(q('[data-liste-titel]')).toHaveTextContent('CC');
    // Löschen: verneinen, dann bestätigen.
    await tippe(q('[data-liste-stift]'));
    await tippe(q('[data-liste-loeschen]'));
    await tippe(q('[data-loeschen-abbrechen]'));
    expect((await listen.listen()).some((l) => l.id === s.id)).toBe(true);
    await tippe(q('[data-liste-stift]'));
    await tippe(q('[data-liste-loeschen]'));
    await tippe(q('[data-loeschen-bestaetigen]'));
    expect((await listen.listen()).some((l) => l.id === s.id)).toBe(false);
    expect((await listen.zugehoerigkeiten()).filter((z) => z.listeId === s.id)).toEqual([]);
    expect(await repo.list()).toHaveLength(4);
    expect(q('[data-listenuebersicht="saga"]')).toHaveAttribute('data-mit-buch', 'false');
  });

  it('Bibliothek: Listenübersicht ohne Häkchen, „+“ legt eine leere Bibliothek an', async () => {
    const listen = new InMemoryListenRepository();
    await listen.listeSpeichern(liste('bibliothek', 'Zuhause'));
    render(<BibliothekAnsicht repository={new InMemoryBookRepository()} listenRepository={listen} />);
    await act(async () => {
      await new Promise((r) => setTimeout(r, 10));
    });
    expect(q('[data-listenuebersicht="bibliothek"]')).toHaveTextContent('Zuhause · 0 Bücher');
    expect(q('[data-haekchen]')).toBeNull();
    expect(document.body).not.toHaveTextContent('under construction');
    await tippe(q('[data-liste-neu]'));
    gib(q('[data-blatt-feld="liste-name"]'), 'Büro');
    await tippe(q('[data-liste-anlegen]'));
    expect(alle('[data-liste-name]').map((n) => n.textContent)).toEqual(['Büro', 'Zuhause']);
    expect(await listen.zugehoerigkeiten()).toEqual([]);
  });
});
