import '@testing-library/jest-dom/vitest';
import { act, cleanup, fireEvent, render } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { erschienenEingabeText, erschienenErgebnis, erschienenFiltern, erschienenText, erscheinungAusText } from '@/domain/ausgabe';
import { rezensionSichern } from '@/domain/bewertung';
import type { Buch } from '@/domain/buch';
import { fortschrittEntfernen } from '@/domain/fortschritt';
import { InMemoryBookRepository } from '@/storage/InMemoryBookRepository';
import { InMemoryImageStore } from '@/storage/InMemoryImageStore';
import { InMemoryListenRepository } from '@/storage/InMemoryListenRepository';
import BuchDetails from '@/views/BuchDetails';

afterEach(cleanup);

const JETZT = new Date(2026, 10, 23, 12);
const b = (extra: Partial<Buch> = {}): Buch => ({ id: crypto.randomUUID(), titel: 'Momo', status: 'gelesen', ...extra });

describe('„Erschienen“ als Datum oder Jahr (REQ-092)', () => {
  it('Prüfung: Datum bis heute, Jahr bis zum laufenden Jahr, leer gültig', () => {
    expect(erschienenErgebnis('01.02.2025', JETZT)).toBe('01.02.2025');
    expect(erschienenErgebnis('2019', JETZT)).toBe('2019');
    expect(erschienenErgebnis('2026', JETZT)).toBe('2026');
    expect(erschienenErgebnis('', JETZT)).toBe('');
    for (const x of ['2027', '219', '31.02.2025', '24.11.2026', '1.2.2025']) expect(erschienenErgebnis(x, JETZT)).toBeNull();
  });

  it('Anzeige: Datum hat Vorrang („Feb. 2019“), sonst Jahr, sonst leer; Vorbefüllung', () => {
    expect(erschienenText({ erscheinungsjahr: 2019, erscheinungsdatum: '03.02.2019' })).toBe('Feb. 2019');
    expect(erschienenText({ erscheinungsjahr: 2019 })).toBe('2019');
    expect(erschienenText({})).toBe('');
    expect(erschienenEingabeText({ erscheinungsjahr: 2019, erscheinungsdatum: '15.03.2021' })).toBe('15.03.2021');
    expect(erschienenEingabeText({ erscheinungsjahr: 2019 })).toBe('2019');
    expect(erscheinungAusText('2019')).toEqual({ erscheinungsjahr: 2019 });
    expect(erscheinungAusText('15.03.2021')).toEqual({ erscheinungsdatum: '15.03.2021' });
    expect(erscheinungAusText('')).toEqual({});
  });

  it('Filter: Jahr bleibt stehen, Datum bekommt Punkte', () => {
    expect(erschienenFiltern('2019')).toBe('2019');
    expect(erschienenFiltern('15032021')).toBe('15.03.2021');
    expect(erschienenFiltern('15.03.2021x')).toBe('15.03.2021');
  });

  it('Leeren von Fortschritt und Rezension (REQ-093)', () => {
    const buch = b({ aktuelleSeite: 120, seitenanzahl: 400, sitzungen: [{ zeitpunkt: 'z', seite: 120 }] });
    expect(fortschrittEntfernen(buch)).toEqual({ ...b({ seitenanzahl: 400, sitzungen: [{ zeitpunkt: 'z', seite: 120 }] }), id: buch.id });
    const prozent = fortschrittEntfernen(b({ seitenanzahl: 400, fortschrittProzent: 30, fortschrittsmodus: 'prozent' }));
    expect(prozent).toMatchObject({ fortschrittsmodus: 'prozent' });
    expect(prozent).not.toHaveProperty('fortschrittProzent');
    expect(prozent).not.toHaveProperty('aktuelleSeite');
    expect(rezensionSichern(b(), '  ')).toBeNull();
    expect(rezensionSichern(b({ rezension: 'Gut' }), '')).not.toHaveProperty('rezension');
  });
});

