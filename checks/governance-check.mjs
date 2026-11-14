#!/usr/bin/env node
// governance-check <ADR number> [--from <ref>] [--branch <name>]
// Runs the check governance ships for one ADR, from the consuming repository's
// root, as called by that ADR's `check:` line through `ontrack check`.
import { readFileSync, readdirSync, mkdtempSync, writeFileSync, rmSync, existsSync } from 'node:fs';
import { join, dirname, delimiter } from 'node:path';
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

// --- Wiring: a ruled trait implies files the repository tracks. Presence only.

// Tracked files only: wiring that was never committed is not wiring.
function tracked(root) {
  const r = spawnSync('git', ['ls-files', '-z'], { cwd: root, encoding: 'utf8' });
  if (r.status !== 0) throw new CheckError(`git ls-files failed in ${root}: ${r.stderr.trim()}`);
  return r.stdout.split('\0').filter(Boolean);
}

const esc = (s) => s.replace(/[.+?^${}()|[\]\\]/g, '\\$&');

// `*` matches within one path segment, a leading `**/` any directory or none.
// ponytail: only the two forms the table uses, not full glob syntax.
function pattern(p) {
  const any = p.startsWith('**/');
  const body = (any ? p.slice(3) : p)
    .split('*')
    .map(esc)
    .join('[^/]*');
  return new RegExp(`^${any ? '(?:.*/)?' : ''}${body}$`);
}

const matching = (files, alts) => {
  const res = alts.map(pattern);
  return files.filter((f) => res.some((r) => r.test(f)));
};

// A relative path as a prefix of tracked paths: `./docs` -> `docs/`, `.` -> ``.
const prefix = (p) => {
  const d = p.replace(/^\.\/?/, '').replace(/\/+$/, '');
  return d ? `${d}/` : '';
};

function holds(root, file, strings) {
  try {
    const text = readFileSync(join(root, file), 'utf8');
    return strings.some((s) => text.includes(s));
  } catch {
    return false; // tracked but deleted from the working tree
  }
}

// { found } or { fail }, for one row against the tracked files.
function evaluate(row, files, root) {
  if (row.exists) {
    const found = [];
    const missing = [];
    for (const alts of row.exists) {
      const hit = matching(files, alts)[0];
      if (hit) found.push(hit);
      else missing.push(alts.join(' or '));
    }
    return missing.length ? { fail: `no tracked file matches ${missing.join('; ')}` } : { found: found.join(', ') };
  }
  if (row.contains) {
    const { in: where, any } = row.contains;
    const hit = matching(files, where).find((f) => holds(root, f, any));
    return hit ? { found: hit } : { fail: `no tracked file matching ${where.join(' or ')} holds ${any.join(' or ')}` };
  }
  const dir = prefix(row.path);
  const hit = files.find((f) => f.startsWith(dir));
  return hit ? { found: hit } : { fail: `no tracked file under ${dir || './'}` };
}

const WORKFLOWS = ['.github/workflows/*.yml', '.github/workflows/*.yaml'];
const inWorkflow = (...any) => ({ contains: { in: WORKFLOWS, any } });
const byValue = (rows) => (value) => rows[value] ?? null;

// ADR-0010's arc42 files live under ADR-0008's docs.root, `docs/` by default.
function docsRoot(root) {
  try {
    const value = readTraits(readFileSync(findAdr(root, 'ADR-0008'), 'utf8'), 'docs')?.root;
    return typeof value === 'string' && value ? prefix(value) : 'docs/';
  } catch (e) {
    if (e instanceof CheckError) return 'docs/';
    throw e;
  }
}

const gate = { exists: [WORKFLOWS], note: 'the ruleset that makes the pipeline required is not verified' };

