// Every shipped ADR above revision 1 closes with a Revisions list, one entry per revision (adr-format spec).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const adrs = readdirSync(join(root, 'adr')).filter((f) => /^ADR-\d{4}-.*\.md$/.test(f));

// Revision numbers the list should hold (2..N) and the ones it holds, in order.
function revisions(text: string): { expected: number[]; listed: number[] } {
  // Only the frontmatter's revision: ADR bodies hold filled examples with their own.
  const [, front = ''] = text.match(/^---\n([\s\S]*?)\n---/) ?? [];
  const n = Number(front.match(/^revision:\s*(\d+)/m)?.[1] ?? 0);
  const [, list = ''] = text.split(/^\*\*Revisions\.\*\*/m);
  const listed = [...list.matchAll(/^- Revision (\d+):/gm)].map((m) => Number(m[1]));
  return { expected: Array.from({ length: Math.max(n - 1, 0) }, (_, i) => i + 2), listed };
}

test('adr-revisions: parser', () => {
  const adr = (rev: number, list: string) => `---\nadr: X\nrevision: ${rev}\n---\n\n\`\`\`yaml\nrevision: 9\n\`\`\`\n${list}`;
  assert.deepEqual(revisions(adr(1, '')), { expected: [], listed: [] });
  assert.deepEqual(revisions(adr(3, '**Revisions.**\n\n- Revision 2: a.\n- Revision 3: b.\n')), { expected: [2, 3], listed: [2, 3] });
  assert.deepEqual(revisions(adr(2, '- Revision 2: outside the list.\n')), { expected: [2], listed: [] });
});

test('adr-revisions: one entry per revision above 1', () => {
  const wrong = adrs.flatMap((f) => {
    const { expected, listed } = revisions(readFileSync(join(root, 'adr', f), 'utf8'));
    return String(listed) === String(expected) ? [] : [`adr/${f}: Revisions list holds [${listed}], revision needs [${expected}]`];
  });
  assert.deepEqual(wrong, []);
});

// The shipped ADRs name no track they were adapted from (adr-catalog spec, "No other track is named").
test('adr: no source track named', () => {
  for (const f of [...adrs, '.mdschema.yml']) {
    assert.doesNotMatch(readFileSync(join(root, 'adr', f), 'utf8'), /surdesrails|\bSDR\b|SDR-\d/i, `adr/${f} names surdesrails or an SDR`);
  }
});
