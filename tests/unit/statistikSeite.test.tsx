import '@testing-library/jest-dom/vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { neuesBuch, type Buch } from '@/domain/buch';
import { InMemoryEinstellungRepository } from '@/storage/InMemoryEinstellungRepository';
import { InMemoryImageStore } from '@/storage/InMemoryImageStore';
import StatistikAnsicht from '@/views/StatistikAnsicht';

afterEach(cleanup);

const um = (j: number, m: number, t: number, h = 12) => new Date(j, m - 1, t, h);
const iso = (j: number, m: number, t: number, h = 12) => um(j, m, t, h).toISOString();
const HEUTE = um(2026, 11, 22);
const buch = (extra: Partial<Buch> = {}): Buch => ({ ...neuesBuch({ titel: 'B', status: 'am_lesen' }), ...extra });

const $ = (sel: string) => document.querySelector<HTMLElement>(sel);
const $$ = (sel: string) => Array.from(document.querySelectorAll<HTMLElement>(sel));

function zeige(buecher: Buch[] = [], einstellung = new InMemoryEinstellungRepository()) {
  render(
    <StatistikAnsicht buecher={buecher} einstellungRepository={einstellung} bildspeicher={new InMemoryImageStore()} jetzt={() => HEUTE} />,
  );
  return einstellung;
}

describe('Seite „Statistik“ (Teil B)', () => {
  it('Kopf, drei Pillen, Wochentitel, Kalender MO–SO mit heute umrandet', async () => {
    zeige();
    expect(screen.getByRole('heading', { name: 'Dein Lesen' })).toBeInTheDocument();
    expect($$('[data-zeitraum-pille]').map((p) => p.textContent)).toEqual(['Wöchentlich', 'Monatlich', 'Jährlich']);
    await waitFor(() => expect($('[data-zeitraum-pille="woche"]')).toHaveAttribute('aria-pressed', 'true'));
    expect($('[data-zeitraum-zeile1]')).toHaveTextContent('16 – 22 Nov');
    expect($('[data-zeitraum-zeile2]')).toHaveTextContent('2026');
    expect($$('[data-kalender-wochentag]').map((e) => e.textContent).join(' ')).toBe('MO DI MI DO FR SA SO');
    expect($$('[data-kalender-tag]').map((e) => e.dataset.tag)).toEqual(['16', '17', '18', '19', '20', '21', '22']);
    expect($$('[data-kalender-tag][data-heute="true"]').map((e) => e.dataset.tag)).toEqual(['22']);
    expect($$('[data-balken]')).toHaveLength(7);
    expect($('[data-lesetage-text]')).toHaveTextContent('0 von 7 Tagen gelesen');
    expect($('[data-serie-text]')).toHaveTextContent('Serie 0 Tage');
  });

  it('Wahl der Pille wird gemerkt, Blättern zurück und in die Zukunft', async () => {
    const repo = zeige();
    fireEvent.click($('[data-zeitraum-pille="jahr"]')!);
    await waitFor(async () => expect(await repo.lesen('statistikZeitraum')).toBe('jahr'));
    cleanup();
    zeige([], repo);
    await waitFor(() => expect($('[data-zeitraum-pille="jahr"]')).toHaveAttribute('aria-pressed', 'true'));
    expect($('[data-zeitraum-zeile1]')).toHaveTextContent('2026');
    expect($('[data-zeitraum-zeile2]')).toBeNull();
    expect($$('[data-mini-monat]')).toHaveLength(12);
    expect($$('[data-mini-tag][data-heute="true"]').map((e) => e.dataset.miniTag)).toEqual(['2026-11-22']);
    fireEvent.click($('[data-zeitraum-vor]')!);
    expect($('[data-zeitraum-zeile1]')).toHaveTextContent('2027');
    fireEvent.click($('[data-zeitraum-pille="monat"]')!);
    fireEvent.click($('[data-zeitraum-zurueck]')!);
    expect($('[data-zeitraum-zeile1]')).toHaveTextContent('Oktober');
    expect($$('[data-balken]')).toHaveLength(31);
  });

  it('Kacheln steuern Kennzahl, Vergleich und Diagramm; Stapel Primär/Gold', async () => {
    const beendet = buch({ status: 'gelesen', beendetAm: '2026-10-12', seitenanzahl: 300, sitzungen: [{ zeitpunkt: iso(2026, 10, 1), seite: 100 }] });
    zeige([beendet]);
    fireEvent.click($('[data-zeitraum-pille="jahr"]')!);
    expect($('[data-kachel="seiten"] [data-kachel-wert]')).toHaveTextContent('300');
    expect($('[data-kennzahl-einheit]')).toHaveTextContent('Seiten');
    expect($('[data-vergleich]')).toHaveTextContent('+300 vs. 2025');
    const okt = $('[data-balken="9"]')!;
    expect(okt.querySelector('[data-balken-teil="sessions"]')).toHaveAttribute('data-wert', '100');
    expect(okt.querySelector<HTMLElement>('[data-balken-teil="beendet"]')!.style.backgroundColor).toBe('var(--bz-farbe-gold)');
    expect($('[data-legende]')).toHaveTextContent('in Sessions');
    expect($('[data-legende]')!.textContent).not.toContain('›');
    fireEvent.click($('[data-kachel="buecher"]')!);
    expect($('[data-kachel="buecher"]')).toHaveAttribute('aria-pressed', 'true');
    expect($('[data-kennzahl-wert]')).toHaveTextContent('1');
    expect($('[data-kennzahl-einheit]')).toHaveTextContent('beendet');
    expect($('[data-vergleich]')).toHaveTextContent('+1 vs. 2025');
    expect($$('[data-balken]').map((b) => b.dataset.wert)).toEqual(['0', '0', '0', '0', '0', '0', '0', '0', '0', '1', '0', '0']);
    expect($('[data-legende]')).toBeNull();
    const oben = Math.max(...$$('[data-hilfslinie]').map((l) => Number(l.dataset.hilfslinie)));
    expect(oben).toBeGreaterThanOrEqual(1);
    // Gefülltes Feld am Sitzungstag, nicht am Tag „Beendet am“.
    expect($$('[data-mini-tag][data-gefuellt="true"]').map((p) => p.dataset.miniTag)).toEqual(['2026-10-01']);
  });

  it('Kalender: Cover des Buches mit der letzten Sitzung des Tages', () => {
    const a = buch({ titel: 'A', sitzungen: [{ zeitpunkt: iso(2026, 11, 18, 9), seite: 10 }] });
    const b = buch({ titel: 'B', sitzungen: [{ zeitpunkt: iso(2026, 11, 18, 21), seite: 10 }] });
    zeige([a, b]);
    expect($('[data-kalender-tag="2026-11-18"]')).toHaveAttribute('data-buch-id', b.id);
    expect($$('[data-kalender-tag][data-gelesen="true"]')).toHaveLength(1);
    expect(document.body.textContent).not.toMatch(/Mehrere Bücher/);
    expect($('[data-lesetage-text]')).toHaveTextContent('1 von 7 Tagen gelesen');
  });
});
