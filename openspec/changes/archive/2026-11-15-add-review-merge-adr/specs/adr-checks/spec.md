# Spec Delta

## ADDED Requirements

### Requirement: ADR-0022 check
`governance-check ADR-0022` SHALL read `review.merge_by` from ADR-0022 and
`agent.host` from the repository's copy of ADR-0017.
- When `review.merge_by` is absent or empty, it SHALL exit non-zero and say it is not set.
- When `review.merge_by` is `agent`, it SHALL print that there is nothing to check and exit `0`.
- When `review.merge_by` is `person` and ADR-0017 is missing, or `agent.host` is empty, `none` or a value other than `claude-code`, it SHALL print that there is nothing to check and give the reason. It SHALL exit `0`.
- When `review.merge_by` is `person` and `agent.host` is `claude-code`, it SHALL read the tracked `.claude/settings.json`. It SHALL exit `0` only when that file's `permissions.deny` array holds an entry that starts with `Bash(gh pr merge`.
- It SHALL exit non-zero, naming the file, when that file is not tracked, is not valid JSON, or has no such entry.

An entry under `permissions.allow` or `permissions.ask` SHALL NOT satisfy
the check. `.claude/settings.local.json` SHALL NOT be read.

#### Scenario: Merge denied
- **WHEN** `merge_by` is `person`, `host` is `claude-code`, and the tracked `.claude/settings.json` has `"deny": ["Bash(gh pr merge:*)"]` under `permissions`
- **THEN** the check exits `0` and names the entry

#### Scenario: Merge only asked
- **WHEN** the same entry sits under `permissions.ask` and not under `permissions.deny`
- **THEN** the check exits non-zero and says `permissions.deny` has no `Bash(gh pr merge` entry

#### Scenario: No agent host
- **WHEN** `merge_by` is `person` and ADR-0017 rules `agent.host: none`
- **THEN** the check prints `ADR-0022: review.merge_by is person, but ADR-0017 agent.host is none, nothing to check` and exits `0`

#### Scenario: Agent merges
- **WHEN** `merge_by` is `agent`
- **THEN** the check prints `ADR-0022: review.merge_by is agent, nothing to check` and exits `0`

#### Scenario: Settings not committed
- **WHEN** `merge_by` is `person`, `host` is `claude-code`, and `.claude/settings.json` exists but is not tracked
- **THEN** the check exits non-zero and names `.claude/settings.json`
