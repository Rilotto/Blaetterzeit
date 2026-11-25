/**
 * Grober Test REQ-077 – Standardmaße je Format und geschätzte Dicke.
 * Aufbau aus dem feinen Test tests/acceptance/REQ-077-standardmasse-je-format.test.tsx.
 */
import { expect, it } from 'vitest';
import { wirksameMasse } from '@/buchdetails/masse';

it('[REQ-077/GROB] Standardmaße je Format, Dicke aus Seitenzahl, hinterlegte Werte haben Vorrang', () => {
  const tb = wirksameMasse({ format: 'print', unterformat: 'taschenbuch', seitenanzahl: 400 });
  expect([tb.breiteMm, tb.hoeheMm, tb.dickeMm]).toEqual([138, 218, 24]);
  const hc = wirksameMasse({ format: 'print', unterformat: 'hardcover', seitenanzahl: 400 });
  expect([hc.breiteMm, hc.hoeheMm, hc.dickeMm, hc.deckelUeberstandMm]).toEqual([148, 210, 28, 3]);
  const kf = wirksameMasse({ format: 'print', unterformat: 'kleinformat' });
  expect([kf.breiteMm, kf.hoeheMm, kf.dickeMm]).toEqual([105, 148, 25]);
  const vorrang = wirksameMasse({ format: 'print', unterformat: 'hardcover', hoeheMm: 240, seitenanzahl: 400 });
  expect([vorrang.breiteMm, vorrang.hoeheMm, vorrang.dickeMm]).toEqual([148, 240, 28]);
});
