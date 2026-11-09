/**
 * Akzeptanztests REQ-020 – Frontcover in Buchlisten.
 *
 * Abgeleitet aus dem REQ-Text und der Schnittstellen-Absprache (sprints/sprint-03/plan.md, Runde 1):
 *  - Hat ein Buch ein Cover (Bereich „cover“) im ImageStore, zeigt die Liste <img> statt data-cover-platzhalter.
 *  - Aufruf der Buchdetails per Klick auf Cover/Titel in „Noch zu lesen“ (REQ-013).
 * Bildquelle und ImageStore werden als Test-Doubles über die Props der Seite „Bücher“ übergeben
 * (BuecherAnsicht { bildquelle?, bildspeicher? }, vom Entwickler zu den Absprache-Props ergänzt).
 * Größe/Unverzerrtheit der Cover in der Liste prüft REQ-009 (AK-7); hier strukturell dieselbe Darstellung.
 */
import '@testing-library/jest-dom/vitest';
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import type { CSSProperties } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import BuecherAnsicht from '@/views/BuecherAnsicht';
import type { Bildquelle } from '@/bild/bildquelle';
import type { Buch } from '@/domain/buch';
import type { ImageStore } from '@/storage/ImageStore';
import { farbVariablen } from '@/theme';

const PNG = {
  rot: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAIAAACQd1PeAAAADElEQVR4nGP4z8AAAAMBAQDJ/pLvAAAAAElFTkSuQmCC',
  gruen: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAIAAACQd1PeAAAADElEQVR4nGNgaGAAAAEEAIFw9selAAAAAElFTkSuQmCC',
  blau: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAIAAACQd1PeAAAADElEQVR4nGNgYPgPAAEDAQAIicLsAAAAAElFTkSuQmCC',
};
const BUECHER: Buch[] = [
  { id: '20000000-0000-4000-8000-000000000001', titel: 'Momo', status: 'ungelesen' },
  { id: '20000000-0000-4000-8000-000000000002', titel: 'Krabat', status: 'ungelesen' },
  { id: '20000000-0000-4000-8000-000000000003', titel: 'Das Sams', status: 'ungelesen' },
];
const [MOMO, KRABAT, SAMS] = BUECHER;

afterEach(() => cleanup());

// --------------------------------------------------------------------------- Hilfen
function speicher(start: Record<string, string> = {}) {
  const daten = new Map(Object.entries(start));
  const s = {
    daten,
    get: async (buchId: string, bereich: string) => daten.get(`${buchId}|${bereich}`),
    put: async (buchId: string, bereich: string, dataUrl: string) => void daten.set(`${buchId}|${bereich}`, dataUrl),
    remove: async (buchId: string, bereich: string) => void daten.delete(`${buchId}|${bereich}`),
  };
  return s as typeof s & ImageStore;
}
async function zeige(s: ImageStore, neu: string | null = PNG.gruen) {
  const q: Bildquelle = { scannen: async () => neu, galerie: async () => neu };
  render(
    <div style={farbVariablen() as CSSProperties}>
      <BuecherAnsicht buecher={BUECHER} bildquelle={q} bildspeicher={s} />
    </div>,
  );
  await within(screen.getByRole('region', { name: 'Noch zu lesen' })).findByRole('list');
  await new Promise((r) => setTimeout(r, 10));
}
function eintrag(titel: string) {
  const liste = within(screen.getByRole('region', { name: 'Noch zu lesen' })).getByRole('list');
  const li = within(liste)
    .getAllByRole('listitem')
    .find((l) => l.querySelector('[data-buchtitel]')?.textContent?.trim() === titel);
  expect(li, `Eintrag ${titel}`).toBeTruthy();
  return li!;
}
const coverIn = (titel: string) => eintrag(titel).querySelector('img')?.getAttribute('src') ?? null;
const platzhalterIn = (titel: string) => eintrag(titel).querySelector('[data-cover-platzhalter]');
async function oeffneDetails(titel: string) {
  fireEvent.click(eintrag(titel).querySelector('[data-buchtitel]')!);
  return screen.findByRole('region', { name: 'Buchdetails' });
}
async function zurueck() {
  fireEvent.click(within(screen.getByRole('region', { name: 'Buchdetails' })).getByRole('button', { name: 'Zurück' }));
  await screen.findByRole('heading', { name: 'Deine Bücher' });
  await new Promise((r) => setTimeout(r, 10));
}
async function hinterlege(bereich: 'ruecken' | 'cover' | 'schnitt') {
  fireEvent.click(document.querySelector(`[data-bereich="${bereich}"]`)!);
  const m = await screen.findByRole('menu', { name: 'Bild hinzufügen' });
  fireEvent.click(within(m).getByRole('menuitem', { name: 'Aus Galerie auswählen' }));
  const z = await screen.findByRole('region', { name: 'Zuschnitt' });
  fireEvent.click(within(z).getByRole('button', { name: 'Bestätigen' }));
  await vi.waitFor(() => expect(document.querySelector(`[data-bereich="${bereich}"] img`)).not.toBeNull());
}
async function entferneCover() {
  fireEvent.click(document.querySelector('[data-bereich="cover"]')!);
  const m = await screen.findByRole('menu', { name: 'Bild hinzufügen' });
  fireEvent.click(within(m).getByRole('menuitem', { name: 'Foto entfernen' }));
  await vi.waitFor(() => expect(document.querySelector('[data-bereich="cover"] img')).toBeNull());
}

