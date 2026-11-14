import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, symlinkSync, readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { tmpdir } from 'node:os';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { privateKey, keyLine, onPath, barePath } from './test-helpers.ts';

const here = dirname(fileURLToPath(import.meta.url));
const script = join(here, 'governance-check.ts');
const modules = join(here, '..', 'node_modules');

// Path -> content, for ADRs and committed files alike.
type Files = Record<string, string>;

function git(cwd: string, ...args: string[]): string {
  const r = spawnSync('git', args, { cwd, encoding: 'utf8' });
  assert.equal(r.status, 0, r.stderr);
  return r.stdout;
}

// A throwaway repository with a ruled ADR-0006, a base commit at origin/HEAD,
// then `messages` committed on top. `traits` is the raw `commits:` block body.
function repo({ traits, messages = [], withCommitlint = true }: { traits: string; messages?: string[]; withCommitlint?: boolean }) {
  const dir = mkdtempSync(join(tmpdir(), 'gc-test-'));
  git(dir, 'init', '-q', '-b', 'main');
  git(dir, 'config', 'user.email', 'test@example.invalid');
  git(dir, 'config', 'user.name', 'Test');
  git(dir, 'config', 'commit.gpgsign', 'false');
  mkdirSync(join(dir, 'docs', 'adr', 'trivoallan'), { recursive: true });
  writeFileSync(
    join(dir, 'docs', 'adr', 'trivoallan', 'ADR-0006-commits.md'),
    `---\nadr: ADR-0006\nstatus: accepted\ncheck: npx --no-install governance-check ADR-0006\ntraits:\n  commits:\n${traits}\n---\n\n# Commits\n`,
  );
  writeFileSync(join(dir, '.gitignore'), 'node_modules\n');
  if (withCommitlint) symlinkSync(modules, join(dir, 'node_modules'));
  git(dir, 'add', '.');
  git(dir, 'commit', '-q', '-m', 'chore: init');
  git(dir, 'update-ref', 'refs/remotes/origin/HEAD', 'HEAD');
  for (const m of messages) git(dir, 'commit', '-q', '--allow-empty', '-m', m);
  return dir;
}

function check(cwd: string, ...args: string[]) {
  return spawnSync(process.execPath, [script, 'ADR-0006', ...args], { cwd, encoding: 'utf8' });
}

const commitlint = (scopes: string) => `    scopes: ${scopes}\n    tool: commitlint`;

test('ADR missing', () => {
  const dir = mkdtempSync(join(tmpdir(), 'gc-test-'));
  const r = check(dir);
  assert.notEqual(r.status, 0);
  assert.match(r.stderr, /docs\/adr\/\*\/ADR-0006-\*\.md/);
});

test('no check for that ADR', () => {
  const dir = repo({ traits: '    tool: none' });
  const r = spawnSync(process.execPath, [script, 'ADR-0003'], { cwd: dir, encoding: 'utf8' });
  assert.notEqual(r.status, 0);
  assert.match(r.stderr, /governance ships no check for ADR-0003/);
});

test('not ruled', () => {
  const r = check(repo({ traits: '    scopes:\n    tool:' }));
  assert.notEqual(r.status, 0);
  assert.match(r.stderr, /commits\.tool is not set/);
});

for (const tool of ['none', 'hook']) {
  test(`tool is ${tool}`, () => {
    const r = check(repo({ traits: `    scopes: []\n    tool: ${tool} # a comment`, withCommitlint: false }));
    assert.equal(r.status, 0);
    assert.equal(r.stdout, `ADR-0006: commits.tool is ${tool}, nothing to check\n`);
  });
}

test('conforming commits', () => {
  const r = check(repo({ traits: commitlint('[api, docs]'), messages: ['feat(api): add x', 'docs: fix typo'] }));
  assert.equal(r.status, 0, r.stdout + r.stderr);
});

test('conforming commits, block list of scopes', () => {
  const r = check(repo({ traits: '    scopes:\n      - api\n      - "docs"\n    tool: commitlint', messages: ['fix(docs): y'] }));
  assert.equal(r.status, 0, r.stdout + r.stderr);
});

