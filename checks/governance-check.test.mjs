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
