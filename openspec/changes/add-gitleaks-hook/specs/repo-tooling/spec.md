# Spec Delta

## Purpose

Defines how this repository carries out the ADRs it rules for itself: the
checks, hooks, settings and instructions its contributors and agents work with.

## ADDED Requirements

### Requirement: Pre-commit secret guard
The repository SHALL version a git pre-commit hook at `.githooks/pre-commit`
that runs `gitleaks git --pre-commit --staged --redact` and lets the commit
proceed only when that command exits `0`. When `gitleaks` is not on `PATH`,
the hook SHALL refuse the commit and say that gitleaks must be installed.
Its output MUST NOT contain the value of a secret it finds.

#### Scenario: Clean commit
- **WHEN** the hook is installed and the staged changes hold no secret
- **THEN** `git commit` succeeds

#### Scenario: Staged secret refused
- **WHEN** the hook is installed and a staged file adds a private key
- **THEN** `git commit` exits non-zero, no commit is created, and the key does not appear in the output

#### Scenario: Secret already in history, not staged
- **WHEN** an earlier commit holds a secret and the staged changes hold none
- **THEN** `git commit` succeeds

#### Scenario: gitleaks missing
- **WHEN** the hook is installed and `gitleaks` is not on `PATH`
- **THEN** `git commit` exits non-zero and the output says gitleaks is not installed

### Requirement: Hook installed by npm install
Running `npm install` (or `npm ci`) in a clone SHALL set the clone's
`core.hooksPath` to `.githooks`, without adding a dependency. Outside a git
checkout, the step SHALL do nothing and SHALL NOT fail the install.

#### Scenario: Fresh clone
- **WHEN** a contributor clones the repository and runs `npm install`
- **THEN** `git config core.hooksPath` prints `.githooks`

#### Scenario: Worktree
- **WHEN** a commit is made in a worktree of a clone where `npm install` has run
- **THEN** that worktree's `.githooks/pre-commit` runs

#### Scenario: Not a git checkout
- **WHEN** the install runs in a directory that is not a git checkout
- **THEN** the install succeeds and nothing is configured
