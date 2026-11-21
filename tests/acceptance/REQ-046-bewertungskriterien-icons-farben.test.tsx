/**
 * Akzeptanztests REQ-046 – Icons und Farbrubriken der Bewertungskriterien.
 * Zentrale Farbdefinition: farbrubriken / farbVariablen / kriteriumVoll / kriteriumBlass (@/theme).
 * „An der zentralen Stelle ändern“ = Wert der Farbrubrik ändern; die Anzeige bezieht ihre Farbe über die
 * CSS-Variable der Rubrik. Konkrete Farbwerte und Mischungsverhältnis sind kein AK.
 */
import '@testing-library/jest-dom/vitest';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import type { CSSProperties } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { Buch } from '@/domain/buch';
import type { ImageStore } from '@/storage';
import { InMemoryBookRepository } from '@/storage/InMemoryBookRepository';
import { farbrubriken, farbVariablen, kriteriumBlass, kriteriumVoll, rubrikVariable } from '@/theme';
import BuchDetails from '@/views/BuchDetails';

vi.mock('@/buecher/demodaten', () => ({ demoBuecher: [] }));
afterEach(() => cleanup());

const buch = (f: Partial<Buch> = {}): Buch => ({ id: crypto.randomUUID(), titel: 'Testbuch', status: 'ungelesen', ...f });
const bilder = { get: async () => undefined, put: async () => {}, remove: async () => {} } as unknown as ImageStore;
async function zeige(b: Buch = buch()) {
  const repo = new InMemoryBookRepository();
  await repo.save(b);
  const { container } = render(
    <div style={farbVariablen() as CSSProperties}>
      <BuchDetails buchId={b.id} repository={repo} bildspeicher={bilder} bildquelle={{ scannen: async () => null, galerie: async () => null }} onZurueck={() => {}} />
    </div>,
  );
  const d = await screen.findByRole('region', { name: 'Buchdetails' });
  await vi.waitFor(() => expect(d.querySelector('[data-bereich-bewertung]')).not.toBeNull());
  return { d, wurzel: container.firstElementChild as HTMLElement };
}
async function tippe(el: Element) {
  await act(async () => {
    fireEvent.click(el);
    await new Promise((r) => setTimeout(r, 10));
  });
}

/** Erwartetes Icon je Kriterium laut Tabelle (Symbolnamen der Material-Symbols-Ablage bzw. eigene Icons). */
const ICON: Record<string, string> = {
  sterne: 'stern', // Stern
  tempo: 'funkeln', // Funkeln
  weltenbau: 'globus', // Globus
  spice: 'chili', // Chilischote
  spannung: 'ekg', // EKG-Linie ohne Herz
  action: 'blitz', // Blitz
  hauptfiguren: 'personKrone', // Person mit Krone
  nebenfiguren: 'gruppe', // Personengruppe
  plotTwist: 'tornado', // drei waagerechte Balken, nach unten spitz
  traenen: 'tropfen', // Tropfen
  romantik: 'herz', // Material-Herz
  humor: 'lachen', // lachendes Gesicht
  grusel: 'geist', // Geist
  dialoge: 'sprechblasen', // zwei Sprechblasen
};
/** Farbrubrik je Kriterium (Name = Kriterium). */
const RUBRIK: Record<string, { id: string; name: string }> = {
  sterne: { id: 'sterne', name: 'Sterne' },
  tempo: { id: 'tempo', name: 'Tempo' },
  weltenbau: { id: 'weltenbau', name: 'Weltenbau' },
  spice: { id: 'spice', name: 'Spice' },
  spannung: { id: 'spannung', name: 'Spannung' },
  action: { id: 'action', name: 'Action' },
  hauptfiguren: { id: 'hauptfiguren', name: 'Hauptfiguren' },
  nebenfiguren: { id: 'nebenfiguren', name: 'Nebenfiguren' },
  plotTwist: { id: 'plottwist', name: 'Plot Twist' },
  traenen: { id: 'traenen', name: 'Tränen' },
  romantik: { id: 'romantik', name: 'Romantik' },
  humor: { id: 'humor', name: 'Humor' },
  grusel: { id: 'grusel', name: 'Grusel' },
  dialoge: { id: 'dialoge', name: 'Dialoge' },
};
const rubriken = farbrubriken as unknown as Record<string, { name: string; wert: string }>;
const svg = (d: HTMLElement, k: string, n: number) =>
  d.querySelector(`[data-kriterium="${k}"] [data-symbol-nr="${n}"]`)!.querySelector<SVGElement>('[data-symbol]')!;
