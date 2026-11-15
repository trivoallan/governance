# Spec Delta

## MODIFIED Requirements

### Requirement: Repository tools
A check that runs a tool other than commitlint SHALL look the tool up by its
kind.
- A **pinned tool** is a tool a trait names that sits outside the package
  manager: the value of `secrets.guard` (ADR-0015) and of `forge.audit`
  (ADR-0011), today `gitleaks` and `zizmor`. The check SHALL NOT look for a
  pinned tool in `node_modules/.bin`. When the repository's ADR-0025 is
  accepted, not superseded, and rules `tools.manager: mise`, the check SHALL
  run the binary that `mise which <tool>` prints, run from the repository's
  root, and SHALL NOT fall back to `PATH`; when mise is not installed or
  does not find the tool, the check SHALL exit non-zero, naming the tool,
  the trait that asks for it, and `mise install --locked`. Otherwise the
  check SHALL look for the tool on `PATH`.
- Any other tool (openspec, an npm package) SHALL be looked for in the
  repository's `node_modules/.bin` first, then on `PATH`.

When the tool is found nowhere, the check SHALL exit non-zero and standard
error SHALL name the tool and the trait that asks for it. The tool's own
report SHALL reach the check's output, and the check SHALL fail when the
tool exits non-zero.

#### Scenario: npm bin does not stand in for a pinned tool
- **WHEN** `secrets.guard` is `gitleaks`, no ADR-0025 is ruled, the repository has `node_modules/.bin/gitleaks`, and another `gitleaks` is on `PATH`
- **THEN** the check runs the `gitleaks` on `PATH`, never the one in `node_modules/.bin`

#### Scenario: Pinned tool resolved by mise
- **WHEN** ADR-0025 is accepted with `tools.manager: mise`, `secrets.guard` is `gitleaks`, `mise which gitleaks` prints a path, and another `gitleaks` is on `PATH`
- **THEN** the check runs the binary at the path mise printed

#### Scenario: Pinned tool missing from mise
- **WHEN** ADR-0025 is accepted with `tools.manager: mise`, `forge.audit` is `zizmor`, `mise which zizmor` fails, and `zizmor` is on `PATH`
- **THEN** the check exits non-zero, names `zizmor`, `forge.audit` and `mise install --locked`, and does not run the `zizmor` on `PATH`

#### Scenario: Manager not ruled
- **WHEN** ADR-0025 is `proposed`, or superseded, and `secrets.guard` is `gitleaks`
- **THEN** the check looks for `gitleaks` on `PATH`

#### Scenario: Tool installed in the repository
- **WHEN** `changes.framework` is `openspec` and the repository has `node_modules/.bin/openspec`
- **THEN** the check runs that binary

#### Scenario: Tool missing
- **WHEN** `secrets.guard` is `gitleaks`, no ADR-0025 is ruled, and no `gitleaks` is on `PATH`
- **THEN** the check exits non-zero and standard error says `gitleaks` is not installed

### Requirement: ADR-0009 check
`governance-check ADR-0009` SHALL check one branch name. The name SHALL be
the value of `--branch <name>` when given, else `GITHUB_HEAD_REF` when it is
set and not empty, else the repository's current branch. When there is no
name, or the name is the default branch (the branch `origin/HEAD` points to,
or `main` or `master` when `origin/HEAD` is not set), the check SHALL print
that there is nothing to check and exit `0`. When the name starts with the prefix of a tool the repository's ADRs
rule, the check SHALL print that it is a tool branch with nothing to check and exit `0`.
A tool is ruled when ADR-0012 `delivery.release_tool` or ADR-0018
`dependencies.updater` names it, in a copy read as an answer, and its prefix is `release-please--` for
`release-please`, `releaser-pleaser--` for `releaser-pleaser`, `dependabot/`
for `dependabot` and `renovate/` for `renovate`. An ADR that is missing,
not accepted, superseded, whose key is empty, or that names another tool, SHALL exempt nothing, and the
failure SHALL say why the branch is not exempt. Otherwise the
name SHALL be `<prefix>/<description>`, where `<prefix>` is one of
`branching.prefixes` and `<description>` is lower-case words of letters and
digits joined by single hyphens; the check SHALL exit `0` when it is, and
non-zero otherwise, naming the allowed prefixes and the form. When
`branching.prefixes` is absent, empty, or not a list, the check SHALL exit
non-zero and say it is not set. `branching.model` and `branching.merge`
SHALL NOT be checked.

