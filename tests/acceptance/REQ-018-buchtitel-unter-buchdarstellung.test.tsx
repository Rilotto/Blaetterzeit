/**
 * Akzeptanztests REQ-018 – Buchtitel unter der Buchdarstellung.
 *
 * Abgeleitet aus dem REQ-Text und der Schnittstellen-Absprache (sprints/sprint-03/plan.md, Runde 1):
 *  - Titel-Element data-buchdetails-titel, Farbe tertiaer, höchstens 2 Zeilen mit Ellipse
 *  - Buchdarstellung: drei [data-bereich]-Schaltflächen (REQ-014)
 * jsdom hat kein Layout: Zeilenbegrenzung strukturell (Line-Clamp), Optik manuell.
 */
import '@testing-library/jest-dom/vitest';
import { cleanup, render, screen } from '@testing-library/react';
import type { CSSProperties } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import BuchDetails from '@/views/BuchDetails';
import BuecherAnsicht from '@/views/BuecherAnsicht';
import type { ImageStore } from '@/storage/ImageStore';
import { farbrubriken, farbVariablen } from '@/theme';

const T = vi.hoisted(() => ({
  buecher: [
    { id: '18000000-0000-4000-8000-000000000001', titel: 'Momo', status: 'ungelesen' as const },
    {
      id: '18000000-0000-4000-8000-000000000002',
      titel:
        'Ein außerordentlich langer Buchtitel, der unter der Buchdarstellung ganz sicher mehr als zwei Zeilen benötigt und deshalb mit Auslassungspunkten gekürzt werden muss',
      status: 'ungelesen' as const,
    },
    { id: '18000000-0000-4000-8000-000000000003', titel: 'Gelesenes Buch', status: 'gelesen' as const },
  ],
}));
vi.mock('@/buecher/demodaten', () => ({ demoBuecher: T.buecher }));
const [KURZ, LANG, GELESEN] = T.buecher;
const PNG = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAIAAACQd1PeAAAADElEQVR4nGP4z8AAAAMBAQDJ/pLvAAAAAElFTkSuQmCC';
const rubriken = farbrubriken as unknown as Record<string, { wert: string }>;

afterEach(() => cleanup());

function speicher(start: Record<string, string> = {}) {
  const daten = new Map(Object.entries(start));
  const s = {
    get: async (buchId: string, bereich: string) => daten.get(`${buchId}|${bereich}`),
    put: async (buchId: string, bereich: string, dataUrl: string) => void daten.set(`${buchId}|${bereich}`, dataUrl),
    remove: async (buchId: string, bereich: string) => void daten.delete(`${buchId}|${bereich}`),
  };
  return s as typeof s & ImageStore;
}
async function zeige(buchId: string, bilder: Record<string, string> = {}) {
  const { container } = render(
    <div style={farbVariablen() as CSSProperties}>
      <BuchDetails
        buchId={buchId}
        bildquelle={{ scannen: async () => null, galerie: async () => null }}
        bildspeicher={speicher(bilder)}
        onZurueck={() => {}}
      />
    </div>,
  );
  const d = await screen.findByRole('region', { name: 'Buchdetails' });
  await vi.waitFor(() => expect(d.querySelector('[data-buchdetails-titel]')).not.toBeNull());
  return { wurzel: container.firstElementChild as HTMLElement, d };
}
const titel = (d: HTMLElement) => {
  const t = d.querySelectorAll<HTMLElement>('[data-buchdetails-titel]');
  expect(t, 'genau ein Buchtitel unter der Buchdarstellung').toHaveLength(1);
  return t[0];
};
function berechneteFarbe(ctx: HTMLElement, ausdruck: string) {
  const probe = document.createElement('span');
  probe.style.setProperty('color', ausdruck);
  ctx.appendChild(probe);
  const wert = getComputedStyle(probe).color;
  probe.remove();
  return wert;
}

