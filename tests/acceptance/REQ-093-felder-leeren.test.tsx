/**
 * Akzeptanztests REQ-093 – Gespeicherte Angaben durch Leeren des Feldes entfernen; Titel und Seitenzahl bleiben Pflicht;
 * Bücher ohne Eintragungsdatum stehen in „Alle Bücher“ oben, untereinander A–Z.
 * Abgeleitet aus dem REQ-Text. Bekannte Schnittstellen (REQ-024/049/057/059/063/064/072/085, REQ-035):
 *  - Details: [data-reiter="details"], [data-ausgabe-zeile=id] mit [data-zeile-wert]; Blattfelder [data-blatt-feld=id],
 *    [data-blatt-sichern=id]; Preis: dialog „Preis“ [data-preis-eingabe]/[data-preis-sichern]; Maße: dialog „Maße“
 *    [data-mass-feld=…]/[data-masse-sichern]; Buchlänge: dialog „Buchlänge“, Feld „Seitenanzahl“; Aktuelle Seite: dialog
 *    „Aktuelle Seite“ über [role=progressbar], Felder „Aktuelle Seite“/„Prozent“, Knöpfe „Seite“/„%“/„Sichern“;
 *    Rezension: [data-schreibfeld], [data-schreibfenster], [data-rezension-eingabe], [data-rezension-sichern],
 *    [data-rezension-text], [data-schreibfeld-platzhalter]
 *  - Seite „Bücher“: [data-abschnitt="alle-buecher"] li[data-bucheintrag] [data-buchtitel]
 * „Neustart“ = Module neu laden, neue Repository-Instanz auf derselben (Fake-)IndexedDB.
 */
