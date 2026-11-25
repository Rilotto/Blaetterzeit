/**
 * Akzeptanztests REQ-094 – Titel und Autor unter dem Cover über ein Blatt ändern, Autor leeren, Platzhalter „unbekannter Autor“.
 * Abgeleitet aus dem REQ-Text. Bekannte Schnittstellen: Titel [data-buchdetails-titel], Autorzeile [data-buchdetails-autor]
 * (REQ-018/REQ-028); Blatt nach Muster „Verlag“ (REQ-063): role=dialog mit Textfeld, Pille „Sichern“, X [aria-label="Schließen"],
 * Außen [data-blatt-hintergrund], Fehler data-fehler="true"/aria-invalid="true". Das Blatt wird über Rolle und Text ermittelt.
 * „Neustart“ = Module neu laden, neue Repository-Instanz auf derselben (Fake-)IndexedDB.
 */
import '@testing-library/jest-dom/vitest';
import { act, cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { IDBFactory, IDBKeyRange } from 'fake-indexeddb';
import type { ComponentType, CSSProperties } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { Buch } from '@/domain/buch';
import type { BookRepository, ImageStore } from '@/storage';
import { farbrubriken, farbVariablen } from '@/theme';

vi.mock('@/buecher/demodaten', () => ({ demoBuecher: [] }));
beforeEach(() => {
  vi.stubGlobal('indexedDB', new IDBFactory());
  vi.stubGlobal('IDBKeyRange', IDBKeyRange);
});
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

type Welt = { repo: BookRepository; BD: ComponentType<Record<string, unknown>>; BA: ComponentType<Record<string, unknown>> };
const W = { timeout: 4000 };
const buch = (f: Partial<Buch> = {}): Buch => ({ id: crypto.randomUUID(), titel: 'Der Testroman', status: 'ungelesen', eingetragenAm: '2026-11-01T10:00:00.000Z', ...f });
const bilder = { get: async () => undefined, put: async () => {}, remove: async () => {} } as unknown as ImageStore;
const quelle = { scannen: async () => null, galerie: async () => null };
async function starte(): Promise<Welt> {
  vi.resetModules();
  const st = (await import('@/storage')) as typeof import('@/storage');
  const BD = (await import('@/views/BuchDetails')).default as unknown as ComponentType<Record<string, unknown>>;
  const BA = (await import('@/views/BuecherAnsicht')).default as unknown as ComponentType<Record<string, unknown>>;
  return { repo: st.createBookRepository(), BD, BA };
}
async function warte(ms = 40) {
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
async function zeige(w: Welt, id: string) {
  const BD = w.BD;
  render(
    <div data-testwurzel="" style={farbVariablen() as CSSProperties}>
      <BD buchId={id} bildspeicher={bilder} bildquelle={quelle} onZurueck={() => {}} />
    </div>,
  );
  const d = await screen.findByRole('region', { name: 'Buchdetails' }, W);
  await vi.waitFor(() => expect(d.querySelector('[data-buchdetails-titel]')).not.toBeNull(), W);
  return d;
}
async function mitBuch(b: Buch) {
  const w = await starte();
  await w.repo.save(b);
  return { w, d: await zeige(w, b.id), id: b.id };
}
async function gespeichert(id: string) {
  cleanup();
  return (await starte()).repo.get(id);
}
async function neustartAnzeige(id: string) {
  cleanup();
  return zeige(await starte(), id);
}
const norm = (t: string | null | undefined) => (t ?? '').replace(/[\s  ]+/g, ' ').trim();
const titelEl = (d: HTMLElement) => d.querySelector<HTMLElement>('[data-buchdetails-titel]')!;
const vor = (a: Node, b: Node) => Boolean(a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING);
/** Autorzeile unter dem Titel: [data-buchdetails-autor] oder das Element mit dem Platzhalter. */
function autorEl(d: HTMLElement) {
  const a = d.querySelector<HTMLElement>('[data-buchdetails-autor]');
  if (a) return a;
  const p = Array.from(d.querySelectorAll<HTMLElement>('*')).filter((e) => norm(e.textContent) === 'unbekannter Autor');
  return p.find((e) => !p.some((o) => o !== e && e.contains(o))) ?? null;
}
const autorText = (d: HTMLElement) => norm(autorEl(d)?.textContent);
const blatt = () => {
  const alle = screen.queryAllByRole('dialog');
  return alle.length ? alle[alle.length - 1] : null;
};
const feld = () => blatt()!.querySelector<HTMLInputElement>('input:not([type="hidden"]), textarea')!;
const gib = (t: string) => fireEvent.change(feld(), { target: { value: t } });
async function oeffne(el: HTMLElement) {
  await tippe(el);
  await vi.waitFor(() => expect(blatt()).not.toBeNull(), W);
  expect(within(blatt()!).getByRole('button', { name: 'Sichern' })).toBeInTheDocument();
}
async function sichern() {
  await tippe(within(blatt()!).getByRole('button', { name: 'Sichern' }));
  await warte(60);
}
const markiert = () => feld().getAttribute('data-fehler') === 'true' && feld().getAttribute('aria-invalid') === 'true';
function inPrimaer(el: HTMLElement) {
  const ctx = document.querySelector<HTMLElement>('[data-testwurzel]')!;
  const p = document.createElement('span');
  p.style.setProperty('color', farbrubriken.primaer.wert);
  ctx.appendChild(p);
  const primaer = getComputedStyle(p).color;
  p.remove();
  const cs = getComputedStyle(el);
  return [cs.color, cs.borderTopColor, cs.outlineColor, cs.boxShadow].some((w) => w.includes(primaer));
}
async function zurueckTaste() {
  await warte(20);
  await act(async () => {
    window.dispatchEvent(new PopStateEvent('popstate', { state: null }));
    await new Promise((r) => setTimeout(r, 20));
  });
}

describe('REQ-094 Titel und Autor ändern', () => {
  it('[REQ-094/AK-1] Autor „Ann Leckie“ antippen: Blatt mit „Ann Leckie“ und „Sichern“; „Anne Leckie“ sichern → Blatt zu, Autorzeile neu, auch nach Neustart', async () => {
    const { d, id } = await mitBuch(buch({ autor: 'Ann Leckie' }));
    expect(autorText(d)).toBe('Ann Leckie');
    await oeffne(autorEl(d)!);
    expect(feld().value).toBe('Ann Leckie');
    gib('Anne Leckie');
    await sichern();
    await waitFor(() => expect(blatt()).toBeNull(), W);
    await waitFor(() => expect(autorText(d)).toBe('Anne Leckie'), W);
    expect((await gespeichert(id))?.autor).toBe('Anne Leckie');
    expect(autorText(await neustartAnzeige(id))).toBe('Anne Leckie');
  });

  it('[REQ-094/AK-2] Autor leeren und sichern: kein Autor, „unbekannter Autor“ unter dem Titel, auch nach Neustart', async () => {
    const { d, id } = await mitBuch(buch({ autor: 'Ann Leckie' }));
    await oeffne(autorEl(d)!);
    gib('');
    await sichern();
    await waitFor(() => expect(blatt()).toBeNull(), W);
    await waitFor(() => expect(autorText(d)).toBe('unbekannter Autor'), W);
    expect(vor(titelEl(d), autorEl(d)!)).toBe(true);
    expect((await gespeichert(id))?.autor).toBeUndefined();
    const d2 = await neustartAnzeige(id);
    expect(autorText(d2)).toBe('unbekannter Autor');
  });

  it('[REQ-094/AK-2] Grenzfall: nur Leerzeichen als Autor → kein gespeicherter Autor aus Leerzeichen', async () => {
    const { d, id } = await mitBuch(buch({ autor: 'Ann Leckie' }));
    await oeffne(autorEl(d)!);
    gib('   ');
    await sichern();
    const b = await gespeichert(id);
    expect(b?.autor === undefined || b?.autor === 'Ann Leckie').toBe(true);
  });

  it('[REQ-094/AK-3] Buch ohne Autor: „unbekannter Autor“ antippen öffnet das Blatt mit leerem Feld; „Ann Leckie“ sichern → Autorzeile zeigt „Ann Leckie“', async () => {
    const { d, id } = await mitBuch(buch());
    expect(autorText(d)).toBe('unbekannter Autor');
    await oeffne(autorEl(d)!);
    expect(feld().value, 'der Platzhalter ist kein gespeicherter Autor').toBe('');
    gib('Ann Leckie');
    await sichern();
    await waitFor(() => expect(autorText(d)).toBe('Ann Leckie'), W);
    expect(d.textContent).not.toContain('unbekannter Autor');
    expect((await gespeichert(id))?.autor).toBe('Ann Leckie');
  });

  it('[REQ-094/AK-3] Negativfall: der Platzhalter wird nicht als Autor gespeichert (Blatt ohne Änderung gesichert)', async () => {
    const { d, id } = await mitBuch(buch());
    await oeffne(autorEl(d)!);
    await sichern();
    expect((await gespeichert(id))?.autor).toBeUndefined();
  });

  it('[REQ-094/AK-4] Titel antippen, „Der Testroman, Band 2“ sichern: Buchdetails und Seite „Bücher“ zeigen ihn, auch nach Neustart', async () => {
    const { d, id } = await mitBuch(buch());
    await oeffne(titelEl(d));
    expect(feld().value).toBe('Der Testroman');
    gib('Der Testroman, Band 2');
    await sichern();
    await waitFor(() => expect(blatt()).toBeNull(), W);
    await waitFor(() => expect(norm(titelEl(d).textContent)).toBe('Der Testroman, Band 2'), W);
    expect((await gespeichert(id))?.titel).toBe('Der Testroman, Band 2');
    expect(norm(titelEl(await neustartAnzeige(id)).textContent)).toBe('Der Testroman, Band 2');
    cleanup();
    const w = await starte();
    const BA = w.BA;
    render(<BA repository={w.repo} bildspeicher={bilder} bildquelle={quelle} />);
    await waitFor(() => expect(document.querySelector('[data-abschnitt="alle-buecher"] ul')).not.toBeNull(), W);
    const titel = Array.from(document.querySelectorAll('[data-bucheintrag] [data-buchtitel]')).map((t) => norm(t.textContent));
    expect(titel).toContain('Der Testroman, Band 2');
    expect(titel).not.toContain('Der Testroman');
  });

  it.each([
    ['leer', ''],
    ['nur Leerzeichen', '   '],
  ])('[REQ-094/AK-5] Titel %s: Feld in Primär hervorgehoben, kein Hinweistext, Blatt offen, Titel bleibt', async (_n, ein) => {
    const { d, id } = await mitBuch(buch());
    await oeffne(titelEl(d));
    gib(ein);
    const textVorher = norm(blatt()!.textContent);
    expect(markiert()).toBe(false);
    await sichern();
    expect(blatt()).not.toBeNull();
    expect(markiert()).toBe(true);
    expect(inPrimaer(feld())).toBe(true);
    expect(norm(blatt()!.textContent)).toBe(textVorher);
    expect(screen.queryByRole('alert')).toBeNull();
    expect(norm(titelEl(d).textContent)).toBe('Der Testroman');
    expect((await gespeichert(id))?.titel).toBe('Der Testroman');
  });

  it('[REQ-094/AK-5] Hervorhebung endet bei Änderung im Feld; danach gültig sichern klappt', async () => {
    const { d, id } = await mitBuch(buch());
    await oeffne(titelEl(d));
    gib('');
    await sichern();
    expect(markiert()).toBe(true);
    gib('N');
    expect(feld().getAttribute('data-fehler')).not.toBe('true');
    expect(feld().getAttribute('aria-invalid')).not.toBe('true');
    gib('Neu');
    await sichern();
    await waitFor(() => expect(norm(titelEl(d).textContent)).toBe('Neu'), W);
    expect((await gespeichert(id))?.titel).toBe('Neu');
  });

  describe('AK-6 Schließen ohne Sichern verwirft', () => {
    it.each(['X', 'Außen', 'Zurück-Taste'])('[REQ-094/AK-6] Titel geändert, Schließen über %s: Titel und Autor unverändert', async (weg) => {
      const { d, id } = await mitBuch(buch({ autor: 'Ann Leckie' }));
      await oeffne(titelEl(d));
      gib('Anders');
      if (weg === 'X') await tippe(blatt()!.querySelector('[aria-label="Schließen"]')!);
      else if (weg === 'Außen') await tippe(document.querySelector('[data-blatt-hintergrund]')!);
      else await zurueckTaste();
      await waitFor(() => expect(blatt()).toBeNull(), W);
      expect(screen.getByRole('region', { name: 'Buchdetails' })).toBeInTheDocument();
      expect(norm(titelEl(d).textContent)).toBe('Der Testroman');
      const b = await gespeichert(id);
      expect([b?.titel, b?.autor]).toEqual(['Der Testroman', 'Ann Leckie']);
    });

    it.each(['X', 'Außen', 'Zurück-Taste'])('[REQ-094/AK-6] Autor geleert, Schließen über %s: Autor bleibt „Ann Leckie“', async (weg) => {
      const { d, id } = await mitBuch(buch({ autor: 'Ann Leckie' }));
      await oeffne(autorEl(d)!);
      gib('');
      if (weg === 'X') await tippe(blatt()!.querySelector('[aria-label="Schließen"]')!);
      else if (weg === 'Außen') await tippe(document.querySelector('[data-blatt-hintergrund]')!);
      else await zurueckTaste();
      await waitFor(() => expect(blatt()).toBeNull(), W);
      expect(autorText(d)).toBe('Ann Leckie');
      expect((await gespeichert(id))?.autor).toBe('Ann Leckie');
    });
  });
});
