/**
 * Akzeptanztests REQ-035 – Seite „Bücher“: Abschnitt „Alle Bücher“ mit „Alle ansehen ›“.
 *
 * Abgeleitet aus dem REQ-Text. Schnittstellen laut Absprache (Sprint 04, Teil C):
 *  - <BuecherAnsicht repository bildspeicher ansichtRepository jetzt />, Seite data-seite="buecher"
 *  - Abschnitte data-abschnitt="noch-zu-lesen" | "alle-buecher" mit [data-alle-ansehen]
 *  - Einträge li[data-bucheintrag=id] mit [data-buchtitel]; leer: [data-leere-liste]
 *  - Übersicht [data-uebersicht=alle|…]
 * Optik (Wischen, Abstände im Gerät) prüft der CEO im Prototyp.
 */
import '@testing-library/jest-dom/vitest';
import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import type { CSSProperties } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import App from '@/App';
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

describe('REQ-035 Abschnitt „Alle Bücher“', () => {
  describe('AK-1 Abschnitt unter „Sammlungen“', () => {
    it('[REQ-035/AK-1] „Alle Bücher“ folgt direkt auf „Sammlungen“, mit Überschrift links und „Alle ansehen ›“ rechts', async () => {
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

    it('[REQ-035/AK-1] der Abschnitt ist auch ohne Bücher vorhanden', async () => {
      await zeige([]);
      expect(within(alleBuecher()).getByRole('heading', { name: 'Alle Bücher' })).toBeInTheDocument();
      expect(alleBuecher().querySelector('[data-alle-ansehen]')?.textContent).toBe('Alle ansehen ›');
    });
  });

  describe('AK-2 Überschrift wie die anderen Abschnitte', () => {
    it('[REQ-035/AK-2] Schriftgröße, Schriftstärke und Farbe stimmen mit „Sammlungen“ überein (Farbrubrik Tertiär)', async () => {
      const w = await zeige([buch('Eins')]);
      const alle = within(alleBuecher()).getByRole('heading', { name: 'Alle Bücher' });
      const samm = within(screen.getByRole('region', { name: 'Sammlungen' })).getByRole('heading', { name: 'Sammlungen' });
      expect(alle.tagName).toBe(samm.tagName);
      expect(schrift(alle)).toEqual(schrift(samm));
      expect(alle.getAttribute('style')).toBe(samm.getAttribute('style'));
      expect(getComputedStyle(alle).color).toBe(berechneteFarbe(w, rubriken.tertiaer.wert));
    });
  });

  describe('AK-3 „Alle ansehen ›“ wie bei „Noch zu lesen“', () => {
    it('[REQ-035/AK-3] Schriftgröße, Schriftart, Schriftstärke und Farbe (Primär) stimmen überein', async () => {
      const w = await zeige([buch('Eins')]);
      const a = alleBuecher().querySelector('[data-alle-ansehen]')!;
      const n = nochZuLesen().querySelector('[data-alle-ansehen]')!;
      expect(schrift(a)).toEqual(schrift(n));
      expect(a.getAttribute('style')).toBe(n.getAttribute('style'));
      expect(getComputedStyle(a).color).toBe(berechneteFarbe(w, rubriken.primaer.wert));
    });
  });

  describe('AK-4 „Alle ansehen ›“ öffnet die Übersicht', () => {
    it('[REQ-035/AK-4] Antippen zeigt die Übersicht „Alle Bücher“ statt der Seite', async () => {
      const w = await zeige([buch('Eins'), buch('Zwei', 'gelesen')]);
      fireEvent.click(alleBuecher().querySelector('[data-alle-ansehen]')!);
      expect(w.querySelector('[data-uebersicht]')?.getAttribute('data-uebersicht')).toBe('alle');
      expect(w.querySelector('[data-seite="buecher"]')).toBeNull();
    });

    it('[REQ-035/AK-4] in der App bleibt der Menüpunkt „Bücher“ ausgewählt', async () => {
      render(<App />);
      const nav = screen.getByRole('navigation', { name: 'Hauptnavigation' });
      fireEvent.click(within(nav).getByRole('button', { name: 'Bücher' }));
      await waitFor(() => expect(alleBuecher().querySelector('ul, [data-leere-liste]')).not.toBeNull());
      fireEvent.click(alleBuecher().querySelector('[data-alle-ansehen]')!);
      expect(document.querySelector('[data-uebersicht]')?.getAttribute('data-uebersicht')).toBe('alle');
      expect(within(nav).getByRole('button', { name: 'Bücher' })).toHaveAttribute('aria-current', 'page');
    });

    it('[REQ-035/AK-4] Negativfall: auch ohne Bücher öffnet „Alle ansehen ›“ die Übersicht', async () => {
      const w = await zeige([]);
      fireEvent.click(alleBuecher().querySelector('[data-alle-ansehen]')!);
      expect(w.querySelector('[data-uebersicht]')?.getAttribute('data-uebersicht')).toBe('alle');
    });
  });

  describe('AK-5 Alle Lesestatus', () => {
    it('[REQ-035/AK-5] je ein Buch jedes Lesestatus erscheint im Abschnitt', async () => {
      const b = ALLE_STATUS.map((s) => buch(`Buch ${s}`, s));
      await zeige(b);
      expect([...titelIn(alleBuecher())].sort()).toEqual(b.map((x) => x.titel).sort());
    });

    it('[REQ-035/AK-5] nur gelesene Bücher: Abschnitt „Alle Bücher“ zeigt sie, kein Platzhalter', async () => {
      await zeige([buch('Fertig', 'gelesen'), buch('Abgebrochen', 'abgebrochen')]);
      expect(titelIn(alleBuecher()).sort()).toEqual(['Abgebrochen', 'Fertig']);
      expect(alleBuecher().querySelector('[data-leere-liste]')).toBeNull();
    });
  });

  describe('AK-6 Neueste links', () => {
    it('[REQ-035/AK-6] A, B, C nacheinander eingetragen → C, B, A', async () => {
      const a = buch('A', 'ungelesen', { eingetragenAm: am(1) });
      const b = buch('B', 'gelesen', { eingetragenAm: am(2) });
      const c = buch('C', 'am_lesen', { eingetragenAm: am(3) });
      await zeige([a, b, c]);
      expect(titelIn(alleBuecher())).toEqual(['C', 'B', 'A']);
    });

    it('[REQ-035/AK-6] Reihenfolge folgt dem Eintragungsdatum, nicht der Speicherreihenfolge oder dem Titel', async () => {
      const a = buch('Zebra', 'ungelesen', { eingetragenAm: '2025-03-01T12:00:00.000Z' });
      const b = buch('Apfel', 'ungelesen', { eingetragenAm: '2026-02-01T12:00:00.000Z' });
      const c = buch('Mango', 'ungelesen', { eingetragenAm: '2025-12-31T23:59:59.000Z' });
      await zeige([b, a, c]);
      expect(titelIn(alleBuecher())).toEqual(['Apfel', 'Mango', 'Zebra']);
    });

    it('[REQ-035/AK-6] über das Blatt „Manueller Eintrag“ nacheinander angelegt: das zuletzt angelegte steht links', async () => {
      const repository = new InMemoryBookRepository();
      let zeit = Date.UTC(2026, 10, 12, 9, 0, 0);
      render(
        <BuecherAnsicht
          repository={repository}
          bildspeicher={new InMemoryImageStore()}
          ansichtRepository={new InMemoryAnsichtRepository()}
          jetzt={() => new Date(zeit)}
        />,
      );
      await waitFor(() => expect(alleBuecher().querySelector('[data-leere-liste]')).not.toBeNull());
      for (const titel of ['A', 'B', 'C']) {
        zeit += 60_000;
        fireEvent.click(screen.getByRole('button', { name: 'Buch hinzufügen' }));
        fireEvent.click(within(await screen.findByRole('menu', { name: 'Buch hinzufügen' })).getByRole('menuitem'));
        const d = await screen.findByRole('dialog', { name: 'Manueller Eintrag' });
        fireEvent.change(within(d).getByLabelText(/^\s*Titel\s*$/i), { target: { value: titel } });
        fireEvent.click(within(d).getByRole('button', { name: 'Hinzufügen' }));
        const det = await screen.findByRole('region', { name: 'Buchdetails' });
        fireEvent.click(within(det).getByRole('button', { name: 'Zurück' }));
        await waitFor(() => expect(titelIn(alleBuecher())).toContain(titel));
      }
      expect(titelIn(alleBuecher())).toEqual(['C', 'B', 'A']);
    });
  });

  describe('AK-7 Höchstens 10 Bücher', () => {
    it('[REQ-035/AK-7] 12 Bücher → genau die 10 zuletzt eingetragenen, neuestes zuerst', async () => {
      const b = Array.from({ length: 12 }, (_, i) => buch(`Buch ${String(i + 1).padStart(2, '0')}`, ALLE_STATUS[i % 5], { eingetragenAm: am(100 + i) }));
      await zeige(b);
      expect(titelIn(alleBuecher())).toEqual(b.slice(2).reverse().map((x) => x.titel));
    });

    it.each([
      [9, 9],
      [10, 10],
      [11, 10],
    ])('[REQ-035/AK-7] Grenzwert: %i Bücher → %i im Abschnitt', async (anzahl, erwartet) => {
      const b = Array.from({ length: anzahl }, (_, i) => buch(`G${i}`, 'gelesen', { eingetragenAm: am(200 + i) }));
      await zeige(b);
      const t = titelIn(alleBuecher());
      expect(t).toHaveLength(erwartet);
      expect(t[0]).toBe(`G${anzahl - 1}`);
      if (anzahl > 10) expect(t).not.toContain('G0');
    });

    it('[REQ-035/AK-7] die Begrenzung gilt nicht für „Noch zu lesen“ (12 ungelesene bleiben dort vollständig)', async () => {
      const b = Array.from({ length: 12 }, (_, i) => buch(`U${i}`, 'ungelesen', { eingetragenAm: am(300 + i) }));
      await zeige(b);
      expect(titelIn(nochZuLesen())).toHaveLength(12);
      expect(titelIn(alleBuecher())).toHaveLength(10);
    });
  });

  describe('AK-8 Bucheintrag wie bei „Noch zu lesen“', () => {
    it('[REQ-035/AK-8] ohne Cover: Cover-Platzhalter, mit Cover: Bild, jeweils Titel darunter', async () => {
      await zeige([buch('Ohne Cover'), buch('Mit Cover', 'ungelesen', { cover: PNG })]);
      const ohne = eintragVon(alleBuecher(), 'Ohne Cover');
      expect(ohne.querySelector('[data-cover-platzhalter]')).not.toBeNull();
      expect(ohne.querySelector('img')).toBeNull();
      const mit = eintragVon(alleBuecher(), 'Mit Cover');
      expect(mit.querySelector('img')?.getAttribute('src')).toBe(PNG);
      for (const li of [ohne, mit]) {
        const titel = li.querySelector('[data-buchtitel]')!;
        const cover = li.querySelector('img, [data-cover-platzhalter]')!;
        expect(cover.compareDocumentPosition(titel) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
      }
    });

    it('[REQ-035/AK-8] derselbe Eintrag ist in Größe und Gestaltung identisch mit „Noch zu lesen“', async () => {
      await zeige([buch('Ohne Cover'), buch('Mit Cover', 'ungelesen', { cover: PNG })]);
      for (const t of ['Ohne Cover', 'Mit Cover']) {
        expect(eintragVon(alleBuecher(), t).outerHTML, t).toBe(eintragVon(nochZuLesen(), t).outerHTML);
      }
      const reiheA = alleBuecher().querySelector('ul')!;
      const reiheN = nochZuLesen().querySelector('ul')!;
      expect(reiheA.getAttribute('style')).toBe(reiheN.getAttribute('style'));
    });
  });

  describe('AK-9 Kein Buch: genau ein Platzhalter', () => {
    it('[REQ-035/AK-9] genau ein Platzhalter mit genau „Deine Bücher warten auf dich...“', async () => {
      await zeige([]);
      const p = alleBuecher().querySelectorAll('[data-leere-liste]');
      expect(p).toHaveLength(1);
      expect(p[0].textContent?.trim()).toBe('Deine Bücher warten auf dich...');
      expect(alleBuecher().querySelectorAll('li')).toHaveLength(0);
    });

    it('[REQ-035/AK-9] gestaltet wie der Leere-Liste-Platzhalter (REQ-011), nur mit anderem Text', async () => {
      await zeige([]);
      const a = alleBuecher().querySelector('[data-leere-liste]')!.parentElement!.outerHTML;
      const n = nochZuLesen().querySelector('[data-leere-liste]')!.parentElement!.outerHTML;
      expect(a.replace('Deine Bücher warten auf dich...', 'X')).toBe(n.replace('Wie wäre es mit einem neuen Buch?', 'X'));
    });

    it('[REQ-035/AK-9] Antippen des Platzhalters ändert nichts', async () => {
      await zeige([]);
      const vorher = document.body.innerHTML;
      const p = alleBuecher().querySelector<HTMLElement>('[data-leere-liste]')!;
      fireEvent.click(p);
      fireEvent.click(p.querySelector('*') ?? p);
      expect(document.body.innerHTML).toBe(vorher);
    });

    it('[REQ-035/AK-9] Negativfall: mit einem (gelesenen) Buch kein Platzhalter in „Alle Bücher“', async () => {
      await zeige([buch('Einzig', 'gelesen')]);
      expect(alleBuecher().querySelector('[data-leere-liste]')).toBeNull();
      expect(titelIn(alleBuecher())).toEqual(['Einzig']);
    });
  });

  describe('AK-10 Buch antippen öffnet Buchdetails', () => {
    it.each(['cover', 'titel'] as const)('[REQ-035/AK-10] Antippen (%s) öffnet genau dieses Buch, Zurück führt zur Seite „Bücher“', async (ziel) => {
      // „Mitte“ ist gelesen und steht deshalb nur in „Alle Bücher“.
      const w = await zeige([buch('Erstes'), buch('Mitte', 'gelesen', { cover: PNG }), buch('Letztes', 'am_lesen')]);
      const li = eintragVon(alleBuecher(), 'Mitte');
      fireEvent.click(li.querySelector(ziel === 'cover' ? 'img, [data-cover-platzhalter]' : '[data-buchtitel]')!);
      const d = await screen.findByRole('region', { name: 'Buchdetails' });
      await waitFor(() => expect(d.querySelector('[data-buchdetails-titel]')?.textContent?.trim()).toBe('Mitte'));
      fireEvent.click(within(d).getByRole('button', { name: 'Zurück' }));
      await waitFor(() => expect(w.querySelector('[data-seite="buecher"]')).not.toBeNull());
      expect(w.querySelector('[data-uebersicht]')).toBeNull();
    });

    it('[REQ-035/AK-10] Cover-Platzhalter eines Buches ohne Cover öffnet ebenfalls die Buchdetails', async () => {
      await zeige([buch('Platzhalterbuch', 'wunschliste')]);
      fireEvent.click(eintragVon(alleBuecher(), 'Platzhalterbuch').querySelector('[data-cover-platzhalter]')!);
      const d = await screen.findByRole('region', { name: 'Buchdetails' });
      await waitFor(() => expect(d.querySelector('[data-buchdetails-titel]')?.textContent?.trim()).toBe('Platzhalterbuch'));
    });
  });
});
