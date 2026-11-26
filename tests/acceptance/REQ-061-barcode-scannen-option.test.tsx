/**
 * Akzeptanztests REQ-061 – Menü „Buch hinzufügen“: Option „Barcode scannen“ und Scan-Bildschirm.
 *
 * Schnittstellen laut Entwickler (Sprint 06):
 *  - BuecherAnsicht { barcodeScanner, isbnSuche }; Scanner-Fake: starten({ video, beiIsbn }), lichtSetzen(an), beenden().
 *    Ein Fehler in `starten` steht für verweigerte Kamera bzw. keine Kamera.
 *  - Menü [data-option="barcode"|"von-hand"]; Scan-Ansicht [data-scan-bildschirm], [data-scan-rahmen], [data-scan-titel],
 *    [data-scan-hinweis], [data-scan-schliessen], [data-scan-licht][data-licht]; Seite „Bücher“ [data-seite="buecher"]
 *  - Android-Zurück-Taste: im Test per `popstate`.
 */
import '@testing-library/jest-dom/vitest';
import { act, cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import BuecherAnsicht from '@/views/BuecherAnsicht';
import type { Buch } from '@/domain/buch';
import type { BookRepository, ImageStore } from '@/storage';

const W = { timeout: 4000 };
const MOMO: Buch = { id: '61000000-0000-4000-8000-000000000001', titel: 'Momo', status: 'gelesen' };

function repoFake(start: Buch[] = [MOMO]) {
  const daten = new Map(start.map((b) => [b.id, { ...b }]));
  const r = {
    daten,
    list: vi.fn(async () => [...daten.values()].map((b) => ({ ...b }))),
    get: vi.fn(async (id: string) => (daten.has(id) ? { ...daten.get(id)! } : undefined)),
    save: vi.fn(async (b: Buch) => void daten.set(b.id, { ...b })),
    remove: vi.fn(async (id: string) => void daten.delete(id)),
  };
  return r as typeof r & BookRepository;
}
const bilder = { get: async () => undefined, put: vi.fn(async () => {}), remove: async () => {} } as unknown as ImageStore;

type Optionen = { video: HTMLVideoElement | null; beiIsbn: (isbn: string) => void };
function scannerFake(verweigert = false) {
  const s = {
    optionen: null as Optionen | null,
    starten: vi.fn(async (o: Optionen) => {
      if (verweigert) throw new Error('Kamerazugriff verweigert');
      s.optionen = o;
    }),
    lichtSetzen: vi.fn(async (_an: boolean) => {}),
    beenden: vi.fn(async () => {}),
  };
  return s;
}
function sucheFake() {
  return { suchen: vi.fn(() => new Promise<never>(() => {})) };
}

async function warte(ms = 30) {
  await act(async () => {
    await new Promise((r) => setTimeout(r, ms));
  });
}
async function tippe(el: Element) {
  await act(async () => {
    fireEvent.click(el);
    await new Promise((r) => setTimeout(r, 15));
  });
}
async function zeige(scanner = scannerFake(), suche = sucheFake(), repo = repoFake()) {
  render(<BuecherAnsicht repository={repo} bildspeicher={bilder} barcodeScanner={scanner} isbnSuche={suche} />);
  await screen.findByRole('heading', { name: 'Deine Bücher' }, W);
  return { scanner, suche, repo };
}
async function oeffneMenue() {
  await tippe(screen.getByRole('button', { name: 'Buch hinzufügen' }));
  return screen.findByRole('menu', { name: 'Buch hinzufügen' }, W);
}
const scan = () => document.querySelector<HTMLElement>('[data-scan-bildschirm]');
async function oeffneScan() {
  const m = await oeffneMenue();
  await tippe(m.querySelector('[data-option="barcode"]')!);
  await vi.waitFor(() => expect(scan()).not.toBeNull(), W);
}
const norm = (t: string | null | undefined) => (t ?? '').replace(/\s+/g, ' ').trim();
async function seiteBuecher() {
  await vi.waitFor(() => expect(document.querySelector('[data-seite="buecher"]')).not.toBeNull(), W);
  expect(scan()).toBeNull();
  expect(screen.getByRole('heading', { name: 'Deine Bücher' })).toBeVisible();
}

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe('REQ-061 Barcode scannen', () => {
  it('[REQ-061/AK-1] das Menü enthält „Von Hand eintragen“ und „Barcode scannen“ (je mit Titel, Untertitel und Icon)', async () => {
    await zeige();
    const m = await oeffneMenue();
    const opt = within(m).getAllByRole('menuitem');
    // Seit REQ-116 zusätzlich „Online suchen“ an erster Stelle.
    expect(opt).toHaveLength(3);
    const bc = within(m).getByRole('menuitem', { name: /Barcode scannen/ });
    expect(bc).toHaveAttribute('data-option', 'barcode');
    expect(within(m).getByRole('menuitem', { name: /Von Hand eintragen/ })).toHaveAttribute('data-option', 'von-hand');
    expect(bc.querySelector('[data-option-untertitel]')?.textContent?.trim()).toBeTruthy();
    expect(bc.querySelectorAll('[data-icon]')).toHaveLength(1);
    expect(bc.querySelectorAll('img, svg')).toHaveLength(0);
  });

  it('[REQ-061/AK-1] Öffnen des Menüs startet keine Kamera', async () => {
    const { scanner } = await zeige();
    await oeffneMenue();
    expect(scanner.starten).not.toHaveBeenCalled();
  });

  it('[REQ-061/AK-2] „Barcode scannen“ schließt das Menü und zeigt den Scan-Bildschirm, Kamera wird gestartet', async () => {
    const { scanner, repo } = await zeige();
    await oeffneScan();
    expect(screen.queryByRole('menu', { name: 'Buch hinzufügen' })).toBeNull();
    expect(screen.queryByRole('dialog', { name: 'Manueller Eintrag' })).toBeNull();
    await vi.waitFor(() => expect(scanner.starten).toHaveBeenCalledTimes(1), W);
    expect(repo.save).not.toHaveBeenCalled();
  });

  it('[REQ-061/AK-3] Kamerabild, Rahmen, X oben links, Taschenlampe oben rechts und beide Texte', async () => {
    const { scanner } = await zeige();
    await oeffneScan();
    const s = scan()!;
    await vi.waitFor(() => expect(scanner.starten).toHaveBeenCalled(), W);
    const video = s.querySelector('video');
    expect(video).not.toBeNull();
    expect(scanner.optionen?.video).toBe(video);
    expect(s.querySelector('[data-scan-rahmen]')).not.toBeNull();
    expect(norm(s.querySelector('[data-scan-titel]')?.textContent)).toBe('Richte den Barcode im Rahmen aus');
    expect(norm(s.querySelector('[data-scan-hinweis]')?.textContent)).toBe('Wir schlagen es automatisch nach, sobald es erkannt wurde.');
    const x = s.querySelector<HTMLElement>('[data-scan-schliessen]')!;
    const licht = s.querySelector<HTMLElement>('[data-scan-licht]')!;
    expect(x.tagName).toBe('BUTTON');
    expect(licht.tagName).toBe('BUTTON');
    expect(x.compareDocumentPosition(licht) & Node.DOCUMENT_POSITION_FOLLOWING, 'X vor (links von) der Taschenlampe').toBeTruthy();
  });

  it('[REQ-061/AK-4] Taschenlampe: aus → an → aus, das Licht der Kamera wird jeweils geschaltet', async () => {
    const { scanner } = await zeige();
    await oeffneScan();
    const licht = () => scan()!.querySelector<HTMLElement>('[data-scan-licht]')!;
    expect(licht()).toHaveAttribute('data-licht', 'aus');
    await tippe(licht());
    expect(licht()).toHaveAttribute('data-licht', 'an');
    expect(scanner.lichtSetzen).toHaveBeenLastCalledWith(true);
    await tippe(licht());
    expect(licht()).toHaveAttribute('data-licht', 'aus');
    expect(scanner.lichtSetzen).toHaveBeenLastCalledWith(false);
    expect(scanner.lichtSetzen).toHaveBeenCalledTimes(2);
  });

  it.each(['9783551551672', '3551551677'])('[REQ-061/AK-5] erkannte ISBN %s startet die Suche zu genau dieser ISBN ohne weitere Aktion', async (isbn) => {
    const { scanner, suche } = await zeige();
    await oeffneScan();
    await vi.waitFor(() => expect(scanner.optionen).not.toBeNull(), W);
    expect(suche.suchen).not.toHaveBeenCalled();
    await act(async () => {
      scanner.optionen!.beiIsbn(isbn);
      await new Promise((r) => setTimeout(r, 20));
    });
    expect(suche.suchen).toHaveBeenCalledTimes(1);
    expect(suche.suchen).toHaveBeenCalledWith(isbn);
  });

  it('[REQ-061/AK-5] Grenzfall: dieselbe ISBN mehrfach erkannt → genau eine Suche', async () => {
    const { scanner, suche } = await zeige();
    await oeffneScan();
    await vi.waitFor(() => expect(scanner.optionen).not.toBeNull(), W);
    await act(async () => {
      scanner.optionen!.beiIsbn('9783551551672');
      scanner.optionen!.beiIsbn('9783551551672');
      await new Promise((r) => setTimeout(r, 20));
    });
    expect(suche.suchen).toHaveBeenCalledTimes(1);
  });

  it('[REQ-061/AK-6] X: Seite „Bücher“, kein Buch angelegt, Kamera beendet, keine Suche', async () => {
    const { scanner, suche, repo } = await zeige();
    await oeffneScan();
    await tippe(scan()!.querySelector('[data-scan-schliessen]')!);
    await seiteBuecher();
    expect(repo.save).not.toHaveBeenCalled();
    expect(suche.suchen).not.toHaveBeenCalled();
    await vi.waitFor(() => expect(scanner.beenden).toHaveBeenCalled(), W);
  });

  it('[REQ-061/AK-6] Android-Zurück-Taste: Seite „Bücher“, kein Buch angelegt', async () => {
    const { repo } = await zeige();
    await oeffneScan();
    await act(async () => {
      window.dispatchEvent(new PopStateEvent('popstate', { state: null }));
      await new Promise((r) => setTimeout(r, 20));
    });
    await seiteBuecher();
    expect(repo.save).not.toHaveBeenCalled();
  });

  it('[REQ-061/AK-6] nach Abbruch ist die Seite wieder bedienbar und der Scan lässt sich erneut öffnen', async () => {
    const { scanner } = await zeige();
    await oeffneScan();
    await tippe(scan()!.querySelector('[data-scan-schliessen]')!);
    await seiteBuecher();
    await warte(50);
    await oeffneScan();
    await vi.waitFor(() => expect(scanner.starten).toHaveBeenCalledTimes(2), W);
  });

  it('[REQ-061/AK-7] Kamerazugriff verweigert: Seite „Bücher“, kein Buch angelegt, keine Suche', async () => {
    const scanner = scannerFake(true);
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const { suche, repo } = await zeige(scanner);
    const m = await oeffneMenue();
    await tippe(m.querySelector('[data-option="barcode"]')!);
    await warte(50);
    await seiteBuecher();
    expect(scanner.starten).toHaveBeenCalled();
    expect(repo.save).not.toHaveBeenCalled();
    expect(suche.suchen).not.toHaveBeenCalled();
    warn.mockRestore();
  });
});