test('scope outside the list', () => {
  const r = check(repo({ traits: commitlint('[api, docs]'), messages: ['fix(backend): y'] }));
  assert.notEqual(r.status, 0);
  assert.match(r.stdout + r.stderr, /scope-enum/);
});

test('no scope allowed', () => {
  const r = check(repo({ traits: commitlint('[]'), messages: ['feat(api): x'] }));
  assert.notEqual(r.status, 0);
  assert.match(r.stdout + r.stderr, /scope-empty/);
});

test('other base', () => {
  const dir = repo({ traits: commitlint('[api]'), messages: ['fix(backend): old'] });
  git(dir, 'branch', 'develop');
  git(dir, 'commit', '-q', '--allow-empty', '-m', 'fix(api): new');
  assert.notEqual(check(dir).status, 0);
  assert.equal(check(dir, '--from', 'develop').status, 0);
});

test('commitlint not installed', () => {
  const r = check(repo({ traits: commitlint('[api]'), messages: ['fix(api): x'], withCommitlint: false }));
  assert.notEqual(r.status, 0);
  assert.match(r.stderr, /@commitlint\/(cli|config-conventional) is not installed/);
});

test('unknown tool', () => {
  const r = check(repo({ traits: '    scopes: []\n    tool: husky', withCommitlint: false }));
  assert.notEqual(r.status, 0);
  assert.match(r.stderr, /ADR-0006: commits\.tool has an unknown value: husky/);
});

test('one value where a list is expected', () => {
  const r = check(repo({ traits: commitlint('api'), withCommitlint: false }));
  assert.notEqual(r.status, 0);
  assert.match(r.stderr, /ADR-0006: commits\.scopes is not a list/);
});

// --- Arguments

test('arguments: option without its value', () => {
  const r = check(repo({ traits: '    tool: none' }), '--from');
  assert.notEqual(r.status, 0);
  assert.match(r.stderr, /--from/);
  assert.equal(r.stdout, '');
});

test('arguments: unknown option', () => {
  const r = check(repo({ traits: '    tool: none' }), '--form', 'develop');
  assert.notEqual(r.status, 0);
  assert.match(r.stderr, /--form/);
  assert.equal(r.stdout, '');
});

test('arguments: no ADR number gives the usage line', () => {
  const r = spawnSync(process.execPath, [script], { cwd: repo({ traits: '    tool: none' }), encoding: 'utf8' });
  assert.notEqual(r.status, 0);
  assert.match(r.stderr, /^usage: governance-check <ADR number>/m);
});

test('arguments: two ADR numbers give the usage line', () => {
  const r = check(repo({ traits: '    tool: none' }), 'ADR-0009');
  assert.notEqual(r.status, 0);
  assert.match(r.stderr, /^usage: governance-check <ADR number>/m);
});

test('repository left untouched', () => {
  const dir = repo({ traits: commitlint('[api]'), messages: ['fix(backend): x'] });
  const before = git(dir, 'status', '--porcelain', '--ignored');
  check(dir);
  assert.equal(git(dir, 'status', '--porcelain', '--ignored'), before);
});

// --- Wiring checks

// A throwaway repository holding ruled ADRs and committed files.
// `adrs` maps a file name under docs/adr/trivoallan/ to the raw body of its
// `traits:` block; `files` are committed, `untracked` are only written.
function wired({ adrs, files = {}, untracked = {} }: { adrs: Files; files?: Files; untracked?: Files }) {
  const dir = mkdtempSync(join(tmpdir(), 'gc-wiring-'));
  git(dir, 'init', '-q', '-b', 'main');
  git(dir, 'config', 'user.email', 'test@example.invalid');
  git(dir, 'config', 'user.name', 'Test');
  git(dir, 'config', 'commit.gpgsign', 'false');
  const write = (path: string, text: string) => {
    mkdirSync(dirname(join(dir, path)), { recursive: true });
    writeFileSync(join(dir, path), text);
  };
  for (const [name, traits] of Object.entries(adrs)) {
    write(`docs/adr/trivoallan/${name}`, `---\nadr: ${name.slice(0, 8)}\nstatus: accepted\ntraits:\n${traits}\n---\n\n# ADR\n`);
  }
  for (const [path, text] of Object.entries(files)) write(path, text);
  git(dir, 'add', '.');
  git(dir, 'commit', '-q', '-m', 'chore: init');
  for (const [path, text] of Object.entries(untracked)) write(path, text);
  return dir;
}

