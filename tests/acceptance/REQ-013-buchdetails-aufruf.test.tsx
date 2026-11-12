/**
 * Akzeptanztests REQ-013 – Buchdetails: Aufruf, Kopfzeile und Rückweg.
 *
 * Abgeleitet aus dem REQ-Text und der verbindlichen Schnittstellen-Absprache in
 * sprints/sprint-03/plan.md, „Schnittstellen-Absprache Entwickler ↔ Tester (Runde 1)“:
 *  - Klick auf Cover (img bzw. data-cover-platzhalter) oder data-buchtitel in „Noch zu lesen“
 *    öffnet <section aria-label="Buchdetails">; Reiter „Bücher“ bleibt aktiv (aria-current="page").
 *  - Kopfzeile: <button aria-label="Zurück"> (data-icon="icon-zurueck.png") und
 *    <button aria-label="Weitere Optionen"> (data-icon="icon-mehr.png"), Farbe var(--bz-farbe-tertiaer).
 *  - BuchDetails-Props { buchId, bildquelle?, bildspeicher?, onZurueck }.
 *  - Titel unter dem Buch: data-buchdetails-titel (REQ-018).
 *
 * Testdaten: Die Demodaten (Datenquelle des Prototyps) werden durch eigene Testbücher ersetzt.
 * Lage „oben links/rechts“ wird über die Reihenfolge in der Kopfzeile geprüft; Optik manuell.
 */
import '@testing-library/jest-dom/vitest';
import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import type { CSSProperties } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import App from '@/App';
import BuchDetails from '@/views/BuchDetails';
import BuecherAnsicht from '@/views/BuecherAnsicht';
import { InMemoryAnsichtRepository } from '@/storage';
import { InMemoryBookRepository } from '@/storage/InMemoryBookRepository';
import { InMemoryImageStore } from '@/storage/InMemoryImageStore';
import { farbrubriken, farbVariablen } from '@/theme';

const T = vi.hoisted(() => {
  const png = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAIAAACQd1PeAAAADElEQVR4nGP4z8AAAAMBAQDJ/pLvAAAAAElFTkSuQmCC';
  return {
    buecher: [
      { id: '13000000-0000-4000-8000-000000000001', titel: 'Erstes Buch mit Cover', status: 'ungelesen' as const, cover: png },
      { id: '13000000-0000-4000-8000-000000000002', titel: 'Zweites Buch ohne Cover', status: 'ungelesen' as const },
      { id: '13000000-0000-4000-8000-000000000003', titel: 'Drittes Buch ohne Cover', status: 'ungelesen' as const },
      { id: '13000000-0000-4000-8000-000000000004', titel: 'Viertes Buch mit Cover', status: 'ungelesen' as const, cover: png },
    ],
  };
});
vi.mock('@/buecher/demodaten', () => ({ demoBuecher: T.buecher }));

const [MIT_COVER, OHNE_A, OHNE_B, MIT_COVER_2] = T.buecher;
const rubriken = farbrubriken as unknown as Record<string, { wert: string }>;

afterEach(() => cleanup());

// --------------------------------------------------------------------------- Hilfen
const nav = () => screen.getByRole('navigation', { name: 'Hauptnavigation' });
const tapMenue = (label: string) => fireEvent.click(within(nav()).getByRole('button', { name: label }));
const details = () => screen.queryByRole('region', { name: 'Buchdetails' });
const nochZuLesen = () => screen.getByRole('region', { name: 'Noch zu lesen' });

