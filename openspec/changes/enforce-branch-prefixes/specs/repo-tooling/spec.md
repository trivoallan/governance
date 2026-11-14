# Spec Delta

## Purpose

Defines how this repository carries out the ADRs it rules for itself: the
checks, hooks, settings and instructions its contributors and agents work with.

## ADDED Requirements

### Requirement: Branch names are checked against ADR-0009
This repository's copy of ADR-0009 SHALL carry
`check: npx --no-install governance-check ADR-0009`, so that `ontrack check`
runs it. The required `test` job of the pull request workflow (ADR-0011)
SHALL run the ADR-0009 check of the pull request's own checkout on the pull
request's head branch, so that a failing check blocks the merge.

#### Scenario: Check line present
- **WHEN** the frontmatter of `docs/adr/trivoallan/ADR-0009-branching.md` is read
- **THEN** it holds `check: npx --no-install governance-check ADR-0009`

#### Scenario: Tool-named branch refused
- **WHEN** a pull request's head branch is `tritri/fix-wiring-rows`
- **THEN** the gate fails and its output names the allowed prefixes `feat, fix, docs, chore`

#### Scenario: Conforming branch accepted
- **WHEN** a pull request's head branch is `fix/wiring-rows`
- **THEN** the ADR-0009 step of the gate passes

### Requirement: Agents rename tool-made branches before pushing
`AGENTS.md` SHALL tell an agent, outside the block ontrack manages, that a
branch whose name does not start with one of `branching.prefixes` is renamed
to `<prefix>/<description-in-kebab-case>` before its first push, with the
prefix chosen from the commit type of the work, and SHALL give the command
(`git branch -m <new-name>`).

#### Scenario: Instruction outside the managed block
- **WHEN** `AGENTS.md` is read
- **THEN** the rename instruction appears after `<!-- ontrack:end -->` and `ontrack apply` leaves it unchanged
