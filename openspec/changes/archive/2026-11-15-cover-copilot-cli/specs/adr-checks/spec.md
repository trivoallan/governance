# Spec Delta

## MODIFIED Requirements

### Requirement: ADR-0017 check
`ontrack-engineering-check ADR-0017` SHALL read `agent.hosts` from ADR-0017, a list
whose values are `claude-code`, `opencode` and `copilot`.
- When ADR-0017 holds the revision 1 key `agent.host`, whatever its value, the check SHALL exit non-zero. Its message SHALL say that `agent.host` became `agent.hosts`, a list, in revision 2, and SHALL show the list to write: `[<value>]` for `claude-code`, `[]` for `none` or an empty value.
- When `agent.hosts` is absent, the check SHALL exit non-zero and say it is not set.
- When `agent.hosts` is not a list, or holds a value other than `claude-code`, `opencode` or `copilot`, the check SHALL exit non-zero and name the value.
- When `agent.hosts` is `[]`, the check SHALL print `ADR-0017: agent.hosts is empty, nothing to check` and exit `0`.
- For `claude-code` and for `copilot`, a tracked `.claude/settings.json` SHALL be required.
- For `opencode`, a tracked `opencode.json` or `.opencode/opencode.json` SHALL be required.
- The check SHALL report every host in one run, and SHALL exit `0` only when every declared host's file is tracked.

The check SHALL NOT read the files it requires. A plugin entry without a pin
passes it, and review catches it.

#### Scenario: Both hosts wired
- **WHEN** ADR-0017 has `agent.hosts: [claude-code, opencode]` and the repository tracks `.claude/settings.json` and `opencode.json`
- **THEN** the check exits `0` and names both files

#### Scenario: One host's file missing
- **WHEN** ADR-0017 has `agent.hosts: [claude-code, opencode]` and the repository tracks `.claude/settings.json` only
- **THEN** the check exits non-zero, names `opencode.json` and `.opencode/opencode.json` for `opencode`, and names `.claude/settings.json` as found for `claude-code`

#### Scenario: Revision 1 key
- **WHEN** ADR-0017 has `agent.host: claude-code` and no `agent.hosts`
- **THEN** the check exits non-zero and standard error says `agent.host` became `agent.hosts` in revision 2, and to write `agent.hosts: [claude-code]`

#### Scenario: Revision 1 none
- **WHEN** ADR-0017 has `agent.host: none`
- **THEN** the check exits non-zero and its message says to write `agent.hosts: []`

#### Scenario: No host
- **WHEN** ADR-0017 has `agent.hosts: []`
- **THEN** the check prints that `agent.hosts` is empty, nothing to check, and exits `0`

#### Scenario: Unknown host
- **WHEN** ADR-0017 has `agent.hosts: [cursor]`
- **THEN** the check exits non-zero and says `agent.hosts` has an unknown value: `cursor`

#### Scenario: Untracked opencode config
- **WHEN** ADR-0017 has `agent.hosts: [opencode]` and `opencode.json` exists but is not tracked
- **THEN** the check exits non-zero

## MODIFIED Requirements

#### Scenario: Copilot wired
- **WHEN** ADR-0017 has `agent.hosts: [copilot]` and the repository tracks `.claude/settings.json`
- **THEN** the check exits `0` and names `.claude/settings.json` for `copilot`

### Requirement: ADR-0022 check
`governance-check ADR-0022` SHALL read `review.by` and `review.approvals`
from ADR-0022, and `agent.hosts` from the repository's copy of ADR-0017.
- When ADR-0022 still holds `review.merge_by`, it SHALL exit non-zero and say the key was replaced by `review.by`.
- When `review.by` or `review.approvals` is absent or empty, it SHALL exit non-zero and say which one is not set.
- When `review.approvals` is not a whole number of `0` or more, it SHALL exit non-zero and say so.
- With `maintainer` or `agent`, it SHALL exit non-zero unless `review.approvals` is `0`. With `peer`, it SHALL exit non-zero unless `review.approvals` is `1` or more. In both cases the message SHALL name both values.
- When `review.by` is `agent` and `review.approvals` is `0`, it SHALL print that there is nothing to check and exit `0`.

When `review.by` is `maintainer` or `peer`, it SHALL run two parts and
report both. It SHALL exit `0` only when neither fails.

**Deny part.** The commands to deny are `gh pr review`, and with
`maintainer` also `gh pr merge`.
- When ADR-0017 is missing, not accepted, or superseded, or `agent.hosts` is absent or `[]`, the deny part SHALL print that it has no deny to check and give the reason.
- When the accepted ADR-0017 still holds its revision 1 key `agent.host`, the deny part SHALL fail and say that `agent.host` became `agent.hosts` in ADR-0017 revision 2.
- Otherwise it SHALL check each host in `agent.hosts`, report each command on each host, and fail when one fails. A host value it does not know SHALL be reported as having no deny to check.

