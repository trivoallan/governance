## MODIFIED Requirements

### Requirement: ADR-0009 check
`governance-check ADR-0009` SHALL check one branch name. The name SHALL be
the value of `--branch <name>` when given, else `GITHUB_HEAD_REF` when it is
set and not empty, else the repository's current branch. When there is no
name, or the name is the default branch (the branch `origin/HEAD` points to,
or `main` or `master` when `origin/HEAD` is not set), the check SHALL print
that there is nothing to check and exit `0`. When the name starts with the prefix of a tool the repository's ADRs
rule, the check SHALL print that it is a tool branch with nothing to check and exit `0`.
A tool is ruled when ADR-0012 `delivery.release_tool` or ADR-0018
`dependencies.updater` names it, in a copy read as a ruling, and its prefix is `release-please--` for
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

### Requirement: Another ADR read as a ruling
When a check reads a trait from an ADR other than the one it checks, it
SHALL count that ADR's ruling only when the copy's `status:` is `accepted`
and no `accepted` ADR in the repository supersedes it. An ADR supersedes
another as ontrack reads it: its `supersedes:` key names the other by its
`adr:` value or its file name, plainly in the same directory, or as
`<namespace>/<name>` or `local/<name>` from another directory. When the
ruling does not count, the check's message SHALL say whether the ADR is
missing, not accepted, or superseded, and name the ADR that supersedes it.

#### Scenario: Proposed copy ignored
- **WHEN** ADR-0012 is `proposed` and already holds `delivery.release_tool: release-please`
- **THEN** a check reading ADR-0012 treats `delivery.release_tool` as not ruled and says ADR-0012 is not accepted

#### Scenario: Local ADR supersedes the package's
- **WHEN** `docs/adr/local/ADR-0003-secrets.md` is `accepted` with `supersedes: [trivoallan/ADR-0015-secrets]`
- **THEN** a check reading `trivoallan/ADR-0015` treats it as superseded and names `local/ADR-0003-secrets`

#### Scenario: Superseding ADR not accepted
- **WHEN** the only ADR naming `trivoallan/ADR-0015-secrets` in `supersedes:` is `proposed`
- **THEN** `trivoallan/ADR-0015` still counts as a ruling

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
find it, the check SHALL fail for a tool whose value ontrack-engineering knows
(`gitleaks`, `zizmor`), naming `mise.toml`, `mise.lock` and
`mise install --locked`; for any other value it SHALL print a note that the
tool's binary may have another name and that its pin is left to review,
without failing. When mise is not installed, it SHALL exit non-zero.

With `script` or `aqua`, it SHALL list the tools and print that their pins
are not verified. With `none`, it SHALL exit non-zero when at least one tool
is listed, saying that `none` is a valid value only when no accepted ADR names
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
- **THEN** the check exits non-zero and says `none` is a valid value only when no accepted ADR names such a tool

#### Scenario: Manager not set
- **WHEN** `tools.manager` has no value
- **THEN** the check exits non-zero and says `tools.manager` is not set

### Requirement: ADR-0011 check refuses forge.review
`governance-check ADR-0011` SHALL fail when the repository's ADR-0011 still
holds `forge.review`, with or without a value. Its message SHALL name
ADR-0022's `review.by` as the key's new place. It SHALL still report
`forge.gate` and `forge.audit` in the same run.

#### Scenario: Leftover key
- **WHEN** a ruled ADR-0011 holds `forge.review: author`
- **THEN** the check exits non-zero and prints `ADR-0011: forge.review moved to ADR-0022 review.by; rule on it there and remove it here`

#### Scenario: Key removed
- **WHEN** a ruled ADR-0011 holds no `forge.review`
- **THEN** the check's exit code follows `forge.gate` and `forge.audit` alone

## RENAMED Requirements

- FROM: `### Requirement: Another ADR read as an answer`
- TO: `### Requirement: Another ADR read as a ruling`
