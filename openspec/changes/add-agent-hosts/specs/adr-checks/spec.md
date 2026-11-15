# Spec Delta

## ADDED Requirements

### Requirement: ADR-0017 check
`ontrack-engineering-check ADR-0017` SHALL read `agent.hosts` from ADR-0017, a list
whose values are `claude-code` and `opencode`.
- When ADR-0017 holds the revision 1 key `agent.host`, whatever its value, the check SHALL exit non-zero. Its message SHALL say that `agent.host` became `agent.hosts`, a list, in revision 2, and SHALL show the list to write: `[<value>]` for `claude-code`, `[]` for `none` or an empty value.
- When `agent.hosts` is absent, the check SHALL exit non-zero and say it is not set.
- When `agent.hosts` is not a list, or holds a value other than `claude-code` or `opencode`, the check SHALL exit non-zero and name the value.
- When `agent.hosts` is `[]`, the check SHALL print `ADR-0017: agent.hosts is empty, nothing to check` and exit `0`.
- For `claude-code`, a tracked `.claude/settings.json` SHALL be required.
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

### Requirement: Wiring check is presence only
A wiring row SHALL only require that something be present. No row SHALL
require a file to be absent. When a trait's value has no row (`none`,
`manual`, a URL where a path is expected, or a value governance did not
foresee), the check SHALL print `<number>: <trait> is <value>, nothing to
check` for that trait and SHALL NOT fail on it. When a trait the table names
is absent or empty in the ADR, the check SHALL exit non-zero and say that the
trait is not set.

#### Scenario: Value none
- **WHEN** ADR-0018 has `dependencies.updater: none` and the repository tracks `.github/dependabot.yml`
- **THEN** the output says `ADR-0018: dependencies.updater is none, nothing to check` and that trait does not fail

#### Scenario: Unforeseen value
- **WHEN** ADR-0018 has `dependencies.updater: foo`
- **THEN** the output says `ADR-0018: dependencies.updater is foo, nothing to check` and that trait does not fail

#### Scenario: Trait not set
- **WHEN** ADR-0018 has `updater:` with no value
- **THEN** the check exits non-zero and standard error says `dependencies.updater` is not set

### Requirement: Wiring rows
governance SHALL ship these rows. Workflows are the tracked files matching
`.github/workflows/*.yml` or `.github/workflows/*.yaml`.

| ADR | Trait = value | Kind | What must be tracked |
| --- | --- | --- | --- |
| ADR-0008 | `docs.tool = starlight` | contains | a `package.json`, in any folder, holds `@astrojs/starlight` |
| ADR-0008 | `docs.tool = docusaurus` | exists | `docusaurus.config.js`, `.mjs` or `.ts`, in any folder |
| ADR-0008 | `docs.tool = mkdocs` | exists | `mkdocs.yml`, in any folder |
| ADR-0008 | `docs.root = <path>` | path | a file under that path |
| ADR-0010 | `architecture.document = arc42` | exists | for each of `01` to `12`, a file `docs/architecture/arc42/<NN>-*.md` or `docs/architecture/arc42/<NN>-*.mdx` |
| ADR-0010 | `architecture.model = likec4` | exists | a file ending in `.c4` or `.likec4` |
| ADR-0011 | `forge.gate = blocking` or `informative` | exists | a workflow |
| ADR-0012 | `delivery.release_tool = release-please` | contains | a workflow holds `googleapis/release-please-action` |
| ADR-0012 | `delivery.target = container` | exists | a file named `Dockerfile` or `Containerfile` |
| ADR-0012 | `deployment.manifests = <relative path>` | path | a file under that path |
| ADR-0018 | `dependencies.updater = dependabot` | exists | `.github/dependabot.yml` or `.github/dependabot.yaml` |
| ADR-0018 | `dependencies.updater = renovate` | exists | `renovate.json`, `renovate.json5`, `.renovaterc`, `.renovaterc.json`, `.github/renovate.json` or `.github/renovate.json5` |
| ADR-0018 | `dependencies.automerge = patch` or `minor`, when `dependencies.updater` is `dependabot` | contains | a workflow holds `dependabot/fetch-metadata` |
| ADR-0021 | `supply_chain.build_level = 1`, `2` or `3` | contains | a workflow holds `actions/attest-build-provenance`, `--provenance` or `pypa/gh-action-pypi-publish` |
| ADR-0024 | `code_scanning.tool = codeql` | contains | a workflow holds `github/codeql-action/analyze` |
| ADR-0024 | `code_scanning.tool = <any other value but none>` | contains all | one workflow holds the value, and `github/codeql-action/upload-sarif` or `actions/upload-artifact` (ADR-0024 rule 2: the SARIF goes to code scanning, or stays a job artifact where the plan does not allow the upload) |

