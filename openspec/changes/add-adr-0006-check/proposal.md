# Proposal

## Why

`ontrack check` (trivoallan/ontrack#41) runs the `check:` command of every
accepted ADR, but no governance ADR carries one, so a consuming repository
learns that its work departs from a decision only in review. The command
cannot be written per verdict by governance, which ships questions, so the
logic has to live in a script that reads the trait. ADR-0006 is the test: it
already names a tool (`commitlint`) and a measured drift (ontrack's own
history, 6 of 10 commits with a scope).

## What Changes

- governance ships code for the first time: a package `bin`,
  `governance-check`, and a `checks/` directory. `package.json` adds `bin`
  and lists the script in `files`.
- `governance-check ADR-0006` reads `commits.tool` and `commits.scopes` from
  the repository's copy of ADR-0006 (`docs/adr/*/ADR-0006-*.md`):
  - `commitlint`: runs the repository's commitlint on the commits of the
    branch, with the Conventional Commits rules and the scope list as
    decided (`[]` means no scope allowed). It exits non-zero on a bad
    message, or when commitlint is not installed.
  - `hook` or `none`: prints that there is nothing to check and exits `0`.
- ADR-0006 ships with `check: npx --no-install governance-check ADR-0006`.
  `ontrack check` runs it only once a repository has ruled it `accepted`.
  Its `revision` does not change: the question is the same.
- ADR-0001 moves to `revision: 3`: an ADR may carry a `check:` line, which
  rule 4 lets a repository add to a ruled ADR; the
  scripts behind it follow governance's package version, not `revision`;
  adding or changing a `check:` line changes no `revision`; a repository
  that ruled an ADR before its `check:` line existed adds it by hand. Its
  Negative "nothing runs it" stays true for `mdschema`, which this change
  does not wire to `ontrack check`.
- `.mdschema.yml` accepts `check:` as is (verified: an extra top-level key
  passes `mdschema@0.15.1`). The schema test is kept as a task.

Out of scope: checks for other ADRs, an `ontrack` exit code for "nothing to
check" (today `hook` and `none` report `pass`), an `ONTRACK_ADR` variable,
and a check for ADR-0001's own schema.

## Capabilities

### New Capabilities

- `adr-checks`: the `governance-check` command, how it finds an ADR and reads
  its traits, and what the ADR-0006 check does for each `commits.tool` value.

### Modified Capabilities

- `adr-format`: an ADR may carry a top-level `check:` key; a `check:` line
  and the scripts behind it change no `revision`.
- `adr-catalog`: ADR-0001 ships at `revision: 3` and states the `check:`
  rules; ADR-0006 ships with its `check:` line.

## Impact

- New `checks/` (the command and the ADR-0006 check) and its tests.
  `package.json` gains `bin`, `files: ["adr/", "checks/governance-check.mjs"]`, a `test` script,
  and dev dependencies `@commitlint/cli` and `@commitlint/config-conventional`
  for the tests only. A consuming repository that picks `commitlint` installs
  them itself, as ADR-0006 already implies.
- `adr/ADR-0006-commits.md`: one frontmatter line and a how-to-rule note;
  `revision` unchanged. Repositories that ruled it before see nothing in
  `ontrack plan` and add the line by hand, as ADR-0001 revision 3 says.
- `adr/ADR-0001-record-architecture-decisions.md`: revision 2 to 3, reported
  `revised` by `ontrack plan`.
- A repository that runs `ontrack check` now executes code from governance's
  package. The `--no-install` flag keeps `npx` from fetching a package of the
  same name from the registry.
