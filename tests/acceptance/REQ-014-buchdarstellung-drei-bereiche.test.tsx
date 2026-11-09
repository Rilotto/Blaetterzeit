/**
 * Akzeptanztests REQ-014 – Buchdarstellung mit Buchrücken, Cover und Schnitt.
 *
 * Abgeleitet aus dem REQ-Text und der Schnittstellen-Absprache (sprints/sprint-03/plan.md, Runde 1):
 *  - drei <button data-bereich="ruecken|cover|schnitt"> mit aria-label „Buchrücken“, „Cover“, „Schnitt“
 *  - ohne Bild: Cover-Fläche primaer, Titel data-cover-titel in hintergrund; Rücken/Schnitt Fläche ghost,
 *    gestrichelter Rahmen ghostframe, Beschriftung data-bereich-beschriftung („Buchrücken +“/„Schnitt +“),
 *    um 90° gedreht, Format wie „Alle ansehen ›“
 *  - mit Bild: <img data-bereich-bild> ersetzt Beschriftung bzw. Titel
 *  - BuchDetails-Props { buchId, bildquelle?, bildspeicher?, onZurueck }; Bilder kommen aus dem
 *    ImageStore (Test-Double, Data-URLs).
 * jsdom hat kein Layout: Anordnung, Größen und Drehung werden strukturell über die Styles geprüft.
 */
import '@testing-library/jest-dom/vitest';
import { cleanup, render, screen, within } from '@testing-library/react';
import type { CSSProperties } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import BuchDetails from '@/views/BuchDetails';
import BuecherAnsicht from '@/views/BuecherAnsicht';
import type { Buch } from '@/domain/buch';
import type { ImageStore } from '@/storage/ImageStore';
import { farbrubriken, farbVariablen } from '@/theme';

const T = vi.hoisted(() => ({
  buecher: [
    { id: '14000000-0000-4000-8000-000000000001', titel: 'Momo', status: 'ungelesen' as const },
    {
      id: '14000000-0000-4000-8000-000000000002',
      titel: 'Die unendliche Geschichte von Bastian Balthasar Bux und dem Land Phantásien, das ohne Ende ist',
      status: 'ungelesen' as const,
    },
  ],
}));
vi.mock('@/buecher/demodaten', () => ({ demoBuecher: T.buecher }));
const [KURZ, LANG] = T.buecher;

const PNG = {
  rot: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAIAAACQd1PeAAAADElEQVR4nGP4z8AAAAMBAQDJ/pLvAAAAAElFTkSuQmCC',
  gruen: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAIAAACQd1PeAAAADElEQVR4nGNgaGAAAAEEAIFw9selAAAAAElFTkSuQmCC',
  blau: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAIAAACQd1PeAAAADElEQVR4nGNgYPgPAAEDAQAIicLsAAAAAElFTkSuQmCC',
};
type Bereich = 'ruecken' | 'cover' | 'schnitt';
const BEREICHE: Bereich[] = ['ruecken', 'cover', 'schnitt'];
const NAME: Record<Bereich, string> = { ruecken: 'Buchrücken', cover: 'Cover', schnitt: 'Schnitt' };
const rubriken = farbrubriken as unknown as Record<string, { wert: string }>;

afterEach(() => cleanup());

// --------------------------------------------------------------------------- Hilfen
function speicher(start: Partial<Record<string, string>> = {}) {
  const daten = new Map<string, string>(Object.entries(start) as [string, string][]);
  const s = {
    daten,
    get: async (buchId: string, bereich: string) => daten.get(`${buchId}|${bereich}`),
    put: async (buchId: string, bereich: string, dataUrl: string) => void daten.set(`${buchId}|${bereich}`, dataUrl),
    remove: async (buchId: string, bereich: string) => void daten.delete(`${buchId}|${bereich}`),
  };
  return s as typeof s & ImageStore;
}
const leererQuelle = { scannen: async () => null, galerie: async () => null };

