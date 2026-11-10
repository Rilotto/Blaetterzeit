import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen } from "@testing-library/react";
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

it('[REQ-014/GROB] drei Bereiche Rücken–Cover–Schnitt; Cover ohne Bild zeigt den Titel, ein Bild ersetzt ihn', async () => {
  const s = speicher();
  await zeige(s);
  const bereiche = Array.from(document.querySelectorAll('[data-bereich]')).map((e) => e.getAttribute('data-bereich'));
  expect(bereiche).toEqual(['ruecken', 'cover', 'schnitt']);
  expect(bereich('cover').querySelector('[data-cover-titel]')).toHaveTextContent('Momo');
  for (const b of ['ruecken', 'schnitt']) expect(bereich(b).querySelector('[data-bereich-beschriftung]')).toHaveTextContent('+');
  cleanup();
  await zeige(speicher({ [`${MOMO.id}|cover`]: PNG.rot, [`${MOMO.id}|ruecken`]: PNG.gruen }));
  await vi.waitFor(() => expect(bildIn('cover')).toBe(PNG.rot));
  expect(bereich('cover').querySelector('[data-cover-titel]')).toBeNull();
  expect(bildIn('ruecken')).toBe(PNG.gruen);
  expect(bereich('ruecken').querySelector('[data-bereich-beschriftung]')).toBeNull();
  expect(bildIn('schnitt')).toBeNull();
});
