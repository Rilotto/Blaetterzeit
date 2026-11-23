/**
 * Akzeptanztests REQ-084 – Seiten „in Sessions“ und „aus beendeten Büchern“, gestapelt mit Legende.
 * Abgeleitet aus dem REQ-Text. Sitzungen entstehen über die öffentliche Fachfunktion fortschrittSichern (REQ-024),
 * Statuswechsel über statusSetzen (REQ-085). Schnittstellen laut Entwickler (Sprint 09): Sitzung.seite,
 * [data-balken][data-wert], [data-balken-teil=sessions|beendet][data-wert], [data-legende].
 */
import '@testing-library/jest-dom/vitest';
import { act, cleanup, fireEvent, render, waitFor } from '@testing-library/react';
import type { CSSProperties } from 'react';
import { afterEach, describe, expect, it } from 'vitest';
import { statusSetzen, type Buch, type Fortschrittsmodus } from '@/domain/buch';
import { fortschrittSichern } from '@/domain/fortschritt';
import { InMemoryEinstellungRepository } from '@/storage';
import { InMemoryImageStore } from '@/storage/InMemoryImageStore';
import { farbVariablen } from '@/theme';
import StatistikAnsicht from '@/views/StatistikAnsicht';

afterEach(cleanup);

const W = { timeout: 4000 };
const um = (j: number, m: number, t: number, h = 12) => new Date(j, m - 1, t, h);
let nr = 0;
const buch = (f: Partial<Buch> = {}): Buch => ({ id: `b84-${++nr}`, titel: 'Testbuch', status: 'am_lesen', ...f });
const HEUTE = um(2026, 11, 22, 20); // Sonntag; Woche 16.–22.11.
const $ = (s: string) => document.querySelector<HTMLElement>(s);
const $$ = (s: string) => Array.from(document.querySelectorAll<HTMLElement>(s));
const norm = (t: string | null | undefined) => (t ?? '').replace(/[\s  ]+/g, ' ').trim();
async function tippe(el: Element | null) {
  expect(el).not.toBeNull();
  await act(async () => {
    fireEvent.click(el!);
    await new Promise((r) => setTimeout(r, 5));
  });
}
async function zeige(buecher: Buch[], art: 'woche' | 'monat' | 'jahr', heute = HEUTE, vars: Record<string, string> = {}) {
  const repo = new InMemoryEinstellungRepository();
  await repo.speichern('statistikZeitraum', art);
  render(
    <div data-testwurzel="" style={{ ...farbVariablen(), ...vars } as CSSProperties}>
      <StatistikAnsicht buecher={buecher} einstellungRepository={repo} bildspeicher={new InMemoryImageStore()} jetzt={() => heute} />
    </div>,
  );
  await waitFor(() => expect($(`[data-zeitraum-pille="${art}"]`)).toHaveAttribute('aria-pressed', 'true'), W);
}
function farbe(ausdruck: string) {
  const p = document.createElement('span');
  p.style.setProperty('color', ausdruck);
  $('[data-testwurzel]')!.appendChild(p);
  const w = getComputedStyle(p).color;
  p.remove();
  return w;
}
/** Folge von Sicherungen im Menü „Aktuelle Seite“ (Wert, Zeitpunkt). */
function lies(b: Buch, schritte: [number, Date][], modus: Fortschrittsmodus = 'seite'): Buch {
  return schritte.reduce((x, [wert, zeit]) => fortschrittSichern(x, modus, wert, zeit), b);
}
const teil = (i: number, art: 'sessions' | 'beendet') => {
  const t = $$('[data-balken]')[i].querySelector(`[data-balken-teil="${art}"]`);
  return t ? Number(t.getAttribute('data-wert')) : 0;
};
const seitenKachel = () => norm($('[data-kachel="seiten"] [data-kachel-wert]')!.textContent);

