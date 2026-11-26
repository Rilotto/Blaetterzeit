/**
 * Akzeptanztests REQ-114 – Blatt „„Für dich“ anpassen“: Abschnitte der Filterpille „Für dich“ ein- und ausblenden.
 * Abgeleitet aus dem REQ-Text. Schnittstellen laut Entwickler (Sprint 12):
 *  - Blatt role=dialog „„Für dich“ anpassen“ [data-blatt-fuer-dich], Titel h2[data-fuer-dich-titel],
 *    X „Schließen“ [data-fuer-dich-schliessen], [data-ziehgriff], [data-fuer-dich-hintergrund]
 *  - Zeilen button[role=checkbox][aria-checked][data-fuer-dich-abschnitt], Name [data-fuer-dich-name]
 *  - Hinweis p[role=status][data-fuer-dich-hinweis], Dauer FUER_DICH_HINWEIS_MS; Speichern [data-fuer-dich-speichern]
 *  - Abschnitte: section[aria-label] als direkte Kinder von [data-seite="buecher"]
 *  - Speicher: EinstellungRepository, Schlüssel „fuerDichAusgeblendet“
 */
import '@testing-library/jest-dom/vitest';
import { act, cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import App from '@/App';
import { buecherAbschnitte } from '@/buecher/abschnitte';
import { FUER_DICH_HINWEIS_MS } from '@/buecher/BlattFuerDich';
import { SCHREIBFENSTER_ZUG_SCHWELLE } from '@/buchdetails/reiter/rezension';
import { InMemoryEinstellungRepository } from '@/storage';
import BuecherAnsicht from '@/views/BuecherAnsicht';

vi.mock('@/buecher/demodaten', () => ({ demoBuecher: [] }));

beforeEach(() => localStorage.clear());
afterEach(async () => {
  cleanup();
  vi.useRealTimers();
  localStorage.clear();
  // verspätetes popstate eines über X/Ziehen geschlossenen Blatts abwarten
  await new Promise((r) => setTimeout(r, 50));
});

const TITEL = '„Für dich“ anpassen';
const HINWEIS = 'Mindestens ein Abschnitt muss sichtbar sein';
const ALLE_VIER = ['Noch zu lesen', 'Sagas', 'Sammlungen', 'Alle Bücher'];
const SCHLUESSEL = 'fuerDichAusgeblendet';

const blatt = () => screen.queryByRole('dialog', { name: TITEL });
const zeilen = () => within(blatt()!).getAllByRole('checkbox');
const zeile = (name: string) => within(blatt()!).getByRole('checkbox', { name });
const haken = (name: string) => zeile(name).getAttribute('aria-checked');
const abschnitte = () =>
  Array.from(document.querySelectorAll<HTMLElement>('[data-seite="buecher"] > section')).map((s) => s.getAttribute('aria-label'));
const filterBtn = () => screen.getByRole('button', { name: 'Filter und Einstellungen' });
const fuerDichAktiv = () => expect(document.querySelector('[data-filter="fuer_dich"]')).toHaveAttribute('aria-pressed', 'true');

async function tippe(el: Element) {
  await act(async () => {
    fireEvent.click(el);
    await new Promise((r) => setTimeout(r, 10));
  });
}
async function oeffne() {
  await tippe(filterBtn());
  await waitFor(() => expect(blatt()).not.toBeNull());
}
async function speichern() {
  await tippe(blatt()!.querySelector('[data-fuer-dich-speichern]')!);
}
async function zeige(repo = new InMemoryEinstellungRepository(), extra: Record<string, unknown> = {}) {
  render(<BuecherAnsicht buecher={[]} einstellungRepository={repo} {...extra} />);
  await act(async () => {
    await new Promise((r) => setTimeout(r, 20));
  });
  return repo;
}
async function androidZurueck() {
  await act(async () => {
    window.dispatchEvent(new PopStateEvent('popstate', { state: null }));
    await new Promise((r) => setTimeout(r, 20));
  });
}
async function ziehe(strecke: number) {
  const g = blatt()!.querySelector<HTMLElement>('[data-ziehgriff]')!;
  await act(async () => {
    fireEvent.pointerDown(g, { clientY: 100, pointerId: 1 });
    if (strecke > 0) {
      fireEvent.pointerMove(g, { clientY: 100 + strecke / 2, pointerId: 1 });
      fireEvent.pointerMove(g, { clientY: 100 + strecke, pointerId: 1 });
    }
    fireEvent.pointerUp(g, { clientY: 100 + strecke, pointerId: 1 });
    fireEvent.click(g);
    await new Promise((r) => setTimeout(r, 20));
  });
}

describe('REQ-114 Blatt „„Für dich“ anpassen“', () => {
  // ---------------------------------------------------------------- AK-1
  describe('AK-1 Blatt öffnet sich mit Titel und allen Abschnitten', () => {
    it('[REQ-114/AK-1] ohne gespeicherte Auswahl: Blatt von unten, Titel genau „„Für dich“ anpassen“, Ziehgriff und X', async () => {
      await zeige();
      expect(blatt()).toBeNull();
      await oeffne();
      const b = blatt()!;
      expect(b.style.position).toBe('fixed');
      expect(b.style.bottom).toBe('0px');
      const h = within(b).getByRole('heading', { level: 2 });
      expect(h.textContent).toBe('„Für dich“ anpassen');
      expect(b.querySelector('[data-ziehgriff]')).not.toBeNull();
      expect(within(b).getByRole('button', { name: 'Schließen' })).toBeInTheDocument();
    });

    it('[REQ-114/AK-1] Zeilen „Noch zu lesen“, „Sagas“, „Sammlungen“, „Alle Bücher“ in dieser Reihenfolge, alle Haken gesetzt, dazu „Speichern“', async () => {
      await zeige();
      await oeffne();
      expect(zeilen().map((z) => z.querySelector('[data-fuer-dich-name]')?.textContent)).toEqual(ALLE_VIER);
      expect(zeilen().map((z) => z.getAttribute('aria-checked'))).toEqual(['true', 'true', 'true', 'true']);
      expect(within(blatt()!).getByRole('button', { name: 'Speichern' })).toBeInTheDocument();
      // Reihenfolge im Blatt = Reihenfolge der Abschnitte auf der Seite
      expect(abschnitte()).toEqual(ALLE_VIER);
    });

    it('[REQ-114/AK-1] über die App: Seite „Bücher“ → Filter-/Einstellungen-Schaltfläche öffnet das Blatt', async () => {
      render(<App einstellungRepository={new InMemoryEinstellungRepository()} />);
      await tippe(within(screen.getByRole('navigation', { name: 'Hauptnavigation' })).getByRole('button', { name: 'Bücher' }));
      await oeffne();
      expect(zeilen()).toHaveLength(4);
    });
  });

  // ---------------------------------------------------------------- AK-2
  describe('AK-2 Speichern blendet Abschnitte aus', () => {
    it('[REQ-114/AK-2] Sagas und Sammlungen abwählen, Speichern: Blatt zu, „Für dich“ zeigt nur „Noch zu lesen“ und „Alle Bücher“', async () => {
      const repo = await zeige();
      fuerDichAktiv();
      await oeffne();
      await tippe(zeile('Sagas'));
      await tippe(zeile('Sammlungen'));
      await speichern();
      expect(blatt()).toBeNull();
      fuerDichAktiv();
      expect(abschnitte()).toEqual(['Noch zu lesen', 'Alle Bücher']);
      // dauerhaft über das Repository gespeichert
      await waitFor(async () => expect(JSON.parse((await repo.lesen(SCHLUESSEL)) ?? '[]')).toEqual(expect.arrayContaining(['sagas', 'sammlungen'])));
    });

    it('[REQ-114/AK-2] Reihenfolge bleibt unverändert: nur „Noch zu lesen“ abgewählt → Sagas, Sammlungen, Alle Bücher', async () => {
      await zeige();
      await oeffne();
      await tippe(zeile('Noch zu lesen'));
      await speichern();
      expect(abschnitte()).toEqual(['Sagas', 'Sammlungen', 'Alle Bücher']);
    });

    it('[REQ-114/AK-2] wieder anhaken und speichern blendet den Abschnitt wieder ein', async () => {
      await zeige();
      await oeffne();
      await tippe(zeile('Sagas'));
      await speichern();
      expect(abschnitte()).toEqual(['Noch zu lesen', 'Sammlungen', 'Alle Bücher']);
      await oeffne();
      expect(haken('Sagas')).toBe('false');
      await tippe(zeile('Sagas'));
      await speichern();
      expect(abschnitte()).toEqual(ALLE_VIER);
    });
  });

  // ---------------------------------------------------------------- AK-3
  describe('AK-3 Erst „Speichern“ wirkt', () => {
    it('[REQ-114/AK-3] Haken entfernt, nicht gespeichert: Haken im Blatt umgeschaltet, Abschnitt auf der Seite weiter vorhanden, nichts gespeichert', async () => {
      const repo = await zeige();
      await oeffne();
      await tippe(zeile('Sagas'));
      expect(haken('Sagas')).toBe('false');
      expect(abschnitte()).toEqual(ALLE_VIER);
      expect(await repo.lesen(SCHLUESSEL)).toBeUndefined();
      // zurückschalten im Blatt
      await tippe(zeile('Sagas'));
      expect(haken('Sagas')).toBe('true');
    });
  });

  // ---------------------------------------------------------------- AK-4
  describe('AK-4 Schließen ohne Speichern ändert nichts', () => {
    const wege: [string, () => Promise<void>][] = [
      ['X', () => tippe(within(blatt()!).getByRole('button', { name: 'Schließen' }))],
      ['Android-Zurück-Taste', androidZurueck],
      ['Herunterziehen am Ziehgriff', () => ziehe(SCHREIBFENSTER_ZUG_SCHWELLE + 40)],
    ];
    it.each(wege)('[REQ-114/AK-4] Haken „Sagas“ entfernt, Schließen über %s: alle vier Abschnitte, beim erneuten Öffnen Haken gesetzt', async (_, schliesse) => {
      const repo = await zeige();
      await oeffne();
      await tippe(zeile('Sagas'));
      await schliesse();
      expect(blatt()).toBeNull();
      fuerDichAktiv();
      expect(abschnitte()).toEqual(ALLE_VIER);
      expect(await repo.lesen(SCHLUESSEL)).toBeUndefined();
      await oeffne();
      expect(haken('Sagas')).toBe('true');
    });

    it('[REQ-114/AK-4] bei gespeicherter Auswahl (ohne Sammlungen): Änderung verworfen, gespeicherte Auswahl bleibt und wird wieder angezeigt', async () => {
      const repo = new InMemoryEinstellungRepository();
      await repo.speichern(SCHLUESSEL, JSON.stringify(['sammlungen']));
      await zeige(repo);
      await waitFor(() => expect(abschnitte()).toEqual(['Noch zu lesen', 'Sagas', 'Alle Bücher']));
      await oeffne();
      await tippe(zeile('Sagas'));
      await tippe(zeile('Sammlungen'));
      await tippe(within(blatt()!).getByRole('button', { name: 'Schließen' }));
      expect(abschnitte()).toEqual(['Noch zu lesen', 'Sagas', 'Alle Bücher']);
      expect(JSON.parse((await repo.lesen(SCHLUESSEL))!)).toEqual(['sammlungen']);
      await oeffne();
      expect(zeilen().map((z) => z.getAttribute('aria-checked'))).toEqual(['true', 'true', 'false', 'true']);
    });
  });

  // ---------------------------------------------------------------- AK-5
  describe('AK-5 Mindestens ein Haken', () => {
    it('[REQ-114/AK-5] nur „Alle Bücher“ angehakt, antippen: bleibt gesetzt, Hinweis erscheint und verschwindet wieder', async () => {
      await zeige();
      await oeffne();
      for (const n of ['Noch zu lesen', 'Sagas', 'Sammlungen']) await tippe(zeile(n));
      expect(zeilen().map((z) => z.getAttribute('aria-checked'))).toEqual(['false', 'false', 'false', 'true']);
      expect(within(blatt()!).queryByText(HINWEIS)).toBeNull();
      vi.useFakeTimers();
      fireEvent.click(zeile('Alle Bücher'));
      expect(haken('Alle Bücher')).toBe('true');
      const h = within(blatt()!).getByRole('status');
      expect(h).toHaveTextContent(HINWEIS);
      act(() => {
        vi.advanceTimersByTime(FUER_DICH_HINWEIS_MS + 50);
      });
      expect(within(blatt()!).queryByText(HINWEIS)).toBeNull();
      expect(haken('Alle Bücher')).toBe('true');
      vi.useRealTimers();
    });

    it('[REQ-114/AK-5] Grenzfall: Hinweis ist „kurz“ (höchstens 10 s) und erscheint bei erneutem Antippen wieder', async () => {
      expect(FUER_DICH_HINWEIS_MS).toBeGreaterThan(0);
      expect(FUER_DICH_HINWEIS_MS).toBeLessThanOrEqual(10_000);
      await zeige();
      await oeffne();
      for (const n of ['Noch zu lesen', 'Sagas', 'Alle Bücher']) await tippe(zeile(n));
      vi.useFakeTimers();
      fireEvent.click(zeile('Sammlungen'));
      act(() => {
        vi.advanceTimersByTime(FUER_DICH_HINWEIS_MS + 50);
      });
      expect(within(blatt()!).queryByText(HINWEIS)).toBeNull();
      fireEvent.click(zeile('Sammlungen'));
      expect(within(blatt()!).getByRole('status')).toHaveTextContent(HINWEIS);
      expect(haken('Sammlungen')).toBe('true');
      vi.useRealTimers();
    });

    it('[REQ-114/AK-5] Negativfall: solange zwei Haken gesetzt sind, lässt sich einer entfernen, ohne Hinweis', async () => {
      await zeige();
      await oeffne();
      for (const n of ['Noch zu lesen', 'Sagas']) await tippe(zeile(n));
      await tippe(zeile('Sammlungen'));
      expect(haken('Sammlungen')).toBe('false');
      expect(within(blatt()!).queryByText(HINWEIS)).toBeNull();
      // Speichern mit nur „Alle Bücher“ zeigt genau diesen Abschnitt
      await speichern();
      expect(abschnitte()).toEqual(['Alle Bücher']);
    });
  });

  // ---------------------------------------------------------------- AK-6
  describe('AK-6 Dauerhaft gespeichert', () => {
    it('[REQ-114/AK-6] „Sagas“ ausgeblendet, gespeichert, Neustart (App): „Sagas“ fehlt weiter, Haken nicht gesetzt', async () => {
      const repo = new InMemoryEinstellungRepository();
      const start = async () => {
        render(<App einstellungRepository={repo} />);
        await tippe(within(screen.getByRole('navigation', { name: 'Hauptnavigation' })).getByRole('button', { name: 'Bücher' }));
      };
      await start();
      await oeffne();
      await tippe(zeile('Sagas'));
      await speichern();
      expect(abschnitte()).toEqual(['Noch zu lesen', 'Sammlungen', 'Alle Bücher']);
      await act(async () => {
        await new Promise((r) => setTimeout(r, 30));
      });
      cleanup();
      await start();
      fuerDichAktiv();
      await waitFor(() => expect(abschnitte()).toEqual(['Noch zu lesen', 'Sammlungen', 'Alle Bücher']));
      await oeffne();
      expect(zeilen().map((z) => z.getAttribute('aria-checked'))).toEqual(['true', 'false', 'true', 'true']);
    });
  });

  // ---------------------------------------------------------------- AK-7
  describe('AK-7 Neuer Abschnitt erscheint automatisch und sichtbar', () => {
    const mitNeu = [...buecherAbschnitte, { id: 'neu', titel: 'Neu', darstellen: () => <section aria-label="Neu" /> }];

    it('[REQ-114/AK-7] gespeichert ohne „Sagas“, neuer Abschnitt ergänzt: im Blatt mit gesetztem Haken, bei „Für dich“ sichtbar, „Sagas“ bleibt aus', async () => {
      const repo = new InMemoryEinstellungRepository();
      await zeige(repo);
      await oeffne();
      await tippe(zeile('Sagas'));
      await speichern();
      await act(async () => {
        await new Promise((r) => setTimeout(r, 30));
      });
      cleanup();
      await zeige(repo, { abschnitte: mitNeu });
      await waitFor(() => expect(abschnitte()).toEqual(['Noch zu lesen', 'Sammlungen', 'Alle Bücher', 'Neu']));
      await oeffne();
      expect(zeilen().map((z) => z.querySelector('[data-fuer-dich-name]')?.textContent)).toEqual([...ALLE_VIER, 'Neu']);
      expect(haken('Neu')).toBe('true');
      expect(haken('Sagas')).toBe('false');
    });

    it('[REQ-114/AK-7] neuer Abschnitt lässt sich wie die übrigen ausblenden', async () => {
      await zeige(new InMemoryEinstellungRepository(), { abschnitte: mitNeu });
      await oeffne();
      await tippe(zeile('Neu'));
      await speichern();
      expect(abschnitte()).toEqual(ALLE_VIER);
    });
  });

  // ---------------------------------------------------------------- AK-8
  describe('AK-8 Ziehgriff antippen schließt nicht', () => {
    it('[REQ-114/AK-8] bloßes Antippen des Ziehgriffs: Blatt bleibt offen, Entwurf bleibt erhalten', async () => {
      await zeige();
      await oeffne();
      await tippe(zeile('Sagas'));
      await ziehe(0);
      expect(blatt()).not.toBeNull();
      expect(haken('Sagas')).toBe('false');
    });

    it('[REQ-114/AK-8] Grenzwert: Ziehen knapp unter der Schwelle schließt nicht, ab der Schwelle schließt es', async () => {
      await zeige();
      await oeffne();
      await ziehe(SCHREIBFENSTER_ZUG_SCHWELLE - 1);
      expect(blatt()).not.toBeNull();
      await ziehe(SCHREIBFENSTER_ZUG_SCHWELLE);
      expect(blatt()).toBeNull();
    });
  });
});
