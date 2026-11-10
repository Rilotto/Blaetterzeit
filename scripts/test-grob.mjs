#!/usr/bin/env node
// Grober Testlauf (CLAUDE.md, „Token sparen beim Testen“):
//  - alle groben Tests (tests/grob), Unit- und Vertragstests,
//  - feine Akzeptanztests nur für noch nicht abgenommene REQs.
// Schlägt ein [REQ-xxx/GROB]-Test fehl, laufen danach die feinen Tests genau
// dieser REQs mit ausführlicher Ausgabe; das Skript endet dann mit Exit 1.
import { spawnSync } from 'node:child_process';
import { join } from 'node:path';
import { ROOT, loadReqs, readJson } from './lib/reqs.mjs';

const ABGENOMMEN = ['Implementiert', 'Freigegeben', 'Ersetzt'];
const offen = loadReqs().filter((r) => r.meta.id && !ABGENOMMEN.includes(r.meta.status)).map((r) => r.meta.id);

const vitest = (filters, reporters) => spawnSync(
  'npx', ['vitest', 'run', '--passWithNoTests', ...reporters, ...filters],
  { cwd: ROOT, stdio: 'inherit', shell: process.platform === 'win32' },
).status ?? 1;

// Positionsargumente sind bei vitest Pfadfilter (Teilstring) innerhalb von "include".
const filters = ['tests/grob/', 'tests/unit/', 'tests/contract/', ...offen.map((id) => `tests/acceptance/${id}-`)];
const status = vitest(filters, ['--reporter=dot', '--reporter=json', '--outputFile=test-results.json']);
if (status === 0) process.exit(0);

// Fehlgeschlagene grobe Tests den REQs zuordnen (Tag oder, bei Ladefehlern, Dateiname).
const failed = new Set();
for (const file of readJson(join(ROOT, 'test-results.json'), {}).testResults ?? []) {
  const inGrob = file.name.replace(/\\/g, '/').includes('/tests/grob/');
  for (const t of file.assertionResults ?? []) {
    if (t.status !== 'failed') continue;
    for (const m of (t.fullName ?? t.title ?? '').matchAll(/\[(REQ-\d{3,})\/GROB\]/g)) failed.add(m[1]);
  }
  if (inGrob && file.status === 'failed') {
    for (const m of file.name.matchAll(/REQ-\d{3,}/g)) failed.add(m[0]);
  }
}
if (failed.size) {
  const ids = [...failed].sort();
  console.log(`\n✗ Grobe Tests fehlgeschlagen für ${ids.join(', ')} – feine Tests dieser REQs:\n`);
  vitest(ids.flatMap((id) => [`tests/acceptance/${id}-`, `tests/regression/${id}-`]), ['--reporter=default']);
}
process.exit(1);