import '@testing-library/jest-dom/vitest';
import { act, cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { IDBFactory, IDBKeyRange } from 'fake-indexeddb';
import type { ComponentType, CSSProperties } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { Buch } from '@/domain/buch';
import type { BookRepository, ImageStore } from '@/storage';
import { farbVariablen } from '@/theme';

vi.mock('@/buecher/demodaten', () => ({ demoBuecher: [] }));
beforeEach(() => {
  vi.stubGlobal('indexedDB', new IDBFactory());
  vi.stubGlobal('IDBKeyRange', IDBKeyRange);
});
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

type Welt = { repo: BookRepository; BD: ComponentType<Record<string, unknown>>; BA: ComponentType<Record<string, unknown>> };
const HEUTE = new Date(2026, 10, 23, 15, 0, 0);
const jetzt = () => HEUTE;
const W = { timeout: 4000 };
const buch = (f: Partial<Buch> = {}): Buch => ({ id: crypto.randomUUID(), titel: 'Der Testroman', status: 'ungelesen', ...f });
const bilder = { get: async () => undefined, put: async () => {}, remove: async () => {} } as unknown as ImageStore;
const quelle = { scannen: async () => null, galerie: async () => null };
async function starte(): Promise<Welt> {
  vi.resetModules();
  const st = (await import('@/storage')) as typeof import('@/storage');
  const BD = (await import('@/views/BuchDetails')).default as unknown as ComponentType<Record<string, unknown>>;
  const BA = (await import('@/views/BuecherAnsicht')).default as unknown as ComponentType<Record<string, unknown>>;
  return { repo: st.createBookRepository(), BD, BA };
}
async function warte(ms = 40) {
  await act(async () => {
    await new Promise((r) => setTimeout(r, ms));
  });
}
async function tippe(el: Element) {
  await act(async () => {
    fireEvent.click(el);
    await new Promise((r) => setTimeout(r, 15));
  });
}
async function zeige(w: Welt, id: string, details = true) {
  const BD = w.BD;
  render(
    <div data-testwurzel="" style={farbVariablen() as CSSProperties}>
      <BD buchId={id} jetzt={jetzt} bildspeicher={bilder} bildquelle={quelle} onZurueck={() => {}} />
    </div>,
  );
  const d = await screen.findByRole('region', { name: 'Buchdetails' }, W);
  await vi.waitFor(() => expect(d.querySelector('[data-statuspille]')).not.toBeNull(), W);
  if (details) {
    await tippe(d.querySelector('[data-reiter="details"]')!);
    await vi.waitFor(() => expect(d.querySelector('[data-reiter-bereich="details"]')).not.toBeNull(), W);
  }
  return d;
}
async function mitBuch(b: Buch, details = true) {
  const w = await starte();
  await w.repo.save(b);
  return { w, d: await zeige(w, b.id, details), id: b.id };
}
async function gespeichert(id: string) {
  cleanup();
  return (await starte()).repo.get(id);
}
async function neustartAnzeige(id: string, details = true) {
  cleanup();
  return zeige(await starte(), id, details);
}
const norm = (t: string | null | undefined) => (t ?? '').replace(/[\s  ]+/g, ' ').trim();
const zeile = (d: HTMLElement, id: string) => d.querySelector<HTMLElement>(`[data-reiter-bereich="details"] [data-ausgabe-zeile="${id}"]`)!;
const wert = (d: HTMLElement, id: string) => norm(zeile(d, id).querySelector('[data-zeile-wert]')?.textContent);
const bfeld = (id: string) => document.querySelector<HTMLInputElement>(`[data-blatt-feld="${id}"]`);
const markiert = (el: HTMLElement | null) => !!el && (el.getAttribute('data-fehler') === 'true' || el.getAttribute('aria-invalid') === 'true');

/** Blattfeld (Verlag, ISBN, Hinzugefügt, Beendet am) öffnen, leeren und sichern. Gibt die Markierung nach dem Sichern zurück. */
async function blattLeeren(d: HTMLElement, id: string) {
  await tippe(zeile(d, id));
  await vi.waitFor(() => expect(bfeld(id)).not.toBeNull(), W);
  expect(bfeld(id)!.value, `${id}: vorbefüllt`).not.toBe('');
  fireEvent.change(bfeld(id)!, { target: { value: '' } });
  expect(bfeld(id)!.value).toBe('');
  await tippe(document.querySelector(`[data-blatt-sichern="${id}"]`)!);
  await warte(60);
  return markiert(bfeld(id));
}

describe('REQ-093 Felder leeren', () => {
  it('[REQ-093/AK-1] Verlag „Carlsen“ leeren und sichern: Blatt zu, kein Verlag, Zeile leer, auch nach Neustart', async () => {
    const { d, id } = await mitBuch(buch({ verlag: 'Carlsen' }));
    expect(wert(d, 'verlag')).toBe('Carlsen');
    expect(await blattLeeren(d, 'verlag')).toBe(false);
    await vi.waitFor(() => expect(bfeld('verlag')).toBeNull(), W);
    await vi.waitFor(() => expect(wert(d, 'verlag')).toBe(''), W);
    expect((await gespeichert(id))?.verlag).toBeUndefined();
    expect(wert(await neustartAnzeige(id), 'verlag')).toBe('');
  });

  it('[REQ-093/AK-1] Grenzfall: nur Leerzeichen im Verlag gelten nicht als Verlag – danach kein Verlag gespeichert, Zeile leer', async () => {
    const { d, id } = await mitBuch(buch({ verlag: 'Carlsen' }));
    await tippe(zeile(d, 'verlag'));
    await vi.waitFor(() => expect(bfeld('verlag')).not.toBeNull(), W);
    fireEvent.change(bfeld('verlag')!, { target: { value: '   ' } });
    await tippe(document.querySelector('[data-blatt-sichern="verlag"]')!);
    await warte(60);
    const b = await gespeichert(id);
    // Entweder wurde nicht gesichert (Verlag bleibt) oder entfernt – ein Verlag aus Leerzeichen darf nie entstehen.
    expect(b?.verlag === undefined || b?.verlag === 'Carlsen').toBe(true);
  });

  it.each(['9783551551672', '080442957X'])('[REQ-093/AK-2] gültige ISBN %s leeren: nicht hervorgehoben, Blatt zu, keine ISBN, Zeile leer', async (isbn) => {
    const { d, id } = await mitBuch(buch({ isbn }));
    expect(await blattLeeren(d, 'isbn')).toBe(false);
    await vi.waitFor(() => expect(bfeld('isbn')).toBeNull(), W);
    expect(wert(d, 'isbn')).toBe('');
    expect((await gespeichert(id))?.isbn).toBeUndefined();
  });

  it('[REQ-093/AK-2] Gegenprobe: ungültige ISBN (nicht leer) wird weiterhin hervorgehoben und nicht gesichert', async () => {
    const { d, id } = await mitBuch(buch({ isbn: '9783551551672' }));
    await tippe(zeile(d, 'isbn'));
    await vi.waitFor(() => expect(bfeld('isbn')).not.toBeNull(), W);
    fireEvent.change(bfeld('isbn')!, { target: { value: '12345' } });
    await tippe(document.querySelector('[data-blatt-sichern="isbn"]')!);
    expect(markiert(bfeld('isbn'))).toBe(true);
    expect((await gespeichert(id))?.isbn).toBe('9783551551672');
  });

  it('[REQ-093/AK-3] Preis 12,99 € leeren und sichern: kein Preis, Zeile „Trag ein, was du bezahlt hast“, auch nach Neustart', async () => {
    const { d, id } = await mitBuch(buch({ preisCent: 1299 }));
    expect(wert(d, 'preis')).toBe('12,99 €');
    await tippe(zeile(d, 'preis'));
    const dlg = await vi.waitFor(() => {
      const x = document.querySelector<HTMLElement>('[role="dialog"][aria-label="Preis"]');
      expect(x).not.toBeNull();
      return x!;
    }, W);
    await act(async () => {
      fireEvent.change(dlg.querySelector('[data-preis-eingabe]')!, { target: { value: '' } });
    });
    await tippe(dlg.querySelector('[data-preis-sichern]')!);
    await warte(60);
    await vi.waitFor(() => expect(document.querySelector('[role="dialog"][aria-label="Preis"]')).toBeNull(), W);
    expect(wert(d, 'preis')).toBe('Trag ein, was du bezahlt hast');
    expect((await gespeichert(id))?.preisCent).toBeUndefined();
    expect(wert(await neustartAnzeige(id), 'preis')).toBe('Trag ein, was du bezahlt hast');
  });

  it('[REQ-093/AK-3] Grenzfall: Preis 0,00 € ist ein Wert – Leeren entfernt auch ihn', async () => {
    const { d, id } = await mitBuch(buch({ preisCent: 0 }));
    await tippe(zeile(d, 'preis'));
    const dlg = await vi.waitFor(() => document.querySelector<HTMLElement>('[role="dialog"][aria-label="Preis"]')!, W);
    await act(async () => {
      fireEvent.change(dlg.querySelector('[data-preis-eingabe]')!, { target: { value: '' } });
    });
    await tippe(dlg.querySelector('[data-preis-sichern]')!);
    await warte(60);
    expect((await gespeichert(id))?.preisCent).toBeUndefined();
  });

  it.each([
    ['dicke', { breiteMm: 135, hoeheMm: 210 }, 'dickeMm'],
    ['breite', { hoeheMm: 210, dickeMm: 30 }, 'breiteMm'],
  ] as const)('[REQ-093/AK-4] nur „%s“ leeren: die anderen Maße bleiben, das geleerte gilt als nicht hinterlegt', async (id, bleibt, weg) => {
    const { d, id: bid } = await mitBuch(buch({ breiteMm: 135, hoeheMm: 210, dickeMm: 30 }));
    await tippe(zeile(d, 'masse'));
    const dlg = await vi.waitFor(() => {
      const x = document.querySelector<HTMLElement>('[role="dialog"][aria-label="Maße"]');
      expect(x).not.toBeNull();
      return x!;
    }, W);
    await act(async () => {
      fireEvent.change(dlg.querySelector(`[data-mass-feld="${id}"]`)!, { target: { value: '' } });
    });
    await tippe(dlg.querySelector('[data-masse-sichern]')!);
    await warte(60);
    await vi.waitFor(() => expect(document.querySelector('[role="dialog"][aria-label="Maße"]')).toBeNull(), W);
    const b = await gespeichert(bid);
    expect(b).toMatchObject(bleibt);
    expect(b?.[weg]).toBeUndefined();
  });

  it('[REQ-093/AK-5] Hinzugefügt 14.10.2026 leeren: nicht hervorgehoben, kein Eintragungsdatum, Zeile leer, auch nach Neustart', async () => {
    const { d, id } = await mitBuch(buch({ eingetragenAm: new Date(2026, 9, 14, 12).toISOString() }));
    expect(wert(d, 'hinzugefuegt')).toBe('Okt. 2026');
    expect(await blattLeeren(d, 'hinzugefuegt')).toBe(false);
    await vi.waitFor(() => expect(bfeld('hinzugefuegt')).toBeNull(), W);
    expect(wert(d, 'hinzugefuegt')).toBe('');
    expect((await gespeichert(id))?.eingetragenAm).toBeUndefined();
    expect(wert(await neustartAnzeige(id), 'hinzugefuegt')).toBe('');
  });

  it('[REQ-093/AK-6] „Beendet am“ 22.11.2026 leeren: kein Datum, Zeile leer, Status bleibt *gelesen*', async () => {
    const { d, id } = await mitBuch(buch({ status: 'gelesen', beendetAm: '2026-11-22' }));
    expect(wert(d, 'beendet')).not.toBe('');
    expect(await blattLeeren(d, 'beendet')).toBe(false);
    await vi.waitFor(() => expect(bfeld('beendet')).toBeNull(), W);
    expect(wert(d, 'beendet')).toBe('');
    const b = await gespeichert(id);
    expect(b?.beendetAm).toBeUndefined();
    expect(b?.status).toBe('gelesen');
  });

  describe('AK-7 Aktuelle Seite leeren', () => {
    const ALT = [{ zeitpunkt: '2026-11-20T08:00:00.000Z', seite: 60 }, { zeitpunkt: '2026-11-21T08:00:00.000Z', seite: 120 }];
    it.each([
      ['Seite', { aktuelleSeite: 120, fortschrittsmodus: 'seite' }],
      ['%', { fortschrittProzent: 30, fortschrittsmodus: 'prozent' }],
    ] as const)('[REQ-093/AK-7] Modus „%s“: Feld leeren und sichern → kein Fortschritt, Anzeige wie ohne Fortschritt, keine neue Sitzung', async (modus, felder) => {
      const { d, id } = await mitBuch(buch({ seitenanzahl: 400, sitzungen: ALT, ...felder } as Partial<Buch>), false);
      await tippe(d.querySelector('[role="progressbar"]')!);
      const dlg = await screen.findByRole('dialog', { name: 'Aktuelle Seite' }, W);
      await tippe(within(dlg).getByRole('button', { name: modus }));
      const f = within(dlg).queryAllByLabelText(modus === '%' ? 'Prozent' : 'Aktuelle Seite').find((e) => e.tagName === 'INPUT') as HTMLInputElement;
      fireEvent.change(f, { target: { value: '' } });
      await tippe(within(dlg).getByRole('button', { name: 'Sichern' }));
      await warte(60);
      expect(screen.queryByRole('dialog', { name: 'Aktuelle Seite' })).toBeNull();
      expect(norm(d.querySelector('[data-fortschritt-text]')?.textContent)).toBe('0 / 400');
      const b = await gespeichert(id);
      expect(b?.aktuelleSeite).toBeUndefined();
      expect(b?.fortschrittProzent).toBeUndefined();
      expect(b?.sitzungen).toEqual(ALT);
      const d2 = await neustartAnzeige(id, false);
      expect(norm(d2.querySelector('[data-fortschritt-text]')?.textContent)).toBe('0 / 400');
    });

    // REQ-093 entfernt nur den Fortschritt; der pro Buch gespeicherte Modus bleibt (REQ-024: „Kindle-Buch öffnet direkt in %“).
    it('[REQ-093/AK-7] Modus „%“ geleert: der gespeicherte Modus „%“ bleibt, das Menü öffnet wieder in „%“ (auch nach Neustart)', async () => {
      const { d, id } = await mitBuch(buch({ seitenanzahl: 400, fortschrittProzent: 30, fortschrittsmodus: 'prozent', sitzungen: ALT } as Partial<Buch>), false);
      await tippe(d.querySelector('[role="progressbar"]')!);
      const dlg = await screen.findByRole('dialog', { name: 'Aktuelle Seite' }, W);
      const f = within(dlg).queryAllByLabelText('Prozent').find((e) => e.tagName === 'INPUT') as HTMLInputElement;
      fireEvent.change(f, { target: { value: '' } });
      await tippe(within(dlg).getByRole('button', { name: 'Sichern' }));
      await warte(60);
      expect((await gespeichert(id))?.fortschrittsmodus).toBe('prozent');
      const d2 = await neustartAnzeige(id, false);
      await tippe(d2.querySelector('[role="progressbar"]')!);
      const dlg2 = await screen.findByRole('dialog', { name: 'Aktuelle Seite' }, W);
      expect(within(dlg2).getByRole('button', { name: '%' })).toHaveAttribute('aria-pressed', 'true');
    });
  });

  describe('AK-8 Eigene Rezension leeren', () => {
    const fenster = () => document.querySelector<HTMLElement>('[data-schreibfenster]');
    it('[REQ-093/AK-8] Rezension vollständig löschen und sichern: keine Rezension, „Deine Rezension“ im Zustand ohne Rezension, auch nach Neustart', async () => {
      const { d, id } = await mitBuch(buch({ rezension: 'Großartig' }), false);
      const feld = () => d.querySelector<HTMLElement>('[data-schreibfeld]')!;
      expect(feld().querySelector('[data-rezension-text]')?.textContent).toBe('Großartig');
      await tippe(feld());
      await vi.waitFor(() => expect(fenster()).not.toBeNull(), W);
      fireEvent.change(fenster()!.querySelector('[data-rezension-eingabe]')!, { target: { value: '' } });
      await tippe(fenster()!.querySelector('[data-rezension-sichern]')!);
      await vi.waitFor(() => expect(fenster()).toBeNull(), W);
      // Zustand ohne Rezension laut REQ-047 (Platzhalter „Wie fandest du es?“, siehe Testbericht zur Formulierung in AK-8).
      expect(feld().querySelector('[data-rezension-text]')).toBeNull();
      expect(norm(feld().querySelector('[data-schreibfeld-platzhalter]')?.textContent)).toBe('Wie fandest du es?');
      await warte(60);
      expect((await gespeichert(id))?.rezension).toBeUndefined();
      const d2 = await neustartAnzeige(id, false);
      expect(norm(d2.querySelector('[data-schreibfeld] [data-schreibfeld-platzhalter]')?.textContent)).toBe('Wie fandest du es?');
    });
  });

  describe('AK-9 Pflichtangaben bleiben Pflicht', () => {
    it.each(['', '   '])('[REQ-093/AK-9] Seiten 400, Feld „%s“ in „Buchlänge“ sichern: nichts gespeichert, bleibt 400', async (ein) => {
      const { d, id } = await mitBuch(buch({ seitenanzahl: 400 }));
      await tippe(zeile(d, 'seiten'));
      const dlg = await screen.findByRole('dialog', { name: 'Buchlänge' }, W);
      const f = dlg.querySelector<HTMLInputElement>('[aria-label="Seitenanzahl"]')!;
      await act(async () => {
        fireEvent.change(f, { target: { value: ein } });
      });
      await tippe(within(dlg).getByRole('button', { name: 'Sichern' }));
      await warte(60);
      expect(screen.queryByRole('dialog', { name: 'Buchlänge' })).not.toBeNull();
      expect(wert(d, 'seiten')).toBe('400');
      expect((await gespeichert(id))?.seitenanzahl).toBe(400);
    });
  });

  describe('AK-10 Schließen ohne Sichern verwirft das Leeren', () => {
    it.each(['X', 'Außen'])('[REQ-093/AK-10] Verlag „Carlsen“, Feld geleert, Schließen über %s: Verlag bleibt „Carlsen“', async (weg) => {
      const { d, id } = await mitBuch(buch({ verlag: 'Carlsen' }));
      await tippe(zeile(d, 'verlag'));
      await vi.waitFor(() => expect(bfeld('verlag')).not.toBeNull(), W);
      fireEvent.change(bfeld('verlag')!, { target: { value: '' } });
      if (weg === 'X') await tippe(bfeld('verlag')!.closest('[role="dialog"]')!.querySelector('[aria-label="Schließen"]')!);
      else await tippe(document.querySelector('[data-blatt-hintergrund]')!);
      await vi.waitFor(() => expect(bfeld('verlag')).toBeNull(), W);
      expect(wert(d, 'verlag')).toBe('Carlsen');
      expect((await gespeichert(id))?.verlag).toBe('Carlsen');
    });

    it('[REQ-093/AK-10] auch bei „Hinzugefügt“: geleert und über X geschlossen → Datum bleibt', async () => {
      const iso = new Date(2026, 9, 14, 12).toISOString();
      const { d, id } = await mitBuch(buch({ eingetragenAm: iso }));
      await tippe(zeile(d, 'hinzugefuegt'));
      await vi.waitFor(() => expect(bfeld('hinzugefuegt')).not.toBeNull(), W);
      fireEvent.change(bfeld('hinzugefuegt')!, { target: { value: '' } });
      await tippe(bfeld('hinzugefuegt')!.closest('[role="dialog"]')!.querySelector('[aria-label="Schließen"]')!);
      await vi.waitFor(() => expect(bfeld('hinzugefuegt')).toBeNull(), W);
      expect((await gespeichert(id))?.eingetragenAm).toBe(iso);
    });
  });

  describe('AK-11/AK-12 Reihenfolge im Abschnitt „Alle Bücher“', () => {
    const am = (tag: number) => new Date(Date.UTC(2026, 9, tag, 10)).toISOString();
    const titelInAlle = () => Array.from(document.querySelectorAll('[data-abschnitt="alle-buecher"] li[data-bucheintrag] [data-buchtitel]')).map((t) => norm(t.textContent));
    async function seite(w: Welt) {
      const BA = w.BA;
      render(<BA repository={w.repo} bildspeicher={bilder} bildquelle={quelle} jetzt={jetzt} />);
      await waitFor(() => expect(document.querySelector('[data-abschnitt="alle-buecher"] ul')).not.toBeNull(), W);
    }

    it('[REQ-093/AK-11] drei datierte Bücher und eines ohne Eintragungsdatum: das undatierte steht an erster Stelle, danach neueste zuerst', async () => {
      const w = await starte();
      for (const b of [buch({ titel: 'Alt', eingetragenAm: am(1) }), buch({ titel: 'Mitte', eingetragenAm: am(5) }), buch({ titel: 'Neu', eingetragenAm: am(9) }), buch({ titel: 'Ohne' })]) await w.repo.save(b);
      await seite(w);
      expect(titelInAlle()).toEqual(['Ohne', 'Neu', 'Mitte', 'Alt']);
    });

    it('[REQ-093/AK-11] Ablauf: „Hinzugefügt“ eines älteren Buches in den Details geleert → danach steht es in „Alle Bücher“ ganz oben', async () => {
      const zuLeeren = buch({ titel: 'Geleert', eingetragenAm: am(1) });
      const { d } = await mitBuch(zuLeeren);
      expect(await blattLeeren(d, 'hinzugefuegt')).toBe(false);
      await vi.waitFor(() => expect(bfeld('hinzugefuegt')).toBeNull(), W);
      await warte(60);
      cleanup();
      const w = await starte();
      for (const b of [buch({ titel: 'B', eingetragenAm: am(3) }), buch({ titel: 'C', eingetragenAm: am(5) }), buch({ titel: 'D', eingetragenAm: am(7) })]) await w.repo.save(b);
      await seite(w);
      expect(titelInAlle()).toEqual(['Geleert', 'D', 'C', 'B']);
    });

    it('[REQ-093/AK-12] „Zorn“ und „Asche“ ohne Eintragungsdatum: zuerst „Asche“, dann „Zorn“, danach die übrigen wie bisher', async () => {
      const w = await starte();
      for (const b of [
        buch({ titel: 'Zorn' }),
        buch({ titel: 'Erstes', eingetragenAm: am(2) }),
        buch({ titel: 'Asche' }),
        buch({ titel: 'Zweites', eingetragenAm: am(8) }),
      ]) await w.repo.save(b);
      await seite(w);
      expect(titelInAlle()).toEqual(['Asche', 'Zorn', 'Zweites', 'Erstes']);
    });

    it('[REQ-093/AK-12] A–Z ohne Rücksicht auf Groß-/Kleinschreibung: „asche“, „Birke“, „zorn“', async () => {
      const w = await starte();
      for (const b of [buch({ titel: 'zorn' }), buch({ titel: 'Birke' }), buch({ titel: 'asche' }), buch({ titel: 'Datiert', eingetragenAm: am(4) })]) await w.repo.save(b);
      await seite(w);
      expect(titelInAlle()).toEqual(['asche', 'Birke', 'zorn', 'Datiert']);
    });
  });
});
