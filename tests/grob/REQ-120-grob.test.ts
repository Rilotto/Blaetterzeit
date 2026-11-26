import { expect, it } from 'vitest';
// Grober Test REQ-120 – Vordergrund des Launcher-Icons liegt in allen fünf Dichten in passender Größe vor.
// Relativer Pfad wie im feinen Test (gleiche Verzeichnistiefe).
import { lesePng } from '../unit/helpers/png';

const FS = 'node:fs';
const fs = (await import(/* @vite-ignore */ FS)) as { existsSync(p: string): boolean };
const GROESSE: Record<string, number> = { mdpi: 108, hdpi: 162, xhdpi: 216, xxhdpi: 324, xxxhdpi: 432 };

it('[REQ-120/GROB] ic_launcher_foreground.png existiert in mdpi bis xxxhdpi mit passender Kantenlänge', () => {
  for (const [d, s] of Object.entries(GROESSE)) {
    const pfad = `android/app/src/main/res/mipmap-${d}/ic_launcher_foreground.png`;
    expect(fs.existsSync(pfad), pfad).toBe(true);
    expect(lesePng(pfad).breite, pfad).toBe(s);
  }
});
