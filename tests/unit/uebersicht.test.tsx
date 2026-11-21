import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { filterKonfiguration } from '@/buecher/filterKonfiguration';
import { neuesBuch, type Buch } from '@/domain/buch';
import { alphabetisch, anzahlText, kartenzusatz, nachEintragung, neuesteBuecher, suchen } from '@/domain/uebersicht';
import { InMemoryBookRepository } from '@/storage/InMemoryBookRepository';
import { InMemoryAnsichtRepository } from '@/storage/InMemoryAnsichtRepository';
import { InMemoryImageStore } from '@/storage/InMemoryImageStore';
import BuecherAnsicht from '@/views/BuecherAnsicht';

afterEach(cleanup);

const datum = (i: number) => new Date(Date.UTC(2026, 0, 1, 0, i)).toISOString();
const b = (titel: string, status: Buch['status'] = 'ungelesen', extra: Partial<Buch> = {}): Buch => ({
  ...neuesBuch({ titel, status }),
  ...extra,
});

describe('Fachlogik Übersichten', () => {
  it('nachEintragung: neueste zuerst, undatierte danach in umgekehrter Anlegereihenfolge', () => {
    const a = b('A', 'ungelesen', { eingetragenAm: datum(1) });
    const c = b('C', 'gelesen', { eingetragenAm: datum(3) });
    const x = b('X');
    const y = b('Y');
    const kaputt = b('K', 'ungelesen', { eingetragenAm: 'kein Datum' });
    expect(nachEintragung([x, a, y, c, kaputt]).map((z) => z.titel)).toEqual(['C', 'A', 'K', 'Y', 'X']);
  });

  it('neuesteBuecher: höchstens 10', () => {
    const viele = Array.from({ length: 12 }, (_, i) => b(`B${i}`, 'ungelesen', { eingetragenAm: datum(i) }));
    expect(neuesteBuecher(viele).map((z) => z.titel)).toEqual(['B11', 'B10', 'B9', 'B8', 'B7', 'B6', 'B5', 'B4', 'B3', 'B2']);
  });

  it('alphabetisch, suchen, anzahlText', () => {
    expect(alphabetisch([b('zorn'), b('Anfang'), b('Mitte')]).map((z) => z.titel)).toEqual(['Anfang', 'Mitte', 'zorn']);
    const liste = [b('Dire bound', 'am_lesen', { autor: 'Sable Sorensen' }), b('Threshing day')];
    expect(suchen(liste, 'BOU').map((z) => z.titel)).toEqual(['Dire bound']);
    expect(suchen(liste, 'soren').map((z) => z.titel)).toEqual(['Dire bound']);
    expect(suchen(liste, '  ')).toHaveLength(2);
    expect(suchen(liste, 'xyz')).toEqual([]);
    expect([anzahlText(0), anzahlText(1), anzahlText(2)]).toEqual(['0 Bücher', '1 Buch', '2 Bücher']);
  });

  it('kartenzusatz: Seite, Prozent, ohne Seitenanzahl, anderer Status', () => {
    expect(kartenzusatz(b('S', 'am_lesen', { seitenanzahl: 608, aktuelleSeite: 200 }))).toMatchObject({ art: 'fortschritt', text: '200 / 608 · 33 %' });
    expect(kartenzusatz(b('P', 'am_lesen', { seitenanzahl: 300, fortschrittsmodus: 'prozent', fortschrittProzent: 33 }))).toMatchObject({
      art: 'fortschritt',
      text: '33 %',
    });
    expect(kartenzusatz(b('O', 'am_lesen'))).toEqual({ art: 'nichts' });
    expect(kartenzusatz(b('U'))).toEqual({ art: 'status', text: 'ungelesen' });
    expect(kartenzusatz(b('W', 'wunschliste'))).toEqual({ art: 'status', text: 'Wunschliste' });
  });
});

/** Rendert die Seite „Bücher“ mit gemeinsamen Speichern (Neustart = erneutes Rendern mit denselben Speichern). */
function starte(buecher: Buch[], ansichten = new InMemoryAnsichtRepository()) {
  const repository = new InMemoryBookRepository();
  const bildspeicher = new InMemoryImageStore();
  const fertig = Promise.all(buecher.map((x) => repository.save(x)));
  const zeige = async () => {
    await fertig;
    render(<BuecherAnsicht repository={repository} bildspeicher={bildspeicher} ansichtRepository={ansichten} />);
    await screen.findByRole('heading', { name: 'Deine Bücher' });
  };
  return { repository, ansichten, zeige };
}

