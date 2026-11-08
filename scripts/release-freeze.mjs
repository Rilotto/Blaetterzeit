#!/usr/bin/env node
// Friert die vom CEO abgenommenen REQs für ein Release ein.
//
// Aufruf:  npm run release:freeze -- <version> <REQ-ID> [<REQ-ID> ...]
// Beispiel: npm run release:freeze -- 0.2.0 REQ-003 REQ-004
//
// Ablauf:
//  1. Prüft: alle Tests grün + Traceability OK, genannte REQs haben Status "Implementiert".
//  2. Verschiebt tests/acceptance/REQ-xxx*.test.* nach tests/regression/ und trägt
//     SHA-256-Hashes ins Manifest ein (ab jetzt unveränderlich).
//  3. Setzt REQs auf "Freigegeben" (+ freigegeben_in).
//  4. REQs, die laut Feld "ersetzt" abgelöst werden, gehen auf "Ersetzt";
//     deren Regressionstests wandern nach tests/retired/ (Historie bleibt erhalten).
//  5. Ergänzt docs/releases.json, CHANGELOG.md und package.json-Version.
//  6. Prüft erneut alles und schreibt docs/traceability.md.
//
// NUR ausführen, nachdem der CEO die Freigabe ausdrücklich erteilt hat.
import { execSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, readdirSync, renameSync, writeFileSync } from 'node:fs';
import { basename, join } from 'node:path';
import {
  ACCEPTANCE_DIR, LEDGER, MANIFEST, REGRESSION_DIR, RETIRED_DIR, ROOT,
  loadReqs, readJson, rel, setFrontmatterField, sha256, writeJson,
} from './lib/reqs.mjs';

const [version, ...ids] = process.argv.slice(2);
const fail = (m) => { console.error('✗ ' + m); process.exit(1); };
const run = (cmd) => execSync(cmd, { cwd: ROOT, stdio: 'inherit' });

if (!/^\d+\.\d+\.\d+$/.test(version ?? '')) fail('Version fehlt oder ist kein SemVer (z. B. 0.2.0)');
if (ids.length === 0) fail('Mindestens eine REQ-ID angeben');

const ledger = readJson(LEDGER, { releases: [] });
const cmp = (a, b) => a.split('.').map(Number).reduce((r, x, i) => r || x - b.split('.').map(Number)[i], 0);
const last = ledger.releases.at(-1)?.version;
if (last && cmp(version, last) <= 0) fail(`Version ${version} muss größer als ${last} sein`);

console.log('→ Vorabprüfung: Tests + Traceability');
run('npm test --silent');
run('node scripts/check-traceability.mjs');

const reqs = loadReqs();
const byId = new Map(reqs.map((r) => [r.meta.id, r]));
const manifest = readJson(MANIFEST, { files: {} });
const gitMv = (from, to) => {
  try { execSync(`git mv "${from}" "${to}"`, { cwd: ROOT, stdio: 'ignore' }); } catch { renameSync(from, to); }
};
const replaced = [];

for (const id of ids) {
  const r = byId.get(id);
  if (!r) fail(`${id} existiert nicht`);
  if (r.meta.status !== 'Implementiert') fail(`${id} hat Status "${r.meta.status}" – nur "Implementiert" kann freigegeben werden`);
  const tests = existsSync(ACCEPTANCE_DIR) ? readdirSync(ACCEPTANCE_DIR).filter((f) => f.startsWith(id) && /\.test\.tsx?$/.test(f)) : [];
  if (tests.length === 0) fail(`${id}: keine Testdateien tests/acceptance/${id}*.test.ts gefunden`);

  for (const f of tests) {
    const to = join(REGRESSION_DIR, f);
    gitMv(join(ACCEPTANCE_DIR, f), to);
    manifest.files[rel(to)] = { req: id, version, sha256: sha256(to) };
  }

  let text = setFrontmatterField(r.text, 'status', 'Freigegeben');
  text = setFrontmatterField(text, 'freigegeben_in', version);
  writeFileSync(r.path, text);

  const supersedes = Array.isArray(r.meta.ersetzt) ? r.meta.ersetzt : r.meta.ersetzt ? [r.meta.ersetzt] : [];
  for (const oldId of supersedes) {
    const old = byId.get(oldId);
    if (!old) fail(`${id} ersetzt ${oldId}, das es nicht gibt`);
    let t = setFrontmatterField(old.text, 'status', 'Ersetzt');
    t = setFrontmatterField(t, 'ersetzt_durch', id);
    writeFileSync(old.path, t);
    mkdirSync(RETIRED_DIR, { recursive: true });
    for (const [key, entry] of Object.entries(manifest.files)) {
      if (entry.req !== oldId) continue;
      gitMv(join(ROOT, key), join(RETIRED_DIR, basename(key)));
      delete manifest.files[key];
    }
    replaced.push(`${oldId} → ${id}`);
  }
}

// Hashes der freigegebenen/ersetzten REQ-Texte festhalten (Schutz gegen stille Änderung)
manifest.reqs = manifest.reqs ?? {};
for (const r of loadReqs()) {
  if (['Freigegeben', 'Ersetzt'].includes(r.meta.status)) manifest.reqs[rel(r.path)] = sha256(r.path);
}
writeJson(MANIFEST, manifest);
ledger.releases.push({ version, date: new Date().toISOString().slice(0, 10), reqs: ids, ersetzt: replaced });
writeJson(LEDGER, ledger);

const pkgPath = join(ROOT, 'package.json');
const pkg = JSON.parse(readFileSync(pkgPath, 'utf8'));
pkg.version = version;
writeJson(pkgPath, pkg);

const clPath = join(ROOT, 'CHANGELOG.md');
const cl = existsSync(clPath) ? readFileSync(clPath, 'utf8') : '# Changelog\n';
const entry = [
  `## [${version}] – ${new Date().toISOString().slice(0, 10)}`, '',
  ...ids.map((id) => `- ${id}: ${byId.get(id).meta.titel}`),
  ...replaced.map((x) => `- Ersetzt: ${x}`), '',
].join('\n');
// Neuester Eintrag steht oben, direkt vor dem bisher neuesten.
const pos = cl.indexOf('\n## [');
writeFileSync(clPath, pos === -1 ? `${cl.trimEnd()}\n\n${entry}` : `${cl.slice(0, pos + 1)}${entry}\n${cl.slice(pos + 1)}`);

console.log('→ Nachprüfung');
run('npm test --silent');
run('node scripts/check-traceability.mjs --write');

console.log(`\n✓ Release ${version} eingefroren. Nächste Schritte:
  git add -A && git commit -m "release: v${version}"
  git tag v${version} && git push && git push --tags
  → GitHub Actions baut daraufhin die signierte APK.`);