async function appAufBuecher() {
  render(<App />);
  tapMenue('Bücher');
  await within(nochZuLesen()).findByRole('list');
}
function eintragVon(titel: string) {
  const li = within(within(nochZuLesen()).getByRole('list')).getAllByRole('listitem').find((l) => l.querySelector('[data-buchtitel]')?.textContent?.trim() === titel);
  expect(li, `Bucheintrag „${titel}“`).toBeTruthy();
  return li!;
}
async function detailsTitel() {
  const d = await screen.findByRole('region', { name: 'Buchdetails' });
  const t = await within(d).findByText((_, el) => el?.hasAttribute('data-buchdetails-titel') ?? false);
  return t.textContent?.trim();
}
function berechneteFarbe(ctx: HTMLElement, ausdruck: string) {
  const probe = document.createElement('span');
  probe.style.setProperty('color', ausdruck);
  ctx.appendChild(probe);
  const wert = getComputedStyle(probe).color;
  probe.remove();
  return wert;
}
/** Dargestellte Farbe eines Masken-Icons (Hintergrundfarbe) bzw. eines Text-/SVG-Icons (Schriftfarbe). */
function iconFarben(icon: HTMLElement) {
  const cs = getComputedStyle(icon);
  return [cs.backgroundColor, cs.color];
}
async function zeigeDetails(buchId = OHNE_A.id, onZurueck = vi.fn()) {
  const { container } = render(
    <div data-testwurzel="" style={farbVariablen() as CSSProperties}>
      <BuchDetails buchId={buchId} onZurueck={onZurueck} />
    </div>,
  );
  await screen.findByRole('region', { name: 'Buchdetails' });
  return { wurzel: container.firstElementChild as HTMLElement, onZurueck };
}
const kopfButton = (name: 'Zurück' | 'Weitere Optionen') => within(details()!).getByRole('button', { name });

