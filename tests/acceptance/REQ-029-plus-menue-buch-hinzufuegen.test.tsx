/**
 * Akzeptanztests REQ-029 – Menü „Buch hinzufügen“ nach Antippen der Plus-Schaltfläche.
 *
 * Abgeleitet aus dem REQ-Text und der Schnittstellen-Absprache (sprints/sprint-04/plan.md, Teil A):
 *  - Plus: <button aria-label="Buch hinzufügen"> öffnet role="menu" aria-label="Buch hinzufügen"
 *  - genau ein role="menuitem" „Von Hand eintragen“ / „Wenn deine Ausgabe fehlt“, data-icon="icon-hand-eintragen.png"
 *  - bei offenem Menü: Schaltfläche aria-label="Menü schließen", data-icon="icon-x.png";
 *    Tippen darauf oder auf [data-menue-hintergrund] schließt
 *  - Blatt: role="dialog" aria-label="Manueller Eintrag"
 *  - BuecherAnsicht { repository?, bildquelle?, bildspeicher? }
 * Optik (Form, Schrift, Anordnung wie Referenzbild) prüft der CEO im Prototyp (manuelle Prüfliste).
 */
import '@testing-library/jest-dom/vitest';
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import type { CSSProperties } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import BuecherAnsicht from '@/views/BuecherAnsicht';
import type { Bildquelle } from '@/bild/bildquelle';
import type { Buch } from '@/domain/buch';
import type { BookRepository, ImageStore } from '@/storage';
import { farbrubriken, farbVariablen } from '@/theme';

// ---------------------------------------------------------------------------
// Dateisystem (dynamisch, wie in den übrigen Akzeptanztests)
// ---------------------------------------------------------------------------
type Bytes = Uint8Array & { readUInt32BE(o: number): number; subarray(a: number, b?: number): Bytes; toString(enc: string, a?: number, b?: number): string; equals(o: Uint8Array): boolean };
type DirEntry = { name: string; isDirectory(): boolean };
type FsLike = {
  existsSync(p: URL): boolean;
  readFileSync(p: URL): Bytes;
  readFileSync(p: URL, enc: 'utf8'): string;
  readdirSync(p: URL, o: { withFileTypes: true }): DirEntry[];
};
const fs = (await import(/* @vite-ignore */ 'node:' + 'fs')) as FsLike;
const { pathToFileURL } = (await import(/* @vite-ignore */ 'node:' + 'url')) as { pathToFileURL(p: string): URL };
const { cwd } = (await import(/* @vite-ignore */ 'node:' + 'process')) as { cwd(): string };
const zlib = (await import(/* @vite-ignore */ 'node:' + 'zlib')) as { inflateSync(b: Uint8Array): Uint8Array };
const ROOT = pathToFileURL(`${cwd()}/`);
const ICONS = new URL('src/assets/icons/', ROOT);
const REF_ICONS = new URL('docs/requirements/referenzen/icons/', ROOT);
function walk(dir: URL): URL[] {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
    e.isDirectory() ? walk(new URL(`${e.name}/`, dir)) : [new URL(e.name, dir)],
  );
}

