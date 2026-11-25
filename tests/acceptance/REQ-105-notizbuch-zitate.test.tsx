/**
 * Akzeptanztests REQ-105 – Reiter „Notizbuch“: Abschnitt „Zitate“ mit Anlegen, Ändern und Löschen über ein Blatt.
 * Abgeleitet aus dem REQ-Text (Stand 2026-11-24 inkl. AK-9/AK-10). Rollen und Texte:
 *  - Reiter: role="tab" „Notizbuch“ (REQ-043), Bereich [data-reiter-bereich="notizbuch"].
 *  - Hinzufügen: Schaltfläche „+ Zitat hinzufügen“ bzw. „+“ (Name „+“ oder „… Zitat hinzufügen“).
 *  - Blatt: role="dialog", Felder mit Namen „Zitat“ (textarea), „Wer sagt es?“, „Seite“, Schaltflächen „Sichern“,
 *    „Schließen“, „Zitat löschen“; Rückfrage mit „Abbrechen“ und „Löschen“. Fehler: aria-invalid="true" + Primär.
 *  - „Neustart“: Module neu laden, Buchdetails mit den Standard-Repositories auf derselben IndexedDB.
 */
import '@testing-library/jest-dom/vitest';
import { act, cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { IDBFactory, IDBKeyRange } from 'fake-indexeddb';
import type { ComponentType, CSSProperties } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { Buch } from '@/domain/buch';
import type { ImageStore } from '@/storage';
import { farbrubriken, farbVariablen } from '@/theme';

vi.mock('@/buecher/demodaten', () => ({ demoBuecher: [] }));
beforeEach(() => {
  vi.stubGlobal('indexedDB', new IDBFactory());
  vi.stubGlobal('IDBKeyRange', IDBKeyRange);
  localStorage.clear();
});
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  localStorage.clear();
});

type Komp = ComponentType<Record<string, unknown>>;
const W = { timeout: 4000 };
const bilder = { get: async () => undefined, put: async () => {}, remove: async () => {} } as unknown as ImageStore;
const quelle = { scannen: async () => null, galerie: async () => null };
const norm = (t: string | null | undefined) => (t ?? '').replace(/[\s  ]+/g, ' ').trim();
const ohneLeer = (t: string | null | undefined) => (t ?? '').replace(/[\s  ]+/g, '');
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
const Q1 = 'Ich bin nicht das Feuer.';
const buch = (f: Partial<Buch> = {}): Buch => ({ id: crypto.randomUUID(), titel: 'Fourth Wing', status: 'am_lesen', ...f });