const farbe = (el: Element) => (el.getAttribute('style') ?? '').match(/(?:^|;)\s*color:\s*([^;]+)/)?.[1]?.trim() ?? '';

describe('REQ-046 Icons und Farben der Kriterien', () => {
  it('[REQ-046/AK-1] jedes Kriterium verwendet sein Icon laut Tabelle, in allen fünf Symbolen', async () => {
    const { d } = await zeige();
    for (const [k, icon] of Object.entries(ICON))
      for (const n of [1, 2, 3, 4, 5]) expect(svg(d, k, n).getAttribute('data-symbol'), `${k}/${n}`).toBe(icon);
  });

  it('[REQ-046/AK-1] keine zwei Kriterien teilen ein Icon; Romantik ist das Material-Herz, nicht das Herz-Icon aus REQ-010', async () => {
    const { d } = await zeige();
    const icons = [...d.querySelectorAll('[data-kriterium]')].map((z) => z.querySelector('[data-symbol]')!.getAttribute('data-symbol'));
    expect(icons).toHaveLength(14);
    expect(new Set(icons).size).toBe(14);
    const romantik = d.querySelector('[data-kriterium="romantik"]')!;
    expect(romantik.querySelector('img')).toBeNull();
    expect(romantik.querySelector('[data-icon]')).toBeNull();
    expect(romantik.querySelector('svg[data-symbol="herz"] path')).not.toBeNull();
  });

  it('[REQ-046/AK-2] die zentrale Farbdefinition enthält je Kriterium eine eigene Rubrik mit dem Kriteriennamen', () => {
    const werte = new Set<string>();
    for (const { id, name } of Object.values(RUBRIK)) {
      expect(rubriken[id], id).toBeDefined();
      expect(rubriken[id].name).toBe(name);
      expect(rubriken[id].wert).toMatch(/^#[0-9a-f]{6}$/i);
      expect(farbVariablen()[rubrikVariable(id as never)]).toBe(rubriken[id].wert);
      werte.add(id);
    }
    expect(werte.size).toBe(14);
  });

  it('[REQ-046/AK-3] angewähltes Symbol nutzt die volle Farbe aus der Rubrik des Kriteriums; Änderung der Rubrik wirkt', async () => {
    const alt = rubriken.tempo.wert;
    try {
      rubriken.tempo.wert = '#123456';
      expect(farbVariablen()[rubrikVariable('tempo' as never)]).toBe('#123456');
      const { d } = await zeige(buch({ bewertungen: { tempo: 2 } } as Partial<Buch>));
      expect(farbe(svg(d, 'tempo', 1))).toBe(kriteriumVoll('tempo'));
      expect(farbe(svg(d, 'tempo', 2))).toBe(kriteriumVoll('tempo'));
      expect(kriteriumVoll('tempo')).toContain(rubrikVariable('tempo' as never));
      // Gegenstück: andere Kriterien beziehen ihre Farbe nicht aus „Tempo“.
      await tippe(svg(d, 'spice', 1).parentElement!);
      expect(farbe(svg(d, 'spice', 1))).toContain(rubrikVariable('spice' as never));
      expect(farbe(svg(d, 'spice', 1))).not.toContain(rubrikVariable('tempo' as never));
    } finally {
      rubriken.tempo.wert = alt;
    }
  });

  it('[REQ-046/AK-4] nicht angewähltes Symbol: Mischung aus Rubrik des Kriteriums und „Hintergrund“, verschieden von voll', async () => {
    const { d } = await zeige(buch({ bewertungen: { tempo: 2 } } as Partial<Buch>));
    const blass = farbe(svg(d, 'tempo', 3));
    expect(blass).toBe(kriteriumBlass('tempo'));
    expect(blass).toContain(rubrikVariable('tempo' as never));
    expect(blass).toContain(rubrikVariable('hintergrund' as never));
    expect(blass).not.toBe(farbe(svg(d, 'tempo', 2)));
    for (const k of Object.keys(ICON)) {
      const b = kriteriumBlass(k as never);
      expect(b).toContain(rubrikVariable(RUBRIK[k].id as never));
      expect(b).toContain(rubrikVariable('hintergrund' as never));
      expect(b).not.toBe(kriteriumVoll(k as never));
    }
  });
});