const run = (cwd: string, number: string) => spawnSync(process.execPath, [script, number], { cwd, encoding: 'utf8' });
const deps = (updater: string, automerge = 'none') =>
  ({ 'ADR-0018-dependencies.md': `  dependencies:\n    updater: ${updater}\n    automerge: ${automerge}` });
// The twelve arc42 sections under <root>architecture/arc42/, `mdx` of them as .mdx.
const arc42 = (root: string, skip = 0, mdx: number[] = []) => Object.fromEntries(
  Array.from({ length: 12 }, (_, i) => i + 1).filter((n) => n !== skip)
    .map((n) => [`${root}architecture/arc42/${String(n).padStart(2, '0')}-x.${mdx.includes(n) ? 'mdx' : 'md'}`, 'x\n']),
);

test('wiring: row passes', () => {
  const r = run(wired({
    adrs: deps('dependabot', 'patch'),
    files: { '.github/dependabot.yml': 'version: 2\n', '.github/workflows/automerge.yml': 'uses: dependabot/fetch-metadata@abc\n' },
  }), 'ADR-0018');
  assert.equal(r.status, 0, r.stdout + r.stderr);
  assert.match(r.stdout, /dependencies\.updater is dependabot, found \.github\/dependabot\.yml/);
  assert.match(r.stdout, /dependencies\.automerge is patch, found \.github\/workflows\/automerge\.yml/);
});

test('wiring: row fails and names what it looked for', () => {
  const r = run(wired({ adrs: deps('dependabot') }), 'ADR-0018');
  assert.notEqual(r.status, 0);
  assert.match(r.stderr, /\.github\/dependabot\.yml or \.github\/dependabot\.yaml/);
});

test('wiring: untracked file does not count', () => {
  const r = run(wired({ adrs: deps('dependabot'), untracked: { '.github/dependabot.yml': 'version: 2\n' } }), 'ADR-0018');
  assert.notEqual(r.status, 0);
});

test('wiring: every entry must match', () => {
  const r = run(wired({ adrs: { 'ADR-0010-architecture-documentation.md': '  architecture:\n    document: arc42\n    model: none\n    diagrams: mermaid' }, files: arc42('docs/', 7) }), 'ADR-0010');
  assert.notEqual(r.status, 0);
  assert.match(r.stderr, /docs\/architecture\/arc42\/07-\*\.md or docs\/architecture\/arc42\/07-\*\.mdx/);
  assert.doesNotMatch(r.stderr, /06-/);
});

test('wiring: value none passes even with a file present', () => {
  const r = run(wired({ adrs: deps('none'), files: { '.github/dependabot.yml': 'version: 2\n' } }), 'ADR-0018');
  assert.equal(r.status, 0, r.stderr);
  assert.match(r.stdout, /^ADR-0018: dependencies\.updater is none, nothing to check$/m);
});

test('wiring: unforeseen value passes', () => {
  const r = run(wired({ adrs: deps('foo') }), 'ADR-0018');
  assert.equal(r.status, 0, r.stderr);
  assert.match(r.stdout, /^ADR-0018: dependencies\.updater is foo, nothing to check$/m);
});

test('wiring: unforeseen value of the spec scenario passes', () => {
  const r = run(wired({ adrs: deps('something-else') }), 'ADR-0018');
  assert.equal(r.status, 0, r.stderr);
  assert.match(r.stdout, /^ADR-0018: dependencies\.updater is something-else, nothing to check$/m);
});

test('wiring: a list where one value is expected fails, every entry reported', () => {
  const r = run(wired({ adrs: { 'ADR-0012-delivery.md': '  delivery:\n    target: [container]\n    release_tool: none\n  deployment:\n    manifests:' } }), 'ADR-0012');
  assert.notEqual(r.status, 0);
  assert.match(r.stderr, /^ADR-0012: delivery\.target is not one value in /m);
  assert.match(r.stderr, /^ADR-0012: deployment\.manifests is not set/m);
  assert.match(r.stdout, /delivery\.release_tool is none, nothing to check/);
});