// ===========================================================================
describe('REQ-013 Buchdetails – Aufruf, Kopfzeile und Rückweg', () => {
  describe('AK-1 Antippen des Covers öffnet die Buchdetails', () => {
    it('[REQ-013/AK-1] Cover (Bild) eines von mehreren Büchern antippen → Buchdetails genau dieses Buches', async () => {
      await appAufBuecher();
      expect(details()).toBeNull();
      const img = eintragVon(MIT_COVER_2.titel).querySelector('img')!;
      expect(img).not.toBeNull();
      fireEvent.click(img);
      expect(await detailsTitel()).toBe(MIT_COVER_2.titel);
    });

    it('[REQ-013/AK-1] Gegenprobe: das erste Buch zeigt seinen eigenen Titel, nicht den eines anderen', async () => {
      await appAufBuecher();
      fireEvent.click(eintragVon(MIT_COVER.titel).querySelector('img')!);
      expect(await detailsTitel()).toBe(MIT_COVER.titel);
      const d = details()!;
      for (const anderes of [OHNE_A, OHNE_B, MIT_COVER_2]) expect(within(d).queryByText(anderes.titel)).toBeNull();
    });

    it('[REQ-013/AK-1] die Buchdetails ersetzen die Seite „Bücher“ (keine Überschrift „Deine Bücher“ mehr)', async () => {
      await appAufBuecher();
      fireEvent.click(eintragVon(MIT_COVER.titel).querySelector('img')!);
      await detailsTitel();
      expect(screen.queryByRole('heading', { name: 'Deine Bücher' })).toBeNull();
    });
  });

  describe('AK-2 Auch Bücher ohne Buchcover', () => {
    it.each([OHNE_A, OHNE_B])('[REQ-013/AK-2] Cover-Platzhalter von „$titel“ antippen → Buchdetails dieses Buches', async (b) => {
      await appAufBuecher();
      const p = eintragVon(b.titel).querySelector<HTMLElement>('[data-cover-platzhalter]')!;
      expect(p).not.toBeNull();
      fireEvent.click(p);
      expect(await detailsTitel()).toBe(b.titel);
    });

    it('[REQ-013/AK-2] auch ein Tippen auf das Herz-Icon im Platzhalter öffnet die Buchdetails', async () => {
      await appAufBuecher();
      const herz = eintragVon(OHNE_B.titel).querySelector<HTMLElement>('[data-cover-platzhalter] [data-icon]')!;
      expect(herz).not.toBeNull();
      fireEvent.click(herz);
      expect(await detailsTitel()).toBe(OHNE_B.titel);
    });
  });

  describe('AK-3 Antippen des Titels öffnet die Buchdetails', () => {
    it.each([MIT_COVER, OHNE_A, MIT_COVER_2])('[REQ-013/AK-3] Titel „$titel“ antippen → Buchdetails dieses Buches', async (b) => {
      await appAufBuecher();
      fireEvent.click(eintragVon(b.titel).querySelector('[data-buchtitel]')!);
      expect(await detailsTitel()).toBe(b.titel);
    });

    it('[REQ-013/AK-3] Negativfall: Antippen der Überschrift „Noch zu lesen“ oder von „Deine Bücher“ öffnet keine Buchdetails', async () => {
      await appAufBuecher();
      fireEvent.click(within(nochZuLesen()).getByRole('heading', { name: 'Noch zu lesen' }));
      fireEvent.click(screen.getByRole('heading', { name: 'Deine Bücher' }));
      fireEvent.click(within(nochZuLesen()).getByRole('list'));
      expect(details()).toBeNull();
    });
  });

  describe('AK-4 Reiter „Bücher“ bleibt aktiv', () => {
    it('[REQ-013/AK-4] in den Buchdetails ist die Hauptnavigation sichtbar und genau „Bücher“ aktiv', async () => {
      await appAufBuecher();
      fireEvent.click(eintragVon(OHNE_A.titel).querySelector('[data-buchtitel]')!);
      await detailsTitel();
      expect(nav()).toBeVisible();
      const buttons = within(nav()).getAllByRole('button');
      const aktiv = buttons.filter((b) => b.getAttribute('aria-current') === 'page');
      expect(aktiv).toHaveLength(1);
      expect(aktiv[0]).toHaveAccessibleName('Bücher');
    });

    it('[REQ-013/AK-4] die Buchdetails liegen im Inhaltsbereich (main), nicht über der Navigation', async () => {
      await appAufBuecher();
      fireEvent.click(eintragVon(OHNE_A.titel).querySelector('[data-buchtitel]')!);
      await detailsTitel();
      expect(screen.getByRole('main').contains(details())).toBe(true);
      expect(details()!.contains(nav())).toBe(false);
    });
  });

  describe('AK-5 Kopfzeile: Zurück-Pfeil und drei Punkte, kein „Kaufen“', () => {
    it('[REQ-013/AK-5] Zurück-Pfeil (icon-zurueck.png) steht vor der Drei-Punkte-Schaltfläche (icon-mehr.png)', async () => {
      await zeigeDetails();
      const z = kopfButton('Zurück');
      const m = kopfButton('Weitere Optionen');
      expect(z.querySelector('[data-icon="icon-zurueck.png"]')).not.toBeNull();
      expect(m.querySelector('[data-icon="icon-mehr.png"]')).not.toBeNull();
      expect(z.compareDocumentPosition(m) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    });

    it('[REQ-013/AK-5] Zurück-Pfeil und drei Punkte stehen vor (über) der Buchdarstellung', async () => {
      await zeigeDetails();
      const erstesBereich = details()!.querySelector('[data-bereich]')!;
      expect(erstesBereich).not.toBeNull();
      for (const b of [kopfButton('Zurück'), kopfButton('Weitere Optionen')]) {
        expect(b.compareDocumentPosition(erstesBereich) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
      }
    });

    it('[REQ-013/AK-5] je genau ein Zurück-Pfeil und eine Drei-Punkte-Schaltfläche', async () => {
      await zeigeDetails();
      expect(within(details()!).getAllByRole('button', { name: 'Zurück' })).toHaveLength(1);
      expect(within(details()!).getAllByRole('button', { name: 'Weitere Optionen' })).toHaveLength(1);
    });

    it('[REQ-013/AK-5] Negativfall: es gibt keine Funktion „Kaufen“', async () => {
      await zeigeDetails();
      expect(within(details()!).queryByText(/kauf/i)).toBeNull();
      expect(within(details()!).queryAllByRole('button', { name: /kauf|shop|bestell/i })).toHaveLength(0);
      expect(within(details()!).queryAllByRole('link')).toHaveLength(0);
    });
  });

  describe('AK-6 Zurück-Pfeil führt zur Seite „Bücher“', () => {
    it('[REQ-013/AK-6] App: Zurück-Pfeil → „Deine Bücher“, Buchdetails verschwunden', async () => {
      await appAufBuecher();
      fireEvent.click(eintragVon(OHNE_A.titel).querySelector('[data-cover-platzhalter]')!);
      await detailsTitel();
      fireEvent.click(kopfButton('Zurück'));
      expect(await screen.findByRole('heading', { name: 'Deine Bücher' })).toBeInTheDocument();
      expect(details()).toBeNull();
      expect(within(nav()).getByRole('button', { name: 'Bücher' })).toHaveAttribute('aria-current', 'page');
    });

    it('[REQ-013/AK-6] App: danach lässt sich ein anderes Buch erneut öffnen', async () => {
      await appAufBuecher();
      fireEvent.click(eintragVon(OHNE_A.titel).querySelector('[data-buchtitel]')!);
      await detailsTitel();
      fireEvent.click(kopfButton('Zurück'));
      await screen.findByRole('heading', { name: 'Deine Bücher' });
      fireEvent.click(eintragVon(OHNE_B.titel).querySelector('[data-buchtitel]')!);
      expect(await detailsTitel()).toBe(OHNE_B.titel);
    });

    it('[REQ-013/AK-6] Komponente: Zurück-Pfeil ruft onZurueck genau einmal auf', async () => {
      const { onZurueck } = await zeigeDetails();
      fireEvent.click(kopfButton('Zurück'));
      expect(onZurueck).toHaveBeenCalledTimes(1);
    });
  });

  describe('AK-7 Reiter „Bücher“ führt zur Seite „Bücher“', () => {
    it('[REQ-013/AK-7] in den Buchdetails „Bücher“ antippen → „Deine Bücher“, Buchdetails verschwunden', async () => {
      await appAufBuecher();
      fireEvent.click(eintragVon(MIT_COVER.titel).querySelector('img')!);
      await detailsTitel();
      tapMenue('Bücher');
      expect(await screen.findByRole('heading', { name: 'Deine Bücher' })).toBeInTheDocument();
      expect(details()).toBeNull();
    });

    it('[REQ-013/AK-7] Gegenprobe: anderer Reiter verlässt die Buchdetails, „Bücher“ führt danach zu „Deine Bücher“', async () => {
      await appAufBuecher();
      fireEvent.click(eintragVon(MIT_COVER.titel).querySelector('img')!);
      await detailsTitel();
      tapMenue('Start');
      expect(details()).toBeNull();
      tapMenue('Bücher');
      expect(await screen.findByRole('heading', { name: 'Deine Bücher' })).toBeInTheDocument();
      expect(details()).toBeNull();
    });
  });

  describe('AK-8 Drei Punkte ohne Funktion', () => {
    it('[REQ-013/AK-8] Antippen der drei Punkte ändert nichts: dasselbe Buch, kein Menü, kein Fenster', async () => {
      await appAufBuecher();
      fireEvent.click(eintragVon(OHNE_B.titel).querySelector('[data-buchtitel]')!);
      await detailsTitel();
      const vorher = document.body.innerHTML;
      const m = kopfButton('Weitere Optionen');
      fireEvent.pointerDown(m);
      fireEvent.click(m);
      fireEvent.click(m.querySelector('[data-icon]')!);
      expect(document.body.innerHTML).toBe(vorher);
      expect(await detailsTitel()).toBe(OHNE_B.titel);
      expect(screen.queryByRole('menu')).toBeNull();
      expect(screen.queryByRole('dialog')).toBeNull();
    });

    it('[REQ-013/AK-8] Komponente: drei Punkte lösen keinen Rückweg aus', async () => {
      const { onZurueck } = await zeigeDetails();
      fireEvent.click(kopfButton('Weitere Optionen'));
      expect(onZurueck).not.toHaveBeenCalled();
      expect(details()).not.toBeNull();
    });
  });

  describe('AK-9 Zurück-Pfeil und drei Punkte in Tertiär', () => {
    it.each(['Zurück', 'Weitere Optionen'] as const)('[REQ-013/AK-9] „%s“: Icon in „Tertiär“ (wie „Deine Bücher“)', async (name) => {
      const { wurzel } = await zeigeDetails();
      const icon = kopfButton(name).querySelector<HTMLElement>('[data-icon]')!;
      expect(icon.getAttribute('style') ?? '').toContain('var(--bz-farbe-tertiaer)');
      expect(iconFarben(icon)).toContain(berechneteFarbe(wurzel, rubriken.tertiaer.wert));
    });

    it('[REQ-013/AK-9] App: Pfeil, drei Punkte und „Deine Bücher“ haben dieselbe Farbe', async () => {
      await appAufBuecher();
      const deineBuecher = getComputedStyle(screen.getByRole('heading', { name: 'Deine Bücher' })).color;
      fireEvent.click(eintragVon(OHNE_A.titel).querySelector('[data-buchtitel]')!);
      await detailsTitel();
      for (const name of ['Zurück', 'Weitere Optionen'] as const) {
        expect(iconFarben(kopfButton(name).querySelector<HTMLElement>('[data-icon]')!)).toContain(deineBuecher);
      }
    });
  });

  describe('AK-10 Farbe aus zentraler Farbrubrik', () => {
    it('[REQ-013/AK-10] Änderung von „Tertiär“ an zentraler Stelle wirkt auf Pfeil und drei Punkte', async () => {
      const r = rubriken.tertiaer;
      const alt = r.wert;
      const neu = rubriken.primaer.wert;
      r.wert = neu;
      try {
        const { wurzel } = await zeigeDetails();
        for (const name of ['Zurück', 'Weitere Optionen'] as const) {
          const f = iconFarben(kopfButton(name).querySelector<HTMLElement>('[data-icon]')!);
          expect(f, `${name}: neuer Wert`).toContain(berechneteFarbe(wurzel, neu));
          expect(f, `${name}: alter Wert`).not.toContain(berechneteFarbe(wurzel, alt));
        }
      } finally {
        r.wert = alt;
      }
    });
  });
});

// ---------------------------------------------------------------------------
// Fassung 2026-11-12: Aufruf auch aus „Alle Bücher“ (REQ-035) und den Übersichten; Rückweg in die Übersicht (AK-11).
describe('REQ-013 Fassung 2026-11-12: Abschnitt „Alle Bücher“ und Übersichten', () => {
  const B = [
    { id: '13130000-0000-4000-8000-000000000001', titel: 'Ungelesenes', status: 'ungelesen' as const, eingetragenAm: '2026-01-01T00:00:00.000Z' },
    { id: '13130000-0000-4000-8000-000000000002', titel: 'Gelesenes', status: 'gelesen' as const, eingetragenAm: '2026-01-02T00:00:00.000Z' },
    { id: '13130000-0000-4000-8000-000000000003', titel: 'Lesendes', status: 'am_lesen' as const, eingetragenAm: '2026-01-03T00:00:00.000Z' },
  ];
  const uebersicht = () => document.querySelector<HTMLElement>('[data-uebersicht]');
  const geladen = () => waitFor(() => expect(uebersicht()?.getAttribute('data-ansicht')).toMatch(/^(raster|liste)$/));
  async function seite() {
    const repository = new InMemoryBookRepository();
    for (const b of B) await repository.save(b);
    render(<BuecherAnsicht repository={repository} bildspeicher={new InMemoryImageStore()} ansichtRepository={new InMemoryAnsichtRepository()} />);
    await waitFor(() => expect(document.querySelector('[data-abschnitt="alle-buecher"] ul')).not.toBeNull());
  }
  async function detailsVon(titel: string) {
    const d = await screen.findByRole('region', { name: 'Buchdetails' });
    await waitFor(() => expect(d.querySelector('[data-buchdetails-titel]')?.textContent?.trim()).toBe(titel));
    return d;
  }
  const eintragAlle = (titel: string) =>
    Array.from(document.querySelectorAll<HTMLElement>('[data-abschnitt="alle-buecher"] li[data-bucheintrag]')).find(
      (l) => l.querySelector('[data-buchtitel]')?.textContent?.trim() === titel,
    )!;

  it('[REQ-013/AK-1] Cover im Abschnitt „Alle Bücher“ öffnet die Buchdetails genau dieses Buches', async () => {
    await seite();
    fireEvent.click(eintragAlle('Gelesenes').querySelector('img, [data-cover-platzhalter]')!);
    await detailsVon('Gelesenes');
  });

  it('[REQ-013/AK-3] Titel im Abschnitt „Alle Bücher“ öffnet die Buchdetails genau dieses Buches', async () => {
    await seite();
    fireEvent.click(eintragAlle('Lesendes').querySelector('[data-buchtitel]')!);
    await detailsVon('Lesendes');
  });

  it('[REQ-013/AK-6] aus „Alle Bücher“ geöffnet: Zurück führt zur Seite „Bücher“', async () => {
    await seite();
    fireEvent.click(eintragAlle('Gelesenes').querySelector('[data-buchtitel]')!);
    const d = await detailsVon('Gelesenes');
    fireEvent.click(within(d).getByRole('button', { name: 'Zurück' }));
    await waitFor(() => expect(document.querySelector('[data-seite="buecher"]')).not.toBeNull());
    expect(uebersicht()).toBeNull();
  });

  it.each([
    ['alle', 'Alle'],
    ['gerade_am_lesen', 'Gerade am Lesen'],
    ['noch_zu_lesen', 'Noch zu lesen'],
  ])('[REQ-013/AK-11] aus der Übersicht „%s“ geöffnet: Zurück führt wieder in diese Übersicht', async (id, pille) => {
    await seite();
    if (id === 'noch_zu_lesen') fireEvent.click(document.querySelector('[data-abschnitt="noch-zu-lesen"] [data-alle-ansehen]')!);
    else fireEvent.click(within(screen.getByRole('group', { name: 'Filter' })).getByRole('button', { name: pille }));
    await geladen();
    const t = uebersicht()!.querySelector('ul[data-buecher] [data-buchtitel]')!;
    const titel = t.textContent!.trim();
    fireEvent.click(t);
    const d = await detailsVon(titel);
    fireEvent.click(within(d).getByRole('button', { name: 'Zurück' }));
    await geladen();
    expect(uebersicht()!.getAttribute('data-uebersicht')).toBe(id);
    expect(document.querySelector('[data-seite="buecher"]')).toBeNull();
  });

  it('[REQ-013/AK-11] Negativfall: nach Rückkehr in die Übersicht und Wechsel zur Seite führt Zurück aus „Noch zu lesen“ wieder zur Seite', async () => {
    await seite();
    fireEvent.click(within(screen.getByRole('group', { name: 'Filter' })).getByRole('button', { name: 'Alle' }));
    await geladen();
    fireEvent.click(within(screen.getByRole('group', { name: 'Filter' })).getByRole('button', { name: 'Für dich' }));
    const li = Array.from(document.querySelectorAll<HTMLElement>('[data-abschnitt="noch-zu-lesen"] li')).find(
      (l) => l.querySelector('[data-buchtitel]')?.textContent?.trim() === 'Ungelesenes',
    )!;
    fireEvent.click(li.querySelector('[data-buchtitel]')!);
    const d = await detailsVon('Ungelesenes');
    fireEvent.click(within(d).getByRole('button', { name: 'Zurück' }));
    await waitFor(() => expect(document.querySelector('[data-seite="buecher"]')).not.toBeNull());
    expect(uebersicht()).toBeNull();
  });
});
