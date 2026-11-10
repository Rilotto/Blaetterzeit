import "@testing-library/jest-dom/vitest";
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import BuchDetails from "@/views/BuchDetails";
import type { Bildquelle } from "@/bild/bildquelle";
import type { Buch } from "@/domain/buch";
import type { ImageStore } from "@/storage/ImageStore";

afterEach(() => cleanup());

const MOMO: Buch = { id: "14000000-0000-4000-8000-000000000001", titel: "Momo", status: "ungelesen" };
const PNG = {
  rot: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAIAAACQd1PeAAAADElEQVR4nGP4z8AAAAMBAQDJ/pLvAAAAAElFTkSuQmCC',
  gruen: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAIAAACQd1PeAAAADElEQVR4nGNgaGAAAAEEAIFw9selAAAAAElFTkSuQmCC',
};
function speicher(start: Record<string, string> = {}) {
  const daten = new Map(Object.entries(start));
  const s = {
    daten,
    get: async (buchId: string, bereich: string) => daten.get(`${buchId}|${bereich}`),
    put: async (buchId: string, bereich: string, dataUrl: string) => void daten.set(`${buchId}|${bereich}`, dataUrl),
    remove: async (buchId: string, bereich: string) => void daten.delete(`${buchId}|${bereich}`),
  };
  return s as typeof s & ImageStore;
}
const bereich = (b: string) => document.querySelector<HTMLElement>(`[data-bereich="${b}"]`)!;
const bildIn = (b: string) => bereich(b)?.querySelector("img[data-bereich-bild]")?.getAttribute("src") ?? null;
async function zeige(s: ImageStore, neu: string | null = PNG.gruen, onZurueck = () => {}, buch = MOMO) {
  const q: Bildquelle = { scannen: vi.fn(async () => neu), galerie: vi.fn(async () => neu) };
  render(<BuchDetails buchId={buch.id} buch={buch} bildquelle={q} bildspeicher={s} onZurueck={onZurueck} />);
  const d = await screen.findByRole("region", { name: "Buchdetails" });
  await vi.waitFor(() => expect(document.querySelectorAll("[data-bereich]")).toHaveLength(3));
  await new Promise((r) => setTimeout(r, 10));
  return { d, q };
}
async function menue(b: string) {
  fireEvent.click(bereich(b));
  return screen.findByRole("menu", { name: "Bild hinzufügen" });
}
async function hinterlege(b: string) {
  fireEvent.click(within(await menue(b)).getByRole("menuitem", { name: "Aus Galerie auswählen" }));
  const z = await screen.findByRole("region", { name: "Zuschnitt" });
  fireEvent.click(within(z).getByRole("button", { name: "Bestätigen" }));
  await vi.waitFor(() => expect(bildIn(b)).not.toBeNull());
}

const namen = (m: HTMLElement) => within(m).getAllByRole('menuitem').map((e) => e.textContent?.replace(/\s+/g, ' ').trim());

it('[REQ-015/GROB] Auswahlmenü je Bereich, „Foto entfernen“ nur bei Bild, Bild landet im gewählten Bereich und lässt sich entfernen', async () => {
  const s = speicher({ [`${MOMO.id}|cover`]: PNG.rot });
  const { q } = await zeige(s);
  for (const b of ['ruecken', 'schnitt']) {
    expect(namen(await menue(b))).toEqual(['Scannen', 'Aus Galerie auswählen', 'Cover online suchen']);
    const h = document.querySelector<HTMLElement>('[data-menue-hintergrund]')!;
    fireEvent.pointerDown(h);
    fireEvent.click(h);
    await vi.waitFor(() => expect(screen.queryByRole('menu')).toBeNull());
  }
  const m = await menue('cover');
  expect(namen(m)).toEqual(['Scannen', 'Aus Galerie auswählen', 'Cover online suchen', 'Foto entfernen']);
  fireEvent.click(within(m).getByRole('menuitem', { name: 'Cover online suchen' }));
  expect(q.scannen).not.toHaveBeenCalled();
  expect(q.galerie).not.toHaveBeenCalled();
  expect(s.daten.get(`${MOMO.id}|cover`)).toBe(PNG.rot);

  await hinterlege('schnitt');
  expect(s.daten.has(`${MOMO.id}|schnitt`)).toBe(true);
  expect(s.daten.has(`${MOMO.id}|ruecken`)).toBe(false);

  fireEvent.click(within(await menue('cover')).getByRole('menuitem', { name: 'Foto entfernen' }));
  await vi.waitFor(() => expect(bildIn('cover')).toBeNull());
  expect(s.daten.has(`${MOMO.id}|cover`)).toBe(false);
});
