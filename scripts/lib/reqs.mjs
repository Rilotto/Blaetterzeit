// Gemeinsame Hilfsfunktionen für Anforderungen (REQs), Manifest und Release-Ledger.
// Bewusst ohne externe Abhängigkeiten.
import { createHash } from 'node:crypto';
import { existsSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { join, relative } from 'node:path';

export const ROOT = new URL('../../', import.meta.url).pathname;
export const REQ_DIR = join(ROOT, 'docs/requirements');
export const REGRESSION_DIR = join(ROOT, 'tests/regression');
export const ACCEPTANCE_DIR = join(ROOT, 'tests/acceptance');
export const RETIRED_DIR = join(ROOT, 'tests/retired');
export const MANIFEST = join(REGRESSION_DIR, 'manifest.json');
export const LEDGER = join(ROOT, 'docs/releases.json');

export const STATUS = ['Entwurf', 'Abgestimmt', 'In Umsetzung', 'Implementiert', 'Freigegeben', 'Ersetzt'];

/** Parst einfaches YAML-Frontmatter (key: value, Listen als [a, b]). */
export function parseFrontmatter(text) {
  const m = text.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!m) return { meta: {}, body: text, raw: '' };
  const meta = {};
  for (const line of m[1].split(/\r?\n/)) {
    const kv = line.match(/^([\w_]+):\s*(.*)$/);
    if (!kv) continue;
    let v = kv[2].trim();
    if (v.startsWith('[') && v.endsWith(']')) {
      v = v.slice(1, -1).split(',').map((s) => s.trim()).filter(Boolean);
    }
    meta[kv[1]] = v;
  }
  return { meta, body: text.slice(m[0].length), raw: m[0] };
}

export function setFrontmatterField(text, key, value) {
  const v = Array.isArray(value) ? `[${value.join(', ')}]` : value;
  const re = new RegExp(`^(${key}:).*$`, 'm');
  const { raw } = parseFrontmatter(text);
  if (re.test(raw)) return text.replace(raw, raw.replace(re, `$1 ${v}`));
  return text.replace(raw, raw.replace(/\r?\n---$/, `\n${key}: ${v}\n---`));
}

export function loadReqs() {
  if (!existsSync(REQ_DIR)) return [];
  return readdirSync(REQ_DIR)
    .filter((f) => /^REQ-\d{3,}.*\.md$/.test(f))
    .map((f) => {
      const path = join(REQ_DIR, f);
      const text = readFileSync(path, 'utf8');
      const { meta, body } = parseFrontmatter(text);
      // Akzeptanzkriterien: Überschriften der Form "### AK-1 ..."
      const aks = [...body.matchAll(/^#{2,4}\s*(AK-\d+)\b/gm)].map((x) => x[1]);
      return { file: f, path, text, meta, aks, id: meta.id };
    });
}

export function listFiles(dir) {
  if (!existsSync(dir)) return [];
  const out = [];
  for (const e of readdirSync(dir)) {
    const p = join(dir, e);
    if (statSync(p).isDirectory()) out.push(...listFiles(p));
    else out.push(p);
  }
  return out;
}

export const rel = (p) => relative(ROOT, p).split('\\').join('/');

export function sha256(path) {
  // Zeilenenden normalisieren, damit Windows/Linux denselben Hash liefern.
  return createHash('sha256').update(readFileSync(path, 'utf8').replace(/\r\n/g, '\n')).digest('hex');
}

export function readJson(path, fallback) {
  return existsSync(path) ? JSON.parse(readFileSync(path, 'utf8')) : fallback;
}

export function writeJson(path, data) {
  writeFileSync(path, JSON.stringify(data, null, 2) + '\n');
}
