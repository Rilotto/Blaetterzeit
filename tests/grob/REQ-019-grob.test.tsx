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

const KRABAT: Buch = { id: '19000000-0000-4000-8000-000000000002', titel: 'Krabat', status: 'ungelesen' };

it('[REQ-019/GROB] Bilder bleiben über Neu-Rendern mit demselben Store erhalten (je Bereich und Buch, auch ersetzt/entfernt)', async () => {
  const s = speicher();
  await zeige(s, PNG.rot);
  await hinterlege('cover');
  await hinterlege('ruecken');
  const cover = bildIn('cover');
  cleanup();

  await zeige(s);
  await vi.waitFor(() => expect(bildIn('cover')).toBe(cover));
  expect(bildIn('ruecken')).not.toBeNull();
  expect(bildIn('schnitt')).toBeNull();
  fireEvent.click(within(await menue('ruecken')).getByRole('menuitem', { name: 'Foto entfernen' }));
  await vi.waitFor(() => expect(bildIn('ruecken')).toBeNull());
  cleanup();

  await zeige(s);
  await vi.waitFor(() => expect(bildIn('cover')).toBe(cover));
  expect(bildIn('ruecken')).toBeNull();
  cleanup();

  await zeige(s, null, () => {}, KRABAT);
  expect(BILDER_LEER()).toBe(true);
});

const BILDER_LEER = () => ['ruecken', 'cover', 'schnitt'].every((b) => bildIn(b) === null);
