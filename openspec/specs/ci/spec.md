# ci Specification

## Purpose
Defines the pull request pipeline of this repository and the ruleset that
makes it block a merge on `main`, so that ADR-0011's `forge.gate: blocking`
is enforced rather than declared.

## Requirements

### Requirement: Pull request pipeline
The repository SHALL have a workflow that runs on every pull request, from a
branch of the repository or from a fork, and reports one check named `test`.
The `test` check SHALL install the dependencies from `package-lock.json`
without resolving them again, run `npm test`, and run this pull request's
own ADR-0006 check on the commits between the base branch and the pull
request's head. The check SHALL fail when any of the three fails. The
workflow SHALL declare read-only `contents` permission, use no secret, and
pin every action by commit SHA with its tag in a comment.

#### Scenario: Green pull request
- **WHEN** a pull request's tests pass and its commits are Conventional Commits with a scope from `commits.scopes` or none
- **THEN** the `test` check succeeds

#### Scenario: Failing test
- **WHEN** a pull request breaks a test in `checks/*.test.mjs`
- **THEN** the `test` check fails

#### Scenario: Off-format commit
- **WHEN** a pull request holds a commit `fix(backend): y` and `backend` is not in `commits.scopes`
- **THEN** the `test` check fails and its log shows commitlint's `scope-enum` error

#### Scenario: Lockfile out of date
- **WHEN** a pull request changes `package.json` dependencies without updating `package-lock.json`
- **THEN** the `test` check fails at the install step

#### Scenario: Check under review is the one run
- **WHEN** a pull request changes `checks/governance-check.mjs`
- **THEN** the ADR-0006 step runs the changed script, not the copy installed under `node_modules`

### Requirement: Required check on the default branch
A repository ruleset SHALL target the default branch, be active, have no
bypass actor, and require the `test` check from GitHub Actions. The
ruleset's definition SHALL be kept in the repository at
`.github/rulesets/main.json`, in the shape the GitHub rulesets API accepts,
and the ruleset on GitHub SHALL match it.

#### Scenario: Red check blocks the merge
- **WHEN** the `test` check fails on a pull request to `main`
- **THEN** GitHub refuses to merge it, for the repository owner too

#### Scenario: Direct push refused
- **WHEN** someone pushes a commit to `main` that has no successful `test` check
- **THEN** GitHub rejects the push

#### Scenario: Versioned copy matches GitHub
- **WHEN** the ruleset is read back with `gh api repos/trivoallan/governance/rulesets/<id>`
- **THEN** its target, conditions, bypass actors and rules equal those in `.github/rulesets/main.json`
