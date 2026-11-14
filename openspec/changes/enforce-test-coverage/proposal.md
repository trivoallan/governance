# Proposal

## Why

ADR-0007 rules `tests.coverage_target: 90` (line coverage, unit tests,
hand-written code only), but `npm test` does not measure coverage, so
nothing fails below it (#33). Line coverage of the check is 98.68 % today
with test files excluded (ADR-0007 quotes 99.24 %, measured with them), so
the gate costs nothing to turn on now and catches the first untested check.

This change comes last of three. It assumes `migrate-checks-to-typescript`
(#31) has landed: it measures `checks/*.ts` and extends the `test` script
#31 sets. It has no functional dependency on `validate-checks-with-zod`
(#32), and is sequenced after it so the code #32 adds is measured and the
two do not edit `package.json` at once.

## What Changes

- `npm test` runs the suite with Node's built-in coverage, counts lines of
  the hand-written check source only (tests and compiled output excluded),
  prints the report, and fails below 90 %.
- A test asserts that the threshold in `npm test` equals the
  `tests.coverage_target` of governance's own ADR-0007, so the value ruled
  there stays the one enforced.

Out of scope: a CI job running `npm test` (#35, which ADR-0007's Negative
consequence also names); branch or function thresholds; any coverage
dependency.

## Capabilities

### New Capabilities

- `test-coverage`: governance's own test suite fails below the line
  coverage ADR-0007 rules for this repository.

### Modified Capabilities

None.

## Impact

- `package.json`: the `test` script gains the coverage flags.
- `checks/governance-check.test.ts`: one test reading `package.json` and
  `docs/adr/trivoallan/ADR-0007-tests.md`.
- No new dependency; `engines.node >=22.18` already has the flags.
