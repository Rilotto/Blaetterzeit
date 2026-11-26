/**
 * Akzeptanztests REQ-121 – Profil: Abschnitt „Deine Bibliothek“ mit Zeile „Aktueller Wert“
 * (Summe der Preise aller Bücher außer Wunschliste). Abgeleitet aus dem REQ-Text.
 * Schnittstellen laut Entwickler: section[data-profil-abschnitt="bibliothek"] (aria-label „Deine Bibliothek“),
 * h2[data-profil-ueberschrift], Karte [data-profil-karte-bibliothek], Zeile [data-profil-bibliothek-zeile="wert"]
 * mit [data-zeile-bezeichnung] und [data-bibliothekswert] [data-zeile-wert].
 * Ganze App: Standardspeicher auf fake-indexeddb, je Test frische Datenbank und neu geladene Module.
 */
import '@testing-library/jest-dom/vitest';
import { act, cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { IDBFactory, IDBKeyRange } from 'fake-indexeddb';
import type { ComponentType } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { Buch } from '@/domain/buch';
import { betragText, bibliothekswertCent } from '@/domain/bibliothekswert';
import { InMemoryProfilRepository } from '@/storage';
import { InMemoryBookRepository } from '@/storage/InMemoryBookRepository';
import ProfilAnsicht from '@/views/ProfilAnsicht';

vi.mock('@/buecher/demodaten', () => ({ demoBuecher: [] }));
beforeEach(() => {
  localStorage.clear();
  vi.stubGlobal('indexedDB', new IDBFactory());
  vi.stubGlobal('IDBKeyRange', IDBKeyRange);
});
afterEach(() => {
  cleanup();
  localStorage.clear();
  vi.unstubAllGlobals();
});

type Status = Buch['status'];
type Eintrag = { titel: string; status: Status; preisCent?: number; exemplar?: string };
const W = { timeout: 3000 };
const norm = (t: string | null | undefined) => (t ?? '').replace(/[\s  ]+/g, ' ').trim();
const buch = (e: Eintrag): Buch => {
  const b: Record<string, unknown> = { id: crypto.randomUUID(), titel: e.titel, autor: 'Testautor', status: e.status };
  if (e.preisCent !== undefined) b.preisCent = e.preisCent;
  if (e.exemplar !== undefined) b.exemplar = e.exemplar;
  return b as unknown as Buch;
};
async function warte(ms = 30) {
  await act(async () => {
    await new Promise((r) => setTimeout(r, ms));
  });
}
async function tippe(el: Element) {
  await act(async () => {
    fireEvent.click(el);
    await new Promise((r) => setTimeout(r, 20));
  });
}

/** Bestand aus AK-2. */
const AK2: Eintrag[] = [
  { titel: 'Buch A', status: 'gelesen', preisCent: 1299 },
  { titel: 'Buch B', status: 'ungelesen', preisCent: 2000 },
  { titel: 'Buch C', status: 'wunschliste', preisCent: 3000 },
  { titel: 'Buch D', status: 'abgebrochen', preisCent: 501 },
  { titel: 'Buch E', status: 'am_lesen' },
];

// ------------------------------------------------------------------ ProfilAnsicht mit eigenem Repository
const abschnitt = () => document.querySelector<HTMLElement>('section[data-profil-abschnitt="bibliothek"]');
const zeile = () => document.querySelector<HTMLElement>('[data-profil-bibliothek-zeile="wert"]');
const wertText = () => norm(zeile()?.querySelector('[data-bibliothekswert] [data-zeile-wert]')?.textContent);

async function zeigeProfil(eintraege: Eintrag[]) {
  const repo = new InMemoryBookRepository();
  for (const e of eintraege) await repo.save(buch(e));
  render(<ProfilAnsicht repository={repo} profilRepository={new InMemoryProfilRepository()} />);
  await vi.waitFor(() => expect(zeile()).not.toBeNull(), W);
  await warte();
  return repo;
}
async function erwarteWert(soll: string) {
  await vi.waitFor(() => expect(wertText()).toBe(soll), W);
  await warte(40);
  expect(wertText()).toBe(soll);
}

// ------------------------------------------------------------------ ganze App (Standardspeicher)
type AppWelt = { App: ComponentType<Record<string, unknown>> };
async function starteApp(eintraege: Eintrag[]): Promise<AppWelt> {
  vi.resetModules();
  const quelle = await import('@/buecher/buchQuelle');
  const repo = await quelle.standardRepository();
  for (const e of eintraege) await repo.save(buch(e));
  const st = await import('@/storage');
  const App = (await import('@/App')).default as unknown as ComponentType<Record<string, unknown>>;
  render(<App einstellungRepository={new st.InMemoryEinstellungRepository()} />);
  await warte();
  return { App };
}
const nav = () => screen.getByRole('navigation', { name: 'Hauptnavigation' });
async function oeffneProfil() {
  await tippe(within(nav()).getByRole('button', { name: 'Profil' }));
  await vi.waitFor(() => expect(zeile()).not.toBeNull(), W);
}
async function oeffneBuch(titel: string) {
  await tippe(within(nav()).getByRole('button', { name: 'Bücher' }));
  const t = await vi.waitFor(() => {
    const el = Array.from(document.querySelectorAll<HTMLElement>('[data-buchtitel]')).find((x) => norm(x.textContent) === titel);
    expect(el, `Buch „${titel}“ in der Liste`).toBeDefined();
    return el!;
  }, W);
  await tippe(t);
  return screen.findByRole('region', { name: 'Buchdetails' });
}
async function zurueck(d: HTMLElement) {
  await tippe(within(d).getByRole('button', { name: 'Zurück' }));
  await warte();
}
async function setzeStatus(d: HTMLElement, name: string) {
  const pille = await vi.waitFor(() => {
    const p = d.querySelector<HTMLElement>('[data-statuspille]');
    expect(p).not.toBeNull();
    return p!;
  }, W);
  await tippe(pille);
  const m = (await screen.findByRole('menu', { name: 'Status wählen' })) as HTMLElement;
  await tippe(within(m).getAllByRole('menuitem').find((e) => norm(e.textContent) === name)!);
  await warte(60);
}
async function setzePreis(d: HTMLElement, eingabe: string) {
  const tab = await vi.waitFor(() => {
    const t = d.querySelector<HTMLElement>('[data-reiter="details"]');
    expect(t).not.toBeNull();
    return t!;
  }, W);
  await tippe(tab);
  const z = await vi.waitFor(() => {
    const e = d.querySelector<HTMLElement>('[data-reiter-bereich="details"] [data-ausgabe-zeile="preis"]');
    expect(e).not.toBeNull();
    return e!;
  }, W);
  await tippe(z);
  const blatt = await vi.waitFor(() => {
    const b = document.querySelector<HTMLElement>('[role="dialog"][aria-label="Preis"]');
    expect(b).not.toBeNull();
    return b!;
  }, W);
  await act(async () => {
    fireEvent.change(blatt.querySelector('[data-preis-eingabe]')!, { target: { value: eingabe } });
  });
  await tippe(blatt.querySelector('[data-preis-sichern]')!);
  await warte(60);
}

describe('REQ-121 Profil › Deine Bibliothek › Aktueller Wert', () => {
  describe('AK-1 Abschnitt zwischen „Du“ und „App“', () => {
    it('[REQ-121/AK-1] Profil über die Navigation: Abschnitte „Du“, „Deine Bibliothek“, „App“ in dieser Reihenfolge', async () => {
      await starteApp([]);
      await oeffneProfil();
      const main = screen.getByRole('main');
      const reihenfolge = Array.from(main.querySelectorAll<HTMLElement>('[data-profil-abschnitt]')).map((s) => s.getAttribute('data-profil-abschnitt'));
      expect(reihenfolge).toEqual(['du', 'bibliothek', 'app']);
      const ueberschriften = Array.from(main.querySelectorAll<HTMLElement>('[data-profil-abschnitt]')).map((s) =>
        norm(s.querySelector('[data-profil-ueberschrift]')?.textContent),
      );
      expect(ueberschriften[1]).toBe('Deine Bibliothek');
      expect(ueberschriften[2]).toBe('App');
      expect(within(main).getByRole('region', { name: 'Deine Bibliothek' })).toBe(abschnitt());
    });

    it('[REQ-121/AK-1] Überschrift „Deine Bibliothek“ hat dieselbe Schriftgrößenstufe und Farbrolle wie „App“', async () => {
      await zeigeProfil([]);
      const h = (id: string) => document.querySelector<HTMLElement>(`section[data-profil-abschnitt="${id}"] [data-profil-ueberschrift]`)!;
      const bib = h('bibliothek');
      const app = h('app');
      expect(bib.tagName).toBe(app.tagName);
      expect(bib.style.fontSize).not.toBe('');
      expect(bib.style.fontSize).toBe(app.style.fontSize);
      expect(bib.style.color).not.toBe('');
      expect(bib.style.color).toBe(app.style.color);
      expect(bib.style.fontWeight).toBe(app.style.fontWeight);
      expect(getComputedStyle(bib).textTransform).toBe(getComputedStyle(app).textTransform);
    });

    it('[REQ-121/AK-1] darunter eine Karte mit genau der Zeile „Aktueller Wert“, ohne Pfeil', async () => {
      await zeigeProfil(AK2);
      const s = abschnitt()!;
      const ue = s.querySelector('[data-profil-ueberschrift]')!;
      const karte = s.querySelector<HTMLElement>('[data-profil-karte-bibliothek]')!;
      expect(karte).not.toBeNull();
      expect(ue.compareDocumentPosition(karte) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
      expect(karte.children).toHaveLength(1);
      const z = karte.firstElementChild as HTMLElement;
      expect(z).toBe(zeile());
      expect(norm(z.querySelector('[data-zeile-bezeichnung]')?.textContent)).toBe('Aktueller Wert');
      expect(z.querySelector('[data-zeile-pfeil]')).toBeNull();
      expect(norm(z.textContent)).not.toMatch(/[›>]\s*$/);
      // Karte im Stil der Karte „App“
      const appKarte = document.querySelector<HTMLElement>('[data-profil-karte]')!;
      expect(karte.getAttribute('style')).toBe(appKarte.getAttribute('style'));
    });
  });

  describe('AK-2 Summe ohne Wunschliste', () => {
    it('[REQ-121/AK-2] Bestand A–E aus dem REQ ergibt „38,00 €“', async () => {
      await zeigeProfil(AK2);
      await erwarteWert('38,00 €');
    });

    it('[REQ-121/AK-2] über die ganze App (Standardspeicher, Navigation): „38,00 €“', async () => {
      await starteApp(AK2);
      await oeffneProfil();
      await erwarteWert('38,00 €');
    });

    it('[REQ-121/AK-2] Exemplar-Angabe spielt keine Rolle (verkauft/geliehen zählt mit)', async () => {
      await zeigeProfil([
        { titel: 'V', status: 'gelesen', preisCent: 1000, exemplar: 'verkauft' },
        { titel: 'G', status: 'ungelesen', preisCent: 250, exemplar: 'geliehen' },
      ]);
      await erwarteWert('12,50 €');
    });

    it('[REQ-121/AK-2] gespeicherter Preis 0,00 € zählt als 0, Cent-genau ohne Rundungsfehler', async () => {
      await zeigeProfil([
        { titel: 'Null', status: 'gelesen', preisCent: 0 },
        { titel: 'X', status: 'gelesen', preisCent: 10 },
        { titel: 'Y', status: 'gelesen', preisCent: 20 },
      ]);
      await erwarteWert('0,30 €');
    });

    it('[REQ-121/AK-2] Fachfunktion: nur Wunschliste ausgeschlossen, alle anderen Status zählen', () => {
      const alle: Status[] = ['ungelesen', 'am_lesen', 'gelesen', 'abgebrochen', 'wunschliste'];
      for (const s of alle) {
        const soll = s === 'wunschliste' ? 0 : 777;
        expect(bibliothekswertCent([{ status: s, preisCent: 777 }]), s).toBe(soll);
      }
      expect(bibliothekswertCent(AK2.map(buch))).toBe(3800);
    });

    it('[REQ-121/AK-2] Wert ist nicht bearbeitbar: kein Eingabefeld im Abschnitt', async () => {
      await zeigeProfil(AK2);
      expect(abschnitt()!.querySelector('input, textarea, select, [contenteditable="true"]')).toBeNull();
    });
  });

  describe('AK-3 Kein Preis hinterlegt', () => {
    it('[REQ-121/AK-3] kein Buch hat einen Preis → „0,00 €“', async () => {
      await zeigeProfil([
        { titel: 'A', status: 'gelesen' },
        { titel: 'B', status: 'ungelesen' },
        { titel: 'C', status: 'wunschliste' },
      ]);
      await erwarteWert('0,00 €');
    });

    it('[REQ-121/AK-3] nur Wunschliste-Bücher haben einen Preis → „0,00 €“', async () => {
      await zeigeProfil([
        { titel: 'A', status: 'gelesen' },
        { titel: 'W1', status: 'wunschliste', preisCent: 3000 },
        { titel: 'W2', status: 'wunschliste', preisCent: 123456 },
      ]);
      await erwarteWert('0,00 €');
    });

    it('[REQ-121/AK-3] keine Bücher → „0,00 €“ (auch über die ganze App)', async () => {
      await zeigeProfil([]);
      await erwarteWert('0,00 €');
      cleanup();
      await starteApp([]);
      await oeffneProfil();
      await erwarteWert('0,00 €');
    });
  });

  describe('AK-4 Tausendertrennzeichen', () => {
    it('[REQ-121/AK-4] Summe 1234,56 € → „1.234,56 €“', async () => {
      await zeigeProfil([
        { titel: 'A', status: 'gelesen', preisCent: 100000 },
        { titel: 'B', status: 'am_lesen', preisCent: 23456 },
        { titel: 'W', status: 'wunschliste', preisCent: 99999 },
      ]);
      await erwarteWert('1.234,56 €');
    });

    it.each([
      [0, '0,00 €'],
      [5, '0,05 €'],
      [99999, '999,99 €'],
      [100000, '1.000,00 €'],
      [123456789, '1.234.567,89 €'],
    ])('[REQ-121/AK-4] Format: %i Cent → „%s“', (cent, soll) => {
      expect(norm(betragText(cent))).toBe(soll);
    });
  });

  describe('AK-5 Aktualisierung nach Änderung', () => {
    it('[REQ-121/AK-5] B auf Wunschliste, Preis E auf 7,50 € → Profil zeigt ohne Neustart „25,50 €“', async () => {
      await starteApp(AK2);
      await oeffneProfil();
      await erwarteWert('38,00 €');

      let d = await oeffneBuch('Buch B');
      await setzeStatus(d, 'Wunschliste');
      await zurueck(d);
      await oeffneProfil();
      await erwarteWert('18,00 €');

      d = await oeffneBuch('Buch E');
      await setzePreis(d, '7,50');
      await zurueck(d);
      await oeffneProfil();
      await erwarteWert('25,50 €');
    });

    it('[REQ-121/AK-5] neu angelegtes Buch zählt beim nächsten Öffnen des Profils mit', async () => {
      await starteApp([{ titel: 'A', status: 'gelesen', preisCent: 1000 }]);
      await oeffneProfil();
      await erwarteWert('10,00 €');
      const quelle = await import('@/buecher/buchQuelle');
      await (await quelle.standardRepository()).save(buch({ titel: 'Neu', status: 'ungelesen', preisCent: 299 }));
      await tippe(within(nav()).getByRole('button', { name: 'Bücher' }));
      await oeffneProfil();
      await erwarteWert('12,99 €');
    });
  });

  describe('AK-6 Nur Anzeige', () => {
    it('[REQ-121/AK-6] Zeile ist kein Bedienelement (kein Button, kein Link)', async () => {
      await zeigeProfil(AK2);
      const z = zeile()!;
      expect(z.tagName).not.toBe('BUTTON');
      expect(z.closest('button, a, [role="button"], [role="link"]')).toBeNull();
      expect(z.querySelector('button, a, [role="button"], [role="link"]')).toBeNull();
      expect(z.getAttribute('tabindex')).toBeNull();
    });

    it('[REQ-121/AK-6] Antippen öffnet kein Blatt, kein Fenster, kein Eingabefeld und ändert nichts', async () => {
      const repo = await zeigeProfil(AK2);
      const vorher = JSON.stringify(await repo.list());
      const htmlVorher = document.body.innerHTML;
      await tippe(zeile()!);
      await tippe(zeile()!.querySelector('[data-zeile-bezeichnung]')!);
      await tippe(zeile()!.querySelector('[data-zeile-wert]')!);
      await warte(60);
      expect(screen.queryAllByRole('dialog')).toHaveLength(0);
      expect(document.querySelector('[data-blatt-hintergrund]')).toBeNull();
      expect(document.querySelectorAll('input, textarea')).toHaveLength(0);
      expect(document.body.innerHTML).toBe(htmlVorher);
      expect(wertText()).toBe('38,00 €');
      expect(JSON.stringify(await repo.list())).toBe(vorher);
    });
  });
});
