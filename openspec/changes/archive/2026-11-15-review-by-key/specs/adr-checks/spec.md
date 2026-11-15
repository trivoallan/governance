# Spec Delta

## ADDED Requirements

### Requirement: ADR-0011 check refuses forge.review
`governance-check ADR-0011` SHALL fail when the repository's ADR-0011 still
holds `forge.review`, with or without a value. Its message SHALL name
ADR-0022's `review.by` as the key's new place. It SHALL still report
`forge.gate` and `forge.audit` in the same run.

#### Scenario: Leftover key
- **WHEN** a ruled ADR-0011 holds `forge.review: author`
- **THEN** the check exits non-zero and prints `ADR-0011: forge.review moved to ADR-0022 review.by; answer it there and remove it here`

#### Scenario: Key removed
- **WHEN** a ruled ADR-0011 holds no `forge.review`
- **THEN** the check's exit code follows `forge.gate` and `forge.audit` alone

## MODIFIED Requirements

### Requirement: ADR-0022 check
`governance-check ADR-0022` SHALL read `review.by` and `review.approvals`
from ADR-0022, and `agent.host` from the repository's copy of ADR-0017.
- When ADR-0022 still holds `review.merge_by`, it SHALL exit non-zero and say the key was replaced by `review.by`.
- When `review.by` or `review.approvals` is absent or empty, it SHALL exit non-zero and say which one is not set.
- When `review.approvals` is not a whole number of `0` or more, it SHALL exit non-zero and say so.
- With `maintainer` or `agent`, it SHALL exit non-zero unless `review.approvals` is `0`. With `peer`, it SHALL exit non-zero unless `review.approvals` is `1` or more. In both cases the message SHALL name both values.
- When `review.by` is `agent` and `review.approvals` is `0`, it SHALL print that there is nothing to check and exit `0`.

When `review.by` is `maintainer` or `peer`, it SHALL run two parts and
report both. It SHALL exit `0` only when neither fails.

**Deny part.**
- When ADR-0017 is missing, not accepted, or superseded, or `agent.host` is empty, `none` or a value other than `claude-code`, the deny part SHALL print that it has nothing to check and give the reason.
- Otherwise it SHALL read the tracked `.claude/settings.json`. That file's `permissions.deny` array SHALL hold an entry that starts with `Bash(gh pr review`, and, with `maintainer`, an entry that starts with `Bash(gh pr merge`.
- It SHALL fail, naming the file, when that file is not tracked, is not valid JSON, or lacks a required entry.
- An entry under `permissions.allow` or `permissions.ask` SHALL NOT satisfy it, and `.claude/settings.local.json` SHALL NOT be read.

**Ruleset part.**
- Outside GitHub Actions, it SHALL print `ADR-0022: ruleset not read outside CI` and SHALL NOT fail.
- In GitHub Actions, it SHALL read through `gh api` the rules active on the repository's default branch, as GitHub reports them. It SHALL fail, naming what is missing, unless the merged `pull_request` rules require:
  - a pull request, with exactly `review.approvals` required approvals;
  - with `peer`, also stale reviews dismissed on push and approval of the most recent push.
- It SHALL fail and say so when `gh` is missing or the rules cannot be read.
- It SHALL NOT read the bypass list, and SHALL say in its output that the bypass list is not verified.

#### Scenario: Merge denied
- **WHEN** `review.by` is `maintainer`, `host` is `claude-code`, the tracked `.claude/settings.json` has `"deny": ["Bash(gh pr merge:*)", "Bash(gh pr review:*)"]` under `permissions`, and the check runs outside CI
- **THEN** the check names both entries, prints `ADR-0022: ruleset not read outside CI`, and exits `0`

#### Scenario: Maintainer without the review deny
- **WHEN** `review.by` is `maintainer`, `host` is `claude-code`, and `permissions.deny` holds only `Bash(gh pr merge:*)`
- **THEN** the check exits non-zero and says `permissions.deny` has no `Bash(gh pr review` entry

