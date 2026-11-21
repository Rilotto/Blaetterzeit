import '@testing-library/jest-dom/vitest';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { dnbMasseAus, openLibraryMasseAus, openLibraryTrefferLesen } from '@/barcode/treffer';
import { buchAusEingaben, eingabenAusVorbelegung, LEERE_EINGABEN } from '@/buchanlegen/eingabe';
import BlattMasse from '@/buchdetails/BlattMasse';
import { FEINJUSTIERUNG, LUPE, feinjustiert, lupenSeite } from '@/buchdetails/feinjustierung';
import { darstellungsMasse, seitenverhaeltnis } from '@/buchdetails/masse';
import Zuschnitt from '@/buchdetails/Zuschnitt';
import { cmZuMm, massPruefen, masseText } from '@/domain/ausgabe';
import { buchAusDaten } from '@/domain/buch';

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe('Maße: Prüfen und Anzeige (REQ-072)', () => {
  it.each([
    ['', undefined],
    ['13.5', 135],
    ['13,5', 135],
    [' 21 ', 210],
    ['0,1', 1],
  ])('gültig: „%s“ → %s mm', (e, mm) => expect(massPruefen(e)).toEqual({ ok: true, ...(mm === undefined ? {} : { mm }) }));

  it.each(['0', '0,0', '-2', 'abc', '13,55', '1,2,3', '13,'])('ungültig: „%s“', (e) => expect(massPruefen(e).ok).toBe(false));

  it('Text der Zeile', () => {
    expect(masseText({})).toBe('');
    expect(masseText({ breiteMm: 135, hoeheMm: 210, dickeMm: 32 })).toBe('13,5 × 21,0 × 3,2 cm');
    expect(masseText({ hoeheMm: 210 })).toBe('– × 21,0 × – cm');
  });

  it('nur ganze Millimeter > 0 werden gelesen; Eingaben und Vorbelegung übernehmen die Maße', () => {
    const b = buchAusDaten({ id: 'x', titel: 'T', status: 'ungelesen', breiteMm: 135, hoeheMm: 0, dickeMm: 2.5 });
    expect(b).toEqual({ id: 'x', titel: 'T', status: 'ungelesen', breiteMm: 135 });
    const e = eingabenAusVorbelegung({ titel: 'T', seitenanzahl: 10, hoeheMm: 210, breiteMm: -1 });
    expect(e.hoeheMm).toBe(210);
    expect(e.breiteMm).toBeUndefined();
    const neu = buchAusEingaben({ ...LEERE_EINGABEN, titel: 'T', seiten: '10', dickeMm: 25 });
    expect(neu.dickeMm).toBe(25);
    expect(cmZuMm(21.04)).toBe(210);
  });
});

describe('Maße aus Quellen (REQ-072, AK-8)', () => {
  it.each([
    ['21 cm', { hoeheMm: 210 }],
    ['21,5 cm', { hoeheMm: 215 }],
    ['19 cm + 1 CD', { hoeheMm: 190 }],
    ['210 mm', { hoeheMm: 210 }],
    ['24 x 17 cm', {}],
    ['8°', {}],
    ['', {}],
    [undefined, {}],
  ])('DNB 300 $c „%s“', (c, soll) => expect(dnbMasseAus(c)).toEqual(soll));

  it.each([
    ['20 x 13 x 2 centimeters', { breiteMm: 130, hoeheMm: 200, dickeMm: 20 }],
    ['2 x 20 x 13 cm', { breiteMm: 130, hoeheMm: 200, dickeMm: 20 }],
    ['7.8 x 5.1 x 1.2 inches', { breiteMm: 130, hoeheMm: 198, dickeMm: 30 }],
    ['20 x 13 centimeters', {}],
    ['20 x 13 x 2 furlongs', {}],
  ])('Open Library „%s“', (d, soll) => expect(openLibraryMasseAus(d)).toEqual(soll));

  it('Open-Library-Treffer enthält eindeutige Maße', () => {
    const json = JSON.stringify({ 'ISBN:1': { title: 'T', physical_dimensions: '20 x 13 x 2 cm' } });
    expect(openLibraryTrefferLesen(json, '9783551551672')[0].angaben).toMatchObject({ breiteMm: 130, hoeheMm: 200, dickeMm: 20 });
  });
});

describe('Blatt „Maße“ (REQ-072)', () => {
  it('vorbefüllt, Teil-Eingabe sichern, ungültige Felder markiert', () => {
    const sichern = vi.fn();
    render(<BlattMasse masse={{ hoeheMm: 210 }} onSichern={sichern} onSchliessen={() => {}} />);
    const feld = (id: string) => document.querySelector<HTMLInputElement>(`[data-mass-feld="${id}"]`)!;
    expect(feld('hoehe').value).toBe('21,0');
    expect(screen.getByText('in Zentimetern')).toBeTruthy();
    fireEvent.change(feld('breite'), { target: { value: '13,55' } });
    fireEvent.change(feld('dicke'), { target: { value: 'abc' } });
    fireEvent.click(document.querySelector('[data-masse-sichern]')!);
    expect(sichern).not.toHaveBeenCalled();
    expect(feld('breite')).toHaveAttribute('data-fehler', 'true');
    expect(feld('dicke')).toHaveAttribute('data-fehler', 'true');
    expect(feld('hoehe')).not.toHaveAttribute('data-fehler');
    fireEvent.change(feld('breite'), { target: { value: '13.5' } });
    fireEvent.change(feld('dicke'), { target: { value: '' } });
    fireEvent.change(feld('hoehe'), { target: { value: '' } });
    fireEvent.click(document.querySelector('[data-masse-sichern]')!);
    expect(sichern).toHaveBeenCalledWith({ breiteMm: 135 });
  });

  it('Herunterziehen am Ziehgriff schließt ohne Speichern', () => {
    const sichern = vi.fn();
    const schliessen = vi.fn();
    render(<BlattMasse masse={{}} onSichern={sichern} onSchliessen={schliessen} />);
    const griff = document.querySelector<HTMLElement>('[data-ziehgriff]')!;
    fireEvent.pointerDown(griff, { clientY: 10, pointerId: 1 });
    fireEvent.pointerMove(griff, { clientY: 200, pointerId: 1 });
    fireEvent.pointerUp(griff, { clientY: 200, pointerId: 1 });
    expect(schliessen).toHaveBeenCalled();
    expect(sichern).not.toHaveBeenCalled();
  });
});

