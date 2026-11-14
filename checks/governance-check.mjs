#!/usr/bin/env node
// governance-check <ADR number> [--from <ref>]
// Runs the check governance ships for one ADR, from the consuming repository's
// root, as called by that ADR's `check:` line through `ontrack check`.
import { readFileSync, readdirSync, mkdtempSync, writeFileSync, rmSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { tmpdir } from 'node:os';
import { createRequire } from 'node:module';
import { spawnSync } from 'node:child_process';

class CheckError extends Error {}

// The single repository copy of an ADR, under a namespace directory.
function findAdr(root, number) {
  const base = join(root, 'docs', 'adr');
  const pattern = `docs/adr/*/${number}-*.md`;
  const dirs = existsSync(base)
    ? readdirSync(base, { withFileTypes: true }).filter((d) => d.isDirectory())
    : [];
  const hits = dirs.flatMap((d) =>
    readdirSync(join(base, d.name))
      .filter((f) => f.startsWith(`${number}-`) && f.endsWith('.md'))
      .map((f) => join(base, d.name, f)),
  );
  if (hits.length === 0) throw new CheckError(`${number}: no file matches ${pattern}`);
  if (hits.length > 1) throw new CheckError(`${number}: several files match ${pattern}: ${hits.join(', ')}`);
  return hits[0];
}

// A scalar as ontrack reads it: trailing ` # comment` cut, one pair of quotes removed.
function scalar(raw) {
  let v = raw.replace(/\s+#.*$/, '').trim();
  if (v.length >= 2 && (v[0] === '"' || v[0] === "'") && v.at(-1) === v[0]) v = v.slice(1, -1);
  return v;
}

// The keys of `traits.<group>` in the frontmatter, read line by line, no YAML parser.
// A value is a string, a list (flow `[a, b]` or block `- a`), or '' when empty.
// ponytail: handles the shapes governance ADRs use, not arbitrary YAML.
function readTraits(text, group) {
  const lines = text.split(/\r?\n/);
  const end = lines[0] === '---' ? lines.indexOf('---', 1) : -1;
  if (end === -1) return null;
  const front = lines.slice(1, end);
  const t = front.indexOf('traits:');
  if (t === -1) return null;
  const g = front.findIndex((l, i) => i > t && l === `  ${group}:`);
  if (g === -1) return null;
  const traits = {};
  let current = null;
  for (const line of front.slice(g + 1)) {
    if (!line.startsWith('    ')) break;
    const item = line.match(/^\s{6,}-\s*(.*)$/);
    if (item && current) {
      if (!Array.isArray(traits[current])) traits[current] = [];
      traits[current].push(scalar(item[1]));
      continue;
    }
    const kv = line.match(/^ {4}([\w-]+):\s*(.*)$/);
    if (!kv) continue;
    current = kv[1];
    const v = scalar(kv[2]);
    traits[current] = v.startsWith('[') && v.endsWith(']')
      ? v.slice(1, -1).split(',').map((s) => scalar(s)).filter(Boolean)
      : v;
  }
  return traits;
}

function resolveFrom(root, id) {
  try {
    return createRequire(join(root, 'package.json')).resolve(id);
  } catch {
    throw new CheckError(`ADR-0006: commits.tool is commitlint, but ${id.replace(/\/package\.json$/, '')} is not installed in this repository`);
  }
}

function commits(root, file, { from }) {
  const traits = readTraits(readFileSync(file, 'utf8'), 'commits') ?? {};
  const tool = traits.tool;
  if (!tool) throw new CheckError(`ADR-0006: commits.tool is not set in ${file}; the ADR is not ruled`);
  if (tool === 'hook' || tool === 'none') {
    console.log(`ADR-0006: commits.tool is ${tool}, nothing to check`);
    return 0;
  }
  if (tool !== 'commitlint') throw new CheckError(`ADR-0006: commits.tool has an unknown value: ${tool}`);
  const scopes = Array.isArray(traits.scopes) ? traits.scopes : null;
  if (!scopes) throw new CheckError(`ADR-0006: commits.scopes is not a list in ${file}`);

  const conventional = resolveFrom(root, '@commitlint/config-conventional');
  const cli = join(dirname(resolveFrom(root, '@commitlint/cli/package.json')), 'cli.js');
  const rules = scopes.length
    ? { 'scope-enum': [2, 'always', scopes] }
    : { 'scope-empty': [2, 'always'] };
  // Outside the repository, removed afterwards: the check writes nothing in it.
  const tmp = mkdtempSync(join(tmpdir(), 'governance-check-'));
  try {
    const config = join(tmp, 'commitlint.config.mjs');
    writeFileSync(config, `export default ${JSON.stringify({ extends: [conventional], rules })};\n`);
    const run = spawnSync(process.execPath, [cli, '--config', config, '--from', from, '--to', 'HEAD'], {
      cwd: root,
      stdio: 'inherit',
    });
    return run.status ?? 1;
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
}

const CHECKS = { 'ADR-0006': commits };

function main(argv, root = process.cwd()) {
  try {
    const [number, ...rest] = argv;
    let from = 'origin/HEAD';
    for (let i = 0; i < rest.length; i++) {
      if (rest[i] === '--from' && rest[i + 1]) from = rest[++i];
      else throw new CheckError(`unknown argument: ${rest[i]}`);
    }
    if (!number) throw new CheckError('usage: governance-check <ADR number> [--from <ref>]');
    const check = CHECKS[number];
    if (!check) throw new CheckError(`governance ships no check for ${number}`);
    return check(root, findAdr(root, number), { from });
  } catch (e) {
    if (!(e instanceof CheckError)) throw e;
    console.error(e.message);
    return 1;
  }
}

process.exitCode = main(process.argv.slice(2));
