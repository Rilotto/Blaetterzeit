/**
 * Akzeptanztests REQ-016 – Bild in der Kameraansicht aufnehmen oder aus der Galerie auswählen.
 *
 * Abgeleitet aus dem REQ-Text und der Schnittstellen-Absprache (sprints/sprint-03/plan.md, Runde 1):
 *  - Bildquelle { scannen(): Promise<string|null>; galerie(): Promise<string|null> }, null = Abbruch
 *  - Kameraansicht <section aria-label="Kamera"> mit <button aria-label="Zurück"> und
 *    <button aria-label="Foto aufnehmen">; Zurück-Pfeil wie in den Buchdetails (icon-zurueck.png, Tertiär)
 *  - danach <section aria-label="Zuschnitt"> mit genau diesem Bild
 * Live-Bild der Kamera, Systemgalerie und Berechtigungsdialoge sind nur auf dem Gerät prüfbar
 * (manuelle Prüfliste im Testbericht). Hier: Verhalten der App gegenüber der Bildquelle (Test-Double).
 */
import '@testing-library/jest-dom/vitest';
import { act, cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import type { CSSProperties } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import BuchDetails from '@/views/BuchDetails';
import type { Bildquelle } from '@/bild/bildquelle';
import type { ImageStore } from '@/storage/ImageStore';
import { farbrubriken, farbVariablen } from '@/theme';

const T = vi.hoisted(() => ({
  buecher: [{ id: '16000000-0000-4000-8000-000000000001', titel: 'Momo', status: 'ungelesen' as const }],
}));
vi.mock('@/buecher/demodaten', () => ({ demoBuecher: T.buecher }));
const BUCH = T.buecher[0];

const PNG = {
  rot: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAIAAACQd1PeAAAADElEQVR4nGP4z8AAAAMBAQDJ/pLvAAAAAElFTkSuQmCC',
  gruen: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAIAAACQd1PeAAAADElEQVR4nGNgaGAAAAEEAIFw9selAAAAAElFTkSuQmCC',
  blau: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAIAAACQd1PeAAAADElEQVR4nGNgYPgPAAEDAQAIicLsAAAAAElFTkSuQmCC',
};
type Bereich = 'ruecken' | 'cover' | 'schnitt';
const BEREICHE: Bereich[] = ['ruecken', 'cover', 'schnitt'];
const rubriken = farbrubriken as unknown as Record<string, { wert: string }>;
const NIE = () => new Promise<string | null>(() => {});

afterEach(() => cleanup());

// --------------------------------------------------------------------------- Hilfen
function speicher(bilder: Partial<Record<Bereich, string>> = {}) {
  const daten = new Map<string, string>(Object.entries(bilder).map(([b, u]) => [`${BUCH.id}|${b}`, u!]));
  const s = {
    daten,
    get: async (buchId: string, bereich: string) => daten.get(`${buchId}|${bereich}`),
    put: async (buchId: string, bereich: string, dataUrl: string) => void daten.set(`${buchId}|${bereich}`, dataUrl),
    remove: async (buchId: string, bereich: string) => void daten.delete(`${buchId}|${bereich}`),
  };
  return s as typeof s & ImageStore;
}
/** `q` undefined: Standard-Bildquelle der App (zeigt die eigene Kameraansicht; in jsdom ohne Kamera). */
async function zeige(q: Bildquelle | undefined, bilder: Partial<Record<Bereich, string>> = {}) {
  const s = speicher(bilder);
  const { container } = render(
    <div style={farbVariablen() as CSSProperties}>
      <BuchDetails buchId={BUCH.id} bildquelle={q} bildspeicher={s} onZurueck={() => {}} />
    </div>,
  );
  await screen.findByRole('region', { name: 'Buchdetails' });
  await vi.waitFor(() => expect(document.querySelectorAll('[data-bereich]')).toHaveLength(3));
  for (const b of Object.keys(bilder) as Bereich[]) {
    await vi.waitFor(() => expect(bereich(b).querySelector('img[data-bereich-bild]')).not.toBeNull());
  }
  return { s, wurzel: container.firstElementChild as HTMLElement };
}
const details = () => screen.queryByRole('region', { name: 'Buchdetails' });
const kamera = () => screen.queryByRole('region', { name: 'Kamera' });
const zuschnitt = () => screen.queryByRole('region', { name: 'Zuschnitt' });
function bereich(b: Bereich) {
  const el = document.querySelector<HTMLElement>(`[data-bereich="${b}"]`);
  expect(el, `Bereich ${b}`).not.toBeNull();
  return el!;
}
async function waehle(b: Bereich, option: 'Scannen' | 'Aus Galerie auswählen') {
  fireEvent.click(bereich(b));
  const m = await screen.findByRole('menu', { name: 'Bild hinzufügen' });
  fireEvent.click(within(m).getByRole('menuitem', { name: option }));
}
async function ruhe() {
  await act(async () => {
    await new Promise((r) => setTimeout(r, 20));
  });
}
const darstellung = () => BEREICHE.map((b) => bereich(b).innerHTML);
/** Löst in einer angezeigten Kameraansicht den Auslöser aus (falls die App sie vor der Aufnahme zeigt). */
async function ausloesen() {
  const k = kamera();
  if (!k) return;
  const b = within(k).getByRole('button', { name: 'Foto aufnehmen' });
  await vi.waitFor(() => expect(b).toBeEnabled());
  fireEvent.click(b);
}
/** Zurück in die Buchdetails, falls noch die Kameraansicht angezeigt wird. */
async function kameraVerlassen() {
  const k = kamera();
  if (k) fireEvent.click(within(k).getByRole('button', { name: 'Zurück' }));
  await screen.findByRole('region', { name: 'Buchdetails' });
}
/** Bildquelle des Zuschnitt-Fensters (img-src oder background-image). */
function bilderImZuschnitt() {
  const z = zuschnitt()!;
  const srcs = Array.from(z.querySelectorAll('img')).map((i) => i.getAttribute('src'));
  const bgs = Array.from(z.querySelectorAll<HTMLElement>('*'))
    .map((e) => /url\("?([^")]+)"?\)/.exec(e.style.backgroundImage)?.[1])
    .filter(Boolean);
  return [...srcs, ...bgs];
}
function berechneteFarbe(ctx: HTMLElement, ausdruck: string) {
  const probe = document.createElement('span');
  probe.style.setProperty('color', ausdruck);
  ctx.appendChild(probe);
  const wert = getComputedStyle(probe).color;
  probe.remove();
  return wert;
}

