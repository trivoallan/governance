# Proposal

## Why

ADR-0011 rules `forge.gate: blocking`, but the only workflow is
`release.yml`, no ruleset exists and `main` is unprotected (checked with
`gh api repos/trivoallan/governance/rulesets`: `[]`). A red test or an
off-format commit merges today, and ADR-0006's Consequences say nothing runs
its check until a CI job calls it (issue #35).

## What Changes

- A workflow `.github/workflows/ci.yml`, on `pull_request`, with one job
  `test` that installs from the lockfile with `npm ci`, runs `npm test`, and
  runs the PR's own `checks/governance-check.mjs ADR-0006` against the base
  branch. Actions pinned by SHA with the tag in a comment, as `release.yml`
  does (ADR-0011 rule 3); `permissions: contents: read`; no secret.
- A ruleset `.github/rulesets/main.json`, versioned in the repository, that
  makes the `test` check required on the default branch. It is applied on
  GitHub with `gh api`; GitHub stays the source of truth, the file is the
  reviewed copy.
- This change owns the `npm ci` line (ADR-0020 rule 5, lockfile in CI).
  `adopt-npm-12-cooldown` (#42) later runs that same line on npm 12 and adds
  `--strict-allow-scripts`; it does not add its own install.
  `configure-dependabot` (#37) later skips the ADR-0006 step on Dependabot's
  pull requests; this change runs it on every pull request.

Out of scope: the coverage threshold in `npm test` (#33), the Grype scan
stage (#41), the ADR-0009 branch-name check (#34), the other `check:` lines
(the ADR-0018 wiring fails until `configure-dependabot` lands), linting the
pull request title that a squash merge may use, and any other ruleset rule
(pull request reviews, deletion, force push).

## Capabilities

### New Capabilities

- `ci`: what the pull request pipeline runs, and the ruleset that makes it
  block a merge on `main`.

### Modified Capabilities

None. `governance-check` and the ADRs are unchanged.

## Impact

- New files: `.github/workflows/ci.yml`, `.github/rulesets/main.json`.
- GitHub-side: one repository ruleset, created with `gh api`. Nothing
  merges on `main` without a green `test`, release-please's pull requests
  included (they are opened with `RELEASE_PLEASE_TOKEN`, so they trigger the
  workflow).
- Unblocks `configure-dependabot` (#37), whose automerge needs this required
  check, and `adopt-npm-12-cooldown` (#42), which edits `ci.yml`.
