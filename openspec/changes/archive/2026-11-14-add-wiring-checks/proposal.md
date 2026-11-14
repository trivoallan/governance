# Proposal

## Why

`governance-check` exists, but only for ADR-0006, which runs a tool on the
branch, much as CI would. The drift that nothing else catches is a decision
that was never set up: the ADR says `dependabot` and there is no
`.github/dependabot.yml`; it says `arc42` and three of the twelve sections
are missing. CI cannot see that gap because CI is part of what may be
missing. Most traits name a tool that leaves a file in the repository, so a
single table, (trait, value) mapped to the files it implies, makes seven
more ADRs checkable with no per-ADR script.

## What Changes

- `governance-check` gains a **wiring check**: for an ADR it has no dedicated
  check for, it looks the ADR up in a table of rows, each mapping a trait and
  a value to what must be in the repository. A row is one of three kinds:
  - `exists`: at least one tracked file matches one of the given paths or
    patterns;
  - `contains`: a tracked file matching a pattern holds a given string;
  - `path`: the trait's value is itself a path, and at least one tracked
    file lives under it.
- Presence only. A value with no row (`none`, `manual`, or a value governance
  did not foresee) prints that there is nothing to check for that trait and
  passes. No row says that a file must be **absent**.
- The table covers seven ADRs (see design for the rows):
  ADR-0008 `docs.tool`, `docs.root`; ADR-0010 `architecture.document`,
  `architecture.model`; ADR-0011 `forge.gate`; ADR-0012
  `delivery.release_tool`, `delivery.target`, `deployment.manifests`;
  ADR-0017 `agent.host`; ADR-0018 `dependencies.updater`,
  `dependencies.automerge`; ADR-0021 `supply_chain.build_level`.
- Each of those seven ADRs ships with
  `check: npx --no-install governance-check <number>` and a how-to-rule note
  saying what the check looks for and what it does not verify. No `revision`
  changes: ADR-0001 rule 8 already says a `check:` line changes none.
- A passing row prints what it found, so the output is evidence, not just
  `0`. A row whose ceiling matters says it: ADR-0011's line says that the
  ruleset making the pipeline required is not verified.

Out of scope: rows that must be absent; checking a file's content beyond one
string (a `renovate.json` with no rules passes); ADR-0020, whose expected
files depend on the package manager and its version; checks that run a tool
(ADR-0015 `gitleaks`, ADR-0016 `openspec validate`, ADR-0009 branch
prefixes), which follow ADR-0006's shape and come in their own change;
GitHub settings reachable only through the API.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `adr-checks`: `governance-check` gains the wiring check, its three row
  kinds, its "nothing to check" rule for values with no row, and the rows of
  the seven ADRs.
- `adr-catalog`: ADR-0008, ADR-0010, ADR-0011, ADR-0012, ADR-0017, ADR-0018
  and ADR-0021 ship with a `check:` line and a how-to-rule note, at their
  current `revision`.

## Impact

- `checks/governance-check.mjs`: the table, the wiring check, and the
  dispatch (dedicated check first, then the table, then "no check"). It stays
  one file, so `package.json` `files` is unchanged. No new dependency: the
  check reads `git ls-files` and plain files with Node's standard library.
- `checks/governance-check.test.mjs`: tests in throwaway repositories, as for
  ADR-0006.
- Seven ADR files: one frontmatter line and a how-to-rule note each;
  `revision` unchanged. `ontrack plan` reports them `check` (up to date, with
  a new `check:` line) and `ontrack apply` writes that line alone, ruled
  copies included.
- A repository whose ADRs are ruled but not set up will see `ontrack check`
  fail on them the first time it runs, which is the point.