#### Scenario: Conforming branch
- **WHEN** `branching.prefixes` is `[feat, fix, docs]` and the branch is `feat/schema-port`
- **THEN** the check exits `0`

#### Scenario: Prefix outside the list
- **WHEN** `branching.prefixes` is `[feat, fix, docs]` and the branch is `chore/bump`
- **THEN** the check exits non-zero and its output names `feat, fix, docs`

#### Scenario: Description not in kebab case
- **WHEN** the branch is `feat/Schema_Port`
- **THEN** the check exits non-zero

#### Scenario: Pull request in CI
- **WHEN** the checkout is detached and `GITHUB_HEAD_REF` is `fix/dead-link`
- **THEN** the check reads `fix/dead-link`

#### Scenario: Explicit branch
- **WHEN** the check runs with `--branch docs/readme`
- **THEN** it checks `docs/readme`, whatever the current branch

#### Scenario: Default branch
- **WHEN** `origin/HEAD` points to `origin/main` and the current branch is `main`
- **THEN** the check prints `ADR-0009: main is the default branch, nothing to check` and exits `0`

#### Scenario: Tool branch exempt when its tool is ruled
- **WHEN** ADR-0012 is accepted with `delivery.release_tool: release-please` and the branch is `release-please--branches--main`
- **THEN** the check prints that it is a tool branch with nothing to check and exits `0`

#### Scenario: Release tool branch
- **WHEN** ADR-0012 is accepted with `delivery.release_tool: release-please` and `GITHUB_HEAD_REF` is `release-please--branches--main--components--ontrack-governance`
- **THEN** the check prints that it is a tool branch with nothing to check and exits `0`

#### Scenario: Update tool branch
- **WHEN** ADR-0018 is accepted with `dependencies.updater: dependabot` and the branch is `dependabot/npm_and_yarn/zod-4.1.0`
- **THEN** the check exits `0`

#### Scenario: Tool branch refused without its ADR
- **WHEN** the repository has no ADR-0018 and the branch is `dependabot/npm_and_yarn/zod-4.1.0`
- **THEN** the check exits non-zero and says no ADR-0018 rules `dependencies.updater`

#### Scenario: Tool branch refused when another tool is ruled
- **WHEN** ADR-0018 is accepted with `dependencies.updater: renovate` and the branch is `dependabot/npm_and_yarn/zod-4.1.0`
- **THEN** the check exits non-zero and says `dependencies.updater` is not `dependabot`

#### Scenario: Tool branch refused when its ADR is superseded
- **WHEN** ADR-0018 says `dependencies.updater: dependabot`, an accepted local ADR supersedes it, and the branch is `dependabot/npm_and_yarn/zod-4.1.0`
- **THEN** the check exits non-zero and names the ADR that supersedes ADR-0018

#### Scenario: Tool prefix needs its separator
- **WHEN** `branching.prefixes` is `[feat]` and the branch is `dependabot-tweaks`
- **THEN** the check exits non-zero

#### Scenario: Prefixes not set
- **WHEN** `branching.prefixes` has no value
- **THEN** the check exits non-zero and standard error says `branching.prefixes` is not set

### Requirement: ADR-0022 check
`governance-check ADR-0022` SHALL read `review.merge_by` from ADR-0022 and
`agent.host` from the repository's copy of ADR-0017, read as an answer.
- When `review.merge_by` is absent or empty, it SHALL exit non-zero and say it is not set.
- When `review.merge_by` is `agent`, it SHALL print that there is nothing to check and exit `0`.
- When `review.merge_by` is `person` and ADR-0017 is missing, not accepted, or superseded, or `agent.host` is empty, `none` or a value other than `claude-code`, it SHALL print that there is nothing to check and give the reason. It SHALL exit `0`.
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
- **WHEN** `merge_by` is `person` and ADR-0017 is accepted with `agent.host: none`
- **THEN** the check prints `ADR-0022: review.merge_by is person, but ADR-0017 agent.host is none, nothing to check` and exits `0`