// ===========================================================================
describe('REQ-016 Bild in der Kameraansicht aufnehmen oder aus der Galerie auswählen', () => {
  describe('AK-1 Kameraansicht in der App', () => {
    it('[REQ-016/AK-1] „Scannen“ zeigt eine Kameraansicht der App mit Zurück-Pfeil oben links und Auslöser', async () => {
      await zeige(undefined);
      await waehle('cover', 'Scannen');
      const k = await screen.findByRole('region', { name: 'Kamera' });
      const zurueck = within(k).getByRole('button', { name: 'Zurück' });
      expect(zurueck.querySelector('[data-icon="icon-zurueck.png"]')).not.toBeNull();
      expect(within(k).getByRole('button', { name: 'Foto aufnehmen' })).toBeInTheDocument();
      // Zurück-Pfeil oben links: erstes bedienbares Element der Kameraansicht
      expect(within(k).getAllByRole('button')[0]).toBe(zurueck);
      expect(details()).toBeNull();
    });

    it('[REQ-016/AK-1] der Zurück-Pfeil der Kameraansicht ist in „Tertiär“ dargestellt', async () => {
      const { wurzel } = await zeige(undefined);
      await waehle('cover', 'Scannen');
      const k = await screen.findByRole('region', { name: 'Kamera' });
      const icon = within(k).getByRole('button', { name: 'Zurück' }).querySelector<HTMLElement>('[data-icon]')!;
      expect(icon.getAttribute('style') ?? '').toContain('var(--bz-farbe-tertiaer)');
      const cs = getComputedStyle(icon);
      expect([cs.backgroundColor, cs.color]).toContain(berechneteFarbe(wurzel, rubriken.tertiaer.wert));
    });

    it('[REQ-016/AK-1] Änderung von „Tertiär“ wirkt auf den Zurück-Pfeil der Kameraansicht', async () => {
      const r = rubriken.tertiaer;
      const alt = r.wert;
      r.wert = rubriken.primaer.wert;
      try {
        const { wurzel } = await zeige(undefined);
        await waehle('cover', 'Scannen');
        const k = await screen.findByRole('region', { name: 'Kamera' });
        const cs = getComputedStyle(within(k).getByRole('button', { name: 'Zurück' }).querySelector<HTMLElement>('[data-icon]')!);
        expect([cs.backgroundColor, cs.color]).toContain(berechneteFarbe(wurzel, r.wert));
      } finally {
        r.wert = alt;
      }
    });

    it('[REQ-016/AK-1] „Scannen“ fordert das Bild bei der Kamera an, nicht bei der Galerie', async () => {
      const q = { scannen: vi.fn(NIE), galerie: vi.fn(NIE) };
      await zeige(q);
      await waehle('cover', 'Scannen');
      await ausloesen();
      await vi.waitFor(() => expect(q.scannen).toHaveBeenCalledTimes(1));
      expect(q.galerie).not.toHaveBeenCalled();
    });
  });

  describe('AK-2 Zurück aus der Kameraansicht ändert nichts', () => {
    it.each([{}, { cover: PNG.rot }, { ruecken: PNG.rot, cover: PNG.gruen, schnitt: PNG.blau }])(
      '[REQ-016/AK-2] Zurück-Pfeil → Buchdetails, alle Bereiche unverändert (%o)',
      async (bilder) => {
        const { s } = await zeige(undefined, bilder);
        const vorher = darstellung();
        const daten = new Map(s.daten);
        await waehle('cover', 'Scannen');
        const k = await screen.findByRole('region', { name: 'Kamera' });
        fireEvent.click(within(k).getByRole('button', { name: 'Zurück' }));
        await vi.waitFor(() => expect(kamera()).toBeNull());
        await vi.waitFor(() => expect(details()).not.toBeNull());
        expect(zuschnitt()).toBeNull();
        expect(screen.queryByRole('menu')).toBeNull();
        await vi.waitFor(() => expect(darstellung()).toEqual(vorher));
        expect(s.daten).toEqual(daten);
      },
    );

    it('[REQ-016/AK-2] Zurück aus der Kamera verlässt nur die Kamera, nicht die Buchdetails (onZurueck nicht aufgerufen)', async () => {
      const onZurueck = vi.fn();
      render(<BuchDetails buchId={BUCH.id} bildspeicher={speicher()} onZurueck={onZurueck} />);
      await screen.findByRole('region', { name: 'Buchdetails' });
      await waehle('schnitt', 'Scannen');
      fireEvent.click(within(await screen.findByRole('region', { name: 'Kamera' })).getByRole('button', { name: 'Zurück' }));
      await vi.waitFor(() => expect(kamera()).toBeNull());
      expect(onZurueck).not.toHaveBeenCalled();
      expect(await screen.findByRole('region', { name: 'Buchdetails' })).toBeInTheDocument();
    });

    it('[REQ-016/AK-2] nach Zurück aus der Kamera lässt sich das Menü wieder öffnen und ein Bild auswählen', async () => {
      await zeige(undefined);
      await waehle('cover', 'Scannen');
      fireEvent.click(within(await screen.findByRole('region', { name: 'Kamera' })).getByRole('button', { name: 'Zurück' }));
      await screen.findByRole('region', { name: 'Buchdetails' });
      fireEvent.click(bereich('cover'));
      expect(await screen.findByRole('menu', { name: 'Bild hinzufügen' })).toBeInTheDocument();
    });
  });

  describe('AK-3 Galerie wird aufgerufen', () => {
    it.each(BEREICHE)('[REQ-016/AK-3] %s: „Aus Galerie auswählen“ ruft die Galerie-Bildquelle genau einmal auf', async (b) => {
      const q = { scannen: vi.fn(NIE), galerie: vi.fn(NIE) };
      await zeige(q);
      await waehle(b, 'Aus Galerie auswählen');
      await vi.waitFor(() => expect(q.galerie).toHaveBeenCalledTimes(1));
      expect(q.scannen).not.toHaveBeenCalled();
      expect(kamera()).toBeNull();
    });
  });

  describe('AK-4 Abbruch der Galerie ändert nichts', () => {
    it.each([{}, { cover: PNG.rot }])('[REQ-016/AK-4] Galerie ohne Auswahl (null) → Buchdetails, Bereich unverändert (%o)', async (bilder) => {
      const q = { scannen: vi.fn(NIE), galerie: vi.fn(async () => null) };
      const { s } = await zeige(q, bilder);
      const vorher = darstellung();
      const daten = new Map(s.daten);
      await waehle('cover', 'Aus Galerie auswählen');
      await ruhe();
      expect(details()).not.toBeNull();
      expect(zuschnitt()).toBeNull();
      expect(kamera()).toBeNull();
      expect(screen.queryByRole('menu')).toBeNull();
      expect(darstellung()).toEqual(vorher);
      expect(s.daten).toEqual(daten);
    });

    it('[REQ-016/AK-4] nach dem Abbruch kann erneut ausgewählt werden', async () => {
      const galerie = vi.fn<() => Promise<string | null>>().mockResolvedValueOnce(null).mockResolvedValueOnce(PNG.blau);
      await zeige({ scannen: vi.fn(NIE), galerie });
      await waehle('cover', 'Aus Galerie auswählen');
      await ruhe();
      await waehle('cover', 'Aus Galerie auswählen');
      expect(await screen.findByRole('region', { name: 'Zuschnitt' })).toBeInTheDocument();
    });
  });

  describe('AK-5 Danach folgt der Zuschnitt', () => {
    it.each(BEREICHE)('[REQ-016/AK-5] Galerie-Bild für %s → Zuschnitt mit genau diesem Bild', async (b) => {
      await zeige({ scannen: vi.fn(NIE), galerie: vi.fn(async () => PNG.blau) });
      await waehle(b, 'Aus Galerie auswählen');
      await screen.findByRole('region', { name: 'Zuschnitt' });
      expect(bilderImZuschnitt()).toContain(PNG.blau);
      expect(bilderImZuschnitt()).not.toContain(PNG.rot);
    });

    it('[REQ-016/AK-5] Kamera-Bild → Zuschnitt mit genau diesem Bild, Kameraansicht geschlossen', async () => {
      await zeige({ scannen: vi.fn(async () => PNG.gruen), galerie: vi.fn(NIE) });
      await waehle('cover', 'Scannen');
      await ausloesen();
      await screen.findByRole('region', { name: 'Zuschnitt' });
      expect(bilderImZuschnitt()).toContain(PNG.gruen);
      expect(kamera()).toBeNull();
    });

    it('[REQ-016/AK-5] vor der Bestätigung im Zuschnitt ist noch nichts gespeichert', async () => {
      const { s } = await zeige({ scannen: vi.fn(NIE), galerie: vi.fn(async () => PNG.blau) }, { cover: PNG.rot });
      await waehle('cover', 'Aus Galerie auswählen');
      await screen.findByRole('region', { name: 'Zuschnitt' });
      expect(s.daten.get(`${BUCH.id}|cover`)).toBe(PNG.rot);
      expect(s.daten.size).toBe(1);
    });
  });

  describe('AK-6 Verweigerter Zugriff ändert nichts', () => {
    it.each([
      ['Scannen', 'scannen'],
      ['Aus Galerie auswählen', 'galerie'],
    ] as const)('[REQ-016/AK-6] „%s“ ohne Zugriff (Bildquelle liefert null) → kein Zuschnitt, Bild unverändert', async (option, art) => {
      const q = { scannen: vi.fn(art === 'scannen' ? async () => null : NIE), galerie: vi.fn(art === 'galerie' ? async () => null : NIE) };
      const { s } = await zeige(q, { cover: PNG.rot });
      const vorher = darstellung();
      const daten = new Map(s.daten);
      await waehle('cover', option);
      await ausloesen();
      await ruhe();
      expect(zuschnitt()).toBeNull();
      expect(s.daten).toEqual(daten);
      await kameraVerlassen();
      expect(darstellung()).toEqual(vorher);
    });

    it.each([
      ['Scannen', 'scannen'],
      ['Aus Galerie auswählen', 'galerie'],
    ] as const)('[REQ-016/AK-6] Bildquelle „%s“ wirft (Berechtigung verweigert) → kein Absturz, Bild unverändert', async (option, art) => {
      const fehler = () => Promise.reject(new Error('Permission denied'));
      const q = { scannen: vi.fn(art === 'scannen' ? fehler : NIE), galerie: vi.fn(art === 'galerie' ? fehler : NIE) };
      const { s } = await zeige(q, { schnitt: PNG.blau });
      const daten = new Map(s.daten);
      await waehle('schnitt', option);
      await ausloesen();
      await ruhe();
      expect(zuschnitt()).toBeNull();
      expect(s.daten).toEqual(daten);
      await kameraVerlassen();
      expect(bereich('schnitt').querySelector('img')!.getAttribute('src')).toBe(PNG.blau);
    });

    it('[REQ-016/AK-6] Standard-Kamera ohne Zugriff (jsdom: keine Kamera): Auslöser ohne Wirkung, Bild unverändert', async () => {
      const { s } = await zeige(undefined, { cover: PNG.rot });
      const daten = new Map(s.daten);
      await waehle('cover', 'Scannen');
      const k = await screen.findByRole('region', { name: 'Kamera' });
      await ruhe();
      fireEvent.click(within(k).getByRole('button', { name: 'Foto aufnehmen' }));
      await ruhe();
      expect(zuschnitt()).toBeNull();
      expect(s.daten).toEqual(daten);
      fireEvent.click(within(kamera()!).getByRole('button', { name: 'Zurück' }));
      await screen.findByRole('region', { name: 'Buchdetails' });
      expect(bereich('cover').querySelector('img')!.getAttribute('src')).toBe(PNG.rot);
    });
  });
});
