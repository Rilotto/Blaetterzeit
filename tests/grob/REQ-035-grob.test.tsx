/**
 * Grober Test REQ-035 – Seite „Bücher“: Abschnitt „Alle Bücher“ mit „Alle ansehen ›“.
 *
 * Abgeleitet aus dem REQ-Text. Schnittstellen laut Absprache (Sprint 04, Teil C):
 *  - <BuecherAnsicht repository bildspeicher ansichtRepository jetzt />, Seite data-seite="buecher"
 *  - Abschnitte data-abschnitt="noch-zu-lesen" | "alle-buecher" mit [data-alle-ansehen]
 *  - Einträge li[data-bucheintrag=id] mit [data-buchtitel]; leer: [data-leere-liste]
 *  - Übersicht [data-uebersicht=alle|…]
 * Optik (Wischen, Abstände im Gerät) prüft der CEO im Prototyp.
 */
import '@testing-library/jest-dom/vitest';
import { cleanup, render, screen, waitFor, within } from '@testing-library/react';
import type { CSSProperties } from 'react';
import { afterEach, expect, it, vi } from 'vitest';

import type { Buch, LesestatusId } from '@/domain/buch';
import { InMemoryAnsichtRepository } from '@/storage';
import { InMemoryBookRepository } from '@/storage/InMemoryBookRepository';
import { InMemoryImageStore } from '@/storage/InMemoryImageStore';
import { farbrubriken, farbVariablen } from '@/theme';
import BuecherAnsicht from '@/views/BuecherAnsicht';

const T = vi.hoisted(() => ({
  buecher: [
    { id: '35000000-0000-4000-8000-000000000001', titel: 'Demo eins', status: 'ungelesen' as const, eingetragenAm: '2026-01-01T00:00:00.000Z' },
    { id: '35000000-0000-4000-8000-000000000002', titel: 'Demo zwei', status: 'gelesen' as const, eingetragenAm: '2026-01-02T00:00:00.000Z' },
  ],
}));
vi.mock('@/buecher/demodaten', () => ({ demoBuecher: T.buecher }));

const PNG = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAIAAACQd1PeAAAADElEQVR4nGP4z8AAAAMBAQDJ/pLvAAAAAElFTkSuQmCC';
const ALLE_STATUS: LesestatusId[] = ['ungelesen', 'am_lesen', 'gelesen', 'abgebrochen', 'wunschliste'];
const rubriken = farbrubriken as unknown as Record<string, { wert: string }>;

/** Eintragungsdatum n Minuten nach einem festen Startzeitpunkt. */
const am = (n: number) => new Date(Date.UTC(2026, 0, 1, 8, 0, 0) + n * 60_000).toISOString();
let nr = 0;
function buch(titel: string, status: LesestatusId = 'ungelesen', extra: Partial<Buch> = {}): Buch {
  nr += 1;
  return { id: `35350000-0000-4000-8000-${String(nr).padStart(12, '0')}`, titel, status, eingetragenAm: am(nr), ...extra };
}

afterEach(() => cleanup());

const alleBuecher = () => document.querySelector<HTMLElement>('[data-abschnitt="alle-buecher"]')!;
const nochZuLesen = () => document.querySelector<HTMLElement>('[data-abschnitt="noch-zu-lesen"]')!;
const titelIn = (el: HTMLElement) =>
  Array.from(el.querySelectorAll('li[data-bucheintrag] [data-buchtitel]')).map((t) => t.textContent?.trim());
const eintragVon = (el: HTMLElement, titel: string) =>
  Array.from(el.querySelectorAll<HTMLElement>('li[data-bucheintrag]')).find(
    (li) => li.querySelector('[data-buchtitel]')?.textContent?.trim() === titel,
  )!;

async function zeige(buecher: Buch[]) {
  const repository = new InMemoryBookRepository();
  for (const b of buecher) await repository.save(b);
  const r = render(
    <div data-testwurzel="" style={farbVariablen() as CSSProperties}>
      <BuecherAnsicht
        repository={repository}
        bildspeicher={new InMemoryImageStore()}
        ansichtRepository={new InMemoryAnsichtRepository()}
        jetzt={() => new Date('2026-11-12T10:00:00Z')}
      />
    </div>,
  );
  await waitFor(() => expect(alleBuecher().querySelector('ul, [data-leere-liste]')).not.toBeNull());
  return r.container.firstElementChild as HTMLElement;
}
function berechneteFarbe(ctx: HTMLElement, ausdruck: string) {
  const probe = document.createElement('span');
  probe.style.setProperty('color', ausdruck);
  ctx.appendChild(probe);
  const wert = getComputedStyle(probe).color;
  probe.remove();
  return wert;
}
const schrift = (el: Element) => {
  const cs = getComputedStyle(el);
  return { groesse: cs.fontSize, staerke: cs.fontWeight, art: cs.fontFamily, farbe: cs.color };
};

void [PNG, ALLE_STATUS, rubriken, nochZuLesen, titelIn, eintragVon, berechneteFarbe, schrift]; // gemeinsamer Kopf aus dem feinen Test, hier nicht genutzt

it('[REQ-035/GROB] „Alle Bücher“ folgt direkt auf „Sammlungen“, mit Überschrift links und „Alle ansehen ›“ rechts', async () => {
  await zeige([buch('Eins')]);
  const regionen = screen.getAllByRole('region').map((r) => r.getAttribute('aria-label'));
  const i = regionen.indexOf('Sammlungen');
  expect(i).toBeGreaterThanOrEqual(0);
  expect(regionen[i + 1]).toBe('Alle Bücher');
  const a = alleBuecher();
  const h = within(a).getByRole('heading', { name: 'Alle Bücher' });
  expect(h.textContent).toBe('Alle Bücher');
  const knopf = a.querySelector('[data-alle-ansehen]')!;
  expect(knopf.textContent).toBe('Alle ansehen ›');
  // links vor rechts: Überschrift steht im Dokument vor „Alle ansehen ›“
  expect(h.compareDocumentPosition(knopf) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
});