test('wiring: arc42 with a list as docs.root falls back to docs/', () => {
  const r = run(wired({
    adrs: {
      'ADR-0008-documentation.md': '  docs:\n    tool: none\n    root: [site/]\n    audience: public',
      'ADR-0010-architecture-documentation.md': '  architecture:\n    document: arc42\n    model: none\n    diagrams: mermaid',
    },
    files: arc42('docs/'),
  }), 'ADR-0010');
  assert.equal(r.status, 0, r.stderr);
  assert.match(r.stdout, /docs\/architecture\/arc42\/01-x\.md/);
});

test('wiring: trait not set', () => {
  const r = run(wired({ adrs: { 'ADR-0017-agent-tooling.md': '  agent:\n    host:' } }), 'ADR-0017');
  assert.notEqual(r.status, 0);
  assert.match(r.stderr, /agent\.host is not set/);
});

test('wiring: arc42 under another root', () => {
  const dir = wired({
    adrs: {
      'ADR-0008-documentation.md': '  docs:\n    tool: none\n    root: site/\n    audience: public',
      'ADR-0010-architecture-documentation.md': '  architecture:\n    document: arc42\n    model: none\n    diagrams: mermaid',
    },
    files: arc42('site/'),
  });
  const r = run(dir, 'ADR-0010');
  assert.equal(r.status, 0, r.stderr);
  assert.match(r.stdout, /site\/architecture\/arc42\/01-x\.md/);
});

test('wiring: gate states its ceiling', () => {
  const r = run(wired({ adrs: { 'ADR-0011-forge-and-ci.md': '  forge:\n    gate: blocking' }, files: { '.github/workflows/ci.yml': 'on: push\n' } }), 'ADR-0011');
  assert.equal(r.status, 0, r.stderr);
  assert.match(r.stdout, /ruleset .* is not verified/);
});

const delivery = (release: string, target: string, manifests: string) => ({
  'ADR-0012-delivery.md': `  delivery:\n    target: ${target}\n    environments: []\n    release_tool: ${release}\n    registry:\n  deployment:\n    manifests: ${manifests}`,
});

test('wiring: manifests elsewhere', () => {
  const r = run(wired({ adrs: delivery('manual', 'none', 'https://github.com/acme/deploy') }), 'ADR-0012');
  assert.equal(r.status, 0, r.stderr);
  assert.match(r.stdout, /deployment\.manifests is https:\/\/github\.com\/acme\/deploy, nothing to check/);
});

test('wiring: provenance step present', () => {
  const r = run(wired({
    adrs: { 'ADR-0021-build-provenance.md': '  supply_chain:\n    build_level: 2' },
    files: { '.github/workflows/release.yml': 'run: npm publish --provenance\n' },
  }), 'ADR-0021');
  assert.equal(r.status, 0, r.stderr);
});

test('wiring: several traits in one ADR', () => {
  const r = run(wired({ adrs: delivery('release-please', 'none', 'none') }), 'ADR-0012');
  assert.notEqual(r.status, 0);
  assert.match(r.stderr, /delivery\.release_tool is release-please, but/);
  assert.match(r.stdout, /delivery\.target is none, nothing to check/);
});

test('wiring: arc42 sections in mdx, as ontrack writes them', () => {
  const r = run(wired({ adrs: { 'ADR-0010-architecture-documentation.md': '  architecture:\n    document: arc42\n    model: none\n    diagrams: mermaid' }, files: arc42('docs/', 0, [3, 5, 7]) }), 'ADR-0010');
  assert.equal(r.status, 0, r.stderr);
});

test('wiring: arc42 files directly in architecture/ do not count', () => {
  const flat = Object.fromEntries(Object.entries(arc42('docs/')).map(([p, t]) => [p.replace('arc42/', ''), t]));
  const r = run(wired({ adrs: { 'ADR-0010-architecture-documentation.md': '  architecture:\n    document: arc42\n    model: none\n    diagrams: mermaid' }, files: flat }), 'ADR-0010');
  assert.notEqual(r.status, 0);
});

