// README.md's counts and ADR links, held to the files under adr/ (readme spec).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const readme = readFileSync(join(root, 'README.md'), 'utf8');
const adrs = readdirSync(join(root, 'adr')).filter((f) => /^ADR-\d{4}-.*\.md$/.test(f));

// A `check:` line counts only in the frontmatter: ADR-0001's body holds an example one.
function hasCheck(text: string): boolean {
  const [, front] = text.match(/^---\n([\s\S]*?)\n---/) ?? [];
  return front !== undefined && /^check:/m.test(front);
}

const stated = (re: RegExp) => Number(readme.match(re)?.[1]);

test('readme: frontmatter check lines only', () => {
  assert.equal(hasCheck('---\nadr: X\ncheck: npx a\n---\n'), true);
  assert.equal(hasCheck('---\nadr: X\n---\n\n```yaml\ncheck: npx a\n```\n'), false);
  assert.equal(hasCheck('no frontmatter\ncheck: npx a\n'), false);
  assert.equal(hasCheck(readFileSync(join(root, 'adr', 'ADR-0001-record-architecture-decisions.md'), 'utf8')), false);
});

test('readme: question count matches adr/', () => {
  assert.equal(stated(/(\d+) questions/), adrs.length, `README states ${stated(/(\d+) questions/)} questions, adr/ holds ${adrs.length}`);
});

test('readme: check count matches frontmatter check lines', () => {
  const checked = adrs.filter((f) => hasCheck(readFileSync(join(root, 'adr', f), 'utf8'))).length;
  const n = stated(/(\d+) of them come with a check/);
  assert.equal(n, checked, `README states ${n} checks, adr/ has ${checked}`);
});

test('readme: every ADR linked, every ADR link resolves', () => {
  const links = [...readme.matchAll(/\]\((adr\/ADR-[^)#]+\.md)/g)].map((m) => m[1]);
  for (const f of adrs) assert.ok(links.includes(`adr/${f}`), `adr/${f} has no link from README.md`);
  for (const l of links) assert.ok(existsSync(join(root, l)), `README.md links ${l}, which does not exist`);
});
