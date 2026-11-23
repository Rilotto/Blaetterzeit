/**
 * Akzeptanztests REQ-030 – Blatt „Manueller Eintrag“: Aufbau und Eingabefelder.
 *
 * Abgeleitet aus dem REQ-Text und der Schnittstellen-Absprache (sprints/sprint-04/plan.md, Teil A):
 *  - role="dialog" aria-label="Manueller Eintrag"; <button aria-label="Schließen">; [data-ziehgriff];
 *    <button data-cover-hinzufuegen> „Cover hinzufügen“; Felder per <label> Titel/Autor/Jahr/Seiten mit
 *    Platzhaltern „Buchtitel“, „Autor“, „2024“, „496“; <button> „+ Erscheinungsdatum hinzufügen“; <button> „Hinzufügen“
 *  - Android-Zurück-Taste: im Web/Test per `popstate`-Ereignis (src/plattform/zurueckTaste.ts)
 *  - Herunterziehen am Griff per Pointer-Ereignissen
 * jsdom hat kein Layout und kein ::placeholder: „bildschirmfüllend“, Farbe der Platzhalter und der
 * Trennlinien sowie die Optik prüft der CEO im Prototyp (manuelle Prüfliste).
 */
import '@testing-library/jest-dom/vitest';
import { act, cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import type { CSSProperties } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import BuecherAnsicht from '@/views/BuecherAnsicht';
import type { Bildquelle } from '@/bild/bildquelle';
import type { Buch } from '@/domain/buch';
import type { BookRepository, ImageStore } from '@/storage';
import { farbrubriken, farbVariablen } from '@/theme';

type DirEntry = { name: string; isDirectory(): boolean };
type FsLike = { existsSync(p: URL): boolean; readFileSync(p: URL, enc: 'utf8'): string; readdirSync(p: URL, o: { withFileTypes: true }): DirEntry[] };
const fs = (await import(/* @vite-ignore */ 'node:' + 'fs')) as FsLike;
const { pathToFileURL } = (await import(/* @vite-ignore */ 'node:' + 'url')) as { pathToFileURL(p: string): URL };
const { cwd } = (await import(/* @vite-ignore */ 'node:' + 'process')) as { cwd(): string };
const ROOT = pathToFileURL(`${cwd()}/`);
const ICONS = new URL('src/assets/icons/', ROOT);

const PNG = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAIAAACQd1PeAAAADElEQVR4nGP4z8AAAAMBAQDJ/pLvAAAAAElFTkSuQmCC';
const MOMO: Buch = { id: '30000000-0000-4000-8000-000000000001', titel: 'Momo', status: 'ungelesen' };
const FELDER: [string, string][] = [
  ['Titel', 'Buchtitel'],
  ['Autor', 'Autor'],
  ['Seiten', '496'],
];

function repoFake(start: Buch[] = [MOMO]) {
  const daten = new Map(start.map((b) => [b.id, { ...b }]));
  const r = {
    daten,
    list: vi.fn(async () => [...daten.values()].map((b) => ({ ...b }))),
    get: vi.fn(async (id: string) => (daten.has(id) ? { ...daten.get(id)! } : undefined)),
    save: vi.fn(async (b: Buch) => void daten.set(b.id, { ...b })),
    remove: vi.fn(async (id: string) => void daten.delete(id)),
  };
  return r as typeof r & BookRepository;
}
function speicherFake() {
  const daten = new Map<string, string>();
  const s = {
    daten,
    get: async (id: string, b: string) => daten.get(`${id}|${b}`),
    put: vi.fn(async (id: string, b: string, d: string) => void daten.set(`${id}|${b}`, d)),
    remove: async (id: string, b: string) => void daten.delete(`${id}|${b}`),
  };
  return s as typeof s & ImageStore;
}
async function zeige(repo = repoFake(), s = speicherFake()) {
  const q: Bildquelle = { scannen: async () => PNG, galerie: async () => PNG };
  const { container } = render(
    <div data-testwurzel="" style={farbVariablen() as CSSProperties}>
      <BuecherAnsicht repository={repo} bildquelle={q} bildspeicher={s} />
    </div>,
  );
  await screen.findByRole('heading', { name: 'Deine Bücher' });
  return { repo, s, wurzel: container.firstElementChild as HTMLElement };
}
async function oeffneBlatt() {
  fireEvent.click(screen.getByRole('button', { name: 'Buch hinzufügen' }));
  const m = await screen.findByRole('menu', { name: 'Buch hinzufügen' });
  fireEvent.click(within(m).getByRole('menuitem', { name: /Von Hand eintragen/ }));
  return screen.findByRole('dialog', { name: 'Manueller Eintrag' });
}
const blatt = () => screen.queryByRole('dialog', { name: 'Manueller Eintrag' });
const d = () => screen.getByRole('dialog', { name: 'Manueller Eintrag' });
const feld = (name: string) => within(d()).getByLabelText(new RegExp(`^\\s*${name}\\s*$`, 'i')) as HTMLInputElement;
const gib = (name: string, wert: string) => fireEvent.change(feld(name), { target: { value: wert } });
const griff = () => d().querySelector<HTMLElement>('[data-ziehgriff]')!;
const coverFeld = () => d().querySelector<HTMLElement>('[data-cover-hinzufuegen]')!;
const pille = () => within(d()).getByRole('button', { name: 'Hinzufügen' });
const xBtn = () => within(d()).getByRole('button', { name: 'Schließen' });
async function warte() {
  await act(async () => {
    await new Promise((r) => setTimeout(r, 20));
  });
}
async function androidZurueck() {
  await act(async () => {
    window.dispatchEvent(new PopStateEvent('popstate', { state: null }));
    await new Promise((r) => setTimeout(r, 20));
  });
}
async function ziehe(el: HTMLElement, dy: number) {
  const o = { pointerId: 1, isPrimary: true, pointerType: 'touch', button: 0, buttons: 1, clientX: 200, clientY: 100 };
  fireEvent.pointerDown(el, o);
  fireEvent.touchStart(el, { touches: [{ clientX: 200, clientY: 100 }] });
  for (const f of [0.25, 0.5, 0.75, 1]) {
    fireEvent.pointerMove(el, { ...o, clientY: 100 + dy * f });
    fireEvent.touchMove(el, { touches: [{ clientX: 200, clientY: 100 + dy * f }] });
  }
  fireEvent.pointerUp(el, { ...o, clientY: 100 + dy, buttons: 0 });
  fireEvent.touchEnd(el, { changedTouches: [{ clientX: 200, clientY: 100 + dy }] });
  await warte();
}
async function tippe(el: HTMLElement) {
  const o = { pointerId: 1, isPrimary: true, pointerType: 'touch', button: 0, buttons: 1, clientX: 200, clientY: 100 };
  fireEvent.pointerDown(el, o);
  fireEvent.pointerUp(el, { ...o, buttons: 0 });
  fireEvent.click(el, { clientX: 200, clientY: 100 });
  await warte();
}
function textElement(root: HTMLElement, text: string | RegExp) {
  const passt = (t: string) => (typeof text === 'string' ? t === text : text.test(t));
  const k = [root, ...Array.from(root.querySelectorAll<HTMLElement>('*'))].filter((e) => passt(e.textContent?.trim() ?? ''));
  expect(k.length, `kein Element mit Text ${String(text)}`).toBeGreaterThan(0);
  return k.find((c) => !k.some((o) => o !== c && c.contains(o)))!;
}
const vor = (a: Node, b: Node) => Boolean(a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING);
const TRANSPARENT = /^(|transparent|rgba\(0, 0, 0, 0\))$/;
function mitFlaeche(start: HTMLElement, grenze: HTMLElement, abwaerts = false): HTMLElement {
  const kand = abwaerts ? [start, ...Array.from(start.querySelectorAll<HTMLElement>('*'))] : [];
  if (!abwaerts) for (let n: HTMLElement | null = start; n && n !== grenze; n = n.parentElement) kand.push(n);
  const t = kand.find((n) => !TRANSPARENT.test(getComputedStyle(n).backgroundColor));
  if (!t) throw new Error('kein Element mit Fläche gefunden');
  return t;
}
// Seit REQ-060 liegt „Seiten“ in der Karte „Ausgabe“; seit REQ-092 (2026-11-23) umfasst die Formular-Karte Titel und Autor.
const karte = () => {
  const s = feld('Autor');
  for (let n = feld('Titel').parentElement; n && n !== d(); n = n.parentElement) {
    if (n.contains(s) && !TRANSPARENT.test(getComputedStyle(n).backgroundColor)) return n;
  }
  throw new Error('keine Formular-Karte mit Fläche um die Felder');
};
const beschriftung = (name: string) => textElement(d(), new RegExp(`^${name}$`, 'i'));

type Art = 'text' | 'hintergrund' | 'rahmen' | 'icon';
const rubriken = farbrubriken as unknown as Record<string, { wert: string }>;
function farbeVon(ctx: HTMLElement, ausdruck: string) {
  const p = document.createElement('span');
  p.style.setProperty('color', ausdruck);
  ctx.appendChild(p);
  const w = getComputedStyle(p).color;
  p.remove();
  return w;
}
function ist(el: HTMLElement, art: Art) {
  const cs = getComputedStyle(el);
  if (art === 'text') return [cs.color];
  if (art === 'hintergrund') return [cs.backgroundColor];
  if (art === 'rahmen') return [cs.borderTopColor];
  return [cs.backgroundColor, cs.color];
}

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

// ===========================================================================
describe('REQ-030 Blatt „Manueller Eintrag“', () => {
  describe('AK-1 Aufbau des Blatts', () => {
    it('[REQ-030/AK-1] Ziehgriff, Überschrift, X, „Cover hinzufügen“ mit Kamera-Icon, Formular-Karte, „Hinzufügen“ – in dieser Reihenfolge', async () => {
      await zeige();
      await oeffneBlatt();
      const reihe = [
        griff(),
        textElement(d(), 'Manueller Eintrag'),
        xBtn(),
        coverFeld(),
        feld('Titel'),
        feld('Autor'),
        pille(),
      ];
      reihe.forEach((el, i) => expect(el, `Element ${i}`).toBeTruthy());
      for (let i = 1; i < reihe.length; i++) expect(vor(reihe[i - 1], reihe[i]), `Reihenfolge ${i - 1} → ${i}`).toBe(true);
      expect(coverFeld().textContent).toContain('Cover hinzufügen');
      expect(coverFeld().querySelectorAll('[data-icon]')).toHaveLength(1);
      expect(xBtn().querySelectorAll('[data-icon]')).toHaveLength(1);
      expect(karte().contains(pille()), 'Pille unter, nicht in der Karte').toBe(false);
      expect(karte().contains(coverFeld())).toBe(false);
    });

    it('[REQ-030/AK-1] das Blatt ersetzt die Seite „Bücher“ als Vollbild-Dialog (Seite nicht mehr bedienbar)', async () => {
      await zeige();
      await oeffneBlatt();
      expect(d()).toBeVisible();
      expect(screen.queryByRole('button', { name: 'Buch hinzufügen' })).toBeNull();
      expect(screen.queryByRole('menu')).toBeNull();
    });
  });

  // REQ-030/AK-2 ist laut Hinweis in REQ-030 mit REQ-060 hinfällig („SEITEN“ wandert in die Karte „Ausgabe“,
  // „Erscheinungsdatum“ heißt „Erschienen“). Die Tests prüfen das neue Verhalten (REQ-060/AK-1, AK-2).
  describe('AK-2 (überführt in REQ-060) Felder mit Beschriftung und Platzhaltertext', () => {
    it.each(FELDER.slice(0, 2))('[REQ-030/AK-2] Feld „%s“ ist leer, mit Platzhalter „%s“ und Beschriftung in Großbuchstaben', async (name, platzhalter) => {
      await zeige();
      await oeffneBlatt();
      const f = feld(name);
      expect(f.value).toBe('');
      expect(f).toHaveAttribute('placeholder', platzhalter);
      const b = beschriftung(name);
      const gross = b.textContent!.trim() === name.toUpperCase() || getComputedStyle(b).textTransform === 'uppercase';
      expect(gross, `Beschriftung ${name} in Großbuchstaben`).toBe(true);
    });

    it('[REQ-030/AK-2] Feld „Seiten“ ist leer, mit Platzhalter „496“, genau einmal vorhanden, in der Karte „Ausgabe“', async () => {
      await zeige();
      await oeffneBlatt();
      const f = feld('Seiten');
      expect(f.value).toBe('');
      expect(f).toHaveAttribute('placeholder', '496');
      expect(within(d()).getAllByLabelText(/^\s*Seiten\s*$/i)).toHaveLength(1);
      expect(d().querySelector('[data-ausgabe-zeile="seiten"]')!.contains(f)).toBe(true);
    });

    // Fassung 2026-11-23 (REQ-092): kein Feld „JAHR“, kein „ERSCHEINUNGSDATUM“ / „+ Erscheinungsdatum hinzufügen“.
    it('[REQ-030/AK-2] „TITEL“ und „AUTOR“ in der Formular-Karte in dieser Reihenfolge; kein Feld „JAHR“', async () => {
      await zeige();
      await oeffneBlatt();
      expect(karte().contains(feld('Titel'))).toBe(true);
      expect(karte().contains(feld('Autor'))).toBe(true);
      expect(vor(feld('Titel'), feld('Autor'))).toBe(true);
      expect(within(d()).queryAllByLabelText(/^\s*Jahr\s*$/i)).toHaveLength(0);
      expect(within(d()).queryAllByPlaceholderText('2024')).toHaveLength(0);
      expect(Array.from(d().querySelectorAll<HTMLElement>('*')).filter((e) => e.children.length === 0 && /^\s*JAHR\s*$/i.test(e.textContent ?? ''))).toHaveLength(0);
    });

    it('[REQ-030/AK-2] kein „+ Erscheinungsdatum hinzufügen“', async () => {
      await zeige();
      await oeffneBlatt();
      expect(d().textContent).not.toMatch(/Erscheinungsdatum hinzufügen/i);
    });

    it('[REQ-030/AK-2] „Erscheinungsdatum“ kommt nicht mehr vor, stattdessen die Zeile „Erschienen“', async () => {
      await zeige();
      await oeffneBlatt();
      expect(d().textContent).not.toMatch(/Erscheinungsdatum/i);
      expect(d().querySelectorAll('[data-ausgabe-zeile="erschienen"]')).toHaveLength(1);
    });
  });

  describe('AK-3 Platzhaltertext verschwindet bei Eingabe', () => {
    it.each(FELDER)('[REQ-030/AK-3] „%s“: Eingabe statt „%s“, nach vollständigem Löschen wieder der Platzhalter', async (name, platzhalter) => {
      await zeige();
      await oeffneBlatt();
      const eingabe = name === 'Seiten' ? '123' : 'Etwas Text';
      gib(name, eingabe);
      expect(feld(name).value).toBe(eingabe);
      // native Platzhalter (Absprache): der Browser blendet sie bei nicht leerem Wert aus
      expect(feld(name).value).not.toBe(platzhalter);
      gib(name, '');
      expect(feld(name).value).toBe('');
      expect(feld(name).getAttribute('placeholder')).toBe(platzhalter);
    });

    it('[REQ-030/AK-3] die Felder sind unabhängig: Eingabe im Titel lässt die übrigen Platzhalter stehen', async () => {
      await zeige();
      await oeffneBlatt();
      gib('Titel', 'Momo');
      for (const [n, p] of FELDER.slice(1)) {
        expect(feld(n).value).toBe('');
        expect(feld(n)).toHaveAttribute('placeholder', p);
      }
    });
  });

  describe('AK-4 Icons nachgebildet', () => {
    it('[REQ-030/AK-4] Kamera- und X-Icon sind Projektdateien unter src/assets/icons/, per Maske eingefärbt, kein <img>/<svg>', async () => {
      await zeige();
      await oeffneBlatt();
      for (const [wo, el] of [
        ['Cover hinzufügen', coverFeld()],
        ['Schließen', xBtn()],
      ] as const) {
        const i = el.querySelector<HTMLElement>('[data-icon]')!;
        const datei = i.getAttribute('data-icon')!;
        expect(fs.existsSync(new URL(datei, ICONS)), `${wo}: ${datei} im Projekt`).toBe(true);
        expect(el.querySelectorAll('img, svg'), wo).toHaveLength(0);
        const stil = i.getAttribute('style') ?? '';
        expect(stil, wo).toMatch(/mask/);
        expect(stil, wo).toContain(datei.replace(/\.png$/, ''));
      }
      expect(coverFeld().querySelector('[data-icon]')!.getAttribute('data-icon')).toMatch(/kamera/);
      expect(xBtn().querySelector('[data-icon]')!.getAttribute('data-icon')).toMatch(/(^|-)x\.png$/);
    });

    it('[REQ-030/AK-4] keine Icon-Bibliothek als Abhängigkeit', () => {
      const pkg = JSON.parse(fs.readFileSync(new URL('package.json', ROOT), 'utf8')) as Record<string, Record<string, string>>;
      const deps = Object.keys({ ...pkg.dependencies, ...pkg.devDependencies });
      expect(deps.filter((x) => /icon|lucide|fortawesome|heroicons|phosphor|feather|iconify|material-symbols|remixicon/i.test(x))).toEqual([]);
    });
  });

  describe('AK-5 Farben aus zentralen Farbrubriken', () => {
    const FAELLE: [string, string, Art, () => HTMLElement][] = [
      ['hintergrund', 'Fläche des Blatts', 'hintergrund', () => mitFlaeche(d(), d(), true)],
      ['tertiaer', 'Ziehgriff', 'hintergrund', () => mitFlaeche(griff(), d(), true)],
      ['dunkelbraun', 'Überschrift', 'text', () => textElement(d(), 'Manueller Eintrag')],
      ['ghost', 'X-Schaltfläche Fläche', 'hintergrund', xBtn],
      ['ghostframe', 'X-Schaltfläche Rahmen', 'rahmen', xBtn],
      ['dunkelbraun', 'X', 'icon', () => xBtn().querySelector<HTMLElement>('[data-icon]')!],
      ['ghost', '„Cover hinzufügen“ Fläche', 'hintergrund', coverFeld],
      ['ghostframe', '„Cover hinzufügen“ Rahmen', 'rahmen', coverFeld],
      ['tertiaer', 'Kamera-Icon', 'icon', () => coverFeld().querySelector<HTMLElement>('[data-icon]')!],
      ['tertiaer', 'Text „Cover hinzufügen“', 'text', () => textElement(coverFeld(), 'Cover hinzufügen')],
      ['ghost', 'Formular-Karte Fläche', 'hintergrund', karte],
      // Formular-Karte: seit REQ-065 AK-11 weicher Schatten statt Rahmen (eigener Test unten).
      ['dunkelbraun', 'Beschriftung TITEL', 'text', () => beschriftung('Titel')],
      ['dunkelbraun', 'Beschriftung SEITEN', 'text', () => beschriftung('Seiten')],
      ['dunkelbraun', 'eingegebener Text', 'text', () => feld('Autor')],
      ['primaer', 'Pille „Hinzufügen“ Fläche', 'hintergrund', pille],
      ['hintergrund', 'Pille „Hinzufügen“ Schrift', 'text', () => textElement(pille(), 'Hinzufügen')],
    ];

    it.each(FAELLE)('[REQ-030/AK-5] Rubrik „%s“ färbt %s', async (id, wo, art, finde) => {
      const { wurzel } = await zeige();
      await oeffneBlatt();
      expect(ist(finde(), art), wo).toContain(farbeVon(wurzel, rubriken[id].wert));
    });

    it.each(FAELLE)('[REQ-030/AK-5] Änderung der Rubrik „%s“ an zentraler Stelle wirkt auf %s', async (id, wo, art, finde) => {
      const alt = rubriken[id].wert;
      rubriken[id].wert = '#0A1B2C';
      try {
        const { wurzel } = await zeige();
        await oeffneBlatt();
        const w = ist(finde(), art);
        expect(w, `${wo}: neu`).toContain(farbeVon(wurzel, '#0A1B2C'));
        expect(w, `${wo}: alt`).not.toContain(farbeVon(wurzel, alt));
      } finally {
        rubriken[id].wert = alt;
      }
    });

    it('[REQ-030/AK-5] Formular-Karte durch weichen Schatten statt Rahmen abgesetzt (REQ-065 AK-11)', async () => {
      await zeige();
      await oeffneBlatt();
      expect(['', 'none']).toContain(getComputedStyle(karte()).borderTopStyle);
      expect(karte().style.boxShadow).toContain('var(--bz-schattenfarbe)');
    });

    it('[REQ-030/AK-5] Rahmen des Felds „Cover hinzufügen“ gestrichelt; kein Element des Blatts hat ein Farbliteral im Style', async () => {
      await zeige();
      await oeffneBlatt();
      expect(getComputedStyle(coverFeld()).borderTopStyle).toBe('dashed');
      const LIT = /#[0-9a-f]{3,8}\b|\b(?:rgba?|hsla?|hwb|oklch|lab|lch)\(|(?<![-\w])(?:black|white|red|gray|grey|brown|beige)(?![-\w])/i; // „white-space“ ist kein Farbwert
      const v = [d(), ...Array.from(d().querySelectorAll<HTMLElement>('*'))]
        .map((e) => (e.getAttribute('style') ?? '').replace(/url\([^)]*\)/g, ''))
        .filter((s) => LIT.test(s) || /var\(--[^,)]+,/.test(s));
      expect(v).toEqual([]);
    });
  });

  // Fassung 2026-11-23: genau eine Eingabe für die Erscheinungsangabe, die Zeile „Erschienen“ (REQ-060, REQ-092).
  describe('AK-6 Erscheinungsangabe nur über „Erschienen“', () => {
    it('[REQ-030/AK-6] genau eine Zeile „Erschienen“, kein weiteres Feld für Jahr oder Datum', async () => {
      await zeige();
      await oeffneBlatt();
      expect(d().querySelectorAll('[data-ausgabe-zeile="erschienen"]')).toHaveLength(1);
      expect(within(d()).queryAllByLabelText(/Jahr|Erscheinungsdatum|Erschienen/i).filter((e) => !e.closest('[data-ausgabe-zeile="erschienen"]'))).toHaveLength(0);
    });

    it('[REQ-030/AK-6] Antippen von „Erschienen“ öffnet ein Datumsfeld; nichts gespeichert', async () => {
      const { repo } = await zeige();
      await oeffneBlatt();
      gib('Titel', 'Momo 2');
      await tippe(d().querySelector<HTMLElement>('[data-ausgabe-zeile="erschienen"]')!);
      await vi.waitFor(() => expect(document.querySelector('[data-blatt-feld="erschienen"]')).not.toBeNull());
      expect(repo.save).not.toHaveBeenCalled();
      expect(feld('Titel').value).toBe('Momo 2');
    });
  });

  describe('AK-7 X schließt ohne Speichern', () => {
    it('[REQ-030/AK-7] Titel und Autor eingetragen, X → Blatt zu, Seite „Bücher“, kein Buch angelegt', async () => {
      const { repo, s } = await zeige();
      await oeffneBlatt();
      gib('Titel', 'Testbuch');
      gib('Autor', 'Vorname Nachname');
      await tippe(xBtn());
      expect(blatt()).toBeNull();
      expect(screen.getByRole('heading', { name: 'Deine Bücher' })).toBeVisible();
      expect(repo.save).not.toHaveBeenCalled();
      expect([...repo.daten.keys()]).toEqual([MOMO.id]);
      expect(s.put).not.toHaveBeenCalled();
    });

    it('[REQ-030/AK-7] nach erneutem Öffnen sind die Felder wieder leer (Angaben verworfen)', async () => {
      await zeige();
      await oeffneBlatt();
      gib('Titel', 'Testbuch');
      gib('Autor', 'Vorname Nachname');
      await tippe(xBtn());
      await oeffneBlatt();
      for (const [n] of FELDER) expect(feld(n).value, n).toBe('');
    });
  });

  describe('AK-8 Antippen des Ziehgriffs schließt nicht', () => {
    it('[REQ-030/AK-8] Tippen auf den Ziehgriff lässt das Blatt offen und den Titel eingetragen', async () => {
      await zeige();
      await oeffneBlatt();
      gib('Titel', 'Testbuch');
      await tippe(griff());
      await tippe(griff());
      expect(blatt()).toBeVisible();
      expect(feld('Titel').value).toBe('Testbuch');
    });

    it('[REQ-030/AK-8] Negativfall: Tippen auf die Blattfläche, Escape oder Ziehen nach oben schließt nicht', async () => {
      const { repo } = await zeige();
      await oeffneBlatt();
      gib('Titel', 'Testbuch');
      await tippe(d());
      fireEvent.keyDown(document, { key: 'Escape' });
      fireEvent.keyDown(d(), { key: 'Escape' });
      await ziehe(griff(), -300);
      expect(blatt()).toBeVisible();
      expect(feld('Titel').value).toBe('Testbuch');
      expect(repo.save).not.toHaveBeenCalled();
    });
  });

  describe('AK-10 Android-Zurück-Taste schließt ohne Speichern', () => {
    it('[REQ-030/AK-10] Titel und Autor eingetragen, Zurück-Taste → Blatt zu, Seite „Bücher“, kein Buch angelegt', async () => {
      const { repo, s } = await zeige();
      await oeffneBlatt();
      gib('Titel', 'Testbuch');
      gib('Autor', 'Vorname Nachname');
      await androidZurueck();
      expect(blatt()).toBeNull();
      expect(screen.getByRole('heading', { name: 'Deine Bücher' })).toBeVisible();
      expect(repo.save).not.toHaveBeenCalled();
      expect(s.put).not.toHaveBeenCalled();
    });

    it('[REQ-030/AK-10] danach ist die Seite „Bücher“ normal bedienbar und das Blatt lässt sich wieder öffnen und schließen', async () => {
      await zeige();
      await oeffneBlatt();
      await androidZurueck();
      await oeffneBlatt();
      expect(feld('Titel').value).toBe('');
      await androidZurueck();
      expect(blatt()).toBeNull();
      expect(screen.getByRole('button', { name: 'Buch hinzufügen' })).toBeInTheDocument();
    });
  });

  describe('AK-11 Herunterziehen am Ziehgriff schließt ohne Speichern', () => {
    it('[REQ-030/AK-11] Titel und Autor eingetragen, Ziehgriff nach unten ziehen → Blatt zu, Seite „Bücher“, kein Buch', async () => {
      const { repo, s } = await zeige();
      await oeffneBlatt();
      gib('Titel', 'Testbuch');
      gib('Autor', 'Vorname Nachname');
      await ziehe(griff(), 400);
      expect(blatt()).toBeNull();
      expect(screen.getByRole('heading', { name: 'Deine Bücher' })).toBeVisible();
      expect(repo.save).not.toHaveBeenCalled();
      expect(s.put).not.toHaveBeenCalled();
    });
  });

  // Fassung 2026-11-23 (REQ-092): das Feld „JAHR“ entfällt.
  describe('AK-12 Kein Feld „JAHR“', () => {
    it('[REQ-030/AK-12] die Formular-Karte enthält kein Feld „JAHR“ (weder Beschriftung noch Eingabe)', async () => {
      await zeige();
      await oeffneBlatt();
      expect(within(karte()).queryAllByLabelText(/^\s*Jahr\s*$/i)).toHaveLength(0);
      expect(karte().textContent).not.toMatch(/JAHR/i);
    });
  });

  describe('AK-9 Pille „Hinzufügen“ immer aktiv dargestellt', () => {
    it('[REQ-030/AK-9] bei leerem Blatt ist „Hinzufügen“ antippbar, nicht deaktiviert, nicht blass', async () => {
      await zeige();
      await oeffneBlatt();
      const p = pille();
      expect(p).toBeEnabled();
      expect(p).not.toHaveAttribute('aria-disabled', 'true');
      for (let n: HTMLElement | null = p; n && n !== d(); n = n.parentElement) {
        const o = getComputedStyle(n).opacity;
        expect(o === '' || Number(o) === 1, `opacity ${o}`).toBe(true);
        expect(getComputedStyle(n).filter ?? '').not.toMatch(/opacity|grayscale|saturate|brightness/);
      }
      await tippe(p);
      expect(screen.getByRole('alert'), 'Antippen hat eine Wirkung (Hinweis)').toBeInTheDocument();
    });
  });
});
