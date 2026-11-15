#!/usr/bin/env node
// governance-check <ADR number> [--from <ref>] [--branch <name>]
// Runs the check governance ships for one ADR, from the consuming repository's
// root, as called by that ADR's `check:` line through `ontrack check`.
import { readFileSync, readdirSync, mkdtempSync, writeFileSync, rmSync, existsSync } from 'node:fs';
import { join, dirname, delimiter } from 'node:path';
import { tmpdir } from 'node:os';
import { createRequire } from 'node:module';
import { spawnSync } from 'node:child_process';
import { parseArgs } from 'node:util';
import { z } from 'zod';

class CheckError extends Error {}

// A trait value as readTraits returns it, before a schema has looked at it.
type Trait = string | string[];
type Traits = Record<string, Trait>;
type Check = (root: string, file: string, opts: Options) => number;

// The single repository copy of an ADR, under a namespace directory.
function findAdr(root: string, number: string): string {
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
function scalar(raw: string): string {
  let v = raw.replace(/\s+#.*$/, '').trim();
  if (v.length >= 2 && (v[0] === '"' || v[0] === "'") && v.at(-1) === v[0]) v = v.slice(1, -1);
  return v;
}

// The keys of `traits.<group>` in the frontmatter, read line by line, no YAML parser.
// A value is a string, a list (flow `[a, b]` or block `- a`), or '' when empty.
// ponytail: handles the shapes governance ADRs use, not arbitrary YAML.
function readTraits(text: string, group: string): Traits | null {
  const lines = text.split(/\r?\n/);
  const end = lines[0] === '---' ? lines.indexOf('---', 1) : -1;
  if (end === -1) return null;
  const front = lines.slice(1, end);
  const t = front.indexOf('traits:');
  if (t === -1) return null;
  const g = front.findIndex((l, i) => i > t && l === `  ${group}:`);
  if (g === -1) return null;
  const traits: Traits = {};
  let current: string | null = null;
  for (const line of front.slice(g + 1)) {
    if (!line.startsWith('    ')) break;
    const item = line.match(/^\s{6,}-\s*(.*)$/);
    if (item && current) {
      if (!Array.isArray(traits[current])) traits[current] = [];
      (traits[current] as string[]).push(scalar(item[1]));
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

// --- Trait schemas (ADR-0005): each check declares the shape of the keys it reads.

// One value: a non-empty string, never a list. A list: strings, possibly none.
const one = () => z.string().min(1);
const list = () => z.array(z.string());

// The keys of `traits.<group>` validated against `schema`, or a CheckError whose
// message the adr-checks spec fixes for that kind of issue, naming <group>.<key>.
function traitsOf<S extends z.ZodObject>(schema: S, number: string, group: string, file: string, text: string): z.infer<S> {
  const raw: Traits = readTraits(text, group) ?? {};
  const parsed = schema.safeParse(raw);
  if (parsed.success) return parsed.data;
  const issue = parsed.error.issues[0];
  const key = String(issue.path[0]);
  const name = `${number}: ${group}.${key}`;
  const value = raw[key];
  if (value === undefined || value === '' || issue.code === 'too_small') {
    throw new CheckError(`${name} is not set in ${file}; the ADR is not ruled`);
  }
  if (issue.code === 'invalid_value') throw new CheckError(`${name} has an unknown value: ${value}`);
  if (issue.code === 'invalid_type' && issue.expected === 'array') throw new CheckError(`${name} is not a list in ${file}`);
  const expected = issue.code === 'invalid_type' && issue.expected === 'string' ? 'one value' : issue.message;
  throw new CheckError(`${name} is not ${expected} in ${file}`);
}

function resolveFrom(root: string, id: string): string {
  try {
    return createRequire(join(root, 'package.json')).resolve(id);
  } catch {
    throw new CheckError(`ADR-0006: commits.tool is commitlint, but ${id.replace(/\/package\.json$/, '')} is not installed in this repository`);
  }
}

// `scopes` is read only when commitlint runs.
const CommitsTool = z.object({ tool: z.enum(['commitlint', 'hook', 'none']) });
const CommitsScopes = z.object({ scopes: list() });

function commits(root: string, file: string, { from }: Options): number {
  const text = readFileSync(file, 'utf8');
  const { tool } = traitsOf(CommitsTool, 'ADR-0006', 'commits', file, text);
  if (tool === 'hook' || tool === 'none') {
    console.log(`ADR-0006: commits.tool is ${tool}, nothing to check`);
    return 0;
  }
  const { scopes } = traitsOf(CommitsScopes, 'ADR-0006', 'commits', file, text);

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
function tracked(root: string): string[] {
  const r = spawnSync('git', ['ls-files', '-z'], { cwd: root, encoding: 'utf8' });
  if (r.status !== 0) throw new CheckError(`git ls-files failed in ${root}: ${r.stderr.trim()}`);
  return r.stdout.split('\0').filter(Boolean);
}

const esc = (s: string) => s.replace(/[.+?^${}()|[\]\\]/g, '\\$&');

// `*` matches within one path segment, `**/` any folders or none.
// ponytail: only the two forms the table uses, not full glob syntax.
function pattern(p: string): RegExp {
  const segment = (part: string) => part.split('*').map(esc).join('[^/]*');
  return new RegExp(`^${p.split('**/').map(segment).join('(?:.*/)?')}$`);
}

const matching = (files: string[], alts: string[]) => {
  const res = alts.map(pattern);
  return files.filter((f) => res.some((r) => r.test(f)));
};

// A relative path as a prefix of tracked paths: `./docs` -> `docs/`, `.` -> ``.
const prefix = (p: string) => {
  const d = p.replace(/^\.\/?/, '').replace(/\/+$/, '');
  return d ? `${d}/` : '';
};

function holds(root: string, file: string, strings: string[]): boolean {
  try {
    const text = readFileSync(join(root, file), 'utf8');
    return strings.some((s) => text.includes(s));
  } catch {
    return false; // tracked but deleted from the working tree
  }
}

// What a row looks for: files matching each list of alternatives, a file
// holding one of some strings, a file holding one string from each list, or
// any file under a path.
type Row = { note?: string } & (
  | { exists: string[][] }
  | { contains: { in: string[]; any: string[] } }
  | { containsAll: { in: string[]; all: string[][] } }
  | { path: string }
);
// ctx.traits holds the entries of the ADR validated so far: { <group>: { <key>: value } }.
type Entry = { group: string; key: string; row: (value: string, ctx: { root: string; traits: Record<string, Record<string, string>> }) => Row | null };

// { found } or { fail }, for one row against the tracked files.
function evaluate(row: Row, files: string[], root: string): { found?: string; fail?: string } {
  if ('exists' in row) {
    const found = [];
    const missing = [];
    for (const alts of row.exists) {
      const hit = matching(files, alts)[0];
      if (hit) found.push(hit);
      else missing.push(alts.join(' or '));
    }
    return missing.length ? { fail: `no tracked file matches ${missing.join('; ')}` } : { found: found.join(', ') };
  }
  if ('contains' in row) {
    const { in: where, any } = row.contains;
    const hit = matching(files, where).find((f) => holds(root, f, any));
    return hit ? { found: hit } : { fail: `no tracked file matching ${where.join(' or ')} holds ${any.join(' or ')}` };
  }
  if ('containsAll' in row) {
    const { in: where, all } = row.containsAll;
    const hit = matching(files, where).find((f) => all.every((any) => holds(root, f, any)));
    return hit ? { found: hit } : { fail: `no tracked file matching ${where.join(' or ')} holds ${all.map((any) => any.join(' or ')).join(', and ')}` };
  }
  const dir = prefix(row.path);
  const hit = files.find((f) => f.startsWith(dir));
  return hit ? { found: hit } : { fail: `no tracked file under ${dir || './'}` };
}

const WORKFLOWS = ['.github/workflows/*.yml', '.github/workflows/*.yaml'];
const inWorkflow = (...any: string[]): Row => ({ contains: { in: WORKFLOWS, any } });
const byValue = (rows: Record<string, Row>) => (value: string) => rows[value] ?? null;

const gate: Row = { exists: [WORKFLOWS], note: 'the ruleset that makes the pipeline required is not verified' };

// ADR number -> traits it wires. `row(value, ctx)` returns a row, or null for
// "nothing to check". ctx: { root, traits: { <group>: { <key>: validated value } } }.
const WIRING: Record<string, Entry[]> = {
  'ADR-0008': [
    { group: 'docs', key: 'tool', row: byValue({
      starlight: { contains: { in: ['**/package.json'], any: ['@astrojs/starlight'] } },
      docusaurus: { exists: [['**/docusaurus.config.js', '**/docusaurus.config.mjs', '**/docusaurus.config.ts']] },
      mkdocs: { exists: [['**/mkdocs.yml']] },
    }) },
    { group: 'docs', key: 'root', row: (v) => ({ path: v }) },
  ],
  'ADR-0010': [
    // Fixed path: ADR-0010 revision 2, the architecture document does not move with docs.root.
    { group: 'architecture', key: 'document', row: (v) => v === 'arc42'
      ? { exists: Array.from({ length: 12 }, (_, i) => {
        const section = `docs/architecture/arc42/${String(i + 1).padStart(2, '0')}-*`;
        return [`${section}.md`, `${section}.mdx`];
      }) }
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
      (v === 'patch' || v === 'minor') && traits.dependencies?.updater === 'dependabot'
        ? inWorkflow('dependabot/fetch-metadata')
        : null },
  ],
  'ADR-0021': [
    { group: 'supply_chain', key: 'build_level', row: (v) => (['1', '2', '3'].includes(v)
      ? inWorkflow('actions/attest-build-provenance', '--provenance', 'pypa/gh-action-pypi-publish')
      : null) },
  ],
  'ADR-0024': [
    // CodeQL's analyze step uploads its own SARIF. Any other tool: its name and its SARIF's
    // destination in one workflow, so Grype's upload-sarif alone does not count.
    { group: 'code_scanning', key: 'tool', row: (v) => {
      if (v === 'none') return null;
      if (v === 'codeql') return inWorkflow('github/codeql-action/analyze');
      return { containsAll: { in: WORKFLOWS, all: [[v], ['github/codeql-action/upload-sarif', 'actions/upload-artifact']] } };
    } },
    // The threshold lives in the ruleset and the workflow's settings: validated, not wired.
    { group: 'code_scanning', key: 'fail_on', row: () => null },
  ],
};

function wiring(number: string, entries: Entry[]): Check {
  return (root, file) => {
    const text = readFileSync(file, 'utf8');
    const traits: Record<string, Record<string, string>> = {};
    let files: string[] | undefined;
    let failed = false;
    for (const { group, key, row } of entries) {
      const name = `${number}: ${group}.${key}`;
      // Every entry is validated, so one run reports every key at fault.
      let value: string;
      try {
        value = traitsOf(z.object({ [key]: one() }), number, group, file, text)[key];
      } catch (e) {
        if (!(e instanceof CheckError)) throw e;
        console.error(e.message);
        failed = true;
        continue;
      }
      (traits[group] ??= {})[key] = value;
      const r = row(value, { root, traits });
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
function runTool(root: string, name: string, args: string[], trait: string): number {
  const PATH = [join(root, 'node_modules', '.bin'), process.env.PATH].join(delimiter);
  const r = spawnSync(name, args, { cwd: root, stdio: 'inherit', env: { ...process.env, PATH } });
  if ((r.error as NodeJS.ErrnoException | undefined)?.code === 'ENOENT') throw new CheckError(`${trait}, but ${name} is not installed (looked in node_modules/.bin and on PATH)`);
  if (r.error) throw r.error;
  return r.status ?? 1;
}

const gitOut = (root: string, ...args: string[]) => {
  const r = spawnSync('git', args, { cwd: root, encoding: 'utf8' });
  return r.status === 0 ? r.stdout.trim() : '';
};

const Branching = z.object({ prefixes: list().min(1) });

// Branches opened by the release and update tools (ADR-0012, ADR-0018): their names are
// the tool's, not the repository's. Not a trait: the list follows from those ADRs'
// answers, and an unanswered ADR (missing, empty key, other tool) exempts nothing.
const TOOLS: [adr: string, group: string, key: string, prefixes: Record<string, string>][] = [
  ['ADR-0012', 'delivery', 'release_tool', { 'release-please': 'release-please--', 'releaser-pleaser': 'releaser-pleaser--' }],
  ['ADR-0018', 'dependencies', 'updater', { dependabot: 'dependabot/', renovate: 'renovate/' }],
];

// What ADR `adr` answers for `key`; `found` is false when no file matches (several files still throw).
function toolAnswer(root: string, adr: string, group: string, key: string): { found: boolean; value?: unknown } {
  let file: string;
  try {
    file = findAdr(root, adr);
  } catch (e) {
    if (e instanceof CheckError && /no file matches/.test(e.message)) return { found: false };
    throw e;
  }
  return { found: true, value: readTraits(readFileSync(file, 'utf8'), group)?.[key] };
}

function branching(root: string, file: string, { branch }: Options): number {
  const { prefixes } = traitsOf(Branching, 'ADR-0009', 'branching', file, readFileSync(file, 'utf8'));
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
  // Only a name opened by a known tool reads ADR-0012 and ADR-0018.
  const row = TOOLS.find(([, , , prefixes]) => Object.values(prefixes).some((p) => name.startsWith(p)));
  let hint = '';
  if (row) {
    const [adr, group, key, toolPrefixes] = row;
    const [tool, prefix] = Object.entries(toolPrefixes).find(([, p]) => name.startsWith(p)) ?? [];
    const { found, value } = toolAnswer(root, adr, group, key);
    if (typeof value === 'string' && Object.hasOwn(toolPrefixes, value) && toolPrefixes[value] === prefix) {
      console.log(`ADR-0009: ${name} is a tool branch (${adr} ${group}.${key}: ${value}), nothing to check`);
      return 0;
    }
    hint = found
      ? ` (not exempt: ${adr} ${group}.${key} is not ${tool})`
      : ` (not exempt: no ${adr} in docs/adr/*/ rules ${group}.${key})`;
  }
  const form = new RegExp(`^(?:${prefixes.map(esc).join('|')})/[a-z0-9]+(?:-[a-z0-9]+)*$`);
  if (form.test(name)) {
    console.log(`ADR-0009: branch ${name} matches branching.prefixes`);
    return 0;
  }
  console.error(`ADR-0009: branch ${name} is not <prefix>/<kebab-case-description> with a prefix in branching.prefixes: ${prefixes.join(', ')}${hint}`);
  return 1;
}

// An open value: an unforeseen guard has nothing to check.
const Secrets = z.object({ guard: one() });

function secrets(root: string, file: string, { from }: Options): number {
  const { guard } = traitsOf(Secrets, 'ADR-0015', 'secrets', file, readFileSync(file, 'utf8'));
  if (guard !== 'gitleaks') {
    console.log(`ADR-0015: secrets.guard is ${guard}, nothing to check`);
    return 0;
  }
  return runTool(root, 'gitleaks', ['git', `--log-opts=${from}..HEAD`, '--redact', '--verbose', '--no-banner'], 'ADR-0015: secrets.guard is gitleaks');
}

// Open values; `schema` is read only when the framework is openspec.
const ChangesFramework = z.object({ framework: one() });
const ChangesSchema = z.object({ schema: one() });

function changes(root: string, file: string): number {
  const text = readFileSync(file, 'utf8');
  const { framework } = traitsOf(ChangesFramework, 'ADR-0016', 'changes', file, text);
  if (framework !== 'openspec') {
    console.log(`ADR-0016: changes.framework is ${framework}, nothing to check`);
    return 0;
  }
  const { schema } = traitsOf(ChangesSchema, 'ADR-0016', 'changes', file, text);
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

// ADR-0022 reads ADR-0017: the deny list it looks for belongs to the agent host.
const Review = z.object({ merge_by: z.enum(['person', 'agent']) });
const SETTINGS = '.claude/settings.json';
const MERGE = 'Bash(gh pr merge';

function review(root: string, file: string): number {
  const { merge_by } = traitsOf(Review, 'ADR-0022', 'review', file, readFileSync(file, 'utf8'));
  const name = `ADR-0022: review.merge_by is ${merge_by}`;
  if (merge_by === 'agent') {
    console.log(`${name}, nothing to check`);
    return 0;
  }
  const host = toolAnswer(root, 'ADR-0017', 'agent', 'host');
  if (host.value !== 'claude-code') {
    const why = host.found ? `ADR-0017 agent.host is ${host.value || '(not set)'}` : 'ADR-0017 is not in this repository';
    console.log(`${name}, but ${why}, nothing to check`);
    return 0;
  }
  // Tracked only, as wiring rows: a deny never committed protects one machine.
  if (!tracked(root).includes(SETTINGS)) throw new CheckError(`${name}, but ${SETTINGS} is not tracked`);
  let deny: unknown;
  try {
    deny = JSON.parse(readFileSync(join(root, SETTINGS), 'utf8'))?.permissions?.deny;
  } catch {
    throw new CheckError(`${name}, but ${SETTINGS} is not valid JSON`);
  }
  // ponytail: prefix match, so an exact-command rule passes though it denies less; parse rules if that matters.
  const entry = Array.isArray(deny) ? deny.find((d) => typeof d === 'string' && d.startsWith(MERGE)) : undefined;
  if (!entry) throw new CheckError(`${name}, but ${SETTINGS} permissions.deny has no ${MERGE} entry`);
  console.log(`${name}, ${SETTINGS} denies ${entry}`);
  return 0;
}

const CHECKS: Record<string, Check> = {
  'ADR-0022': review,
  'ADR-0006': commits,
  'ADR-0009': branching,
  'ADR-0015': secrets,
  'ADR-0016': changes,
  ...Object.fromEntries(Object.entries(WIRING).map(([n, entries]) => [n, wiring(n, entries)])),
};

// --- Arguments (ADR-0005): parseArgs tokenizes, the schema validates and defaults.

const USAGE = 'usage: governance-check <ADR number> [--from <ref>] [--branch <name>]';
const Args = z.object({
  positionals: z.tuple([z.string().min(1)]),
  values: z.object({
    from: z.string().min(1).default('origin/HEAD'),
    branch: z.string().default(''),
  }),
});
type Options = z.infer<typeof Args>['values'];

function args(argv: string[]): { number: string; opts: Options } {
  let tokens;
  try {
    tokens = parseArgs({ args: argv, strict: true, allowPositionals: true, options: { from: { type: 'string' }, branch: { type: 'string' } } });
  } catch (e) {
    // An unknown option, or one without its value: Node's message names it.
    if ((e as NodeJS.ErrnoException).code?.startsWith('ERR_PARSE_ARGS')) throw new CheckError(`${(e as Error).message}\n${USAGE}`);
    throw e;
  }
  const parsed = Args.safeParse(tokens);
  if (!parsed.success) {
    const [where, option] = parsed.error.issues[0].path;
    throw new CheckError(where === 'values' ? `option '--${String(option)}' needs a value\n${USAGE}` : USAGE);
  }
  return { number: parsed.data.positionals[0], opts: parsed.data.values };
}

function main(argv: string[], root = process.cwd()): number {
  try {
    const { number, opts } = args(argv);
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