#### Scenario: Agent host not ruled yet
- **WHEN** `merge_by` is `person` and ADR-0017 is `proposed` with `agent.host: claude-code` already written
- **THEN** the check prints that ADR-0017 is not accepted, nothing to check, and exits `0`

#### Scenario: Agent merges
- **WHEN** `merge_by` is `agent`
- **THEN** the check prints `ADR-0022: review.merge_by is agent, nothing to check` and exits `0`

#### Scenario: Settings not committed
- **WHEN** `merge_by` is `person`, `host` is `claude-code`, and `.claude/settings.json` exists but is not tracked
- **THEN** the check exits non-zero and names `.claude/settings.json`

## ADDED Requirements

### Requirement: Another ADR read as an answer
When a check reads a trait from an ADR other than the one it checks, it
SHALL count that ADR's answer only when the copy's `status:` is `accepted`
and no `accepted` ADR in the repository supersedes it. An ADR supersedes
another as ontrack reads it: its `supersedes:` key names the other by its
`adr:` value or its file name, plainly in the same directory, or as
`<namespace>/<name>` or `local/<name>` from another directory. When the
answer does not count, the check's message SHALL say whether the ADR is
missing, not accepted, or superseded, and name the ADR that supersedes it.

#### Scenario: Proposed copy ignored
- **WHEN** ADR-0012 is `proposed` and already holds `delivery.release_tool: release-please`
- **THEN** a check reading ADR-0012 treats `delivery.release_tool` as not ruled and says ADR-0012 is not accepted

#### Scenario: Local ADR supersedes the package's
- **WHEN** `docs/adr/local/ADR-0003-secrets.md` is `accepted` with `supersedes: [trivoallan/ADR-0015-secrets]`
- **THEN** a check reading `trivoallan/ADR-0015` treats it as superseded and names `local/ADR-0003-secrets`

#### Scenario: Superseding ADR not accepted
- **WHEN** the only ADR naming `trivoallan/ADR-0015-secrets` in `supersedes:` is `proposed`
- **THEN** `trivoallan/ADR-0015` still counts as an answer

### Requirement: Namespace in references to another ADR
When a check's message names an ADR of this package other than the one it
checks, it SHALL name it `<namespace>/<number>`, the namespace being the
alias the package is installed under. When the namespace is not known (the
check runs outside `node_modules`), it SHALL name it `<number>`.

#### Scenario: Installed under an alias
- **WHEN** governance is installed as `node_modules/trivoallan` and the ADR-0009 check refuses a `dependabot/` branch because ADR-0018 is missing
- **THEN** its message names `trivoallan/ADR-0018`

### Requirement: ADR-0025 check
`governance-check ADR-0025` SHALL read `tools.manager` from ADR-0025. When it
is absent or empty, it SHALL exit non-zero and say it is not set. It SHALL
then go through each trait that names a pinned tool, `secrets.guard` in
ADR-0015 and `forge.audit` in ADR-0011, and print one line per trait:
- when the ADR is missing, not accepted, or superseded, that it names no
  tool here, with the reason;
- when the value is `none`, that it names no tool;
- otherwise the tool, which is the value, and the ADR and trait naming it.

With `tools.manager: mise`, for each tool, it SHALL run `mise which <tool>`
from the repository's root and print the path it finds. When mise does not
find it, the check SHALL fail for a tool whose value governance knows
(`gitleaks`, `zizmor`), naming `mise.toml`, `mise.lock` and
`mise install --locked`; for any other value it SHALL print a note that the
tool's binary may have another name and that its pin is left to review,
without failing. When mise is not installed, it SHALL exit non-zero.

With `script` or `aqua`, it SHALL list the tools and print that their pins
are not verified. With `none`, it SHALL exit non-zero when at least one tool
is listed, saying that `none` is an answer only when no accepted ADR names
such a tool, and exit `0` otherwise.

#### Scenario: Every tool pinned
- **WHEN** `tools.manager` is `mise`, ADR-0015 is accepted with `secrets.guard: gitleaks`, ADR-0011 is accepted with `forge.audit: zizmor`, and `mise which` finds both
- **THEN** the check prints both tools with their paths and exits `0`