For `claude-code`, it SHALL read the tracked `.claude/settings.json`. That
file's `permissions.deny` array SHALL hold, for each command, an entry that
starts with `Bash(` followed by the command. It SHALL fail, naming the file,
when that file is not tracked, is not valid JSON, or lacks a required entry.
An entry under `permissions.allow` or `permissions.ask` SHALL NOT satisfy it,
and `.claude/settings.local.json` SHALL NOT be read.

For `copilot`, it SHALL read the tracked `.claude/settings.json`. That
file's `hooks.PreToolUse` array SHALL hold, for each command, an entry whose
`matcher` is absent, empty, `*`, or a pattern that matches `Bash`, and whose
`hooks` array holds an item with `type: "command"` and a `command` that
contains the command. It SHALL fail, naming the file, when that file is not
tracked, is not valid JSON, or lacks a required hook, and the failure SHALL
say that Copilot CLI ignores `permissions.deny`. A `permissions` entry SHALL
NOT satisfy it, `.claude/settings.local.json` SHALL NOT be read, and the
hook SHALL NOT be run.

For `opencode`, it SHALL read the tracked `opencode.json` and
`.opencode/opencode.json`, in that order, and join their `permissions`
arrays in that order:
- A rule SHALL apply when its `action`, read as a pattern, matches `shell`, and its `resource`, read as a pattern, matches the command. In a pattern, `*` matches any run of characters, `?` matches one character, and the pattern matches the whole value. A pattern ending in ` *` also matches the command without arguments.
- A command passes only when, for the command alone and for the command followed by ` 1`, the last rule that applies has `effect: deny`.
- No applicable rule, or a last applicable rule of `allow` or `ask`, SHALL fail. The failure SHALL name the rule that decides, or say that none applies.
- A tracked `opencode.jsonc` or `.opencode/opencode.jsonc` SHALL fail, and say that the check reads only `opencode.json`.
- A file holding the V1 key `permission` SHALL fail, and say to convert it to the V2 `permissions` array.
- A file that is not valid JSON or not a JSON object, or whose `permissions` is not an array, SHALL fail and name the file. When no opencode file is tracked, the failure SHALL name both paths.
- `policies` SHALL NOT be read.

**Ruleset part.**
- Outside GitHub Actions, it SHALL print `ADR-0022: ruleset not read outside CI` and SHALL NOT fail.
- In GitHub Actions, it SHALL read through `gh api` the rules active on the repository's default branch, as GitHub reports them. It SHALL fail, naming what is missing, unless the merged `pull_request` rules require:
  - a pull request, with exactly `review.approvals` required approvals;
  - with `peer`, also stale reviews dismissed on push and approval of the most recent push.
- It SHALL fail and say so when `gh` is missing or the rules cannot be read.
- It SHALL NOT read the bypass list, and SHALL say in its output that the bypass list is not verified.

#### Scenario: Merge denied
- **WHEN** `review.by` is `maintainer`, `hosts` is `[claude-code]`, the tracked `.claude/settings.json` has `"deny": ["Bash(gh pr merge:*)", "Bash(gh pr review:*)"]` under `permissions`, and the check runs outside CI
- **THEN** the check names both entries, prints `ADR-0022: ruleset not read outside CI`, and exits `0`

#### Scenario: Maintainer without the review deny
- **WHEN** `review.by` is `maintainer`, `hosts` is `[claude-code]`, and `permissions.deny` holds only `Bash(gh pr merge:*)`
- **THEN** the check exits non-zero and says `permissions.deny` has no `Bash(gh pr review` entry

#### Scenario: Peer needs no merge deny
- **WHEN** `review.by` is `peer`, `hosts` is `[claude-code]`, and `permissions.deny` holds only `Bash(gh pr review:*)`
- **THEN** the deny part passes

#### Scenario: Merge only asked
- **WHEN** `review.by` is `maintainer` and the `Bash(gh pr merge` entry sits under `permissions.ask` and not under `permissions.deny`
- **THEN** the check exits non-zero and says `permissions.deny` has no `Bash(gh pr merge` entry

#### Scenario: Review only asked
- **WHEN** the `Bash(gh pr review` entry sits under `permissions.ask` and not under `permissions.deny`
- **THEN** the check exits non-zero and says `permissions.deny` has no `Bash(gh pr review` entry

