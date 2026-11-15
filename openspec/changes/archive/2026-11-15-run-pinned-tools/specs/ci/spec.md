# Spec Delta

## ADDED Requirements

### Requirement: Workflow audit job
The repository SHALL have a workflow that runs on every pull request and
reports one check named `zizmor`, the check the main ruleset requires. It
SHALL install zizmor with `jdx/mise-action`, pinned by commit SHA and given
mise's version, from `mise.toml` and `mise.lock` with the lockfile enforced,
so the binary that runs is the one whose checksum `mise.lock` holds. No
step SHALL carry a version of zizmor of its own, nor install it another way.
It SHALL run zizmor on `.github/workflows` with its online audits, loading
no configuration file, and SHALL fail on any finding no inline ignore
covers. The workflow SHALL declare read-only `contents` permission and use
no secret beyond the job's own token.

#### Scenario: Version moved in one place
- **WHEN** a pull request changes zizmor's version in `mise.toml` and runs `mise lock`
- **THEN** the `zizmor` check runs that version, with no other file changed

#### Scenario: Checksum mismatch
- **WHEN** `mise.lock` holds a checksum that the downloaded zizmor does not match
- **THEN** the `zizmor` check fails at the install step

#### Scenario: Finding fails the job
- **WHEN** a pull request adds a workflow step using an action by tag
- **THEN** the `zizmor` check fails and its log names `unpinned-uses`
