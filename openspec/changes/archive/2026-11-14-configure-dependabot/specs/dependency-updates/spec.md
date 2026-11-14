# Spec Delta

## Purpose

Defines how this repository's dependencies and action pins are kept current
by Dependabot, and which of its pull requests merge without a person, as
ruled in ADR-0018.

## ADDED Requirements

### Requirement: Watched ecosystems
Dependabot SHALL propose version updates for the `npm` ecosystem at the
repository root and for the `github-actions` ecosystem, and for no other
ecosystem. Each SHALL wait at least three days after a release before
proposing it, written explicitly in the configuration. Each pull request
title SHALL be a Conventional Commit of type `chore` with no scope.

#### Scenario: Recent release held back
- **WHEN** a new patch of a devDependency was published two days ago
- **THEN** Dependabot opens no pull request for it yet

#### Scenario: Action pin moves
- **WHEN** `actions/checkout` publishes a release older than three days
- **THEN** Dependabot opens a pull request that replaces the SHA in the workflows that pin it

#### Scenario: Title accepted by ADR-0006
- **WHEN** Dependabot opens a pull request
- **THEN** its title starts with `chore: bump ` and has no scope

#### Scenario: Wiring check
- **WHEN** `governance-check ADR-0018` runs on `main`
- **THEN** it exits `0`

### Requirement: Patch automerge
A pull request SHALL be set to merge automatically, by squash, only when
its author is `dependabot[bot]`, its ecosystem is `npm`, and its update type
is a semver patch. The merge SHALL wait for the checks the `main` ruleset
requires. Any other pull request, an action update or a minor or major
update included, SHALL be left for a person. The automerge workflow SHALL
run on `pull_request`, never `pull_request_target`, check out no code, read
no secret, and declare only `contents: write` and `pull-requests: write`.

#### Scenario: npm patch
- **WHEN** Dependabot opens a pull request bumping a devDependency from `21.2.4` to `21.2.5`
- **THEN** auto-merge is enabled on it and it merges once `test` passes

#### Scenario: npm minor
- **WHEN** Dependabot opens a pull request bumping a devDependency from `21.2.4` to `21.3.0`
- **THEN** auto-merge is not enabled

#### Scenario: Action patch
- **WHEN** Dependabot opens a pull request bumping an action from `v7.0.1` to `v7.0.2`
- **THEN** auto-merge is not enabled

#### Scenario: Red check
- **WHEN** an npm patch pull request has auto-merge enabled and `test` fails
- **THEN** it does not merge

#### Scenario: Someone else's pull request
- **WHEN** a person opens a pull request that only changes `package-lock.json`
- **THEN** the automerge job does not run

### Requirement: Commit check on Dependabot pull requests
On a pull request authored by `dependabot[bot]`, the `test` check SHALL
still install and run the tests, and SHALL NOT run the ADR-0006 commit
check. On every other pull request the ADR-0006 commit check SHALL run.

#### Scenario: Dependabot body lines
- **WHEN** Dependabot's commit body holds a line longer than 100 characters
- **THEN** the `test` check does not fail on it

#### Scenario: Other pull requests unchanged
- **WHEN** a person's pull request holds a commit `fix(backend): y`
- **THEN** the ADR-0006 step runs and the `test` check fails