// ---------------------------------------------------------------------------
// Testdaten und Hilfen
// ---------------------------------------------------------------------------
const PNG = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAIAAACQd1PeAAAADElEQVR4nGP4z8AAAAMBAQDJ/pLvAAAAAElFTkSuQmCC';
const MOMO: Buch = { id: '29000000-0000-4000-8000-000000000001', titel: 'Momo', status: 'ungelesen' };
const ICON_HAND = 'icon-hand-eintragen.png';

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
    put: async (id: string, b: string, d: string) => void daten.set(`${id}|${b}`, d),
    remove: async (id: string, b: string) => void daten.delete(`${id}|${b}`),
  };
  return s as typeof s & ImageStore;
}
async function zeige(repo = repoFake()) {
  const q: Bildquelle = { scannen: async () => PNG, galerie: async () => PNG };
  const { container } = render(
    <div data-testwurzel="" style={farbVariablen() as CSSProperties}>
      <BuecherAnsicht repository={repo} bildquelle={q} bildspeicher={speicherFake()} />
    </div>,
  );
  await screen.findByRole('heading', { name: 'Deine Bücher' });
  return { repo, wurzel: container.firstElementChild as HTMLElement };
}
const plus = () => screen.getByRole('button', { name: 'Buch hinzufügen' });
const menue = () => screen.queryByRole('menu', { name: 'Buch hinzufügen' });
const schliessenBtn = () => screen.getByRole('button', { name: 'Menü schließen' });
const hintergrund = () => document.querySelector<HTMLElement>('[data-menue-hintergrund]');
const blatt = () => screen.queryByRole('dialog', { name: 'Manueller Eintrag' });
async function oeffne() {
  fireEvent.click(plus());
  return screen.findByRole('menu', { name: 'Buch hinzufügen' });
}
function tippe(el: Element) {
  fireEvent.pointerDown(el);
  fireEvent.mouseDown(el);
  fireEvent.pointerUp(el);
  fireEvent.mouseUp(el);
  fireEvent.click(el);
}
function textElement(root: HTMLElement, text: string) {
  const k = [root, ...Array.from(root.querySelectorAll<HTMLElement>('*'))].filter((e) => e.textContent?.trim() === text);
  expect(k.length, `kein Element mit Text "${text}"`).toBeGreaterThan(0);
  return k.find((c) => !k.some((o) => o !== c && c.contains(o)))!;
}
const TRANSPARENT = /^(|transparent|rgba\(0, 0, 0, 0\))$/;
function kachel(item: HTMLElement) {
  const ic = item.querySelector<HTMLElement>('[data-icon]');
  expect(ic, 'Icon in der Option').not.toBeNull();
  for (let n = ic!.parentElement; n && n !== item; n = n.parentElement) {
    if (!TRANSPARENT.test(getComputedStyle(n).backgroundColor)) return n;
  }
  throw new Error('keine Icon-Kachel (Element mit Fläche) um das Icon');
}

type Art = 'text' | 'hintergrund' | 'rahmen' | 'icon';
function farbeVon(ctx: HTMLElement, ausdruck: string) {
  const p = document.createElement('span');
  p.style.setProperty('color', ausdruck);
  ctx.appendChild(p);
  const w = getComputedStyle(p).color;
  p.remove();
  return w;
}
const rubriken = farbrubriken as unknown as Record<string, { wert: string }>;
function ist(el: HTMLElement, art: Art) {
  const cs = getComputedStyle(el);
  if (art === 'text') return [cs.color];
  if (art === 'hintergrund') return [cs.backgroundColor];
  if (art === 'rahmen') return [cs.borderTopColor];
  return [cs.backgroundColor, cs.color];
}
function erwarte(el: HTMLElement, art: Art, id: string, wurzel: HTMLElement, wo: string) {
  expect(ist(el, art), `${wo}: ${art} in Rubrik ${id}`).toContain(farbeVon(wurzel, rubriken[id].wert));
}

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

