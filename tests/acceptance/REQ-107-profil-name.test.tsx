/**
 * Akzeptanztests REQ-107 – Seite „Profil“: eigenen Namen hinterlegen, ändern und leeren.
 * Abgeleitet aus dem REQ-Text (Sprint 10, Teil C). Schwarzkasten über die App (Rollen und Texte):
 *  - Zeile „Name“: Schaltfläche, deren Name mit „Name“ beginnt; rechts der Name, dann „›“.
 *  - Blatt: role="dialog" mit Textfeld, „Sichern“ und „Schließen“ (Muster REQ-063).
 *  - Gruß der Startseite wie REQ-101 (kleinstes Element mit genau dem Grußtext).
 *  - „Neustart“: Module neu laden, dieselbe IndexedDB (fake-indexeddb) und derselbe localStorage.
 */
import '@testing-library/jest-dom/vitest';
import { act, cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { IDBFactory, IDBKeyRange } from 'fake-indexeddb';
import type { ComponentType } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/buecher/demodaten', () => ({ demoBuecher: [] }));
beforeEach(() => {
  vi.stubGlobal('indexedDB', new IDBFactory());
  vi.stubGlobal('IDBKeyRange', IDBKeyRange);
  localStorage.clear();
  vi.useFakeTimers({ toFake: ['Date'] });
  vi.setSystemTime(new Date(2026, 10, 24, 12, 0));
});
afterEach(() => {
  cleanup();
  vi.useRealTimers();
  vi.unstubAllGlobals();
  localStorage.clear();
});

type Komp = ComponentType<Record<string, unknown>>;
const W = { timeout: 4000 };
const norm = (t: string | null | undefined) => (t ?? '').replace(/[\s  ]+/g, ' ').trim();
function sichtbar(el: Element | null): boolean {
  for (let n = el as HTMLElement | null; n; n = n.parentElement) {
    if (n.hidden || n.getAttribute('aria-hidden') === 'true' || n.style?.display === 'none') return false;
  }
  return true;
}
function textEls(text: string | RegExp, root: ParentNode = document.body): HTMLElement[] {
  const passt = (t: string) => (typeof text === 'string' ? t === text : text.test(t));
  const k = Array.from(root.querySelectorAll<HTMLElement>('*')).filter((e) => passt(norm(e.textContent)) && sichtbar(e));
  return k.filter((c) => !k.some((o) => o !== c && c.contains(o)));
}
async function warte(ms = 40) {
  await act(async () => {
    await new Promise((r) => setTimeout(r, ms));
  });
}
async function tippe(el: Element | null) {
  expect(el).not.toBeNull();
  await act(async () => {
    fireEvent.click(el!);
    await new Promise((r) => setTimeout(r, 20));
  });
}
async function eingeben(el: Element, wert: string) {
  await act(async () => {
    fireEvent.change(el, { target: { value: wert } });
  });
}
const nav = () => screen.getByRole('navigation', { name: 'Hauptnavigation' });
const main = () => screen.getByRole('main');
async function menue(name: string) {
  await tippe(within(nav()).getByRole('button', { name }));
  await warte(60);
}
async function starte(): Promise<Komp> {
  vi.resetModules();
  const App = (await import('@/App')).default as unknown as Komp;
  render(<App />);
  await screen.findByRole('navigation', { name: 'Hauptnavigation' }, W);
  await warte(60);
  return App;
}
async function neustart() {
  cleanup();
  return starte();
}
const GRUSS = /^(Guten Morgen|Hallo|Guten Abend|Gute Nacht)(,.*)?$/;
async function gruss(): Promise<string> {
  await menue('Start');
  return vi.waitFor(() => {
    const k = textEls(GRUSS, main());
    expect(k).toHaveLength(1);
    return norm(k[0].textContent);
  }, W);
}
async function zeile(): Promise<HTMLElement> {
  if (within(nav()).getByRole('button', { name: 'Profil' }).getAttribute('aria-current') !== 'page') await menue('Profil');
  return screen.findByRole('button', { name: /^Name/ }, W);
}
async function blattOeffnen() {
  await tippe(await zeile());
  const d = await screen.findByRole('dialog', {}, W);
  return { d, feld: within(d).getByRole('textbox') as HTMLInputElement };
}
async function nameSichern(wert: string) {
  const { d, feld } = await blattOeffnen();
  await eingeben(feld, wert);
  await tippe(within(d).getByRole('button', { name: 'Sichern' }));
  await warte(80);
  expect(screen.queryByRole('dialog')).toBeNull();
}
const zeilenText = async () => norm((await zeile()).textContent);

describe('REQ-107 Zeile „Name“', () => {
  it('[REQ-107/AK-1] frisch installiert: Zeile „Name“ mit Pfeil „›“ und leerer rechter Seite', async () => {
    await starte();
    await menue('Profil');
    const z = await zeile();
    expect(norm(z.textContent).replace(/\s/g, '')).toBe('Name›');
    expect(z.textContent).toContain('›');
  });

  it('[REQ-107/AK-1] Zeile „Name“ steht oberhalb der Zeile „Design“ (Abschnitt „Du“ über „App“)', async () => {
    await starte();
    await menue('Profil');
    const z = await zeile();
    const design = screen.getByRole('button', { name: /^Design/ });
    expect(z.compareDocumentPosition(design) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(textEls('Du', main()).length).toBeGreaterThan(0);
  });

  it('[REQ-107/AK-1] Antippen der Zeile öffnet ein Blatt mit leerem Textfeld und „Sichern“', async () => {
    await starte();
    const { d, feld } = await blattOeffnen();
    expect(feld.value).toBe('');
    expect(within(d).getByRole('button', { name: 'Sichern' })).toBeInTheDocument();
  });
});

describe('REQ-107 Name hinterlegen', () => {
  it('[REQ-107/AK-2] „Christine“ sichern: Zeile zeigt „Christine“, Startseite grüßt „Hallo, Christine“, auch nach Neustart', async () => {
    await starte();
    await nameSichern('Christine');
    expect(await zeilenText()).toMatch(/^Name\s*Christine\s*›$/);
    expect(await gruss()).toBe('Hallo, Christine');
    await neustart();
    expect(await gruss()).toBe('Hallo, Christine');
    expect(await zeilenText()).toMatch(/^Name\s*Christine\s*›$/);
  });

  it('[REQ-107/AK-2] Blatt ist mit dem hinterlegten Namen vorbefüllt', async () => {
    await starte();
    await nameSichern('Christine');
    const { feld } = await blattOeffnen();
    expect(feld.value).toBe('Christine');
  });

  it('[REQ-107/AK-2] führende und folgende Leerzeichen werden entfernt', async () => {
    await starte();
    await nameSichern('   Christine  ');
    expect(await zeilenText()).toMatch(/^Name\s*Christine\s*›$/);
    expect(await gruss()).toBe('Hallo, Christine');
    const { feld } = await blattOeffnen();
    expect(feld.value).toBe('Christine');
  });

  it('[REQ-107/AK-2] Name mit Leerzeichen und Umlauten bleibt vollständig erhalten; Ändern überschreibt', async () => {
    await starte();
    await nameSichern('Anna-Lena Müller');
    expect(await gruss()).toBe('Hallo, Anna-Lena Müller');
    await nameSichern('Christine');
    expect(await gruss()).toBe('Hallo, Christine');
    await neustart();
    expect(await gruss()).toBe('Hallo, Christine');
  });
});

describe('REQ-107 Name leeren', () => {
  it('[REQ-107/AK-3] Feld leeren und sichern: kein Name, Startseite zeigt nur „Hallo“, auch nach Neustart', async () => {
    await starte();
    await nameSichern('Christine');
    await nameSichern('');
    expect((await zeilenText()).replace(/\s/g, '')).toBe('Name›');
    expect(await gruss()).toBe('Hallo');
    await neustart();
    expect(await gruss()).toBe('Hallo');
    expect((await zeilenText()).replace(/\s/g, '')).toBe('Name›');
  });

  it('[REQ-107/AK-3] nur Leerzeichen sichern entfernt den Namen ebenfalls', async () => {
    await starte();
    await nameSichern('Christine');
    await nameSichern('    ');
    expect((await zeilenText()).replace(/\s/g, '')).toBe('Name›');
    expect(await gruss()).toBe('Hallo');
    const { feld } = await blattOeffnen();
    expect(feld.value).toBe('');
  });
});

describe('REQ-107 Schließen ohne Sichern', () => {
  it('[REQ-107/AK-4] geänderter Name, Blatt über „Schließen“ verlassen: Name bleibt „Christine“, auch nach Neustart', async () => {
    await starte();
    await nameSichern('Christine');
    const { d, feld } = await blattOeffnen();
    await eingeben(feld, 'Chris');
    await tippe(within(d).getByRole('button', { name: 'Schließen' }));
    await warte(60);
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(await zeilenText()).toMatch(/^Name\s*Christine\s*›$/);
    expect(await gruss()).toBe('Hallo, Christine');
    await neustart();
    expect(await gruss()).toBe('Hallo, Christine');
  });

  it('[REQ-107/AK-4] ohne Namen: Eintrag ohne „Sichern“ verworfen, es bleibt kein Name; Blatt beim erneuten Öffnen leer', async () => {
    await starte();
    const { d, feld } = await blattOeffnen();
    await eingeben(feld, 'Christine');
    await tippe(within(d).getByRole('button', { name: 'Schließen' }));
    await warte(60);
    expect((await zeilenText()).replace(/\s/g, '')).toBe('Name›');
    const neu = await blattOeffnen();
    expect(neu.feld.value).toBe('');
    await tippe(within(neu.d).getByRole('button', { name: 'Schließen' }));
    expect(await gruss()).toBe('Hallo');
  });
});
