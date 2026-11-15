## ADDED Requirements

### Requirement: Change summary for the reviewer
The `test` check SHALL write to its job summary, for each active change the
pull request touches, OpenSpec's view of that change with a per-requirement
diff of each spec delta against the current spec. A change is touched when a
file under `openspec/changes/<name>/` differs between the base branch and the
pull request's head, with `openspec/changes/archive/` excluded, and
`openspec/changes/<name>/` exists at the head. The summary SHALL be written
without any permission beyond read-only `contents` and without a secret.
Writing it, or failing to, SHALL NOT change whether the `test` check passes
or fails.

#### Scenario: Pull request with a change
- **WHEN** a pull request adds or edits files under `openspec/changes/add-x/`
- **THEN** the `test` check's job summary shows `add-x` with the diff of each requirement its deltas add, modify, remove or rename

#### Scenario: Pull request with no change
- **WHEN** a pull request touches nothing under `openspec/changes/`, or only `openspec/changes/archive/`
- **THEN** the step writes nothing to the job summary and the `test` check's result is decided by its other steps alone

#### Scenario: Change archived by the pull request
- **WHEN** a pull request moves `openspec/changes/add-x/` to `openspec/changes/archive/`
- **THEN** `add-x` is not summarised

#### Scenario: Summary fails
- **WHEN** OpenSpec cannot show a touched change
- **THEN** the `test` check still passes if its install, tests, ADR-0006 and ADR-0009 steps pass

#### Scenario: Pull request from a fork
- **WHEN** a pull request comes from a fork, with a read-only token
- **THEN** the summary is written, since it needs no write permission