/** Startet (bzw. startet neu) und zeigt die Buchdetails mit aktivem Reiter „Notizbuch“. */
async function zeige(id: string, vorher?: Buch) {
  cleanup();
  vi.resetModules();
  const st = (await import('@/storage')) as typeof import('@/storage');
  if (vorher) await st.createBookRepository().save(vorher);
  const BD = (await import('@/views/BuchDetails')).default as unknown as Komp;
  render(
    <div data-testwurzel="" style={farbVariablen() as CSSProperties}>
      <BD buchId={id} bildspeicher={bilder} bildquelle={quelle} onZurueck={() => {}} />
    </div>,
  );
  const d = await screen.findByRole('region', { name: 'Buchdetails' }, W);
  await tippe(await within(d).findByRole('tab', { name: 'Notizbuch' }, W));
  await vi.waitFor(() => expect(within(bereich()).getByText('Zitate')).toBeInTheDocument(), W);
  await warte(60);
  return d;
}
async function neu(b: Buch = buch()) {
  await zeige(b.id, b);
  return b;
}
const bereich = () => document.querySelector<HTMLElement>('[data-reiter-bereich="notizbuch"]')!;
/** Gestrichelte Pille: Schaltfläche mit sichtbarem Text „+ Zitat hinzufügen“ (nicht das „+“ allein). */
const pille = () => within(bereich()).queryAllByRole('button').find((b) => /^\+?\s*Zitat hinzufügen$/.test(norm(b.textContent))) ?? null;
const plus = () => within(bereich()).getAllByRole('button', { name: /^\+$|Zitat hinzufügen/ })[0];
const blatt = () => screen.getByRole('dialog');
const feld = (name: string) => within(blatt()).getByLabelText(name) as HTMLInputElement | HTMLTextAreaElement;
async function oeffneNeu() {
  await tippe(plus());
  return screen.findByRole('dialog', {}, W);
}
async function ausfuellen(text: string, wer?: string, seite?: string) {
  await eingeben(feld('Zitat'), text);
  if (wer !== undefined) await eingeben(feld('Wer sagt es?'), wer);
  if (seite !== undefined) await eingeben(feld('Seite'), seite);
}
async function sichern() {
  await tippe(within(blatt()).getByRole('button', { name: 'Sichern' }));
  await warte(80);
}
async function anlegen(text: string, wer?: string, seite?: string) {
  await oeffneNeu();
  await ausfuellen(text, wer, seite);
  await sichern();
  expect(screen.queryByRole('dialog'), `Blatt nach Sichern von „${text}“ geschlossen`).toBeNull();
}
async function oeffneZitat(text: string) {
  const el = within(bereich()).getByText(text, { exact: false });
  await tippe(el);
  return screen.findByRole('dialog', {}, W);
}
const btext = () => ohneLeer(bereich().textContent);
function inPrimaer(el: HTMLElement) {
  const p = document.createElement('span');
  p.style.setProperty('color', farbrubriken.primaer.wert);
  document.querySelector('[data-testwurzel]')!.appendChild(p);
  const primaer = getComputedStyle(p).color;
  p.remove();
  const cs = getComputedStyle(el);
  return [cs.color, cs.borderTopColor, cs.outlineColor, cs.boxShadow, el.getAttribute('style') ?? ''].some(
    (w) => w.includes(primaer) || w.includes('var(--bz-farbe-primaer)'),
  );
}