async function details(buch: Buch) {
  const repo = new InMemoryBookRepository();
  await repo.save(buch);
  render(
    <BuchDetails
      buchId={buch.id}
      repository={repo}
      listenRepository={new InMemoryListenRepository()}
      bildspeicher={new InMemoryImageStore()}
      jetzt={() => JETZT}
      onZurueck={() => {}}
    />,
  );
  await act(async () => {});
  fireEvent.click(document.querySelector('[data-reiter="details"]')!);
  await act(async () => {});
  return repo;
}
const q = (sel: string) => document.querySelector<HTMLElement>(sel);
const wert = (id: string) => q(`[data-ausgabe-zeile="${id}"] [data-zeile-wert]`)!.textContent;
async function blatt(zeile: string, kennung: string, eingabe: string) {
  fireEvent.click(q(`[data-ausgabe-zeile="${zeile}"]`)!);
  await act(async () => {});
  fireEvent.change(q(`[data-blatt-feld="${kennung}"]`)!, { target: { value: eingabe } });
  fireEvent.click(q(`[data-blatt-sichern="${kennung}"]`)!);
  await act(async () => {
    await new Promise((r) => setTimeout(r, 5));
  });
}

describe('Buchdetails: Erschienen, Leeren und Pfeile (REQ-091 bis REQ-093)', () => {
  it('alle zwölf Zeilen mit Pfeil, auch ohne Werte', async () => {
    await details(b());
    expect(document.querySelectorAll('[data-ausgabe-zeile] [data-zeile-pfeil]')).toHaveLength(12);
  });

  it('Erschienen: Datum, Jahr, ungültig, leeren', async () => {
    const repo = await details(b({ erscheinungsdatum: '15.03.2021' }));
    fireEvent.click(q('[data-ausgabe-zeile="erschienen"]')!);
    await act(async () => {});
    expect((q('[data-blatt-feld="erschienen"]') as HTMLInputElement).value).toBe('15.03.2021');
    fireEvent.click(q('[data-blatt-hintergrund]')!);
    await act(async () => {});
    await blatt('erschienen', 'erschienen', '01.02.2025');
    expect(wert('erschienen')).toBe('Feb. 2025');
    await blatt('erschienen', 'erschienen', '2019');
    expect(wert('erschienen')).toBe('2019');
    const [nachJahr] = await repo.list();
    expect(nachJahr.erscheinungsjahr).toBe(2019);
    expect(nachJahr).not.toHaveProperty('erscheinungsdatum');
    await blatt('erschienen', 'erschienen', '2027');
    expect(q('[data-blatt-feld="erschienen"]')).toHaveAttribute('data-fehler', 'true');
    fireEvent.change(q('[data-blatt-feld="erschienen"]')!, { target: { value: '' } });
    fireEvent.click(q('[data-blatt-sichern="erschienen"]')!);
    await act(async () => {
      await new Promise((r) => setTimeout(r, 5));
    });
    expect(q('[data-blatt-feld="erschienen"]')).toBeNull();
    expect(wert('erschienen')).toBe('');
    const [leer] = await repo.list();
    expect(leer).not.toHaveProperty('erscheinungsjahr');
  });

  it('ISBN, Hinzugefügt, Beendet am und Verlag leeren; Seiten bleibt Pflicht', async () => {
    const repo = await details(
      b({ isbn: '9783551551672', eingetragenAm: new Date(2026, 9, 14, 12).toISOString(), beendetAm: '2026-11-22', verlag: 'Carlsen', seitenanzahl: 400 }),
    );
    await blatt('isbn', 'isbn', '');
    await blatt('hinzugefuegt', 'hinzugefuegt', '');
    await blatt('beendet', 'beendet', '');
    await blatt('verlag', 'verlag', '');
    const [x] = await repo.list();
    for (const f of ['isbn', 'eingetragenAm', 'beendetAm', 'verlag'] as const) expect(x).not.toHaveProperty(f);
    expect(x.status).toBe('gelesen');
    expect(wert('hinzugefuegt')).toBe('');
    fireEvent.click(q('[data-ausgabe-zeile="hinzugefuegt"]')!);
    await act(async () => {});
    expect((q('[data-blatt-feld="hinzugefuegt"]') as HTMLInputElement).value).toBe('');
  });
});