#### Scenario: No agent host
- **WHEN** `review.by` is `maintainer`, ADR-0017 rules `agent.hosts: []`, and the check runs outside CI
- **THEN** the check prints `ADR-0022: review.by is maintainer, but ADR-0017 agent.hosts is empty, no deny to check` and exits `0`

#### Scenario: Agent host not ruled yet
- **WHEN** `review.by` is `maintainer` and ADR-0017 is `proposed` with `agent.hosts: [claude-code]` already written
- **THEN** the deny part prints that ADR-0017 is not accepted, no deny to check

#### Scenario: Agent merges
- **WHEN** `review.by` is `agent` and `review.approvals` is `0`
- **THEN** the check prints `ADR-0022: review.by is agent, nothing to check` and exits `0`

#### Scenario: Leftover merge_by
- **WHEN** ADR-0022 holds `review.merge_by: person`
- **THEN** the check exits non-zero and says `review.merge_by` was replaced by `review.by`

#### Scenario: Settings not committed
- **WHEN** `review.by` is `maintainer`, `hosts` is `[claude-code]`, and `.claude/settings.json` exists but is not tracked
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

#### Scenario: Revision 1 key in ADR-0017
- **WHEN** `review.by` is `maintainer` and the accepted ADR-0017 has `agent.host: claude-code`
- **THEN** the check exits non-zero and says `agent.host` became `agent.hosts` in ADR-0017 revision 2

#### Scenario: opencode denies review and merge
- **WHEN** `review.by` is `maintainer`, `hosts` is `[opencode]`, and the tracked `opencode.json` has the rules `{ "action": "shell", "resource": "gh pr merge *", "effect": "deny" }` and the same for `gh pr review *`
- **THEN** the deny part passes and names both rules

#### Scenario: opencode peer needs only the review deny
- **WHEN** `review.by` is `peer`, `hosts` is `[opencode]`, and `opencode.json` denies only `gh pr review *`
- **THEN** the deny part passes

#### Scenario: A later allow defeats the deny
- **WHEN** the same `opencode.json` adds `{ "action": "*", "resource": "*", "effect": "allow" }` after the deny rules
- **THEN** the check exits non-zero and names the `allow` rule as the one that decides

#### Scenario: A deny for one flag only
- **WHEN** `review.by` is `peer` and `opencode.json` denies only `gh pr review * --approve`
- **THEN** the check exits non-zero and says no rule denies `gh pr review`

#### Scenario: .opencode config overrides the root
- **WHEN** `opencode.json` denies both commands and the tracked `.opencode/opencode.json` allows `gh *`
- **THEN** the check exits non-zero

#### Scenario: V1 permission object
- **WHEN** the tracked `opencode.json` has `"permission": { "bash": { "gh pr review *": "deny" } }`
- **THEN** the check exits non-zero and says to convert `permission` to the V2 `permissions` array

#### Scenario: One host of two fails
- **WHEN** `hosts` is `[claude-code, opencode]`, `.claude/settings.json` denies both commands, and the tracked `opencode.json` has no `permissions`
- **THEN** the check exits non-zero, reports the `claude-code` entries as passing, and names `opencode.json` as failing

#### Scenario: Copilot hooks block review and merge
- **WHEN** `review.by` is `maintainer`, `hosts` is `[copilot]`, and the tracked `.claude/settings.json` has, under `hooks.PreToolUse`, a `Bash` entry whose command hooks contain `gh pr review` and `gh pr merge`
- **THEN** the deny part passes and names the `Bash` matcher for both commands

#### Scenario: Copilot with deny entries only
- **WHEN** `review.by` is `maintainer`, `hosts` is `[copilot]`, and `.claude/settings.json` holds both commands under `permissions.deny` and no hook
- **THEN** the check exits non-zero, says `hooks.PreToolUse` has no `gh pr review` hook on Bash, and says Copilot CLI ignores `permissions.deny`

#### Scenario: Copilot peer needs only the review hook
- **WHEN** `review.by` is `peer`, `hosts` is `[copilot]`, and the only hook contains `gh pr review`
- **THEN** the deny part passes

#### Scenario: Copilot hook on another tool
- **WHEN** `hosts` is `[copilot]` and the only hooks containing the commands sit under a `matcher` of `Edit`
- **THEN** the check exits non-zero

#### Scenario: Claude Code and Copilot together
- **WHEN** `review.by` is `maintainer`, `hosts` is `[claude-code, copilot]`, and `.claude/settings.json` holds both deny entries and both hooks
- **THEN** the deny part passes and reports the deny entries for `claude-code` and the hooks for `copilot`
