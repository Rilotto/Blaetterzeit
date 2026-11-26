/**
 * Akzeptanztests REQ-112 – Karte „Ausgabe“: Zeile „Band“ unter „Exemplar“, eine Bandnummer je Buch, auch aus dem Scan.
 *
 * Abgeleitet aus dem REQ-Text. Bedienung über Rollen und Text; Zeilen der Karte „Ausgabe“ über [data-ausgabe-zeile]
 * mit [data-zeile-bezeichnung]/[data-zeile-wert]/[data-zeile-pfeil] (REQ-056). Die Zeile „Band“ wird an ihrer
 * Bezeichnung erkannt. Blatt „Band“: oberstes role=dialog mit Eingabefeld und „Sichern“, X = aria-label „Schließen“,
 * Fehler = aria-invalid bzw. data-fehler (wie REQ-063).
 * „Neustart“: Module neu laden, neue Repository-Instanz auf derselben IndexedDB (fake-indexeddb).
 * AK-10: Ausgangsdaten im Speicherformat des Vorgängerstands (IndexedDB-Schema 9: Bandnummer je Zugehörigkeit).
 */
import '@testing-library/jest-dom/vitest';
import { act, cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { IDBFactory, IDBKeyRange } from 'fake-indexeddb';
import type { ComponentType, CSSProperties } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { Treffer } from '@/barcode/treffer';
import type { Buch } from '@/domain/buch';
import type { Liste } from '@/domain/listen';
import type { BookRepository, ImageStore, ListenRepository } from '@/storage';
import { farbVariablen } from '@/theme';

vi.mock('@/buecher/demodaten', () => ({ demoBuecher: [] }));
beforeEach(() => {
  vi.stubGlobal('indexedDB', new IDBFactory());
  vi.stubGlobal('IDBKeyRange', IDBKeyRange);
});
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

type Komp = ComponentType<Record<string, unknown>>;
type Welt = { repo: BookRepository; listen: ListenRepository; BD: Komp; BA: Komp };
const W = { timeout: 4000 };
const HEUTE = new Date(2026, 10, 25, 15, 0, 0);
const jetzt = () => HEUTE;
const bilder = { get: async () => undefined, put: async () => {}, remove: async () => {} } as unknown as ImageStore;
const quelle = { scannen: async () => null, galerie: async () => null };
const buch = (titel = 'Fourth Wing', f: Partial<Buch> = {}): Buch => ({ id: crypto.randomUUID(), titel, autor: 'Rebecca Yarros', status: 'ungelesen', seitenanzahl: 500, ...f });
const norm = (t: string | null | undefined) => (t ?? '').replace(/[\s  ]+/g, ' ').trim();

async function starte(): Promise<Welt> {
  vi.resetModules();
  const st = (await import('@/storage')) as typeof import('@/storage');
  const BD = (await import('@/views/BuchDetails')).default as unknown as Komp;
  const BA = (await import('@/views/BuecherAnsicht')).default as unknown as Komp;
  return { repo: st.createBookRepository(), listen: st.createListenRepository(), BD, BA };
}
async function warte(ms = 40) {
  await act(async () => {
    await new Promise((r) => setTimeout(r, ms));
  });
}
async function tippe(el: Element | null | undefined) {
  expect(el).toBeTruthy();
  await act(async () => {
    fireEvent.click(el!);
    await new Promise((r) => setTimeout(r, 20));
  });
}
async function saga(w: Welt, name: string): Promise<Liste> {
  const l: Liste = { id: crypto.randomUUID(), art: 'saga', name };
  await w.listen.listeSpeichern(l);
  return l;
}
const aufnehmen = (w: Welt, l: Liste, b: Buch) => w.listen.zuordnen({ listeId: l.id, buchId: b.id });
const bandVon = async (w: Welt, id: string) => (await w.repo.get(id))?.bandnummer;

function sichtbar(el: Element | null): boolean {
  for (let n = el as HTMLElement | null; n; n = n.parentElement) {
    if (n.hidden || n.getAttribute('aria-hidden') === 'true' || n.hasAttribute('inert') || n.style?.display === 'none') return false;
  }
  return true;
}
function textEls(text: string | RegExp, root: ParentNode = document.body): HTMLElement[] {
  const passt = (t: string) => (typeof text === 'string' ? t === text : text.test(t));
  const k = Array.from(root.querySelectorAll<HTMLElement>('*')).filter((e) => passt(norm(e.textContent)) && sichtbar(e));
  return k.filter((c) => !k.some((o) => o !== c && c.contains(o)));
}
const region = () => screen.getByRole('region', { name: 'Buchdetails' });
/** Saga-Zeilen unter dem Autor (REQ-099), A–Z wie angezeigt. */
const sagaZeilen = (d: HTMLElement = region()) => textEls(/^Band \d+ · .+$/, d).map((e) => norm(e.textContent));

/** Reiter „Details“ der geöffneten Buchdetails aktivieren. */
async function reiterDetails(d: HTMLElement) {
  const r = await vi.waitFor(() => {
    const t = d.querySelector<HTMLElement>('[data-reiter="details"]') ?? within(d).queryByRole('tab', { name: 'Details' });
    expect(t).not.toBeNull();
    return t!;
  }, W);
  await tippe(r);
  await vi.waitFor(() => expect(d.querySelector('[data-ausgabe-karte]')).not.toBeNull(), W);
}
async function details(w: Welt, id: string) {
  const BD = w.BD;
  render(
    <div data-testwurzel="" style={farbVariablen() as CSSProperties}>
      <BD buchId={id} jetzt={jetzt} bildspeicher={bilder} bildquelle={quelle} onZurueck={() => {}} />
    </div>,
  );
  const d = await screen.findByRole('region', { name: 'Buchdetails' }, W);
  await reiterDetails(d);
  await warte(30);
  return d;
}
async function neustartDetails(id: string) {
  cleanup();
  const w = await starte();
  return { w, d: await details(w, id) };
}

// ----------------------------------------------------------------------------- Karte „Ausgabe“ / Zeile „Band“
const ausgabeZeilen = (root: ParentNode) => Array.from(root.querySelectorAll<HTMLElement>('[data-ausgabe-zeile]'));
const bezeichnung = (z: HTMLElement) => norm(z.querySelector('[data-zeile-bezeichnung]')?.textContent ?? '') || norm(z.textContent).split(' ')[0];
function bandZeile(root: ParentNode = document.body): HTMLElement {
  const z = ausgabeZeilen(root).find((e) => bezeichnung(e) === 'Band');
  expect(z, 'Zeile „Band“').toBeDefined();
  return z!;
}
const bandWert = (root: ParentNode = document.body) => {
  const z = bandZeile(root);
  const w = z.querySelector('[data-zeile-wert]');
  return w ? norm(w.textContent) : norm(norm(z.textContent).replace(/^Band/, '').replace('›', ''));
};

// ----------------------------------------------------------------------------- Blatt „Band“
const oberstesBlatt = () => screen.getAllByRole('dialog').at(-1)!;
function bandEingabe(): HTMLInputElement {
  const d = oberstesBlatt();
  const f = d.querySelector<HTMLInputElement>('[data-blatt-feld]') ?? d.querySelector<HTMLInputElement>('input');
  expect(f, 'Eingabefeld im Blatt „Band“').not.toBeNull();
  return f!;
}
async function blattBandOeffnen(root: ParentNode = document.body) {
  const vorher = screen.queryAllByRole('dialog').length;
  await tippe(bandZeile(root));
  await vi.waitFor(() => expect(screen.queryAllByRole('dialog').length).toBeGreaterThan(vorher), W);
  const d = oberstesBlatt();
  expect(norm(d.getAttribute('aria-label') ?? '') === 'Band' || textEls('Band', d).length > 0, 'Titel „Band“').toBe(true);
  expect(within(d).getByRole('button', { name: 'Sichern' })).toBeInTheDocument();
  return d;
}
async function bandSichern(wert: string, root: ParentNode = document.body) {
  const d = await blattBandOeffnen(root);
  fireEvent.change(bandEingabe(), { target: { value: wert } });
  await tippe(within(d).getByRole('button', { name: 'Sichern' }));
  await warte(60);
  return d;
}
const markiert = (el: Element) => el.getAttribute('aria-invalid') === 'true' || el.getAttribute('data-fehler') === 'true';

// ----------------------------------------------------------------------------- Listenübersicht „Sagas“ (REQ-097)
const ABSCHNITT = 'Sagas, Sammlungen und Bibliotheken';
function inSagaZeile(d: HTMLElement) {
  const h = within(d).getAllByRole('heading').find((x) => norm(x.textContent) === ABSCHNITT)!;
  const k = Array.from(d.querySelectorAll<HTMLElement>('*')).filter(
    (e) => Boolean(h.compareDocumentPosition(e) & Node.DOCUMENT_POSITION_FOLLOWING) && norm(e.textContent).startsWith('In Saga') && norm(e.textContent).includes('›'),
  );
  return k.find((c) => !k.some((o) => o !== c && c.contains(o)));
}
const bandFelderUebersicht = () => screen.queryAllByLabelText(/Band/).filter((e) => e.tagName === 'INPUT' && sichtbar(e) && !e.closest('[data-ausgabe-karte]')) as HTMLInputElement[];
async function uebersichtSagas(d: HTMLElement) {
  await tippe(inSagaZeile(d));
  await vi.waitFor(() => expect(bandFelderUebersicht().length).toBeGreaterThan(0), W);
}
const zurueck = () => screen.getAllByRole('button', { name: 'Zurück' }).filter((b) => sichtbar(b)).at(-1)!;

// =============================================================================
describe('REQ-112 Zeile „Band“', () => {
  describe('AK-1 Zeile „Band“ unter „Exemplar“', () => {
    it('[REQ-112/AK-1] Buch mit Bandnummer 2: Zeile „Band“ direkt unter „Exemplar“, rechts „2“ mit Pfeil „›“', async () => {
      const w = await starte();
      const b = buch('Iron Flame', { bandnummer: 2, exemplar: 'meins' });
      await w.repo.save(b);
      const d = await details(w, b.id);
      const zeilen = ausgabeZeilen(d.querySelector('[data-ausgabe-karte]')!);
      const i = zeilen.findIndex((z) => bezeichnung(z) === 'Band');
      expect(i).toBeGreaterThan(0);
      expect(bezeichnung(zeilen[i - 1])).toBe('Exemplar');
      expect(bandWert(d)).toBe('2');
      const pfeil = bandZeile(d).querySelector('[data-zeile-pfeil]');
      expect(norm(pfeil?.textContent)).toBe('›');
    });

    it('[REQ-112/AK-1] Buch ohne Bandnummer: rechte Seite leer, Pfeil vorhanden', async () => {
      const w = await starte();
      const b = buch('Momo');
      await w.repo.save(b);
      const d = await details(w, b.id);
      expect(bandWert(d)).toBe('');
      expect(norm(bandZeile(d).querySelector('[data-zeile-pfeil]')?.textContent)).toBe('›');
    });

    it('[REQ-112/AK-1] Grenzfall: große Bandnummer 12 wird als Zahl „12“ angezeigt (nicht „Band 12“)', async () => {
      const w = await starte();
      const b = buch('Zwölf', { bandnummer: 12 });
      await w.repo.save(b);
      const d = await details(w, b.id);
      expect(bandWert(d)).toBe('12');
    });
  });

  describe('AK-2 Ändern über das Blatt', () => {
    it('[REQ-112/AK-2] Buch ohne Band: „Band“ antippen, 3, „Sichern“ → Blatt zu, Zeile zeigt „3“, auch nach Neustart', async () => {
      const w = await starte();
      const b = buch('Onyx Storm');
      await w.repo.save(b);
      const d = await details(w, b.id);
      const bl = await blattBandOeffnen(d);
      expect(bandEingabe().value).toBe('');
      fireEvent.change(bandEingabe(), { target: { value: '3' } });
      await tippe(within(bl).getByRole('button', { name: 'Sichern' }));
      await vi.waitFor(() => expect(bl.isConnected && sichtbar(bl)).toBe(false), W);
      await vi.waitFor(() => expect(bandWert(d)).toBe('3'), W);
      expect(await bandVon(w, b.id)).toBe(3);
      const { d: d2 } = await neustartDetails(b.id);
      expect(bandWert(d2)).toBe('3');
    });

    it('[REQ-112/AK-2] Blatt zeigt die aktuelle Bandnummer vorausgefüllt (Buch mit Band 4)', async () => {
      const w = await starte();
      const b = buch('Onyx Storm', { bandnummer: 4 });
      await w.repo.save(b);
      const d = await details(w, b.id);
      await blattBandOeffnen(d);
      expect(bandEingabe().value).toBe('4');
    });

    it('[REQ-112/AK-2] Ändern einer vorhandenen Bandnummer 1 → 7; andere Angaben des Buches bleiben', async () => {
      const w = await starte();
      const b = buch('Onyx Storm', { bandnummer: 1, verlag: 'dtv', seitenanzahl: 544 });
      await w.repo.save(b);
      const d = await details(w, b.id);
      await bandSichern('7', d);
      await vi.waitFor(() => expect(bandWert(d)).toBe('7'), W);
      expect(await w.repo.get(b.id)).toMatchObject({ bandnummer: 7, verlag: 'dtv', seitenanzahl: 544, titel: 'Onyx Storm' });
    });
  });

  describe('AK-3 Leeren und ungültige Eingaben', () => {
    it('[REQ-112/AK-3] Buch mit Band 3: Feld leeren, „Sichern“ → keine Bandnummer, Zeile rechts leer (auch nach Neustart)', async () => {
      const w = await starte();
      const b = buch('Onyx Storm', { bandnummer: 3 });
      await w.repo.save(b);
      const d = await details(w, b.id);
      await bandSichern('', d);
      await vi.waitFor(() => expect(bandWert(d)).toBe(''), W);
      expect(await bandVon(w, b.id)).toBeUndefined();
      const { d: d2 } = await neustartDetails(b.id);
      expect(bandWert(d2)).toBe('');
    });

    it.each(['0', '-1', '1,5', 'abc', '1.5'])('[REQ-112/AK-3] Eingabe „%s“ + „Sichern“ → Feld hervorgehoben, nichts gespeichert, Blatt bleibt offen', async (ein) => {
      const w = await starte();
      const b = buch('Onyx Storm', { bandnummer: 3 });
      await w.repo.save(b);
      const d = await details(w, b.id);
      const bl = await blattBandOeffnen(d);
      fireEvent.change(bandEingabe(), { target: { value: ein } });
      const wert = bandEingabe().value;
      await tippe(within(bl).getByRole('button', { name: 'Sichern' }));
      await warte(60);
      expect(await bandVon(w, b.id)).toBe(3);
      // Eingabefelder vom Typ „number“ verwerfen Text wie „abc“ selbst; dann ist das Feld leer und Leeren wäre gültig.
      if (wert === ein) {
        expect(bl.isConnected && sichtbar(bl), 'Blatt bleibt offen').toBe(true);
        expect(markiert(bandEingabe())).toBe(true);
      } else {
        expect(Number.isInteger(Number(wert)) && Number(wert) >= 1 && String(Number(wert)) === wert).toBe(false);
      }
      expect(bandWert(d)).toBe('3');
    });

    it('[REQ-112/AK-3] Grenzwert: 1 ist gültig', async () => {
      const w = await starte();
      const b = buch('Onyx Storm');
      await w.repo.save(b);
      const d = await details(w, b.id);
      await bandSichern('1', d);
      await vi.waitFor(() => expect(bandWert(d)).toBe('1'), W);
      expect(await bandVon(w, b.id)).toBe(1);
    });
  });

  describe('AK-4 Schließen ohne Sichern', () => {
    it('[REQ-112/AK-4] Buch mit Band 1, im Blatt 5 eingetragen, über „Schließen“ geschlossen → Bandnummer bleibt 1', async () => {
      const w = await starte();
      const b = buch('Fourth Wing', { bandnummer: 1 });
      await w.repo.save(b);
      const d = await details(w, b.id);
      const bl = await blattBandOeffnen(d);
      fireEvent.change(bandEingabe(), { target: { value: '5' } });
      await tippe(within(bl).getByRole('button', { name: 'Schließen' }));
      await warte(60);
      expect(bandWert(d)).toBe('1');
      expect(await bandVon(w, b.id)).toBe(1);
      // erneut geöffnet: wieder 1 vorausgefüllt
      await blattBandOeffnen(d);
      expect(bandEingabe().value).toBe('1');
    });
  });

  describe('AK-5 Zeile „Band“ ändert die Saga-Anzeige', () => {
    it('[REQ-112/AK-5] „Fourth Wing“ Band 1 in „The Empyrean“: Zeile „Band“ auf 2 → unter dem Autor ohne Neustart „Band 2 · The Empyrean“', async () => {
      const w = await starte();
      const b = buch('Fourth Wing', { bandnummer: 1 });
      await w.repo.save(b);
      await aufnehmen(w, await saga(w, 'The Empyrean'), b);
      const d = await details(w, b.id);
      await vi.waitFor(() => expect(sagaZeilen(d)).toEqual(['Band 1 · The Empyrean']), W);
      await bandSichern('2', d);
      await vi.waitFor(() => expect(sagaZeilen(d)).toEqual(['Band 2 · The Empyrean']), W);
    });

    it('[REQ-112/AK-5] danach zeigt die Listenübersicht „Sagas“ im Feld „Band“ 2', async () => {
      const w = await starte();
      const b = buch('Fourth Wing', { bandnummer: 1 });
      await w.repo.save(b);
      await aufnehmen(w, await saga(w, 'The Empyrean'), b);
      const d = await details(w, b.id);
      await bandSichern('2', d);
      await uebersichtSagas(d);
      expect(bandFelderUebersicht().map((f) => f.value)).toEqual(['2']);
    });

    it('[REQ-112/AK-5] Sortierung „nach Bänden“ folgt der Bandnummer des Buches', async () => {
      const w = await starte();
      const s = await saga(w, 'The Empyrean');
      const a = buch('Alpha', { bandnummer: 2 });
      const z = buch('Zeta', { bandnummer: 1 });
      for (const x of [a, z]) {
        await w.repo.save(x);
        await aufnehmen(w, s, x);
      }
      const d = await details(w, a.id);
      await bandSichern('3', d);
      const { bandnummer } = (await w.repo.get(a.id))!;
      expect(bandnummer).toBe(3);
      // Sicht des Nutzers: Saga öffnen und Reihenfolge prüfen
      await tippe(textEls('Band 3 · The Empyrean', d)[0]);
      await vi.waitFor(() => expect(screen.queryAllByRole('heading', { name: 'The Empyrean' }).length).toBeGreaterThan(0), W);
      await warte(60);
      const zeta = textEls('Zeta')[0];
      const alpha = textEls('Alpha')[0];
      expect(zeta.compareDocumentPosition(alpha) & Node.DOCUMENT_POSITION_FOLLOWING, 'Zeta (Band 1) vor Alpha (Band 3)').toBeTruthy();
    });
  });

  describe('AK-6 Saga-Feld ändert die Zeile „Band“', () => {
    it('[REQ-112/AK-6] „Fourth Wing“ Band 1 in „The Empyrean“: in der Listenübersicht „Sagas“ 4 eintragen und übernehmen → Zeile „Band“ zeigt „4“', async () => {
      const w = await starte();
      const b = buch('Fourth Wing', { bandnummer: 1 });
      await w.repo.save(b);
      await aufnehmen(w, await saga(w, 'The Empyrean'), b);
      const d = await details(w, b.id);
      await uebersichtSagas(d);
      const f = bandFelderUebersicht()[0];
      expect(f.value).toBe('1');
      fireEvent.change(f, { target: { value: '4' } });
      fireEvent.blur(f);
      await warte(60);
      await tippe(zurueck());
      await vi.waitFor(() => expect(bandWert(region())).toBe('4'), W);
      expect(sagaZeilen()).toEqual(['Band 4 · The Empyrean']);
      expect(await bandVon(w, b.id)).toBe(4);
    });

    it('[REQ-112/AK-6] Variante Blatt „Zu einer Saga hinzufügen“: Band 6 gesichert → Zeile „Band“ zeigt „6“', async () => {
      const w = await starte();
      const b = buch('Fourth Wing');
      await w.repo.save(b);
      await saga(w, 'The Empyrean');
      const d = await details(w, b.id);
      const pille = Array.from(d.querySelectorAll<HTMLElement>('button, [role="button"]')).find((e) => norm(e.textContent) === '+ Zu einer Saga hinzufügen');
      await tippe(pille);
      await vi.waitFor(() => expect(screen.queryAllByRole('dialog').length).toBeGreaterThan(0), W);
      await tippe(within(oberstesBlatt()).getByRole('checkbox', { name: /The Empyrean/ }));
      const f = within(oberstesBlatt()).queryAllByLabelText(/Band/).filter((e) => e.tagName === 'INPUT')[0] as HTMLInputElement;
      fireEvent.change(f, { target: { value: '6' } });
      await tippe(within(oberstesBlatt()).getByRole('button', { name: 'Sichern' }));
      await vi.waitFor(() => expect(bandWert(d)).toBe('6'), W);
    });
  });

  describe('AK-7 Ein Buch in mehreren Sagas', () => {
    it('[REQ-112/AK-7] Band 1 in „The Empyrean“ und „Crescent City“: „Band 1 · Crescent City“ und „Band 1 · The Empyrean“; Zeile „Band“ auf 2 → beide „Band 2“', async () => {
      const w = await starte();
      const b = buch('Crossover', { bandnummer: 1 });
      await w.repo.save(b);
      await aufnehmen(w, await saga(w, 'The Empyrean'), b);
      await aufnehmen(w, await saga(w, 'Crescent City'), b);
      const d = await details(w, b.id);
      await vi.waitFor(() => expect(sagaZeilen(d)).toEqual(['Band 1 · Crescent City', 'Band 1 · The Empyrean']), W);
      await bandSichern('2', d);
      await vi.waitFor(() => expect(sagaZeilen(d)).toEqual(['Band 2 · Crescent City', 'Band 2 · The Empyrean']), W);
      const { d: d2 } = await neustartDetails(b.id);
      expect(sagaZeilen(d2)).toEqual(['Band 2 · Crescent City', 'Band 2 · The Empyrean']);
    });

    it('[REQ-112/AK-7] Leeren der Zeile „Band“ → beide Saga-Zeilen zeigen nur den Namen', async () => {
      const w = await starte();
      const b = buch('Crossover', { bandnummer: 1 });
      await w.repo.save(b);
      await aufnehmen(w, await saga(w, 'The Empyrean'), b);
      await aufnehmen(w, await saga(w, 'Crescent City'), b);
      const d = await details(w, b.id);
      await bandSichern('', d);
      await vi.waitFor(() => expect(sagaZeilen(d)).toEqual([]), W);
      expect(textEls('Crescent City', d).length).toBeGreaterThan(0);
      expect(textEls('The Empyrean', d).length).toBeGreaterThan(0);
    });
  });

  // --------------------------------------------------------------------------- Manueller Eintrag / Scan
  async function seiteBuecher(w: Welt, extra: Record<string, unknown> = {}) {
    const BA = w.BA;
    render(<BA bildspeicher={bilder} bildquelle={quelle} jetzt={jetzt} {...extra} />);
    await screen.findByRole('heading', { name: 'Deine Bücher' }, W);
  }
  const eintrag = () => screen.getByRole('dialog', { name: 'Manueller Eintrag' });
  const eintragFeld = (name: string) => within(eintrag()).getByLabelText(new RegExp(`^\\s*${name}\\s*$`, 'i')) as HTMLInputElement;
  async function hinzufuegen() {
    await tippe(within(eintrag()).getByRole('button', { name: 'Hinzufügen' }));
    const d = await screen.findByRole('region', { name: 'Buchdetails' }, W);
    await reiterDetails(d);
    return d;
  }

  describe('AK-8 Manueller Eintrag', () => {
    async function oeffneEintrag(w: Welt) {
      await seiteBuecher(w);
      await tippe(screen.getByRole('button', { name: 'Buch hinzufügen' }));
      await tippe(within(await screen.findByRole('menu', { name: 'Buch hinzufügen' }, W)).getByRole('menuitem', { name: /Von Hand eintragen/ }));
      return screen.findByRole('dialog', { name: 'Manueller Eintrag' }, W);
    }

    it('[REQ-112/AK-8] Zeile „Band“ im Manuellen Eintrag direkt unter „Exemplar“, leer, mit Pfeil', async () => {
      const w = await starte();
      const m = await oeffneEintrag(w);
      const zeilen = ausgabeZeilen(m);
      const i = zeilen.findIndex((z) => bezeichnung(z) === 'Band');
      expect(i).toBeGreaterThan(0);
      expect(bezeichnung(zeilen[i - 1])).toBe('Exemplar');
      expect(bandWert(m)).toBe('');
      expect(norm(bandZeile(m).textContent)).toContain('›');
    });

    it('[REQ-112/AK-8] Titel, Seiten und Band 2 eintragen, „Hinzufügen“ → neues Buch mit Bandnummer 2, Zeile „Band“ der Buchdetails „2“', async () => {
      const w = await starte();
      const m = await oeffneEintrag(w);
      fireEvent.change(eintragFeld('Titel'), { target: { value: 'Handbuch' } });
      fireEvent.change(eintragFeld('Seiten'), { target: { value: '320' } });
      await bandSichern('2', m);
      await vi.waitFor(() => expect(bandWert(eintrag())).toBe('2'), W);
      const d = await hinzufuegen();
      await vi.waitFor(() => expect(bandWert(d)).toBe('2'), W);
      const [b] = (await w.repo.list()).filter((x) => x.titel === 'Handbuch');
      expect(b.bandnummer).toBe(2);
    });

    it('[REQ-112/AK-8] gleiche Regeln: ungültige Eingabe 0 wird hervorgehoben und nicht übernommen', async () => {
      const w = await starte();
      const m = await oeffneEintrag(w);
      const bl = await blattBandOeffnen(m);
      fireEvent.change(bandEingabe(), { target: { value: '0' } });
      await tippe(within(bl).getByRole('button', { name: 'Sichern' }));
      await warte(60);
      expect(markiert(bandEingabe())).toBe(true);
      await tippe(within(bl).getByRole('button', { name: 'Schließen' }));
      await warte(40);
      expect(bandWert(eintrag())).toBe('');
    });

    it('[REQ-112/AK-8] ohne Band angelegt → Buch ohne Bandnummer', async () => {
      const w = await starte();
      await oeffneEintrag(w);
      fireEvent.change(eintragFeld('Titel'), { target: { value: 'Ohne Band' } });
      fireEvent.change(eintragFeld('Seiten'), { target: { value: '100' } });
      const d = await hinzufuegen();
      expect(bandWert(d)).toBe('');
      expect((await w.repo.list()).find((x) => x.titel === 'Ohne Band')!.bandnummer).toBeUndefined();
    });

    it('[REQ-112/AK-8] Band eingetragen, Manueller Eintrag über X geschlossen → kein Buch angelegt', async () => {
      const w = await starte();
      const m = await oeffneEintrag(w);
      fireEvent.change(eintragFeld('Titel'), { target: { value: 'Verworfen' } });
      await bandSichern('2', m);
      await tippe(within(eintrag()).getByRole('button', { name: 'Schließen' }));
      await warte(60);
      expect(await w.repo.list()).toEqual([]);
    });
  });

  describe('AK-9 Band aus dem Barcode-Scan', () => {
    const ISBN = '9783551551672';
    function scannerFake() {
      const s = {
        optionen: null as { beiIsbn: (isbn: string) => void } | null,
        starten: vi.fn(async (o: { beiIsbn: (isbn: string) => void }) => void (s.optionen = o)),
        lichtSetzen: vi.fn(async () => {}),
        beenden: vi.fn(async () => {}),
      };
      return s;
    }
    async function scanneUndWaehle(w: Welt, suche: { suchen: (isbn: string) => Promise<Treffer[]> }, titel: string) {
      const scanner = scannerFake();
      await seiteBuecher(w, { barcodeScanner: scanner, isbnSuche: suche });
      await tippe(screen.getByRole('button', { name: 'Buch hinzufügen' }));
      await tippe(within(await screen.findByRole('menu', { name: 'Buch hinzufügen' }, W)).getByRole('menuitem', { name: /Barcode/i }));
      await vi.waitFor(() => expect(scanner.optionen).not.toBeNull(), W);
      await act(async () => {
        scanner.optionen!.beiIsbn(ISBN);
        await new Promise((r) => setTimeout(r, 30));
      });
      const wahl = await screen.findByRole('dialog', { name: 'Gefundene Bücher' }, W);
      await tippe(within(wahl).getAllByRole('button').find((b) => norm(b.textContent).includes(titel)));
      return screen.findByRole('dialog', { name: 'Manueller Eintrag' }, W);
    }
    const ZWEI: Treffer[] = [
      { quelle: 'dnb', angaben: { titel: 'Mit Band', autor: 'Rebecca Yarros', isbn: ISBN, seitenanzahl: 500, reihe: 'The Empyrean', bandnummer: 2 } },
      { quelle: 'openlibrary', angaben: { titel: 'Ohne Band', autor: 'Rebecca Yarros', isbn: ISBN, seitenanzahl: 500 } },
    ];

    it('[REQ-112/AK-9] Treffer mit Band 2 antippen → Zeile „Band“ im Manuellen Eintrag „2“; nach „Hinzufügen“ Zeile „Band“ der Buchdetails „2“', async () => {
      const w = await starte();
      const m = await scanneUndWaehle(w, { suchen: async () => ZWEI }, 'Mit Band');
      await vi.waitFor(() => expect(bandWert(m)).toBe('2'), W);
      const d = await hinzufuegen();
      await vi.waitFor(() => expect(bandWert(d)).toBe('2'), W);
      expect((await w.repo.list())[0].bandnummer).toBe(2);
    });

    it('[REQ-112/AK-9] stattdessen zweiter Treffer ohne Band → Zeile „Band“ bleibt leer', async () => {
      const w = await starte();
      const m = await scanneUndWaehle(w, { suchen: async () => ZWEI }, 'Ohne Band');
      await vi.waitFor(() => expect(eintragFeld('Titel').value).toBe('Ohne Band'), W);
      expect(bandWert(m)).toBe('');
    });

    it('[REQ-112/AK-9] Treffer mit Band „II“ (Open Library „The Empyrean ; II“) → Zeile „Band“ bleibt leer', async () => {
      const w = await starte();
      const satz = { title: 'Roemisch', number_of_pages: 500, isbn_13: [ISBN], series: ['The Empyrean ; II'] };
      const http = {
        text: async (url: string) => (/openlibrary\.org/.test(url) ? { status: 200, text: JSON.stringify({ [`ISBN:${ISBN}`]: { ...satz, details: satz } }) } : { status: 404, text: '' }),
        bild: async () => null,
      };
      const { isbnSucheMit } = await import('@/barcode/suche');
      const m = await scanneUndWaehle(w, isbnSucheMit(http), 'Roemisch');
      await vi.waitFor(() => expect(eintragFeld('Titel').value).toBe('Roemisch'), W);
      expect(bandWert(m)).toBe('');
    });

    it('[REQ-112/AK-9] Treffer aus Open Library „The Empyrean ; 2“ → Zeile „Band“ „2“; Reihe ordnet keiner Saga zu', async () => {
      const w = await starte();
      const satz = { title: 'Arabisch', number_of_pages: 500, isbn_13: [ISBN], series: ['The Empyrean ; 2'] };
      const http = {
        text: async (url: string) => (/openlibrary\.org/.test(url) ? { status: 200, text: JSON.stringify({ [`ISBN:${ISBN}`]: { ...satz, details: satz } }) } : { status: 404, text: '' }),
        bild: async () => null,
      };
      const { isbnSucheMit } = await import('@/barcode/suche');
      const m = await scanneUndWaehle(w, isbnSucheMit(http), 'Arabisch');
      await vi.waitFor(() => expect(bandWert(m)).toBe('2'), W);
      const d = await hinzufuegen();
      expect(bandWert(d)).toBe('2');
      expect(await w.listen.listen()).toEqual([]);
      expect(await w.listen.zugehoerigkeiten()).toEqual([]);
    });

    it.each([0, -1, 1.5])('[REQ-112/AK-9] Negativfall: gelieferte Bandangabe %s ist keine ganze Zahl ≥ 1 → Zeile „Band“ leer', async (band) => {
      const w = await starte();
      const t: Treffer[] = [{ quelle: 'dnb', angaben: { titel: 'Schief', isbn: ISBN, seitenanzahl: 100, bandnummer: band } }];
      const m = await scanneUndWaehle(w, { suchen: async () => t }, 'Schief');
      await vi.waitFor(() => expect(eintragFeld('Titel').value).toBe('Schief'), W);
      expect(bandWert(m)).toBe('');
    });

    it('[REQ-112/AK-9] Band aus dem Scan im Manuellen Eintrag vor dem Anlegen auf 3 geändert → Buch hat Band 3', async () => {
      const w = await starte();
      const m = await scanneUndWaehle(w, { suchen: async () => ZWEI }, 'Mit Band');
      await vi.waitFor(() => expect(bandWert(m)).toBe('2'), W);
      await bandSichern('3', m);
      await hinzufuegen();
      expect((await w.repo.list())[0].bandnummer).toBe(3);
    });
  });
});

// ============================================================================= AK-10 Übernahme vorhandener Daten
/** Legt die Datenbank im Stand vor dem Update an (IndexedDB-Schema 9, Bandnummer je Zugehörigkeit). */
async function altdatenAnlegen(buecher: (Partial<Buch> & { id: string; titel: string })[], listen: Liste[], zug: { listeId: string; buchId: string; band?: number }[]) {
  const db = await new Promise<IDBDatabase>((resolve, reject) => {
    const req = indexedDB.open('blaetterzeit', 9);
    req.onupgradeneeded = () => {
      const d = req.result;
      d.createObjectStore('bilder');
      d.createObjectStore('buecher', { keyPath: 'buch.id' });
      d.createObjectStore('listen', { keyPath: 'id' });
      d.createObjectStore('listenBuecher', { keyPath: ['listeId', 'buchId'] });
      d.createObjectStore('zitate', { keyPath: 'id' });
      d.createObjectStore('profil');
      d.createObjectStore('jahresziele', { keyPath: 'jahr' });
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(['buecher', 'listen', 'listenBuecher'], 'readwrite');
    buecher.forEach((b, i) => tx.objectStore('buecher').put({ buch: { status: 'ungelesen', seitenanzahl: 300, eingetragenAm: '2026-11-01T10:00:00.000Z', ...b }, nr: 1_700_000_000_000_000 + i }));
    for (const l of listen) tx.objectStore('listen').put(l);
    for (const z of zug) tx.objectStore('listenBuecher').put(z);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
  db.close();
}

describe('REQ-112 AK-10 Übernahme vorhandener Daten', () => {
  const CC: Liste = { id: 'saga-cc', art: 'saga', name: 'Crescent City' };
  const EM: Liste = { id: 'saga-em', art: 'saga', name: 'The Empyrean' };
  const XX: Liste = { id: 'saga-xx', art: 'saga', name: 'Andere Saga' };
  const ALT_ZUG = [
    { listeId: CC.id, buchId: 'buch-a', band: 3 },
    { listeId: XX.id, buchId: 'buch-b', band: 5 },
    { listeId: EM.id, buchId: 'buch-c', band: 4 },
    { listeId: CC.id, buchId: 'buch-c', band: 2 },
  ];
  async function altstand() {
    await altdatenAnlegen(
      [
        { id: 'buch-a', titel: 'Buch A' },
        { id: 'buch-b', titel: 'Buch B', bandnummer: 2 },
        { id: 'buch-c', titel: 'Buch C' },
      ],
      [CC, EM, XX],
      ALT_ZUG,
    );
  }

  it.each([
    ['buch-a', '3', 'ohne eigene Bandnummer, Saga-Band 3'],
    ['buch-b', '2', 'eigene Bandnummer 2 (Scan) hat Vorrang vor Saga-Band 5'],
    ['buch-c', '2', 'zwei Sagas mit Band 4 und 2 → die kleinste'],
  ])('[REQ-112/AK-10] nach dem Update zeigt die Zeile „Band“ bei %s „%s“ (%s)', async (id, erwartet) => {
    await altstand();
    const w = await starte();
    const d = await details(w, id);
    await vi.waitFor(() => expect(bandWert(d)).toBe(erwartet), W);
    expect(await bandVon(w, id)).toBe(Number(erwartet));
  });

  it('[REQ-112/AK-10] alle Saga-Zugehörigkeiten und Listen sind unverändert vorhanden, Bücher vollständig', async () => {
    await altstand();
    const w = await starte();
    const zug = (await w.listen.zugehoerigkeiten()).map((z) => `${z.listeId}|${z.buchId}`).sort();
    expect(zug).toEqual(ALT_ZUG.map((z) => `${z.listeId}|${z.buchId}`).sort());
    expect((await w.listen.listen()).map((l) => l.name).sort()).toEqual(['Andere Saga', 'Crescent City', 'The Empyrean']);
    expect((await w.repo.list()).map((b) => b.titel).sort()).toEqual(['Buch A', 'Buch B', 'Buch C']);
    expect((await w.repo.get('buch-a'))!.eingetragenAm).toBe('2026-11-01T10:00:00.000Z');
  });

  it('[REQ-112/AK-10] Saga-Zeilen nach dem Update: Buch C zeigt „Band 2 · Crescent City“ und „Band 2 · The Empyrean“', async () => {
    await altstand();
    const w = await starte();
    const d = await details(w, 'buch-c');
    await vi.waitFor(() => expect(sagaZeilen(d)).toEqual(['Band 2 · Crescent City', 'Band 2 · The Empyrean']), W);
  });

  it('[REQ-112/AK-10] Übernahme ist dauerhaft: zweiter Start ändert nichts, eine danach geänderte Bandnummer bleibt', async () => {
    await altstand();
    const w = await starte();
    expect(await bandVon(w, 'buch-c')).toBe(2);
    await w.repo.save({ ...(await w.repo.get('buch-c'))!, bandnummer: 9 });
    const w2 = await starte();
    expect(await bandVon(w2, 'buch-c')).toBe(9);
    expect(await bandVon(w2, 'buch-a')).toBe(3);
  });

  it('[REQ-112/AK-10] Grenzfall: Buch in einer Saga ohne Band und ohne eigene Bandnummer → nach dem Update ohne Bandnummer', async () => {
    await altdatenAnlegen([{ id: 'buch-d', titel: 'Buch D' }], [CC], [{ listeId: CC.id, buchId: 'buch-d' }]);
    const w = await starte();
    const d = await details(w, 'buch-d');
    expect(bandWert(d)).toBe('');
    expect(await bandVon(w, 'buch-d')).toBeUndefined();
  });
});