// ===========================================================================
describe('REQ-018 Buchtitel unter der Buchdarstellung', () => {
  describe('AK-1 Titel unter der Buchdarstellung', () => {
    it.each([KURZ, LANG, GELESEN])('[REQ-018/AK-1] „$titel“: genau dieser Titel steht unter der Buchdarstellung', async (b) => {
      const { d } = await zeige(b.id);
      const t = titel(d);
      expect(t.textContent?.trim()).toBe(b.titel);
      const bereiche = Array.from(d.querySelectorAll('[data-bereich]'));
      expect(bereiche).toHaveLength(3);
      for (const x of bereiche) {
        expect(x.contains(t), 'nicht in einem Bereich').toBe(false);
        expect(x.compareDocumentPosition(t) & Node.DOCUMENT_POSITION_FOLLOWING, 'nach der Buchdarstellung').toBeTruthy();
      }
    });
  });

  describe('AK-2 Auch mit hinterlegtem Cover', () => {
    it('[REQ-018/AK-2] mit Bild im Cover steht der Titel weiterhin unter der Buchdarstellung', async () => {
      const { d } = await zeige(KURZ.id, { [`${KURZ.id}|cover`]: PNG });
      await vi.waitFor(() => expect(d.querySelector('[data-bereich="cover"] img')).not.toBeNull());
      expect(titel(d).textContent?.trim()).toBe(KURZ.titel);
      expect(titel(d)).toBeVisible();
    });

    it('[REQ-018/AK-2] mit Bildern in allen drei Bereichen ebenso', async () => {
      const { d } = await zeige(KURZ.id, { [`${KURZ.id}|cover`]: PNG, [`${KURZ.id}|ruecken`]: PNG, [`${KURZ.id}|schnitt`]: PNG });
      await vi.waitFor(() => expect(d.querySelectorAll('[data-bereich] img')).toHaveLength(3));
      expect(titel(d).textContent?.trim()).toBe(KURZ.titel);
    });
  });

  describe('AK-3 Höchstens zwei Zeilen', () => {
    it('[REQ-018/AK-3] langer Titel: auf zwei Zeilen begrenzt, mit „…“ am Ende (Line-Clamp)', async () => {
      const { d } = await zeige(LANG.id);
      const cs = getComputedStyle(titel(d));
      expect(cs.getPropertyValue('-webkit-line-clamp') || cs.getPropertyValue('line-clamp')).toMatch(/^2\b/);
      expect(cs.display).toMatch(/-webkit-(inline-)?box/);
      expect(cs.getPropertyValue('-webkit-box-orient')).toBe('vertical');
      expect(cs.overflow === 'hidden' || cs.overflowY === 'hidden').toBe(true);
    });

    it('[REQ-018/AK-3] der Titel bricht um (kein nowrap, lange Wörter brechen) und bleibt im Text vollständig', async () => {
      const { d } = await zeige(LANG.id);
      const t = titel(d);
      const cs = getComputedStyle(t);
      expect(cs.whiteSpace).not.toMatch(/nowrap|pre$/);
      expect(`${cs.overflowWrap} ${cs.wordBreak}`).toMatch(/break-word|anywhere|break-all/);
      expect(t.textContent?.trim()).toBe(LANG.titel);
    });

    it('[REQ-018/AK-3] Gegenprobe: kurzer Titel wird nicht gekürzt (kein Auslassungszeichen im Text)', async () => {
      const { d } = await zeige(KURZ.id);
      expect(titel(d).textContent).toBe(KURZ.titel);
    });
  });

  describe('AK-4 Farbe wie „Deine Bücher“', () => {
    it('[REQ-018/AK-4] Titel in „Tertiär“', async () => {
      const { wurzel, d } = await zeige(KURZ.id);
      const t = titel(d);
      let quelle = '';
      for (let n: HTMLElement | null = t; n && n !== wurzel && !quelle; n = n.parentElement) {
        quelle = (n.getAttribute('style') ?? '').split(';').find((x) => /^\s*color\s*:/.test(x)) ?? '';
      }
      expect(quelle.replace(/\s+/g, '')).toBe('color:var(--bz-farbe-tertiaer)');
      expect(getComputedStyle(t).color).toBe(berechneteFarbe(wurzel, rubriken.tertiaer.wert));
    });

    it('[REQ-018/AK-4] dieselbe Farbe wie die Überschrift „Deine Bücher“', async () => {
      const { d } = await zeige(KURZ.id);
      const ist = getComputedStyle(titel(d)).color;
      render(
        <div style={farbVariablen() as CSSProperties}>
          <BuecherAnsicht buecher={[]} />
        </div>,
      );
      expect(ist).toBe(getComputedStyle(screen.getByRole('heading', { name: 'Deine Bücher' })).color);
    });
  });

  describe('AK-5 Farbe aus zentraler Farbrubrik', () => {
    it('[REQ-018/AK-5] Änderung von „Tertiär“ an zentraler Stelle wirkt auf den Titel', async () => {
      const r = rubriken.tertiaer;
      const alt = r.wert;
      r.wert = rubriken.primaer.wert;
      try {
        const { wurzel, d } = await zeige(KURZ.id);
        const f = getComputedStyle(titel(d)).color;
        expect(f).toBe(berechneteFarbe(wurzel, r.wert));
        expect(f).not.toBe(berechneteFarbe(wurzel, alt));
      } finally {
        r.wert = alt;
      }
    });
  });
});
