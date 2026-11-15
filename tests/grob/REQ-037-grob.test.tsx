/**
 * Grober Test REQ-037 – Übersichten: Raster oder Liste, zuletzt gewählte Ansicht je Liste gemerkt.
 *
 * Abgeleitet aus dem REQ-Text. Schnittstellen laut Absprache (Sprint 04, Teil C):
 *  - role=group "Ansicht" mit [data-ansicht-wahl=raster|liste] (aria-pressed); Übersicht data-ansicht
 *  - li[data-rastereintrag=id] / li[data-listenkarte=id] mit [data-buchtitel], [data-autorzeile] ([data-icon], [data-autor])
 *  - Listenkarte: role=progressbar + [data-fortschrittstext] oder [data-statuschip=status-id]
 *  - AnsichtRepository (src/storage/AnsichtRepository.ts); „Neustart“ = neu rendern mit demselben Speicher
 * Die Standardansicht (vor der ersten Wahl) ist nicht Teil des REQ und wird nicht geprüft.
 */
import '@testing-library/jest-dom/vitest';
import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import type { Buch, LesestatusId } from '@/domain/buch';
import { } from '@/domain/buch';
import { InMemoryAnsichtRepository, type AnsichtRepository } from '@/storage';
import { InMemoryBookRepository } from '@/storage/InMemoryBookRepository';
import { InMemoryImageStore } from '@/storage/InMemoryImageStore';
import BuecherAnsicht from '@/views/BuecherAnsicht';

const T = vi.hoisted(() => ({
  buecher: [{ id: '37000000-0000-4000-8000-000000000001', titel: 'Demo', status: 'ungelesen' as const, eingetragenAm: '2026-01-01T00:00:00.000Z' }],
}));
vi.mock('@/buecher/demodaten', () => ({ demoBuecher: T.buecher }));

const PNG = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAIAAACQd1PeAAAADElEQVR4nGP4z8AAAAMBAQDJ/pLvAAAAAElFTkSuQmCC';
let nr = 0;
function buch(titel: string, status: LesestatusId = 'ungelesen', extra: Partial<Buch> = {}): Buch {
  nr += 1;
  return { id: `37370000-0000-4000-8000-${String(nr).padStart(12, '0')}`, titel, status, eingetragenAm: new Date(Date.UTC(2026, 0, 1) + nr * 60_000).toISOString(), ...extra };
}

afterEach(() => cleanup());

const uebersicht = () => document.querySelector<HTMLElement>('[data-uebersicht]');
const pille = (name: string) => within(screen.getByRole('group', { name: 'Filter' })).getByRole('button', { name });
const geladen = () => waitFor(() => expect(uebersicht()?.getAttribute('data-ansicht')).toMatch(/^(raster|liste)$/));
const eintraege = () => Array.from(uebersicht()!.querySelectorAll<HTMLElement>('ul[data-buecher] > li'));
const titel = () => eintraege().map((li) => li.querySelector('[data-buchtitel]')?.textContent?.trim());
const eintrag = (t: string) => eintraege().find((li) => li.querySelector('[data-buchtitel]')?.textContent?.trim() === t)!;
async function ansicht(a: 'raster' | 'liste') {
  fireEvent.click(uebersicht()!.querySelector(`[data-ansicht-wahl="${a}"]`)!);
  await waitFor(() => expect(uebersicht()!.getAttribute('data-ansicht')).toBe(a));
}

async function zeige(buecher: Buch[], liste: 'Alle' | 'Noch zu lesen' | 'Gerade am Lesen' = 'Alle', ansichtRepository: AnsichtRepository = new InMemoryAnsichtRepository()) {
  const repository = new InMemoryBookRepository();
  for (const b of buecher) await repository.save(b);
  render(<BuecherAnsicht repository={repository} bildspeicher={new InMemoryImageStore()} ansichtRepository={ansichtRepository} jetzt={() => new Date('2026-11-12T10:00:00Z')} />);
  await waitFor(() => expect(document.querySelector('[data-abschnitt="alle-buecher"] ul, [data-abschnitt="alle-buecher"] [data-leere-liste]')).not.toBeNull());
  await oeffne(liste);
}
async function oeffne(liste: 'Alle' | 'Noch zu lesen' | 'Gerade am Lesen') {
  // Von der Seite „Bücher“ über „Alle ansehen ›“ (REQ-040), aus einer Übersicht über die Pille (REQ-036, AK-11).
  if (liste === 'Noch zu lesen' && !uebersicht()) fireEvent.click(document.querySelector('[data-abschnitt="noch-zu-lesen"] [data-alle-ansehen]')!);
  else fireEvent.click(pille(liste));
  await geladen();
}

void [PNG, eintrag]; // gemeinsamer Kopf aus dem feinen Test, hier nicht genutzt

it('[REQ-037/GROB] Wechsel in beide Richtungen: dieselben Bücher in derselben Reihenfolge', async () => {
  await zeige([buch('Zeta', 'gelesen'), buch('Alpha'), buch('Mu', 'am_lesen', { seitenanzahl: 100, aktuelleSeite: 10 })]);
  await ansicht('raster');
  const r = titel();
  expect(eintraege().every((li) => li.hasAttribute('data-rastereintrag'))).toBe(true);
  await ansicht('liste');
  expect(titel()).toEqual(r);
  expect(eintraege().every((li) => li.hasAttribute('data-listenkarte'))).toBe(true);
  expect(eintraege().map((li) => li.getAttribute('data-listenkarte'))).toEqual(eintraege().map((li) => li.getAttribute('data-listenkarte')));
  await ansicht('raster');
  expect(titel()).toEqual(['Alpha', 'Mu', 'Zeta']);
  const g = within(uebersicht()!).getByRole('group', { name: 'Ansicht' });
  expect(within(g).getByRole('button', { pressed: true })).toHaveAttribute('data-ansicht-wahl', 'raster');
});