// ===========================================================================
describe('REQ-029 Menü „Buch hinzufügen“', () => {
  describe('AK-1 Plus öffnet das Menü', () => {
    it('[REQ-029/AK-1] vor dem Antippen ist kein Menü und keine Abdunklung da, danach beides', async () => {
      await zeige();
      expect(menue()).toBeNull();
      expect(hintergrund()).toBeNull();
      const m = await oeffne();
      expect(m).toBeVisible();
      expect(hintergrund()).not.toBeNull();
    });

    it('[REQ-029/AK-1] die Seite „Bücher“ bleibt unter dem Menü sichtbar und ist abgedunkelt (deckende Fläche über der Seite)', async () => {
      await zeige();
      await oeffne();
      expect(screen.getByRole('heading', { name: 'Deine Bücher' })).toBeInTheDocument();
      const h = hintergrund()!;
      expect(TRANSPARENT.test(getComputedStyle(h).backgroundColor), 'Abdunklung hat eine Farbe').toBe(false);
      expect(h.getAttribute('style') ?? '', 'Abdunklung liegt über der Seite').toMatch(/position:\s*(fixed|absolute)/);
      // Das Menü liegt nicht in der Abdunklung (sonst wäre es selbst abgedunkelt)
      expect(h.contains(menue())).toBe(false);
    });

    it('[REQ-029/AK-1] Öffnen legt kein Buch an und speichert nichts', async () => {
      const { repo } = await zeige();
      await oeffne();
      expect(repo.save).not.toHaveBeenCalled();
      expect(blatt()).toBeNull();
    });
  });

  describe('AK-2 Genau eine Option mit Titel und Untertitel', () => {
    it('[REQ-029/AK-2] genau ein Menüpunkt mit Titel „Von Hand eintragen“ und Untertitel „Wenn deine Ausgabe fehlt“', async () => {
      await zeige();
      const m = await oeffne();
      const items = within(m).getAllByRole('menuitem');
      expect(items).toHaveLength(1);
      const t = textElement(items[0], 'Von Hand eintragen');
      const u = textElement(items[0], 'Wenn deine Ausgabe fehlt');
      expect(t.compareDocumentPosition(u) & Node.DOCUMENT_POSITION_FOLLOWING, 'Untertitel unter dem Titel').toBeTruthy();
    });

    it('[REQ-029/AK-2] die übrigen Optionen des Referenzbilds und eine Überschrift fehlen', async () => {
      await zeige();
      const m = await oeffne();
      for (const t of ['Online suchen', 'Barcode scannen', 'Deine Bücher importieren']) {
        expect(screen.queryByText(t), t).toBeNull();
      }
      expect(within(m).queryByRole('heading')).toBeNull();
      expect(m.textContent?.replace(/\s+/g, '')).toBe('VonHandeintragenWenndeineAusgabefehlt');
    });
  });

  describe('AK-3 Icon nachgebildet, nicht aus einer Bibliothek', () => {
    it('[REQ-029/AK-3] die Option zeigt genau ein Icon icon-hand-eintragen.png per Maske in einer Farbrubrik (kein <img>/<svg>)', async () => {
      await zeige();
      const m = await oeffne();
      const item = within(m).getByRole('menuitem');
      const icons = item.querySelectorAll<HTMLElement>('[data-icon]');
      expect(icons).toHaveLength(1);
      expect(icons[0]).toHaveAttribute('data-icon', ICON_HAND);
      expect(item.querySelectorAll('img, svg')).toHaveLength(0);
      const stil = icons[0].getAttribute('style') ?? '';
      expect(stil).toMatch(/mask/);
      expect(stil).toMatch(/icon-hand-eintragen/);
      expect(stil).toMatch(/var\(\s*--bz-farbe-/);
    });

    it('[REQ-029/AK-3] die Datei liegt im Projekt und ist ein einfarbiges Linien-Icon auf transparentem Grund (RGBA wie die übrigen Icons)', () => {
      const url = new URL(ICON_HAND, ICONS);
      expect(fs.existsSync(url)).toBe(true);
      const b = fs.readFileSync(url);
      expect(b.toString('latin1', 1, 4)).toBe('PNG');
      const w = b.readUInt32BE(16);
      const h = b.readUInt32BE(20);
      expect(b[24], 'Bittiefe 8').toBe(8);
      expect(b[25], 'RGBA').toBe(6);
      expect(b[28], 'ohne Interlacing').toBe(0);
      const teile: Uint8Array[] = [];
      for (let off = 8; off < b.length; ) {
        const len = b.readUInt32BE(off);
        if (b.toString('latin1', off + 4, off + 8) === 'IDAT') teile.push(b.subarray(off + 8, off + 8 + len));
        off += 12 + len;
      }
      const ges = new Uint8Array(teile.reduce((s, t) => s + t.length, 0));
      let o = 0;
      for (const t of teile) {
        ges.set(t, o);
        o += t.length;
      }
      const raw = zlib.inflateSync(ges);
      const z = w * 4;
      const px = new Uint8Array(w * h * 4);
      let p = 0;
      for (let y = 0; y < h; y++) {
        const f = raw[p++];
        for (let x = 0; x < z; x++) {
          const i = y * z + x;
          const a = x >= 4 ? px[i - 4] : 0;
          const u = y ? px[i - z] : 0;
          const c = y && x >= 4 ? px[i - z - 4] : 0;
          let v = raw[p++];
          if (f === 1) v += a;
          else if (f === 2) v += u;
          else if (f === 3) v += (a + u) >> 1;
          else if (f === 4) {
            const q = a + u - c;
            const pa = Math.abs(q - a), pb = Math.abs(q - u), pc = Math.abs(q - c);
            v += pa <= pb && pa <= pc ? a : pb <= pc ? u : c;
          }
          px[i] = v & 255;
        }
      }
      const farben = new Set<number>();
      let sichtbar = 0;
      for (let i = 0; i < w * h; i++) {
        if (px[i * 4 + 3] > 0) {
          sichtbar++;
          farben.add((px[i * 4] << 16) | (px[i * 4 + 1] << 8) | px[i * 4 + 2]);
        }
      }
      expect(farben.size, 'einfarbig').toBe(1);
      for (const i of [0, w - 1, w * h - w, w * h - 1]) expect(px[i * 4 + 3], 'Ecke transparent').toBe(0);
      expect(sichtbar / (w * h)).toBeGreaterThan(0.005);
      expect(sichtbar / (w * h)).toBeLessThan(0.6);
    });

    it('[REQ-029/AK-3] das Icon ist keine Kopie eines anderen Icons und es gibt keine Icon-Bibliothek', () => {
      const bytes = fs.readFileSync(new URL(ICON_HAND, ICONS));
      const gleich = [...walk(ICONS), ...walk(REF_ICONS)]
        .filter((u) => !u.pathname.endsWith(`/${ICON_HAND}`))
        .filter((u) => fs.readFileSync(u).equals(bytes));
      expect(gleich.map((u) => u.pathname)).toEqual([]);
      const pkg = JSON.parse(fs.readFileSync(new URL('package.json', ROOT), 'utf8')) as Record<string, Record<string, string>>;
      const deps = Object.keys({ ...pkg.dependencies, ...pkg.devDependencies });
      expect(deps.filter((d) => /icon|lucide|fortawesome|heroicons|phosphor|feather|iconify|material-symbols|remixicon/i.test(d))).toEqual([]);
    });
  });

  describe('AK-4 „Von Hand eintragen“ öffnet „Manueller Eintrag“', () => {
    it('[REQ-029/AK-4] Antippen der Option schließt Menü und Abdunklung und zeigt das Blatt', async () => {
      const { repo } = await zeige();
      const m = await oeffne();
      tippe(within(m).getByRole('menuitem', { name: /Von Hand eintragen/ }));
      expect(await screen.findByRole('dialog', { name: 'Manueller Eintrag' })).toBeVisible();
      expect(menue()).toBeNull();
      expect(hintergrund()).toBeNull();
      expect(repo.save).not.toHaveBeenCalled();
    });

    it('[REQ-029/AK-4] Antippen des Untertitels gehört zur Option und öffnet ebenfalls das Blatt', async () => {
      await zeige();
      const m = await oeffne();
      fireEvent.click(textElement(within(m).getByRole('menuitem'), 'Wenn deine Ausgabe fehlt'));
      expect(await screen.findByRole('dialog', { name: 'Manueller Eintrag' })).toBeVisible();
      expect(menue()).toBeNull();
    });
  });

  describe('AK-5 Farben aus zentralen Farbrubriken', () => {
    const FAELLE: [string, string, Art, () => HTMLElement][] = [
      ['hintergrund', 'Menüfläche', 'hintergrund', () => menue()!],
      ['ghostframe', 'Rahmen des Menüs', 'rahmen', () => menue()!],
      ['ghost', 'Icon-Kachel', 'hintergrund', () => kachel(within(menue()!).getByRole('menuitem'))],
      ['primaer', 'Icon', 'icon', () => within(menue()!).getByRole('menuitem').querySelector<HTMLElement>('[data-icon]')!],
      ['dunkelbraun', 'Titel', 'text', () => textElement(menue()!, 'Von Hand eintragen')],
      ['tertiaer', 'Untertitel', 'text', () => textElement(menue()!, 'Wenn deine Ausgabe fehlt')],
      ['primaer', '„×“-Schaltfläche (wie Plus)', 'hintergrund', schliessenBtn],
      ['hintergrund', '„×“-Icon (wie Plus-Icon)', 'icon', () => schliessenBtn().querySelector<HTMLElement>('[data-icon]')!],
    ];

    it.each(FAELLE)('[REQ-029/AK-5] Rubrik „%s“ färbt %s', async (id, wo, art, finde) => {
      const { wurzel } = await zeige();
      await oeffne();
      erwarte(finde(), art, id, wurzel, wo);
    });

    it.each(FAELLE)('[REQ-029/AK-5] Änderung der Rubrik „%s“ an zentraler Stelle wirkt auf %s', async (id, wo, art, finde) => {
      const alt = rubriken[id].wert;
      rubriken[id].wert = '#0A1B2C';
      try {
        const { wurzel } = await zeige();
        await oeffne();
        const werte = ist(finde(), art);
        expect(werte, `${wo}: neuer Wert`).toContain(farbeVon(wurzel, '#0A1B2C'));
        expect(werte, `${wo}: alter Wert`).not.toContain(farbeVon(wurzel, alt));
      } finally {
        rubriken[id].wert = alt;
      }
    });

    it('[REQ-029/AK-5] der Rahmen des Menüs ist sichtbar, der Untertitel kursiv', async () => {
      await zeige();
      const m = await oeffne();
      const cs = getComputedStyle(m);
      expect(cs.borderTopStyle).not.toMatch(/^(none|hidden|)$/);
      expect(getComputedStyle(textElement(m, 'Wenn deine Ausgabe fehlt')).fontStyle).toBe('italic');
      expect(getComputedStyle(textElement(m, 'Von Hand eintragen')).fontStyle).not.toBe('italic');
    });

    it('[REQ-029/AK-5] kein Element des Menüs, der Abdunklung oder der „×“-Schaltfläche hat ein eigenes Farbliteral im Style', async () => {
      await zeige();
      const m = await oeffne();
      const LIT = /#[0-9a-f]{3,8}\b|\b(?:rgba?|hsla?|hwb|oklch|lab|lch)\(|\b(?:black|white|red|gray|grey|brown|beige)\b/i;
      const els = [m, hintergrund()!, schliessenBtn()].flatMap((e) => [e, ...Array.from(e.querySelectorAll<HTMLElement>('*'))]);
      const verstoesse = els
        .map((e) => (e.getAttribute('style') ?? '').replace(/url\([^)]*\)/g, ''))
        .filter((s) => LIT.test(s) || /var\(--[^,)]+,/.test(s));
      expect(verstoesse).toEqual([]);
    });
  });

  describe('AK-6 „×“ bei geöffnetem Menü', () => {
    it('[REQ-029/AK-6] geschlossen: Plus-Icon; geöffnet: „×“ (icon-x.png) statt Plus-Icon in derselben Schaltfläche', async () => {
      await zeige();
      expect(plus().querySelector('[data-icon]')).toHaveAttribute('data-icon', 'icon-plus.png');
      await oeffne();
      expect(screen.queryByRole('button', { name: 'Buch hinzufügen' })).toBeNull();
      const x = schliessenBtn();
      expect(x.querySelectorAll('[data-icon]')).toHaveLength(1);
      expect(x.querySelector('[data-icon]')).toHaveAttribute('data-icon', 'icon-x.png');
      expect(document.querySelector('[data-icon="icon-plus.png"]')).toBeNull();
      // Es bleibt bei genau zwei Kopfschaltflächen (keine zusätzliche Schaltfläche)
      const kopf = screen.getByRole('heading', { name: 'Deine Bücher' }).parentElement!;
      expect(within(kopf).queryByRole('button', { name: 'Filter und Einstellungen' })).not.toBeNull();
    });

    it.each([
      ['Tippen außerhalb', () => tippe(hintergrund()!)],
      ['Tippen auf „×“', () => tippe(schliessenBtn())],
    ])('[REQ-029/AK-6] nach Schließen per %s zeigt die Schaltfläche wieder das Plus-Icon', async (_w, schliessen) => {
      await zeige();
      await oeffne();
      schliessen();
      expect(menue()).toBeNull();
      expect(plus().querySelector('[data-icon]')).toHaveAttribute('data-icon', 'icon-plus.png');
      expect(screen.queryByRole('button', { name: 'Menü schließen' })).toBeNull();
    });

    it('[REQ-029/AK-6] nach Schließen über die Option und Schließen des Blatts zeigt die Schaltfläche wieder das Plus-Icon', async () => {
      await zeige();
      const m = await oeffne();
      tippe(within(m).getByRole('menuitem'));
      const d = await screen.findByRole('dialog', { name: 'Manueller Eintrag' });
      fireEvent.click(within(d).getByRole('button', { name: 'Schließen' }));
      await screen.findByRole('heading', { name: 'Deine Bücher' });
      expect(plus().querySelector('[data-icon]')).toHaveAttribute('data-icon', 'icon-plus.png');
    });

    it('[REQ-029/AK-6] mehrfach öffnen und schließen wechselt jedes Mal sauber', async () => {
      await zeige();
      for (let i = 0; i < 3; i++) {
        await oeffne();
        expect(schliessenBtn()).toBeInTheDocument();
        tippe(i % 2 ? hintergrund()! : schliessenBtn());
        expect(menue()).toBeNull();
        expect(plus()).toBeInTheDocument();
      }
    });
  });

  describe('AK-7 Schließen durch Tippen außerhalb', () => {
    it('[REQ-029/AK-7] Tippen auf die Abdunklung schließt Menü und Abdunklung, kein Blatt, nichts gespeichert', async () => {
      const { repo } = await zeige();
      await oeffne();
      tippe(hintergrund()!);
      expect(menue()).toBeNull();
      expect(hintergrund()).toBeNull();
      expect(blatt()).toBeNull();
      expect(screen.queryAllByRole('dialog')).toHaveLength(0);
      expect(repo.save).not.toHaveBeenCalled();
      expect(screen.getByRole('heading', { name: 'Deine Bücher' })).toBeVisible();
    });
  });

  describe('AK-8 Schließen durch Tippen auf „×“', () => {
    it('[REQ-029/AK-8] Tippen auf „×“ schließt das Menü, es öffnet sich keine weitere Ansicht', async () => {
      const { repo } = await zeige();
      await oeffne();
      tippe(schliessenBtn());
      expect(menue()).toBeNull();
      expect(hintergrund()).toBeNull();
      expect(screen.queryAllByRole('dialog')).toHaveLength(0);
      expect(screen.queryByRole('menu')).toBeNull();
      expect(repo.save).not.toHaveBeenCalled();
    });
  });

  describe('AK-9 Tippen auf die Menüfläche außerhalb der Option schließt nicht', () => {
    it('[REQ-029/AK-9] Tippen auf die Menüfläche lässt Menü, Abdunklung und „×“ bestehen', async () => {
      await zeige();
      const m = await oeffne();
      tippe(m);
      expect(menue()).toBe(m);
      expect(hintergrund()).not.toBeNull();
      expect(schliessenBtn()).toBeInTheDocument();
      expect(blatt()).toBeNull();
    });

    it('[REQ-029/AK-9] Negativfall: andere Wege (Escape-Taste, Tippen auf Teile der Menüfläche außerhalb der Option) schließen nicht', async () => {
      await zeige();
      const m = await oeffne();
      fireEvent.keyDown(document, { key: 'Escape' });
      fireEvent.keyDown(m, { key: 'Escape' });
      expect(menue()).not.toBeNull();
      // Kinder der Menüfläche, die nicht zur Option gehören
      for (const el of Array.from(m.querySelectorAll<HTMLElement>('*')).filter((e) => !e.closest('[role="menuitem"]'))) {
        tippe(el);
      }
      expect(menue()).not.toBeNull();
      expect(blatt()).toBeNull();
    });
  });
});