const abschnitt = (id: string) => document.querySelector<HTMLElement>(`[data-abschnitt="${id}"]`)!;
const pille = (name: string) => within(screen.getByRole('group', { name: 'Filter' })).getByRole('button', { name });
const titelIn = (el: ParentNode) => Array.from(el.querySelectorAll('[data-buchtitel]')).map((t) => t.textContent);
const uebersicht = () => document.querySelector<HTMLElement>('[data-uebersicht]');

describe('Seite „Bücher“: Abschnitt „Alle Bücher“', () => {
  it('steht nach „Sammlungen“, neueste links, Platzhalter ohne Bücher', async () => {
    const s = starte([b('A', 'gelesen', { eingetragenAm: datum(1) }), b('B', 'am_lesen', { eingetragenAm: datum(2) })]);
    await s.zeige();
    const abschnitte = Array.from(document.querySelectorAll('section')).map((x) => x.getAttribute('aria-label'));
    expect(abschnitte.slice(-2)).toEqual(['Sammlungen', 'Alle Bücher']);
    await waitFor(() => expect(titelIn(abschnitt('alle-buecher'))).toEqual(['B', 'A']));
    cleanup();
    await starte([]).zeige();
    await waitFor(() => expect(abschnitt('alle-buecher').querySelectorAll('[data-leere-liste]')).toHaveLength(1));
    expect(abschnitt('alle-buecher').textContent).toContain('Deine Bücher warten auf dich...');
  });

  it('„Alle ansehen ›“ öffnet die Übersicht „Alle“; Buch antippen und zurück führt zur Übersicht', async () => {
    const s = starte([b('Zorn', 'gelesen'), b('Anfang'), b('Mitte', 'am_lesen')]);
    await s.zeige();
    fireEvent.click(abschnitt('alle-buecher').querySelector('[data-alle-ansehen]')!);
    await waitFor(() => expect(uebersicht()?.getAttribute('data-ansicht')).toBe('raster'));
    expect(uebersicht()!.getAttribute('data-uebersicht')).toBe('alle');
    expect(pille('Alle').getAttribute('aria-pressed')).toBe('true');
    expect(titelIn(uebersicht()!)).toEqual(['Anfang', 'Mitte', 'Zorn']);
    expect(document.querySelector('[data-buecherzahl]')!.textContent).toBe('3 Bücher');
    expect(screen.getByPlaceholderText('In Alle Bücher suchen')).toBeTruthy();
    fireEvent.click(uebersicht()!.querySelector('[data-rastereintrag] [data-buchtitel]')!);
    const zurueck = await screen.findByRole('button', { name: /zurück/i });
    fireEvent.click(zurueck);
    await waitFor(() => expect(uebersicht()?.getAttribute('data-uebersicht')).toBe('alle'));
  });
});