// ADR number -> traits it wires. `row(value, ctx)` returns a row, or null for
// "nothing to check". ctx: { root, traits: { <group>: { <key>: value } } }.
const WIRING = {
  'ADR-0008': [
    { group: 'docs', key: 'tool', row: byValue({
      starlight: { contains: { in: ['package.json'], any: ['@astrojs/starlight'] } },
      docusaurus: { exists: [['docusaurus.config.js', 'docusaurus.config.mjs', 'docusaurus.config.ts']] },
      mkdocs: { exists: [['mkdocs.yml']] },
    }) },
    { group: 'docs', key: 'root', row: (v) => ({ path: v }) },
  ],
  'ADR-0010': [
    { group: 'architecture', key: 'document', row: (v, { root }) => v === 'arc42'
      ? { exists: Array.from({ length: 12 }, (_, i) => [`${docsRoot(root)}architecture/${String(i + 1).padStart(2, '0')}-*.md`]) }
      : null },
    { group: 'architecture', key: 'model', row: byValue({ likec4: { exists: [['**/*.c4', '**/*.likec4']] } }) },
  ],
  'ADR-0011': [
    { group: 'forge', key: 'gate', row: byValue({ blocking: gate, informative: gate }) },
  ],
  'ADR-0012': [
    { group: 'delivery', key: 'release_tool', row: byValue({ 'release-please': inWorkflow('googleapis/release-please-action') }) },
    { group: 'delivery', key: 'target', row: byValue({ container: { exists: [['**/Dockerfile', '**/Containerfile']] } }) },
    { group: 'deployment', key: 'manifests', row: (v) => (v === 'none' || v.includes('://') ? null : { path: v }) },
  ],
  'ADR-0017': [
    { group: 'agent', key: 'host', row: byValue({ 'claude-code': { exists: [['.claude/settings.json']] } }) },
  ],
  'ADR-0018': [
    { group: 'dependencies', key: 'updater', row: byValue({
      dependabot: { exists: [['.github/dependabot.yml', '.github/dependabot.yaml']] },
      renovate: { exists: [['renovate.json', 'renovate.json5', '.renovaterc', '.renovaterc.json', '.github/renovate.json', '.github/renovate.json5']] },
    }) },
    // ponytail: no row with renovate, whose automerge lives in its own config.
    { group: 'dependencies', key: 'automerge', row: (v, { traits }) =>
      (v === 'patch' || v === 'minor') && traits.dependencies.updater === 'dependabot'
        ? inWorkflow('dependabot/fetch-metadata')
        : null },
  ],
  'ADR-0021': [
    { group: 'supply_chain', key: 'build_level', row: (v) => (['1', '2', '3'].includes(v)
      ? inWorkflow('actions/attest-build-provenance', '--provenance', 'pypa/gh-action-pypi-publish')
      : null) },
  ],
};

function wiring(number, entries) {
  return (root, file) => {
    const text = readFileSync(file, 'utf8');
    const traits = {};
    for (const { group } of entries) traits[group] ??= readTraits(text, group) ?? {};
    let files;
    let failed = false;
    for (const { group, key, row } of entries) {
      const name = `${number}: ${group}.${key}`;
      const value = traits[group][key];
      if (!value) {
        console.error(`${name} is not set in ${file}; the ADR is not ruled`);
        failed = true;
        continue;
      }
      const r = row(String(value), { root, traits });
      if (!r) {
        console.log(`${name} is ${value}, nothing to check`);
        continue;
      }
      files ??= tracked(root);
      const result = evaluate(r, files, root);
      if (result.fail) {
        console.error(`${name} is ${value}, but ${result.fail}`);
        failed = true;
      } else {
        console.log(`${name} is ${value}, found ${result.found}${r.note ? `; ${r.note}` : ''}`);
      }
    }
    return failed ? 1 : 0;
  };
}

// --- Checks that run a tool on the branch, as ADR-0006 runs commitlint.

// The repository's own copy first, then PATH. Its report goes straight to our output.
function runTool(root, name, args, trait) {
  const PATH = [join(root, 'node_modules', '.bin'), process.env.PATH].join(delimiter);
  const r = spawnSync(name, args, { cwd: root, stdio: 'inherit', env: { ...process.env, PATH } });
  if (r.error?.code === 'ENOENT') throw new CheckError(`${trait}, but ${name} is not installed (looked in node_modules/.bin and on PATH)`);
  if (r.error) throw r.error;
  return r.status ?? 1;
}

const gitOut = (root, ...args) => {
  const r = spawnSync('git', args, { cwd: root, encoding: 'utf8' });
  return r.status === 0 ? r.stdout.trim() : '';
};