describe('REQ-084 Seiten in Sessions und aus beendeten Büchern', () => {
  it('[REQ-084/AK-1] Sitzung speichert die Seitenzahl (Daten)', () => {
    const b = lies(buch({ seitenanzahl: 400 }), [
      [20, um(2026, 11, 16, 9)],
      [50, um(2026, 11, 16, 18)],
    ]);
    expect(b.sitzungen?.map((s) => s.seite)).toEqual([20, 50]);
  });

  it('[REQ-084/AK-1] 400 Seiten, Montag Seite 20 und 50, Dienstag 80: Montag 50, Dienstag 30 in Sessions', async () => {
    const b = lies(buch({ seitenanzahl: 400 }), [
      [20, um(2026, 11, 16, 9)],
      [50, um(2026, 11, 16, 18)],
      [80, um(2026, 11, 17, 8)],
    ]);
    await zeige([b], 'woche');
    expect(teil(0, 'sessions')).toBe(50);
    expect(teil(1, 'sessions')).toBe(30);
    expect($$('[data-balken]').map((e) => Number(e.getAttribute('data-wert')))).toEqual([50, 30, 0, 0, 0, 0, 0]);
    expect(seitenKachel()).toBe('80');
  });

  it('[REQ-084/AK-1] Bezug ist die letzte Sitzung vor dem Tag, auch aus einer früheren Woche', async () => {
    const b = lies(buch({ seitenanzahl: 400 }), [
      [100, um(2026, 11, 5)],
      [130, um(2026, 11, 18)],
    ]);
    await zeige([b], 'woche');
    expect(teil(2, 'sessions')).toBe(30);
    expect(seitenKachel()).toBe('30');
  });

  it('[REQ-084/AK-1] mehrere Bücher am selben Tag werden addiert', async () => {
    const a = lies(buch({ seitenanzahl: 400 }), [[40, um(2026, 11, 18, 9)]]);
    const b = lies(buch({ seitenanzahl: 200 }), [[25, um(2026, 11, 18, 21)]]);
    await zeige([a, b], 'woche');
    expect(teil(2, 'sessions')).toBe(65);
  });

  it('[REQ-084/AK-2] Modus „%“: 400 Seiten, heute 10 % ohne frühere Sitzung → heute 40 in Sessions', async () => {
    const b = lies(buch({ seitenanzahl: 400 }), [[10, um(2026, 11, 22, 10)]], 'prozent');
    expect(b.sitzungen?.[0].seite).toBe(40);
    await zeige([b], 'woche');
    expect(teil(6, 'sessions')).toBe(40);
    expect(seitenKachel()).toBe('40');
  });

  it.each([
    [330, 15, 50], // 49,5 → 50 (kaufmännisch)
    [333, 10, 33], // 33,3 → 33
    [301, 50, 151], // 150,5 → 151
  ])('[REQ-084/AK-2] Modus „%“ kaufmännisch gerundet: %i Seiten × %i %% → %i', (seiten, prozent, erwartet) => {
    const b = lies(buch({ seitenanzahl: seiten }), [[prozent, um(2026, 11, 22)]], 'prozent');
    expect(b.sitzungen?.[0].seite).toBe(erwartet);
  });

  it('[REQ-084/AK-3] 300 Seiten ohne Sitzungen, *gelesen*, „Beendet am“ 05.03.2026: Balken „M“ 300 aus beendeten, 0 in Sessions; Kachel 300', async () => {
    await zeige([buch({ status: 'gelesen', seitenanzahl: 300, beendetAm: '2026-03-05' })], 'jahr');
    expect($$('[data-balken]')[2].getAttribute('data-beschriftung')).toBe('M');
    expect(teil(2, 'beendet')).toBe(300);
    expect(teil(2, 'sessions')).toBe(0);
    expect(Number($$('[data-balken]')[2].getAttribute('data-wert'))).toBe(300);
    expect(seitenKachel()).toBe('300');
  });

  it('[REQ-084/AK-3] beendetes Buch ohne Seitenanzahl trägt 0 Seiten bei; nicht *gelesenes* Buch trägt keine Restseiten bei', async () => {
    await zeige(
      [buch({ status: 'gelesen', beendetAm: '2026-03-05' }), buch({ status: 'abgebrochen', seitenanzahl: 500, beendetAm: '2026-04-05' })],
      'jahr',
    );
    expect(seitenKachel()).toBe('0');
    expect($$('[data-balken-teil]')).toHaveLength(0);
  });

  it('[REQ-084/AK-4] 400 Seiten, Sitzungen bis 250 im Oktober, dann *gelesen* am 10.11.2026: 250 in Sessions (Okt.), 150 aus beendeten (Nov.), insgesamt 400', async () => {
    let b = lies(buch({ seitenanzahl: 400 }), [
      [100, um(2026, 10, 5)],
      [250, um(2026, 10, 20)],
    ]);
    b = statusSetzen(b, 'gelesen', um(2026, 11, 10, 18));
    expect(b.beendetAm).toBe('2026-11-10');
    await zeige([b], 'jahr');
    expect(teil(9, 'sessions')).toBe(250);
    expect(teil(9, 'beendet')).toBe(0);
    expect(teil(10, 'beendet')).toBe(150);
    expect(teil(10, 'sessions')).toBe(0);
    expect(seitenKachel()).toBe('400');
  });

  it('[REQ-084/AK-4] keine Doppelzählung: alle Seiten über Sessions gelesen, dann *gelesen* → 0 aus beendeten', async () => {
    let b = lies(buch({ seitenanzahl: 400 }), [
      [200, um(2026, 11, 2)],
      [400, um(2026, 11, 9)],
    ]);
    b = statusSetzen(b, 'gelesen', um(2026, 11, 9, 20));
    await zeige([b], 'monat');
    expect(seitenKachel()).toBe('400');
    expect($$('[data-balken-teil="beendet"]')).toHaveLength(0);
  });

  it('[REQ-084/AK-4] keine Doppelzählung über Jahresgrenzen: Sessions 2025 (300), beendet 2026 → 2026 nur 100', async () => {
    let b = lies(buch({ seitenanzahl: 400 }), [[300, um(2025, 12, 20)]]);
    b = statusSetzen(b, 'gelesen', um(2026, 1, 3));
    await zeige([b], 'jahr');
    expect(seitenKachel()).toBe('100');
    await tippe($('[data-zeitraum-zurueck]'));
    expect(seitenKachel()).toBe('300');
  });

  it('[REQ-084/AK-4] Summe beider Anteile nie über der Seitenanzahl, auch wenn die Seitenanzahl später kleiner gesetzt wurde', async () => {
    const b = { ...lies(buch({ seitenanzahl: 400 }), [[350, um(2026, 11, 2)]]), seitenanzahl: 300, status: 'gelesen' as const, beendetAm: '2026-11-03' };
    await zeige([b], 'monat');
    expect(Number(seitenKachel())).toBeLessThanOrEqual(300);
  });

  it('[REQ-084/AK-5] gestern Sitzung auf 100, heute 30 gesichert (keine Sitzung), danach 60 (Sitzung): heute 0', async () => {
    const b = lies(buch({ seitenanzahl: 400 }), [
      [100, um(2026, 11, 21, 20)],
      [30, um(2026, 11, 22, 9)],
      [60, um(2026, 11, 22, 10)],
    ]);
    expect(b.sitzungen).toHaveLength(2);
    await zeige([b], 'woche');
    expect(teil(5, 'sessions')).toBe(100);
    expect(teil(6, 'sessions')).toBe(0);
    expect(Number($$('[data-balken]')[6].getAttribute('data-wert'))).toBe(0);
    expect(seitenKachel()).toBe('100');
  });

  it('[REQ-084/AK-5] Auslegung: Alt-Sitzung ohne Seitenzahl ist Bezugswert 0 und trägt 0 Seiten bei', async () => {
    const b = buch({
      seitenanzahl: 400,
      sitzungen: [{ zeitpunkt: um(2026, 11, 17).toISOString() }, { zeitpunkt: um(2026, 11, 18).toISOString(), seite: 50 }],
    });
    await zeige([b], 'woche');
    expect(teil(1, 'sessions')).toBe(0);
    expect(teil(2, 'sessions')).toBe(50);
    expect(norm($('[data-lesetage-text]')!.textContent)).toBe('2 von 7 Tagen gelesen');
  });

  it('[REQ-084/AK-6] Tag mit 40 in Sessions und 100 aus beendeten: Balken aus Teil in Primär und Teil in Gold; Legende ohne „›“', async () => {
    const a = lies(buch({ seitenanzahl: 400 }), [[40, um(2026, 11, 22, 9)]]);
    const b = buch({ status: 'gelesen', seitenanzahl: 100, beendetAm: '2026-11-22' });
    await zeige([a, b], 'woche');
    expect(teil(6, 'sessions')).toBe(40);
    expect(teil(6, 'beendet')).toBe(100);
    expect(Number($$('[data-balken]')[6].getAttribute('data-wert'))).toBe(140);
    const s = $$('[data-balken]')[6].querySelector<HTMLElement>('[data-balken-teil="sessions"]')!;
    const g = $$('[data-balken]')[6].querySelector<HTMLElement>('[data-balken-teil="beendet"]')!;
    expect(getComputedStyle(s).backgroundColor).toBe(farbe('var(--bz-farbe-primaer)'));
    expect(getComputedStyle(g).backgroundColor).toBe(farbe('var(--bz-farbe-gold)'));
    const legende = $('[data-legende]')!;
    expect(norm(legende.textContent)).toContain('in Sessions');
    expect(norm(legende.textContent)).toContain('aus beendeten Büchern');
    expect(legende.textContent).not.toContain('›');
    // Legende unter dem Diagramm
    expect(s.compareDocumentPosition(legende) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it('[REQ-084/AK-6] Änderung der Farbrubrik „Gold“ an der zentralen Stelle wirkt auf Balkenteil und Legende', async () => {
    const b = buch({ status: 'gelesen', seitenanzahl: 100, beendetAm: '2026-11-22' });
    await zeige([b], 'woche', HEUTE, { '--bz-farbe-gold': '#123456' });
    const gold = 'rgb(18, 52, 86)';
    const g = $('[data-balken-teil="beendet"]')!;
    expect(getComputedStyle(g).backgroundColor).toBe(gold);
    const legende = $('[data-legende]')!;
    const inGold = [legende, ...Array.from(legende.querySelectorAll<HTMLElement>('*'))].filter(
      (e) => getComputedStyle(e).backgroundColor === gold || getComputedStyle(e).color === gold,
    );
    expect(inGold.length).toBeGreaterThan(0);
    // der Gold-Eintrag gehört zu „aus beendeten Büchern“, nicht zu „in Sessions“
    const eintrag = inGold[0].parentElement!;
    expect(norm(eintrag.textContent)).toContain('aus beendeten Büchern');
    expect(norm(eintrag.textContent)).not.toContain('in Sessions');
  });

  it('[REQ-084/AK-6] Farbrubrik „Gold“ hat in jedem Farbdesign einen Wert', () => {
    for (const d of ['klassisch', 'salbei', 'nachtlektuere', 'raureif', 'polarnacht'] as const) {
      expect(farbVariablen(d)['--bz-farbe-gold'], d).toMatch(/\S/);
    }
  });
});
