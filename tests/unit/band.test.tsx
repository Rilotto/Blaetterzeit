import '@testing-library/jest-dom/vitest';
import { act, cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import ManuellerEintrag from '@/buchanlegen/ManuellerEintrag';
import { eingabenAusVorbelegung } from '@/buchanlegen/eingabe';
import { formatAus, openLibraryTrefferLesen } from '@/barcode/treffer';
import { bandnummerSetzen, neuesBuch, type Buch } from '@/domain/buch';
import { bandnummernAusAltenZugehoerigkeiten, neueListe } from '@/domain/listen';
import { InMemoryBookRepository } from '@/storage/InMemoryBookRepository';
import { InMemoryImageStore } from '@/storage/InMemoryImageStore';
import { InMemoryListenRepository } from '@/storage/InMemoryListenRepository';
import BuchDetails from '@/views/BuchDetails';

afterEach(() => cleanup());

const warte = () => act(async () => void (await new Promise((r) => setTimeout(r, 10))));
const tippe = async (el: Element | null) => {
  await act(async () => {
    fireEvent.click(el!);
    await new Promise((r) => setTimeout(r, 10));
  });
};
const gib = (el: Element | null, wert: string) => fireEvent.change(el!, { target: { value: wert } });
const q = <T extends Element = HTMLElement>(s: string) => document.querySelector<T>(s);
const b = (titel: string, f: Partial<Buch> = {}): Buch => ({ ...neuesBuch({ titel, status: 'ungelesen' }), ...f });

describe('Bandnummer je Buch (REQ-112)', () => {
  it('bandnummerSetzen: setzen, entfernen, ungültig entfernt', () => {
    const x = b('X');
    expect(bandnummerSetzen(x, 2).bandnummer).toBe(2);
    expect(bandnummerSetzen({ ...x, bandnummer: 2 }, undefined)).not.toHaveProperty('bandnummer');
    expect(bandnummerSetzen(x, 0)).not.toHaveProperty('bandnummer');
  });

  it('Übernahme alter Bandnummern (AK-10): eigene bleibt, sonst kleinste der Sagas, Sammlungen zählen nicht', () => {
    const r = bandnummernAusAltenZugehoerigkeiten(
      [{ id: 'A' }, { id: 'B', bandnummer: 2 }, { id: 'C' }, { id: 'D' }],
      new Set(['s1', 's2', 's3']),
      [
        { listeId: 's1', buchId: 'A', band: 3 },
        { listeId: 's2', buchId: 'B', band: 5 },
        { listeId: 's2', buchId: 'C', band: 4 },
        { listeId: 's3', buchId: 'C', band: 2 },
        { listeId: 'samm', buchId: 'D', band: 7 },
        { listeId: 's1', buchId: 'D', band: 0 },
      ],
    );
    expect([...r.entries()]).toEqual([
      ['A', 3],
      ['C', 2],
    ]);
  });

  async function details(buch: Buch, listen = new InMemoryListenRepository()) {
    const repo = new InMemoryBookRepository();
    await repo.save(buch);
    render(<BuchDetails buchId={buch.id} repository={repo} listenRepository={listen} bildspeicher={new InMemoryImageStore()} onZurueck={() => {}} />);
    await warte();
    await tippe(q('[data-reiter="details"]'));
    return { repo, listen };
  }

  it('Zeile „Band“ direkt unter „Exemplar“ mit Pfeil; Sichern, Leeren, ungültig, Schließen verwirft', async () => {
    const s = neueListe('saga', 'The Empyrean');
    const listen = new InMemoryListenRepository();
    await listen.listeSpeichern(s);
    const buch = b('Fourth Wing', { bandnummer: 1 });
    await listen.zuordnen({ listeId: s.id, buchId: buch.id });
    const { repo } = await details(buch, listen);
    const ids = [...document.querySelectorAll('[data-ausgabe-zeile]')].map((z) => z.getAttribute('data-ausgabe-zeile'));
    expect(ids[ids.indexOf('exemplar') + 1]).toBe('band');
    const zeile = () => q('[data-ausgabe-zeile="band"]')!;
    expect(zeile().querySelector('[data-zeile-wert]')).toHaveTextContent('1');
    expect(zeile().querySelector('[data-zeile-pfeil]')).not.toBeNull();
    // Ungültig: hervorgehoben, nichts gespeichert, Blatt bleibt offen.
    await tippe(zeile());
    for (const falsch of ['0', '-1', '1,5', 'abc']) {
      gib(q('[data-blatt-feld="band"]'), falsch);
      await tippe(q('[data-blatt-sichern="band"]'));
      expect(q('[data-blatt-feld="band"]')).toHaveAttribute('data-fehler', 'true');
    }
    expect((await repo.get(buch.id))?.bandnummer).toBe(1);
    gib(q('[data-blatt-feld="band"]'), '2');
    await tippe(q('[data-blatt-sichern="band"]'));
    expect(q('[data-blatt-feld="band"]')).toBeNull();
    expect(zeile().querySelector('[data-zeile-wert]')).toHaveTextContent('2');
    // Saga-Zeile unter dem Autor ohne Neustart (AK-5).
    expect(q(`[data-saga-zeile="${s.id}"]`)).toHaveTextContent('Band 2 · The Empyrean');
    await warte();
    expect((await repo.get(buch.id))?.bandnummer).toBe(2);
    // Schließen ohne Sichern verwirft (AK-4).
    await tippe(zeile());
    gib(q('[data-blatt-feld="band"]'), '5');
    await tippe(q('[data-blatt-hintergrund]'));
    expect(zeile().querySelector('[data-zeile-wert]')).toHaveTextContent('2');
    // Leeren (AK-3).
    await tippe(zeile());
    gib(q('[data-blatt-feld="band"]'), '');
    await tippe(q('[data-blatt-sichern="band"]'));
    expect(zeile().querySelector('[data-zeile-wert]')!.textContent).toBe('');
    expect(q(`[data-saga-zeile="${s.id}"]`)).toHaveTextContent(/^The Empyrean$/);
    await warte();
    expect(await repo.get(buch.id)).not.toHaveProperty('bandnummer');
  });

  it('Blatt „Zu einer Saga hinzufügen“: genau ein Feld „Band“, vorausgefüllt; Sichern setzt die Bandnummer des Buches (REQ-096)', async () => {
    const e = neueListe('saga', 'The Empyrean');
    const c = neueListe('saga', 'Crescent City');
    const listen = new InMemoryListenRepository();
    await listen.listeSpeichern(e);
    await listen.listeSpeichern(c);
    const { repo } = await details(b('Fourth Wing', { bandnummer: 3 }), listen);
    await tippe(q('[data-listen-pille="saga"]'));
    expect(q('[data-band-feld]')).toBeNull();
    await tippe(q(`[data-haekchen="${e.id}"]`));
    await tippe(q(`[data-haekchen="${c.id}"]`));
    expect(document.querySelectorAll('[data-band-feld]')).toHaveLength(1);
    expect(q<HTMLInputElement>('[data-band-feld]')!.value).toBe('3');
    gib(q('[data-band-feld]'), '4');
    await tippe(q('[data-blatt-sichern="liste"]'));
    await warte();
    expect([...document.querySelectorAll('[data-saga-zeile]')].map((z) => z.textContent)).toEqual(['Band 4 · Crescent City', 'Band 4 · The Empyrean']);
    expect((await repo.list())[0].bandnummer).toBe(4);
    expect(await listen.zugehoerigkeiten()).toHaveLength(2);
  });
});

describe('Manueller Eintrag: Zeile „Band“ (REQ-112, AK-8/AK-9)', () => {
  function starte(vorbelegung?: Parameters<typeof ManuellerEintrag>[0]['vorbelegung']) {
    const repo = new InMemoryBookRepository();
    render(<ManuellerEintrag repository={repo} bildspeicher={new InMemoryImageStore()} vorbelegung={vorbelegung} onZurueck={() => {}} onAngelegt={() => {}} />);
    return { repo, blatt: screen.getByRole('dialog', { name: 'Manueller Eintrag' }) };
  }
  const bandWert = (blatt: HTMLElement) => blatt.querySelector('[data-ausgabe-zeile="band"] [data-zeile-wert]')!.textContent;

  it('Band eintragen und mit dem Buch anlegen', async () => {
    const { repo, blatt } = starte();
    const ids = [...blatt.querySelectorAll('[data-ausgabe-zeile]')].map((z) => z.getAttribute('data-ausgabe-zeile'));
    expect(ids[ids.indexOf('exemplar') + 1]).toBe('band');
    fireEvent.change(within(blatt).getByLabelText('Titel'), { target: { value: 'T' } });
    fireEvent.change(within(blatt).getByLabelText('Seiten'), { target: { value: '300' } });
    await tippe(blatt.querySelector('[data-ausgabe-zeile="band"]'));
    gib(q('[data-blatt-feld="band"]'), '2');
    await tippe(q('[data-blatt-sichern="band"]'));
    expect(bandWert(blatt)).toBe('2');
    await tippe(within(blatt).getByRole('button', { name: 'Hinzufügen' }));
    expect((await repo.list())[0].bandnummer).toBe(2);
  });

  it('Band aus dem Scan übernommen, ungültige Angabe nicht', () => {
    cleanup();
    const { blatt } = starte({ titel: 'T', bandnummer: 2 });
    expect(bandWert(blatt)).toBe('2');
    cleanup();
    const zweiter = starte({ titel: 'T', bandnummer: 1.5 });
    expect(bandWert(zweiter.blatt)).toBe('');
  });
});

describe('Format und Standardmaße nach dem Scan (REQ-062 AK-10, REQ-077 AK-8 bis AK-10)', () => {
  it('Formatangaben: Paperback, Hardcover (beliebige Schreibweise), sonst leer', () => {
    expect(formatAus('Paperback')).toEqual({ format: 'print', unterformat: 'taschenbuch' });
    expect(formatAus('Hardcover')).toEqual({ format: 'print', unterformat: 'hardcover' });
    expect(formatAus('hardcover')).toEqual({ format: 'print', unterformat: 'hardcover' });
    expect(formatAus('HARDBACK')).toEqual({ format: 'print', unterformat: 'hardcover' });
    expect(formatAus('gebunden')).toEqual({ format: 'print', unterformat: 'hardcover' });
    expect(formatAus('Broschur')).toEqual({ format: 'print', unterformat: 'taschenbuch' });
    expect(formatAus('Audio CD')).toEqual({});
    expect(formatAus('Kindle Edition')).toEqual({});
  });

  it('Open Library jscmd=details: Format, Maße, Reihe und Autor aus „details“', () => {
    const json = JSON.stringify({
      'ISBN:9781649374042': {
        bib_key: 'ISBN:9781649374042',
        thumbnail_url: 'https://covers.openlibrary.org/b/id/123-S.jpg',
        details: {
          title: 'Fourth Wing',
          authors: [{ key: '/authors/OL1A', name: 'Rebecca Yarros' }],
          publishers: ['Entangled: Red Tower Books'],
          number_of_pages: 528,
          physical_format: 'Hardcover',
          physical_dimensions: '9.25 x 6.25 x 1.75 inches',
          series: ['The Empyrean ; 1'],
          isbn_13: ['9781649374042'],
          covers: [123],
        },
      },
    });
    const [t] = openLibraryTrefferLesen(json, '9781649374042');
    expect(t.angaben).toMatchObject({ titel: 'Fourth Wing', autor: 'Rebecca Yarros', format: 'print', unterformat: 'hardcover', seitenanzahl: 528, reihe: 'The Empyrean', bandnummer: 1 });
    expect(t.angaben.hoeheMm).toBe(235);
    expect(t.coverUrl).toBe('https://covers.openlibrary.org/b/id/123-L.jpg');
  });

  it('Manueller Eintrag aus dem Scan: Hardcover ohne Maße → Hardcover-Vorschlag; ohne Format → Taschenbuch', () => {
    const vorschlag = (v: Parameters<typeof eingabenAusVorbelegung>[0]) => {
      cleanup();
      render(<ManuellerEintrag repository={new InMemoryBookRepository()} bildspeicher={new InMemoryImageStore()} vorbelegung={v} onZurueck={() => {}} onAngelegt={() => {}} />);
      return q('[data-ausgabe-zeile="masse"] [data-zeile-wert]')!.textContent;
    };
    expect(vorschlag({ titel: 'T', seitenanzahl: 400, ...formatAus('Hardcover') })).toBe('ca. 14,8 × 21,0 × 2,8 cm');
    expect(vorschlag({ titel: 'T', seitenanzahl: 400, ...formatAus('Paperback') })).toBe('ca. 12,0 × 19,0 × 2,4 cm');
    expect(vorschlag({ titel: 'T', seitenanzahl: 400 })).toBe('ca. 12,0 × 19,0 × 2,4 cm');
  });
});

describe('Teilmaße mit Standardwerten ergänzt (REQ-072 AK-2/AK-4, REQ-077 AK-10)', () => {
  it('Zeile zeigt „ca. …“ mit Standardwerten für fehlende Einzelwerte, vollständige ohne „ca.“; Blatt nur mit hinterlegten Werten', async () => {
    const { masseVorschlagText, masseVollstaendig, masseVorbefuellung } = await import('@/buchdetails/masse');
    const hc = { format: 'print', unterformat: 'hardcover', seitenanzahl: 400 } as const;
    expect(masseVorschlagText({ ...hc, hoeheMm: 240 })).toBe('ca. 14,8 × 24,0 × 2,8 cm');
    expect(masseVorschlagText({ seitenanzahl: 400, breiteMm: 135 })).toBe('ca. 13,5 × 19,0 × 2,4 cm');
    expect(masseVollstaendig({ breiteMm: 135, hoeheMm: 210 })).toBe(false);
    expect(masseVollstaendig({ breiteMm: 135, hoeheMm: 210, dickeMm: 32 })).toBe(true);
    expect(masseVorbefuellung({ ...hc, hoeheMm: 240 })).toEqual({ breiteMm: undefined, hoeheMm: 240, dickeMm: undefined });
    const repo = new InMemoryBookRepository();
    const buch = b('HC', { ...hc, hoeheMm: 240 });
    await repo.save(buch);
    render(<BuchDetails buchId={buch.id} repository={repo} listenRepository={new InMemoryListenRepository()} bildspeicher={new InMemoryImageStore()} onZurueck={() => {}} />);
    await warte();
    await tippe(q('[data-reiter="details"]'));
    const wert = q('[data-ausgabe-zeile="masse"] [data-zeile-wert]')!;
    expect(wert.textContent).toBe('ca. 14,8 × 24,0 × 2,8 cm');
    expect(wert).toHaveAttribute('data-zeile-vorschlag', 'true');
    expect(await repo.get(buch.id)).toMatchObject({ hoeheMm: 240 });
    expect((await repo.get(buch.id))?.breiteMm).toBeUndefined();
  });
});