#### Scenario: Peer needs no merge deny
- **WHEN** `review.by` is `peer`, `host` is `claude-code`, and `permissions.deny` holds only `Bash(gh pr review:*)`
- **THEN** the deny part passes

#### Scenario: Merge only asked
- **WHEN** `review.by` is `maintainer` and the `Bash(gh pr merge` entry sits under `permissions.ask` and not under `permissions.deny`
- **THEN** the check exits non-zero and says `permissions.deny` has no `Bash(gh pr merge` entry

#### Scenario: Review only asked
- **WHEN** the `Bash(gh pr review` entry sits under `permissions.ask` and not under `permissions.deny`
- **THEN** the check exits non-zero and says `permissions.deny` has no `Bash(gh pr review` entry

#### Scenario: No agent host
- **WHEN** `review.by` is `maintainer`, ADR-0017 rules `agent.host: none`, and the check runs outside CI
- **THEN** the check prints `ADR-0022: review.by is maintainer, but ADR-0017 agent.host is none, no deny to check` and exits `0`

#### Scenario: Agent host not ruled yet
- **WHEN** `review.by` is `maintainer` and ADR-0017 is `proposed` with `agent.host: claude-code` already written
- **THEN** the deny part prints that ADR-0017 is not accepted, no deny to check

#### Scenario: Agent merges
- **WHEN** `review.by` is `agent` and `review.approvals` is `0`
- **THEN** the check prints `ADR-0022: review.by is agent, nothing to check` and exits `0`

#### Scenario: Leftover merge_by
- **WHEN** ADR-0022 holds `review.merge_by: person`
- **THEN** the check exits non-zero and says `review.merge_by` was replaced by `review.by`

#### Scenario: Settings not committed
- **WHEN** `review.by` is `maintainer`, `host` is `claude-code`, and `.claude/settings.json` exists but is not tracked
- **THEN** the check exits non-zero and names `.claude/settings.json`

#### Scenario: Peer ruleset complete in CI
- **WHEN** `review.by` is `peer`, `review.approvals` is `1`, the check runs in GitHub Actions, and the default branch's rules hold a `pull_request` rule requiring one approval, dismissing stale reviews and requiring approval of the last push
- **THEN** the ruleset part passes and the output says the bypass list is not verified

#### Scenario: Peer ruleset without last-push approval
- **WHEN** `review.by` is `peer`, the check runs in GitHub Actions, and the `pull_request` rule does not require approval of the most recent push
- **THEN** the check exits non-zero and names the missing setting

#### Scenario: No pull request rule in CI
- **WHEN** `review.by` is `maintainer`, the check runs in GitHub Actions, and the default branch has no active `pull_request` rule
- **THEN** the check exits non-zero and says no ruleset requires a pull request on the default branch

#### Scenario: Maintainer ruleset asks for an approval
- **WHEN** `review.by` is `maintainer`, the check runs in GitHub Actions, and the `pull_request` rule requires one approval
- **THEN** the check exits non-zero and says the maintainer cannot approve their own pull request

#### Scenario: Ruleset count differs from the ADR
- **WHEN** `review.by` is `peer`, `review.approvals` is `2`, the check runs in GitHub Actions, and the `pull_request` rule requires one approval
- **THEN** the check exits non-zero and says the ruleset requires 1 approval where `review.approvals` rules 2

#### Scenario: Peer with zero approvals
- **WHEN** `review.by` is `peer` and `review.approvals` is `0`
- **THEN** the check exits non-zero and says `peer` needs `review.approvals` of 1 or more

#### Scenario: Maintainer with approvals
- **WHEN** `review.by` is `maintainer` and `review.approvals` is `1`
- **THEN** the check exits non-zero and says `maintainer` needs `review.approvals: 0`

#### Scenario: Approvals not a number
- **WHEN** `review.approvals` is `two`
- **THEN** the check exits non-zero and says `review.approvals` is not a whole number

#### Scenario: Rules unreadable in CI
- **WHEN** the check runs in GitHub Actions and `gh api` fails
- **THEN** the check exits non-zero and shows `gh`'s error