describe('Proportionen (REQ-073)', () => {
  it('Verhältnisse aus Maßen, Standardwerte je fehlendem Wert', () => {
    const d = darstellungsMasse({ breiteMm: 120, hoeheMm: 180, dickeMm: 40 });
    expect(d.cover / d.hoehe).toBeCloseTo(12 / 18, 6);
    expect(d.schmal / d.cover).toBeCloseTo(4 / 12, 6);
    const s = darstellungsMasse({});
    expect(s.cover / s.hoehe).toBeCloseTo(13.5 / 21, 6);
    expect(s.schmal / s.hoehe).toBeCloseTo(2.5 / 21, 6);
    const n = darstellungsMasse({ dickeMm: 50 });
    expect(n.schmal / n.cover).toBeCloseTo(5 / 13.5, 6);
    expect(seitenverhaeltnis('ruecken', { dickeMm: 50 })).toBeCloseTo(5 / 21, 6);
  });

  it('sehr breite Bücher werden kleiner dargestellt, Verhältnisse bleiben', () => {
    const d = darstellungsMasse({ breiteMm: 400, hoeheMm: 200, dickeMm: 50 });
    expect(d.cover + 2 * d.schmal).toBeLessThanOrEqual(340);
    expect(d.cover / d.hoehe).toBeCloseTo(2, 6);
  });
});

describe('Feinjustierung und Lupe (REQ-070)', () => {
  it('schnell 1:1, langsam um den Faktor, Zeit 0 gilt als schnell', () => {
    expect(feinjustiert(10, 0, 1)).toEqual({ dx: 10, dy: 0, langsam: false });
    expect(feinjustiert(0, 0, 0)).toEqual({ dx: 0, dy: 0, langsam: false });
    expect(feinjustiert(10, 0, 0).langsam).toBe(false);
    const l = feinjustiert(2, -2, 1000);
    expect(l.langsam).toBe(true);
    expect(l.dx).toBeCloseTo(2 * FEINJUSTIERUNG.faktor);
    expect(l.dy).toBeCloseTo(-2 * FEINJUSTIERUNG.faktor);
    expect(lupenSeite(0.2)).toBe('rechts');
    expect(lupenSeite(0.8)).toBe('links');
  });

  it('Lupe nur beim Ziehen, gegenüberliegende Seite, langsames Ziehen verschiebt feiner', () => {
    vi.spyOn(Element.prototype, 'getBoundingClientRect').mockReturnValue({
      x: 0, y: 0, left: 0, top: 0, right: 400, bottom: 600, width: 400, height: 600, toJSON: () => ({}),
    } as DOMRect);
    let t = 0;
    render(<Zuschnitt bild="data:image/png;base64,AA==" bereich="cover" uhr={() => t} onBestaetigen={() => {}} onZurueck={() => {}} />);
    const ecke = (i: number) => document.querySelector<HTMLElement>(`[data-eckpunkt="${i}"]`)!;
    const lupe = () => document.querySelector<HTMLElement>('[data-lupe]');
    expect(lupe()).toBeNull();
    const x0 = Number(ecke(0).dataset.x);
    fireEvent.pointerDown(ecke(0), { clientX: 100, clientY: 100, pointerId: 1 });
    expect(lupe()).toHaveAttribute('data-lupe-seite', 'rechts');
    expect(lupe()!.style.width).toBe(`${LUPE.durchmesser}px`);
    expect(lupe()!.querySelector('[data-fadenkreuz]')).not.toBeNull();
    expect(lupe()!.querySelector('[data-rahmenlinie]')).not.toBeNull();
    t = 1000;
    act(() => {
      fireEvent.pointerMove(ecke(0), { clientX: 120, clientY: 100, pointerId: 1 });
    });
    expect(Number(ecke(0).dataset.x) - x0).toBeCloseTo((20 * FEINJUSTIERUNG.faktor) / 400, 3);
    expect(lupe()!.dataset.lupeX).toBe(ecke(0).dataset.x);
    t = 1001;
    act(() => {
      fireEvent.pointerMove(ecke(0), { clientX: 160, clientY: 100, pointerId: 1 });
    });
    expect(Number(ecke(0).dataset.x) - x0).toBeCloseTo((20 * FEINJUSTIERUNG.faktor + 40) / 400, 3);
    fireEvent.pointerUp(ecke(0), { clientX: 160, clientY: 100, pointerId: 1 });
    expect(lupe()).toBeNull();
    fireEvent.pointerDown(ecke(1), { clientX: 300, clientY: 100, pointerId: 1 });
    expect(lupe()).toHaveAttribute('data-lupe-seite', 'links');
    fireEvent.pointerUp(ecke(1), { pointerId: 1 });
  });
});