// ===========================================================================
describe('REQ-020 Frontcover in Buchlisten', () => {
  describe('AK-1 Frontcover statt Herz-Platzhalter', () => {
    it('[REQ-020/AK-1] Cover in den Buchdetails hinterlegen, zurück → Eintrag zeigt das Frontcover, kein Herz', async () => {
      const s = speicher();
      await zeige(s);
      expect(platzhalterIn(MOMO.titel)).not.toBeNull();
      await oeffneDetails(MOMO.titel);
      await hinterlege('cover');
      await zurueck();
      await vi.waitFor(() => expect(coverIn(MOMO.titel)).not.toBeNull());
      expect(coverIn(MOMO.titel)).toBe(s.daten.get(`${MOMO.id}|cover`));
      expect(platzhalterIn(MOMO.titel)).toBeNull();
      expect(eintrag(MOMO.titel).querySelector('[data-icon="icon-herz.png"]')).toBeNull();
    });

    it('[REQ-020/AK-1] ein bereits gespeichertes Frontcover erscheint beim Aufruf der Seite (z. B. nach Neustart)', async () => {
      await zeige(speicher({ [`${KRABAT.id}|cover`]: PNG.rot }));
      await vi.waitFor(() => expect(coverIn(KRABAT.titel)).toBe(PNG.rot));
      expect(platzhalterIn(KRABAT.titel)).toBeNull();
    });

    it('[REQ-020/AK-1] das Frontcover wird wie ein Buchcover aus REQ-009 dargestellt (gleiche Darstellung, Alternativtext)', async () => {
      const ref: Buch = { id: '20000000-0000-4000-8000-0000000000ff', titel: 'Mit Cover', status: 'ungelesen', cover: PNG.blau };
      render(
        <div style={farbVariablen() as CSSProperties}>
          <BuecherAnsicht buecher={[ref]} bildspeicher={speicher()} />
        </div>,
      );
      const refImg = await within(screen.getByRole('region', { name: 'Noch zu lesen' })).findByRole('img');
      const refStil = refImg.getAttribute('style');
      cleanup();
      await zeige(speicher({ [`${MOMO.id}|cover`]: PNG.rot }));
      await vi.waitFor(() => expect(coverIn(MOMO.titel)).toBe(PNG.rot));
      const img = eintrag(MOMO.titel).querySelector('img')!;
      expect(img.getAttribute('style')).toBe(refStil);
      expect(img).toHaveAttribute('alt', MOMO.titel);
    });

    it('[REQ-020/AK-1] das Frontcover aus den Buchdetails hat Vorrang vor einem bisherigen Buchcover', async () => {
      const mitCover: Buch = { ...SAMS, cover: PNG.blau };
      render(
        <div style={farbVariablen() as CSSProperties}>
          <BuecherAnsicht buecher={[mitCover]} bildspeicher={speicher({ [`${SAMS.id}|cover`]: PNG.rot })} />
        </div>,
      );
      await within(screen.getByRole('region', { name: 'Noch zu lesen' })).findByRole('list');
      await vi.waitFor(() => expect(coverIn(SAMS.titel)).toBe(PNG.rot));
    });
  });

  describe('AK-2 Nur dieses Buch betroffen', () => {
    it('[REQ-020/AK-2] Frontcover für ein Buch → die übrigen zeigen weiterhin den Cover-Platzhalter', async () => {
      const s = speicher();
      await zeige(s);
      await oeffneDetails(KRABAT.titel);
      await hinterlege('cover');
      await zurueck();
      await vi.waitFor(() => expect(coverIn(KRABAT.titel)).not.toBeNull());
      for (const b of [MOMO, SAMS]) {
        expect(platzhalterIn(b.titel), b.titel).not.toBeNull();
        expect(coverIn(b.titel), b.titel).toBeNull();
      }
    });
  });

  describe('AK-3 Buchrücken und Schnitt erscheinen nicht in Listen', () => {
    it('[REQ-020/AK-3] Buch nur mit Buchrücken und Schnitt → Cover-Platzhalter in der Liste', async () => {
      await zeige(speicher({ [`${MOMO.id}|ruecken`]: PNG.rot, [`${MOMO.id}|schnitt`]: PNG.blau }));
      expect(platzhalterIn(MOMO.titel)).not.toBeNull();
      expect(eintrag(MOMO.titel).querySelectorAll('img')).toHaveLength(0);
    });

    it('[REQ-020/AK-3] Buchrücken und Schnitt in den Buchdetails hinterlegen, zurück → weiterhin Platzhalter', async () => {
      const s = speicher();
      await zeige(s);
      await oeffneDetails(SAMS.titel);
      await hinterlege('ruecken');
      await hinterlege('schnitt');
      await zurueck();
      expect(platzhalterIn(SAMS.titel)).not.toBeNull();
      expect(eintrag(SAMS.titel).querySelectorAll('img')).toHaveLength(0);
      expect([...s.daten.keys()].sort()).toEqual([`${SAMS.id}|ruecken`, `${SAMS.id}|schnitt`]);
    });
  });

  describe('AK-4 Entferntes Frontcover: wieder Platzhalter', () => {
    it('[REQ-020/AK-4] Frontcover über „Foto entfernen“ löschen, zurück → wieder Cover-Platzhalter', async () => {
      const s = speicher({ [`${MOMO.id}|cover`]: PNG.rot, [`${MOMO.id}|ruecken`]: PNG.blau });
      await zeige(s);
      await vi.waitFor(() => expect(coverIn(MOMO.titel)).toBe(PNG.rot));
      await oeffneDetails(MOMO.titel);
      await vi.waitFor(() => expect(document.querySelector('[data-bereich="cover"] img')).not.toBeNull());
      await entferneCover();
      await zurueck();
      expect(platzhalterIn(MOMO.titel)).not.toBeNull();
      expect(coverIn(MOMO.titel)).toBeNull();
      expect(eintrag(MOMO.titel).querySelector('[data-icon="icon-herz.png"]')).not.toBeNull();
    });

    it('[REQ-020/AK-4] Entfernen, dann neues Cover: die Liste zeigt das neue, nicht das alte Cover', async () => {
      const s = speicher({ [`${KRABAT.id}|cover`]: PNG.rot });
      await zeige(s, PNG.gruen);
      await oeffneDetails(KRABAT.titel);
      await vi.waitFor(() => expect(document.querySelector('[data-bereich="cover"] img')).not.toBeNull());
      await entferneCover();
      await hinterlege('cover');
      await zurueck();
      await vi.waitFor(() => expect(coverIn(KRABAT.titel)).toBe(s.daten.get(`${KRABAT.id}|cover`)));
      expect(coverIn(KRABAT.titel)).not.toBe(PNG.rot);
    });
  });
});
