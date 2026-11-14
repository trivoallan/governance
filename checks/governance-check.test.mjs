import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, symlinkSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { tmpdir } from 'node:os';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const script = join(here, 'governance-check.mjs');
const modules = join(here, '..', 'node_modules');

function git(cwd, ...args) {
  const r = spawnSync('git', args, { cwd, encoding: 'utf8' });
  assert.equal(r.status, 0, r.stderr);
  return r.stdout;
}

// A throwaway repository with a ruled ADR-0006, a base commit at origin/HEAD,
// then `messages` committed on top. `traits` is the raw `commits:` block body.
function repo({ traits, messages = [], withCommitlint = true }) {
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

function check(cwd, ...args) {
  return spawnSync(process.execPath, [script, 'ADR-0006', ...args], { cwd, encoding: 'utf8' });
}

const commitlint = (scopes) => `    scopes: ${scopes}\n    tool: commitlint`;

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
function wired({ adrs, files = {}, untracked = {} }) {
  const dir = mkdtempSync(join(tmpdir(), 'gc-wiring-'));
  git(dir, 'init', '-q', '-b', 'main');
  git(dir, 'config', 'user.email', 'test@example.invalid');
  git(dir, 'config', 'user.name', 'Test');
  git(dir, 'config', 'commit.gpgsign', 'false');
  const write = (path, text) => {
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

const run = (cwd, number) => spawnSync(process.execPath, [script, number], { cwd, encoding: 'utf8' });
const deps = (updater, automerge = 'none') =>
  ({ 'ADR-0018-dependencies.md': `  dependencies:\n    updater: ${updater}\n    automerge: ${automerge}` });
const arc42 = (root, skip = 0) => Object.fromEntries(
  Array.from({ length: 12 }, (_, i) => i + 1).filter((n) => n !== skip)
    .map((n) => [`${root}architecture/${String(n).padStart(2, '0')}-x.md`, 'x\n']),
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
  assert.match(r.stderr, /docs\/architecture\/07-\*\.md/);
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
  assert.match(r.stdout, /site\/architecture\/01-x\.md/);
});

test('wiring: gate states its ceiling', () => {
  const r = run(wired({ adrs: { 'ADR-0011-forge-and-ci.md': '  forge:\n    gate: blocking' }, files: { '.github/workflows/ci.yml': 'on: push\n' } }), 'ADR-0011');
  assert.equal(r.status, 0, r.stderr);
  assert.match(r.stdout, /ruleset .* is not verified/);
});

const delivery = (release, target, manifests) => ({
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

// One passing case for each remaining row.
const rows = [
  ['ADR-0008', { 'ADR-0008-documentation.md': '  docs:\n    tool: starlight\n    root: docs/\n    audience: public' },
    { 'package.json': '{"dependencies":{"@astrojs/starlight":"1"}}\n', 'docs/index.md': 'x\n' }],
  ['ADR-0008', { 'ADR-0008-documentation.md': '  docs:\n    tool: docusaurus\n    root: ./website\n    audience: team' },
    { 'docusaurus.config.ts': 'x\n', 'website/a.md': 'x\n' }],
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