test('wiring: Starlight site in a subfolder, as ontrack has it', () => {
  const r = run(wired({
    adrs: { 'ADR-0008-documentation.md': '  docs:\n    tool: starlight\n    root: docs/\n    audience: public' },
    files: { 'package.json': '{"name":"x"}\n', 'site/package.json': '{"dependencies":{"@astrojs/starlight":"0.43.1"}}\n', 'docs/a.md': 'x\n' },
  }), 'ADR-0008');
  assert.equal(r.status, 0, r.stderr);
  assert.match(r.stdout, /docs\.tool is starlight, found site\/package\.json/);
});

// One passing case for each remaining row.
const rows: [string, Files, Files][] = [
  ['ADR-0008', { 'ADR-0008-documentation.md': '  docs:\n    tool: starlight\n    root: docs/\n    audience: public' },
    { 'package.json': '{"dependencies":{"@astrojs/starlight":"1"}}\n', 'docs/index.md': 'x\n' }],
  ['ADR-0008', { 'ADR-0008-documentation.md': '  docs:\n    tool: docusaurus\n    root: ./website\n    audience: team' },
    { 'website/docusaurus.config.ts': 'x\n', 'website/a.md': 'x\n' }],
  ['ADR-0008', { 'ADR-0008-documentation.md': '  docs:\n    tool: mkdocs\n    root: docs\n    audience: team' },
    { 'mkdocs.yml': 'x\n', 'docs/a.md': 'x\n' }],
  ['ADR-0010', { 'ADR-0010-architecture-documentation.md': '  architecture:\n    document: arc42\n    model: likec4\n    diagrams: mermaid' },
    { ...arc42('docs/'), 'docs/architecture/model/system.c4': 'x\n' }],
  ['ADR-0012', delivery('release-please', 'container', 'deploy/'),
    { '.github/workflows/release.yml': 'uses: googleapis/release-please-action@abc\n', 'app/Dockerfile': 'FROM x\n', 'deploy/k.yaml': 'x\n' }],
  ['ADR-0017', { 'ADR-0017-agent-tooling.md': '  agent:\n    host: claude-code' }, { '.claude/settings.json': '{}\n' }],
];
for (const [number, adrs, files] of rows) {
  test(`wiring: ${number} ${Object.values(adrs)[0].split('\n')[1].trim()} passes`, () => {
    const r = run(wired({ adrs, files }), number);
    assert.equal(r.status, 0, r.stdout + r.stderr);
    assert.doesNotMatch(r.stdout, /nothing to check/, 'every trait of this case has a row');
  });
}

test('wiring: renovate passes, its automerge has no row', () => {
  const r = run(wired({ adrs: deps('renovate', 'patch'), files: { '.github/renovate.json5': '{}\n' } }), 'ADR-0018');
  assert.equal(r.status, 0, r.stderr);
  assert.match(r.stdout, /dependencies\.updater is renovate, found \.github\/renovate\.json5/);
  assert.match(r.stdout, /dependencies\.automerge is patch, nothing to check/);
});

test('wiring: repository left untouched', () => {
  const dir = wired({ adrs: deps('dependabot'), untracked: { 'scratch.txt': 'x\n' } });
  const before = git(dir, 'status', '--porcelain', '--ignored');
  run(dir, 'ADR-0018');
  assert.equal(git(dir, 'status', '--porcelain', '--ignored'), before);
});

// --- Checks that run a tool

// A repository on `main` with ruled ADRs, `origin/HEAD -> origin/main` at the
// first commit, then `branch` checked out and `commits` ({ path: text } each) on it.
function branched({ adrs, files = {}, branch, commits = [] }: { adrs: Files; files?: Files; branch?: string; commits?: Files[] }) {
  const dir = wired({ adrs, files });
  git(dir, 'update-ref', 'refs/remotes/origin/main', 'HEAD');
  git(dir, 'symbolic-ref', 'refs/remotes/origin/HEAD', 'refs/remotes/origin/main');
  if (branch) git(dir, 'switch', '-q', '-c', branch);
  for (const c of commits) {
    for (const [path, text] of Object.entries(c)) {
      mkdirSync(dirname(join(dir, path)), { recursive: true });
      writeFileSync(join(dir, path), text);
    }
    git(dir, 'add', '.');
    git(dir, 'commit', '-q', '-m', 'chore: change');
  }
  return dir;
}

