# Spec Delta

## ADDED Requirements

### Requirement: ADR-0011 audit check
`governance-check ADR-0011` SHALL evaluate `forge.gate` as its wiring row
does, then read `forge.audit`.
- When `forge.audit` is absent or empty, it SHALL exit non-zero and say it is not set.
- When it is `none` or another value, it SHALL print that there is nothing to check for `forge.audit`.
- When it is `zizmor` and no workflow is tracked, it SHALL print that there is no workflow to audit.
- Otherwise it SHALL run `zizmor --offline` on the tracked workflows without loading any configuration, so zizmor's defaults, which require hash pinning for every action, apply in place of any `zizmor.yml` the repository holds. It SHALL print the zizmor version it ran, and SHALL fail when zizmor reports a finding that no inline ignore comment covers.
- When zizmor is not installed, it SHALL exit non-zero and say so, naming the trait.

The check SHALL exit non-zero when either key fails, and SHALL report both.

#### Scenario: Clean workflows
- **WHEN** `forge.gate` is `blocking`, `forge.audit` is `zizmor`, and every tracked workflow pins its actions by SHA with job-level write permissions
- **THEN** the check exits `0` and prints the zizmor version

#### Scenario: Tag pin refused
- **WHEN** `forge.audit` is `zizmor` and a workflow uses `actions/checkout@v4`
- **THEN** the check exits non-zero and its output names `unpinned-uses`

#### Scenario: Repository config ignored
- **WHEN** the repository's `zizmor.yml` disables `unpinned-uses` and a workflow uses a tag
- **THEN** the check still exits non-zero

#### Scenario: Inline ignore honoured
- **WHEN** the only finding carries `# zizmor: ignore[template-injection]` on its line
- **THEN** the check exits `0`

#### Scenario: Audit none
- **WHEN** `forge.audit` is `none`
- **THEN** the output says `forge.audit` has nothing to check, and the exit code follows `forge.gate` alone

#### Scenario: zizmor missing
- **WHEN** `forge.audit` is `zizmor` and zizmor is not on the `PATH`
- **THEN** the check exits non-zero and says zizmor is not installed
