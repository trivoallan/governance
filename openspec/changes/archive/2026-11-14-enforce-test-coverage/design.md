# Design

## Context

After `migrate-checks-to-typescript` (#31), `npm test` is
`tsc --noEmit && node --test checks/*.test.ts`, and the test spawns
`checks/governance-check.ts` with `process.execPath`. Node's test runner
collects coverage from those child processes too (it sets
`NODE_V8_COVERAGE`, which children inherit): that is how ADR-0007's figure
was measured. Measured today on the `.mjs` files with tests excluded:
98.68 % lines. See proposal.md for motivation.

**Order:** last of three. It needs #31's file names and `test` script, and
is sequenced after `validate-checks-with-zod` (#32) only to avoid
concurrent edits of `package.json`; if #32 slips, this change applies
unchanged on top of #31 alone.

## Goals / Non-Goals

**Goals:**
- ADR-0007's three bounds, as Node's runner expresses them: unit suite
  (`node --test`), hand-written source (`checks/*.ts` minus tests), lines.
- No dependency: Node 22.18's own flags.

**Non-Goals:**
- Branch or function thresholds (73 % branches today; ADR-0007 fixes lines).
- Running `npm test` in CI (#35).

## Decisions

**Node's built-in coverage flags.** The `test` script becomes
`tsc --noEmit && node --test --experimental-test-coverage
--test-coverage-include='checks/*.ts' --test-coverage-exclude='checks/*.test.ts'
--test-coverage-exclude='checks/test-helpers.ts'
--test-coverage-lines=90 checks/*.test.ts`. The include keeps `node_modules`
(commitlint, run by the ADR-0006 tests) and `dist/` out; the excludes keep
the tests out, `checks/test-helpers.ts` included.

*Adaptation at apply time:* #31 also landed `checks/test-helpers.ts`, test
support that the `*.test.ts` glob does not match. It is not shipped source,
so a second `--test-coverage-exclude` (the flag repeats) keeps it out; the
report then lists `checks/governance-check.ts` alone, at 98.73 % lines
(Node 22.23). Below the threshold the runner prints that line coverage does
not meet it and exits `1`. *Alternative:* `c8`, one dev dependency for what
Node does itself.

**The threshold is checked against ADR-0007 by a test.** ADR-0007 says its
value is written there and nowhere else; the script has to carry a number,
so a test reads `--test-coverage-lines=<n>` from `package.json`'s `test`
script and `coverage_target:` from
`docs/adr/trivoallan/ADR-0007-tests.md`, and fails naming both when they
differ. A regular expression on each is enough: both are one line.
*Alternative:* a wrapper script reading ADR-0007 and passing the flag,
which adds a file to keep `90` out of `package.json` while hiding the
command a contributor would run by hand.

**Quoting.** The globs are single-quoted in the script so the shell passes
them to Node, which expands them itself; `checks/*.test.ts` stays unquoted
as #31 has it.

## Risks / Trade-offs

- [Coverage of type-stripped `.ts` files run in child processes is not
  collected or mis-mapped] → Task 1.1 checks the report lists
  `checks/governance-check.ts` with a figure close to today's before the
  threshold is turned on; type stripping keeps line numbers.
- [`--experimental-test-coverage` changes in a later Node] → `engines` pins
  the floor; the flag still exists in Node 24, and a removal fails loudly.
- [ADR-0007 ruled `none` later] → The equality test fails until the flag is
  removed with it, which is the intended prompt.

## Migration Plan

None: one script and one test. Rollback is a revert.