describe('Übersichten', () => {
  it('Pille „Alle“ öffnet die Übersicht, Suche zählt Treffer, Pillenwechsel und „Für dich“', async () => {
    const s = starte([b('Alpha'), b('Alphabet', 'gelesen'), b('Lesend', 'am_lesen', { autor: 'Sable Sorensen' })]);
    await s.zeige();
    fireEvent.click(pille('Alle'));
    await waitFor(() => expect(uebersicht()?.getAttribute('data-uebersicht')).toBe('alle'));
    fireEvent.change(screen.getByRole('searchbox'), { target: { value: 'SOREN' } });
    await waitFor(() => expect(document.querySelector('[data-buecherzahl]')!.textContent).toBe('1 Buch'));
    fireEvent.click(pille('Noch zu lesen'));
    await waitFor(() => expect(uebersicht()?.getAttribute('data-uebersicht')).toBe('noch_zu_lesen'));
    expect(screen.getByPlaceholderText('In Noch zu lesen suchen')).toBeTruthy();
    fireEvent.change(screen.getByRole('searchbox'), { target: { value: 'alpha' } });
    await waitFor(() => expect(titelIn(uebersicht()!)).toEqual(['Alpha']));
    fireEvent.click(pille('Gerade am Lesen'));
    await waitFor(() => expect(titelIn(uebersicht()!)).toEqual(['Lesend']));
    fireEvent.click(pille('Für dich'));
    await waitFor(() => expect(uebersicht()).toBeNull());
    expect(pille('Für dich').getAttribute('aria-pressed')).toBe('true');
  });

  it('„Gerade am Lesen“ öffnet von der Seite; „Noch zu lesen“ nur über „Alle ansehen ›“', async () => {
    const s = starte([b('Asche', 'am_lesen'), b('Zeit', 'am_lesen'), b('Berg')]);
    await s.zeige();
    fireEvent.click(pille('Noch zu lesen'));
    expect(uebersicht()).toBeNull();
    fireEvent.click(abschnitt('noch-zu-lesen').querySelector('[data-alle-ansehen]')!);
    await waitFor(() => expect(uebersicht()?.getAttribute('data-uebersicht')).toBe('noch_zu_lesen'));
    expect(pille('Noch zu lesen').getAttribute('aria-pressed')).toBe('true');
    cleanup();
    await s.zeige();
    fireEvent.click(pille('Gerade am Lesen'));
    await waitFor(() => expect(titelIn(uebersicht()!)).toEqual(['Asche', 'Zeit']));
    expect(screen.getByPlaceholderText('In Gerade am Lesen suchen')).toBeTruthy();
  });

  it('Ansicht je Liste gemerkt (über Neustart), Listenkarte mit Fortschritt bzw. Statuschip; „Zuletzt“ ohne Wirkung', async () => {
    const s = starte([
      b('Dire bound', 'am_lesen', { seitenanzahl: 608, aktuelleSeite: 200, autor: 'Sorensen, Sable' }),
      b('Threshing day'),
    ]);
    await s.zeige();
    fireEvent.click(pille('Alle'));
    await waitFor(() => expect(uebersicht()?.getAttribute('data-ansicht')).toBe('raster'));
    fireEvent.click(document.querySelector('[data-ansicht-wahl="liste"]')!);
    await waitFor(() => expect(uebersicht()?.getAttribute('data-ansicht')).toBe('liste'));
    const karten = document.querySelectorAll('[data-listenkarte]');
    expect(karten).toHaveLength(2);
    expect(karten[0].querySelector('[data-fortschrittstext]')!.textContent).toBe('200 / 608 · 33 %');
    expect(karten[0].querySelector('[role="progressbar"]')).not.toBeNull();
    expect(karten[1].querySelector('[data-statuschip]')!.textContent).toBe('ungelesen');
    expect(karten[1].querySelector('[data-autorzeile] [data-icon]')).not.toBeNull();
    expect(karten[1].querySelector('[data-autor]')).toBeNull();
    const vorher = document.body.innerHTML;
    fireEvent.click(document.querySelector('[data-sortierknopf]')!);
    expect(document.body.innerHTML).toBe(vorher);
    fireEvent.click(pille('Noch zu lesen'));
    await waitFor(() => expect(uebersicht()?.getAttribute('data-ansicht')).toBe('raster'));
    cleanup();
    await s.zeige();
    fireEvent.click(pille('Alle'));
    await waitFor(() => expect(uebersicht()?.getAttribute('data-ansicht')).toBe('liste'));
    expect(await s.ansichten.lesen('alle')).toBe('liste');
    expect(await s.ansichten.lesen('noch_zu_lesen')).toBeUndefined();
  });

  it('keine Bücher: nichts an Stelle der Bücher, „0 Bücher“; keine Zahlen hinter den Pillen', async () => {
    await starte([]).zeige();
    fireEvent.click(pille('Alle'));
    await waitFor(() => expect(uebersicht()?.getAttribute('data-ansicht')).toBe('raster'));
    expect(uebersicht()!.querySelector('[data-buecher]')).toBeNull();
    expect(uebersicht()!.querySelector('[data-leere-liste], [data-cover-platzhalter]')).toBeNull();
    for (const f of filterKonfiguration) expect(pille(f.name).textContent).toBe(f.name);
  });
});

describe('Eintragungsdatum beim Anlegen (REQ-041)', () => {
  it('Manueller Eintrag setzt eingetragenAm = jetzt', async () => {
    const repository = new InMemoryBookRepository();
    const jetzt = new Date('2026-11-12T08:15:00.000Z');
    render(<BuecherAnsicht repository={repository} bildspeicher={new InMemoryImageStore()} ansichtRepository={new InMemoryAnsichtRepository()} jetzt={() => jetzt} />);
    await screen.findByRole('heading', { name: 'Deine Bücher' });
    fireEvent.click(screen.getByRole('button', { name: 'Buch hinzufügen' }));
    fireEvent.click(await screen.findByText('Von Hand eintragen'));
    fireEvent.change(await screen.findByLabelText(/titel/i), { target: { value: 'Neu' } });
    fireEvent.click(screen.getByRole('button', { name: 'Hinzufügen' }));
    await waitFor(async () => expect((await repository.list())[0]?.eingetragenAm).toBe(jetzt.toISOString()));
  });
});
