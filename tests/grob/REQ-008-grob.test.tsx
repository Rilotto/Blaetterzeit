import { expect, it } from 'vitest';
import { LESESTATUS, neuesBuch } from '@/domain/buch';
import { createBookRepository } from '@/storage';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const COVER = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';

it('[REQ-008/GROB] Buch mit/ohne Cover, eindeutige UUIDs, nur die fünf Lesestatus, Ablage über das Repository', async () => {
  expect(LESESTATUS.map((s) => s.bezeichnung)).toEqual(['ungelesen', 'am lesen', 'gelesen', 'abgebrochen', 'Wunschliste']);
  const ohne = neuesBuch({ titel: 'Momo', status: 'ungelesen' });
  const mit = neuesBuch({ titel: 'Krabat', status: 'gelesen', cover: COVER });
  expect(ohne.id).toMatch(UUID);
  expect(mit.id).toMatch(UUID);
  expect(ohne.id).not.toBe(mit.id);
  expect(ohne.cover).toBeUndefined();
  expect(mit.cover).toBe(COVER);
  const repo = createBookRepository();
  await repo.save(ohne);
  await repo.save(mit);
  expect(await repo.get(ohne.id)).toEqual(ohne);
  expect(await repo.get(mit.id)).toEqual(mit);
});

it('[REQ-008/GROB] optionaler Autor: genau ein Autor wird gespeichert, ohne Autor fehlt das Feld', async () => {
  const repo = createBookRepository();
  const mit = neuesBuch({ titel: 'Momo', status: 'ungelesen', autor: 'Michael Ende' });
  const ohne = neuesBuch({ titel: 'Krabat', status: 'ungelesen' });
  await repo.save(mit);
  await repo.save(ohne);
  expect((await repo.get(mit.id))?.autor).toBe('Michael Ende');
  expect('autor' in ((await repo.get(ohne.id)) ?? {})).toBe(false);
});
