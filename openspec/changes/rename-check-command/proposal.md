# Proposal

## Why

The package is `@trivoallan/ontrack-engineering` and the repository is
`trivoallan/ontrack-engineering`, but the command every shipped `check:` line
calls is still `governance-check`, the last trace of the old name. The
`rename-to-ontrack-engineering` design kept it only alongside the repository
name, which has since changed.

## What Changes

- The command is `ontrack-engineering-check`, built from
  `checks/ontrack-engineering-check.ts` to `dist/ontrack-engineering-check.js`.
- `package.json` publishes `governance-check` as a second `bin` entry for the
  same script, for one version, so that ADR copies already imported by a
  consuming repository keep working until it re-imports them. Removing the
  alias is a later, breaking change, tracked by an issue.
- Every shipped `check:` line calls `npx --no-install ontrack-engineering-check <number>`,
  with no change of `revision:`.
- The usage line, the temporary directory prefix and the error for an ADR
  without a check use the new name; prose saying "governance ships" in the
  script and in the shipped ADRs says "this package ships".
- The README, the CI workflow, `.github/apply-session.md` and the test
  helpers call the new name.

Not breaking: `governance-check` still runs every check.

## Capabilities

### Modified Capabilities

- `adr-checks`: the command's name, its alias, and the package's message
  for an ADR without a check.
- `adr-format`: the command a shipped `check:` line calls.
- `adr-catalog`: the `check:` line each ADR ships.

## Impact

- Renamed: `checks/governance-check.ts`, `checks/governance-check.test.ts`.
- Edited: `package.json` (`files`, `bin`), `adr/*.md` (`check:` lines and
  prose), `adr/.mdschema.yml` (a comment), `README.md`,
  `.github/workflows/ci.yml`, `.github/workflows/release.yml` (a comment),
  `.github/apply-session.md`, `checks/test-helpers.ts`.
- This repository's own copies in `docs/adr/trivoallan/` keep
  `governance-check` until it re-imports the package (ADR-0020's cooldown),
  which the alias covers.
- Consumers (tambouille) need nothing now; they move to the new lines at
  their next import, before the alias is removed.
- Untouched: the CHANGELOG and archived changes, which record history.