describe('REQ-105 Ohne Zitate', () => {
  it('[REQ-105/AK-1] Reiter „Notizbuch“: Überschrift „Zitate“, gestrichelte Pille „+ Zitat hinzufügen“, kein „under construction :)“', async () => {
    await neu();
    expect(bereich().textContent).not.toContain('under construction');
    const p = pille();
    expect(p).not.toBeNull();
    const gestrichelt = [p!, ...Array.from(p!.querySelectorAll<HTMLElement>('*'))].some(
      (e) => (e.getAttribute('style') ?? '').includes('dashed') || getComputedStyle(e).borderTopStyle === 'dashed',
    );
    expect(gestrichelt, 'gestrichelter Rand').toBe(true);
    const ueber = within(bereich()).getByText('Zitate');
    expect(ueber.compareDocumentPosition(p!) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it('[REQ-105/AK-1] „Figuren & Orte“ zeigt weiterhin „under construction :)“', async () => {
    await neu();
    await tippe(within(screen.getByRole('region', { name: 'Buchdetails' })).getByRole('tab', { name: 'Figuren & Orte' }));
    expect(document.querySelector('[data-reiter-bereich="figuren"]')?.textContent).toContain('under construction :)');
  });
});

describe('REQ-105 Zitat anlegen', () => {
  it('[REQ-105/AK-2] „Ich bin nicht das Feuer.“, „Violet“, 312 sichern: Zitat mit „Violet“ und „S. 312“, auch nach Neustart', async () => {
    const b = await neu();
    await tippe(pille());
    const d = await screen.findByRole('dialog', {}, W);
    expect(feld('Zitat').tagName).toBe('TEXTAREA');
    expect(within(d).getByRole('button', { name: 'Sichern' })).toBeInTheDocument();
    expect(within(d).queryByRole('button', { name: 'Zitat löschen' })).toBeNull();
    await ausfuellen(Q1, 'Violet', '312');
    await sichern();
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(btext()).toContain(ohneLeer(`${Q1}VioletS. 312`));
    expect(pille()).toBeNull();
    await zeige(b.id);
    expect(btext()).toContain(ohneLeer(Q1));
    expect(btext()).toContain('Violet');
    expect(btext()).toContain('S.312');
  });

  it('[REQ-105/AK-2] mehrzeiliger und sehr langer Text (5000 Zeichen) wird vollständig gespeichert und angezeigt', async () => {
    const b = await neu();
    const lang = `Erste Zeile\nZweite Zeile ${'x'.repeat(5000)} Ende.`;
    await anlegen(lang);
    expect(bereich().textContent).toContain('Ende.');
    expect(bereich().textContent).toContain('x'.repeat(5000));
    await zeige(b.id);
    const d = await oeffneZitat('Erste Zeile');
    expect(within(d).getByLabelText('Zitat')).toHaveValue(lang);
  });

  it('[REQ-105/AK-2] Zitate gehören zum Buch: ein anderes Buch zeigt sie nicht', async () => {
    const a = await neu();
    await anlegen(Q1, 'Violet', '312');
    const b = buch({ titel: 'Iron Flame' });
    await zeige(b.id, b);
    expect(bereich().textContent).not.toContain(Q1);
    expect(pille()).not.toBeNull();
    await zeige(a.id);
    expect(bereich().textContent).toContain(Q1);
  });
});

describe('REQ-105 Zitat ist Pflicht', () => {
  it.each([
    ['leer', ''],
    ['nur Leerzeichen', '    '],
    ['nur Zeilenumbrüche', '\n \n'],
  ])('[REQ-105/AK-3] Zitat %s: Feld in Primär hervorgehoben, kein Hinweistext, Blatt offen, nichts gespeichert', async (_n, wert) => {
    const b = await neu();
    const d = await oeffneNeu();
    await ausfuellen(wert, 'Violet', '312');
    const vorher = norm(d.textContent);
    await sichern();
    expect(screen.getByRole('dialog')).toBe(d);
    const f = feld('Zitat');
    expect(f).toHaveAttribute('aria-invalid', 'true');
    expect(inPrimaer(f)).toBe(true);
    expect(norm(d.textContent)).toBe(vorher);
    expect(within(d).queryByRole('alert')).toBeNull();
    expect(feld('Wer sagt es?')).not.toHaveAttribute('aria-invalid', 'true');
    // Hervorhebung verschwindet, sobald der Nutzer im Feld etwas ändert
    await eingeben(f, 'a');
    expect(feld('Zitat')).not.toHaveAttribute('aria-invalid', 'true');
    await tippe(within(d).getByRole('button', { name: 'Schließen' }));
    expect(pille()).not.toBeNull();
    await zeige(b.id);
    expect(pille()).not.toBeNull();
    expect(bereich().textContent).not.toContain('Violet');
  });

  it.each(['0', '-5', '1,5', 'abc'])('[REQ-105/AK-3] ungültige Seite „%s“: Feld „Seite“ hervorgehoben bzw. gefiltert, nichts Ungültiges gespeichert', async (wert) => {
    const b = await neu();
    const d = await oeffneNeu();
    await ausfuellen(Q1, undefined, wert);
    const f = feld('Seite');
    if (f.value === wert) {
      await sichern();
      expect(screen.getByRole('dialog')).toBe(d);
      expect(f).toHaveAttribute('aria-invalid', 'true');
      expect(inPrimaer(f)).toBe(true);
      expect(feld('Zitat')).not.toHaveAttribute('aria-invalid', 'true');
      await tippe(within(d).getByRole('button', { name: 'Schließen' }));
      await zeige(b.id);
      expect(pille()).not.toBeNull();
    } else {
      expect(f.value).toMatch(/^[1-9]\d*$|^$/);
    }
  });

  it('[REQ-105/AK-3] Seite 1 ist gültig (kleinster Wert)', async () => {
    await neu();
    await anlegen(Q1, undefined, '1');
    expect(btext()).toContain('S.1');
  });
});

describe('REQ-105 Platzhalter', () => {
  it('[REQ-105/AK-9] leere Felder zeigen „Was soll bleiben?“, „Xaden“, „214“ als Platzhalter, nicht als Wert', async () => {
    await neu();
    await oeffneNeu();
    expect(feld('Zitat')).toHaveAttribute('placeholder', 'Was soll bleiben?');
    expect(feld('Wer sagt es?')).toHaveAttribute('placeholder', 'Xaden');
    expect(feld('Seite')).toHaveAttribute('placeholder', '214');
    expect(feld('Zitat')).toHaveValue('');
    expect(feld('Wer sagt es?')).toHaveValue('');
    expect((feld('Seite') as HTMLInputElement).value).toBe('');
  });

  it('[REQ-105/AK-9] nur Zitattext sichern: weder „Xaden“ noch 214 gespeichert, auch nach Neustart', async () => {
    const b = await neu();
    await anlegen(Q1);
    expect(bereich().textContent).not.toContain('Xaden');
    expect(bereich().textContent).not.toContain('214');
    await zeige(b.id);
    expect(bereich().textContent).not.toMatch(/Xaden|214/);
    await oeffneZitat(Q1);
    expect(feld('Wer sagt es?')).toHaveValue('');
    expect((feld('Seite') as HTMLInputElement).value).toBe('');
  });
});

describe('REQ-105 Anzeige je nach Angaben', () => {
  it('[REQ-105/AK-10] mit Sprecher ohne Seite: nur zusätzlich „Violet“; ohne beides: nur der Text', async () => {
    await neu();
    await anlegen('Erstes Zitat.', 'Violet');
    await anlegen('Zweites Zitat.');
    const t = btext();
    expect(t).toContain(ohneLeer('Erstes Zitat.Violet'));
    expect(t).not.toMatch(/S\.\d/);
    expect(t).not.toContain('Seite');
    expect(t.split('Violet')).toHaveLength(2);
    const nachZwei = t.slice(t.indexOf(ohneLeer('Zweites Zitat.')) + ohneLeer('Zweites Zitat.').length);
    expect(nachZwei).not.toMatch(/Violet|Xaden|S\./);
  });

  it('[REQ-105/AK-10] ohne Sprecher mit Seite: nur „S. 15“, kein Sprecher', async () => {
    await neu();
    await anlegen('Nur Seite.', undefined, '15');
    const t = btext();
    expect(t).toContain(ohneLeer('Nur Seite.S. 15'));
    expect(t).not.toMatch(/Xaden|undefined|null/);
  });
});

describe('REQ-105 Nur Zitat genügt', () => {
  it('[REQ-105/AK-4] nur „Zitat“ ausgefüllt: gespeichert ohne Sprecher und Seite (auch nach Neustart)', async () => {
    const b = await neu();
    await anlegen(Q1);
    expect(btext()).toContain(ohneLeer(Q1));
    expect(btext()).not.toMatch(/S\.\d/);
    await zeige(b.id);
    await oeffneZitat(Q1);
    expect(feld('Zitat')).toHaveValue(Q1);
    expect(feld('Wer sagt es?')).toHaveValue('');
    expect((feld('Seite') as HTMLInputElement).value).toBe('');
  });
});

describe('REQ-105 Sortierung', () => {
  it('[REQ-105/AK-5] angelegt S. 200, ohne Seite, S. 15: Reihenfolge S. 15, S. 200, ohne Seite (auch nach Neustart)', async () => {
    const b = await neu();
    await anlegen('Zitat zweihundert.', undefined, '200');
    await anlegen('Zitat ohne Seite.');
    await anlegen('Zitat fünfzehn.', undefined, '15');
    const reihe = () => ['Zitat fünfzehn.', 'Zitat zweihundert.', 'Zitat ohne Seite.'].map((q) => btext().indexOf(ohneLeer(q)));
    let r = reihe();
    expect(r.every((i) => i >= 0)).toBe(true);
    expect([...r].sort((a, c) => a - c)).toEqual(r);
    await zeige(b.id);
    r = reihe();
    expect([...r].sort((a, c) => a - c)).toEqual(r);
  });

  it('[REQ-105/AK-5] numerisch, nicht als Text: S. 9 vor S. 10 vor S. 100', async () => {
    await neu();
    await anlegen('Hundert.', undefined, '100');
    await anlegen('Zehn.', undefined, '10');
    await anlegen('Neun.', undefined, '9');
    const r = ['Neun.', 'Zehn.', 'Hundert.'].map((q) => btext().indexOf(q));
    expect(r.every((i) => i >= 0)).toBe(true);
    expect([...r].sort((a, c) => a - c)).toEqual(r);
  });

  it('[REQ-105/AK-5] gleiche Seite bzw. ohne Seite: Reihenfolge des Anlegens', async () => {
    await neu();
    await anlegen('Ohne A.');
    await anlegen('Fünfzig B.', undefined, '50');
    await anlegen('Ohne C.');
    await anlegen('Fünfzig D.', undefined, '50');
    const r = ['Fünfzig B.', 'Fünfzig D.', 'Ohne A.', 'Ohne C.'].map((q) => btext().indexOf(ohneLeer(q)));
    expect(r.every((i) => i >= 0)).toBe(true);
    expect([...r].sort((a, c) => a - c)).toEqual(r);
  });

  it('[REQ-105/AK-5] Ändern der Seite sortiert neu ein', async () => {
    await neu();
    await anlegen('Früh.', undefined, '10');
    await anlegen('Spät.', undefined, '20');
    await oeffneZitat('Früh.');
    await eingeben(feld('Seite'), '30');
    await sichern();
    expect(btext().indexOf('Spät.')).toBeLessThan(btext().indexOf('Früh.'));
  });
});

describe('REQ-105 Ändern und Leeren', () => {
  it('[REQ-105/AK-6] „Violet“/S. 312 öffnen (vorbefüllt), Sprecher leeren, Seite 313: kein Sprecher, „S. 313“, auch nach Neustart', async () => {
    const b = await neu();
    await anlegen(Q1, 'Violet', '312');
    const d = await oeffneZitat(Q1);
    expect(feld('Zitat')).toHaveValue(Q1);
    expect(feld('Wer sagt es?')).toHaveValue('Violet');
    expect((feld('Seite') as HTMLInputElement).value).toBe('312');
    expect(within(d).getByRole('button', { name: 'Zitat löschen' })).toBeInTheDocument();
    const sichernKnopf = within(d).getByRole('button', { name: 'Sichern' });
    expect(sichernKnopf.compareDocumentPosition(within(d).getByRole('button', { name: 'Zitat löschen' })) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    await eingeben(feld('Wer sagt es?'), '');
    await eingeben(feld('Seite'), '313');
    await sichern();
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(btext()).not.toContain('Violet');
    expect(btext()).toContain('S.313');
    expect(btext()).not.toContain('S.312');
    expect(btext().split(ohneLeer(Q1))).toHaveLength(2);
    await zeige(b.id);
    expect(btext()).not.toContain('Violet');
    expect(btext()).toContain('S.313');
  });

  it('[REQ-105/AK-6] Seite leeren (REQ-093) und Text ändern: Zitat ohne Seite, neuer Text, kein Duplikat', async () => {
    const b = await neu();
    await anlegen(Q1, 'Violet', '312');
    await oeffneZitat(Q1);
    await eingeben(feld('Zitat'), 'Neuer Text.');
    await eingeben(feld('Seite'), '');
    await sichern();
    expect(btext()).toContain(ohneLeer('Neuer Text.Violet'));
    expect(btext()).not.toContain(ohneLeer(Q1));
    expect(btext()).not.toMatch(/S\.\d/);
    await zeige(b.id);
    expect(btext()).toContain(ohneLeer('Neuer Text.'));
    expect(btext()).not.toContain(ohneLeer(Q1));
  });

  it('[REQ-105/AK-6] beim Ändern leerer Zitattext: hervorgehoben, altes Zitat bleibt', async () => {
    await neu();
    await anlegen(Q1, 'Violet', '312');
    await oeffneZitat(Q1);
    await eingeben(feld('Zitat'), '  ');
    await sichern();
    expect(feld('Zitat')).toHaveAttribute('aria-invalid', 'true');
    await tippe(within(blatt()).getByRole('button', { name: 'Schließen' }));
    expect(btext()).toContain(ohneLeer(`${Q1}Violet`));
  });
});

describe('REQ-105 Löschen mit Rückfrage', () => {
  async function loeschenAntippen() {
    await tippe(within(blatt()).getByRole('button', { name: 'Zitat löschen' }));
    await vi.waitFor(() => expect(screen.getByRole('button', { name: 'Löschen' })).toBeInTheDocument(), W);
    expect(screen.getByRole('button', { name: 'Abbrechen' })).toBeInTheDocument();
  }

  it('[REQ-105/AK-7] „Zitat löschen“ → „Löschen“: Zitat entfernt, Blatt zu, auch nach Neustart; das einzige → wieder „+ Zitat hinzufügen“', async () => {
    const b = await neu();
    await anlegen(Q1, 'Violet', '312');
    await oeffneZitat(Q1);
    await loeschenAntippen();
    await tippe(screen.getByRole('button', { name: 'Löschen' }));
    await warte(80);
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(bereich().textContent).not.toContain(Q1);
    expect(pille()).not.toBeNull();
    await zeige(b.id);
    expect(bereich().textContent).not.toContain(Q1);
    expect(pille()).not.toBeNull();
  });

  it('[REQ-105/AK-7] „Abbrechen“: Zitat bleibt erhalten und unverändert', async () => {
    const b = await neu();
    await anlegen(Q1, 'Violet', '312');
    await oeffneZitat(Q1);
    await loeschenAntippen();
    await tippe(screen.getByRole('button', { name: 'Abbrechen' }));
    await warte(60);
    expect(screen.queryByRole('button', { name: 'Löschen' })).toBeNull();
    expect(btext()).toContain(ohneLeer(`${Q1}Violet`));
    await zeige(b.id);
    expect(btext()).toContain(ohneLeer(`${Q1}Violet`));
  });

  it('[REQ-105/AK-7] von mehreren Zitaten wird nur das gewählte gelöscht; die Pille erscheint nicht', async () => {
    const b = await neu();
    await anlegen('Bleibt eins.', undefined, '5');
    await anlegen('Weg damit.', undefined, '6');
    await anlegen('Bleibt zwei.', undefined, '7');
    await oeffneZitat('Weg damit.');
    await loeschenAntippen();
    await tippe(screen.getByRole('button', { name: 'Löschen' }));
    await warte(80);
    expect(bereich().textContent).not.toContain('Weg damit.');
    expect(bereich().textContent).toContain('Bleibt eins.');
    expect(bereich().textContent).toContain('Bleibt zwei.');
    expect(pille()).toBeNull();
    await zeige(b.id);
    expect(bereich().textContent).not.toContain('Weg damit.');
    expect(bereich().textContent).toContain('Bleibt zwei.');
  });
});

describe('REQ-105 Schließen ohne Sichern', () => {
  it('[REQ-105/AK-8] neues Zitat eingetragen, Blatt geschlossen: nichts gespeichert (auch nach Neustart)', async () => {
    const b = await neu();
    const d = await oeffneNeu();
    await ausfuellen(Q1, 'Violet', '312');
    await tippe(within(d).getByRole('button', { name: 'Schließen' }));
    await warte(60);
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(bereich().textContent).not.toContain(Q1);
    expect(pille()).not.toBeNull();
    await zeige(b.id);
    expect(pille()).not.toBeNull();
    // erneutes Öffnen startet leer
    await oeffneNeu();
    expect(feld('Zitat')).toHaveValue('');
  });

  it('[REQ-105/AK-8] vorhandenes Zitat geändert, Blatt geschlossen: Zitat unverändert (auch nach Neustart)', async () => {
    const b = await neu();
    await anlegen(Q1, 'Violet', '312');
    const d = await oeffneZitat(Q1);
    await ausfuellen('Geändert.', 'Xaden', '1');
    await tippe(within(d).getByRole('button', { name: 'Schließen' }));
    await warte(60);
    expect(btext()).toContain(ohneLeer(`${Q1}VioletS. 312`));
    expect(bereich().textContent).not.toContain('Geändert.');
    await zeige(b.id);
    expect(btext()).toContain(ohneLeer(`${Q1}VioletS. 312`));
    await oeffneZitat(Q1);
    expect(feld('Wer sagt es?')).toHaveValue('Violet');
  });
});