The arc42 row looks under `docs/architecture/arc42/` whatever ADR-0008's
`docs.root` says: the architecture document does not move with the user
documentation. A
`deployment.manifests` value holding `://` is a URL and has no row. The
ADR-0011 line SHALL say that the ruleset requiring the pipeline is not
verified. With `dependencies.updater: renovate`, `dependencies.automerge` has
no row. A `contains all` row passes only when a single file holds, for each
of its lists, one of that list's strings. `code_scanning.fail_on` has no row: the threshold lives in the
ruleset and the workflow, which the check does not read.

#### Scenario: arc42 under another root
- **WHEN** ADR-0008 has `docs.root: site/` and ADR-0010 has `architecture.document: arc42`
- **THEN** the ADR-0010 check looks for the twelve files under `docs/architecture/arc42/`, not `site/architecture/arc42/`

#### Scenario: Gate states its ceiling
- **WHEN** ADR-0011 has `forge.gate: blocking` and the repository tracks `.github/workflows/ci.yml`
- **THEN** the check exits `0` and its line says the ruleset is not verified

#### Scenario: Manifests elsewhere
- **WHEN** ADR-0012 has `deployment.manifests: https://github.com/acme/deploy`
- **THEN** the output says `deployment.manifests` has nothing to check

#### Scenario: Provenance step present
- **WHEN** ADR-0021 has `supply_chain.build_level: 2` and a workflow runs `npm publish --provenance`
- **THEN** the check exits `0`

#### Scenario: Several traits in one ADR
- **WHEN** ADR-0012 has `delivery.release_tool: release-please` with no workflow holding it, and `delivery.target: none`
- **THEN** the check exits non-zero, and its output fails `delivery.release_tool` and says `delivery.target` has nothing to check

#### Scenario: arc42 sections in mdx
- **WHEN** ADR-0010 has `architecture.document: arc42` and the repository tracks the twelve sections under `docs/architecture/arc42/`, three of them as `.mdx`
- **THEN** the ADR-0010 check exits `0`

#### Scenario: Starlight site in a subfolder
- **WHEN** ADR-0008 has `docs.tool: starlight` and only `site/package.json` names `@astrojs/starlight`
- **THEN** the `docs.tool` row passes and names `site/package.json`

#### Scenario: CodeQL in advanced setup
- **WHEN** ADR-0024 has `code_scanning.tool: codeql` and a workflow uses `github/codeql-action/analyze@<sha>`
- **THEN** the check exits `0` and names that workflow

#### Scenario: CodeQL in default setup only
- **WHEN** ADR-0024 has `code_scanning.tool: codeql` and no workflow holds `github/codeql-action/analyze`
- **THEN** the check exits non-zero, even if default setup is on in the repository's settings

#### Scenario: Another tool uploads SARIF
- **WHEN** ADR-0024 has `code_scanning.tool: semgrep` and one workflow runs `semgrep ci --sarif` and `github/codeql-action/upload-sarif`
- **THEN** the check exits `0` and names that workflow

#### Scenario: Private repository keeps the SARIF
- **WHEN** ADR-0024 has `code_scanning.tool: semgrep` and one workflow runs `semgrep ci --sarif` and keeps the file with `actions/upload-artifact`
- **THEN** the check exits `0`

#### Scenario: Grype's upload does not count
- **WHEN** ADR-0024 has `code_scanning.tool: semgrep`, the only `upload-sarif` is in a workflow running Grype, and semgrep runs in another workflow
- **THEN** the check exits non-zero

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
