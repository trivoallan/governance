# Spec Delta

## Purpose

Holds governance's own test suite to the line coverage its ADR-0007 rules,
so that a change leaving check code untested fails `npm test` instead of
shipping.

## ADDED Requirements

### Requirement: npm test enforces line coverage
`npm test` SHALL measure line coverage of the hand-written check source,
excluding test files and compiled output, print the per-file report, and
exit non-zero when line coverage is below the threshold, even when every
test passes. It SHALL NOT need any dependency beyond Node and the dev
dependencies the suite already uses.

#### Scenario: At or above the threshold
- **WHEN** every test passes and line coverage of the check source is 90 % or more
- **THEN** `npm test` exits `0` and its output holds the coverage report

#### Scenario: Below the threshold
- **WHEN** every test passes but line coverage of the check source is below 90 %
- **THEN** `npm test` exits non-zero and its output says line coverage does not meet the threshold

#### Scenario: Tests not counted
- **WHEN** `npm test` prints its coverage report
- **THEN** no test file and nothing under `dist/` appears in it

### Requirement: Threshold follows ADR-0007
The threshold `npm test` applies SHALL equal `tests.coverage_target` in
governance's own `docs/adr/trivoallan/ADR-0007-tests.md`. When the two
differ, `npm test` SHALL fail and name both values.

#### Scenario: ADR-0007 ruled higher than the script
- **WHEN** ADR-0007's `tests.coverage_target` is `95` and the `test` script applies `90`
- **THEN** `npm test` exits non-zero and its output names `95` and `90`
