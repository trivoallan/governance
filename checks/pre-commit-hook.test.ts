// .githooks/pre-commit, the ADR-0015 secret guard, driven in throwaway
// repositories whose core.hooksPath points at this repository's .githooks.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { tmpdir } from 'node:os';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { privateKey, keyLine, onPath, barePath } from './test-helpers.ts';

const hooks = join(dirname(fileURLToPath(import.meta.url)), '..', '.githooks');

function git(cwd: string, args: string[], env: Record<string, string> = {}) {
  return spawnSync('git', args, { cwd, encoding: 'utf8', env: { ...process.env, ...env } });
}

function ok(cwd: string, ...args: string[]): string {
  const r = git(cwd, args);
  assert.equal(r.status, 0, r.stderr);
  return r.stdout;
}

// A repository with one clean commit and the hook installed.
function repo() {
  const dir = mkdtempSync(join(tmpdir(), 'hook-test-'));
  ok(dir, 'init', '-q', '-b', 'main');
  ok(dir, 'config', 'user.email', 'test@example.invalid');
  ok(dir, 'config', 'user.name', 'Test');
  ok(dir, 'config', 'commit.gpgsign', 'false');
  ok(dir, 'config', 'core.hooksPath', hooks);
  writeFileSync(join(dir, 'README'), 'hello\n');
  ok(dir, 'add', '.');
  ok(dir, 'commit', '-q', '--no-verify', '-m', 'init');
  return dir;
}

const head = (dir: string) => ok(dir, 'rev-parse', 'HEAD').trim();

function commit(dir: string, files: Record<string, string>, env: Record<string, string> = {}) {
  for (const [path, content] of Object.entries(files)) writeFileSync(join(dir, path), content);
  ok(dir, 'add', ...Object.keys(files));
  return git(dir, ['commit', '-q', '-m', 'change'], env);
}

// The hook runs the gitleaks mise pins (ADR-0025), so these need mise and
// `mise install --locked`.
const realGitleaks = { skip: !onPath('mise') && 'mise not on PATH' };

test('pre-commit: clean commit', realGitleaks, () => {
  const dir = repo();
  const before = head(dir);
  const r = commit(dir, { 'a.txt': 'nothing to see\n' });
  assert.equal(r.status, 0, r.stdout + r.stderr);
  assert.notEqual(head(dir), before);
});

test('pre-commit: staged secret refused, redacted', realGitleaks, () => {
  const dir = repo();
  const before = head(dir);
  const key = privateKey();
  const r = commit(dir, { id_rsa: key });
  assert.notEqual(r.status, 0);
  assert.equal(head(dir), before, 'no commit is created');
  assert.match(r.stdout + r.stderr, /leaks? found/i);
  assert.doesNotMatch(r.stdout + r.stderr, keyLine(key));
});

test('pre-commit: secret already in history, not staged', realGitleaks, () => {
  const dir = repo();
  writeFileSync(join(dir, 'id_rsa'), privateKey());
  ok(dir, 'add', 'id_rsa');
  ok(dir, 'commit', '-q', '--no-verify', '-m', 'leak');
  const r = commit(dir, { 'a.txt': 'nothing to see\n' });
  assert.equal(r.status, 0, r.stdout + r.stderr);
});

test('pre-commit: mise missing refuses the commit', () => {
  const dir = repo();
  const before = head(dir);
  const r = commit(dir, { 'a.txt': 'nothing to see\n' }, { PATH: barePath });
  assert.notEqual(r.status, 0);
  assert.equal(head(dir), before, 'no commit is created');
  assert.match(r.stderr, /mise is not installed/);
});
