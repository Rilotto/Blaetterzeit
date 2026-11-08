#!/usr/bin/env node
// Claude-Code-Hook (PreToolUse): verhindert, dass ein Agent eingefrorene
// Artefakte verändert. Änderungen daran laufen ausschließlich über
// "npm run release:freeze" nach CEO-Freigabe.
//
// Geschützt:
//  - tests/regression/**, tests/retired/**
//  - docs/releases.json
//  - REQ-Dateien mit Status "Freigegeben" oder "Ersetzt"
//    (Änderung nur über einen NEUEN REQ mit Feld "ersetzt")
import { existsSync, readFileSync } from 'node:fs';
import { isAbsolute, join, relative } from 'node:path';

const ROOT = process.env.CLAUDE_PROJECT_DIR || process.cwd();
const input = JSON.parse(readFileSync(0, 'utf8') || '{}');
const tool = input.tool_name;
const ti = input.tool_input ?? {};

const FROZEN_PATHS = [/^tests\/regression\//, /^tests\/retired\//, /^docs\/releases\.json$/];

function block(reason) {
  process.stderr.write(
    `BLOCKIERT: ${reason}\n` +
    'Eingefrorene Artefakte dürfen nicht direkt geändert werden. ' +
    'Soll sich freigegebenes Verhalten ändern, muss der Anforderungsmanager einen NEUEN REQ ' +
    'mit "ersetzt: [REQ-xxx]" anlegen, der CEO ihn abnehmen und der Scrum Master ' +
    'nach Freigabe "npm run release:freeze" ausführen.\n',
  );
  process.exit(2);
}

function isFrozenReq(relPath) {
  if (!/^docs\/requirements\/REQ-\d{3,}.*\.md$/.test(relPath)) return false;
  const abs = join(ROOT, relPath);
  if (!existsSync(abs)) return false;
  return /^status:\s*(Freigegeben|Ersetzt)\s*$/m.test(readFileSync(abs, 'utf8'));
}

if (['Edit', 'Write', 'MultiEdit', 'NotebookEdit'].includes(tool)) {
  const p = ti.file_path || ti.notebook_path;
  if (p) {
    const r = relative(ROOT, isAbsolute(p) ? p : join(ROOT, p)).split('\\').join('/');
    if (FROZEN_PATHS.some((re) => re.test(r))) block(`${r} ist eingefroren.`);
    if (isFrozenReq(r)) block(`${r} ist ein freigegebener/ersetzter REQ.`);
  }
}

if (tool === 'Bash') {
  const cmd = String(ti.command ?? '');
  const touchesFrozen = /tests\/regression|tests\/retired|docs\/releases\.json/.test(cmd);
  const readOnly = /^\s*(cat|ls|head|tail|grep|rg|git (diff|log|show|status)|npx vitest|npm (run )?test)\b/.test(cmd);
  const isFreeze = /^\s*npm run release:freeze\b/.test(cmd);
  if (touchesFrozen && !readOnly && !isFreeze) block(`Shell-Befehl berührt eingefrorene Pfade: ${cmd}`);
}

process.exit(0);