async function zeige(buchId = KURZ.id, bilder: Partial<Record<Bereich, string>> = {}) {
  const start: Record<string, string> = {};
  for (const [b, url] of Object.entries(bilder)) start[`${buchId}|${b}`] = url!;
  const { container } = render(
    <div data-testwurzel="" style={farbVariablen() as CSSProperties}>
      <BuchDetails buchId={buchId} bildquelle={leererQuelle} bildspeicher={speicher(start)} onZurueck={() => {}} />
    </div>,
  );
  const d = await screen.findByRole('region', { name: 'Buchdetails' });
  // warten, bis die Bilder aus dem Speicher geladen sind
  for (const b of Object.keys(bilder) as Bereich[]) {
    await within(d).findByRole('button', { name: NAME[b] });
    await vi.waitFor(() => expect(bereich(b).querySelector('img[data-bereich-bild]')).not.toBeNull());
  }
  await within(d).findByRole('button', { name: 'Cover' });
  return container.firstElementChild as HTMLElement;
}
function bereich(b: Bereich) {
  const d = screen.getByRole('region', { name: 'Buchdetails' });
  const els = d.querySelectorAll<HTMLElement>(`[data-bereich="${b}"]`);
  expect(els, `genau ein Bereich ${b}`).toHaveLength(1);
  return els[0];
}
function px(v: string) {
  const m = /^(-?[\d.]+)(px|rem)$/.exec((v ?? '').trim());
  if (!m) return NaN;
  return m[2] === 'rem' ? Number(m[1]) * 16 : Number(m[1]);
}
/** Breite/Höhe aus festen Maßen oder aus aspect-ratio + einer festen Seite. */
function masse(el: HTMLElement) {
  const cs = getComputedStyle(el);
  let w = px(cs.width);
  let h = px(cs.height);
  const ar = /^([\d.]+)\s*\/\s*([\d.]+)$/.exec(cs.aspectRatio ?? '') ?? /^([\d.]+)$/.exec(cs.aspectRatio ?? '');
  const ratio = ar ? Number(ar[1]) / (ar[2] ? Number(ar[2]) : 1) : NaN;
  if (Number.isNaN(w) && Number.isFinite(h) && Number.isFinite(ratio)) w = h * ratio;
  if (Number.isNaN(h) && Number.isFinite(w) && Number.isFinite(ratio)) h = w / ratio;
  return { w, h };
}
function berechneteFarbe(ctx: HTMLElement, ausdruck: string) {
  const probe = document.createElement('span');
  probe.style.setProperty('color', ausdruck);
  ctx.appendChild(probe);
  const wert = getComputedStyle(probe).color;
  probe.remove();
  return wert;
}
const beschriftung = (b: Bereich) => bereich(b).querySelector<HTMLElement>('[data-bereich-beschriftung]');
const coverTitel = () => bereich('cover').querySelector<HTMLElement>('[data-cover-titel]');
/** Drehung um ±90° (Leserichtung von unten nach oben). */
function istGedreht(el: HTMLElement) {
  for (let n: HTMLElement | null = el; n && !n.hasAttribute('data-bereich'); n = n.parentElement) {
    const cs = getComputedStyle(n);
    const t = `${cs.transform} ${cs.rotate}`.replace(/\s+/g, '');
    if (/rotate\((-90deg|270deg|-0\.25turn|0\.75turn)\)|(^|\s)(-90deg|270deg)/.test(t) || /^(-90deg|270deg)$/.test(cs.rotate)) return true;
    if (/sideways-lr/.test(cs.writingMode)) return true;
    if (/vertical-(rl|lr)/.test(cs.writingMode) && /rotate\((180deg|-180deg|0\.5turn)\)/.test(t)) return true;
  }
  return false;
}
async function alleAnsehen() {
  const b: Buch = { id: '14000000-0000-4000-8000-0000000000ff', titel: 'X', status: 'ungelesen' };
  render(
    <div style={farbVariablen() as CSSProperties}>
      <BuecherAnsicht buecher={[b]} />
    </div>,
  );
  return within(screen.getByRole('region', { name: 'Noch zu lesen' })).getByRole('button', { name: 'Alle ansehen ›' });
}

