# Proposal

## Why

ADR-0018 rules `dependencies.updater: dependabot` and `automerge: patch`,
but there is no `.github/dependabot.yml` and no automerge workflow, so the
action SHAs pinned under ADR-0011 rule 3 and the lockfile never move, and
`governance-check ADR-0018` fails today (issue #37). ADR-0018 rule 1 allows
automerge only behind a required check, which `add-ci-gate` (#35) provides.

## What Changes

- `.github/dependabot.yml`: weekly version updates for `npm` (justified by
  `package.json`) and `github-actions` (justified by `.github/workflows/`),
  each with `cooldown.default-days: 3` (rule 2) and
  `commit-message.prefix: chore`, so the titles are `chore: bump …`, a
  type with no scope that ADR-0006 accepts, instead of Dependabot's default
  `chore(deps-dev): Bump …`.
- `.github/workflows/dependabot-automerge.yml`: on `pull_request` authored
  by `dependabot[bot]`, reads the update with `dependabot/fetch-metadata`
  (pinned by SHA) and runs `gh pr merge --auto --squash` only for an `npm`
  update of type `version-update:semver-patch`. Actions updates and minors
  and majors wait for a person (rules 3 and 4).
- `.github/workflows/ci.yml` (from `add-ci-gate`): the ADR-0006 step is
  skipped on pull requests authored by `dependabot[bot]`, whose message
  bodies break commitlint's 100-character line limit. The `test` check
  still runs and reports; installs and tests are not skipped. The departure
  is declared in ADR-0006's Decision.
- Repository setting "Allow auto-merge": already on (`allow_auto_merge:
  true` read with `gh api` on 2026-11-14); verified, not changed.

## Capabilities

### New Capabilities

- `dependency-updates`: which ecosystems Dependabot watches, its cooldown
  and commit titles, and which of its pull requests merge without a person.

### Modified Capabilities

None. `ci` is introduced by `add-ci-gate` and is not yet in
`openspec/specs/`; the Dependabot exception to its ADR-0006 step is stated
in `dependency-updates`.

## Impact

- New files: `.github/dependabot.yml`,
  `.github/workflows/dependabot-automerge.yml`.
- Edited: `.github/workflows/ci.yml` (one `if:` on the ADR-0006 step),
  `docs/adr/trivoallan/ADR-0006-commits.md` (a departure paragraph, no
  trait or `revision` change).
- **Depends on `add-ci-gate`** being merged and its ruleset active: without
  the required `test` check, `gh pr merge --auto` would merge at once, the
  combination ADR-0018 rule 1 forbids.
- `governance-check ADR-0018` passes once both files are tracked.
