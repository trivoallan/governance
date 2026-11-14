# Proposal

## Why

ADR-0009 allows `feat/`, `fix/`, `docs/` and `chore/` branches, yet most
branches here are `tritri/…`: Claude Code's desktop app names every session
branch `<branch prefix>/<name>`, and that prefix is one account setting,
outside the repository (#34). `governance-check ADR-0009` already tests a
name, but nothing runs it here: this repository's copy of ADR-0009 has no
`check:` line, and no pull request workflow exists yet.

## What Changes

- This repository's copy of ADR-0009 gets its `check:` line, synced from
  governance by `ontrack apply`, so `ontrack check` runs it.
- The `test` job of `.github/workflows/ci.yml`, created by `add-ci-gate`
  (#35) and required on `main` by its ruleset, gets one more step:
  `node checks/governance-check.mjs ADR-0009`, which reads the pull
  request's head branch from `GITHUB_HEAD_REF`. `add-ci-gate` leaves this
  step to #34 explicitly; no ruleset change is needed, the context is still
  `test`.
- `governance-check ADR-0009` has nothing to check on the branches that the
  tools governance itself recommends open: `release-please--…` (ADR-0012),
  `dependabot/…` (ADR-0018) and `renovate/…`. Without this, the gate would
  block every release pull request (#46 was `release-please--branches--main--components--ontrack-governance`)
  and every Dependabot one. ADR-0009's how-to-rule note says so.
- `AGENTS.md`, outside its ontrack block, tells an agent to rename a branch
  made by tooling to `<prefix>/<description>` before its first push, with
  the prefix taken from the commit type of the work.

Out of scope: renaming or deleting existing `tritri/…` branches (their pull
requests are merged or will be renamed on their next push); the Claude Code
`branch_prefix` account setting, which the repository cannot set; a GitHub
ruleset restricting branch names (see design).

## Capabilities

### New Capabilities

- `repo-tooling`: how this repository carries out the ADRs it rules for
  itself; here, that its branch names are checked.

### Modified Capabilities

- `adr-checks`: the ADR-0009 check passes the branches of release and
  update tools.
- `adr-catalog`: ADR-0009's how-to-rule note names those branches.

## Impact

- `docs/adr/trivoallan/ADR-0009-branching.md`: one frontmatter line, by
  `ontrack apply`.
- `checks/governance-check.mjs` and its tests: a list of tool branch
  prefixes in the ADR-0009 check. Shipped to consumers in the next release.
- `adr/ADR-0009-branching.md`: one sentence in the how-to-rule note, no
  `revision` change.
- `AGENTS.md`: a short section after `<!-- ontrack:end -->`.
- `.github/workflows/ci.yml`: one step. Depends on `add-ci-gate`, which
  creates the file and the required `test` context; this change lands
  after it.
- If `migrate-checks-to-typescript` lands first, the check edit moves to
  its new `.ts` file.
