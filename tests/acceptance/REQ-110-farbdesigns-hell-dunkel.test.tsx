/**
 * Akzeptanztests REQ-110 – Fenster „Design“: Farbdesigns nach Pillen „Hell“ und „Dunkel“ getrennt.
 * Abgeleitet aus dem REQ-Text. Pillen werden über Rolle und Text gefunden („Hell“, „Dunkel“),
 * aktiv = aria-selected/aria-pressed/aria-checked „true“. Farbdesign-Zeilen: button[data-farbdesign] (REQ-068).
 */
import '@testing-library/jest-dom/vitest';
import { act, cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import App from '@/App';
import { InMemoryEinstellungRepository, type EinstellungRepository, type EinstellungSchluessel } from '@/storage';
import { farbdesigns, farbVariablen } from '@/theme';

vi.mock('@/buecher/demodaten', () => ({ demoBuecher: [] }));
beforeEach(() => localStorage.clear());
afterEach(async () => {
  cleanup();
  localStorage.clear();
  await new Promise((r) => setTimeout(r, 50));
});

const W = { timeout: 3000 };
const HELL = ['klassisch', 'salbei', 'raureif', 'minztraube'];
const DUNKEL = ['nachtlektuere', 'polarnacht', 'traubennacht'];
const nav = () => screen.getByRole('navigation', { name: 'Hauptnavigation' });
const wurzel = () => document.querySelector<HTMLElement>('[data-app-wurzel]')!;
const fenster = () => screen.queryByRole('dialog', { name: 'Design' });
const cs = (e: Element) => getComputedStyle(e);
async function tippe(el: Element) {
  await act(async () => {
    fireEvent.click(el);
    await new Promise((r) => setTimeout(r, 15));
  });
}
function sichtbar(e: Element | null): boolean {
  for (let n: Element | null = e; n; n = n.parentElement) {
    if (n.hasAttribute('hidden') || n.getAttribute('aria-hidden') === 'true') return false;
    const st = getComputedStyle(n);
    if (st.display === 'none' || st.visibility === 'hidden') return false;
  }
  return true;
}
/** Sichtbare Elemente im Fenster mit genau diesem Namen, über die üblichen Rollen einer Umschaltpille. */
function pillenMitName(name: string) {
  const f = fenster()!;
  return (['tab', 'radio', 'button'] as const).flatMap((r) => within(f).queryAllByRole(r, { name }).filter(sichtbar));
}
function pille(name: 'Hell' | 'Dunkel') {
  const t = pillenMitName(name);
  expect(t, `Pille „${name}“`).toHaveLength(1);
  return t[0];
}
const istAktiv = (e: Element) => ['aria-selected', 'aria-pressed', 'aria-checked'].some((a) => e.getAttribute(a) === 'true');
const aktivePille = () => (['Hell', 'Dunkel'] as const).filter((n) => istAktiv(pille(n)));
const zeilen = () => Array.from(fenster()!.querySelectorAll<HTMLElement>('button[data-farbdesign]')).filter(sichtbar);
const ids = () => zeilen().map((z) => z.getAttribute('data-farbdesign'));
const zeile = (id: string) => zeilen().find((z) => z.getAttribute('data-farbdesign') === id)!;
const hatHaken = (id: string) => zeile(id).querySelector('[data-haken]') !== null && zeile(id).querySelector('[data-kreis]') === null;
const hatKreis = (id: string) => zeile(id).querySelector('[data-kreis]') !== null && zeile(id).querySelector('[data-haken]') === null;
const reiter = (id: 'farben' | 'schriftart' | 'stil') => fenster()!.querySelector<HTMLElement>(`[data-design-reiter="${id}"]`)!;

async function starte(werte: Partial<Record<EinstellungSchluessel, string>> = {}, repo: EinstellungRepository = new InMemoryEinstellungRepository()) {
  for (const [k, v] of Object.entries(werte)) await repo.speichern(k as EinstellungSchluessel, v!);
  render(<App einstellungRepository={repo} />);
  await screen.findByRole('navigation', { name: 'Hauptnavigation' }, W);
  if (werte.farbdesign) await vi.waitFor(() => expect(wurzel()).toHaveAttribute('data-farbdesign', werte.farbdesign), W);
  if (werte.stil) await vi.waitFor(() => expect(wurzel()).toHaveAttribute('data-stil', werte.stil), W);
  return repo;
}
async function oeffne() {
  await tippe(within(nav()).getByRole('button', { name: 'Profil' }));
  const z = await vi.waitFor(() => {
    const e = document.querySelector<HTMLElement>('[data-profil-zeile="design"]');
    expect(e).not.toBeNull();
    return e!;
  }, W);
  await tippe(z);
  await screen.findByRole('dialog', { name: 'Design' }, W);
  await vi.waitFor(() => expect(zeilen().length).toBeGreaterThan(0), W);
  return fenster()!;
}
async function schliesse() {
  await tippe(fenster()!.querySelector('[data-design-schliessen]')!);
  await vi.waitFor(() => expect(fenster()).toBeNull(), W);
}
function farbe(ausdruck: string) {
  const p = document.createElement('span');
  p.style.setProperty('color', ausdruck);
  wurzel().appendChild(p);
  const w = cs(p).color;
  p.remove();
  return w;
}

describe('REQ-110 Pillen „Hell“ / „Dunkel“', () => {
  it('[REQ-110/AK-1] unter der Umschaltpille: „Hell“ vor „Dunkel“, genau eine aktiv, darunter nur deren Designs', async () => {
    await starte();
    const f = await oeffne();
    const h = pille('Hell');
    const d = pille('Dunkel');
    expect(h.compareDocumentPosition(d) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(reiter('farben').compareDocumentPosition(h) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(d.compareDocumentPosition(zeilen()[0]) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(aktivePille()).toHaveLength(1);
    expect(ids()).toEqual(aktivePille()[0] === 'Hell' ? HELL : DUNKEL);
    expect(f).toBeTruthy();
  });

  it('[REQ-110/AK-1] nach jedem Pillenwechsel ist genau eine Pille aktiv', async () => {
    await starte();
    await oeffne();
    for (const n of ['Dunkel', 'Hell', 'Dunkel', 'Dunkel', 'Hell'] as const) {
      await tippe(pille(n));
      expect(aktivePille()).toEqual([n]);
    }
  });

  it.each(['schriftart', 'stil'] as const)('[REQ-110/AK-1] bei „%s“ sind die Pillen „Hell“ / „Dunkel“ nicht zu sehen', async (r) => {
    await starte();
    await oeffne();
    await tippe(reiter(r));
    expect(pillenMitName('Hell')).toHaveLength(0);
    expect(pillenMitName('Dunkel')).toHaveLength(0);
    expect(zeilen()).toHaveLength(0);
    await tippe(reiter('farben'));
    expect(pillenMitName('Hell')).toHaveLength(1);
    expect(pillenMitName('Dunkel')).toHaveLength(1);
  });

  it('[REQ-110/AK-2] „Hell“ dann „Dunkel“: genau die hellen bzw. genau die dunklen Designs (Name sichtbar)', async () => {
    await starte();
    await oeffne();
    await tippe(pille('Hell'));
    expect(ids()).toEqual(HELL);
    expect(zeilen().map((z) => z.textContent)).toEqual(['Klassisch', 'Salbei', 'Raureif', 'Minztraube'].map((n) => expect.stringContaining(n)));
    await tippe(pille('Dunkel'));
    expect(ids()).toEqual(DUNKEL);
    expect(zeilen().map((z) => z.textContent)).toEqual(['Nachtlektüre', 'Polarnacht', 'Traubennacht'].map((n) => expect.stringContaining(n)));
    // kein Design doppelt oder in der falschen Gruppe
    for (const id of HELL) expect(ids()).not.toContain(id);
  });

  it.each([
    ['polarnacht', 'Dunkel'],
    ['nachtlektuere', 'Dunkel'],
    ['traubennacht', 'Dunkel'],
    ['salbei', 'Hell'],
    ['raureif', 'Hell'],
    ['minztraube', 'Hell'],
  ] as const)('[REQ-110/AK-3] aktives Design „%s“: beim Öffnen ist „%s“ aktiv und das Design trägt das Häkchen', async (id, p) => {
    await starte({ farbdesign: id });
    await oeffne();
    expect(aktivePille()).toEqual([p]);
    expect(hatHaken(id)).toBe(true);
    for (const andere of ids().filter((x) => x !== id)) expect(hatKreis(andere!), andere!).toBe(true);
  });

  it('[REQ-110/AK-3] nie gewählt: beim Öffnen „Hell“ aktiv, „Klassisch“ mit Häkchen', async () => {
    await starte();
    await oeffne();
    expect(aktivePille()).toEqual(['Hell']);
    expect(hatHaken('klassisch')).toBe(true);
  });

  it('[REQ-110/AK-3] Pillenwahl wird nicht gespeichert: nach Schließen/Wiederöffnen und nach Zurück auf „Farben“ gilt wieder die Pille des aktiven Designs', async () => {
    await starte({ farbdesign: 'polarnacht' });
    await oeffne();
    await tippe(pille('Hell'));
    expect(aktivePille()).toEqual(['Hell']);
    await tippe(reiter('schriftart'));
    await tippe(reiter('farben'));
    expect(aktivePille()).toEqual(['Dunkel']);
    expect(hatHaken('polarnacht')).toBe(true);
    await tippe(pille('Hell'));
    await schliesse();
    await oeffne();
    expect(aktivePille()).toEqual(['Dunkel']);
    expect(hatHaken('polarnacht')).toBe(true);
  });

  it('[REQ-110/AK-3] nach Wahl eines dunklen Designs zeigt erneutes Öffnen „Dunkel“', async () => {
    await starte();
    await oeffne();
    await tippe(pille('Dunkel'));
    await tippe(zeile('traubennacht'));
    await schliesse();
    await oeffne();
    expect(aktivePille()).toEqual(['Dunkel']);
    expect(hatHaken('traubennacht')).toBe(true);
  });

  it('[REQ-110/AK-4] „Klassisch“ aktiv, „Dunkel“ antippen: dunkle Designs alle mit leerem Kreis, App bleibt „Klassisch“, nichts gespeichert, auch nach Neustart', async () => {
    const repo = new InMemoryEinstellungRepository();
    const spion = vi.spyOn(repo, 'speichern');
    await starte({}, repo);
    await oeffne();
    expect(aktivePille()).toEqual(['Hell']);
    await tippe(pille('Dunkel'));
    expect(ids()).toEqual(DUNKEL);
    for (const id of DUNKEL) {
      expect(hatKreis(id), id).toBe(true);
      expect(zeile(id)).not.toHaveAttribute('aria-checked', 'true');
    }
    expect(wurzel()).toHaveAttribute('data-farbdesign', 'klassisch');
    for (const [n, w] of Object.entries(farbVariablen('klassisch'))) expect(wurzel().style.getPropertyValue(n), n).toBe(w);
    await tippe(pille('Hell'));
    await tippe(pille('Dunkel'));
    expect(spion).not.toHaveBeenCalled();
    expect(await repo.lesen('farbdesign')).toBeUndefined();
    cleanup();
    await starte({}, repo);
    await vi.waitFor(() => expect(wurzel()).toHaveAttribute('data-farbdesign', 'klassisch'), W);
  });

  it('[REQ-110/AK-4] Variante: „Polarnacht“ aktiv, „Hell“ antippen: alle hellen mit leerem Kreis, „Polarnacht“ bleibt gespeichert und aktiv', async () => {
    const repo = await starte({ farbdesign: 'polarnacht' });
    await oeffne();
    await tippe(pille('Hell'));
    for (const id of HELL) expect(hatKreis(id), id).toBe(true);
    expect(wurzel()).toHaveAttribute('data-farbdesign', 'polarnacht');
    expect(await repo.lesen('farbdesign')).toBe('polarnacht');
  });

  it('[REQ-110/AK-5] „Klassisch“ aktiv, „Dunkel“ gewählt, „Traubennacht“ antippen: sofort angewendet, Häkchen, gespeichert; unter „Hell“ trägt „Klassisch“ leeren Kreis', async () => {
    const repo = await starte();
    await oeffne();
    await tippe(pille('Dunkel'));
    await tippe(zeile('traubennacht'));
    expect(wurzel()).toHaveAttribute('data-farbdesign', 'traubennacht');
    expect(wurzel().style.getPropertyValue('--bz-farbe-hintergrund')).toBe(farbdesigns.traubennacht.werte.hintergrund);
    expect(wurzel().style.getPropertyValue('--bz-farbe-primaer')).toBe(farbdesigns.traubennacht.werte.primaer);
    expect(hatHaken('traubennacht')).toBe(true);
    expect(hatKreis('nachtlektuere')).toBe(true);
    expect(aktivePille()).toEqual(['Dunkel']);
    expect(await repo.lesen('farbdesign')).toBe('traubennacht');
    await tippe(pille('Hell'));
    for (const id of HELL) expect(hatKreis(id), id).toBe(true);
    cleanup();
    await starte({}, repo);
    await vi.waitFor(() => expect(wurzel()).toHaveAttribute('data-farbdesign', 'traubennacht'), W);
  });

  it('[REQ-110/AK-5] Variante: von „Traubennacht“ zurück auf „Hell“ › „Minztraube“', async () => {
    const repo = await starte({ farbdesign: 'traubennacht' });
    await oeffne();
    await tippe(pille('Hell'));
    await tippe(zeile('minztraube'));
    expect(wurzel()).toHaveAttribute('data-farbdesign', 'minztraube');
    expect(hatHaken('minztraube')).toBe(true);
    expect(await repo.lesen('farbdesign')).toBe('minztraube');
    await tippe(pille('Dunkel'));
    for (const id of DUNKEL) expect(hatKreis(id), id).toBe(true);
  });

  // ---- AK-6 Aussehen nach Stil ----
  const EIG = ['color', 'backgroundColor', 'fontSize', 'fontWeight', 'fontFamily', 'height', 'minHeight', 'borderRadius', 'boxShadow', 'textDecorationLine', 'borderBottomStyle', 'borderBottomWidth'] as const;
  const stilVon = (e: Element) => Object.fromEntries(EIG.map((k) => [k, cs(e)[k]]));
  const keineFlaeche = (e: Element) => ['transparent', 'rgba(0, 0, 0, 0)'].includes(cs(e).backgroundColor);
  /** Unterstrich: Rahmen unten, innenliegender Schatten unten oder text-decoration underline. */
  function hatUnterstrich(e: Element, f: string) {
    const s = cs(e);
    if (s.borderBottomStyle === 'solid' && (parseFloat(s.borderBottomWidth) || 0) > 0 && s.borderBottomColor === f) return true;
    if (/underline/.test(s.textDecorationLine || s.textDecoration)) return true;
    return (s.boxShadow ?? '').split(/,(?![^(]*\))/).some((sh) => /inset/.test(sh) && /-\d/.test(sh) && farbe(sh.replace(/inset|-?\d*\.?\d+px|\b0\b/g, '').trim()) === f);
  }

  it.each(['klassisch', 'feuilleton'] as const)('[REQ-110/AK-6] Stil „%s“: aktive/inaktive Pille „Hell“/„Dunkel“ sieht aus wie aktive/inaktive Umschaltpille', async (stil) => {
    await starte({ stil });
    await oeffne();
    expect(aktivePille()).toEqual(['Hell']);
    expect(stilVon(pille('Hell'))).toEqual(stilVon(reiter('farben')));
    expect(stilVon(pille('Dunkel'))).toEqual(stilVon(reiter('schriftart')));
    await tippe(pille('Dunkel'));
    expect(stilVon(pille('Dunkel'))).toEqual(stilVon(reiter('farben')));
    expect(stilVon(pille('Hell'))).toEqual(stilVon(reiter('schriftart')));
  });

  it('[REQ-110/AK-6] Feuilleton: reiner Text ohne Pillenfläche, inaktiv Tertiär, aktiv Primär mit Unterstrich – auch nach Wechsel', async () => {
    await starte({ stil: 'feuilleton' });
    await oeffne();
    const PRIMAER = farbe('var(--bz-farbe-primaer)');
    const TERTIAER = farbe('var(--bz-farbe-tertiaer)');
    for (const [aktiv, inaktiv] of [['Hell', 'Dunkel'], ['Dunkel', 'Hell']] as const) {
      await tippe(pille(aktiv));
      const a = pille(aktiv);
      const i = pille(inaktiv);
      expect(keineFlaeche(a)).toBe(true);
      expect(keineFlaeche(i)).toBe(true);
      expect(cs(a).color).toBe(PRIMAER);
      expect(cs(i).color).toBe(TERTIAER);
      expect(hatUnterstrich(a, PRIMAER)).toBe(true);
      expect(hatUnterstrich(i, PRIMAER)).toBe(false);
      // keine sichtbare wandernde Pillenfläche in der Leiste
      for (const n of Array.from(a.parentElement!.querySelectorAll('*'))) {
        if (n === a || n === i || a.contains(n) || i.contains(n)) continue;
        if (sichtbar(n)) expect(keineFlaeche(n), `Fläche in der Leiste: ${n.outerHTML.slice(0, 80)}`).toBe(true);
      }
    }
  });

  it('[REQ-110/AK-6] Klassisch: aktive Pille unterscheidbar von der inaktiven', async () => {
    await starte();
    await oeffne();
    const a = stilVon(pille('Hell'));
    const i = stilVon(pille('Dunkel'));
    expect(a).not.toEqual(i);
  });

  it.each(['klassisch', 'feuilleton'] as const)('[REQ-110/AK-6] Tippfläche, Stil „%s“: Pillen sind Schaltflächen mit erweiterter Tippfläche (≥ 44 px, REQ-065), gleich hoch wie die Umschaltpille', async (stil) => {
    await starte({ stil });
    await oeffne();
    for (const n of ['Hell', 'Dunkel'] as const) {
      const p = pille(n);
      expect(p.tagName === 'BUTTON' || p.hasAttribute('data-tippflaeche'), n).toBe(true);
      expect(cs(p).height).toBe(cs(reiter('schriftart')).height);
      expect(cs(p).minHeight).toBe(cs(reiter('schriftart')).minHeight);
    }
  });
});