// ===========================================================================
describe('REQ-014 Buchdarstellung mit Buchrücken, Cover und Schnitt', () => {
  describe('AK-1 Drei Bereiche in fester Anordnung', () => {
    it('[REQ-014/AK-1] von links nach rechts: Buchrücken, Cover, Schnitt (Schaltflächen mit diesen Namen)', async () => {
      await zeige();
      const d = screen.getByRole('region', { name: 'Buchdetails' });
      const els = Array.from(d.querySelectorAll<HTMLElement>('[data-bereich]'));
      expect(els.map((e) => e.getAttribute('data-bereich'))).toEqual(BEREICHE);
      for (const b of BEREICHE) {
        expect(bereich(b).tagName).toBe('BUTTON');
        expect(bereich(b)).toHaveAccessibleName(NAME[b]);
      }
      // nebeneinander: gemeinsamer Elterncontainer als Zeile
      const eltern = els[0].parentElement!;
      expect(els.every((e) => e.parentElement === eltern)).toBe(true);
      const cs = getComputedStyle(eltern);
      expect(cs.display).toMatch(/flex|grid/);
      if (/flex/.test(cs.display)) expect(cs.flexDirection).toMatch(/^(|row)$/);
    });

    it('[REQ-014/AK-1] gleich hoch, Rücken und Schnitt schmaler als das Cover, Cover hochformatig', async () => {
      await zeige();
      const [r, c, s] = BEREICHE.map((b) => masse(bereich(b)));
      for (const m of [r, c, s]) {
        expect(Number.isFinite(m.w) && Number.isFinite(m.h), 'feste Maße je Bereich').toBe(true);
      }
      expect(r.h).toBeCloseTo(c.h, 3);
      expect(s.h).toBeCloseTo(c.h, 3);
      expect(r.w).toBeLessThan(c.w);
      expect(s.w).toBeLessThan(c.w);
      expect(c.h).toBeGreaterThan(c.w);
    });

    it('[REQ-014/AK-1] die Bereiche sind abgerundete Rechtecke', async () => {
      await zeige();
      for (const b of BEREICHE) expect(px(getComputedStyle(bereich(b)).borderTopLeftRadius) || px(getComputedStyle(bereich(b)).borderRadius), b).toBeGreaterThan(0);
    });

    it('[REQ-014/AK-1] die Maße bleiben gleich, wenn Bilder hinterlegt sind', async () => {
      await zeige();
      const ohne = BEREICHE.map((b) => masse(bereich(b)));
      cleanup();
      await zeige(KURZ.id, { ruecken: PNG.rot, cover: PNG.gruen, schnitt: PNG.blau });
      expect(BEREICHE.map((b) => masse(bereich(b)))).toEqual(ohne);
    });
  });

  describe('AK-2 Gedrehte Beschriftungen mit „+“ in normaler Schreibweise', () => {
    it.each([
      ['ruecken', 'Buchrücken +'],
      ['schnitt', 'Schnitt +'],
    ] as const)('[REQ-014/AK-2] %s zeigt genau „%s“, nicht in Großbuchstaben', async (b, text) => {
      await zeige();
      const el = beschriftung(b);
      expect(el).not.toBeNull();
      expect(el!.textContent?.replace(/\s+/g, ' ').trim()).toBe(text);
      for (let n: HTMLElement | null = el; n && n !== bereich(b).parentElement; n = n.parentElement) {
        expect(getComputedStyle(n).textTransform).not.toMatch(/uppercase|capitalize/);
        expect(getComputedStyle(n).fontVariant).not.toMatch(/small-caps/);
      }
    });

    it.each(['ruecken', 'schnitt'] as const)('[REQ-014/AK-2] Beschriftung in %s ist um 90° gedreht (von unten nach oben)', async (b) => {
      await zeige();
      expect(istGedreht(beschriftung(b)!)).toBe(true);
    });

    it('[REQ-014/AK-2] Negativfall: das Cover trägt keine „+“-Beschriftung', async () => {
      await zeige();
      expect(beschriftung('cover')).toBeNull();
      expect(bereich('cover').textContent).not.toMatch(/\+/);
    });
  });

  describe('AK-3 Format wie „Alle ansehen ›“', () => {
    it.each(['ruecken', 'schnitt'] as const)('[REQ-014/AK-3] %s: Schriftgröße, -stärke, -stil und Farbe wie „Alle ansehen ›“', async (b) => {
      await zeige();
      const el = beschriftung(b)!;
      const soll = getComputedStyle(await alleAnsehen());
      const ist = getComputedStyle(el);
      expect(ist.fontSize).toBe(soll.fontSize);
      expect(ist.fontWeight || '400').toBe(soll.fontWeight || '400');
      expect(ist.fontStyle || 'normal').toBe(soll.fontStyle || 'normal');
      expect(ist.color).toBe(soll.color);
      expect(ist.fontSize).not.toBe('');
    });
  });

  describe('AK-4 Cover ohne Bild: nur der Titel auf Primär-Fläche', () => {
    it('[REQ-014/AK-4] Coverfläche in „Primär“, Titel in „Hintergrund“', async () => {
      const w = await zeige();
      const c = bereich('cover');
      expect(c.getAttribute('style') ?? '').toContain('var(--bz-farbe-primaer)');
      expect(getComputedStyle(c).backgroundColor).toBe(berechneteFarbe(w, rubriken.primaer.wert));
      const t = coverTitel()!;
      expect(t).not.toBeNull();
      expect(t.textContent?.trim()).toBe(KURZ.titel);
      expect(getComputedStyle(t).color).toBe(berechneteFarbe(w, rubriken.hintergrund.wert));
    });

    it('[REQ-014/AK-4] im Cover nur der Titel: kein Herz-Icon, kein Bild, kein weiterer Text', async () => {
      await zeige();
      const c = bereich('cover');
      expect(c.querySelectorAll('img, svg, canvas, [data-icon], [data-cover-platzhalter]')).toHaveLength(0);
      expect(c.textContent?.trim()).toBe(KURZ.titel);
      expect(getComputedStyle(c).backgroundImage).toMatch(/^(|none)$/);
    });

    it('[REQ-014/AK-4] Titel liegt oben links in der Coverfläche (linksbündig, nicht zentriert)', async () => {
      await zeige();
      const t = coverTitel()!;
      for (let n: HTMLElement | null = t; n && n !== bereich('cover').parentElement; n = n.parentElement) {
        expect(getComputedStyle(n).textAlign).not.toMatch(/center|right|end/);
      }
    });
  });

  describe('AK-5 Langer Titel vollständig innerhalb der Coverfläche', () => {
    it('[REQ-014/AK-5] der volle Titel steht im Cover, ohne Zeilenbegrenzung und ohne Auslassungspunkte', async () => {
      await zeige(LANG.id);
      const t = coverTitel()!;
      expect(t.textContent?.trim()).toBe(LANG.titel);
      for (let n: HTMLElement | null = t; n && n !== bereich('cover'); n = n.parentElement) {
        const cs = getComputedStyle(n);
        expect(cs.getPropertyValue('-webkit-line-clamp') || cs.getPropertyValue('line-clamp') || 'none').toMatch(/^(none|)$/);
        expect(cs.textOverflow).not.toBe('ellipsis');
        expect(cs.whiteSpace).not.toMatch(/nowrap|pre$/);
      }
    });

    it('[REQ-014/AK-5] der Titel bricht um (auch lange Wörter) und ragt nicht aus dem Rechteck', async () => {
      await zeige(LANG.id);
      const t = coverTitel()!;
      const cs = getComputedStyle(t);
      expect(`${cs.overflowWrap} ${cs.wordBreak}`).toMatch(/break-word|anywhere|break-all/);
      expect(bereich('cover').contains(t)).toBe(true);
      for (let n: HTMLElement | null = t; n && n !== bereich('cover'); n = n.parentElement) {
        const s = getComputedStyle(n);
        expect(s.position, 'nicht aus dem Fluss gelöst').not.toMatch(/fixed/);
        for (const m of [s.marginLeft, s.marginRight, s.marginTop]) expect(px(m) || 0).toBeGreaterThanOrEqual(0);
        expect(px(s.width) || 0).toBeLessThanOrEqual(masse(bereich('cover')).w);
      }
    });
  });

  describe('AK-6 Schmale Bereiche ohne Bild: Ghost mit gestricheltem GhostFrame', () => {
    it.each(['ruecken', 'schnitt'] as const)('[REQ-014/AK-6] %s: Fläche „Ghost“, Rahmen gestrichelt in „GhostFrame“', async (b) => {
      const w = await zeige();
      const cs = getComputedStyle(bereich(b));
      expect(cs.backgroundColor).toBe(berechneteFarbe(w, rubriken.ghost.wert));
      for (const seite of ['Top', 'Right', 'Bottom', 'Left'] as const) {
        expect(cs[`border${seite}Style`], seite).toBe('dashed');
        expect(px(cs[`border${seite}Width`]), seite).toBeGreaterThan(0);
        expect(cs[`border${seite}Color`], seite).toBe(berechneteFarbe(w, rubriken.ghostframe.wert));
      }
    });

    it('[REQ-014/AK-6] Gegenprobe: das Cover hat keinen gestrichelten Rahmen', async () => {
      await zeige();
      expect(getComputedStyle(bereich('cover')).borderTopStyle).not.toBe('dashed');
    });
  });

  describe('AK-7 Hinterlegtes Bild ersetzt Beschriftung bzw. Titel', () => {
    it.each([
      ['ruecken', PNG.rot],
      ['cover', PNG.gruen],
      ['schnitt', PNG.blau],
    ] as const)('[REQ-014/AK-7] Bild in %s: Bild sichtbar, Beschriftung/Titel weg, übrige Bereiche unverändert', async (b, url) => {
      await zeige();
      const andere = BEREICHE.filter((x) => x !== b);
      const vorher = andere.map((x) => bereich(x).outerHTML);
      cleanup();
      await zeige(KURZ.id, { [b]: url });
      const img = bereich(b).querySelectorAll<HTMLImageElement>('img[data-bereich-bild]');
      expect(img).toHaveLength(1);
      expect(img[0].getAttribute('src')).toBe(url);
      expect(beschriftung(b)).toBeNull();
      expect(bereich(b).textContent?.trim()).not.toContain(b === 'cover' ? KURZ.titel : '+');
      if (b === 'cover') expect(coverTitel()).toBeNull();
      expect(andere.map((x) => bereich(x).outerHTML)).toEqual(vorher);
    });

    it('[REQ-014/AK-7] das Bild füllt den Bereich aus', async () => {
      await zeige(KURZ.id, { cover: PNG.gruen });
      const cs = getComputedStyle(bereich('cover').querySelector('img[data-bereich-bild]')!);
      expect(cs.width).toBe('100%');
      expect(cs.height).toBe('100%');
    });

    it('[REQ-014/AK-7] alle drei Bilder gleichzeitig, jedes in seinem Bereich', async () => {
      await zeige(KURZ.id, { ruecken: PNG.rot, cover: PNG.gruen, schnitt: PNG.blau });
      expect(bereich('ruecken').querySelector('img')!.getAttribute('src')).toBe(PNG.rot);
      expect(bereich('cover').querySelector('img')!.getAttribute('src')).toBe(PNG.gruen);
      expect(bereich('schnitt').querySelector('img')!.getAttribute('src')).toBe(PNG.blau);
    });

    it('[REQ-014/AK-7] Negativfall: Bilder eines anderen Buches erscheinen nicht', async () => {
      const s = speicher({ [`${LANG.id}|cover`]: PNG.gruen, [`${LANG.id}|ruecken`]: PNG.rot });
      render(<BuchDetails buchId={KURZ.id} bildquelle={leererQuelle} bildspeicher={s} onZurueck={() => {}} />);
      await screen.findByRole('region', { name: 'Buchdetails' });
      await vi.waitFor(() => expect(coverTitel()).not.toBeNull());
      expect(screen.getByRole('region', { name: 'Buchdetails' }).querySelectorAll('img')).toHaveLength(0);
    });
  });

  describe('AK-8 Farben aus zentralen Farbrubriken', () => {
    it.each([
      ['primaer', () => [getComputedStyle(bereich('cover')).backgroundColor, getComputedStyle(beschriftung('ruecken')!).color, getComputedStyle(beschriftung('schnitt')!).color]],
      ['hintergrund', () => [getComputedStyle(coverTitel()!).color]],
      ['ghost', () => [getComputedStyle(bereich('ruecken')).backgroundColor, getComputedStyle(bereich('schnitt')).backgroundColor]],
      ['ghostframe', () => [getComputedStyle(bereich('ruecken')).borderTopColor, getComputedStyle(bereich('schnitt')).borderLeftColor]],
    ] as const)('[REQ-014/AK-8] Änderung von „%s“ wirkt auf alle Elemente dieser Farbrolle', async (id, farben) => {
      const r = rubriken[id];
      const alt = r.wert;
      const neu = Object.values(rubriken)
        .map((x) => x.wert)
        .find((v) => berechneteFarbe(document.body, v) !== berechneteFarbe(document.body, alt))!;
      r.wert = neu;
      try {
        const w = await zeige();
        for (const f of farben()) {
          expect(f).toBe(berechneteFarbe(w, neu));
          expect(f).not.toBe(berechneteFarbe(w, alt));
        }
      } finally {
        r.wert = alt;
      }
    });
  });
});