// A stand-in for `name` in the repository's node_modules/.bin: it logs its
// arguments to <dir>/.fake-<name>.log and exits with $FAKE_EXIT_<first argument>.
function stub(dir: string, name: string) {
  const bin = join(dir, 'node_modules', '.bin');
  mkdirSync(bin, { recursive: true });
  writeFileSync(join(bin, name), `#!/bin/sh\necho "$@" >> "${join(dir, `.fake-${name}.log`)}"\neval "exit \\\${FAKE_EXIT_$1:-0}"\n`, { mode: 0o755 });
  return () => readFileSync(join(dir, `.fake-${name}.log`), 'utf8');
}

// GITHUB_HEAD_REF cleared so a CI run of these tests does not leak into them.
const runWith = (cwd: string, args: string[], env: Record<string, string> = {}) =>
  spawnSync(process.execPath, [script, ...args], { cwd, encoding: 'utf8', env: { ...process.env, GITHUB_HEAD_REF: '', ...env } });

const branchingAdr = (prefixes: string) => ({ 'ADR-0009-branching.md': `  branching:\n    model: github-flow\n    merge: squash\n    prefixes: ${prefixes}` });
const secretsAdr = (guard: string) => ({ 'ADR-0015-secrets.md': `  secrets:\n    storage: keychain\n    guard: ${guard}` });
const changesAdr = (framework: string, schema: string) => ({ 'ADR-0016-changes.md': `  changes:\n    framework: ${framework}\n    schema: ${schema}` });

test('tool: installed in the repository is the one run', () => {
  const dir = branched({ adrs: secretsAdr('gitleaks'), branch: 'feat/x' });
  const log = stub(dir, 'gitleaks');
  const r = runWith(dir, ['ADR-0015'], { PATH: barePath });
  assert.equal(r.status, 0, r.stderr);
  assert.match(log(), /^git --log-opts=origin\/HEAD\.\.HEAD --redact --verbose --no-banner$/m);
});

test('tool: missing is named', () => {
  const r = runWith(branched({ adrs: secretsAdr('gitleaks') }), ['ADR-0015'], { PATH: barePath });
  assert.notEqual(r.status, 0);
  assert.match(r.stderr, /secrets\.guard is gitleaks, but gitleaks is not installed/);
});

// ADR-0009

test('ADR-0009: conforming branch', () => {
  const r = runWith(branched({ adrs: branchingAdr('[feat, fix, docs]'), branch: 'feat/schema-port' }), ['ADR-0009']);
  assert.equal(r.status, 0, r.stderr);
  assert.match(r.stdout, /branch feat\/schema-port matches/);
});

test('ADR-0009: prefix outside the list', () => {
  const r = runWith(branched({ adrs: branchingAdr('[feat, fix, docs]'), branch: 'chore/bump' }), ['ADR-0009']);
  assert.notEqual(r.status, 0);
  assert.match(r.stderr, /feat, fix, docs/);
});

test('ADR-0009: description not in kebab case', () => {
  const r = runWith(branched({ adrs: branchingAdr('[feat]'), branch: 'feat/Schema_Port' }), ['ADR-0009']);
  assert.notEqual(r.status, 0);
});

test('ADR-0009: block list of prefixes', () => {
  const r = runWith(branched({ adrs: branchingAdr('\n      - feat\n      - fix'), branch: 'fix/a-b-1' }), ['ADR-0009']);
  assert.equal(r.status, 0, r.stderr);
});

test('ADR-0009: pull request in CI', () => {
  const dir = branched({ adrs: branchingAdr('[fix]') });
  git(dir, 'switch', '-q', '--detach');
  const r = runWith(dir, ['ADR-0009'], { GITHUB_HEAD_REF: 'fix/dead-link' });
  assert.equal(r.status, 0, r.stderr);
  assert.match(r.stdout, /fix\/dead-link/);
});

test('ADR-0009: detached with no name has nothing to check', () => {
  const dir = branched({ adrs: branchingAdr('[fix]') });
  git(dir, 'switch', '-q', '--detach');
  const r = runWith(dir, ['ADR-0009']);
  assert.equal(r.status, 0, r.stderr);
  assert.match(r.stdout, /nothing to check/);
});