#### Scenario: Known tool not pinned
- **WHEN** `tools.manager` is `mise`, `forge.audit` is `zizmor`, and `mise which zizmor` fails
- **THEN** the check exits non-zero and names `zizmor`, `trivoallan/ADR-0011 forge.audit` and `mise install --locked`

#### Scenario: Unforeseen tool not found
- **WHEN** `tools.manager` is `mise`, `secrets.guard` is `trufflehog`, and `mise which trufflehog` fails
- **THEN** the check prints a note about `trufflehog` and does not fail on it

#### Scenario: Superseded ADR
- **WHEN** an accepted local ADR supersedes `trivoallan/ADR-0015-secrets`
- **THEN** the check prints that `trivoallan/ADR-0015` is superseded by that ADR and does not look for its tool

#### Scenario: Script lists without verifying
- **WHEN** `tools.manager` is `script` and `secrets.guard` is `gitleaks`
- **THEN** the check lists `gitleaks`, says its pin is not verified, and exits `0`

#### Scenario: None while a tool is named
- **WHEN** `tools.manager` is `none` and ADR-0015 is accepted with `secrets.guard: gitleaks`
- **THEN** the check exits non-zero and says `none` is an answer only when no accepted ADR names such a tool

#### Scenario: Manager not set
- **WHEN** `tools.manager` has no value
- **THEN** the check exits non-zero and says `tools.manager` is not set

### Requirement: ADR-0001 check
`governance-check ADR-0001` SHALL read `record-architecture-decisions.format`
from ADR-0001. When it is absent or empty, it SHALL exit non-zero and say it
is not set. When it is a value other than `nygard`, it SHALL print that there
is nothing to check and exit `0`. With `nygard`, it SHALL select the
repository's copies of this package's ADRs (the files in the directory
that holds the repository's copy of ADR-0001, so another source's ADRs are
never checked against this schema) whose `status:` is not `proposed`, and run on
them the mdschema that governance's package depends on, with the
`adr/.mdschema.yml` that governance's package ships as its schema. mdschema
SHALL be resolved from governance's own package, never from the
repository's `node_modules/.bin` nor from `PATH`. mdschema's report SHALL
reach the check's output, and the check SHALL exit non-zero when mdschema
does. When no copy is selected, it SHALL print that no ADR is ruled yet and
exit `0`. The check SHALL NOT copy the schema into the repository.

#### Scenario: Ruled ADRs pass
- **WHEN** the repository's ADR-0001 and ADR-0006 are `accepted` with every trait filled and their how-to-rule blocks removed
- **THEN** the check exits `0`

#### Scenario: Half-ruled ADR refused
- **WHEN** ADR-0006 is `accepted` but `commits.tool` is empty
- **THEN** the check exits non-zero and its output names ADR-0006 and the empty key

#### Scenario: Proposed ADR skipped
- **WHEN** ADR-0009 is still `proposed`, as governance ships it
- **THEN** the check does not pass it to mdschema and does not fail on it

#### Scenario: Schema not copied
- **WHEN** the check has run in a repository with no `.mdschema.yml`
- **THEN** `git status --porcelain` prints the same as before

#### Scenario: Decoy binary ignored
- **WHEN** the repository has `node_modules/.bin/mdschema` that exits `0` and an ADR is half-ruled
- **THEN** the check still exits non-zero

### Requirement: Two runtime dependencies
governance's package SHALL declare exactly two runtime dependencies, each at
an exact version: the library its own ADR-0005 rules as
`validation.boundary`, and `@jackchuka/mdschema`, which the ADR-0001 check
runs. Everything else the checks use SHALL come from Node's standard library
or from the consuming repository (commitlint, gitleaks, zizmor, openspec, as
the other requirements say).

#### Scenario: Dependencies of the package
- **WHEN** governance's `package.json` is read after this change
- **THEN** `dependencies` holds exactly `zod` and `@jackchuka/mdschema`, both without a range

#### Scenario: Installs without install scripts
- **WHEN** governance is installed with `npm install --ignore-scripts`
- **THEN** `governance-check ADR-0001` runs mdschema

## REMOVED Requirements

### Requirement: One runtime dependency
**Reason**: The ADR-0001 check runs mdschema, which governance now depends on.
**Migration**: See "Two runtime dependencies".
