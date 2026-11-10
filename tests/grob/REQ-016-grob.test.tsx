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

it('[REQ-016/GROB] Galerie liefert Bild → Zuschnitt; Abbruch der Galerie ändert nichts', async () => {
  const s = speicher();
  const { q } = await zeige(s, null);
  const vorher = bereich('cover').innerHTML;
  fireEvent.click(within(await menue('cover')).getByRole('menuitem', { name: 'Aus Galerie auswählen' }));
  await vi.waitFor(() => expect(q.galerie).toHaveBeenCalled());
  await new Promise((r) => setTimeout(r, 10));
  expect(screen.queryByRole('region', { name: 'Zuschnitt' })).toBeNull();
  expect(screen.getByRole('region', { name: 'Buchdetails' })).toBeInTheDocument();
  expect(bereich('cover').innerHTML).toBe(vorher);
  expect(s.daten.size).toBe(0);
  cleanup();
  await zeige(speicher(), PNG.gruen);
  fireEvent.click(within(await menue('cover')).getByRole('menuitem', { name: 'Aus Galerie auswählen' }));
  expect(await screen.findByRole('region', { name: 'Zuschnitt' })).toBeInTheDocument();
});

it('[REQ-016/GROB] „Scannen“ öffnet die Kameraansicht der App; Zurück ändert nichts', async () => {
  const s = speicher();
  render(<BuchDetails buchId={MOMO.id} buch={MOMO} bildspeicher={s} onZurueck={() => {}} />);
  await vi.waitFor(() => expect(document.querySelectorAll('[data-bereich]')).toHaveLength(3));
  fireEvent.click(within(await menue('cover')).getByRole('menuitem', { name: 'Scannen' }));
  const k = await screen.findByRole('region', { name: 'Kamera' });
  expect(within(k).getByRole('button', { name: 'Foto aufnehmen' })).toBeInTheDocument();
  fireEvent.click(within(k).getByRole('button', { name: 'Zurück' }));
  await screen.findByRole('region', { name: 'Buchdetails' });
  expect(bildIn('cover')).toBeNull();
  expect(s.daten.size).toBe(0);
});
