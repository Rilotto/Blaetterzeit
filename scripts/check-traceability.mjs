#!/usr/bin/env node
// Quality Gate: stellt sicher, dass keine freigegebene Funktion verloren geht.
//
// Prüft:
//  1. Jeder REQ hat gültiges Frontmatter (id, titel, status).
//  2. Jeder REQ mit Status "Implementiert" oder "Freigegeben" hat zu JEDEM
//     Akzeptanzkriterium (AK-n) mindestens einen BESTANDENEN Test mit dem Tag
//     [REQ-xxx/AK-n] und keinen fehlgeschlagenen/übersprungenen.
//  3. Tests freigegebener REQs liegen in tests/regression/.
//  4. Regressionstests sind unverändert (SHA-256 gegen manifest.json).
//  5. Jeder REQ, der je in einem Release war (docs/releases.json), existiert noch
//     und ist "Freigegeben" oder sauber "Ersetzt" (mit Nachfolger).
//  6. Das Release-Ledger wurde gegenüber dem letzten Git-Tag nur ergänzt.
//
// Aufruf:  node scripts/check-traceability.mjs [--results test-results.json] [--write] [--grob]
//   --write  erzeugt zusätzlich docs/traceability.md
//   --grob   für abgenommene REQs (Implementiert/Freigegeben) genügt statt Punkt 2
//            ein bestandener [REQ-xxx/GROB]-Test; fehlt er, gibt es nur eine Warnung.
import { execSync } from 'node:child_process';
import { existsSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import {
  LEDGER, MANIFEST, REGRESSION_DIR, ROOT, STATUS,
  listFiles, loadReqs, readJson, rel, sha256,
} from './lib/reqs.mjs';

const args = process.argv.slice(2);
const resultsPath = join(ROOT, args.includes('--results') ? args[args.indexOf('--results') + 1] : 'test-results.json');
const errors = [];
const err = (m) => errors.push(m);
const grob = args.includes('--grob');
const warnings = [];

// ---------- Testergebnisse einlesen ----------
const results = readJson(resultsPath, null);
if (!results) {
  console.error(`✗ Keine Testergebnisse gefunden (${rel(resultsPath)}). Erst "npm test" ausführen.`);
  process.exit(1);
}
/** tag -> [{file, status, name}] */
const byTag = new Map();
for (const file of results.testResults ?? []) {
  for (const t of file.assertionResults ?? []) {
    for (const m of (t.fullName ?? t.title ?? '').matchAll(/\[(REQ-\d{3,})\/(AK-\d+|GROB)\]/g)) {
      const tag = `${m[1]}/${m[2]}`;
      if (!byTag.has(tag)) byTag.set(tag, []);
      byTag.get(tag).push({ file: rel(file.name), status: t.status, name: t.fullName });
    }
  }
}

// ---------- REQs prüfen ----------
const reqs = loadReqs();
const ids = new Map();
const rows = [];
for (const r of reqs) {
  const { meta } = r;
  if (!meta.id || !meta.titel || !meta.status) { err(`${r.file}: Frontmatter unvollständig (id, titel, status)`); continue; }
  if (!r.file.startsWith(meta.id)) err(`${r.file}: Dateiname passt nicht zur id ${meta.id}`);
  if (ids.has(meta.id)) err(`${meta.id}: doppelt vergeben (${ids.get(meta.id)}, ${r.file})`);
  ids.set(meta.id, r.file);
  if (!STATUS.includes(meta.status)) err(`${meta.id}: unbekannter Status "${meta.status}"`);
  if (['Abgestimmt', 'In Umsetzung', 'Implementiert', 'Freigegeben'].includes(meta.status) && r.aks.length === 0) {
    err(`${meta.id}: Status "${meta.status}", aber keine Akzeptanzkriterien (### AK-n)`);
  }

  const abgenommen = ['Implementiert', 'Freigegeben'].includes(meta.status);
  const mustBeTested = abgenommen && !grob;
  if (abgenommen && grob) {
    const tests = byTag.get(`${meta.id}/GROB`) ?? [];
    const bad = tests.filter((t) => t.status !== 'passed');
    if (tests.length === 0) warnings.push(`${meta.id}: noch kein grober Test [${meta.id}/GROB]`);
    else if (bad.length) err(`${meta.id}/GROB: ${bad.length} Test(s) nicht bestanden: ${bad.map((b) => b.name).join('; ')}`);
  }
  for (const ak of r.aks) {
    const tests = byTag.get(`${meta.id}/${ak}`) ?? [];
    const passed = tests.filter((t) => t.status === 'passed');
    const bad = tests.filter((t) => t.status !== 'passed');
    rows.push({ id: meta.id, titel: meta.titel, status: meta.status, ak, passed: passed.length, bad: bad.length, files: [...new Set(tests.map((t) => t.file))] });
    if (!mustBeTested) continue;
    if (passed.length === 0) err(`${meta.id}/${ak}: kein bestandener Test (Status ${meta.status})`);
    if (bad.length) err(`${meta.id}/${ak}: ${bad.length} Test(s) nicht bestanden: ${bad.map((b) => b.name).join('; ')}`);
    if (meta.status === 'Freigegeben' && passed.some((t) => !t.file.startsWith('tests/regression/'))) {
      err(`${meta.id}/${ak}: Tests eines freigegebenen REQ müssen in tests/regression/ liegen`);
    }
  }
  if (meta.status === 'Ersetzt' && !meta.ersetzt_durch) err(`${meta.id}: Status "Ersetzt" ohne ersetzt_durch`);
}

// ---------- Manifest der eingefrorenen Regressionstests ----------
const manifest = readJson(MANIFEST, { files: {} });
const actual = listFiles(REGRESSION_DIR).filter((p) => p !== MANIFEST && !p.endsWith('.gitkeep'));
for (const p of actual) {
  const key = rel(p);
  const entry = manifest.files[key];
  if (!entry) err(`${key}: Regressionstest ohne Manifest-Eintrag (nur über "npm run release:freeze" hinzufügen)`);
  else if (entry.sha256 !== sha256(p)) err(`${key}: eingefrorener Regressionstest wurde verändert`);
}
for (const key of Object.keys(manifest.files)) {
  if (!existsSync(join(ROOT, key))) err(`${key}: eingefrorener Regressionstest fehlt`);
}

for (const r of reqs) {
  if (!['Freigegeben', 'Ersetzt'].includes(r.meta.status)) continue;
  const h = manifest.reqs?.[rel(r.path)];
  if (!h) err(`${r.meta.id}: Status "${r.meta.status}" ohne Freigabe über release:freeze`);
  else if (h !== sha256(r.path)) err(`${r.meta.id}: freigegebener REQ-Text wurde verändert`);
}

// ---------- Release-Ledger ----------
const ledger = readJson(LEDGER, { releases: [] });
for (const rls of ledger.releases) {
  for (const id of rls.reqs) {
    const file = ids.get(id);
    if (!file) { err(`${id}: war in Release ${rls.version}, REQ-Datei fehlt`); continue; }
    const r = reqs.find((x) => x.meta.id === id);
    if (!['Freigegeben', 'Ersetzt'].includes(r.meta.status)) err(`${id}: war in Release ${rls.version}, hat jetzt Status "${r.meta.status}"`);
    if (r.meta.status === 'Ersetzt' && !ids.has(r.meta.ersetzt_durch)) err(`${id}: ersetzt_durch ${r.meta.ersetzt_durch} existiert nicht`);
  }
}
try {
  const lastTag = execSync('git describe --tags --abbrev=0 --match "v*"', { cwd: ROOT, stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim();
  const old = JSON.parse(execSync(`git show ${lastTag}:docs/releases.json`, { cwd: ROOT, stdio: ['ignore', 'pipe', 'ignore'] }).toString());
  old.releases.forEach((o, i) => {
    if (JSON.stringify(o) !== JSON.stringify(ledger.releases[i])) err(`docs/releases.json: Eintrag ${o.version} gegenüber ${lastTag} verändert oder entfernt`);
  });
} catch { /* noch kein Tag oder kein Git – Prüfung entfällt */ }

// ---------- Ausgabe ----------
if (args.includes('--write')) {
  const lines = [
    '# Traceability-Matrix', '',
    '_Automatisch erzeugt von `npm run trace:write` – nicht von Hand bearbeiten._', '',
    '| REQ | Titel | Status | AK | ✓ | ✗ | Testdateien |', '|---|---|---|---|---|---|---|',
    ...rows.map((x) => `| ${x.id} | ${x.titel} | ${x.status} | ${x.ak} | ${x.passed} | ${x.bad} | ${x.files.join('<br>')} |`),
  ];
  if (rows.length === 0) lines.push('| – | noch keine Anforderungen | | | | | |');
  writeFileSync(join(ROOT, 'docs/traceability.md'), lines.join('\n') + '\n');
}

if (warnings.length) {
  console.warn(`! ${warnings.length} Warnung(en):`);
  for (const w of warnings) console.warn('  - ' + w);
}
const released = reqs.filter((r) => r.meta.status === 'Freigegeben').length;
if (errors.length) {
  console.error(`✗ Traceability-Check fehlgeschlagen (${errors.length} Fehler):`);
  for (const e of errors) console.error('  - ' + e);
  process.exit(1);
}
console.log(`✓ Traceability OK${grob ? ' (grob)' : ''} – ${reqs.length} REQs, davon ${released} freigegeben, ${Object.keys(manifest.files).length} eingefrorene Testdateien.`);