function branching(root, file, { branch }) {
  const { prefixes } = readTraits(readFileSync(file, 'utf8'), 'branching') ?? {};
  if (!Array.isArray(prefixes) || prefixes.length === 0) {
    throw new CheckError(`ADR-0009: branching.prefixes is not set in ${file}; the ADR is not ruled`);
  }
  // A pull request in GitHub Actions checks out a detached HEAD; its branch is in GITHUB_HEAD_REF.
  const name = branch || process.env.GITHUB_HEAD_REF || gitOut(root, 'branch', '--show-current');
  if (!name) {
    console.log('ADR-0009: no branch name (detached checkout), nothing to check');
    return 0;
  }
  const head = gitOut(root, 'symbolic-ref', '--short', 'refs/remotes/origin/HEAD');
  // ponytail: main/master guess when origin/HEAD is unset; `git remote set-head origin -a` sets it.
  const defaults = head ? [head.slice(head.indexOf('/') + 1)] : ['main', 'master'];
  if (defaults.includes(name)) {
    console.log(`ADR-0009: ${name} is the default branch, nothing to check`);
    return 0;
  }
  const form = new RegExp(`^(?:${prefixes.map(esc).join('|')})/[a-z0-9]+(?:-[a-z0-9]+)*$`);
  if (form.test(name)) {
    console.log(`ADR-0009: branch ${name} matches branching.prefixes`);
    return 0;
  }
  console.error(`ADR-0009: branch ${name} is not <prefix>/<kebab-case-description> with a prefix in branching.prefixes: ${prefixes.join(', ')}`);
  return 1;
}

function secrets(root, file, { from }) {
  const { guard } = readTraits(readFileSync(file, 'utf8'), 'secrets') ?? {};
  if (!guard) throw new CheckError(`ADR-0015: secrets.guard is not set in ${file}; the ADR is not ruled`);
  if (guard !== 'gitleaks') {
    console.log(`ADR-0015: secrets.guard is ${guard}, nothing to check`);
    return 0;
  }
  return runTool(root, 'gitleaks', ['git', `--log-opts=${from}..HEAD`, '--redact', '--verbose', '--no-banner'], 'ADR-0015: secrets.guard is gitleaks');
}

function changes(root, file) {
  const { framework, schema } = readTraits(readFileSync(file, 'utf8'), 'changes') ?? {};
  if (!framework) throw new CheckError(`ADR-0016: changes.framework is not set in ${file}; the ADR is not ruled`);
  if (framework !== 'openspec') {
    console.log(`ADR-0016: changes.framework is ${framework}, nothing to check`);
    return 0;
  }
  if (!schema) throw new CheckError(`ADR-0016: changes.schema is not set in ${file}; the ADR is not ruled`);
  if (schema === 'none') throw new CheckError('ADR-0016: changes.schema is none, which goes with changes.framework: none, not openspec');

  let failed = false;
  const config = ['openspec/config.yaml', 'openspec/config.yml'].find((p) => existsSync(join(root, p)));
  const line = config && readFileSync(join(root, config), 'utf8').split(/\r?\n/).map((l) => l.match(/^schema:(.*)$/)).find(Boolean);
  const used = line ? scalar(line[1]) : '';
  if (used === schema) {
    console.log(`ADR-0016: ${config} uses schema ${schema}`);
  } else {
    console.error(config
      ? `ADR-0016: changes.schema is ${schema}, but ${config} has schema: ${used || '(none)'}`
      : `ADR-0016: changes.schema is ${schema}, but there is no openspec/config.yaml`);
    failed = true;
  }
  // Both commands run whatever the config says, so one run shows every problem.
  const trait = 'ADR-0016: changes.framework is openspec';
  if (runTool(root, 'openspec', ['schema', 'validate', schema], trait) !== 0) failed = true;
  if (runTool(root, 'openspec', ['validate', '--all', '--no-interactive'], trait) !== 0) failed = true;
  return failed ? 1 : 0;
}

const CHECKS = {
  'ADR-0006': commits,
  'ADR-0009': branching,
  'ADR-0015': secrets,
  'ADR-0016': changes,
  ...Object.fromEntries(Object.entries(WIRING).map(([n, entries]) => [n, wiring(n, entries)])),
};

function main(argv, root = process.cwd()) {
  try {
    const [number, ...rest] = argv;
    const opts = { from: 'origin/HEAD', branch: '' };
    for (let i = 0; i < rest.length; i++) {
      if (rest[i] === '--from' && rest[i + 1]) opts.from = rest[++i];
      else if (rest[i] === '--branch' && rest[i + 1]) opts.branch = rest[++i];
      else throw new CheckError(`unknown argument: ${rest[i]}`);
    }
    if (!number) throw new CheckError('usage: governance-check <ADR number> [--from <ref>] [--branch <name>]');
    const check = CHECKS[number];
    if (!check) throw new CheckError(`governance ships no check for ${number}`);
    return check(root, findAdr(root, number), opts);
  } catch (e) {
    if (!(e instanceof CheckError)) throw e;
    console.error(e.message);
    return 1;
  }
}

process.exitCode = main(process.argv.slice(2));