test('ADR-0009: explicit branch wins', () => {
  const r = runWith(branched({ adrs: branchingAdr('[docs]'), branch: 'chore/x' }), ['ADR-0009', '--branch', 'docs/readme'], { GITHUB_HEAD_REF: 'chore/y' });
  assert.equal(r.status, 0, r.stderr);
  assert.match(r.stdout, /docs\/readme/);
});

test('ADR-0009: default branch', () => {
  const r = runWith(branched({ adrs: branchingAdr('[feat]') }), ['ADR-0009']);
  assert.equal(r.status, 0, r.stderr);
  assert.equal(r.stdout, 'ADR-0009: main is the default branch, nothing to check\n');
});

test('ADR-0009: default branch without origin/HEAD', () => {
  const dir = wired({ adrs: branchingAdr('[feat]') });
  git(dir, 'branch', '-m', 'master');
  const r = runWith(dir, ['ADR-0009']);
  assert.equal(r.status, 0, r.stderr);
  assert.match(r.stdout, /master is the default branch/);
});

test('ADR-0009: prefixes not set', () => {
  const r = runWith(branched({ adrs: branchingAdr(''), branch: 'feat/x' }), ['ADR-0009']);
  assert.notEqual(r.status, 0);
  assert.match(r.stderr, /branching\.prefixes is not set/);
});

// ADR-0015

test('ADR-0015: gitleaks status passed through, --from honoured', () => {
  const dir = branched({ adrs: secretsAdr('gitleaks'), branch: 'feat/x' });
  const log = stub(dir, 'gitleaks');
  const r = runWith(dir, ['ADR-0015', '--from', 'develop'], { FAKE_EXIT_git: '1' });
  assert.equal(r.status, 1);
  assert.match(log(), /--log-opts=develop\.\.HEAD/);
});

test('ADR-0015: guard none', () => {
  const r = runWith(branched({ adrs: secretsAdr('none') }), ['ADR-0015'], { PATH: barePath });
  assert.equal(r.status, 0, r.stderr);
  assert.equal(r.stdout, 'ADR-0015: secrets.guard is none, nothing to check\n');
});

test('ADR-0015: guard not set', () => {
  const r = runWith(branched({ adrs: secretsAdr('') }), ['ADR-0015']);
  assert.notEqual(r.status, 0);
  assert.match(r.stderr, /secrets\.guard is not set/);
});

test('ADR-0015: a list where one value is expected', () => {
  const dir = branched({ adrs: secretsAdr('[gitleaks]') });
  const r = runWith(dir, ['ADR-0015'], { PATH: barePath });
  assert.notEqual(r.status, 0);
  assert.match(r.stderr, /^ADR-0015: secrets\.guard is not one value in /m);
  assert.doesNotMatch(r.stdout + r.stderr, /nothing to check|not installed/);
});

test('ADR-0016: a list where one value is expected', () => {
  const r = runWith(branched({ adrs: changesAdr('openspec', '[spec-driven]') }), ['ADR-0016'], { PATH: barePath });
  assert.notEqual(r.status, 0);
  assert.match(r.stderr, /^ADR-0016: changes\.schema is not one value in /m);
});

test('ADR-0009: one value where a list is expected', () => {
  const r = runWith(branched({ adrs: branchingAdr('feat'), branch: 'feat/x' }), ['ADR-0009']);
  assert.notEqual(r.status, 0);
  assert.match(r.stderr, /ADR-0009: branching\.prefixes is not a list/);
});

const realGitleaks = { skip: !onPath('gitleaks') && 'gitleaks not on PATH' };

test('ADR-0015 with gitleaks: no leak', realGitleaks, () => {
  const r = runWith(branched({ adrs: secretsAdr('gitleaks'), branch: 'feat/x', commits: [{ 'a.txt': 'hello\n' }] }), ['ADR-0015']);
  assert.equal(r.status, 0, r.stdout + r.stderr);
});

test('ADR-0015 with gitleaks: leak in a branch commit, redacted', realGitleaks, () => {
  const key = privateKey();
  const r = runWith(branched({ adrs: secretsAdr('gitleaks'), branch: 'feat/x', commits: [{ id_rsa: key }] }), ['ADR-0015']);
  assert.notEqual(r.status, 0);
  assert.doesNotMatch(r.stdout + r.stderr, keyLine(key));
});

