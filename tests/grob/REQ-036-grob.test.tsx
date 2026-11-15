/**
 * Grober Test REQ-036 – Übersicht „Alle Bücher“: Fenster, Kopf, Anzahl, Reihenfolge, Rückweg.
 *
 * Abgeleitet aus dem REQ-Text. Schnittstellen laut Absprache (Sprint 04, Teil C):
 *  - Übersicht [data-uebersicht=alle|noch_zu_lesen|gerade_am_lesen] mit data-ansicht="raster|liste" (leer bis geladen)
 *  - input[type=search][data-suchfeld], [data-buecherzahl], role=group "Ansicht" mit [data-ansicht-wahl], [data-sortierknopf]
 *  - ul[data-buecher] (fehlt ohne Treffer), li[data-rastereintrag=id] bzw. li[data-listenkarte=id] mit [data-buchtitel]
 *  - Filterpillen mit data-filter=id
 * Keine Annahme über die Standardansicht: Tests wählen die Ansicht ausdrücklich, wenn sie darauf ankommt.
 */
import '@testing-library/jest-dom/vitest';
import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';

import type { Buch, LesestatusId } from '@/domain/buch';
import { InMemoryAnsichtRepository } from '@/storage';
import { InMemoryBookRepository } from '@/storage/InMemoryBookRepository';
import { InMemoryImageStore } from '@/storage/InMemoryImageStore';
import BuecherAnsicht from '@/views/BuecherAnsicht';

const T = vi.hoisted(() => ({
  buecher: [
    { id: '36000000-0000-4000-8000-000000000001', titel: 'Demo Beta', status: 'ungelesen' as const, eingetragenAm: '2026-01-01T00:00:00.000Z' },
    { id: '36000000-0000-4000-8000-000000000002', titel: 'Demo Alpha', status: 'gelesen' as const, eingetragenAm: '2026-01-02T00:00:00.000Z' },
  ],
}));
vi.mock('@/buecher/demodaten', () => ({ demoBuecher: T.buecher }));

let nr = 0;
function buch(titel: string, status: LesestatusId = 'ungelesen', extra: Partial<Buch> = {}): Buch {
  nr += 1;
  const id = `36360000-0000-4000-8000-${String(nr).padStart(12, '0')}`;
  return { id, titel, status, eingetragenAm: new Date(Date.UTC(2026, 0, 1) + nr * 60_000).toISOString(), ...extra };
}

afterEach(() => cleanup());

const uebersicht = () => document.querySelector<HTMLElement>('[data-uebersicht]');
const leiste = () => screen.getByRole('group', { name: 'Filter' });
const pille = (name: string) => within(leiste()).getByRole('button', { name });
const aktivePillen = () =>
  within(leiste())
    .getAllByRole('button')
    .filter((b) => b.getAttribute('aria-pressed') === 'true')
    .map((b) => b.textContent?.trim());
const titel = () => Array.from(uebersicht()!.querySelectorAll('ul[data-buecher] > li [data-buchtitel]')).map((t) => t.textContent?.trim());
const zahl = () => uebersicht()!.querySelector('[data-buecherzahl]')!.textContent?.trim();
const geladen = () => waitFor(() => expect(uebersicht()?.getAttribute('data-ansicht')).toMatch(/^(raster|liste)$/));
async function ansicht(a: 'raster' | 'liste') {
  fireEvent.click(uebersicht()!.querySelector(`[data-ansicht-wahl="${a}"]`)!);
  await waitFor(() => expect(uebersicht()!.getAttribute('data-ansicht')).toBe(a));
}

/** Seite „Bücher“ mit eigenen Büchern; danach Übersicht „Alle Bücher“ über die Pille „Alle“. */
async function zeige(buecher: Buch[], oeffnen = true) {
  const repository = new InMemoryBookRepository();
  for (const b of buecher) await repository.save(b);
  render(
    <BuecherAnsicht
      repository={repository}
      bildspeicher={new InMemoryImageStore()}
      ansichtRepository={new InMemoryAnsichtRepository()}
      jetzt={() => new Date('2026-11-12T10:00:00Z')}
    />,
  );
  await waitFor(() => expect(document.querySelector('[data-abschnitt="alle-buecher"] ul, [data-abschnitt="alle-buecher"] [data-leere-liste]')).not.toBeNull());
  if (oeffnen) {
    fireEvent.click(pille('Alle'));
    await geladen();
  }
}
const sucheEingeben = (text: string) => fireEvent.change(uebersicht()!.querySelector('input[data-suchfeld]')!, { target: { value: text } });

void [aktivePillen, zahl, ansicht, sucheEingeben]; // gemeinsamer Kopf aus dem feinen Test, hier nicht genutzt

it('[REQ-036/GROB] alle fünf Lesestatus erscheinen; Reihenfolge nach Titel, nicht nach Eintragungsdatum', async () => {
  await zeige([
    buch('Echo', 'wunschliste'),
    buch('Delta', 'abgebrochen'),
    buch('Charlie', 'gelesen'),
    buch('Bravo', 'am_lesen'),
    buch('Alpha', 'ungelesen'),
  ]);
  expect(titel()).toEqual(['Alpha', 'Bravo', 'Charlie', 'Delta', 'Echo']);
});
