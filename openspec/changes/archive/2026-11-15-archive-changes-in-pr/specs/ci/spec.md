# Spec Delta

## MODIFIED Requirements

### Requirement: Pull request pipeline
The repository SHALL have a workflow that runs on every pull request, from a
branch of the repository or from a fork, and reports one check named `test`.
The `test` check SHALL install the dependencies from `package-lock.json`
without resolving them again, run `npm test`, run this pull request's own
ADR-0006 check on the commits between the base branch and the pull
request's head, and run this pull request's own ADR-0009 and ADR-0016
checks. The check SHALL fail when any of them fails. The workflow SHALL
declare read-only `contents` permission, use no secret, and pin every
action by commit SHA with its tag in a comment.

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

#### Scenario: Complete change left unarchived
- **WHEN** a pull request leaves a change in `openspec/changes/` with every task checked
- **THEN** the `test` check fails at the ADR-0016 step

### Requirement: Change summary for the reviewer
The `test` check SHALL write to its job summary, for each active change the
pull request touches, OpenSpec's view of that change with a per-requirement
diff of each spec delta against the current spec. A change is touched when a
file under `openspec/changes/<name>/` differs between the base branch and the
pull request's head, with `openspec/changes/archive/` excluded, and
`openspec/changes/<name>/` exists at the head. For each change the pull
request archives, that is each directory under `openspec/changes/archive/`
whose files the pull request adds, the summary SHALL show its proposal and
its spec delta files as they were archived. The summary SHALL be written
without any permission beyond read-only `contents` and without a secret.
Writing it, or failing to, SHALL NOT change whether the `test` check passes
or fails.

#### Scenario: Pull request with a change
- **WHEN** a pull request adds or edits files under `openspec/changes/add-x/`
- **THEN** the `test` check's job summary shows `add-x` with the diff of each requirement its deltas add, modify, remove or rename

#### Scenario: Pull request with no change
- **WHEN** a pull request touches nothing under `openspec/changes/`
- **THEN** the step writes nothing to the job summary and the `test` check's result is decided by its other steps alone

#### Scenario: Change archived by the pull request
- **WHEN** a pull request moves `openspec/changes/add-x/` to `openspec/changes/archive/2026-01-01-add-x/`
- **THEN** the job summary shows `add-x` as archived, with its proposal and its spec delta files

#### Scenario: Archived change edited
- **WHEN** a pull request only edits a file already under `openspec/changes/archive/`
- **THEN** that change is not summarised

#### Scenario: Summary fails
- **WHEN** OpenSpec cannot show a touched change
- **THEN** the `test` check still passes if its install, tests, ADR-0006 and ADR-0009 steps pass

#### Scenario: Pull request from a fork
- **WHEN** a pull request comes from a fork, with a read-only token
- **THEN** the summary is written, since it needs no write permission