test('ADR-0015 with gitleaks: leak before the base', realGitleaks, () => {
  const r = runWith(branched({ adrs: secretsAdr('gitleaks'), files: { id_rsa: privateKey() }, branch: 'feat/x', commits: [{ 'a.txt': 'hello\n' }] }), ['ADR-0015']);
  assert.equal(r.status, 0, r.stdout + r.stderr);
});

// ADR-0016

const openspecFiles = (schema: string) => ({ 'openspec/config.yaml': `schema: ${schema} # comment\n`, 'openspec/specs/.keep': '' });

test('ADR-0016: ruled schema in use, both commands run', () => {
  const dir = branched({ adrs: changesAdr('openspec', 'spec-driven'), files: openspecFiles('spec-driven') });
  const log = stub(dir, 'openspec');
  const r = runWith(dir, ['ADR-0016']);
  assert.equal(r.status, 0, r.stderr);
  assert.equal(log(), 'schema validate spec-driven\nvalidate --all --no-interactive\n');
});

test('ADR-0016: config names another schema', () => {
  const dir = branched({ adrs: changesAdr('openspec', 'spec-driven-with-adr'), files: openspecFiles('spec-driven') });
  const log = stub(dir, 'openspec');
  const r = runWith(dir, ['ADR-0016']);
  assert.notEqual(r.status, 0);
  assert.match(r.stderr, /spec-driven-with-adr, but openspec\/config\.yaml has schema: spec-driven$/m);
  assert.match(log(), /validate --all/, 'the openspec commands still run');
});

test('ADR-0016: no config file', () => {
  const dir = branched({ adrs: changesAdr('openspec', 'spec-driven') });
  stub(dir, 'openspec');
  const r = runWith(dir, ['ADR-0016']);
  assert.notEqual(r.status, 0);
  assert.match(r.stderr, /there is no openspec\/config\.yaml/);
});

test('ADR-0016: invalid change', () => {
  const dir = branched({ adrs: changesAdr('openspec', 'spec-driven'), files: openspecFiles('spec-driven') });
  stub(dir, 'openspec');
  assert.notEqual(runWith(dir, ['ADR-0016'], { FAKE_EXIT_validate: '1' }).status, 0);
  assert.notEqual(runWith(dir, ['ADR-0016'], { FAKE_EXIT_schema: '1' }).status, 0);
});

test('ADR-0016: framework none', () => {
  const r = runWith(branched({ adrs: changesAdr('none', 'none') }), ['ADR-0016'], { PATH: barePath });
  assert.equal(r.status, 0, r.stderr);
  assert.equal(r.stdout, 'ADR-0016: changes.framework is none, nothing to check\n');
});

test('ADR-0016: schema none with openspec', () => {
  const r = runWith(branched({ adrs: changesAdr('openspec', 'none') }), ['ADR-0016']);
  assert.notEqual(r.status, 0);
  assert.match(r.stderr, /goes with changes\.framework: none/);
});

test('ADR-0016 with openspec: ruled schema in use and valid', { skip: !onPath('openspec') && 'openspec not on PATH' }, () => {
  const r = runWith(branched({ adrs: changesAdr('openspec', 'spec-driven'), files: openspecFiles('spec-driven') }), ['ADR-0016']);
  assert.equal(r.status, 0, r.stdout + r.stderr);
});

test('tool checks leave the repository untouched', () => {
  for (const [number, adrs, files] of [
    ['ADR-0009', branchingAdr('[feat]'), {}],
    ['ADR-0015', secretsAdr('gitleaks'), {}],
    ['ADR-0016', changesAdr('openspec', 'spec-driven'), openspecFiles('spec-driven')],
  ] as [string, Files, Files][]) {
    const dir = branched({ adrs, files, branch: 'feat/x', commits: [{ 'a.txt': 'x\n' }] });
    const before = git(dir, 'status', '--porcelain', '--ignored');
    runWith(dir, [number]);
    assert.equal(git(dir, 'status', '--porcelain', '--ignored'), before, number);
  }
});
